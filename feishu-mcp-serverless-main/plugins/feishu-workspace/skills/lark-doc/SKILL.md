---
name: lark-doc
description: "读取、创建和精确修改飞书文档正文、文档块和思维笔记；适用于 docx 或 wiki 文档链接。"
---

# doc

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 已有链接先定位原文档。Wiki 节点先通过 wiki.v2.space.getNode 取得 obj_type 和 obj_token。找文档用 feishu_search_files，全文读取用 feishu_read_document，分段时沿 next_offset 读完。

2. 新增用 feishu_create_document，追加用 feishu_append_document。修改既有内容先读取目标块及前后文，再查 documentBlock 的 get、patch、batchUpdate 等 schema，只改选中块。不能新建副本代替修改，也不能用追加冒充替换。

3. Markdown、Docx block 和 XML 是不同协议。按当前工具 schema 选择一种；转换结果中的 block_id、children 和根节点顺序必须保留。复杂媒体块不能丢弃后报告成功。

4. 版本或内容已改变时重新定位；长文分页读取须核对 content_hash。写入返回部分成功时保留 document_id，读取同一对象后只补失败部分。历史回滚、封面、XML 局部读写须先确认对应工具存在。

5. 思维笔记先识别节点 ID；嵌入画板转 lark-whiteboard，文件复制/移动/权限/独立评论转 lark-drive。

## 按需参考

- [工具与合同](references/mcp-tools.md)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](workflow-reference.md)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](references/baseline-index.md)。
