<a id="s-0f8ea9ebe9d51002"></a>

## SKILL.md


# sheets

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先识别 spreadsheet_token、sheet_id 和 A1 范围；元数据列表不包含单元格值。使用 sheets.v2.tools.read 的 get_workbook_structure/get_cell_ranges 等已注册操作读取数据；若当前连接没有它，报告值读取缺口。

2. 电子表格工具 input 是结构化 JSON，MCP 层负责序列化。get_cell_ranges 的 input 至少含 ranges、sheet_id 或 sheet_name，excel_id 由资源 token 一致传入。写操作必须走 sheets.v2.tools.write，按参考的真实 tool_name 和输入协议构造。

3. 保留数字与文本类型、前导零、公式与显示值的区别。合并区域写入先核对范围，不擅自取消合并或改写左上角。修改结构、样式、数据分别核对。

4. 批量失败后已成功项不会自动回滚，先读取目标区域，仅重试未成功项。返回截断信息时缩小范围继续读；未经实际单元格读取不能编造数据分析。

5. 图表/透视/条件格式使用对应对象 ID 和 schema；参考中的 CLI flag 不直接作为 API 参数。

## 按需参考

- [工具与合同](lark-sheets-0.md#s-1fc1708a1e4de866)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-sheets-0.md#s-d34c656c2b13a2cb)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-sheets-0.md#s-1dda7c01291c3dbe)。


<a id="s-1dda7c01291c3dbe"></a>

## references/baseline-index.md

# 兼容参考

- [sheets_df.py](../assets/lark-sheets/references/baseline/scripts/sheets_df.py)


<a id="s-2c25121f6c3b3f7f"></a>

## references/lark-sheets-batch-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Batch Update

## 写入边界 + 回读校验

`+batch-update` 把多次写入打包成单次请求，但每个子操作仍应按编辑类任务的范围和回读建议处理：

1. **目标 range 应落在用户授权范围内**：除用户明示要修改的区域外，子操作避免扩张到无关单元格 / 列 / Sheet。规划 range 时先确认每个子操作的边界。
2. **批次完成后按子操作验证**：单元格写入/清除→`+cells-get`/`+csv-get`；对象 CRUD→对应 `+*-list`；sheet CRUD→`+workbook-info`；尺寸/隐藏/冻结/分组/合并→`+sheet-info`；网格线显隐这类没有回读接口的状态按子操作返回确认即可。至少覆盖首、中、末和用户点名项，不能只做统一 cells 抽样。
3. **预期条数前置断言**：涉及"批量填充 N 行"或"对 M 个区域分别写入"时，建议先把 N、M 硬编码进代码，回读后比较实际与预期；不一致就优先再发一轮 `+batch-update` 补齐，补不齐则在交付说明里列出缺口。
4. **三条工具硬约束**：`--yes` 必带（high-risk-write，不带退出码 10）；单次 ≤100 条 operations，超出按批拆分；`+cells-batch-set-style` / `+cells-batch-clear` 等批量类 shortcut 不可嵌入 operations（它们本身就是批量原子操作，直接顶层调用）。

若本次 `+batch-update` 的任一子操作写入了公式、复制了公式模板、或导入了含公式的数据块，回读之外必须对本次公式范围逐段执行 `+formula-verify --exit-on-error`；`partial` 拆分续扫，全部分段 `status='success'` 后才完成。`+batch-update` 只保证写入动作按序执行，不保证公式运行结果 zero-error。AI 公式改走 `+formula-verify --ai-only`，按 `references/lark-sheets-formula-verify.md` 的全区间一次异步状态检查规则交付（`failed` / `unsupported` 先修，只剩 pending 可交付并说明后台仍在计算）。

## 使用场景

写入。把**跨类型、有顺序依赖**的多个写入操作合并为一次请求按序执行（如插列 → 写表头 → 回填数据）。注意：不支持嵌套 `+batch-update`。

**先分流再动手（按操作组合选入口）**：美化收尾（样式 / 合并 / 行高列宽 / 冻结的任意组合）→ 一次 `+styles-put`（声明式规格，见 `references/lark-sheets-styles-put.md`），不要拼 `--operations` 子操作数组；**同一个写操作**打多个区域 → 用该命令自身的复数形态（`+cells-set --writes` / `+cells-batch-clear` / `+dim-delete --ranges` / resize 的 map 形态等）；只有跨类型、有顺序依赖的操作链才用本命令。

**⚠️ 优先使用 `+batch-update` 的场景**：
- 需要先插入行列再写入数据时（`+dim-{insert|delete|hide|unhide|freeze|group|ungroup}` + `+cells-set`）
- 需要对多个区域执行**不同类型**的写入操作时（如 `+cells-set` + `+cells-clear` 组合）。同一个写操作打多区域用该命令自身的复数形态、多区域 merge 用 `+styles-put` 的 `cell_merges`、大范围 unmerge 直接单次调用——均见上方分流，不进本命令

**多个互不依赖的图表任务优先使用 `+batch-chart-create` / `+batch-chart-update`**；只有图表与其它写入存在同一批次顺序依赖时，才把图表 shortcut 放进 `+batch-update`。

**不可放进 `--operations` 的写 shortcut**（`shortcut` 枚举不含它们，强行写入会被校验拒）：`+cells-set-image`（需本地上传图片）、`+styles-put` / `+dropdown-update` / `+dropdown-delete` / `+cells-batch-clear`（自身已是批量入口，不可再嵌套）、`+dim-move`。这些操作需在 `+batch-update` 之外单独调用。

**行高列宽批量不走这里**：多行 / 多列不同尺寸用 `+styles-put` 的 `row_sizes` / `col_sizes`（可与样式同批），或 `+rows-resize --heights` / `+cols-resize --widths` 的 map 形态（见 `references/lark-sheets-range-operations.md`）；map 形态不可作为 `--operations` 子操作嵌入（子操作里仍可用单区间形态 `range` + `height`/`width`）。

**执行语义（fail-fast；失败后哪些已生效取决于批次构成）**：默认首个失败的子操作即中断剩余操作。此前的子操作**是否已落盘不统一**：纯单元格 / 行列结构类写入在提交前只累计在内存，失败时整体不落盘（等效回滚）；而图表 / 透视表等对象类子操作执行时会**先把此前累计的写入提交落盘再创建对象**——批次含这类子操作时，失败前完成的部分（含其之前的普通写入）已实际生效、无法回滚。因此失败后**不要假设"全部回滚"或"全部保留"**：先看返回 `results` 里各子操作的状态，再回读现状（行列数 / 目标格 / `+chart-list` 等对象清单）确认已生效集合，只补发未生效部分——盲目整批重发会重复应用已生效操作（如插行 / 建图），盲目只发失败尾可能写到未生效的旧结构上。传 `--continue-on-error` 则遇失败仍继续执行剩余操作，已成功部分保留（返回 "N succeeded, M failed"）。

**公式相关批处理的完成流程**：
- 写前：先读 `references/lark-sheets-formula-translation.md`，把公式改写成飞书可执行语义。
- 写时：用 `+batch-update` 一次性完成插行/写公式/复制模板等成套动作。
- 写后：回读关键公式，并对本次公式范围逐段运行 `+formula-verify --exit-on-error`，全部 success 后完成；AI 公式改用 `+formula-verify --ai-only`，按 `references/lark-sheets-formula-verify.md` 的全区间一次异步状态检查规则交付。

**`+dropdown-update` 的选项模式（`--options` / `--source-range` 二选一）+ 配色规则**（更新会重写完整验证规则；需要保留已有配色时先回读并透传 `--colors`）见 [`references/lark-sheets-write-cells.md`](lark-sheets-0.md#s-aaec4f9bd070fde4) 的「Dropdown 选项 + 配色」节，本文不重复。`+dropdown-delete` 不涉及这些 flag。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+batch-update` | high-risk-write | 批量 |
| `+batch-chart-create` | write | 批量 |
| `+batch-chart-update` | write | 批量 |
| `+dropdown-update` | write | 对象 |
| `+dropdown-delete` | high-risk-write | 对象 |
| `+cells-batch-clear` | high-risk-write | 批量 |

## Flags

### `+batch-update`

_公共：URL/token（无 sheet 定位） · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--operations` | string + File + Stdin（复合 JSON） | required | JSON 数组：[{"shortcut":"+xxx-yyy","input":{...}}, ...]。shortcut 用 CLI 名；input 是该 shortcut 的入参集——含子表定位 sheet_id（或 sheet_name），但不含 spreadsheet token/url（后者只在顶层 --url/--spreadsheet-token 给一次；+batch-update 顶层没有 --sheet-id）；input 的键是该 shortcut 的 flag 展平成 JSON（如 "range":"A11:B12"），不是再套一层嵌套。基础 flag 查 --help，复合 JSON flag 查 --print-schema --flag-name <flag>；不要手填 operation 字段（由 CLI 按 shortcut 自动注入）。默认 fail-fast：首个失败即中断剩余操作；此前子操作是否已落盘**不统一**（纯单元格/结构写入失败时整体不落盘，图表/透视表等对象子操作会提前把累计写入落盘且自身无法回滚），失败后不要假设全回滚或全保留——先看 results 再回读现状确认已生效集合，只补发未生效部分；传 --continue-on-error 遇失败仍继续、已成功部分保留；不支持嵌套；按数组顺序串行执行 |
| `--continue-on-error` | bool | optional | 遇子操作失败时继续执行剩余操作；默认 false（首个失败即整批中断） |

### `+batch-chart-create`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--operations` | string + File + Stdin（复合 JSON） | required | 图表创建操作 JSON 数组；每项直接填写 `+chart-create-basic` 的 flag 和目标 sheet 定位，不要再套 `shortcut` / `input`。CLI 内部固定使用 `+chart-create-basic`。默认允许部分失败，成功图表保留，只重试失败项 |
| `--continue-on-error` | bool | optional | 单个图表失败后是否继续；默认 true |

### `+batch-chart-update`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--operations` | string + File + Stdin（复合 JSON） | required | 图表更新操作 JSON 数组；每项使用 `+chart-config-update` 或 `+chart-data-update`，input 传对应命令的 flag 集合和目标 sheet 定位。CLI 会先读取各图表当前快照，再生成 partial properties；默认允许部分失败 |
| `--continue-on-error` | bool | optional | 单个图表失败后是否继续；默认 true |

### `+dropdown-update`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--ranges` | string + File + Stdin（简单 JSON） | required | 目标范围 JSON 数组（最多 100 个，如 `["Sheet1!A2:A100","Sheet1!C2:C100"]`，前缀裸写不加引号），每项必须带 sheet 前缀；前缀必须与 sheet 真实显示名完全一致（含大小写），不接受 sheet reference_id |
| `--options` | string + File + Stdin（复合 JSON） | xor | 下拉选项 JSON 数组，例如 `["opt1","opt2"]`。服务端不限制选项数量，也不限制单个选项长度；含逗号的选项可以接受（写入时会自动转义）。大量选项建议改用 `--source-range`。 |
| `--colors` | string + File + Stdin（简单 JSON） | optional | 下拉胶囊背景色，RGB hex 数组。更新会重写整条验证规则：若用户未要求重置配色，先用 `+dropdown-get` 回读并将现有 `highlight_colors` 作为本 flag 传回；省略会按内置 10 色色板重建。用户明确要求新配色或选项有清晰语义配色时，应选浅色、低饱和度背景以适配黑色文字。长度可短不可长——超长 Validate 拦截（`--colors length (N) must not exceed dropdown source size (M)`），未指定项按内置色板循环补色。单独传即生效；`--highlight=false` 时被忽略。 |
| `--multiple` | bool | optional | 启用多选。本 flag 只更新验证规则，不会写入选中值；后续用 `+cells-set` 写值时必须传 `multiple_values` 数组，不要传逗号拼接的 `value` |
| `--highlight` | bool | optional | 下拉胶囊背景色高亮开关。**不传 = 开**（按内置 10 色色板循环上色）；`--highlight=false` 关闭得到纯白下拉。配色用 `--colors` 覆盖。 |
| `--source-range` | string | xor | listFromRange 模式的下拉源 range，A1 表示法 + sheet 前缀（如 `'Sheet1'!T1:T3`）。映射到 server `data_validation.range`，搭配 server `data_validation.type='listFromRange'` 自动生效。跟 `--options` 二选一：传 `--options` 走 inline 列表（type=list），传本 flag 走 range 引用（type=listFromRange）。`--colors` 长度规则不变（≤ 源 range 单元格数），`--highlight` / `--multiple` 行为相同。当 `--highlight` 开启且 source 覆盖单元格数超过 2000 时，服务端会将该下拉判为 option-error（这是不支持的组合）；CLI 会在返回结果的 `data.warnings` 中给出 warning。如需取消，传 `--highlight=false`。 |

### `+dropdown-delete`

_公共：URL/token（无 sheet 定位） · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--ranges` | string + File + Stdin（简单 JSON） | required | 目标范围 JSON 数组（最多 100 个，如 `["Sheet1!E2:E6"]`，前缀裸写不加引号），每项必须带 sheet 前缀；前缀必须与 sheet 真实显示名完全一致（含大小写），不接受 sheet reference_id |

### `+cells-batch-clear`

_公共：URL/token（无 sheet 定位） · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--ranges` | string + File + Stdin（简单 JSON） | required | 目标范围 JSON 数组（最多 100 个），每项必须带 sheet 前缀（如 `["Sheet1!A2:Z1000","Sheet2!A2:Z1000"]`，前缀裸写不加引号）；前缀必须与 sheet 真实显示名完全一致（含大小写），不接受 sheet reference_id；支持跨 sheet；对所有 range 执行同一 scope 的清除 |
| `--scope` | string | optional | 清除范围 enum：`content`（默认，仅清内容）/ `formats`（仅清格式）/ `all`（清内容 + 格式）（可选值：`content` / `formats` / `all`） |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+batch-update` `--operations`

_要批量执行的 CLI shortcut 操作列表，按声明顺序串行执行；任一失败立即中断_

**数组项**（类型 object）：
- `shortcut` (enum) — CLI shortcut 名（不是底层 MCP tool 名） [+cells-set / +cells-set-style / +cells-clear / +cells-merge / +cells-unmerge / +cells-replace / +csv-put / +dropdown-set / +dim-insert / +dim-delete / +dim-hide / +dim-unhide / +dim-freeze / +dim-group / +dim-ungroup / +rows-resize / +cols-resize / +range-move / +range-copy / +range-fill / +range-sort / +sheet-create / +sheet-delete / +sheet-rename / +sheet-move / +sheet-copy / +sheet-hide / +sheet-unhide / +sheet-set-tab-color / +sheet-show-gridline / +sheet-hide-gridline / +chart-create / +chart-update / +chart-delete / +chart-create-basic / +chart-config-update / +chart-data-update / +pivot-create / +pivot-update / +pivot-delete / +cond-format-create / +cond-format-update / +cond-format-delete / +filter-create / +filter-update / +filter-delete / +filter-view-create / +filter-view-update / +filter-view-delete / +sparkline-create / +sparkline-update / +sparkline-delete / +float-image-create / +float-image-update / +float-image-delete]
- `input` (object) — 该 shortcut 的入参集——含子表定位 sheet_id（或 sheet_name）

### `+batch-chart-create` `--operations`


**数组项**（类型 object）：
- `sheet_id` (string?) — 目标子表 ID；与 sheet_name 二选一
- `sheet_name` (string?) — 目标子表名；与 sheet_id 二选一
- `chart_type` (enum) [column / bar / line / area / pie / scatter / combo / radar / bubble / waterfall / pareto]
- `data_range` (string)
- `header_range` (string?)
- `data_direction` (enum?) [row / column]
- `dim1_index` (integer?)
- `dim2_indexes` (oneOf?)
- `series_types` (oneOf?)
- `series_y_axes` (oneOf?)
- `key_index` (integer?) — 气泡图标识/名称维度的 1-based 索引；默认 1
- `x_index` (integer?) — 气泡图 X 值维度的 1-based 索引；与 y_index 同时提供
- `y_index` (integer?) — 气泡图 Y 值维度的 1-based 索引；与 x_index 同时提供
- `group_index` (integer?) — 气泡图可选分组维度的 1-based 索引
- `size_index` (integer?) — 气泡图可选气泡大小维度的 1-based 索引
- `title` (string?)
- `anchor_cell` (string?)

### `+batch-chart-update` `--operations`


**数组项**（类型 object）：
- `shortcut` (enum) [+chart-config-update / +chart-data-update]
- `input` (object) — 对应图表更新 shortcut 的 flag 集合；包含 sheet_id 或 sheet_name，不包含 spreadsheet token/url

### `+dropdown-update` `--options`

_列表选项_

**数组项**（类型 string）：
- 标量：string

## Examples

公共四件套：`--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（前两者 XOR；`+batch-update` 本身不强制 sheet-id，子操作各自携带）。

### `+batch-update`

示例：

```text
lark-cli sheets +batch-update --url "https://example.feishu.cn/sheets/shtXXX" --yes \
  --operations @ops.json

# ops.json （array<{shortcut, input}>，shortcut 用 CLI 名）:
# [
#   {"shortcut": "+dim-insert", "input": {"sheet_id":"...","position":10,"count":3}},
#   {"shortcut": "+cells-set",  "input": {"sheet_id":"...","range":"A11:B12","cells":[[{"value":"a"},{"value":"b"}],[{"value":"c"},{"value":"d"}]]}}
# ]
```

> ⚠️ **子操作定位规则**：
> - spreadsheet 定位（`--url` / `--spreadsheet-token`）**只在顶层给一次**；`+batch-update` 顶层**没有** `--sheet-id` / `--sheet-name`，在顶层传不生效。
> - **每个子操作的子表定位 `sheet_id`（或 `sheet_name`）写进它自己的 `input`**（见上方 ops.json 每个 item）。
> - `input` 的键是该 shortcut 的 flag **展平**成 JSON（`"range":"A11:B12"`、`"position":11`），不要把整组 `--operations` 再套一层嵌套 JSON。

> **常见组合：插列 + 写表头 + 整列回填**——一次批量提交，不要拆成 N 次独立调用。批量回填同一列 **只需一次** `+cells-set`（range 写整列范围、cells 写 N×1 矩阵），不需要逐行循环。
>
> ```jsonc
> // 在 C 列前插入新列 → 写表头 C1 → 回填 C2:C100 共 99 行
> [
>   {"shortcut": "+dim-insert",
>    "input": {"sheet_name": "Sheet1", "position": "C", "count": 1}},
>   {"shortcut": "+cells-set",
>    "input": {"sheet_name": "Sheet1", "range": "C1:C100",
>              "cells": [[{"value":"score"}], [{"value":95}], [{"value":87}], /* ... 97 more rows ... */ ]}}
> ]
> ```

> **多图表组合**：先完成全部辅助数据，再把每张图的输入放进 `+batch-chart-create`；每项同时记录精确表头范围、数据方向和预期系列数。批次完成后，每个受影响的 sheet 各调用一次 `+chart-list`。已有图表的批量修正改用 `+batch-chart-update`。
>
> ```json
> [
>   {"sheet_name":"Sheet1","chart_type":"column","data_range":"'Sheet1'!A1:C10","title":"分类对比","anchor_cell":"F2"},
>   {"sheet_name":"Sheet1","chart_type":"line","data_range":"'Sheet1'!E1:G10","title":"趋势变化","anchor_cell":"F18"}
> ]
> ```
>
> ```text
> lark-cli sheets +batch-chart-create --url "..." --operations @ops.json
> ```

### `+cells-batch-clear`

多 range 一次性清除（服务端走 `+batch-update` 批量提交，fail-fast，失败处置见下方「执行语义」）；`--scope` 同 `+cells-clear`（`content` / `formats` / `all`，默认 `content`），`high-risk-write` 强制 `--yes`：

```text
# dry-run 先看清除范围
lark-cli sheets +cells-batch-clear --url "..." \
  --ranges '["sheet1!A2:Z1000","sheet2!A2:Z1000"]' --scope all --dry-run
# 执行
lark-cli sheets +cells-batch-clear --url "..." \
  --ranges '["sheet1!A2:Z1000","sheet2!A2:Z1000"]' --scope all --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：`+batch-update` 的 `--operations` 必须合法 JSON，且为非空数组；逐个子操作 `shortcut` / `input` 字段必填校验，input 键必须在该 shortcut 的 flag 词汇表内（未知键报错并提示最近似键与完整键契约）；**校验错误聚合上报**——所有子操作的首错一次性返回，全部修完再重发一次即可；**禁止嵌套 `+batch-update`**。`+cells-batch-clear` 的 `--ranges` 必须 JSON 数组、每项带 sheet 前缀，`high-risk-write` 强制 `--yes` 或 `--dry-run`（`--scope` 默认 `content`）。
- `DryRun`：按顺序输出每个子操作的目标 API + 请求 body 模板，不发起调用。
- `Execute`：按声明顺序串行执行；默认 fail-fast。失败时已成功子操作不回滚，先按子操作类型回读现状，只重发失败起的剩余子集；成功时也完成上述分流验证。


<a id="s-18cdf321d09f6521"></a>

## references/lark-sheets-changeset.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Changeset

## 使用场景

读取两个版本之间的 **changeset（变更操作清单）**，用于**复核某次编辑（尤其是 AI 编辑）是否真实满足用户诉求**。

典型场景：AI agent 对表格做了一批编辑后，想确认它"说做的"和"真正落到表格上的"是否一致——拉取编辑前版本到编辑后版本之间的 changeset，逐条核对 action 是否覆盖了用户要求的修改、有没有多改 / 漏改。

## 版本（revision）语义

- 这里的"版本"指表格的 **CS revision**（每次提交单调递增的修订号），不是文档历史里的命名版本。
- `--start-revision` 是复核基线，即你认定的"编辑前"版本。
- `--end-revision` 是"编辑后"版本；**省略时默认取最新 revision**，返回从 start 到最新的全部 changeset。
- **版本差上限 20**：`end - start + 1 ≤ 20`，超出会被拒绝（服务端同样以 20 兜底）。复核大跨度变更时请分段拉取。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+changeset-get` | read | 变更记录 |

## Flags

### `+changeset-get`

_公共：URL/token（无 sheet 定位）_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--start-revision` | int | required | 起始版本（编辑前基线，>= 1） |
| `--end-revision` | int | optional | 结束版本（省略取最新） |

## 返回结构

返回一个 JSON 对象，`changesets` 数组按版本顺序排列，每个元素是一次提交的**原始 action 列表**与元信息：

```json
{
  "spreadsheet_token": "shtcnXXXX",
  "latest_revision": 142,
  "start_revision": 120,
  "end_revision": 135,
  "changesets": [
    {
      "revision": 121,
      "create_time": "2026-06-12T10:00:00Z",
      "actions": [
        { "action": "setCellRange", "sheetId": "...", "value": { /* ... */ } }
      ],
      "is_self_edit": false,
      "is_ai_edit": true
    }
  ]
}
```

- 最外层 `latest_revision` 是**当前表格的最新版本号**（与查询区间无关），便于判断表格当前停在哪个版本、`--start-revision` 该取多少。
- `actions` 是**未经语义渲染的原始操作对象**，按提交内的执行顺序排列。复核时逐条比对：每个 action 改了哪个 sheet、哪个区域、改成什么，是否对应用户的诉求。
- `revision` / `create_time` 用于判断"这次改动属于哪个版本、什么时候做的"。
- `is_self_edit` 表示该 changeset 是否由当前请求用户提交（committer 与请求用户相同），即"是不是我自己提交的编辑"。
- `is_ai_edit` 表示该 changeset 是否由 AI 客户端提交（`member_id` 为 10 / 11）。复核时 `is_ai_edit=true` 即为 AI 写入的编辑（而非用户手动编辑），是核对 AI 是否完成诉求的主要对象。

## 复核工作流（判断 AI 是否真实完成诉求）

1. 记下 AI 开始编辑前的 revision（编辑前 `+workbook-info` 或上一次工具返回的 revision 即可作为 `--start-revision`）。
2. AI 编辑完成后，跑 `+changeset-get --url <表格> --start-revision <编辑前版本>`（不传 end → 取到最新）。
3. 遍历 `changesets[].actions`，核对：
   - 用户要求的每一处修改是否都有对应 action；
   - 有没有越权 / 多余的修改（动了用户没让动的 sheet / 区域）；
   - action 的目标区域、值是否与诉求一致。
4. 若版本跨度可能 > 20，分段拉取（如 `start..start+19`、`start+20..` …）。

## 注意

- `+changeset-get` 是**只读**操作，不改动表格。
- 大跨度 / 大批量编辑的 changeset 可能体积较大；输出在传输层已 gzip。必要时缩小版本区间。
- 该工具走只读 scope `sheets:spreadsheet:read`，需要对表格有查看权限。

## Examples

### `+changeset-get`

公共：`--url` / `--spreadsheet-token`（二选一，无 sheet 定位）。changeset 是工作簿级历史，不接受 sheet 定位 flag。

示例：

```text
# 只传起始版本 → 返回从该版本到最新的全部 changeset（最常用：复核 AI 编辑前后的差异）
lark-cli sheets +changeset-get --url "https://example.feishu.cn/sheets/shtXXX" --start-revision 120

# 传起始 + 结束版本（版本差 end-start+1 ≤ 20）
lark-cli sheets +changeset-get --spreadsheet-token shtXXX --start-revision 120 --end-revision 135
```

输出契约（envelope.data）：

- `latest_revision` — 当前表格最新版本号（与查询区间无关）
- `start_revision` / `end_revision` — 实际查询区间（省略 `--end-revision` 时 `end_revision` = 最新版本）
- `changesets[]` — 按版本顺序排列；每项含 `revision` / `create_time` / `actions`（原始操作列表）/ `is_self_edit` / `is_ai_edit`

### Validate / DryRun / Execute 约束

- `Validate` 阶段只做 XOR 检查（`--url` / `--spreadsheet-token` 二选一）与版本上限校验（`--start-revision ≥ 1`，传了 `--end-revision` 时 `end ≥ start` 且 `end - start + 1 ≤ 20`）；**禁止**联网。
- `DryRun` 输出请求模板，不实际拉取 changeset。
- `Execute` 阶段才发起 changeset 查询；省略 `--end-revision` 时由服务端解析为最新 revision。

<a id="s-cbce883aa9089c71"></a>

## references/lark-sheets-chart.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Chart

## 真对象硬约束

当用户要求"画个图 / 数据可视化 / 趋势图 / 对比图 / 占比图"时，**必须**通过图表创建命令创建真实的图表对象。**禁止**用本地脚本调 matplotlib / seaborn 生成图片再插入到表格代替——静态图片无法随源数据更新，且失去交互能力。判断标准：最终对象必须能被 `+chart-list` 返回；基础单图可先用创建调用返回的完整 `snapshot` 验证，批量创建必须按受影响的 sheet 回读列表。

## 使用场景

读写图表对象。基础创建和常用更新优先用语义 shortcut，只在高级配置时使用原始 snapshot：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有图表 | `+chart-list` | 获取图表的类型、数据源和样式配置 |
| 按类型和范围创建基础图 | `+chart-create-basic` | 支持 column/bar/line/area/pie/scatter/combo/radar/bubble/waterfall/pareto、行/列方向与整图配色；无需构造 snapshot |
| 更新标题、轴、图例、标签、堆叠、平滑或整图配色 | `+chart-config-update` | CLI 读取当前快照并只回写配置 patch |
| 修正已有图表的数据范围或方向 | `+chart-data-update` | CLI 读取当前快照并只回写 data patch，保留其它配置 |
| 批量创建多个独立图表 | `+batch-chart-create` | 保留成功图表，并逐项返回失败原因；只重试失败项 |
| 批量更新多个独立图表 | `+batch-chart-update` | 逐图读取当前快照并生成 partial properties |
| 高级创建/更新、删除图表 | `+chart-{create\|update\|delete}` | 按系列/数据点精细设置等高级需求才使用原始 properties；更新只提交必要的局部 properties |

## 统一决策顺序

明确目标后，始终按以下顺序选入口，不从原始 snapshot 起步：

1. 普通单图创建 → `+chart-create-basic`；
2. 多张独立图创建 → `+batch-chart-create`；
3. 已有图的数据源 / 方向 / 系列变化 → `+chart-data-update`；
4. 已有图的标题 / 轴 / 图例 / 标签 / 堆叠 / 平滑 / 整图配色变化 → `+chart-config-update`；
5. 只有上述语义 shortcut 无法表达的单系列、单数据点或高级字段，才使用 `+chart-create` / `+chart-update` 的原始 `properties`。

进入高级入口前先写明“哪个用户要求无法由哪个语义参数表达”。答不出来就退回语义 shortcut。不要因为语义调用失败一次就改走原始 snapshot；先根据明确错误修正参数。

普通创建、数据源修正和常用配置更新不要构造原始 snapshot。

典型工作流：先确认表头、精确数据范围和图表配置，运行 `python3 scripts/lark_chart_size_advisor.py` 取得建议尺寸，再将返回的 `data.create_flags.width` / `height` 原样传给 `+chart-create-basic`；创建时尽量在同次调用中带上已知标题/轴/标签内容要求，标签位置只有用户明确指定时才传。创建后用返回的完整 `snapshot` 检查范围、方向与系列，再按需用 `+chart-list` 验证。已有图表的数据范围或方向错误时用 `+chart-data-update`，常用配置修正用 `+chart-config-update`。只有用户要求单个系列、数据点或高级引擎字段时，才读取现有 snapshot 并调 `+chart-update --properties`。不要为了常用配置先输出整份 schema，也不要删除重建已经创建成功的图表。

**多图表工作流**：先完成所有辅助数据和表头，列出每张目标图的类型、精确数据范围、标题和落点；确认清单后，用一次 `+batch-chart-create` 批量创建。它的每个 operation 直接填写 `+chart-create-basic` flags，CLI 内部固定按 `+chart-create-basic` 执行，不要再套 `shortcut` / `input`。图表之间独立时允许部分成功：按返回的逐项结果定位失败图表，只重试失败项。批量 create 的逐项结果不返回完整 snapshot；批次后每个受影响的 sheet 各调用一次 `+chart-list`。已经成功创建的图表有数据源或配置差异时，用 `+batch-chart-update` 批量执行对应的语义更新，不要删除重建。

**图表错误处理工作流（必须按顺序）**：
1. **基础单图走快路径**：sheet、范围、类型和落点都明确时，直接调用 `+chart-create-basic`，并检查返回的完整 `snapshot`；不要为了预览而固定多做一次 `--dry-run`。
2. **以下情况创建前必须 `--dry-run`**：批量创建、多范围或跨子表数据源、包含“每个 / 分别 / 逐一”等数量词、落点不确定，或确实需要原始高级配置。检查数量、sheet、范围、类型和落点；输出中的 `tool_name` / `operation` / `basic_chart` / `properties` 是 CLI 翻译后的内部 MCP body，**只能读，不能复制回 operations**。
3. 批量执行后同时检查 `succeeded`、`failed` 和逐项 `results[index]`；命令退出成功或顶层 `ok=true` 不代表每张图都成功。单图则检查返回的 `snapshot`。
4. 有失败时保留成功图表，按原始 `index` 重新生成只包含失败项的新 operations。禁止复用原始整批 payload，否则会重复创建已经成功的图表。
5. 批量成功后每个受影响 sheet 只调用一次 `+chart-list`，核对总数、标题、范围、方向与系列；基础单图的返回 `snapshot` 完整且符合预期时不再重复 list，只有响应不完整、后续又更新或结果存疑时再 list。
6. 快照不符合预期时原地修复：数据源、方向、维度/系列、分离表头用 `+chart-data-update`；标题、轴、图例、标签、堆叠、平滑、配色用 `+chart-config-update`；只有高级字段才用 `+chart-update --properties` 的最小局部 patch。不要删除重建。

**失败归因与恢复**：
- 参数校验失败：只根据 stderr 指出的未知 flag、缺失字段或 operations 结构修正一次；不要把 `--dry-run` 展示的内部 body 复制回命令。
- 批量部分失败：保留成功项，只重试 `failed` 对应的原始 index；重试前断言新 operations 数量等于失败数。
- 执行成功但结果不符：以返回 snapshot / `+chart-list` 为准，在原图上走语义更新；不要因标题、范围或配色不对就删除重建。
- 返回空输出或无法确认：检查退出码和 stderr，并做一次对象回读；仍无法确认时如实报告，禁止声称已完成。
- 同一种修正再次失败：停止改猜 schema、MCP body 或完整 snapshot。若语义 shortcut 能表达就回到语义入口；否则保留原对象并报告明确错误。

**图片图表 → 真图表迁移（“把截图 / 贴图换成真图表”类任务）**：
1. 先用 `+float-image-list` 读取待替换浮动图片的 ID、位置、尺寸和数量，并确认每张图片与目标真图表的对应关系；不得把 logo、说明图或无法确认对应关系的图片当成待替换图表。
2. 用户要求“配色 / 样式与原图一致”时，必须先使用可用的图像理解能力视觉检查原图，确认图表类型、标题、系列配色、图例、标签、堆叠方式、位置和尺寸；`+float-image-list` 只用于获取对象信息，不能代替视觉检查。对无法确认的样式不得凭空猜测。
3. 优先用 `+chart-create-basic` / `+batch-chart-create` 的语义参数复刻已确认的类型、标题、配色、图例、标签和堆叠方式，并尽量按原图位置与尺寸落图。普通整图配色使用 `--colors` / `--color-palette`；只有原图明确包含语义 shortcut 无法表达的单系列或单数据点样式时，才使用原始 `properties`。
4. 建好真图表后，必须先用创建返回的完整 `snapshot` 或 `+chart-list` 确认图表数量、标题、数据源、系列和位置正确，再按 [Lark Sheet Float Image](lark-sheets-0.md#s-de6e8fafb9b89e1b) 的高风险删除流程用 `+float-image-delete` 删除与其一一对应的原浮动图片。
5. 删除后再调用一次 `+float-image-list`，确认被替换图片已消失，其它图片未受影响。

**数量词必须展开**：用户说“每个 / 每天 / 分别 / 逐一 / 各一张图”时，先从数据中数出实体数 `N`，把这 `N` 张图逐项写进清单，再加上其它汇总图得到目标总数 `M`；一个包含全部实体的多系列图不能替代这 `N` 张独立图。批次前断言 operations 中恰有 `M` 个图表创建，批次后 `+chart-list` 断言图表总数、逐图标题与实体集合一致。**图表类型和维度也要逐图断言**：用户点名的图表类型（折线 / 柱状 / 堆积 / 饼）、横轴取哪一列、按哪一列分组，动手前写成清单，画完逐项核回来——多张单维度图不能替代一张按维度分组的图，反之亦然。

**范围与系列前置校验（创建前必做）**：清单中同时记录每张图的表头范围、纳入维度、明确排除维度、数据方向和预期系列数。每张图只支持一个类别 / X 轴维度（`dim1`），不支持把多个字段作为多级横轴；当前每张图**最多 50 个数值系列**；按列组织时通常为“所选数值列数”，按行组织时通常为“所选数值行数”。创建时就用 `+chart-create-basic --dim1-index ... --dim2-indexes ...` 显式选择类别与不超过 50 个数值系列；如果业务要求展示超过 50 个系列，应先建立紧凑汇总表或 Top-N，而不是反复删除重建。创建前根据实际表头确认索引和边界，不凭字母猜范围；创建后范围、方向或系列数不符时，使用 `+chart-data-update` 修正，CLI 会读取当前快照、重建 `refs` / `dim1` / `dim2.series` 并只提交 data patch，不要删除后重建。

**尺寸建议（创建前必做）**：确认 `--chart-type`、`--data-range`、数据方向、dim1/dim2、标题、图例和标签策略后，先运行尺寸建议器。有分离表头时同时传 `--header-range`。

硬下限如下；建议器不可用时也不得低于此值：

| 图表类型 | 最小宽度 × 高度（px） |
|---|---:|
| 柱形图、折线图、面积图及其它默认类型 | `640 × 400` |
| 条形图、组合图 | `720 × 420` |
| 饼图 | `720 × 440` |

```text
python3 scripts/lark_chart_size_advisor.py "<表格 URL 或 spreadsheet token>" \
  --worksheet-id "<reference_id>" \
  --chart-type column --data-range "'Sheet1'!A1:C10" \
  --dim1-index 1 --dim2-indexes 2,3 \
  --data-labels value --legend-position bottom --title "销售额对比"
```

运行建议器时，参数必须与后续创建保持一致：创建命令显式设置 `--aggregate-categories` 时传入同一值，组合图同步传入 `--series-types`；创建命令不传 `--data-labels` 时，建议器也按 `none` 估算，需要标签时两边都显式传入同一值。将返回的 `data.create_flags.width` / `height` 原样用于创建命令（包括 `--dry-run`），不要凭经验改小；`data.minimum_size` 仅表示兜底下限。若 `data.size_alone_is_insufficient=true`，先按 `data.layout_advice` 调整图表结构或标签策略，再用新配置重新计算尺寸。建议器只负责创建前预估，图表创建后仍须运行质量检查器。

**坐标轴语义与范围**：所有带坐标轴的图表都要在清单中记录每条轴对应的字段语义、类别轴 / 连续轴类型、单位以及主副轴归属，不能只核对轴标题。Y 轴显示范围默认交给图表引擎；用户未明确要求固定范围时，不传 `--y-axis-min` / `--y-axis-max`，需要固定范围时必须同时传上下界，重点只处理确有必要收紧的连续数值 X 轴。堆积图的峰值来自同一类别内系列累加，组合图还要按左右轴分别计算；不得直接把数据源单列的最小值 / 最大值当成 Y 轴边界。瀑布图的显示范围取决于逐项累计后的全部中间值、小计和总计，不得主动传 `--y-axis-min` / `--y-axis-max`；只有用户明确指定固定范围时才能例外，且必须覆盖所有累计节点。其它图表只有在用户明确要求或视觉验收证明自动范围不可读时，才按图表类型的实际绘制值计算并设置 Y 轴范围。多图对比时，先判断“范围 / 尺度一致”指绝对边界相同，还是跨度和刻度可比；对比同一指标时保持值轴口径一致，不同单位或量级的指标不强行共用边界。

**横向类别行配方**：当日期/月份等类别横向排列在一行、目标数值在另一行时，把“类别行 + 数值行”一起放进 `--data-range` 并传 `--data-direction row`，例如 `--data-range "'Sheet1'!A1:M1,'Sheet1'!A3:M3" --data-direction row`。此时类别行属于数据映射，**不要**传给 `--header-range`。`--header-range` 仅表示与纯数据分离的“维度/系列名称”：column 方向必须是一行，row 方向必须是一列。row 方向却传入多列表头，通常说明把类别行误当成了分离表头。

**整图配色优先走语义参数**：统一主题或系列配色用 `--color-palette` / `--colors`，已有图用 `+chart-config-update`；优先继承原表主题，同一指标跨图保持同色，组合图用同色系柱形、高对比折线和中性辅助线。`--colors` 会循环复用，明确逐系列配色时颜色数须与系列数一致。颜色过多难以区分时优先 Top-N 或拆图；单系列/数据点配色才使用原始 snapshot。

## 需求→图表类型映射（创建前必查）

| 用户说 | 图表类型 | 备注 |
|--------|---------|------|
| "占比"、"比例"、"各XX占多少" | 饼图（pie） | 单维度占比首选 |
| "对比"、"各XX的YY" | 柱形图（column，纵向） | 多类别数值对比；横向条形用 `bar` |
| "趋势"、"变化"、"走势" | 折线图（line） | 时间序列首选 |
| "趋势与量级"、"累计变化"、"区间规模" | 面积图（area） | 用面积强调趋势与数值量级 |
| "堆积"、"组成构成" | 堆积柱形图（column + stack） | 多系列累加 |
| "簇状堆积柱形图" | 堆积柱形图（column + stack） | 当前不支持原生簇状堆积；将簇状维度拆分到横轴类别，用堆积柱状图实现类似效果 |
| "分布"、"相关性" | 散点图（scatter） | 两变量关系 |
| "气泡大小"、"三变量关系"、"分组散点" | 气泡图（bubble） | x/y 决定位置，size 决定气泡大小，group 决定分组 |
| "逐项增减"、"变动贡献"、"从期初到期末" | 瀑布图（waterfall） | 展示正负变化及总计/小计；通常选一个分类列和一个增减值列 |
| "主要原因"、"累计占比"、"80/20" | 排列图（pareto） | 降序柱形 + 累计百分比曲线；只允许一个数值系列 |

**多图表需求**：当用户同时提到多种分析（如"统计占比 + 对比数量"），必须创建多个图表，每个对应一种类型，不要只做一个。

**常见配置错误（必须注意）**：
- **图表类型选择错误**：用户说"堆积柱形图 / 百分比堆积"时，用 `+chart-create-basic --stack normal|percent` 或 `+chart-config-update --stack normal|percent`；用户说"占比 / 比例"时，优先考虑饼图或百分比堆积图。注意 `column` 是纵向柱形图、`bar` 是横向条形图，"对比 / 各 XX" 类纵向柱默认用 `column`；面积图原生支持 `snapshot.plotArea.plot.type="area"`，别因速查表没列就判"不支持"。
- **数据标签开关**：普通基础图先按拟开启 `--data-labels value` 运行尺寸建议器，再用建议宽高创建；不要仅凭数据点或系列数预先传 `none`。若使用建议尺寸后仍过密，依次改为关键点 / 末值 / 异常值的稀疏标签、Top-N 或拆图；用户明确要求隐藏全部标签时才传 `none`。已有图用 `+chart-config-update --data-labels`，不要为常用标签配置构造原始 `labels` 对象。高级配置中 `plotArea.plot.labels` 对象的存在性即开关：创建时关闭标签应省略该字段，更新时删除已有全局标签传 `labels: null`，不能用全部字段置为 `false` 代替。多个系列的数据标签展示要求不同时，禁止传全局 `--data-labels`，应在创建后读取完整 `plotArea.plot.series`，仅给需要标签的系列设置 `labels`，再用 `+chart-update --properties` 整段回写该数组。
- **辅助线与单点标签**：用户要求基准线、目标线、阈值线、平均线或上下限时，先在源数据旁新增一列重复目标值作为辅助线；如果只需要在线尾或某个关键位置显示一个标签，再新增一列稀疏标点数据，仅在目标行写入同一数值，其余单元格保持真正空白。数据准备完成后创建组合图：辅助值列用 `line`，稀疏标点列用 `scatter`，省略全局 `--data-labels`，并传 `--aggregate-categories=false` 关闭“汇总相同类别”；已有图用 `+chart-config-update --aggregate-categories=false`。随后读取完整系列数组，只给稀疏标点系列设置数值标签，辅助线系列必须省略 `labels`；原数据系列是否设置标签按用户要求决定。不得用重复值辅助线的全系列标签模拟单点标签，也不得用 0 代替空白标点，否则聚合会把空标点物化为每个类别的数据点，导致标签重复出现。
- **常量系列标签**：目标线、阈值线和上下限等重复常量系列默认不显示逐点标签；名称和值放在系列名、图例、标题或单个稀疏标记中。创建后若质量检查器提示“常量系列重复标签”，移除该系列标签或改成只有一个非空点的稀疏标记。
- **数据标签位置**：只有用户明确要求且已有标签时才传 `--data-label-position`；它只调整已有标签的位置，不会单独开启标签。需要同时显示标签时一并传 `--data-labels`；未明确位置时省略，让图表按类型自动选择。标签位置只控制摆放方式，不能实现仅显示末点或关键点。普通非堆叠柱形图显示数据标签位置一般传 `outside`。
- **数据源范围与系列名来源要对齐**：
  - 默认让 `--data-range` 包含真正的表头行 / 列；表头上方的合并大标题必须跳过。
  - 数据和语义表头分离时，`--data-range` 只传纯数据，`--header-range` 传对应的一行（column）或一列（row）表头。范围可以是不连续多范围，也支持来自多个子表；不要因为跨子表就退回原始 snapshot。
  - 横向类别行属于 `--data-range`，不是 `--header-range`；按行组织时传 `--data-direction row`。
- **数据源必须是数值 / 日期型**：图表只渲染数值型单元格。用 `+cells-set` 构造数据源时，给数字 / 日期单元格设 `cell_styles.number_format`，不要留成纯文本，否则该系列渲染为空。
- **数值 / 日期显示异常**：坐标轴沿用源单元格格式。日期显示成序列号、大数值显示成科学计数法时，修正源数据的 `cell_styles.number_format`，不要给图表轴构造未定义的 format 字段。
- **轴口径错误**：用户要"占比 / 比例"时，用饼图或 `--stack percent`，并核对数据源与标签确实表达百分比，不要交付仍以原始计数为纵轴的图。
- **组合图系列被压扁**：创建前比较各系列的单位和典型值 / 峰值量级；单位不同、相差约一个数量级以上，或折线贴近 X 轴时，不得把所有系列都放左轴。用 `--series-y-axes` 将会被压扁的系列（常见为百分比、比率或小量级折线）放到右轴，并用左右轴标题明确各自单位；`--series-types` / `--series-y-axes` 必须与 `--dim2-indexes` 逐项对齐。
- **饼图标签截断**：饼图默认传 `--legend-position bottom`，并使用比普通单图更宽的画布；创建时同时传 `--width` / `--height`。宽度主要为左右两侧最长标签留白，不因类别数量线性增加；类别过多时改用 Top-N 或条形图，不能靠无限加宽或截断标签交付。
- **对象语义验证**：基础单图先核对返回的完整 `snapshot`；批量创建、响应不完整、后续又更新或结果存疑时，再按受影响的 sheet 调一次 `+chart-list`。这里只核对数量、数据源、方向、系列和配置，不能代替交付前的布局检查。

> **⚠️ 硬性规则：当用户通过列标题名称（而非列索引）指定横轴/纵轴系列时，必须先读取表格首行（表头）来确定列名与列索引的对应关系，再设置普通图表的 `--dim1-index` / `--dim2-indexes` 或气泡图的角色索引。**
> 例如用户说"横轴为车型系列，纵轴为 Q1-Q4 的销量"，不能猜测列索引；先用 `+cells-get` 读取数据源范围的表头，再将确认后的 1-based 索引传给 `+chart-create-basic`。

## ⚠️ chart 数据源引用 pivot 时必须排除总计行

当 chart 要基于刚创建的 pivot 产物画图时，**禁止凭猜写 `refs`**。pivot 默认启用 `show_row_grand_total` / `show_col_grand_total`，产物最后一行/一列通常是"总计"。如果 `refs` 把总计行一并框进去：
- **柱形图**末尾会多一根天文数字柱子（=所有数据求和），把其他柱子压扁到看不见
- **饼图**会多一个"总计"扇区占 33%+，真实类别的比例完全失真

**正确流程**：
1. `+pivot-create create` 返回 `sheet_id` + `pivot_table_id`
2. 调 `+csv-get(sheet_id, 'A1:E30')` 或 `+pivot-list` 读 pivot 产物的**实际数据范围**
3. 识别并排除"总计"/"小计"行（通常最后一行；嵌套 pivot 还要排除中间层小计）
4. 用 `+chart-create-basic` 创建图表，`--data-range` 精确到数据行（如 pivot 占 A1:D9、总计在 row9 → chart 用 `A1:D8`）

## 图表位置选择（创建前必做）

凭感觉挑列号/行号会被 API 拒（`position is out of sheet range`）。按以下四步走：

1. **查尺寸**：`+workbook-info` 拿该 sheet 的 `row_count` / `column_count`（下文记为 rowCount / columnCount；`+sheet-info` 只返回布局，不含行列总数）。
2. **估跨度**：默认单元格 **105 px 宽 × 27 px 高**，`needCols = ceil(width/105)`，`needRows = ceil(height/27)`。
3. **校验**：`position.row + needRows ≤ rowCount` 且 `col_idx + needCols ≤ columnCount`（`position.row` 为 **0-based**：首行 = `row:0`，与 A1 区间 / `+dim-insert --position` 的 1-based 行号不同；col 按 A=0、B=1、…、Z=25、AA=26… 换算）。
4. **不够就先扩表**，二选一，禁止硬塞越界位置：
   - **优先**放数据下方空区：`position = {row: data_end_row + 2, col: "A"}`；
   - 否则先调 `+dim-insert`（`references/lark-sheets-sheet-structure.md`）扩行/列，再 create。

⚠️ **图表落点禁止压在已有数据矩形内**——必须落在数据区**右侧或下方的空白**，否则图表浮层会遮挡原始数据被判失败（反例：折线图落在数据区中间，遮挡了下方原始数据）。

**示例**：21 列 sheet 放 600×400 图 → `needCols=6, needRows=15`
- ❌ `{row: 0, col: "W"}` — col=22 越界
- ✅ `{row: 42, col: "A"}` — 放数据下方
- ✅ 先 `+dim-insert --position V --count 6`（在 V 列前插 6 列，即 U 列之后），再放图到 `{row: 0, col: "V"}`

**标题与轴文案**：优先沿用用户明确指定的文案；未指定时，只根据已读取的表头生成简洁自然语言。图表标题概括对象、指标及必要的趋势/对比关系；副标题仅补充已确认的时间范围或统计口径，无必要则省略；X 轴写类别或时间维度，Y 轴写指标名，单位明确时可附单位。禁止把单元格引用、公式、内部 ID、占位符、未解析文字、乱码或空括号写入标题，也不得臆造时间、单位和业务口径。

## 交付前验收（任何图表改动后必做）

完成本次所有图表创建或更新后，再逐图核对以下项；全部通过才算完成：

1. **数量**：图表数 = 用户明确要求的数量（"每个 / 分别 / 逐一"等数量词已逐项展开为独立图，不用一张多系列图代替）。
2. **文案与展示项**：回读图表标题、副标题和坐标轴标题，确认语义准确且无乱码、占位符或空括号；图例按用户要求展示或隐藏，普通基础图的数据标签默认展示；密集时按“建议尺寸 → 稀疏标签 → Top-N / 拆图”处理。辅助系列不得用全点重复标签模拟单点或末点。带坐标轴的图表还要回读每条轴的字段语义、类型、单位、最小值 / 最大值、刻度以及主副轴归属；多图对比时再核对边界、跨度和口径是否符合用户的可比性要求。
3. **图表质量**：图表创建、配置更新、数据更新或位置调整后，每个受影响子表运行一次 `python3 scripts/lark_chart_quality_check.py "<表格 URL 或 spreadsheet token>" --worksheet-id "<reference_id>"`，无需先用 `ls` 探测脚本。检查器覆盖几何重叠、遮挡内容、越界、最小尺寸、数值源格式、全零/空系列和常量系列重复标签。动态数值源只采样每系列前 50 点，每张图累计最多读取 2000 个源单元格（含表头和系列间空隙）；`numeric_source_samples` 给出实际范围与采样点数，不续读剩余数据。仅采样为全零/常量但未覆盖完整系列时列为不可验证，不能据此修改整个系列。`data.passed=true` 且退出码为 `0` 表示已完成检查范围内无问题，不能视为未采样数据也正常。退出码 `2` 表示检查成功发现问题，按返回的修复建议调整后重跑；退出码 `1`、网络超时或无有效 JSON 时只重试一次，仍失败则明确报告质量检查未完成，禁止用人工估算代替。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+chart-list` | read | 对象 |
| `+chart-create-basic` | write | 对象 |
| `+chart-config-update` | write | 对象 |
| `+chart-data-update` | write | 对象 |
| `+chart-create` | write | 对象 |
| `+chart-update` | write | 对象 |
| `+chart-delete` | high-risk-write | 对象 |

## Flags

### `+chart-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-id` | string | optional | 指定单个图表 reference_id 过滤 |

### `+chart-create-basic`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-type` | string | required | 图表类型（可选值：`column` / `bar` / `line` / `area` / `pie` / `scatter` / `combo` / `radar` / `bubble` / `waterfall` / `pareto`） |
| `--data-range` | string | required | 数据范围；未传 --header-range 时须包含表头，传入时只传纯数据；支持逗号分隔及跨子表多范围 |
| `--header-range` | string | optional | 可选的分离表头范围；column 方向须为一行、row 方向须为一列，表头数须等于数据维度数 |
| `--data-direction` | string | optional | 数据系列方向；column 表示首列为类别，row 表示首行为类别（可选值：`column` / `row`）（默认 `column`） |
| `--aggregate-categories` | bool | optional | 是否汇总相同类别；稀疏标点或需要保留逐行数据点时使用 --aggregate-categories=false，省略时沿用图表默认行为 |
| `--x-axis-numbers-as` | string | optional | 横轴数字的解释方式；text 将数字视为等间距文本类别，values 按连续数值及真实间距绘制（可选值：`text` / `values`）（默认 `text`） |
| `--x-axis-min` | float64 | optional | 连续数值 X 轴的显示范围下界；需同时使用 --x-axis-numbers-as values |
| `--x-axis-max` | float64 | optional | 连续数值 X 轴的显示范围上界；需同时使用 --x-axis-numbers-as values |
| `--y-axis-min` | float64 | optional | 左 Y 轴的显示范围下界；默认省略，仅在用户明确要求固定范围时与 --y-axis-max 同时传；不得直接使用数据源单列最小值，且必须小于上界 |
| `--y-axis-max` | float64 | optional | 左 Y 轴的显示范围上界；默认省略，仅在用户明确要求固定范围时与 --y-axis-min 同时传；须按图表实际绘制值计算，且必须大于下界 |
| `--dim1-index` | int | optional | 唯一类别/X 轴维度在数据范围中的 1-based 索引；默认 1；不支持多个字段组成多级横轴 |
| `--dim2-indexes` | string | optional | 值/Y 轴系列的 1-based 索引列表，逗号分隔；不能包含 dim1，最多 50 个。气泡图旧调用按 `x,y[,group][,size]` 顺序传 2–4 个，新调用优先使用角色索引；饼图和排列图只传 1 个 |
| `--series-types` | string | optional | 仅组合图；按 --dim2-indexes 顺序指定系列类型，逗号分隔，可选 column、line、area、scatter，数量必须与数值系列一致 |
| `--series-y-axes` | string | optional | 仅组合图；先比较系列单位和量级，将会被压扁的系列放到 right 轴；按 --dim2-indexes 顺序传 left 或 right，数量必须与数值系列一致 |
| `--key-index` | int | optional | 仅气泡图：标识/名称维度的 1-based 索引；与 dim1/dim2 索引互斥，默认 1 |
| `--x-index` | int | optional | 仅气泡图：X 值维度的 1-based 索引；须与 --y-index 一起提供 |
| `--y-index` | int | optional | 仅气泡图：Y 值维度的 1-based 索引；须与 --x-index 一起提供 |
| `--group-index` | int | optional | 仅气泡图：可选分组维度的 1-based 索引 |
| `--size-index` | int | optional | 仅气泡图：可选气泡大小维度的 1-based 索引 |
| `--title` | string | optional | 图表标题 |
| `--subtitle` | string | optional | 图表副标题 |
| `--legend-position` | string | optional | 图例位置；饼图默认 bottom，hidden 隐藏图例（可选值：`top` / `bottom` / `left` / `right` / `hidden`） |
| `--x-axis-title` | string | optional | X 轴标题 |
| `--y-axis-title` | string | optional | 左 Y 轴标题 |
| `--secondary-y-axis-title` | string | optional | 右 Y 轴标题 |
| `--x-axis-label-angle` | int | optional | X 轴标签旋转角度（可选值：`-90` / `-45` / `0` / `45` / `90`） |
| `--y-axis-label-angle` | int | optional | 左 Y 轴标签旋转角度（可选值：`-90` / `-45` / `0` / `45` / `90`） |
| `--data-labels` | string | optional | 数据标签内容；普通基础图默认传 value，不要仅因数据点或系列较多而省略，仅用户明确要求隐藏全部标签时传 none；value、category、percentage 可按 value_category_percentage 顺序组成任意非空组合；series 显示系列名称（可选值：`none` / `value` / `category` / `percentage` / `value_category` / `value_percentage` / `category_percentage` / `value_category_percentage` / `series`） |
| `--data-label-position` | string | optional | 普通非堆叠柱形图显示标签时一般传 outside；其它场景仅当用户明确指定时传入；只调整已有数据标签的位置，不会单独开启标签（可选值：`auto` / `top` / `bottom` / `left` / `right` / `center` / `inside` / `outside`） |
| `--stack` | string | optional | 堆叠模式（可选值：`none` / `normal` / `percent`） |
| `--stacked` | bool | optional | 兼容别名；等价于 --stack normal（隐藏 flag：不在 `--help` 列出，但可正常传入） |
| `--smooth` | bool | optional | 是否使用平滑曲线；显式关闭使用 --smooth=false |
| `--color-palette` | string | optional | 预设整图配色主题；与 --colors 互斥（可选值：`brandColorSeries@v2` / `rainbowColorSeries@v2` / `complementaryColorSeries@v2` / `converseColorSeries@v2` / `primaryColorSeries@v2` / `singleColorSeries-B-@v2` / `singleColorSeries-W-@v2` / `singleColorSeries-G-@v2` / `singleColorSeries-Y-@v2` / `singleColorSeries-O-@v2` / `singleColorSeries-R-@v2` / `singleColorSeries-D-@v2`） |
| `--colors` | string_slice | optional | 自定义整图系列颜色，逗号分隔且至少 2 个十六进制色值；与 --color-palette 互斥 |
| `--anchor-cell` | string | optional | 可选图表锚点单元格，如 F2；省略时放到数据范围右侧 |
| `--width` | int | optional | 可选图表宽度；必须与 --height 同时传；饼图及长类别标签场景应适量加宽以避免截断 |
| `--height` | int | optional | 可选图表高度；必须与 --width 同时传 |

### `+chart-config-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-id` | string | required | 目标图表 reference_id |
| `--title` | string | optional | 图表标题 |
| `--subtitle` | string | optional | 图表副标题 |
| `--legend-position` | string | optional | 图例位置；hidden 隐藏图例（可选值：`top` / `bottom` / `left` / `right` / `hidden`） |
| `--x-axis-title` | string | optional | X 轴标题 |
| `--y-axis-title` | string | optional | 左 Y 轴标题 |
| `--secondary-y-axis-title` | string | optional | 右 Y 轴标题 |
| `--x-axis-label-angle` | int | optional | X 轴标签旋转角度（可选值：`-90` / `-45` / `0` / `45` / `90`） |
| `--y-axis-label-angle` | int | optional | 左 Y 轴标签旋转角度（可选值：`-90` / `-45` / `0` / `45` / `90`） |
| `--x-axis-min` | float64 | optional | 连续数值 X 轴的显示范围下界；必须小于 --x-axis-max |
| `--x-axis-max` | float64 | optional | 连续数值 X 轴的显示范围上界；必须大于 --x-axis-min |
| `--y-axis-min` | float64 | optional | 左 Y 轴的显示范围下界；默认省略，仅在用户明确要求固定范围时与 --y-axis-max 同时传；不得直接使用数据源单列最小值，且必须小于上界 |
| `--y-axis-max` | float64 | optional | 左 Y 轴的显示范围上界；默认省略，仅在用户明确要求固定范围时与 --y-axis-min 同时传；须按图表实际绘制值计算，且必须大于下界 |
| `--data-labels` | string | optional | 数据标签内容；value、category、percentage 可按 value_category_percentage 顺序组成任意非空组合；series 显示系列名称，none 隐藏标签（可选值：`none` / `value` / `category` / `percentage` / `value_category` / `value_percentage` / `category_percentage` / `value_category_percentage` / `series`） |
| `--data-label-position` | string | optional | 仅当用户明确指定时传入；只调整已有数据标签的位置，不会单独开启标签；省略时按图表类型自动优化数据标签位置（可选值：`auto` / `top` / `bottom` / `left` / `right` / `center` / `inside` / `outside`） |
| `--aggregate-categories` | bool | optional | 是否汇总相同类别；稀疏标点或需要保留逐行数据点时使用 --aggregate-categories=false，省略时保留当前设置 |
| `--stack` | string | optional | 堆叠模式（可选值：`none` / `normal` / `percent`） |
| `--stacked` | bool | optional | 兼容别名；等价于 --stack normal（隐藏 flag：不在 `--help` 列出，但可正常传入） |
| `--smooth` | bool | optional | 是否使用平滑曲线；显式关闭使用 --smooth=false |
| `--color-palette` | string | optional | 预设整图配色主题；与 --colors 互斥（可选值：`brandColorSeries@v2` / `rainbowColorSeries@v2` / `complementaryColorSeries@v2` / `converseColorSeries@v2` / `primaryColorSeries@v2` / `singleColorSeries-B-@v2` / `singleColorSeries-W-@v2` / `singleColorSeries-G-@v2` / `singleColorSeries-Y-@v2` / `singleColorSeries-O-@v2` / `singleColorSeries-R-@v2` / `singleColorSeries-D-@v2`） |
| `--colors` | string_slice | optional | 自定义整图系列颜色，逗号分隔且至少 2 个十六进制色值；与 --color-palette 互斥 |

### `+chart-data-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-id` | string | required | 目标图表 reference_id |
| `--data-range` | string | required | 新数据范围；未传 --header-range 时须包含表头，传入或原图已使用分离表头时只传纯数据；支持逗号分隔及跨子表多范围 |
| `--header-range` | string | optional | 可选的分离表头范围；提供后自动使用 detached 表头映射，省略时保留原图已有的 detached 映射 |
| `--data-direction` | string | optional | 数据系列方向；省略时沿用现有图表方向（可选值：`column` / `row`） |
| `--dim1-index` | int | optional | 唯一类别/X 轴维度在数据范围中的 1-based 索引；省略时使用第 1 个维度；不支持多个字段组成多级横轴 |
| `--dim2-indexes` | string | optional | 值/Y 轴系列在数据范围中的 1-based 索引，逗号分隔；省略时使用除 dim1 外的全部维度 |
| `--key-index` | int | optional | 仅气泡图：标识/名称维度的 1-based 索引；与 dim1/dim2 索引互斥，默认 1 |
| `--x-index` | int | optional | 仅气泡图：X 值维度的 1-based 索引；须与 --y-index 一起提供 |
| `--y-index` | int | optional | 仅气泡图：Y 值维度的 1-based 索引；须与 --x-index 一起提供 |
| `--group-index` | int | optional | 仅气泡图：可选分组维度的 1-based 索引 |
| `--size-index` | int | optional | 仅气泡图：可选气泡大小维度的 1-based 索引 |

### `+chart-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | 图表完整配置 JSON。顶层字段为 `position` / `offset` / `size` / `snapshot`（无顶层 `data`，也无再嵌一层 `properties`）；图表数据配置在 `snapshot.data` 下（含 `refs` / `headerMode` / `dim1` / `dim2`）；必须至少含 `snapshot.data.dim1.serie.index` 或 `dim2.series[].index` 之一，否则 server 拒。结构嵌套深，完整结构跑 `--print-schema --flag-name properties` |
| `--print-example` | string | optional | 打印指定图表类型的最小可用 `--properties` 模板后直接退出（`area` / `bar` / `bubble` / `column` / `combo` / `line` / `pareto` / `pie` / `radar` / `scatter` / `waterfall`）。纯本地执行，不需要 locator flag、不发网络请求；传入未知类型时列出全部可用类型 |

### `+chart-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-id` | string | required | 目标图表 reference_id |
| `--properties` | string + File + Stdin（复合 JSON） | required | 图表配置补丁 JSON；默认只传变化字段，未传字段保持不变；普通对象递归合并，数组整体替换 |

### `+chart-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--chart-id` | string | required | 目标图表 reference_id |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+chart-create` `--properties` / `+chart-update` `--properties`

_创建/更新的图表属性_

**顶层字段**：
- `position` (object?) — 必填 { row: number, col: string }
- `offset` (object?) — 可选 { row_offset?: number, col_offset?: number }
- `size` (object?) — 必填 { width: number, height: number }
- `snapshot` (oneOf?) — 图表快照配置

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR 规则同 `+csv-get`）。

### `+chart-list`

输出契约：返回按工作表分组的图表列表，每个图表含 `chart_id` / `position` / `details.snapshot` 等。

### `+chart-create-basic`

默认使用第 1 个维度作为类别/X 轴，其余维度作为数值系列；普通图表可用 1-based 的 `--dim1-index` 和逗号分隔的 `--dim2-indexes` 精确选择。组合图默认首个数值系列为左轴柱、其余为右轴折线；创建前仍要比较各系列单位和量级，避免折线或小量级系列因共用左轴而贴近 X 轴。需要其它组合时，用 `--series-types` 和 `--series-y-axes` 按 `--dim2-indexes` 的顺序逐项指定系列类型与左右轴；系列类型可选 `column`、`line`、`area`、`scatter`，两组参数的数量都必须与最终数值系列数一致。横轴数字默认按等间距文本类别处理；只有数字之间的真实间距需要影响图形位置时，才传 `--x-axis-numbers-as values` 使用连续数轴。气泡图改用 `--key-index`、`--x-index`、`--y-index` 和可选的 `--group-index` / `--size-index`，其中 x/y 必须同时提供，key 默认 1；角色索引不能与 dim1/dim2 索引混用。旧气泡图的 dim1/dim2 位置调用仍兼容。饼图和排列图只允许一个数值系列；组合图至少需要两个数值系列；所有图表最多选择 50 个数值系列。饼图默认将图例放在底部，并根据类别标签长度适量增加 `--width`（同时传 `--height`）。默认让 `--data-range` 包含真实表头；只有“维度/系列名称”与纯数据分离时，才让 `--data-range` 只传纯数据，并用 `--header-range` 传对应的一行（column）或一列（row）表头。类别维度与数值维度不连续时，范围参数可传逗号分隔的多范围，也支持来自多个子表；沿数据点轴对齐的跨子表范围会保留独立引用，同一子表内错行、错列或重叠时合并为最小包围矩形，跨子表范围无法对齐时会报错。单独调用成功后返回完整 `snapshot`，可直接检查创建结果并继续修改。参数名使用 `--anchor-cell` 和 `--data-labels`。兼容调用中，`--type` / `--range` 会分别按 `--chart-type` / `--data-range` 处理，`--x-axis` / `--y-axis` 会按轴标题处理；新调用仍优先使用规范参数名。

**连续数值 X 轴的可读性**：`--x-axis-numbers-as values` 会保留数字的真实间距，但未指定范围时可能自动包含 0。如果数据集中在远离 0 的窄区间，数据点会挤在图表一侧；此时应保留 `values`，创建时用 `--x-axis-min` / `--x-axis-max` 收紧范围，已有图表用 `+chart-config-update` 修正，不要改成 `text` 掩盖问题。两个边界可单独设置；同时设置时 min 必须小于 max。

```text
# 柱形图：默认放在数据范围右侧
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type column --data-range "'Sheet1'!A1:C10" \
  --title "销售额对比" --x-axis-title "品类" --y-axis-title "销售额" \
  --legend-position bottom --data-labels value

# 双轴组合图：月度目标、实际完成为左轴柱，完成率为右轴折线
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type combo --data-range "'Sheet1'!A1:D13" \
  --dim1-index 1 --dim2-indexes 2,3,4 \
  --series-types column,column,line --series-y-axes left,left,right \
  --title "价格与效率" --y-axis-title "价格" --secondary-y-axis-title "效率" \
  --anchor-cell F2 --width 720 --height 420

# 辅助线只显示一个标签：C 列为重复目标值，D 列仅目标位置有值、其余单元格为空
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type combo --data-range "'Sheet1'!A1:D7" \
  --dim1-index 1 --dim2-indexes 2,3,4 \
  --series-types line,line,scatter --series-y-axes left,left,left \
  --aggregate-categories=false \
  --title "趋势与目标线" --anchor-cell F2 --width 720 --height 420

# 先从创建结果或 +chart-list 取得完整 series 数组，再整段回写；辅助线系列不设置 labels
lark-cli sheets +chart-update --url "..." --sheet-id "$SID" --chart-id "chrXXX" \
  --properties '{"snapshot":{"plotArea":{"plot":{"series":[{"index":2,"comboType":"line","labels":{"value":true}},{"index":3,"comboType":"line"},{"index":4,"comboType":"scatter","labels":{"value":true}}]}}}}'

# 气泡图：x、y 必填，group、size 可选
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type bubble --data-range "'Sheet1'!A1:E20" \
  --key-index 1 --x-index 2 --y-index 3 --group-index 4 --size-index 5 \
  --title "客户分布"

# 数值散点图：保留真实 X 间距，同时收紧远离 0 的显示范围
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type scatter --data-range "'Sheet1'!A1:B20" \
  --x-axis-numbers-as values --x-axis-min 237 --x-axis-max 239

# 表头与数据分离：data-range 只传纯数据，header-range 按相同维度顺序传表头
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type line \
  --data-range "'Sheet1'!A2:A10,'Sheet1'!K2:L10" \
  --header-range "'Sheet1'!A1,'Sheet1'!K1:L1"

# 横向类别行 + 一行数值：类别行也属于 data-range，不要放进 header-range
lark-cli sheets +chart-create-basic --url "..." --sheet-name "Sheet1" \
  --chart-type line \
  --data-range "'Sheet1'!A1:M1,'Sheet1'!A3:M3" \
  --data-direction row --dim1-index 1 --dim2-indexes 2
```

多张基础图一次创建。先把所有数据准备完成，再生成 `ops.json`：

```json
[
  {
    "sheet_name": "Sheet1",
    "chart_type": "column",
    "data_range": "'Sheet1'!A1:C10",
    "title": "分类对比",
    "anchor_cell": "F2"
  },
  {
    "sheet_name": "Sheet1",
    "chart_type": "line",
    "data_range": "'Sheet1'!E1:G10",
    "title": "趋势变化",
    "anchor_cell": "F18"
  }
]
```

```text
lark-cli sheets +batch-chart-create --url "..." --operations @ops.json
lark-cli sheets +chart-list --url "..." --sheet-name "Sheet1"
```

为了兼容旧调用，CLI 仍能读取历史 `{shortcut:"+chart-create-basic",input:{...}}` 结构，但新任务直接填写上面的扁平 `+chart-create-basic` flags。

批量修正已有图表时，operations 只放配置或数据更新；CLI 会先读取每张目标图的当前快照，再把对应 partial properties 合并进一次 `batch_update`：

```json
[
  {"shortcut":"+chart-config-update","input":{"sheet_name":"Sheet1","chart_id":"chrA","title":"新标题"}},
  {"shortcut":"+chart-data-update","input":{"sheet_name":"Sheet1","chart_id":"chrB","data_range":"'Sheet1'!A1:D10"}}
]
```

```text
lark-cli sheets +batch-chart-update --url "..." --operations @updates.json
```

### `+chart-data-update`

当创建后发现漏列、范围过宽、辅助分类列发生变化、系列选择错误或数据方向错误时，只更新数据源，保留标题、配色、图例和落点。更新必须指定 `--chart-id`；范围、方向、普通 dim1/dim2 索引及气泡图角色索引的语义与 `+chart-create-basic` 相同。`--data-direction` 省略时沿用现有图表方向。默认让新范围包含表头；原图已经使用 detached 表头且表头不变时可省略 `--header-range`，工具会保留现有映射。工具返回更新后的 `data` 和实际采用的 `normalized_data_ranges`。

```text
# 把遗漏的最后一列纳入原折线图，保留标题、配色、图例和落点
lark-cli sheets +chart-data-update --url "..." --sheet-id "$SID" --chart-id "chrXXX" \
  --data-range "'Sheet1'!A1:M6"
```

### `+chart-config-update`

只传需要改的字段，成功后返回更新后的 `viewModel`。`--data-labels` 支持 `value`、`category`、`percentage` 的任意非空组合，组合值按 `value_category_percentage` 顺序拼接；另可用 `series` 显示系列名称、用 `none` 删除数据标签。多个系列需要不同标签策略时不要使用这个全局参数，按上文的辅助列与高级系列配置流程处理。`--legend-position hidden` 隐藏图例；显式关闭平滑曲线时使用 `--smooth=false`。为减少参数重试，`--stacked` 自动按 `--stack normal` 处理，`percentage,value` 或 `value,percentage` 自动按 `value_percentage` 处理，`--x-axis` / `--y-axis` 自动按 `--x-axis-title` / `--y-axis-title` 处理；新调用仍优先使用规范参数。

```text
lark-cli sheets +chart-config-update --url "..." --sheet-id "$SID" --chart-id "chrXXX" \
  --title "新标题" --x-axis-label-angle -45 --legend-position right

lark-cli sheets +chart-config-update --url "..." --sheet-id "$SID" --chart-id "chrXXX" \
  --data-labels value_percentage --stack percent --aggregate-categories=false

```

### `+chart-create`

基础图表优先使用 `+chart-create-basic`。仅当语义 shortcut 无法表达单系列、单数据点或高级引擎字段时，才使用 `+chart-create`。高级创建需要结构完整的 snapshot；先用 `+chart-create --print-example <type>` 取得对应图表类型的最小结构，再只修改任务需要的字段。不要先打印或阅读整份大 schema。

### `+chart-update`

标题、轴、图例、标签、堆叠、平滑、配色和相同类别汇总优先使用 `+chart-config-update`，数据范围和方向使用 `+chart-data-update`。只有高级字段才使用 `+chart-update`；不要为常见修改构造 raw properties。

`+chart-update` 支持真正的局部更新：只传实际变化的字段，未传字段保持不变，不要复制并回写完整 snapshot。

- `snapshot` 内普通对象递归合并；
- `refs` / `axes` / `series` 等数组整体替换。只改数组中的一项时，先从 `+chart-list` 读取当前完整数组，修改后只回写该数组；
- `snapshot.data.isStaticData` 不能通过 update 改变；需要切换静态 / 非静态数据时删除后重建；
- 只调整尺寸时直接传 `size`，不需要传 `snapshot`；
- 执行前用 `--dry-run` 检查目标 sheet、chart_id 和最小 patch，执行后用 `+chart-list --chart-id <id>` 核对实际 snapshot。

```text
# 只调整尺寸；无需携带 snapshot
lark-cli sheets +chart-update --url "..." --sheet-id "$SID" --chart-id "chrXXX" \
  --properties '{"size":{"width":640,"height":400}}'
```

#### 高级 `properties` 边界

- 只查询本次要改的子树，不先打印完整大 schema：
  ```text
  lark-cli sheets +chart-update --print-schema \
    --flag-name properties.snapshot.plotArea.axes
  ```
- `--dry-run` 输出中的 `tool_name` / `operation` / `basic_chart` / `properties` 是 CLI 翻译后的内部请求，只用于检查，不能复制回 operations 或再次当作 MCP body 提交。
- `--data-range` 本身支持逗号分隔的多个范围和跨子表范围。仅因数据不连续或跨子表，不构成手写 raw data 映射的理由。
- raw data 使用 inline 表头时，`refs` 包含真正表头且不写 `nameRef`；只有 `refs` 只覆盖纯数据、真正表头位于范围外时才用 detached：显式设置 `headerMode='detached'`，并让 `dim1.serie.nameRef` 与每个 `dim2.series[].nameRef` 指向对应表头单元格。
- raw 堆叠字段位于 `snapshot.plotArea.plot.extra.stack`；普通任务仍使用 `--stack normal|percent`。`plotArea.plot.labels` 对象的存在性就是开关，关闭标签时省略整个对象；普通任务使用 `--data-labels none`。
- `axes[].label` 不接受 `format` / `number_format`。日期、百分比和数值格式应修改源单元格的 `cell_styles.number_format`。

### `+chart-delete`

示例：

```text
# dry-run 先看会删什么（sheet 定位必填）
lark-cli sheets +chart-delete --url "https://example.feishu.cn/sheets/shtXXX" --sheet-id "$SID" \
  --chart-id "chrXXX" --dry-run

# 真正执行
lark-cli sheets +chart-delete --url "https://example.feishu.cn/sheets/shtXXX" --sheet-id "$SID" \
  --chart-id "chrXXX" --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+chart-data-update` 要求 `--chart-id` 和 `--data-range`，并校验 `--dim1-index` / `--dim2-indexes` 是正整数索引；`+chart-create` / `+chart-update` 的 `--properties` 必须能解析为合法 JSON；`+chart-delete`（high-risk-write）校验 `--yes` 或 `--dry-run` 至少一个。
- `DryRun`：`+chart-data-update` / `+chart-create` / `+chart-update` 输出"将要 POST 的 body 模板"；`+chart-delete` 输出"将要删除的 chart_id 及隶属 sheet"，零网络副作用。
- `Execute`：`+chart-create-basic` 成功后返回完整 `snapshot`，可直接验证；批量创建、响应不完整、后续更新或结果存疑时，再按受影响 sheet 调用一次 `+chart-list` 比对结果。

> `+chart-create` / `+chart-update` 是 write 级别，按需可用 `--dry-run` 预览，不要求 `--yes`。只有 `+chart-delete`（high-risk-write）必须 `--yes`。


<a id="s-4125fd916baec37d"></a>

## references/lark-sheets-conditional-format.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Conditional Format

## 真对象硬约束 + 触发词清单

用户出现以下口语指令时，**强制**走 `+cond-format-{create|update|delete}`，**禁止**用 `+cells-set` 写静态背景色 / 字体色代替：

- **颜色动作**："标红 / 标黄 / 标绿 / 上色 / 染色 / 涂色 / 表红色 / 表黄色"
- **视觉强调**："高亮 / 突出 / 标记 / 标注 / 区分"——**限带条件语义的**（按值 / 规则决定哪些格上色）；纯装饰性无条件上色（斑马纹、整行固定底色）不在强制范围，按视觉规范直接设背景色
- **条件触发**："重复的标出来 / 异常的圈出来 / 过期的染红 / 大于 X 的标黄 / 不达标的标红"
- **联动语义**："颜色随数据变 / 联动 / 自动更新 / 改了数据颜色也跟着变"
- **数值可视化**："数据条 / 色阶 / 渐变色 / 进度条样式"

飞书表格的"颜色标记"语义 = 条件格式规则 ≠ 静态背景色。如果用 `+cells-set` 写静态，源数据变化时颜色不会跟着变（典型反例：用户要求"过期单元格标红"时，模型用静态填充——日期变化后单元格颜色不再准确反映过期状态）。

**判断标准**：交付后 `+cond-format-list` 必须能返回该规则，否则条件格式未生效。

**大数据量首选**：当数据量 > 1000 行时，条件格式是首选——它由飞书自身渲染，比"本地脚本逐行计算 + `+cells-set` 写静态背景色"更高效、更稳（颜色还能随源数据自动联动）。

## 使用场景

读写条件格式对象，并读取条件格式**计算后的单元格样式结果**。本 reference 覆盖这些 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有条件格式规则 | `+cond-format-list` | 获取规则类型、范围和样式配置；用于确认规则对象已存在 |
| 创建/更新/删除条件格式规则 | `+cond-format-create` / `+cond-format-update` / `+cond-format-delete` | 对条件格式规则执行写入操作 |
| 验证条件格式计算结果 | `+cond-format-result-get` | 读取命中后的 `cell_styles`，确认条件格式是否真的作用到哨兵单元格 |
| 常规读数时临时带上条件格式 | `+cells-get --include conditional_format` | 与 `+cond-format-result-get` 等价地合并条件格式样式，但仍归属普通单元格读取入口 |

典型工作流：先读取现有条件格式了解配置 → 执行创建/更新/删除 → **必须先用 `+cond-format-list` 验证规则对象，再用 `+cond-format-result-get` 抽查计算结果**。

**常见配置错误（必须注意）**：
- **创建后必须两段验证**：条件格式创建后先调用 `+cond-format-list` 验证规则对象（rule_type / ranges / style / attrs）是否存在且配置正确；再调用 `+cond-format-result-get --range "<哨兵范围>"` 读取命中后的 `cell_styles`，验证条件格式是否真的按计算结果作用到单元格。如果任一阶段不符合预期，应立即修复并重试
- **验证要覆盖哨兵格**：不要只确认规则对象存在；还要按用户规则抽查 2-3 个应命中 / 不应命中的单元格/行（含边界行、空值、重复值、非图例状态），用 `+cond-format-result-get` 读取 `cell_styles.background_color` / `font_color` / `font_weight` 等结果，确认公式、范围、颜色语义能解释这些哨兵。若规则存在但哨兵样式/命中逻辑不对，继续修正
- **范围要精确**：条件格式的应用范围必须精确覆盖用户指定的列/行，不要遗漏
- **`style.back_color` vs `style.fore_color` 的中文语义**：用户中文语境下的"**标红/染色/标记**"指**单元格背景色**，用 `back_color`；"**文字红/字体红/把字变红**"才用 `fore_color`。默认无说明时选 `back_color`。用户说"**标红**"用标准红 `back_color: "#FF0000"`；说"**高亮/突出**"才用浅色底（如 `#FFE6E6`）配合可选的 `fore_color` 加深字体——把"标红"做成浅粉会被认为没按要求标色
- **日期/空值比较必须防空**：用户说"过期的标红"时，除了 `TODAY()`，公式必须排除空单元格，否则空白格也会被误判为"早于今天"而全表标红。正确公式：`=AND(E1<>"", E1<=TODAY())`；错误公式：`=E1<=TODAY()`（空值会被当作 0 判为过期）
- **公式条件注意引用方式**：自定义公式条件中的单元格引用需要根据实际场景选择相对/绝对引用（如 `=E1<=TODAY()` 而非 `=$E$1<=TODAY()`，后者只比较一个格）
- **`duplicateValues` 只按单列判重**：用户说的"多字段完全相同才算重复"无法直接表达——先建辅助键列（把参与判重的列用分隔符拼成一个键），再用引用该键列的 `expression`（如 `COUNTIF` 键列 >1）把规则应用到数据区整行；只想标记键列本身时才用 `duplicateValues`

⚠️ **用户明确要求"辅助列+条件格式"两步走时，禁止用 `expression` 绕过**：当用户说以下任意一种表达时，必须按两步走（先建辅助列 → 再基于辅助列做条件格式），**禁止**直接用一个 `rule_type: "expression"` 公式一步完成：

- "**增加辅助列**，再/然后标记……"
- "**先计算/判断** XX **是否** YY，**再**标记……"
- "**新建一列**放结果，再用结果染色"
- 明确要求用 "辅助列"、"辅助字段"、"判断列"、"标记列"

**正确做法（两步走）**：

Step 1 的 `+cells-set` 及 `--copy-to-range` 等 flag 以 `references/lark-sheets-write-cells.md` 为准。

```
Step 1: `+cells-set` 在新列写判断公式（形成"是/否"或布尔辅助列）
  range="H2", cells=[[{formula: "=IF(A2>B2, \"是\", \"否\")"}]], --copy-to-range="H2:H100"

Step 2: 基于辅助列值做条件格式（用 cellIs 或引用辅助列的 expression）
  `+cond-format-{create|update|delete}` create
    rule_type: "expression"
    ranges: ["A2:H100"]  // 整行高亮
    attrs: [{formula: ["=$H2=\"是\""]}]  // 引用辅助列
    style: {back_color: "#FFECEC"}
```

**错误做法（一步走绕过辅助列）**：

```
`+cond-format-{create|update|delete}` create
  rule_type: "expression"
  ranges: ["2:145"]
  attrs: [{formula: ["=$O2>$H2"]}]   ← 虽然逻辑等价，但产物里缺辅助列 → 不满足用户明确要求的"辅助列"诉求
```

为什么禁止一步走：用户明确要求辅助列是有**业务意图**的——让人肉眼能在表里看到"是/否"列；条件格式只是视觉辅助。一步 expression 虽然效果对了，但用户打开表格看不到辅助列，被视为"操作不完整/未采用公式"。

`expression` 单独使用的场景是：用户**没有**明确要求辅助列、只要"标红符合条件的行"时。

⚠️ **创建条件格式前必须读数据行确认列对应**：仅读首行表头（`+csv-get range="A1:Z1"`）不够——如果表头语义含糊（比如"时间"、"日期"这种多列同义词），formula 里引用的列字母可能张冠李戴。必须再读 3-5 行**数据样本**（如 `range="A2:Z6"`）确认：①列名对应的实际值；②字段含义匹配用户描述；③数据类型是日期/数字/文本。特别是比较类条件格式（`=$A2>$B2` 这种），列字母选错整条规则就废了。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+cond-format-list` | read | 对象 |
| `+cond-format-result-get` | read | 对象 |
| `+cond-format-create` | write | 对象 |
| `+cond-format-update` | write | 对象 |
| `+cond-format-delete` | high-risk-write | 对象 |

## Flags

### `+cond-format-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--rule-id` | string | optional | 按规则 id 过滤 |

### `+cond-format-result-get`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | A1 范围，如 `A1:F10`（不带 sheet 前缀；用 `--sheet-id` / `--sheet-name` 指定 sheet） |
| `--max-chars` | int | optional | 单次返回字符上限，默认 500000（兜底防爆） |

### `+cond-format-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | 规则配置 JSON，含 `style`（命中样式，必填）和 `attrs?`（规则参数列表，因 `rule_type` 不同结构而异）/ `has_ref?`。`rule_type` 和 `ranges` 已拎为独立 flag |
| `--rule-type` | string | required | 条件格式规则类型；优先级高于 `--properties` 中同名字段（可选值：`duplicateValues` / `uniqueValues` / `cellIs` / `containsText` / `timePeriod` / `containsBlanks` / `notContainsBlanks` / `dataBar` / `colorScale` / `rank` / `aboveAverage` / `expression` / `iconSet`） |
| `--ranges` | string + File + Stdin（简单 JSON） | required | 应用条件格式的 A1 范围 JSON 数组（如 `["A1:A100","C2:C50"]`）；优先级高于 `--properties` 中同名字段 |

### `+cond-format-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--rule-id` | string | required | 目标规则 id |
| `--properties` | string + File + Stdin（复合 JSON） | required | 规则配置 JSON，结构同 `+cond-format-create` 的 `--properties`；update 是整组覆盖式 |
| `--rule-type` | string | required | 条件格式规则类型；优先级高于 `--properties` 中同名字段（可选值：`duplicateValues` / `uniqueValues` / `cellIs` / `containsText` / `timePeriod` / `containsBlanks` / `notContainsBlanks` / `dataBar` / `colorScale` / `rank` / `aboveAverage` / `expression` / `iconSet`） |
| `--ranges` | string + File + Stdin（简单 JSON） | required | 应用条件格式的 A1 范围 JSON 数组（如 `["A1:A100","C2:C50"]`）；优先级高于 `--properties` 中同名字段 |

### `+cond-format-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--rule-id` | string | required | 目标规则 id |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+cond-format-create` `--properties` / `+cond-format-update` `--properties`

_创建/更新的条件格式属性_

**顶层字段**：
- `rule_type` (enum) — 条件格式规则类型 [duplicateValues / uniqueValues / cellIs / containsText / timePeriod / containsBlanks / notContainsBlanks / dataBar / colorScale / rank / aboveAverage / expression / iconSet] — ⚠️ 已拎为独立 flag `--rule-type`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `ranges` (array<string>) — 应用条件格式的 A1 范围列表 — ⚠️ 已拎为独立 flag `--ranges`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `style` (object) — 命中规则时应用的单元格样式 { back_color?: string, fore_color?: string, text_decoration?: enum, font?: enum }
- `attrs` (array<oneOf>?) — 规则参数列表
- `has_ref` (boolean?) — 可选

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。

### `+cond-format-list`

```text
# 列出当前 sheet 全部条件格式规则（拿 rule_id 供 update/delete）
lark-cli sheets +cond-format-list --url "..." --sheet-id "$SID"
```

### `+cond-format-create`

`--rule-type` / `--ranges` 是独立 flag（不要再放 `--properties`）；`style` / `attrs` 等结构走 `--properties`：

```text
# 重复值高亮
lark-cli sheets +cond-format-create --url "..." --sheet-id "$SID" \
  --rule-type duplicateValues --ranges '["A1:A100"]' \
  --properties '{"style":{"back_color":"#FFD7D7"}}'

# 数据条
lark-cli sheets +cond-format-create --url "..." --sheet-id "$SID" \
  --rule-type dataBar --ranges '["B2:B100"]' \
  --properties @rule.json

# 创建后先确认规则对象存在
lark-cli sheets +cond-format-list --url "..." --sheet-id "$SID"

# 再抽查条件格式计算结果：读取哨兵单元格的命中样式
lark-cli sheets +cond-format-result-get --url "..." --sheet-id "$SID" \
  --range "B2:B10"
```

### `+cond-format-result-get`

用于读取条件格式**计算后的样式结果**，不是读取规则对象。创建 / 更新条件格式后必须用它抽查哨兵单元格。

CLI 会对白名单字段做输出裁剪：顶层只保留警告、分页和返回单元格计数；每个 range 只保留请求/实际范围、真实行列坐标、截断标记和二维 `cells`；每个 cell 只保留 `cell_styles`，不返回 `value` / `formula` / `note` / `data_validation` / `border_styles` 等其它单元格数据。`cell_styles` 是底层开启条件格式计算后得到的最终合并样式，不包含 `rule_id` 或独立的命中标记。

```text
# 读取 B2:B10 的条件格式命中样式，返回 cell_styles.background_color / font_color 等
lark-cli sheets +cond-format-result-get --url "..." --sheet-id "$SID" \
  --range "B2:B10"

# 如果只想在普通读取里临时合并条件格式，也可用 +cells-get --include conditional_format
lark-cli sheets +cells-get --url "..." --sheet-id "$SID" \
  --range "B2:B10" --include conditional_format
```

### `+cond-format-update`

整组覆盖式：先 `+cond-format-list --rule-id <id>` 拿当前完整配置，改后整组传回。

### `+cond-format-delete`

```text
lark-cli sheets +cond-format-delete --url "..." --sheet-id "$SID" --rule-id "$RULE_ID" --yes
```

> 一次只删一个 `--rule-id`。要删**多个**条件格式时，先 `+cond-format-list` 拿到各 `rule-id`，再用 `+batch-update` 把多个 `+cond-format-delete` 合并为单次批量提交（fail-fast，失败处置见 `references/lark-sheets-batch-update.md`），不要逐个调用。

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`--rule-type` / `--ranges` 必填；`--properties` 必须能解析为合法 JSON；按 `--rule-type` 检查必填子字段（`cellIs` 需 `attrs.operator` + `attrs.value`、`expression` 需 `attrs.formula`、`colorScale` 需 `min/mid/max` 配色等）；`+cond-format-delete` 强制 `--yes` 或 `--dry-run`。
- `DryRun`：写操作输出"将要 POST/PATCH/DELETE 的 conditional_format 请求模板"。
- `Execute`：写后不自动回读；create/update 后必须调用 `+cond-format-list --rule-id <id>` 比对规则 / 范围 / 样式，并用 `+cond-format-result-get --range <2–3 个哨兵格>` 核对实际生效的单元格样式；delete 后 list 确认目标 id 不存在。


<a id="s-8560a4edfe4af66a"></a>

## references/lark-sheets-filter-view.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Filter View

## 概念回顾

筛选视图是 sheet 内的多份独立筛选配置，每个视图持有自己的 `range` 和 `rules`，由独立 `view_id`（10 位随机字符串）标识。一个 sheet 可有多个视图，视图的隐藏行仅在用户进入该视图时本地生效，不影响其他协作者，也不与该 sheet 上可能并存的筛选器（filter）互相影响。

`+filter-view-{create|update|delete}` 负责视图本身的 CRUD（create / update / delete）；视图的"进入 / 退出"（激活态）是本地状态，不在工具语义内。

## 使用场景

读写筛选视图对象。本 reference 覆盖 4 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有筛选视图 | `+filter-view-list` | 获取 sheet 上所有视图（视图名、范围、规则） |
| 创建 / 更新 / 删除筛选视图 | `+filter-view-{create|update|delete}` | create / update / delete 三个独立 shortcut |

典型工作流：先读取现有视图了解配置 → 执行创建 / 更新 / 删除 → **必须再次读取验证结果**。

**常见配置错误（必须注意）**：
- **视图范围必须覆盖表头行**：视图的 range 必须从表头行开始（如 `A1:F100`），不能只包含数据行
- **更新前先读取**：用户说"调整这个视图"时，先用 `+filter-view-list` 拉到目标视图当前 rules，**只改差异列**再回写
- **多次 create 不能复用 view_id**：复用应走 `update`，重复 `create` 会产生新视图
- **筛选不支持正则表达式**：飞书表格筛选器不支持正则表达式，传入正则会当成普通文本处理

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+filter-view-list` | read | 对象 |
| `+filter-view-create` | write | 对象 |
| `+filter-view-update` | write | 对象 |
| `+filter-view-delete` | high-risk-write | 对象 |

## Flags

### `+filter-view-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--view-id` | string | optional | 按筛选视图 reference_id 过滤（命中即只返回单个视图） |

### `+filter-view-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | 筛选视图规则 JSON，含 `rules?`（列级筛选规则数组）和 `filtered_columns?`。`range` 和 `view_name` 是独立 flag |
| `--range` | string | required | 筛选视图作用的单元格范围（A1 表示法，如 `A1:F1000`）；优先级高于 `--properties` 中同名字段；create 必填，必须覆盖表头行 |
| `--view-name` | string | optional | 筛选视图名称；不传时系统自动分配；优先级高于 `--properties` 中同名字段 |

### `+filter-view-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--view-id` | string | required | 目标筛选视图 reference_id |
| `--properties` | string + File + Stdin（复合 JSON） | required | 筛选视图规则 JSON，含 `rules?` 和 `filtered_columns?`；update 是整组覆盖式（先 `+filter-view-list` 回读再 patch；传空 `rules: []` 清空）。`range` 和 `view_name` 是独立 flag |
| `--range` | string | optional | 筛选视图作用的单元格范围（A1 表示法，如 `A1:F1000`）；优先级高于 `--properties` 中同名字段；update 时省略表示保留当前 range |
| `--view-name` | string | optional | 筛选视图名称；create 不传时系统自动分配，update 不传时保留原名；优先级高于 `--properties` 中同名字段 |

### `+filter-view-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--view-id` | string | required | 目标筛选视图 reference_id |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+filter-view-create` `--properties` / `+filter-view-update` `--properties`

_create / update 的视图属性_

**顶层字段**：
- `view_name` (string?) — 可选 — ⚠️ 已拎为独立 flag `--view-name`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `range` (string?) — 视图作用的单元格范围（A1 表示法） — ⚠️ 已拎为独立 flag `--range`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `rules` (array<object>?) — 列级筛选规则列表，每一项对应一个具体列的筛选条件 each: { column_index: string, conditions: array<oneOf>, filtered_rows?: array<number> }
- `filtered_columns` (array<string>?) — 可选

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。`view_id` 是 10 位随机字符串，每个 sheet 可有多个视图。

### `+filter-view-list`

```text
# 列出某个 sheet 的全部筛选视图
lark-cli sheets +filter-view-list --url "..." --sheet-id "$SID"

# 按 view_id 精确定位
lark-cli sheets +filter-view-list --url "..." --sheet-id "$SID" --view-id vAbcde1234
```

### `+filter-view-create`

`--range`（必填）/ `--view-name`（可选）是独立 flag；`rules` 走 `--properties`：

```text
lark-cli sheets +filter-view-create --url "..." --sheet-id "$SID" \
  --view-name "活跃用户" --range "A1:F1000" \
  --properties '{"rules":[{"column_index":"C","conditions":[{"type":"number","compare_type":"greaterThan","values":[100]}]}]}'
```

**`conditions[].type` × `compare_type` 取值**（`type` 决定可用的 `compare_type`；两者均必填）：

| `type` | 可用 `compare_type` | `values` |
|---|---|---|
| `text` | `contains` / `doesNotContain` / `beginsWith` / `doesNotBeginWith` / `endsWith` / `doesNotEndWith` / `equals` / `notEquals` | 字符串数组 |
| `number` | `equal` / `notEqual` / `greaterThan` / `greaterThanOrEqual` / `lessThan` / `lessThanOrEqual` / `between` / `notBetween` | 数值（或数值字符串）数组；`between` / `notBetween` 传两个边界 |
| `multiValue` | `equal` / `notEqual` | 字符串数组（精确匹配其中任一值） |
| `color` | `backgroundColor` / `foregroundColor` | 不传 `values`（按单元格颜色筛选） |

> ⚠️ `text` 用 `equals` / `notEquals`（**带 s**），`number` / `multiValue` 用 `equal` / `notEqual`（**不带 s**）——别混。完整 schema 跑 `+filter-view-create --print-schema --flag-name properties`。

> `--range` **必须覆盖表头行**（如 `A1:F1000`），不能只包含数据行；`--view-name` 重名时服务端自动改名。

### `+filter-view-update`

> ⚠️ update 是整组覆盖（PUT 语义）：`--properties` **必传**，未在请求里出现的 rules / filtered_columns 会被清空。如要保留已有 rules，先 `+filter-view-list` 读回再合并写回。`--range` 变更会丢弃已有筛选规则属预期行为（rules 跟当前 range 绑定）。重复 `+filter-view-create` 不会复用 view_id，会产生新视图。

### `+filter-view-delete`

> ⚠️ 删除**已存在**的视图不可逆；目标 view_id **不存在**时按幂等成功返回（不报错）。先 `--dry-run` 看 view_id 确认。

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+filter-view-create` 校验 `--range` 起始行为表头（第一行）；`+filter-view-update` 必须先 `+filter-view-list` 确认 view 存在，`--properties` 必传（整组覆盖式）；`+filter-view-delete` 强制 `--yes` 或 `--dry-run`。
- `DryRun`：输出"将要 POST/PATCH/DELETE 的 view 请求模板"，零网络副作用；`--sheet-name` 在 dry-run 输出里生成为 `<resolve:Sheet1>` 占位符。
- `Execute`：写后不自动回读；create/update 后必须调用 `+filter-view-list --view-id <id>` 比对 range + rules；delete 后 list 确认目标 view 不存在。


<a id="s-00b713f0148c2449"></a>

## references/lark-sheets-filter.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Filter

## 真对象硬约束 + 数量校验

1. **先判产物形态，再选做法**：**要裁列 / 要另存结果表**（"只保留某几列""筛出来放新表"，含用户显式要求把筛选结果做成独立新表的行级筛选）→ 另建结果 sheet 物化符合条件的行与列，**原表原样保留**；**仅行级、不裁列**（"筛选 / 只看 / 仅保留符合条件的行"）→ **必须**通过 `+filter-{create|update|delete}` 创建真实的筛选器对象，**禁止**用"删除不符合条件的行" / "新建子表只放符合条件的行" / 用 `+cells-set` 覆盖原表来代替——这些做法会让原数据丢失或不可恢复。
2. **筛选数量必校**：执行筛选后**必须**回读，断言 `len(visible_rows) == expected_count`。`expected_count` 来自先用本地脚本在源数据上独立复现该筛选条件得到的结果数。两者不一致时禁止交付，需排查筛选条件 / 数据列类型问题。
3. **混合文本列禁止字面比较**：筛选 key 是公式文本（如 `1000+200=1200`）或带单位的混合文本时，先在辅助列里抽出纯数值再筛选；不能直接用文本比较。

## 使用场景

读写筛选器对象。本 reference 覆盖 4 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有筛选器 | `+filter-list` | 获取筛选器的范围、规则和条件配置 |
| 创建/更新/删除筛选器 | `+filter-{create|update|delete}` | 对筛选器执行写入操作 |

典型工作流：先读取现有筛选器了解配置 → 执行创建/更新/删除 → **必须再次读取验证结果**。

**只读场景例外**：用户只是想知道哪些数据满足条件、并不要求修改表格展示时，可以走 `references/lark-sheets-read-data.md` 读后文本回答，不必创建筛选器。

**常见配置错误（必须注意）**：
- **筛选范围必须覆盖表头行**：筛选器的 range 必须从表头行开始（如 `A1:F100`），不能只包含数据行。缺少表头会导致筛选条件无法正确匹配列
- **更新已有筛选器前先读取**：如果子表上已存在筛选器，直接创建会报错或覆盖原有配置。应先用 `+filter-list` 查看是否存在筛选器，存在时使用 update 而非 create
- **筛选条件的列索引要精确**：筛选条件中的列标识必须与实际数据列精确对应，不要凭猜测填写
- **”调整筛选逻辑”要先读旧配置**：用户说”调整筛选”时，先读取现有筛选器的完整配置，理解当前规则后再修改，不要从零创建
- **创建后必须验证**：调用 `+filter-list` 确认筛选器配置正确且生效
- **筛选不支持正则表达式**：飞书表格筛选器不支持正则表达式，传入正则会当成普通文本处理。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+filter-list` | read | 对象 |
| `+filter-create` | write | 对象 |
| `+filter-update` | write | 对象 |
| `+filter-delete` | high-risk-write | 对象 |

## Flags

### `+filter-list`

_公共四件套 · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+filter-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 筛选范围（A1 表示法，含表头行，如 `A1:F1000`）；不要重复写入 `--properties` 中的 range 字段 |
| `--properties` | string + File + Stdin（复合 JSON） | optional | 筛选规则 JSON：`rules`（列级筛选规则数组）+ `filtered_columns?`（激活列索引提示）。`--properties` 整体可选——传它时 `rules` 不可为空；不传则只在 `--range` 上建立空筛选器（无列条件）。`range` 是独立 flag（不要再放此 JSON 里） |

### `+filter-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | 筛选规则 JSON，含 `rules` 和 `filtered_columns?`；update 是整组覆盖式（传空 `rules: []` 清空）。`range` 已拎为独立 flag |
| `--range` | string | required | 筛选作用的单元格范围（A1 表示法，如 `A1:F1000`）；优先级高于 `--properties` 中同名字段 |

### `+filter-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

_仅含公共 / 系统 flag。_

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+filter-create` `--properties` / `+filter-update` `--properties`

_创建/更新的筛选器属性_

**顶层字段**：
- `range` (string) — 筛选对象作用的单元格范围（A1 表示法） — ⚠️ 已拎为独立 flag `--range`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `rules` (array<object>) — 列级筛选规则列表，每一项对应一个具体列的筛选条件 each: { column_index: string, conditions: array<oneOf>, filtered_rows?: array<number> }
- `filtered_columns` (array<string>?) — 可选

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。`filter_id` 等同于 `sheet_id`（每个工作表至多一个筛选器）。

### `+filter-list`

```text
# 查看当前 sheet 的筛选器配置（filter_id 等于 sheet_id）
lark-cli sheets +filter-list --url "..." --sheet-id "$SID"
```

### `+filter-create`

`--range` 是独立 flag（含表头行）；`rules` 走 `--properties`：

```text
lark-cli sheets +filter-create --url "..." --sheet-id "$SID" \
  --range "A1:F1000" \
  --properties '{"rules":[{"column_index":"B","conditions":[{"type":"multiValue","compare_type":"equal","values":["北京","上海"]}]}]}'
```

**`conditions[].type` × `compare_type` 取值**（`type` 决定可用的 `compare_type`；两者均必填）：

| `type` | 可用 `compare_type` | `values` |
|---|---|---|
| `text` | `contains` / `doesNotContain` / `beginsWith` / `doesNotBeginWith` / `endsWith` / `doesNotEndWith` / `equals` / `notEquals` | 字符串数组 |
| `number` | `equal` / `notEqual` / `greaterThan` / `greaterThanOrEqual` / `lessThan` / `lessThanOrEqual` / `between` / `notBetween` | 数值（或数值字符串）数组；`between` / `notBetween` 传两个边界 |
| `multiValue` | `equal` / `notEqual` | 字符串数组（精确匹配其中任一值） |
| `color` | `backgroundColor` / `foregroundColor` | 不传 `values`（按单元格颜色筛选） |

> ⚠️ `text` 用 `equals` / `notEquals`（**带 s**），`number` / `multiValue` 用 `equal` / `notEqual`（**不带 s**）——别混。完整 schema 跑 `+filter-create --print-schema --flag-name properties`。

### `+filter-update`

> ⚠️ update 是覆盖式：`--properties` 中传新 `rules` 会替换旧组。如只想加一条，要带上已有的全部条件再追加。必填 `--range`。

### `+filter-delete`

```text
lark-cli sheets +filter-delete --url "..." --sheet-id "$SID" --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+filter-create` 校验 `--range` 至少 2 行（表头 + 至少 1 行数据）；`+filter-update` 必须先 `+filter-list` 确认目标存在；`+filter-delete` 强制 `--yes` 或 `--dry-run`。
- `DryRun`：输出"将要 POST/PATCH/DELETE 的 filter 请求模板"。
- `Execute`：写后不自动回读；create/update 后必须调用 `+filter-list` 核对 range、rules 与已过滤行数；delete 后 list 确认筛选器不存在。


<a id="s-de6e8fafb9b89e1b"></a>

## references/lark-sheets-float-image.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Float Image

> **选浮动图还是单元格图？只看一条**：这张图是不是**属于某条记录、要随那行一起排序 / 筛选 / 增删**？
> - **是 → 单元格图片**（不在本 reference）：嵌进单元格、随行走。用 `+cells-set-image`（或 `+cells-set` 的 `rich_text` + `type: "embed-image"`，见 lark-sheets-write-cells）。典型：凭证 / 证件照 / 商品图 / 头像 / 二维码 / 每行配图；话里带「对应 / 每行 / 每条 / 这列」等绑定词即属此类。
> - **否 → 浮动图片**（本 reference）：自由摆放、不绑数据的装饰 / 标识（logo / 水印 / 封面大图 / banner）。
> - ⚠️ 别凭"浮动图位置尺寸更好控制 / 更熟"就选它——那是按操作便利选，不是按场景选；用浮动图承载"对应某记录"的图会在增删行 / 排序后错位。

## 真对象硬约束

当用户要求"插入图片 / 添加 logo / 放一张图"时，**必须**通过 `+float-image-{create|update|delete}`（浮动图片）或 `+cells-set-image` / `+cells-set` 的 `embed-image`（单元格图片）创建真实的图片对象。**禁止**只在文本回复中给出图片链接 / 描述图片内容代替插入。判断标准：交付后 `+float-image-list` 或单元格 `rich_text` 必须能读到该图片对象。

## 使用场景

读写**浮动图片**对象（悬浮在单元格上方的图片，不属于单元格内容）。本 reference 覆盖 4 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有浮动图片 | `+float-image-list` | 获取浮动图片的位置、大小和层级配置 |
| 创建/更新/删除浮动图片 | `+float-image-{create|update|delete}` | 对浮动图片执行写入操作 |

典型工作流：先读取现有浮动图片了解配置 → 执行创建/更新/删除 → **必须再次读取验证结果**。

**常见配置错误（必须注意）**：
- **单元格图片 vs 浮动图片选择错误**：图与某条记录一一对应、要随行排序 / 筛选 / 增删时，应走 `+cells-set-image`（见顶部判别），用浮动图会错位。
- **图片位置参数要精确**：锚点单元格的行列索引和偏移量决定了图片位置，设置不当会导致图片遮挡数据
- **创建后必须验证**：调用 `+float-image-list` 确认图片位置和大小正确

图片来源有三种方式，`+float-image-create` 上三者 **XOR、必给其一**（`--image` / `--image-token` / `--image-uri`）：

- **`--image <本地路径>`（首选，最省事）**：直接给本地图片文件路径（PNG/JPEG/GIF/BMP/HEIC 等）。CLI 会自动把它以 `parent_type=sheet_image` 上传，拿到 file_token 后创建浮动图，**不用你手动上传 / 取 token**。路径规则同其它本地文件 flag：必须是当前工作目录内的相对路径（绝对路径会被 Validate 拒，`--dry-run` 也会拦）。
- `--image-token`：复用**已存在**的图片 file_token。常见来源：① `+float-image-list` 返回的 `image_token`（适合"换皮不换位置"复用同一张图）；② `+cells-set-image` 成功返回里的 `file_token`（它也是 `sheet_image` 上传句柄）。适合"同一张图复用到多处"，省去重复上传。
- `--image-uri`：图片 URI（上传链路返回的句柄），**非**表内对象 reference_id；由系统自动转 file_token。

> ⚠️ **`--image` 仅 `+float-image-create` 支持**。`+float-image-update` 换图仍只接受 `--image-token` / `--image-uri`，而且**图片源是 update 唯一可省的部分**——三者全不传则保留原图。但 `--image-name` / `--position-{row,col}` / `--size-{width,height}` 在 update 时和 create 一样**必填**（`+float-image-update` 强制要求这套核心字段，且 `+float-image-list` 不回传 `image_name` 供 CLI 回填）。要在 update 里换一张本地新图，先用 `+cells-set-image` 上传到任意临时单元格、从返回取 `file_token`，再把它传给 update 的 `--image-token`；用完清除该临时单元格，避免残留多余图片。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+float-image-list` | read | 对象 |
| `+float-image-create` | write | 对象 |
| `+float-image-update` | write | 对象 |
| `+float-image-delete` | high-risk-write | 对象 |

## Flags

### `+float-image-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--float-image-id` | string | optional | 按 id 过滤；省略时列工作表全部 |

### `+float-image-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--image-name` | string | required | 图片名称，含扩展名（如 `logo.png`） |
| `--image-token` | string | xor | 图片 file_token（与 `--image-uri` 二选一）。常见来源：`+float-image-list` 返回的 `image_token` |
| `--image-uri` | string | xor | 图片 URI（上传链路返回的句柄，非表内对象 reference_id；与 `--image-token` 二选一）；系统自动转换为 file_token |
| `--position-row` | int | required | 图片左上角所在行（0-based） |
| `--position-col` | string | required | 图片左上角所在列（列字母，如 `A` / `B`） |
| `--size-width` | int | required | 图片宽度（像素） |
| `--size-height` | int | required | 图片高度（像素） |
| `--offset-row` | int | optional | 在 `--position-row` 基础上的行内偏移（像素） |
| `--offset-col` | int | optional | 在 `--position-col` 基础上的列内偏移（像素） |
| `--z-index` | int | optional | 图片 Z 轴层级，控制重叠顺序 |
| `--image` | string | xor | 本地图片路径（PNG/JPEG 等）；CLI 自动上传为 sheet_image 并用返回的 file_token，省去手动拿 token（与 --image-token / --image-uri 三选一） |

### `+float-image-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--float-image-id` | string | required | 目标图片 id |
| `--image-name` | string | required | 图片名称，含扩展名（如 `logo.png`） |
| `--image-token` | string | optional | 可选图片 file_token；与 `--image-uri` 互斥，二者均省略时保留原图。常见来源：`+float-image-list` 返回的 `image_token` |
| `--image-uri` | string | optional | 可选图片 URI（上传链路返回的句柄，非表内对象 reference_id）；与 `--image-token` 互斥，二者均省略时保留原图；系统自动转换为 file_token |
| `--position-row` | int | required | 图片左上角所在行（0-based） |
| `--position-col` | string | required | 图片左上角所在列（列字母，如 `A` / `B`） |
| `--size-width` | int | required | 图片宽度（像素） |
| `--size-height` | int | required | 图片高度（像素） |
| `--offset-row` | int | optional | 在 `--position-row` 基础上的行内偏移（像素） |
| `--offset-col` | int | optional | 在 `--position-col` 基础上的列内偏移（像素） |
| `--z-index` | int | optional | 图片 Z 轴层级，控制重叠顺序 |

### `+float-image-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--float-image-id` | string | required | 目标图片 id |

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。浮动图片是 sheet 级对象——和单元格内嵌图片不同（后者走 `+cells-set`）。

### `+float-image-list`

```text
lark-cli sheets +float-image-list --url "..." --sheet-id "$SID"
```

### `+float-image-create`

所有字段拍平为独立 flag：图片来源 `--image` / `--image-token` / `--image-uri`（三选一 XOR）/ `--image-name` / `--position-{row,col}` / `--size-{width,height}` / `--offset-{row,col}` / `--z-index`。

```text
# 首选：直接给本地图片路径，CLI 自动上传（无需手动拿 token）
# 注意：--image-name 是 required（即使路径 basename 已经是 logo.png 也要显式传）
lark-cli sheets +float-image-create --url "..." --sheet-id "$SID" \
  --image ./logo.png --image-name "logo.png" \
  --position-row 2 --position-col B --size-width 300 --size-height 200 --z-index 1

# 用已有 file_token（从 +float-image-list 的 image_token 或 +cells-set-image 返回的 file_token）
lark-cli sheets +float-image-create --url "..." --sheet-id "$SID" \
  --image-name "logo.png" --image-token "$TOKEN" \
  --position-row 0 --position-col A --size-width 200 --size-height 150

# 用 image URI（上传链路返回的句柄，非表内对象 reference_id；与 --image-token 二选一）
lark-cli sheets +float-image-create --url "..." --sheet-id "$SID" \
  --image-name "logo.png" --image-uri "$IMAGE_URI" \
  --position-row 2 --position-col B --size-width 300 --size-height 200 --z-index 1
```

### `+float-image-update`

> **update ≈ create，只有图片源可省**：`+float-image-update` 的 update 要求和 create 相同的核心字段——`--image-name`、`--position-{row,col}`、`--size-{width,height}` **全部必填**；唯一区别是**图片源（`--image-token` / `--image-uri`）可以全省**，省略即保留原图。这**不是**"只发改动字段"的 patch：缺任一核心字段会被拒绝（`+float-image-list` 不回传 `image_name`，CLI 无法替你回填）。
>
> 推荐流程：先 `+float-image-list --float-image-id <id>` 回读当前 position / size，再带上 `--image-name` 和完整的 position / size 调一次 `+float-image-update`。

```text
# 调整位置 + 尺寸，保留原图（不传图片源）
lark-cli sheets +float-image-update --url "..." --sheet-id "$SID" \
  --float-image-id "$IMG_ID" --image-name "logo.png" \
  --position-row 5 --position-col C --size-width 300 --size-height 200

# 换图：额外带 --image-token，核心字段同样要给全
lark-cli sheets +float-image-update --url "..." --sheet-id "$SID" \
  --float-image-id "$IMG_ID" --image-name "new-logo.png" --image-token "$NEW_TOKEN" \
  --position-row 5 --position-col C --size-width 300 --size-height 200
```

### `+float-image-delete`

```text
lark-cli sheets +float-image-delete --url "..." --sheet-id "$SID" --float-image-id "$IMG_ID" --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+float-image-create` 要求 `--image` / `--image-token` / `--image-uri` **恰好给一个**，`--position-row/col` 与 `--size-width/height` 必填且为合法整数；传 `--image` 时还会校验路径安全（绝对路径 / 越出工作目录会被拒，`--dry-run` 同样拦）。`+float-image-update` 必须 `--float-image-id`，并和 create 一样必填 `--image-name` / `--position-{row,col}` / `--size-{width,height}`（缺任一核心字段本地直接报错，不会静默发 0）；图片源 `--image-token` / `--image-uri` 可省（省略保留原图），给则二选一；`+float-image-delete` 强制 `--yes` 或 `--dry-run`。
- `DryRun`：写操作输出"将要 POST/PATCH/DELETE 的 float_image 请求模板"；传 `--image` 时会多打印一步本地图片上传（`POST /open-apis/drive/v1/medias/upload_all`，`parent_type=sheet_image`）。
- `Execute`：写后不自动回读；create/update 后必须调用 `+float-image-list --float-image-id <id>` 比对位置与尺寸（它不回传 `image_name`，名称无从核对）；delete 后 list 确认目标不存在。


<a id="s-a45637ec47141ec0"></a>

## references/lark-sheets-formula-translation.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 飞书表格公式生成规则

> **本文定位**：飞书公式正确性的**唯一权威**——书写任何飞书公式、或把 Excel 公式迁移到飞书前，先读本文。涵盖公式书写约定（绝对引用、范围语法）、投影 vs spill、`ARRAYFORMULA` / 数组语义与逐行填充、高风险引用函数、日期差、不支持函数清单。
> **边界**：本文只讲"公式怎么写对"；公式**怎么写入表格**（`+cells-set` / 模板单元格 + `--copy-to-range` / 容错回读）见 `references/lark-sheets-write-cells.md`。公式写入完成后必须用 `references/lark-sheets-formula-verify.md` 对本次公式范围逐段诊断并回读关键公式；不要把"翻译对了"误当成"结果一定正确"。本文不含 shortcut，通用编辑准则见主 SKILL.md「飞书表格编辑准则」。

**核心原则一：飞书不像 Excel 365 那样默认 spill（溢出展开）。** 某个参数要求单值、实际传入的却是区域时，飞书默认取"投影"（按公式所在行/列取对应的那一个值）；只有当求值处于**数组公式上下文内部**——最外层套了 `ARRAYFORMULA`，或公式里已有原生数组函数（`FILTER` / `XLOOKUP` / `SORT` 等，见下方清单）——才逐项展开。`ARRAYFORMULA` 与"逐行标量公式 + `--copy-to-range` 填充"导出后都保真，按需要选：前者一条公式覆盖整片、写起来短；后者每格是独立公式，导出后在 Excel 里能单格编辑。

**核心原则二：`LAMBDA` 系高阶函数（`MAP` / `REDUCE` / `SCAN` / `BYROW` / `BYCOL` / `MAKEARRAY`）在飞书内算得对，但导出 `.xlsx` 会静默算错。** 导出时飞书只把 LAMBDA 体内联展开成普通数组表达式，**不保留高阶语义**，全程不报错：

- `REDUCE(0,A2:A6,LAMBDA(acc,x,acc+x))`（归约求和）→ `=0+A2:A6`，归约整个丢失
- `BYROW(A2:B6,LAMBDA(r,SUM(r)))`（逐行求和）→ `=SUM(A2:B6)`，5 个结果塌成 1 个
- `MAP(A2:A6,LAMBDA(x,IF(x>0,x,0)))` → `=A2:A6>0`，`IF` 整个消失

唯一例外是 `MAP` 且 LAMBDA 体为**纯运算符或单参函数**时展开恰好等价（`LAMBDA(a,b,a*b)` → `=A2:A6*B2:B6` ✓）。**除此之外一律改走 `ARRAYFORMULA` / 逐行填充 / 辅助列**——同样的逐项逻辑写成 `=ARRAYFORMULA(IF(A2:A6>0,A2:A6,0))` 导出后完整保留，写成 `MAP(...LAMBDA(...IF...))` 就丢。这类错误公式不报错、飞书里回读也是对的，只有导出后才暴露，靠事后检查发现不了。

## 公式书写约定（写任何公式都先满足）

- **绝对引用 `$`**：向下 / 向右填充前判断哪些引用要锁定——用户指定的固定 cell（`$C$3`）、要固定的数据范围（`$A$2:$B$5`）、锁列不锁行（`$A2`）、锁行不锁列（`B$1`）。填充前检查是否需固定汇率 / 税率 / 查找表 / 权重表，以及同列 / 同行公式结构是否一致。
- **公式字符串用飞书范围语法**：写 `H:H`、`A2:B5`，**禁止** `H2:H` / `2:2`。要在公式里引用整行，用显式范围（如 `$A2:$Z2`）替代禁用的 `2:2`。这与 CLI 工具参数（如 `--range` / `--copy-to-range`）的 A1 表示法写法不同：参数侧合法的 `D3:D`、`1:1`、`3:6` 在公式串里反而非法。**公式串 ≠ CLI 参数**，两套规则别互相照搬，混用会导致调用失败或公式报错。
- **产物要导出 xlsx 交付时优先 Excel 兼容函数**：同一计算能用 Excel 兼容函数（SUMIFS / TEXT / MID / FIND 等）表达就不用飞书特有函数（MAP / REGEXEXTRACT / ARRAYFORMULA 等）——特有函数在导出后的 xlsx 里可能无法重算；确需使用时，导出后核对重算正常再交付。

## 业务语义契约（复杂统计公式写前必做）

公式无错误码不等于业务逻辑正确。写入前把用户要求整理成一张短契约并逐项核对：

1. **字段**：用表头 + 3–5 行真实值确认“姓名/工号、开始/结束、秒/分钟”等列语义，禁止只凭列字母或列名猜测。
2. **阈值**：中文“以上 / 至少 / 不低于”用 `>=`，“超过 / 大于”用 `>`；“以下 / 至多 / 不高于”用 `<=`。阈值恰好相等的记录必须作为哨兵。
3. **单位与时区**：显式记录秒↔分钟、百分比↔小数、Unix 秒/毫秒与 UTC→本地时区转换；日期由时间戳计算时先用一条已知记录手算。
4. **完整范围**：公式范围覆盖源数据真实首末行，不能把探结构的前 N 行样本直接当计算范围；回读/落盘结果出现 `truncated` / `complete:false` 时先续读。
5. **业务哨兵**：写前用本地脚本或手算得到至少一条可核预期；写后同时核首、中、末、空值、阈值边界和该预期。`formula-verify success` 只证明没有公式错误码，不能替代这些结果断言。

## 翻译后建议：代码复现校验

公式语法翻译完之后，建议用本地脚本在源数据上独立复现一份"等价计算结果"再写入。流程：

1. **挑 3-5 个代表性输入行**（首行 / 中段 / 末行 / 含空值 / 含异常格式各一）
2. **用 Python 复现 Excel 原公式的语义**（不是飞书译文的语义，而是用户原本想要的结果）
3. **写入飞书译文公式后回读这几行的实际值**
4. **三方对照**：`Excel 原公式语义 == Python 复现 == 飞书译文回读值`；不一致时优先排查（数组语义？日期差？范围引用？），无法修完时在交付说明标明风险。

**理由**：Excel→飞书的语法翻译很容易在 spill / 数组 / 日期差 / 范围引用上出现等价性偏差，仅靠语法转换通过不足以保证业务结果正确。

## 落表后的默认交接

本文解决的是"公式怎么写对"，不是"写进表里后一定能零错误运行"。因此：

1. 按本文完成公式改写后，用 `references/lark-sheets-write-cells.md` / `references/lark-sheets-batch-update.md` 把公式真实写入表格。
2. 公式一旦落表，必须对本次新增 / 修改的公式范围逐段运行 `+formula-verify --exit-on-error`；关键公式区还要回读首、中、末及汇总行的 `formula`。
3. 每段 `status='success'` 后才结束公式任务；`errors_found` 继续修复，`partial` 缩小 `--range` 或按 sheet 拆分续扫，不能用说明替代完整验证；AI 公式不套这条 success 收敛，按下方「AI 公式」的全区间一次异步状态检查规则交付。

**静态值改公式（"让统计表跟随源数据变化"类任务）额外一步**：改写前先快照原静态值，公式写完后逐格与快照 diff。不一致时先尝试口径变体（`>` / `>=`、取整方式、匹配列）逼近原值；仍不一致不算失败——原静态值可能对应旧数据或含未声明口径——但必须在交付说明中给出 diff 表与所用口径的解释，禁止不声明差异直接交付。

**首次写计算结果时默认写公式**：在已有表上做统计、汇总、排名、分类计算等——无论源数据是已有单元格还是新读取的数据——默认把计算结果写成引用源数据的公式，不要用 Python 在本地算好数值再硬编码写入。公式优先原则的例外：外部抓取数据、永不变化的常量、循环引用。

## AI 公式（`AI` 函数）

飞书表格提供一个统一的 **`AI` 公式**：用自然语言描述需求，AI 返回文本结果。AI 公式的**写入方式与普通公式完全一致**（复用 `references/lark-sheets-write-cells.md` 的 `+cells-set` / `set_cell_range`，无需特殊接口），只是计算是**异步**的——写入后要等 AI 算完才有结果。

**AI 公式几乎必然含逗号 + 双引号（如 `=AI("翻译成中文", E2)`），默认走 `+cells-set` 的 JSON `formula` 字段，不要走 `+csv-put`**：`+csv-put` 会按逗号把公式拆列、写坏（详见 `references/lark-sheets-write-cells.md`）。`+cells-set` 里公式内部的双引号写成 `\"`。整列填充用模板 + `--copy-to-range`：

```text
# 种子格写一条 AI 公式（内部引号用 \" 转义），再向下铺满整列
lark-cli sheets +cells-set --url <表URL> --sheet-name <子表名> \
  --range D2 --cells '[[{"formula":"=AI(\"翻译成中文\", E2)"}]]' \
  --copy-to-range "D2:D107"
# 写完先对种子格 D2 做一次 +cells-get --include formula 核对文本，再用 --ai-only 校验整个写入区间；禁止用 +cells-get 轮询计算结果
lark-cli sheets +formula-verify --url <表URL> --sheet-name <子表名> --range D2:D107 --ai-only
```

**校验纪律**：AI 公式计算是异步的。写完先做**一次性公式文本核对**（对种子格 / 首格做**一次** `+cells-get --include formula`，确认落进去的确实是 `=AI(...)` 而非 `#ERROR` 或残缺字面量）——这一步是**必经**的；被禁止的只是用 `+cells-get` / `+csv-get` 反复**轮询计算结果**。计算状态的**第一校验入口必须是 `+formula-verify --ai-only`**，`--range` 给**整个写入区间**（只读、成本低，不要抽样）；注意 `--range` 只透传给后端，AI-only 汇总不保证按它收窄，**认返回里的单元格定位、不认总数**。交付判据（机读）：`ai_formula_failed_count == 0`，`failed` / `unsupported` 先修；满足后即使仍有 `ai_formula_pending_count > 0` 也可交付，并告知用户后台仍在计算。若文本核对暴露出 `#ERROR` / 残缺字面量（半截括号 / 全角括号），那是公式串在写入层被转义写坏了、不是 AI 失败，回到 `+cells-set` 用 `\"` 重写（详见 `references/lark-sheets-formula-verify.md`）。

### 语法

```
=AI(prompt)
=AI(prompt, range)
=AI(part1, part2, ...)
```

- `prompt`：提示词，说明要 AI 做什么（可以是字符串常量，也可以引用单元格）。
- `range`：可选，交给 AI 处理的输入数据。可以是单个单元格（如 `A2`），也可以是一段单元格（如整行 `A2:G2` 或几列 `A2:C2`）——这段单元格会作为**这一次计算的输入上下文**一并喂给 AI，公式返回**一个**结果。具体写法见下方「常见用途」。
- **多参数拼接**：`AI` 接受多个参数，会按顺序把字符串常量与单元格 / 区域引用拼成一段完整提示词。可用来把散落在不同位置的值组进一句话，例如 `=AI("结合", A2, "和", A4, "的描述，总结3个关键词")`。

### 常见用途（同一个函数，靠提示词区分）

`range` 既可以是单个单元格，也可以引用整行 / 多列作为一次计算的输入上下文；也可以用多个参数把不同位置的值拼进同一句提示词：

| 场景 | 示例 |
|---|---|
| 翻译 | `=AI("翻译成日语", A2)` |
| 情感分析 | `=AI("判断客户情绪，只返回 Positive、Neutral、Negative", A2)` |
| 分类打标签 | `=AI("判断这封邮件是不是垃圾邮件", D2)`；结合多列辅助信息判断：`=AI("把餐厅归类到它所属的纽约市行政区，可参考街区信息", A2:C2)` |
| 信息提取 | `=AI("提取邮箱", A2)` / `=AI("提取手机号", A2)` |
| 总结 | `=AI("为这位客户的反馈写一句话总结", A2:D2)`；`=AI("用要点列出这段书籍摘要的主要主题", D2)` |
| 多值拼接 | `=AI("结合", A2, "和", A4, "的描述，总结3个关键词")` |
| 润色改写 | `=AI("改写得更正式", A2)` |
| 生成文案 | `=AI("用 10 个字以内为活动生成一句宣传语", A2)`；引用整行回应具体内容：`=AI("给评审写一封邮件，针对评审意见中的具体条目逐条回应", A2:G2)`；`=AI("根据这段岗位职责摘要，为该职位生成一组关键词", A2:C2)` |
| 数据清洗 / 标准化 | `=AI("统一公司名称写法", A2)` |
| 关键词提取 | `=AI("提取 5 个关键词，用逗号分隔", A2)` |

### 提示词最佳实践（写对提示词是结果稳定的关键）

AI 公式的质量高度依赖提示词。推荐：

1. **明确输出格式**：与其写"分析一下"，不如写"判断情绪，只返回 Positive / Neutral / Negative"。限定可选值能让结果可机读、可再计算。
2. **指定语言**：写"翻译成中文"比只写"翻译"更稳定。
3. **指定长度**：如"总结成一句话""30 字以内"。
4. **需要结构化时明确要 JSON**：如提示"返回 JSON：{category:'', score:0-100}"，AI 能较稳定地输出结构化结果。

### 与普通公式组合

`AI` 可以像普通函数一样嵌进公式链，引用单元格或区域：

```
=IF(B2>90, AI("夸奖一下这位员工"), "")
=IF(A2="", "", AI("翻译成英文", A2))
```

`AI(...)` 返回单个结果（标量），把它嵌进公式链时按标量对待即可，不要套 `TEXTJOIN` / `ARRAYFORMULA` 等按数组语义设计的写法——AI 公式不会 spill 出数组。

### 用 CLI 对一列逐行处理

对整列逐行跑 AI，推荐**模板单元格 + `--copy-to-range` 向下扩展**：在种子单元格写 `=AI("<提示词>", A2)`，再用 `--copy-to-range` 扩展到整列，相对引用会随行自增（`A2` → `A3` → …）。这样每行独立计算、行为可预测，比依赖单条公式一次铺开整列更稳。

**行数多时分批串行**：AI 公式是异步计算，一次扩展的行数越多越容易触发超时。普通公式可以照 `references/lark-sheets-write-cells.md` 的整列 / 到列尾（`H:H`、`D3:D`）用法一次铺开；**AI 公式**行数很多时建议按批（量级参考：每批约几百到一千行）**串行**扩展——写完一批、`+formula-verify --ai-only` 确认这批已进入计算后再铺下一批，不要一次铺极长的列，也不要多批并发。

**写完 AI 公式后的校验与交付**：先对种子格 / 首格做**一次** `+cells-get --include formula` 核对公式文本（**必经步骤**，确认落进去的是 `=AI(...)` 而非 `#ERROR` / 残缺字面量），随后计算状态的第一校验入口必须是 `references/lark-sheets-formula-verify.md` 的 `+formula-verify --ai-only --range <整个写入区间>`（只读、成本低，`--range` 覆盖全区间、不要抽样），**禁止用 `+cells-get` / `+csv-get` 轮询计算结果**。交付判据（机读）：`ai_formula_failed_count == 0`（`--range` 不保证收窄汇总口径，按返回的单元格定位核对本次区间，不按总数比对）；满足后即使仍有 `ai_formula_pending_count > 0` 也可以交付，飞书会在后台继续计算，交付时告知用户"AI 公式仍在后台运行，结果会陆续完成"。细节见 `references/lark-sheets-formula-verify.md`。

## 决策流程

1. 最终结果是**标量**（单值）→ 直接写普通公式
2. 最终结果是**一维或二维数组**：
   - 公式中**包含**飞书原生数组函数（如 FILTER、XLOOKUP、MAP 等）→ 直接写，数组语义会自动传播到整个公式，包括原生数组函数外层接的标量运算（如 `+1`、`*100`）
   - 公式中**不包含**任何原生数组函数，只是在对区域做标量计算 → 用 `ARRAYFORMULA` 包住整个表达式，或写成**单行标量公式再向下 / 向右填充**（`--copy-to-range`）
3. Excel 依赖 `ROW(range)` 逐项驱动 `SUBTOTAL/INDIRECT/OFFSET` → 拆成辅助列：辅助列每行写单行标量式（`=SUBTOTAL(103,INDIRECT("E"&ROW(E16)))`）向下填充，再对辅助列做聚合；但结果要随筛选联动时保持单条 `MAP(...LAMBDA(...))`，见下方「Excel 隐式逐项求值」
4. 内层 `INDEX/INDIRECT/OFFSET` 返回范围，外层 `SUMIF/COUNTIF/SUMIFS` 还要继续吃这些范围 → 同样拆辅助列逐行算，再聚合
5. 公式意图是"对多个区域分别计算再汇总"（例如用 INDIRECT/OFFSET 对每行生成一个范围，再对所有范围聚合）→ 飞书不能直接返回"区域的列表"，必须明确降维：用 `VSTACK` 垂直合并、`HSTACK` 水平合并、`TOCOL/TOROW` 展平，或先把各段结果落到辅助区域再用普通聚合函数汇总
6. 算日期差 → 不要写 `DAY(end-start)`，用 `DAYS`、`DATEDIF` 或直接 `end-start`

## 飞书的投影行为（不是默认 spill）

触发条件是**参数要求单值、实际传入的却是区域**，此时飞书取"投影"而不是"spill"：

- 单列区域 → 按当前公式所在行取值
- 单行区域 → 按当前公式所在列取值
- 二维区域 → 只有当前公式位置能映射到该区域时才取值，否则报错
- 数组常量 `{...}` 或函数返回矩阵，在普通标量上下文里通常只取左上角

**例外是数组公式上下文内部**：最外层套了 `ARRAYFORMULA`、或公式里已有原生数组函数时，同一个区域会逐项展开，不再投影。

因此（以下均指普通公式，即不在数组公式上下文里）：
- `=A1:A2` 在飞书普通公式里不会 spill，只会投影到当前行
- `=ABS(A2:B2)` 不会得到一整行，要写 `=ARRAYFORMULA(ABS(A2:B2))`，或在 A、B 两格分别写 `=ABS(A2)` / `=ABS(B2)`
- `=TRUNC({1.1111,2.222},{1,2})` 要得到一整行，写 `=ARRAYFORMULA(TRUNC({1.1111,2.222},{1,2}))`

## 没有原生数组函数时：ARRAYFORMULA 或逐行填充

**前提：本节适用于公式中没有任何原生数组函数的情况。** 若公式中已有原生数组函数（如 FILTER、XLOOKUP、MAP 等），数组语义会自动传播到整个公式的求值过程（见下一节）。

以下运算与函数**只按标量求值**，直接喂整段区域不会逐项展开：

- 算术运算：`+ - * / ^ %`
- 比较运算：`= <> > >= < <=`
- 标量数学函数：`ABS ROUND INT TRUNC MOD LOG LN SQRT SIN COS TAN ...`
- 文本函数：`LEN LEFT RIGHT MID UPPER LOWER TRIM TEXT VALUE ...`
- 日期函数：`YEAR MONTH DAY DATE TIME EDATE EOMONTH ...`
- 条件函数：`IF IFS IFERROR IFNA NOT ISNUMBER ISTEXT ISBLANK ...`
- 引用函数（高风险）：`INDEX OFFSET COLUMN ROW MATCH`

**两条等价做法，导出 `.xlsx` 后都保真，按需要选一条：**

- **`ARRAYFORMULA(<整个表达式>)`**：一条公式覆盖整片，写起来短。`=ARRAYFORMULA(A2:A100*B2:B100)` ✓、`=ARRAYFORMULA(IF(A2:A100>0,B2:B100,""))` ✓
- **逐行标量式 + 填充**：首行写 `=A2*B2` / `=IF(A2>0,B2,"")`，再用 `--copy-to-range` 铺到整列，引用随行递增。每格是独立公式，导出后在 Excel 里能单格编辑

`MAP` 只在 LAMBDA 体是**纯运算符或单参函数**时可用（如 `=MAP(A2:A100,B2:B100,LAMBDA(a,b,a*b))`）；体内出现 `IF`、多参函数或字符串拼接就改用上面两条路，理由见开头核心原则二。

### 公式中有原生数组函数时，整个公式已进入数组模式

飞书的数组语义会在整个公式求值过程中累积传播：一旦某个原生数组函数运行，后续所有运算符和函数也会自动逐元素处理，无论它们出现在哪一层。

因此以下写法直接成立，不必再包 `ARRAYFORMULA`、也不必拆成逐行填充：

- `=FILTER(A2:A10,B2:B10="x")+1` ✓
- `=XLOOKUP(E2:E10,A2:A10,B2:B10)*100` ✓
- `=ABS(FILTER(A2:A10,B2:B10>0))` ✓
- `=MAP(A2:A10,LAMBDA(x,x*2))-1` ✓

## 原生数组函数清单

以下函数按数组语义工作，可直接返回整片结果，不必拆成逐行填充；且它们在 Excel 侧同样存在，可安全使用：

`CELL` `CHOOSECOLS` `CHOOSEROWS` `DROP` `EXPAND` `FILTER` `FREQUENCY` `GROWTH` `HSTACK` `LINEST` `LOGEST` `LOOKUP` `MINVERSE` `MMULT` `MUNIT` `RANDARRAY` `SEQUENCE` `SORT` `SORTBY` `SUMPRODUCT` `SWITCH` `TAKE` `TEXTSPLIT` `TOCOL` `TOROW` `TRANSPOSE` `TREND` `UNIQUE` `VSTACK` `WRAPCOLS` `WRAPROWS` `XLOOKUP`

`BYCOL` `BYROW` `MAKEARRAY` `MAP` `REDUCE` `SCAN` 同样是原生数组函数，但受核心原则二约束——导出 `.xlsx` 会丢高阶语义，默认改走 `ARRAYFORMULA` / 逐行填充 / 辅助列。

`ARRAYFORMULA` 不在上面这份清单里——它的作用是给**本来只按标量求值**的表达式套上数组语义，而不是自己返回数组。导出 `.xlsx` 时它会被翻译成 Excel 原生数组公式（`=ARRAYFORMULA(IF(A2:A6>2,B2:B6,""))` → `=IF(A2:A6>2,B2:B6,"")`，作用范围覆盖整片），语义完整保留，可安全使用。

> **注意：`SWITCH` 在飞书里被当作原生数组函数处理，这与 Excel 行为不同——把区域喂给它会逐项展开。**

## 跨电子表格取数不要用公式

飞书公式没有跨工作簿引用的通用写法（Excel 的外部链接迁过来也不成立）。需要另一份电子表格的数据时，先把那份数据读出来（`+csv-get` 等）落到本表的一张子表，再在本表内用普通引用计算——既避开跨表引用限制，也保证导出后公式仍可用。

## INDEX / OFFSET / COLUMN / ROW / MATCH 是高风险函数

这组函数容易让人误以为会自动把多值铺开，但在飞书里不能这样假设。

**高风险信号：**

- 行号 / 列号 / 偏移量本身是数组
- 结果本来应该是一行或一块二维区域
- 外层还有算术、比较、`IF` 等继续处理它

更稳的写法：整体包一层 `=ARRAYFORMULA(INDEX(...))` / `=ARRAYFORMULA(ROW(...))`；或退回**当前行的标量式再向下填充**——首行写 `=INDEX($A$2:$A$100,ROW(A1))`，向下填充时 `ROW(A1)` 自动递增为 1、2、3…

**例外：** 如果返回值只是立刻交给聚合函数消费，直接写即可：

- `=SUM(INDEX(A1:B2,0,1))` ✓

## Excel 隐式逐项求值，飞书里要拆辅助列

**典型特征：**

- 外层是 `SUMPRODUCT`、`SUM` 等聚合
- 内层用了 `SUBTOTAL`、`INDIRECT`、`OFFSET` 等更偏"单值/单引用"的函数
- Excel 会把中间结果逐项带进去算
- 飞书里直接照抄，往往不能得到同样的逐项语义

同类本质也包括：`INDEX/INDIRECT/OFFSET` 先返回范围，外层再把这些范围交给 `SUMIF`、`COUNTIF`、`AVERAGEIF`、`SUMIFS` 等范围感知函数 —— 飞书里这些外层函数不会自动二次展开内层范围。

这时要把"遍历"落到**辅助列**上，分两步：

```excel
辅助列首行（如 Z16）：=单行计算逻辑          # 例：=SUBTOTAL(103,INDIRECT("E"&ROW(E16)))
                        用 --copy-to-range 铺满 Z16:Z387（引用随行递增）
汇总格：              =SUM(Z16:Z387)         # 需要时可隐藏辅助列
```

辅助列全是普通标量公式，导出 `.xlsx` 后逐格原样保留，也避开了 `LAMBDA` 系高阶函数的导出陷阱。

**例外：结果要随筛选联动时，保持单条公式。** `SUBTOTAL` 的意义就在于筛选变化后重新计算，这类需求写成

```excel
=SUMPRODUCT(MAP(ARRAYFORMULA(ROW($E$16:$E$387)),LAMBDA(row,SUBTOTAL(103,INDIRECT("E"&row)))))
```

筛选状态本身导出 `.xlsx` 就不会保留，所以这个场景是飞书内专用，不受核心原则二的导出约束。

其余同类场景走辅助列：

- `INDIRECT("A"&ROW(...))`
- `OFFSET(...,ROW(...)-ROW(...),...)`
- `SUBTOTAL(...)`
- `SUMIF(内层返回范围, ...)`
- `COUNTIF(内层返回范围, ...)`
- `SUMIFS(内层返回范围, ...)`
- 任何"希望对每一行 / 每一列各算一次"的模式

## 多层范围结果与三维以上结果

飞书公式结果只能是二维区域，不能是"数组的数组"。

### 多层范围不能自动二次展开

内层 `INDEX/INDIRECT/OFFSET` 返回的是二维范围，外层还想继续对这些范围做范围计算时，不要假设飞书会"再展开一层"。改用辅助列逐行算再聚合（见上一节），别把二次展开压进单条数组公式。

### 真正的三维或更高维结果不能直接返回

典型触发场景：想把多个不同区域或不同条件的结果合并展示，例如：
- 对 A 列、B 列、C 列分别做 FILTER，想把三列结果并排展示
- 对多个月份分别生成数据行，想把所有月份上下堆叠展示

飞书无法直接返回"多个区域的集合"，必须先决定降维方式：

- 上下堆叠：`=VSTACK(slice1, slice2, slice3)`
- 左右拼接：`=HSTACK(slice1, slice2, slice3)`
- 压成单列：`=TOCOL(...)`
- 压成单行：`=TOROW(...)`
- 只保留聚合值：把各 slice 分别落到辅助区域，再用 `SUM` / `SUMPRODUCT` 等普通聚合函数汇总（`REDUCE` 受核心原则二约束，不要用）

不要替用户"偷定"第三维展示方式；如果用户没有明确说明怎么展示，至少先把结果改写成可见的二维形状。

## 不能机械照抄的 Excel 语法

### `@` 隐式交叉

Excel：`=@A1:A10`（强制单值，取当前行对应的值）

飞书没有 `@` 运算符。飞书普通公式对引用区域默认就有投影语义，去掉 `@` 即可：

- Excel: `=@A1:A10`
- 飞书: `=A1:A10`

### `#` spill range

Excel：`=A1#`（引用 A1 公式溢出的整片区域）

飞书没有此语法，迁移方式：

- spill 区域已知 → 改成明确范围
- spill 区域未知 → 回到源公式重写，或用 `TAKE` / `DROP` 截取

### 结构化引用

Excel：`=SUM(Table1[Amount])`

飞书不支持结构化引用，改成显式 A1 区域：`=SUM(A2:A100)`

### 老式 CSE 花括号

Excel：`{=A1:A10*B1:B10}`（Ctrl+Shift+Enter 输入）

飞书改为：`=ARRAYFORMULA(A1:A10*B1:B10)`——导出 `.xlsx` 后正好还原成 Excel 的 CSE 数组公式；或首行写 `=A1*B1` 再向下填充

## 日期序列与日期差

飞书日期序列：`0 = 1899-12-30`，`1 = 1899-12-31`，没有 Excel 的 1900 年闰年兼容问题。

**错误写法（不要用）：**

- `=DAY(B2-A2)` ✗ — 差值会被当成日期序列号再拆字段
- `=MONTH(B2-A2)` ✗
- `=YEAR(B2-A2)` ✗

**正确写法：**

- 天数差：`=DAYS(B2,A2)` 或 `=DATEDIF(A2,B2,"D")` 或 `=B2-A2`
- 月份差：`=DATEDIF(A2,B2,"M")`
- 年份差：`=DATEDIF(A2,B2,"Y")`
- 工作日差：`=NETWORKDAYS(A2,B2)`

## 飞书不支持的函数

> 本段是"飞书不支持函数"的**唯一权威清单**。以下函数在飞书里不存在或被禁用，禁止主动使用；用户明确要求时应拒绝并提供替代方案：

- `STOCKHISTORY` — 实时股票数据，飞书无等价函数，需手动导入数据
- `WEBSERVICE` — 外部 HTTP 请求，飞书无等价函数
- CUBE 系列（`CUBEVALUE`、`CUBEMEMBER`、`CUBESET`、`CUBERANK` 等）— OLAP cube 函数，飞书不支持
- `GOOGLEFINANCE`、`GOOGLETRANSLATE` 等 Google 特有函数 — 无等价函数
- `FORECAST.ETS` 系列（`FORECAST.ETS`、`FORECAST.ETS.STAT` 等）— 飞书不支持
- `INFO`、`RTD` — 系统信息 / 实时数据函数，飞书不支持
- `PIVOT` — 用 `+pivot-{create|update|delete}` 透视表对象替代
- `AMORDEGRC`、`PHONETIC`、`DETECTLANGUAGE` — 飞书不支持
- `LET`、命名自定义函数（名称管理器里定义的 LAMBDA）、独立调用的 `LAMBDA`（如 `=LAMBDA(x,x+1)(5)`）— 会报 `#NAME?`；改用嵌套 IF / 辅助列。**例外**：`LAMBDA` 作为 `MAP` / `REDUCE` / `BYROW` / `BYCOL` / `SCAN` / `MAKEARRAY` 的内联参数时飞书**支持**，但受核心原则二约束（导出 `.xlsx` 丢高阶语义），默认仍走逐行填充 / 辅助列

## 代表性改写示例

- 基础逐项计算
  - Excel: `=A2:A100*B2:B100`
  - 飞书: `=ARRAYFORMULA(A2:A100*B2:B100)`；或首行 `=A2*B2` + `--copy-to-range` 向下填充
- 条件判断
  - Excel: `=IF(A2:A100>0,B2:B100,"")`
  - 飞书: `=ARRAYFORMULA(IF(A2:A100>0,B2:B100,""))`；或首行 `=IF(A2>0,B2,"")` + 向下填充（LAMBDA 体含 `IF`，不能用 `MAP`）
- 原生数组函数（无需改动）
  - Excel: `=FILTER(A2:C100,B2:B100="East")`
  - 飞书: `=FILTER(A2:C100,B2:B100="East")`
- 原生数组函数 + 标量运算（无需改动，数组语义自动传播）
  - Excel: `=XLOOKUP(E2:E10,A2:A10,B2:B10)*100`
  - 飞书: `=XLOOKUP(E2:E10,A2:A10,B2:B10)*100`
- 高风险引用函数
  - Excel: `=INDEX(A1:D2,{2,1},0)`
  - 飞书: `=ARRAYFORMULA(INDEX(A1:D2,{2,1},0))`（`col_num=0` 取整行必须包在 `ARRAYFORMULA` 里才成立，裸写会报 `#VALUE!`）
- 日期差
  - 错误: `=DAY(B2-A2)`
  - 推荐: `=DAYS(B2,A2)` 或 `=DATEDIF(A2,B2,"D")` 或 `=B2-A2`
- Excel 隐式逐项求值
  - Excel: `=SUMPRODUCT(SUBTOTAL(103,INDIRECT("E"&ROW($E$16:$E$387))))`
  - 飞书: `=SUMPRODUCT(MAP(ARRAYFORMULA(ROW($E$16:$E$387)),LAMBDA(row,SUBTOTAL(103,INDIRECT("E"&row)))))`（`SUBTOTAL` 要随筛选联动，保持单条公式）
- 多层范围 / 二次展开
  - 错误思路: `=SUMIF(INDIRECT("E"&ROW($E$16:$E$387)),">0")`
  - 飞书: 辅助列 `Z16` 写 `=SUMIF(INDIRECT("E"&ROW(E16)),">0")` 向下填充到 `Z387`
- 三维降二维（保留所有层）
  - 飞书: `=VSTACK(slice1,slice2,slice3)` 或 `=HSTACK(slice1,slice2,slice3)`
- 三维降二维（只保留聚合值）
  - 飞书: 各 slice 落到辅助区域后 `=SUM(辅助区域)`（不要用 `REDUCE`）


<a id="s-a9ccfea5b6632bcb"></a>

## references/lark-sheets-formula-verify.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Formula Verify（+formula-verify）

> **本文定位**：飞书表格"公式写入后是否真的零错误"的诊断入口。公式的书写规则与 Excel→飞书迁移的语义规则一律以 `references/lark-sheets-formula-translation.md` 为唯一权威，本文不重复；本文聚焦"写完之后如何用一次调用发现公式错误"与 AI 公式的全区间一次异步状态检查交付。
>
> **边界**：本文不讲公式怎么写（去 `references/lark-sheets-formula-translation.md`），也不讲公式怎么写入表格（去 `references/lark-sheets-write-cells.md` / `references/lark-sheets-batch-update.md`）。本文只讲两件事：
>
> - **普通公式**：任务里发生公式落表、批量填充公式、`--copy-to-range` 扩展公式、导入含公式 workbook 时，对本次公式范围逐段跑 `+formula-verify --exit-on-error`；`errors_found` 修复、`partial` 拆分续扫，全部分段 `status='success'` 后才算完成。
> - **AI 公式**（`=AI(...)`）：不要用普通公式的"轮询到 zero-error"逻辑；改用 `+formula-verify --ai-only --range` 按「AI 公式校验」的全区间一次异步状态检查规则交付。

## 为什么需要自检

飞书表格已经实时算好结果，但"算出来"和"算对了"是两件事。常见缺口：

- 公式编译失败 → 单元格落成文本（写入类 shortcut 返回的 `formula_errors[]` 是**编译失败**信号）。
- 公式编译成功但**运行时错误**：`#REF!` / `#DIV/0!` / `#VALUE!` / `#NAME?` / `#NULL!` / `#NUM!` / `#N/A`——这一类只看 `formula_errors[]` 看不到，必须扫单元格值。

`+formula-verify` 把两路信号合并成一份统一 JSON：一次调用聚合公式错误清单 + 编译失败清单 + 每类错误的定位与样本，调用方可据此定位修复。任务只要发生公式落表，就把它作为公式错误码健康检查；限定本次新增 / 修改的公式范围逐段扫描并带 `--exit-on-error`。`status='success'` 仅表示无编译/运行时错误，不判断字段映射、阈值、单位、口径或业务结果是否正确——业务语义哨兵见 `references/lark-sheets-formula-translation.md`。

## 调用契约

最小调用形态：

| 入参 | 含义 |
|---|---|
| `--url` / `--spreadsheet-token` | 表格定位（XOR 二选一，必填） |
| `--sheet-id` / `--sheet-name` | 限定子表（mutually exclusive；省略则扫全部可见子表） |
| `--range` | 限定 A1 范围；省略则用各 sheet 的 `current_region` |
| `--max-locations` | 每类错误样本上限，默认 20 |
| `--exit-on-error` | `status='errors_found'` 时返回非 0 退出码；`partial` 仍需调用方检查 status 并拆分续扫 |
| `--ai-only` | 只检查 `=AI(...)` 异步计算状态；与普通公式 7 类错误扫描分开使用 |

返回核心字段：

- `status` ∈ `success` / `errors_found` / `partial`——**唯一可机读的健康度判据**。
- `total_errors` / `total_formulas` / `scanned_cells`——本次扫描规模指标。
- `has_more`——为 true 表示扫描被内部上限截断（详见后文「截断与续读」），未覆盖完整范围。
- `error_summary[<错误类型>]`——每类错误的 `count` / `locations[]` / `samples[].{address,formula,depends_on}`。
- `compile_errors[]`——合并最近一次写入留下的编译失败清单，与运行时错误并存时同时出现。
- `warning_message`——仅在 `has_more=true` 时出现，告知调用方需要缩小 `--range` / 拆 `--sheet-id` 续读。

## 写入后诊断规则

任何批量公式 / 含公式列写入完成后，都必须对本次新增 / 修改的公式范围逐段调用 `+formula-verify --exit-on-error`。不要等用户显式说"校验一下公式"才执行；只要任务动作包含写公式，这一步就是完成路径的一部分。AI 公式不套这条：`=AI(...)` 是异步计算，按「AI 公式校验」的全区间一次异步状态检查规则交付，不等 `status='success'`。触发场景：

- `+cells-set` / `+csv-put`
- `+cells-set --copy-to-range` / 模板单元格向整列或整块扩展公式
- `+workbook-import`
- `+batch-update` 中含写入子操作
- `+table-put`（任意列含公式时）
- `+workbook-import`（导入的 xlsx 含公式时）

处置规则：

1. `status='success'` → 当前分段无编译/运行时错误；但还必须按 `references/lark-sheets-formula-translation.md` 的业务语义契约核字段、阈值、单位、完整范围和业务哨兵。全部目标分段均为 success 且哨兵值正确后才完成。
2. `status='partial'` → 扫描被内部上限截断；缩小 `--range` 或拆 `--sheet-id` 续扫，未扫描区域仍未知，不能用交付说明代替验证。
3. `status='errors_found'` 且 `compile_errors[]` 非空 → 根据 `compile_errors[].reason` 修正公式语法（飞书函数名 / 范围语法 / 引用样式）；确实无法表达时才降级静态值，并说明原因与不联动风险。
4. `status='errors_found'` 且只剩运行时错误 → 按 `error_summary` 的 `samples[].formula` + `depends_on` 排查根因（零除？空值参与运算？引用越界？日期差写法？数组语义？），修复后重验。
5. 同一处错误连续修复 3 次仍未通过 → 可用 `IFERROR` 兜底或退回纯值，但降级后的目标格已不再是公式；需回读确认没有残留错误公式，并在交付说明写清不随源数据更新。

注意：

- 在 `status='errors_found'` 的状态下调用 `+cells-set --copy-to-range` 继续扩展会把错误复制放大，建议先处理关键错误。
- "编译失败但运行时无报错"不是 zero-error（编译失败的单元格此刻是文本不是公式，源数据一变就再也算不出值）。
- 只靠肉眼读首末 5 行确认不可靠——表中段、隐藏行、合并区里的错误这样根本看不到；`+formula-verify` 可补充这一诊断视角。
- 只验证写入区首行不够：批量填公式后同时抽查首行、中段、尾部和汇总行；目标是发现“只填到前 N 行”“把明细公式写进合计行”“尾部仍是空/错误值”这类问题。
- 修公式时先定位根因格，再看下游链路。不要把被上游错误污染的下游格全部重写；同型公式优先从相邻正确单元格复制/改引用，写完回读下游关键格是否仍有 `#VALUE!` / `#REF!`。
- 查找/匹配公式必须有错误处理：不要裸写 `VLOOKUP` / `XLOOKUP`。未匹配时返回明确文本（如“未匹配到”），不要静默空串，除非用户明确要求空值。
- 排名/排序公式要处理空值、0 值和不参与排名项；这些项应保持空/0，而不是进入通用排名公式得到正整数名次。

## 截断与续读

后端有一个内部硬上限对总扫描单元格数做截断（不暴露给调用方），超过后立即返回 `has_more=true` + `warning_message`，`error_summary` / `compile_errors` 仅覆盖已扫描部分。处理路径：

- 关键输出区优先按 `--sheet-id` / `--sheet-name` 拆成多次调用。
- 同 sheet 内按 `--range` 切片（如先 `A1:Z200` 再 `AA1:AZ200`），逐块诊断。
- 续扫是完成条件的一部分：本次写入的公式范围必须全部拆分扫描到 `success`，不能因时间不足只在交付说明里列未覆盖范围就结束（同处置规则 2）。确实无法在本轮扫完时，按处置规则 5 对未验证公式降级为静态值并声明，而不是留下未验证的活公式。

## AI 公式校验（`--ai-only`）

飞书表格提供一个统一的 **`AI` 公式**（`=AI(prompt, [range])`，用自然语言驱动翻译 / 分类 / 情感分析 / 信息提取 / 总结 / 润色等，写法与清单见 `references/lark-sheets-formula-translation.md`）。AI 公式的写入与普通公式一致（复用 `+cells-set` / `set_cell_range`，无需特殊接口），但**计算是异步的**：写入后要等 AI 算完才有结果。普通的 `+formula-verify` 只扫本地单元格值（7 类 Excel 错误），看不到 AI 公式的计算状态。

`--ai-only` 让 `+formula-verify` 只校验 AI 公式、跳过普通公式的 Excel 错误扫描，专用于写完 AI 公式后的异步状态检查。**它必须是第一校验入口；禁止先用 `+cells-get` / `+csv-get` 轮询 AI 结果。**

- **`--ai-only` 返回字段**（机读判据以这些为准，均为整数）：
  - `ai_formula_total`——后端返回的 AI 公式汇总计数，**不是本次写入的单元格条数**（同一批写入的多个 AI 公式可能只计为 1），`--range` 也不收窄它——**认返回里的单元格定位，不要拿它和本次预期条数做等值比对**。
  - `ai_formula_done`——已算出结果的条数。
  - `ai_formula_pending_count`——仍在后台计算（`pending`）的条数。
  - `ai_formula_failed_count`——失败 / 不支持的条数。
- **异步预期**：少量 AI 公式通常很快算出结果；批量写入后部分公式仍为 `pending`（计算中）属于正常现象，飞书会在后台持续计算。
- **`--exit-on-error` 兼容**：`--ai-only --exit-on-error` 时，若 `ai_formula_failed_count > 0`，返回非 0 退出码，便于脚本 / CI 收敛。
- 可与 `--sheet-id` / `--sheet-name` / `--range` 共存，表示「只在指定范围里校验 AI 公式」。
- **普通公式不要带 `--ai-only`**：带上会跳过 7 类 Excel 错误扫描，普通公式等于没验。

**`--range` 用整个写入区间，不要抽样**：`--ai-only` 是只读操作、成本低，`--range` 应覆盖本次写入的**全部** AI 公式区间（而非代表性子集）——子集抽检会漏掉「只有列尾那批被写坏」的情况。但别把 `--range` 当过滤器用：它只透传给后端，AI-only 汇总不保证按它收窄，失败项要按返回的单元格定位核对是否落在本次写入区间内。区间过大触发截断（`has_more=true`）时按「截断与续读」拆 `--range` / `--sheet-id`。

**必经步骤：一次性公式文本核对（不是轮询）**。写完 AI 公式后，先对种子格 / 首格做**一次** `+cells-get --include formula`，确认引号 / 括号没在 shell / CSV / JSON 层被破坏、单元格里落进去的确实是 `=AI(...)` 公式而非残缺字面量或 `#ERROR`。这一步只做一次、只看文本，被禁止的只是**用 `+cells-get` 反复轮询计算结果**（结果状态一律走 `--ai-only`）。

交付判据（机读）：全写入区间内 `ai_formula_failed_count == 0`；`failed` / `unsupported` 先修完再谈交付。满足后即使仍有 `ai_formula_pending_count > 0` 也可以交付，不必轮询到全部完成；交付时告知用户"AI 公式仍在后台运行，结果会陆续完成"。另外「公式在写入层被破坏、根本没算作 AI 公式」的静默失败不会体现为 `failed`，靠上面那次公式文本核对拦住——不要指望用 `ai_formula_total` 和预期条数对数（该总数未必按 `--range` 收窄）。

`ai_formula_failed_count > 0`，或文本核对暴露出 `#ERROR`、残缺括号（如 `E2)`）、半截函数名、全角括号时，说明公式串在引号层被破坏、没作为公式写进去——不要继续等 pending，回到 `+cells-set` 用 `\"` 转义重写该格（写入范例见 `references/lark-sheets-formula-translation.md` 的 AI 公式章节）。

典型用法：

```text
# 写入一批 AI 公式后，对整个写入区间校验计算状态
lark-cli sheets +formula-verify --url <表URL> --sheet-name <子表名> --range <整个写入区间> --ai-only
# ai_formula_failed_count==0 即可交付；pending 会在后台继续计算
```

## 常见陷阱

| 坑 | 应对 |
|---|---|
| 错误字符串本地化 | 后端按内部 `error_kind` / `compute_status` 字段识别错误类别，不走字符串匹配；调用方拿到的 7 类英文错误代码由后端统一规范输出，与 locale 无关。 |
| `formatted_value` 可能隐藏错误 | 某些条件格式 / 自定义数字格式会把 `#DIV/0!` 显示成空白。后端直接读 cell `error_kind`，不依赖 `formatted_value`，绕开此类被遮蔽。 |
| 把 `partial` 当全量健康 | `partial` 仅表示**已扫描部分**无错误，剩余区域未知；缩小 ranges 或按 sheet 拆分，直到本次普通公式范围全部 success。 |
| 编译失败 vs 运行时错误 | 同一份报告里 `compile_errors[]` 与 `error_summary` 并存。语义层先解决 `compile_errors[]`、再做运行时自检。 |


<a id="s-27621128aa1e437c"></a>

## references/lark-sheets-history.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet History

## 概念回顾

每张飞书电子表格保留一串历史版本（`minor_histories`）。每个版本由 `history_version_id` 标识，并附带创建时间（`create_time`）、动作（`action`）与块修订信息（`all_block_revision`）。历史是**工作簿级**的（针对整张电子表格，不针对单个子表）。

回滚（revert）把电子表格的当前内容覆盖回某个历史版本——这是一个**高风险写入**操作，且为**异步**：发起后立即返回受理标识，真正的回滚在后台进行，需通过状态查询轮询最终结果（进行中 / 成功 / 失败）。

`+history-list` 读取版本列表以挑选目标；`+history-revert` 发起回滚；`+history-revert-status` 轮询回滚结果。若只是想拿**当前文档版本号（revision）**当作 recover / undo / `+changeset-get` 的起点锚点，直接用 `+revision-get` 更轻量。

## 使用场景

读取历史版本、发起回滚、查询回滚状态。本 reference 覆盖 3 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看历史版本列表 | `+history-list` | 返回 `minor_histories`，每条含 `history_version_id` / `create_time` / `action` / `all_block_revision` 四个字段；支持向前分页（可选 `--end-version`） |
| 回滚到指定历史版本 | `+history-revert` | 传入 `--history-version-id`；异步受理，返回可查询标识 |
| 查询回滚状态 | `+history-revert-status` | 传入 `--transaction-id`（取自 `+history-revert` 的异步受理标识）；轮询某次回滚的进行中 / 成功 / 失败状态 |

典型工作流：`+history-list` 拿到目标版本的 `history_version_id`（必要时翻页拉取更早历史）→ `+history-revert` 发起回滚并取回 `transaction_id` → `+history-revert-status --transaction-id <transaction_id>` 轮询直到成功或失败。

**注意事项（必须了解）**：
- **回滚是高风险写入操作**：会用历史版本内容覆盖当前表格，执行前应明确告知用户影响。
- **回滚是异步的**：`+history-revert` 返回的是 `transaction_id`（受理标识），不代表回滚已完成；必须用 `+history-revert-status --transaction-id <transaction_id>` 确认最终结果。
- **`history_version_id` 与 `transaction_id` 不是同一个**：`history_version_id` 用于 `+history-revert`（取自 `+history-list`）；`transaction_id` 用于 `+history-revert-status`（取自 `+history-revert` 的输出）。
- **历史是工作簿级**：定位只需 `--url` / `--spreadsheet-token`（XOR），不需要子表选择器。
- **`+history-list` 倒序分页**：首次查省略 `--end-version`，返回最新一页；若响应里附带 `next_end_version` 与 `has_more=true`，把 `next_end_version` 作为下一次的 `--end-version` 即可继续向更早翻页；当响应**不包含**这两个字段时表示已到最早一页，不必再翻。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+history-list` | read | 历史版本 |
| `+history-revert` | high-risk-write | 历史版本 |
| `+history-revert-status` | read | 历史版本 |

## Flags

### `+history-list`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--end-version` | int | optional | 分页查询的最大版本（倒序）；首次查询省略，下一页传上一页返回的 next_end_version。 |

### `+history-revert`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--history-version-id` | string | required | 要回滚到的历史版本（取自 +history-list） |

### `+history-revert-status`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--transaction-id` | string | required | 异步回滚的受理标识（取自 +history-revert） |

## Examples

公共定位：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token`（XOR，二选一）。`+history-revert` 用 `--history-version-id`（取自 `+history-list`）；`+history-revert-status` 用 `--transaction-id`（取自 `+history-revert` 的异步受理标识）。

### `+history-list`

```text
# 列出某张电子表格的最新一页历史版本
lark-cli sheets +history-list --url "https://sample.feishu.cn/sheets/SHTxxxxxx"

# 用原始 spreadsheet token 定位
lark-cli sheets +history-list --spreadsheet-token "SHTxxxxxx"

# 翻到下一页：把上次响应里的 next_end_version 作为 --end-version 传入
lark-cli sheets +history-list --url "https://sample.feishu.cn/sheets/SHTxxxxxx" --end-version 12345
```

### `+history-revert`

```text
# 回滚到指定历史版本（异步受理）
lark-cli sheets +history-revert --url "https://sample.feishu.cn/sheets/SHTxxxxxx" --history-version-id "<id-from-history-list>"
```

### `+history-revert-status`

```text
# 查询某次回滚的当前状态（进行中 / 成功 / 失败）
lark-cli sheets +history-revert-status --url "https://sample.feishu.cn/sheets/SHTxxxxxx" --transaction-id "<transaction-id-from-history-revert>"
```


<a id="s-c059a327af863d1a"></a>

## references/lark-sheets-pivot-table.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Pivot Table

## 真对象硬约束

当用户要求"透视表 / 分组汇总 / 交叉分析 / 按 X 统计 Y"时，**必须**通过 `+pivot-{create|update|delete}` 创建真实的透视表对象。**禁止**用 `SUMIFS` / `COUNTIFS` 等普通公式 + `+cells-set` 在原表中拼一张"看起来像透视表的汇总表"来代替。判断标准：交付后 `+pivot-list` 必须能返回该对象。

## 使用场景

读写透视表对象。本 reference 覆盖 4 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有透视表 | `+pivot-list` | 获取透视表的结构、数据源和配置 |
| 创建/更新/删除透视表 | `+pivot-{create|update|delete}` | 对透视表执行写入操作 |

典型工作流：先读取现有透视表了解配置 → 执行创建/更新/删除 → **必须再次读取验证结果**。

## 行/值字段映射（创建前必做）

创建透视表前先识别用户需求中的分组维度和聚合指标，**不要搞反**：

- **rows（行字段）** = 分组维度，即"按什么分组"。例：部门、地区、医生、产品类别
- **values（值字段）** = 聚合指标，即"统计什么数值"。例：销售额（聚合方式 `sum`）、订单数（聚合方式 `count`）
- **columns（列字段）** = 交叉维度（可选），即"再按什么横向展开"。例：月份、性别

| 用户说 | rows | values | columns |
|--------|------|--------|---------|
| "按部门统计人数" | 部门 | 姓名（`summarize_by: "count"`） | — |
| "按医生统计费用和结余" | 主管医生 | 费用（`"sum"`）、结余（`"sum"`） | — |
| "各部门男女人数" | 部门 | 姓名（`"count"`） | 性别 |

**常见配置错误（必须注意）**：
- **值字段类型与聚合器匹配**：`sum/average/median/product/stdDev/stdDevp/var/varp` 只用于数值列；数字个数用 `countNums`，非空记录数用 `count`。mixed 列先保留原值并新增清洗结果/失败标记，记录总数、成功、失败、空值和统计分母，再对清洗后的数值列聚合。
- **数据源范围必须精确**：透视表的数据源范围必须包含表头行，且精确覆盖全部数据行列。范围过大（包含空行/空列）或过小（遗漏数据列）都会导致透视表结果错误
- **行列字段选择要匹配用户意图**：用户说"按商品统计金额"→ 行字段=商品，值字段=金额（`summarize_by: "sum"`）。不要把行列字段搞反
- **聚合类型要匹配**：用户说"统计数量"→ `summarize_by: "count"`；"统计总额"→ `"sum"`；"统计平均"→ `"average"`。完整合法值：`sum` / `count` / `average` / `max` / `min` / `product` / `countNums` / `stdDev` / `stdDevp` / `var` / `varp` / `distinct` / `median`。按用户意图选聚合方式，不要拿 `count` 顶替 `sum`
- **`--properties` 还原生支持**：计算字段 `calculated_fields[].summarize_by ∈ {sum, custom}`、重复行标签 `repeat_row_labels: true`——别因速查表没列就判"不支持"绕路
- **参数长度限制**：如果透视表配置 JSON 过长（数据源范围跨越大量行列），可能导致工具调用失败。此时应先确认数据范围的精确边界，避免传入过大的 range
- **落点不能覆盖任何已有数据（不只是 `--source` 范围）**：透视表创建后会向右下**展开**，展开区域哪怕只盖到一个已有单元格（即便已避开源数据），也会报「目标位置不能与数据源重叠」并产生 `#REF!`。创建前无法精确预知展开尺寸，故**强烈优先默认策略**（不传 `--target-sheet-id/-name` 与 `--target-position`/`--range`，后端自动新建空白子表），零覆盖风险；非要落到已有子表，必须挑一片足够大的纯空白区
- **创建后轮询并校验**：调用 `+pivot-list --sheet-id/--sheet-name <落点表> --pivot-table-id <id>`。`Loading` / `ServiceCalcLoading` 是瞬态，继续轮询到 `info.loaded=true` 且 `error_state=None`；`Cover` / `Shrink` 等终态错误再删除重建。随后用 `info.content_range/page_range` 回读展开区，确认非空、尺寸、总计位置和用户点名的指标。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+pivot-list` | read | 对象 |
| `+pivot-create` | write | 对象 |
| `+pivot-update` | write | 对象 |
| `+pivot-delete` | high-risk-write | 对象 |

## Flags

### `+pivot-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--pivot-table-id` | string | optional | 按 id 过滤 |

### `+pivot-create`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | JSON：{"rows":[...],"columns":[...],"values":[...],"filters":[...],"show_row_grand_total":true,"show_col_grand_total":true}（数据源走 --source，不要再放进 properties.source） |
| `--target-position` | string | optional | 透视表落点子表内的起始 cell（A1 格式，如 `A1`），默认 `A1`（值为 A1 时不下发）。它与 `--range` 落在同一 wire 字段 `properties.range`，给非默认值时优先于 `--range`；两者同时给非默认值会被拒绝，只传其一 |
| `--target-sheet-id` | string | xor | 透视表落点目标子表的 reference_id（与 `--target-sheet-name` 互斥，优先于 --target-sheet-name；都不传时自动新建一张子表放置透视表——推荐）。与数据源 sheet 区分：数据源 sheet 写在 --source 的 A1 引用里（带 sheet 前缀，形如 `'Sheet1'!A1:D100`）。 |
| `--target-sheet-name` | string | xor | 透视表落点目标子表的名称（与 `--target-sheet-id` 互斥；都不传时自动新建一张子表放置透视表——推荐）。与数据源 sheet 区分：数据源 sheet 写在 --source 的 A1 引用里（带 sheet 前缀，形如 `'Sheet1'!A1:D100`）。 |
| `--source` | string | required | 透视表源数据区域（A1 表示法，格式 `'SheetName'!StartCell:EndCell`，如 `'Sheet1'!A1:D100`） |
| `--range` | string | optional | 透视表左上角放置位置（A1 单值，如 `F1`，仅 create 生效），映射到 `properties.range`；省略时放在落点子表（默认新建子表）的左上角。它与 `--target-position` 落在同一 wire 字段，两者同时给非默认值会被拒绝，只传其一 |

### `+pivot-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--pivot-table-id` | string | required | 目标透视表 id |
| `--properties` | string + File + Stdin（复合 JSON） | required | 完整或足够完整的配置（先 `+pivot-list --pivot-table-id <id>` 回读再 patch） |

### `+pivot-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--pivot-table-id` | string | required | 目标透视表 id |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+pivot-create` `--properties` / `+pivot-update` `--properties`

_创建/更新的透视表属性_

**顶层字段**：
- `range` (string?) — 放置透视表的左上角单元格 A1 地址（例如：'F1'）（仅 create 时有效） — ⚠️ 已拎为独立 flag `--range`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `source` (string?) — 源数据区域地址，格式为 'SheetName!StartCell:EndCell'（例如：'Sheet1!A1:D100'） — ⚠️ 已拎为独立 flag `--source`，请勿在此 JSON 内重复填写（同名以独立 flag 为准）
- `rows` (array<object>?) — 纵向分组字段（行字段） each: { field: string, display_name?: string, sort?: object, filter?: object, condition_filter?: object, …共 6 项 }
- `columns` (array<object>?) — 横向分组字段（列字段） each: { field: string, display_name?: string, sort?: object, filter?: object, condition_filter?: object, …共 6 项 }
- `filters` (array<object>?) — 筛选区域字段（页字段） each: { field: string, display_name?: string, filter?: object, condition_filter?: object, group?: object }
- `values` (array<object>?) — 要汇总的字段（至少需要 1 个） each: { field: string, display_name?: string, summarize_by?: enum, show_data_as?: enum, base_field?: string }
- `auto_fit_col` (boolean?) — 是否自动调整列宽以适应内容
- `show_row_grand_total` (boolean?) — 是否显示行总计（默认 true）
- `show_col_grand_total` (boolean?) — 是否显示列总计（默认 true）
- `show_subtotals` (boolean?) — 是否显示分类小计（默认 true，应用于所有字段）
- `repeat_row_labels` (boolean?) — 是否显示重复项标签
- `calculated_fields` (array<object>?) — 计算字段列表 each: { name: string, formula: string, summarize_by?: enum }
- `collapse` (object?) — 行字段展开/折叠状态：字段名 -> 要折叠的项目列表

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`，其中 `--sheet-id` / `--sheet-name` 在 `+pivot-update` / `+pivot-delete` / `+pivot-list` 上是公共四件套语义（定位透视表所在 sheet，XOR 必传一个）。

**`+pivot-create` 例外**：placement 选择器用 `--target-sheet-id` / `--target-sheet-name`（至多一个、都可省略；省略时后端自动新建子表，推荐）。数据源 sheet 写在 `--source` 的 `'SheetName'!Range` 里。

### `+pivot-list`

```text
lark-cli sheets +pivot-list --url "..." --sheet-id "$SID"
```

> **返回值含 `info`（展开后的占用区域与状态）**：每个透视表对象除 `position` / `snapshot` 外，还返回 `info`，标明它在 sheet 上的平铺区域与状态——`info.page_range`（筛选/分页区 A1）、`info.content_range`（主体数据区 A1）、`info.span_range`（空表合并区 A1）、`info.error_state`（错误状态，如 `None`/`Cover`/`Shrink`/`Loading`）、`info.is_empty` / `info.is_hidden`、`info.row`/`info.col`（锚点）等。
> **用途 1（判断改值还是改配置）**：当用户描述某个单元格要改动时，先 `+pivot-list` 拿到 `info`，判断该单元格是否落在 `page_range` / `content_range` 内——**落在区域内 = 属于透视表，应走 `+pivot-update` 改配置**（透视表单元格不能直接 `+cells-set` 改值）；**落在区域外 = 普通单元格，正常 `+cells-set` 改值**。
> **用途 2（创建后校验覆盖）**：建完后轮询 `info.loaded/error_state`；`Loading` / `ServiceCalcLoading` 继续等待，`Cover` / `Shrink` 等终态错误才表示冲突。成功后用 `content_range/page_range` 核对真实占用区域与原数据边界。

### `+pivot-create`

> 数据源 `--source` 必须从表头行开始；空行 / 汇总行会被当作数据参与聚合，需提前用 `+csv-get` 确认起止边界。`--source` 和 `--range` 是独立 flag（不要再放 `--properties`）；`rows` / `columns` / `values` 等数组字段走 `--properties`。
>
> **先理清 `+pivot-create` 上 4 个位置类入参（语义不同，别混）**：
> - `--source`（**必填**）：**源数据**区域，须自带 `Sheet!` 前缀（如 `'Sheet1'!A1:D100`，sheet 名按 A1 标准单引号包裹）。源 sheet 的名字在 `--source` 字符串里，**不**通过单独 flag 传。
> - `--target-sheet-id` / `--target-sheet-name`：**透视表的落点 sheet**（即产物放哪张子表）。两个互斥（最多传一个），都不传时后端自动新建子表存放产物（强烈推荐）。
> - `--target-position`（可选，默认 `A1`）与 `--range`（可选）都映射到 `properties.range`，表达同一落点；不要同时给两个非默认值。
>
> **落点 3 种策略（互斥，选其一）**：
> 1. **默认（强烈推荐）**：`--target-sheet-id` / `--target-sheet-name` / `--target-position` / `--range` **全都不传** → 服务端**自动新建子表**存放产物，绝不碰任何已有数据。
> 2. **放进指定的已有子表**：传 `--target-sheet-id <落点子表 id>`（或 `--target-sheet-name`），可选 `--target-position <子表内起点 cell>`。⚠️ **若落点子表就是源数据所在的 sheet**，必须配 `--target-position` 或 `--range` 指向源数据范围**之外**的位置，否则产物默认从 A1 起会盖在源数据上。
> 3. **`--range`**：跟策略 2 等价（同样需要 `--target-sheet-id` / `--target-sheet-name` 指定落点子表，不然落到自动新建子表），只是改用 `--range` 表达同一落点（与 `--target-position` 同一 wire 字段）。同样的覆盖风险，同样需要避开源数据范围。
>
> 一般用策略 1（默认新建子表）即可，零覆盖风险，无需任何 `--target-*` / `--range` flag。

```text
# 策略 1（强烈推荐）：不传任何落点 flag → 后端自动新建子表，零覆盖风险
lark-cli sheets +pivot-create --url "..." \
  --source "'Sheet1'!A1:D100" --properties @pivot.json

# 策略 2：落进指定的已有目标子表（注意目标 sheet ≠ 源 sheet，否则要配 --target-position 避开源数据）
lark-cli sheets +pivot-create --url "..." \
  --source "'Sheet1'!A1:D100" --target-sheet-id "$DEST_SID" --target-position "A1" --properties @pivot.json
```

### `+pivot-update`

> 不允许改落点 range；更新配置前先 `+pivot-list --sheet-id/--sheet-name <落点表> --pivot-table-id <id>` 回读完整 snapshot，再 patch rows / columns / values / filters。需要切换数据源时，可在 `--properties` 中提供新的 `source`。

### `+pivot-delete`

```text
lark-cli sheets +pivot-delete --url "..." --sheet-id "$SHEET_ID" --pivot-table-id "$PIVOT_TABLE_ID" --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：`--url` / `--spreadsheet-token` XOR 必填；update/delete/list 的 `--sheet-id` / `--sheet-name` XOR 必填；create 的 target selector 至多一个、可都省略；`--source` 与合法 `--properties` 必填；delete 强制 `--yes` 或 `--dry-run`。schema 校验类型与枚举，但允许创建空壳配置，业务完整性须靠创建后 list/data 验证。
- `DryRun`：输出将发送的 pivot 请求模板和本地 placement_warning；不联网、不预估实际展开尺寸。
- `Execute`：写后不自动回读；create/update 后必须按落点 sheet + pivot id 轮询 `+pivot-list` 到 loaded，核 error_state/content_range 与数据；delete 后 list 确认目标不存在。

> ⚠️ pivot 输出包含总计 / 小计行；后续 chart 引用 pivot 时，`snapshot.data.refs` 必须排除这些行（见 `references/lark-sheets-chart.md` 的「⚠️ chart 数据源引用 pivot 时必须排除总计行」段）。


<a id="s-cf7b82ddfd441386"></a>

## references/lark-sheets-range-operations.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Range Operations

## 结构性操作影响面预检（清除 / 合并 / 排序 / 移动前必做）

`+cells-clear`、`+cells-{merge|unmerge}`、`+range-{move|copy|fill|sort}`（移动 / 复制 / 排序 / 自动填充）都会让既有引用关系发生偏移或失效。**操作前必须**先确认以下两点；否则禁止执行：

1. **打印当前合并单元格 + 公式引用 + 数据验证范围**：用 `+sheet-info --include merges` + `+cells-get` 抽样目标区域和它周边的公式 / 透视表 / 图表 / 条件格式 / 筛选器的数据源；评估操作后这些引用是否仍指向正确数据。
2. **`+cells-clear` 不得侵入用户授权范围之外**：清除范围只能是用户明示要清的区域；不要顺手清除"看起来没用"的相邻单元格。

排序场景的存储类型识别 + 辅助列抽数值的细则见下方「sort 操作前必读」章节。

## 使用场景

写入。对指定区域执行结构性操作。本 reference 覆盖 9 个 shortcut，按 4 类用途组织：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 清除内容/格式 | `+cells-clear` | "清空"、"删除内容"、"去掉格式" |
| 合并/取消合并单元格 | `+cells-{merge|unmerge}` | "合并单元格"、"取消合并" |
| 调整行高/列宽 | `+rows-resize / +cols-resize` | "加宽列"、"调整行高"、"自适应列宽" |
| 移动/复制/填充/排序 | `+range-{move|copy|fill|sort}` | "移动数据"、"复制到"、"自动填充"、"按某列排序" |

注意：

- **`--range` 两种语法别混**：`+cells-clear` / `+cells-{merge|unmerge}` / `+range-*` 用单元格 A1 矩形（如 `A2:A10`）；`+rows-resize` / `+cols-resize` 用纯行 / 列区间（行 `2:10`、列 `A:C`），不要给 resize 传 `A2:A10`
- 用户说"这行 / 整行 / 首行"时，优先使用整行范围如 `1:1`；"这列 / 整列"时使用 `J:J`。不要截断为局部矩形
- 合并后只保留左上角单元格的内容，其余清除。写入合并区域用 `+cells-set` 对左上角单元格操作
- 调整行高列宽时，先读取相邻行列尺寸再决定像素值，不要随意猜测
- `--copy-to-range`（`+cells-set` 的参数）复制的是值/公式/样式，不含行高列宽。需要统一尺寸时另行调用 `+rows-resize / +cols-resize`

**排序必须覆盖完整记录宽度**：`+range-sort --range` 是整行记录原子移动的边界，必须从记录第一列覆盖到最后一列；“按 B 列排序”只表示 `--sort-keys` 选 B，不是把 range 写成 `B:B`。范围含表头时加 `--has-header`。排序后回读前几行和末行，确认各列仍保持同行关系。

## 写入后列宽自适应（防内容遮挡）

写入文本 / 数值后**必须**主动检查列宽是否适配，否则会出现"内容被截断 / 长数字显示为科学计数法 / 文本溢出被相邻列遮挡"等用户感知问题：

1. **写入后回读最长内容字符数**：用 `+csv-get` 读目标列的实际写入内容，统计最长单元格的字符数（`max(len(cell) for cell in col)`）。汉字按 2 字符宽度估算，半角字母数字按 1 字符。
2. **判定阈值**：当前列宽（用 `+sheet-info --include row_heights,col_widths` 拿）≥ 最长字符数 × 字体宽度系数 + buffer 才算适配。默认列宽 11 通常只够 11 个半角字符或 5-6 个汉字，写长文本前必扩宽。
3. **修复二选一**：
   - **扩列宽**：用 `+rows-resize / +cols-resize` 把目标列宽设为 `max(表头字符数, 内容采样最长字符数) × 8 + 16` 像素（经验值）
   - **自动换行**：在 `+cells-set` 时给单元格设置 `cell_styles.word_wrap="auto-wrap"`（可选值：`overflow` / `auto-wrap` / `word-clip`；`cell_styles` 字段见 `references/lark-sheets-write-cells.md`），并用 `+rows-resize / +cols-resize` 调高对应行的行高
4. **新增列默认列宽规则**：新增列宽度 ≥ `max(表头字符数, 内容采样最长字符数) × 8 + 16` 像素，**禁止**用默认 11 直接交付。

**典型反例**：默认列宽 11 但内容含 12+ 字符的中文 / 含单位的数值（如 `109.10μmol/L`）/ 长数字未设 `number_format` 显示为科学计数法 —— 用户在结果表里看不到完整原值。

**打印场景控制总宽（用户说"适合打印 / A4 / 打印范围"时必做）**：扩单列宽防截断的同时，**所有列宽之和要落在纸张可打印宽度内**——A4 横向约 ≤ 102 个半角字符（约 1000px），纵向约 ≤ 70 个字符。超宽时不要无限加宽，改用 `cell_styles.word_wrap="auto-wrap"` + 调高行高，或缩窄非关键列，让整表在一页内（反例：总列宽远超 A4 可打印宽度，且长文本行高不够被截断）。

**只加宽承载新内容的列，不改动原有列的列宽**：列宽自适应**只针对新增 / 真正放不下新内容的列**；原表已有列的列宽**禁止重新计算、禁止缩小**——即便你估算的"理想宽度"与原值不同，只要原内容没被截断就不要动它。无差别地把所有列重设一遍宽度（哪怕只 ±1）都属于破坏原文件视觉格式（反例：填完数据后顺手把原有列的列宽从 16 改成 17，与原附件不一致，破坏了原视觉格式）。

**⚠️ 合并单元格安全操作规则**（`+cells-{merge|unmerge}` 必读）：

1. **先读后写**：操作前必须用 `+sheet-info --include merges` 或 `+cells-get` 识别已有合并区域（特征：多个连续单元格中只有左上角有值，其余为空）。
2. **不要对已合并区域重复 merge**：对已合并的区域再次调用 merge 会报错或产生不可预期结果。
3. **修改合并区域的正确顺序**：先 `unmerge` → 修改内容/样式 → 再 `merge`。
4. **对合并区域设置样式**：只对完整 range 设置一次 `cell_styles`（写在左上角单元格），其余位置用 `{}` 占位。
5. **新增合并时数据保护**：合并前确认目标区域只有左上角有数据，其余单元格为空，否则合并会导致非左上角的数据丢失。
6. **批量取消合并一次调用即可**：当一个范围（整列 `A:A`、整行 `3:3`、矩形 `A1:D100`）内存在多个合并区域，直接调一次 `+cells-unmerge` 传入这个大范围，会一次性取消该范围内所有合并区域；**不要**为每个合并区域单独调用 unmerge，也不要用 `+batch-update` 拆成多次 unmerge。
7. **合并 / 取消合并后必须验证**：`+sheet-info --include merges` 核目标范围，再 `+cells-get` 回读左上角值和非左上角清空状态。

**⚠️ 多区域合并不要逐个调用**：对**多个**不同区域执行 `+cells-merge` 时，写成一份 `+styles-put --styles` 的 `cell_merges` 一次交付（合并与样式 / 行高列宽 / 冻结同属一份声明式规格，见 `references/lark-sheets-styles-put.md`）；只有当合并夹在**跨类型、有顺序依赖**的操作链里（如插列 → 合并 → 写表头）才用 `+batch-update`（fail-fast，失败处置与入参格式见 `references/lark-sheets-batch-update.md`）。行高列宽同理**不需要** `+batch-update`：多行 / 多列不同尺寸直接用 `+rows-resize --heights` / `+cols-resize --widths` 的 map 形态，一次调用完成。

**唯一例外**：`+cells-unmerge` 原生支持传一个大 range 一次性取消其中所有合并区域，应直接单次调用，**不要**拆进 `+batch-update`。

**⚠️ sort 操作前必读：确认目标列的数据类型**

排序按单元格的**存储类型**比较：纯数字按数值排序；文本字符串按**字典序**（`"1000"` 排在 `"999"` 之前，与数值相反）；日期按时间戳排序。

以下形态**看起来像数字但实际是字符串**，直接 sort 会得到错误结果：

| 示例 | 说明 |
|------|------|
| `843688.69+20042.35=863731.04` | 表达式文本（无前导 `=` 不是公式，整串按字典序比较） |
| `¥1,234.56` / `$1,234` | 带货币符号 |
| `1.2万` / `3.5亿` / `100kg` | 带中文 / 英文单位 |
| 前后含空格或不可见字符的数字串 | 被当文本 |
| 同列混文本和数字 | 排序后分块 |

**硬性流程**：

1. sort 前先用 `+csv-get` 抽样目标列的前 3–5 行确认原始值形态，不要只看列名和用户问题就直接排。
2. 若是纯数字或日期 → 直接 sort。
3. 若是带符号 / 表达式 / 单位的文本 → **不要直接排，也不要读值后用 `+csv-put` 覆盖原表来模拟排序**：
   - 简单场景（货币、千分位、单位前缀）：新增辅助列，用公式提取数值（如 `=VALUE(SUBSTITUTE(SUBSTITUTE(A2,"¥",""),",",""))`），再用 `+range-sort` 按辅助列原子排序；排完可按需删除辅助列。
   - 复杂场景（多段表达式、中文单位、混合格式）：先写辅助数值列，再用 `+range-sort`；无法可靠提取时保留原顺序并说明，禁止整块覆盖回写。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+cells-clear` | high-risk-write | 单元格 |
| `+cells-merge` | write | 单元格 |
| `+cells-unmerge` | write | 单元格 |
| `+rows-resize` | write | 工作表 |
| `+cols-resize` | write | 工作表 |
| `+range-move` | write | 区域 |
| `+range-copy` | write | 区域 |
| `+range-fill` | write | 区域 |
| `+range-sort` | write | 区域 |

## Flags

### `+cells-clear`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 清除范围（A1 格式） |
| `--scope` | string | optional | 清除范围 enum：`content`（默认，仅清内容）/ `formats`（仅清格式）/ `all`（清内容 + 格式）（可选值：`content` / `formats` / `all`） |

### `+cells-merge`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 待合并 / 取消合并的范围（A1 格式） |
| `--merge-type` | string | optional | 合并方向（仅 `+cells-merge`）（可选值：`all` / `rows` / `columns`）（默认 `all`） |

### `+cells-unmerge`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 待合并 / 取消合并的范围（A1 格式） |

### `+rows-resize`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--height` | int | xor | 统一行高（像素，例：30 / 40 / 60；不是磅/points），配 `--range` 使用。传了 `--height` 就是像素模式，可以省略 `--type`；显式 `--type pixel` 也行（等价）。多行不同高用 `--heights` |
| `--heights` | string + File + Stdin（复合 JSON） | xor | 差异化行高 map，一次调用给多行设置不同高度：键为单行（`"1"`）或行闭区间（`"2:20"`），值为像素高（如 30 / 50）、`"auto"`（自适应内容）或 `"standard"`（重置默认）。⚠️ 单位是像素，不是磅/points。与 `--range` / `--height` / `--type` 互斥 |
| `--type` | string | xor | 尺寸方式 enum：`pixel`（需配 `--height`）/ `standard`（重置为默认行高）/ `auto`（自动适应内容）。常规写法直接给 `--height` 即可省略本 flag；`--type standard` / `--type auto` 不能与 `--height` 同时给（可选值：`pixel` / `standard` / `auto`） |
| `--range` | string | xor | 要调整行高的行闭区间；1-based 行号如 `2:10` 或单行 `5`。统一尺寸形态必填（配 `--height` 或 `--type`）；map 形态（`--heights`）不传 |

### `+cols-resize`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--width` | int | xor | 统一列宽（像素，例：80 / 120 / 200；不是 Excel 字符单位），配 `--range` 使用。传了 `--width` 就是像素模式，可以省略 `--type`；显式 `--type pixel` 也行（等价）。多列不同宽用 `--widths` |
| `--widths` | string + File + Stdin（复合 JSON） | xor | 差异化列宽 map，一次调用给多列设置不同宽度：键为单列（`"A"`）或列闭区间（`"C:E"`），值为像素宽（如 80 / 120 / 200）或 `"standard"`（重置默认）。⚠️ 单位是像素，不是 Excel 字符单位（像素 ≈ 字符数×8+16）。与 `--range` / `--width` / `--type` 互斥 |
| `--type` | string | xor | 尺寸方式 enum：`pixel`（需配 `--width`）/ `standard`（重置为默认列宽）。常规写法直接给 `--width` 即可省略本 flag；`--type standard` 不能与 `--width` 同时给（可选值：`pixel` / `standard`） |
| `--range` | string | xor | 要调整列宽的列闭区间；列字母如 `A:E` 或单列 `C`。统一尺寸形态必填（配 `--width` 或 `--type`）；map 形态（`--widths`）不传 |

### `+range-move`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--source-range` | string | required | 源 A1 范围 |
| `--target-sheet-id` | string | optional | 目标子表 id；省略时同源 sheet |
| `--target-range` | string | required | 目标 A1 范围（传起点 cell 即可，按源尺寸自动推断） |

### `+range-copy`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--source-range` | string | required | 源 A1 范围 |
| `--target-sheet-id` | string | optional | 目标子表 id；省略时同源 sheet |
| `--target-range` | string | required | 目标 A1 范围（传起点 cell 即可，按源尺寸自动推断） |
| `--paste-type` | string | optional | 粘贴内容（仅 `+range-copy`）（可选值：`values` / `formulas` / `formats` / `all`）（默认 `all`） |

### `+range-fill`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--source-range` | string | required | 填充模板范围（系列起始 cells） |
| `--target-range` | string | required | 目标填充范围（A1 格式） |
| `--series-type` | string | optional | 填充序列类型（可选值：`auto` / `linear` / `growth` / `date` / `copy`）（默认 `auto`） |

### `+range-sort`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 排序范围（A1 格式；含或不含表头由 `--has-header` 决定） |
| `--sort-keys` | string + File + Stdin（复合 JSON） | required | JSON 数组：`[{"column":"<列字母>","ascending":<bool>}, ...]` |
| `--has-header` | bool | optional | 第一行是表头不参与排序，默认 false |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+rows-resize` `--heights`

_行 → 高度 map_
- type: object

### `+cols-resize` `--widths`

_列 → 宽度 map_
- type: object

### `+range-sort` `--sort-keys`

_排序条件列表（仅 sort 操作）_

**数组项**（类型 object）：
- `column` (string) — 排序依据的列字母（如 "C"、"D"），必须在 range 范围内
- `ascending` (boolean) — 是否升序排序

## Examples

> ⚠️ 本 reference 派生的 shortcut 跨 3 个分组：`+rows-resize` / `+cols-resize` → 工作表，`+cells-*` → 单元格，`+range-*` → 区域。这里统一从区域操作视角讲解。

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。

### `+cells-clear`

> ⚠️ **`--scope all` 清整表是不可逆的大范围破坏**：会一并抹掉该区域的合并单元格、原公式，以及图表 / 透视表引用的数据源列（这类列常在主数据区右侧，视觉上"看着没用"却被图例 / 系列引用）。**"美化 / 规范化一张已有表"永远不需要 clear 原表再重写**——若你打算"清空原表 → 写入重排后的版本"，说明走错了路径，应改为原地只刷样式（见 `references/lark-sheets-visual-standards.md` 场景三）。

> **删不掉嵌入对象**：`+cells-clear`（任何 `--scope`，含 `all`）只清单元格的值 / 格式，**删不掉**压在范围内的透视表 / 图表等嵌入对象——后端会报 `can not find embedded block`。删透视表用 `+pivot-delete`、删图表用 `+chart-delete`（先用 `+pivot-list` / `+chart-list` 拿对象 id）。

> 需要一次清除**多个不连续 range**（如把内容搬走后批量去掉散落各处的边框/底色）时，改用 `references/lark-sheets-batch-update.md` 的 `+cells-batch-clear`，避免对 `+cells-clear` 逐个 range 调用。

```text
# dry-run 先看
lark-cli sheets +cells-clear --url "..." --sheet-id "$SID" --range "A2:Z1000" --scope all --dry-run
# 执行
lark-cli sheets +cells-clear --url "..." --sheet-id "$SID" --range "A2:Z1000" --scope all --yes
```

### `+cells-merge` / `+cells-unmerge`

```text
# 合并 A1:C1（可选 --merge-type all/rows/columns）
lark-cli sheets +cells-merge   --url "..." --sheet-id "$SID" --range "A1:C1"
# 取消合并：传大 range 一次性取消其中所有合并区域
lark-cli sheets +cells-unmerge --url "..." --sheet-id "$SID" --range "A1:C100"
```

### `+rows-resize` / `+cols-resize`

行高列宽分两条 shortcut，避免行 / 列在底层 schema 的差异（行支持 `auto`，列不支持）混在一起。两种形态：

- **统一尺寸**：`--range` + `--height`/`--width <px>`（省略 `--type`，等价于 `--type pixel`）。非像素模式走 `--type standard` / `--type auto`，此时不能再带像素值。
- **差异化尺寸**：`--heights`/`--widths` 一个 JSON map，键为单行/列或闭区间、值为像素或模式字符串，**一次调用完成多行 / 多列不同尺寸**——不要拆多次调用，也不要用 `+batch-update`。

```text
# 统一尺寸：把第 2-10 行设为固定 30 px
lark-cli sheets +rows-resize --url "..." --sheet-id "$SID" --range "2:10" --height 30

# 统一尺寸：把 A-C 列设为固定 120 px
lark-cli sheets +cols-resize --url "..." --sheet-id "$SID" --range "A:C" --width 120

# 差异化尺寸：多列不同宽，一次调用（值可混用 "standard" 重置某列）
lark-cli sheets +cols-resize --url "..." --sheet-id "$SID" \
  --widths '{"A": 100, "B": 358, "C:E": 120, "G": "standard"}'

# 差异化尺寸：多行不同高，值可混用 "auto" / "standard"
lark-cli sheets +rows-resize --url "..." --sheet-id "$SID" \
  --heights '{"1": 50, "2:20": 30, "21": "auto"}'

# 第 1 行行高自动适应内容（列宽不支持 auto）
lark-cli sheets +rows-resize --url "..." --sheet-id "$SID" --range "1" --type auto

# 重置 A-E 列为默认列宽
lark-cli sheets +cols-resize --url "..." --sheet-id "$SID" --range "A:E" --type standard
```

**⚠️ 单位是像素，不是 Excel 字符单位 / 磅**：列宽常见 60~400px；如果你按 Excel 字符单位（openpyxl / xlsxwriter 的 `width`）心算，先换算 `px ≈ 字符数 × 8 + 16`——写 `{"A": 10}` 得到的是 10px 的不可用窄列（CLI 会拒绝 < 20px 的列宽并提示换算）。行高是像素不是磅（points），默认行高约 24px。

**列宽没有 auto-fit**：需要"列宽自适应内容"时，按"写入后列宽自适应"一节的公式估算像素值（`max(表头字符数, 内容最长字符数) × 8 + 16`）后用 `--widths` 显式设置。

> 同时出现在 `references/lark-sheets-sheet-structure.md` —— 行高 / 列宽调整也算行列结构层动作。

### `+range-move` / `+range-copy`

> `+range-move` 会**清空源区域**（move = copy + clear_source）；`+range-copy` 不动源。

### `+range-fill`

```text
# 用 A1:A2 的序列规律向下填充到 A3:A100（target 区域不能与 source 重叠，否则后端报 source overlaps destination）
lark-cli sheets +range-fill --url "..." --sheet-id "$SID" --source-range "A1:A2" --target-range "A3:A100" --series-type auto
```

### `+range-sort`

```text
# 按 C 列降序排 A1:E100（首行为表头不参与）
lark-cli sheets +range-sort --url "..." --sheet-id "$SID" --range "A1:E100" --has-header --sort-keys '[{"column":"C","ascending":false}]'
```

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+cells-clear` 强制 `--yes` 或 `--dry-run`；`+range-*` 校验源 / 目标 range 在同一 spreadsheet；`+range-sort` 的 `--sort-keys` 必须合法 JSON 数组且 col 都在 `--range` 内；`+rows-resize` / `+cols-resize` 两种形态二选一——统一形态必须给 `--range` 且至少给 `--height`/`--width` 或 `--type` 之一（`--type standard`/`auto` 不能与像素 flag 同给，`--type pixel` 共存 OK），map 形态（`--heights`/`--widths`）不能与 `--range`/`--height`/`--width`/`--type` 混用，map 键必须与命令维度一致（行数字 / 列字母）、不得重复，值为正整数像素或模式字符串；列宽 < 20px 拒绝（疑似 Excel 字符单位）；`+cols-resize` 不接受 `auto`（列宽不支持自适应）。map 形态在 `+batch-update` 子操作里不可用（它本身就是批量提交）。
- `DryRun`：所有写操作输出"将要 PATCH 的 range + 受影响 cell 数估算"。
- `Execute`：sort/move/copy/fill 后回读首、中、末记录；merge/unmerge 后 `+sheet-info --include merges` + `+cells-get` 核范围、左上角值与边界；clear 后确认目标 scope 已空；resize 结果用 `+sheet-info` 核尺寸，不能只读 cell 值。


<a id="s-33aa01802edb4628"></a>

## references/lark-sheets-read-data.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Read Data

## 列格式多样性预探（写公式 / 排序 / 筛选前必做）

> 本节给出"写公式 / 排序 / 筛选前先探清列格式多样性"的正确流程，是主 SKILL.md「飞书表格编辑准则」准则 3（读全再写）在 read_data 工具层的落地。

对参与后续**计算 / 排序 / 筛选 / 公式提取**的列，**必须**先 sample **至少 50 行**（小表则全量），识别该列所有值类型变体后再设计公式 / 条件。只看前 10 行不够，因为下列差异通常潜伏在表尾或中段：

- **日期列同时出现多种格式**：`YYYYMM`、`YYYY-MM-DD`、`YYYY/M/D`、带时间戳、文本"未知"
- **数值列混入公式文本 / 单位 / 注释**：`1000+200=1200`、`100元`、`/（合同未明确）`、`#N/A`
- **空值与 0 / "0" 混杂**
- **大小写 / 全角半角差异**（"办公费" vs "办公费 "、"Sales" vs "sales"）

预探后必须在公式 / 筛选条件里用 `IFERROR` / `IFS` / 提取数值的辅助列处理所有变体；不能为了通过 head(10) 的样本就直接落地。设计的逻辑只覆盖 sample 中出现的格式，在 sample 外的行必然出错。

⚠️ **大数字（15 位以上的身份证 / 参考号 / 流水号）做去重 / 比较时禁止用 `+csv-get` 的显示值**：`+csv-get` 返回的是**格式化显示值**，15 位以上数字会被显示成 `1.04E+14` 这类科学计数法——多个本不相同的号在显示层全变成同一个 `1.04E+14`，拿去判重会**整列误判为重复**。比较 / 去重 / 匹配大数字时必须改用 `+cells-get`（取原始精确值）或把该列读为文本，禁止用 csv-get 的科学计数显示值（反例：大批长参考号被显示成科学计数后，互不相同的号全变成同一个值，被当成整列重复并错误高亮）。

## 使用场景

读取。从飞书表格中读取单元格数据。本 reference 覆盖 4 个 shortcut，按读取目的选择：

| 读取目的 | 用这个 shortcut | 数据去向 | 说明 |
|---------|----------------|---------|------|
| 快速查看纯值数据、批量处理 | `+csv-get` | 对话上下文 | 返回 CSV 文本（每行带 `[row=N]` 前缀）；大表请按 `--range` 行窗口分批读（截断时看 `has_more`） |
| 按列类型结构化读出（喂 DataFrame / round-trip 回 `+table-put`） | `+table-get` | 对话上下文 | 返回 typed 协议（`columns:[列名]` + `data` + `dtypes`/`formats` + `range`），输出形状对齐 pandas split；可一行 `pd.DataFrame(sheet["data"], columns=sheet["columns"]).astype(sheet["dtypes"])` 还原 DataFrame，或直接 round-trip 回 `+table-put`。不带 `--range` 时读**完整 used range**（跨过表中部空行 / 空列），每个子表回传读取范围 `range`；被 `max_chars` 裁掉时**该子表**带 `truncated: true` 与 `truncation_warning`，预算耗尽导致后续整表未读时**顶层**也带同组字段，`--output-path` 落盘模式另看 stdout 回执的 `complete` / `truncated`——**先看截断字段再用数据；三层都没报也不等于逻辑读全**，仍要用返回数据实际行数、关键末行与源数据交叉核对（详见下文）。注意这与下文 `current_region` "遇表中部空行截断"不矛盾：`+table-get` 读的是子表物理 used range（飞书记录的已用矩形，含中间空行），`current_region` 是从锚点连通扩展、遇整行空行就断 |
| 查看公式、样式、批注、数据验证 | `+cells-get` | 对话上下文 | 返回单元格完整信息，token 开销较大 |
| 查看某区域的下拉框（数据验证）配置 | `+dropdown-get` | 对话上下文 | 返回该 A1 范围的下拉选项、多选开关和胶囊配色 |

**选择原则**：
- 只看值或做数据处理 → `+csv-get`；大表分批读取，避免一次拉全表撑爆上下文
- 要按列类型结构化读出（喂 DataFrame / round-trip 回 `+table-put`）→ `+table-get`
- 需要公式/样式/批注 → `+cells-get`
- 查看某区域下拉框的选项、多选开关或胶囊配色 → `+dropdown-get`

## 读表理解脚本（Agent 优先入口）

当目标是"先理解表格内容 / 结构 / 子表边界"，且本地存在 `scripts/lark_*.py`（只随仓库版 skill 分发，二进制内嵌版不含 `scripts/`），可优先用这组只读脚本，再决定是否直接调用上述 shortcut。脚本是可选捷径，不是必经入口——脚本不可用时直接按下表右列的 CLI 等价路径执行：如果任务很小，或需要公式 / 样式 / 批注 / 精确原始值等脚本未覆盖的信息，可以直接用 CLI 做等价或更精细读取。

| 脚本 | 底层 shortcut | 适用场景 |
| --- | --- | --- |
| `scripts/lark_inspect_workbook.py` | `+workbook-info` / `+sheet-info` / `+csv-get` | 飞书表格第一步预检：输出所有 sheet summary、布局、预览和 `data.selection`；未点名时仅从 `resource_type=sheet && is_hidden=false` 的 visible_grid 候选中选，唯一才自动使用，多候选不得按 index 猜。 |
| `scripts/lark_detect_subtables.py` | `+workbook-info` / `+sheet-info --include merges,hidden_rows,hidden_cols` / 小窗口 `+csv-get` | 同一 sheet 可能有多个表格区域、汇总块、备注块时，在**已知且未截断的窗口**内识别候选子表 range |
| `scripts/lark_profile_table.py` | `+csv-get` / `+sheet-info --include hidden_rows,hidden_cols`（默认包含隐藏行列时；必要时再手工 `+cells-get` / `+table-get`） | 对**已确认且未截断的候选 range**做表头、数据范围、列类型、特殊行画像，并输出 `summary` / `field_map` / `risk_warnings` / `write_hints` |

`lark_profile_table.py` 是**启发式画像**，不是最终判定器：它能降低手工数行列和漏看特殊行的风险，但表头、多行标题、数据末行、列类型、特殊行和追加列都可能需要二次确认。批量写入、公式、排序、筛选、去重、透视/图表等操作前，不能只凭 profile 结果直接写；必须把 profile 输出与任务语义、样本值、必要的 CLI 补读一起核对。

`lark_profile_table.py` 的使用口径：

| 任务类型 | 建议 |
| --- | --- |
| 只读取或修改用户明确指定的单个单元格 / 很小范围，且不需要理解整表 | 可直接用 CLI |
| 批量写入、公式 / 计算、排序、筛选、删除、仅保留、去重、lookup / 匹配、条件高亮、透视表、图表、汇总 | 优先对目标区域运行 `lark_profile_table.py`；若已用等价 CLI 明确确认表头、数据范围、字段列、列类型和特殊行，可跳过脚本。去重 / lookup 若目标列含 `long_numeric_like_id`、前导 0 或格式化数字，profile 只能定位列，比较值必须改用 `+cells-get` 或 `+table-get` |
| 多块表、表头不确定、存在合并 / 汇总 / 空行 / 备注块、选区是单格但任务语义是整表 | 先 `lark_detect_subtables.py` 或补充 CLI 确认候选范围，再对目标 range 跑 `lark_profile_table.py` |
| 需要公式、样式、批注、数据验证、精确原始值、长数字 ID 精确比较 | 先用脚本形成结构化理解，再按需补 `+cells-get` / `+table-get` / 分批 `+csv-get` |

推荐链路（大表先定窗口，脚本不接受截断结果）：

```text
python3 scripts/lark_inspect_workbook.py --url "<表格URL>"
# 先用 +workbook-info 和小窗口 +csv-get 确认真实 sheet、列边界和起始区域；大表按行窗口推进。
python3 scripts/lark_detect_subtables.py --url "<表格URL>" --sheet-name "<子表名>" --range "A1:H200"
python3 scripts/lark_profile_table.py --url "<表格URL>" --sheet-name "<子表名>" --range "A1:H200"
```

`lark_detect_subtables.py` / `lark_profile_table.py` 的 `+csv-get` 命中 `has_more` 会以错误退出并报告已读取的 `actual_range`，绝不基于半截数据给出候选范围或画像。遇到此错误，以 `actual_range` 为已完成窗口，缩小列数或从其末行之后继续读；跨窗口的候选范围、汇总行和写入落点必须再用 CLI 核对，不能把单个窗口结果当整表结论。

脚本只读，不做任何写入。它们的输出用于降低 token 和定位错误；后续需要公式、样式、批注、精确原始值时，仍按本文件规则直接调用 `+cells-get` / `+table-get` / `+csv-get`。写入前如果使用了 `lark_profile_table.py`，至少读取并使用这些字段：`summary.header_row`、`summary.data_range`、`summary.data_row_segments`、`field_map`、`risk_warnings`、`visibility`、`write_hints.safe_append_col` 和 `special_rows`。仅当 `risk_warnings` 不含 `data_range_has_gaps` 时，才可把 `data_range` 当连续写入范围；有缺口时按 `data_row_segments` 分段读写。

脚本关键 flag：

| Flag | 脚本 / 默认 | 何时调整 |
| --- | --- | --- |
| `--skip-hidden` | profile / detect，关闭（默认包含隐藏行列） | 只分析可见数据时开启；此时必须使用 profile 的 `data_row_segments`，不要把连续 `data_range` 直接用于写入。 |
| `--max-chars` | inspect `8000`；profile / detect `25000` | 输出过大时缩小范围或降低值；profile / detect 若截断会报错并给 `actual_range`，按窗口继续。 |
| `--header-scan-rows` | profile `20` | 表头前有多行标题、说明或空行时提高；过大时结合 `possible_multi_row_header` 补读确认，不要仅凭评分结果写入。 |
| `--max-sheets` | inspect `3` | 未指定 sheet 时仅前 N 个 sheet 带 layout / preview，其余仍返回摘要并在 warnings 说明。 |
| `--max-merge-components` | detect `2000` | 超限会跳过 gap 合并并告警；需缩小窗口或人工复核子表边界。 |
| `--gap-rows` / `--gap-cols` | detect `1` / `0` | 子表被切碎或粘连时调整；每次调整后复核候选范围。 |

detect 最多确认 10 个跨窗口合并锚点；超限会在 `warnings` 中说明跳过的数量。遇到该 warning，缩小扫描窗口后再复核受影响的子表边界。

`lark_profile_table.py` 输出触发补读的规则：

- `risk_warnings` 非空时，不要把画像当最终事实；按下表补读或调整，不在表内的 warning 也先保守复核。

| Warning | 必做动作 |
| --- | --- |
| `mixed_value_types` / `long_numeric_like_id` / `formula_or_value_errors` | 补 `+cells-get` 或 `+table-get`，确认原始值、类型和公式。 |
| `duplicate_headers` / `unnamed_columns` / `header_not_detected` / `header_row_not_first` / `many_empty_cells` | 补 `+csv-get` 读取表头附近和空值样本，确认真正表头与字段列。 |
| `data_range_not_detected` / `special_rows_present` / `empty_rows_present` | 补 `+csv-get` 读取尾部和特殊行样本，确认有效数据末行。 |
| `possible_multi_row_header` | 补读表头上下各 1-2 行；必要时 `+sheet-info --include merges` 核对跨列合并。 |
| `hidden_rows_in_range` / `hidden_columns_in_range` | 写入前用 `+sheet-info --include hidden_rows,hidden_cols` 确认是覆盖还是跳过隐藏内容。 |
| `data_range_has_gaps` | 不按连续 `data_range` 写；用 `summary.data_row_segments` 对每个实际读取行段单独读写。 |
| `data_range_has_col_gaps` | 返回的列不连续（`--skip-hidden` 跳过了隐藏列）；不要把 `data_range` 当连续列区写回，按 `summary.data_col_segments` 分列段处理，否则缺口右侧的值会整体错位。 |

- `write_hints.safe_append_col` 只是候选追加列，不代表绝对安全。新增列或覆盖区域前，必须用 `+csv-get` / `+cells-get` / `+sheet-info` 核对该列为空、没有隐藏列/公式/样式/对象依赖，且符合用户要求的落点。该字段已自动跳过隐藏列（跳过的列名列在 `write_hints.skipped_hidden_cols`）——注意 `--skip-hidden` 下隐藏列根本不出现在返回网格里，若它们正好都贴在数据右边缘，`data_range_has_col_gaps` 也不会告警，所以这层跳过是唯一的保护，别绕过它自己按「最后一列 +1」推落点。

⚠️ **解析 CLI 输出只读 stdout**：数据走 stdout、诊断与警告走 stderr，解析 JSON 时别用 `2>&1` 合流（警告混进去会解析失败），用管道或单独重定向 stdout。命令失败先读 stderr 再调整，别原样重发。

⚠️ **大数据优先落盘、别灌进上下文**：`+csv-get` / `+cells-get` 都受调用方 Bash / 终端的单命令 stdout 输出上限约束（常见默认约 30000 字符，超过会被截断或转存为文件）。纯值分析优先用 `+csv-get` 按 `--range` 行窗口（`A1:Z500` / `A501:Z1000` …）分批重定向到文件 + 本地脚本处理 + `+csv-put` 分批回写；若确实要让结果直接进上下文又不想触发转存，给任一命令把 `--max-chars`（默认 500000）调小到略低于该上限（如 `25000`），CLI 改为优雅截断 + `has_more` 分页。

> **落盘不等于读全**：`--output-path` 只是把上限从 stdout 口径放宽到有界的 2000 万字符（读取链路非流式，该上限是内存保护），不是无限。stdout 回执带 `complete` 字段——`complete:false` 时另有 `truncated` 与提示，文件里只有半截数据；多子表读取还会给 `unread_sheets` 列出预算耗尽前没读到的子表。**拿到回执先看 `complete`，不要默认整表已落全。**

**`+csv-get` 返回值核心设计**：
- `annotated_csv` — **CSV 数据唯一入口**。每一逻辑行前加 `[row=N] ` 前缀（N = 真实表格行号）。任何需要行号的下游操作（合并、写入、清空、格式化、插入/删除、条件格式、筛选、图表/透视表范围、搜索替换等），**行号一律直接从 `[row=N]` 读取**。若需要纯 CSV（如喂给本地脚本做解析），去前缀即可：`line.replace(/^\[row=\d+\] /, '')`。
- `col_indices` — **定位列字母唯一入口**。在表头中找到目标字段是第 j 个（0-based），用 `col_indices[j]` 取列字母。**禁止手数逗号**——列数超过 10 时极易 off-by-one（例如把 W 误判为 X）。
- `row_indices` — 程序化引用的备用数组。LLM 推理请用 `annotated_csv` 的前缀，不要查这个数组里的 index（把行号当数值用容易心算出错）。
- `current_region` — 从请求范围扩展到被空行空列包围的连续数据区域（等价于 Excel Ctrl+Shift+*），适合先读少量行探表头。⚠️ 它**遇表中部整行空行 / 整列空列就截断**，可能小于真实数据范围（漏掉空行之后的行）；**不能**直接当整表末行用，判断整表是否读全要拿 `+workbook-info` 的物理 `row_count` / `column_count` 当上界交叉核对（见下方「按 row_count 盲读空行」与「确定数据范围的正确流程」）。

注意：

- `+csv-get` 和 `+cells-get` 支持分页/截断，注意检查 `has_more` / `truncated` 标志；两者在处理返回数据之前都必须先读 `warning_message`（上游 schema 要求先读它再用其它字段，内含定位与截断续读提示），`+cells-get` 还要用每个 range 的 `actual_range` / `row_indices` / `col_indices` 判断真实位置
- 隐藏行列默认包含在返回结果中（`--skip-hidden=false`），如需只看可见数据设为 `true`。读取原语本身不标注哪些行列被隐藏：若要识别隐藏区间（以决定是否过滤、或如何解读混入的隐藏数据），用 `+sheet-info --include hidden_rows,hidden_cols` 取隐藏行列集合，再结合 `+csv-get` / `+cells-get` 返回的 `row_indices` / `col_indices` 判断每行 / 每列是否隐藏
- 要判断单元格内容是否被行高列宽挤到显示不全（排版检查、调整行高列宽前），给 `+cells-get` 加 `--include truncation`：会按字号 / 自动换行 / 行高列宽估算并返回被截断单元格的 `isRowTruncated` / `isColTruncated`（未返回视为未截断）。有额外计算开销，仅需要时才开

**常见配置错误（必须注意）**：
- **全量读取导致上下文溢出**：不要对大表（数百行以上）直接用 `+csv-get` 或 `+cells-get` 读取全部数据到上下文。大表场景必须分批读取：用 `--range` 切行窗口逐块读（`+csv-get` / `+cells-get` 单次返回量由 `--max-chars` 自动兜底，截断时返回 `has_more`）；过大时考虑导出到本地文件后用脚本处理再分批回写
- **了解结构 ≠ 读取全量数据**：探表不用读全表，但必须同时探两个方向的表头：
  - **横向（列头）**：先读前几行，且**列范围必须覆盖所有列**——用 `+workbook-info` 拿总列数，`range` 末列填到最后一列（例如总列数是 N，则 `range: "A1:[列N]10"`）。列范围截短会遗漏右侧字段、后续写入列定位错误。
  - **纵向（行标）**：若左侧 1-2 列是行标签（日期/类别/编号枚举每行含义，典型交叉表/透视布局），**必须再读 `A:A` 或 `A:B` 把行标列读到底**，拿全部行标。只读前几行会看不全表尾的行，导致批量写入漏改——这是"只改前 N 行、其余未更新"的主要成因。扁平列表（每行独立记录、列是字段）可跳过这一步，但仍要按下方「确定数据范围的正确流程」用 `+workbook-info` 的物理 `row_count` 交叉核对末行（`current_region` 遇空行会截断，不能单独兜底）。
  - 数据量大或会进入上下文上限时，分批读 + 本地处理 + 分批回写，不要一口气拉全表到上下文。
- **`+cells-get` 滥用**：当只需要数据值时，使用 `+csv-get`（token 开销约为 `+cells-get` 的 1/5）。只有确实需要公式、样式或批注时才用 `+cells-get`
- **忽略分页标志**：读取返回 `has_more=true` 时，说明还有更多数据。如果任务需要完整数据，必须继续分页读取，不能只处理第一页就开始写入
- **直接按 `+cells-get` 返回二维数组下标推导真实位置**：`ranges[n].cells[i][j]` 里的 `i/j` 只是返回数组下标，不等于真实表格行列。定位真实行号必须用 `ranges[n].row_indices[i]`，定位真实列字母必须用 `ranges[n].col_indices[j]`；若 `--skip-hidden=true`、请求范围越界被裁剪，或最后一行是部分返回，错误地自己数下标会立刻错位
- **CSV 行号计数错误**：`+csv-get` 返回的 CSV 遵循 RFC 4180 标准，被双引号 `"..."` 包裹的字段中的换行符属于**字段内容的一部分**（即单元格内换行），不代表新的一行。计算行号时必须按**逻辑记录**计数，而非按物理换行符 `\n` 计数
- **手动数列确定列号**：禁止通过在 CSV 表头中手动数逗号/字段来确定目标列的列字母。当列数超过 10 时，手动计数极易产生 off-by-one 偏移（例如把 W 列误判为 X 列）。**必须使用 `col_indices`**：先在 CSV 表头中找到目标字段名是第 j 个字段（0-based），再用 `col_indices[j]` 获取该列的实际列字母
- **用数据列的值推导行号（常被巧合掩盖）**：CSV 中常见"序号 / ID / 编号 / No."等形似行号的列，其值与实际表格行号**没有任何绑定关系**——序号可能跳号（1,2,3,5,6...）、可能从非 1 开始、可能有重复或被中途重置。此规则适用于**所有需要行号的下游操作**：合并单元格、区间写入/清空/格式化、插入/删除行、条件格式范围、筛选器范围、图表数据源、透视表范围、搜索替换范围等等——**凡是要把行号填进任何工具参数的场景，行号一律从 `annotated_csv` 中目标行开头的 `[row=N]` 前缀直接读取**，禁止用"序号=行号"、"表头占 1 行所以数据从第 2 行开始"、"第 N 个序号就在第 N+1 行"等心算，也禁止先心算再"事后核对"。**危险特征**：前几十行中序号恰好等于表格行号（典型成因：表头 +1 与一次跳号 -1 的偏移互相抵消形成巧合），模型一旦把这个巧合当作规律，会在后续所有行沿用；而中间再出现跳号时，从该行起整块区域全部错位，且错位不自查很难发现。**正确工作流**：①在 `annotated_csv` 里定位目标逻辑行（按字段内容匹配）；②直接读取该行开头的 `[row=N]` 前缀得到真实表格行号；③把这个行号填进下游工具参数。区间操作时，起始行用 start 行的 `[row=N]`、结束行用 end 行的 `[row=N]`。**自检**：动手前，在 `annotated_csv` 靠后位置再抽 1~2 行，核对 `[row=N]` 是否与首列"序号"一致——不一致（典型：`[row=57] 58,...`）即说明有跳号/隐藏行，更要严格从 `[row=N]` 取值，不要被序号列迷惑
- **`row_count` 与 `current_region` 都不能单独定末行**：`+workbook-info` 的 `row_count` 是 sheet 的**网格物理行数**（常是 200 / 1000 等默认值），通常**大于**真实数据末行——直接按它把 `--range` 拉到 `S200` 会读回大片空行，浪费上下文。反过来，`+csv-get` 返回的 `current_region` 是从锚点扩展、被空行空列围住的连续块，**遇表中部整行空行就截断**，可能**小于**真实数据范围（漏掉空行之后的行，典型反例：1–80 行有数据、81 行空、82 行起还有数据，`current_region` 只到 80，82 行起整段被漏读）。正确做法：把 `row_count` 当**上界**、`current_region` 当**起点参考**，在二者之间按下方「确定数据范围的正确流程」确认真实末行（含跨过中间空行的核对），不要只信其一。
- **current_region 当作纯数据范围**：`current_region` 返回的是从请求范围向四周扩展到被空行空列包围的**连续非空区域**，等价于 Excel 的 Ctrl+Shift+\*。它包含该区域内**所有非空行**——不仅包含数据行，还可能包含标题行、汇总行（如"总计"）、签名行（如"编制人/审批人"）、脚注等非数据内容。**严禁直接将 `current_region` 的末尾行作为数据范围的结束行**。正确做法见下方「确定数据范围的正确流程」

### 确定数据范围的正确流程（排序、筛选、批量写入等操作前必做）

当后续操作需要精确的数据范围（如排序、筛选、删除、批量写入）时，仅靠 `current_region` 探测到的范围是不够的——它**两头都可能不准**：表中部有整行空行时会被截断（末行偏小、漏数据），表尾有汇总 / 签名行时又会偏大。必须同时确认数据的**起始行**和**结束行**。具体步骤：

1. **确认起始行**：读取前 5~10 行，识别表头行位置，数据起始行 = 表头行 + 1
2. **确认结束行**（关键步骤，不可跳过）：
   - **先防截断（漏数据）**：拿 `+workbook-info` 的物理 `row_count` 当上界，与 `current_region` 末行对比。若 `current_region` 末行 **远小于** `row_count`（差出很多空间），不要直接采信——在 `current_region` 末行之后再探一段（如往下读到 `row_count`，或分段扫到首个连续空白区），确认空行之后确实没有数据；典型反例：`row_count=327`、`current_region` 只到第 80 行，第 81 行空、82 行起还有数据，只读到 80 就漏了一大段。
   - **再排尾部非数据行**：读取确认到的末行附近若干行（建议末尾 5~10 行），逐行排除：
     - **汇总行**：内容为"合计"、"总计"、"小计"、"总计:"等
     - **签名/审批行**：内容为"编制人"、"审核人"、"部门负责人"等
     - **空行或分隔行**：整行为空或仅有边框
     - **备注/脚注行**：注释性文字、说明文字等
3. **最终数据范围** = 起始行 ~ 最后一条有效数据行（跨过中间空行、排除尾部非数据行）

**示例**：`current_region` 返回 `A1:N51`，读取 Row 48~51 发现：

- Row 49: 序号=47, 姓名=xxx, 有正常数据 → ✅ 数据行
- Row 50: "总计", 有合并单元格 → ❌ 汇总行
- Row 51: "总经理：...", "编制人：..." → ❌ 签名行
- **正确数据范围 = A3:N49**（而非 A3:N51）

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+cells-get` | read | 单元格 |
| `+dropdown-get` | read | 对象 |
| `+csv-get` | read | 单元格 |
| `+table-get` | read | 单元格 |

## Flags

### `+cells-get`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | A1 范围，如 `A1:F10`（不带 sheet 前缀；用 `--sheet-id` / `--sheet-name` 指定 sheet） |
| `--include` | string_slice | optional | 要返回的信息类别，逗号分隔多个。`truncation` 会额外按行高列宽 / 字号 / 自动换行估算每个单元格是否被截断显示，返回 `isRowTruncated` / `isColTruncated`（有额外计算开销，仅排版检查 / 调整行高列宽前才开）（可选值：`value` / `formula` / `style` / `comment` / `data_validation` / `conditional_format` / `truncation`） |
| `--max-chars` | int | optional | 单次返回字符上限，默认 500000（兜底防爆）。要整表无截断直接用 --output-path 落盘（上限自动放宽到 2000 万字符——读取链路非流式，此上限是内存保护；更大就显式给 --max-chars）；仅当要让结果直接进上下文、又不落盘时才调小（如 25000），按 has_more 分页。 传 0 表示「不自设上限」，等价于不传（仍是 500000 / 落盘时 2000 万），不会退回底层工具那个更小的默认截断。 |
| `--output-path` | string | optional | 把完整读取结果写入本地路径（如 `./out.json`），文件内容为 data 载荷的 JSON；stdout 只回一个含 output_path/字节数的确认信息。**一旦设置，字符上限自动放宽到有界的 2000 万字符**（覆盖 --max-chars 默认），并非无限——读取链路非流式，该上限是内存保护；显式 --max-chars 优先。stdout 回执带 `complete` 字段（命中上限时另有 `truncated` 与提示），据此判断文件是否完整，不要默认整表已落全。省略时按常规把结果打到 stdout。 |
| `--skip-hidden` | bool | optional | 跳过隐藏行列，默认 `false` |

### `+dropdown-get`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | A1 范围，如 `A2:A100`（不带 sheet 前缀；用 `--sheet-id` / `--sheet-name` 指定 sheet） |

### `+csv-get`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | optional | A1 范围，如 `A1:F30`（不带 sheet 前缀；用 `--sheet-id` / `--sheet-name` 指定 sheet）。**可省略：缺省读取整个子表**（按表格实际边界裁剪，返回的 actual_range 标注实际读取范围）；大表配合 --max-chars / --output-path 控制体量 |
| `--max-chars` | int | optional | 单次返回字符上限，默认 500000（兜底防爆）。要整表无截断直接用 --output-path 落盘（上限自动放宽到 2000 万字符——读取链路非流式，此上限是内存保护；更大就显式给 --max-chars）；仅当要让结果直接进上下文、又不落盘时才调小（如 25000），按 has_more 分页。 传 0 表示「不自设上限」，等价于不传（仍是 500000 / 落盘时 2000 万），不会退回底层工具那个更小的默认截断。 |
| `--output-path` | string | optional | 把完整读取结果写入本地路径（如 `./out.json`），文件内容为 data 载荷的 JSON；stdout 只回一个含 output_path/字节数的确认信息。**一旦设置，字符上限自动放宽到有界的 2000 万字符**（覆盖 --max-chars 默认），并非无限——读取链路非流式，该上限是内存保护；显式 --max-chars 优先。stdout 回执带 `complete` 字段（命中上限时另有 `truncated` 与提示），据此判断文件是否完整，不要默认整表已落全。⚠️ 落盘的是 data 载荷的 **JSON**（`+csv-get` 也一样，CSV 文本是 JSON 里的一个字段），不是直接可用的 .csv 文件；要纯 CSV 文件请把 stdout 重定向到文件。 省略时按常规把结果打到 stdout。 |
| `--include-row-prefix` | bool | optional | 是否在每行前加 `[row=N]` 前缀，默认 `true` |
| `--skip-hidden` | bool | optional | 跳过隐藏行列，默认 `false` |

### `+table-get`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--sheet-id` | string | optional | 只读该子表（按 id）；省略则读所有子表 |
| `--sheet-name` | string | optional | 只读该子表（按名）；省略则读所有子表 |
| `--range` | string | optional | 读取的 A1 范围；省略则读每个子表的完整 used range（会跨过表中部的整行空行 / 整列空列，不会被截断） |
| `--max-chars` | int | optional | 单次返回字符上限，默认 500000（兜底防爆）。底层工具即使不传也有约 50000 的默认截断，故此处显式发送以放宽；要整表读取请用 --output-path 落盘（上限自动放宽到有界的 2000 万字符，非无限；回执 complete 字段说明是否完整）。 传 0 表示「不自设上限」，等价于不传（仍是 500000 / 落盘时 2000 万），不会退回底层工具那个更小的默认截断。 |
| `--output-path` | string | optional | 把完整读取结果写入本地路径（如 `./out.json`），文件内容为 data 载荷的 JSON；stdout 只回一个含 output_path/字节数的确认信息。**一旦设置，字符上限自动放宽到有界的 2000 万字符**（覆盖 --max-chars 默认），并非无限——读取链路非流式，该上限是内存保护；显式 --max-chars 优先。stdout 回执带 `complete` 字段（命中上限时另有 `truncated` 与提示），据此判断文件是否完整，不要默认整表已落全。省略时按常规把结果打到 stdout。 |
| `--no-header` | bool | optional | 把第一行当数据而非表头（列名取 col1/col2 …） |

## Examples

### `+csv-get`

公共四件套：`--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（前两者 XOR，后两者 XOR）。

示例：

```text
# 简单读（sheet 定位必填：--sheet-name 或 --sheet-id 必给一个；range 的 Sheet1! 前缀不能替代它）
lark-cli sheets +csv-get --url "https://example.feishu.cn/sheets/shtXXX" --sheet-name "Sheet1" --range "A1:F30"

# 用 sheet-name 模糊定位（运行时框架会先解析到 sheet-id）
lark-cli sheets +csv-get --spreadsheet-token shtXXX --sheet-name "销售明细" --range "A1:F30"

# 全量读：省略 --range 即读整个子表（按实际边界裁剪，返回 actual_range 标注实读范围），
# 无需先 +workbook-info 探行列再拼 range；大表配合 --max-chars / --output-path
lark-cli sheets +csv-get --spreadsheet-token shtXXX --sheet-name "销售明细"
```

输出契约（envelope.data）：

- `annotated_csv` — 含 `[row=N]` 前缀的 CSV 主入口
- `col_indices` / `row_indices` — 列字母 / 行号映射数组
- `current_region` — 从锚点扩展到被空行空列包围的连续区域的 A1 范围。⚠️ **它不是整表真实边界**：遇表中部整行空行 / 整列空列会截断、可能小于真实数据范围；表尾的汇总 / 签名 / 脚注又可能让它大于纯数据范围。判断整表是否读全须拿 `+workbook-info` 的物理 `row_count` 当上界交叉核对（见上方「`row_count` 与 `current_region` 都不能单独定末行」）
- `actual_range` — **本次实际读到的 A1 范围**。续读 / 校验覆盖度一律以它为准：`actual_range` 小于请求范围时，哪怕 `has_more=false` 也说明只拿到部分窗口，不能把 `row_count` 当成"已读全"
- `row_count` / `col_count` — **本次返回的行 / 列数**（= `actual_range` 的尺寸，随 `--range` 变），**不是整表物理总行列数**；整表物理尺寸取 `+workbook-info`
- `has_more` — 当前 `--range` 是否因 `--max-chars` 被截断（截断后续读接着用 `--range`）；它**只反映本次 range 内是否还有后续页**，`has_more=false` **不代表整表或该窗口已读全**——仍要结合 `actual_range` 看实际覆盖到哪里

> 要按列类型结构化读出（喂 DataFrame、或 round-trip 回 `+table-put`）用 `+table-get`（见下）；`+csv-get` 给的是带 `[row=N]` 前缀的纯值快照，下游需要行号/列坐标时直接从前缀与 `col_indices` 取。

### `+cells-get`

示例：

```text
# 读 A1:F10 的公式 + 样式（sheet 定位必填）
lark-cli sheets +cells-get --url "https://example.feishu.cn/sheets/shtXXX" --sheet-name "Sheet1" \
  --range "A1:F10" --include formula,style
```

> ⚠️ 调用方在 `cells[i][j]` 中**不能**用下标推真实行列：必须读 `ranges[n].row_indices[i]` / `ranges[n].col_indices[j]`。

### `+table-get`（飞书 → DataFrame，类型保真读出）

`+table-put`（写入侧，见 write-cells reference）的镜像：把表格读回与 `--sheets` 完全同构的 typed 协议（`sheets[]` + `columns:[列名]` + `data:[[行]]` + `dtypes:{列名:pandas_dtype}` + `formats?:{列名:number_format}` + `range`），可直接喂回 `+table-put` 或一行还原 DataFrame。

**默认（不带 `--range`）先按整张子表物理网格探测 used range**：可跨过表中部空行 / 空列定位真实数据边界，再读取该区域。仍受 `--max-chars` 上限约束；返回 `truncated=true` 或 `complete=false` 时，文件/响应只有部分数据，改用 `--output-path`、提高上限或按 sheet/range 续读。每个子表的 `range` 只表示本次目标区域，不能单独证明内容已完整返回。

列类型从每列 `number_format` 推断（日期格式→`date`/`datetime64[ns]`、数值→`number`/`float64`、bool→`bool`），`date` 列的序列号转回 ISO `yyyy-mm-dd`——日期、数字往返不丢类型。**列类型只在该列所有非空值一致时才定（`number` / `date` / `bool`）；一列混了类型（如数字列混入「暂无」、日期列混入裸数字）会降为 `string`（dtypes 输出 `object`），让 `dtypes` 与 `data` 里每个值自洽——能 round-trip 回 `+table-put`、不让 pandas `astype` 崩。降级是无损的（脏值原样保留为文本）；若要把零星脏值转成数值列，交给调用方在 pandas 侧做（`to_numeric(errors='coerce')`），那里原始值仍在、可追溯。** 默认读所有子表、第一行当表头（`--no-header` 把首行当数据、列名取 `col1` / `col2` …）。

```text
# 默认读所有子表 → sheets[]（与 +table-put 的 --sheets 同构，可喂回或转 DataFrame）
lark-cli sheets +table-get --url "<表URL>"
# 可选：--sheet-name / --sheet-id 限定只读某一个子表（不给则读全部）
lark-cli sheets +table-get --url "<表URL>" --sheet-name "销售"
```

#### 输出 → DataFrame（用 `sheet_to_df` helper）

输出形状对齐 pandas split：`columns` 是列名数组、`data` 是二维数据、`dtypes` 是 `{列名: pandas_dtype_str}` 映射；`truncated/complete/truncation_warning` 说明覆盖度。未截断时可直接喂给 `pd.DataFrame(...).astype(...)`。本 skill 提供 [`scripts/lark_sheets_df.py.txt`](lark-sheets-0.md#s-958a212184321d2d)：

```python
import sys; sys.path.insert(0, "scripts")  # cwd 不在 skill 根时改成 scripts/ 的实际路径
from lark_sheets_df import sheet_to_df

# 单 sheet
df = sheet_to_df(out["data"]["sheets"][0])

# 多 sheet——按名字取
sheets = {s["name"]: sheet_to_df(s) for s in out["data"]["sheets"]}
df_sales = sheets["销售"]
```

> 显示格式（千分位、百分比、自定义日期）在 `sheet["formats"]`，pandas 不消费；改完数据 round-trip 回去时透传给 `+table-put` 即可，飞书侧显示不变。

#### round-trip：读 → 改 → 写回（写读对偶）

`sheet_to_df` 和 `df_to_sheet` 一对镜像 helper（[`scripts/lark_sheets_df.py.txt`](lark-sheets-0.md#s-958a212184321d2d)）让 round-trip 三段读 / 改 / 写各一行：

```python
import json, subprocess
import sys; sys.path.insert(0, "scripts")  # cwd 不在 skill 根时改成 scripts/ 的实际路径
from lark_sheets_df import df_to_sheet, sheet_to_df

# 1. 读
out = json.loads(subprocess.check_output(
    ["lark-cli","sheets","+table-get","--url",URL,"--sheet-name","销售"]))
sheet = out["data"]["sheets"][0]
df = sheet_to_df(sheet)

# 2. 改（pandas 操作）
df["营收"] = df["营收"] * 1.1

# 3. 写回（formats 是飞书侧显示格式，pandas 不消费，透传保留显示）
payload = {"sheets": [df_to_sheet(df, sheet["name"], formats=sheet.get("formats"))]}
subprocess.run(["lark-cli","sheets","+table-put","--url",URL,"--sheets","-"],
               input=json.dumps(payload).encode(), check=True)
```

`sheet_to_df(sheet)` 消费 `(columns, data, dtypes)`，`df_to_sheet(df, name, formats=...)` 重新生成同样三个字段——读 / 写完全对偶，只有 `formats` 需要手工透传一次。

### Validate / DryRun / Execute 约束

- `Validate` 阶段只做 XOR 检查、Enum 合法性、防爆参数上限校验；**禁止**联网（如不能用 `--sheet-name` 提前去查 `sheet-id`）。
- `DryRun` 输出请求模板：`--sheet-name` 在 dry-run 输出里生成为 `<resolve:销售明细>` 占位符，不实际解析。
- `Execute` 阶段才进行 sheet-name → sheet-id 解析与 API 调用。


<a id="s-8f011971acd60ecd"></a>

## references/lark-sheets-search-replace.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Search & Replace

## 替换前 dry-run + 范围明确（替换前建议）

`+cells-replace` 的副作用是不可逆的（除非另写代码回滚）。执行前必须：

1. **明确替换范围**：建议显式说明"只替换 X 列 / X 区域，还是全表替换"。避免默认全表替换——容易误改无关列。范围应由用户指令决定，模糊时主动询问。
2. **dry-run 命中数量**：先用 `+cells-search` 在同一范围、同一关键词、同一匹配选项（大小写 / 精确 / 正则）下统计命中数量。把数量和**期望命中数**（用户明示的或基于业务理解推断的）对照；不一致先排查（关键词太宽？范围太大？）。
3. **替换后全量校验**：执行后再次 `+cells-search` 旧关键词，预期为 0；指定了完整 range 与旧值枚举时逐项搜索，随机抽样不能替代。**例外**：新值本身包含旧值时（如 `v1`→`v1.1`，或子串替换后新值仍含关键词），子串搜索仍会命中，此时零命中判据不成立——改用整格精确匹配（`--match-entire-cell` 类选项）核对，或直接回读代表性单元格确认已是新值，别据非零命中判未替换而重复执行（会得到 `v1.1.1`）。只有用户明确要求本地 xlsx / 下载 / 打印，或正在验证导入前的本地 Excel 文件时，才运行本地产物检查脚本。

## 使用场景

读写。在飞书表格中搜索和替换文本。本 reference 覆盖 2 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 搜索/定位文本 | `+cells-search` | 返回匹配的单元格位置，支持正则、精确匹配等 |
| 查找并替换文本 | `+cells-replace` | 批量替换文本；`--regex` 模式下 `--replacement` 可用 `$1`、`$2` 引用 `--find` 的捕获组 |

**常见配置错误（注意）**：
- **不要把操作动词当搜索词**：用户说"汇总金额"是一个操作动作（求和），不是要搜索"汇总金额"这个文本。只有当确实需要定位某个文本值的位置时才用 `+cells-search`
- **不要用搜索来了解表格结构**：要了解表头和数据结构时，应使用 `+csv-get` 读取前几行，而不是用 `+cells-search` 逐个猜测字段名
- **注意正则特殊字符**：使用正则匹配时，`.`、`*`、`(`、`)` 等特殊字符需要转义

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+cells-search` | read | 单元格 |
| `+cells-replace` | write | 单元格 |

## Flags

### `+cells-search`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--find` | string | required | 待查找文本（与 `--regex` 配合时按正则解释） |
| `--range` | string | optional | 查找范围（A1 格式）；省略时整表 |
| `--match-case` | bool | optional | 大小写敏感 |
| `--match-entire-cell` | bool | optional | 完全匹配整个单元格 |
| `--regex` | bool | optional | 把 `--find` 按正则解释 |
| `--include-formulas` | bool | optional | 也在公式文本中搜索 |
| `--max-matches` | int | optional | 防爆，默认 5000（隐藏 flag：不在 `--help` 列出，但可正常传入） |
| `--offset` | int | optional | 跳过前 N 个匹配（分页用），默认 0 |

### `+cells-replace`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--find` | string | required | 待替换文本 |
| `--replacement` | string | required | 替换为；传空字符串 `""` 等价于「删除内容」 |
| `--range` | string | optional | 替换范围（A1 格式）；省略时整表 |
| `--match-case` | bool | optional | 大小写敏感 |
| `--match-entire-cell` | bool | optional | 完全匹配整个单元格 |
| `--regex` | bool | optional | 把 `--find` 按正则解释 |
| `--include-formulas` | bool | optional | 也在公式文本中替换 |

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR 规则）。

### `+cells-search`

示例：

```text
# 普通查找
lark-cli sheets +cells-search --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --find "张三"

# 正则 + 范围限定
lark-cli sheets +cells-search --spreadsheet-token shtXXX --sheet-id "$SID" \
  --find "^[A-Z]{2}-\\d{4}$" --regex --range "A2:A1000"
```

输出契约（envelope.data）：

- `matches` — 命中 cell 列表，每条含 `address`（A1）+ `value` + `sheet_id`
- `total_matches` — 匹配总数
- `has_more` / `next_offset` — 分页游标（命中数超过单页上限时用于继续读取）

### `+cells-replace`

示例：

```text
# 先 dry-run 预览
lark-cli sheets +cells-replace --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --find "v1" --replacement "v2" --dry-run

# 确认后执行
lark-cli sheets +cells-replace --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --find "v1" --replacement "v2"

# 正则捕获组：把 "2026-03" 重排成 "03/2026"（$1/$2 引用 --find 的捕获组）
lark-cli sheets +cells-replace --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --regex --find "(\\d{4})-(\\d{2})" --replacement "$2/$1" --dry-run
```

> `+cells-replace` 虽然 Risk = write，但范围大或正则写错可能批量修改大量非目标单元格。**建议工作流**：先 `+cells-search` 看匹配数，再 `+cells-replace --dry-run` 预览，最后真正执行。

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`--find` 非空；正则模式下 `--find` 必须是合法正则。
- `DryRun`：`+cells-search` 输出请求模板；`+cells-replace` 额外返回预估替换数（`would_replace_count`）。
- `Execute`：替换后必须用 `+cells-search` 复查旧值剩余命中，并回读首、中、末代表性单元格；目标是旧值命中归零或明确列出未替换项。


<a id="s-2cd74a3800579194"></a>

## references/lark-sheets-sheet-structure.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Sheet Structure

## 结构性操作影响面预检（插入 / 删除行列前必做）

插入 / 删除行列、隐藏 / 取消隐藏、冻结、行列分组都会让原表的引用关系发生偏移。**操作前必须**先打印以下三类信息，并评估操作是否会让它们失效；否则禁止执行：

1. **当前合并单元格范围**（来自 `+sheet-info` 的 `merged_cells`）：插入行 / 列时，跨过插入位置的合并区域可能扩张或断裂；删除行 / 列时合并区域可能直接消失。
2. **现有公式的引用范围**（用 `+cells-get` 抽样附近行 + 跨表引用 + 透视表 / 图表 / 条件格式 / 筛选器的数据源 range）：插入 / 删除会导致 `=SUM(B4:B13)` 这种相对引用偏移；如果操作发生在引用范围内部，可能产生 `#REF!`。
3. **数据验证（下拉列表）规则的应用范围**：列表来源是某个区域时，区域被部分删除会让规则失效。

不可逆的影响必须先在回复中告知用户，得到确认再执行。

## 合并安全契约（按模块 / 分组展示）

合并前先读目标列的完整连续区域；只有同值且连续、且非左上角单元格没有值 / 公式 / 批注 / 数据验证或需保留的独立样式时，才可合并。空值、值变化、上级模块变化或上述有效内容立即断组。先读取既有 merges，禁止与现有合并区交叠或跨组扩张；执行前记录每组 `range + 左上角原文`，从下往上或一次批量提交。完成后用 `+sheet-info --include merges` 核范围，并用 `+cells-get` 确认左上角文本未丢、组外边界未合并。

## 使用场景

读写。管理子表结构与布局。本 reference 覆盖 9 个 shortcut（按用途分两类）：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看子表布局 | `+sheet-info` | 获取行高、列宽、隐藏行列、行列分组、合并单元格等信息 |
| 变更子表结构 | `+dim-{insert|delete|hide|unhide|freeze|group|ungroup|move}` | 插入/删除/隐藏/取消隐藏/冻结/分组/移动行列 |

注意：

- 当表格存在合并单元格时，应结合返回的 `merged_cells` 判断表头、分组标题和区域语义
- 不要把合并区域中非左上角的空白单元格理解为"无内容"；通常应将左上角单元格的内容视为整个合并区域的语义内容
- 插入用 `+dim-insert`：`--position`（插入位置；行用 1-based 行号如 `3`，列用字母如 `C`，新行/列插在此位置**之前**）+ `--count`（插入数量，>0）。新行/列样式继承用 `--inherit-style`（`before` 继承前一行/列 / `after` 继承后一行/列）；它只决定继承哪一侧的样式，**插入位置始终在 `--position` 之前，不改变插入方向**。⚠️ 不传时默认继承**后一行/列**（同 `after`）；底层无法插入"无格式"行/列，要真正的纯空白行/列，插入后再用 `+cells-clear --scope formats` 清除新行/列的格式。
- 例如"在第 20 行后新增 116 行"：`--position 21 --count 116`（"第 20 行后"即 1-based 行号 21）

**区间表达统一为 A1 风格**：所有涉及"一段连续行/列"的 shortcut 都用同一套 A1 闭区间字符串语法，**不存在 inclusive / exclusive / 0-based / 1-based 跨命令差异**：

| 命令 | 用什么 flag 表达区间 / 位置 | 例子 |
| --- | --- | --- |
| `+dim-insert` | `--position` + `--count` | `--position 3 --count 5`（在第 3 行前插 5 行）/ `--position C --count 2`（在 C 列前插 2 列） |
| `+dim-delete` / `+dim-hide` / `+dim-unhide` / `+dim-group` / `+dim-ungroup` / `+rows-resize` / `+cols-resize` | `--range` | `"3:7"`（第 3-7 行，闭区间）/ `"C:F"`（C-F 列，闭区间）/ `"5"` 或 `"C"`（单行/列） |
| `+dim-move` | `--source-range`（源区间）+ `--target`（目标位置） | `--source-range "3:7" --target 12`（把第 3-7 行移到第 12 行前）/ `--source-range "C:F" --target H` |

行用 1-based 数字、列用字母——跟 Excel / 飞书 UI 看到的行号、列字母完全一致。

**常见配置错误（必须注意）**：
- **插入列直接用字母**：`+dim-insert` 的 `--position` 在列场景直接传字母（如 `C`），不要把列字母换算成 0-based 索引
- **插入后引用偏移**：插入行/列后，原有数据的行号 / 列字母会发生偏移。如果插入后还需要对原有区域执行写入操作，必须重新计算偏移后的位置
- **删除行列前先确认范围**：删除操作不可逆，执行前应确认 `--range` 精确无误。可先用 `+csv-get` 读取目标区域验证内容（`+csv-get` / `+cells-get` 见 `references/lark-sheets-read-data.md`）
- **"在 D 列左侧新增一列"的正确写法**：`--position D --count 1`（新列插在 D 列之前）；要继承左侧列样式加 `--inherit-style before`。不要把 `--inherit-style after` 当成“插到 D 列右侧”，它不是插入方向参数。
- **`+dim-move` 同维度约束**：`--source-range` 是行区间时 `--target` 必须是行号（数字），是列区间时 `--target` 必须是列字母——不可一行一列混用
- **插入列后必须检查多行表头合并区域**：很多表格有 2-3 行的合并表头。插入列后，原有的合并区域不会自动扩展到新列。必须先用 `+sheet-info --include merges` 读取合并区域，插入后将跨越插入位置的合并区域重新设置（用 `+cells-{merge|unmerge}`），否则新列的表头会是空的、格式不连续
- **公式写入范围跳过表头行**：写入公式时从数据行开始（不是第 1 行）。先确认表头占几行（可能 1-3 行），公式的起始行 = 表头行数 + 1

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+sheet-info` | read | 工作表 |
| `+dim-insert` | write | 工作表 |
| `+dim-delete` | high-risk-write | 工作表 |
| `+dim-hide` | write | 工作表 |
| `+dim-unhide` | write | 工作表 |
| `+dim-freeze` | write | 工作表 |
| `+dim-group` | write | 工作表 |
| `+dim-ungroup` | write | 工作表 |
| `+dim-move` | write | 工作表 |

## Flags

### `+sheet-info`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--include` | string_slice | optional | 要返回的结构信息类别，逗号分隔多个（可选值：`merges` / `row_heights` / `col_widths` / `hidden_rows` / `hidden_cols` / `groups` / `frozen`） |
| `--range` | string | optional | 限定只返回该 A1 范围的结构信息；省略时返回整表 |

### `+dim-insert`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--inherit-style` | string | optional | 新行/列样式继承 enum：`before`（继承前一行/列）/ `after`（继承后一行/列）；不传时默认继承后一行/列（同 `after`），底层无法插入无格式行/列。只决定继承哪侧样式、不改变插入方向（始终插在 `--position` 之前）；要纯空白行/列请插入后用 `+cells-clear --scope formats`（可选值：`before` / `after`） |
| `--position` | string | required | 插入位置（在此行/列**之前**插入）：行用 1-based 行号如 `3`；列用字母如 `C` |
| `--count` | int | required | 插入数量（>0） |

### `+dim-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | xor | 要删除的行/列闭区间；行用 1-based 数字如 `3:7` 或单行 `5`，列用字母如 `C:F` 或单列 `C`。与 `--ranges` 二选一 |
| `--ranges` | string + File + Stdin（简单 JSON） | xor | 要删除的多个行/列区间 JSON 数组（最多 100 个，如 `["5:5","8:8","11:13"]` 或 `["C:C","F:G"]`），全行或全列不可混用，区间不可重叠；与 `--range` 二选一。CLI 按位置**从大到小逆序**合成一次批量删除（fail-fast，失败后先回读再补发）——正序删除会因前面的行/列被删导致后续索引前移错位，逆序由 CLI 代劳，无需自行排序 |

### `+dim-hide`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 要隐藏的行/列闭区间；行如 `3:7`，列如 `C:F` |

### `+dim-unhide`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 要取消隐藏的行/列闭区间；行如 `3:7`，列如 `C:F` |

### `+dim-freeze`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--rows` | int | optional | 冻结前 N 行；与 --cols 一起描述完整冻结状态，省略的轴即为不冻结（0 表示不冻结行） |
| `--cols` | int | optional | 冻结前 N 列；与 --rows 一起描述完整冻结状态，省略的轴即为不冻结（0 表示不冻结列） |

### `+dim-group`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--depth` | int | optional | 嵌套分组的层级（创建到第几层），默认 1 |
| `--group-state` | string | optional | 分组初始展开状态（可选值：`expand` / `fold`）（默认 `expand`） |
| `--range` | string | required | 要创建分组的行/列闭区间；行如 `3:7`，列如 `C:F` |

### `+dim-ungroup`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--depth` | int | optional | 要取消的分组层级，默认 1（1=最外层，数字越大越内层） |
| `--range` | string | required | 要取消分组的行/列闭区间；行如 `3:7`，列如 `C:F` |

### `+dim-move`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--source-range` | string | required | 要移动的源行/列闭区间；行如 `3:7`，列如 `C:F` |
| `--target` | string | required | 目标位置（移到此行/列**之前**）：行用 1-based 行号如 `12`，列用字母如 `H`。必须与 `--source-range` 同维度（行/列） |

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。

### `+sheet-info`

输出契约：返回子表的行高 / 列宽 / 隐藏 / 合并 / 分组等布局元信息。

### `+dim-insert`

```text
# 在第 10 行前插 3 行，继承上方样式
lark-cli sheets +dim-insert --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-id "$SID" --position 10 --count 3 --inherit-style before

# 在 C 列前插 2 列
lark-cli sheets +dim-insert --url "..." --sheet-id "$SID" --position C --count 2
```

### `+dim-delete`

```text
# 删除第 5-7 行
lark-cli sheets +dim-delete --url "..." --sheet-id "$SID" --range "5:7" --yes

# 删除 D-F 列
lark-cli sheets +dim-delete --url "..." --sheet-id "$SID" --range "D:F" --yes

# 删除多个散布区间（如按查重结果删行）：--ranges 一次批量交付（fail-fast，失败后先回读再补发；CLI 逆序保索引）。
# CLI 自动按位置从大到小逆序执行——正序会因前面的行被删导致后续索引前移错位；
# 无需自行排序，也不要为此拼 +batch-update 的子操作数组
lark-cli sheets +dim-delete --url "..." --sheet-id "$SID" --ranges '["5:5","8:8","11:13"]' --yes
```

### `+dim-hide` / `+dim-unhide`

```text
lark-cli sheets +dim-hide   --url "..." --sheet-id "$SID" --range "5:7"
lark-cli sheets +dim-unhide --url "..." --sheet-id "$SID" --range "5:7"
lark-cli sheets +dim-hide   --url "..." --sheet-id "$SID" --range "C:F"
```

### `+dim-move`

```text
# 把第 3-7 行移到第 12 行前
lark-cli sheets +dim-move --url "..." --sheet-id "$SID" --source-range "3:7" --target 12

# 把 C-F 列移到 H 列前
lark-cli sheets +dim-move --url "..." --sheet-id "$SID" --source-range "C:F" --target H
```

### `+rows-resize` / `+cols-resize`

> ⚠️ 这两条 shortcut 来自 `references/lark-sheets-range-operations.md` 的 `+rows-resize / +cols-resize` tool（分组在"工作表"是为了发现性）。详细参数和示例在 `references/lark-sheets-range-operations.md`。
>
> 常规写法：行高走 `--range` + `--height <px>`、列宽走 `--range` + `--width <px>`，无需再传 `--type`（等价于 `--type pixel`）；多行 / 多列不同尺寸用 map 形态 `--heights` / `--widths`（如 `--widths '{"A":100,"C:E":120}'`）一次调用完成，不要拆多次调用或走 `+batch-update`。`--type standard` / `--type auto` 用于非像素模式，不能与像素 flag 同给。`+cols-resize.--type` 不接受 `auto`（列宽不支持自动适应）。⚠️ 单位是像素（不是 Excel 字符单位 / 磅）。

### `+dim-freeze`

冻结是**整份状态覆盖**、不是按轴叠加：`--rows` / `--cols` 一起描述完整的目标状态，没写的轴即为不冻结。所以要同时冻住行和列必须一次给全，拆成两次调用只会剩下最后一次的那个轴。

```text
# 冻结前 1 行 + 前 2 列（一次给全）
lark-cli sheets +dim-freeze --url "..." --sheet-id "$SID" --rows 1 --cols 2

# 解除行冻结但保住列：把要保留的轴一并写出
lark-cli sheets +dim-freeze --url "..." --sheet-id "$SID" --rows 0 --cols 2
```

### `+dim-group` / `+dim-ungroup`（大纲）

> 仅当用户明确说"行分组 / 列分组 / 大纲 / outline"时触发；按字段做数据分组用 `+pivot-create`。

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`--range` / `--source-range` 必须是合法 A1 闭区间（行用数字、列用字母，不可混用）；`+dim-insert` 的 `--count` > 0；`+dim-freeze` 至少给 `--rows` / `--cols` 之一；`+dim-move` 的 `--target` 必须与 `--source-range` 同维度（行 vs 列）；`+dim-delete` 强制 `--yes` 或 `--dry-run`，`--range` 与 `--ranges` 二选一、`--ranges` 各区间同维度且不可重叠（≤100 个）；`+rows-resize` / `+cols-resize` 的统一形态（`--range` + `--height`/`--width` 或 `--type`）与 map 形态（`--heights`/`--widths`）二选一、不可混用；详见 `references/lark-sheets-range-operations.md`。
- `DryRun`：写操作输出"将要 PATCH 的目标范围 + 目标参数"。
- `Execute`：写后必须调用 `+sheet-info --include row_heights,col_widths,hidden_rows,hidden_cols,groups,frozen,merges`，按本次结构动作核对受影响范围。


<a id="s-04bd8322957595ca"></a>

## references/lark-sheets-sparkline.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Sparkline

## 真对象硬约束

当用户要求"迷你图 / 趋势线 / 单元格内图表"时，**必须**通过 `+sparkline-{create|update|delete}` 创建真实的迷你图对象。**禁止**用文本字符（如 `▁▂▃▅▇`）拼接在单元格里、或用 `SPARKLINE()` 公式函数（已禁用）代替。判断标准：交付后 `+sparkline-list` 必须能返回该对象。

## 使用场景

读写迷你图对象。本 reference 覆盖 4 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看已有迷你图 | `+sparkline-list` | 获取迷你图的类型、数据源和样式配置 |
| 创建/更新/删除迷你图 | `+sparkline-{create|update|delete}` | 对迷你图执行写入操作 |

典型工作流：先读取现有迷你图了解配置 → 执行创建/更新/删除 → **必须再次读取验证结果**。

**常见配置错误（必须注意）**：
- **数据源范围要精确**：迷你图的数据源范围必须与实际数据行列精确对应，范围偏移会导致图形展示错误
- **不要与 SPARKLINE() 公式混淆**：飞书表格的 `SPARKLINE()` 公式函数已被禁用，迷你图只能通过 `+sparkline-{create|update|delete}` 的对象方式创建
- **胜负 / count 迷你图原生支持**：`config.type="win_loss"`——别因速查表没列就判"不支持"绕路
- **创建后必须验证**：调用 `+sparkline-list` 确认迷你图配置正确

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+sparkline-list` | read | 对象 |
| `+sparkline-create` | write | 对象 |
| `+sparkline-update` | write | 对象 |
| `+sparkline-delete` | high-risk-write | 对象 |

## Flags

### `+sparkline-list`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--group-id` | string | optional | 按 group_id 过滤 |

### `+sparkline-create`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--properties` | string + File + Stdin（复合 JSON） | required | JSON：`{config（共享样式配置）, sparklines（迷你图数组）}`；完整字段结构跑 `--print-schema` |

### `+sparkline-update`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--group-id` | string | required | 目标组 id |
| `--properties` | string + File + Stdin（复合 JSON） | required | JSON：`{config, sparklines}`；先 `+sparkline-list --group-id <id>` 回读再 patch；完整字段结构跑 `--print-schema` |

### `+sparkline-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--group-id` | string | required | 目标组 id |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+sparkline-create` `--properties` / `+sparkline-update` `--properties`

_创建/更新/部分删除的迷你图属性_

**顶层字段**：
- `config` (object?) — 迷你图样式配置, 相同 groupId 的迷你图共享相同的样式 { theme_type?: enum, non_num_show_as?: enum, empty_show_as?: enum, contain_hidden_cells?: boolean, series_color?: string, …共 13 项 }
- `sparklines` (array<object>?) — 迷你图项列表 each: { sparkline_id?: string, position?: object, source?: string, source_range?: object }

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。迷你图用 **两层 id** 管理——`group_id` 选组（一组同形态的迷你图共享类型 / 样式 / 数据源映射），`sparkline_id` 在组内选具体某一项。注意：不等同于已禁用的 `SPARKLINE()` 公式函数。

> **何时需要先 `+sparkline-list`：**
> - `+sparkline-update`：**总是**需要——拿到组内每一项的 `sparkline_id`，回填到 `properties.sparklines[i]`，server 用它做映射。
> - `+sparkline-delete`：**不需要** `sparkline_id`——CLI 仅支持按 `--group-id` 整组删除（该 shortcut 没有 `--properties`）。

### `+sparkline-list`

```text
# 列出整张子表的所有迷你图组
lark-cli sheets +sparkline-list --url "..." --sheet-id "$SID"

# 钉到单组：返回该组每一项的 sparkline_id（update 必需）
lark-cli sheets +sparkline-list --url "..." --sheet-id "$SID" --group-id "grpA"
```

### `+sparkline-create`

> `--properties` 顶层只有 `config`（同组共享样式，如 `line_width` / `points` / `extremum_max` / `extremum_min`）和 `sparklines`（迷你图项数组）两个字段。`sparklines[i]` 每项必须含 `position`（落点 cell，`row` + `col`）+ `source`（数据 A1 范围，与 `source_range` 二选一）；create 时 `sparkline_id` 可省略，由系统生成。

```text
lark-cli sheets +sparkline-create --url "..." --sheet-id "$SID" --properties @sparkline.json
```

`sparkline.json` 示例（在 F 列嵌入两行折线迷你图，数据分别来自 A2:E2 和 A3:E3）：

```jsonc
{
  "config": { "line_width": 2 },
  "sparklines": [
    {"position": {"row": 1, "col": "F"}, "source": "'Sheet1'!A2:E2"},
    {"position": {"row": 2, "col": "F"}, "source": "'Sheet1'!A3:E3"}
  ]
}
```

### `+sparkline-update`

> 两步式：先 `+sparkline-list --group-id <id>` 拿当前组的 `sparkline_id` 列表，再构造 `properties.sparklines[]`——**每项必须带 `sparkline_id`**。只改样式可只传 `properties.config`（不带 `sparklines`，整组样式覆盖式更新）。

```text
# 假设 +sparkline-list 已返回 group_id=grpA，组内 sparkline_id=sl_1 / sl_2
lark-cli sheets +sparkline-update --url "..." --sheet-id "$SID" --group-id "grpA" --properties '{
  "sparklines": [
    {"sparkline_id":"sl_1","source":"'Sheet1'!A2:A20"},
    {"sparkline_id":"sl_2","source":"'Sheet1'!B2:B20"}
  ]
}'
```

### `+sparkline-delete`

> CLI 仅支持**整组删除**：传 `--group-id` 删掉该组全部迷你图。该 shortcut **没有** `--properties`，无法只删组内单项（需求上要"留一部分"时，改用 `+sparkline-update` 重写该组的 `sparklines` 列表，而不是 delete）。强制 `--yes` 或 `--dry-run`；先 `--dry-run` 确认要删的目标组。

```text
# 删整组
lark-cli sheets +sparkline-delete --url "..." --sheet-id "$SID" --group-id "grpA" --yes
```

### Validate / DryRun / Execute 约束

- `Validate`：
  - XOR 公共四件套；`+sparkline-{update,delete}` 必须 `--group-id`。
  - **`+sparkline-update`**：当 `properties.sparklines` 非空时，每一项必须含 `sparkline_id`（CLI 预检，错误信息会指回 `+sparkline-list`，避免命中服务端的不可读拒绝）；只传 `properties.config`（config-only update）合法、不触发 sparkline_id 检查。
  - **`+sparkline-delete`**：只接 `--group-id`（整组删除），**没有** `--properties`，无法删组内单项。
  - `--properties`（仅 `+sparkline-create` / `+sparkline-update`）顶层只接 `config`（同组共享样式）和 `sparklines`（迷你图项数组）；`+sparkline-create` 要求每个 `sparklines[i]` 含 `position` 与 `source`（或 `source_range`，二选一）。
  - `+sparkline-delete` 强制 `--yes` 或 `--dry-run`。
- `DryRun`：写操作输出"将要 POST/PATCH/DELETE 的 sparkline group 请求模板"。
- `Execute`：create/update 后必须调用 `+sparkline-list --group-id <id>` 核对 config、项目数量、source 与 position；delete 后 list 确认目标组不存在。


<a id="s-503d10a0a677b33f"></a>

## references/lark-sheets-styles-put.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Styles Put（+styles-put）

> **本文定位**：对**已有**表格做美化收尾的默认入口——样式 / 边框 / 合并 / 行高列宽 / 冻结写成一份声明式规格，一次调用交付。样式**取什么值**（配色 / 字号 / 对齐 / 数字格式标准）以 `references/lark-sheets-visual-standards.md` 为唯一权威，本文只讲**怎么落地**。
>
> **边界（三分流判定，按操作组合选入口）**：目标是**样式 / 合并 / 行高列宽 / 冻结**的任意组合 → 本命令；**同一个写操作**打多个区域（如多区域清除、批量下拉）→ 用该命令自身的复数形态（`--ranges` / map 入参）；操作链**跨类型且有顺序依赖**（如插列 → 写表头 → 回填数据）→ `+batch-update`。美化收尾不需要也不应该拼 `--operations` 子操作数组。

## 使用场景

写入。对存量表格的多个子表批量应用视觉规格：新表美化、加汇总行后统一版式、按分组合并同类单元格、调列宽行高、冻结表头。整份规格展开为一次批量提交按序执行，与 `+batch-update` 同为 **fail-fast**——失败后哪些子操作已生效不做统一假设，先回读确认再补发（语义同 `references/lark-sheets-batch-update.md`「执行语义」）。

⚠️ **失败后不要照抄报错里的 `operations[N]` 去续发**：那个数组是 CLI 从 `--styles` 展开出来的（相邻同样式的 `cell_styles` 还会被合并成更大的矩形），下标与你写的 spec 项没有对应关系，也不是你能直接重发的东西。正确做法：回读受影响区域（`+cells-get --include style` / `+sheet-info`）确认哪些已生效，再重发没落上的部分。样式 / 行高列宽 / 冻结是幂等盖章（整份重发无副作用，这通常就是最省事的解法），只有 `cell_merges` 需要挑出未生效的部分单独发。

**词汇三处同构**：`--styles` 的字段词汇与 `+workbook-create --styles`（建新表同步美化）、`+table-put --styles`（写数据同步美化）完全一致——`cell_styles` / `cell_merges` / `row_sizes` / `col_sizes` / `freeze` 学一次三处通用。区别只有两点：本命令作用于**已有**表格（顶层 `--url` / `--spreadsheet-token` 定位），且 `cell_styles` 的 range 不受「本次写入区域」限制、可指向表内任意区域。

**规格要点**：

- 顶层 `{styles:[...]}`，每项对应一个目标子表，`name` 必须是真实子表名（不确定先 `+workbook-info` 查，禁止猜 `Sheet1`）。
- 每个子表项按固定顺序执行：`cell_merges` → `cell_styles` → `row_sizes` → `col_sizes` → `freeze`；样式盖章允许覆盖含合并区的区域（合并区限制只针对值写入，样式不受限）。
- `row_sizes` / `col_sizes` 只需 `{range, size}`（px，即像素尺寸；`standard` / 行的 `auto` 才需显式 `type`）。尺寸键统一是 `size`。
- 加边框用 `border` 简写：`{"style":"solid","color":"#DDDDDD"}` 应用到四边；只有分侧不同样式才用 `border_styles` 完整形态。
- `freeze` 用 `{rows:N, cols:N}` 冻结前 N 行 / 列，0 或省略表示该维度不冻结；freeze 是整份状态覆盖，全 0（如 `{"rows":0}`）= 两轴全部解冻，与 `+dim-freeze --rows 0 --cols 0` 等价（仅 `+workbook-create` 建新表时全 0 无意义、会被校验拒绝）。

**回读校验**：整份规格执行成功后按编辑准则抽样回读受影响区域（`+cells-get --include style` 或 `+sheet-info` 看合并 / 行高列宽 / 冻结），确认关键样式实际生效。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+styles-put` | write | 批量 |

## Flags

### `+styles-put`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--styles` | string + File + Stdin（复合 JSON） | required | 对**已有**表格应用的视觉规格 JSON：顶层 `{styles:[...]}`，每项对应一个目标子表（`name` 用真实子表名），并至少给 `cell_styles` / `cell_merges` / `row_sizes` / `col_sizes` / `freeze` 之一。字段词汇与 `+workbook-create` / `+table-put` 的 `--styles` 完全同构（cell_styles 用 A1 range + 扁平样式字段，边框用 `border` 简写 {style,weight,color} 四边同款、分侧才用 border_styles；row/col sizes 用行/列范围 + size（px 即像素，standard/auto 才需 type）；merges 用单元格 range；freeze 用 `{rows:N, cols:N}` 冻结前 N 行/列）。整份规格展开为一次批量提交（fail-fast：失败后哪些已生效不做统一假设，先回读确认再补发）；range 不受「本次写入区域」限制，可指向表内任意区域 |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+styles-put` `--styles`


**数组项**（类型 object）：
- `cell_merges` (array<object>?) — 单元格合并操作数组；range 使用 A1 单元格范围，merge_type 默认 all each: { merge_type?: enum, range: string }
- `cell_styles` (array<object>?) — 单元格样式操作数组；每项用 A1 单元格 range 指定范围，字段名与 +cells-set-style 对齐 each: { background_color?: string, border?: object, border_styles?: object, font_color?: string, font_family?: string, …共 14 项 }
- `col_sizes` (array<object>?) — 列宽操作数组；range 使用列范围如 A:C，给 size（px）即像素列宽（type 可省略）；type 为 standard 时不带 size each: { range: string, size?: number, type?: enum }
- `freeze` (object?) — 冻结行列：rows = 冻结前 N 行，cols = 冻结前 N 列（0 或省略 = 该维度不冻结） { cols?: integer, rows?: integer }
- `name` (string) — 子表名
- `row_sizes` (array<object>?) — 行高操作数组；range 使用行范围如 1:3，给 size（px）即像素行高（type 可省略）；type 为 standard/auto 时不带 size each: { range: string, size?: number, type?: enum }

## Examples

### `+styles-put`

表头美化 + 按组合并 + 列宽 + 冻结首行，一次交付：

```text
lark-cli sheets +styles-put --url "https://example.feishu.cn/sheets/shtXXX" --styles - <<'JSON'
{"styles":[{
  "name": "Sheet1",
  "cell_merges": [{"range":"A5:A8"},{"range":"A9:A12"}],
  "cell_styles": [
    {"range":"A1:F1","font_weight":"bold","background_color":"#1E5BC6","font_color":"#FFFFFF","horizontal_alignment":"center"},
    {"range":"A2:F30","border":{"style":"solid","color":"#DDDDDD"}}
  ],
  "row_sizes":  [{"range":"1:1","size":36}],
  "col_sizes":  [{"range":"A:C","size":120}],
  "freeze":     {"rows":1}
}]}
JSON
```

多子表同一批交付（每个子表一个 styles 项）：

```text
lark-cli sheets +styles-put --url "..." --styles - <<'JSON'
{"styles":[
  {"name":"明细","cell_styles":[{"range":"A1:H1","font_weight":"bold","background_color":"#F0F0F0"}],"freeze":{"rows":1}},
  {"name":"汇总","cell_styles":[{"range":"A1:D1","font_weight":"bold"}],"col_sizes":[{"range":"A:D","type":"pixel","size":140}]}
]}
JSON
```

### Validate / DryRun / Execute 约束

- `Validate`：`--styles` 必须是合法 JSON、`styles` 非空数组；每项 `name` 必填、至少给 `cell_merges` / `cell_styles` / `row_sizes` / `col_sizes` / `freeze` 之一；`cell_styles` 每项至少一个样式字段；展开后受子操作数（100）与总格数预算约束，超限报错给拆分建议。
- `DryRun`：输出展开后每个子操作的请求模板，不发起调用。
- `Execute`：整份规格合成一次批量请求按序执行；fail-fast。报错会列出失败的子操作及原因，但其中的 `operations[N]` 是 CLI 展开后的内部下标（含 `cell_styles` 合并），不对应 `--styles` 里的项，也不能直接按下标续发——报错会明说这一点并让你先回读再补发。


<a id="s-034aab944f0fa5b1"></a>

## references/lark-sheets-visual-standards.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 飞书表格样式与配色规范

> **本文定位**：飞书表格"正确视觉输出"的取值标准与美化决策流——配色、表头、对齐、数值格式、斑马纹、列宽行高、图表展示，以及新增 / 继承 / 美化已有区域三类场景的做法。
> **边界**：本文只讲"样式长什么样、怎么决策"；**怎么调用工具写入样式**（`cell_styles` / `border_styles` 字段、合并、resize 等参数）见 `references/lark-sheets-write-cells.md` / `references/lark-sheets-range-operations.md` / `references/lark-sheets-batch-update.md`。**条件格式**（高亮 / 标红 / 数据条 / 色阶）见 `references/lark-sheets-conditional-format.md`。本文不含 shortcut，通用编辑准则见主 SKILL.md「飞书表格编辑准则」。

## 最高优先级原则

- **用户指令优先**：用户明确提出的格式要求（如"使用红色背景"）具有最高权重，即使与通用审美冲突。
- **继承原表风格**：编辑前先采样原文件视觉特征（色系、边框、对齐、数字格式），新增内容必须与之对齐。严禁对已有风格的文件强行施加通用标准化格式。
- **扩展而非覆盖**：新增行列或追加数据时，目标是"扩展原模板"——继承邻近区域的表头风格、条纹节奏、边框层级、对齐方式、数字格式和列宽/行高策略。
- **美化只动样式属性，不动数据**：对**已有区域**做美化时，**只能**修改 `font` / `fill` / `border` / `alignment` / `number_format` 这 5 类样式属性。**禁止**改动原始单元格的 `value` / `formula`、合并区域、行列结构、Sheet 名称。如果美化需求需要改变数据布局（例如"汇总行加进表里"），必须把"加汇总行"和"美化"拆成两步，前者属于编辑动作、需另行得到用户授权。
- **不可见视觉属性也属保护对象**：原表的**合并范围、对齐方式（H-Align/V-Align）、行高列宽、数字格式**是用户能感知但不一定会明示的视觉属性。即使用户没说"保留这些"，**禁止**因写入新内容而修改它们；写公式 / 写值 / 写新列时只传 `value` / `formula`，不要重置 `alignment` / `number_format` 等字段为默认值（重置等同于改动）。**例外**：用户明示要修改这些属性时（如"调整对齐 / 合并 / 列宽"）才能动；用户**点名美化**（"美化 / 让表清晰 / 适合打印"）视同授权下节 checklist 的全部 5 个维度（含列宽行高）。
- **标红 / 高亮默认用背景色**：用户说"标红 / 标出来 / 高亮"时，默认改**背景色**（可叠加字体色）——背景色在人工核对与导出后都更醒目；仅当用户明确说"字体标红"才只改字体色。
- **打印 / 下载类任务的完成标准是导出后也无遮挡**：涉及"适合打印 / 下载 / 导出"时，飞书表格调整完行高列宽后，导出 xlsx 再检查一次无截断、无 `####`、无溢出；长文本列给足列宽并设明确行高兜底值，不要只依赖 auto。
- **美化范围必须覆盖所有用户语义目标**：用户说"给表格加边框 / 美化整个表"时，范围 = 实际数据区域**含所有数据行**（含汇总行、总计行、表尾备注行），不能停在"看起来主体内容结束"的地方。落地前先用 `current_region` + 末尾 5~10 行核对真实末行（同 `references/lark-sheets-read-data.md` 的「确定数据范围的正确流程」），再设置美化范围。范围漏掉用户提到的目标行 / 列视为未完成，需补齐后再交付。

## 美化任务 5 维度 checklist（用户**点名美化**——"美化 / 让表更清晰 / 适合打印"时必做；"整理"默认指数据整理，不触发本节）

当用户**点名美化**（"美化 / 让表清晰 / 适合打印 / 调整样式"——"整理"不算，那是数据整理）时，**必须**遍历以下 5 个维度逐一落地，只做一项（如只加边框）就交付是不完整的。**已有表点名美化时，5 个维度的取值先沿用原表色系 / 对齐（继承原则优先），checklist 只补原表缺失的维度**：

1. **表头格式区分**：表头行加粗 + 背景色填充（与数据行有色差）+ 居中对齐；多行表头时全部行同步处理
2. **对齐方式**：文本列左对齐、数值 / 货币 / 百分比列右对齐、日期 / 分类列居中；垂直方向统一居中
3. **数值格式**：每列统一小数位 + 千分位（用 `number_format`）；金额列统一货币符号；同一列内**禁止**出现 0 位 / 1 位 / 2 位小数混杂
4. **边框**：覆盖范围按上方「美化范围必须覆盖所有用户语义目标」规则（含汇总 / 总计 / 表尾说明行），内外框线清晰
5. **列宽 + 行高 + 自动换行**：详细规则见 `references/lark-sheets-range-operations.md` 的「写入后列宽自适应」章节（按最长字符数扩列宽 / 长文本设置 `cell_styles.word_wrap="auto-wrap"` + 调高行高 / 长数字设置 `number_format` 防科学计数法）

**差异化标注场景**：用户要求"重复行 / 异常值 / 重要项视觉区分"时，标注列 / 行必须设置与普通数据**显著不同**的 `cell_styles`（背景色 + 加粗 + 字体色至少改一项），不能与普通数据格式完全一致。

**显式要求边框 / 表头 / 对齐时同样按上面标准落地**（不必等用户说"美化"）：① 用户说"给某矩形区域加边框"必须**整个矩形含表头行、数据行、汇总行全部加内外框**，落地后核起 / 末行、末列三边界（反例：要求加边框的区域实际无任何边框）；② **新建表头前先确认哪一行才是表头**——别把已有的第一行数据误当表头刷成蓝底白字，真正该加的表头列也要建出来（反例：把第一行数据误设成了表头样式）；③ 新增 / 编辑区域的字号必须与原表一致，禁止 13 号与 14 号、10 号与 11 号混杂（反例：新列字号与原表不一致）。

## 通用样式规范

> 以下取值标准都在「最高优先级原则」的**继承原表风格 / 扩展而非覆盖**前提下生效：凡涉及"沿用原表"的条目，遵循该原则即可，本节不再逐条复述。

### 1. 表头样式

- 表头/汇总行须与数据区域有明确视觉区分。
- 使用低饱和度背景色搭配字体颜色（如深蓝 + 白字，浅蓝 + 黑字），文字加粗、水平居中。
- 表头覆盖多列时使用合并单元格。

### 2. 数据区域样式

- 减少垂直线条，优先使用水平浅灰细线。
- **对齐方式**：文本左对齐，数值/货币/百分比右对齐，日期或分类居中，所有内容垂直居中。
- 次要信息（备注、次要日期等）使用缩小字号或浅灰色。
- **Zebra Stripes**：数据行 > 10 行时可使用交替背景色引导视线。
  - 设置前先清理原区域背景色为白色（#FFFFFF），再设置斑马纹色，避免新旧混杂。
  - 优先直接设置单元格背景色，而非条件格式（除非用户要求）。
  - 推荐配色：奇数行 #FFFFFF，偶数行 #F3F4F6 或 #EBF1F8。

### 3. 数值格式

- 百分比使用 `%` 符号，适当注明单位和货币符号（¥、$）。
- 大于 1000 的数字使用千分位符，保留一致的小数位数（1–2 位）。
- 涉及数据检索的须注明数据来源。
- 可使用数据条/色阶/条件格式增强可视化。

### 4. 整体结构

- 数据行超过一屏的长表 / 宽表，收尾冻住表头（表头上方还有标题 / 说明行时一并冻住）：`+dim-freeze` 或 `+styles-put` 的 `freeze` 一次给全行列（整份状态覆盖，拆两次只留最后一次的轴），再 `+sheet-info` 回读确认。原表已有冻结设置的不动。
- **长文本处理**：启用自动换行，行高合理调整以确保阅读舒适，添加适当垂直留白，目标是清晰、专业、不拥挤的布局。
- 保持表格简洁，合理分组（可用合并单元格展示分组），在适当位置添加合计或汇总行。
- **区域分隔**：多阶段或多类别时，使用柔和背景色块进行逻辑分区，而非简单边框。
- **增删行列的样式规则**：
  - 新增整列继承同组列的表头样式、列宽、对齐和数字格式；新增整行继承同层级数据行或汇总行风格，避免写成表头风格。追加列时需判断是否应加入已有合并单元格（常见于顶部标题行）。
  - 若追加位置紧邻汇总行、说明区或空白分隔区，先判断真实数据区域边界再操作，避免破坏原有结构。
  - **Zebra Stripes 维护**：插入或删除行后若影响后续行奇偶性，须从受影响行往后重建条纹（先清理再重设）。少量增删用局部重建，大量变动用全局清理+统一重建。
  - 具体采样与复制流程见下方「场景二：从已有区域继承美化」。
- **列宽 / 行高调整**（飞书 `+cols-resize` / `+rows-resize` 直接给像素值：统一尺寸用 `--range` + `--width`/`--height <px>`，多列 / 多行不同尺寸用 `--widths`/`--heights` map 一次调用完成，如 `--widths '{"A":100,"C:E":120}'`）：
  - 禁止硬编码固定列宽，须根据该列实际内容长度估算像素。
  - 经验估算：中文每字约 15-18px，英文/数字每字约 7-9px，外加 10-16px padding。
  - 上下限建议 80~400px；超上限启用自动换行（`word_wrap: auto-wrap`）+ 调整行高，而非无限加宽。
  - 合并单元格不参与列宽计算，避免撑宽单列。
  - 复制自原文件的列优先沿用原列宽，不重新计算覆盖。

### 5. 配色

- 优先沿用原表色板与明暗层级（见「继承原表风格」），新增区域不凭空换色，确保视觉连续。
- 背景填充选择柔和色（如浅蓝 `#DDEBF7`），区分颜色时优先同一主题色不同深浅，避免超过 3 种主题色。

### 6. 图表展示

- 遵循用户指令选择图表类型，或匹配用户意图（饼图 → 占比，折线图 → 趋势）。
- 包含必要元素：标题、坐标轴标题、多系列图例；普通基础图先按开启数值标签运行尺寸建议器并默认展示，密集时依次采用建议尺寸、稀疏标签、Top-N 或拆图；目标线等常量系列不显示逐点重复标签。
- Y 轴显示范围默认交给图表引擎，不按数据源单列的最小值 / 最大值主动设限；组合图先比较系列单位和量级，把会被压扁的系列放到右轴。
- 饼图默认将图例放在底部；尺寸建议器保持相对固定的饼区，主要按最长标签增加两侧留白。类别过多或数值高度偏斜时优先 Top-N 或条形图，避免靠无限加宽解决。
- 创建前运行 `scripts/lark_chart_size_advisor.py`，使用其 `create_flags`；若提示仅放大无法解决，则改用条形图、Top-N 或拆图。创建后运行 `scripts/lark_chart_quality_check.py`。
- 优先继承原表配色，同一指标跨图保持同色；组合图使用同色系柱形和高对比折线，辅助系列使用中性色。分类色过多时优先精简数据，不依靠更多相近颜色区分。
- **图表放置防重叠**：新增图表前须计算放置区域，避免与已有图表重叠。具体步骤：
  1. 调用 `+chart-list` 获取当前工作表所有已有图表的 `position`（锚点单元格：`col` 是列字母如 "A"/"B"、`row` 是 1-based 行号；以 `+chart-list` 实际返回字段为准）、`offset`（锚点内偏移：`row_offset`、`col_offset`，单位像素）以及 `size`（`width`、`height`，单位像素）。
  2. 获取工作表的行高和列宽信息（像素）。
  3. 根据每个图表的锚点 `position.row`/`position.col` + 偏移 `offset.row_offset`/`offset.col_offset` + 尺寸 `size.width`/`size.height`，结合行高列宽，计算出每个已有图表覆盖的像素矩形区域 `(x_min, y_min, x_max, y_max)`。
  4. 为新图表选定大小后，候选放置位置应避开所有已有矩形区域；若存在重叠则向下或向右偏移，直至找到无冲突位置。
  5. 若工作表已无足够空间，优先向下方空白区域放置，保持图表间至少 1 行或 1 列的间距。

> 飞书表格中颜色需带 `#` 前缀（如 `#0070C0`），与 openpyxl 的无前缀写法不同。
> 具体工具调用参数格式，请读取对应工具 skill（`references/lark-sheets-write-cells.md`、`references/lark-sheets-conditional-format.md`、`references/lark-sheets-range-operations.md` 等）。

---

## 场景化操作指南

### 场景一：新增独立样式

> 适用情况：在表格中创建全新的、具有独立视觉特征的区域，如汇总行、新表头、独立数据表等。

#### 1A. 添加汇总行 / 表头行

**决策流程：**
1. 先用 `+cells-get` 读取目标位置上方的数据区域，确认数据边界和已有样式（背景色、字体大小等）
2. 如果需要新增空行，先用 `+dim-{insert|delete|hide|unhide|freeze|group|ungroup}` 插入行
3. 用 `+cells-set` 写入汇总公式 + 特殊样式（背景色区分 + 加粗 + 边框）
4. 如果汇总行标题需要跨列显示，追加 `+cells-{merge|unmerge}` 合并标题区域

**样式要点：**
- 汇总行使用比数据区域更深的同色系背景（如数据区 #EBF1F8 → 汇总行 #D6E4F0 或 #4472C4 + 白字）
- 必须加粗，水平对齐方式与数据列一致（数值列右对齐，文本列左对齐）
- 上方加一条较粗的边框线，与数据区域形成视觉分隔

#### 1B. 添加独立数据表/独立区域

**决策流程：**

1. 新建 sheet，或用 `+cells-get` 或 `+workbook-info` 确认已有表格的占用范围，找到空闲区域
2. 用 `+cells-get` 采样已有表格的表头样式（背景色、字体大小、字重、对齐方式）和数据区域样式
3. 新表头复用已有表头的配色和字体参数（保持风格统一），但内容和列宽可独立
4. 新数据区域复用已有数据区域的对齐规则、边框风格、数字格式
5. 用 `+cells-set` 一次性写入新表头 + 数据

**样式要点：**
- 必须复用：背景色色系、字体大小、字重、边框风格
- 可以独立：列宽、行高、具体数字格式（根据新数据的类型调整）
- 新旧表格之间至少留 1~2 行空白作为视觉分隔

### 场景二：从已有区域继承美化

> 适用情况：新增的行/列/区域与已有内容性质相同（数据类型、层级一致），需要无缝衔接已有格式。

#### 2A. 继续补充行/列（数据性质与已有内容一致）

**核心规则**：采样紧邻 2 行 → 判断并延续 Zebra Stripes 奇偶性 → 按 write-cells 的继承清单带齐样式写入。

**斑马纹延续要点**（本节只管"奇偶判断"这一标准，"带哪些样式字段写入"的机制见下方指针）：

- 至少读 2 行（末行 + 倒数第二行）才能判断是否有斑马纹交替色
- 若倒数两行背景色不同（如 #FFFFFF 与 #F3F4F6），新行按奇偶延续，不要固定一个色

> 具体继承哪些字段、怎么采样与写入（`+cells-get` 读源行 `cell_styles` + `border_styles`、`+sheet-info --include row_heights,merges` 读行高合并、带齐 6 类样式写入）见 `references/lark-sheets-write-cells.md` 的「新增列 / 新增行的样式继承」章节——`border_styles` 四边易遗漏，以那里为准。

#### 2B. 基于模板区域的修改（copy 保留所有格式）

**核心思路：三步分层法**

```
Step 1 — 格式铺开：`+range-copy --paste-type formats`
  └── 将模板行/区域的 **全部格式**（样式、边框、数字格式、数据验证等）复制到目标区域
  └── 即"格式刷"——只复制格式，目标值/公式保留
  └── 若需连带公式平移填充（如公式列结构一致），改用 `+range-fill --series-type copy`

Step 2 — 内容覆写：`+cells-set`（仅传 value/formula，不传任何样式）
  └── 将每行实际数据写入，cell_styles 全部省略，因为格式已在 Step 1 中就位

Step 3 — 微调收尾：`+rows-resize --heights` / `+cols-resize --widths`（行高列宽 map 一次调用完成）、`+cells-{merge|unmerge}` 等
  └── 调整行高列宽、处理合并单元格、扩展条件格式范围等边缘情况
```

**关键注意事项：**
- Step 1 用 `+range-copy --paste-type formats` 时只铺格式、不动值/公式，Step 2 再用 `+cells-set` 写值即可（`+cells-set` 默认覆盖，无需额外 flag）；若 Step 1 用 `--paste-type all` 连带复制了值/公式，Step 2 写入同样会覆盖（默认行为）
- `+range-fill --series-type auto`（或 `linear`/`date`）会自动递增数字序列（1→2→3）和日期序列，`+range-fill --series-type copy` 则原样复制值但公式引用会自动平移
- 如果模板区域存在合并单元格，copy/fill 不会复制合并状态，必须在 Step 3 中用 `+cells-{merge|unmerge}` 补全
- 如果模板区域有条件格式，需要在 Step 3 中通过 `+cond-format-update` 扩展 ranges

**场景：纯"格式刷"（用户说"把 A 列样式应用到 B 列"、"格式复制过去"、"只刷格式不改数据"）**

单步即可，无需三步分层：调用 `+range-copy --paste-type formats`，`--source-range` 为样式来源、`--target-range` 为目标起点。参数细节见 `references/lark-sheets-range-operations.md`。

### 场景三：已有区域格式美化

> 适用情况：对已存在数据的区域进行格式美化（不改变数据内容），重点处理表头、汇总行等特殊行的识别与格式设置，需特别注意合并单元格的安全操作。

#### 整体操作流程

```
1. 探查阶段
   ├── `+workbook-info` → 获取子表列表、行列数、冻结位置
   ├── `+sheet-info --include merges` → 获取合并区域
   ├── `+cells-get`（前几行 + 末尾几行，`--include style`）→ 采样表头/数据区/汇总行样式
   └── 分析结果 → 建立区域地图（表头行号、数据起止行号、汇总行号、合并区域列表）

2. 规划阶段
   ├── 判断表头行：通常第 1 行或前 2 行，特征为加粗/背景色/合并/居中
   ├── 判断汇总行：通常最后 1~2 行，特征为加粗/SUM/AVERAGE 公式/更深背景色
   ├── 判断合并区域：从 `+cells-get` 返回中识别（多个单元格同值且样式相同通常暗示合并）
   └── 制定美化方案：按区域分别设置样式

3. 执行阶段（按顺序）
   ├── 先处理合并单元格（如需取消合并再重新合并，必须先 unmerge 再 merge）
   ├── 设置表头样式
   ├── 设置数据区域样式
   ├── 设置汇总行样式
   └── 调整列宽行高
```

#### 美化中的合并单元格要点

- 编辑前先识别已有合并区域（见探查阶段），避免破坏原有语义分区。
- 美化表头/分组标题时，若需修改合并区域的范围或样式，遵循"先 `unmerge` → 修改 → 再 `merge`"顺序。
- 合并区域样式只写左上角，不要对合并内的其他单元格重复写入样式。

> 合并单元格完整的安全操作规则（含数据保护、样式占位等 5 条）见 `references/lark-sheets-range-operations.md` 的 `+cells-{merge|unmerge}` 章节。


<a id="s-5f22cba1f763b5d3"></a>

## references/lark-sheets-workbook.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Workbook

## Sheet 结构变更保守化（编辑类任务必做）

`+sheet-{create|delete|rename|move|copy|hide|unhide|set-tab-color}` 会改变原表的物理结构，是高副作用动作。执行前必须遵守：

1. **删除 / 重命名 / 隐藏 / 移动原 Sheet 需用户明示**：除非用户明示要这些操作，**禁止**擅自对**已存在**的 Sheet 执行 delete / rename / hide / move。新建 Sheet 是允许的（用于承载中间结果或透视表 / 图表对象），但应优先在原表右侧加列；只有当中间结果数量较大或会与原数据混淆时，才新建空白 Sheet（同 R1）。
2. **Sheet 级操作前先列清单**：调用 `+sheet-{create|delete|rename|move|copy|hide|unhide|set-tab-color}` 之前，必须先调用 `+workbook-info`，把"当前所有 Sheet 名 + 可见性 + 行列数"列出来，再决定是否操作。禁止跳过列清单直接 create / delete / rename。
3. **删除 / 重命名前向用户确认**：删除是不可逆的，重命名会让其他公式 / 透视表 / 图表的数据源失效——执行前必须在回复里确认"将删除 / 改名 X，影响 Y 个引用"。

## 使用场景

读写。管理工作簿结构。本 reference 覆盖 14 个 shortcut：

| 操作需求 | 使用工具 | 说明 |
|---------|---------|------|
| 查看工作簿结构 | `+workbook-info` | 获取子表列表、名称、行列数、冻结位置等元数据 |
| 获取当前 revision | `+revision-get` | 获取当前文档 revision（版本号），可作为 recover / undo / changeset 复核的版本锚点 |
| 新建工作簿（可预填数据） | `+workbook-create` | 从内存数据建一张新表（`--values` / `--sheets` typed） |
| 导入本地文件为新表 | `+workbook-import` | 把本地 `.xlsx` / `.xls` / `.csv` 导入为新的飞书电子表格 |
| 导出工作簿到本地 | `+workbook-export` | 导出为本地 `.xlsx`（整簿）或单子表 `.csv` |
| 变更工作簿结构 | `+sheet-{create|delete|rename|move|copy|hide|unhide|set-tab-color}` | 新建/删除/移动/重命名/复制/隐藏子表、修改标签颜色 |
| 切换子表网格线显隐 | `+sheet-show-gridline` / `+sheet-hide-gridline` | 显示 / 隐藏单个子表的网格线 |

注意：

- 如果用户请求包含多个动作，例如"先重命名，再新建工作表"，请按顺序发起多次调用，覆盖全部动作
- `create` 时若用户指定了工作表名称，应显式传入 `sheet_name`；不要省略后依赖默认命名
- 若 `+workbook-info` 返回包含 `warning_message`，说明部分 `sheet_id` 已失效（被删除/改名或输入错误），应停止复用这些 id，重新不带 `sheet_ids` 全量获取结构后再继续操作

**常见配置错误（必须注意）**：
- **获取结构是第一步**：任何表格操作前必须先调用 `+workbook-info`，不要跳过直接操作。返回的行列数、子表列表是后续所有操作的基础
- **sheet_id 不要写错**：从 `+workbook-info` 返回值中精确获取 `sheet_id`，不要手动拼写或从 URL 中猜测
- **未点名网格目标**：默认候选仅 `resource_type=sheet && is_hidden=false` 的可见普通网格；唯一候选才自动选，多候选按用户给的表名/表头/内容匹配，仍不唯一则询问。禁止按 `index` 或猜 `Sheet1`；用户显式点名 hidden sheet 可操作，bitable / `#UNSUPPORTED_TYPE` 改走对应产品 API。
- **xlsx 验收触发边界**：普通在线交付不导出。只有用户明确要求本地 xlsx / 下载 / 打印时，才在 `--output-path` 导出后验收；本地 Excel 输入则直接验证导入前已有的本地文件，导入在线后不再导出回验。允许触发时确认文件存在、可重开，并核对公式错误值、样式和对象。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+workbook-info` | read | 工作簿 |
| `+sheet-list` | read | 工作簿 |
| `+revision-get` | read | 工作簿 |
| `+sheet-create` | write | 工作簿 |
| `+sheet-delete` | high-risk-write | 工作簿 |
| `+sheet-rename` | write | 工作簿 |
| `+sheet-move` | write | 工作簿 |
| `+sheet-copy` | write | 工作簿 |
| `+sheet-hide` | write | 工作簿 |
| `+sheet-unhide` | write | 工作簿 |
| `+sheet-set-tab-color` | write | 工作簿 |
| `+sheet-hide-gridline` | write | 工作簿 |
| `+sheet-show-gridline` | write | 工作簿 |
| `+workbook-create` | write | 工作簿 |
| `+workbook-export` | read | 工作簿 |
| `+workbook-import` | write | 工作簿 |

## Flags

### `+workbook-info`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-list`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+revision-get`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-create`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--title` | string | required | 新工作表名称 |
| `--index` | int | optional | 插入位置（0-based）；省略时附加到末尾 |
| `--row-count` | int | optional | 初始行数（默认 200，上限 50000） |
| `--col-count` | int | optional | 初始列数（默认 20，上限 200） |
| `--type` | string | optional | 新子表类型：sheet（电子表格）；默认 sheet（可选值：`sheet`） |

### `+sheet-delete`

_公共四件套 · 系统：`--yes`、`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-rename`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--title` | string | required | 新名称 |

### `+sheet-move`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--index` | int | required | 目标位置（0-based） |
| `--source-index` | int | optional | 源位置（0-based）；standalone 调用时可选，未传时由 CLI runtime 根据 `--sheet-id` / `--sheet-name` 当前在工作簿中的 index 自动派生。但在 `+batch-update` 内不可省（须显式传）——batch 中途无法发起结构查询自动派生 |

### `+sheet-copy`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--title` | string | optional | 副本名称；省略时由服务端生成 |
| `--index` | int | optional | 副本插入位置（0-based）；省略时附加到末尾 |

### `+sheet-hide`

_公共四件套 · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-unhide`

_公共四件套 · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-set-tab-color`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--color` | string | required | Hex 色值如 `#FF0000`，传空 `""` 清除 |

### `+sheet-hide-gridline`

_公共四件套 · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+sheet-show-gridline`

_公共四件套 · 系统：`--dry-run`_

_仅含公共 / 系统 flag。_

### `+workbook-create`

_系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--title` | string | required | 新 spreadsheet 标题 |
| `--folder-token` | string | optional | 目标文件夹 token；省略时放在云空间根目录 |
| `--values` | string + File + Stdin（简单 JSON） | optional | untyped 初始数据，一个 JSON 二维数组（表头并入第一行）：`[["列A","列B"],["alice",95]]`；值原样写入、类型由飞书自动识别（日期 / 数字会落成文本，需类型保真改用 --sheets），走与 --sheets 相同的分批 `+cells-set`；配 --styles 控制格式/颜色/合并/行列尺寸 |
| `--sheets` | string + File + Stdin（复合 JSON） | optional | 建表后写入的 typed 表格协议 JSON（同 +table-put）：顶层 `{"sheets":[...]}`，每个数组项是一张子表 `{name, start_cell?, mode?, header?, allow_overwrite?, columns:["colA","colB",...], data:[[...]], dtypes?:{colA:pandasDtype, ...}, formats?:{colA:numberFormat, ...}}` —— `name` 与外层 `sheets` 数组都不可省。Agents 用 `scripts/lark_sheets_df.py.txt` 的 `df_to_sheet(df, name)` 把 DataFrame 转成一项再包 `{"sheets":[...]}`。与 --values 互斥；新表默认子表复用为第一个子表，日期/数字类型保真。 |
| `--styles` | string + File + Stdin（复合 JSON） | optional | 建表时同时写入的视觉处理操作 JSON：顶层 `{styles:[...]}`，每项对应一个目标子表、含 `name`，并至少给 `cell_styles` / `row_sizes` / `col_sizes` / `cell_merges` 之一。`cell_styles` 用 A1 单元格 range + 扁平样式字段（字段同 +cells-set-style，含 number_format / 颜色 / 对齐 / border_styles）；row/col sizes 用行/列范围 + type/size；merges 用单元格 range + 可选 merge_type。与 --sheets 搭配时 styles 数组长度/顺序/name 必须与 --sheets.sheets 对应；与 --values 搭配时只给一个 styles 项（其 name 忽略）。完整 cell_styles 字段结构跑 `+workbook-create --print-schema --flag-name styles`。 |

### `+workbook-export`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--file-extension` | string | optional | 导出文件格式；`csv` 模式必须配 `--sheet-id`（可选值：`xlsx` / `csv`）（默认 `xlsx`） |
| `--sheet-id` | string | optional | 仅 csv 模式必填：指定要导出哪张 sheet 为 CSV。这是 `+workbook-export` 专有 flag，与公共四件套的 sheet 定位无关（本 shortcut 不接受公共 sheet 定位） |
| `--output-path` | string | optional | 本地保存路径；省略时**只触发并轮询导出任务、不下载文件**（返回 file_token / status，便于稍后续传）。要落盘传具体路径（如 `./out.xlsx`）或目录（如 `.`，服务端给的文件名落在该目录下）。注意：对应的 `lark-cli drive +export --doc-type sheet` 走 `--output-dir` / `--file-name` / `--overwrite` 三 flag 且默认下载到当前目录——本 wrapper 把它们合成单一 `--output-path` 简化常见用例，但默认不下载，需要的话也可改用 `drive +export`。 |

### `+workbook-import`

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--file` | string | required | 本地文件路径（.xlsx / .xls / .csv） |
| `--folder-token` | string | optional | 目标文件夹 token；省略则导入到云空间根目录 |
| `--name` | string | optional | 导入后表格名称；省略则用本地文件名（去掉扩展名） |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+workbook-create` `--sheets`

_一个或多个子表的 typed 数据，每个数组元素写入一张子表；支持多 DataFrame → 多子表一次写入_

**数组项**（类型 object）：
- `name` (string) — 目标子表名
- `start_cell` (string?) — 写入起点单元格（A1 记法，如 "B2"），默认 "A1"
- `mode` (enum?) — overwrite（默认）：从 start_cell 起写「表头 + 数据」块；append：把数据追加到子表已有数据下方（默认不重复表头） [overwrite / append]
- `header` (boolean?) — 是否写一行列名表头
- `allow_overwrite` (boolean?) — 为 false 时，若写入会落在非空单元格则拒写以保护原数据（返回 partial_success）
- `columns` (array<string>) — 列名字符串数组，顺序与 `data` 中每行取值一一对应
- `data` (array<array<string|number|boolean|null>>) — 数据行；每行是一个数组，长度必须等于 `columns` 数
- `dtypes` (object?) — 可选
- `formats` (object?) — 可选

### `+workbook-create` `--styles`


**数组项**（类型 object）：
- `cell_merges` (array<object>?) — 单元格合并操作数组；range 使用 A1 单元格范围，merge_type 默认 all each: { merge_type?: enum, range: string }
- `cell_styles` (array<object>?) — 单元格样式操作数组；每项用 A1 单元格 range 指定范围，字段名与 +cells-set-style 对齐 each: { background_color?: string, border?: object, border_styles?: object, font_color?: string, font_family?: string, …共 14 项 }
- `col_sizes` (array<object>?) — 列宽操作数组；range 使用列范围如 A:C，给 size（px）即像素列宽（type 可省略）；type 为 standard 时不带 size each: { range: string, size?: number, type?: enum }
- `freeze` (object?) — 冻结行列：rows = 冻结前 N 行，cols = 冻结前 N 列（0 或省略 = 该维度不冻结） { cols?: integer, rows?: integer }
- `name` (string) — 子表名
- `row_sizes` (array<object>?) — 行高操作数组；range 使用行范围如 1:3，给 size（px）即像素行高（type 可省略）；type 为 standard/auto 时不带 size each: { range: string, size?: number, type?: enum }

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。`+workbook-info` 只用前两者；`+sheet-*` 系列对单个工作表操作，需 `--sheet-id` 或 `--sheet-name`。

### `+workbook-info`

输出契约：返回 `sheets[]`，每个含 `sheet_id` / `title`（工作表显示名；旧 payload 用 `sheet_name`，读取时优先取 `title`、缺失再回退 `sheet_name`）/ `index` / `resource_type` / `row_count` / `column_count` / `is_hidden`，以及计数字段 `merged_cells_count` / `chart_count` / `pivot_table_count` / `float_image_count`（无 `frozen_*` 字段，冻结信息请用 `+sheet-info` 读取）。是操作飞书表格的第一步——任何后续 sheet 级动作都需要先拿这里的 sheet_id。

> **子表类型 `resource_type`**：`sheet`（普通网格子表）/ `bitable`（内嵌的多维表格子表）/ `#UNSUPPORTED_TYPE`（其它暂不支持的嵌入子表）。
> - 网格类操作（读写单元格 / 区域 / 样式 / CSV / 筛选 / 透视 / 图表等）**仅适用于 `sheet`**。对 `bitable` / `#UNSUPPORTED_TYPE` 子表执行网格操作会被直接拒绝并返回明确报错，不再静默出错。
> - 要操作 `bitable` 子表里的数据：该子表条目会附带 `bitable_app_token` + `bitable_table_id` 两个字段，直接用多维表格命令操作，例如 `lark-cli base +record-list --base-token <bitable_app_token> --table-id <bitable_table_id>`（记录增删改查、字段、视图等整套 `lark-cli base` 命令均可用）。不要走 sheets 网格命令。
> - `bitable` / `#UNSUPPORTED_TYPE` 子表条目**只含** `sheet_id` / `sheet_name` / `index` / `resource_type`（bitable 另加上述两个 token）以及 `is_hidden` / `tab_color`；**不输出** `row_count` / `column_count` / `merged_cells_count` / `chart_count` / `pivot_table_count` / `float_image_count` / `frozen_*` 等网格指标（对非网格子表无意义）。
> - tab 管理类操作（`+sheet-rename` / `+sheet-move` / `+sheet-delete` / `+sheet-hide` 等）对任意 `resource_type` 的子表都合法，不受此限制。

### `+revision-get`

输出契约：返回单个 `revision` 字段，即当前文档版本号。它是 recover / undo / `+changeset-get` 的版本锚点：如果刚执行过一次读写操作，也可以直接复用那次响应里的 `revision`；当只想单独取当前版本号、且不需要其它结构信息时，用 `+revision-get` 最直接。

### `+workbook-create`

新建电子表格，可选预填数据。两种数据入口（untyped `--values` / typed `--sheets` JSON）**互斥**，按需选一——两者都走同一条分批写入：

> ⚠️ **`--title` 必填，且不会从数据里推断**：它是这张表在云空间里的名字，漏了会在建表之前就失败（`required flag(s) "title" not set`），数据一行都不会写。子表名写在 `--sheets` 的 `name` 字段里，两者是两码事——`--title "2026年Q3销售分析"` 配 `--sheets` 里的 `"name": "明细"`。

```text
# 1) untyped：--values（一个二维数组，表头并入第一行；值原样写、类型由飞书自动识别，
#    日期会落成文本，配 --styles 控制格式）
lark-cli sheets +workbook-create --title "销售" \
  --values '[["门店","销售额"],["北京",259874]]'

# 2) typed JSON：--sheets（一步建表 + 类型保真）。date 列落成真日期（可排序/透视）、
#    number 不丢精度、string 列保前导零（如订单号 00123）；多子表一次建。
lark-cli sheets +workbook-create --title "交易" --sheets '{
  "sheets":[
    {"name":"明细",
     "columns":["日期","金额","单号"],
     "dtypes":{"日期":"datetime64[ns]","金额":"float64","单号":"object"},
     "formats":{"金额":"#,##0.00"},
     "data":[["2024-01-15",1234.5,"00123"]]}
  ]}'
```

`--sheets` 协议与 `+table-put` 完全同构（字段含义见 lark-sheets-write-cells 的 `+table-put`，大 payload 走 stdin / `@file`）。关键差异：**新建工作簿的默认子表会被复用为第一个子表**（重命名后承载数据），不会残留空 `Sheet1`；其余子表按需新建。它把 `+table-put` 单独做不到的"建表 + typed 写入"合到一条命令，是「pandas 算完直接落地一张带真日期的新表」的首选。回读校验用 `+table-get`（与 `--sheets` 同构、可 round-trip）。

> 💡 pandas DataFrame 走 `--sheets` 时直接 `from lark_sheets_df import df_to_sheet`（[`scripts/lark_sheets_df.py.txt`](lark-sheets-0.md#s-958a212184321d2d)，与 `+table-put` 共用同一份 helper），多子表场景 helper 优势更明显：
> ```python
> import sys; sys.path.insert(0, "scripts")  # cwd 不在 skill 根时改成 scripts/ 的实际路径
> from lark_sheets_df import df_to_sheet
>
> payload = {"sheets": [df_to_sheet(income, "Income Statement"),
>                       df_to_sheet(balance, "Balance Sheet"),
>                       df_to_sheet(cashflow, "Cash Flow")]}
> ```

`--styles` 可在建表写入时同时写视觉处理。它和 `--sheets` 一样只有一种外层写法：顶层对象里放 `styles` 数组；数组每项对应一个子表，含 `name`，并按能力拆成四类可选数组：

- `cell_styles`：像 `+cells-set-style`，用 A1 单元格 `range` 加扁平样式字段（`font_weight` / `background_color` / `horizontal_alignment` / `vertical_alignment` / `number_format` 等）和可选 `border_styles`；这些样式会随内容在同一次写入里一并应用。完整字段跑 `+workbook-create --print-schema --flag-name styles`。
- `cell_merges`：用 A1 单元格 `range` 设置合并，`merge_type` 默认为 `all`，可选 `rows` / `columns`。
- `row_sizes`：用行范围（如 `1:3`）设置行高，`type` 为 `pixel` / `standard` / `auto`；`pixel` 需要 `size`。
- `col_sizes`：用列范围（如 `A:C`）设置列宽，`type` 为 `pixel` / `standard`；`pixel` 需要 `size`。

同一单元格命中多个 `cell_styles` 项时，后面的操作继续合并覆盖已传字段。`cell_merges` / `row_sizes` / `col_sizes` 在内容写入后顺序执行。

```text
# 3) untyped：仍用 {"styles":[...]}，只有一个子表样式项（name 忽略）；range 覆盖 --values 初始区域
lark-cli sheets +workbook-create --title "销售" \
  --values '[["门店","销售额"],["北京",259874],["上海",198320]]' \
  --styles '{
    "styles":[
      {"name":"Sheet1","cell_styles":[
        {"range":"A1:B1","font_weight":"bold","background_color":"#f5f5f5","horizontal_alignment":"center","vertical_alignment":"middle"},
        {"range":"B2:B3","number_format":"#,##0"}
      ]}
    ]
  }'

# 4) typed 单子表：--styles.styles[0].name 必须对应 --sheets.sheets[0].name
lark-cli sheets +workbook-create --title "交易" --sheets '{
  "sheets":[
    {"name":"明细",
     "columns":["日期","金额"],
     "dtypes":{"日期":"datetime64[ns]","金额":"float64"},
     "formats":{"金额":"#,##0.00"},
     "data":[["2024-01-15",1234.5]]}
  ]}' --styles '{
    "styles":[
      {"name":"明细",
       "cell_styles":[
        {"range":"A1:B1","font_weight":"bold","background_color":"#f5f5f5",
          "border_styles":{"bottom":{"style":"solid","weight":"thin","color":"#000000"}}},
        {"range":"A2:A2","number_format":"yyyy-mm-dd"},
        {"range":"B2:B2","number_format":"#,##0.00","font_color":"#0f7b0f"}
       ],
       "cell_merges":[{"range":"A1:B1"}],
       "col_sizes":[{"range":"A:B","type":"pixel","size":120}],
       "row_sizes":[{"range":"1:1","type":"pixel","size":28}]}
    ]
  }'

# 5) typed 多子表：styles 数组和 sheets 数组长度、顺序、name 都必须一致
lark-cli sheets +workbook-create --title "经营看板" --sheets '{
  "sheets":[
    {"name":"收入","columns":["月份","收入"],"dtypes":{"收入":"int64"},"formats":{"收入":"#,##0"},"data":[["2026-05",1200000]]},
    {"name":"成本","columns":["月份","成本"],"dtypes":{"成本":"int64"},"formats":{"成本":"#,##0"},"data":[["2026-05",730000]]}
  ]}' --styles '{
    "styles":[
      {"name":"收入","cell_styles":[
        {"range":"A1:B1","font_weight":"bold","background_color":"#f0f7ff"},
        {"range":"B2:B2","font_color":"#0f7b0f"}
      ]},
      {"name":"成本","cell_styles":[
        {"range":"A1:B1","font_weight":"bold","background_color":"#fff7ed"},
        {"range":"B2:B2","font_color":"#b42318"}
      ]}
    ]
  }'
```

> ⚠️ **`+workbook-create` 是把内存里的数据写成新表；要把已有的本地 Excel/CSV 文件原样导入成新表，用 `+workbook-import`**（见下），不要先在本地读出文件再 `+workbook-create` 重灌。

### `+workbook-import`

把已有的本地 `.xlsx` / `.xls` / `.csv` 文件导入为一个**新的**飞书电子表格（异步任务 + 内置轮询），与 `+workbook-export`（导出）对称，固定导入为电子表格类型。

```text
# 导入到云空间根目录；表格名默认取本地文件名（去掉扩展名）
lark-cli sheets +workbook-import --file ./data.xlsx

# 指定目标文件夹与导入后表格名
lark-cli sheets +workbook-import --file ./report.csv --folder-token <FOLDER_TOKEN> --name "月度报表"
```

- **不接受任何 spreadsheet / sheet 定位 flag**（它是新建，不操作已有表）：只有 `--file`（必填）/ `--folder-token` / `--name`。
- **`--file` 只接受当前工作目录内的相对路径**：先 `cd` 到文件所在目录（或 workspace），再传 `./file.xlsx` / `data/file.xlsx`；传 `/home/.../file.xlsx`、`C:\...\file.xlsx` 这类绝对路径会被判定 `unsafe file path` 拒绝。
- 导入成功后把新表链接通过宿主的产物交付工具交出去，并确认这次调用返回成功；只写进回复正文不算交付。
- 本地表格文件 → 飞书电子表格一律用本命令，**不要**用 `drive +import` 导电子表格——它是 sheets 之外的通用导入、还需额外指定 `--type`，绕路且更易错。只有要把本地表格导入成**多维表格**（bitable）时，才改用 `lark-cli drive +import --type bitable`。
- 返回 `token` / `url` / `ticket` / `ready` / `job_status`。只有 `ready=true` 且 `job_status=0` 才算导入完成；随后用新 URL 调 `+workbook-info`，有点名内容契约时再回读关键 sheet/range。`timed_out=true` 时按 `next_command` 续查，不能交付为成功。
- **值与公式保真，版式不保真**：走一圈后值、公式、数字格式、合并区、冻结、下拉校验都原样保留；行高列宽、边框、主题色填充（`fgColor theme=N`）、以及**跟随工作簿默认字体的格**（源表默认字体是中文字体时，这类格会回落到系统默认）则会变，与本轮做了什么无关。要求保留原版式时，导入后按源文件的值用 `+rows-resize` / `+cols-resize` 回写尺寸（飞书用像素、Excel 行高用磅，换算约 `px ≈ pt × 4/3`），其余版式差异回写不了，在交付说明里写明。
- 轮询是命令自己做的：本命令与其它异步 shortcut 都内置轮询，返回时状态已是最新，`next_command` 直接重跑即可，不必也不要加 `sleep` 等待。

### `+workbook-export`

把飞书电子表格导出为本地 `.xlsx`（整工作簿）或单子表 `.csv`（异步任务 + 内置轮询 + 可选下载）。

```text
# 1) 只创建并轮询导出任务，不下载（默认）：返回 file_token / status 便于稍后续传
lark-cli sheets +workbook-export --url "https://example.feishu.cn/sheets/shtXXX"

# 2) 下载到具体文件名
lark-cli sheets +workbook-export --url "..." --output-path ./report.xlsx

# 3) 下载到目录（保留服务端给的文件名）
lark-cli sheets +workbook-export --url "..." --output-path ./downloads/

# 4) csv 模式必须传 --sheet-id（API 一次只导一张子表）
lark-cli sheets +workbook-export --url "..." --file-extension csv --sheet-id "$SID" --output-path ./sheet.csv
```

> ⚠️ **默认不下载**：省略 `--output-path` 时只创建并轮询导出任务。普通在线交付不得为了内部验证主动导出；只有用户明确要求本地 xlsx / 下载 / 打印时才给 `--output-path` 并验收。验收时确认文件存在、可重开，并核对公式错误值、样式和对象。
>
> **与 `drive +export --doc-type sheet` 的关系**：本 wrapper 是它的特化封装，固定 `--doc-type sheet`，并把 drive 的 `--output-dir` / `--file-name` / `--overwrite` 三 flag 折叠成单一 `--output-path` 简化常见用例。代价是默认值不同：`drive +export` 默认下载到当前目录、本 wrapper 默认不下载。需要细控目录/文件名/是否覆盖的，回退到 `drive +export --doc-type sheet`。

### `+sheet-create`

示例：

```text
lark-cli sheets +sheet-create --url "https://example.feishu.cn/sheets/shtXXX" \
  --title "汇总" --index 0
```

> 💡 `+sheet-create` 只建一张**空子表**。要在已有工作簿里建子表并一步写入 typed 数据和/或样式，用 `+table-put`（payload 里命名的子表缺则自动新建）配合它的 `--sheets` / `--styles`，省掉先建表再 `+cells-set` / `+cells-set-style` 的二次往返。

### `+sheet-delete`

> ⚠️ 工作表删除不可逆；先 `--dry-run` 看输出 sheet_id + title 确认是要删的那张。

### `+sheet-rename`

```text
lark-cli sheets +sheet-rename --url "..." --sheet-id "$SID" --title "汇总"
```

### `+sheet-move`

standalone 路径在缺 `--source-index` / 只给 `--sheet-name` 时会自动发起一次 `+workbook-info` 读把它们解出来。

> ⚠️ **在 `+batch-update` 内调用 `+sheet-move`**：必须同时显式传 `--sheet-id`、`--source-index` 和 `--index`（目标位置）。batch 中途无法发起结构查询，且 `--index` 不显式给会静默落到默认位置 0，所以 batch translator 强制要求三者都显式。

### `+sheet-copy`

```text
# --title 省略时由服务端生成副本名
lark-cli sheets +sheet-copy --url "..." --sheet-id "$SID" --title "副本"
```

> 💡 `+sheet-copy` 连**公式 / 合并 / 分组底色 / 列宽 / 条件格式**一起整表复制。"照一张现成子表批量造结构相同的新子表"（如参考模板给每份数据各建一张同构子表）时，先 `+sheet-copy` 复制模板再用 `+cells-*` 只改数据，比从零 `+sheet-create` + 重建公式 / 样式省一大截，也天然满足"公式 / 分组 / 颜色照搬"。要把本地文件 / 数据并入**已有工作簿**当子表时走它（或 `+sheet-create`），别用 `+workbook-import` / `+workbook-create`——那两条只会新建独立表。

### `+sheet-hide` / `+sheet-unhide`

```text
lark-cli sheets +sheet-hide   --url "..." --sheet-id "$SID"
lark-cli sheets +sheet-unhide --url "..." --sheet-id "$SID"
```

### `+sheet-set-tab-color`

```text
# Hex 色值；传空字符串 "" 清除标签色
lark-cli sheets +sheet-set-tab-color --url "..." --sheet-id "$SID" --color "#FF0000"
```

### `+sheet-show-gridline` / `+sheet-hide-gridline`

```text
# 切换子表网格线显隐；二态语义在命令名里，无需额外参数（同 +sheet-hide/+sheet-unhide）
lark-cli sheets +sheet-show-gridline --url "..." --sheet-id "$SID"
lark-cli sheets +sheet-hide-gridline --url "..." --sheet-id "$SID"
```

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+sheet-create` 校验 `--title` 非空、`--row-count` ≤ 50000、`--col-count` ≤ 200；`+sheet-delete` 必须 `--yes` 或 `--dry-run`；`+workbook-create` 的 `--sheets` 与 `--values` **互斥**，给了 `--sheets` 则按 typed 协议校验 payload（其余约束同 `+table-put`）。
- `DryRun`：`+sheet-*` 写操作输出"将要 PATCH 的 sheet metadata"；`--sheet-name` 在 dry-run 输出里生成为 `<resolve:Sheet1>` 占位符，不实际解析为 sheet-id。
- `Execute`：sheet create/rename/move/copy/hide/unhide/delete 后必须调用 `+workbook-info`，按稳定的 sheet_id 核对名称、顺序、可见性与数量；import 按上方 ready/job_status + workbook-info 闭环；需要本地文件的 export 按 output-path + 文件存在/可重开闭环。


<a id="s-aaec4f9bd070fde4"></a>

## references/lark-sheets-write-cells.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Lark Sheet Write Cells

## 写入边界 + 回读诊断（编辑类任务建议）

1. **明确写入边界**：写入前建议能回答"目标 range 的起止行列号是多少？是否落在用户授权范围内？"。除用户明示要修改的区域外，避免扩张到原数据列以外或新建 Sheet。
2. **完整性断言**：批量写入前建议把"预期写入条数"硬编码到代码里（如要填 106 条翻译 → `expected = 106`），写完后回读比较 `actual == expected`。少于预期时优先补齐，补不齐则在交付说明里列出缺口。
3. **回读抽样校验**：写完关键值 / 普通公式后，用 `+csv-get` 或 `+cells-get` 重新读取写入区域，至少抽样 3-5 个代表性单元格（首 / 中 / 末），核对值与预期一致（与本地脚本计算的预期值对照）。AI 公式的计算状态不要先用 `+cells-get` 轮询，直接按 `references/lark-sheets-formula-verify.md` 的 `+formula-verify --ai-only --range` 全区间一次异步状态检查规则处理。公式特定的"先验证模板再 --copy-to-range / 修完再读回"细则见下方相关章节。
4. **护原表 · 派生产物落点（写排名 / 标记 / 汇总 / 改写列时易丢数据）**：派生结果优先写到**真实末列 +1 的全新空列**或新建子表，避免复用任何已有原数据列——哪怕该列看起来"空"，也要先 `+csv-get` 回读确认整列无原始数据再写。三条准则：① 尽量不把新公式 / 新值写进原数据列（典型反例：把新算的排名公式写进了原本存放另一份原始数据的列，整列原始数据被覆盖丢失）；② 尽量不改写、不合并原表头字段名（典型反例：把几个独立表头字段合并成一列，原字段名丢失）；③ 慎用 `--allow-overwrite`：它一旦让写入区盖到相邻原始列 / 行就是不可逆数据丢失，加它之前建议用 `+sheet-info` / `+csv-get` 核清目标 range 不含任何原始数据。

## 新增列 / 新增行的样式继承（防止视觉风格不一致）

新增列 / 新增行时，先铺样式再写值，分两步——避免只传 `value` 期望默认样式与原表一致（飞书新单元格默认对齐通常是 `H:right, V:bottom`，与多数原表的 `H:center, V:middle` 不一致）。

**推荐做法（一步到位）**：用 `+range-copy --paste-type formats` 把相邻原列/原行的样式复制到目标区域，再写值。`--paste-type formats` 只复制样式不动值。目标区域尺寸由**源区域**推断，`--target-range` 只给目标左上角锚点单元格；要铺满整列，源区域就要覆盖整列（如 `C1:C100`）。命令要带完整定位（`--url`/`--spreadsheet-token` 与 `--sheet-id`/`--sheet-name` 各一）：

```text
# 新列 D — 把 C 列的样式铺到 D 列（源 100 行 → 目标从 D1 起 100 行）
lark-cli sheets +range-copy --url "<表格URL>" --sheet-name "<真实表名>" \
  --source-range "C1:C100" --target-range "D1" --paste-type formats

# 新行 20 — 把第 19 行的样式铺到第 20 行
lark-cli sheets +range-copy --url "<表格URL>" --sheet-name "<真实表名>" \
  --source-range "A19:Z19" --target-range "A20" --paste-type formats
```

目标锚点 + 源尺寸决定落区，无需在 `--target-range` 里写出完整范围。参数细节见 `references/lark-sheets-range-operations.md`。

**手动做法（需要精确控制时）**：先用 `+cells-get --include style` 读相邻单元格的完整样式作为模板，再在 `+cells-set` 的 `--cells` 里逐格携带 `cell_styles`。需要继承的字段清单：

1. `cell_styles.font_family` / `cell_styles.font_size` / `cell_styles.font_weight` / `cell_styles.font_color` / `cell_styles.font_style`
2. `cell_styles.horizontal_alignment` / `cell_styles.vertical_alignment` — 漏继承会导致新列对齐与原列不一致（常见）
3. `cell_styles.number_format` — 漏继承会导致同列数值格式混乱
4. `cell_styles.background_color`
5. `border_styles`
6. **`merged_cells`（合并范围）**——续写场景必查：用 `+sheet-info --include merges` 读原数据区域的合并信息。原行有跨列合并时，新行用 `+cells-{merge|unmerge}` 复制相同合并模式。仅传 cells 数组的样式不够——合并范围要单独靠 `+cells-{merge|unmerge}` 落地。

**反模式**（风险）：
- 只传 `{"value": "四级菜单"}` 给 D1，不传 `cell_styles` → D1 默认非加粗、非居中，与 A1/B1/C1 风格断裂
- 新列 M5 写入 `=SUM(F5:L5)` 时只传 `formula`，不传样式 → M 列对齐变 `H:right`，数字格式变默认

## 长数字防科学计数法（数值列写入必查）

写入或计算结果可能产生长数字（≥ 12 位整数 / 高精度小数）的列，建议在 `cell_styles.number_format` 显式设置非通用格式，否则飞书会自动用科学计数法显示，用户看到的就是"内容被截断 / 看不清原值"。

| 场景 | 必加的 `number_format` |
|---|---|
| 长整数（订单号 / 身份证 / 单据号） | `"0"` 或 `"@"`（强制文本，避免精度丢失） |
| 金额 / 千分位 | `"#,##0.00"` |
| 百分比 | `"0.00%"` |
| 数量 / 计数 | `"0"`（整数） |
| 日期 | `"yyyy-mm-dd"` 或 `"yyyy/m/d"` |

**典型反例**：长数字列（如审批单号、流水号）未设 `number_format`，飞书显示为 `1.23E+15`，用户复制出来已经丢失精度。

> **数字还是文本，按"数据本质是量值还是标识符"二选一 —— 不看当下要不要计算**：金额 / 百分比 / 比率 / 计数 / 度量这类**本质是量值**的数据，优先以**数字类型**写入（百分比存小数 `0.54` 配 `number_format:"0%"`），避免设 `@` 文本格式。**这与"用户当下是否要排序 / 求和"无关**——数据类型由数据本质决定、不由当下用途决定：表格数据几乎总会被后续排序 / 图表 / 二次计算复用，`"54%"` 文本与数值列混排本就破坏一致性，且数字 + `number_format` 显示效果与文本**完全相同**，没有任何理由选文本。**最常见的误判就是"这只是 leaderboard / 报表 / 看板展示，又不用算，写成 `54%` 字符串就行"——这是错的，展示用途不改变"百分比是数值"的事实。**（`+table-put` 用 `dtypes` 声明 `int64` / `float64`；版式 `+table-put` 装不下时用 `+cells-set` 传数字 + `number_format`；都别在本地拼成带 `$` / `%` 的字符串走 `+csv-put`。）反过来，编号 `001`、规格 `3-1`、身份证 / 电话 / 单据号等**本质是标识符 / 标签**、要原样保留不被飞书自动解释的内容（否则 `001`→`1`、`3-1`→日期、点分日期 `12.10`→`12.1`（尾零丢失）、长号→科学计数），才以**字符串类型**写入（`dtypes` 设 `object`）并把 `number_format` 设为 `"@"`（文本格式），字面保真。

**typed 列必须显式声明类型**：金额、百分比、日期、布尔、计数，以及后续参与排序 / 聚合 / 图表的量值列，在 `+table-put` 的 `dtypes` 中逐列声明类型，并用 `formats` 控制显示；不要依赖字符串外观或自动猜型。纯文本/标识符表可全部声明 `object`。mixed 列先保留原值并新增清洗结果/失败标记，统计总数、成功、失败和空值；均值/比例必须说明分母，禁止静默把失败值丢掉后改变口径。

**追加数据**：普通表尾追加直接用 `+table-put` 的 `mode:"append"`，它会自动定位末行；只有用户明确要求在中间物理插行、继承模板区块或扩展合并结构时，才先用 `+dim-insert`。

## 使用场景

写入。向飞书表格的单元格区域写入值、公式、样式、批注、图片或下拉，也可批量写入 CSV / DataFrame。本 reference 覆盖 6 个 shortcut，按数据来源 + 内容形态选：

> ⚠️ **计算结果默认写公式，不写静态值**：需要计算得出的数字 / 统计量 / 排名 / 占比，默认写公式到单元格，不要用 Python 算好数值再硬编码写入。公式优先原则的例外：外部抓取数据、永不变化的常量、循环引用。

| 场景 | 用这个 shortcut | 原因 |
|------|----------------|------|
| 模型手里已经有 CSV 文本（小规模手动构造、从 `+csv-get` 取到后简单加工） | `+csv-put` | 直接传 CSV 文本 + `--start-cell`，不用自己拼二维 cells 数组；必要时自动扩容行列 |
| 列里有数值语义的数据（数字 / 金额 / 百分比 / 日期 / 计数）→ 飞书，要类型保真（来源不限：DataFrame、Counter、dict、list 都算） | `+table-put` | typed 协议每项必含 `name/columns/data`，可带 `start_cell/mode/header/allow_overwrite/dtypes/formats`；数值语义列显式声明 `dtypes`，`formats` 控制千分位 / 百分比 / 日期。date 落真日期、数值列可排序 / 求和 / 入图表，string 保前导零，多 sheet 一次写 |
| 写入含样式、批注、图片、数据校验等任意富写入 | `+cells-set` | 唯一支持完整富字段的 shortcut（公式 `+csv-put` 也能写） |
| 只改已有 cell 的样式，不动 value/formula | `+cells-set-style` | 拍平 10 个样式字段为独立 flag；不触发不必要的值写入 |
| 单 cell 嵌入图片 | `+cells-set-image` | 比 `+cells-set` 参数更简短 |
| 在**已有区域**局部补表头样式/边框 | 先用 `+csv-put` 写值，再用 `+cells-set-style` 补样式 | 分工配合，入参最短 |
| **新建子表 / 整表成套美化**（哪怕全是纯文本） | `+table-put --sheets … --styles …` 一步带值 + 全套样式（区域底色 / 边框 / 列宽 / 行高 / 合并；payload 里不存在的 sheet 名自动建子表） | `--styles` 与列是否 typed 无关，纯文本同样适用；比「写值 + 多次刷样式」少好几次调用 |

**选命令按内容形态分流（不设"默认首选"）**：① 列有数值语义（金额 / 百分比 / 日期 / 计数）→ `+table-put`（`dtypes` 声明类型 + `formats` 设展示格式），版式装不下时 → `+cells-set` 传数字 + `number_format`；② 要样式 / 批注 / 图片 / 富文本 → `+cells-set`；③ **仅**全文本、无数值语义的内容平铺 → `+csv-put`（入参最短）。判据详见上方「数字还是文本」。

⚠️ `+csv-put` 可写值或公式：以 `=` 开头的单元格会被当作公式计算（读回时 `formula` 字段保留、`value` 为计算结果）。**公式内部含逗号 / 引号 / 换行时建议按 RFC 4180 转义**——含逗号的字段整格用双引号包裹、字段内部的引号再翻倍：如 `=COUNTIF(D5:D22,"及格")` 建议写成 `"=COUNTIF(D5:D22,""及格"")"`。漏转义会被 CSV 解析器按逗号拆列、整块写入区域错位。**因此含逗号 / 引号 / 换行的公式优先用 `+cells-set`**；`+table-put` 不支持公式字段。

⚠️ **`+csv-put` 会把数值落成文本**：把金额 / 百分比 / 计数等在本地拼成带 `$` / `%` / 千分位的字符串（如 `"$1,234.50"` / `"+30.5%"`）再 `+csv-put` 灌进去，单元格就是**文本**——丢失排序 / 求和 / 图表能力，且与数值列混排无法参与计算。数值该怎么写、何时 `+table-put`、版式装不下时何时退 `+cells-set` 传数字 + `number_format`，判据与分流见上方「数字还是文本」；核心一句：**准备把数字 format 成字符串再写时就是走错了路，数值一律以数字写入 + `number_format` 控制显示。**

⚠️ **`+csv-put` 也会把「看着像数字」的字段静默数值化**（与上一条相反的另一半坑）：CSV 里语义是**日期标签 / 编号 / 标识符**、内容却全是数字字符的列，会被按数值解析——`12.10`→`12.1`（点分日期尾零丢失）、`3.0`→`3`、`001`→`1`、长号→科学计数。**这类列即使已攒好 CSV 文本也不建议裸走 `+csv-put`**：优先 `+table-put` 把该列 `dtypes` 声明为 `object`（无年份的点分标签如 `12.10` / `3-1` 字面保真）或 `datetime64[ns]`（完整真日期），版式装不下再退 `+cells-set` + `number_format:"@"`。此类失真在「抽样首 / 中 / 末」回读时易被掩盖（`12.10` / `12.20` 等尾零行常不落在抽样窗口），日期 / 编号列回读要专挑带尾零 / 前导零的代表值核对。

⚠️ 大数据回写走"`+csv-get` 按 `--range` 行窗口分批读到本地 + 本地脚本处理 + `+csv-put` 分批回写"。

## `+cells-set` 写入要点（常用模式 / 公式 / 样式）

> 以下是用 `+cells-set`（及 `+cells-set-style`）做富写入时的常用模式与准则；选哪个 shortcut 见上方「使用场景」。

`+cells-set` 为一块区域设置值 / 公式 / 批注 / 样式，也支持 `rich_text` 的 `type: "embed-image"` 嵌入单元格图片。**关键：`--cells` 恒为二维数组（行 × 格），单格也是 `[[{"value":…}]]`；裸 `--range A1`（或 `--start-cell`）是左上角**锚点**，落区由 `--cells` 自身的行列数决定；写成矩形（`A1:B2`）则是**边界**——数组比它小会收窄，比它大会被拒绝，而不是写到范围之外**。

> **单元格图片 vs 浮动图片**：图若**属于某条记录、要随那行排序 / 筛选 / 增删**（凭证 / 证件照 / 每行配图，话里带「对应 / 每行 / 这列」等绑定词）→ **单元格图片**（本工具）：用 `+cells-set-image`（最短）或 `+cells-set` 的 `rich_text` + `type: "embed-image"`。只是自由摆放的装饰（logo / 水印 / 封面）→ 浮动图片，见 lark-sheets-float-image。别因「浮动图更好控制 / 更熟」默认选浮动图——它承载"对应某记录"的图会随增删行 / 排序错位。

常用模式（推荐，避免逐行写入替代）：

- 整列公式：先在 `H2` 写一个公式，再用 `--copy-to-range "H2:H100"` 或 `--copy-to-range "H:H"` 向下填充。避免对每一行单独调用 `+cells-set` 写入相同结构的公式
- 整列样式：使用 `+cells-set-style` 或 `+styles-put` 指定目标 range；不要用 `--copy-to-range` 纯刷样式
- 首行样式：同上，直接对 `1:1` 或实际表头 range 设置样式
- 用户说”这列 / 整列 / 这行 / 首行 / 向下复制公式”时，值/公式填充用模板格 + `--copy-to-range`；只改样式用 `+cells-set-style` / `+styles-put`
- 多区域写入相同值/公式结构时，优先写一个模板，再用 `--copy-to-range` 复制；仅样式相同仍走样式命令

⚠️ **`--copy-to-range` 复制的是模板格的全部内容（值 + 公式 + 样式），不是只复制样式**：目标区域**已有值**时不要用它"刷样式"——会把整个区域的值覆盖成模板格的值（65 个格子全变成同一个数的事故就是这么来的）。只改样式、值 / 公式不动，用 `+cells-set-style` / `+cells-batch-set-style`；`--copy-to-range` 只用于目标区为空或本就要写同构公式 / 值的场景。

⚠️ **模板 `--range` 从数据行起算、别把表头圈进去**：`--copy-to-range` 会把 `--range` 模板按目标区尺寸周期性平铺，模板里若含了表头行，表头会每隔几行重复铺进数据区。整列填充时模板只取一格数据样式（如 `H2`），不要取成 `H1:H2`。

⚠️ **逐行写入公式是常见低效写法**：对每一行单独调用 `+cells-set` 写公式（如 26 次）既慢又易错，且不会自动平移公式引用。正确做法是 1 次模板写入 + 1 次 `--copy-to-range`（公式引用自动平移）。

💡 **多个不连续区域写入（批量修公式的正解）**：散布多处（可跨 sheet）的值 / 公式写入，用 `--writes` 一次批量交付（fail-fast，失败后先回读再补发）——每项 `{sheet_name, range, cells}`（跨 sheet 的项把 sheet 定位写在项里，项内没写则取顶层 `--sheet-name` / `--sheet-id`），不要为此拼 `+batch-update` 的 `--operations`，也不要逐区域多次调用（多次往返、中途失败难恢复）：

```text
lark-cli sheets +cells-set --url "..." --writes - <<'JSON'
[
  {"sheet_name":"明细","range":"D5","cells":[[{"formula":"=IFERROR(C5/B5,0)"}]]},
  {"sheet_name":"汇总","range":"B3","cells":[[{"formula":"=SUM(明细!C:C)"}]]}
]
JSON
```

范围级统一样式不在 `--writes` 里做（cells 逐格 `cell_styles` 仅用于逐格差异化），写完接 `+styles-put`。

💡 **写入公式前先按迁移规则改写**：如果公式来自 Excel 或包含数组场景，先读取并遵循 `references/lark-sheets-formula-translation.md` 的规则完成改写，再把最终公式写入 `formula` 字段。

💡 **内容与样式分离写入**：当同一区域样式高度重复时，先按正确类型写内容，再用 `+cells-set-style` 或 `+styles-put` 对目标范围补样式；不要用 `--copy-to-range` 纯刷样式，它会连模板值 / 公式一起复制。只有目标区为空或本就要复制同构公式 / 值时，才使用模板单元格 + `--copy-to-range`。

💡 **样式更新是「部分合并」，不是整体覆盖**：`+cells-set-style` / `+styles-put`（以及 `+cells-set` 的 `cell_styles` / `border_styles`）只改你**显式传入**的样式属性，未传的属性保留原值。两个实用推论：
- **可分层叠加**：对同一区域先刷字体色、再单独刷背景色、再单独刷边框，后一步不会清掉前一步——美化已有区域时无需一次带齐所有字段，可拆成多次窄调用。
- **`border_styles` 按边合并**：只传 `{"top":{...}}` 只更新上边框，`bottom` / `left` / `right` 保留原状；不必为了「只改一条边」而把四边全部重传。（例外见上方「新增行的边框/样式避免用 `{}` 跳过」：**全新行**底子里没有边框，仍需把要显示的边都显式传出。）

💡 **大批量数据分批写入（推荐）**：当需要写入大量行（如几十行以上）时，不要试图在一次调用中生成全部 `cells` 数据——`cells` 数组过大会让单次生成的内容过长，容易出错或被截断。应将数据拆分为多批，每批 20-50 行，分多次调用 `+cells-set` 逐批生成并写入（如先写 `A2:D21`，再写 `A22:D41`，依此类推）。每次只生成当前批次的数据，控制单次生成量。

注意：

- 不要把 `cells` 写成字符串化 JSON
- `+cells-set` 默认即覆盖非空 cell（`--allow-overwrite` 默认 true）；若要**保护**非空 cell 不被覆盖，显式传 `--allow-overwrite=false`（遇非空 cell 报错）
- 若目标区域涉及合并单元格，不要向合并区域中的非左上角单元格写入数据；如需写入，应改写合并区域左上角单元格，或先调整/取消合并区域
- **构造 `range` 时行号建议基于逻辑行号**：如果之前通过 `+csv-get` 读取了数据，CSV 中被双引号包裹的多行字段（如 `"2026年3月2日\n星期一"`）是**一个单元格**，不是两行。写入时的行号建议按逻辑记录计算，不能按物理换行符计数，否则 `range` 会整体偏移导致写入到错误位置

> 用户说"样式和原表一致 / 保持原表格式 / 边框继承"时同理：`cell_styles` 只覆盖字体和对齐、**不含边框**，边框建议用独立 `border_styles` 字段传——完整继承清单见上方「新增列 / 新增行的样式继承」。

⚠️ **公式写入后必须完成验证（后端不会报全部语法 / 运行错误）**：`+cells-set` 写公式时，即便公式有括号不配对（如 `=IFERROR(VALUE(MID(D5,3,4))), 0)` 比 IFERROR 多一个 `)`）或用了飞书不支持的函数（如 `GOOGLETRANSLATE` / `CUBEVALUE`），**后端工具也可能返回 `updated_cells_count=N, rc=0` 的"成功"**——错误会静默写进单元格显示为 `#VALUE!` / `#NAME?` / `#REF!`。因此：
1. **写完立即回读**：`+cells-set` 后紧跟 `+csv-get`（或 `+cells-get`）读目标范围首、中、末及汇总行，检查错误值并核对 `formula`；AI 公式在这一步只做**一次**公式文本核对（`+cells-get --include formula` 看种子格 / 首格，确认引号 / 括号没在 shell / CSV / JSON 层被破坏、落进去的确实是 `=AI(...)`），不要用它轮询计算结果——计算状态走 `+formula-verify --ai-only`
2. **逐段运行诊断**：对本次新增 / 修改的公式范围调用 `+formula-verify --exit-on-error`；`partial` 拆小续扫，全部分段 `status='success'` 后才完成。AI 公式不套这条：改用 `+formula-verify --ai-only` 按全区间一次异步状态检查规则交付（`failed` / `unsupported` 先修，只剩 pending 可交付并说明后台仍在计算，详见 `references/lark-sheets-formula-verify.md`）
3. **看到 `#` 开头的错误值**立即修公式：`#NAME?` 多半是函数名拼错或用了飞书不支持的函数（如 `GOOGLETRANSLATE` / CUBE 系列；注意 `UNIQUE` / `FILTER` 飞书是支持的）；`#VALUE!` 多半是类型不匹配或括号错位；`#REF!` 是引用错误；`~CIRCULAR~REF~` 是循环引用（公式引用了自身或会闭环）
4. **`--copy-to-range` 扩展前先验证模板**：模板单元格公式自己都算错，`--copy-to-range` 复制到 100 行就是 100 个错误
5. **去重 / 筛选函数**：飞书**支持** `UNIQUE` / `FILTER`（原生数组函数，详见 `references/lark-sheets-formula-translation.md`），可直接用；`DISTINCT` 不是飞书函数，去重用 `UNIQUE`。大数据量去重 / 分组也可用透视表（`+pivot-{create|update|delete}`，值字段聚合方式选 count）
6. **循环引用预检**：写聚合公式（SUM / AVERAGE / COUNT 等）前建议明确**引用范围不包含目标单元格自身或其传递依赖**。典型反例：在 C3 写 `=SUMIF(B:B,LEFT(B3,9)&"*",C:C)`，B 列匹配 B3 前 9 位时 C3 自己也命中，导致 C3 自引用 → `~CIRCULAR~REF~`。修法：用辅助列 / 显式排除自身（`SUMIFS(C:C, B:B, ..., A:A, "<>"&A3)`）/ 缩小范围避开自己
7. **文本提取公式的覆盖率验证**：用 `LEFT` / `MID` / `FIND` / `SUBSTITUTE` / `TEXTSPLIT` 等从文本里抠数据前，建议用本地脚本在**整列源数据**上跑一遍命中率统计（`df[col].str.contains(pattern).mean()`）；命中率 < 100% 时优先补分支（IFS / 多个 IFERROR 串联）兜底，或改用本地脚本算好写静态值，**避免**只覆盖样本前 N 行就交付（典型反例：按"长123"这种带前缀的尺寸文本取数，对"宽×高"、"×"、"*"等其它写法直接漏匹配）
8. **公式范围与用户指令字面对齐**：用户说"对 F 至 L 列求和"优先写 `SUM(F2:L2)` 或 `F2+G2+H2+I2+J2+K2+L2`，**不能漏列、多列、错列**。写完用 `+cells-get` 拿回 `formula` 字符串，与用户原话逐字对照（参与求和的列名一致 / 起止列号一致 / 运算符一致），不一致就是风险
9. **量纲 / 单位换算 / 数量乘项预检（公式不报错但结果整体偏倍数）**：从文本提取数字做计算前，先核对**单位是否统一、是否漏乘数量、口径是否一致**——这类错误公式能跑通、无 `#` 报错，回读也看不出（值"像对的"）。建议用本地脚本对 3–5 个代表行**离线手算一遍预期值**，与公式结果逐格比对量级：① 单位不一致先统一再算（典型反例：尺寸 `320CM*337CM` 直接取数相乘除以 1e6 得 0.11，正确是 CM→MM 换算后得 10.78，**差 100 倍**）；② 按"单件×数量"的量建议乘数量列（典型反例：侧面板面积漏乘 F 列数量，F=2 的行只算了一半）；③ 标准值口径对齐（典型反例：营养成分 mg/kg 与 g/100g 口径混用，整列放大 100 倍）。**口径 / 单位 / 数量任一项错，整列计算结果就是错的；这类错误公式不报错、回读也不易看出，建议靠离线手算对照。**

**公式写入后的诊断入口是 `+formula-verify`**：`+csv-get` / `+cells-get` 的抽样回读只能快速发现明显错误，覆盖不到整列中段、隐藏行、被条件格式遮蔽的错误，也看不到 `partial` 截断。只要本次 `+cells-set` / `--copy-to-range` / `+csv-put` 实际写入了公式，就按上方流程对目标范围逐段运行 `+formula-verify --exit-on-error`。AI 公式改走 `--ai-only` 的全区间一次异步状态检查，不按 `status='success'` 收敛。

⚠️ **收到 `formula_errors` 反馈后不建议只打补丁**：`+cells-set` 返回值里若出现 `formula_errors: [{cell, formula, error_type, detail}]`，说明某些 cell 公式编译失败（`error_type=compile_failed` 通常是函数语法错，如对数组结果直接写 `[1]` 下标取值——飞书不支持这种写法，取第 N 项要用 `INDEX(<数组表达式>, N)`；`non_formula` 是 `=` 开头但解析不通过）。此时**避免只聚焦修报错点的局部语法**（如仅把 `[1]` 换成 `INDEX(..,1)`），建议：

1. **重新审视整条公式的完整性**：被 formula_errors 标出的那一行，公式除了下标语法错，还可能有其他先天缺陷（字符清洗不全、IFERROR 兜底漏条件、引用列写错），修完语法错后立即整体复核
2. **同步对称修复所有相似列**：如果同一任务涉及多列相似处理（如"算 H 列面积"用 D 列尺寸、"算 I 列面积"用 E 列尺寸），**修完一列建议把同样的清洗/兜底逻辑同步到所有相似列**，避免出现 H 列用 `SUBSTITUTE(长)+SUBSTITUTE(高)+SUBSTITUTE(×)` 而 I 列只用 `SUBSTITUTE(×)` 这种不对称处理——会导致一列编译通过有值、另一列编译通过但 IFERROR 全返回空，用户看到的是"数据为空"而非"公式错"
3. **修完再读回验证**：不只看 `formula_errors` 为空（这只证明编译通过，不证明运行时有值），建议 `+csv-get` 读目标列前 3-5 行，确认**非空源数据对应的目标列有非空计算结果**
4. **核心心智**：`formula_errors` 是"帮你暴露编译错"的工具，不是"修掉它就收工"的通行证。编译通过 + 运行时 IFERROR 兜底空 = 用户视角的"没算出来"

⚠️ **新增行的边框/样式避免用 `{}` 跳过**：`cells` 数组里 `{}` 的语义是"**此单元格不做任何修改、保留原状态**"。这在写入**已有行**时是安全的（原有边框/样式保持不变），但在写入**新行**（比如表尾追加汇总行、扩展行）时是灾难：新行底子里本来就没边框，`{}` 不修改 = 保留无边框状态，导致该 cell 视觉断裂。

⚠️ **"汇总行"识别 → 读 `references/lark-sheets-visual-standards.md` 拿完整样式规范**：下述双重条件**同时满足**才是汇总行，避免仅凭"有 AVERAGE"就判定：
- **语义信号**（二选一）：用户 prompt 含"合计/汇总/总计/统计/各科平均分/最下面加一行算…/底部总计"等意图词；或上下文明确是"表尾追加一行做聚合"
- **结构信号**：新行全行都在做聚合（含 `=SUM/AVERAGE/COUNT/MAX/MIN/SUBTOTAL(...)`，支持 IFERROR 包裹），**不是**单个 cell 算个参考值或每行都算的派生列

满足上述时，**不要在本文里猜样式**，直接去读 `references/lark-sheets-visual-standards.md` 的「场景一 → 1A. 添加汇总行 / 表头行」章节，按那里的样式要点配齐 `font.bold / horizontal_alignment / background_color / border_styles`。

反例（**不是**汇总行，避免自动加粗）：
- 用户说"在 H5 帮我算个 AVERAGE 参考"→ 单 cell 计算
- 每行都有 `=AVERAGE(本行区间)` 的派生列 → 属数据列
- 用户明确说"不要加粗/样式和数据行保持一致"→ 遵循用户意图

**正确做法**（二选一）：

- **做法 A（推荐）**：先按正确类型写 value / formula，再用 `+cells-set-style` 或 `+styles-put` 对整行补齐 `cell_styles` + `border_styles`；不要用 `--copy-to-range` 纯刷样式。汇总行的 bold / 背景色 / 上边框见 `references/lark-sheets-visual-standards.md` 的「场景一 → 1A. 添加汇总行 / 表头行」。
- **做法 B**：一次写入，但每个 cell（含空白格）都显式带 `cell_styles` + `border_styles`，**不能用 `{}`**。

**判断是不是"新行"**：写入 range 超出 `+csv-get` 返回的 `current_region` 右 / 下边界（如 `current_region=A1:H10`、写 `A11:H11`）即新行，建议按上述做法补边框。

## 富文本单元格：超链接 / @人 / @文档（`rich_text`）

带显示文本的超链接、@人、@文档这类富内容**建议**走 `+cells-set` 的 `rich_text` 字段（`cells[].rich_text` 数组，每段一个对象、带 `type`），**不能**直接传普通字符串——纯字符串只会被当作纯文本存进单元格。完整字段跑 `lark-cli sheets +cells-set --print-schema --flag-name cells`，常用段类型：

- **超链接（带显示文本）**：`{"type":"link","text":"飞书","link":"https://www.feishu.cn"}`。纯 URL 不需要 `rich_text`，直接写普通字符串即可。
- **@人**：`{"type":"mention","mention_token":"<userId>","notify":false}`。**仅支持同租户用户，单次写入最多 50 人。** `notify` **默认 `true`**（会给被 @ 的人发通知），不想发务必显式传 `false`。
- **@文档**：同样 `"type":"mention"`，`mention_token` 传文档 token（如 `shtXXX`）。

`mention_type`（类型编号）等可选字段以 `--print-schema` 输出为准。

> ⚠️ `rich_text` 一旦设置会**忽略**同一 cell 的 `value`；它与 `formula` / `multiple_values` 三者只能选其一作为内容字段（可叠加 `cell_styles` / `note` 等）。

## Dropdown 选项 + 配色（`+dropdown-set` / `+dropdown-update`）

### 选项怎么来：`--options` 与 `--source-range` 二选一

| flag | 选项来源 | 适用场景 |
|---|---|---|
| `--options '["a","b","c"]'` | 写在命令里的固定列表 | 选项集是常量、不需要事后维护 |
| `--source-range ''\''Sheet1'\''!T1:T3'` | 已有单元格里的值 | 选项要跟数据动态同步；想维护一张「枚举值」列后多处引用 |

两个 flag **必须传一个、且只能传一个**——同时传或都不传，CLI 会立刻报错。`--source-range` 用 A1 + sheet 前缀写法（如 `'Sheet1'!T1:T3`，sheet 名按 A1 标准单引号包裹），可以指同 sheet 也可以指其它 sheet（如 `'Refs'!A1:A10`）。

### 多选下拉：验证规则与选中值是两层数据

`+dropdown-set --multiple` 只把目标单元格的验证规则设为“允许多选”，**不会写入当前选中值**。后续用 `+cells-set` 填充多选结果时，必须把每个选项写成 `multiple_values` 数组项；不要把多个选项用逗号拼成一个普通 `value`，否则整串会被当成单值并触发数据验证失败。

```text
# 先创建允许多选的下拉规则
lark-cli sheets +dropdown-set \
  --spreadsheet-token shtXXX --sheet-id "$SID" \
  --range "E2:E15" \
  --options '["A","B","C","D"]' \
  --multiple

# 再向 E6 写入 3 个选中值
lark-cli sheets +cells-set \
  --spreadsheet-token shtXXX --sheet-id "$SID" \
  --range "E6" \
  --cells '[[{"multiple_values":[{"value":"A"},{"value":"B"},{"value":"C"}]}]]'
```

### 配色：新建默认用内置色板，更新保留已有配色

下拉**默认带胶囊高亮**——新建时不传 `--highlight` / `--colors`，所有选项按内置 10 色色板循环上色，跟 UI 手动配下拉的默认行为对齐。只有用户明确指定自定义颜色，或选项具有清晰的语义配色（如状态、风险、优先级，且颜色有助于理解）时才传 `--colors`。

下拉胶囊文字默认是黑色。自定义颜色时应使用**浅色、低饱和度背景**，避免鲜艳或偏深的色值影响可读性。

`+dropdown-update` 会重写整条验证规则。若用户没有要求重置已有配色，先用 `+dropdown-get` 回读，并把现有 `highlight_colors` 作为 `--colors` 传回；省略会按内置色板重建。

| 想要的效果 | 怎么传 |
|---|---|
| 新建时使用默认色板 | 都不传 `--highlight` / `--colors` |
| 更新时保留已有配色 | 先 `+dropdown-get` 回读，再将 `highlight_colors` 作为 `--colors` 传回 |
| 用户明确要求或选项有语义配色 | 只传浅色、低饱和度的 `--colors '["#hex",...]'`（不需要再传 `--highlight`） |
| 纯白下拉、不要高亮 | 传 `--highlight=false`（注意 `=false` 不能省，单写 `--highlight` 在 cobra 里等价于 true） |

`--colors` 长度**可以短于**选项数（list 模式短于 `--options` 长度，listFromRange 模式短于 `--source-range` 的单元格数），未指定的选项按内置色板循环补色；但**不能长于**——CLI 在 Validate 阶段就会拦截，错误形如 `--colors length (4) must not exceed dropdown source size (3)`。

当 `--highlight=false` 显式关闭高亮时，`--colors` 即使传了也会被忽略（语义自相矛盾，但不报错）。

### 最小用例

**`--options` 模式 — 默认色板（最常见）**：

```text
lark-cli sheets +dropdown-set \
  --url https://... --sheet-id <id> \
  --range A2:A100 \
  --options '["待开始","进行中","已完成","已取消"]'
```

**用户明确要求语义配色时**：

```text
lark-cli sheets +dropdown-set \
  --url https://... --sheet-id <id> \
  --range A2:A100 \
  --options '["待开始","进行中","已完成"]' \
  --colors '["#E8F3FF","#FFF3D6","#E8F8E8"]'
```

**`--source-range` 模式**（先在 `'Sheet1'!T1:T3` 维护「男/女/保密」三行，再让 `B2:B21` 引用它）：

```text
lark-cli sheets +dropdown-set \
  --url https://... --sheet-id <id> \
  --range B2:B21 \
  --source-range ''\''Sheet1'\''!T1:T3'
```

**纯白下拉**（明确告诉用户"不要彩色"时才用）：

```text
lark-cli sheets +dropdown-set \
  --url https://... --sheet-id <id> \
  --range A2:A100 \
  --options '["低","中","高"]' \
  --highlight=false
```

> ⚠️ **`--source-range` 必须带 sheet 前缀**（即使跟 `--range` 同 sheet）。注意一个坑：回读这种 listFromRange 下拉单元格时，`data_validation.range` 看起来不带 sheet 前缀（形如 `$T$1:$T$3`），如果要把读出来的 range 反过来写回 `--source-range`，**必须自己重新补上 sheet 前缀**，否则会被拒。
>
> ⚠️ **`--ranges` 类批量 flag 的 sheet 前缀必须「裸写」**——`+cells-batch-clear` / `+dropdown-update` / `+dropdown-delete` 的 `--ranges` 解析器不接受引号：表名含点或空格（如 `2025.9`、`一月份`）也直接写 `2025.9!A1`，写成 `'2025.9'!A1` 会被当成表名一部分、报 `sheet not found`。**但 `--source-range`、透视表 `--source`、`--range` 走 A1 标准**：sheet 名带单引号（如 `'Sheet1'!A1:B2`）是标准写法、裸写也接受，回读统一返回带引号形式——别把 `--ranges` 的裸写要求套到这些 flag 上。

`+dropdown-update`（多 range 批量更新）的目标 `--ranges` 是 JSON 数组（每项带 sheet 前缀），同一份选项 + 配色应用到所有 range。它会替换完整验证规则；需要保留现有配色时，按上文先回读并透传 `--colors`。

## Shortcuts

| Shortcut | Risk | 分组 |
| --- | --- | --- |
| `+cells-set` | write | 单元格 |
| `+cells-set-style` | write | 单元格 |
| `+cells-set-image` | write | 单元格 |
| `+dropdown-set` | write | 对象 |
| `+csv-put` | write | 单元格 |
| `+table-put` | write | 单元格 |

## Flags

### `+cells-set`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | xor | 写入区域（A1 格式）。与 `--writes` 二选一（单区域用 --range+--cells，多区域用 --writes） |
| `--start-cell` | string | optional | `--range` 的别名（与 `+csv-put` 一致，用 --start-cell 定左上角锚点）；传区间时按区间左上角起写（隐藏 flag：不在 `--help` 列出，但可正常传入） |
| `--cells` | string + File + Stdin（复合 JSON） | xor | JSON：2D 数组 `[[{cell},...],...]`；裸 `--range A1`（或 `--start-cell`）是左上角锚点，写入范围按本数组的行列数推断；`--range` 写成矩形（`A1:B2`）则是边界——本数组比它小会收窄，比它大会被拒绝。每个 cell 可含 `value` / `formula` / `multiple_values` / `cell_styles` / `note` / `rich_text`（含 `type="embed-image"` 单元格嵌图）等。向启用多选的下拉单元格写入选中值时，必须用 `multiple_values:[{"value":...}]`，不要把多个选项用逗号拼成一个 `value`；完整字段跑 `--print-schema` |
| `--writes` | string + File + Stdin（复合 JSON） | xor | 多区域写入 JSON 数组（最多 100 项），每项 `{sheet_name\|sheet_id, range, cells}`——**跨 sheet 的项把 sheet 定位写在项里**（与 +batch-update 子操作、+styles-put 项同惯例），项内没写则取顶层 `--sheet-name` / `--sheet-id`，cells 结构同 `--cells`（二维数组，可逐格带 cell_styles/border_styles）。整批展开为**单次批量提交**（fail-fast，失败后先回读再补发），支持跨 sheet；典型场景：批量修复散布多处的公式、跨表同构写入——不要为此拼 +batch-update 的 --operations。与 `--range`+`--cells` 二选一；范围级统一样式不在此做，写完接 +styles-put |
| `--allow-overwrite` | bool | optional | 允许覆盖非空 cell（默认 true）；设为 false 时遇非空 cell 报错 |
| `--max-cells` | int | optional | 防爆，默认 50000（隐藏 flag：不在 `--help` 列出，但可正常传入） |
| `--copy-to-range` | string | optional | 复制范围（A1 表示法）：把 --range 中 --cells 写入的内容（值/公式/样式，取决于实际传入字段）复制到该区域，公式引用自动平移（如 C2=B2 → C3=B3）。适合先写一行/一块模板再扩展填充整列/整区域（如 --range A1:G1 写模板、--copy-to-range A1:G100 填充 100 行）。支持整行 3:6、整列 C:E、到列尾 D3:D、到行尾 D3:3；支持英文逗号分隔多个目标区域，如 C1:D2,E5:F6 |

### `+cells-set-style`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 目标范围（A1 格式，如 `A1:B2`） |
| `--background-color` | string | optional | 背景颜色（十六进制，如 `#ffffff`） |
| `--font-color` | string | optional | 字体颜色（十六进制，如 `#000000`） |
| `--font-family` | string | optional | 字体名称（如 `Arial`、`微软雅黑`） |
| `--font-size` | float64 | optional | 字体大小（px，例：10、12、14） |
| `--font-style` | string | optional | 字体样式（可选值：`normal` / `italic`） |
| `--font-weight` | string | optional | 字重（可选值：`normal` / `bold`） |
| `--font-line` | string | optional | 字体线条样式（可选值：`none` / `underline` / `line-through`） |
| `--horizontal-alignment` | string | optional | 水平对齐（可选值：`left` / `center` / `right`） |
| `--vertical-alignment` | string | optional | 垂直对齐（可选值：`top` / `middle` / `bottom`） |
| `--word-wrap` | string | optional | 换行策略（可选值：`overflow` / `auto-wrap` / `word-clip`） |
| `--number-format` | string | optional | 数字格式（例：文本 `@`、数字 `0.00`、货币 `$#,##0.00`、日期 `mm/dd/yyyy`） |
| `--border-styles` | string + File + Stdin（复合 JSON） | optional | 边框配置 JSON：`{ top: {style,weight,color}, bottom: ..., left: ..., right: ... }`；4 方向结构相同。style = 线型（solid\|dashed\|dotted\|double\|none）；weight = 粗细（thin\|medium\|thick —— 字符串，不是像素数字）；color = 十六进制如 #000000。`{ all: {...} }` 一次设置四边。边框只有这一个 flag：不存在 --border-all / --border-top / --border-color |

### `+cells-set-image`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 目标单元格（A1 格式，必须单 cell，如 `A1`；起止 cell 须相同） |
| `--image` | string | required | 本地图片路径（支持 PNG / JPEG / JPG / GIF / BMP / JFIF / EXIF / TIFF / BPG / HEIC） |
| `--name` | string | optional | 图片文件名（含扩展名）；省略时取 `--image` 的 basename |

### `+dropdown-set`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--range` | string | required | 目标范围（A1 格式，如 `A2:A100`） |
| `--options` | string + File + Stdin（复合 JSON） | xor | 下拉选项 JSON 数组，例如 `["opt1","opt2"]`。服务端不限制选项数量，也不限制单个选项长度；含逗号的选项可以接受（写入时会自动转义）。大量选项建议改用 `--source-range`。 |
| `--colors` | string + File + Stdin（简单 JSON） | optional | 下拉胶囊背景色，RGB hex 数组。新建时默认不要传：省略即使用内置 10 色色板；仅在用户明确要求或选项有清晰语义配色时传。胶囊文字默认黑色，应选浅色、低饱和度背景。长度可短不可长——超长 Validate 拦截（`--colors length (N) must not exceed dropdown source size (M)`），未指定项按内置色板循环补色。单独传即生效；`--highlight=false` 时被忽略。 |
| `--multiple` | bool | optional | 启用多选；默认 `false`。本 flag 只设置验证规则，不会写入选中值；后续用 `+cells-set` 写值时必须传 `multiple_values` 数组，不要传逗号拼接的 `value` |
| `--highlight` | bool | optional | 下拉胶囊背景色高亮开关。**不传 = 开**（按内置 10 色色板循环上色）；`--highlight=false` 关闭得到纯白下拉。配色用 `--colors` 覆盖。 |
| `--source-range` | string | xor | listFromRange 模式的下拉源 range，A1 表示法 + sheet 前缀（如 `'Sheet1'!T1:T3`）。映射到 server `data_validation.range`，搭配 server `data_validation.type='listFromRange'` 自动生效。跟 `--options` 二选一：传 `--options` 走 inline 列表（type=list），传本 flag 走 range 引用（type=listFromRange）。`--colors` 长度规则不变（≤ 源 range 单元格数），`--highlight` / `--multiple` 行为相同。当 `--highlight` 开启且 source 覆盖单元格数超过 2000 时，服务端会将该下拉判为 option-error（这是不支持的组合）；CLI 会在返回结果的 `data.warnings` 中给出 warning。如需取消，传 `--highlight=false`。 |

### `+csv-put`

_公共四件套 · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--start-cell` | string | required | 目标区域起点 A1（如 `A1`、`B5`，不带 sheet 前缀；用 `--sheet-id` / `--sheet-name` 指定 sheet）；必须是单个单元格，不接受范围写法；终点按 CSV 实际行列数自动推断 |
| `--csv` | string + File + Stdin（非 JSON 文本） | required | RFC 4180 CSV 文本；可写值或公式（以 = 开头的单元格按公式计算）；不带样式 / 批注 / 图片，需要这些用 +cells-set。 |
| `--allow-overwrite` | bool | optional | 允许覆盖（默认 true）；设为 false 时若目标非空报错 |
| `--range` | string | optional | --start-cell 的别名（与 +csv-get / +cells-set 一致，用 --range 定位）；传区间（如 A1:H17）时自动取其左上角单元格（隐藏 flag：不在 `--help` 列出，但可正常传入） |

### `+table-put`

_公共：URL/token（无 sheet 定位） · 系统：`--dry-run`_

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--sheets` | string + File + Stdin（复合 JSON） | required | Typed 表格协议（pandas-DataFrame-shaped）JSON：顶层 `{"sheets":[...]}`，每个数组项是一张子表 `{name, start_cell?, mode?, header?, allow_overwrite?, columns:["colA","colB",...], data:[[...]], dtypes?:{colA:pandasDtype, ...}, formats?:{colA:numberFormat, ...}}` —— `name` 与外层 `sheets` 数组都不可省。Agents 用 `scripts/lark_sheets_df.py.txt` 的 `df_to_sheet(df, name)` 一行把 DataFrame 转成一项（多子表就 list 拼起来再包 `{"sheets":[...]}`）。`dtypes` 值是 pandas dtype 字符串（`int64`、`float64`、`Int64`、`bool`、`boolean`、`datetime64[ns]`、`object`、...），CLI 端映射成内部 string/number/date/bool —— 省略 `dtypes` 时该列按文本写入（适合原始 CSV-shaped 数据）。`formats[col]` 是 Excel number_format 字符串（如 `#,##0.00`、`0.0%`、`yyyy-mm`）；缺省时 date 列用 `yyyy-mm-dd`，string 列用文本格式 `@`。 |
| `--styles` | string + File + Stdin（复合 JSON） | optional | 类型保真写入后再应用的视觉处理操作 JSON：顶层 `{styles:[...]}`，每项对应一个被写入的子表、含 `name`，并至少给 `cell_styles` / `row_sizes` / `col_sizes` / `cell_merges` 之一。`cell_styles` 用 A1 单元格 range + 扁平样式字段（字段同 +cells-set-style，含 number_format / 颜色 / 对齐 / border_styles）；row/col sizes 用行/列范围 + type/size；merges 用单元格 range + 可选 merge_type。styles 数组的长度/顺序/name 必须与被写入的子表对应（与 --sheets.sheets 一一对应）。完整 cell_styles 字段结构跑 `+table-put --print-schema --flag-name styles`。 |

## Schemas

> 复合 JSON flag 字段速查（只列顶层 + 一层嵌套）。深层结构看下方 `## Examples`，或用 `--print-schema` 读完整 JSON Schema（用法见 SKILL.md「公共 flag 速查」与「Agent 使用提示」）。

### `+cells-set` `--cells`

_【维度】行列数必须与 range 完全一致：'A1:C2'→[[_,_,_],[_,_,_]]（2行×3列），'B5:B7'→[[_],[_],[_]]（3行×1列），'A1'→[[_]]（1×1）_

**二维数组项**（类型 object）：
- `value` (oneOf?) — 静态单元格值（文本、数字、布尔）
- `formula` (string?) — 以 '=' 开头的单元格公式（例如：'=SUM(A1:A10)'）
- `note` (string?) — 单元格批注/备注
- `cell_styles` (object?) — 单元格样式属性，包括字体、颜色、对齐方式和数字格式 { font_color?: string, font_family?: string, font_size?: number, font_weight?: enum, font_style?: enum, …共 11 项 }
- `border_styles` (object?) — 单元格边框配置，含 top/bottom/left/right 四个方向，每个方向的结构相同（见 top） { top?: object, bottom?: object, left?: object, right?: object }
- `rich_text` (array<object>?) — 富文本内容 each: { type: enum, text: string, style?: object, link?: string, mention_token?: string, …共 17 项 }
- `multiple_values` (array<object>?) — 多值内容，用于支持多选的列表验证单元格 each: { value: oneOf, format?: string }
- `data_validation` (object?) — 数据验证配置 { type: enum, items?: array<string>, range?: string, operator?: enum, values?: array<oneOf>, …共 9 项 }

### `+cells-set` `--writes`

_多区域写入项数组（最多 100 项），整批单次批量提交（fail-fast，失败后先回读再补发）；支持跨 sheet_

**数组项**（类型 object）：
- `sheet_id` (string?) — 目标子表 reference_id；与 sheet_name 二选一，必须写在每一项里（不认顶层 sheet 定位）
- `sheet_name` (string?) — 目标子表名；与 sheet_id 二选一，必须写在每一项里
- `range` (string) — A1 矩形范围，行列维度必须与 cells 严格一致（同 --range）
- `cells` (array) — 二维单元格数组，结构同 --cells（value / formula / cell_styles / border_styles 等，见 set_cell_…

### `+cells-set-style` `--border-styles`

_单元格边框配置，含 top/bottom/left/right 四个方向，每个方向的结构相同（见 top）_

**顶层字段**：
- `top` (object?) { style?: enum, weight?: enum, color?: string }
- `bottom` (object?) { style?: enum, weight?: enum, color?: string }
- `left` (object?) { style?: enum, weight?: enum, color?: string }
- `right` (object?) { style?: enum, weight?: enum, color?: string }

### `+dropdown-set` `--options`

_列表选项_

**数组项**（类型 string）：
- 标量：string

### `+table-put` `--sheets`

_一个或多个子表的 typed 数据，每个数组元素写入一张子表；支持多 DataFrame → 多子表一次写入_

**数组项**（类型 object）：
- `name` (string) — 目标子表名
- `start_cell` (string?) — 写入起点单元格（A1 记法，如 "B2"），默认 "A1"
- `mode` (enum?) — overwrite（默认）：从 start_cell 起写「表头 + 数据」块；append：把数据追加到子表已有数据下方（默认不重复表头） [overwrite / append]
- `header` (boolean?) — 是否写一行列名表头
- `allow_overwrite` (boolean?) — 为 false 时，若写入会落在非空单元格则拒写以保护原数据（返回 partial_success）
- `columns` (array<string>) — 列名字符串数组，顺序与 `data` 中每行取值一一对应
- `data` (array<array<string|number|boolean|null>>) — 数据行；每行是一个数组，长度必须等于 `columns` 数
- `dtypes` (object?) — 可选
- `formats` (object?) — 可选

### `+table-put` `--styles`


**数组项**（类型 object）：
- `cell_merges` (array<object>?) — 单元格合并操作数组；range 使用 A1 单元格范围，merge_type 默认 all each: { merge_type?: enum, range: string }
- `cell_styles` (array<object>?) — 单元格样式操作数组；每项用 A1 单元格 range 指定范围，字段名与 +cells-set-style 对齐 each: { background_color?: string, border?: object, border_styles?: object, font_color?: string, font_family?: string, …共 14 项 }
- `col_sizes` (array<object>?) — 列宽操作数组；range 使用列范围如 A:C，给 size（px）即像素列宽（type 可省略）；type 为 standard 时不带 size each: { range: string, size?: number, type?: enum }
- `freeze` (object?) — 冻结行列：rows = 冻结前 N 行，cols = 冻结前 N 列（0 或省略 = 该维度不冻结） { cols?: integer, rows?: integer }
- `name` (string) — 子表名
- `row_sizes` (array<object>?) — 行高操作数组；range 使用行范围如 1:3，给 size（px）即像素行高（type 可省略）；type 为 standard/auto 时不带 size each: { range: string, size?: number, type?: enum }

## Examples

公共四件套：所有 shortcut 顶部排列 `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`（XOR）。

### `+cells-set` 的拆分与转介绍

"工具选择"段已讲清纯值（`+csv-put`）vs 富写入（`+cells-set`）。下表补 CLI 侧的 `+cells-set` **兄弟拆分**，以及不属于本 reference 的**跨 reference 转介绍**——避免 agent 用 `+cells-set` 硬扛所有写入场景。

| 写入场景 | 用这个 | 不要用 |
|---------|--------|--------|
| 只改**已有 cell 的样式**，不动 value/formula | `+cells-set-style` | `+cells-set`（会触发不必要的值写入） |
| 把**单张图片嵌入**到某个 cell | `+cells-set-image` | `+cells-set`（参数更繁琐） |
| **插行/列 + 写入** 这种多步组合，且要一次交付 | `+batch-update`（见 lark-sheets-batch-update） | 多次独立 `+cells-set`（插入会扰动后续调用的 range） |
| 在**多个不连续 range** 上应用同一组样式 | `+styles-put`（cell_styles 多项即多区域，见 lark-sheets-styles-put） | 多次 `+cells-set-style`（多次往返） |

### `+cells-set`

示例：

```text
# 纯值（数组形态）；默认即覆盖非空 cell，无需显式传 --allow-overwrite
lark-cli sheets +cells-set --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --range "A1:B2" \
  --cells '[[{"value":"name"},{"value":"score"}],[{"value":"alice"},{"value":95}]]'

# 富 cell（公式 + 样式，cells 是二维矩阵每元素一个 cell schema）
lark-cli sheets +cells-set --spreadsheet-token shtXXX --sheet-id "$SID" \
  --range "C2:C10" --cells @rich-cells.json
```

`--cells` 富格式见 `## Schemas` 段（cells 元素含 value / formula / cell_styles / border_styles / data_validation / multiple_values / note / rich_text）；值 / 公式 / 样式 / 批注 / 嵌入图片可同一次写入混合提交。

> 中间想跳过的 cell 用空对象 `{}` 占位（底层语义为"保留原值不变"）。例：`--range A1:A5 --cells '[[{"value":1}],[{}],[{}],[{}],[{"value":5}]]'` 只写 A1 和 A5。
>
> 跨多个不连续区域散点写入（如 `D2` + `F7` + `J15`）超出单次 `--range` + `--cells` 的范围，但**仍在 `+cells-set` 之内**：用本命令的 `--writes` 复数形态一次批量交付（每项 `{sheet_name, range, cells}`，可跨 sheet，见上方「多个不连续区域写入」）。**不要为此拼 `+batch-update` 的 `--operations`**——那是给跨类型、有顺序依赖的操作链用的。

### `+cells-set-style`

只改样式，不动 value / formula。10 个 cell_styles 字段拍平为独立 flag，边框走 `--border-styles` JSON。

```text
# 加粗 + 黄底
lark-cli sheets +cells-set-style --url "..." --sheet-name "Sheet1" \
  --range "A1:B2" --font-weight bold --background-color "#FFFF00"

# 配套边框
lark-cli sheets +cells-set-style --url "..." --sheet-id "$SID" \
  --range "A1:D10" --font-size 12 --horizontal-alignment center \
  --border-styles '{"top":{"style":"solid","color":"#000","weight":"thin"},"bottom":{"style":"solid","color":"#000","weight":"thin"}}'
```

### `+cells-set-image`

把单张图片嵌入 cell（必须单 cell 范围）：

```text
lark-cli sheets +cells-set-image --url "..." --sheet-name "Sheet1" \
  --range "A1" --image ./logo.png
```

### `+csv-put`

示例：

```text
# 内联 CSV
lark-cli sheets +csv-put --url "https://example.feishu.cn/sheets/shtXXX" \
  --sheet-name "Sheet1" --start-cell "A1" \
  --csv $'name,score\nalice,95\nbob,87'

# 从文件
lark-cli sheets +csv-put --spreadsheet-token shtXXX --sheet-id "$SID" \
  --start-cell "A1" --csv @data.csv
```

> `+csv-put` 比 `+cells-set` 短得多——批量灌值或公式时优先用它。需要样式/批注/图片才换 `+cells-set`。
>
> ✅ `=` 开头的单元格会被当作公式计算（不是字面量文本）：
>
> ```text
> lark-cli sheets +csv-put --url "..." --sheet-name "Sheet1" \
>   --start-cell "A1" \
>   --csv $'name,score\nalice,=SUM(B2:B10)'
> # ↑ B2 写入公式 =SUM(B2:B10)，读回 formula 保留、value 为计算结果。
> # 反过来：无法用 +csv-put 写「= 开头的字面量文本」（会被当公式）；样式/批注/图片仍用 +cells-set。
> ```
>
> ⚠️ **公式内部含逗号 / 引号建议 RFC 4180 转义**：CSV 用逗号分隔字段，公式里的逗号（如 `COUNTIF(D5:D22,"及格")` 的参数分隔逗号）会被解析器当成字段分隔符，把一格拆成多格、整块二维结构压扁错位。规则：**含逗号的字段整格用双引号包裹，字段内部的引号再翻倍**：
>
> ```text
> # 从 G4 写一个 2 列 3 行的统计块；=COUNTIF 含逗号 + 内部引号，建议转义
> lark-cli sheets +csv-put --url "..." --sheet-name "Sheet1" \
>   --start-cell "G4" \
>   --csv $'统计项,结果\n成绩总和,=SUM(C5:C22)\n及格人数,"=COUNTIF(D5:D22,""及格"")"'
> # ↑ "=COUNTIF(D5:D22,""及格"")"：外层双引号包裹整格，内部 "及格" 的引号翻倍成 ""及格""。
> # 裸写 =COUNTIF(D5:D22,"及格") 会被 CSV 按逗号拆成两格、写入区域从 G4:H6 错位成 G4:K4。
> ```
>
> 💡 **含逗号 / 引号 / 换行的公式优先用 `+cells-set`（JSON 二维数组）写入**——`cells[r][c].formula` 直接放公式串，没有 CSV 转义负担。`+table-put` 的 typed payload 可带 `name/start_cell/mode/header/allow_overwrite/columns/data/dtypes/formats`，但没有公式字段；公式写入用 `+cells-set` 或转义后的 `+csv-put`：
>
> ```text
> # 同样的统计块，结构化写入无需任何转义
> lark-cli sheets +cells-set --url "..." --sheet-name "Sheet1" --range "G4:H6" \
>   --cells '[[{"value":"统计项"},{"value":"结果"}],[{"value":"成绩总和"},{"formula":"=SUM(C5:C22)"}],[{"value":"及格人数"},{"formula":"=COUNTIF(D5:D22,\"及格\")"}]]'
> ```

> **定位 + 写入边界（关键，避免误覆盖）**：
> - 定位用 `--start-cell`（锚点 = 左上角单元格）；也接受 `--range` 别名（与 `+csv-get` / `+cells-set` 一致，传区间会自动取左上角）。
> - ⚠️ `--start-cell` / `--range` **只定左上角、不限制写入大小**：CSV 从锚点按自身行列数 auto-expand 铺开。给一个"小 range"**不会**截断数据——超出部分照写，且默认覆盖。`+cells-set` 只有裸 `--range A1` 是这个语义；`--range` 一旦写成矩形就是边界，`--cells` 超出它会被拒绝。
> - dry-run 与成功响应都回显 `writes_range`（实际落区，如 `B2:D4`）：**写前先 `--dry-run` 看一眼落区**，确认不会盖到相邻数据。
> - 要保护非空 cell：`--allow-overwrite=false`（落区内出现非空 cell 即报错）。

### `+table-put`（DataFrame → 飞书，类型保真写入）

把结构化数据（DataFrame、list of dict、Counter）类型保真写入**已有**表（写入语义同 `+cells-set`）。协议形状**对齐 pandas `to_json(orient="split")`**：`columns:[列名]` + `data:[[行...]]`，可选 `dtypes:{列名:pandas_dtype}` 决定每列类型（number 保精度、date 落真日期），可选 `formats:{列名:number_format}` 覆盖显示格式（千分位 / 百分比 / 自定义日期）。dtypes 缺失时整张表按 string 写入（带 `@` 文本格式，邮编 / 订单号等含前导零的 id 保真）。

只写入**已有**表（`--url` / `--spreadsheet-token` 二选一必填），不新建工作簿——**要新建表格直接用 `+workbook-create --sheets`**（同协议、一步建表 + 类型保真写入，详见 workbook reference）。读回用镜像命令 `+table-get`（见 read-data reference），输出与 `--sheets` 同构、可 round-trip。

```text
# sheet 按 name 匹配、缺则新建；多 DataFrame 经 stdin 一次写多 sheet
python export.py | lark-cli sheets +table-put --url "<表URL>" --sheets -
# 某 sheet 带 "mode":"append" 追加到已有数据末尾、默认不重复表头
lark-cli sheets +table-put --spreadsheet-token "<token>" --sheets @payload.json
# --sheets 与 --styles 都是大 JSON 时：stdin 每次调用只能给一个 flag，一个走 -、另一个走 @cwd 相对路径
lark-cli sheets +table-put --url "<表URL>" --sheets - --styles @styles.json < sheets.json
```

每个 sheet 还可带 `"allow_overwrite": false`（遇非空拒写、保护原数据）、`"header": false`（只写数据不写表头）。完整字段跑 `+table-put --print-schema --flag-name sheets`。

#### DataFrame → 协议（用 `df_to_sheet` helper）

pandas 的 `df.to_json(orient="split", date_format="iso")` 一步完成所有清洗（NaN→null、Timestamp→ISO 字符串、numpy 标量→原生数字），把 dtypes 拼上即可。本 skill 把这段 5 行 helper 打包成可 import 的 [`scripts/lark_sheets_df.py.txt`](lark-sheets-0.md#s-958a212184321d2d)（含 `df_to_sheet` 和 `sheet_to_df`，写入 / 读回成对）：

```python
import sys; sys.path.insert(0, "scripts")  # cwd 不在 skill 根时改成 scripts/ 的实际路径
from lark_sheets_df import df_to_sheet

# 单 sheet（显式 format 覆盖默认显示）
payload = {"sheets": [df_to_sheet(df, "销售", {"营收": "#,##0.00", "毛利率": "0.0%"})]}

# 多 sheet——helper 让每个 sheet 一行，不再重复 boilerplate
payload = {"sheets": [df_to_sheet(df1, "销售"),
                      df_to_sheet(df2, "成本"),
                      df_to_sheet(df3, "利润")]}
```

> **CSV-shaped 全文本数据**（不需要类型保真、含前导零的 id 也要保留）省掉 dtypes 即可，inline 一行写完，不必走 helper（注意保留 `date_format="iso"`，否则 datetime 列会被序列化成 epoch 毫秒数字，CLI 拒绝）：
> ```python
> payload = {"sheets": [{"name": "原始",
>                        **json.loads(df.to_json(orient="split", date_format="iso"))}]}
> ```
> **别把 `to_json + json.loads` 换成 `df.to_dict(orient="split")`**：会留 `numpy.int64` 让 `json.dumps` 后续报 "not serializable"——这一步是清洗的关键。
> **列名必须是字符串**：整数列名（如未指定表头时 pandas 默认的 0/1/2）会以 JSON 数字进入 `columns` 被 CLI 拒收；inline 写法要先 `df.columns = df.columns.map(str)`。`df_to_sheet` 已自动完成这一步。

不用 pandas 也行——typed 协议就是纯 JSON。手写场景：

```python
# Counter / dict / 手拼数据：直接写 columns + data，按需加 dtypes/formats
payload = {"sheets": [{
    "name": "渠道",
    "columns": ["channel", "count", "rate"],
    "data": [["app", 1240, 0.62], ["web", 760, 0.38]],
    "dtypes": {"count": "int64", "rate": "float64"},
    "formats": {"rate": "0.0%"},
}]}
```

> **dtype 速查**：`int64`/`float64`（数值）、`Int64`（含空值的整数，nullable）、`bool`/`boolean`、`datetime64[ns]`（date，默认 `yyyy-mm-dd`）、`object`（string）。pandas dtype 字符串原样塞进 dtypes 即可，CLI 端按前缀匹配（`int*`/`uint*`/`Int*`/`float*` → number 等）。未识别 dtype 兜底为 string。

#### `--styles`（写入时同时套样式）

`--styles` 在 typed 写入后顺带应用视觉处理，省掉一次 `+cells-set-style` 往返。协议与 `+workbook-create --styles` **完全同构**（详见 workbook reference）：顶层 `{styles:[...]}`，数组每项对应一个被写入的子表、含 `name`，并按能力拆成四类可选数组——`cell_styles`（A1 单元格 range + 扁平样式字段，含 `number_format` / 颜色 / 对齐 / `border_styles`，随内容在同一次写入里一并应用）、`cell_merges`、`row_sizes`、`col_sizes`。styles 数组的长度 / 顺序 / name 必须与被写入的子表对应（与 `--sheets.sheets` 一一对应）。

```text
lark-cli sheets +table-put --url "<表URL>" \
  --sheets '{"sheets":[{"name":"明细","columns":["日期","金额"],"dtypes":{"日期":"datetime64[ns]","金额":"float64"},"formats":{"金额":"#,##0.00"},"data":[["2024-01-15",1234.5]]}]}' \
  --styles '{"styles":[{"name":"明细",
    "cell_styles":[{"range":"A1:B1","font_weight":"bold","background_color":"#f5f5f5","horizontal_alignment":"center"}],
    "cell_merges":[{"range":"A1:B1"}],
    "col_sizes":[{"range":"A:B","type":"pixel","size":120}]}]}'
```

完整字段跑 `+table-put --print-schema --flag-name styles`。

### Validate / DryRun / Execute 约束

- `Validate`：XOR 公共四件套；`+cells-set` 的 `--cells` 必须能解析为各行等宽的 JSON 二维矩阵（落区按其行列数推断）；`+cells-set-style` 的样式 flag 至少一个非空（或带 `--border-styles`）；`+cells-set-image` 的 `--range` 必须是单 cell（起止 cell 相同）；`+csv-put` 的 `--csv` 必须能按 RFC 4180 解析；`+table-put` 给了 `--styles` 则按子表名 / 顺序 / 数量与 `--sheets.sheets` 对齐校验；防爆参数上限校验。
- `DryRun`：输出目标 range + 推断尺寸 + 是否覆盖非空 cell 警告，零网络副作用。
- `Execute`：写后必须按写入范围回读首、中、末及用户点名项；公式同时读取 formula，并按公式完成流程验证。


<a id="s-1fc1708a1e4de866"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `sheets.v3.spreadsheet.create` | [Feishu/Lark]-云文档-电子表格-表格-创建电子表格-在云空间指定目录下创建电子表格。可自定义表格标题。不支持带内容创建表格 | feishu_call_tool |
| `sheets.v3.spreadsheet.get` | [Feishu/Lark]-云文档-电子表格-表格-获取电子表格信息-根据电子表格 token 获取电子表格的基础信息，包括电子表格的所有者、URL 链接等 | feishu_read_tool |
| `sheets.v3.spreadsheet.patch` | [Feishu/Lark]-云文档-电子表格-表格-修改电子表格属性-该接口用于修改电子表格的属性。目前支持修改电子表格标题 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.create` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-创建筛选条件-在筛选视图的指定列创建筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.delete` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-删除筛选条件-删除筛选视图指定列的所有筛选条件 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.get` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-获取筛选条件-获取筛选视图某列的筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.query` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-查询筛选条件-查询指定筛选视图的所有筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.update` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-更新筛选条件-更新筛选视图指定列的筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.create` | [Feishu/Lark]-云文档-电子表格-筛选视图-创建筛选视图-指定电子表格工作表的筛选范围，创建一个筛选视图 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.delete` | [Feishu/Lark]-云文档-电子表格-筛选视图-删除筛选视图-删除指定筛选视图 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.get` | [Feishu/Lark]-云文档-电子表格-筛选视图-获取筛选视图-获取指定筛选视图的信息，包括 ID、名称和筛选范围 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterView.patch` | [Feishu/Lark]-云文档-电子表格-筛选视图-更新筛选视图-更新筛选视图的名称或筛选范围 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.query` | [Feishu/Lark]-云文档-电子表格-筛选视图-查询筛选视图-查询电子表格指定工作表的所有筛选视图及其基本信息，包括视图 ID、视图名称和筛选范围 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilter.create` | [Feishu/Lark]-云文档-电子表格-筛选-创建筛选-在电子表格工作表的指定范围内，设置筛选条件，创建筛选 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilter.delete` | [Feishu/Lark]-云文档-电子表格-筛选-删除筛选-删除电子表格中指定工作表的所有筛选 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilter.get` | [Feishu/Lark]-云文档-电子表格-筛选-获取筛选-获取电子表格中工作表的详细筛选信息，包括筛选的应用范围、筛选条件、被筛选条件过滤掉的行 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilter.update` | [Feishu/Lark]-云文档-电子表格-筛选-更新筛选-在电子表格工作表筛选范围中，更新指定列的筛选条件 | feishu_call_tool |
| `sheets.v3.spreadsheetSheet.find` | [Feishu/Lark]-云文档-电子表格-单元格-查找单元格-在指定范围内查找符合查找条件的单元格 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.create` | [Feishu/Lark]-云文档-电子表格-浮动图片-创建浮动图片-在电子表格工作表的指定位置创建一张浮动图片 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.delete` | [Feishu/Lark]-云文档-电子表格-浮动图片-删除浮动图片-删除电子表格工作表内指定的浮动图片 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.get` | [Feishu/Lark]-云文档-电子表格-浮动图片-获取浮动图片-获取电子表格工作表内指定浮动图片的参数信息 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFloatImage.patch` | [Feishu/Lark]-云文档-电子表格-浮动图片-更新浮动图片-更新已有的浮动图片位置和宽高 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.query` | [Feishu/Lark]-云文档-电子表格-浮动图片-查询浮动图片-获取电子表格工作表内所有的浮动图片的参数信息 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.get` | [Feishu/Lark]-云文档-电子表格-工作表-查询工作表-根据工作表 ID 查询工作表属性信息，包括工作表的标题、索引位置、是否被隐藏等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.moveDimension` | [Feishu/Lark]-云文档-电子表格-行列-移动行列-该接口用于移动行或列。行或列被移动到目标位置后，原本在目标位置的行列会对应右移或下移 | feishu_call_tool |
| `sheets.v3.spreadsheetSheet.query` | [Feishu/Lark]-云文档-电子表格-工作表-获取工作表-根据电子表格 token 获取表格中所有工作表及其属性信息，包括工作表 ID、标题、索引位置、是否被隐藏等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.replace` | [Feishu/Lark]-云文档-电子表格-单元格-替换单元格-在指定范围内，查找并替换符合查找条件的单元格 | feishu_call_tool |
| `cli.sheets.spreadsheets.create` | Create a spreadsheet | feishu_call_tool |
| `cli.sheets.spreadsheets.get` | Get spreadsheet information | feishu_read_tool |
| `cli.sheets.spreadsheets.patch` | Modify spreadsheet properties | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.create` | Create a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.delete` | Delete a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.get` | Obtain filter | feishu_read_tool |
| `cli.sheets.spreadsheet.sheet.filters.update` | Update a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheets.find` | Find cells | feishu_read_tool |
| `sheets.v2.tools.read` | 读取电子表格单元格、公式、图表及结构。tool_name 如 get_workbook_structure、get_cell_ranges、get_range_as_csv；input 为对应操作的 JSON 对象。 | feishu_read_tool |
| `sheets.v2.tools.write` | 修改电子表格单元格、公式、格式、图表、透视及结构。tool_name 如 set_cell_range、batch_update、modify_sheet_structure；input 为对应操作 JSON；部分成功不自动回滚。 | feishu_call_tool |


<a id="s-e6951b7dd087587b"></a>

## scripts/lark_sheet_read_cli.py.txt

# Copyright (c) 2026 Lark Technologies Pte. Ltd.
# SPDX-License-Identifier: MIT
"""Read-only Lark Sheet subset wrapper for the helper scripts."""

from __future__ import annotations

import json
import subprocess
import sys
from typing import Any


class LarkCliError(RuntimeError):
    def __init__(self, message: str, *, cmd: list[str] | None = None):
        super().__init__(message)
        self.cmd = cmd or []


def add_spreadsheet_args(
    parser,
    *,
    require_sheet: bool = False,
    allow_sheet: bool = True,
) -> None:
    spreadsheet = parser.add_mutually_exclusive_group(required=True)
    spreadsheet.add_argument("--url")
    spreadsheet.add_argument("--spreadsheet-token")
    if allow_sheet:
        sheet = parser.add_mutually_exclusive_group(required=require_sheet)
        sheet.add_argument("--sheet-id")
        sheet.add_argument("--sheet-name")


def _append_flag(cmd: list[str], name: str, value: Any) -> None:
    flag = f"--{name.replace('_', '-')}"
    if value is None:
        return
    if isinstance(value, bool):
        cmd.append(flag if value else f"{flag}=false")
        return
    cmd.extend([flag, str(value)])


def run_sheets(
    shortcut: str,
    *,
    url: str | None = None,
    spreadsheet_token: str | None = None,
    sheet_id: str | None = None,
    sheet_name: str | None = None,
    flags: dict[str, Any] | None = None,
    timeout: int = 60,
) -> dict[str, Any]:
    if bool(url) == bool(spreadsheet_token):
        raise LarkCliError("Pass exactly one of --url or --spreadsheet-token")
    if sheet_id and sheet_name:
        raise LarkCliError("Pass only one of --sheet-id or --sheet-name")

    cmd = ["lark-cli", "sheets", shortcut]
    _append_flag(cmd, "url", url)
    _append_flag(cmd, "spreadsheet_token", spreadsheet_token)
    _append_flag(cmd, "sheet_id", sheet_id)
    _append_flag(cmd, "sheet_name", sheet_name)
    for key, value in (flags or {}).items():
        _append_flag(cmd, key, value)

    try:
        completed = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except FileNotFoundError as exc:
        raise LarkCliError("lark-cli not found", cmd=cmd) from exc
    except subprocess.TimeoutExpired as exc:
        raise LarkCliError(f"lark-cli timed out after {timeout}s", cmd=cmd) from exc

    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        raise LarkCliError(detail or f"lark-cli exited with {completed.returncode}", cmd=cmd)

    try:
        envelope = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        snippet = completed.stdout[:500].replace("\n", "\\n")
        raise LarkCliError(f"lark-cli stdout was not JSON: {snippet}", cmd=cmd) from exc

    if isinstance(envelope, dict) and envelope.get("ok") is False:
        raise LarkCliError(json.dumps(envelope, ensure_ascii=False), cmd=cmd)
    if not isinstance(envelope, dict):
        raise LarkCliError("lark-cli returned a non-object JSON payload", cmd=cmd)
    return envelope


def envelope_data(envelope: dict[str, Any]) -> dict[str, Any]:
    data = envelope.get("data")
    return data if isinstance(data, dict) else envelope


def emit_success(action: str, data: dict[str, Any], warnings: list[str] | None = None) -> None:
    print(
        json.dumps(
            {
                "ok": True,
                "engine": "lark",
                "action": action,
                "data": data,
                "warnings": warnings or [],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


def emit_error(action: str, message: str, warnings: list[str] | None = None) -> None:
    print(
        json.dumps(
            {
                "ok": False,
                "engine": "lark",
                "action": action,
                "error": message,
                "warnings": warnings or [],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    sys.exit(1)


def sheet_title(sheet: dict[str, Any]) -> str:
    return str(sheet.get("title") or sheet.get("sheet_name") or sheet.get("name") or "")


def sheet_identifier(sheet: dict[str, Any]) -> str:
    return str(sheet.get("sheet_id") or sheet.get("id") or "")


def sheet_locator(sheet: dict[str, Any]) -> dict[str, str]:
    sid = sheet_identifier(sheet)
    if sid:
        return {"sheet_id": sid}
    title = sheet_title(sheet)
    if title:
        return {"sheet_name": title}
    return {}


def extract_sheets(workbook_data: dict[str, Any]) -> list[dict[str, Any]]:
    sheets = workbook_data.get("sheets")
    if isinstance(sheets, list):
        return [sheet for sheet in sheets if isinstance(sheet, dict)]
    workbook = workbook_data.get("workbook")
    if isinstance(workbook, dict) and isinstance(workbook.get("sheets"), list):
        return [sheet for sheet in workbook["sheets"] if isinstance(sheet, dict)]
    return []


def sheet_resource_type(sheet: dict[str, Any]) -> str:
    return str(sheet.get("resource_type") or "")


def is_grid_sheet(sheet: dict[str, Any]) -> bool:
    resource_type = sheet_resource_type(sheet)
    if resource_type == "sheet":
        return True
    # Legacy responses may omit resource_type but still include grid dimensions.
    return not resource_type and sheet.get("row_count") is not None and sheet.get("column_count") is not None


def visible_grid_selection(
    workbook_data: dict[str, Any],
    *,
    sheet_id: str | None = None,
    sheet_name: str | None = None,
) -> dict[str, Any]:
    """Resolve explicit targets or publish a safe default-selection decision.

    Unspecified targets are never selected by index: only visible ordinary grids
    participate, and multiple candidates remain ambiguous for the caller to match
    by task wording or ask the user.
    """
    sheets = extract_sheets(workbook_data)
    specified = {"sheet_id": sheet_id, "sheet_name": sheet_name}
    if sheet_id or sheet_name:
        matches = resolve_target_sheets(workbook_data, sheet_id=sheet_id, sheet_name=sheet_name, require_one=True)
        sheet = matches[0]
        if not is_grid_sheet(sheet):
            raise LarkCliError(f"Sheet {sheet_title(sheet) or sheet_identifier(sheet)} is not a grid sheet; use the matching product API")
        warnings = ["explicit_hidden_sheet"] if sheet.get("is_hidden") is True else []
        return {"policy": "visible_grid_v1", "specified": specified, "selected": _selection_sheet(sheet), "candidates": [_selection_sheet(sheet)], "excluded": [], "ambiguous": False, "warnings": warnings, "next_action": "use selected sheet_id for grid read/write"}

    candidates, excluded = [], []
    for sheet in sheets:
        if not is_grid_sheet(sheet):
            excluded.append({**_selection_sheet(sheet), "reason": "non_grid"})
        elif sheet.get("is_hidden") is True:
            excluded.append({**_selection_sheet(sheet), "reason": "hidden"})
        elif sheet.get("is_hidden") is not False:
            excluded.append({**_selection_sheet(sheet), "reason": "visibility_unknown"})
        else:
            candidates.append(_selection_sheet(sheet))
    candidates.sort(key=lambda item: item.get("index") if isinstance(item.get("index"), int) else 10**9)
    selected = candidates[0] if len(candidates) == 1 else None
    return {"policy": "visible_grid_v1", "specified": specified, "selected": selected, "candidates": candidates, "excluded": excluded, "ambiguous": len(candidates) > 1, "warnings": [], "next_action": "use selected sheet_id for grid read/write" if selected else "match task wording/title/header; do not choose by index"}


def _selection_sheet(sheet: dict[str, Any]) -> dict[str, Any]:
    return {"sheet_id": sheet_identifier(sheet), "title": sheet_title(sheet), "index": sheet.get("index"), "resource_type": sheet_resource_type(sheet) or "legacy_grid", "is_hidden": sheet.get("is_hidden"), "row_count": sheet.get("row_count"), "column_count": sheet.get("column_count")}


def resolve_target_sheets(
    workbook_data: dict[str, Any],
    *,
    sheet_id: str | None = None,
    sheet_name: str | None = None,
    require_one: bool = False,
) -> list[dict[str, Any]]:
    sheets = extract_sheets(workbook_data)
    if sheet_id:
        matches = [sheet for sheet in sheets if sheet_identifier(sheet) == sheet_id]
    elif sheet_name:
        matches = [sheet for sheet in sheets if sheet_title(sheet) == sheet_name]
    else:
        matches = sheets

    if require_one:
        if len(matches) == 1:
            return matches
        if not matches:
            raise LarkCliError("No matching sheet found")
        raise LarkCliError("Multiple sheets matched; pass --sheet-id or --sheet-name")
    return matches


<a id="s-958a212184321d2d"></a>

## scripts/lark_sheets_df.py.txt

#!/usr/bin/env python3
# Copyright (c) 2026 Lark Technologies Pte. Ltd.
# SPDX-License-Identifier: MIT
"""DataFrame ↔ Feishu Sheet typed-JSON helpers.

This is the same 7-line snippet the skill docs already inline (see
`lark-sheets-write-cells` "DataFrame → 协议（5 行 helper）" and
`lark-sheets-read-data` "输出 → DataFrame（2 行 helper）"), pulled out
so callers can `import` it instead of copy-pasting:

    from lark_sheets_df import df_to_sheet, sheet_to_df

Callers run lark-cli themselves; this file is a library, not a CLI.
"""
import json

import pandas as pd


def df_to_sheet(df, name, formats=None):
    """Pack one DataFrame into one entry of a `+table-put --sheets` payload."""
    packed = json.loads(df.to_json(orient="split", date_format="iso"))
    # The protocol requires string column names. pandas keeps integer labels
    # (e.g. the default RangeIndex columns 0/1/2) as JSON numbers, while the
    # dtypes dict keys get stringified during JSON serialization — the CLI
    # then rejects `columns` ("cannot unmarshal number into … type string")
    # and the dtype lookup would miss anyway. Stringify every key once, and
    # refuse to continue when that conversion silently merges two columns.
    normalized_labels = [str(c) for c in df.columns]
    columns = [str(c) for c in packed["columns"]]
    if normalized_labels != columns:
        columns = normalized_labels
    if len(set(columns)) != len(columns):
        raise ValueError(
            "column labels collide after str() conversion; "
            "rename the DataFrame columns before packing"
        )
    packed["columns"] = columns
    dtype_values = list(df.dtypes)
    return {
        "name": name,
        **packed,
        "dtypes": {key: str(dtype) for key, dtype in zip(columns, dtype_values)},
        **({"formats": {str(k): v for k, v in formats.items()}} if formats else {}),
    }


def sheet_to_df(sheet):
    """Restore one `+table-get` sheet dict into a typed DataFrame."""
    return pd.DataFrame(sheet["data"], columns=sheet["columns"]).astype(sheet["dtypes"])


<a id="s-d34c656c2b13a2cb"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# sheets

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理。**

## 场景 → 命令速查

> 按当前动作选行；下一步必须 Read 该行 reference，读取完成前不得执行命令。只读命中的文档；含公式 / 样式等横切动作时再读对应规范，禁止用目录枚举代替 Read。

| 你要做的事 | ✅ 正确写法 | 动手前读（先 Read 再动手） |
| --- | --- | --- |
| 读数据 | `+csv-get`（纯值/CSV）、`+cells-get`（公式/样式/批注） | 读 `references/lark-sheets-read-data.md` |
| 写入数据 | `+csv-put`（无类型歧义纯文本）、`+table-put`（typed；量值/真日期；标签/编号/前导零/文本数字用 object，禁裸 csv-put）、`+cells-set`（公式/富写入）、`+cells-set-style`（样式）、`+cells-set-image`（单元格图片） | 读 `references/lark-sheets-write-cells.md` |
| 格式继承（新列/新行） | 物理插行 / 插列用 `+dim-insert --inherit-style before\|after`；往已有空白区域扩写用 `+range-copy --paste-type formats` 先铺样式再写值 | 读 `references/lark-sheets-range-operations.md`；插行插列再读 `references/lark-sheets-sheet-structure.md` |
| 工作簿操作 | `+workbook-create`、`+workbook-info`、`+workbook-import`、`+sheet-copy`、`+revision-get`、`+workbook-export` | 读 `references/lark-sheets-workbook.md` |
| 行列操作 | 排序用 `+range-sort` 原子移动整行；合并 / 取消合并用 `+cells-merge` / `+cells-unmerge`；清空内容才用 `+cells-clear`；尺寸用 `+cols-resize` / `+rows-resize` | 读 `references/lark-sheets-range-operations.md`；涉结构布局再读 `references/lark-sheets-sheet-structure.md` |
| 美化收尾 | `+styles-put` | 读 `references/lark-sheets-styles-put.md` |
| 子表结构 | `+sheet-info`、`+dim-insert`；删整行 / 列用 `+dim-delete`，不能用 clear 代替 | 读 `references/lark-sheets-sheet-structure.md` |
| 画图表 / 可视化 / 柱状图 / 折线图 / 饼图 / 趋势 / 占比 | 单图用 `+chart-create-basic`，多图用扁平输入的 `+batch-chart-create`；改已有图的数据源用 `+chart-data-update`、配置用 `+chart-config-update`；只有语义 shortcut 表达不了的单系列 / 单数据点 / 高级字段才用 `+chart-create` / `+chart-update`，且只提交必要的局部 properties。动手前先断言每张图的类型、横轴字段、分组字段和目标张数，画完 `+chart-list` 逐项核；图片迁移成真图表后删除并复查原浮动图片 | 读 `references/lark-sheets-chart.md`；含透视 / 分组汇总再读 `references/lark-sheets-pivot-table.md` |
| 分组汇总 / 透视 | `+pivot-create` | 读 `references/lark-sheets-pivot-table.md` |
| 筛选 / 只看符合条件的行 | `+filter-create` | 读 `references/lark-sheets-filter.md` |
| 查找 / 替换文本 | `+cells-search`、`+cells-replace` | 读 `references/lark-sheets-search-replace.md` |
| 条件格式 / 条件高亮 / 数据条 / 色阶 | 随数据变化的标色用 `+cond-format-create`；固定刷色只用于用户点名要静态着色 | 读 `references/lark-sheets-conditional-format.md` |
| 插图：自由摆放的装饰 | `+float-image-create` | 读 `references/lark-sheets-float-image.md` |
| 迷你图 / 单元格内趋势线 | `+sparkline-create` | 读 `references/lark-sheets-sparkline.md` |
| 批量清除多区域 | `+cells-batch-clear` | 读 `references/lark-sheets-batch-update.md`（high-risk） |
| 复核编辑变更 / 取版本间差异 | `+changeset-get` | 读 `references/lark-sheets-changeset.md` |
| 保存多份筛选状态 / 命名筛选视图 | `+filter-view-create`；视图与 `+filter-create` 相互独立、可在同一子表共存 | 读 `references/lark-sheets-filter-view.md` |
| 查编辑历史 / 回滚到历史版本 | `+history-list` 取版本，`+history-revert`（high-risk，异步）回滚后用 `+history-revert-status` 轮询 | 读 `references/lark-sheets-history.md` |

> ⚠️ 金额 / 百分比 / 比率 / 计数及参与运算的真日期写数字（百分比传 `0.4` + `number_format`）；日期标签、编号、前导零、身份证 / 单据号写文本。`--range` 只写 `A1:B2`，子表另传 `--sheet-id` / `--sheet-name`。

## 飞书表格编辑准则

1. **最小改动**：用户没点名要删 / 改名 / 隐藏时，已有 Sheet 一张不动；补齐只写空格，未要求调整的值 / 结构 / 格式不动。
2. **目标子表与回读断言**：先确认真实末行与目标区域；未点名子表时只从 `resource_type=sheet && is_hidden=false` 的可见网格候选里选，唯一才自动使用，多张不得按 index 猜。涉及"所有 / 每个 sheet"（跨表汇总、批量清洗、合并多张子表）时先 `+workbook-info` 列全再逐个处理，别只做前几张。写后用 `+csv-get` / `+cells-get` / `+<对象>-list` 验首、中、末及用户点名项——返回 `ok` 只表示请求成功。纯 CSV 回写前去掉 `annotated_csv` 的 `[row=N] ` 前缀，`cells-get` 的样式字段与值分开处理，公式必须回读 `formula`。**样式同样要回读**：写过边框 / 底色 / 字体色 / 数字格式 / 行高列宽 / 冻结的，收尾用 `+cells-get --include style` 或 `+sheet-info` 抽查目标区域首、中、末格确认属性真的在——写入返回 `ok` 不代表样式落上了；缺的整份重发（样式是幂等盖章，重发无副作用）。
3. **公式闭环**：可推导值写落格公式，不用静态值代替——用 Python 算好数值再写进单元格，交付的是改输入不重算的死表；Python 只用于推导和验证，落进单元格的必须是引用其他格的公式。写前确认字段语义、阈值边界（以上/至少=`>=`，超过/大于=`>`）、单位/时区和完整源范围，选首中末、空值、边界及一条可手算记录作哨兵；写后逐段 `+formula-verify --exit-on-error`，各段 `status='success'` 且哨兵值正确才算完成（AI 公式例外：异步计算，改用 `+formula-verify --ai-only` 对整个写入区间做一次异步状态检查，不用 `+cells-get` 轮询结果，`failed` 清零后即使仍有 pending 也可交付并说明）；试错 3 次仍失败可降级静态值，交付说明写明「静态值 + 失败原因 + 不随源数据更新」。
4. **完整继承样式**：新增行列时禁止只读值只写值——原表字体、对齐、底色（含奇偶行交替）、四边框都延续到新区域。**物理插入行 / 列**用 `+dim-insert --inherit-style before|after`（原生继承，比补刷可靠）；**往已有空白区域扩写**（如在数据右侧加新列）用 `+range-copy --paste-type formats` 先铺样式再写值；两者都表达不了的非规则样式，才用 `+cells-get --include style` 读源区样式随值写回。无论走哪条路径，插入后都另查行高列宽（行高不随样式继承，插行填长文本前补 `+rows-resize`）、合并与跨列标题并补齐。详见 `references/lark-sheets-write-cells.md`。
5. **原子操作**：排序用 `+range-sort`，`--range` 覆盖完整记录宽度，排序列只写进 `--sort-keys`；删除记录用 `+dim-delete`，清空内容 / 格式才用 `+cells-clear`；禁止读值后用 `+csv-put` 覆盖来模拟排序 / 删除。仅跨类型且有顺序依赖时才用 high-risk `+batch-update`。
6. **标色分流**：数据变化后应自动重算的高亮 / 标红用条件格式，已确定结果的固定标注用静态样式，装饰性美化按视觉规范。两条路径取色字段用同一判据：用户中文语境下的"标红 / 染色 / 标记"指**单元格背景色**，"文字红 / 字体红 / 把字变红"才用字体色，默认无说明时选背景色。条件格式建完先 `+cond-format-list` 验规则与范围，再 `+cond-format-result-get` 抽查哨兵格命中样式。
7. **产物可核对**：用户点名的 sheet 名与数量、表头、标题、图例、文件名、口径逐字保留；回复中每项“已完成”都能定位到产物，缺口逐项声明。
8. **替换与新增**：批量替换 / 删除后搜索确认无残留；新增列要有表头，单位 / 口径另置，不占原表头或数据格。
9. **不编造**：表外数据须有可核验来源，不用常识或名称推断伪造公司、标准值、行情或法规参数；**没有来源就留空**——凭记忆填的数值大概率与真实值对不上，比留空更糟。留空的格在交付说明里逐项列出格址与缺的来源，不要只写一句"部分数据缺失"。

> 🤖 **文本类 NLP 任务首选 AI 公式，别默认退回手工 / Python**：只要对文本列做**翻译 / 情感 / 分类打标签 / 信息提取 / 总结 / 润色**等 NLP，飞书在线表格上优先用原生 `=AI(prompt, range)` 逐列铺开（写法与普通公式一致，见 `references/lark-sheets-formula-translation.md`），一次落表随行自动计算，比逐条读 → 手工判断 → 回写 / Python 调模型再写静态值都更省事。**判定标准是「逐行独立」**：每个目标单元格只依赖同一行输入即为逐行独立，**数据量（哪怕 1 万 +）、分批、判断复杂度都不改变该判定**——大数据量下 AI 公式仍是首选，分批只改公式铺设的批次大小（行数很多时按批串行，量级参考每批几百到一千行），不得改为「用 Python 或规则脚本生成语义结果后静态写回」；Python 只能做清洗 / 行号映射 / 构造公式批次，不得读源文本生成目标语义值。只有单个结果依赖多行输入的跨行任务才走非公式路线。AI 公式异步计算，写完先对种子格 / 首格做**一次** `+cells-get --include formula` 核对文本，随后**第一校验入口必须是** `+formula-verify --ai-only --range <整个写入区间>`，禁止用 `+cells-get` 轮询计算结果；判据为 `ai_formula_failed_count == 0`（`--range` 只透传给后端、不保证收窄汇总口径，按返回的单元格定位核对本次区间，别拿总数对预期条数），满足后即使仍有 pending 也可交付，并告知用户"AI 公式仍在后台运行"。

> 流程：了解结构 →（未点名时先按 visible_grid selection 定位）→ 读数据 → 原生工具写入 → 按用户点名项回读验证 → 在线交付。整理 / 美化 / 加汇总行这类会改变表长或版式的任务，收尾把表头行冻住（原表已有冻结设置的不动）。xlsx 验收只在处理本地 xlsx、或用户点名要本地 xlsx / 下载 / 打印时跑。
## References

reference 分两组：先读**通用方法与规范**（横切所有任务的样式 / 公式规则），再按操作对象进入**工具参考**查具体 shortcut。编辑类任务务必先过通用方法与规范，连同上方「飞书表格编辑准则」对所有工具参考一律生效。

### 通用方法与规范（先读，横切所有任务，不含具体 shortcut）

| Reference | 描述 |
| --- | --- |
| [飞书表格样式与配色规范](lark-sheets-0.md#s-034aab944f0fa5b1) | 飞书表格样式与配色规范：表头/数据区/汇总行的颜色、字号、对齐、边框、数字格式等取值标准，以及从零新建表格的版式美化、新增汇总行、追加行列继承原表风格、已有区域美化等典型场景的决策流程与样式要点。工具调用参数细节请参考对应的 lark-sheets-write-cells / lark-sheets-range-operations / lark-sheets-batch-update。条件格式（高亮、标红、数据条、色阶）请使用 lark-sheets-conditional-format。 |
| [飞书表格公式生成规则](lark-sheets-0.md#s-a45637ec47141ec0) | Excel 公式到飞书表格公式的迁移与生成规则。核心目标不是保留 Excel 原语法，而是按飞书表格可执行规则重写公式，并在结果上尽量对齐 Excel。当用户要求把 Excel 公式改写成飞书表格公式，或需要生成飞书公式（尤其涉及 ARRAYFORMULA、数组语义与逐行填充、原生数组函数、INDEX/OFFSET、MAP/LAMBDA、日期差、多层范围结果与二次展开）时使用。本文负责把公式写对；落表后必须用 `references/lark-sheets-formula-verify.md` 对本次公式范围逐段诊断。 |

### 按对象的工具参考（含 shortcut）

| Reference | 描述 |
| --- | --- |
| [Lark Sheet Formula Verify](lark-sheets-0.md#s-a9ccfea5b6632bcb) | 公式写入 / 批量填充 / `--copy-to-range` 扩展 / 导入含公式工作簿后的完成检查。普通公式按本次新增或修改范围逐段扫描，合并编译失败与 7 类运行错误；`partial` 继续拆分，全部 `status='success'` 后完成。AI 公式用 `--ai-only` 对整个写入区间做一次异步状态检查，pending 可说明后交付。 |
| [Lark Sheet Workbook](lark-sheets-0.md#s-5f22cba1f763b5d3) | 管理飞书表格的工作簿结构（子表列表及元数据）。当用户提到"看看这个表格有什么"、"表格结构"、"有哪些 sheet"、"新建一个 sheet"、"删除这个工作表"、"重命名"、"复制一份"、"移动到前面"时使用。 |
| [Lark Sheet Sheet Structure](lark-sheets-0.md#s-2cd74a3800579194) | 管理飞书表格的子表结构与布局：查看行高列宽、隐藏、合并、冻结与分组，并执行插入/删除/移动行列等物理结构操作。数据分组统计走 lark-sheets-pivot-table。普通表尾追加优先用 lark-sheets-write-cells 的 `+table-put --mode append` 自动定位末行；只有用户明确要求物理插入行列、继承模板结构或扩容布局时才先用本 reference。 |
| [Lark Sheet Read Data](lark-sheets-0.md#s-33aa01802edb4628) | 读取飞书表格中的单元格数据。当用户需要"看看数据"、"分析数据"、"统计/汇总"时使用；也适用于需要查看公式、样式、批注等详细信息的场景。 |
| [Lark Sheet Search & Replace](lark-sheets-0.md#s-8f011971acd60ecd) | 在飞书表格中搜索和替换文本，支持限定范围、大小写匹配、精确匹配、正则表达式。当用户需要"查找"、"搜索"、"定位"某个值，或"替换"、"批量修改文本"、"把 A 改成 B"时使用。不要用于理解表格结构（应读取数据）、不要用于数据分析（应读取数据后计算）、不要把用户操作动作中的关键词（如"汇总金额""统计数量"）当作搜索词。 |
| [Lark Sheet Write Cells](lark-sheets-0.md#s-aaec4f9bd070fde4) | 向飞书表格指定区域批量写入值、公式、样式、批注或单元格图片。纯文本可用 `+csv-put`；金额、百分比、日期、布尔、计数和后续参与聚合的列用 `+table-put` 并显式声明 dtypes/formats；公式或富字段用 `+cells-set`。追加数据可直接使用 `+table-put --mode append`；只有明确需要物理插行/列时才先走 lark-sheets-sheet-structure。公式落表后必须运行 lark-sheets-formula-verify。 |
| [Lark Sheet Range Operations](lark-sheets-0.md#s-cf7b82ddfd441386) | 对飞书表格中指定区域执行结构性操作（不涉及写入单元格数据值）。适用场景：清除内容或格式（"清空"、"删除内容"、"去掉格式"）、合并/取消合并单元格、调整行高列宽（"加宽列"、"自适应列宽"）、移动/复制/填充/排序数据（"移动数据"、"复制到"、"自动填充"、"按某列排序"）。写入单元格数据请使用 lark-sheets-write-cells。 |
| [Lark Sheet Styles Put](lark-sheets-0.md#s-503d10a0a677b33f) | 把一份声明式视觉规格（样式/边框/合并/行高列宽/冻结）一次性应用到已有飞书表格的多个子表，整份规格一次提交。当任务是对存量表做美化收尾、批量刷样式、统一版式时使用。样式取值标准见 lark-sheets-visual-standards；建新表带样式走 lark-sheets-workbook（+workbook-create --styles）、写数据同步带样式走 lark-sheets-write-cells（+table-put --styles），三者共用同一份 --styles 词汇。仅针对飞书表格。 |
| [Lark Sheet Batch Update](lark-sheets-0.md#s-2c25121f6c3b3f7f) | 将多个飞书表格写入操作合并为一次批量执行，按顺序依次完成。适合需要连续执行多个写入操作的场景（如先修改结构再写入数据）。 |
| [Lark Sheet Chart](lark-sheets-0.md#s-cbce883aa9089c71) | 管理飞书表格中的图表（柱形图、折线图、饼图、条形图、面积图、散点图、组合图、雷达图等）。当用户需要创建图表、修改图表样式或数据源、查看已有图表配置、删除图表时使用。也适用于用户提到"数据可视化"、"画个图"、"趋势分析"、"对比图"、"占比分析"、"做个图表"等数据可视化相关场景。 |
| [Lark Sheet Pivot Table](lark-sheets-0.md#s-c059a327af863d1a) | 管理飞书表格中的数据透视表。当用户需要创建透视表、修改透视表的行列字段/聚合方式/筛选条件、查看已有透视表配置、删除透视表时使用。也适用于用户提到"分组汇总"、"交叉分析"、"按XXX统计"、"按字段分组"、"再分下组"、"多维分析"、"数据透视"等场景。 |
| [Lark Sheet Conditional Format](lark-sheets-0.md#s-4125fd916baec37d) | 管理飞书表格中的条件格式规则（重复值高亮、单元格值比较、数据条、色阶、排名、自定义公式等）。当用户需要创建条件格式、修改已有规则的范围或样式、查看当前条件格式配置、删除规则时使用。也适用于用户提到"高亮"、"标红"、"颜色标记"、"数据条"、"色阶"、"条件样式"等场景。 |
| [Lark Sheet Filter](lark-sheets-0.md#s-00b713f0148c2449) | 管理飞书表格中的筛选器（filter）。当用户需要筛选数据（按文本/数值/颜色/日期条件过滤行）、查看已有筛选配置、修改或删除筛选器时使用。也适用于"只看"、"筛选出"、"仅保留符合条件的"等场景。 |
| [Lark Sheet Filter View](lark-sheets-0.md#s-8560a4edfe4af66a) | 管理飞书表格中的筛选视图（filter view）。当用户需要"建一个 XX 视图"、"保存这个筛选状态"、"切换不同筛选"、维护一个 sheet 上多份独立筛选配置时使用。视图与筛选器（filter）相互独立，可在同一 sheet 共存；视图的隐藏行仅在用户进入该视图时本地生效，不影响其他协作者。 |
| [Lark Sheet Sparkline](lark-sheets-0.md#s-04bd8322957595ca) | 管理飞书表格中的迷你图（折线迷你图、柱形迷你图、胜负迷你图）。当用户需要在单元格内嵌入小型图表来展示数据趋势时使用。也适用于"趋势线"、"单元格内图表"、"迷你图"等场景。注意：不等同于被禁用的 SPARKLINE() 公式函数。 |
| [Lark Sheet Float Image](lark-sheets-0.md#s-de6e8fafb9b89e1b) | 管理飞书表格中的浮动图片。当用户需要在表格中插入浮动图片、调整图片位置和大小、查看已有浮动图片、删除图片时使用。也适用于"插入图片"、"添加 logo"、"放一张图"等场景。注意：如果用户需要将图片嵌入到某个单元格内部（单元格图片），请阅读 lark-sheets-write-cells。 |
| [Lark Sheet History](lark-sheets-0.md#s-27621128aa1e437c) | 查询飞书表格的历史版本并回滚到指定版本。当用户需要查看一张表的编辑历史版本列表、回滚到某个历史版本、或查询回滚的异步状态（进行中/成功/失败）时使用。回滚为异步操作，发起后通过状态查询轮询结果。仅针对飞书表格。 |
| [Lark Sheet Changeset](lark-sheets-0.md#s-18cdf321d09f6521) | 读取两个版本（CS revision）之间的 changeset（原始变更操作清单），用于复核某次编辑——尤其是 AI 编辑——是否真实满足用户诉求。传入起始版本（编辑前基线），可选结束版本（省略取最新），版本差上限 20；返回里最外层带当前表格最新版本号。当用户需要"看看这次改了什么"、"核对 AI 改动"、"对比两个版本的变更"时使用。 |

## 公共 flag 速查

各 reference 的 shortcut 标题下用一行徽章标注支持的公共 / 系统 flag（如 `_公共四件套 · 系统：--dry-run_`）。type / 必填 / 描述在本段统一声明：

### 公共 flag（定位资源）

**公共四件套** = `--url` / `--spreadsheet-token` / `--sheet-id` / `--sheet-name`，分成两组 XOR，**每组都必须给且只能给一个**（XOR = 二选一必填，不是"可选"）——`spreadsheet` 指工作簿、`sheet` 指子表；条件格式 / 图表 / 筛选视图 / 透视表 / 迷你图 / 浮动图片这类对象在四件套之外另用各自的 `--*-id` 定位：

1. **spreadsheet 定位（必填）**：`--url`（解析 `/sheets/`、`/spreadsheets/`、`/wiki/` 三种链接；wiki 链接自动定位背后的电子表格）与 `--spreadsheet-token`（裸 token）二选一。**例外**：`+workbook-create` / `+workbook-import` 产出**还不存在**的表，不接受任何定位 flag。
2. **sheet 定位（公共四件套 shortcut 必填）**：`--sheet-id` 与 `--sheet-name` 二选一。
   - ⚠️ **不确定 sheet 名时禁止猜 `Sheet1`**：除非对话或上下文已出现具体值，第一步先 `+workbook-info` 拿 `sheets[].sheet_id/title` 再选——中文表的子表常叫"数据"/"工作表 1"/业务名，猜名大概率撞 `sheet not found`。
   - ⚠️ **`--range` 里的 `Sheet1!` 前缀不能替代 sheet 定位**：仍必须传 `--sheet-id` / `--sheet-name`。
   - ⚠️ **A1 引用含 `!` 时整段用单引号包裹**（`--range 'Sheet1!A1:B2'`，挡 bash history expansion；别用 `set +H`，sh/dash 下非法）。sheet 名要在 A1 里内层再包单引号时用 `'\''` 转义。
   - **例外**：徽章标 `_公共：URL/token（无 sheet 定位）…_` 的 shortcut 不接受 sheet 定位——工作簿级（`+workbook-info` / `+sheet-list` / `+sheet-create` / `+revision-get` / `+changeset-get` / `+history-list|revert|revert-status`）、批量与整表级（`+batch-update` / `+batch-chart-create|update` / `+cells-batch-clear` / `+styles-put` / `+dropdown-update|delete`），以及子表名写在 payload 里的 `+table-put`。`+workbook-export` 只接 `--sheet-id`（无 `--sheet-name`），`+pivot-create` 用 `--target-sheet-id/name`（XOR，可都不传）。徽章是判据，本行只是速记。

```text
# 统一调用范式：两组定位缺一不可（占位符别原样填；表名先 +workbook-info 查）
lark-cli sheets +csv-get --url "https://.../sheets/shtXXX" --sheet-name "<真实表名>" --range "A1:F30"
```

### 系统 flag

| Flag | Type | 必填 | 说明 |
| --- | --- | --- | --- |
| `--dry-run` | bool | 否 | 零副作用：仅打印请求路径与参数模板，不发起调用 |
| `--yes` | bool | 是（仅 `high-risk-write`） | 二次确认；不带时退出码 10。详见 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流） 高风险审批协议 |
| `--print-schema` | bool | 否 | 写复合 JSON flag 前结构不确定就先跑它：本地打印 Schema 并退出（不发起调用、不需要其它 required flag），搭配 `--flag-name` 指定查哪个 flag，省略时列出该 shortcut 可查的 flag。只有含复合 JSON flag 的 shortcut 支持。 |
| `--flag-name` | string | 否 | 配合 `--print-schema`：flag 名不带 `--` 前缀（`cells` / `properties`）。**支持点分路径切片**：`--flag-name properties.snapshot.plotArea.axes` 只打印该子树，大 schema（chart 的 properties 约 1700 行）按需取，别整篇翻页。 |

> **bool flag 语法**：开启可用裸 `--flag`；显式值只用 `--flag=true` 或 `--flag=false`，不得用空格分隔。

> ⚠️ **high-risk-write 命令清单（exit 10 强确认门禁）**：`+batch-update`、`+cells-clear`、`+cells-batch-clear`、`+sheet-delete`、`+dim-delete`、`+dropdown-delete`、`+history-revert`（整表回滚到历史版本），以及各对象删除 `+chart-delete` / `+pivot-delete` / `+cond-format-delete` / `+filter-delete` / `+filter-view-delete` / `+sparkline-delete` / `+float-image-delete`。
>
> **审批协议**：先 `--dry-run` 预览、向用户展示将执行的操作与影响范围，**获得用户明确同意后**再在原命令追加 `--yes` 执行。未经用户同意不得带 `--yes`，也不得在 exit 10 后静默补 `--yes` 重试——那等于禁用门禁。完整协议见 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流）。

**Schema 的边界**：`--print-schema` 打印的是 flag 值的内部结构，flag 描述要求外层信封时（如 `--sheets` 的 `{"sheets":[…]}`）schema 里看不到那层，按描述补上；reference 的 `## Schemas` 段也只给一层。图表直接 `+chart-create --print-example <type>` 拿最小可用模板改参。

### flag 内容类型与输出约定（术语速记）

- JSON 类入参分三类：**复合 JSON** = 深层嵌套对象（`--print-schema` 可查）；**简单 JSON** = 一二维标量数组；**非 JSON 文本** = 原样文本（如 CSV）。
- **envelope**：所有 shortcut 返回统一外层 `{ok, identity, data, ...}`；写操作不会自动回读，校验自行调用 `+*-list` / `+*-get` / `+cells-get`。
- **大 payload 走文件 / stdin，不在命令行内联**：Type 标 `File + Stdin` 的 flag 支持 `--flag "@./x.json"`（`@file` 只接受 cwd 下相对路径，绝对路径被拒）与 `--flag -`（stdin）；payload 含换行 / 引号或体量大时一律落文件。**stdin 每次调用只能给一个 flag**——`+table-put` 的 `--sheets` 与 `--styles` 都是大 JSON 时，一个走 `-`、另一个走 `@./x.json`。临时文件不要落进用户项目目录。
- **非 POSIX shell（PowerShell / cmd.exe）适配**：本 skill 全部 `bash` 代码块（heredoc `<<'JSON'`、单引号转义 `'\''`）只适用于 bash / zsh，动手前先判断当前 shell，非 POSIX 环境按下表改写，**不要试错式改引号**——`@file`（cwd 相对路径）是全平台无引号问题的兜底形态：

| 形态 | bash / zsh | PowerShell | cmd.exe |
| --- | --- | --- | --- |
| 大 / 多行 JSON | `--flag - <<'JSON' … JSON` | 先写 UTF-8 无 BOM 文件再 `--flag '@./x.json'`，或 `Get-Content -Raw ./x.json \| lark-cli … --flag -` | 先写文件再 `--flag @./x.json`（cmd 无 heredoc / 管道读文件不可靠） |
| 单行 inline JSON | `--flag '{"a":1}'` | `--flag '{"a":1}'`（PS 单引号同为字面量） | 不要 inline——cmd 会吃掉内层双引号，一律走 `@file` |
