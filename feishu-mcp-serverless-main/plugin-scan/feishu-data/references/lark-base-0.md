<a id="s-f9ade3356084cb11"></a>

## SKILL.md


# base

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. URL 中的 base/app、table、view、record 分别定位。先用 feishu_get_table_schema 读取数据表、字段类型和视图；筛选与写入字段必须来自真实 schema。

2. 查询用 feishu_query_records；新增/修改/删除用 feishu_create_records、feishu_update_records、feishu_delete_records。只返回一页时不能计算全表总额；继续 cursor。固定 view 无记录就是空结果，不扩大查询范围。

3. 修改只传目标字段与已查询到的 record_id。保留编号前导零，日期按 schema 使用毫秒，选项/人员/附件/关联记录按字段类型构造。批量最多 100，创建重试复用同一 client_token；部分成功不重发成功项。

4. 更复杂操作查 bitable/base 的原生 schema。Base Block、表内字段记录、Dashboard 内部组件、BaseApp Page、Workspace 是不同层级，不能混用 ID。现有 workflow 列表/更新和 dashboard 列表/复制可以使用。

5. 完整替换型 update 先读现状并合并，delta 仅提交变更。表单移除题目可能同时删除底层字段和数据，必须按 schema 区分保留字段的操作。

6. BaseApp/Workspace/新组件与 v3 流程若目录无对应工具，指出缺少的具体操作；不能用新建普通表冒充完成，也不能拿妙搭 apps 替代 BaseApp。

## 按需参考

- [工具与合同](lark-base-0.md#s-f666ff95dd93435b)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-base-0.md#s-e7d0fe3a478ce891)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-base-0.md#s-e927c01324b3f729)。


<a id="s-0599e27f974fbb13"></a>

## references/baseline/references/dashboard-block-data-config.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# dashboard block data_config SSOT

Block 的 `data_config` 字段因 `type` 不同而变化。本文档是 dashboard block `data_config` 的单一事实来源（SSOT），包含组件类型、字段结构、筛选格式、约束和可复制模板。

## 支持的组件类型（`type` 枚举）

| type 值 | 说明 |
|---------|------|
| `column` | 柱状图 |
| `bar` | 条形图 |
| `line` | 折线图 |
| `pie` | 饼图 |
| `ring` | 环形图 |
| `area` | 面积图 |
| `combo` | 组合图 |
| `scatter` | 散点图 |
| `funnel` | 漏斗图 |
| `wordCloud` | 词云 |
| `radar` | 雷达图 |
| `statistics` | 指标卡 |
| `text` | 文本（支持 Markdown） |

## 字段类型与操作符速查（AI 决策用）

> 先用 `+field-list` / `+field-get` 确认字段 `type`；本节使用当前字段接口里的 canonical 类型名：`number`、`text`、`select`、`datetime`、`checkbox`、`user`。

```
text: is, isNot, contains, doesNotContain, isEmpty, isNotEmpty
number: is, isNot, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty
select（multiple=false）: is, isNot, isEmpty, isNotEmpty
select（multiple=true）: is, isNot, contains, doesNotContain, isEmpty, isNotEmpty
datetime: is, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty
checkbox: is (value: true/false)
user / created_by / updated_by: is, isNot, isEmpty, isNotEmpty
```

## data_config 通用结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `table_name` | string | 关联数据表名称 |
| `series` | `[{ "field_name": "xxx", "rollup": "SUM" }]` | 指标/Y 轴（与 `count_all` 二选一）。rollup 支持 `SUM` / `MAX` / `MIN` / `AVERAGE` |
| `count_all` | boolean | COUNTA 聚合，统计所有记录数（与 `series` 二选一） |
| `group_by` | `[{ "field_name": "xxx", "mode": "integrated", "sort": {...} }]` | X 轴分组维度。`mode` 必填，`sort` 可选，见下方说明 |
| `filter` | object | 筛选条件 |
| `filter.conjunction` | `"and"` / `"or"` | 筛选逻辑 |
| `filter.conditions` | `[{ "field_name", "operator", "value" }]` | 筛选条件数组，value 类型因字段类型而异（见下方 filter 格式规则） |

### text 类型特殊结构

`text` 类型组件用于展示富文本内容，**不需要数据源配置**（无 `table_name`、`series`、`group_by`、`filter`）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | **必填**。支持 Markdown 语法，详见下方说明 |

**支持的 Markdown 语法：**

| 语法 | 示例 | 效果 |
|------|------|------|
| 一级标题 | `# 标题` | 大标题 |
| 二级标题 | `## 标题` | 中标题 |
| 三级标题 | `### 标题` | 小标题 |
| 加粗 | `**文字**` | **文字** |
| 斜体 | `*文字*` | *文字* |
| 删除线 | `~~文字~~` | ~~文字~~ |
| 有序列表 | `1. 项目` | 1. 项目 |
| 无序列表 | `- 项目` | - 项目 |

> **注意**：以上未提及的 Markdown 语法（如链接、图片、代码块、表格等）均不支持。

## group_by 详细说明

### mode 枚举

| mode | 含义 | 适用场景 |
|------|------|----------|
| `integrated` | 聚合分组（默认） | 绝大部分场景，按字段值分组统计 |
| `enumerated` | 多值拆分统计 | 多选、人员等多值字段，将每个选项/人员拆开独立统计 |

> 多选、人员等多值字段默认用 `enumerated`；其他字段默认用 `integrated`。

### sort 排序

| sort.type | 含义 | 典型场景 |
|-----------|------|----------|
| `group` | 按横轴值排序 | 按月份升序、按品类名字母序 |
| `value` | 按纵轴值排序 | 按销售额从大到小 |
| `view` | 按数据源记录顺序 | 保持原表行序（不常用） |

`sort.order`：`asc`（升序）/ `desc`（降序）

只要写 `sort` 对象，就需要明确排序方向。CLI 会把 `sort.type` 为 `group` 或 `view` 且缺少 `order` 的情况规范化为 `order:"asc"`；`sort.type:"value"` 必须显式写 `order:"asc"` 或 `order:"desc"`，因为指标值排序方向会改变业务含义。

如果表中行序就是业务顺序，首次创建 block 时就一次性设置 `sort:{"type":"view","order":"asc"}` 保留行序，避免创建后再二次更新排序条件。

示例 — 柱状图按销售额降序：

```json
{
  "table_name": "订单表",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "group_by": [{ "field_name": "类别", "mode": "integrated", "sort": {"type": "value", "order": "desc"} }]
}
```

## filter 格式规则

**基本结构：**

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "字段名", "operator": "操作符", "value": "值" }
    ]
  }
}
```

**多条件示例（and/or）：**

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "状态", "operator": "is", "value": "已完成" },
      { "field_name": "金额", "operator": "isGreater", "value": 1000 }
    ]
  }
}
```

**操作符：**

| 操作符 | 含义 | 是否需要 value |
|--------|------|---------------|
| `is` | 等于 | 是 |
| `isNot` | 不等于 | 是 |
| `contains` | 包含 | 是 |
| `doesNotContain` | 不包含 | 是 |
| `isEmpty` | 为空 | 否 |
| `isNotEmpty` | 不为空 | 否 |
| `isGreater` | 大于 | 是 |
| `isGreaterEqual` | 大于等于 | 是 |
| `isLess` | 小于 | 是 |
| `isLessEqual` | 小于等于 | 是 |

**各字段类型的 value 格式：**

| 字段类型 | value 类型 | 适用操作符 | 示例 |
|----------|-----------|-----------|------|
| `text` | string | is, isNot, contains, doesNotContain, isEmpty, isNotEmpty | `{"field_name":"姓名","operator":"contains","value":"张"}` |
| `number` | number | is, isNot, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty | `{"field_name":"金额","operator":"isGreater","value":0}` |
| `select` (`multiple=false`) | string（选项名） | is, isNot, isEmpty, isNotEmpty | `{"field_name":"状态","operator":"is","value":"已完成"}` |
| `select` (`multiple=true`) | string[]（选多个）/ string（选单个） | is, isNot, contains, doesNotContain, isEmpty, isNotEmpty | 多选传数组如 `["标签1","标签2"]`；单选传单个字符串 |
| `datetime` / `created_at` / `updated_at` | number（Unix 毫秒时间戳，13位） | is, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty | `{"field_name":"创建日期","operator":"isGreater","value":1704038400000}` |
| `checkbox` | boolean | is | `{"field_name":"已审核","operator":"is","value":true}` |
| `user` / `created_by` / `updated_by` | string 或 string[]（用户 ID，格式 `ou_xxx`）。不知道 `open_id` 时先用 `lark-cli contact +search-user --query "<姓名/邮箱/手机号>" --as user` 查 id。 | is, isNot, isEmpty, isNotEmpty | `{"field_name":"负责人","operator":"is","value":"ou_xxxxxxxxxxxxxxxx"}` |
| 所有类型（为空/不为空） | 不需要 value | isEmpty, isNotEmpty | `{"field_name":"备注","operator":"isEmpty"}` |

> `value` 类型为 `string | number | boolean | string[]`，需根据字段类型匹配正确格式

## 约束与本地校验

- 必填与互斥
  - 图表类型必填：`table_name`
  - text 类型必填：`text`
  - 互斥：`series` 与 `count_all` 二选一，且至少提供其一（仅图表类型）
  - text 类型**不支持**：`series`、`count_all`、`group_by`、`filter`
- 长度/结构
  - `group_by` 最多 2 个；每项 `field_name` 必填
  - `group_by[].sort.type` 取值 `group|value|view`；`order` 取值 `asc|desc`
- 规范化（CLI 自动处理；`--no-validate` 时不生效，`data_config` 原样透传给后端）
  - `series[].rollup` 自动转成大写（如 `sum` → `SUM`）
  - `group_by[].sort.type/order` 自动转成小写
  - `group_by[].sort.type` 为 `group` 或 `view` 且缺少 `order` 时，自动补 `order:"asc"`；`value` 排序不会自动补方向
- 本地校验（可通过 `--no-validate` 跳过）
  - `+dashboard-block-create` 默认对 `data_config` 做轻量校验；失败会聚合错误并给出修复建议
  - `+dashboard-block-update` 不做强类型校验，由后端验证具体字段
  - 仅需传入合法 JSON；CLI 不会擅自改写你的业务含义

## 可复制模板

**按意图选择模板：**
- 比较不同类别数值 → 柱状图 / 条形图
- 看趋势变化 → 折线图 / 面积图
- 看占比分布 → 饼图 / 环形图 / 词云
- 多指标对比 → 组合图
- 看两变量关系 → 散点图
- 看流程转化 → 漏斗图
- 看多维度评分 → 雷达图
- 显示单个指标 → 指标卡（统计数字或记录数）

最小柱状图：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "分组字段", "mode": "integrated" }]
}
```

最小饼图/环形图（按分类字段统计行数占比）：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

折线图（按月趋势）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "group_by": [{ "field_name": "月份", "mode": "integrated", "sort": {"type":"group","order":"asc"} }]
}
```

条形图（横向柱状图）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "分组字段", "mode": "integrated" }]
}
```

面积图（趋势填充）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "时间字段", "mode": "integrated", "sort": {"type":"group","order":"asc"} }]
}
```

组合图（柱+线等多指标对比）：

```json
{
  "table_name": "表名",
  "series": [
    { "field_name": "指标1", "rollup": "SUM" },
    { "field_name": "指标2", "rollup": "SUM" }
  ],
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

散点图（两变量相关性）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "Y轴字段（数值/指标）", "rollup": "SUM" }],
  "group_by": [{ "field_name": "X轴字段（分类/维度）", "mode": "integrated" }]
}
```

漏斗图（流程转化）：

先判断用户要看的数值语义：

- **当前数量**：统计每个当前状态/阶段下有多少记录，例如“各环节当前数量”“当前阶段分布”。源表有状态/阶段字段时，直接用 `count_all:true` + `group_by`。
- **累计数量**：统计到达该阶段及其后续阶段（后缀和）的累计数量，例如“流程转化”“从 A 到 B 各环节转化”。此口径假设流程单向、无跳阶/回退、记录不删除；不满足时须用状态变更历史，不能对当前快照累加。如果表中已有累计数量字段或阶段汇总表，直接用该字段画漏斗图；否则先计算累计数量，创建并写入 helper 汇总表后再画图。

当前数量：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "状态字段", "mode": "integrated" }]
}
```

累计数量：

```json
{
  "table_name": "流程汇总表名",
  "series": [{ "field_name": "累计数量", "rollup": "SUM" }],
  "group_by": [{ "field_name": "阶段字段", "mode": "integrated", "sort": {"type":"view","order":"asc"} }]
}
```

如果只有当前状态数据但用户要看流程转化，需要先按业务阶段顺序计算每个阶段的累计数量，再创建 helper 汇总表（如：阶段、累计数量），用 `+record-batch-create` 一次写入后，按“累计数量”模板创建漏斗图。helper 表行序就是业务顺序时，首次创建 block 时一次性设置好 `group_by.sort`。

> ⚠️ 注意:helper 汇总表仅用于源表无法直接聚合出目标形态的场景（如上面的累计数量漏斗图）。只要能在源表上直接用 `group_by` + `rollup`（含 `AVERAGE`）算出，就不需要新建 helper 表。

词云（文本频率）：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "文本字段", "mode": "integrated" }]
}
```

雷达图（多维度评分）：

```json
{
  "table_name": "表名",
  "series": [
    { "field_name": "维度1", "rollup": "SUM" },
    { "field_name": "维度2", "rollup": "SUM" },
    { "field_name": "维度3", "rollup": "SUM" }
  ],
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

指标卡（统计数字）：

```json
{
  "table_name": "数据表",
  "series": [{ "field_name": "数字", "rollup": "SUM" }]
}
```

指标卡（统计记录数）：

```json
{
  "table_name": "数据表",
  "count_all": true
}
```

文本组件（Markdown 富文本）：

```json
{
  "text": "# 🚀 一级标题\n这是一个 **加粗** *斜体* ~~删除线~~ 的示例。\n\n## 📌 二级标题\n1. 有序列表项 1\n2. 有序列表项 2\n\n### 📌 三级标题\n- 无序列表项 1\n- 无序列表项 2"
}
```

> **注意**：text 类型组件不需要 `table_name`、`series`、`group_by`、`filter` 等数据源相关字段。

## 常见错误与修复

- 同时存在 `series` 与 `count_all`
  - 现象：后端/本地校验报互斥错误
  - 修复：见「关键约束」章节的二选一规则
- 缺少 `table_name`
  - 现象：本地校验缺少必填字段
  - 修复：指定数据源表名（使用表名，非表 ID）
- `series[].rollup` 大小写/取值不合法
  - 现象：本地校验提示枚举不支持
  - 修复：改为 `SUM|MAX|MIN|AVERAGE` 中之一（不区分大小写，CLI 会统一为大写；计数请使用 `count_all:true`）
- `group_by` 超出 2 个或字段名为空
  - 修复：保留前 2 个，或补齐 `field_name`
- 排序枚举不合法
  - 修复：`group_by.sort.type` 仅能为 `group|value|view`；`order` 为 `asc|desc`
- filter 写法不规范
  - 修复：`conjunction` 取 `and|or`；`conditions[].operator` 必须在本页表格列举的范围内；除 `isEmpty/isNotEmpty` 外需提供 `value`

## 坑点

- **`count_all` 与 `series` 二选一** — 两者不能同时使用
- **filter `value` 类型因字段而异** — 文本/单选为 string，数字为 number，日期为毫秒时间戳，多选/人员可为 string[]，复选框为 boolean；`isEmpty`/`isNotEmpty` 不需要 value
- **`data_config` 结构随 `type` 变化** — 不同组件类型的字段不同，创建前务必确认类型对应的字段
- **表名用 name，不是 ID** — `table_name` 对应的是表名称（如「订单表」），不是 `table_id`


<a id="s-89342f7915177b77"></a>

## references/baseline/references/formula-field-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base Formula Writing Guide

## Mandatory Read Acknowledgement

When creating or updating a formula field with `lark-cli base +field-create/+field-update --json ...` and `type` is `formula`, you should read this guide first and only then add `--i-have-read-guide` to the command.

Do **not** proactively add `--i-have-read-guide` before reading this guide. Without it, the CLI will fail fast and direct you back to this guide.

When using `+field-update`, also pass `--yes`: field update is a high-risk `PUT` operation because changing a field definition can affect the whole column.

## Default strategy

**All cross-table references, aggregations, and computed fields should use Formula fields by default.** Do NOT use Lookup fields unless the user explicitly requests it. Formula is a strict superset of Lookup — anything Lookup can do, Formula can do with a single expression.

## Usage

When creating a formula field, the Agent should:

1. Get all table names: `lark-cli base +table-list --base-token <base>` — returns `items[].table_name`
2. Get table structure: `lark-cli base +table-get --base-token <base> --table-id <table>` — returns `fields[]`
3. If the formula references other tables, also get those tables' structures
4. Write the formula expression following this guide
5. Construct the Formula field JSON and submit it to create or update the field

**Key constraints**:

- The JSON must include `"type": "formula"` — this field is required
- Table names and field names in the formula must **exactly match** those returned by `+table-list` / `+table-get`
- The `expression` value is a string containing the formula expression; double quotes inside the expression must be properly escaped in JSON (e.g. `\"text\"`)

---

## Section 1: Core Concepts — Scalar vs List

This is the foundation of formula logic. You must determine this before writing any formula.

| Syntax                | Meaning                                      | Return type            | Example                                      |
| --------------------- | -------------------------------------------- | ---------------------- | -------------------------------------------- |
| `[Field]`             | Value of this field in the current row       | Scalar (single value)  | `[Name]` → `"Alice"`                         |
| `[TableName].[Field]` | All values of this field in the target table | List (multiple values) | `[Employees].[Name]` → `["Alice","Bob",...]` |
| `[TableName]`         | The target table (entire table)              | Table reference        | Used as data range for FILTER/COUNTIF etc.   |

**Rules**:

- Scalars can be used directly in operations: `[Price] * [Quantity]`
- Lists cannot be used as scalars — they must be processed first: use `SUM()` for sum, `ARRAYJOIN(",")` for joining, `FIRST()`/`LAST()`/`NTH()` for single value extraction
- Link field access `[LinkField].[TargetField]` returns a list (values of the target field for all linked records)
- **LISTCOMBINE flattening rule**: When a FILTER's result column is itself a multi-value field (`select` with `multiple=true`, `link`, etc.), it produces a 2D array and **must** be flattened with `.LISTCOMBINE()`; for single-value fields (`number`, `text`, etc.) it can be omitted, but adding it is never wrong:

  ```
  [Table].FILTER(CurrentValue.[Field] = [Value]).[Tags].LISTCOMBINE() ← required for multi-value columns
  [Table].FILTER(CurrentValue.[Field] = [Value]).[NumberCol].LISTCOMBINE() ← optional for single-value columns
  ```

---

## Section 2: Data Types and Type Conversion

### Field storage types

| Type | Description | Supported operations |
|------|-------------|----------------------|
| `number` | Stored as numeric value | Math operations, comparisons, auto-converts to string for concatenation |
| `text` | Stored as string | String operations; can participate in math if content is numeric, otherwise errors |
| `datetime` | Date object | Date functions, add/subtract with numbers; auto-converts to default format string when using `&` — use TEXT to format first for controlled output |
| `select` (`multiple=true`) | Data list | List functions, CONTAIN checks |
| `link` | Links to other table records | Chained access `[LinkField].[Field]`, result is a list |
| `checkbox` | TRUE/FALSE | Logical operations; auto-converts to number when compared with numbers |

### Implicit type conversion

| Scenario                     | Conversion rule                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Number + Float               | → Float                                                                                                     |
| Date + Number                | → Date (adds/subtracts days). Use `+`/`-` for whole days, use `DURATION()` for hour/minute/second precision |
| Date - Date                  | → Duration                                                                                                  |
| Boolean compared with Number | Boolean auto-converts to number (TRUE=1, FALSE=0)                                                           |
| `&` concatenation            | Both sides auto-convert to string                                                                           |

### Type consistency in comparisons

When using comparison operators (`>`, `>=`, `<`, `<=`, `=`, `!=`), **both sides should be the same type** to avoid semantic errors or unexpected results.

**Principle**: When types differ, explicitly convert one side rather than relying on implicit conversion:

- `number` vs `text` → use `VALUE()` to convert text to number
- `datetime` vs `text` → use `TEXT()` to convert date to text
- `datetime` vs `datetime` equality → dates include time components, so direct `=` comparison may fail due to different hours/minutes/seconds. For day-level equality, convert to text first: `TEXT([DateA], "YYYY/MM/DD") = TEXT([DateB], "YYYY/MM/DD")`
- `select` and `user` fields can be compared with both same-type values and text
- `text` fields in numeric aggregation (SUM/AVERAGE/MIN/MAX etc.) → convert to number with `VALUE()` first. For FILTER results, use `.MAP(VALUE(CurrentValue)).SUM()`

---

## Section 3: CurrentValue

**CurrentValue is the iteration variable in FILTER/MAP/COUNTIF/SUMIF functions, representing the "current item" being processed in the data range.**

### CurrentValue meaning in different contexts

| Data range type              | CurrentValue represents | Access pattern              | Example                                                   |
| ---------------------------- | ----------------------- | --------------------------- | --------------------------------------------------------- |
| Entire table `[TableName]`   | A row in the table      | `CurrentValue.[FieldName]`  | `[Orders].FILTER(CurrentValue.[Amount] > 100).[Customer]` |
| Column `[TableName].[Field]` | A single field value    | Use `CurrentValue` directly | `[Orders].[Amount].FILTER(CurrentValue > 100)`            |
| `select` (`multiple=true`) field `[Tags]` | One option | Use `CurrentValue` directly | `[Tags].FILTER(CurrentValue = "Important")` |
| LIST-generated list          | One element             | Use `CurrentValue` directly | `LIST(1,2,3).MAP(CurrentValue * 2)`                       |

### Key rules

1. **When data range is a table**, use `CurrentValue.[FieldName]` to access row fields
2. **When data range is a column/list**, use `CurrentValue` directly for the element value — **cannot** use `CurrentValue.[FieldName]`
3. CurrentValue can **only** appear inside the condition/mapping parameters of FILTER/MAP/COUNTIF/SUMIF functions
4. To reference the current table's field value in a condition, write `[FieldName]` directly — it refers to the formula row's value, not a property of CurrentValue

### Anti-patterns

| Wrong                                          | Reason                                                                            | Correct                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `[Table].[Col].FILTER(CurrentValue.[Col] > 0)` | Data range is a column; CurrentValue is a scalar, cannot use `.` to access fields | `[Table].[Col].FILTER(CurrentValue > 0)`               |
| `[Table].FILTER(CurrentValue > 100)`           | Data range is a table; CurrentValue is a row, cannot compare directly             | `[Table].FILTER(CurrentValue.[Amount] > 100).[Amount]` |
| `CurrentValue + 1` (at top level)              | CurrentValue can only be used inside iteration functions                          | Use inside MAP/FILTER etc.                             |

---

## Section 4: Operators

Base formulas **only allow** the following operators. `like`, `in`, `<>`, `**`, `^` etc. are prohibited.

| Category      | Operators                  | Description                                                                |
| ------------- | -------------------------- | -------------------------------------------------------------------------- |
| Arithmetic    | `+` `-` `*` `/` `%`        | Add, subtract, multiply, divide, modulo (`%` is equivalent to `MOD()`)     |
| Comparison    | `>` `>=` `<` `<=` `=` `!=` | Greater than, greater or equal, less than, less or equal, equal, not equal |
| Logical       | `&&` `\|\|`                | AND, OR                                                                    |
| Concatenation | `&`                        | Text concatenation; non-text values auto-convert to string                 |

**Important**:

- Equality uses `=` (single equals), not `==`
- Not-equal uses `!=`, not `<>`
- String concatenation uses `&`, not `+`
- Both `&&`/`||` and AND()/OR() functions are supported

---

## Section 5: Link Fields and Cross-Table References

### Link field description

When a field type is described as `FieldName: Link [target table: X, foreign key: Y]`, it links to target table X using field Y as the join key.

### Chained cross-table access

```
[LinkField].[TargetField]
```

Retrieves the target field values for all linked records as a list. Supports continued chaining: `[LinkA].[LinkB].[Field]`.

### Equivalent expanded form

- Multi-value link: `[TargetTableX].FILTER([LinkField].CONTAIN(CurrentValue.[Y])).[TargetField].LISTCOMBINE()`
- Single-value link: `[TargetTableX].FILTER(CurrentValue.[Y] = [LinkField]).[TargetField].LISTCOMBINE()`

(`.LISTCOMBINE()` is required when `[TargetField]` is a multi-value field; optional for single-value fields)

### Notes

- Link fields typically return **lists** (possibly empty)
- To output a single value, use aggregation (SUM/MAX), joining (ARRAYJOIN), or extraction (FIRST/LAST/NTH)
- Do not nest FILTER inside FILTER for cross-table queries — prefer link field chained access

---

## Section 6: Function Call Conventions

### Two calling styles

| Style      | Format             | Description                         |
| ---------- | ------------------ | ----------------------------------- |
| Functional | `FUNC(arg1, arg2)` | Works for all functions             |
| Chained    | `arg1.FUNC(arg2)`  | Moves the first argument before `.` |

**Rules**:

- Zero-argument functions cannot be chained: `NOW()`, `TODAY()`, `PI()`, `TRUE()`, `FALSE()`
- SORTBY can **only** be chained: `[Table].SORTBY([Table].[SortCol]).[OutputCol]`. The sort column always uses the original table's column name (`[TableName].[Field]` format); the engine aligns rows internally, even when the data range is a FILTER result
- FILTER is recommended to be chained: `[Table].FILTER(condition).[OutputCol]`

### FILTER / SORTBY result column rules

- **When data range is a table** `[TableName]`, FILTER / SORTBY returns a table reference. The chain **must** end with `.[Field]` to specify the result column, otherwise the formula fails:

  ```
  Correct: [Sales].FILTER(CurrentValue.[Amount] > 100).[Customer]
  Correct: [Sales].FILTER(condition).SORTBY([Sales].[SortCol]).[Customer]  ← result column at end of chain
  Wrong: [Sales].FILTER(CurrentValue.[Amount] > 100) ← missing result column
  ```

- **When data range is a column** `[TableName].[Field]` or a list, FILTER returns the filtered list directly — **no** result column needed:

  ```
  Correct: [Sales].[Amount].FILTER(CurrentValue > 100)
  ```

After the result column, it's recommended to flatten with `.LISTCOMBINE()` first (especially when the result column is a multi-value field), then chain aggregation functions:

```
[Sales].FILTER(CurrentValue.[Amount] > 100).[Amount].LISTCOMBINE().SUM()
```

---

## Section 7: Hard Constraints

1. **Nesting prohibition**: FILTER / SUMIF / COUNTIF / MAP **must not be nested** inside each other's condition/mapping expressions. None of these functions can appear inside the condition or mapping parameter of another.
   - Prohibited: `[Table1].FILTER(CurrentValue.[Col] = [Table2].FILTER(...).[Col])` ← FILTER inside FILTER condition
   - Prohibited: `[Table].MAP([Table2].MAP(...))` ← MAP inside MAP mapping
   - **Allowed**: `[Table].FILTER(cond1).[Col].FILTER(cond2)` ← chained call; the first FILTER's output is the second's data range, not nesting

2. **Function whitelist**: Only use functions listed in Section 8. No unlisted functions.

3. **Exact name matching**: Table names and field names in formulas must **exactly match** those returned by `+table-get` — no renaming or adding spaces.

4. **Operator whitelist**: Only use operators listed in Section 4.

5. **Strings use double quotes**: Strings must be wrapped in double quotes `"`, single quotes are not supported.

6. **Do not use LOOKUP**: FILTER is a superset of LOOKUP. All LOOKUP formulas can be rewritten with FILTER. Use FILTER exclusively to reduce complexity.

---

## Section 8: Complete Function Reference

### 8.1 Logic functions

| Function      | Signature                                                          | Return type          | Description                                                                                  |
| ------------- | ------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------- |
| IF            | `IF(condition, true_val, [false_val])`                             | Matches branch type  | Returns true_val when TRUE, false_val otherwise; omitting false_val returns false (not null) |
| IFS           | `IFS(cond1, val1, cond2, val2, ...)`                               | Matches branch type  | Multi-condition branching; returns value for the first TRUE condition                        |
| SWITCH        | `SWITCH(expr, match1, result1, [match2, result2, ...], [default])` | Matches branch type  | Matches expression value and returns corresponding result                                    |
| IFERROR       | `IFERROR(expr, fallback)`                                          | Matches branch type  | Returns fallback when expression errors                                                      |
| IFBLANK       | `IFBLANK(expr, fallback)`                                          | Matches branch type  | Returns fallback when expression is blank (blank = NULL/empty string/empty list)             |
| AND           | `AND(cond1, cond2, ...)`                                           | Boolean              | TRUE when all conditions are TRUE                                                            |
| OR            | `OR(cond1, cond2, ...)`                                            | Boolean              | TRUE when any condition is TRUE                                                              |
| NOT           | `NOT(condition)`                                                   | Boolean              | Logical negation                                                                             |
| ISBLANK       | `ISBLANK(value)`                                                   | Boolean              | Tests if blank (NULL/empty string/empty list are blank; 0 and FALSE are not)                 |
| ISNULL        | `ISNULL(value)`                                                    | Boolean              | Tests if NULL (only NULL is true; empty string is not)                                       |
| ISERROR       | `ISERROR(expr)`                                                    | Boolean              | Tests if expression errors                                                                   |
| ISNUMBER      | `ISNUMBER(value)`                                                  | Boolean              | Tests if value is a number                                                                   |
| CONTAIN       | `CONTAIN(search_range, value, ...)`                                | Boolean              | Tests if a list or `select` (`multiple=true`) contains the value; **does NOT do text substring matching** |
| CONTAINSALL   | `CONTAINSALL(search_range, value, ...)`                            | Boolean              | Tests if a list or `select` (`multiple=true`) contains all specified values |
| CONTAINSONLY  | `CONTAINSONLY(search_range, value, ...)`                           | Boolean              | Tests if a list or `select` (`multiple=true`) contains only the specified values |
| TRUE          | `TRUE()`                                                           | Boolean              | Returns TRUE                                                                                 |
| FALSE         | `FALSE()`                                                          | Boolean              | Returns FALSE                                                                                |
| RECORD_ID     | `RECORD_ID()`                                                      | Text                 | Returns the current row's record ID                                                          |
| RANDOMBETWEEN | `RANDOMBETWEEN(min_int, max_int, [keep_updating])`                 | Number               | Random integer in the specified range                                                        |
| RANDOMITEM    | `RANDOMITEM(list, [keep_updating])`                                | Matches element type | Randomly picks one element from a list                                                       |

### 8.2 Numeric functions

| Function                                                          | Signature                                | Return type | Description                                                                                                                                                                                                                                                |
| --- | --- | --- | --- |
| SUM                                                               | `SUM(val1, val2, ...)`                   | Number      | Sum; accepts multiple values or a list                                                                                                                                                                                                                     |
| AVERAGE                                                           | `AVERAGE(val1, val2, ...)`               | Number      | Average                                                                                                                                                                                                                                                    |
| MAX                                                               | `MAX(val1, val2, ...)`                   | Number      | Maximum                                                                                                                                                                                                                                                    |
| MIN                                                               | `MIN(val1, val2, ...)`                   | Number      | Minimum                                                                                                                                                                                                                                                    |
| MEDIAN                                                            | `MEDIAN(val1, val2, ...)`                | Number      | Median                                                                                                                                                                                                                                                     |
| COUNTA                                                            | `COUNTA(val1, val2, ...)`                | Number      | Count of non-blank values                                                                                                                                                                                                                                  |
| COUNTIF                                                           | `COUNTIF(data_range, condition)`         | Number      | Count matching items. Data range can be a **table** (CurrentValue is a row, use `CurrentValue.[Field]`) or a **column** (CurrentValue is a scalar value)                                                                                                   |
| SUMIF                                                             | `SUMIF(data_range, condition)`           | Number      | Sum matching values. Data range **must be a numeric column** (e.g. `[Table].[NumField]`); CurrentValue is each value in that column (scalar), cannot use `CurrentValue.[Field]` to access other fields. For cross-field conditions, use FILTER+SUM instead |
| ROUND                                                             | `ROUND(number, digits)`                  | Number      | Round. digits: 1=one decimal, 0=integer, -1=tens place                                                                                                                                                                                                     |
| ROUNDUP                                                           | `ROUNDUP(number, digits)`                | Number      | Round away from zero. Same digits semantics as ROUND                                                                                                                                                                                                       |
| ROUNDDOWN                                                         | `ROUNDDOWN(number, digits)`              | Number      | Round toward zero. Same digits semantics as ROUND                                                                                                                                                                                                          |
| FLOOR                                                             | `FLOOR(number, [base])`                  | Number      | Round down to nearest multiple of base (default 1)                                                                                                                                                                                                         |
| CEILING                                                           | `CEILING(number, [base])`                | Number      | Round up to nearest multiple of base (default 1)                                                                                                                                                                                                           |
| ABS                                                               | `ABS(number)`                            | Number      | Absolute value                                                                                                                                                                                                                                             |
| INT                                                               | `INT(number)`                            | Integer     | Truncate to integer                                                                                                                                                                                                                                        |
| MOD                                                               | `MOD(dividend, divisor)`                 | Number      | Modulo                                                                                                                                                                                                                                                     |
| POWER                                                             | `POWER(base, exponent)`                  | Number      | Exponentiation                                                                                                                                                                                                                                             |
| QUOTIENT                                                          | `QUOTIENT(dividend, divisor)`            | Number      | Integer division                                                                                                                                                                                                                                           |
| VALUE                                                             | `VALUE(text)`                            | Number      | Convert text to number                                                                                                                                                                                                                                     |
| ISODD                                                             | `ISODD(number)`                          | Boolean     | Tests if number is odd                                                                                                                                                                                                                                     |
| RANK                                                              | `RANK(value, search_range, [ascending])` | Number      | Rank of value in range; default descending                                                                                                                                                                                                                 |
| SEQUENCE                                                          | `SEQUENCE(start, end, [step])`           | List        | Generate number sequence                                                                                                                                                                                                                                   |
| PI                                                                | `PI()`                                   | Number      | Pi constant                                                                                                                                                                                                                                                |
| SIN/COS/TAN/ASIN/ACOS/ATAN/ATAN2/SINH/COSH/TANH/ASINH/ACOSH/ATANH | `func(radians_or_value)`                 | Number      | Trigonometric and hyperbolic functions; arguments in radians                                                                                                                                                                                               |

### 8.3 Text functions

| Function        | Signature                                            | Return type | Description                                                                                              |
| --------------- | ---------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| CONCATENATE     | `CONCATENATE(text1, text2, ...)`                     | Text        | Concatenate multiple texts; supports lists as input                                                      |
| LEN             | `LEN(text)`                                          | Number      | Character count                                                                                          |
| LEFT            | `LEFT(text, [count])`                                | Text        | Extract from left; default 1                                                                             |
| RIGHT           | `RIGHT(text, [count])`                               | Text        | Extract from right; default 1                                                                            |
| MID             | `MID(text, start, count)`                            | Text        | Extract from middle                                                                                      |
| FIND            | `FIND(search_val, search_range, [start])`            | Number      | Find substring position (case-sensitive); returns -1 if not found                                        |
| REPLACE         | `REPLACE(text, start, count, new_text)`              | Text        | Replace by position                                                                                      |
| SUBSTITUTE      | `SUBSTITUTE(text, old_text, new_text, [occurrence])` | Text        | Replace by content; can specify which occurrence                                                         |
| UPPER           | `UPPER(text)`                                        | Text        | Convert to uppercase                                                                                     |
| LOWER           | `LOWER(text)`                                        | Text        | Convert to lowercase                                                                                     |
| TRIM            | `TRIM(text)`                                         | Text        | Remove leading/trailing spaces                                                                           |
| TEXT            | `TEXT(value, format)`                                | Text        | Format output. Date formats: `"YYYY-MM-DD"`, `"YYYY/MM/DD hh:mm:ss"`; number formats: `"00"`, `"000.00"` |
| CONTAINTEXT     | `CONTAINTEXT(text, search_text)`                     | Boolean     | Tests if text contains substring (text substring matching)                                               |
| SPLIT           | `SPLIT(text, delimiter)`                             | List        | Split text by delimiter                                                                                  |
| TODATE          | `TODATE(value)`                                      | Date        | Convert date string to date type                                                                         |
| CHAR            | `CHAR(number)`                                       | Text        | ASCII code to character                                                                                  |
| FORMAT          | `FORMAT(template, [val1, val2, ...])`                | Text        | Template string formatting; use `{1}`, `{2}` as placeholders                                             |
| HYPERLINK       | `HYPERLINK(url, [display_text])`                     | Hyperlink   | Create a hyperlink                                                                                       |
| ENCODEURL       | `ENCODEURL(text)`                                    | Text        | URL encode                                                                                               |
| REGEXMATCH      | `REGEXMATCH(text, regex)`                            | Boolean     | Regex match test                                                                                         |
| REGEXEXTRACT    | `REGEXEXTRACT(text, regex)`                          | List        | Extract first match's capture groups                                                                     |
| REGEXEXTRACTALL | `REGEXEXTRACTALL(text, regex)`                       | 2D List     | Extract all matches                                                                                      |
| REGEXREPLACE    | `REGEXREPLACE(text, regex, replacement)`             | Text        | Regex replace                                                                                            |

### 8.4 Date functions

| Function    | Signature                                       | Return type | Description                                                                                             |
| ----------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| NOW         | `NOW()`                                         | Date        | Current date and time                                                                                   |
| TODAY       | `TODAY()`                                       | Date        | Current date (midnight)                                                                                 |
| DATE        | `DATE(year, month, day)`                        | Date        | Construct a date                                                                                        |
| YEAR        | `YEAR(date)`                                    | Number      | Extract year                                                                                            |
| MONTH       | `MONTH(date)`                                   | Number      | Extract month                                                                                           |
| DAY         | `DAY(date)`                                     | Number      | Extract day                                                                                             |
| HOUR        | `HOUR(date)`                                    | Number      | Extract hour                                                                                            |
| MINUTE      | `MINUTE(date)`                                  | Number      | Extract minute                                                                                          |
| SECOND      | `SECOND(date)`                                  | Number      | Extract second                                                                                          |
| WEEKDAY     | `WEEKDAY(date, [type])`                         | Number      | Day of week                                                                                             |
| WEEKNUM     | `WEEKNUM(date, [type])`                         | Number      | Week number                                                                                             |
| DAYS        | `DAYS(end_date, start_date)`                    | Number      | Days between two dates (end - start), includes decimals. **Note parameter order: end date comes first** |
| DATEDIF     | `DATEDIF(start_date, end_date, [unit])`         | Number      | Whole days/months/years between dates. Unit: `"D"`(default)/`"M"`/`"Y"`. **Start must be before end**   |
| DURATION    | `DURATION(days, [hours], [minutes], [seconds])` | Duration    | Create a duration for date arithmetic                                                                   |
| EDATE       | `EDATE(date, months)`                           | Date        | Date N months later                                                                                     |
| EOMONTH     | `EOMONTH(date, [months])`                       | Date        | End of month N months later; months default 0                                                           |
| WORKDAY     | `WORKDAY(start_date, days, [holidays])`         | Date        | Date N workdays later (skips weekends and holidays)                                                     |
| NETWORKDAYS | `NETWORKDAYS(start_date, end_date, [holidays])` | Number      | Workdays between dates (inclusive)                                                                      |

### 8.5 List functions

| Function    | Signature                                                                    | Return type | Description                                                                                                                                                                                                      |
| --- | --- | --- | --- |
| LIST        | `LIST(val1, val2, ...)`                                                      | List        | Create a list                                                                                                                                                                                                    |
| FIRST       | `FIRST(list)`                                                                | Scalar      | First element                                                                                                                                                                                                    |
| LAST        | `LAST(list)`                                                                 | Scalar      | Last element                                                                                                                                                                                                     |
| NTH         | `NTH(list, index)`                                                           | Scalar      | Nth element (1-based)                                                                                                                                                                                            |
| FILTER      | `[Table].FILTER(condition).[ResultCol]` or `[Table].[Col].FILTER(condition)` | List        | Filter by condition. When data range is a table, result column is **required**; when it's a column/list, it's not needed. Use CurrentValue in conditions. Add `.LISTCOMBINE()` when result column is multi-value |
| MAP         | `data_range.MAP(mapping_expr)`                                               | List        | Apply mapping to each element. Use CurrentValue in mapping                                                                                                                                                       |
| SORT        | `SORT(list, [ascending])`                                                    | List        | Sort; default ascending (TRUE)                                                                                                                                                                                   |
| SORTBY      | `[Table].SORTBY([Table].[SortCol], [ascending]).[OutputCol]`                 | List        | Sort by column then extract output column. **Chain-only, must include output column**                                                                                                                            |
| UNIQUE      | `UNIQUE(list)`                                                               | List        | Deduplicate                                                                                                                                                                                                      |
| ARRAYJOIN   | `ARRAYJOIN(list, [delimiter])`                                               | Text        | Join list elements as text; default comma-separated                                                                                                                                                              |
| LISTCOMBINE | `LISTCOMBINE(val1, [val2, ...])` or `list.LISTCOMBINE()`                     | List        | Two uses: (1) merge values/lists into one list; (2) chained call to flatten 2D array (commonly used when FILTER result column is a multi-value field)                                                            |
| DISTANCE    | `DISTANCE(location1, location2)`                                             | Number      | Distance between two geographic locations (km)                                                                                                                                                                   |

---

## Section 9: Commonly Confused Functions

### CONTAIN vs CONTAINTEXT

|             | CONTAIN                                                        | CONTAINTEXT                                                |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Purpose     | Tests if a **list / `select` (`multiple=true`)** contains a value | Tests if **text** contains a substring                     |
| Example     | `[Tags].CONTAIN("Urgent")`                                     | `[Notes].CONTAINTEXT("completed")`                         |
| Wrong usage | `CONTAIN([Notes], "completed")` — cannot do substring matching | `CONTAINTEXT([Tags], "Urgent")` — Tags is a list, not text |

### ISBLANK vs ISNULL

|                   | ISBLANK | ISNULL |
| ----------------- | ------- | ------ |
| NULL              | TRUE    | TRUE   |
| `""` empty string | TRUE    | FALSE  |
| Empty list `[]`   | TRUE    | FALSE  |
| `0`               | FALSE   | FALSE  |
| `FALSE`           | FALSE   | FALSE  |

### DAYS vs DATEDIF

|                 | DAYS                                                         | DATEDIF                                   |
| --------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Parameter order | `DAYS(end, start)` — end first                               | `DATEDIF(start, end, unit)` — start first |
| Precision       | Includes decimals (hours/minutes/seconds as fractional days) | Integer only (whole days/months/years)    |
| Negative values | Returns negative when start is after end                     | **Errors** when start is after end        |

### SUM vs SUMIF

|           | SUM                                            | SUMIF                                                          |
| --------- | ---------------------------------------------- | -------------------------------------------------------------- |
| Purpose   | Sum all values                                 | Sum values **matching a condition**                            |
| Arguments | `SUM(val1, val2, ...)` or `SUM([Table].[Col])` | `SUMIF(data_range, condition)` with CurrentValue in condition  |
| Example   | `SUM([Orders].[Amount])` — sum all             | `SUMIF([Orders].[Amount], CurrentValue > 100)` — sum only >100 |

### FILTER+aggregation vs COUNTIF/SUMIF

|             | FILTER+aggregation                                    | COUNTIF/SUMIF                                                                  |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Nature      | Filter then aggregate (two steps)                     | One-step (syntactic sugar)                                                     |
| Equivalence | `[Table].FILTER(cond).[Col].LISTCOMBINE().SUM()`      | `SUMIF([Table].[Col], cond)` (only when condition involves only column values) |
| When to use | Conditions span multiple fields, or multi-step needed | Conditions only involve column values (e.g. `CurrentValue > 100`)              |

---

## Section 10: Decision Trees

### Cross-table queries: which approach?

```
Need data from another table?
├─ Current table has a link field to the target table?
│   ├─ Yes → Use chained access: [LinkField].[TargetField]
│   │         Need aggregation? → .SUM() / .ARRAYJOIN(",") / .FIRST()
│   └─ No → Need to match by field value?
│       ├─ Field matching or complex filtering → [TargetTable].FILTER(CurrentValue.[MatchField] = [Value]).[OutputCol]
│       └─ Only counting or summing → COUNTIF([TargetTable], condition) / FILTER+SUM
```

### Conditional logic: IF vs IFS vs SWITCH?

```
Need conditional logic?
├─ Single condition → IF(condition, true_val, false_val)
├─ Multiple mutually exclusive conditions (if-elseif-else) → IFS(cond1, val1, cond2, val2, ...)
├─ Matching a value against fixed options → SWITCH(expr, option1, result1, option2, result2, ..., default)
└─ Need error handling?
    ├─ Catch errors → IFERROR(expr, fallback)
    └─ Catch blanks → IFBLANK(expr, fallback)
```

### Aggregation: which function?

```
Need to aggregate data?
├─ Sum/average/max/min for entire column → SUM/AVERAGE/MAX/MIN([Table].[Col])
├─ Count non-blank → COUNTA([Table].[Col])
├─ Conditional count → COUNTIF([Table], CurrentValue.[Field] = [Value])
├─ Conditional sum (column-only condition) → SUMIF([Table].[Col], CurrentValue > threshold)
├─ Conditional sum (cross-field condition) → [Table].FILTER(CurrentValue.[Field]=value).[NumCol].LISTCOMBINE().SUM()
├─ Count unique → [Table].[Col].UNIQUE().COUNTA()
└─ Ranking → RANK([Value], [Table].[Col])
```

---

## Section 11: Common Formula Patterns

### Pattern 1: Cross-table conditional count

Count rows in target table matching a condition:

```
[TargetTable].COUNTIF(CurrentValue.[MatchField] = [CurrentTableField])
```

### Pattern 2: Cross-table conditional sum

Filter target table by current row's value, then sum:

```
[TargetTable].FILTER(CurrentValue.[MatchField] = [CurrentTableField]).[NumCol].LISTCOMBINE().SUM()
```

SUMIF works when data range is a column and conditions only involve column values:

```
SUMIF([TargetTable].[NumCol], CurrentValue > 100)
```

Note: COUNTIF can use a table as data range (only counting, no specific column needed), but SUMIF's data range **must be a numeric column** (needs values to sum), so `CurrentValue` is each value in that column (scalar) — cannot use `CurrentValue.[OtherField]` to access other fields. For cross-field conditions, use FILTER with a table as data range.

### Pattern 3: Cross-table lookup

```
[TargetTable].FILTER(CurrentValue.[MatchCol] = [CurrentTableField]).[ReturnCol]
```

### Pattern 4: Link field values + aggregation

```
SUM([LinkField].[NumField])
[LinkField].[TextField].UNIQUE().ARRAYJOIN(",")
```

### Pattern 5: Conditional text concatenation

```
IF([Condition], "prefix" & [Field] & "suffix", "default text")
```

### Pattern 6: Date difference

```
DATEDIF([StartDate], [EndDate], "D") & " days"
DAYS([EndDate], [StartDate])
```

### Pattern 7: List element mapping

```
[SelectField(which multiple=true)].MAP(CurrentValue & " tag")
SPLIT([TextField], ",").MAP(TRIM(CurrentValue))
```

### Pattern 8: Cross-table with sorting

```
[TargetTable].SORTBY([TargetTable].[SortCol], FALSE).[OutputCol]
[TargetTable].FILTER(CurrentValue.[Field] = [Value]).SORTBY([TargetTable].[SortCol]).[OutputCol]
```

---

## Section 12: Anti-Pattern Collection

### Mistake 1: Extra argument in MAP

```
Wrong:   [Table].[Col].MAP([Table2].[Col], CurrentValue + 1)
Correct: [Table].[Col].MAP(CurrentValue + 1)
```

Reason: MAP takes only two arguments (data range + mapping expression), no "lookup range".

### Mistake 2: Inverted FILTER syntax

```
Wrong:   condition.[Table].FILTER()
Correct: [Table].FILTER(condition).[ResultCol]    (result column required when data range is a table)
```

Reason: FILTER's data range comes first, condition is passed as the argument.

### Mistake 3: Using CurrentValue.[Field] on a column range

```
Wrong:   SUMIF([Sales].[Revenue], CurrentValue.[Salesperson] = [Name])
Correct: [Sales].FILTER(CurrentValue.[Salesperson] = [Name]).[Revenue].LISTCOMBINE().SUM()
```

Reason: `SUMIF([Sales].[Revenue], ...)` uses "Revenue" column as data range. CurrentValue is each revenue value (scalar), not a row — cannot use `.` to access other fields. Use FILTER with the table as data range for cross-field conditions.

### Mistake 4: Missing result column after FILTER

```
Wrong:   [Sales].FILTER(CurrentValue.[Amount] > 100)
Correct: [Sales].FILTER(CurrentValue.[Amount] > 100).[Customer]
```

Reason: FILTER on a table returns a table reference; must specify result column with `.[Field]` at the end.

### Mistake 5: Nested FILTER

```
Wrong:   [Table1].FILTER(CurrentValue.[ID] = [Table2].FILTER(CurrentValue.[Status]="Done").[ID])
Correct: [Table1].FILTER(CurrentValue.[ID] = [CurrentRowField]).[OutputCol]
```

Reason: FILTER/MAP/SUMIF/COUNTIF cannot be nested inside each other's conditions. Split into multiple steps or use link fields.

### Mistake 6: SORTBY without output column

```
Wrong:   [Table].SORTBY([Table].[Col])
Correct: [Table].SORTBY([Table].[Col]).[OutputCol]
```

Reason: SORTBY must have an output column at the end; otherwise the result cannot be represented as an array.

### Mistake 7: SORTBY sort column without table name

```
Wrong:   [Table].SORTBY([Col]).[OutputCol]
Correct: [Table].SORTBY([Table].[Col]).[OutputCol]
```

Reason: SORTBY's sort column must use `[TableName].[FieldName]` format.

### Mistake 8: Using CONTAIN for text substring matching

```
Wrong:   CONTAIN([Notes], "urgent")
Correct: CONTAINTEXT([Notes], "urgent")
```

Reason: CONTAIN checks if a list or `select` (`multiple=true`) contains a whole value, not substring matching. Use CONTAINTEXT for text substrings.

### Mistake 9: Date concatenation without formatting

```
Not recommended: "Deadline: " & [DateField] ← output format is uncontrolled
Recommended: "Deadline: " & TEXT([DateField], "YYYY-MM-DD")
```

Reason: Concatenating a date with `&` won't error, but uses the default format. Use TEXT to specify the format explicitly.

### Mistake 10: Reversed DAYS parameter order

```
Wrong:   DAYS([StartDate], [EndDate])  → returns negative
Correct: DAYS([EndDate], [StartDate])  → returns positive
```

Reason: DAYS parameter order is end date first, start date second.

### Mistake 11: Chaining zero-argument functions

```
Wrong:   TODAY.DAYS([Date])
Correct: TODAY().DAYS([Date])
```

Reason: NOW, TODAY, PI and other zero-argument functions must include parentheses.

---

## Section 13: Complete Examples

### Example 1: Employee sales summary

**Table structure** (from `+table-get`):

- Employees: EmployeeID (Text), Name (Text), Department (Text)
- Sales: ContractID (Number), SalespersonID (Text), Quantity (Number), Total (Number)

**Current table**: Employees

**Requirement**: For each employee, output "Sold XX orders" if they have sales records, otherwise "No sales records".

**Formula**:

```
IF(
  [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) >= 1,
  "Sold " & [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) & " orders",
  "No sales records"
)
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Sales Summary",
  "expression": "IF([Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) >= 1, \"Sold \" & [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) & \" orders\", \"No sales records\")"
}
```

**Explanation**: `[Sales].COUNTIF(...)` uses the entire Sales table as data range. CurrentValue represents each row in Sales, accessing `CurrentValue.[SalespersonID]` for that row's salesperson. `[EmployeeID]` refers to the current row in the Employees table (where the formula lives).

### Example 2: Chained cross-table access via link fields

**Table structure**:

- Orders: ID (`auto_number`), OrderItems (`link` [target: OrderItems, foreign key: ID])
- OrderItems: ID (`auto_number`), Product (`link` [target: Products, foreign key: ID])
- Products: ID (`auto_number`), ProductName (`text`)

**Current table**: Orders

**Requirement**: Deduplicate and comma-join all product names from linked order items.

**Formula**:

```
[OrderItems].[Product].[ProductName].UNIQUE().ARRAYJOIN(",")
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Product List",
  "expression": "[OrderItems].[Product].[ProductName].UNIQUE().ARRAYJOIN(\",\")"
}
```

**Explanation**: `[OrderItems]` gets linked order item records, `.[Product]` expands to each item's linked product, `.[ProductName]` gets all product names, `.UNIQUE()` deduplicates, `.ARRAYJOIN(",")` joins with commas.

### Example 3: Cross-table filter + sort

**Table structure**:

- Projects: ProjectName (Text), Status (Text), Owner (Text)
- Tasks: TaskName (Text), Project (Text), Priority (Number), DueDate (Date)

**Current table**: Projects

**Requirement**: Find the highest-priority (lowest number) task name for the current project.

**Formula**:

```
FIRST(
  [Tasks].FILTER(CurrentValue.[Project] = [ProjectName]).SORTBY([Tasks].[Priority], TRUE).[TaskName]
)
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Top Priority Task",
  "expression": "FIRST([Tasks].FILTER(CurrentValue.[Project] = [ProjectName]).SORTBY([Tasks].[Priority], TRUE).[TaskName])"
}
```

**Explanation**: `[Tasks].FILTER(CurrentValue.[Project] = [ProjectName])` filters tasks belonging to the current project. `.SORTBY([Tasks].[Priority], TRUE)` sorts by priority ascending. `.[TaskName]` extracts task names. `FIRST(...)` gets the first one (highest priority).

---

## Section 14: Translating User Requirements to Formulas

When the user describes their formula need in natural language, follow these rules to convert it into a precise expression:

1. **Numbers must use precise values**: "less than 80%" → field value less than `0.8`. "above 1000" → `>= 1000`.
2. **Interval boundaries**: "above/below/within" = closed (inclusive); "less than/more than/outside" = open (exclusive).
3. **Branching logic** must be organized as an ordered list with a fallback branch. Each branch has a condition and output.
   - Example: "return risk level for 1-3" → `IFS([Value] = 1, "low", [Value] = 2, "medium", [Value] = 3, "high")` with an `IFERROR` or trailing empty-string fallback.
4. **Multi-level branches must be flattened** to a single level. Nested if-else chains → flat IFS.
5. **Branch conditions must be mutually exclusive**. If the user's conditions overlap, rewrite to eliminate ambiguity.
6. **Reorder branches by logical priority** if the user's order is illogical (e.g., check specific conditions before catch-all).

---

## Section 15: Constraint Summary

- Request body must include `"type": "formula"` — this field is required
- Only use functions and operators listed in this document
- FILTER/SUMIF/COUNTIF/MAP must not be nested inside each other's conditions (chained calls are not nesting)
- Do not use LOOKUP — use FILTER exclusively
- Table and field names must exactly match `+table-get` output
- Strings must use double quotes `"`
- Format dates with TEXT before concatenating, to control output format
- SORTBY can only be chained and must include an output column
- Link fields return lists — aggregate or extract single values before output


<a id="s-dbf80ea67b6de62e"></a>

## references/baseline/references/lark-base-cell-value.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# base CellValue 规范（lark-base-cell-value）

> 适用命令：`lark-cli base +record-upsert`、`lark-cli base +record-batch-create`、`lark-cli base +record-batch-update`

本文件定义 **shortcut 写记录** 时 `CellValue` 的推荐格式，目标是让 AI 一次写对。不同命令的外层 JSON 形状不同，但每个 cell 都以本文为 source of truth。

## 1. 顶层规则（必须遵守）

- `--json` 必须是 JSON 对象。
- `+record-upsert`：顶层直接传字段映射：`{"字段名或字段ID": CellValue}`。
- `+record-batch-create`：`rows` 是 `CellValue[][]`，列顺序由 `fields` 决定。
- `+record-batch-update`：使用 `update_records`，其每个 value 都是 `Map<FieldNameOrID, CellValue>`。
- 一次 payload 里同一字段只用一种 key（字段名或字段 ID），不要重复。
- 写入前先 `+field-list` 获取字段 `type/style/multiple`，再构造值。
- 需要清空字段时优先传 `null`（字段允许清空时）。

## 2. 各类型 CellValue

### 2.1 text

text 字段的 `style.type` 影响单元格检查逻辑：
`type=plain` 传 Markdown 格式的字符串。
`type=url` 传一个带 title 的 Markdown 格式链接，或单独传一个链接。
`type=phone` 传合法电话号码。
`type=email` 传合法邮箱字符串。

```json
{
    "标题": "Hello, [lark-cli](https://github.com/larksuite/cli)",
    "官网": "[官网](https://example.com)",
    "联系电话": "1380000000000",
    "邮箱": "owner@example.com"
}
```

### 2.2 number

用 JSON number，不要用带单位或千分位的字符串。货币、百分比、进度、评分等数字类字段也按数字写入，展示格式由字段配置决定。

```json
{
    "工时": 12.5,
    "预算": 3000,
    "完成度": 0.65,
    "评分": 4
}
```

### 2.3 select（单选/多选）

单选用选项名字符串；多选用选项名数组。选项名建议与字段配置一致；写入未知选项时平台可能自动新增选项，因此不要把自然语言近义词当成已有选项传入。

```json
{
    "单选": "Todo",
    "多选": ["后端", "高优"]
}
```

### 2.4 datetime

优先用 `YYYY-MM-DD HH:mm:ss` 字符串，这是最稳妥的写法，也和常见 API 输出更容易对齐。不要写相对时间（如“明天上午”）。

```json
{
    "截止时间": "2026-03-24 10:00:00"
}
```

### 2.5 checkbox

用 JSON boolean：`true` 或 `false`，不要用 `"true"`、`"是"`、`1`。

```json
{
    "已完成": true
}
```

### 2.6 user / group_chat

用对象数组，元素至少包含 `id`。人员字段传用户 ID（如 `ou_xxx`），群字段传群 ID（如 `oc_xxx`）；单值/多值都统一使用数组。

> **人员字段：不要猜 ID。** 不知道 `open_id` 时，先用 `lark-contact` 查 id：`lark-cli contact +search-user --query "<姓名/邮箱/手机号>" --as user`。

> **群组字段：不要猜 ID。** 不知道 `chat_id` 时，先用 `lark-im` 搜群：`lark-cli im +chat-search --query "<群名关键词>" --as user`；取结果里的 `oc_xxx`。

```json
{
    "负责人": [
      { "id": "ou_xxx" },
      { "id": "ou_xxx2" }
    ],
    "协作群": [
      { "id": "oc_xxx" }
    ]
}
```

### 2.7 link

用对象数组，元素包含 `id`，值为目标记录的 `record_id`。不要传记录标题；先用 `+record-list` / `+record-search` 找到目标记录 ID。

```json
{
    "关联任务": [
      { "id": "<record_id>" }
    ]
}
```

### 2.8 location

写入对象必须使用 `{lng, lat}`，两者都是数字；`lng` 是经度，`lat` 是纬度。不需要手动传 `full_address`，平台会根据坐标解析地址。

```json
{
    "坐标": {
      "lng": 116.397428,
      "lat": 39.90923
    }
}
```

读取、筛选、转文本等场景使用 `full_address` 字符串；只有公式能访问坐标。如果用户只给地址文本，先获取或确认坐标后再写入；不要把仅有地址文本直接当作 location CellValue。

### 2.9 attachment（不作为普通 CellValue 写入）

- 追加附件：使用 `lark-cli base +record-upload-attachment --record-id <record_id> --field-id <field_id> --file <path>`；可重复 `--file` 一次追加多个附件，不能用普通记录操作接口写附件值。
- 删除附件：使用 `lark-cli base +record-remove-attachment --record-id <record_id> --field-id <field_id> --file-token <file_token> --yes`；可重复 `--file-token` 一次删除同一单元格里的多个附件。
- 下载附件：使用 `lark-cli base +record-download-attachment --record-id <record_id> --file-token <file_token> --output <dir>`；不传 `--file-token` 时下载整行所有附件，也可重复 `--file-token` 只下载指定附件。Base 附件必须用这个命令下载，用其他下载入口可能失败。

## 3. 只读字段（不要写）

以下字段在写记录时应视为只读：
- `auto_number`
- `lookup`
- `formula`
- `created_at` / `updated_at`
- `created_by` / `updated_by`

写入只读字段通常不会更新数据；返回里可能出现 `ignored_fields`，reason 会说明 `READONLY`。看到这种返回时，不要重试同一 payload，应移除只读字段，只写存储字段。

## 4. 完整示例

```json
{
    "标题": "Created from shortcut",
    "状态": "Todo",
    "标签": ["高优", "外部依赖"],
    "工时": 8,
    "截止时间": "2026-03-24 10:00:00",
    "已完成": false,
    "负责人": [{ "id": "ou_123" }],
    "关联任务": [{ "id": "rec_456" }],
    "坐标": { "lng": 116.397428, "lat": 39.90923 }
}
```


<a id="s-ef02569265f3b5e9"></a>

## references/baseline/references/lark-base-data-analysis-sop.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base data analysis SOP

Base 数据查询与分析任务的执行契约。覆盖记录读取、筛选、排序、Top/Bottom N、聚合统计、分组聚合、多表关联、临时分析和查询后写入前的目标定位。

本文只管查询选路和正确性边界；具体操作前先读真实结构和现状，复杂 JSON 再跳到 reference：

- `+data-query`: entry guide [lark-base-data-query-guide.md](lark-base-0.md#s-83f069c00afa7c28), full DSL SSOT [lark-base-data-query.md](lark-base-0.md#s-1e1af96f8912b234)
- 视图筛选: [lark-base-view-set-filter.md](lark-base-0.md#s-a147b2f981b2f942)
- 记录读取: `+record-list` / `+record-search` / `+record-get`，先确认字段 ID、字段名、分页和投影范围

## 0. Hard Rules

- 全局问题不能用默认 `+record-list --limit N` 片面地回答。
- `jq` / shell / 本地代码是在个人电脑或当前运行环境中处理已返回数据，只适合小范围结果；超过 200 行默认不推荐本地统计、排序或求极值，应改用 Base 云端查询服务的 filter/sort/aggregate。
- “最高、最低、最新、最早、Top、Bottom、总数、全部、异常、最大、最小、最多、最少、优先级最高”等全局语义，必须在 Base 云端查询服务中完成筛选、排序或聚合。
- 一次性原始记录查询优先用 `+record-list` / `+record-search` 的 filter/sort；聚合分析优先用 `+data-query`。
- `+record-search` 用于关键词检索字段的展示文本；金额、状态、日期、空值、关联等结构化条件继续用 `--filter-json` 表达。
- 不要依赖已有视图，除非用户明确指定该视图，或你已读取并验证其 filter/sort/projection 符合当前问题。
- 交付输出必须使用用户可读的真实字段值；内部 ID、`record_id`、关联记录 ID、open_id、编码字段只可作为连接键或定位键，不能替代最终输出，除非用户明确要求输出这些键值。
- 每次读取必须做最小投影，并包含后续解释、回查或写入需要的业务 key。

## 1. Intent -> Tool Path

| 用户意图 | 首选路径 | 关键规则 |
| --- | --- | --- |
| 看几条、预览、示例 | `+record-list --limit N --field-id ...` | 保持局部语义；不要推广为全局结论 |
| 已知 `record_id` | `+record-get` | 直接读取；不要 search/list 反查 |
| 明确关键词 | `+record-search --keyword ... --search-field ... --field-id ...` | 必须显式指定 `--search-field`；可叠加 `--filter-json` |
| 按条件找原始记录 | `+record-list --filter-json ...` | `filter-json` 与视图筛选结构一致，支持文本、数字、日期、选项、人员、群组、关联等值 |
| 排序 / TopN 原始记录 | `+record-list --filter-json ... --sort-json ... --limit N` | 最高/最新用 `desc:true`，最低/最早用 `desc:false`；数组顺序表达优先级；最多 10 个排序条件 |
| 聚合 / 分组 / 分组排序 | `+data-query` | 使用 filters/dimensions/measures/sort/limit |
| 聚合后输出逐条记录 | `+data-query` 得到业务 key 或候选字段组合 -> `+record-list --filter-json` / `+record-get` 回查 | `+data-query` 维度行按字段组合去重且不返回 `record_id` |
| 多表 / 多跳关联 | 以候选数最小的事实表为驱动表，沿业务 key 或 link `record_id` 逐跳回查 | 读出 link 单元格里的关联 `record_id` 后，到被关联表批量 `+record-get` 展示字段 |
| 查询后写入 / 视图化 | 先用本 SOP 得到可复核的目标记录 id 集合 | 再进入记录写入或视图配置；高价值可复用查询可沉淀为持久视图 |

## 2. Execution Patterns

### 2.1 结构化原始记录与 TopN

使用 `+record-list` 的 filter/sort 路径：

1. `+field-list` 确认筛选字段、排序字段、展示字段、业务 key。
2. 筛选只用 `--filter-json` 或 `--filter-json @file`。
3. 排序用 `--sort-json`。
4. `--field-id` 做最小投影，`--limit` 控制返回数量。

Example: string/number 条件 + TopN：

```text
lark-cli base +record-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --filter-json '{"logic":"and","conditions":[["Title","==","Launch plan"],["Score",">=",80]]}' \
  --sort-json '[{"field":"Updated","desc":true}]' \
  --field-id Name \
  --field-id Title \
  --field-id Score \
  --limit 20
```

Example: 复杂筛选从文件读取：

```text
lark-cli base +record-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --filter-json @filter.json \
  --sort-json '[{"field":"Priority","desc":true}]' \
  --field-id Name \
  --field-id Tags \
  --limit 50
```

`filter-json` 与视图筛选结构一致。下面只列常用 fewshot；字段类型、operator、value 形状拿不准，或需要人员、群组、关联、空值、地理位置、formula / lookup 等完整筛选时，先读 [lark-base-view-set-filter.md](lark-base-0.md#s-a147b2f981b2f942)，再把同样的 filter JSON 传给 `--filter-json`。

文本 `==`：字段值等于目标文本。
```json
{"logic":"and","conditions":[["Title","==","Launch plan"]]}
```

文本包含 / like：文本字段包含目标片段；operator 写 `intersects`。
```json
{"logic":"and","conditions":[["Title","intersects","urgent"]]}
```

数字 `==`：字段值等于目标数字。
```json
{"logic":"and","conditions":[["Score","==",95]]}
```

日期 `==`：字段值等于目标日期；datetime / created_at / updated_at 用 `ExactDate(...)`。
```json
{"logic":"and","conditions":[["Due Date","==","ExactDate(2026-06-02)"]]}
```

选项 `==`：字段值匹配单个选项；选项值使用选项名数组，单个选项也写数组。
```json
{"logic":"and","conditions":[["Priority","==",["P0"]]]}
```

选项 `intersects`：字段值与给定选项集合有交集，常用于多选或“命中任一选项”。
```json
{"logic":"and","conditions":[["Tags","intersects",["P0","Blocked"]]]}
```

`--sort-json` 传排序数组，数组顺序就是优先级，`desc:true` 为降序，`desc:false` 为升序，最多 10 个排序条件。

### 2.2 关键词检索后叠加结构化条件

使用 `+record-search` 做关键词命中，结构化条件仍用 `--filter-json` 下推：

```text
lark-cli base +record-search \
  --base-token <base_token> \
  --table-id <table_id> \
  --keyword Alice \
  --search-field Name \
  --filter-json '{"logic":"and","conditions":[["Status","!=","Done"]]}' \
  --sort-json '[{"field":"Updated","desc":true}]' \
  --field-id Name \
  --field-id Status \
  --limit 20
```

不要把 `+record-search` 当成金额、状态、日期、空值、关联字段的结构化筛选入口；这些条件继续写成 `--filter-json`。

### 2.3 聚合分析与 TopN

使用 `+data-query`：

- 让 Base 云端查询服务完成 filters、dimensions、measures、sort、pagination.limit。
- `pagination.limit` 是 Base 云端查询服务中的结果限制，不是本地分页扫描。
- 常用聚合 fewshot 先读 [lark-base-data-query-guide.md](lark-base-0.md#s-83f069c00afa7c28)；字段类型、日期 value、DSL shape 以 [lark-base-data-query.md](lark-base-0.md#s-1e1af96f8912b234) 为准。
- `+data-query` 可返回聚合结果或维度字段行；维度字段行按字段组合去重且不返回 `record_id`，不能当逐条原始记录结果使用。
- 需要输出逐条记录、记录定位或完整行级字段时，先用 `+data-query` 得到业务 key、分组值或候选字段组合，再用 `+record-list --filter-json` / `+record-get` 回查。

Example: 分组计数：

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableId":"<table_id>"}},"dimensions":[{"field_name":"Status","alias":"status"}],"measures":[{"field_name":"Status","aggregation":"count","alias":"count"}],"shaper":{"format":"flat"}}'
```

Example: 过滤后汇总并取 TopN：

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableId":"<table_id>"}},"dimensions":[{"field_name":"Owner","alias":"owner"}],"measures":[{"field_name":"Amount","aggregation":"sum","alias":"total_amount"}],"filters":{"type":1,"conjunction":"and","conditions":[{"field_name":"Status","operator":"is","value":["Done"]}]},"sort":[{"field_name":"total_amount","order":"desc"}],"pagination":{"limit":10},"shaper":{"format":"flat"}}'
```

### 2.4 视图化与复用

一次性查询先用 `+record-list` / `+record-search` 的 filter/sort 验证。需要用户长期打开、共享或复用时，再把同一套 filter/sort 沉淀为视图。

Example: 将已验证的筛选排序写入视图：

```text
lark-cli base +view-set-filter \
  --base-token <base_token> \
  --table-id <table_id> \
  --view-id <view_id> \
  --json @filter.json

lark-cli base +view-set-sort \
  --base-token <base_token> \
  --table-id <table_id> \
  --view-id <view_id> \
  --json '{"sort_config":[{"field":"Priority","desc":true}]}'
```

手动配置和视图配置的优先级：

1. `--filter-json` 覆盖 `--view-id` 保存的 view filter JSON。
2. `--sort-json` 覆盖 `--view-id` 保存的 view sort config。
3. 没有手动 filter/sort 时，`--view-id` 使用视图自身保存的 filter/sort。

### 2.5 关系查询与回查

- link 单元格通常是关联表 `record_id` 数组，不是用户可读内容，只是连接键。
- 先用 `+field-list` 确认 link 字段的 `link_table`、业务唯一键和展示字段。
- 从驱动表拿到候选记录后，用关联 `record_id` 到关联表 `+record-get` 批量读取记录内容。
- 多跳关系逐跳建立 `record_id/key -> 用户可读字段` 映射；最终用户可读的信息。

禁止：

- 把 link `record_id` 当最终输出。
- 用 `+record-search` 搜 link `record_id`。
- 基于 ID、自增编号、link 值做语义猜测；禁止依赖字段先验、样本记忆补全交付输出。

## 3. Range & Pagination Contract

- `+record-list` 默认页、固定 `--limit`、本地 `jq`、shell 管道、手工浏览输出，都只覆盖已读取范围；超过 200 行不要把本地处理当作推荐路径。
- `has_more=true`、存在下一页 offset/page token、或返回行数等于 page size，都表示可能还有未读取数据。
- 对全局问题，只有 Base 云端查询服务已经通过 filter/sort/aggregate 收敛目标范围，或 `+data-query` 已在云端完成聚合、排序和限制时，才可以用有限返回形成结论。
- 必须全量导出时，按 `+record-list` 分页语义串行翻页；不要并发调用 `+record-list`。

## 4. Final Answer Check

形成交付输出前必须能确认：

- 问题范围是局部样例、单点定位、全局原始记录、聚合分析、多表关联，还是查询后写入。
- 筛选、排序、聚合是否发生在 Base 云端查询服务中，而不是本地 `jq` / shell 中。
- 如果使用 `jq` / shell，本地输入是否是 200 行以内的小范围结果；超过 200 行是否已改用 Base 云端查询服务查询。
- 如果使用 `+record-list` / `+record-search`，是否处理了 `has_more`，且投影包含业务 key 和解释字段。
- 如果涉及关系查询，是否按 `record_id` 或业务 key 精确回查，交付输出是否来自关联表真实字段。
- 交付输出能追溯到表、字段、筛选条件、排序/聚合条件和连接键。

任一项无法确认时，继续查询或明确说明只能得到局部结论。


<a id="s-83f069c00afa7c28"></a>

## references/baseline/references/lark-base-data-query-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base data-query guide

This guide is the entry point for `+data-query`. Use it for common aggregation fewshots and command selection. For the complete DSL fields, operators, limits, and response details, use [lark-base-data-query.md](lark-base-0.md#s-1e1af96f8912b234) as the DSL SSOT.

Before using `+data-query`, also follow [lark-base-data-analysis-sop.md](lark-base-0.md#s-ef02569265f3b5e9) to confirm that the task really needs aggregation instead of record listing or a temporary view.

## When to use

Use `+data-query` when the user asks for server-side:

- group by / aggregation
- sum, average, min, max, count, distinct count
- filtered aggregation
- sorted Top N or Bottom N
- global statistical conclusions

`+data-query` can return dimension field rows, but those rows are grouped by dimension values and do not include `record_id`. Use `+record-list`, `+record-search`, or `+record-get` for row-level output, record identity, or full raw record details.

## Common Fewshots

Count records by a category field:

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableId":"<table_id>"}},"dimensions":[{"field_name":"Status","alias":"status"}],"measures":[{"field_name":"Status","aggregation":"count","alias":"count"}],"shaper":{"format":"flat"}}'
```

Sum a number field by category and return Top 10:

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableId":"<table_id>"}},"dimensions":[{"field_name":"Region","alias":"region"}],"measures":[{"field_name":"Amount","aggregation":"sum","alias":"total_amount"}],"sort":[{"field_name":"total_amount","order":"desc"}],"pagination":{"limit":10},"shaper":{"format":"flat"}}'
```

Aggregate only records matching a filter:

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableId":"<table_id>"}},"dimensions":[{"field_name":"Owner","alias":"owner"}],"measures":[{"field_name":"Amount","aggregation":"sum","alias":"total_amount"}],"filters":{"type":1,"conjunction":"and","conditions":[{"field_name":"Status","operator":"is","value":["Done"]}]},"shaper":{"format":"flat"}}'
```

Use `tableName` when the table ID is unavailable but the table name is known:

```text
lark-cli base +data-query \
  --base-token <base_token> \
  --dsl '{"datasource":{"type":"table","table":{"tableName":"Orders"}},"measures":[{"field_name":"Amount","aggregation":"sum","alias":"total_amount"}],"shaper":{"format":"flat"}}'
```

## Routing to the DSL SSOT

Read [lark-base-data-query.md](lark-base-0.md#s-1e1af96f8912b234) when you need:

- the full DSL field reference
- supported aggregations and field types
- filter operator details
- pagination and result limits
- response shape and error recovery


<a id="s-c9357194c4e173e0"></a>

## references/baseline/references/lark-base-field-json.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base field JSON SSOT

> 适用命令：`lark-cli base +field-create`、`lark-cli base +field-update`

本文档定义 `+field-create` / `+field-update` 写字段时 `--json` 的推荐格式，是字段类型与字段 JSON 结构的 source of truth。目标不是复刻完整 schema，而是让 agent 稳定产出正确 payload。

## 1. 顶层规则（必须遵守）

- `--json` 必须是 JSON 对象。
- 顶层统一使用：`type` + `name` + 类型特有字段。
- 所有字段类型都支持可选 `description`；支持纯文本，也支持 Markdown 链接。
- 字段默认值使用 `default_value`，直接传对应 CellValue；支持范围只有 `text`、`number`、静态 `select`、`datetime`、`user`。清空默认值传 `null`；省略表示创建时不设置、更新时不修改。
- 不要使用旧结构：`field_name`、`property`、`ui_type`、数字枚举 `type`。
- `+field-update` 使用同样的字段 JSON 结构，但语义是 `PUT`；这是高风险写入操作，建议先 `+field-get` 再按目标状态全量提交，并带 `--yes`。
- `type=formula` 或 `type=lookup` 创建/更新前，必须先读对应 guide。

推荐示例：

```json
{
  "type": "text",
  "name": "需求背景",
  "description": "记录需求背景与已知约束"
}
```

## 2. 字段速查

| 类型 | 最小必填字段 | 常见补充字段 |
|------|--------------|-------------|
| `text` | `type` `name` | `style.type` `default_value` |
| `number` | `type` `name` | `style` `default_value` |
| `select` | `type` `name` | `multiple` + `options` + 静态 `default_value`，或 `multiple` + `dynamic_options_source` |
| `datetime` | `type` `name` | `style.format` `default_value` |
| `created_at` / `updated_at` | `type` `name` | `style.format` |
| `user` / `group_chat` | `type` `name` | `multiple`；仅 `user` 支持 `default_value` |
| `created_by` / `updated_by` | `type` `name` | 无 |
| `link` | `type` `name` `link_table` | `bidirectional` `bidirectional_link_field_name` |
| `formula` | `type` `name` `expression` | 无 |
| `lookup` | `type` `name` `from` `select` `where` | `aggregate` |
| `auto_number` | `type` `name` | `style.rules` |
| `attachment` / `location` / `checkbox` | `type` `name` | 无 |

所有类型都可额外传 `description`；上表的“常见补充字段”只列类型特有配置。

## 3. 各类型写法

### 3.1 text

文本字段；电话、超链接、邮箱、条码也都属于 `text`，通过 `style.type` 区分。
支持 `default_value`：静态 Markdown 文本字符串；`phone` style 必须是合法电话号码；`url` style 传一个 Markdown 链接或裸 URL；`email` style 必须是合法邮箱字符串，不要传 Markdown 链接或 `mailto:`。

最小写法（默认 `style.type` 为 `plain`）：

```json
{
  "type": "text",
  "name": "标题",
  "default_value": "默认标题"
}
```

常用写法：

默认值可以是 Markdown 文本
```json
{
  "type": "text",
  "name": "标题",
  "description": "主标题字段",
  "default_value": "未命名"
}
```

`style.type=phone` 时默认值是合法电话号码字符串。
```json
{
  "type": "text",
  "name": "联系电话",
  "style": { "type": "phone" },
  "default_value": "+8613800000000"
}
```

```json
{
  "type": "text",
  "name": "官网",
  "style": { "type": "url" },
  "default_value": "[官网](https://example.com)"
}
```

```json
{
  "type": "text",
  "name": "邮箱",
  "style": { "type": "email" },
  "default_value": "owner@example.com"
}
```

常用 `style.type`：`plain`（默认）、`phone`、`url`、`email`、`barcode`。

### 3.2 number

数字字段；货币、进度、评分都属于 `number`，通过 `style.type` 区分。
支持 `default_value`：静态 JSON number；所有 number style 都按这个规则写。

最小写法（默认 `style.type` 为 `plain`）：

```json
{
  "type": "number",
  "name": "工时",
  "default_value": 8
}
```

`style` 是按 `type` 区分的对象；不同 `style.type` 的内部字段不一样，不要混传。

#### `plain`

支持字段：`precision`、`percentage`、`thousands_separator`

默认值 / 约束：
- `precision` 取值 `0..4`，默认 `2`
- `percentage` 默认 `false`
- `thousands_separator` 默认 `false`

```json
{
  "type": "number",
  "name": "工时",
  "style": {
    "type": "plain",
    "precision": 2,
    "percentage": false,
    "thousands_separator": true
  },
  "default_value": 8
}
```

#### `currency`

支持字段：`precision`、`currency_code`

默认值 / 约束：
- `precision` 取值 `0..4`，默认 `2`
- `currency_code` 必填，如 `CNY`、`USD`、`EUR`

```json
{
  "type": "number",
  "name": "预算",
  "style": { "type": "currency", "precision": 2, "currency_code": "CNY" }
}
```

#### `progress`

支持字段：`percentage`、`color`

默认值 / 约束：
- `percentage` 默认 `true`
- `color` 必填
- `color` 可用：`Blue`、`Purple`、`DarkGreen`、`Green`、`Cyan`、`Orange`、`Red`、`Gray`、`WhiteToBlueGradient`、`WhiteToPurpleGradient`、`WhiteToOrangeGradient`、`GreenToRedGradient`、`RedToGreenGradient`、`BlueToPinkGradient`、`PinkToBlueGradient`、`SpectralGradient`

```json
{
  "type": "number",
  "name": "完成度",
  "style": { "type": "progress", "percentage": true, "color": "Blue" },
  "default_value": 0.65
}
```

#### `rating`

支持字段：`icon`、`min`、`max`

默认值 / 约束：
- `icon` 默认 `star`
- `icon` 可用：`star`、`heart`、`thumbsup`、`fire`、`smile`、`lightning`、`flower`、`number`
- `min` 取值 `0..1`，默认 `1`
- `max` 取值 `1..10`，默认 `5`

```json
{
  "type": "number",
  "name": "评分",
  "style": { "type": "rating", "icon": "star", "min": 1, "max": 5 }
}
```

### 3.3 select

单选和多选都使用 `select`；用 `multiple` 区分。`multiple` 默认 `false`。静态选项用 `options`，动态选项用 `dynamic_options_source`；两者不要同时传。

#### 静态选项

支持字段：`multiple`、`options`
支持 `default_value`：静态选项名数组；即使 `multiple=false` 也写数组，如 `["Todo"]`。

默认值 / 约束：
- `multiple` 默认 `false`
- `options` 最多 `10000` 项
- `options[]` 结构是 `{name, hue?, lightness?}`
- `options[].name` 必填
- `options[].hue` 可用：`Red`、`Orange`、`Yellow`、`Lime`、`Green`、`Turquoise`、`Wathet`、`Blue`、`Carmine`、`Purple`、`Gray` 缺省值为 `Blue`
- `options[].lightness` 可用：`Lighter`、`Light`、`Standard`、`Dark`、`Darker` 缺省值为 `Lighter`
- 选项里没有 `id`，只有 `name`。
- 支持 `default_value` 配置：填选项名数组。

```json
{
  "type": "select",
  "name": "状态",
  "multiple": false,
  "default_value": ["Todo"],
  "options": [
    { "name": "Todo", "hue": "Blue", "lightness": "Lighter" },
    { "name": "Done", "hue": "Green", "lightness": "Light" }
  ]
}
```

#### 动态选项

支持字段：`multiple`、`dynamic_options_source`
动态选项不支持 `default_value`。

默认值 / 约束：
- `multiple` 默认 `false`
- `dynamic_options_source` 结构是 `{table_id, field_id}`
- `dynamic_options_source.table_id` 填来源表 id 或表名
- `dynamic_options_source.field_id` 填来源字段 id 或字段名
- `dynamic_options_source` 仅创建支持；更新已有字段时不要传
- 引用选项条件 / 级联筛选条件：这个功能在 Base 前端支持，属于 UI-only 属性，OpenAPI 里不支持，CLI 不能读取、创建或更新；不要根据接口返回缺失判断未配置
- 动态选项不支持配置 `default_value`。

```json
{
  "type": "select",
  "name": "动态状态",
  "multiple": false,
  "dynamic_options_source": {
    "table_id": "选项表",
    "field_id": "候选状态"
  }
}
```

### 3.4 datetime

手动填写的日期/时间字段。系统时间用 `created_at` / `updated_at`。
支持 `default_value`：静态时间字符串，或 `{ "$slot": "record_created_time" }`。`datetime + record_created_time` 是自动填充可编辑单元格；`created_at` 是只读创建时间元信息。

最小写法：

```json
{
  "type": "datetime",
  "name": "截止时间",
  "default_value": "2026-03-24 10:00:00"
}
```

支持字段：`style.format`

默认值 / 约束：
- `style.format` 默认 `yyyy/MM/dd` 可用格式：`yyyy/MM/dd`、`yyyy/MM/dd HH:mm`、`yyyy/MM/dd HH:mm Z`、`yyyy-MM-dd`、`yyyy-MM-dd HH:mm`、`yyyy-MM-dd HH:mm Z`、`MM-dd`、`MM/dd/yyyy`、`dd/MM/yyyy`
- `style.format` 只控制前端显示格式；当前可配置格式最多显示到分钟，底层时间值仍可保留秒级精度。

常用写法：

```json
{
  "type": "datetime",
  "name": "截止时间",
  "style": { "format": "yyyy-MM-dd HH:mm" },
  "default_value": { "$slot": "record_created_time" }
}
```

### 3.5 created_at / updated_at

系统创建时间 / 系统更新时间字段；可配显示格式，但记录写入时应视为只读。

支持字段：`style.format`

默认值 / 约束：
- `style.format` 默认 `yyyy/MM/dd`
- 可用格式：`yyyy/MM/dd`、`yyyy/MM/dd HH:mm`、`yyyy/MM/dd HH:mm Z`、`yyyy-MM-dd`、`yyyy-MM-dd HH:mm`、`yyyy-MM-dd HH:mm Z`、`MM-dd`、`MM/dd/yyyy`、`dd/MM/yyyy`

```json
{ "type": "created_at", "name": "创建时间" }
```

```json
{ "type": "updated_at", "name": "更新时间", "style": { "format": "yyyy/MM/dd HH:mm" } }
```

### 3.6 user / group_chat

人员字段和群字段都支持 `multiple`。
`user` 支持 `default_value`：人员 CellValue 数组，元素可用 `{ "id": "ou_xxx" }` 或 `{ "$slot": "current_user" }`；不要猜用户 ID。`group_chat` 不支持默认值。

默认值 / 约束：
- `multiple` 默认 `true`
- `user` 字段支持 `default_value` 配置，`group_chat` 字段不支持 `default_value` 配置。

```json
{
  "type": "user",
  "name": "负责人",
  "multiple": true,
  "default_value": [{ "$slot": "current_user" }, { "id": "ou_xxx" }]
}
```

```json
{ "type": "group_chat", "name": "负责群", "multiple": true }
```

### 3.7 created_by / updated_by

系统创建人 / 系统修改人字段；记录写入时应视为只读。

```json
{ "type": "created_by", "name": "创建人" }
```

```json
{ "type": "updated_by", "name": "更新人" }
```

### 3.8 link

关联字段；`link_table` 必填。

支持字段：`link_table`、`bidirectional`、`bidirectional_link_field_name`

默认值 / 约束：
- `link_table` 必填
- `link` 字段的单元格表示“当前记录关联到的对侧表记录集合”
- `bidirectional` 默认 `false`
- `bidirectional=true` 时，会在被关联表自动创建一个反向关联字段。任一侧记录的关联关系发生变更时，另一侧对应记录会自动同步更新
- `bidirectional_link_field_name` 仅在 `bidirectional=true` 时使用
- 关联字段筛选：这个功能在 Base 前端支持，属于 UI-only 属性，OpenAPI 里不支持，CLI 不能读取、创建或更新；不要根据接口返回缺失判断未配置

```json
{
  "type": "link",
  "name": "关联任务",
  "link_table": "任务表"
}
```

双向关联：

```json
{
  "type": "link",
  "name": "关联任务",
  "link_table": "任务表",
  "bidirectional": true,
  "bidirectional_link_field_name": "反向关联"
}
```

更新时注意：
- `link` 不允许转换为其他类型，其他类型也不能转换为 `link`。
- 现有 `link` 字段的 `bidirectional` 不能改。

### 3.9 formula

公式字段；`expression` 必填。创建/更新前先读 [formula-field-guide.md](lark-base-0.md#s-89342f7915177b77) 学习公式语法。

```json
{
  "type": "formula",
  "name": "合计",
  "expression": "1+1"
}
```

### 3.10 lookup

查找引用字段；`from`、`select`、`where` 必填，`aggregate` 可选。创建/更新前先读 [lookup-field-guide.md](lark-base-0.md#s-e82ab9ada91ec1e6)。

支持字段：`from`、`select`、`where`、`aggregate`

默认值 / 约束：
- `from`、`select`、`where` 必填
- `aggregate` 默认 `raw_value` 代表不进行聚合，直接返回 select 回的原始值
- `aggregate` 可用：`raw_value`、`sum`、`average`、`counta`、`unique_counta`、`max`、`min`、`unique`
- `where.logic` 默认 `and`，仅支持 `and` / `or`
- `where.conditions` 至少 1 条
- `conditions` 每项是三元组 `[field, op, value?]`

```json
{
  "type": "lookup",
  "name": "状态汇总",
  "from": "任务表",
  "select": "状态",
  "where": {
    "logic": "and",
    "conditions": [
      ["负责人", "==", { "type": "field_ref", "field": "当前负责人" }],
      ["状态", "non_empty", null]
    ]
  },
  "aggregate": "raw_value"
}
```

### 3.11 auto_number

自动编号字段；不写 `style.rules` 时使用默认规则：`NO.001`。

最小写法：

```json
{
  "type": "auto_number",
  "name": "编号"
}
```

支持字段：`style.rules`

默认值 / 约束：
- `style.rules` 是规则数组，数量 `1..9`
- 默认规则：

```json
{
  "style": {
    "rules": [
      { "type": "text", "text": "NO." },
      { "type": "incremental_number", "length": 3 }
    ]
  }
}
```

#### `text`

支持字段：`text`

```json
{ "type": "text", "text": "TASK-" }
```

#### `incremental_number`

支持字段：`length`

默认值 / 约束：
- `length` 取值 `1..9`

```json
{ "type": "incremental_number", "length": 4 }
```

#### `created_time`

支持字段：`date_format`

默认值 / 约束：
- `date_format` 可用：`yyyyMMdd`、`yyyyMM`、`yyMM`、`MMdd`、`yyyy`、`MM`、`dd`

```json
{ "type": "created_time", "date_format": "yyyyMMdd" }
```

自定义规则：

```json
{
  "type": "auto_number",
  "name": "编号",
  "style": {
    "rules": [
      { "type": "text", "text": "TASK-" },
      { "type": "created_time", "date_format": "yyyyMMdd" },
      { "type": "incremental_number", "length": 4 }
    ]
  }
}
```

### 3.12 attachment / location / checkbox

```json
{ "type": "attachment", "name": "附件" }
```

```json
{ "type": "location", "name": "位置" }
```

写入必须使用 `{lng,lat}`。location 读回会包含 `full_address`；筛选和 `location -> text` 类型转换按 `full_address` 字符串处理，只有公式能访问坐标。

```json
{ "type": "checkbox", "name": "完成" }
```

## 4. 创建与更新

- `+field-create`：按目标字段配置直接构造 `--json`。
- `+field-update`：使用同样的 JSON 结构，但语义是 `PUT`；建议先 `+field-get`，再按目标完整状态提交，并带 `--yes`。

## 5. 暂不支持字段

Object（对象字段）、Button（按钮字段）、Stage（流程字段）暂时都没有被 CLI 支持。这些字段会展示为 `not_support` 字段并被保护：不允许修改，不允许读取内容。

## 6. 易错点

- `select` 只有一个类型；不要写 `single_select` / `multi_select`，用 `multiple` 控制是否多选。
- `number` 的精度、货币、进度、评分配置都放在 `style` 下，不要写顶层 `precision`。
- `datetime` 是手动日期字段；系统时间请改用 `created_at` / `updated_at`。
- `formula` / `lookup` 没读 guide 前不要直接写。
- 只有 `text`、`number`、静态 `select`、`datetime`、`user` 支持 `default_value`；清空统一传 `"default_value": null`。其他字段类型不要配置默认值。


<a id="s-94c4af10ef29c531"></a>

## references/baseline/references/lark-base-record-batch-create.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# base +record-batch-create

> **前置条件：** 先阅读 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

批量创建记录。

## 适用场景（重点）

- 适合导入 CSV / Excel、外部系统一次性写入新数据。
- 先把输入数据映射到合适的字段类型，再组装 `fields + rows`。

## 推荐命令

```text
lark-cli base +record-batch-create --base-token <base_token> --table-id <table_id> \
  --json '{"fields":["标题","状态"],"rows":[["任务 A","Open"],["任务 B","Done"]]}'

lark-cli base +record-batch-create --base-token <base_token> --table-id <table_id> --json @batch-create.json
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token |
| `--table-id <id_or_name>` | 是 | 表 ID 或表名 |
| `--json <body>` | 是 | 批量创建请求体，必须是 JSON 对象。支持直接传 JSON 字符串，或 `@<file_path>` 从文件读取 |

## API

`POST /open-apis/base/v3/bases/:base_token/tables/:table_id/records/batch_create`

## `--json` 结构

本节只说明 `+record-batch-create` 的外层 JSON 形状；CellValue 统一看 [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e)。

对象形态：`{"fields":[...],"rows":[...]}`。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fields` | `string[]` | 是 | 字段 ID 或字段名数组 |
| `rows` | `CellValue[][]` | 是 | 二维数组，每一行按 `fields` 同序给 cell；单次最多 200 行 |

## 返回重点

返回 `fields`、`field_id_list`、`record_id_list`、`data`，其中 `data` 与 `fields` 列顺序对齐。

## 坑点

- `fields` 与每行 `rows` 的列顺序必须一一对应。
- 空单元格必须显式用 `null` 填充。
- 单次最多 200 行，超出需分批写入。
- select 写入未知选项时平台可能自动新增选项；如果不是要新增选项，先确认真实选项名。

## 参考

- [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e) — CellValue 格式规范


<a id="s-fc4edd6bd72475fb"></a>

## references/baseline/references/lark-base-record-batch-update.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# base +record-batch-update (batch update)

> **前置条件：** 先阅读 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

通过 `update_records` 为每条记录提交字段值。

## 推荐命令

```text
lark-cli base +record-batch-update --base-token <base_token> --table-id <table_id> \
  --json '{"update_records":{"<record_id_a>":{"状态":["完成"]},"<record_id_b>":{"分数":20}}}'

lark-cli base +record-batch-update --base-token <base_token> --table-id <table_id> --json @batch-update.json
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token |
| `--table-id <id_or_name>` | 是 | 表 ID 或表名 |
| `--json <body>` | 是 | 批量更新请求体，必须是 JSON 对象。支持直接传 JSON 字符串，或 `@<file_path>` 从文件读取 |

## API

`POST /open-apis/base/v3/bases/:base_token/tables/:table_id/records/batch_update`

## `--json` 结构

本节只说明 `+record-batch-update` 的外层 JSON 形状；CellValue 统一看 [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e)。

对象形态：

```json
{"update_records":{"recA":{"状态":["完成"]},"recB":{"分数":20}}}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `update_records` | `Map<RecordID, Map<FieldNameOrID, CellValue>>` | 是 | record ID 到字段更新对象的映射（单次最多 200 条） |

## 返回重点

成功响应只包含可选的 `ignored_fields`；没有忽略字段时 `data` 为空对象。请求不会预先校验 record ID 是否存在，因此需要确认实际写入结果时，应再用 `+record-get` 读回目标记录。

## 坑点

- 单次最多更新 200 条记录，超过会被接口校验拒绝。
- 命令不会自动做字段/行映射转换，传什么就发什么。
- 如果字段映射包含只读字段，返回里可能出现 `ignored_fields`；这些字段不会被更新。

## 参考

- [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e) — CellValue 格式规范


<a id="s-7734410c1771f0a7"></a>

## references/baseline/references/lark-base-record-upsert.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# base +record-upsert

> **前置条件：** 先阅读 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

创建记录，或在带 `--record-id` 时更新记录。

## 推荐命令

```text
# 创建记录
lark-cli base +record-upsert --base-token <base_token> --table-id <table_id> \
  --json '{"项目名称":"Apollo","状态":"进行中"}'

# 更新记录
lark-cli base +record-upsert --base-token <base_token> --table-id <table_id> --record-id <record_id> \
  --json '{"项目名称":"Apollo","状态":"完成","完成时间":"2026-03-24 10:00:00"}'
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token |
| `--table-id <id_or_name>` | 是 | 表 ID 或表名 |
| `--record-id <id>` | 否 | 传入时走更新，不传时走创建 |
| `--json <body>` | 是 | 字段写入对象，类型 `Map<FieldNameOrID, CellValue>` |

## API

- 创建：`POST /open-apis/base/v3/bases/:base_token/tables/:table_id/records`
- 更新：带 `--record-id` 时改走 `PATCH /records/:record_id`

## `--json` 结构

- `--json` 必须是 **JSON object map**，形状是 `Map<FieldNameOrID, CellValue>`。
- key 是字段名或字段 ID；value 是该字段的 `CellValue`。
- 一次请求里同一字段只用一种标识，避免重复写入冲突。
- 写入前先 `+field-list` 确认字段类型和字段名/ID。
- CellValue 统一看 [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e)。

```json
{
  "项目名称": "Apollo",
  "状态": "进行中",
  "完成时间": "2026-03-24 10:00:00"
}
```

## 返回重点

- 创建时返回 `record` 和 `created: true`。
- 更新时返回 `record` 和 `updated: true`。
- 如果写入了 `formula / lookup / created_at / updated_at / created_by / updated_by` 等只读字段，返回里可能出现 `ignored_fields`，这些字段不会被更新。

## 坑点

- 有 `--record-id` 就一定更新；不传就一定创建，不会自动查重或按业务键 upsert。
- select 写入未知选项时平台可能自动新增选项；如果不是要新增选项，先用 `+field-list` / `+field-search-options` 确认真实选项名。
- 这是写入操作，执行前必须确认目标表和字段。

## 参考

- [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e) — CellValue 格式规范


<a id="s-caa7a2e6ba29ab15"></a>

## references/baseline/references/lark-base-role-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base advanced permission and role guide

This guide is the entry point for Base advanced permissions and roles. Use it to choose commands and understand safety boundaries. For the permission JSON itself, use [role-config.md](lark-base-0.md#s-304dccd7c23aa7ce) as the SSOT.

## Command selection

| Goal | Command | Notes |
|------|---------|-------|
| Enable advanced permissions | `+advperm-enable` | Required before creating or updating roles. Caller must be a Base admin. |
| Disable advanced permissions | `+advperm-disable` | High-risk write. Disabling invalidates existing custom roles. |
| Locate roles | `+role-list` | Returns role summaries. Use `+role-get` for full config. |
| Inspect one role | `+role-get` | Use before updating a role or deciding whether a role can be deleted. |
| Create a custom role | `+role-create` | Supports `custom_role` only. Read [role-config.md](lark-base-0.md#s-304dccd7c23aa7ce) before constructing `--json`. |
| Update a role | `+role-update` | Delta merge. Read current config first, then send only intended changes. |
| Delete a role | `+role-delete` | Custom roles only. System roles cannot be deleted. |

## Safety boundaries

- Role operations require advanced permissions to be enabled and the caller to be a Base admin.
- `+role-create` creates custom roles only.
- `+role-delete` is only for custom roles. System roles such as editor/reader can be configured within supported limits, but cannot be deleted.
- `+role-update` uses delta merge: omitted fields remain unchanged, but identity fields such as `role_name` and `role_type` should match the current target role.
- `+advperm-disable` invalidates existing custom roles; confirm the target Base and user intent before passing `--yes`.

## Common Fewshots

Use these fewshots for simple role changes. For table, field, record, dashboard, docx, or filter permission details, switch to [role-config.md](lark-base-0.md#s-304dccd7c23aa7ce).

Create a custom role that keeps copy/download disabled:

```text
lark-cli base +role-create \
  --base-token <base_token> \
  --json '{"role_name":"Reviewer","role_type":"custom_role","base_rule_map":{"copy":false,"download":false}}'
```

Rename a role while preserving its type:

```text
lark-cli base +role-update \
  --base-token <base_token> \
  --role-id <role_id> \
  --json '{"role_name":"Finance Reviewer","role_type":"custom_role"}' \
  --yes
```

Grant read-only access to one table:

```text
lark-cli base +role-update \
  --base-token <base_token> \
  --role-id <role_id> \
  --json '{"role_name":"Finance Reviewer","role_type":"custom_role","table_rule_map":{"Orders":{"perm":"read_only"}}}' \
  --yes
```

## JSON SSOT

Use [role-config.md](lark-base-0.md#s-304dccd7c23aa7ce) for:

- `AdvPermBaseRoleConfig` top-level structure.
- `base_rule_map`, `table_rule_map`, `dashboard_rule_map`, and `docx_rule_map`.
- Table, view, field, record, dashboard, and docx permission values.
- Filter permission JSON.
- Default permission strategy and risk rules.


<a id="s-38ac803292b70568"></a>

## references/baseline/references/lark-base-workflow-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Workflow guide

本文档是 Workflow 的入口指南，帮助选择步骤组合、理解创建/更新边界，并引导到 steps JSON SSOT。

> **配套文档**:
> - Workflow 的数据结构参考：[lark-base-workflow-schema.md](lark-base-0.md#s-aafd418669728581)
> - 创建/更新时重点构造 `title`、`status` 和 `steps`；复杂度集中在 `steps[].type/data/next`

---

## 快速开始

### 最简单的 Workflow

新增记录时发送消息通知：

```json
{
  "client_token": "1704067200",
  "title": "新订单自动通知",
  "steps": [
    {
      "id": "trigger_1",
      "type": "AddRecordTrigger",
      "title": "监控新订单",
      "next": "action_1",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单号"
      }
    },
    {
      "id": "action_1",
      "type": "LarkMessageAction",
      "title": "发送通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_xxxx", "name": "张三"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单提醒" }],
        "content": [
          { "value_type": "text", "value": "收到新订单" }
        ],
        "btn_list": []
      }
    }
  ]
}
```

---

## 场景速查表

| 场景 | 步骤组合 | 示例 |
|------|---------|------|
| 新增触发+通知 | AddRecordTrigger → LarkMessageAction | [下方](#示例1-新增记录触发--发送消息) |
| 按钮点击+调用外部接口+写入日志 | ButtonTrigger → HTTPClientAction → AddRecordAction | [下方](#示例-6-按钮触发--调用外部接口--写入同步日志) |
| 定时+循环 | TimerTrigger → FindRecordAction → Loop → LarkMessageAction | [下方](#示例2-定时触发--查找记录--循环遍历--发送消息) |
| 条件判断 | ... → IfElseBranch → 分支处理 | [下方](#示例3-条件分支-ifelsebranch) |
| 多路分类 | ... → SwitchBranch → 多分支处理 | [下方](#示例4-多路分支-switchbranch) |
| 复杂组合 | 定时+查找+循环+分支+消息 | [下方](#示例5-组合场景-定时查找循环分支消息) |

---

## 完整示例

### 示例 1: 新增记录触发 + 发送消息

**场景**: 当订单表新增记录时，发送飞书消息通知负责人。

```json
{
  "client_token": "1704067201",
  "title": "新订单自动通知",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_notify",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单号",
        "condition_list": null
      }
    },
    {
      "id": "step_notify",
      "type": "LarkMessageAction",
      "title": "发送订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_trigger.fldManager" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单提醒" }],
        "content": [
          { "value_type": "text", "value": "客户 " },
          { "value_type": "ref", "value": "$.step_trigger.fldCustomer" },
          { "value_type": "text", "value": " 创建了新订单，金额：¥" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" }
        ],
        "btn_list": [
          {
            "text": "查看订单",
            "btn_action": "openLink",
            "link": [{ "value_type": "ref", "value": "$.step_trigger.recordLink" }]
          }
        ]
      }
    }
  ]
}
```

**关键点**:
- `AddRecordTrigger` 监控 `table_name` 表的 `watched_field_name` 字段
- 使用 `ref` 引用触发器输出的字段值（注意是 fieldId，不是字段名）
- `recordLink` 是触发器内置输出，表示记录链接

---

### 示例 2: 定时触发 + 查找记录 + 循环遍历 + 发送消息

**场景**: 每天早上 9 点，查找所有待处理订单，给每个客户发送提醒。

```json
{
  "client_token": "1704067202",
  "title": "每日待处理订单提醒",
  "steps": [
    {
      "id": "step_timer",
      "type": "TimerTrigger",
      "title": "每天早上9点触发",
      "next": "step_find_orders",
      "data": {
        "rule": "DAILY",
        "start_time": "2025-01-01 09:00",
        "is_never_end": true
      }
    },
    {
      "id": "step_find_orders",
      "type": "FindRecordAction",
      "title": "查找所有待处理订单",
      "next": "step_loop_customers",
      "data": {
        "table_name": "订单表",
        "field_names": ["客户名称", "订单金额", "客户联系方式"],
        "should_proceed_when_no_results": false,
        "filter_info": {
          "conjunction": "and",
          "conditions": [
            {
              "field_name": "状态",
              "operator": "is",
              "value": [{ "value_type": "option", "value": { "name": "待处理" } }]
            }
          ]
        }
      }
    },
    {
      "id": "step_loop_customers",
      "type": "Loop",
      "title": "遍历每个订单",
      "children": {
        "links": [
          { "kind": "loop_start", "to": "step_send_reminder" }
        ]
      },
      "next": null,
      "data": {
        "loop_mode": "continue",
        "max_loop_times": 100,
        "data": [{
          "value_type": "ref",
          "value": "$.step_find_orders.fieldRecords"
        }]
      }
    },
    {
      "id": "step_send_reminder",
      "type": "LarkMessageAction",
      "title": "发送催办消息",
      "next": null,
      "data": {
        "receiver": [{
          "value_type": "ref",
          "value": "$.step_loop_customers.item.fldContact"
        }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "订单处理提醒" }],
        "content": [
          { "value_type": "text", "value": "您好，您的订单 " },
          { "value_type": "ref", "value": "$.step_loop_customers.item.fldName" },
          { "value_type": "text", "value": " 金额 ¥" },
          { "value_type": "ref", "value": "$.step_loop_customers.item.fldAmount" },
          { "value_type": "text", "value": " 正在处理中。" }
        ],
        "btn_list": []
      }
    }
  ]
}
```

**关键点**:
- `Loop.data` 必须传入 `ref` 类型的数据源（通常是 FindRecordAction 的 `fieldRecords`）
- `Loop.children.links` 必须包含 `kind: "loop_start"` 的链接指向循环体
- 循环体内用 `$.{loopStepId}.item.{fieldId}` 引用当前遍历记录的字段
- `$.{loopStepId}.index` 获取当前索引（从 0 开始）

---

### 示例 3: 条件分支（IfElseBranch）

**场景**: 根据订单金额判断，大额订单通知主管审批，小额订单自动通过。

```json
{
  "client_token": "1704067203",
  "title": "订单金额自动判断",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_check_amount",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单金额"
      }
    },
    {
      "id": "step_check_amount",
      "type": "IfElseBranch",
      "title": "判断是否为大额订单",
      "children": {
        "links": [
          { "kind": "if_true", "to": "step_notify_manager", "label": "high", "desc": "金额>=10000" },
          { "kind": "if_false", "to": "step_auto_approve", "label": "normal", "desc": "金额<10000" }
        ]
      },
      "next": "step_log",
      "data": {
        "condition": {
          "conjunction": "or",
          "conditions": [
            {
              "conjunction": "and",
              "conditions": [
                {
                  "left_value": { "value_type": "ref", "value": "$.step_trigger.fldAmount" },
                  "operator": "isGreaterEqual",
                  "right_value": [{ "value_type": "number", "value": 10000 }]
                }
              ]
            }
          ]
        }
      }
    },
    {
      "id": "step_notify_manager",
      "type": "LarkMessageAction",
      "title": "通知主管审批大额订单",
      "next": "step_log",
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_manager", "name": "主管"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "大额订单待审批" }],
        "content": [
          { "value_type": "text", "value": "有大额订单 ¥" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" },
          { "value_type": "text", "value": " 需要您审批" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_auto_approve",
      "type": "SetRecordAction",
      "title": "自动标记小额订单为已审核",
      "next": "step_log",
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          {
            "field_name": "审批状态",
            "value": [{ "value_type": "option", "value": { "name": "已自动审核" } }]
          }
        ]
      }
    },
    {
      "id": "step_log",
      "type": "GenerateAiTextAction",
      "title": "生成订单处理日志",
      "next": null,
      "data": {
        "prompt": [
          { "value_type": "text", "value": "请生成订单处理日志，金额：" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" }
        ]
      }
    }
  ]
}
```

**关键点**:
- `IfElseBranch.children.links` 必须包含 `if_true` 和 `if_false` 两个分支
- `next` 指向两个分支汇合后的步骤（可选，为 null 则分支结束）
- `condition` 使用 OrGroup 结构，支持 `(A and B) or (C and D)` 的复杂条件
- 分支内可以用 `ref_info` 引用触发记录，用 `filter_info` 批量筛选记录

---

### 示例 4: 多路分支（SwitchBranch）

**场景**: 根据订单优先级（P0/P1/P2）执行不同的处理流程。

```json
{
  "client_token": "1704067204",
  "title": "按优先级分类处理订单",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_classify",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "优先级"
      }
    },
    {
      "id": "step_classify",
      "type": "SwitchBranch",
      "title": "按优先级分类",
      "children": {
        "links": [
          { "kind": "case", "to": "step_p0_handler", "label": "p0", "desc": "P0-紧急" },
          { "kind": "case", "to": "step_p1_handler", "label": "p1", "desc": "P1-高优先级" },
          { "kind": "case", "to": "step_p2_handler", "label": "p2", "desc": "P2-普通" },
          { "kind": "case", "to": "step_other_handler", "label": "other", "desc": "其他" }
        ]
      },
      "next": null,
      "data": {
        "mode": "exclusive",
        "no_match_action": "classifyToOther",
        "child_branch_list": [
          {
            "name": "P0-紧急",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P0" } }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "P1-高优先级",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P1" } }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "P2-普通",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P2" } }]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      "id": "step_p0_handler",
      "type": "LarkMessageAction",
      "title": "P0紧急处理",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_director", "name": "总监"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "🚨 P0 紧急订单" }],
        "content": [{ "value_type": "text", "value": "有新的 P0 紧急订单需要立即处理" }],
        "btn_list": []
      }
    },
    {
      "id": "step_p1_handler",
      "type": "SetRecordAction",
      "title": "标记高优先级",
      "next": null,
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "处理状态", "value": [{ "value_type": "text", "value": "高优先级待处理" }] }
        ]
      }
    },
    {
      "id": "step_p2_handler",
      "type": "Delay",
      "title": "普通订单延迟处理",
      "next": null,
      "data": { "duration": 60 }
    },
    {
      "id": "step_other_handler",
      "type": "SetRecordAction",
      "title": "标记其他订单",
      "next": null,
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "处理状态", "value": [{ "value_type": "text", "value": "待分类" }] }
        ]
      }
    }
  ]
}
```

**关键点**:
- `SwitchBranch` 适合 3 路及以上的分支场景（少于 3 路用 `IfElseBranch` 更简洁）
- `children.links` 中 `kind: "case"` 的 `label` 对应 `child_branch_list` 中的条件
- `mode: "exclusive"` 表示排他执行（第一个匹配的分支执行后停止）
- `no_match_action: "classifyToOther"` 表示无匹配时走最后一个 `case`（兜底分支）

---

### 示例 5: 组合场景（定时+查找+循环+分支+消息）

**场景**: 每天早上 9 点，查找昨天的订单，按金额分级，给不同级别的销售发送不同的通知。

```json
{
  "client_token": "1704067205",
  "title": "每日订单分级通知",
  "steps": [
    {
      "id": "step_timer",
      "type": "TimerTrigger",
      "title": "每天早上9点触发",
      "next": "step_find_orders",
      "data": {
        "rule": "DAILY",
        "start_time": "2025-01-01 09:00",
        "is_never_end": true
      }
    },
    {
      "id": "step_find_orders",
      "type": "FindRecordAction",
      "title": "查找昨天所有订单",
      "next": "step_loop",
      "data": {
        "table_name": "订单表",
        "field_names": ["订单号", "客户名称", "金额", "销售负责人"],
        "should_proceed_when_no_results": false,
        "filter_info": {
          "conjunction": "and",
          "conditions": [
            { "field_name": "创建时间", "operator": "isGreaterEqual", "value": [{ "value_type": "date", "value": "yesterday" }] }
          ]
        }
      }
    },
    {
      "id": "step_loop",
      "type": "Loop",
      "title": "遍历每个订单",
      "children": {
        "links": [
          { "kind": "loop_start", "to": "step_classify" }
        ]
      },
      "next": "step_summary",
      "data": {
        "loop_mode": "continue",
        "max_loop_times": 500,
        "data": [{ "value_type": "ref", "value": "$.step_find_orders.fieldRecords" }]
      }
    },
    {
      "id": "step_classify",
      "type": "SwitchBranch",
      "title": "按金额分类",
      "children": {
        "links": [
          { "kind": "case", "to": "step_vip_notify", "label": "vip", "desc": "VIP >= 10万" },
          { "kind": "case", "to": "step_normal_notify", "label": "normal", "desc": "普通 < 10万" }
        ]
      },
      "next": null,
      "data": {
        "mode": "exclusive",
        "no_match_action": "fail",
        "child_branch_list": [
          {
            "name": "VIP订单",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
                      "operator": "isGreaterEqual",
                      "right_value": [{ "value_type": "number", "value": 100000 }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "普通订单",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
                      "operator": "isLess",
                      "right_value": [{ "value_type": "number", "value": 100000 }]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      "id": "step_vip_notify",
      "type": "LarkMessageAction",
      "title": "VIP订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_loop.item.fldSales" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "🌟 VIP大额订单" }],
        "content": [
          { "value_type": "text", "value": "恭喜！您有一笔 VIP 订单 ¥" },
          { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
          { "value_type": "text", "value": "，客户：" },
          { "value_type": "ref", "value": "$.step_loop.item.fldCustomer" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_normal_notify",
      "type": "LarkMessageAction",
      "title": "普通订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_loop.item.fldSales" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单通知" }],
        "content": [
          { "value_type": "text", "value": "您有一笔新订单 ¥" },
          { "value_type": "ref", "value": "$.step_loop.item.fldAmount" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_summary",
      "type": "GenerateAiTextAction",
      "title": "生成日报",
      "next": null,
      "data": {
        "prompt": [
          { "value_type": "text", "value": "请生成昨日订单处理日报" }
        ]
      }
    }
  ]
}
```

---

### 示例 6: 按钮触发 + 调用外部接口 + 写入同步日志

**场景**: 在「客户线索表」里给每条记录配置一个“同步到 CRM”按钮。销售点击按钮后，Workflow 调用外部 CRM 接口同步当前线索，再在「同步日志表」新增一条记录，方便后续审计和排查。

```json
{
  "client_token": "1704067206",
  "title": "线索一键同步到 CRM",
  "steps": [
    {
      "id": "step_button_trigger",
      "type": "ButtonTrigger",
      "title": "点击同步到 CRM 按钮时触发",
      "next": "step_call_crm_api",
      "data": {
        "button_type": "buttonField",
        "table_name": "客户线索表"
      }
    },
    {
      "id": "step_call_crm_api",
      "type": "HTTPClientAction",
      "title": "调用 CRM 同步接口",
      "next": "step_add_sync_log",
      "data": {
        "method": "POST",
        "url": [
          { "value_type": "text", "value": "https://api.example-crm.com/v1/leads/sync" }
        ],
        "headers": [
          { "key": "Content-Type", "value": [{ "value_type": "text", "value": "application/json" }] },
          { "key": "X-System", "value": [{ "value_type": "text", "value": "lark_base_workflow" }] }
        ],
        "body_type": "raw",
        "raw_body": [
          { "value_type": "text", "value": "{\"lead_name\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldLeadName" },
          { "value_type": "text", "value": "\",\"mobile\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldMobile" },
          { "value_type": "text", "value": "\",\"company\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldCompany" },
          { "value_type": "text", "value": "\",\"owner\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldOwner" },
          { "value_type": "text", "value": "\",\"source_record_id\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.recordId" },
          { "value_type": "text", "value": "\"}" }
        ],
        "response_type": "json",
        "response_value": "{\"success\":true,\"message\":\"lead synced successfully\"}"
      }
    },
    {
      "id": "step_add_sync_log",
      "type": "AddRecordAction",
      "title": "写入同步日志",
      "next": null,
      "data": {
        "table_name": "同步日志表",
        "field_values": [
          {
            "field_name": "线索名称",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldLeadName" }]
          },
          {
            "field_name": "手机号",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldMobile" }]
          },
          {
            "field_name": "公司名称",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldCompany" }]
          },
          {
            "field_name": "负责人",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldOwner" }]
          },
          {
            "field_name": "来源记录ID",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.recordId" }]
          },
          {
            "field_name": "同步状态",
            "value": [{ "value_type": "text", "value": "已提交 CRM 同步" }]
          },
          {
            "field_name": "同步是否成功",
            "value": [{ "value_type": "ref", "value": "$.step_call_crm_api.body.success" }]
          },
          {
            "field_name": "同步结果说明",
            "value": [{ "value_type": "ref", "value": "$.step_call_crm_api.body.message" }]
          },
          {
            "field_name": "备注",
            "value": [{ "value_type": "text", "value": "由按钮触发自动发起同步请求" }]
          }
        ]
      }
    }
  ]
}
```

**关键点**:
- `ButtonTrigger` 适合“人工确认后再执行”的场景，比如同步 CRM、推送 ERP、发起审批等
- `button_type: "buttonField"` 表示按钮挂在记录上，因此可以直接引用当前记录的字段和值
- `HTTPClientAction.raw_body` 可以通过 `text + ref + text` 的方式动态拼接 JSON 请求体
- `HTTPClientAction` 的输出引用规则是：`response_type=none` 时不可引用；`response_type=text` 时只能用 `$.stepId` 引整个文本；`response_type=json` 时用 `$.stepId.body` 引整个 body、用 `$.stepId.body.字段名` 引 body 中字段，同时 `$.stepId.status_code` 表示 HTTP 返回状态码
- `HTTPClientAction.response_value` 中声明了哪些字段，后续节点就只能引用这些字段；例如 `$.step_call_crm_api.body.success`、`$.step_call_crm_api.body.message`
- `AddRecordAction` 常用于写日志表、操作审计表、同步结果表，便于追踪谁在什么时候触发了外部调用
- 示例里的 `fldLeadName` / `fldMobile` / `fldCompany` / `fldOwner` 只是占位的 fieldId，请以实际表字段 ID 为准

---

## 构造技巧

### Loop 构造要点

1. **数据源**: `Loop.data` 必须传入 `ref` 类型，通常是 `FindRecordAction` 的 `fieldRecords`
2. **循环体**: `children.links` 必须包含 `kind: "loop_start"` 指向循环体入口
3. **引用**: 循环体内用 `$.{loopStepId}.item.{fieldId}` 引用当前元素
4. **索引**: 用 `$.{loopStepId}.index` 获取当前索引（从 0 开始）

### 分支构造要点

1. **IfElseBranch**:
   - 适合二元判断（是/否、大于/小于）
   - `children.links` 必须包含 `if_true` 和 `if_false`
   - 可以用 `next` 指向汇合点

2. **SwitchBranch**:
   - 适合多路分类（3路及以上）
   - `label` 对应 `child_branch_list` 中的条件顺序
   - 建议加一个兜底分支（其他）

### 字段值构造

| 字段类型 | value_type | 示例 |
|---------|------------|------|
| 文本 | `text` | `{"value_type": "text", "value": "张三"}` |
| 数字 | `number` | `{"value_type": "number", "value": 100}` |
| 单选 | `option` | `{"value_type": "option", "value": {"name": "已完成"}}` |
| 人员 | `user` | `{"value_type": "user", "value": {"id": "ou_xxxx"}}` |
| 引用 | `ref` | `{"value_type": "ref", "value": "$.step_1.fldxxx"}` |

---

## 常见错误避免

### Top 10 高频错误

| # | 错误信息 | 原因 | 解决方案 |
|---|---------|------|---------|
| 1 | `path "xxx" does not exist in the output path tree` | ref 引用路径错误或 stepId 不存在 | 检查 stepId 是否在 steps 数组中；使用 fieldId 而非字段名；确保路径以 `$.` 开头 |
| 2 | `recordInfo.conditions must be non-empty` | `condition_list` 为空数组 `[]` | 改用 `null` 或省略该字段 |
| 3 | `At least one of filter info and ref info is required` | SetRecordAction/FindRecordAction 缺少定位条件 | 必须提供 `filter_info` 或 `ref_info` 之一 |
| 4 | `client token is empty` | 缺少 `client_token` | 每次请求传入唯一值（时间戳或随机字符串） |
| 5 | `valueType 'text' not allowed for fieldType '3'` | select 类型字段值格式错误 | 改用 `option` 类型 |
| 6 | `Undefined Step Type` | 使用了不支持的 StepType | 使用 `AddRecordTrigger` 而非 `CreateRecordTrigger` |
| 7 | `prompt references an unknown reference from step` | 引用的 stepId 不存在 | 确保引用的 step 在同一 workflow 的 steps 数组中 |
| 8 | `[2200] Internal Error` | 1. steps[].id 重复 2. next/children.links 引用了不存在的 step | 确保所有 step id 唯一；检查引用关系 |
| 9 | 工作流结构不完整 | Branch/Loop 节点缺少 `children` | 仅 Branch（IfElseBranch/SwitchBranch）和 Loop 节点需要 `children`，Trigger/Action 节点无需设置 |
| 10 | 嵌套分支过于复杂 | 多层 IfElseBranch 嵌套 | 3+ 路分支用 SwitchBranch 替代嵌套 IfElseBranch |

### 其他常见错误

**1. condition_list 为空数组**
```json
// ❌ 错误
{ "condition_list": [] }

// ✅ 正确
{ "condition_list": null }
// 或省略该字段
```

**2. filter_info 和 ref_info 同时提供**
```json
// ❌ 错误
{ "filter_info": {...}, "ref_info": {...} }

// ✅ 正确（二选一）
{ "filter_info": {...}, "ref_info": null }
{ "filter_info": null, "ref_info": {...} }
```

**3. 使用字段名而非 fieldId**
```json
// ❌ 错误
{ "value": "$.step_1.客户名称" }

// ✅ 正确
{ "value": "$.step_1.fldXXXXXXXX" }
```

---

## 参考

- [lark-base-workflow-schema.md](lark-base-0.md#s-aafd418669728581) — 字段定义参考
- 创建/更新前先确认真实表名、字段名和目标 workflow ID；`steps` 结构按 schema 构造，不凭自然语言猜 `type`


<a id="s-e82ab9ada91ec1e6"></a>

## references/baseline/references/lookup-field-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base Lookup Field Configuration Guide

## Mandatory Read Acknowledgement

When creating or updating a lookup field with `lark-cli base +field-create/+field-update --json ...` and `type` is `lookup`, you should read this guide first and only then add `--i-have-read-guide` to the command.

Do **not** proactively add `--i-have-read-guide` before reading this guide. Without it, the CLI will fail fast and direct you back to this guide.

When using `+field-update`, also pass `--yes`: field update is a high-risk `PUT` operation because changing a field definition can affect the whole column.

## Default strategy

**Use Formula fields by default for cross-table references and aggregations.** Only use Lookup fields when the user explicitly requests a Lookup field. Formula is a strict superset of Lookup — anything Lookup can do, Formula can do with a single expression.

## Usage

When creating a lookup field, the Agent should:

1. Get all table names: `lark-cli base +table-list --base-token <base>` — returns `items[].table_name`
2. Get table structure: `lark-cli base +table-get --base-token <base> --table-id <table>` — returns `fields[]`
3. If the lookup references other tables, also get those tables' structures
4. Determine the four elements: from (source table), select (source field), where (filter), aggregate (aggregation)
5. Construct the Lookup field JSON and submit it to create or update the field

**Key constraints**:

- Table names and field names must **exactly match** those returned by `+table-list` / `+table-get`
- The `from` table must be in the same Base

---

## Section 1: Core Concepts — Four-Element Model

A Lookup field is defined by five fields:

| Field | Meaning | JSON key | Required |
|-------|---------|----------|----------|
| **type** | Must be `"lookup"` | `type` | Yes |
| **from** | Source table to pull data from | `from` | Yes |
| **select** | Field in the source table to retrieve | `select` | Yes |
| **where** | Filter conditions on the source table | `where` | Yes (at least one condition) |
| **aggregate** | How to aggregate multiple matching records | `aggregate` | No (default: `raw_value`) |

**SQL analogy**:

```
SELECT  [select field]
FROM    [from table]
WHERE   [filter conditions]
GROUP BY [aggregate function]
```

**Row-level matching (most important concept)**:

A Lookup field is computed row-by-row — for each row in the current table, it filters the source table to find "related" records. **The filter defines what "related" means.**

```
Current table row 1 → filter source table → matching records → select field → aggregate → result
Current table row 2 → filter source table → matching records → select field → aggregate → result
...
```

**Rule: Whenever the current table and the source table have a row-level correspondence (matching by some field value), you must specify a filter.**

---

## Section 2: Lookup vs Link vs Formula

Lookup and Link serve **different purposes**. Creating a Lookup does NOT require a Link field to exist first.

| Dimension | Link | Lookup | Formula |
|-----------|------|--------|---------|
| Purpose | Establish record relationships (read-write) | Pull and aggregate data from another table (read-only) | Compute values from expressions (read-only) |
| When to use | "link" / "associate" / "bind" two tables | "look up" / "reference" / "aggregate" / "count" from another table | Calculations, text manipulation, conditional logic |

**Common mistake**: Creating a Link field just to create a Lookup. If two tables share a matching text/number field, Lookup can match directly — no Link required.

**Selection decision tree**:

```
What does the user need?
├─ "Link"/"associate"/"bind" records between tables → Link
├─ "Look up"/"reference"/"aggregate"/"count" from another table → Lookup
│   ├─ Needs aggregation (sum/count/average)? → Lookup + aggregate
│   └─ Just reference a value? → Lookup (aggregate = null)
├─ Calculations/text manipulation within current table → Formula
└─ Access linked record's field → Prefer Lookup (more intuitive), or Formula chain access
```

---

## Section 3: Filter Condition Rules

**You must provide a `where` with at least one condition.** Improper conditions cause every row to pull all records from the source table.

### The Iron Rule: field belongs to source table

```
filter condition:
  field   → must be a field in the FROM table (source table)
  value   → constant or reference to a field in the CURRENT table
```

### How to find the matching field pair

**With a Link field (most common)**: The match is between the **Link field** and the **target table's primary field**.

```
Link is in the source table   → source.linkField matches current.primaryField
Link is in the current table  → source.primaryField matches current.linkField
```

**Without a Link field**: Two tables share a field with the same meaning — match directly.

### Where condition structure

Each condition is a **tuple** (array) of 2 or 3 elements: `[field, operator, value?]`

```json
{
  "logic": "and",
  "conditions": [
    ["<source table field>", "<operator>", { "type": "constant", "value": "<val>" }]
  ]
}
```

For `empty` / `non_empty`, the value can be omitted (2-element tuple):

```json
["<source table field>", "empty"]
```

### Two value formats

**Constant value** — for fixed conditions (e.g., "status is completed"):

```json
["状态", "==", { "type": "constant", "value": "已完成" }]
```

**Field reference** — for dynamic per-row matching (e.g., "match current row's project"):

```json
["项目名", "==", { "type": "field_ref", "field": "项目名" }]
```

**Decision guide**: Fixed condition (e.g., "status is completed") → `constant`. Dynamic condition (e.g., "match current record's project ID") → `field_ref`.

### Constant value format by field type

The `value` inside `{ "type": "constant", "value": ... }` varies by field type:

| Field type | Constant value format | Example |
|-----------|----------------------|---------|
| `text` | String | `"已完成"` |
| `number` | Number | `100`, `0.8` |
| `datetime` / `created_at` / `updated_at` | String | `"ExactDate(2025-01-01)"`, `"ExactDate(2025-01-01 09:30)"`, `"Today"`, `"Yesterday"`, `"Tomorrow"` |
| `select` (`multiple=false/true`) | Option name array | `["Todo"]`, `["Todo", "Done"]` |
| `link` | Record reference array | `[{ "id": "rec_xxx" }]`, `[{ "id": "rec_xxx" }, { "id": "rec_yyy" }]` |
| `user` / `created_by` / `updated_by` | User reference array | `[{ "id": "ou_xxx" }]`, `[{ "id": "ou_xxx" }, { "id": "ou_yyy" }]` |
| `checkbox` | Boolean | `true`, `false` |
| `attachment` / `location` | Only `empty` / `non_empty` | value must be `null` or omitted |
| `auto_number` | Not supported for constant comparison | Use dynamic field\_ref instead |
| `formula` / `lookup` (exact type) | Follow the underlying type rules | — |
| `formula` / `lookup` (fuzzy type) | String | `"some text"` |

**`datetime` notes**:
- Supported datetime constant values are `ExactDate(...)`, `Today`, `Yesterday`, `Tomorrow`
- Date-only fields use `ExactDate(YYYY-MM-DD)`
- Fields that include time use `ExactDate(YYYY-MM-DD HH:mm)`
- For complex or relative date filtering, consider using a Formula field instead

### Dynamic field reference — set comparison semantics

When using `{ "type": "field_ref", "field": "..." }`, values from both sides are first **converted to sets** at runtime, then compared using set operations:

- **`==`**: Sets are exactly equal (strict matching)
- **`intersects`**: Sets have a non-empty intersection (most commonly used)

**Conversion rules by field type**:

| Field type | Converted to |
|-----------|-------------|
| `text` | Single-element string set |
| `number` / `auto_number` / `datetime` | Single-element number set |
| `select` (`multiple=false/true`) | Set of option name strings |
| `user` / `created_by` / `updated_by` | Set of user name strings |
| `link` | Set of linked records' primary field string representations |
| `formula` / `lookup` | The computed value set |

**Examples**:
- User field `["name1", "name2"]` **intersects** text `"name1"` → true; **==** text `"name1"` → false (sets not equal)
- User field `["name1"]` **==** text `"name1"` → true (single-element sets are equal)
- Link field referencing records → converted to primary field strings, then compared

### Supported operators

| Operator | Meaning | Applicable field types |
|----------|---------|-----------------|
| `==` | Equal (exact match) | All types |
| `!=` | Not equal | All types |
| `>` | Greater than | `number`, `datetime` |
| `>=` | Greater than or equal | `number`, `datetime` |
| `<` | Less than | `number`, `datetime` |
| `<=` | Less than or equal | `number`, `datetime` |
| `intersects` | Has intersection (non-empty overlap) | All types (most commonly used for dynamic field\_ref) |
| `disjoint` | No intersection | All types |
| `empty` | Field is empty | All types (value must be null or omitted) |
| `non_empty` | Field is not empty | All types (value must be null or omitted) |

### Constraints

- **Only one level of and/or** — nesting (e.g., `{ and: [{ or: [...] }] }`) is not supported
- **At least one condition** — empty conditions array will error

---

## Section 4: Aggregate Rules

| Aggregate | Common user phrasing | Select field should be | Result type |
|-----------|---------------------|----------------------|-------------|
| `sum` | "total" / "sum" / "cumulative amount" | `number` field (e.g., amount) | Number |
| `average` | "average" / "mean" | `number` field | Number |
| `max` | "maximum" / "latest" / "most recent" | `number` / `datetime` field | Same as source |
| `min` | "minimum" / "earliest" | `number` / `datetime` field | Same as source |
| `counta` | "count" / "how many" / "total number" | Any field | Number |
| `unique_counta` | "count distinct" / "how many different" | Field to deduplicate | Number |
| `unique` | "list distinct" / "which ones" / "show different" | Field to display | List |
| `raw_value` | "list all" / "show all values" (default) | Field to display | List |

**Common confusion**: `unique` returns a **deduplicated list**, `unique_counta` returns a **count**. "Which categories are involved" → `unique`; "How many categories" → `unique_counta`.

**Important**:
- Enum values are **snake_case lowercase**: `sum` not `Sum`, `average` not `Average`
- **Count is `counta`, NOT `count`** — this is the most common enum mistake

---

## Section 5: Hard Constraints

1. **Always write a filter**: The `where` field is required with at least one condition. Whenever the current table and source table have row-level correspondence, the condition should express that relationship.
2. **Lookup fields are read-only**: Cell values cannot be manually set.
3. **Create Lookup after all dependent fields exist**: The source table and referenced fields must exist before creating the Lookup field.
4. **Source table must be in the same Base**: Cross-Base lookups are not supported.
5. **Changing `from` requires changing `select`**: Updating the source table without updating the select field will error.

---

## Section 6: Decision Trees

### How to build the filter

```
Step 1: Analyze the filtering semantics in the user's request
  "Count artworks per exhibition" → filter: belongs to exhibition = current exhibition
  "Sum completed order amounts"   → filter: status = completed AND project = current project

Step 2: Find the matching field pair
  ├─ Tables have a Link relationship?
  │   ├─ Link is in source table → source.linkField matches current.primaryField
  │   └─ Link is in current table → source.primaryField matches current.linkField
  ├─ Tables share same-meaning text/number field? → source.field matches current.field
  └─ Also need constant filtering? → AND combination
```

### Which aggregate?

```
How to handle multiple matching records?
├─ Show all values as-is → raw_value (default)
├─ Show deduplicated list → unique
├─ Sum → sum
├─ Average → average
├─ Maximum / minimum → max / min
├─ Count records → counta
└─ Count distinct → unique_counta
```

---

## Section 7: Common Configuration Patterns

> Patterns are categorized by **filter matching method**. Aggregate choice is independent — see Section 4.

### Pattern 1: Aggregate from a linked table (Link is in the source table)

**Scenario**: "Count artworks per exhibition", "Sum order amounts per project"

When the source table has a Link pointing to the current table:

```
Exhibition table: ExhibitionName (primaryField) ← current table
Artwork table: ArtworkName (primaryField), ← source table (Link is here)
                  Exhibition (Link → Exhibition table)
```

```json
{
  "type": "lookup",
  "name": "Artwork Count",
  "from": "Artwork table",
  "select": "ArtworkName",
  "aggregate": "counta",
  "where": {
    "logic": "and",
    "conditions": [
      ["Exhibition", "intersects", { "type": "field_ref", "field": "ExhibitionName" }]
    ]
  }
}
```

### Pattern 2: Reference a linked record's field (Link is in the current table)

**Scenario**: "Show supplier's contact person", "Display warehouse manager"

When the current table has a Link pointing to the source table:

```
Supplier table: SupplierName (primaryField), Contact (Text) ← source table
Inventory table: ProductName (primaryField), ← current table (Link is here)
                 Supplier (Link → Supplier table)
```

```json
{
  "type": "lookup",
  "name": "Supplier Contact",
  "from": "Supplier table",
  "select": "Contact",
  "where": {
    "logic": "and",
    "conditions": [
      ["SupplierName", "intersects", { "type": "field_ref", "field": "Supplier" }]
    ]
  }
}
```

### Pattern 3: Match by same-meaning field (no Link)

**Scenario**: "Sum order amounts per project" (tables share a "ProjectName" field but no Link)

```
Project table: ProjectName (primaryField) ← current table
Order table: OrderID (primaryField), ProjectName (Text), ← source table
               Amount (Number)
```

```json
{
  "type": "lookup",
  "name": "Order Total",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }]
    ]
  }
}
```

### Pattern 4: Dynamic matching + constant filtering

**Scenario**: "Only count completed orders", "Only sum approved budgets"

Combine row-level matching with fixed-value filtering using `logic: "and"`:

```json
{
  "type": "lookup",
  "name": "Completed Order Amount",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["Manager", "==", { "type": "field_ref", "field": "EmployeeName" }],
      ["Status", "==", { "type": "constant", "value": "Completed" }]
    ]
  }
}
```

### Pattern 5: Date filtering with constant value

**Scenario**: "Look up orders created after 2025-01-01", "Sum today's sales"

```json
{
  "type": "lookup",
  "name": "Recent Orders",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }],
      ["CreatedDate", ">=", { "type": "constant", "value": "ExactDate(2025-01-01)" }]
    ]
  }
}
```

---

## Section 8: Anti-Pattern Collection

### Mistake 1: Omitting where (most common)

```json
// Wrong: no where, every row pulls all records
{ "type": "lookup", "name": "Artwork Count", "from": "Artwork table", "select": "ArtworkName", "aggregate": "counta" }

// Correct: where with Link relationship
{ "type": "lookup", "name": "Artwork Count", "from": "Artwork table", "select": "ArtworkName", "aggregate": "counta",
  "where": { "logic": "and", "conditions": [
    ["Exhibition", "intersects", { "type": "field_ref", "field": "ExhibitionName" }]
  ]}}
```

### Mistake 2: Wrong value type — confusing constant vs field_ref

```json
// Wrong: using constant for a dynamic join
["ProjectName", "==", { "type": "constant", "value": "ProjectName" }]

// Correct: use field_ref for dynamic per-row matching
["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }]
```

### Mistake 3: Using `count` instead of `counta`

```json
// Wrong
{ "aggregate": "count" }

// Correct
{ "aggregate": "counta" }
```

### Mistake 4: Wrong case for aggregate values

```json
// Wrong
{ "aggregate": "SUM" }
{ "aggregate": "Sum" }

// Correct — snake_case lowercase
{ "aggregate": "sum" }
{ "aggregate": "average" }
```

### Mistake 5: Nested where conditions

```json
// Wrong: nesting not supported
{ "logic": "and", "conditions": [
  { "logic": "or", "conditions": [...] }
]}

// Correct: only one level
{ "logic": "and", "conditions": [cond1, cond2, cond3] }
```

### Mistake 6: Confusing Lookup with Link

The user says "aggregate order amounts" — use Lookup, not Link. Link establishes relationships; Lookup retrieves and aggregates data.

### Mistake 7: Using object format instead of tuple for conditions

```json
// Wrong: object format
{ "fieldRef": "Status", "operator": "is", "value": { "type": "constant", "value": "Done" } }

// Correct: tuple format [field, operator, value?]
["Status", "==", { "type": "constant", "value": "Done" }]
```

### Mistake 8: Missing `type` field

```json
// Wrong: no type field
{ "name": "Total", "from": "Orders", "select": "Amount", "aggregate": "sum", "where": { ... } }

// Correct: must include type
{ "type": "lookup", "name": "Total", "from": "Orders", "select": "Amount", "aggregate": "sum", "where": { ... } }
```

---

## Section 9: Constraint Summary

- `type` must be `"lookup"` — this field is required in the request body
- `where` is required with at least one condition — always specify a filter
- Conditions use **tuple format**: `[field, operator, value?]` — NOT object format
- Lookup fields are read-only — values cannot be manually set
- Source table and referenced fields must exist before creating the Lookup
- Condition field (first element of tuple) must reference a field in the source table, not the current table
- Where supports only one level of and/or — no nesting
- Aggregate values are snake_case lowercase: `sum`, `counta`, `unique_counta` (NOT `count`)
- Operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `intersects`, `disjoint`, `empty`, `non_empty`
- Table and field names must exactly match `+table-get` output
- `datetime` constant values use string format: `ExactDate(YYYY-MM-DD)` / `ExactDate(YYYY-MM-DD HH:mm)` / `Today` / `Yesterday` / `Tomorrow`
- `select` constant values use option names;
- `link` / `user` constant values use `{id}` object arrays


<a id="s-304dccd7c23aa7ce"></a>

## references/baseline/references/role-config.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Base role permission JSON SSOT

> **入口指南**: [lark-base-role-guide.md](lark-base-0.md#s-caa7a2e6ba29ab15) | **相关命令**: `+role-create` · `+role-update` · `+role-get`

本文档是角色权限 JSON（AdvPermBaseRoleConfig）的单一事实来源（SSOT），供 `+role-create` 和 `+role-update` 构造 `--json` 参数时参考。

## 📋 目录

- [顶层结构 (AdvPermBaseRoleConfig)](#顶层结构-advpermbaseroleconfig)
- [角色类型 (RoleType)](#角色类型-roletype)
- [读取与更新角色](#读取与更新角色)
- [Base 级权限 (BaseRuleMap)](#base-级权限-baserulemap)
- [仪表盘权限 (DashboardRule)](#仪表盘权限-dashboardrule)
- [文档权限 (DocxRule)](#文档权限-docxrule)
- [数据表权限 (TableRule)](#数据表权限-tablerule)
    - [表级权限 (TablePerm)](#表级权限-tableperm)
    - [视图权限 (ViewRule)](#视图权限-viewrule)
    - [字段权限 (FieldRule)](#字段权限-fieldrule)
    - [记录权限 (RecordRule)](#记录权限-recordrule)
    - [筛选条件 (FilterRuleGroup)](#筛选条件-filterrulegroup)
- [默认权限策略与风控规则](#默认权限策略与风控规则)
    - [默认关闭项](#默认关闭项)
    - [权限对象选择](#权限对象选择)
    - [记录操作默认策略](#记录操作默认策略)
    - [field_perms 构造 SOP](#field_perms-构造-sop)
    - [视图权限默认策略](#视图权限默认策略)

---

## 顶层结构 (AdvPermBaseRoleConfig)

```json
{
  "role_name": "财务审核员",
  "role_type": "custom_role",
  "base_rule_map": { "copy": false, "download": false },
  "table_rule_map": { "订单表": { "perm": "edit", "...": "..." } },
  "dashboard_rule_map": { "销售看板": { "perm": "read_only" } },
  "docx_rule_map": { "文档A": { "perm": "edit", "allow_download": true } }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|----|------|
| `role_name` | string | 是  | 角色名称，不能为空 |
| `role_type` | string | 是  | 角色类型，见 [RoleType](#角色类型-roletype) |
| `base_rule_map` | map\<string, bool\> | 是  | Base 级权限，见 [BaseRuleMap](#base-级权限-baserulemap) |
| `table_rule_map` | map\<string, TableRule\> | 否  | 数据表权限，key 为表名 |
| `dashboard_rule_map` | map\<string, DashboardRule\> | 否  | 仪表盘权限，key 为仪表盘名称 |
| `docx_rule_map` | map\<string, DocxRule\> | 否  | 文档权限（仅单品模式），key 为文档名称 |

---

## 角色类型 (RoleType)

| 值 | 说明 |
|------|------|
| `editor` | 系统角色：编辑者 |
| `reader` | 系统角色：阅读者 |
| `custom_role` | 自定义角色 |

**注意**:
- 创建接口（`+role-create`）仅支持 `custom_role`
- 更新接口（`+role-update`）支持  `editor` / `reader` / `custom_role`

---

## 读取与更新角色

- `+role-list` 用于定位角色，返回角色摘要；系统角色和自定义角色都可能出现在列表中。
- `+role-get` 返回完整权限配置。更新前先用它确认当前 `role_name`、`role_type` 和已有权限结构。
- `+role-update` 是 delta merge，只提交需要变更的字段；但 `role_name` 和 `role_type` 仍要带当前值，避免误改角色身份信息。
- `+role-delete` 仅适用于自定义角色；系统角色可以在权限上限内调整配置，但不可删除。

---

## Base 级权限 (BaseRuleMap)

1. 默认值均为 `false`，当需要启用时设置为 `true`。
2. 在新增角色和修改角色时需要默认带上这个字段，**严禁**在用户未明确要求的情况下将其设置为 `true`。

```json
{
  "base_rule_map": {
    "copy": true,
    "download": false
  }
}
```

| Key | 说明 |
|-----|------|
| `copy` | 允许复制多维表格内容 |
| `download` | 允许创建副本、下载、打印多维表格 |

---

## 仪表盘权限 (DashboardRule)

```json
{
  "dashboard_rule_map": {
    "销售看板": { "perm": "read_only" },
    "内部数据": { "perm": "no_perm" }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `perm` | string | 仪表盘权限 |

**perm 可选值**:

| 值 | 说明 |
|----|------|
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限 |

---

## 文档权限 (DocxRule)

> ⚠️ 仅在单品模式（`is_base_solo = true`）下可用。

```json
{
  "docx_rule_map": {
    "文档A": { "perm": "edit", "allow_download": true },
    "文档B": { "perm": "read_only" }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `perm` | string | 是 | 文档权限 |
| `allow_download` | bool | 否 | 是否允许下载/导出 |

**perm 可选值**:

| 值 | 说明 |
|----|------|
| `edit` | 可编辑 |
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限 |

---

## 数据表权限 (TableRule)

```json
{
  "table_rule_map": {
    "订单表": {
      "perm": "edit",
      "view_rule": { "..." : "..." },
      "record_rule": { "..." : "..." },
      "field_rule": { "..." : "..." }
    },
    "用户表": {
      "perm": "read_only"
    }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `perm` | string | 表级权限，见 [TablePerm](#表级权限-tableperm) |
| `view_rule` | ViewRule | 视图权限配置 |
| `record_rule` | RecordRule | 记录权限配置 |
| `field_rule` | FieldRule | 字段权限配置 |

**注意**: 当 `perm` 为 `no_perm` 时，`view_rule`、`record_rule`、`field_rule` 均无须再设置。

---

### 表级权限 (TablePerm)

| 值 | 说明 |
|----|------|
| `manage` | 可管理 |
| `edit` | 可编辑 |
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限（此时不能再设置视图、记录和字段的权限） |

---

### 视图权限 (ViewRule)

```json
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": false,
      "visible_views": ["表格视图", "看板视图"]
    }
  }
}
```

| 字段 | 类型 | 说明                         |
|------|------|----------------------------|
| `allow_edit` | bool | 可新增、删除、修改视图；表权限为 `edit` 时默认为 `true`，表权限为 `read_only` 或用户明确限制时为 `false` |
| `visibility` | object | 可见的视图配置                    |
| `visibility.all_visible` | bool | 是否全部可见                     |
| `visibility.visible_views` | []string | 可见视图名称 列表                  |

**⚠️ 核心规则：`view_rule` 必须同时包含 `allow_edit` 和 `visibility` 两个字段，缺一不可。**

输出 `view_rule` 时，**必须**使用以下完整结构，根据场景选择对应模板：

```json
// 情况 A：表权限为 edit 且用户未明确限制 → allow_edit 默认为 true，全部可见
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": true
    }
  }
}

// 情况 B：表权限为 read_only，或用户明确说不可编辑视图 → 全部可见、不可编辑
{
  "view_rule": {
    "allow_edit": false,
    "visibility": {
      "all_visible": true
    }
  }
}

// 情况 C：用户提及了具体视图 → 仅指定视图可见（allow_edit 仍按 A/B 规则判断）
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": false,
      "visible_views": ["表格视图", "看板视图"]
    }
  }
}
```

**注意**:
- 当 `all_visible` 为 `false` 时，`visible_views` 不可为空，必须指定至少一个可见视图
- `biz_type` 为 `query_form_view` 的视图不可放在 `visible_views` 中（不能配置可见性）

---

### 字段权限 (FieldRule)

```json
{
  "field_rule": {
    "field_perm_mode": "specify",
    "field_perms": {
      "金额": "edit",
      "备注": "read",
      "密码": "no_perm"
    },
    "allow_edit_and_modify_option_fields": [],
    "allow_edit_and_download_file_fields": []
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `field_perm_mode` | string | 字段权限模式 |
| `field_perms` | map\<string, string\> | 字段名 → 权限，仅 `field_perm_mode` 为 `specify` 时有效 |
| `allow_edit_and_modify_option_fields` | []string | 允许增删改选项的字段名列表 |
| `allow_edit_and_download_file_fields` | []string | 允许下载附件的字段名列表 |

**field_perm_mode 可选值**:

| 值 | 说明 |
|----|------|
| `all_edit` | 所有字段可编辑，但选项不可增删改 |
| `all_read` | 所有字段可读 |
| `specify` | 指定字段权限（可进一步设置 `field_perms` 和选项增删改权限） |
| `no_perm` | 无权限 |

**field_perms 中单个字段的权限值**:

| 值 | 说明 |
|----|------|
| `edit` | 可编辑（含新增和阅读权限） |
| `create` | 可新增（含阅读权限） |
| `read` | 可阅读 |
| `no_perm` | 无权限 |

**⚠️ field_perms 重要规则**:
1. 写入前必须先查看字段的 `type`
2. `formula` / `lookup` / `auto_number` 类型字段**必须强制**降级为 `read` 或 `no_perm`，**严禁**设为 `edit`
3. 必须输出除 4 个系统字段外的所有字段
4. `allow_edit_and_modify_option_fields`：仅当用户明确要求"允许增删改选项"时才配置，否则必须为空数组 `[]`。仅支持 `select` 类型字段
5. `allow_edit_and_download_file_fields`：用户没有要求时不要设置，且仅 `field_perm_mode` 为 `specify` 时才能设置

---

### 记录权限 (RecordRule)

```json
{
  "record_rule": {
    "record_operations": ["add"],
    "edit_filter_rule_group": {
      "conjunction": "and",
      "filter_rules": [
        {
          "conjunction": "and",
          "filters": [
            {
              "field_name": "部门",
              "operator": "is",
              "filter_values": ["财务部"]
            }
          ]
        }
      ]
    },
    "other_record_all_read": true
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `record_operations` | []string | 记录操作权限，仅 `TablePerm = edit` 时有效 |
| `edit_filter_rule_group` | FilterRuleGroup | 可编辑记录的筛选条件，范围为所有记录时此字段为空 |
| `other_record_all_read` | bool | 是否可阅读所有记录。都可读时为 `true`，其他情况为 `false` |
| `read_filter_rule_group` | FilterRuleGroup | 可阅读记录的额外筛选规则。仅当可阅读范围与可编辑范围不一致时设置（依赖 `other_record_all_read = false`） |

**record_operations 可选值**:

| 值 | 说明 |
|----|------|
| `add` | 可新增记录 |
| `delete` | 可删除记录 |

---

### 筛选条件 (FilterRuleGroup)

```json
{
  "conjunction": "and",
  "filter_rules": [
    {
      "conjunction": "and",
      "filters": [
        {
          "field_name": "部门",
          "operator": "is",
          "filter_values": ["财务部"]
        }
      ]
    }
  ]
}
```

**FilterRuleGroup 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `conjunction` | string | 逻辑连接词：`and` / `or` |
| `filter_rules` | []FilterRule | 筛选规则数组 |

**FilterRule 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `conjunction` | string | 逻辑连接词，默认 `and` |
| `filters` | []Filter | 筛选条件数组 |

**Filter 结构**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名。仅限 `can_filter` 为 `true` 的字段。若服务端要求当前用户类条件，可按 API 返回结构处理 |
| `operator` | string | 是 | 操作符，见下表 |
| `field_type` | string | 否 | 通常由服务端 filterFiller 补全；Agent 判断字段类型时以 `+field-list` / 字段操作接口的 `type` 为准，常见可筛选类型包括 `select`、`user`、`created_by`、`number` 及部分 `formula` / `lookup` |
| `reference_type` | string | 条件 | 引用类型。`field_type` 为公式或引用字段时必须赋值，其他情况不能赋值 |
| `filter_values` | []string | 条件 | 筛选值。`operator` 为 `isEmpty` / `isNotEmpty` 时不设置，字段类型为 `user` 时也无需设置，其他情况必须设置。值为选项的 `name` |
| `field_ui_type` | string | 条件 | 该字段有值时一定要填 |
| `is_invalid` | bool | 否 | 判断筛选条件是否有效 |

**operator 可选值**:

| 值 | 说明 |
|----|------|
| `is` | 等于 |
| `isNot` | 不等于 |
| `contains` | 包含 |
| `doesNotContain` | 不包含 |
| `isEmpty` | 为空 |
| `isNotEmpty` | 不为空 |
| `isGreater` | 大于 |
| `isGreaterEqual` | 大于等于 |
| `isLess` | 小于 |
| `isLessEqual` | 小于等于 |

**注意**:
- `field_type`、`field_ui_type`、`reference_type` 在创建/更新角色时由服务端 filterFiller 自动补全，客户端通常只需传 `field_name`、`operator`、`filter_values`

---

## 默认权限策略与风控规则

构造角色配置 JSON 时，采用 **默认拒绝与权限最小化** 策略。用户未明确提及的权限一律不开放，不因"合理猜测""常见做法"主动扩展权限范围。

### 默认关闭项

以下能力在用户未明确说明时**默认关闭**：

| 能力 | 默认值 | 开启条件 |
|------|--------|----------|
| 未提及的数据表的任何访问 | `no_perm` | 用户明确提及该表 |
| 仪表盘访问 | 不配置 | 用户明确提及该仪表盘 |
| `base_rule_map.copy` | `false` | 用户明确要求"允许复制" |
| `base_rule_map.download` | `false` | 用户明确要求"允许下载/打印/副本" |

### 默认开启项（条件性）

以下能力在特定条件下**默认开启**，用户明确限制时才排除：

| 能力 | 默认值 | 排除条件 |
|------|--------|----------|
| `record_operations` 中的 `delete` | **包含**（`perm = edit` 时） | 用户明确限制时才排除 |
| `view_rule.allow_edit` | **`true`**（`perm = edit` 时） | 用户明确限制"不可编辑视图"或 `perm = read_only` 时设为 `false` |

---

### Editor / Reader 的权限上限规则
1. 对 Editor 与 Reader，系统允许修改其权限配置，但同时施加以下封顶约束：
2. Reader 的任一权限项 不允许超过「仅可阅读」
3. Reader 不允许拥有任何可编辑、可新增、可删除相关权限; Editor 的权限可被修改，但其能力范围受高级权限能力封顶。

### 权限对象选择

**注意**:
- 仅对用户明确指向的权限对象生成配置（明确提及的表名、仪表盘名，或可解析为唯一对象的指代如"当前表""这张表"）
- **严禁**基于业务常识、岗位职责、名称相似性或其他角色的历史配置推断或扩展权限对象
- 用户未明确提及的对象不生成任何权限配置，视为 `no_perm`

---

### 记录操作默认策略

**注意**:
- 用户未提及时，表权限为 `edit` 时默认同时包含 `add` 和 `delete`，默认不包含 `delete` 的情况仅适用于用户明确限制操作的场景
- 阅读范围默认对齐编辑范围：用户仅描述可编辑范围、未说明阅读范围时，可阅读范围与可编辑范围保持一致，不主动扩大
- 当可读范围与可编辑范围一致时，**不得**生成 `read_filter_rule_group`；应设置 `other_record_all_read = false` 且 `read_filter_rule_group = null`

**⚠️ 记录操作限制**:
1. `perm` 为 `read_only` 时，`record_rule.record_operations` **只能为空**
2. 同步表（`is_sync = true`）**严禁**新增和删除记录

---

### field_perms 构造 SOP

在生成 `field_perms` 时，**严禁**依赖模糊的"继承"概念，必须按以下步骤执行：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1. 基准设定 | `perm = edit` → 全部字段预设 `"edit"`；`perm = read_only` → 全部预设 `"read"` | 基于 `base_table_info` 中的全量字段 |
| 2. 物理降级 | `formula` / `lookup` / `auto_number` 及系统字段 → 强制降级为 `"read"` | 不可变字段严禁设为 `edit` |
| 3. 用户覆盖 | 仅对用户**显式指定**了特定权限的字段应用 `no_perm` / `read` / `create` | 未显式指定的保持基准值 |
| 4. 反筛选误判 | 用于 `filter_rules` 的字段，若基准为 `"edit"` 且用户未要求降级 → **保持 `"edit"`** | 筛选条件不影响字段可编辑性 |
| 5. 筛选依赖兜底 | 出现在 `filter_rules` 中的字段**不允许**遗漏，权限至少为 `"read"` | 最终校验步骤 |

**⚠️ field_perm_mode 选择规则**:
1. 用户以"所有字段""全字段"等整体性表述描述且不要求选项增删改时，**必须**使用 `all_edit` / `all_read`，**严禁**变为逐字段 `specify`
2. 仅在以下情况使用 `specify`：用户明确提出字段级差异需求、不同字段权限目标存在显著差异、或明确要求配置选项增删改权限
3. 系统字段硬性约束导致的自动降级**不视为**差异，不触发 `specify`
4. 对"仅""只能""部分"等约束定语，范围外的字段按定语的反方向设置

**⚠️ 同步表限制**: `is_sync = true` 的表**严禁**设置字段为 `edit` 或 `create`

---

### 视图权限默认策略

**判断流程（必须按顺序执行，命中即停）**:

1. **先判断用户是否提及了具体视图名称**（如"看板视图可见""甘特图不可编辑"等）
  - **是** → `all_visible = false`，`visible_views` 仅包含用户明确提及为"可见"的视图名称（非 viewID）；未提及的视图视为不可见
  - **否**（用户完全未提及任何视图）→ `all_visible = true`
2. `allow_edit` 在表权限为 `edit` 时**默认为 `true`**；仅当用户明确限制"不可编辑视图"时才设为 `false`。设为 `true` 时仍**必须**包含 `visibility` 字段（参考视图权限 情况 A）
3. `all_visible` 为 `false` 时，`visible_views` **不可为空**，必须至少包含一个视图

**❌ 常见错误 — 缺少 `visibility` 字段：**
```json
// 错误！缺少 visibility
{ "view_rule": { "allow_edit": false } }
```
**✅ 正确写法：**
```json
// 即使全部可见，也必须显式写出 visibility
{ "view_rule": { "allow_edit": false, "visibility": { "all_visible": true } } }
```

---

### 字段类型与筛选算子的强约束关系

当字段被用于记录筛选条件时，字段操作接口返回的 `type` 与可用算子存在固定绑定关系：

**`user` / `created_by` 类型字段：**
- 仅允许使用 `contains` 算子
- 不允许使用 `is`、`isNot` 等精确匹配算子
- 这是当前成员匹配模式，筛选条件中无需填写具体成员值；不要在 `filter_values` 中写入姓名或用户 ID

**`select` (`multiple=false`) 类型字段：**
- `is` 与 `isNot` 算子仅允许用于匹配**单一选项**，不得用于多个值
- 当用户表达"字段值等于/不等于某一个具体选项"（如"出勤状态不等于出勤"）时，Agent 必须使用 `is` / `isNot`，且 filter_values 仅包含单一值。
- 当用户表达"字段值等于/不等于多个选项集合"（如"学历不是专科和其他"）时，Agent 必须使用 `contains` / `doesNotContain`，并将多个选项填入 filter_values。
- `contains` / `doesNotContain`中的filter_values可包含多个值，表示或关系

**`select` (`multiple=true`) 类型字段：**
- `is` / `isNot`：filter_values 允许填写多个选项
  - 当 operator = is 且勾选 A、B 时，语义为该字段**同时包含** A 和 B（A&B），不是"等于 A 或等于 B"
  - 当用户表达"包含任一选项"时，除了可以使用 contains 实现外，也可以使用 is 并且配套通过 filter_rules.conjunction = or 实现
- `contains` / `doesNotContain`：用于表达"包含任一选项/不包含任一选项"，filter_values 可填写多个选项（系统按"任一匹配"处理）；若要表达"等于 A 或等于 B"，应拆成多条筛选条件并用「或」组合。

**百分比字段**
- 对于 query 中“数字”的筛选条件时，如果涉及到百分比，要原封不动地还原用户给你的数值（百分比都变成小数）。比如“大于 20%”则变成“大于 0.2”、“xx 率小于 60”则变成“小于 0.6”。

### 被用于筛选的字段的 field_perms 权限强制要求

当某字段（系统字段没有此要求）被用于「满足特定条件的记录」中的筛选条件时，系统将根据当前数据表权限与记录权限，自动施加以下**不可变约束**：

**筛选字段的读写一致性：**
- 若表权限为 edit，且字段类型属于【可编辑字段】，则筛选字段必须保持 edit 权限，除非用户显式要求降级。
- 严禁因为字段被用作筛选条件而将其降级为 read。筛选条件仅要求字段可见，不要求字段只读。

**新增记录时的字段最低权限：**
- 当且仅当记录权限包含「可新增记录」时，字段至少为可新增（create），用于保证在新增记录时筛选条件字段可被正确写入。
- 若当前记录权限为「仅可阅读」，则不触发该约束。

**字段是否可编辑（edit）不作强制要求**，由具体权限方案决定，不属于 infra 强制约束范围。

上述由系统自动施加的字段权限，不可被手动取消或降级。


<a id="s-e927c01324b3f729"></a>

## references/baseline-index.md

# 兼容参考

- [dashboard-block-data-config.md](lark-base-0.md#s-0599e27f974fbb13)
- [formula-field-guide.md](lark-base-0.md#s-89342f7915177b77)
- [lark-base-cell-value.md](lark-base-0.md#s-dbf80ea67b6de62e)
- [lark-base-data-analysis-sop.md](lark-base-0.md#s-ef02569265f3b5e9)
- [lark-base-data-query-guide.md](lark-base-0.md#s-83f069c00afa7c28)
- [lark-base-field-json.md](lark-base-0.md#s-c9357194c4e173e0)
- [lark-base-record-batch-create.md](lark-base-0.md#s-94c4af10ef29c531)
- [lark-base-record-batch-update.md](lark-base-0.md#s-fc4edd6bd72475fb)
- [lark-base-record-upsert.md](lark-base-0.md#s-7734410c1771f0a7)
- [lark-base-role-guide.md](lark-base-0.md#s-caa7a2e6ba29ab15)
- [lark-base-workflow-guide.md](lark-base-0.md#s-38ac803292b70568)
- [lookup-field-guide.md](lark-base-0.md#s-e82ab9ada91ec1e6)
- [role-config.md](lark-base-0.md#s-304dccd7c23aa7ce)


<a id="s-4970f49b7b7e8c10"></a>

## references/lark-base-advanced-permission-and-role.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Advanced Permission 与 Role

This is the module entry point for Base advanced permissions and roles. Use it to choose commands and understand safety boundaries. For the permission JSON itself, use [Role Permission Schema](lark-base-0.md#s-f85fbe39690db5ce).

## Command selection

| Goal | Command | Notes |
|------|---------|-------|
| Check advanced permission status | `+base-get` | Read `data.base.is_advanced`. There is no `+advperm-get` command. |
| Enable advanced permissions | `+advperm-enable` | Required before creating or updating roles. Caller must be a Base admin. |
| Disable advanced permissions | `+advperm-disable` | High-risk write. Disabling invalidates existing custom roles. |
| Locate roles | `+role-list` | Returns role summaries. Use `+role-get` for full config. |
| Inspect one role | `+role-get` | Use before updating a role or deciding whether a role can be deleted. |
| Create a custom role | `+role-create` | Supports `custom_role` only. Read [Role Permission Schema](lark-base-0.md#s-f85fbe39690db5ce) before constructing `--json`. |
| Update a role | `+role-update` | Delta merge. Read current config first, then send only intended changes. |
| Delete a role | `+role-delete` | Custom roles only. System roles cannot be deleted. |

## Required order

At the start of a role workflow, before the first `+role-list`, `+role-get`, `+role-create`, `+role-update`, or `+role-delete` call:

1. Run `lark-cli base +base-get --base-token <base_token>` and inspect `data.base.is_advanced`.
2. If `is_advanced` is `false`, run `+advperm-enable` before the role command. If the user did not authorize enabling advanced permissions, stop and explain the required precondition.
3. Run the requested role commands only after `is_advanced` is `true` or `+advperm-enable` succeeds. Reuse that confirmed status for later role calls in the same workflow.

Do not probe with `+advperm-get`: that command is not supported. Do not use an empty `+role-list` response to infer the advanced permission status; a disabled Base can also return an empty list.

## Safety boundaries

- Role operations require advanced permissions to be enabled and the caller to be a Base admin.
- `+role-create` creates custom roles only.
- `+role-delete` is only for custom roles. System roles such as editor/reader can be configured within supported limits, but cannot be deleted.
- `+role-update` uses delta merge: omitted fields remain unchanged, but identity fields such as `role_name` and `role_type` should match the current target role.
- `+advperm-disable` invalidates existing custom roles; confirm the target Base and user intent before passing `--yes`.

## Common Fewshots

Use these fewshots for simple role changes. For table, field, record, dashboard, docx, or filter permission details, switch to [Role Permission Schema](lark-base-0.md#s-f85fbe39690db5ce).

Create a custom role that keeps copy/download disabled:

```text
lark-cli base +role-create \
  --base-token <base_token> \
  --json '{"role_name":"Reviewer","role_type":"custom_role","base_rule_map":{"copy":false,"download":false}}'
```

Rename a role while preserving its type:

```text
lark-cli base +role-update \
  --base-token <base_token> \
  --role-id <role_id> \
  --json '{"role_name":"Finance Reviewer","role_type":"custom_role"}' \
  --yes
```

Grant read-only access to one table:

```text
lark-cli base +role-update \
  --base-token <base_token> \
  --role-id <role_id> \
  --json '{"role_name":"Finance Reviewer","role_type":"custom_role","table_rule_map":{"Orders":{"perm":"read_only"}}}' \
  --yes
```

## JSON SSOT

Use [Role Permission Schema](lark-base-0.md#s-f85fbe39690db5ce) for:

- `AdvPermBaseRoleConfig` top-level structure.
- `base_rule_map`, `table_rule_map`, `dashboard_rule_map`, and `docx_rule_map`.
- Table, view, field, record, dashboard, and docx permission values.
- Filter permission JSON.
- Default permission strategy and risk rules.


<a id="s-ed634f84db63916f"></a>

## references/lark-base-app-block-data-config.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# BaseApp Block `data_config`

本文件说明 BaseApp 组件 `data_config` 的 CLI 映射与操作约束，不复制完整字段 Schema。App 图表的每个 `data_sources[]` 元素复用 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 的字段取值、筛选、分组、排序及规范化规则；区别是 Dashboard 使用扁平单数据源结构，而 App 图表在顶层使用共享的 `base_token` 和多数据源 `data_sources[]`。列表组件是 App 独有协议，不复用 Dashboard 图表结构。本文所称“组件协议”是指 CLI 随版本发布的 API 元数据、本文明确列出的约束及实际服务端校验结果。

## 类型映射

- 图表：`--type column|bar|line|pie|ring|area|combo|scatter|funnel|wordCloud|radar|statistics`
- 富文本：`--type text`（与 Dashboard 文本组件同名同义）
- 列表：`--type list --sub-type standard|grouped|collapsible|card|detail`
- 列表省略 `--sub-type` 时默认 `standard`
- `type/sub_type` 创建后不可修改

## 外层请求字段

- Create 只发送 `name`、`type`、按需发送的 `sub_type` 和 `data_config`。`name`、`type` 必填；图表和列表的 `data_config` 必填，富文本可省略。
- 标准列表未显式指定 `--sub-type` 时，不发送 `sub_type`，由服务端使用 `standard` 默认值；其他列表类型必须发送对应 `sub_type`。
- 图表和富文本不得发送 `sub_type`。
- Update 只发送 `name`、`data_config`，且至少提供一个；未传字段保持不变，不允许修改 `type`、`sub_type`。
- 布局、位置、尺寸、`show_title` 等展示配置不属于本期公开 Create/Update 请求字段，CLI 不提供或提升这些字段。

## 列表配置

列表公共数据源字段为单值 `base_token` 和 `table_name`。每个列表最多关联一个 Base，且该 Base 必须位于 App 所在的同一 Workspace。

按组件协议，各 subtype 使用以下字段组：

- 公共：`base_token`、`table_name`、`filter`、`sort_by`
- `standard/grouped/collapsible`：`columns`、`group_by`
- `card`：`fields`、`card_config`
- `detail`：`fields`、`detail_config`
- `columns` 和 `fields` 都是可选字段。未指定时 CLI 不发送，由服务端使用产品默认字段。
- 只有用户显式指定 `columns` / `fields` 时才发送；显式传 `[]` 表示明确发送空数组，不能作为默认值自动补入。
- `filter`、`sort_by`、`group_by`、`card_config`、`detail_config` 也都是可选字段；未指定时不发送。
- 列表 Create 的 `data_config` 必填，其中只有 `base_token` 和 `table_name` 是顶层必填字段。
- 可选对象一旦传入，其内部必填项仍须满足协议，例如 `filter` 必须包含 `conjunction` 和 1～50 项 `conditions`。

不要添加协议未定义的语义校验，尤其不要假设：

- detail/card 必须有 title；
- grouped/collapsible 必须或只能有一个 group_by；
- fields 存在 role 或 visible 属性。

未知顶层字段会被本地校验拒绝；只有确认 CLI 校验与最新协议不一致时才使用 `--no-validate`。

## 创建示例

```text
lark-cli base +app-block-create \
  --app-token <app_token> --page-id <page_id> \
  --name "订单列表" \
  --type list --sub-type standard \
  --data-config '{"base_token":"<base_token>","table_name":"订单"}'
```

字段的具体对象结构与必填性以 CLI 当前版本的 API 元数据和服务端校验结果为准，不在这里猜测未公开属性。

## 更新语义

下面是只更新顶层 `filter` 的示例，适用于协议将 `filter` 定义在 `data_config` 顶层的组件（所有列表 subtype 均可使用）。组件类型在创建后不可修改，所以 update 命令不再传 `--type`。App 图表的 `filter` 定义在对应的 `data_sources[]` 元素中；更新图表筛选时必须按图表结构传入完整 `data_sources`，不能把 `filter` 提到顶层。

```text
lark-cli base +app-block-update \
  --app-token <app_token> --page-id <page_id> --block-id <block_id> \
  --data-config '{"filter":{"conjunction":"and","conditions":[{"field_name":"状态","operator":"is","value":"已完成"}]}}'
```

- CLI 只发送用户显式传入的字段。
- 未传字段由服务端保持不变。
- 不为 update 注入 create 默认值，不先读取后拼成全量配置。
- 数组/对象字段的替换粒度以组件协议和服务端校验结果为准。

## 图表与富文本

**App 图表是多数据源结构（`ChartDataConfig`），与 Dashboard 的扁平单源结构不同。** 顶层用一个 `base_token`（所有数据源共用），`table_name` / `series` / `count_all` / `group_by` / `filter` 下沉到每个 `data_sources[]` 元素里；顶层另有可选的 `data_source_mode` 和 `sort`。每个数据源内部各字段的取值逻辑与 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 完全一致（`series[].rollup` 大写、`group_by[].sort` 小写等），CLI 对每个 `data_sources[]` 元素复用同一套规范化与校验。富文本使用 `--type text`，配置为 `{"text":"..."}`，无数据源；Create 时可省略 `data_config`，等价于空文本。

> **text 内容怎么取**：text 组件没有 `/data` 接口，走 `+app-block-get-data` 会被服务端兜底成通用 500。改用 `+app-block-get --block-id <widget_id>` 直接读 `data_config.text`（Markdown 原文）。图表仍走 `+app-block-get-data --block-id <chart_token>`。

顶层参数：

| 参数 | 必填 | 取值 | 说明 |
|-|-|-|-|
| `base_token` | 是 | `string` | 数据所在 Base 的 token；所有数据源共用同一个值。App 命令不带 `--base-token`，只能写在 data_config 内 |
| `data_sources` | 是 | `ChartDataSourceConfig[]` | 有序数组，至少一项 |
| `data_source_mode` | 否 | `aggregate` / `compare` | `aggregate`（默认）在横轴聚合数据源；`compare` 按数据源拆分系列 |
| `sort` | 否 | `{type: group\|value\|record, order?: asc\|desc}` | 顶层排序；`statistics` 不允许 |

每个 `data_sources[]` 元素：`table_name`（必填）、`series` 与 `count_all=true` 二选一、`group_by`（最多 2 项，`statistics` 不允许）、`filter`。

```json
{
  "base_token": "example-token",
  "data_sources": [
    {
      "table_name": "数据表",
      "count_all": true,
      "group_by": [
        { "field_name": "文本", "mode": "integrated", "sort": { "type": "value", "order": "desc" } }
      ]
    }
  ]
}
```

对应命令（单数据源计数柱状图）：

```text
lark-cli base +app-block-create \
  --app-token <app_token> --page-id <page_id> \
  --name "文本分布" --type column \
  --data-config '{"base_token":"example-token","data_sources":[{"table_name":"数据表","count_all":true,"group_by":[{"field_name":"文本","mode":"integrated","sort":{"type":"value","order":"desc"}}]}]}'
```

多数据源示例（两张表各出一条系列，按数据源拆分）：

```text
lark-cli base +app-block-create \
  --app-token <app_token> --page-id <page_id> \
  --name "销售与成本" --type combo \
  --data-config '{"base_token":"bas_xxx","data_source_mode":"compare","data_sources":[{"table_name":"销售表","group_by":[{"field_name":"月份","sort":{"type":"group","order":"asc"}}],"series":[{"field_name":"销售额","rollup":"SUM"}]},{"table_name":"成本表","group_by":[{"field_name":"月份","sort":{"type":"group","order":"asc"}}],"series":[{"field_name":"成本","rollup":"SUM"}]}],"sort":{"type":"group","order":"asc"}}'
```

Update 语义：传入 `data_sources` 即全量替换整个有序数组；修改 `base_token` 时必须同时传入完整 `data_sources`。请求不得包含 `sub_type`（平滑/堆积/百分比等展示变体走产品默认值）。布局、位置、尺寸和展示配置不属于本期公开 Create/Update 协议。其他请求字段以 CLI 当前版本的 API 元数据和服务端校验结果为准。


<a id="s-4e3b1d6f0fda0ea4"></a>

## references/lark-base-app.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# BaseApp（应用模式）操作指引

> 先读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流）。接口和组件字段以 CLI 当前版本的 API 元数据、[组件配置 reference](lark-base-0.md#s-ed634f84db63916f) 和服务端校验结果为准；不要从组件名称推断额外约束。

## 不支持能力：先判断并停止

### 复制 BaseApp

本期没有 BaseApp 复制命令。用户要复制或克隆既有 BaseApp 时，直接说明当前 CLI 无法完成并停止；不要继续探索浏览器、OpenAPI 或创建类命令等替代通道，也不要发起任何写请求。

- `+base-copy` 只支持 Base，不支持 BaseApp；不得向它传入 `app_token`，也不得把复制出的 Base 描述为应用副本。
- `+app-create` 只创建全新空 BaseApp，不复制既有页面和组件。
- 不要使用 Drive copy 或其他 Base shortcut 拼装、模拟或冒充 BaseApp 复制。

### 创建或归属 PageGroup

当前第一阶段的页面层级能力只支持顶级 Page 节点。PageGroup 的创建、归属设置，以及把现有 Page 移入页面组均不支持。

最终答复必须同时说明上述正向支持范围和负向限制，不能只说 PageGroup 不支持。用户命中这些诉求时，直接说明当前 CLI 无法完成并停止；不要继续探索浏览器、OpenAPI 或普通 Page 命令等替代通道，也不要读取页面后声称能完成分组或发起任何写请求。

### 从 Workspace 移出或移除资源

当前 CLI 只支持用 `+workspace-move-in` 把 Base 或 BaseApp 移入 Workspace，不支持从 Workspace 移出或移除资源，也没有 `workspace move-out` / `workspace remove` 命令。这类请求必须先完成只读定位，再说明限制并停止，顺序不可调换：

1. Workspace URL 含 `/base/workspace/<workspace_token>` 时，提取其中的真实 `workspace_token`，不要把完整 URL 当作命令参数。
2. 在同一轮立即执行 `lark-cli base +workspace-entity-list --workspace-token <workspace_token> --page-size 30 --as user`；若 `has_more=true`，继续分页直到完整。该查询是必要的只读定位步骤，不要把它留成等待用户再次选择的可选项，也不要用 `--help` 代替真实查询。
3. 用服务端返回的 `entities[].name`、`entity_type`、`token` 和 `url` 忠实判断目标。名称完全匹配时报告真实对象；没有完全匹配时明确说明不存在精确同名实体，并原样列出可能相关的候选。不得自动去掉或补齐前后缀，也不得仅凭名称相似就声称已经定位目标。用户直接给出 token 时仍要忠实报告该 token 对应的实际名称。
4. 定位结果报告完后，明确说明当前 CLI 无法执行 Workspace 移出/移除，并停止，不要发起任何写请求。用户在任一步骤中取消时立即停止，取消后不再调用工具。

`lark-cli drive +move` 只改变 Base 或 BaseApp 在云盘中的目录位置，不改变其 Workspace 归属，不能作为移出 Workspace 的替代方案。不要继续探索 Drive move/delete、另一个 Workspace 的 `+workspace-move-in`、浏览器、OpenAPI 或源码来拼装或冒充该操作；只有用户后续明确提出另一项受支持的操作时，才执行新的写入。

## Token 与命令

| 对象 | 标识 | 命令 |
|---|---|---|
| Workspace | `workspace_token` | `+workspace-create` / `+workspace-entity-list` / `+workspace-move-in` |
| BaseApp | `app_token` | `+app-create/get`；重命名和删除见下方 |
| Base | `base_token` | `+base-create` 返回；表、字段、记录命令使用它 |
| Page | `page_id` | `+app-page-list/get/create/update/delete` |
| Block | `block_id` | `+app-block-list/get/create/update` |

页面和组件命令使用 `app_token`；Base 数据命令使用 `base_token`。`+app-block-get-data` 使用 `app_token + base_token + chart_token`：CLI 参数名仍为 `--block-id`，但必须传组件返回的 `chart_token`，不能传普通 `block_id`。请求路径与仪表盘图表数据接口相同。

BaseApp / AppMode 是 Base 域能力。用户提供 `/app/` 链接时，先用 `+url-resolve`；它会返回 `app_token`，并忠实提取链接实际携带的 `workspace_token` 与 `page_id`。直接使用本指引和 `lark-cli base +...`，不要先尝试 `lark-cli apps`。

## 查询应用

```text
lark-cli base +app-get --app-token <app_token>
```

- 没有 `lark-cli base +app-list`。需要列出某个 Workspace 内的 BaseApp 时，唯一列表入口是：

  ```text
  lark-cli base +workspace-entity-list \
    --workspace-token <workspace_token> \
    --type baseapp \
    --page-size 30
  ```

- 响应中的 `pages` 是页面摘要。
- `ref` 的结构是 `Base token -> 当前组件引用的 Table 名称数组`。需要操作被引用 Base 时，使用 `ref` 的 key 作为 `base_token`。
- `ref` 只描述当前组件已经引用的数据源；没有被组件引用的 Base 不会出现在其中。

## 查询页面与组件

```text
lark-cli base +app-page-list --app-token <app_token> --page-size 100
lark-cli base +app-block-list \
  --app-token <app_token> \
  --page-id <page_id> \
  --page-size 100
```

- `+app-get` 已返回足够的页面摘要时，可直接取得目标 `page_id`；需要完整页面目录或分页确认时再用 `+app-page-list`。
- `+app-page-list` 返回的某个 Page 若 `name` 为空字符串，表示当前用户对该 Page 无权限，不表示 Page 没有标题。报告该权限状态，不要将其 `page_id` 用于后续页面或组件读写。
- 只需列表摘要时不要逐个调用 `+app-block-get` 复核；仅在用户需要单个组件详情时使用 get。
- `+app-block-list` 返回 `type=unsupported` 的组件时，只能通过列表摘要识别它的存在。当前 CLI 不支持读取详情、读取计算数据或修改此类组件；不要调用 `+app-block-get`、`+app-block-get-data` 或 `+app-block-update`，这些请求会报错。

## 创建 Workspace

```text
lark-cli base +workspace-create \
  --name "AppMode-空白评测空间" \
  --as user
```

## 创建应用

```text
lark-cli base +app-create \
  --name "销售应用" \
  --workspace-token <workspace_token> \
  --as user
```

- `+app-create` 没有 `--base-token`。
- `--workspace-token` 必填；`+app-create` 只调用 App 创建接口，不创建 Workspace、Base，也不移动资源。
- `--theme-style` 可选，支持 `default|cloudBlue|fresh|softLight|future|technology`。
- 记录输出中的 `app_token` 和 `workspace_token`。

### 新建应用的默认 Page 复用

`+app-create` 会同时生成一个系统默认 Page，但创建响应不返回它的 `page_id`。用户未明确要求其他页面结构时，创建 App 后先读取应用取得该 Page，将其重命名并直接用作用户所需的第一个页面；不要用 `+app-page-create` 另建第一个页面：

```text
lark-cli base +app-get --app-token <app_token> --as user
lark-cli base +app-page-update \
  --app-token <app_token> \
  --page-id <default_page_id> \
  --name "<page_name>" \
  --as user
```

在上述默认流程中，随后在这个 Page 上**逐个串行**执行 `+app-block-create`，同一 Page 的多个组件不得并发创建。只有用户确实需要额外页面时，才在复用默认 Page 之后调用 `+app-page-create`。用户明确要求保留默认 Page、另建独立页面或采用其他页面结构时，按用户要求处理。

若 `+app-get` 暂时没有返回默认 Page，重新执行 `+app-get` 或 `+app-page-list` 获取它，不要创建替代 Page。若创建组件返回布局重叠，先停止同页的其他并发写入，用 `+app-block-list` 确认已成功组件，再留在原 Page 上串行重试失败步骤；不要通过新建 Page、删除默认 Page 或整页重建来规避冲突。

### 创建应用的自然语言编排

先根据用户是否指定 Workspace 和现有 Base 选择流程，再调用原子 shortcut：

| 用户提供的信息 | 执行流程 |
|---|---|
| Workspace + 现有 Base | 确认 Base 位于该 Workspace → `+app-create`；不创建备用 Base |
| Workspace，未指定 Base | `+app-create` → `+base-create` 创建空 Base → `+workspace-move-in` |
| 未指定 Workspace，指定现有 Base | 先确认该 Base 所属 Workspace；能确定时在该 Workspace 执行 `+app-create`，不能确定时请用户提供 Workspace；不创建备用 Base |
| Workspace 和 Base 都未指定 | `+workspace-create` → `+app-create` → `+base-create` 创建空 Base → `+workspace-move-in` |

应用模式的列表组件只能引用同一 Workspace 内的一个 Base。用户指定现有 Base 时，不要因为 `+app-create` 没有接收 `base_token` 就额外创建 Base；后续在组件 `data_config.base_token` 中引用该 Base。

多步编排中，每个成功的 shortcut 都会立即产生资源且不自动回滚。后续步骤失败时，明确报告已经成功创建的 Workspace、App 或 Base 及其 token；用户要求继续时，只重试失败步骤，不要重复创建已经成功的资源。

## 读取图表计算结果

```text
lark-cli base +app-block-get-data \
  --app-token <app_token> \
  --base-token <base_token> \
  --block-id <chart_token>
```

- `--block-id` 的值必须取图表组件摘要中的 `chart_token`，不能使用组件的普通 `block_id`。
- `base_token` 使用当前图表组件 `data_config.base_token`；一个 App 引用多个 Base 时，不要从 `+app-get ref` 中任意选择一个 key。
- `page_id` 不参与请求。
- 返回协议与 `+dashboard-block-get-data` 完全一致。

## 重命名应用

```text
lark-cli drive files patch \
  --file-token <app_token> \
  --type bitable \
  --data '{"new_title":"新名称"}'
```

BaseApp 与 Base 在 Drive 文件接口中都使用 `type=bitable`。`new_title` 只更新应用标题，不会重命名它引用的 Base，也不会修改 Page 或 Block。

## 删除应用

```text
lark-cli drive +delete --file-token <app_token> --type bitable --yes
```

- 删除 BaseApp 应用本体需要切到 `lark-drive`。
- BaseApp 与 Base 在 Drive 删除接口中都使用 `--type bitable`；删除 BaseApp 时 `--file-token` 传 `app_token`。
- 这是高风险写操作；执行前先确认 `app_token` 来自 `+app-get` 或 `+workspace-entity-list`。

## Page

### 本期不支持的 Page 能力

Page 复制和页面图标均不在本期范围。用户提出复制 Page、复制页面、克隆页面、沿用页面图标、设置或修改页面图标等需求时：

1. 明确说明当前 CLI 不支持该能力，并确认本次没有执行任何写入。
2. 不得调用 `+app-page-create` 冒充完整复制；空 Page 不包含原 Page 的内容、组件或图标。
3. 不得尝试使用其他 shortcut 拼装、模拟或声称完成 Page 复制或图标设置。
4. 在最终答复中将以下替代能力单独成段说明，但不要自动执行：

   > 可用替代能力（本次未执行）：当前 CLI 可以新建一个空 Page，但不会复制原 Page 的内容、组件或图标。如需新建空 Page，请明确告诉我。

只有用户后续明确要求新建空 Page，才可以调用 `+app-page-create`。

```text
lark-cli base +app-page-list --app-token <app_token>
lark-cli base +app-page-create --app-token <app_token> --name "总览"
lark-cli base +app-page-update --app-token <app_token> --page-id <page_id> --name "经营总览"
lark-cli base +app-page-delete --app-token <app_token> --page-id <page_id> --yes
```

- 对新建 App，用户未明确要求其他页面结构时，必须按[新建应用的默认 Page 复用](#新建应用的默认-page-复用)将系统默认 Page 用作用户所需的第一个页面；`+app-page-create` 只用于用户要求的额外页面。
- 同一 App 内 Page 名称必须唯一。创建或更新名称前，CLI 会读取页面列表；更新时排除当前 Page。
- 同一 Page 内组件名称必须唯一。`+app-block-create` 会分页读取该 Page 的全部组件并在创建前检查重名。
- 本期没有 Page arrange，也没有 Block delete；Block 的 `type/sub_type` 创建后不可修改。详见[本期不支持的能力](#本期不支持的能力)。

## 本期不支持的能力

下列能力本期不存在。用户提出时，直接说明不支持并给出可选的替代方向，不要用 Dashboard 或其他域的同名能力顶替。

| 用户诉求 | 本期状态 | 正确动作 |
|---|---|---|
| 自动排版 / 重新布局 / 美化页面组件 | 没有 App page arrange | 直接告知不支持；不要调用 `+dashboard-arrange` |
| 删除页面组件 | 没有 App block delete | 直接告知不支持，只能在 UI 处理；不要调用 `+dashboard-block-delete` |
| 修改组件位置 / 大小 / 置顶 | 布局、位置、尺寸不属于公开 Create/Update 协议 | 直接告知不支持；不要用 `+app-block-update` 做空更新伪装成移动 |
| 修改已有组件的 `type/sub_type` | `type/sub_type` 创建后不可修改 | 先读取当前 Block；无论是否已为目标类型，最终答复都要说明此约束。已匹配时说明无需写入；不匹配时说明只能在 UI 处理；不得调用或承诺用 `+app-block-update` 修改类型 |
| 修改已存在 App 的主题 | `--theme-style` 只在 `+app-create` 时生效 | 直接告知不支持；如确有必要，说明只能新建 App 时指定主题 |
| 读取或修改 `type=unsupported` 的组件 | 列表仅用于识别该组件存在，详情读取、计算数据读取和修改均不支持 | 直接告知不支持；不要调用 `+app-block-get`、`+app-block-get-data` 或 `+app-block-update`，这些请求会报错 |

`+dashboard-*` 命令只作用于 Base 内的仪表盘，`dashboard_id` 是 `blk` 开头、组件 ID 是 `cht` 开头；AppMode 的 `pge` 页面和 `wgt` 组件不属于它们的作用域。缺少能力时不要用这些命令试探，包括 `--help` 和 `--dry-run`：一次调用就是一次错误的能力归属判断。

## 列表组件

创建列表时使用 `--type list` 与 `--sub-type standard|grouped|collapsible|card|detail`。省略 `--sub-type` 时默认 `standard`。

```text
lark-cli base +app-block-create \
  --app-token <app_token> \
  --page-id <page_id> \
  --name "待处理订单" \
  --type list \
  --sub-type standard \
  --data-config '{"base_token":"<base_token>","table_name":"订单"}'
```

- `data_config.base_token` 是单值：每个列表最多选择一个 Base。
- Base 必须在当前 App 的同一个 Workspace；CLI 写入前校验。
- 完整字段协议读 [lark-base-app-block-data-config.md](lark-base-0.md#s-ed634f84db63916f)。

## 更新组件

`+app-block-update` 只发送显式传入的 `data_config` 字段。未传字段保持不变；数组或对象字段是否整体替换，以[组件配置 reference](lark-base-0.md#s-ed634f84db63916f)和服务端校验结果为准。不要为了“补全”先读取并提交全量配置。

## 常见恢复

| 现象 | 动作 |
|---|---|
| `status=partial` | 告知已完成/失败步骤；用户要求继续时执行 `retry.command` |
| Page 重名 | 先 `+app-page-list`，选择唯一名称后重试 |
| 组件重名 | 先 `+app-block-list`，为该 Page 内的新组件选择唯一名称后重试 |
| 列表 Base 不在同一 Workspace | 用 `+workspace-entity-list` 核对；选择同 Workspace Base |
| 列表协议校验失败 | 读取组件协议文档；不要推断 title、group_by 数量或 field role |
| Block 类型选错 | 本期无法删除且类型不可改，只能在 UI 处理后重新创建 |
| 用户要 arrange / 删组件 / 调位置 / 改主题 | 按[本期不支持的能力](#本期不支持的能力)直接告知不支持；不要改用 `+dashboard-*` 命令 |


<a id="s-3eefa08fb4cd6f56"></a>

## references/lark-base-dashboard-block-config.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Dashboard Block 配置

Block 的 `data_config` 字段因 `type` 不同而变化。本文档是 Dashboard block 扁平单数据源 `data_config` 的单一事实来源（SSOT），包含组件类型、字段结构、筛选格式、约束和可复制模板。BaseApp 图表的外层结构不同，但每个 `data_sources[]` 元素复用本文的字段取值、筛选、分组、排序及规范化规则；创建或更新 App 组件时，还必须读取 [BaseApp Block data_config](lark-base-0.md#s-ed634f84db63916f) 了解共享 `base_token`、多数据源封装，以及 App 独有的列表组件协议。

## 支持的组件类型（`type` 枚举）

| type 值 | 说明 |
|---------|------|
| `column` | 柱状图 |
| `bar` | 条形图 |
| `line` | 折线图 |
| `pie` | 饼图 |
| `ring` | 环形图 |
| `area` | 面积图 |
| `combo` | 组合图 |
| `scatter` | 散点图 |
| `funnel` | 漏斗图 |
| `wordCloud` | 词云 |
| `radar` | 雷达图 |
| `ranking` | 排行榜 |
| `statistics` | 指标卡 |
| `nps` | NPS 图 |
| `text` | 文本（支持 Markdown） |

## 字段类型与操作符速查（AI 决策用）

> 先用 `+field-list` / `+field-get` 确认字段 `type`；本节使用当前字段接口里的 canonical 类型名：`number`、`text`、`select`、`datetime`、`checkbox`、`user`。NPS 使用的 `Rating` 是 Dashboard 服务端识别的评分字段语义，不属于当前字段操作符速查里的通用筛选类型。

```
text: is, isNot, contains, doesNotContain, isEmpty, isNotEmpty
number: is, isNot, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty
select（multiple=false）: is, isNot, isEmpty, isNotEmpty
select（multiple=true）: is, isNot, contains, doesNotContain, isEmpty, isNotEmpty
datetime: is, isGreater, isLess, isEmpty, isNotEmpty
checkbox: is (value: true/false)
user / created_by / updated_by: is, isNot, isEmpty, isNotEmpty
```

`isGreaterEqual` / `isLessEqual` 不是全局不支持：它们可用于 `number`，但不能用于 `datetime` / `created_at` / `updated_at`。日期范围必须用 `isGreater` / `isLess` 配合 `ExactDate`；不要把数字字段的操作符集合套到日期字段上。

## data_config 通用结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `table_name` | string | 关联数据表名称 |
| `series` | `[{ "field_name": "xxx", "rollup": "SUM" }]` | 指标/Y 轴（与 `count_all` 二选一）。rollup 支持 `SUM` / `MAX` / `MIN` / `AVERAGE` |
| `count_all` | boolean | COUNTA 聚合，统计所有记录数（与 `series` 二选一） |
| `group_by` | `[{ "field_name": "xxx", "mode": "integrated", "sort": {...} }]` | X 轴分组维度。`mode` 和 `sort` 的要求因组件类型而异，见下方说明 |
| `filter` | object | 筛选条件 |
| `filter.conjunction` | `"and"` / `"or"` | 筛选逻辑 |
| `filter.conditions` | `[{ "field_name", "operator", "value" }]` | 筛选条件数组，value 类型因字段类型而异（见下方 filter 格式规则） |
| `category_range` | `[min, detractorMax, passiveMax, max]` | NPS 三段边界，仅 `nps` 类型支持；首尾必须等于 Rating 字段量程，首尾匹配由服务端按字段元数据校验 |

### text 类型特殊结构

`text` 类型组件用于展示富文本内容，**不需要数据源配置**（无 `table_name`、`series`、`group_by`、`filter`）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | **必填**。支持 Markdown 语法，详见下方说明 |

**支持的 Markdown 语法：**

| 语法 | 示例 | 效果 |
|------|------|------|
| 一级标题 | `# 标题` | 大标题 |
| 二级标题 | `## 标题` | 中标题 |
| 三级标题 | `### 标题` | 小标题 |
| 加粗 | `**文字**` | **文字** |
| 斜体 | `*文字*` | *文字* |
| 删除线 | `~~文字~~` | ~~文字~~ |
| 有序列表 | `1. 项目` | 1. 项目 |
| 无序列表 | `- 项目` | - 项目 |

> **注意**：以上未提及的 Markdown 语法（如链接、图片、代码块、表格等）均不支持。

## group_by 详细说明

### mode 枚举

| mode | 含义 | 适用场景 |
|------|------|----------|
| `integrated` | 聚合分组（默认） | 绝大部分场景，按字段值分组统计 |
| `enumerated` | 多值拆分统计 | 多选、人员等多值字段，将每个选项/人员拆开独立统计 |

> 多选、人员等多值字段默认用 `enumerated`；其他字段默认用 `integrated`。

### sort 排序

| sort.type | 含义 | 典型场景 |
|-----------|------|----------|
| `group` | 按横轴值排序 | 按月份升序、按品类名字母序 |
| `value` | 按纵轴值排序 | 按销售额从大到小 |
| `view` | 按数据源记录顺序 | 保持原表行序（不常用） |

`sort.order`：`asc`（升序）/ `desc`（降序）

只要写 `sort` 对象，就需要明确排序方向。CLI 会把 `sort.type` 为 `group` 或 `view` 且缺少 `order` 的情况规范化为 `order:"asc"`；`sort.type:"value"` 必须显式写 `order:"asc"` 或 `order:"desc"`，因为指标值排序方向会改变业务含义。

如果表中行序就是业务顺序，首次创建 block 时就一次性设置 `sort:{"type":"view","order":"asc"}` 保留行序，避免创建后再二次更新排序条件。

### ranking 排行榜专属契约

排行榜只支持一个分组和一个指标，公开字段固定为 `table_name`、`series`/`count_all`、`group_by`、`filter`、`limit_size`：

- `group_by` 必填且长度严格为 1；`mode` 仅支持 `integrated` / `enumerated`。
- `series` 长度严格为 1，且与 `count_all:true` 二选一；`rollup` 仅支持 `SUM` / `MAX` / `MIN` / `AVERAGE`。
- 排序只写在 `group_by[0].sort`，`type` 只能为 `value`，`order` 为 `asc` / `desc`。创建时省略排序默认按指标值降序。
- `limit_size` 是 Top N，取值为 `1..500` 的整数，创建时省略默认 `10`。
- 不支持顶层 `sort`、公开 `ranking` 对象或头像开关。

更新 `ranking` 时，`data_config` 是顶层 patch：只传 `limit_size` 只改 Top N；只传 `group_by` 只替换唯一分组和排序；只传 `series` 或 `count_all:true` 只切换指标；只传 `filter` 只替换筛选。切换 `table_name` 时必须在同一 patch 提供新的 `group_by` 以及 `series` 或 `count_all:true`；未传 `filter` 保留原筛选，未传 `limit_size` 保留原 Top N。

示例 — 柱状图按销售额降序：

```json
{
  "table_name": "订单表",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "group_by": [{ "field_name": "类别", "mode": "integrated", "sort": {"type": "value", "order": "desc"} }]
}
```

## filter 格式规则

**基本结构：**

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "字段名", "operator": "操作符", "value": "值" }
    ]
  }
}
```

**多条件示例（and/or）：**

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      { "field_name": "状态", "operator": "is", "value": "已完成" },
      { "field_name": "金额", "operator": "isGreater", "value": 1000 }
    ]
  }
}
```

**操作符：**

| 操作符 | 含义 | 是否需要 value |
|--------|------|---------------|
| `is` | 等于 | 是 |
| `isNot` | 不等于 | 是 |
| `contains` | 包含 | 是 |
| `doesNotContain` | 不包含 | 是 |
| `isEmpty` | 为空 | 否 |
| `isNotEmpty` | 不为空 | 否 |
| `isGreater` | 大于 | 是 |
| `isGreaterEqual` | 大于等于 | 是 |
| `isLess` | 小于 | 是 |
| `isLessEqual` | 小于等于 | 是 |

**各字段类型的 value 格式：**

| 字段类型 | value 类型 | 适用操作符 | 示例 |
|----------|-----------|-----------|------|
| `text` | string | is, isNot, contains, doesNotContain, isEmpty, isNotEmpty | `{"field_name":"姓名","operator":"contains","value":"张"}` |
| `number` | number | is, isNot, isGreater, isGreaterEqual, isLess, isLessEqual, isEmpty, isNotEmpty | `{"field_name":"金额","operator":"isGreater","value":0}` |
| `select` (`multiple=false`) | string（选项名） | is, isNot, isEmpty, isNotEmpty | `{"field_name":"状态","operator":"is","value":"已完成"}` |
| `select` (`multiple=true`) | string[]（选多个）/ string（选单个） | is, isNot, contains, doesNotContain, isEmpty, isNotEmpty | 多选传数组如 `["标签1","标签2"]`；单选传单个字符串 |
| `datetime` / `created_at` / `updated_at` | `["ExactDate", Unix 毫秒时间戳]` | is, isGreater, isLess, isEmpty, isNotEmpty | `{"field_name":"创建日期","operator":"isGreater","value":["ExactDate",1704038400000]}` |
| `checkbox` | boolean | is | `{"field_name":"已审核","operator":"is","value":true}` |
| `user` / `created_by` / `updated_by` | string 或 string[]（用户 ID，格式 `ou_xxx`）。不知道 `open_id` 时先用 `lark-cli contact +search-user --query "<姓名/邮箱/手机号>" --as user` 查 id。 | is, isNot, isEmpty, isNotEmpty | `{"field_name":"负责人","operator":"is","value":"ou_xxxxxxxxxxxxxxxx"}` |
| 所有类型（为空/不为空） | 不需要 value | isEmpty, isNotEmpty | `{"field_name":"备注","operator":"isEmpty"}` |

> `value` 类型因字段而异，可为 `string | number | boolean | string[] | ["ExactDate", number]`，需按上表构造。

### 日期筛选

图表 `data_config.filter` 筛选 `datetime` / `created_at` / `updated_at` 字段时：

- 有值条件只能使用 `is`、`isGreater` 或 `isLess`，不得使用 `isGreaterEqual` 或 `isLessEqual`。
- `value` 必须写成 `["ExactDate", <Unix 毫秒时间戳>]`，不得直接传裸时间戳。
- `isEmpty` / `isNotEmpty` 不传 `value`。

日期区间示例：

```json
{
  "filter": {
    "conjunction": "and",
    "conditions": [
      {
        "field_name": "派单日期",
        "operator": "isGreater",
        "value": ["ExactDate", 1785686400000]
      },
      {
        "field_name": "派单日期",
        "operator": "isLess",
        "value": ["ExactDate", 1786032000000]
      }
    ]
  }
}
```

## 约束与本地校验

- 必填与互斥
  - 图表类型必填：`table_name`
  - text 类型必填：`text`
  - 互斥：`series` 与 `count_all` 二选一，且至少提供其一（仅图表类型）
  - nps 类型必填：`table_name`、长度为 1 的 `group_by`；`group_by[0].mode` 可省略，省略时按 `integrated` 处理，显式传入时也只能为 `integrated`；不支持 `group_by[0].sort` 和 `series`；`count_all` 可省略，出现时只能为 `true`
  - text 类型**不支持**：`series`、`count_all`、`group_by`、`filter`
- 长度/结构
  - `group_by` 最多 2 个；每项 `field_name` 必填
  - `group_by[].sort.type` 取值 `group|value|view`；`order` 取值 `asc|desc`
- 规范化（CLI 自动处理；`--no-validate` 时不生效，`data_config` 原样透传给后端）
  - `series[].rollup` 自动转成大写（如 `sum` → `SUM`）
  - `group_by[].sort.type/order` 自动转成小写
  - `group_by[].sort.type` 为 `group` 或 `view` 且缺少 `order` 时，自动补 `order:"asc"`；`value` 排序不会自动补方向
- 本地校验（可通过 `--no-validate` 跳过）
  - `+dashboard-block-create` 默认对 `data_config` 做轻量校验；失败会聚合错误并给出修复建议
  - `+dashboard-block-update` 不带 `--type`，所以不做按组件类型的强校验；但会对可解析的 `filter` 条件做轻量校验，包括 `conjunction`、字段引用、`operator` 和必需的 `value`，并与 create 一样拦截非法 `number_format` 子字段（见下方 number_format 小节）
  - 仅需传入合法 JSON；CLI 不会擅自改写你的业务含义

## 可复制模板

**按意图选择模板：**
- 比较不同类别数值 → 柱状图 / 条形图
- 看趋势变化 → 折线图 / 面积图
- 看占比分布 → 饼图 / 环形图 / 词云
- 多指标对比 → 组合图
- 看两变量关系 → 散点图
- 看流程转化 → 漏斗图
- 看多维度评分 → 雷达图
- 显示单个指标 → 指标卡（统计数字或记录数）
- 统计满意度评分分布 → NPS 图（一个 Rating 字段 + 可选分段）
- 查看单维度 Top N → 排行榜

最小柱状图：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "分组字段", "mode": "integrated" }]
}
```

最小饼图/环形图（按分类字段统计行数占比）：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

折线图（按月趋势）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "group_by": [{ "field_name": "月份", "mode": "integrated", "sort": {"type":"group","order":"asc"} }]
}
```

条形图（横向柱状图）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "分组字段", "mode": "integrated" }]
}
```

面积图（趋势填充）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "数值字段", "rollup": "SUM" }],
  "group_by": [{ "field_name": "时间字段", "mode": "integrated", "sort": {"type":"group","order":"asc"} }]
}
```

组合图（柱+线等多指标对比）：

```json
{
  "table_name": "表名",
  "series": [
    { "field_name": "指标1", "rollup": "SUM" },
    { "field_name": "指标2", "rollup": "SUM" }
  ],
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

散点图（两变量相关性）：

```json
{
  "table_name": "表名",
  "series": [{ "field_name": "Y轴字段（数值/指标）", "rollup": "SUM" }],
  "group_by": [{ "field_name": "X轴字段（分类/维度）", "mode": "integrated" }]
}
```

漏斗图（流程转化）：

先判断用户要看的数值语义：

- **当前数量**：统计每个当前状态/阶段下有多少记录，例如“各环节当前数量”“当前阶段分布”。源表有状态/阶段字段时，直接用 `count_all:true` + `group_by`。
- **累计数量**：统计到达该阶段及其后续阶段（后缀和）的累计数量，例如“流程转化”“从 A 到 B 各环节转化”。此口径假设流程单向、无跳阶/回退、记录不删除；不满足时须用状态变更历史，不能对当前快照累加。如果表中已有累计数量字段或阶段汇总表，直接用该字段画漏斗图；否则先计算累计数量，创建并写入 helper 汇总表后再画图。

当前数量：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "状态字段", "mode": "integrated" }]
}
```

累计数量：

```json
{
  "table_name": "流程汇总表名",
  "series": [{ "field_name": "累计数量", "rollup": "SUM" }],
  "group_by": [{ "field_name": "阶段字段", "mode": "integrated", "sort": {"type":"view","order":"asc"} }]
}
```

如果只有当前状态数据但用户要看流程转化，需要先按业务阶段顺序计算每个阶段的累计数量，再创建 helper 汇总表（如：阶段、累计数量），用 `+record-batch-create` 一次写入后，按“累计数量”模板创建漏斗图。helper 表行序就是业务顺序时，首次创建 block 时一次性设置好 `group_by.sort`。

> ⚠️ 注意:helper 汇总表仅用于源表无法直接聚合出目标形态的场景（如上面的累计数量漏斗图）。只要能在源表上直接用 `group_by` + `rollup`（含 `AVERAGE`）算出，就不需要新建 helper 表。

词云（文本频率）：

```json
{
  "table_name": "表名",
  "count_all": true,
  "group_by": [{ "field_name": "文本字段", "mode": "integrated" }]
}
```

雷达图（多维度评分）：

```json
{
  "table_name": "表名",
  "series": [
    { "field_name": "维度1", "rollup": "SUM" },
    { "field_name": "维度2", "rollup": "SUM" },
    { "field_name": "维度3", "rollup": "SUM" }
  ],
  "group_by": [{ "field_name": "分类字段", "mode": "integrated" }]
}
```

排行榜（按销售额取 Top 10）：

```json
{
  "table_name": "订单表",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "group_by": [{ "field_name": "负责人", "mode": "integrated", "sort": {"type":"value","order":"desc"} }],
  "limit_size": 10
}
```

排行榜只更新 Top N：

```json
{"limit_size": 20}
```

指标卡（统计数字）：

```json
{
  "table_name": "数据表",
  "series": [{ "field_name": "数字", "rollup": "SUM" }]
}
```

NPS 图（按 Rating 评分字段统计记录数）：

```json
{
  "table_name": "问卷结果",
  "group_by": [{ "field_name": "满意度评分", "mode": "integrated" }],
  "category_range": [0, 6, 8, 10]
}
```

NPS 的 `group_by[0].field_name` 必须指向 Base 的评分字段（Dashboard 内部识别为 `Rating` 语义）。调用方可通过 Base 字段详情或界面字段配置确认评分字段的最小值与最大值；CLI 只能做轻量 JSON 校验，字段类型、字段量程、`category_range` 首尾是否等于评分字段最小值和最大值由服务端按字段元数据校验。

`category_range` 可省略，服务端会按 Rating 字段自身量程生成默认分段。显式传入时数组长度必须为 4，且首尾必须等于 Rating 字段最小值和最大值。

指标卡（统计记录数）：

```json
{
  "table_name": "数据表",
  "count_all": true
}
```

### statistics 指标卡数值格式 number_format（可选）

仅 `type: statistics` 支持在 `data_config` 里加可选 `number_format`，控制数值展示格式与精度；不传时服务端会补 `{"formatName":"digital"}`，`precision` 保持省略。其它组件类型不支持该字段：create 会被 CLI 直接拒绝（显式 `--no-validate` 可跳过），避免把后端严格 schema 错误延迟到请求阶段；update 不带 `--type`，由服务端结合组件现有类型裁决。

- `formatName`（string，可选）：必须精确匹配下表 5 个枚举之一，**区分大小写**（不同于 `series[].rollup` 会被自动转成大写，这里不做规范化，`DIGITAL` 会被拒绝）。
- `precision`（integer，可选）：小数位数，`0` 到 `9` 的整数；`2.5` 这类非整数会被本地拒绝。

| formatName | 含义 | 示例（precision=2） |
|------------|------|--------------------|
| `digital` | 千分位数字（不传 `number_format` 时的服务端默认值） | `1,234.56` |
| `digital_without_separator` | 无千分位数字 | `1234.56` |
| `percentage_rounded` | 百分比 | `1,234.56%` |
| `cyn_rounded` | 人民币金额 | `¥1,234.56` |
| `dollar_rounded` | 美元金额 | `$1,234.56` |

指标卡（金额，保留 2 位小数）：

```json
{
  "table_name": "订单表",
  "series": [{ "field_name": "金额", "rollup": "SUM" }],
  "number_format": { "formatName": "dollar_rounded", "precision": 2 }
}
```

> **更新时 `number_format` 按子字段合并**：例如现有 `{"formatName":"digital","precision":2}` 时只传 `{"number_format":{"precision":0}}`，服务端会保留 `formatName:"digital"` 并把精度改为 `0`。其它顶层 key 的更新策略见 [lark-base-dashboard.md](lark-base-0.md#s-b9539e7968607a67)。

文本组件（Markdown 富文本）：

```json
{
  "text": "# 🚀 一级标题\n这是一个 **加粗** *斜体* ~~删除线~~ 的示例。\n\n## 📌 二级标题\n1. 有序列表项 1\n2. 有序列表项 2\n\n### 📌 三级标题\n- 无序列表项 1\n- 无序列表项 2"
}
```

> **注意**：text 类型组件不需要 `table_name`、`series`、`group_by`、`filter` 等数据源相关字段。

## 常见错误与修复

- 同时存在 `series` 与 `count_all`
  - 现象：后端/本地校验报互斥错误
  - 修复：见「关键约束」章节的二选一规则
- 缺少 `table_name`
  - 现象：本地校验缺少必填字段
  - 修复：指定数据源表名（使用表名，非表 ID）
- `series[].rollup` 大小写/取值不合法
  - 现象：本地校验提示枚举不支持
  - 修复：改为 `SUM|MAX|MIN|AVERAGE` 中之一（不区分大小写，CLI 会统一为大写；计数请使用 `count_all:true`）
- `group_by` 超出 2 个或字段名为空
  - 修复：保留前 2 个，或补齐 `field_name`
- 排序枚举不合法
  - 修复：`group_by.sort.type` 仅能为 `group|value|view`；`order` 为 `asc|desc`
- filter 写法不规范
  - 修复：`conjunction` 取 `and|or`；`conditions[].operator` 必须在本页表格列举的范围内；除 `isEmpty/isNotEmpty` 外需提供 `value`

## 坑点

- **`count_all` 与 `series` 二选一** — 两者不能同时使用
- **filter `value` 类型因字段而异** — 文本/单选为 string，数字为 number，日期为毫秒时间戳，多选/人员可为 string[]，复选框为 boolean；`isEmpty`/`isNotEmpty` 不需要 value
- **`data_config` 结构随 `type` 变化** — 不同组件类型的字段不同，创建前务必确认类型对应的字段
- **表名用 name，不是 ID** — `table_name` 对应的是表名称（如「订单表」），不是 `table_id`


<a id="s-637205f5d2d3f6f3"></a>

## references/lark-base-dashboard-block-get-data.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +dashboard-block-get-data

> **前置条件：** 先阅读 [lark-base-dashboard.md](lark-base-0.md#s-b9539e7968607a67) 了解 dashboard 整体工作流。

获取仪表盘图表组件（block）的**最终计算结果**，返回一份适合 AI 直接消费的图表协议 JSON。

这个命令适合以下场景：

1. 读取柱状图 / 条形图 / 折线图 / 饼图 / 环形图 / 面积图 / 组合图 / 散点图 / 漏斗图 / 雷达图 / 排行榜 / 词云 / 指标卡的**实际计算结果**；
2. 把图表结果交给 AI 做后续总结、趋势解释、同比/环比说明、异常点提取；
3. 在**不读取原始记录**的前提下，直接消费图表层已经聚合好的结果；
4. 验证某个图表当前展示的数据是否符合预期。

> [!IMPORTANT]
> - 本命令返回的是**图表结果协议**，不是 block 元数据；
> - 如果你需要 `name`、`type`、`layout`、`data_config` 等配置，请先用 `+dashboard-block-get`；
> - 文本组件（`text`）不涉及计算，不适用本命令；

## 一句话理解

`+dashboard-block-get-data` = **拿图表“算出来的结果”**，而不是拿图表“怎么配置的”。

---

## 支持的图表类型

当前支持以下图表类型的数据计算与返回：

### 二维图表（11 种）

- 柱状图
- 条形图
- 折线图
- 饼图
- 环形图
- 面积图
- 组合图
- 散点图
- 漏斗图
- 雷达图
- 排行榜

### 特殊类型（2 种）

- 词云
- 指标卡（statistics）

> [!CAUTION]
> 文本组件虽然也属于 dashboard block，但它不产生可计算数据，因此不会返回本协议。

---

## 推荐命令

```text
lark-cli base +dashboard-block-get-data \
  --base-token bascn***************CtadY \
  --block-id chtxxxxxxxx
```

如果你还不知道目标 block 的 ID，典型顺序是：

```text
# 先看仪表盘里有哪些组件
lark-cli base +dashboard-block-list \
  --base-token bascn***************CtadY \
  --dashboard-id blkxxxxxxxx \
  --page-size 100

# 再读取某个组件的最终计算结果
lark-cli base +dashboard-block-get-data \
  --base-token bascn***************CtadY \
  --block-id chtxxxxxxxx
```

如果用户要读取多个组件，先通过 `+dashboard-block-list --page-size 100` 取得真实 ID；若返回 `has_more=true`，继续把本页返回的 `page_token` 传给 `--page-token`，直到 `has_more=false`。收齐目标组件并跳过没有计算结果的文本组件后，再在**一个 shell 工具调用**内串行执行。每条命令会依次输出一个完整 JSON envelope；不要把每个 block 拆成独立模型轮次。

```text
set -euo pipefail

block_ids=(cht_block_1 cht_block_2)
for block_id in "${block_ids[@]}"; do
  lark-cli base +dashboard-block-get-data \
    --base-token bascn***************CtadY \
    --block-id "$block_id"
done
```

数组中的 ID 必须逐字来自 `+dashboard-block-list` 返回，不要把名称或未经验证的用户文本作为 shell 代码执行。循环仍然是串行 API 调用，只减少模型往返，不裁剪任何组件结果。

如果你需要先确认组件类型、名称或 `data_config`，请先执行：

```text
lark-cli base +dashboard-block-get \
  --base-token bascn***************CtadY \
  --dashboard-id blkxxxxxxxx \
  --block-id chtxxxxxxxx
```

---

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token，标识目标多维表格 |
| `--block-id <id>` | 是 | 图表 Block ID，即目标组件的唯一标识 |
| `--format <fmt>` | 否 | 输出格式，遵循 CLI 全局输出格式规则 |
| `--dry-run` | 否 | 只预览 API 调用，不真正执行 |

> [!TIP]
> 这个命令**不需要** `--dashboard-id`。只要 `base_token + block_id` 即可定位并读取图表结果。

---

## 返回结构总览

CLI 成功输出使用标准 `{ok, identity, data}` 信封：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "dimensions": [],
    "measures": [],
    "main_data": []
  }
}
```

其中 `identity` 是本次调用实际使用的身份，`data` 是 CLI 图表协议本体。不同图表类型的 `data` 结构略有不同：

| 图表类型 | 一定有 | 可能有 |
|----------|--------|--------|
| 二维图表 | `dimensions` / `measures` / `main_data` | 无 |
| 词云 | `dimensions` / `measures` / `main_data` | 无 |
| 指标卡 | `dimensions` / `measures` / `main_data` | `comparison_data` / `trend_data` |

---

## 协议字段说明

### 1) `dimensions`

维度定义数组，告诉你主结果里每个 `dim_*` key 代表什么字段。

```json
[
  {
    "field_name": "文本",
    "alias": "dim_5bKp"
  }
]
```

字段含义：

| 字段 | 说明 |
|------|------|
| `field_name` | 维度字段显示名称 |
| `alias` | 维度别名，在 `main_data` / `trend_data` 中作为 key 使用 |

### 2) `measures`

指标定义数组，告诉你每个 `me_*` key 代表什么聚合指标。

```json
[
  {
    "field_name": "Count",
    "aggregation": "count_all",
    "alias": "me_Y291bnRfYWxsX0NvdW50"
  }
]
```

字段含义：

| 字段 | 说明 |
|------|------|
| `field_name` | 统计该指标时所使用的字段名称；当 `aggregation = count_all` 时固定为 `Count`，表示统计记录总数 |
| `aggregation` | 聚合方式，常见值：`count_all` / `count` / `sum` / `avg` / `min` / `max` |
| `alias` | 指标别名，在 `main_data` / `comparison_data` / `trend_data` 中作为 key 使用 |

例如：

- 如果统计“销售额”的求和，则 `field_name = 销售额`、`aggregation = sum`
- 如果统计记录总数，则 `field_name = Count`、`aggregation = count_all`

### 3) `main_data`

主结果集。每一行都是一个对象，key 不是字段名本身，而是 `dimensions` / `measures` 中声明过的 `alias`。

```json
[
  {
    "dim_5bKp": {"value": "A"},
    "me_Y291bnRfYWxsX0NvdW50": {"value": 3}
  }
]
```

### 4) `comparison_data`

仅指标卡可能返回。表示同/环比的两个值，顺序固定为：

1. 当前周期值
2. 对比周期值

> [!NOTE]
> 原始协议里通常**不直接展示周期名称**，只提供对应的值。因此解释“同比”还是“环比”、以及比较窗口具体是什么，通常要结合组件配置或 UI 上下文理解。

### 5) `trend_data`

仅指标卡可能返回。表示时间序列趋势，每一行通常包含一个时间维度和一个指标值。

---

## alias 规则与读取方式

你不应该把 alias 当成人类可读字段名，而应把它视为**结果表里的列 ID**。

常见生成规则：

- 维度 alias：`dim_` + `base64(field_name)`
- 指标 alias：`me_` + `base64(aggregation + "_" + field_name)`

> [!NOTE]
> 为了便于阅读，本文档中的部分示例会使用**简化后的 alias**（例如 `dim_xxx`、`me_xxx` 或较短的示例值），不保证和真实返回值逐字符一致。
> 在实际读取结果时，应始终以 `dimensions` / `measures` 中声明的 alias 为准，而不要假设所有示例都严格展开成完整编码值。

例如：

```json
{
  "dimensions": [
    {"field_name": "文本", "alias": "dim_5bKp"}
  ],
  "measures": [
    {"field_name": "Count", "aggregation": "count_all", "alias": "me_xxx"}
  ],
  "main_data": [
    {
      "dim_5bKp": {"value": "A"},
      "me_xxx": {"value": 3}
    }
  ]
}
```

应解读为：

- `dim_5bKp` 对应字段“文本”，取值是 `A`
- `me_xxx` 对应指标 `count_all(Count)`，取值是 `3`

> [!TIP]
> 读取结果时，**先看 `dimensions` / `measures`，再解 `main_data`**。不要仅凭 alias 名字猜含义。

---

## 各图表类型的协议细节

### 一、二维图表

适用于：柱状图、条形图、折线图、饼图、环形图、面积图、组合图、散点图、漏斗图、雷达图、排行榜。

排行榜复用同一 `dimensions` / `measures` / `main_data` 协议，不增加专属响应字段。结果的条数和顺序由 block 配置中的 `limit_size` 与 `group_by[0].sort` 决定；消费返回时保持 `main_data` 的服务端顺序，不要再次反转或自行重排。

#### 结构特征

- `dimensions`：通常有 `1~2` 个维度
  - 不分组聚合时：通常 1 个维度
  - 开启分组聚合时：通常 2 个维度
- `measures`：指标定义数组
- `main_data`：按“维度组合”展开后的行数据

#### 这类数据代表什么

二维图表返回的本质上是一张**聚合结果表**：

- 每一行代表一个维度值，或一组维度组合；
- 每一个 measure 值代表该维度下算出来的指标结果；
- 如果图表开启了分组聚合，那么每一行表示“主维度 + 分组维度”的一个组合结果；
- 如果图表是折线图、面积图这类带时间轴的图，通常可以把第一维理解为横轴、把 measure 理解为纵轴数值；
- 如果图表是饼图、环形图这类占比图，通常可以把每一行理解为一个扇区对应的分类及其数值。

换句话说，AI 在读取这类结果时，可以把它当作“按某些维度聚合后的统计明细表”，适合进一步做排序、Top N、占比解释、分组对比和趋势总结。

#### 示例 1：普通二维图表（无分组聚合）

```json
{
  "dimensions": [
    {
      "field_name": "文本",
      "alias": "dim_5bKp"
    }
  ],
  "measures": [
    {
      "aggregation": "count_all",
      "field_name": "Count",
      "alias": "me_Y291bnRfYWxsX0NvdW50"
    }
  ],
  "main_data": [
    {
      "dim_5bKp": {"value": "A"},
      "me_Y291bnRfYWxsX0NvdW50": {"value": 3}
    },
    {
      "dim_5bKp": {"value": "B"},
      "me_Y291bnRfYWxsX0NvdW50": {"value": 2}
    },
    {
      "dim_5bKp": {"value": "C"},
      "me_Y291bnRfYWxsX0NvdW50": {"value": 2}
    }
  ]
}
```

可解读为：

- 维度字段是“文本”
- 指标是“按记录总数统计”
- 当“文本”字段为 `A` 时，对应的 `Count` 指标值是 `3`
- 当“文本”字段为 `B` 时，对应的 `Count` 指标值是 `2`
- 当“文本”字段为 `C` 时，对应的 `Count` 指标值是 `2`

#### 示例 2：二维图表（开启分组聚合）

```json
{
  "dimensions": [
    {
      "field_name": "文本",
      "alias": "dim_5bKp"
    },
    {
      "field_name": "单选",
      "alias": "dim_5aSl"
    }
  ],
  "measures": [
    {
      "aggregation": "count_all",
      "field_name": "Count",
      "alias": "me_YW91bnR"
    }
  ],
  "main_data": [
    {
      "dim_5bKp": {"value": "A"},
      "dim_5aSl": {"value": "a-1"},
      "me_YW91bnR": {"value": 2}
    },
    {
      "dim_5bKp": {"value": "A"},
      "dim_5aSl": {"value": "a-2"},
      "me_YW91bnR": {"value": 1}
    },
    {
      "dim_5bKp": {"value": "B"},
      "dim_5aSl": {"value": "b-1"},
      "me_YW91bnR": {"value": 1}
    },
    {
      "dim_5bKp": {"value": "C"},
      "dim_5aSl": {"value": "c-1"},
      "me_YW91bnR": {"value": 2}
    }
  ]
}
```

可解读为：

- 第一维是“文本”，第二维是“单选”，指标是“按记录总数统计”
- 当“文本”字段为 `A`、且“单选”字段为 `a-1` 时，对应的指标值是 `2`
- 当“文本”字段为 `A`、且“单选”字段为 `a-2` 时，对应的指标值是 `1`
- 当“文本”字段为 `B`、且“单选”字段为 `b-1` 时，对应的指标值是 `1`
- 当“文本”字段为 `C`、且“单选”字段为 `c-1` 时，对应的指标值是 `2`
- 如果按“文本”字段汇总，那么“文本”字段为 `A` 时总指标值是 `3`；为 `B` 时总指标值是 `1`；为 `C` 时总指标值是 `2`

---

### 二、词云

#### 结构特征

词云协议仍然沿用 `dimensions + measures + main_data` 的结构，但语义稍有不同：

- `dimensions` 对应被分词的字段；
- `main_data` 每一行代表一个词；
- `measure` 的 value 表示按该词分组后计算出来的统计值。

#### 这类数据代表什么

词云返回的不是“原文列表”，而是**按词分组后的聚合统计结果**：

- `dimensions` 定义的是被分词的来源字段；
- `measure` 对应的是该词在当前图表统计范围内对应的统计值，具体含义取决于聚合方式和指标字段；
- `main_data` 的每一行都可以理解成“某个词 + 该词对应的统计结果”，其中该维度的具体 value 就是拆分出来的词；
- 返回结果通常已经结合图表当前过滤条件、时间范围、数据权限等上下文计算完成。

因此，AI 读取词云数据时，更适合做“关键词排序”“热点词解释”“按词聚合结果分析”“主题归纳”，而不是把它当成逐条文本记录去理解。

#### 示例

```json
{
  "dimensions": [
    {
      "field_name": "文本",
      "alias": "dim_5bKp"
    }
  ],
  "measures": [
    {
      "aggregation": "count_all",
      "field_name": "Count",
      "alias": "me_YW91bnR"
    }
  ],
  "main_data": [
    {
      "dim_5bKp": {"value": "A"},
      "me_YW91bnR": {"value": 3}
    },
    {
      "dim_5bKp": {"value": "B"},
      "me_YW91bnR": {"value": 2}
    },
    {
      "dim_5bKp": {"value": "C"},
      "me_YW91bnR": {"value": 2}
    }
  ]
}
```

可解读为：

- 被统计的分词字段是“文本”
- 当前示例里的 measure 是 `count_all(Count)`，所以这里的统计值可以理解为“按词分组后的记录总数”
- 当分词结果为 `A` 时，对应的统计值是 `3`
- 当分词结果为 `B` 时，对应的统计值是 `2`
- 当分词结果为 `C` 时，对应的统计值是 `2`
- 按统计值排序，分词结果 `A` 对应的值最高
- 分词结果 `B` 和 `C` 的统计值相同，说明它们处于同一梯队

---

### 三、指标卡（statistics）

指标卡除了主值外，还可能包含同/环比与趋势结果，是本命令里结构最特殊的一类。

#### 结构特征

- `measures`：**有且仅有一个指标**
- `main_data`：通常只有一行，表示总指标值
- `comparison_data`：可选，表示当前周期值与对比周期值
- `trend_data`：可选，表示趋势序列
- `dimensions`：可能包含同/环比日期字段、趋势日期字段

#### 这类数据代表什么

指标卡返回的核心是一个**主指标摘要**，外加可选的比较信息和趋势信息：

- `main_data` 表示当前卡片最核心、最醒目的那个主值；它通常是某个表的记录总数，或某个字段的聚合值，本身**不带时间周期概念**；
- `comparison_data` 表示用于同/环比展示的两个数值，通常是“当前周期值”和“对比周期值”；它们表示某个时间周期下的记录总数，或某个字段的聚合值；
- `trend_data` 表示这个指标在一段时间内的变化轨迹，用来支持走势判断；
- `dimensions` 在指标卡里通常不是拿来做主分组展示，而是给 `trend_data` 或同/环比相关日期字段提供语义说明。

例如：

- `main_data = 7` 可以理解为当前卡片展示的主数据，比如某张表当前总记录数是 `7`；
- `comparison_data[0] = 6` 则表示某个比较周期下的当前值，比如“本月记录总数 = 6”；
- 因此，`main_data` 与 `comparison_data[0]` **不一定相等**，因为两者表达的口径并不完全相同。

因此，AI 在解读指标卡时，应该优先回答这几个问题：

1. 当前主值是多少；
2. 和对比周期相比是上升、下降还是持平；
3. 趋势整体是增长、波动还是下滑；
4. 是否存在明显的异常峰值或低谷。

> [!NOTE]
> 当指标卡**同时指定同/环比和趋势**时，`dimensions` 中日期维度的顺序是固定的：
> 1. 第一个元素是**趋势**对应的日期维度；
> 2. 第二个元素是**同/环比**对应的日期维度。
>
> 另外要注意：`comparison_data` 自身通常**不直接携带日期字段**，它只给出“当前周期值 / 对比周期值”。
> `dimensions` 中的第一个日期维度会直接出现在 `trend_data` 中，作为趋势序列的时间列；
> 第二个日期维度则主要用于补充“该卡片配置了哪类比较相关日期字段”的语义。

#### 示例

```json
{
  "dimensions": [
    {
      "field_name": "日期",
      "alias": "dim_ZGF0ZQ"
    },
    {
      "field_name": "日期2",
      "alias": "dim_ZGF0ZTI"
    }
  ],
  "measures": [
    {
      "aggregation": "count_all",
      "field_name": "Count",
      "alias": "me_YW91b"
    }
  ],
  "main_data": [
    {
      "me_YW91b": {"value": 7}
    }
  ],
  "comparison_data": [
    {
      "me_YW91b": {"value": 6}
    },
    {
      "me_YW91b": {"value": 0}
    }
  ],
  "trend_data": [
    {
      "dim_ZGF0ZQ": {"value": "2026-01-15"},
      "me_YW91b": {"value": 1}
    },
    {
      "dim_ZGF0ZQ": {"value": "2026-01-17"},
      "me_YW91b": {"value": 1}
    },
    {
      "dim_ZGF0ZQ": {"value": "2026-03-22"},
      "me_YW91b": {"value": 1}
    },
    {
      "dim_ZGF0ZQ": {"value": "2026-04-24"},
      "me_YW91b": {"value": 2}
    },
    {
      "dim_ZGF0ZQ": {"value": "2026-05-01"},
      "me_YW91b": {"value": 1}
    }
  ]
}
```

可解读为：

- 当前主指标值 = `7`
- 当前主指标值不带时间周期概念，可理解为当前卡片主数据
- comparison_data[0] = 当前周期值 `6`，例如某个时间周期（如本月）下的统计值
- comparison_data[1] = 对比周期值 `0`
- `dimensions[0]` 对应趋势日期维度，因此实际出现在 `trend_data` 里
- `dimensions[1]` 对应同/环比相关的日期维度，用来补充比较语义
- trend_data 展示该指标随时间的变化序列
- 从 comparison_data 看，当前周期相较对比周期是上升的，并且对比周期值为 0
- 从 trend_data 看，这个指标并不是每天都有值，而是在若干离散日期出现
- 趋势序列里的最高点出现在 `2026-04-24`，值为 `2`
- 其余出现的日期大多为 `1`，说明整体上有波动，但暂时没有持续快速增长的趋势

> [!NOTE]
> `comparison_data` 只告诉你“当前值 / 对比值”，**不额外标出日期区间文本**。如果用户需要完整说明“和上周比”还是“和上月比”，通常要结合组件配置或界面上下文进一步判断。

---

## 如何正确解读返回值

建议按下面顺序阅读：

1. **先看 `dimensions`**：确认每个 `dim_*` alias 对应哪个字段；
2. **再看 `measures`**：确认每个 `me_*` alias 是什么聚合方式；
3. **最后读 `main_data` / `comparison_data` / `trend_data`**：把 alias 还原成“字段名 + 指标名”再做解释。

### 推荐解释模板

如果要把结果转成自然语言，建议不要只“复述数值”，而应尽量覆盖下面几个层次：

1. **先解释指标含义**：说明 measure 代表“记录总数”“某字段求和”“平均值”等；
2. **再给出核心结果**：明确当前主值、主要分类、主要组合或主要词项；
3. **做排序或 Top N 提炼**：指出最高、最低、前几名、同一梯队；
4. **补充分组/对比关系**：如果有第二维或 comparison_data，就说明比较对象和差异；
5. **分析趋势或异常点**：如果有时间序列，指出上升、下降、波动、峰值、低谷；
6. **最后给一句结论**：总结最值得关注的信息。

可参考下面模板：

- 二维图表：
  - 基础模板：`按 <维度字段> 统计，当前指标 <指标含义>；其中 <维度值1>=<指标值1>，<维度值2>=<指标值2> ...`
  - 增强模板：`按 <维度字段> 统计，当前指标表示 <指标含义>。从结果看，<Top1维度值> 的值最高，为 <Top1值>；<Top2维度值> 和 <Top3维度值> 紧随其后。若按 Top N 看，前 <N> 项合计贡献了 ...；若看低值项，<低值维度值> 最低，为 <低值>。整体上，<一句总结>`

- 分组聚合图表：
  - 基础模板：`按 <维度1> 统计，并以 <维度2> 分组，得到 <组合1>=<值1>，<组合2>=<值2> ...`
  - 增强模板：`当前指标表示 <指标含义>。按 <维度1> 拆分后，不同 <维度2> 组之间存在明显差异：例如 <组合1> = <值1>，<组合2> = <值2>。如果按 <维度1> 汇总，<Top1维度1值> 总值最高，为 <汇总值>；如果看组内对比，<某组> 在 <某维度1值> 下表现最强 / 最弱。整体说明 <一句总结>`

- 词云：
  - 基础模板：`按分词结果统计，当前指标表示 <指标含义>；其中 <词1>=<统计值1>，<词2>=<统计值2> ...`
  - 增强模板：`当前词云反映的是“按词分组后的 <指标含义>”。从结果看，<Top1词> 的值最高，为 <值1>，说明它是当前最突出的关键词；<Top2词>、<Top3词> 处于第二梯队。如果按 Top N 看，主要关注词集中在 <主题A>、<主题B>；如果有多个词数值接近，可归为同一热点层级。整体上，这组词更适合用来总结 <主题/热点/关注点>`

- 指标卡：
  - 基础模板：`当前主指标值为 <main_data>；当前周期值为 <comparison_data[0]>；对比周期值为 <comparison_data[1]>；趋势上 ...`
  - 增强模板：`当前主指标表示 <指标含义>，主值为 <main_data>。若看周期比较，当前周期值为 <comparison_data[0]>，对比周期值为 <comparison_data[1]>，因此整体表现为 <上升/下降/持平>。若看趋势序列，最高点出现在 <日期>，值为 <峰值>；最低点出现在 <日期>，值为 <低值>；整体走势表现为 <持续增长/阶段波动/明显回落>。如果需要给出结论，可总结为：<一句总结>`

> [!TIP]
> 当用户明确要求“帮我分析”“帮我总结”“帮我找异常 / Top N / 趋势”时，优先采用增强模板，而不是只逐条复述原始数值。

---

## 常见工作流

### 场景 1：用户要“拿这个图表当前展示的数据”

```text
# 如果已知 block_id，直接读结果
lark-cli base +dashboard-block-get-data \
  --base-token xxx \
  --block-id chtxxxxxxxx
```

### 场景 2：用户说“帮我分析这个图表”，但你还不知道它是什么组件

```text
# 先看组件配置，确认它是不是支持计算的图表类型
lark-cli base +dashboard-block-get \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --block-id chtxxxxxxxx

# 再读最终计算结果
lark-cli base +dashboard-block-get-data \
  --base-token xxx \
  --block-id chtxxxxxxxx
```

### 场景 3：用户要找“仪表盘里哪个图的结果异常”

```text
# 先列组件
lark-cli base +dashboard-block-list \
  --base-token xxx \
  --dashboard-id blk_xxx

# 再针对可疑 block 逐个取结果
lark-cli base +dashboard-block-get-data \
  --base-token xxx \
  --block-id chtxxxxxxxx
```

---

## 何时优先用这个命令

- 用户说“帮我拿这个图表算出来的数据 / 结果 / 指标”
- 用户已经知道 `block_id`，目标是**读取结果**而不是看配置
- 用户后续还要让 AI 对图表结果做解释、归纳、比较、总结
- 你只关心图表层的聚合产出，不需要回到底表逐条读记录

## 何时不要误用

- 想看 block 的 `data_config`、名称、类型、布局 → 用 `+dashboard-block-get`
- 想列出仪表盘里有哪些组件 → 用 `+dashboard-block-list`
- 想修改或新建组件 → 用 `+dashboard-block-update` / `+dashboard-block-create`
- 想看原始记录明细，而不是图表聚合结果 → 回到 `record-*`
- 目标是文本组件 → 本命令不适用

---

## 常见误区

### 误区 1：把这个命令当成“获取 block 详情”

不是。这个命令不返回：

- block 名称
- block 类型
- layout
- `data_config`
- 所属 dashboard 信息

这些都应该通过 `+dashboard-block-get` 获取。

### 误区 2：以为它返回的是原始记录

不是。它返回的是**图表聚合后的最终结果**。如果图表本身做了过滤、分组、聚合、时间窗口限制，返回值反映的是图表视角，不是原始表全量明细。

### 误区 3：直接把 alias 当真实字段名读

不应该。alias 只是协议里的键，必须结合 `dimensions` / `measures` 还原语义。

### 误区 4：看到指标卡的 `comparison_data` 就以为已经知道“同比/环比周期文本”

不一定。它只给出比较值，不一定给出周期标签。若要精确解释比较窗口，通常还需要组件配置或 UI 上下文。

---

## dry-run 用途

可用来确认最终会调用的接口路径：

```text
lark-cli base +dashboard-block-get-data \
  --base-token bascn_example_token \
  --block-id chtxxxxxxxx \
  --dry-run \
  --format pretty
```

你应能看到类似：

```text
GET /open-apis/base/v3/bases/bascn_example_token/dashboards/blocks/chtxxxxxxxx/data
```

适合在以下场景使用：

- 校验 `base_token` / `block_id` 是否传对；
- 调试 agent 生成的命令；
- 编写自动化测试时确认请求结构。

---

## 参考

- [lark-base-dashboard.md](lark-base-0.md#s-b9539e7968607a67) — dashboard 模块总指引
- `+dashboard-block-get` — 获取 block 元数据
- [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) — data_config 结构和组件类型说明


<a id="s-b9539e7968607a67"></a>

## references/lark-base-dashboard.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Dashboard（仪表盘/数据看板）模块指引

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

Dashboard 是 Base 中的数据可视化看板，可以把表格数据变成**组件**（图表、指标卡等）进行展示。

## 核心概念

- **Dashboard（仪表盘）**：容器，包含多个组件
- **Block（组件）**：仪表盘中的单个可视化元素（柱状图、折线图、饼图、指标卡等）
- **data_config**：组件的数据源配置（表名、字段、分组等）

## 能力速览

| 你想做什么 | 用这些命令 | 关键文档 |
|------|-----------|---------|
| 创建/删除/改名称 | `+dashboard-create/delete/update` | 本页下方「仪表盘管理」 |
| 在仪表盘里添加组件 | `+dashboard-block-create` | 先定位 dashboard、表和字段，再读 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 构造 `data_config` |
| 修改组件 | `+dashboard-block-update` | 先读 block 现状，再读 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 决定替换哪些顶层 key |
| 创建/更新时指定组件精确位置大小 | `+dashboard-block-create/update --position` | 本页下方「精确布局 --position vs +dashboard-arrange」 |
| 查看仪表盘有哪些组件 | `+dashboard-get` 或 `+dashboard-block-list` | 本页下方「查看仪表盘」 |
| 读取图表计算结果 | `+dashboard-block-get-data` | 返回图表最终数据协议；需要 block 元数据先用 `+dashboard-block-get` |
| 智能重排组件布局 | `+dashboard-arrange` | 用户明确要求重排，或本次会话新建仪表盘的收尾整理；无法指定 `x/y/w/h`、精确位置或尺寸 |

## 精确布局 --position vs +dashboard-arrange

create/update 可选 `--position`，用 12 列栅格坐标精确指定单个组件的落点与大小：`{"x","y","w","h"}`，`x`/`y` 为左上角坐标（>=0），`w` 为宽度（1..12，且 `x+w<=12`），`h` 为高度（>=1）。它与 `name`/`type`/`data_config` 平级挂在请求体顶层。

> [!IMPORTANT]
> - **四个 key 必须齐全且都是数字**：`position` 按整体提交、不做逐字段合并，所以只传 `{"x":6}` 表达的不是"只挪位置不改大小"，而是一个缺了三项的位置。本地会拒绝残缺对象（含显式 `null`）。
> - 坐标**取值不做本地校验**：越界、负值或重叠坐标会原样发给服务端，由服务端自动重排。调用方仍应优先规划 12 列范围内且不重叠的坐标，避免自动重排改变预期落点。
> - 不传 `--position`：create 由服务端自动装箱，update 保持当前布局不变。
> - 只有用户明确给出 `x/y/w/h`、具体行列/顺序、每个组件宽高或可直接换算的尺寸比例时才用 `--position`。"调整布局""美化""撑满""铺满"本身不算精确约束，没有组件级坐标或尺寸时优先用 `+dashboard-arrange` 整盘编排。
> - 命令成功即视为写入成功，一般无需仅为读回位置再调用 `+dashboard-block-get` / `+dashboard-block-list`；成功响应不代表最终渲染位置已经过读回验证。

## statistics 指标卡数值格式

`statistics` 组件可在 create/update 的 `data_config.number_format` 中设置 `formatName` 和 `precision`。create 会校验组件类型和子字段；update 不接收 `--type`，只校验 `number_format` 子字段，再由服务端结合现有 block 类型裁决。枚举、精度范围、更新语义和可复制模板读取 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56)。

## 典型场景工作流

### 场景 1：从 0 到 1 创建仪表盘

从 0 到 1 创建仪表盘时，按用户需求规划组件的类型和数量，并注意以下要点：

- 聚合方式：创建指标卡或分布图时优先把聚合写进 `data_config`，只有 Top N、字段取值探索、复杂筛选校验或 helper 汇总表场景才先用 `+data-query`。
- Dry-run 边界：已按模板构造的简单指标卡、分布图、趋势图不需要逐个 `--dry-run` 后再真实创建；只有在调试 JSON、检查请求体、复杂自造 `data_config` 或处理 API validation 错误时才 dry-run。
- 验证方式：创建接口成功返回即表示写入成功。只有结果不确定时才用一次 `+dashboard-get` 或 `+dashboard-block-list` 确认仪表盘和组件存在；不要仅为确认创建而逐组件调用 `+dashboard-block-get-data`。
- 布局方式：用户没有给出组件级坐标或尺寸时，创建完成后用一次 `+dashboard-arrange` 整盘编排即可；只有用户明确给出可执行的精确布局约束时才在 create 中带 `--position`，此时通常不再需要 arrange。

示例：搭建一个销售数据分析仪表盘

```text
# 第 1 步：创建空白仪表盘
lark-cli base +dashboard-create --base-token xxx --name "销售数据分析"
# 记录返回的 dashboard_id

# 第 2 步：获取数据源信息
lark-cli base +table-list --base-token xxx
lark-cli base +field-list --base-token xxx --table-id <table_id>

# 第 3 步：规划应该创建哪些组件（根据用户需求确定组件类型和数量）
# 例如：总销售额（指标卡）、月度趋势（折线图）、负责人 Top N（排行榜）

# 第 4 步：顺序创建每个组件（必须串行执行，不能并发）
# 重要：创建组件前，先确定 dashboard_id、组件 name/type 和真实表字段
# 再阅读 lark-base-dashboard-block-config.md 了解 data_config 结构、组件类型和 filter 规则

# 第 1 个组件
lark-cli base +dashboard-block-create \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --name "总销售额" \
  --type statistics \
  --data-config '{"table_name":"订单表","series":[{"field_name":"金额","rollup":"SUM"}]}'

# 第 2 个组件（等上一个完成后再执行）
lark-cli base +dashboard-block-create \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --name "月度趋势" \
  --type line \
  --data-config '{"table_name":"订单表","series":[{"field_name":"金额","rollup":"SUM"}],"group_by":[{"field_name":"月份","mode":"integrated"}]}'

# 继续创建其他组件...

# 排行榜组件：省略 limit_size 和 sort 时分别默认 10、value desc
lark-cli base +dashboard-block-create \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --name "负责人销售额 Top 10" \
  --type ranking \
  --data-config '{"table_name":"订单表","series":[{"field_name":"金额","rollup":"SUM"}],"group_by":[{"field_name":"负责人"}]}'

# 第 5 步：组件创建完成后，可按需使用 arrange 智能重排（未使用 --position 时可选）
# 默认布局可能不够美观，arrange 会根据组件数量和类型自动优化布局
# 若任一组件使用了显式 --position，跳过此步骤；除非用户明确同意放弃精确布局
# 若用户没有要求美化/重排，也可跳过；这不影响仪表盘和组件是否已创建成功
lark-cli base +dashboard-arrange \
  --base-token xxx \
  --dashboard-id blk_xxx
```

### 场景 2：在已有仪表盘上添加新组件

```text
# 第 1 步：列出仪表盘，定位到当前仪表盘
lark-cli base +dashboard-list --base-token xxx
# 获取目标 dashboard_id

# 第 2 步：根据用户诉求规划组件类型和数据源
# 建议先查看当前仪表盘已有组件，避免重复创建，或作为参考
lark-cli base +dashboard-get --base-token xxx --dashboard-id blk_xxx

# 第 3 步：获取数据源信息
lark-cli base +table-list --base-token xxx
lark-cli base +field-list --base-token xxx --table-id <table_id>

# 第 4 步：顺序创建每个新组件（必须串行执行，不能并发）
# 重要：先确定 dashboard_id、组件 name/type 和真实表字段
# 再阅读 lark-base-dashboard-block-config.md 了解 data_config 结构
lark-cli base +dashboard-block-create \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --name "新组件名" \
  --type column \
  --data-config '{...}'
```

### 场景 3：编辑已有组件

> [!IMPORTANT]
> `+dashboard-block-update` **不能修改组件的 `type`**（图表类型），只能更新 `name`、`data_config` 和可选的 `position`。
> 如需更换组件类型，必须先删除再重新创建。

```text
# 第 1 步：列出仪表盘，定位到当前仪表盘
lark-cli base +dashboard-list --base-token xxx

# 第 2 步：列出组件，获取到目标组件
lark-cli base +dashboard-block-list --base-token xxx --dashboard-id blk_xxx
# 获取目标 block_id
# 提示：查看已有组件可作为参考，或检查是否重复创建相似组件

# 第 3 步：获取组件当前详情
lark-cli base +dashboard-block-get --base-token xxx --dashboard-id blk_xxx --block-id chtxxxxxxxx

# 第 4 步：根据用户编辑诉求准备更新
# 如果编辑诉求涉及数据源变更，需要先获取数据源信息
lark-cli base +table-list --base-token xxx
lark-cli base +field-list --base-token xxx --table-id <table_id>

# 第 5 步：执行更新
# 重要：先读取当前 block 的 name/type/data_config
# 再阅读 lark-base-dashboard-block-config.md 了解 data_config 更新规则
lark-cli base +dashboard-block-update \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --block-id chtxxxxxxxx \
  --data-config '{...}' \
  --position '{...}'   # 可选，只在需要调整布局时传

# 排行榜只修改 Top N；不会覆盖分组、指标、筛选或排序
lark-cli base +dashboard-block-update \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --block-id chtxxxxxxxx \
  --data-config '{"limit_size":20}'

```

### 场景 4：重排仪表盘布局

当用户要求调整布局、重排、美化、撑满或铺满，但没有给出组件级坐标或尺寸时使用。定位仪表盘后用一次 `+dashboard-arrange` 整盘编排即可（对本次会话从零新建的仪表盘，在建完组件后编排一次）。

> [!CAUTION]
> - 排列结果是**服务端智能推荐**，不一定完全符合用户预期
> - `+dashboard-arrange` 无法指定 `x/y/w/h`、精确位置或尺寸，排列逻辑是**自适应**的；只有用户明确给出可执行的组件级坐标、行列或尺寸约束时才改用 `--position`
> - **不建议**在已有仪表盘上自动调用，除非用户明确要求
> - 用户只要求一般性重排、美化、撑满或铺满时，用 `+dashboard-arrange` 整盘编排
> - 编排结果不理想时，可结合用户反馈再调整；不要为了凑效果去探测 raw `lark-cli api`、源码或未公开布局参数

```text
# 第 1 步：列出仪表盘，定位到目标仪表盘
lark-cli base +dashboard-list --base-token xxx

# 第 2 步：执行智能重排
lark-cli base +dashboard-arrange \
  --base-token xxx \
  --dashboard-id blk_xxx
```

### 场景 5：读取仪表盘或组件现状

**选择查询方式：**
- 想看仪表盘整体结构（含主题、所有组件名称和类型）→ 用 **方式 A**
- 只想快速查看有哪些组件 → 用 **方式 B**
- 想看某个组件的详细 data_config 配置 → 用 **方式 C**
- 想看某个图表/指标卡实际算出来的数据 → 用 **方式 D**

用户要求读取“全部图表”或“完整仪表盘”时，先用方式 B 分页枚举所有 block：使用 `--page-size 100`；若返回 `has_more=true`，继续把本页返回的 `page_token` 传给 `--page-token`，直到 `has_more=false`。收齐后再对每个 block 收口，不能只返回 get-data 成功的子集：

1. 图表或指标卡：使用方式 D 读取计算结果。
2. `text`：使用方式 C，正文位于 `data_config.text`；text 没有计算结果，但属于完整仪表盘内容。
3. get-data 返回不支持的图表类型：先用方式 C 读取真实 `data_config`，确认 `table_name`、维度、指标、聚合与筛选，再按 [Record 查询与分析 SOP](lark-base-0.md#s-cc7ad3628755b3c0) 使用 `+data-query` 重建同口径结果。字段必须来自真实配置和表结构，不得猜测；无法等价重建时明确报告限制，不能静默省略该 block。

```text
# 第 1 步：列出仪表盘，定位到当前仪表盘
lark-cli base +dashboard-list --base-token xxx

# 第 2 步：根据用户诉求查看详情

# 方式 A：查看仪表盘整体情况（包含所有组件列表）
lark-cli base +dashboard-get --base-token xxx --dashboard-id blk_xxx

# 方式 B：列出所有组件
lark-cli base +dashboard-block-list \
  --base-token xxx \
  --dashboard-id blk_xxx \
  --page-size 100

# 方式 C：查看某个组件的详细配置
lark-cli base +dashboard-block-get --base-token xxx --dashboard-id blk_xxx --block-id chtxxxxxxxx

# 方式 D：查看某个图表组件的计算结果（AI 友好的 chart protocol）
lark-cli base +dashboard-block-get-data --base-token xxx --block-id chtxxxxxxxx

# 最后：把获取到的现状信息整理好告诉用户
```

需要读取多个组件的计算结果时，先用方式 B 获取真实 `block_id`（使用 `--page-size 100`；若 `has_more=true`，继续把返回的 `page_token` 传给 `--page-token`，直到 `has_more=false`），再按 [lark-base-dashboard-block-get-data.md](lark-base-0.md#s-637205f5d2d3f6f3) 的多组件范式，在一个 shell 工具调用内串行读取；不要把每个 block 拆成独立模型轮次。文本组件没有计算结果，应跳过。

## 组件类型选择

组件 `type` 决定展示形式：

| 用户想看什么 | 选什么 type | 说明 |
|-------------|------------|------|
| 数据趋势（时间变化） | line | 折线图组件 |
| 类别比较（谁高谁低） | column | 柱状图组件 |
| 占比分布（各部分比例） | pie | 饼图组件 |
| 单个关键指标 | statistics | 指标卡组件 |
| 单维度 Top N 排名 | ranking | 排行榜组件，单分组、单指标 |
| 富文本说明/标题/注释 | text | 文本组件（支持 Markdown） |

详细组件类型和 data_config 完整规则：[Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56)

## 常见问题

**Q: 创建组件的命令和 data_config 怎么写？**
A:
1. 先确定 `dashboard_id`、组件 `name`、组件 `type` 和真实表字段
2. 再读 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 了解：
   - 全部组件类型的可复制模板
   - filter 筛选条件格式
   - 字段类型与操作符对应表

**Q: 为什么组件创建失败了？**
A: 常见原因：
- `table_name` 用了 table_id 而不是表名（必须用表名称，如「订单表」）
- `series` 和 `count_all` 同时存在（必须二选一，互斥）
- 字段名拼写错误（必须用 `+field-list` 获取的真实字段名，禁止猜测）
- 组件创建并发执行（必须串行，等上一个完成再执行下一个）

**Q: 可以一次创建多个组件吗？**
A: 不可以，必须串行执行。等上一个 `+dashboard-block-create` 完成后再执行下一个。

**Q: 组件的 `type` 创建后能改吗？**
A: 不能。`+dashboard-block-update` 只能修改 `name`、`data_config` 和 `position`，不能修改 `type`。

**Q: 更新组件的命令和 data_config 怎么写？**
A:
1. 先读取当前 block，确认 `block_id`、当前 `type` 和已有 `data_config`
2. 再读 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 了解 data_config 结构

**data_config 更新策略（顶层 key merge）**：
- 只传入需要修改的顶层字段（如 `series`、`filter`）
- 未传的顶层字段（如 `group_by`）自动保留原值
- 但每个传入的字段内部通常是**全量替换**（如传新 `filter` 会完整覆盖旧 `filter`）；`number_format` 例外，按子字段合并，见 [Dashboard Block 配置](lark-base-0.md#s-3eefa08fb4cd6f56) 的 number_format 小节

**Q: 查看已有组件有什么用？**
A: 在「添加新组件」或「编辑组件」前查看已有组件可以：
- 了解当前仪表盘已有哪些可视化
- 避免重复创建相似的组件
- 参考已有组件的 data_config 结构作为模板

**Q: 我想直接拿图表算好的结果给 AI 分析，应该用什么？**
A: 用 `+dashboard-block-get-data`。它返回图表协议 JSON（常见字段包括 `dimensions`、`measures`、`main_data`，指标卡可能还有 `comparison_data`、`trend_data`），不返回 block 名称、类型、布局或 `data_config`；需要这些元数据时先用 `+dashboard-block-get`。

## 写入前检查

- 创建 block 前必须知道 `base_token`、`dashboard_id`、组件 `name/type` 和 `data_config`。
- 更新 block 前必须知道 `base_token`、`dashboard_id`、`block_id`，并读过当前 block。
- `data_config` 中使用表名和字段名，不使用 table_id / field_id；名称必须来自 `+table-list` / `+field-list` 的真实返回。


<a id="s-1e1af96f8912b234"></a>

## references/lark-base-data-query.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Base data-query DSL reference

> **前置路由**: [Record 查询与分析 SOP](lark-base-0.md#s-cc7ad3628755b3c0) | **认证或授权问题**: [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流）

## 限制

- **权限要求**（按文档类型分流）：
  - **普通多维表格**：调用者拥有文档的**阅读权限**即可
  - **高级权限多维表格**：调用者必须是文档管理员，拥有 **FA（Full Access / 完全访问权限）**

  权限不足时返回权限错误。

## 推荐命令

```text
# 按字段分组计数
lark-cli base +data-query \
  --base-token MAGObxxxxx \
  --dsl '{
    "datasource": {"type": "table", "table": {"tableId": "tblxxxxxxxx"}},
    "dimensions": [{"field_name": "城市", "alias": "dim_city"}],
    "measures": [{"field_name": "城市", "aggregation": "count", "alias": "count"}],
    "shaper": {"format": "flat"}
  }'

# 带过滤条件 + 排序 + 限制条数
lark-cli base +data-query \
  --base-token MAGObxxxxx \
  --dsl '{
    "datasource": {"type": "table", "table": {"tableId": "tblxxxxxxxx"}},
    "dimensions": [{"field_name": "城市", "alias": "dim_city"}],
    "measures": [{"field_name": "金额", "aggregation": "sum", "alias": "total_amount"}],
    "filters": {
      "type": 1,
      "conjunction": "and",
      "conditions": [{"field_name": "城市", "operator": "isNot", "value": [""]}]
    },
    "sort": [{"field_name": "total_amount", "order": "desc"}],
    "pagination": {"limit": 100},
    "shaper": {"format": "flat"}
  }'

# 使用 tableName（表名）代替 tableId
lark-cli base +data-query \
  --base-token MAGObxxxxx \
  --dsl '{
    "datasource": {"type": "table", "table": {"tableName": "销售数据"}},
    "measures": [{"field_name": "金额", "aggregation": "sum", "alias": "total"}],
    "shaper": {"format": "flat"}
  }'

# 聚合或维度查询后如需读取逐条记录，先让 data-query 返回可回查的业务 key
lark-cli base +data-query \
  --base-token MAGObxxxxx \
  --dsl '{
    "datasource": {"type": "table", "table": {"tableId": "tblxxxxxxxx"}},
    "dimensions": [{"field_name": "业务编号", "alias": "biz_key"}],
    "measures": [{"field_name": "指标值", "aggregation": "max", "alias": "max_value"}],
    "filters": {
      "type": 1,
      "conjunction": "and",
      "conditions": [{"field_name": "状态", "operator": "is", "value": ["有效"]}]
    },
    "sort": [{"field_name": "max_value", "order": "desc"}],
    "pagination": {"limit": 10},
    "shaper": {"format": "flat"}
  }'
```

## 参数

| 参数                     | 必填 | 说明 |
|------------------------|------|------|
| `--base-token <token>` | 是 | Base Token（base_token） |
| `--dsl <json>`         | 是 | LiteQuery Protocol JSON DSL 查询语句。注意，本工具 schema 与 record/view 查询的 schema 不同，需要充分阅读本文档后，编写正确的 DSL，避免与其他场景的 DSL 混淆。 |

## 如何从链接中解析参数

用户通常会提供如下 URL：

```text
https://example.feishu.cn/base/<base_token>?table=<block_id>
```

不要直接把 URL 中的 `table=` 当成数据表 ID。它表示当前选中的 Base 顶层块，可能是数据表、仪表盘、工作流、文件夹或文档。先解析链接：

```text
lark-cli base +url-resolve --url "<url>" --as user
```

- `--base-token`：使用返回的 `base_token`
- 仅当返回的 `block_type` 为 `table` 时，DSL 中的 `tableId` 才使用返回的 `table_id`
- 如果返回的是其他块类型，按 `hint.next_step` 继续处理；如果只返回中性的 `block_id`，先用 `+base-block-list` 确认块类型，再选择实际要查询的数据表

## API 入参详情

**HTTP 方法和路径：**

```
POST /open-apis/base/v3/bases/:base_token/data/query
```

**Path 参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `base_token` | 是 | Base Token |

**Request Body — DSL 结构：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `datasource` | object | 是 | 数据源，包含 `type`（固定 `"table"`）和 `table` 对象 |
| `datasource.table.tableId` | string | 二选一 | 目标数据表 ID |
| `datasource.table.tableName` | string | 二选一 | 目标数据表名称 |
| `dimensions` | Dimension[] | 否* | 分组维度字段（GROUP BY） |
| `measures` | Measure[] | 否* | 聚合度量字段 |
| `filters` | FilterGroup | 否 | 过滤条件（WHERE） |
| `sort` | Sort[] | 否 | 排序规则 |
| `pagination` | object | 否 | 限制返回行数，`{limit: N}`，最大 5000 |
| `shaper` | object | 否 | 结果格式，固定 `{format: "flat"}` |

> \* `dimensions` 和 `measures` 至少填写一个。

**Dimension 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名称 |
| `alias` | string | 否 | 输出列别名，需全局唯一 |

**Measure 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名称 |
| `aggregation` | string | 是 | 聚合函数：`sum`、`avg`、`min`、`max`、`count`、`count_all`、`distinct_count` |
| `alias` | string | 否 | 输出列别名，需全局唯一 |

**聚合函数适用字段类型：**

| 聚合函数 | 适用字段类型 |
|----------|-------------|
| `sum` / `avg` | `number` |
| `min` / `max` | `number`、`datetime` |
| `count` | 全字段适用，计数非空值 |
| `count_all` | 全字段适用，计数所有行 |
| `distinct_count` | 全字段适用 |

> `number` 包含 `style.type` 为 `progress` / `currency` / `rating` 等所有子类型。

**FilterGroup：**

```json
{
  "filters": {
    "type": 1,
    "conjunction": "and",
    "conditions": [
      {"field_name": "城市", "operator": "is", "value": ["北京"]}
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | int | 是 | 固定填 `1` |
| `conjunction` | string | 否 | 条件组合逻辑：`"and"` 或 `"or"`，默认 `"and"` |
| `conditions` | Condition[] | 否 | 条件列表 |

**Condition：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名称（必须与表中字段名精确匹配） |
| `operator` | string | 是 | 运算符（见下方运算符表） |
| `value` | string[] | 是 | 条件值数组；`isEmpty`/`isNotEmpty` 时**必须**传空数组 `[]` |

**运算符：**

| 运算符 | 说明 |
|--------|------|
| `is` | 等于 |
| `isNot` | 不等于 |
| `contains` | 包含 |
| `doesNotContain` | 不包含 |
| `isEmpty` | 为空 |
| `isNotEmpty` | 不为空 |
| `isGreater` | 大于 |
| `isGreaterEqual` | 大于等于 |
| `isLess` | 小于 |
| `isLessEqual` | 小于等于 |

> 各运算符的适用字段类型见下方「按各字段类型筛选时 value 格式详解」。

**按各字段类型筛选时 value 格式详解：**

*`text`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` / `contains` / `doesNotContain` | `["文本内容"]` | 仅 1 个 | `["Hello"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：文本无自然顺序，比较运算无意义。
> `text` 也覆盖电话、超链接、邮箱、条码字段；通过 `style.type` 区分（`plain`（默认）/ `phone` / `url` / `email` / `barcode`），运算符集合一致。
> 当 `style.type=url` 时，value 筛选的是链接显示名称，而不是 URL 本身。

*`number`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` / `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual` | `["数字字符串"]` | 仅 1 个 | `["23.4"]`、`["-100"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> value 必须为合法数字的字符串形式。
> `number` 也覆盖货币、进度、评分字段；通过 `style.type` 区分（`plain`（默认）/ `currency` / `progress` / `rating`），运算符集合一致，仅 value 解释不同：
> - 当 `style.type=progress` 时，34% 对应 0.34 而不是 34。
> - 当 `style.type=rating` 时，必须输入整数，代表评分。

*`auto_number`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` / `contains` / `doesNotContain` | `["编号字符串"]` | 仅 1 个 | `["00001"]` |
| `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual` | `["编号字符串"]` | 仅 1 个 | `["00010"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

*`select`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` | `["选项名"]` | **仅 1 个** | `["选项A"]` |
| `contains` / `doesNotContain` | `["选项A", "选项B"]` | 可多个 | `["选项A", "选项B"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：选项为枚举值，无自然顺序。
> 通过 `multiple` 区分单选（`multiple=false`，默认）/ 多选（`multiple=true`）。

*`user` / `created_by` / `updated_by`*

| 运算符 | value 格式 | 元素个数 | 示例                     |
|--------|-----------|---------|------------------------|
| `is` / `isNot` | `["用户ID1", "用户ID2"]` | **可多个** | `["ou_aaa", "ou_bbb"]` |
| `contains` / `doesNotContain` | `["用户ID1", "用户ID2"]` | 可多个 | `["ou_aaa", "ou_bbb"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]`                   |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：人员无法比大小。
> 用户 ID 使用 `open_id`（`ou_` 前缀），接口层会自动做 ID 转换。

*`group_chat`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` | `["群组ID1", "群组ID2"]` | 可多个 | `["oc_aaa", "oc_bbb"]` |
| `contains` / `doesNotContain` | `["群组ID1", "群组ID2"]` | 可多个 | `["oc_aaa", "oc_bbb"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：群组无法比大小。

*`link`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` | `["recId1", "recId2"]` | 可多个 | `["recAAA", "recBBB"]` |
| `contains` / `doesNotContain` | `["recId1", "recId2"]` | 可多个 | `["recAAA", "recBBB"]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：关联记录无法比大小。
> value 传关联表记录的 `record_id`。
> 双向关联（创建时设 `bidirectional=true`）也属于 `link` 类型，运算符与单向关联一致。

*`location`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` / `isNot` / `contains` / `doesNotContain` | `["地址文本"]` | 仅 1 个 | `["北京市朝阳区..."]` |
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> **不支持** `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`：地理位置无自然顺序。
> location 按 `full_address` 字符串筛选，不支持经纬度空间筛选；查城市/片区时优先用 `contains`，避免用 `is` 匹配短地址词。

*`checkbox`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `is` | `["true"]` 或 `["false"]` | 仅 1 个 | `["true"]` |

> 仅支持 `is` 运算符，不支持其他运算符。

*`datetime` / `created_at` / `updated_at`*

日期字段仅支持 `is`、`isEmpty`、`isNotEmpty`、`isGreater`、`isLess` 五种运算符。

value 使用预定义关键字机制，第一个元素为字符串常量名称：

| 关键字 | 说明 | value 格式 | 支持的运算符 |
|--------|------|-----------|-------------|
| `ExactDate` | 精确日期 | `["ExactDate", "1773187200000"]`（毫秒时间戳） | `is`、`isGreater`、`isLess` |
| `Today` | 今天 | `["Today"]` | `is`、`isGreater`、`isLess` |
| `Tomorrow` | 明天 | `["Tomorrow"]` | `is`、`isGreater`、`isLess` |
| `Yesterday` | 昨天 | `["Yesterday"]` | `is`、`isGreater`、`isLess` |
| `CurrentWeek` | 本周 | `["CurrentWeek"]` | 仅 `is` |
| `LastWeek` | 上周 | `["LastWeek"]` | 仅 `is` |
| `CurrentMonth` | 本月 | `["CurrentMonth"]` | 仅 `is` |
| `LastMonth` | 上月 | `["LastMonth"]` | 仅 `is` |
| `TheLastWeek` | 过去七天 | `["TheLastWeek"]` | 仅 `is` |
| `TheNextWeek` | 未来七天 | `["TheNextWeek"]` | 仅 `is` |
| `TheLastMonth` | 过去三十天 | `["TheLastMonth"]` | 仅 `is` |
| `TheNextMonth` | 未来三十天 | `["TheNextMonth"]` | 仅 `is` |

> - **ExactDate 时区行为**：毫秒时间戳在实际筛选时会被转为**文档时区当天零点**，跨时区场景需注意日期可能偏移一天。
> - **范围型关键字**（`CurrentWeek`、`LastWeek`、`CurrentMonth`、`LastMonth`、`TheLastWeek`、`TheNextWeek`、`TheLastMonth`、`TheNextMonth`）仅支持 `is` 运算符。
> - **关键字大小写敏感**：`ExactDate`、`Today`、`CurrentWeek` 等首字母大写，写错大小写会导致校验失败。

*`attachment`*

| 运算符 | value 格式 | 元素个数 | 示例 |
|--------|-----------|---------|------|
| `isEmpty` / `isNotEmpty` | `[]` | 0 个 | `[]` |

> 附件字段仅支持 `isEmpty` 和 `isNotEmpty`，不支持其他运算符。

*`formula` / `lookup`*

公式和查找引用字段的运算符和 value 格式 **取决于其结果数据类型**，按结果类型参照上方对应字段类型的规则。例如：

- 公式结果为数字 → 按 `number` 规则
- 公式结果为日期 → 按 `datetime` 规则
- 公式结果为单选 → 按 `select` 规则

**Sort 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名称或 alias |
| `order` | string | 否 | `"asc"`（默认）或 `"desc"` |

**Pagination 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `limit` | int | 否 | 返回记录数上限，必须为正整数，最大 5000；不填时使用系统默认值。不支持 offset |

**Shaper 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `format` | string | 是 | 固定为 `"flat"`，表示返回扁平化的对象数组 |

## CLI 出参详情

CLI 输出标准信封 `{ok, identity, data}`（失败时为 `{ok:false, identity, error}`）。

**成功时：**

```json
{"ok": true, "identity": "user", "data": {"main_data": [{"dim_city": {"value": "北京"}, "total_amount": {"value": 12345.00}}, ...]}}
```

**失败时：**

```json
{"ok": false, "identity": "user", "error": {"type": "api", "subtype": "unknown", "code": 800004006, "message": "...does not exist in table schema", "hint": "...", "log_id": "..."}}
```

**Response 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `ok` | bool | 是否成功 |
| `identity` | string | 执行身份：`user` / `bot` |
| `data.main_data` | []object | 查询结果数组，每个元素为一行数据（成功时） |
| `error` | object | 失败时的 typed 错误，含 `type` / `subtype` / `code` / `message` / `hint` / `log_id` |

每行数据的字段值封装在 CellValue 中：

```json
{
  "dim_city": {
    "value": "北京"
  },
  "total_amount": {
    "value": 12345.00
  }
}
```

- `value`：展示值（人员名称、选项名称、格式化日期等）

## 返回值

命令成功后输出 `data` 字段的内容：

```json
{
  "main_data": [
    {
      "dim_city": {"value": "直营"},
      "measure_count": {"value": 1}
    },
    {
      "dim_city": {"value": "加盟"},
      "measure_count": {"value": 2}
    }
  ]
}
```

## 工作流

1. 确认 base-token 和 table-id
2. **先查表结构**：执行 `lark-cli base +field-list --base-token <base_token> --table-id <table_id>`
3. 从返回的字段列表中获取 field_name（DSL 中使用的字段名称）
4. 根据字段信息构造 DSL JSON
5. 执行 +data-query
6. 解读返回结果：
   - 结果在 `data.main_data` 数组中，每个元素代表一行
   - 每行对象的 key 为 DSL 中指定的 `alias`；未指定 alias 时，key 为自动生成的列名
   - 每个 value 是 CellValue 对象，实际值在 `value` 字段中，如 `{"value": "北京"}` 或 `{"value": 12345.00}`
   - 失败时结果在 `data.error` 中，包含具体错误码和信息

## 与记录读取组合

`+data-query` 可返回聚合结果，也可在只传 `dimensions` 时返回维度字段行；这些维度行按字段组合去重，不包含 `record_id`，不能等同于逐条原始记录。需要输出聚合结果对应的原始记录字段、展示值、记录定位信息或关联表字段时，按以下方式组合：

1. 用 `+data-query` 在 Base 云端查询服务中完成全局筛选、分组、聚合、排序和 TopN，得到业务 key、分组值或候选字段组合。
2. 如果已经拿到候选记录的 `record_id`，用 `+record-get` 读取逐条记录字段。
3. 如果拿到的是结构化业务 key（例如编号、状态、日期、金额等），用 `+record-list --filter-json` 做精确过滤后读取；`+record-search` 用于文本展示值关键词。
4. 只有候选条件本身是文本展示值关键词时，才使用 `+record-search`，并用 `search_fields` 限定范围、`select_fields` 做投影。
5. 若候选记录包含 link 字段，提取关联 `record_id` 后到关联表用 `+record-get` 批量读取展示字段。
6. 最终回答展示真实业务字段；内部 `record_id` 用于连接或定位。

不要把 `data-query pagination.limit` 理解为分页扫描；它只限制 Base 云端查询服务返回的聚合结果行数，不支持 offset。需要逐条原始记录时按 [Record 查询与分析 SOP](lark-base-0.md#s-cc7ad3628755b3c0) 的完整读取或回查路径处理。

## 坑点

- ⚠️ **必须先查表结构**：DSL 的 `field_name` 必须与表中字段名称精确匹配（区分大小写），不能凭猜测构造。先用 `lark-cli base +field-list --base-token <base_token> --table-id <table_id>` 获取真实字段名
- ⚠️ **权限要求按文档类型分流**：普通多维表格只需文档**阅读权限**；高级权限多维表格必须是文档管理员（**FA / Full Access**），否则返回权限错误
- ⚠️ **alias 不支持中文**：dimensions 和 measures 的 alias 必须使用英文（如 `dim_city`、`total_amount`），中文 alias 会导致错误
- ⚠️ **API 路径是 `base/v3`**：本接口路径为 `/open-apis/base/v3/bases/:base_token/data/query`，不是 `bitable/v1`。两者完全不同，用错版本号会返回 `[2200] Internal Error`
- ⚠️ **`dimensions` 和 `measures` 至少填一个**：两个都不填会返回 DSL 校验错误
- ⚠️ **`shaper` 必须为 `{"format": "flat"}`**：不填或填其他值会导致结果格式不可预期，建议始终显式指定
- ⚠️ **数据表标识 `tableId` vs `tableName`**：datasource 中可以用 `tableId`（如 `tblXXX`）或 `tableName`（数据表的用户自定义显示名称），二选一，不要混用
- ⚠️ **`pagination.limit` 最大 5000**：超过会报错，且不支持 offset，只支持 limit
- ⚠️ **所有 alias 必须全局唯一**：dimensions 和 measures 之间的 alias 也不能重名

## 参考

- [lark-base](lark-base-0.md#s-f9ade3356084cb11) — 多维表格全部命令
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数
- [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc) — 字段类型与 JSON 结构


<a id="s-e0307fe646be43e6"></a>

## references/lark-base-field-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +field-create

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

创建一个或多个字段；同一表的多个字段优先使用一次 JSON 数组输入。

`formula` / `lookup` 创建前读取对应 guide；涉及跨表引用时同时读取目标表结构。

## 推荐命令

```text
lark-cli base +field-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --json '{"name":"预算","type":"number","style":{"type":"plain","precision":2}}'

lark-cli base +field-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --json '{"name":"状态","type":"select","multiple":false,"default_value":["Todo"],"options":[{"name":"Todo","hue":"Blue","lightness":"Lighter"},{"name":"Done","hue":"Green","lightness":"Light"}]}'

# 多个字段复用相同字段 JSON 形状，一次传非空数组
lark-cli base +field-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --json '[{"name":"备注","type":"text"},{"name":"优先级","type":"select","multiple":false,"options":[{"name":"高"},{"name":"低"}]}]'
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token |
| `--table-id <id_or_name>` | 是 | 表 ID 或表名 |
| `--json <body>` | 是 | 单个字段 JSON 对象，或多个字段对象组成的非空数组 |

## API 入参详情

**HTTP 方法和路径：**

```
POST /open-apis/base/v3/bases/:base_token/tables/:table_id/fields
```

## JSON 值规范

- `--json` 接受单个字段 **JSON 对象**，也接受多个字段对象组成的非空数组；不要再套 `fields` 等外层对象。
- 数组按顺序创建字段，遇到首个失败即停止且不自动回滚；部分失败时保留 `items` 中的 `created` 项，按 `hint` 修正后只提交 `failed` 和 `not_attempted` 项，并保持依赖顺序。
- 每个字段对象最少包含：`name`、`type`。
- 所有字段类型都支持可选 `description`；支持纯文本，也支持 Markdown 链接，如 `协作约定可参考[团队字段约定](https://example.com/field-spec)`。
- 需要字段默认值时传 `default_value`，直接使用字段对应 CellValue；`datetime` / `user` 的动态填充用 `$slot`。完整规则见 [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc)。
- `type` 不同，必填子字段不同：
  - `select`：`multiple` 控制是否多选，`options` 定义静态选项，`dynamic_options_source` 定义动态选项来源。静态与动态选项配置二选一，不能同时传。
  - `link`：必须有 `link_table`，可选 `bidirectional`、`bidirectional_link_field_name`。
  - `formula`：必须有 `expression`；先读 formula guide，再创建。
  - `lookup`：必须有 `from`、`select`、`where`；先读 lookup guide，再创建。

**正确（base +field-create）**

```json
{
  "name": "状态",
  "type": "select",
  "multiple": false,
  "default_value": ["Todo"],
  "options": [
    { "name": "Todo", "hue": "Blue", "lightness": "Lighter" },
    { "name": "Done", "hue": "Green", "lightness": "Light" }
  ]
}
```

## 参考

- [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc) — 字段 JSON 规范（推荐）
- [Formula Field](lark-base-0.md#s-b26660f08d3f8148) — 创建公式必读
- [Lookup Field](lark-base-0.md#s-c44aa7298dcfa089) — 创建查找引用必读


<a id="s-2f972de6d0cce9a2"></a>

## references/lark-base-field-extension.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base field-extension

字段插件用于扩展基础字段能力，当同行其他单元格更新时，触发 LLM 推理生成新单元格。当前公开支持的插件 ID 只有 `builtin_llm_completion`，已确认可用于文本、单选、数字字段，让目标字段基于 prompt 和字段引用生成内容，并可手动触发该字段的单元格异步更新任务。

三个命令：

- `+field-extension-get`：读取目标字段当前可识别的插件配置。
- `+field-extension-update`：安装、更新或清空目标字段插件配置。
- `+field-extension-update-cells`：对已配置字段插件的目标字段发起手动更新任务。

## 何时使用字段插件

用户明确要让某个已有字段根据其他字段自动生成内容、总结、分类、翻译、提取信息，且目标能力可以用 prompt 表达时，使用字段插件。当前已确认的目标字段类型是文本、单选、数字。

字段插件只能建立在已有字段上，不能创建列 schema。新建字段仍使用 `+field-create`；修改字段类型、选项、名称等 schema 属性仍使用 `+field-update`。

## 推荐命令

```text
# 读取当前插件配置
lark-cli base +field-extension-get \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <target_field_id> \
  --as user

# 安装或更新 LLM Completion 插件
lark-cli base +field-extension-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <target_field_id> \
  --json '{"extension_id":"builtin_llm_completion","inputs":{"prompt":[{"type":"text","text":"请根据 "},{"type":"field_ref","field":"需求描述"},{"type":"text","text":" 输出一句简洁结论。"}]}}' \
  --as user \
  --yes

# 清空字段插件配置
lark-cli base +field-extension-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <target_field_id> \
  --json '{}' \
  --as user \
  --yes

# 按视图范围触发整列更新
lark-cli base +field-extension-update-cells \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <target_field_id> \
  --type column \
  --view-id <view_id> \
  --as user \
  --yes

# 只更新指定记录
lark-cli base +field-extension-update-cells \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <target_field_id> \
  --type row \
  --record-id <record_id_1> \
  --record-id <record_id_2> \
  --as user \
  --yes
```

## 工作流

1. 定位 Base、Table 和目标 Field。目标 Field 是承载插件输出的已有字段，不是 prompt 中被引用的输入字段。
2. 用 `+field-extension-get` 读取当前配置。返回 `current_extension=null` 表示未配置、无法识别或存量配置无法转换。
3. 构造 `+field-extension-update --json`。安装或更新时传 `extension_id=builtin_llm_completion` 和 `inputs.prompt`；清空时传 `{}`。
4. 配置成功后，只有用户明确要立即生成或刷新已有单元格时，才调用 `+field-extension-update-cells` 发起异步生成任务。
5. 需要验收结果时，等待任务完成或稍后用记录读取命令抽样查看目标字段单元格；`update_cells` 只返回任务 ID，不直接返回生成结果。

## JSON 结构

### 通用结构

`+field-extension-update --json` 的顶层结构是字段插件配置 envelope。不同 `extension_id` 对应不同的 `inputs` 结构；不要把某个插件的 `inputs` 当成所有字段插件的固定结构。

| 字段 | 类型 | 说明 |
|---|---|---|
| `extension_id` | string | 插件 ID。当前公开只支持 `builtin_llm_completion` |
| `inputs` | object | 插件配置对象，结构由 `extension_id` 决定 |

清空字段插件配置时传空对象：

```json
{}
```

### `builtin_llm_completion`

当前 `builtin_llm_completion` 用于让已有字段根据 prompt 生成内容。它的 `inputs` 结构如下：

| 字段 | 类型 | 说明 |
|---|---|---|
| `inputs.prompt` | PromptSegment[] | 有序 prompt 片段数组 |
| `prompt[].type` | string | `text` 或 `field_ref` |
| `prompt[].text` | string | `type=text` 时必填 |
| `prompt[].field` | string | `type=field_ref` 时必填，可传当前表的字段 ID 或字段名 |

安装或更新示例：

```json
{
  "extension_id": "builtin_llm_completion",
  "inputs": {
    "prompt": [
      {
        "type": "text",
        "text": "请根据 "
      },
      {
        "type": "field_ref",
        "field": "需求描述"
      },
      {
        "type": "text",
        "text": " 输出一句简洁的中文结论。"
      }
    ]
  }
}
```

`field_ref` 只能引用当前表中的其他字段，不能引用目标字段自身；附件字段和其他不支持字段不要作为引用字段。

## 更新单元格

`+field-extension-update-cells` 有两种范围：

这是异步生成任务，响应只表示任务已创建。单元格越多，生成和写回通常耗时越久；整列更新尤其需要控制范围。

| 范围 | 参数 | 语义 |
|---|---|---|
| `--type column` | 可选 `--view-id` | 更新目标字段在该视图范围内的单元格；不传 `--view-id` 时后端使用目标表首视图 |
| `--type row` | 必填一个或多个 `--record-id` | 只更新这些记录上的目标字段单元格 |

`--type row` 不要传 `--view-id`；`--type column` 不要传 `--record-id`。

响应只返回：

```json
{
  "task_id": "<task_id>"
}
```

## 返回重点

读取和写配置都返回 `current_extension`：

- 已配置并可识别时，`current_extension.extension_id` 表示插件 ID，`current_extension.inputs` 是该插件对应的配置对象。
- 未配置或当前无法识别时，`current_extension` 为 `null`。

## 权限和风险

- `+field-extension-get` 是只读命令，权限 `base:field:read`。
- `+field-extension-update` 是高风险写命令，权限 `base:field:update`，会改变目标字段的自动生成配置，执行时必须带 `--yes`。
- `+field-extension-update-cells` 是高风险写命令，权限 `base:record:update`，会触发目标字段单元格异步写回，执行时必须带 `--yes`。
- 用户需要具备管理目标表或目标字段插件的权限才能触发更新任务；如果接口返回权限不足，先按 Base 权限或高级权限角色确认用户权限。

## 注意事项

- 目标字段必须是当前字段插件已支持的字段类型；当前已确认支持文本、单选、数字字段。不要把字段插件当成任意字段类型都可用的通用能力。
- 写入插件配置后，自动更新会强制开启；当前不提供关闭自动更新的参数。
- 读取接口中的 `field_ref.field` 通常返回字段名称；字段名称不可用时可能返回字段 ID。
- `+field-extension-update` 不返回 `input_schemas`。
- `+field-extension-update-cells --type column` 可能触发大量 AI 生成任务，单元格越多耗时通常越久；除非用户明确要求整列刷新，否则优先按 `--type row` 精确更新目标记录。


<a id="s-b26660f08d3f8148"></a>

## references/lark-base-field-formula.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Formula Field

## Mandatory Read Acknowledgement

When creating or updating a formula field with `lark-cli base +field-create/+field-update --json ...` and `type` is `formula`, you should read this guide first and only then add `--i-have-read-guide` to the command.

Do **not** proactively add `--i-have-read-guide` before reading this guide. Without it, the CLI will fail fast and direct you back to this guide.

When using `+field-update`, also pass `--yes`: field update is a high-risk `PUT` operation because changing a field definition can affect the whole column.

## Default strategy

**All cross-table references, aggregations, and computed fields should use Formula fields by default.** Do NOT use Lookup fields unless the user explicitly requests it. Formula is a strict superset of Lookup — anything Lookup can do, Formula can do with a single expression.

## Usage

When creating a formula field, the Agent should:

1. Get all table names: `lark-cli base +table-list --base-token <base>` — returns `items[].table_name`
2. Get table structure: `lark-cli base +table-get --base-token <base> --table-id <table>` — returns `fields[]`
3. If the formula references other tables, also get those tables' structures
4. Write the formula expression following this guide
5. Construct the Formula field JSON and submit it to create or update the field

**Key constraints**:

- The JSON must include `"type": "formula"` — this field is required
- Table names and field names in the formula must **exactly match** those returned by `+table-list` / `+table-get`
- The `expression` value is a string containing the formula expression; double quotes inside the expression must be properly escaped in JSON (e.g. `\"text\"`)

---

## Section 1: Core Concepts — Scalar vs List

This is the foundation of formula logic. You must determine this before writing any formula.

| Syntax                | Meaning                                      | Return type            | Example                                      |
| --------------------- | -------------------------------------------- | ---------------------- | -------------------------------------------- |
| `[Field]`             | Value of this field in the current row       | Scalar (single value)  | `[Name]` → `"Alice"`                         |
| `[TableName].[Field]` | All values of this field in the target table | List (multiple values) | `[Employees].[Name]` → `["Alice","Bob",...]` |
| `[TableName]`         | The target table (entire table)              | Table reference        | Used as data range for FILTER/COUNTIF etc.   |

**Rules**:

- Scalars can be used directly in operations: `[Price] * [Quantity]`
- Lists cannot be used as scalars — they must be processed first: use `SUM()` for sum, `ARRAYJOIN(",")` for joining, `FIRST()`/`LAST()`/`NTH()` for single value extraction
- Link field access `[LinkField].[TargetField]` returns a list (values of the target field for all linked records)
- **LISTCOMBINE flattening rule**: When a FILTER's result column is itself a multi-value field (`select` with `multiple=true`, `link`, etc.), it produces a 2D array and **must** be flattened with `.LISTCOMBINE()`; for single-value fields (`number`, `text`, etc.) it can be omitted, but adding it is never wrong:

  ```
  [Table].FILTER(CurrentValue.[Field] = [Value]).[Tags].LISTCOMBINE() ← required for multi-value columns
  [Table].FILTER(CurrentValue.[Field] = [Value]).[NumberCol].LISTCOMBINE() ← optional for single-value columns
  ```

---

## Section 2: Data Types and Type Conversion

### Field storage types

| Type | Description | Supported operations |
|------|-------------|----------------------|
| `number` | Stored as numeric value | Math operations, comparisons, auto-converts to string for concatenation |
| `text` | Stored as string | String operations; can participate in math if content is numeric, otherwise errors |
| `datetime` | Date object | Date functions, add/subtract with numbers; auto-converts to default format string when using `&` — use TEXT to format first for controlled output |
| `select` (`multiple=true`) | Data list | List functions, CONTAIN checks |
| `link` | Links to other table records | Chained access `[LinkField].[Field]`, result is a list |
| `checkbox` | TRUE/FALSE | Logical operations; auto-converts to number when compared with numbers |

### Implicit type conversion

| Scenario                     | Conversion rule                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Number + Float               | → Float                                                                                                     |
| Date + Number                | → Date (adds/subtracts days). Use `+`/`-` for whole days, use `DURATION()` for hour/minute/second precision |
| Date - Date                  | → Duration                                                                                                  |
| Boolean compared with Number | Boolean auto-converts to number (TRUE=1, FALSE=0)                                                           |
| `&` concatenation            | Both sides auto-convert to string                                                                           |

### Type consistency in comparisons

When using comparison operators (`>`, `>=`, `<`, `<=`, `=`, `!=`), **both sides should be the same type** to avoid semantic errors or unexpected results.

**Principle**: When types differ, explicitly convert one side rather than relying on implicit conversion:

- `number` vs `text` → use `VALUE()` to convert text to number
- `datetime` vs `text` → use `TEXT()` to convert date to text
- `datetime` vs `datetime` equality → dates include time components, so direct `=` comparison may fail due to different hours/minutes/seconds. For day-level equality, convert to text first: `TEXT([DateA], "YYYY/MM/DD") = TEXT([DateB], "YYYY/MM/DD")`
- `select` and `user` fields can be compared with both same-type values and text
- `text` fields in numeric aggregation (SUM/AVERAGE/MIN/MAX etc.) → convert to number with `VALUE()` first. For FILTER results, use `.MAP(VALUE(CurrentValue)).SUM()`

---

## Section 3: CurrentValue

**CurrentValue is the iteration variable in FILTER/MAP/COUNTIF/SUMIF functions, representing the "current item" being processed in the data range.**

### CurrentValue meaning in different contexts

| Data range type              | CurrentValue represents | Access pattern              | Example                                                   |
| ---------------------------- | ----------------------- | --------------------------- | --------------------------------------------------------- |
| Entire table `[TableName]`   | A row in the table      | `CurrentValue.[FieldName]`  | `[Orders].FILTER(CurrentValue.[Amount] > 100).[Customer]` |
| Column `[TableName].[Field]` | A single field value    | Use `CurrentValue` directly | `[Orders].[Amount].FILTER(CurrentValue > 100)`            |
| `select` (`multiple=true`) field `[Tags]` | One option | Use `CurrentValue` directly | `[Tags].FILTER(CurrentValue = "Important")` |
| LIST-generated list          | One element             | Use `CurrentValue` directly | `LIST(1,2,3).MAP(CurrentValue * 2)`                       |

### Key rules

1. **When data range is a table**, use `CurrentValue.[FieldName]` to access row fields
2. **When data range is a column/list**, use `CurrentValue` directly for the element value — **cannot** use `CurrentValue.[FieldName]`
3. CurrentValue can **only** appear inside the condition/mapping parameters of FILTER/MAP/COUNTIF/SUMIF functions
4. To reference the current table's field value in a condition, write `[FieldName]` directly — it refers to the formula row's value, not a property of CurrentValue

### Anti-patterns

| Wrong                                          | Reason                                                                            | Correct                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `[Table].[Col].FILTER(CurrentValue.[Col] > 0)` | Data range is a column; CurrentValue is a scalar, cannot use `.` to access fields | `[Table].[Col].FILTER(CurrentValue > 0)`               |
| `[Table].FILTER(CurrentValue > 100)`           | Data range is a table; CurrentValue is a row, cannot compare directly             | `[Table].FILTER(CurrentValue.[Amount] > 100).[Amount]` |
| `CurrentValue + 1` (at top level)              | CurrentValue can only be used inside iteration functions                          | Use inside MAP/FILTER etc.                             |

---

## Section 4: Operators

Base formulas **only allow** the following operators. `like`, `in`, `<>`, `**`, `^` etc. are prohibited.

| Category      | Operators                  | Description                                                                |
| ------------- | -------------------------- | -------------------------------------------------------------------------- |
| Arithmetic    | `+` `-` `*` `/` `%`        | Add, subtract, multiply, divide, modulo (`%` is equivalent to `MOD()`)     |
| Comparison    | `>` `>=` `<` `<=` `=` `!=` | Greater than, greater or equal, less than, less or equal, equal, not equal |
| Logical       | `&&` `\|\|`                | AND, OR                                                                    |
| Concatenation | `&`                        | Text concatenation; non-text values auto-convert to string                 |

**Important**:

- Equality uses `=` (single equals), not `==`
- Not-equal uses `!=`, not `<>`
- String concatenation uses `&`, not `+`
- Both `&&`/`||` and AND()/OR() functions are supported

---

## Section 5: Link Fields and Cross-Table References

### Link field description

When a field type is described as `FieldName: Link [target table: X, foreign key: Y]`, it links to target table X using field Y as the join key.

### Chained cross-table access

```
[LinkField].[TargetField]
```

Retrieves the target field values for all linked records as a list. Supports continued chaining: `[LinkA].[LinkB].[Field]`.

### Equivalent expanded form

- Multi-value link: `[TargetTableX].FILTER([LinkField].CONTAIN(CurrentValue.[Y])).[TargetField].LISTCOMBINE()`
- Single-value link: `[TargetTableX].FILTER(CurrentValue.[Y] = [LinkField]).[TargetField].LISTCOMBINE()`

(`.LISTCOMBINE()` is required when `[TargetField]` is a multi-value field; optional for single-value fields)

### Notes

- Link fields typically return **lists** (possibly empty)
- To output a single value, use aggregation (SUM/MAX), joining (ARRAYJOIN), or extraction (FIRST/LAST/NTH)
- Do not nest FILTER inside FILTER for cross-table queries — prefer link field chained access

---

## Section 6: Function Call Conventions

### Two calling styles

| Style      | Format             | Description                         |
| ---------- | ------------------ | ----------------------------------- |
| Functional | `FUNC(arg1, arg2)` | Works for all functions             |
| Chained    | `arg1.FUNC(arg2)`  | Moves the first argument before `.` |

**Rules**:

- Zero-argument functions cannot be chained: `NOW()`, `TODAY()`, `PI()`, `TRUE()`, `FALSE()`
- SORTBY can **only** be chained: `[Table].SORTBY([Table].[SortCol]).[OutputCol]`. The sort column always uses the original table's column name (`[TableName].[Field]` format); the engine aligns rows internally, even when the data range is a FILTER result
- FILTER is recommended to be chained: `[Table].FILTER(condition).[OutputCol]`

### FILTER / SORTBY result column rules

- **When data range is a table** `[TableName]`, FILTER / SORTBY returns a table reference. The chain **must** end with `.[Field]` to specify the result column, otherwise the formula fails:

  ```
  Correct: [Sales].FILTER(CurrentValue.[Amount] > 100).[Customer]
  Correct: [Sales].FILTER(condition).SORTBY([Sales].[SortCol]).[Customer]  ← result column at end of chain
  Wrong: [Sales].FILTER(CurrentValue.[Amount] > 100) ← missing result column
  ```

- **When data range is a column** `[TableName].[Field]` or a list, FILTER returns the filtered list directly — **no** result column needed:

  ```
  Correct: [Sales].[Amount].FILTER(CurrentValue > 100)
  ```

After the result column, it's recommended to flatten with `.LISTCOMBINE()` first (especially when the result column is a multi-value field), then chain aggregation functions:

```
[Sales].FILTER(CurrentValue.[Amount] > 100).[Amount].LISTCOMBINE().SUM()
```

---

## Section 7: Hard Constraints

1. **Nesting prohibition**: FILTER / SUMIF / COUNTIF / MAP **must not be nested** inside each other's condition/mapping expressions. None of these functions can appear inside the condition or mapping parameter of another.
   - Prohibited: `[Table1].FILTER(CurrentValue.[Col] = [Table2].FILTER(...).[Col])` ← FILTER inside FILTER condition
   - Prohibited: `[Table].MAP([Table2].MAP(...))` ← MAP inside MAP mapping
   - **Allowed**: `[Table].FILTER(cond1).[Col].FILTER(cond2)` ← chained call; the first FILTER's output is the second's data range, not nesting

2. **Function whitelist**: Only use functions listed in Section 8. No unlisted functions.

3. **Exact name matching**: Table names and field names in formulas must **exactly match** those returned by `+table-get` — no renaming or adding spaces.

4. **Operator whitelist**: Only use operators listed in Section 4.

5. **Strings use double quotes**: Strings must be wrapped in double quotes `"`, single quotes are not supported.

6. **Do not use LOOKUP**: FILTER is a superset of LOOKUP. All LOOKUP formulas can be rewritten with FILTER. Use FILTER exclusively to reduce complexity.

---

## Section 8: Complete Function Reference

### 8.1 Logic functions

| Function      | Signature                                                          | Return type          | Description                                                                                  |
| ------------- | ------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------- |
| IF            | `IF(condition, true_val, [false_val])`                             | Matches branch type  | Returns true_val when TRUE, false_val otherwise; omitting false_val returns false (not null) |
| IFS           | `IFS(cond1, val1, cond2, val2, ...)`                               | Matches branch type  | Multi-condition branching; returns value for the first TRUE condition                        |
| SWITCH        | `SWITCH(expr, match1, result1, [match2, result2, ...], [default])` | Matches branch type  | Matches expression value and returns corresponding result                                    |
| IFERROR       | `IFERROR(expr, fallback)`                                          | Matches branch type  | Returns fallback when expression errors                                                      |
| IFBLANK       | `IFBLANK(expr, fallback)`                                          | Matches branch type  | Returns fallback when expression is blank (blank = NULL/empty string/empty list)             |
| AND           | `AND(cond1, cond2, ...)`                                           | Boolean              | TRUE when all conditions are TRUE                                                            |
| OR            | `OR(cond1, cond2, ...)`                                            | Boolean              | TRUE when any condition is TRUE                                                              |
| NOT           | `NOT(condition)`                                                   | Boolean              | Logical negation                                                                             |
| ISBLANK       | `ISBLANK(value)`                                                   | Boolean              | Tests if blank (NULL/empty string/empty list are blank; 0 and FALSE are not)                 |
| ISNULL        | `ISNULL(value)`                                                    | Boolean              | Tests if NULL (only NULL is true; empty string is not)                                       |
| ISERROR       | `ISERROR(expr)`                                                    | Boolean              | Tests if expression errors                                                                   |
| ISNUMBER      | `ISNUMBER(value)`                                                  | Boolean              | Tests if value is a number                                                                   |
| CONTAIN       | `CONTAIN(search_range, value, ...)`                                | Boolean              | Tests if a list or `select` (`multiple=true`) contains the value; **does NOT do text substring matching** |
| CONTAINSALL   | `CONTAINSALL(search_range, value, ...)`                            | Boolean              | Tests if a list or `select` (`multiple=true`) contains all specified values |
| CONTAINSONLY  | `CONTAINSONLY(search_range, value, ...)`                           | Boolean              | Tests if a list or `select` (`multiple=true`) contains only the specified values |
| TRUE          | `TRUE()`                                                           | Boolean              | Returns TRUE                                                                                 |
| FALSE         | `FALSE()`                                                          | Boolean              | Returns FALSE                                                                                |
| RECORD_ID     | `RECORD_ID()`                                                      | Text                 | Returns the current row's record ID                                                          |
| RANDOMBETWEEN | `RANDOMBETWEEN(min_int, max_int, [keep_updating])`                 | Number               | Random integer in the specified range                                                        |
| RANDOMITEM    | `RANDOMITEM(list, [keep_updating])`                                | Matches element type | Randomly picks one element from a list                                                       |

### 8.2 Numeric functions

| Function                                                          | Signature                                | Return type | Description                                                                                                                                                                                                                                                |
| --- | --- | --- | --- |
| SUM                                                               | `SUM(val1, val2, ...)`                   | Number      | Sum; accepts multiple values or a list                                                                                                                                                                                                                     |
| AVERAGE                                                           | `AVERAGE(val1, val2, ...)`               | Number      | Average                                                                                                                                                                                                                                                    |
| MAX                                                               | `MAX(val1, val2, ...)`                   | Number      | Maximum                                                                                                                                                                                                                                                    |
| MIN                                                               | `MIN(val1, val2, ...)`                   | Number      | Minimum                                                                                                                                                                                                                                                    |
| MEDIAN                                                            | `MEDIAN(val1, val2, ...)`                | Number      | Median                                                                                                                                                                                                                                                     |
| COUNTA                                                            | `COUNTA(val1, val2, ...)`                | Number      | Count of non-blank values                                                                                                                                                                                                                                  |
| COUNTIF                                                           | `COUNTIF(data_range, condition)`         | Number      | Count matching items. Data range can be a **table** (CurrentValue is a row, use `CurrentValue.[Field]`) or a **column** (CurrentValue is a scalar value)                                                                                                   |
| SUMIF                                                             | `SUMIF(data_range, condition)`           | Number      | Sum matching values. Data range **must be a numeric column** (e.g. `[Table].[NumField]`); CurrentValue is each value in that column (scalar), cannot use `CurrentValue.[Field]` to access other fields. For cross-field conditions, use FILTER+SUM instead |
| ROUND                                                             | `ROUND(number, digits)`                  | Number      | Round. digits: 1=one decimal, 0=integer, -1=tens place                                                                                                                                                                                                     |
| ROUNDUP                                                           | `ROUNDUP(number, digits)`                | Number      | Round away from zero. Same digits semantics as ROUND                                                                                                                                                                                                       |
| ROUNDDOWN                                                         | `ROUNDDOWN(number, digits)`              | Number      | Round toward zero. Same digits semantics as ROUND                                                                                                                                                                                                          |
| FLOOR                                                             | `FLOOR(number, [base])`                  | Number      | Round down to nearest multiple of base (default 1)                                                                                                                                                                                                         |
| CEILING                                                           | `CEILING(number, [base])`                | Number      | Round up to nearest multiple of base (default 1)                                                                                                                                                                                                           |
| ABS                                                               | `ABS(number)`                            | Number      | Absolute value                                                                                                                                                                                                                                             |
| INT                                                               | `INT(number)`                            | Integer     | Truncate to integer                                                                                                                                                                                                                                        |
| MOD                                                               | `MOD(dividend, divisor)`                 | Number      | Modulo                                                                                                                                                                                                                                                     |
| POWER                                                             | `POWER(base, exponent)`                  | Number      | Exponentiation                                                                                                                                                                                                                                             |
| QUOTIENT                                                          | `QUOTIENT(dividend, divisor)`            | Number      | Integer division                                                                                                                                                                                                                                           |
| VALUE                                                             | `VALUE(text)`                            | Number      | Convert text to number                                                                                                                                                                                                                                     |
| ISODD                                                             | `ISODD(number)`                          | Boolean     | Tests if number is odd                                                                                                                                                                                                                                     |
| RANK                                                              | `RANK(value, search_range, [ascending])` | Number      | Rank of value in range; default descending                                                                                                                                                                                                                 |
| SEQUENCE                                                          | `SEQUENCE(start, end, [step])`           | List        | Generate number sequence                                                                                                                                                                                                                                   |
| PI                                                                | `PI()`                                   | Number      | Pi constant                                                                                                                                                                                                                                                |
| SIN/COS/TAN/ASIN/ACOS/ATAN/ATAN2/SINH/COSH/TANH/ASINH/ACOSH/ATANH | `func(radians_or_value)`                 | Number      | Trigonometric and hyperbolic functions; arguments in radians                                                                                                                                                                                               |

### 8.3 Text functions

| Function        | Signature                                            | Return type | Description                                                                                              |
| --------------- | ---------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| CONCATENATE     | `CONCATENATE(text1, text2, ...)`                     | Text        | Concatenate multiple texts; supports lists as input                                                      |
| LEN             | `LEN(text)`                                          | Number      | Character count                                                                                          |
| LEFT            | `LEFT(text, [count])`                                | Text        | Extract from left; default 1                                                                             |
| RIGHT           | `RIGHT(text, [count])`                               | Text        | Extract from right; default 1                                                                            |
| MID             | `MID(text, start, count)`                            | Text        | Extract from middle                                                                                      |
| FIND            | `FIND(search_val, search_range, [start])`            | Number      | Find substring position (case-sensitive); returns -1 if not found                                        |
| REPLACE         | `REPLACE(text, start, count, new_text)`              | Text        | Replace by position                                                                                      |
| SUBSTITUTE      | `SUBSTITUTE(text, old_text, new_text, [occurrence])` | Text        | Replace by content; can specify which occurrence                                                         |
| UPPER           | `UPPER(text)`                                        | Text        | Convert to uppercase                                                                                     |
| LOWER           | `LOWER(text)`                                        | Text        | Convert to lowercase                                                                                     |
| TRIM            | `TRIM(text)`                                         | Text        | Remove leading/trailing spaces                                                                           |
| TEXT            | `TEXT(value, format)`                                | Text        | Format output. Date formats: `"YYYY-MM-DD"`, `"YYYY/MM/DD hh:mm:ss"`; number formats: `"00"`, `"000.00"` |
| CONTAINTEXT     | `CONTAINTEXT(text, search_text)`                     | Boolean     | Tests if text contains substring (text substring matching)                                               |
| SPLIT           | `SPLIT(text, delimiter)`                             | List        | Split text by delimiter                                                                                  |
| TODATE          | `TODATE(value)`                                      | Date        | Convert date string to date type                                                                         |
| CHAR            | `CHAR(number)`                                       | Text        | ASCII code to character                                                                                  |
| FORMAT          | `FORMAT(template, [val1, val2, ...])`                | Text        | Template string formatting; use `{1}`, `{2}` as placeholders                                             |
| HYPERLINK       | `HYPERLINK(url, [display_text])`                     | Hyperlink   | Create a hyperlink                                                                                       |
| ENCODEURL       | `ENCODEURL(text)`                                    | Text        | URL encode                                                                                               |
| REGEXMATCH      | `REGEXMATCH(text, regex)`                            | Boolean     | Regex match test                                                                                         |
| REGEXEXTRACT    | `REGEXEXTRACT(text, regex)`                          | List        | Extract first match's capture groups                                                                     |
| REGEXEXTRACTALL | `REGEXEXTRACTALL(text, regex)`                       | 2D List     | Extract all matches                                                                                      |
| REGEXREPLACE    | `REGEXREPLACE(text, regex, replacement)`             | Text        | Regex replace                                                                                            |

### 8.4 Date functions

| Function    | Signature                                       | Return type | Description                                                                                             |
| ----------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| NOW         | `NOW()`                                         | Date        | Current date and time                                                                                   |
| TODAY       | `TODAY()`                                       | Date        | Current date (midnight)                                                                                 |
| DATE        | `DATE(year, month, day)`                        | Date        | Construct a date                                                                                        |
| YEAR        | `YEAR(date)`                                    | Number      | Extract year                                                                                            |
| MONTH       | `MONTH(date)`                                   | Number      | Extract month                                                                                           |
| DAY         | `DAY(date)`                                     | Number      | Extract day                                                                                             |
| HOUR        | `HOUR(date)`                                    | Number      | Extract hour                                                                                            |
| MINUTE      | `MINUTE(date)`                                  | Number      | Extract minute                                                                                          |
| SECOND      | `SECOND(date)`                                  | Number      | Extract second                                                                                          |
| WEEKDAY     | `WEEKDAY(date, [type])`                         | Number      | Day of week                                                                                             |
| WEEKNUM     | `WEEKNUM(date, [type])`                         | Number      | Week number                                                                                             |
| DAYS        | `DAYS(end_date, start_date)`                    | Number      | Days between two dates (end - start), includes decimals. **Note parameter order: end date comes first** |
| DATEDIF     | `DATEDIF(start_date, end_date, [unit])`         | Number      | Whole days/months/years between dates. Unit: `"D"`(default)/`"M"`/`"Y"`. **Start must be before end**   |
| DURATION    | `DURATION(days, [hours], [minutes], [seconds])` | Duration    | Create a duration for date arithmetic                                                                   |
| EDATE       | `EDATE(date, months)`                           | Date        | Date N months later                                                                                     |
| EOMONTH     | `EOMONTH(date, [months])`                       | Date        | End of month N months later; months default 0                                                           |
| WORKDAY     | `WORKDAY(start_date, days, [holidays])`         | Date        | Date N workdays later (skips weekends and holidays)                                                     |
| NETWORKDAYS | `NETWORKDAYS(start_date, end_date, [holidays])` | Number      | Workdays between dates (inclusive)                                                                      |

### 8.5 List functions

| Function    | Signature                                                                    | Return type | Description                                                                                                                                                                                                      |
| --- | --- | --- | --- |
| LIST        | `LIST(val1, val2, ...)`                                                      | List        | Create a list                                                                                                                                                                                                    |
| FIRST       | `FIRST(list)`                                                                | Scalar      | First element                                                                                                                                                                                                    |
| LAST        | `LAST(list)`                                                                 | Scalar      | Last element                                                                                                                                                                                                     |
| NTH         | `NTH(list, index)`                                                           | Scalar      | Nth element (1-based)                                                                                                                                                                                            |
| FILTER      | `[Table].FILTER(condition).[ResultCol]` or `[Table].[Col].FILTER(condition)` | List        | Filter by condition. When data range is a table, result column is **required**; when it's a column/list, it's not needed. Use CurrentValue in conditions. Add `.LISTCOMBINE()` when result column is multi-value |
| MAP         | `data_range.MAP(mapping_expr)`                                               | List        | Apply mapping to each element. Use CurrentValue in mapping                                                                                                                                                       |
| SORT        | `SORT(list, [ascending])`                                                    | List        | Sort; default ascending (TRUE)                                                                                                                                                                                   |
| SORTBY      | `[Table].SORTBY([Table].[SortCol], [ascending]).[OutputCol]`                 | List        | Sort by column then extract output column. **Chain-only, must include output column**                                                                                                                            |
| UNIQUE      | `UNIQUE(list)`                                                               | List        | Deduplicate                                                                                                                                                                                                      |
| ARRAYJOIN   | `ARRAYJOIN(list, [delimiter])`                                               | Text        | Join list elements as text; default comma-separated                                                                                                                                                              |
| LISTCOMBINE | `LISTCOMBINE(val1, [val2, ...])` or `list.LISTCOMBINE()`                     | List        | Two uses: (1) merge values/lists into one list; (2) chained call to flatten 2D array (commonly used when FILTER result column is a multi-value field)                                                            |
| DISTANCE    | `DISTANCE(location1, location2)`                                             | Number      | Distance between two geographic locations (km)                                                                                                                                                                   |

---

## Section 9: Commonly Confused Functions

### CONTAIN vs CONTAINTEXT

|             | CONTAIN                                                        | CONTAINTEXT                                                |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Purpose     | Tests if a **list / `select` (`multiple=true`)** contains a value | Tests if **text** contains a substring                     |
| Example     | `[Tags].CONTAIN("Urgent")`                                     | `[Notes].CONTAINTEXT("completed")`                         |
| Wrong usage | `CONTAIN([Notes], "completed")` — cannot do substring matching | `CONTAINTEXT([Tags], "Urgent")` — Tags is a list, not text |

### ISBLANK vs ISNULL

|                   | ISBLANK | ISNULL |
| ----------------- | ------- | ------ |
| NULL              | TRUE    | TRUE   |
| `""` empty string | TRUE    | FALSE  |
| Empty list `[]`   | TRUE    | FALSE  |
| `0`               | FALSE   | FALSE  |
| `FALSE`           | FALSE   | FALSE  |

### DAYS vs DATEDIF

|                 | DAYS                                                         | DATEDIF                                   |
| --------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Parameter order | `DAYS(end, start)` — end first                               | `DATEDIF(start, end, unit)` — start first |
| Precision       | Includes decimals (hours/minutes/seconds as fractional days) | Integer only (whole days/months/years)    |
| Negative values | Returns negative when start is after end                     | **Errors** when start is after end        |

### SUM vs SUMIF

|           | SUM                                            | SUMIF                                                          |
| --------- | ---------------------------------------------- | -------------------------------------------------------------- |
| Purpose   | Sum all values                                 | Sum values **matching a condition**                            |
| Arguments | `SUM(val1, val2, ...)` or `SUM([Table].[Col])` | `SUMIF(data_range, condition)` with CurrentValue in condition  |
| Example   | `SUM([Orders].[Amount])` — sum all             | `SUMIF([Orders].[Amount], CurrentValue > 100)` — sum only >100 |

### FILTER+aggregation vs COUNTIF/SUMIF

|             | FILTER+aggregation                                    | COUNTIF/SUMIF                                                                  |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Nature      | Filter then aggregate (two steps)                     | One-step (syntactic sugar)                                                     |
| Equivalence | `[Table].FILTER(cond).[Col].LISTCOMBINE().SUM()`      | `SUMIF([Table].[Col], cond)` (only when condition involves only column values) |
| When to use | Conditions span multiple fields, or multi-step needed | Conditions only involve column values (e.g. `CurrentValue > 100`)              |

---

## Section 10: Decision Trees

### Cross-table queries: which approach?

```
Need data from another table?
├─ Current table has a link field to the target table?
│   ├─ Yes → Use chained access: [LinkField].[TargetField]
│   │         Need aggregation? → .SUM() / .ARRAYJOIN(",") / .FIRST()
│   └─ No → Need to match by field value?
│       ├─ Field matching or complex filtering → [TargetTable].FILTER(CurrentValue.[MatchField] = [Value]).[OutputCol]
│       └─ Only counting or summing → COUNTIF([TargetTable], condition) / FILTER+SUM
```

### Conditional logic: IF vs IFS vs SWITCH?

```
Need conditional logic?
├─ Single condition → IF(condition, true_val, false_val)
├─ Multiple mutually exclusive conditions (if-elseif-else) → IFS(cond1, val1, cond2, val2, ...)
├─ Matching a value against fixed options → SWITCH(expr, option1, result1, option2, result2, ..., default)
└─ Need error handling?
    ├─ Catch errors → IFERROR(expr, fallback)
    └─ Catch blanks → IFBLANK(expr, fallback)
```

### Aggregation: which function?

```
Need to aggregate data?
├─ Sum/average/max/min for entire column → SUM/AVERAGE/MAX/MIN([Table].[Col])
├─ Count non-blank → COUNTA([Table].[Col])
├─ Conditional count → COUNTIF([Table], CurrentValue.[Field] = [Value])
├─ Conditional sum (column-only condition) → SUMIF([Table].[Col], CurrentValue > threshold)
├─ Conditional sum (cross-field condition) → [Table].FILTER(CurrentValue.[Field]=value).[NumCol].LISTCOMBINE().SUM()
├─ Count unique → [Table].[Col].UNIQUE().COUNTA()
└─ Ranking → RANK([Value], [Table].[Col])
```

---

## Section 11: Common Formula Patterns

### Pattern 1: Cross-table conditional count

Count rows in target table matching a condition:

```
[TargetTable].COUNTIF(CurrentValue.[MatchField] = [CurrentTableField])
```

### Pattern 2: Cross-table conditional sum

Filter target table by current row's value, then sum:

```
[TargetTable].FILTER(CurrentValue.[MatchField] = [CurrentTableField]).[NumCol].LISTCOMBINE().SUM()
```

SUMIF works when data range is a column and conditions only involve column values:

```
SUMIF([TargetTable].[NumCol], CurrentValue > 100)
```

Note: COUNTIF can use a table as data range (only counting, no specific column needed), but SUMIF's data range **must be a numeric column** (needs values to sum), so `CurrentValue` is each value in that column (scalar) — cannot use `CurrentValue.[OtherField]` to access other fields. For cross-field conditions, use FILTER with a table as data range.

### Pattern 3: Cross-table lookup

```
[TargetTable].FILTER(CurrentValue.[MatchCol] = [CurrentTableField]).[ReturnCol]
```

### Pattern 4: Link field values + aggregation

```
SUM([LinkField].[NumField])
[LinkField].[TextField].UNIQUE().ARRAYJOIN(",")
```

### Pattern 5: Conditional text concatenation

```
IF([Condition], "prefix" & [Field] & "suffix", "default text")
```

### Pattern 6: Date difference

```
DATEDIF([StartDate], [EndDate], "D") & " days"
DAYS([EndDate], [StartDate])
```

### Pattern 7: List element mapping

```
[SelectField(which multiple=true)].MAP(CurrentValue & " tag")
SPLIT([TextField], ",").MAP(TRIM(CurrentValue))
```

### Pattern 8: Cross-table with sorting

```
[TargetTable].SORTBY([TargetTable].[SortCol], FALSE).[OutputCol]
[TargetTable].FILTER(CurrentValue.[Field] = [Value]).SORTBY([TargetTable].[SortCol]).[OutputCol]
```

---

## Section 12: Anti-Pattern Collection

### Mistake 1: Extra argument in MAP

```
Wrong:   [Table].[Col].MAP([Table2].[Col], CurrentValue + 1)
Correct: [Table].[Col].MAP(CurrentValue + 1)
```

Reason: MAP takes only two arguments (data range + mapping expression), no "lookup range".

### Mistake 2: Inverted FILTER syntax

```
Wrong:   condition.[Table].FILTER()
Correct: [Table].FILTER(condition).[ResultCol]    (result column required when data range is a table)
```

Reason: FILTER's data range comes first, condition is passed as the argument.

### Mistake 3: Using CurrentValue.[Field] on a column range

```
Wrong:   SUMIF([Sales].[Revenue], CurrentValue.[Salesperson] = [Name])
Correct: [Sales].FILTER(CurrentValue.[Salesperson] = [Name]).[Revenue].LISTCOMBINE().SUM()
```

Reason: `SUMIF([Sales].[Revenue], ...)` uses "Revenue" column as data range. CurrentValue is each revenue value (scalar), not a row — cannot use `.` to access other fields. Use FILTER with the table as data range for cross-field conditions.

### Mistake 4: Missing result column after FILTER

```
Wrong:   [Sales].FILTER(CurrentValue.[Amount] > 100)
Correct: [Sales].FILTER(CurrentValue.[Amount] > 100).[Customer]
```

Reason: FILTER on a table returns a table reference; must specify result column with `.[Field]` at the end.

### Mistake 5: Nested FILTER

```
Wrong:   [Table1].FILTER(CurrentValue.[ID] = [Table2].FILTER(CurrentValue.[Status]="Done").[ID])
Correct: [Table1].FILTER(CurrentValue.[ID] = [CurrentRowField]).[OutputCol]
```

Reason: FILTER/MAP/SUMIF/COUNTIF cannot be nested inside each other's conditions. Split into multiple steps or use link fields.

### Mistake 6: SORTBY without output column

```
Wrong:   [Table].SORTBY([Table].[Col])
Correct: [Table].SORTBY([Table].[Col]).[OutputCol]
```

Reason: SORTBY must have an output column at the end; otherwise the result cannot be represented as an array.

### Mistake 7: SORTBY sort column without table name

```
Wrong:   [Table].SORTBY([Col]).[OutputCol]
Correct: [Table].SORTBY([Table].[Col]).[OutputCol]
```

Reason: SORTBY's sort column must use `[TableName].[FieldName]` format.

### Mistake 8: Using CONTAIN for text substring matching

```
Wrong:   CONTAIN([Notes], "urgent")
Correct: CONTAINTEXT([Notes], "urgent")
```

Reason: CONTAIN checks if a list or `select` (`multiple=true`) contains a whole value, not substring matching. Use CONTAINTEXT for text substrings.

### Mistake 9: Date concatenation without formatting

```
Not recommended: "Deadline: " & [DateField] ← output format is uncontrolled
Recommended: "Deadline: " & TEXT([DateField], "YYYY-MM-DD")
```

Reason: Concatenating a date with `&` won't error, but uses the default format. Use TEXT to specify the format explicitly.

### Mistake 10: Reversed DAYS parameter order

```
Wrong:   DAYS([StartDate], [EndDate])  → returns negative
Correct: DAYS([EndDate], [StartDate])  → returns positive
```

Reason: DAYS parameter order is end date first, start date second.

### Mistake 11: Chaining zero-argument functions

```
Wrong:   TODAY.DAYS([Date])
Correct: TODAY().DAYS([Date])
```

Reason: NOW, TODAY, PI and other zero-argument functions must include parentheses.

---

## Section 13: Complete Examples

### Example 1: Employee sales summary

**Table structure** (from `+table-get`):

- Employees: EmployeeID (Text), Name (Text), Department (Text)
- Sales: ContractID (Number), SalespersonID (Text), Quantity (Number), Total (Number)

**Current table**: Employees

**Requirement**: For each employee, output "Sold XX orders" if they have sales records, otherwise "No sales records".

**Formula**:

```
IF(
  [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) >= 1,
  "Sold " & [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) & " orders",
  "No sales records"
)
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Sales Summary",
  "expression": "IF([Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) >= 1, \"Sold \" & [Sales].COUNTIF(CurrentValue.[SalespersonID] = [EmployeeID]) & \" orders\", \"No sales records\")"
}
```

**Explanation**: `[Sales].COUNTIF(...)` uses the entire Sales table as data range. CurrentValue represents each row in Sales, accessing `CurrentValue.[SalespersonID]` for that row's salesperson. `[EmployeeID]` refers to the current row in the Employees table (where the formula lives).

### Example 2: Chained cross-table access via link fields

**Table structure**:

- Orders: ID (`auto_number`), OrderItems (`link` [target: OrderItems, foreign key: ID])
- OrderItems: ID (`auto_number`), Product (`link` [target: Products, foreign key: ID])
- Products: ID (`auto_number`), ProductName (`text`)

**Current table**: Orders

**Requirement**: Deduplicate and comma-join all product names from linked order items.

**Formula**:

```
[OrderItems].[Product].[ProductName].UNIQUE().ARRAYJOIN(",")
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Product List",
  "expression": "[OrderItems].[Product].[ProductName].UNIQUE().ARRAYJOIN(\",\")"
}
```

**Explanation**: `[OrderItems]` gets linked order item records, `.[Product]` expands to each item's linked product, `.[ProductName]` gets all product names, `.UNIQUE()` deduplicates, `.ARRAYJOIN(",")` joins with commas.

### Example 3: Cross-table filter + sort

**Table structure**:

- Projects: ProjectName (Text), Status (Text), Owner (Text)
- Tasks: TaskName (Text), Project (Text), Priority (Number), DueDate (Date)

**Current table**: Projects

**Requirement**: Find the highest-priority (lowest number) task name for the current project.

**Formula**:

```
FIRST(
  [Tasks].FILTER(CurrentValue.[Project] = [ProjectName]).SORTBY([Tasks].[Priority], TRUE).[TaskName]
)
```

**Field JSON**:

```json
{
  "type": "formula",
  "name": "Top Priority Task",
  "expression": "FIRST([Tasks].FILTER(CurrentValue.[Project] = [ProjectName]).SORTBY([Tasks].[Priority], TRUE).[TaskName])"
}
```

**Explanation**: `[Tasks].FILTER(CurrentValue.[Project] = [ProjectName])` filters tasks belonging to the current project. `.SORTBY([Tasks].[Priority], TRUE)` sorts by priority ascending. `.[TaskName]` extracts task names. `FIRST(...)` gets the first one (highest priority).

---

## Section 14: Translating User Requirements to Formulas

When the user describes their formula need in natural language, follow these rules to convert it into a precise expression:

1. **Numbers must use precise values**: "less than 80%" → field value less than `0.8`. "above 1000" → `>= 1000`.
2. **Interval boundaries**: "above/below/within" = closed (inclusive); "less than/more than/outside" = open (exclusive).
3. **Branching logic** must be organized as an ordered list with a fallback branch. Each branch has a condition and output.
   - Example: "return risk level for 1-3" → `IFS([Value] = 1, "low", [Value] = 2, "medium", [Value] = 3, "high")` with an `IFERROR` or trailing empty-string fallback.
4. **Multi-level branches must be flattened** to a single level. Nested if-else chains → flat IFS.
5. **Branch conditions must be mutually exclusive**. If the user's conditions overlap, rewrite to eliminate ambiguity.
6. **Reorder branches by logical priority** if the user's order is illogical (e.g., check specific conditions before catch-all).

---

## Section 15: Constraint Summary

- Request body must include `"type": "formula"` — this field is required
- Only use functions and operators listed in this document
- FILTER/SUMIF/COUNTIF/MAP must not be nested inside each other's conditions (chained calls are not nesting)
- Do not use LOOKUP — use FILTER exclusively
- Table and field names must exactly match `+table-get` output
- Strings must use double quotes `"`
- Format dates with TEXT before concatenating, to control output format
- SORTBY can only be chained and must include an output column
- Link fields return lists — aggregate or extract single values before output


<a id="s-c44aa7298dcfa089"></a>

## references/lark-base-field-lookup.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Lookup Field

## Mandatory Read Acknowledgement

When creating or updating a lookup field with `lark-cli base +field-create/+field-update --json ...` and `type` is `lookup`, you should read this guide first and only then add `--i-have-read-guide` to the command.

Do **not** proactively add `--i-have-read-guide` before reading this guide. Without it, the CLI will fail fast and direct you back to this guide.

When using `+field-update`, also pass `--yes`: field update is a high-risk `PUT` operation because changing a field definition can affect the whole column.

## Default strategy

**Use Formula fields by default for cross-table references and aggregations.** Only use Lookup fields when the user explicitly requests a Lookup field. Formula is a strict superset of Lookup — anything Lookup can do, Formula can do with a single expression.

## Usage

When creating a lookup field, the Agent should:

1. Get all table names: `lark-cli base +table-list --base-token <base>` — returns `items[].table_name`
2. Get table structure: `lark-cli base +table-get --base-token <base> --table-id <table>` — returns `fields[]`
3. If the lookup references other tables, also get those tables' structures
4. Determine the four elements: from (source table), select (source field), where (filter), aggregate (aggregation)
5. Construct the Lookup field JSON and submit it to create or update the field

**Key constraints**:

- Table names and field names must **exactly match** those returned by `+table-list` / `+table-get`
- The `from` table must be in the same Base

---

## Section 1: Core Concepts — Four-Element Model

A Lookup field is defined by five fields:

| Field | Meaning | JSON key | Required |
|-------|---------|----------|----------|
| **type** | Must be `"lookup"` | `type` | Yes |
| **from** | Source table to pull data from | `from` | Yes |
| **select** | Field in the source table to retrieve | `select` | Yes |
| **where** | Filter conditions on the source table | `where` | Yes (at least one condition) |
| **aggregate** | How to aggregate multiple matching records | `aggregate` | No (default: `raw_value`) |

**SQL analogy**:

```
SELECT  [select field]
FROM    [from table]
WHERE   [filter conditions]
GROUP BY [aggregate function]
```

**Row-level matching (most important concept)**:

A Lookup field is computed row-by-row — for each row in the current table, it filters the source table to find "related" records. **The filter defines what "related" means.**

```
Current table row 1 → filter source table → matching records → select field → aggregate → result
Current table row 2 → filter source table → matching records → select field → aggregate → result
...
```

**Rule: Whenever the current table and the source table have a row-level correspondence (matching by some field value), you must specify a filter.**

---

## Section 2: Lookup vs Link vs Formula

Lookup and Link serve **different purposes**. Creating a Lookup does NOT require a Link field to exist first.

| Dimension | Link | Lookup | Formula |
|-----------|------|--------|---------|
| Purpose | Establish record relationships (read-write) | Pull and aggregate data from another table (read-only) | Compute values from expressions (read-only) |
| When to use | "link" / "associate" / "bind" two tables | "look up" / "reference" / "aggregate" / "count" from another table | Calculations, text manipulation, conditional logic |

**Common mistake**: Creating a Link field just to create a Lookup. If two tables share a matching text/number field, Lookup can match directly — no Link required.

**Selection decision tree**:

```
What does the user need?
├─ "Link"/"associate"/"bind" records between tables → Link
├─ "Look up"/"reference"/"aggregate"/"count" from another table → Lookup
│   ├─ Needs aggregation (sum/count/average)? → Lookup + aggregate
│   └─ Just reference a value? → Lookup (aggregate = null)
├─ Calculations/text manipulation within current table → Formula
└─ Access linked record's field → Prefer Lookup (more intuitive), or Formula chain access
```

---

## Section 3: Filter Condition Rules

**You must provide a `where` with at least one condition.** Improper conditions cause every row to pull all records from the source table.

### The Iron Rule: field belongs to source table

```
filter condition:
  field   → must be a field in the FROM table (source table)
  value   → constant or reference to a field in the CURRENT table
```

### How to find the matching field pair

**With a Link field (most common)**: The match is between the **Link field** and the **target table's primary field**.

```
Link is in the source table   → source.linkField matches current.primaryField
Link is in the current table  → source.primaryField matches current.linkField
```

**Without a Link field**: Two tables share a field with the same meaning — match directly.

### Where condition structure

Each condition is a **tuple** (array) of 2 or 3 elements: `[field, operator, value?]`

```json
{
  "logic": "and",
  "conditions": [
    ["<source table field>", "<operator>", { "type": "constant", "value": "<val>" }]
  ]
}
```

For `empty` / `non_empty`, the value can be omitted (2-element tuple):

```json
["<source table field>", "empty"]
```

### Two value formats

**Constant value** — for fixed conditions (e.g., "status is completed"):

```json
["状态", "==", { "type": "constant", "value": "已完成" }]
```

**Field reference** — for dynamic per-row matching (e.g., "match current row's project"):

```json
["项目名", "==", { "type": "field_ref", "field": "项目名" }]
```

**Decision guide**: Fixed condition (e.g., "status is completed") → `constant`. Dynamic condition (e.g., "match current record's project ID") → `field_ref`.

### Constant value format by field type

The `value` inside `{ "type": "constant", "value": ... }` varies by field type:

| Field type | Constant value format | Example |
|-----------|----------------------|---------|
| `text` | String | `"已完成"` |
| `number` | Number | `100`, `0.8` |
| `datetime` / `created_at` / `updated_at` | String | `"ExactDate(2025-01-01)"`, `"ExactDate(2025-01-01 09:30)"`, `"Today"`, `"Yesterday"`, `"Tomorrow"` |
| `select` (`multiple=false/true`) | Option name array | `["Todo"]`, `["Todo", "Done"]` |
| `link` | Record reference array | `[{ "id": "recxxx" }]`, `[{ "id": "recxxx" }, { "id": "recyyy" }]` |
| `user` / `created_by` / `updated_by` | User reference array | `[{ "id": "ou_xxx" }]`, `[{ "id": "ou_xxx" }, { "id": "ou_yyy" }]` |
| `checkbox` | Boolean | `true`, `false` |
| `attachment` / `location` | Only `empty` / `non_empty` | value must be `null` or omitted |
| `auto_number` | Not supported for constant comparison | Use dynamic field\_ref instead |
| `formula` / `lookup` (exact type) | Follow the underlying type rules | — |
| `formula` / `lookup` (fuzzy type) | String | `"some text"` |

**`datetime` notes**:
- Supported datetime constant values are `ExactDate(...)`, `Today`, `Yesterday`, `Tomorrow`
- Date-only fields use `ExactDate(YYYY-MM-DD)`
- Fields that include time use `ExactDate(YYYY-MM-DD HH:mm)`
- For complex or relative date filtering, consider using a Formula field instead

### Dynamic field reference — set comparison semantics

When using `{ "type": "field_ref", "field": "..." }`, values from both sides are first **converted to sets** at runtime, then compared using set operations:

- **`==`**: Sets are exactly equal (strict matching)
- **`intersects`**: Sets have a non-empty intersection (most commonly used)

**Conversion rules by field type**:

| Field type | Converted to |
|-----------|-------------|
| `text` | Single-element string set |
| `number` / `auto_number` / `datetime` | Single-element number set |
| `select` (`multiple=false/true`) | Set of option name strings |
| `user` / `created_by` / `updated_by` | Set of user name strings |
| `link` | Set of linked records' primary field string representations |
| `formula` / `lookup` | The computed value set |

**Examples**:
- User field `["name1", "name2"]` **intersects** text `"name1"` → true; **==** text `"name1"` → false (sets not equal)
- User field `["name1"]` **==** text `"name1"` → true (single-element sets are equal)
- Link field referencing records → converted to primary field strings, then compared

### Supported operators

| Operator | Meaning | Applicable field types |
|----------|---------|-----------------|
| `==` | Equal (exact match) | All types |
| `!=` | Not equal | All types |
| `>` | Greater than | `number`, `datetime` |
| `>=` | Greater than or equal | `number`, `datetime` |
| `<` | Less than | `number`, `datetime` |
| `<=` | Less than or equal | `number`, `datetime` |
| `intersects` | Has intersection (non-empty overlap) | All types (most commonly used for dynamic field\_ref) |
| `disjoint` | No intersection | All types |
| `empty` | Field is empty | All types (value must be null or omitted) |
| `non_empty` | Field is not empty | All types (value must be null or omitted) |

### Constraints

- **Only one level of and/or** — nesting (e.g., `{ and: [{ or: [...] }] }`) is not supported
- **At least one condition** — empty conditions array will error

---

## Section 4: Aggregate Rules

| Aggregate | Common user phrasing | Select field should be | Result type |
|-----------|---------------------|----------------------|-------------|
| `sum` | "total" / "sum" / "cumulative amount" | `number` field (e.g., amount) | Number |
| `average` | "average" / "mean" | `number` field | Number |
| `max` | "maximum" / "latest" / "most recent" | `number` / `datetime` field | Same as source |
| `min` | "minimum" / "earliest" | `number` / `datetime` field | Same as source |
| `counta` | "count" / "how many" / "total number" | Any field | Number |
| `unique_counta` | "count distinct" / "how many different" | Field to deduplicate | Number |
| `unique` | "list distinct" / "which ones" / "show different" | Field to display | List |
| `raw_value` | "list all" / "show all values" (default) | Field to display | List |

**Common confusion**: `unique` returns a **deduplicated list**, `unique_counta` returns a **count**. "Which categories are involved" → `unique`; "How many categories" → `unique_counta`.

**Important**:
- Enum values are **snake_case lowercase**: `sum` not `Sum`, `average` not `Average`
- **Count is `counta`, NOT `count`** — this is the most common enum mistake

---

## Section 5: Hard Constraints

1. **Always write a filter**: The `where` field is required with at least one condition. Whenever the current table and source table have row-level correspondence, the condition should express that relationship.
2. **Lookup fields are read-only**: Cell values cannot be manually set.
3. **Create Lookup after all dependent fields exist**: The source table and referenced fields must exist before creating the Lookup field.
4. **Source table must be in the same Base**: Cross-Base lookups are not supported.
5. **Changing `from` requires changing `select`**: Updating the source table without updating the select field will error.

---

## Section 6: Decision Trees

### How to build the filter

```
Step 1: Analyze the filtering semantics in the user's request
  "Count artworks per exhibition" → filter: belongs to exhibition = current exhibition
  "Sum completed order amounts"   → filter: status = completed AND project = current project

Step 2: Find the matching field pair
  ├─ Tables have a Link relationship?
  │   ├─ Link is in source table → source.linkField matches current.primaryField
  │   └─ Link is in current table → source.primaryField matches current.linkField
  ├─ Tables share same-meaning text/number field? → source.field matches current.field
  └─ Also need constant filtering? → AND combination
```

### Which aggregate?

```
How to handle multiple matching records?
├─ Show all values as-is → raw_value (default)
├─ Show deduplicated list → unique
├─ Sum → sum
├─ Average → average
├─ Maximum / minimum → max / min
├─ Count records → counta
└─ Count distinct → unique_counta
```

---

## Section 7: Common Configuration Patterns

> Patterns are categorized by **filter matching method**. Aggregate choice is independent — see Section 4.

### Pattern 1: Aggregate from a linked table (Link is in the source table)

**Scenario**: "Count artworks per exhibition", "Sum order amounts per project"

When the source table has a Link pointing to the current table:

```
Exhibition table: ExhibitionName (primaryField) ← current table
Artwork table: ArtworkName (primaryField), ← source table (Link is here)
                  Exhibition (Link → Exhibition table)
```

```json
{
  "type": "lookup",
  "name": "Artwork Count",
  "from": "Artwork table",
  "select": "ArtworkName",
  "aggregate": "counta",
  "where": {
    "logic": "and",
    "conditions": [
      ["Exhibition", "intersects", { "type": "field_ref", "field": "ExhibitionName" }]
    ]
  }
}
```

### Pattern 2: Reference a linked record's field (Link is in the current table)

**Scenario**: "Show supplier's contact person", "Display warehouse manager"

When the current table has a Link pointing to the source table:

```
Supplier table: SupplierName (primaryField), Contact (Text) ← source table
Inventory table: ProductName (primaryField), ← current table (Link is here)
                 Supplier (Link → Supplier table)
```

```json
{
  "type": "lookup",
  "name": "Supplier Contact",
  "from": "Supplier table",
  "select": "Contact",
  "where": {
    "logic": "and",
    "conditions": [
      ["SupplierName", "intersects", { "type": "field_ref", "field": "Supplier" }]
    ]
  }
}
```

### Pattern 3: Match by same-meaning field (no Link)

**Scenario**: "Sum order amounts per project" (tables share a "ProjectName" field but no Link)

```
Project table: ProjectName (primaryField) ← current table
Order table: OrderID (primaryField), ProjectName (Text), ← source table
               Amount (Number)
```

```json
{
  "type": "lookup",
  "name": "Order Total",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }]
    ]
  }
}
```

### Pattern 4: Dynamic matching + constant filtering

**Scenario**: "Only count completed orders", "Only sum approved budgets"

Combine row-level matching with fixed-value filtering using `logic: "and"`:

```json
{
  "type": "lookup",
  "name": "Completed Order Amount",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["Manager", "==", { "type": "field_ref", "field": "EmployeeName" }],
      ["Status", "==", { "type": "constant", "value": "Completed" }]
    ]
  }
}
```

### Pattern 5: Date filtering with constant value

**Scenario**: "Look up orders created after 2025-01-01", "Sum today's sales"

```json
{
  "type": "lookup",
  "name": "Recent Orders",
  "from": "Order table",
  "select": "Amount",
  "aggregate": "sum",
  "where": {
    "logic": "and",
    "conditions": [
      ["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }],
      ["CreatedDate", ">=", { "type": "constant", "value": "ExactDate(2025-01-01)" }]
    ]
  }
}
```

---

## Section 8: Anti-Pattern Collection

### Mistake 1: Omitting where (most common)

```json
// Wrong: no where, every row pulls all records
{ "type": "lookup", "name": "Artwork Count", "from": "Artwork table", "select": "ArtworkName", "aggregate": "counta" }

// Correct: where with Link relationship
{ "type": "lookup", "name": "Artwork Count", "from": "Artwork table", "select": "ArtworkName", "aggregate": "counta",
  "where": { "logic": "and", "conditions": [
    ["Exhibition", "intersects", { "type": "field_ref", "field": "ExhibitionName" }]
  ]}}
```

### Mistake 2: Wrong value type — confusing constant vs field_ref

```json
// Wrong: using constant for a dynamic join
["ProjectName", "==", { "type": "constant", "value": "ProjectName" }]

// Correct: use field_ref for dynamic per-row matching
["ProjectName", "==", { "type": "field_ref", "field": "ProjectName" }]
```

### Mistake 3: Using `count` instead of `counta`

```json
// Wrong
{ "aggregate": "count" }

// Correct
{ "aggregate": "counta" }
```

### Mistake 4: Wrong case for aggregate values

```json
// Wrong
{ "aggregate": "SUM" }
{ "aggregate": "Sum" }

// Correct — snake_case lowercase
{ "aggregate": "sum" }
{ "aggregate": "average" }
```

### Mistake 5: Nested where conditions

```json
// Wrong: nesting not supported
{ "logic": "and", "conditions": [
  { "logic": "or", "conditions": [...] }
]}

// Correct: only one level
{ "logic": "and", "conditions": [cond1, cond2, cond3] }
```

### Mistake 6: Confusing Lookup with Link

The user says "aggregate order amounts" — use Lookup, not Link. Link establishes relationships; Lookup retrieves and aggregates data.

### Mistake 7: Using object format instead of tuple for conditions

```json
// Wrong: object format
{ "fieldRef": "Status", "operator": "is", "value": { "type": "constant", "value": "Done" } }

// Correct: tuple format [field, operator, value?]
["Status", "==", { "type": "constant", "value": "Done" }]
```

### Mistake 8: Missing `type` field

```json
// Wrong: no type field
{ "name": "Total", "from": "Orders", "select": "Amount", "aggregate": "sum", "where": { ... } }

// Correct: must include type
{ "type": "lookup", "name": "Total", "from": "Orders", "select": "Amount", "aggregate": "sum", "where": { ... } }
```

---

## Section 9: Constraint Summary

- `type` must be `"lookup"` — this field is required in the request body
- `where` is required with at least one condition — always specify a filter
- Conditions use **tuple format**: `[field, operator, value?]` — NOT object format
- Lookup fields are read-only — values cannot be manually set
- Source table and referenced fields must exist before creating the Lookup
- Condition field (first element of tuple) must reference a field in the source table, not the current table
- Where supports only one level of and/or — no nesting
- Aggregate values are snake_case lowercase: `sum`, `counta`, `unique_counta` (NOT `count`)
- Operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `intersects`, `disjoint`, `empty`, `non_empty`
- Table and field names must exactly match `+table-get` output
- `datetime` constant values use string format: `ExactDate(YYYY-MM-DD)` / `ExactDate(YYYY-MM-DD HH:mm)` / `Today` / `Yesterday` / `Tomorrow`
- `select` constant values use option names;
- `link` / `user` constant values use `{id}` object arrays


<a id="s-cb2af5486e8e59fc"></a>

## references/lark-base-field-schema.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Field Schema

> 适用命令：`lark-cli base +field-create`、`lark-cli base +field-update`

本文档定义 `+field-create` / `+field-update` 写字段时 `--json` 的推荐格式，是字段类型与字段 JSON 结构的 source of truth。目标不是复刻完整 schema，而是让 agent 稳定产出正确 payload。

## 1. 顶层规则（必须遵守）

- 单个字段定义始终是 JSON 对象，每个字段对象统一使用：`type` + `name` + 类型特有字段。
- `+field-create --json` 接受一个字段对象或非空字段对象数组。
- `+field-update --json` 只接受一个字段对象。
- 所有字段类型都支持可选 `description`；支持纯文本，也支持 Markdown 链接。
- 字段默认值使用 `default_value`，直接传对应 CellValue；支持范围只有 `text`、`number`、静态 `select`、`datetime`、`user`。清空默认值传 `null`；创建时省略表示不设置。
- 不要使用旧结构：`field_name`、`property`、`ui_type`、数字枚举 `type`。
- `+field-update` 是 override 式的完整覆盖 `PUT`，不是 partial update；先用 `+field-get` 读取当前定义，在其基础上修改目标属性，并把整个字段需要保留的可写配置完整写回，同时带 `--yes`。
- `type=formula` 或 `type=lookup` 创建/更新前，必须先读对应 guide。

推荐示例：

```json
{
  "type": "text",
  "name": "需求背景",
  "description": "记录需求背景与已知约束"
}
```

## 2. 字段速查

| 类型 | 最小必填字段 | 常见补充字段 |
|------|--------------|-------------|
| `text` | `type` `name` | `style.type` `default_value` |
| `number` | `type` `name` | `style` `default_value` |
| `select` | `type` `name` | `multiple` + `options` + 静态 `default_value`，或 `multiple` + `dynamic_options_source` |
| `datetime` | `type` `name` | `style.format` `default_value` |
| `created_at` / `updated_at` | `type` `name` | `style.format` |
| `user` / `group_chat` | `type` `name` | `multiple`；仅 `user` 支持 `default_value` |
| `created_by` / `updated_by` | `type` `name` | 无 |
| `link` | `type` `name` `link_table` | `bidirectional` `bidirectional_link_field_name` |
| `formula` | `type` `name` `expression` | 无 |
| `lookup` | `type` `name` `from` `select` `where` | `aggregate` |
| `auto_number` | `type` `name` | `style.rules` |
| `attachment` / `location` / `checkbox` | `type` `name` | 无 |
| `button` | `type` `name` `button_config.title` | 无 |

所有类型都可额外传 `description`；上表的“常见补充字段”只列类型特有配置。

## 3. 各类型写法

### 3.1 text

文本字段；电话、超链接、邮箱、条码也都属于 `text`，通过 `style.type` 区分。
支持 `default_value`：静态 Markdown 文本字符串；`phone` style 必须是合法电话号码；`url` style 传一个 Markdown 链接或裸 URL；`email` style 必须是合法邮箱字符串，不要传 Markdown 链接或 `mailto:`。

最小写法（默认 `style.type` 为 `plain`）：

```json
{
  "type": "text",
  "name": "标题",
  "default_value": "默认标题"
}
```

常用写法：

默认值可以是 Markdown 文本
```json
{
  "type": "text",
  "name": "标题",
  "description": "主标题字段",
  "default_value": "未命名"
}
```

`style.type=phone` 时默认值是合法电话号码字符串。
```json
{
  "type": "text",
  "name": "联系电话",
  "style": { "type": "phone" },
  "default_value": "+8613800000000"
}
```

```json
{
  "type": "text",
  "name": "官网",
  "style": { "type": "url" },
  "default_value": "[官网](https://example.com)"
}
```

```json
{
  "type": "text",
  "name": "邮箱",
  "style": { "type": "email" },
  "default_value": "owner@example.com"
}
```

常用 `style.type`：`plain`（默认）、`phone`、`url`、`email`、`barcode`。

### 3.2 number

数字字段；货币、进度、评分都属于 `number`，通过 `style.type` 区分。
支持 `default_value`：静态 JSON number；所有 number style 都按这个规则写。

最小写法（默认 `style.type` 为 `plain`）：

```json
{
  "type": "number",
  "name": "工时",
  "default_value": 8
}
```

`style` 是按 `type` 区分的对象；不同 `style.type` 的内部字段不一样，不要混传。

#### `plain`

支持字段：`precision`、`percentage`、`thousands_separator`

默认值 / 约束：
- `precision` 取值 `0..4`，默认 `2`
- `percentage` 默认 `false`
- `thousands_separator` 默认 `false`

```json
{
  "type": "number",
  "name": "工时",
  "style": {
    "type": "plain",
    "precision": 2,
    "percentage": false,
    "thousands_separator": true
  },
  "default_value": 8
}
```

#### `currency`

支持字段：`precision`、`currency_code`

默认值 / 约束：
- `precision` 取值 `0..4`，默认 `2`
- `currency_code` 必填，如 `CNY`、`USD`、`EUR`

```json
{
  "type": "number",
  "name": "预算",
  "style": { "type": "currency", "precision": 2, "currency_code": "CNY" }
}
```

#### `progress`

支持字段：`percentage`、`color`

默认值 / 约束：
- `percentage` 默认 `true`
- `color` 必填
- `color` 可用：`Blue`、`Purple`、`DarkGreen`、`Green`、`Cyan`、`Orange`、`Red`、`Gray`、`WhiteToBlueGradient`、`WhiteToPurpleGradient`、`WhiteToOrangeGradient`、`GreenToRedGradient`、`RedToGreenGradient`、`BlueToPinkGradient`、`PinkToBlueGradient`、`SpectralGradient`

```json
{
  "type": "number",
  "name": "完成度",
  "style": { "type": "progress", "percentage": true, "color": "Blue" },
  "default_value": 0.65
}
```

#### `rating`

支持字段：`icon`、`min`、`max`

默认值 / 已知平台范围：
- `icon` 默认 `star`
- `icon` 可用：`star`、`heart`、`thumbsup`、`fire`、`smile`、`lightning`、`flower`、`number`
- `min` 取值 `0..1`，默认 `1`
- `max` 取值 `1..10`，默认 `5`

```json
{
  "type": "number",
  "name": "评分",
  "style": { "type": "rating", "icon": "star", "min": 1, "max": 5 }
}
```

### 3.3 select

单选和多选都使用 `select`；用 `multiple` 区分。`multiple` 默认 `false`。静态选项用 `options`，动态选项用 `dynamic_options_source`；两者不要同时传。

#### 静态选项

支持字段：`multiple`、`options`
支持 `default_value`：静态选项名数组；即使 `multiple=false` 也写数组，如 `["Todo"]`。

默认值 / 约束：
- `multiple` 默认 `false`
- `options` 最多 `10000` 项
- `options[]` 结构是 `{name, hue?, lightness?}`
- `options[].name` 必填
- `options[].hue` 可用：`Red`、`Orange`、`Yellow`、`Lime`、`Green`、`Turquoise`、`Wathet`、`Blue`、`Carmine`、`Purple`、`Gray` 缺省值为 `Blue`
- `options[].lightness` 可用：`Lighter`、`Light`、`Standard`、`Dark`、`Darker` 缺省值为 `Lighter`
- 选项里没有 `id`，只有 `name`。
- 支持 `default_value` 配置：填选项名数组。

```json
{
  "type": "select",
  "name": "状态",
  "multiple": false,
  "default_value": ["Todo"],
  "options": [
    { "name": "Todo", "hue": "Blue", "lightness": "Lighter" },
    { "name": "Done", "hue": "Green", "lightness": "Light" }
  ]
}
```

#### 动态选项

当新字段要引用或复用另一选项字段的选项列表时，优先使用 `dynamic_options_source`，避免重复定义和维护 `options`。

支持字段：`multiple`、`dynamic_options_source`
动态选项不支持 `default_value`。

默认值 / 约束：
- `multiple` 默认 `false`
- `dynamic_options_source` 结构是 `{table_id, field_id}`
- `dynamic_options_source.table_id` 填来源表 id 或表名
- `dynamic_options_source.field_id` 填来源字段 id 或字段名
- `dynamic_options_source` 仅创建支持；更新已有字段时不要传
- 引用选项条件 / 级联筛选条件：这个功能在 Base 前端支持，属于 UI-only 属性，OpenAPI 里不支持，CLI 不能读取、创建或更新；不要根据接口返回缺失判断未配置
- 动态选项不支持配置 `default_value`。

```json
{
  "type": "select",
  "name": "动态状态",
  "multiple": false,
  "dynamic_options_source": {
    "table_id": "选项表",
    "field_id": "候选状态"
  }
}
```

### 3.4 datetime

手动填写的日期/时间字段。系统时间用 `created_at` / `updated_at`。
支持 `default_value`：静态时间字符串，或 `{ "$slot": "record_created_time" }`。`datetime + record_created_time` 是自动填充可编辑单元格；`created_at` 是只读创建时间元信息。

最小写法：

```json
{
  "type": "datetime",
  "name": "截止时间",
  "default_value": "2026-03-24 10:00"
}
```

支持字段：`style.format`

默认值 / 约束：
- `style.format` 默认 `yyyy/MM/dd` 可用格式：`yyyy/MM/dd`、`yyyy/MM/dd HH:mm`、`yyyy/MM/dd HH:mm Z`、`yyyy-MM-dd`、`yyyy-MM-dd HH:mm`、`yyyy-MM-dd HH:mm Z`、`MM-dd`、`MM/dd/yyyy`、`dd/MM/yyyy`
- `style.format` 只控制 Base 前端展示，不影响 CLI 读取的 CellValue；前端当前最多配置到分钟级展示，底层时间值以毫秒级精度存储。

常用写法：

```json
{
  "type": "datetime",
  "name": "截止时间",
  "style": { "format": "yyyy-MM-dd HH:mm" },
  "default_value": { "$slot": "record_created_time" }
}
```

### 3.5 created_at / updated_at

系统创建时间 / 系统更新时间字段；可配显示格式，但记录写入时应视为只读。

支持字段：`style.format`

默认值 / 约束：
- `style.format` 默认 `yyyy/MM/dd`
- 可用格式：`yyyy/MM/dd`、`yyyy/MM/dd HH:mm`、`yyyy/MM/dd HH:mm Z`、`yyyy-MM-dd`、`yyyy-MM-dd HH:mm`、`yyyy-MM-dd HH:mm Z`、`MM-dd`、`MM/dd/yyyy`、`dd/MM/yyyy`

```json
{ "type": "created_at", "name": "创建时间" }
```

```json
{ "type": "updated_at", "name": "更新时间", "style": { "format": "yyyy/MM/dd HH:mm" } }
```

### 3.6 user / group_chat

两者都支持 `multiple`（默认 `true`）；仅 `user` 支持人员数组 `default_value`，元素使用 `{ "id": "ou_xxx" }` 或 `{ "$slot": "current_user" }`，用户 ID 必须来自真实查询。

```json
{
  "type": "user",
  "name": "负责人",
  "multiple": true,
  "default_value": [{ "$slot": "current_user" }, { "id": "ou_xxx" }]
}
```

```json
{ "type": "group_chat", "name": "负责群", "multiple": true }
```

### 3.7 created_by / updated_by

系统创建人和修改人字段，记录写入时只读：`{ "type": "created_by", "name": "创建人" }`、`{ "type": "updated_by", "name": "更新人" }`。

### 3.8 link

关联字段；`link_table` 必填。

支持字段：`link_table`、`bidirectional`、`bidirectional_link_field_name`

默认值 / 约束：
- `link_table` 必填
- `link` 字段的单元格表示“当前记录关联到的对侧表记录集合”
- `bidirectional` 默认 `false`
- `bidirectional=true` 时，会在被关联表自动创建一个反向关联字段。任一侧记录的关联关系发生变更时，另一侧对应记录会自动同步更新
- `bidirectional_link_field_name` 仅在 `bidirectional=true` 时使用
- 关联字段筛选：这个功能在 Base 前端支持，属于 UI-only 属性，OpenAPI 里不支持，CLI 不能读取、创建或更新；不要根据接口返回缺失判断未配置

```json
{
  "type": "link",
  "name": "关联任务",
  "link_table": "任务表"
}
```

双向关联：

```json
{
  "type": "link",
  "name": "关联任务",
  "link_table": "任务表",
  "bidirectional": true,
  "bidirectional_link_field_name": "反向关联"
}
```

更新时注意：
- `link` 不允许转换为其他类型，其他类型也不能转换为 `link`。
- 现有 `link` 字段的 `bidirectional` 不能改。

### 3.9 formula

公式字段；`expression` 必填。创建/更新前先读 [Formula Field](lark-base-0.md#s-b26660f08d3f8148) 学习公式语法。

```json
{
  "type": "formula",
  "name": "合计",
  "expression": "1+1"
}
```

### 3.10 lookup

查找引用字段使用 `from`、`select`、`where` 和可选 `aggregate`；结构、条件和聚合值必须按 [Lookup Field](lark-base-0.md#s-c44aa7298dcfa089) 构造。

### 3.11 auto_number

自动编号字段；创建时不写 `style.rules` 会使用默认规则：`NO.001`。更新已有自动编号字段时应显式提交目标 `style.rules`，因为 `+field-update` 会把新的编号规则重新应用到已有编号。

最小写法：

```json
{
  "type": "auto_number",
  "name": "编号"
}
```

`style.rules` 包含 1–9 条规则：固定文本用 `{ "type":"text", "text":"TASK-" }`；递增序号用 `{ "type":"incremental_number", "length":4 }`（长度 1–9）；创建时间用 `{ "type":"created_time", "date_format":"yyyyMMdd" }`，格式支持 `yyyyMMdd`、`yyyyMM`、`yyMM`、`MMdd`、`yyyy`、`MM`、`dd`。

自定义规则：

```json
{
  "type": "auto_number",
  "name": "编号",
  "style": {
    "rules": [
      { "type": "text", "text": "TASK-" },
      { "type": "created_time", "date_format": "yyyyMMdd" },
      { "type": "incremental_number", "length": 4 }
    ]
  }
}
```

### 3.12 attachment / location / checkbox

```json
{ "type": "attachment", "name": "附件" }
```

```json
{ "type": "location", "name": "位置" }
```

Location 读取为 `{lng,lat,full_address}`；写入只使用数字 `{lng,lat}`，`full_address` 由平台根据坐标解析，不允许手动指定；筛选行为按照 `full_address` 做字符串筛选，将 Location 当作文本列使用文本 operator。`location -> text` 时只保留 `full_address`。

```json
{ "type": "checkbox", "name": "完成" }
```

### 3.13 button

```json
{ "type": "button", "name": "按钮", "button_config": { "title": "点击按钮" } }
```

绑定 Workflow 时，使用 `+button-rule-bind`；读取绑定关系时，使用 `+button-rule-get`；解除绑定用 `+button-rule-unbind`。

## 4. 创建与更新

- `+field-create`：按目标字段配置直接构造 `--json`。
- `+field-update`：使用同样的 JSON 结构，但执行完整覆盖更新，不是局部 patch。先用 `+field-get` 读取当前定义，在其基础上修改目标属性；需要保留的名称、类型、样式、选项、默认值、描述及类型专属配置都应完整写回，并带 `--yes`。

## 5. 暂不支持字段

Object（对象字段）、Stage（流程字段）暂时没有被 CLI 支持。这些字段会展示为 `not_support` 字段并被保护：不允许修改，不允许读取内容。

## 6. 易错点

- `select` 只有一个类型；不要写 `single_select` / `multi_select`，用 `multiple` 控制是否多选。
- `number` 的精度、货币、进度、评分配置都放在 `style` 下，不要写顶层 `precision`。
- `datetime` 是手动日期字段；系统时间请改用 `created_at` / `updated_at`。
- `formula` / `lookup` 没读 guide 前不要直接写。
- 只有 `text`、`number`、静态 `select`、`datetime`、`user` 支持 `default_value`；清空统一传 `"default_value": null`。其他字段类型不要配置默认值。


<a id="s-747bb7fa2d2247a2"></a>

## references/lark-base-field-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +field-update

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

更新一个已有字段。

## 推荐命令

```text
lark-cli base +field-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --field-id <field_id> \
  --json '{"name":"状态","type":"select","multiple":false,"default_value":["Doing"],"options":[{"name":"Todo","hue":"Blue","lightness":"Lighter"},{"name":"Doing","hue":"Orange","lightness":"Light"},{"name":"Done","hue":"Green","lightness":"Light"}]}' \
  --yes

```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token |
| `--table-id <id_or_name>` | 是 | 表 ID 或表名 |
| `--field-id <id_or_name>` | 是 | 字段 ID 或字段名 |
| `--json <body>` | 是 | 字段属性 JSON 对象 |
| `--yes` | 是 | 确认执行高风险字段更新 |

> 这是**高风险写入操作**。`+field-update` 使用 `PUT` 全量字段定义语义；改变字段类型或关键配置可能影响整列已有数据的解释、展示或可用性。CLI 层要求显式传 `--yes`；如果用户已经明确目标和期望更新，可直接执行并带上 `--yes`。

## API 入参详情

**HTTP 方法和路径：**

```
PUT /open-apis/base/v3/bases/:base_token/tables/:table_id/fields/:field_id
```

## JSON 值规范

- `--json` 必须是 **JSON 对象**，顶层直接传字段定义。
- 更新语义是 override 式的完整覆盖 `PUT`，不是 partial update；先读取当前定义，再提交整个字段需要保留的可写配置，不要只传零散片段。
- 所有字段类型都支持可选 `description`；支持纯文本，也支持 Markdown 链接。
- 需要字段默认值时传 `default_value`，直接使用字段对应 CellValue；传 `null` 清空。完整规则见 [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc)。
- `select` 更新时：`options` 仍按对象数组传，避免混入无效字段。
- `link` 更新限制：
  - 不能把非 `link` 字段改成 `link`，也不能把 `link` 改成非 `link`。
  - 现有 `link` 字段的 `bidirectional` 不能改。
- 更新 `auto_number.style.rules` 会按新规则更新已有记录的编号；规则结构见 [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc)。

**推荐更新示例**

```json
{
  "name": "状态",
  "type": "select",
  "multiple": false,
  "default_value": ["Doing"],
  "options": [
    { "name": "Todo", "hue": "Blue", "lightness": "Lighter" },
    { "name": "Doing", "hue": "Orange", "lightness": "Light" },
    { "name": "Done", "hue": "Green", "lightness": "Light" }
  ]
}
```

## 返回重点

- 返回 `field` 和 `updated: true`。
- 按返回的 `next_step` 和 `verification_hint` 继续；类型转换涉及已有值时抽样读取记录。

## 工作流


1. 先用 `+field-get` 读取当前定义，只改变目标属性，并把需要保留的其他可写配置完整写回。
2. `formula/lookup` 类型更新前先阅读对应指南。
3. 如果这次更新会改变字段 `type`，先按下方“字段类型变更规则”判断能否执行。如果不修改 `type`，大多数场景都相对安全。

## 字段类型变更规则

字段类型变更采用白名单机制：**只允许白名单转换**；未命中白名单时，**不建议用 CLI 转换字段类型** 除非用户明确知道风险并同意。

### 允许直接转换 type

先 `+field-get` / `+field-list` 看结构，再抽样读值；只有命中以下规则时，转换才是比较安全的。

#### 相对安全

| 目标类型 | 允许的源类型 | 说明 |
|------|------|------|
| `text` | `number`、`select`、`datetime`、`created_at`、`updated_at`、`location`（只保留 `full_address`）、`auto_number`、`checkbox` | 保留字符串表示；丢失原类型语义和结构化能力 |
| `number` | `text`、`number`、`datetime`、`created_at`、`updated_at`、`checkbox` | 保留可解析的数字值；无法解析的值会变空，原文本格式会丢失 |
| `datetime` | `text`、`number`、`datetime`、`created_at`、`updated_at` | 保留可解析的时间字符串和时间戳；无法解析的值会变空，原文本格式会丢失 |
| `select` | `text -> select`、`number -> select`、`single select -> multi select` | 只有完全匹配目标选项名的值会转成对应选项；没匹配上的值会被丢弃 |

#### 可执行但会截断 / 重算

- `select(multi) -> select(single)`: 只保留第一个值，其余值会被丢弃。
- `user(multi) -> user(single)`: 只保留第一个人员，其余值会被丢弃。
- `group_chat(multi) -> group_chat(single)`: 只保留第一个群，其余值会被丢弃。

#### 无状态字段可直接转换

- `created_at`、`created_by`、`updated_at`、`updated_by`、`formula`、`lookup`: 这类字段值由系统或计算逻辑生成，不承载独立存储数据；可以执行类型转换，不必担心破坏原始记录值，但仍要做下游读回验证。

### 一律不要用 CLI 转换

以下场景全部视为黑名单；默认要求用户改到 Web 页面手动完成，或改走“新建字段 + 数据迁移”。

- `any -> checkbox`
- `any -> user`
- `any -> group_chat`
- `any -> attachment`
- `any -> location`
- `link` 类型变更
- 任意涉及动态 / 静态选项来源切换的 `select` 类型变更

### 可例外继续执行的场景

只有在**整列数据丢失可接受**时，才允许对黑名单场景例外执行。

1. 该列为空。
2. 正在初始化新建的空表。
3. 主字段不能删除，需要通过更新完成初始化。
4. 用户明确接受整列数据丢失。

不满足以上条件时，不要转换。

### 非白名单场景如何处理

- 命中白名单时：建议直接原地转换，再做读回验证。
- 未命中白名单时：先询问用户是否仍要执行转换，并明确说明风险：
  - 无状态字段除外；这类字段可以直接转换
  - 可能整列变空
  - 可能只保留第一个值
  - 可能只保留字符串表示，丢失原类型语义和结构化能力
  - 可能影响视图 / 筛选 / 排序 / 公式 / lookup / 写入引用
- 如果用户不接受风险：不要执行转换。

## 坑点

- ⚠️ 这是全量字段属性更新语义，不是 patch。
- ⚠️ 这是高风险写入操作，执行时必须带 `--yes`。
- ⚠️ 当 `type` 是 `formula` 或 `lookup` 时，先阅读对应指南再执行。

## 参考

- 更新前读取当前字段，确认现有 `type` 和具体配置细节，再决定是原地更新还是新建字段迁移。
- [Field Schema](lark-base-0.md#s-cb2af5486e8e59fc) — 字段 JSON 规范（推荐）
- [Formula Field](lark-base-0.md#s-b26660f08d3f8148) — 更新公式前必读
- [Lookup Field](lark-base-0.md#s-c44aa7298dcfa089) — 更新查找引用前必读


<a id="s-ea7773b079411c53"></a>

## references/lark-base-filter-condition.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Filter 条件结构（公共协议）

Filter 是一组「字段/操作符/值」条件的组合，用 `logic`（`and` / `or`）把多条 `conditions` 连接起来，用于描述「满足什么条件」。视图筛选 `filter`、记录读取/搜索的 `--filter-json`、表单题目显隐条件 `visible_rule` 复用同一套 tuple 结构，本文件是其公共协议（SSOT）。

## 0. 适用范围

本协议只适用于以下场景：

- `+view-set-filter` / `+view-get-filter` 的视图筛选配置。
- `+record-list --filter-json` / `+record-search --filter-json` 的结构化记录筛选。
- `+form-questions-create` / `+form-questions-update` 中的 `visible_rule` 显隐条件。

本协议**不适用于 `+data-query`**。`+data-query` 支持过滤，但使用的是 LiteQuery DSL 的 `filters` 对象结构：`{"type":1,"conjunction":"and","conditions":[{"field_name":"状态","operator":"is","value":["有效"]}]}`，不是这里的 tuple 条件 `["状态","==","有效"]`。需要聚合查询时先返回 [Record 查询与分析 SOP](lark-base-0.md#s-cc7ad3628755b3c0) 选路；SOP 选定 `+data-query` 后再读取 guide 和完整 DSL reference。

## 1. 顶层结构

- 必须是 JSON 对象。
- 顶层结构是 `{logic?, conditions?}`。
- `logic` 默认 `and`；推荐只用 canonical 值 `and` / `or`。
- `conditions` 默认空数组。
- 每条条件写成 tuple：`[field, operator, value?]`。
- `empty` / `non_empty` 可写成 2 项：`[field, "empty"]`、`[field, "non_empty"]`。

```json
{
  "logic": "and",
  "conditions": [
    ["状态", "intersects", ["Doing"]],
    ["负责人", "intersects", [{ "id": "ou_xxx" }]],
    ["截止时间", "empty"]
  ]
}
```

清空写法：

```json
{
  "conditions": []
}
```

## 2. 单表谓词下推常用 example

`+record-list` / `+record-search` 的 `--filter-json '<filter-json>'` 也支持使用与视图相同的 tuple condition。以下示例用注释说明各条件的含义；实际传参时删除注释并使用标准 JSON：

```jsonc
{
  "logic": "and", // 所有 conditions 同时成立；任意一个成立时使用 "or"
  "conditions": [
    ["标题", "==", "Launch plan"], // 文本全等
    ["标题", "!=", "Archived plan"], // 文本不全等
    ["标题", "intersects", "urgent"], // 文本包含目标片段
    ["标题", "disjoint", "internal"], // 文本不包含目标片段
    ["金额", ">=", 100], // 数字比较；支持 ==、!=、>、>=、<、<=
    ["状态", "intersects", ["进行中", "暂停"]], // Select 集合相交：包含“进行中”或“暂停”任意一个选项
    ["状态", "disjoint", ["已终止"]], // Select 集合无交集
    ["已完成", "==", true], // Checkbox
    ["负责人", "intersects", [{ "id": "ou_xxx" }]], // 负责人包含某个人；intersects 表示包含数组中任意一个人员
    ["负责人", "disjoint", [{ "id": "ou_yyy" }]], // 负责人不包含指定人员中的任何一个
    ["关联项目", "intersects", [{ "id": "recxxx" }]], // 关联项目包含某个 record_id；intersects 表示包含数组中任意一条关联
    ["备注", "non_empty"], // 格子非空；判断格子为空改用 ["备注", "empty"]
    ["业务日期", "==", "ExactDate(2026-08-07)"], // 具体一天：按 Base 时区匹配 2026-08-07 当天
    ["发生时间", ">", "ExactDate(2024-01-31 23:59:59.999)"], // 日期不支持 >=；用 > 前一天最后一毫秒表达含当天的下界
    ["发生时间", "<", "ExactDate(2024-03-01 00:00:00)"] // 2024 年 2 月范围上界：小于 3 月 1 日零点
  ]
}
```

## 3. operator

可用 operator：
- `==`
- `!=`
- `>`
- `>=`
- `<`
- `<=`
- `intersects`
- `disjoint`
- `empty`
- `non_empty`

## 4. value 写法

value 类型取决于条件引用对象（字段 / 题目）的类型。

### `text`

用字符串；高频的片段包含 / 排除使用 `intersects` / `disjoint`，完整文本比较使用 `==` / `!=`：

```json
["标题", "intersects", "发布"]
```

```json
["标题", "disjoint", "内部"]
```

### `location`

location 筛选只按 `full_address` 字符串匹配，不能直接按经纬度筛选；优先使用 `intersects` 做包含匹配，例如查深圳：

```json
["位置", "intersects", "深圳"]
```

### `number` / `auto_number`

用数字：

```json
["工时", ">=", 3.5]
```

### `select`

用选项名数组；`intersects` 表示命中任意选项，`disjoint` 表示不包含其中任何选项：

```json
["状态", "intersects", ["Doing", "Blocked"]]
```

```json
["状态", "disjoint", ["Archived"]]
```

### `user` / `group_chat` / `created_by` / `updated_by`

用对象数组；人员使用 `ou_xxx`，群组使用 `oc_xxx`。不知道 ID 时，人员用 `lark-contact` 查询，群组用 `lark-im` 搜索。

```json
["负责人", "intersects", [{ "id": "ou_xxx" }]]
```

```json
["负责人", "disjoint", [{ "id": "ou_xxx" }]]
```

```json
["负责群", "intersects", [{ "id": "oc_xxx" }]]
```

### `link`

用记录 id 对象数组：

```json
["关联任务", "intersects", [{ "id": "recxxx" }]]
```

### `checkbox`

用布尔值：

```json
["完成", "==", true]
```

### `datetime` / `created_at` / `updated_at`

用相对时间关键字或 `ExactDate(...)`：

```json
["截止时间", "==", "ExactDate(2026-01-01)"]
```

```json
["截止时间", "==", "ExactDate(2026-01-01 11:30)"]
```

```json
["截止时间", "==", "Today"]
```

可用关键字：
- `Today`
- `Yesterday`
- `Tomorrow`

### `formula` / `lookup`

value schema 随计算结果类型变化；拿不准时先读取字段定义，或根据错误提示修正 value 和 operator。

## 5. 易错点

- 不要再写旧对象风格：`{"field_name":...,"operator":...}`。
- `user` / `group_chat` / `link` 不要写成单个标量。
- `empty` / `non_empty` 统一表示格子为空 / 非空，不要传 value；标量空格子和多值字段没有任何元素都属于空。
- 日期条件稳定写法用 `ExactDate(...)` 或 `Today` / `Yesterday` / `Tomorrow`。
- `formula` / `lookup` 的 value schema 是动态的；拿不准 value 类型时先读字段定义，或根据错误提示修正类型。

## 6. 参考
- [Lookup Field](lark-base-0.md#s-c44aa7298dcfa089)


<a id="s-985279bc773a01a5"></a>

## references/lark-base-form-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +form-detail

通过表单分享 token 读取表单详情。只读操作，适合在提交表单前解析题目结构、必填项、显示条件和附件提交所需的 Base token。

## 何时使用

- 用户给出 `/share/base/form/{shareToken}` 表单分享链接，先提取最后一段作为 `--share-token`。
- 准备调用 `+form-submit` 前，必须先用 `+form-detail` 读取 `questions[]`。
- 只知道分享链接、还不知道 `base-token` / `table-id` / `form-id` 时，用 `+form-detail`；已在 Base 内部管理表单时，才用 `+form-get`。

```text
lark-cli base +form-detail --share-token <share_token> --format pretty
```

## 读取重点

`+form-detail` 返回的关键字段：

| 字段 | 用途 |
|---|---|
| `base_token` | 表单所属 Base；提交附件时必须传给 `+form-submit --base-token` |
| `questions[].id` | 题目标识，通常对应字段 ID |
| `questions[].title` | 提交时使用的字段名/题目名，以真实返回为准 |
| `questions[].type` | 决定值格式；提交结构见 [form-submit](lark-base-0.md#s-4963125425a3cc77) |
| `questions[].required` | 判断必填项 |
| `questions[].filter` | 判断题目是否对当前提交可见；被隐藏的问题不要填写 |

题目除固定字段外，会按类型携带动态配置，例如 `select.options` / `select.multiple`、`number.style`、`datetime.style.format`、`user.multiple`、`link.link_table`、`formula.expression`、`lookup.from/select/where/aggregate`。提交前按返回结构构造值，不要猜题目类型或选项。

## filter 显示条件

`questions[].filter` 控制题目显示/隐藏：

```json
{
  "conjunction": "and",
  "conditions": [
    {"field_name": "是否携带家属", "operator": "is", "value": ["是"]},
    {"field_name": "参与人数", "operator": "isGreater", "value": [1]}
  ]
}
```

- `conjunction` 为 `and` / `or`，表示条件全部满足或任一满足。
- `conditions[].field_name` 引用其他题目的 `title`。
- `conditions[].operator` 常见为 `is`、`isNot`、`contains`、`doesNotContain`、`isEmpty`、`isNotEmpty`、`isGreater`、`isGreaterEqual`、`isLess`、`isLessEqual`。
- `isEmpty` / `isNotEmpty` 不需要 `value`。
- 附件题目的 filter 只适合 `isEmpty` / `isNotEmpty`。

如果当前已填写值不满足某题目的 `filter`，该题目视为隐藏，不应放入 `+form-submit --json.fields` 或 `--json.attachments`。

## 与 form-submit 的关系

提交普通字段：

```text
lark-cli base +form-submit \
  --share-token <share_token> \
  --json '{"fields":{"姓名":"张三","评分":5}}'
```

提交附件字段：

```text
lark-cli base +form-submit \
  --share-token <share_token> \
  --base-token <base_token_from_form_detail> \
  --json '{"fields":{"姓名":"张三"},"attachments":{"附件":["./report.pdf"]}}'
```

附件字段不要写进 `fields`；放在顶层 `attachments`，值为本地文件路径数组。


<a id="s-cc8ee423033b7e75"></a>

## references/lark-base-form-questions-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +form-questions-create

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

向多维表格表单/问卷中批量添加问题。可以新建字段并作为题目，也可以把已有字段加到表单中作为题目而不新建字段。

## 命令

```text
# 添加一个文本必填问题
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"text","title":"您的姓名是？","required":true}]'

# 添加多个问题（按顺序排列）
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"text","title":"您的姓名是？","required":true},{"type":"text","title":"您的联系方式是？","required":false}]'

# 添加单选题（带选项）
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"select","title":"满意度评价","required":true,"multiple":false,"options":[{"name":"非常满意","hue":"Green"},{"name":"满意","hue":"Blue"},{"name":"一般","hue":"Yellow"}]}]'

# 添加评分题
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"number","title":"服务评分","style":{"type":"rating","icon":"star","min":1,"max":5}}]'
  
# 添加带描述的问题（纯文本）
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"text","title":"您的姓名","description":"请填写真实姓名"}]'
# 添加带描述的问题（含链接）
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"text","title":"反馈建议","description":"更多详情请查看[帮助文档](https://example.com/help)"}]'  

# 添加带显隐条件（visible_rule）的问题：当「是否需要发票」选择「是」时才显示「发票抬头」
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"type":"select","title":"是否需要发票","required":true,"options":[{"name":"是","hue":"Blue"},{"name":"否","hue":"Gray"}]},{"type":"text","title":"发票抬头","visible_rule":{"logic":"and","conditions":[["是否需要发票","==","是"]]}}]'

# 把已有字段作为题目加到表单中，不新建字段
lark-cli base +form-questions-create \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"use_existing_field":true,"field_id":"fldEmail","title":"你的邮箱","description":"用于接收回执","required":true}]'
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token（base_token） |
| `--table-id <id>` | 是 | 数据表 ID |
| `--form-id <id>` | 是 | 表单 ID |
| `--questions <json>` | 是 | 问题 JSON 数组，最多 10 个（见下方格式） |
| `--format` | 否 | 输出格式：json（默认）\| pretty \| table \| ndjson \| csv |
| `--as` | 否 | 身份：user（默认）\| bot |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## `--questions` 格式

`--questions` 是 1~10 个问题对象的数组。每个对象二选一：

- 新建字段题目：创建一个新字段，并把该字段作为表单题目。
- 已有字段题目：把一个已存在字段加入表单，只改变该字段在表单中的可见性，不创建字段。

### 形态 A：新建字段题目

新建字段题目会在数据表中创建新字段，返回的 question `id` 就是新字段的 `field_id`。CLI 当前要求每个新建字段题目显式传 `title` 和 `type`。

| 字段                    | 必填 | 说明 |
|-----------------------|------|------|
| `title`               | **是** | 问题标题（字段名） |
| `type`                | **是** | 题目类型：`text`、`number`、`select`、`datetime`、`user`、`attachment`、`location` |
| `description`         | 否 | 问题描述（纯文本或 Markdown 链接，如 `[文本](https://example.com)`） |
| `required`            | 否 | 是否必填（true/false） |
| `option_display_mode` | 否 | 选项展示方式（仅 `select` 有效）：`0`=下拉，`1`=纵向（默认），`2`=横向 |
| `multiple`            | 否 | 是否多选（`select`/`user` 类型有效，bool） |
| `options`             | 否 | 选项列表（仅 `select` 有效）：`[{"name":"选项1","hue":"Blue"}]`，hue 可选：`Red`/`Orange`/`Yellow`/`Green`/`Blue`/`Purple`/`Gray` |
| `style`               | 否 | 字段样式配置（见下方说明） |
| `visible_rule`        | 否 | 题目显隐条件（见下方「`visible_rule` 显隐条件」） |

### 形态 B：已有字段题目

已有字段题目只把一个已存在字段加入表单，不新建字段，也不改变已有记录数据。适合把之前用 `+form-questions-delete --keep-field` 移出表单的题目重新加回，或把表里已有字段补充为表单题目。

| 字段                    | 必填 | 说明 |
|-----------------------|------|------|
| `use_existing_field`  | **是** | 固定传 `true`，表示使用已有字段 |
| `field_id`            | **是** | 已有字段的 ID 或字段名；推荐字段 ID，避免同名字段歧义。引用长度 1~100，较长字段名请改用字段 ID |
| `title`               | 否 | 题目标题；省略时使用字段名 |
| `description`         | 否 | 问题描述（纯文本或 Markdown 链接，如 `[文本](https://example.com)`） |
| `required`            | 否 | 是否必填（true/false），默认 false |
| `option_display_mode` | 否 | 选项展示方式（仅已有字段为 `select` 时有效）：`0`=下拉，`1`=纵向（默认），`2`=横向 |
| `visible_rule`        | 否 | 题目显隐条件（见下方「`visible_rule` 显隐条件」） |

已有字段题目不要携带字段定义属性，例如 `type`、`style`、`options`、`multiple`、`name`。服务端使用 strict schema，误传不属于该形态的字段会被拒绝。

### `style` 字段说明

| 类型 | style 结构 | 说明 |
|------|------|------|
| `text` | `{"type":"plain"}` | 当前仅支持 `plain` |
| `number` | `{"type":"plain","precision":2}` | precision 为小数位数 |
| `number`（评分） | `{"type":"rating","icon":"star","min":1,"max":5}` | icon 可选：`star`/`heart`/`thumbsup`/`fire`/`smile`/`lightning`/`flower`/`number` |
| `datetime` | `{"format":"yyyy/MM/dd"}` | format 可选：`yyyy/MM/dd`、`yyyy/MM/dd HH:mm`、`MM-dd`、`MM/dd/yyyy`、`dd/MM/yyyy` |

### `visible_rule` 显隐条件

> **仅当用户明确要求为题目设置显隐条件（显示/隐藏逻辑）时，才需要读下面的结构说明；否则忽略本节。**

`visible_rule` 控制题目在表单中的显示/隐藏：当条件满足时题目显示，不满足时隐藏；不传或 `conditions` 为空数组则题目始终显示。

- **结构与视图筛选 `filter` 完全一致**，即 `{logic?, conditions?}`，共用同一套公共协议。
- 与视图 `filter` 唯一的区别：`conditions` 中的 `field` 引用的是**同一表单内其他题目的题目名称或题目 ID**（推荐用题目 ID 以避免重名歧义），而不是数据表字段。
- **只能引用前序题目**：条件只能引用排在当前题目之前的题目——创建时按 `questions` 数组顺序判定（可引用同批次更靠前的新题目或表单中已有题目），不支持循环引用。
- 引用的题目必须真实存在，否则会报错。
- 列出题目（`+form-questions-list`）会在每个题目对象中**原样返回** `visible_rule`；未设置显隐条件的题目返回 `null` 或 `conditions` 为空数组。

```json
{
  "logic": "and",
  "conditions": [
    ["是否需要发票", "==", "是"],
    ["报销金额", ">=", 1000]
  ]
}
```

详细的 `visible_rule` 结构（顶层规则、operator 列表、各题目类型的 value 写法）请阅读 [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53)。

## 输出格式

返回创建成功的问题列表：

```json
{
  "ok": true,
  "data": {
    "items": [
      {"id": "q_001", "title": "您的姓名是？", "required": true}
    ]
  }
}
```

## 工作流

> [!CAUTION]
> 这是**写入操作** — 执行前必须向用户确认。

1. 先确定表单所属的真实 `table_id`，并在整个表单管理工作流中复用它；仅在 ID 缺失或归属不明确时调用 `+table-list`。
2. 用 `+form-questions-list` 查看现有问题。问题 `id` 是承载该问题的 `field_id`，不是独立于数据表的临时 ID。
3. 需要把表里已有字段加进表单时，先用 `+field-list` 确认真实字段 ID 和字段类型，再用 `use_existing_field:true` + `field_id`；字段已经是可见题目时不要重复创建，改用 `+form-questions-update`。
4. 除非用户明确要求同名的独立问题，否则目标标题已经存在时用 `+form-questions-update` 更新必填状态、标题或描述；不要创建同名问题后再删除旧问题。
5. 创建确实不存在的问题，或用户明确要求的同名独立问题，并报告新建的问题 ID。

`+form-questions-delete` 默认会删除承载问题的数据表字段及记录数据；如果只是想把题目移出表单并保留字段，必须用 `+form-questions-delete --keep-field`。移出后可用本文的已有字段题目形态加回。

## 参考

- [lark-base](lark-base-0.md#s-f9ade3356084cb11) — 多维表格全部命令
- [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53) — `visible_rule` / `filter` 条件结构公共协议
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-cd7d8d135d50d3cc"></a>

## references/lark-base-form-questions-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +form-questions-update

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

批量更新多维表格表单/问卷中的问题配置（标题、描述、是否必填、显隐条件等）。

> [!CAUTION]
> `+form-questions-update` 是**题目配置全量覆盖**，不是 patch。对每个传入的题目，未携带的属性会回落为默认值，显式传空字符串 / `null` / 空数组会直接写入空或清空；如果要保留现有属性，必须先用 `+form-questions-list` 查出现状，再把要保留的字段一起带回 `--questions`。

## 命令

```text
# 先读取现有题目配置，作为 read-modify-write 的基线
lark-cli base +form-questions-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id>

# 更新一个问题的标题，同时带回要保留的 required / description / visible_rule 等字段
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_001","title":"您的真实姓名是？","description":"请填写真实姓名","required":true,"visible_rule":null}]'

# 同时更新多个问题；每个对象都应是该题目的目标完整配置
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_001","title":"姓名（必填）","required":true},{"id":"q_002","title":"联系方式","required":false}]'
  
# 更新问题描述（纯文本），同时带回要保留的 title / required / visible_rule
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_001","title":"您的姓名","description":"请填写您的真实姓名","required":true,"visible_rule":null}]'
# 更新问题描述（含链接），同时带回要保留的 title / required / visible_rule
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_001","title":"反馈建议","description":"更多说明请参考[帮助文档](https://example.com/help)","required":false,"visible_rule":null}]'

# 更新题目显隐条件（visible_rule），同时带回要保留的 title / description / required
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_002","title":"发票抬头","description":"","required":false,"visible_rule":{"logic":"and","conditions":[["q_001","==","是"]]}}]'

# 清空题目显隐条件（使题目始终显示），同时带回要保留的 title / description / required
lark-cli base +form-questions-update \
  --base-token <base_token> \
  --table-id <table_id> \
  --form-id <form_id> \
  --questions '[{"id":"q_002","title":"发票抬头","description":"","required":false,"visible_rule":null}]'
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--base-token <token>` | 是 | Base Token（base_token） |
| `--table-id <id>` | 是 | 数据表 ID |
| `--form-id <id>` | 是 | 表单 ID |
| `--questions <json>` | 是 | 问题更新 JSON 数组，最多 10 个（见下方格式） |
| `--format` | 否 | 输出格式：json（默认）\| pretty \| table \| ndjson \| csv |
| `--as` | 否 | 身份：user（默认）\| bot |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

## `--questions` 格式

每个问题对象必须包含 `id`。注意：对象不是增量 patch，而是该题目的目标完整配置；未携带字段会按服务端默认值重建。

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | **是** | 问题 ID（field_id），不可修改 |
| `title` | 否 | 目标问题标题；省略会回落为字段名，传空字符串会写入空标题（若服务端允许） |
| `description` | 否 | 目标问题描述（纯文本或 Markdown 链接，如 `[文本](https://example.com)`）；省略或传空字符串都会清空描述 |
| `required` | 否 | 目标是否必填；省略会回落为 `false` |
| `option_display_mode` | 否 | 目标选项展示方式（仅 `select` 有效）：`0`=下拉，`1`=纵向（默认），`2`=横向；省略会回落默认展示方式 |
| `visible_rule` | 否 | 目标题目显隐条件；传完整 `{logic, conditions}` 对象覆盖，传 `null` 或省略都会清空（见下方说明） |

## 全量覆盖语义

- 先执行 `+form-questions-list`，读取被更新题目的当前 `id`、`title`、`description`、`required`、`option_display_mode`、`visible_rule`。
- 构造 `--questions` 时，只改用户明确要求变化的字段；所有仍要保留的字段必须按当前值一并传回。
- 不要用“只传要改的字段”的方式更新题目。比如只传 `{"id":"q_002","title":"新标题"}` 会让 `description` 清空、`required` 回落为 `false`、`visible_rule` 清空。
- 用户明确要求清空时才传空值：`description:""` 清空描述，`visible_rule:null` 清空显隐条件，`conditions:[]` 也表示无条件显示。

### `visible_rule` 显隐条件

> **仅当用户明确要求为题目设置或修改显隐条件（显示/隐藏逻辑）时，才需要读下面的结构说明；否则忽略本节。**

`visible_rule` 控制题目显示/隐藏，**结构与视图筛选 `filter` 完全一致**（`{logic?, conditions?}`），共用同一套公共协议。

- `conditions` 中的 `field` 引用**同一表单内其他题目的题目名称或题目 ID**（推荐用题目 ID）。
- 更新时按表单中题目的**实际顺序**判定，只能引用排在当前题目之前的题目；不支持循环引用。
- 更新 `visible_rule` 需传**完整**的 `{logic, conditions}` 对象（整体覆盖）；要保留现有显隐条件就必须把当前 `visible_rule` 原样带回；传 `null`、省略 `visible_rule` 或传空 `conditions` 都会使题目始终显示。
- 列出题目（`+form-questions-list`）会在每个题目对象中**原样返回** `visible_rule`；未设置显隐条件的题目返回 `null` 或 `conditions` 为空数组。

```json
{
  "logic": "and",
  "conditions": [
    ["q_001", "==", "是"],
    ["q_003", ">=", 1000]
  ]
}
```

详细的 `visible_rule` 结构（顶层规则、operator 列表、各题目类型的 value 写法）请阅读 [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53)。

## 输出格式

返回更新后的问题列表：

```json
{
  "ok": true,
  "data": {
    "items": [
      {"id": "q_001", "title": "姓名（必填）", "required": true}
    ]
  }
}
```

## 工作流

> [!CAUTION]
> 这是**写入操作** — 执行前必须向用户确认。

1. 先用 `+form-questions-list` 获取现有问题及其 `id` 和完整配置。
2. 以现有配置为基线，只修改用户明确要求变化的字段；要保留的字段必须原样带回。
3. 构造包含 `id` 和目标完整配置的更新数组。
4. 执行命令并报告更新结果。

## 参考

- [lark-base](lark-base-0.md#s-f9ade3356084cb11) — 多维表格全部命令
- [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53) — `visible_rule` / `filter` 条件结构公共协议
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-4963125425a3cc77"></a>

## references/lark-base-form-submit.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +form-submit

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

通过表单分享链接填写并提交多维表格表单。仅支持分享模式（share_token），支持填写普通字段值和上传本地文件作为附件。

> **⚠️ 高风险写操作（high-risk-write）：** 本命令会向表单写入并提交数据，属于高风险写操作，必须额外传递 `--yes` 进行确认，否则会返回 `confirmation_required` 错误并退出。当用户明确要求提交且目标表单无歧义时，直接附加 `--yes`，无需再次询问。

## 填写前必读：先获取表单详情

**在调用 `+form-submit` 之前，必须先使用 `+form-detail` 获取表单详情。** 原因如下：

1. **字段类型匹配**：每个题目的 `type` 决定了值的格式（文本、数字、选项、人员、日期等），需根据类型正确构造 `fields` 中的值
2. **必填校验**：通过 `questions[].required` 判断哪些题目为必填项，避免遗漏
3. **显示条件过滤**：部分题目带有 `filter`（显示/隐藏逻辑），需根据用户已填的其他题目值判断该题目是否应该出现——**不应填写被 filter 隐藏的题目**
4. **获取 base_token（附件场景必用）**：`+form-detail` 返回的 `data.base_token` 是该表单所属的多维表格标识。当表单包含附件字段时，提交时必须通过 `--base-token` 传入此值，因为附件需要上传到该 Base 的 Drive Media 中

典型流程：

```text
# 1️⃣ 先获取表单详情，了解所有题目
lark-cli base +form-detail --share-token <share_token>

# 2️⃣ 根据返回的 questions 列表，按 type 格式化值、检查 required、判断 filter 条件

# 3️⃣ 再提交（高风险写操作，必须带 --yes）
lark-cli base +form-submit \
  --share-token <share_token> \
  --json '{"fields":{...}}' \
  --yes
```

`+form-detail` 的返回中要重点读取 `questions[].type`、`questions[].required`、题目 `filter` 和附件场景所需的 `data.base_token`。

## 命令

```text
# 基本提交（填写普通字段）
lark-cli base +form-submit \
  --share-token <share_token> \
  --json '{"fields":{"服务评分":5,"评价内容":"服务态度好"}}' \
  --yes

# 带附件提交（需要额外提供 --base-token）
lark-cli base +form-submit \
  --share-token <share_token> \
  --base-token <base_token> \
  --json '{
    "fields": {"服务评分": 5, "评价内容": "好"},
    "attachments": {
      "附件字段名": ["./report.pdf", "./photo.png"],
      "另一个附件字段": ["./doc.docx"]
    }
  }' \
  --yes

# 使用应用身份（bot）
lark-cli base +form-submit \
  --share-token <share_token> \
  --json '{"fields":{...}}' \
  --as bot \
  --yes

# 预览 API 调用（不实际执行，dry-run 无需 --yes）
lark-cli base +form-submit \
  --share-token <share_token> \
  --json '{"fields":{...}}' \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--share-token <token>` | 是 | 表单分享 Token（必填），从表单分享链接中提取 |
| `--base-token <token>` | 条件必填 | Base token；**当 `--json` 包含 `attachments` 时必须提供**，用于将附件上传到 Base Drive Media |
| `--json <json>` | 是 | JSON 对象，包含 `"fields"`（普通字段值）和 `"attachments"`（附件上传），详见下方说明 |
| `--yes` | 是 | 确认高风险写操作。本命令为 high-risk-write，不带 `--yes` 会返回 `confirmation_required` |
| `--format` | 否 | 输出格式：json（默认）\| pretty \| table \| ndjson \| csv |
| `--as` | 否 | 身份：user（默认）\| bot |
| `--dry-run` | 否 | 预览 API 调用，不执行 |

### --json 结构说明

`--json` 是一个 JSON 对象，包含两个部分：

#### fields（普通字段）

`fields` 中的常见单元格值按下方示例构造（与主 skill 一致）：

```json
{
  "文本字段": "Hello World",
  "电话字段": "13800000000",
  "超链接字段": "https://example.com",
  "数字字段": 12.5,
  "单选字段": "选项A",
  "多选字段": ["选项A", "选项B"],
  "时间字段": "2026-04-27 14:30:00",
  "复选框字段": true,
  "人员字段": [{ "id": "example_id" }],
  "关联字段": [{ "id": "recXXXXXXXXXXXX" }],
  "地理位置字段": { "lng": 116.397428, "lat": 39.90923 }
}
```

> **注意：附件类型字段不要写在 `fields` 里。** `fields` 中不包含附件，附件有独立的填写方式，见下方「attachments（附件上传）」章节。

> 自动编号、公式、创建/修改人、创建/修改时间等系统字段会自动填入，无需手动传入。

#### attachments（附件上传）

**附件字段的填写方式与 `fields` 中的普通单元格完全不同**，不能在 `fields` 里传 `file_token` 或其他附件格式。必须将附件字段单独放在 `--json` 的顶层 `attachments` 对象中，值为**本地文件路径数组**（不是 token）：

```json
{
  "attachments": {
    "附件字段名": ["./report.pdf", "./photo.png"],
    "另一个附件字段": ["./doc.docx"]
  }
}
```

CLI 收到路径后会自动完成以下流程：
1. 校验所有文件（存在性、大小 ≤2GB、常规文件）
2. 并行上传到 Base Drive Media（并发上限 5，跨字段重复路径自动去重）
3. 获取 `file_token` 后合并到最终表单提交内容中

> Record 写入时附件走独立的 `+record-upload-attachment` 命令；`+form-submit` 则在 `attachments` 中传本地路径，由 CLI 自动上传。

### 从分享链接提取 share-token

用户提供形如以下格式的表单分享链接时：

```
https://www.example.com/share/base/form/shrbcvST8eZy0vk8zjVZ1CAXNye
```

**提取方式：** 取 URL 路径最后一段作为 `--share-token`。

以上述链接为例：

- `share-token` = `shrbcvST8eZy0vk8zjVZ1CAXNye`

```text
lark-cli base +form-submit \
  --share-token shrbcvST8eZy0vk8zjVZ1CAXNye \
  --json '{"fields":{...}}' \
  --yes
```

## 输出格式

| 字段 | 类型 | 说明 |
|------|------|------|
| `can_submit_again` | bool | 是否可以再次填写 |

```json
{
  "ok": true,
  "data": {
    "can_submit_again": true
  }
}
```

## 提示

- **本命令为高风险写操作（high-risk-write），必须额外传递 `--yes` 确认**，否则返回 `confirmation_required` 并以非零码退出；`--dry-run` 预览除外
- 本命令仅支持通过表单分享链接（share_token）提交，不支持通过 base_token + table_id + view_id 方式提交
- **当 `--json` 包含 `attachments` 时，必须额外提供 `--base-token`**，因为附件上传到 Base Drive Media 需要指定目标 Base
- 附件字段只需在 `--json.attachments` 中提供本地路径即可，CLI 自动完成校验、并行上传、Token 获取和合并写入
- 限流：单应用 20 QPS，单用户 5 QPS
- 权限要求：`base:form:update`；使用 attachments 时还需 `docs:document.media:upload`

## 参考

- [lark-base](lark-base-0.md#s-f9ade3356084cb11) — 多维表格全部命令
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-de0a78f95601bd3f"></a>

## references/lark-base-record-history-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +record-history-list

查询单条记录的变更历史。它返回历史事件，不返回记录当前值，也不支持整表审计扫描。

## 使用前置

`+record-history-list` 仅查询单条记录。调用前必须获得能唯一对应用户指定目标、且与 `table_id` 属于同一张表的 `record_id`。

如果当前信息无法唯一确定目标记录，先向用户确认，必要时用 `+record-list` 辅助定位；不得自行选择记录，也不得扩展为批量或整表扫描。需要查询多条记录时，先确认范围，再逐条调用。

用 `+record-list` 展示候选时，可重复传入 `--field-id` 做最小投影。字段名包含空格时，需要给完整值加引号，例如 `--field-id "Project Owner"`。

用户明确指定某个视图的第 N 行时，先用同一 `view_id` 调用 `+record-list`，并将 `--offset` 设为 N-1、`--limit` 设为 1，再从唯一结果中取得 `record_id`。视图或排序上下文不明确时仍需先确认。

## 推荐命令

```text
lark-cli base +record-history-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --record-id <record_id>

lark-cli base +record-history-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --record-id <record_id> \
  --page-size 30 \
  --max-version <next_max_version>

lark-cli base +record-history-list \
  --base-token <base_token> \
  --table-id <table_id> \
  --record-id <record_id> \
  --format pretty
```

## 返回解释

- 历史条目通常按版本号降序返回，最新在前。
- 每条历史包含版本号、操作人、操作时间、操作类型和字段变更。
- 默认 JSON 中的 `create_time` 是秒级 Unix 时间戳；`--format pretty` 会将其转换为带 UTC 偏移的本地时间，并和操作人、字段变化放在同一行。
- `field_changes` 描述字段变更，重点看字段名/字段类型、`before` 和 `after`。
- `--format pretty` 中空的 `before` 或 `after` 显示为 `-`；默认 JSON 保留原始值。
- `activity_type` 常见值：`create`（创建记录）、`update`（编辑记录）、`delete`（删除记录）。

以下字段类型的变化可能不会出现在 `field_changes` 中：

- 计算字段：`formula`、`lookup`
- 系统字段：自动编号、创建时间、创建人、修改时间、修改人

## 翻页

- 首次请求不传 `--max-version`。
- 如果返回 `has_more=true`，取返回中的 `next_max_version` 作为下一次请求的 `--max-version`。
- `--page-size` 默认 30，最大 50。

## 注意

- `table-id` 和 `record-id` 必须来自同一张表。
- 这是单条记录历史，不是表级审计；用户明确要求查询多条记录时，先确认目标范围，再按记录串行调用。


<a id="s-cc7ad3628755b3c0"></a>

## references/lark-base-record-query-and-analysis-sop.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Record 数据语义与专业分析 SOP

本 SOP 不讲解通用 jq / Python / pandas 语法、统计公式或数据科学算法。Agent 应使用已有的数据分析能力；本文只负责把 Base 的查询范围、NDJSON 物理结构、Field / Record / View / Link 语义和完整性约束，正确映射到专业分析任务。

普通预览、已知记录读取、关键词搜索和小规模直接处理按主 skill 的 [Record 核心路径](lark-base-0.md#s-f9ade3356084cb11) 执行。以下情况读取本文：大表完整读取、`has_more=true`、View 范围读取、复杂多表 JOIN、集合或多值运算、分组与 Top-K、窗口或严格时序、时间周期对齐、层级递归、数据重塑、派生与指定规则清洗、临时语义转换，以及需要可靠样本范围的描述性或推断性分析。

## 1. 先选数据路径

| 任务条件 | 路径 | 完整性要求 |
| --- | --- | --- |
| 当前查询最多 2000 行且 `has_more=false` | NDJSON 本地分析 | 直接处理 artifact |
| 用户指定 View | 记录工具添加 `--view-id` 返回视图范围内的记录 | 结论只代表该 View；记录范围写入 `query_context` |
| 超过 2000 行且必须取得逐条原始记录 | 调整 `--offset` 后继续查询 | 直到 `has_more=false` 代表所有记录已读取 |
| 超过 2000 行，只需单表基础统计、分组或 Top-K | `+data-query` | 由 Base 云端在完整单表范围计算 |
| 多表 JOIN、窗口、递归、严格漏斗、语义分析或任意需要逐条明细的高级计算 | 完整 NDJSON 后由合适的本地分析引擎处理 | 每张参与表都必须完整；不能用 `data-query` 代替原始明细 |

局部预览、固定前 N 条或 `has_more=true` 的 artifact 不能支持全局结论。采样只在用户明确要求抽样时使用，并必须说明抽样范围和方法。

## 2. 范围、View、选择与投影

先明确分析总体，再导出数据：

- **整表范围：** 省略 `--view-id`；`query_context.record_scope` 应为 `all_records` 或 `filtered_records`。
- **View 范围：** 传真实 `--view-id`。View 的 filter 决定记录范围，sort 决定顺序，`query_context.record_scope` 应为 `view_filtered_records`；结论必须表述为“该 View 内”。
- **临时条件：** `--filter-json` 覆盖 View filter，`--sort-json` 覆盖 View sort；排序示例：`--sort-json '[{"field":"Updated","desc":true},{"field":"Title","desc":false}]'`，数组顺序是排序优先级，`desc=true` 为降序。两者只覆盖对应部分，不能把“指定 View”与“手工替换后的范围”混称为同一口径。tuple 条件的完整示例和协议见 [Filter 条件结构](lark-base-0.md#s-ea7773b079411c53)。
- **关键词与结构化条件：** 展示文本关键词用 `+record-search`；数值、日期、选项、人员、群组、Link、空值等用 `--filter-json`。两者可以叠加。
- **字段投影：** 重复 `--field-id`，只导出筛选、分组、排序、JOIN、解释、回查所需字段。系统 `record_id` 自动保留；跨表任务还必须投影 Link 或经过验证的业务 key。

manifest 的 `query_context` 是本次 artifact 范围的记录，不是完整查询语言的替代品。复用旧 artifact 前同时核对 `base_token`、`table_id`、View / filter / sort、投影字段和 `rev`。

## 3. 大表完整读取

NDJSON 单次最多返回 2000 条。必须取得超过 2000 条逐行原始记录时：

1. 固定 `base_token`、`table_id`、`view-id`、filter、sort 和字段投影；首块从 `offset=0` 开始，每块 `limit=2000`，输出到不同 artifact。
2. 每块读取 manifest 的 `records_count`、`has_more`、`next_offset`、`rev` 和 `query_context`；`has_more=true` 时只使用返回的 `next_offset` 继续。
3. 所有块的 `rev` 与 `query_context` 必须一致。读取期间 `rev` 改变表示数据快照已变化，可能产生遗漏或重复；需要严格完整时从头重读，否则明确披露非快照一致。
4. 以最后一块 `has_more=false` 作为终止条件。分析引擎可逐块消费，不必为了分析先把所有文件拼成一个巨型文件。
5. 多表任务分别完成每张表的完整性检查；任一输入不完整，JOIN、集合、窗口或统计结果都不完整。

如果任务只需要单表基础统计，不应为了拿到所有原始行而分块下载，优先使用下方 `+data-query`。

## 4. `data-query`：大规模单表基础统计逃生路径

`+data-query` 的 datasource 是单个 Base Table，适合在超过 2000 行时由云端完成：

- `filters`：聚合前筛选，类似 WHERE；它使用 LiteQuery 特有的 DSL，不是 Record/View 的 tuple filter，注意不要混淆。
- `dimensions`：分组字段。
- `measures`：`sum`、`avg`、`min`、`max`、`count`、`count_all`、`distinct_count`。
- `sort`：排序字段

SOP 选定这条路径后再读取 [data-query DSL](lark-base-0.md#s-1e1af96f8912b234)。典型适用范围是**单表**总数、分组计数、数值汇总、去重计数、分组排序和 Top-K。

能力边界：

- 只传 dimensions 时返回去重后的维度组合，不返回 `record_id`，不能视为逐条记录。
- 不承担多表 JOIN、窗口函数、递归、原始明细导出或语义分析。
- 没有独立 HAVING 语义；可先由 `data-query` 聚合，再对已收敛的聚合结果做本地条件过滤。
- 条件聚合只有所有 measures 共用同一前置条件时才能直接下推到 `filters`；不同 measures 使用不同条件时，拆成可复核的查询或在完整明细上计算。
- 聚合后需要展示原始记录时，用返回的真实业务 key / 维度值通过 `+record-list --filter-json` 或 `+record-get` 回查；不要从聚合行臆造 `record_id`。

## 5. Manifest 与 NDJSON 结构

`--output ./records.ndjson` 生成记录文件和同名 `.manifest.json`。高频 manifest 字段：

| 字段 | 分析用途 |
| --- | --- |
| `records_count` / `has_more` / `next_offset` | 判断当前块大小、是否完整以及下一块起点 |
| `base_token` / `table_id` / `query_context` | 固定来源表和读取范围 |
| `rev` | 检查多块或复用 artifact 时的数据版本一致性 |
| `timezone` | 解释 Base 本地日历边界 |
| `columns.*.field_id/field_type/physical_type` | 确认 NDJSON 实际列类型与稳定字段标识 |
| `columns.*.stats/example/hint` | 估算空值、数组展开规模和文本体量；只描述本次导出 |
| `record_file_size_bytes` | 决定一次读取还是分块处理 artifact |

NDJSON 每行是一条 Record，以字段 `name` 为 key，并额外包含系统 `record_id`；`field_id` 位于 manifest。字段改名会改变 NDJSON key，跨批次或长期脚本应通过 manifest 复核 `field_id → name`。

| `field_type` | NDJSON 结构 | Base 特有的分析语义 |
| --- | --- | --- |
| `record_id` | `string` | 表内唯一主键，用于定位和块间去重 |
| `text`、`formula`、`lookup`、`auto_number`、`not_support` | `string|null` | Formula / Lookup 不保留原始计算类型；需要数值运算时必须显式验证转换规则 |
| `datetime`、`created_at`、`updated_at` | RFC3339 `string|null` | 带 offset；区分绝对时刻与 Base 本地日历语义 |
| `number` | `number|null` | 空值不是零，是否纳入分母由任务口径决定 |
| `checkbox` | `boolean` | 上游空值在 NDJSON 中规范化为 `false` |
| `select` | `array<string>` | 单选、多选都读取为选项名称数组；空值为 `[]` |
| `location` | `{lng,lat,full_address}|null` | 地理计算用坐标，文本范围分析用地址 |
| `user`、`group_chat`、`created_by`、`updated_by` | `array<{id,name}>` | 连接与去重使用 `id`，展示使用 `name` |
| `link` | `array<{id}>` | `id` 是 Field schema 指定目标表中的 `record_id` |
| `attachment` | `array<{file_token,size,name}>` | 文件 token 是稳定定位信息；数组展开会改变粒度 |

除 `record_id` 外，不假设任何列满足非空或唯一。标量空值通常是 `null`，多值列空值是 `[]`；未显式排序时不依赖 NDJSON 行顺序。

## 6. 专业分析场景中的 Base 映射

下表不教授算法，只指出开始计算前必须解决的 Base 特有问题：

| 场景 | Base 数据结构映射与正确性约束 |
| --- | --- |
| 复杂多表 JOIN | Link 先展开为 `(source_record_id, target_record_id)` 边，再按目标表 `record_id` 连接；目标 `table_id` 来自 Field schema。无 Link 时只能使用已验证唯一性和空值规则的业务 key，必须统计未匹配与重复 key。 |
| 集合运算 | Select 是名称数组，人员/群组按 `id`，Link 按目标 `record_id`；先明确是 record 级包含/交并差，还是 element 级集合，不能把数组字符串化比较。 |
| 多值展开与数据重塑 | Select、人员、群组、Link、附件都是 nested relation。一次展开把粒度从 record 变为 record-element；两个数组同时展开会产生行内笛卡尔积，除非任务明确分析共现，否则分别展开并聚合回目标粒度。 |
| 分组、条件聚合与 HAVING | 先确定 record / element / entity grain 和空值口径。单表基础聚合可走 `data-query`；HAVING 在聚合结果上本地过滤。不同条件的 measures 不要错误共用一个全局 filter。 |
| 排序与 Top-K | 原始记录 Top-K 用 Record sort；大表单表聚合 Top-K 用 `data-query`。并列值是否全部保留、如何稳定打破 ties 必须按任务口径明确。 |
| 窗口计算与严格时序漏斗 | NDJSON 不保证默认顺序；显式选择实体 key、事件时间、分区字段和同时间 tie-breaker。`data-query` 不提供窗口或逐事件漏斗语义。 |
| 时间边界与周期对齐 | 真实时长和跨时区排序按完整 RFC3339 instant；按来源 Base 的日/周/月分组使用值中的本地日期和 manifest `timezone`，不要先转 UTC 后再切日历周期。 |
| 层级与递归 | Link 是有向邻接边；逐跳保持各 Table 的 record-id domain，记录已访问节点以处理环，并明确深度或终止条件。 |
| 派生变量与指定规则的数据质量处理 | 保留原字段和 `record_id`，派生列另命名；只执行用户给定或业务已确认的缺失、异常、去重、标准化规则，不把通用清洗习惯当成业务事实。 |
| 临时语义转换 | LLM 产生的标签、主题或实体映射以 `record_id` 回连并保留判断依据；默认只作为本地临时派生结果，用户未要求时不写回 Base。 |
| 描述性统计、差异分解、关联分析与统计推断 | 先确认总体是整表还是 View、输入是否完整、分析粒度是否因多值展开改变，以及 Formula / Lookup 是否需要类型恢复；把选择偏差、缺失和重复实体视为 Base 数据口径问题，而不是静默用算法默认值处理。 |

跨多个同类事实表时，先投影为一致的长表结构，例如 `(source_table, source_record_id, entity_id, metric...)` 再纵向合并；横向比较时，各表先聚合到相同 entity grain 再 JOIN，避免原始事实间 many-to-many fan-out。

## 7. 交付前检查

最终结果至少说明：

- 数据来自哪些 Base / Table / View，应用了哪些 filter、时间范围和字段投影。
- 每张输入表是否读到 `has_more=false`，或是否由 `data-query` 在云端完成完整单表聚合。
- 分析粒度、空值口径、多值展开方式、JOIN key、重复 key 和未匹配数量。
- 时间采用 instant 还是 Base local-calendar 语义。
- 临时派生、清洗、语义标签或推断使用了哪些用户指定规则；哪些结果没有写回 Base。

只有范围完整且口径与问题一致时，才给出全局结论。


<a id="s-f85fbe39690db5ce"></a>

## references/lark-base-role-config.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Role Permission Schema

> **模块入口**: [Advanced Permission 与 Role](lark-base-0.md#s-4970f49b7b7e8c10) | **相关命令**: `+role-create` · `+role-update` · `+role-get`

本文档是角色权限 JSON（AdvPermBaseRoleConfig）的单一事实来源（SSOT），供 `+role-create` 和 `+role-update` 构造 `--json` 参数时参考。

## 📋 目录

- [顶层结构 (AdvPermBaseRoleConfig)](#顶层结构-advpermbaseroleconfig)
- [角色类型 (RoleType)](#角色类型-roletype)
- [读取与更新角色](#读取与更新角色)
- [Base 级权限 (BaseRuleMap)](#base-级权限-baserulemap)
- [仪表盘权限 (DashboardRule)](#仪表盘权限-dashboardrule)
- [文档权限 (DocxRule)](#文档权限-docxrule)
- [数据表权限 (TableRule)](#数据表权限-tablerule)
    - [表级权限 (TablePerm)](#表级权限-tableperm)
    - [视图权限 (ViewRule)](#视图权限-viewrule)
    - [字段权限 (FieldRule)](#字段权限-fieldrule)
    - [记录权限 (RecordRule)](#记录权限-recordrule)
    - [筛选条件 (FilterRuleGroup)](#筛选条件-filterrulegroup)
- [默认权限策略与风控规则](#默认权限策略与风控规则)
    - [默认关闭项](#默认关闭项)
    - [权限对象选择](#权限对象选择)
    - [记录操作默认策略](#记录操作默认策略)
    - [field_perms 构造 SOP](#field_perms-构造-sop)
    - [视图权限默认策略](#视图权限默认策略)

---

## 顶层结构 (AdvPermBaseRoleConfig)

```json
{
  "role_name": "财务审核员",
  "role_type": "custom_role",
  "base_rule_map": { "copy": false, "download": false },
  "table_rule_map": { "订单表": { "perm": "edit", "...": "..." } },
  "dashboard_rule_map": { "销售看板": { "perm": "read_only" } },
  "docx_rule_map": { "文档A": { "perm": "edit", "allow_download": true } }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|----|------|
| `role_name` | string | 是  | 角色名称，不能为空 |
| `role_type` | string | 是  | 角色类型，见 [RoleType](#角色类型-roletype) |
| `base_rule_map` | map\<string, bool\> | 是  | Base 级权限，见 [BaseRuleMap](#base-级权限-baserulemap) |
| `table_rule_map` | map\<string, TableRule\> | 否  | 数据表权限，key 为表名 |
| `dashboard_rule_map` | map\<string, DashboardRule\> | 否  | 仪表盘权限，key 为仪表盘名称 |
| `docx_rule_map` | map\<string, DocxRule\> | 否  | 文档权限（仅单品模式），key 为文档名称 |

---

## 角色类型 (RoleType)

| 值 | 说明 |
|------|------|
| `editor` | 系统角色：编辑者 |
| `reader` | 系统角色：阅读者 |
| `custom_role` | 自定义角色 |

**注意**:
- 创建接口（`+role-create`）仅支持 `custom_role`
- 更新接口（`+role-update`）支持  `editor` / `reader` / `custom_role`

---

## 读取与更新角色

- `+role-list` 用于定位角色，返回角色摘要；系统角色和自定义角色都可能出现在列表中。
- `+role-get` 返回完整权限配置。更新前先用它确认当前 `role_name`、`role_type` 和已有权限结构。
- `+role-update` 是 delta merge，只提交需要变更的字段；但 `role_name` 和 `role_type` 仍要带当前值，避免误改角色身份信息。
- `+role-delete` 仅适用于自定义角色；系统角色可以在权限上限内调整配置，但不可删除。

---

## Base 级权限 (BaseRuleMap)

1. 默认值均为 `false`，当需要启用时设置为 `true`。
2. 在新增角色和修改角色时需要默认带上这个字段，**严禁**在用户未明确要求的情况下将其设置为 `true`。

```json
{
  "base_rule_map": {
    "copy": true,
    "download": false
  }
}
```

| Key | 说明 |
|-----|------|
| `copy` | 允许复制多维表格内容 |
| `download` | 允许创建副本、下载、打印多维表格 |

---

## 仪表盘权限 (DashboardRule)

```json
{
  "dashboard_rule_map": {
    "销售看板": { "perm": "read_only" },
    "内部数据": { "perm": "no_perm" }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `perm` | string | 仪表盘权限 |

**perm 可选值**:

| 值 | 说明 |
|----|------|
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限 |

---

## 文档权限 (DocxRule)

> ⚠️ 仅在单品模式（`is_base_solo = true`）下可用。

```json
{
  "docx_rule_map": {
    "文档A": { "perm": "edit", "allow_download": true },
    "文档B": { "perm": "read_only" }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `perm` | string | 是 | 文档权限 |
| `allow_download` | bool | 否 | 是否允许下载/导出 |

**perm 可选值**:

| 值 | 说明 |
|----|------|
| `edit` | 可编辑 |
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限 |

---

## 数据表权限 (TableRule)

```json
{
  "table_rule_map": {
    "订单表": {
      "perm": "edit",
      "view_rule": {
        "allow_edit": true,
        "visibility": { "all_visible": true }
      },
      "record_rule": {
        "record_operations": ["add", "delete"],
        "other_record_all_read": true
      },
      "field_rule": {
        "field_perm_mode": "all_edit"
      }
    },
    "用户表": {
      "perm": "read_only",
      "view_rule": {
        "allow_edit": false,
        "visibility": { "all_visible": true }
      },
      "record_rule": {
        "record_operations": [],
        "other_record_all_read": true
      },
      "field_rule": {
        "field_perm_mode": "all_read"
      }
    },
    "内部表": {
      "perm": "no_perm"
    }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `perm` | string | 表级权限，见 [TablePerm](#表级权限-tableperm) |
| `view_rule` | ViewRule | 视图权限配置 |
| `record_rule` | RecordRule | 记录权限配置 |
| `field_rule` | FieldRule | 字段权限配置 |

**`+role-create` 硬约束**:

- 当 `perm` 为 `no_perm` 时，不要设置 `view_rule`、`record_rule`、`field_rule`。
- 当 `perm` 为其他值时，必须同时提供完整的 `view_rule`、`record_rule`、`field_rule`，缺少任意一项都会导致创建失败。
- `+role-update` 是 delta merge，只提交要修改的字段；不要为局部更新补造未变更配置。

---

### 表级权限 (TablePerm)

| 值 | 说明 |
|----|------|
| `manage` | 可管理 |
| `edit` | 可编辑 |
| `read_only` | 仅可阅读 |
| `no_perm` | 无权限（此时不能再设置视图、记录和字段的权限） |

---

### 视图权限 (ViewRule)

```json
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": false,
      "visible_views": ["表格视图", "看板视图"]
    }
  }
}
```

| 字段 | 类型 | 说明                         |
|------|------|----------------------------|
| `allow_edit` | bool | 可新增、删除、修改视图；表权限为 `edit` 时默认为 `true`，表权限为 `read_only` 或用户明确限制时为 `false` |
| `visibility` | object | 可见的视图配置                    |
| `visibility.all_visible` | bool | 是否全部可见                     |
| `visibility.visible_views` | []string | 可见视图名称 列表                  |

**⚠️ 核心规则：`view_rule` 必须同时包含 `allow_edit` 和 `visibility` 两个字段，缺一不可。**

输出 `view_rule` 时，**必须**使用以下完整结构，根据场景选择对应模板：

```json
// 情况 A：表权限为 edit 且用户未明确限制 → allow_edit 默认为 true，全部可见
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": true
    }
  }
}

// 情况 B：表权限为 read_only，或用户明确说不可编辑视图 → 全部可见、不可编辑
{
  "view_rule": {
    "allow_edit": false,
    "visibility": {
      "all_visible": true
    }
  }
}

// 情况 C：用户提及了具体视图 → 仅指定视图可见（allow_edit 仍按 A/B 规则判断）
{
  "view_rule": {
    "allow_edit": true,
    "visibility": {
      "all_visible": false,
      "visible_views": ["表格视图", "看板视图"]
    }
  }
}
```

**注意**:
- 当 `all_visible` 为 `false` 时，`visible_views` 不可为空，必须指定至少一个可见视图
- `biz_type` 为 `query_form_view` 的视图不可放在 `visible_views` 中（不能配置可见性）

---

### 字段权限 (FieldRule)

```json
{
  "field_rule": {
    "field_perm_mode": "specify",
    "field_perms": {
      "金额": "edit",
      "备注": "read",
      "密码": "no_perm"
    },
    "allow_edit_and_modify_option_fields": [],
    "allow_edit_and_download_file_fields": []
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `field_perm_mode` | string | 字段权限模式 |
| `field_perms` | map\<string, string\> | 字段名 → 权限，仅 `field_perm_mode` 为 `specify` 时有效 |
| `allow_edit_and_modify_option_fields` | []string | 允许增删改选项的字段名列表 |
| `allow_edit_and_download_file_fields` | []string | 允许下载附件的字段名列表 |

**field_perm_mode 可选值**:

| 值 | 说明 |
|----|------|
| `all_edit` | 所有字段可编辑，但选项不可增删改 |
| `all_read` | 所有字段可读 |
| `specify` | 指定字段权限（可进一步设置 `field_perms` 和选项增删改权限） |
| `no_perm` | 无权限 |

**field_perms 中单个字段的权限值**:

| 值 | 说明 |
|----|------|
| `edit` | 可编辑（含新增和阅读权限） |
| `create` | 可新增（含阅读权限） |
| `read` | 可阅读 |
| `no_perm` | 无权限 |

**⚠️ field_perms 重要规则**:
1. 写入前必须先查看字段的 `type`
2. `formula` / `lookup` / `auto_number` 类型字段**必须强制**降级为 `read` 或 `no_perm`，**严禁**设为 `edit`
3. 必须输出除 4 个系统字段外的所有字段
4. `allow_edit_and_modify_option_fields`：仅当用户明确要求"允许增删改选项"时才配置，否则必须为空数组 `[]`。仅支持 `select` 类型字段
5. `allow_edit_and_download_file_fields`：用户没有要求时不要设置，且仅 `field_perm_mode` 为 `specify` 时才能设置

---

### 记录权限 (RecordRule)

```json
{
  "record_rule": {
    "record_operations": ["add"],
    "edit_filter_rule_group": {
      "conjunction": "and",
      "filter_rules": [
        {
          "conjunction": "and",
          "filters": [
            {
              "field_name": "部门",
              "operator": "is",
              "filter_values": ["财务部"]
            }
          ]
        }
      ]
    },
    "other_record_all_read": true
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `record_operations` | []string | 记录操作权限，仅 `TablePerm = edit` 时有效 |
| `edit_filter_rule_group` | FilterRuleGroup | 可编辑记录的筛选条件，范围为所有记录时此字段为空 |
| `other_record_all_read` | bool | 是否可阅读所有记录。都可读时为 `true`，其他情况为 `false` |
| `read_filter_rule_group` | FilterRuleGroup | 可阅读记录的额外筛选规则。仅当可阅读范围与可编辑范围不一致时设置（依赖 `other_record_all_read = false`） |

**record_operations 可选值**:

| 值 | 说明 |
|----|------|
| `add` | 可新增记录 |
| `delete` | 可删除记录 |

---

### 筛选条件 (FilterRuleGroup)

```json
{
  "conjunction": "and",
  "filter_rules": [
    {
      "conjunction": "and",
      "filters": [
        {
          "field_name": "部门",
          "operator": "is",
          "filter_values": ["财务部"]
        }
      ]
    }
  ]
}
```

**FilterRuleGroup 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `conjunction` | string | 逻辑连接词：`and` / `or` |
| `filter_rules` | []FilterRule | 筛选规则数组 |

**FilterRule 结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `conjunction` | string | 逻辑连接词，默认 `and` |
| `filters` | []Filter | 筛选条件数组 |

**Filter 结构**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field_name` | string | 是 | 字段名。仅限 `can_filter` 为 `true` 的字段。若服务端要求当前用户类条件，可按 API 返回结构处理 |
| `operator` | string | 是 | 操作符，见下表 |
| `field_type` | string | 否 | 通常由服务端 filterFiller 补全；Agent 判断字段类型时以 `+field-list` / 字段操作接口的 `type` 为准，常见可筛选类型包括 `select`、`user`、`created_by`、`number` 及部分 `formula` / `lookup` |
| `reference_type` | string | 条件 | 引用类型。`field_type` 为公式或引用字段时必须赋值，其他情况不能赋值 |
| `filter_values` | []string | 条件 | 筛选值。`operator` 为 `isEmpty` / `isNotEmpty` 时不设置，字段类型为 `user` 时也无需设置，其他情况必须设置。值为选项的 `name` |
| `field_ui_type` | string | 条件 | 该字段有值时一定要填 |
| `is_invalid` | bool | 否 | 判断筛选条件是否有效 |

**operator 可选值**:

| 值 | 说明 |
|----|------|
| `is` | 等于 |
| `isNot` | 不等于 |
| `contains` | 包含 |
| `doesNotContain` | 不包含 |
| `isEmpty` | 为空 |
| `isNotEmpty` | 不为空 |
| `isGreater` | 大于 |
| `isGreaterEqual` | 大于等于 |
| `isLess` | 小于 |
| `isLessEqual` | 小于等于 |

**注意**:
- `field_type`、`field_ui_type`、`reference_type` 在创建/更新角色时由服务端 filterFiller 自动补全，客户端通常只需传 `field_name`、`operator`、`filter_values`

---

## 默认权限策略与风控规则

构造角色配置 JSON 时，采用 **默认拒绝与权限最小化** 策略。用户未明确提及的权限一律不开放，不因"合理猜测""常见做法"主动扩展权限范围。

### 默认关闭项

以下能力在用户未明确说明时**默认关闭**：

| 能力 | 默认值 | 开启条件 |
|------|--------|----------|
| 未提及的数据表的任何访问 | `no_perm` | 用户明确提及该表 |
| 仪表盘访问 | 不配置 | 用户明确提及该仪表盘 |
| `base_rule_map.copy` | `false` | 用户明确要求"允许复制" |
| `base_rule_map.download` | `false` | 用户明确要求"允许下载/打印/副本" |

### 默认开启项（条件性）

以下能力在特定条件下**默认开启**，用户明确限制时才排除：

| 能力 | 默认值 | 排除条件 |
|------|--------|----------|
| `record_operations` 中的 `delete` | **包含**（`perm = edit` 时） | 用户明确限制时才排除 |
| `view_rule.allow_edit` | **`true`**（`perm = edit` 时） | 用户明确限制"不可编辑视图"或 `perm = read_only` 时设为 `false` |

---

### Editor / Reader 的权限上限规则
1. 对 Editor 与 Reader，系统允许修改其权限配置，但同时施加以下封顶约束：
2. Reader 的任一权限项 不允许超过「仅可阅读」
3. Reader 不允许拥有任何可编辑、可新增、可删除相关权限; Editor 的权限可被修改，但其能力范围受高级权限能力封顶。

### 权限对象选择

**注意**:
- 仅对用户明确指向的权限对象生成配置（明确提及的表名、仪表盘名，或可解析为唯一对象的指代如"当前表""这张表"）
- **严禁**基于业务常识、岗位职责、名称相似性或其他角色的历史配置推断或扩展权限对象
- 用户未明确提及的对象不生成任何权限配置，视为 `no_perm`

---

### 记录操作默认策略

**注意**:
- 用户未提及时，表权限为 `edit` 时默认同时包含 `add` 和 `delete`，默认不包含 `delete` 的情况仅适用于用户明确限制操作的场景
- 阅读范围默认对齐编辑范围：用户仅描述可编辑范围、未说明阅读范围时，可阅读范围与可编辑范围保持一致，不主动扩大
- 当可读范围与可编辑范围一致时，**不得**生成 `read_filter_rule_group`；应设置 `other_record_all_read = false` 且 `read_filter_rule_group = null`

**⚠️ 记录操作限制**:
1. `perm` 为 `read_only` 时，`record_rule.record_operations` **只能为空**
2. 同步表（`is_sync = true`）**严禁**新增和删除记录

---

### field_perms 构造 SOP

在生成 `field_perms` 时，**严禁**依赖模糊的"继承"概念，必须按以下步骤执行：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1. 基准设定 | `perm = edit` → 全部字段预设 `"edit"`；`perm = read_only` → 全部预设 `"read"` | 基于 `base_table_info` 中的全量字段 |
| 2. 物理降级 | `formula` / `lookup` / `auto_number` 及系统字段 → 强制降级为 `"read"` | 不可变字段严禁设为 `edit` |
| 3. 用户覆盖 | 仅对用户**显式指定**了特定权限的字段应用 `no_perm` / `read` / `create` | 未显式指定的保持基准值 |
| 4. 反筛选误判 | 用于 `filter_rules` 的字段，若基准为 `"edit"` 且用户未要求降级 → **保持 `"edit"`** | 筛选条件不影响字段可编辑性 |
| 5. 筛选依赖兜底 | 出现在 `filter_rules` 中的字段**不允许**遗漏，权限至少为 `"read"` | 最终校验步骤 |

**⚠️ field_perm_mode 选择规则**:
1. 用户以"所有字段""全字段"等整体性表述描述且不要求选项增删改时，**必须**使用 `all_edit` / `all_read`，**严禁**变为逐字段 `specify`
2. 仅在以下情况使用 `specify`：用户明确提出字段级差异需求、不同字段权限目标存在显著差异、或明确要求配置选项增删改权限
3. 系统字段硬性约束导致的自动降级**不视为**差异，不触发 `specify`
4. 对"仅""只能""部分"等约束定语，范围外的字段按定语的反方向设置

**⚠️ 同步表限制**: `is_sync = true` 的表**严禁**设置字段为 `edit` 或 `create`

---

### 视图权限默认策略

**判断流程（必须按顺序执行，命中即停）**:

1. **先判断用户是否提及了具体视图名称**（如"看板视图可见""甘特图不可编辑"等）
  - **是** → `all_visible = false`，`visible_views` 仅包含用户明确提及为"可见"的视图名称（非 viewID）；未提及的视图视为不可见
  - **否**（用户完全未提及任何视图）→ `all_visible = true`
2. `allow_edit` 在表权限为 `edit` 时**默认为 `true`**；仅当用户明确限制"不可编辑视图"时才设为 `false`。设为 `true` 时仍**必须**包含 `visibility` 字段（参考视图权限 情况 A）
3. `all_visible` 为 `false` 时，`visible_views` **不可为空**，必须至少包含一个视图

**❌ 常见错误 — 缺少 `visibility` 字段：**
```json
// 错误！缺少 visibility
{ "view_rule": { "allow_edit": false } }
```
**✅ 正确写法：**
```json
// 即使全部可见，也必须显式写出 visibility
{ "view_rule": { "allow_edit": false, "visibility": { "all_visible": true } } }
```

---

### 字段类型与筛选算子的强约束关系

当字段被用于记录筛选条件时，字段操作接口返回的 `type` 与可用算子存在固定绑定关系：

**`user` / `created_by` 类型字段：**
- 仅允许使用 `contains` 算子
- 不允许使用 `is`、`isNot` 等精确匹配算子
- 这是当前成员匹配模式，筛选条件中无需填写具体成员值；不要在 `filter_values` 中写入姓名或用户 ID

**`select` (`multiple=false`) 类型字段：**
- `is` 与 `isNot` 算子仅允许用于匹配**单一选项**，不得用于多个值
- 当用户表达"字段值等于/不等于某一个具体选项"（如"出勤状态不等于出勤"）时，Agent 必须使用 `is` / `isNot`，且 filter_values 仅包含单一值。
- 当用户表达"字段值等于/不等于多个选项集合"（如"学历不是专科和其他"）时，Agent 必须使用 `contains` / `doesNotContain`，并将多个选项填入 filter_values。
- `contains` / `doesNotContain`中的filter_values可包含多个值，表示或关系

**`select` (`multiple=true`) 类型字段：**
- `is` / `isNot`：filter_values 允许填写多个选项
  - 当 operator = is 且勾选 A、B 时，语义为该字段**同时包含** A 和 B（A&B），不是"等于 A 或等于 B"
  - 当用户表达"包含任一选项"时，除了可以使用 contains 实现外，也可以使用 is 并且配套通过 filter_rules.conjunction = or 实现
- `contains` / `doesNotContain`：用于表达"包含任一选项/不包含任一选项"，filter_values 可填写多个选项（系统按"任一匹配"处理）；若要表达"等于 A 或等于 B"，应拆成多条筛选条件并用「或」组合。

**百分比字段**
- 对于 query 中“数字”的筛选条件时，如果涉及到百分比，要原封不动地还原用户给你的数值（百分比都变成小数）。比如“大于 20%”则变成“大于 0.2”、“xx 率小于 60”则变成“小于 0.6”。

### 被用于筛选的字段的 field_perms 权限强制要求

当某字段（系统字段没有此要求）被用于「满足特定条件的记录」中的筛选条件时，系统将根据当前数据表权限与记录权限，自动施加以下**不可变约束**：

**筛选字段的读写一致性：**
- 若表权限为 edit，且字段类型属于【可编辑字段】，则筛选字段必须保持 edit 权限，除非用户显式要求降级。
- 严禁因为字段被用作筛选条件而将其降级为 read。筛选条件仅要求字段可见，不要求字段只读。

**新增记录时的字段最低权限：**
- 当且仅当记录权限包含「可新增记录」时，字段至少为可新增（create），用于保证在新增记录时筛选条件字段可被正确写入。
- 若当前记录权限为「仅可阅读」，则不触发该约束。

**字段是否可编辑（edit）不作强制要求**，由具体权限方案决定，不属于 infra 强制约束范围。

上述由系统自动施加的字段权限，不可被手动取消或降级。


<a id="s-de5cfa38ac334522"></a>

## references/lark-base-template-center.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base 模板中心

模板中心是一个**公开的 Base 模板库**。当用户想“用一个现成的模板快速搭一个多维表格”时，这套命令帮助 AI 找到最合适的模板，最终通过 `+base-copy` 复制成用户自己的新 Base。

模板中心里也可能返回 BaseApp / 应用模板。若模板预览链接 `templates[].link` 包含 `/app/`，它只是可展示的应用模板预览，不支持通过 `+base-copy` 复制创建。用户要求“基于这个应用模板创建 / 复制应用模板”时，应明确拒绝，并说明当前 CLI 只支持复制 Base 模板，不支持复制应用模板。

三个命令：

- `+template-categories`：列出所有模板分类，用于把用户意图对齐到某个类目。
- `+template-list`：列出某个分类下的模板（不传分类则返回“推荐”类目）。
- `+template-search`：按关键词搜索模板。

## 何时使用模板中心

满足以下特征时走模板中心：用户有**创建新 Base 的意图**，但**没有指向已有对象的锚点**（没有 Base URL、没有“我的/最近访问的表”、没有具体已存在的 Base 名）。

典型触发：

- “帮我建一个 CRM 多维表格”
- “有没有适合项目管理的模板”
- “找个 OKR 跟进的 Base 模板照着做”

**不要**走模板中心的情况（即使用户嘴上说“模板”）：

- 用户给了 Base/Wiki 链接或 token → 走 `+url-resolve`。
- 用户说“我之前那张表 / 我的模板 / 最近访问的” → 走 `+title-resolve` 或转 `lark-drive` 搜索。
- 用户要从零定义字段 schema，而不是套现成模板 → 走 `+base-create --table-name --fields`。

模板中心是独立的公开数据集，**不能**用 `drive +search` 找到，`drive +search` 只搜用户自己可访问的云空间对象。

## 推荐命令

```text
# 列出所有模板分类
lark-cli base +template-categories --as user

# 列出某个分类下的模板（不传 --category-key 则返回“推荐”类目）
lark-cli base +template-list --category-key template_center_tab_ai --limit 10 --as user

# 按关键词搜索模板
lark-cli base +template-search --keyword "项目管理" --limit 10 --as user

# 翻页：把上一页返回的 offset 原样传给 --offset
lark-cli base +template-search --keyword "AI" --limit 10 --offset <上一页返回的 offset> --as user

# 选定模板后，用模板 token 复制成用户自己的新 Base
lark-cli base +base-copy --base-token <模板 token> --name "<新 Base 名>" --as user
```

## 工作流

模板中心有两条路径，按用户意图明确程度二选一，不要盲目全用。

### 路径 A：分类浏览（意图偏宽泛时首选）

用户只给了一个大方向（如“项目管理”“市场营销”），先按分类收敛，再在类目里挑模板。

1. `+template-categories` 列出全部分类，拿到 `categories[].key` 和 `name`。
2. AI 把用户意图匹配到最贴近的一个分类 `name`，取它的 `key`。
3. `+template-list --category-key <key>` 列出该类目下的模板。
4. 读每个模板的 `name` / `introduction` / `scenarios`，挑出最符合用户场景的那个，拿它的 `token`。
5. 用 `+base-copy --base-token <token>` 基于模板复制出新 Base（见下文“基于模板创建”）。

```text
# 1. 看有哪些分类
lark-cli base +template-categories --as user

# 2~3. 匹配到“AI 应用”类目后，列出该类目模板
lark-cli base +template-list --category-key template_center_tab_ai --limit 10 --as user
```

匹配不到贴切分类，或用户意图本身就跨类目 / 很具体时，改走路径 B。

### 路径 B：关键词搜索（意图有具体词时首选）

用户给了明确、可检索的词（如“财务报销”“直播复盘”“AI 客服”），直接搜，不必先看分类。

1. `+template-search --keyword "<词>"` 搜模板。
2. 同样读 `name` / `introduction` / `scenarios` 选模板，拿 `token`。
3. `+base-copy` 复制。

```text
lark-cli base +template-search --keyword "项目管理" --limit 10 --as user
```

关键词不能为空；空搜会被拒绝。用户只有“大方向”而没有具体检索词时，用路径 A 的分类浏览更稳。

### 分类 vs 搜索怎么选

| 用户意图 | 走哪条 |
|---|---|
| 只有大类方向（“市场营销类的”“办公用的”） | 路径 A，先 `+template-categories` 收敛 |
| 有具体、可检索的业务词（“报销”“OKR”“直播”） | 路径 B，直接 `+template-search` |
| 大方向下没挑到合适的 | A 之后再用 B 换关键词补搜 |

## 翻页

`+template-list` 和 `+template-search` 都是游标翻页：

- `--limit`：每页数量，默认 10，范围 1-100；`--page-size` 是等价别名。
- `--offset`：翻页游标，来自上一次响应的 `offset` 字段。**首次请求不要传**。
- 响应里 `has_more=true` 表示还有下一页，把响应的 `offset` 原样传给下一次 `--offset`。`has_more=false` 或 `offset` 为空字符串表示没有更多。

`--offset` 是服务端返回的不透明游标，不要解析它、不要自己拼造。

```text
lark-cli base +template-search --keyword "AI" --limit 10 --offset <上一页返回的 offset> --as user
```

## 数据结构

### TemplateCategory（分类对象）

`+template-categories` 返回 `categories[]`，每个元素：

| 字段 | 类型 | 含义 |
|---|---|---|
| `key` | string | 分类唯一标识，形如 `template_center_tab_ai`（`template_center_tab_` 前缀 + 类目名）。传给 `+template-list --category-key` 用的就是它 |
| `name` | string | 分类展示名，如 `AI 应用` / `办公通用`。AI 匹配用户意图时看这个 |

### Template（模板对象）

`+template-list` / `+template-search` 返回 `templates[]`，每个元素：

| 字段 | 类型 | 含义 |
|---|---|---|
| `token` | string | 模板的 Base token，是模板的唯一标识。基于模板创建时作为 `+base-copy --base-token` 的入参 |
| `name` | string | 模板名称，如 `工作汇报` |
| `introduction` | string | 模板介绍，说明模板用途、内容结构和适用方向。AI 判断模板是否契合用户需求主要看它 |
| `scenarios` | string[] | 适用场景列表，如 `["工作汇报","月报","项目进展"]`，用于快速判断场景匹配度 |
| `developer` | string | 模板开发者，如 `飞书` |
| `link` | string | 模板预览链接，可展示给用户，但复制模板用 `token` 而不是 `link` |
| `created_at` / `updated_at` | string | 创建 / 更新时间 |

列表 / 搜索响应还带分页字段：

| 字段 | 类型 | 含义 |
|---|---|---|
| `has_more` | boolean | 是否还有下一页 |
| `offset` | string | 下一页游标；无更多时为空字符串 |

**约定**：模板的唯一标识就叫 `token`（模板 Base token），不要在输出或转述里改名成 `id` 或 `key`；`key` 是分类的标识（`category_key`）。

### 模板列表/模版搜索-响应示例

```json
{
  "code": 0,
  "data": {
    "has_more": true,
    "offset": "1",
    "templates": [
      {
        "created_at": "2025-12-03T02:53:34Z",
        "developer": "Base Team",
        "introduction": "📊 品牌调研问卷  \n高效收集用户反馈，助力品牌优化决策  \n\n核心功能点  \n1 预设多维度调研问题模板  \n2 支持自定义问题类型与逻辑跳转  \n3 实时数据统计与可视化分析  \n\n适合场景  \n1 新品上市前市场需求调研  \n2 品牌形象与用户满意度评估  \n3 竞品对比与消费者偏好分析",
        "link": "https://example.com/base/<template_token>",
        "name": "品牌调研问卷",
        "scenarios": ["运营管理", "市场营销"],
        "token": "<template_token>",
        "updated_at": "2026-06-22T08:18:58Z"
      }
    ]
  },
  "msg": ""
}
```

读取模板列表时重点看：

- `templates[].name`：模板名称；基于模板创建 Base 且用户没有指定新名称时，直接作为 `+base-copy --name`。
- `templates[].token`：模板 Base token；复制时传给 `+base-copy --base-token`。
- `templates[].link`：模板预览链接；可以展示给用户帮助确认，但复制时不要用 link 代替 token。若链接包含 `/app/`，这是应用模板预览，只能展示，不能复制创建。
- `templates[].introduction` / `templates[].scenarios`：用于判断模板是否匹配用户业务场景。
- `data.offset`：下一页游标；只有 `has_more=true` 时才继续传给 `--offset`。

## 基于模板创建 Base

模板中心只负责“找到模板”，它本身不创建 Base。选定模板后，用模板的 `token` 复制出用户自己的新 Base：

```text
lark-cli base +base-copy --base-token <模板 token> --name "<新 Base 名>" --as user
```

- `--name` 用用户想要的新 Base 名；不传则沿用模板名。
- 只有用户明确说“只要结构 / 不要内容”时，才加 `--without-content`。
- `+base-copy` 的返回和权限说明见 SKILL.md 中 `+base-copy` 的相关规则。
- 如果选中的模板 `link` 包含 `/app/`，不要调用 `+base-copy`。这类应用模板当前仅支持展示给用户，不支持复制创建；用户要求基于应用模板创建时应拒绝并说明能力边界。

## 注意事项

- 三个命令都是只读，默认 `--as user`，所需权限 `base:template:read`。
- 模板中心是公开数据集，不能用 `drive +search` 找到；用户要“我的/最近访问/已有 Base”不要走这里。
- 分类先于列表：`+template-list` 的 `--category-key` 必须来自 `+template-categories` 的返回，不要凭空猜类目 key。
- `+template-search` 不支持空关键词，会被拒绝；用户只有大方向、无具体检索词时改走分类浏览。
- 模板的唯一标识是 `token`（模板 Base token），不要改名成 `id` 或 `key`。
- `--offset` 是服务端返回的不透明游标，翻页时原样回传，不要解析或自行构造。
- 模板中心只查模板、不创建 Base；创建一律走 `+base-copy --base-token <token>`，不要用模板 token 去调 `+base-get` 之类的当前用户 Base 命令。
- 应用模板链接包含 `/app/`，仅用于预览展示，不支持 `+base-copy`；不要承诺可基于应用模板创建。


<a id="s-a147b2f981b2f942"></a>

## references/lark-base-view-set-filter.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# base +view-set-filter

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

更新视图筛选配置。

## 1. filter 结构

`--json` 就是一个 filter 条件对象，结构见公共协议 SSOT [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53)，即 `{logic?, conditions?}`。此处 `conditions` 中的 `field` 引用**数据表字段名或字段 id**。

- 支持 `filter` 的视图类型：`grid`、`kanban`、`gallery`、`calendar`、`gantt`。

## 2. 推荐命令

```text
lark-cli base +view-set-filter \
  --base-token <base_token> \
  --table-id <table_id> \
  --view-id <view_id> \
  --json '{"logic":"and","conditions":[["状态","intersects",["Doing"]],["负责人","intersects",[{"id":"ou_xxx"}]],["截止时间","empty"]]}'
```

## 3. JSON 写法

```json
{
  "logic": "and",
  "conditions": [
    ["状态", "intersects", ["Doing"]],
    ["负责人", "intersects", [{ "id": "ou_xxx" }]],
    ["截止时间", "empty"]
  ]
}
```

清空写法：

```json
{
  "conditions": []
}
```

完整的 operator 列表与各字段类型的 value 写法（`text` / `number` / `select` / `user` / `datetime` / `formula` / `lookup` 等），见 [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53)。

## 4. 使用建议

- 先读取当前筛选配置，理解现有 `logic` 和 `conditions` 的组合关系；只替换用户要求变更的条件，未提到的条件默认保留。
- 优先传字段 id，不要依赖字段名。
- 拿不准字段 type 或真实取值时，先用 `+field-list` / `+record-list` 确认，再按对应字段类型的 value 写法构造条件；别按字段名猜 type、凭印象猜枚举取值。
- 需要清空全部筛选时，直接传 `{"conditions":[]}`。

## 5. 易错点

- 本 tuple DSL 由 `+view-set-filter` 与 `+record-list` / `+record-search` 的 `--filter-json` 共用；不要写成 `+data-query` 的对象风格 `{"field_name":...,"operator":...}`（会报校验失败）。
- 标量类字段（`text` / `number` / `datetime` 等）的 value 用标量、别包成数组（各类型详见 value 写法一节）。
- `user` / `group_chat` / `link` 不要写成单个标量。
- `empty` / `non_empty` 不要硬塞无意义的 value。
- 日期条件稳定写法用 `ExactDate(...)` 或 `Today` / `Yesterday` / `Tomorrow`。
- `formula` / `lookup` 的 value 形状不固定；拿不准时先读当前 filter 或字段定义，或根据错误提示修正类型。

## 6. 参考

- [lark-base-filter-condition.md](lark-base-0.md#s-ea7773b079411c53)：filter/visible_rule 条件结构公共协议 SSOT
- [Lookup Field](lark-base-0.md#s-c44aa7298dcfa089)


<a id="s-acbbbbc678c14729"></a>

## references/lark-base-view.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# View：类型选择与生命周期

所有 View 编辑前必读本参考，包括创建、改名、配置修改和删除。

View 是同一 Table 的展示与组织方式，共享底层记录；创建视图不会复制记录。只创建满足当前需求的视图，不默认把五种类型全部建一遍。一次性查询用 Record 命令；需要用户长期浏览、处理或共享时创建 View。

## 选择视图

**Grid 是最常用的默认视图，方便查看、录入和修改数据。没有明确的特殊展示需求时使用 Grid，不因数据包含状态、日期或附件字段就自动创建其他类型。只有用户明确需要分栏处理、时间跨度比较、日历定位或卡片浏览时，才分别选择 Kanban、Gantt、Calendar 或 Gallery。**

| 类型 | 展示方式与优势 | 何时选用 | 优先配置 |
|---|---|---|---|
| `grid` 表格 | 每行一条记录、每列一个字段，采用熟悉的表格形式，方便查看、录入和修改数据；可通过筛选、分组、排序调整展示。 | 最常用的默认视图；日常读写数据，没有特殊展示需求时优先使用。 | 可见字段及顺序；按需筛选、分组、排序。 |
| `kanban` 看板 | 按分组字段横向排列列，每列展示该组的记录卡片；排序控制组内记录顺序。 | 需要按状态、阶段或类别分栏处理事项；优先选用有清晰选项的单选/多选字段作为分组依据。 | 分组字段、卡片可见字段、组内排序；有附件时可选封面。多选分组不可直接当作互斥分区统计。 |
| `gantt` 甘特图 | 左侧为表格明细，右侧为同一批记录的时间条；可直观看到起止时间、持续时间及排期重叠。左侧支持可见字段、筛选、分组和排序。 | 每条记录代表具有时间跨度的任务、项目或其他实体，重点是比较排期。 | `timebar` 绑定开始、结束和标题字段；左侧通常只留 1–3 个关键字段，为时间轴留空间。 |
| `calendar` 日历 | 将记录按时间字段定位到日历日期格，以事项形式展示；方便回答“某天有哪些事”。 | 发布计划、活动、预约、任务日期等，重点是按日/周/月浏览。 | `timebar` 绑定开始、结束和标题字段；配置展示字段和筛选。不要套用表格的通用分组、排序。 |
| `gallery` 画册 | 记录直接以卡片排列，不按状态分栏；重点内容可配附件封面。 | 产品、素材、案例、人员等需要逐卡浏览的集合；不要求每条记录有图片。 | 卡片展示字段、可选封面、筛选与排序。 |

选择捷径：**日常读写数据、无特殊展示需求 → grid；按状态/类别处理 → kanban；比较时间跨度 → gantt；按日期找事项 → calendar；浏览卡片内容 → gallery。** Gantt 和 Calendar 都能展示时间相关实体，区别是前者强调跨度与重叠，后者强调日期位置。

## Few-shot：按目的创建与配置

以下是相互独立的选型示例，不是一套必须全执行的步骤。`BASE_TOKEN`、`TABLE_ID` 使用已解析的真实资源坐标；字段名示例假定目标表已有相应字段，配置前用 `+field-list` 核实类型与名称。`--view-id` 接受真实 ID 或名称；示例使用新建视图的唯一名称，名称不唯一时使用实际返回 ID。

### 表格查看与维护：grid

需求：“按项目分组查看任务，优先显示最早截止的任务。”

```text
# 默认视图；支持筛选、字段显隐、分组、排序；不支持时间条和卡片封面。
# 创建 JSON 支持对象/数组，type 默认 grid；不要塞入 group_by/property，form 走 Form 命令。
lark-cli base +view-create --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --json '{"name":"任务明细","type":"grid"}' --as user
# visible_fields 是完整有序列表；遗漏即隐藏，不删除数据，主字段可能固定在首位。
lark-cli base +view-set-visible-fields --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务明细" --json '{"visible_fields":["任务名称","项目","状态","截止时间"]}' --as user
# group_config 最多 3 项，字段须适用于目标视图；空数组清除分组。
lark-cli base +view-set-group --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务明细" --json '{"group_config":[{"field":"项目","desc":false}]}' --as user
# sort_config 最多 10 项；空数组清除排序。配置 JSON 用对象包装，不传裸数组。
lark-cli base +view-set-sort --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务明细" --json '{"sort_config":[{"field":"截止时间","desc":false}]}' --as user
```

### 按状态处理任务：kanban

需求：“待办、进行中、已完成各一列，每列按截止时间排列。”前置：状态字段是包含相应选项的单选字段。

```text
# 支持筛选、字段显隐、分组、排序、卡片封面；不支持时间条。
# 优先按一个单选/多选字段分栏；group 的 desc 排列分组，sort 排列组内记录。
lark-cli base +view-create --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --json '{"name":"任务看板","type":"kanban"}' --as user
lark-cli base +view-set-group --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务看板" --json '{"group_config":[{"field":"状态","desc":false}]}' --as user
lark-cli base +view-set-visible-fields --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务看板" --json '{"visible_fields":["任务名称","负责人","截止时间"]}' --as user
lark-cli base +view-set-sort --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务看板" --json '{"sort_config":[{"field":"截止时间","desc":false}]}' --as user
```

### 比较任务排期：gantt

需求：“查看任务开始到结束的排期，左侧只保留任务和负责人。”

```text
# 支持筛选、字段显隐、分组、排序、时间条；不支持卡片封面。
# timebar 必填开始、结束、标题；起止字段须为日期/时间且记录有值，按业务排期选择。
lark-cli base +view-create --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --json '{"name":"任务排期","type":"gantt"}' --as user
lark-cli base +view-set-timebar --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务排期" --json '{"start_time":"开始时间","end_time":"结束时间","title":"任务名称"}' --as user
# 左侧通常保留 1–3 个关键字段，为时间轴留空间。
lark-cli base +view-set-visible-fields --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "任务排期" --json '{"visible_fields":["任务名称","负责人"]}' --as user
```

### 按日期浏览活动：calendar

需求：“在日历上查看每项活动的安排。”

```text
# 支持筛选、字段显隐、时间条；不支持通用分组、排序和卡片封面。
# timebar 必填开始、结束、标题；起止字段须为日期/时间且记录有值。
lark-cli base +view-create --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --json '{"name":"活动日历","type":"calendar"}' --as user
lark-cli base +view-set-timebar --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "活动日历" --json '{"start_time":"活动开始","end_time":"活动结束","title":"活动名称"}' --as user
```

### 浏览产品卡片：gallery

需求：“以图片卡片浏览产品，展示名称、分类和价格。”前置：产品图片是附件字段。

```text
# 支持筛选、字段显隐、排序、卡片封面；不支持分组和时间条。
# cover_field 使用附件字段；传 null 清除封面。
lark-cli base +view-create --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --json '{"name":"产品画册","type":"gallery"}' --as user
lark-cli base +view-set-card --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "产品画册" --json '{"cover_field":"产品图片"}' --as user
lark-cli base +view-set-visible-fields --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "产品画册" --json '{"visible_fields":["产品名称","分类","价格"]}' --as user
```

### 通用生命周期：发现、筛选、改名、清理

```text
# 五种视图均支持查询、改名、删除；已有目标视图时直接配置它。
# 修改已有配置先读对应 get（如 +view-get-group）；需要验收时再读回。
# 批量创建逐项执行，可能部分成功；异常或同名冲突后先 list 确认，避免盲重试。
lark-cli base +view-list --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --as user
lark-cli base +view-get --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "$VIEW_ID" --as user

# 只展示进行中的记录；复杂条件见下方筛选参考
lark-cli base +view-set-filter --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "$VIEW_ID" --json '{"logic":"and","conditions":[["状态","intersects",["进行中"]]]}' --as user

# 改名用 --name；创建用 --json 中的 name
lark-cli base +view-rename --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "$VIEW_ID" --name "进行中任务" --as user

# 用户明确要求且目标已确认时删除视图；不删除底层记录。
lark-cli base +view-delete --base-token "$BASE_TOKEN" --table-id "$TABLE_ID" --view-id "$VIEW_ID" --as user --yes
```

筛选详细写法见 [View filter](lark-base-0.md#s-a147b2f981b2f942)；该文档继续路由公共条件协议。


<a id="s-aafd418669728581"></a>

## references/lark-base-workflow-schema.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Workflow steps JSON SSOT

本文档是 Workflow `steps` JSON 的单一事实来源（SSOT），定义完整数据结构，适用于：
- **查询场景**：理解 `+workflow-get` 返回的 `steps` 结构
- **创建/修改场景**：构造 `+workflow-create` / `+workflow-update` 的 `--json` body
> 💡 **本文档是纯字段参考**。如需**创建/修改**工作流的完整示例，请阅读 [Workflow](lark-base-0.md#s-c1c547e4561de954)。
---
## 📖 快速导航

根据你的需求跳转到对应章节：

| 需求 | 章节 |
|------|------|
| 了解 Step 基础结构 | [WorkflowStep 基础结构](#workflowstep-基础结构) |
| 查询 Trigger 类型及 data 字段 | [Trigger data](#trigger-data-详细结构) |
| 查询 Action 类型及 data 字段 | [Action data](#action-data-详细结构) |
| 查询 Branch/Loop 结构 | [Branch data](#branch-data-详细结构) / [System data](#system-data-详细结构) |
| 查询 ValueInfo/Condition 等公共类型 | [公共类型](#公共类型) |

---

## WorkflowStep 基础结构

每个步骤（Trigger / Action / Branch / System）共享以下字段：

```json
{
  "id": "step_xxx",
  "type": "AddRecordTrigger",
  "title": "监控新订单",
  "next": "step_yyy",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 步骤唯一 ID（用户自定义，被 `next` 和 `children.links[].to` 引用） |
| `type` | string | 是 | 步骤类型，见下方枚举 |
| `title` | string | 否 | 步骤标题 |
| `children` | StepChildren | 否 | 子关系边，承担所有分支/循环 |
| `next` | string | null | 否 | 线性后继节点 ID；`null` 表示流程结束 |
| `data` | object | 是 | 步骤详细配置，按 `type` 区分，见后续各节 |

> **总原则**：连线写 `children`，扩展标识写 `meta`，输入参数写 `data`。

---

## StepChildren 与 ChildLink

### StepChildren

```json
{
  "links": [ /* ChildLink[] */ ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `links` | ChildLink[] | 子关系边列表；无子关系时为空数组 `[]` |

### ChildLink

每条关系边描述从当前节点到目标节点的有向连线：

```json
{ "kind": "if_true", "to": "step_4", "label": "branch_1", "desc": "金额大于1000" }
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `kind` | string | 是 | 关系类型：`if_true` / `if_false` / `case` / `loop_start` / `slot` |
| `to` | string | 是 | 目标节点 ID |
| `label` | string | 否 | 可选标签（如 `branch_1`、`tool`、`llm`、`memory`） |
| `desc` | string | 否 | 可选语义说明（如"销售部门"、"积极情绪"） |

`kind` 使用场景：

| kind | 使用节点 | 说明 |
|------|---------|------|
| `if_true` | IfElseBranch | 条件为真时跳转 |
| `if_false` | IfElseBranch | 条件为假时跳转 |
| `case` | SwitchBranch / AIClassificationBranch | 多路分支，`label` 建议用 `branch_1` 等中性标签，`desc` 写语义 |
| `loop_start` | Loop | 循环体入口 |
| `slot` | AIAgentAction | 挂载 LLM / 工具 / 记忆子节点，`label` 为 `llm` / `tool` / `memory` |

---

## StepType 枚举

### Trigger 类型

| type | 说明 |
|------|------|
| `AddRecordTrigger` | 新增记录时触发 |
| `SetRecordTrigger` | 记录被修改时触发 |
| `ChangeRecordTrigger` | 记录满足条件时触发 |
| `TimerTrigger` | 定时触发 |
| `ReminderTrigger` | 日期提醒触发 |
| `ButtonTrigger` | 按钮点击触发 |
| `LarkMessageTrigger` | 接收飞书消息触发 |

> 所有 Trigger 节点**请勿设置** `children` ，通过 `next` 串联后继。

### 触发器选型指南

| 需求描述 | 触发器 |
|---------|--------|
| 新增记录时 | `AddRecordTrigger` |
| 指定字段发生修改时（仅修改，可限定修改后的值） | `SetRecordTrigger` |
| 新增或修改记录，且满足配置的筛选条件时 | `ChangeRecordTrigger` |

> ⚠️ `SetRecordTrigger` 仅监听修改，`ChangeRecordTrigger` 同时监听新增 + 修改。

### Action 类型

| type | 说明 |
|------|------|
| `AddRecordAction` | 新增记录 |
| `SetRecordAction` | 更新记录 |
| `FindRecordAction` | 查找记录 |
| `HTTPClientAction` | HTTP 请求 |
| `Delay` | 延迟 |
| `LarkMessageAction` | 发送飞书消息 |
| `GenerateAiTextAction` | AI 生成文本 |
| `AIAnalysisAction` | AI 分析 |

> 所有 Action 节点**请勿设置** `children` ，通过 `next` 串联后继。

### Branch 类型

| type | 说明 |
|------|------|
| `IfElseBranch` | 条件分支，`children.links` 含 `if_true` 和 `if_false` |
| `SwitchBranch` | 多路分支，`children.links` 含多个 `case` |
| `AIClassificationBranch` | AI 分类分支，`children.links` 含多个 `case` |

### System 类型

| type | 说明 |
|------|------|
| `Loop` | 循环，`children.links` 含 `loop_start` 指向循环体入口 |

---

## Trigger data 详细结构


### AddRecordTrigger

```json
{
  "table_name": "订单表",
  "watched_field_name": "状态",
  "trigger_control_list": ["pasteUpdate", "automationBatchUpdate"],
  "condition_list": [] /* AndCondition 数组 */
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `table_name` | 是 | 监控的数据表名 |
| `watched_field_name` | 是 | 监控的字段名 |
| `trigger_control_list` | 否 | 触发控制，可选值：`pasteUpdate` / `automationBatchUpdate` / `syncUpdate` / `appendImport` / `openAPIBatchUpdate` |
| `condition_list` | 否 | 数组中的每个元素表示一个条件组，条件组之间为 OR，组内 conditions 之间必须为 AND |

### ChangeRecordTrigger

```json
{
  "table_name": "任务表",
  "trigger_control_list": [],
  "condition_list": [
    {
      "conjunction": "and",
      "conditions": [
        {
          "field_name": "预计工时",
          "operator": "isGreater",
          "value": [{ "value_type": "number", "value": 0 }]
        }
      ]
    }
  ]
}
```

| 字段 | 必填 | 说明                                                                              |
|------|------|---------------------------------------------------------------------------------|
| `table_name` | 是 | 监控的数据表名                                                                         |
| `trigger_control_list` | 否 | 触发控制，可选值：`pasteUpdate` / `automationBatchUpdate` / `syncUpdate` / `appendImport` |
| `condition_list` | 是 | 不能为空；数组中的每个元素表示一个条件组，条件组之间为 OR，组内 conditions 之间必须为 AND                          |

### SetRecordTrigger

```json
{
  "table_name": "订单表",
  "record_watch_conjunction": "and",
  "record_watch_info": [ /* FieldCondition[] */ ],
  "field_watch_info": [
    { "field_name": "状态", "operator": "is", "value": [{ "value_type": "text", "value": "已发货" }] }
  ],
  "trigger_control_list": [],
  "condition_list": null
}
```

| 字段 | 必填 | 说明 |
|------|----|------|
| `table_name` | 是  | 监控的数据表名 |
| `record_watch_conjunction` | 否  | 记录筛选组合方式：`and` / `or`，默认 `and` |
| `record_watch_info` | 否  | 记录级过滤条件（修改前值匹配），为空则监听全部 |
| `field_watch_info` | 是  | 字段级监控条件列表，至少一个 |
| `trigger_control_list` | 否  | 触发控制，可选值：`pasteUpdate` / `automationBatchUpdate` / `syncUpdate` / `appendImport` |
| `condition_list` | 否  | 数组中的每个元素表示一个条件组，条件组之间为 OR，组内 conditions 之间必须为 AND |

`FieldWatchItem`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `field_name` | string | 监听字段名称 |
| `operator` | string | 操作符（仅明确要求字段满足条件时填） |
| `value` | ValueInfo[] | 触发值 |

### TimerTrigger

```json
{
  "rule": "WEEKLY",
  "start_time": "2025-01-01 09:00",
  "sub_unit": [1, 3, 5],
  "is_never_end": true
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `rule` | 是 | `NO_REPEAT` / `DAILY` / `WEEKLY` / `MONTHLY` / `YEARLY` / `WORKDAY` / `CUSTOM` |
| `start_time` | 否 | 开始时间，格式 `yyyy-MM-dd HH:mm` |
| `interval` | 否 | 自定义间隔 [1,30]（仅 CUSTOM） |
| `unit` | 否 | 自定义单位：`SECOND` / `MINUTE` / `HOUR` / `DAY` / `WEEK` / `MONTH` / `YEAR` |
| `sub_unit` | 否 | 子单位（`WEEKLY` 时为星期几数组 0-6，`MONTHLY` 时为几号数组 1-31） |
| `end_time` | 否 | 结束时间 |
| `is_never_end` | 否 | 是否永不结束 |

### ReminderTrigger

```json
{
  "table_name": "项目表",
  "field_name": "截止日期",
  "offset": -1,
  "unit": "DAY",
  "hour": 9,
  "minute": 0,
  "condition_list": null
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `table_name` | 是 | 数据表名 |
| `field_name` | 是 | 日期字段名（必须为 `datetime` / `created_at` / `formula` / `lookup` 类型） |
| `unit` | 是 | 偏移单位：`MINUTE` / `HOUR` / `DAY` / `WEEK` / `MONTH` |
| `offset` | 是 | 提前/延后的偏移量（触发时间 = 日期字段时间 + `offset` × `unit`，因此负数=提前、正数=延后；范围由 `unit` 决定）：`MINUTE` ∈ {0, 5, 15, 30, -5, -15, -30}；`HOUR` ∈ [-6, -1] ∪ [1, 6]；`DAY` ∈ [-7, 7]；`WEEK` ∈ [-7, -1] ∪ [1, 7]；`MONTH` ∈ [-7, -1] ∪ [1, 7] |
| `hour` | 是 | 触发小时 (0-23)，默认 9 |
| `minute` | 是 | 触发分钟 (0-59)，默认 0 |
| `condition_list` | 否 | 数组中的每个元素表示一个条件组，条件组之间为 OR，组内 conditions 之间必须为 AND  | 


### ButtonTrigger

```json
{
  "button_type": "buttonField",
  "table_name": "审批表"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `button_type` | 是 | 按钮类型：`buttonField`（表格里的按钮，可操作当前记录数据）/ `buttonElement`（仪表盘、应用页面上的按钮，可执行整体操作） |
| `table_name` | 否 | 绑定的数据表名，仅 `button_type=buttonField` 时填写 |

> `buttonField` 和 `buttonElement` 的输出能力不同，详见下方「ButtonTrigger（按钮触发器）」输出说明。


### LarkMessageTrigger

```json
{
  "receive_scene": "group",
  "receiver": [{ "value_type": "group", "value": {"id": "oc_xxxx", "name": "测试群"} }],
  "scope": "all",
  "filter": {
    "conjunction": "and",
    "content_contains": ["关键词"],
    "sender_contains": [{ "value_type": "user", "value": {"id": "ou_xxxx", "name": ""} }],
    "is_new_message": true,
    "is_message_contain_attachment": false
  }
}
```

| 字段 | 必填 | 说明|
|------|------|---|
| `receive_scene` | 是 | 接收场景：`group`（群聊）/ `chat`（单聊）|
| `receiver` | 是 | 触发来源，支持 `user` / `group` / `ref`。在单聊场景下，该字段指“可以和机器人单聊的用户”；在群聊场景下，该字段指“接收信息的群组”|
| `scope` | 是 | 触发范围：`at`（@提及）/ `all`（所有消息）。该参数仅在群聊场景有效，单聊场景请勿指定该参数|
| `filter` | 是 | MessageFilter 消息过滤条件|

`MessageFilter`：

| 字段 | 类型 | 说明 |
|------|------|----|
| `conjunction` | string | `and` 满足所有条件 / `or` 任一条件|
| `content_contains` | string[] | 关键词列表|
| `sender_contains` | ValueInfo[] | 筛选发送人（仅群聊+群组来源时生效，单聊场景请勿指定该参数）|
| `is_new_message` | boolean | 仅新话题消息（仅群聊时有效，单聊场景请勿指定该参数）|
| `is_message_contain_attachment` | boolean | 是否仅附件消息触发|

## Action data 详细结构

### AddRecordAction

```json
{
  "table_name": "订单表",
  "field_values": [
    { "field_name": "客户名称", "value": [{ "value_type": "text", "value": "张三" }] },
    { "field_name": "金额", "value": [{ "value_type": "number", "value": 100 }] },
    { "field_name": "创建人", "value": [{ "value_type": "ref", "value": "$.trigger_1.fieldIdxxx" }] }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `table_name` | 是 | 目标数据表名 |
| `field_values` | 是 | RecordFieldValue[] |

### SetRecordAction

```json
{
  "table_name": "订单表",
  "max_set_record_num": 10,
  "field_values": [
    { "field_name": "状态", "value": [{ "value_type": "option", "value": { "id": "opt1", "name": "已完成" } }] }
  ],
  "filter_info": { /* RecordFilterInfo */ },
  "ref_info": { "step_id": "step_trigger" }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `table_name` | 是 | 目标数据表名 |
| `max_set_record_num` | 否 | 最大更新记录数，默认 100，范围 1-15000 |
| `field_values` | 是 | RecordFieldValue[] |
| `filter_info` | 否* | RecordFilterInfo 过滤条件（与 `ref_info` 互斥） |
| `ref_info` | 否* | RefInfo 引用前置步骤的记录（与 `filter_info` 互斥） |

### FindRecordAction

```json
{
  "table_name": "客户表",
  "field_names": ["客户名称", "联系方式", "等级"],
  "should_proceed_when_no_results": true,
  "filter_info": { /* RecordFilterInfo */ }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `table_name` | 是 | 目标数据表名 |
| `field_names` | 是 | 要检索的字段名列表，至少一个 |
| `should_proceed_when_no_results` | 否 | 无结果时是否继续后续步骤，默认 `true` |
| `filter_info` | 否* | RecordFilterInfo（与 `ref_info` 互斥） |
| `ref_info` | 否* | RefInfo（与 `filter_info` 互斥） |

### HTTPClientAction

```json
{
  "method": "POST",
  "url": [{ "value_type": "text", "value": "https://api.example.com/webhook" }],
  "queries": [
    { "key": "source", "value": [{ "value_type": "text", "value": "workflow" }] }
  ],
  "headers": [
    { "key": "Content-Type", "value": [{ "value_type": "text", "value": "application/json" }] }
  ],
  "body_type": "raw",
  "raw_body": [
    { "value_type": "text", "value": "{\"record_id\":\"" },
    { "value_type": "ref", "value": "$.step_1.recordId" },
    { "value_type": "text", "value": "\"}" }
  ],
  "response_type": "json",
  "response_value": "{\"success\":true,\"message\":\"data fetched successfully\"}"
}
```

| 字段 | 必填 | 说明 |
|------|-----|------|
| `method` | 否 | 请求方法：`GET` / `POST` / `PUT` / `PATCH` / `DELETE`，默认 `POST` |
| `url` | 是 | ValueInfo[]，请求 URL，支持 `text` / `ref` 拼接 |
| `queries` | 否 | KeyValue[]，查询参数 |
| `headers` | 否 | KeyValue[]，请求头 |
| `body_type` | 否 | 请求体类型：`none` / `raw` / `form-data` / `form-urlencoded`，默认 `raw` |
| `raw_body` | 否 | ValueInfo[]，原始请求体，仅 `body_type=raw` 时使用 |
| `form_body` | 否 | KeyValue[]，表单数据，仅 `body_type=form-data` 或 `body_type=form-urlencoded` 时使用 |
| `response_type` | 否 | 响应类型：`none` / `text` / `json`，默认 `json` |
| `response_value` | 否 | string，JSON 字符串形式的响应结果示例；仅当 `response_type=json` 时必填 |

`KeyValue`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 参数名 / 请求头名 |
| `value` | ValueInfo[] | 参数值 / 请求头值，支持 `text` / `ref` |

### Delay

```json
{ "duration": 30 }
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `duration` | 是 | 延迟时长（分钟），范围 [1, 120] |

### LarkMessageAction

```json
{
  "receiver": [{ "value_type": "user", "value": {"id": "ou_xxxx"} }],
  "send_to_everyone": false,
  "title": [{ "value_type": "text", "value": "新订单通知" }],
  "content": [
    { "value_type": "text", "value": "客户 " },
    { "value_type": "ref", "value": "$.trigger_1.fldCustomerName" },
    { "value_type": "text", "value": " 创建了新订单" }
  ],
  "btn_list": [
    { "text": "查看详情", "btn_action": "openLink", "link": [{ "value_type": "text", "value": "https://example.com" }] }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `receiver` | 是 | ValueInfo[] |
| `send_to_everyone` | 是 | 是否发送给所有人 |
| `title` | 否 | TextRefItem[] 消息标题 |
| `content` | 是 | TextRefItem[] 消息内容 |
| `btn_list` | 是 | 按钮列表，不需要时为空数组 |

`ButtonConfig`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | 按钮文字 |
| `btn_action` | string | `addRecord` / `setRecord` / `openLink` |
| `link` | ValueInfo[] | 跳转链接（`openLink` 时使用） |
| `table_name` | string | 操作表名（`addRecord` 时使用） |
| `record_values` | RecordFieldValue[] | 记录赋值（`addRecord` / `setRecord` 时使用） |

### GenerateAiTextAction

```json
{
  "prompt": [
    { "value_type": "text", "value": "请总结以下内容：" },
    { "value_type": "ref", "value": "$.step_1.fieldxxx" }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `prompt` | 是 | TextRefItem[] 提示词，支持 `text` / `ref` |

### AIAnalysisAction

```json
{
  "analysis_task": [
    { "value_type": "text", "value": "分析昨日订单趋势、异常原因，并给出行动建议" }
  ],
  "analysis_table_names": ["订单表", "退款表"],
  "identity_type": "maker",
  "output_instruction": "先给结论，再列证据与行动建议"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `analysis_task` | 是 | TextRefItem[] 分析任务，支持 `text` / `ref` 混排；至少包含一项有效内容 |
| `analysis_table_names` | 否 | string[] 分析数据范围；为空数组 `[]` 或省略时表示当前 Base 的全部数据表 |
| `identity_type` | 是 | 数据访问身份：`maker`（固定流程身份） / `triggerPersonal`（流程触发者） |
| `output_instruction` | 否 | 仅支持纯文本 |


## Branch data 详细结构

### IfElseBranch

`children.links` 包含 `if_true` 和 `if_false` 两条边，`next` 指向两个分支汇合后的后继节点。

**如果涉及到复杂的多分支场景(分支数目 >= 3时)，你应该采用 SwitchBranch，而不是嵌套的 IfElseBranch**

```json
{
  "condition": {
    "conjunction": "or",
    "conditions": [
      {
        "conjunction": "and",
        "conditions": [
          {
            "left_value": { "value_type": "ref", "value": "$.step_1.fieldxxx" },
            "operator": "isGreater",
            "right_value": [{ "value_type": "number", "value": 1000 }]
          }
        ]
      }
    ]
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `condition` | 是 | OrGroup 判断条件，结构为 `(A and B) or (C and D)` |

### SwitchBranch

`children.links` 包含多个 `case` 边（`label` 建议用 `branch_1`、`branch_2`，语义写在 `desc`）。

```json
{
  "mode": "exclusive",
  "no_match_action": "classifyToOther",
  "child_branch_list": [
    {
      "name": "高优先级",
      "condition": {
        "conjunction": "or",
        "conditions": [
          {
            "conjunction": "and",
            "conditions": [
              {
                "left_value": { "value_type": "ref", "value": "$.step_1.fieldxxx" },
                "operator": "is",
                "right_value": [{ "value_type": "text", "value": "P0" }]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `mode` | 否 | 分支模式。`exclusive`：排他模式，仅执行一个满足条件的子分支；`parallel`：并行模式，执行所有满足条件的子分支。默认 `exclusive` |
| `no_match_action` | 否 | `mode=exclusive` 时使用，无匹配时的处理策略。`classifyToOther`：归类到其他分支；`fail`：报错终止。默认 `classifyToOther` |
| `fail_mode` | 否 | `mode=parallel` 时使用，部分分支出错时策略。`partialSuccess`：部分成功即继续；`fail`：任一失败即终止。默认 `partialSuccess` |
| `match_mode` | 否 | `mode=parallel` 时使用，所有分支不满足时策略。`noneMatchSkip`：跳过继续；`noneMatchFail`：报错终止。默认 `noneMatchSkip` |
| `child_branch_list` | 是 | BranchItem[]，1-10 个条件分支 |

`BranchItem`：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 分支名称 |
| `condition` | OrGroup | 分支条件 |

### AIClassificationBranch

`AIClassificationBranch` 用 AI 对 `content` 内容做分类，再通过 `children.links` 中的 `case` 边进入命中的后续步骤。`steps[].data` 使用公开 Agent Data 协议。

```json
{
  "classes": [
    {
      "name": "Bug",
      "desc": "功能报错、异常、不可用或结果错误"
    },
    {
      "name": "功能建议",
      "desc": "希望新增能力或优化现有功能"
    }
  ],
  "content": [
    { "value_type": "text", "value": "请根据反馈内容判断类型：" },
    { "value_type": "ref", "value": "$.step_trigger.fldFeedback" }
  ],
  "classification_rule": "信息不足时判定为无法匹配。"
}
```

| 字段 | 必填 | 说明                                                                   |
|------|------|----------------------------------------------------------------------|
| `classes` | 是 | 分类列表，至少 2 项。每项包含 `name` 和 `desc`                                     |
| `classes[].name` | 是 | 分类名称，需与对应普通 `children.links[].desc` 保持一致                             |
| `classes[].desc` | 是 | 分类描述，可为空字符串，但字段必须存在                                                  |
| `content` | 是 | TextRefItem[]，用于分类的内容，支持 `text` / `ref`                              |
| `classification_rule` | 否 | 全局分类规则纯文本                                                            |
| `no_match_action` | 否 | 无匹配策略。`classifyToOther`：进入默认分支；`fail`：当前节点失败。省略时使用 `classifyToOther` |

`children.links` 规则：
- 每个分类命中后要跳到哪个后续步骤，必须写在 children.links 中。
- 普通分类边使用 `kind: "case"` 和 `label: "branch_1"`、`branch_2` 等稳定标签；`desc` 与 `classes[i].name` 保持一致；`to` 指向该分类的入口 step。
- `no_match_action: "classifyToOther"` 时必须额外提供一条默认分支边：`{ "kind": "case", "label": "default", "desc": "默认分支", "to": "step_other_action" }`。
- `no_match_action: "fail"` 时不要提供默认分支边。


## System data 详细结构

### Loop

`children.links` 包含 `loop_start` 边指向循环体入口，`next` 指向循环结束后的后继节点。

```json
{
  "loop_mode": "continue",
  "max_loop_times": 100,
  "data": [{ "value_type": "ref", "value": "$.find_record_stepIdxxx.fieldRecords" }]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `data` | 是 | ValueInfo[]（仅支持 `ref` 类型），循环数据源，只能填一个 |
| `loop_mode` | 否 | 单次错误时是否继续：`end`（终止）/ `continue`（继续） |
| `max_loop_times` | 否 | 最大循环次数 |

---


## 公共类型

### ValueInfo

所有值的基础类型，通过 `value_type` 区分：

| value_type | value 类型 | 说明 | 示例 |
|------------|-----------|------|------|
| `text` | string | 文本 | `"张三"` |
| `number` | number | 数字 | `100` |
| `boolean` | boolean | 布尔值 | `true` |
| `date` | string | 日期，可以是具体时间字符串，或者相对时间值 | `"2025/01/01"`、`"2025/01/01 11:00"`、`"now"`、`"now 11:00"`、`"today"`、`"today 11:00"`、`"yesterday"`、`"yesterday 11:00"`、`"lastWeek"`、`"currentMonth"`、`"lastMonth"`、`"theLastWeek"`、`"theNextWeek"`、`"theLastMonth"`、`"theNextMonth"` |
| `option` | `{ id, name }` | 选项 | `{ "id": "opt1", "name": "已完成" }` |
| `link` | `{ text, link }` | 链接（含文字和 URL）， 文字和 URL 的格式可以是 ValueInfo 中的 text/ref 类型 | `{ "text": [{ "value_type": "text", "value": "查看详情" }], "link": [{ "value_type": "text", "value": "https://example.com" }] }`、`{ "text": [{ "value_type": "text", "value": "查看详情" }], "link": [{ "value_type": "ref", "value": "$.step_1.fldXXX" }] }` |
| `user` | `{ id, name }` | 用户 OpenID、名字 | `{ "id": "ou_xxxx", "name": "张三" }` |
| `group` | `{ id, name }` | 群 Chat ID、名字 | `{ "id": "oc_xxx", "name": "测试群" }` |
| `ref` | `string` | 引用前置节点输出的路径 | 参考 ref 引用变量详解 章节 |

> ⚠️ **所有涉及用户的 value 中的 id 统一使用 OpenID（`ou_xxxx` 格式）**，由 CLI 层来完成转换
> ⚠️ **所有涉及群的 value 中的 id 统一使用 ChatID（`oc_xxxx` 格式）**，由 CLI 层来完成转换

### ref 引用变量详解

`ref` 类型是工作流中节点间数据传递的核心机制。当 `value_type` 为 `ref` 时，`value` 指向前置节点的某个输出变量。本节详细描述每个节点可供引用的输出变量定义。

#### 引用路径格式

```
$.{stepId}
$.{stepId}.{pathId}
$.{stepId}.{pathId}.{childPathId}
$.{stepId}.{pathId}.{childPathId}.{grandChildPathId}
```

- `{stepId}`：前置节点的 `id`（即 WorkflowStep 中的 `id` 字段）
- `{pathId}`：节点输出的路径标识符
- 支持多层下钻，如引用字段的属性：`$.step_1.fldXXX.name`

---

#### 触发器节点输出

##### 记录触发器（AddRecordTrigger / ChangeRecordTrigger / SetRecordTrigger / ReminderTrigger）

这 4 个触发器的输出结构完全一致：

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `{fieldId}` | 字段id，从配置表的所有字段或者指定字段id生成，可下钻字段属性 | `$.{stepId}.{fieldId}` |
| `{fieldId}.fieldId` | 字段id属性 | `$.{stepId}.{fieldId}.fieldId` |
| `{fieldId}.fieldName` | 字段名属性 | `$.{stepId}.{fieldId}.fieldName` |
| `startTime` | 触发时间戳 | `$.{stepId}.startTime` |
| `recordId` | 记录 ID | `$.{stepId}.recordId` |
| `recordLink` | 记录链接 | `$.{stepId}.recordLink` |
| `recordCreatedUser` | 记录创建者 | `$.{stepId}.recordCreatedUser` |
| `recordCreatedTime` | 记录创建时间 | `$.{stepId}.recordCreatedTime` |
| `recordModifiedUser` | 最后修改者 | `$.{stepId}.recordModifiedUser` |
| `recordModifiedTime` | 最后修改时间 | `$.{stepId}.recordModifiedTime` |

**动态字段输出规则**：

- 读取触发器所配置的数据表的所有字段
- 每个字段生成一条输出：`pathId` = fieldId
- 若字段为关联字段，children 为关联表所有字段（单层下钻，不再递归）
- 每个字段可下钻特定的字段属性（见「字段属性下钻」）

**recordLink 的 children**：如果配置了数据表，则为该表所有视图的列表，每个视图 `{ pathId: viewId, pathName: viewName, pathType: 'string' }`。引用示例：`$.{stepId}.recordLink.{viewId}`。

##### ButtonTrigger（按钮触发器）

`ButtonTrigger` 的输出取决于 `button_type`：

#### `button_type = buttonField`

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `{fieldId}` | 字段id，从配置表的所有字段或者指定字段id生成，可下钻字段属性 | `$.{stepId}.{fieldId}` |
| `{fieldId}.fieldId` | 字段id属性 | `$.{stepId}.{fieldId}.fieldId` |
| `{fieldId}.fieldName` | 字段名属性 | `$.{stepId}.{fieldId}.fieldName` |
| `recordId` | 记录 ID | `$.{stepId}.recordId` |
| `recordLink` | 记录链接 | `$.{stepId}.recordLink` |
| `recordCreatedUser` | 记录创建者 | `$.{stepId}.recordCreatedUser` |
| `recordModifiedUser` | 最后修改者 | `$.{stepId}.recordModifiedUser` |
| `recordModifiedTime` | 最后修改时间 | `$.{stepId}.recordModifiedTime` |
| `time` | 触发时间 | `$.{stepId}.time` |
| `user` | 触发人 | `$.{stepId}.user` |
| `buttonName` | 触发的按钮名称 | `$.{stepId}.buttonName` |

#### `button_type = buttonElement`

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `time` | 触发时间 | `$.{stepId}.time` |
| `user` | 触发人 | `$.{stepId}.user` |
| `buttonName` | 触发的按钮名称 | `$.{stepId}.buttonName` |

##### TimerTrigger（定时触发器）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `scheduleTime` | 定时触发时间 | `$.{stepId}.scheduleTime` |

##### LarkMessageTrigger（飞书消息触发器）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `Sender` | 消息发送者 | `$.{stepId}.Sender` |
| `AtUser` | 消息中被@的用户 | `$.{stepId}.AtUser` |
| `SenderGroup` | 消息所在群（仅群聊场景） | `$.{stepId}.SenderGroup` |
| `MessageSendTime` | 消息发送时间 | `$.{stepId}.MessageSendTime` |
| `MessageContent` | 消息正文 | `$.{stepId}.MessageContent` |
| `MessageType` | 消息类型标识 | `$.{stepId}.MessageType` |
| `MessageID` | 消息唯一标识 | `$.{stepId}.MessageID` |
| `MessageLink` | 消息链接（仅群聊场景） | `$.{stepId}.MessageLink` |
| `ParentID` | 回复的消息 ID | `$.{stepId}.ParentID` |
| `ThreadID` | 所在话题消息 ID | `$.{stepId}.ThreadID` |
| `Attachments` | 消息中的附件 | `$.{stepId}.Attachments` |

条件限制：

- 若场景为单聊（`receive_scene = "Chat"`），则 `SenderGroup` 和 `MessageLink` 不可用

---

#### 操作节点输出

##### FindRecordAction（查找记录）

| pathId | 说明 | 引用示例|
|--------|------|-------|
| `fieldRecords` | 所有找到的记录的引用（可用于 Loop 遍历） | `$.{stepId}.fieldRecords`|
| `firstfieldsRecord` | 第一条匹配记录 | `$.{stepId}.firstfieldsRecord`|
| `firstfieldsRecord.{fieldId}` | 首条记录的字段值，可下钻字段属性 | `$.{stepId}.firstfieldsRecord.{fieldId}`|
| `firstfieldsRecord.recordId` | 记录 ID 数组 | `$.{stepId}.firstfieldsRecord.recordId`|
| `fields` | 查找到的所有记录某列值 | 不支持引用|
| `fields.{fieldId}` | 用户选择的字段 | `$.{stepId}.fields.{fieldId}`|
| `fields.{fieldId}.fieldId` | 用户选择的字段id数组 | `$.{stepId}.fields.{fieldId}.fieldId`|
| `fields.{fieldId}.fieldName` | 用户选择的字段名数组 | `$.{stepId}.fields.{fieldId}.fieldName`|
| `fields.recordId` | 记录 ID 数组 | `$.{stepId}.fields.recordId`|
| `recordNum` | 找到记录总数 | `$.{stepId}.recordNum`|

##### AddRecordAction（新增记录）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `{fieldId}` | 用户配置的字段值，可下钻字段属性 | `$.{stepId}.{fieldId}` |
| `{fieldId}.fieldId` | 用户配置的字段id | `$.{stepId}.{fieldId}.fieldId` |
| `{fieldId}.fieldName` | 用户配置的字段名 | `$.{stepId}.{fieldId}.fieldName` |
| `recordId` | 新增的记录 ID | `$.{stepId}.recordId` |
| `recordLink` | 新增的记录 URL | `$.{stepId}.recordLink` |

##### SetRecordAction（更新记录）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `{fieldId}` | 用户配置的字段值，可下钻字段属性 | `$.{stepId}.{fieldId}` |
| `{fieldId}.fieldId` | 用户配置的字段id | `$.{stepId}.{fieldId}.fieldId` |
| `{fieldId}.fieldName` | 用户配置的字段名 | `$.{stepId}.{fieldId}.fieldName` |
| `recordId` | 记录 ID 数组（因可能更新多条记录） | `$.{stepId}.recordId` |

##### HTTPClientAction（HTTP 请求）

HTTPClientAction 的输出取决于 `response_type`：

| response_type | 是否可引用 | 输出说明 | 引用示例 |
|--------------|-----------|----------|----------|
| `none` | 否 | 无任何可引用输出 | 不支持引用 |
| `text` | 是 | 整个响应文本作为节点整体输出 | `$.{stepId}` |
| `json` | 是 | 响应体整体挂在 `body` 下，同时返回 `status_code`；仅可引用 `response_value` 中声明的字段 | `$.{stepId}.body`、`$.{stepId}.body.success`、`$.{stepId}.body.message`、`$.{stepId}.status_code` |

**补充说明**：

- 当 `response_type = none` 时，后续节点无法引用 HTTPClientAction 的任何输出
- 当 `response_type = text` 时，`$.{stepId}` 表示整个响应文本
- 当 `response_type = json` 时，`$.{stepId}.body` 表示整个 JSON body，`$.{stepId}.body.字段名` 表示 body 中某个字段
- 仅当 `response_type = json` 时，`$.{stepId}.status_code` 表示请求该 HTTP URL 后返回的 HTTP 状态码
- 仅当 `response_type = json` 时，`response_value` 必填
- 当 `response_type = json` 时，后续节点只能引用 `response_value` 中声明过的字段

**案例**：

假设某个 `HTTPClientAction` 的配置如下：

```json
{
  "id": "step_http_1",
  "type": "HTTPClientAction",
  "data": {
    "response_type": "json",
    "response_value": "{\"success\":true,\"message\":\"ok\"}"
  }
}
```

则后续节点仅可以引用：

- `$.step_http_1.body`
- `$.step_http_1.body.success`
- `$.step_http_1.body.message`
- `$.step_http_1.status_code`

但**不能**引用未在 `response_value` 中声明的字段，例如：

- `$.step_http_1.body.data`
- `$.step_http_1.body.request_id`

##### GenerateAiTextAction（AI 生成文本）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| （整体出参） | AI 生成的文本内容（不支持下钻，只能引用 `$.{stepId}`） | `$.{stepId}` |

##### AIAnalysisAction（AI 分析）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `analysisResult` | AI 分析结果字符串 | `$.{stepId}.analysisResult` |

##### 无输出的操作节点

以下节点不产生任何可引用的输出数据：

- **Delay**（延时等待）
- **LarkMessageAction**（发送飞书消息）

---

#### 分支节点输出

以下分支节点均不产生任何可引用的输出数据：

- **IfElseBranch**（条件分支）
- **SwitchBranch**（多条件分支）

---

#### 系统节点输出

##### Loop（循环）

| pathId | 说明 | 引用示例 |
|--------|------|----------|
| `item` | 当前循环元素 | `$.{stepId}.item` |
| `index` | 从 0 开始的循环索引 | `$.{stepId}.index` |

**`item` 的类型推断规则**（由循环数据源决定）：

**场景一：遍历组合记录** — 数据源为 `record` 类型时（如 FindRecordAction 的 `fieldRecords`），`item` 类型为 `record`，可向下选择具体字段：

| 说明 | 引用示例 |
|------|----------|
| 当前遍历的记录（record） | `$.{loopStepId}.item` |
| 记录的具体字段 | `$.{loopStepId}.item.{fieldId}` |
| 从 0 开始的索引（number） | `$.{loopStepId}.index` |

**场景二：遍历字段** — 数据源为某个多值类型字段时，比如附件字段、人员字段，`item` 继承该字段的类型并可继续下钻字段属性：

| 说明 | 引用示例 |
|------|----------|
| 当前遍历的元素（类型继承数据源字段类型，例如人员字段） | `$.{loopStepId}.item` |
| 用户姓名 | `$.{loopStepId}.item.name` |
| 从 0 开始的索引（number） | `$.{loopStepId}.index` |

---

#### 字段属性下钻

每个字段变量都可以进一步下钻选择字段的属性。所有字段至少支持 `fieldId` 和 `fieldName` 两个基础属性，部分字段还支持额外属性：

| 字段类型 | 属性名称 | 属性 pathId | 属性 pathType | 说明 |
|----------|---------|-------------|--------------|------|
| **所有字段（基础）** | 字段 ID | `fieldId` | `string` | 字段的唯一标识 |
| | 字段名称 | `fieldName` | `string` | 字段的显示名称 |
| **人员字段**（`user` / `created_by` / `updated_by`） | 姓名 | `name` | `string` | 用户姓名 |
| **日期字段**（`datetime` / `created_at` / `updated_at`） | 时间戳 | `timestamp` | `number` | 时间戳数值 |
| **附件字段**（`attachment`） | 文件名 | `fileName` | `string` | 附件文件名 |
| | 文件类型 | `fileType` | `string` | MIME 类型 |
| | 文件大小 | `size` | `number` | 文件字节数 |
| | 文件 Token | `fileToken` | `string` | 附件 token |
| **超链接文本字段**（`text` 且 `style.type=url`） | 文本 | `text` | `string` | 链接文本部分 |
| | 链接 | `link` | `string` | 链接 URL 部分 |
| **自动编号字段**（`auto_number`） | 序号 | `sequence` | `number` | 编号的纯数字序号 |
| **关联字段**（`link`） | 字段下钻 | `{fieldId}` | - | 可下钻到关联表的字段 |

> 其他字段类型（如 `text`、`number`、`checkbox`、`select`、`location`、`formula`、`lookup` 等）仅支持 `fieldId` 和 `fieldName` 两个基础属性。

下钻引用示例：

```
$.{stepId}.{fieldId} → 字段值本身
$.{stepId}.{fieldId}.fieldId → 字段 ID（string）
$.{stepId}.{fieldId}.fieldName    → 字段名称（string）
$.{stepId}.{fieldId}.name → 人员姓名列表（array<string>，仅人员字段）
$.{stepId}.{fieldId}.unionId → 人员 unionId 列表（array<string>，仅人员字段）
$.{stepId}.{fieldId}.timestamp    → 时间戳（array<number>，仅日期字段）
$.{stepId}.{fieldId}.fileName     → 文件名列表（array<string>，仅附件字段）
$.{stepId}.{fieldId}.fileToken    → 文件 Token 列表（array<string>，仅附件字段）
```

---

#### 节点输出能力总览

| 节点 | 类型 | 有输出 | 输出特性 |
|------|------|--------|---------|
| AddRecordTrigger | 触发器 | ✅ | 动态（表字段 + 记录属性） |
| ChangeRecordTrigger | 触发器 | ✅ | 动态（表字段 + 记录属性） |
| SetRecordTrigger | 触发器 | ✅ | 动态（表字段 + 记录属性） |
| ReminderTrigger | 触发器 | ✅ | 动态（表字段 + 记录属性） |
| ButtonTrigger | 触发器 | ✅ | 动态（表字段 + 记录属性；buttonElement 仅基础触发属性） |
| TimerTrigger | 触发器 | ✅ | 静态（仅 scheduleTime） |
| LarkMessageTrigger | 触发器 | ✅ | 静态（消息属性列表） |
| FindRecordAction | 动作 | ✅ | 动态（用户选择的字段） |
| AddRecordAction | 动作 | ✅ | 动态（用户配置的字段） |
| SetRecordAction | 动作 | ✅ | 动态（用户配置的字段） |
| HTTPClientAction | 动作 | ✅ | 动态（取决于用户配置的 HTTP 响应输出） |
| GenerateAiTextAction | 动作 | ✅ | 静态（单 string） |
| AIAnalysisAction | 动作 | ✅ | 静态（`analysisResult`） |
| Delay | 动作 | ❌ | 无输出 |
| LarkMessageAction | 动作 | ❌ | 无输出 |
| IfElseBranch | 分支 | ❌ | 无输出 |
| SwitchBranch | 分支 | ❌ | 无输出 |
| Loop | 系统 | ✅ | 动态（取决于数据源） |

---

### TextRefItem

文本与引用混排，用于消息内容等动态拼接场景：

```json
[
  { "value_type": "text", "value": "客户 " },
  { "value_type": "ref", "value": "$.step_1.fieldxxx" },
  { "value_type": "text", "value": " 创建了新订单" }
]
```

### RecordFieldValue

```json
{ "field_name": "客户名称", "value": [{ "value_type": "text", "value": "张三" }] }
```

### AndCondition（Trigger 过滤条件）

```json
{
  "conjunction": "and",
  "conditions": [
    { "field_name": "状态", "operator": "is", "value": [{ "value_type": "text", "value": "进行中" }] }
  ]
}
```

### OrGroup（Branch 分支条件）

```json
{
  "conjunction": "or",
  "conditions": [
    {
      "conjunction": "and",
      "conditions": [
        {
          "left_value": { "value_type": "ref", "value": "$.step_1.fieldxxx" },
          "operator": "isGreater",
          "right_value": [{ "value_type": "number", "value": 1000 }]
        }
      ]
    }
  ]
}
```

**operator 可选值：** `is` / `isNot` / `containsAny` / `doesNotContainAny` / /`containsAll`/ `isEmpty` / `isNotEmpty` / `isGreater` / `isGreaterEqual` / `isLess` / `isLessEqual`

### RecordFilterInfo
** 由于 conjunction 只支持 and，若需要实现 字段X 等于 A 或 B，你可以使用 containsAny
```json
{
  "conjunction": "and",
  "conditions": [
    { "field_name": "状态", "operator": "is", "value": [{ "value_type": "text", "value": "进行中" }] }
  ]
}
```

### `select` 字段多值匹配

| 操作 | operator | 正确写法 |
|------|---------|---------|
| 等于单个值 | `is` | `[{"value_type": "option", "value": {"name": "L2"}}]` |
| 匹配多个值（L2 或 L3） | `containsAny` | `[{"value_type": "option", "value": {"name": "L2"}}, {"value_type": "option", "value": {"name": "L3"}}]` |

> ⚠️ 不要用多个 `is` 条件（会被当作 OR，无法实现 AND）。推荐使用 `containsAny` 操作符匹配多个值。

> ⚠️ **Select 字段条件**：`value_type` 必须为 `option`，`value` 对象可只传 `name`（如 `{"name": "L2"}`），无需提供选项 ID。

### RefInfo

```json
{ "step_id": "step_trigger" }
```

---

## 完整示例：条件分支 + 发送消息

```json
{
  "title": "新订单自动通知",
  "steps": [
    {
      "id": "step_1",
      "type": "AddRecordTrigger",
      "title": "当「订单表」新增记录时触发",
      "next": "step_2",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单编号"
      }
    },
    {
      "id": "step_2",
      "type": "IfElseBranch",
      "title": "判断订单金额是否大于 1000",
      "children": {
        "links": [
          { "kind": "if_true", "to": "step_3" },
          { "kind": "if_false", "to": "step_4" }
        ]
      },
      "next": "step_5",
      "data": {
        "condition": {
          "conjunction": "or",
          "conditions": [{
            "conjunction": "and",
            "conditions": [{
              "left_value": { "value_type": "ref", "value": "$.step_1.fieldxxx" },
              "operator": "isGreater",
              "right_value": [{ "value_type": "number", "value": 1000 }]
            }]
          }]
        }
      }
    },
    {
      "id": "step_3",
      "type": "LarkMessageAction",
      "title": "通知主管审批大额订单",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_1.fieldxxx" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "大额订单提醒" }],
        "content": [
          { "value_type": "text", "value": "新订单金额为：" },
          { "value_type": "ref", "value": "$.step_1.fieldxxx" },
          { "value_type": "text", "value": "元，请及时审批。" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_4",
      "type": "SetRecordAction",
      "title": "自动标记小额订单为已通过",
      "next": null,
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_1" },
        "field_values": [
          { "field_name": "审批状态", "value": [{ "value_type": "text", "value": "已通过" }] }
        ]
      }
    },
    {
      "id": "step_5",
      "type": "GenerateAiTextAction",
      "title": "AI 生成订单处理日报",
      "next": null,
      "data": {
        "prompt": [
          { "value_type": "text", "value": "请根据以下订单信息生成一份简要的处理日报：" },
          { "value_type": "ref", "value": "$.step_1.fieldxxx" }
        ]
      }
    }
  ]
}
```

---

## 参考

- [Workflow](lark-base-0.md#s-c1c547e4561de954) — 完整示例和构造技巧
- 创建/更新时外层只承载 workflow 元信息，核心校验对象是 `steps`；列表只用于拿 workflow ID 和启停状态


<a id="s-c1c547e4561de954"></a>

## references/lark-base-workflow.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Base Workflow

本文档是 Workflow 的入口指南，帮助选择步骤组合、理解创建/更新边界，并引导到 steps JSON SSOT。

> **配套文档**:
> - Workflow 的数据结构参考：[lark-base-workflow-schema.md](lark-base-0.md#s-aafd418669728581)
> - 创建/更新时重点构造 `title`、`status` 和 `steps`；复杂度集中在 `steps[].type/data/next`

---

## 快速开始

### 最简单的 Workflow

新增记录时发送消息通知：

```json
{
  "client_token": "1704067200",
  "title": "新订单自动通知",
  "steps": [
    {
      "id": "trigger_1",
      "type": "AddRecordTrigger",
      "title": "监控新订单",
      "next": "action_1",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单号"
      }
    },
    {
      "id": "action_1",
      "type": "LarkMessageAction",
      "title": "发送通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_xxxx", "name": "张三"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单提醒" }],
        "content": [
          { "value_type": "text", "value": "收到新订单" }
        ],
        "btn_list": []
      }
    }
  ]
}
```

---

## 场景速查表

| 场景 | 步骤组合 | 示例 |
|------|---------|------|
| 新增触发+通知 | AddRecordTrigger → LarkMessageAction | [下方](#示例1-新增记录触发--发送消息) |
| 按钮点击+调用外部接口+写入日志 | ButtonTrigger → HTTPClientAction → AddRecordAction | [下方](#示例-6-按钮触发--调用外部接口--写入同步日志) |
| 定时+循环 | TimerTrigger → FindRecordAction → Loop → LarkMessageAction | [下方](#示例2-定时触发--查找记录--循环遍历--发送消息) |
| 条件判断 | ... → IfElseBranch → 分支处理 | [下方](#示例3-条件分支ifelsebranch) |
| 多路分类 | ... → SwitchBranch → 多分支处理 | [下方](#示例4-多路分支switchbranch) |
| 复杂组合 | 定时+查找+循环+分支+消息 | [下方](#示例5-组合场景定时查找循环分支消息) |
| AI 分类 | ... → AIClassificationBranch → 分类后处理 | [下方](#示例7-ai-分类用户反馈自动分流) |

---

## 完整示例

### 示例 1: 新增记录触发 + 发送消息

**场景**: 当订单表新增记录时，发送飞书消息通知负责人。

```json
{
  "client_token": "1704067201",
  "title": "新订单自动通知",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_notify",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单号",
        "condition_list": null
      }
    },
    {
      "id": "step_notify",
      "type": "LarkMessageAction",
      "title": "发送订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_trigger.fldManager" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单提醒" }],
        "content": [
          { "value_type": "text", "value": "客户 " },
          { "value_type": "ref", "value": "$.step_trigger.fldCustomer" },
          { "value_type": "text", "value": " 创建了新订单，金额：¥" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" }
        ],
        "btn_list": [
          {
            "text": "查看订单",
            "btn_action": "openLink",
            "link": [{ "value_type": "ref", "value": "$.step_trigger.recordLink" }]
          }
        ]
      }
    }
  ]
}
```

**关键点**:
- `AddRecordTrigger` 监控 `table_name` 表的 `watched_field_name` 字段
- 使用 `ref` 引用触发器输出的字段值（注意是 fieldId，不是字段名）
- `recordLink` 是触发器内置输出，表示记录链接

---

### 示例 2: 定时触发 + 查找记录 + 循环遍历 + 发送消息

**场景**: 每天早上 9 点，查找所有待处理订单，给每个客户发送提醒。

```json
{
  "client_token": "1704067202",
  "title": "每日待处理订单提醒",
  "steps": [
    {
      "id": "step_timer",
      "type": "TimerTrigger",
      "title": "每天早上9点触发",
      "next": "step_find_orders",
      "data": {
        "rule": "DAILY",
        "start_time": "2025-01-01 09:00",
        "is_never_end": true
      }
    },
    {
      "id": "step_find_orders",
      "type": "FindRecordAction",
      "title": "查找所有待处理订单",
      "next": "step_loop_customers",
      "data": {
        "table_name": "订单表",
        "field_names": ["客户名称", "订单金额", "客户联系方式"],
        "should_proceed_when_no_results": false,
        "filter_info": {
          "conjunction": "and",
          "conditions": [
            {
              "field_name": "状态",
              "operator": "is",
              "value": [{ "value_type": "option", "value": { "name": "待处理" } }]
            }
          ]
        }
      }
    },
    {
      "id": "step_loop_customers",
      "type": "Loop",
      "title": "遍历每个订单",
      "children": {
        "links": [
          { "kind": "loop_start", "to": "step_send_reminder" }
        ]
      },
      "next": null,
      "data": {
        "loop_mode": "continue",
        "max_loop_times": 100,
        "data": [{
          "value_type": "ref",
          "value": "$.step_find_orders.fieldRecords"
        }]
      }
    },
    {
      "id": "step_send_reminder",
      "type": "LarkMessageAction",
      "title": "发送催办消息",
      "next": null,
      "data": {
        "receiver": [{
          "value_type": "ref",
          "value": "$.step_loop_customers.item.fldContact"
        }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "订单处理提醒" }],
        "content": [
          { "value_type": "text", "value": "您好，您的订单 " },
          { "value_type": "ref", "value": "$.step_loop_customers.item.fldName" },
          { "value_type": "text", "value": " 金额 ¥" },
          { "value_type": "ref", "value": "$.step_loop_customers.item.fldAmount" },
          { "value_type": "text", "value": " 正在处理中。" }
        ],
        "btn_list": []
      }
    }
  ]
}
```

**关键点**:
- `Loop.data` 必须传入 `ref` 类型的数据源（通常是 FindRecordAction 的 `fieldRecords`）
- `Loop.children.links` 必须包含 `kind: "loop_start"` 的链接指向循环体
- 循环体内用 `$.{loopStepId}.item.{fieldId}` 引用当前遍历记录的字段
- `$.{loopStepId}.index` 获取当前索引（从 0 开始）

---

### 示例 3: 条件分支（IfElseBranch）

**场景**: 根据订单金额判断，大额订单通知主管审批，小额订单自动通过。

```json
{
  "client_token": "1704067203",
  "title": "订单金额自动判断",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_check_amount",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "订单金额"
      }
    },
    {
      "id": "step_check_amount",
      "type": "IfElseBranch",
      "title": "判断是否为大额订单",
      "children": {
        "links": [
          { "kind": "if_true", "to": "step_notify_manager", "label": "high", "desc": "金额>=10000" },
          { "kind": "if_false", "to": "step_auto_approve", "label": "normal", "desc": "金额<10000" }
        ]
      },
      "next": "step_log",
      "data": {
        "condition": {
          "conjunction": "or",
          "conditions": [
            {
              "conjunction": "and",
              "conditions": [
                {
                  "left_value": { "value_type": "ref", "value": "$.step_trigger.fldAmount" },
                  "operator": "isGreaterEqual",
                  "right_value": [{ "value_type": "number", "value": 10000 }]
                }
              ]
            }
          ]
        }
      }
    },
    {
      "id": "step_notify_manager",
      "type": "LarkMessageAction",
      "title": "通知主管审批大额订单",
      "next": "step_log",
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_manager", "name": "主管"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "大额订单待审批" }],
        "content": [
          { "value_type": "text", "value": "有大额订单 ¥" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" },
          { "value_type": "text", "value": " 需要您审批" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_auto_approve",
      "type": "SetRecordAction",
      "title": "自动标记小额订单为已审核",
      "next": "step_log",
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          {
            "field_name": "审批状态",
            "value": [{ "value_type": "option", "value": { "name": "已自动审核" } }]
          }
        ]
      }
    },
    {
      "id": "step_log",
      "type": "GenerateAiTextAction",
      "title": "生成订单处理日志",
      "next": null,
      "data": {
        "prompt": [
          { "value_type": "text", "value": "请生成订单处理日志，金额：" },
          { "value_type": "ref", "value": "$.step_trigger.fldAmount" }
        ]
      }
    }
  ]
}
```

**关键点**:
- `IfElseBranch.children.links` 必须包含 `if_true` 和 `if_false` 两个分支
- `next` 指向两个分支汇合后的步骤（可选，为 null 则分支结束）
- `condition` 使用 OrGroup 结构，支持 `(A and B) or (C and D)` 的复杂条件
- 分支内可以用 `ref_info` 引用触发记录，用 `filter_info` 批量筛选记录

---

### 示例 4: 多路分支（SwitchBranch）

**场景**: 根据订单优先级（P0/P1/P2）执行不同的处理流程。

```json
{
  "client_token": "1704067204",
  "title": "按优先级分类处理订单",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增订单时触发",
      "next": "step_classify",
      "data": {
        "table_name": "订单表",
        "watched_field_name": "优先级"
      }
    },
    {
      "id": "step_classify",
      "type": "SwitchBranch",
      "title": "按优先级分类",
      "children": {
        "links": [
          { "kind": "case", "to": "step_p0_handler", "label": "p0", "desc": "P0-紧急" },
          { "kind": "case", "to": "step_p1_handler", "label": "p1", "desc": "P1-高优先级" },
          { "kind": "case", "to": "step_p2_handler", "label": "p2", "desc": "P2-普通" },
          { "kind": "case", "to": "step_other_handler", "label": "other", "desc": "其他" }
        ]
      },
      "next": null,
      "data": {
        "mode": "exclusive",
        "no_match_action": "classifyToOther",
        "child_branch_list": [
          {
            "name": "P0-紧急",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P0" } }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "P1-高优先级",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P1" } }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "P2-普通",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_trigger.fldPriority" },
                      "operator": "is",
                      "right_value": [{ "value_type": "option", "value": { "name": "P2" } }]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      "id": "step_p0_handler",
      "type": "LarkMessageAction",
      "title": "P0紧急处理",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "user", "value": {"id": "ou_director", "name": "总监"} }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "🚨 P0 紧急订单" }],
        "content": [{ "value_type": "text", "value": "有新的 P0 紧急订单需要立即处理" }],
        "btn_list": []
      }
    },
    {
      "id": "step_p1_handler",
      "type": "SetRecordAction",
      "title": "标记高优先级",
      "next": null,
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "处理状态", "value": [{ "value_type": "text", "value": "高优先级待处理" }] }
        ]
      }
    },
    {
      "id": "step_p2_handler",
      "type": "Delay",
      "title": "普通订单延迟处理",
      "next": null,
      "data": { "duration": 60 }
    },
    {
      "id": "step_other_handler",
      "type": "SetRecordAction",
      "title": "标记其他订单",
      "next": null,
      "data": {
        "table_name": "订单表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "处理状态", "value": [{ "value_type": "text", "value": "待分类" }] }
        ]
      }
    }
  ]
}
```

**关键点**:
- `SwitchBranch` 适合 3 路及以上的分支场景（少于 3 路用 `IfElseBranch` 更简洁）
- `children.links` 中 `kind: "case"` 的 `label` 对应 `child_branch_list` 中的条件
- `mode: "exclusive"` 表示排他执行（第一个匹配的分支执行后停止）
- `no_match_action: "classifyToOther"` 表示无匹配时走最后一个 `case`（兜底分支）

---

### 示例 5: 组合场景（定时+查找+循环+分支+消息）

**场景**: 每天早上 9 点，查找昨天的订单，按金额分级，给不同级别的销售发送不同的通知。

```json
{
  "client_token": "1704067205",
  "title": "每日订单分级通知",
  "steps": [
    {
      "id": "step_timer",
      "type": "TimerTrigger",
      "title": "每天早上9点触发",
      "next": "step_find_orders",
      "data": {
        "rule": "DAILY",
        "start_time": "2025-01-01 09:00",
        "is_never_end": true
      }
    },
    {
      "id": "step_find_orders",
      "type": "FindRecordAction",
      "title": "查找昨天所有订单",
      "next": "step_loop",
      "data": {
        "table_name": "订单表",
        "field_names": ["订单号", "客户名称", "金额", "销售负责人"],
        "should_proceed_when_no_results": false,
        "filter_info": {
          "conjunction": "and",
          "conditions": [
            { "field_name": "创建时间", "operator": "isGreaterEqual", "value": [{ "value_type": "date", "value": "yesterday" }] }
          ]
        }
      }
    },
    {
      "id": "step_loop",
      "type": "Loop",
      "title": "遍历每个订单",
      "children": {
        "links": [
          { "kind": "loop_start", "to": "step_classify" }
        ]
      },
      "next": "step_summary",
      "data": {
        "loop_mode": "continue",
        "max_loop_times": 500,
        "data": [{ "value_type": "ref", "value": "$.step_find_orders.fieldRecords" }]
      }
    },
    {
      "id": "step_classify",
      "type": "SwitchBranch",
      "title": "按金额分类",
      "children": {
        "links": [
          { "kind": "case", "to": "step_vip_notify", "label": "vip", "desc": "VIP >= 10万" },
          { "kind": "case", "to": "step_normal_notify", "label": "normal", "desc": "普通 < 10万" }
        ]
      },
      "next": null,
      "data": {
        "mode": "exclusive",
        "no_match_action": "fail",
        "child_branch_list": [
          {
            "name": "VIP订单",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
                      "operator": "isGreaterEqual",
                      "right_value": [{ "value_type": "number", "value": 100000 }]
                    }
                  ]
                }
              ]
            }
          },
          {
            "name": "普通订单",
            "condition": {
              "conjunction": "or",
              "conditions": [
                {
                  "conjunction": "and",
                  "conditions": [
                    {
                      "left_value": { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
                      "operator": "isLess",
                      "right_value": [{ "value_type": "number", "value": 100000 }]
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    {
      "id": "step_vip_notify",
      "type": "LarkMessageAction",
      "title": "VIP订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_loop.item.fldSales" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "🌟 VIP大额订单" }],
        "content": [
          { "value_type": "text", "value": "恭喜！您有一笔 VIP 订单 ¥" },
          { "value_type": "ref", "value": "$.step_loop.item.fldAmount" },
          { "value_type": "text", "value": "，客户：" },
          { "value_type": "ref", "value": "$.step_loop.item.fldCustomer" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_normal_notify",
      "type": "LarkMessageAction",
      "title": "普通订单通知",
      "next": null,
      "data": {
        "receiver": [{ "value_type": "ref", "value": "$.step_loop.item.fldSales" }],
        "send_to_everyone": false,
        "title": [{ "value_type": "text", "value": "新订单通知" }],
        "content": [
          { "value_type": "text", "value": "您有一笔新订单 ¥" },
          { "value_type": "ref", "value": "$.step_loop.item.fldAmount" }
        ],
        "btn_list": []
      }
    },
    {
      "id": "step_summary",
      "type": "GenerateAiTextAction",
      "title": "生成日报",
      "next": null,
      "data": {
        "prompt": [
          { "value_type": "text", "value": "请生成昨日订单处理日报" }
        ]
      }
    }
  ]
}
```

---

### 示例 6: 按钮触发 + 调用外部接口 + 写入同步日志

**场景**: 在「客户线索表」里给每条记录配置一个“同步到 CRM”按钮。销售点击按钮后，Workflow 调用外部 CRM 接口同步当前线索，再在「同步日志表」新增一条记录，方便后续审计和排查。

```json
{
  "client_token": "1704067206",
  "title": "线索一键同步到 CRM",
  "steps": [
    {
      "id": "step_button_trigger",
      "type": "ButtonTrigger",
      "title": "点击同步到 CRM 按钮时触发",
      "next": "step_call_crm_api",
      "data": {
        "button_type": "buttonField",
        "table_name": "客户线索表"
      }
    },
    {
      "id": "step_call_crm_api",
      "type": "HTTPClientAction",
      "title": "调用 CRM 同步接口",
      "next": "step_add_sync_log",
      "data": {
        "method": "POST",
        "url": [
          { "value_type": "text", "value": "https://api.example-crm.com/v1/leads/sync" }
        ],
        "headers": [
          { "key": "Content-Type", "value": [{ "value_type": "text", "value": "application/json" }] },
          { "key": "X-System", "value": [{ "value_type": "text", "value": "lark_base_workflow" }] }
        ],
        "body_type": "raw",
        "raw_body": [
          { "value_type": "text", "value": "{\"lead_name\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldLeadName" },
          { "value_type": "text", "value": "\",\"mobile\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldMobile" },
          { "value_type": "text", "value": "\",\"company\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldCompany" },
          { "value_type": "text", "value": "\",\"owner\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.fldOwner" },
          { "value_type": "text", "value": "\",\"source_record_id\":\"" },
          { "value_type": "ref", "value": "$.step_button_trigger.recordId" },
          { "value_type": "text", "value": "\"}" }
        ],
        "response_type": "json",
        "response_value": "{\"success\":true,\"message\":\"lead synced successfully\"}"
      }
    },
    {
      "id": "step_add_sync_log",
      "type": "AddRecordAction",
      "title": "写入同步日志",
      "next": null,
      "data": {
        "table_name": "同步日志表",
        "field_values": [
          {
            "field_name": "线索名称",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldLeadName" }]
          },
          {
            "field_name": "手机号",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldMobile" }]
          },
          {
            "field_name": "公司名称",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldCompany" }]
          },
          {
            "field_name": "负责人",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.fldOwner" }]
          },
          {
            "field_name": "来源记录ID",
            "value": [{ "value_type": "ref", "value": "$.step_button_trigger.recordId" }]
          },
          {
            "field_name": "同步状态",
            "value": [{ "value_type": "text", "value": "已提交 CRM 同步" }]
          },
          {
            "field_name": "同步是否成功",
            "value": [{ "value_type": "ref", "value": "$.step_call_crm_api.body.success" }]
          },
          {
            "field_name": "同步结果说明",
            "value": [{ "value_type": "ref", "value": "$.step_call_crm_api.body.message" }]
          },
          {
            "field_name": "备注",
            "value": [{ "value_type": "text", "value": "由按钮触发自动发起同步请求" }]
          }
        ]
      }
    }
  ]
}
```

**关键点**:
- `ButtonTrigger` 适合“人工确认后再执行”的场景，比如同步 CRM、推送 ERP、发起审批等
- `button_type: "buttonField"` 表示按钮挂在记录上，因此可以直接引用当前记录的字段和值
- `HTTPClientAction.raw_body` 可以通过 `text + ref + text` 的方式动态拼接 JSON 请求体
- `HTTPClientAction` 的输出引用规则是：`response_type=none` 时不可引用；`response_type=text` 时只能用 `$.stepId` 引整个文本；`response_type=json` 时用 `$.stepId.body` 引整个 body、用 `$.stepId.body.字段名` 引 body 中字段，同时 `$.stepId.status_code` 表示 HTTP 返回状态码
- `HTTPClientAction.response_value` 中声明了哪些字段，后续节点就只能引用这些字段；例如 `$.step_call_crm_api.body.success`、`$.step_call_crm_api.body.message`
- `AddRecordAction` 常用于写日志表、操作审计表、同步结果表，便于追踪谁在什么时候触发了外部调用
- 示例里的 `fldLeadName` / `fldMobile` / `fldCompany` / `fldOwner` 只是占位的 fieldId，请以实际表字段 ID 为准

---

### 示例 7: AI 分类（用户反馈自动分流）

**场景**: 当用户反馈表新增记录时，AI 根据反馈内容分类为 Bug 或功能建议；无法判断时标记为待人工复核。

```json
{
  "client_token": "1704067206",
  "title": "用户反馈自动分流",
  "steps": [
    {
      "id": "step_trigger",
      "type": "AddRecordTrigger",
      "title": "新增反馈时触发",
      "next": "step_ai_classify",
      "data": {
        "table_name": "用户反馈表",
        "watched_field_name": "反馈详情"
      }
    },
    {
      "id": "step_ai_classify",
      "type": "AIClassificationBranch",
      "title": "AI 判断反馈类型",
      "children": {
        "links": [
          { "kind": "case", "to": "step_bug_action", "label": "branch_1", "desc": "Bug" },
          { "kind": "case", "to": "step_feature_action", "label": "branch_2", "desc": "功能建议" },
          { "kind": "case", "to": "step_other_action", "label": "default", "desc": "默认分支" }
        ]
      },
      "next": null,
      "data": {
        "classes": [
          {
            "name": "Bug",
            "desc": "功能报错、异常、崩溃、无法使用或结果错误"
          },
          {
            "name": "功能建议",
            "desc": "希望新增能力或改变产品行为"
          }
        ],
        "content": [
          { "value_type": "ref", "value": "$.step_trigger.fldFeedbackDetail" }
        ],
        "classification_rule": "有明确故障现象时优先归入 Bug；同时包含多个诉求时，以最影响用户完成任务的问题为准；信息不足时进入默认分支。"
      }
    },
    {
      "id": "step_bug_action",
      "type": "SetRecordAction",
      "title": "标记为 Bug",
      "next": null,
      "data": {
        "table_name": "用户反馈表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "分类", "value": [{ "value_type": "text", "value": "Bug" }] }
        ]
      }
    },
    {
      "id": "step_feature_action",
      "type": "SetRecordAction",
      "title": "标记为功能建议",
      "next": null,
      "data": {
        "table_name": "用户反馈表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "分类", "value": [{ "value_type": "text", "value": "功能建议" }] }
        ]
      }
    },
    {
      "id": "step_other_action",
      "type": "SetRecordAction",
      "title": "标记为待人工复核",
      "next": null,
      "data": {
        "table_name": "用户反馈表",
        "ref_info": { "step_id": "step_trigger" },
        "field_values": [
          { "field_name": "分类", "value": [{ "value_type": "text", "value": "待人工复核" }] }
        ]
      }
    }
  ]
}
```
**关键点**:
- `classes` 按顺序对应 `branch_1`、`branch_2`；`desc` 与分类名一致，`to` 指向已定义的下游 step；

---

## 构造技巧

### Loop 构造要点

1. **数据源**: `Loop.data` 必须传入 `ref` 类型，通常是 `FindRecordAction` 的 `fieldRecords`
2. **循环体**: `children.links` 必须包含 `kind: "loop_start"` 指向循环体入口
3. **引用**: 循环体内用 `$.{loopStepId}.item.{fieldId}` 引用当前元素
4. **索引**: 用 `$.{loopStepId}.index` 获取当前索引（从 0 开始）

### 分支构造要点

1. **IfElseBranch**:
   - 适合二元判断（是/否、大于/小于）
   - `children.links` 必须包含 `if_true` 和 `if_false`
   - 可以用 `next` 指向汇合点

2. **SwitchBranch**:
   - 适合多路分类（3路及以上）
   - `label` 对应 `child_branch_list` 中的条件顺序
   - 建议加一个兜底分支（其他）

### 字段值构造

| 字段类型 | value_type | 示例 |
|---------|------------|------|
| 文本 | `text` | `{"value_type": "text", "value": "张三"}` |
| 数字 | `number` | `{"value_type": "number", "value": 100}` |
| 单选 | `option` | `{"value_type": "option", "value": {"name": "已完成"}}` |
| 人员 | `user` | `{"value_type": "user", "value": {"id": "ou_xxxx"}}` |
| 引用 | `ref` | `{"value_type": "ref", "value": "$.step_1.fldxxx"}` |

---

## 常见错误避免

### Top 10 高频错误

| # | 错误信息 | 原因 | 解决方案 |
|---|---------|------|---------|
| 1 | `path "xxx" does not exist in the output path tree` | ref 引用路径错误或 stepId 不存在 | 检查 stepId 是否在 steps 数组中；使用 fieldId 而非字段名；确保路径以 `$.` 开头 |
| 2 | `recordInfo.conditions must be non-empty` | `condition_list` 为空数组 `[]` | 改用 `null` 或省略该字段 |
| 3 | `At least one of filter info and ref info is required` | SetRecordAction/FindRecordAction 缺少定位条件 | 必须提供 `filter_info` 或 `ref_info` 之一 |
| 4 | `client token is empty` | 缺少 `client_token` | 每次请求传入唯一值（时间戳或随机字符串） |
| 5 | `valueType 'text' not allowed for fieldType '3'` | select 类型字段值格式错误 | 改用 `option` 类型 |
| 6 | `Undefined Step Type` | 使用了不支持的 StepType | 使用 `AddRecordTrigger` 而非 `CreateRecordTrigger` |
| 7 | `prompt references an unknown reference from step` | 引用的 stepId 不存在 | 确保引用的 step 在同一 workflow 的 steps 数组中 |
| 8 | `[2200] Internal Error` | 1. steps[].id 重复 2. next/children.links 引用了不存在的 step | 确保所有 step id 唯一；检查引用关系 |
| 9 | 工作流结构不完整 | Branch/Loop 节点缺少 `children` | 仅 Branch（IfElseBranch/SwitchBranch）和 Loop 节点需要 `children`，Trigger/Action 节点无需设置 |
| 10 | 嵌套分支过于复杂 | 多层 IfElseBranch 嵌套 | 3+ 路分支用 SwitchBranch 替代嵌套 IfElseBranch |

### 其他常见错误

**1. condition_list 为空数组**
```json
// ❌ 错误
{ "condition_list": [] }

// ✅ 正确
{ "condition_list": null }
// 或省略该字段
```

**2. filter_info 和 ref_info 同时提供**
```json
// ❌ 错误
{ "filter_info": {...}, "ref_info": {...} }

// ✅ 正确（二选一）
{ "filter_info": {...}, "ref_info": null }
{ "filter_info": null, "ref_info": {...} }
```

**3. 使用字段名而非 fieldId**
```json
// ❌ 错误
{ "value": "$.step_1.客户名称" }

// ✅ 正确
{ "value": "$.step_1.fldXXXXXXXX" }
```

---

## 参考

- [lark-base-workflow-schema.md](lark-base-0.md#s-aafd418669728581) — 字段定义参考
- 创建/更新前先确认真实表名、字段名和目标 workflow ID；`steps` 结构按 schema 构造，不凭自然语言猜 `type`


<a id="s-f666ff95dd93435b"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `base.v2.appRole.create` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-新增自定义角色-新增多维表格高级权限中自定义的角色 | feishu_call_tool |
| `base.v2.appRole.list` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-列出自定义角色-列出多维表格高级权限中用户自定义的角色 | feishu_read_tool |
| `base.v2.appRole.update` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-更新自定义角色-更新多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.app.copy` | [Feishu/Lark]-云文档-多维表格-多维表格-复制多维表格-复制一个多维表格，可以指定复制到某个有权限的文件夹下 | feishu_call_tool |
| `bitable.v1.app.create` | [Feishu/Lark]-云文档-多维表格-多维表格-创建多维表格-在指定文件夹中创建一个多维表格，包含一个空白的数据表 | feishu_call_tool |
| `bitable.v1.appDashboard.copy` | [Feishu/Lark]-云文档-多维表格-仪表盘-复制仪表盘-基于现有仪表盘复制出新的仪表盘 | feishu_call_tool |
| `bitable.v1.appDashboard.list` | [Feishu/Lark]-云文档-多维表格-仪表盘-列出仪表盘-获取多维表格中的所有仪表盘 | feishu_read_tool |
| `bitable.v1.app.get` | [Feishu/Lark]-云文档-多维表格-多维表格-获取多维表格元数据-获取指定多维表格的元数据信息，包括多维表格名称、多维表格版本号、多维表格是否开启高级权限等 | feishu_read_tool |
| `bitable.v1.appRole.create` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-新增自定义角色-新增多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appRole.delete` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-删除自定义角色-删除多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appRole.list` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-列出自定义角色-列出多维表格高级权限中用户自定义的角色 | feishu_read_tool |
| `bitable.v1.appRoleMember.batchCreate` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-批量新增协作者-批量新增多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.batchDelete` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-批量删除协作者-删除多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.create` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-新增协作者-新增多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.delete` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-删除协作者-删除多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.list` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-列出协作者-列出多维表格高级权限中自定义角色的协作者 | feishu_read_tool |
| `bitable.v1.appRole.update` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-更新自定义角色-更新多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appTable.batchCreate` | [Feishu/Lark]-云文档-多维表格-数据表-新增多个数据表-新增多个数据表，仅可指定数据表名称 | feishu_call_tool |
| `bitable.v1.appTable.batchDelete` | [Feishu/Lark]-云文档-多维表格-数据表-删除多个数据表-通过 app_token 和 table_id 删除多个数据表 | feishu_call_tool |
| `bitable.v1.appTable.create` | [Feishu/Lark]-云文档-多维表格-数据表-新增一个数据表-新增一个数据表，支持传入数据表名称、视图名称和字段 | feishu_call_tool |
| `bitable.v1.appTable.delete` | [Feishu/Lark]-云文档-多维表格-数据表-删除一个数据表-通过 app_token 和 table_id 删除指定的多维表格数据表 | feishu_call_tool |
| `bitable.v1.appTableField.create` | [Feishu/Lark]-云文档-多维表格-字段-新增字段-在多维表格数据表中新增一个字段 | feishu_call_tool |
| `bitable.v1.appTableField.delete` | [Feishu/Lark]-云文档-多维表格-字段-删除字段-删除多维表格数据表中的一个字段 | feishu_call_tool |
| `bitable.v1.appTableField.list` | [Feishu/Lark]-云文档-多维表格-字段-列出字段-获取多维表格数据表中的的所有字段 | feishu_read_tool |
| `bitable.v1.appTableField.update` | [Feishu/Lark]-云文档-多维表格-字段-更新字段-在多维表格数据表中更新一个字段。更新字段时为全量更新，property 等字段会被完全覆盖 | feishu_call_tool |
| `bitable.v1.appTableFormField.list` | [Feishu/Lark]-云文档-多维表格-表单-列出表单问题-列出表单中的所有问题项 | feishu_read_tool |
| `bitable.v1.appTableFormField.patch` | [Feishu/Lark]-云文档-多维表格-表单-更新表单问题-更新表单中的问题项 | feishu_call_tool |
| `bitable.v1.appTableForm.get` | [Feishu/Lark]-云文档-多维表格-表单-获取表单元数据-获取表单的所有元数据，包括表单名称、描述、是否共享等 | feishu_read_tool |
| `bitable.v1.appTableForm.patch` | [Feishu/Lark]-云文档-多维表格-表单-更新表单元数据-更新表单视图中的元数据，包括表单名称、描述、是否共享等 | feishu_call_tool |
| `bitable.v1.appTable.list` | [Feishu/Lark]-云文档-多维表格-数据表-列出数据表-列出多维表格中的所有数据表，包括其 ID、版本号和名称 | feishu_read_tool |
| `bitable.v1.appTable.patch` | [Feishu/Lark]-云文档-多维表格-数据表-更新数据表-更新数据表的名称 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchCreate` | [Feishu/Lark]-云文档-多维表格-记录-新增多条记录-在多维表格数据表中新增多条记录，单次调用最多新增 1,000 条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchDelete` | [Feishu/Lark]-云文档-多维表格-记录-删除多条记录-删除多维表格数据表中现有的多条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchGet` | [Feishu/Lark]-云文档-多维表格-记录-批量获取记录-通过多个记录 ID 查询记录信息。该接口最多支持查询 100 条记录 | feishu_read_tool |
| `bitable.v1.appTableRecord.batchUpdate` | [Feishu/Lark]-云文档-多维表格-记录-更新多条记录-更新数据表中的多条记录，单次调用最多更新 1,000 条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.create` | [Feishu/Lark]-云文档-多维表格-记录-新增记录-在多维表格数据表中新增一条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.delete` | [Feishu/Lark]-云文档-多维表格-记录-删除记录-删除多维表格数据表中的一条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.get` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-检索记录-该接口用于根据 record_id 的值检索现有记录 | feishu_read_tool |
| `bitable.v1.appTableRecord.list` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-列出记录-该接口用于列出数据表中的现有记录，单次最多列出 500 行记录，支持分页获取 | feishu_read_tool |
| `bitable.v1.appTableRecord.search` | [Feishu/Lark]-云文档-多维表格-记录-查询记录-该接口用于查询数据表中的现有记录，单次最多查询 500 行记录，支持分页获取 | feishu_read_tool |
| `bitable.v1.appTableRecord.update` | [Feishu/Lark]-云文档-多维表格-记录-更新记录-更新多维表格数据表中的一条记录 | feishu_call_tool |
| `bitable.v1.appTableView.create` | [Feishu/Lark]-云文档-多维表格-视图-新增视图-在多维表格数据表中新增一个视图，可指定视图类型，包括表格视图、看板视图、画册视图、甘特视图和表单视图 | feishu_call_tool |
| `bitable.v1.appTableView.delete` | [Feishu/Lark]-云文档-多维表格-视图-删除视图-通过 app_token、table_id 和 view_id，删除多维表格数据表中的指定视图 | feishu_call_tool |
| `bitable.v1.appTableView.get` | [Feishu/Lark]-云文档-多维表格-视图-获取视图-根据视图 ID 获取现有视图信息，包括视图名称、类型、属性等 | feishu_read_tool |
| `bitable.v1.appTableView.list` | [Feishu/Lark]-云文档-多维表格-视图-列出视图-获取多维表格数据表中的所有视图 | feishu_read_tool |
| `bitable.v1.appTableView.patch` | [Feishu/Lark]-云文档-多维表格-视图-更新视图-增量更新视图信息，包括视图名称、属性等，可设置视图的筛选条件 | feishu_call_tool |
| `bitable.v1.app.update` | [Feishu/Lark]-云文档-多维表格-多维表格-更新多维表格元数据-更新多维表格元数据，包括多维表格的名称、是否开启高级权限 | feishu_call_tool |
| `bitable.v1.appWorkflow.list` | [Feishu/Lark]-云文档-多维表格-自动化流程-列出自动化流程-该接口用于列出多维表格的自动化流程 | feishu_read_tool |
| `bitable.v1.appWorkflow.update` | [Feishu/Lark]-云文档-多维表格-自动化流程-更新自动化流程状态-开启或关闭自动化流程 | feishu_call_tool |


<a id="s-e7d0fe3a478ce891"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Base

普通 Base 是数据容器，由一棵 Base Block 资源树和 Base 级配置组成。`folder`、`table`、`docx`、`dashboard`、`workflow` 都是 Block 类型；Advanced Permission / Role 是 Base 级配置，不属于 Block。Table 是其中承载业务数据的核心 Block。Workspace 是组织 Base 与 BaseApp 的外层容器；BaseApp（AppMode）通过 Page 和组件组织 Base 数据，不是 Base 的别名。

## 身份选择（优先）

操作 Base 优先使用 `--as user`；用户明确要求应用身份时使用 `--as bot`。权限失败按 `lark-shared` 以原身份修复 scope 或资源 ACL；只有用户明确同意更换操作者时才切换身份。

## 进入前必做：解析目标实体

开始操作前先确定 `base_token` 和目标实体类型；上下文已提供 `<bitable>` / `<base_refer>` 标签及资源 ID 时直接使用。其余情况按意图选择入口：

1. **URL 或分享链接：** `lark-cli base +url-resolve --url '<url>' --as user`。Base URL 根据返回的 `resource_type` / `block_type` 及 `table_id`、`view_id`、`record_id`、`dashboard_id`、`workflow_id`、`docx_token`、`share_token` 等坐标进入对应模块；BaseApp `/app/` URL 返回 `app_token`，并在链接携带时返回 `workspace_token` 和 `page_id`。实体类型以解析结果为准。
2. **Base 标题或关键词：** `lark-cli base +title-resolve --title '<keyword>' --as user`。单一结果直接取得 `base_token`；多个候选结合标题、所有者和更新时间消歧，仍无法唯一确定时请用户选择。随后按下方 Base Block 资源模型定位目标实体。
3. **已有 Base 候选列表：** 用户要列出已有 Base 候选，且需要按最近访问、owner、创建人、时间、类型等维度筛选/排序时，转 `lark-cli drive +search --doc-types bitable --as user`。按标题/关键词定位单个 Base 仍用 `+title-resolve`。常见候选列表命令：
   - 最近访问：`lark-cli drive +search --doc-types bitable --sort open_time --opened-since 3m --page-size 20 --as user`
   - 只列我拥有的：加 `--mine`；如果要列“我创建的”，用 `--created-by-me`。
   - 从候选项拿到 URL 或 token 后，再用 `+url-resolve` 或 `+base-get` 进入 Base 业务命令。
4. **BaseApp：** 优先使用真实 `/app/` URL；已有 `workspace_token` 时可用 `+workspace-entity-list --type baseapp` 定位。两者都没有时请用户补充应用链接或 Workspace，不按名称全局猜测 `app_token`。

**读取 Base：** Base 信息用 `+base-get`，资源目录按下方 Base Block 资源模型读取。

**写入 Base：** 创建新 Base 使用一次 `+base-create --name <base-name> --table-name <table-name> --fields '<field-array>'` 同时创建 Base、首表和 fields；`+base-copy` 复制整个 Base；Base 内资源统一按下方 Block 生命周期管理。

## Base 模板中心

模板中心是公开的 Base 模板库，不是用户云空间里的已有 Base。用户想用现成模板创建新 Base，且没有指向已有对象的锚点（没有 Base URL、没有“我的/最近访问的表”、没有具体已存在的 Base 名）时，可读取 [lark-base-template-center.md](lark-base-0.md#s-de5cfa38ac334522) 查找模板中心模板；`+template-categories` 列出公开模板分类，`+template-list` 按分类列出公开模板，`+template-search` 按业务关键词搜索公开模板。

## Base Block 资源模型

```text
Base
├── Base Block 资源树
│   ├── Table Block
│   │   ├── Field schema
│   │   ├── Records / CellValue
│   │   ├── Views
│   │   └── Forms / Questions
│   ├── Dashboard Block（布局容器）
│   │   └── Dashboard 内部 Blocks（图表、指标卡、文本）
│   ├── Workflow Block
│   │   └── Workflow definition（title、status、steps 执行图）
│   ├── Docx Block → docx_token / lark-doc
│   └── Folder Block → 子 Block
└── Base 级配置
    └── Advanced Permission / Roles
```

每个 Base Block 都有 `id`、`type`、可修改的 `name`、所在 Folder 的 `parent_id`，并在同级目录中具有顺序。`+base-block-list` 是统一发现入口；`+base-block-create` 创建 Block，`+base-block-rename` 修改名称，`+base-block-move` 通过 `--parent-id` 调整目录并通过 `--before-id` / `--after-id` 调整顺序，`+base-block-delete` 删除 Block。类型专属内容再由对应模块命令处理。

创建时已经明确类型专属初始内容，可直接使用对应构造命令一次完成：Table 用 `+table-create --fields`，Dashboard 用 `+dashboard-create` 设置主题，Workflow 用 `+workflow-create --json` 提交完整定义；Folder 和 Docx 使用 `+base-block-create`。

Block 的 `id` 按类型直接作为对应模块坐标：

| Block type | 模块坐标与内部内容 |
|---|---|
| `table` | `id` 即 `table_id`；内部包含 Field、Record、View 和 Form |
| `dashboard` | `id` 即 `dashboard_id`；内部包含图表、指标卡和文本等 Dashboard 组件 |
| `workflow` | `id` 即 `workflow_id`；内部包含 title、status 和 steps 执行图 |
| `docx` | Block 另带 `docx_token`；正文由 `lark-doc` 处理 |
| `folder` | `id` 是目录 Block ID，也可作为 `--parent-id`；只组织子 Block |

## Table Block（The Core）

Table 本身是 Base Block，也是 Base 的核心数据存储层；Field、Record、View 和 Form 是 Table 内部对象，不是 Base Block。业务数据查询、写入、关联、统计和分析都从 Table 开始。先用 `+table-list` 定位 Table；字段名和目标已知的普通读取可直接进入 Record 命令，只有写入、筛选或关联等依赖字段类型/schema 的任务才补 `+field-list`。多表的 `+field-list` 可以并发执行。基础的 Record / CellValue 读写直接按下方路径；reference 只承载高级分析、完整协议和边界细节。

**读取 Table：** `+table-list` 定位表，`+table-get` 读取详情。Table 专属复制使用 `+table-copy`，异步状态用 `+table-copy-status`；schema 和 records 由下方内部对象操作。

Table 下的大多数更新通过异步链路生效，接口成功返回后立即读取可能暂时看不到最新状态。优先以写入成功响应作为操作结果；任务必须确认最终状态时，先完成本轮相关变更，再统一读取验收，避免逐项写后立即读回。

### Field

Field 定义列 schema。`field_id` 是稳定列标识，`name` 是可修改的展示名称；Formula、Lookup、Link、Select 等属于 Field 类型或能力。

**读取 Field：** `+field-list` / `+field-get` / `+field-search-options`。**写入 Field：** 已有 Table 中创建多个字段时，优先向一次 `+field-create --json` 传字段对象数组；单字段更新和删除用 `+field-update` / `+field-delete`。创建和更新分别读取 [field-create](lark-base-0.md#s-e0307fe646be43e6) / [field-update](lark-base-0.md#s-747bb7fa2d2247a2)，由命令文档继续路由 Field JSON、Formula 和 Lookup 协议。`字段插件` 用于扩展基础字段能力：按同一行其他字段内容触发 LLM 生成，并写回已有目标字段；当前已确认目标字段支持文本、单选、数字，配置或触发前先读 [field-extension](lark-base-0.md#s-2f972de6d0cce9a2)。

### Record

Record 是 Table 中的一行数据，包含该记录在各个 Field 下的 CellValue。系统 `record_id` 是表内稳定、非空且唯一的主键，Table 的主字段只是展示字段。

#### 1. 读取记录或单元格

- 已知若干个 `record_id`：`+record-get --record-id <id1> --record-id <id2>`
- 关键词搜索：`+record-search --keyword <text> --search-field <field>`；至少指定一个搜索字段。
- 其余读取：`+record-list`；结构化条件和排序分别用 `--filter-json` / `--sort-json`。

行数较大、需要服务端谓词下推时，`--filter-json` 使用 tuple condition；最常用的筛选与完整日期范围写法：

```jsonc
{
  "logic": "and", // 全部条件成立；任一条件成立改为 "or"
  "conditions": [
    ["状态", "intersects", ["进行中", "暂停"]], // Select 命中任一选项
    ["标题", "intersects", "urgent"], // 文本包含
    ["备注", "non_empty"], // 非空；判断为空改用 "empty"，两者都不传 value
    ["金额", ">=", 100], // 数字比较；支持 ==、!=、>、>=、<、<=
    ["关联项目", "intersects", [{ "id": "recxxx" }]], // Link 包含目标记录
    ["业务日期", "==", "ExactDate(2026-08-07)"], // 具体一天：按 Base 时区匹配 2026-08-07 当天
    ["发生时间", ">", "ExactDate(2024-01-31 23:59:59.999)"], // 日期不支持 >=；用 > 前一天最后一毫秒表达含当天的下界
    ["发生时间", "<", "ExactDate(2024-03-01 00:00:00)"] // 2024 年 2 月范围上界：小于 3 月 1 日零点
  ]
}
```

完整操作符和各字段取值结构读取 [Filter 条件结构](lark-base-0.md#s-ea7773b079411c53)。

所有读取都重复传 `--field-id` 做最小字段投影，并统一写入 NDJSON artifact：`--format ndjson --output <path>.ndjson`。每行是一条 Record JSON，stdout 摘要包含 `records_count` 和 `has_more` 用于分页判断。

```text
# Example: 行数较大时先筛选 Status 包含 Doing 的记录，再导出 20 条作为局部预览
lark-cli base +record-list \
  --base-token <base_token> --table-id <table_id> \
  --filter-json '{"logic":"and","conditions":[["Status","intersects",["Doing"]]]}' \
  --field-id Name --field-id Status --field-id Score --limit 20 \
  --format ndjson --output ./records-preview.ndjson --as user

PREVIEW_ROWS=5
head -n "$PREVIEW_ROWS" ./records-preview.ndjson
tail -n "$PREVIEW_ROWS" ./records-preview.ndjson
```

预计记录数少于 500 行时，建议不做谓词下推，直接拉取到本地用 jq 或 Python 处理；行数较大时可用 `--filter-json` 下推可表达的条件，正则、派生等无法下推的条件继续在本地处理。

```text
# jq：对服务端筛选结果追加名称格式筛选，再投影必要字段
jq -c 'select((.Name // "") | test("^Task-[0-9]+$")) | {record_id, Name}' ./records-preview.ndjson

# Python：按行读取并做简单汇总
python3 - <<'PY'
import json

with open("records-preview.ndjson", encoding="utf-8") as stream:
    rows = (json.loads(line) for line in stream if line.strip())
    print(sum((row.get("Score") or 0) for row in rows))
PY
```

`--limit` 的缺省值是 2000，最大值是 2000，通常无需手动指定 limit 参数；支持 `--offset` 参数；只有 `has_more=false` 且查询范围符合问题时，才能当作完整结果。大表完整读取、View 范围读取、复杂 JOIN、集合/多值、时序、语义或专业统计分析时，读取 [Record 查询与分析 SOP](lark-base-0.md#s-cc7ad3628755b3c0)。

#### 2. 新增记录或更新记录单元格

一条 Record 是 `{字段名或 field_id: CellValue}`，常见 CellValue：

```jsonc
{
  "标题": "Created from shortcut", // text: string
  "官网": "[官网](https://example.com)", // text(url): 裸 URL 或 Markdown link
  "联系电话": "13800000000", // text(phone): 合法电话号码字符串
  "邮箱": "owner@example.com", // text(email): 合法邮箱字符串
  "单选": ["Todo"], // select: array<string>；单选时数组最多一个值；
  "标签": ["高优", "外部依赖"], // 多选 select: array<string>；必须是当前字段存在的选项；
  "工时": 8, // number: double，不经过格式化的纯数字
  "带时区时间": "2026-03-24T10:00:00+08:00", // datetime：带时区，遵循传入的时区
  "不带时区时间": "2026-03-24 10:00", // datetime：不带时区，自动按当前 Base 时区转换
  "毫秒时间戳": 1774317600000, // datetime：也支持 Unix 毫秒时间戳
  "已完成": false, // checkbox: boolean
  "负责人": [{ "id": "ou_123" }], // user(multiple=false): 数组最多一个元素
  "协作人": [{ "id": "ou_123" }, { "id": "ou_456" }], // user(multiple=true): 数组可包含多个元素
  "群聊": [{ "id": "oc_123" }, { "id": "oc_456" }], // group_chat(multiple=true)
  "关联任务": [{ "id": "rec456" }], // link: array<{id}>，record_id 来自目标表
  "坐标": { "lng": 116.397428, "lat": 39.90923 }, // location: {lng,lat}
  "清空": null, // 清空单元格，传 null
  "清空数组": [] // 清空数组类单元格，空数组和 null 都可以
}
```

附件使用专用 shortcut 上传、下载或移除。created_at, updated_at, created_by, updated_by, auto_number, formula, lookup 类型字段只读，若误写入单元格会返回 `ignored_fields` 表示这些字段被静默过滤，其余字段正常写入。

```text
# 新增：成功时返回 record_id_list
lark-cli base +record-batch-create \
  --base-token <base_token> --table-id <table_id> \
  --json '{"create_records":[{"Name":"Task A","Status":["Todo"]},{"Name":"Task B","Score":20}]}' --as user

# 更新：每条记录只提交要改变的字段
lark-cli base +record-batch-update \
  --base-token <base_token> --table-id <table_id> \
  --json '{"update_records":{"<record_id_a>":{"Status":["Done"]},"<record_id_b>":{"Score":100}}}' --as user
```

大 payload 可用脚本生成 json 后用 `--json @file.json`。单批最多 200 条，超过后分批，同一 Table 串行写入；并行可能触发 `1254291` 并发冲突错误。

#### 3. 其他 Record 操作

- `+record-delete --base-token <base_token> --table-id <table_id> --record-id <id1> --record-id <id2>` 删除若干个记录
- `+record-share-link-create --base-token <base_token> --table-id <table_id> --record-id <id1> --record-id <id2>` 创建记录分享链接
- `+record-history-list` 查询单条记录的变更事件，读取 [历史记录协议](lark-base-0.md#s-de0a78f95601bd3f)
- 附件必须使用 `+record-upload-attachment` / `+record-download-attachment` / `+record-remove-attachment` 操作。

### View

View 共享 Table 的底层记录；没有特殊展示需求时优先使用 `grid`。读取已有视图用 `+view-list` / `+view-get`。

**所有 View 编辑前必读 [View 类型与生命周期](lark-base-0.md#s-acbbbbc678c14729)**，包括创建、改名、配置修改（筛选、排序、分组、字段显隐、时间条、卡片）和删除。视图选型、适用配置及完整操作示例统一在该 reference 中。

### Form

Form 依附于 Table，以 Field 作为题目，每次有效提交会创建一条 Record，适合信息收集、外部填写、条件题目和附件提交。

1. **读取 Table 中的表单配置：** 使用 `+form-list` / `+form-get` 读取表单，使用 `+form-questions-list` 读取题目配置；这些命令使用表单所属的 `base_token + table_id`。
2. **创建或修改 Table 中的表单配置：** 使用 `+form-create` / `+form-update` / `+form-delete` 管理表单；题目由 Table Field 承载，question ID 对应 `field_id`，创建和更新分别读取 [questions create](lark-base-0.md#s-cc8ee423033b7e75) / [questions update](lark-base-0.md#s-cd7d8d135d50d3cc)，删除使用 `+form-questions-delete`。
3. **调整表单题目显隐和顺序：** Form 在 `visible_fields` 接口中作为 View，`form_id` 传给 `--view-id`。用 `+view-get-visible-fields` 读取当前可见题目，再用 `+view-set-visible-fields` 提交最终需要展示的完整有序题目 ID 列表；省略当前可见题目会隐藏它，加入已有隐藏 Form 成员会重新展示，空列表会隐藏全部题目。目标只能包含已有 Form 成员；仍显示题目的 `visible_rule` 只能引用位于它之前的可见题目。
4. **管理表单分享：** 使用 `+form-share-get` / `+form-share-update` 管理启停、访问范围和匿名/登录要求；更新前先读取现状，每次只修改一个字段，布尔值显式传 `true` 或 `false`。
5. **填写分享表单并提交：** 对表单分享链接使用 `+url-resolve` 取得 `share_token`，按 [Form detail](lark-base-0.md#s-985279bc773a01a5) 执行 `+form-detail` 读取真实题目、必填项和显示条件，再按 [Form submit](lark-base-0.md#s-4963125425a3cc77) 构造字段与附件并执行 `+form-submit`。

表单题目和字段的关系：

- `+form-questions-create` 支持两种形态：新建字段题目需要 `title` + `type`；已有字段题目需要 `use_existing_field:true` + `field_id`。已有字段题目只是把该字段加入表单，不创建新字段，也不改变已有记录数据；不要给该形态携带 `type`、`style`、`options` 等字段定义属性。
- 创建问题前先 `+form-questions-list`。若目标标题已经存在，除非用户明确要求同名独立问题，否则优先用 `+form-questions-update` 修改题目配置，不要先创建同名问题再删除旧问题。
- `+form-questions-delete` 是高风险写操作。默认会删除承载问题的底层 Field 及该字段所有记录数据；只想把题目移出表单并保留字段/数据时必须传 `--keep-field`。保留字段后可用 `+form-questions-create --questions '[{"use_existing_field":true,"field_id":"<field_id>"}]'` 加回表单。

## Dashboard Block

Dashboard Block 是 Base Block 树中的仪表盘容器，负责承载页面主题、布局和内部组件集合，本身不表示某一项图表数据。使用 `+dashboard-list` 定位容器，`+dashboard-get` 读取容器信息，`+dashboard-update` 修改主题，`+dashboard-arrange` 统一编排内部组件布局。

**管理 Dashboard 分享：** 使用 `+dashboard-share-get` / `+dashboard-share-update` 管理启停、访问范围和返回源 Base 入口；更新前先读取现状，每次只修改一个字段，显式 `false` 会被保留。

容器内部的图表、指标卡和文本等组件在 Dashboard API 中也称为 Block，但不属于 Base Block 树。内部 Block 分为三条操作路径：

1. **读取配置：** `+dashboard-block-list` / `+dashboard-block-get` 读取组件类型、布局和 `data_config`；文本组件的正文也属于配置。
2. **写入配置：** `+dashboard-block-create` / `+dashboard-block-update` / `+dashboard-block-delete` 管理组件，`data_config` 定义数据源、维度、指标、聚合或文本内容。
3. **读取内容：** `+dashboard-block-get-data` 读取图表、指标卡等数据组件的计算结果。

操作内部 Block 前先读 [Dashboard](lark-base-0.md#s-b9539e7968607a67)，由该入口继续路由组件配置和结果协议。

## 应用模式与 Workspace 心智模型

Workspace 是组织 Base 和 BaseApp 的空间容器；BaseApp 创建时必须归属一个 Workspace。BaseApp 用 Page 组织界面，每个 Page 包含图表、列表或富文本组件；组件通过 `data_config` 引用 Base 数据，但不会改变 Base、Table、Field 和 Record 的归属关系。Workspace 负责资源归属，App 负责页面和组件，Base 负责数据。

1. **Workspace：** 使用 `+workspace-create`、`+workspace-entity-list` 和 `+workspace-move-in` 创建目录、列出其中的 Base/BaseApp 或移入资源。
2. **应用：** 使用 `+app-create` / `+app-get`；应用查询和创建依赖真实 `app_token` / `workspace_token`。
3. **页面：** 使用 `+app-page-list/get/create/rename/delete` 管理 Page。
4. **组件：** 使用 `+app-block-list/get/create/update` 读写组件配置，使用 `+app-block-get-data` 读取组件计算结果。

BaseApp、Workspace、Page 或组件任务开始前完整读取 [应用模式与 Workspace](lark-base-0.md#s-4e3b1d6f0fda0ea4)；构造组件 `data_config` 时继续读取 [应用组件配置](lark-base-0.md#s-ed634f84db63916f)。BaseApp 不走 `lark-apps`。当前不支持 BaseApp 复制、Page 完整复制、页面图标以及从 Workspace 移出资源；遇到这些目标按 reference 的能力边界处理，不以新建空对象或 Drive 移动冒充。

- BaseApp（应用模式）中的 Page 和组件使用 `app_token` / `page_id` / `block_id`，表、字段和记录仍使用组件所引用 Base 的 `base_token`；不要混用 token 或把 BaseApp 当作 Base 的别名。
- 复用现有 BaseApp block 的 `data_config` 只能作为结构模板，首次 Create/Update 前仍要逐项对齐用户显式要求；用户要求排序时必须显式写 `group_by[].sort.order` 或顶层 `sort.order`，不能用旧配置省略的方向或当前 `get-data` 结果顺序代替。
- 应用页面的 block 与仪表盘 block 是同一套底层实体，但 ID 体系不通用；按当前模块 reference 选择命令和配置协议。

## Workflow Block

Workflow 本身是 Base Block，其内部是一张由 `next` / `children` 连接的 steps 执行图；触发器、动作、条件分支和循环都是 step 类型。它适合定时执行、Record 新增或变更联动、消息通知、记录读写和跨系统调用。Workflow 分为三条操作路径：

1. **读取配置：** `+workflow-list` 定位流程，`+workflow-get` 读取 `title`、`status` 和完整 `steps` 执行图。
2. **写入配置：** `+workflow-create` 创建完整定义，`+workflow-update` 更新完整定义；构造或修改配置前读取 [Workflow](lark-base-0.md#s-c1c547e4561de954)，由该入口继续路由 step 类型和 schema。
3. **运行状态控制：** `+workflow-enable` / `+workflow-disable` 启用或停用已有 Workflow，不修改 steps 执行图。

## Advanced Permission（AdvPerm）

AdvPerm 为 Base 开启细粒度权限模式；Role 在此基础上配置 Base、Table、View、Field、Record、Dashboard 和 Docx 等资源的访问能力，适合按团队或职责限制可见范围、编辑能力、复制下载和数据访问规则。

**读取 AdvPerm：** `+base-get` 查看 `is_advanced`，`+role-list` / `+role-get` 查看角色。**写入 AdvPerm：** `+advperm-enable` / `+advperm-disable` 启停高级权限，`+role-create` / `+role-update` / `+role-delete` 管理角色。先读 [权限与角色](lark-base-0.md#s-4970f49b7b7e8c10)，由该入口继续路由权限 JSON 协议。

## Docx Block

Docx Block 是组织在 Base 目录中的飞书文档资源，适合把说明、方案和报告与数据表、仪表盘及流程放在同一 Base 中；正文仍使用标准 Docx 数据模型。

从 Base Block 资源目录按 `--type docx` 定位文档并取得 `docx_token`；正文读取、创建与编辑使用 `lark-doc`。

## Folder Block

Folder Block 只承担 Base 目录分组和层级组织。用 `+base-block-list --parent-id <folder_block_id>` 读取直接子项。

## 通用执行契约

- Update 先确认命令是完整替换还是 delta：完整替换使用可信当前配置做 read-modify-write，delta 只提交目标变更。
- 优先用写入返回确认结果；返回不足以确认或任务明确要求核验时再读回目标。
- 命令具有 confirmation gate 时，确认目标和影响后使用 `--yes`。

## 不在本 Skill 范围

- 认证、初始化、scope、身份切换和授权恢复 → `lark-shared`
- Excel、CSV、`.base` 等本地文件与 Base 之间的导入/导出转 `lark-drive`；在线复制走 `+base-copy`
- Base 内嵌 Docx 的正文编辑 → `lark-doc`；电子表格内容操作 → `lark-sheets`
