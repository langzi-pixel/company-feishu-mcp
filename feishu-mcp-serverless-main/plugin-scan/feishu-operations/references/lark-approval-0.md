<a id="s-f159bc5d6a53e949"></a>

## SKILL.md


# approval

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先区分 approval_code、instance_code、task_id；待办列表不等于处理结果。按 cli.approval 的当前 schema 查看定义、实例和待办。

2. 发起审批前读取表单定义、必填字段与实际可发起范围。通过/拒绝/转交使用用户明确指定的 task/instance，保留操作意见和目标人。

3. 已处理、撤回、资源无权限分别报告；处理后核对实例或任务状态，不用旧 tasks.query 冒充新的处理接口。

## 按需参考

- [工具与合同](lark-approval-0.md#s-27deed1ac28b29bf)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-approval-0.md#s-97c2655cb53cc597)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-b13a269a4eb073d1"></a>

## references/lark-approval-approvals-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval approvals get

获取单个审批定义详情（用户级只读操作）。适合在发起审批实例前，先确认审批名称、表单控件结构、选项值范围以及流程节点信息。

需要的 scopes: ["approval:approval:read"]

## 命令

```text
# 按 approval_code 查询审批定义详情
lark-cli approval approvals get --params '{"approval_code":"<APPROVAL_CODE>"}' --as user

# 表格格式输出，便于快速浏览顶层字段
lark-cli approval approvals get --params '{"approval_code":"<APPROVAL_CODE>"}' --format table --as user

# 预览 API 调用，不执行
lark-cli approval approvals get --params '{"approval_code":"<APPROVAL_CODE>"}' --as user --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--params '{...}'` | 是 | 查询参数，使用 JSON 传入 |
| `approval_code` | 是 | 审批定义 Code；通常来自 `approval approvals search` 的结果 |
| `locale` | 否 | 返回语言，例如 `zh-CN`、`en-US`、`ja-JP` |
| `--as user` | 否 | 建议显式指定用户身份；审批定义详情通常按当前用户可见范围读取 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 常见输入来源

如果你已经有 `approval_code`，可直接查询：

```text
lark-cli approval approvals get --params '{"approval_code":"<APPROVAL_CODE>"}' --as user
```

如果你还没有 `approval_code`，先搜索可发起审批定义：

```text
lark-cli approval approvals search --data '{"keyword":"请假"}' --as user
```

## 输出重点字段

返回结果中，优先关注以下字段：

| 字段 | 说明 |
|------|------|
| `approval_code` | 审批定义 Code |
| `approval_name` | 审批定义名称；确认是不是用户想发起的那张单 |
| `form` | 表单定义快照；用于识别控件 `id`、`type`、选项值范围、明细子控件结构 |
| `node_list` | 流程节点列表；用于识别节点 key、是否需要补充审批人、是否允许多人 |

## form 的使用重点

`form` 最重要的作用是帮助 agent **识别怎么组装 `instances.create.data.form`**，而不是直接把它原样提交出去。

重点看：

| 字段 / 结构 | 说明 |
|------|------|
| `form[].id` | 控件 ID；后续创建实例时必须使用 |
| `form[].type` | 控件类型，例如 `input`、`date`、`radio`、`checkbox`、`fieldList` |
| `form[].value` / 选项定义 | 用来识别可选值范围、默认值或选项值 |
| 明细 / 子控件结构 | 用于识别 `fieldList`、控件组等复杂控件的子字段结构 |

**注意：`approvals.get.form` 不是 `instances.create` 可直接复用的 payload 模板。** 它是“定义快照”，主要用于识别字段结构与选项值范围。

## node_list 的使用重点

`node_list` 主要用于后续决定是否要补 `node_approver_list` / `node_cc_list`。

重点看：

| 字段 | 说明 |
|------|------|
| `node_list[].custom_node_id` | 自定义节点标识；后续补节点参数时优先作为 key |
| `node_list[].node_id` | 节点 ID；若没有 `custom_node_id`，通常退回用它做 key |
| `node_list[].need_approver` | 是否要求发起人补充审批人 |
| `node_list[].approver_chosen_multi` | 是否允许为该节点选择多个审批人 |

## 使用建议

- **这是发起原生审批实例前的必要只读步骤。** 推荐固定走：`approvals search` -> `approvals get` -> `instances create`。
- **如果用户已经明确给了 `approval_code`，直接用这个命令。** 不必再走 `approvals search`。
- **先确认 `approval_name`。** 避免把相似名称的审批定义搞混。
- **先用 `form` 识别控件结构，再组装创建 payload。** 不要在未看详情时猜控件 `id`、`type` 或选项值。
- **先用 `node_list` 看是否需要补审批人。** 若某节点 `need_approver=true`，创建实例时通常要补 `node_approver_list`。
- **`node_list` 的 key 优先取 `custom_node_id`。** 若不存在，再使用 `node_id`。
- **`approver_chosen_multi=false` 时，一个节点通常只能补一个审批人。**

## 输出与后续操作

读取定义详情后，常见下一步：

```text
# 发起原生审批实例
lark-cli approval instances create --data '{"approval_code":"<APPROVAL_CODE>","form":"[...]"}' --as user --yes
```

如果需要进一步理解控件取值与节点参数，优先参考：

- `lark-approval-instance-form-control-parameters.md`
- `lark-approval-instance-value-sourcing.md`
- `lark-approval-initiate.md`

## 结果整理方式

**将结果整理为“审批定义概览 + 表单结构摘要 + 节点要求摘要”。**

建议输出成下面这种结构：

```text
审批定义：请假申请
approval_code: 7C468A54-8745-2245-9675-08B7C63E7A85

表单控件摘要：
- leave_type: radio，可选值 [annual_leave, sick_leave]
- reason: textarea
- start_end: dateInterval

节点要求摘要：
- manager_node：need_approver=true，approver_chosen_multi=false
- hr_node：need_approver=false
```


<a id="s-6361e0e4c53acbef"></a>

## references/lark-approval-approvals-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval approvals search

搜索**当前用户可发起**的审批定义（launchable approvals）。只读操作，不会创建审批实例。

需要的 scopes: ["approval:approval:read"]

## 命令

```text
# 按关键词搜索可发起审批定义
lark-cli approval approvals search --data '{"keyword":"请假"}' --as user

# 使用 page_token 翻页
lark-cli approval approvals search --data '{"keyword":"请假", "page_token":"example_page_token"}' --as user

# 表格格式输出，便于快速浏览候选定义
lark-cli approval approvals search --data '{"keyword":"出差"}' --format table --as user

# 预览 API 调用，不执行
lark-cli approval approvals search --data '{"keyword":"请假"}' --as user --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 查询参数，使用 JSON 传入 |
| `keyword` | 是 | 搜索关键词，例如 `请假`、`报销`、`出差`、`采购` |
| `locale` | 否 | 返回语言，例如 `zh-CN`、`en-US`、`ja-JP` |
| `page_size` | 否 | 分页大小 |
| `page_token` | 否 | 翻页标记；首次请求不填，后续使用上一次返回的 `page_token` |
| `--as user` | 否 | 建议显式指定用户身份；“可发起审批定义”是面向当前用户的查询 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 这个命令解决什么问题

当用户只有自然语言意图，还没有 `approval_code` 时，先用它把“可发起的审批定义候选项”找出来。

典型场景：

- “帮我找一下请假审批”
- “有哪些可以发起的报销单？”
- “先搜一下出差审批，再帮我提单”

## 输出重点字段

返回结果里，优先关注以下字段：

| 字段 | 说明 |
|------|------|
| `approval_code` | 审批定义 Code；后续 `approvals get` 和 `instances create` 都要用它 |
| `approval_name` | 审批定义名称；给用户做候选选择时最关键 |
| `is_external` | 是否为三方审批定义；`true` 表示不能走原生 `instances.create` |
| `create_link` | 三方审批定义的发起链接；`is_external=true` 时优先返回给用户 |

## 使用规则

- **这是发起审批工作流的第一步。** 标准顺序是：`approvals search` -> `approvals get` -> `instances create`。
- **搜索结果为空时，不要猜。** 直接告诉用户当前关键词下没有可发起定义，并建议用户换关键词。
- **命中多个结果时，不要替用户拍板。** 先把候选定义列出来，让用户选择目标审批定义。
- **`is_external=true` 时不要调用 `approval instances create`。** 这类定义属于三方审批，优先返回 `create_link` 并说明需要通过链接发起。
- **只有 `is_external=false` 的原生定义，才继续 `approvals get`。**
- **如果用户已经明确给出 `approval_code`，不要再 search。** 直接执行 `approval approvals get`。

## 结果整理方式

**将结果整理为候选清单，优先展示“名称 + approval_code + 是否三方定义 + 下一步建议”。**

建议输出成下面这种结构：

```text
找到 3 个可发起审批定义：

1. 请假申请
   - approval_code: 7C468A54-8745-2245-9675-08B7C63E7A85
   - is_external: false
   - next: 可继续读取 definitions 详情（approvals get）

2. 差旅报销
   - approval_code: 99887766-xxxx
   - is_external: true
   - next: 返回 create_link，引导用户通过链接发起
```

## 常见后续操作

### 1）用户选中了某个定义，继续查看详情

```text
lark-cli approval approvals get --params '{"approval_code":"<APPROVAL_CODE>"}' --as user
```

### 2）确认是原生定义后，再准备发起审批实例

```text
lark-cli approval instances create --data '{"approval_code":"<APPROVAL_CODE>","form":"[...]"}' --as user --yes
```

### 3）确认是三方定义时，直接返回链接

当 `is_external=true` 时，优先向用户返回 `create_link`，说明该审批需在三方系统或跳转页面中发起，而不是通过原生 `instances.create`。


<a id="s-9c86d856c03b8a0d"></a>

## references/lark-approval-initiate.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 审批提单工作流

## 执行摘要

- **原生审批提单如果用户未明确给出 `approval_code`，必须固定走 `approvals search` -> `approvals get` -> `instances create`** 不要跳过 `get` 直接拼请求。
- **原生审批提单如果用户明确给出 `approval_code`，固定走 `approvals get` -> `instances create`** 不要跳过 `get` 直接拼请求。
- **`is_external=true` 的定义是三方定义。** 这类定义不要调用 `instances create`，应优先使用 `create_link`。
- **所有人员类参数默认使用 `open_id`。** 若用户给的是姓名、邮箱或其他身份，先用 [`../../lark-contact/SKILL.md`]（按模块名读取对应工作流） 解析。
- **先读控件参数 reference 和值来源 reference，再读本文里的创建参数规则。** 提单前必须先阅读 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 和 [`lark-approval-instance-value-sourcing.md`](lark-approval-0.md#s-b6930238e931340d)。
- **`approvals.get.form` 不是创建 payload 的原样模板。** 它主要用于识别控件 `id`、`type`、选项值范围和明细子控件结构；真正的 `instances create --data.form` 中，控件 `value` 结构以 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 为准。
- **节点参数只从 `node_list` 和本文里的节点参数规则里取。** 节点 key 必须来自定义详情返回的节点标识；审批人/抄送人列表传用户 ID 时，不要混用姓名或其他身份标识。
- **看到 `need_approver=true` 就说明该节点需要发起人补充审批人。** 如果 `approver_chosen_multi=false`，该节点只允许一个 `open_id`。
- **创建实例前先确认。** `approval instances create` 是写操作，执行前，让用户确认最终定义、表单值和节点参数；真正执行时显式传 `--yes`。

## 适用场景

- “帮我提交一个请假审批”
- “帮我发起报销审批”
- “我想提一个出差审批”
- “先搜可发起的审批，再帮我提单”

## 严禁行为

- **严禁在未先阅读本文中的创建参数规则、[`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 和 [`lark-approval-instance-value-sourcing.md`](lark-approval-0.md#s-b6930238e931340d) 的情况下直接提单。**
- **严禁跳过 `approvals.get`。** 未拿到 `form` 和 `node_list` 前，不得调用 `instances create`。
- **严禁把姓名直接写进 `node_approver_list`、`node_cc_list` 或表单人员控件。** 必须先转成 `open_id`。
- **严禁对三方定义调用 `instances create`。**
- **严禁对 API 不支持的控件硬提单。** 如果目标定义包含创建实例 API 不支持的控件，应明确告诉用户该定义不能仅通过 API 完整发起。
- **严禁把 `approvals.get.form` 当成可直接提交的原样模板。**
- **严禁在未得到用户确认前直接执行真实提单。**

## 工作流

### 1. 搜索可发起审批定义

先搜索定义：

```text
lark-cli approval approvals search --data '{"keyword":"请假"}'
```

处理规则：

- 若结果为空，告诉用户当前关键词下没有可发起定义。
- 若命中多个定义，必须把候选项列给用户选择，不要自行猜测。
- 若目标定义 `is_external=true`，优先返回 `create_link`，说明这是三方定义，不能走原生 `instances create`。
- 只有 `is_external=false` 的原生定义才继续下一步。

### 2. 获取审批定义详情

拿到 `approval_code` 后，读取定义详情：

```text
lark-cli approval approvals get \
  --params '{"approval_code":"7C468A54-8745-2245-9675-08B7C63E7A85"}'
```

重点关注返回：

- `approval_name`: 当前发起的是哪个审批定义。
- `form`: 表单定义快照，用于识别控件 `id`、`type`、选项值范围以及明细子控件结构；不是创建实例时可直接原样提交的 payload 模板。
- `node_list`: 流程节点信息，是后续 `node_approver_list` / `node_cc_list` 的唯一可靠来源。

### 3. 创建请求参数速查

输入参数如下：

| 参数 | 必填 | 说明 |
|---|---|---|
| `--data '{...}'` | 是 | 请求体，使用 JSON 传入 |
| `approval_code` | 是 | 审批定义 Code；必须先通过 `approvals search` / `approvals get` 确认 |
| `form` | 否 | 表单值，**JSON 数组字符串**，不是普通对象；API 层非必填，但审批定义存在必填控件或用户需要提交表单值时必须传 |
| `node_approver_list` | 否 | 节点审批人列表；仅在定义要求补充审批人时传 |
| `node_cc_list` | 否 | 节点抄送人列表；仅在用户明确需要补充节点抄送人时传 |
| `uuid` | 否 | 幂等标识；重复重试同一请求时建议显式传入 |
| `--as user` | 否 | 建议显式指定用户身份；审批发起通常应使用用户身份 |
| `--yes` | 是 | 写操作确认；真实执行时必须显式传入 |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

### 4. 组装 `form`

`instances create --data.form` 是可选字段；传入时必须是一个 JSON 数组字符串。无表单或无需填写表单值的审批可省略 `form`，但只要审批定义包含需要提交的控件，就必须按控件结构组装后传入。组装原则：

- 先用 `approvals.get.form` 识别有哪些控件、每个控件的 `id` / `type` / 可选值范围，再按本文中的创建参数规则与 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 重新组装创建 payload。
- 提交时必须至少保证每个控件的 `id`、`type` 与 `value` 符合当前接口要求；不要假设定义快照里出现的其他字段都能直接照搬。
- 如果用户提供的是人员信息，优先转换成 `open_id` 后再写入对应控件。
- 单选/多选控件提交的是选项 `value`，该值可从 `approvals.get.form` 的选项定义中取得。
- `contact`、`department`、`fieldList`、`dateInterval`、`amount`、`telephone`、`document` 等控件的 `value` 结构各不相同，必须按 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 单独组装，不要套用文本控件的写法。
- 值本身从哪里拿，优先按 [`lark-approval-instance-value-sourcing.md`](lark-approval-0.md#s-b6930238e931340d) 处理；不要把“知道结构”误当成“已经拿到可提交值”。
- 若 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 标明某控件不支持通过创建实例 API 提交，则不要硬猜绕过；应明确告诉用户该定义当前无法仅通过 API 提单。
- 若遇到当前 skill 未明确覆盖的复杂控件，不要硬猜；先依据 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 判断支持性与传值结构，再向用户确认。

## API 不支持的控件

根据 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025)，创建审批实例 API 不支持的控件至少包括：

- `text`
- `mutableGroup`
- `account`
- `serialNumber`
- `tripGroup`
- `apaascorehrOnboardingGroup`
- `apaascorehrRegularateGroup`
- `remedyGroupV2`
- `apaascorehrJobAdjustGroup`
- `apaascorehrOffboardingGroup`

如果目标审批定义包含上述控件，不要继续硬拼 `form`；应直接告诉用户该定义不能仅通过当前 API 完整提单。

## 高频控件速查

优先按 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 组装，下面只保留最常用、最容易出错的格式：

- `input` / `textarea`: `value` 是字符串
- `date`: `value` 是 RFC3339 时间字符串
- `dateInterval`: `value` 是对象，包含 `start` / `end` / `interval`
- `radio` / `radioV2`: `value` 是单个选项值，取定义详情里的 `option.value`；关联外部选项时传 `options.id`
- `checkbox` / `checkboxV2`: `value` 是选项值数组
- `number`: `value` 是数字
- `amount`: `value` 是数字，还要带 `currency`
- `formula`: `value` 必须与定义中的公式结果匹配，否则会报错
- `contact`: 只推荐写 `open_ids`，由人员信息先转换成 `open_id`
- `connect`: `value` 是关联审批实例 `instance_code` 数组，当前默认要求用户直接提供 `instance_code`
- `document`: `value` 是对象，至少含 `token` 和 `type=docx`
- `attachmentV2` / `image` / `imageV2`: `value` 是 file code 数组，当前默认要求用户直接提供
- `fieldList`: `value` 是二维数组，子项继续按各自控件类型组装
- `department`: `value` 是对象数组，元素字段名为 `open_id`，其值填写部门的 `open_department_id`
- `telephone`: `value` 是对象，包含 `countryCode` 和 `nationalNumber`
- `address`: `value` 是对象数组，至少包含地理库 `id`，可选 `detailAddress`；当前默认要求用户直接提供该 `id`

## 特殊控件组

[`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 还明确给出了若干特殊控件组的提单格式，至少包括：

- `leaveGroupV2`
- `workGroup`
- `outGroup`
- `shiftGroup`

这类控件组不是简单文本控件，通常内部还嵌套 `radioV2`、`date`、`fieldList`、`image`、`contact` 等子控件。遇到这些控件组时：

- 先从 `approvals.get.form` 找到控件组及其子控件 ID
- 再严格按 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 的示例组装 `value`
- 不要把控件组整体当成普通字符串或扁平对象提交

### 5. 组装节点参数

从 `node_list` 推导节点参数：

- 若某节点 `need_approver=true`，则必须在 `node_approver_list` 中补该节点的审批人。
- `key` 优先取 `custom_node_id`；若不存在，再用 `node_id`。
- `value` 是审批人 `open_id` 列表。
- 若 `approver_chosen_multi=false`，该节点只允许一个审批人 `open_id`。
- `node_cc_list` 仅在用户明确需要补充节点抄送人时才填写；其 `key/value` 规则与 `node_approver_list` 相同。

### 6. 创建审批实例

创建命令使用 `approval instances create`，需要的 scopes: ["approval:instance:write"]

确认最终表单值和节点参数后再执行：

```text
lark-cli approval instances create \
  --data '{
    "approval_code":"7C468A54-8745-2245-9675-08B7C63E7A85",
    "form":"[{\"id\":\"widget1\",\"type\":\"input\",\"value\":\"请假半天\"}]",
    "node_approver_list":[
      {
        "key":"manager_node_id",
        "value":["ou_xxx"]
      }
    ]
  }' \
  --as user \
  --yes
```

执行规则：

- 执行前先向用户确认：目标审批定义、核心表单值、节点审批人/抄送人。
- 若需要幂等，可补 `uuid`。
- 成功后回报 `instance_code` 与 `instance_link`。

## 组装时优先依据的资料

优先级固定如下：

1. 本文中的创建请求参数、节点参数和返回结果说明：决定 `instances create` 要传哪些字段、怎么执行、成功后回什么。
2. [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025)：决定每种控件的 `value` 结构与支持范围。
3. [`lark-approval-instance-value-sourcing.md`](lark-approval-0.md#s-b6930238e931340d)：决定每类值应该从哪里拿，以及当前哪些值必须由用户直接提供。
4. `approvals.get.form`：提供当前审批定义里实际有哪些控件、控件 `id`、控件 `type`、选项值范围、明细子控件结构。
5. `approvals.get.node_list`：提供节点 key 与是否需要补充审批人/抄送人的线索。

不要反过来把 `approvals.get.form` 当成第一优先级，更不要把它当成可直接提交的 JSON 模板。

## 最小判断表

| 你手上有什么 | 下一步 |
|---|---|
| 只有口语需求，比如“帮我提个请假审批” | 先 `approvals.search` |
| 已经拿到 `approval_code` | 直接 `approvals.get` |
| 已拿到 `form` / `node_list`，且用户已给出表单值和审批人 | 组装 `instances create` |
| `is_external=true` | 返回 `create_link`，不要调 `instances create` |

## 返回结果

完成创建后，至少向用户返回：

- `approval_name`
- `instance_code`
- `instance_link`

建议整理为下面这种结构：

```text
审批已创建成功：

- approval_name: 请假申请
- instance_code: 19EAC829-F1CB-527F-BE2A-1330422E60C0
- instance_link: https://...
```


<a id="s-ae4579b915605025"></a>

## references/lark-approval-instance-form-control-parameters.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 审批实例表单控件参数

> 说明：本文尽量保留上游参数文档的原始结构与示例，用于回答“控件 `value` 长什么样”。
> 当前 `lark-cli` 的推荐取值口径以 [`lark-approval-instance-value-sourcing.md`](lark-approval-0.md#s-b6930238e931340d) 为准；如果两份文档在“值从哪里拿”上存在差异，以后者为准。

在调用创建审批实例接口时需要使用表单控件参数，你可以通过本文了解审批实例内各表单控件的参数说明。

## 准备工作

审批实例的表单控件参数依据审批定义表单来配置，例如，审批定义的表单设计包括了 **单行文本** 和 **日期区间** 控件，则审批实例的表单控件参数就需要为 **单行文本** 和 **日期区间** 控件进行赋值。因此，在操作审批实例表单的控件参数前，应先通过审批定义详情确认表单控件结构。

## 审批实例 API 不支持的控件

创建审批实例 API 未完全支持所有的审批表单控件，不支持的控件如下表所示。如果你必须使用 API 不支持的控件，则不能仅通过当前 API 完成提单。

**控件/控件组** | **Type**                    |
| ---------- | --------------------------- |
| 说明         | text                        |
| 引用多维表格     | mutableGroup                |
| 收款账户       | account                     |
| 流水号        | serialNumber                |
| 出差控件组      | tripGroup                   |
| 录用控件组      | apaascorehrOnboardingGroup  |
| 转正控件组      | apaascorehrRegularateGroup  |
| 补卡控件组      | remedyGroupV2               |
| 调岗控件组      | apaascorehrJobAdjustGroup   |
| 离职控件组      | apaascorehrOffboardingGroup

## 通用参数

审批实例的表单控件均包含的参数如下表所示。

参数 | 类型 | 是否必填 | 描述
---|---|---|---
id | string | 是 | 控件的 ID，需要与审批定义中的控件 ID 保持一致。
type | string | 是 | 控件类型。各控件类型取值参见下文 **不同控件的参数** 章节。
value | 不同控件的类型不同 | 是 | 控件的取值。不同控件 value 数据类型也不同，例如单行文本控件的 value 为字符串、联系人的 value 为数组。详情参见下文 **不同控件的参数** 章节。

## 不同控件的参数

本章节提供不同控件的 type 参数值、JSON 示例以及非通用参数说明。

### 单行文本

控件 type 为 input，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "input",
    "value": "data" // string 类型
}
```

### 多行文本

控件 type 为 textarea，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "textarea",
    "value": "data" // string 类型
}
```

### 日期

控件 type 为 date，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "date",
    "value": "2019-10-01T08:12:01+08:00" // 需满足 RFC3339 格式的 string 类型
}
```

### 日期区间

控件 type 为 dateInterval，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "dateInterval",
    "value": {
         "start":"2019-10-01T08:12:01+08:00",
         "end":"2019-10-02T08:12:01+08:00",
         "interval": 1.0
     }
}
```

value 参数为 object 类型，包含参数说明：

参数 | 类型 | 是否必填 | 描述
---|---|---|---
start | string | 是 | 开始时间，需满足 RFC3339 格式。
end | string | 是 | 结束时间，需满足 RFC3339 格式。
interval | float | 是 | 时长（天）。

### 单选

控件 type 为 radio/radioV2，JSON 数据示例：

```json
{                                     
    "id": "widget1",
    "type": "radioV2",
    "value": "k2b8mkx0-h71x5gl1234-1" // string 类型
}
```

其中， value 表示选项值，取值范围需要参考相应审批定义中 **单选** 控件 option 的 value 参数。你可以通过审批定义详情返回的 `form` 参数，获取单选控件 option 的 value 取值。如果控件关联了外部选项，则 value 需要传入外部选项的 `options.id`。

### 多选

控件 type 为 checkbox/checkboxV2，JSON数据示例：

```json
{
    "id":"widget1",
    "type":"checkboxV2",
    "value": ["k2b8mkx0-h71x5gl4321-1"] // string 类型的数组
}
```
其中， value 表示选项值，取值范围需要参考相应审批定义中 **多选** 控件 option 的 value 参数。你可以通过审批定义详情返回的 `form` 参数，获取多选控件 option 的 value 取值。如果控件关联了外部选项，则 value 需要传入外部选项的 `options.id`。

### 数字

控件 type 为 number，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "number",
    "value": 1234.5678 // float 类型
}
```

### 金额

控件 type 为 amount，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "amount",
    "value": 1234.5678, // float 类型
    "currency":"USD"
}
```

其中，currency 表示货币种类，取值范围需要参考相应审批定义中 **金额** 控件的 value 参数。你可以通过审批定义详情返回的 `form` 参数，获取金额控件可设置的货币种类。

### 计算公式

控件 type 为 formula，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "formula",
    "value": 1234.5678 // 该值由审批定义内配置的公式计算出取值，若不匹配则返回报错。
}
```

### 联系人

控件 type 为 contact，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"contact",
    "value": ["f8ca557e"], // string 类型的数组
    "open_ids": ["ou_12345"] // string 类型的数组
}
```
其中，value 包含的是用户 `user_id`；open_ids 包含的是用户 `open_id`。

### 关联审批

控件 type 为 connect，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"connect",
    "value": ["19EAC829-F1CB-527F-BE2A-1330422E60C0"] // string 类型的数组
}
```
其中，value 包含的是被关联的审批实例 Code，你可以通过审批实例详情能力根据实例 Code 获取实例详情。

### 文档控件

控件 type 为 document，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "document",
    "value": {
           "token":"example-token",
           "type":"docx",
    }
}
```

value 参数为 object 类型，包含参数说明：

参数 | 类型 | 是否必填 | 描述
---|---|---|---
token | string | 是 | 文档的 document_id。
type | string | 是 | 文档类型，支持 `docx`。

### 附件

控件 type 为 attachmentV2，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"attachmentV2",
    "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"] // string 类型的数组
}
```
其中，value 包含的是上传文件后返回的文件 code。

### 图片

控件 type 为 image/imageV2，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"image",
    "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"] // string 类型的数组
}
```

其中，value 包含的是上传文件后返回的文件 code。

### 明细/表格

控件 type 为 fieldList，JSON 格式示例：

```json
{
    "id": "widget1",
    "type": "fieldList",
    "value": [
         [   
            {
                "id": "widget1",
                "type": "checkbox",
                "value": ["jxpsebqp-0"]
            }
         ]
     ]
}
```

其中 value 是二维数组，根据审批定义内 **明细/表格** 控件所包含的控件，依次设置控件 JSON 值。

### 部门

控件 type 为 department，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"department",
    "value":[ 
        {
            "open_id": "od-xxx"
        }
    ]
}
```

其中 value 为对象数组，通过 open_id 设置部门的 open_department_id。

### 电话

控件 type 为 telephone，JSON 数据示例：

```json
{
    "id":"widget1",
    "type":"telephone",
    "value": {
        "countryCode":"+86",
        "nationalNumber":"13122222222"
    }
}
```

value 参数为 object 类型，包含参数说明：

参数 | 类型 | 是否必填 | 描述
---|---|---|---
countryCode | string | 是 | 区号。
nationalNumber | string | 是 | 电话号。

### 地址
控件 type 为 address，JSON 数据示例：

```json
{
	"id": "widget1",
	"type": "address",
	"value": [{
		"id": "290557",
		"detailAddress": "详细的地址"
	}]
}
```

value 参数为 []object 类型，参数说明如下：

参数 | 类型 | 是否必填 | 描述
---|---|---|---
value | []object | 是 | 非出差控件组场景地址控件仅支持单个地址，传入多个时默认只取第一个
└ id | string | 是 | 区域ID, 可通过审批的地理库接口获取
└ detailAddress | string | 否 | 详细的地址，若表单配置中未开启填写详细地址，则会忽略该参数，即使传入也不会生效

### 换班控件组

控件 type 为 shiftGroup，JSON 数据示例：

```json
{
    "id": "widget1",
    "type": "shiftGroup",
    "value": {
         "shiftTime": "2019-10-01T08:12:01+08:00",
         "returnTime": "2019-10-02T08:12:01+08:00",
         "reason": "ask for leave"
     }
}
```

value 参数为 object 类型，包含参数说明：

参数 | 类型 | 是否必填 | 描述
---|---|---|---
shiftTime | string | 是 | 换班时间，需满足 RFC3339 格式。
returnTime | string | 是 | 对调日期，需满足 RFC3339 格式。
reason | string | 是 | 换班原因。

### 请假控件组

**请假控件组请求示例**
```json
{
    "id": "widgetLeaveGroupV2",
    "type": "leaveGroupV2",
    "value": [
      {
        "id": "widgetLeaveGroupType",
        "type": "radioV2",
        "value": "7488925543484620819"
      },
      {
        "id": "widgetLeaveGroupStartTime",
        "type": "date",
        "value": "2025-08-25T11:30:00+08:00"
      },
      {
        "id": "widgetLeaveGroupEndTime",
        "type": "date",
        "value": "2025-08-26T11:35:00+08:00"
      },
      {
        "id": "widgetLeaveGroupReason",
        "type": "textarea",
        "value": "123123"
      },
      {
        "id": "widgetLeaveCertification",
        "type": "image",
        "value": [
          "B69F8E26-0EAA-4A92-9B80-DA613CD36136"
        ]
      },
      {
        "id":"widgetLeaveCertification",
        "type":"image",
        "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]
      },
      {                                     
        "id": "widgetLeaveGroupFeedingArrivingLate",
        "type": "radioV2",
        "value": "30"
      },
      {                                     
        "id": "widgetLeaveGroupFeedingOffLeaveEarly",
        "type": "radioV2",
        "value": "30"
      }        
    ]
}
```

**请假控件组包含参数说明：**

id | 类型 | JSON示例 | 描述
---|---|---|---
id | string | 是 | 控件组ID，固定为widgetLeaveGroupV2
type | string | 是 | 控件组类型，固定为leaveGroupV2
value | object[] | 是 | 控件组的值，值为多个子控件值的列表

value中包含的子控件值说明:

id | 类型 | JSON示例 | 描述
---|---|---|---
widgetLeaveGroupType | radioV2 | ```<br>{<br>"id": "widgetLeaveGroupType",<br>"type": "radioV2",<br>"value": "7488925543484620819"<br>}<br>``` | 假期类型，具体格式可参考单选控件，选项由假勤接口获取，提单时必须包含该控件
widgetLeaveGroupStartTime | date | ```<br>{<br>"id": "widgetLeaveGroupStartTime",<br>"type": "date",<br>"value": "2019-10-01T08:12:01+08:00", // 需满足 RFC3339 格式的 string 类型<br>}    <br>``` | 请假开始时间，具体格式可参考日期控件，会根据假期类型自动取整,其中半天假小于12点则认为是上午，小时假则以半小时为粒度向前取整, 提单时必须包含该控件
widgetLeaveGroupEndTime | date | ```<br>{<br>"id": "widgetLeaveGroupEndTime",<br>"type": "date",<br>"value": "2019-10-01T08:12:01+08:00", // 需满足 RFC3339 格式的 string 类型<br>}<br>``` | 请假结束时间，具体格式可参考日期控件，会根据假期类型自动取整，其中半天假小于12点则认为是上午，小时假则以半小时为粒度向后取整
widgetLeaveGroupReason | textarea | ```<br>{<br>"id": "widgetLeaveGroupReason",<br>"type": "textarea",<br>"value": "123123"<br>}<br>``` | 请假事由，具体格式可参考多行文本控件，哺乳假无需填写，其他情况则根据控件组配置中该控件是否可见以及必填判断
widgetLeaveCertification | image | ```<br>{<br>"id":"widgetLeaveCertification",<br>"type":"image",<br>"value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]<br>}<br>``` | 请假证明，具体格式可参考图片控件，如果所选假期类型配置要求补充证明则必须传递该值，缺失会报错
widgetLeaveGroupFeedingArrivingLate | radioV2 | ```<br>{                                     <br>"id": "widgetLeaveGroupFeedingArrivingLate",<br>"type": "radioV2",<br>"value": "30"<br>}<br>``` | 上班晚到的分钟数，具体格式可参考单选控件，仅哺乳假需要填写，取值范围是0-120分钟，粒度是15分钟，选项从审批定义中该控件的option中获取
widgetLeaveGroupFeedingOffLeaveEarly | radioV2 | ```<br>{                                     <br>"id": "widgetLeaveGroupFeedingOffLeaveEarly",<br>"type": "radioV2",<br>"value": "30"<br>}   <br>``` | 下班早走的分钟数，具体格式可参考单选控件，仅哺乳假需要填写，取值范围是0-120分钟，粒度是15分钟，选项即是分钟对应的字符串

**特殊的参数校验报错信息**
message                                            | 说明                           |
| -------------------------------------------------- | ---------------------------- |
| leave type id parse error                          | 请假类型不是int64                  |
| group value is invalid                             | 当前控件组的值无效，请校验是否为空或者校验类型是否为数组 |
| start time format is not RFC3339                   | 开始时间日期格式非*RFC3339格式*         |
| end time format is not RFC3339                     | 结束时间日期格式非*RFC3339格式*         |
| start time is after end time                       | 开始时间晚于结束时间                   |
| user not in gray                                   | 申请用户不在假勤灰度内                  |
| leave type not found                               | 请假类型不存在                      |
| reason is required                                 | 请假原因未填写                      |
| leave quote should be bigger than 0                | 请假时长需要大于0                    |
| leave is conflict                                  | 所选时间内已有请假记录，请选择其他时间          |
| balance is not enough                              | 当前假期类型下假期余额不足                |
| certification is required                          | 需要上传请假证明                     |
| arriving late is required                          | 哺乳假需要填写上班晚到时长                |
| arriving late value is not in the optional items   | 晚到时间不在可选范围内                  |
| leaving early is required                          | 哺乳假需要填写下班提前时长                |
| leaving early value is not in the optional items   | 下班提前时间不在可选范围内                |
| feeding rest daily is 0                            | 哺乳假每日休息时长为0，请重新选择            |
| the operation is prohibited by the workforce rules | 当前账户已在假勤侧封账，无法提交

### 加班控件组

**加班控件组请求示例**
```json
{
  "id": "widgetWorkGroup",
  "type": "workGroup",
  "value":[
    {
      "id":"widgetWorkGroupOvertimeWorkers",
      "type":"contact",
      "value": ["f8ca557e"],
      "open_ids": ["ou_12345"]
    },
    {
      "id": "widgetWorkGroupType",
      "type": "radioV2",
      "value": "7259635026038505475"
    },
    {
      "id":"widgetWorkGroupTimeRangeFieldList",
      "type":"fieldList",
      "value":[
        [
          {
            "id":"widgetWorkGroupStartTime",
            "type":"date",
            "value":"2019-10-01T08:12:01+08:00"
          },
          {
            "id":"widgetWorkGroupEndTime",
            "type":"date",
            "value":"2019-10-01T08:12:01+08:00"
          }
        ]
      ]
    },
    {
      "id": "widgetWorkGroupReason",
      "type": "textarea",
      "value": "111"
    }
  ]
}

```

**加班控件组参数说明：**

参数 | 类型 | 是否必填 | 描述
---|---|---|---
id | string | 是 | 控件组ID，固定为widgetWorkGroup
type | string | 是 | 控件组类型，固定为workGroup
value | object[] | 是 | 控件组的值，值为多个子控件值的列表

value中包含的子控件值说明:

id | 类型 | JSON示例 | 描述
---|---|---|---
widgetWorkGroupOvertimeWorkers | contact | ```<br>{<br>"id":"widgetWorkGroupOvertimeWorkers",<br>"type":"contact",<br>"value": ["f8ca557e"], <br>"open_ids": ["ou_12345"]<br>}<br>``` | 加班人员列表，具体格式可参考联系人控件，如果定义中配置「允许代多人提交」则该字段必填，如果是提交人给自己提交需填写提交人的ID
widgetWorkGroupType | radioV2 | ```<br>{<br>"id": "widgetWorkGroupType",<br>"type": "radioV2",<br>"value": "7259635026038505475" // 对应的类型选项ID<br>}<br>``` | 加班类型，具体格式可参考单选控件，如果定义中关闭「关联加班规则」则需要填写该字段
widgetWorkGroupTimeRangeFieldList | fieldList | ```<br>{<br>"id":"widgetWorkGroupTimeRangeFieldList",<br>"type":"fieldList",<br>"value":[<br>[<br>{<br>"id":"widgetWorkGroupStartTime",<br>"type":"date",<br>"value":"2019-10-01T08:12:01+08:00"<br>},<br>{<br>"id":"widgetWorkGroupEndTime",<br>"type":"date",<br>"value":"2019-10-01T08:12:01+08:00"<br>}<br>]<br>]<br>}<br>``` | 加班时段，具体格式可参考明细控件，如果定义中打开「允许提交多个加班时段」则可以传多个，最多支持30个，否则只会取第一个，单次加班时长不可超过两天
widgetWorkGroupReason | textarea | ```<br>{<br>"id": "widgetWorkGroupReason",<br>"type": "textarea",<br>"value": "111"<br>}<br>``` | 加班事由，如果定义中配置了「加班事由」必填，则必须填写该字段

**特殊的参数校验报错信息**
message                                                                            | 说明                           |
| ---------------------------------------------------------------------------------- | ---------------------------- |
| the time range list has more than 30 items                                         | 加班时段数量超过30                   |
| group value is invalid                                                             | 当前控件组的值无效，请校验是否为空或者校验类型是否为数组 |
| overtime type is required                                                          | 未关联加班规则时，加班类型必填              |
| work time range is required                                                        | 至少需要一个加班时段                   |
| start time is after end time                                                       | 开始时间晚于结束时间                   |
| start time or end time of range is required                                        | 加班时间段的开始时间和结束时间必填            |
| overtime duration is over 2 days                                                   | 单次加班时长不可超过两天                 |
| overtime date time zone not support                                                | 加班时段的日期时区信息无法识别              |
| {date} can not apply overtime                                                      | 所选时间不可申请加班                   |
| {date} already apply overtime                                                      | 所选时间已经有加班记录                  |
| {date} no need approval                                                            | 所选日期加班无需申请                   |
| apply reason is required                                                           | 定义中设置了加班事由为必填，不可为空           |
| {users} user follow different overtime rules, cannot be submitted in the same form | 所选加班人不在同一个考勤组内，无法同时提交加班      |
| invalid overtime work application                                                  | 没有有效的加班申请，请重新选择加班日期          |
| the overtime duration cannot be 0                                                  | 加班时长不能是0                     |
| the number of apply workers cannot exceed 50                                       | 单次申请加班人数量不可大于50              |
| apply worker is required                                                           | 必须有加班人，配置置可代多人提交时必须指定加班人     |
| resigned worker can not apply                                                      | 离职人员不可申请加班                   |
| overtime duration is over limit                                                    | 加班时长超过限制

### 外出控件组

**外出控件组请求体示例**
```json
{
    "id": "widgetOutGroup",
    "type": "outGroup",
    "value":[
        {
            "id": "widgetOutGroupType",
            "type": "radioV2",
            "value":  "me15yqrf-gmjgbml2vhp-0"      
        },
        {
            "id": "widgetOutGroupStartTime",
            "type": "date",
            "value":"2019-10-01T08:12:01+08:00"
        },
        {
            "id": "widgetOutGroupEndTime",
            "type": "date",
            "value":"2019-10-01T08:12:01+08:00"
        },
        {
            "id": "widgetOutGroupReason",
            "type": "textarea",
            "value":"123213"
        },
        {
            "id":"widgetOutGroupImage",
            "type":"image",
            "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]
        }                    
    ]   
}

```

**外出控件参数说明**

参数 | 类型 | 是否必填 | 描述
---|---|---|---
id | string | 是 | 控件组ID，固定为widgetOutGroup
type | string | 是 | 控件组Type，固定为outGroup
value | object[] | 是 | 控件组的值，值为多个子控件值的列表

value中包含的子控件值说明:

id | 类型 | JSON示例 | 描述
---|---|---|---
widgetOutGroupType | radioV2 | ```<br>{<br>"id": "widgetOutGroupType",<br>"type": "radioV2",<br>"value":  "me15yqrf-gmjgbml2vhp-0"      <br>}<br>``` | 外出类型，具体格式可参考单选控件，如果配置了「外出类型」则必填，外出时长单位会选取所选外出类型关联的单位，如果没有配置「外出类型」，则该字段无需填写，计算外出时长时会选取「外出时长」配置的单位
widgetOutGroupStartTime | date | ```<br>{<br>"id": "widgetOutGroupStartTime",<br>"type": "date",<br>"value":"2019-10-01T08:12:01+08:00"<br>}<br>``` | 外出开始时间，具体格式可参考日期控件，如果外出时长单位是半天假，则小于12点则认为是上午，否则认为是下午；如果单位是小时，则会按半小时的粒度向前取整
widgetOutGroupEndTime | date | ```<br>{<br>"id": "widgetOutGroupEndTime",<br>"type": "date",<br>"value":"2019-10-01T08:12:01+08:00"<br>}<br>``` | 外出结束时间，具体格式可参考日期控件，如果外出时长单位是半天假，则小于12点则认为是上午，否则认为是下午；如果单位是小时，则会按半小时的粒度向后取整
widgetOutGroupReason | textarea | ```<br>{<br>"id": "widgetOutGroupReason",<br>"type": "textarea",<br>"value":"123213"<br>}<br>``` | 外出事由，具体格式可参考多行文本控件，如果定义中「外出事由」必填，则必须填写该控件，如果定义配置无需填写，则无需填写该控件
widgetOutGroupImage | image | ```<br>{<br>"id":"widgetOutGroupImage",<br>"type":"image",<br>"value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]<br>}   <br>``` | 外出证明，具体格式可参考图片控件，如果定义中「外出拍照」必填，则必须填写该控件，如果定义配置无需填写，则无需填写该控件

**特殊的参数校验报错信息**

message                                               | 说明                           |
| ----------------------------------------------------- | ---------------------------- |
| group value is invalid                                | 当前控件组的值无效，请校验是否为空或者校验类型是否为数组 |
| start time format is not RFC3339                      | 开始时间日期格式非*RFC3339格式*         |
| end time format is not RFC3339                        | 结束时间日期格式非*RFC3339格式*         |
| start time and end time must be in the same time zone | 开始时间与结束时间必须是同一时区             |
| out type is required                                  | 如果定义中设定了「外出类型」，则外出类型必填       |
| out start time is required                            | 外出开始时间必填                     |
| out end time is required                              | 外出结束时间必填                     |
| out duration must be greater than 0                   | 外出间隔不能为0，请检查起止时间并重新选择        |
| out reason is empty                                   | 如果定义中勾选「外出事由」同时设定必填，则该字段必填   |
| photo is required                                     | 如果定义中勾选「外出拍照」同时设定必填，则该字段必填   |
| out time is conflict                                  | 外出时间有冲突，请确认是否已在该时段申请外出


<a id="s-b6930238e931340d"></a>

## references/lark-approval-instance-value-sourcing.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 审批提单值来源

## 目的

本文用于回答一个固定问题：在调用 `approval instances create` 发起原生审批实例时，**每个要填写的值从哪里拿**。

阅读顺序固定如下：

1. [`lark-approval-initiate.md`](lark-approval-0.md#s-9c86d856c03b8a0d) 中的创建请求参数、节点参数和返回结果说明
2. `approval approvals get` 返回的 `form` / `node_list`
3. [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025)
4. 本文

## 总原则

- `lark-approval-initiate.md` 决定创建请求字段名、字段层级、节点参数结构。
- `approvals.get.form` 决定控件 `id`、`type`、选项值范围、子控件结构。
- `approvals.get.node_list` 决定节点 key、是否必须补审批人、是否允许多人。
- [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 决定各控件 `value` 的最终结构。
- 除非本文明确允许，否则不要猜值来源，不要把展示文案直接当成可提交值。

## 默认来源

- 审批定义、`approval_code`、`is_external`、`create_link` 等基础信息，默认从 `approval approvals search` 获取。
- 控件 `id`、`type`、选项值、子控件结构，默认从 `approval approvals get.form` 获取。
- 节点 key、`need_approver`、`approver_chosen_multi` 等节点信息，默认从 `approval approvals get.node_list` 获取。
- 本文只补充 **这些默认来源之外** 的取值规则，以及当前必须由用户直接提供的值。

## 控件值来源规则

### 联系人 `contact`

- 只推荐写 `open_ids`。
- 不再推荐双写 `value(user_id)` + `open_ids`，避免复杂度继续上升。
- 如果用户给的是姓名、邮箱或账号，先用 `lark-contact` 解析成 `open_id`。

### 部门 `department`

- 最优先：用户直接提供 `open_department_id`。
- 若用户说“我的部门”或“张三的部门”，先用 `lark-contact` 查询对应人员信息，再取其所属部门里的 `open_department_id`。
- 如果查到该人员只有一个部门，可直接使用。
- 如果查到多个部门，不自动猜，必须让用户明确选一个，或直接输入 `open_department_id`。
- 如果仍无法确定，则明确告知当前不支持自动决定部门值。

### 附件 `attachmentV2`

- 当前 `lark-approval` 不负责上传文件。
- 用户必须直接提供 file code。
- 如果用户无法提供 file code，应明确告知当前无法仅通过 `lark-approval` 完成该控件提单。

### 图片 `image` / `imageV2`

- 当前 `lark-approval` 不负责上传图片。
- 用户必须直接提供 file code。
- 如果用户无法提供 file code，应明确告知当前无法仅通过 `lark-approval` 完成该控件提单。

### 文档 `document`

- 用户可直接提供 `token` / `document_id`。
- 如果用户给的是飞书文档链接，应先尝试从链接中提取 token。
- 若链接提取失败，再要求用户手动输入 token。

### 关联审批 `connect`

- 用户直接提供目标审批实例的 `instance_code`。
- 当前不默认做“搜索关联实例再反查 code”的自动流程。

### 地址 `address`

- 用户直接提供地理库 `id`。
- 若用户无法提供该 `id`，当前不支持自动取值。

## 特殊控件组

以下控件组的结构仍按 [`lark-approval-instance-form-control-parameters.md`](lark-approval-0.md#s-ae4579b915605025) 组装：

- `leaveGroupV2`
- `workGroup`
- `outGroup`
- `shiftGroup`

补充规则：

- 控件组自身和子控件的 `id` / `type` 从 `approval approvals get.form` 中识别。
- 组内单选/多选或业务枚举值，优先从 `approval approvals get.form` 返回的选项结构中取。
- 不要把控件组整体当成普通字符串或扁平对象提交。

## 不支持自动准备的值

以下值当前不建议由 `lark-approval` 自动准备：

- 文件上传后的 file code
- 图片上传后的 file code
- 地址控件的地理库 `id`
- 无法唯一确定的部门 `open_department_id`

遇到这类值时，应明确告诉用户需要提供什么，而不是继续猜测。

## 最小决策表

| 场景 | 处理 |
|---|---|
| 用户说“找张三当审批人” | 用 `lark-contact` 解析张三，取 `open_id` |
| 用户说“我的部门” | 先查当前用户部门；若多个部门，让用户选 |
| 用户给了文档链接 | 先尝试提取 token |
| 用户要填图片/附件 | 要求直接提供 file code |
| 用户要填关联审批 | 要求直接提供 `instance_code` |
| 用户要填地址 | 要求直接提供地理库 `id` |


<a id="s-2a5f723da6212888"></a>

## references/lark-approval-instances-cancel.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval instances cancel

撤回一个已发起的审批实例（用户级写操作）。通常先通过 `instances initiated`、`tasks query` 或 `instances get` 确认目标审批实例，拿到 `instance_code` 后再执行撤回。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要撤回该审批实例且目标实例无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:instance:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval instances cancel \
  --data '{"instance_code":"<INSTANCE_CODE>"}' \
  --as user \
  --dry-run

# 撤回一个审批实例
lark-cli approval instances cancel \
  --data '{"instance_code":"<INSTANCE_CODE>"}' \
  --as user \
  --yes

# 通过文件传入请求体
lark-cli approval instances cancel \
  --data @./cancel-body.json \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `instances initiated`、`tasks query` 或 `instances get` 获取 |
| `--as user` | 否 | 建议显式指定用户身份；审批实例撤回通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

如果你要找“我发起的审批实例”，可先查询已发起列表：

```text
lark-cli approval instances initiated --params '{"page_size":20}' --as user
```

如果你已经在任务列表中定位到某个审批，也可以从任务里拿到实例 Code：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `instances[].instance_code` | 审批实例 Code；撤回时必须提供 |
| `tasks[].instance_code` | 审批任务关联的审批实例 Code；也可作为撤回输入 |
| `tasks[].instance_status` | 审批实例状态；可用于判断是否仍处于可撤回阶段 |

如需先确认审批表单、当前节点、流转状态，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **撤回的是审批实例，不是单个任务**：`instances cancel` 只需要 `instance_code`，不需要 `task_id`。
- **优先确认实例是否仍可撤回**：已经通过、已拒绝、已撤销或已终止的实例通常不适合继续撤回。
- **优先从 `instances initiated` 获取目标实例**：因为撤回通常针对“我发起的审批”，这个入口最直接。
- **也可从 `tasks query` 反查 `instance_code`**：当你是从某个待办/已办上下文进入时，这样更方便。
- **先 `--dry-run` 再执行**：尤其在实例来源不明确、用户只给了标题关键字，或一次要核对多个实例时，先预览更安全。


<a id="s-12d139472cd3408e"></a>

## references/lark-approval-instances-cc.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval instances cc

给一个审批实例追加抄送人（用户级写操作）。通常先通过 `instances initiated`、`tasks query` 或 `instances get` 确认目标审批实例，拿到 `instance_code` 后，再提供抄送人的用户 ID 执行抄送。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要抄送该审批实例且目标实例、抄送对象都无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:instance:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval instances cc \
  --data '{"instance_code":"<INSTANCE_CODE>","cc_user_ids":["ou_xxx"],"comment":"抄送给项目 owner 了解进展"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --dry-run

# 按 open_id 抄送一个人
lark-cli approval instances cc \
  --data '{"instance_code":"<INSTANCE_CODE>","cc_user_ids":["ou_xxx"],"comment":"抄送给你知悉"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 一次抄送多个人
lark-cli approval instances cc \
  --data '{"instance_code":"<INSTANCE_CODE>","cc_user_ids":["ou_xxx","ou_yyy"],"comment":"请相关同学同步关注"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 按 user_id 抄送
lark-cli approval instances cc \
  --data '{"instance_code":"<INSTANCE_CODE>","cc_user_ids":["123456789"],"comment":"抄送给财务负责人"}' \
  --params '{"user_id_type":"user_id"}' \
  --as user \
  --yes

# 通过文件传入请求体
lark-cli approval instances cc \
  --data @./cc-body.json \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `instances initiated`、`tasks query` 或 `instances get` 获取 |
| `cc_user_ids` | 是 | 抄送人的用户 ID 数组；需要和 `user_id_type` 保持一致 |
| `comment` | 否 | 抄送留言，例如 `抄送给你知悉`、`请同步关注该审批进展` |
| `--params '{"user_id_type":"..."}'` | 否 | 查询参数 JSON；用于声明 `cc_user_ids` 内用户 ID 的类型 |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id`；未显式指定时要特别确认抄送人的 ID 类型 |
| `--as user` | 否 | 建议显式指定用户身份；审批实例抄送通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

如果你要找“我发起的审批实例”，可先查询已发起列表：

```text
lark-cli approval instances initiated --params '{"page_size":20}' --as user
```

如果你已经在任务列表中定位到某个审批，也可以从任务里拿到实例 Code：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `instances[].instance_code` | 审批实例 Code；抄送时必须提供 |
| `tasks[].instance_code` | 审批任务关联的审批实例 Code；也可作为抄送输入 |
| `tasks[].title` | 任务标题，可用于确认是否是要操作的那个审批 |
| `tasks[].instance_status` | 审批实例状态；可用于判断当前审批是否仍处于进行中 |

如果你手里只有姓名或邮箱，建议先通过联系人能力解析出正确的用户 ID，再执行抄送。

如需先确认审批表单、当前节点、流转状态，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **抄送的是审批实例，不是单个任务**：`instances cc` 只需要 `instance_code`，不需要 `task_id`。
- **`cc_user_ids` 与 `user_id_type` 必须匹配**：例如传 open_id 就把 `user_id_type` 设为 `open_id`；不要混用。
- **`cc_user_ids` 是数组**：即使只抄送一个人，也要按数组形式传入。
- **优先显式传 `user_id_type`**：这样 agent 更容易判断参数含义，也能减少 ID 类型不匹配带来的失败。
- **优先从 `instances initiated` 获取目标实例**：因为抄送常见于“我发起的审批”场景，这个入口最直接。
- **也可从 `tasks query` 反查 `instance_code`**：当你是从某个审批上下文进入时，这样更方便。
- **`comment` 建议简洁明确**：例如 `抄送给你知悉`、`请同步关注审批进展`。避免过长或模糊描述。
- **先 `--dry-run` 再执行**：尤其在抄送对象较多、抄送人来源不明确，或需要让用户先核对实例标题时，先预览更安全。


<a id="s-e80f7dde38033867"></a>

## references/lark-approval-instances-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval instances get

获取单个审批实例详情（用户级只读操作）。适合在执行 approve / reject / transfer / rollback / cancel / cc / remind 之前，先查看审批表单、当前节点、任务列表、审批动态和整体状态。

需要的 scopes: ["approval:instance:read"]

## 命令

```text
# 按实例 Code 查询详情
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user

# 表格格式输出，便于快速浏览顶层字段
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --format table --as user

# 预览 API 调用，不执行
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--params '{...}'` | 是 | 查询参数，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code |
| `locale` | 否 | 返回语言，例如 `zh-CN`、`en-US`、`ja-JP` |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id` |
| `--as user` | 否 | 建议显式指定用户身份；审批实例详情查询通常应使用用户身份 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 常见输入来源

如果你已经有实例 Code，可直接查询：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

如果你还没有实例 Code，可先从以下命令获取：

```text
# 查询我发起的审批实例
lark-cli approval instances initiated --params '{"page_size":20}' --as user

# 或从任务列表里拿到关联实例 Code
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

## 输出重点字段

返回结果中常见字段：

| 字段 | 说明 |
|------|------|
| `instance_code` | 审批实例 Code |
| `serial_number` | 审批单编号 |
| `definition_code` | 审批定义 Code |
| `definition_name` | 审批名称 |
| `user_id` | 发起审批的用户 ID |
| `department_id` | 发起人所在部门 ID |
| `status` | 审批实例状态，见下方“status 枚举” |
| `reverted` | 单据是否已被撤销 |
| `start_time` | 审批创建时间 |
| `end_time` | 审批完成时间，未完成时通常为 `0` |
| `form` | 表单数据，JSON 字符串 |
| `current_nodes` | 当前审批节点列表 |
| `tasks` | 审批任务列表 |
| `operation_records` | 审批动态，例如通过、拒绝、转交、加签、回退、撤回、抄送 |
| `comments` | 评论列表 |

## status 枚举

| 值 | 含义 |
|----|------|
| `PENDING` | 审批中 |
| `APPROVED` | 已通过 |
| `REJECTED` | 已拒绝 |
| `CANCELED` | 已撤回 |
| `DELETED` | 已删除 |

## current_nodes 重点字段

`current_nodes` 常用于判断审批流当前卡在哪一层：

| 字段 | 说明                                       |
|------|------------------------------------------|
| `current_nodes[].node_id` | 当前审批节点 ID                                |
| `current_nodes[].node_name` | 当前审批节点名称                                 |
| `current_nodes[].type` | 审批方式：`AND` 会签、`OR` 或签、`SEQUENTIAL` 依次审批等 |
| `current_nodes[].approvers[].task_id` | 当前审批人关联任务 ID                             |
| `current_nodes[].approvers[].user_id` | 当前审批人用户 ID                               |

## tasks 重点字段

`tasks` 常用于把实例和具体审批任务关联起来：

| 字段 | 说明 |
|------|------|
| `tasks[].id` | 审批任务 ID |
| `tasks[].node_id` | 任务所属节点 ID |
| `tasks[].node_name` | 任务所属节点名称 |
| `tasks[].user_id` | 审批人用户 ID |
| `tasks[].status` | 任务状态：`PENDING`、`APPROVED`、`REJECTED`、`TRANSFERRED`、`DONE` |
| `tasks[].start_time` | 任务开始时间 |
| `tasks[].end_time` | 任务完成时间 |

## operation_records 重点字段

`operation_records` 常用于审计审批过程：

| 字段 | 说明 |
|------|------|
| `operation_records[].type` | 事件类型，如 `PASS`、`REJECT`、`TRANSFER`、`ROLLBACK`、`CANCEL`、`CC` |
| `operation_records[].create_time` | 事件发生时间 |
| `operation_records[].user_id` | 触发该事件的用户 ID |
| `operation_records[].task_id` | 关联任务 ID |
| `operation_records[].node_id` | 关联节点 ID |
| `operation_records[].comment` | 理由 / 备注 |
| `operation_records[].cc_user_ids` | 被抄送人列表（抄送事件时） |

## 使用建议

- **这是最适合做“详情确认”的只读命令**：当你已经拿到 `instance_code`，需要确认表单、当前节点、任务状态、审批动态时，优先使用它。
- **在执行写操作前先看详情**：例如做 `tasks rollback` 前确认可退回节点，做 `instances cancel` 前确认实例状态，做 `tasks remind` 前确认当前任务是否仍待处理。
- **`form` 是 JSON 字符串**：调用方通常还需要再解析一层，才能拿到表单字段值。
- **`current_nodes` 和 `tasks` 可以联动看**：前者看“当前卡在哪个节点”，后者看“每个任务目前由谁处理、状态如何”。
- **`operation_records` 适合做时间线回溯**：例如排查谁转交过、谁加签过、什么时候撤回或抄送过。
- **优先显式传 `locale` 和 `user_id_type`**：这样 agent 更容易理解返回文本和 ID 语义，减少歧义。

## 输出与后续操作

读取详情后，常见下一步：

```text
# 同意审批任务
lark-cli approval tasks approve --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>"}' --as user --yes

# 撤回审批实例
lark-cli approval instances cancel --data '{"instance_code":"<INSTANCE_CODE>"}' --as user --yes

# 催办审批任务
lark-cli approval tasks remind --data '{"instance_code":"<INSTANCE_CODE>","task_ids":["<TASK_ID>"]}' --as user --yes
```


<a id="s-4399944f68b6f495"></a>

## references/lark-approval-instances-initiated.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval instances initiated

查询当前用户已发起的审批实例列表（用户级只读操作）。适合在需要查看“我发起了哪些审批”、筛选某类审批定义、获取 `instance_code` 供后续 `instances get` / `instances cancel` / `instances cc` 等命令使用时调用。

需要的 scopes: ["approval:instance:read"]

## 命令

```text
# 查询我发起的审批列表
lark-cli approval instances initiated --params '{"page_size":20}' --as user

# 只看某个审批定义下我发起的实例
lark-cli approval instances initiated --params '{"definition_code":"<DEFINITION_CODE>","page_size":20}' --as user

# 按关键词搜索我发起的实例
lark-cli approval instances initiated --params '{"keyword":"测试","page_size":10}' --as user

# 按发起时间范围筛选（秒级时间戳）
lark-cli approval instances initiated --params '{"start_timestamp":"<START_SECONDS>","end_timestamp":"<END_SECONDS>","page_size":20}' --as user

# 使用 page_token 翻页
lark-cli approval instances initiated --params '{"page_size":20,"page_token":"example_page_token"}' --as user

# 表格格式输出，便于快速浏览
lark-cli approval instances initiated --params '{"page_size":20}' --format table --as user

# 预览 API 调用，不执行
lark-cli approval instances initiated --params '{"page_size":20}' --as user --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--params '{...}'` | 否 | 查询参数，使用 JSON 传入；不传时使用默认分页与筛选 |
| `definition_code` | 否 | 审批定义 Code，用于只查看某个审批定义下我发起的实例 |
| `keyword` | 否 | 搜索关键词；非空时走搜索链路，空或仅空格时保持普通列表链路 |
| `start_timestamp` | 否 | 按发起时间筛选，时间范围开始值，秒级时间戳 |
| `end_timestamp` | 否 | 按发起时间筛选，时间范围结束值，秒级时间戳 |
| `locale` | 否 | 返回语言：`zh-CN`、`en-US`、`ja-JP` |
| `page_size` | 否 | 分页大小 |
| `page_token` | 否 | 翻页标记；首次请求不填，后续使用上一次返回的 `page_token` |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id` |
| `--as user` | 否 | 建议显式指定用户身份；已发起审批列表查询通常应使用用户身份 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 输出重点字段

返回结果中常见字段：

| 字段 | 说明 |
|------|------|
| `count` | 列表计数，只在第一页返回；大于等于 100 个实例时返回 `99` |
| `has_more` | 是否还有更多数据 |
| `page_token` | 下一页翻页 Token |
| `instances[].instance_code` | 审批实例 Code；后续查询详情或执行撤回 / 抄送时通常需要 |
| `instances[].definition_code` | 审批定义 Code |
| `instances[].definition_name` | 审批定义名称 |
| `instances[].definition_group_id` | 审批定义分组 ID |
| `instances[].definition_group_name` | 审批定义分组名称 |
| `instances[].initiator` | 发起人 ID |
| `instances[].initiator_name` | 发起人姓名 |
| `instances[].instance_status` | 审批实例状态，见下方“instance_status 枚举” |
| `instances[].instance_external_id` | 第三方审批实例 ID（仅第三方审批实例存在） |
| `instances[].link` | 三方审批跳转链接 |
| `instances[].summaries` | 摘要字段列表 |

## instance_status 枚举

| 值 | 含义 |
|----|------|
| `0` | 无流程状态，不展示对应标签 |
| `1` | 流程实例流转中 |
| `2` | 已通过 |
| `3` | 已拒绝 |
| `4` | 已撤销 |
| `5` | 已终止 |

## 常见使用场景

### 1) 找到我要操作的审批实例

```text
lark-cli approval instances initiated --params '{"page_size":20}' --format table --as user
```

拿到 `instances[].instance_code` 后，可继续：

```text
# 查看审批实例详情
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user

# 撤回审批实例
lark-cli approval instances cancel --data '{"instance_code":"<INSTANCE_CODE>"}' --as user --yes
```

### 2) 只看某类审批

```text
lark-cli approval instances initiated \
  --params '{"definition_code":"<DEFINITION_CODE>","page_size":20}' \
  --as user
```


## 使用建议

- **这是定位“我发起的审批实例”的首选命令**：如果你的目标是撤回、抄送、查看某个已发起审批，优先从这里拿 `instance_code`。
- **优先用 `definition_code` 缩小范围**：当你已知审批定义时，先筛掉无关实例，可显著提升可读性。
- **需要搜索时传入 `keyword`**：搜索排序和普通列表排序不同，按搜索服务结果为准。
- **按时间排查时使用 `start_timestamp` / `end_timestamp`**：这两个值都是秒级时间戳，用于按发起时间缩小结果范围。
- **结果很多时优先 `--format table`**：适合人工快速浏览。
- **`count` 只在第一页返回**：做分页处理时不要假设后续页还会带总数。
- **`instance_status` 可直接判断下一步**：例如状态为 `1` 时通常可继续查看详情或考虑撤回，状态为 `4` 表示已经撤销，无需重复撤回。
- **摘要字段 `summaries` 很适合做列表预览**：当审批标题不够明确时，可结合摘要值帮助识别目标实例。

## 输出与后续操作

拿到列表后，常见下一步：

```text
# 查看单个审批实例详情
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user

# 撤回审批实例
lark-cli approval instances cancel --data '{"instance_code":"<INSTANCE_CODE>"}' --as user --yes

# 给审批实例追加抄送人
lark-cli approval instances cc --data '{"instance_code":"<INSTANCE_CODE>","cc_user_ids":["<USER_ID>"]}' --params '{"user_id_type":"open_id"}' --as user --yes
```


<a id="s-5d85fa5e55eb20b3"></a>

## references/lark-approval-tasks-add-sign.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks add_sign

给一个审批任务加签（用户级写操作）。通常先通过 `tasks query` 拿到 `task_id` 和 `instance_code`，确认目标任务后，再提供被加签人的用户 ID、加签方式等参数执行加签。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要对该审批任务加签且目标任务、加签对象、加签方式都无误，再带 `--yes` 运行。用户已明确要求立即执行且列清本轮的加签、转交对象时，该确认覆盖这两个已明确的动作，不要逐条重复询问；不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:task:write"]

## 先选择加签类型

`add_sign_type` 会影响当前用户的审批任务是否继续可操作，不能只按示例顺序或任意选择：

| 用户意图 | `add_sign_type` | 处理方式 |
|----------|-----------------|----------|
| 明确说前加签 / “先让某人审核，我再审” | `1` | 前加签，并按用户要求选择 `approval_method` |
| 明确说后加签 / “我处理完，再让某人审核” | `2` | 后加签，并按用户要求选择 `approval_method` |
| “拉进来一起审” / “共同审核” / “一并确认” | `3` | 并加签；不传 `approval_method` |
| 同一请求要求先加签、再转交当前用户这一环 | `3` | **必须并加签**；加签成功后再转交当前任务 |

前加签或后加签可能推动当前用户的 task 流转，使原 `task_id` 不再支持后续转交。因此，“先加签，再把我这一环转交给其他人”不能使用前加签或后加签；先以 `add_sign_type: 3` 并加签，确认 `tasks add_sign` 成功后，再使用同一组 `instance_code` + `task_id` 执行 `tasks transfer`。

只有在上下文完全无法判断是哪种加签方式、且不同选择会改变审批流程时，才向用户二次询问。用户已经说“一起审”或已经要求“加签后转交当前环节”时，信息足够，不要再询问加签类型。

## 再选择 approval_method

只有前加签、后加签需要 `approval_method`；并加签不传。先遵循用户明确指定的审批方式；用户未指定时，按人数和语义选择：

| 加签人数与语义 | `approval_method` | 处理方式 |
|----------------|-------------------|----------|
| 只有 1 名加签人 | `1` | 使用或签；单人时或签、会签的实际效果相同，不再询问 |
| 多人，明确“任一人审批即可” / “一人通过即可” | `1` | 或签；任一加签人完成审批即可 |
| 多人，明确“所有人都要审批” / “全部确认” | `2` | 会签；所有加签人都必须完成审批 |
| 多人，明确“依次审批” / “先 A 后 B” | `3` | 依次审批；每个人按 `add_sign_user_ids` 的数组顺序逐一审批 |
| 多人，无法从上下文推断 | 不预设 | 询问用户选择或签、会签或依次审批，并说明三者效果 |

依次审批必须保留用户给出的人员顺序。如果已经确定要依次审批，但上下文无法判断先后顺序，先询问人员顺序，再构造 `add_sign_user_ids`；不要自行排序。

## 命令

```text
# 先预览并加签请求，不实际执行
lark-cli approval tasks add_sign \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","add_sign_type":3,"add_sign_user_ids":["ou_xxx"],"comment":"请项目 owner 一起审核"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --dry-run

# 单人前加签：未指定方式时使用或签
lark-cli approval tasks add_sign \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","add_sign_type":1,"add_sign_user_ids":["ou_xxx"],"approval_method":1,"comment":"请先补充审核"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 多人后加签：所有人都需要审批，使用会签
lark-cli approval tasks add_sign \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","add_sign_type":2,"add_sign_user_ids":["ou_xxx","ou_yyy"],"approval_method":2,"comment":"当前审批完成后请两位都完成审核"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 多人前加签：按数组中的人员顺序依次审批
lark-cli approval tasks add_sign \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","add_sign_type":1,"add_sign_user_ids":["ou_first","ou_second"],"approval_method":3,"comment":"请先由第一位审核，再由第二位审核"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 同一请求要求先加签、再转交：必须并加签；两条命令按顺序执行
lark-cli approval tasks add_sign \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","add_sign_type":3,"add_sign_user_ids":["ou_reviewer"],"comment":"请一起审核"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 仅在上面的 add_sign 成功后，转交同一当前任务
lark-cli approval tasks transfer \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","transfer_user_id":"ou_transferee","comment":"出差期间请代为处理"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment 或较多加签人
lark-cli approval tasks add_sign \
  --data @./add-sign-body.json \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances initiated` / `instances get` 获取 |
| `task_id` | 是 | 审批任务 ID；通常先通过 `tasks query` 获取 |
| `add_sign_type` | 是 | 加签类型：`1` 前加签、`2` 后加签、`3` 并加签 |
| `add_sign_user_ids` | 是 | 被加签人 ID 数组；需要和 `user_id_type` 保持一致 |
| `approval_method` | 否 | 审批方式：`1` 或签、`2` 会签、`3` 依次审批；**仅在前加签、后加签时需要填写**。单人未指定时使用 `1`；多人无法从语义推断时先询问用户 |
| `comment` | 否 | 审批意见或加签说明，例如 `前加签给财务复核`、`请项目 owner 一并确认` |
| `--params '{"user_id_type":"..."}'` | 否 | 查询参数 JSON；用于声明 `add_sign_user_ids` 内用户 ID 的类型 |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id`；未显式指定时要特别确认被加签人的 ID 类型 |
| `--as user` | 否 | 建议显式指定用户身份；审批加签通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 枚举说明

### add_sign_type

| 值 | 含义 | 对当前任务的影响 |
|----|------|------------------|
| `1` | 前加签 | 在当前审批前插入审批人，可能推动当前用户的 task 流转 |
| `2` | 后加签 | 在当前审批后追加审批人，可能推动当前用户的 task 流转 |
| `3` | 并加签 | 增加并行审批人；需要随后转交当前环节时使用 |

### approval_method

仅适用于前加签、后加签；并加签不传。

| 值 | 含义 | 完成条件 |
|----|------|----------|
| `1` | 或签 | 任一加签人完成审批即可 |
| `2` | 会签 | 所有加签人都必须完成审批 |
| `3` | 依次审批 | 所有加签人按 `add_sign_user_ids` 数组顺序逐一审批 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；执行 approve / reject / transfer / rollback / add_sign 等操作时通常都需要 |
| `tasks[].task_id` | 审批任务 ID；与 `instance_code` 配对使用 |
| `tasks[].support_api_operate` | 是否支持通过 API 处理该任务；加签前建议先检查 |

如果你手里只有姓名或邮箱，建议先通过联系人能力解析出正确的用户 ID，再执行加签。

如需先确认表单、节点、审批流进度，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_id` 要成对使用**：仅有实例 ID 或仅有任务 ID 都不足以准确执行加签操作。
- **`add_sign_user_ids` 与 `user_id_type` 必须匹配**：例如传 open_id 就把 `user_id_type` 设为 `open_id`；不要混用。
- **优先显式传 `user_id_type`**：这样 agent 更容易判断参数含义，也能减少 ID 类型不匹配带来的失败。
- **`add_sign_type` 要和业务意图一致**：前加签是在当前审批前插入审批人，后加签是在当前审批后追加审批人，并加签则是增加并行审批人。
- **加签后还要转交当前环节时必须并加签**：使用 `add_sign_type: 3`，等待加签成功后再用同一组任务参数转交；不要用前加签或后加签导致当前 task 提前流转。
- **无法推断类型时才询问**：如果用户没有说明先后或并行关系，且后续动作也不能帮助判断，再请用户选择；不要对“一起审”或“加签后转交”重复提问。
- **前加签 / 后加签要补 `approval_method`**：单人未指定时使用或签；多人优先按语义选择，无法推断时询问用户，不要静默默认。
- **依次审批保留人员顺序**：按用户指定的先后顺序构造 `add_sign_user_ids`；顺序不明确时先询问，不要自行排序。
- **优先从 `tasks query` 的待办列表拿任务参数**：尤其是 `topic=1` 的待办审批，最适合作为 add_sign 的输入来源。
- **先检查是否支持 API 操作**：如果 `tasks[].support_api_operate` 为 `false`，说明该任务可能不支持通过 API 执行处理动作，加签前应谨慎验证。
- **`comment` 建议写明加签原因**：例如 `增加财务复核`、`增加项目 owner 并行确认`，方便相关人员理解上下文。
- **先 `--dry-run` 再执行**：尤其在多人加签、跨部门加签或加签对象来源不明确时，先预览更安全。


<a id="s-1c1bf1c6e41cd5f6"></a>

## references/lark-approval-tasks-approve.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks approve

同意一个审批任务（用户级写操作）。通常先通过 `tasks query` 拿到 `task_id` 和 `instance_code`，必要时再用 `instances get` 查看详情，然后再执行同意。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确同意审批且目标任务无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:task:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval tasks approve \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","comment":"同意"}' \
  --as user \
  --dry-run

# 同意审批任务，并附带审批意见
lark-cli approval tasks approve \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","comment":"同意"}' \
  --as user \
  --yes

# 需要回填表单时，传入 form（按当前命令定义，form 为字符串化 JSON）
lark-cli approval tasks approve \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","comment":"同意并补充信息","form":"[{\"id\":\"user_name\",\"type\":\"input\",\"value\":\"Alice\"}]"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment / form
lark-cli approval tasks approve \
  --data @./approve-body.json \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances initiated` / `instances get` 获取 |
| `task_id` | 是 | 审批任务 ID；通常先通过 `tasks query` 获取 |
| `comment` | 否 | 审批意见，例如 `同意`、`已确认` |
| `form` | 否 | 表单数据；按当前命令定义，字段类型为 `string`，通常传字符串化 JSON；仅在审批动作需要同时回填表单时使用 |
| `--as user` | 否 | 建议显式指定用户身份；审批同意通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的两个字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；执行 approve / reject / rollback 等操作时通常都需要 |
| `tasks[].task_id` | 审批任务 ID；与 `instance_code` 配对使用 |

如需先确认表单、节点、审批流进度，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_id` 要成对使用**：仅有实例 ID 或仅有任务 ID 都不足以准确执行同意操作。
- **优先从 `tasks query` 的待办列表拿参数**：尤其是 `topic=1` 的待办审批，最适合作为 approve 的输入来源。
- **先检查是否支持 API 操作**：如果上一步 `tasks query` 返回的 `tasks[].support_api_operate` 为 `false`，说明该任务可能不支持通过 API 同意/拒绝。
- **`comment` 建议简洁明确**：例如 `同意`、`同意，信息已核对`。没有审批意见要求时可省略。
- **`form` 只在确有需要时传**：大多数简单同意场景只传 `instance_code`、`task_id`、可选 `comment` 即可。
- **先 `--dry-run` 再执行**：尤其在批量处理、表单回填或任务来源不明确时，先预览更安全。


<a id="s-3c682c5e9f3237eb"></a>

## references/lark-approval-tasks-query.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks query

查询当前用户的审批任务列表，可用于查看待办、已办、知会等分组。只读操作，不会修改审批状态。

需要的 scopes: ["approval:task:read"]

## 命令

```text
# 查询待办审批
lark-cli approval tasks query --params '{"topic":"1"}' --as user

# 查询已办审批
lark-cli approval tasks query --params '{"topic":"2"}' --as user

# 按关键词搜索任务列表
lark-cli approval tasks query --params '{"topic":"1","keyword":"测试","page_size":10}' --as user

# 按任务时间范围筛选（秒级时间戳）
lark-cli approval tasks query --params '{"topic":"1","start_timestamp":"<START_SECONDS>","end_timestamp":"<END_SECONDS>"}' --as user

# 使用 page_token 翻页
lark-cli approval tasks query --params '{"topic":"1","page_token":"example_page_token"}' --as user

# 表格格式输出，便于快速浏览
lark-cli approval tasks query --params '{"topic":"1"}' --format table --as user
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--params '{"topic":"..."}'` | 是 | 查询参数，使用 JSON 传入 |
| `topic` | 是 | 任务分组主题，见下方“topic 枚举” |
| `definition_code` | 否 | 审批定义 Code，用于仅查询某个审批定义下的任务 |
| `keyword` | 否 | 搜索关键词；非空时走搜索链路，空或仅空格时保持普通列表链路 |
| `start_timestamp` | 否 | 按任务时间筛选，时间范围开始值，秒级时间戳 |
| `end_timestamp` | 否 | 按任务时间筛选，时间范围结束值，秒级时间戳 |
| `locale` | 否 | 返回语言：`zh-CN`、`en-US`、`ja-JP` |
| `page_size` | 否 | 分页大小 |
| `page_token` | 否 | 翻页标记；首次请求不填，后续使用上一次返回的 `page_token` |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id` |
| `--as user` | 否 | 建议显式指定用户身份；审批任务查询通常应使用用户身份 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## topic 枚举

| 值 | 含义 |
|----|------|
| `1` | 待办审批 |
| `2` | 已办审批 |
| `17` | 未读知会 |
| `18` | 已读知会 |

## 输出重点字段

返回结果中常见字段：

| 字段 | 说明 |
|------|------|
| `count` | 列表计数，只在第一页返回；当任务数大于等于 100 时返回 `99` |
| `has_more` | 是否还有更多数据 |
| `page_token` | 下一页翻页 Token |
| `tasks[].task_id` | 任务 ID，全局唯一 |
| `tasks[].instance_code` | 审批实例 Code；后续执行 approve / reject / rollback 等操作时通常需要与 `task_id` 成对使用 |
| `tasks[].title` | 任务标题 |
| `tasks[].status` | 任务状态：`1` 待办、`2` 已办、`17` 未读、`18` 已读、`33` 处理中、`34` 撤回 |
| `tasks[].topic` | 任务所属分组主题 |
| `tasks[].instance_status` | 审批实例状态：`0` 无状态、`1` 流转中、`2` 已通过、`3` 已拒绝、`4` 已撤销、`5` 已终止 |
| `tasks[].definition_code` | 审批定义 Code |
| `tasks[].definition_name` | 审批定义名称 |
| `tasks[].initiator` | 发起人 ID |
| `tasks[].initiator_name` | 发起人姓名 |
| `tasks[].summaries` | 表单摘要字段列表 |
| `tasks[].support_api_operate` | 是否支持通过 API 同意或拒绝该任务 |
| `tasks[].user_id` | 任务所属用户 ID |
| `tasks[].instance_external_id` | 三方审批实例 ID，仅第三方审批实例存在 |
| `tasks[].task_external_id` | 三方审批任务 ID，仅第三方审批任务存在 |
| `tasks[].link` | 三方审批跳转链接 |

## 使用建议

- 常见处理链：先用 `tasks query` 拿到 `task_id` 和 `instance_code`，若用户需要查看详情、当前节点、表单内容、流程进度等内容，则调用 `instances get` 查看详情，最后执行 `tasks approve` / `tasks reject` / `tasks transfer` / `tasks add_sign` / `tasks rollback`。
- 如果你只想看“已发起的审批实例”，使用 `instances initiated`；`tasks query` 更适合围绕“任务分组”来拉取列表。
- 需要搜索任务标题、摘要或相关内容时传入 `keyword`；搜索排序和普通列表排序不同，按搜索服务结果为准。
- 按时间排查任务时使用 `start_timestamp` / `end_timestamp` 缩小范围；这两个值都是秒级时间戳。
- 需要继续翻页时，直接把上一次返回的 `page_token` 放回 `--params`。
- 当结果量较大时，优先使用 `--format table` 提升可读性。


<a id="s-ea738fff91ce99a0"></a>

## references/lark-approval-tasks-reject.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks reject

拒绝一个审批任务（用户级写操作）。通常先通过 `tasks query` 拿到 `task_id` 和 `instance_code`，必要时再用 `instances get` 查看详情，然后再执行拒绝。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要拒绝该审批且目标任务无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:task:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval tasks reject \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","comment":"拒绝"}' \
  --as user \
  --dry-run

# 拒绝审批任务，并附带审批意见
lark-cli approval tasks reject \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","comment":"拒绝，信息不完整"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment
lark-cli approval tasks reject \
  --data @./reject-body.json \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances initiated` / `instances get` 获取 |
| `task_id` | 是 | 审批任务 ID；通常先通过 `tasks query` 获取 |
| `comment` | 否 | 审批意见，例如 `拒绝`、`拒绝，信息不完整` |
| `--as user` | 否 | 建议显式指定用户身份；审批拒绝通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的两个字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；执行 approve / reject / rollback 等操作时通常都需要 |
| `tasks[].task_id` | 审批任务 ID；与 `instance_code` 配对使用 |

如需先确认表单、节点、审批流进度，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_id` 要成对使用**：仅有实例 ID 或仅有任务 ID 都不足以准确执行拒绝操作。
- **优先从 `tasks query` 的待办列表拿参数**：尤其是 `topic=1` 的待办审批，最适合作为 reject 的输入来源。
- **先检查是否支持 API 操作**：如果上一步 `tasks query` 返回的 `tasks[].support_api_operate` 为 `false`，说明该任务可能不支持通过 API 同意/拒绝。
- **`comment` 建议写清拒绝原因**：例如 `拒绝，缺少合同附件`、`拒绝，预算字段填写不完整`。这有助于发起人理解原因并补充材料。
- **先 `--dry-run` 再执行**：尤其在批量处理或任务来源不明确时，先预览更安全。


<a id="s-94ab8f435e95d701"></a>

## references/lark-approval-tasks-remind.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks remind

对审批实例中的指定任务发起催办（用户级写操作）。通常先通过 `tasks query` 找到待办任务，拿到 `instance_code` 和要催办的 `task_ids`，必要时再用 `instances get` 查看详情，然后执行催办。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要催办该审批且目标实例、目标任务都无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:instance:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval tasks remind \
  --data '{"instance_code":"<INSTANCE_CODE>","task_ids":["<TASK_ID>"],"comment":"请尽快处理"}' \
  --as user \
  --dry-run

# 催办单个审批任务
lark-cli approval tasks remind \
  --data '{"instance_code":"<INSTANCE_CODE>","task_ids":["<TASK_ID>"],"comment":"请尽快审批该单据"}' \
  --as user \
  --yes

# 同一实例下催办多个任务
lark-cli approval tasks remind \
  --data '{"instance_code":"<INSTANCE_CODE>","task_ids":["<TASK_ID_1>","<TASK_ID_2>"],"comment":"请相关审批人尽快处理"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment 或多个 task_ids
lark-cli approval tasks remind \
  --data @./remind-body.json \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances get` 获取 |
| `task_ids` | 是 | 被催办的任务 ID 数组；应与 `instance_code` 属于同一审批实例 |
| `comment` | 否 | 催办说明，例如 `请尽快处理`、`该单据较急，请优先审批` |
| `--as user` | 否 | 建议显式指定用户身份；审批催办通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；催办时必须提供 |
| `tasks[].task_id` | 审批任务 ID；放入 `task_ids` 数组中 |
| `tasks[].title` | 任务标题，可用于确认催办对象是否正确 |
| `tasks[].status` | 任务状态；一般优先催办仍处于待处理状态的任务 |

如需进一步确认当前审批流、节点和人员信息，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_ids` 要对应同一个审批实例**：不要把不同实例下的任务 ID 混在同一次催办请求中。
- **`task_ids` 是数组**：即使只催办一个任务，也要按数组形式传入。
- **优先从 `tasks query` 的待办列表拿参数**：尤其是 `topic=1` 的待办审批，最适合作为 remind 的输入来源。
- **催办前先确认任务仍需处理**：已经审批完成、已撤回或已终止的任务一般不适合继续催办。
- **`comment` 建议简洁且明确**：例如 `该单据较急，请优先审批`、`请今天内处理`。避免过长或模糊描述。
- **先 `--dry-run` 再执行**：尤其在一次催办多个任务、任务来源不明确或需让用户复核催办对象时，先预览更安全。


<a id="s-77b20e8418554ee6"></a>

## references/lark-approval-tasks-rollback.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks rollback

将一个审批任务退回到指定节点（用户级写操作）。通常先通过 `tasks query` 拿到 `task_id` 和 `instance_code`，再结合实例详情确认可退回的目标节点 `node_ids`，最后执行退回。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要退回该审批且目标任务、退回节点都无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:task:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval tasks rollback \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","node_ids":["<NODE_ID>"],"comment":"退回补充材料"}' \
  --as user \
  --dry-run

# 退回到单个节点
lark-cli approval tasks rollback \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","node_ids":["<NODE_ID>"],"comment":"请补充附件后重新提交"}' \
  --as user \
  --yes

# 退回到发起节点（发起节点 ID 为 START）
lark-cli approval tasks rollback \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","node_ids":["START"],"comment":"退回发起人补充材料"}' \
  --as user \
  --yes

# 传多个候选节点 ID（以实际审批定义支持情况为准）
lark-cli approval tasks rollback \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","node_ids":["<NODE_ID_1>","<NODE_ID_2>"],"comment":"退回上一处理节点"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment 或较多 node_ids
lark-cli approval tasks rollback \
  --data @./rollback-body.json \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances initiated` / `instances get` 获取 |
| `task_id` | 是 | 审批任务 ID；通常先通过 `tasks query` 获取 |
| `node_ids` | 是 | 退回目标节点 ID 数组；发起节点 ID 为 `START`；执行前应先确认这些节点确实可作为退回目标 |
| `comment` | 否 | 审批意见或退回说明，例如 `请补充附件后重新提交`、`预算说明不完整，请补充` |
| `--as user` | 否 | 建议显式指定用户身份；审批退回通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；执行 approve / reject / transfer / rollback 等操作时通常都需要 |
| `tasks[].task_id` | 审批任务 ID；与 `instance_code` 配对使用 |
| `tasks[].support_api_operate` | 是否支持通过 API 处理该任务；退回前建议先检查 |

如需确认流程节点、当前进度和可退回位置，可先查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_id` 要成对使用**：仅有实例 ID 或仅有任务 ID 都不足以准确执行退回操作。
- **`node_ids` 是必填项**：退回并不是“自动退回上一步”，而是要明确给出目标节点 ID 数组；退回发起节点时传 `START`。
- **先确认节点是否可退回**：不同审批定义支持的退回目标可能不同；在不确定时，先通过 `instances get` 或业务侧流程信息核实。
- **优先从 `tasks query` 的待办列表拿任务参数**：尤其是 `topic=1` 的待办审批，最适合作为 rollback 的输入来源。
- **先检查是否支持 API 操作**：如果 `tasks[].support_api_operate` 为 `false`，说明该任务可能不支持通过 API 执行处理动作，退回前应谨慎验证。
- **`comment` 建议写清退回原因**：例如 `附件缺失，请补齐后重新提交`、`费用说明不完整，请补充明细`，方便发起人或上一步处理人理解原因。
- **先 `--dry-run` 再执行**：尤其在节点来源不明确、审批链路复杂或批量处理时，先预览更安全。


<a id="s-5cdd294a9622797c"></a>

## references/lark-approval-tasks-transfer.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# approval tasks transfer

转交一个审批任务给其他用户处理（用户级写操作）。通常先通过 `tasks query` 拿到 `task_id` 和 `instance_code`，确认目标任务后，再提供被转交人的用户 ID 执行转交。

> [!CAUTION]
> 这是 **high-risk-write** 写操作。建议先用 `--dry-run` 预览；真正执行时，如果用户已明确要转交该审批且目标任务、转交对象都无误，再带 `--yes` 运行。不要在未获用户明确同意时静默追加 `--yes`。

需要的 scopes: ["approval:task:write"]

## 命令

```text
# 先预览请求，不实际执行
lark-cli approval tasks transfer \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","transfer_user_id":"ou_xxx","comment":"请你继续处理"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --dry-run

# 按 open_id 转交审批任务
lark-cli approval tasks transfer \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","transfer_user_id":"ou_xxx","comment":"转交给你处理"}' \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes

# 按 user_id 转交审批任务
lark-cli approval tasks transfer \
  --data '{"instance_code":"<INSTANCE_CODE>","task_id":"<TASK_ID>","transfer_user_id":"123456789","comment":"请补充审核"}' \
  --params '{"user_id_type":"user_id"}' \
  --as user \
  --yes

# 通过文件传入请求体，适合较长 comment
lark-cli approval tasks transfer \
  --data @./transfer-body.json \
  --params '{"user_id_type":"open_id"}' \
  --as user \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data '{...}'` | 是 | 请求体 JSON，使用 JSON 传入 |
| `instance_code` | 是 | 审批实例 Code；通常先通过 `tasks query` 或 `instances initiated` / `instances get` 获取 |
| `task_id` | 是 | 审批任务 ID；通常先通过 `tasks query` 获取 |
| `transfer_user_id` | 是 | 被转交人的用户 ID；需要和 `user_id_type` 保持一致 |
| `comment` | 否 | 审批意见或转交说明，例如 `转交给你处理`、`请继续审核该单据` |
| `--params '{"user_id_type":"..."}'` | 否 | 查询参数 JSON；用于声明 `transfer_user_id` 的 ID 类型 |
| `user_id_type` | 否 | 用户 ID 类型：`user_id`、`union_id`、`open_id`；未显式指定时要特别确认 `transfer_user_id` 的真实类型 |
| `--as user` | 否 | 建议显式指定用户身份；审批转交通常必须以用户身份执行 |
| `--yes` | 否 | 确认执行高风险写操作；未带时可能返回 `confirmation_required` / exit 10 |
| `--format` | 否 | 输出格式：`json`（默认）、`ndjson`、`table`、`csv` |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## 典型前置步骤

先查到待办任务：

```text
lark-cli approval tasks query --params '{"topic":"1"}' --as user
```

常用到的字段：

| 字段 | 说明 |
|------|------|
| `tasks[].instance_code` | 审批实例 Code；执行 approve / reject / transfer / rollback 等操作时通常都需要 |
| `tasks[].task_id` | 审批任务 ID；与 `instance_code` 配对使用 |
| `tasks[].support_api_operate` | 是否支持通过 API 处理该任务；转交前建议先检查 |

如果你手里只有姓名或邮箱，建议先通过联系人能力解析出正确的用户 ID，再执行转交。

如需先确认表单、节点、审批流进度，可继续查看实例详情：

```text
lark-cli approval instances get --params '{"instance_code":"<INSTANCE_CODE>"}' --as user
```

## 使用建议

- **`instance_code` 和 `task_id` 要成对使用**：仅有实例 ID 或仅有任务 ID 都不足以准确执行转交操作。
- **`transfer_user_id` 与 `user_id_type` 必须匹配**：例如传 open_id 就把 `user_id_type` 设为 `open_id`；不要混用。
- **优先显式传 `user_id_type`**：这样 agent 更容易判断参数含义，也能减少 ID 类型不匹配带来的失败。
- **优先从 `tasks query` 的待办列表拿任务参数**：尤其是 `topic=1` 的待办审批，最适合作为 transfer 的输入来源。
- **先检查是否支持 API 操作**：如果 `tasks[].support_api_operate` 为 `false`，说明该任务可能不支持通过 API 执行同意/拒绝等处理动作，转交前也应谨慎验证。
- **`comment` 建议写明转交原因**：例如 `你更熟悉该项目，请继续处理`、`转交给预算 owner 审核`，方便接收人理解上下文。
- **先 `--dry-run` 再执行**：尤其在跨部门转交、批量处理或转交对象来源不明确时，先预览更安全。


<a id="s-27deed1ac28b29bf"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `approval.v4.task.query` | [Feishu/Lark]-审批-审批查询-查询用户的任务列表 | feishu_read_tool |
| `cli.approval.approvals.search` | 搜索当前用户可发起的审批定义 | feishu_call_tool |
| `cli.approval.approvals.get` | 获取审批定义详情 | feishu_read_tool |
| `cli.approval.instances.get` | 获取单个审批实例详情 | feishu_read_tool |
| `cli.approval.instances.create` | 创建审批实例 | feishu_call_tool |
| `cli.approval.instances.cancel` | 撤回审批实例 | feishu_call_tool |
| `cli.approval.instances.cc` | 抄送审批实例 | feishu_call_tool |
| `cli.approval.instances.initiated` | 查询用户的已发起列表 | feishu_read_tool |
| `cli.approval.tasks.remind` | 催办审批人 | feishu_call_tool |
| `cli.approval.tasks.approve` | 同意审批任务 | feishu_call_tool |
| `cli.approval.tasks.reject` | 拒绝审批任务 | feishu_call_tool |
| `cli.approval.tasks.transfer` | 转交审批任务 | feishu_call_tool |
| `cli.approval.tasks.query` | 查询用户的任务列表 | feishu_read_tool |
| `cli.approval.tasks.add_sign` | 审批任务加签 | feishu_call_tool |
| `cli.approval.tasks.rollback` | 退回审批任务 | feishu_call_tool |


<a id="s-97c2655cb53cc597"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。



**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188)，其中包含认证、权限处理**

所有命令默认 `--as user`（审批是人的动作）。调用前先按需读取 references 下对应的文件，查参数结构，不要猜字段；**references 是第一信息源**，只有在 reference 未覆盖的原生 / 高级场景下，才额外用 `lark-cli ... --help`、`lark-cli schema` 等方式补充确认字段。

## 路由优先级（先判断是不是审批，再选命令）

审批待办不是飞书任务。**只要用户的核心对象是审批单据 / 审批待办 / 审批实例，就优先使用 `lark-approval`，不要让渡给 `lark-task`。**

### 明确归 `lark-approval` 的高优先级语义

出现以下任一语义时，优先走 `lark-approval`：

- 审批待办 / 审批单据 / 审批实例 / 审批意见 / 审批定义
- 同意 / 拒绝 / 转交 / 退回 / 撤回 / 催办 / 加签 / 抄送
- 待办列表 / 待办单据 / 已发起审批 / 已办审批 / 审批详情 / 同意可编辑

**判定规则：** 只要最终动作是对审批单据做同意、拒绝、转交、退回、撤回、催办、加签、抄送、查详情、查已发起/已办/待办，就归 `lark-approval`。只有当用户处理的是**非审批类任务/待办**时，才走 [`lark-task`]（按模块名读取对应工作流）。

## 选哪个命令

| 想做什么 | 命令 | 按需读取 reference                                                                  |
|---|---|---------------------------------------------------------------------------------|
| 搜可发起定义 | `approvals search` | [`lark-approval-approvals-search.md`](lark-approval-0.md#s-6361e0e4c53acbef) |
| 看审批定义详情/提单前确认表单与流程 | `approvals get` | [`lark-approval-approvals-get.md`](lark-approval-0.md#s-b13a269a4eb073d1)   |
| 发起原生审批实例/提交请假审批/提交报销审批/创建审批实例 | `instances create` | [`lark-approval-initiate.md`](lark-approval-0.md#s-9c86d856c03b8a0d)             |
| 查/搜待办、已办 | `tasks query`（`topic`：1待办 2已办 17未读 18已读） | [`lark-approval-tasks-query.md`](lark-approval-0.md#s-3c682c5e9f3237eb)       |
| 看表单/进度/当前节点 | `instances get` | [`lark-approval-instances-get.md`](lark-approval-0.md#s-e80f7dde38033867)   |
| 同意审批 | `tasks approve` | [`lark-approval-tasks-approve.md`](lark-approval-0.md#s-1c1bf1c6e41cd5f6)   |
| 拒绝审批 | `tasks reject` | [`lark-approval-tasks-reject.md`](lark-approval-0.md#s-ea738fff91ce99a0)     |
| 转交审批 | `tasks transfer` | [`lark-approval-tasks-transfer.md`](lark-approval-0.md#s-5cdd294a9622797c) |
| 加签审批 | `tasks add_sign` | [`lark-approval-tasks-add-sign.md`](lark-approval-0.md#s-5d85fa5e55eb20b3) |
| 退回审批 | `tasks rollback` | [`lark-approval-tasks-rollback.md`](lark-approval-0.md#s-77b20e8418554ee6) |
| 催办审批 | `tasks remind` | [`lark-approval-tasks-remind.md`](lark-approval-0.md#s-94ab8f435e95d701)     |
| 撤回已发起审批 | `instances cancel` | [`lark-approval-instances-cancel.md`](lark-approval-0.md#s-2a5f723da6212888) |
| 给审批实例追加抄送 | `instances cc` | [`lark-approval-instances-cc.md`](lark-approval-0.md#s-12d139472cd3408e)     |
| 按定义/关键词查已发起审批 | `instances initiated` | [`lark-approval-instances-initiated.md`](lark-approval-0.md#s-4399944f68b6f495) |

处理链：

- 发起审批：`approvals search` -> `approvals get` -> `instances create`
- 处理审批：`tasks query` 拿 `instance_code` + `task_id`（操作必须成对带上）→ 只有用户明确需要查看详情、当前节点、表单内容、或流程进度时，再 `instances get` → 执行操作

## 执行原则（减少误路由、误重试和无效消耗）

### 1) 先拿最小必要信息，再执行

- 目标只是处理待办时，优先 `tasks query` 获取 `instance_code` + `task_id`
- **只有**用户明确要看详情、当前节点、表单内容、流程进度时，才调用 `instances get`
- 用户已经明确给出 `instance_code` / `task_id` 时，不要先查列表再过滤

### 2) 已知对象时直达动作

- 已拿到 `instance_code` + `task_id` 后，优先直接执行 `tasks approve/reject/transfer/add_sign/rollback/remind`
- 同一轮里如果已有足够的新鲜查询结果，不要重复 `tasks query`
- 不要默认走 `list -> filter -> detail -> write` 全链路；对象已明确时应压缩步骤

### 3) 错误码驱动，而不是盲目重试

- 写操作失败后，先看错误码和报错语义，再决定是否补查或结束
- **除非错误明确提示可恢复或需要补充参数，否则不要重复刷同一个写操作**
- 同一个失败原因不要连续多次重试，避免 token 和耗时失控，最多重试1次

## 写操作失败处理：1395001 决策树

当拒绝 / 转交 / 退回 / 撤回 / 同意等写操作返回 `1395001`（任务状态异常 / 写前置校验失败）时，按下面规则处理：

1. **先停止盲目重试**，不要连续重复提交相同写操作，最多重试1次
2. 优先从以下角度解释：
   - 任务可能已被他人处理
   - 单据状态已变化，当前动作已不再允许
   - 当前用户已不具备该任务的操作资格
   - 当前节点或单据状态不支持该操作
3. 如需确认，只补 **一次** 状态查询（`tasks query` 或 `instances get`），不要陷入 query/write 循环
4. 最终给用户明确结论和下一步建议，而不是继续无意义重试

**特别注意：** 对拒绝 / 转交 / 撤回场景更要严格执行上述规则；这些场景最容易因状态切换而失败。

```text
lark-cli approval approvals search --data '{"keyword":"请假"}' --as user
lark-cli approval approvals get --params '{"approval_code":"<code>"}' --as user
lark-cli approval instances create --data '{"approval_code":"<code>","form":"[...]"}' --yes --as user
lark-cli approval tasks query --params '{"topic":"1"}' --as user
lark-cli approval tasks approve --data '{"instance_code":"<ic>","task_id":"<tid>","comment":"同意"}' --as user
```

## 不在本 skill 范围

创建审批定义（走飞书客户端或审批管理后台）；三方定义发起（返回 `create_link`，引导用户通过链接发起）；非审批类待办 → [`lark-task`]（按模块名读取对应工作流）
