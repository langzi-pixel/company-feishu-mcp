import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';
import { catalog, originalCatalog, byName, nativeSchema, searchCatalog, annotationsFor } from '../src/catalog.js';
import { cliContracts, inlineFile } from '../src/cli-contracts.js';
import { prepareContractRequest, invokeContract } from '../src/contract-transport.js';
import { configFromEnv } from '../src/config.js';
import { makeServer } from '../src/tools.js';
import { businessTools } from '../src/business-tools.js';

const config=configFromEnv({FEISHU_APP_ID:'test',FEISHU_APP_SECRET:'test'});
test('retain every original tool, include user contracts, and account for identity exceptions',()=>{
  assert.equal(originalCatalog.length,503);
  assert.equal(cliContracts.operations.length,243);
  assert.equal(new Set(catalog.map(t=>t.name)).size,catalog.length);
  for(const t of originalCatalog)assert.equal(byName.get(t.name),t);
  for(const op of cliContracts.operations) {
    const tool=byName.get(op.name)!; assert.ok(tool,op.name);
    assert.equal(annotationsFor(tool).readOnlyHint,op.name==='cli.attendance.user_tasks.query'||op.risk==='read');
    assert.doesNotThrow(()=>JSON.stringify(nativeSchema(tool)));
  }
  for(const op of cliContracts.excluded)assert.equal(byName.has(op.name),false);
  assert.equal(cliContracts.excluded.filter(op=>op.reason==='requires_application_identity').length,7);
  assert.ok(byName.has('im.v1.chat.create'));
});
test('search ranks primary reads, filters access, and exposes POST search as read',()=>{
  const calendar=searchCatalog('日程');assert.ok(calendar.length);assert.equal(annotationsFor(calendar[0]).readOnlyHint,true);
  for(const t of searchCatalog('',undefined,'read'))assert.equal(annotationsFor(t).readOnlyHint,true);
  assert.ok(searchCatalog('发送消息','im','write').some(t=>t.name==='im.v1.message.create'));
  assert.equal(annotationsFor(byName.get('search.v2.message.create')!).readOnlyHint,true);
  assert.equal(annotationsFor(byName.get('sheets.v2.tools.write')!).readOnlyHint,false);
});
test('contracts validate required fields and encode untrusted path IDs',()=>{
  const tool=byName.get('cli.slides.xml_presentations.get')!;
  assert.ok(tool);assert.equal(z.object(tool.schema).safeParse({}).success,false);
  const args=z.object(tool.schema).parse({path:{xml_presentation_id:'a/b?c'}});
  assert.equal(prepareContractRequest(tool,args).url,'/open-apis/slides_ai/v1/xml_presentations/a%2Fb%3Fc');
  assert.equal(z.object(tool.schema).safeParse({path:{xml_presentation_id:'a',typo:1}}).success,false);
  assert.throws(()=>prepareContractRequest(tool,{path:{xml_presentation_id:'..'}}),/路径/);
  const approval=byName.get('cli.approval.approvals.get')!;
  assert.match(JSON.stringify(nativeSchema(approval)),/zh-CN/);
  assert.equal(approval.schema.params.safeParse({locale:'not_a_locale'}).success,false);
  const moderation=byName.get('cli.im.chat.moderation.get')!;
  assert.equal(moderation.schema.params.safeParse({page_token:'a'.repeat(101)}).success,false);
  assert.match(JSON.stringify(nativeSchema(moderation)),/"maxLength":100/);
});
test('file uploads use multipart bytes, enforce limits and do not accept local paths',async()=>{
  assert.equal(inlineFile.safeParse('/etc/passwd').success,false);
  assert.equal(inlineFile.safeParse({filename:'../secret',base64:'YWJj'}).success,false);
  assert.equal(inlineFile.safeParse({filename:'a',base64:Buffer.alloc(1048577).toString('base64')}).success,false);
  const tool=byName.get('cli.im.images.create')!;
  const args=z.object(tool.schema).parse({data:{image_type:'message',image:{filename:'image.png',mime_type:'image/png',base64:'YWJj'}}});
  const req=prepareContractRequest(tool,args);assert.ok(req.data instanceof FormData);
  assert.equal(await (req.data.get('image') as Blob).text(),'abc');
  assert.equal(req.data.get('image_type'),'message');
});
test('sheet wire protocol separates read/write, encodes input and parses output',async()=>{
  const tool=byName.get('sheets.v2.tools.read')!;
  const args=z.object(tool.schema).parse({path:{spreadsheet_token:'sheet1'},data:{tool_name:'get_cell_ranges',input:{sheet_id:'s1',ranges:['A1:B3']}}});
  const req=prepareContractRequest(tool,args);
  assert.match(req.url,/invoke_read$/);assert.equal(JSON.parse(req.data.input).excel_id,'sheet1');
  assert.throws(()=>prepareContractRequest(tool,{...args,data:{...args.data,input:{excel_id:'other'}}}),/不一致/);
  let calls=0;
  const http={request:async(r:any)=>{calls++;assert.equal(r.headers.Authorization,'Bearer TEST_TOKEN');assert.equal(r.maxRedirects,0);return {data:{code:0,data:{output:'{"values":[["001",2]]}'}}};}} as any;
  const result=await invokeContract(config,'TEST_TOKEN',tool,args,http);assert.deepEqual(result.output.values,[['001',2]]);assert.equal(calls,1);
  await assert.rejects(invokeContract(config,'TEST_TOKEN',tool,args,{request:async()=>({data:{code:99991672,msg:'scope missing'}})} as any),/权限/);
});
test('document pagination rejects a changed source instead of combining revisions',async()=>{
  const tool=businessTools.find(t=>t.name==='feishu_read_document')!;
  const args={reference:'doc1',format:'markdown',offset:0,max_chars:100};
  const first=await tool.run(args,async()=>({content:'abc'}));
  await assert.rejects(tool.run({...args,offset:1,expected_content_hash:first.content_hash},async()=>({content:'def'})),/改变/);
  const next=await tool.run({...args,offset:1,expected_content_hash:first.content_hash},async()=>({content:'abc'}));assert.equal(next.content,'bc');
});
test('MCP imports five complete snapshots with verified digests and no filesystem URI access',async()=>{
  const server=makeServer(config,async()=>{throw new Error('No token access expected');});
  const [a,b]=InMemoryTransport.createLinkedPair();await server.connect(a);
  const client=new Client({name:'skills-import-test',version:'1'});await client.connect(b);
  try {
    assert.deepEqual(client.getServerCapabilities()?.extensions,{'io.modelcontextprotocol/skills':{}});
    const list=await client.request({method:'skills/list',params:{}},z.object({skills:z.array(z.any())}));
    assert.equal(list.skills.length,5);
    const names=new Set<string>();let total=0;
    for(const entry of list.skills) {
      assert.ok(!names.has(entry.frontmatter.name));names.add(entry.frontmatter.name);
      assert.ok(entry.resources.length<=100);let size=0;
      const got=await client.request({method:'skills/get',params:{uri:entry.uri}},z.object({skill:z.any()}));assert.deepEqual(got.skill,entry);
      for(const resource of entry.resources) {
        const read=await client.readResource({uri:resource.uri});assert.equal(read.contents.length,1);
        const c=read.contents[0];assert.equal(c.uri,resource.uri);
        const bytes='text' in c?Buffer.from(c.text as string):Buffer.from(c.blob as string,'base64');
        assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),resource.digest);
        size+=bytes.length;
        assert.ok(bytes.length<=(resource.uri.endsWith('/SKILL.md')?256*1024:1024*1024));
        if(resource.uri===entry.uri){assert.ok(bytes.toString().includes('name: '+entry.frontmatter.name));assert.ok(bytes.toString().includes(JSON.stringify(entry.frontmatter.description)));}
      }
      assert.ok(size<=5*1024*1024);total+=size;
    }
    assert.ok(total<8*1024*1024);
    await assert.rejects(client.readResource({uri:'file:///etc/passwd'}),/Unknown resource/);
    await assert.rejects(client.request({method:'skills/get',params:{uri:'skill://feishu-workspace/../secrets'}},z.any()),/Unknown skill/);
    await assert.rejects(client.request({method:'skills/list',params:{cursor:'bogus'}},z.any()),/cursor/);
    let cursor:string|undefined;const seen=new Set<string>();do {const page=await client.listResources(cursor?{cursor}:{});for(const r of page.resources)seen.add(r.uri);cursor=page.nextCursor;}while(cursor);
    assert.equal(seen.size,list.skills.reduce((n:number,s:any)=>n+s.resources.length,0));
  } finally {await client.close();await server.close();}
});
