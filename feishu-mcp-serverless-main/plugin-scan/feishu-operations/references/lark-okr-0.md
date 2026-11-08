<a id="s-8bde09e6f148ff41"></a>

## SKILL.md


# okr

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先识别周期、O 和 KR 的真实 ID，使用 cli.okr 的 v2 合同。进度、指标值、评分和进展说明分别处理，不能用一种字段代替另一种。

2. 修改 KR 进度时先读现状，只更新用户指定值，保留评分、负责人和对齐关系。百分数是 0–1 还是 0–100 以具体 schema 为准。

3. v1 progress_record 和 v2 Objective 管理不等价；当前连接缺 v2 时只报告实际可用操作。

## 按需参考

- [工具与合同](lark-okr-0.md#s-326189fa39448a2d)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-okr-0.md#s-c2733bde244238c4)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-2354c9c50895abb3"></a>

## references/lark-okr-alignments.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# OKR 对齐关系管理

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

管理 OKR 目标之间的对齐关系，包括查询、创建和删除对齐。

## 对齐关系说明

OKR 对齐关系表示两个目标之间的关联：
- **对齐（aligning）**：目标 A 对齐到目标 B，表示 A 的完成有助于 B 的完成
- **被对齐（aligned）**：目标 B 被目标 A 对齐

每个对齐关系有唯一的 `alignment_id`，用于删除操作。

---

## 一、查询对齐关系

### 命令

```text
lark-cli okr objective.alignments list --objective-id "<目标ID>" [flags]
```

### 常用示例

```text
# 获取目标的所有对齐关系（同时包含对齐和被对齐）
lark-cli okr objective.alignments list \
  --objective-id "7652569715131075772"

# 只查询该目标主动对齐他人的关系
lark-cli okr objective.alignments list \
  --objective-id "7652569715131075772" \
  --align-type "aligning"

# 只查询他人对齐该目标的关系
lark-cli okr objective.alignments list \
  --objective-id "7652569715131075772" \
  --align-type "aligned"

# 自动分页获取全部数据
lark-cli okr objective.alignments list \
  --objective-id "7652569715131075772" \
  --page-all
```

### 参数

| 参数                   | 必填 | 默认值            | 说明                                                                 |
|----------------------|----|----------------|--------------------------------------------------------------------|
| `--objective-id`     | 是  | —              | 目标 ID                                                              |
| `--align-type`       | 否  | —              | 对齐类型：`aligning`（该目标对齐他人）\| `aligned`（他人对齐该目标）。留空返回全部。 |
| `--user-id-type`     | 否  | `open_id`      | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                    |
| `--page-size`        | 否  | `10`           | 分页大小，最大 100                                                    |
| `--page-all`         | 否  | —              | 自动分页获取全部数据                                                    |

### 返回字段说明

- `items[].id`：对齐关系 ID（删除时需要）
- `items[].from_entity_id`：发起对齐的目标 ID
- `items[].to_entity_id`：被对齐的目标 ID
- `items[].from_owner` / `to_owner`：双方所有者信息

---

## 二、创建对齐关系

### 命令

```text
lark-cli okr objective.alignments create --objective-id "<发起对齐的目标ID>" --data '<JSON>'
```

### 常用示例

```text
# 创建对齐关系：目标 7652569715131075772 对齐到目标 7652569715131075773
lark-cli okr objective.alignments create \
  --objective-id "7652569715131075772" \
  --data '{"to_entity_id":"7652569715131075773","to_entity_type":2}'

# 从文件读取请求体
lark-cli okr objective.alignments create \
  --objective-id "7652569715131075772" \
  --data @alignment.json
```

### 参数

| 参数               | 必填 | 说明                                                                 |
|------------------|----|--------------------------------------------------------------------|
| `--objective-id` | 是  | 发起对齐的目标 ID（"我"的目标）                                          |
| `--data`         | 是  | JSON 请求体，格式见下方。支持 `@文件路径` 从文件读取。                           |

### 请求体格式

```json
{
  "to_entity_id": "7652569715131075773",  // 被对齐的目标 ID
  "to_entity_type": 2                     // 固定值 2，表示目标类型
}
```

### 对齐规则

- **禁止自对齐**：不能自己对齐自己
- **周期时间重叠**：两个目标所在周期的时间范围必须有重叠
- **权限要求**：需要对发起对齐的目标有编辑权限

### 返回

成功后返回 `alignment_id`，保存好以便后续删除。

---

## 三、删除对齐关系

### 命令

```text
lark-cli okr alignments delete --alignment-id "<对齐关系ID>"
```

### 常用示例

```text
# 删除指定的对齐关系
lark-cli okr alignments delete \
  --alignment-id "7652569715131075780"
```

### 参数

| 参数               | 必填 | 说明                                   |
|------------------|----|--------------------------------------|
| `--alignment-id` | 是  | 对齐关系 ID（从 list 或 create 返回） |

### 注意事项

- 删除操作不可逆，请谨慎操作
- 需要对关联的目标有编辑权限

---

## 完整工作流示例

### 场景：将目标 A 对齐到目标 B

1. **查询现有对齐关系**（确认是否已存在）
   ```text
   lark-cli okr objective.alignments list \
     --objective-id "目标A的ID" \
     --align-type "aligning"
   ```

2. **创建对齐关系**
   ```text
   lark-cli okr objective.alignments create \
     --objective-id "目标A的ID" \
     --data '{"to_entity_id":"目标B的ID","to_entity_type":2}'
   ```

3. **验证对齐结果**
   ```text
   lark-cli okr objective.alignments list \
     --objective-id "目标A的ID" \
     --align-type "aligning"
   ```

4. **（如需）删除对齐关系**
   ```text
   lark-cli okr alignments delete \
     --alignment-id "从步骤1返回的alignment_id"
   ```

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-ab36ffb3c1ee32b5"></a>

## references/lark-okr-batch-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +batch-create

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

批量创建 OKR 目标（Objective）和关键结果（Key Result）。

## 推荐命令

```text
# 批量创建 2 个 Objective，各带 2 个 KR。
lark-cli okr +batch-create \
  --cycle-id 7000000000000000001 \
  --input '[{"text":"提升产品用户体验","mention":["ou_xxxxxxxx"],"notes":"重点关注核心路径体验","krs":[{"text":"页面加载速度提升 50%","mention":["ou_yyyyyyyy"]},{"text":"用户满意度达到 4.8 分"}]},{"text":"拓展新市场份额","krs":[{"text":"新增 10 个城市覆盖"},{"text":"市场份额提升至 25%"}]}]' \
  --as user

# 从文件读取输入
lark-cli okr +batch-create \
  --cycle-id 7000000000000000001 \
  --input @okr_batch.json \
  --as user

# 预览 API 调用（Dry-run）
lark-cli okr +batch-create \
  --cycle-id 7000000000000000001 \
  --input @okr_batch.json \
  --dry-run \
  --as user
```
- mention 是可选参数，不需要使用“@”提及其他用户时不传入。
  - 传入的 mention 参数会以 @对应用户的形式，添加在文本后。
- Objective 的 notes / notes_mention 是可选参数，用于创建目标备注；KR 不支持备注。
- Objective 的 category_id 是可选参数；也可以通过 `--category-id` 给所有未显式设置分类的 Objective 指定默认分类。

## 参数

| 参数               | 必填 | 默认值       | 说明                                                         |
|------------------|----|-----------|------------------------------------------------------------|
| `--cycle-id`     | 是  | —         | OKR 周期 ID（int64 类型）                                        |
| `--input`        | 是  | —         | JSON 数组格式的 Objective 列表。支持 `@文件路径` 从文件读取或 `-` 从 stdin 读取。 |
| `--category-id`  | 否  | —         | 默认 Objective 分类 ID。仅用于 input 中未设置 `category_id` 的 Objective。通常不需要传入，见下方“分类提示”。 |
| `--user-id-type` | 否  | `open_id` | mention 中使用的用户 ID 类型：`open_id` \| `union_id` \| `user_id`  |
| `--dry-run`      | 否  | —         | 预览 API 调用而不实际执行                                            |
| `--format`       | 否  | `json`    | 输出格式                                                       |

> **分类提示**：当用户明确要求设置 Objective 分类，或创建 Objective 返回 `invalid parameters` 且怀疑租户强制开启分类时，可以配置 category-id 字段进行创建。先运行 `lark-cli okr categories list --as user` 查看可用分类，然后选择一个语义合适且 `enabled=true` 的分类 ID 作为 `category-id`。分类创建后可以再调整；不必因为分类选择停下等待用户确认。

## 输入格式

```json
[
  {
    "text": "Objective 内容",
    "mention": ["ou_xxxxxxxx", "ou_yyyyyyyy"],
    "notes": "Objective 备注",
    "notes_mention": ["ou_xxxxxxxx"],
    "category_id": "7249339036661170180",
    "krs": [
      {
        "text": "KR 内容",
        "mention": ["ou_zzzzzzzz"]
      }
    ]
  }
]
```

字段说明：

- `text`：Objective 或 KR 内容，必填。
- `mention`：追加到内容后的用户 mention，可选。
- `notes`：Objective 备注文本，可选，仅 Objective 支持。
- `notes_mention`：追加到 Objective 备注后的用户 mention，可选，仅在 `notes` 存在时有意义。
- `category_id`：Objective 分类 ID，可选；会覆盖命令级 `--category-id`。
- `krs`：当前 Objective 下要创建的 KR 列表，可选。

## 工作流程

1. 使用 `+cycle-list` 获取可用的 OKR 周期 ID
2. 构造 `--input` JSON 数组，包含要创建的 Objective 和 KR
3. 执行 `lark-cli okr +batch-create --cycle-id <id> --input '...'`

## 输出

成功返回 JSON：

```json
{
  "ok": true,
  "data": {
    "created": [
      {
        "objective_id": "7000000000000000002",
        "krs": ["7000000000000000003", "7000000000000000004"]
      },
      {
        "objective_id": "7000000000000000005",
        "krs": ["7000000000000000006"]
      }
    ]
  }
}
```

## 参考

- [OKR 业务实体](lark-okr-0.md#s-454dba25e45d198c) -- OKR 实体结构定义
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-e74749e9cb4850ee"></a>

## references/lark-okr-comment-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-create
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

创建一条 OKR 评论，或回复已有的评论。只支持 user 身份。

## 推荐命令

```text
# 在周期下创建实体级评论。
lark-cli okr +comment-create --target-type cycle --target-id 3456789012345678901 --content '{"text":"进展不错"}'

# 在 Objective 正文中创建指定文本的划词评论。
lark-cli okr +comment-create --target-type objective --target-id 2345678901234567890 --content '{"text":"请补充数据"}' --selected-text '提升核心接口稳定性'

# 在 Objective 正文中创建划词评论。
lark-cli okr +comment-create --target-type objective --target-id 2345678901234567890 --content '{"text":"请补充数据"}' --select-all

# 在 KeyResult 的已有划词评论串中追加回复。
lark-cli okr +comment-create --target-type key_result --target-id 4567890123456789012 --content '{"text":"已回复"}' --ref-comment-id 7000000000000000004

# 使用 richtext 文件作为评论正文。
lark-cli okr +comment-create --target-type progress --target-id 3456789012345678901 --style richtext --content '@comment.json'
```

```text
# 写入前预览创建评论的 URL、参数和请求体。
lark-cli okr +comment-create --target-type progress --target-id 3456789012345678901 --content '{"text":"进展不错"}' --dry-run
```

## 常用表述

以下是一些用户需求中常见的表述:

- 全局评论/周期评论/OKR评论: 指 OKR 周期的实体级评论，当用户要求创建全局评论，或对某个周期的 OKR 进行评论（不特指某个 Objective 或 KeyResult 时），可以创建周期实体级评论。
- 划词评论: 指 Objective/KeyResult 下的划词评论。需要注意，Objective/KeyResult 下不能创建实体级评论（必须携带 selected-text 或 select-all）。若用户没有特别指定需评论的段落，使用 --select-all

## 参数

| 参数             | 必填 | 默认值  | 说明                                                                                                          |
|------------------|------|---------|---------------------------------------------------------------------------------------------------------------|
| --target-type    | 是   | —       | cycle、progress、objective 或 key_result。                                                                    |
| --target-id      | 是   | —       | 评论对象 ID，int64 正整数。                                                                                   |
| --content        | 是   | —       | 评论正文；输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON），支持 @文件路径。 |
| --selected-text  | 否   | —       | Objective/KeyResult 新建划词时的完整纯文本。                                                                  |
| --select-all     | 否   | false   | Objective/KeyResult 划词时选择全文。                                                                          |
| --ref-comment-id | 否   | —       | 回复 Progress/Cycle 评论，或将 Objective/KeyResult 评论挂入已有划词串。                                       |
| --style          | 否   | simple  | 输入/输出风格：simple 或 richtext。                                                                           |
| --user-id-type   | 否   | open_id | open_id、union_id、user_id 或 user_key。                                                                      |
| --dry-run        | 否   | —       | 预览 API 调用而不实际执行。                                                                                   |
| --format         | 否   | json    | 输出格式。                                                                                                    |

## 评论场景参数组合

| 场景                           | target-type             | 必须传                                                        | 不能传                                                |
|--------------------------------|-------------------------|---------------------------------------------------------------|-------------------------------------------------------|
| 创建周期/进展实体级评论        | cycle 或 progress       | `--content`                                                   | `--selected-text`、`--select-all`、`--ref-comment-id` |
| 回复周期/进展已有评论          | cycle 或 progress       | `--content`、`--ref-comment-id`                               | `--selected-text`、`--select-all`                     |
| 创建 Objective/KR 划词评论     | objective 或 key_result | `--content`，并在 `--selected-text` / `--select-all` 中二选一 | `--ref-comment-id`                                    |
| 追加到 Objective/KR 划词评论串 | objective 或 key_result | `--content`、`--ref-comment-id`                               | `--selected-text`、`--select-all`                     |

## 工作流程

1. 确定评论 target：使用 [+cycle-detail](lark-okr-0.md#s-032ab2f6c5cb93e6) 获取 Objective/KeyResult ID，使用 [+progress-list](lark-okr-0.md#s-61fa4c0c12279422) 获取 Progress ID；已有评论串时使用 [+comment-list](lark-okr-0.md#s-615dc4b66a768872) 或 [+comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) 获取 comment-id。
2. 根据 target-type 选择评论形式：
   - cycle/progress：不传 selected-text 或 select-all；需要回复时传 ref-comment-id。
   - objective/key_result：在 selected-text、select-all、ref-comment-id 中选择且只能选择一个；selected-text 和 select-all 互斥，二者也都和 ref-comment-id 互斥。
3. 准备 content：content 是业务必填，通常建议使用 simple 格式，需要精确控制 @用户的位置时，可以使用 richtext 格式，参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)
4. 执行命令；真实写入前可以先使用 --dry-run 检查 URL、query 和 body。
5. 在创建(而非回复) Objective/KeyResult 划词评论时，若用户未指定评论的具体位置，通常可以使用 select-all 而非自行指定 selected-text，除非用户需求中明确了具体的段落。
   - 若需使用 selected-text 精确选择划词选区时，只可传入正文中真实存在的连续纯文本片段；不要包含或跨越 mention 占位符，否则无法命中具体内容。
   - selected-text 会选择对应文本的首个命中。若 selected-text 未匹配到内容，会 fallback 至选择全文。

## 输出

创建成功返回 JSON：

```json
{
  "comment_id": "7000000000000000004",
  "selection_id": "8000000000000000002"
}
```

- comment_id 是新评论 ID。
- selection_id 只在创建划词评论时返回，用于识别评论串。
- 创建接口不直接返回完整 Comment；需要详情时使用 [+comment-get](lark-okr-0.md#s-33d49c2c37ebe05a)。

## 注意事项

- Objective/KeyResult 的 ref-comment-id 只用于定位已有划词串，不会在新评论的 ref_comment_id 字段建立引用关系。
- `--ref-comment-id` 必须传评论实体自身的 `id`，不能传 `selection.id`。`selection.id` 只用于识别同一个划词评论串；如果要回复某个划词串，应先从 +comment-list 或 +comment-detail 中找到该串内任意一条 Comment 的 `id`，再将这个 `id` 传给 `--ref-comment-id`。
- Progress/Cycle 是实体级评论；Progress 的 ref-comment-id 会建立普通评论之间的引用关系。
- 评论的 content 不支持 docs/images 字段，建议使用 simple 格式填写

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment、评论串和 target 类型
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — simple/richtext 输入格式
- [okr +comment-list](lark-okr-0.md#s-615dc4b66a768872) — 查询已有评论和 selection.id
- [okr +comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) — 获取评论详情
- [okr +comment-solve / +comment-reopen](lark-okr-0.md#s-5378ddbb443e95d4) — 管理评论状态
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-658e56646727c3a5"></a>

## references/lark-okr-comment-delete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-delete
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

永久删除一条评论。删除划词评论时只删除指定评论，不会删除同一 selection.id 下的其他评论。

## 功能简介

删除一条特定评论。本 shortcut 为高风险接口，删除的评论不可找回，如果只是暂时结束讨论，可使用 +comment-solve。只支持 user 身份。

## 推荐命令
```text
# 预览删除请求，不实际执行永久删除。
lark-cli okr +comment-delete --comment-id 7000000000000000004 --dry-run
# 确认删除目标后，执行不可恢复的删除操作。
lark-cli okr +comment-delete --comment-id 7000000000000000004 --yes
```


## 参数

| 参数         | 必填         | 默认值 | 说明                                                        |
|--------------|--------------|--------|-------------------------------------------------------------|
| --comment-id | 是           | —      | 要删除的评论 ID，int64 正整数。建议先由 +comment-get 核对。 |
| --yes        | 真实执行时是 | —      | 确认 high-risk-write 操作。--dry-run 时不需要。             |
| --dry-run    | 否           | —      | 预览 API 调用而不实际执行。                                 |
| --format     | 否           | json   | 输出格式。                                                  |

## 工作流程

1. 使用 [+comment-list](lark-okr-0.md#s-615dc4b66a768872)、[+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) 或 [+comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) 定位并确认 comment-id。
2. 判断是否真的需要删除：解决评论使用 [+comment-solve](lark-okr-0.md#s-5378ddbb443e95d4)，删除只用于永久移除内容。
3. 先执行带 --dry-run 的命令检查 URL 和 comment-id。
4. 向用户明确说明删除不可恢复；得到确认后，在原始命令末尾追加 --yes 执行。
5. 根据 deleted=true 和返回的 comment_id 确认结果。

## 输出

删除成功返回 JSON：
```json
{
  "deleted": true,
  "comment_id": "7000000000000000004"
}
```


## 注意事项

- 删除是单条评论级操作，即使评论属于划词评论串，也不会连带删除其他评论。
- 删除后不能使用 +comment-reopen 恢复；暂时关闭讨论应使用 +comment-solve。
- 该命令不需要 style，因为接口没有返回 Comment 正文。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment、评论串和状态规则
- [okr +comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) — 删除前核对评论
- [okr +comment-solve / +comment-reopen](lark-okr-0.md#s-5378ddbb443e95d4) — 暂时解决和恢复评论
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 高风险操作确认协议


<a id="s-2e2dff7de68f0c69"></a>

## references/lark-okr-comment-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-detail
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

获取指定 OKR 周期下 Cycle、Objective、KeyResult 和 Progress 的全部评论，并按评论对象和评论串整理后按时间升序排列。该 shortcut 是跨多个 OKR 接口的聚合查询。

## 推荐命令

```text
# 获取指定周期下所有 Cycle、Objective、KeyResult 和 Progress 的评论。
lark-cli okr +comment-detail --cycle-id 1234567890123456789

# 获取原始 ContentBlock 格式的评论正文。
lark-cli okr +comment-detail --cycle-id 1234567890123456789 --style richtext

# 预览聚合查询的 API 调用，不实际执行。
lark-cli okr +comment-detail --cycle-id 1234567890123456789 --dry-run
```

## 参数

| 参数       | 必填 | 默认值 | 说明                                                                                       |
|------------|------|--------|--------------------------------------------------------------------------------------------|
| --cycle-id | 是   | —      | OKR 周期 ID，int64 正整数，可从 +cycle-list 获取。                                         |
| --style    | 否   | simple | simple 返回半纯文本格式，不涉及字体/颜色等信息时推荐使用；richtext 返回原始 ContentBlock。 |
| --dry-run  | 否   | —      | 预览聚合查询而不实际执行。                                                                 |
| --format   | 否   | json   | 输出格式。                                                                                 |

## 工作流程

1. 使用 +cycle-list 获取周期 ID；如果用户已经提供周期 ID，直接使用。
2. 执行 +comment-detail --cycle-id "..."。shortcut 会依次获取周期下的 Objective、每个 Objective 下的 KeyResult、每个 Objective/KeyResult 下的 Progress，以及四类对象的评论。
3. 评论接口自动处理分页；对象读取和评论读取使用有界并发。任一底层请求失败时整体返回错误，不返回静默不完整结果。
4. 评论串按首条评论的 create_time 升序排列，串内评论也按 create_time 升序排列。

## 输出

返回 JSON 的核心结构如下：

```json
{
  "cycle_id": "1234567890123456789",
  "comments": {
    "2345678901234567890": [
      [
        {
          "id": "7000000000000000001",
          "target": {"target_type": "objective", "target_id": "2345678901234567890"},
          "commentator_id": "ou_xxx",
          "status": "open",
          "create_time": "2025-01-15 10:30:00",
          "update_time": "2025-01-15 10:30:00",
          "selection": {"id": "8000000000000000001", "selected_text": "提升核心接口稳定性"},
          "content": {"text": "请补充指标", "mention": [], "docs": [], "images": []}
        }
      ]
    ]
  },
  "style": "simple"
}
```

- comments 第一层 key 是 target_id；value 是评论串数组；每个评论串是评论数组。
- simple 风格下 content 是 SemiPlainContent；richtext 风格下 content 是 ContentBlock。
- 评论时间戳会转换为可读日期时间；selection、状态和引用字段会保留。
- `comments` 会为周期遍历到的每个 target 保留一个 target_id key；即使该对象没有评论，对应 value 也会是空的评论串数组。

## 注意事项

- 这是聚合查询，接口调用次数取决于周期下的 Objective、KeyResult 和 Progress 数量。
- +comment-detail 不接受 department-id-type，该接口参数由 shortcut 忽略。
- 该命令只读取评论，不会修改、解决或删除评论。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Cycle、Objective、KeyResult、Progress 和 Comment 的关系
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — ContentBlock 与 SemiPlainContent 格式
- [okr +cycle-detail](lark-okr-0.md#s-032ab2f6c5cb93e6) — 获取周期下的 Objective 和 KeyResult
- [okr +progress-list](lark-okr-0.md#s-61fa4c0c12279422) — 获取 Objective 或 KeyResult 下的 Progress
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-33d49c2c37ebe05a"></a>

## references/lark-okr-comment-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-get
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

根据评论 ID 获取单条 OKR 评论，查看评论正文、状态、评论对象、引用关系和划词信息。本 shortcut 适合用于在编辑评论后确认其最终状态。

## 推荐命令

```text
# 获取一条评论的简化正文和元数据。
lark-cli okr +comment-get --comment-id 7000000000000000001

# 获取原始 ContentBlock 格式的评论正文。
lark-cli okr +comment-get --comment-id 7000000000000000001 --style richtext

# 预览获取评论的 API 调用，不实际执行。
lark-cli okr +comment-get --comment-id 7000000000000000001 --dry-run
```

## 参数

| 参数           | 必填 | 默认值  | 说明                                                                                   |
|----------------|------|---------|----------------------------------------------------------------------------------------|
| --comment-id   | 是   | —       | 评论 ID，int64 正整数。                                                                |
| --user-id-type | 否   | open_id | open_id、union_id、user_id 或 user_key。                                               |
| --style        | 否   | simple  | simple 返回半纯文本格式，不涉及字体/颜色等信息时推荐使用；richtext 返回 ContentBlock。 |
| --dry-run      | 否   | —       | 预览 API 调用而不实际执行。                                                            |
| --format       | 否   | json    | 输出格式。                                                                             |

## 工作流程

1. 如果只有目标 ID，先用 [+comment-list](lark-okr-0.md#s-615dc4b66a768872) 或 [+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) 定位 comment-id。
2. 执行 +comment-get --comment-id "..."。
3. 根据后续操作检查 selection、status 和 ref_comment_id：selection.id 表示划词评论，status 为 solved 表示已解决，ref_comment_id 表示引用关系。

## 输出

```json
{
  "comment": {
    "id": "7000000000000000001",
    "target": {"target_type": "progress", "target_id": "3456789012345678901"},
    "commentator_id": "ou_xxx",
    "status": "open",
    "create_time": "2025-01-15 10:30:00",
    "update_time": "2025-01-15 10:30:00",
    "content": {"text": "进展不错", "mention": [], "docs": [], "images": []},
    "ref_comment_id": "7000000000000000000"
  },
  "style": "simple"
}
```

selection、solver_id、solved_time 和 ref_comment_id 按接口是否返回保留。

## 注意事项

- Objective/KeyResult 的划词评论通过 selection.id 归属于评论串；实体级评论没有 selection。
- 解决或重新打开请使用 [+comment-solve / +comment-reopen](lark-okr-0.md#s-5378ddbb443e95d4)。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment 字段与评论串规则
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — 评论正文格式
- [okr +comment-list](lark-okr-0.md#s-615dc4b66a768872) — 查询目标下的评论
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-615dc4b66a768872"></a>

## references/lark-okr-comment-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-list
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

分页获取单个 Cycle、Objective、KeyResult 或 Progress 下的评论。查询整个周期下所有评论时可使用 [+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69)。

## 推荐命令

```text
# 获取 Objective 下的第一页评论。
lark-cli okr +comment-list --target-type objective --target-id 2345678901234567890

# 使用上一页 token 获取 Progress 下的下一页评论。
lark-cli okr +comment-list --target-type progress --target-id 3456789012345678901 --page-size 100 --page-token "7000000000000000002"

# 以 richtext 输出 KeyResult 评论，但是仅预览请求，不实际获取。
lark-cli okr +comment-list --target-type key_result --target-id 4567890123456789012 --style richtext --dry-run
```

## 参数

| 参数           | 必填 | 默认值  | 说明                                                                                   |
|----------------|------|---------|----------------------------------------------------------------------------------------|
| --target-type  | 是   | —       | cycle、objective、key_result 或 progress。                                             |
| --target-id    | 是   | —       | 评论对象 ID，int64 正整数。                                                            |
| --page-size    | 否   | 100     | 每页数量，范围 1-100。                                                                 |
| --page-token   | 否   | ""      | 上一次响应中的 token；首页不传。                                                       |
| --user-id-type | 否   | open_id | open_id、union_id、user_id 或 user_key。                                               |
| --style        | 否   | simple  | simple 返回半纯文本格式，不涉及字体/颜色等信息时推荐使用；richtext 返回 ContentBlock。 |
| --dry-run      | 否   | —       | 预览 API 调用而不实际执行。                                                            |
| --format       | 否   | json    | 输出格式。                                                                             |

## 工作流程

1. 根据用户需求选择 target-type：周期用 cycle，目标用 objective，关键结果用 key_result，进展用 progress。
2. 如果缺少 ID，使用 [+cycle-list](lark-okr-0.md#s-fbe34eb1b143bef1)、[+cycle-detail](lark-okr-0.md#s-032ab2f6c5cb93e6) 或 [+progress-list](lark-okr-0.md#s-61fa4c0c12279422) 获取。
3. 执行 +comment-list --target-type "..." --target-id "..."。
4. has_more 为 true 且 page_token 非空时，将 page_token 原样作为下一次调用的 --page-token；不要自行解析或修改 token。

## 输出

```json
{
  "comments": [
    [
      {
        "id": "7000000000000000001",
        "target": {"target_type": "objective", "target_id": "2345678901234567890"},
        "commentator_id": "ou_xxx",
        "status": "open",
        "create_time": "2025-01-15 10:30:00",
        "update_time": "2025-01-15 10:30:00",
        "selection": {"id": "8000000000000000001", "selected_text": "提升核心接口稳定性"},
        "content": {"text": "请补充指标", "mention": [], "docs": [], "images": []}
      }
    ]
  ],
  "has_more": true,
  "page_token": "7000000000000000002",
  "style": "simple"
}
```

comments 是当前页按评论串分组的二维数组，不会自动拉取所有分页；simple 风格返回简单的半纯文本格式，richtext 风格返回原生 ContentBlock。

## 注意事项

- 实体级评论没有 selection；Objective/KeyResult 的划词评论带有 selection.id。
- 只对当前页内的评论进行评论串分组；如果同一评论串跨越分页边界，需结合相邻页自行合并，或使用 +comment-detail 获取整个周期的聚合结果。
- 评论串按首条评论的 create_time 升序排列，串内评论也按 create_time 升序排列；时间相同则按评论 ID 升序。
- 该命令是只读操作，不会改变评论状态。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment、评论串和 target 类型
- [okr +comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) — 聚合获取周期评论
- [okr +cycle-detail](lark-okr-0.md#s-032ab2f6c5cb93e6) — 获取 Objective 和 KeyResult ID
- [okr +progress-list](lark-okr-0.md#s-61fa4c0c12279422) — 获取 Progress ID
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-cc1bf6ee9bfe46b5"></a>

## references/lark-okr-comment-patch.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-patch
> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

修改指定评论的正文。评论目标、划词定位、引用关系则一经创建不可修改。只支持 user 身份。

`--content` 是业务必填项：OpenAPI schema 中该字段可能表现为可选，但实际修改评论必须提供非空正文。

## 推荐命令

```text
# 使用 simple 风格修改评论正文。
lark-cli okr +comment-patch --comment-id 7000000000000000004 --content '{"text":"更新后的评论"}'

# 使用 richtext 文件修改评论正文。
lark-cli okr +comment-patch --comment-id 7000000000000000004 --style richtext --content '@comment.json'

# 写入前预览修改评论的 API 调用，不实际执行。
lark-cli okr +comment-patch --comment-id 7000000000000000004 --content '{"text":"预览更新"}' --dry-run
```

## 参数

| 参数           | 必填 | 默认值  | 说明                                                                                                                          |
|----------------|------|---------|-------------------------------------------------------------------------------------------------------------------------------|
| --comment-id   | 是   | —       | 评论 ID，int64 正整数；可从 [+comment-list](lark-okr-0.md#s-615dc4b66a768872) 或 [+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) 获取。 |
| --content      | 是   | —       | 新正文；输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON），支持 @文件路径。                   |
| --style        | 否   | simple  | 输入/输出风格：simple 或 richtext。                                                                                           |
| --user-id-type | 否   | open_id | open_id、union_id、user_id 或 user_key。                                                                                      |
| --dry-run      | 否   | —       | 预览 API 调用而不实际执行。                                                                                                   |
| --format       | 否   | json    | 输出格式。                                                                                                                    |

## 工作流程

1. 使用 [+comment-list](lark-okr-0.md#s-615dc4b66a768872)、[+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) 或 [+comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) 确认 comment-id 和目标评论。
2. 准备 content：通常建议使用 simple 格式，需要精确控制 @用户的位置时，可以使用 richtext 格式，参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)
3. 执行 +comment-patch；真实写入前用 --dry-run 检查请求。
4. 如果要解决或重新打开评论，不要使用 patch，改用 [+comment-solve](lark-okr-0.md#s-5378ddbb443e95d4) 或 [+comment-reopen](lark-okr-0.md#s-5378ddbb443e95d4)。

## 输出

返回 JSON：

```json
{
  "comment": {
    "id": "7000000000000000004",
    "target": {"target_type": "progress", "target_id": "3456789012345678901"},
    "commentator_id": "ou_xxx",
    "status": "open",
    "create_time": "2025-01-15 10:30:00",
    "update_time": "2025-01-15 11:00:00",
    "content": {"text": "更新后的评论", "mention": [], "docs": [], "images": []}
  },
  "style": "simple"
}
```

simple 风格的 content 为 SemiPlainContent；richtext 风格的 content 为 ContentBlock。

## 注意事项

- patch 不会改变评论的 target、selection、ref_comment_id 或 status。
- simple 输入不支持 docs/images；需要富文本元素时使用 richtext。
- 空正文不允许提交；如需删除评论，请使用 [+comment-delete](lark-okr-0.md#s-658e56646727c3a5)，删除不可恢复。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment 字段与评论串规则
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — 评论正文格式
- [okr +comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) — 获取更新前后的评论
- [okr +comment-delete](lark-okr-0.md#s-658e56646727c3a5) — 永久删除评论
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-5378ddbb443e95d4"></a>

## references/lark-okr-comment-solve-reopen.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +comment-solve / +comment-reopen

> **前置条件：** 先阅读 [lark-shared/SKILL.md](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则；

解决/重新打开一条评论。实体级评论按单条评论处理；划词评论则是操作整个评论串。只支持 user 身份。

## 推荐命令

```text
# 解决实体级评论或整个划词评论串。
lark-cli okr +comment-solve --comment-id 7000000000000000004

# 重新打开已解决的实体级评论或划词评论串。
lark-cli okr +comment-reopen --comment-id 7000000000000000004

# 预览解决评论的状态变更请求，不实际执行。
lark-cli okr +comment-solve --comment-id 7000000000000000004 --dry-run
```

## 参数

| 参数           | 必填 | 默认值  | 说明                                                                                  |
|----------------|------|---------|---------------------------------------------------------------------------------------|
| --comment-id   | 是   | —       | 评论 ID，int64 正整数。可从 +comment-list、+comment-detail 或 +comment-get 获取。     |
| --user-id-type | 否   | open_id | open_id、union_id、user_id 或 user_key。                                              |
| --style        | 否   | simple  | affected_comments 的正文风格：simple（SemiPlainContent）或 richtext（ContentBlock）。 |
| --dry-run      | 否   | —       | 预览 API 调用而不实际执行。                                                           |
| --format       | 否   | json    | 输出格式。                                                                            |

## 工作流程

1. 使用 [+comment-list](lark-okr-0.md#s-615dc4b66a768872)、[+comment-detail](lark-okr-0.md#s-2e2dff7de68f0c69) 或 [+comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) 获取并确认 comment-id。
2. 检查评论是否属于划词串：如果返回有 selection.id，solve/reopen 会影响同一 selection.id 下的全部评论。
3. 根据用户动作选择 +comment-solve 或 +comment-reopen；先用 --dry-run 检查目标接口。
4. 执行后检查 affected_comments，确认实体级评论或整条评论串的状态变化范围。

## 输出

返回 JSON：

```json
{
  "affected_comments": [
    {
      "id": "7000000000000000004",
      "target": {
        "target_type": "objective",
        "target_id": "2345678901234567890"
      },
      "commentator_id": "ou_xxx",
      "status": "solved",
      "create_time": "2025-01-15 10:30:00",
      "update_time": "2025-01-15 11:30:00",
      "selection": {
        "id": "8000000000000000001",
        "selected_text": "提升核心接口稳定性"
      },
      "content": {
        "text": "请补充指标", "mention": [], "docs": [], "images": []
      }
    }
  ],
  "style": "simple"
}
```

- +comment-solve 成功后 affected_comments 的 status 通常为 solved；+comment-reopen 成功后通常为 open。
- simple 风格返回 SemiPlainContent；richtext 风格返回 ContentBlock。

## 注意事项

- 划词评论按评论串解决/重开，但 [+comment-delete](lark-okr-0.md#s-658e56646727c3a5) 仍然只删除单条评论。
- 解决不是删除，之后可以用 +comment-reopen 恢复；删除后不可恢复。
- 该操作是写操作，执行前应确认 comment-id 和目标动作。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) — OKR 命令、路由和通用约定
- [OKR 实体定义](lark-okr-0.md#s-454dba25e45d198c) — Comment、评论串和状态规则
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — affected_comments 正文格式
- [okr +comment-get](lark-okr-0.md#s-33d49c2c37ebe05a) — 获取状态和 selection.id
- [okr +comment-delete](lark-okr-0.md#s-658e56646727c3a5) — 永久删除单条评论
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) — 认证、身份、权限和安全规则


<a id="s-a9c3d82fa50f75dd"></a>

## references/lark-okr-contentblock.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# OKR ContentBlock 富文本格式

OKR 的 Objective、KeyResult 中的 content/notes 字段使用 `ContentBlock` 富文本格式。本文档描述其结构和使用方式。

## 两种输入输出风格

OKR shortcuts 支持 `--style` 标志控制 content/notes 字段的输入输出格式：

| `--style` 值  | 说明                                                                 | 适用场景                     |
|--------------|--------------------------------------------------------------------|--------------------------|
| `simple`（默认） | 半纯文本格式 `SemiPlainContent`，简化的 JSON 结构，仅包含 text、mention、docs、images | 大多数场景，简单易用               |
| `richtext`   | 原始 `ContentBlock` 富文本格式，完整的块结构和样式信息                                | 需要精确控制@提及用户位置、包含图片/文档链接时 |

**重要**：输入时严格根据 `--style` 值验证格式，不会自动检测。输出时读操作（如 `+cycle-detail`、`+progress-get`）根据 `--style` 返回对应格式。

## ContentBlock 结构概览

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "style": {
          "list": {
            "list_type": "bullet",
            "indent_level": 0,
            "number": 1
          }
        },
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "Hello World",
              "style": {
                "bold": true,
                "strike_through": false,
                "back_color": {
                  "red": 255,
                  "green": 0,
                  "blue": 0,
                  "alpha": 1
                },
                "text_color": {
                  "red": 0,
                  "green": 255,
                  "blue": 0,
                  "alpha": 1
                },
                "link": {
                  "url": "https://example.com"
                }
              }
            }
          },
          {
            "paragraph_element_type": "docsLink",
            "docs_link": {
              "url": "https://larkoffice.com/docx/xxx",
              "title": "Lark Document"
            }
          },
          {
            "paragraph_element_type": "mention",
            "mention": {
              "user_id": "ou_xxx"
            }
          }
        ]
      }
    },
    {
      "block_element_type": "gallery",
      "gallery": {
        "images": [
          {
            "file_token": "file_xxx",
            "src": "https://...",
            "width": 800,
            "height": 600
          }
        ]
      }
    }
  ]
}
```

## 类型定义

### ContentBlock

根级别内容块。

| 字段       | 类型                      | 说明      |
|----------|-------------------------|---------|
| `blocks` | `ContentBlockElement[]` | 内容块元素数组 |

### ContentBlockElement

内容块元素，支持段落或图库。

| 字段                   | 类型                 | 说明                                         |
|----------------------|--------------------|--------------------------------------------|
| `block_element_type` | `BlockElementType` | 块类型：`paragraph` \| `gallery`               |
| `paragraph`          | `ContentParagraph` | 段落内容（当 `block_element_type="paragraph"` 时） |
| `gallery`            | `ContentGallery`   | 图库内容（当 `block_element_type="gallery"` 时）   |

### ContentParagraph

段落内容。

| 字段         | 类型                          | 说明          |
|------------|-----------------------------|-------------|
| `style`    | `ContentParagraphStyle`     | 段落样式（列表类型等） |
| `elements` | `ContentParagraphElement[]` | 段落内元素数组     |

### ContentParagraphElement

段落内元素，支持文本、文档链接、提及。

| 字段                       | 类型                     | 说明                                        |
|--------------------------|------------------------|-------------------------------------------|
| `paragraph_element_type` | `ParagraphElementType` | 元素类型：`textRun` \| `docsLink` \| `mention` |
| `text_run`               | `ContentTextRun`       | 文本内容                                      |
| `docs_link`              | `ContentDocsLink`      | 飞书文档链接                                    |
| `mention`                | `ContentMention`       | 用户提及                                      |

### ContentTextRun

文本块。

| 字段      | 类型                 | 说明   |
|---------|--------------------|------|
| `text`  | `string`           | 文本内容 |
| `style` | `ContentTextStyle` | 文本样式 |

### ContentTextStyle

文本样式。

| 字段               | 类型             | 说明    |
|------------------|----------------|-------|
| `bold`           | `boolean`      | 是否粗体  |
| `strike_through` | `boolean`      | 是否删除线 |
| `back_color`     | `ContentColor` | 背景颜色  |
| `text_color`     | `ContentColor` | 文字颜色  |
| `link`           | `ContentLink`  | 链接    |

### ContentColor

颜色。

| 字段      | 类型        | 说明           |
|---------|-----------|--------------|
| `red`   | `int32`   | 红色通道 (0-255) |
| `green` | `int32`   | 绿色通道 (0-255) |
| `blue`  | `int32`   | 蓝色通道 (0-255) |
| `alpha` | `float64` | 透明度 (0-1)    |

### ContentParagraphStyle

段落样式。

| 字段     | 类型            | 说明   |
|--------|---------------|------|
| `list` | `ContentList` | 列表样式 |

### ContentList

列表样式。

| 字段             | 类型         | 说明                                                                  |
|----------------|------------|---------------------------------------------------------------------|
| `list_type`    | `ListType` | 列表类型：`bullet` \| `number` \| `checkBox` \| `checkedBox` \| `indent` |
| `indent_level` | `int32`    | 缩进层级                                                                |
| `number`       | `int32`    | 序号（当 `list_type="number"` 时）                                        |

### ContentGallery

图片块。目前仅有进展记录中的富文本支持展示图片。

由于 OKR 应用中进展页面的布局排版限制，一个 ContentGallery 元素中**仅可放置一个图片元素**，需要插入多张图片时需使用多个 ContentGallery 元素
(同一个 ContentGallery 中添加多个 image 会导致这些图片在狭窄的横向排版空间中互相挤占，效果很差)

| 字段       | 类型                   | 说明    |
|----------|----------------------|-------|
| `images` | `ContentImageItem[]` | 图片项数组 |

### ContentImageItem

图片项。

| 字段           | 类型        | 说明       |
|--------------|-----------|----------|
| `file_token` | `string`  | 文件 token |
| `src`        | `string`  | 图片 URL   |
| `width`      | `float64` | 宽度       |
| `height`     | `float64` | 高度       |

> **如何获取 `file_token`？** 使用 [`+upload-image`](lark-okr-0.md#s-7866ce90b57ba3f6) 命令上传本地图片，返回的 `file_token` 可用于构建 `ContentGallery` 图片块。

### ContentDocsLink

飞书文档链接。

| 字段      | 类型       | 说明     |
|---------|----------|--------|
| `url`   | `string` | 链接 URL |
| `title` | `string` | 链接标题   |

### ContentMention

提及。

| 字段        | 类型       | 说明    |
|-----------|----------|-------|
| `user_id` | `string` | 用户 ID |

### ContentLink

链接。

| 字段    | 类型       | 说明     |
|-------|----------|--------|
| `url` | `string` | 链接 URL |

## SemiPlainContent 半纯文本格式

`SemiPlainContent` 是 `ContentBlock` 的简化、有损表示形式，适用于大多数不需要复杂格式的场景。

### 结构

```json
{
  "text": "任务一 @{ou_zhangsan} ，任务二 @{ou_lisi} ",
  "mention": ["ou_zhangsan", "ou_lisi"],
  "docs": [
    {
      "title": "产品需求文档",
      "url": "https://larkoffice.com/docx/xxx"
    }
  ],
  "images": [
    "https://example.com/image.png"
  ]
}
```

### 类型定义

| 字段        | 类型               | 说明                                                                                                        |
|-----------|------------------|-----------------------------------------------------------------------------------------------------------|
| `text`    | `string`         | 纯文本内容（必填，不能为空）。**输出时**包含 ` @{userID} ` 占位符以保留提及的位置上下文；**输入时** `@{...}` 占位符会被自动 strip 掉，只识别 `mention` 字段内容 |
| `mention` | `string[]`       | 用户 ID 列表（可选），与 text 中的 `@{userID}` 占位符一一对应，输入时按顺序转换为 mention 元素**置于文本末尾**                                 |
| `docs`    | `SemiPlainDoc[]` | 文档列表（仅输出时包含，输入时 simple 风格不支持）                                                                             |
| `images`  | `string[]`       | 图片 URL 列表（仅输出时包含，输入时 simple 风格不支持）                                                                        |

### SemiPlainDoc

| 字段      | 类型       | 说明     |
|---------|----------|--------|
| `title` | `string` | 文档标题   |
| `url`   | `string` | 文档 URL |

### 双向转换说明

- **ContentBlock → SemiPlainContent**（输出时）：提取纯文本、提及用户、文档链接和图片 URL，丢弃格式信息（粗体、列表、颜色等）。**提及的位置信息通过 ` @{userID} ` 占位符保留在 text 中**，同时 userID 也会被收集到 mention 数组中
- **SemiPlainContent → ContentBlock**（输入时）：自动 strip 掉 text 中的 `@{...}` 占位符，然后将 text 和 mention 合并为单个段落，mention 按顺序附加在文本末尾。docs 和 images 在输入时被忽略（simple 风格不支持）

## 使用示例

### 示例 0：--style simple 半纯文本格式

```json
{
  "text": "提升用户满意度",
  "mention": ["ou_123"]
}
```

使用方式：
```text
lark-cli okr +patch --level objective --style simple --target-id 123 --content '{"text":"提升用户满意度","mention":["ou_123"]}'
```

### 示例 1：简单文本段落（richtext 风格）

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "提升用户满意度"
            }
          }
        ]
      }
    }
  ]
}
```

### 示例 2：带格式的文本段落

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "Q2 目标",
              "style": {
                "bold": true
              }
            }
          },
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": " - 提升产品质量"
            }
          }
        ]
      }
    }
  ]
}
```

### 示例 3：带列表的段落

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "style": {
          "list": {
            "list_type": "bullet",
            "indent_level": 0
          }
        },
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "完成功能开发"
            }
          }
        ]
      }
    },
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "style": {
          "list": {
            "list_type": "bullet",
            "indent_level": 0
          }
        },
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "进行用户测试"
            }
          }
        ]
      }
    }
  ]
}
```

### 示例 4：带用户提及和图片（仅进展记录支持）的段落

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "elements": [
          {
            "paragraph_element_type": "mention",
            "mention": {
              "user_id": "ou_example_user"
            }
          },
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": " 请关注此进度并查看以下图片"
            }
          }
        ]
      }
    },
    {
      "block_element_type": "gallery",
      "gallery": {
        "images": [
          {
            "file_token": "img_example_token",
            "src": "https://example.com/image.png",
            "width": 800,
            "height": 600
          }
        ]
      }
    }
  ]
}
```


<a id="s-6f590b5bfd67b6da"></a>

## references/lark-okr-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +create

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

创建单个 OKR 目标（Objective）或关键结果（Key Result）。这是单条写入场景的首选 shortcut；如果需要一次创建多个 Objective 及其 KR，可使用 [`+batch-create`](lark-okr-0.md#s-ab36ffb3c1ee32b5)。

## 推荐命令

```text
# 在指定周期下创建一个 Objective（默认 simple 风格）
lark-cli okr +create \
  --level objective \
  --cycle-id 7000000000000000001 \
  --content '{"text":"提升北极星指标","mention":["ou_xxxxxxxx"]}' \
  --notes '{"text":"重点关注活跃用户和转化漏斗"}' \
  --as user

# 在已有 Objective 下创建一个 KR
lark-cli okr +create \
  --level key-result \
  --objective-id 7000000000000000002 \
  --content '{"text":"季度留存率提升到 45%"}' \
  --as user

# 使用 richtext 风格创建 Objective（完整 ContentBlock JSON）
lark-cli okr +create \
  --level objective \
  --cycle-id 7000000000000000001 \
  --style richtext \
  --content '{"blocks":[{"block_element_type":"paragraph","paragraph":{"elements":[{"paragraph_element_type":"textRun","text_run":{"text":"建立跨部门协作机制"}}]}}]}' \
  --as user

# 预览 API 调用而不实际执行
lark-cli okr +create \
  --level key-result \
  --objective-id 7000000000000000002 \
  --content '{"text":"完成 3 次核心流程优化"}' \
  --dry-run \
  --as user
```

## 参数

| 参数               | 必填 | 默认值       | 说明                                                                                                                 |
|------------------|----|-----------|--------------------------------------------------------------------------------------------------------------------|
| `--level`        | 是  | —         | 创建层级：`objective`（创建目标）\| `key-result`（在已有目标下创建 KR）                                                                 |
| `--cycle-id`     | 条件 | —         | OKR 周期 ID（int64 类型）。当 `--level=objective` 时**必填**。                                                                 |
| `--objective-id` | 条件 | —         | Objective ID（int64 类型）。当 `--level=key-result` 时**必填**。                                                             |
| `--style`        | 否  | `simple`  | 内容输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。 |
| `--content`      | 是  | —         | 内容。根据 `--style` 指定格式。支持 `@文件路径` 从文件读取或 `-` 从 stdin 读取。                                                             |
| `--notes`        | 否  | —         | Objective 备注，仅 `--level=objective` 支持。根据 `--style` 指定格式，支持 `@文件路径` 或 `-` 从 stdin 读取。                               |
| `--category-id`  | 否  | —         | Objective 分类 ID，仅 `--level=objective` 支持。通常不需要传入，见下方“分类提示”。                                                        |
| `--user-id-type` | 否  | `open_id` | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`。影响 mention 中用户 ID 的解释方式。                                             |
| `--dry-run`      | 否  | —         | 预览 API 调用而不实际执行。                                                                                                   |
| `--format`       | 否  | `json`    | 输出格式。                                                                                                              |

> **分类提示**：当用户明确要求设置 Objective 分类，或创建 Objective 返回 `invalid parameters` 且怀疑租户强制开启分类时，可以配置 --category-id 参数进行创建。先运行 `lark-cli okr categories list --as user` 查看可用分类，然后选择一个语义合适且 `enabled=true` 的分类 ID 作为 `--category-id`。分类创建后可以再调整；不必因为分类选择停下等待用户确认。

## 输入格式

### `--style simple`（默认）

推荐大多数创建场景使用 `simple` 风格。`--content` 和 `--notes` 都使用 `SemiPlainContent` JSON：

```json
{
  "text": "提升北极星指标",
  "mention": ["ou_xxxxxxxx"]
}
```

规则：

- `text` 必填，且不能为空白字符串
- `mention` 可选；如果传入，数组中的每个用户 ID 都不能为空字符串
- `--notes` 仅适用于 Objective；创建 KR 时传 `--notes` 会报错
- 同一条命令只有一个 flag 可以使用 `-` 读取 stdin；如果 `--content -`，`--notes` 请使用内联 JSON 或 `@文件路径`

### `--style richtext`

当你需要精确控制段落结构、插入文档链接，或使用完整富文本块结构时，使用 `richtext` 风格：

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "建立跨部门协作机制"
            }
          }
        ]
      }
    }
  ]
}
```

规则：

- `blocks` 至少需要有一个非空段落或图片块
- 不能传空 `blocks`，也不能传只有空段落元素的内容
- 更多结构说明见 [ContentBlock 富文本格式](lark-okr-0.md#s-a9c3d82fa50f75dd)

## 工作流程

1. 如果要创建 Objective，先使用 `+cycle-list` 获取目标周期的 `cycle_id`。
2. 如果要给已有 Objective 新增 KR，先通过 `+cycle-detail` 或其他 OKR 查询命令拿到 `objective_id`。
3. 选择输入风格：
   - **推荐**：`simple`，适合普通文本和 mention。
   - 需要复杂富文本时：`richtext`。
4. 执行 `lark-cli okr +create ...`。
5. 报告结果：
   - 创建 Objective 时返回新的 `objective_id`
   - 创建 KR 时返回新的 `key_result_id`，并附带父 `objective_id`

## Dry-run 对应接口

- `--level=objective`：
  - `POST /open-apis/okr/v2/cycles/:cycle_id/objectives`
- `--level=key-result`：
  - `POST /open-apis/okr/v2/objectives/:objective_id/key_results`

## 输出

### 创建 Objective 成功

```json
{
  "level": "objective",
  "objective_id": "7000000000000000002"
}
```

### 创建 KR 成功

```json
{
  "level": "key-result",
  "objective_id": "7000000000000000002",
  "key_result_id": "7000000000000000003"
}
```

## 常见错误与处理

- `--level=objective` 但未传 `--cycle-id`
  - 补充有效的周期 ID
- `--level=key-result` 但未传 `--objective-id`
  - 补充已有 Objective 的 ID
- `--content` 为空、不是合法 JSON，或内容结构为空
  - 按 `--style` 对应格式修正输入
- 在 `simple` 风格中传了 `docs` 或 `images`
  - 改用 `--style richtext`，或移除这些字段

## 何时用 +create，何时用 +batch-create

| 命令 | 适用场景 |
|------|----------|
| `+create` | 创建单个 Objective，或向已有 Objective 新增单个 KR |
| `+batch-create` | 一次创建多个 Objective，并可同时为每个 Objective 创建多个 KR |

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令
- [OKR 业务实体](lark-okr-0.md#s-454dba25e45d198c) -- Objective、KR、周期等基础概念
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- content/notes 字段的另一种输入风格，支持完整富文本格式
- [okr +batch-create](lark-okr-0.md#s-ab36ffb3c1ee32b5) -- 批量创建多个 Objective / KR
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-032ab2f6c5cb93e6"></a>

## references/lark-okr-cycle-detail.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +cycle-detail

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

列出指定 OKR 周期下的所有目标及其关键结果。

## 推荐命令

```text
# 列出指定周期的目标和关键结果（默认 simple 风格，半纯文本格式，推荐使用，更简洁）
lark-cli okr +cycle-detail --cycle-id 1234567890123456789

# 列出指定周期的目标和关键结果（richtext 风格，原始 ContentBlock JSON）
lark-cli okr +cycle-detail --cycle-id 1234567890123456789 --style richtext

# 预览 API 调用而不实际执行
lark-cli okr +cycle-detail --cycle-id 1234567890123456789 --dry-run
```

## 参数

| 参数           | 必填 | 默认值      | 说明                                                                                                                          |
|--------------|----|----------|-----------------------------------------------------------------------------------------------------------------------------|
| `--cycle-id` | 是  | —        | OKR 周期 ID（int64 类型）。从 `+cycle-list` 获取。                                                                                     |
| `--style`    | 否  | `simple` | 输出风格：`simple`（半纯文本格式，不涉及字体/颜色等信息时推荐使用） \| `richtext`（原始 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。 |
| `--dry-run`  | 否  | —        | 预览 API 调用而不实际执行。                                                                                                            |
| `--format`   | 否  | `json`   | 输出格式。                                                                                                                       |

## 工作流程

1. 使用 `lark-cli okr +cycle-list` 获取 OKR 周期 ID。
2. 执行 `lark-cli okr +cycle-detail --cycle-id "123456"`。
3. 报告结果：找到的目标数量、每个目标的 ID、分数、权重及其关键结果。

## 输出

返回 JSON：

```json
{
  "cycle_id": "1234567890123456789",
  "objectives": [
    {
      "id": "2345678901234567890",
      "create_time": "2025-01-01 00:00:00",
      "update_time": "2025-01-15 12:00:00",
      "owner": {
        "owner_type": "user",
        "user_id": "ou_xxx"
      },
      "cycle_id": "1234567890123456789",
      "position": 0,
      "score": 0.75,
      "weight": 1.0,
      "deadline": "2025-06-30 23:59:59",
      "category_id": "cat_456",
      "content": "{...}",
      "notes": "{...}",
      "key_results": [
        {
          "id": "3456789012345678901",
          "create_time": "2025-01-01 00:00:00",
          "update_time": "2025-01-15 12:00:00",
          "owner": {
            "owner_type": "user",
            "user_id": "ou_xxx"
          },
          "objective_id": "2345678901234567890",
          "position": 0,
          "score": 0.8,
          "weight": 0.5,
          "deadline": "2025-06-30 23:59:59",
          "content": "{...}"
        }
      ]
    }
  ],
  "total": 1
}
```

其中，content 和 notes 字段格式由 `--style` 控制：
- `--style simple`（默认）：`SemiPlainContent` 对象，包含 `text`、`mention`、`docs` 字段
- `--style richtext`：JSON 字符串，为 OKR ContentBlock 富文本格式

请参考 [lark-okr-contentblock.md](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解两种格式的详细信息。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-fbe34eb1b143bef1"></a>

## references/lark-okr-cycle-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +cycle-list

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

列出指定用户的一页 OKR 周期，支持外部控制翻页和可选的时间范围后置过滤。

## 推荐命令

```text
# 获取用户周期第一页 (默认页大小为 100 按时间倒序排列，一般不用翻页)
lark-cli okr +cycle-list --user-id "ou_xxx"

# 获取下一页
lark-cli okr +cycle-list --user-id "ou_xxx" --page-size 100 --page-token "7000000000000000002"

# 使用特定的用户 ID 类型列出周期
lark-cli okr +cycle-list --user-id "xxx" --user-id-type user_id

# 列出当前返回页中与时间范围重叠的周期（例如 2025-01 到 2025-06）
lark-cli okr +cycle-list --user-id "ou_xxx" --time-range "2025-01--2025-06"

# 预览 API 调用而不实际执行
lark-cli okr +cycle-list --user-id "ou_xxx" --dry-run
```

## 参数

| 参数               | 必填 | 默认值       | 说明                                                               |
|------------------|----|-----------|------------------------------------------------------------------|
| `--user-id`      | 是  | —         | OKR 所有者的用户 ID                                                    |
| `--user-id-type` | 否  | `open_id` | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                    |
| `--time-range`   | 否  | —         | 后置筛选条件：先按 `--page-size`/`--page-token` 请求一页，再在本地保留与该时间范围重叠的周期。格式：`YYYY-MM--YYYY-MM`（例如 `2025-01--2025-06`）。 |
| `--page-size`    | 否  | `100`     | 每页数量，范围 `1-100`。                                               |
| `--page-token`   | 否  | `""`      | 上一次响应中的 `page_token`，留空表示第一页。                            |
| `--dry-run`      | 否  | —         | 预览 API 调用而不实际执行。                                                 |
| `--format`       | 否  | `json`    | 输出格式。                                                            |

## 工作流程

1. 获取目标用户的 `open_id`（或其他 ID 类型）。如果用户说"我的 OKR 周期"，先通过 `lark-cli contact +get-user` 获取当前用户的
   ID。
2. 执行 `lark-cli okr +cycle-list --user-id "ou_xxx" --page-size 100`，可选择使用 `--time-range`。
3. 如果响应中 `has_more=true`，继续用返回的 `page_token` 调用下一页。
4. 报告结果：每个周期的 ID、开始/结束时间和状态。

`--time-range` 是后置筛选条件，不会改变服务端分页窗口。也就是说，命令会先获取指定页，再过滤该页中的周期；如果需要完整时间范围结果，需要按 `has_more`/`page_token` 逐页拉取并合并。

## 输出

返回 JSON：

```json
{
  "cycles": [
    {
      "id": "1234567890123456789",
      "start_time": "2025-01-01 00:00:00",
      "end_time": "2025-06-30 00:00:00",
      "cycle_status": "normal"
    }
  ],
  "has_more": true,
  "page_token": "7000000000000000002",
  "current_active_cycles": [
    {
      "id": "1234567890123456789",
      "start_time": "2025-01-01 00:00:00",
      "end_time": "2025-06-30 00:00:00",
      "cycle_status": "normal"
    }
  ]
}
```

在这个周期信息中，这些字段值得关注：

- `id` 是这个周期的 ID，你通常需要用它在之后使用 `okr +cycle-detail` 获取 OKR 内容详情
- `has_more` 和 `page_token` 用于外部控制翻页；`has_more=true` 时，用 `--page-token` 原样传入本次返回的 `page_token` 获取下一页。
- `start_time` `end_time` 是周期的起止时间，总是从某个月1日开始，直到此月或之后某月的最后一日结束。
    - 在 OKR 系统中，我们只关注这个时间的年月部分，如 "2025-01-01开始，2025-06-30结束" 的周期被称作 "2025 年 1-6 月" 周期，而
      "2025-01-01开始，2025-01-31结束" 的周期被称作 "2025 年 1 月"周期。
    - 如果一个周期从某年1月1日开始，某年12月31日结束，则它是这一年的年度周期，如 "2025-01-01开始，2025-12-31结束" 的周期就是
      "2025 年" 的年度周期
- `cycle_status` 为周期状态值，参见下文。
- `current_active_cycles` 是当前生效的周期列表，不过根据用户的周期设置，可能会出现为空的场景。

如果需要获取周期的创建时间/总分等信息，可以通过原生 API `okr cycles list` 获取。

### 周期状态值

| 值         | 说明       |
|-----------|----------|
| `default` | 默认状态 (0) |
| `normal`  | 生效 (1)   |
| `invalid` | 失效 (2)   |
| `hidden`  | 隐藏 (3)   |

在 OKR 系统中，default/normal 状态下的周期当前正常生效，invalid 状态下的周期已失效但通常仍然可以填写，hidden 状态下的周期隐藏不可见。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-454dba25e45d198c"></a>

## references/lark-okr-entities.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# OKR 实体定义

本文档描述飞书 OKR API (`/open-apis/okr/v2`) 中涉及的核心实体及其字段定义。

## 实体关系概览

```
Cycle (用户周期)
  └── Objective (目标)
        ├── KeyResult (关键结果)
        │     └── Indicator (指标)
        │     └── list<Progress> (进展记录列表)
        │     └── list<Comment> (评论列表)
        └── Indicator (指标)
        └── list<Progress> (进展记录列表)
        └── list<Comment> (评论列表)

Cycle、Progress 也可以直接挂载 Comment。
Alignment (对齐关系): Objective ↔ Objective
Category (分类): Objective 的分组标签
```

---

## Owner (所有者)

所有者标识 OKR 实体的归属，目前仅支持用户类型。

| 字段           | 类型       | 必填 | 说明                                            |
|--------------|----------|----|-----------------------------------------------|
| `owner_type` | `string` | 是  | 所有者类型，通常为 `"user"`。                           |
| `user_id`    | `string` | 否  | 员工 ID，类型由请求参数 `user_id_type` 决定（默认 `open_id`） |

---

## Cycle (用户周期)

用户周期是 OKR 的顶层容器，代表一个时间段内的所有目标与关键结果。

| 字段                | 类型        | 必填 | 说明                                         |
|-------------------|-----------|----|--------------------------------------------|
| `id`              | `string`  | 是  | 用户周期 ID                                    |
| `create_time`     | `string`  | 是  | 创建时间                                       |
| `update_time`     | `string`  | 是  | 更新时间                                       |
| `tenant_cycle_id` | `string`  | 是  | 租户周期 ID（同一周期在不同用户下有不同的用户周期 ID，但租户周期 ID 相同） |
| `owner`           | `Owner`   | 是  | 所有者                                        |
| `start_time`      | `string`  | 是  | 周期开始时间。总是从某月1日开始                           |
| `end_time`        | `string`  | 是  | 周期结束时间。到某月最后一日结束                           |
| `cycle_status`    | `integer` | 否  | 周期状态，见下表                                   |
| `score`           | `number`  | 否  | 周期分数，范围 [0, 1]，支持一位小数                      |

### 常用术语

- **当前周期**: 指周期的 start_time/end_time
  指周期的 start_time / end_time 所在的时间段与当前时间重叠的周期（即： start_time <= 当前时间 且 end_time >= 当前时间）。
  注意：时间重叠是判断当前周期的首要且必须的硬性条件，绝对不能仅仅根据 cycle_status == 1 去判断。
  如果有多个符合时间重叠标准的周期，再在这些包含当前时间的周期中过滤，保留周期状态为 default (0) 或 normal (1)
  的周期。如果仍然有多个，则选择其中较新的一个。当用户提及“上一个周期”，“下一个周期”一类的表述时，通常是以当前周期为准计算。
    - 如果用户没有提及，那么当前周期一般不考虑年度周期（起止时间从 01-01 至 12-31 的周期）
- **所有者**: 绝大多数所有者都是用户，少部分租户启用了“团队OKR”功能，所有者可能是部门。用户身份下，只能编辑所有者为当前用户的
  OKR。

### 周期状态 (cycle_status)

| 值 | 常量名       | 说明          |
|---|-----------|-------------|
| 0 | `default` | 默认状态        |
| 1 | `normal`  | 生效中         |
| 2 | `invalid` | 已失效（通常仍可填写） |
| 3 | `hidden`  | 已隐藏（不可见）    |

> **SHORTCUT：** `okr +cycle-list` [lark-okr-cycle-list.md](lark-okr-0.md#s-fbe34eb1b143bef1) 获取用户的周期列表，可按时间筛选
>
> **API：** `cycles.list`

---

## Objective (目标)

目标是 OKR 中的 "O"，属于某个用户周期，可包含多个关键结果。

| 字段            | 类型             | 必填 | 说明                                                      |
|---------------|----------------|----|---------------------------------------------------------|
| `id`          | `string`       | 是  | 目标 ID                                                   |
| `create_time` | `string`       | 是  | 创建时间，毫秒时间戳，shortcut 会将其解析为日期时间                          |
| `update_time` | `string`       | 是  | 更新时间，毫秒时间戳，shortcut 会将其解析为日期时间                          |
| `owner`       | `Owner`        | 是  | 所有者                                                     |
| `cycle_id`    | `string`       | 是  | 所属用户周期 ID                                               |
| `position`    | `integer`      | 是  | 排序序号，从 1 开始，范围 [1, 100]                                 |
| `content`     | `ContentBlock` | 否  | 目标内容（富文本），见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd) |
| `score`       | `number`       | 否  | 目标分数，范围 [0, 1]，支持一位小数                                   |
| `notes`       | `ContentBlock` | 否  | 目标备注（富文本），见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd) |
| `weight`      | `number`       | 否  | 目标权重，范围 [0, 1]，支持三位小数                                   |
| `deadline`    | `string`       | 否  | 截止时间，毫秒时间戳，shortcut 会将其解析为日期时间                          |
| `category_id` | `string`       | 否  | 所属分类 ID                                                 |

> **SHORTCUT：**
> - `okr +cycle-detail` [lark-okr-cycle-detail.md](lark-okr-0.md#s-032ab2f6c5cb93e6) 获取某个用户周期下的全部目标和关键结果。时间相关的字段会以日期时间格式解析
>
> **API：**
> - `cycle.objectives.list` — 获取周期下的目标列表
> - `objectives.get` — 获取单个目标
> - `cycle.objectives.create` — 创建目标
> - `objectives.delete` — 删除目标
> - `cycles.objectives_position` — 更新周期下的目标排序
> - `cycles.objectives_weight` — 更新周期下的目标权重

---

## KeyResult (关键结果)

关键结果是 OKR 中的 "KR"，属于某个目标，描述目标的可衡量成果。

| 字段             | 类型             | 必填 | 说明                                                        |
|----------------|----------------|----|-----------------------------------------------------------|
| `id`           | `string`       | 是  | 关键结果 ID                                                   |
| `create_time`  | `string`       | 是  | 创建时间，毫秒时间戳                                                |
| `update_time`  | `string`       | 是  | 修改时间，毫秒时间戳                                                |
| `owner`        | `Owner`        | 是  | 所有者                                                       |
| `objective_id` | `string`       | 是  | 所属目标 ID                                                   |
| `position`     | `integer`      | 是  | 排序序号，从 1 开始，范围 [1, 100]                                   |
| `content`      | `ContentBlock` | 否  | 关键结果内容（富文本），见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd) |
| `score`        | `number`       | 否  | 关键结果分数，范围 [0, 1]，支持一位小数                                   |
| `weight`       | `number`       | 否  | 权重，范围 [0, 1]，支持三位小数                                       |
| `deadline`     | `string`       | 否  | 截止时间，毫秒时间戳                                                |

> **API：**
> - `objective.key_results.list` — 获取目标下的关键结果列表
> - `key_results.get` — 获取单个关键结果
> - `key_results.patch` — 更新关键结果
> - `key_results.delete` — 删除关键结果
> - `objectives.key_results_position` — 更新目标下的关键结果排序
> - `objectives.key_results_weight` — 更新目标下的关键结果权重

---

## Progress (进展记录)

进展记录挂载在目标（Objective）或关键结果（Key Result）上，用于记录阶段性进展内容与进度百分比。每条进展记录包含富文本内容和可选的进度率。

| 字段              | 类型             | 必填 | 说明                                                      |
|-----------------|----------------|----|---------------------------------------------------------|
| `progress_id`   | `string`       | 是  | 进展记录 ID（int64，正整数）                                      |
| `modify_time`   | `string`       | 是  | 最后修改时间，毫秒时间戳，shortcut 会将其解析为日期时间                        |
| `content`       | `ContentBlock` | 否  | 进展内容（富文本），见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd) |
| `progress_rate` | `ProgressRate` | 否  | 进度率，包含百分比和状态                                            |

### ProgressRate (进度率)

| 字段        | 类型       | 必填 | 说明                                                                                                                           |
|-----------|----------|----|------------------------------------------------------------------------------------------------------------------------------|
| `percent` | `number` | 否  | 进度百分比，范围 [-99999999999, 99999999999]。百分比的取值通常在 0-100，但允许超过此范围，以表示超额完成或负增长等情况。挂载的目标或关键结果的量化指标不使用百分比单位时，以这个字段更新当前值。系统内最多保留两位小数 |
| `status`  | `string` | 否  | 进度状态，shortcut 返回可读字符串，见下表                                                                                                    |

### 进度状态 (progress_rate.status)

| 值         | 常量名 | 说明    |
|-----------|-----|-------|
| `normal`  | 正常  | 进展正常  |
| `overdue` | 逾期  | 进展逾期  |
| `done`    | 已完成 | 进展已完成 |

### 创建进展记录时的参数

创建进展记录时，除了 `content` 外，还需要指定这条进展记录挂载的对应目标或关键结果：

| 字段              | 类型             | 必填 | 说明                                                      |
|-----------------|----------------|----|---------------------------------------------------------|
| `content`       | `ContentBlock` | 是  | 进展内容（富文本），见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd) |
| `target_id`     | `string`       | 是  | 目标 ID 或关键结果 ID                                          |
| `target_type`   | `integer`      | 是  | 目标类型：`2`=目标（Objective），`3`=关键结果（KeyResult）              |
| `progress_rate` | `ProgressRate` | 否  | 进度率，可设置 `percent` 和 `status`                            |
| `source_title`  | `string`       | 否  | 来源标题，用于在 OKR 界面中显示进展来源                                  |
| `source_url`    | `string`       | 否  | 来源 URL，用于在 OKR 界面中显示进展来源链接                              |

> **SHORTCUT：**
> - `okr +progress-get` [lark-okr-progress-get.md](lark-okr-0.md#s-3138ddb2f8520874) 获取单条进展记录
> - `okr +progress-create` [lark-okr-progress-create.md](lark-okr-0.md#s-ffc7d40e98f5e2f6) 为目标或关键结果创建进展记录
> - `okr +progress-update` [lark-okr-progress-update.md](lark-okr-0.md#s-5f8c6e73eb82723b) 更新进展记录内容
> - `okr +progress-delete` [lark-okr-progress-delete.md](lark-okr-0.md#s-38f007bf25a4da26) 删除进展记录
> - `okr +progress-list` [lark-okr-progress-list.md](lark-okr-0.md#s-61fa4c0c12279422) 获取目标/关键结果下的进展记录

---

## Comment (评论)

评论可以挂载在 Cycle、Objective、KeyResult 或 Progress 上，用于对 OKR 实体或正文中的一段文字进行讨论。评论分为实体级评论和划词评论两种：

- **实体级评论**：直接附着在 Cycle 或 Progress 上。一条评论就是一个评论项，solve/reopen 只影响该评论。
- **划词评论**：附着在 Objective 或 KeyResult 的正文选区上，带有 `selection`。同一个 `selection.id`
  下的评论属于同一个评论串；solve/reopen 按评论串处理，但 delete 仍然只删除指定的一条评论。

### Comment 字段

| 字段               | 类型                 | 必填 | 说明                                                                                            |
|------------------|--------------------|----|-----------------------------------------------------------------------------------------------|
| `id`             | `string`           | 是  | 评论 ID，int64 正整数。                                                                              |
| `target`         | `CommentTarget`    | 是  | 评论挂载对象，包含 `target_type` 和 `target_id`。类型为 `cycle`、`progress`、`objective` 或 `key_result`。      |
| `commentator_id` | `string`           | 是  | 评论者 ID，返回 ID 类型由请求参数 `user_id_type` 决定。                                                       |
| `status`         | `string`           | 是  | 评论状态：`open`（打开）或 `solved`（已解决）。                                                               |
| `create_time`    | `string`           | 是  | 创建时间；                                                                                         |
| `update_time`    | `string`           | 是  | 最后更新时间；                                                                                       |
| `content`        | `ContentBlock`     | 否  | 评论正文，见 [ContentBlock 定义](lark-okr-0.md#s-a9c3d82fa50f75dd)。                                           |
| `solver_id`      | `string`           | 否  | 解决评论的用户 ID。                                                                                   |
| `solved_time`    | `string`           | 否  | 评论解决时间，毫秒时间戳。                                                                                 |
| `ref_comment_id` | `string`           | 否  | 被引用评论 ID。Progress/Cycle 等实体级评论可用它表示回复关系；Objective/KeyResult 的划词评论创建时可用它定位已有划词串，但新评论本身不建立引用关系。 |
| `selection`      | `CommentSelection` | 否  | 划词信息。实体级评论为空；划词评论包含 selection ID 和可选的选区文本。                                                    |

### CommentTarget (评论目标)

| 字段            | 类型       | 必填 | 说明                                             |
|---------------|----------|----|------------------------------------------------|
| `target_type` | `string` | 是  | `cycle`、`progress`、`objective` 或 `key_result`。 |
| `target_id`   | `string` | 是  | 对应 Cycle、Progress、Objective 或 KeyResult 的 ID。  |

### CommentSelection (划词信息)

| 字段              | 类型       | 必填 | 说明                          |
|-----------------|----------|----|-----------------------------|
| `id`            | `string` | 是  | 划词 ID。同一 `id` 下的评论属于同一个评论串。 |
| `selected_text` | `string` | 否  | 划词锚定的正文文字。                  |

### 评论创建与状态规则

- Cycle/Progress 创建实体级评论时不传 `selected_text`；可以通过 `ref_comment_id` 回复已有评论。
- Objective/KeyResult 创建划词评论时，`selected_text` 与 `ref_comment_id` 二选一：前者新建划词，后者将评论挂入被引用评论所属的已有划词串。shortcut
  另外提供 `--select-all` 替代 `selected_text` 以选中 O/KR 内的全部内容。
- `solve` / `reopen` 的请求参数是单条评论 ID。对实体级评论只影响该评论；对划词评论会影响整条评论串。
- `delete` 永久删除指定评论，不会连带删除同一评论串的其他评论，且删除后不可找回。

> **SHORTCUT：**
> - `okr +comment-detail` [lark-okr-comment-detail.md](lark-okr-0.md#s-2e2dff7de68f0c69) 获取周期下全部对象的评论并按评论串整理
> - `okr +comment-list` [lark-okr-comment-list.md](lark-okr-0.md#s-615dc4b66a768872) 分页获取单个评论目标下的评论
> - `okr +comment-get` [lark-okr-comment-get.md](lark-okr-0.md#s-33d49c2c37ebe05a) 获取单条评论
> - `okr +comment-create` [lark-okr-comment-create.md](lark-okr-0.md#s-e74749e9cb4850ee) 创建评论、回复或挂入已有划词串
> - `okr +comment-patch` [lark-okr-comment-patch.md](lark-okr-0.md#s-cc1bf6ee9bfe46b5) 修改评论正文
> - `okr +comment-delete` [lark-okr-comment-delete.md](lark-okr-0.md#s-658e56646727c3a5) 永久删除单条评论
> - `okr +comment-solve` [lark-okr-comment-solve-reopen.md](lark-okr-0.md#s-5378ddbb443e95d4) 解决评论/评论串
> - `okr +comment-reopen` [lark-okr-comment-solve-reopen.md](lark-okr-0.md#s-5378ddbb443e95d4) 重新打开评论/评论串
---

## Indicator (指标)

指标是目标和关键结果的量化度量，可独立挂载在 Objective 或 KeyResult 上。

| 字段                             | 类型              | 必填 | 说明                                 |
|--------------------------------|-----------------|----|------------------------------------|
| `id`                           | `string`        | 是  | 指标 ID                              |
| `create_time`                  | `string`        | 是  | 创建时间，毫秒时间戳                         |
| `update_time`                  | `string`        | 是  | 更新时间，毫秒时间戳                         |
| `owner`                        | `Owner`         | 是  | 所有者                                |
| `entity_type`                  | `integer`       | 是  | 所属实体类型：`2`=目标，`3`=关键结果             |
| `entity_id`                    | `string`        | 是  | 所属实体 ID                            |
| `indicator_status`             | `integer`       | 是  | 指标状态，见下表                           |
| `status_calculate_type`        | `integer`       | 是  | 状态计算方式，见下表                         |
| `start_value`                  | `number`        | 否  | 起始值，范围 [-99999999999, 99999999999] |
| `target_value`                 | `number`        | 否  | 目标值，范围 [-99999999999, 99999999999] |
| `current_value`                | `number`        | 否  | 当前值，范围 [-99999999999, 99999999999] |
| `current_value_calculate_type` | `integer`       | 否  | 当前值计算方式，见下表                        |
| `unit`                         | `IndicatorUnit` | 否  | 指标单位                               |

### 修改指南

- **进度值**: 一般指 `current_value`，单位未提及时通常用百分制计算。
- 当用户要求量化的更新 OKR 进度时，一般指的就是修改对应 OKR 的 Indicator。
- OKR 在未设置量化指标时，Indicator 的内容为空。如果用户未做特别说明，更新进度时可以默认将进度以百分制设置（初始值0，目标值100，unit
  参见下文设置为 0/PERCENT）

### 指标状态 (indicator_status)

| 值  | 说明  |
|----|-----|
| -1 | 未定义 |
| 0  | 正常  |
| 1  | 有风险 |
| 2  | 已延期 |

### 状态计算方式 (status_calculate_type)

| 值 | 说明              | 适用范围    |
|---|-----------------|---------|
| 0 | 手动更新            | 目标、关键结果 |
| 1 | 基于进度和当前时间自动更新   | 目标、关键结果 |
| 2 | 基于风险最高的关键结果状态更新 | 仅目标     |

### 当前值计算方式 (current_value_calculate_type)

| 值 | 说明            | 适用范围    |
|---|---------------|---------|
| 0 | 手动更新          | 目标、关键结果 |
| 1 | 基于关键结果进度自动更新  | 仅目标     |
| 2 | 基于拆解的关键结果进度更新 | 仅关键结果   |

### IndicatorUnit (指标单位)

| 字段           | 类型        | 必填 | 说明                                                                          |
|--------------|-----------|----|-----------------------------------------------------------------------------|
| `unit_type`  | `integer` | 是  | 单位类型：`0`=公共，`1`=自定义                                                         |
| `unit_value` | `string`  | 是  | 单位值。公共类型可选：`PERCENT`(百分比)、`NONE`(无单位)、`YUAN`(元)、`DOLLAR`(美元)；自定义类型字符长度不超过 5 |

> **API：**
> - `key_result.indicators.list` — 获取关键结果的指标
> - `objective.indicators.list` — 获取目标的指标
> - `indicators.patch` — 更新指标

---

## Alignment (对齐关系)

对齐关系描述两个目标之间的上下对齐。

| 字段                 | 类型        | 必填 | 说明                    |
|--------------------|-----------|----|-----------------------|
| `id`               | `string`  | 是  | 对齐 ID                 |
| `create_time`      | `string`  | 是  | 创建时间，毫秒时间戳            |
| `update_time`      | `string`  | 是  | 更新时间，毫秒时间戳            |
| `from_owner`       | `Owner`   | 是  | 发起对齐的所有者              |
| `to_owner`         | `Owner`   | 是  | 被对齐的所有者               |
| `from_entity_type` | `integer` | 是  | 发起对齐的实体类型，固定为 `2`（目标） |
| `from_entity_id`   | `string`  | 是  | 发起对齐的实体 ID            |
| `to_entity_type`   | `integer` | 是  | 被对齐的实体类型，固定为 `2`（目标）  |
| `to_entity_id`     | `string`  | 是  | 被对齐的实体 ID             |

> **API：**
> - `alignments.get` — 获取对齐关系
> - `alignments.delete` — 删除对齐关系
> - `objective.alignments.list` — 批量获取目标下的对齐关系
> - `objective.alignments.create` — 创建对齐关系

---

## Category (分类)

分类用于对目标进行分组标记（如"个人 OKR"、"团队 OKR"、"承诺 OKR"）等。具体的分类根据租户设置而定。

| 字段              | 类型             | 必填 | 说明                                                          |
|-----------------|----------------|----|-------------------------------------------------------------|
| `id`            | `string`       | 是  | 分类 ID                                                       |
| `create_time`   | `string`       | 是  | 创建时间，毫秒时间戳                                                  |
| `update_time`   | `string`       | 是  | 更新时间，毫秒时间戳                                                  |
| `category_type` | `string`       | 是  | 分类类型：`"person"`=个人，`"team"`=团队                              |
| `enabled`       | `boolean`      | 是  | 是否启用                                                        |
| `color`         | `string`       | 是  | 颜色标识：`blue`、`purple`、`wathet`、`turquoise`、`indigo`、`orange` |
| `name`          | `CategoryName` | 是  | 多语言名称                                                       |

### CategoryName (分类名称)

| 字段   | 类型       | 必填 | 说明  |
|------|----------|----|-----|
| `zh` | `string` | 否  | 中文名 |
| `en` | `string` | 否  | 英文名 |
| `ja` | `string` | 否  | 日文名 |

> **API：** `categories.list` — 批量获取租户设置的分类列表

---

## 通用请求参数

以下参数在多数 OKR API 中通用：

| 参数                   | 位置      | 必填 | 默认值                    | 说明                                               |
|----------------------|---------|----|------------------------|--------------------------------------------------|
| `user_id_type`       | `query` | 否  | `"open_id"`            | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`    |
| `department_id_type` | `query` | 否  | `"open_department_id"` | 部门 ID 类型：`open_department_id` \| `department_id` |
| `page_size`          | `query` | 否  | `10`                   | 分页大小，最大 100                                      |
| `page_token`         | `query` | 否  | `""`                   | 分页键，首页传空串                                        |

---

## 权限 Scope 说明

| Scope                          | 权限类型 | 说明           |
|--------------------------------|------|--------------|
| `okr:okr.content:readonly`     | 读    | 读取 OKR 内容    |
| `okr:okr.content:writeonly`    | 写    | 写入/删除 OKR 内容 |
| `okr:okr.period:readonly`      | 读    | 读取 OKR 周期    |
| `okr:okr.progress:readonly`    | 读    | 读取进展记录       |
| `okr:okr.progress:writeonly`   | 写    | 创建/更新进展记录    |
| `okr:okr.progress:delete`      | 写    | 删除进展记录       |
| `okr:okr.progress.file:upload` | 写    | 上传进展记录图片附件   |
| `okr:okr.setting:read`         | 读    | 读取 OKR 设置    |

所有 OKR API 均支持 `user` 和 `tenant`（应用）两种 access token 类型。

## 参考

- [OKR ContentBlock 富文本格式](lark-okr-0.md#s-a9c3d82fa50f75dd) — content/notes 字段的富文本结构定义
- [okr +cycle-list](lark-okr-0.md#s-fbe34eb1b143bef1) — 列出用户 OKR 周期
- [okr +cycle-detail](lark-okr-0.md#s-032ab2f6c5cb93e6) — 获取周期下的目标与关键结果
- [okr +progress-get](lark-okr-0.md#s-3138ddb2f8520874) — 获取进展记录
- [okr +progress-create](lark-okr-0.md#s-ffc7d40e98f5e2f6) — 创建进展记录
- [okr +progress-update](lark-okr-0.md#s-5f8c6e73eb82723b) — 更新进展记录
- [okr +progress-delete](lark-okr-0.md#s-38f007bf25a4da26) — 删除进展记录


<a id="s-7866ce90b57ba3f6"></a>

## references/lark-okr-image-upload.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +upload-image

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

上传本地图片，用于 OKR 进展记录的富文本内容。

## 推荐命令

```text
# 上传图片用于目标的进展记录
lark-cli okr +upload-image \
  --file ./progress_screenshot.png \
  --target-id 1234567890123456789 \
  --target-type objective

# 上传图片用于关键结果的进展记录
lark-cli okr +upload-image \
  --file ./chart.jpg \
  --target-id 9876543210987654321 \
  --target-type key_result
```

## 参数

| 参数              | 必填 | 默认值 | 说明                                    |
|-----------------|----|-----|---------------------------------------|
| `--file`        | 是  | —   | 本地图片路径。**必须使用相对路径**（如 `./photo.png`）。 |
| `--target-id`   | 是  | —   | 目标 ID 或关键结果 ID（int64 类型，正整数）          |
| `--target-type` | 是  | —   | 目标类型：`objective` \| `key_result`      |
| `--dry-run`     | 否  | —   | 预览 API 调用而不实际执行。                      |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取目标或关键结果的 ID。
2. 准备本地图片文件，确保格式受支持。
3. 执行 `lark-cli okr +upload-image --file ./image.png --target-id "..." --target-type objective`。
4. 获取返回的 `file_token`，用于构建 ContentBlock 中的图片内容。

## 输出

返回 JSON：

```json
{
  "file_token": "example-file-token",
  "url": "https://example.larksuite.com/download?file_token=example-file-token",
  "file_name": "screenshot.png",
  "size": 102400
}
```

其中：

- `file_token` — 用于在 ContentBlock 的 `ContentGallery` 中引用图片
- `url` — 图片的访问 URL
- `file_name` — 上传的文件名
- `size` — 文件大小（字节）

## 在进展记录中使用上传的图片

上传图片后，将返回的 `file_token` 用于构建 ContentBlock 的图库块：

```json
{
  "blocks": [
    {
      "block_element_type": "paragraph",
      "paragraph": {
        "elements": [
          {
            "paragraph_element_type": "textRun",
            "text_run": {
              "text": "本周进展截图："
            }
          }
        ]
      }
    },
    {
      "block_element_type": "gallery",
      "gallery": {
        "images": [
          {
            "file_token": "example-file-token",
            "width": 800,
            "height": 600
          }
        ]
      }
    }
  ]
}
```

然后在创建或更新进展记录时使用此 ContentBlock：

```text
lark-cli okr +progress-create \
  --content @content_with_image.json \
  --target-id 1234567890123456789 \
  --target-type objective
```

## 安全限制

- `--file` 参数**必须使用相对路径**（如 `./photo.png` 或 `images/photo.png`），不支持绝对路径
- 图片文件必须存在于当前工作目录或其子目录中
- 不支持符号链接指向目录外的文件

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- 进展内容使用的富文本格式，包含图片块的使用说明
- [lark-okr-progress-create](lark-okr-0.md#s-ffc7d40e98f5e2f6) -- 创建进展记录
- [lark-okr-progress-update](lark-okr-0.md#s-5f8c6e73eb82723b) -- 更新进展记录
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-74dbe5000150f3db"></a>

## references/lark-okr-indicator-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +indicator-update

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

直接更新目标（Objective）或关键结果（Key Result）的指标当前值，无需手动查询指标 ID。

> **查询指标：** 如需查看指标详情，请使用原生 API：
> - 目标指标：`lark-cli okr objective.indicators list --objective-id <id>`
> - KR 指标：`lark-cli okr key_result.indicators list --key-result-id <id>`

## 推荐命令

```text
# 更新 Objective 的指标值
lark-cli okr +indicator-update \
  --level objective \
  --id 7000000000000000001 \
  --value 75.5 \
  --as user

# 更新 Key Result 的指标值
lark-cli okr +indicator-update \
  --level key-result \
  --id 7000000000000000002 \
  --value 100 \
  --as user
```

## 参数

| 参数         | 必填 | 默认值    | 说明                                                                 |
|------------|----|--------|--------------------------------------------------------------------|
| `--level`  | 是  | —      | 操作层级：`objective`（更新目标指标）\| `key-result`（更新 KR 指标） |
| `--id`     | 是  | —      | 目标 ID 或 KR ID（int64 类型）                                       |
| `--value`  | 是  | —      | 新的指标当前值（数字，范围：-99999999999 到 99999999999）              |
| `--dry-run`| 否  | —      | 预览 API 调用而不实际执行                                            |
| `--format` | 否  | `json` | 输出格式                                                             |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取目标 ID 或 KR ID。
2. 如需查看当前指标值，使用 `objective.indicators list` 或 `key_result.indicators list` 查询。
  若当前量化指标没有 start_value/current_value/target_value/unit 这些字段，代表当前量化指标为未设置的默认初始进度。
3. 执行 `+indicator-update` 指定层级、ID 和新值。 
  使用 +indicator-update 为默认初始进度设置当前值会将该量化指标配置为默认的百分比模式。若用户不希望将指标设置为百分比，请使用原生 API 详细设置，参考 [lark-okr-indicators.md](lark-okr-0.md#s-a3c3473c5ffab324)
4. 命令自动查询指标 ID 并更新当前值。

## 输出

### JSON 格式

```json
{
  "ok": true,
  "data": {
    "indicator_id": "7000000000000000003",
    "current_value": 75.5,
    "level": "objective",
    "target_id": "7000000000000000001"
  }
}
```

### 字段说明

| 字段             | 类型     | 说明                     |
|----------------|--------|------------------------|
| `indicator_id` | string | 被更新的指标 ID            |
| `current_value`| number | 更新后的指标当前值           |
| `level`        | string | 操作层级：`objective` / `key-result` |
| `target_id`    | string | 目标或 KR 的 ID            |

## 注意事项
- 仅更新 `current_value` 字段，`unit`、`start_value`、`target_value` 等其他字段保持不变
  - 若需要这些字段进行修改，使用原生接口 indicators.patch
- 指标的 `current_value_calculate_type` 必须为「手动更新」才能通过此命令修改。

## 参考

- [OKR 指标更新 API](https://open.feishu.cn/api-explorer?from=op_doc_tab&apiName=patch&project=okr&resource=okr.indicator&version=v2)
- [`lark-okr-progress-create.md`](lark-okr-0.md#s-ffc7d40e98f5e2f6) — 创建进度记录
- [`lark-okr-cycle-detail.md`](lark-okr-0.md#s-032ab2f6c5cb93e6) — 查询周期详情获取 ID


<a id="s-a3c3473c5ffab324"></a>

## references/lark-okr-indicators.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# OKR 量化指标管理

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

管理 OKR 目标（Objective）和关键结果（Key Result）的量化指标，包括查询和更新指标。

> **快速更新当前值：** 如果只需要更新指标的当前值，推荐使用 shortcut [`okr +indicator-update`](lark-okr-0.md#s-74dbe5000150f3db)，无需手动查询指标 ID。
>
> 本指南中的原生 API 适用于需要修改指标其他字段（如 `unit`、`target_value`、`status_calculate_type` 等）的场景。

---

## 指标字段说明

| 字段                          | 类型   | 说明                                                                 |
|-----------------------------|------|--------------------------------------------------------------------|
| `id`                        | string | 指标 ID（更新时需要）                                                     |
| `entity_id` / `entity_type` | string/int | 所属实体 ID 和类型（2=目标，3=关键结果）                                   |
| `current_value`             | number | 当前值                                                                 |
| `target_value`              | number | 目标值                                                                 |
| `start_value`               | number | 起始值                                                                 |
| `indicator_status`          | int    | 状态：-1=未定义，0=正常，1=有风险，2=已延期                                   |
| `status_calculate_type`     | int    | 状态计算方式：0=手动更新，1=基于进度和当前时间自动更新，2=基于风险最高的 KR 状态更新       |
| `current_value_calculate_type` | int | 当前值计算方式：0=手动更新，1=基于 KR 进度自动更新（目标），2=基于拆解 KR 进度更新（KR） |
| `unit`                      | object | 单位，包含 `unit_type`（0=公共，1=自定义）和 `unit_value`（如 PERCENT、YUAN 等）       |
| `owner`                     | object | 所有者                                                                 |

---

## 一、查询目标的量化指标

### 命令

```text
lark-cli okr objective.indicators list --objective-id "<目标ID>" [flags]
```

### 常用示例

```text
# 获取目标的量化指标
lark-cli okr objective.indicators list \
  --objective-id 7000000000000000001

# 指定用户 ID 类型
lark-cli okr objective.indicators list \
  --objective-id 7000000000000000001 \
  --user-id-type "user_id"
```

### 参数

| 参数                   | 必填 | 默认值            | 说明                                                  |
|----------------------|----|----------------|-----------------------------------------------------|
| `--objective-id`     | 是  | —              | 目标 ID                                               |
| `--user-id-type`     | 否  | `open_id`      | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`     |
| `--department-id-type` | 否 | `open_department_id` | 部门 ID 类型：`open_department_id` \| `department_id` |

### 返回

返回 `indicator` 字段，包含该目标的量化指标详情。

示例返回值:
有进度时:
```json 
{
   "ok": true,
   "identity": "user",
   "data": {
      "indicator": {
         "create_time": "1782835200000",    // 创建时间
         "current_value": 60,               // 当前值
         "current_value_calculate_type": 0, // 当前值计算方式 0(手动更新)|2(按KR计算)|3(按拆解计算)。 仅当此处为 0 时，允许使用 patch API 更新当前值
         "entity_id": "7000000000000000001",// 指标挂载的 Objective/KR id
         "entity_type": 2,                  // 指标挂载在 Objective还是KR 上 2(Objective)|3(KR)
         "id": "7000000000000000002",       // 指标本身的 ID
         "indicator_status": 0,             // 指标状态 -1(未定义)|0(正常)|1(有风险)|2(延期)
         "owner": {                         // 指标归属的用户
            "owner_type": "user",
            "user_id": "ou_xxx"
         },
         "start_value": 0,                  // 起始值, 默认0
         "status_calculate_type": 0,        // 状态计算方式
         "target_value": 100,               // 目标值, 默认 100
         "unit": {                          // 指标单位，默认是公共的百分比
            "unit_type": 0,                 // 单位类型 0(公共)|1(自定义)
            "unit_value": "PERCENT"         // 单位名
         },
         "update_time": "1782835200000"     // 更新时间
      }
   }
}
```
默认初始进度:
```json 
{
   "ok": true,
   "identity": "user",
   "data": {
      "indicator": {
         "create_time": "1782835200000",
         "entity_id": "7000000000000000001",
         "entity_type": 2,
         "id": "7000000000000000002",
         "indicator_status": -1,
         "owner": {
            "owner_type": "user",
            "user_id": "ou_xxx"
         },
         "status_calculate_type": 0,
         "update_time": "1782835200000"
      }
   }
}
```

默认初始进度不携带 start_value/current_value/target_value/unit 等信息，若直接设置当前值，则使用百分比作为默认单位。
由于默认单位为百分比，当一定要计算数值时，可以视作 0%，但是向用户汇报默认初始进度时，应当明确对应的 O/KR 未设置进度这一点，以和真正的 0% 区别开。

---

## 二、查询关键结果的量化指标

### 命令

```text
lark-cli okr key_result.indicators list --key-result-id "<关键结果ID>" [flags]
```

### 常用示例

```text
# 获取关键结果的量化指标
lark-cli okr key_result.indicators list \
  --key-result-id "7652569715131075780"
```

### 参数

| 参数                   | 必填 | 默认值            | 说明                                                  |
|----------------------|----|----------------|-----------------------------------------------------|
| `--key-result-id`    | 是  | —              | 关键结果 ID                                            |
| `--user-id-type`     | 否  | `open_id`      | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`     |
| `--department-id-type` | 否 | `open_department_id` | 部门 ID 类型：`open_department_id` \| `department_id` |

### 返回

返回 `indicator` 字段，包含该关键结果的量化指标详情。

---

## 三、更新量化指标

### 命令

```text
lark-cli okr indicators patch --indicator-id "<指标ID>" --data '<JSON>'
```

### 常用示例

```text
# 更新指标的当前值（手动更新方式）
lark-cli okr indicators patch \
  --indicator-id "ind-123" \
  --data '{"current_value": 75.5, "current_value_calculate_type": 0}'

# 更新指标状态为"有风险"（需 status_calculate_type=0）
lark-cli okr indicators patch \
  --indicator-id "ind-123" \
  --data '{"indicator_status": 1, "status_calculate_type": 0}'

# 更新关键结果指标的目标值和单位
lark-cli okr indicators patch \
  --indicator-id "ind-456" \
  --data '{
    "target_value": 100,
    "unit": {"unit_type": 0, "unit_value": "PERCENT"}
  }'

# 从文件读取请求体
lark-cli okr indicators patch \
  --indicator-id "ind-123" \
  --data @indicator_update.json
```

### 参数

| 参数               | 必填 | 说明                                                                 |
|------------------|----|--------------------------------------------------------------------|
| `--indicator-id` | 是  | 指标 ID（从 list 接口获取）                                             |
| `--data`         | 是  | JSON 请求体，包含要更新的字段。支持 `@文件路径` 从文件读取。                        |
| `--user-id-type` | 否  | 用户 ID 类型                                                           |

### 请求体字段

根据需要更新的字段选择传入，支持增量更新：

| 字段                          | 类型   | 适用实体 | 说明                                                                 |
|-----------------------------|------|------|--------------------------------------------------------------------|
| `current_value`             | number | 全部   | 当前值，范围 -99999999999 到 99999999999                                  |
| `current_value_calculate_type` | int  | 全部   | 当前值计算方式：0=手动，1=基于 KR 进度（目标），2=基于拆解 KR 进度（KR）              |
| `indicator_status`          | int    | 全部   | 状态：-1=未定义，0=正常，1=有风险，2=已延期。仅 `status_calculate_type=0` 时可修改      |
| `status_calculate_type`     | int    | 全部   | 状态计算方式：0=手动，1=自动（进度+时间），2=自动（最高风险 KR）。目标支持 0/1/2，KR 支持 0/1 |
| `start_value`               | number | KR    | 起始值。目标不支持修改                                                   |
| `target_value`              | number | KR    | 目标值。目标不支持修改；有承接记录的 KR 不支持修改                                  |
| `unit`                      | object | KR    | 单位。目标不支持修改；有承接记录的 KR 不支持修改                                  |

### 单位 (`unit`) 格式

```json
{
  "unit": {
    "unit_type": 0,              // 0=公共单位，1=自定义单位
    "unit_value": "PERCENT"      // 公共单位枚举：PERCENT、NONE、YUAN、DOLLAR；自定义单位：最长5字符
  }
}
```

### 限制说明

- **目标指标**：不支持修改 `start_value`、`target_value`、`unit`
- **关键结果指标**：有承接记录的 KR 不支持修改 `target_value`、`unit`
- **自动计算的指标**：`current_value_calculate_type != 0` 时，不能手动修改 `current_value`
- **自动状态的指标**：`status_calculate_type != 0` 时，不能手动修改 `indicator_status`

---

## 完整工作流示例

### 场景：更新关键结果的指标当前值和状态

1. **查询关键结果的指标**（获取 `indicator_id` 和当前配置）
   ```text
   lark-cli okr key_result.indicators list \
     --key-result-id 7652569715131075780
   ```

2. **检查指标配置**，确认：
   - `current_value_calculate_type` 为 0（手动更新）才能修改 `current_value`
   - `status_calculate_type` 为 0（手动更新）才能修改 `indicator_status`

3. **更新指标**
   ```text
   lark-cli okr indicators patch \
     --indicator-id "ind-123" \
     --data '{"current_value":65.0,"current_value_calculate_type":0,"indicator_status":1,"status_calculate_type":0}'
   ```

4. **验证更新结果**
   ```text
   lark-cli okr key_result.indicators list \
     --key-result-id 7652569715131075780
   ```

### 场景：修改关键结果指标的目标值和单位

```text
# 1. 查询获取 indicator_id
lark-cli okr key_result.indicators list --key-result-id 7652569715131075780

# 2. 更新目标值和单位
lark-cli okr indicators patch \
  --indicator-id 7652569715131075781 \
  --data '{"target_value":500,"unit":{"unit_type":0,"unit_value":"YUAN"}}'
```

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数
- [okr +indicator-update](lark-okr-0.md#s-74dbe5000150f3db) -- 快捷更新指标当前值（推荐）


<a id="s-9f3f244b890a135d"></a>

## references/lark-okr-patch.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +patch

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

部分更新 OKR 目标（Objective）或关键结果（Key Result）的 content、notes、score、deadline 字段。支持增量更新，只需提供要修改的字段。

## 推荐命令

```text
# 更新目标的 content（默认 simple 风格，半纯文本格式）
lark-cli okr +patch \
  --level objective \
  --target-id 1234567890123456789 \
  --content '{"text":"更新后的目标内容","mention":["ou_123"]}'

# 更新关键结果的分数（0.0-1.0 的一位小数）
lark-cli okr +patch \
  --level key-result \
  --target-id 2345678901234567890 \
  --score 0.7

# 同时更新目标的多个字段（richtext 风格，完整 ContentBlock 格式）
lark-cli okr +patch \
  --level objective \
  --target-id 1234567890123456789 \
  --style richtext \
  --content '{"blocks":[{"block_element_type":"paragraph","paragraph":{"elements":[{"paragraph_element_type":"textRun","text_run":{"text":"更新后的目标内容"}}]}}]}' \
  --notes '{"blocks":[{"block_element_type":"paragraph","paragraph":{"elements":[{"paragraph_element_type":"textRun","text_run":{"text":"更新后的备注"}}]}}]}' \
  --score 0.5 \
  --deadline 1735776000000

# 预览 API 调用而不实际执行
lark-cli okr +patch \
  --level objective \
  --target-id 1234567890123456789 \
  --content '{"text":"测试更新"}' \
  --dry-run
```

## 参数

| 参数             | 必填 | 默认值       | 说明                                                                                                                                   |
|----------------|----|-----------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--level`      | 是  | —         | 更新级别：`objective`（目标） \| `key-result`（关键结果）                                                                                    |
| `--target-id`  | 是  | —         | 目标 ID 或关键结果 ID（int64 类型，正整数）                                                                                                         |
| `--style`      | 否  | `simple`  | 输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解两种格式。          |
| `--content`    | 否¹ | —         | 内容。根据 `--style` 指定格式。支持 `@文件路径` 从文件读取。                                                                                                |
| `--notes`      | 否¹ | —         | 备注（仅 `--level=objective` 时支持）。根据 `--style` 指定格式。支持 `@文件路径` 从文件读取。                                                                           |
| `--score`      | 否¹ | —         | 分数值，0-1 之间，最多一位小数（如 0.5、1.0）。                                                                                                            |
| `--deadline`   | 否¹ | —         | 截止时间，毫秒级时间戳（如 1735776000000）。                                                                                                      |
| `--user-id-type` | 否  | `open_id` | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                                                                                        |
| `--dry-run`    | 否  | —         | 预览 API 调用而不实际执行。                                                                                                                     |
| `--format`     | 否  | `json`    | 输出格式。                                                                                                                                |

> ¹ 至少需要提供 `--content`、`--notes`、`--score`、`--deadline` 中的一个字段。

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取目标或关键结果的 ID。
2. 确定要更新的字段：
   - **content/notes**：构造内容
     - **推荐**：使用 `simple` 风格（默认），构造 SemiPlainContent JSON：`{"text":"内容","mention":["ou_xxx"]}`
     - 如需复杂格式：使用 `richtext` 风格，构造 ContentBlock JSON。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。
   - **score**：0-1 之间的数字，最多一位小数（如 0.3、0.7、1.0）
   - **deadline**：毫秒级时间戳
3. 执行 `lark-cli okr +patch --level objective --target-id "..." --content "..."`。
4. 报告结果：更新的级别、目标 ID、以及哪些字段被更新。

## 输出

返回 JSON：

```json
{
  "level": "objective",
  "target_id": "1234567890123456789",
  "patched": {
    "content": true,
    "notes": true,
    "score": true,
    "deadline": true
  }
}
```

其中 `patched` 对象中的每个字段表示该字段是否被更新。

## 注意事项

- **`--notes` 仅适用于目标**：关键结果（key-result）不支持 notes 字段，使用时会报错。
- **score 格式**：必须在 0-1 之间，且最多一位小数（如 0.5 正确，0.51 错误）。
- **严格验证**：输入格式严格根据 `--style` 值验证，不会自动检测。使用 ContentBlock JSON 时必须指定 `--style richtext`。
- **simple 风格输入限制**：simple 风格的输入不支持 `docs` 和 `images` 字段，如需包含文档或图片请使用 `richtext` 风格。

## 关于 1001001 错误

有时，当你涉及修改目标或关键结果的分数时，即使输入的参数完全正确， +patch 也会返回 1001001 错误(invalid parameters)。
这可能是因为在用户的租户设置中停用了目标/关键结果的分数功能，或禁用了目标分数的手动计算。此时可以先去掉 --score 参数再修改，并向用户确认是否启用了对应的功能。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- content/notes 使用的富文本格式
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-ffc7d40e98f5e2f6"></a>

## references/lark-okr-progress-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +progress-create

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

为目标（Objective）或关键结果（Key Result）创建一条 OKR 进展记录。

## 推荐命令

```text
# 为目标创建进展记录（默认 simple 风格，半纯文本格式）
lark-cli okr +progress-create \
  --content '{"text":"本周完成了核心模块开发","mention":["ou_123"]}' \
  --target-id 1234567890123456789 \
  --target-type objective

# 为关键结果创建进展记录（richtext 风格，完整 ContentBlock 格式）
lark-cli okr +progress-create \
  --content '{"blocks":[{"block_element_type":"paragraph","paragraph":{"elements":[{"paragraph_element_type":"textRun","text_run":{"text":"指标已达到 80%"}}]}}]}' \
  --style richtext \
  --target-id 2345678901234567891 \
  --target-type key_result \
  --progress-percent 80 \
  --progress-status done

# 从文件读取 content（适用于较长的进展内容）
lark-cli okr +progress-create \
  --content @progress_content.json \
  --target-id 1234567890123456789 \
  --target-type objective
```

## 参数

| 参数                   | 必填 | 默认值                   | 说明                                                                                                                                   |
|----------------------|----|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--content`          | 是  | —                     | 进展内容。根据 `--style` 指定格式：`simple` 风格为 SemiPlainContent JSON，`richtext` 风格为 ContentBlock JSON。支持 `@文件路径` 从文件读取。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。 |
| `--style`            | 否  | `simple`              | 输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解两种格式。          |
| `--target-id`        | 是  | —                     | 目标 ID 或关键结果 ID（int64 类型，正整数）                                                                                                         |
| `--target-type`      | 是  | —                     | 目标类型：`objective` \| `key_result`                                                                                                     |
| `--progress-percent` | 否  | —                     | 进度百分比(-99999999999 - 99999999999)。百分比的取值通常在 0-100，但允许超过此范围，以表示超额完成或负增长等情况。挂载的目标或关键结果的量化指标不使用百分比单位时，以这个字段更新当前值。系统内最多保留两位小数            |
| `--progress-status`  | 否  | —                     | 进度状态：`normal`（正常） \| `overdue`（逾期） \| `done`（已完成）。仅在指定 `--progress-percent` 时生效。                                                     |
| `--source-title`     | 否  | `created by lark-cli` | 来源标题，用于在 OKR 界面中显示进展来源                                                                                                               |
| `--source-url`       | 否  | 根据品牌自动生成              | 来源 URL，用于在 OKR 界面中显示进展来源链接，通常可以填写 OKR 编写信息来源的文档链接等。飞书品牌默认为 `https://open.feishu.cn/app`, Lark 品牌默认为 `https://open.larksuite.com/app` |
| `--user-id-type`     | 否  | `open_id`             | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                                                                                        |
| `--dry-run`          | 否  | —                     | 预览 API 调用而不实际执行。                                                                                                                     |
| `--format`           | 否  | `json`                | 输出格式。                                                                                                                                |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取目标或关键结果的 ID。
2. 构造进展内容：
   - **推荐**：使用 `simple` 风格（默认），构造 SemiPlainContent JSON：`{"text":"内容","mention":["ou_xxx"]}`，mention 中提及的用户会统一连接在文本末尾。
   - 如需复杂格式：使用 `richtext` 风格，构造 ContentBlock JSON。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。若需要插入图片/飞书文档或复杂文本格式，则必须使用 richtext 风格
3. 执行 `lark-cli okr +progress-create --content "..." --target-id "..." --target-type objective`。
4. 报告结果：新创建的进展记录 ID、修改时间等。

## 输出

返回 JSON：

```json
{
  "progress": {
    "progress_id": "1234567890123456789",
    "modify_time": "2025-01-15 10:30:00",
    "content": "{...}",
    "progress_rate": {
      "percent": 80.0,
      "status": "done"
    }
  }
}
```

其中：

- `content` 字段是 JSON 字符串，为 OKR ContentBlock
  富文本格式。请参考 [lark-okr-contentblock.md](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解详细信息。
- `progress_rate.status` 返回可读字符串：`normal`（正常）、`overdue`（逾期）、`done`（已完成）。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- 进展内容使用的富文本格式
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-38f007bf25a4da26"></a>

## references/lark-okr-progress-delete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +progress-delete

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

根据 ID 删除一条 OKR 进展记录。此操作为高风险操作，删除后不可恢复。

## 推荐命令

```text
# 删除指定 ID 的进展记录
lark-cli okr +progress-delete --progress-id 1234567890123456789

# 预览 API 调用而不实际执行
lark-cli okr +progress-delete --progress-id 1234567890123456789 --dry-run
```

## 参数

| 参数              | 必填 | 默认值    | 说明                    |
|-----------------|----|--------|-----------------------|
| `--progress-id` | 是  | —      | 进展记录 ID（int64 类型，正整数） |
| `--dry-run`     | 否  | —      | 预览 API 调用而不实际执行。      |
| `--format`      | 否  | `json` | 输出格式。                 |

## 工作流程

1. 使用 `+progress-get` 确认要删除的进展记录 ID 和内容。
2. 执行 `lark-cli okr +progress-delete --progress-id "1234567890123456789"`。
3. 报告结果：已删除的进展记录 ID。

> **注意**：此操作不可恢复，建议在删除前先用 `+progress-get` 确认记录内容。

## 输出

返回 JSON：

```json
{
  "deleted": true,
  "progress_id": "1234567890123456789"
}
```

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-3138ddb2f8520874"></a>

## references/lark-okr-progress-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +progress-get

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

根据进展记录 ID 获取单条 OKR 进展记录。

## 推荐命令

```text
# 获取指定 ID 的进展记录（默认 simple 风格，半纯文本格式）
lark-cli okr +progress-get --progress-id 1234567890123456789

# 获取指定 ID 的进展记录（richtext 风格，原始 ContentBlock JSON）
lark-cli okr +progress-get --progress-id 1234567890123456789 --style richtext

# 使用特定的用户 ID 类型
lark-cli okr +progress-get --progress-id 1234567890123456789 --user-id-type open_id

# 预览 API 调用而不实际执行
lark-cli okr +progress-get --progress-id 1234567890123456789 --dry-run
```

## 参数

| 参数               | 必填 | 默认值         | 说明                                                                 |
|------------------|----|-------------|--------------------------------------------------------------------|
| `--progress-id`  | 是  | —           | 进展记录 ID（int64 类型，正整数）                                               |
| `--style`        | 否  | `simple`    | 输出风格：`simple`（半纯文本 SemiPlainContent，推荐） \| `richtext`（原始 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。 |
| `--user-id-type` | 否  | `open_id`   | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                           |
| `--dry-run`      | 否  | —           | 预览 API 调用而不实际执行。                                                        |
| `--format`       | 否  | `json`      | 输出格式。                                                                     |

## 工作流程

1. 获取目标进展记录的 ID。可通过 `+cycle-detail` 获取目标和关键结果后，从中获取进展记录 ID。
2. 执行 `lark-cli okr +progress-get --progress-id "1234567890123456789"`。
3. 报告结果：进展记录的 ID、修改时间、进度百分比和内容。

## 输出

返回 JSON，`content` 字段格式由 `--style` 控制：

### `--style simple`（默认）输出示例：

```json
{
  "progress": {
    "progress_id": "1234567890123456789",
    "modify_time": "2025-01-15 10:30:00",
    "content": {
      "text": "已完成 80% 的开发工作 @{ou_zhangsan} ",
      "mention": ["ou_zhangsan"],
      "docs": [],
      "images": []
    },
    "progress_rate": {
      "percent": 75.0,
      "status": "normal"
    }
  },
  "style": "simple"
}
```

### `--style richtext` 输出示例：

```json
{
  "progress": {
    "progress_id": "1234567890123456789",
    "modify_time": "2025-01-15 10:30:00",
    "content": "{\"blocks\":[{\"block_element_type\":\"paragraph\",\"paragraph\":{\"elements\":[{\"paragraph_element_type\":\"textRun\",\"text_run\":{\"text\":\"已完成 80% 的开发工作 \"}},{\"paragraph_element_type\":\"mention\",\"mention\":{\"user_id\":\"ou_zhangsan\"}}]}}]}",
    "progress_rate": {
      "percent": 75.0,
      "status": "normal"
    }
  },
  "style": "richtext"
}
```

其中：

- `content` 字段格式由 `--style` 控制：
  - `--style simple`（默认）：`SemiPlainContent` 对象，包含 `text`、`mention`、`docs`、`images` 字段。`text` 中包含 `@{userID}` 占位符用于标识 mention 位置。
  - `--style richtext`：JSON 字符串，为 OKR ContentBlock 富文本格式
- 请参考 [lark-okr-contentblock.md](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解两种格式的详细信息。
- `progress_rate.status` 返回可读字符串：`normal`（正常）、`overdue`（逾期）、`done`（已完成）。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-61fa4c0c12279422"></a>

## references/lark-okr-progress-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +progress-list

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

获取目标（Objective）或关键结果（Key Result）的一页进展记录列表，支持外部控制翻页。

## 推荐命令

```text
# 获取目标进展记录第一页 (默认页大小为 100，一般不用翻页)
lark-cli okr +progress-list \
  --target-id 1234567890123456789 \
  --target-type objective

# 获取下一页进展记录 
lark-cli okr +progress-list \
  --target-id 1234567890123456789 \
  --target-type objective \
  --page-size 100 \
  --page-token "7000000000000000002"

# 获取关键结果进展记录第一页
lark-cli okr +progress-list \
  --target-id 9876543210987654321 \
  --target-type key_result
```

## 参数

| 参数                    | 必填 | 默认值             | 说明                                             |
|-------------------------|----|--------------------|--------------------------------------------------|
| `--target-id`           | 是  | —                  | 目标 ID 或关键结果 ID（int64 类型，正整数）       |
| `--target-type`         | 是  | —                  | 目标类型：`objective` \| `key_result`            |
| `--user-id-type`        | 否  | `open_id`          | 用户 ID 类型：`open_id` \| `union_id` \| `user_id` |
| `--department-id-type`  | 否  | `open_department_id` | 部门 ID 类型：`department_id` \| `open_department_id` |
| `--page-size`           | 否  | `100`              | 每页数量，范围 `1-100`。                           |
| `--page-token`          | 否  | `""`               | 上一次响应中的 `page_token`，留空表示第一页。        |
| `--dry-run`             | 否  | —                  | 预览 API 调用而不实际执行。                       |
| `--format`              | 否  | `json`             | 输出格式。                                        |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取目标或关键结果的 ID。
2. 执行 `lark-cli okr +progress-list --target-id "..." --target-type objective --page-size 100`。
3. 如果响应中 `has_more=true`，继续用返回的 `page_token` 调用下一页。
4. 获取该目标或关键结果下的进展记录列表。

## 输出

返回 JSON：

```json
{
  "progress_list": [
    {
      "progress_id": "1234567890123456789",
      "modify_time": "2025-01-15 10:30:00",
      "content": "{...}",
      "progress_rate": {
        "percent": 80.0,
        "status": "done"
      }
    }
  ],
  "has_more": true,
  "page_token": "7000000000000000002"
}
```

其中：

- `progress_list` — 进展记录数组
- `has_more` 和 `page_token` 用于外部控制翻页；`has_more=true` 时，用 `--page-token` 原样传入本次返回的 `page_token` 获取下一页。
- `content` 字段是 JSON 字符串，为 OKR ContentBlock 富文本格式。请参考 [lark-okr-contentblock.md](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解详细信息。
- `progress_rate.status` 返回可读字符串：`normal`（正常）、`overdue`（逾期）、`done`（已完成）。

## 与 +progress-get 的区别

| 命令             | 用途                               | API 版本 |
|------------------|------------------------------------|----------|
| `+progress-list` | 分页获取某个目标/关键结果的进展记录 | v2       |
| `+progress-get`  | 根据进展记录 ID 获取单条记录        | v1       |

`+progress-list` 返回的 `progress_list` 数组中每条记录的结构与 `+progress-get` 返回的 `progress` 结构相同。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- 进展内容使用的富文本格式
- [lark-okr-progress-get](lark-okr-0.md#s-3138ddb2f8520874) -- 根据 ID 获取单条进展记录
- [lark-okr-progress-create](lark-okr-0.md#s-ffc7d40e98f5e2f6) -- 创建进展记录
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-5f8c6e73eb82723b"></a>

## references/lark-okr-progress-update.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +progress-update

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

更新指定 ID 的 OKR 进展记录内容。

## 推荐命令

```text
# 更新进展记录内容（默认 simple 风格，半纯文本格式）
lark-cli okr +progress-update \
  --progress-id 1234567890123456789 \
  --content '{"text":"更新后的进展内容","mention":["ou_123"]}'

# 更新进展记录内容并同时更新进度（richtext 风格，完整 ContentBlock 格式）
lark-cli okr +progress-update \
  --progress-id 1234567890123456789 \
  --content '{"blocks":[{"block_element_type":"paragraph","paragraph":{"elements":[{"paragraph_element_type":"textRun","text_run":{"text":"进度已更新至 90%"}}]}}]}' \
  --style richtext \
  --progress-percent 90 \
  --progress-status normal

# 从文件读取 content（适用于较长的进展内容）
lark-cli okr +progress-update \
  --progress-id 1234567890123456789 \
  --content @updated_progress.json

# 预览 API 调用而不实际执行
lark-cli okr +progress-update \
  --progress-id 1234567890123456789 \
  --content '{"text":"test"}' \
  --dry-run
```

## 参数

| 参数                   | 必填 | 默认值       | 说明                                                                                                             |
|----------------------|----|-----------|----------------------------------------------------------------------------------------------------------------|
| `--progress-id`      | 是  | —         | 进展记录 ID（int64 类型，正整数）                                                                                          |
| `--content`          | 是  | —         | 进展内容。根据 `--style` 指定格式：`simple` 风格为 SemiPlainContent JSON，`richtext` 风格为 ContentBlock JSON。支持 `@文件路径` 从文件读取。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。 |
| `--style`            | 否  | `simple`  | 输入风格：`simple`（半纯文本 JSON，推荐） \| `richtext`（完整 ContentBlock JSON）。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解两种格式。          |
| `--progress-percent` | 否  | —         | 进度百分比(-99999999999 - 99999999999)。百分比的取值通常在 0-100，但允许超过此范围，以表示超额完成或负增长等情况。挂载的目标或关键结果的量化指标不使用百分比单位时，以这个字段更新当前值。系统内最多保留两位小数 |
| `--progress-status`  | 否  | —         | 进度状态：`normal`（正常） \| `overdue`（逾期） \| `done`（已完成）。仅在指定 `--progress-percent` 时生效。                               |
| `--user-id-type`     | 否  | `open_id` | 用户 ID 类型：`open_id` \| `union_id` \| `user_id`                                                                  |
| `--dry-run`          | 否  | —         | 预览 API 调用而不实际执行。                                                                                               |
| `--format`           | 否  | `json`    | 输出格式。                                                                                                          |

## 工作流程

1. 使用 `+progress-get` 获取要更新的进展记录的 ID 和当前内容。
2. 修改进展内容：
   - **推荐**：使用 `simple` 风格（默认），构造 SemiPlainContent JSON：`{"text":"内容","mention":["ou_xxx"]}`，mention 中提及的用户会统一连接在文本末尾。
   - 如需复杂格式：使用 `richtext` 风格，构造 ContentBlock JSON。请参考 [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd)。若需要插入图片/飞书文档或复杂文本格式，则必须使用 richtext 风格
3. 执行 `lark-cli okr +progress-update --progress-id "..." --content "..."`。
4. 报告结果：更新后的进展记录 ID、修改时间、进度百分比等。

## 输出

返回 JSON：

```json
{
  "progress": {
    "progress_id": "1234567890123456789",
    "modify_time": "2025-01-15 14:30:00",
    "content": "{...}",
    "progress_rate": {
      "percent": 90.0,
      "status": "normal"
    }
  }
}
```

其中：

- `content` 字段是 JSON 字符串，为 OKR ContentBlock
  富文本格式。请参考 [lark-okr-contentblock.md](lark-okr-0.md#s-a9c3d82fa50f75dd) 了解详细信息。
- `progress_rate.status` 返回可读字符串：`normal`（正常）、`overdue`（逾期）、`done`（已完成）。

## 参考

- [lark-okr](lark-okr-0.md#s-8bde09e6f148ff41) -- 所有 OKR 命令(shortcut 和 API 接口)
- [ContentBlock 格式](lark-okr-0.md#s-a9c3d82fa50f75dd) -- 进展内容使用的富文本格式
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-7675856e8f737ccd"></a>

## references/lark-okr-reorder.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +reorder

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

调整 OKR 周期下目标（Objective）或目标下关键结果（Key Result）的顺序。

## 推荐命令

```text
# 调整 Objective 顺位
lark-cli okr +reorder \
  --cycle-id 7000000000000000001 \
  --level objective \
  --ops '[
    {"id": "7000000000000000002", "position": 2},
    {"id": "7000000000000000003", "position": 1}
  ]' \
  --as user

# 调整 KR 顺位（需指定 --objective-id）
lark-cli okr +reorder \
  --cycle-id 7000000000000000001 \
  --level key-result \
  --objective-id 7000000000000000002 \
  --ops '[
    {"id": "7000000000000000004", "position": 1},
    {"id": "7000000000000000005", "position": 2}
  ]' \
  --as user

# 从文件读取 ops
lark-cli okr +reorder \
  --cycle-id 7000000000000000001 \
  --level objective \
  --ops @reorder_ops.json \
  --as user
```

- 不允许将多个 objective/key-result 放在同一个位置下

## 参数

| 参数               | 必填 | 默认值    | 说明                                                      |
|------------------|----|--------|---------------------------------------------------------|
| `--level`        | 是  | —      | 调整层级：`objective`（调整周期下目标顺序）\| `key-result`（调整目标下 KR 顺序） |
| `--cycle-id`     | 是  | —      | OKR 周期 ID（int64 类型）。                                    |
| `--objective-id` | 条件 | —      | 目标 ID。当 `--level=key-result` 时**必填**，用于定位父目标。           |
| `--ops`          | 是  | —      | JSON 数组格式的顺位调整操作。支持 `@文件路径` 或 `@-` 从 stdin 读取。          |
| `--dry-run`      | 否  | —      | 预览 API 调用而不实际执行                                         |
| `--format`       | 否  | `json` | 输出格式                                                    |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取周期 ID、目标 ID 和 KR ID。
2. 构造 `--ops` JSON 数组，指定要调整的 ID 和新 position，执行命令。
3. 返回调整后的完整顺序。

## 输出

成功返回 JSON（以调整 Objective 位置为例）：

```json
{
  "ok": true,
  "data": {
    "level": "objective",
    "cycle_id": "7000000000000000001",
    "total": 3,
    "ordered": [
      "7000000000000000003",
      "7000000000000000002",
      "7000000000000000004"
    ]
  }
}
```

## 参考

- [OKR 业务实体](lark-okr-0.md#s-454dba25e45d198c) -- OKR 实体结构定义
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-430493adec78775e"></a>

## references/lark-okr-weight.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# okr +weight

> **前置条件：** 先阅读 [`lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188) 了解认证、全局参数和安全规则。

调整 OKR 周期下目标（Objective）或目标下关键结果（Key Result）的权重。支持部分指定权重，未指定的按原权重比例自动分配。

## 推荐命令

```text
# 调整 Objective 权重（部分指定，剩余自动分配）
lark-cli okr +weight \
  --cycle-id 7000000000000000001 \
  --level objective \
  --weights '[
    {"id": "7000000000000000002", "weight": 0.6},
    {"id": "7000000000000000003", "weight": 0.3}
  ]' \
  --as user

# 调整 KR 权重（全部指定，和为 1）
lark-cli okr +weight \
  --cycle-id 7000000000000000001 \
  --level key-result \
  --objective-id 7000000000000000002 \
  --weights '[
    {"id": "7000000000000000004", "weight": 0.6},
    {"id": "7000000000000000005", "weight": 0.4}
  ]' \
  --as user

# 从文件读取 weights
lark-cli okr +weight \
  --cycle-id 7000000000000000001 \
  --level objective \
  --weights @weights.json \
  --as user
```

参数限制: 请求中的权重保留三位小数，分配的所有权重和不能大于 1 (小于等于 1 是允许的)。

### 权重归一化

- 在 OKR 中，一个周期下所有 Objective 和 一个 Objective 下所有 Key Result 的权重和固定为 1.
- 在使用 +weight shortcut 分配 OKR 权重时，已分配的总权重不得超过 1。
- 若已分配的权重 < 1，剩余的权重会按照原始权重的比例均分到未指定的 Objective/Key Result 下。
  - 若所有 Objective/Key Result 均分配了权重但和 < 1，剩余的权重会计算在最后一个 Objective/Key Result 下。



## 参数

| 参数               | 必填 | 默认值    | 说明                                                                  |
|------------------|----|--------|---------------------------------------------------------------------|
| `--level`        | 是  | —      | 调整层级：`objective`（调整周期下目标权重）\| `key-result`（调整目标下 KR 权重）             |
| `--cycle-id`     | 是  | —      | OKR 周期 ID（int64 类型）                                                 |
| `--objective-id` | 条件 | —      | 目标 ID。当 `--level=key-result` 时**必填**，用于定位父目标。                       |
| `--weights`      | 是  | —      | JSON 数组格式的权重分配。支持 `@文件路径` 或 `@-` 从 stdin 读取。权重保留三位小数，分配的所有权重和不能大于 1 |
| `--dry-run`      | 否  | —      | 预览 API 调用而不实际执行                                                     |
| `--format`       | 否  | `json` | 输出格式                                                                |

## 工作流程

1. 使用 `+cycle-list` 和 `+cycle-detail` 获取周期 ID、目标 ID、KR ID 和当前权重。
2. 构造 `--weights` JSON 数组，指定要调整的 ID 和权重，执行命令。
3. 返回调整后的完整权重列表。

## 输出

成功返回 JSON：

```json
{
  "ok": true,
  "data": {
    "level": "objective",
    "cycle_id": "7000000000000000001",
    "total": 3,
    "weights": [
      {"id": "7000000000000000002", "weight": 0.6},
      {"id": "7000000000000000003", "weight": 0.3},
      {"id": "7000000000000000004", "weight": 0.1}
    ]
  }
}
```

## 关于 1001001 错误

有时，即使输入的参数完全正确， +weight 也会返回 1001001 错误。这是因为你的租户设置中，不一定开启了目标或关键结果的设置权重功能。
若你确认输入的参数无误（cycle-id/objective-id 正确，weights 中的 id 均是同一个周期下的目标或同一个目标下的关键结果，weights 中的权重和 <1）,
不必进一步尝试，你需要向用户确认 OKR 应用目前是否开启了目标或关键结果的设置权重功能。

## 参考

- [OKR 业务实体](lark-okr-0.md#s-454dba25e45d198c) -- OKR 实体结构定义
- [lark-shared](lark-shared-0.md#s-fd106a64f84b4188) -- 认证和全局参数


<a id="s-326189fa39448a2d"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `okr.v1.okr.batchGet` | [Feishu/Lark]-OKR-OKR 内容-批量获取 OKR-根据 OKR id 批量获取 OKR | feishu_read_tool |
| `okr.v1.progressRecord.create` | [Feishu/Lark]-OKR-OKR 进展记录-创建 OKR 进展记录-创建 OKR 进展记录 | feishu_call_tool |
| `okr.v1.progressRecord.delete` | [Feishu/Lark]-OKR-OKR 进展记录-删除 OKR 进展记录-根据 ID 删除 OKR 进展记录 | feishu_call_tool |
| `okr.v1.progressRecord.get` | [Feishu/Lark]-OKR-OKR 进展记录-获取 OKR 进展记录-根据 ID 获取 OKR 进展记录详情，接口返回进展记录的内容、更新时间以及进展百分比和状态 | feishu_read_tool |
| `okr.v1.progressRecord.update` | [Feishu/Lark]-OKR-OKR 进展记录-更新 OKR 进展记录-根据 OKR 进展记录 ID 更新进展详情 | feishu_call_tool |
| `okr.v1.userOkr.list` | [Feishu/Lark]-OKR-OKR 内容-获取用户的 OKR 列表-根据用户的 id 获取 OKR 列表 | feishu_read_tool |
| `cli.okr.alignments.delete` | Delete OKR Alignment | feishu_call_tool |
| `cli.okr.alignments.get` | Get OKR Alignment | feishu_read_tool |
| `cli.okr.categories.list` | List all okr categories | feishu_read_tool |
| `cli.okr.cycles.list` | Get user OKR Cycle list | feishu_read_tool |
| `cli.okr.cycles.objectives_position` | Update the positions of all Objectives in a user's OKR cycle | feishu_call_tool |
| `cli.okr.cycles.objectives_weight` | Update the weights of all Objectives in a user's OKR cycle | feishu_call_tool |
| `cli.okr.cycle.objectives.create` | Create Objective in OKR Cycle | feishu_call_tool |
| `cli.okr.cycle.objectives.list` | Get Objectives in OKR Cycle | feishu_read_tool |
| `cli.okr.indicators.patch` | Update Indicator | feishu_call_tool |
| `cli.okr.key_results.delete` | Delete Key Result | feishu_call_tool |
| `cli.okr.key_results.get` | Get Key Result | feishu_read_tool |
| `cli.okr.key_results.patch` | Modify Key Result | feishu_call_tool |
| `cli.okr.key_result.indicators.list` | Get Indicator of a Key Result | feishu_read_tool |
| `cli.okr.objectives.delete` | Delete Objective | feishu_call_tool |
| `cli.okr.objectives.get` | Get Objective | feishu_read_tool |
| `cli.okr.objectives.key_results_position` | Update the positions of all Key Results of an Objective | feishu_call_tool |
| `cli.okr.objectives.key_results_weight` | Update the weights of all Key Results of an Objective | feishu_call_tool |
| `cli.okr.objectives.patch` | Modify Objective | feishu_call_tool |
| `cli.okr.objective.alignments.create` | Create Object Alignment | feishu_call_tool |
| `cli.okr.objective.alignments.list` | List Alignment of an Objective | feishu_read_tool |
| `cli.okr.objective.indicators.list` | Get Indicator of an Objective | feishu_read_tool |
| `cli.okr.objective.key_results.create` | Create Key Result of an Objective | feishu_call_tool |
| `cli.okr.objective.key_results.list` | List Key Results of an Objective | feishu_read_tool |


<a id="s-c2733bde244238c4"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# okr (v2)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188)，其中包含认证、权限处理**

**身份**：OKR 操作默认使用 `--as user`（查看当前用户/上下级的 OKR 时）。也支持 `--as bot` 查看他人 OKR（需相应权限）。

## 快速决策

| 用户需求                     | 操作路径                                                                                                                | 参考文档                                                                                                                                                                                                             |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 查看自己/他人的 OKR          | 获取用户 ID -> `+cycle-list` -> `+cycle-detail` -> 按需查指标/进展记录                                                  | [`cycle-list`](lark-okr-0.md#s-fbe34eb1b143bef1), [`cycle-detail`](lark-okr-0.md#s-032ab2f6c5cb93e6), [`indicators`](lark-okr-0.md#s-a3c3473c5ffab324), [`progress-list`](lark-okr-0.md#s-61fa4c0c12279422) |
| 为自己写一组 OKR             | 优先用 `+batch-create` 创建 Objective/KR 骨架                                                                           | [`batch-create`](lark-okr-0.md#s-ab36ffb3c1ee32b5), [`contentblock`](lark-okr-0.md#s-a9c3d82fa50f75dd)                                                                                                         |
| 只新增一条 O 或单条 KR       | 用 `+create`                                                                                                            | [`create`](lark-okr-0.md#s-6f590b5bfd67b6da)                                                                                                                                                                            |
| 编辑内容/备注/截止时间       | 用 `+patch`                                                                                                             | [`patch`](lark-okr-0.md#s-9f3f244b890a135d)                                                                                                                                                                              |
| 修改 OKR 分数                | 只有用户明确说“分数”“评分”“打分”“score”时才用 `+patch --score`；分数不是进度/完成度                                     | [`patch`](lark-okr-0.md#s-9f3f244b890a135d)                                                                                                                                                                              |
| 调整顺序或权重               | 用 `+reorder` / `+weight`                                                                                               | [`reorder`](lark-okr-0.md#s-7675856e8f737ccd), [`weight`](lark-okr-0.md#s-430493adec78775e)                                                                                                                               |
| 更新数字进度/完成度          | 百分比或不带单位数字用 `+indicator-update`；需要改单位/目标值时查指标后用 `indicators patch`                            | [`indicator-update`](lark-okr-0.md#s-74dbe5000150f3db), [`indicators`](lark-okr-0.md#s-a3c3473c5ffab324)                                                                                                     |
| 写文字进展                   | 用 `+progress-create`；如果文本和数字都有，百分比或默认单位可使用 `--progress-percent` 统一改，非百分比单位更新量化指标 | [`progress-create`](lark-okr-0.md#s-ffc7d40e98f5e2f6), [`progress-list`](lark-okr-0.md#s-61fa4c0c12279422), [`progress-update`](lark-okr-0.md#s-5f8c6e73eb82723b)                                    |
| 对齐目标                     | 直接按对齐关系工作流处理                                                                                                | [`alignments`](lark-okr-0.md#s-2354c9c50895abb3)                                                                                                                                                                    |
| 查询/创建/修改/解决 OKR 评论 | 获取周期下全部评论聚合用 `+comment-detail`，查询单个 O/KR/进展或仅查询周期全局评论用 `+comment-list`；                | [`comment`](lark-okr-0.md#s-615dc4b66a768872), [`comment-create`](lark-okr-0.md#s-e74749e9cb4850ee), [`comment-solve-reopen`](lark-okr-0.md#s-5378ddbb443e95d4)                                   |

分类只在用户明确要求分类，或创建 Objective 返回 `invalid parameters` 且怀疑租户强制开启分类时处理：用 `lark-cli okr categories list --params '{"owner_type":"user","page_size":100}' --as user` 查可用分类，选择语义合适且`enabled=true` 的分类 ID；分类可后续调整，不必停下等待用户确认。

获取当前用户用 `contact +get-user`；按姓名/邮箱查他人用 `contact +search-user`，拿到 `open_id` 后再查 OKR。

```text
lark-cli contact +search-user --query "张三" --has-chatted --as user
```

最常用 OKR 命令示例：

```text
# 查用户周期，再用周期 ID 查详情
lark-cli okr +cycle-list --user-id "ou_xxx" --as user
lark-cli okr +cycle-detail --cycle-id 7000000000000000001 --as user

# 批量创建 Objective/KR
lark-cli okr +batch-create \
  --cycle-id 7000000000000000001 \
  --input '[{"text":"提升产品用户体验","notes":"关注核心流程和用户反馈","krs":[{"text":"核心流程满意度达到 4.8 分"}]}]' \
  --as user

# 更新数字进度/完成度
lark-cli okr +indicator-update \
  --level key-result \
  --id 7000000000000000003 \
  --value 75 \
  --as user
```

分数和进度不要混用：用户说“进度”“完成度”“当前做到 75%”时，通常是在改量化指标或写进展记录，不是在改 `score`。只有明确要求修改 OKR 分数/评分/打分时，才使用 [`+patch --score`](lark-okr-0.md#s-9f3f244b890a135d)；`score` 取值是 0-1，最多一位小数。

进度判断规则：用户说“进度”“完成度”时，先判断是否是量化数字。数字进度通常对应量化指标；不可量化文本对应进展记录。需要修改指标单位时看 [`lark-okr-indicators.md`](lark-okr-0.md#s-a3c3473c5ffab324)

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli okr +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut                                                         | 说明                                                                                                          |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| [`+cycle-list`](lark-okr-0.md#s-fbe34eb1b143bef1)               | 分页获取特定用户的 OKR 周期列表，可以用 `--time-range` 对当前页后置筛选                                       |
| [`+cycle-detail`](lark-okr-0.md#s-032ab2f6c5cb93e6)           | 获取特定 OKR 中所有目标和关键结果的内容                                                                       |
| [`+create`](lark-okr-0.md#s-6f590b5bfd67b6da)                       | 创建单个 Objective（可带备注），或向已有 Objective 新增 KR                                                    |
| [`+progress-list`](lark-okr-0.md#s-61fa4c0c12279422)         | 分页获取目标或关键结果的进展记录列表                                                                          |
| [`+progress-get`](lark-okr-0.md#s-3138ddb2f8520874)           | 根据 ID 获取单条 OKR 进展记录                                                                                 |
| [`+progress-create`](lark-okr-0.md#s-ffc7d40e98f5e2f6)     | 为目标或关键结果创建进展记录                                                                                  |
| [`+progress-update`](lark-okr-0.md#s-5f8c6e73eb82723b)     | 更新指定 ID 的进展记录内容                                                                                    |
| [`+progress-delete`](lark-okr-0.md#s-38f007bf25a4da26)     | 删除指定 ID 的进展记录（不可恢复）                                                                            |
| [`+upload-image`](lark-okr-0.md#s-7866ce90b57ba3f6)           | 上传图片用于 OKR 进展记录的富文本内容                                                                         |
| [`+batch-create`](lark-okr-0.md#s-ab36ffb3c1ee32b5)           | 批量创建 Objective（可带备注）和 KR                                                                           |
| [`+reorder`](lark-okr-0.md#s-7675856e8f737ccd)                     | 调整 Objective 或 KR 的顺位                                                                                   |
| [`+weight`](lark-okr-0.md#s-430493adec78775e)                       | 调整 Objective 或 KR 的权重                                                                                   |
| [`+indicator-update`](lark-okr-0.md#s-74dbe5000150f3db)   | 更新 Objective 或 KR 的当前进度指标。更复杂的量化指标操作见 [量化指标管理](lark-okr-0.md#s-a3c3473c5ffab324) |
| [`+patch`](lark-okr-0.md#s-9f3f244b890a135d)                         | 部分更新 Objective 或 KR（content、notes、score、deadline）                                                   |
| [`+comment-detail`](lark-okr-0.md#s-2e2dff7de68f0c69)       | 获取周期下 Cycle/Objective/KeyResult/Progress 的全部评论                                                      |
| [`+comment-list`](lark-okr-0.md#s-615dc4b66a768872)           | 分页获取单个 OKR 实体下的评论                                                                                 |
| [`+comment-get`](lark-okr-0.md#s-33d49c2c37ebe05a)             | 获取单条评论详情                                                                                              |
| [`+comment-create`](lark-okr-0.md#s-e74749e9cb4850ee)       | 创建新评论或回复已有评论(仅支持 --as user)                                                                    |
| [`+comment-patch`](lark-okr-0.md#s-cc1bf6ee9bfe46b5)         | 修改评论内容(仅支持 --as user)                                                                                |
| [`+comment-delete`](lark-okr-0.md#s-658e56646727c3a5)       | 永久删除单条评论(仅支持 --as user)                                                                            |
| [`+comment-solve`](lark-okr-0.md#s-5378ddbb443e95d4)  | 解决评论或划词评论串(仅支持 --as user)                                                                        |
| [`+comment-reopen`](lark-okr-0.md#s-5378ddbb443e95d4) | 重新打开评论或划词评论串(仅支持 --as user)                                                                    |

### 创建场景选择

- **单条创建优先用 [`+create`](lark-okr-0.md#s-6f590b5bfd67b6da)**：适合创建一个 Objective，或给已有 Objective 增加一个 KR。
- **批量创建用 [`+batch-create`](lark-okr-0.md#s-ab36ffb3c1ee32b5)**：适合一次创建多个 Objective，并可同时附带多个 KR。
- 如果你只需要修改已有 Objective / KR 的内容、备注、分数或截止时间，使用 [`+patch`](lark-okr-0.md#s-9f3f244b890a135d)。

## 格式说明

- [`OKR 业务实体`](lark-okr-0.md#s-454dba25e45d198c) 获取 OKR 实体结构，定义和关系，帮助你更好的使用 OKR 功能
- [`ContentBlock 富文本格式`](lark-okr-0.md#s-a9c3d82fa50f75dd) — Objective/KeyResult/Progress 中 Content/Note
  字段使用的富文本格式说明，以及简化的半纯文本（SemiPlainContent）格式的进一步说明。
- **强烈建议** 在操作 OKR 前，阅读[`OKR 业务实体`](lark-okr-0.md#s-454dba25e45d198c)以了解基础概念

## API Resources

### alignments

- `delete` — 删除对齐关系
- `get` — 获取对齐关系

> **操作指南：** [OKR 对齐关系管理](lark-okr-0.md#s-2354c9c50895abb3) 包含 list/create/delete 完整工作流

### categories

- `list` — 批量获取分类

### cycles

- `list` — 批量获取用户周期

### cycle.objectives

- `list` — 批量获取用户周期下的目标

### indicators

- `patch` — 更新量化指标

> **操作指南：** [OKR 量化指标管理](lark-okr-0.md#s-a3c3473c5ffab324) 包含目标/KR 指标查询和 patch 更新完整工作流

### key_results

- `delete` — 删除关键结果
- `get` — 获取关键结果
- `patch` — 更新关键结果

### key_result.indicators

- `list` — 获取关键结果的量化指标

> **操作指南：** [OKR 量化指标管理](lark-okr-0.md#s-a3c3473c5ffab324)

### objectives

- `delete` — 删除目标
- `get` — 获取目标
- `key_results_position` — 更新全部关键结果的位置
    - 请求中必须携带对应周期下全部关键结果的 ID，否则会参数校验失败。以传入的关键结果ID顺序重新排列关键结果。
- `key_results_weight` — 更新全部关键结果的权重
    - 类似 `objectives_weight`, 请求中必须同时修改对应目标下全部关键结果的权重，且所有权重值的和必须等于 1 ，否则会参数校验失败。
- `patch` — 更新目标

### objective.alignments

- `create` — 创建对齐关系
    - 对齐不允许对齐自己的目标，且发起对齐的目标和被对齐的目标所在周期时间上必须有重叠，否则会参数校验失败。
- `list` — 批量获取目标下的对齐关系

### objective.indicators

- `list` — 获取目标的量化指标

### objective.key_results

- `list` — 批量获取目标下的关键结果

## 不在本 skill 范围

- 待办任务管理 → 使用 [`lark-task`]（按模块名读取对应工作流）
- 日程安排 → 使用 [`lark-calendar`]（按模块名读取对应工作流）
- 绩效评估 → 使用 [`lark-openapi-explorer`](lark-openapi-explorer-0.md#s-180120bedca6008d) 查找原生接口


