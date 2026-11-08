import axios, { type AxiosInstance } from 'axios';
import { multipartFields } from './cli-contracts.js';
import { ToolError, classifyError } from './tool-errors.js';
import type { Config } from './config.js';
import type { McpTool } from '@larksuiteoapi/lark-mcp/dist/mcp-tool/types/index.js';

export function prepareContractRequest(tool:McpTool, args:any) {
  const path=tool.path!.replace(/:([a-zA-Z0-9_]+)/g,(_,key)=>{
    if(typeof args.path?.[key]!=='string' || !args.path[key] || ['.','..'].includes(args.path[key]) || /[\x00-\x1f]/.test(args.path[key]))throw new ToolError('invalid_arguments','无效路径参数 '+key);
    return encodeURIComponent(args.path[key]);
  });
  const files=multipartFields.get(tool.name);
  let data:any=args.data;
  if(tool.name.startsWith('sheets.v2.tools.')) {
    if(data.input.excel_id !== undefined && data.input.excel_id !== args.path.spreadsheet_token)
      throw new ToolError('invalid_arguments','input.excel_id 与目标 spreadsheet_token 不一致。');
    data={tool_name:data.tool_name,input:JSON.stringify({...data.input,excel_id:args.path.spreadsheet_token})};
  }
  if(files) {
    const form=new FormData();
    for(const [key,value] of Object.entries(args.data || {})) {
      if(value===undefined)continue;
      if(files.includes(key)) {
        const file=value as {filename:string;mime_type:string;base64:string};
        form.append(key,new Blob([Buffer.from(file.base64,'base64')],{type:file.mime_type}),file.filename);
      } else form.append(key,typeof value==='string'?value:JSON.stringify(value));
    }
    data=form;
  }
  return {method:tool.httpMethod,url:path,params:args.params,data};
}
export async function invokeContract(config:Config,token:string,tool:McpTool,args:any,http:AxiosInstance=axios) {
  const req=prepareContractRequest(tool,args);
  const response=await http.request({...req,url:config.feishuDomain+req.url,headers:{Authorization:`Bearer ${token}`},timeout:25000,maxRedirects:0,maxContentLength:4*1024*1024,maxBodyLength:2*1024*1024});
  const data=response.data;
  if(data?.code && data.code!==0)throw classifyError({response});
  if(!data || typeof data!=='object')throw new ToolError('unexpected_response','此接口未返回 JSON 结果；不能将下载响应当成已保存文件。');
  const result=data.data ?? data;
  if(tool.name.startsWith('sheets.v2.tools.') && typeof result.output==='string') {
    try {return {...result,output:result.output ? JSON.parse(result.output) : null};}
    catch {throw new ToolError('unexpected_response','表格操作返回无法解析的 output；写入结果需先核对。');}
  }
  return result;
}
