"""Build full 28-module plugin and five-entry MCP import snapshot.

Usage: python3 scripts/build-plugin.py PINNED_CLI_SOURCE [BASELINE_SKILLS_TREE]
No account operations, network calls, or deployment. All source decisions are
recorded; upstream CLI examples are reference data, never shell instructions.
"""
from pathlib import Path
import base64
import hashlib
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CLI = Path(sys.argv[1]).resolve()
REV = '32e14dea9041e7876c8b41aead963b10866267d1'
assert subprocess.check_output(['git', '-C', str(CLI), 'rev-parse', 'HEAD'], text=True).strip() == REV
MODULES = json.loads((ROOT/'plugin-src/modules.json').read_text())
OUT = ROOT/'plugins/feishu-workspace'
OUT.mkdir(parents=True, exist_ok=True)
SCAN = ROOT/'plugin-scan'
GROUPS = {
    'feishu-content': ['doc','drive','wiki','markdown','whiteboard'],
    'feishu-data': ['base','sheets','slides'],
    'feishu-collaboration': ['calendar','contact','im','mail','task','workflow-standup-report'],
    'feishu-meetings': ['meeting','vc','vc-agent','minutes','note','workflow-meeting-summary'],
    'feishu-operations': ['shared','approval','attendance','okr','apps','event','openapi-explorer','skill-maker']
}
GROUP_DESCS = {
    'feishu-content':'搜索、读取和编辑飞书文档、知识库、云盘文件、Markdown 与画板。',
    'feishu-data':'操作飞书多维表格、电子表格与幻灯片，包括数据、公式、结构和演示内容。',
    'feishu-collaboration':'查询和管理飞书日程、联系人、聊天、邮件与任务，生成工作安排摘要。',
    'feishu-meetings':'检索飞书会议、妙记、会议笔记与逐字稿，整理有来源的会议总结。',
    'feishu-operations':'处理飞书审批、考勤、OKR、应用与事件，诊断连接并查找其他操作。'
}
COMMON = '''## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。
'''

def write(p, text):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')

def dump(p, obj):
    write(p, json.dumps(obj, ensure_ascii=False, indent=2)+'\n')

def front(name, description):
    return '---\nname: '+name+'\ndescription: '+json.dumps(description,ensure_ascii=False)+'\n---\n\n'

def strip_front(text):
    return re.sub(r'\A---\n.*?\n---\n', '', text, count=1, flags=re.S)

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

interface = {'displayName':'飞书工作台','shortDescription':'文档、数据与协作的完整飞书工作流',
    'longDescription':'搜索和编辑飞书资料，处理多维表格、电子表格、日程、消息、邮件、任务、审批与会议，按实际工具能力完成操作并核对结果。',
    'developerName':'Feishu MCP contributors','category':'Productivity','capabilities':['Read','Write'],
    'defaultPrompt':['整理我明天的日程和未完成任务','查找并总结指定飞书文档','核对这个多维表格的结构和记录']}
identity={'name':'feishu-workspace','version':'0.4.0','description':'飞书文档、数据、协作与会议工作流',
    'author':{'name':'Feishu MCP contributors'},'license':'MIT'}
dump(OUT/'plugin.json', {'$schema':'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',**identity,
    'extensions':{'com.openai':{'interface':interface}}})
dump(OUT/'.codex-plugin/plugin.json',{**identity,'skills':'./skills/','interface':interface})
dump(OUT/'mcp.json',{'$schema':'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    'mcpServers':{'feishu':{'type':'streamable-http','url':'https://mcp.example.com/feishu/mcp'}}})
shutil.copyfile(ROOT/'LICENSE', OUT/'LICENSE')
write(OUT/'THIRD_PARTY_NOTICES.md', '# Sources\n\nBusiness references adapted from larksuite/cli at '+REV+'.\n\n'+(CLI/'LICENSE').read_text())

catalog=json.loads(subprocess.check_output(['node','--import','tsx','scripts/export-plugin-catalog.ts'],cwd=ROOT,text=True))
trace=[]
for name, module in MODULES.items():
    folder=OUT/'skills'/name
    upstream=CLI/'skills'/name
    assert upstream.is_dir(), name
    # Keep every reference/asset available. Pure computation scripts are retained;
    # callers of CLI or subprocess are source references, not runnable helpers.
    rename={}
    for source in sorted(upstream.rglob('*')):
        if not source.is_file(): continue
        rel=source.relative_to(upstream)
        if str(rel)=='SKILL.md': rel=Path('workflow-reference.md')
        raw=source.read_bytes()
        if source.suffix=='.py' and re.search(rb'subprocess|lark.cli|os\.system|requests\.',raw):
            rel=Path(str(rel)+'.txt')
        rename[str(source.relative_to(upstream))]=str(rel)
    for source in sorted(upstream.rglob('*')):
        if not source.is_file(): continue
        source_rel=str(source.relative_to(upstream)); dest=folder/rename[source_rel]
        raw=source.read_bytes()
        decision='retain_format_reference_or_asset'
        if source.suffix=='.md':
            body=strip_front(raw.decode())
            body=re.sub(r'```(?:bash|sh|shell|zsh)', '```text', body)
            for old,new in rename.items():
                if old!=new and old!='SKILL.md': body=body.replace(old,new)
            body='> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。\n\n'+body
            write(dest,body)
            decision='business_reference_with_mcp_execution_contract'
        else:
            dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(raw)
            if str(dest).endswith('.py.txt'):decision='source_reference_cli_runtime_replaced'
        trace.append({'version':'current','source':str(source.relative_to(CLI)), 'source_sha256':digest(raw),
            'target':str(dest.relative_to(ROOT)), 'decision':decision})
    selected=[t for t in catalog if '*' in module['projects'] or t['project'] in module['projects']]
    tools_body='# 工具与合同\n\n运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。\n\n'
    tools_body+='| 名称 | 操作 | 调用 |\n|---|---|---|\n'
    for t in selected:
        tools_body+=f'| `{t["name"]}` | {t["description"].replace(chr(10)," ").replace("|","/")} | {"feishu_read_tool" if t["read_only"] else "feishu_call_tool"} |\n'
    write(folder/'references/mcp-tools.md',tools_body)
    body=front(name,module['description'])+'# '+name.removeprefix('lark-')+'\n\n'+COMMON+'\n## 任务流程\n\n'
    body+='\n\n'.join(f'{i}. {s}' for i,s in enumerate(module['instructions'],1))
    body+='\n\n## 按需参考\n\n- [工具与合同](references/mcp-tools.md)：寻找领域内具体操作，参数以实时 schema 为准。\n- [业务参考索引](workflow-reference.md)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。\n'
    write(folder/'SKILL.md',body)
    write(folder/'agents/openai.yaml','interface:\n  display_name: '+json.dumps(name,ensure_ascii=False)+'\n  short_description: '+json.dumps(module['description'],ensure_ascii=False)+'\ndependencies:\n  tools:\n    - type: "mcp"\n      value: "feishu"\n      description: "飞书资料与协作工具"\n      transport: "streamable_http"\n      url: "https://mcp.example.com/feishu/mcp"\n')

# Preserve baseline-only references under their current module, not another active
# skill. Never overwrite current guidance with old interface assumptions.
if len(sys.argv)>2:
    baseline=Path(sys.argv[2]).resolve()
    for source in sorted((baseline/'skills').rglob('*')):
        if not source.is_file():continue
        rel=source.relative_to(baseline/'skills'); current=CLI/'skills'/rel
        if current.exists():
            target=OUT/'skills'/rel.parts[0]/('workflow-reference.md' if rel.name=='SKILL.md' and len(rel.parts)==2 else Path(*rel.parts[1:]))
            decision='superseded_by_current_contract_and_module'
        else:
            target=OUT/'skills'/rel.parts[0]/'references/baseline'/Path(*rel.parts[1:])
            raw=source.read_bytes()
            if source.suffix=='.md':
                text=strip_front(raw.decode()).replace('```bash','```text')
                def baseline_link(match):
                    label,url=match.groups();plain=url.split('#')[0];frag=('#'+url.split('#',1)[1]) if '#' in url else ''
                    if not plain or re.match(r'[A-Za-z][A-Za-z0-9+.-]*:',plain) or plain.startswith('/'):return match.group(0)
                    old=(source.parent/plain).resolve()
                    try: oldrel=old.relative_to(baseline/'skills')
                    except ValueError:return match.group(0)
                    candidate=OUT/'skills'/oldrel
                    if (CLI/'skills'/oldrel).exists():
                        if not candidate.exists() and Path(str(candidate)+'.txt').exists():candidate=Path(str(candidate)+'.txt')
                    else:candidate=OUT/'skills'/oldrel.parts[0]/'references/baseline'/Path(*oldrel.parts[1:])
                    if oldrel.name=='lark-vc-notes.md':candidate=OUT/'skills/lark-meeting/references/lark-note-detail.md'
                    return '['+label+']('+os.path.relpath(candidate,target.parent)+frag+')'
                text=re.sub(r'\[([^\]]+)\]\(([^\s)]+)\)',baseline_link,text)
                # A nested [] inside the old create example defeats a flat link
                # label parser; this is a verified legacy reference relocation.
                if source.name=='lark-slides-xml-presentation-slide-create.md':
                    text=text.replace('](lark-slides-create.md#','](../../lark-slides-create.md#')
                write(target,'> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。\n\n'+text)
            else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
            decision='retained_baseline_only_business_reference'
        if not target.exists() and Path(str(target)+'.txt').exists():target=Path(str(target)+'.txt')
        trace.append({'version':'v1.0.74','source':str(source.relative_to(baseline)), 'source_sha256':digest(source.read_bytes()),'target':str(target.relative_to(ROOT)),'decision':decision})

    for name in MODULES:
        extras=[r for r in trace if r['version']=='v1.0.74' and r['decision']=='retained_baseline_only_business_reference' and r['source'].split('/')[1]==name]
        if extras:
            folder=OUT/'skills'/name
            with (folder/'SKILL.md').open('a') as stream:
                stream.write('\n旧名或旧流程细节仍需要时，读取[兼容参考](references/baseline-index.md)。\n')
            write(folder/'references/baseline-index.md','# 兼容参考\n\n'+''.join('- ['+Path(r['source']).name+']('+os.path.relpath(ROOT/r['target'],folder/'references')+')\n' for r in extras))

dump(ROOT/'plugin-src/migration.json',trace)
dump(ROOT/'plugin-src/tool-routing.json',[{**t,'skills':[n for n,m in MODULES.items() if '*' not in m['projects'] and t['project'] in m['projects']] or ['lark-openapi-explorer']} for t in catalog])

# Compact only the import representation: one chapter per original file, with
# stable source anchors and rewritten local links. All 28 modules are retained.
entries=[];resources={};scan_trace=[]
for group,short_names in GROUPS.items():
    members=['lark-'+s for s in short_names]; dest=SCAN/group; paths={}; chunks={}; sizes={}
    for member in members:
        folder=OUT/'skills'/member
        n=0
        for f in sorted(folder.rglob('*')):
            if not f.is_file() or f.name=='openai.yaml':continue
            raw=f.read_bytes()
            # Keep scripts and binary/XML/JSON assets as real separate files.
            if f.suffix not in ('.md','.txt'):
                target='assets/'+member+'/'+str(f.relative_to(folder)); paths[f.resolve()]=(target,'')
                (dest/target).parent.mkdir(parents=True,exist_ok=True);(dest/target).write_bytes(raw)
                continue
            chapter='<a id="s-'+digest(str(f.relative_to(OUT)).encode())[:16]+'"></a>\n\n## '+str(f.relative_to(folder))+'\n\n'
            key=f'references/{member}-{n}.md'
            if sizes.get(key,0)+len(raw)+len(chapter.encode())>700000:
                n+=1;key=f'references/{member}-{n}.md'
            anchor=re.search(r'id="([^"]+)"',chapter).group(1)
            paths[f.resolve()]=(key,anchor);chunks.setdefault(key,[]).append((f,chapter));sizes[key]=sizes.get(key,0)+len(raw)+len(chapter.encode())
    for key,parts in chunks.items():
        contents=[]
        for source,chapter in parts:
            text=strip_front(source.read_text())
            def link(match):
                url=match.group(1);plain=url.split('#')[0]
                if not plain or re.match(r'[A-Za-z][A-Za-z0-9+.-]*:',plain) or plain.startswith('/'):return match.group(0)
                original=(source.parent/plain).resolve()
                if original in paths:
                    file,anchor=paths[original];target=os.path.relpath(file,str(Path(key).parent))
                    return ']('+target+('#'+anchor if anchor else '')+')'
                # Cross-group skill links resolve through the portable full package
                # by name; cross-module references retain a pinned official source.
                if 'lark-' in plain:
                    return ']（按模块名读取对应工作流）'
                return match.group(0)
            text=re.sub(r'\]\(([^\s)]+)\)',link,text)
            contents.append(chapter+text)
            scan_trace.append({'source':str(source.relative_to(OUT)), 'group':group,'target':key,'anchor':paths[source.resolve()][1]})
        write(dest/key,'\n\n'.join(contents))
    body=front(group,GROUP_DESCS[group])+'# '+GROUP_DESCS[group]+'\n\n'+COMMON+'\n## 按任务读取模块\n\n'
    for member in members:
        f,anchor=paths[(OUT/'skills'/member/'SKILL.md').resolve()]
        body+=f'- [{member}]({f}#{anchor})：{MODULES[member]["description"]}\n'
    write(dest/'SKILL.md',body)
    files=sorted(p for p in dest.rglob('*') if p.is_file())
    assert len(files)<=100,(group,len(files))
    assert sum(f.stat().st_size for f in files)<=5*1024*1024
    manifest=[]
    for f in files:
        raw=f.read_bytes();rel=str(f.relative_to(dest));uri='skill://feishu-workspace/'+group+'/'+rel
        assert len(raw)<=(256*1024 if rel=='SKILL.md' else 1024*1024),f
        try: content={'text':raw.decode('utf-8')}
        except UnicodeDecodeError: content={'blob':base64.b64encode(raw).decode()}
        resources[uri]={'uri':uri,'mimeType':mimetypes.guess_type(str(f))[0] or 'text/plain',**content}
        manifest.append({'uri':uri,'digest':'sha256:'+digest(raw)})
    entries.append({'uri':'skill://feishu-workspace/'+group+'/SKILL.md','frontmatter':{'name':group,'description':GROUP_DESCS[group]},'resources':manifest})
dump(ROOT/'src/generated/skill-bundle.json',{'skills':entries,'resources':resources})
dump(ROOT/'plugin-src/scan-mapping.json',scan_trace)
build=ROOT/'.local/plugin-build';build.mkdir(parents=True,exist_ok=True)
for title,source in [('feishu-workspace',OUT),('feishu-skills-scan',SCAN)]:
    with zipfile.ZipFile(build/(title+'.zip'),'w',zipfile.ZIP_DEFLATED) as archive:
        for p in sorted(source.rglob('*')):
            if p.is_file():archive.write(p,str(Path(source.name)/p.relative_to(source)))
assert (build/'feishu-skills-scan.zip').stat().st_size<8*1024*1024
print(json.dumps({'skills':len(MODULES),'source_files':len(trace),'tools':len(catalog),'scan_skills':len(entries),'scan_files':[len(s['resources']) for s in entries],'archive':str(build/'feishu-workspace.zip')},ensure_ascii=False))
