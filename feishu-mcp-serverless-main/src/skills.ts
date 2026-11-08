import { z } from 'zod';
import { ErrorCode, McpError, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import bundle from './generated/skill-bundle.json' with {type:'json'};

export const skillBundle=bundle;
const resources=new Map(Object.entries(bundle.resources));
const entries=new Map(bundle.skills.map(s=>[s.uri,s]));
const ListSkills=z.object({method:z.literal('skills/list'),params:z.object({cursor:z.string().optional()}).optional()});
const GetSkill=z.object({method:z.literal('skills/get'),params:z.object({uri:z.string()})});
export const skillCapabilities={resources:{},extensions:{'io.modelcontextprotocol/skills':{}}};

// Serve an immutable, embedded allowlist. No request URI reaches filesystem I/O.
export function installSkills(server:Server) {
  server.setRequestHandler(ListSkills, async request=>{
    if(request.params?.cursor)throw new McpError(ErrorCode.InvalidParams,'Unknown skills cursor');
    return {skills:bundle.skills};
  });
  server.setRequestHandler(GetSkill, async request=>{
    const skill=entries.get(request.params.uri);
    if(!skill)throw new McpError(ErrorCode.InvalidParams,'Unknown skill URI');
    return {skill};
  });
  server.setRequestHandler(ListResourcesRequestSchema, async request=>{
    const raw=request.params?.cursor;
    if(raw && !/^resources:[0-9]+$/.test(raw))throw new McpError(ErrorCode.InvalidParams,'Invalid resources cursor');
    const offset=raw?Number(raw.split(':')[1]):0;
    const all=[...resources.values()];
    if(!Number.isSafeInteger(offset)||offset<0||offset>all.length)throw new McpError(ErrorCode.InvalidParams,'Unknown resources cursor');
    const next=offset+50;
    return {resources:all.slice(offset,next).map(r=>({uri:r.uri,name:r.uri.split('/').at(-1)!,mimeType:r.mimeType})),...(next<all.length?{nextCursor:'resources:'+next}:{})};
  });
  server.setRequestHandler(ReadResourceRequestSchema,async request=>{
    const content=resources.get(request.params.uri);
    if(!content)throw new McpError(ErrorCode.InvalidParams,'Unknown resource URI');
    return {contents:[content]};
  });
}
