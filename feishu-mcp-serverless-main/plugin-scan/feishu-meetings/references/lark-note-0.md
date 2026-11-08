<a id="s-7bca76187d2c4f4f"></a>

## SKILL.md


# note

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 读取 lark-meeting 的流程。Note、Minutes 和 Docx 分别识别；缺 Note 详情或统一逐字稿工具时报告实际缺口，不猜正文。

## 按需参考

- [工具与合同](lark-note-0.md#s-7fca5a7369fa319e)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-note-0.md#s-638cb676afde177f)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-note-0.md#s-70a0ebb8fd9f25f2)。


<a id="s-e01d46e9f47a8234"></a>

## references/baseline/references/lark-note-detail.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# note +detail

通过 `note_id` 查询会议纪要详情，获取下挂文档 Token（AI 智能纪要、逐字稿、会中共享文档）。只读，仅支持 `--as user`。

## 命令

```text
lark-cli note +detail --note-id <note_id>
```

## `note_id` 来源

- 可以来自用户直接给出的 `note_id`。
- 如果入口是文档，先由 [lark-doc]（按模块名读取对应工作流） 读取 Docx；只有 `<vc-transcribe-tab vc-node-id="...">` 的 `vc-node-id` 可以作为 `note_id`。
- 没有 `vc-node-id` 时，不要从 `doc_token`、标题、正文或 backlink 反推 `note_id`。

## 输出后的路由

| detail 字段 | 后续动作 |
|---------|---------|
| `note_doc_token` | 读纪要正文 / 总结 / 待办 / 章节：`docs +fetch --doc <note_doc_token>` |
| `note_display_type=normal` + `verbatim_doc_token` | 读逐字稿：`docs +fetch --doc <verbatim_doc_token>` |
| `note_display_type=unknown` + `verbatim_doc_token` | 先按普通独立逐字稿文档读取；不要猜成 unified |
| `note_display_type=unified` | 读逐字稿 / 原始记录：转 [`note +transcript`](lark-note-0.md#s-9c6ff33f773912ed) |

判别键是 `note_display_type`。即使 unified 纪要返回了非空 `verbatim_doc_token`，逐字稿仍按 unified 路由。


<a id="s-9c6ff33f773912ed"></a>

## references/baseline/references/lark-note-transcript.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# note +transcript

只在 `note +detail` 已确认 `note_display_type=unified` 时使用。普通纪要逐字稿是独立 Docx 文档，应回到 [lark-doc]（按模块名读取对应工作流） 读取 `verbatim_doc_token`。

```text
lark-cli note +transcript --note-id NOTE_ID
```

## 行为契约

- CLI 会先校验该 Note 是否为 `unified`；不是 unified 时不拉取 transcript。
- CLI 内部自动翻页并拼接完整内容；任一页失败时整体报错，不保存半截 transcript。
- 默认保存到 `./notes/{note_id}/unified_transcript.md`；`--transcript-format plain_text` 时保存为 `.txt`。
- 目标文件已存在时会失败；用户明确要覆盖时才加 `--overwrite`。

## 何时不要用

| 场景 | 正确路由 |
|------|---------|
| 只有纪要文档标题 | 先文档搜索，再 `docs +fetch`；有 `vc-node-id` 才回 Note 域 |
| 只有 Docx URL / `doc_token` | 先 `docs +fetch`；不要从 `doc_token` 反推 `note_id` |
| `note_display_type=normal` | `docs +fetch --doc <verbatim_doc_token>` |
| `note_display_type=unknown` 且 `verbatim_doc_token` 非空 | 先按独立逐字稿文档读取 |


<a id="s-70a0ebb8fd9f25f2"></a>

## references/baseline-index.md

# 兼容参考

- [lark-note-detail.md](lark-note-0.md#s-e01d46e9f47a8234)
- [lark-note-transcript.md](lark-note-0.md#s-9c6ff33f773912ed)


<a id="s-7fca5a7369fa319e"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `vc.v1.export.get` | [Feishu/Lark]-视频会议-导出-查询导出任务结果-查看异步导出的进度 | feishu_read_tool |
| `vc.v1.export.meetingList` | [Feishu/Lark]-视频会议-导出-导出会议明细-导出会议明细，具体权限要求请参考资源介绍 | feishu_call_tool |
| `vc.v1.export.participantList` | [Feishu/Lark]-视频会议-导出-导出参会人明细-导出某个会议的参会人详情列表，具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.export.participantQualityList` | [Feishu/Lark]-视频会议-导出-导出参会人会议质量数据-导出某场会议某个参会人的音视频&共享质量数据（仅支持已结束会议），具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.export.resourceReservationList` | [Feishu/Lark]-视频会议-导出-导出会议室预定数据-导出会议室预定数据，具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.meetingList.get` | [Feishu/Lark]-视频会议-会议数据-查询会议明细-查询会议明细，具体权限要求请参考[资源介绍] | feishu_read_tool |
| `vc.v1.meeting.end` | [Feishu/Lark]-视频会议-会议管理-结束会议-结束一个进行中的会议 | feishu_call_tool |
| `vc.v1.meeting.get` | [Feishu/Lark]-视频会议-会议管理-获取会议详情-获取一个会议的详细数据 | feishu_read_tool |
| `vc.v1.meeting.invite` | [Feishu/Lark]-视频会议-会议管理-邀请参会人-邀请参会人进入会议 | feishu_call_tool |
| `vc.v1.meeting.listByNo` | [Feishu/Lark]-视频会议-会议管理-获取与会议号关联的会议列表-获取指定时间范围（90天内)会议号关联的会议简要信息列表 | feishu_read_tool |
| `vc.v1.meetingRecording.get` | [Feishu/Lark]-视频会议-录制-获取录制文件-获取一个会议的录制文件 | feishu_read_tool |
| `vc.v1.meetingRecording.setPermission` | [Feishu/Lark]-视频会议-录制-授权录制文件-将一个会议的录制文件授权给组织、用户或公开到公网 | feishu_call_tool |
| `vc.v1.meetingRecording.start` | [Feishu/Lark]-视频会议-录制-开始录制-在会议中开始录制 | feishu_call_tool |
| `vc.v1.meetingRecording.stop` | [Feishu/Lark]-视频会议-录制-停止录制-在会议中停止录制 | feishu_call_tool |
| `vc.v1.meeting.setHost` | [Feishu/Lark]-视频会议-会议管理-设置主持人-设置会议的主持人 | feishu_call_tool |
| `vc.v1.participantList.get` | [Feishu/Lark]-视频会议-会议数据-查询参会人明细-查询参会人明细，具体权限要求请参考[资源介绍] | feishu_read_tool |
| `vc.v1.participantQualityList.get` | [Feishu/Lark]-视频会议-会议数据-查询参会人会议质量数据-查询参会人会议质量数据（仅支持已结束会议），具体权限要求请参考「资源介绍」 | feishu_read_tool |
| `vc.v1.reserve.apply` | [Feishu/Lark]-视频会议-预约-预约会议-创建一个会议预约 | feishu_call_tool |
| `vc.v1.reserve.delete` | [Feishu/Lark]-视频会议-预约-删除预约-删除一个预约 | feishu_call_tool |
| `vc.v1.reserve.get` | [Feishu/Lark]-视频会议-预约-获取预约-获取一个预约的详情 | feishu_read_tool |
| `vc.v1.reserve.getActiveMeeting` | [Feishu/Lark]-视频会议-预约-获取活跃会议-获取一个预约的当前活跃会议 | feishu_read_tool |
| `vc.v1.reserve.update` | [Feishu/Lark]-视频会议-预约-更新预约-更新一个预约 | feishu_call_tool |
| `vc.v1.resourceReservationList.get` | [Feishu/Lark]-视频会议-会议数据-查询会议室预定数据-查询会议室预定数据，具体权限要求请参考「资源介绍」 | feishu_read_tool |
| `vc.v1.room.search` | [Feishu/Lark]-视频会议-会议室管理-搜索会议室-该接口可以用来搜索会议室，支持使用关键词进行搜索，也支持使用自定义会议室 ID 进行查询。该接口只会返回用户有预定权限的会议室列表 | feishu_read_tool |
| `cli.vc.meeting.get` | Obtain meeting details | feishu_read_tool |


<a id="s-638cb676afde177f"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Compatibility entry

本技能只用于兼容旧名称，不直接处理业务。

**MUST 完整读取 [`../lark-meeting/SKILL.md`](lark-meeting-0.md#s-d18634841861885e)，并按照其中的路由和行动指南执行。**
