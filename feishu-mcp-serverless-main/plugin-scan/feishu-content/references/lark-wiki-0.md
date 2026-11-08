<a id="s-384c23a567152824"></a>

## SKILL.md


# wiki

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 明确 space_id、node_token 和底层 obj_token；三者不可互换。先查节点和空间再确定目标父节点。

2. 节点移动、复制和成员管理各自查看 schema；个人知识库 library 与 Drive 根目录不同，不能将一个当成另一个。

3. 对正文请求从 getNode 解析 obj_type 后路由到文档、多维表格或电子表格；返回来源链接。列表按 page_token 读完，权限失败不视为空空间。

## 按需参考

- [工具与合同](lark-wiki-0.md#s-57561fbc35c449a0)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-wiki-0.md#s-ac3c3326e0d275ac)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-34320fa7440ad9af"></a>

## references/lark-wiki-delete-space.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# wiki +delete-space

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

删除一个飞书知识空间（知识库）。OpenAPI 对应 `DELETE /open-apis/wiki/v2/spaces/:space_id`。

- **不可逆**：该操作会将知识空间连同其下所有节点彻底删除，执行前必须反复确认
- **同步 / 异步两种返回**：
  - 如果接口直接返回空 `task_id`，说明删除同步完成，shortcut 立即返回 `ready=true`
  - 如果接口返回非空 `task_id`，shortcut 会先对任务做有限轮询；轮询窗口内仍未完成会输出 `next_command`，引导调用方使用 `lark-cli drive +task_result --scenario wiki_delete_space --task-id <TASK_ID>` 继续查

## 命令

```text
# 同步或异步删除一个知识空间（必须显式加 --yes 确认）
lark-cli wiki +delete-space \
  --space-id <SPACE_ID> \
  --yes

# 预览底层调用链（不会真的删除）
lark-cli wiki +delete-space \
  --space-id <SPACE_ID> \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--space-id` | 是 | 要删除的知识空间 ID |
| `--yes` | 是（真删时） | 高风险写操作确认。不传则 CLI 直接返回 `unsafe_operation_blocked` 错误 |

## 行为说明

- **请求**：对 `/open-apis/wiki/v2/spaces/{space_id}` 发送 `DELETE`
- **同步返回**：响应 `data.task_id` 为空字符串时直接返回 `ready=true`、`failed=false`、`status_msg="success"`
- **异步返回**：响应 `data.task_id` 非空时进入有限轮询
- **任务轮询**：调用 `GET /open-apis/wiki/v2/tasks/{task_id}?task_type=delete_space`，读取 `data.task.delete_space_result.status`
  - `status=success` → `ready=true`
  - `status=failure` / `status=failed` → 返回错误（`wiki delete-space task failed: <status_msg 或 status>`）
  - 其他值（如 `processing`、`running`）→ 视为进行中，继续轮询
- **有限轮询窗口**：固定最多轮询 `30` 次，每次间隔 `2` 秒
- **轮询超时不是失败**：如果窗口结束任务仍在处理中，会返回 `task_id`、`status`、`status_msg`、`ready=false`、`timed_out=true`、`next_command`
- **继续查询**：看到 `next_command` 后，改用 `lark-cli drive +task_result --scenario wiki_delete_space --task-id <TASK_ID>` 继续查
- **轮询请求全部失败时直接报错**：如果任务已创建，但后续每一次状态查询都失败，shortcut 会返回带 hint 的错误，并给出继续查询命令

## 返回结果

### 同步删除

```json
{
  "space_id": "7629741305993170448",
  "ready": true,
  "failed": false,
  "status": "success",
  "status_msg": "success"
}
```

### 异步删除完成

```json
{
  "space_id": "7629741305993170448",
  "task_id": "7631425120875056669-965458aec67417f5982250806c97950697ccb82f",
  "ready": true,
  "failed": false,
  "status": "success",
  "status_msg": "success"
}
```

### 异步轮询超时

```json
{
  "space_id": "7629741305993170448",
  "task_id": "7631425120875056669-965458aec67417f5982250806c97950697ccb82f",
  "ready": false,
  "failed": false,
  "status": "processing",
  "status_msg": "processing",
  "timed_out": true,
  "next_command": "lark-cli drive +task_result --scenario wiki_delete_space --task-id 7631425120875056669-965458aec67417f5982250806c97950697ccb82f --as user"
}
```

**输出字段说明：**

- `space_id`：入参的知识空间 ID
- `ready`：任务是否已经完成
- `failed`：任务是否已失败（显式返回 `failure` / `failed` 时为 `true`）
- `task_id`：异步任务 ID，仅异步场景返回
- `status` / `status_msg`：异步任务的原始状态和可读标签
- `timed_out`、`next_command`：轮询窗口内未完成时返回

## dry-run 编排

dry-run 会展示两步调用链：

1. `DELETE /open-apis/wiki/v2/spaces/{space_id}`
2. `GET /open-apis/wiki/v2/tasks/{task_id}?task_type=delete_space`（仅异步时真实发生）

## 权限说明

当前 shortcut 声明的权限为 `wiki:space:write_only` 和 `wiki:space:read`。前者用于发起删除请求，后者用于轮询同一命令内的异步任务状态；如果本地 token 缺失任一权限，CLI 会直接提示重新执行 `lark-cli auth login --scope "wiki:space:write_only wiki:space:read"`。

异步超时后的 `lark-cli drive +task_result --scenario wiki_delete_space --task-id <TASK_ID>` 只需 `wiki:space:read`（纯读任务状态）。

## 空间解析：如何拿到 `space_id`

`wiki +delete-space` 只接受 `--space-id` 作为目标。用户在对话里常常只说知识库的**名称**或贴一条**知识库 URL**，这时**不能**把名称 / URL 原样当成 `space_id` 传进去，必须先解析。三种输入路径：

### 1. 已经有 `space_id`
直接用，无需解析。

### 2. 只有知识库 URL（`.../wiki/<token>`）

先确定后续 `wiki +delete-space` 使用的身份：默认使用 `user`；用户明确要求应用 / bot 视角时使用 `bot`。下面展示默认 user 身份；下游使用 bot 时将两步都改为 `--as bot`。节点解析和删除必须使用相同身份。

```text
lark-cli wiki +node-get \
  --node-token '<wiki_url>' \
  --as user \
  --format json
```

读取 `data.space_id`。

### 3. 只有知识库名称

调用 `wiki spaces list`：

```text
# 第一页
lark-cli wiki spaces list --format json

# 如果需要继续翻页（看下方停止条件），带上 page_token
lark-cli wiki spaces list --params '{"page_token":"<上一页返回的 page_token>"}' --format json
```

#### 翻页与匹配策略

**边翻边匹配**：每拿一页就在已累计的 items 上对 `name` 做精确匹配（区分大小写、保留空格），满足任一条件即停止翻页：

- (A) **累计精确匹配 ≥ 1 条** → 停止翻页，已找到目标
- (B) **`has_more=false`**（已翻完所有页）→ 停止翻页

结束后：

1. 如果累计精确匹配 ≥ 1：把**所有**精确匹配作为候选列给用户
2. 如果精确匹配 = 0（此时必然已走到 `has_more=false`，已收集全量 items）：在全量 items 上做**宽松匹配**（`name` trim 空格 + 大小写不敏感 + 子串包含），作为候选
3. 宽松匹配也 0 条：停下来问用户是不是名字拼错、或者调用方没权限看到这个空间；**不要**自己改名字重试

> 不做更激进的归一化（比如去括号、去版本号尾缀），那些容易把 "客户台账（归档）" 误命中到 "客户台账"。

#### 早停的小边界

早停（条件 A）意味着**可能漏掉**位于更后面页的同名空间。这种重名 corner case 由下面的"用户确认"兜底：LLM 展示候选时应照抄 `name + space_id`，用户如果觉得不是自己想删的那一个，可以要求继续翻页。

#### 确认流程（硬约束）

**无论精确还是模糊，无论命中 1 条还是多条，发起删除前都必须先把候选列给用户**，由用户明确回选一个 `space_id`。不要因为"只命中一条"就跳过确认直接删。

列候选时至少包含以下字段，方便用户分辨：

- `name`（原始值，不做归一化）
- `space_id`
- `space_type`（`team` / `person` 等）
- `description`（若有）
- `visibility`（若有）

示例话术：

```text
根据 "客户台账" 找到以下候选：
  1) name="客户台账", space_id=7629...0448, space_type=team, description="销售部"
  2) name="客户台账（归档）", space_id=7629...0449, space_type=team, description="2023 以前"
请回复序号或 space_id 确认要删除的那一个；如果都不是请说明。
```

命中 0 条：停下来问用户是名称拼错了、还是调用方无权限看到这个空间；**不要**自动尝试改名字再查一次。

#### 执行删除

用户明确选定 `space_id` 后：

```text
lark-cli wiki +delete-space --space-id <RESOLVED_SPACE_ID> --yes
```

> [!IMPORTANT]
> 删库不可逆。关键不变量：**发给服务端的 `--space-id` 必须是用户在上一轮对话里明确指认过的那一个**，不是 LLM 单方面"从匹配结果自动选"。

## 风险等级

- Risk：**`high-risk-write`**
- 框架会强制要求 `--yes` 确认；不传 `--yes` 时命令会直接返回 `unsafe_operation_blocked` 错误，不会真的发请求

> [!CAUTION]
> `wiki +delete-space` 是**不可逆的写入操作**。执行前务必与用户再次确认 `--space-id`，并清楚该空间下的所有节点都会一并被删除。

## 参考

- [lark-wiki](lark-wiki-0.md#s-384c23a567152824) -- 知识库全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数
- [drive +task_result](lark-drive-0.md#s-27c169d1426c6d1e) -- 异步任务的续跑查询命令


<a id="s-5104188d1f7b4e0a"></a>

## references/lark-wiki-member-add.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +member-add

Add a member to a wiki space. OpenAPI: `POST /open-apis/wiki/v2/spaces/:space_id/members`. Shortcut over the raw `wiki members create` — adds enum hints, optional `--need-notification`, `my_library` resolution, and a flattened single-member output envelope.

> The underlying `members.create` API is flagged `danger: true` in the schema browser, but adding a member is **not** confirmation-gated (no `--yes`). To revert, call [`+member-remove`](lark-wiki-0.md#s-ab1175a967ac2ff8) with the same `(member_id, member_type, member_role)` tuple.

## Usage

```text
# Add a user as a regular member
lark-cli wiki +member-add \
  --space-id <space_id> \
  --member-id <open_id|email|user_id|app_id|...> \
  --member-type <openid|email|userid|unionid|openchat|opendepartmentid|appid> \
  --member-role <admin|member> \
  [--need-notification] \
  [--as user|bot]

# Personal library (resolves my_library to the per-user real space first)
lark-cli wiki +member-add \
  --space-id my_library \
  --member-id ou_xxx --member-type openid --member-role member \
  --as user

# Preview the call chain without writing
lark-cli wiki +member-add \
  --space-id <space_id> --member-id <id> --member-type openid --member-role admin \
  --dry-run
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--space-id` | string | **Yes** | — | Wiki space ID; use `my_library` for the personal document library (user only) |
| `--member-id` | string | **Yes** | — | Member ID; interpretation is decided by `--member-type` |
| `--member-type` | enum | **Yes** | — | `openchat` / `userid` / `email` / `opendepartmentid` / `openid` / `unionid` / `appid` |
| `--member-role` | enum | **Yes** | — | `admin` (full space administration) / `member` (collaborator) |
| `--need-notification` | bool | No | unset | Send an in-app notification after the grant. **Omitting the flag sends no `need_notification` query at all** — passing `--need-notification=false` is the explicit opt-out |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

## Output

```json
{
  "space_id": "7160145948494381236",
  "member_id": "example_id",
  "member_type": "openid",
  "member_role": "admin",
  "type": "user"
}
```

`type` is a read-only enum (`user` / `chat` / `department`) the server attaches; absent when the API omits it.

## Notes

- **Bot + `my_library` is rejected upfront** — `my_library` is a per-user alias with no meaning for a tenant token. Pass an explicit `--space-id` when `--as bot`.
- **Bot + `opendepartmentid` is a known unsupported path on the backend.** The CLI does not pre-block it (the API may evolve), but the call will fail. Use `--as user` for department adds.
- **App member uses `--member-type=appid`.** The corresponding `--member-id` is the app ID, commonly formatted as `cli_xxx`.
- Resolve `--member-id` **before** calling: `lark-cli contact +search-user` for users, `lark-cli im +chat-search` for groups, `lark-cli api POST /open-apis/contact/v3/departments/search` for departments. Do not call `+member-add` first and reverse-engineer the type from the error.
- The role switch (`admin` ⇄ `member`) is not a single update — call [`+member-remove`](lark-wiki-0.md#s-ab1175a967ac2ff8) for the old role first, then `+member-add` with the new one.
- `--dry-run` previews 2 steps when `--space-id my_library` (resolve → add), 1 step otherwise.

## Required Scope

`wiki:member:create`


<a id="s-b2f85463036189d2"></a>

## references/lark-wiki-member-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +member-list

List the members of a wiki space. OpenAPI: `GET /open-apis/wiki/v2/spaces/:space_id/members`. **Default fetches a single page** (matches `+space-list` / `+node-list`); pass `--page-all` to walk every page.

## Usage

```text
# Default: single page
lark-cli wiki +member-list --space-id <space_id>

# Walk every page (capped by --page-limit, default 10)
lark-cli wiki +member-list --space-id <space_id> --page-all

# Walk every page, no cap
lark-cli wiki +member-list --space-id <space_id> --page-all --page-limit 0

# Resume from a specific cursor (single-page fetch regardless of --page-all)
lark-cli wiki +member-list --space-id <space_id> --page-token <TOKEN>

# Personal library
lark-cli wiki +member-list --space-id my_library --as user

# Pretty / table / csv / ndjson output
lark-cli wiki +member-list --space-id <space_id> --format pretty
lark-cli wiki +member-list --space-id <space_id> --format table
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--space-id` | string | **Yes** | — | Wiki space ID; use `my_library` for the personal document library (user only) |
| `--page-size` | int | No | 50 | Page size, 1-50 |
| `--page-token` | string | No | — | Page cursor; implies single-page fetch (no auto-pagination) |
| `--page-all` | bool | No | `false` | Automatically paginate through all pages (capped by `--page-limit`) |
| `--page-limit` | int | No | 10 | Max pages with `--page-all` (0 = unlimited) |
| `--format` | enum | No | `json` | `json` / `pretty` / `table` / `csv` / `ndjson` |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

## Output

```json
{
  "ok": true,
  "data": {
    "space_id": "7160145948494381236",
    "members": [
      {
        "member_id": "example_id",
        "member_type": "openid",
        "member_role": "admin"
      },
      {
        "member_id": "example_id",
        "member_type": "openid",
        "member_role": "member"
      }
    ],
    "has_more": false,
    "page_token": ""
  },
  "meta": { "count": 2 }
}
```

`type` (`user` / `chat` / `department`) is included when the server returns it. When the default single-page fetch (or `--page-all` capped by `--page-limit`) does not exhaust the upstream cursor, `has_more=true` and `page_token=<cursor>` so the caller can resume.

## Notes

- **Bot + `my_library` is rejected upfront** — pass an explicit `--space-id` when `--as bot`.
- Use `member_id` from the output as `--member-id` for [`+member-remove`](lark-wiki-0.md#s-ab1175a967ac2ff8); `member_type` and `member_role` must be passed exactly as listed to remove a grant.
- `--dry-run` previews 2 steps when `--space-id my_library` (resolve → list), 1 step otherwise.

## Required Scope

`wiki:member:retrieve`


<a id="s-ab1175a967ac2ff8"></a>

## references/lark-wiki-member-remove.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +member-remove

Remove a member from a wiki space. OpenAPI: `DELETE /open-apis/wiki/v2/spaces/:space_id/members/:member_id`. Unlike most DELETEs, this endpoint **requires a body** carrying `member_type` and `member_role` — the `:member_id` path segment alone is ambiguous without both.

> The underlying `members.delete` API is flagged `danger: true` in the schema browser, but the operation is recoverable — call [`+member-add`](lark-wiki-0.md#s-5104188d1f7b4e0a) with the same `(member_id, member_type, member_role)` to restore. No `--yes` gate.

## Usage

```text
lark-cli wiki +member-remove \
  --space-id <space_id> \
  --member-id <open_id|email|user_id|app_id|...> \
  --member-type <openid|email|userid|unionid|openchat|opendepartmentid|appid> \
  --member-role <admin|member> \
  [--as user|bot]

# Personal library (resolves my_library first)
lark-cli wiki +member-remove \
  --space-id my_library \
  --member-id ou_xxx --member-type openid --member-role member \
  --as user

# Preview the call chain without deleting
lark-cli wiki +member-remove \
  --space-id <id> --member-id <id> --member-type openid --member-role admin \
  --dry-run
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--space-id` | string | **Yes** | — | Wiki space ID; use `my_library` for the personal document library (user only) |
| `--member-id` | string | **Yes** | — | Member ID; interpretation is decided by `--member-type` |
| `--member-type` | enum | **Yes** | — | Must **match the original grant**: `openchat` / `userid` / `email` / `opendepartmentid` / `openid` / `unionid` / `appid` |
| `--member-role` | enum | **Yes** | — | Must **match the original grant**: `admin` / `member` |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

## Output

```json
{
  "space_id": "7160145948494381236",
  "member_id": "example_id",
  "member_type": "openid",
  "member_role": "admin"
}
```

If the API ever omits the member echo, the CLI falls back to surfacing the caller-supplied `(member_id, member_type, member_role)` so scripts still see what was removed.

## Notes

- **`--member-type` and `--member-role` must match the original grant.** Revoking a non-existent `(member_id, type, role)` tuple is a no-op error from the API. If you do not know the current role, run [`+member-list`](lark-wiki-0.md#s-b2f85463036189d2) first.
- **Role switch is not a single update.** To move someone between `admin` and `member`, call `+member-remove` with the old role first, then [`+member-add`](lark-wiki-0.md#s-5104188d1f7b4e0a) with the new one.
- **Bot + `my_library` is rejected upfront.** Pass an explicit `--space-id` when `--as bot`.
- `--dry-run` previews 2 steps when `--space-id my_library` (resolve → delete), 1 step otherwise.

## Required Scope

`wiki:member:update`


<a id="s-9aa6007c9609b1f7"></a>

## references/lark-wiki-move-to-drive.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# wiki +move-to-drive

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

将已有 Wiki 节点移出知识库，并放到指定 Drive 文件夹；省略目标文件夹时放到当前调用身份的“我的空间”根目录。该操作始终创建异步任务，shortcut 会自动有限轮询。

## 何时使用

| 源对象 | 目标位置 | 命令 |
|--------|----------|------|
| Wiki 节点 | Wiki 空间或 Wiki 父节点 | `wiki +move` |
| Drive 文档 | Wiki 空间或 Wiki 父节点 | `wiki +move` |
| Wiki 节点 | Drive 文件夹或“我的空间”根目录 | `wiki +move-to-drive` |
| Drive 文件 / 文件夹 | Drive 文件夹或根目录 | `drive +move` |

`--node-token` 必须是 Wiki 节点 token，不是底层文档的 `obj_token`。无法判断时，先执行 `wiki +node-get --node-token <URL_OR_TOKEN>`。

## 命令

```text
# 移到指定 Drive 文件夹
lark-cli wiki +move-to-drive \
  --node-token <WIKI_NODE_TOKEN> \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --as user

# 移到当前调用身份的“我的空间”根目录
lark-cli wiki +move-to-drive \
  --node-token <WIKI_NODE_TOKEN> \
  --as user

# 预览提交任务和轮询任务两步请求
lark-cli wiki +move-to-drive \
  --node-token <WIKI_NODE_TOKEN> \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--node-token` | 是 | 要移出知识库的 Wiki 节点 token |
| `--folder-token` | 否 | 目标 Drive 文件夹 token；省略时移动到当前调用身份的“我的空间”根目录 |

## 异步协议与续跑

shortcut 会按以下协议执行：

1. `POST /open-apis/wiki/v2/nodes/{node_token}/move_wiki_to_docs`，取得完整、不可拆分的 `task_id`。
2. `GET /open-apis/wiki/v2/tasks/{task_id}?task_type=move_wiki_to_docs`。
3. 读取 `data.task.move_wiki_to_docs_result`：`status=1` 表示处理中，`status=0` 表示成功，`status=-1` 表示失败。

任务查询必须使用 `task_type=move_wiki_to_docs`、`move_wiki_to_docs_result` 和数值状态；不要回退到其他 task type、result 字段或字符串状态。

- 最多轮询 30 次，每次间隔 2 秒。
- 轮询窗口内成功时返回 `ready=true`，并尽可能返回 `obj_token`、`obj_type` 和 `url`。
- 仍在处理中时返回 `ready=false`、`timed_out=true`、完整 `task_id` 和 `next_command`；超时不代表任务失败。
- 任务进入失败态时返回结构化错误。
- `task_id` 是服务端签名的 opaque ID，可能包含多个连字符；必须原样保存，不能自行切分。
- 续跑必须保持和初始移动相同的 `--profile` 与 `--as user|bot` 身份，否则可能收到权限错误；shortcut 返回的 `next_command` 会保留两者。

手动续跑命令：

```text
lark-cli drive +task_result \
  --scenario wiki_move_to_drive \
  --task-id <COMPLETE_TASK_ID> \
  --as user
```

## 典型返回

成功：

```json
{
  "node_token": "wikcnXXX",
  "folder_token": "fldcnXXX",
  "task_id": "<OPAQUE_TASK_ID>",
  "ready": true,
  "failed": false,
  "status": 0,
  "status_msg": "success",
  "obj_token": "doxcnXXX",
  "obj_type": "docx",
  "url": "https://example.feishu.cn/docx/doxcnXXX"
}
```

轮询窗口超时：

```json
{
  "node_token": "wikcnXXX",
  "folder_token": "",
  "task_id": "<OPAQUE_TASK_ID>",
  "ready": false,
  "failed": false,
  "status": 1,
  "status_msg": "processing",
  "timed_out": true,
  "next_command": "lark-cli drive +task_result --scenario wiki_move_to_drive --task-id <OPAQUE_TASK_ID> --as user"
}
```

## 权限与影响

- CLI 写操作预检查使用 `space:document:move`，任务轮询使用 `wiki:space:read`。
- 调用方必须能移动源 Wiki 节点并写入目标 Drive 文件夹。
- 成功后源节点会从 Wiki 树中消失，目标文档改用 Drive 目标位置的权限模型；原 Wiki 层级继承权限不再保留。
- 省略 `--folder-token` 时，“根目录”属于当前 `--as` 身份，user 与 bot 的可见资源范围可能不同。

> [!CAUTION]
> 这是会改变文档归属和权限继承的**写入操作**。执行前必须确认源 Wiki 节点、目标 Drive 位置和调用身份。

## 参考

- [lark-wiki](lark-wiki-0.md#s-384c23a567152824) -- 知识库全部命令
- [wiki +move](lark-wiki-0.md#s-c6dffcf181e680d0) -- Wiki 内移动与 Drive 文档迁入 Wiki
- [drive +task_result](lark-drive-0.md#s-27c169d1426c6d1e) -- 超时后的任务续跑
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-c6dffcf181e680d0"></a>

## references/lark-wiki-move.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# wiki +move

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

在飞书知识库中移动已有 Wiki 节点，或将 Drive 文档迁入 Wiki。这个 shortcut 统一封装了两类流程：

- `node` 模式：移动已有 Wiki 节点，可同空间移动，也可跨空间移动
- `docs_to_wiki` 模式：把 Drive 文档迁入目标知识空间；必要时可提交移动申请，并在异步任务场景下自动有限轮询

当 `docs_to_wiki` 返回 `task_id` 时，shortcut 会先轮询一小段时间；如果轮询窗口内仍未完成，会返回 `next_command`，让调用方继续执行 `lark-cli drive +task_result --scenario wiki_move --task-id <TASK_ID>`。

## 与 `wiki +move-to-drive` / `drive +move` 的区别

- `wiki +move` 的目标是 **知识空间或 Wiki 父节点**，使用 `--target-space-id` / `--target-parent-token`
- `wiki +move-to-drive` 把 **已有 Wiki 节点移出知识库，放入 Drive 文件夹或“我的空间”根目录**，使用 `--folder-token`
- `drive +move` 的目标是 **Drive 文件夹**，使用 `--folder-token`
- 如果源对象已经是 Wiki 节点：目标仍是 Wiki 时使用 `wiki +move`；目标是 Drive 文件夹或根目录时使用 `wiki +move-to-drive`
- 如果源对象还是 Drive 文档，但用户要“迁入知识库”“挂到某个 Wiki 页面下”，也应使用 `wiki +move`
- 如果用户只是想整理云空间（云盘/云存储）文件夹，把文件/文件夹挪到另一个 Drive 文件夹，应使用 `drive +move`

## 口语目标识别

- 当用户说“移动到某个知识库”“挂到某个页面下”“迁入 Wiki”时，按 **Wiki 目标** 处理，优先使用 `wiki +move`
- 当用户说“移动到某个文件夹”“移动到云空间（云盘/云存储）根目录”时，按 **Drive 文件夹目标** 处理；源对象是 Wiki 节点时使用 `wiki +move-to-drive`，源对象已在 Drive 时使用 `drive +move`
- 当用户说“移动到我的文档库”“移动到我的知识库”“放到个人知识库”时，应先按 **Wiki 个人知识库目标** 理解，而不是直接退化成 `drive +move`
- 遇到“我的文档库”这类表述时，可以把它理解成：先用 `my_library` 去查询用户个人知识库，再拿到真实 `space_id`
- 推荐做法是先执行 `lark-cli wiki spaces get --params '{"space_id":"my_library"}'`，取回真实知识库 `space_id`，再把这个 `space_id` 用到 `wiki +move`
- 当前 `wiki +move` 文档的主示例仍以显式 `--target-space-id` / `--target-parent-token` 为主；如果调用方只有自然语言目标，不要因为目标暂时不明确就改走 `drive +move`

## 命令

```text
# 将已有 wiki 节点移动到另一个父节点下
lark-cli wiki +move \
  --node-token <NODE_TOKEN> \
  --target-parent-token <TARGET_PARENT_TOKEN>

# 将已有 wiki 节点移动到另一个知识空间根目录
lark-cli wiki +move \
  --node-token <NODE_TOKEN> \
  --target-space-id <TARGET_SPACE_ID>

# 将 Drive 文档迁入某个知识空间根目录
lark-cli wiki +move \
  --obj-type docx \
  --obj-token <DOC_TOKEN> \
  --target-space-id <TARGET_SPACE_ID>

# 将 Drive 文档迁入某个父节点下；如果当前没有直接移动权限，则提交申请
lark-cli wiki +move \
  --obj-type sheet \
  --obj-token <SHEET_TOKEN> \
  --target-space-id <TARGET_SPACE_ID> \
  --target-parent-token <TARGET_PARENT_TOKEN> \
  --apply

# 预览底层调用链
lark-cli wiki +move \
  --obj-type docx \
  --obj-token <DOC_TOKEN> \
  --target-space-id <TARGET_SPACE_ID> \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--node-token` | 条件必填 | 要移动的 Wiki 节点 token 或文档 obj_token。传入后命令进入 `node` 模式 |
| `--source-space-id` | 否 | 源知识空间 ID，仅 `node` 模式可用；不传时会根据 `--node-token` 自动解析 |
| `--target-space-id` | 条件必填 | 目标知识空间 ID。`docs_to_wiki` 模式必填；`node` 模式下如果不传，则必须传 `--target-parent-token` |
| `--target-parent-token` | 否 | 目标父节点 token。`docs_to_wiki` 不传时表示迁入目标知识空间根目录 |
| `--obj-type` | 条件必填 | Drive 文档类型，仅 `docs_to_wiki` 模式可用。可选值：`doc`、`sheet`、`bitable`、`mindnote`、`docx`、`file`、`slides` |
| `--obj-token` | 条件必填 | Drive 文档 token，仅 `docs_to_wiki` 模式可用 |
| `--apply` | 否 | 仅 `docs_to_wiki` 模式可用；当当前调用方不能直接移动文档时，提交一个 move request |

## 模式选择与校验规则

- **`node` 模式**：只要传了 `--node-token`，就会按“移动已有 Wiki 节点”执行
- **`docs_to_wiki` 模式**：未传 `--node-token` 时，按“把 Drive 文档迁入 Wiki”执行
- `node` 模式下，`--node-token` 不能与 `--obj-type`、`--obj-token`、`--apply` 同时使用
- `node` 模式下，`--target-parent-token` 和 `--target-space-id` 不能同时为空
- `docs_to_wiki` 模式下，必须同时提供 `--obj-type`、`--obj-token`、`--target-space-id`
- `docs_to_wiki` 模式下，`--source-space-id` 非法，只能用于 `node` 模式

## 空间解析与一致性校验

### `node` 模式

- **源空间解析**：先调用 `GET /open-apis/wiki/v2/spaces/node_by_token` 解析源节点；未传 `--source-space-id` 时使用查询结果，传入时校验两者一致。
- **目标父节点解析**：如果传了 `--target-parent-token`，shortcut 会先解析该父节点所属的 `space_id`
- **节点类型**：源节点和目标父节点接受 Wiki `node_token` 或文档 `obj_token`，实际移动使用查询返回的 `node_token`。
- **一致性校验**：如果同时传了 `--target-space-id` 和 `--target-parent-token`，shortcut 会校验两者是否属于同一个知识空间；不一致时直接返回验证错误
- **移动到空间根目录**：如果只传 `--target-space-id`，则表示移动到该知识空间根目录

### `docs_to_wiki` 模式

- `--target-space-id` 始终必填
- `--target-parent-token` 可选；不传时表示移动到目标知识空间根目录
- 请求体会自动映射成 `obj_type`、`obj_token`、`parent_wiki_token`、`apply`

## 行为说明

- **`node` 模式是同步操作**：请求成功后直接返回移动后的节点信息
- **`docs_to_wiki` 可能是同步，也可能是异步**：
  - 如果接口直接返回 `wiki_token`，shortcut 会立刻返回 `ready=true`
  - 如果接口返回 `applied=true`，shortcut 会返回 `ready=false`、`failed=false`、`applied=true` 和 `status_msg="move request submitted for approval"`
  - 如果接口返回 `task_id`，shortcut 会先进入有限轮询
- **有限轮询窗口**：固定最多轮询 `30` 次，每次间隔 `2` 秒
- **轮询超时不是失败**：如果轮询窗口结束任务仍在处理中，会返回 `task_id`、`status`、`status_msg`、`ready=false`、`timed_out=true` 和 `next_command`
- **继续查询**：看到 `next_command` 后，改用 `lark-cli drive +task_result --scenario wiki_move --task-id <TASK_ID>` 继续查
- **任务失败直接报错**：如果轮询期间任务进入失败态，shortcut 会直接返回错误，不会再输出 `ready=false` 结果
- **轮询请求全部失败时也直接报错**：如果任务已创建，但后续每一次状态查询都失败，shortcut 会返回带 hint 的错误，并给出继续查询命令

## 返回结果

### `node` 模式典型返回

```json
{
  "mode": "node",
  "source_space_id": "space_src",
  "target_space_id": "space_dst",
  "space_id": "space_dst",
  "node_token": "wikcnode_xxx",
  "obj_token": "doccn_xxx",
  "obj_type": "docx",
  "parent_node_token": "wikcparent_xxx",
  "node_type": "origin",
  "origin_node_token": "",
  "title": "项目计划",
  "has_child": false
}
```

### `docs_to_wiki` 异步超时返回

```json
{
  "mode": "docs_to_wiki",
  "obj_type": "docx",
  "obj_token": "doccn_xxx",
  "target_space_id": "space_xxx",
  "target_parent_token": "wikcparent_xxx",
  "task_id": "7500000000000000001",
  "ready": false,
  "failed": false,
  "status": 1,
  "status_msg": "processing",
  "timed_out": true,
  "next_command": "lark-cli drive +task_result --scenario wiki_move --task-id 7500000000000000001"
}
```

**输出字段说明：**

- `mode`：当前执行模式，值为 `node` 或 `docs_to_wiki`
- `ready`：任务是否已经完成并可直接继续使用结果
- `failed`：任务是否已失败
- `task_id`：异步任务 ID，仅异步场景返回
- `status` / `status_msg`：异步任务的主状态码和可读状态
- `wiki_token`：docs-to-wiki 成功后返回的 Wiki 节点 token；同时也会镜像到 `node_token`
- `space_id`、`node_token`、`obj_token`、`obj_type`、`parent_node_token`、`title` 等：成功拿到节点信息时返回，方便下游继续调用

## dry-run 编排

- `node` 模式下，dry-run 会根据是否需要解析源节点 / 目标父节点，展示 1 到 3 步的调用链
- `docs_to_wiki` 模式下，dry-run 会展示两步：
  1. `POST /open-apis/wiki/v2/spaces/{target_space_id}/nodes/move_docs_to_wiki`
  2. `GET /open-apis/wiki/v2/tasks/{task_id}?task_type=move`

## 权限说明

CLI 会在执行前做本地 scope 预检查；当前 shortcut 声明的权限为 `wiki:node:move`、`wiki:node:read`、`wiki:space:read`（分别覆盖 move 写操作、节点解析读操作、以及异步任务轮询读操作）。如果本地 token 已记录 scopes 且缺失任一权限，命令会直接提示重新执行 `lark-cli auth login --scope ...`。

当异步任务超时后，后续 `lark-cli drive +task_result --scenario wiki_move --task-id <TASK_ID>` 只需要 `wiki:space:read` 权限。

> [!CAUTION]
> `wiki +move` 是**写入操作**。执行前必须确认用户意图，以及目标节点 / 目标知识空间是否明确。

## 参考

- [lark-wiki](lark-wiki-0.md#s-384c23a567152824) -- 知识库全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数
- [wiki +move-to-drive](lark-wiki-0.md#s-9aa6007c9609b1f7) -- 将 Wiki 节点移出知识库并放入 Drive
- [drive +task_result](lark-drive-0.md#s-27c169d1426c6d1e) -- docs-to-wiki 异步任务的续跑查询命令


<a id="s-56f9a1676bbdf1a1"></a>

## references/lark-wiki-node-copy.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +node-copy

Copy one Wiki node, including that node's content, to a target space or under a target parent node. Descendant nodes are not copied.

> ⚠️ **High-risk write** — the upstream API is flagged `danger: true`, so this shortcut requires explicit `--yes` confirmation before issuing the request. Forgetting `--yes` returns a `confirmation_required` error and the copy is **not** performed.

## Usage

```text
lark-cli wiki +node-copy \
  --space-id <source_space_id> \
  --node-token <source_node_token> \
  (--target-space-id <target_space_id> | --target-parent-node-token <token>) \
  [--title <new_title>] \
  --yes \
  [--as user|bot]
```

## Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--space-id` | **Yes** | Source wiki space ID |
| `--node-token` | **Yes** | Source node token to copy |
| `--target-space-id` | Conditional | Target space ID. Required if `--target-parent-node-token` is not set |
| `--target-parent-node-token` | Conditional | Target parent node token. Required if `--target-space-id` is not set |
| `--title` | No | New title for the copied node. Omit to keep the original title |
| `--yes` | **Yes** | Confirm the high-risk operation. Without this flag the shortcut refuses to send the API request |
| `--format` | No | Output format: `json` (default) / `pretty` / `table` / `csv` / `ndjson` |
| `--as` | No | Identity `user`/`bot` (default `auto`); wiki is user-centric → pass `--as user` |

> At least one of `--target-space-id` or `--target-parent-node-token` must be provided.

## Output

```json
{
  "space_id": "target_space_id",
  "node_token": "wikcn_EXAMPLE_TOKEN",
  "obj_token": "doccn_EXAMPLE_TOKEN",
  "obj_type": "docx",
  "node_type": "origin",
  "title": "Getting Started (Copy)",
  "parent_node_token": "",
  "has_child": false
}
```

## Notes

- Copying is non-recursive: only the requested node and its content are copied.
- Descendant nodes must be copied separately.
- When the Wiki service returns `131009` lock contention, the CLI retries twice with bounded exponential backoff. If contention remains, wait before retrying again and avoid concurrent writes under the same target parent.
- To move an existing Wiki node without keeping the source, use [`wiki +move`](lark-wiki-0.md#s-c6dffcf181e680d0) instead of copy-then-delete.

## Required Scope

`wiki:node:copy`


<a id="s-502a3956dd387b13"></a>

## references/lark-wiki-node-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# wiki +node-create

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

在飞书知识库中创建一个新节点，并自动解析目标知识空间。该 shortcut 对原生 `wiki.nodes.create` 做了一层更适合日常使用的封装：可以直接指定 `space_id`，也可以从父节点自动反查所属空间；在 `user` 身份下，如果同时省略 `--space-id` 和 `--parent-node-token`，还会自动回退到个人知识库 `my_library`。

## 命令

```text
# 在个人知识库根目录下创建一个 docx 节点（user 身份默认回退到 my_library）
lark-cli wiki +node-create \
  --title "项目计划"

# 在指定知识空间中创建一个 docx 节点
lark-cli wiki +node-create \
  --space-id <SPACE_ID> \
  --title "项目计划"

# 在指定父节点下创建一个子节点
lark-cli wiki +node-create \
  --parent-node-token <PARENT_NODE_TOKEN> \
  --title "迭代记录"

# 显式指定创建到个人知识库（仅 user 身份；bot 不支持 `--space-id my_library`）
lark-cli wiki +node-create \
  --space-id my_library \
  --title "学习笔记"

# 创建一个快捷方式节点（shortcut）
lark-cli wiki +node-create \
  --parent-node-token <PARENT_NODE_TOKEN> \
  --node-type shortcut \
  --origin-node-token <ORIGIN_NODE_TOKEN> \
  --title "原文档快捷方式"

# 创建非 docx 类型节点
lark-cli wiki +node-create \
  --space-id <SPACE_ID> \
  --obj-type sheet \
  --title "周报数据"

# 预览底层调用链
lark-cli wiki +node-create \
  --title "Roadmap" \
  --dry-run
```

## 返回值

成功后会返回一个 JSON 对象，常见字段包括：

- `resolved_space_id`：最终用于创建的真实知识空间 ID
- `resolved_by`：空间解析来源，可能是 `explicit_space_id`、`parent_node_token`、`my_library`
- `node_token`：新建知识库节点 token
- `obj_token`：节点关联对象 token
- `obj_type`：节点关联对象类型
- `node_type`：节点类型
- `title`：节点标题
- `permission_grant`（可选）：仅 `--as bot` 时返回，说明是否已自动为当前 CLI 用户授予可管理权限

> [!IMPORTANT]
> 如果节点是**以应用身份（bot）创建**的，如 `lark-cli wiki +node-create --as bot`，在创建成功后 CLI 会**尝试为当前 CLI 用户自动授予该知识库节点的 `full_access`（可管理权限）**。
>
> 以应用身份创建时，结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该知识库节点的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：节点已创建成功，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该节点
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--space-id` | 否 | 目标知识空间 ID；`user` 身份可传特殊值 `my_library` 表示个人知识库，`bot` 身份不支持该值 |
| `--parent-node-token` | 否 | 父知识库节点 token 或文档 obj_token；在解析出的 Wiki 节点下创建新节点 |
| `--title` | 否 | 节点标题 |
| `--node-type` | 否 | 节点类型，默认 `origin`；可选值：`origin`、`shortcut` |
| `--obj-type` | 否 | 节点对应对象类型，默认 `docx`；可选值：`sheet`、`mindnote`、`bitable`、`file`、`docx`、`slides`。`file` 仅支持 `shortcut` 节点 |
| `--origin-node-token` | 否 | 当 `--node-type=shortcut` 时必填，表示快捷方式指向的源节点 token |

## 空间解析规则

- **优先级**：`--space-id` > `--parent-node-token` > `my_library`
- **显式 space**：传了 `--space-id` 时，shortcut 会直接使用该空间；如果该值是 `my_library`，则仅 `user` 身份可用，并会先调用 `GET /open-apis/wiki/v2/spaces/my_library` 解析成真实 `space_id`
- **父节点推断**：未传 `--space-id` 但传了 `--parent-node-token` 时，会先调用 `GET /open-apis/wiki/v2/spaces/node_by_token` 获取父节点，再读取其 `space_id`
- **父节点类型**：`--parent-node-token` 接受 Wiki `node_token` 或已挂载到 Wiki 的文档 `obj_token`，创建时使用查询返回的 `node_token`；显式传空间时也会查询并校验父节点空间。
- **个人知识库回退**：`user` 身份下，如果 `--space-id` 和 `--parent-node-token` 都没传，会自动解析 `my_library`
- **bot 身份限制**：`bot` 身份既没有“个人知识库”回退语义，也不支持显式传 `--space-id my_library`；请改用真实 `space_id` 或 `--parent-node-token`

## 节点类型与对象类型

| `node_type` | 支持的 `obj_type` |
|-------------|-------------------|
| `origin` | `sheet`、`mindnote`、`bitable`、`docx`、`slides` |
| `shortcut` | `sheet`、`mindnote`、`bitable`、`file`、`docx`、`slides` |

- `--node-type=shortcut` 时，必须同时提供 `--origin-node-token`
- `--node-type=origin` 时，不能传 `--origin-node-token`
- `--obj-type=file` 仅支持 `--node-type=shortcut`；实体节点不支持创建 `file` 类型
- `shortcut` 节点只是知识库中的快捷方式入口；真正被引用的节点由 `--origin-node-token` 指定
- 如果 `+node-create` 因上述组合返回参数校验错误，禁止改用 raw `wiki nodes create` 或直接调用 OpenAPI 绕过校验；应修正 `node_type`、`obj_type` 或 `origin_node_token`

```text
# 创建一个指向文件的快捷方式节点
lark-cli wiki +node-create \
  --space-id <SPACE_ID> \
  --node-type shortcut \
  --obj-type file \
  --origin-node-token <ORIGIN_NODE_TOKEN>
```

## 一致性校验

- 如果同时传了 `--space-id` 和 `--parent-node-token`，shortcut 会校验父节点所属空间是否与 `--space-id` 一致
- 如果两者解析出的空间不一致，命令会直接返回验证错误，而不会继续创建
- 对于 `my_library`，`user` 身份下也会先解析出真实 `space_id` 后再做这层校验

## 行为说明

- **默认对象类型**：不传 `--obj-type` 时默认创建 `docx` 节点
- **默认节点类型**：不传 `--node-type` 时默认创建普通节点 `origin`
- **dry-run 编排**：
  - 仅传 `--title`：会展示 `my_library` 解析 + 创建节点 两步调用
  - 仅传 `--parent-node-token`：会展示“查询父节点 -> 创建节点”两步调用
  - 同时需要 `my_library` 和父节点时：会展示三步调用链
- **bot 自动授权**：若使用 `--as bot`，结果还会额外带上 `permission_grant`，用于说明是否已自动为当前 CLI 用户授予新建节点的可管理权限
- **输出结果**：成功后会返回 `resolved_space_id`、`resolved_by`、`node_token`、`obj_token`、`obj_type`、`node_type`、`title` 等字段，便于后续继续操作
- **结构限制**：返回 `131003` 表示触发了知识空间总节点数、目录深度或单个父节点直属子节点数等结构限制。这不是瞬时错误，禁止使用相同参数重试。根据上游错误信息选择更浅或其他父节点、重新组织现有节点，或清理/改用其他知识空间；不要在无法确认具体限制时盲目增加中间层级。

## 推荐场景

- 用户说“在我的知识库里新建一篇页面”时，优先用 `lark-cli wiki +node-create --title "..."`
- 用户已经给出父页面链接或 `parent_node_token` 时，优先传 `--parent-node-token`，让 shortcut 自动推导空间
- 需要创建知识库快捷方式时，使用 `--node-type shortcut --origin-node-token <token>`

> [!CAUTION]
> `wiki +node-create` 是**写入操作**，执行前必须确认用户意图。

## 参考

- [lark-wiki](lark-wiki-0.md#s-384c23a567152824) -- 知识库全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-b9e78f1d6ed0d089"></a>

## references/lark-wiki-node-delete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +node-delete

Delete a wiki node (or pull a cloud doc out of Wiki). OpenAPI: `DELETE /open-apis/wiki/v2/spaces/:space_id/nodes/:node_token`.

> ⚠️ **High-risk write & irreversible** — deletes the node and (by default) its whole subtree. Requires explicit `--yes`; without it the CLI returns a `confirmation_required` error and nothing is deleted.

- **Sync / async**: an empty `task_id` means the delete completed synchronously (`ready=true`). A non-empty `task_id` triggers bounded polling; if the window elapses the output carries `timed_out=true` and a `next_command`:
  `lark-cli drive +task_result --scenario wiki_delete_node --task-id <TASK_ID> --as <user|bot>`

## Usage

```text
lark-cli wiki +node-delete \
  --node-token <node_token | obj_token | Lark URL> \
  [--obj-type <wiki|doc|docx|sheet|bitable|mindnote|slides|file>] \
  [--space-id <space_id>] \
  [--include-children=true|false] \
  --yes \
  [--as user|bot]

# Preview the call chain without deleting
lark-cli wiki +node-delete --node-token <token> --obj-type wiki --dry-run
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--node-token` | string | **Yes** | — | `node_token`, cloud-doc `obj_token`, or a Lark URL embedding one; URL paths also imply `--obj-type` |
| `--obj-type` | enum | Conditional | — | Required for a raw token (URL inputs auto-infer). `wiki` uses the resolved `node_token`; other types use the resolved `obj_token` and must match its document type |
| `--space-id` | string | No | — | Assert the resolved node belongs to this space; inferred when omitted |
| `--include-children` | bool | No | `true` | Cascade-delete the subtree (default). `--include-children=false` lifts direct children up to the parent |
| `--yes` | bool | Yes (real delete) | — | Confirm the high-risk operation. Without it the CLI returns `confirmation_required` |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

The lookup sends only `token`, including when `--space-id` is provided. Deletion uses the resolved token matching `--obj-type`; a document-type mismatch is rejected before deletion.

For a Wiki shortcut, use `--obj-type wiki` to delete the shortcut itself. Other types are rejected because the shortcut's `obj_token` identifies its origin document.

## Output

```json
{
  "space_id": "7160145948494381236",
  "node_token": "wikcnEXAMPLE",
  "obj_type": "wiki",
  "include_children": true,
  "ready": true,
  "failed": false,
  "status": "success",
  "status_msg": "success"
}
```

Async/timeout adds `task_id`, `timed_out`, and `next_command`.

## Behavior

- **Task poll**: `GET /open-apis/wiki/v2/tasks/{task_id}?task_type=delete_node`. The status lives under `data.task.simple_task_result.status` (the gateway's generic key — **not** `delete_node_result`); that object has no `status_msg`, so the label falls back to the status code.
- **Error hints**:
  - `131011` → the node has delete-approval enabled; apply via the Wiki UI (CLI cannot bypass approval).
  - `131003` → subtree too large to cascade-delete; use `--include-children=false` or delete sub-trees first.

## Required Scopes

Both `wiki:node:create` (deletion) and `wiki:node:retrieve` (target lookup) are required, including when `--space-id` is provided. The server also checks access to the target node.


<a id="s-5b3c1d410c11b5c9"></a>

## references/lark-wiki-node-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +node-get

Get a wiki node's details by `node_token`, `obj_token`, or a Lark URL. Use this as the "what am I about to touch?" step before `+move` / `+node-copy` / `+node-delete`.

## Usage

```text
lark-cli wiki +node-get \
  --node-token <node_token | obj_token | Lark URL> \
  [--space-id <space_id>] \
  [--format json|pretty|table|csv|ndjson] \
  [--as user|bot]
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--node-token` | string | **Yes** | — | `node_token`, cloud-doc `obj_token`, or a Lark URL embedding one (e.g. `https://feishu.cn/wiki/<token>` or `https://feishu.cn/docx/<token>`). Matches the `--node-token` naming used by sibling `+node-delete` / `+node-copy` / `+move`. |
| `--token` | string | — (deprecated) | — | Deprecated original name; still accepted for backward compatibility but emits a `Flag --token has been deprecated, use --node-token instead` warning on stderr. New scripts should use `--node-token`. |
| `--space-id` | string | No | — | Optional cross-check: fail if the resolved node does not live in this space |
| `--format` | enum | No | `json` | `json` / `pretty` / `table` / `csv` / `ndjson` |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

## Output

```json
{
  "space_id": "7160145948494381236",
  "node_token": "wikcnEXAMPLE",
  "obj_token": "docxEXAMPLE",
  "obj_type": "docx",
  "node_type": "origin",
  "parent_node_token": "wikcnPARENT",
  "origin_node_token": "",
  "title": "Design Spec",
  "has_child": true,
  "creator": "ou_xxx",
  "owner": "ou_yyy",
  "obj_edit_time": "1700000000",
  "obj_create_time": "1690000000",
  "node_create_time": "1690000001",
  "updated_at": "2023-11-14T22:13:20Z"
}
```

## Notes

- The underlying API is `GET /open-apis/wiki/v2/spaces/node_by_token`. Only `token` is sent; the server detects whether it is a Wiki or document token and validates its length. The CLI still requires a nonempty token and validates URL syntax.
- `--obj-type` is deprecated and hidden. Legacy scripts may still pass it; its value is ignored without a warning or any extra stdout/stderr output. URL paths are used only to extract tokens, not to assert the returned object type. `--space-id` remains a response cross-check.
- `creator` falls back to `creator` when `node_creator` is absent. `updated_at` is `obj_edit_time` formatted as RFC3339.
- The shortcut preserves its existing output fields and does not emit or synthesize a `url`. Use `node_token` / `obj_token` as the identifiers.

## Terminal business errors

These HTTP 200 responses carry a non-zero business code and are not retryable with the same input:

| Code | Meaning | Required action |
|------|---------|-----------------|
| `131005` | The Wiki node does not exist | Check the token or obtain a current Wiki link |
| `131006` | The current user or app/bot identity lacks access to the Wiki node or space | This is resource access, not app scope authorization. Do not retry the same request, reauthorize, or switch identity as trial and error; ask the node owner or wiki administrator to grant read access, or use an accessible resource |
| `131012` | The Wiki node has been deleted | Do not retry the same node token; rediscover the node or ask for a current Wiki link |
| `131013` | The resource token is invalid | Do not switch identity or reauthorize; correct the URL/token |
| `131014` | The document is not mounted in Wiki | Stop Wiki resolution; use the corresponding docs/sheets/base/drive command, or provide a Wiki URL/node_token |
| `131016` | The token is too short | Provide the complete token or document URL; do not retry the same input |

HTTP 200 alone does not mean success: non-zero business codes still produce a CLI failure. `131001` (invalid request) and gateway errors may still return HTTP 4xx/5xx.

## Rate limiting

For `99991400` / `rate_limit`: Do not retry immediately. Wait `retry_after_seconds`, or use exponential backoff with jitter. Stop after 3 total attempts (1 initial + 2 retries).

## Required Scope

`wiki:node:retrieve`


<a id="s-8a3585c4cccac51a"></a>

## references/lark-wiki-node-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +node-list

List wiki nodes in a space or under a specific parent node. **Default fetches a single page** (large knowledge bases can have thousands of nodes — opt into `--page-all` explicitly with an eye on `--page-limit`).

## Usage

```text
# Default: single page of root nodes
lark-cli wiki +node-list --space-id <SPACE_ID>

# Drill into a sub-directory (still single page by default)
lark-cli wiki +node-list --space-id <SPACE_ID> --parent-node-token <NODE_TOKEN>

# Drill with a wiki URL (CLI normalizes /wiki/<token> to node_token)
lark-cli wiki +node-list --space-id <SPACE_ID> --parent-node-token "https://feishu.cn/wiki/wikcn_xxx"

# Personal document library (user identity only)
lark-cli wiki +node-list --space-id my_library --as user

# Walk every page (capped by --page-limit, default 10)
lark-cli wiki +node-list --space-id <SPACE_ID> --page-all

# Walk every page with a higher cap
lark-cli wiki +node-list --space-id <SPACE_ID> --page-all --page-limit 30

# Resume from a cursor
lark-cli wiki +node-list --space-id <SPACE_ID> --page-token <TOKEN>

# Pretty / table output
lark-cli wiki +node-list --space-id <SPACE_ID> --format pretty
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--space-id` | string | **Yes** | — | Numeric wiki space ID. Use `my_library` for personal document library (user only) |
| `--parent-node-token` | string | No | — | Parent wiki node token, or a `/wiki/<token>` URL; omit to list the space root |
| `--page-size` | int | No | 50 | Page size, 1-50 |
| `--page-token` | string | No | — | Page cursor; implies single-page fetch (no auto-pagination) |
| `--page-all` | bool | No | `false` | Automatically paginate through all pages (capped by `--page-limit`) |
| `--page-limit` | int | No | 10 | Max pages with `--page-all` (0 = unlimited) |
| `--format` | enum | No | `json` | `json` / `pretty` / `table` / `csv` / `ndjson` |
| `--as` | enum | No | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` (`my_library` requires `--as user`) |

## Output

```json
{
  "ok": true,
  "data": {
    "nodes": [
      {
        "space_id": "6946843325487912356",
        "node_token": "wikcn_EXAMPLE_TOKEN",
        "obj_token": "doccn_EXAMPLE_TOKEN",
        "obj_type": "docx",
        "parent_node_token": "",
        "node_type": "origin",
        "title": "Getting Started",
        "has_child": true
      }
    ],
    "has_more": false,
    "page_token": ""
  },
  "meta": { "count": 1 }
}
```

When the default single-page fetch (or `--page-all` capped by `--page-limit`) does not exhaust the upstream cursor, `has_more=true` and `page_token=<cursor>` so the caller can resume via `--page-token` or by increasing `--page-limit`.

## Traverse the wiki tree

To list all content recursively, call `+node-list` again with each node's `node_token` as `--parent-node-token` when `has_child` is `true`.

```text
# Step 1: list root nodes
lark-cli wiki +node-list --space-id 6946843325487912356

# Step 2: drill into a node that has children
lark-cli wiki +node-list --space-id 6946843325487912356 --parent-node-token wikcn_EXAMPLE_TOKEN
```

## Notes

- `--space-id my_library` is a per-user alias and only valid with `--as user`. The shortcut will refuse `--as bot` with `my_library` upfront.
- `--space-id` is a numeric wiki `space_id`. Do not pass a wiki URL, wiki node token, document token, or title. Use `lark-cli wiki +space-list --as user` to discover it.
- `--parent-node-token` must resolve to a wiki node token. If you have a docx/sheet/base/file URL, first run `lark-cli wiki +node-get --node-token <url>` and use the returned `node_token`.
- Treat `invalid_parameters` (`space_id is not int`, `invalid page_token`), `not_found` (`node not found by parent node token`), and `permission_denied` as terminal for the current arguments. For `131006 permission_denied`, the user or app/bot identity lacks access to the target space or parent node; this is resource access, not app scope authorization. Do not retry the same request, reauthorize, or switch identity as trial and error. Ask the resource owner or wiki administrator to grant read access, or use an accessible resource.
- For `rate_limit`, stop immediate retries and retry later with exponential backoff or a smaller `--page-limit`.

## Required Scope

`wiki:node:retrieve`


<a id="s-2161504a9c2fb6e3"></a>

## references/lark-wiki-space-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +space-create

Create a wiki space. OpenAPI: `POST /open-apis/wiki/v2/spaces`. This is the project-initialization entry point — the alternative is hand-writing `wiki spaces create --params '{...}'`.

> The underlying `spaces.create` API is flagged `danger: true` in the schema browser, but it is **not** confirmation-gated (no `--yes`). A space created by mistake is recoverable via `wiki +delete-space`.

## Usage

```text
lark-cli wiki +space-create \
  --name <space_name> \
  [--description <text>] \
  [--as user]
```

## Flags

| Flag | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `--name` | string | **Yes** | — | Wiki space name. Blank/whitespace is rejected (an unnamed space is almost always an accident) |
| `--description` | string | No | — | Wiki space description |
| `--as` | enum | No | `user` | **User identity only** — the create API does not accept a tenant/bot token; `--as bot` is rejected upfront |

## Output

```json
{
  "space_id": "7160145948494381236",
  "name": "Engineering Wiki",
  "description": "team docs",
  "space_type": "team",
  "visibility": "private",
  "open_sharing": "closed"
}
```

There is no `url` field — the create API does not return one.

## Notes

- Only `--as user` is supported; this command declares `AuthTypes: ["user"]` and the framework rejects `--as bot` with a clear message.
- `--dry-run` previews the `POST /open-apis/wiki/v2/spaces` request (and surfaces the blank-name validation error early).

## Required Scope

`wiki:space:write_only`


<a id="s-0761d16c36ab346a"></a>

## references/lark-wiki-space-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-wiki +space-list

List wiki spaces accessible to the caller. **Default fetches a single page** (matches the rest of the CLI's list shortcuts); pass `--page-all` to walk every page.

## Usage

```text
# Default: single page (first up to --page-size items)
lark-cli wiki +space-list

# Walk every page (capped by --page-limit, default 10)
lark-cli wiki +space-list --page-all

# Walk every page, no cap (use with care if you have many spaces)
lark-cli wiki +space-list --page-all --page-limit 0

# Resume from a specific cursor (single-page fetch regardless of --page-all)
lark-cli wiki +space-list --page-token <TOKEN>

# Pretty / table / csv / ndjson output
lark-cli wiki +space-list --format pretty
lark-cli wiki +space-list --format table
```

## Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--page-size` | int | 50 | Page size, 1-50 |
| `--page-token` | string | — | Page cursor; implies single-page fetch (no auto-pagination) |
| `--page-all` | bool | `false` | Automatically paginate through all pages (capped by `--page-limit`) |
| `--page-limit` | int | 10 | Max pages with `--page-all` (0 = unlimited) |
| `--format` | enum | `json` | `json` / `pretty` / `table` / `csv` / `ndjson` |
| `--as` | enum | `auto` | Identity `user`/`bot`; wiki is user-centric → pass `--as user` |

## Output

```json
{
  "ok": true,
  "data": {
    "spaces": [
      {
        "space_id": "6946843325487912356",
        "name": "Engineering Wiki",
        "description": "...",
        "space_type": "team",
        "visibility": "private",
        "open_sharing": "closed"
      }
    ],
    "has_more": false,
    "page_token": ""
  },
  "meta": { "count": 1 }
}
```

When the default single-page fetch (or `--page-all` capped by `--page-limit`) does not exhaust the upstream cursor, `has_more=true` and `page_token=<cursor>` so the caller can resume via `--page-token` or by increasing `--page-limit`.

## Notes

- **The underlying API never returns the my_library personal library**; resolve it via `lark-cli wiki spaces get --params '{"space_id":"my_library"}'`.
- Use `space_id` from the output as `--space-id` for `+node-list` or `+node-copy`.

## Required Scope

`wiki:space:retrieve`


<a id="s-57561fbc35c449a0"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `wiki.v1.node.search` | [Feishu/Lark]-云文档-知识库-搜索 Wiki | feishu_read_tool |
| `wiki.v2.space.create` | [Feishu/Lark]-云文档-知识库-知识空间-创建知识空间-此接口用于创建知识空间 | feishu_call_tool |
| `wiki.v2.space.get` | [Feishu/Lark]-云文档-知识库-知识空间-获取知识空间信息-此接口用于根据知识空间 ID 查询知识空间的信息，包括空间的类型、可见性、分享状态等 | feishu_read_tool |
| `wiki.v2.space.getNode` | [Feishu/Lark]-云文档-知识库-节点-获取知识空间节点信息-获取知识空间节点信息 | feishu_read_tool |
| `wiki.v2.space.list` | [Feishu/Lark]-云文档-知识库-知识空间-获取知识空间列表-此接口用于获取有权限访问的知识空间列表 | feishu_read_tool |
| `wiki.v2.spaceMember.create` | [Feishu/Lark]-云文档-知识库-空间成员-添加知识空间成员-添加知识空间成员或管理员 | feishu_call_tool |
| `wiki.v2.spaceMember.delete` | [Feishu/Lark]-云文档-知识库-空间成员-删除知识空间成员-此接口用于删除知识空间成员或管理员 | feishu_call_tool |
| `wiki.v2.spaceMember.list` | [Feishu/Lark]-云文档-知识库-空间成员-获取知识空间成员列表-获取知识空间的成员与管理员列表 | feishu_read_tool |
| `wiki.v2.spaceNode.copy` | [Feishu/Lark]-云文档-知识库-节点-创建知识空间节点副本-此接口用于在知识空间创建节点副本到指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.create` | [Feishu/Lark]-云文档-知识库-节点-创建知识空间节点-此接口用于在知识节点里创建[节点]到指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.list` | [Feishu/Lark]-云文档-知识库-节点-获取知识空间子节点列表-此接口用于分页获取Wiki节点的子节点列表。此接口为分页接口。由于权限过滤，可能返回列表为空，但分页标记（has_more）为true，可以继续分页请求 | feishu_read_tool |
| `wiki.v2.spaceNode.move` | [Feishu/Lark]-云文档-知识库-节点-移动知识空间节点-此方法用于在Wiki内移动节点，支持跨知识空间移动。如果有子节点，会携带子节点一起移动 | feishu_call_tool |
| `wiki.v2.spaceNode.moveDocsToWiki` | [Feishu/Lark]-云文档-知识库-云文档-移动云空间文档至知识空间-该接口允许移动云空间文档至知识空间，并挂载在指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.updateTitle` | [Feishu/Lark]-云文档-知识库-节点-更新知识空间节点标题-此接口用于更新节点标题 | feishu_call_tool |
| `wiki.v2.spaceSetting.update` | [Feishu/Lark]-云文档-知识库-空间设置-更新知识空间设置-根据space_id更新知识空间公共设置 | feishu_call_tool |
| `wiki.v2.task.get` | [Feishu/Lark]-云文档-知识库-云文档-获取任务结果-该方法用于获取wiki异步任务的结果 | feishu_read_tool |
| `cli.wiki.spaces.create` | Create Wiki space | feishu_call_tool |
| `cli.wiki.spaces.get` | Access to Wiki space information | feishu_read_tool |
| `cli.wiki.spaces.get_node` | Get Wiki node information | feishu_read_tool |
| `cli.wiki.spaces.list` | Get a list of Wiki spaces | feishu_read_tool |
| `cli.wiki.members.create` | Add Wiki space members | feishu_call_tool |
| `cli.wiki.members.delete` | Delete Wiki space members | feishu_call_tool |
| `cli.wiki.members.list` | Obtain Wiki space members | feishu_read_tool |
| `cli.wiki.nodes.copy` | Create a node copy in Wiki | feishu_call_tool |
| `cli.wiki.nodes.create` | Create node in Wiki | feishu_call_tool |
| `cli.wiki.nodes.list` | Get the list of child nodes in Wiki | feishu_read_tool |


<a id="s-ac3c3326e0d275ac"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# wiki (v2)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理**

> **成员管理硬限制：**
> - 如果目标是“部门”，先判断身份，再决定是否继续。
> - `--as bot` 对应 `tenant_access_token`。官方限制：这种身份下不能使用部门 ID (`opendepartmentid`) 添加知识空间成员。
> - 遇到“部门 + --as bot”时，禁止先调用 `lark-cli wiki +member-add` 试错；直接说明该路径不可行。
> - 如果用户明确要求“以 bot 身份运行”，且目标是部门，必须停下说明 bot 路径无法完成，不要静默切到 `--as user`。

## 身份选择：优先使用 user 身份

知识空间和节点都是用户的个人资源，**策略上应优先显式使用 `--as user`**（CLI 的 `--as` 默认值为 `auto`，不带 `--as` 时常被解析成 `bot`，列出的是应用所属空间而非用户的）。仅当用户明确要求“应用 / bot 视角”时才用 `--as bot`（仍受上面的成员管理硬限制约束）。

## 快速决策

- 用户要**按特定主题 / 关键词 / 内容线索查找资料并收集到知识库节点或新建知识库节点下**，必须先阅读 [`../lark-drive/references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`topic_move_collector`](lark-drive-0.md#s-6ce8e611996d89c6) workflow。该 workflow 使用 Drive 全量搜索召回，再按 Wiki 目标解析、确认和移动；不要只用 Wiki 节点列表做局部遍历。
- 用户要**整理 / 盘点 / 归类 / 重构知识库、个人文档库、文档库目录或 Wiki 节点结构**，或要生成整理方案、目标目录树、移动计划时，不要只使用 Wiki 节点 API。必须先阅读 [`../lark-drive/references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`knowledge_organize`](lark-drive-0.md#s-21e19860bee6e319) workflow；该 workflow 负责 Drive / Wiki / 个人文档库的统一入口解析、资源盘点、分类计划、写前确认和结果验证。
- 用户要把**已有 Wiki 节点移出知识库，放到 Drive 文件夹或“我的空间”根目录**：使用 `wiki +move-to-drive`，不要使用 `wiki +move` 或 `drive +move`。这是会改变节点归属和权限继承的写操作，执行前确认源节点与目标位置。
- 用户给的是知识库 URL（`.../wiki/<token>`），且后续要查成员/加成员/删成员：先确定下游成员操作的身份（默认 `user`；用户明确要求应用 / bot 视角时用 `bot`），再调用 `lark-cli wiki +node-get --node-token '<wiki_url>' --as user --format json`，从 `data.space_id` 获取空间 ID；下游使用 bot 时将示例中的身份改为 `--as bot`。节点解析与后续成员操作必须使用相同身份。
- 用户要**删除**知识空间（`wiki +delete-space`）但只给了名称或 URL：**不能**把名称 / URL 原样传给 `--space-id`，必须先解析出真实 `space_id`。解析方式：
  - URL（`.../wiki/<token>`）：先确定后续 `wiki +delete-space` 的身份（默认 `user`；明确要求 bot 视角时用 `bot`），再调用 `lark-cli wiki +node-get --node-token '<wiki_url>' --as user --format json`，读取 `data.space_id`；下游使用 bot 时将示例中的身份改为 `--as bot`。解析和删除必须使用相同身份。
  - 只知名称：`lark-cli wiki spaces list --format json`，边翻页边收集 items 并按 `name` 精确匹配；**一旦任一页累计到至少 1 条精确匹配就停止翻页**。只有当翻完所有页（`has_more=false`）仍无精确匹配时，才对已收集的全量 items 做宽松匹配（`name` trim 空格、大小写不敏感、子串包含）。
  - **关键安全约束**：无论精确还是模糊，**无论命中 1 条还是多条，发起删除前都必须把候选（`name` + `space_id` + `description` + `space_type`）列给用户，由用户明确选定一个 `space_id` 再执行**。不要因为"只命中一条"就自动执行删除。
  - 命中 0 条：停下来问用户是名称拼错了还是调用方无权限；**不要**自行改名字重试。
  - 用户明确选定后再执行 `lark-cli wiki +delete-space --space-id <ID> --yes`（高风险写操作，必须显式 `--yes`）。
  - 反例：不要把 wiki URL / 名称直接当 `--space-id`（如 `--space-id "https://.../wiki/<wiki_token>"`）；务必先用 `wiki +node-get` 解析出 `data.space_id` 再传。
- 用户要在知识库中创建新节点，优先使用 `lark-cli wiki +node-create`。
- 用户要**原地重命名 Wiki 节点 / 修改节点标题**：使用 `lark-cli drive +update-title --url '<wiki_url>' --title '<new_title>'`。该命令保留同一个 `node_token`，并会根据 API 返回给出准确的缺失 scope 和授权提示；不要探索 raw `wiki.nodes` 的 `update_title` 端点，也不要通过复制或新建第二个节点实现改名。
- 用户要列出 Wiki 节点：先用 `wiki +space-list --as user` 拿数字 `space_id`，再用 `wiki +node-list --space-id <space_id>`。不要把 wiki URL、node token、doc token、名称直接当 `--space-id`。钻子节点时 `--parent-node-token` 必须是 wiki node token；如果用户给的是 docx/sheet/base URL，先用 `wiki +node-get --node-token <url>` 解析出 `node_token`。
- `wiki +node-list` 命中 `invalid_parameters`、`not_found`、`permission_denied` 时，不要重复调用同一参数；按 hint 修 `space_id` / `parent_node_token` / 权限。只有 `rate_limit` 才做退避重试。
- 用户说“给知识库添加成员/管理员”：先把目标解析成“用户 / 群 / 部门 / 应用”四类之一，再决定 `--member-type`，不要先调 `wiki +member-add` 再根据报错反推类型。
- 用户说“部门 + bot”：这是已知不支持路径。不要继续尝试 `wiki +member-add --as bot`；直接提示必须改成 `--as user`，或明确告知当前要求无法完成。
- 用户说“用户 / 群 / 应用 + 添加成员”：先解析对应 ID，再执行 `wiki +member-add`。
- 用户说“查看 / 列出空间成员”：用 `wiki +member-list`；该 shortcut 默认只取一页，多成员场景显式加 `--page-all`。
- 用户说“移除 / 删除空间成员”：用 `wiki +member-remove`，必须传齐原始授予时的 `--member-type` 和 `--member-role`（不知道就先 `wiki +member-list` 查一下）。

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli wiki +<verb> [flags]`）。有 Shortcut 的操作优先使用。

获取或解析 Wiki 节点统一使用 `wiki +node-get`，包括只为获取 `space_id`、`node_token`、`obj_token` 或 `obj_type` 的中间步骤。

| Shortcut | 说明 |
|----------|------|
| [`+move`](lark-wiki-0.md#s-c6dffcf181e680d0) | Move a wiki node, or move a Drive document into Wiki |
| [`+move-to-drive`](lark-wiki-0.md#s-9aa6007c9609b1f7) | Move a wiki node to a Drive folder and poll the async task |
| [`+node-create`](lark-wiki-0.md#s-502a3956dd387b13) | Create a wiki node with automatic space resolution |
| [`+delete-space`](lark-wiki-0.md#s-34320fa7440ad9af) | Delete a wiki space, polling the async delete task when needed |
| [`+space-list`](lark-wiki-0.md#s-0761d16c36ab346a) | List all wiki spaces accessible to the caller |
| [`+space-create`](lark-wiki-0.md#s-2161504a9c2fb6e3) | Create a wiki space (user identity only) |
| [`+node-list`](lark-wiki-0.md#s-8a3585c4cccac51a) | List wiki nodes in a space or under a parent node (supports pagination) |
| [`+node-copy`](lark-wiki-0.md#s-56f9a1676bbdf1a1) | Copy a wiki node to a target space or parent node |
| [`+node-get`](lark-wiki-0.md#s-5b3c1d410c11b5c9) | Get a wiki node's details by node_token / obj_token / Lark URL |
| [`+node-delete`](lark-wiki-0.md#s-b9e78f1d6ed0d089) | Delete a wiki node, polling the async delete task when needed |
| [`+member-add`](lark-wiki-0.md#s-5104188d1f7b4e0a) | Add a member to a wiki space |
| [`+member-remove`](lark-wiki-0.md#s-ab1175a967ac2ff8) | Remove a member from a wiki space |
| [`+member-list`](lark-wiki-0.md#s-b2f85463036189d2) | List members of a wiki space (supports pagination) |

## 成员添加流程

- 调用 `lark-cli wiki +member-add` 前，先把自然语言里的“人 / 群 / 部门 / 应用”解析成正确的 `--member-id`，不要猜格式。
- 用户场景默认优先 `--member-type=openid`：用 `lark-cli contact +search-user --query "<姓名/邮箱/手机号>" --format json` 获取 `open_id`。
- 群组场景使用 `--member-type=openchat`：用 `lark-cli im +chat-search --query "<群名关键词>" --format json` 获取 `chat_id`。
- 应用场景使用 `--member-type=appid`：`--member-id` 传应用 ID，格式通常为 `cli_xxx`。
- `userid` / `unionid` 只在下游明确要求时才使用；先拿到 `open_id`，再调用 `lark-cli api GET /open-apis/contact/v3/users/<open_id> --params '{"user_id_type":"open_id"}' --format json` 读取 `user_id` / `union_id`。
- 部门场景使用 `--member-type=opendepartmentid`：当前 CLI 没有 shortcut，需调用 `lark-cli api POST /open-apis/contact/v3/departments/search --as user --params '{"department_id_type":"open_department_id"}' --data '{"query":"<部门名>"}'` 获取 `open_department_id`。
- 只有在目标类型和身份都已确认可行后，才调用 `lark-cli wiki +member-add`。对于部门场景，这意味着必须是 `--as user`。

## 目标语义约束

- `我的文档库` / `My Document Library` / `我的知识库` / `个人知识库` / `my_library` 都应视为 **Wiki personal library**，不是 Drive 根目录
- 处理这类目标时，先解析 `my_library` 对应的真实 `space_id`，再执行 `wiki +move`、`wiki +node-create` 或其他 Wiki 写操作
- 不要因为缺少显式 `space_id` 就退化成 `drive +move`
- 如果用户明确说的是 Drive 文件夹、云空间（云盘/云存储）根目录、`我的空间`，再按源对象分流：源对象是 Wiki 节点时用 `wiki +move-to-drive`，源对象已在 Drive 时用 `drive +move`

## API Resources

```text
lark-cli schema wiki.<resource>.<method>   # 调用原生 API 前必须先查看 --data / --params 参数结构，不要猜测字段格式
lark-cli wiki <resource> <method> [flags]  # 调用 API
```

### spaces

- `create` — 创建知识空间
- `get` — 获取知识空间信息
- `list` — 获取知识空间列表

### members

- `create` — 添加知识空间成员
- `delete` — 删除知识空间成员
- `list` — 获取知识空间成员列表

### nodes

- `copy` — 创建知识空间节点副本
- `create` — 创建知识空间节点
- `list` — 获取知识空间子节点列表

## 不在本 skill 范围

- 上传文件到知识库节点下 → [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c)（`drive +upload --wiki-token`）
- 下载 Wiki 节点对应的文件（底层 `obj_type` 为 `file`）→ [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c)：`drive +download --wiki-token <node_token>` 或 `drive +download --url <wiki_url>`（CLI 会先把 Wiki 节点解析到底层文件再下载）；底层是 `docx`/`sheet`/`bitable`/`slides` 等在线文档时改用 `drive +export`
- 编辑文档正文内容 → [`lark-doc`](lark-doc-0.md#s-716f3f9ec728a423)
- 表格 / 多维表格数据操作 → [`lark-sheets`]（按模块名读取对应工作流） / [`lark-base`]（按模块名读取对应工作流）
- 按名称搜索文档 / Wiki / 表格文件、评论与权限管理 → [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c)
