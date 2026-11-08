import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/index.ts'], bundle: true, platform: 'node', target: 'node22', format: 'cjs', outfile: 'dist/server.cjs', external: ['keytar'], sourcemap: false });
await copyFile('LICENSE', 'dist/LICENSE');
await copyFile('THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.md');
