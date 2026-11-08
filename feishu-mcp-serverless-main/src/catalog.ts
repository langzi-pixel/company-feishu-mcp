import { createHash } from 'node:crypto';
import { AllToolsZh } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/tools/index.js';
import type { McpTool } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/types/index.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { cliTools, cliRisk } from './cli-contracts.js';
import { supplementalTools } from './supplemental-tools.js';
// Keep all upstream tools that can operate as the signed-in user. Unsupported
// binary transfer endpoints are excluded; their transport needs separate work.
export const originalCatalog: McpTool[] = (AllToolsZh as McpTool[]).filter(t=>t.accessTokens?.includes('user') && !t.supportFileUpload && !t.supportFileDownload).map(tool=>{
  if(tool.name!=='docx.v1.documentBlockDescendant.create')return tool;
  // Upstream 0.5.1 omits these required graph fields. Zod otherwise strips
  // convert's temporary IDs and Feishu rejects the tree with code 1770041.
  const data=tool.schema.data as z.AnyZodObject;
  const blocks=data.shape.descendants as z.ZodArray<z.AnyZodObject>;
  return {...tool,schema:{...tool.schema,data:data.extend({descendants:z.array(blocks.element.extend({
    block_id:z.string().min(1),children:z.array(z.string()).optional(),table_cell:z.object({}).optional()
  }))})}};
});
export const catalog: McpTool[] = [...originalCatalog, ...cliTools, ...supplementalTools];
export function exposedName(name: string) {
  const full = 'feishu_' + name.replace(/\./g,'_');
  return full.length <= 64 ? full : full.slice(0,53) + '_' + createHash('sha256').update(name).digest('hex').slice(0,10);
}

export const byName = new Map(catalog.flatMap(t => [[t.name,t], [exposedName(t.name),t]]));
export const profiles = ['daily','all','docs','bitable','calendar','tasks','messages','drive','wiki'] as const;
export type ToolProfile = typeof profiles[number];
export function annotationsFor(tool: McpTool) {
  // Attendance query is POST but only retrieves clock-in records. The pinned
  // registry's "write" classification is conservative, not a state mutation.
  const declared = tool.name==='cli.attendance.user_tasks.query' ? 'read' : cliRisk.get(tool.name);
  const readOnly = declared ? declared === 'read' : tool.httpMethod?.toUpperCase() === 'GET' || /\.(search|get|list|batchGet|query|read|mget|filter)$/.test(tool.name)
    || ['search.v2.message.create','docx.v1.document.convert','calendar.v4.calendar.primary','baike.v1.entity.match','baike.v1.entity.highlight','lingo.v1.entity.match','lingo.v1.entity.highlight'].includes(tool.name);
  const boundedCreate = /^bitable\.v1\.(app|appTable|appTableField|appTableView|appTableRecord)\.(create|batchCreate|copy)$/.test(tool.name)
    || ['docx.v1.document.create','docx.v1.documentBlockChildren.create','docx.v1.documentBlockDescendant.create','docx.builtin.import','drive.v1.file.createFolder'].includes(tool.name);
  return { readOnlyHint:readOnly, destructiveHint:!readOnly && !boundedCreate, idempotentHint:readOnly,
    openWorldHint: !readOnly && (['mail','im','helpdesk'].includes(tool.project) || /permission|Acl|collaboration|share|invite|Attendee|transferOwner/i.test(tool.name) || tool.project === 'calendar') };
}

const domainAliases: Record<string,string[]> = {
  calendar:['日历','日程','会议室','忙闲'], docx:['文档','正文'], docs:['文档','正文'],
  bitable:['多维表格','记录','字段'], base:['多维表格','仪表盘','工作流'], sheets:['电子表格','单元格','公式'],
  slides:['幻灯片','演示文稿','ppt'], im:['聊天','消息','群聊'], mail:['邮件','邮箱'], drive:['云盘','文件','权限','评论'],
  wiki:['知识库','知识空间'], contact:['联系人','通讯录'], task:['任务','待办'],
  approval:['审批'], attendance:['考勤','打卡'], okr:['目标','关键结果'], vc:['会议','录制'], minutes:['妙记','逐字稿']
};
const actionAliases: Record<string,string[]> = {
  read:['查看','读取','查询','搜索','列表','查找'], write:['创建','新建','添加','发送','回复','修改','更新','删除','移动'],
};
export function searchCatalog(query:string, project?:string, access:'all'|'read'|'write'='all') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return catalog.map(tool=>{
    const read = annotationsFor(tool).readOnlyHint;
    if ((project && tool.project !== project) || (access==='read'&&!read) || (access==='write'&&read)) return {tool,score:-1};
    const text=(tool.name+' '+tool.description).toLowerCase();
    const aliases=domainAliases[tool.project] || [];
    let score=0;
    for (const word of words) {
      if (tool.name.toLowerCase()===word) {score+=100;continue;}
      if (text.includes(word)) {score+=20;continue;}
      const domains=aliases.filter(a=>word.includes(a));
      const rest=domains.reduce((s,a)=>s.replace(a,''),word);
      const actionWords:Record<string,RegExp>={发送:/send|message\.create/,回复:/reply/,删除:/delete|remove/,修改:/update|patch|edit/,更新:/update|patch|edit/,新建:/create/,创建:/create/,查询:/get|list|query|search|read/,搜索:/search|query/,读取:/get|read/,查看:/get|list|read/,列表:/list/,添加:/add|create/};
      const action=actionWords[rest];
      if (domains.length && (!rest || text.includes(rest) || (action ? action.test(text) : actionAliases[read?'read':'write'].some(a=>rest===a)))) {score+=10+(rest&&text.includes(rest)?10:0);continue;}
      return {tool,score:-1};
    }
    // A general calendar/document query should not rank deletion of a nested
    // participant ahead of listing the primary object.
    if (read) score+=2;
    if (/\.(list|search|query|get)$/.test(tool.name)) score+=2;
    if (/Attendee|permission|collaboration|reaction|participant/i.test(tool.name)) score-=1;
    return {tool,score};
  }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score || a.tool.name.localeCompare(b.tool.name)).map(x=>x.tool);
}
export function nativeTools(profile: ToolProfile) {
  if (profile === 'all') return catalog;
  const groups: Record<string,string[]> = { docs:['docs','docx'], bitable:['bitable','base'], calendar:['calendar'],tasks:['task'],messages:['im','mail'],drive:['drive'],wiki:['wiki'] };
  return catalog.filter(t => groups[profile]?.includes(t.project));
}
const schemas = new Map<string, ReturnType<typeof zodToJsonSchema>>();
export function nativeSchema(tool: McpTool) {
  let schema = schemas.get(tool.name);
  if (!schema) {
    const { useUAT: _, ...shape } = tool.schema;
    schema = zodToJsonSchema(z.object(shape), { $refStrategy:'root' });
    schemas.set(tool.name, schema);
  }
  return schema;
}
