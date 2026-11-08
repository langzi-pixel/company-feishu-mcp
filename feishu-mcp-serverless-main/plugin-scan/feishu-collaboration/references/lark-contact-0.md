<a id="s-c7dcb2e78118aadb"></a>

## SKILL.md


# contact

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 已有 ID 时按 user_id_type 查人；姓名查询使用真实搜索接口，不能把 list 的第一页当作全公司搜索结果。

2. 同名候选用部门、邮箱等已有信息区分；发送或授权前若仍不唯一，展示最少必要候选请用户选择。不能直接选第一个。

3. 只取得任务所需字段；open_id、union_id、user_id 不可互换；不凭姓名推断公司或账号。

## 按需参考

- [工具与合同](lark-contact-0.md#s-37d87097a225a0f9)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-contact-0.md#s-4148f56f6c60012e)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-a8f9f3b86ecdb129"></a>

## references/lark-contact-get-user.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# +get-user

按 ID 取用户基本信息(姓名等)。

```text
# 取自己
lark-cli contact +get-user --as user

# bot 按 ID 取他人
lark-cli contact +get-user --user-id ou_xxx --as bot

# 按 union_id / user_id 取(默认 open_id)
lark-cli contact +get-user --user-id <id> --user-id-type union_id --as bot
```

## 注意事项

- **user 身份按 ID 取他人请用 `+search-user --user-ids <id>`**,字段比本命令多(部门 / 邮箱 / 是否激活等)。本命令的 user 模式只回很少字段。
- **`--as bot` 必须传 `--user-id`**:不传会直接报错(只有 user 身份能省略 `--user-id` 取自己)。


<a id="s-1d63f69fa0d94fd3"></a>

## references/lark-contact-search-bot.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# +search-bot

按关键词搜索当前用户可见的机器人。仅支持 user 身份,需要 `search:bot` 权限。

- ✅ 用关键词搜索机器人并获取 open_id
- ✅ 一次搜索多个关键词(`--queries`)
- ✅ 在指定群范围内搜索机器人(`--chat-ids`)

## 参数

必须传 `--query` 或 `--queries`。`--chat-ids` 指定搜索范围,`--has-chatted` 筛选已聊过的机器人;两者都不能单独使用。

| Flag | 说明 |
|---|---|
| `--query <text>` | 搜索一个关键词,最多 50 个字符 |
| `--queries <csv>` | 并行搜索多个关键词,最多 20 个;每个最多 50 个字符。不能和 `--query` 一起使用 |
| `--chat-ids <csv>` | 只在指定群内搜索,最多 100 个群;支持群 ID 或群链接 |
| `--has-chatted` | 只返回聊过天的机器人;不需要时不要传此参数 |
| `--page-size <n>` | 返回条数,1–30,默认 20 |

```text
lark-cli contact +search-bot --query '会议助手' --as user
lark-cli contact +search-bot --query '助手' --has-chatted --as user
lark-cli contact +search-bot --queries '会议助手,日报助手,审批助手' --as user
```

## 输出

| 字段 | 类型 | 说明 | 空值时 |
|---|---|---|---|
| `open_id` | string | 机器人 ID | 始终非空 |
| `name` | string | 机器人名称 | 空字符串 |
| `description` | string | 机器人简介 | 字段省略 |
| `chat_id` | string | 与机器人的单聊 ID | 空字符串 |
| `enable_join_group` | bool | 是否允许加入群聊 | — |
| `is_agent` | bool | 是否是智能体 | — |
| `tenant_id` | string | 租户标识 | 字段省略 |
| `match_segments` | string[] | 命中的文本片段 | 无命中时为 `[]` |

### 没有分页

不支持分页。`has_more=true` 时改用更具体的关键词,或调整搜索范围。

### 多条命中怎么选

命中多个机器人时,结合 `description` 和 `is_agent` 判断。后续要发消息或拉群时,让用户确认目标,不要直接选择第一条。

```text
lark-cli contact +search-bot --query '会议助手' \
  --jq '.data.bots[] | select((.description // "") | contains("<功能关键词>"))' --as user
```

## fanout(`--queries`)

输出为 `{bots[], queries[], notice?}`。`has_more` 只出现在每个关键词的结果中。

- `bots[].matched_query`:该结果对应的关键词
- `queries[]`:每个关键词的执行结果,格式为 `{query, error?, has_more, notice?}`
- 部分关键词失败时保留其他结果;全部失败时命令报错
- `--chat-ids` 和 `--has-chatted` 对所有关键词生效


<a id="s-f3d322c87ecb0195"></a>

## references/lark-contact-search-user.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# +search-user

仅支持 user 身份。

## 适用范围

- ✅ 已知姓名 / 邮箱 / 「聊过的人」想找出 open_id
- ✅ 已知一组 open_id 想批量校验或回填字段(`--user-ids`,最多 100,支持 `me`)
- ✅ 按聊天关系 / 在职状态 / 租户边界 / 企业邮箱等维度筛选员工
- ❌ 已知 open_id 想发消息 → 直接走 `lark-im`,不经过本命令

## 关键 flag

`--query` / `--queries` / `--user-ids` / bool filter 至少传一个。bool filter 显式传 `=false` 会报错——不传等于不过滤。

| Flag | 作用 |
|---|---|
| `--query <text>` | 关键词(姓名 / 邮箱 / 手机号),≤ 50 rune |
| `--queries <csv>` | 多个关键词并行搜,**最多 20 条**;与 `--query` / `--user-ids` 互斥;输出新 shape(见下) |
| `--user-ids <csv>` | open_id 列表,≤ 100;支持 `me` 表示自己;与 `--query` 同传时把搜索范围限定在该集合 |
| `--has-chatted` | 仅搜聊过天的 |
| `--has-enterprise-email` | 仅搜有企业邮箱的 |
| `--exclude-external-users` | 仅搜同租户(排除外部联系人) |
| `--left-organization` | 仅搜已离职的 |
| `--lang <locale>` | 覆盖 `localized_name` 的语种(如 `zh_cn` / `en_us` / `ja_jp`) |
| `--page-size <n>` | 单页大小 1-30,默认 20 |

## 常用例子

```text
# 按姓名搜,看候选确认是哪个张三
lark-cli contact +search-user --query "张三" --has-chatted

# 按完整邮箱搜(命中通常唯一,适合作后续命令的输入)
lark-cli contact +search-user --query "alice@example.com"

# 查看自己
lark-cli contact +search-user --user-ids me

# 批量回填:已知一组 open_id,取姓名 / 邮箱 / 部门
lark-cli contact +search-user --user-ids "ou_a,ou_b,ou_c" --format json

# 多 filter 组合:同租户的、有企业邮箱的「王」姓员工
lark-cli contact +search-user --query "王" --exclude-external-users --has-enterprise-email

# filter-only 枚举:列出所有"聊过天的离职同事"(无关键词)
lark-cli contact +search-user --has-chatted --left-organization
```

## 批量并行查询 (fanout)

一次查多个名字:

```text
lark-cli contact +search-user --queries "Alice,Bob,张三"
```

- 每行 user 带 `matched_query`,标识来自哪个 query
- `queries[]` 每个输入一条 `{query, error?, has_more}`,失败的有 `error`
- 部分失败不影响其它 query;全部失败才 exit 非 0

```text
# bool filter 对每个 query 都生效
lark-cli contact +search-user --queries "Alice,Bob" --has-chatted

# 与 --query / --user-ids 互斥
lark-cli contact +search-user --queries "a" --query "b"   # ❌ exit 2
```

约束:
- 最多 20 条; 每条 ≤ 50 字符
- 重复条目静默去重;全空 csv (`,,,`) 报错

## 同名 disambiguation

搜常见姓名常返回多条同名结果。后续操作若有副作用(发消息、邀请会议等),把候选列给用户挑;**不要擅自选**。

筛选信号(可信度从高到低):`chat_recency_hint`(近期联系过) > `enterprise_email` 前缀 > `department` 关键词。`localized_name` 同名时无区分作用。

```text
# 用 jq 按部门精筛
lark-cli contact +search-user --query "张三" \
  --jq '.data.users[] | select(.department | contains("<部门关键词>"))'
```

## 注意事项

- **不会自动翻页**。`has_more=true` 表示需要 refine query。
- **`--lang` 只影响输出展示名**,不影响匹配字段。
- **`--query` 与 `--user-ids` 同时设**:`--user-ids` 限定搜索范围,`--query` 在该集合内匹配。

## 输出字段 contract

跨租户用户(`is_cross_tenant=true`)的业务字段可能为空字符串,需做空值兜底。

| 字段 | 类型 | 说明 | 跨租户 |
|---|---|---|---|
| `open_id` | string | 稳定标识,后续命令的输入 | 始终非空 |
| `localized_name` | string | 按 `--lang` / brand 选出的展示名 | 始终非空(兜底为 open_id) |
| `email` | string | 个人邮箱 | 可能为空 |
| `enterprise_email` | string | 企业邮箱 | 可能为空 |
| `is_activated` | bool | 是否已激活飞书账号(未激活也可投递消息,但用户可能看不到) | 可能 false |
| `is_cross_tenant` | bool | 是否跨租户用户(同公司=false,外部联系人=true) | — |
| `p2p_chat_id` | string | 与当前用户的 P2P 会话 ID(`oc_...`);空表示从未私聊过。可作为接受 `--chat-id` 的 IM 命令的输入 | 可能为空 |
| `has_chatted` | bool | `p2p_chat_id != ""` 的派生字段 | — |
| `department` | string | 部门路径,服务端可能用 `-` 拼层级,层级数不固定。**按可子串匹配的字符串处理** | 可能为空 |
| `signature` | string (optional) | 用户个性签名;空时字段不出现 | 可能不出现 |
| `chat_recency_hint` | string | 最近联系的提示文案,仅供展示 | 可能为空 |
| `match_segments` | string[] | 关键词命中的字符串片段,用于高亮展示;无命中则为空数组 | — |

### `--queries` 模式额外字段

`data.users[]` 每条多 `matched_query` (string),指明本行来自哪个 query。

`data.queries[]` 按输入顺序、dedup 后每个 query 一条:

| 字段 | 类型 | 说明 |
|---|---|---|
| `query` | string | 该输入 |
| `error` | string (optional) | 失败原因;成功时不出现 |
| `has_more` | bool | 该 query 还有更多结果 |

fanout 模式无顶层 `data.has_more`。


<a id="s-37d87097a225a0f9"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `contact.v3.department.batch` | [Feishu/Lark]-通讯录-部门-批量获取部门信息-调用该接口获取一个或多个部门的信息，包括部门名称、ID、父部门、负责人、状态以及成员个数等 | feishu_read_tool |
| `contact.v3.department.children` | [Feishu/Lark]-通讯录-部门-获取子部门列表-调用该接口查询指定部门下的子部门列表，列表内包含部门的名称、ID、父部门、负责人以及状态等信息 | feishu_read_tool |
| `contact.v3.department.get` | [Feishu/Lark]-通讯录-部门-获取单个部门信息-调用该接口获取单个部门信息，包括部门名称、ID、父部门、负责人、状态以及成员个数等 | feishu_read_tool |
| `contact.v3.department.list` | [Feishu/Lark]-历史版本（不推荐）-通讯录-部门管理-获取部门信息列表-该接口用于获取当前部门子部门列表。[常见问题答疑] | feishu_read_tool |
| `contact.v3.department.parent` | [Feishu/Lark]-通讯录-部门-获取父部门信息-调用该接口递归获取指定部门的父部门信息，包括部门名称、ID、负责人以及状态等 | feishu_read_tool |
| `contact.v3.department.search` | [Feishu/Lark]-通讯录-部门-搜索部门-调用该接口以用户身份通过部门名称关键词查询可见部门的信息，包括部门的 ID、父部门、负责人以及状态等 | feishu_read_tool |
| `contact.v3.jobTitle.get` | [Feishu/Lark]-通讯录-职务-获取单个职务信息-调用该接口获取指定职务的信息，包括职务的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.jobTitle.list` | [Feishu/Lark]-通讯录-职务-获取租户职务列表-调用该接口获取当前租户下的职务信息，包括职务的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.user.batch` | [Feishu/Lark]-通讯录-用户-批量获取用户信息-调用该接口获取通讯录内一个或多个用户的信息，包括用户 ID、名称、邮箱、手机号、状态以及所属部门等信息 | feishu_read_tool |
| `contact.v3.user.findByDepartment` | [Feishu/Lark]-通讯录-用户-获取部门直属用户列表-调用该接口获取指定部门直属的用户信息列表。用户信息包括用户 ID、名称、邮箱、手机号以及状态等信息 | feishu_read_tool |
| `contact.v3.user.get` | [Feishu/Lark]-通讯录-用户-获取单个用户信息-调用该接口获取通讯录中某一用户的信息，包括用户 ID、名称、邮箱、手机号、状态以及所属部门等信息 | feishu_read_tool |
| `contact.v3.user.list` | [Feishu/Lark]-历史版本（不推荐）-通讯录-用户管理-获取用户列表-基于部门ID获取部门下直属用户列表。[常见问题答疑] | feishu_read_tool |
| `contact.v3.user.patch` | [Feishu/Lark]-通讯录-用户-修改用户部分信息-调用该接口更新通讯录中指定用户的信息，包括名称、邮箱、手机号、所属部门以及自定义字段等信息 | feishu_call_tool |
| `contact.v3.workCity.get` | [Feishu/Lark]-通讯录-工作城市-获取单个工作城市信息-调用该接口获取指定工作城市的信息，包括工作城市的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.workCity.list` | [Feishu/Lark]-通讯录-工作城市-获取租户工作城市列表-调用该接口获取当前租户下所有工作城市信息，包括工作城市的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `cli.contact.user_profiles.batch_query` | 批量获取用户个人资料（个人状态、个性签名）。Identity: `user` only (`user_access_token`) | feishu_read_tool |


<a id="s-4148f56f6c60012e"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


## 选哪个命令

**user 身份和 bot 身份是两条完全独立的路径**。先确定当前身份,再按下表选命令:

| 想做什么 | user 身份 | bot 身份 |
|---|---|---|
| 按姓名 / 邮箱搜员工拿 open_id | [`+search-user`](lark-contact-0.md#s-f3d322c87ecb0195) | 不支持 |
| 按关键词搜索当前用户可见的机器人 / 智能体 | [`+search-bot`](lark-contact-0.md#s-1d63f69fa0d94fd3) | 不支持 |
| 已知 open_id 取他人资料 | `+search-user --user-ids <id>` | [`+get-user --user-id <id>`](lark-contact-0.md#s-a8f9f3b86ecdb129) |
| 查看自己 | `+get-user` 或 `+search-user --user-ids me` | 不支持 |
| 查同事的个人状态 / 签名 | `user_profiles batch_query` | 不支持 |

已知 open_id 只是想发消息 / 排日程,不必经过 contact —— 直接 [`lark-im`](lark-im-0.md#s-29d24f3594acb424) / [`lark-calendar`](lark-calendar-0.md#s-3d0136d3d09a934d)。

### 名字没说清是人还是机器人 / 智能体

用户给的名字常常不表明类型。例如「和 reviewDuck 约个会」里的 reviewDuck 可能是同事昵称,也可能是机器人。
- 名字含 bot / agent / AI / 助手 / 机器人 / 智能体 / assistant 等明显特征时,反过来先搜机器人更快
- 不确定的话两边都搜一下

## 典型场景

找张三给他发消息:先搜,确认 open_id,再发:

```text
lark-cli contact +search-user --query "张三" --has-chatted --as user
lark-cli im +messages-send --user-id ou_xxx --text "Hi!"
```

批量查同事的个人状态 / 个性签名(先用 schema 看参数)。

```text
lark-cli schema contact.user_profiles.batch_query
lark-cli contact user_profiles batch_query \
  --params '{"user_id_type":"open_id"}' \
  --data '{"user_ids":["ou_xxx","ou_yyy"],"query_option":{"include_personal_status":true,"include_description":true}}' \
  --as user
```

搜索命中多条且后续操作有副作用(发消息、邀请会议等),把候选列给用户挑;不要擅自选第一条。

## 搜索机器人 / 智能体

`+search-bot` 使用 user 身份按关键词搜索当前用户可见的机器人,返回 `ou_` 开头的机器人 open_id。参数细节等见 [`lark-contact-search-bot.md`](lark-contact-0.md#s-1d63f69fa0d94fd3)。

```text
lark-cli contact +search-bot --query '会议助手' --as user
lark-cli contact +search-bot --queries '会议助手,日报助手,审批助手' --as user
```

## 注意事项

- **41050 / Permission denied** 受当前身份的可见范围限制(三条命令都可能遇到)。细节见 [`lark-shared`]（按模块名读取对应工作流）。
- **跨租户用户**(`is_cross_tenant=true`)多数业务字段为空字符串,这是飞书可见性规则,下游做空值兜底。
- **ID 类型**:`+get-user` 可通过 `--user-id-type` 使用 `open_id`、`union_id` 或 `user_id`;`+search-user` 使用用户 open_id;`+search-bot` 不支持按 ID 查询,它按关键词搜索并返回机器人 open_id。

## 不在本 skill 范围

- 发消息 / 查聊天记录 → [`lark-im`](lark-im-0.md#s-29d24f3594acb424)
- 排日程 / 邀请会议 → [`lark-calendar`](lark-calendar-0.md#s-3d0136d3d09a934d)
- 部门树 / 按部门列员工 / 组织架构 → [`lark-openapi-explorer`]（按模块名读取对应工作流） 查找原生接口
