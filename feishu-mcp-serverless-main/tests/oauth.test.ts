import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/app.js';
import {configFromEnv} from '../src/config.js';
import {MemoryStore,hash,now} from '../src/store.js';
import {Feishu} from '../src/feishu.js';
import {catalog, exposedName, toolDefinitions} from '../src/tools.js';
import {challenge} from '../src/oauth.js';
const callback='https://chatgpt.com/connector_platform_oauth_redirect';
async function fixture(){
 const config=configFromEnv({PUBLIC_ORIGIN:'http://localhost:8080',FEISHU_APP_ID:'test-app',FEISHU_APP_SECRET:'test-secret'});
 const store=new MemoryStore();let exchanges=0;
 const fakeFetch:typeof fetch=async(url)=>{
  if(String(url).endsWith('user_info'))return new Response(JSON.stringify({code:0,data:{open_id:'user-1'}}));
  exchanges++;return new Response(JSON.stringify({access_token:'upstream-'+exchanges,refresh_token:'refresh-'+exchanges,expires_in:7200}));
 };
 const feishu=new Feishu(config,store,fakeFetch),app=createApp(config,store,feishu),server=app.listen(0,'127.0.0.1');
 await new Promise<void>(resolve=>server.once('listening',resolve));
 const origin='http://127.0.0.1:'+(server.address() as {port:number}).port;
 const request=(path:string,options:RequestInit={})=>fetch(origin+path,{redirect:'manual',...options});
 const post=(path:string,data:unknown,headers:Record<string,string>={})=>request(path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
 const client=await (await post('/feishu/register',{client_name:'ChatGPT',redirect_uris:[callback],token_endpoint_auth_method:'none'})).json() as {client_id:string};
 async function authorize(resource=config.resource){
  const verifier='a'.repeat(64),q=new URLSearchParams({client_id:client.client_id,redirect_uri:callback,response_type:'code',resource,scope:'feishu',state:'client-state',code_challenge:challenge(verifier),code_challenge_method:'S256'});
  const consent=await request('/feishu/authorize?'+q);assert.equal(consent.status,200);
  assert.equal(consent.headers.get('referrer-policy'),'strict-origin');
  assert.ok(consent.headers.get('content-security-policy')!.includes("form-action 'self' "+config.feishuDomain));
  assert.ok(consent.headers.get('content-security-policy')!.includes('https://accounts.feishu.cn'));
  assert.ok(consent.headers.get('content-security-policy')!.includes('https://passport.feishu.cn'));
  const html=await consent.text(),cookie=consent.headers.get('set-cookie')!.split(';')[0];
  const transaction=/name="transaction" value="([^"]+)"/.exec(html)![1],csrf=/name="csrf" value="([^"]+)"/.exec(html)![1];
  return {verifier,cookie,transaction,csrf};
 }
 async function code(resource=config.resource){
  const tx=await authorize(resource);const consent=await post('/feishu/consent',{transaction:tx.transaction,csrf:tx.csrf},{Cookie:tx.cookie});assert.equal(consent.status,302);
  const callbackRes=await request('/feishu/callback?'+new URLSearchParams({state:tx.transaction,code:'feishu-code'}),{headers:{Cookie:tx.cookie}});
  assert.equal(callbackRes.status,302);const target=new URL(callbackRes.headers.get('location')!);assert.equal(target.searchParams.get('iss'),config.issuer);assert.equal(target.searchParams.get('state'),'client-state');
  return {...tx,code:target.searchParams.get('code')!};
 }
 return {config,store,feishu,request,post,client,authorize,code,close:()=>new Promise<void>(resolve=>server.close(()=>resolve()))};
}
test('OAuth metadata, consent, PKCE, audience, one-time code, refresh and revoke',async()=>{
 const f=await fixture();try{
  const unauth=await f.post('/feishu/mcp',{});assert.equal(unauth.status,401);assert.match(unauth.headers.get('www-authenticate')!,/oauth-protected-resource\/feishu\/mcp/);
  const metadata=await (await f.request('/.well-known/oauth-authorization-server/feishu')).json() as any;assert.deepEqual(metadata.code_challenge_methods_supported,['S256']);assert.equal(metadata.issuer,f.config.issuer);
  assert.equal((await f.post('/feishu/register',{redirect_uris:['https://attacker.example/callback']})).status,400);
  const tx=await f.authorize();
  const another=await f.authorize();assert.notEqual(tx.cookie.split('=')[0],another.cookie.split('=')[0]);
  const browserError=await f.request('/feishu/callback?state=missing&code=x',{headers:{Accept:'text/html'}});assert.equal(browserError.status,400);assert.match(await browserError.text(),/连接尚未完成/);
  assert.equal((await f.post('/feishu/consent',{transaction:tx.transaction,csrf:tx.csrf})).status,400);
  assert.equal((await f.request('/feishu/callback?state='+tx.transaction+'&code=x',{headers:{Cookie:tx.cookie}})).status,400);
  const issued=await f.code();
  const body={grant_type:'authorization_code',client_id:f.client.client_id,redirect_uri:callback,resource:f.config.resource,code:issued.code,code_verifier:issued.verifier};
  assert.equal((await f.post('/feishu/token',{...body,code_verifier:'z'.repeat(64)})).status,400);
  assert.equal((await f.post('/feishu/token',{...body,resource:'https://mcp.example/other/mcp'})).status,400);
  const results=await Promise.all([f.post('/feishu/token',body),f.post('/feishu/token',body)]);assert.deepEqual(results.map(x=>x.status).sort(),[200,400]);
  const token=await results.find(r=>r.status===200)!.json() as any;assert.ok(token.access_token);assert.notEqual(token.access_token,'upstream-1');
  const headers={Authorization:'Bearer '+token.access_token,Accept:'application/json, text/event-stream'};
  const init=await f.post('/feishu/mcp',{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'test',version:'1'}}},headers);assert.equal(init.status,200);
  const listed=await f.post('/feishu/mcp',{jsonrpc:'2.0',id:2,method:'tools/list',params:{}},headers);assert.equal(listed.status,200);const listing=await listed.json() as any;assert.equal(listing.result.tools.length,toolDefinitions().length);
  const tools=listing.result.tools;assert.equal(new Set(tools.map((t:any)=>t.name)).size,tools.length);
  const fullResponse=await f.post('/feishu/mcp/all',{jsonrpc:'2.0',id:10,method:'tools/list',params:{}},headers);assert.equal(fullResponse.status,401);
  const all=toolDefinitions('all');for(const tool of catalog) assert.ok(all.some((t:any)=>t.name===exposedName(tool.name)));
  assert.ok(tools.every((t:any)=>/^[A-Za-z0-9_-]{1,64}$/.test(t.name)));
  for(const name of ['feishu_search_files','feishu_read_document']) assert.equal(tools.find((t:any)=>t.name===name).annotations.readOnlyHint,true);
  assert.equal(tools.find((t:any)=>t.name==='feishu_update_records').annotations.destructiveHint,true);
  const search=await f.post('/feishu/mcp',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'feishu_search_tools',arguments:{query:'bitable',limit:2}}},headers);assert.equal(search.status,200);const result=await search.json() as any;assert.ok(JSON.parse(result.result.content[0].text).total>10);
  const refreshBody={grant_type:'refresh_token',client_id:f.client.client_id,refresh_token:token.refresh_token,resource:f.config.resource};
  const rotated=await f.post('/feishu/token',refreshBody);assert.equal(rotated.status,200);assert.equal((await f.post('/feishu/token',refreshBody)).status,400);
  const next=await rotated.json() as any;await f.post('/feishu/revoke',{client_id:f.client.client_id,token:next.refresh_token});
  assert.equal((await f.post('/feishu/mcp',{},headers)).status,401);
  assert.equal((await f.post('/feishu/token',{...refreshBody,refresh_token:next.refresh_token})).status,400);
 }finally{await f.close();}
});
test('credentials refresh once during concurrent requests',async()=>{
 const f=await fixture();try{
  await f.store.put('sessions/session',{userId:'user',tokens:{access_token:'old',refresh_token:'old-refresh',expires_in:1},expiresAt:now()-1},1000);
  const values=await Promise.all(Array.from({length:5},()=>f.feishu.userToken('session')));assert.equal(new Set(values).size,1);assert.equal(values[0],'upstream-1');
 }finally{await f.close();}
});
test('expired records and concurrent single-use claims',async()=>{
 const store=new MemoryStore();await store.put('expired',true,-1);assert.equal(await store.get('expired'),undefined);
 const claims=await Promise.all(Array.from({length:50},()=>store.claim(hash('one-time-code'),100)));assert.equal(claims.filter(Boolean).length,1);
});

test('profile OAuth resource metadata, audience and refresh remain bound to the selected endpoint',async()=>{
 const f=await fixture();try{
  const resource=f.config.resource+'/bitable';
  const response=await f.post('/feishu/mcp/bitable',{});assert.equal(response.status,401);
  assert.match(response.headers.get('www-authenticate')!,/feishu\/\.well-known\/oauth-protected-resource\/mcp\/bitable/);
  const metadata=await (await f.request('/feishu/.well-known/oauth-protected-resource/mcp/bitable')).json() as any;assert.equal(metadata.resource,resource);
  const issued=await f.code(resource);const body={grant_type:'authorization_code',client_id:f.client.client_id,redirect_uri:callback,resource,code:issued.code,code_verifier:issued.verifier};
  assert.equal((await f.post('/feishu/token',{...body,resource:f.config.resource})).status,400);
  const tokenResponse=await f.post('/feishu/token',body);assert.equal(tokenResponse.status,200);const token=await tokenResponse.json() as any;
  const headers={Authorization:'Bearer '+token.access_token,Accept:'application/json, text/event-stream'};
  const listed=await f.post('/feishu/mcp/bitable',{jsonrpc:'2.0',id:1,method:'tools/list',params:{}},headers);assert.equal(listed.status,200);assert.equal(((await listed.json()) as any).result.tools.length,toolDefinitions('bitable').length);
  assert.equal((await f.post('/feishu/mcp',{},headers)).status,401);
  assert.equal((await f.post('/feishu/token',{grant_type:'refresh_token',client_id:f.client.client_id,refresh_token:token.refresh_token,resource:f.config.resource})).status,400);
  assert.equal((await f.post('/feishu/token',{grant_type:'refresh_token',client_id:f.client.client_id,refresh_token:token.refresh_token,resource})).status,200);
 }finally{await f.close();}
});
