import { z } from 'zod';
import type { McpTool } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/types/index.js';
import { AllToolsZh } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/tools/index.js';

// Contract source: larksuite/cli 32e14dea, shortcuts/sheets/sheet_ai_api.go.
// Read and write endpoints have separate scopes and gateway enforcement.
export const supplementalTools: McpTool[] = [
  ...(['read','write'] as const).map(kind=>({name:`sheets.v2.tools.${kind}`,project:'sheets',accessTokens:['user'],httpMethod:'POST',
    path:`/open-apis/sheet_ai/v2/spreadsheets/:spreadsheet_token/tools/invoke_${kind}`,
    description:kind==='read'?'读取电子表格单元格、公式、图表及结构。tool_name 如 get_workbook_structure、get_cell_ranges、get_range_as_csv；input 为对应操作的 JSON 对象。':'修改电子表格单元格、公式、格式、图表、透视及结构。tool_name 如 set_cell_range、batch_update、modify_sheet_structure；input 为对应操作 JSON；部分成功不自动回滚。',
    schema:{path:z.object({spreadsheet_token:z.string().regex(/^[A-Za-z0-9_-]+$/).max(200)}).strict(),data:z.object({tool_name:z.string().regex(/^[a-z][a-z0-9_]{0,99}$/),input:z.record(z.unknown())}).strict()}
  } as McpTool)),
  // The current CLI Shortcut identity declarations explicitly support user on
  // these exact endpoints; old SDK metadata predates that support. Never widen
  // unrelated tenant-only tools. Sources: shortcuts/im/im_messages_send.go,
  // im_messages_reply.go, im_chat_messages_list.go, im_chat_create.go (32e14dea).
  ...(AllToolsZh as McpTool[]).filter(t=>['im.v1.message.create','im.v1.message.reply','im.v1.message.list','im.v1.chat.create'].includes(t.name)).map(t=>({...t,accessTokens:['user'] as any})),
];
