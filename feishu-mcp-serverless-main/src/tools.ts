import { Client, withUserAccessToken } from '@larksuiteoapi/node-sdk';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolResult, type Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import type { Config } from './config.js';
import { catalog, byName, exposedName, nativeSchema, nativeTools, annotationsFor, searchCatalog, type ToolProfile } from './catalog.js';
import { businessTools, type Invoke } from './business-tools.js';
import { ToolError, classifyError, errorResult } from './tool-errors.js';
import { timed } from './telemetry.js';
import { invokeContract } from './contract-transport.js';
import { installSkills, skillCapabilities } from './skills.js';
export { catalog, exposedName } from './catalog.js';
export const VERSION='0.4.0';
const securitySchemes=[{type:'oauth2',scopes:['feishu']}];
const auth={securitySchemes,_meta:{securitySchemes}};
const discoverySchema={ query:z.string().max(200), project:z.string().max(80).optional(),access:z.enum(['all','read','write']).default('all'),offset:z.number().int().min(0).default(0),limit:z.number().int().min(1).max(20).default(5),include_schema:z.boolean().default(false).describe('仅在需要执行参数时设为 true；通常先看摘要，再用 feishu_get_tool_schema。') };
const dispatchSchema={name:z.string().max(180),arguments:z.record(z.unknown()).describe('严格按 feishu_get_tool_schema 返回的 inputSchema 填写。')};
const objectSchema=(shape:z.ZodRawShape)=>zodToJsonSchema(z.object(shape),{$refStrategy:'root'}) as Tool['inputSchema'];
const metaCache=new Map<ToolProfile,Tool[]>();
export function toolDefinitions(profile:ToolProfile='daily'):Tool[] {
  const cached=metaCache.get(profile);if(cached)return cached;
  const tools:Tool[]=businessTools.map(t=>({name:t.name,title:t.title,description:t.description,inputSchema:objectSchema(t.input),outputSchema:objectSchema(t.output),annotations:{readOnlyHint:!t.write,destructiveHint:!!t.destructive,idempotentHint:!t.write,openWorldHint:false},...auth}));
  tools.push(
    {name:'feishu_search_tools',title:'查找其他飞书操作',description:'用于寻找日常工具未覆盖的飞书能力，如日历、任务、消息、权限或复杂文档块。仅搜索操作说明，不搜索用户文件。默认返回摘要和工具名；用 feishu_get_tool_schema 读取选中工具的参数。',inputSchema:objectSchema(discoverySchema),outputSchema:objectSchema({total:z.number(),next_offset:z.number().nullable(),tools:z.array(z.object({name:z.string(),description:z.string(),project:z.string(),read_only:z.boolean(),inputSchema:z.record(z.unknown()).optional()}))}),annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},...auth},
    {name:'feishu_get_tool_schema',title:'读取飞书操作参数',description:'用于获取 feishu_search_tools 返回的一个操作的完整参数定义、读写标注及执行入口。不访问用户文件。',inputSchema:objectSchema({name:z.string().max(180)}),outputSchema:objectSchema({name:z.string(),description:z.string(),inputSchema:z.record(z.unknown()),read_only:z.boolean(),call_with:z.string()}),annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},...auth},
    {name:'feishu_read_tool',title:'执行其他飞书查询',description:'用于执行已通过 feishu_get_tool_schema 确认的只读操作。服务端拒绝写入操作。日常文件搜索、文档读取、表格查询优先使用专用工具。',inputSchema:objectSchema(dispatchSchema),outputSchema:objectSchema({result:z.unknown()}),annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:true},...auth},
    {name:'feishu_call_tool',title:'执行其他飞书操作',description:'完整能力兼容入口。先用 feishu_get_tool_schema 读取参数，再执行指定原生操作；可能创建、覆盖、删除资料、发送消息或修改权限，操作须符合用户请求。只读操作优先使用 feishu_read_tool。失败或超时后不要盲目重试写入。',inputSchema:objectSchema(dispatchSchema),outputSchema:objectSchema({result:z.unknown()}),annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:false,openWorldHint:true},...auth}
  );
  for(const t of nativeTools(profile))tools.push({name:exposedName(t.name),title:t.description.split('-').slice(-2).join(' · ').slice(0,100)||t.name,description:t.description||t.name,inputSchema:nativeSchema(t) as Tool['inputSchema'],outputSchema:objectSchema({result:z.unknown()}),annotations:annotationsFor(t),...auth});
  metaCache.set(profile,tools);return tools;
}
export function makeInvoker(config:Config,userToken:()=>Promise<string>):Invoke {
  // Scoped to one MCP request: concurrent subcalls share token resolution, never identities.
  let tokenPromise:Promise<string>|undefined;
  const http=axios.create({timeout:25000});
  http.interceptors.response.use(response=>{
    if(response.data?.code && response.data.code!==0)throw Object.assign(new Error('Feishu API error'),{response});
    return response.data;
  });
  const client=new Client({appId:config.appId,appSecret:config.appSecret,domain:config.feishuDomain,httpInstance:http as any,logger:{error(){},warn(){},info(){},debug(){},trace(){}}});
  return async(name,args)=> {
    const tool=byName.get(name);if(!tool)throw new ToolError('unknown_tool','先使用 feishu_search_tools 查找有效的操作名称。');
    const parsed=z.object(tool.schema).safeParse(args);
    if(!parsed.success)throw new ToolError('invalid_arguments','参数不符合飞书操作定义。',{issues:parsed.error.issues.map(i=>({path:i.path,message:i.message}))});
    tokenPromise ||= timed('authorization_session','user_token',userToken);
    const token=await tokenPromise;
    return timed('feishu_api',tool.name,async()=> {
      if(tool.name.startsWith('cli.') || tool.name.startsWith('sheets.v2.tools.')) return invokeContract(config,token,tool,parsed.data);
      if(tool.name==='docx.builtin.search') {
        const response=await client.request({method:'POST',url:'/open-apis/suite/docs-api/search/object',data:(parsed.data as any).data},withUserAccessToken(token)) as any;
        return response.data ?? response;
      }
      if(tool.customHandler) {
        const result=await tool.customHandler(client,{...parsed.data,useUAT:true},{userAccessToken:token,tool});
        const text=result.content?.find(c=>c.type==='text') as {text?:string}|undefined;
        let data:unknown;try{data=JSON.parse(text?.text||'{}');}catch{throw new ToolError('unexpected_response','飞书操作返回了无法解析的内容。');}
        if(result.isError)throw classifyError(data);
        return data;
      }
      const params=parsed.data as any;
      const url=tool.path?.replace(/:([a-zA-Z0-9_]+)/g,(_,key)=>{
        if(typeof params.path?.[key]!=='string' || !params.path[key])throw new ToolError('invalid_arguments','缺少路径参数 '+key);
        return encodeURIComponent(params.path[key]);
      });
      if(!url?.startsWith('/open-apis/'))throw new ToolError('unsupported_operation','此操作没有可用的飞书 API 路径。');
      const response=await client.request({method:tool.httpMethod,url,data:params.data,params:params.params},withUserAccessToken(token)) as any;
      return response.data ?? response;
    });
  };
}
export function makeServer(config:Config,userToken:()=>Promise<string>,profile:ToolProfile='daily',override?:Invoke,authChallenge?:string) {
  const server=new Server({name:'Feishu MCP',version:VERSION},{capabilities:{tools:{},...skillCapabilities},instructions:'操作当前授权用户的飞书资料。找文件优先 feishu_search_files；读正文用 feishu_read_document；多维表格先 get_table_schema 再 query/create/update/delete_records。其他能力通过 feishu_search_tools → feishu_get_tool_schema → feishu_read_tool/feishu_call_tool 使用，完整用户工具仍可访问。分页或正文截断时继续读取；部分失败不等于没有数据。写入后读取核对，超时先查结果，避免重复写入。只在用户请求范围内修改、发送或删除。'});
  installSkills(server);
  const invoke=override||makeInvoker(config,userToken);
  const challenge=authChallenge || `Bearer resource_metadata="${config.origin}/.well-known/oauth-protected-resource${config.basePath}/mcp", scope="feishu"`;
  const definitions=toolDefinitions(profile);
  const structured=(value:Record<string,unknown>):CallToolResult=>({structuredContent:value,content:[{type:'text',text:JSON.stringify(value)}]});
  server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:definitions}));
  server.setRequestHandler(CallToolRequestSchema,async request=> {
    try {
      return await timed('mcp_tool',(definitions.some(t=>t.name===request.params.name)||byName.has(request.params.name))?request.params.name:'unknown',async()=>{
        const name=request.params.name,args=request.params.arguments||{};
        const business=businessTools.find(t=>t.name===name);
        if(business){const input=z.object(business.input).strict().parse(args);const result=await business.run(input,invoke);const output=z.object(business.output).safeParse(result);if(!output.success)throw new ToolError('unexpected_response','飞书返回结构不符合预期；写入后先读取核对，勿重复执行。');return structured(output.data);}
        if(name==='feishu_search_tools') {
          const {query,project,access,offset,limit,include_schema}=z.object(discoverySchema).parse(args);
          const found=searchCatalog(query,project,access);
          return structured({total:found.length,next_offset:offset+limit<found.length?offset+limit:null,tools:found.slice(offset,offset+limit).map(t=>({name:t.name,description:t.description,project:t.project,read_only:annotationsFor(t).readOnlyHint,...(include_schema?{inputSchema:nativeSchema(t)}:{})}))});
        }
        if(name==='feishu_get_tool_schema') {
          const {name:requested}=z.object({name:z.string().max(180)}).parse(args);const t=byName.get(requested);
          if(!t)throw new ToolError('unknown_tool','先使用 feishu_search_tools 查找操作。');
          const read=annotationsFor(t).readOnlyHint;
          return structured({name:t.name,description:t.description,inputSchema:nativeSchema(t),read_only:read,call_with:read?'feishu_read_tool':'feishu_call_tool'});
        }
        if(name==='feishu_call_tool'||name==='feishu_read_tool') {
          const params=z.object(dispatchSchema).parse(args);const t=byName.get(params.name);
          if(!t)throw new ToolError('unknown_tool','先使用 feishu_search_tools 查找操作。');
          if(name==='feishu_read_tool'&&!annotationsFor(t).readOnlyHint)throw new ToolError('write_not_allowed','这是写入操作，请使用专用写入工具或 feishu_call_tool。');
          const value=await invoke(t.name,params.arguments);return {structuredContent:{result:value},content:[{type:'text',text:JSON.stringify(value)}]};
        }
        // Honor previous ChatGPT snapshots even when the daily list is selected.
        const legacy=byName.get(name);
        if(!legacy || exposedName(legacy.name)!==name)throw new ToolError('unknown_tool','工具不存在，请刷新连接的工具列表。');
        const value=await invoke(legacy.name,args);return {structuredContent:{result:value},content:[{type:'text',text:JSON.stringify(value)}]};
      });
    } catch(e) {
      if(e instanceof z.ZodError)return errorResult(new ToolError('invalid_arguments','参数或返回结构不符合工具定义。',{issues:e.issues.map(i=>({path:i.path,message:i.message}))}),challenge);
      return errorResult(e,challenge);
    }
  });
  return server;
}
