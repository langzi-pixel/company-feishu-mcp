---
name: feishu-collaboration
description: "查询和管理飞书日程、联系人、聊天、邮件与任务，生成工作安排摘要。"
---

# 查询和管理飞书日程、联系人、聊天、邮件与任务，生成工作安排摘要。

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 按任务读取模块

- [lark-calendar](references/lark-calendar-0.md#s-3d0136d3d09a934d)：查询和管理飞书日历、日程、重复实例、参与人、忙闲与会议室。
- [lark-contact](references/lark-contact-0.md#s-c7dcb2e78118aadb)：按姓名、邮箱或 ID 查找飞书联系人、部门与个人资料，解析后续操作的对象身份。
- [lark-im](references/lark-im-0.md#s-29d24f3594acb424)：搜索飞书聊天消息、读取线程、发送和回复消息、管理群聊、卡片与消息附件。
- [lark-mail](references/lark-mail-0.md#s-3559d7afa989eebe)：检索飞书邮箱邮件与线程，管理草稿、回复、附件、文件夹、联系人和邮件规则。
- [lark-task](references/lark-task-0.md#s-c03ee45b65ed2a9e)：查询和管理飞书任务、清单、子任务、负责人、截止时间、评论和附件。
- [lark-workflow-standup-report](references/lark-workflow-standup-report-0.md#s-580fd4dca62b3c36)：结合飞书日程和未完成任务生成指定日期的日报、站会或次日安排摘要。
