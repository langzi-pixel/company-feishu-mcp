<a id="s-94b20d487dc5732c"></a>

## SKILL.md


# workflow-meeting-summary

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 按 lark-meeting 取得完整会议候选，逐场记录来源类型、读取状态和链接；分页与权限失败不能被摘要掩盖。

2. 只依据已读取纪要/逐字稿区分决议、讨论意见、未决问题和行动项；没有明确负责人或截止时间就不补写。

3. 默认在对话返回摘要和来源；只有用户要求才写文档、发群或创建任务。写入后返回真实目标链接和结果。

## 按需参考

- [工具与合同](lark-workflow-meeting-summary-0.md#s-76a679609b9cd17c)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-workflow-meeting-summary-0.md#s-d80ee5c848e6f1cb)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-76a679609b9cd17c"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `docs.v1.content.get` | [Feishu/Lark]-云文档-通用-获取云文档内容-可获取云文档内容，当前只支持获取新版文档 Markdown 格式的内容 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.batchUpdate` | [Feishu/Lark]-群组-新版群公告-块-批量更新群公告块的内容 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.batchDelete` | [Feishu/Lark]-群组-新版群公告-块-删除群公告中的块-指定需要操作的块，删除其指定范围的子块。如果操作成功，接口将返回应用删除操作后的群公告版本号 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.create` | [Feishu/Lark]-群组-新版群公告-块-在群公告中创建块 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.get` | [Feishu/Lark]-群组-新版群公告-块-获取所有子块 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.get` | [Feishu/Lark]-群组-新版群公告-块-获取群公告块的内容 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.list` | [Feishu/Lark]-群组-新版群公告-群公告-获取群公告所有块 | feishu_read_tool |
| `docx.v1.chatAnnouncement.get` | [Feishu/Lark]-群组-新版群公告-群公告-获取群公告基本信息-获取指定群组中的群公告基本信息 | feishu_read_tool |
| `docx.v1.documentBlock.batchUpdate` | [Feishu/Lark]-云文档-文档-块-批量更新块的内容-批量更新块的富文本内容 | feishu_call_tool |
| `docx.v1.documentBlockChildren.batchDelete` | [Feishu/Lark]-云文档-文档-块-删除块-指定需要操作的块，删除其指定范围的子块。如果操作成功，接口将返回应用删除操作后的文档版本号 | feishu_call_tool |
| `docx.v1.documentBlockChildren.create` | [Feishu/Lark]-云文档-文档-块-创建块-指定需要操作的块，为其创建一批子块，并插入到指定位置。如果操作成功，接口将返回新创建子块的富文本内容 | feishu_call_tool |
| `docx.v1.documentBlockChildren.get` | [Feishu/Lark]-云文档-文档-块-获取所有子块-给定一个指定版本的文档，并指定需要操作的块，分页遍历其所有子块富文本内容 。如果不指定版本，则会默认查询最新版本 | feishu_read_tool |
| `docx.v1.documentBlockDescendant.create` | [Feishu/Lark]-云文档-文档-块-创建嵌套块 | feishu_call_tool |
| `docx.v1.documentBlock.get` | [Feishu/Lark]-云文档-文档-块-获取块的内容-获取指定块的富文本内容 | feishu_read_tool |
| `docx.v1.documentBlock.list` | [Feishu/Lark]-云文档-文档-文档-获取文档所有块-获取文档所有块的富文本内容并分页返回 | feishu_read_tool |
| `docx.v1.documentBlock.patch` | [Feishu/Lark]-云文档-文档-块-更新块的内容-更新指定的块 | feishu_call_tool |
| `docx.v1.document.convert` | [Feishu/Lark]-云文档-文档-块-Markdown/HTML 内容转换为文档块-将 HTML/Markdown 格式的内容转换为文档块 | feishu_read_tool |
| `docx.v1.document.create` | [Feishu/Lark]-云文档-文档-文档-创建文档-创建文档类型为 docx 的文档。你可选择传入文档标题和文件夹 | feishu_call_tool |
| `docx.v1.document.get` | [Feishu/Lark]-云文档-文档-文档-获取文档基本信息-获取文档标题和最新版本 ID | feishu_read_tool |
| `docx.v1.document.rawContent` | [Feishu/Lark]-云文档-文档-文档-获取文档纯文本内容-获取文档的纯文本内容 | feishu_read_tool |
| `minutes.v1.minute.get` | [Feishu/Lark]-妙记-妙记信息-获取妙记信息-通过这个接口，可以得到一篇妙记的基础概述信息，包含 `owner_id`、`create_time`、标题、封面、时长和 URL | feishu_read_tool |
| `minutes.v1.minuteMedia.get` | [Feishu/Lark]-妙记-妙记音视频文件-下载妙记音视频文件-获取妙记的音视频文件 | feishu_read_tool |
| `minutes.v1.minuteStatistics.get` | [Feishu/Lark]-妙记-妙记统计数据-获取妙记统计数据-通过这个接口，可以获得妙记的访问情况统计，包含PV、UV、访问过的 user id、访问过的 user timestamp | feishu_read_tool |
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
| `docx.builtin.search` | [飞书/Lark] - 云文档-文档 - 搜索文档 - 搜索云文档，只支持user_access_token | feishu_read_tool |
| `docx.builtin.import` | [飞书/Lark] - 云文档-文档 - 导入文档 - 导入云文档，最大20MB | feishu_call_tool |
| `cli.minutes.minutes.get` | Get minutes meta | feishu_read_tool |
| `cli.vc.meeting.get` | Obtain meeting details | feishu_read_tool |


<a id="s-d80ee5c848e6f1cb"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# 会议纪要汇总工作流

**CRITICAL — 开始前 MUST 先完整读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流） 和 [`../lark-meeting/SKILL.md`](lark-meeting-0.md#s-d18634841861885e)**。认证、身份和权限以 lark-shared 为准；会议与产物关系、产物选择和逐字稿路由以 lark-meeting 为准。

## 适用场景

- "帮我整理这周的会议纪要" / "总结最近的会议" / "生成会议周报"
- "看看今天开了哪些会" / "回顾过去一周开了哪些会"

## 前置条件

仅支持 **user 身份**。执行前确保已授权：

```text
lark-cli auth login --domain vc        # 基础（查询+纪要）
lark-cli auth login --domain vc,drive   # 含读取纪要文档正文、生成文档
lark-cli auth login --domain vc,drive,minutes  # 含无 note_id 时的妙记备选路径
```

## 工作流

```
{时间范围} ─► vc +search ──► 会议列表 (meeting_ids)
                   │
                   ▼
               vc +detail ──► 获取 note_id 
                   │
                   ▼
               note +detail ──► 纪要文档 tokens
                   │
                   ▼
               drive metas batch_query 纪要元数据
                   │
                   ▼
               结构化报告
```

### Step 1: 确定时间范围

默认**过去 7 天**。推断规则："今天"→当天，"这周"→本周一~now，"上周"→上周一~上周日，"这个月"→1日~now。

> **注意**：日期转换必须调用系统命令（如 `date`），不要心算。时间范围参数需根据 CLI 实际要求格式化（通常为 `YYYY-MM-DD` 或 ISO 8601）。

### Step 2: 查询会议记录

```text
# page-size 最大为 30
lark-cli vc +search --start "<YYYY-MM-DD>" --end "<YYYY-MM-DD>" --format json --page-size 30
```

- 时间范围拆分：搜索的时间范围最大为 1 个月。搜索更长时间范围的会议，需要拆分为多次时间范围为一个月查询。
- `--end` 为**包含当天**的日期（即查"今天"时 start 和 end 都填今天）
- `--format json` 输出 JSON 格式，你更佳擅长解析 JSON 数据。
- `--page-size 30` 每页最多 30 条。
- 有 `page_token` 时必须继续翻页，收集所有 `id` 字段（meeting-id）

### Step 3: 获取纪要元数据

1. 查询会议关联的纪要信息
```text
# 首先获取 note_id 和 minute_token
lark-cli vc +detail --meeting-ids "id1,id2,...,idN"

# 然后用 note_id 获取文档 tokens（如有多个需分别获取）
lark-cli note +detail --note-id "note_id"
```
- 根据上一步搜集到的 `meeting-id` 查询。
- 单次最多查询 50 个，超过 50 个需分批调用。
- 部分会议没有 `note_id` 或报错 `no notes available`，**不要直接标注"无纪要"**：先看 `vc +detail` 是否返回了 `minute_token`，有则走下面的妙记备选路径；`note_id` 和 `minute_token` 都没有时才标注"无纪要"。
- 记录每个纪要的 `note_id`（纪要 ID）、`note_display_type`（展示类型：`unknown` / `normal` / `unified`）、`note_doc_token`（纪要文档 Token）和 `verbatim_doc_token`（逐字稿文档 Token）。

> **妙记备选路径（无 `note_id`、有 `minute_token` 时）**：智能纪要与妙记是两条独立产物链路，缺少智能纪要不代表这场会没有内容。
>
> ```text
> # --minute-tokens 是复数形式（+download 同）；--output-dir 只接受相对路径
> lark-cli minutes +detail --minute-tokens "<minute_token>" --transcript --output-dir ./transcripts --as user
> ```
>
> 逐字稿会落盘，供 Step 4 基于原始发言独立提炼（不要照搬 AI 总结）。若返回 `No read permission`（`2091005`），先把无权限事实告知用户，用户明确同意后再用单数 flag 申请：`lark-cli minutes +apply-permission --minute-token "<minute_token>" --perm view --as user`；申请需 owner 在客户端批准后才可重试。详见 [基于 minute_token 查询妙记及关联产物](lark-meeting-0.md#s-b4803aa71f203d03)。

> **逐字稿路由按 `note_display_type` 决定**（详见 [基于 note_id 查询智能纪要及关联产物](lark-meeting-0.md#s-043cc283b03d4c58)）：
> - `normal`：逐字稿是独立文档，链接/正文走 `verbatim_doc_token`。
> - `unified`：逐字稿**不是独立文档**，没有可分享的逐字稿文档链接；需要逐字稿内容时用 `note +transcript --note-id <note_id>`（[lark-meeting](lark-meeting-0.md#s-d18634841861885e)）拉取到本地，报告中标注"unified 纪要"即可。

2. 获取纪要文档和逐字稿文档链接
```text
# 学习命令使用方式
lark-cli schema drive.metas.batch_query

# 批量获取纪要文档与逐字稿链接: 一次最多查询 10 个文档
# 仅对 note_doc_token 与 normal 纪要的 verbatim_doc_token 查询链接
lark-cli drive metas batch_query --data '{"request_docs": [{"doc_type": "docx", "doc_token": "<doc_token>"}], "with_url": true}'
```

### Step 4: 整理纪要报告

根据时间跨度选择输出格式：

- **单日汇总**（"今天"/"昨天"）：用"今日会议概览"标题，逐会议列出会议时间、主题、纪要链接、逐字稿链接（`unified` 纪要无逐字稿链接，标注"unified 纪要，逐字稿需 `note +transcript` 拉取"）。
- **多日/周报**（"这周"/"过去 7 天"等）：用"会议纪要周报"标题，含概览统计、逐会议详情。

### Step 5: 生成文档（可选，用户要求时）

阅读 [`../lark-doc/SKILL.md`]（按模块名读取对应工作流） 学习云文档技能。

```text
lark-cli docs +create --doc-format markdown --content $'<title>会议纪要汇总 (<start> - <end>)</title>\n<内容>'
# 或追加到已有文档
lark-cli docs +update --doc "<url_or_token>" --command append --doc-format markdown --content $'<内容>'
```

## 参考

- [lark-shared]（按模块名读取对应工作流） — 认证、权限（必读）
- [lark-meeting](lark-meeting-0.md#s-d18634841861885e) — 会议与产物统一路由
- [查询会议与会议产物](lark-meeting-0.md#s-f0bd564eb956c3d7) — 搜索、消歧、产物获取与逐字稿分析流程
- [查询妙记及关联产物](lark-meeting-0.md#s-b4803aa71f203d03) — 无 `note_id` 时的妙记备选路径
- [`vc +search`](lark-meeting-0.md#s-336b0395b2ffd277)、[`vc +detail`](lark-meeting-0.md#s-f83a53e7114cecb3)、[`note +detail`](lark-meeting-0.md#s-70f05555aba6167f)、[`note +transcript`](lark-meeting-0.md#s-f44d5fe4bf8bfb52)、[`minutes +detail`](lark-meeting-0.md#s-3e1c4a681cc2ae6d)、[`minutes +apply-permission`](lark-meeting-0.md#s-d4c7d9db1161e205) — 命令细节
- [lark-doc]（按模块名读取对应工作流） — `+fetch`、`+create`、`+update` 详细用法
