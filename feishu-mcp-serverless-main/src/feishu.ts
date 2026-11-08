import type { Config } from './config.js';
import type { Store } from './store.js';
import { hash, now } from './store.js';
export interface FeishuTokens { access_token: string; refresh_token?: string; expires_in: number; refresh_token_expires_in?: number; scope?: string }
export interface Session { userId: string; tokens: FeishuTokens; expiresAt: number }
export class Feishu {
  constructor(private config: Config, private store: Store, private fetcher: typeof fetch = fetch) {}
  async exchange(params: Record<string,string>): Promise<FeishuTokens> {
    const response = await this.fetcher(this.config.feishuDomain + '/open-apis/authen/v2/oauth/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ ...params, client_id: this.config.appId, client_secret: this.config.appSecret }) });
    const data = await response.json() as FeishuTokens & { code?: number };
    if (!response.ok || (data.code !== undefined && data.code !== 0) || !data.access_token || !(data.expires_in > 0))
      throw new Error('Feishu token exchange failed; check application scopes and callback configuration');
    return data;
  }
  async userId(token: string) {
    const response = await this.fetcher(this.config.feishuDomain + '/open-apis/authen/v1/user_info', {
      headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(15000) });
    const data = await response.json() as { code: number; data?: { open_id: string } };
    if (!response.ok || data.code !== 0 || !data.data?.open_id) throw new Error('Unable to verify Feishu user');
    return data.data.open_id;
  }
  async userToken(sessionId: string): Promise<string> {
    const session = await this.store.get<Session>('sessions/' + sessionId);
    if (!session) throw new Error('reauthorize');
    if (session.expiresAt > now() + 120) return session.tokens.access_token;
    if (!session.tokens.refresh_token) throw new Error('reauthorize');
    const claim = 'feishu-refresh/' + sessionId + '/' + hash(session.tokens.refresh_token);
    if (await this.store.claim(claim, 35 * 86400)) {
      // Do not retry an ambiguous upstream rotation: reconnect if the instance dies
      // between exchanging a refresh token and durably storing its replacement.
      const tokens = await this.exchange({ grant_type: 'refresh_token', refresh_token: session.tokens.refresh_token });
      await this.store.put('sessions/' + sessionId, { ...session, tokens: { ...tokens, refresh_token: tokens.refresh_token || session.tokens.refresh_token }, expiresAt: now() + tokens.expires_in }, 30 * 86400);
      return tokens.access_token;
    }
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      const updated = await this.store.get<Session>('sessions/' + sessionId);
      if (updated && updated.expiresAt > now() + 120) return updated.tokens.access_token;
    }
    throw new Error('reauthorize');
  }
}
