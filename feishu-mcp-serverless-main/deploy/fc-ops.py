#!/usr/bin/env python3
"""Feishu MCP FC operations. Uses the existing Aliyun CLI profile; no credentials in reports."""
import argparse
import copy
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.request

REGION = os.environ.get('FEISHU_FC_REGION', 'your-region')
PROJECT = os.environ.get('FEISHU_SLS_PROJECT', 'your-log-project')
DOMAIN = os.environ.get('FEISHU_MCP_DOMAIN', 'mcp.example.com')
FUNCTIONS = ('feishu-mcp',)

def cli(args, body=None, missing=False):
    filename = None
    try:
        if body is not None:
            fd, filename = tempfile.mkstemp(prefix='mcp-ops-', suffix='.json')
            with os.fdopen(fd, 'w') as f:
                json.dump(body, f)
            args = [*args, '--body-file', filename]
        p = subprocess.run(['aliyun', *args], capture_output=True, text=True)
        if p.returncode:
            if missing and any(x in p.stderr for x in ('NotFound', 'NotExist')):
                return None
            # Cloud error bodies can echo sensitive configuration.
            raise RuntimeError('Aliyun operation failed: ' + ' '.join(args[:3]))
        result = json.loads(p.stdout) if p.stdout.strip() else {}
        if isinstance(result, dict) and result.get('Success') is False:
            raise RuntimeError('Aliyun API rejected operation: ' + str(result.get('Code')))
        return result
    finally:
        if filename:
            os.unlink(filename)

def fc(method, path, body=None):
    return cli(['fc', method, '/2023-03-30/' + path, '--region', REGION], body)

def sls(action, name, body=None, missing=False):
    return cli(['sls', action, '--region', REGION, '--endpoint', REGION + '.log.aliyuncs.com', '--project', PROJECT, '--logstore', name], body, missing)

def configure():
    for name in FUNCTIONS:
        store = sls('GetLogStore', name, missing=True)
        if store is None:
            # CreateLogStore takes the store name in its body, not in the path.
            cli(['sls', 'CreateLogStore', '--region', REGION, '--endpoint', REGION + '.log.aliyuncs.com', '--project', PROJECT],
                {'logstoreName': name, 'ttl': 7, 'shardCount': 1, 'autoSplit': False})
        index = sls('GetIndex', name, missing=True)
        body = copy.deepcopy(index or {'line': {'caseSensitive': False, 'token': [' ', '\t', ',', ':', '"']}, 'keys': {}})
        keys = body.setdefault('keys', {})
        for field in ('message', 'requestId', 'functionName', 'serviceName', 'qualifier', 'versionId', 'method', 'requestMethod', 'hasFunctionError', 'isColdStart', 'event', 'operation', 'outcome', 'request_id'):
            keys.setdefault(field, {'type': 'text', 'doc_value': True, 'caseSensitive': False, 'token': [' ', '\t', ',', ':', '"']})
            keys[field]['doc_value'] = True
        for field in ('statusCode', 'durationMs', 'duration_ms', 'status', 'memoryUsageMB', 'memoryLimitMB'):
            keys.setdefault(field, {'type': 'double', 'doc_value': True})
            keys[field]['doc_value'] = True
        sls('UpdateIndex' if index else 'CreateIndex', name, body)
        verified = sls('GetIndex', name)
        assert all(verified['keys'][f]['doc_value'] for f in keys)
        print(json.dumps({'logstore': name, 'indexed_fields': len(keys), 'retention_days': sls('GetLogStore', name)['ttl']}))

def alarms():
    account = cli(['sts', 'GetCallerIdentity'])['AccountId']
    for name in FUNCTIONS:
        metrics = [('FunctionFunctionErrors', 1), ('FunctionServerErrors', 1), ('FunctionHTTPStatus5xx', 3), ('FunctionConcurrencyThrottles', 1), ('FunctionResourceThrottles', 1), ('FunctionMaxDuration', 55000)]
        for metric, threshold in metrics:
            meta = cli(['cms', 'DescribeMetricMetaList', '--Namespace', 'acs_fc', '--MetricName', metric])['Resources']['Resource']
            assert meta and 'Value' in meta[0]['Statistics']
            rule = name + '-' + metric
            dimensions = [{'userId': str(account), 'region': REGION, 'serviceName': '', 'functionName': name}]
            args = ['cms', 'PutResourceMetricRule', '--RuleId', rule, '--RuleName', rule,
                    '--Namespace', 'acs_fc', '--MetricName', metric, '--Resources', json.dumps(dimensions),
                    '--ContactGroups', '云账号报警联系人', '--Period', '60', '--Interval', '60', '--SilenceTime', '3600', '--NoDataPolicy', 'OK',
                    '--Escalations.Warn.ComparisonOperator', 'GreaterThanOrEqualToThreshold', '--Escalations.Warn.Statistics', 'Value',
                    '--Escalations.Warn.Threshold', str(threshold), '--Escalations.Warn.Times', '1']
            cli(args)
            print(json.dumps({'rule': rule, 'threshold': threshold}))

def snapshot(name, directory):
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(directory, 0o700)
    data = {'function': fc('GET', 'functions/' + name), 'domain': fc('GET', 'custom-domains/' + DOMAIN), 'aliases': fc('GET', 'functions/' + name + '/aliases'), 'triggers': fc('GET', 'functions/' + name + '/triggers')}
    dest = directory / (name + '-' + str(time.time_ns()) + '.json')
    fd = os.open(dest, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as f:
        json.dump(data, f)
    version = fc('POST', 'functions/' + name + '/versions', {'description': 'Rollback baseline before observability update'})
    print(json.dumps({'function': name, 'rollback_version': version['versionId'], 'private_snapshot': str(dest)}))

def release(name, revision, version=None):
    base = 'functions/' + name
    if version is None:
        latest = fc('GET', base)
        assert revision and revision in latest['description'], 'LATEST revision does not match'
        version = fc('POST', base + '/versions', {'description': 'Verified source ' + revision})['versionId']
    # Re-read shared routes immediately before mutation; change only this function.
    domain = fc('GET', 'custom-domains/' + DOMAIN)
    old_routes = copy.deepcopy(domain['routeConfig'])
    aliases = fc('GET', base + '/aliases').get('aliases', [])
    old = next((a for a in aliases if a['aliasName'] == 'prod'), None)
    body = {'versionId': str(version), 'description': 'Production MCP', 'additionalVersionWeight': {}}
    fc('PUT' if old else 'POST', base + ('/aliases/prod' if old else '/aliases'), body if old else {**body, 'aliasName': 'prod'})
    trigger = fc('GET', base + '/triggers/http')
    try:
        routes = copy.deepcopy(old_routes)
        assert any(r['functionName'] == name for r in routes['routes'])
        for route in routes['routes']:
            if route['functionName'] == name:
                route['qualifier'] = 'prod'
        fc('PUT', 'custom-domains/' + DOMAIN, {'routeConfig': routes})
        fc('PUT', base + '/triggers/http', {'qualifier': 'prod', 'triggerConfig': trigger['triggerConfig']})
        health = None
        for _ in range(12):
            try:
                with urllib.request.urlopen('https://' + DOMAIN + '/' + name.replace('-mcp', '') + '/healthz', timeout=15) as response:
                    health = json.load(response)
                if health.get('status') == 'ok' and (not revision or health.get('revision') == revision):
                    break
            except Exception:
                pass
            time.sleep(3)
        else:
            raise RuntimeError('Production health or revision did not match')
        actual = fc('GET', 'custom-domains/' + DOMAIN)['routeConfig']
        assert actual == routes, 'Domain routes differ after update'
        assert fc('GET', base + '/aliases/prod')['versionId'] == str(version)
        print(json.dumps({'function': name, 'production_version': version, 'previous_version': old['versionId'] if old else None, 'health': health}))
    except Exception:
        if old:
            fc('PUT', base + '/aliases/prod', {k: old[k] for k in ('versionId', 'description', 'additionalVersionWeight') if k in old})
        fc('PUT', 'custom-domains/' + DOMAIN, {'routeConfig': old_routes})
        fc('PUT', base + '/triggers/http', {'qualifier': trigger['qualifier'], 'triggerConfig': trigger['triggerConfig']})
        raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['configure', 'alarms', 'snapshot', 'release', 'rollback'])
    parser.add_argument('--function', choices=FUNCTIONS)
    parser.add_argument('--revision')
    parser.add_argument('--version')
    parser.add_argument('--snapshot-dir', type=Path)
    args = parser.parse_args()
    if args.action == 'configure': configure()
    elif args.action == 'alarms': alarms()
    else:
        assert args.function, '--function is required'
        if args.action == 'snapshot':
            assert args.snapshot_dir, '--snapshot-dir is required'
            snapshot(args.function, args.snapshot_dir)
        elif args.action == 'release': release(args.function, args.revision)
        else:
            assert args.version, '--version is required'
            release(args.function, None, args.version)
