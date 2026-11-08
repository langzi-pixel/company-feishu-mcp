import { createHash, timingSafeEqual } from 'node:crypto';
import type { Express, Request, Response } from 'express';
import type { Config } from './config.js';
import { Feishu, type Session } from './feishu.js';
import { profiles } from './catalog.js';
import { type Store, random, hash, now } from './store.js';

const SESSION_TTL = 30 * 86400;
export const challenge = (v: string) => createHash('sha256').update(v).digest('base64url');
const equal = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x,y); };
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const page = (title: string, body: string) => `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(title)}</title><style>body{font:17px/1.7 system-ui;max-width:680px;margin:64px auto;padding:0 24px;color:#18232d}button{background:#176b50;color:white;border:0;padding:12px 24px;border-radius:6px;font:inherit}code{overflow-wrap:anywhere}a{color:#176b50}</style><h1>${escape(title)}</h1>${body}</html>`;
interface Client { client_id: string; client_name: string; redirect_uris: string[]; token_endpoint_auth_method: 'none' }
interface Transaction { resource?: string; clientId: string; redirectUri: string; state?: string; challenge: string; cookieHash: string; csrf: string; verifier: string }
interface Grant { clientId: string; sessionId: string; resource: string; issuer: string; scopes: string[] }
interface Code extends Grant { redirectUri: string; challenge: string }
function required(value: unknown): string { if (typeof value !== 'string' || !value || value.length > 8192) throw new Error('invalid_request'); return value; }
function cookie(req: Request, name: string) { return (req.headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1) || ''; }

export class OAuth {
  readonly metadataPath: string;
  private cookieName: string;
  constructor(readonly config: Config, readonly store: Store, readonly feishu: Feishu) {
    this.metadataPath = '/.well-known/oauth-protected-resource' + config.basePath + '/mcp';
    this.cookieName = 'mcp_' + config.basePath.slice(1) + '_login';
  }
  challengeHeader(resource = this.config.resource) { return `Bearer resource_metadata="${this.config.origin}${resource === this.config.resource ? this.metadataPath : this.config.basePath + '/.well-known/oauth-protected-resource' + new URL(resource).pathname.slice(this.config.basePath.length)}", scope="feishu"`; }
  private async client(id: string) {
    const client = await this.store.get<Client>('clients/' + hash(id));
    if (!client) throw new Error('invalid_client');
    return client;
  }
  private validateResource(value: unknown) { if (!profiles.some(p => value === this.config.resource + (p === 'daily' ? '' : '/' + p))) throw new Error('invalid_target'); }
  private transactionCookie(id: string) { return this.cookieName + '_' + hash(id).slice(0,24); }
  private browserMatches(req: Request, tx: Transaction, id: string) { return equal(tx.cookieHash, hash(cookie(req, this.transactionCookie(id)))); }
  private async issue(grant: Grant) {
    const access = random(), refresh = random();
    await this.store.put('access/' + hash(access), grant, 3600);
    await this.store.put('refresh/' + hash(refresh), grant, SESSION_TTL);
    return { access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: 3600, scope: grant.scopes.join(' ') };
  }
  async authenticate(req: Request, resource = this.config.resource): Promise<Grant | undefined> {
    const token = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) return undefined;
    const grant = await this.store.get<Grant>('access/' + hash(token));
    if (!grant || grant.resource !== resource || grant.issuer !== this.config.issuer || !grant.scopes.includes('feishu')) return undefined;
    if (await this.store.get('revoked/' + grant.sessionId)) return undefined;
    return grant;
  }
  install(app: Express) {
    const c = this.config, b = c.basePath;
    const protectedMetadata = { resource: c.resource, authorization_servers: [c.issuer], scopes_supported: ['feishu'], resource_name: 'Feishu MCP' };
    const authMetadata = { issuer: c.issuer, authorization_endpoint: c.issuer + '/authorize', token_endpoint: c.issuer + '/token',
      registration_endpoint: c.issuer + '/register', revocation_endpoint: c.issuer + '/revoke',
      response_types_supported: ['code'], grant_types_supported: ['authorization_code','refresh_token'],
      token_endpoint_auth_methods_supported: ['none'], code_challenge_methods_supported: ['S256'],
      scopes_supported: ['feishu'], authorization_response_iss_parameter_supported: true };
    app.get([this.metadataPath, b+'/.well-known/oauth-protected-resource'], (_req,res)=>res.json(protectedMetadata));
    for (const profile of profiles.filter(p => p !== 'daily')) {
      const resource = c.resource + '/' + profile;
      app.get([this.metadataPath + '/' + profile, b + '/.well-known/oauth-protected-resource/mcp/' + profile], (_req,res)=>res.json({...protectedMetadata,resource}));
    }
    app.get(['/.well-known/oauth-authorization-server'+b, b+'/.well-known/oauth-authorization-server'], (_req,res)=>res.json(authMetadata));
    const route = (fn: (req: Request,res: Response)=>Promise<unknown>) => async (req: Request,res: Response) => {
      res.set('Cache-Control','no-store');
      try { await fn(req,res); } catch(e) {
        const message = (e as Error).message;
        const publicErrors = ['invalid_request','invalid_client','invalid_target','invalid_scope','invalid_grant','access_denied'];
        const status = publicErrors.includes(message) ? 400 : 503;
        const error = publicErrors.includes(message) ? message : 'temporarily_unavailable';
        if (req.headers.accept?.includes('text/html')) {
          res.status(status).type('html').send(page('连接尚未完成', `<p>此次授权没有完成（${escape(error)}）。请关闭这个窗口，返回 ChatGPT 关闭登录弹窗，然后重新点击连接。</p><p>如果重试后仍出现此提示，请联系服务维护者。</p>`));
        } else res.status(status).json({ error });
      }
    };
    app.post(b+'/register', route(async(req,res)=>{
      const input = req.body;
      if (!input || !Array.isArray(input.redirect_uris) || !input.redirect_uris.length || input.redirect_uris.length>5) throw new Error('invalid_request');
      for (const uri of input.redirect_uris) if (!c.allowedRedirects.includes(uri)) throw new Error('invalid_request');
      if (input.token_endpoint_auth_method && input.token_endpoint_auth_method !== 'none') throw new Error('invalid_request');
      if (input.grant_types && (!Array.isArray(input.grant_types) || input.grant_types.some((g: string)=>!['authorization_code','refresh_token'].includes(g)))) throw new Error('invalid_request');
      if (input.response_types && JSON.stringify(input.response_types)!=='["code"]') throw new Error('invalid_request');
      const client: Client = { client_id: random(), client_name: typeof input.client_name==='string' ? input.client_name.slice(0,100) : 'MCP client', redirect_uris: input.redirect_uris, token_endpoint_auth_method:'none' };
      // DCR clients stay valid while connections exist. Never apply short OAuth-state TTLs.
      await this.store.put('clients/'+hash(client.client_id), client, 10*365*86400);
      res.status(201).json({ ...client, client_id_issued_at: now(), grant_types:['authorization_code','refresh_token'], response_types:['code'] });
    }));
    app.get(b+'/authorize', route(async(req,res)=>{
      const q=req.query, client=await this.client(required(q.client_id));
      const redirectUri=required(q.redirect_uri);
      if (!client.redirect_uris.includes(redirectUri)) throw new Error('invalid_request');
      this.validateResource(q.resource);
      if (q.response_type!=='code' || q.code_challenge_method!=='S256' || !/^[A-Za-z0-9_-]{43}$/.test(required(q.code_challenge))) throw new Error('invalid_request');
      if (q.scope && q.scope!=='feishu') throw new Error('invalid_scope');
      if (q.state !== undefined && typeof q.state !== 'string') throw new Error('invalid_request');
      const txId=random(), browser=random(), csrf=random();
      const tx: Transaction={ resource:q.resource as string, clientId:client.client_id, redirectUri, state:q.state as string|undefined, challenge:q.code_challenge as string, cookieHash:hash(browser), csrf, verifier:random() };
      await this.store.put('transactions/'+hash(txId),tx,600);
      res.cookie(this.transactionCookie(txId),browser,{httpOnly:true,secure:c.origin.startsWith('https://'),sameSite:'lax',path:b,maxAge:600000});
      res.type('html').send(page('连接飞书',`<p>允许 <strong>${escape(client.client_name)}</strong> 通过此服务操作你授权的飞书资料，包括多维表格、文档与任务。实际可用范围由飞书权限决定。</p><p>授权完成后返回：<code>${escape(new URL(redirectUri).origin)}</code></p><form method="post" action="${b}/consent"><input type="hidden" name="transaction" value="${txId}"><input type="hidden" name="csrf" value="${csrf}"><button type="submit">继续前往飞书授权</button></form><p>如非你本人发起，请关闭此页面。</p>`));
    }));
    app.post(b+'/consent',route(async(req,res)=>{
      if (req.headers.origin && req.headers.origin!==c.origin) throw new Error('access_denied');
      const id=required(req.body.transaction), tx=await this.store.get<Transaction>('transactions/'+hash(id));
      if (!tx || !this.browserMatches(req,tx,id) || !equal(tx.csrf,required(req.body.csrf))) throw new Error('access_denied');
      if (!await this.store.claim('consent/'+hash(id),600)) throw new Error('invalid_grant');
      await this.store.put('consented/'+hash(id),true,600);
      const url=new URL(c.feishuDomain+'/open-apis/authen/v1/authorize');
      url.search=new URLSearchParams({client_id:c.appId,response_type:'code',redirect_uri:c.issuer+'/callback',state:id,code_challenge:challenge(tx.verifier),code_challenge_method:'S256',scope:c.feishuScopes}).toString();
      res.redirect(url.toString());
    }));
    app.get(b+'/callback',route(async(req,res)=>{
      const id=required(req.query.state), tx=await this.store.get<Transaction>('transactions/'+hash(id));
      if (!tx || !this.browserMatches(req,tx,id) || !await this.store.get('consented/'+hash(id))) throw new Error('access_denied');
      if (!await this.store.claim('callback/'+hash(id),600)) throw new Error('invalid_grant');
      const target=new URL(tx.redirectUri); target.searchParams.set('iss',c.issuer); if(tx.state)target.searchParams.set('state',tx.state);
      if(req.query.error) { target.searchParams.set('error','access_denied'); res.redirect(target.toString()); return; }
      const tokens=await this.feishu.exchange({grant_type:'authorization_code',code:required(req.query.code),redirect_uri:c.issuer+'/callback',code_verifier:tx.verifier});
      const userId=await this.feishu.userId(tokens.access_token);
      if (c.allowedUsers.length && !c.allowedUsers.includes(userId)) {target.searchParams.set('error','access_denied');res.redirect(target.toString());return;}
      const sessionId=random(), code=random();
      const session:Session={userId,tokens,expiresAt:now()+tokens.expires_in};
      await this.store.put('sessions/'+sessionId,session,SESSION_TTL);
      const grant:Code={clientId:tx.clientId,sessionId,resource:tx.resource || c.resource,issuer:c.issuer,scopes:['feishu'],redirectUri:tx.redirectUri,challenge:tx.challenge};
      await this.store.put('codes/'+hash(code),grant,120);
      target.searchParams.set('code',code);res.redirect(target.toString());
    }));
    app.post(b+'/token',route(async(req,res)=>{
      const body=req.body, client=await this.client(required(body.client_id));this.validateResource(body.resource);
      let grant:Grant;
      if(body.grant_type==='authorization_code') {
        const code=required(body.code), stored=await this.store.get<Code>('codes/'+hash(code));
        const verifier=required(body.code_verifier);
        if(!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || !stored || stored.clientId!==client.client_id || stored.redirectUri!==body.redirect_uri || stored.resource!==body.resource || !equal(stored.challenge,challenge(verifier)))throw new Error('invalid_grant');
        if(!await this.store.claim('code/'+hash(code),600))throw new Error('invalid_grant');
        grant=stored;
      } else if(body.grant_type==='refresh_token') {
        const token=required(body.refresh_token), stored=await this.store.get<Grant>('refresh/'+hash(token));
        if(!stored || stored.clientId!==client.client_id || stored.resource!==body.resource || await this.store.get('revoked/'+stored.sessionId))throw new Error('invalid_grant');
        if(body.scope && body.scope!=='feishu')throw new Error('invalid_scope');
        if(!await this.store.get('sessions/'+stored.sessionId))throw new Error('invalid_grant');
        if(!await this.store.claim('refresh/'+hash(token),35*86400))throw new Error('invalid_grant');
        grant=stored;
      } else throw new Error('invalid_request');
      if(grant.issuer!==c.issuer || grant.resource!==body.resource)throw new Error('invalid_grant');
      res.json(await this.issue({clientId:grant.clientId,sessionId:grant.sessionId,resource:grant.resource,issuer:grant.issuer,scopes:grant.scopes}));
    }));
    app.post(b+'/revoke',route(async(req,res)=>{
      const client=await this.client(required(req.body.client_id)), token=required(req.body.token);
      const grant=await this.store.get<Grant>('access/'+hash(token)) || await this.store.get<Grant>('refresh/'+hash(token));
      if(grant && grant.clientId===client.client_id)await this.store.put('revoked/'+grant.sessionId,true,35*86400);
      res.status(200).end();
    }));
  }
}
