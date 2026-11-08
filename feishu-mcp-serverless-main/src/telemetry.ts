import { AsyncLocalStorage } from 'node:async_hooks';
import { performance } from 'node:perf_hooks';

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();
// Deliberate allowlist: never include arguments, resource IDs, responses or tokens.
export function logTiming(event: string, started: number, fields: { operation?: string; outcome?: string; status?: number; profile?: string } = {}) {
  console.info(JSON.stringify({ event, request_id: requestContext.getStore()?.requestId,
    duration_ms: Math.round(performance.now() - started), ...fields }));
}
export async function timed<T>(event: string, operation: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try { const result = await fn(); logTiming(event, start, { operation, outcome: 'ok' }); return result; }
  catch (error) { logTiming(event, start, { operation, outcome: 'error' }); throw error; }
}
