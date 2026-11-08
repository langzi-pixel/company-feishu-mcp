import { z } from 'zod';
import type { McpTool } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/types/index.js';
import contracts from './generated/cli-contracts.json' with { type: 'json' };

type Field = { type?: string; required?: boolean; description?: string; properties?: Record<string, Field>; items?: Field; enum?: unknown[]; min?: string | number; max?: string | number; location?: string };
export const inlineFile = z.object({filename:z.string().min(1).max(200).regex(/^[^/\\\x00-\x1f]+$/),mime_type:z.string().max(100).default('application/octet-stream'),base64:z.string().min(4).max(1398104).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)}).strict().refine(f=>Buffer.from(f.base64,'base64').length<=1048576,'File exceeds 1 MiB');
// Preserve open JSON objects when the upstream contract deliberately supplies no
// properties. Known objects are strict: misspelled fields must not vanish silently.
export function contractField(field: Field): z.ZodTypeAny {
  let value: z.ZodTypeAny;
  switch (field.type) {
    case 'string': value = z.string(); break;
    case 'boolean': value = z.boolean(); break;
    case 'file': value = inlineFile; break;
    case 'integer': value = z.number().int().safe(); break;
    case 'number': case 'float': case 'float64': value = z.number().finite(); break;
    case 'object': value = field.properties && Object.keys(field.properties).length ? contractObject(field.properties) : z.record(z.unknown()); break;
    case 'array': case 'list': value = z.array(field.items ? contractField({...field.items, required:true}) : field.properties ? contractObject(field.properties) : z.unknown()); break;
    default: value = z.unknown();
  }
  if (value instanceof z.ZodNumber) {
    const min = Number(field.min), max = Number(field.max);
    if (field.min !== undefined && Number.isSafeInteger(min)) value = (value as z.ZodNumber).min(min);
    if (field.max !== undefined && Number.isSafeInteger(max)) value = (value as z.ZodNumber).max(max);
  }
  if (value instanceof z.ZodString) {
    const min = Number(field.min), max = Number(field.max);
    if (field.min !== undefined && Number.isSafeInteger(min) && min >= 0) value = (value as z.ZodString).min(min);
    if (field.max !== undefined && Number.isSafeInteger(max) && max >= 0) value = (value as z.ZodString).max(max);
  }
  // Keep the enum in the exported JSON schema, not only runtime refinements.
  if (field.enum?.length) {
    const literals=field.enum.map(v=>z.literal(v as string | number | boolean | null));
    const allowed=literals.length===1?literals[0]:z.union(literals as [z.ZodLiteral<any>,z.ZodLiteral<any>,...z.ZodLiteral<any>[]]);
    value=value.and(allowed);
  }
  if (field.description) value = value.describe(field.description);
  return field.required ? value : value.optional();
}
function contractObject(fields: Record<string, Field>) {
  return z.object(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, contractField(field)]))).strict();
}
export const cliContracts = contracts;
export const cliRisk = new Map(contracts.operations.map(t => [t.name, t.risk]));
export const multipartFields = new Map(contracts.operations.filter(t=>Object.values(t.requestBody as Record<string,Field>).some(f=>f.type==='file')).map(t=>[t.name,Object.entries(t.requestBody as Record<string,Field>).filter(([,f])=>f.type==='file').map(([n])=>n)]));
export const cliTools: McpTool[] = contracts.operations.map(op => {
  const path: Record<string, Field> = {}, params: Record<string, Field> = {};
  for (const [name, field] of Object.entries(op.parameters as Record<string, Field>)) {
    (field.location === 'path' ? path : params)[name] = field;
  }
  const schema: Record<string, z.ZodTypeAny> = {};
  if (Object.keys(path).length) schema.path = contractObject(path);
  if (Object.keys(params).length) schema.params = Object.values(params).some(f=>f.required) ? contractObject(params) : contractObject(params).optional();
  const body = op.requestBody as Record<string, Field>;
  if (Object.keys(body).length) schema.data = Object.values(body).some(f=>f.required) ? contractObject(body) : contractObject(body).optional();
  return {name:op.name, project:op.project, description:op.description, accessTokens:['user'],
    path:op.path.replace(/\{([^}]+)\}/g, ':$1'), httpMethod:op.httpMethod, schema} as McpTool;
});
