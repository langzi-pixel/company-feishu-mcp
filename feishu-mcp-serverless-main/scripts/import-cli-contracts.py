"""Import pinned public API contracts, never credentials or local CLI config."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

REVISION = '32e14dea9041e7876c8b41aead963b10866267d1'
root = Path(sys.argv[1]).resolve()
assert subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip() == REVISION
target = Path(__file__).resolve().parents[1] / 'src' / 'generated'
target.mkdir(exist_ok=True)
operations = []
excluded = []
for file in sorted((root / 'internal/registry/catalog/services').glob('*.json')):
    service = json.loads(file.read_text())
    for resource, entry in service['resources'].items():
        for method, spec in entry['methods'].items():
            name = f'cli.{service["name"]}.{resource}.{method}'
            if 'user' not in spec.get('accessTokens', []):
                override = 'im.v1.chat.create' if name == 'cli.im.chats.create' else None
                excluded.append({'name': name, 'reason': 'covered_by_verified_user_override' if override else 'requires_application_identity', 'source': str(file.relative_to(root)), **({'replacement': override} if override else {})})
                continue
            path = spec['path']
            if not path.startswith('/'):
                path = service['servicePath'].rstrip('/') + '/' + path
            operations.append({'name': name, 'project': service['name'], 'path': path,
                'httpMethod': spec['httpMethod'], 'description': spec['description'],
                'risk': spec.get('risk', 'write'), 'scopes': spec.get('scopes', []),
                'parameters': spec.get('parameters', {}), 'requestBody': spec.get('requestBody', {}),
                'responseBody': spec.get('responseBody', {}), 'docUrl': spec.get('docUrl'),
                'source': str(file.relative_to(root)),
                'source_sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
(target / 'cli-contracts.json').write_text(json.dumps({'revision': REVISION, 'operations': operations, 'excluded': excluded}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'operations': len(operations), 'application_only': sum(e['reason'] == 'requires_application_identity' for e in excluded), 'user_overrides': sum(e['reason'] == 'covered_by_verified_user_override' for e in excluded)}))
