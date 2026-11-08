import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export class ToolError extends Error {
  constructor(readonly kind: string, message: string, readonly details: Record<string, unknown> = {}) { super(message); }
}
export function classifyError(error: unknown): ToolError {
  if (error instanceof ToolError) return error;
  const e = error as any;
  const data = e?.response?.data ?? e;
  const code = Number(data?.code);
  const status = e?.response?.status;
  const msg = String(data?.msg ?? data?.message ?? (typeof data === 'string' ? data : ''));
  const requiredScopes = (Array.isArray(data?.error?.permission_violations) ? data.error.permission_violations : []).map((v:any)=>v.subject).filter((s:unknown)=>typeof s==='string' && /^[a-zA-Z0-9_.:-]{1,120}$/.test(s));
  const detail: Record<string, unknown> = { ...(Number.isFinite(code) ? { upstream_code: code } : {}), ...(requiredScopes.length ? {required_scopes:requiredScopes}: {}) };
  if (msg === 'reauthorize' || status === 401 || [99991663,99991664,99991668,99991669,99991671,99991677].includes(code))
    return new ToolError('reauthorization_required', '飞书登录已失效，请重新连接飞书。', detail);
  if ([99991672,99991679].includes(code) || /scope|access denied.*permission|permission.*required/i.test(msg))
    return new ToolError('missing_scope', '缺少此操作的飞书应用或用户授权权限；开通所需权限后重新连接。', detail);
  if (status === 403 || /forbidden|permission denied|no permission|not have.*permission/i.test(msg))
    return new ToolError('resource_forbidden', '当前用户无权访问或修改此资源，请检查资源分享与应用权限。', detail);
  if (status === 429 || code === 99991400 || /rate.?limit|frequency|too many requests/i.test(msg)) {
    const retry = Number(e?.response?.headers?.['retry-after']);
    return new ToolError('rate_limited', '飞书请求频率受限，请稍后重试。', { ...detail, ...(Number.isFinite(retry) && retry > 0 ? { retry_after_seconds: retry } : {}) });
  }
  if (e?.code === 'ECONNABORTED' || e?.code === 'ETIMEDOUT' || e?.name === 'TimeoutError' || /timeout|timed out/i.test(msg))
    return new ToolError('upstream_timeout', '飞书请求超时。写入结果可能尚未确认，请先读取核对，勿直接重复写入。', detail);
  if (status === 404 || /not found|not exist|notfound/i.test(msg))
    return new ToolError('resource_not_found', '资源不存在、已删除或对当前用户不可见，请核对链接。', detail);
  if (status >= 500 || ['ECONNRESET','ENOTFOUND','EAI_AGAIN'].includes(e?.code))
    return new ToolError('upstream_unavailable', '飞书或网络暂不可用。写入请先核对结果再决定是否重试。', detail);
  // Keep useful business codes, but never echo arbitrary exception/request objects.
  return new ToolError('upstream_error', '飞书未完成此操作，请根据业务错误码检查参数、权限和资源。', detail);
}
export function errorResult(error: unknown, challenge: string): CallToolResult {
  const e = classifyError(error);
  return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: e.kind, message: e.message, ...e.details }) }],
    ...(e.kind === 'reauthorization_required' ? { _meta: { 'mcp/www_authenticate': [challenge + ', error="invalid_token", error_description="Reconnect your Feishu account"'] } } : {}) };
}
