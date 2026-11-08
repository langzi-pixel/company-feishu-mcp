# ChatGPT 接入与工具设计（v0.3）

## 接入目标

面向 ChatGPT 自定义远程 MCP 插件：公开 HTTPS、Streamable HTTP、OAuth discovery / DCR / PKCE S256 / resource、用户身份执行、准确工具标注、明确输入输出及错误恢复。无 UI 组件，不需要嵌入式组件 CSP。

这是技术兼容性与真实连接验收，不代表已获得 OpenAI 应用目录审核批准。公开提交还需要发布者身份验证、隐私政策、审核账号及平台审核。

官方依据（2026-09-15）：

- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/guides/optimize-metadata
- https://developers.openai.com/plugins/deploy/connect-chatgpt
- https://developers.openai.com/plugins/deploy/app-review

## 工具设计

| 入口 | 用途 |
| --- | --- |
| `feishu_search_files` | 云文档 + Wiki 并行搜索，按资源 token 去重、通过官方 metadata 获取文件链接 |
| `feishu_read_document` | docx / Wiki 链接解析，官方 Markdown 或纯文本，Unicode 字符分段 |
| `feishu_create_document` | 先转换 Markdown，再创建和插入正文 |
| `feishu_append_document` | 原文保留，末尾追加 Markdown |
| `feishu_get_table_schema` | 列出数据表；指定表后并行读取字段与视图 |
| `feishu_query_records` | 字段投影、筛选、排序、分页 |
| `feishu_create_records` | 批量新增，支持飞书 client_token 幂等参数 |
| `feishu_update_records` | 按 record_id 修改指定字段 |
| `feishu_delete_records` | 按明确 record_id 列表删除 |
| `feishu_search_tools` | 其他操作的名称和说明，默认不返回完整 schema |
| `feishu_get_tool_schema` | 单个原生操作的完整参数定义 |
| `feishu_read_tool` | 仅允许只读原生操作 |
| `feishu_call_tool` | 原有完整调用入口，按最广写入影响标注 |

每个业务工具有输出 schema 和 structuredContent，同时返回文本 JSON 兼容普通 MCP 客户端。原生接口输出使用 `result` 包装的 structuredContent，原始文本 JSON 继续保留。

工具按明确动作拆分；创建、追加不会误标为删除覆盖。更新和删除标为 destructive；可能发消息或操作外部实体的原生/通用写入保守标注。所有入口由同一个用户身份调用器校验原生参数并强制 user token。输入中的 useUAT 不能切换为应用身份。

## 分页与写入边界

- 搜索每个来源最多 limit 条，因此合并后最多 2 × limit 条。cursor 绑定关键词，失败来源保持可重试状态，错误与空结果分开。跨页结果仍应按 id 去重。
- 云文档旧搜索 API 有 offset + count < 200 的上限；达到上限时明确 `search_limit_reached`，需缩小关键词，不能宣称已经遍历全部结果。
- 文档只返回指定字符段。分页期间文档如被修改，调用方应从头重读以保持一致；没有建立服务端文档快照。
- 字段、视图有各自分页状态。没有静默丢弃后续字段或视图。
- 查询只读取一页，汇总前必须处理 has_more。没有新增“自动扫描所有个人账单”的后台任务。
- 批量记录每次最多 100 条；不自动拆成多个写入请求，不盲目重试。返回请求/结果条数及 complete；删除还核对每条 deleted。
- 创建记录使用相同 client_token 才能请求上游幂等；不承诺多表事务或全局唯一约束。
- Markdown 写入使用官方 convert 和 descendant API，保持 first_level_block_ids 的顺序与子树。超过 1000 块或暂不支持的媒体块时，在创建/插入前明确拒绝。复杂块仍可使用原生 API。
- 创建文档后若插入失败，返回 partial_write 和已创建 document_id；不会假装回滚，也不会自动再建一个文档。

## 错误与认证

区分 invalid_arguments、invalid_cursor、missing_scope、resource_forbidden、resource_not_found、rate_limited、upstream_timeout、upstream_unavailable、reauthorization_required、partial_write 等。

真正登录失效返回 isError 和 `_meta["mcp/www_authenticate"]`；MCP 令牌无效在 HTTP 层返回 401 challenge。缺少业务权限返回 required_scopes（上游提供时），不把所有失败都说成登录过期。飞书 HTTP 200 且业务 code 非 0 仍按失败处理。

分组的 resource 为完整 MCP URL；授权事务、授权码、刷新、访问验证均绑定同一 resource，不能拿日常模式令牌直接访问另一 URL。分组 metadata 可从其 401 challenge 指向的 `/feishu/.well-known/...` 读取，不依赖共享域名的新路由。

## 性能与观测

日常工具定义约 21 KB；完整模式仍保留大型原生 schema。静态定义进程内缓存。一次 HTTP MCP 请求内共享用户 token 读取，跨请求不缓存授权或撤销判断，不跨用户复用状态。

日志白名单：事件类型、操作名称、请求关联 ID、耗时、状态。记录 HTTP、MCP 工具、OAuth 校验、状态存储和飞书 API 各阶段；不记录参数、文件正文、表格记录、授权码、访问令牌或 Cookie。SLS 保留期由部署者配置，本次为 7 天。ChatGPT 选工具耗时需结合客户端实际对话观察，不能由服务端日志推算全部耗时。

## 回归提示词

| 提示词 | 预期行为 |
| --- | --- |
| 在飞书搜索“账单”，给我几个候选 | 调用 search_files，返回真实结果，部分失败明确披露 |
| 阅读这个飞书文档并总结 | read_document，遇到 truncated 继续读取 |
| 这个多维表格有哪些字段 | get_table_schema，处理 fields_page |
| 查询测试表金额分大于 1000 的记录 | query_records，字段从 schema 得到 |
| 在测试表新增一条合成记录，再修改备注 | create_records → update_records → query_records 核对 |
| 删除刚才新增的测试记录 | 仅删除刚才确认的 ID，并查询验证 |
| 将这段 Markdown 新建成飞书文档 | create_document，失败时保留 partial_write 信息 |
| 在上面的文档末尾追加两句话 | append_document → read_document |
| 看一下我的飞书日历 | 搜索 calendar 操作 → schema → read_tool |
| 帮我查今天北京天气 | 不调用飞书工具 |
| 请搜索 其他 MCP 服务 的任务 | 不调用飞书任务工具 |
| 这个链接没有权限 | 返回权限错误，不将失败解释成空文档或不存在 |

测试层次分别记录：本地模拟回归、真实飞书 API、正式域名 MCP、ChatGPT 实际工具选择及结果。任何一层通过都不替代其他层。
