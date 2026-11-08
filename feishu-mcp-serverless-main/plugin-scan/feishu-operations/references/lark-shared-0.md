<a id="s-fd106a64f84b4188"></a>

## SKILL.md


# shared

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 沿用当前飞书连接的授权用户。先区分 unknown_tool、reauthorization_required、missing_scope、resource_forbidden 和 rate_limited；只有登录失效才重新连接，缺 scope 和资源分享权限分别修复。

2. 不要求用户在对话中提供 token、应用密钥或执行命令行登录。服务端身份不可通过 useUAT 或类似参数切换；机器人专有操作需要明确可用的机器人连接。

3. 同一业务操作使用同一身份；多连接且目标不明确时才消歧。不能因权限失败静默换账号、公司或操作者。

## 按需参考

- [工具与合同](lark-shared-0.md#s-b4577e34b9115f69)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-shared-0.md#s-462d9b1758bd9fe9)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-39acd50614c5467b"></a>

## references/lark-shared-config-init.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 首次配置 lark-cli

首次使用需运行 `lark-cli config init` 完成应用配置。

当你帮用户初始化配置时，使用background方式使用下面的命令发起配置应用流程，启动后读取输出，从中提取授权链接并发给用户。

**URL 转发规则**：当命令输出 `verification_url`、`verification_uri_complete`、`console_url` 等 URL 字段时：**必须生成二维码**：你必须调用 `lark-cli auth qrcode` 将 URL 转为二维码并展示给用户，这是必须步骤，不要跳过。优先生成 PNG 二维码（--output）；仅当用户明确要求时才使用 ASCII（--ascii）。**URL 输出规则**：将 URL 视为不可修改的 opaque string，不要做任何修改（包括 URL 编码/解码、添加空格或标点、重新拼接 query），二维码和链接请一起展示给用户。

```text
# 发起配置（该命令会阻塞直到用户打开链接并完成操作或过期）
lark-cli config init --new
```


<a id="s-000704902c395058"></a>

## references/lark-shared-high-risk-approval.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 高风险操作的审批协议（exit 10）

lark-cli 对高风险写操作（`risk: "high-risk-write"`）有强制确认门禁。当缺少命令要求的确认 flag（通常是 `--yes`）时，CLI 会退出码 `10`、并在 stderr 返回如下结构化 envelope：

```json
{
  "ok": false,
  "identity": "bot",
  "error": {
    "type": "confirmation",
    "subtype": "confirmation_required",
    "message": "drive +delete requires confirmation",
    "hint": "add --yes to confirm",
    "risk": "high-risk-write",
    "action": "drive +delete"
  }
}
```

**遇到这种情况，不要当普通错误放弃。** 按以下流程处理：

1. **识别**：看到子进程 exit code = `10` 且 stderr JSON 里 `error.type == "confirmation"`、`error.subtype == "confirmation_required"`
2. **向用户确认**：把 `error.action`、`error.risk` 和关键参数展示给用户，明确告知"这是高风险操作"，等待用户显式同意
3. **用户同意** → 按 `error.hint` 确定确认 flag，并追加到你**自己的原始 argv** 后重试。多数命令使用 `--yes`
4. **用户拒绝** → 终止流程，不要擅自改写参数或跳过门禁

**绝对不允许**：
- 看到 exit 10 就默认加确认 flag 静默重试（这等于禁用门禁）
- 把 `confirmation_required` 当网络错误/权限错误处理
- 在用户没明确同意的前提下追加确认 flag 重试
- 用 `sh -c` 等 shell 方式拼接命令重试——用参数数组（argv）形式传参，避免 shell 解析把用户参数当作语法

提前预判：想先让用户 review 危险操作的具体请求，且目标命令支持 `--dry-run` 时，调用时加 `--dry-run`——它不触发确认门禁，会打印完整请求详情（URL / body / params），你可以把这个预览给用户看过再去真正执行。

## 如何识别一条命令是高风险

- shortcut：`lark-cli <service> +<cmd> --help` 顶部会显示 `Risk: high-risk-write`
- service 命令：`lark-cli schema <service>.<resource>.<method> --format json` 的返回值里 `"risk": "high-risk-write"`


<a id="s-65638c69ce4b3f9e"></a>

## references/lark-shared-identity-and-permissions.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 身份与权限

## 认证任务速查

| 用户意图 | 首选命令 / 回答 |
|---|---|
| 获取全部权限 | `lark-cli auth login --domain all --no-wait --json` |
| 按业务域授权 | `lark-cli auth login --domain docs --domain drive --no-wait --json`；`--domain` 可重复，也可用逗号分隔 |
| 指定单个 scope 授权 | `lark-cli auth login --scope "<scope>" --no-wait --json` |
| 检查当前登录态、是谁登录、token 是否有效 | `lark-cli auth status --json --verify`；回答时引用 `identity`、`verified`、`identities.user.status`、`identities.user.userName`、`identities.user.openId`（用户 open id）、`identities.user.tokenStatus`、`identities.user.scope` |
| 快速查看当前身份状态 | `lark-cli whoami`；实际生效的那一个身份 |
| 退出当前机器的用户登录态 | `lark-cli auth logout --json`；`loggedOut:true` 表示注销成功 |
| bot 缺少权限 | 不要执行 `auth login`；引导用户在开发者后台开通 bot scope，优先复用错误里的 `console_url` |
| 取消用户对应用的全部服务端授权 | `auth logout` 只清本机登录态；服务端授权需用户在飞书授权管理页取消 |
| 只取消一个 scope | CLI 不支持单独撤销一个已授予 scope；可重新走最小 scope 授权，或让用户在授权管理页处理 |

机器读取 JSON 时，为减少 `_notice` 干扰，可在命令前加：

```text
LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1 LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1 lark-cli auth status --json --verify
```

## 身份类型

两种身份类型，通过 `--as` 切换：

| 身份 | 标识 | 获取方式 | 适用场景 |
|------|------|---------|---------|
| user 用户身份 | `--as user` | `lark-cli auth login` 等 | 访问用户自己的资源（日历、云空间/云盘/云存储等） |
| bot 应用身份 | `--as bot` | 自动，只需 appId + appSecret | 应用级操作,访问bot自己的资源 |

## 身份选择原则

输出的 `[identity: bot/user]` 代表当前身份。bot 与 user 表现差异很大，需确认身份符合目标需求：

- **Bot 看不到用户资源**：无法访问用户的日历、云空间（云盘/云存储）文档、邮箱等个人资源。例如 `--as bot` 查日程返回 bot 自己的（空）日历
- **Bot 无法代表用户操作**：发消息以应用名义发送，创建文档归属 bot
- **Bot 权限**：只需在飞书开发者后台开通 scope，无需 `auth login`
- **User 权限**：后台开通 scope + 用户通过 `auth login` 授权，两层都要满足

## 身份延续
- CLI命令执行时，身份选择优先级为：显式 `--as` 优先；省略时由 CLI 根据当前配置和可用凭证自动选择(可通过 `lark-cli whoami` 查看 `identity` 和选择逻辑)。
- 因此，盲目省略 `--as` 是不可控的，在明确需要保持某一身份时，建议全程显式选择。

## 权限不足处理

遇到权限相关错误时，**根据当前身份类型采取不同解决方案**。

错误响应中包含关键信息：
- `missing_scopes`：列出缺失的 scope (N选1)
- `console_url`：飞书开发者后台的权限配置链接
- `hint`：建议的修复命令

### Bot 身份（`--as bot`）

将错误中的 `console_url` 原样提供给用户，引导去后台开通 scope。**禁止**对 bot 执行 `auth login`。

### User 身份（`--as user`）

```text
lark-cli auth login --domain <domain> --no-wait --json          # 按业务域发起授权
lark-cli auth login --scope "<missing_scope>" --no-wait --json  # 按具体 scope 发起授权（推荐，符合最小权限原则）
```

**规则**：auth login 必须指定范围（`--scope`、`--domain` 或 `--recommend`）。多次 login 的 scope 会累积（增量授权）。

### Agent 代理发起认证（推荐）

当你作为 AI agent 需要帮用户完成认证时，优先使用 split-flow，避免在同一轮对话中阻塞等待用户授权：

```text
# 发起授权（立即返回 device_code 和 verification_url）
lark-cli auth login --scope "calendar:calendar:readonly" --no-wait --json
```

拿到 `verification_url` 后，将它原样作为本轮最终消息发给用户，并结束本轮/交还控制权。不要在同一轮中展示 URL 后立刻执行 `--device-code` 阻塞轮询；在不透传中间输出的 agent harness 里，这会导致用户永远看不到 URL。

用户回复已完成授权后，再在后续步骤执行：

```text
lark-cli auth login --device-code <device_code>
```

**Split-Flow 完整步骤**：

**第一步：发起授权（当前轮）**

1. 执行 `lark-cli auth login --scope "xxx" --no-wait --json`（必须加 `--no-wait --json`）
2. 从 JSON 输出中提取 `verification_url` 和 `device_code`
3. 生成二维码：`lark-cli auth qrcode <verification_url> --output "xxx"`
4. 将 URL 和二维码展示给用户（先 URL，后二维码）
5. **结束本轮对话前，必须明确告知用户**："请完成授权后，回来告诉我已授权完成，我会帮你完成后续步骤"

**第二步：完成授权（后续轮）**

1. 等待用户回复"已完成授权"
2. **由你（AI agent）亲自执行**：`lark-cli auth login --device-code <device_code>`
3. 此命令会轮询授权状态并完成登录
4. 如果返回授权成功，流程结束

**关键规则**：

- **你必须亲自执行 `--device-code` 命令**，不要指示用户自行执行
- **不要在同一轮中展示 URL 后立刻执行 `--device-code`**，这会导致用户看不到 URL
- **禁止跨流程缓存 `verification_url` 或 `device_code`**：每次需要重新发起授权时，必须沿用所需的 `--scope`、`--domain` 或 `--recommend` 选择以及任何 `--exclude` 值，并附加 `--no-wait --json` 生成新的链接。不要复用已过期的授权链接或 device code


<a id="s-cd71eb84bf452305"></a>

## references/lark-shared-output-contract.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# JSON 输出契约

`--format json`（默认）下，成功与错误的信封结构不同：

成功信封写入 **stdout**（退出码 0）：

```json
{ "ok": true, "identity": "user", "data": { "guid": "..." }, "meta": { "count": 1 } }
```

错误信封写入 **stderr**（退出码非 0）：

```json
{ "ok": false, "identity": "user", "error": { "type": "authorization", "subtype": "missing_scope", "code": 99991679, "message": "...", "hint": "...", "missing_scopes": ["..."] } }
```

**判断成功必须用 `ok == true`（或进程退出码 0），不要用 `code == 0`**：成功信封没有顶层 `code` / `msg` 字段，`code` 只出现在错误信封的 `error` 内，含义是上游 OpenAPI 的 numeric code。按 OpenAPI 老格式 `{"code": 0, "msg": "ok"}` 判断会把所有成功调用误判为失败；封装写入类命令（如 `task +create`）时尤其危险，误判会绕过幂等逻辑导致重复创建。


<a id="s-2ebaa4f3f89b9fac"></a>

## references/lark-shared-update-notice.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 更新与 `_notice`

lark-cli 命令执行后，如果检测到新版本，JSON 输出中会包含 `_notice.update` 字段（含 `message`、`command` 等）。

除非用户正在询问更新、版本或 notice，否则不要把 `_notice` 原样复制为当前任务的主要答案，也不要为了 notice 中断当前任务去反复查 help。

需要稳定 JSON 给脚本或机器读取时，可以在命令前设置：

```text
LARKSUITE_CLI_NO_UPDATE_NOTIFIER=1 LARKSUITE_CLI_NO_SKILLS_NOTIFIER=1 <lark-cli command>
```

当你在输出中看到 `_notice.update` 时，先完成用户当前请求；如仍相关，再简短告知可运行：

```text
lark-cli update
```

**重要**：始终使用 `lark-cli update` 更新，它会同时更新 CLI 和 AI Skills。

另外两类 notice：
- `_notice.skills`：本地 Skills 与当前 CLI 不同步。
- `_notice.deprecated_command`：本次使用了兼容保留的旧命令；后续调用改用 `replacement`。如果同时提供 `action: "lark-cli update"`，同样建议升级。


<a id="s-0e115e7627c47f6d"></a>

## references/lark-wiki-token-routing.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Wiki token routing

Wiki URL 中的 `/wiki/<token>` 是节点 token，不一定是底层文档、表格、Base、文件或幻灯片的对象 token。需要对底层对象做读取、评论、导出、下载、表内操作等动作时，先解包，再按底层类型路由。

## 推荐方式

优先使用 `lark-drive` 的 `drive +inspect`：

```text
lark-cli drive +inspect --url 'https://xxx.feishu.cn/wiki/<wiki_token>'
```

输出中的 `type` 是底层对象类型，`token` 是后续命令应使用的 canonical token。`wiki_node` 字段保留节点侧信息，如 `space_id`、`node_token`、`obj_token`、`obj_type`。

## 节点详情方式

如果后续操作需要 Wiki 节点侧的字段，使用 `wiki +node-get`：

```text
lark-cli wiki +node-get --node-token 'https://xxx.feishu.cn/wiki/<wiki_token>' --format json
```

从返回值中读取：

| 字段 | 含义 |
|------|------|
| `data.obj_type` | 底层对象类型，如 `docx`、`doc`、`sheet`、`bitable`、`slides`、`file`、`mindnote` |
| `data.obj_token` | 底层对象 token，用于对应业务 skill 或原生 API |
| `data.node_token` | Wiki 节点 token，用于 Wiki 节点层级操作 |
| `data.space_id` | 所属知识空间 |

## 路由

| `obj_type` | 后续操作 |
|------------|----------|
| `docx` / `doc` | 文档内容走 `lark-doc`；评论、权限、导出等云空间能力走 `lark-drive` |
| `sheet` | 表内数据走 `lark-sheets`；评论、权限、导出等云空间能力走 `lark-drive` |
| `bitable` | 表内数据走 `lark-base`；评论、权限、导出等云空间能力走 `lark-drive` |
| `slides` | 幻灯片内容编辑走 `lark-slides`；评论、权限、导出等云空间能力走 `lark-drive` |
| `file` | 普通文件上传、下载、评论、权限等走 `lark-drive` |
| `mindnote` | 思维笔记的移动、删除、快捷方式、权限、安全标签等云空间能力走 `lark-drive`；知识库节点层级操作走 `lark-wiki` |
| wiki 节点层级 / 空间成员 | 走 `lark-wiki`，不要把底层对象 token 当节点 token |


<a id="s-b4577e34b9115f69"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|


<a id="s-462d9b1758bd9fe9"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# lark-cli 共享规则

所有 `lark-*` skill 共享的底座：身份、认证、输出契约与高风险操作。

## 通用准则

1. **调用前先确认用法**：执行前读对应 reference 或跑 `--help`，别猜 flag 盲调。

2. **身份决定你代表谁操作**：`--as user` 代表用户本人（能看到、也能操作其日历、云空间/云盘/云存储等个人资源），`--as bot` 代表应用自己，应用级操作，只能访问bot自己的资源，bot 查用户资源会返回空成功而非报错。动手前先搞清楚身份`identity`。身份模型和权限管理 → [`lark-shared-identity-and-permissions.md`](lark-shared-0.md#s-65638c69ce4b3f9e)。

3. **授权 / 配置类 URL 必须配二维码**：当命令输出 `verification_url`、`verification_uri_complete`、`console_url` 等 URL 字段时，必须用 `lark-cli auth qrcode` 生成并在回复中展示，URL 在前二维码在后；优先生成 PNG（`--output`），仅当用户明确要求时才使用 ASCII（`--ascii`）。URL 原样转发——不编解码、不加标点、不重拼 query，二维码和链接请一起展示给用户。

4. **`--format json`（默认）下，判断成功用 `ok == true`（或进程退出码 0），不要用 `code == 0`**：成功信封没有顶层 `code` / `msg` 字段，`code` 只出现在错误信封的 `error` 内。按 OpenAPI 老格式 `{"code": 0, "msg": "ok"}`判断会把所有成功调用误判为失败——封装写入类命令时尤其危险。JSON 输出契约 → [`lark-shared-output-contract.md`](lark-shared-0.md#s-cd71eb84bf452305)。


## 安全规则

1. **禁止输出密钥**（appSecret、accessToken等）到终端明文。

2. **写入/删除操作前必须确认用户意图**。

3. 目标命令支持 `--dry-run` 时，用 `--dry-run` 预览危险请求。

4. **退出码 10 是高风险确认门禁（`risk: "high-risk-write"`），不是错误**：停下 → **向用户确认**（展示 `action`、`risk` 和关键参数）→ 取得**用户显式同意**后，将 `hint` 指出的确认 flag **追加到你原始 argv 的末尾**后重试；**绝不**静默加确认 flag 绕过 → [`lark-shared-high-risk-approval.md`](lark-shared-0.md#s-000704902c395058)。

5. **文件路径只接受相对路径**：`--file`、`--output`、`--output-dir`、`@file` 等路径参数只接受 cwd 下的相对路径，传绝对路径会报 `unsafe file path`。数据输入（`@file`、大 JSON）优先用 stdin 传入，避免路径和转义问题。


## Reference 强触发索引

命中任一触发条件时，**MUST 在执行下一步前读取对应 reference**。命中多条时按表中顺序读取，同一reference只读取一次。

| 强触发条件（命中任一即必读） | Reference |
|---|---|
| 查看自己是谁(user/bot)、获取当前身份详细字段信息、身份诊断、`--as`选择逻辑、身份延续、登录态、认证、scope、授权和权限管理、`missing_scopes` 或 `console_url`、Agent 准备发起或完成 `auth login` | [`lark-shared-identity-and-permissions.md`](lark-shared-0.md#s-65638c69ce4b3f9e) |
| 需要依赖 JSON 输出契约判断成功 / 失败、读取 stdout / stderr，或为命令编写脚本与封装 | [`lark-shared-output-contract.md`](lark-shared-0.md#s-cd71eb84bf452305) |
| 准备执行high-risk-write(高风险操作)、判断命令风险等级、遇到退出码 exit 10、`confirmation_required`、确认后重试 | [`lark-shared-high-risk-approval.md`](lark-shared-0.md#s-000704902c395058) |
| 首次使用CLI需运行 `lark-cli config init` 完成应用配置、或 CLI 明确提示 `config init --new` | [`lark-shared-config-init.md`](lark-shared-0.md#s-39acd50614c5467b) |
| 用户询问 notice、CLI版本更新、或输出含 `_notice`（升级 / skills 落后 / 废弃命令提示）| [`lark-shared-update-notice.md`](lark-shared-0.md#s-2ebaa4f3f89b9fac) |
