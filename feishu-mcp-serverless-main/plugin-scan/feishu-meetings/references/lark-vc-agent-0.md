<a id="s-99f6ab3423a4d756"></a>

## SKILL.md


# vc-agent

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 读取 lark-meeting 的流程。用户身份的会议管理接口不等于机器人入会能力。必须有明确的机器人身份、入会/离会工具及持续状态；当前连接不具备时报告缺失条件，不能静默切换身份。

## 按需参考

- [工具与合同](lark-vc-agent-0.md#s-78b5fd17c4d9f036)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-vc-agent-0.md#s-7fd42ed55bd7fb02)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-vc-agent-0.md#s-60ac10fbf819ab7d)。


<a id="s-a373a1d8f12b7c41"></a>

## references/baseline/references/lark-vc-agent-meeting-events.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +meeting-events

查询一场正在进行的视频会议中的会中事件列表。该命令是**读操作**，必须沿用 `meeting_id` 的来源身份：用户身份发现的会议继续用用户身份读，应用身份发现或应用机器人入会得到的会议继续用应用身份读。对已结束会议，存在一个**结束后 5 分钟内的宽限窗口**；应用身份读取时，要求应用机器人曾经在这场会里出现过。

本 skill 对应 shortcut：`lark-cli vc +meeting-events`（调用 `GET /open-apis/vc/v1/bots/events`）。

可见性边界：

- `meeting_id` 来自 `+meeting-list-active --as user`：后续读取事件继续 `--as user`。
- `meeting_id` 来自 `+meeting-list-active --as bot --user-id <user_open_id>` 或 `+meeting-join --as bot`：后续读取事件继续 `--as bot`。
- 应用身份下，应用机器人必须在该会中或参会过；应用身份 active meeting 返回的是“目标用户在会中且应用机器人也在会中”的会议，不表示可以读取任意 `meeting_id`。

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
- 应用身份路径：应用机器人必须在会中或参会过；不要拿任意 `meeting_id` 直接查。
- 不要在拿到 `meeting_id` 后随意切换身份。身份不一致时，常见结果是空列表、`no permission` 或 `bot is not in meeting`。

### 3. 读取事件前必须先拿到可见的 meeting_id

最稳妥的调用顺序通常是：

```text
# 方式 1：先入会，直接记录返回的 meeting.id
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 再查询事件
lark-cli vc +meeting-events --as bot --meeting-id <id>
```

如果应用机器人已经在会中，也可以先通过 active meeting 找会：

```text
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
lark-cli vc +meeting-events --as bot --meeting-id <id> --page-all --format pretty
```

如果要查询当前登录用户所在会议：

```text
lark-cli vc +meeting-list-active --as user --format json
lark-cli vc +meeting-events --as user --meeting-id <id> --page-all --format pretty
```

若应用机器人已离会、未入会、或会议已经无法再判断身份，后端通常会报：
- `bot is not in meeting, no permission`

更精确地说，后端当前的判断规则是：

- **会议进行中**：要求应用机器人**当前仍在会中**
- **会议已结束后的 5 分钟内**：只要应用机器人**曾经在这场会中出现过**，仍可拉取事件
- **会议结束超过 5 分钟**：按会议结束处理，通常不再返回事件流
- **应用机器人从未真实入会过**：即使会议仍在进行或刚结束，也会返回 `10005 bot is not in meeting`

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

- `--format json`：结构化契约，顶层包含 `meeting`、`identity`、`events`、`has_more`、`page_token`。`identity` 表示当前读取身份；事件 actor 统一含 `participant_type`、`role`、`label`；每条事件保留 `payload` 便于追溯细节。
- `--format pretty`：默认推荐格式，输出当前身份和逐条时间线，适合快速理解“发生了什么”。
- `--format ndjson`：输出事件行，并带 metadata 行，适合流式消费。

**选型原则**：只在 `pretty`、`json`、`ndjson` 之间选择。目标是告诉用户“发生了什么”时，用 `--page-all --format pretty`；需要稳定字段给 agent 做结构化消费、总结、转发或二次处理时用 `--format json`；需要流式消费时用 `--format ndjson`。

> **注意**：pretty 输出中的正文文本会做单行转义，真实换行会显示为 `\n`，避免打乱时间线布局。

### 6. 内容理解模式：共享文档不能只看标题

当用户意图是：

- “总结这个会议”
- “这个会议讲了什么”
- “有哪些结论 / 待办 / 关键讨论”
- “共享文档里在讲什么”

不要只基于事件时间线直接回答。此时 `+meeting-events` 只是**线索发现器**，不是最终信息源。

执行准则：

- 如果上下文已有明确 `meeting_id`，沿用该 `meeting_id` 的来源身份执行 `+meeting-events --page-all --format json`。
- 如果上下文没有明确 `meeting_id`，先按用户当前意图选择身份：问“我/当前用户所在会议”用 `lark-cli vc +meeting-list-active --as user --format json`；问“应用机器人可见的目标用户会议”用 `lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json`。返回多个会议时先让用户选择。
- 如果上下文只有 9 位会议号，先按当前身份执行 `+meeting-list-active` 并按 `meeting_no` 匹配；匹配到唯一会议后再查事件。不要为了总结会议而自动调用 `+meeting-join`。
- 这类问题拿到 `meeting_id` 后，用同一身份执行 `lark-cli vc +meeting-events --as <same_identity> --meeting-id <id> --page-all --format json` 拉取最新事件流。
- 如果事件中出现共享文档线索，例如：
  - `magic_share_started`
  - `share_doc.title`
  - `share_doc.url`
- 必须继续读取共享文档内容，再生成总结，不能只根据“开始共享了某文档”这条事件和文档标题来概括会议内容。
- 若存在多个共享文档，优先读取**最近一次共享**的文档。
- 若文档读取失败，必须明确说明“以下总结仅基于会中事件流，未成功读取共享文档内容”。

### 7. 关于 `page_token` 的返回与续拉

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
| `events` | 结构化事件列表；每条事件含参与者 `actors` 和事件细节 `payload` |
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
| `magic_share_started` | 开始共享内容 / 文档 |
| `magic_share_ended` | 结束共享 |

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

## Agent 组合场景

### 场景 1：入会后读取会中发生了什么

```text
# 第 1 步：加入会议，记录返回的 meeting.id
JOIN=$(lark-cli vc +meeting-join --as bot --meeting-number 123456789 --format json)
MID=$(echo "$JOIN" | jq -r '.data.meeting.id')

# 第 2 步：用 meeting.id 读取当前可见事件
lark-cli vc +meeting-events --as bot --meeting-id "$MID" --page-all --format pretty
```

### 场景 1b：应用机器人已在会中，先发现 meeting_id 再读事件

```text
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
lark-cli vc +meeting-events --as bot --meeting-id <id> --page-all --format pretty
```

### 场景 1c：当前登录用户正在会中，先发现 meeting_id 再读事件

```text
lark-cli vc +meeting-list-active --as user --format json
lark-cli vc +meeting-events --as user --meeting-id <id> --page-all --format pretty
```

### 场景 2：过滤某段时间内的事件

```text
lark-cli vc +meeting-events \
  --as <same_identity> \
  --meeting-id <id> \
  --start 2026-04-17T15:00:00+08:00 \
  --end 2026-04-17T16:00:00+08:00 \
  --page-all \
  --format pretty
```

### 场景 3：基于上一次的 `page_token` 继续查新增事件

```text
# 上一次查询结束后，保留最后返回的 page_token
# 这次直接从该游标继续拉新增事件
lark-cli vc +meeting-events \
  --as <same_identity> \
  --meeting-id <id> \
  --page-token <last_page_token> \
  --page-all \
  --format pretty
```

适用规则：

- 当用户说“继续看新事件”“看上次之后新增了什么”时，优先使用上一次保存的 `page_token`。
- 如果这次返回里仍有 `has_more=true`、pretty 里出现 `more available`，或又返回了新的 `page_token`，说明新增事件还没拉完，应继续分页，而不是把当前页误当成完整增量结果。
- 只有在用户明确要求“从头回放全部事件”时，才忽略已有 `page_token`，重新从第一页开始。

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--meeting-id is required` | 未传入 `--meeting-id` | 传入长数字 `meeting.id` |
| `10005 bot is not in meeting` | 使用应用身份读取，但应用机器人从未真实入会该会议；或会议已结束但应用机器人从未在会中出现过 | 如果 `meeting_id` 来自用户身份发现，改回 `--as user`；如果确实要应用身份读取，先让应用机器人入会或确认它曾参会后再用 `--as bot`。**如果只是想看参会人快照，改用 `lark-cli vc meeting get --params '{"meeting_id":"<meeting.id>"}' --with-participants`** |
| 用户身份无权限 / 不可见 | 当前用户不是该会议的可见参与者，或 `meeting_id` 不是从用户身份路径获得 | 不要反复执行 `auth login`。先确认 `meeting_id` 是否来自 `+meeting-list-active --as user`；如果用户明确要切到应用身份，再通过 `+meeting-list-active --as bot --user-id <user_open_id>` 获取应用身份可读的 `meeting_id`，或在用户明确同意后让应用机器人入会，再用 `+meeting-events --as bot` 读取 |
| `20001 meeting_status_MEETING_END` | 会议已结束且已超出后端允许的 5 分钟宽限窗口 | 本接口不再适合继续拉取事件。先用 `lark-cli vc +detail --meeting-ids <meeting.id>` 获取会议产物信息，再根据 `note_display_type` / `note_id` / `minute_token` 和用户意图选择纪要正文、逐字稿或妙记；参会人请用 `lark-cli vc meeting get --params '{"meeting_id":"<meeting.id>"}' --with-participants` |
| `20002 meeting not exist` | `meeting_id` 错误，或会议实例当前已不可获取（常见于把 9 位会议号当 meeting_id 传） | 确认传入的是长数字 `meeting_id`，不是 9 位会议号 |
| 应用身份权限不足 | 应用权限、租户安装、权限可访问的数据范围或 VC Agent privilege 未配置完整 | 不要执行 `auth login`。请应用开发者开通 `vc:meeting.bot.join:write`；再检查应用发布/安装和权限可访问的数据范围，均正确仍失败时再排查内测灰度权限 |
| `HTTP 404` / `HTTP 500` | 服务端当前无法找到或处理该会议实例 | 换一个正在进行且 bot 可见的 meeting_id，或排查后端问题 |

## 提示

- 这是**会中事件流**查询，不适合拿来搜历史会议记录；搜历史会议请用 `+search`。
- 如果会议已经结束，不要卡在 `+meeting-events`：  
  - 先用 `lark-cli vc +detail --meeting-ids <meeting.id>` 获取会议产物信息。
  - 再根据 `note_display_type`、`note_id`、`minute_token` 和用户意图，按 `lark-vc` 的产物决策读取纪要正文、逐字稿或妙记。
- 事件列表是否完整，取决于应用机器人何时入会、何时离会，以及后端当前可见的会中事件范围。对于已结束会议，通常只在**结束后 5 分钟内**、且应用机器人**曾经在会中**时还能继续拉到事件。
- 查询"谁参加过某会议"请用 `vc meeting get --params '{"meeting_id":"<id>","with_participants":true}'`——这是参会人**快照** API，不依赖 bot 是否参会，对已结束会议也可查；**不要** 用 `+meeting-events` 做参会人查询。

## 参考

- [lark-vc-agent-meeting-join](lark-vc-agent-0.md#s-09b8f9180127c16f) — 先真实入会
- [lark-vc-agent-meeting-list-active](lark-vc-agent-0.md#s-b06bc034cb685f94) — 发现当前可读事件的进行中会议 ID
- [lark-vc-agent-meeting-leave](lark-vc-agent-0.md#s-baffd705f875e45c) — 用户明确要求时离会
- [lark-vc-search](lark-vc-0.md#s-94a0ee79838d7347) — 搜索历史会议（获取 meeting_id）
- [lark-vc-recording](lark-vc-0.md#s-1ff93ed6418e9203) — 查询 minute_token
- [lark-vc-detail](lark-vc-0.md#s-e05238971ddb666c) — 获取会议详情
- [lark-vc-agent](lark-vc-agent-0.md#s-99f6ab3423a4d756) — Agent 参会能力（本 skill）
- [lark-vc](lark-vc-0.md#s-35c58c6881ec380e) — 视频会议原子域（Meeting / Note 等核心概念）
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-09b8f9180127c16f"></a>

## references/baseline/references/lark-vc-agent-meeting-join.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +meeting-join

通过 9 位会议号让应用机器人加入一场正在进行的视频会议。这是一次**写操作**，会实际让应用机器人加入会议。

本 skill 对应 shortcut：`lark-cli vc +meeting-join`（调用 `POST /open-apis/vc/v1/bots/join`）。

> **不要把 9 位会议号等同于入会意图。** 用户给出 9 位会议号并询问“会议讲了什么 / 查会中事件”时，先用 `+meeting-list-active` 查当前 active meetings 并按 `meeting_no` 匹配；只有用户明确要求“入会 / 让应用机器人旁听 / 代我参会”时才调用本命令。

## 命令

```text
# 仅指定会议号（无密码）
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 指定会议号 + 密码
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --password 8888

# 从邀请事件透传 call_id（参见「如何获取输入参数」）
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --call-id a08e06bf-9a41-44e4-a89c-a7871899e783

# 输出格式
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --format json

# 预览 API 调用（不实际加入会议）
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--meeting-number <no>` | 是 | 会议号，必须为 **9 位纯数字** |
| `--password <pw>` | 否 | 会议密码，仅在该会议设置了入会密码时传入 |
| `--call-id <id>` | 否 | 从 `vc.bot.meeting_invited_v1` 邀请事件透传的 `call_id`，原样回传即可。Agent 主动入会或无邀请事件来源时不传 |
| `--dry-run` | 否 | 预览 API 调用，不实际加入会议；会议号或身份不确定时先用它确认请求 |

## 核心约束

### 1. 使用应用身份

这是应用机器人入会能力，使用 `--as bot`。不要用当前登录用户身份尝试让应用机器人入会。

### 2. 会议号格式严格校验

`--meeting-number` 必须是 9 位纯数字，否则本地校验直接报错：
`--meeting-number must be exactly 9 digits`。

常见错误来源：
- 把会议链接整条粘进来（应仅取尾部的 9 位数字）
- 把 `meeting_id`（长数字 ID）当成会议号传入（两者不是同一个东西）

### 3. 会议必须已开始且允许入会

- 会议必须处于**进行中**状态，应用机器人无法加入尚未开始或已结束的会议。
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

## Agent 组合场景

### 场景 1：加入会议 → 监听会中事件

```text
# 第 1 步：加入会议，记录返回的 meeting.id
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 第 2 步：使用返回的 meeting.id 查询会中事件
lark-cli vc +meeting-events --as bot --meeting-id <meeting.id> --page-all --format pretty
```

如果 bot 已经在会中，也可以通过 active meeting 找回 `meeting_id`：

```text
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
```

### 场景 2：加入会议 → 会后进入 lark-vc 获取会议产物信息

```text
# 第 1 步：加入并参会
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 第 2 步：会议结束后，先查询会议产物
lark-cli vc +detail --meeting-ids <meeting.id>
```

后续按 `lark-vc` 的产物决策处理：根据 `note_display_type`、`note_id`、`minute_token` 和用户意图选择纪要正文、逐字稿或妙记。

## 常见错误与排查

| 错误现象 | 根本原因 | 解决方案 |
|---------|---------|---------|
| `--meeting-number must be exactly 9 digits` | 会议号不是 9 位纯数字 | 检查是否误传了会议链接或 meeting_id |
| 会议密码错误 | `--password` 错误或未提供 | 向主持人确认会议密码 |
| 会议不存在 / 已结束 | 会议号错误或会议未进行中 | 确认会议正在进行中 |
| `HTTP 403: no permission` / `121003` | 入会前置条件不满足，通常不是单纯 scope 问题 | 依次确认：1）会议允许智能体加入；2）会议号正确；3）如有密码，已正确传入 `--password`；4）会议已开始；5）等候室 / 入会审批已放行；6）会议未禁止当前身份加入（如限制外部、限制应用机器人、仅特定成员可入会）；确认后重试 |
| 应用身份权限不足 | 应用权限、租户安装、权限可访问的数据范围或 VC Agent privilege 未配置完整 | 不要执行 `auth login`。以 CLI 返回的 metadata / error envelope 为准确认缺失权限；检查应用发布/安装，以及开放平台“权限可访问的数据范围”：选择“按条件筛选”，条件为“会议的归属者 包含 与应用的可用范围一致”；仍失败再排查内测 privilege / 灰度 |
| 入会被拒绝 | 等候室 / 入会审批 / 限制外部入会 | 联系主持人放行或调整会议设置 |

## 提示

- 仅在 Agent 需要**真实加入**会议（例如参会机器人、会中助手）时使用；只拉取会议数据不需要入会。
- 入会会让机器人立即出现在参会列表；若用户要求退出 / 离开 / 结束参会，直接使用 `+meeting-leave --as bot --meeting-id <meeting.id>`。参数格式不确定时可选 `--dry-run` 预览，但不是必经步骤。
- 执行成功后，立即记录返回的 `meeting.id`，用于后续 `+meeting-leave` / `+meeting-events`。

## 参考

- [lark-vc-agent-meeting-leave](lark-vc-agent-0.md#s-baffd705f875e45c) — 对应的离会命令
- [lark-vc-agent-meeting-list-active](lark-vc-agent-0.md#s-b06bc034cb685f94) — 发现当前可读事件的进行中会议 ID
- [lark-vc-agent-meeting-events](lark-vc-agent-0.md#s-a373a1d8f12b7c41) — 会中事件流
- [lark-vc-search](lark-vc-0.md#s-94a0ee79838d7347) — 搜索历史会议记录
- [lark-vc-recording](lark-vc-0.md#s-1ff93ed6418e9203) — 查询 minute_token
- [lark-vc-detail](lark-vc-0.md#s-e05238971ddb666c) — 获取会议详情
- [lark-vc-agent](lark-vc-agent-0.md#s-99f6ab3423a4d756) — Agent 参会能力（本 skill）
- [lark-vc](lark-vc-0.md#s-35c58c6881ec380e) — 视频会议原子域（Meeting / Note 等核心概念）
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-baffd705f875e45c"></a>

## references/baseline/references/lark-vc-agent-meeting-leave.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。


# vc +meeting-leave

通过 `meeting_id` 离开当前身份所在的视频会议（bot leave）。这是一次**写操作**，会实际把当前身份从会议中移出。

本 skill 对应 shortcut：`lark-cli vc +meeting-leave`（调用 `POST /open-apis/vc/v1/bots/leave`）。

## 命令

```text
# 通过 meeting_id 离会
lark-cli vc +meeting-leave --as bot --meeting-id 69xxxxxxxxxxxxx28

# 输出格式
lark-cli vc +meeting-leave --as bot --meeting-id 69xxxxxxxxxxxxx28 --format json

# 预览 API 调用（不实际离会）
lark-cli vc +meeting-leave --as bot --meeting-id 69xxxxxxxxxxxxx28 --dry-run
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

## Agent 组合场景

### 场景 1：加入 → 用户明确要求时离开

```text
# 第 1 步：加入会议，记录 meeting.id
lark-cli vc +meeting-join --as bot --meeting-number 123456789

# 第 2 步：在会中处理用户请求（如监听发言、记录信息等）
# ...

# 第 3 步：仅在用户明确要求退出 / 离开 / 结束参会时，使用上一步记录的 meeting.id 离会
lark-cli vc +meeting-leave --as bot --meeting-id <meeting.id>
```

### 场景 2：会后补拉产物（不需要离会）

如果用户只是要求会议结束后拉录制、纪要或逐字稿，不要先调用 `+meeting-leave`；直接跨到 `lark-vc` 查询会后产物。

```text
# 第 1 步：会议结束后进入 lark-vc 获取会议产物信息
lark-cli vc +detail --meeting-ids <meeting.id>
```

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

## 参考

- [lark-vc-agent-meeting-join](lark-vc-agent-0.md#s-09b8f9180127c16f) — 对应的入会命令
- [lark-vc-agent-meeting-list-active](lark-vc-agent-0.md#s-b06bc034cb685f94) — 发现当前可读事件的进行中会议 ID
- [lark-vc-agent-meeting-events](lark-vc-agent-0.md#s-a373a1d8f12b7c41) — 会中事件流
- [lark-vc-search](lark-vc-0.md#s-94a0ee79838d7347) — 搜索历史会议（获取 meeting_id）
- [lark-vc-recording](lark-vc-0.md#s-1ff93ed6418e9203) — 查询 minute_token
- [lark-vc-detail](lark-vc-0.md#s-e05238971ddb666c) — 获取会议详情
- [lark-vc-agent](lark-vc-agent-0.md#s-99f6ab3423a4d756) — Agent 参会能力（本 skill）
- [lark-vc](lark-vc-0.md#s-35c58c6881ec380e) — 视频会议原子域（Meeting / Note 等核心概念）
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-b06bc034cb685f94"></a>

## references/baseline/references/lark-vc-agent-meeting-list-active.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

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

常见流程：

```text
# 方式 1：先让应用机器人入会，直接从 join 响应拿 meeting.id
lark-cli vc +meeting-join --as bot --meeting-number 123456789 --format json
lark-cli vc +meeting-events --as bot --meeting-id <id> --page-all --format pretty

# 方式 2：应用机器人已经在会中时，用应用身份发现 meeting_id
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
lark-cli vc +meeting-events --as bot --meeting-id <id> --page-all --format pretty

# 方式 3：查询当前登录用户所在会议发生了什么
lark-cli vc +meeting-list-active --as user --format json
lark-cli vc +meeting-events --as user --meeting-id <id> --page-all --format pretty
```

## 多会议选择

- 如果返回多个会议，不要自动挑第一个。
- 向用户展示每个候选的 `meeting_title` / `meeting_no` / `meeting_id`，等待用户选择。
- 选择后用同一身份执行 `+meeting-events` 读取事件。

## 9 位会议号匹配

用户提供 9 位会议号但没有明确要求应用机器人入会时，把会议号当作 active meeting 的筛选条件，而不是写操作指令。

```text
# 用户问“我当前这个会讲了什么”
lark-cli vc +meeting-list-active --as user --format json

# 用户问“让应用机器人所在/可见的这个会讲了什么”
lark-cli vc +meeting-list-active --as bot --user-id <user_open_id> --format json
```

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
| 应用身份权限不足 | 应用权限、租户安装、权限可访问的数据范围或 VC Agent privilege 未配置完整 | 不要执行 `auth login`。请应用开发者开通 `vc:meeting.bot.join:write`；再检查应用发布/安装和权限可访问的数据范围，均正确仍失败时再排查内测灰度权限 |

## 参考

- [lark-vc-agent-meeting-join](lark-vc-agent-0.md#s-09b8f9180127c16f) — 让应用机器人真实入会并拿 `meeting.id`
- [lark-vc-agent-meeting-events](lark-vc-agent-0.md#s-a373a1d8f12b7c41) — 使用 `meeting_id` 读取会中事件


<a id="s-4b14bf6d73a59e50"></a>

## references/baseline/references/lark-vc-agent-meeting-message-send.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

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

## 相关

- [lark-vc-agent-meeting-list-active](lark-vc-agent-0.md#s-b06bc034cb685f94) — 发现当前进行中会议 ID
- [lark-vc-agent-meeting-events](lark-vc-agent-0.md#s-a373a1d8f12b7c41) — 读取会中事件
- [lark-vc-agent-meeting-join](lark-vc-agent-0.md#s-09b8f9180127c16f) — 应用机器人入会


<a id="s-60ac10fbf819ab7d"></a>

## references/baseline-index.md

# 兼容参考

- [lark-vc-agent-meeting-events.md](lark-vc-agent-0.md#s-a373a1d8f12b7c41)
- [lark-vc-agent-meeting-join.md](lark-vc-agent-0.md#s-09b8f9180127c16f)
- [lark-vc-agent-meeting-leave.md](lark-vc-agent-0.md#s-baffd705f875e45c)
- [lark-vc-agent-meeting-list-active.md](lark-vc-agent-0.md#s-b06bc034cb685f94)
- [lark-vc-agent-meeting-message-send.md](lark-vc-agent-0.md#s-4b14bf6d73a59e50)


<a id="s-78b5fd17c4d9f036"></a>

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


<a id="s-7fd42ed55bd7fb02"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Compatibility entry

本技能只用于兼容旧名称，不直接处理业务。

**MUST 完整读取 [`../lark-meeting/SKILL.md`](lark-meeting-0.md#s-d18634841861885e)，并按照其中的路由和行动指南执行。**
