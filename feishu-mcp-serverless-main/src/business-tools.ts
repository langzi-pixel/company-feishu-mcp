import { z } from 'zod';
import { createHash } from 'node:crypto';
import { ToolError, classifyError } from './tool-errors.js';

export type Invoke = (name: string, args: unknown) => Promise<any>;
export interface BusinessTool {
  name: string; title: string; description: string; input: z.ZodRawShape; output: z.ZodRawShape;
  write?: boolean; destructive?: boolean;
  run: (args: any, call: Invoke) => Promise<Record<string, unknown>>;
}
const id = z.string().regex(/^[A-Za-z0-9_-]+$/).max(200);
const reference = z.string().min(1).max(2048).describe('飞书链接或搜索/上次调用返回的资源 token；不要猜测 ID。');
const pageToken = z.string().max(4096).optional().describe('上次返回的 next_cursor；首次省略。');
const limit = z.number().int().min(1).max(100).default(20);
const record = z.object({ record_id:z.string(), fields:z.record(z.unknown()) });
const pagination = { has_more:z.boolean(), next_cursor:z.string().nullable() };
const target = { reference, table_id:id.optional().describe('链接包含 table 参数时可省略，否则先调用 feishu_get_table_schema 取得。') };
const issue = (e: unknown) => { const error=classifyError(e); return {error:error.kind,message:error.message,...error.details}; };

export function parseReference(value: string, defaultType: 'docx'|'bitable') {
  if (/^[A-Za-z0-9_-]{1,200}$/.test(value)) return {token:value,type:defaultType as string};
  let url: URL; try { url=new URL(value); } catch { throw new ToolError('invalid_arguments','请提供飞书链接或资源 token。'); }
  if(url.protocol!=='https:' || !/(^|\.)(feishu\.cn|larksuite\.com)$/.test(url.hostname) || url.username || url.password)
    throw new ToolError('invalid_arguments','仅接受飞书/Lark HTTPS 资源链接。');
  const match=/^\/(docx|wiki|base|sheets|doc)\/([A-Za-z0-9_-]+)\/?$/.exec(url.pathname);
  if(!match)throw new ToolError('invalid_arguments','无法识别此资源链接，请提供 docx、wiki 或 base 链接。');
  const table=url.searchParams.get('table') || undefined;
  if(table && !id.safeParse(table).success)throw new ToolError('invalid_arguments','链接中的数据表 ID 无效。');
  return {token:match[2],type:match[1]==='base'?'bitable':match[1],table_id:table,url:url.toString()};
}
async function resolve(value: string, type: 'docx'|'bitable', call: Invoke) {
  const parsed=parseReference(value,type);
  if(parsed.type==='wiki') {
    const result=await call('wiki.v2.space.getNode',{params:{token:parsed.token}});
    if(!result.node?.obj_token)throw new ToolError('unexpected_response','飞书未返回知识库节点对应的资源。');
    parsed.token=result.node.obj_token; parsed.type=result.node.obj_type;
  }
  if(parsed.type!==type)throw new ToolError('wrong_resource_type',`此工具需要 ${type} 资源，当前链接类型为 ${parsed.type}。`);
  return parsed;
}
async function tablePath(args: any, call: Invoke) {
  const ref=await resolve(args.reference,'bitable',call);
  const table=args.table_id || ref.table_id;
  if(!table)throw new ToolError('table_required','先调用 feishu_get_table_schema 列出数据表，再指定 table_id。');
  return { app_token:ref.token,table_id:table };
}
const page = (data: any) => {
  if(data.has_more && !data.page_token)throw new ToolError('unexpected_response','飞书报告有下一页，却没有返回分页标记。');
  return { has_more:!!data.has_more, next_cursor:data.has_more ? data.page_token : null };
};

const searchCursor=z.object({query:z.string(),docs:z.number().int().min(0).max(199),docs_done:z.boolean(),wiki:z.string().max(4096).optional(),wiki_done:z.boolean()}).strict();
export const businessTools: BusinessTool[] = [
  { name:'feishu_search_files',title:'搜索飞书文件',
    description:'用于按关键词寻找飞书文档、多维表格、知识库文件。并行查询云文档和 Wiki、合并去重；每个来源最多 limit 条，返回标题/类型/链接，不读取正文。部分来源失败会明确提示；不要把它当成没有结果。',
    input:{query:z.string().trim().min(1).max(200),limit:z.number().int().min(1).max(20).default(5),cursor:pageToken},
    output:{results:z.array(z.object({id:z.string(),title:z.string(),type:z.string(),url:z.string().nullable(),source:z.enum(['docs','wiki']),reference:z.string()})),has_more:z.boolean(),next_cursor:z.string().nullable(),partial:z.boolean(),errors:z.array(z.record(z.unknown())),warnings:z.array(z.record(z.unknown())),search_limit_reached:z.boolean()},
    async run(args,call) {
      const digest=createHash('sha256').update(args.query).digest('hex');
      let state:z.infer<typeof searchCursor>={query:digest,docs:0,docs_done:false,wiki_done:false};
      if(args.cursor) { try { state=searchCursor.parse(JSON.parse(Buffer.from(args.cursor,'base64url').toString())); } catch { throw new ToolError('invalid_cursor','分页标记无效，请重新搜索。'); }
        if(state.query!==digest)throw new ToolError('invalid_cursor','分页时必须使用同一个搜索关键词。'); }
      const count=Math.min(args.limit,199-state.docs);
      const replies=await Promise.allSettled([
        state.docs_done || count===0 ? Promise.resolve(null) : call('docx.builtin.search',{data:{search_key:args.query,count,offset:state.docs}}),
        state.wiki_done ? Promise.resolve(null) : call('wiki.v1.node.search',{data:{query:args.query},params:{page_size:args.limit,page_token:state.wiki}})
      ]);
      const results:any[]=[],errors:any[]=[],warnings:any[]=[];let capped=false;
      const docs=replies[0],wiki=replies[1];
      if(docs.status==='fulfilled' && docs.value) {
        const data=docs.value;
        for(const d of data.docs_entities || [])results.push({id:d.docs_token,title:d.title||'',type:d.docs_type,url:null,source:'docs',reference:d.docs_token});
        state.docs+=(data.docs_entities || []).length;
        capped=!!data.has_more && state.docs>=199;
        state.docs_done=!data.has_more || capped;
        if(data.has_more && !(data.docs_entities || []).length)throw new ToolError('unexpected_response','云文档搜索没有取得分页进展。');
      } else if(docs.status==='rejected')errors.push({source:'docs',...issue(docs.reason)});
      if(wiki.status==='fulfilled' && wiki.value) {
        const data=wiki.value;
        for(const d of data.items || [])results.push({id:d.obj_token || d.node_id,title:d.title||'',type:typeof d.obj_type==='string'?d.obj_type:({1:'doc',2:'sheet',3:'mindnote',8:'bitable',11:'docx',12:'file',15:'slides'} as Record<number,string>)[d.obj_type] || 'wiki',url:d.url||null,source:'wiki',reference:d.url || d.node_id});
        const paging=page(data);state.wiki=paging.next_cursor||undefined;state.wiki_done=!paging.has_more;
      } else if(wiki.status==='rejected')errors.push({source:'wiki',...issue(wiki.reason)});
      if(errors.length===2 || (errors.length && !results.length && replies.every(r=>r.status==='rejected' || r.value===null)))
        throw replies.find(r=>r.status==='rejected')!.reason;
      // Retrieve canonical links from Feishu instead of inventing tenant URLs.
      const requests=results.filter(r=>r.source==='docs' && ['doc','docx','sheet','bitable','file','mindnote'].includes(r.type)).map(r=>({doc_token:r.id,doc_type:r.type}));
      if(requests.length)try {
        const meta=await call('drive.v1.meta.batchQuery',{data:{request_docs:requests,with_url:true}});
        for(const item of meta.metas || []) { const row=results.find(r=>r.id===item.doc_token);if(row && item.url) {row.url=item.url;row.reference=item.url;} }
      } catch(e) { warnings.push({source:'file_links',...issue(e)}); }
      const merged=new Map<string,any>();for(const row of results) {const previous=merged.get(row.id);merged.set(row.id,previous?{...previous,...(row.url?{url:row.url,reference:row.reference}:{})}:row);}
      const hasMore=!state.docs_done || !state.wiki_done;
      return {results:[...merged.values()],has_more:hasMore,next_cursor:hasMore?Buffer.from(JSON.stringify(state)).toString('base64url'):null,partial:errors.length>0,errors,warnings,search_limit_reached:capped};
    }
  },
  { name:'feishu_read_document',title:'读取飞书文档',description:'用于阅读 docx 文档或 Wiki 中的文档。默认读取官方 Markdown；支持 text 纯文本。按 offset/max_chars 分段，truncated 时用 next_offset 继续，不能将一段当作全文。表格记录请用 feishu_query_records。',
    input:{reference,format:z.enum(['markdown','text']).default('markdown'),offset:z.number().int().min(0).default(0),max_chars:z.number().int().min(100).max(30000).default(12000),expected_content_hash:z.string().regex(/^[a-f0-9]{64}$/).optional().describe('续读时传上一段的 content_hash，避免拼接不同版本。')},
    output:{document_id:z.string(),format:z.enum(['markdown','text']),content:z.string(),content_hash:z.string(),total_chars:z.number(),truncated:z.boolean(),next_offset:z.number().nullable()},
    async run(args,call) { const ref=await resolve(args.reference,'docx',call);
      const data=await call(args.format==='markdown'?'docs.v1.content.get':'docx.v1.document.rawContent',args.format==='markdown'?{params:{doc_token:ref.token,doc_type:'docx',content_type:'markdown'}}:{path:{document_id:ref.token}});
      if(typeof data.content!=='string')throw new ToolError('unexpected_response','飞书未返回文档正文。');
      const contentHash=createHash('sha256').update(data.content).digest('hex');
      if(args.expected_content_hash && args.expected_content_hash!==contentHash)throw new ToolError('content_changed','文档在分段读取期间改变，请从头读取或重新定位目标块。',{document_id:ref.token,content_hash:contentHash});
      // Unicode code points prevent splitting a surrogate pair across chunks.
      const chars=Array.from(data.content),end=Math.min(chars.length,args.offset+args.max_chars);
      return {document_id:ref.token,format:args.format,content:chars.slice(args.offset,end).join(''),content_hash:contentHash,total_chars:chars.length,truncated:end<chars.length,next_offset:end<chars.length?end:null}; }
  },
  { name:'feishu_create_document',title:'创建飞书文档',description:'用于创建新文档，可提供 Markdown 正文和目标文件夹 token。转换成功后才创建。返回文档 ID；若正文写入失败会保留已创建文档 ID，先检查该文档，勿重复创建。',write:true,
    input:{title:z.string().trim().min(1).max(200),markdown:z.string().max(100000).optional(),folder_token:id.optional()},
    output:{document_id:z.string(),title:z.string(),content_written:z.boolean(),block_count:z.number()},
    async run(args,call) {
      const converted=args.markdown?await convert(args.markdown,call):null;
      const created=await call('docx.v1.document.create',{data:{title:args.title,folder_token:args.folder_token}});
      const documentId=created.document?.document_id;
      if(!documentId)throw new ToolError('unexpected_response','创建请求返回异常，先检查飞书，勿重复创建。');
      if(converted)try { await insert(documentId,converted,call); } catch(e) { throw new ToolError('partial_write','文档已创建，但正文写入未确认；先读取该文档，不要重复创建。',{document_id:documentId,cause:issue(e)}); }
      return {document_id:documentId,title:created.document.title||args.title,content_written:!!converted,block_count:converted?.blocks.length||0};
    }
  },
  { name:'feishu_append_document',title:'追加飞书文档',description:'用于在指定文档末尾追加 Markdown，保留原文。支持 Wiki 链接。不会替换现有内容；超时后先读取确认，避免重复追加。',write:true,
    input:{reference,markdown:z.string().min(1).max(100000)},output:{document_id:z.string(),block_count:z.number()},
    async run(args,call) {const ref=await resolve(args.reference,'docx',call);const converted=await convert(args.markdown,call);await insert(ref.token,converted,call);return {document_id:ref.token,block_count:converted.blocks.length};}
  },
  {name:'feishu_get_table_schema',title:'查看多维表格结构',description:'用于从 base/Wiki 链接了解多维表格。未指定 table_id 时列出数据表；指定后并行读取字段和视图，返回字段类型、选项及各自分页标记。写入或筛选前先核对字段。',
    input:{...target,table_cursor:pageToken,field_cursor:pageToken,view_cursor:pageToken},
    output:{app_token:z.string(),table_id:z.string().optional(),tables:z.array(z.record(z.unknown())).optional(),fields:z.array(z.record(z.unknown())).optional(),views:z.array(z.record(z.unknown())).optional(),tables_page:z.object(pagination).optional(),fields_page:z.object(pagination).optional(),views_page:z.object(pagination).optional(),partial:z.boolean(),errors:z.array(z.record(z.unknown()))},
    async run(args,call) {const ref=await resolve(args.reference,'bitable',call);const table=args.table_id||ref.table_id;
      if(!table){const data=await call('bitable.v1.appTable.list',{path:{app_token:ref.token},params:{page_size:100,page_token:args.table_cursor}});return {app_token:ref.token,tables:(data.items||[]).map((t:any)=>({table_id:t.table_id,name:t.name})),tables_page:page(data),partial:false,errors:[]};}
      const path={app_token:ref.token,table_id:table};const replies=await Promise.allSettled([
        call('bitable.v1.appTableField.list',{path,params:{page_size:100,page_token:args.field_cursor}}),call('bitable.v1.appTableView.list',{path,params:{page_size:100,page_token:args.view_cursor}})]);
      const result:any={app_token:ref.token,table_id:table,partial:false,errors:[]};
      for(const [index,key] of ['fields','views'].entries()){const reply=replies[index];if(reply.status==='rejected'){result.partial=true;result.errors.push({source:key,...issue(reply.reason)});continue;}
        result[key]=(reply.value.items||[]).map((item:any)=>key==='fields'?{field_id:item.field_id,field_name:item.field_name,type:item.type,ui_type:item.ui_type,is_primary:item.is_primary,property:item.property}:{view_id:item.view_id,view_name:item.view_name,view_type:item.view_type});result[key+'_page']=page(reply.value);}
      if(result.errors.length===2)throw (replies[0] as PromiseRejectedResult).reason;
      return result;
    }
  },
  {name:'feishu_query_records',title:'查询多维表格记录',description:'用于按字段和条件查询记录。先读取表结构；仅返回一页，has_more 为 true 时继续分页再计算完整总额。日期筛选 value 按飞书格式，例如 ["ExactDate","毫秒时间戳"]；不支持 SQL。',
    input:{...target,fields:z.array(z.string()).max(100).optional().describe('只返回这些字段，省略则返回所有字段。'),view_id:id.optional(),filter:z.object({conjunction:z.enum(['and','or']),conditions:z.array(z.object({field_name:z.string(),operator:z.enum(['is','isNot','contains','doesNotContain','isEmpty','isNotEmpty','isGreater','isGreaterEqual','isLess','isLessEqual']),value:z.array(z.string()).optional()})).min(1).max(50)}).optional(),sort:z.array(z.object({field_name:z.string(),desc:z.boolean().default(false)})).max(20).optional(),limit,cursor:pageToken},
    output:{app_token:z.string(),table_id:z.string(),records:z.array(record),...pagination,total:z.number().optional()},
    async run(args,call) {const path=await tablePath(args,call);const data=await call('bitable.v1.appTableRecord.search',{path,data:{field_names:args.fields,view_id:args.view_id,filter:args.filter,sort:args.sort},params:{page_size:args.limit,page_token:args.cursor}});return {...path,records:(data.items||[]).map((r:any)=>({record_id:r.record_id,fields:r.fields})),...page(data),...(typeof data.total==='number'?{total:data.total}:{})};}
  },
  ...(['create','update','delete'] as const).map((action):BusinessTool => ({
    name:`feishu_${action}_records`,title:({create:'新增',update:'修改',delete:'删除'}[action])+'多维表格记录',write:true,destructive:action!=='create',
    description:({create:'用于批量新增记录。先核对字段；日期填写毫秒时间戳。可传 UUID client_token，重试同一批时必须复用。',update:'用于按已查询到的 record_id 批量修改指定字段，覆盖对应字段的旧值。日期填写毫秒时间戳。',delete:'用于删除明确指定的记录。record_ids 必须来自查询结果和用户指定范围。'}[action])+'单次最多 100 条，不自动重试。操作后读取核对；发生超时时先核对结果，勿盲目重发。',
    input:{...target,...(action==='delete'?{record_ids:z.array(id).min(1).max(100)}:{records:z.array(action==='update'?z.object({record_id:id,fields:z.record(z.unknown())}):z.object({fields:z.record(z.unknown())})).min(1).max(100)}),...(action==='create'?{client_token:z.string().uuid().optional()}: {})},
    output:{app_token:z.string(),table_id:z.string(),records:z.array(z.record(z.unknown())),requested_count:z.number(),returned_count:z.number(),complete:z.boolean()},
    async run(args,call) {const path=await tablePath(args,call);const sent=action==='delete'?args.record_ids:args.records;
      const data=await call('bitable.v1.appTableRecord.batch'+action[0].toUpperCase()+action.slice(1),{path,data:{records:sent},...(action==='create'?{params:{client_token:args.client_token}}:{})});
      const records=(data.records||[]).map((r:any)=>action==='delete'?{record_id:r.record_id,deleted:r.deleted}:{record_id:r.record_id,fields:r.fields});
      return {...path,records,requested_count:sent.length,returned_count:records.length,complete:records.length===sent.length && (action!=='delete'||records.every((r:any)=>r.deleted===true))}; }
  }))
];

async function convert(markdown:string,call:Invoke) {
  const data=await call('docx.v1.document.convert',{data:{content_type:'markdown',content:markdown}});
  if(!Array.isArray(data.blocks) || !data.blocks.length || !Array.isArray(data.first_level_block_ids))throw new ToolError('unsupported_content','飞书未能转换正文，请检查 Markdown。');
  if(data.blocks.length>1000)throw new ToolError('content_too_large','正文超过单次 1000 块上限，请按章节分段追加。');
  // Remote images and complex blocks need additional media/format handling.
  const supported=new Set([2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,19,22,31,32]);
  const unsupported=[...new Set(data.blocks.filter((b:any)=>!supported.has(b.block_type)).map((b:any)=>b.block_type))];
  if(unsupported.length)throw new ToolError('unsupported_content','正文包含暂不支持直接写入的块类型；请使用原生文档/素材工具处理这些块，不会静默丢弃。',{block_types:unsupported});
  return data as {blocks:any[];first_level_block_ids:string[]};
}
async function insert(documentId:string,data:{blocks:any[];first_level_block_ids:string[]},call:Invoke) {
  const descendants=data.blocks.map((block:any)=>{const b=structuredClone(block);delete b.parent_id;
    if(b.table?.property)delete b.table.property.merge_info;
    return b;});
  return call('docx.v1.documentBlockDescendant.create',{path:{document_id:documentId,block_id:documentId},data:{children_id:data.first_level_block_ids,descendants,index:-1}});
}
