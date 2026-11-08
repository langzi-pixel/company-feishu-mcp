<a id="s-d18634841861885e"></a>

## SKILL.md


# meeting

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先按时间范围检索会议，包括即时会议；日历仅是一个来源，不能等同会议全集。区分 meeting_id、recording、minutes_token、note_id、docx_token。

2. 会议元数据、纪要、AI 摘要、逐字稿与音视频分别取证。来源无权限不等于会议没有内容；摘要只使用实际已读部分，并保留链接/时间范围。

3. 会议预约/录制管理按 vc 工具 schema；新版搜索、Notes、统一逐字稿缺接口时说明具体缺口。实时入会机器人需要应用身份与实际持续运行组件。

4. 旧名 lark-vc、lark-vc-agent、lark-minutes、lark-note 的请求均按产物和动作路由，不能因名称合并丢掉其请求。

## 按需参考

- [工具与合同](lark-meeting-0.md#s-d6d9955b0380747c)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-meeting-0.md#s-f875bf4220831ee1)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-d4c7d9db1161e205"></a>

## references/lark-minutes-apply-permission.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# minutes +apply-permission

向妙记所有者发起查看或编辑权限申请。**写操作**，只在用户明确要求申请权限时才调用；调用后不代表立即获得权限，只是提交了一条申请。

本 skill 对应 shortcut：`lark-cli minutes +apply-permission`（调用 `POST /open-apis/minutes/v1/minutes/{minute_token}/permissions/apply`）。支持 `--as user` / `--as bot`。

## 命令

```text
# 以 user 身份申请查看权限
lark-cli minutes +apply-permission --minute-token obcnxxxxxxxxxxxxxxxxxxxx --perm view --as user

# 以 bot 身份申请编辑权限
lark-cli minutes +apply-permission --minute-token obcnxxxxxxxxxxxxxxxxxxxx --perm edit --as bot

# 预览 API 调用
lark-cli minutes +apply-permission --minute-token obcnxxxxxxxxxxxxxxxxxxxx --perm view --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--minute-token <token>` | 是 | 妙记 Token |
| `--perm <view\|edit>` | 是 | 申请的权限：`view`（查看）或 `edit`（编辑） |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## user / bot 身份与权限语义

- **user**：以当前登录用户身份向妙记所有者申请。所有者在飞书客户端收到申请通知，同意后该用户获得对应权限。
- **bot**：以应用身份向妙记所有者申请，代表"这个应用"而不是某个用户。同意后应用（bot）获得对应权限，不会让触发申请的用户本人获得权限。
- 两种身份的申请互不代表：user 身份申请通过后 bot 仍然无权限，反之亦然。

## 核心约束

### 1. 必须继承触发无权限错误的来源身份

`+apply-permission` 不是通用的"求权限"按钮：它申请的是**当前 `--as` 对应身份**的权限。如果是 `--as bot` 读取妙记时遇到无权限，就要用 `--as bot` 申请；如果是 `--as user` 遇到无权限，就用 `--as user` 申请。不要在申请时切换成另一个身份——那申请的是另一个主体的权限，解决不了原来那次调用的问题。

### 2. missing scope 与资源 ACL 是两类不同问题

- **missing scope**（当前身份完全没有 `minutes:permission:apply` / `minutes:minutes.basic:read` 等 scope）：这不是"没有这条妙记的权限"，`+apply-permission` 解决不了。`--as user` 用 `auth login --scope` 补权限；`--as bot` 去开发者后台开通，**禁止**对 bot 执行 `auth login`。完整规则见 [lark-shared]（按模块名读取对应工作流）。
- **资源 ACL**（scope 都有，但对**这一条具体妙记**没有查看/编辑权限）：这才是 `+apply-permission` 要解决的场景。

先看错误的 `error.subtype` 是 `missing_scope` 还是资源级别的权限拒绝，再决定要不要调用本命令。

### 3. 只有用户明确要求才发起申请

遇到无权限错误时，先把"当前身份对这条妙记没有权限"的事实告知用户；只有用户明确说"帮我申请查看/编辑权限"时才调用本命令。不要在检测到无权限后自动发起申请。

### 4. 禁止通过切换身份绕过资源权限

如果 `--as bot` 对某条妙记没有权限，不要改用 `--as user` 重新读取来"绕过"这个限制（除非用户明确同意切换身份继续任务）。申请权限和切换身份是两件不同的事：前者是解决 bot 自身权限不足，后者是换一个完全不同的主体去访问资源。

## 所需权限

| 身份 | 所需权限 |
|------|---------|
| user / bot | `minutes:permission:apply` |

## 输出结果

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "perm": "view"
}
```

| 字段 | 说明 |
|------|------|
| `minute_token` | 妙记 Token |
| `perm` | 申请的权限（`view` / `edit`） |

## 如何获取 minute_token

| 来源 | 获取方式 |
|------|---------|
| 妙记 URL | 从 URL 末尾提取，如 `https://sample.feishu.cn/minutes/obcnxxxxxxxxxxxxxxxxxxxx` |
| 妙记搜索 | `lark-cli minutes +search --query "关键词"` |
| 会议产物查询 | `lark-cli vc +recording --meeting-ids <id>`，拿到 `minute_token`（沿用同一 `--as`） |

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--perm` 不是 `view`/`edit` | 参数值不合法 | 只能传 `view` 或 `edit` |
| `missing required scope(s)` | 当前身份缺少 `minutes:permission:apply` | 见上方「missing scope 与资源 ACL」 |
| 申请后仍无权限 | 所有者尚未同意 | 这是异步申请，需等待所有者处理；不代表命令执行失败 |

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-3e1c4a681cc2ae6d"></a>

## references/lark-minutes-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# minutes +detail

通过 `minute_token` 查询妙记详情，按需获取 AI 产物（总结/待办/章节/逐字稿/关键词）。只读，支持 `--as user` / `--as bot`。

`minute_token` 由某个身份取得时，本命令及后续 `note +detail`、`docs +fetch` 都必须显式沿用同一个 `--as`。

> `--summary` / `--todo` / `--chapter` / `--keyword` / `--transcript` 都是可选项；请求相应产物时必须显式传入，不传任何产物 flag 时只返回基础信息（如 `title`），AI 产物字段都不会出现。一次性获取所有产物：`--summary --todo --chapter --keyword --transcript`。

## 命令

```text
# 仅基础信息
lark-cli minutes +detail --as <source_identity> --minute-tokens obcxxxxxxxxxx

# 批量（逗号分隔，最多 50 个）
lark-cli minutes +detail --as <source_identity> --minute-tokens obcxxx,obcyyy --summary --todo

# 全产物
lark-cli minutes +detail --as <source_identity> --minute-tokens obcxxx --summary --todo --chapter --keyword --transcript

# 仅逐字稿，覆盖已有文件，指定输出目录
lark-cli minutes +detail --as <source_identity> --minute-tokens obcxxx --transcript --overwrite --output-dir ./out
```

## 输出

`minutes` 数组每条含 `minute_token`、`title`、`note_id`、`artifacts`。`note_id` 仅在该妙记关联了会议纪要时返回，可直接传给 [`note +detail`](lark-meeting-0.md#s-70f05555aba6167f) 拿纪要文档 token，无需再绕回 `vc +detail`。`artifacts` 中**只包含本次请求的产物**：

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

`minute_token` 不要直接传给 `note +detail`：需要关联 Note 时，先从本命令结果读取 `note_id`。跨产物流程由 [`query-minutes-and-artifacts`](lark-meeting-0.md#s-b4803aa71f203d03) 编排。

## 相关场景
- [查询妙记及其产物](lark-meeting-0.md#s-b4803aa71f203d03)


<a id="s-06b66459939c5346"></a>

## references/lark-minutes-download.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# minutes +download


下载妙记的音视频媒体文件到本地，或获取有效期 1 天的下载链接。只读操作，支持 `--as user` / `--as bot`。

本 skill 对应 shortcut：`lark-cli minutes +download`。

`minute_token` 是在某个身份下解析出来的（如 `vc +recording --as bot`）：调用本命令时必须显式沿用同一个 `--as`，不要省略让身份被默认值悄悄换掉（完整规则见 [lark-shared]（按模块名读取对应工作流） 的「身份延续」）。

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
| `missing required scope(s)` | — | 当前身份缺少 scope | `--as user`：运行 `auth login --scope "minutes:minutes.media:export"`；`--as bot`：使用错误中的 `console_url` 去开发者后台开通，**禁止**对 bot 执行 `auth login`（见 [lark-shared]（按模块名读取对应工作流） 的权限管理） |

## 提示

- 音视频文件可能较大，下载无固定超时限制（由用户 Ctrl+C 控制取消）。
- 默认落点 `./minutes/{minute_token}/` 与 `minutes +detail` 的逐字稿共享同一目录，方便 Agent 聚合同一妙记的原始音视频和逐字稿。
- 单 token 模式下 `--output` 若传入已存在目录（如 `--output ./existing-dir`），等价于 `--output-dir`，文件落入该目录（cp 语义）。
- 批量模式下 `--output` 不接受已存在的文件路径（会报错），应改用 `--output-dir`。
- 如需获取妙记的纪要内容（逐字稿、AI 总结等），请使用 [minutes +detail](lark-meeting-0.md#s-3e1c4a681cc2ae6d)。

## 相关场景
- [查询妙记及其产物](lark-meeting-0.md#s-b4803aa71f203d03)


<a id="s-81f252a33d1bf027"></a>

## references/lark-minutes-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# minutes +search


搜索妙记列表，支持关键词、所有者、参与者以及时间范围等多条件过滤。支持 user 身份和 bot / 应用身份；所有者与参与者都支持传入多个 open\_id，user 身份下也支持传入 `me` 表示当前用户。只读操作，不修改任何妙记数据。

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
| `--owner-ids <ids>`       | 否  | 所有者 open\_id 列表，逗号分隔；多值为 OR 语义；支持传 `me` 表示当前用户 |
| `--participant-ids <ids>` | 否  | 参与者 open\_id 列表，逗号分隔；多值为 OR 语义；支持传 `me` 表示当前用户 |
| `--start <time>`          | 否  | 开始时间（ISO 8601 或仅日期）                  |
| `--end <time>`            | 否  | 结束时间（ISO 8601 或仅日期）                  |
| `--page-size <n>`         | 否  | 每页数量，默认 `15`，最大 `30`                 |
| `--page-token <token>`    | 否  | 下一页分页 token                          |
| `--dry-run`               | 否  | 预览 API 调用，不执行                        |

## 核心约束

### 1. 至少提供一个过滤条件

所有参数均可选，但必须至少提供一个过滤条件：`--query`、`--owner-ids`、`--participant-ids`、`--start` 或 `--end`。

### 2. 支持 user 和 bot 身份

该接口支持 `--as user` 和 `--as bot`。user 身份需要完成 `lark-cli auth login` 并具备 `minutes:minutes.search:read` 权限；bot 身份使用应用的 tenant access token，需要确认当前应用已开通 `minutes:minutes.search:read` scope，且运行环境能获取有效的 TAT。

### 3. `me` 表示当前用户

在 `--owner-ids` 和 `--participant-ids` 中可使用 `me`，表示当前登录用户。该值会在本地解析为当前用户的 `open_id`，无需手动先查询自己的用户 ID。`me` 只适合 user 身份；bot 身份没有“当前用户”，请直接传 `ou_` open_id。
若当前环境尚未完成用户登录，或 CLI 无法解析出当前用户的 `open_id`，则应先执行 `lark-cli auth login`，再重新执行搜索。该恢复方式只适用于 user 身份和 `me` 解析；bot 身份应检查 tenant access token 与应用 scope，不应通过 `auth login` 修复。

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
- 用户未明确要求全量时，逐页累计已读取的 `items` 数：累计不到 50 条之前可自动继续翻页；超过 50 条且仍有更多结果时，先向用户确认是否继续获取全部结果。
- 用户明确说“全部 / 所有 / 统计 / 排序”时，该全量意图优先于 50 条确认门槛；直接按 `has_more` 翻完所有分页，按结果中的 `token` 去重后再返回、排序或统计。

```text
# First page
lark-cli minutes +search --query "预算复盘" --page-size 20

# Next page
lark-cli minutes +search --query "预算复盘" --page-size 20 --page-token '<PAGE_TOKEN>'
```

## 常见错误与排查

| 错误现象                   | 根本原因                                                  | 解决方案                                         |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------- |
| 命令直接报错，要求提供过滤条件        | 没有传入 `--query`、时间范围或任何过滤 ID                           | 至少补充一个过滤条件后重试                                |
| 时间参数校验失败               | `--start` 或 `--end` 格式不合法                             | 改用 ISO 8601 或 `YYYY-MM-DD`                   |
| `owner-ids` 校验失败       | 传入的不是 open\_id，且也不是 `me`；或传了 `me` 但当前用户 open\_id 不可解析 | 改为 `ou_` 开头的用户 ID，或先完成 `auth login` 后再传 `me` |
| `participant-ids` 校验失败 | 传入的不是 open\_id，且也不是 `me`；或传了 `me` 但当前用户 open\_id 不可解析 | 改为 `ou_` 开头的用户 ID，或先完成 `auth login` 后再传 `me` |
| 权限不足                   | 未授权 `minutes:minutes.search:read`                     | user 身份使用 `auth login` 完成用户授权；bot 身份检查 tenant access token 和应用 scope |

## 提示

- 当用户说“我的妙记”时，优先理解为 `--owner-ids me`。
- 当用户说“我参与的妙记”“我参加过的妙记”时，默认理解为 `--owner-ids me` 与 `--participant-ids me` 两次查询后的并集。
- 当用户明确说“仅我参与但不是我拥有”时，才优先理解为 `--participant-ids me`。
- 当用户同时提到“会议 / 会 / 开会 / 某场会”和“妙记”时，优先先定位会议；如果要的是妙记信息，走 `vc +recording` 获取 `minute_token` → `minutes minutes get`，只有要妙记产物内容时才走 `minutes +detail --minute-tokens`。
- 必须使用 `--format json` 输出，你更加擅长解析 JSON 数据。
- 排查参数与请求结构时优先使用 `--dry-run`。
- 搜索的时间范围最大为 1 个月，如果需要搜索更长时间范围的妙记，需要拆分为多次时间范围为一个月查询。

## 相关场景
- [查询妙记及其产物](lark-meeting-0.md#s-b4803aa71f203d03)


<a id="s-45f8b0d7733efe34"></a>

## references/lark-minutes-speaker-replace.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

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
   - 若同名有多条（`name` 相同、`speaker_id` 不同）：**不要擅自挑选**。可用 [`minutes +detail --transcript`](lark-meeting-0.md#s-3e1c4a681cc2ae6d) 对照各人发言内容，请用户确认后再用精确的 `speaker_id`。
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

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-860055b8893752bd"></a>

## references/lark-minutes-summary.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

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
| `error.subtype` = `quota_exceeded` | 2091008 | 该妙记生成时 ASR/AI 额度已用尽，AI 总结未完整生成，替换无法落库 | 让用户去该妙记详情页查看额度详细信息；CLI 无法补充额度，重试不会成功 |

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-4eda03852c02682a"></a>

## references/lark-minutes-todo.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# minutes +todo

> **路由**：本命令操作**妙记内的 AI 待办**，不是飞书任务（Task）。用户说「在妙记里新建待办」时**必须**用本命令，**禁止**走 `lark-cli task` / `tasklists list` / `task +create`。详见 [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)。


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
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos '[{"operation":"add","content":"晚上好1","is_done":true},{"operation":"add","content":"晚上好2","is_done":false}]'

# 批量：混合增删改
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos '[{"operation":"add","content":"新待办","is_done":false},{"operation":"update","todo_id":"1234567890","content":"已更新","is_done":true},{"operation":"delete","todo_id":"9876543210"}]'

# 从文件读取
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --as user --todos @todos.json

# 单条：更新 / 删除
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation update --todo-id 1234567890 --todo "整理会议纪要" --is-done --as user
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation delete --todo-id 1234567890 --as user

# 预览
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "新待办" --is-done --dry-run --as user

# 新增待办并指定负责人（负责人以内联 @ 提及写进 --todo 内容，这是妙记待办表示归属的既定写法）
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "跟进预算审批 @张三" --is-done=false --as user
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

### 3. 负责人 / `@` 提及（既定写法，必读）

用户说"负责人是某某"时，既定写法是把负责人以内联 `@某某` 追加进 `--todo` 内容：

- 用户已经直接给出姓名时（例如"负责人是张三"），**不做任何查找**，原文原样拼进 `--todo` 内容，写成纯文本 `@张三`（`--todo "xxx @张三"`）。
- 用户说"负责人是我"时，**必须**先取当前登录用户的真实姓名再拼接，禁止直接写成字面的 `@我`：
  - 执行 `lark-cli contact +get-user --as user`，取返回中的姓名字段作为真实姓名，拼成 `--todo "xxx @<真实姓名>"`。
  - 如果这一步失败或取不到姓名（无权限、报错等），**不要**写任何 `@` 提及占位——直接用不带负责人后缀的原始待办文本创建（`--todo "xxx"`），不要保留字面的 `@我`。
- **不要**因为要处理负责人而改路由到 [lark-task]（按模块名读取对应工作流） 或做进一步的通讯录搜索——第一优先级永远是落地这条待办；姓名解析只影响追加的 `@` 文本，绝不能阻塞或取消待办创建。
- **不要**用"创建者是谁 / 以什么身份创建"来代替 `@` 提及——创建时用的 `--as user`/`--as bot` 身份和"负责人"是两件不相关的事，即使已知当前用户真实姓名，也必须把它拼进 `content` 文本，不能只在回复里用"以你的身份创建即归属于你"这类说法搪塞。
- 回复里**不要**主动提及或建议改用 `lark-task` 作为"想要明确负责人/可指派任务"的替代方案——用户说的负责人只是这条妙记待办里的一段文本，和 Task 完全无关，不要引入 Task 增加用户困惑。
- 内联 `@` 是妙记待办表示负责人的既定写法。回复只陈述结果（妙记、待办内容、负责人、完成状态），**不要**出现"接口只支持 content 和 is_done""没有独立的负责人字段""所以只能把负责人写进内容里"这类实现限制说明或解释性免责。

**结果示例**：

```text
# 姓名解析成功
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "跟进预算审批 @王小明" --is-done=false --as user

# "我"解析失败：不写 @ 提及，仅保留原始内容
lark-cli minutes +todo --minute-token obcnxxxxxxxxxxxxxxxxxxxx --operation add --todo "跟进预算审批" --is-done=false --as user
```

```json
{
  "minute_token": "obcnxxxxxxxxxxxxxxxxxxxx",
  "count": 1,
  "updated": true,
  "operation": "add"
}
```

妙记里新增的这条待办的 `content` 字段就是最终拼好的文本本身（`"跟进预算审批 @王小明"` 或解析失败时的 `"跟进预算审批"`）；CLI 和这个接口都不会、也不需要把它转换成真正可点击的用户提及。

### 4. 所需权限

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
| `error.subtype` = `quota_exceeded` | **该妙记生成时 ASR/AI 额度已用尽**，AI 待办未完整生成，改待办无法落库：让用户去该妙记详情页查看额度详细信息；CLI 无法补充额度，重试不会成功 |
| 缺少 OAuth scope（`error.missing_scopes` 含 `minutes:minutes:update`） | `lark-cli auth login --scope "minutes:minutes:update"` |

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-0791096865f48330"></a>

## references/lark-minutes-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

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

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-08c8ebf5c8321239"></a>

## references/lark-minutes-upload.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# minutes +upload


上传音视频文件到飞书妙记并生成妙记（Minute）。

本 skill 对应 shortcut：`lark-cli minutes +upload`。

## 典型触发表达

- "把这个音视频文件转成妙记"
- "把这个音视频文件转成纪要"
- "把这个音视频文件转成逐字稿、文字稿或撰写文字"
- "把这个音视频文件转成总结、待办或章节"

## 命令示例

```text
# 通过已上传到云空间（云盘/云存储）的 file_token 生成妙记
lark-cli minutes +upload --file-token boxcnxxxxxxxxxxxxxxxx

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

### 2. 异步生成

API 会立即返回 `minute_url`，但妙记可能仍在异步生成中。`minutes +upload` 不返回处理状态，命令成功只表示异步创建请求已提交；只有后续执行 `minutes +detail` 并确认就绪，才能声称妙记产物已生成或可用。上传与后续产物获取由 [`create-and-edit-minutes`](lark-meeting-0.md#s-2b52e88c32b7298d) 编排；上传后立即查询产物时，`minutes +detail` 必须使用 `--wait-ready`。

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

## 常见错误与排查

| 错误现象 | 错误码 | 根本原因 | 解决方案 |
|---------|--------|---------|---------|
| `error.subtype` = `quota_exceeded` | 2091008 | ASR/AI 额度已用尽，不足以转写这个音视频，妙记未创建 | 让用户去妙记详情页查看额度详细信息；CLI 无法补充或提升额度，重试同一个 `--file-token` 不会成功 |

## 相关场景
- [生成和修改妙记](lark-meeting-0.md#s-2b52e88c32b7298d)


<a id="s-70f05555aba6167f"></a>

## references/lark-note-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# note +detail

通过 `note_id` 查询会议纪要详情，获取下挂文档 Token（AI 智能纪要、逐字稿、会中共享文档）。只读，支持 `--as user` 或 `--as bot`。

## 命令

```text
lark-cli note +detail --note-id <note_id>
lark-cli note +detail --note-id <note_id> --as bot
```

`note_id` 由其他命令取得时，必须显式沿用来源身份。应用身份能否读到数据取决于应用对纪要主文档的查看权限。若 `--as bot` 返回 `note_display_type=unified`，不要静默切换到用户身份执行 `note +transcript`；先向用户说明该命令仅支持用户身份。

## 相关场景
- [基于 note_id 查询纪要、逐字稿、共享文档等](lark-meeting-0.md#s-043cc283b03d4c58)


<a id="s-f44d5fe4bf8bfb52"></a>

## references/lark-note-transcript.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# note +transcript

只在 `note +detail` 已确认 `note_display_type=unified` 时使用。普通纪要逐字稿是独立 Docx 文档，应回到 [lark-doc]（按模块名读取对应工作流） 读取 `verbatim_doc_token`。

`note +transcript` 仅支持 `--as user`，不支持 `--as bot`。如果 `note +detail --as bot` 返回 `unified`，不要静默省略 `--as` 或改用用户身份继续；先说明该限制，只有用户明确同意后才切换身份重试。

```text
lark-cli note +transcript --note-id <note_id>
```

## 行为契约

- CLI 会先校验该 Note 是否为 `unified`；不是 unified 时不拉取 transcript。
- CLI 内部自动翻页并拼接完整内容；任一页失败时整体报错，不保存半截 transcript。
- 默认保存到 `./notes/{note_id}/unified_transcript.md`；`--transcript-format plain_text` 时保存为 `.txt`。
- 目标文件已存在时会失败；用户明确要覆盖时才加 `--overwrite`。

## 相关场景
- [基于 note_id 查询纪要、逐字稿、共享文档等](lark-meeting-0.md#s-043cc283b03d4c58)


<a id="s-021163033cf31c99"></a>

## references/lark-vc-agent-meeting-end.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# vc +meeting-end

当前 Host 应用 Bot 结束会议。

```text
lark-cli vc +meeting-end --as bot --meeting-id 7628568141510692381 --yes
lark-cli vc +meeting-end --as bot --meeting-id 7628568141510692381 --dry-run
```

正常执行必须显式传入 `--yes`；`--dry-run` 不会结束会议。

## 参数

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--meeting-id` | 是 | 长数字 Meeting ID，不是 9 位会议号。 |

仅支持应用身份，调用 `POST /open-apis/vc/v1/bots/end`；仅当前 Host Bot 可结束进行中的会议。

所需应用 Scope：`vc:meeting.bot.manage:write`。

## 常见失败原因

- 当前应用 Bot 不在会议中：先使用同一应用 Bot 发起或加入该 Calendar 会议，再执行结束。
- 应用 Bot 在会中但不是当前 Host：将 Host 转交给该 Bot，或由当前 Host/Owner 结束会议。
- 会议未启用 Agent 会议能力：确认会议设置及会议 Owner 的必要灰度开关。


<a id="s-92614d068beec283"></a>

## references/lark-vc-agent-meeting-invite.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# vc +meeting-invite

通过 Agent Bot API 邀请指定用户，或一键邀请符合条件的 Calendar 参会人。

```text
lark-cli vc +meeting-invite --as bot --meeting-id 7628568141510692381 --type SELECTED --open-ids ou_xxx,ou_yyy
lark-cli vc +meeting-invite --as bot --meeting-id 7628568141510692381 --type ALL_SUGGESTED
lark-cli vc +meeting-invite --as bot --meeting-id 7628568141510692381 --type ALL_SUGGESTED --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--meeting-id` | 是 | 长数字 Meeting ID，不是 9 位会议号。 |
| `--type` | 是 | `SELECTED` 或 `ALL_SUGGESTED`，大小写不敏感。 |
| `--open-ids` | `SELECTED` 时必填 | 用户 `open_id`（`ou_xxx`），支持逗号分隔或重复传入，最多 200 个；`ALL_SUGGESTED` 时不得传入。 |

该 shortcut 仅支持 bot 身份，调用 `POST /open-apis/vc/v1/bots/invite`。

- `SELECTED` 显式发送用户 `open_id`；本地会在请求前拒绝超过 200 个 ID 的输入。
- `ALL_SUGGESTED` 只发送邀请类型。服务端根据 Calendar 状态解析一键邀请候选集，并应用 200 人上限。
- 请求契约：`SELECTED` 发送 `invite_type=2`、`invitees=[{"id":"ou_xxx","user_type":1}]` 和查询参数 `user_id_type=open_id`；`ALL_SUGGESTED` 发送 `invite_type=1` 且省略 `invitees`。
- 返回契约：`SELECTED` 可返回显式受邀人的 `invite_results`；CLI 会按响应 `id` 展示每项 `invited` 或 `failed` 状态。`ALL_SUGGESTED` 仅返回聚合字段，不返回逐用户 `invite_results`。
- `ALL_SUGGESTED` 的 `has_more=true` 表示候选人超过服务端单次 200 人上限，不是可翻页信号。该接口没有 continuation 或 `page_token`；CLI 会显示截断提示而不输出 `has_more`。

## 权限与前置条件

- 目标必须是 Calendar VC 会议，且应用 Bot 已在会中。
- Agent Invite 依赖会议的 Agent 加入能力。日程未开启 AI/Agent 会议设置时，邀请请求会失败。
- 仅包含一名受邀人的 `SELECTED` 复用普通单点邀请策略，普通会中参会人也可能有权邀请该用户。
- `ALL_SUGGESTED` 和多用户 `SELECTED` 使用批量/建议列表邀请策略。实际调用时 Bot 应为当前 host 或 co-host；普通参会 Bot 可能没有批量邀请权限。


<a id="s-1ce454738383dec1"></a>

## references/lark-vc-agent-meeting-join.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# vc +meeting-join

通过 9 位会议号让应用机器人加入一场正在进行的视频会议。这是一次**写操作**，会实际让应用机器人加入会议。

本 skill 对应 shortcut：`lark-cli vc +meeting-join`（调用 `POST /open-apis/vc/v1/bots/join`）。

> **不要把 9 位会议号等同于入会意图。** 用户给出 9 位会议号并询问“会议讲了什么 / 查会中事件”时，先用 `vc +meeting-list-active` 查当前 active meetings 并按 `meeting_no` 匹配；只有用户明确要求“入会 / 让应用机器人旁听 / 代我参会”时才调用本命令。

## 命令

```text
# 仅指定会议号（无密码）
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 发起日程会议（仅应用身份）
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --action start
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--meeting-number <no>` | 是 | 会议号，必须为 **9 位纯数字** |
| `--password <pw>` | 否 | 会议密码，仅在该会议设置了入会密码时传入 |
| `--call-id <id>` | 否 | 从 `vc.bot.meeting_invited_v1` 邀请事件透传的 `call_id`，原样回传即可。Agent 主动入会或无邀请事件来源时不传 |
| `--action join\|start` | 否 | 默认 `join`，保持普通入会链路；`start` 是日程发起专属参数，用同一 `bots/join` API 发起会议，且必须 `--as bot` |
| `--dry-run` | 否 | 预览 API 调用，不实际加入会议；会议号或身份不确定时先用它确认请求 |

## 核心约束

### 1. 使用应用身份

这是应用机器人入会能力，使用 `--as bot`。不要用当前登录用户身份尝试让应用机器人入会。

默认 `join` 不会向请求体写入 `action` 字段，也不进入日程发起筛选。`--action start` 才写入 `action: 2`，单独进入日程发起的筛选与校验。

### 2. 会议号格式严格校验

`--meeting-number` 必须是 9 位纯数字，否则本地校验直接报错：
`--meeting-number must be exactly 9 digits`。

常见错误来源：
- 把会议链接整条粘进来（应仅取尾部的 9 位数字）
- 把 `meeting_id`（长数字 ID）当成会议号传入（两者不是同一个东西）

### 3. 会议必须已开始且允许入会

- `--action join` 要求会议处于**进行中**状态；`--action start` 用于启动符合条件的日程会议。
- 若会议设置了**等候室 / 入会审批**，应用机器人可能需要主持人放行后才真正入会。
- 若返回 `HTTP 403: no permission`（错误码 `121003`），不要只理解成“账号没权限”。这类报错更常见的原因是：会议参数或会控配置当前不满足入会条件，例如会议号填错、密码未传或错误、会议尚未开始、等候室 / 入会审批未放行、会议禁止外部/特定身份加入等。应先确认这些配置项，再重试。

### 4. 机器人入会后对其他参会人可见

这是一次真实入会操作，机器人会立即出现在参会人列表中，其他参会人可见，并产生会议日志。误入错会的社交成本高于技术成本——执行前优先确认 9 位会议号的来源（用户输入 / 会议链接末尾），不要臆造。参数格式有疑问时可用 `--dry-run` 预览请求体。

## 输出结果

接口返回会议基本信息，字段视具体响应而定，常见字段：

| 字段 | 说明 |
|------|------|
| `meeting.id` | 会议 ID（可后续传给 `+meeting-leave --as bot --meeting-id`） |
| `meeting.meeting_no` | 会议号（与入参一致） |
| `meeting.topic` | 会议主题 |
| `meeting.start_time` | 会议开始时间 |

> **重要**：拿到 `meeting.id` 后务必保留，退出会议（`+meeting-leave`）需要使用它，而不是会议号。

## 如何获取输入参数

| 输入参数 | 获取方式 |
|---------|---------|
| `meeting-number` | 会议号由主持人分享；也可从会议链接尾部解析 9 位数字 |
| `password` | 若会议设置了入会密码，由主持人提供 |
| `call-id` | 由 `vc.bot.meeting_invited_v1` 邀请事件的 `call_id` 字段携带，Agent 收到事件时透传过来；无邀请事件场景（如 Agent 主动入会）不传 |

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--meeting-number must be exactly 9 digits` | 会议号不是 9 位纯数字 | 检查是否误传了会议链接或 meeting_id |
| 会议密码错误 | `--password` 错误或未提供 | 向主持人确认会议密码 |
| 会议不存在 / 已结束 | 会议号错误或会议未进行中 | 确认会议正在进行中；启动日程会议时改用 `--action start` |
| `HTTP 403: no permission` / `121003` | 入会前置条件不满足，通常不是单纯 scope 问题 | 依次确认：1）会议允许智能体加入；2）会议号正确；3）如有密码，已正确传入 `--password`；4）会议已开始；5）等候室 / 入会审批已放行；6）会议未禁止当前身份加入（如限制外部、限制应用机器人、仅特定成员可入会）；确认后重试 |
| 应用身份权限不足 | 应用权限、租户安装或权限可访问的数据范围未配置完整 | 不要执行 `auth login`。以 CLI 返回的 metadata / error envelope 为准确认缺失权限；检查应用发布/安装，以及开放平台“权限可访问的数据范围”：选择“按条件筛选”，条件为“会议的归属者 包含 与应用的可用范围一致”；配置正确仍失败时，保留错误码和 `log_id`，按服务端权限异常排查 |
| 入会被拒绝 | 等候室 / 入会审批 / 限制外部入会 | 联系主持人放行或调整会议设置 |

## 提示

- 仅在 Agent 需要**真实加入**会议（例如参会机器人、会中助手）时使用；只拉取会议数据不需要入会。
- 入会会让机器人立即出现在参会列表；若用户要求退出 / 离开 / 结束参会，直接使用 `+meeting-leave --as bot --meeting-id <meeting.id>`。参数格式不确定时可选 `--dry-run` 预览，但不是必经步骤。
- 执行成功后，立即记录返回的 `meeting.id`，用于后续 `+meeting-leave` / `+meeting-events`。

## 相关场景
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)


<a id="s-384f08d6b9592cc5"></a>

## references/lark-vc-agent-meeting-leave.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# vc +meeting-leave

通过 `meeting_id` 离开当前身份所在的视频会议（bot leave）。这是一次**写操作**，会实际把当前身份从会议中移出。

本 skill 对应 shortcut：`lark-cli vc +meeting-leave`（调用 `POST /open-apis/vc/v1/bots/leave`）。

## 命令

```text
# 通过 meeting_id 离会
lark-cli vc +meeting-leave --as bot --meeting-id 69xxxxxxxxxxxxx28
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--meeting-id <id>` | 是 | 会议 ID（**不是 9 位会议号**） |
| `--dry-run` | 否 | 预览 API 调用，不实际离会；meeting_id 或身份不确定时先用它确认请求 |

## 核心约束

### 1. 入参是 meeting_id，不是会议号

`--meeting-id` 必须是会议的长数字 ID，通常由 `+meeting-join --as bot` 返回体中的 `meeting.id` 提供，也可从应用身份 `+meeting-list-active --as bot --user-id <user_open_id>` 返回体中的 `meeting_id` 获取。**传 9 位会议号会失败**。

### 2. 优先使用 bot 身份

这是应用机器人离会能力，使用与入会或 active meeting 发现相同的 `--as bot`。只能让当前身份自己离会，无法强制移出其他参会人。

### 3. 当前身份必须在会议中

应用机器人必须已经在该会议中，否则接口会报错。如果 `meeting_id` 来自 `+meeting-list-active`，必须确认这是应用身份发现到的会议。

### 4. 离会立即生效，对其他参会人可见

机器人会立刻从参会列表消失；若会议启用了录制/纪要，bot 的参会时段到此截止。只有在用户明确要求退出 / 离开 / 结束参会时才调用；如需要重新入会，再跑 `+meeting-join` 即可（非真正"不可逆"）。

## 输出结果

接口成功返回时，默认输出：`Left meeting <meeting-id> successfully.`。
`--format json` 返回标准 `{ok, identity, data}` 信封，例如 `{"ok":true,"identity":"bot","data":{}}`，不是带 `code` / `msg` 的 API 原始响应体。

## 如何获取输入参数

| 输入参数 | 获取方式 |
|---------|---------|
| `meeting-id` | `+meeting-join --as bot` 返回的 `meeting.id`；或应用身份 `+meeting-list-active --as bot --user-id <user_open_id>` 返回的 `meeting_id` |

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--meeting-id is required` | 未传入 `--meeting-id` | 传入从 `+meeting-join --as bot` 得到的 `meeting.id`，或应用身份 `+meeting-list-active` 返回的 `meeting_id` |
| `meeting not found` / `invalid meeting_id` | 误传了 9 位会议号 | 必须使用 `meeting.id`，不是会议号 |
| `not in meeting` | 当前身份并不在该会议中 | 确认先 `+meeting-join` 成功 |

## 提示

- 只有用户明确要求退出 / 离开 / 结束参会时才调用；离会会让机器人从参会列表消失，对其他参会人可见。若需要重新入会直接再 `+meeting-join`，不是真正的"不可逆"。参数格式不确定时可选 `--dry-run` 预览。
- `+meeting-leave` 优先使用 `+meeting-join --as bot` 返回的 `meeting.id`，但不是每次 join 后都必须调用 leave。
- `meeting_id` 如果来自 `+meeting-list-active`，必须来自应用身份，并确认应用机器人就在该会议中。不要用 9 位会议号。

## 相关场景
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)


<a id="s-f83a53e7114cecb3"></a>

## references/lark-vc-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# vc +detail

通过会议 ID 获取会议详情，包括基本信息、关联的纪要 ID（`note_id`）和妙记 Token（`minute_token`）。只读，支持 `--as user` / `--as bot`。

## 命令

```text
# 单个 / 批量（逗号分隔，最多 50 个）
lark-cli vc +detail --meeting-ids <meeting_id1>,<meeting_id2>

# 应用身份（只能查应用有权限的会议）
lark-cli vc +detail --meeting-ids <meeting_id1>,<meeting_id2> --as bot
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

跨产物选择和后续命令链由 [`query-meeting-and-artifacts`](lark-meeting-0.md#s-f0bd564eb956c3d7) 统一编排。`note_id` / `minute_token` 由本命令取得后，后续 `note +detail`、`minutes +detail` 和 Doc 读取命令必须显式沿用同一个 `--as`。

## 相关场景
- [查询会议及其产物](lark-meeting-0.md#s-f0bd564eb956c3d7)


<a id="s-206fbaf6aa28aa3f"></a>

## references/lark-vc-meeting-countdown.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# vc +meeting-countdown

设置、延长、提前结束或关闭会中倒计时窗口。

本 skill 对应 shortcut：`lark-cli vc +meeting-countdown`（调用 `POST /open-apis/vc/v1/bots/countdown`）。

## 适用场景

- 用户要求在正在进行中的会议里设置倒计时，例如“设置 5 分钟倒计时”。
- 用户要求延长当前倒计时，例如“再延长 2 分钟”。
- 用户要求提前结束或关闭当前倒计时。
- 只用于正在进行中的会议；已结束会议不支持。

## 身份规则

`meeting_id` 从哪种身份路径拿到，操作倒计时时就沿用哪种身份：

| meeting_id 来源 | 操作时身份 |
| --- | --- |
| `+meeting-list-active --as user` | `+meeting-countdown --as user` |
| `+meeting-list-active --as bot --user-id <user_open_id>` | `+meeting-countdown --as bot` |
| `+meeting-join --as bot` 返回的 `meeting.id` | `+meeting-countdown --as bot` |

不要把用户身份发现的 `meeting_id` 改用应用身份操作，也不要把应用身份发现的 `meeting_id` 改用用户身份操作，除非用户明确要求切换。

## 参数

| 参数 | 说明 |
| --- | --- |
| `--meeting-id` | 必填，长数字 `meeting_id`，不是 9 位会议号 |
| `--action` | 必填，`set`、`prolong`、`end_in_advance` 或 `close_window` |
| `--duration` | 倒计时时长，单位是分钟；`set` 和 `prolong` 必填 |
| `--need-play-audio-at-end` | 仅 `set` 可用，表示倒计时结束时播放提示音 |
| `--reminder-before-end` | 仅 `set` 可用，提醒点单位是分钟；只支持传一个值 |

`duration` 和 `reminder_before_end` 都是分钟；提醒时间必须大于 0 且小于 `duration`。

## 设置倒计时

```text
lark-cli vc +meeting-countdown --as user \
  --meeting-id <meeting_id> \
  --action set \
  --duration 5 \
  --need-play-audio-at-end \
  --reminder-before-end 1
```

Dry-run 请求体示例：

```json
{
  "meeting_id": "<meeting_id>",
  "action": "set",
  "duration": 5,
  "need_play_audio_at_end": true,
  "reminder_before_end": 1
}
```

## 延长倒计时

```text
lark-cli vc +meeting-countdown --as bot \
  --meeting-id <meeting_id> \
  --action prolong \
  --duration 2
```

## 提前结束或关闭倒计时

```text
lark-cli vc +meeting-countdown --as user --meeting-id <meeting_id> --action end_in_advance
lark-cli vc +meeting-countdown --as user --meeting-id <meeting_id> --action close_window
```

提前结束或关闭倒计时窗口时不要传 `--duration`、`--need-play-audio-at-end` 或 `--reminder-before-end`。

## 9 位会议号处理

如果用户给的是 9 位会议号并要求操作倒计时：

1. 先按当前身份执行 `+meeting-list-active`。
2. 在返回结果中按 `meeting_no` 匹配该 9 位会议号。
3. 匹配到唯一会议后取长数字 `meeting_id`。
4. 用发现该会议时的同一身份执行 `+meeting-countdown`。

匹配失败时不要自动入会。只有用户明确要求“让应用机器人入会/旁听/代参会”时，才改用 `+meeting-join`。

## 权限和前置条件

- 用户身份：当前用户必须正在该会议中。
- 应用身份：应用机器人必须正在该会议中。
- 需要 `vc:meeting.interaction:write` 权限；应用身份还需要应用已安装、数据范围已配置。

应用身份权限错误时，不要引导用户反复 `auth login`。按主 skill 的“应用身份权限配置检查”处理。

## 相关

- [lark-vc-meeting-list-active](lark-meeting-0.md#s-592e95478e6a0276) — 发现当前进行中会议 ID
- [lark-vc-meeting-events](lark-meeting-0.md#s-0193f3a7e7d4f298) — 读取会中事件
- [lark-vc-meeting-message-send](lark-meeting-0.md#s-06c0fec9ab3dcfbf) — 发送会中文本或 reaction
- [lark-vc-agent-meeting-join](lark-meeting-0.md#s-1ce454738383dec1) — 应用机器人入会


<a id="s-0193f3a7e7d4f298"></a>

## references/lark-vc-meeting-events.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# vc +meeting-events

查询一场正在进行的视频会议中的会中事件列表。该命令是**读操作**，必须沿用 `meeting_id` 的来源身份：用户身份发现的会议继续用用户身份读，应用身份发现或应用机器人入会得到的会议继续用应用身份读。会议结束后不要再用此命令拉取事件，应改为查询会议产物。

本 skill 对应 shortcut：`lark-cli vc +meeting-events`（调用 `GET /open-apis/vc/v1/bots/events`）。

可见性边界：

- `meeting_id` 来自 `+meeting-list-active --as user`：后续读取事件继续 `--as user`。
- `meeting_id` 来自 `+meeting-list-active --as bot --user-id <user_open_id>` 或 `+meeting-join --as bot`：后续读取事件继续 `--as bot`。
- 应用身份下，应用机器人必须当前在该会中；应用身份 active meeting 返回的是“目标用户在会中且应用机器人也在会中”的会议，不表示可以读取任意 `meeting_id`。

## 命令

```text
# 默认用法：全量拉取当前身份可见事件；输出易读时间线
lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-all --format pretty

# 指定时间范围，并拉全该时间窗内当前可见事件
lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --start 2026-04-17T15:00:00+08:00 --end 2026-04-17T16:00:00+08:00 --page-all --format pretty

# 基于上一次保存的 page_token 继续查新增事件
lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-token <last_page_token> --page-all --format pretty
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--meeting-id <id>` | 是 | 会议 ID（长数字 ID，不是 9 位会议号） |
| `--start <time>` | 否 | 起始时间，支持 ISO 8601 / `YYYY-MM-DD` / Unix 秒 |
| `--end <time>` | 否 | 结束时间，支持 ISO 8601 / `YYYY-MM-DD` / Unix 秒 |
| `--page-token <token>` | 否 | 从指定分页游标继续拉取下一页 |
| `--page-size <n>` | 否 | 单页模式每页大小。CLI 会自动夹紧到 `20-100`；传 `--page-all` 时固定使用 `100` |
| `--page-all` | 否 | 自动分页，直到没有更多页面为止（内部有安全上限） |

## 核心约束

### 1. 输入必须是 meeting_id，不是 9 位会议号

`--meeting-id` 必须是会议的长数字 ID。它通常来自：
- `+meeting-join` 返回体中的 `meeting.id`
- `+meeting-list-active` 返回体中的 `meeting_id`
- `+search` 结果中的 `id`

**不要**把 9 位会议号（`--meeting-number`）传给这个命令。
如果 `meeting_id` 来自 `+meeting-list-active`，后续 `+meeting-events` 必须沿用同一身份；如果返回多个会议，先让用户选择具体 `meeting_id`。

如果用户提供的是 9 位会议号且没有明确要求应用机器人入会，先按当前场景身份查 active meetings 并按 `meeting_no` 匹配。匹配到唯一项后，取该项的长数字 `meeting_id`，再用同一身份调用本命令；匹配失败时不要自动入会，除非用户明确说“入会 / 让应用机器人旁听 / 代我参会”。

### 2. 身份来源是读取事件的权限锚点

- `+meeting-events` 支持 `--as user` 和 `--as bot`。
- 用户身份路径：用户身份发现的会议继续用用户身份读取。
- 应用身份路径：应用机器人必须当前在会中；不要拿任意 `meeting_id` 直接查。
- 不要在拿到 `meeting_id` 后随意切换身份。身份不一致时，常见结果是空列表、`no permission` 或 `bot is not in meeting`。

### 3. 应用身份的可见性条件

若应用机器人已离会或未入会，后端通常会报：
- `bot is not in meeting, no permission`

执行准则：

- **会议进行中**：要求应用机器人**当前仍在会中**。
- **应用机器人从未真实入会过**：会中读取会返回 `10005 bot is not in meeting`。
- **会议已经结束**：会返回会议结束错误；不要尝试继续拉取事件，改用会议详情、纪要、逐字稿或录制等会后产物。

### 4. 自动分页规则

- **先分清两层默认值**：
  - shortcut 本身：不传 `--page-all` 时，只查 1 页。
  - 本 skill 的默认策略：除非用户明确要求只看一页，或你确实需要控制返回体大小，否则默认**必须主动带 `--page-all`**，把当前可见事件尽量一次拉全。
- 传 `--page-all`：开启自动分页，直到没有更多页面为止。
- `--page-all` 时，CLI 固定使用最大 `page_size=100`。

执行准则：

- **默认命令模板**：`lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-all --format pretty`
- 如果你发现自己执行成了不带 `--page-all` 的单页查询，而响应里又出现 `has_more=true` / `more available` / 非空 `page_token`，应立刻意识到这只是部分结果。
- 遇到上述情况，默认补救方式是继续使用返回的 `page_token` 续拉，例如：`lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-token <returned_page_token> --page-all --format pretty`
- 只有在用户明确要求“就看第一页”“先不要翻页”时，才不要默认带 `--page-all`
- 只要你是基于 `+meeting-events` 来回答一场**正在进行中的会议内容**，就不能直接复用上一次查询结果。无论用户是在问“现在是谁在说话”“刚刚发生了什么”“最新事件有哪些”，还是让你“总结一下这个会议讲什么”，都必须先重新执行一次 `+meeting-events`，确认拿到的是最新事件流，再回答用户。只有在用户明确要求基于某次历史快照继续分析时，才可以复用旧结果。

### 5. 输出格式差异

- `--format pretty`：默认推荐格式，输出当前身份和逐条时间线，适合快速理解“发生了什么”。
- `--format json`：结构化契约，顶层包含 `meeting`、`identity`、`events`、`has_more`、`page_token`。`identity` 表示当前读取身份；事件 actor 统一含 `participant_type`、`role`、`label`；每条事件保留 `payload` 便于追溯细节。
- `--format ndjson`：输出事件行，并带 metadata 行，适合流式消费。

**选型原则**：默认先用 `--format pretty`；仅当 `pretty` 缺少完成任务所必需的结构化字段时，才改用 `--format json`。用户明确要求 JSON 或规则明确要求结构化字段时可直接用 `--format json`；需要流式消费时用 `--format ndjson`。

> **JSON 成本**：JSON 保留完整 payload，输出通常远大于 `pretty`；长会全量拉取时会显著占用上下文空间。

> **注意**：pretty 输出中的正文文本会做单行转义，真实换行会显示为 `\n`，避免打乱时间线布局。

### 6. 内容理解模式：共享文档不能只看标题

当用户意图是：

- “总结这个会议”
- “这个会议讲了什么”
- “有哪些结论 / 待办 / 关键讨论”
- “共享文档里在讲什么”

不要只基于事件时间线直接回答。此时 `+meeting-events` 只是**线索发现器**，不是最终信息源。

执行准则：

- 如果上下文没有明确 `meeting_id`，先按用户当前意图选择身份：问“我/当前用户所在会议”用 `lark-cli vc +meeting-list-active --as user --format json`；问“应用机器人可见的目标用户会议”用 `lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json`。返回多个会议时先让用户选择。
- 如果上下文只有 9 位会议号，先按当前身份执行 `+meeting-list-active` 并按 `meeting_no` 匹配；匹配到唯一会议后再查事件。不要为了总结会议而自动调用 `+meeting-join`。
- 确认 `meeting_id` 后，沿用其来源身份执行 `lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-all --format pretty` 拉取最新事件流。
- 如果事件流显示共享内容（JSON 事件类型为 `magic_share_started`；pretty 时间线按 `start_reason` 显示“开始共享”或“正在共享”），并包含文档标题或 URL 等线索，必须继续读取共享文档内容后再生成总结，不能只根据共享事件和文档标题概括会议内容。
- 若存在多个共享文档，按用户问题读取相关文档；处理某条文档上下文事件时必须按该 item 的 `share_id` 精确关联，不能用“最近一次共享”替代。
- 若文档读取失败，必须明确说明“以下总结仅基于会中事件流，未成功读取共享文档内容”。

### 7. 文档上下文事件消费

`document_context_changed` 是只读线索事件。需要根据该事件执行评论、章节或预览等后续处理时，必须用 `+meeting-events --page-all --format json` 读取 `share_id`、`comment_id`、`element_token` 等完整字段；仅向用户展示时间线时仍默认使用 pretty。`vc +meeting-events` 保留原始 payload，并按既有事件输出约定派生 actor 与 pretty timeline；它不会为单个事件类型扩张 JSON/NDJSON 公共 envelope，也不会查询评论、下载素材或写文件。后续 Drive/Docs 命令只能由 Agent 按下表显式选择。

#### 共享会话关联

`share_id` 标识一次共享会话。Agent 按事件时间顺序消费完整事件流，并维护共享会话状态：

1. 从 `payload.magic_share_started_items[]` 读取 `share_id` 和 `share_doc`，建立 `share_id -> share_doc` 映射并标记会话开始。同一 `share_id` 重复携带相同文档时按幂等事件处理；若指向不同文档则停止解析，不覆盖旧映射。
2. `document_context_changed_items[]` 通过自己的 `share_id` 精确查找该映射。当前契约中 item 自带的 `share_doc` 不提供文档信息；只保留它的原始值，不作为 URL/title 来源，也不做冲突判定。
3. `payload.magic_share_ended_items[]` 使用相同 `share_id` 标记该会话结束。历史映射可保留用于解释本批次中结束前已发生的上下文事件，但不能再作为新的活动共享会话。
4. 增量拉取从会话中途开始且本地没有对应映射时，重新拉取包含 `magic_share_started` 的完整事件流；仍无法命中则标记未解析。禁止回退到当前文档、最近一次共享或其他 `share_id`。

#### 字段合同

| 路径 | 含义与处理 |
| --- | --- |
| `payload.magic_share_started_items[].share_id/share_doc` | 建立一次共享会话与文档 URL/title 的映射。缺 `share_id` 时不建立映射。 |
| `payload.magic_share_started_items[].start_reason` | `share_started` 或缺失表示真实开始；`share_detected` 表示开启 Agent 入会能力时发现已有共享。两者都建立共享映射。 |
| `payload.magic_share_ended_items[].share_id` | 结束同一 `share_id` 的共享会话；不得结束其他映射。 |
| `payload.document_context_changed_items[]` | 结构化消费按原序读取；pretty timeline 沿用统一时间排序。每项恰有一个已知 context 才生成 pretty 条目，未知/歧义项只保留 raw。 |
| `item.operator` | 当前 item 的 actor；缺 ID/name 时不猜共享发起人。 |
| `item.share_id` | 当前上下文所属共享会话；用它精确查找 `magic_share_started` 建立的 `share_doc` 映射。 |
| `item.share_doc.url/title` | 当前不作为文档元信息来源；保留在 raw payload 以兼容未来扩展。文档 URL/title 只从同 `share_id` 的 `magic_share_started` 映射取得。 |
| `item.time` | Unix 毫秒字符串；缺失或非法时 timeline 回退到事件时间。 |
| `item.comment_focus.comment_id/focused` | `focused=true` 才精确查询一个 comment ID；`false` 是清除焦点，零查询。 |
| `item.section_location.parent_titles/title/level` | `section_path` 按 parent 原序再追加 title，trim 后丢弃空段，以 ` > ` 连接；`level` 仅作诊断，不参与截断或补层。 |
| `item.element_preview.action/element_type/element_token/block_id` | 只有 `open + image + token`、`open + whiteboard + token` 可在明确预览意图下路由；其他组合零调用。 |
| 事件公共 envelope | JSON/NDJSON 只使用既有 `event_id/event_type/event_time/actors/payload`；不新增顶层 `summary/section_path`，也不发明 `derived.document_context`。 |
| 事件 `payload` | 原始恢复面；未知字段保留，顶层空数组沿用所有会议事件共用的压缩规则，派生字段不会写回 payload。 |

#### 评论聚焦：只查一个 ID

先读取当前 item 的 `share_id` 和 `comment_focus.comment_id`，再按“共享会话关联”取得 `share_doc.url`。优先把完整 URL 传给现有 shortcut，由它解析实际 `file_token/file_type`（含 Wiki 解包）；如果上游只留下裸 token，则必须同时提供已解析且受支持的 `file_type`。

```text
# 推荐：share_doc.url 完整可用
lark-cli drive +batch-query-comments \
  --as <same_identity> \
  --url "<share_doc.url>" \
  --comment-ids "<comment_focus.comment_id>" \
  --format json

# 只有已经可靠解析出裸 token/type 时使用
lark-cli drive +batch-query-comments \
  --as <same_identity> \
  --token "<file_token>" \
  --type "<file_type>" \
  --comment-ids "<comment_focus.comment_id>" \
  --format json
```

该 shortcut 对应 `drive.file.comments.batch_query`，请求体必须只有 `comment_ids:["<当前comment_id>"]`。响应处理规则：

1. 整个响应 `items` 长度必须恰为 1，且 `items[0].comment_id` 必须与请求 ID 完全相等。`items` 为空、多于 1 项或唯一项 ID 不同都停止；即使多项中恰有一项匹配，也不得挑选该项继续。失败时保留 `share_doc/comment_id`，禁止改用 `drive +list-comments` 扫描整篇文档。
2. `item.quote` 是引用位置；评论正文和回复在 `item.reply_list.replies`，其中第一条是根评论。
3. 完整性看命中评论卡片的 **`item.has_more`**，不是外层评论分页，也不是根据非空 `page_token` 猜测。`item.has_more=false` 时直接使用内嵌列表，零 `+list-replies` 调用。
4. `item.has_more=true` 时忽略截断列表，从**不带 `--page-token` 的第一页**开始重建完整 replies：

```text
lark-cli drive +list-replies \
  --as <same_identity> \
  --url "<share_doc.url>" \
  --comment-id "<comment_focus.comment_id>" \
  --page-size 100 \
  --format json

lark-cli drive +list-replies \
  --as <same_identity> \
  --url "<share_doc.url>" \
  --comment-id "<comment_focus.comment_id>" \
  --page-size 100 \
  --page-token "<returned_page_token>" \
  --format json
```

第一页 `items[0]` 才是根评论；后续页的 `items[0]` 是普通回复。按页原序累积，直到页级 `has_more=false`。如果 `has_more=true` 但 `page_token` 为空、与已用 token 重复、API/权限失败或 comment ID 改变，立即停止并标记为 `partial`；保留已经取得的内容和原始标识，不循环、不重复根评论、不声称完整。

#### 章节定位

结构化消费直接读取当前 `section_location` item。pretty timeline 会按 `parent_titles` 原序追加 `title`，trim 后丢弃空段，并以 ` > ` 连接；多个 section item 分别展示，不选择其中一个覆盖事件级标量；标题全空时不生成 pretty 条目，只保留 raw。该路径是本地展示派生，不写回 JSON/NDJSON，也不需要或允许为它新增 API 查询。

#### 元素预览：显式白名单

只有用户或上层 Agent 明确要求预览，并且 item 命中下表时才执行。两个命令都会写入 `--output`，因此输出路径必须由本次调用显式选择；不得默认覆盖已有文件。

| action | element_type | token 条件 | 精确命令 |
| --- | --- | --- | --- |
| `open` | `image` | `element_token` 非空 | `lark-cli docs +media-preview --as <same_identity> --token "<element_token>" --output "<explicit-path>"` |
| `open` | `whiteboard` | `element_token` 非空 | `lark-cli docs +media-download --as <same_identity> --type whiteboard --token "<element_token>" --output "<explicit-path>"` |
| `close` | `image`/`whiteboard` | 任意 | 零调用；pretty 只记录预览关闭 |
| 未知 | 任意 | 任意 | 零调用；不生成 pretty 条目，只保留 raw |
| `open` | 未知/空 | 任意 | 零调用；禁止把原值透传到 `--type` |
| `open` | `image`/`whiteboard` | token 为空 | 零调用；保留 `block_id/element_type/action` 并提示缺 token |

#### 失败恢复

- parser 遇到未知字段、歧义 one-of 或单 item 缺字段：保留整个事件 `payload`、`event_id/event_type/event_time` 和可用 sibling；该 item 不生成 pretty 条目，也不合成通用描述。
- `share_id` 缺失、映射未命中或 `share_doc` 冲突：回显 `share_id`、可用的 `share_doc.url/title` 与 `comment_id`；必要时重新拉取完整事件流，仍无法关联则停止，不用最近一次共享兜底。
- `share_doc` 无法解析：回显 `share_id`、`share_doc.url/title` 与 `comment_id`，提示需要有效文档 URL 或已确认的 `file_token/file_type`；不要猜 type。
- Drive API/权限失败：保留精确 batch-query 命令与 `comment_id`，根据 CLI 的 `missing_scopes/hint` 恢复权限后重试；不要扫描全部评论。
- Docs 预览失败：保留 `action/element_type/element_token/block_id` 和用户选择的输出路径，修复权限或 token 后重试同一白名单命令；不要让 `meeting-events` 自动下载兜底。
- 未知 context/type/action：保留 raw 并说明当前 CLI 没有安全路由；不得自动调用 overwrite、download 或任何猜测的 shortcut。

### 8. 关于 `page_token` 的返回与续拉

- 不管这次是只查 1 页，还是通过 `--page-all` 已经把当前可见事件都拿完，都应把最后拿到的 `page_token` 一并保留下来并返回给用户。
- 只要响应里出现 `has_more=true`、pretty 里出现 `more available`，或返回了非空 `page_token`，就必须先判断当前结果是否完整；默认情况下，这意味着你还需要继续分页。
- 如果没有使用 `--page-all`，但出现了上述分页信号，默认应继续用返回的 `page_token` 拉下一页，而不是直接结束。只有在用户明确不要继续翻页时，才可以停止并明确说明当前结果不完整。
- 下次继续“查新增事件”时，应优先复用上一次保存的 `page_token`，而不是从头全量再拉一次。
- 只有在用户明确要求“从头回放全部事件”时，才忽略历史 `page_token`，重新从第一页开始。
- 但如果用户要你回答的是**当前这场会正在讲什么**，而不是“上一次之后新增了什么”，也要先做一次新的事件查询，再决定是否需要基于旧 `page_token` 继续补拉。

## 返回结构

常见顶层字段：

| 字段 | 说明 |
|------|------|
| `meeting` | 会议身份与时间状态，包含 `id/topic/meeting_no/start_time/end_time/status` |
| `identity` | 当前读取身份，包含 `id/name/participant_type/label` |
| `events` | 结构化事件列表；每条事件沿用 `event_id/event_type/event_time/actors/payload` 公共 envelope，事件专属数据保留在 `payload` |
| `warnings` | 非阻断告警列表；事件列表本身仍可使用 |
| `has_more` | 是否还有下一页 |
| `page_token` | 下一页游标 |

事件 `event_type` 常见类型：

| event_type | 含义 |
|-----------|------|
| `participant_joined` | 有参会人加入会议 |
| `participant_left` | 有参会人离开会议 |
| `chat_received` | 收到会中聊天消息 |
| `transcript_received` | 收到转写文本 |
| `magic_share_started` | 开始共享，或开启 Agent 入会能力时发现已有共享；由 `start_reason` 区分 |
| `magic_share_ended` | 结束共享 |
| `document_context_changed` | 评论聚焦、章节定位或元素预览上下文变化 |
| `countdown_changed` | 会中倒计时被设置、延长、提前结束、关闭窗口，或自然结束、临近提醒 |

### Forwarding meeting chat and reactions to IM

转发到 IM 时，Agent 必须先用 `+meeting-events --format json` 的结构化事件构造完整 Feishu `post` 内容，再调用 IM 发送 shortcut。不要解析 pretty/Markdown 输出，也不要先生成纯文本或 Markdown 后再期望 IM 侧二次识别 reaction。

对 `event_type == "chat_received"` 的事件逐项处理 `payload.chat_received_items`：

- `message_type == 3` 是会中 reaction；构造 IM `post` 内容时，以 [`lark-im` reaction emoji 列表]（按模块名读取对应工作流） 作为 IM `emotion` 白名单。白名单内的 key 写成 `{"tag":"emotion","emoji_type":"<content>"}`，例如 `JIAYI`、`THUMBSUP`、`OK`。
- 对不在 IM reaction emoji 白名单内的 reaction key，保留原始 key 但写成文本节点，例如 `{"tag":"text","text":"[<content>]"}`；不应直接写入 `emotion.emoji_type`，否则 IM 发送会失败。
- 不要大小写归一化或猜测映射；`content` 是原始 reaction key，必须原样判断。
- 其他聊天消息写成文本节点：`{"tag":"text","text":"<content>"}`。
- 最终调用 `im +messages-send --msg-type post --content '<post-json>'`，其中 `<post-json>` 应混合使用可渲染 `emotion` 节点和文本 fallback；不要用 `--markdown` 承载会中 reaction。
- 如果 IM 返回 `message_content_emotion_tag's emoji_type is invalid`，只降级非法 reaction key，不要把整条消息退化成纯文本。
- 如果用户原始请求已经明确“发给我 / 推送给我 / 发到我的聊天框 / 发到我的单聊”，这已经覆盖本次收件人、内容和发送动作，直接发送给当前用户，不要再二次询问“是否发送”。
- 默认用应用身份 `--as bot` 发送；只有用户明确要求“用本人身份 / 用户身份发送”时才切到 `--as user`。
- 如果用户要求发给某个群或其他人但收件人不可唯一确定，只询问缺失的收件人信息。

```text
lark-cli vc +meeting-events \
  --as <same_identity> \
  --meeting-id <id> \
  --page-all \
  --format json
```

如果用户已经要求“发给我”，`<open_id>` 使用当前用户的 open_id；需要解析时先用用户查询能力获取当前用户信息。构造 IM post 时只发送用户请求范围内的会中内容，不要把前一条自然语言预览当作发送内容。

## pretty 输出示例

```text
会议主题：张三的视频会议
会议时间：2026-04-17 15:28:52（进行中）

[00:00:33] 明日之虾BOE(ou_xxx) 加入了会议
[00:00:41] 张三(ou_xxx): [text] 6666
[00:00:44] 张三(ou_xxx) 开始共享《智能纪要：飞书20251022-140223 2026年3月9日》
           URL: https://...
[00:01:32] 张三(ou_xxx): [reaction] JIAYI
```

## 如何获取输入参数

| 输入参数 | 获取方式 |
|---------|---------|
| `meeting-id` | `+meeting-join` 返回的 `meeting.id`；或 `+meeting-list-active` 返回的 `meeting_id`；或 `+search` 结果中的 `id`。必须同时记录来源身份 |
| `start` / `end` | 用户给出的时间范围；如未给出则默认取全量可见事件 |
| `page-token` | 上一页或上一次查询结果中保存的 `page_token`；建议持久化保存，便于下次继续拉取新增事件 |

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--meeting-id is required` | 未传入 `--meeting-id` | 传入长数字 `meeting.id` |
| `10005 bot is not in meeting` | 使用应用身份读取，但应用机器人当前不在会中 | 如果 `meeting_id` 来自用户身份发现，改回 `--as user`；如果确实要应用身份读取，先让应用机器人入会，再用 `--as bot`。**如果只是想看参会人快照，改用 `lark-cli vc meeting get --params '{"meeting_id":"<meeting.id>","with_participants":true}'`** |
| 用户身份无权限 / 不可见 | 当前用户不是该会议的可见参与者，或 `meeting_id` 不是从用户身份路径获得 | 不要反复执行 `auth login`。先确认 `meeting_id` 是否来自 `+meeting-list-active --as user`；如果用户明确要切到应用身份，再通过 `+meeting-list-active --as bot --user-id <user_open_id>` 获取应用身份可读的 `meeting_id`，或在用户明确同意后让应用机器人入会，再用 `+meeting-events --as bot` 读取 |
| `20001 meeting_status_MEETING_END` | 会议已经结束 | 本接口不再适合继续拉取事件。先用 `lark-cli vc +detail --meeting-ids <meeting.id>` 获取会议产物信息，再根据 `note_display_type` / `note_id` / `minute_token` 和用户意图选择纪要正文、逐字稿或妙记；参会人请用 `lark-cli vc meeting get --params '{"meeting_id":"<meeting.id>"}' --with-participants` |
| `20002 meeting not exist` | `meeting_id` 错误，或会议实例当前已不可获取（常见于把 9 位会议号当 meeting_id 传） | 确认传入的是长数字 `meeting_id`，不是 9 位会议号 |
| 应用身份权限不足 | 应用权限、租户安装或权限可访问的数据范围未配置完整 | 不要执行 `auth login`。请应用开发者开通 `vc:meeting.bot.join:write`；再检查应用发布/安装和权限可访问的数据范围；配置正确仍失败时，保留错误码和 `log_id`，按服务端权限异常排查 |
| `HTTP 404` / `HTTP 500` | 服务端当前无法找到或处理该会议实例 | 换一个正在进行且 bot 可见的 meeting_id，或排查后端问题 |

## 提示

- 这是**会中事件流**查询，不适合拿来搜历史会议记录；搜历史会议请用 `+search`。
- 如果会议已经结束，不要卡在 `+meeting-events`：  
  - 先用 `lark-cli vc +detail --meeting-ids <meeting.id>` 获取会议产物信息。
  - 再根据 `note_display_type`、`note_id`、`minute_token` 和用户意图，按 `lark-meeting` 的产物决策读取纪要正文、逐字稿或妙记。
- 事件列表是否完整，取决于应用机器人何时入会、何时离会，以及后端当前可见的会中事件范围。会议结束后改用会议产物，不要继续拉取事件。
- 查询"谁参加过某会议"请用 `vc meeting get --params '{"meeting_id":"<id>","with_participants":true}'`——这是参会人**快照** API，不依赖 bot 是否参会，对已结束会议也可查；**不要** 用 `+meeting-events` 做参会人查询。

## 相关场景
- [会中事件与会中互动](lark-meeting-0.md#s-a4ae76e5c00fb3af)
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)


<a id="s-592e95478e6a0276"></a>

## references/lark-vc-meeting-list-active.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# vc +meeting-list-active

列出当前进行中的会议，用来发现 `+meeting-events` 需要的长数字 `meeting_id`。

本 skill 对应 shortcut：`lark-cli vc +meeting-list-active`（调用 `GET /open-apis/vc/v1/bots/user_active_meeting`）。

## 命令

```text
# 查询当前登录用户正在参加的会议
lark-cli vc +meeting-list-active --as user --format json

# 查询指定用户当前参加、且应用机器人也在会中的会议
lark-cli vc +meeting-list-active --as bot --user-id ou_xxx --format json
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--user-id <id>` | 应用身份必填 | 目标用户 open_id，格式为 `ou_...`。用户身份不传；应用身份直接透传给接口，不接受 internal user_id 或数字 ID |

## 身份语义

不要向用户暴露内部身份缩写；对用户只说“用户身份”或“应用身份”。

| 身份 | 命令 | 返回范围 | 后续事件读取 |
| ---- | ---- | -------- | ------------ |
| 用户身份 | `--as user` | 当前登录用户正在参加的会议 | 继续 `+meeting-events --as user` |
| 应用身份 | `--as bot --user-id <user_open_id>` | 目标用户正在参加、且应用机器人也在会中的会议 | 继续 `+meeting-events --as bot` |

硬规则：`meeting_id` 从哪种身份路径拿到，后续 `+meeting-events` 就沿用哪种身份。不要把应用身份拿到的 `meeting_id` 改用用户身份读事件，也不要把用户身份拿到的 `meeting_id` 强制切到应用身份。

应用身份返回空，不代表目标用户不在任何会议中，只能说明没有找到“目标用户在会中且应用机器人也在会中”的当前会。

## 多会议选择

- 如果返回多个会议，不要自动挑第一个。
- 向用户展示每个候选的 `meeting_title` / `meeting_no` / `meeting_id`，等待用户选择。
- 选择后用同一身份执行 `+meeting-events` 读取事件。

## 9 位会议号匹配

用户提供 9 位会议号但没有明确要求应用机器人入会时，把会议号当作 active meeting 的筛选条件，而不是写操作指令。

匹配规则：

- 在返回会议中匹配 `meeting_no == <9位会议号>`。
- 匹配到唯一会议：取该项的长数字 `meeting_id`，后续用同一身份调用 `+meeting-events`。
- 匹配到多个会议：展示候选，让用户选择。
- 没有匹配：说明当前身份没有发现该会议号对应的 active meeting；不要自动调用 `+meeting-join`，除非用户明确要求应用机器人入会。

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--user-id is required when --as bot` | 应用身份未传目标用户 | 传入目标用户 open_id |
| 用户身份返回空列表 | 当前登录用户没有可见的进行中会议 | 确认用户是否在会中，或是否切错身份 |
| 用户身份无权限 / 不可见 | 当前登录用户没有可见的进行中会议，或当前身份无法读取该会议 | 不要反复执行 `auth login`。确认用户是否在会中、是否切错 profile；用户明确要查询应用机器人可见的会议时，再拿目标用户 open_id 执行 `+meeting-list-active --as bot --user-id <user_open_id>` |
| 应用身份返回空列表 | 没有满足“目标用户在会中且应用机器人也在会中”的当前会 | 先让应用机器人入会，或确认 `user_id` 和会议状态 |
| `--user-id` 格式错误 | 传入了 internal user_id 或其他非 `ou_...` 值 | 改传目标用户 open_id |
| 应用身份权限不足 | 应用权限、租户安装或权限可访问的数据范围未配置完整 | 不要执行 `auth login`。请应用开发者开通 `vc:meeting.bot.join:write`；再检查应用发布/安装和权限可访问的数据范围；配置正确仍失败时，保留错误码和 `log_id`，按服务端权限异常排查 |

## 相关场景
- [会中事件与会中互动](lark-meeting-0.md#s-a4ae76e5c00fb3af)
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)


<a id="s-06c0fec9ab3dcfbf"></a>

## references/lark-vc-meeting-message-send.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# vc +meeting-message-send

发送会中文本消息或会中 reaction emoji。

本 skill 对应 shortcut：`lark-cli vc +meeting-message-send`（调用 `POST /open-apis/vc/v1/bots/message`）。

## 适用场景

- 用户要求“在会里发一句话”“提示大家”“给当前会议发消息”。
- 用户要求发送会中表情，例如“发个点赞”“发个 OK”“发个爱心”。
- 用户要求表达会中反馈，例如“听不到”“看不到”“声音清楚”“效果不错”。
- 只用于正在进行中的会议；已结束会议不支持。

## 身份规则

`meeting_id` 从哪种身份路径拿到，发送消息时就沿用哪种身份：

| meeting_id 来源 | 发送时身份 |
| --- | --- |
| `+meeting-list-active --as user` | `+meeting-message-send --as user` |
| `+meeting-list-active --as bot --user-id <user_open_id>` | `+meeting-message-send --as bot` |
| `+meeting-join --as bot` 返回的 `meeting.id` | `+meeting-message-send --as bot` |

不要把用户身份发现的 `meeting_id` 改用应用身份发送，也不要把应用身份发现的 `meeting_id` 改用用户身份发送，除非用户明确要求切换。

## 参数

| 参数 | 说明 |
| --- | --- |
| `--meeting-id` | 必填，长数字 `meeting_id`，不是 9 位会议号 |
| `--msg-type` | 可选，`text` 或 `reaction`；只传 `--text` 或只传 `--emoji-type` 时可自动推断 |
| `--text` | 文本消息内容 |
| `--emoji-type` | 会中 reaction emoji key，大小写敏感，必须从本文“完整 `emoji_type` 列表”中选择 |
| `--uuid` | 可选，幂等 key；不传则服务端生成 |

CLI 会把 `--text` 或 `--emoji-type` 统一映射到 OpenAPI 请求体的 `content` 字段；`meeting_id` 也在请求体中传递。

## 文本消息

```text
lark-cli vc +meeting-message-send --as user --meeting-id <meeting_id> --text "稍等，我在看文档"
```

文本消息会出现在会议内的文本互动区。不要把它当成绑定群消息发送能力；如果用户明确要求发到群聊，路由到 `lark-im`。

## 会中表情

会中 reaction 支持普通 Feishu reaction emoji，也支持 4 个 VC 反馈 key。

常见语义：

| 用户表达 | 推荐 `emoji_type` |
| --- | --- |
| 点赞、赞一下、认可 | `THUMBSUP` |
| +1、加一、附议、同上 | `JIAYI` |
| OK、好的 | `OK` |
| 收到、了解 | `Get` |
| 爱心、红心 | `HEART` |
| 喜欢、爱了 | `LOVE` |
| 比心 | `FINGERHEART` |
| 看起来没问题、可以继续 | `LGTM` |
| 搞定、已完成 | `DONE` |
| -1、减一 | `MinusOne` |
| 不赞同、踩 | `ThumbsDown` |
| 听不到、没声音 | `VC_NoSound` |
| 看不到、画面有问题 | `VC_CanNotSee` |
| 声音清楚 | `VC_SoundsClear` |
| 会议画面效果不错、画面看起来可以 | `VC_LooksGood` |

```text
lark-cli vc +meeting-message-send --as bot --meeting-id <meeting_id> --msg-type reaction --emoji-type LOVE
lark-cli vc +meeting-message-send --as bot --meeting-id <meeting_id> --msg-type reaction --emoji-type VC_NoSound
```

不要编造列表外的 `emoji_type`，也不要把 mixed-case 值改成全大写，例如 `EatingFood`、`CheckMark`、`StatusInFlight` 都要按原值传。

如果用户给的是自然语言语义，可以在下方列表中选择语义最接近的 key；如果不确定，先向用户确认。

### 完整 `emoji_type` 列表

以下列表与 IM reaction 官方 emoji 列表保持一致，并额外包含 VC 会中特定反馈 key：

```text
OK, THUMBSUP, THANKS, MUSCLE, FINGERHEART, APPLAUSE, FISTBUMP, JIAYI
DONE, SMILE, BLUSH, LAUGH, SMIRK, LOL, FACEPALM, LOVE
WINK, PROUD, WITTY, SMART, SCOWL, THINKING, SOB, CRY
ERROR, NOSEPICK, HAUGHTY, SLAP, SPITBLOOD, TOASTED, GLANCE, DULL
INNOCENTSMILE, JOYFUL, WOW, TRICK, YEAH, ENOUGH, TEARS, EMBARRASSED
KISS, SMOOCH, DROOL, OBSESSED, MONEY, TEASE, SHOWOFF, COMFORT
CLAP, PRAISE, STRIVE, XBLUSH, SILENT, WAVE, WHAT, FROWN
SHY, DIZZY, LOOKDOWN, CHUCKLE, WAIL, CRAZY, WHIMPER, HUG
BLUBBER, WRONGED, HUSKY, SHHH, SMUG, ANGRY, HAMMER, SHOCKED
TERROR, PETRIFIED, SKULL, SWEAT, SPEECHLESS, SLEEP, DROWSY, YAWN
SICK, PUKE, BETRAYED, HEADSET, EatingFood, MeMeMe, Sigh, Typing
Lemon, Get, LGTM, OnIt, OneSecond, VRHeadset, YouAreTheBest, SALUTE
SHAKE, HIGHFIVE, UPPERLEFT, ThumbsDown, SLIGHT, TONGUE, EYESCLOSED, RoarForYou
CALF, BEAR, BULL, RAINBOWPUKE, ROSE, HEART, PARTY, LIPS
BEER, CAKE, GIFT, CUCUMBER, Drumstick, Pepper, CANDIEDHAWS, BubbleTea
Coffee, Yes, No, OKR, CheckMark, CrossMark, MinusOne, Hundred
AWESOMEN, Pin, Alarm, Loudspeaker, Trophy, Fire, BOMB, Music
XmasTree, Snowman, XmasHat, FIREWORKS, 2022, REDPACKET, FORTUNE, LUCK
FIRECRACKER, StickyRiceBalls, HEARTBROKEN, POOP, StatusFlashOfInspiration, 18X, CLEAVER, Soccer
Basketball, GeneralDoNotDisturb, Status_PrivateMessage, GeneralInMeetingBusy, StatusReading, StatusInFlight, GeneralBusinessTrip, GeneralWorkFromHome
StatusEnjoyLife, GeneralTravellingCar, StatusBus, GeneralSun, GeneralMoonRest, MoonRabbit, Mooncake, JubilantRabbit
TV, Movie, Pumpkin, BeamingFace, Delighted, ColdSweat, FullMoonFace, Partying
GoGoGo, ThanksFace, SaluteFace, Shrug, ClownFace, HappyDragon
VC_CanNotSee, VC_NoSound, VC_LooksGood, VC_SoundsClear
```

## 9 位会议号处理

如果用户给的是 9 位会议号并要求发送会中消息：

1. 先按当前身份执行 `+meeting-list-active`。
2. 在返回结果中按 `meeting_no` 匹配该 9 位会议号。
3. 匹配到唯一会议后取长数字 `meeting_id`。
4. 用发现该会议时的同一身份执行 `+meeting-message-send`。

匹配失败时不要自动入会。只有用户明确要求“让应用机器人入会/旁听/代参会”时，才改用 `+meeting-join`。

## 权限和前置条件

- 用户身份：当前用户必须正在该会议中。
- 应用身份：应用机器人必须正在该会议中。
- 会议需要开启会中智能体/Agent 能力开关。
- 需要 `vc:meeting.message:write` 权限；应用身份还需要应用已安装、数据范围已配置。

应用身份权限错误时，不要引导用户反复 `auth login`。按主 skill 的“应用身份权限配置检查”处理。

## 相关场景
- [会中事件与会中互动](lark-meeting-0.md#s-a4ae76e5c00fb3af)
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)


<a id="s-c4eacc3fed2ea93a"></a>

## references/lark-vc-meeting-screenshot.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# `vc +meeting-screenshot`

获取视频会议截图，并保存为 JPEG。

## 常用用法

使用当前用户身份截图，文件写入默认目录：

```text
lark-cli vc +meeting-screenshot --as user --meeting-id <long_meeting_id>
```

使用机器人身份截图，并指定输出路径：

```text
lark-cli vc +meeting-screenshot --as bot --meeting-id <long_meeting_id> --output ./meeting-screenshots/current.jpg
```

## 参数

| Flag | 含义与用法 |
| --- | --- |
| `--as <identity>` | 选择 `user` 或 `bot` 身份。使用发现 `meeting_id` 时的同一身份：`user` 要求当前用户在会中；`bot` 要求机器人已入会并具备会中读取权限。 |
| `--meeting-id <meeting_id>` | 必填。长数字会议 ID，不接受 9 位会议号；只有会议号时，先用同一身份调用 `vc +meeting-list-active` 获取。 |
| `--output <relative-path>` | 可选。指定 JPEG 文件名或包含子目录的相对路径；相对于执行命令时的当前工作目录。 |
| `--overwrite` | 可选。目标文件已存在时允许替换；不传时命令会失败并保留原文件。 |

## 文件路径与结果

- 未指定 `--output` 时，默认写入当前工作目录下的 `meeting-screenshots/<meeting_id>-<UTC timestamp>.jpg`。
- `--output` 可以只写文件名，也可以包含多级子目录；父目录会自动创建。
- 不接受绝对路径，也不接受解析后超出当前工作目录的 `..` 或符号链接路径。
- 成功结果包含绝对文件路径、字节数、JPEG content type、SHA-256 和服务端 `log_id`。
- 服务端决定截图内容并校验会议是否满足条件；调用方不能指定要截取的区域或共享内容。失败不会替换已有文件。


<a id="s-8d08d39b956adcd3"></a>

## references/lark-vc-recording.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


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

### 2. 身份支持

`--meeting-ids` 和 `--calendar-event-ids` 都支持 `--as user` / `--as bot`。用户身份只能查自己有权限的录制；应用身份只能查应用有权限的录制。拿到 `minute_token` 后，传给 `minutes minutes get`、`minutes +detail` 或 `minutes +download` 时必须显式沿用同一个 `--as`。

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

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `exactly one of ... is required` | 未传入参数或同时传了多种 | 只指定一种输入方式 |
| `no recording available` | 该会议无录制或录制未完成 | 确认会议已结束且开启了录制 |
| `121005 no permission` | 无权查看该会议录制 | 确认是会议参与者或有录制权限 |
| `124002 recording generating` | 录制文件仍在生成中 | 等待录制完成后重试 |
| `missing required scope(s)` | 权限不足 | `--as user`：按提示运行 `auth login --scope`；`--as bot`：使用错误中的 `console_url` 去开发者后台开通，**禁止**对 bot 执行 `auth login`（见 [lark-shared]（按模块名读取对应工作流） 的权限管理） |

## 提示

- 默认使用 `--format json` 输出，Agent 更擅长解析 JSON 数据。
- 排查参数与请求结构时优先使用 `--dry-run`。
- `minute_token` 从录制 URL 尾段解析（`https://meetings.feishu.cn/minutes/{minute_token}`）。
- 拿到 `minute_token` 后，如果要妙记基础信息，优先传给 `minutes minutes get`；如果要下载媒体文件，传给 `minutes +download`；如果要逐字稿、总结、待办、章节，再传给 `minutes +detail --minute-tokens`。

## 相关场景
- [查询会议及其产物](lark-meeting-0.md#s-f0bd564eb956c3d7)


<a id="s-336b0395b2ffd277"></a>

## references/lark-vc-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# vc +search

搜索已结束的历史会议记录，支持关键词、时间范围、组织者、参与者、会议室多条件过滤。只读，支持 `--as user` / `--as bot`。

## 关键词使用边界

`--query` 只用于 9 位会议号或真实会议关键词，例如会议主题、项目名、评审名、客户名。用户只是说"我这月参加的所有视频会议"、"最近两周我组织的所有视频会议"、"总结主要议题 / 看看参会情况"时，本质是历史会议列表和后续总结，不要把"回顾"、"所有视频会议"、"总结主要议题"等动作词放进 `--query`。这类请求应先用时间范围 + `--participant-ids` / `--organizer-ids` 搜全量候选，再按结果继续取纪要或录制信息。

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

# 通过 9 位会议号查询会议 ID
lark-cli vc +search --query "123456789" --format json --as user
lark-cli vc +search --query "123456789" --format json --as bot

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
| `--query <text>` | 否 | 9 位会议号或搜索关键词 |
| `--start <time>` | 否 | 开始时间（ISO 8601 或仅日期） |
| `--end <time>` | 否 | 结束时间（ISO 8601 或仅日期） |
| `--organizer-ids <ids>` | 否 | 组织者 open_id 列表，逗号分隔；多值为 OR 语义 |
| `--participant-ids <ids>` | 否 | 参与者 open_id 列表，逗号分隔；多值为 OR 语义 |
| `--room-ids <ids>` | 否 | 会议室 ID 列表，逗号分隔；多值为 OR 语义 |
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

### 3. 支持 user 和 bot 身份

该接口支持 `--as user` 和 `--as bot`。user 身份需要完成 `lark-cli auth login` 并具备 `vc:meeting.search:read` 权限；bot 身份使用应用的 tenant access token，需要确认当前应用已开通 `vc:meeting.search:read` scope，且运行环境能获取有效的 TAT。

搜索得到 `meeting_id` 后，后续 `vc +detail`、`vc +recording`、`vc meeting get` 和 `note +detail` 必须显式沿用本次搜索使用的身份。不要为了绕过权限错误自动切换身份。

### 4. 支持分页

当返回 `has_more=true` 时，使用响应中的 `page_token` 配合 `--page-token` 获取下一页结果。

### 5. 日期型 `--end` 包含当天整天

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

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| 命令直接报错，要求提供过滤条件 | 没有传入 `--query`、时间范围或任何过滤 ID | 至少补充一个过滤条件后重试 |
| 时间参数校验失败 | `--start` 或 `--end` 格式不合法 | 改用 ISO 8601 或 `YYYY-MM-DD` |
| 搜不到未来会议 | `vc +search` 只查历史会议 | 改用 [lark-calendar]（按模块名读取对应工作流） 查询未来日程 |
| 权限不足 | 未授权 `vc:meeting.search:read` | `--as user`：按提示完成用户授权；`--as bot`：检查 tenant access token 和应用 scope，不要执行 `auth login` |

## 提示
- 必须使用 `--format json` 输出，便于稳定解析。
- 排查参数与请求结构时优先使用 `--dry-run`。
- 搜索的时间范围最大为 1 个月，如果需要搜索更长时间范围的会议，需要拆分为多次时间范围为一个月查询。
- 不要使用 `yesterday`、`today` 这类相对时间字面量；请先转换成明确日期，例如 `2026-03-10`。
- 用户如果明确问的是“妙记信息”而不是“纪要内容”，不要默认走 `vc +detail`；应先用 `vc +recording`。

## 相关场景
- [查询会议及其产物](lark-meeting-0.md#s-f0bd564eb956c3d7)


<a id="s-d6d9955b0380747c"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
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
| `cli.minutes.minutes.get` | Get minutes meta | feishu_read_tool |
| `cli.vc.meeting.get` | Obtain meeting details | feishu_read_tool |


<a id="s-2b52e88c32b7298d"></a>

## scenes/create-and-edit-minutes.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 生成和修改妙记、管理妙记权限

生成妙记和修改妙记都是写操作，必须有用户明确意图。生成成功后保存 `minute_token`；修改前确认唯一 `minute_token` 和目标内容，提供 token 不等于授权修改。除 `minutes +apply-permission` 外，本场景的 Minutes 写命令仅支持用户身份；来源身份为 bot 时停止并说明限制，只有用户明确同意后，才以 `--as user` 重新开始修改流程。`minutes +apply-permission` 支持用户或应用身份，必须沿用触发权限错误时的身份。

## 从本地音视频生成妙记

标准链路是 Drive 上传 → Minutes 创建 → 按需读取产物。不要改用 ffmpeg、Whisper 或其他本地 ASR。

### 上传音视频到 Drive

确认本地媒体路径以及用户最终需要妙记链接、逐字稿、总结、待办还是章节。源文件须符合 [`minutes +upload`](lark-meeting-0.md#s-08c8ebf5c8321239) 的格式要求，时长不超过 6 小时，大小不超过 6 GB。

按 [`lark-drive`]（按模块名读取对应工作流） 的路径和写操作规则执行 `drive +upload`，取得 `file_token`。上传参数和文件限制见 [`lark-drive-upload`]（按模块名读取对应工作流）。

### 使用 file_token 创建妙记

```text
lark-cli minutes +upload --file-token <file_token> --as user
```

从返回的 `minute_url` 路径最后一段提取 `minute_token`，去掉 query 参数。创建参数、支持格式和异步语义见 [`lark-minutes-upload`](lark-meeting-0.md#s-08c8ebf5c8321239)。`minutes +upload` 成功仅表示异步创建请求已提交；报告返回的 `minute_url` 和可解析的 `minute_token`。未执行 `minutes +detail` 并确认就绪前，不得声称妙记产物已生成或可用。用户只要求发起创建或返回链接时，到此停止。

### 等待并读取妙记产物

上传后立即读取产物时必须加 `--wait-ready`：

```text
lark-cli minutes +detail --minute-tokens <minute_token> --wait-ready --transcript --as user
```

将 `--transcript` 替换或扩展为用户需要的 `--summary`、`--todo`、`--chapter` 或 `--keyword`。创建任务仍在处理中时，按返回状态和重试提示轮询；不要重复上传或重复创建妙记。

用户要求独立提炼或复盘时，读取 Transcript 并基于原始发言分析，不要复述现成 Summary。产物 flags 和等待行为见 [`lark-minutes-detail`](lark-meeting-0.md#s-3e1c4a681cc2ae6d)。

### 从失败阶段恢复

- Drive 上传成功但 Minutes 创建失败：保留并报告 `file_token`，从创建妙记继续，不要重复上传。
- Minutes 创建成功但产物未就绪：保留 `minute_token` 并重试查询，不要重新创建妙记。
- 不得把 Drive 上传成功误报为妙记创建成功；明确报告失败发生在上传、创建还是产物生成阶段。

## 修改妙记标题

使用 `minutes +update --minute-token <token> ... --as user`。参数见 [`lark-minutes-update`](lark-meeting-0.md#s-0791096865f48330)。

## 替换 AI 总结

使用 `minutes +summary --minute-token <token> ... --as user` 替换总结全文。内容格式与权限见 [`lark-minutes-summary`](lark-meeting-0.md#s-860055b8893752bd)。

## 增删改 AI 待办

妙记 AI 待办不是飞书任务。上下文包含妙记 URL / `minute_token` 并要求修改妙记待办时，禁止改走 `lark-task`；用户同时指定了负责人（包括"负责人是我"）也不改变归属。

```text
lark-cli minutes +todo --minute-token <token> --operation add|update|delete ... --as user
```

- 多条新增优先使用 `--todos` 批量提交。
- 更新或删除前，先执行 `minutes +detail --minute-tokens <token> --todo --as user`，按内容匹配取得精确 `todo_id`；不要用列表顺序代替 ID。
- 待办 ID、批量结构和部分成功语义见 [`lark-minutes-todo`](lark-meeting-0.md#s-4eda03852c02682a)。

### 指定负责人

妙记待办表示负责人的既定写法是把 `@姓名` 作为纯文本写进待办内容，不存在独立的负责人字段：

- 用户直接给出姓名时不做任何查找，原文拼成 `@姓名`。
- 用户说"负责人是我"时，先用 `lark-cli contact +get-user --as user` 取真实姓名再拼接；取不到就不写任何 `@` 提及，不要保留字面的 `@我`。
- 姓名解析只影响追加的 `@` 文本，绝不能阻塞或取消待办创建；不要为处理负责人改走 `lark-task` 或做进一步通讯录搜索。
- 不要用"以你的身份创建即归属于你"代替真正的 `@` 文本拼接；`--as` 身份和负责人是两件不相关的事。
- 回复只陈述结果（妙记、待办内容、负责人、完成状态），不要解释接口字段限制，也不要建议改用 `lark-task` 来"明确负责人"。

完整规则和示例见 [`lark-minutes-todo`](lark-meeting-0.md#s-4eda03852c02682a) 的「负责人 / `@` 提及」。

## 批量替换逐字稿关键词

`+word-replace` 修改的是妙记「转写／逐字稿／文字记录」中的字面词条（同一产物的不同叫法）。

`--minute-token` 必须是妙记 token（例如 `obcn...`），合法输入只有两种：`minutes +search` / `vc +recording` 等接口返回的 `token` 字段，或从妙记 URL 里提取最后一段路径并去掉 query 参数后的裸 token。禁止直接传妙记标题、URL 里的 slug、会议主题或完整妙记 URL；不确定时先跑 `minutes +search` / `vc +recording` 拿到 `minute_token` 再执行替换。

```text
lark-cli minutes +word-replace --minute-token <token> --replace-words '[{"source_word":"<old>","target_word":"<new>"}]' --as user
```

多组替换放在同一个 JSON 数组中。具体参数运行 `lark-cli minutes +word-replace --help`。

用户给出原词和目标词后直接替换：不要为了核对写法先读取 Transcript，也不要在替换成功后回读 Transcript 验证。接口逐词返回结果，按结果回报即可。

只要有一个关键词命中就是成功：`data.message` 列出 Succeeded 和 Failed 关键词。重试时只提交 Failed 的词，不要重复提交已成功的词，否则会把新词再替换一遍。

全部关键词都没命中才是失败（`not_found`）。这是参数问题而不是权限问题；如实告知用户哪些词没命中，请用户确认精确写法、大小写和空格后再决定是否重试，不要靠读取 Transcript 自行猜词。

## 替换逐字稿说话人

1. 调用 `lark-cli api GET "/open-apis/minutes/v1/minutes/<token>/transcript/speakerlist"` 取得 `speaker_id`。
2. 按原说话人的显示名称精确匹配。存在同名候选时，结合 Transcript 展示候选并让用户确认，不要擅选。
3. 用户只提供目标姓名时，用 [`lark-contact`]（按模块名读取对应工作流） 解析为 `ou_` open_id。
4. 执行 `minutes +speaker-replace --from-speaker-id <speaker_id> --to-user-id <open_id> --as user`；不要把展示名传给 `--from-speaker-id`。

完整流程和参数见 [`lark-minutes-speaker-replace`](lark-meeting-0.md#s-45f8b0d7733efe34)。

## 查看妙记授权列表

用户要查看妙记已授权给哪些成员，或查询某个成员当前的查看 / 编辑权限时，使用 Drive 协作者列表；这不是读取妙记内容，也不是为当前身份申请权限。先读取 [`lark-drive`]（按模块名读取对应工作流） 和 [`drive +member-list`]（按模块名读取对应工作流）。

```text
lark-cli drive +member-list --token "<minute_url>" --as <source_identity> --format json
```

完整妙记 URL 可自动推断资源类型为 `minutes`；裸 `minute_token` 必须显式传 `--type minutes`。需要核对指定成员时，按 `member_id` 精确匹配返回的 `items[]`，不要按姓名或列表顺序猜测。

## 分配妙记权限

用户要求“把妙记分享给某人”“让某人可以查看 / 编辑”或“给某人授予权限”时，修改的是目标妙记的协作者权限，使用 `drive +member-add`；禁止使用 `minutes +apply-permission`，后者只为当前调用身份向妙记所有者申请权限。

先读取 [`lark-drive`]（按模块名读取对应工作流） 和 [`drive +member-add`]（按模块名读取对应工作流）。目标成员只有展示名时，按 [`lark-contact`]（按模块名读取对应工作流） 将其唯一解析为对应 ID；存在多个候选时请用户选择，不得猜测。

```text
lark-cli drive +member-add \
  --token "<minute_url>" \
  --member-id "<open_id>" \
  --member-type openid \
  --perm view \
  --yes \
  --as <source_identity> \
  --format json
```

完整妙记 URL 可自动推断资源类型为 `minutes`；裸 `minute_token` 必须显式传 `--type minutes`。根据用户要求选择 `view` 或 `edit`；妙记不支持 `full_access`。只有妙记、目标成员和权限档位均已明确，且用户已明确要求执行授权时，才传 `--yes`。

写入后使用 `drive +member-list` 按 `member_id` 回读验证。只有返回的目标成员权限与用户要求一致时，才能声明分配完成；若目标成员已有不同权限，不要仅根据 `member-add` 回执声称权限已被覆盖或降级。

## 为当前身份申请妙记权限

没有查看或编辑权限时，先说明权限事实。只有用户明确要求申请权限时才执行：

```text
lark-cli minutes +apply-permission --minute-token <token> --perm view --as <source_identity>
```

根据用户目标选择 `view` 或 `edit`，并必须沿用触发无权错误时的身份。这只是发起申请，不代表已经获得权限。身份和权限语义见 [`lark-minutes-apply-permission`](lark-meeting-0.md#s-d4c7d9db1161e205)。

`permission_denied` 表示对该妙记没有编辑权，不等于 OAuth scope 缺失；请所有者授权，不要误走 `auth login --scope`。

## ASR/AI 额度不足

`minutes +upload`、`+summary`、`+todo` 和 `+word-replace` 都可能返回 `quota_exceeded`，表示 ASR/AI 额度已耗尽。`+upload` 是额度不足以转写这个音视频，妙记根本没有创建；其余三个是该妙记生成时额度就已用尽、AI 产物未完整生成，写操作无法落库。

请用户去妙记详情页查看额度详细信息，不要重试：CLI 无法补充或提升额度，重试同样的请求不会成功。这不是权限问题，也不要误走 `+apply-permission` 或 `auth login --scope`。

## 确认修改结果

修改前只读取目标相关字段，修改后用 `minutes +detail` 或对应读取接口回读。命令自身已逐项返回写入结果时不再回读，例如 `minutes +word-replace` 的 Succeeded / Failed 关键词。批量或多步修改逐项报告写前值、写后结果和失败原因；部分成功时不要回滚已成功项，除非命令明确承诺原子回滚。


<a id="s-007bc536dd114079"></a>

## scenes/live-meeting-attend.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 应用机器人参会与会中互动

编排应用机器人的完整会中流程：发现已在参加的会议，或在用户明确授权后发起或加入会议；随后拉取会中事件、发送文本或会中表情、操作倒计时，并仅在用户明确要求时结束会议或离会。

## 选择入口

| 当前条件 | 起点 |
|---|---|
| 已有应用身份取得的 `meeting_id` | 直接拉取事件，不重复查询或入会 |
| 应用机器人可能已在会中 | 已知目标用户 `user_open_id` 时，先用 `+meeting-list-active --as bot --user-id <user_open_id>` 发现会议 |
| 用户明确要求机器人入会、旁听或代参会 | 使用 `+meeting-join --as bot` |
| 用户明确要求机器人发起日程会议 | 使用 `+meeting-join --as bot --action start` |
| 只想查当前用户所在会议 | 使用 [会中事件与会中互动](lark-meeting-0.md#s-a4ae76e5c00fb3af) 的用户身份路径，不让应用机器人入会 |

用户只提供 9 位会议号或询问会议内容，不等于授权机器人入会。

## 发现应用机器人已在参加的会议

已知目标用户 `ou_` open_id 时，先查询“目标用户正在参会且应用机器人也在同一会议”的活跃会议：

```text
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
```

- 返回多个会议时，展示主题、会议号和 `meeting_id` 让用户选择；不擅自取第一个。
- 返回空不代表目标用户没有在开会，只表示没有找到应用机器人也在会中的可见会议。
- 用户提供 9 位会议号时，在结果中按 `meeting_no` 匹配；匹配失败时不自动入会。
- 保存选定的长整数 `meeting_id`，后续事件、消息、倒计时和离会命令都沿用 `--as bot`。

身份可见范围、多会议选择和会议号匹配见 [`lark-vc-meeting-list-active`](lark-meeting-0.md#s-592e95478e6a0276)。

## 发起或加入会议

只有用户明确要求应用机器人发起、加入、旁听或代参会时才执行。输入是 9 位会议号，不是长整数 `meeting_id`。

```text
# 发起日程会议并加入
lark-cli vc +meeting-join --as bot --meeting-number <9_digit_meeting_number> --action start

# 加入正在进行的会议
lark-cli vc +meeting-join --as bot --meeting-number <9_digit_meeting_number>
```

- 入会前确认目标会议号和用户意图；这是对其他参会人可见的写操作。
- `--action start` 仅用于发起符合条件的日程会议；未传时保持加入正在进行的会议。
- 保存返回的 `meeting.id`；后续邀请、拉取事件、发送会中消息、操作倒计时、结束或离会都使用该 ID 与 `--as bot`。
- 应用机器人可以同时加入多场会议；加入新会议前不需要退出其他会议。
- 根据返回状态确认入会成功，不要把“请求已发起”当作已入会。

会议密码、等候室、写操作风险和异常恢复见 [`lark-vc-agent-meeting-join`](lark-meeting-0.md#s-1ce454738383dec1)。

## 邀请参会人

只有用户明确要求邀请时才执行。输入是长数字 `meeting_id`，不是 9 位会议号。

```text
# 邀请指定用户
lark-cli vc +meeting-invite --as bot --meeting-id <meeting_id> --type SELECTED --open-ids <open_id>

# 邀请全部合格日程参会人
lark-cli vc +meeting-invite --as bot --meeting-id <meeting_id> --type ALL_SUGGESTED
```

- 应用机器人必须已在目标 Calendar VC 中。
- `SELECTED` 接收用户 `open_id`；`ALL_SUGGESTED` 由服务端筛选合格日程参会人。
- 以返回结果确认邀请状态，不把请求提交当作参会人已入会。

邀请类型、人数上限和结果语义见 [`lark-vc-agent-meeting-invite`](lark-meeting-0.md#s-92614d068beec283)。

## 拉取会中事件

使用应用身份发现或入会得到的 `meeting_id`：

```text
lark-cli vc +meeting-events --as bot --meeting-id <meeting_id> --page-all --format pretty
```

- 默认使用 `--page-all` 拉取当前完整事件流，并保留返回的 `page_token` 供后续增量查询。
- 回答“现在、刚刚、最新”或总结当前会议前，重新拉取最新事件；不直接复用旧快照。
- 应用机器人必须当前在会中；不要用任意 `meeting_id` 尝试读取。
- 会中事件不能替代已结束会议的参会人快照、纪要、逐字稿或录制。

事件类型、分页、会后产物替代路径和文档上下文处理见 [`lark-vc-meeting-events`](lark-meeting-0.md#s-0193f3a7e7d4f298)。

## 发送会中文本或表情

每次发送都是对会中参会人可见的写操作。只有用户明确要求发送，并已确认目标会议和内容时才执行。

```text
# 文本消息
lark-cli vc +meeting-message-send --as bot --meeting-id <meeting_id> --msg-type text --text "<message>"

# 普通会中表情
lark-cli vc +meeting-message-send --as bot --meeting-id <meeting_id> --msg-type reaction --emoji-type THUMBSUP
```

- 始终沿用产生 `meeting_id` 的应用身份；不要切换成用户身份。
- reaction 必须使用 Reference 中大小写敏感的完整 `emoji_type` 列表；不编造 key。
- 发送失败时停止并报告；不自动重试或换身份，避免产生重复可见消息。
- 用户要发绑定群或 IM 消息时改用 `lark-im`，不使用会中消息命令。

文本、reaction 语义、完整 emoji key 和幂等参数见 [`lark-vc-meeting-message-send`](lark-meeting-0.md#s-06c0fec9ab3dcfbf)。

## 操作会中倒计时

每次倒计时操作都是对会中参会人可见的写操作。只有用户明确要求设置、延长、提前结束或关闭倒计时时才执行。

```text
# 设置倒计时
lark-cli vc +meeting-countdown --as bot --meeting-id <meeting_id> --action set --duration <minutes>

# 延长倒计时
lark-cli vc +meeting-countdown --as bot --meeting-id <meeting_id> --action prolong --duration <minutes>
```

- 始终沿用产生 `meeting_id` 的应用身份；不要切换成用户身份。
- 用户只给 9 位会议号时，先按应用身份活跃会议列表匹配；匹配失败时不要为了倒计时自动入会，除非用户明确要求机器人入会。
- `end_in_advance` 和 `close_window` 不携带 `--duration`、提醒点或结束音频参数。
- 操作失败时停止并报告；不自动重试或换身份，避免重复可见副作用。

动作、提醒点和权限规则见 [`lark-vc-meeting-countdown`](lark-meeting-0.md#s-206fbaf6aa28aa3f)。

## 结束会议

只有用户明确要求结束整场会议时才执行；不要把结束会议和机器人离会混用。

```text
lark-cli vc +meeting-end --as bot --meeting-id <meeting_id> --yes
```

- 输入是长数字 `meeting_id`。
- 当前应用机器人必须是 Host；结束成功会结束整场会议。
- 根据返回状态确认会议已结束。

身份、权限和失败原因见 [`lark-vc-agent-meeting-end`](lark-meeting-0.md#s-021163033cf31c99)。

## 离开会议

只有用户明确要求机器人退出、离开或结束参会时才执行：

```text
lark-cli vc +meeting-leave --as bot --meeting-id <meeting_id>
```

- 使用入会返回或应用身份活跃会议查询得到的 `meeting_id`，并确认机器人当前在该会议中。
- 不要因为任务完成而自动离会。
- 用户只要会后产物时，转入会议产物场景，不为此先执行离会。
- 根据返回状态确认离会完成。

离会参数、可见副作用和完成判定见 [`lark-vc-agent-meeting-leave`](lark-meeting-0.md#s-384f08d6b9592cc5)。

## 应用身份权限配置检查

应用身份返回 `no permission`、`missing required scope(s)` 或 `missing_scopes` 时，不要执行 `auth login`。按顺序检查：

1. 按 CLI 错误中的 `hint` 处理；返回 `console_url` 时将其原样提供给用户。
2. 确认应用已开通对应权限，已发布并安装到当前租户。入会和应用身份会议查询需要 `vc:meeting.bot.join:write`；会中发消息需要 `vc:meeting.message:write`；会中倒计时需要 `vc:meeting.interaction:write`。
3. 在开放平台确认“权限可访问的数据范围”已保存为“按条件筛选”，条件为“会议的归属者 包含 与应用的可用范围一致”。
4. 上述配置均正确仍失败时，保留 CLI 返回的错误码和 `log_id`，按服务端权限异常排查；不要反复登录或改用其他身份重试。

## 会后边界

- 已结束会议的搜索、参会人快照、智能纪要、逐字稿、妙记或录制，转入 [查询会议及其产物](lark-meeting-0.md#s-f0bd564eb956c3d7)。
- 会后要把产物发到群或私聊，先使用会议产物场景获取结果，再转 `lark-im`。


<a id="s-a4ae76e5c00fb3af"></a>

## scenes/live-meeting-interact.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 读取会中事件与会中互动

围绕一场正在进行的会议执行只读查询或用户明确授权的会中写操作。真实入会/离会使用应用机器人入会场景；已结束会议和会后产物使用会议查询场景。

如果任务包含“应用机器人入会后继续拉取事件或互动”，只读取并执行 [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079) 的完整流程，不要在两个场景之间来回切换。

## 发现进行中的会议

没有 `meeting_id` 时，按用户需要的视角查询：

```text
# 当前登录用户正在参加的会议
lark-cli vc +meeting-list-active --as user --format json

# 目标用户正在参加、且应用机器人也在会中的会议
lark-cli vc +meeting-list-active --as bot --user-id <open_id> --format json
```

- `--user-id` 必须是目标用户的 `ou_` open_id。
- 应用身份返回空不代表目标用户没有在开会，只代表没有找到目标用户与应用机器人同时在会中的会议。
- 返回多个会议时，展示标题、会议号和 `meeting_id` 让用户选择，不按“最近”擅选。
- 用户只给 9 位会议号时，在活跃会议结果中按 `meeting_no` 匹配；匹配失败时不要自动入会。
- `meeting_id` 从哪种身份取得，后续读取事件、发送消息和操作倒计时就沿用哪种身份。

身份可见范围和会议号匹配见 [`lark-vc-meeting-list-active`](lark-meeting-0.md#s-592e95478e6a0276)。

## 读取最新会中事件

```text
lark-cli vc +meeting-events --as <same_identity> --meeting-id <meeting_id> --page-all --format pretty
```

- 默认使用 `--page-all` 获取当前完整事件流，并保留返回的 `page_token` 供下次增量查询。
- 回答“现在、刚刚、最新”或当前会议总结前，重新查询事件；只有用户明确要求基于历史快照时才复用旧结果。
- 默认用 pretty 理解时间线；需要精确结构化字段、文档上下文或转发到 IM 时使用 JSON。
- 不要用会中事件代替已结束会议的参会人快照或会后复盘。

事件类型、分页、会后产物替代路径和错误码见 [`lark-vc-meeting-events`](lark-meeting-0.md#s-0193f3a7e7d4f298)。

## 读取共享内容和文档上下文

按事件中的 `share_id`、`share_doc`、`comment_id`、`element_token` 和 `block_id` 精确关联：

- 读取评论时只查询当前 `comment_id`，不要扫描整篇文档评论。
- 多个共享文档按用户问题选择相关文档；不要用“最近一次共享”替代当前 item 的 `share_id`。
- 只有用户明确要求预览且事件提供受支持的 `element_type` 与 token 时才下载，并显式选择输出路径。
- 关联或读取失败时标记 partial，保留原始标识和 raw payload；不要自动下载或猜测文档类型兜底。

精确事件 schema 和后续命令见 [`lark-vc-meeting-events`](lark-meeting-0.md#s-0193f3a7e7d4f298) 的文档上下文部分。

## 读取当前会议画面

仅当用户的问题必须读取当前会议合成画面中的视觉信息，且结构化内容不足以回答时读取画面。适用任务包括识别投屏中实际显示的网页地址、界面状态或报错，理解图表、幻灯片等依赖版式或图像的信息，以及查看摄像头画面。

事件、字幕、聊天或可直接读取的共享文档已经足够回答时，不要截图；会议内容查询、总结或共享文档定位也不以截图兜底，不要仅因为会议正在进行就读取画面。

需要读取时执行：

```text
lark-cli vc +meeting-screenshot --as <same_identity> --meeting-id <meeting_id>
```

身份、会议 ID、输出文件和失败处理见 [`lark-vc-meeting-screenshot`](lark-meeting-0.md#s-c4eacc3fed2ea93a)。

## 发送会中文本或表情

只有用户明确要求发送并确认目标会议与内容时执行：

```text
lark-cli vc +meeting-message-send --as <same_identity> --meeting-id <meeting_id> --msg-type text --text <message>
```

- 发送沿用 `meeting_id` 的来源身份；不要为了发送自动入会或先查会议详情。
- reaction 使用 Reference 中大小写敏感的完整 emoji key；不要编造 key。
- 发送失败时停止并报告，不自动换身份或重复发送，避免重复可见副作用。
- 用户要发送绑定群或 IM 消息时改用 `lark-im`，不要把会中消息命令当作群消息能力。

文本、reaction 和权限规则见 [`lark-vc-meeting-message-send`](lark-meeting-0.md#s-06c0fec9ab3dcfbf)。

## 操作会中倒计时

只有用户明确要求设置、延长、提前结束或关闭倒计时时执行：

```text
lark-cli vc +meeting-countdown --as <same_identity> --meeting-id <meeting_id> --action set --duration <minutes>
```

- 这是会中可见的写操作；执行前确认目标会议和动作。
- 操作沿用 `meeting_id` 的来源身份；不要为了倒计时自动入会或切换身份。
- 用户只给 9 位会议号时，先用当前身份执行 `+meeting-list-active` 并按 `meeting_no` 匹配。
- `set` 和 `prolong` 需要 `--duration`；提前结束或关闭时不要携带时长、提醒点或结束音频参数。

动作、提醒点和权限规则见 [`lark-vc-meeting-countdown`](lark-meeting-0.md#s-206fbaf6aa28aa3f)。

## 处理未发现会议或权限错误

- 用户身份未发现活跃会议时，可以查询当天最近结束的会议；仍无结果再询问时间、主题或会议号，不自行扩大时间范围。
- 应用身份未发现活跃会议时，只解释当前身份的空结果，不自动查询历史会议或真实入会。
- 用户身份调用活跃会议或事件查询时，普通 scope 缺失按 CLI hint 申请 `vc:meeting.meetingevent:read`；普通 scope 缺失不表示接口不支持用户身份，只有 CLI 明确说明不支持时才切到应用身份流程。
- 应用身份缺少权限时不要执行 `auth login`。优先按 CLI 返回的 `missing_scopes`、`hint` 和 `console_url` 处理；手工判断时按能力配置 scope：应用身份活跃会议查询需要 `vc:meeting.bot.join:write`，会中发消息需要 `vc:meeting.message:write`，会中倒计时需要 `vc:meeting.interaction:write`。随后依次检查应用发布、租户安装和“权限可访问的数据范围”；数据范围应为“按条件筛选”，条件为“会议的归属者 包含 与应用的可用范围一致”。
- scope、安装和数据范围都正确后仍失败时，保留 CLI 返回的错误码和 `log_id`，按服务端权限异常排查；不要反复登录或改用其他身份重试。


<a id="s-f0bd564eb956c3d7"></a>

## scenes/query-meeting-and-artifacts.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 查询会议及其产物

围绕目标会议执行查询：先取得唯一 `meeting_id`，再按用户目标查询参会人、智能纪要、妙记或录制。已有 `note_id` 或 `minute_token` 时从对应产物直接开始，不要绕回会议搜索。

## 定位会议

在决定批量命令和批次大小之前，必须先规范化全部输入标识：

- 恰好 9 位纯数字是 `meeting_no`，即使用户称其为“会议 ID”。
- `meeting_no` 必须先逐个通过 `vc +search --query` 转换为搜索结果中的 `id`。
- `vc +search` 不支持批量会议号；多个 `meeting_no` 按输入顺序逐个解析，也可使用脚本批量转换。

优先复用已有标识，不重复搜索：

| 已有信息 | 操作 |
|---|---|
| `meeting_id` | 直接查询会议或关联产物 |
| `meeting_no` / 9 位会议号 | 用 `vc +search --query "<meeting_no>" --format json --as <source_identity>` 搜索会议，从结果的 `id` 取得 `meeting_id` |
| Calendar `event_id` | 用 `calendar +meeting` 获取 `meeting_id` 和用户绑定的 `meeting_note` |
| `note_id` | 直接进入 [智能纪要场景](lark-meeting-0.md#s-043cc283b03d4c58) |
| `minute_token` / 妙记 URL | 直接进入 [妙记场景](lark-meeting-0.md#s-b4803aa71f203d03)；URL 取路径最后一段并去掉 query 参数 |

没有标识时，用 `vc +search` 搜索已经结束的会议：

```text
lark-cli vc +search --query <query> --start <start> --end <end> --format json --as <source_identity>
```

- 至少提供关键词、时间范围、组织者、参与者或会议室中的一个条件；不要把“总结”“回顾”“所有会议”等动作词当作 `--query`。
- “今天有哪些会议”需要合并两部分：`vc +search` 查询今天已结束的会议， lark-calendar 查询进行中或未开始的日程。
- 只有自然语言纪要标题、没有会议 ID、时间、参会人等会议线索时，改用 Drive/Doc 搜索纪要文档，不要把纪要标题当作会议关键词。
- 根据 `has_more` 和 `page_token` 翻页。未明确要求全量时，累计结果超过 50 条后先确认是否继续；用户明确要求“全部、统计、排序”时直接获取全部结果。
- 多个候选时展示主题、时间、组织者和 `meeting_id`，让用户选择；不要擅自选择最近的一场。

只需要找到会议时，返回唯一 `meeting_id` 后停止。

搜索参数、日期语义和分页细节见 [`lark-vc-search`](lark-meeting-0.md#s-336b0395b2ffd277)。

## 选择查询身份

- `vc +search`、`vc +detail`、`vc +recording`、`vc meeting get` 和 `note +detail` 均支持用户或应用身份。没有既有身份上下文时默认使用用户身份；用户明确要求应用视角或当前链路已经使用应用身份时，使用 `--as bot`。
- 已有 `meeting_id`、`note_id` 或 `minute_token` 时，沿用其来源身份；后续 Minutes、Note、Doc 和 Drive 命令都显式传入同一个 `--as`。不要为查询参会人或绕过权限错误擅自切换身份。
- `note +transcript` 仅支持用户身份。应用身份查到 unified Note 时，先说明限制，只有用户明确同意后才切换身份。

## 获取参会人

查询“谁参加过、何时加入或离开、某人是否参会”时，读取会议的参会人快照：

```text
lark-cli vc meeting get --params '{"meeting_id":"<meeting_id>","with_participants":true}' --as <source_identity>
```

这是服务端快照，不要求应用机器人入会，会议结束后也可以查询。不要用会中事件代替完整参会人快照。

## 获取会议产物标识

使用 `vc +detail` 获取会议关联的 `note_id` 和 `minute_token`：

```text
lark-cli vc +detail --meeting-ids <meeting_id> --as <source_identity>
```

Note 与 Minutes 来自相互独立的 AI 总结和录制链路，可能同时存在、只存在一个或都不存在：

- 用户明确指定“智能纪要”或“妙记”时，沿指定链路处理，不要改道。
- 只存在一类产物时，使用存在的那一类，不要因默认优先级而把缺失的 Note 或 Minutes 当作错误。
- 两者都存在且用户未指定时，优先使用 Note。Note 及其逐字稿会后通常直接对参会人可读；Minutes 包含原始音视频并受独立资源 ACL 控制，往往需要所有者授权或由用户明确申请权限。
- Note 和 Minutes 的总结、待办等 AI 产物可能内容重叠。按上述规则选定一条主链路；除非用户明确要求对照，不要自动拼接、合并或去重两份 AI 产物。
- 用户只要产物标识时，返回取得的 `note_id` / `minute_token` 后停止；需要产物链接时，进入对应下游场景解析，不继续读取正文。
- `meeting_note` 是 Calendar 日程上由用户绑定的 Doc，只能从 `event_id` 经 `calendar +meeting` 获取；它与 AI 智能纪要独立，不要从 `meeting_id` 或 `note_id` 推断。
- 用户询问“有哪些纪要”或“纪要链接”且上下文包含 `event_id` 时，保留 `calendar +meeting` 返回的 `meeting_note`；如存在 `note_id`，进入智能纪要场景取得 `note_doc_token`，再同时返回两者供用户区分选择。

会议详情字段见 [`lark-vc-detail`](lark-meeting-0.md#s-f83a53e7114cecb3)。

## 转交智能纪要场景

取得 `note_id` 后，进入 [基于 note_id 查询智能纪要及关联产物](lark-meeting-0.md#s-043cc283b03d4c58)，并传递 `note_id` 与取得该 ID 时使用的 `source_identity`。`note +detail`、正文与封面读取、`note_display_type` 逐字稿路由、共享文档和 Doc 元信息查询全部以该场景为准，不在本场景重复定义。

## 转交妙记场景

取得 `minute_token` 后，进入 [查询妙记及其产物](lark-meeting-0.md#s-b4803aa71f203d03)，并传递 `minute_token` 与取得该 Token 时使用的 `source_identity`。妙记基础信息、AI 产物、Transcript、媒体下载、关联 Note 和资源权限处理全部以该场景为准，不在本场景重复定义。

如果需要从 `meeting_id` 或 Calendar `event_id` 补查录制，先按 [`vc +recording`](lark-meeting-0.md#s-8d08d39b956adcd3) 取得 `minute_token`，再转入妙记场景。

## 基于会议内容回答或分析

- 用户只要现成的 AI 总结、待办或章节时，直接返回选定链路的对应 AI 产物，不为此额外读取逐字稿。待办通常包含提出人或负责人，章节按话题组织，因此查看待办或会议结构时应优先使用这些结构化 AI 产物。
- 用户要求提炼、重新总结、复盘、争议分析或“谁说了什么”时，读取 Note 逐字稿或 Minutes Transcript 的原始对话并独立分析；禁止把现成 AI 总结重新排版后冒充独立结论。
- Note 和 Minutes 都有原始记录且用户未指定时，优先使用 Note 逐字稿；用户明确说“基于妙记”时使用 Minutes Transcript。
- 如果产物不存在或无权限，如实说明，并保留已经取得的 `meeting_id`、`note_id`、`minute_token` 或文档 token，方便用户继续处理。


<a id="s-b4803aa71f203d03"></a>

## scenes/query-minutes-and-artifacts.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 查询妙记及其产物

围绕目标妙记执行查询：先取得唯一 `minute_token`，再按用户目标查询基础信息、AI 产物、逐字稿、原始媒体或关联的智能纪要。已有会议上下文或 `meeting_id` 时，先从会议链路取得 `minute_token`，不要重复搜索妙记。

## 定位妙记

- 已有 `minute_token` 时直接使用。
- 妙记 URL 的路径最后一段是 `minute_token`；去掉 query 参数。
- 没有 token 时，用标题/关键词、所有者、参与者或时间范围执行搜索：

  ```text
  lark-cli minutes +search --query <query> --start <start> --end <end> --as user
  ```

- `minutes +search` 支持用户身份和应用身份。默认使用用户身份；只有用户明确要求应用视角或上下文已经是应用身份时才使用 `--as bot`。
- `me` 只适用于用户身份；应用身份没有“当前用户”，必须传明确的 `ou_` open_id。应用身份的 token 或 scope 问题不能通过 `auth login` 修复。
- “我参与的妙记”默认是“我拥有”与“我作为参与者”两次查询的并集，具体过滤语义见 [`lark-minutes-search`](lark-meeting-0.md#s-81f252a33d1bf027)。
- 根据 `has_more` 和 `page_token` 翻页。用户未明确要求全量时，累计结果超过 50 条且仍有更多结果再确认是否继续；用户明确要求“全部、所有、统计、排序”时直接获取全部分页，并按结果中的 `token` 去重后再返回或统计。
- 多个候选时展示标题、时间、所有者、URL 和 token，让用户选择，不擅自挑选。

只需要搜索结果时，返回命中项后停止。

一旦用某个身份搜索或解析出 `minute_token`，后续妙记详情、产物读取、媒体下载、权限申请及关联 Note / Doc 查询都必须显式沿用同一个 `--as`。不要依赖 profile 默认身份，也不要为绕过资源权限切换身份。

## 查询基础信息

用户只要标题、时长、封面、所有者或 URL 时，使用基础信息命令：

```text
lark-cli minutes minutes get --params '{"minute_token":"<minute_token>"}' --as <source_identity>
```

基础信息已经满足目标时，不继续读取 AI 产物或逐字稿。命令参数不足时运行 `lark-cli minutes minutes get --help`。

## 获取 AI 产物和逐字稿

使用 `minutes +detail`，只传用户需要的产物 flag：

```text
lark-cli minutes +detail --minute-tokens <minute_token> --summary --todo --chapter --keyword --transcript --as <source_identity>
```

- 可选 `--summary`、`--todo`、`--chapter`、`--keyword`、`--transcript`。
- 不传产物 flag 只返回基础信息和可能存在的顶层 `note_id`。
- 用户只要现成总结、待办或章节时，返回对应 AI 产物。
- 用户要求提炼、重新总结、分析或复盘时，只读取 Transcript 并基于原始发言独立分析；禁止照搬 `--summary`。

产物 flags、返回字段和本地输出见 [`lark-minutes-detail`](lark-meeting-0.md#s-3e1c4a681cc2ae6d)。

## 下载原始音视频

用户需要原始媒体文件或下载链接时，使用 `minutes +download`。同一妙记的下载产物统一归拢到 `./minutes/<minute_token>/`，除非用户指定其他安全相对路径。

媒体类型、路径、链接有效期和权限见 [`lark-minutes-download`](lark-meeting-0.md#s-06b66459939c5346)。

## 获取关联的智能纪要

从 `minutes +detail` 顶层读取 `note_id`，直接执行 `note +detail`：

```text
lark-cli note +detail --note-id <note_id> --as <source_identity>
```

- 不要把 `minute_token` 当作 `note_id`，也不要绕回 VC。
- 顶层没有 `note_id` 表示该妙记没有关联 Note，到此停止。
- 取得 `note_doc_token`、`verbatim_doc_token` 或 `shared_doc_tokens` 后，按智能纪要和 Doc 的规则继续。

## 处理无权限结果

没有查看权限时，说明需要妙记所有者授权；不要自动执行 `minutes +apply-permission`。只有用户明确要求申请查看或编辑权限时，才进入编辑妙记场景发起申请，并沿用触发无权错误时的身份。详见 [`lark-minutes-apply-permission`](lark-meeting-0.md#s-d4c7d9db1161e205)。


<a id="s-043cc283b03d4c58"></a>

## scenes/query-note-and-artifacts.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 基于 note_id 查询智能纪要及关联产物

- 身份：`note +detail` 支持 `--as user` / `--as bot`；`note +transcript` 仅支持 `--as user`。`note_id` 若由某个身份取得（例如 `vc +detail --as bot`），`note +detail` 及后续 Doc、Drive 命令必须显式沿用同一个 `--as`。
- 如果 `note +detail --as bot` 返回 `unified`，不要静默切到 `--as user` 继续。先向用户说明该纪要逐字稿只能以用户身份读取，只有用户明确同意才切换身份重试。

## 从智能纪要 Docx 查询关联链接

当用户提供智能纪要 Docx URL/token，且只需要纪要类型或关联产物链接时，直接执行：

```text
lark-cli docs +fetch --doc "<docx_url_or_token>" --doc-format markdown --as <source_identity>
```

从返回结构中仅提取：

- 输入文档：作为智能纪要主文档，返回用户提供的原始 URL。
- `<vc-transcribe-tab vc-node-id="...">`：可作为明确的 `note_id`。
- 标记为“文字记录”的 Docx URL。
- `/minutes/` 妙记 URL。
- `<cite type="doc" doc-id="..." file-type="...">` 中的共享文档 token。

如果没有从 `<vc-transcribe-tab>` 取得明确的 `note_id`，但存在妙记 URL，从 URL 路径最后一段提取 `minute_token`，再查询妙记基础信息：

```text
lark-cli minutes +detail --minute-tokens "<minute_token>" --as <source_identity>
```

从对应的 `note_id` 继续 Note 查询；该字段为空或未返回时，继续按 Doc 处理。不要把 Doc token 或 `minute_token` 直接传给 Note 命令。

## 确认 note_id

Note 域只接受明确的 `note_id`：

- 用户直接提供的 `note_id`。
- `vc +detail` 从 `meeting_id` 返回的 `note_id`。
- `minutes +detail` 从 `minute_token` 返回的顶层 `note_id`。
- `docs +fetch` 返回的 `<vc-transcribe-tab vc-node-id="...">` 中的 `vc-node-id`。

不要从 Doc token、Docx URL、文档标题、正文或 backlink 反推 `note_id`。只有自然语言纪要标题或 Docx 链接时，先使用 Drive/Doc 搜索或读取文档；没有明确 `vc-node-id` 时继续按 Doc 处理，不进入 Note 查询。如果文档正文明确给出“逐字稿”或“文字记录”的 Docx 链接，将该链接继续作为 Doc 沿用当前身份读取；该链接仍不是 `note_id`。

如果当前只有 `meeting_id`、`minute_token` 或 Calendar `event_id`，先使用会议、妙记或日程场景取得 `note_id`；不要把这些标识直接传给 Note 命令。

## 查询关联产物标识

```text
lark-cli note +detail --note-id <note_id> --as <source_identity>
```

保留以下字段，并按用户目标选择后续操作：

| 字段 | 含义 | 后续操作 |
|---|---|---|
| `note_id` | Note 唯一标识 | 后续 Note 命令继续使用该值 |
| `note_display_type` | `normal` / `unified` / `unknown` | 决定逐字稿入口 |
| `note_doc_token` | AI 智能纪要正文 | 交给 Doc 读取正文，或交给 Drive 查询名称和 URL |
| `verbatim_doc_token` | `normal` 或部分 `unknown` Note 的独立逐字稿 Doc | 仅按下方展示类型规则使用 |
| `shared_doc_tokens` | 会中共享文档列表 | 按用户目标查询元信息或正文 |

用户只需要关联产物标识时，返回上述可用 token 和 `note_display_type` 后停止，不读取文档正文。

## 读取智能纪要正文

用户需要 AI 智能纪要中的总结、待办、章节或正文时，读取 `note_doc_token`：

```text
lark-cli docs +fetch --doc <note_doc_token> --doc-format markdown --as <source_identity>
```

读取正文后，检查返回 Markdown 中的第一个 `<whiteboard token="...">`。该画板是智能纪要封面；存在时提取 token，沿用同一身份下载到 `./notes/<note_id>/cover`，与 `note +transcript` 的逐字稿归入同一 Note 目录，并随正文一起展示：

```text
lark-cli docs +media-download --type whiteboard --token <whiteboard_token> --output ./notes/<note_id>/cover --as <source_identity>
```

没有 `<whiteboard>` 时直接跳过，不视为失败。只有第一个 `<whiteboard>` 按封面处理；不要自动下载正文中的其他画板。

只需要文档名称或 URL 时不要读取正文，使用 Drive 元信息接口：

```text
lark-cli drive metas batch_query --data '{"request_docs":[{"doc_type":"docx","doc_token":"<note_doc_token>"}],"with_url":true}' --as <source_identity>
```

## 读取逐字稿(文字记录)

逐字稿入口由 `note +detail` 返回的 `note_display_type` 决定，不要只根据 `verbatim_doc_token` 是否为空判断：

normal Note 逐字稿是 Doc 读取结果，unified Note 可由 `note +transcript` 保存为 Markdown 或 plain text，Minutes Transcript 则是妙记产物文本。它们都可作为原始发言记录，但序列化格式不是统一契约；应以实际返回内容为准，不要硬编码“发言人 + 相对时间戳”等固定行格式。

### note_display_type = normal 且 有 verbatim_doc_token

```text
lark-cli docs +fetch --doc <verbatim_doc_token> --doc-format markdown --as <source_identity>
```

### note_display_type = unknown 且 有 verbatim_doc_token

```text
lark-cli docs +fetch --doc <verbatim_doc_token> --doc-format markdown --as <source_identity>
```

### note_display_type = unknown 且 无 verbatim_doc_token

停止并说明无法确定逐字稿入口，不要反复重试或猜成 unified

### note_display_type = unified

```text
lark-cli note +transcript --note-id <note_id> --as user
```

`note +transcript` 会自动获取完整分页并保存文件；目标文件已存在时，只有用户明确要求覆盖才添加 `--overwrite`。

## 查询会中共享文档

`shared_doc_tokens` 是该 Note 关联的会中共享文档，不是逐字稿或 `meeting_note`。按用户目标处理：

- 只要文档名称或 URL：使用 `drive metas batch_query`，每批最多查询 10 个 token。
- 需要正文：逐个使用 `docs +fetch --doc <shared_doc_token>`。
- 有多个共享文档时，先返回标题和 URL 让用户选择；用户明确要求全部读取时再逐个读取。
- 某个共享文档不存在或无权限时，保留该 token 并逐项报告，不把整组结果误报为失败。

## 基于纪要内容回答

- 用户只要现成 AI 总结、待办或章节时，读取智能纪要正文并返回对应内容。
- 用户要求提炼、重新总结、复盘、争议分析或“谁说了什么”时，按展示类型读取逐字稿原始内容并独立分析；禁止直接改写 AI 智能纪要作为独立结论。
- 用户只要链接或关联产物清单时，不读取正文或逐字稿。
- `meeting_note` 是 Calendar 日程上用户手工绑定的文档，不属于 Note 的 `shared_doc_tokens`，也不能通过 `note_id` 查询。


<a id="s-f875bf4220831ee1"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# lark-meeting

飞书视频会议业务的统一入口，支持查询会议记录、实时会议互动、管理妙记、阅读智能纪要等操作。本技能负责领域关系、任务路由和跨命令编排。

无需预读 [`lark-shared`]（按模块名读取对应工作流） 或预跑 `auth status --verify`，仅遇到未认证、token / 身份或 scope 错误时读取该 Skill，修复后重试。认证、身份或 scope 管理请求则直接使用该 Skill。

## 身份初始化与延续

把 `source_identity` 作为跨命令工作流的状态：

1. 上下文已有来源身份：严格沿用。用户要求切换时先说明身份连续性和权限影响，不静默切换。
2. 没有来源身份，用户明确指定身份：使用用户指定的 `--as`。
3. 没有来源身份且用户未指定：操作语义明确要求应用机器人时使用 `--as bot`，否则显式使用 `--as user`。

确定 `source_identity` 后，再检查目标命令是否支持该身份：

- 支持：显式传入并继续执行。
- 不支持：说明限制并停止；不要为了让命令成功而替换身份。
- 只有用户明确同意切换身份后，才以新身份重新开始一条工作流。

## 领域模型与概念

```text
[会议来源]

Calendar 日程 (event_id) ──预约或关联──┐
即时会议（无 event_id）────────────────┴──► 会议 (meeting_id)

Calendar 日程 ──meeting_note────────────► Doc（用户纪要，独立于 AI 智能纪要）

[会议产物]

会议 (meeting_id)
├── AI 总结 ──► Note 智能纪要 (note_id)
│               ├── 智能纪要文档 ───────────► Doc (note_doc_token)
│               ├── 逐字稿
│               │   ├── normal  ──────────► Doc (verbatim_doc_token)
│               │   └── unified ──────────► note +transcript（非独立 Doc）
│               └── 共享文档 ──────────────► Doc (shared_doc_tokens)
│
└── 录制 ──► Minutes 妙记 (minute_token)
                 ├── AI 产物：Summary / Todo / Chapter / Keyword
                 ├── Transcript（文字记录，别名：「转写」「逐字稿」「文字记录」）
                 └── 原始音视频

本地音视频 ─────────────────────────────► Minutes 妙记 (minute_token)
```

| 对象 | 主标识 | 概念与关系 |
|---|---|---|
| Calendar 日程 | `event_id` | 日历上的日程，包含时间、参与人、会议室和 RSVP，可预约或关联 VC 会议；不是完整的会议记录。日程上的 `meeting_note` 是用户手工绑定的 Doc，与 AI 智能纪要无关。 |
| Meeting 会议 | `meeting_id` | 实际发生的视频会议，可以来自 Calendar，也可以是没有日程的即时会议。会议主题、时间、参会人快照和会中事件属于会议数据；Note 与 Minutes 是它可能关联的会后产物。 |
| Note 智能纪要 | `note_id` | 开启 AI 总结后形成的逻辑产物集合。`note_display_type` 决定获取逐字稿中文字记录的不同方式。 |
| Minutes 妙记 | `minute_token` | 由会议录制或本地音视频上传生成，包含总结、待办、章节、关键词、文字记录(别名：「转写」「逐字稿」「文字记录」)和原始音视频；可以关联 VC 会议，也可以独立存在。 |
| Doc 文档 | Doc token | 内容载体，不是会议标识。`note_doc_token`、`shared_doc_tokens` 和部分 `verbatim_doc_token` 指向 Doc；Doc token 不能当作 `note_id` 或 `meeting_id`。 |

### 核心标识

- `meeting_id`：会议 ID。长数字字符串，不是 9 位会议号。
- `meeting_no`：会议号。9 位纯数字；CLI 参数名为 `--meeting-number`。
- `minute_token`：妙记 Token。小写字母数字串，通常取自妙记 URL `/minutes/<minute_token>`。

以上标识均按字符串原样传递，不能相互替代。

### 领域不变量

- Note 与 Minutes 分别来自 AI 总结和录制两条独立链路。一场会议可能同时有两类产物、只有其中一类，也可能都没有；不能根据 `note_id` 推断必然存在 `minute_token`，反之亦然。
- Minutes 可以由本地音视频直接生成，因此不一定关联 `meeting_id` 或 Calendar `event_id`。
- Calendar `meeting_note`、Note `note_id`、Minutes `minute_token` 和各类 Doc token 标识不同对象，不能互换、代入其他域的命令或从一者反推另一者。

## 快速行动

### 查询进行中的会议内容

```text
# 当前用户所在会议
lark-cli vc +meeting-list-active --as user

# 应用机器人可见的目标用户会议
lark-cli vc +meeting-list-active --as bot --user-id <open_id>

# 确定唯一 meeting_id 后沿用来源身份
lark-cli vc +meeting-events --as <source_identity> --meeting-id <meeting_id> --page-all --format pretty
```

同时有多场会议时，需要先选择要查询的会议；只有一场会议时，直接查询该场会议的会议事件。

应用身份只返回“目标用户正在参会、且应用机器人也在同一会议中”的会议；返回空不代表目标用户没有在开会。向用户说明结果时使用“用户身份”或“应用身份”，不要暴露 `user` / `bot` 这类内部缩写。

## 场景手册

当任务目标与场景匹配时，阅读对应的场景手册，按流程执行任务。

- [查询会议及其产物](lark-meeting-0.md#s-f0bd564eb956c3d7)：按主题、时间、参会人或 `meeting_id` / `meeting_no` / `event_id` 定位历史会议；查询参会人、录像和会议关联的智能纪要或妙记；基于会议记录总结或复盘。
- [查询妙记及其产物](lark-meeting-0.md#s-b4803aa71f203d03)：已有妙记 URL / `minute_token`，或按标题、所有者、参与者搜索妙记；读取总结、待办、章节、关键词、逐字稿，下载原始音视频，或查询关联智能纪要。
- [生成和修改妙记、管理妙记权限](lark-meeting-0.md#s-2b52e88c32b7298d)：将本地音视频生成妙记、逐字稿、总结、待办或章节；修改妙记标题、总结、待办、关键词或说话人；申请妙记权限，或查看、分配妙记协作者权限。
- [查询智能纪要及关联产物](lark-meeting-0.md#s-043cc283b03d4c58)：已有 `note_id`、智能纪要 Docx URL/token，或需要查询纪要正文、逐字稿、妙记和共享文档等关联产物。
- [应用机器人参会与会中互动](lark-meeting-0.md#s-007bc536dd114079)：完整编排应用机器人的活跃会议发现、发起或加入、邀请、事件拉取、会议截图、文本/表情/倒计时互动、结束会议和明确授权后的离会。
- [会中事件与会中互动](lark-meeting-0.md#s-a4ae76e5c00fb3af)：在不触发新的入会/离会操作时，使用用户身份或已在会中的应用身份查询活跃会议、查看发言/聊天/共享内容、按需读取当前会议画面，或发送文本/表情、操作倒计时。

## 命令参考

| 命令 | 用途 | 参考方式 |
|---|---|---|
| `vc +search` | 搜索历史会议 | [lark-vc-search](lark-meeting-0.md#s-336b0395b2ffd277) |
| `vc +detail` | 查询会议信息及关联的 Note、Minutes 标识 | [lark-vc-detail](lark-meeting-0.md#s-f83a53e7114cecb3) |
| `vc meeting get` | 查询会议基础信息和参会人快照 | `lark-cli vc meeting get --help` |
| `vc +recording` | 从会议定位录制及妙记 | [lark-vc-recording](lark-meeting-0.md#s-8d08d39b956adcd3) |
| `vc +meeting-list-active` | 发现当前可见的进行中会议 | [lark-vc-meeting-list-active](lark-meeting-0.md#s-592e95478e6a0276) |
| `vc +meeting-events` | 读取会中事件和共享内容 | [lark-vc-meeting-events](lark-meeting-0.md#s-0193f3a7e7d4f298) |
| `vc +meeting-message-send` | 发送会中文本消息或表情 | [lark-vc-meeting-message-send](lark-meeting-0.md#s-06c0fec9ab3dcfbf) |
| `vc +meeting-screenshot` | 获取视频会议截图 | [lark-vc-meeting-screenshot](lark-meeting-0.md#s-c4eacc3fed2ea93a) |
| `vc +meeting-countdown` | 设置、延长、提前结束或关闭会中倒计时 | [lark-vc-meeting-countdown](lark-meeting-0.md#s-206fbaf6aa28aa3f) |
| `vc +meeting-join` | 让应用机器人加入会议 | [lark-vc-agent-meeting-join](lark-meeting-0.md#s-1ce454738383dec1) |
| `vc +meeting-invite` | 以应用机器人邀请指定用户或全部合格日程参会人 | [lark-vc-agent-meeting-invite](lark-meeting-0.md#s-92614d068beec283) |
| `vc +meeting-end` | 让当前 Host 应用机器人结束会议 | [lark-vc-agent-meeting-end](lark-meeting-0.md#s-021163033cf31c99) |
| `vc +meeting-leave` | 让应用机器人离开会议 | [lark-vc-agent-meeting-leave](lark-meeting-0.md#s-384f08d6b9592cc5) |
| `minutes +search` | 搜索妙记 | [lark-minutes-search](lark-meeting-0.md#s-81f252a33d1bf027) |
| `minutes minutes get` | 查询妙记基础信息 | `lark-cli minutes minutes get --help` |
| `minutes +detail` | 读取妙记信息和指定产物 | [lark-minutes-detail](lark-meeting-0.md#s-3e1c4a681cc2ae6d) |
| `minutes +download` | 下载妙记原始音视频 | [lark-minutes-download](lark-meeting-0.md#s-06b66459939c5346) |
| `minutes +upload` | 从云空间音视频生成妙记 | [lark-minutes-upload](lark-meeting-0.md#s-08c8ebf5c8321239) |
| `minutes +update` | 修改妙记标题 | [lark-minutes-update](lark-meeting-0.md#s-0791096865f48330) |
| `minutes +speaker-replace` | 替换妙记逐字稿说话人 | [lark-minutes-speaker-replace](lark-meeting-0.md#s-45f8b0d7733efe34) |
| `minutes +summary` | 替换妙记 AI 总结 | [lark-minutes-summary](lark-meeting-0.md#s-860055b8893752bd) |
| `minutes +todo` | 增删改妙记 AI 待办 | [lark-minutes-todo](lark-meeting-0.md#s-4eda03852c02682a) |
| `minutes +apply-permission` | 申请妙记查看或编辑权限 | [lark-minutes-apply-permission](lark-meeting-0.md#s-d4c7d9db1161e205) |
| `drive +member-list` | 查看妙记协作者及其权限 | [lark-drive-member-list]（按模块名读取对应工作流） |
| `drive +member-add` | 给指定成员分配妙记查看或编辑权限 | [lark-drive-member-add]（按模块名读取对应工作流） |
| `minutes +word-replace` | 批量替换妙记逐字稿关键词 | `lark-cli minutes +word-replace --help` |
| `note +detail` | 查询智能纪要及关联文档标识 | [lark-note-detail](lark-meeting-0.md#s-70f05555aba6167f) |
| `note +transcript` | 获取 unified 智能纪要逐字稿 | [lark-note-transcript](lark-meeting-0.md#s-f44d5fe4bf8bfb52) |

## 渐进加载规则

按“快速行动 → 场景手册 → 命令参考”渐进加载：

1. 用户目标符合“快速行动”的进入条件时，直接执行对应 CLI；不要预读场景手册、命令参考、`--help` 或 schema。
2. 不符合快速行动条件，或缺少关键标识、需要消歧、涉及写操作时，读取与目标匹配的一个主场景手册；主场景明确转交到下游场景时，只继续读取被引用的场景或章节，并按其中流程执行 CLI。
3. 仅当缺少具体参数、返回字段、特殊约束或异常处理方式时：有参考手册的命令读取对应文件；没有参考手册的命令运行表中列出的精确 `lark-cli ... --help`。场景或 reference 已给出精确命令时，不再调用 `--help`；仅在参数缺失、命令不识别或文档与运行结果冲突时调用。
