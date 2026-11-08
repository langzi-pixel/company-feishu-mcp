import express from 'express';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { profiles, type ToolProfile } from './catalog.js';
import { requestContext, logTiming, timed } from './telemetry.js';
import type { Config } from './config.js';
import type { Store } from './store.js';
import { OAuth, page } from './oauth.js';
import { Feishu } from './feishu.js';
import { makeServer, catalog, VERSION, toolDefinitions } from './tools.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
export function createApp(config:Config,store:Store,feishu = new Feishu(config,store)) {
  const app=express(),oauth=new OAuth(config,store,feishu);
  app.disable('x-powered-by');
  // Browsers apply form-action to every redirect in the upstream login chain.
  const loginDomain = config.feishuDomain.endsWith('.feishu.cn') ? 'feishu.cn' : 'larksuite.com';
  const formOrigins = [...['open','accounts','passport','login'].map(host=>`https://${host}.${loginDomain}`), ...new Set(config.allowedRedirects.map(uri=>new URL(uri).origin))].join(' ');
  app.use((_req,res,next)=>{res.set({'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin','Content-Security-Policy':`default-src 'none'; style-src 'unsafe-inline'; form-action 'self' ${formOrigins}; frame-ancestors 'none'`});next();});
  app.use((req,res,next)=>requestContext.run({requestId:randomUUID()},()=>{
    const started=performance.now();
    res.set('Cache-Control','no-store');
    res.on('finish',()=>logTiming('http_request',started,{status:res.statusCode}));
    next();
  }));
  app.use(express.json({limit:'2mb'}));app.use(express.urlencoded({extended:false,limit:'16kb'}));
  oauth.install(app);
  app.get('/',(_req,res)=>res.type('html').send(page('Feishu MCP',`<p>自托管的飞书 MCP 服务。</p><p><a href="${config.basePath}">连接说明</a> · <code>${config.resource}</code></p>`)));
  app.get(config.basePath+'/healthz',(_req,res)=>res.json({status:'ok',service:'feishu-mcp',version:VERSION,revision:process.env.REVISION||'development',catalog_size:catalog.length,exposed_tools:toolDefinitions().length,full_tools:toolDefinitions('all').length,profiles}));
  app.get([config.basePath,config.basePath+'/'],(_req,res)=>res.type('html').send(page('Feishu MCP',`<p>在 ChatGPT 中添加 OAuth 连接：</p><p><code>${config.resource}</code></p><p>日常入口提供文件搜索、Markdown 文档读写、多维表格查询与批量记录操作；其他能力可按需查找。</p><p>完整工具入口：<code>${config.resource}/all</code>。可选分组：docs、bitable、calendar、tasks、messages、drive、wiki，在 MCP 地址末尾加分组名。</p><p>工具分组不增加数据权限。更新后在 ChatGPT 刷新工具列表；旧工具调用继续兼容。</p>`)));
  app.all(profiles.map(p=>config.basePath+'/mcp'+(p==='daily'?'':'/'+p)),async(req,res,next)=>{
    try {
      if(req.headers.origin && req.headers.origin!==config.origin){res.status(403).json({error:'untrusted_origin'});return;}
      const suffix=req.path.slice((config.basePath+'/mcp').length);
      const profile=(suffix?suffix.slice(1):'daily') as ToolProfile;
      const resource=config.resource+suffix;
      const grant=await timed('oauth_authenticate','access_grant',()=>oauth.authenticate(req,resource));
      if(!grant){res.set('WWW-Authenticate',oauth.challengeHeader(resource)).status(401).json({error:'unauthorized'});return;}
      if(req.method!=='POST'){res.set('Allow','POST').status(405).end();return;}
      const server=makeServer(config,()=>feishu.userToken(grant.sessionId),profile,undefined,oauth.challengeHeader(resource));
      const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
      res.on('close',()=>{void transport.close();void server.close();});
      await server.connect(transport);await transport.handleRequest(req,res,req.body);
    } catch(e){next(e);}
  });
  app.use((_req,res)=>res.status(404).json({error:'not_found'}));
  app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
    // Never log Axios request config, OAuth bodies, cookies, or credentials.
    console.error(JSON.stringify({event:'request_failed',type:(error as Error).name}));
    if(!res.headersSent)res.status(500).json({error:'internal_error'});
  });
  return app;
}
