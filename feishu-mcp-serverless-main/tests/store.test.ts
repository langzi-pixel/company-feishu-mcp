import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { createStore, MemoryStore, OssStore, SqliteStore, now } from '../src/store.js';

function temporaryDirectory(t: {after(fn: () => void): void}) {
  const directory = mkdtempSync(join(tmpdir(), 'feishu-sqlite-'));
  t.after(() => {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('feishu-sqlite-'));
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

test('SQLite encrypts records and persists grants and claims across reopen', async t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite'), key = randomBytes(32);
  const value = { userId: 'test-user', access_token: 'fixture-secret-access-token', refresh_token: 'fixture-refresh-token' };
  let store = new SqliteStore(file, key);
  try {
    await store.put('sessions/test-session', value, 3600);
    assert.equal(await store.claim('one-use-code', 600), true);
    assert.deepEqual(await store.get('sessions/test-session'), value);
    for (const name of readdirSync(directory)) {
      const raw = readFileSync(join(directory, name));
      assert.equal(raw.includes(Buffer.from(value.access_token)), false);
      assert.equal(raw.includes(Buffer.from(value.refresh_token)), false);
      assert.equal(raw.includes(Buffer.from(value.userId)), false);
    }
    store.close();
    store = new SqliteStore(file, key);
    assert.deepEqual(await store.get('sessions/test-session'), value);
    assert.equal(await store.claim('one-use-code', 600), false);
    if (process.platform !== 'win32') assert.equal(statSync(file).mode & 0o777, 0o600);
  } finally { store.close(); }
});

test('SQLite applies expiry, permits expired claims, and prunes expired records', async t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite');
  let clock = 1700000000000;
  t.mock.method(Date, 'now', () => clock);
  const store = new SqliteStore(file, randomBytes(32));
  try {
    await store.put('short-session', { ok: true }, 2);
    assert.equal(await store.claim('short-code', 2), true);
    assert.equal(await store.claim('short-code', 2), false);
    clock += 3000;
    assert.equal(await store.get('short-session'), undefined);
    assert.equal(await store.claim('short-code', 2), true);
    await store.put('already-expired', true, -1);
    assert.equal(await store.get('already-expired'), undefined);
    clock += 301000;
    await store.put('trigger-cleanup', true, 60);
    const inspect = new DatabaseSync(file, { readOnly: true });
    try {
      assert.equal(inspect.prepare('SELECT count(*) AS n FROM state WHERE expires_at <= ?').get(now())!.n, 0);
      assert.equal(inspect.prepare('SELECT count(*) AS n FROM claims WHERE expires_at <= ?').get(now())!.n, 0);
    } finally { inspect.close(); }
  } finally { store.close(); }
});

test('SQLite fails closed for a wrong key, moved ciphertext, and changed expiry', async t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite'), key = randomBytes(32);
  const store = new SqliteStore(file, key);
  try {
    await store.put('first', { token: 'fixture-first' }, 600);
    await store.put('second', { token: 'fixture-second' }, 600);
    assert.throws(() => new SqliteStore(file, randomBytes(32)));
    const modify = new DatabaseSync(file);
    try {
      modify.exec("UPDATE state SET ciphertext = (SELECT ciphertext FROM state WHERE key = 'first') WHERE key = 'second'");
      await assert.rejects(store.get('second'));
      modify.exec("UPDATE state SET expires_at = expires_at + 3600 WHERE key = 'first'");
      await assert.rejects(store.get('first'), /expiry authentication/);
    } finally { modify.close(); }
  } finally { store.close(); }
});

test('separate processes arbitrate single-use claims against the same SQLite file', async t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite'), key = randomBytes(32);
  new SqliteStore(file, key).close();
  const moduleUrl = new URL('../src/sqlite-store.ts', import.meta.url).href;
  const source = `
    import {SqliteStore} from ${JSON.stringify(moduleUrl)};
    const store = new SqliteStore(process.argv[1], Buffer.from(process.argv[2], 'base64'));
    process.stdout.write('ready\\n');
    process.stdin.once('data', async () => {
      const won = [];
      for (let i = 0; i < 20; i++) if (await store.claim('shared-' + i, 600)) won.push(i);
      store.close();
      process.stdout.write(JSON.stringify(won) + '\\n');
      process.stdin.destroy();
    });
  `;
  const children = Array.from({ length: 4 }, () => {
    const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', source, file, key.toString('base64')], {
      cwd: fileURLToPath(new URL('..', import.meta.url)), timeout: 20000,
    });
    let stdout = '', stderr = '';
    const ready = new Promise<void>((resolveReady, reject) => {
      child.stdout.on('data', data => { stdout += data.toString(); if (stdout.includes('ready\n')) resolveReady(); });
      child.once('error', reject);
      child.once('exit', code => { if (!stdout.includes('ready\n')) reject(new Error('Claim worker did not start: ' + code + stderr)); });
    });
    child.stderr.on('data', data => { stderr += data.toString(); });
    const done = new Promise<number[]>((resolveDone, reject) => {
      child.once('error', reject);
      child.once('exit', code => {
        if (code !== 0) reject(new Error('Claim worker failed: ' + stderr));
        else resolveDone(JSON.parse(stdout.trim().split('\n').at(-1)!));
      });
    });
    // Attach a handler immediately, including when another worker fails startup.
    void done.catch(() => {});
    return { child, ready, done };
  });
  try {
    await Promise.all(children.map(c => c.ready));
    for (const {child} of children) child.stdin.end('go\n');
    const winners = (await Promise.all(children.map(c => c.done))).flat();
    assert.equal(winners.length, 20);
    assert.equal(new Set(winners).size, 20);
  } finally {
    for (const {child} of children) if (child.exitCode === null) child.kill();
    await Promise.allSettled(children.map(c => c.done));
  }
});

test('online backup restores encrypted state and consumed claims while the source stays open', async t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite'), backupDir = join(directory, 'backups'), key = randomBytes(32);
  const store = new SqliteStore(file, key);
  try {
    await store.put('session', { token: 'fixture-backup-token' }, 600);
    await store.claim('consumed', 600);
    const output = execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/backup-state.mjs', import.meta.url)), file, backupDir], { encoding: 'utf8', timeout: 15000 });
    assert.equal(JSON.parse(output).event, 'state_backup_complete');
    await store.put('after-backup', true, 600);
    const backups = readdirSync(backupDir);
    assert.equal(backups.length, 1);
    const snapshot = join(backupDir, backups[0]);
    assert.equal(readFileSync(snapshot).includes(Buffer.from('fixture-backup-token')), false);
    const restored = new SqliteStore(snapshot, key);
    try {
      assert.deepEqual(await restored.get('session'), { token: 'fixture-backup-token' });
      assert.equal(await restored.get('after-backup'), undefined);
      assert.equal(await restored.claim('consumed', 600), false);
    } finally { restored.close(); }
  } finally { store.close(); }
});

test('store selection requires explicit persistent SQLite configuration and rejects production memory', t => {
  const directory = temporaryDirectory(t), file = join(directory, 'state.sqlite');
  assert.ok(createStore({ STATE_STORE: 'memory' }) instanceof MemoryStore);
  assert.throws(() => createStore({ STATE_STORE: 'memory', NODE_ENV: 'production' }), /not allowed/);
  assert.throws(() => createStore({ STATE_STORE: 'sqltie' }), /Unsupported/);
  assert.throws(() => createStore({ STATE_STORE: 'sqlite' }), /STATE_DB_PATH/);
  assert.throws(() => new SqliteStore(':memory:', randomBytes(32)), /absolute path/);
  assert.throws(() => new SqliteStore(file, Buffer.alloc(0)), /32 bytes/);
  const store = createStore({ NODE_ENV: 'production', STATE_STORE: 'sqlite', STATE_DB_PATH: file, STATE_ENCRYPTION_KEY: randomBytes(32).toString('base64') });
  assert.ok(store instanceof SqliteStore);
  store.close?.();
});

test('OSS retains the existing encrypted record format and key binding', async () => {
  const key = randomBytes(32), objectName = 'feishu/session', expiry = now() + 600;
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(objectName));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify({ value: { token: 'fixture-legacy-token' }, expiry })), cipher.final()]);
  let content: Buffer = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  const client = {
    get: async () => ({ content }),
    put: async (_name: string, bytes: Buffer) => { content = bytes; },
  };
  const store = new OssStore(client as any, key);
  assert.deepEqual(await store.get('session'), { token: 'fixture-legacy-token' });
  await assert.rejects(store.get('different-session'));
  await store.put('session', { token: 'fixture-new-token' }, 600);
  const decipher = createDecipheriv('aes-256-gcm', key, content.subarray(0, 12));
  decipher.setAAD(Buffer.from(objectName));
  decipher.setAuthTag(content.subarray(12, 28));
  const decoded = JSON.parse(Buffer.concat([decipher.update(content.subarray(28)), decipher.final()]).toString());
  assert.equal(decoded.value.token, 'fixture-new-token');
});
