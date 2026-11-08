<a id="s-3d0136d3d09a934d"></a>

## SKILL.md


# calendar

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先明确用户时区及时间范围，查询可用日历并确认 calendar_id，再查日程。空结果、无权限和没有遍历完分页分别表示。

2. 重复日程必须区分单个实例、此后实例和整个系列；只改一次时定位实例 ID 并保留其他实例、参与人及会议室。全天日程与带时区时间戳不要混用。

3. busy/freebusy 是可用时间证据，不等于预约成功；会议室搜索、邀请和实际资源接受状态分别核对。时间或对象明确后直接按已授权请求操作。

4. 历史会议和即时会议检索转 lark-meeting，不能只查日历便声称覆盖所有会议。

## 按需参考

- [工具与合同](lark-calendar-0.md#s-68ce1569ce804fa7)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-calendar-0.md#s-104d56452b8c24b9)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-859d2833af4b4d57"></a>

## references/lark-calendar-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# calendar +create


创建日程并按需邀请参会人。

## 推荐命令

```text
# 创建日程 + 邀请参会人（ISO 8601 时间）
lark-cli calendar +create \
  --summary "产品评审" \
  --start "2026-03-12T14:00+08:00" \
  --end "2026-03-12T15:00+08:00" \
  --attendee-ids ou_aaa,ou_bbb

# 无参会人
lark-cli calendar +create \
  --summary "午餐" \
  --start "2026-03-12T12:00+08:00" \
  --end "2026-03-12T13:00+08:00"

# 指定日历
lark-cli calendar +create --summary "..." --start "..." --end "..." \
  --calendar-id cal_xxx
```

参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| `--summary <text>` | 否 | 日程标题。注意：标题中不应该出现时间、地点、人物信息 |
| `--start <time>` | 是 | 开始时间（ISO 8601，**必须带时区偏移**，如 `2026-03-12T14:00+08:00`；不带偏移会按进程时区解析致偏移） |
| `--end <time>` | 是 | 结束时间（ISO 8601，**必须带时区偏移**） |
| `--description <markdown>` | 否 | 日程描述，统一使用此字段，格式为 **Markdown**。提供会议议程、活动内容、注意事项或链接等。支持加粗、斜体、下划线（`<u>...</u>`）、删除线、链接 `[文本](url)`、标题（`# ` 到 `### `，最多三级）、引用（`> `）、有序/无序列表、GFM 表格（`\| 列1 \| 列2 \|` + 分隔行 `\| --- \| --- \|`）、以及图片 `![图片名](图片URL)`（标准 Markdown 图片语法：远程 URL 原样使用；**本地图片路径**（相对路径、且位于当前工作目录内）会自动上传到云盘并在端上内联渲染——绝对路径或工作目录之外的路径会报错；端上已有图片读回为 Markdown 图片）。飞书文档 URL（直接粘贴裸链接，或写成 `[文本](url)`）会自动解析为内联文档，端上展示文档标题而非裸链接。支持 `@文件路径` 或 `-`（stdin）读取。**禁止**用 `***文本***` 同时表示加粗+斜体（端上会残留 `*`）；应嵌套书写，如 `**<u>*~~文本~~*</u>**` 或 `*<u>**~~文本~~**</u>*`。|
| `--attendee-ids <id_list>` | 否 | 参与人 ID 列表（逗号分隔）。支持用户（`ou_`）、群组（`oc_`）和会议室（`omm_`）。AI 提取时请务必保留对应前缀。bot 可作为合法参会人，无需剔除 |
| `--calendar-id <id>` | 否 | 日历 ID（省略则使用主日历） |
| `--rrule <rrule>` | 否 | 重复日程的重复性规则，规则设置方式参考rfc5545。示例值："FREQ=DAILY;INTERVAL=1;UNTIL=<具体日期>" |
| `--meeting-owner-id <ou_>` | 否 | 设置 VC 会议 owner。仅以应用（bot）身份在应用日历上操作时生效（需 `--as bot`）；owner 必须为本租户用户身份的 open_id（`ou_`） |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

> 当用户表达'每周 X'、'每周重复'、'连续 N 周'时，必须使用 rrule 创建重复性日程，而非创建多个独立日程
> `--description` 行内同时加粗和斜体时，**禁止**写 `***文本***`（端上会残留 `*`）；必须让 `**` 与 `*` 各自成对嵌套，例如 `**<u>*~~文本~~*</u>**` 或 `*<u>**~~文本~~**</u>*`。
> 自动设置 `attendee_ability: "can_modify_event"`，参会人可查看彼此并编辑日程。
> 自动设置 `free_busy_status: "busy"`，默认日程忙闲状态为忙碌。
> 自动设置 `reminders: [{"minutes": 5}]`，默认日程开始前 5 分钟提醒。
> 自动设置 `vchat: {"vc_type": "vc"}`，默认日程包含飞书视频会议。如需其他视频会议类型或不含视频会议，请使用完整 API 命令。
> 失败保护：若添加参会人失败（如 open_id 错误），CLI 会自动删除刚创建的空日程（回滚，不通知参会人）。
> 审批会议室：`+create` 不暴露低频字段 `attendees[].approval_reason`。如果会议室要求审批，请使用用户身份先创建日程，再用完整 API `calendar event.attendees create --as user` 添加会议室并传 `approval_reason`。

## 高级用法（完整 API 命令）

> 优先策略：创建日程优先走 `+create`。遇到 `+create` 不支持的高级参数（如 `location`（地理位置，不含会议室位置）、`visibility`（日程公开范围）、自定义 `reminders`（提醒设置）、自定义 `attendee_ability`（参与人权限）、自定义 `free_busy_status`（日程忙闲状态）、参与人可选参加状态或全天日程等），**优先先用 `+create` 创建成功，再用完整 API update 对这些字段做编辑补齐**，而非整体改用完整 API 从零创建。

**注意**：
- 全天日程的开始日期和结束日期必须分别是日程开始的第一天和结束的最后一天。如果只有一天的话，开始日期和结束日期是相同。

```text
## 添加需要审批的会议室（approval_reason 最大 200 字符）
lark-cli calendar event.attendees create \
  --as user \
  --params '{"calendar_id":"<CALENDAR_ID>","event_id":"<EVENT_ID>"}' \
  --data '{"attendees": [{"type": "resource", "room_id": "omm_xxx", "approval_reason": "申请原因"}]}'

完整 API 命令的关键差异和处理策略：
- 时间参数是 **Unix 秒字符串**（非 ISO 8601）。换算时**禁止依赖容器默认时区**（常为 UTC，会导致 8 小时偏移），必须显式指定目标时区。
- 全天日程的开始日期和结束日期必须分别是日程开始的第一天和结束的最后一天；单日全天日程两者相同。
- 手动拆成“创建日程 + 添加参会人”两步时，若第二步失败，建议删除刚创建的空日程，避免遗留无参会人的日程。

## 参会人类型

| `type` | `user_id` 格式 | 说明 |
|--------|---------------|------|
| `user` | `ou_xxx`（open_id） | 飞书用户 |
| `group` | `oc_xxx` | 飞书群组 |
| `resource` | `omm_xxx` | 会议室 |
| `third_party` | 邮箱地址 | 外部参会人 |

> [!CAUTION]
> 这是**写入操作** -- 执行前必须确认用户意图。

## 参考

- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) -- skill 入口与路由
- [lark-calendar-suggestion](lark-calendar-0.md#s-cfb58c530b6fbded) -- 根据非明确时间或一段时间范围，推荐多个可用时间块方案


<a id="s-f67e2c0f5ffe4125"></a>

## references/lark-calendar-join-event.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +join-event

凭**分享 token** 加入日程。

## 命令

```text
# 用户以自身身份加入（默认场景）
lark-cli calendar +join-event --token <token> --as user

# 以应用身份加入
lark-cli calendar +join-event --token <token> --as bot
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token <token>` | **是** | 分享 token，加入的唯一入参（别名 `--share-token`）。|

## token 从哪来

| token 类型 | 承载来源 | 取值 |
|-----------|---------|------|
| 链接类 | 分享链接 / 二维码 | 链接 `{{domain}}/calendar/share?token=<token>` 里的 `token` |
| 卡片类 | 分享卡片 / RSVP 卡片 | 从 IM 日程分享卡片或 RSVP 卡片消息解析出的日程分享 token |

- **分享链接**：直接取 URL query 里的 `token` 值传入；无需解析日程字段。例如 `{{domain}}/calendar/share?token=29f762bdmsbd82ce9` → `--token 29f762bdmsbd82ce9`。
- **二维码**：先用 OCR/扫码解析成分享链接，再取其中的 `token`——CLI 不承接二维码图像，只承接解析后的链接 token。
- **卡片**：token 落在卡片消息 content（分享卡片 `SHARE_CALENDAR_EVENT`、RSVP 卡片 `GENERAL_CALENDER`）；RSVP 卡片被转发后退化为分享卡片，同样可加入。

## 重复性日程

加入范围取决于 token 反解出的日程本体是「原重复性日程」还是「例外」（参见 [lark-calendar-recurring](lark-calendar-0.md#s-b4d4cc7de8425317) 的关键概念）：

- 分享的是**原重复性日程**（`{event_uid}_0`）：加入的是**整个序列**（含例外）。
- 分享的是某个**例外**（`originalTime > 0` 的单次实例）：只加入这**一个例外日程**。

## 参考

- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) -- skill 入口与路由
- [lark-calendar-rsvp](lark-calendar-0.md#s-f55576b9cac50175) -- 已在日程中时回复接受/拒绝/待定（≠ 加入）
- [lark-calendar-recurring](lark-calendar-0.md#s-b4d4cc7de8425317) -- 重复性日程的序列 vs 实例操作规范


<a id="s-2563add39b3ba428"></a>

## references/lark-calendar-list-attendees.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +list-attendees

列出单个日程的参与人（用户 / 会议室 / 群 / 三方邮箱）。只读。

## 命令

```text
# 查看指定日历（默认primary）下某日程的全部类型参与人和会议室
lark-cli calendar +list-attendees --calendar-id <calendar_id> --event-id <event_id>

# 只看会议室
lark-cli calendar +list-attendees --event-id <event_id> --type resource

# 同时看用户与会议室
lark-cli calendar +list-attendees --event-id <event_id> --type user --type resource

# 分页续拉（由调用方基于 has_more / page_token 决定是否再调一次）
lark-cli calendar +list-attendees --event-id <event_id> --page-size 100 --page-token <page_token>
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--event-id <id>` | **是** | 目标日程 ID |
| `--calendar-id <id>` | 否 | 日历 ID，省略则使用主日历（`primary`） |
| `--type <type>` | 否 | 按 attendee 类型过滤；可重复或逗号分隔。枚举：`user` / `resource` / `chat` / `third_party`。留空返回全部类型|
| `--page-size <n>` | 否 | 上游分页大小；默认 `20`|
| `--page-token <token>` | 否 | 上游分页游标，来自上一次返回的 `page_token` |

## 提示

- `type=chat` 的群参与人**不返回 `rsvp_status`**（群本身没有群级 RSVP 状态）。需要群成员的 RSVP 请走原生 OpenAPI。


<a id="s-15f633d24613c559"></a>

## references/lark-calendar-meeting-relation.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 日程与视频会议的关系

用户口中的「会议」不区分「日程」和「视频会议」，实际是两类不同实体。本文定义两者关系，并给出「当前 / 未来 / 过去」三种查询意图的执行流程。

## 核心概念

- **日程（Calendar Event）**：对用户一段时间的预占，到点后可能开视频会议、也可能只是线下会议 / 私人时间块。
- **视频会议（VC Meeting）**：实际发生过的一次通话，`meeting_id` 只有真正发起后才存在。

| 场景 | `event_id` | `meeting_id` | 备注 |
|------|:---:|:---:|------|
| 日程发起了视频会议 | ✓ | ✓ | 一个日程可发起多次通话，产出多个 `meeting_id` |
| 日程未开视频会议 | ✓ | ✗ | 线下会议 / 私人时间块 |
| 即时视频会议 | ✗ | ✓ | 无日程绑定 |

**关键不变量**：视频会议只发生在**当下和过去**，不存在「未来的视频会议」。

## 意图 1：查询当前正在开的会议

**目标覆盖**：当下时间点用户可能关心的所有活动——正在开的视频会议 + 当前时间的日程（无论有没有开视频）。

**执行步骤**：

```text
# 1. 当前时间的日程
lark-cli calendar +agenda --start <now> --end <now>

# 2. 用户已加入的视频会议
lark-cli vc +meeting-list-active --as user

# 3. 步骤 1 每个日程回查关联 meeting_id
#    输出是 event_id → meeting_id 映射；后续所有交叉都按 meeting_id 匹配
#    （vc +meeting-list-active / vc +detail 结果的 id 字段即 meeting_id，无 event_id）
lark-cli calendar +meeting --event-ids <event_id1>,<event_id2>

# 4. 判定视频会议是否仍在进行
#    仅对「步骤 3 非空 meeting_id 且不在步骤 2 里」的调用
#    end_time 为空或 <= start_time → 仍在进行；否则已结束
lark-cli vc +detail --meeting-ids <meeting_id1>,<meeting_id2>
```

**结果分组呈现**：按下列**四组顺序**归类，每组独立成节，空组可省略。

1. **当前用户正在参与的会议**（`meeting_id` 命中步骤 2）
   - **即时会议**（无关联 `event_id`）：仅展示视频会议信息。
   - **日程会议**（能与步骤 3 的 `event_id` 关联）：展示日程信息 + 视频会议信息。
2. **当前正在视频会议的日程（用户未加入）**：日程有 `meeting_id`、步骤 4 判定仍在进行、但不在步骤 2 里。展示日程信息 + 视频会议信息。
3. **当前正在进行中的日程（视频会议已结束）**：日程仍在时间窗内、有 `meeting_id`，但步骤 4 判定已结束。展示日程信息 + 视频会议信息（标注「已结束」）。
4. **当前正在进行中的日程（未开启视频会议）**：日程仍在时间窗内，步骤 3 回查无 `meeting_id`。仅展示日程信息。

## 意图 2：查询未来的会议

**只有日程视角**：视频会议只发生在当下和过去，用户说的「未来的会议」等价于「未来的日程」。

```text
# 二选一：无关键词 → +agenda；有关键词 → +search-event
lark-cli calendar +agenda --start <future_start> --end <future_end>
lark-cli calendar +search-event --query <keyword> --start <future_start> --end <future_end>

# 禁用：vc +search 对未来返回空，容易被误判「没有会议」
# lark-cli vc +search --start <future> --end <future>   ← 不要这样做
```

若用户明确要求「未来的视频会议」，仍返回日程列表并**主动说明**：视频会议是否真正开要等到时间到达才能确定。

## 意图 3：查询过去的会议

**目标覆盖**：过去时间段内发生过的视频会议（含即时会议）+ 过去时间段的日程（含未开视频会议的）。

**执行步骤**：

```text
# 1. 过去的视频会议（含即时会议——仅查日程会漏掉）
lark-cli vc +search --start <past_start> --end <past_end>

# 2. 过去的日程
lark-cli calendar +agenda --start <past_start> --end <past_end>

# 3. 步骤 2 每个日程回查 meeting_id，构建 meeting_id → event_id 映射
#    遍历步骤 1 每条结果，用其 id 字段（即 meeting_id）查此映射：
#    命中 → 日程视频会议；未命中 → 无日程的即时会议
lark-cli calendar +meeting --event-ids <event_id1>,<event_id2>
```

**结果分组**：按三组顺序呈现。

1. **无日程的即时视频会议**：步骤 1 里找不到关联 `event_id`。仅展示视频会议信息。
2. **日程视频会议**：日程 + 关联 `meeting_id`。同时展示日程信息和视频会议信息。
3. **未开视频会议的日程**：日程存在但步骤 3 回查无 `meeting_id`。仅展示日程信息。

## 常见判断路径

| 用户输入 | 动作 |
|----------|------|
| 只给了「会议标题」 | 不确定是日程标题还是即时会议标题，**同时**查 `calendar +search-event --query <标题>` 与 [`lark-meeting`]（按模块名读取对应工作流） 的 `vc +search --query <标题>`，交叉后按上述意图分流 |
| 直接给了 `meeting_id` | 直接进入 [`lark-meeting`]（按模块名读取对应工作流），跳过日程 |
| 相对锚点（「今天下午 3 点那个会」） | 先 `+agenda` 定位日程，再按意图 1 或 3 判断 |
| 过去锚点（「昨天开的会」） | **禁止只查 `+agenda`**——必须同时查 `vc +search`，否则漏掉即时会议 |
| 未来锚点（「明天下午的会」） | 只查日程，不查 `vc +search`（未来永远返回空） |


<a id="s-a46ac6486d54bd0d"></a>

## references/lark-calendar-meeting.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# calendar +meeting

通过日程 ID（`event_id`） 获取关联的视频会议信息（`meeting_id`、`meeting_note`）。只读。

## 命令

```text
# 单个 / 批量（逗号分隔，最多 50 个）
lark-cli calendar +meeting --event-ids <event_id1>,<event_id2>

# 默认使用主日历，需要时显式传 --calendar-id
lark-cli calendar +meeting --event-ids <event_id> --calendar-id <calendar_id>
```

## 输出字段

| 字段 | 说明 |
|------|------|
| `event_id` | 日程 ID |
| `meeting_id` | 关联的视频会议 ID |
| `meeting_note` | 用户主动绑定到日程的纪要文档 Token（`MeetingNotes`，由用户在日程页手动添加；）。**与会中产生的 AI 智能纪要 `note_doc_token` 是两份不同文档**，要拿 AI 纪要请继续走 `vc +detail` → `note +detail`。 |

## 下游链路

`calendar +meeting` 只把日程 ID 翻译为 `meeting_id` / `meeting_note`，要拿会中产生的产物（AI 智能纪要、逐字稿、妙记）需继续调用：

```text
# 1. meeting_id → note_id + minute_token（同一会议两份产物，可能各自为空）
lark-cli vc +detail --meeting-ids <meeting_id>

# 2a. note_id → 纪要文档 token（note_doc_token / verbatim_doc_token / shared_doc_tokens）
lark-cli note +detail --note-id <note_id>

# 2b. minute_token → 妙记 AI 产物（按需获取，不传不返回任何 AI 内容）
lark-cli minutes +detail --minute-tokens <minute_token> --summary --todo --chapter --keyword --transcript

# 3. 任意文档 token（meeting_note / note_doc_token / verbatim_doc_token / shared_doc_token）→ 正文
lark-cli docs +fetch --api-version v2 --doc <doc_token> --doc-format markdown
```


<a id="s-b4d4cc7de8425317"></a>

## references/lark-calendar-recurring.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 重复性日程操作规范

重复性日程/例外的编辑和删除必须显式指定操作范围。相关命令：

- `lark-cli calendar +delete` — 删除日程；重复性日程/例外必须传 `--apply-to`。
- `lark-cli calendar +update` — 更新日程；重复性日程/例外必须传 `--apply-to`。

> **破坏性操作闸（Destructive Confirmation Gate）：** 用户未明确操作范围时，必须先向用户确认。`+delete`、以及 `+update` 中会通知参会人或不可逆的写操作执行前，**即使目标 event_id 和 `--apply-to` 都已明确，Agent 也必须等待用户确认**。
>
> 只有用户在同一轮对话中明说「直接删 / 不用问 / 已确认 / 别再确认 / just do it」等等价意思时才可跳过。跳过时须在最终回复里注明「已按用户显式免确认执行」，方便回溯。

## `--apply-to` 与日程类型的匹配矩阵

先记住四种日程类型：**普通日程（Normal）**、**重复性日程本体（Master）**、**重复性日程实例（Instance）**、**重复性日程例外（Exception）**。四种类型允许的 `--apply-to` 组合如下（❌ = 传入即报错）：

| 日程类型 | event_id 形状 | `single` | `all` | `this-and-following` |
|----------|--------------|:--------:|:-----:|:--------------------:|
| Normal（普通日程）          | `{uid}_0`（无 rrule） | 隐含默认 | ❌ | ❌ |
| Master（重复性日程本体）    | `{uid}_0`（有 rrule） | ❌ | ✅ | ❌ |
| Instance（重复性日程实例）  | `{uid}_{ts>0}`，`is_exception=false` | ✅ | ✅ | ✅ |
| Exception（重复性日程例外）| `{uid}_{ts>0}`，`is_exception=true`  | ✅ | ✅ | ❌（Exception 已占据该时间位，需改传另一个未被独立化的 Instance id 作为分割点） |

三个 `--apply-to` 的含义与影响面：

| 值 | 语义 | 影响面 |
|----|------|--------|
| `single` | 只操作当前这一次 | 只改/删传入的这一个 event_id 本身；例外不动其它例外，实例不动整个序列 |
| `all` | 操作整条重复性序列 | Master 本体 **和** 所有例外都会被处理（时间变更时例外先被删除，其它字段则会同步 PATCH 到每个例外） |
| `this-and-following` | 从「起始实例」起截断并新建后续序列 | 用 UNTIL 截断 Master、删除起始实例起的所有未来例外、以起始实例的时间为起点 创建 一条新序列继承 Master 的默认字段 |

## 关键概念

- **event_id 结构**：`event_id` 的格式为 `{event_uid}_{originalTime}`。`originalTime = 0` 表示 Master 或 Normal；`originalTime > 0` 表示某一次在原序列中本来的时间戳（Unix 秒）。因此 `{event_uid}_0` 即为重复性日程本体的 `event_id`。
- **Master（重复性日程本体）**：携带 `rrule` 的日程本体，`event_id` 形如 `{event_uid}_0`。序列的所有默认属性（标题、时间、rrule、描述、参会人等）都挂在本体上。
- **Normal（普通日程）**：不携带 `rrule`，`event_id` 也是 `{event_uid}_0`，但没有序列概念。只能用 `--apply-to=single`（可省略）。
- **Instance vs Exception —— 二者最容易混淆，务必区分**：
  - **Instance（实例）**：由 rrule 展开出来的「虚拟」发生点，本身不落库。`event_id` 形如 `{event_uid}_{originalTime}`（`originalTime > 0`），是从 `+agenda` / `+search-event` 返回的可寻址标识。**从未被单独编辑过**——所有属性都从 Master 继承而来。在 API 层可以对 Instance id 发 GET，但对它发写操作时（操作此次），会先把它「实体化」成一条 Exception。
  - **Exception（例外）**：某个 Instance 被显式修改（改时间、改标题、改参会人等）或被显式删除标记后落库产生的**独立日程**。`event_id` 形状与 Instance 完全一样（`{event_uid}_{originalTime}`），肉眼**无法**区分——唯一可靠的判据是 `calendar +get` 返回的 `is_exception=true`（Instance 为 false）。Exception 已经脱离 Master 的字段继承，是一份可独立编辑/删除的实体。
  - **一句话总结**：Instance 是 rrule 展开出来的「占位符」，Exception 是「已经被独立化的实例」。判断当前 event_id 是哪种，先跑 `+get` 看 `is_exception`。
- 删除/更新 Master **不会** 级联处理例外——命令内部会显式扫描并处理例外。

## 前置步骤（所有范围通用）

1. 通过 `+agenda` 或 `+search-event` 定位到目标日程 / 实例，拿到 `event_id`。
2. 判断日程类型：
   - `event_id` 后缀 `_0` 且无 `recurrence` → Normal；
   - `event_id` 后缀 `_0` 且有 `recurrence` → Master；
   - `event_id` 后缀 `_{数字>0}` 且 `is_exception=false` → Instance；
   - `event_id` 后缀 `_{数字>0}` 且 `is_exception=true` → Exception。
   - 需要精确判断时跑 `calendar +get` 看 `recurrence` 和 `is_exception` 字段。
3. **与用户确认 `--apply-to` 范围（未明确一律先问，禁止默认）**。

## 常见命令

### 删除

```text
# 删除此次（例外或instance）
lark-cli calendar +delete --event-id <uid_originalTime> --apply-to single

# 删除全部（主日程 id 或任意 例外/instance id）
lark-cli calendar +delete --event-id <uid_originalTime> --apply-to all

# 删除此次及后续（必须传具体instance id）
lark-cli calendar +delete --event-id <uid_originalTime> --apply-to this-and-following
```

### 更新

```text
# 编辑此次（单个实例 / 例外）
lark-cli calendar +update --event-id <uid_originalTime> --apply-to single --summary <summary>

# 编辑全部（主日程 id 或任意 例外/instance id）
lark-cli calendar +update --event-id <uid_originalTime> --apply-to all --summary <summary>

# 编辑全部：改时间
lark-cli calendar +update --event-id <uid_originalTime> --apply-to all --start <start> --end <end>

# 编辑此次及后续：截断主日程 + 删未来例外 + 创建新序列
lark-cli calendar +update --event-id <uid_originalTime> --apply-to this-and-following --summary <summary>
```

## 语义细则

- **`--apply-to=all` 时的字段传播**：只把用户本次显式传的 flag 应用到每个例外和主日程。例外原本自定义过的其他字段（例如自己的描述）保持不变。
- **`--apply-to=this-and-following` 的字段继承**：新创建的日程从原主日程继承 summary、description、rrule、start/end（用起始实例的时间）、vchat/reminders/location/visibility；用户任何显式传的 flag 优先。
- **`--start/--end` 变更**：`all` 场景下，例外会被删除（原始占位已无意义），主日程再 PATCH；`this-and-following` 场景下，`--start/--end` 传了会作为新序列的时间，否则用起始实例的时间。
- **参会人**：`this-and-following` 创建新序列时，若传了 `--add-attendee-ids`，会额外 添加attendees 到新序列；`--remove-attendee-ids` 会从新序列的参与人列表移除。


<a id="s-8e52cf22f22e0533"></a>

## references/lark-calendar-room-find.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +room-find


针对一个或多个时间块查找/搜索可用会议室。会议室是日程的一种资源型参与人，不能脱离日程单独预定。

## 适用场景

- 已知一个或多个待选时间块，需要查找可用会议室
- 需要在一组连续编号的会议室中批量搜索可用房间（如"帮我约一个 16~20 号之间的会议室"）

## 命令

```text
lark-cli calendar +room-find \
  --slot "2026-03-27T14:00:00+08:00~2026-03-27T15:00:00+08:00" \
  --slot "2026-03-27T16:00:00+08:00~2026-03-27T17:00:00+08:00" \
  --attendee-ids "ou_xxx,ou_yyy" \
  --city "北京" \
  --building "学清嘉创大厦B座" \
  --floor "F2" \
  --event-rrule "FREQ=DAILY;INTERVAL=1"
```

### 批量会议室名称查询

当用户想在一组编号会议室中挑选可用房间时，可用英文逗号拼接多个会议室名称传入 `--room-name`：

```text
# 场景：帮我约一个 16~20 号之间的会议室
lark-cli calendar +room-find \
  --slot "2026-03-27T14:00:00+08:00~2026-03-27T15:00:00+08:00" \
  --room-name "16,17,18,19,20"
```

```text
# 场景：查找 木星 或 火星 会议室
lark-cli calendar +room-find \
  --slot "2026-03-27T14:00:00+08:00~2026-03-27T15:00:00+08:00" \
  --room-name "木星,火星"
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--slot <start~end>` | 是 | 期望查询的时间块，格式需遵循 `开始时间~结束时间`。若存在多个候选时间块，可重复传入此参数。 |
| `--city <text>` | 否 | 会议室所在城市强约束。**仅当**用户明确说出具体城市（如北京、上海）时才提取，**严禁**根据园区或楼宇名称自行联想或补全。 |
| `--building <text>` | 否 | 会议室所在楼宇强约束，承载城市以下、楼层以上的办公区/园区/楼栋描述。|
| `--floor <text>` | 否 | 仅用于筛选会议室所在楼层。应先做归一化，再传递规范值；例如 `2楼` / `二楼` / `2F` 统一为 `F2`。注意：此参数只筛选楼层，不可混入区域定位（如“A区”）或具体会议室号。 |
| `--room-name <text>` | 否 | 会议室名称约束，支持以**英文逗号**分隔传入多个名称。仅当用户明确提到会议室专名、会议室号或编号区间时使用。 |
| `--min-capacity <n>` | 否 | 会议室最小容纳人数。当用户明确参会人数或提出“至少容纳N人”等要求时，提取数字放入此参数，必须为正整数。 |
| `--max-capacity <n>` | 否 | 会议室最大容纳人数。用于过滤过大空间，必须为正整数。 |
| `--attendee-ids <id_list>` | 否 | 参会对象 ID 列表。支持用户 ID（`ou_` 前缀）和群组 ID（`oc_` 前缀），多个 ID 以逗号分隔。**不要传入 bot 的 open_id**：bot 是虚拟身份，不占会议室席位、无会议室偏好，传入只会干扰推荐结果。 |
| `--event-rrule <rrule>` | 否 | 重复日程的重复性规则，规则设置方式参考rfc5545。**【⚠️注意：系统绝对不支持 COUNT，如需限制重复次数，必须转为 UNTIL】**。示例值："FREQ=DAILY;INTERVAL=1" |
| `--timezone <tz>` | 否 | 对话中明确提及的预约日程所使用的时区（默认取用户设备时区，例如 `Asia/Shanghai`） |

## 规则

- 构造 `--attendee-ids` 前，先剔除 bot 参会人：bot 不占席位、无偏好，不应参与会议室推荐。
- 多个 `--slot` 会由 CLI 内部并发调用单时间块接口，再聚合成一次输出
- `+room-find` 的时间输入必须是**确定时间块**，不是时间区间搜索。
- 如果是重复性日程，必须校验返回中的 `reserve_until_time`（该会议室最晚可预约时间）是否覆盖 `event-rrule` 对应的重复范围。
- `--city` 仅在用户明确说出城市时才提取；不要仅凭 `望京办公室`、`漕河泾园区`、`南山办公室` 这类位置名自动补城市。
- 若已经提取了 `--city`，则 `--building` 中不要再重复携带城市前缀。例如用户说 `北京学清嘉创大厦B座` 时，应提取为 `--city "北京"` 与 `--building "学清嘉创大厦B座"`，不要把 `北京学清嘉创大厦B座` 原样整体传入 `--building`。
- 同一语义槽位只保留一个规范值。例如用户说“2楼”，应转换为 `--floor "F2"`；**禁止**同时传 `2楼 F2` 这类重复楼层信息。
- 参数归类顺序应为：`city/building/floor` > `floor + room-name` 复合表达 > `room-name`。若短词更像楼层/区域定位（如 `2L`、`2F`），优先落到 `--floor`，不要默认落到 `--room-name`。像 `学清2层` 这种表达，通常拆为 `--building "学清"` 与 `--floor "F2"`。
- 对会议室名要做轻量归一化：`木星会议室` 应提取为 `--room-name "木星"`；`会议室 02` / `02会议室` 应提取为 `--room-name "02"`。
- 当用户表达"帮我约 XX 到 YY 号之间的会议室"或一次提及多个会议室名称时，应将所有目标名称用英文逗号拼接传入 `--room-name`。例如：
  - "帮我约 16~20 号的会议室" → `--room-name "16,17,18,19,20"`
  - "查下木星和火星是否有空" → `--room-name "木星,火星"`
  - "看看 01、02、03 会议室" → `--room-name "01,02,03"`
- 对复合会议室号要优先拆分结构化信息：`F3-05` / `F5-07` / `3楼-08` 这类表达，若可稳定识别楼层与会议室号，应优先提取为 `--floor "F3"` + `--room-name "05"`、`--floor "F5"` + `--room-name "07"`、`--floor "F3"` + `--room-name "08"`，不要把整段直接作为 `--room-name`。
- 当提供了会议室搜索筛选条件时，返回结果也**不保证**与搜索词完全字面匹配。底层可能会结合邻近楼层做推荐，例如用户搜索 `2层`，即使 `2层` 没有空闲会议室，也可能返回相近的 `3层` 候选。这不应被误判为接口返回异常。

## 输出格式

**将返回的候选会议室整理为易读的结构化排版向用户展示。严禁将时间和会议室名称放在同一行展示，必须分行并使用编号列表呈现可用会议室，严禁揉成一团纯文本堆叠。**

```text
## 2026-03-27 周五

[选项 1] 14:00 - 15:00
  可用会议室：
  1. 学清嘉创大厦B座-F2-02🎦(7人)
  2. 学清嘉创大厦B座-F3-05🎦(11人)

💡 请回复您倾向的选项编号以及对应的会议室序号，我来为您完成预定。
```

> **AI 行为指导：**
> - **结构化展示时间块与会议室**：默认按“时间块 -> 会议室候选”的层级结构展示，并直接询问用户意向。
> - **`room_name` 必须逐字透传**：展示给用户的会议室名称，必须直接使用 CLI/API 返回的 `room_name` 原值。禁止提取楼层、会议室号、容量、视频能力后重组成新的名称，禁止意译、缩写、去前缀、去后缀，或仅保留"便于阅读"的摘要名。
> - **重复日程要明确阻断原因与自动缩短**：若某候选会议室的 `reserve_until_time` 无法覆盖重复性日程，**必须**向用户明确说明该会议室最长可约至何时。若用户确认继续选用该会议室，你必须**自动将日程的重复规则结束时间缩短**至该 `reserve_until_time`，以防止会议室预约失败。不能直接按原规则继续。
> - **正确解释推荐结果**：如果返回结果与用户输入条件不完全字面一致，先说明底层可能返回邻近位置或相近条件的推荐候选，不要直接将其判定为异常。
> - **默认减少用户输入成本**：应主动引导用户不必一开始就提供很详细的会议室搜索条件。只要时间块已明确，用户直接表达“想约会议室”即可，先基于当前信息查询候选；只有在用户对结果不满意时，再引导其补充更具体的楼宇、楼层、会议室名或容量条件。

**字段说明：**

| 字段名 | 说明 |
| :--- | :--- |
| `room_id` | 会议室唯一标识，用于后续创建日程时添加为会议室参与人使用。 |
| `room_name` | 会议室名称，展示给用户时必须使用原值。 |
| `capacity` | 会议室最大容纳人数。 |
| `reserve_until_time` | 该会议室当前允许被预约到的最晚时间点，用于校验重复性日程是否超期。 |

## 参考

- [lark-calendar-create](lark-calendar-0.md#s-859d2833af4b4d57)
- [lark-calendar-suggestion](lark-calendar-0.md#s-cfb58c530b6fbded)
- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) — skill 入口与路由


<a id="s-f55576b9cac50175"></a>

## references/lark-calendar-rsvp.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +rsvp


回复指定的日程，更新当前用户的 RSVP 状态（接受、拒绝或待定）。

## 命令

```text
# 回复日程为接受 (使用主日历)
lark-cli calendar +rsvp --event-id evt_xxx --rsvp-status accept

# 回复日程为拒绝
lark-cli calendar +rsvp --event-id evt_xxx --rsvp-status decline

# 回复日程为待定
lark-cli calendar +rsvp --event-id evt_xxx --rsvp-status tentative

# 指定其他日历下的日程
lark-cli calendar +rsvp --calendar-id cal_xxx --event-id evt_xxx --rsvp-status accept
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--event-id <id>` | **是** | 日程 ID |
| `--rsvp-status <status>` | **是** | 回复状态，可选值：`accept` (接受), `decline` (拒绝), `tentative` (待定) |
| `--calendar-id <id>` | 否 | 日历 ID（省略则使用主日历） |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 提示

- 只能回复你被邀请的日程。
- 调用前通常需要通过 `+agenda` 等命令获取到具体的 `event-id`。

## 参考

- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) -- skill 入口与路由


<a id="s-5714c4973a0cad5b"></a>

## references/lark-calendar-schedule-clear-time.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 明确时间分支：room-find + freebusy + 冲突处理

> 本文档处理**时间已明确**的场景。"明确时间"来源：用户直接表达（如"明天下午3点"）、编辑流中已定位日程的原始 start/end、或经用户确认的 suggestion 时间块。

## 前置条件

进入此分支前，调度器（[schedule-meeting.md](lark-calendar-0.md#s-ef4c0627b1c3b332)）已完成：
- 任务类型判定（新建 / 编辑）
- 编辑流：目标 event_id 已定位
- 新建流：默认值已补全
- 时间已判定为**明确**

## 流程

### 1. 查询会议室（如需）

若用户需要会议室，先调用 `+room-find`。详见 [`lark-calendar-room-find.md`](lark-calendar-0.md#s-8e52cf22f22e0533)。

```text
lark-cli calendar +room-find \
  --slot "<start>~<end>" \
  --attendee-ids "<ids>" \
  --city "<city>" \
  --building "<building>" \
  --floor "<F2>" \
  --room-name "<room_name>"
```

时间块确定规则：
- **编辑流且不改时间，只新增会议室**：`--slot` 必须来自已定位日程的当前 `start/end`
- **编辑流且既改时间又加会议室**：`--slot` 必须来自候选新时间，而不是旧时间

详见 [`lark-calendar-room-find.md`](lark-calendar-0.md#s-8e52cf22f22e0533)。

### 2. 查询忙闲

```text
# 单人 / 多人查忙：--user-id 可重复或逗号分隔；服务端已合并相邻/重叠忙碌区间
lark-cli calendar +freebusy --start "<start>" --end "<end>" --user-id "ou_a,ou_b"

# 直接求共同空闲（推荐用于「找几个人一起有空」）
lark-cli calendar +freebusy --start "<start>" --end "<end>" \
  --user-id "ou_a,ou_b,ou_c" --type common_free --min-duration 30m
```

规则：
- 参与人含 **bot**：无需为 bot 查询忙闲。bot 是虚拟身份，可并行多个会议、无忙闲语义，检查它没有意义。
- 参与人过多（超过 5 人）：仅查询**当前用户**及少数核心人员忙闲即可
- 参与人含**群组**：无需展开群组成员查询忙闲
- 如果用户是从 `+suggestion` 确认了时间块后进入本分支的，**无需再调用 `+freebusy`**
- 找多人共同空闲：直接用 `--type common_free [--min-duration <dur>]`，让 CLI 一次算出共同空闲；不要自己再合并求交

### 3. 冲突处理

- **无冲突**：直接让用户选择会议室（如需），进入落地操作
- **有冲突**：必须先说明冲突情况，询问用户：
  - **继续当前时间** → 让用户选择会议室（如需），进入落地操作
  - **换时间** → 转入 [模糊时间分支](lark-calendar-0.md#s-e0fa9b1c2b943e62)

## 落地

根据任务类型：
- 新建 → [`+create`](lark-calendar-0.md#s-859d2833af4b4d57)
- 编辑 → [`+update`](lark-calendar-0.md#s-4d2b30bbb64781b9)

落地规则详见 [schedule-meeting.md § 落地日程变更](lark-calendar-0.md#s-ef4c0627b1c3b332)。


<a id="s-e0fa9b1c2b943e62"></a>

## references/lark-calendar-schedule-fuzzy-time.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 模糊时间 / 无时间信息分支：suggestion + 批量查询

> 本文档处理**时间模糊**（如"明天下午""下周找个时间"）或**完全无时间信息**的场景。核心动作是调用 `+suggestion` 产出候选时间块，再根据是否需要会议室决定后续步骤。

## 前置条件

进入此分支前，调度器（[schedule-meeting.md](lark-calendar-0.md#s-ef4c0627b1c3b332)）已完成：
- 任务类型判定（新建 / 编辑）
- 编辑流：目标 event_id 已定位
- 新建流：默认值已补全
- 时间已判定为**模糊**或**无时间信息**

## 流程

### 1. 调用 suggestion

详见 [`lark-calendar-suggestion.md`](lark-calendar-0.md#s-cfb58c530b6fbded)。

```text
lark-cli calendar +suggestion \
  --start "<range_start>" \
  --end "<range_end>" \
  --attendee-ids "<ids>" \
  --duration-minutes <n> \
  --event-rrule "<rrule>"
```

规则：
- 用户完全没有提供时间信息时，先默认一个合理区间（如"今天剩余时间"或"近两天"）再调用
- 编辑流中，若用户说"改到明天下午""下周找个时间再约"，基于用户期望的**新时间范围**调用，不要沿用旧时间
- **不要在用户完全没给时间时反问"你想约什么时候"** — 先补合理区间再进入 suggestion

### 2. 分支处理

#### 不需要会议室

获取多个推荐时间块后，直接向用户展示候选时间，用户确认后进入落地操作。

#### 需要会议室

获取候选时间块后，**不要急于让用户只选时间**。先将这些时间块一次性交给 `+room-find` 批量查询可用会议室，然后将【候选时间】与【对应的可用会议室列表】结构化展示，让用户一次性完成选择。

> **注意**：即使用户最初只说"查会议室"且未带时间，也必须强制走 suggestion → room-find 路径。

详见 [`lark-calendar-room-find.md`](lark-calendar-0.md#s-8e52cf22f22e0533)。

### 3. 用户确认后

- 用户选中 `+suggestion` 返回的时间块后，**无需再次调用 `+freebusy`**，直接进入落地操作
- **BLOCKING REQUIREMENT**：必须先向用户展示选项并等待确认，禁止在未获用户确认时直接创建/更新日程

## 模糊语义消解与长期记忆

针对存在歧义的时间场景，严禁主观臆断。典型例子：
- "上班后" / "下班前"
- 未明确上下午的 12 小时制时间

处理规则：
- 主动澄清真实意图，不自行猜测
- 用户澄清后，将个性化定义沉淀为长期偏好

## 用户展示格式

向用户展示多个时间块及对应会议室时，**必须结构化分行排版**，严禁将时间与会议室放在同一行：

```text
## 2026-03-27 周五

[选项 1] 14:00 - 15:00（参会人均空闲）
  可用会议室：
  1. 学清嘉创大厦B座-F2-02🎦(7人)
  2. 学清嘉创大厦B座-F2-05🎦(10人)

[选项 2] 16:00 - 17:00（参会人均空闲）
  可用会议室：
  1. 学清嘉创大厦B座-F3-01🎦(6人)
  2. 学清嘉创大厦B座-F3-06🎦(8人)

💡 请回复您倾向的选项编号以及对应的会议室序号，我来为您完成预定。
```

## 落地

根据任务类型：
- 新建 → [`+create`](lark-calendar-0.md#s-859d2833af4b4d57)
- 编辑 → [`+update`](lark-calendar-0.md#s-4d2b30bbb64781b9)

落地规则详见 [schedule-meeting.md § 落地日程变更](lark-calendar-0.md#s-ef4c0627b1c3b332)。


<a id="s-ef4c0627b1c3b332"></a>

## references/lark-calendar-schedule-meeting.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 预约/改约日程或会议、查询/搜索可用会议室的工作流

## 执行摘要

- **第一步永远是判断任务类型：新建日程，还是编辑已有日程。**
- **编辑已有日程时，必须先定位目标日程或实例的 `event_id`。**
- **默认做智能助理，不做表单填写机。** 能根据上下文补全的默认值就直接补全，仅在必须决策的冲突或无法唯一确定的场景下才发起询问。
- **新建流先补默认值，编辑流先继承已定位日程信息。**
- **明确时间** → 进入 [明确时间分支](lark-calendar-0.md#s-5714c4973a0cad5b)
- **模糊时间或无时间信息** → 进入 [模糊时间分支](lark-calendar-0.md#s-e0fa9b1c2b943e62)
- **BLOCKING REQUIREMENT**: 面临时间方案或会议室方案的选择时，必须先向用户展示选项并等待确认，禁止未经确认直接创建/更新日程。
- **必须按顺序执行。** 不要跳过"任务类型判定""目标日程定位（编辑流）""补默认值/继承基线信息""判断时间明确性"这些前置步骤。

## 严禁行为

- **严禁在未读取对应子命令文档前直接调用命令。**
- **严禁在尚未判断"新建"还是"编辑"之前，就直接进入创建日程或查会议室动作。**
- **严禁把带有既有日程锚点 + 修改动词的请求当成新建日程。**
- **严禁在编辑已有日程时跳过目标定位步骤。** 未拿到唯一 `event_id` 前，不得调用 `+update`。
- **严禁在面临时间/会议室方案选择时，未经用户确认就擅自创建/更新日程。**

## 适用场景

- "帮我约个会" / "下周找时间和 XX 开会"
- "帮我订/找/搜索一个可用会议室"
- "明天下午3点约个日程"
- "把明天上午的日程加上 小明"
- "给下周一的周会换个会议室"
- "把这个日程改到明天下午，并加上学清 F201"

## 核心概念

- **会议室是日程的一种参与人（attendee / resource），不能脱离日程单独预定。**
- **预定或查找会议室，均需先确定时间块。**
- **当用户说"查会议室""找会议室"，默认意图是查会议室可用性，不是检索会议室资源名录。**

## 任务类型判定

| 类型 | 典型语言信号 | 第一动作 |
|------|--------------|----------|
| 新建日程 | "约个会""安排会议""新建日程""订个会议室开会" | 补默认值，再进入时间判断 |
| 编辑已有日程 | "给某日程加人/删人/加会议室""把某日程改到…""换会议室" | 先定位目标 `event_id` |

规则：
- 只要同时出现**既有日程锚点**（标题、时间段、`这个日程`、`这场会`）和**修改动词**（添加、移除、改到、换），默认判定为编辑。
- 对重复性日程的编辑，必须先定位到对应实例的 `event_id`。

## 编辑流：先定位目标日程

定位规则：
- 优先利用用户给出的标题、日期、时间范围等锚点，通过 `+agenda`、`+search-event` 或实例视图缩小范围
- 命中多个候选日程时，必须向用户展示候选项并要求确认
- 重复性日程必须继续定位到该次实例的 `event_id`

编辑流分支路由：

| 编辑子场景 | 下一步 |
|-----------|--------|
| 仅增删普通参会人/群组，不改时间，不涉及会议室 | 直接 `+update`（详见 [lark-calendar-update.md](lark-calendar-0.md#s-4d2b30bbb64781b9)） |
| 新增会议室，不改时间 | 基于已定位日程 start/end → [明确时间分支](lark-calendar-0.md#s-5714c4973a0cad5b) |
| 只改时间，不涉及会议室 | 判断时间明确性 → 对应分支 |
| 既改时间，又新增/更换会议室 | 先确定最终时间 → 再查会议室 → 落地 |

## 新建日程：智能推断默认值

- **标题**：根据上下文自动生成；如无法推断，默认"会议"
- **参会人**：如未指定，默认仅用户自己
- **时长**：基于上下文推断；默认 30 分钟
- **无时间信息**：默认推断合理区间（如"今天"或"近两天"），进入时间推荐流程，禁止询问用户

搜索参与人出现多个结果无法唯一确定时，必须询问用户并记录长期记忆。

## 判断时间是否明确

时间基准规则：
- **新建流**：使用用户给出的时间，或默认补全出的时间范围
- **编辑流且不改时间**：已定位日程的当前 `start/end` 就是明确时间
- **编辑流且改时间**：用户想改到的新时间；若表达模糊，进入模糊时间分支
**注意**: 在执行修改日程/会议时间的任务时，必须先获取原日程的持续时长。如果用户只提供了新的开始时间，你必须根据原时长自动计算出新的结束时间，严格保持原时长不变，禁止擅自改变原日程的时长。

## 分支路由

| 判定结果 | 下一步读取 |
|----------|-----------|
| 明确时间 | [schedule-clear-time.md](lark-calendar-0.md#s-5714c4973a0cad5b) |
| 模糊时间 / 无时间信息 | [schedule-fuzzy-time.md](lark-calendar-0.md#s-e0fa9b1c2b943e62) |

## 落地日程变更

用户确认后调用：
- 新建 → [`+create`](lark-calendar-0.md#s-859d2833af4b4d57)
- 编辑 → [`+update`](lark-calendar-0.md#s-4d2b30bbb64781b9)

```text
lark-cli calendar +create \
  --summary "..." \
  --start "<start>" \
  --end "<end>" \
  --attendee-ids "ou_xxx,oc_xxx,omm_xxx"

lark-cli calendar +update \
  --event-id "<event_id>" \
  --start "<start>" \
  --end "<end>" \
  --add-attendee-ids "omm_new_room"
```

落地规则：
- 编辑流必须始终沿用前面定位得到的目标 `event_id`；禁止在最后一步重新猜测目标日程
- 编辑流中"新增会议室"默认仅追加 `room_id`，不移除已有会议室
- 仅当用户明确说"更换会议室"时，才同时 `--remove-attendee-ids` 旧 + `--add-attendee-ids` 新
- 需要会议室时，将选中的 `room_id` 写入参与人列表

## 参考

- [lark-calendar-schedule-clear-time.md](lark-calendar-0.md#s-5714c4973a0cad5b)
- [lark-calendar-schedule-fuzzy-time.md](lark-calendar-0.md#s-e0fa9b1c2b943e62)
- [lark-calendar-room-find.md](lark-calendar-0.md#s-8e52cf22f22e0533)
- [lark-calendar-suggestion.md](lark-calendar-0.md#s-cfb58c530b6fbded)
- [lark-calendar-create.md](lark-calendar-0.md#s-859d2833af4b4d57)
- [lark-calendar-update.md](lark-calendar-0.md#s-4d2b30bbb64781b9)
- [SKILL.md](lark-calendar-0.md#s-3d0136d3d09a934d)


<a id="s-cfb58c530b6fbded"></a>

## references/lark-calendar-suggestion.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +suggestion


根据非明确时间或一段时间范围，推荐多个可用时间块方案。帮助用户解决协调时间的难题。

**调用时机 (Agent Guidance):**
- ✅ **当用户需求涉及寻找时间块，且时间未完全确定**（如`今天`、`近三天`、`本周`、`下午`, `无时间描述`）时，调用此工具来获取推荐时间块给用户选择（包括但不限于预约日程）。
- ❌ **当用户已经明确了具体的时间点**（如`今天下午3点`），则**不需要**调用此工具

## 命令

```text
# 获取默认的时间推荐方案（搜索范围：当前时刻至当天结束）
lark-cli calendar +suggestion

# 获取指定时间区间内的推荐方案（支持日期简写或完整 ISO 8601）
lark-cli calendar +suggestion \
  --start "2026-03-19" \
  --end "2026-03-20"

# 结合参与人及会议时长获取推荐方案（时长单位：分钟）
# --attendee-ids 支持传入用户（ou_ 前缀）和群组（oc_ 前缀）混合列表
lark-cli calendar +suggestion \
  --start "2026-03-19T14:00:00+08:00" \
  --end "2026-03-19T18:00:00+08:00" \
  --attendee-ids ou_xxx,oc_yyy \
  --duration-minutes 60

# 排除特定时间段
lark-cli calendar +suggestion \
  --start "2026-03-19T08:00:00+08:00" \
  --end "2026-03-19T18:00:00+08:00" \
  --exclude "2026-03-19T12:00:00+08:00~2026-03-19T13:00:00+08:00"

# JSON 格式输出
lark-cli calendar +suggestion \
  --start "2026-03-19T08:00:00+08:00" \
  --end "2026-03-19T18:00:00+08:00" \
  --format json
```

## 参数

| 参数                              | 必填    | 说明                                                                  |
| ------------------------------- | ----- | ------------------------------------------------------------------- |
| `--start <time>`                | 否     | 搜索区间开始时间（支持日期/ISO 8601等格式，默认**当前时间**）                                |
| `--end <time>`                  | 否     | 搜索区间结束时间（默认与 `--start` 属于同一天，自动取当天结束时间）                                                     |
| `--attendee-ids <id_list>`     | 否     | 目标参与人 ID 列表。提取对应实体的 ID。支持用户（`ou_` 前缀）和群组（`oc_` 前缀）。多个 ID 使用英文逗号分隔。**不要传入 bot 的 open_id**：bot 是虚拟身份，可并行多个会议、无忙闲语义，传入会干扰推荐时段的忙闲计算。 |
| `--event-rrule <rrule>`         | 否     | 重复日程的重复性规则，规则设置方式参考rfc5545。**【⚠️注意：系统绝对不支持 COUNT，如需限制重复次数，必须转为 UNTIL】**。示例值："FREQ=DAILY;INTERVAL=1"                                              |
| `--duration-minutes <min>`      | 否     | 会议时长（分钟）。优先使用用户显式指定的值，若未指定则尝试根据上下文推断，推断失败则不传                                        |
| `--timezone <tz>`               | 否     | 对话中明确提及的预约日程所使用的时区（默认取用户设备时区，例如 `Asia/Shanghai`）                                |
| `--exclude <times>`             | 否     | 排除的时间块，支持 `start~end` 格式（如 `2026-03-19T12:00:00+08:00~2026-03-19T13:00:00+08:00`），多个用逗号分隔 |
| `--format <flag>`               | 否     | 输出格式（固定为 `json`） |
| `--dry-run`                     | 否     | 预览 API 调用，不执行                                                       |

## 时间格式

`--start`、`--end` 以及 `--exclude` 支持以下格式自动解析：

| 格式            | 示例                          | 说明                   |
| ------------- | --------------------------- | -------------------- |
| ISO 8601      | `2026-03-19T08:40:29+08:00` | 完整格式，精确包含日期、时间及带冒号的时区偏移 |
| 日期+时间       | `2026-03-19 08:40:29`       | 自动补全时区               |
| 仅日期          | `2026-03-19`                | start 取 00:00:00，end 取 23:59:59 |
| Unix 时间戳     | `1741564800`                | 秒级时间戳               |

## 输出格式

**将推荐结果整理为易读的选项列表，并附上润色后的推荐理由：**

```text
## 2026-03-19 周四

- **选项 1：10:00 - 10:30**
  推荐理由：所有参与者均空闲。

```
> **AI 行为指导：** 
> - **结构化展示选项与理由**：以清晰的列表呈现推荐时间方案，并直接询问用户意向。**必须**结合“用户原始需求”与“推荐理由”说明每个时间块的优势，输出话术需简明、直接、无歧义。
> - **如实反馈冲突情况**：注意，返回的推荐方案不一定都是完全空闲的（即使明确要求找空闲时间，系统在难以满足时也会返回包含忙闲冲突的方案）。判断推荐方案是否完全空闲，可以从推荐理由中是否表达了“完全空闲”或“没有任何忙闲冲突”来判断。如果推荐方案存在忙闲冲突，**必须**在展示方案时向用户如实说明冲突情况，绝不能误导用户认为是完全空闲。
> - **主动提供优化建议**：当满足以下任一条件时（1. 返回结果包含 `ai_action_guidance` 字段内容；2. 用户要求找个空闲时间，但所有推荐方案都不是完全空闲的），你**必须**主动提供优化建议。若存在 `ai_action_guidance` 字段，需严格依据其核心意图生成引导话术；否则，请基于实际冲突情况主动提供合理的替代方案（如：建议调整时间范围、会议时长或参与人）。

## 典型场景

### 1. 查找多人的共同空闲会议时间

```text
# 指定两名参与人，并要求找一个 45 分钟的空闲时段
lark-cli calendar +suggestion \
  --start "2026-03-19T08:00:00+08:00" \
  --end "2026-03-19T18:00:00+08:00" \
  --attendee-ids ou_member_a,ou_member_b \
  --duration-minutes 45
```

### 2. 用户对当前推荐不满意，要求“换一批”

```text
# 将上一次推荐的时段作为排除条件传入
lark-cli calendar +suggestion \
  --start "2026-03-19T08:00:00+08:00" \
  --end "2026-03-19T18:00:00+08:00" \
  --exclude "2026-03-19T10:00:00+08:00~2026-03-19T10:30:00+08:00"
```

## 与其他命令对比

| 命令                     | 用途       | 输出内容                |
| ---------------------- | -------- | ------------------- |
| `calendar +suggestion` | 根据非明确时间或一段时间范围，推荐多个可用时间块方案 | 返回多个推荐时段及其理由，以及后续建议 |
| `calendar +freebusy`   | 查询忙闲时段   | 只返回忙碌时段列表和rsvp状态（无日程详情）    |

**选择建议**：

- **寻找可用时间（含开会等场景）** → 优先使用 `+suggestion`，直接获取智能推荐方案
- **了解个人当前忙碌情况** → 使用 `+freebusy`

## 参考

- [lark-calendar-create](lark-calendar-0.md#s-859d2833af4b4d57) — 创建日程
- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) — skill 入口与路由


<a id="s-cc3f1096bf6a8c7e"></a>

## references/lark-calendar-transfer.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +transfer

把一个日程的**组织者（organizer）**转让给另一个用户或机器人。用户和机器人之间可以任意互转。

## 命令

```text
# 转让给某人（原组织者保留为参与人）
lark-cli calendar +transfer --event-id <event_id> --to-user-id ou_xxx --yes

# 转让并把原组织者从参与人中移除
lark-cli calendar +transfer --event-id <event_id> --to-user-id ou_xxx --remove-original-organizer --yes

# 指定日历
lark-cli calendar +transfer --calendar-id <calendar_id> --event-id <event_id> --to-user-id ou_xxx --yes

# 重复性日程：必须显式确认整个序列一起转让
lark-cli calendar +transfer --event-id <event_id> --to-user-id ou_xxx --transfer-series --yes

# 预览请求，不实际执行
lark-cli calendar +transfer --event-id <event_id> --to-user-id ou_xxx --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--event-id <id>` | **是** | 日程 ID（`uid_originalTime` 形式） |
| `--to-user-id <ou_...>` | **是** | 接收人 open_id，成为新组织者；用户和机器人都可以 |
| `--calendar-id <id>` | 否 | 日程所在日历 ID（省略则使用主日历） |
| `--remove-original-organizer` | 否 | 转让后把原组织者移出参与人；默认保留。日程在共享日历上时服务端一定会移除 |
| `--transfer-series` | 否 | 确认整个重复性序列一起转让；重复性日程必填 |
| `--yes` | **是**（非 dry-run） | 高敏写操作确认 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 转让方向

转出方和接收方是两个**互相独立**的参数，四种组合都支持：

- **转出方**由 `--as` 决定，必须是日程**当前组织者**的身份。bot 组织的日程用 `--as bot`，用户自己的日程用 `--as user`。用非组织者身份调用会返回 403。
- **接收方**由 `--to-user-id` 决定，传谁的 open_id 就转给谁，是人还是机器人不影响命令写法。

| 方向 | 命令 |
|------|------|
| user → user | `--as user --to-user-id <对方用户 open_id>` |
| user → bot | `--as user --to-user-id <bot 的 open_id>` |
| bot → user | `--as bot --to-user-id <用户 open_id>` |
| bot → bot | `--as bot --to-user-id <另一个 bot 的 open_id>` |

**取接收人 open_id**：

```text
# 用户
lark-cli contact +search-user --query <姓名> --as user
# 机器人：从它所在群的成员列表里取 bots[] 中的 open_id
lark-cli im +chat-members-list --chat-id <chat_id> --member-types bot
```

机器人的 open_id 同样是 `ou_` 开头；不要传 `cli_` 开头的 app_id，那是应用 ID，不是日程参与人身份。

无论哪个方向，转让都要求转出方和接收方**同租户**。

## 重复性日程

后端按 `uid` 定位日程，忽略 `original_time`，**无法只转让某一次实例**。因此传入任何一个实例或例外的 `event_id`，都会把整个序列（含所有例外）一起转让。

是重复性日程且未加 `--transfer-series` 时命令直接失败（`failed_precondition`），不会发出转让请求。收到这个错误时**先向用户确认"整个重复日程都转让"**，得到确认后再带 `--transfer-series` 重跑；不要自动重试。已确认时加 `--transfer-series` 会跳过这次预读。

## 返回中的 `original_organizer_removed`

**共享日历不属于任何组织者，转让时服务端会强制把原组织者移出日程；主日历则会把原组织者保留为参与人。** 转让接口成功时不返回这个结果，所以命令只在能确定时才输出该字段：

| 情况 | 返回 |
|------|------|
| 带 `--remove-original-organizer` | `original_organizer_removed: true` |
| 省略 `--calendar-id`（主日历） | `original_organizer_removed: false` |
| 传了 `--calendar-id` 且未传 `--remove-original-organizer` | **不返回该字段**，stderr 给一条 note 说明共享日历会强制移除 |

字段缺失时**不要**告诉用户"原组织者已保留为参与人"，也不要断言已被移除。需要确认就转让后读一次日程看参与人，或一开始就显式传 `--remove-original-organizer`。

## 提示

- 转让不可逆，且会连同日程上的会议纪要、笔记和附件一起移交给新组织者。
- 需要 `calendar:calendar.event:transfer` 权限；转让前的重复性预读需要 `calendar:calendar.event:read`（带 `--transfer-series` 时不读）。

## 参考

- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) -- skill 入口与路由
- [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317)


<a id="s-4d2b30bbb64781b9"></a>

## references/lark-calendar-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# calendar +update


更新既有日程字段，或独立增量添加/移除参会人和会议室。

`+update` 支持三类互相独立的动作：更新日程字段、添加参会人/会议室、移除参会人/会议室。它们可以单独执行，也可以在同一次命令中组合执行。

## 推荐命令

```text
# 更新标题、描述、时间
lark-cli calendar +update \
  --event-id "<EVENT_ID>" \
  --summary "产品评审" \
  --description "评审需求范围、排期与风险" \
  --start "2026-03-12T14:00+08:00" \
  --end "2026-03-12T15:00+08:00"

# 增量添加参会人和会议室
lark-cli calendar +update \
  --event-id "<EVENT_ID>" \
  --add-attendee-ids "ou_aaa,ou_bbb,omm_room"

# 移除参会人和会议室
lark-cli calendar +update \
  --event-id "<EVENT_ID>" \
  --remove-attendee-ids "ou_aaa,omm_room"

# 同时更新日程信息、移除旧会议室、添加新会议室
lark-cli calendar +update \
  --event-id "<EVENT_ID>" \
  --summary "产品评审" \
  --start "2026-03-12T15:00+08:00" \
  --end "2026-03-12T16:00+08:00" \
  --remove-attendee-ids "omm_old_room" \
  --add-attendee-ids "omm_new_room"
```

参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| `--event-id <id>` | 是 | 要更新的日程 ID。重复性日程请根据操作范围选择 ID，详见 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317) |
| `--calendar-id <id>` | 否 | 日历 ID（省略则使用 `primary`） |
| `--summary <text>` | 否 | 新日程标题。仅在显式传入 `--summary` 时更新；若传空字符串，会把标题清空 |
| `--description <markdown>` | 否 | 新日程描述，统一使用此字段，格式为 **Markdown**（加粗、斜体、下划线 `<u>...</u>`、删除线、链接 `[文本](url)`、标题 `# `~`### `（最多三级）、引用 `> `、有序/无序列表、GFM 表格 `\| 列1 \| 列2 \|` + 分隔行 `\| --- \| --- \|`、以及图片 `![图片名](图片URL)`（标准 Markdown 图片语法：远程 URL 原样使用；**本地图片路径**（相对路径、且位于当前工作目录内）会自动上传到云盘并在端上内联渲染——绝对路径或工作目录之外的路径会报错；端上已有图片读回为 Markdown 图片）。飞书文档 URL（裸链接或 `[文本](url)`）会自动解析为内联文档，端上展示文档标题。支持 `@文件路径` 或 `-`（stdin）读取。仅在显式传入时更新；传空字符串 `""` 会清空描述。**禁止**用 `***文本***` 同时表示加粗+斜体（端上会残留 `*`）；应嵌套书写，如 `**<u>*~~文本~~*</u>**` 或 `*<u>**~~文本~~**</u>*`。 |
| `--start <time>` | 否 | 新开始时间（ISO 8601，**必须带时区偏移**，如 `2026-03-12T14:00+08:00`；不带偏移会按进程时区解析致偏移）。更新日程时间时必须同时传 `--end` |
| `--end <time>` | 否 | 新结束时间（ISO 8601，**必须带时区偏移**）。更新日程时间时必须同时传 `--start` |
| `--rrule <rrule>` | 否 | 新重复规则（RFC5545）。**不要使用 COUNT；如需限制次数，推算后转为 UNTIL** |
| `--add-attendee-ids <id_list>` | 否 | 增量添加参会人/会议室，逗号分隔。支持用户 `ou_`、群组 `oc_`、会议室 `omm_` |
| `--remove-attendee-ids <id_list>` | 否 | 增量移除参会人/会议室，逗号分隔。支持用户 `ou_`、群组 `oc_`、会议室 `omm_` |
| `--notify` | 否 | 是否发送更新通知，默认 `true`。可用 `--notify=false` 静默更新 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

至少需要提供一个动作：`--summary`、`--description`、`--start/--end`、`--rrule`、`--add-attendee-ids` 或 `--remove-attendee-ids`。

## 使用规则

- `--add-attendee-ids` 是**增量添加**，不是替换最终参与人列表。不要用它表达“只保留这些人”。
- 对 `--summary`、`--description`，CLI 以“是否显式传入该 flag”判断是否更新，而不是以“值是否为空”判断；如果显式传入空字符串，会把对应字段清空。
- 日程描述统一走 `--description`（按 Markdown 富文本处理）。
- 行内同时加粗和斜体时，**禁止**写 `***文本***`（端上会残留 `*`）；必须让 `**` 与 `*` 各自成对嵌套，例如 `**<u>*~~文本~~*</u>**` 或 `*<u>**~~文本~~**</u>*`。
- 只想增删参会人或会议室时，不需要同时传 `--summary`、`--start`、`--end` 等日程字段。
- 只想修改标题、描述、时间或重复规则时，不需要同时传 `--add-attendee-ids` 或 `--remove-attendee-ids`。
- 如需替换某个参与人、群组或会议室，使用 `--remove-attendee-ids <旧ID>` + `--add-attendee-ids <新ID>`。
- bot 可作为合法参会人添加，无需剔除。
- 会议室是 resource attendee，必须使用 `omm_` ID 添加到参会人列表，不能脱离日程单独预定。
- 更新重复性日程时，必须先确定操作范围（仅此次/全部/此次及后续），然后按 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317) 执行。
- 当同一次命令组合多个动作时，执行顺序为“日程字段 -> 移除参会人 -> 添加参会人”。若中途失败，不会自动回滚已成功步骤；错误信息会说明已完成的步骤。
**⚠️ 高风险操作**: 修改时间时必须先读取原日程时长并计算新 end。如果 end 计算错误，会导致日程时长变化，用户会直接感知，禁止擅自改变原日程的时长。
**不得擅自附加 `--skip-room-check` 重试**：将错误信息（含会议室 ID 与原因）原样透传给用户，说明本次更新会导致会议室预定失败，明确询问是否仍要继续；用户确认后再带 `--skip-room-check` 重新执行。

预检失败（如接口 404 或返回错误）会降级放行：向 stderr 打一条 warning 后继续执行，避免因新接口不稳定阻塞正常更新。

## 高级用法（完整 API 命令）

`+update` 只覆盖标题、描述、时间、重复规则，以及参会人/会议室的增量添加或移除。

如需更新 `location`（地理位置，不含会议室位置）、`visibility`（日程公开范围）、自定义 `reminders`（提醒设置）、自定义 `attendee_ability`（参与人权限）、自定义 `free_busy_status`（日程忙闲状态）、`color`（颜色）、附件、视频会议信息、全天日程，或在新增参会人时配置可选参加状态 等高级参数，请改用完整的 API 命令。建议先通过 `lark-cli schema calendar.events.patch`、`lark-cli schema calendar.event.attendees.create`、`lark-cli schema calendar.event.attendees.batch_delete` 查看完整参数定义。

> 完整 API 命令的时间参数是 **Unix 秒字符串**（非 ISO 8601）。换算时**禁止依赖容器默认时区**（常为 UTC，会导致 8 小时偏移），必须显式指定目标时区。

## 预约/改约会议室场景

如果用户要“改会议时间”“换会议室”“给现有日程加会议室”，必须先阅读 [`lark-calendar-schedule-meeting.md`](lark-calendar-0.md#s-ef4c0627b1c3b332) 并按其中工作流处理：

- 明确时间且需要会议室：先 `+room-find`，再按需 `+freebusy`，用户确认后再 `+update`。
- 模糊时间或无时间：先 `+suggestion`，如需会议室再批量 `+room-find`，用户确认后再 `+update`。
- 面临时间方案或会议室方案选择时，必须先展示候选方案并等待用户确认。

## 参会人类型

| 前缀 | 类型 | 说明 |
|------|------|------|
| `ou_` | user | 飞书用户 open_id |
| `oc_` | chat | 飞书群组 |
| `omm_` | resource | 会议室 |

> [!CAUTION]
> 这是**写入操作**。执行前必须确认用户意图，特别是移除参会人/会议室或移动会议时间。

## 参考

- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) -- skill 入口与路由
- [lark-calendar-schedule-meeting](lark-calendar-0.md#s-ef4c0627b1c3b332) -- 预约/改约会议与会议室工作流
- [lark-calendar-room-find](lark-calendar-0.md#s-8e52cf22f22e0533) -- 查找可用会议室


<a id="s-68ce1569ce804fa7"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `calendar.v4.calendarAcl.create` | [Feishu/Lark]-日历-日历访问控制-创建访问控制-调用该接口以当前身份（应用或用户）为指定日历添加访问控制，即日历成员权限 | feishu_call_tool |
| `calendar.v4.calendarAcl.delete` | [Feishu/Lark]-日历-日历访问控制-删除访问控制-调用该接口以当前身份（应用或用户）删除指定日历内的某一访问控制，即成员权限 | feishu_call_tool |
| `calendar.v4.calendarAcl.list` | [Feishu/Lark]-日历-日历访问控制-获取访问控制列表-调用该接口以当前身份（应用或用户）获取指定日历的访问控制列表 | feishu_read_tool |
| `calendar.v4.calendarAcl.subscription` | [Feishu/Lark]-日历-日历访问控制-订阅日历访问控制变更事件-调用该接口以用户身份订阅指定日历下的访问控制变更事件 | feishu_call_tool |
| `calendar.v4.calendarAcl.unsubscription` | [Feishu/Lark]-日历-日历访问控制-取消订阅日历访问控制变更事件-调用该接口以用户身份取消订阅指定日历下的访问控制变更事件 | feishu_call_tool |
| `calendar.v4.calendar.create` | [Feishu/Lark]-日历-日历管理-创建共享日历-调用该接口为当前身份（应用或用户）创建一个共享日历 | feishu_call_tool |
| `calendar.v4.calendar.delete` | [Feishu/Lark]-日历-日历管理-删除共享日历-调用该接口以当前身份（应用或用户）删除某一指定的共享日历 | feishu_call_tool |
| `calendar.v4.calendarEventAttendee.batchDelete` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-删除日程参与人-调用该接口以当前身份（应用或用户）删除指定日程的一个或多个参与人 | feishu_call_tool |
| `calendar.v4.calendarEventAttendeeChatMember.list` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-获取日程参与群成员列表-调用该接口以当前身份（应用或用户）获取日程的群组类型参与人的群成员列表 | feishu_read_tool |
| `calendar.v4.calendarEventAttendee.create` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-添加日程参与人-调用该接口以当前身份（应用或用户）为指定日程添加一个或多个参与人，参与人类型包括用户、群组、会议室以及邮箱 | feishu_call_tool |
| `calendar.v4.calendarEventAttendee.list` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-获取日程参与人列表-调用该接口以当前身份（应用或用户）获取日程的参与人列表 | feishu_read_tool |
| `calendar.v4.calendarEvent.create` | [Feishu/Lark]-日历-日程管理-创建日程-调用该接口以当前身份（应用或用户）在指定日历上创建一个日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.delete` | [Feishu/Lark]-日历-日程管理-删除日程-调用该接口以当前身份（应用或用户）删除指定日历上的一个日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.get` | [Feishu/Lark]-日历-日程管理-获取日程-调用该接口以当前身份（应用或用户）获取指定日历内的某一日程信息，包括日程的标题、时间段、视频会议信息、公开范围以及参与人权限等 | feishu_read_tool |
| `calendar.v4.calendarEvent.instanceView` | [Feishu/Lark]-日历-日程管理-查询日程视图-调用该接口以用户身份查询指定日历下的日程视图。与[获取日程列表]不同的是，当前接口会按照重复日程的重复性规则展开成多个日程实例（instance），并根据查询的时间区间返回相应的日程实例信息 | feishu_read_tool |
| `calendar.v4.calendarEvent.instances` | [Feishu/Lark]-日历-日程管理-获取重复日程实例-调用该接口以当前身份（应用或用户）获取指定日历中的某一重复日程信息 | feishu_read_tool |
| `calendar.v4.calendarEvent.list` | [Feishu/Lark]-日历-日程管理-获取日程列表-调用该接口以当前身份（应用或用户）获取指定日历下的日程列表 | feishu_read_tool |
| `calendar.v4.calendarEventMeetingChat.create` | [Feishu/Lark]-日历-会议群-创建会议群-调用该接口以当前身份（应用或用户）为指定日程创建一个会议群 | feishu_call_tool |
| `calendar.v4.calendarEventMeetingChat.delete` | [Feishu/Lark]-日历-会议群-解绑会议群-调用该接口以当前身份（应用或用户）为日程解绑已创建的会议群 | feishu_call_tool |
| `calendar.v4.calendarEventMeetingMinute.create` | [Feishu/Lark]-日历-会议纪要-创建会议纪要-调用该接口为指定的日程创建会议纪要。纪要以文档形式展示，成功创建后会返回纪要文档 URL | feishu_call_tool |
| `calendar.v4.calendarEvent.patch` | [Feishu/Lark]-日历-日程管理-更新日程-调用该接口以当前身份（应用或用户）更新指定日历上的一个日程，包括日程标题、描述、开始与结束时间、视频会议以及日程地点等信息 | feishu_call_tool |
| `calendar.v4.calendarEvent.reply` | [Feishu/Lark]-日历-日程管理-回复日程-调用该接口以当前身份（应用或用户）回复日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.search` | [Feishu/Lark]-日历-日程管理-搜索日程-调用该接口搜索指定日历下的相关日程，支持关键词搜索、过滤条件搜索 | feishu_read_tool |
| `calendar.v4.calendarEvent.subscription` | [Feishu/Lark]-日历-日程管理-订阅日程变更事件-调用该接口以用户身份订阅指定日历下的日程变更事件 | feishu_call_tool |
| `calendar.v4.calendarEvent.unsubscription` | [Feishu/Lark]-日历-日程管理-取消订阅日程变更事件-调用该接口以用户身份取消订阅指定日历下的日程变更事件 | feishu_call_tool |
| `calendar.v4.calendar.get` | [Feishu/Lark]-日历-日历管理-查询日历信息-调用该接口以当前身份（应用或用户）查询指定日历的信息 | feishu_read_tool |
| `calendar.v4.calendar.list` | [Feishu/Lark]-日历-日历管理-查询日历列表-调用该接口分页查询当前身份（应用或用户）的日历列表 | feishu_read_tool |
| `calendar.v4.calendar.patch` | [Feishu/Lark]-日历-日历管理-更新日历信息-调用该接口以当前身份（应用或用户）修改指定日历的标题、描述、公开范围等信息 | feishu_call_tool |
| `calendar.v4.calendar.primary` | [Feishu/Lark]-日历-日历管理-查询主日历信息-调用该接口获取当前身份（应用或用户）的主日历信息 | feishu_read_tool |
| `calendar.v4.calendar.search` | [Feishu/Lark]-日历-日历管理-搜索日历-调用该接口通过关键字搜索日历，搜索结果为标题或描述包含关键字的公共日历或用户主日历 | feishu_read_tool |
| `calendar.v4.calendar.subscribe` | [Feishu/Lark]-日历-日历管理-订阅日历-调用该接口以当前身份（应用或用户）订阅指定的日历 | feishu_call_tool |
| `calendar.v4.calendar.subscription` | [Feishu/Lark]-日历-日历管理-订阅日历变更事件-调用该接口为当前用户身份订阅[日历变更事件] | feishu_call_tool |
| `calendar.v4.calendar.unsubscribe` | [Feishu/Lark]-日历-日历管理-取消订阅日历-调用该接口以当前身份（应用或用户）取消指定日历的订阅状态 | feishu_call_tool |
| `calendar.v4.calendar.unsubscription` | [Feishu/Lark]-日历-日历管理-取消订阅日历变更事件-调用该接口为当前用户身份取消订阅[日历变更事件] | feishu_call_tool |
| `calendar.v4.exchangeBinding.create` | [Feishu/Lark]-日历-同步 Exchange 日历信息-将 Exchange 账户绑定到飞书账户-调用该接口将 Exchange 账户绑定到飞书账户，进而支持 Exchange 日历的导入 | feishu_call_tool |
| `calendar.v4.exchangeBinding.delete` | [Feishu/Lark]-日历-同步 Exchange 日历信息-解除 Exchange 账户绑定-调用该接口解除 Exchange 账户和飞书账户的绑定关系，Exchange 账户解除绑定后才能和其他飞书账户继续绑定 | feishu_call_tool |
| `calendar.v4.exchangeBinding.get` | [Feishu/Lark]-日历-同步 Exchange 日历信息-查询 Exchange 账户的绑定状态-调用该接口获取 Exchange 账户的绑定状态，包括 Exchange 日历的同步状态 | feishu_read_tool |
| `calendar.v4.freebusy.list` | [Feishu/Lark]-日历-日历管理-查询主日历日程忙闲信息-调用该接口查询指定用户的主日历忙闲信息，或者查询指定会议室的忙闲信息 | feishu_read_tool |
| `calendar.v4.setting.generateCaldavConf` | [Feishu/Lark]-日历-同步到本地日历-生成 CalDAV 配置-调用该接口为当前用户生成一个 CalDAV 账号密码，用于将飞书日历信息同步到本地设备日历 | feishu_call_tool |
| `cli.calendar.calendars.create` | Create a shared calendar | feishu_call_tool |
| `cli.calendar.calendars.delete` | Delete shared calendar | feishu_call_tool |
| `cli.calendar.calendars.get` | Query calendar information | feishu_read_tool |
| `cli.calendar.calendars.list` | Query the calendar list | feishu_read_tool |
| `cli.calendar.calendars.patch` | Update calendar information | feishu_call_tool |
| `cli.calendar.calendars.primary` | 查询主日历信息。推荐使用此 API 获取主日历 ID，无需先 list 再过滤 | feishu_read_tool |
| `cli.calendar.calendars.search` | Search for calendars | feishu_read_tool |
| `cli.calendar.event.attendees.batch_delete` | Delete event invitees | feishu_call_tool |
| `cli.calendar.event.attendees.create` | Create event invitees | feishu_call_tool |
| `cli.calendar.event.attendees.list` | Obtain event invitee list | feishu_read_tool |
| `cli.calendar.events.create` | Create an event | feishu_call_tool |
| `cli.calendar.events.delete` | Delete an event | feishu_call_tool |
| `cli.calendar.events.get` | Obtain an event | feishu_read_tool |
| `cli.calendar.events.instance_view` | Query event view | feishu_read_tool |
| `cli.calendar.events.patch` | Update an event | feishu_call_tool |
| `cli.calendar.events.search_event` | 搜索日程 | feishu_read_tool |
| `cli.calendar.events.share_info` | 获取日程分享信息 | feishu_read_tool |
| `cli.calendar.freebusys.list` | Query availability of the primary calendar | feishu_read_tool |


<a id="s-104d56452b8c24b9"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# calendar (v4)

开始前先读 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流）（认证、权限处理）。

**CRITICAL — 凡涉及预约日程/会议室、调整时间或查询/搜索会议室，第一步 MUST 读 [`references/lark-calendar-schedule-meeting.md`](lark-calendar-0.md#s-ef4c0627b1c3b332)。仅编辑字段（改标题/描述）或增删参会人（不涉及时间和会议室）时可跳过，直接读 [`references/lark-calendar-update.md`](lark-calendar-0.md#s-4d2b30bbb64781b9)。**

## 身份

按**日程归属**选身份：

- 查看/管理登录用户本人的日程 → `--as user`（默认，绝大多数场景）。
- 查看/管理 bot 自己创建/拥有的日程 → `--as bot`

**对话人称映射**：「我」= 登录用户，「你」= 应用（bot）；作为字段取值的人称（参会人、会议 owner 等）不参与身份判定，如「你创建日程，邀请我、会议 owner 为我」→ `--as bot` 创建，登录用户仅作参会人与会议 owner。

```text
# 用户本人日程 → user
lark-cli calendar +agenda --as user
# bot 自建或参与的日程 → bot
lark-cli calendar +agenda --as bot
```

## Shortcuts

| Shortcut | 说明 |
|----------|------|
| `+agenda` | 查看日程安排（默认今天） |
| [`+meeting`](lark-calendar-0.md#s-a46ac6486d54bd0d) | 通过日程事件 ID 获取关联的视频会议信息（meeting_id、meeting_note），日程开过视频会议才会有meeting_id,**注意**: 视频会议链接获取走+get命令 |
| [`+create`](lark-calendar-0.md#s-859d2833af4b4d57) | 创建日程并邀请参会人（ISO 8601 时间） |
| [`+update`](lark-calendar-0.md#s-4d2b30bbb64781b9) | 更新既有日程字段，或独立增量添加/移除参会人和会议室；重复性日程/例外必须传 `--apply-to`（详见 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317)） |
| `+delete` | 删除日程；重复性日程/例外必须传 `--apply-to`（详见 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317)） |
| `+freebusy` | 查询主日历的忙闲/RSVP状态/空闲时间段。(**如需预约/推荐时间段**走 `+suggestion`——它综合工作时间、忙碌区间和休息时间推荐。) |
| [`+room-find`](lark-calendar-0.md#s-8e52cf22f22e0533) | 针对一个或多个**明确的**时间块查找可用会议室（无明确时间时禁止直接调用，需先走 +suggestion） |
| [`+rsvp`](lark-calendar-0.md#s-f55576b9cac50175) | 回复日程（接受/拒绝/待定） |
| [`+join-event`](lark-calendar-0.md#s-f67e2c0f5ffe4125) | 凭分享 token 加入日程（分享链接/二维码/分享卡片/RSVP 卡片） |
| [`+suggestion`](lark-calendar-0.md#s-cfb58c530b6fbded) | 根据非明确时间或一段时间范围，推荐多个可用时间块方案 |
| [`+transfer`](lark-calendar-0.md#s-cc3f1096bf6a8c7e) | 把日程组织者转让给另一个用户或机器人；不可逆，需 `--yes` |
| [`+list-attendees`](lark-calendar-0.md#s-2563add39b3ba428) | 列出日程的参与人和会议室（支持按 `--type` 过滤：user / resource / chat / third_party） |

### `+get` — 单日程详情

通过 `calendar_id` + `event_id` 获取**单个日程**详情。

```text
# calendar_id不传，默认primary
lark-cli calendar +get --calendar-id <calendar_id> --event-id <event_id>
```

日程描述统一使用 `description` 一个字段，按 **Markdown** 富文本处理。读取日程时 `description` 返回 Markdown 富文本（仅有纯文本描述时返回该纯文本）；创建/更新日程时也通过 `--description` 传入 Markdown。

> `+get` 返回不含参会人和会议室。需要参与人视角（用户 / 会议室 / 群 / 三方邮箱）请调用 [`+list-attendees`](lark-calendar-0.md#s-2563add39b3ba428)。

### `+search-event` — 按关键词、时间范围和参会人搜索日程

仅返回基础字段（`event_id`/`summary`/`start`/`end` 等），需要详情请走 `+get`。

```text
# query 按关键词 可选
# start/end 按时间范围（ISO 8601 或 YYYY-MM-DD）可选
# attendee-ids 按参会人（自动识别 ou_ 用户 / oc_ 群聊 / omm_ 会议室前缀）可选
# page-token 分页游标，用于继续翻页 可选
# page-size 每页数量，默认 30 可选
lark-cli calendar +search-event --query "周会" --start 2026-04-20 --end 2026-04-27 --attendee-ids "ou_user1,oc_chat1,omm_room1" --page-token <page_token> --page-size 30
```

`--attendee-ids` 的多值语义：**同类型内为 OR（并集）**——只要日程命中列表中的任意一个同类型 ID，就会返回。

- `--attendee-ids "ou_A,ou_B"` = A **或** B 参加的日程（**不是** A 和 B 都参加的）。

### `+delete` — 删除日程

```text
# calendar_id不传，默认primary
lark-cli calendar +delete --calendar-id <calendar_id> --event-id <event_id> --notify=true
```

### `+agenda` — 查看近期日程安排

默认查询当天。结果应整理为按日期分组、按开始时间升序的易读时间线。

```text
# start/end 时间范围（ISO 8601 / YYYY-MM-DD / Unix 秒），均可选；默认当天
# calendar-id 日历 ID（默认primary）可选
lark-cli calendar +agenda --start 2026-03-10 --end 2026-03-17 --calendar-id <calendar_id>
```

注意：
- 已取消的日程自动过滤；无日程时直接告知"日程清空"。
- 时间范围超过 40 天会自动拆分查询并合并结果。

### `+freebusy` — 查询主日历忙闲时段 / 事件 / 公共空闲

`+freebusy` 一个入口承担四种视角：几何计算类（`busy` / `free` / `common_free`）走自动合并；事件维度类（`raw_busy`）保留每条上游日程 + `rsvp_status`。

```text
# start/end 时间范围（ISO 8601 / YYYY-MM-DD / Unix 秒），均可选；默认当天
# user-id 目标用户 open_id，可重复或用逗号分隔；默认当前登录用户，bot 身份必须显式传至少一个
# type 视角四选一（默认 busy）：
#   busy         每个 user 合并后的忙碌区间（找空档、看忙碌时段）
#   raw_busy     每个 user 的原始日程块 + rsvp_status（数会议、看每个会的 rsvp）
#   free         每个 user 在时间窗内的空闲区间（可带 --min-duration 过滤）
#   common_free  所有 user 的共同空闲区间（可带 --min-duration 过滤）
# min-duration 仅对 free / common_free 生效；Go duration 格式，例如 30m、1h、90m

# 查询忙碌时间段（去重并合并相邻/重叠段）
lark-cli calendar +freebusy --start 2026-03-11 --end 2026-03-11 --user-id ou_a,ou_b --type busy

# 看别人有几个会、每个会的起止 + rsvp（不合并相邻/重叠段，带rsvp状态）
lark-cli calendar +freebusy --start 2026-03-11 --end 2026-03-11 --user-id ou_a,ou_b --type raw_busy

# 查询用户空闲时间段
lark-cli calendar +freebusy --start 2026-03-11 --end 2026-03-11 --user-id ou_a,ou_b --type free

# 多人公共空闲时间段（推荐替代手工合并）
lark-cli calendar +freebusy --start 2026-03-11T09:00:00+08:00 --end 2026-03-11T18:00:00+08:00 --user-id ou_a,ou_b --type common_free --min-duration 30m
```

用法提示：
- **`+freebusy` 只适用于查询忙碌/空闲时间段这一事实**。如果目标是"给会议**推荐**一个合适的时间段"（单人或多人），必须优先使用 [`+suggestion`](lark-calendar-0.md#s-cfb58c530b6fbded)——它会综合**工作时间段、忙碌时间段、休息时间段**来推荐，`+freebusy` 只回答"哪些区间空着"，不判断该区间是否适合排会。
- **多人公共空闲**：只想拿"哪些区间共同没被占"→ `--type common_free [--min-duration <dur>]`；想拿"推荐的会议时间段"→ 走 `+suggestion`。

## 前置条件路由

> **先判断是否重复性日程**：若操作对象是重复性日程，必须先读 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317)，并在用户未明确范围时先确认「仅此次/全部/此次及后续」（不要默认仅此次），再按下表进入具体操作流程。

| 场景 | 前置要求 |
|------|----------|
| 预约日程/会议、调整时间、查会议室 | 先读 [lark-calendar-schedule-meeting.md](lark-calendar-0.md#s-ef4c0627b1c3b332) |
| 仅编辑字段（标题/描述）或增删参会人 | 先定位 `event_id`，再读 [lark-calendar-update.md](lark-calendar-0.md#s-4d2b30bbb64781b9) |
| 调用任何 Shortcut | 先读其对应 reference 文档 |

## 写操作反馈

创建、更新、删除、RSVP 等写操作完成后，直接基于命令返回结果反馈用户；不要为了“确认是否生效”主动发起二次查询。只有用户明确要求复查，或命令返回信息不足以回答用户问题时，才需要再查询。

## 核心概念

- **日程实例（Instance）**：重复性日程展开后的具体时间实例。「仅此次」操作时使用具体实例的 `event_id`；「全部」或「此次及后续」操作时需对原重复性日程操作（使用原日程 `event_id`），并按需处理例外。
- **重复性日程例外（Exception）**：对重复性日程某次实例做过「仅此次」编辑后产生的独立日程（拥有独立 `event_id`）。删除/更新「全部」时必须同时处理例外，否则例外会残留。
- **全天日程（All-day Event）**：只按日期占用、没有具体起止时刻的日程，结束日期是包含在日程时间内的。
- **时间块 vs 时间范围**：时间块是具体确定的连续时间段（如 `14:00~15:00`），时间范围是泛指（如"今天下午"）。`+room-find` 必须基于确定时间块，不能基于模糊范围。
- **会议室（Room）**："room"不是"房间"，是"会议室"。会议室是日程的一种参与人（resource attendee），不能脱离日程单独预定。
- **日程会议 ID（Meeting ID）**：日程的历史视频会议 ID，在日程上开过视频会议才会有。
- **日程分享链接 vs 会议链接**：两者是不同事物，不可混用。
  - 日程分享链接：`https://<domain>/calendar/share?token=<token>`，指向日程本身，用于分享日程详情。**分享日程给某个人、某个群或粘贴到文档中，需要的都是这个日程分享链接（通过 `calendar events share_info` 获取），不是 applink**；禁止自己拼接 applink 或用 applink 代替。
  - 会议链接：`https://<domain>/j/<number>`，指向视频会议入口；同一重复性日程序列的所有实例共用同一个会议链接。

## 术语映射

用户日常说的"帮我约个日历""查一下今天的日历"，实际意图是针对**日程（Event）**的创建或查询，而非操作日历（Calendar）容器本身。自动将口语化的"日历"意图映射为"日程"操作。

## 意图路由

**日程与会议的关系**：用户口中的「会议」通常不区分日程和视频会议。定义、三种查询意图（当前/未来/过去）的分流规则见 [日程与视频会议的关系](lark-calendar-0.md#s-15f633d24613c559)。

| 用户意图 | 路由到 |
|----------|--------|
| 查询过去的会议（"昨天的会议""上周的会"）/今天有哪些会议 / 当前正在开的会议 | 先读 [日程与视频会议的关系](lark-calendar-0.md#s-15f633d24613c559) |
| 未来的会议 / 明天/下周的会议 | 本 skill：视频会议不存在于未来，等价于查日程 |
| 按关键词搜索日程 | 本 skill（`+search-event`） |
| 从日程获取关联的视频会议 ID 或用户绑定的会议纪要文档 | 本 skill（[`+meeting`](lark-calendar-0.md#s-a46ac6486d54bd0d)） |
| 查看日程的参会人 / 会议室（含 `--type resource` 只看会议室） | 本 skill（[`+list-attendees`](lark-calendar-0.md#s-2563add39b3ba428)） |
| 把日程分享给某人 / 群 / 粘贴到文档 | 本 skill：先 `calendar events share_info` 取**日程分享链接**，再走 [lark-im](lark-im-0.md#s-29d24f3594acb424) 发送或粘贴该链接；**分享日程给某个人、某个群或粘贴到文档中，需要的都是日程分享链接，不是 applink**，不要自己拼接或用 applink 代替 |
| 从日程进一步拿 AI 智能纪要 / 逐字稿 / 妙记产物 | 先 `+meeting` 取 `meeting_id`，再进入 [`lark-meeting`]（按模块名读取对应工作流）：[`vc +detail`]（按模块名读取对应工作流） → [`note +detail`]（按模块名读取对应工作流） / [`minutes +detail`]（按模块名读取对应工作流） |
| 预约/改约日程、调整时间、添加/更换会议室、查会议室 | 先判断新建 vs 编辑，再进入 [schedule-meeting 工作流](lark-calendar-0.md#s-ef4c0627b1c3b332) |
| 仅编辑日程字段（标题/描述）或增删参会人（不涉及时间和会议室） | 先定位 `event_id`，再读 [+update](lark-calendar-0.md#s-4d2b30bbb64781b9) 执行变更 |
| 编辑/删除重复性日程（「改这个重复日程」「删掉后面的」「全部取消」等） | 先读 [重复性日程操作规范](lark-calendar-0.md#s-b4d4cc7de8425317)；`+update` / `+delete` 均通过 `--apply-to=single|all|this-and-following` 指定范围 |
| 转让日程组织者（「把这个日程交给 XX」「组织者改成 XX」「这个会转给我」「bot 建完还给我」） | 读 [+transfer](lark-calendar-0.md#s-cc3f1096bf6a8c7e)；`--as` 用**当前组织者**身份，`--to-user-id` 传接收人，用户和机器人任意互转 |

## 任务类型分流

处理"预约/改约日程、添加/移除参会人、添加/更换会议室、调整时间"时，必须先判断新建 vs 编辑：

- **编辑已有日程的强信号**：用户提到已存在的日程锚点（标题、时间段、`这个日程`、`这场会`）并表达修改动作（添加、移除、改到、换会议室、调整时间）。默认走编辑流，绝不能按新建处理。
- **新建日程**：用户表达新增意图（"新约一个会""创建一个日程""安排一次会议"），且没有指向既有日程的修改动作。

## 时间推断规范

- **星期的定义**：周一是一周的第一天，周日是最后一天。计算"下周一"等相对日期时，基于当前真实日期推算。
- **一天的范围**：用户提到"明天""今天"等泛指某天时，时间范围应覆盖整天，不要自行缩减。
- **历史时间约束**：不能预约已经完全过去的时间。唯一例外是"跨越当前时间"的日程（开始在过去、结束在未来）。

## 会议室规则

- 凡是"预定/查询/搜索可用会议室"，都必须进入 [schedule-meeting 工作流](lark-calendar-0.md#s-ef4c0627b1c3b332)，会议室参数规范详见 [+room-find](lark-calendar-0.md#s-8e52cf22f22e0533)。
- `+room-find` 的时间输入必须是确定时间块，不能是时间区间搜索。
- 用户仅要求"查会议室"但未提供明确时间时，必须先调用 `+suggestion` 获取可用时间块，再将时间块交给 `+room-find`。严禁猜测时间盲目调用。
- 编辑已有日程时，"添加会议室"默认是增量语义，保留已有会议室；只有用户明确说"更换会议室""移除会议室"时才删除旧会议室。

## API Resources

```text
# 通用调用格式
lark-cli calendar <resource> <method> [flags]

# 查询用户主日历
lark-cli calendar calendars primary

# 获取日程分享链接（分享给他人/群前必须先拿到）
# 返回形如 {{domain}}/calendar/share?token=<token> 的分享链接，不是 applink；直接把该链接发给对方（对方可凭链接中的 token 走 +join-event 加入）
lark-cli calendar events share_info --calendar-id <calendar_id> --event-id <event_id>

# 删除日程
lark-cli calendar events delete --calendar-id <calendar_id> --event-id <event_id>
```

> `calendar_id` 可以直接传 `primary`，代表当前调用身份的主日历 ID。

### 查询资源的方法列表以及方法的使用方式

- 列出某资源下的方法：`lark-cli calendar <resource> -h`
- 查看方法的cli flag：`lark-cli calendar <resource> <method> -h`
- 查看方法API参数：`lark-cli schema calendar.<resource>.<method>`

`<resource>` 为 `calendars`（日历本身）/ `events`（日程）/ `event.attendees`（参与人）/ `freebusys`（忙闲）。例：`lark-cli schema calendar.events.delete`。

## 常用其他域命令

```text
# 批量搜索多个用户，更多参数详见 lark-contact
lark-cli contact +search-user --queries "<q1>,<q2>" --as user

# 搜索群聊，更多参数详见 lark-im
lark-cli im +chat-search --query <query> --as user
```

> 搜索用户/群不支持 bot 身份，必须用 `--as user`。**解析不到或类型不明确时，向用户澄清该参会人类型，不要靠名字形态硬猜类型。**

## 不在本 skill 范围

- 查询过去的视频会议记录 → [lark-meeting]（按模块名读取对应工作流）
- 待办任务管理 → [lark-task](lark-task-0.md#s-c03ee45b65ed2a9e)
- 通讯录 → [lark-contact](lark-contact-0.md#s-c7dcb2e78118aadb)
- 即时通讯 → [lark-im](lark-im-0.md#s-29d24f3594acb424)
- 会议室物理设施管理 → 管理员后台

**注意（强制性）：**
- 涉及日期（时间）字符串与时间戳的相互转换时，务必调用系统命令或脚本代码等外部工具进行处理，以确保转换的绝对准确；换算**禁止依赖容器默认时区**（常为 UTC，会导致 8 小时偏移），必须显式指定目标时区。违者将导致严重的逻辑错误！
