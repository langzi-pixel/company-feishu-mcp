import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import OSS from 'ali-oss';
import { timed } from './telemetry.js';

export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export const random = () => randomBytes(32).toString('base64url');
export const now = () => Math.floor(Date.now() / 1000);
export interface Store {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown, ttl: number): Promise<void>;
  claim(key: string, ttl: number): Promise<boolean>;
}
export class MemoryStore implements Store {
  entries = new Map<string, { value: unknown; expiry: number }>();
  async get<T>(key: string): Promise<T | undefined> {
    const item = this.entries.get(key);
    return item && item.expiry > now() ? structuredClone(item.value) as T : undefined;
  }
  async put(key: string, value: unknown, ttl: number) {
    this.entries.set(key, { value: structuredClone(value), expiry: now() + ttl });
  }
  async claim(key: string, ttl: number) {
    const k = 'claims/' + key;
    if (this.entries.has(k) && this.entries.get(k)!.expiry > now()) return false;
    this.entries.set(k, { value: true, expiry: now() + ttl });
    return true;
  }
}
// OAuth state is small. Private OSS objects avoid a permanently running database.
// Single-use claims use OSS's atomic forbid-overwrite operation, not get-then-put.
export class OssStore implements Store {
  constructor(private client: OSS, private encryptionKey: Buffer, private prefix = 'feishu/') {
    if (encryptionKey.length !== 32) throw new Error('STATE_ENCRYPTION_KEY must be 32 bytes encoded as base64');
  }
  private objectName(key: string) { return this.prefix + key; }
  private encode(key: string, value: unknown, ttl: number) {
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    cipher.setAAD(Buffer.from(this.objectName(key)));
    const data = Buffer.concat([cipher.update(JSON.stringify({ value, expiry: now() + ttl })), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]);
  }
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await timed('state_store','get:'+key.split('/')[0],()=>this.client.get(this.objectName(key)));
      const raw = Buffer.from(result.content), decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, raw.subarray(0,12));
      decipher.setAAD(Buffer.from(this.objectName(key))); decipher.setAuthTag(raw.subarray(12,28));
      const data = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString());
      return data.expiry > now() ? data.value as T : undefined;
    } catch (e) { if ((e as { code?: string }).code === 'NoSuchKey') return undefined; throw e; }
  }
  async put(key: string, value: unknown, ttl: number) {
    await this.client.put(this.objectName(key), this.encode(key, value, ttl), { headers: { 'Cache-Control': 'no-store' } });
  }
  async claim(key: string, ttl: number) {
    const k = 'claims/' + key;
    try {
      await this.client.put(this.objectName(k), this.encode(k, true, ttl), { headers: { 'x-oss-forbid-overwrite': 'true' } });
      return true;
    } catch (e) { if ((e as { code?: string }).code === 'FileAlreadyExists') return false; throw e; }
  }
}
export function createStore(env = process.env): Store {
  if (env.STATE_STORE === 'memory' && env.NODE_ENV !== 'production') return new MemoryStore();
  if (!env.OSS_BUCKET || !env.STATE_ENCRYPTION_KEY) throw new Error('Durable OSS storage configuration is required');
  // FC supplies short-lived role credentials. No account AccessKey is deployed.
  const client = new OSS({ region: env.OSS_REGION || 'oss-cn-hangzhou', bucket: env.OSS_BUCKET,
    accessKeyId: env.ALIBABA_CLOUD_ACCESS_KEY_ID || env.FC_ACCESS_KEY_ID || '',
    accessKeySecret: env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || env.FC_ACCESS_KEY_SECRET || '',
    stsToken: env.ALIBABA_CLOUD_SECURITY_TOKEN || env.FC_SECURITY_TOKEN,
    secure: true, internal: env.OSS_INTERNAL === 'true', timeout: 15000 });
  return new OssStore(client, Buffer.from(env.STATE_ENCRYPTION_KEY, 'base64'), env.OSS_PREFIX || 'feishu/');
}
