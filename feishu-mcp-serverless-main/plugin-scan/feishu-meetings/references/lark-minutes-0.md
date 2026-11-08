<a id="s-c357b92850015e0b"></a>

## SKILL.md


# minutes

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 读取 lark-meeting 的流程，使用 minutes_token 查实际产物。基本信息或统计成功不能冒充逐字稿和音视频已读取。

## 按需参考

- [工具与合同](lark-minutes-0.md#s-9876b9be32f6091e)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-minutes-0.md#s-da454629ccc7a464)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-minutes-0.md#s-70582d9120c717a1)。


<a id="s-6c0b05ae720dbc9e"></a>

## references/baseline/references/lark-minutes-detail.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# minutes +detail

通过 `minute_token` 查询妙记详情，按需获取 AI 产物（总结/待办/章节/逐字稿/关键词）。只读。

> `--summary` / `--todo` / `--chapter` / `--keyword` / `--transcript` 至少一个；不传任何产物 flag 时只返回基础信息（如 `title`），AI 产物字段都不会出现。一次性获取所有产物：`--summary --todo --chapter --keyword --transcript`。

## 命令

```text
# 仅基础信息
lark-cli minutes +detail --minute-tokens obcxxxxxxxxxx

# 批量（逗号分隔，最多 50 个）
lark-cli minutes +detail --minute-tokens obcxxx,obcyyy --summary --todo

# 全产物
lark-cli minutes +detail --minute-tokens obcxxx --summary --todo --chapter --keyword --transcript

# 仅逐字稿，覆盖已有文件，指定输出目录
lark-cli minutes +detail --minute-tokens obcxxx --transcript --overwrite --output-dir ./out
```

## 输出

`minutes` 数组每条含 `minute_token`、`title`、`note_id`、`artifacts`。`note_id` 仅在该妙记关联了会议纪要时返回，可直接传给 [`note +detail`](lark-note-0.md#s-e01d46e9f47a8234) 拿纪要文档 token，无需再绕回 `vc +detail`。`artifacts` 中**只包含本次请求的产物**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `artifacts.summary` | string | AI 总结。 |
| `artifacts.todos` | array | 待办事项列表。 |
| `artifacts.chapters` | array | 章节列表。 |
| `artifacts.keywords` | array | 关键词列表。 |
| `artifacts.transcript_file` | string | 逐字稿本地文件路径。 |

逐字稿默认落地 `./minutes/{minute_token}/transcript.txt`，与 `minutes +download` 同目录便于聚合。指定 `--output-dir <dir>` 时改写到 `<dir>/artifact-{title}-{minute_token}/transcript.txt`。

## minute_token 来源

| 来源 | 取值字段 |
|------|---------|
| 妙记 URL `https://*.feishu.cn/minutes/obcxxx` | 截路径最后一段 `obcxxx` |
| `vc +detail --meeting-ids` | `minute_token` |
| `vc +recording --meeting-ids` | `minute_token` |
| `minutes +search` | `minute_token` |

## 典型链路：从 minute_token 拿纪要文档 token

只持有 `minute_token`（如妙记 URL 入口），又想拿 AI 智能纪要 / 逐字稿文档时：

```text
# 1. 取妙记关联的 note_id，没有关联会议纪要则为空
lark-cli minutes +detail --minute-tokens <minute_token>

# 2. 用 note_id 拿 note_doc_token / verbatim_doc_token / shared_doc_tokens
lark-cli note +detail --note-id <note_id>

# 3. 读纪要 / 逐字稿正文
lark-cli docs +fetch --api-version v2 --doc <note_doc_token> --doc-format markdown
```

> `minute_token` 不要直接传给 `note +detail`：必须先用本命令拿到 `note_id` 再调用 `note +detail`。


<a id="s-2b7c200fc360523a"></a>

## references/baseline/references/lark-minutes-download.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# minutes +download


下载妙记的音视频媒体文件到本地，或获取有效期 1 天的下载链接。只读操作。

本 skill 对应 shortcut：`lark-cli minutes +download`。

## 命令

```text
# 下载妙记（默认布局，落到 ./minutes/{minute_token}/<server-filename>）
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx

# 指定输出文件（单 token，文件路径）
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx --output ./meeting.mp4

# 指定输出目录（单/批量均可，目录路径）
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx --output-dir ./downloads

# 仅获取下载链接（有效期 1 天），不下载文件
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx --url-only

# 批量下载多个妙记（默认布局，逐个落到 ./minutes/{minute_token}/）
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx,obcnyyyyyyyyyyyyyyyyyyyy

# 批量下载到同一指定目录
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx,obcnyyyyyyyyyyyyyyyyyyyy --output-dir ./downloads

# 预览 API 调用
lark-cli minutes +download --minute-tokens obcnxxxxxxxxxxxxxxxxxxxx --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-tokens <tokens>` | 是 | 妙记 Token，逗号分隔支持批量（最多 50 个） |
| `--output <path>` | 否 | 输出文件路径（单 token）。若传入的是已存在目录，等价于 `--output-dir`。与 `--output-dir` 互斥 |
| `--output-dir <dir>` | 否 | 输出目录（单/批量均可）。与 `--output` 互斥 |
| `--overwrite` | 否 | 覆盖已存在的输出文件 |
| `--url-only` | 否 | 仅返回下载链接，不下载文件 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

> **默认落点**：未指定 `--output` / `--output-dir` 时，文件落到 `./minutes/{minute_token}/<server-filename>`。文件名沿用服务端 Content-Disposition / Content-Type 推断，Agent 可从 `saved_path` 字段读取实际路径。同一 minute_token 的录像和 `minutes +detail` 的逐字稿默认会落在**同一目录**下，方便聚合。

## 核心约束

### 1. 妙记必须已完成转写

音视频文件仅在妙记转写完成后可下载。如果妙记尚未准备好，API 会返回 `2091003` 错误。

### 2. 下载链接有效期 1 天

`--url-only` 返回的链接有效期为 1 天，过期后需重新获取。

### 3. 频率限制

API 限流 5 次/秒，批量下载时需注意控制频率。

### 4. 所需权限

| 身份 | 所需权限 |
|------|---------|
| user / bot | `minutes:minutes.media:export` |

## 输出结果

### 下载模式（默认）

单 token：

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "artifact_type": "recording",
  "saved_path": "/path/to/minutes/obcnxxxxxxxxxxxxxxxxxxxx/访谈一则.m4a",
  "size_bytes": 52428800
}
```

批量：`downloads` 数组，每条与上面结构一致，失败项带 `error` 字段。

| 字段 | 说明 |
|------|------|
| `minute_token` | 妙记 Token（用于 Agent 索引） |
| `artifact_type` | 固定为 `"recording"`（与 `minutes +detail` 的 `"transcript"` 区分） |
| `saved_path` | 文件保存的本地路径（绝对路径） |
| `size_bytes` | 文件大小（字节） |

### URL 模式（--url-only）

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "download_url": "https://..."
}
```

| 字段 | 说明 |
|------|------|
| `minute_token` | 妙记 Token |
| `download_url` | 媒体文件下载链接（有效期 1 天） |

## 如何获取 minute_token

| 来源 | 获取方式 |
|------|---------|
| 妙记 URL | 从 URL 末尾提取，如 `https://sample.feishu.cn/minutes/obcnxxxxxxxxxxxxxxxxxxxx` → `obcnxxxxxxxxxxxxxxxxxxxx` |
| 妙记元信息查询 | `lark-cli minutes minutes get --params '{"minute_token": "obcn..."}'` |
| 会议录制查询 | `lark-cli vc +recording --meeting-ids <id>` 或 `lark-cli vc +recording --calendar-event-ids <event_id>` |

## 常见错误与排查

| 错误现象 | 错误码 | 根本原因 | 解决方案 |
|---------|--------|---------|---------|
| 参数无效 | 2091001 | minute_token 格式不正确 | 检查 token 是否完整（24 位） |
| 资源不存在 | 2091002 | token 不存在 | 确认 minute_token 正确 |
| 妙记尚未准备好 | 2091003 | 转写未完成 | 等待转写完成后重试 |
| 资源已删除 | 2091004 | 妙记已被删除 | 确认妙记文件仍然存在 |
| 权限不足 | 2091005 | 无阅读权限 | 检查是否有该妙记的访问权限 |
| `missing required scope(s)` | — | 应用缺少权限 | 运行 `auth login --scope "minutes:minutes.media:export"` |

## 提示

- 音视频文件可能较大，下载无固定超时限制（由用户 Ctrl+C 控制取消）。
- 默认落点 `./minutes/{minute_token}/` 与 `minutes +detail` 的逐字稿共享同一目录，方便 Agent 聚合同一会议的所有产物。
- 单 token 模式下 `--output` 若传入已存在目录（如 `--output ./existing-dir`），等价于 `--output-dir`，文件落入该目录（cp 语义）。
- 批量模式下 `--output` 不接受已存在的文件路径（会报错），应改用 `--output-dir`。
- 如需获取妙记的纪要内容（逐字稿、AI 总结等），请使用 [minutes +detail](lark-minutes-0.md#s-6c0b05ae720dbc9e)。

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) — 妙记全部命令
- [lark-minutes-detail](lark-minutes-0.md#s-6c0b05ae720dbc9e) — 妙记详情与 AI 产物查询


<a id="s-f6f0810cec79053b"></a>

## references/baseline/references/lark-minutes-search.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +search


搜索妙记列表，支持关键词、所有者、参与者以及时间范围等多条件过滤。所有者与参与者都支持传入多个 open\_id，也支持传入 `me` 表示当前用户。只读操作，不修改任何妙记数据。

本 skill 对应 shortcut：`lark-cli minutes +search`（调用 `POST /open-apis/minutes/v1/minutes/search`）。

## 典型触发表达

以下说法通常应优先使用 `minutes +search`：

- 我的妙记
- 我拥有的妙记
- 我参与的妙记
- 最近的妙记
- 某个关键词的妙记
- 某段时间内的妙记

## 命令

```text
# 关键词搜索
lark-cli minutes +search --query "预算复盘"

# 查询某一天内的妙记（单日查询时，建议将 start 和 end 都填写为同一天）
lark-cli minutes +search --start 2026-03-10 --end 2026-03-10

# 按时间范围搜索
lark-cli minutes +search --start "2026-03-10T00:00+08:00" --end "2026-03-17T00:00+08:00"
lark-cli minutes +search --start 2026-03-10 --end 2026-03-17

# 关键词 + 时间范围
lark-cli minutes +search --query "预算复盘" --start "2026-03-10T00:00+08:00" --end "2026-03-17T00:00+08:00"
lark-cli minutes +search --query "预算复盘" --start "2026-03-10T00:00+08:00"
lark-cli minutes +search --query "预算复盘" --end "2026-03-17T00:00+08:00"

# 按参与者过滤（open_id，逗号分隔）
lark-cli minutes +search --participant-ids "ou_x,ou_y"

# 按所有者过滤（open_id，逗号分隔）
lark-cli minutes +search --owner-ids "ou_owner,ou_owner_2"

# 严格只查我作为参与者的妙记（不含我拥有）
lark-cli minutes +search --participant-ids "me"

# 查询我拥有的妙记
lark-cli minutes +search --owner-ids "me"

# 广义查询我参与的妙记（自然语言默认：我拥有 ∪ 我参与）
lark-cli minutes +search --owner-ids "me" --start 2026-03-10 --end 2026-03-10
lark-cli minutes +search --participant-ids "me" --start 2026-03-10 --end 2026-03-10
# 然后按 token 去重合并两次结果

# 多条件组合查询
lark-cli minutes +search --owner-ids "ou_owner" --participant-ids "ou_x" --start "2026-03-10T00:00+08:00"

# 分页查询
lark-cli minutes +search --query "预算复盘" --page-size 20
lark-cli minutes +search --query "预算复盘" --page-size 20 --page-token '<PAGE_TOKEN>'

# 输出为结构化 JSON
lark-cli minutes +search --query "预算复盘" --format json
```

## 参数

| 参数                        | 必填 | 说明                                   |
| ------------------------- | -- | ------------------------------------ |
| `--query <text>`          | 否  | 搜索关键词                                |
| `--owner-ids <ids>`       | 否  | 所有者 open\_id 列表，逗号分隔；支持传 `me` 表示当前用户 |
| `--participant-ids <ids>` | 否  | 参与者 open\_id 列表，逗号分隔；支持传 `me` 表示当前用户 |
| `--start <time>`          | 否  | 开始时间（ISO 8601 或仅日期）                  |
| `--end <time>`            | 否  | 结束时间（ISO 8601 或仅日期）                  |
| `--page-size <n>`         | 否  | 每页数量，默认 `15`，最大 `30`                 |
| `--page-token <token>`    | 否  | 下一页分页 token                          |
| `--dry-run`               | 否  | 预览 API 调用，不执行                        |

## 核心约束

### 1. 至少提供一个过滤条件

所有参数均可选，但必须至少提供一个过滤条件：`--query`、`--owner-ids`、`--participant-ids`、`--start` 或 `--end`。

### 2. 仅支持 user 身份

该接口仅支持 `user` 身份，使用前需完成 `lark-cli auth login` 并具备 `minutes:minutes.search:read` 权限。

### 3. `me` 表示当前用户

在 `--owner-ids` 和 `--participant-ids` 中可使用 `me`，表示当前登录用户。该值会在本地解析为当前用户的 `open_id`，无需手动先查询自己的用户 ID。
若当前环境尚未完成用户登录，或 CLI 无法解析出当前用户的 `open_id`，则应先执行 `lark-cli auth login`，再重新执行搜索。

### 4. 自然语言中的“参与的妙记”默认按并集理解

当用户说"我参与的妙记""我参加过的妙记""参与过的妙记"时，默认理解为"我涉及的全部妙记"：

- 我拥有的妙记：`--owner-ids me`
- 我作为参与者的妙记：`--participant-ids me`

不要只跑一次 `--participant-ids me` 就直接下结论，也不要把 `--owner-ids me` 和 `--participant-ids me` 同时塞进一次查询里赌接口语义。应分别查询后，按 `token` 做并集去重。

只有在用户明确说"仅我参与但不是我拥有""别人拥有但我参与""只看参与者身份"时，才只使用 `--participant-ids`。

### 5. 支持分页

当返回 `has_more=true` 时，使用响应中的 `page_token` 配合 `--page-token` 获取下一页结果。

### 6. 日期型 `--end` 包含当天整天

当 `--end` 传入的是仅日期格式（如 `2026-03-10`）时，CLI 会将它解释为当天 `23:59:59`，而不是当天 `00:00:00`。
CLI 会先按输入的本地日历日语义解析，再标准化为 RFC3339 时间戳发给 API；在 dry-run 或排查请求体时，看到的 `Z` 结尾时间表示同一个绝对时间点的 UTC 表示，不改变“按当天整天查询”的语义。

这意味着：

- `--start 2026-03-10 --end 2026-03-10` 表示只查 `2026-03-10` 当天
- `--start 2026-03-10 --end 2026-03-11` 表示查询 `2026-03-10` 和 `2026-03-11` 两天

如果用户说“昨天的妙记”“今天的妙记”“某一天内的妙记”，应把 `--start` 和 `--end` 都设置为同一天，而不是把 `--end` 设成下一天。

### 7. 会议的妙记先定位会议

如果用户明确要找某场会议的妙记，或同时提到“会议 / 开会 / 会”和“妙记”，应优先使用 `vc +search` 先定位会议，再按需通过 `vc +recording` 获取 `minute_token`，不要直接按妙记时间范围或关键词搜索。
只有在无法通过会议搜索定位目标会议，或用户明确要求按妙记维度检索时，才回退到 `minutes +search`。

如果用户要的是"某场会议的妙记信息""某个日程对应的妙记详情""minute\_token""妙记链接""标题""时长""owner"，正确链路是：

1. `vc +search` 或 `calendar +agenda` 先定位会议 / 日程
2. `vc +recording` 获取 `minute_token`
3. `minutes minutes get` 查询妙记基础信息

<br />

## 时间格式

`--start` 和 `--end` 支持以下时间格式：

| 格式             | 示例                          | 说明                                 |
| -------------- | --------------------------- | ---------------------------------- |
| ISO 8601（带时区）  | `2026-03-10T14:00:00+08:00` | 推荐                                 |
| ISO 8601（不带时区） | `2026-03-10T14:00:00`       | 按本地时区解析                            |
| 仅日期            | `2026-03-10`                | 按天粒度解析；若用于 `--end`，表示当天 `23:59:59` |

## 输出结果

- 默认输出包含 `items`、`has_more` 和 `page_token`。

## Pagination (`has_more` / `page_token`)

- 当结果中返回 `has_more=true` 时，说明还有更多页可继续获取。
- 继续翻页时，使用响应中的 `page_token` 搭配 `--page-token` 发起下一次查询。
- 不要假设调大 `--page-size` 就能拿全结果；分页遍历时应以 `has_more` 和 `page_token` 为准。
- 当 `has_more=true` 时，逐页累计已读取的 `items` 数：累计不到 50 条之前可自动继续翻页；超过 50 条后应停下来向用户确认是否获取全部结果。

```text
# First page
lark-cli minutes +search --query "预算复盘" --page-size 20

# Next page
lark-cli minutes +search --query "预算复盘" --page-size 20 --page-token '<PAGE_TOKEN>'
```

## 搜索结果中的下一步

搜索结果中的 `token` 可直接作为 `minute_token` 用于继续查询妙记产物：
通常先用搜索结果中的 `token` 获取妙记基础信息，确认描述、链接等元数据是否命中目标；只有需要进一步查看逐字稿、总结、待办、章节时，再继续查询关联的纪要产物。

如果你已经确定目标妙记，优先直接复用搜索结果中的 `token`，避免重复搜索。

```text
# 首先查询妙记元信息（标题、时长、封面） → 用本 skill
lark-cli minutes minutes get --params '{"minute_token": "obcn***************"}'

# 查妙记关联的产物(--summary --todo --chapter --keyword --transcript 按需返回)
lark-cli minutes +detail --minute-tokens <minute_token> --summary
```

## 常见错误与排查

| 错误现象                   | 根本原因                                                  | 解决方案                                         |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------- |
| 命令直接报错，要求提供过滤条件        | 没有传入 `--query`、时间范围或任何过滤 ID                           | 至少补充一个过滤条件后重试                                |
| 时间参数校验失败               | `--start` 或 `--end` 格式不合法                             | 改用 ISO 8601 或 `YYYY-MM-DD`                   |
| `owner-ids` 校验失败       | 传入的不是 open\_id，且也不是 `me`；或传了 `me` 但当前用户 open\_id 不可解析 | 改为 `ou_` 开头的用户 ID，或先完成 `auth login` 后再传 `me` |
| `participant-ids` 校验失败 | 传入的不是 open\_id，且也不是 `me`；或传了 `me` 但当前用户 open\_id 不可解析 | 改为 `ou_` 开头的用户 ID，或先完成 `auth login` 后再传 `me` |
| 权限不足                   | 未授权 `minutes:minutes.search:read`                     | 使用 `auth login` 完成授权                         |

## 提示

- 当用户说“我的妙记”时，优先理解为 `--owner-ids me`。
- 当用户说“我参与的妙记”“我参加过的妙记”时，默认理解为 `--owner-ids me` 与 `--participant-ids me` 两次查询后的并集。
- 当用户明确说“仅我参与但不是我拥有”时，才优先理解为 `--participant-ids me`。
- 当用户同时提到“会议 / 会 / 开会 / 某场会”和“妙记”时，优先先定位会议；如果要的是妙记信息，走 `vc +recording` 获取 `minute_token` → `minutes minutes get`，只有要妙记产物内容时才走 `minutes +detail --minute-tokens`。
- 必须使用 `--format json` 输出，你更加擅长解析 JSON 数据。
- 排查参数与请求结构时优先使用 `--dry-run`。
- 搜索的时间范围最大为 1 个月，如果需要搜索更长时间范围的妙记，需要拆分为多次时间范围为一个月查询。

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) -- 妙记相关命令
- [lark-minutes-detail](lark-minutes-0.md#s-6c0b05ae720dbc9e) -- 基于 `minute_token` 获取逐字稿、总结、待办、章节等产物
- [lark-vc](lark-vc-0.md#s-35c58c6881ec380e) -- 视频会议全部命令



<a id="s-c0bdff48f9c607a4"></a>

## references/baseline/references/lark-minutes-speaker-replace.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +speaker-replace


替换妙记逐字稿中的说话人身份：把妙记逐字稿里"原说话人"对应的所有发言段，重新归属到"新说话人"。常用于解决妙记自动识别错说话人，或需要把外部/非飞书说话人改绑到正确飞书用户的场景。

本 skill 对应 shortcut：`lark-cli minutes +speaker-replace`。

## 典型触发表达

- "把这条妙记里 A 的发言改成 B"
- "妙记说话人识别错了，帮我把张三的部分换成李四"
- "把妙记里外部说话人 / 非飞书说话人的发言改成某个飞书用户"
- "妙记说话人修改 / 替换 / 重新归属"

## 完整工作流

识别到「修改妙记说话人」需求后，**必须**按以下顺序执行；**禁止**把展示名直接传给 `--from-speaker-id`。

1. **确认 `minute_token`**
   - 从妙记 URL、搜索或 VC 链路取得 `minute_token`。

2. **查说话人列表（必须先做）**
   - 用 **`lark-cli api`** 直接调用内部 HTTP 接口：
     ```text
     lark-cli api GET "/open-apis/minutes/v1/minutes/<minute_token>/transcript/speakerlist" --as user
     ```
   - 返回 `data.speakers[]`，每项含 `speaker_id`（不透明 id）与 `name`（逐字稿展示名）。示例：
     ```json
     {
       "data": {
         "speakers": [
           {"speaker_id": "ENCRYPTED_TOKEN_ABC", "name": "说话人1"},
           {"speaker_id": "ENCRYPTED_TOKEN_DEF", "name": "说话人2"}
         ]
       }
     }
     ```

3. **解析 `--from-speaker-id`**
   - 根据用户描述的原说话人（展示名，如「说话人1」「张三」），在 `speakers[]` 里按 `name` **精确匹配**，取对应的 **`speaker_id`** 作为 `--from-speaker-id` 的值。
   - **`--from-speaker-id` 只传 `speaker_id`，不传展示名。**
   - 若同名有多条（`name` 相同、`speaker_id` 不同）：**不要擅自挑选**。可结合 [`vc +notes --minute-tokens`](lark-meeting-0.md#s-70f05555aba6167f) 对照各人发言内容，请用户确认后再用精确的 `speaker_id`。
   - 若列表中无匹配展示名：告知用户并核对拼写，或请用户在妙记页面确认标签。

4. **解析 `--to-user-id`**
   - 新说话人必须是 `ou_` 开头的 open_id。用户只给姓名时，先用 [lark-contact]（按模块名读取对应工作流） 解析。

5. **执行替换**
   ```text
   lark-cli minutes +speaker-replace \
     --minute-token obcnxxxxxxxxxxxxxxxxxxxx \
     --from-speaker-id ENCRYPTED_TOKEN_ABC \
     --to-user-id ou_new_speaker_open_id
   ```

## 命令示例

```text
# 1. 先查列表（裸调 HTTP）
lark-cli api GET "/open-apis/minutes/v1/minutes/obcnxxxxxxxxxxxxxxxxxxxx/transcript/speakerlist" --as user

# 2. 再替换（from-speaker-id 来自上一步的 speaker_id）
lark-cli minutes +speaker-replace \
  --minute-token obcnxxxxxxxxxxxxxxxxxxxx \
  --from-speaker-id ENCRYPTED_TOKEN_ABC \
  --to-user-id ou_new_speaker_open_id
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-token <token>` | 是 | 妙记的唯一标识，可从妙记 URL 末尾路径提取 |
| `--from-speaker-id <id>` | 是 | 被替换的原说话人 **`speaker_id`**（来自 speakerlist API 的 `data.speakers[].speaker_id`） |
| `--to-user-id <ou_xxx>` | 是 | 新的说话人，**必须是 `ou_` 开头的 open_id**，不支持用户名 |

## 核心约束

### 1. 必须先查 speakerlist，再替换

Agent 必须先 `lark-cli api GET .../speakerlist`，再 `+speaker-replace`；`--from-speaker-id` 只接受 `speaker_id`。

`+speaker-replace` **不会**自己请求 speakerlist：`--from-speaker-id` 的值会原样发给替换接口。整条链路只在 Agent 一开始查一次 speakerlist，务必传入上一步拿到的 `speaker_id`（不要传展示名，否则替换接口会返回 speaker-not-found）。

### 2. 新说话人必须是 open_id

`--to-user-id` 仅支持 `ou_` 开头的 open_id，**不支持直接传姓名**；如果用户只给了姓名，请先用 [lark-contact]（按模块名读取对应工作流） 把姓名解析成 `open_id`。

### 3. 历史参数

存在一个隐藏的历史参数 `--from-user-id`（飞书说话人的 open_id），仅为向后兼容保留；新流程请一律使用 `--from-speaker-id` + `speaker_id`。

## 认证与权限

- 所需 scope：`minutes:minutes:readonly`（内部解析说话人）、`minutes:minutes:update`（执行替换）。

## 输出结果

| 字段 | 说明 |
|------|------|
| `minute_token` | 被修改的妙记 Token，与输入的 `--minute-token` 一致 |
| `from_speaker_id` | 实际用于替换的不透明说话人标识 |
| `to_user_id` | 替换后的新说话人 open_id，与输入的 `--to-user-id` 一致 |

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) -- 妙记相关功能说明


<a id="s-250fbb3ff4fdd227"></a>

## references/baseline/references/lark-minutes-summary.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +summary


替换妙记的 AI 总结内容。写操作，会覆盖当前总结。

本 skill 对应 shortcut：`lark-cli minutes +summary`（调用 `PUT /open-apis/minutes/v1/minutes/{minute_token}/summary`）。

## 典型触发表达

- "把这条妙记的总结改成……"
- "更新 / 替换妙记的 AI 总结"
- "修正总结内容后写回妙记"

## 命令

```text
# 直接传入总结内容（Markdown 子集）
lark-cli minutes +summary --minute-token obcnxxxxxxxxxxxxxxxxxxxx --summary "**会议结论**\n- 方案 A 通过\n- 下周跟进排期"

# 从文件读取总结内容
lark-cli minutes +summary --minute-token obcnxxxxxxxxxxxxxxxxxxxx --summary @summary.md

# 从 stdin 读取
echo "**结论**" | lark-cli minutes +summary --minute-token obcnxxxxxxxxxxxxxxxxxxxx --summary @-

# 预览 API 调用
lark-cli minutes +summary --minute-token obcnxxxxxxxxxxxxxxxxxxxx --summary @summary.md --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-token <token>` | 是 | 妙记 Token |
| `--summary <text>` | 是 | 替换后的总结内容，支持 `@file` / `@-`（stdin） |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 核心约束

### 1. 先读后写

替换前建议先用 `lark-cli minutes +detail --minute-tokens <token> --summary` 读取当前总结，确认 `minute_token` 与待替换内容无误。

### 2. Markdown 展示说明

接口接受任意总结文本，**不会因 Markdown 格式校验失败而拒绝请求**。妙记客户端通常只能良好渲染以下 Markdown 子集；不支持的语法（如链接、代码块、四级标题等）会**按原始文本展示**（保留 Markdown 标记字符，不会渲染成对应样式）。Agent 写入时应优先使用可展示语法，避免用户在妙记里看到字面量的 `[链接](url)`、`` `code` `` 等：

| 支持 | 写法 | 示例 |
|------|------|------|
| 纯文本 | 普通段落 | `本次会议讨论了 Q2 预算` |
| 换行 | `\n` 或空行 | 分段落书写 |
| 一级标题 | `# ` + 标题文字 | `# 会议结论` |
| 二级标题 | `## ` + 标题文字 | `## 行动项` |
| 三级标题 | `### ` + 标题文字 | `### 跟进事项` |
| 加粗 | `**文字**` | `**重点结论**` |
| 无序列表 | `- ` 或 `* ` | `- 跟进预算审批` |
| 有序列表 | `1. ` | `1. 确认需求` |

> 标题语法建议：`#` 后保留空格，并优先使用 1～3 级（`#` / `##` / `###`）。四级及以上（`####`）无法渲染，会以原始文本形式展示。

**不建议使用**（会按原始文本展示）：链接、图片、代码块、表格、引用块、斜体、删除线、四级及以上标题等。

合法示例：

```markdown
# 会议结论

## 核心讨论

**方案 A 通过**，下周启动排期。

### 待跟进
- 预算审批
- 排期确认

1. 张三负责预算
2. 李四负责排期
```

### 3. 所需权限

| 身份 | 所需权限 |
|------|---------|
| user | `minutes:minutes:update` |

## 输出结果

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "updated": true
}
```

| 字段 | 说明 |
|------|------|
| `minute_token` | 妙记 Token |
| `updated` | 是否已成功更新 |

## 如何获取 minute_token

| 来源 | 获取方式 |
|------|---------|
| 妙记 URL | 从 URL 末尾提取，如 `https://sample.feishu.cn/minutes/obcnxxxxxxxxxxxxxxxxxxxx` |
| 妙记搜索 | `lark-cli minutes +search --query "关键词"` |
| 会议产物查询 | `lark-cli vc +detail --meeting-ids <id>` 或 `vc +recording`, 拿到 `minute_token`, 然后走 `minutes +detail` |

## 常见错误与排查

| 错误现象 | 错误码 | 根本原因 | 解决方案 |
|---------|--------|---------|---------|
| 总结展示为原始 Markdown 文本 | — | 总结含链接、四级标题等妙记端无法渲染的语法 | 改用标题（#～###）、加粗、列表等可展示格式；接口不会因此报错 |
| 参数无效 | — | `minute_token` 缺失或格式错误 | 检查 token 是否完整 |
| 权限不足 | — | 缺少 `minutes:minutes:update` | 运行 `auth login --scope "minutes:minutes:update"` |

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) — 妙记全部命令
- [minutes +todo](lark-minutes-0.md#s-8b32f0409f9b5c9d) — 替换待办项
- [minutes +detail](lark-minutes-0.md#s-6c0b05ae720dbc9e) — 读取总结、待办等 AI 产物


<a id="s-8b32f0409f9b5c9d"></a>

## references/baseline/references/lark-minutes-todo.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +todo

> **路由**：本命令操作**妙记内的 AI 待办**，不是飞书任务（Task）。用户说「在妙记里新建待办」时**必须**用本命令，**禁止**走 `lark-cli task` / `tasklists list` / `task +create`。详见 [lark-minutes/SKILL.md](lark-minutes-0.md#s-c357b92850015e0b) 第 6 节。


对妙记中的待办做新增 / 更新 / 删除（单条或批量）。写操作。

本 skill 对应 shortcut：`lark-cli minutes +todo`（调用 `POST /open-apis/minutes/v1/minutes/{minute_token}/todo`）。

## 典型触发表达

- "给这条妙记加一条/多条待办"
- "把某条待办改成……"
- "标记某条待办为已完成 / 取消完成"
- "删除某条待办"

## 命令

**单条模式**：`--operation` + 对应字段。  
**批量模式**：`--todos` JSON 数组（与单条 flags 互斥），一次请求可混合 `add` / `update` / `delete`。

```text
# 单条：新增
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "跟进预算审批" --is-done=false --as user

# 批量：一次新增两条
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos '[
  {"operation":"add","content":"晚上好1","is_done":true},
  {"operation":"add","content":"晚上好2","is_done":false}
]'

# 批量：混合增删改
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos '[
  {"operation":"add","content":"新待办","is_done":false},
  {"operation":"update","todo_id":"1234567890","content":"已更新","is_done":true},
  {"operation":"delete","todo_id":"9876543210"}
]'

# 从文件读取
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos @todos.json

# 单条：更新 / 删除
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation update --todo-id 1234567890 --todo "整理会议纪要" --is-done --as user
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation delete --todo-id 1234567890 --as user

# 预览
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "新待办" --is-done --dry-run --as user
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-token <token>` | 是 | 妙记 Token |
| `--operation <op>` | 单条模式 | `add` / `update` / `delete`；与 `--todos` 互斥 |
| `--todo <text>` | 单条 add/update | 待办纯文本 |
| `--is-done` | 单条 add/update | `--is-done` = true，`--is-done=false` = false |
| `--todo-id <id>` | 单条 update/delete | 已有待办 id |
| `--todos <json>` | 批量模式 | JSON 数组，支持 `@file` / `@-`；与单条 flags 互斥 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 单条模式

| `--operation` | 必填参数 | 禁止参数 |
|---------------|----------|----------|
| `add` | `--todo` + `--is-done` | `--todo-id` |
| `update` | `--todo-id` + `--todo` + `--is-done` | — |
| `delete` | `--todo-id` | `--todo`、`--is-done` |

## 批量模式：`--todos`

每条元素字段与 API `todo_items[]` 一致：

| JSON 字段 | add | update | delete |
|-----------|-----|--------|--------|
| `operation` | 必填 | 必填 | 必填 |
| `content` | 必填 | 必填 | 禁止 |
| `is_done` | 必填 | 必填 | 禁止 |
| `todo_id` | 禁止 | 必填 | 必填 |

示例 `todos.json`：

```json
[
  {"operation": "add", "content": "晚上好1", "is_done": true},
  {"operation": "add", "content": "晚上好2", "is_done": false}
]
```

数组顺序会原样写入请求体；端上展示顺序仍可能受完成状态分组影响。

## 核心约束

### 1. 先读后写，待办 id 如何获取

更新 / 删除前先用 `lark-cli minutes +detail --minute-tokens <token> --todo` 读取当前待办。返回的每条待办带 `todo_id` 字段。

> 待办 id 仅用于程序内部定位，不必展示给用户。

### 2. 待办内容为纯文本

`content` **不是 Markdown**，请直接传入待办描述文字。

### 3. 所需权限

| 身份 | 所需 scope |
|------|-----------|
| user | `minutes:minutes:update` |

## 输出结果

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "count": 2,
  "updated": true
}
```

单条模式额外包含 `"operation": "add"`。

## 常见错误与排查

| 错误现象 | 解决方案 |
|---------|---------|
| 未指定操作 | 单条模式传 `--operation`，或批量传 `--todos` |
| `--todos` 与单条 flags 冲突 | 二选一 |
| `todos[i]` 校验失败 | 检查该条 `operation` 与字段组合 |
| `error.subtype` = `permission_denied` | **妙记资源无编辑权**：向妙记所有者申请该妙记的编辑/协作权限；**不要**走 `auth login --scope` |
| 缺少 OAuth scope（`error.missing_scopes` 含 `minutes:minutes:update`） | `lark-cli auth login --scope "minutes:minutes:update"` |

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b)
- [minutes +summary](lark-minutes-0.md#s-250fbb3ff4fdd227)
- [minutes +detail](lark-minutes-0.md#s-6c0b05ae720dbc9e)


<a id="s-08c583e2be9adc5f"></a>

## references/baseline/references/lark-minutes-update.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +update


修改飞书妙记的标题（topic）。

本 skill 对应 shortcut：`lark-cli minutes +update`。

## 典型触发表达

- "把这个妙记的标题改成 xxx"
- "重命名这条妙记"
- "修改妙记标题"

## 命令示例

```text
lark-cli minutes +update --minute-token xxx --topic "周会纪要 2026-05-18"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-token <token>` | 是 | 妙记的唯一标识，可从妙记 URL 末尾路径提取 |
| `--topic <string>` | 是 | 新的妙记标题 |

## 认证与权限
- 所需 scope：`minutes:minutes:update`。

## 输出结果

| 字段 | 说明 |
|------|------|
| `minute_token` | 被修改的妙记 Token，与输入的 `--minute-token` 一致，可继续用于查询妙记信息、下载媒体或获取纪要产物 |
| `topic` | 修改后的妙记标题，与输入的 `--topic` 一致 |

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) -- 妙记相关功能说明


<a id="s-d291971e04f66d14"></a>

## references/baseline/references/lark-minutes-upload.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# minutes +upload


上传音视频文件到飞书妙记并生成妙记（Minute）。

本 skill 对应 shortcut：`lark-cli minutes +upload`。

## 典型触发表达

- "把这个音视频文件转成妙记"
- "把这个音视频文件转成纪要"
- "把这个音视频文件转成逐字稿、文字稿或撰写文字"
- "把这个音视频文件转成总结、待办或章节"

## 完整工作流

当用户要求将音视频文件转换为妙记，或进一步要纪要/逐字稿/文字稿/撰写文字时，必须按照以下步骤执行：

1. **上传文件至云空间（云盘/云存储）获取 file_token**
   - 使用 `lark-cli drive +upload` 命令上传本地文件到云空间/云盘/云存储（Drive）：
     ```text
     lark-cli drive +upload --file <path/to/media/file>
     ```
   - 从命令的返回结果中提取生成的 `file_token`。

2. **将 file_token 转换为妙记链接（minute_url）**
   - 调用本 shortcut，将获取到的 `file_token` 转换为妙记：
     ```text
     lark-cli minutes +upload --file-token <file_token>
     ```
   - 命令执行成功后，将返回生成的妙记链接 `minute_url`。

3. **如需纪要 / 逐字稿 / 文字稿 / 撰写文字，使用返回的 `minute_token` 调用 `minutes +detail`**
   - 如果用户要的是纪要、逐字稿、文字稿、撰写文字、总结、待办或章节，使用上一步返回的 `minute_token` 继续调用：
     ```text
     lark-cli minutes +detail --minute-tokens <minute_token> --wait-ready --summary --todo --chapter --keyword --transcript
     ```
   - `--wait-ready` 参数表示等待妙记生成完毕后再获取产物，上传后立即读取详情时必须加上此参数。
   - `minutes +detail --minute-tokens` 会返回妙记产物（总结、待办、章节、关键词、逐字稿）；必要时还会把逐字稿落地到本地文件。

> **异步生成提示**：API 会立即返回 `minute_url`，但妙记可能仍在异步生成中，您可以直接通过该妙记链接查看当前的处理状态和转写结果。

## 命令示例

```text
# 通过已上传到云空间（云盘/云存储）的 file_token 生成妙记
lark-cli minutes +upload --file-token boxcnxxxxxxxxxxxxxxxx

# 上传后立即获取妙记产物，需加 --wait-ready 等待生成完毕（--summary --todo --chapter --keyword --transcript 按需传入）
lark-cli minutes +detail --minute-tokens obcnxxxxxxxxxxxxxxxx --wait-ready --summary
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token <token>` | 是 | 已经上传到飞书云空间（云盘/云存储）的音视频文件的 file_token |

## 支持的格式与限制

待上传到妙记的原始音视频文件必须满足以下要求：

- 支持音频格式：`wav`、`mp3`、`m4a`、`aac`、`ogg`、`wma`、`amr`
- 支持视频格式：`avi`、`wmv`、`mov`、`mp4`、`m4v`、`mpeg`、`ogg`、`flv`
- 音视频时长不能超过 `6` 小时
- 文件大小不能超过 `6 GB`

> 说明：本 shortcut 只接收 `file_token`，不会直接读取本地文件内容，因此这些格式、时长和大小限制对应的是**原始上传文件**本身。若妙记生成失败，请先回查源文件是否满足上述要求。

## 核心约束

### 1. 必须提供 file_token

本接口不直接处理本地文件的上传，必须先使用 `drive +upload` 将文件上传到云空间（云盘/云存储）获取 `file_token`，然后再调用本接口。

### 2. 先上传，再生成妙记

推荐流程如下：

1. 使用 `lark-cli drive +upload --file <path>` 上传本地音视频文件到云空间（云盘/云存储）
2. 从返回结果中取出 `file_token`
3. 调用 `lark-cli minutes +upload --file-token <file_token>` 生成妙记
4. 如果目标是纪要、逐字稿、文字稿、撰写文字、总结、待办或章节，使用返回的 `minute_token`，继续调用 `lark-cli minutes +detail --minute-tokens <minute_token> --wait-ready`

> **边界说明**：`minutes +upload` 本身只负责把文件转成妙记并返回 `minute_url`。纪要内容、逐字稿、文字稿、撰写文字、总结、待办、章节属于后续产物获取，应由 [minutes +detail](lark-minutes-0.md#s-6c0b05ae720dbc9e) 承接。

## 输出结果示例

```json
{
  "minute_url": "http(s)://<host>/minutes/<minute-token>",
  "minute_token": "<minute-token>"
}
```

| 字段 | 说明 |
|------|------|
| `minute_url` | 生成的妙记访问链接 |
| `minute_token` | 从 `minute_url` 提取出的妙记 Token，可直接传给 `minutes +detail --minute-tokens` |

## 参考

- [lark-minutes](lark-minutes-0.md#s-c357b92850015e0b) -- 妙记相关功能说明
- [drive +upload]（按模块名读取对应工作流） -- 上传文件到云空间（云盘/云存储）


<a id="s-70582d9120c717a1"></a>

## references/baseline-index.md

# 兼容参考

- [lark-minutes-detail.md](lark-minutes-0.md#s-6c0b05ae720dbc9e)
- [lark-minutes-download.md](lark-minutes-0.md#s-2b7c200fc360523a)
- [lark-minutes-search.md](lark-minutes-0.md#s-f6f0810cec79053b)
- [lark-minutes-speaker-replace.md](lark-minutes-0.md#s-c0bdff48f9c607a4)
- [lark-minutes-summary.md](lark-minutes-0.md#s-250fbb3ff4fdd227)
- [lark-minutes-todo.md](lark-minutes-0.md#s-8b32f0409f9b5c9d)
- [lark-minutes-update.md](lark-minutes-0.md#s-08c583e2be9adc5f)
- [lark-minutes-upload.md](lark-minutes-0.md#s-d291971e04f66d14)


<a id="s-9876b9be32f6091e"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `minutes.v1.minute.get` | [Feishu/Lark]-妙记-妙记信息-获取妙记信息-通过这个接口，可以得到一篇妙记的基础概述信息，包含 `owner_id`、`create_time`、标题、封面、时长和 URL | feishu_read_tool |
| `minutes.v1.minuteMedia.get` | [Feishu/Lark]-妙记-妙记音视频文件-下载妙记音视频文件-获取妙记的音视频文件 | feishu_read_tool |
| `minutes.v1.minuteStatistics.get` | [Feishu/Lark]-妙记-妙记统计数据-获取妙记统计数据-通过这个接口，可以获得妙记的访问情况统计，包含PV、UV、访问过的 user id、访问过的 user timestamp | feishu_read_tool |
| `cli.minutes.minutes.get` | Get minutes meta | feishu_read_tool |


<a id="s-da454629ccc7a464"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Compatibility entry

本技能只用于兼容旧名称，不直接处理业务。

**MUST 完整读取 [`../lark-meeting/SKILL.md`](lark-meeting-0.md#s-d18634841861885e)，并按照其中的路由和行动指南执行。**
