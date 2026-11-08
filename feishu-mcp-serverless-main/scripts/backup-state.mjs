import { backup, DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { chmodSync, closeSync, mkdirSync, openSync, statSync, unlinkSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

const [databasePath, backupDirectory] = process.argv.slice(2);
if (!databasePath || !backupDirectory || !isAbsolute(databasePath) || !isAbsolute(backupDirectory)) {
  throw new Error('Usage: node backup-state.mjs <absolute-state.sqlite> <absolute-backup-directory>');
}

let source, destination, created = false;
try {
  source = new DatabaseSync(databasePath, { readOnly: true, timeout: 5000 });
  mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  destination = join(resolve(backupDirectory), `state-${timestamp}-${randomUUID()}.sqlite`);
  const descriptor = openSync(destination, 'wx', 0o600);
  created = true;
  closeSync(descriptor);
  // SQLite's online backup API includes committed WAL data in a consistent
  // snapshot; copying only the live .sqlite file would not provide this guarantee.
  await backup(source, destination);
  chmodSync(destination, 0o600);
  console.log(JSON.stringify({ event: 'state_backup_complete', bytes: statSync(destination).size }));
} catch (error) {
  if (destination && created) {
    try { unlinkSync(destination); } catch { /* Only remove this invocation's new file. */ }
  }
  console.error(JSON.stringify({ event: 'state_backup_failed', type: error.name, message: error.message }));
  process.exitCode = 1;
} finally {
  source?.close();
}
