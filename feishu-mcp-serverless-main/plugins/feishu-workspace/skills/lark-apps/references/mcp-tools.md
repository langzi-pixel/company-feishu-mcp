# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `aily.v1.ailySessionAilyMessage.create` | [Feishu/Lark]-飞书 Aily-消息-发送 Aily 消息-该 API 用于向某个飞书 Aily 应用发送一条消息（Message）；每个消息从属于一个活跃的会话（Session） | feishu_call_tool |
| `aily.v1.ailySessionAilyMessage.get` | [Feishu/Lark]-飞书 Aily-消息-获取 Aily 消息-该 API 用于获取某个飞书 Aily 应用的消息（Message）的详细信息；包括消息的内容、发送人等 | feishu_read_tool |
| `aily.v1.ailySessionAilyMessage.list` | [Feishu/Lark]-飞书 Aily-消息-列出 Aily 消息-该 API 用于列出某个飞书 Aily 应用的某个会话（Session）下消息（Message）的详细信息；包括消息的内容、发送人等 | feishu_read_tool |
| `aily.v1.ailySession.create` | [Feishu/Lark]-飞书 Aily-会话-创建会话-该 API 用于创建与某个飞书 Aily 应用的一次会话（Session）；当创建会话成功后，可以发送消息、创建运行 | feishu_call_tool |
| `aily.v1.ailySession.delete` | [Feishu/Lark]-飞书 Aily-会话-删除会话-该 API 用于删除与某个飞书 Aily 应用的一次会话（Session） | feishu_call_tool |
| `aily.v1.ailySession.get` | [Feishu/Lark]-飞书 Aily-会话-获取会话-该 API 用于获取与某个飞书 Aily 应用的一次会话（Session）的详细信息，包括会话的状态、渠道上下文、创建时间等 | feishu_read_tool |
| `aily.v1.ailySessionRun.cancel` | [Feishu/Lark]-飞书 Aily-运行-取消运行-该 API 用于中止某个飞书 Aily 的一次运行 | feishu_call_tool |
| `aily.v1.ailySessionRun.create` | [Feishu/Lark]-飞书 Aily-运行-创建运行-该 API 用于在某个飞书 Aily 应用会话（Session）上创建一次运行（Run） | feishu_call_tool |
| `aily.v1.ailySessionRun.get` | [Feishu/Lark]-飞书 Aily-运行-获取运行-该 API 用于获取某个飞书 Aily 应用的运行（Run）的详细信息；包括运行的状态、结束时间等 | feishu_read_tool |
| `aily.v1.ailySessionRun.list` | [Feishu/Lark]-飞书 Aily-运行-列出运行-该 API 用于列出某个飞书 Aily 应用的运行（Run）的详细信息；包括状态、结束时间等 | feishu_read_tool |
| `aily.v1.ailySession.update` | [Feishu/Lark]-飞书 Aily-会话-更新会话-该 API 用于更新与某个飞书 Aily 应用的一次会话（Session）的信息 | feishu_call_tool |
| `aily.v1.appDataAssetTag.list` | [Feishu/Lark]-飞书 Aily-知识问答-数据知识管理-获取数据知识分类列表-获取 Aily 助手的数据知识分类列表 | feishu_read_tool |
| `aily.v1.appDataAsset.create` | [Feishu/Lark]-飞书 Aily-知识问答-数据知识管理-创建数据知识-在 Aily 中添加单个数据知识 | feishu_call_tool |
| `aily.v1.appDataAsset.delete` | [Feishu/Lark]-飞书 Aily-知识问答-数据知识管理-删除数据知识-删除 Aily 的数据知识 | feishu_call_tool |
| `aily.v1.appDataAsset.get` | [Feishu/Lark]-飞书 Aily-知识问答-数据知识管理-获取数据知识-获取单个数据知识 | feishu_read_tool |
| `aily.v1.appDataAsset.list` | [Feishu/Lark]-飞书 Aily-知识问答-数据知识管理-查询数据知识列表-获取 Aily 助手的数据知识列表 | feishu_read_tool |
| `aily.v1.appSkill.get` | [Feishu/Lark]-飞书 Aily-技能-获取技能信息-该 API 用于查询某个 Aily 应用的特定技能详情 | feishu_read_tool |
| `aily.v1.appSkill.list` | [Feishu/Lark]-飞书 Aily-技能-查询技能列表-该 API 用于查询某个 Aily 应用的技能列表> 包括内置的数据分析与问答技能、以及未在对话开启的技能 | feishu_read_tool |
| `aily.v1.appSkill.start` | [Feishu/Lark]-飞书 Aily-技能-调用技能-该 API 用于调用某个 Aily 应用的特定技能，支持指定技能入参；并同步返回技能执行的结果 | feishu_call_tool |
| `apaas.v1.app.list` | [Feishu/Lark]-飞书 aPaaS-应用-查看应用基本信息-获取企业下应用基本信息，如应用名称 、应用命名空间等 | feishu_read_tool |
| `apaas.v1.applicationAuditLog.auditLogList` | [Feishu/Lark]-飞书 aPaaS-审计日志-查询审计日志列表-根据搜索/筛选条件，查询审计日志列表 | feishu_read_tool |
| `apaas.v1.applicationAuditLog.dataChangeLogDetail` | [Feishu/Lark]-飞书 aPaaS-审计日志-查询数据变更日志详情-根据日志 ID 查询数据变更日志详情 | feishu_read_tool |
| `apaas.v1.applicationAuditLog.dataChangeLogsList` | [Feishu/Lark]-飞书 aPaaS-审计日志-查询数据变更日志列表-根据搜索/筛选条件，查询数据变更日志列表 | feishu_read_tool |
| `apaas.v1.applicationAuditLog.get` | [Feishu/Lark]-飞书 aPaaS-审计日志-查询审计日志详情-根据日志 ID 查询审计日志详情 | feishu_read_tool |
| `apaas.v1.seatActivity.list` | [Feishu/Lark]-飞书 aPaaS-席位活跃-查询席位活跃详情-获取租户下用户使用飞书 aPaaS 席位最近访问应用时间。需要飞书 aPaaS 系统管理员作为授权人调用当前API | feishu_read_tool |
| `apaas.v1.seatAssignment.list` | [Feishu/Lark]-飞书 aPaaS-席位分配-查询席位分配详情-获取租户下平台席位和应用访问席位分配详情，如用户 ID 、应用命名空间等，需要飞书 aPaaS 系统管理员作为授权人调用当前 API | feishu_read_tool |
