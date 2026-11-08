import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface StateRecord<T> { value: T; expiry: number }

// Bind each encrypted record to its storage key so ciphertext cannot be moved
// between sessions, grants, or namespaces.
export class StateCodec {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error('STATE_ENCRYPTION_KEY must be 32 bytes encoded as base64');
  }

  encode(key: string, value: unknown, expiry: number): Buffer {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(key));
    const body = Buffer.concat([cipher.update(JSON.stringify({ value, expiry })), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]);
  }

  decode<T>(key: string, raw: Buffer): StateRecord<T> {
    if (raw.length < 29) throw new Error('Invalid encrypted state record');
    const decipher = createDecipheriv('aes-256-gcm', this.key, raw.subarray(0, 12));
    decipher.setAAD(Buffer.from(key));
    decipher.setAuthTag(raw.subarray(12, 28));
    const record = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString()) as StateRecord<T>;
    if (!Number.isSafeInteger(record.expiry)) throw new Error('Invalid state expiry');
    return record;
  }
}
