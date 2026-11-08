"""Check packaged coverage, migration targets, link integrity and import limits."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
import yaml

root=Path(__file__).resolve().parents[1]
plugin=root/'plugins/feishu-workspace'
modules=json.loads((root/'plugin-src/modules.json').read_text())
skills=sorted(p.parent.name for p in (plugin/'skills').glob('*/SKILL.md'))
assert skills==sorted(modules) and len(skills)==28
errors=[]
for folder in [plugin,root/'plugin-scan']:
    for p in folder.rglob('*'):
        assert not p.is_symlink(),p
        if not p.is_file() or p.suffix!='.md':continue
        fence=False
        for n,line in enumerate(p.read_text().splitlines(),1):
            if line.strip().startswith('```'):fence=not fence;continue
            if fence:continue
            for url in re.findall(r'\]\(([^\s)]+)\)',line):
                plain=url.split('#')[0]
                if not plain or re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:',plain) or plain.startswith('/'):continue
                if Path(plain).suffix in {'.md','.py','.txt','.json','.xml','.js','.jsx','.html'} and not (p.parent/plain).resolve().is_file():errors.append(f'{p.relative_to(root)}:{n} -> {plain}')
for p in (plugin/'skills').glob('*/SKILL.md'):
    front=yaml.safe_load(p.read_text().split('---',2)[1]);assert front['name']==p.parent.name;assert front['description']
    assert set(front)=={'name','description'}
trace=json.loads((root/'plugin-src/migration.json').read_text())
assert sum(t['version']=='current' for t in trace)==550
assert sum(t['version']=='v1.0.74' for t in trace)==437
for t in trace:
    if not (root/t['target']).is_file():errors.append('missing migration target '+t['target'])
routing=json.loads((root/'plugin-src/tool-routing.json').read_text())
catalog=json.loads(subprocess.check_output(['node','--import','tsx','scripts/export-plugin-catalog.ts'],cwd=root,text=True))
assert {r['name'] for r in routing}=={r['name'] for r in catalog}
assert len(routing)==len({r['name'] for r in routing})
assert all(s in modules for r in routing for s in r['skills'])
bundle=json.loads((root/'src/generated/skill-bundle.json').read_text())
for s in bundle['skills']:
    f=root/'plugin-scan'/s['frontmatter']['name']/'SKILL.md'
    assert yaml.safe_load(f.read_text().split('---',2)[1])==s['frontmatter']
    assert len(s['resources'])<=100
assert len(bundle['skills'])==5
assert not errors,'\n'.join(errors)
report={'skills':len(skills),'current_source_files':550,'baseline_source_files':437,'routed_tools':len(routing),'scan_skills':5,'scan_files':[len(s['resources']) for s in bundle['skills']],'broken_local_instruction_links':0,'status':'passed'}
(root/'.local/plugin-build/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
