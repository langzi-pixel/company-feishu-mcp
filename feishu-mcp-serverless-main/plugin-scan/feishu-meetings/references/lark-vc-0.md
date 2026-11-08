<a id="s-35c58c6881ec380e"></a>

## SKILL.md


# vc

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 读取 lark-meeting 的流程；视频会议 ID 与日历事件 ID 不混用。当前 vc 原生查询、预约和录制管理仍全部可发现。

## 按需参考

- [工具与合同](lark-vc-0.md#s-20c66225c4b0ac15)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-vc-0.md#s-e12bfee45aa4775d)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-vc-0.md#s-63a67430100a7f3e)。


<a id="s-e05238971ddb666c"></a>

## references/baseline/references/lark-vc-detail.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +detail

通过会议 ID 获取会议详情，包括基本信息、关联的纪要 ID（`note_id`）和妙记 Token（`minute_token`）。只读。

## 命令

```text
# 单个 / 批量（逗号分隔，最多 50 个）
lark-cli vc +detail --meeting-ids <meeting_id1>,<meeting_id2>
```

## 输出字段

| 字段 | 说明 |
|------|------|
| `meeting_id` | 会议 ID |
| `meeting_no` | 会议 9 位号码 |
| `topic` | 会议主题 |
| `start_time` | 开始时间 |
| `end_time` | 结束时间 |
| `note_id` | 关联的纪要 ID。 |
| `minute_token` | 关联的妙记 Token。 |

## 典型场景

### 场景 1：获取会议的纪要和妙记关联

`vc +detail` 只能拿到 `note_id` 和 `minute_token`，不直接返回纪要文档 token 与妙记产物内容。要获取实际产物，需根据用户诉求继续调用 `note +detail` 或 `minutes +detail`：

```text
# 1. 获取会议详情，拿到 note_id 和 minute_token
lark-cli vc +detail --meeting-ids <meeting_id>

# 2. 用 note_id 获取纪要文档 Token（note_doc_token / verbatim_doc_token / shared_doc_tokens）
lark-cli note +detail --note-id <note_id>

# 3. 用 minute_token 获取妙记产物
# ⚠️ 必须显式指定 --summary / --todo / --chapter / --keyword / --transcript 中至少一个 flag，
# 不传任何 flag 则不会返回任何产物内容。
lark-cli minutes +detail --minute-tokens <minute_token> --todo --transcript
```

> **路由建议**：当用户未明确指定使用妙记时，**优先**走 `note +detail` 链路（纪要文档信息更完整、含逐字稿原文），仅在 `note_id` 为空或用户要求妙记产物时才走 `minutes +detail`。


<a id="s-1ff93ed6418e9203"></a>

## references/baseline/references/lark-vc-recording.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +recording


通过 meeting_id 或 calendar_event_id 查询对应的 minute_token。这是 VC 域和 Minutes 域之间的桥梁命令。只读操作。

> **边界提醒：** 如果用户明确要的是"妙记信息""妙记详情""妙记链接""minute_token""标题""时长""owner"这类妙记元信息，先用本命令拿到 `minute_token`，再调用 `minutes minutes get`。不要直接切到 `minutes +detail`；`minutes +detail` 只用于纪要内容和逐字稿。

本 skill 对应 shortcut：`lark-cli vc +recording`。

## 命令

```text
# 通过会议 ID 查询（逗号分隔支持批量，最多 50 个）
lark-cli vc +recording --meeting-ids 69xxxxxxxxxxxxx28
lark-cli vc +recording --meeting-ids 69xxxxxxxxxxxxx28,69xxxxxxxxxxxxx29

# 通过日程事件 ID 查询
lark-cli vc +recording --calendar-event-ids xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_0

# 输出格式
lark-cli vc +recording --meeting-ids 69xxxxxxxxxxxxx28 --format json

# 预览 API 调用
lark-cli vc +recording --meeting-ids 69xxxxxxxxxxxxx28 --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--meeting-ids <ids>` | 二选一 | 会议 ID，逗号分隔支持批量 |
| `--calendar-event-ids <ids>` | 二选一 | 日程事件 ID，逗号分隔支持批量 |
| `--format <fmt>` | 否 | 输出格式：json (默认) / pretty / table / ndjson / csv |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 核心约束

### 1. 两种参数互斥

每次只能指定一种输入方式。同时传入会报错。

### 2. 仅支持 user 身份

该命令仅支持 `user` 身份，使用前需完成 `lark-cli auth login`。user token 只能查自己有权限的录制。

### 3. 批量上限

每次最多传入 50 个 ID。

### 4. 录制必须已完成

录制必须完成生成后才能查询。时长 < 5 秒的录制可能不会生成文件。

## 输出结果

返回 `recordings` 数组，每条记录包含：

| 字段 | 说明 |
|------|------|
| `meeting_id` | 会议 ID |
| `calendar_event_id` | 日历事件 ID（仅 `--calendar-event-ids` 路径） |
| `minute_token` | 从录制 URL 中解析的妙记 Token |
| `recording_url` | 录制 URL |
| `duration` | 录制时长（毫秒） |
| `error` | 错误信息（仅查询失败时存在） |

## 如何获取输入参数

| 输入参数 | 获取方式 |
|---------|---------|
| `meeting_id` | 使用 `lark-cli vc +search` 搜索历史会议，取结果中的 `id` 字段 |
| `calendar_event_id` | 使用 `lark-cli calendar +agenda` 查看日程，取结果中的 `event_id` 字段 |

## Agent 组合场景

### 场景 1：知道 meeting_id，想下载录制

```text
# 第 1 步：通过 meeting_id 查询录制，拿到 minute_token
lark-cli vc +recording --meeting-ids xxx

# 第 2 步：使用上一步返回的 minute_token 下载妙记文件
lark-cli minutes +download --minute-tokens <minute_token>
```

### 场景 2：知道 meeting_id，想查询妙记基础信息

```text
# 第 1 步：通过 meeting_id 查询录制，拿到 minute_token
lark-cli vc +recording --meeting-ids xxx

# 第 2 步：使用上一步返回的 minute_token 查询妙记基础信息
lark-cli minutes minutes get --params '{"minute_token":"<minute_token>"}'
```

### 场景 3：知道 meeting_id，想获取完整纪要（含 AI 产物）

```text
# 第 1 步：通过 meeting_id 查询录制，拿到 minute_token
lark-cli vc +recording --meeting-ids xxx

# 第 2 步：使用上一步返回的 minute_token 获取完整纪要
# ⚠️ 必须显式指定要获取的产物 flag（--summary, --keyword, --todo, --chapter, --transcript）
lark-cli minutes +detail --minute-tokens <minute_token> --summary --todo --chapter --transcript
```

### 场景 4：先搜索会议，再获取录制并下载

```text
# 第 1 步：搜索历史会议，拿到 meeting_ids
lark-cli vc +search --query "周会" --start 2026-03-10

# 第 2 步：使用上一步返回的 meeting_ids 查询录制，拿到 minute_tokens
lark-cli vc +recording --meeting-ids <ids>

# 第 3 步：使用其中一个 minute_token 下载妙记文件
lark-cli minutes +download --minute-tokens <token>
```

### 场景 5：从日历事件获取录制

```text
# 第 1 步：通过日历 event_id 查询录制，拿到 minute_token
lark-cli vc +recording --calendar-event-ids <event_id>

# 第 2 步：使用上一步返回的 minute_token 下载妙记文件
lark-cli minutes +download --minute-tokens <minute_token>
```

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `exactly one of ... is required` | 未传入参数或同时传了多种 | 只指定一种输入方式 |
| `no recording available` | 该会议无录制或录制未完成 | 确认会议已结束且开启了录制 |
| `121005 no permission` | 无权查看该会议录制 | 确认是会议参与者或有录制权限 |
| `124002 recording generating` | 录制文件仍在生成中 | 等待录制完成后重试 |
| `missing required scope(s)` | 权限不足 | 按提示运行 `auth login --scope` |

## 提示

- 默认使用 `--format json` 输出，Agent 更擅长解析 JSON 数据。
- 排查参数与请求结构时优先使用 `--dry-run`。
- `minute_token` 从录制 URL 尾段解析（`https://meetings.feishu.cn/minutes/{minute_token}`）。
- 拿到 `minute_token` 后，如果要妙记基础信息，优先传给 `minutes minutes get`；如果要下载媒体文件，传给 `minutes +download`；如果要逐字稿、总结、待办、章节，再传给 `minutes +detail --minute-tokens`。

## 参考

- [lark-vc](lark-vc-0.md#s-35c58c6881ec380e) — 视频会议全部命令
- [lark-vc-search](lark-vc-0.md#s-94a0ee79838d7347) — 搜索历史会议（获取 meeting_id）
- [lark-minutes-detail](lark-minutes-0.md#s-6c0b05ae720dbc9e) — 获取会议纪要


<a id="s-94a0ee79838d7347"></a>

## references/baseline/references/lark-vc-search.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +search

搜索已结束的历史会议记录，支持关键词、时间范围、组织者、参与者、会议室多条件过滤。只读，仅 `--as user`。

## 关键词使用边界

`--query` 只用于真实会议关键词，例如会议主题、项目名、评审名、客户名。用户只是说"我这月参加的所有视频会议"、"最近两周我组织的所有视频会议"、"总结主要议题 / 看看参会情况"时，本质是历史会议列表和后续总结，不要把"回顾"、"所有视频会议"、"总结主要议题"等动作词放进 `--query`。这类请求应先用时间范围 + `--participant-ids` / `--organizer-ids` 搜全量候选，再按结果继续取纪要或录制信息。

列表阶段只负责找会议记录；总结阶段必须继续取证。若用户要求"主要议题"、"主要决策"、"参会情况"，先确认搜索结果的 `meeting_id`、时间、组织者/参与者符合过滤条件，然后用 `vc +detail` 或 `minutes` 读取纪要、妙记或录制信息。没有纪要或妙记时，如实说明只能基于会议标题/参会数据汇总，不要编造议题。

## 典型触发表达

以下说法通常应优先使用 `vc +search`：

- 今天开过的会
- 今天开了哪些会
- 最近参加过哪些会
- 我这周开过的会
- 已结束的会议
- 历史会议记录

## 命令

```text
# 关键词搜索
lark-cli vc +search --query "周会"

# 查询某一天开过的会（单日查询时，start 和 end 必须填写同一天）
lark-cli vc +search --start 2026-03-10 --end 2026-03-10

# 按时间范围搜索
lark-cli vc +search --start "2026-03-10T00:00+08:00" --end "2026-03-17T00:00+08:00"

# 按组织者 / 参与者 / 会议室（逗号分隔）
lark-cli vc +search --organizer-ids "ou_user1,ou_user2"
lark-cli vc +search --participant-ids "ou_user1,ou_user2"
lark-cli vc +search --room-ids "123,456"

# 多条件组合
lark-cli vc +search --organizer-ids "ou_user1" --room-ids "123" --start "2026-03-10T00:00+08:00"

# 翻页
lark-cli vc +search --query "周会" --page-token "<PAGE_TOKEN>"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--query <text>` | 否 | 搜索关键词 |
| `--start <time>` | 否 | 开始时间（ISO 8601 或仅日期） |
| `--end <time>` | 否 | 结束时间（ISO 8601 或仅日期） |
| `--organizer-ids <ids>` | 否 | 组织者 open_id 列表，逗号分隔 |
| `--participant-ids <ids>` | 否 | 参与者 open_id 列表，逗号分隔 |
| `--room-ids <ids>` | 否 | 会议室 ID 列表，逗号分隔 |
| `--page-size <n>` | 否 | 每页数量，默认 `15`，最大 `30` |
| `--page-token <token>` | 否 | 翻页标记，用于获取下一页 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 核心约束

### 1. 至少提供一个过滤条件

所有参数均可选，但必须至少提供一个过滤条件：`--query`、`--start`、`--end`、`--organizer-ids`、`--participant-ids` 或 `--room-ids`。

没有真实关键词时，时间范围或人员过滤已经满足这个约束，`--query` 可以省略。

涉及"本月"、"最近两周"这类相对时间时，先基于执行当天计算 `"<YYYY-MM-DD>"` 占位符，再运行命令；不要沿用文档示例生成时的具体日期。

### 2. 仅搜索历史会议

`vc +search` 只能搜索已结束的历史会议记录，不用于查询未来日程。查询未来会议安排请使用 [lark-calendar]（按模块名读取对应工作流）。

### 3. 仅支持 user 身份

该接口仅支持 `user` 身份，使用前需完成 `lark-cli auth login` 并具备 `vc:meeting.search:read` 权限。

### 4. 支持分页

当返回 `has_more=true` 时，使用响应中的 `page_token` 配合 `--page-token` 获取下一页结果。

### 5. 机器人可同时加入多个会议

机器人支持同时加入多个正在进行中的会议；加入新会议前，不需要先退出已经在会中的其他会议。

这意味着：

- 不要假设 bot 一次只能在一个会议中
- 如果用户要求 bot 再加入另一场会，可以直接继续执行对应的入会命令
- 只有在用户明确要求结束某一场会中的 bot 参会时，才调用对应的离会命令

### 6. 日期型 `--end` 包含当天整天

当 `--end` 传入的是仅日期格式（如 `2026-03-10`）时，CLI 会将它解释为当天 `23:59:59`，而不是当天 `00:00:00`。

这意味着：

- `--start 2026-03-10 --end 2026-03-10` 表示只查 `2026-03-10` 当天
- `--start 2026-03-10 --end 2026-03-11` 表示查询 `2026-03-10` 和 `2026-03-11` 两天

如果用户说“昨天开过的会”“今天开过的会”“某一天开过的会”，应把 `--start` 和 `--end` 都设置为同一天，而不是把 `--end` 设成下一天。

## 时间格式

`--start` 和 `--end` 支持以下时间格式：

| 格式 | 示例 | 说明 |
|------|------|------|
| ISO 8601（带时区） | `2026-03-10T14:00:00+08:00` | 推荐 |
| ISO 8601（不带时区） | `2026-03-10T14:00:00` | 按本地时区解析 |
| 仅日期 | `2026-03-10` | 按天粒度解析；若用于 `--end`，表示当天 `23:59:59` |

## 输出结果

- 默认输出 JSON，包含 `items`、`has_more` 和 `page_token`。

## Pagination (`has_more` / `page_token`)

- 当结果中返回 `has_more=true` 时，说明还有更多页可继续获取。
- 继续翻页时，使用响应中的 `page_token` 搭配 `--page-token` 发起下一次查询。
- 不要假设调大 `--page-size` 就能拿全结果；分页遍历时应以 `has_more` 和 `page_token` 为准。
- 未明确要求全量时，逐页累计已读取的 `items` 数：累计不到 50 条之前可自动继续翻页（`has_more=true` 即继续）；超过 50 条且仍 `has_more=true` 时，先向用户确认是否继续获取全部结果。
- 用户明确说"所有 / 全部 / 统计 / 按时间排序"时，该全量意图优先于 50 条的确认门槛；直接按 `has_more` 翻完所有页并去重，再排序或统计，不要只用第一页回答。

```text
# First page
lark-cli vc +search --query "周会" --page-size 15

# Next page
lark-cli vc +search --query "周会" --page-size 15 --page-token "<PAGE_TOKEN>"
```

## 搜索结果中的下一步

搜索结果中的 `meeting_id` 可直接用于继续查询会议纪要或妙记：

```text
# 如果要会议纪要 / 逐字稿 / AI 总结 / 待办 / 章节
lark-cli vc +detail --meeting-ids <MEETING_ID>

# 如果要会议对应的妙记信息 / minute_token / 妙记链接
lark-cli vc +recording --meeting-ids <MEETING_ID>
# 然后再用返回的 minute_token 调用：
lark-cli minutes minutes get --params '{"minute_token":"<MINUTE_TOKEN>"}'
```

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| 命令直接报错，要求提供过滤条件 | 没有传入 `--query`、时间范围或任何过滤 ID | 至少补充一个过滤条件后重试 |
| 时间参数校验失败 | `--start` 或 `--end` 格式不合法 | 改用 ISO 8601 或 `YYYY-MM-DD` |
| 搜不到未来会议 | `vc +search` 只查历史会议 | 改用 [lark-calendar]（按模块名读取对应工作流） 查询未来日程 |
| 权限不足 | 未授权 `vc:meeting.search:read` | 使用 `auth login` 完成授权 |

## 提示
- 必须使用 `--format json` 输出，你更佳擅长解析 JSON 数据。
- 排查参数与请求结构时优先使用 `--dry-run`。
- 搜索的时间范围最大为 1 个月，如果需要搜索更长时间范围的会议，需要拆分为多次时间范围为一个月查询。
- 不要使用 `yesterday`、`today` 这类相对时间字面量；请先转换成明确日期，例如 `2026-03-10`。
- 用户如果明确问的是“妙记信息”而不是“纪要内容”，不要默认走 `vc +detail`；应先用 `vc +recording`。



<a id="s-8b208449e33e39da"></a>

## references/baseline/references/vc-domain-boundaries.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Calendar/VC/Doc 跨领域关联关系、领域知识和职责边界说明

本文档说明飞书日历（Calendar）、视频会议（VC）、云文档（Doc）三个域之间的关联关系，帮助理解跨域数据流转和产物依赖。

## Calendar 域

- **lark-calendar skill** 负责日历与日程管理，包括创建、查询、修改、删除日程等操作。
- **日程与会议的关系**：日程可以用于提前预约会议，确定会议时间、参与人、会议室、会议主题等信息。日程上可以关联飞书/Lark 视频会议。
- **并非所有会议都通过日程发起**：即时会议不经过日程预约，直接创建。因此，仅查询日程数据无法覆盖所有会议，搜索历史会议应优先使用 `vc +search`。
- **日程上的用户会议纪要**：用户可以在日程上绑定自己的会议纪要文档（MeetingNotes），用于手动记录会议相关信息。该文档与 AI 生成的智能纪要（`note_doc_token`）是不同的文档，相互独立。

> **路由规则**：查询过去已结束的会议 → `lark-vc`；查询未来日程/待开的会 → `lark-calendar`；查询"今天有哪些会议" → 两者结合（`vc +search` 查已结束 + `calendar` 查未开始）。

## VC 域

- **lark-vc skill** 负责视频会议管理，包括搜索历史会议、查询会议产物（智能纪要、逐字稿、妙记等）、查询参会人快照等操作。
- **会议类型**：会议可以是日程会议（由日程发起，有对应的 `calendar_event_id`），也可以是即时会议等其他类型。

### 会议产物

会议产物取决于会中开启的功能，分为两条独立链路：

#### 链路一：开启「AI 总结」

会中开启「AI 总结」功能后，产生以下产物：

| 产物 | Token 字段 | 本质 | 说明 |
|------|-----------|------|------|
| 智能纪要 | `note_doc_token` | 飞书文档 | AI 生成的会议总结与待办 |
| 逐字稿 | `verbatim_doc_token` | 飞书文档 | 完整的逐句发言记录（含说话人、时间戳）— **仅 `note_display_type=normal` 时是可读的独立文档**；`unified` 纪要的逐字稿用 `note +transcript --note-id <note_id>` 拉取（见下方 [Note 域](#note-域)） |
| 共享文档 | `shared_doc_token` | 飞书文档 | 会中投屏共享的文档信息 |

> **授权特性**：智能纪要总结文档及其逐字稿文档（总结文档尾部会挂逐字稿链接与会中投屏共享文档链接）在会后**自动授权给参会人**，参会人通常可直接读取，无需额外申请。

此外，还存在**用户会议纪要（MeetingNotes）**，对应 `meeting_note` 字段。这是用户主动绑定到日程的纪要文档，通常用于会前记录会议相关内容，与智能纪要文档相互独立。仅通过 [`calendar +meeting --event-ids`]（按模块名读取对应工作流） 路径返回。

#### 链路二：开启「录制」

会中开启「录制」功能后，产生**妙记产物**（`minute_token`）。注意：妙记不一定是会中产生的，用户上传音视频文件或录音也会产生妙记。妙记本身包含以下子产物：

| 子产物 | 说明 |
|--------|------|
| Summary（总结） | 对整场会议的智能总结 |
| Todo（待办） | 会议中识别出的待处理任务列表 |
| Chapter（章节） | 按讨论话题划分的核心内容摘要 |
| Transcript（文字记录） | 整场会议最原始的逐人发言记录 |

> **授权特性**：妙记带有**原始会议录制视频**，会后**不会自动授权给参会人**，需管理员主动授权或参会人主动申请后才能读取（含其 Summary/Todo/Chapter/Transcript 等产物）。因此当同一场会议既有智能纪要又有妙记时，参会人访问**智能纪要及其逐字稿**的门槛通常低于妙记。

#### 两条链路的独立性

- 智能纪要（AI 总结链路）和妙记（录制链路）**相互独立、互不影响**。
- 一场会议可能同时拥有两类产物，也可能只有其中一类，也可能都没有。
- 当两者都存在时，Summary/Todo 内容可能重叠，应根据用户意图选择优先读取哪个。

> **产物选择决策**：
> - **AI 产物 vs 原始记录**：智能总结、待办、章节都属于 AI 分析产物，可能只包含最终结论和关键信息。
>   - **用户要求"提炼/总结/重新总结/整理/回顾"会议内容时** → **内容总结必须从逐字稿/文字记录出发，基于原始对话独立分析**。禁止直接搬运 AI 纪要的总结作为最终输出——那只是对 AI 产物的重新排版，不是独立提炼。
>   - **用户要求查看待办或章节时** → **应参考 AI 产物的待办和章节**，因为 AI 产物的待办更友好（包含提出人和负责人），章节按话题划分更结构化。
>   - **用户只想直接看 AI 总结结果** → 使用 AI 产物的总结。
> - **智能纪要 vs 妙记的选择规则**（适用于总结、待办、逐字稿等重复产物，含逐字稿/原始记录）：
>   - **只存在一类产物** → 用存在的那一类。
>   - **两类都存在、用户明确指定了其中一类**（如"看妙记的逐字稿""用妙记总结"）→ **语义指向哪个就走哪个链路，不要自作主张改道**。
>   - **两类都存在、用户未指定** → **默认用智能纪要及其逐字稿**（智能纪要及逐字稿会后自动授权给参会人，访问门槛更低；妙记含原始录制视频、不自动授权，需申请）。


#### 逐字稿与文字记录的格式

智能纪要的逐字稿（`normal` 纪要的 `verbatim_doc_token` 文档、`unified` 纪要的 `note +transcript` 输出）和妙记的文字记录（Transcript）都记录了用户原始对话内容，格式一致：

```
发言人名称 相对时间戳
<发言内容>
```

示例：

```
张三 00:00:00.195
我们接下来讨论一下项目进度。
```

- 第一行为发言人信息，包含用户名称和发言的相对时间（从会议开始计算的偏移量）。
- 后续行为该发言人的发言内容，直到下一个发言人标记出现。

### 会议总结和分析流程

#### Step 1: 定位会议

根据关键字、组织者、参与人、会议室等条件搜索会议，获取会议列表。

> **不要把纪要标题当会议线索：** 如果用户说“查询 xx 纪要的逐字稿 / 原始记录 / 谁说了什么”，且没有 `meeting_id`、`calendar_event_id`、会议号、参会人或时间范围，先用 `drive +search --query <标题>` 搜索纪要文档，拿到 Docx URL/token 后再 `docs +fetch`。若返回 `<vc-transcribe-tab vc-node-id="...">`，提取 `note_id` 后进入 Note 域判断 `normal` / `unified`；若没有该 block，但有“文字记录/逐字稿” Docx 链接，直接用 `docs +fetch` 读取该链接。

```text
lark-cli vc +search --start "<YYYY-MM-DD>" --end "<YYYY-MM-DD>" --format json
```

详细用法请阅读 [`lark-vc-search.md`](lark-vc-0.md#s-94a0ee79838d7347)。

#### Step 2: 根据 meeting_id 查询产物

##### 获取会议产物

当用户提供 `meeting_id` 并需要会议产物时，先用 `vc +detail` 拿到 `note_id` 和 `minute_token`：

```text
lark-cli vc +detail --meeting-ids '<meeting_id1>,<meeting_id2>'
```

详细用法请阅读 [`lark-vc-detail.md`](lark-vc-0.md#s-e05238971ddb666c)。

**优先路径：通过 `note_id` 获取纪要产物**

如果用户未明确要求使用妙记，且返回了 `note_id`，**优先**使用 `note +detail` 获取纪要文档的 token 信息：

```text
lark-cli note +detail --note-id <note_id>
```

可获取会议的所有产物信息，包括：
- 纪要标识（`note_id`）与展示类型（`note_display_type`：`unknown` / `normal` / `unified`）— 决定逐字稿走哪条路由
- 智能纪要（`note_doc_token`）— AI 生成的总结和待办信息
- 逐字稿（`verbatim_doc_token`）— 完整的会中发言记录（仅 `normal` 纪要可直接读取该文档）
- 共享文档（`shared_doc_token`）— 会中投屏共享的文档

拿到文档 token 后，再通过 Doc 域 `docs +fetch` 拉取文档正文内容（见 Step 3）。详细用法请阅读 [`lark-note-detail.md`](lark-note-0.md#s-e01d46e9f47a8234)。

**备选路径：通过 `minute_token` 获取妙记产物**

如果 `note_id` 为空，或用户明确要求使用妙记产物，则使用 `minutes +detail` 获取妙记的具体产物：

```text
# 必须显式指定要获取的产物 flag，至少传一个；不传则不会返回任何产物内容
lark-cli minutes +detail --minute-tokens '<minute_token1>,<minute_token2>' \
  --summary --todo --chapter --keyword --transcript
```

> **注意**：`minutes +detail` 需要**手动指定**要获取的产物 flag，可选 `--summary`（总结）、`--todo`（待办）、`--chapter`（章节）、`--keyword`（关键词）、`--transcript`（文字记录）。**未传任何产物 flag 时不会返回产物内容**，请按用户诉求按需指定。详细用法请阅读 [`lark-minutes-detail.md`](lark-minutes-0.md#s-6c0b05ae720dbc9e)。

#### Step 3: 按 `note_display_type` 拉取正文 / 逐字稿

智能纪要（`note_doc_token`）是飞书文档，使用 `docs +fetch` 读取正文内容；**逐字稿的读取方式由 `note_display_type` 决定**：

```text
# 纪要正文（两种展示类型都适用）
lark-cli docs +fetch --doc <note_doc_token> --doc-format markdown

# note_display_type=normal：逐字稿是独立文档
lark-cli docs +fetch --doc <verbatim_doc_token> --doc-format markdown

# note_display_type=unified：逐字稿不是独立文档，按 note_id 拉取
lark-cli note +transcript --note-id <note_id>
```

详细用法请参考 [lark-doc]（按模块名读取对应工作流） 与 [lark-note](lark-note-0.md#s-7bca76187d2c4f4f) skill。

#### Step 4: 判断用户需要的产物内容

- 根据用户诉求（总结/待办/章节/完整发言记录等），选择合适的产物进行分析和信息提取
- 如果两种产物都不存在或没有权限，需如实告知用户

## Note 域

- VC 只负责从 `meeting_id` 定位会议产物和 `note_id` / `minute_token`（[`vc +detail`](lark-vc-0.md#s-e05238971ddb666c)）。
- 已知 `note_id` 后切到 [lark-note](lark-note-0.md#s-7bca76187d2c4f4f)；逐字稿路由以 `lark-note` 的 `note_display_type` 规则为准。
- 已知 `minute_token` 时，[`minutes +detail`](lark-minutes-0.md#s-6c0b05ae720dbc9e) 顶层会一并返回该妙记关联的 `note_id`（如有）；可直接传给 `note +detail` 取纪要文档 token，无需绕回 VC。
- 仅有日程 `event_id` 时，先走 [`calendar +meeting`]（按模块名读取对应工作流） 拿到 `meeting_id` 或用户绑定的 `meeting_note`，再按上述路径继续。
- 只有自然语言纪要标题时，先走文档搜索与 `docs +fetch`；只有 `<vc-transcribe-tab vc-node-id="...">` 的 `vc-node-id` 可以进入 Note 域。
- `doc_token` / Docx URL 不是 `note_id`。没有 `vc-node-id` 时不要反推 Note，继续按 Doc 域读取正文或正文中明确给出的逐字稿文档。

## Doc 域

- **lark-doc skill** 负责飞书云文档管理，包括获取文档元信息、读取文档内容、创建和编辑文档等操作。
- **会议产物的文档本质**：智能纪要（`note_doc_token`）和 `normal` 纪要的逐字稿（`verbatim_doc_token`）都是飞书文档，需要通过 `lark-doc` 的 API（如 `docs +fetch`）查询其内容和元信息；`unified` 纪要的逐字稿不是独立文档，用 `note +transcript` 拉取（[lark-note](lark-note-0.md#s-7bca76187d2c4f4f)）。
- **文档元信息查询**：获取文档名称、URL 等基本信息时，使用 `drive metas batch_query`；获取文档正文内容时，使用 `docs +fetch`。

## 三域关联总览

```
Calendar (日程) ──── 发起预约 ────► VC (会议)
                                       │
                    ┌──────────────────┤
                    │                  │
              AI 总结链路           录制链路
                    │                  │
                    ▼                  ▼
            智能纪要 (Doc)        妙记 (Minutes)
            逐字稿 (Doc)         ├── Summary
            共享文档 (Doc)        ├── Todo
            用户纪要 (Doc)        ├── Chapter
                                └── Transcript
```

- Calendar 提供会议预约入口，但并非所有会议都来自日程。
- VC 是会议数据的中心，管理会议记录和产物关联。
- Doc 是会议产物的载体，智能纪要和逐字稿都以飞书文档形式沉淀，需通过 Doc 域 API 读取。


<a id="s-63a67430100a7f3e"></a>

## references/baseline-index.md

# 兼容参考

- [lark-vc-detail.md](lark-vc-0.md#s-e05238971ddb666c)
- [lark-vc-recording.md](lark-vc-0.md#s-1ff93ed6418e9203)
- [lark-vc-search.md](lark-vc-0.md#s-94a0ee79838d7347)
- [vc-domain-boundaries.md](lark-vc-0.md#s-8b208449e33e39da)


<a id="s-20c66225c4b0ac15"></a>

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


<a id="s-e12bfee45aa4775d"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Compatibility entry

本技能只用于兼容旧名称，不直接处理业务。

**MUST 完整读取 [`../lark-meeting/SKILL.md`](lark-meeting-0.md#s-d18634841861885e)，并按照其中的路由和行动指南执行。**
