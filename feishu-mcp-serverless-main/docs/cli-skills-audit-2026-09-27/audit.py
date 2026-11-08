"""Read-only source inventory. No network calls, authentication, or Feishu writes.

Usage: python3 audit.py CLI_CHECKOUT CLI_1_0_74_SKILLS_TREE MCP_CATALOG_JSON
The catalog is exported from the project's pinned @larksuiteoapi/lark-mcp.
Endpoint matches are evidence, not semantic equivalence or live acceptance.
"""
import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

OUT = Path(__file__).resolve().parent
CURRENT, BASELINE, CATALOG = map(Path, sys.argv[1:])
TOOLS = json.loads(CATALOG.read_text())


def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def normal_path(value):
    return re.sub(r':[A-Za-z_0-9]+|\{[^}]+\}|%s|<[^>]+>', '{}', value).rstrip('/')


def inventory(root):
    skills = []
    for entry in sorted(root.glob('skills/*/SKILL.md')):
        files, links, commands = [], [], []
        for p in sorted(entry.parent.rglob('*')):
            if not p.is_file():
                continue
            raw = p.read_bytes()
            rel = str(p.relative_to(root))
            files.append({'path': rel, 'bytes': len(raw), 'sha256': sha(raw)})
            if p.suffix not in ('.md', '.py', '.sh', '.js', '.json', '.yaml', '.xml'):
                continue
            text = raw.decode('utf-8', errors='replace')
            in_fence = False
            for number, line in enumerate(text.splitlines(), 1):
                if line.lstrip().startswith('```'):
                    in_fence = not in_fence
                for match in re.finditer(r'\blark-cli\s+([^\n`]+)', line):
                    commands.append({'file': rel, 'line': number, 'example': 'lark-cli ' + match.group(1).strip()})
                if in_fence or p.suffix != '.md':
                    continue
                for match in re.finditer(r'\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)', line):
                    target = match.group(1).split('#', 1)[0]
                    if not target or re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:', target) or target.startswith('/'):
                        continue
                    resolved = (p.parent / target).resolve()
                    exists = resolved.exists()
                    try:
                        dest = str(resolved.relative_to(root.resolve()))
                    except ValueError:
                        dest = 'OUTSIDE_TREE:' + target
                    kind = ('instruction_reference' if Path(target).suffix in
                            ('.md', '.py', '.sh', '.js', '.json', '.yaml', '.yml', '.xml', '.txt')
                            else 'example_asset_or_target')
                    links.append({'file': rel, 'line': number, 'target': target, 'resolved': dest,
                                  'exists': exists, 'kind': kind})
        body = entry.read_text()
        front = body.split('---', 2)[1] if body.startswith('---') else ''
        version = re.search(r'^version:\s*(.*)$', front, re.M)
        skills.append({'name': entry.parent.name, 'version': version.group(1).strip() if version else None,
                       'frontmatter_source': front.strip(), 'files': files, 'links': links,
                       'command_examples': commands,
                       'declared_or_linked_skills': sorted(set(re.findall(r'\blark-[a-z0-9-]+(?=/SKILL\.md)', body)))})
    return skills


idx = collections.defaultdict(list)
for tool in TOOLS:
    if tool.get('path'):
        idx[(tool.get('method', '').upper(), normal_path(tool['path']))].append(tool)

apis = []
for p in sorted(CURRENT.glob('internal/registry/catalog/services/*.json')):
    data = json.loads(p.read_text())
    for resource, value in data.get('resources', {}).items():
        for method, spec in value.get('methods', {}).items():
            path = spec['path']
            if not path.startswith('/'):
                path = data['servicePath'].rstrip('/') + '/' + path
            matches = idx.get((spec['httpMethod'].upper(), normal_path(path)), [])
            state = ('catalog_match' if any(t['included'] for t in matches) else
                     'upstream_excluded' if matches else 'no_exact_endpoint')
            apis.append({'command': f'lark-cli {data["name"]} {resource} {method}',
                         'source': str(p.relative_to(CURRENT)), 'method': spec['httpMethod'], 'path': path,
                         'state': state, 'mcp_tools': [t['name'] for t in matches if t['included']],
                         'excluded_upstream_tools': [{'name': t['name'], 'tokens': t.get('tokens'),
                                                       'upload': t['upload'], 'download': t['download']}
                                                      for t in matches if not t['included']],
                         'auth_evidence': {k: v for k, v in spec.items() if re.search(r'auth|scope|token', k, re.I)},
                         'schema_sha256': sha(json.dumps(spec, ensure_ascii=False, sort_keys=True).encode())})

shortcuts = []
for p in sorted(CURRENT.glob('shortcuts/**/*.go')):
    if p.name.endswith('_test.go'):
        continue
    text = p.read_text()
    definitions = list(re.finditer(r'(?:var\s+(\w+)\s*=\s*)?common\.Shortcut\s*\{', text))
    for i, d in enumerate(definitions):
        chunk = text[d.end():definitions[i + 1].start() if i + 1 < len(definitions) else len(text)]
        service = re.search(r'\bService:\s*"([^\"]+)"', chunk)
        command = re.search(r'\bCommand:\s*"([^\"]+)"', chunk)
        if not service or not command:
            continue
        paths = sorted(set(re.findall(r'"(/open-apis/[^"\n]+)"', text)))
        candidates = sorted({t['name'] for path in paths for t in TOOLS
                             if t['included'] and t.get('path') and normal_path(t['path']) == normal_path(path)})
        desc = re.search(r'\bDescription:\s*"([^\"]+)"', chunk)
        shortcuts.append({'command': f'lark-cli {service.group(1)} {command.group(1)}',
                          'description': desc.group(1) if desc else None,
                          'source': str(p.relative_to(CURRENT)), 'line': text[:d.start()].count('\n') + 1,
                          'literal_paths_in_source_file': paths,
                          'path_only_candidates_not_proof': candidates,
                          'limitations': 'Static literal scan only; shared helpers, dynamic paths, method/schema and semantic differences require review.'})

current = inventory(CURRENT)
baseline = inventory(BASELINE)
old = {s['name']: s for s in baseline}
new = {s['name']: s for s in current}
diffs = []
for name in sorted(set(old) | set(new)):
    before = {f['path']: f['sha256'] for f in old.get(name, {}).get('files', [])}
    after = {f['path']: f['sha256'] for f in new.get(name, {}).get('files', [])}
    diffs.append({'skill': name, 'added': sorted(set(after) - set(before)),
                  'removed': sorted(set(before) - set(after)),
                  'changed': sorted(p for p in set(before) & set(after) if before[p] != after[p])})

domain_counts = collections.defaultdict(lambda: {'upstream': 0, 'included': 0})
for t in TOOLS:
    domain_counts[t['project']]['upstream'] += 1
    domain_counts[t['project']]['included'] += int(t['included'])

summary = {
    'date': '2026-09-27',
    'cli_current_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=CURRENT, text=True).strip(),
    'cli_baseline_tag': 'v1.0.74',
    'cli_baseline_commit': subprocess.check_output(['git', 'rev-parse', 'v1.0.74'], cwd=CURRENT, text=True).strip(),
    'current_skills': len(current), 'baseline_skills': len(baseline),
    'current_files': sum(len(s['files']) for s in current), 'baseline_files': sum(len(s['files']) for s in baseline),
    'current_bytes': sum(f['bytes'] for s in current for f in s['files']),
    'current_missing_instruction_references': sum(not l['exists'] and l['kind'] == 'instruction_reference'
                                                for s in current for l in s['links']),
    'current_unresolved_example_targets': sum(not l['exists'] and l['kind'] == 'example_asset_or_target'
                                            for s in current for l in s['links']),
    'current_command_examples': sum(len(s['command_examples']) for s in current),
    'registered_cli_api_methods': len(apis),
    'registered_api_endpoint_matches': dict(collections.Counter(a['state'] for a in apis)),
    'literal_shortcut_definitions': len(shortcuts),
    'mcp_upstream_catalog': len(TOOLS), 'mcp_included_catalog': sum(t['included'] for t in TOOLS),
    'mcp_domain_counts': dict(sorted(domain_counts.items())),
    'limits': ['Endpoint matches do not prove parameter/response equivalence or live permissions.',
               'No-exact-endpoint is not proof no equivalent composition exists.',
               'Static shortcut extraction is a source index, not a full Go call graph.',
               'No business writes or full live read/write acceptance performed.']}

save('summary.json', summary)
save('skill-inventory.json', {'current': current, 'baseline': baseline, 'diff': diffs})
save('cli-api-comparison.json', apis)
save('shortcut-evidence.json', shortcuts)
save('mcp-catalog.json', TOOLS)
routes = {'docs': 'lark-doc', 'docx': 'lark-doc', 'drive': 'lark-drive', 'wiki': 'lark-wiki',
          'base': 'lark-base', 'bitable': 'lark-base', 'sheets': 'lark-sheets',
          'calendar': 'lark-calendar', 'contact': 'lark-contact', 'authen': 'lark-shared',
          'im': 'lark-im', 'mail': 'lark-mail', 'task': 'lark-task', 'approval': 'lark-approval',
          'attendance': 'lark-attendance', 'okr': 'lark-okr', 'board': 'lark-whiteboard',
          'vc': 'lark-meeting', 'minutes': 'lark-meeting'}
route_rows = []
for tool in TOOLS:
    if not tool['included']:
        continue
    skill = routes.get(tool['project'], 'lark-openapi-explorer')
    if tool['name'] == 'search.v2.message.create':
        skill = 'lark-im'
    route_rows.append({**tool, 'skill': skill, 'fallback_skill': 'lark-openapi-explorer',
                       'verification': 'catalog_only_not_live_business_acceptance'})
assert len(route_rows) == len({r['name'] for r in route_rows}) == 503
assert all(r['skill'] in new for r in route_rows)
save('mcp-routing.json', route_rows)
print(json.dumps({k: v for k, v in summary.items() if k != 'mcp_domain_counts'}, ensure_ascii=False, indent=2))
