import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { makeServer, toolDefinitions, catalog, exposedName } from '../src/tools.js';
import { annotationsFor, profiles } from '../src/catalog.js';
import { businessTools, parseReference, type Invoke } from '../src/business-tools.js';
import { configFromEnv } from '../src/config.js';
import { classifyError, ToolError } from '../src/tool-errors.js';
import { z } from 'zod';
const config=configFromEnv({FEISHU_APP_ID:'test',FEISHU_APP_SECRET:'test'});
async function fixture(invoke:Invoke) {
 const server=makeServer(config,async()=>{throw new Error('unexpected token read');},'daily',invoke);
 const [a,b]=InMemoryTransport.createLinkedPair();await server.connect(a);const client=new Client({name:'test',version:'1'});await client.connect(b);
 return {client,close:async()=>{await client.close();await server.close();}};
}
async function run(name:string,args:any,invoke:Invoke) {const t=businessTools.find(t=>t.name===name)!;return t.run(args,invoke);}
test('daily metadata budget, complete catalog, annotations and legacy dispatch',async()=>{
 const definitions=toolDefinitions();assert.equal(definitions.length,13);assert.ok(Buffer.byteLength(JSON.stringify(definitions))<40000);
 for(const p of profiles){const tools=toolDefinitions(p);assert.equal(new Set(tools.map(t=>t.name)).size,tools.length);for(const t of tools){assert.match(t.name,/^[A-Za-z0-9_-]{1,64}$/);assert.ok(t.title);assert.ok(t.outputSchema);assert.ok((t as any).securitySchemes);assert.ok(t._meta?.securitySchemes);}}
 const all=toolDefinitions('all');for(const t of catalog)assert.ok(all.some(d=>d.name===exposedName(t.name)));
 assert.equal(definitions.find(t=>t.name==='feishu_create_records')!.annotations!.destructiveHint,false);
 assert.equal(definitions.find(t=>t.name==='feishu_update_records')!.annotations!.destructiveHint,true);
 assert.equal(annotationsFor(catalog.find(t=>t.name==='search.v2.message.create')!).readOnlyHint,true);
 const calls:string[]=[];const f=await fixture(async name=>{calls.push(name);return {ok:true};});try{
   const list=await f.client.listTools();assert.equal(list.tools.length,13);
   const forbidden=await f.client.callTool({name:'feishu_read_tool',arguments:{name:'bitable.v1.appTableRecord.batchCreate',arguments:{}}});assert.equal(forbidden.isError,true);assert.equal(calls.length,0);
   const old=await f.client.callTool({name:'feishu_docx_builtin_search',arguments:{data:{search_key:'test'}}});assert.equal(old.isError,undefined);assert.deepEqual(calls,['docx.builtin.search']);
   const schema=await f.client.callTool({name:'feishu_get_tool_schema',arguments:{name:'docx.v1.documentBlockChildren.create'}});assert.equal(schema.isError,undefined);assert.ok((schema.structuredContent as any).inputSchema);
 }finally{await f.close();}
});
test('search merges sources, canonical URLs, explicit continuation and partial failure',async()=>{
 let active=0,max=0;const calls:any[]=[];
 const invoke:Invoke=async(name,args:any)=>{calls.push([name,args]);active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,1));active--;
   if(name==='drive.v1.meta.batchQuery')return {metas:[{doc_token:'base1',url:'https://tenant.feishu.cn/base/base1'}]};
   if(name==='docx.builtin.search')return {docs_entities:[{docs_token:'base1',docs_type:'bitable',title:'Bills'}],has_more:true};
   return {items:[{obj_token:'base1',node_id:'wiki1',obj_type:8,title:'Bills',url:'https://tenant.feishu.cn/wiki/wiki1'}],has_more:true,page_token:'next'};
 };
 const result:any=await run('feishu_search_files',{query:'bill',limit:5},invoke);
 assert.equal(max,2);assert.equal(result.results.length,1);assert.equal(result.results[0].type,'bitable');assert.equal(result.partial,false);assert.equal(result.has_more,true);assert.match(result.results[0].url,/wiki/);
 await run('feishu_search_files',{query:'bill',limit:5,cursor:result.next_cursor},invoke);assert.equal(calls[3][1].data.offset,1);assert.equal(calls[4][1].params.page_token,'next');
 await assert.rejects(run('feishu_search_files',{query:'other',limit:5,cursor:result.next_cursor},invoke),/同一个/);
 const partial:any=await run('feishu_search_files',{query:'bill',limit:5},async name=>{if(name==='docx.builtin.search')throw new ToolError('missing_scope','scope');return {items:[],has_more:false};});
 assert.equal(partial.partial,true);assert.equal(partial.errors[0].error,'missing_scope');assert.equal(partial.results.length,0);
 await assert.rejects(run('feishu_search_files',{query:'bill',limit:5},async()=>{throw new ToolError('reauthorization_required','login');}),/login/);
});
test('reference resolution rejects external targets and Unicode document chunks are lossless',async()=>{
 assert.throws(()=>parseReference('https://attacker.example/docx/a','docx'));
 assert.throws(()=>parseReference('https://feishu.cn.attacker.example/docx/a','docx'));
 assert.throws(()=>parseReference('https://user@feishu.cn/docx/a','docx'));
 const calls:any[]=[];const invoke:Invoke=async(name,args)=>{calls.push([name,args]);return name==='wiki.v2.space.getNode'?{node:{obj_token:'doc1',obj_type:'docx'}}:{content:'A😀BC'};};
 const first:any=await run('feishu_read_document',{reference:'https://x.feishu.cn/wiki/w1',format:'markdown',offset:0,max_chars:2},invoke);
 assert.equal(first.content,'A😀');assert.equal(first.next_offset,2);assert.equal(calls[1][1].params.doc_token,'doc1');
 const rest:any=await run('feishu_read_document',{reference:'doc1',format:'markdown',offset:first.next_offset,max_chars:10},invoke);assert.equal(first.content+rest.content,'A😀BC');assert.equal(rest.truncated,false);
});
test('document conversion preserves root order and reports partial writes without duplicating creates',async()=>{
 const calls:any[]=[];const invoke:Invoke=async(name,args:any)=>{calls.push([name,args]);
  if(name==='docx.v1.document.convert')return {first_level_block_ids:['b','a'],blocks:[{block_id:'a',block_type:2,text:{elements:[]}},{block_id:'b',block_type:3,heading1:{elements:[]}}]};
  if(name==='docx.v1.document.create')return {document:{document_id:'created',title:'test'}};
  return {children:[]};
 };
 const result=await run('feishu_create_document',{title:'test',markdown:'# hello'},invoke);assert.equal(result.content_written,true);assert.deepEqual(calls[2][1].data.children_id,['b','a']);
 await assert.rejects(run('feishu_create_document',{title:'test',markdown:'body'},async(name,args)=>{if(name.endsWith('Descendant.create'))throw new ToolError('upstream_timeout','timeout');return invoke(name,args);}),e=>e instanceof ToolError && e.kind==='partial_write' && e.details.document_id==='created');
 let created=false;await assert.rejects(run('feishu_create_document',{title:'test',markdown:'image'},async name=>{if(name.endsWith('document.create'))created=true;return {first_level_block_ids:['a'],blocks:[{block_id:'a',block_type:27}]};}),/暂不支持/);assert.equal(created,false);
});
test('upstream descendant validation preserves converted block identity and child edges',()=>{
 const tool=catalog.find(t=>t.name==='docx.v1.documentBlockDescendant.create')!;
 const input={path:{document_id:'doc1',block_id:'doc1'},data:{children_id:['root'],index:-1,descendants:[
  {block_id:'root',block_type:12,children:['nested'],bullet:{elements:[{text_run:{content:'Root'}}]}},
  {block_id:'nested',block_type:2,text:{elements:[{text_run:{content:'Nested'}}]}}
 ]}};
 const parsed:any=z.object(tool.schema).parse(input);
 assert.deepEqual(parsed.data.children_id,['root']);
 assert.deepEqual(parsed.data.descendants.map((b:any)=>b.block_id),['root','nested']);
 assert.deepEqual(parsed.data.descendants[0].children,['nested']);
});
test('table schema preserves separate pagination and query forwards selected fields and filters',async()=>{
 const schema:any=await run('feishu_get_table_schema',{reference:'https://tenant.feishu.cn/base/base1?table=tbl1'},async name=>name.includes('Field')?{items:[{field_id:'f1',field_name:'amount',type:2,property:{}}],has_more:true,page_token:'fields-next'}:{items:[],has_more:false});
 assert.equal(schema.fields_page.next_cursor,'fields-next');assert.equal(schema.views_page.has_more,false);
 const args={reference:'base1',table_id:'tbl1',fields:['amount'],limit:20,cursor:'next',filter:{conjunction:'and',conditions:[{field_name:'amount',operator:'isGreater',value:['100']}]}};
 const result:any=await run('feishu_query_records',args,async(_name,input:any)=>{assert.deepEqual(input.data.field_names,['amount']);assert.deepEqual(input.data.filter,args.filter);assert.equal(input.params.page_token,'next');return {items:[{record_id:'r1',fields:{amount:200},created_by:{id:'private'}}],has_more:true,page_token:'last'};});
 assert.deepEqual(result.records,[{record_id:'r1',fields:{amount:200}}]);assert.equal(result.next_cursor,'last');
});
test('record writes are bounded, do not retry, and report per-record delete failures',async()=>{
 const token='example-token';let calls=0;
 const create:any=await run('feishu_create_records',{reference:'base1',table_id:'tbl1',records:[{fields:{amount:123}}],client_token:token},async(name,args:any)=>{calls++;assert.equal(name,'bitable.v1.appTableRecord.batchCreate');assert.equal(args.params.client_token,token);return {records:[{record_id:'r1',fields:{amount:123}}]};});assert.equal(calls,1);assert.equal(create.complete,true);
 const deleted:any=await run('feishu_delete_records',{reference:'base1',table_id:'tbl1',record_ids:['r1','r2']},async()=>({records:[{record_id:'r1',deleted:true},{record_id:'r2',deleted:false}]}));assert.equal(deleted.complete,false);
 const f=await fixture(async()=>{calls++;throw new ToolError('upstream_timeout','timeout');});try{const result=await f.client.callTool({name:'feishu_update_records',arguments:{reference:'base1',table_id:'tbl1',records:[{fields:{amount:1}}]}});assert.equal(result.isError,true);assert.equal(calls,1);}finally{await f.close();}
});
test('authentication failures trigger OAuth UI while scope, permission and timeout remain distinct',async()=>{
 const examples:[[unknown,string],...[unknown,string][]]=[[new Error('reauthorize'),'reauthorization_required'],[{response:{status:400,data:{code:99991679,msg:'Unauthorized',error:{permission_violations:[{subject:'docx:document.block:convert'}]}}}},'missing_scope'],[{response:{status:403,data:{msg:'Forbidden'}}},'resource_forbidden'],[{response:{status:429,headers:{'retry-after':'5'}}},'rate_limited'],[{code:'ECONNABORTED'},'upstream_timeout']];
 for(const [error,kind] of examples)assert.equal(classifyError(error).kind,kind);
 const f=await fixture(async()=>{throw new Error('reauthorize');});try{const r=await f.client.callTool({name:'feishu_read_document',arguments:{reference:'doc1'}});assert.equal(r.isError,true);assert.ok(r._meta?.['mcp/www_authenticate']);}finally{await f.close();}
});
