export interface Config {
  origin: string; basePath: string; resource: string; issuer: string; appId: string;
  appSecret: string; feishuDomain: string; feishuScopes: string;
  allowedUsers: string[]; allowedRedirects: string[]; port: number; production: boolean;
}
export function configFromEnv(env = process.env): Config {
  const origin = new URL(env.PUBLIC_ORIGIN || 'http://localhost:8080').origin;
  const production = env.NODE_ENV === 'production';
  if (production && !origin.startsWith('https://')) throw new Error('PUBLIC_ORIGIN must use HTTPS');
  const basePath = env.BASE_PATH || '/feishu';
  if (!/^\/[a-z0-9-]+$/.test(basePath)) throw new Error('BASE_PATH must be one path segment');
  if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET) throw new Error('Feishu application credentials are required');
  const feishuDomain = env.FEISHU_DOMAIN || 'https://open.feishu.cn';
  if (!['https://open.feishu.cn','https://open.larksuite.com'].includes(feishuDomain)) throw new Error('Unsupported Feishu domain');
  return { origin, basePath, issuer: origin + basePath, resource: origin + basePath + '/mcp',
    appId: env.FEISHU_APP_ID, appSecret: env.FEISHU_APP_SECRET, feishuDomain,
    feishuScopes: env.FEISHU_SCOPES || 'offline_access',
    allowedUsers: (env.FEISHU_ALLOWED_USERS || '').split(',').filter(Boolean),
    allowedRedirects: (env.OAUTH_REDIRECT_URIS || 'https://chatgpt.com/connector_platform_oauth_redirect').split(',').filter(Boolean),
    port: Number(env.PORT || 8080), production };
}
