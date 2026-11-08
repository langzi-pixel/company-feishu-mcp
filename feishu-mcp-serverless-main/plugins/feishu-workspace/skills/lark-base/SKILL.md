---
name: lark-base
description: "操作飞书多维表格的表、字段、记录、视图、表单、仪表盘、工作流、权限及 BaseApp 应用模式。"
---

# base

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. URL 中的 base/app、table、view、record 分别定位。先用 feishu_get_table_schema 读取数据表、字段类型和视图；筛选与写入字段必须来自真实 schema。

2. 查询用 feishu_query_records；新增/修改/删除用 feishu_create_records、feishu_update_records、feishu_delete_records。只返回一页时不能计算全表总额；继续 cursor。固定 view 无记录就是空结果，不扩大查询范围。

3. 修改只传目标字段与已查询到的 record_id。保留编号前导零，日期按 schema 使用毫秒，选项/人员/附件/关联记录按字段类型构造。批量最多 100，创建重试复用同一 client_token；部分成功不重发成功项。

4. 更复杂操作查 bitable/base 的原生 schema。Base Block、表内字段记录、Dashboard 内部组件、BaseApp Page、Workspace 是不同层级，不能混用 ID。现有 workflow 列表/更新和 dashboard 列表/复制可以使用。

5. 完整替换型 update 先读现状并合并，delta 仅提交变更。表单移除题目可能同时删除底层字段和数据，必须按 schema 区分保留字段的操作。

6. BaseApp/Workspace/新组件与 v3 流程若目录无对应工具，指出缺少的具体操作；不能用新建普通表冒充完成，也不能拿妙搭 apps 替代 BaseApp。

## 按需参考

- [工具与合同](references/mcp-tools.md)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](workflow-reference.md)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](references/baseline-index.md)。
