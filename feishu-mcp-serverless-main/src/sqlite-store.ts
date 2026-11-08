import { chmodSync, closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import type { Store } from './store.js';
import { StateCodec } from './state-codec.js';

export class SqliteStore implements Store {
  private readonly codec: StateCodec;
  private readonly db: DatabaseSync;
  private readonly select: StatementSync;
  private readonly upsert: StatementSync;
  private readonly takeClaim: StatementSync;
  private readonly pruneState: StatementSync;
  private readonly pruneClaims: StatementSync;
  private nextPrune = 0;
  private closed = false;

  constructor(file: string, key: Buffer) {
    this.codec = new StateCodec(key);
    if (!isAbsolute(file)) throw new Error('STATE_DB_PATH must be an absolute path to a persistent SQLite file');
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    closeSync(openSync(file, 'a', 0o600));
    chmodSync(file, 0o600);
    this.db = new DatabaseSync(file, { timeout: 5000 });
    try {
      const mode = this.db.prepare('PRAGMA journal_mode=WAL').get();
      if (mode?.journal_mode !== 'wal') throw new Error('SQLite WAL mode is required');
      this.db.exec(`
        PRAGMA synchronous=FULL;
        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          ciphertext BLOB NOT NULL
        ) STRICT;
        CREATE TABLE IF NOT EXISTS state (
          key TEXT PRIMARY KEY,
          ciphertext BLOB NOT NULL,
          expires_at INTEGER NOT NULL
        ) STRICT;
        CREATE INDEX IF NOT EXISTS state_expiry ON state(expires_at);
        CREATE TABLE IF NOT EXISTS claims (
          key TEXT PRIMARY KEY,
          expires_at INTEGER NOT NULL
        ) STRICT;
        CREATE INDEX IF NOT EXISTS claims_expiry ON claims(expires_at);
      `);
      const markerKey = 'sqlite/metadata/key-check';
      this.db.prepare('INSERT OR IGNORE INTO metadata(key, ciphertext) VALUES (?, ?)')
        .run('key-check', this.codec.encode(markerKey, { format: 1 }, 0));
      const marker = this.db.prepare('SELECT ciphertext FROM metadata WHERE key = ?').get('key-check')!;
      const verified = this.codec.decode<{format: number}>(markerKey, Buffer.from(marker.ciphertext as Uint8Array));
      if (verified.value.format !== 1 || verified.expiry !== 0) throw new Error('Unsupported SQLite state format');
      this.select = this.db.prepare('SELECT ciphertext, expires_at FROM state WHERE key = ?');
      this.upsert = this.db.prepare(`INSERT INTO state(key, ciphertext, expires_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET ciphertext = excluded.ciphertext, expires_at = excluded.expires_at`);
      // A single SQLite statement arbitrates between processes and connections.
      // Never replace this with a separate SELECT followed by INSERT.
      this.takeClaim = this.db.prepare(`INSERT INTO claims(key, expires_at) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at WHERE claims.expires_at <= ?`);
      this.pruneState = this.db.prepare('DELETE FROM state WHERE expires_at <= ?');
      this.pruneClaims = this.db.prepare('DELETE FROM claims WHERE expires_at <= ?');
      this.prune(Math.floor(Date.now() / 1000));
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  private expiry(ttl: number, now: number): number {
    const expiry = now + ttl;
    if (!Number.isSafeInteger(expiry)) throw new Error('State TTL must be a finite integer number of seconds');
    return expiry;
  }

  private prune(now: number) {
    if (now < this.nextPrune) return;
    this.pruneState.run(now);
    this.pruneClaims.run(now);
    this.nextPrune = now + 300;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const row = this.select.get(key);
    if (!row || Number(row.expires_at) <= Math.floor(Date.now() / 1000)) return undefined;
    const record = this.codec.decode<T>('sqlite/' + key, Buffer.from(row.ciphertext as Uint8Array));
    if (record.expiry !== row.expires_at) throw new Error('State expiry authentication failed');
    return record.expiry > Math.floor(Date.now() / 1000) ? record.value : undefined;
  }

  async put(key: string, value: unknown, ttl: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000), expiry = this.expiry(ttl, now);
    this.prune(now);
    this.upsert.run(key, this.codec.encode('sqlite/' + key, value, expiry), expiry);
  }

  async claim(key: string, ttl: number): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000), expiry = this.expiry(ttl, now);
    if (ttl <= 0) throw new Error('Claim TTL must be positive');
    this.prune(now);
    return Number(this.takeClaim.run(key, expiry, now).changes) === 1;
  }

  close(): void {
    if (!this.closed) {
      this.db.close();
      this.closed = true;
    }
  }
}
