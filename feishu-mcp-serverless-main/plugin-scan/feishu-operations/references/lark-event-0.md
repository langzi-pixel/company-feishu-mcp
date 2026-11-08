<a id="s-aead883e2e40767c"></a>

## SKILL.md


# event

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 订阅配置、接收器 ready、收到事件与停止状态分别核对。只有注册接口而没有实际消费者时，不能承诺后台持续监听。

2. 有可用事件读取工具时指定资源、事件类型、游标、上限与超时；记录断线、过期与可能丢失。不能用无限轮询占用普通工具调用。

3. 现有短请求服务没有常驻 WebSocket 消费者时明确运行条件；事件内容不是自动发送消息或写资源的授权。

## 按需参考

- [工具与合同](lark-event-0.md#s-48d406d7832d21a4)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-event-0.md#s-cdfdf19458982289)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-eebcb715c39149b8"></a>

## references/lark-event-application.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Application Events

This page covers Application-domain EventKeys supported by `lark-cli event`.

## `application.bot.menu_v6`

Triggered when a user clicks a custom bot menu item whose response action is configured as a push event.

Listen as the bot identity:

```text
lark-cli event consume application.bot.menu_v6 --as bot
```

Filter a specific menu event key:

```text
lark-cli event consume application.bot.menu_v6 --as bot --jq 'select(.event_key == "start_eval")'
```

Output is flattened at the top level:

| Field | Meaning |
|---|---|
| `type` | Event type, always `application.bot.menu_v6` |
| `event_id` | Globally unique event ID from the event header |
| `timestamp` | Event delivery time, preferring `header.create_time` |
| `app_id` | App ID from the event header |
| `tenant_key` | Tenant key from the event header |
| `event_key` | Developer-defined menu event key, for example `start_eval` |
| `menu_timestamp` | Menu click timestamp from the event body |
| `operator_id` | Operator open_id alias |
| `operator_open_id` | Operator open_id |
| `operator_union_id` | Operator union_id |
| `operator_user_id` | Operator user_id |
| `operator_name` | Operator display name |

This EventKey has no `--param`; use `--jq` to filter by `event_key` or operator fields.


<a id="s-dd2867a76a01c7fc"></a>

## references/lark-event-approval.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Approval Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).

## Key catalog (2)

| EventKey | Purpose |
|---|---|
| `approval.instance.status_changed_v4` | An approval instance status changed |
| `approval.task.status_changed_v4` | An approval task status changed |

Both keys use a **Custom schema**. The raw Lark schema 2.0 envelope is flattened: event metadata is exposed as `type`, `event_id`, and `timestamp`, while approval business fields are exposed at the top level.

Both keys carry a **PreConsume hook** that subscribes the current authorized user through the Approval subscription APIs before listening. The consumer intentionally does **not** unsubscribe on exit; the server-side Approval subscription relation remains until it is canceled outside `event consume`. These keys require `--as user`.

## Listener and subscription selection

At the raw CLI level, each `event consume` process accepts exactly one EventKey. `approval.instance.status_changed_v4` and `approval.task.status_changed_v4` have different output shapes, so listening to both still means two processes.

For Approval only, `subscription_type` is an optional setup param used by PreConsume to register server-side Approval subscription relations before the local listener starts. It is **not** an output field, a local event filter, or a local subscription identity. The pushed event does not say which subscription relation caused delivery, and one business event can match both relations; deduplicate with `event_id` when needed.

`subscription_type` may be omitted, a single value, a comma-separated list, or a JSON string array:

```text
# Omitted: register both INVOLVED_APPROVAL and MANAGED_APPROVAL for this EventKey
lark-cli event consume approval.instance.status_changed_v4 --as user

# Single relation
lark-cli event consume approval.instance.status_changed_v4 \
  -p subscription_type=INVOLVED_APPROVAL \
  --as user

# Explicit multi-relation registration for one local consumer
lark-cli event consume approval.task.status_changed_v4 \
  -p subscription_type=INVOLVED_APPROVAL,MANAGED_APPROVAL \
  --as user

# JSON array form; quote it for the shell
lark-cli event consume approval.task.status_changed_v4 \
  -p 'subscription_type=["INVOLVED_APPROVAL","MANAGED_APPROVAL"]' \
  --as user
```

| Value | Meaning |
|---|---|
| `INVOLVED_APPROVAL` | Receive events where the current user is the approval requester or approver |
| `MANAGED_APPROVAL` | Receive events under approval definitions managed by the current user |

User-intent inference:

| User intent | EventKey(s) | `subscription_type` |
|---|---|---|
| Mentions approval instances, approval forms, approval order/status, or "instance status" | `approval.instance.status_changed_v4` | infer from relation words below |
| Mentions approval tasks, approval todo items, approver operations, or "task status" | `approval.task.status_changed_v4` | infer from relation words below |
| Says "approval status changes/events" without saying task vs instance | both EventKeys | infer from relation words below |
| Says "my approvals", "approvals involving me", "I requested/approved", "待我审批", "我发起/我参与" | requested EventKey(s) | `INVOLVED_APPROVAL` |
| Says "approvals I manage", "managed definitions", "definitions managed by me", "我管理的审批定义" | requested EventKey(s) | `MANAGED_APPROVAL` |
| Explicitly asks for both involved and managed, or says "all approval subscriptions" | requested EventKey(s), or both if EventKey is also ambiguous | omit `subscription_type`, or pass both values in one `-p` |
| Relation is ambiguous and the user wants broad coverage | requested EventKey(s), or both if EventKey is also ambiguous | omit `subscription_type` so PreConsume registers both |

If the user's wording omits the relation and broad listening is acceptable, omit `subscription_type`. Ask only when registering both relations would be materially harmful.

## Scopes & auth

| EventKey | Scope | Auth |
|---|---|---|
| `approval.instance.status_changed_v4` | `approval:instance:read` | user |
| `approval.task.status_changed_v4` | `approval:task:read` | user |

## Subscription behavior

Startup calls the endpoint for the selected EventKey:

```text
POST /open-apis/approval/v4/instances/subscription
POST /open-apis/approval/v4/tasks/subscription
```

For each resolved `subscription_type`, PreConsume sends one request body:

```json
{"subscription_type":"INVOLVED_APPROVAL"}
```

If `subscription_type` is omitted, PreConsume sends two registration requests for that EventKey: one with `INVOLVED_APPROVAL`, then one with `MANAGED_APPROVAL`. If listening to both instance and task events, run two consumers; each consumer may omit `subscription_type` to register both relations for its own EventKey.

Do not start two consumers for the same Approval EventKey merely to split `INVOLVED_APPROVAL` and `MANAGED_APPROVAL`. The server push and flattened output are keyed by EventKey and cannot be distinguished by subscription relation.

Shutdown behavior:

`event consume` does not call the Approval unsubscribe APIs when it exits. This applies to graceful exit, Ctrl+C / SIGTERM, stdin EOF, `--timeout`, and `--max-events`.

To stop future delivery for a user, cancel the Approval subscription relation outside this consumer. The unsubscribe APIs are separate operations and are not called by `event consume`.

## Output fields

Common fields:

| Field | Type | Description |
|---|---|---|
| `type` | string | Event type |
| `event_id` | string | Globally unique event ID; use for deduplication |
| `timestamp` | string (timestamp_ms) | Event delivery time in milliseconds, taken from `header.create_time` |

Instance event fields:

| Field | Type | Description |
|---|---|---|
| `approval_code` | string | Approval definition code; not a subscription dimension |
| `instance_code` | string | Approval instance code |
| `external_id` | string | Third-party approval instance id, when present |
| `status` | string enum | `PENDING`, `APPROVED`, `REJECTED`, `CANCELED`, `DELETED`, `REVERTED`, `OVERTIME_CLOSE`, `OVERTIME_RECOVER` |
| `operate_time` | string (timestamp_ms) | Status change time |
| `start_user` | object | Instance starter user IDs, omitted when unavailable |
| `start_user.open_id` | string (open_id) | Instance starter open_id, when present |
| `start_user.union_id` | string (union_id) | Instance starter union_id, when present |
| `start_user.user_id` | string (user_id) | Instance starter tenant user_id, when present |

Task event fields:

| Field | Type | Description |
|---|---|---|
| `approval_code` | string | Approval definition code; not a subscription dimension |
| `instance_code` | string | Approval instance code |
| `task_id` | string | Approval task id |
| `external_id` | string | Third-party approval external id, when present |
| `task_external_id` | string | Third-party task external id, when emitted |
| `assigned_user` | object | Task assignee or operator user IDs, omitted for automatic flows without an operator |
| `assigned_user.open_id` | string (open_id) | Task assignee or operator open_id, when present |
| `assigned_user.union_id` | string (union_id) | Task assignee or operator union_id, when present |
| `assigned_user.user_id` | string (user_id) | Task assignee or operator tenant user_id, when present |
| `status` | string enum | `REVERTED`, `PENDING`, `APPROVED`, `REJECTED`, `TRANSFERRED`, `ROLLBACK`, `DONE`, `OVERTIME_CLOSE`, `OVERTIME_RECOVER` |
| `operate_time` | string (timestamp_ms) | Status change time |

## Examples

```text
# Stream approval instance updates broadly; registers both involved and managed relations
lark-cli event consume approval.instance.status_changed_v4 \
  --as user

# Stream approval instance updates only for approvals involving the current user
lark-cli event consume approval.instance.status_changed_v4 \
  -p subscription_type=INVOLVED_APPROVAL \
  --as user

# Stream approval task updates for definitions managed by the current user
lark-cli event consume approval.task.status_changed_v4 \
  -p subscription_type=MANAGED_APPROVAL \
  --as user

# Broad approval status listening:
# run both EventKeys as separate processes; omit subscription_type so each registers both relations.
lark-cli event consume approval.instance.status_changed_v4 \
  --as user > approval-instance.ndjson &
lark-cli event consume approval.task.status_changed_v4 \
  --as user > approval-task.ndjson &
wait

# Listen to both involved and managed task subscriptions with one local consumer.
lark-cli event consume approval.task.status_changed_v4 \
  -p subscription_type=INVOLVED_APPROVAL,MANAGED_APPROVAL \
  --as user > approval-task.ndjson

# Project a compact approval-task record
lark-cli event consume approval.task.status_changed_v4 \
  -p subscription_type=INVOLVED_APPROVAL \
  --as user \
  --jq '{event_id, task_id, status, at: .operate_time}'
```


<a id="s-2590d7881b5bbcf7"></a>

## references/lark-event-im.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# IM Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).
>
> **Heads-up for AI agents**: this key's `.content` is **NOT** the raw OAPI payload shape your training data may suggest. `lark-cli` runs a Process hook (`convertlib`) that flattens the V2 envelope and **pre-renders** `.content` to human-readable text for `text` / `post` / `image` / `file` / `audio` / etc. Only `interactive` (cards) keeps the raw JSON string. Don't blindly `fromjson`.

## Key catalog (12)

| EventKey | Purpose |
|---|---|
| `im.message.receive_v1` | Receive IM messages |
| `im.message.message_read_v1` | User read a bot's **p2p** message (group messages don't fire this) |
| `im.message.reaction.created_v1` | Reaction added to a message |
| `im.message.reaction.deleted_v1` | Reaction removed from a message |
| `im.chat.updated_v1` | Chat settings changed (owner, avatar, name, permissions, etc.) |
| `im.chat.disbanded_v1` | Chat disbanded |
| `im.chat.member.bot.added_v1` | Bot added to a chat |
| `im.chat.member.bot.deleted_v1` | Bot removed from a chat |
| `im.chat.member.user.added_v1` | User joined a chat (including topic chats) |
| `im.chat.member.user.deleted_v1` | User left voluntarily **or** was removed |
| `im.chat.member.user.withdrawn_v1` | Pending chat invite withdrawn (inviter canceled; user never actually joined) |
| `card.action.trigger` | Interactive card callback — button click, form submit, dropdown, etc. → see [`lark-im-card-action-reply.md`]（按模块名读取对应工作流） |

> **Shape**: All 12 events have a V2-enveloped raw payload. `lark-cli` flattens two of them — `im.message.receive_v1` and `card.action.trigger` — so their consumed output is flat (fields at `.xxx`). The other 10 are passed through as-is; use `.event.xxx` to access their fields.

## Gotchas (`im.message.receive_v1`)

**sender_id is open_id only**: the event payload carries no display name. Call the contact API separately if you need the sender's name.

**`.content` shape depends on `message_type`** (this key uses a flat Custom schema; see [`events/im/message_receive.go`](../../../events/im/message_receive.go)):

| message_type | `.content` shape | How to read |
|---|---|---|
| `text` / `post` / `image` / `file` / `audio` / `sticker` / `share_chat` / `share_user` / `media` / `system` | Human-readable text (convertlib-processed; `@mentions` resolved to display names) | Use `.content` directly |
| `interactive` (card) | Raw card JSON string (structured actions can't be losslessly flattened) | `.content \| fromjson` to get the card object |

**Do not blindly `fromjson`** — for non-interactive messages it fails with `jq: fromjson cannot be applied to "hello"` because `.content` isn't JSON-encoded.

```text
# text: .content is plain text — no fromjson needed
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.message_type=="text") | .content'

# interactive: .content is a JSON string — fromjson to parse
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.message_type=="interactive") | .content | fromjson'
```

## On-demand filter recipes

> **Default = no `--jq`.** Run `lark-cli event consume im.message.receive_v1 --as bot` to see every message. The recipes below are only for cases where the user has asked to narrow the stream.

### 1. Filter by chat type (p2p vs group)

`chat_type` is an enum with values `p2p` / `group`.

```text
# p2p only (direct messages)
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.chat_type=="p2p") | {from: .sender_id, msg: .content}'

# group only
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.chat_type=="group") | {chat: .chat_id, from: .sender_id, msg: .content}'
```

### 2. Filter by message type

```text
# text only — content is plain human-readable text
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.message_type=="text") | .content'

# interactive (card) only — parse the card body
lark-cli event consume im.message.receive_v1 --as bot \
  --jq 'select(.message_type=="interactive") | .content | fromjson'
```

### 3. Filter by sender (only one user's messages)

```text
# example: only messages from the given open_id
lark-cli event consume im.message.receive_v1 --as bot\
  --jq 'select(.sender_id=="ou_xxxxxxxxxxxxxxxxxxxxxxxxxx") | {msg_id: .message_id, text: .content}'
```

Get your own open_id via `lark-cli contact +get-user --as user`; other users' via `lark-cli contact +search-user`.

<a id="s-32afada9dab06d60"></a>

## references/lark-event-minutes.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Minutes Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).

## Key catalog (1)

| EventKey | Purpose |
|---|---|
| `minutes.minute.generated_v1` | A minute (妙记) has been generated |

This key uses a **Custom schema** (flat output at `.xxx`) and carries a **PreConsume hook** that auto-subscribes / unsubscribes via OAPI on first / last consumer.

## Scopes & auth

| EventKey | Scope | Auth |
|---|---|---|
| `minutes.minute.generated_v1` | `minutes:minutes.basic:read` | user |

Requires `--as user`.

## `minutes.minute.generated_v1`

### Output fields

| Field | Type | Description |
|---|---|---|
| `type` | string | Event type; always `minutes.minute.generated_v1` |
| `event_id` | string | Globally unique event ID; safe for deduplication |
| `timestamp` | string (timestamp_ms) | Event delivery time (ms timestamp string) |
| `minute_token` | string | Minute token |
| `title` | string | Minute title (enriched via detail API) |
| `minute_source` | object | Minute source metadata; only present when the source is a meeting |
| `minute_source.source_type` | string | Source type; only present when the source is a meeting (value: `meeting`) |
| `minute_source.source_entity_id` | string | Source entity ID (meeting ID); only present when the source is a meeting |

### Enrichment & degradation

The Process hook calls `GET /open-apis/minutes/v1/minutes/{minute_token}` to enrich `title`. If the detail API fails, this field is left empty — the base fields (`type`, `event_id`, `timestamp`, `minute_token`, `minute_source`) are always present.

`minute_source` is populated from the event payload directly (not the detail API), so it survives enrichment failures. Note: `minute_source` is only present when the minute originates from a meeting; for other sources (e.g. recording, local upload) this field is absent.

### Example

```text
lark-cli event consume minutes.minute.generated_v1 --as user

# Project title and token only (skip events where enrichment failed)
lark-cli event consume minutes.minute.generated_v1 --as user \
  --jq 'select(.title != "") | {minute_token, title}'

# Filter by source type
lark-cli event consume minutes.minute.generated_v1 --as user \
  --jq 'select(.minute_source.source_type == "meeting") | {minute_token, title}'
```


<a id="s-c7a29a7baef1e5e9"></a>

## references/lark-event-task.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Task Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).

## Key catalog (1)

| EventKey | Purpose |
|---|---|
| `task.task.update_user_access_v2` | A visible task has been created, deleted, or updated |

This key uses a **Native schema** (V2 envelope; output rooted at `.event`) and carries a **PreConsume hook** that calls the Task event subscription API before listening.

## Scopes & auth

| EventKey | Scope | Auth |
|---|---|---|
| `task.task.update_user_access_v2` | `task:task:read` | user, bot |

Supports `--as user` or `--as bot`.

- `--as user`: receive task updates visible to the current user through authorship, assignment, following, or other access.
- `--as bot`: receive task updates for tasks the application is responsible for.

## `task.task.update_user_access_v2`

### Subscription behavior

On startup, `event consume` calls:

```text
POST /open-apis/task/v2/task_v2/task_subscription?user_id_type=open_id
```

The Task subscription API has no matching unsubscribe endpoint in the current CLI metadata, so graceful exit has no cleanup call for this EventKey. Re-running the consumer repeats the subscribe call for the selected identity.

This EventKey is single-consumer per local bus subscription: start one `event consume task.task.update_user_access_v2` process for a given app/profile/identity at a time.

### Output fields (V2 envelope; root path `.event`)

| Field | Type | Description |
|---|---|---|
| `.header.event_id` | string | Globally unique event ID; safe for deduplication |
| `.header.create_time` | string (timestamp_ms) | Event creation time in milliseconds |
| `.event.event_types[]` | string enum | Task commit types included in this event |
| `.event.task_guid` | string (kind=task_guid) | Task GUID that changed |

Commit types:

```text
task_assignees_update
task_completed_update
task_create
task_deleted
task_desc_update
task_followers_update
task_reminders_update
task_start_due_update
task_summary_update
```

### Example

```text
# Stream task update events for the current user
lark-cli event consume task.task.update_user_access_v2 --as user

# Sample one event for payload inspection
lark-cli event consume task.task.update_user_access_v2 \
  --as user --max-events 1 --timeout 2m

# Project to a compact task-update record
lark-cli event consume task.task.update_user_access_v2 \
  --as user \
  --jq '{event_id: .header.event_id, task_guid: .event.task_guid, event_types: .event.event_types, timestamp: .header.create_time}'

# Consume as the app identity
lark-cli event consume task.task.update_user_access_v2 --as bot
```


<a id="s-b0f51ee51958174c"></a>

## references/lark-event-vc.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# VC Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).

## Key catalog (7)

| EventKey | Purpose |
|---|---|
| `vc.meeting.participant_meeting_started_v1` | A meeting the current user participates in has started |
| `vc.meeting.participant_meeting_joined_v1` | The current user has joined a meeting |
| `vc.meeting.participant_meeting_ended_v1` | A meeting the current user participates in has ended |
| `vc.note.generated_v1` | A note has been generated (meeting, recording, upload, etc.) |
| `vc.recording.recording_started_v1` | A recording_bean recording has started (Feishu software only) |
| `vc.recording.recording_transcript_generated_v1` | Recording_bean transcript items were generated (Feishu software only) |
| `vc.recording.recording_ended_v1` | A recording_bean recording ended and uploaded successfully (Feishu software only) |

All seven keys use a **Custom schema** (flat output) and carry a **PreConsume hook** that auto-subscribes / unsubscribes via OAPI on first / last consumer. All require `--as user`.

## Scopes & auth

| EventKey | Scope | Auth |
|---|---|---|
| `vc.meeting.participant_meeting_started_v1` | `vc:meeting.meetingevent:read` | user |
| `vc.meeting.participant_meeting_joined_v1` | `vc:meeting.meetingevent:read` | user |
| `vc.meeting.participant_meeting_ended_v1` | `vc:meeting.meetingevent:read` | user |
| `vc.note.generated_v1` | `vc:note:read` | user |
| `vc.recording.recording_started_v1` | `vc:recording:read` | user |
| `vc.recording.recording_transcript_generated_v1` | `vc:recording:read` | user |
| `vc.recording.recording_ended_v1` | `vc:recording:read` | user |

---

## Meeting participant events

Covered keys:

- `vc.meeting.participant_meeting_started_v1`
- `vc.meeting.participant_meeting_joined_v1`
- `vc.meeting.participant_meeting_ended_v1`

### Output fields

| Field | Type | Description |
|---|---|---|
| `type` | string | Event type; one of the covered meeting participant EventKeys |
| `event_id` | string | Globally unique event ID; safe for deduplication |
| `timestamp` | string (timestamp_ms) | Event delivery time (ms timestamp string) |
| `meeting_id` | string | Meeting ID |
| `topic` | string | Meeting topic |
| `meeting_no` | string | Meeting number |
| `start_time` | string | Meeting start time in RFC3339, converted to the local timezone |
| `calendar_event_id` | string | Calendar event ID associated with the meeting |
| `end_time` | string | Meeting end time in RFC3339, converted to the local timezone; only present for `vc.meeting.participant_meeting_ended_v1` |

### Gotchas

- `start_time` / `end_time` are **not** the raw unix-seconds from OAPI — the Process hook converts them to local-timezone RFC3339. If the raw value is empty or non-numeric, the field is left empty. `end_time` is emitted only for `vc.meeting.participant_meeting_ended_v1`.
- No detail API call is made; all fields come from the event payload itself.

### Example

```text
lark-cli event consume vc.meeting.participant_meeting_started_v1 --as user
lark-cli event consume vc.meeting.participant_meeting_joined_v1 --as user
lark-cli event consume vc.meeting.participant_meeting_ended_v1 --as user

# Project meeting topic and end time only
lark-cli event consume vc.meeting.participant_meeting_ended_v1 --as user \
  --jq '{meeting: .meeting_id, topic: .topic, ended: .end_time}'
```

---

## `vc.note.generated_v1`

Fires when a note is generated — not just from meetings, but also from realtime recordings and local file uploads.

### Output fields

| Field | Type | Description |
|---|---|---|
| `type` | string | Event type; always `vc.note.generated_v1` |
| `event_id` | string | Globally unique event ID; safe for deduplication |
| `timestamp` | string (timestamp_ms) | Event delivery time (ms timestamp string) |
| `note_id` | string | Note ID |
| `note_token` | string | Note document token; may be empty if detail is not yet available |
| `verbatim_token` | string | Verbatim document token; may be empty if detail is not yet available |
| `note_source` | object | Source metadata; only present when source is a meeting |
| `note_source.source_type` | string | Source type; only present when source is a meeting (value: `meeting`) |
| `note_source.source_entity_id` | string | Source entity ID (meeting ID); only present when source is a meeting |

### Source type semantics

| `source_type` | Trigger |
|---|---|
| `meeting` | Note generated from a meeting |

`note_source` (and its sub-fields) are only populated when `source_type` is `meeting`. For other sources the field is absent.

### Example

```text
lark-cli event consume vc.note.generated_v1 --as user

# Only notes with enriched tokens, skip incomplete ones
lark-cli event consume vc.note.generated_v1 --as user \
  --jq 'select(.note_token != "") | {note_id, note_token, verbatim_token}'

# Filter to meeting-sourced notes only
lark-cli event consume vc.note.generated_v1 --as user \
  --jq 'select(.note_source.source_type == "meeting") | {note_id, meeting_id: .note_source.source_entity_id}'
```


<a id="s-447e5716b0c91424"></a>

## references/lark-event-whiteboard.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Whiteboard Events

> **Prerequisite:** Read [`../SKILL.md`](lark-event-0.md#s-aead883e2e40767c) first for the `event consume` essentials (commands, subprocess contract, jq usage).

## Key catalog (1)

| EventKey | Purpose |
|---|---|
| `board.whiteboard.updated_v1` | A whiteboard has been edited |

This key uses a **Native schema** (V2 envelope; output rooted at `.event`) and carries a **PreConsume hook** that auto-subscribes / unsubscribes via OAPI on first / last consumer.

## Scopes & auth

| EventKey | Scope | Auth |
|---|---|---|
| `board.whiteboard.updated_v1` | `board:whiteboard:node:read` | user, bot |

Supports `--as user` or `--as bot`. The caller must have **manage** access to the target whiteboard, otherwise the subscribe OAPI returns 403 and `event consume` exits with an auth error before listening.

## `board.whiteboard.updated_v1`

### Per-whiteboard subscription

Unlike global event keys (e.g. minutes / im), this key subscribes **per whiteboard**: `event consume` calls `POST /open-apis/board/v1/whiteboards/{whiteboard_id}/subscribe` on startup with the `whiteboard_id` you pass via `-p`. **Required parameter**: `-p whiteboard_id=<whiteboard_token>`. Missing this param fails param validation up-front with `required param "whiteboard_id" missing for EventKey board.whiteboard.updated_v1` before any subscription happens.

Whiteboard token can be obtained via the docs OAPI [list document blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list): the block whose `block_type=43` is a whiteboard, and `block.token` is the whiteboard token.

### Output fields (V2 envelope; root path `.event`)

| Field | Type | Description |
|---|---|---|
| `.event.whiteboard_id` | string (kind=whiteboard_id) | Whiteboard token |
| `.event.operator_ids[].open_id` | string (kind=open_id) | Editor's open_id (`ou_` prefix) |
| `.event.operator_ids[].union_id` | string (kind=union_id) | Editor's union_id |
| `.event.operator_ids[].user_id` | string (kind=user_id) | Editor's user_id (only present when the caller's app has the user_id-related contact scope granted by the OAPI side) |

`operator_ids` is an array — multi-user collaborative editing within one tick collapses into a single event with multiple entries.

### Subscription lifecycle

| Phase | Behavior |
|---|---|
| Startup | `event consume` calls `subscribe` OAPI; on success stderr emits `[event] consuming as ...`, `[event] running pre-consume setup...`, `[event] listening for events (key=board.whiteboard.updated_v1)...`, then the AI-facing ready marker `[event] ready event_key=board.whiteboard.updated_v1` |
| Running | Edits to the whiteboard stream as NDJSON to stdout |
| Graceful exit (Ctrl+C / SIGTERM / `--max-events` / `--timeout` / stdin EOF) | `event consume` calls `unsubscribe` OAPI |
| `kill -9` | **Skips unsubscribe → server-side subscription leaks**, may cause `subscription already exists` or duplicate delivery on next consume. See SKILL.md "Never `kill -9`". |

### Example

```text
# Stream every edit on whiteboard <token> until Ctrl+C
lark-cli event consume board.whiteboard.updated_v1 \
    -p whiteboard_id=<whiteboard_token> \
    --as user

# Sample one event for payload inspection
lark-cli event consume board.whiteboard.updated_v1 \
    -p whiteboard_id=<whiteboard_token> \
    --as user --max-events 1 --timeout 2m

# Project to "edit summary": who edited which whiteboard
lark-cli event consume board.whiteboard.updated_v1 \
    -p whiteboard_id=<whiteboard_token> \
    --as user \
    --jq '{whiteboard: .event.whiteboard_id, editors: (.event.operator_ids | map(.open_id))}'
```


<a id="s-48d406d7832d21a4"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `mail.v1.publicMailbox.list` | [Feishu/Lark]-邮箱-公共邮箱-公共邮箱管理-查询所有公共邮箱-分页批量获取公共邮箱列表 | feishu_read_tool |
| `mail.v1.userMailboxEvent.subscribe` | [Feishu/Lark]-邮箱-事件-订阅事件-订阅事件 | feishu_call_tool |
| `mail.v1.userMailboxEvent.subscription` | [Feishu/Lark]-邮箱-事件-获取订阅状态-获取订阅状态 | feishu_read_tool |
| `mail.v1.userMailboxEvent.unsubscribe` | [Feishu/Lark]-邮箱-事件-取消订阅-取消订阅 | feishu_call_tool |
| `mail.v1.userMailboxFolder.create` | [Feishu/Lark]-邮箱-邮箱文件夹-创建邮箱文件夹-创建邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxFolder.delete` | [Feishu/Lark]-邮箱-邮箱文件夹-删除邮箱文件夹-删除邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxFolder.list` | [Feishu/Lark]-邮箱-邮箱文件夹-列出邮箱文件夹-列出邮箱文件夹 | feishu_read_tool |
| `mail.v1.userMailboxFolder.patch` | [Feishu/Lark]-邮箱-邮箱文件夹-修改邮箱文件夹-修改邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.create` | [Feishu/Lark]-邮箱-邮箱联系人-创建邮箱联系人-创建一个邮箱联系人 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.delete` | [Feishu/Lark]-邮箱-邮箱联系人-删除邮箱联系人-删除一个邮箱联系人 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.list` | [Feishu/Lark]-邮箱-邮箱联系人-列出邮箱联系人-列出邮箱联系人列表 | feishu_read_tool |
| `mail.v1.userMailboxMailContact.patch` | [Feishu/Lark]-邮箱-邮箱联系人-修改邮箱联系人信息-修改一个邮箱联系人的信息 | feishu_call_tool |
| `mail.v1.userMailboxMessageAttachment.downloadUrl` | [Feishu/Lark]-邮箱-用户邮件-邮件附件-获取附件下载链接-获取附件下载链接 | feishu_read_tool |
| `mail.v1.userMailboxMessage.get` | [Feishu/Lark]-邮箱-用户邮件-获取邮件详情-获取邮件详情 | feishu_read_tool |
| `mail.v1.userMailboxMessage.getByCard` | [Feishu/Lark]-邮箱-用户邮件-获取邮件卡片的邮件列表-获取邮件卡片下的邮件列表 | feishu_read_tool |
| `mail.v1.userMailboxMessage.list` | [Feishu/Lark]-邮箱-用户邮件-列出邮件-列出邮件 | feishu_read_tool |
| `mail.v1.userMailboxMessage.send` | [Feishu/Lark]-邮箱-用户邮件-发送邮件-发送邮件 | feishu_call_tool |
| `mail.v1.userMailboxRule.create` | [Feishu/Lark]-邮箱-收信规则-创建收信规则-创建收信规则 | feishu_call_tool |
| `mail.v1.userMailboxRule.delete` | [Feishu/Lark]-邮箱-收信规则-删除收信规则-删除收信规则 | feishu_call_tool |
| `mail.v1.userMailboxRule.list` | [Feishu/Lark]-邮箱-收信规则-列出收信规则-列出收信规则 | feishu_read_tool |
| `mail.v1.userMailboxRule.reorder` | [Feishu/Lark]-邮箱-收信规则-对收信规则进行排序-对收信规则进行排序 | feishu_call_tool |
| `mail.v1.userMailboxRule.update` | [Feishu/Lark]-邮箱-收信规则-更新收信规则-更新收信规则 | feishu_call_tool |
| `cli.mail.multi_entity.search` | Search contacts for composing email | feishu_call_tool |
| `cli.mail.user_mailboxes.accessible_mailboxes` | List accessible mailboxes | feishu_read_tool |
| `cli.mail.user_mailboxes.profile` | Get user email information | feishu_read_tool |
| `cli.mail.user_mailboxes.search` | Search email | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.cancel_scheduled_send` | Cancel scheduled transmission | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.create` | Create draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.delete` | Delete draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.get` | Get draft content | feishu_read_tool |
| `cli.mail.user_mailbox.drafts.list` | List of drafts | feishu_read_tool |
| `cli.mail.user_mailbox.drafts.send` | Send draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.update` | Update draft | feishu_call_tool |
| `cli.mail.user_mailbox.event.subscribe` | Subscribe to mail events | feishu_call_tool |
| `cli.mail.user_mailbox.event.subscription` | Get Subscription Status | feishu_read_tool |
| `cli.mail.user_mailbox.event.unsubscribe` | Cancel Subscribe | feishu_call_tool |
| `cli.mail.user_mailbox.folders.create` | Create Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.folders.delete` | Delete Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.folders.get` | Get mailbox folder information | feishu_read_tool |
| `cli.mail.user_mailbox.folders.list` | List Email Folders | feishu_read_tool |
| `cli.mail.user_mailbox.folders.patch` | Update Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.labels.create` | Create label | feishu_call_tool |
| `cli.mail.user_mailbox.labels.delete` | Delete label | feishu_call_tool |
| `cli.mail.user_mailbox.labels.get` | Get label information | feishu_read_tool |
| `cli.mail.user_mailbox.labels.list` | List label | feishu_read_tool |
| `cli.mail.user_mailbox.labels.patch` | Update label | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.create` | Create Email Contact | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.delete` | Delete Email Contact | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.list` | List Email Contacts | feishu_read_tool |
| `cli.mail.user_mailbox.mail_contacts.patch` | Modify Email Contact's Info | feishu_call_tool |
| `cli.mail.user_mailbox.message.attachments.download_url` | Get Attachment Download Links | feishu_read_tool |
| `cli.mail.user_mailbox.messages.batch_get` | Batch get email details | feishu_call_tool |
| `cli.mail.user_mailbox.messages.batch_modify` | Batch Modify Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.batch_trash` | Batch Trash Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.get` | Get Email Details | feishu_read_tool |
| `cli.mail.user_mailbox.messages.list` | List Emails | feishu_read_tool |
| `cli.mail.user_mailbox.messages.modify` | Modify Mail message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.send_status` | 查询邮件发送状态 | feishu_read_tool |
| `cli.mail.user_mailbox.messages.trash` | Trash Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.rules.create` | Create Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.rules.delete` | Delete Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.rules.list` | List Auto Filters | feishu_read_tool |
| `cli.mail.user_mailbox.rules.reorder` | Reorder Auto Filters | feishu_call_tool |
| `cli.mail.user_mailbox.rules.update` | Update Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.sent_messages.get_recall_detail` | Check the progress of email withdrawal | feishu_read_tool |
| `cli.mail.user_mailbox.sent_messages.recall` | Withdraw a sent email | feishu_call_tool |
| `cli.mail.user_mailbox.settings.send_as` | List send-as mailboxes | feishu_read_tool |
| `cli.mail.user_mailbox.template.attachments.download_url` | 获取指定邮件模板下的附件下载链接。用于在已知模板 ID 与附件 ID 的场景下，二次获取附件的有效访问 URL，便于在用户端预览或下载邮件模板中的附件资源 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.create` | 在指定用户邮箱下创建一份可复用的个人邮件模板。请求时需传入完整的模板对象（含名称、主题、正文、收件信息、附件等），创建成功后返回完整模板内容（含系统生成的 template_id），适用于将常用邮件内容沉淀为模板以便后续快速发送同类型邮件 | feishu_call_tool |
| `cli.mail.user_mailbox.templates.delete` | 永久删除指定用户邮箱下的某个个人邮件模板。删除操作不可恢复，删除后该模板将无法在「列出邮件模板」「获取邮件模板」等接口中再返回，常用于清理已废弃或不再使用的模板 | feishu_call_tool |
| `cli.mail.user_mailbox.templates.get` | 获取指定邮件模板的完整详情，包括模板名称、主题、正文（HTML 或纯文本）、收件人/抄送/密送地址、附件信息等所有字段。常用于编辑模板前回填表单，或在发送邮件场景下读取模板内容做二次填充 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.list` | 列出指定用户邮箱下的全部个人邮件模板基本信息（一次性返回，不分页），常用于在编辑或发送邮件场景下展示可选模板列表。如需获取模板正文与附件等完整字段，请通过获取个人邮件模板详情接口按 `template_id` 查询 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.update` | 以全量替换的方式更新指定邮件模板的所有字段（包括名称、主题、正文、附件、收件信息等）。本接口为「全量更新」语义：请求时需传入完整的模板对象，未携带的字段将被清空。调用依赖：如仅修改部分字段，请先调用获取个人邮件模板详情接口拿到完整模板，在本地修改后再传回本接口，以避免漏传字段导致数据丢失 | feishu_call_tool |
| `cli.mail.user_mailbox.threads.batch_modify` | Batch Modify Mail Threads | feishu_call_tool |
| `cli.mail.user_mailbox.threads.batch_trash` | Batch Trash Mail Thread | feishu_call_tool |
| `cli.mail.user_mailbox.threads.get` | Get Mail Thread Message List | feishu_read_tool |
| `cli.mail.user_mailbox.threads.list` | List Mail Thread | feishu_read_tool |
| `cli.mail.user_mailbox.threads.modify` | Modify Mail Thread | feishu_call_tool |
| `cli.mail.user_mailbox.threads.trash` | Delete Mail Thread | feishu_call_tool |


<a id="s-cdfdf19458982289"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Lark Events

> **Prerequisite:** Read [`../lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) first for authentication, `--as user/bot` switching, `Permission denied` handling, and safety rules.

## Core commands

| Command | Purpose |
|------|------|
| `lark-cli event list [--json]` | List all subscribable EventKeys |
| `lark-cli event schema <EventKey> [--json]` | Show an EventKey's params and output schema |
| `lark-cli event consume <EventKey> [flags]` | Blocking consume; events → stdout NDJSON |
| `lark-cli event status [--json] [--fail-on-orphan]` | Inspect the local bus daemon status |
| `lark-cli event stop [--all] [--force]` | Stop the bus daemon |


## Common flags

| Flag | Description |
|---|---|
| `--param key=value` / `-p` | Business params (repeatable; comma-separated for multi-value). Unknown keys fail with valid names listed inline |
| `--jq <expr>` | jq expression to filter / transform each event; empty output skips the event |
| `--max-events N` | Exit after N events. Default 0 = unlimited |
| `--timeout D` | Exit after duration D (e.g. `30s`, `2m`). Default 0 = no timeout. Whichever of `--max-events` / `--timeout` fires first wins |
| `--output-dir <dir>` | Write each event as a file (relative paths only; prevents traversal) |
| `--quiet` | Suppress ready/exit markers and per-event stderr diagnostics, including drop warnings. This can hide event loss. **AI should not use this** — it removes readiness and integrity signals |
| `--as user\|bot\|auto` | Identity for the session (see lark-shared) |


## Examples

```text
# Default: stream every event for the key (no filter, no projection)
lark-cli event consume im.message.receive_v1 --as bot

# List every EventKey of one domain (the authoritative, always-current catalog)
lark-cli event list --domain vc --json

# Grab one sample event to inspect payload shape
lark-cli event consume im.message.receive_v1 --max-events 1 --timeout 30s --as bot

# Run for 10 minutes then auto-exit
lark-cli event consume im.message.receive_v1 --timeout 10m --as bot

# Consume multiple EventKeys concurrently (one shape per process, no dispatcher)
lark-cli event consume im.message.receive_v1          --as bot > receive.ndjson &
lark-cli event consume im.message.reaction.created_v1 --as bot > reaction.ndjson &
wait

```

## Call flow

1. `lark-cli event list --json` → pick a legal key. `--domain <d>` narrows to one domain; the domains are `application`, `approval`, `board`, `card`, `im`, `minutes`, `task`, `vc`. An unknown domain fails with the valid set listed in the hint.
2. `lark-cli event schema <key> --json` → read `resolved_output_schema` + `jq_root_path` to determine field paths
3. `lark-cli event consume <key> [--jq '<expr>']` → consume

## Subprocess contract

### Ready marker

`event consume`'s stderr emits a fixed line `[event] ready event_key=<key>`. **Parent processes should block on stderr until this line appears, then start reading stdout.** Do not fall back to `sleep`.

### stdin EOF = graceful exit

`event consume` treats stdin close as a shutdown signal (wired for AI subprocess callers). **Bounded runs are exempt: when `--max-events` or `--timeout` is set (> 0), stdin EOF is ignored and the run exits only via its own bound, timeout, or SIGTERM.** For unbounded runs, `< /dev/null` / `nohup` / systemd's default `StandardInput=null` will cause an immediate graceful exit (stderr `reason: signal`). To keep an unbounded run alive:

- Feed stdin a source that never EOFs: `< <(tail -f /dev/null)`
- Or run bounded: `--max-events N` / `--timeout D`

### Exit codes & reason

On exit, the last stderr line is `[event] exited — received N event(s) in Xs (reason: ...)`.

| exit code | reason | Trigger |
|---|---|---|
| 0 | `reason: limit` | `--max-events` reached |
| 0 | `reason: timeout` | `--timeout` reached |
| 0 | `reason: signal` | Ctrl+C / SIGTERM / stdin EOF (stdin EOF applies to unbounded runs only) |
| 1 | JSON error envelope on stderr | Lark API business failure during pre-consume setup (for example subscription create/delete) |
| 2 | JSON error envelope on stderr (no `exited` line) | Validation failure (unknown EventKey, bad `--param` / `--jq`, another bus already connected) |
| 3 | JSON error envelope on stderr | Auth failure (missing token, missing scopes) |
| 4 / 5 | JSON error envelope on stderr | Network / internal failure (bus startup, handshake, file I/O) |

Startup and runtime failures emit a structured JSON envelope on stderr: `{"ok":false,"error":{"type","subtype","param","message","hint",...}}` (the envelope may also carry top-level `identity` / `_notice` siblings). Parse `error.type` / `error.subtype` to branch (e.g. `missing_scope` carries a `missing_scopes` list), `error.param` to find the offending flag, and `error.hint` for the recovery action — do not regex-match message text.

Orchestrators should treat `reason: limit/timeout/signal` (all exit 0) as "business completion" and non-zero as "failure".

### Never `kill -9`

**Avoid `kill -9` on consume processes** for EventKeys whose PreConsume registers a server-side subscription **and** unsubscribes on exit (minutes, vc, board keys): `kill -9` skips the OAPI unsubscribe and leaks the server-side subscription (symptoms: "subscription already exists" on restart, duplicate event delivery). Keys whose subscription is a durable relation with no cleanup (task, approval keys) do not leak this way, but SIGTERM or closing stdin remains the right shutdown for every key.

### One consume, one EventKey (multi-key = multi-shell)

The command takes exactly one positional argument; `k1,k2` and wildcards are unsupported. Listening to N keys means N subprocesses — this is **intentional**:

- One shape per process stdout; no dispatcher logic required in the AI
- Fault isolation (one key failing doesn't affect others)
- Independent `--as` / `--jq` / `--max-events` / `--timeout` per key

All N consumers share a single bus daemon (UDS local IPC), so the overhead is small

## Writing jq via schema

`event schema <key> --json` is the source of truth for writing `--jq`. Four things to look at:

**(1) Where fields start** — see `jq_root_path`

- Value `"."` → fields are at the top level, write `.chat_id`
- Value `".event"` → fields are inside a V2 envelope, write `.event.chat_id`

**(2) Field list and types** — see `resolved_output_schema.properties.<name>`

Each field carries `type` / `description`, and some also have `format`. Snippet (from `event schema im.message.receive_v1 --json`):

```json
{
  "chat_id":     {"type":"string", "format":"chat_id",      "description":"Chat ID, prefixed with oc_"},
  "sender_id":   {"type":"string", "format":"open_id",      "description":"Sender open_id, prefixed with ou_"},
  "create_time": {"type":"string", "format":"timestamp_ms", "description":"Send time as ms-epoch string"}
}
```

**(3) Field semantics** — see the `format` tag

Lark-defined semantic tags (**not** JSON Schema's standard `format`). Common values: `open_id` / `chat_id` / `message_id` / `timestamp_ms` / `email`. Purpose: distinguish "same string type, different meanings" fields so you can reverse-lookup via API or convert formats.

**(4) Decoded state** — read the field's `description`

`event consume` runs Process hooks that may pre-decode some payload fields (flattening V2 envelopes, rendering `.content` to plain text, etc.) — behavior differs from raw OAPI. **Always read the field's `description` before writing jq**, especially for generic field names like `content` / `data` / `body` / `payload`.

**Why it matters**: blindly applying `fromjson` to an already-decoded text field makes jq error on every event and silently drop it — the consumer looks alive but emits nothing, with only a single `WARN` line buried on stderr. (This is the general behavior: any jq runtime error skips the event with a one-line WARN; the loop does not abort.)

**Don't shortcut the schema**: when projecting `event schema --json` with jq, do not strip `.description` from `properties` — that's the field that tells you whether a field is already decoded. Dump the full property objects, not just keys.

---

**Aside**: `--param`'s valid parameters also live in the schema — the `params` section lists `name` / `type` / `required` / `enum` / `default` / `description`; **section missing = this key accepts no `--param`**.

## Topic index

| Topic      | Reference                                                                    | Coverage |
|------------|------------------------------------------------------------------------------|---|
| Application | [`references/lark-event-application.md`](lark-event-0.md#s-eebcb715c39149b8) | Catalog of Application EventKeys, including `application.bot.menu_v6` for custom bot menu push events + flattened `event_key` / operator fields + jq recipe |
| Approval   | [`references/lark-event-approval.md`](lark-event-0.md#s-dd2867a76a01c7fc)     | Catalog of 2 Approval EventKeys (`approval.instance.status_changed_v4`, `approval.task.status_changed_v4`) + optional/multi `subscription_type` pre-registration + user-auth subscription lifecycle + flat output field reference |
| IM         | [`references/lark-event-im.md`](lark-event-0.md#s-2590d7881b5bbcf7)                 | Catalog of 12 IM EventKeys + shape notes (flat vs V2 envelope) + `im.message.receive_v1` field gotchas (`sender_id` is open_id only; `.content` is plain text except for `interactive` cards) + common jq recipes (filter by chat_type / message_type / sender); for `card.action.trigger` see also [`../lark-im/references/lark-im-card-action-reply.md`]（按模块名读取对应工作流） |
| Task       | [`references/lark-event-task.md`](lark-event-0.md#s-c7a29a7baef1e5e9)             | Catalog of 1 Task EventKey (`task.task.update_user_access_v2`) + Native V2 envelope shape + task commit types + user/bot subscription notes |
| VC         | [`references/lark-event-vc.md`](lark-event-0.md#s-b0f51ee51958174c)                 | Catalog of 7 VC EventKeys (meeting lifecycle `participant_meeting_started/joined/ended_v1`, `vc.note.generated_v1`, recording `recording_started/transcript_generated/ended_v1`) + field reference + source type semantics; the live list is always `lark-cli event list --domain vc --json` |
| Minutes    | [`references/lark-event-minutes.md`](lark-event-0.md#s-32afada9dab06d60)       | Catalog of 1 Minutes EventKey (`minutes.minute.generated_v1`) + field reference + source type semantics (meeting only) |
| Whiteboard | [`references/lark-event-whiteboard.md`](lark-event-0.md#s-447e5716b0c91424) | Catalog of 1 Board EventKey (`board.whiteboard.updated_v1`) + per-whiteboard subscription model (requires `-p whiteboard_id=<token>`) + payload field reference (whiteboard_id / operator_ids triple-id) |
