---
name: feishu-operations
description: "处理飞书审批、考勤、OKR、应用与事件，诊断连接并查找其他操作。"
---

# 处理飞书审批、考勤、OKR、应用与事件，诊断连接并查找其他操作。

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 按任务读取模块

- [lark-shared](references/lark-shared-0.md#s-fd106a64f84b4188)：诊断飞书连接、当前身份、授权范围与访问失败。业务资料操作由对应领域技能处理。
- [lark-approval](references/lark-approval-0.md#s-f159bc5d6a53e949)：查询飞书审批定义、待办和实例，按指定对象发起、通过、拒绝、转交或撤回审批。
- [lark-attendance](references/lark-attendance-0.md#s-a7d1b6f680050d68)：查询当前授权用户的飞书考勤与打卡记录，按日期范围整理结果。
- [lark-okr](references/lark-okr-0.md#s-8bde09e6f148ff41)：读取和管理飞书 OKR 周期、目标、关键结果、对齐、指标、进展与评论。
- [lark-apps](references/lark-apps-0.md#s-9a35a16887a0dc7d)：处理飞书妙搭 Spark 应用的查询、页面开发、数据与发布工作流；BaseApp 应用模式转多维表格技能。
- [lark-event](references/lark-event-0.md#s-aead883e2e40767c)：检查飞书事件订阅与消费能力，读取有界增量事件并说明监听状态。
- [lark-openapi-explorer](references/lark-openapi-explorer-0.md#s-180120bedca6008d)：查找飞书其他领域和日常入口未覆盖的 MCP 操作，读取参数合同并执行明确请求。
- [lark-skill-maker](references/lark-skill-maker-0.md#s-599576bc00bd2fd6)：将已经验证的飞书操作整理为可复用技能、参数合同和失败恢复流程。
