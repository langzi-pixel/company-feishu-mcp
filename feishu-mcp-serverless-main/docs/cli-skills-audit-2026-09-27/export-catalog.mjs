// Export static public API metadata only. Never reads config, tokens or .env.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const [depsRoot, output] = process.argv.slice(2);
if (!depsRoot || !output) throw new Error('Usage: node export-catalog.mjs DEPENDENCY_ROOT OUTPUT_JSON');
const require = createRequire(resolve(depsRoot, 'package.json'));
const {AllToolsZh} = require('@larksuiteoapi/lark-mcp/dist/mcp-tool/tools/index.js');
const rows = AllToolsZh.map(t => ({
  name: t.name, project: t.project, description: t.description,
  path: t.path, method: t.httpMethod, tokens: t.accessTokens,
  upload: !!t.supportFileUpload, download: !!t.supportFileDownload,
  custom: !!t.customHandler,
  included: !!t.accessTokens?.includes('user') && !t.supportFileUpload && !t.supportFileDownload,
}));
writeFileSync(resolve(output), JSON.stringify(rows, null, 2) + '\n');
console.log(JSON.stringify({upstream: rows.length, included: rows.filter(t => t.included).length}));
