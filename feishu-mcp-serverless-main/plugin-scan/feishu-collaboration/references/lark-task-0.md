<a id="s-c03ee45b65ed2a9e"></a>

## SKILL.md


# task

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先读任务/清单，使用 guid 定位。任务完成、重新打开、删除是不同操作；更新同一任务并保留负责人、清单和用户未要求改变的字段。

2. 汇总未完成任务时明确范围与分页，重复或子任务关系保留。截止时间按用户时区处理，日期与具体时刻不能混淆。

3. 查询或整理计划不自动创建任务、提醒或评论；写入仅执行用户已明确要求的动作。附件上传成功与任务关联成功分别确认。

## 按需参考

- [工具与合同](lark-task-0.md#s-69236b7e5f12c696)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-task-0.md#s-acd30b0dd9b2329b)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-f883a7c6783ae66b"></a>

## references/lark-task-assign.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +assign

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Assign or remove members (assignees) from a task.

## Recommended Commands

```text
# Add an assignee
lark-cli task +assign --task-id "<task_guid>" --add "ou_aaa"

# Add an app assignee
lark-cli task +assign --task-id "<task_guid>" --add "cli_xxx"

# Transfer an assignee (remove old, add new)
lark-cli task +assign --task-id "<task_guid>" --remove "ou_old" --add "ou_new"

# Add multiple assignees
lark-cli task +assign --task-id "<task_guid>" --add "ou_aaa,ou_bbb"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to modify. For Feishu task applinks, use the `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |
| `--add <ids>` | No | Comma-separated assignee IDs. Use user `open_id`s like `ou_xxx` for people, or app IDs like `cli_xxx` for apps. |
| `--remove <ids>` | No | Comma-separated assignee IDs. Use user `open_id`s like `ou_xxx` for people, or app IDs like `cli_xxx` for apps. |

## Workflow

1. Confirm the task and members to add/remove.
2. Execute the command.
3. Report success and the new count of assignees.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-5b7d661e171eca2f"></a>

## references/lark-task-comment.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +comment

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Add a comment to an existing task.

## Recommended Commands

```text
# Add a comment
lark-cli task +comment --task-id "<task_guid>" --content "Looks good!"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to comment on. For Feishu task applinks, use the `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |
| `--content <text>` | Yes | The text content of the comment. |

## Workflow

1. Confirm the task and comment content.
2. Execute `lark-cli task +comment --task-id "..." --content "..."`
3. Report success and comment ID.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-f3d302a71f10f132"></a>

## references/lark-task-complete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +complete

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Mark a task as completed.

## Recommended Commands

```text
# Complete a task
lark-cli task +complete --task-id "<task_guid>"

# A task applink is accepted directly; the CLI extracts its guid query value
lark-cli task +complete --task-id "https://applink.larksuite.com/client/todo/task?guid=<task_guid>"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid-or-applink>` | Yes | Task OpenAPI GUID or a task applink containing `guid=`. Display task IDs such as `t104121` / `suite_entity_num` are rejected. |

## Workflow

1. Confirm the task to complete.
2. Execute the command.
3. Read `data.status`, `data.completed_at`, and `data.already_completed` from the result. `already_completed: true` means the shortcut observed an already-completed task and skipped the PATCH.
4. Do not routinely call `task tasks get` when the result already reports `status: done` and a non-zero `completed_at`. Query details only if confirmation fields are absent or the user explicitly asks for a full verification.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-75f7806fdf31c36f"></a>

## references/lark-task-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +create

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Create a new task in Lark.

## Recommended Commands

```text
# Create a task with all details
lark-cli task +create \
  --summary "Quarterly Sales Review" \
  --description "Review the sales performance for the last quarter." \
  --assignee "ou_xxx" \
  --due "2026-03-25" \
  --tasklist-id "https://applink.larkoffice.com/client/todo/task_list?guid=a4b00000-000-000-000-00000000036c"

# Create a task assigned to an app
lark-cli task +create \
  --summary "Nightly Sync" \
  --assignee "cli_xxx"

# Create a simple task
lark-cli task +create \
  --summary "Buy milk"

# Create a milestone by passing an API field without a named flag
lark-cli task +create \
  --summary "Release v2.0" \
  --due "2026-08-15" \
  --data '{"is_milestone":true}'

# Preview the API call without executing
lark-cli task +create --summary "Test Task" --dry-run
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--summary <text>` | Yes | The title or summary of the task |
| `--description <text>` | No | Detailed description of the task |
| `--assignee <id>` | No | Assignee ID. Use user `open_id` like `ou_xxx` for people, or app ID like `cli_xxx` for apps. |
| `--follower <id>` | No | Follower ID. Use user `open_id` like `ou_xxx` for people, or app ID like `cli_xxx` for apps. |
| `--due <time>` | No | Due date. Supports ISO 8601, `YYYY-MM-DD`, relative time (e.g., `+2d`), or ms timestamp. `YYYY-MM-DD` and relative time will automatically set it as an all-day task. |
| `--tasklist-id <id>` | No | The GUID of the tasklist, or a full AppLink URL (the CLI will automatically extract the `guid` parameter from the URL). |
| `--idempotency-key <key>` | No | Client token to ensure idempotency of the request. |
| `--data <json>` | No | JSON object merged into the task create request for API fields without dedicated flags, such as `{"is_milestone":true}`. Explicit named flags override same-named fields in this object. |
| `--dry-run` | No | Preview the API call (JSON payload) without actually creating the task. |

> **Required:** If `task +create` has no dedicated flag for a field requested by the user, first inspect `lark-cli schema task.tasks.create`, then add that field to `--data` using the exact field name, type, and nesting from the Meta API request-body schema. Do not omit requested fields or guess their JSON shape. Keep fields already supplied through dedicated flags out of `--data`.

Prefer this shortcut over the raw `tasks create` command when `--data` can express the request. Do not assume that other shortcuts support `--data`; check each shortcut's `--help` output first.

## Workflow

1. Confirm with the user: task summary, due date, assignee, and tasklist if necessary.
   - **Crucial Rule for Assignee**: If the user explicitly or implicitly says "create a task for me" (给我创建一个任务), or "help me create a task" (帮我新建/创建一个任务), you MUST assign the task to the current logged-in user. You can get the current user's `open_id` by executing `lark-cli auth status` (it already outputs JSON by default, so do not add `--json`) or `lark-cli contact +get-user` first, extracting `.identities.user.openId` (from `auth status`) or `.data.user.open_id` (from `contact +get-user`), and then passing it to the `--assignee` parameter.
2. Execute `lark-cli task +create --summary "..." ...`
3. Judge success by `ok == true` in the stdout JSON (the success envelope has no `code` field — do not test `code == 0`), then report the result: task ID (`data.guid`) and summary.

Example success response:

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "guid": "e297d3d0-4b60-4a5f-a4d4-xxxxxxxxxxxx",
    "url": "https://applink.larkoffice.com/client/todo/detail?guid=e297d3d0-4b60-4a5f-a4d4-xxxxxxxxxxxx"
  }
}
```

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.

## References

- [lark-task](lark-task-0.md#s-c03ee45b65ed2a9e) -- All task commands
- [lark-shared]（按模块名读取对应工作流） -- Authentication and global parameters


<a id="s-9935a7c539c9776a"></a>

## references/lark-task-followers.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +followers

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Manage task followers. Add or remove followers from an existing task.

## Recommended Commands

```text
# Add a follower
lark-cli task +followers --task-id "<task_guid>" --add "ou_aaa"

# Add an app follower
lark-cli task +followers --task-id "<task_guid>" --add "cli_xxx"

# Remove a follower
lark-cli task +followers --task-id "<task_guid>" --remove "ou_aaa"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to modify. For Feishu task applinks, use the `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |
| `--add <ids>` | No | Comma-separated follower IDs. Use user `open_id`s like `ou_xxx` for people, or app IDs like `cli_xxx` for apps. |
| `--remove <ids>` | No | Comma-separated follower IDs. Use user `open_id`s like `ou_xxx` for people, or app IDs like `cli_xxx` for apps. |

## Workflow

1. Confirm the task and followers to add/remove.
2. Execute the command.
3. Report success.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-4ac34fd06222b7d3"></a>

## references/lark-task-get-my-tasks.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +get-my-tasks

If the user query only specifies a task name (e.g., "Complete task Lobster No. 1"), use this command to list and search for the task by its summary.

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.
> 
> **⚠️ Note:** This API must be called with a user identity. **Do NOT use an app identity, otherwise the call will fail.**
>
> **Output rendering note:**
> 1. If you need to present user fields (assignee, creator, etc.), do not only output the raw `id` (e.g. open_id). Also try to resolve and display the user's real name (e.g. via the contact skill) for readability.
> 2. When rendering timestamps (e.g. created time, due time), use the local timezone. Format is 2006-01-02 15:04:05

List tasks assigned to the current user, with support for filtering by completion status, creation time, and due date.
By default, the command will automatically paginate up to 20 times. Use `--page-all` to fetch more (up to 40 pages).

> **Pending vs all tasks:** When `--complete` is not provided, the result contains **both completed and incomplete tasks**.
> For standup / daily-summary / pending-todo scenarios, you **must** pass `--complete=false`; otherwise completed tasks will be surfaced as if they were still pending.

## Recommended Commands

```text
# Search for a specific task by name
lark-cli task +get-my-tasks --query "Lobster No. 1"

# Get all my tasks, both completed and incomplete (fetches up to 20 pages by default)
lark-cli task +get-my-tasks

# Pending-only: my incomplete tasks (use this for standup/daily-summary)
lark-cli task +get-my-tasks --complete=false

# Pending-only with a due-date upper bound (e.g. end of today / this week)
lark-cli task +get-my-tasks --complete=false --due-end "2026-03-27T23:59:59+08:00"

# Fetch all my tasks (up to 40 pages)
lark-cli task +get-my-tasks --page-all

# Fetch up to 10 pages
lark-cli task +get-my-tasks --page-limit 10

# Resume from a known page token
lark-cli task +get-my-tasks --page-token "pt_xxx"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--query <string>` | No | Search for tasks by summary. Returns exact matches if any; otherwise returns partial matches. |
| `--complete=<bool>` | No | Optional. If not provided, it fetches all tasks (both incomplete and completed). Set to `true` to fetch only completed tasks, or `false` for incomplete tasks. |
| `--created_at <string>` | No | Query tasks created after this time. Supports date: `YYYY-MM-DD`, relative: `-2d`, or ms timestamp. |
| `--due-start <string>` | No | Query tasks with a due date after this time. Supports date: `YYYY-MM-DD`, relative: `-2d`, or ms timestamp. |
| `--due-end <string>` | No | Query tasks with a due date before this time. Supports date: `YYYY-MM-DD`, relative: `-2d`, or ms timestamp. |
| `--page-all` | No | Automatically paginate through all pages (max 40). |
| `--page-limit <int>` | No | Max page limit (default 20). |
| `--page-token <string>` | No | Start from the specified page token (useful for resuming a previous query). |

## Workflow

1. Determine the filters based on the user's request.
2. Execute the command. The CLI will automatically loop up to the specified limit (default 20, or 40 with `--page-all`) to fetch records.
3. Show the results (ID, summary, due time, and created date).


<a id="s-69941e2c1c20a721"></a>

## references/lark-task-get-related-tasks.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +get-related-tasks

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.
>
> **⚠️ Note:** This API must be called with a user identity. **Do NOT use an app identity, otherwise the call will fail.**
>
> **Pagination / Time Cursor Rule:**
> In `+get-related-tasks`, `page_token` is the task `updated_at` cursor in microseconds.
>
> **Execution Priority:**
> 1. If the request contains a start/end time boundary (for example, "今年以来", "最近一个月", "从 3 月 1 日开始"), first convert the **start time** boundary to a microsecond `page_token` and query from that token.
> 2. Continue pagination using returned `page_token` until `has_more=false`, but never exceed 40 total page fetches.
> 3. Do NOT default to `--page-all` for time-bounded queries.
>
> Only use `--page-all` from the beginning when:
> 1. the user explicitly asks for a full scan of all related tasks, or
> 2. no time boundary can be inferred from the request.

List tasks related to the current user.

## Recommended Commands

```text
# List all related tasks
lark-cli task +get-related-tasks

# List incomplete related tasks starting from a page token
lark-cli task +get-related-tasks --include-complete=false --page-token "1752730590582902"

# Show only tasks created by me
lark-cli task +get-related-tasks --created-by-me
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--include-complete=<bool>` | No | Default behavior includes completed tasks. Set to `false` to keep only incomplete tasks. |
| `--page-all` | No | Automatically paginate through all pages (max 40). |
| `--page-limit <int>` | No | Max page limit (default 20). |
| `--page-token <string>` | No | Start from the specified page token. This token is the task's last update time cursor in microseconds. |
| `--created-by-me` | No | Keep only tasks whose creator is the current user. This is a client-side filter applied after fetching related-task pages. |
| `--followed-by-me` | No | Keep only tasks followed by the current user. This is a client-side filter applied after fetching related-task pages. |

> **Page Token Note:** In `+get-related-tasks`, the `page_token` is a microsecond-level cursor representing the task's last update time. For example, `1752730590582902` should be treated as an updated-at cursor, not a task ID.
>
> **Pagination Note for Client-side Filters:** When `--created-by-me` or `--followed-by-me` is used, filtering happens locally after each upstream related-task page is fetched. The returned `has_more` and `page_token` still describe the upstream cursor, so later pages may contain more matching tasks, or may contain none.

## Workflow

1. Determine whether the user needs all related tasks or a filtered subset.
2. Execute `lark-cli task +get-related-tasks ...`
3. Report the matching tasks and, if present, the next `page_token`.


<a id="s-2e77f79dada77863"></a>

## references/lark-task-reminder.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +reminder

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.
> **Priority:** For creating or modifying task reminder times, prioritize using this `+reminder` shortcut over other task update methods. It provides a more reliable and direct way to manage reminders.

Manage task reminders. Set new reminders or remove existing ones. Note that setting a task reminder requires a due date.

## Recommended Commands

```text
# Set a reminder (e.g., 30 minutes before due)
lark-cli task +reminder --task-id "<task_guid>" --set "30"

# Set a reminder (e.g., 1 hour before due)
lark-cli task +reminder --task-id "<task_guid>" --set "1h"

# Remove all reminders
lark-cli task +reminder --task-id "<task_guid>" --remove "true"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to modify. For Feishu task applinks, use the `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |
| `--set <val>` | No | Relative fire minutes before the due time. Supports numbers (e.g., `30`) or units (e.g., `15m`, `1h`, `1d`). |
| `--remove <bool>` | No | If set to `true`, removes all existing reminders from the task. |

## Workflow

1. Confirm the task and reminder action.
2. Execute the command.
3. Report success.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-92d4bdcf51890429"></a>

## references/lark-task-reopen.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +reopen

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Reopen a previously completed task.

## Recommended Commands

```text
# Reopen a task
lark-cli task +reopen --task-id "<task_guid>"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to reopen. For Feishu task applinks, use the `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |

## Workflow

1. Confirm the task to reopen.
2. Execute the command.
3. Report success.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-62fa529d316435b2"></a>

## references/lark-task-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +search

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.
>
> **⚠️ Note:** This API must be called with a user identity. **Do NOT use an app identity, otherwise the call will fail.**

Search tasks by keyword and optional filters.

## Recommended Commands

```text
# Search by keyword
lark-cli task +search --query "test"

# Search incomplete tasks assigned to specific users
lark-cli task +search --assignee "ou_xxx,ou_yyy" --completed=false

# Search by due time range
lark-cli task +search --query "release" --due "-1d,+7d"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--query <string>` | No | Search keyword. If omitted, at least one filter must be provided. |
| `--creator <ids>` | No | Creator open_ids, comma-separated. |
| `--assignee <ids>` | No | Assignee open_ids, comma-separated. |
| `--follower <ids>` | No | Follower open_ids, comma-separated. |
| `--completed=<bool>` | No | Filter by completion state. |
| `--due <range>` | No | Due time range in `start,end` form. Each side supports ISO/date/relative/ms input. |
| `--page-token <string>` | No | Page token for pagination. |
| `--page-all` | No | Automatically paginate through all pages (max 40). |
| `--page-limit <int>` | No | Max page limit (default 20). |

## Workflow

1. Build the keyword and filters from the user's request.
2. Execute `lark-cli task +search ...`
3. Report the matched tasks and include the next `page_token` if more results exist.



<a id="s-aa082fdd6daf81fa"></a>

## references/lark-task-set-ancestor.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +set-ancestor

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Set a parent task for a task, or clear the parent to make it independent.

## Recommended Commands

```text
# Set a parent task
lark-cli task +set-ancestor --task-id "guid_1" --ancestor-id "guid_2"

# Clear the parent task
lark-cli task +set-ancestor --task-id "guid_1"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid>` | Yes | The task GUID to update. |
| `--ancestor-id <guid>` | No | The parent task GUID. Omit it to clear the ancestor. |

## Workflow

1. Confirm the child task and, if applicable, the ancestor task.
2. Execute `lark-cli task +set-ancestor ...`
3. Report the updated task GUID and whether the ancestor was set or cleared.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.



<a id="s-4148318b06ff7288"></a>

## references/lark-task-tasklist-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +tasklist-create

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Create a new tasklist, and optionally batch create tasks within it.

## Recommended Commands

```text
# Create an empty tasklist
lark-cli task +tasklist-create --name "Q1 Goals"

# Create a tasklist and add members
lark-cli task +tasklist-create --name "Project A" --member "ou_xxx,ou_yyy"

# Create a tasklist and batch create tasks within it
lark-cli task +tasklist-create --name "Launch Checklist" --data '[{"summary": "Code Review", "assignee": "ou_aaa"}, {"summary": "Deploy", "assignee": "ou_bbb"}]'
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--name <text>` | Yes | The name of the tasklist. |
| `--member <ids>` | No | Comma-separated list of user `open_id`s to add as editors. |
| `--data <json>` | No | JSON array of task definitions to create and add to the tasklist automatically. |

## Workflow

1. Confirm the tasklist name, members, and tasks (if any).
2. Execute the command `lark-cli task +tasklist-create ...`.
3. Report success, including the new tasklist ID and the result of the batch task creation.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-65a25a2b6e8e00e4"></a>

## references/lark-task-tasklist-members.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +tasklist-members

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Manage tasklist members (editors/owners).

## Recommended Commands

```text
# Add a member
lark-cli task +tasklist-members --tasklist-id "tl_xxx" --add "ou_aaa"

# Remove a member
lark-cli task +tasklist-members --tasklist-id "tl_xxx" --remove "ou_aaa"

# Replace all members exactly
lark-cli task +tasklist-members --tasklist-id "tl_xxx" --set "ou_aaa,ou_bbb"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--tasklist-id <id>` | Yes | The GUID of the tasklist, or a full AppLink URL. |
| `--add <ids>` | No | Comma-separated list of user `open_id`s to add as members. |
| `--remove <ids>` | No | Comma-separated list of user `open_id`s to remove from members. |
| `--set <ids>` | No | Comma-separated list of user `open_id`s to exactly set as members (replaces all existing). |

## Workflow

1. Confirm the tasklist and members to add/remove/set.
2. Execute the command.
3. Report success.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-7d4c6a6a5ae46416"></a>

## references/lark-task-tasklist-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +tasklist-search

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.
>
> **⚠️ Note:** This shortcut uses tasklist search followed by tasklist detail queries to render the final output.

Search tasklists by keyword and optional filters.

## Recommended Commands

```text
# Search by keyword
lark-cli task +tasklist-search --query "测试"

# Search tasklists created by specific users
lark-cli task +tasklist-search --creator "ou_xxx,ou_yyy"

# Search by creation time range
lark-cli task +tasklist-search --query "Q2" --create-time "-30d,+0d"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--query <string>` | No | Search keyword. If omitted, at least one filter must be provided. |
| `--creator <ids>` | No | Creator open_ids, comma-separated. |
| `--create-time <range>` | No | Creation time range in `start,end` form. Each side supports ISO/date/relative/ms input. |
| `--page-token <string>` | No | Page token for pagination. |
| `--page-all` | No | Automatically paginate through all pages (max 40). |
| `--page-limit <int>` | No | Max page limit (default 20). |

## Workflow

1. Build the search keyword and filters from the user's request.
2. Execute `lark-cli task +tasklist-search ...`
3. Report the matched tasklists and the next `page_token` if more results exist.



<a id="s-e35477871e089419"></a>

## references/lark-task-tasklist-task-add.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +tasklist-task-add

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Add existing tasks to a tasklist.

## Recommended Commands

```text
# Add a single task to a tasklist
lark-cli task +tasklist-task-add --tasklist-id "<tasklist_guid>" --task-id "<task_guid>"

# Add multiple tasks to a tasklist
lark-cli task +tasklist-task-add --tasklist-id "<tasklist_guid>" --task-id "<task_guid>,<another_task_guid>,<third_task_guid>"

# Add a task to a specific section in the tasklist
lark-cli task +tasklist-task-add \
  --tasklist-id "<tasklist_guid>" \
  --task-id "<task_guid>" \
  --section-guid "<section_guid>"
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--tasklist-id <guid>` | Yes | The GUID of the tasklist, or a full AppLink URL. |
| `--task-id <guids>` | Yes | Comma-separated list of task GUIDs to add to the tasklist. For Feishu task applinks, use each task's `guid` query parameter, not the `suite_entity_num` / display task ID like `t104121`. |
| `--section-guid <guid>` | No | The GUID of the custom section to add the tasks to. If omitted, tasks will be added to the default section. |

## Workflow

1. Confirm the tasklist and the tasks to add.
2. Execute the command `lark-cli task +tasklist-task-add ...`.
3. Report the result (successful vs failed tasks).

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-71e07f8f78ee286e"></a>

## references/lark-task-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +update

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Update an existing task in Lark.

## Recommended Commands

```text
# Update task summary
lark-cli task +update --task-id "<task_guid>" --summary "New Summary"

# Update multiple tasks' due dates
lark-cli task +update --task-id "<task_guid>,<another_task_guid>" --due "+2d"

# A task applink is accepted directly; the CLI extracts its guid query value
lark-cli task +update --task-id "https://applink.larksuite.com/client/todo/task?guid=<task_guid>" --summary "New Summary"

# Update with JSON data
lark-cli task +update --task-id "<task_guid>" --data '{"description": "New description"}'
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--task-id <guid-or-applink>` | Yes | Task OpenAPI GUID or a task applink containing `guid=`. Comma-separated GUIDs/applinks are supported for multiple tasks. Display task IDs such as `t104121` / `suite_entity_num` are rejected. |
| `--summary <text>` | No | New summary/title for the task. |
| `--description <text>` | No | New description for the task. |
| `--due <time>` | No | New due date (supports relative time). |
| `--data <json>` | No | JSON payload for fields to update. |

## Workflow

1. Confirm with the user the tasks to update and the fields.
2. Execute `lark-cli task +update --task-id "..." ...`
3. Read `data.updated_fields` and `data.tasks[].confirmed` from the result and report only the fields confirmed by the server.
4. Do not routinely call `task tasks get` after the update when `confirmed` already contains the required state. Query details only if a required field is absent or the user explicitly asks for a full verification.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.


<a id="s-26b026c4be45db64"></a>

## references/lark-task-upload-attachment.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# task +upload-attachment

> **Prerequisites:** Please read `../../lark-shared/SKILL.md` to understand authentication, global parameters, and security rules.

Upload a single local file as an attachment to a task (or any resource type accepted by the Task attachment endpoint). Max file size per upload is **50 MB**. For task agents, use `--resource-type=task_delivery`.

## Recommended Commands

```text
# Upload a local file as a task attachment (relative path required)
lark-cli task +upload-attachment \
  --resource-id "<task_guid>" \
  --file "./report.pdf"

# Pass a Feishu task applink instead of a raw guid — the guid is extracted automatically
lark-cli task +upload-attachment \
  --resource-id "https://applink.feishu.cn/client/todo/task?guid=<task_guid>" \
  --file "./note.md"

# Explicit resource type / user id type
lark-cli task +upload-attachment \
  --resource-id "<task_guid>" \
  --resource-type task \
  --user-id-type open_id \
  --file "./design.png"

# Upload a local file to a task agent
lark-cli task +upload-attachment \
  --resource-id "4b113c53-a68b-419f-8bd0-c9c532a3285a" \
  --file "./飞书.zip" \
  --resource-type task_delivery
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--resource-id <guid_or_applink>` | Yes | Target resource GUID. Accepts a raw task GUID or a Feishu task applink URL (`.../client/todo/task?guid=...`); the `guid` query parameter is extracted automatically. Do not use `suite_entity_num` / display IDs like `t104121`. |
| `--file <path>` | Yes | Local file path to upload. Must be a relative path within the current working directory; absolute paths and paths escaping the cwd are rejected. Single file only, ≤ 50 MB. |
| `--resource-type <type>` | No | Owning resource type. Defaults to `task`. Use `task_delivery` when uploading to task agents. |
| `--user-id-type <type>` | No | User ID type for the request. Defaults to `open_id`. |

## Workflow

1. Confirm the target task GUID (or applink) and the local file path with the user.
2. Ensure the file is within the current working directory and its size is ≤ 50 MB; otherwise ask the user to move/split the file.
3. Determine if this is a task agent: if yes, add `--resource-type task_delivery`.
4. Execute `lark-cli task +upload-attachment --resource-id "..." --file "..."`.
5. Report the returned attachment record. The output exposes all fields returned by the API (e.g. `guid`, `name`, `size`, `url`, `uploader`, ...); always surface the attachment `guid` and, if present, the `url` so the user can jump to the attachment directly.

## Output

The command returns the single created attachment record as a flat JSON object — every field returned by the API (`guid`, `name`, `size`, `url`, `resource_type`, `resource_id`, `uploader`, ...) is preserved verbatim. Pretty mode also prints a human-readable summary with the resource, file name, size, and attachment GUID.

> [!CAUTION]
> This is a **Write Operation** -- You must confirm the user's intent before executing.

> [!NOTE]
> The Task attachment upload endpoint accepts exactly one file per call. To upload multiple files, invoke the shortcut once per file.


<a id="s-69236b7e5f12c696"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `task.v1.task.batchDeleteCollaborator` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-批量删除执行者-该接口用于批量删除执行者 | feishu_call_tool |
| `task.v1.task.batchDeleteFollower` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-批量删除关注人-该接口用于批量删除关注人 | feishu_call_tool |
| `task.v1.taskCollaborator.create` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-新增执行者-该接口用于新增任务执行者，一次性可以添加多个执行者。只有任务的创建者和执行者才能添加执行者，关注人无权限添加 | feishu_call_tool |
| `task.v1.taskCollaborator.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-删除指定执行者-该接口用于删除任务执行者 | feishu_call_tool |
| `task.v1.taskCollaborator.list` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-获取执行者列表-该接口用于查询任务执行者列表，支持分页，最大值为50 | feishu_read_tool |
| `task.v1.taskComment.create` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-创建评论-该接口用于创建和回复任务的评论。当parent_id字段为0时，为创建评论；当parent_id不为0时，为回复某条评论 | feishu_call_tool |
| `task.v1.taskComment.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-删除评论-该接口用于通过评论ID删除评论 | feishu_call_tool |
| `task.v1.taskComment.get` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-获取评论详情-该接口用于通过评论ID获取评论详情 | feishu_read_tool |
| `task.v1.taskComment.list` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-获取评论列表-该接口用于查询任务评论列表，支持分页，最大值为100 | feishu_read_tool |
| `task.v1.taskComment.update` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-更新评论-该接口用于更新评论内容 | feishu_call_tool |
| `task.v1.task.complete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-完成任务-该接口用于将任务状态修改为“已完成”。完成任务是指整个任务全部完成，而不支持执行者分别完成任务，执行成功后，任务对所有关联用户都变为完成状态 | feishu_call_tool |
| `task.v1.task.create` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-创建任务-该接口可以创建一个任务，支持填写任务的基本信息，包括任务的标题，描述及协作者等。在此基础上，创建任务时可以设置截止时间和重复规则，将任务设置为定期执行的重复任务。通过添加协作者，则可以让其他用户协同完成该任务。此外，接口也提供了一些支持自定义内容的字段，调用方可以实现定制化效果，如完成任务后跳转到指定结束界面 | feishu_call_tool |
| `task.v1.task.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-删除任务-该接口用于删除任务 | feishu_call_tool |
| `task.v1.taskFollower.create` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-新增关注人-该接口用于新增任务关注人。可以一次性添加多位关注人。关注人ID要使用表示用户的ID | feishu_call_tool |
| `task.v1.taskFollower.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-删除指定关注人-该接口用于删除任务关注人 | feishu_call_tool |
| `task.v1.taskFollower.list` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-获取关注人列表 | feishu_read_tool |
| `task.v1.task.get` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-查询指定任务-该接口用于获取任务详情，包括任务标题、描述、时间、来源等信息 | feishu_read_tool |
| `task.v1.task.list` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-查询所有任务-以分页的方式获取任务列表。当使用user_access_token时，获取与该用户身份相关的所有任务。当使用tenant_access_token时，获取以该应用身份通过“创建任务“接口创建的所有任务（并非获取该应用所在租户下所有用户创建的任务）。本接口支持通过任务创建时间以及任务的完成状态对任务进行过滤 | feishu_read_tool |
| `task.v1.task.patch` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-更新任务-该接口用于修改任务的标题、描述、时间、来源等相关信息 | feishu_call_tool |
| `task.v1.taskReminder.create` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-新增提醒时间-该接口用于创建任务的提醒时间。提醒时间在截止时间基础上做偏移，但是偏移后的结果不能早于当前时间 | feishu_call_tool |
| `task.v1.taskReminder.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-删除提醒时间-删除提醒时间，返回结果状态 | feishu_call_tool |
| `task.v1.taskReminder.list` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-查询提醒时间列表-返回提醒时间列表，支持分页，最大值为50 | feishu_read_tool |
| `task.v1.task.uncomplete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-取消完成任务-该接口用于取消任务的已完成状态 | feishu_call_tool |
| `task.v2.attachment.delete` | [Feishu/Lark]-任务-附件-删除附件-提供一个附件GUID，删除该附件。删除后该附件不可再恢复 | feishu_call_tool |
| `task.v2.attachment.get` | [Feishu/Lark]-任务-附件-获取附件-提供一个附件GUID，返回附件的详细信息，包括GUID，名称，大小，上传时间，临时可下载链接等 | feishu_read_tool |
| `task.v2.attachment.list` | [Feishu/Lark]-任务-附件-列取附件-列取一个资源的所有附件。返回的附件列表支持分页，按照附件上传时间排序。每个附件会返回一个可供下载的临时url，有效期为3分钟，最多可以支持3次下载。如果超过使用限制，需要通过本接口获取新的临时url | feishu_read_tool |
| `task.v2.comment.create` | [Feishu/Lark]-任务-评论-创建评论-为一个任务创建评论，或者回复该任务的某个评论。若要创建一个回复评论，需要在创建时设置`reply_to_comment_id`字段。被回复的评论和新建的评论必须属于同一个任务 | feishu_call_tool |
| `task.v2.comment.delete` | [Feishu/Lark]-任务-评论-删除评论-删除一条评论。评论被删除后，将无法进行任何操作，也无法恢复 | feishu_call_tool |
| `task.v2.comment.get` | [Feishu/Lark]-任务-评论-获取评论详情-给定一个评论的ID，返回评论的详情，包括内容，创建人，创建时间和更新时间等信息 | feishu_read_tool |
| `task.v2.comment.list` | [Feishu/Lark]-任务-评论-获取评论列表-给定一个资源，返回该资源的评论列表。支持分页。评论可以按照创建时间的正序（asc, 从最老到最新），或者逆序（desc，从最老到最新），返回数据 | feishu_read_tool |
| `task.v2.comment.patch` | [Feishu/Lark]-任务-评论-更新评论-更新一条评论。更新时，将`update_fields`字段中填写所有要修改的评论的字段名，同时在`comment`字段中填写要修改的字段的新值即可。更新接口规范详情见[功能概述]中的“ 关于资源的更新”章节。目前只支持更新评论的"conent"字段 | feishu_call_tool |
| `task.v2.customField.add` | [Feishu/Lark]-任务-自定义字段-将自定义字段加入资源-将自定义字段加入一个资源。目前资源类型支持清单tasklist。一个自定义字段可以加入多个清单中。加入后，该清单可以展示任务的该字段的值，同时基于该字段实现筛选，分组等功能。如果自定义字段的设置被更新，字段加入的所有资源都能收到这个更新，并进行相应的展示 | feishu_call_tool |
| `task.v2.customField.create` | [Feishu/Lark]-任务-自定义字段-创建自定义字段-创建一个自定义字段，并将其加入一个资源上（目前资源只支持清单）。创建自定义字段必须提供字段名称，类型和相应类型的设置。目前任务自定义字段支持数字(number)，成员(member)，日期(datetime)，单选(single_select),多选(multi_select), 文本(text)几种类型。分别使用"number_setting", "member_setting", "datetime_setting", "single_select_setting", "multi_select_setting","text_setting"来设置。例如创建一个数字类型的自定义字段，并添加到guid为"ec5ed63d-a4a9-44de-a935-7ba243471c0a"的清单，可以这样发请求。```POST /task/v2/custom_fields{ "name": "价格", "type": "number", "resource_type": "tasklist", "resource_id": "ec5ed63d-a4a9-44de-a935-7ba243471c0a", "number_setting": { "format": "cny", "decimal_count": 2, "separator": "thousand" }}```表示创建一个叫做“价格”的自定义字段，保留两位小数。在界面上显示时采用人民币的格式，并显示千分位分割符。类似的，创建一个单选字段，可以这样调用接口：```POST /task/v2/custom_fields{ "name": "优先级", "type": "single_select", "resource_type": "tasklist", "resource_id": "ec5ed63d-a4a9-44de-a935-7ba243471c0a", "single_select_setting": { "options": [ { "name": "高", "color_index": 1 }, { "name": "中", "color_index": 11 }, { "name": "低", "color_index": 16 } ] }}```表示创建一个叫“优先级”的单选，包含“高”，“中”，“低”三个选项，每个选项设置一个颜色值 | feishu_call_tool |
| `task.v2.customField.get` | [Feishu/Lark]-任务-自定义字段-获取自定义字段-根据一个自定义字段的GUID，获取其详细的设置信息 | feishu_read_tool |
| `task.v2.customField.list` | [Feishu/Lark]-任务-自定义字段-列取自定义字段-列取用户可访问的自定义字段列表。如果不提供`resource_type`和`resource_id`参数，则返回用户可访问的所有自定义字段。如果提供`resource_type`和`resource_id`，则返回该资源下的自定义字段。目前`resource_type`仅支持"tasklist"，此时`resource_id`应为一个清单的tasklist_guid。该接口支持分页 | feishu_read_tool |
| `task.v2.customFieldOption.create` | [Feishu/Lark]-任务-自定义字段选项-创建自定义任务选项-为单选或多选字段添加一个自定义选项。一个单选/多选字段最大支持100个选项。新添加的选项如果不隐藏，其名字不能和已存在的不隐藏选项的名字重复 | feishu_call_tool |
| `task.v2.customFieldOption.patch` | [Feishu/Lark]-任务-自定义字段选项-更新自定义字段选项-根据一个自定义字段的GUID和其选项的GUID，更新该选项的数据。要更新的字段必须是单选或者多选类型，且要更新的字段必须归属于该字段。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`option`字段中填写要修改的字段的新值即可。`update_fields`支持的字段包括：* `name`: 选项名称* `color_index`: 选项的颜色索引值* `is_hidden`: 是否从界面上隐藏* `insert_before`: 将当前option放到同字段某个option之前的那个option_guid。* `insert_after`: 将当前option放到同字段某个option之后的那个option_guid | feishu_call_tool |
| `task.v2.customField.patch` | [Feishu/Lark]-任务-自定义字段-更新自定义字段-更新一个自定义字段的名称和设定。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`custom_field`字段中填写要修改的字段的新值即可。自定义字段不允许修改类型，只能根据类型修改其设置。`update_fields`支持更新的字段包括：* `name`：自定义字段名称* `number_setting` ：数字类型设置（当且仅当要更新的自定义字段类型是数字时)* `member_setting` ：人员类型设置（当且仅当要更新的自定义字段类型是人员时)* `datetime_setting` ：日期类型设置 (当且仅当要更新的自定义字段类型是日期时)* `single_select_setting`：单选类型设置 (当且仅当要更新的自定义字段类型是单选时)* `multi_select_setting`：多选类型设置 (当且仅当要更新的自定义字段类型是多选时)* `text_setting`: 文本类型设置（目前文本类型没有可设置项）当更改某个设置时，如果不填写一个字段，表示不覆盖原有的设定。比如，对于一个数字，原有的setting是:```json"number_setting": { "format": "normal", "decimal_count": 2, "separator": "none", "custom_symbol": "L", "custom_symbol_position": "right"}```使用如下参数调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "number_setting": { "decimal_count": 4 } }, "update_fields": ["number_setting"]}```表示仅仅将小数位数从2改为4，其余的设置`format`, `separator`, `custom_field`等都不变。对于单选/多选类型的自定义字段，其设定是一个选项列表。更新时，使用方式接近使用App的界面。使用者不必传入字段的所有选项，而是只需要提供最终希望界面可见（is_hidden=false) 的选项。原有字段中的选项如果没有出现在输入中，则被置为`is_hidden=true`并放到所有可见选项之后。对于某一个更新的选项，如果提供了option_guid，将视作更新该选项（此时option_guid必须存在于当前字段，否则会返回错误）；如果不提供，将视作新建一个选项（新的选项的option_guid会在reponse中被返回)。例如，一个单选字段原来有3个选项A，B，C，D。其中C是隐藏的。用户可以这样更新选项：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [ { "name": "E", "color_index": 25 }, { "guid": "<option_guid of A>" "name": "A2" }, { "guid": "<option_guid of C>", }, ] } }, "update_fields": ["single_select_setting"]}```调用后最终得到了新的选项列表E, A, C, B, D。其中：* 选项E被新建出来，其`color_index`被设为了25。* 选项A被更新，其名称被改为了"A2"。但其color_index因为没有设置而保持不变；* 选项整体顺序遵循用户的输入顺序，即E，A，C。同时E，A，C作为直接的输入，其is_hidden均被设为了false，其中，C原本是is_hidden=true，也会被设置为is_hidden=false。* 选项B和D因为用户没有输入，其`is_hidden`被置为了true，并且被放到了所有用户输入的选项之后。如果只是单纯的希望修改用户可见的选项的顺序，比如从原本的选项A,B,C修改为C,B,A，可以这样调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [ { "guid": "<option_guid_of_C>" }, { "guid": "<option_guid of B>" }, { "guid": "<option_guid of A>", }, ] } }, "update_fields": ["single_select_setting"]}```如果希望直接将字段里的所有选项都标记为不可见，可以这样调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [] } }, "update_fields": ["single_select_setting"]}```更新单选/多选字段的选项必须满足“可见选项名字不能重复”的约束。否则会返回错误。开发者需要自行保证输入的选项名不可以重复。如希望只更新单个选项，或者希望单独设置某个选项的is_hidden，本接口无法支持，但可以使用[更新自定义字段选项]接口实现 | feishu_call_tool |
| `task.v2.customField.remove` | [Feishu/Lark]-任务-自定义字段-将自定义字段移出资源-将自定义字段从资源中移出。移除后，该资源将无法再使用该字段。目前资源的类型支持"tasklist"。如果要移除自定义字段本来就不存在于资源，本接口将正常返回。注意自定义字段是通过清单来实现授权的，如果将自定义字段从所有关联的清单中移除，就意味着任何调用身份都无法再访问改自定义字段 | feishu_call_tool |
| `task.v2.section.create` | [Feishu/Lark]-任务-自定义分组-创建自定义分组-为清单或我负责的任务列表创建一个自定义分组。创建时可以需要提供名称和可选的配置。如果不指定位置，新分组会放到指定resource的自定义分组列表的最后。当在清单中创建自定义分组时，需要设置`resourse_type`为"tasklist", `resource_id`设为清单的GUID。当为我负责任务列表中创建自定义分组时，需要设置`resource_type`为"my_tasks"，不需要设置`resource_id`。调用身份只能为自己的我负责的任务列表创建自定义分组 | feishu_call_tool |
| `task.v2.section.delete` | [Feishu/Lark]-任务-自定义分组-删除自定义分组-删除一个自定义分组。删除后该自定义分组中的任务会被移动到被删除自定义分组所属资源的默认自定义分组中。不能删除默认的自定义分组 | feishu_call_tool |
| `task.v2.section.get` | [Feishu/Lark]-任务-自定义分组-获取自定义分组详情-获取一个自定义分组详情，包括名称，创建人等信息。如果该自定义分组归属于一个清单，还会返回清单的摘要信息 | feishu_read_tool |
| `task.v2.section.list` | [Feishu/Lark]-任务-自定义分组-获取自定义分组列表-获取一个资源下所有的自定义分组列表。支持分页。返回结果按照自定义分组在界面上的顺序排序 | feishu_read_tool |
| `task.v2.section.patch` | [Feishu/Lark]-任务-自定义分组-更新自定义分组-更新自定义分组，可以更新自定义分组的名称和位置。更新时，将`update_fields`字段中填写所有要修改的字段名，同时在`section`字段中填写要修改的字段的新值即可。调用约定详情见[功能概述]中的“ 关于资源的更新”章节。目前支持更新的字段包括：* `name` - 自定义字段名字;* `insert_before` - 要让当前自定义分组放到某个自定义分组前面的secion_guid，用于改变当前自定义分组的位置;* `insert_after` - 要让当前自定义分组放到某个自定义分组后面的secion_guid，用于改变当前自定义分组的位置。`insert_before`和`insert_after`如果填写，必须是同一个资源的合法section_guid。注意不能同时设置`insert_before`和`insert_after` | feishu_call_tool |
| `task.v2.section.tasks` | [Feishu/Lark]-任务-自定义分组-获取自定义分组任务列表-列取一个自定义分组里的所有任务。支持分页。任务按照自定义排序的顺序返回。本接口支持简单的过滤 | feishu_read_tool |
| `task.v2.task.addDependencies` | [Feishu/Lark]-任务-任务-添加依赖-为一个任务添加一个或多个依赖。可以添加任务的前置依赖和后置依赖。存在依赖关系的任务如果在同一个清单，可以通过清单的甘特图来展示其依赖关系。本接口也可以用于修改一个现有依赖的类型（前置改为后置或者后置改为前置）。注意：添加的依赖的`task_guid`不能重复，也不能添加当前任务为自己的依赖。尝试添加一个已经存在的依赖会被自动忽略 | feishu_call_tool |
| `task.v2.task.addMembers` | [Feishu/Lark]-任务-任务-添加任务成员-添加任务的负责人或者关注人。一次性可以添加多个成员。返回任务的实体中会返回最终任务成员的列表。* 关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。* 成员的角色支持"assignee"和"follower"。* 成员类型支持"user"和"app"。* 如果要添加的成员已经在任务中，则自动被忽略 | feishu_call_tool |
| `task.v2.task.addReminders` | [Feishu/Lark]-任务-任务-添加任务提醒-为一个任务添加提醒。提醒是基于任务的截止时间计算得到的一个时刻。为了设置提醒，任务必须首先拥有截止时间(due)。可以在[创建任务]时设置截止时间，或者通过[更新任务]设置一个截止时间。目前一个任务只能设置1个提醒。但接口的形式可以在未来扩充为一个任务支持多个提醒。如果当前任务已经有提醒了，要更新提醒的设置，需要先调用[移除任务提醒]接口移除原有提醒。再调用本接口添加提醒 | feishu_call_tool |
| `task.v2.task.addTasklist` | [Feishu/Lark]-任务-任务-任务加入清单-将一个任务加入清单。返回任务的详细信息，包括任务所在的所有清单信息。如果任务已经在该清单，接口将返回成功 | feishu_call_tool |
| `task.v2.task.create` | [Feishu/Lark]-任务-任务-创建任务-该接口可以创建一个任务，在创建任务时，支持填写任务的基本信息（如标题、描述、负责人等），此外，还可以设置任务的开始时间、截止时间提醒等条件，此外，还可以通过传入 tasklists 字段将新任务加到多个清单中。创建任务时，可以通过设置`members`字段来设置任务的负责人和关注人。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？ ”章节。如果要设置任务的开始时间和截止时间，需要遵守任务时间的格式和约束。详见[功能概述]中的“ 如何使用开始时间和截止时间？”章节。如要设置自定义字段值，可以设置`custom_fields`字段。但因为自定义字段归属于清单，因此要填写的自定义字段的guid必须归属于要添加的清单(通过`tasklists`设置）。详见[自定义字段概览]。通过设置`client_token`实现幂等调用。详见[功能概述]中的“ 幂等调用 ”章节。如要创建一个任务的子任务，需要使用[创建子任务]接口。创建任务时可以一并设置自定义字段值。但根据自定义字段的权限关系，任务只能添加`tasklists`字段设置的清单中关联的自定义字段的值。详见[自定义字段功能概述]中的介绍 | feishu_call_tool |
| `task.v2.task.delete` | [Feishu/Lark]-任务-任务-删除任务-删除一个任务。删除后任务无法再被获取到 | feishu_call_tool |
| `task.v2.task.get` | [Feishu/Lark]-任务-任务-获取任务详情-该接口用于获取任务详情，包括任务标题、描述、时间、成员等信息 | feishu_read_tool |
| `task.v2.task.list` | [Feishu/Lark]-任务-任务-列取任务列表-基于调用身份，列出特定类型的所有任务。支持分页。目前只支持列取任务界面上“我负责的”任务。返回的任务数据按照任务在”我负责的“界面中”自定义拖拽“的顺序排序 | feishu_read_tool |
| `task.v2.task.patch` | [Feishu/Lark]-任务-任务-更新任务-该接口用于修改任务的标题、描述、截止时间等信息。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`task`字段中填写要修改的字段的新值即可。如果`update_fields`中设置了要变更一个字段的名字，但是task里没设置新的值，则表示将该字段清空。调用约定详情见[功能概述]中的“ 关于资源的更新”章节。该接口可以用于完成任务和将任务恢复至未完成，只需要修改`completed_at`字段即可。但留意，目前不管任务本身是会签任务还是或签任务，oapi对任务进行完成只能实现“整体完成”，不支持个人单独完成。此外，不能对已经完成的任务再次完成，但可以将其恢复到未完成的状态(设置`completed_at`为"0")。如更新自定义字段的值，需要调用身份同时拥有任务的编辑权限和自定义字段的编辑权限。详情见[自定义字段功能概览]。更新时，只有填写在`task.custom_fields`的自定义字段值会被更新，不填写的不会被改变。任务成员/提醒/清单数据不能使用本接口进行更新。* 如要修改任务成员，需要使用[添加任务成员]和[移除任务成员]接口。* 如要修改任务提醒，需要使用[添加任务提醒]和[移除任务提醒]接口。* 如要变更任务所在的清单，需要使用[任务加入清单]和[任务移出清单]接口 | feishu_call_tool |
| `task.v2.task.removeDependencies` | [Feishu/Lark]-任务-任务-移除依赖-从一个任务移除一个或者多个依赖。移除时只需要输入要移除的`task_guid`即可。注意，如果要移除的依赖非当前任务的依赖，会被自动忽略。接口会返回成功 | feishu_call_tool |
| `task.v2.task.removeMembers` | [Feishu/Lark]-任务-任务-移除任务成员-移除任务成员。一次性可以移除多个成员。可以移除任务的负责人或者关注人。移除时，如果要移除的成员不是任务成员，会被自动忽略。本接口返回移除成员后的任务数据，包含移除后的任务成员列表 | feishu_call_tool |
| `task.v2.task.removeReminders` | [Feishu/Lark]-任务-任务-移除任务提醒-将一个提醒从任务中移除。如果要移除的提醒本来就不存在，本接口将直接返回成功 | feishu_call_tool |
| `task.v2.task.removeTasklist` | [Feishu/Lark]-任务-任务-任务移出清单-将任务从一个清单中移出。返回任务详情。如果任务不在清单中，接口将返回成功 | feishu_call_tool |
| `task.v2.taskSubtask.create` | [Feishu/Lark]-任务-子任务-创建子任务-给一个任务创建一个子任务。接口功能除了额外需要输入父任务的GUID之外，和[创建任务]接口功能完全一致 | feishu_call_tool |
| `task.v2.taskSubtask.list` | [Feishu/Lark]-任务-子任务-获取任务的子任务列表-获取一个任务的子任务列表。支持分页，数据按照子任务在界面上的顺序返回 | feishu_read_tool |
| `task.v2.task.tasklists` | [Feishu/Lark]-任务-任务-列取任务所在清单-列取一个任务所在的所有清单的信息，包括清单的GUID和所在自定义分组的GUID。只有调用身份有权限访问的清单信息会被返回 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.create` | [Feishu/Lark]-任务-清单动态订阅-创建动态订阅-为一个清单创建一个订阅。每个订阅可以包含1个或多个订阅者（目前只支持普通群组）。订阅创建后，如清单发生相应的事件，则会向订阅里的订阅者发送通知消息。一个清单最多可以创建50个订阅。每个订阅最大支持50个订阅者。订阅者目前仅支持"chat"类型。每个订阅可以通过设置`include_keys`可以针对哪些事件(event_key)做通知。如果`include_keys`为空，则不对任何事件进行通知。如有需要，创建时也可以直接将`disabled`设为true，创建一个禁止发送订阅通知的订阅 | feishu_call_tool |
| `task.v2.tasklistActivitySubscription.delete` | [Feishu/Lark]-任务-清单动态订阅-删除动态订阅-给定一个清单的GUID和一个订阅的GUID，将其删除。删除后的数据不可恢复 | feishu_call_tool |
| `task.v2.tasklistActivitySubscription.get` | [Feishu/Lark]-任务-清单动态订阅-获取动态订阅-提供一个清单的GUID和一个订阅的GUID，获取该订阅的详细信息，包括名称，订阅者，可通知的event key列表等 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.list` | [Feishu/Lark]-任务-清单动态订阅-列取动态订阅-给定一个清单的GUID，获取其所有的订阅信息。结果按照订阅的创建时间排序 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.patch` | [Feishu/Lark]-任务-清单动态订阅-更新动态订阅-提供一个清单的GUID和一个动态订阅的GUID，对其进行更新。更新时，将`update_fields`字段中填写所有要修改的字段名，同时在`activity_subscription`字段中填写要修改的字段的新值即可。`update_fields`支持更新的字段包括：* name：订阅的名称* subscribers: 订阅者列表。如更新，会将旧的订阅者列表完全替换为新的订阅者列表。支持最大50个订阅者。并且订阅者必须是chat类型。* include_keys ：订阅需要发送通知的key。如更新，会将旧的列表完全替换为新的include_keys列表。只能设置支持的event key (见字段描述）。* disabled：修改订阅的开启/禁用状态 | feishu_call_tool |
| `task.v2.tasklist.addMembers` | [Feishu/Lark]-任务-清单-添加清单成员-向一个清单添加1个或多个协作成员。成员信息通过设置`members`字段实现。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。一个清单协作成员可以是一个用户，应用或者群组。每个成员可以设置“可编辑”或者“可阅读”的角色。群组作为协作成员表示该群里所有群成员都自动拥有群组协作成员的角色。如果要添加的成员已经是清单成员，且角色和请求中设置是一样的，则会被自动忽略，接口返回成功。如果要添加的成员已经是清单成员，且角色和请求中设置是不一样的（比如原来的角色是可阅读，请求中设为可编辑），则相当于更新其角色。如果要添加的成员已经是清单的所有者，则会被自动忽略。接口返回成功。其所有者的角色不会改变。本接口不能用来设置清单所有者，如要设置，可以使用[更新清单]接口 | feishu_call_tool |
| `task.v2.tasklist.create` | [Feishu/Lark]-任务-清单-创建清单-创建一个清单。清单可以用于组织和管理属于同一个项目的多个任务。创建时，必须填写清单的名字。同时，可以设置通过`members`字段设置清单的协作成员。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。创建清单后，创建人自动成为清单的所有者。如果请求同时将创建人设置为可编辑/可阅读角色，则最终该用户成为清单所有者，并自动从清单成员列表中消失。因为同一个用户在同一个清单只能拥有一个角色 | feishu_call_tool |
| `task.v2.tasklist.delete` | [Feishu/Lark]-任务-清单-删除清单-删除一个清单。删除清单后，不可对该清单做任何操作，也无法再访问到清单。清单被删除后不可恢复 | feishu_call_tool |
| `task.v2.tasklist.get` | [Feishu/Lark]-任务-清单-获取清单详情-获取一个清单的详细信息，包括清单名，所有者，清单成员等 | feishu_read_tool |
| `task.v2.tasklist.list` | [Feishu/Lark]-任务-清单-获取清单列表-获取调用身份所有可读取的清单列表 | feishu_read_tool |
| `task.v2.tasklist.patch` | [Feishu/Lark]-任务-清单-更新清单-更新清单，可以更新清单的名字和所有者。更新清单时，将`update_fields`字段中填写所有要修改的清单字段名，同时在`tasklist`字段中填写要修改的字段的新值即可。更新调用规范详见[功能概述]中的“ 关于资源的更新”章节。支持更新的字段包括:* `name` - 清单名字* `owner` - 清单所有者更新清单所有者（owner）时，如果该成员已经是清单的“可编辑”或者“可阅读”角色，则该成员将直接升级为所有者角色，自动从清单的成员列表中消失。这是因为同一个用户在同一个清单中只能有一个角色。同时，支持使用`origin_owner_to_role`字段将原有所有者变为可编辑/可阅读角色或者直接退出清单。该接口不能用于更新清单的成员和增删清单中的任务。* 如要增删清单中的成员，可以使用[添加清单成员]和[移除清单成员]接口。* 如要增删清单中的任务，可以使用[任务加入清单]和[任务移出清单]接口 | feishu_call_tool |
| `task.v2.tasklist.removeMembers` | [Feishu/Lark]-任务-清单-移除清单成员-移除清单的一个或多个协作成员。通过设置`members`字段表示要移除的成员信息。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。清单中同一个成员只能有一个角色，通过的member的id和type可以唯一确定一个成员，因此请求参数中对于要删除的成员，不需要填写"role"字段。如果要移除的成员不在清单中，则被自动忽略，接口返回成功。该接口不能用于移除清单所有者。如果要移除的成员是清单所有者，则会被自动忽略。如要设置清单所有者，需要调用[更新清单]接口 | feishu_call_tool |
| `task.v2.tasklist.tasks` | [Feishu/Lark]-任务-清单-获取清单任务列表-获取一个清单的任务列表，返回任务的摘要信息。本接口支持分页。清单中的任务以“自定义拖拽”的顺序返回。本接口支持简单的按照任务的完成状态或者任务的创建时间范围过滤 | feishu_read_tool |
| `cli.task.tasks.create` | Create Task | feishu_call_tool |
| `cli.task.tasks.delete` | Delete Task | feishu_call_tool |
| `cli.task.tasks.get` | Get Task Details | feishu_read_tool |
| `cli.task.tasks.list` | List Tasks | feishu_read_tool |
| `cli.task.tasks.patch` | Patch Task | feishu_call_tool |
| `cli.task.tasklists.add_members` | Add tasklist members | feishu_call_tool |
| `cli.task.tasklists.create` | Create Tasklist | feishu_call_tool |
| `cli.task.tasklists.delete` | Delete Tasklist | feishu_call_tool |
| `cli.task.tasklists.get` | Get Tasklist Details | feishu_read_tool |
| `cli.task.tasklists.list` | List Tasklists | feishu_read_tool |
| `cli.task.tasklists.patch` | Patch Tasklist | feishu_call_tool |
| `cli.task.tasklists.remove_members` | Remove Tasklist Members | feishu_call_tool |
| `cli.task.tasklists.tasks` | Get Tasks of Tasklist | feishu_read_tool |
| `cli.task.subtasks.create` | Create Subtask | feishu_call_tool |
| `cli.task.subtasks.list` | List Subtasks of Task | feishu_read_tool |
| `cli.task.sections.create` | Create Section | feishu_call_tool |
| `cli.task.sections.delete` | Delete Section | feishu_call_tool |
| `cli.task.sections.get` | Get Section | feishu_read_tool |
| `cli.task.sections.list` | List Sections | feishu_read_tool |
| `cli.task.sections.patch` | Patch Section | feishu_call_tool |
| `cli.task.sections.tasks` | List Tasks of Section | feishu_read_tool |
| `cli.task.custom_fields.add` | Add Custom Field to Resource | feishu_call_tool |
| `cli.task.custom_fields.create` | Create Custom Field | feishu_call_tool |
| `cli.task.custom_fields.get` | Get Custom Field | feishu_read_tool |
| `cli.task.custom_fields.list` | List Custom Fields | feishu_read_tool |
| `cli.task.custom_fields.patch` | Update Custom Field | feishu_call_tool |
| `cli.task.custom_fields.remove` | Remove Custom Field From Resource | feishu_call_tool |
| `cli.task.custom_field_options.create` | Create Custom Field Option | feishu_call_tool |
| `cli.task.custom_field_options.patch` | Update Custom Field Option | feishu_call_tool |
| `cli.task.members.add` | Add Task Member | feishu_call_tool |
| `cli.task.members.remove` | Remove Task Member | feishu_call_tool |


<a id="s-acd30b0dd9b2329b"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# task (v2)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理**

## 命令选择与渐进式发现（必读）

执行任何 Task 命令前，必须先确认能力真实存在，禁止根据用户意图自行拼接或猜测 `+<verb>`：

1. 先将用户意图与下方 Shortcut 表精确匹配。只有表中明确列出的 shortcut 才可直接选择；参数不确定时读取对应 reference 或运行该 shortcut 的 `--help`。
2. 没有精确匹配、或无法确认当前版本是否支持时，先运行 `lark-cli task --help`，以当前 CLI 输出的命令列表为准。
3. help 中存在匹配 shortcut 时，使用 help 列出的完整 shortcut token（例如 `+create`）运行 `lark-cli task <shortcut> --help`，再按真实 flag 执行。
4. help 中没有匹配 shortcut 时，不得尝试相似的 `+<verb>`；从 help 中选择原生 resource，运行 `lark-cli task <resource> --help` 确认 method，再运行 `lark-cli schema task.<resource>.<method>` 获取参数结构，最后调用 `lark-cli task <resource> <method> ...`。
5. 遇到 `unknown_subcommand` 时必须停止猜测或尝试变体，回到第 2 步重新发现能力。

shortcut 名称只能来自本 Skill 的 Shortcut 表或 `lark-cli task --help`；原生 resource/method 以逐级 help 为准，参数名、类型和嵌套结构以 method schema 为准。

> **任务搜索技巧**：先区分用户是否**特地指定使用搜索 skill**，以及是否真的提供了**查询关键字**（例如任务名称、关键词、片段描述）。如果用户特地指定使用搜索 skill，或明确给出了任务查询关键字，则目标是**任务**时优先使用 `+search`。如果用户没有特地指定使用搜索 skill，且意图里没有查询关键字，只有范围条件（例如“今年以来”“已完成”“由我创建”“我关注的”），并且使用 `+search` 与 `+get-related-tasks` / `+get-my-tasks` 都能达到目的时，应优先使用列表型能力，而不是搜索型能力。其中，“与我相关 / 我关注的 / 由我创建”等优先考虑 `+get-related-tasks`；“我负责的 / 分配给我”的列表优先考虑 `+get-my-tasks`。不要把时间范围词（例如“今年以来”）本身误当成 `query` 去走搜索。
> **任务搜索相关性提示**：`+search` 当前不会自动判断搜索结果与搜索发起人的相关性。如果用户明确要求搜索“与我相关”的任务，必须先识别具体关系，获取当前用户的 `open_id`，并显式传入对应的 `--assignee`（负责人）、`--creator`（创建人）或 `--follower`（关注人）过滤条件；不能只依赖 `query` 期待自动返回与当前用户相关的任务。
> **任务清单搜索技巧**：任务清单也遵循同样的判断逻辑。先区分用户是否**特地指定使用搜索 skill**，以及是否真的提供了**清单查询关键字**（例如清单名称、关键词、片段描述）。如果用户特地指定使用搜索 skill，或明确给出了清单查询关键字，则优先使用 `+tasklist-search`。如果用户没有特地指定使用搜索 skill，且意图里没有查询关键字，只有范围条件（例如“由我创建的任务清单”“今年以来创建的清单”），并且使用搜索或原生列取清单都能达到目的时，应优先使用原生 `tasklists.list` 接口列取清单（先 `schema task.tasklists.list`，再 `lark-cli task tasklists list --as user ...`），再按 `creator`、`created_at` 等字段做本地筛选和分页控制。
> **意图区分补充**：像“搜索飞书中今年以来我关注的任务”这类表达，虽然字面带有“搜索”，但如果没有真正的查询关键字，且本质是在限定“与我相关 + 时间范围”，则应优先走 `+get-related-tasks`；像“搜索飞书中由我创建的任务清单”这类表达，如果没有清单关键字，且本质是在限定“清单范围 + 创建者”，则应优先走原生 `tasklists.list` 后筛选，而不是直接走搜索型 shortcut。
> **用户身份识别**：在用户身份（user identity）场景下，如果用户提到了“我”（例如“分配给我”、“由我创建”），请默认获取当前登录用户的 `open_id` 作为对应的参数值。
> **术语理解 — 待办 disambiguation（必读）**：
> - 用户提到「待办 / todo / 任务」时，**先判断归属**，不要默认走本 skill。
> - **走 [lark-meeting]（按模块名读取对应工作流） 的 `minutes +todo`**（禁止本 skill）：上下文含 **妙记 / 会议纪要 / minute_token / 妙记 URL**（`/minutes/`）；或「在某某妙记里新建/修改待办」「妙记 AI 待办」「会议录制里的待办」。
> - **走本 skill（lark-task）**：任务清单、分配给我、项目待办、截止日期/提醒、子任务、任务清单成员；或 applink 含 `client/todo/task?guid=`；或明确说「飞书任务」「任务中心」「我的任务清单」。
> - **禁止**：用户要在妙记里加待办时，**不要**调用 `task tasklists list`、`task +create` 或任何 task 命令去「找清单再放任务」。
> **友好输出**：在输出任务（或清单）的执行结果给用户时，建议同时提取并输出命令返回结果中的 `url` 字段（任务链接），以便用户可以直接点击跳转查看详情。

> **创建/更新注意**：
> 1. 只有在设置了 `due`（截止时间）的情况下，才能设置 `repeat_rule`（重复规则）和 `reminder`（提醒时间）。
> 2. 若同时设置了 `start`（开始时间）和 `due`（截止时间），开始时间必须小于或等于截止时间。
> 3. 使用 tenant_access_token（应用身份）时，无法跨租户添加任务成员。

> **查询注意**：
> 1. 在输出任务详情时，如果需要渲染负责人、创建人等人员字段，除了展示 `id` (例如 open_id) 外，还必须通过其他方式（例如调用通讯录技能）尝试获取并展示这个人的真实名字，以便用户更容易识别。
> 2. 在输出清单详情时，如果需要渲染 owner、member、角色成员等人员字段，也必须像任务成员展示一样，除了展示 `id` 外，尽量解析并展示对应人员的真实名字。
> 3. 在输出任务或清单详情时，如果需要渲染创建时间、截止时间等字段，需要使用本地时区来渲染（格式为2006-01-02 15:04:05）。

> **Task GUID 定义**：
> Task OpenAPI 中用于更新/操作任务的 `guid` 是任务的全局唯一标识（GUID），不是客户端展示的任务编号（例如 `t104121` / `suite_entity_num`）。
> 对于 Feishu 的任务 applink（例如 `.../client/todo/task?guid=...`），必须使用 URL query 里的 `guid` 参数作为 task guid。

> **从任务清单定位并修改任务的最短路径**：
> 1. 已知任务清单 GUID 时直接使用，不要先搜索；已知任务清单 applink 时，取 URL query 中的 `guid` 作为 `tasklist_guid`。
> 2. 只有清单名称或关键词、没有 GUID/applink 时，才调用一次 `+tasklist-search` 解析目标清单。
> 3. 按原生 API 规则先执行 `lark-cli schema task.tasklists.tasks`，再执行 `lark-cli task tasklists tasks --params '{"tasklist_guid":"<tasklist_guid>"}' --as user`。
> 4. 从清单任务结果中取任务的 `guid`，直接传给 `+update` 或 `+complete`；禁止传客户端展示编号（例如 `t104121`）。这两个 shortcut 也可直接接收包含 `guid=` 的任务 applink。
> 5. `+update` 返回 `updated_fields` 和每个任务的服务端 `confirmed` 字段；`+complete` 返回 `status`、`completed_at`、`already_completed`。这些字段已确认目标状态时，不要例行追加 `tasks get`；仅在服务端未返回所需字段或用户明确要求完整复核时再查询详情。

| Shortcut | 说明 |
|----------|------|
| [`+create`](lark-task-0.md#s-75f7806fdf31c36f) | create a task |
| [`+update`](lark-task-0.md#s-71e07f8f78ee286e) | update task attributes |
| [`+set-ancestor`](lark-task-0.md#s-aa082fdd6daf81fa) | set or clear a task ancestor |
| [`+comment`](lark-task-0.md#s-5b7d661e171eca2f) | add a comment to a task |
| [`+complete`](lark-task-0.md#s-f3d302a71f10f132) | mark a task as complete |
| [`+reopen`](lark-task-0.md#s-92d4bdcf51890429) | reopen a completed task |
| [`+assign`](lark-task-0.md#s-f883a7c6783ae66b) | assign or remove task members |
| [`+followers`](lark-task-0.md#s-9935a7c539c9776a) | manage task followers |
| [`+reminder`](lark-task-0.md#s-2e77f79dada77863) | manage task reminders |
| [`+get-my-tasks`](lark-task-0.md#s-4ac34fd06222b7d3) | List tasks assigned to me |
| [`+get-related-tasks`](lark-task-0.md#s-69941e2c1c20a721) | list tasks related to me |
| [`+search`](lark-task-0.md#s-62fa529d316435b2) | search tasks |
| [`+upload-attachment`](lark-task-0.md#s-26b026c4be45db64) | upload a local file as an attachment to a task |
| [`+tasklist-create`](lark-task-0.md#s-4148318b06ff7288) | create a tasklist and optionally add tasks |
| [`+tasklist-search`](lark-task-0.md#s-7d4c6a6a5ae46416) | search tasklists |
| [`+tasklist-task-add`](lark-task-0.md#s-e35477871e089419) | add tasks to a tasklist |
| [`+tasklist-members`](lark-task-0.md#s-65a25a2b6e8e00e4) | manage tasklist members |

## API Resources

```text
lark-cli schema task.<resource>.<method>   # 调用 API 前必须先查看参数结构
lark-cli task <resource> <method> [flags] # 调用 API
```

> **重要**：使用原生 API 时，必须先运行 `schema` 查看 `--data` / `--params` 参数结构，不要猜测字段格式。

### tasks

  - `create` — 创建任务
  - `delete` — 删除任务
  - `get` — 获取任务详情
  - `list` — 列取任务列表
  - `patch` — 更新任务

### tasklists

  - `add_members` — 添加清单成员
  - `create` — 创建清单
  - `delete` — 删除清单
  - `get` — 获取清单详情
  - `list` — 获取清单列表
  - `patch` — 更新清单
  - `remove_members` — 移除清单成员
  - `tasks` — 获取清单任务列表

### subtasks

  - `create` — 创建子任务
  - `list` — 获取任务的子任务列表

### members

  - `add` — 添加任务成员
  - `remove` — 移除任务成员

### sections

  - `create` — 创建自定义分组
  - `delete` — 删除自定义分组
  - `get` — 获取自定义分组详情
  - `list` — 获取自定义分组列表
  - `patch` — 更新自定义分组
  - `tasks` — 获取自定义分组任务列表

### custom_fields

  - `create` — 创建自定义字段
  - `get` — 获取自定义字段详情
  - `patch` — 更新自定义字段
  - `list` — 获取自定义字段列表
  - `add` — 将自定义字段加入资源
  - `remove` — 将自定义字段移出资源

### custom_field_options

  - `create` — 创建自定义字段选项
  - `patch` — 更新自定义字段选项

### agent

  - `update_agent_profile` — 更新任务代理的主页内容数据。
  - `register_agent` — 注册AI 智能体

### agent_task_step_info

  - `append_task_steps` — 写入任务记录。

## 权限表

| 方法 | 所需 scope |
|------|-----------|
| `tasks.create` | `task:task:write` |
| `tasks.delete` | `task:task:write` |
| `tasks.get` | `task:task:read` |
| `tasks.list` | `task:task:read` |
| `tasks.patch` | `task:task:write` |
| `tasklists.add_members` | `task:tasklist:write` |
| `tasklists.create` | `task:tasklist:write` |
| `tasklists.delete` | `task:tasklist:write` |
| `tasklists.get` | `task:tasklist:read` |
| `tasklists.list` | `task:tasklist:read` |
| `tasklists.patch` | `task:tasklist:write` |
| `tasklists.remove_members` | `task:tasklist:write` |
| `tasklists.tasks` | `task:tasklist:read` |
| `subtasks.create` | `task:task:write` |
| `subtasks.list` | `task:task:read` |
| `members.add` | `task:task:write` |
| `members.remove` | `task:task:write` |
| `sections.create` | `task:section:write` |
| `sections.delete` | `task:section:write` |
| `sections.get` | `task:section:read` |
| `sections.list` | `task:section:read` |
| `sections.patch` | `task:section:write` |
| `sections.tasks` | `task:section:read` |
| `custom_fields.create` | `task:custom_field:write` |
| `custom_fields.get` | `task:custom_field:read` |
| `custom_fields.patch` | `task:custom_field:write` |
| `custom_fields.list` | `task:custom_field:read` |
| `custom_fields.add` | `task:custom_field:write` |
| `custom_fields.remove` | `task:custom_field:write` |
| `custom_field_options.create` | `task:custom_field:write` |
| `custom_field_options.patch` | `task:custom_field:write` |
| `agent.update_agent_profile` | `task:task:write` |
| `agent.register_agent` | `task:task:write` |
| `agent_task_step_info.append_task_steps` | `task:task:write` |
