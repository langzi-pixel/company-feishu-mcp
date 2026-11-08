---
name: feishu-content
description: "搜索、读取和编辑飞书文档、知识库、云盘文件、Markdown 与画板。"
---

# 搜索、读取和编辑飞书文档、知识库、云盘文件、Markdown 与画板。

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 按任务读取模块

- [lark-doc](references/lark-doc-0.md#s-716f3f9ec728a423)：读取、创建和精确修改飞书文档正文、文档块和思维笔记；适用于 docx 或 wiki 文档链接。
- [lark-drive](references/lark-drive-0.md#s-c99c77320f67806c)：搜索与管理飞书云盘文件、文件夹、权限、评论、导入导出和附件；正文编辑转文档技能。
- [lark-wiki](references/lark-wiki-0.md#s-384c23a567152824)：管理飞书知识空间、成员、节点及节点移动复制；文档正文交给文档技能。
- [lark-markdown](references/lark-markdown-0.md#s-651194b317c3c3e6)：读取、创建和覆写飞书云盘中的原生 Markdown 文件；不把它当成 Docx 文档。
- [lark-whiteboard](references/lark-whiteboard-0.md#s-e0afe64ca7f20b4c)：读取飞书画板节点并按已有画板组织关系图、思维导图和图形修改。
