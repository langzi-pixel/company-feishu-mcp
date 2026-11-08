---
name: feishu-meetings
description: "检索飞书会议、妙记、会议笔记与逐字稿，整理有来源的会议总结。"
---

# 检索飞书会议、妙记、会议笔记与逐字稿，整理有来源的会议总结。

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 按任务读取模块

- [lark-meeting](references/lark-meeting-0.md#s-d18634841861885e)：检索飞书会议与即时会议，读取录制、妙记、会议笔记和逐字稿，整理会议来源。
- [lark-vc](references/lark-vc-0.md#s-35c58c6881ec380e)：处理飞书视频会议查询、预约与录制；沿用会议统一工作流。
- [lark-vc-agent](references/lark-vc-agent-0.md#s-99f6ab3423a4d756)：处理飞书会中机器人的入会、离会、状态与实时会话请求。
- [lark-minutes](references/lark-minutes-0.md#s-c357b92850015e0b)：读取飞书妙记的基本信息、统计、逐字稿与可用产物。
- [lark-note](references/lark-note-0.md#s-7bca76187d2c4f4f)：处理飞书会议笔记 Note 的详情、关联关系与统一逐字稿请求。
- [lark-workflow-meeting-summary](references/lark-workflow-meeting-summary-0.md#s-94b20d487dc5732c)：把指定时间范围或指定会议的飞书纪要与逐字稿整理成有来源的会议总结。
