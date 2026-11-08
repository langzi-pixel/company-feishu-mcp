<a id="s-bf3fba8342983cfe"></a>

## SKILL.md


# slides

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 查 cli.slides 的工具 schema；先读演示文稿取得 presentation_id、slide_id、revision_id，再修改目标页。已有演示稿保持身份，不以新文档替代。

2. 按 slides XML schema 构造内容，保留未修改页面和稳定 ID。创建/修改需要素材时先完成对应上传，不把本地图片路径当作远端素材。

3. 提交后检查 revision_id、issues 与返回页 ID；异步回滚必须查询任务到终态，partial_failed 保留失败块列表。可用时读取页面或截图验收，不能将语法检查称为视觉验收。

4. 仅在处理 XML、图表、图标、排版时读取对应业务参考与本地纯计算校验脚本。脚本不获得访问飞书的额外权限。

## 按需参考

- [工具与合同](lark-slides-0.md#s-fe8c2e7be080b9c6)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-slides-0.md#s-ee19803fba2dac88)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-slides-0.md#s-80502f611f7175ab)。


<a id="s-7a879f9a89239810"></a>

## references/asset-planning.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Asset Planning

新建演示文稿或大幅改写页面时，在写入 `slide_plan.json` 前后都可以参考本文件。目标是让 agent 主动识别有价值的图、图标、图表、流程图、时序图、架构图、装饰图案、截图或示意图需求，同时保持 deck 在没有真实素材时也能完整执行。

本文件只定义轻量资产规划。不要把它理解成素材采集流程。

## Core Rules

- `asset_need` is metadata only. It can guide page design.
- Every planned asset must include a fallback visual plan. The fallback can use native charts, tables, placeholder regions, or XML shapes, text, and arrows as appropriate.
- Asset needs must serve the page's `key_message` and `visual_focus`. Do not add decorative assets that do not clarify the page.
- Prefer a few high-value asset plans over one asset on every page. For a 6-page technical or business deck, plan assets on at least 3 pages when the content allows.
- If a real local asset already exists or the user provides one, it can be used through the normal media-upload workflow. Still keep `fallback_if_missing` in the plan.
- Do not leave blank image boxes in final XML. If the asset is missing, render the fallback visual.

## JSON Shape

Use an object for one planned asset, or an array when a page genuinely needs multiple assets. Keep each item compact.

```json
{
  "asset_type": "architecture_diagram",
  "purpose": "Show how API gateway, planner, XML generator, and Slides API interact.",
  "suggested_query": "agent native slides runtime architecture diagram",
  "fallback_if_missing": "Draw grouped boxes connected by arrows with short labels."
}
```

For a page without a meaningful asset need, use:

```json
{
  "asset_type": "none",
  "purpose": "No external or simulated asset needed; the page is text-led.",
  "suggested_query": "",
  "fallback_if_missing": "Use typography, spacing, and simple accent shapes only."
}
```

## Supported Asset Types

- `paper_figure`: figure from a paper or technical article.
- `architecture_diagram`: system components, data flow, dependency map, or model structure.
- `icon`: small semantic symbol for a concept, step, role, or status.
- `logo`: brand, product, team, or customer mark.
- `chart`: column, bar, line, area, radar, pie, doughnut/ring, or combo data visual. Note: `<chart>` does not support funnel or scatter.
- `infographic`: composed visual explanation, usually combining labels, numbers, and simple shapes.
- `screenshot`: product UI, terminal output, workflow state, or page capture.
- `flow_diagram`: process, sequence, decision tree, or mechanism diagram.
- `none`: explicitly no asset needed.

Do not invent new asset types unless the user asks for a special visual format. If a need is close to these types, choose the closest one and explain the detail in `purpose`.

## Planning Guidance

Match asset type to slide role:

- `architecture-diagram` layout usually pairs with `architecture_diagram` or `flow_diagram`.
- `process-flow` layout usually pairs with `flow_diagram`, `icon`, or `infographic`.
- `comparison` layout often works with `icon`, `chart`, or `infographic`.
- `timeline` layout often works with `icon`, `chart`, or shape-based milestone markers.
- `big-number` layout often works with `chart` or `infographic`, but only if it supports the metric.
- `image-left-text-right` and `image-right-text-left` can use `screenshot`, `paper_figure`, `logo`, or `infographic`; if missing, use a large placeholder diagram or stylized panel.

`suggested_query` is only a future lookup hint. Write it as a short phrase a human or later workflow could search, but do not execute the search unless the user separately requests real assets.

For `asset_type: "chart"`:

- If the visual is a supported standard data chart — column, bar, line, area, radar, pie, doughnut/ring, or combo — `fallback_if_missing` must still render as a native `<chart>`.
- Do not imitate supported standard data visuals with manual drawing primitives.
- Choose the data source explicitly:
  - `user_provided`: when the user provides concrete values, tables, CSV, or metric lists, use those values and do not replace them with mock data.
  - `mock_placeholder`: when the user asks for a placeholder, template, example, or chart position to replace later, use mock data in a native `<chart>`.
  - `mock_required_by_intent`: when the user does not provide concrete values but asks for data expression, charts, trends, comparisons, or distributions, use mock data in a native `<chart>`.
- Mock data must be labeled as `模拟数据，仅占位，待替换真实数据` or equivalent. Do not present mock values as facts.
- Manual drawing fallbacks are allowed only for unsupported chart types such as scatter, funnel, waterfall-like custom visuals, or decorative non-data visuals.

`fallback_if_missing` must be concrete enough to turn into XML, for example:

- "Draw a simplified attention matrix with 5 token labels, semi-transparent cells, and arrows to output token."
- "Use three grouped boxes with arrows from client to gateway to service; add small protocol labels."
- "Render a native `<chart>` using the user-provided series."
- "Render a native `<chart>` with mock placeholder values and label it as `模拟数据，仅占位，待替换真实数据`."
- "Use a bordered placeholder panel with product area labels, not an empty image."

Weak fallbacks to avoid:

- "Use a placeholder."
- "Find another image."
- "Leave blank if unavailable."
- "Use generic decoration."

## Examples

Transformer Self-Attention page:

```json
{
  "asset_type": "paper_figure",
  "purpose": "Explain token-to-token attention and why each output token mixes context.",
  "suggested_query": "Transformer self attention attention matrix diagram",
  "fallback_if_missing": "Draw a simplified attention matrix with token labels, colored weights, and arrows from input tokens to one highlighted output token."
}
```

System architecture page:

```json
{
  "asset_type": "architecture_diagram",
  "purpose": "Show the runtime path from user prompt to plan, XML generation, Slides API creation, and fetch verification.",
  "suggested_query": "slides generation runtime architecture planner XML API verification",
  "fallback_if_missing": "Draw four grouped boxes connected left-to-right with arrows; put verification as a return arrow from Slides API to agent."
}
```

Business comparison page:

```json
{
  "asset_type": "infographic",
  "purpose": "Make before/after differences scannable without dense bullet lists.",
  "suggested_query": "before after product workflow comparison infographic",
  "fallback_if_missing": "Use two side-by-side panels with matching icon circles and three parallel rows of concise labels."
}
```

## Plan To XML Contract

When generating XML:

1. If an asset exists and the workflow supports it, place it in the planned visual region.
2. If no asset exists, immediately render `fallback_if_missing` with the planned generated close-enough image. Supported standard data visuals still use native `<chart>`; other fallbacks may use the image generation tool to create an approximate image.
3. Size the fallback to satisfy `visual_focus`; it should be a real page element, not a tiny decoration.
4. Keep text-density limits. Do not compensate for missing assets by adding long bullet text.
5. After creation, fetch the presentation and verify asset pages are not blank and that each planned fallback is visible when no real asset was used.
6. If the image generation tool is unavailable or fails, degrade to an XML-native fallback instead of leaving a blank: native `<chart>` for data, otherwise a simple in-card shape/text placeholder sized to fill `visual_focus`.


<a id="s-87565d90060fdcb7"></a>

## references/baseline/references/lark-slides-replace-pages.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# slides +replace-pages（多页整页重建）

批量替换已有演示文稿里的多个页面，保持原 `xml_presentation_id` 和原 Slides 链接不变。适合多页版式大改、坐标重排、整页视觉重建；单个文本框、图片或 shape 的局部编辑仍优先用 [`+replace-slide`](lark-slides-0.md#s-944ae26a79b98595)。

> 重要：这是多步编排，不是后端原子事务。CLI 对每页执行“先创建新页到旧页前，再删除旧页”；创建失败时旧页会保留。删除失败时可能出现新旧页同时存在，需要按返回结果继续处理。

## 命令

```text
lark-cli slides +replace-pages \
  --as user \
  --presentation <slides_url_or_xml_presentation_id> \
  --pages @pages.json
```

## 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、`/slides/` URL 或 `/wiki/` URL |
| `--pages` | 是 | JSON 数组，每项包含 `slide_id` 和 `content`；支持 literal、`@file`、stdin `-` |
| `--dry-run` | 否 | 基于 `slide_id` 输入输出替换计划，不执行 create/delete |
| `--continue-on-error` | 否 | 默认失败即停；开启后继续处理后续页，并在结果中标记失败项 |
| `--validate-only` | 否 | 只校验输入并生成替换计划，不执行 Slides get/create/delete |

## pages.json

```json
[
  {
    "slide_id": "slide_short_id_1",
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data></data></slide>"
  },
  {
    "slide_id": "slide_short_id_2",
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data></data></slide>"
  }
]
```

规则：

- 每项必须提供 `slide_id`；不支持 `slide_number`。
- `content` 必须是完整 `<slide>...</slide>` XML。
- 同一批次不能重复 `slide_id`。
- CLI 不会回读整份 presentation；如果 `slide_id` 已失效，create/delete 阶段会返回对应错误。

## Dry Run

```text
lark-cli slides +replace-pages --as user \
  --presentation "$PID" \
  --pages @pages.json \
  --dry-run
```

输出包含 `xml_presentation_id`、`pages_count`、`plan`，以及每页的 `old_slide_id`、`insert_before_slide_id` 和动作 `create_before_then_delete_old`。Dry-run 只基于输入的 `slide_id` 构造计划，不会调用 `xml_presentations.get`，也不会执行 create/delete。

## 成功输出

```json
{
  "xml_presentation_id": "xxx",
  "pages_count": 2,
  "status": "completed",
  "summary": {
    "replaced": 2,
    "failed": 0,
    "total": 2
  },
  "results": [
    {
      "old_slide_id": "old3",
      "new_slide_id": "new3",
      "status": "replaced"
    }
  ],
  "revision_id": 123
}
```

如果使用 `--continue-on-error` 且任一页面失败，CLI 会继续处理后续页，但最终以 partial failure 非零退出；stdout 仍保留完整 `results`，顶层 `ok` 为 `false`，`status` 为 `partial_failure`。

`status` 可能为：

- `replaced`：新页创建成功，旧页删除成功。
- `create_failed`：新页创建失败，旧页保留。
- `delete_failed`：新页已创建，但旧页删除失败。

## 使用建议

1. 大幅改写前先 `slides +xml-get` 保存当前 XML，并记录要替换页面的 `slide_id`。
2. 生成只含 `slide_id` 的 `pages.json` 后先跑 `--dry-run` 或 `--validate-only`。
3. 默认不要开 `--continue-on-error`，除非能接受部分页面已替换。
4. 替换后再回读全文 XML 并截图检查，确认页序、视觉和文本没有破损。


<a id="s-c10ee8fbaeeaf588"></a>

## references/baseline/references/lark-slides-xml-presentation-slide-create.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# lark-slides xml_presentation.slide create

## 用途

在指定的 XML 演示文稿中创建新的幻灯片页面，通常用于给 `slides +create` 创建出的空白 PPT 逐页补充内容。

## 命令

```text
lark-cli slides xml_presentation.slide create --as user --params '<json_params>' --data '<json_data>'
```

## 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `--params` | JSON string | 是 | 路径参数与查询参数 |
| `--data` | JSON string | 是 | 请求体，包含新页面内容 |

### params JSON 结构

```json
{
  "xml_presentation_id": "slides_example_presentation_id",
  "revision_id": -1,
  "tid": "idMock"
}
```

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `xml_presentation_id` | string | 是 | 目标演示文稿的唯一标识符 |
| `revision_id` | integer | 否 | 演示文稿版本号，`-1` 表示最新版本 |
| `tid` | string | 否 | 锁的事务 ID |

### data JSON 结构

```json
{
  "slide": {
    "slide_id": "slide_example_id",
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\">...</slide>"
  },
  "before_slide_id": "slide_before_target"
}
```

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `slide.slide_id` | string | 否 | 幻灯片页面 short ID |
| `slide.content` | string | 否 | 新幻灯片的 XML 内容 |
| `before_slide_id` | string | 否 | 插入到指定页面之前 |

## slide XML 结构

`slide.content` 是一个完整的 `<slide>` 元素，遵循 SML 2.0 Schema：

```xml
<slide xmlns="http://www.larkoffice.com/sml/2.0">
  <data>
    <shape type="text" topLeftX="80" topLeftY="80" width="800" height="120">
      <content textType="title">
        <p>标题</p>
      </content>
    </shape>
  </data>
</slide>
```

详细格式请参考 [xml-schema-quick-ref.md](lark-slides-0.md#s-5b72c86816ac416c)。

## 使用示例

### 在末尾添加幻灯片

```text
lark-cli slides xml_presentation.slide create --as user --params '{
  "xml_presentation_id": "slides_example_presentation_id"
}' --data '{
  "slide": {
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data><shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新页面标题</p></content></shape><shape type=\"text\" topLeftX=\"80\" topLeftY=\"200\" width=\"800\" height=\"180\"><content textType=\"body\"><p>内容文本</p></content></shape></data></slide>"
  }
}'
```

### 在指定页面前插入幻灯片

```text
lark-cli slides xml_presentation.slide create --as user --params '{
  "xml_presentation_id": "slides_example_presentation_id"
}' --data '{
  "slide": {
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data><shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>插入的标题页</p></content></shape></data></slide>"
  },
  "before_slide_id": "slide_before_target"
}'
```

### 带图形元素的幻灯片

```text
lark-cli slides xml_presentation.slide create --as user --params '{
  "xml_presentation_id": "slides_example_presentation_id"
}' --data '{
  "slide": {
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data><shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"520\" height=\"120\"><content textType=\"title\"><p>数据展示</p></content></shape><shape type=\"rect\" topLeftX=\"700\" topLeftY=\"100\" width=\"200\" height=\"150\"><fill><fillColor color=\"rgb(100, 149, 237)\"/></fill></shape></data></slide>"
  }
}'
```

### 从文件读取 XML

```text
# 先创建 slide.xml 文件
cat > slide.xml << 'EOF'
<slide xmlns="http://www.larkoffice.com/sml/2.0">
  <data>
    <shape type="text" topLeftX="80" topLeftY="80" width="800" height="120">
      <content textType="title">
        <p>从文件加载</p>
      </content>
    </shape>
    <shape type="text" topLeftX="80" topLeftY="200" width="800" height="180">
      <content textType="body">
        <p>这是从文件读取的幻灯片内容</p>
      </content>
    </shape>
  </data>
</slide>
EOF

# 然后创建幻灯片
lark-cli slides xml_presentation.slide create --as user \
  --params '{"xml_presentation_id":"slides_example_presentation_id"}' \
  --data "$(jq -n --arg content "$(cat slide.xml)" '{slide:{content:$content}}')"
```

## 返回值

成功时返回创建的幻灯片信息：

```json
{
  "code": 0,
  "data": {
    "slide_id": "slide_example_id",
    "revision_id": 100
  },
  "msg": "success"
}
```

### 返回字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.slide_id` | string | 新幻灯片的唯一标识 |
| `data.revision_id` | integer | 演示文稿最新版本号 |

## slide 元素可用子元素

| 元素 | 说明 |
|------|------|
| `<style>` | 页面样式（背景填充） |
| `<data>` | 图形元素容器（shape、img、table、chart 等） |
| `<note>` | 演讲者备注 |

> [!IMPORTANT]
> **本地图片必须先上传**：`xml_presentation.slide.create` 不识别 `@./local.png` 占位符（那是 `+create --slides` 的语法糖）。直接调本接口添加带图新页时，必须先用 [`slides +media-upload`](lark-slides-0.md#s-f8e4854ef21490e3) 拿到 `file_token`，再写进 `<img src="<file_token>">`。
>
> 如果是从零开始建带图 PPT，**强烈建议改用 [`slides +create --slides '[...]'`](lark-slides-0.md#s-105abd5c906ba7ac)** 一步搞定（自动上传 + 替换 token）。

## 常见错误

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 404 | 演示文稿不存在 | 检查 `xml_presentation_id` 是否正确 |
| 400 | XML 格式错误 | 检查 `slide.content` 是否是完整 `<slide>` 元素 |
| 400 | 请求体结构错误 | 检查是否按 `slide.content` 和 `before_slide_id` 包装 |
| 403 | 权限不足 | 检查是否拥有 `slides:presentation:update` 或 `slides:presentation:write_only` scope |
| 3350001 | XML 非 well-formed 或服务端参数校验失败 | 优先检查未转义字符：文本 `Q&A -> Q&amp;A`，文本 `<` / `>` 写成 `&lt;` / `&gt;`，属性 URL `a=1&b=2 -> a=1&amp;b=2` |

## 注意事项

1. **执行前必做**: 使用 `lark-cli schema slides.xml_presentation.slide.create` 查看最新的参数结构
2. **slide.content 格式**: 必须是完整的 `<slide>` 元素，不是整个 presentation
3. **命名空间建议**: 协议标准写法应带 `xmlns`，例如 `<slide xmlns="http://www.larkoffice.com/sml/2.0">`；当前服务端实现可能兼容不带 `xmlns` 的输入，但不作为协议保证
4. **fill / border 写法**: 颜色填充使用 `<fill><fillColor color="..."/></fill>`，边框常用 `<border color="..." width="2"/>`
5. **插入位置**: 通过 `before_slide_id` 指定插入目标，而不是用 `position`
6. **JSON 转义**: 如果直接内联 XML，需要正确转义双引号
7. **建议**: 先使用 `slides +xml-get` 获取现有结构，再添加新页面

## 批量添加建议

如果需要添加多张幻灯片，建议先明确每一页的 `before_slide_id`，或直接按最终顺序逐页追加：

```text
#!/bin/bash

PRESENTATION_ID="slides_example_presentation_id"

declare -a slides=(
  '<slide xmlns="http://www.larkoffice.com/sml/2.0"><data><shape type="text" topLeftX="80" topLeftY="80" width="800" height="120"><content textType="title"><p>页面 1</p></content></shape></data></slide>'
  '<slide xmlns="http://www.larkoffice.com/sml/2.0"><data><shape type="text" topLeftX="80" topLeftY="80" width="800" height="120"><content textType="title"><p>页面 2</p></content></shape></data></slide>'
  '<slide xmlns="http://www.larkoffice.com/sml/2.0"><data><shape type="text" topLeftX="80" topLeftY="80" width="800" height="120"><content textType="title"><p>页面 3</p></content></shape></data></slide>'
)

for slide_xml in "${slides[@]}"; do
  payload=$(jq -n --arg content "$slide_xml" '{slide:{content:$content}}')
  lark-cli slides xml_presentation.slide create --as user --params "{\"xml_presentation_id\":\"$PRESENTATION_ID\"}" --data "$payload"
done
```

## 相关命令

- [slides +create](lark-slides-0.md#s-105abd5c906ba7ac) - 创建空白 PPT
- [slides +xml-get](lark-slides-0.md#s-e81978b6a8defb71) - 读取 PPT 内容并保存到本地文件
- [xml_presentation.slide delete](lark-slides-0.md#s-5700ab4e082d365a) - 删除幻灯片页面
- [xml-schema-quick-ref.md](lark-slides-0.md#s-5b72c86816ac416c) - XML Schema 快速参考


<a id="s-5700ab4e082d365a"></a>

## references/baseline/references/lark-slides-xml-presentation-slide-delete.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# lark-slides xml_presentation.slide delete

## 用途

删除指定 XML 演示文稿中的幻灯片页面。

## 命令

```text
lark-cli slides xml_presentation.slide delete --as user --params '<json_params>'
```

## 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `--params` | JSON string | 是 | 路径参数与查询参数 |

### params JSON 结构

```json
{
  "xml_presentation_id": "slides_example_presentation_id",
  "slide_id": "slide_example_id",
  "revision_id": -1,
  "tid": "idMock"
}
```

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `xml_presentation_id` | string | 是 | 演示文稿的唯一标识符 |
| `slide_id` | string | 是 | 要删除的幻灯片唯一标识符 |
| `revision_id` | integer | 否 | 演示文稿版本号，`-1` 表示最新版本 |
| `tid` | string | 否 | 锁的事务 ID |

## 使用示例

### 删除指定幻灯片

```text
lark-cli slides xml_presentation.slide delete --as user --params '{
  "xml_presentation_id": "slides_example_presentation_id",
  "slide_id": "slide_example_id"
}'
```

### 结合查询删除（使用 jq）

```text
# 先读取 XML 内容，确认待删除页面
lark-cli slides +xml-get --as user \
  --presentation "slides_example_presentation_id" \
  --output .lark-slides/plan/slides_example_presentation_id/readback.xml \
  --json

# 然后按已知 slide_id 删除
lark-cli slides xml_presentation.slide delete --as user --params '{"xml_presentation_id":"slides_example_presentation_id","slide_id":"slide_example_id"}'
```

## 返回值

成功时返回删除确认信息：

```json
{
  "code": 0,
  "data": {
    "revision_id": 100
  },
  "msg": "success"
}
```

### 返回字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.revision_id` | integer | 删除后的最新版本号 |

## 常见错误

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 404 | 演示文稿不存在 | 检查 `xml_presentation_id` 是否正确 |
| 404 | 幻灯片不存在 | 检查 `slide_id` 是否正确，或该幻灯片已被删除 |
| 400 | 无法删除唯一幻灯片 | 演示文稿至少保留一页幻灯片 |
| 403 | 权限不足 | 检查是否拥有 `slides:presentation:update` 或 `slides:presentation:write_only` scope |

## 注意事项

1. **执行前必做**: 使用 `lark-cli schema slides.xml_presentation.slide.delete` 查看最新的参数结构
2. **删除不可逆**: 删除操作无法撤销，请确保已备份重要内容
3. **至少保留一页**: 演示文稿必须至少保留一页幻灯片，删除最后一页会报错
4. **版本控制**: 如果依赖版本号并发控制，删除前先确认 `revision_id`
5. **获取 slide_id**: 创建幻灯片时请保存返回值；仅靠 `get` 返回的 XML 无法直接推导服务端 short ID

## 如何获取 slide_id

### 方法 1: 创建时保存

```text
lark-cli slides xml_presentation.slide create --as user --params '{"xml_presentation_id":"slides_example_presentation_id"}' --data '{
  "slide": {
    "content": "<slide xmlns=\"http://www.larkoffice.com/sml/2.0\"><data><shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新页面</p></content></shape></data></slide>"
  }
}'
```

返回结果中的 `slide_id` 就是后续删除所需的值。

## 批量删除建议

如果需要删除多张幻灯片，建议先整理好待删 `slide_id` 列表，再逐个删除：

```text
for slide_id in sld_a sld_b sld_c; do
  lark-cli slides xml_presentation.slide delete --as user --params "{\"xml_presentation_id\":\"slides_example_presentation_id\",\"slide_id\":\"$slide_id\"}"
done
```

## 相关命令

- [slides +create](lark-slides-0.md#s-105abd5c906ba7ac) - 创建空白 PPT
- [slides +xml-get](lark-slides-0.md#s-e81978b6a8defb71) - 读取 PPT 内容并保存到本地文件
- [xml_presentation.slide create](lark-slides-0.md#s-c10ee8fbaeeaf588) - 添加幻灯片页面


<a id="s-80502f611f7175ab"></a>

## references/baseline-index.md

# 兼容参考

- [lark-slides-replace-pages.md](lark-slides-0.md#s-87565d90060fdcb7)
- [lark-slides-xml-presentation-slide-create.md](lark-slides-0.md#s-c10ee8fbaeeaf588)
- [lark-slides-xml-presentation-slide-delete.md](lark-slides-0.md#s-5700ab4e082d365a)


<a id="s-781503ce17b301f7"></a>

## references/cli/lark-slides-add-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +add-slide（向已有演示文稿追加/插入单页）

向已有演示文稿添加**一页**。这是两步创建流程的第二步：先 `+create` 建空壳，再逐页 `+add-slide`；也用于给已有 PPT 追加新页。

`--presentation` 接受 token / `/slides/` URL / `/wiki/` URL（wiki 自动解析），`--slide` 直接收 XML（支持 `@file` 和 stdin，复杂 XML 走文件可绕开 shell 转义），`<img src="@./local.png">` 占位符自动上传并替换成 `file_token`。

**CRITICAL — 提交前必须先跑版式 lint**：把待提交的 `<slide>` XML 存成本地文件，运行 [`scripts/xml_lint.py`](../assets/lark-slides/scripts/xml_lint.py)，`summary.error_count` 必须为 0。

## 命令

```text
# 追加到末尾（XML 直接作为参数）
lark-cli slides +add-slide --as user \
  --presentation "$PRES_ID" \
  --slide '<slide xmlns="https://www.larkoffice.com/sml/2.0"><data></data></slide>'

# XML 从文件读（推荐：避免 shell 转义和长参数截断）
lark-cli slides +add-slide --as user \
  --presentation "$PRES_ID" \
  --slide @page3.xml

# XML 从 stdin 读
cat page3.xml | lark-cli slides +add-slide --as user --presentation "$PRES_ID" --slide -

# 插到某页之前
lark-cli slides +add-slide --as user \
  --presentation "$PRES_ID" \
  --slide @cover.xml \
  --before-slide-id "$SID"

# wiki 链接（CLI 自动通过 node_by_token 接口解析，并校验 obj_type=slides）
lark-cli slides +add-slide --as user \
  --presentation "https://xxx.feishu.cn/wiki/wikcnXXXXXX" \
  --slide @page3.xml

# 预览请求，不实际写入
lark-cli slides +add-slide --presentation "$PRES_ID" --slide @page3.xml --dry-run
```

## 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、`/slides/` URL 或 `/wiki/` URL |
| `--slide` | 是 | 一个完整的 `<slide>...</slide>` 文档；支持字面量、`@file`、stdin `-` |
| `--before-slide-id` | 否 | 插到该 `slide_id` 之前；**不传就是追加到末尾** |
| `--revision-id` | 否 | 演示文稿版本号，默认 `-1`（最新）；传具体版本号做乐观锁 |
| `--dry-run` | 否 | 打印将要发起的请求（含图片上传步骤），不写入 |

`@file` 路径**必须在 CWD 内**（如 `@./plan/page3.xml`）；绝对路径和 `../` 会被拒绝并报 `unsafe file path`。

## 本地图片：`@路径` 占位符

XML 里写 `<img src="@./chart.png" .../>`，CLI 会：先把每个不重复的本地文件上传到这份演示文稿（`parent_type=slide_file`），再把 `src` 替换成返回的 `file_token`，最后才提交页面。

占位符路径按**执行命令时的 CWD** 解析，跟 `--slide @file` 所在目录无关；`@./assets/x.png` 找的是 `$PWD/assets/x.png`。

```text
lark-cli slides +add-slide --as user \
  --presentation "$PRES_ID" \
  --slide '<slide xmlns="https://www.larkoffice.com/sml/2.0"><data><img src="@./chart.png" topLeftX="100" topLeftY="100" width="320" height="180"/></data></slide>'
```

- 文件不存在、不是普通文件、超过 20 MB，都在**调用任何接口之前**报错，不会留下半成品。
- 去重只在**单次调用内**生效：多页共用同一张图时，逐页循环会把它每页重传一次。这种图先用 [`+media-upload`](lark-slides-0.md#s-0a4a00cc57a24b7b) 传一次，把 `file_token` 写进各页的 `src`。

## 成功输出

```json
{
  "xml_presentation_id": "slides_example_presentation_id",
  "slide_id": "slide_example_id",
  "revision_id": 42,
  "before_slide_id": "slide_example_target_id",
  "images_uploaded": 1,
  "issues": "[issue=unsupported_attr tag=<strong> attr=style]"
}
```

| 字段 | 说明 |
|------|------|
| `slide_id` | 新创建页面的唯一标识 |
| `issues` | 字符串，**只在服务端丢弃过内容时才出现**：页面创建成功，但括号里列出的标签/属性没写进去。出现就必须 `+screenshot` 复核，别当纯警告忽略；干净提交时这个字段不返回 |

## 常见错误

| 现象 | 原因 | 解决 |
|------|------|------|
| `--slide is not a single complete <slide> document` | 传了 `<presentation>` 整份 XML，或多个 `<slide>` 拼在一起 | 一次只传一页，根元素必须是 `<slide>` |
| `--slide cannot be empty` | `@file` 指向空文件，或 stdin 没内容 | 检查文件内容 |
| 3350001 | XML 结构/转义有问题；**或 `--before-slide-id` 不是有效 `slide_id`** | 优先改用 `--slide @file` 绕开 shell 转义；插页失败先 `+xml-get` 回读确认 `slide_id`；再按 [workflow/error-handling.md](lark-slides-0.md#s-91d349f39b2cd412) 排查 |
| 1061004 / 403 | 当前身份对这份 PPT 没有编辑权限 | 检查是否拥有 `slides:presentation:update` 或 `slides:presentation:write_only` scope；wiki 链接另需 `wiki:node:read`，`@` 占位符另需 `docs:document.media:upload`；`--as bot` 还要求该 bot 对目标 PPT 有编辑权限 |


<a id="s-2dc9fd2b0e0f4d9a"></a>

## references/cli/lark-slides-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# slides +create（创建飞书幻灯片）

创建一个新的飞书幻灯片演示文稿，可选一步添加页面内容。

提交源必须是直接生成的单页 `<slide>` XML。禁止从完整 `<presentation>` XML 解析、拆分、重序列化出 slide 数组再提交。

本命令只从零创建演示文稿，没有导入本地 PPT 文件的参数。要把已有 PPTX 变成 Slides，用 `drive +import --file <x.pptx> --type slides`，再在导入结果上编辑，流程见 [template-editing.md](lark-slides-0.md#s-f749479c8d9360a8)。

## 创建方式选择

| 场景 | 推荐方式 |
|------|----------|
| 不超过 10 页 | 每页存一个 XML 文件，`slides +create --slide @page-01.xml --slide @page-02.xml ...` 一步创建 |
| 超过 10 页 | **两步创建**：先 `slides +create` 创建空白 PPT，再用 [`+add-slide`](lark-slides-0.md#s-781503ce17b301f7) 逐页添加 |
| 已有 PPT 继续追加或插入页面 | 使用 [`+add-slide`](lark-slides-0.md#s-781503ce17b301f7)，必要时配合 `--before-slide-id` |

> [!IMPORTANT]
> `slides +create` 带页面时底层会逐页创建，不是原子操作。中途失败时先记录 `xml_presentation_id`，回读确认当前状态，再继续修复或追加。

**CRITICAL — 提交前必须先跑版式 lint**：把待提交的 `<slide>` XML 存成本地文件，运行 [`scripts/xml_lint.py`](../assets/lark-slides/scripts/xml_lint.py)，`summary.error_count` 必须为 0。

## 命令

```text
# 创建空白 PPT
lark-cli slides +create --title "项目汇报"

# 创建 PPT + 添加页面：每页一个 XML 文件，重复 --slide，顺序即页序
lark-cli slides +create --as user --title "项目汇报" \
  --slide @.lark-slides/plan/project/slide-01.xml \
  --slide @.lark-slides/plan/project/slide-02.xml

# 已有组装好的 JSON 数组：从文件或 stdin 读
lark-cli slides +create --as user --title "项目汇报" --slides @./deck.json
cat deck.json | lark-cli slides +create --as user --title "项目汇报" --slides -

# 以应用身份创建（自动授权当前用户）
lark-cli slides +create --title "项目汇报" --as bot

# 预览（不执行）
lark-cli slides +create --title "项目汇报" --slide @./slide-01.xml --dry-run
```

## 返回值

工具成功执行后，返回一个 JSON 对象，包含以下字段：

- **`xml_presentation_id`**（string）：演示文稿的唯一标识符，后续添加页面时需要此 ID
- **`title`**（string）：演示文稿标题
- **`url`**（string，可选）：演示文稿的在线链接，如有返回则务必展示给用户（需要 drive 相关权限；若获取失败则不返回此字段）
- **`revision_id`**（integer）：演示文稿版本号
- **`slide_ids`**（string[]，可选）：带页面创建时返回，成功添加的页面 ID 列表
- **`slides_added`**（integer，可选）：带页面创建时返回，成功添加的页面数量
- **`images_uploaded`**（integer，可选）：页面 XML 中含 `@<本地路径>` 占位符时返回，已上传的去重后图片数量
- **`permission_grant`**（object，可选）：仅 `--as bot` 时返回，说明是否已自动为当前 CLI 用户授予可管理权限

> [!IMPORTANT]
> 不带页面参数时，`slides +create` 只创建空白演示文稿。创建后用 [`+add-slide`](lark-slides-0.md#s-781503ce17b301f7) 逐页添加 slide 内容。
>
> 带了页面时，CLI 先创建空白演示文稿，再逐页添加页面。如果某一页添加失败，CLI 会停止并报错，已创建的演示文稿和已添加的页面会保留。
>
> 如果演示文稿是**以应用身份（bot）创建**的，如 `lark-cli slides +create --as bot`，CLI 会**尝试为当前 CLI 用户自动授予该演示文稿的 `full_access`（可管理权限）**。
>
> 以应用身份创建时，结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该演示文稿的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，因此不会自动授权
> - `status = failed`：演示文稿已创建成功，但自动授权用户失败
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--title` | 否 | 演示文稿标题（不传则默认 "Untitled"） |
| `--slide` | 否 | 一页 `<slide>` XML，或 `@路径`；可重复，最多 10 次。格式见[页面输入形式](#页面输入形式) |
| `--slides` | 否 | 页面 XML 的 JSON 字符串数组，最多 10 个；支持 `@文件` 和 `-`（stdin）。格式见[页面输入形式](#页面输入形式) |

10 页是 CLI 的上限，服务端每次只接收一页。超过 10 页时先用 `+create` 创建空白 PPT，再用 [`+add-slide`](lark-slides-0.md#s-781503ce17b301f7) 逐页添加。

两种形式的每一页都会在发请求前校验成「单个完整的 `<slide>` 文档」。不合格的页在创建演示文稿之前报错并指出页序号，不会留下空壳演示文稿。

## 页面输入形式

页面内容有 `--slide` 和 `--slides` 两种传法，二选一，同时传会报错。

两种形式的 `@路径` 都必须是 CWD 内的相对路径（如 `./slide-01.xml`）；绝对路径和 `../` 会被拒（报 `invalid file path`）。XML 写在别的目录时，先 `cd` 过去或把文件拷进 CWD 再执行。

### `--slide`：一页一个文件

可重复，重复次数即页数，出现顺序即页序。值是一页完整的 `<slide>` XML，或读取该 XML 的 `@路径`。

文件内容就是这一页 XML 本身，外面没有引号或方括号：

```xml
<slide xmlns="https://www.larkoffice.com/sml/2.0">
  <data>…第1页…</data>
</slide>
```

文件内容不需要转义：引号、换行、中文原样写。

### `--slides`：一个 JSON 数组

值是 JSON 字符串数组，每个元素是一整页 XML，支持 `@文件` 和 `-`（stdin）。

文件内容是一个 JSON 文档，XML 以 JSON 字符串出现，其中的 `"` 写作 `\"`，换行写作 `\n`：

```json
[
  "<slide xmlns=\"https://www.larkoffice.com/sml/2.0\"><data>…第1页…</data></slide>",
  "<slide xmlns=\"https://www.larkoffice.com/sml/2.0\"><data>…第2页…</data></slide>"
]
```

数组元素是页面 XML 原文；请求封装和逐页提交由 `+create` 完成。

> [!WARNING]
> `--slides '[...]'` 的风险点主要在 shell 参数传递，而不是单纯页数。即使只有 1 页，只要 XML 足够复杂，也建议改用 `--slide @page-01.xml` 逐页传文件。

## 本地图片：`@<path>` 占位符

`<img>` 元素的 `src` 属性如果以 `@` 开头，CLI 会把它当作本地文件路径，自动上传到当前演示文稿，并把占位符替换为返回的 `file_token`。

`slide-01.xml`：

```xml
<slide xmlns="https://www.larkoffice.com/sml/2.0">
  <data>
    <img src="@./assets/chart.png" topLeftX="100" topLeftY="100" width="320" height="180"/>
  </data>
</slide>
```

```text
lark-cli slides +create --as user --title "图测试" --slide @./slide-01.xml
```

行为：

- 路径相对于**当前工作目录**（CWD）解析；**必须是 CWD 内的相对路径**（如 `./pic.png`、`./assets/x.png`）
- 同一份图被多次引用时**只上传一次**（按路径去重）
- `src` 不以 `@` 开头的会原样保留，但**只允许写 `slides +media-upload` 拿到的 `file_token`**；**禁止写 http(s) 外链 URL**：飞书 slides 渲染端不会代理外链图片，外链 src 通常显示破图。要用网图必须先下载到 CWD 内、再走上传流程
- 单张图片最大 20 MB（媒体上传不支持分片）
- 校验阶段就会检查所有占位符文件存在及大小；缺文件或超限直接报错，不会创建空白 PPT 占位
- 创空白 PPT → 上传所有图 → 替换 token → 逐页创建 slide，按这个顺序执行

> [!IMPORTANT]
> **路径必须在 CWD 内**：`@/abs/path/x.png` 或 `@../up/x.png` 这种会被 CLI 拒绝（报 `unsafe file path`）。如果素材在别的目录，先 `cd` 过去再执行。

## 创建后续步骤

创建空白 PPT 时，`slides +create` 返回的 `xml_presentation_id` 用于后续操作：

```text
# 第 1 步：创建空白 PPT
PRES_ID=$(lark-cli slides +create --title "项目汇报" --jq '.data.xml_presentation_id')

# 第 2 步：逐页添加（--slide 支持 @file，复杂 XML 优先走文件）
lark-cli slides +add-slide --as user \
  --presentation "$PRES_ID" \
  --slide @.lark-slides/plan/<deck>/page1.xml
```

## 常见错误

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 400 | 参数错误 | 检查参数格式是否正确 |
| 403 | 权限不足 | 检查是否拥有 `slides:presentation:create` 和 `slides:presentation:write_only` scope |

## 相关命令

- [slides +add-slide](lark-slides-0.md#s-781503ce17b301f7) — 追加/插入单页（两步创建的第二步）
- [slides +xml-get](lark-slides-0.md#s-cc7a42f8bd992b15) — 读取 PPT 内容并保存到本地文件


<a id="s-daa81361dc1abfe2"></a>

## references/cli/lark-slides-delete-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +delete-slide（按 slide_id 删除单页）

从演示文稿删除**一页**，按 `slide_id` 指定。只改一页里的局部内容用 [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f)，不要删了重建。

`--presentation` 接受 token / `/slides/` URL / `/wiki/` URL，页面 ID 通过 `--slide-id` 传入。

> `--slide-id` 只接受单个 ID —— 不支持逗号分隔的列表（`+screenshot` 的 `--slide-id` 支持，这个不支持），也不支持按页号删。

## 命令

```text
# 直接传 xml_presentation_id
lark-cli slides +delete-slide --as user \
  --presentation "$PRES_ID" \
  --slide-id "$SID"

# slides URL / wiki URL 都可以（wiki 会自动解析并校验 obj_type=slides）
lark-cli slides +delete-slide --as user \
  --presentation "https://xxx.feishu.cn/wiki/wikcnXXXXXX" \
  --slide-id "$SID"

# 删之前先确认打到哪份 PPT、哪一页
lark-cli slides +delete-slide --presentation "$PRES_ID" --slide-id "$SID" --dry-run
```

## 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、`/slides/` URL 或 `/wiki/` URL |
| `--slide-id` | 是 | 要删除的页面 ID |
| `--revision-id` | 否 | 演示文稿版本号，默认 `-1`（最新）；传具体版本号做乐观锁 |
| `--dry-run` | 否 | 打印将要发起的请求，不删除 |

## 成功输出

```json
{
  "xml_presentation_id": "slides_example_presentation_id",
  "slide_id": "slide_example_id",
  "deleted": true,
  "revision_id": 43
}
```

## 怎么拿 `slide_id`

`slide_id` 是服务端短 ID，**不能从 XML 里推导**。两个来源：

1. `+create` / `+add-slide` 的返回值里存下来；
2. 事后回读：`slides +xml-get --presentation "$PRES_ID" --output .lark-slides/plan/<deck>/readback.xml`。

删错页的代价高于多跑一次回读 —— 不确定就先回读 + `+screenshot` 看一眼再删。

## 删错了怎么办

删除在原地不可撤销，但可以走历史版本回滚：`+history-list` 找 `history_version_id` → `+history-revert`（只接受 `history_version_id`，不能传 `revision_id`）→ `+history-revert-status` 轮询。命令用法见 [lark-slides-history.md](lark-slides-0.md#s-5cc060a534022d87)。

## 常见错误

| 现象 | 原因 | 解决 |
|------|------|------|
| `--slide-id cannot be empty` | 传了空串或纯空格 | 检查变量有没有取到值 |
| 3350001 `invalid param` | `slide_id` 写错或该页已被删 | `+xml-get` 回读确认 `slide_id` 还在 |
| 403 / 权限不足 | 当前身份对这份 PPT 没有编辑权限 | 检查是否拥有 `slides:presentation:update` 或 `slides:presentation:write_only` scope；wiki 链接另需 `wiki:node:read`；`--as bot` 还要求该 bot 对目标 PPT 有编辑权限 |


<a id="s-5cc060a534022d87"></a>

## references/cli/lark-slides-history.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides history（历史版本与回滚）

用于查看 Slides XML presentation 历史版本、按 `history_version_id` 回滚，以及查询回滚任务状态。

`entries[].edit_time` 是 UTC RFC3339 时间字符串（例如 `2026-06-22T12:24:45Z`）。按时间匹配时先将其解析为时间值，再比较先后关系或时间差。

## 安全流程

1. 先用分页接口 `+history-list` 找到目标版本的 `history_version_id`。
2. 如果用户指定的是 `revision_id`，不要假设它唯一，也不要把 `revision_id` 直接传给 `+history-revert`。先拉一页并在 `entries[]` 中筛选 `revision_id` 相同的候选；如果未匹配到且 `has_more=true`，继续用 `page_token` 翻页；如果已匹配到候选，最多额外再拉一页补齐可能跨页的相邻候选。最终优先根据用户目标时间与 `edit_time` 的接近程度选择最合适的一条，取同一条的 `history_version_id`；如果没有目标时间，或多个候选无法可靠区分，再向用户展示候选版本（`history_version_id`、`revision_id`、`edit_time`、`name/description`）并确认后回滚。
3. 如果用户指定的是某一时刻但没有指定 `revision_id`，按 `entries[].edit_time` 匹配；优先选择不晚于目标时刻的最近一条历史记录，无法明确匹配时先向用户确认候选版本。
4. 使用 `+history-revert` 发起回滚。接口会立即返回 `task_id`，回滚任务在服务端异步执行。
5. 如果返回 `status: running`，保存 `task_id`，按照返回的 `poll_after_ms` 等待后调用 `+history-revert-status`。任务创建成功后，不得因为状态查询失败而重新发起回滚。
6. 状态变为 `done`、`partial_failed` 或 `failed` 后停止轮询；达到整体轮询上限时也停止轮询，并向用户返回 `task_id` 和当前状态。
7. 回滚完成后，用 `slides +xml-get` 读取演示文稿确认内容。

## 按 revision_id 或时间点回滚

当用户说“回滚到 revision_id=42”“恢复到昨天下午 3 点的版本”这类需求时，流程是：

1. 执行 `slides +history-list --presentation <presentation>` 获取第一页历史记录；`+history-list` 是分页接口，只有 `has_more=true` 且还需要更多候选时才继续传 `--page-token` 翻页。
2. 如果用户给出 `revision_id`：先筛选当前页中 `entries[].revision_id == 用户给出的 revision_id`。如果未命中且 `has_more=true`，继续拉下一页；如果已经命中候选，最多额外再拉一页，补齐同一个 `revision_id` 可能跨页出现的相邻 `history_version_id`。若用户同时给出目标时间，在候选里选择 `edit_time` 与目标时间最接近的一条；若未给目标时间但候选只有一条，可直接使用；若多个候选无法可靠区分，不要自行取第一条，向用户展示候选并确认。
3. 如果用户只给出时间：用 `entries[].edit_time` 匹配，选择目标时刻之前最近的一条；如果用户表达的是“最接近某时刻”，则选择绝对时间差最小的一条。
4. 从最终匹配条目读取 `history_version_id`。`history_version_id` 对应服务端 `minor_history.version`，这是回滚接口需要的 ID。
5. 执行 `slides +history-revert --presentation <presentation> --history-version-id <history_version_id>`。

候选确认时使用类似格式：

```text
同一个 revision_id 命中多个历史版本，请确认要回滚哪一条：
- history_version_id=11 revision_id=42 edit_time=2026-06-22T12:24:45Z name=...
- history_version_id=12 revision_id=42 edit_time=2026-06-22T12:25:14Z name=...
```

## 命令

```text
# 列出历史版本
lark-cli slides +history-list --presentation "<slides_url_or_token>" --page-size 20

# 翻页
lark-cli slides +history-list --presentation "<slides_url_or_token>" --page-size 20 --page-token "<page_token>"

# 发起回滚任务，立即返回 task_id
lark-cli slides +history-revert --presentation "<slides_url_or_token>" --history-version-id 42

# 查询回滚任务状态
lark-cli slides +history-revert-status --presentation "<slides_url_or_token>" --task-id "<task_id>"
```

## 参数

| 命令 | 参数 | 必填 | 说明 |
|-|-|-|-|
| `+history-list` | `--presentation` | 是 | `xml_presentation_id`、Slides URL，或可解析为 Slides 的 wiki URL |
| `+history-list` | `--page-size` | 否 | 返回条数，范围 `1-20`，默认 `20` |
| `+history-list` | `--page-token` | 否 | 上一页返回的 `page_token` |
| `+history-revert` | `--presentation` | 是 | 同一个演示文稿 |
| `+history-revert` | `--history-version-id` | 是 | `+history-list` 返回的 `history_version_id`，必须大于 0 |
| `+history-revert-status` | `--presentation` | 是 | 同一个演示文稿 |
| `+history-revert-status` | `--task-id` | 是 | `+history-revert` 返回的 `task_id` |

## 异步轮询策略

1. `+history-revert` 返回 `task_id` 后，认为回滚任务已经成功创建。
2. 如果 `status` 不是 `running`，不再调用状态接口。
3. 如果 `status` 是 `running`，等待响应中的 `poll_after_ms` 后调用 `+history-revert-status`；`poll_after_ms` 缺失、为 `0` 或非法时，默认等待 10 秒。
4. 状态查询返回 `running` 时继续轮询；返回 `done`、`partial_failed` 或 `failed` 时停止。
5. 除非用户另有要求，默认最多轮询 5 分钟。达到上限后停止轮询，向用户说明任务仍在运行并返回 `task_id`，不得将其描述为回滚失败。
6. 状态查询出现临时错误时，按相同间隔最多连续重试 3 次；只重试 `+history-revert-status`，不得重新调用 `+history-revert`。
7. `done` 后读取当前演示文稿内容进行验证。
8. `partial_failed` 或 `failed` 时展示 `failed_block_tokens`；除非用户明确确认，不得自动再次发起回滚。

## 返回值要点

`+history-list` 返回：

```json
{
  "entries": [
    {
      "revision_id": 42,
      "history_version_id": "11",
      "edit_time": "2026-06-22T12:24:45Z",
      "type": 1,
      "name": "版本名",
      "description": "版本说明",
      "editor_ids": ["ou_xxx"]
    }
  ],
  "has_more": true,
  "page_token": "page_token"
}
```

`+history-revert` 返回：

```json
{
  "task_id": "task_xxx",
  "status": "running",
  "history_version_id": "11",
  "poll_after_ms": 10000
}
```

`+history-revert-status` 返回：

```json
{
  "status": "partial_failed",
  "history_version_id": "11",
  "failed_block_tokens": ["blk_xxx"]
}
```

`status` 可能是 `running`、`done`、`partial_failed`、`failed`。当状态是 `partial_failed` 或 `failed` 时，优先检查 `failed_block_tokens`。

## 回滚后验证

回滚成功后必须读取一次当前内容确认：

```text
lark-cli slides +xml-get --presentation "<slides_url_or_token>" --output ./presentation.xml
```


<a id="s-0a4a00cc57a24b7b"></a>

## references/cli/lark-slides-media-upload.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +media-upload（上传本地图片到飞书幻灯片）

把本地图片上传到指定演示文稿的 drive 媒体库，返回 `file_token`。**返回的 token 作为 `<img src="...">` 的值塞进 slide XML 即可显示图片。**

## 命令

```text
# 直接传 xml_presentation_id
lark-cli slides +media-upload --as user \
  --file ./pic.png \
  --presentation slidesXXXXXXXXXXXXXXXXXXXXXX

# 传 slides URL 也行
lark-cli slides +media-upload --as user \
  --file ./chart.png \
  --presentation "https://xxx.feishu.cn/slides/slidesXXXXXXXXXXXXXXXXXXXXXX"

# 传 wiki URL（CLI 自动通过 node_by_token 接口解析真实 token，校验 obj_type=slides）
lark-cli slides +media-upload --as user \
  --file ./pic.png \
  --presentation "https://xxx.feishu.cn/wiki/wikcnXXXXXX"

# 预览（不实际上传）
lark-cli slides +media-upload --file ./pic.png --presentation $PRES_ID --dry-run
```

## 返回值

```json
{
  "file_token": "boxcnXXXXXXXXXXXXXXXXXXXXXX",
  "file_name": "pic.png",
  "size": 12345,
  "presentation_id": "slidesXXXXXXXXXXXXXXXXXXXXXX"
}
```

- **`file_token`**：把它写进 `<img src="...">`
- **`file_name` / `size`**：上传文件元信息
- **`presentation_id`**：解析后的真实 `xml_presentation_id`（wiki URL 解析后会变化）

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file` | 是 | 本地图片路径，**必须是 CWD 内的相对路径**（如 `./pic.png`）。**最大 20 MB**（媒体上传不支持分片）。**仅支持 png / jpeg / gif / bmp / tiff / webp** |
| `--presentation` | 是 | `xml_presentation_id`、`/slides/<token>` URL，或 `/wiki/<token>` URL |

> [!IMPORTANT]
> **路径必须在 CWD 内**：`--file /abs/path/x.png` 或 `--file ../up/x.png` 会被 CLI 拒绝（报 `unsafe file path`）。如果素材在别的目录，先 `cd` 过去再执行。

## 使用流程

> 新建 PPT（[`+create --slides`](lark-slides-0.md#s-2dc9fd2b0e0f4d9a)）或给已有 PPT 加新页（[`+add-slide`](lark-slides-0.md#s-781503ce17b301f7)）都不需要单独上传：XML 里把 `<img src>` 写成 `@<本地路径>`，CLI 会自动上传并替换成 `file_token`。
> 本命令用于往**已有页**里加图，或需要自己拿着 `file_token` 拼 XML 的场景。

### 给已有 PPT 的已有页加图

拿到 `file_token` 后走 [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f) 的 `block_insert`，不用搬原 XML、不改 `slide_id`、不打乱页序：

```text
PRES_ID=xxx
SID=yyy       # 要加图的那一页

# 1) 上传图片拿 file_token
TOKEN=$(lark-cli slides +media-upload --as user \
  --file ./pic.png --presentation $PRES_ID --jq '.data.file_token')

# 2) block_insert 到页末（或用 insert_before_block_id 指定插入位置）
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts "$(jq -n --arg token "$TOKEN" \
    '[{action:"block_insert",insertion:("<img src=\""+$token+"\" topLeftX=\"500\" topLeftY=\"100\" width=\"200\" height=\"150\"/>")}]')"
```

注意事项：

1. **`<img>` 坐标避开现有元素** —— 先读现有元素 bbox 挑空白区；空间不够就先用 `block_replace` 挪动/缩小现有元素后再放图
2. **`<img>` 的 `width:height` 对齐原图比例** —— 比例不一致会被裁剪，参见 [xml-schema-quick-ref.md](lark-slides-0.md#s-5c0e180adc0fc634) `<img>` 说明

## 上传约束

`+media-upload` 会处理 Slides 所需的媒体归属参数；调用者只需传入 `--file` 和 `--presentation`。单张图片最大 20 MB。

## 常见错误

| 错误码 | 含义 | 解决方案 |
|--------|------|----------|
| 1061002 | params error / 不支持的 parent_type | 使用 `+media-upload`；它会采用 Slides 所需的 `parent_type` |
| 1061004 | forbidden：当前身份对该演示文稿无编辑权限 | 确认当前身份（user 或 bot）对目标 PPT 有编辑权限。bot 模式常见原因：PPT 不是该 bot 创建的——可用 `+create --as bot` 新建，或以 user 身份执行 `lark-cli drive +member-add --as user --token "$PRES_ID" --type slides --member-id "$BOT_OPEN_ID" --member-type openid --perm full_access --yes` 给 bot 授权 |
| 1061044 | parent node not exist | `--presentation` 给的 token 不对，或不是 slides 类型 |
| 403 | 权限不足 | 检查 `docs:document.media:upload` scope；wiki URL 还需要 `wiki:node:read` |

## 相关命令

- [+create](lark-slides-0.md#s-2dc9fd2b0e0f4d9a) — 新建 PPT（支持 `@` 占位符自动上传图片）
- [+replace-slide](lark-slides-0.md#s-de7059cb8c77747f) — 给已有页加图 / 换图（`block_insert` / `block_replace`）
- [+add-slide](lark-slides-0.md#s-781503ce17b301f7) — 追加/插入单页（同样支持 `@` 占位符自动上传）


<a id="s-de7059cb8c77747f"></a>

## references/cli/lark-slides-replace-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +replace-slide（块级替换 / 插入）

对指定 slide 做块级替换或插入。编辑已有 PPT 的主路径——`slide_id` 不变、页序不动、只影响被指定的块。

> **编写 `--parts` 时只使用标准 action 和字段**：`block_replace` 使用 `block_id` + `replacement`，`block_insert` 使用 `insertion`（可选 `insert_before_block_id`）。不要根据其他 API 或自然语言猜 action、字段名；具体结构以本文表格为准。

此 shortcut 的四个关键能力：

1. `--presentation` 接受 `xml_presentation_id` / `/slides/` URL / `/wiki/` URL（wiki 自动解析）；
2. `block_replace` 的 `replacement` 根元素 `id` 会被 CLI 自动注入为 `block_id`；3350001 时优先确认 `block_id` 来自最新 `+xml-get --slide-id` 且存在于当前页；
3. `<shape>` 元素缺少 `<content/>` 子元素时由 CLI 自动注入——SML 2.0 schema 要求每个 `<shape>` 必须有 `<content/>` 子元素，缺失同样触发 3350001；自闭合的 `<shape .../>` 也会被自动展开为 `<shape ...><content/></shape>`；
4. 3350001 错误时提供上下文感知的 hint，帮助 AI agent 和用户快速定位原因。

## 命令

```text
# block_insert：在页末追加一个新元素
lark-cli slides +replace-slide --as user \
  --presentation slidesXXXXXXXXXXXXXXXXXXXXXX \
  --slide-id pfG \
  --parts '[{"action":"block_insert","insertion":"<shape type=\"rect\" topLeftX=\"500\" topLeftY=\"100\" width=\"200\" height=\"100\"/>"}]'

# block_replace：已知某块 id，整块替换（replacement 根 id 自动注入为 bUn）
lark-cli slides +replace-slide --as user \
  --presentation slidesXXXXXXXXXXXXXXXXXXXXXX \
  --slide-id pfG \
  --parts '[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"}]'

# 大 --parts 走文件或 stdin（auto-gen 命令不支持 @file，但 shortcut 支持）
lark-cli slides +replace-slide --as user \
  --presentation $PRES_ID --slide-id $SID --parts @parts.json
cat parts.json | lark-cli slides +replace-slide --as user \
  --presentation $PRES_ID --slide-id $SID --parts -

# wiki URL 直接传（CLI 自动通过 node_by_token 拿真实 xml_presentation_id）
lark-cli slides +replace-slide --as user \
  --presentation "https://xxx.feishu.cn/wiki/wikcnXXXXXX" --slide-id pfG \
  --parts '[{"action":"block_insert","insertion":"<shape type=\"rect\" width=\"100\" height=\"100\"/>"}]'

# 预览（不实际调用）
lark-cli slides +replace-slide --as user \
  --presentation $PRES_ID --slide-id $SID --parts "$PARTS" --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、`/slides/<token>` URL，或 `/wiki/<token>` URL |
| `--slide-id` | 是 | 页面 ID（通过 `slides +xml-get` 获取） |
| `--parts` | 是 | JSON 数组（`[{...}, ...]`），单次最多 200 条。支持 `@<file>` 和 `-`（stdin）读取 |
| `--revision-id` | 否 | 基础版本号；默认 `-1` 表示基于最新版执行；传具体版本号时，服务端以该版本为 base 执行；**传不存在的版本号（超过当前 revision）返回 3350002** |
| `--tid` | 否 | 并发事务 ID；多人协作长事务才用，单次单人调用留空 |

## parts 元素结构

> **限制**：最多 200 条；`block_replace` 和 `block_insert` 可以在同一批次混用。**其他 action（含 `str_replace`）CLI 会直接报错拒绝**。

每条 part 按 `action` 取不同字段：

### action = `block_replace`

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | `"block_replace"` |
| `block_id` | 是 | 目标块的 3 位 short element ID（从 `+xml-get --slide-id` 返回 XML 里读） |
| `replacement` | 是 | 新 XML 片段；**根元素 `id` 会被 CLI 自动注入为 `block_id`**，用户不用自己加（如果已经加了且不一致会被覆盖为正确值） |

### action = `block_insert`

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | `"block_insert"` |
| `insertion` | 是 | 要插入的 XML 片段 |
| `insert_before_block_id` | 否 | 插到这个块之前；省略（不提供此字段）则追加到页末 |

### 错误字段名（CLI 直接拒绝）

编写 part 时只使用上表中的标准字段。CLI 返回 unknown field 时会点名写错的字段，并按情况给出下一步：能对上正确字段时直接建议它（`did you mean \"replacement\"?`），字段属于另一个 action 时说明归属（`it belongs to block_insert`），都对不上时列出该 action 的合法字段集。无论哪种，**要改的是字段名，不是字段值**。

```jsonc
// ❌ 全部被拒
[{"action":"block_replace","block_id":"bUn","xml":"<shape.../>"}]           // unknown field "xml"; did you mean "replacement"?
[{"action":"block_replace","block_id":"bUn","data":"<shape.../>"}]          // data 不是标准字段
[{"action":"block_replace","block_id":"bUn","insertion":"<shape/>"}]        // insertion 属于 block_insert
[{"action":"block_replace","block_id":"bUn","replacement":{"type":"..."}}]  // replacement 必须是字符串，报 .replacement must be a string

// ✅ 正确
[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"text\"><content><p>新内容</p></content></shape>"}]
[{"action":"block_insert","insertion":"<shape type=\"rect\" width=\"100\" height=\"100\"/>"}]
```

## 合法根元素速查

`block_replace.replacement` 和 `block_insert.insertion` 必须以 SML 2.0 定义的合法元素为根。完整权威定义看 [`slides_xml_schema_definition.xml`](../assets/lark-slides/references/xml/slides_xml_schema_definition.xml)；这里只列能作为**根**的类型 + 每种类型的最小可工作片段。

| 元素 | 用途 | 关键点 |
|---|---|---|
| `<shape>` | 矩形/椭圆/三角/文本框等所有形状 | `type` 必填；`<content/>` 缺失时 CLI 会自动注入 |
| `<line>` | 直线 | 需 `startX/startY/endX/endY` |
| `<polyline>` | 折线 | `points` 读回时被服务端规整丢弃（几何已入库） |
| `<img>` | 图片 | `src` 必须是 [`+media-upload`](lark-slides-0.md#s-0a4a00cc57a24b7b) 返回的 `file_token`，不能是 URL |
| `<icon>` | 图标 | `iconType` 取自 iconpark 资源；语义图标先用 `scripts/iconpark_tool.py search` 检索 |
| `<table>` | 表格 | 整表替换会**重建内部 td id**，旧 td block_id 立即失效 |
| `<td>` | 单元格局部替换 | 只能 `block_replace`，不能 `block_insert`；`block_id` 必须是最新 `+xml-get --slide-id` 拿到的 td id |
| `<chart>` | 图表（line/bar/column/pie/area/radar/combo） | 必须嵌 `<chartPlotArea>` + `<chartData>` + `<dim1>/<dim2>/<chartField>` |

**不可作为根元素**：

- `<video>` / `<audio>` —— SML 2.0 没有这两个原生元素；`<undefined type="video|audio">` 是**导出时**的占位符（服务端遇到不支持的类型时用它代替），**不能写入**。尝试 insert/replace 都会返回 3350001。

### 最小 XML 片段（JSON 嵌入时记得把 `"` 转义成 `\"`）

`<shape>`（文本框；`type` 还可选 `rect`/`ellipse`/`triangle`/`custom` 等）：
```xml
<shape type="text" topLeftX="80" topLeftY="80" width="800" height="120">
  <content textType="title"><p>标题</p></content>
</shape>
```

`<img>`：
```xml
<img src="{file_token}" topLeftX="600" topLeftY="20" width="80" height="80"/>
```

`<polyline>`：
```xml
<polyline topLeftX="10" topLeftY="10" width="100" height="50" points="0,0 50,50 100,0"/>
```

`<table>`（2×2）：
```xml
<table topLeftX="30" topLeftY="80">
  <colgroup><col span="2" width="110"/></colgroup>
  <tr><td><content><p>A</p></content></td><td><content><p>B</p></content></td></tr>
  <tr><td><content><p>C</p></content></td><td><content><p>D</p></content></td></tr>
</table>
```

`<td>`（`block_replace` 单元格；`block_id` 必须是最新 `+xml-get --slide-id` 拿到的 td id）：
```xml
<td><content><p>新内容</p></content></td>
```

`<chart>`（`type` 改成 `bar`/`column`/`pie`/`area`/`radar`/`combo` 切换图型）：
```xml
<chart topLeftX="30" topLeftY="300" width="300" height="200">
  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
  <chartData>
    <dim1><chartField name="x" valueType="string">Q1,Q2,Q3,Q4</chartField></dim1>
    <dim2><chartField name="Sales" valueType="number">10,20,15,30</chartField></dim2>
  </chartData>
</chart>
```

## 返回值

```json
{
  "xml_presentation_id": "slidesXXXXXXXXXXXXXXXXXXXXXX",
  "slide_id": "pfG",
  "parts_count": 1,
  "revision_id": 102
}
```

| 字段 | 说明 |
|------|------|
| `xml_presentation_id` | 解析后的真实 token（wiki URL 解析后会变化） |
| `slide_id` | 与入参一致 |
| `parts_count` | 本次提交的 parts 条数 |
| `revision_id` | 成功后的新版本号，下次做乐观锁时用 |
| `failed_part_index` | 有部分失败时存在，指向第几条 part 失败 |
| `failed_reason` | 失败原因文字描述 |

整批作为原子事务：任一 part 失败则整批不生效，服务端通过 `failed_part_index` / `failed_reason` 告诉你是哪条；按此定位修正后重发。

## 使用流程

### 给已有页加图（典型场景）

```text
PRES_ID=xxx
SID=yyy

# 1) 上传图片
TOKEN=$(lark-cli slides +media-upload --as user \
  --file ./pic.png --presentation "$PRES_ID" --jq '.data.file_token')

# 2) block_insert 到页末
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts "$(jq -n --arg token "$TOKEN" \
    '[{action:"block_insert",insertion:("<img src=\""+$token+"\" topLeftX=\"500\" topLeftY=\"100\" width=\"200\" height=\"150\"/>")}]')"
```

### 改标题（block_replace）

```text
# 先拿原页 XML，从里面找到标题块的 3 位 short id（如 bUn）
lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" --raw

# block_replace 换掉整个标题块（id 自动注入）
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"}]'
```

### 批量：一次换标题 + 追加装饰图

`block_replace` 和 `block_insert` 可以在同一个 `--parts` 里混用，整批原子执行。

```text
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[
    {"action":"block_replace","block_id":"bab","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"},
    {"action":"block_insert","insertion":"<img src=\"<file_token>\" topLeftX=\"700\" topLeftY=\"400\" width=\"180\" height=\"100\"/>"}
  ]'
```

### 乐观锁

```text
# 读时记录 revision_id
REV=$(lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --jq '.data.revision_id')

# 写时传 --revision-id；传不存在的版本号（超过当前 revision）返回 3350002
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" --revision-id "$REV" \
  --parts "$PARTS"
```

## 常见错误

| 现象 | 原因 | 对策 |
|------|------|------|
| 3350001 + hint "block_id not found" | `parts[i].block_id` 在当前页不存在 | 重新用 `+xml-get --slide-id` 拿最新 XML，按里面的 short ID 再填 |
| 3350002 not found | `--revision-id` 传了不存在的版本号（超过当前 revision） | 用 `-1` 或用 `+xml-get --slide-id` 拿到的有效 `revision_id` |
| `--parts invalid JSON` | JSON 本身不完整，或被 shell 引号/转义破坏 | 将数组写入 `parts.json` 后传 `--parts @parts.json`，或通过 stdin 传给 `--parts -` |
| `--parts[i] action "str_replace" is not supported` | CLI 不暴露 `str_replace` | 把替换需求改写成 `block_replace` / `block_insert` |
| `--parts[i] action "page_replace" / "slide_replace" means whole-page replacement` | 把整页更新意图传给了块级 shortcut | 改用 [`slides +update-slide`](lark-slides-0.md#s-d59026b95d949611) 整页原地写回 |
| `--parts contains N items, exceeds maximum of 200` | 一次提交 parts 太多 | 拆多次调用 |
| `--parts[i] unknown field "xml"; did you mean "replacement"?` | XML 塞进了未支持的字段名（如 `xml` / `new_xml` / `data`） | 使用标准字段：`block_replace` 用 `replacement`，`block_insert` 用 `insertion` |
| `--parts[i] unknown field "insertion"; it belongs to block_insert` | 字段和 `action` 不配对 | 按 action 取字段：`block_replace` = `block_id` + `replacement`；`block_insert` = `insertion` (+ `insert_before_block_id`) |
| `--parts[i] (block_replace) requires non-empty block_id` / `replacement` | 字段名对，但值缺失或是空串 | 按 parts 元素结构补齐值 |
| `<img>` 不显示 / 显示破图 | `src` 写了外链 URL | 换成通过 [`+media-upload`](lark-slides-0.md#s-0a4a00cc57a24b7b) 拿到的 `file_token` |
| 3350001 | `replacement` 不是合法单根 XML 片段，或 `block_id` 不存在 | CLI 已自动注入 `id` 和 `<content/>`；如果仍报错，重新 `+xml-get --slide-id` 拿最新 XML 确认 `block_id` 存在；检查 XML 结构是否合法；坐标是否超出 960×540 |
| 403 | 权限不足 | 需要 `slides:presentation:update` 或 `slides:presentation:write_only`；wiki URL 还需要 `wiki:node:read` |

## 相关命令

- [slides +xml-get](lark-slides-0.md#s-cc7a42f8bd992b15) — 读原页拿 `block_id` / `revision_id`
- [+media-upload](lark-slides-0.md#s-0a4a00cc57a24b7b) — 上传图片拿 `file_token`
- [slides-editing.md](lark-slides-0.md#s-741dd493d62520a5) — 读-改-写闭环 + 决策树


<a id="s-6b365928e39b6922"></a>

## references/cli/lark-slides-screenshot.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +screenshot

## 用途

获取幻灯片页面截图并保存为本地图片文件。默认用于已存在 PPT 页面截图；传入 `--content` 时用于直接渲染单个 `<slide>` XML 片段预览。本 shortcut 会在 CLI 进程内解码并写入文件，stdout 只返回文件路径、大小、页面 ID 等元信息，避免把图片 Base64 输出给模型。

截图失败则降级到 XML 读回、结构 lint等非截图检查路径。

## 命令

```text
lark-cli slides +screenshot --as user \
  --presentation '<xml_presentation_id 或 slides/wiki URL>' \
  --slide-number 1
```

渲染本地 XML 内容：

```text
lark-cli slides +screenshot --as user \
  --content @slide.xml
```

## 截图全部页面

枚举全部页面的 `slide_id` 或页码，按每批最多 10 页分组并串行调用 `slides +screenshot`，复用同一个 `--output-dir`；记录失败批次，已完成批次不重复执行。

## 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `--presentation` | list 模式必需 | `xml_presentation_id`、`/slides/` URL，或解析后为 slides 的 `/wiki/` URL。传 `--content` 时不能使用 |
| `--slide-id` | list 模式与 `--slide-number` 二选一 | 页面 short ID；不能与 `--slide-number` 同时使用；多页截图时重复传入，或用逗号分隔一次传多个（如 `--slide-id slide_1,slide_2`）；一次最多 10 个 ID |
| `--slide-number` | list 模式与 `--slide-id` 二选一 | 页面页号；不能与 `--slide-id` 同时使用；多页截图时重复传入，或用逗号分隔一次传多个（如 `--slide-number 1,2,3`）；一次最多 10 个页码 |
| `--content` | render 模式必需 | 要直接渲染的 `<slide>` XML 片段；支持直接传值、`@file`、`-` stdin。传入后不能同时传 `--slide-id` / `--slide-number` |
| `--output` | 否 | 单张截图的期望相对输出路径，可不写扩展名，显式扩展名只支持 `.png`、`.jpg`、`.jpeg`。只能选择一页，不能与 `--output-dir` / `--output-name` 同时使用；最终路径以返回的 `output` 为准 |
| `--output-dir` | 否 | 输出目录，默认 `.lark-slides/screenshots`；必须是当前目录内的相对路径 |
| `--output-name` | 否 | 仅用于 `--content` render 模式设置输出文件名 stem。普通页面截图传入该参数会返回 `validation/invalid_argument`（`param: --output-name`）并提示改用 `--output` |

## 示例

### 单页截图并固定路径

```text
lark-cli slides +screenshot --as user \
  --presentation slides_example_presentation_id \
  --slide-number 1 \
  --output .lark-slides/screenshots/example-deck-task/page-01
```

按 `slide_id` 选择单页时同样使用 `--output`：

```text
lark-cli slides +screenshot --as user \
  --presentation slides_example_presentation_id \
  --slide-id slide_example_id \
  --output .lark-slides/screenshots/example-deck-task/page-01
```

### 多页截图

一次不要超过 10 页；如需更多页面，分批调用。可以重复传参，也可以用逗号分隔一次传多个：

```text
lark-cli slides +screenshot --as user \
  --presentation slides_example_presentation_id \
  --slide-number 1 \
  --slide-number 2 \
  --output-dir .lark-slides/screenshots/example-deck-task
```

### 渲染 XML 预览

```text
lark-cli slides +screenshot --as user \
  --content @.lark-slides/out/demo/slide.xml \
  --output .lark-slides/screenshots/example-deck-task/preview
```

## 返回值

返回 JSON 不包含 Base64 图片内容：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "xml_presentation_id": "slides_example_presentation_id",
    "output": "/abs/path/.lark-slides/screenshots/example-deck-task/page-01.jpg",
    "screenshots": [
      {
        "slide_id": "slide_example_id",
        "slide_number": 1,
        "format": "jpeg",
        "path": "/abs/path/.lark-slides/screenshots/example-deck-task/page-01.jpg",
        "size": 12345
      }
    ]
  }
}
```

## 注意事项

1. 优先使用 `slides +screenshot` 保存本地图片，不要把图片 Base64 打到 stdout。
2. 已存在 PPT 页面截图时，不传 `--content`，用 `--presentation` + `--slide-id` 或 `--slide-number`。
3. 本地 XML 预览时，传 `--content @file` 或 `--content -`，内容应为单个 `<slide>` XML 片段；此时不要传 `--presentation` / `--slide-id` / `--slide-number`。
4. `slide_id` 是页面 short ID，页码请用 `--slide-number`。
5. list 模式下 `--slide-id` 与 `--slide-number` 必须二选一；同一类型 selector 一次最多传 10 个，更多页面请分批截图。
6. 单张使用 `--output`，多张使用 `--output-dir`，由 CLI 按页面信息生成文件名。新建或大幅改写 Deck 时，截图目录复用 planning 阶段的 `<deck-or-task-id>`；已有 Deck 没有 task ID 时，使用 presentation ID 作为目录名。
7. CLI 不转换图片格式，也不要求模型预判服务端格式。未写扩展名时自动追加真实扩展名；请求扩展名与真实格式不一致时保留目录和名称、修正扩展名，例如请求 `slide3.png` 而服务端返回 JPEG 时实际保存为 `slide3.jpg`。
8. 发生扩展名修正或同名避让时会返回原始 `requested_output`、实际绝对路径 `output` 和 `output_adjusted: true`；后续必须使用 `output` / `screenshots[].path`，不要继续猜测请求路径。
9. list 模式默认文件名包含 presentation ID、页码和/或 slide ID。
10. 截图来自服务端渲染结果，适合创建/替换后验证页面是否为空白、破图或布局明显异常。


<a id="s-d59026b95d949611"></a>

## references/cli/lark-slides-update-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +update-slide（整页更新已有页面）

把一整页 XML 交给某个已有页面，页面变成 `--content` 描述的样子。`slide_id` 和页序都不变。

## 命令

```text
# 标准用法：整页 XML 从文件读（推荐：避免 shell 转义和长参数截断）
lark-cli slides +update-slide --as user \
  --presentation "https://xxx.larkoffice.com/slides/SCtZ...ynae" \
  --slide-id "piy" \
  --content @page.xml

# XML 从 stdin 读
cat page.xml | lark-cli slides +update-slide --as user \
  --presentation "$PRES" --slide-id "$SLIDE" --content -

# wiki 链接直接传（CLI 自动解析并校验 obj_type=slides）
lark-cli slides +update-slide --as user \
  --presentation "https://xxx.larkoffice.com/wiki/wikcn..." \
  --slide-id "piy" --content @page.xml

# 预览请求，不实际写入
lark-cli slides +update-slide --as user \
  --presentation "$PRES" --slide-id "$SLIDE" --content @page.xml --dry-run
```

## 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、`/slides/` URL 或 `/wiki/` URL |
| `--slide-id` | 是 | 要整页替换的页面 `slide_id` |
| `--content` | 是 | 这一页的完整目标 XML，单一 `<slide>` 根；支持字面量、`@file`、stdin `-`。别名：`--xml` / `--slide-xml` / `--slide-content` / `--content-xml` |
| `--revision-id` | 否 | 默认 `-1`（最新）。它只选择服务端执行所基于的快照，不是“页面有新编辑就拒绝”的乐观锁；传旧版本号会以旧快照重建页面并丢弃其后的编辑 |
| `--tid` | 否 | 调用方提供的任务/事务标识，CLI 原样透传；用于关联同一编辑任务或重试，不等同于版本前置条件，不能单独保证并发冲突时拒绝写入。一般留空 |

`@file` 和 `+xml-get --output` 一样**只接受当前目录下的相对路径**，绝对路径会被拒。
命令别名：`slides +update`（隐藏）。

如果要求“从读取之后页面一旦变化就不再写入”，不能只传 `--revision-id` 或 `--tid`。写入前必须再次用 `+xml-get` 回读最新版，比较读取期间是否发生变化；有变化时先基于最新版重新合并本次修改，再执行整页写回。当前 shortcut 不提供严格的 compare-and-swap 保证。

## 语义：`--content` 就是这一页的最终状态

**没写进 `--content` 的东西会从页面上消失。** 这不是补丁，是整页覆盖。

| 你在 `--content` 里怎么写 | 页面上的结果 |
|---|---|
| 元素带原来的 `id` | 按新 XML 更新这个元素 |
| 元素不带 `id` | 作为新元素插入到它所在的位置 |
| 原来有、`--content` 里没有的元素 | **删除** |
| `<style>` 改了 | 背景等页面样式跟着改 |
| 没写 `<note>` | 讲者备注被清空 |

一次请求就能同时做完改样式、插入、删除、换备注、换背景——这是 `+replace-slide` 逐元素 part 做不到的（它没法寻址背景，也没有 move 操作）。

## 本地图片：`@路径` 占位符

`--content` 的 XML 里写 `<img src="@./chart.png" .../>`，CLI 会：先把每个不重复的本地文件上传到这份演示文稿（`parent_type=slide_file`），再把 `src` 替换成返回的 `file_token`，最后才整页写回。

占位符路径按**执行命令时的 CWD** 解析，跟 `--content @file` 所在目录无关；`@./assets/x.png` 找的是 `$PWD/assets/x.png`。

```text
lark-cli slides +update-slide --as user \
  --presentation "$PRES" --slide-id "$SLIDE" \
  --content '<slide xmlns="https://www.larkoffice.com/sml/2.0"><data><img src="@./chart.png" topLeftX="100" topLeftY="100" width="320" height="180"/></data></slide>'
```

- 文件不存在、不是普通文件、超过 20 MB，都在**调用任何接口之前**报错，不会留下半成品。
- 去重只在**单次调用内**生效：多页共用同一张图时，逐页更新会把它每页重传一次。这种图先用 [`+media-upload`](lark-slides-0.md#s-0a4a00cc57a24b7b) 传一次，把 `file_token` 写进各页的 `src`。
- 整页只发一个 part，所以上传是这条命令里**唯一不可逆的一半**：图先落进演示文稿的 media store，若随后 replace 失败，报错 hint 会告诉你已经传了几张，直接重试会再传一份。先 `--dry-run` 可提前看到 `images_to_upload` 和上传步骤。

## 标准读-改-写流程

```text
# 1. 读回当前页（拿到带 id 的完整 XML）
lark-cli slides +xml-get --as user \
  --presentation "$PRES" --slide-id "$SLIDE" --output page.xml

# 2. 编辑 page.xml —— 保留想留下的元素的 id，删掉不要的整段，新元素不写 id

# 3. 整页写回
lark-cli slides +update-slide --as user \
  --presentation "$PRES" --slide-id "$SLIDE" --content @page.xml
```

先 `--dry-run` 看请求，确认无误再执行。

> ⚠️ **第 1 步不要加 `--remove-attr-id`。** 那个参数会把所有元素的 `id` 去掉，再交给 `+update-slide` 的话，每个元素都会被当成新元素插入、原来的全部被删除——页面看起来一样，但所有元素换了新 id，锚在旧 id 上的评论和 block 直达链接全部失效，而且**不会有任何报错**。`--remove-attr-id` 只用于只读查看。

## 命令校验与空页限制

| 情况 | 报错 |
|---|---|
| 根元素不是 `<slide>`（例如直接给了 `<shape>`） | `--content root must be <slide>` → 改单个元素请用 `+replace-slide` |
| 根 `id` 和 `--slide-id` 不一致 | 拒绝。这通常是 A 页的 XML 要写到 B 页 —— 会毁掉 B 页 |
| 根 `id` 缺失 | 自动补上 `--slide-id`，不报错 |
| 根标签带命名空间前缀（`<sml:slide>`） | 拒绝。页面 id 没法贴到带前缀的标签上；写成 `<slide>`，需要命名空间就用默认 `xmlns` |
| `<slide>` 之后还有第二个根元素或多余文本 | 拒绝。服务端解析会静默丢掉它们 |
| XML 不合法 | 拒绝，带上出错位置 |
| `<slide/>`（自闭合，空页） | 命令本身可以解析，但提交前的强制版式 lint 会报 `blank_slide`；按本 Skill 不得调用接口提交空页 |

标为“拒绝”的情况由命令校验拦截，**不会发出任何请求**；空页则必须在调用命令前由强制版式 lint 拦截。

## 什么时候不要用它

- **只改一个元素** → 用 [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f)，一条 `block_replace` part 更省，也不用带上整页
- **要改多个页面** → 对每一页各跑一次本命令
- **要新建页面** → `slides +create` 或 `slides +add-slide`

## 提交前与写入后验证

和其他整页写入一样，把 `--content` 存成本地文件后先跑版式 lint。先取得当前已加载 `lark-slides/SKILL.md` 的父目录，记为 `<lark-slides-skill-dir>`；不要猜测全局安装路径：

```text
python3 "<lark-slides-skill-dir>/scripts/xml_lint.py" --input page.xml
```

`summary.error_count` 必须为 0 才调接口；`warning_count > 0` 时写完要截图复核。

写入成功后，必须回读整份演示文稿的最新 XML，而不是只相信写接口的成功响应：

```text
lark-cli slides +xml-get --as user \
  --presentation "$PRES" --output readback.xml
```

按当前已加载 `lark-slides/SKILL.md` 指向的 [validation-xml.md](lark-slides-0.md#s-4a72cbe8eec0b655) 完成验证：核对总页数、目标页和关键元素（包括需要保留的 ID、文本、背景与备注），并对回读 XML 运行同一版式 lint；发现差异时先停止后续写入并重新基于最新版处理。

## 成功输出

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "xml_presentation_id": "slides_example_presentation_id",
    "slide_id": "piy",
    "revision_id": 43
  }
}
```

| `data` 下的字段 | 说明 |
|------|------|
| `xml_presentation_id` | 实际写入的演示文稿 ID |
| `slide_id` | 与传入相同——整页覆盖不换页 id |
| `revision_id` | 写入后的新版本号 |
| `images_uploaded` | 仅当 `--content` 带 `@` 占位符时出现：本次去重后实际上传的图片张数 |

服务端拒绝这次写入时（`failed_reason` 非空）**不会**返回成功输出，而是报错并带上原因——单个 part 承载整页，任何失败都意味着页面没被写入。

- 原因包含 `not found`：先检查 `--presentation` 和 `--slide-id`，再用 `slides +xml-get` 回读当前页面 ID。页面可能已删除，或 ID 来自另一份演示文稿。
- 其他 invalid-parameter 错误：检查 `--content` 中不支持的元素、缺少 `<content/>` 的 `<shape>`，以及超出 960×540 的坐标。

## 常见错误

| 现象 | 原因 | 解决 |
|------|------|------|
| 3350001，原因包含 `not found` | `--presentation` 不匹配，或 `--slide-id` 对应的页面已被删除 | 检查 `--presentation` 和 `--slide-id`，再用 `slides +xml-get` 回读当前页面 ID |
| 3350001，其他 invalid param | `--content` 的 XML 结构有问题（如 `<shape>` 缺 `<content/>`、包含服务端不支持的元素） | 按 [error-handling.md](lark-slides-0.md#s-91d349f39b2cd412) 检查 `--content` 的 XML 结构 |
| 3350002 not found | `--revision-id` 传了不存在的版本号 | 用 `-1` 或真实存在的 `revision_id` |
| 1061004 / 403 | 当前身份对这份 PPT 没有编辑权限 | 检查是否拥有 `slides:presentation:update` 或 `slides:presentation:write_only` scope；wiki 链接另需 `wiki:node:read`，`@` 占位符另需 `docs:document.media:upload`；`--as bot` 还要求该 bot 对目标 PPT 有编辑权限 |


<a id="s-2d171d998264620f"></a>

## references/cli/lark-slides-xml-presentation-slide-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +xml-get（单页读取兼容入口）

本文档已合并至 [lark-slides-xml-presentations-get.md](lark-slides-0.md#s-cc7a42f8bd992b15)。

此文件保留已发布路径兼容性；后续引用请使用该正式 reference。


<a id="s-d2f2d1646f64523b"></a>

## references/cli/lark-slides-xml-presentation-slide-replace.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +replace-slide（块级替换 / 插入）

对指定页面的已知块做替换或插入。先用 `+xml-get --slide-id` 获取最新 `block_id`，再用 `+replace-slide` 写入；该操作不改变页面顺序。

```text
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\" fontSize=\"32\"><p>新标题</p></content></shape>"}]'
```

`block_replace` 使用 `block_id` 和 `replacement`；追加元素使用 `block_insert` 和 `insertion`。完整 parts 结构、验证和限制见 [lark-slides-replace-slide.md](lark-slides-0.md#s-de7059cb8c77747f)。


<a id="s-cc7a42f8bd992b15"></a>

## references/cli/lark-slides-xml-presentations-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +xml-get（读取演示文稿 XML）

读取全文或单页 XML。全文验证优先将结果保存到本地文件；局部编辑可读取单页 XML，从顶层块的 `id` 属性取得 `+replace-slide` 所需的 `block_id`。

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--presentation` | 是 | `xml_presentation_id`、Slides URL，或可解析为 Slides 的 wiki URL |
| `--revision-id` | 否 | 版本号；`-1` 表示最新版本 |
| `--output` | 否 | XML 保存路径，必须使用 CWD 内相对路径；省略时返回 JSON |
| `--raw` | 否 | 将 XML 直接输出到 stdout；不能与 `--output`、`--jq` 或非 JSON `--format` 一起使用 |
| `--slide-id` | 否 | 只读取指定页面；不能与 `--slide-number` 或 `--remove-attr-id` 一起使用 |
| `--slide-number` | 否 | 只读取指定的 1-based 页码；不能与 `--slide-id` 或 `--remove-attr-id` 一起使用 |
| `--remove-attr-id` | 否 | 仅全文读取可用；移除 XML `id` 属性，不适合后续精确块编辑 |

## 示例

```text
# 读取全文并保存，用于创建后验证
lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" \
  --output ".lark-slides/plan/$PRES_ID/readback.xml"

# 读取单页以获取 block_id
lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" --raw

# 读取单页，同时记录 revision_id 用于后续乐观锁
REV=$(lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --jq '.data.revision_id')
```

JSON 输出中，全文 XML 位于 `.data.xml_presentation.content`，单页 XML 位于 `.data.slide.content`；二者的 `.data.revision_id` 都可用于后续写操作。

相关命令：

- [slides +replace-slide](lark-slides-0.md#s-de7059cb8c77747f) — 块级替换 / 插入
- [slides +update-slide](lark-slides-0.md#s-d59026b95d949611) — 整页覆盖


<a id="s-2626f6fe03de6544"></a>

## references/iconpark.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# IconPark 图标（兼容入口）

本文档已迁移至 [`xml/iconpark.md`](lark-slides-0.md#s-0952eb4744ad31ed)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-ebaded39387cfe85"></a>

## references/lark-slides-add-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +add-slide（兼容入口）

本文档已迁移至 [`cli/lark-slides-add-slide.md`](lark-slides-0.md#s-781503ce17b301f7)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-105abd5c906ba7ac"></a>

## references/lark-slides-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +create（创建飞书幻灯片）（兼容入口）

本文档已迁移至 [`cli/lark-slides-create.md`](lark-slides-0.md#s-2dc9fd2b0e0f4d9a)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-589d125ba93d6932"></a>

## references/lark-slides-delete-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +delete-slide（兼容入口）

本文档已迁移至 [`cli/lark-slides-delete-slide.md`](lark-slides-0.md#s-daa81361dc1abfe2)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-a4e0976e51be8185"></a>

## references/lark-slides-edit-workflows.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 编辑已有 PPT：读-改-写闭环（兼容入口）

本文档已迁移至 [`workflow/slides-editing.md`](lark-slides-0.md#s-741dd493d62520a5)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-8038b8affca7fa95"></a>

## references/lark-slides-history.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides history（历史版本与回滚）（兼容入口）

本文档已迁移至 [`cli/lark-slides-history.md`](lark-slides-0.md#s-5cc060a534022d87)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-f8e4854ef21490e3"></a>

## references/lark-slides-media-upload.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +media-upload（兼容入口）

本文档已迁移至 [`cli/lark-slides-media-upload.md`](lark-slides-0.md#s-0a4a00cc57a24b7b)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-203a167c233e71a8"></a>

## references/lark-slides-pptx-template-workflows.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# PPT Template Rewrite Principles（兼容入口）

本文档已迁移至 [`workflow/template-editing.md`](lark-slides-0.md#s-f749479c8d9360a8)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-944ae26a79b98595"></a>

## references/lark-slides-replace-slide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +replace-slide（兼容入口）

本文档已迁移至 [`cli/lark-slides-replace-slide.md`](lark-slides-0.md#s-de7059cb8c77747f)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-bc8ccdc9481a9ea6"></a>

## references/lark-slides-screenshot.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +screenshot（兼容入口）

本文档已迁移至 [`cli/lark-slides-screenshot.md`](lark-slides-0.md#s-6b365928e39b6922)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-52b75a2383820bdd"></a>

## references/lark-slides-xml-presentation-slide-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +xml-get（单页读取兼容入口）

本文档已合并至 [`cli/lark-slides-xml-presentations-get.md`](lark-slides-0.md#s-cc7a42f8bd992b15)。

此文件保留旧路径兼容性；后续引用请使用 `cli/` 下的正式 reference。


<a id="s-18b83200df4dfc70"></a>

## references/lark-slides-xml-presentation-slide-replace.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +replace-slide（兼容入口）

本文档已迁移至 [`cli/lark-slides-xml-presentation-slide-replace.md`](lark-slides-0.md#s-d2f2d1646f64523b)。

此文件保留旧路径兼容性；后续引用请使用 `cli/` 下的正式 reference。


<a id="s-e81978b6a8defb71"></a>

## references/lark-slides-xml-presentations-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# slides +xml-get（兼容入口）

本文档已迁移至 [`cli/lark-slides-xml-presentations-get.md`](lark-slides-0.md#s-cc7a42f8bd992b15)。

此文件保留旧路径兼容性；后续引用请使用 `cli/` 下的正式 reference。


<a id="s-fe8c2e7be080b9c6"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `cli.slides.xml_presentations.create` | 以 XML 格式创建演示文稿 | feishu_call_tool |
| `cli.slides.xml_presentations.get` | 读取演示文稿全文信息，XML 格式返回 | feishu_read_tool |
| `cli.slides.xml_presentation.history.list` | 列出 XML 演示文稿历史版本 | feishu_read_tool |
| `cli.slides.xml_presentation.history.revert` | 按 history_version_id 发起 XML 演示文稿历史版本回滚任务 | feishu_call_tool |
| `cli.slides.xml_presentation.history.revert_status` | 查询 XML 演示文稿历史回滚任务状态 | feishu_read_tool |
| `cli.slides.xml_presentation.slide.create` | 在指定 XML 演示文稿下创建页面 | feishu_call_tool |
| `cli.slides.xml_presentation.slide.delete` | 在指定 XML 演示文稿下删除页面 | feishu_call_tool |
| `cli.slides.xml_presentation.slide.get` | 获取指定 XML 演示文稿的单个页面 XML 内容 | feishu_read_tool |
| `cli.slides.xml_presentation.slide.replace` | 对指定 XML 演示文稿页面进行元素级别的局部替换 | feishu_call_tool |
| `cli.slides.xml_presentation.slide_image.list` | 获取幻灯片截图 | feishu_read_tool |
| `cli.slides.xml_presentation.slide_image.render` | 渲染页面截图为图片 | feishu_call_tool |


<a id="s-f217c09d017c35e5"></a>

## references/planning-layer.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Planning Layer

新建演示文稿或大幅改写页面时，必须先写 `.lark-slides/plan/<deck-or-task-id>/slide_plan.json`，再生成 XML。这个文件是 deck 的设计中间层，用来把叙事、页面角色、布局、视觉重点和文字密度固定下来，避免从用户提示直接跳到 XML。

小型已有页编辑可豁免，例如只替换一个标题、改一个数字、插入一个块、上传并插入一张图。只要任务会重排多页、生成新 deck、替换整页结构，仍然需要规划层。

## Required Flow

1. 理解用户需求，必要时澄清主题、受众、页数、风格。
2. 选择唯一 plan 目录：`.lark-slides/plan/<deck-or-task-id>/`。
3. 先创建目录：`mkdir -p .lark-slides/plan/<deck-or-task-id>`。
4. 写入 `.lark-slides/plan/<deck-or-task-id>/slide_plan.json`。
5. 读取 `xml/xml-schema-quick-ref.md`、`visual-planning.md` 和 `asset-planning.md`。
6. 按 plan、visual planning 和 asset planning 规则逐页生成 XML，把 `layout_type`、`visual_focus`、`text_density` 转成具体页面几何和文本量约束，并把缺失素材转成可执行兜底视觉。
7. 创建 PPT 后用 `slides +xml-get` 回读，核对页面数量、关键元素和 plan 到 XML 的对应关系，空白 PPT 中没有 slide 元素。


## Plan Path

Use a separate plan directory per deck or task so multiple presentations in the same workspace cannot overwrite each other.

Recommended IDs:

- New deck before creation: title slug plus date/time, such as `q3-review-20260507-1805`.
- Existing PPT rewrite: the `xml_presentation_id`.
- Ambiguous or untitled task: short task slug plus date/time.

Rules:

- Do not reuse `.lark-slides/plan/slide_plan.json` as a shared path.
- Create the directory before writing the file.
- Reuse the same plan path for XML generation and post-create verification for that deck.

## Artifact Lifecycle

`.lark-slides/` is local agent state. It supports recovery, iteration, and later edits, but it should not be treated as source code or committed by default.

Keep:

- `.lark-slides/plan/<deck-or-task-id>/slide_plan.json` after successful creation or major rewrite. The plan is the editable design state for the deck.
- A small manifest when useful for follow-up work, such as `xml_presentation_id`, slide IDs, `revision_id`, plan path, and verification status.

Clean or avoid keeping:

- Transient XML payloads after successful creation and verification. Prefer `/tmp` for throwaway XML, or delete generated XML files after success.
- Stale XML drafts that no longer match the current presentation state.

Exception:

- If creation fails or partially succeeds, keep the relevant XML/debug payloads until recovery is complete. Record `xml_presentation_id` first, then fetch current state before retrying.

## JSON Shape

```json
{
  "presentation_goal": "Explain the proposal and secure approval for the next phase.",
  "audience": "Product and engineering leaders who know the domain but need a concise decision narrative.",
  "theme_style": "Clean business style, light background, restrained blue accent, strong visual hierarchy.",
  "visual_system": {
    "background_strategy": "Content pages use one light base; cover and closing may use a related dark treatment with the same accent system.",
    "motif": "Consistent card style and numbered anchors.",
    "color_roles": {
      "primary": "Used for the dominant structural motif and about 60-70% of visual weight.",
      "secondary": "Used for grouped regions, comparison panels, or supporting categories.",
      "accent": "Used only for key numbers, conclusions, or focus markers."
    }
  },
  "typography_constraints": {
    "title_max_lines": 2,
    "body_max_lines_per_box": 2,
    "footer_max_lines": 1,
    "long_text_handling": "Shorten, split into multiple boxes, or move detail to speaker notes instead of shrinking into a tight box."
  },
  "verification_plan": {
    "check_background_consistency": true,
    "check_text_fit": true,
    "check_visual_focus": true,
    "check_asset_rendering": true
  },
  "slides": [
    {
      "page": 1,
      "title": "Proposal Title",
      "key_message": "The initiative is ready for a focused pilot.",
      "layout_type": "title-cover",
      "visual_focus": "Large title area with one concise supporting statement.",
      "asset_need": {
        "asset_type": "logo",
        "purpose": "Signal product or team identity on the opening page.",
        "suggested_query": "product logo",
        "fallback_if_missing": "Create a close-enough image with the image generation tool instead of a real logo."
      },
      "text_density": "low",
      "speaker_intent": "Frame the decision and establish the deck's point of view."
    }
  ]
}
```

## Required Fields

Top-level fields:

- `presentation_goal`: what the whole deck is trying to achieve.
- `audience`: target readers or listeners and their assumed background.
- `theme_style`: visual tone, palette direction, and professional style.
- `visual_system`: deck-level visual rules that must stay stable across pages, including background strategy, recurring motif, and color roles.
- `typography_constraints`: deck-level limits for line count, text box density, and how to handle long text before XML generation.
- `verification_plan`: explicit checks to perform after creation or major edits; include background consistency, text fit, visual focus, and asset rendering when relevant.
- `slides`: ordered page plans.

Each slide must include:

- `page`: 1-based page number.
- `title`: slide title.
- `key_message`: the one idea this page must land.
- `layout_type`: planned page structure.
- `visual_focus`: dominant visual object or region.
- `asset_need`: planning-only structured asset metadata; no search, download, or upload required. Follow `asset-planning.md`.
- `text_density`: `low`, `medium`, or `high`.
- `speaker_intent`: why the speaker needs this page and how it advances the story.

Optional slide fields:

- `chart_contract`: required when the page plan includes a standard data chart that `<chart>` supports. Use this shape:

```json
{
  "chart_contract": {
    "required": true,
    "render_as": "native_chart",
    "chart_type": "line",
    "data_source": "mock_placeholder",
    "data_series_required": true,
    "placeholder_label_required": true,
    "manual_shape_fallback_allowed": false
  }
}
```

When `chart_contract.required == true`, XML generation must produce a `<chart>` element on that slide. A shape, line, or polyline approximation does not satisfy the plan.

`data_source` must be one of:

- `user_provided`: the user supplied concrete values, tables, CSV, or metric lists; use them and do not replace them with mock data.
- `mock_placeholder`: the user asked for a placeholder, template, example, or later-replaceable chart position; use mock data in native `<chart>`.
- `mock_required_by_intent`: the user did not provide concrete values but asked for data expression, charts, trends, comparisons, or distributions; use mock data in native `<chart>`.

`data_series_required` means the generated XML must include `<chartData>`. It does not require user-provided real-world values. When real values are unavailable but chart expression is part of the user's intent, write mock or placeholder values into native `<chart>` and label them clearly instead of switching to manual drawing primitives or metric blocks.

## Layout Vocabulary

Use one of these `layout_type` values unless the user explicitly needs a custom structure:

- `title-cover`
- `section-divider`
- `two-column`
- `image-left-text-right`
- `image-right-text-left`
- `big-number`
- `timeline`
- `comparison`
- `architecture-diagram`
- `process-flow`
- `quote-highlight`
- `conclusion`

The value must affect XML geometry, not just appear as a label. For example, `timeline` should create a horizontal or vertical sequence, `comparison` should create distinct side-by-side regions, and `big-number` should reserve dominant space for a large metric.

## Text Density Rules

- `low`: title plus 1 short statement, or 1-3 very short labels.
- `medium`: title plus 2-4 concise bullets or labeled regions.
- `high`: allowed only when the user needs detail; use tables, columns, or grouped regions instead of a long bullet list.

Do not let all pages become title + bullet slides. For decks of 4 or more pages, aim for at least 4 different `layout_type` values when the content allows it.

Text density must be realistic for the planned geometry. If a page needs long titles, bilingual labels, paper figure captions, legal disclaimers, or dense technical wording, record how the text will be shortened, split, or moved to speaker notes. Do not rely on small font sizes or tight boxes to make text fit.

## Visual System Planning

Before generating XML, define a visual system that can survive the whole deck:

- `background_strategy`: specify the default background for normal content pages, and which page roles may intentionally differ. Do not let pages drift through near-identical but inconsistent background colors.
- `motif`: choose one reusable structural device, such as numbered node, card treatment, half-bleed image zone, headline, or footer. The motif should appear consistently enough that pages feel related.
- `color_roles`: assign primary, secondary, and accent roles. The same color must not mean unrelated things across pages.
- `cover_content_relationship`: if the cover uses a different dark or image-led treatment, state how it connects to content pages through shared colors, motifs, or geometry.
- `closing_relationship`: if the closing page mirrors the cover, state that explicitly so it looks intentional rather than like a new theme.

These are planning constraints, not decoration notes. They must affect coordinates, background fills, shape styles, and text placement in generated XML.

## Iterative Deck State

When continuing an existing deck, update the same plan path rather than creating a new disconnected plan. Keep the plan aligned with what has actually been created.

Recommended optional fields for long-running work:

- `deck_status`: current slide count, target slide count if known, and last verified revision or timestamp.
- `created_slides`: page number, slide id when known, and the page role.
- `assets_used`: source, local path when applicable, uploaded token when known, and which page uses it.
- `open_issues`: known layout, text fit, asset, or consistency risks that still need correction.

Do not hard-code a page number just because a previous deck used that pattern. Plan by page role and evidence need, such as "method overview pages should use a figure when the source has a readable figure" instead of binding screenshots, charts, or diagrams to a fixed page index. The plan should describe decision rules, not a rigid template sequence.

## Asset Planning

`asset_need` is metadata. It can describe a desired figure, diagram, chart, icon, logo, screenshot, or fallback visual.

Use an object for one planned asset, an array for multiple real needs, or `asset_type: "none"` when no asset is useful. Each planned asset must include:

- `asset_type`: one of `paper_figure`, `architecture_diagram`, `icon`, `logo`, `chart`, `infographic`, `screenshot`, `flow_diagram`, or `none`.
- `purpose`: why this asset helps the page's key message.
- `suggested_query`: short future lookup hint only; do not execute it unless separately requested.
- `fallback_if_missing`: a plan to create a close-enough image with the image generation tool, or a native `<chart>` for data.
- `chart_contract`: when `asset_type` is `chart` and the visual is a supported standard data chart, set this optional slide-level field so generation is locked to native `<chart>`.

For detailed rules and examples, read `asset-planning.md`.

Good examples:

- `{"asset_type":"architecture_diagram","purpose":"Explain component relationships.","suggested_query":"service architecture diagram","fallback_if_missing":"Render the component diagram with <shape> + <line>."}`
- `{"asset_type":"logo","purpose":"Identify the customer context.","suggested_query":"customer logo","fallback_if_missing":"Create a close-enough image with the image generation tool instead of a real logo."}`
- `{"asset_type":"chart","purpose":"Show adoption trend.","suggested_query":"monthly adoption trend chart","fallback_if_missing":"Render a native `<chart>` using the provided series when available; otherwise render a native `<chart>` with mock placeholder values and label it as 模拟数据，仅占位，待替换真实数据."}`

## XML Generation Contract

Before writing each slide XML, map the plan fields to concrete decisions:

- `key_message` determines the headline, dominant claim, or main takeaway.
- `layout_type` determines the coordinate structure and element types. Use `visual-planning.md` for concrete layout rules.
- `visual_focus` determines the largest visual region or emphasized object.
- `text_density` caps visible text volume.
- `asset_need` informs placeholder diagrams, icons, charts, screenshots, or fallback visuals only. Missing real assets must use `fallback_if_missing`, not blank regions.
- `chart_contract` locks supported standard data charts to native `<chart>` output. Manual approximations are allowed only when the planned chart type is unsupported by `<chart>` or when the visual is explicitly non-data/decorative.

After creating the PPT, fetch the presentation and verify:

- Page count matches the plan.
- Every page has the planned title and key message represented.
- At least several pages have visibly different XML layout structures.
- Planned `visual_focus` appears as a dominant visual region or object.
- Asset planning is proportional to the deck topic and length: technical, research, product, and analytical decks should include meaningful planned visuals where they clarify the story, and each planned asset has a visible fallback if no real asset was used.
- `text_density` is reflected in the amount of visible text.
- Pages are not crowded, and any planned `timeline`, `comparison`, or `architecture-diagram` page uses its matching visual structure.
- The actual backgrounds match `visual_system.background_strategy`; any dark, image-led, or emphasis page has an intentional relationship to the rest of the deck.
- Text boxes respect `typography_constraints`; long labels, captions, footer text, and conclusion bars are not squeezed into boxes that are too short for the intended line count.
- If real assets are used, the final XML contains renderable asset tokens or supported local placeholders for creation, not http URLs, stale local paths, or blank image boxes.


<a id="s-56b45bf45d58bcee"></a>

## references/troubleshooting.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Troubleshooting（兼容入口）

本文档已迁移至 [`workflow/error-handling.md`](lark-slides-0.md#s-91d349f39b2cd412)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-5716632a2c1c33bd"></a>

## references/validation-checklist.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Validation Checklist（兼容入口）

本文档已迁移至 [`workflow/validation-xml.md`](lark-slides-0.md#s-4a72cbe8eec0b655)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-8a29c841ba6ccca9"></a>

## references/visual-planning.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Visual Planning

新建演示文稿或大幅改写页面时，在 `slide_plan.json` 完成后、生成 XML 前读取本文件。目标是让 `layout_type`、`visual_focus`、`text_density` 变成实际页面几何，而不是只写在 plan 里。

默认画布按 `960 x 540` 规划。模板 XML 可以覆盖具体坐标，但不能覆盖这些原则：页面要有主视觉区域、文本要受密度约束、不同 `layout_type` 必须产生明显不同的坐标结构。

## Core Rules

- `layout_type` must change geometry: element positions, region sizes, alignment, and visual rhythm must differ across page types.
- `visual_focus` determines the largest or highest-contrast region. It can be an image, diagram, metric, quote, or table.
- `text_density` caps visible text:
  - `low`: title plus one short statement, or 1-3 labels.
  - `medium`: title plus 2-4 concise bullets or labeled regions.
  - `high`: use a table, columns, grouped labels, or annotations. Do not use one long bullet box.
- Do not create a deck where every content page is title plus bullets. For 4 or more pages, use at least 4 different layout structures when the content allows.
- Keep safe outer margins around `40` px on standard content pages, and fill the content area densely with a card grid rather than leaving large empty space. Only go full-bleed for an intentional image or cover treatment.
- Reserve vertical space for titles. A typical content title area is `y=36..90`; main content should usually start at `y>=110`.
- Avoid crowding the bottom edge. Keep non-background content above `y=500` unless it is a footer.
- Keep backgrounds consistent with the deck's `visual_system.background_strategy`. Normal content pages should use the same base background unless there is a clear page-role reason to change.
- Treat text fit as a layout constraint, not a cleanup step. If a text box is too small for the intended line count, shorten the text, split it, or allocate more space before creating XML.
- Do not use `<shape>` to build pictorial visuals like mock photos or fake objects. Use the image generation tool instead.
- Do not place a `rect` or `line` for dividing or decorative purposes directly under a `headline` or `title`.
- Do not use section bands, horizontal bars, vertical bars, or page-edge strips.

## Background And Motif Consistency

Decks can vary page backgrounds, but variation must be intentional and legible:

- Pick one default background for ordinary content pages and reuse it exactly. Avoid near-identical drift such as several slightly different off-white values unless it encodes a clear section change.
- Cover, section divider, emphasis, and conclusion pages may use a dark, image-led, or high-contrast background. They must still share the deck's primary color, motif, typography, or geometry.
- If a cover uses a split composition, make the split visible in the background or layout. For example, reserve a darker text region and a related but distinct visual region instead of placing all elements on one flat field.
- Reuse a small number of visual devices: card radius, node style, icon container, or footer treatment. Do not introduce a new decorative language on each page.
- Insert background and motif shapes before content elements so they do not cover text, images, or diagrams.

## Text Fit Guardrails

Use these as conservative minimums on a 960 x 540 canvas. Increase height when using bold text, Chinese text, mixed Chinese/English, or line spacing above default.

| Text use | Typical font size | Minimum height |
|----------|-------------------|----------------|
| Caption, 1 line | 10-12 | 18 |
| Caption, 2 lines | 10-12 | 30 |
| Body, 1 line | 12-14 | 24 |
| Body, 2 lines | 12-14 | 40 |
| Body, 2 lines, bold | 12-14 | 48 |
| Headline, 1 line | 20-28 | 42 |
| Title, 2 lines | 28-36 | 110 |

Additional rules:

- Do not put long Chinese sentences or long English phrases into `height=18` or `height=22` boxes. Those heights are for short labels only.
- Footer/source text should usually be one short line. If it needs more, make it a real caption block above the footer area.
- Bottom conclusion bars should be at least `40` px tall for one emphasized line and at least `54` px tall for two lines.
- Diagram labels should be short enough to fit the shape. Prefer two short lines over one cramped long line.
- When a text block has more than one `<p>`, size the box for multiple lines explicitly. Do not assume the renderer will auto-expand.
- If a line contains mixed Chinese and English, budget more width than either language alone; mixed text wraps less predictably.

## Layout Types

### `title-cover`

Purpose: introduce the deck's point of view.

Geometry:
- Use one dominant title block, usually `x=70..120`, `y=150..250`, `width=700..820`.
- Add one subtitle or context line, not a bullet list.
- Visual focus MUST be an `<img>`: a full-bleed background image or a large **full-height** side image (searched by the image search tool or generated by the image generation tool). Do NOT compose the cover visual from `<shape>` or `<icon>`.
- If the cover has a large full-height side image, use a split layout: keep the title and subtitle in the text region on the opposite side, and reserve a separate visual region so the image does not overlap the title. Crop (size and place) the side image so it stays within its visual region and does not extend into the text region.
- For split covers, make the background reinforce the composition, such as a darker text side and a related visual panel. Avoid one flat field where title and diagram compete for attention.
- Keep source metadata to one short line where possible. If it wraps, shorten author lists or move details to notes.
- The main title should be controlled, normally one or two lines. Do not let it occupy both the text region and the visual region.
- Do not add a vertical accent bar, side rail, or decorative line/strip. 

Text:
- `low` only unless the user explicitly asks for detail.

### `section-divider`

Purpose: reset rhythm and mark a new chapter.

Geometry:
- Use a large section number, chapter label, or single centered claim.
- Keep the page sparse. A divider is not a content page.
- Visual focus can be one oversized number.

Text:
- Title plus one phrase. No bullets.

### `two-column`

Purpose: compare two related ideas or pair explanation with evidence.

Geometry:
- Split main region into two balanced columns, for example left `x=60,width=400`, right `x=500,width=400`.
- Each column needs its own heading or visual anchor.
- Do not place one full-width bullet box under a normal title; that is not a two-column layout.

Text:
- `medium`: 2-3 short items per column.
- `high`: use grouped rows or mini table structure inside columns.

### `image-left-text-right`

Purpose: let a visual establish context, with text explaining implication.

Geometry:
- Left visual region should occupy roughly `35-45%` of slide width, often full height or tall crop.
- Right text region starts around `x=420` and should have a strong headline plus short support.
- If no image is available, use the image generation tool to create an approximate image that matches `asset_need`.
- For dense screenshots, paper figures, or product captures with small labels, allocate a larger visual region when possible: often `50-65%` of slide width or at least `320` px height.
- Place screenshots in a deliberate frame or panel, and leave enough margin so axes, captions, and edge labels are not cropped by the slide boundary.

Text:
- Keep right-side text short. Avoid more than 4 bullets.
- For screenshot explanation pages, prefer 2-3 interpretation cards or callouts instead of a paragraph block.

### `image-right-text-left`

Purpose: lead with a message, then reinforce it with a visual.

Geometry:
- Left text region starts around `x=60..90`, width `400..460`.
- Right visual region occupies roughly `35-45%` of slide width.
- Align the image with the main text block, not only with the title.
- For dense screenshots, paper figures, or product captures with small labels, increase the visual region and reduce text. A readable image is more valuable than a fully populated text column.

Text:
- Use one main claim and 2-3 supporting points.
- Keep callouts parallel and short. If a callout needs more than two lines, split it into a separate note or a new slide.

### `big-number`

Purpose: make one metric or fact memorable.

Geometry:
- Reserve the largest object for the metric: font size often `40-52`.
- MUST Set `wrap="true" autoFit="normal-auto-fit"` on the metric's `<content>` so an oversized number shrinks to fit its box.
- Pair the number with one explanation and optional 2-3 small supporting labels.
- Do not bury the number in a bullet list or small card.

Text:
- `low` or `medium`. If detail is needed, add small annotations around the metric.
- Supporting labels must not compete with the number. Use compact labels, legends, or mini-cards rather than long explanatory bars.

### `timeline`

Purpose: show sequence, roadmap, history, or phases.

Geometry:
- Create a horizontal or vertical spine with 3-6 milestones.
- Each milestone should have a dot/card/date label connected by a line or arrow.
- Title is separate from the sequence. The sequence is the visual focus.

Text:
- Each milestone gets a short label and optional one-line explanation.
- Do not use paragraph-length milestone descriptions.

### `comparison`

Purpose: make a choice, before/after, old/new, or option tradeoff clear.

Geometry:
- Use two or three distinct panels, columns, or a table-like structure.
- Headings must be visually aligned so differences are easy to scan.
- Use color, border, icon, or label treatment to highlight the preferred option or key difference.

Text:
- Use parallel wording across columns.
- Avoid uneven long bullet lists that destroy comparability.

### `architecture-diagram`

Purpose: explain components, dependencies, or system flow.

Implementation: use `<shape>` + `<line>`.

Geometry:
- Main visual area should be a diagram, not prose.
- Use grouped boxes, lanes, arrows or lines, and short labels.
- Keep diagram labels concise. Put explanation in notes or a small side caption if needed.

Text:
- Prefer labels of 1-5 words.
- Use no more than one short explanatory text block.
- If a node label needs two lines, size the node and the text box for two lines. Do not let labels overlap connectors.

### `process-flow`

Purpose: show operational steps, workflow, or cause-effect path.

Implementation: use `<shape>` + `<line>`.

Geometry:
- Use numbered steps connected by arrows or lines.
- 3-5 steps is ideal for one slide. If there are more, group them into phases.
- The flow direction must be visually obvious.

Text:
- Each step gets a verb-led label and one short descriptor at most.
- Step labels should be parallel in length and grammar. If one step needs a long explanation, move the explanation to a side note or speaker notes.

### `quote-highlight`

Purpose: emphasize a customer voice, principle, thesis, or decision statement.

Geometry:
- Quote or claim is the dominant text object.
- Use large type, generous whitespace, and optional attribution or context badge.
- Do not combine a quote-highlight page with a normal bullet section.

Text:
- One quote or statement, plus optional attribution. No bullets.

### `conclusion`

Purpose: close with decision, recommendation, or next action.

Geometry:
- Use one dominant closing statement or call to action.
- Visual focus should be the recommendation or action, not decorative filler.
- When using a full-bleed background image, add a semi-transparent scrim between the image and the text so the text stays legible; verify contrast.

Text:
- Keep the final page easy to remember. Avoid recap overload.
- Conclusion pages may mirror the cover background.

## Screenshot And Paper Figure Pages

When a page uses a real screenshot, chart, paper figure, or product capture:

- Choose screenshot placement based on page role, not a fixed slide number. Method overview, evidence, comparison, and failure-analysis pages are common candidates; title, agenda, and conclusion pages usually are not.
- Use the real asset only when it is readable at slide size. If the figure is too dense, crop to the relevant region, create a zoomed detail, or regenerate the core message with the image generation tool.
- A screenshot should normally be the visual focus. Do not shrink it into a decorative thumbnail while surrounding it with dense text.
- Pair the image with a small number of interpretive annotations that tell the audience what to notice.
- Always include a short source caption when using external or paper-derived visuals.
- Verify the final XML contains a supported image token or creation-time local placeholder, not an unsupported external URL.

## Plan To XML Checklist

Before creating XML for each page, answer these checks:

1. Which region is the visual focus, and is it the largest or most prominent object?
2. Does the XML geometry match the `layout_type` description above?
3. Does `text_density` limit the number of paragraphs, bullets, labels, and text boxes?
4. Would this page still be recognizable if the `layout_type` label were removed from the plan?
5. Across the deck, do multiple pages use genuinely different structures?
6. Does the background follow the planned deck strategy, and are any deviations intentional?
7. Are all text boxes large enough for their intended font size and line count?
8. If the page uses a screenshot or paper figure, is it large enough to read and accompanied by concise interpretation?

After fetching the created presentation, verify:

- Use `timeline`, `comparison`, and `architecture-diagram` only when the content calls for them; do not force irrelevant page types.
- Any planned `timeline`, `comparison`, or `architecture-diagram` page uses the matching sequence, side-by-side comparison, or component-and-connection structure.
- Pages are not crowded and do not rely on long bullet boxes.
- Main claim, supporting detail, and visual focus have clear hierarchy.
- Static XML inspection should include text-fit risk: very short text boxes containing long text, multi-paragraph boxes with insufficient height, footer text that may wrap, and labels placed directly over connectors.
- Background and motif consistency should be checked across pages, not only within one slide.


<a id="s-91d349f39b2cd412"></a>

## references/workflow/error-handling.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Troubleshooting

本文件覆盖 lark-slides 的通用创建前自检、XML 排障和常见失败处理。命令专属问题优先看对应 reference，例如 `+replace-slide`、`+media-upload`。

## XML Preflight

在真正创建或替换前，至少检查：

- 特殊字符已转义：正文和标题里的 `&`、`<`、`>` 不能裸写；属性值里的裸 `&` 也必须写成 `&amp;`。
- 属性引号安全：XML 属性、shell 引号、JSON 字符串包装之间没有互相打断。
- 结构合法：`<slide>` 下只放 `<style>`、`<data>`、`<note>`，文本都在 `<content>` 内。
- 图片路径正确：`<img src="@...">` 占位符由 `+create` 和 `+add-slide` 处理。

## Failure Order

遇到 `invalid param`、某一页创建失败、页面空白或布局错乱时，按顺序处理：

1. 记录 `xml_presentation_id`，不要假设失败代表什么都没创建。
2. 用 `slides +xml-get` 回读，确认是否已有部分页面写入。
3. 检查失败页是否含未转义字符：`Q&A -> Q&amp;A`，文本 `<` / `>` 写成 `&lt;` / `&gt;`，属性 URL `a=1&b=2 -> a=1&amp;b=2`。
4. 检查标签闭合、属性引号、`<content>` 结构，以及 `<slide>` 直接子元素。
5. 页面空白、溢出、重叠或越界时，按 [validation-xml.md](lark-slides-0.md#s-4a72cbe8eec0b655) 运行 `xml_lint.py`；先修复所有 `error`，再对 `warning` 指向的页面和元素做截图复核。
6. 如果使用 `--slides '[...]'` 字面量，怀疑 shell 转义或截断时改用文件输入：`+create --slide @page-01.xml --slide @page-02.xml`。
7. 局部问题用 `+replace-slide` 块级修正；整页结构要改时用 `+delete-slide` 删旧页 + `+add-slide` 建新页。

## Symptom Fixes

| 看到的问题 | 处理方式 |
|-----------|----------|
| 文字被截断 / 看不全 | 增大 shape 的 `width` 或 `height`，或减少文本量 |
| 元素重叠 | 调整 `topLeftX` / `topLeftY`，拉开间距 |
| 页面大面积空白 | 回读确认内容是否写入；若内容存在，再缩小间距或增加主体元素 |
| 文字和背景色太接近 | 深色背景用浅色文字，浅色背景用深色文字 |
| 表格列宽不合理 | 调整 `colgroup` 中 `col` 的 `width` 值 |
| 图表没有显示 | 检查 `chartPlotArea` 和 `chartData` 是否都包含，`dim1` / `dim2` 数据数量是否匹配 |
| 图片被裁掉一部分 | `<img>` 的 `width` / `height` 是裁剪后尺寸；要整图显示就让 `width:height` 对齐原图比例 |
| 图片不显示 / `<img src>` 仍是 `@path` | `@` 占位符由 `+create` 和 `+add-slide` 替换 |
| 新插入的 `<img>` 挡住原有元素 | 用 `+xml-get --slide-id` 读原页，对照已有块坐标挑空白位置；空间不够就在同一批 `--parts` 里先移动/缩小现有块再插图 |
| 渐变背景变成白色 | 渐变必须用 `rgba()` 格式 + 百分比停靠点，如 `linear-gradient(135deg,rgba(30,60,114,1) 0%,rgba(59,130,246,1) 100%)` |
| 整体风格不统一 | 封面页和结尾页用同一背景，内容页保持一致的配色和字号体系 |

## Common Errors

| 错误码 / 信号 | 含义 | 解决方案 |
|--------------|------|----------|
| 400 XML 格式错误 | XML 语法错误 | 检查标签闭合、属性引号、特殊字符转义 |
| 400 XML 输入错误 | XML 未按所用 shortcut 的参数传入 | 按 `+create` / `+add-slide` / `+update-slide` reference 检查 `--slides`、`--slide` 或 `--content` 的值 |
| 创建成功但页面空白 / 内容缺失 / 布局错乱 | 常见于 `--slides '[...]'` 字面量的 shell 转义或长参数传递问题 | 改用 `--slide @file`（每页一个文件）或 `--slides @deck.json`，并在创建后立即读取 XML 验证 |
| 403 权限不足 | scope 或文档权限不匹配 | 确认 scope 和文档权限；无权限时根据错误响应引导用户解决 |
| 404 演示文稿不存在 | `xml_presentation_id` 不正确或无权限 | 检查 token；wiki URL 需先解析真实 `obj_token` |
| 404 幻灯片不存在 | `slide_id` 不正确 | 重新读取 presentation 或 slide，确认最新 ID |
| 1061002 媒体上传 params error | slides 媒体上传参数不符合约定 | 用 `slides +media-upload`，由 shortcut 处理 Slides 所需的媒体参数 |
| 1061004 forbidden | 当前用户对演示文稿无编辑权限 | 确认当前用户对目标 PPT 有编辑权限 |
| 3350001 | XML 非 well-formed、XML 结构不符合服务端要求，或 replace 片段问题 | 优先检查未转义字符；replace 场景再看 `block_id` 和 `<content/>` |
| 3350002 | `revision_id` 大于当前版本 | 用 `-1` 取当前版本，或重新用 `slides +xml-get` 取最新 `revision_id` |
| validation: unsafe file path | `--file` 给了绝对路径或上层路径 | `--file` 必须是 CWD 内相对路径；先 `cd` 到素材目录再执行 |

## Command-Specific References

- 图片上传、`@path` 占位符、`file_token`：见 [lark-slides-media-upload.md](lark-slides-0.md#s-0a4a00cc57a24b7b) 和 [lark-slides-create.md](lark-slides-0.md#s-2dc9fd2b0e0f4d9a)。
- 块级替换、`block_id`、3350001 replace 细节：见 [lark-slides-replace-slide.md](lark-slides-0.md#s-de7059cb8c77747f)。
- 追加/插入单页、`--before-slide-id` 和 `--slide @file` 绕开转义：见 [lark-slides-add-slide.md](lark-slides-0.md#s-781503ce17b301f7)。


<a id="s-741dd493d62520a5"></a>

## references/workflow/slides-editing.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 编辑已有 PPT：读-改-写闭环

局部编辑走 **shortcut [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f)**（块级替换 / 插入），配合 `+xml-get --slide-id` 读原页拿 `block_id`。整页重建走 **[`+update-slide`](lark-slides-0.md#s-d59026b95d949611)**，多页就每页各跑一次 —— 它原地覆盖并保留 `slide_id` 和页序；只有写进 `--content` 且带原 id 的元素才会保留元素 id，遗漏的元素会被删除。

> 生成 XML 前**必读** [xml-schema-quick-ref.md](lark-slides-0.md#s-5c0e180adc0fc634)。

## 决策树：block_replace vs block_insert

| 需求 | 推荐 action | 理由 |
|------|------------|------|
| 已知某块的 `block_id`，要换这块内容（改标题、换图、挪坐标） | `block_replace` | 精准替换，原子性好；`replacement` 根 `id` 由 CLI 自动注入为 `block_id` |
| 只加 1~N 个元素、不动现有布局 | `block_insert` | 新增不覆盖，可选 `insert_before_block_id` 指定位置 |
| 一次动多个元素（如：换标题 + 加图） | 单次 `--parts` 里拼多条 | 整批作为原子事务，任一失败整批不生效；`block_replace` 和 `block_insert` 可混用 |
| 整页版式重建、整页坐标重排、改页面背景、删若干元素 | `+update-slide`（每页一次） | 原地整页覆盖，`slide_id` 和页序不变；带原 `id` 的元素保留 id，不带 `id` 的作为新元素插入，遗漏的被删除 |

> **没有字段级 patch**：即便只想改一个 `shape` 的 `topLeftX`，也得把整个块的新 XML 写出来用 `block_replace`。这不是"微调"，是块级重写。

## 最小读-改-写闭环

```text
PRES_ID="xml_presentation_id_here"
SID="slide_id_here"

# 1. 读原页，从 XML 里挑出要改的块的 3 位 short id（如 bUn / bab）
lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" --raw

# 2. 用 +replace-slide 直接改那个块（不需要搬原 XML）
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"}]'
```

`slide_id` / 页序不会变。`block_replace` 的 `replacement` 根元素 `id` 会自动注入为 `block_id`，用户手写 XML 时不需要自己加。

> **编写 `--parts` 时只使用标准字段**：`block_replace` 使用 `action` + `block_id` + `replacement`（XML 字符串），`block_insert` 使用 `action` + `insertion`（可选 `insert_before_block_id`）。收到 unknown field 报错时应按上述结构修改字段名，而不是修改字段值。

## `revision_id` 参数

`--revision-id` 默认 `-1`，表示基于当前最新版执行。传具体版本号时，服务端以该版本为 base 应用变更：

```text
# 读时拿当前 revision_id
REV=$(lark-cli slides +xml-get --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --jq '.data.revision_id')

# 写时传该版本号，服务端以此为 base
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" --revision-id "$REV" \
  --parts '[{"action":"block_replace","block_id":"bUn","replacement":"<shape type=\"rect\" topLeftX=\"100\" topLeftY=\"100\" width=\"200\" height=\"100\"/>"}]'
```

注意：传不存在的版本号（超过当前 revision）会返回 3350002 not found；不确定时用 `-1` 即可。

## `--tid` 事务锁

跨请求的并发事务 ID，多人协作长事务才用得上。**单人单次调用留空**即可。

## 两种 action 详解

### block_replace — 整块替换

适合"已知块 ID，要换这块整体内容"的场景。`replacement` 根元素的 `id="<block_id>"` 由 CLI 自动注入（用户手写的 XML 如果没带 `id` 直接省略即可；如果带了错的会被覆盖为正确值）。

```text
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[{"action":"block_replace","block_id":"bab","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"}]'
```

字段说明：

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | 固定为 `block_replace` |
| `block_id` | 是 | 目标块的 3 位 short element ID（从 `+xml-get --slide-id` 返回的 XML 里读）|
| `replacement` | 是 | 新 XML 片段；根元素 `id` 会被 CLI 自动注入为 `block_id` |

### block_insert — 整块插入

适合"只想加一个元素，不动现有元素"的场景（典型：给已有页加图）。

```text
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts "$(jq -n --arg token "$FILE_TOKEN" \
    '[{action:"block_insert",insertion:("<img src=\""+$token+"\" topLeftX=\"500\" topLeftY=\"100\" width=\"200\" height=\"150\"/>"),insert_before_block_id:"baa"}]')"
```

字段说明：

| 字段 | 必填 | 说明 |
|------|------|------|
| `action` | 是 | 固定为 `block_insert` |
| `insertion` | 是 | 要插入的完整 XML 片段 |
| `insert_before_block_id` | 否 | 插到这个块之前；省略（不提供此字段）则追加到页面末尾 |

> **`<img>` 必须用 `file_token`**，不能用外链 URL——先 `slides +media-upload --file ./pic.png --presentation $PRES_ID` 拿 token。

### 批量 parts

一次 `--parts` 最多 200 条，按数组顺序串行执行。`block_replace` 和 `block_insert` 可以在同一批次混用。举例：一次性把标题块替换、然后在末尾追加一个装饰图。

```text
lark-cli slides +replace-slide --as user \
  --presentation "$PRES_ID" --slide-id "$SID" \
  --parts '[{"action":"block_replace","block_id":"bab","replacement":"<shape type=\"text\" topLeftX=\"80\" topLeftY=\"80\" width=\"800\" height=\"120\"><content textType=\"title\"><p>新标题</p></content></shape>"},{"action":"block_insert","insertion":"<img src=\"<file_token>\" topLeftX=\"700\" topLeftY=\"400\" width=\"180\" height=\"100\"/>"}]'
```

整批作为原子事务：任一条失败整批不生效。失败时后端通常返回 3350001；若响应中带 `failed_part_index` / `failed_reason` 字段，shortcut 会原样透传。

## 大 --parts 用 jq 或 stdin 组装

`--parts` 支持 `@file`（读文件）和 `-`（stdin）作为值来源，适合批量 XML 场景：

```text
# 从文件读
lark-cli slides +replace-slide --as user --presentation "$PRES_ID" --slide-id "$SID" \
  --parts @parts.json

# 从 stdin 读
cat parts.json | lark-cli slides +replace-slide --as user --presentation "$PRES_ID" --slide-id "$SID" \
  --parts -
```

## 错误排查

| 现象 | 原因 | 对策 |
|------|------|------|
| 3350001，hint 含 "block_id not found" | `parts[i].block_id` 在当前页不存在 | 重新用 `+xml-get --slide-id` 拿最新 XML，按里面的 short ID 再填 |
| 3350002 not found | `--revision-id` 传了不存在的版本号 | 用 `-1` 或 `+xml-get --slide-id` 返回的 `revision_id` |
| `<img>` 不显示 / 显示破图 | `src` 写了外链 URL | 换成通过 `+media-upload` 拿到的 `file_token` |
| 3350001（block_replace 返回） | 正常情况下 CLI 已自动注入 `id` 和 `<content/>`；如果仍报错，确认 `block_id` 在当前页存在（重新 `+xml-get --slide-id`），检查 XML 结构是否合法；坐标是否超出 960×540 范围 | — |

## 相关文档

- [lark-slides-replace-slide.md](lark-slides-0.md#s-de7059cb8c77747f) — +replace-slide shortcut 参数详情
- [lark-slides-update-slide.md](lark-slides-0.md#s-d59026b95d949611) — +update-slide shortcut 参数详情（整页覆盖）
- [lark-slides-xml-presentations-get.md](lark-slides-0.md#s-cc7a42f8bd992b15) — `+xml-get` 参数与单页读取方法
- [lark-slides-media-upload.md](lark-slides-0.md#s-0a4a00cc57a24b7b) — 上传图片拿 file_token
- [xml-schema-quick-ref.md](lark-slides-0.md#s-5c0e180adc0fc634) — XML 元素和属性速查


<a id="s-f749479c8d9360a8"></a>

## references/workflow/template-editing.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# PPT Template Rewrite Principles

核心原则：模板不是风格参考，而是必须沿用的编辑底稿。

## Import First

如果用户提供的模板是 PPTX 格式，先把模板导入成 Lark Slides。后续写入目标是导入后的 Slides，不是新建一个脱离模板的 deck，也不是先在本地重画 PPTX 再导入。

直接使用以下命令，不需要先加载 `lark-drive` Skill：

```text
lark-cli drive +import --as user --file "<template.pptx>" --type slides --json
```

可选参数：用 `--name "<title>"` 指定导入后的 Slides 标题；用 `--folder-token <FOLDER_TOKEN>` 指定目标文件夹。若返回 `ready=false` / `timed_out=true`，直接执行返回值里的 `next_command`；等价形式是：

```text
lark-cli drive +task_result --scenario import --ticket <TICKET>
```

## Read Before Editing

导入后必须阅读 Slides 内容，理解每页的真实版式、字体、层级、图片、图表、shape、表格和文本容器。阅读结果是后续编辑的事实来源。

阅读页面时至少判断：

- 该页原本承担的角色，例如封面、章节页、目录、流程、对比、数据、总结。
- 该页的主要版式结构，例如图文关系、箭头、时间线、节点、表格、图表、左右对照、背景图或产品图。
- 哪些文本框、shape 标签、表格单元格或图表标签承载内容。
- 原页面的字体、字号、颜色、对齐、层级和留白关系。

## Edit The Imported Slides Directly

理解页面后，直接在导入后的 Slides 上编辑。允许的操作包括：

- 填写、替换、凝练或删除文字。
- 替换或补充图片。
- 更新图表、表格、数字标签或节点标签里的内容。
- 按需复制、删除或重排模板页。
- 在源页面没有合适承载位置时，做局部、小范围新增元素。

新增元素只能补足内容缺口，不能成为新的主版式。页面主体仍应由模板原有版式承载。

## Preserve Design

编辑必须严格沿用原版式和字体，只改内容，不做设计。

默认保留：

- 页面布局、视觉层级、留白和对齐关系。
- 原字体、字号体系、颜色、文本框位置和 shape 顺序。
- 背景图、图片、logo、图表、表格、装饰形状、线条、图标和页面结构。
- 模板中不同页型之间的差异。

不要把模板页改造成统一的通用卡片、空白板式布局、标题栏、三栏、2x2 卡片或大面积遮罩。不要把模板当作背景图后另起一套设计系统。

## Content Only

内容必须优先进入原页面已有的文本框、shape 标签、节点、表格单元格、图表标签或注释容器。

如果原容器空间不足，优先：

- 凝练文字。
- 降低字号但保持原字体体系。
- 拆分到页面已有的邻近容器。
- 使用模板已有的注释、标签或补充说明区域。
- 复制同页或同模板中的原生容器样式做局部补充。

不要为了容纳长文案而重画页面主体结构。不要用新增大卡片遮住原图表、箭头、图片、背景或关键 shape。

## Readback And Tune

完成编辑后必须回读结果，并逐页微调。

回读时重点检查：

- 文字是否溢出、截断、压线或超出容器。
- 文本是否遮挡图片、图表、shape、箭头、节点或其他文字。
- shape 顺序是否导致内容被覆盖或遮住。
- 新内容是否仍然落在模板原有版式中，而不是覆盖模板结构。
- 字体、字号、颜色、对齐和层级是否仍贴近原页。

发现文字溢出时，优先凝练文字或缩减字号。发现遮挡时，调整 shape 顺序、局部位置或复用原有空白区域解决。只有在这些方法都不能满足内容表达时，才做局部新增或删除。

完成标准是“原模板的版式、字体和视觉结构仍清晰存在，内容已经被准确替换，并且回读后没有溢出和遮挡”。


<a id="s-4a72cbe8eec0b655"></a>

## references/workflow/validation-xml.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Validation Checklist

创建、大幅改写演示文稿或整页写回后，必须做一次显式验证。目标是发现空白页、XML 损坏、内容截断、明显溢出、弱视觉层级和未验证输出。

小型已有页编辑也要做对应范围的验证：至少读取被改页面或全文 XML，确认目标元素已更新且未破坏周边结构。

## Required Flow

1. 记录创建或编辑返回的 `xml_presentation_id`，以及已知的 `slide_id` / `revision_id`。
2. 用 `slides +xml-get` 回读全文 XML 到本地文件。
3. 检查实际页数是否符合计划或用户要求。
4. 检查每页 `<data>` 内是否有预期主要元素。
5. 检查没有明显空白页、破损页、缺失标题或缺失主视觉。
6. 检查页面不是全部退化为标题加 bullet list。
7. 检查视觉层级：标题、主视觉、支撑信息三者可区分。
8. 检查明显溢出和布局风险：重叠、越界、底部拥挤、长文本框。
9. 在最终回复中给出简短验证记录。

回读命令：

```text
lark-cli slides +xml-get --as user \
  --presentation "YOUR_ID" \
  --output .lark-slides/plan/<deck-or-task-id>/readback.xml \
  --json
```

## Automated XML Layout Lint

`slides +xml-get` 保存 XML 后，只运行统一版式准出入口。先取得当前已加载 `lark-slides/SKILL.md` 的父目录，记为 `<lark-slides-skill-dir>`；不要猜测全局安装路径。

```text
python3 "<lark-slides-skill-dir>/scripts/xml_lint.py" --input <presentation.xml>
```

它一次检查 XML/SXSD 合法性、元素越界、文本重叠、空白页、文本高度风险、整页内容稀疏和大卡片内容覆盖率。大卡片自身 `<content>` 的估算文本面积与卡片内平级元素一起参与覆盖率并集计算。

准出规则：

- `summary.error_count > 0` 或 `summary.release_ready == false`：阻断创建、替换或交付，必须先修复。
- `summary.warning_count > 0`：静态检查不直接阻断，但 `summary.screenshot_review_required == true`，必须复核对应页面截图。
- `slides[].status` 为 `blocked`、`needs_screenshot_review` 或 `passed`，可直接决定逐页后续动作。
- CLI 在存在 `error` 时退出码为 1；只有 `warning` 时仍输出 JSON 并退出 0，供截图复核链路继续执行。

每条 `error` / `warning` 都包含：

- `element_ids`：相关 XML 元素 ID；
- `rule`：规则 ID、名称、阈值和比较关系；
- `measurement`：越界量、交叠面积、覆盖率等实测值；
- `related_objects`：相关对象的类型、坐标框，以及指向当前输入 XML 节点的 XPath-like `xml_path`；
- `target`、`message`、`hint`：页码、语义说明和处理建议。

当 `sparse_container_content.measurement.content_coverage_ratio < rule.threshold` 时，需要结合同页截图判断留白是否有意设计；不要仅凭 warning 自动扩充内容。

常见 code 的处理方向：

| code | 含义 | 处理方式 |
|------|------|----------|
| `xml_not_well_formed` | XML 语法错误或文本未转义 | 修复标签闭合、属性引号、`&` / `<` / `>` 转义 |
| `sml_prefixed_tag` | SML 元素使用了命名空间前缀，如 `<ns0:slide>` 或 `<sml:shape>` | 使用 `<slide xmlns="https://www.larkoffice.com/sml/2.0">` 的默认命名空间，或使用无前缀标签 |
| `sxsd_unsupported_tag` | 使用了 SXSD 不支持的标签 | 按 lint `hint` 替换为受支持标签；常见如 `textbox -> <shape type="text">`、`image -> <img>` |
| `sxsd_unsupported_attr` | 支持的标签上使用了不支持的属性 | 按 lint `hint` 改为支持的属性；常见如 `x -> topLeftX`、`fontColor -> color` |
| `iconpark_unsupported_icon_type` | `<icon>` 使用了 `iconpark-index.json` 中不存在的 `iconType` | 按 lint `hint` 改为名单内的 `iconType`，或先用 `scripts/iconpark_tool.py` 搜索 |
| `icon_missing_fill_color` | 视觉规范要求 `<icon>` 设置 `<fill><fillColor color="..."/></fill>`，避免图标不可见 | 给 `<icon>` 添加显式非透明填充色，例如 `rgba(37, 99, 235, 1)` |
| `icon_transparent_fill_color` | `<icon>` 的 `fillColor` 是透明色，不满足视觉可见性要求 | 改成与背景有足够对比的非透明颜色 |
| `bbox_overlap` | 文本元素的估算绘制区域明显重叠 | 拉开文本坐标、缩小文本框/字号，或改成明确的分栏/分组结构 |
| `*_out_of_canvas` | 元素边界超出页面画布 | 根据 `measurement.overflow` 移回画布或缩小尺寸 |
| `blank_slide` | 页面没有画布内可见内容 | 补充主体内容；仅有空背景或空形状不能准出 |
| `sparse_container_content` | 大卡片内容覆盖率低于阈值 | 按 `related_objects[].xml_path` 定位卡片；`element_id` 存在且唯一时也可按 ID 定位，再结合截图判断是否补充或放大内容 |
| `sparse_slide_content` | 全页有效内容覆盖率偏低 | 复核截图，确认是否为有意留白 |

## Screenshot QA

获取页面截图后，必须做视觉验收；不要只凭 XML 回读或静态 lint 结论声称截图验收通过。验收时假设页面存在问题，主动寻找并报告所有风险，包括轻微问题。

```text
请逐页目视检查这些幻灯片截图。先假设存在问题，并尽量找出它们。

重点检查：
- 元素重叠：文字与形状、图片或图表互相遮挡，线条穿过文字，卡片或标签堆叠。
- 文本溢出或被裁切：靠近页面边缘、文本框边界或卡片边界处被截断。
- 装饰元素位置错误：分割线、强调线或标签底板按单行文字布置，但标题或正文换行后压住文字或距离异常。
- 来源标注、页脚或页码与上方内容碰撞。
- 元素距离过近：相邻元素间距明显不足，卡片或分区几乎贴在一起；按 960x540 画布估算，小于约 15 px 的间隔通常要标记。
- 间距不均：局部留白过大，另一处过于拥挤。
- 页面边距不足：主体内容贴近幻灯片边缘；按 960x540 画布估算，小于约 30 px 的外边距通常要标记。
- 列、卡片、图标或同类元素没有稳定对齐。
- 图片或图表渲染异常：空白、变形、低清、关键内容不可读或预期图形缺失。
- 文本对比度不足，例如浅灰文字放在米色或浅色背景上。
- 图标对比度不足，例如深色图标放在深色背景上，且没有浅色圆形或底板承托。
- 文本框过窄，导致不必要的频繁换行。
- 残留占位符、模板默认文字或未替换内容。

对每一页分别列出发现的问题或可疑区域，即使只是轻微问题也要记录。

报告所有发现的问题，包括轻微问题。
```

必须根据问题严重度决定是否修复：空白页、破图、文字遮挡、明显裁切、低对比不可读、占位符残留等必须先修复再交付；轻微间距或对齐问题如果不修复，最终验证记录要说明已知风险。

## Page Count And Structure

- 实际页数必须等于用户要求或 `slide_plan.json` 的页数。
- 如果创建过程部分失败，先记录已创建的 `xml_presentation_id`，再回读确认哪些页已写入。
- 每页都应包含 `<data>`，且 `<data>` 内至少有一个非背景主体元素。
- 封面、章节页、总结页可以文字较少，但不能只有空背景。
- 技术解释页、对比页、流程页、架构页必须有匹配的结构元素，例如分组框、连线、时间轴、表格或图形化区域。

## Expected Elements

按 `slide_plan.json` 和用户要求逐页核对：

- 标题或主结论存在，并能对应 `key_message`。
- `layout_type` 对应的主要结构已生成。
- `visual_focus` 是页面中最醒目或最大的信息区域之一。
- `text_density` 影响了文本量，没有用长 bullet 框替代规划。
- `asset_need` 有真实素材时已放入正确区域；没有真实素材时，`fallback_if_missing` 已用 XML 形状、线条、标签、表格或图表兜底。

如果用户指定了关键页，例如“架构解释”“Self-Attention 机制解释”“对比或演进视角”“总结页”，最终验证记录必须逐项说明这些页已存在。

## Blank Or Broken Page Signals

把下面情况视为需要修复后再交付：

- `<data/>` 为空，或只有背景、装饰线、空 `<content/>`。
- 关键文本没有出现在回读 XML 中。
- 图片仍是 `@./path`，或 `<img src>` 是 http(s) 外链。
- 页面依赖的图片区域为空，且没有 fallback visual。
- 返回 XML 缺页、页序明显错误，或某页内容被 shell 截断。
- 大量形状坐标完全相同，导致主体内容重叠。
- 渐变背景回退成空白或白底，导致文字不可读。

## Layout And Overflow Risk

优先修复这些明显风险：

- 正文或标签框高度不足，文本很可能被截断。
- 多个主体元素在同一区域重叠，而不是有意叠加背景。
- 重要内容越过画布边界，或贴近底部超过 `y=500`。
- 高密度页使用单个长 bullet list，没有分栏、表格或分组。
- 标题、主视觉、正文的字号和颜色差异太弱，视觉层级不清。
- 所有内容页都是同一套标题加 bullets 坐标。

## Verification Record

最终回复必须包含简短验证记录，建议格式：

```text
验证记录：
- 回读：已执行 slides +xml-get，实际页数 N / 预期 N。
- 关键页：架构解释 / Self-Attention / 对比或演进 / 总结页均存在。
- 结构：检查了主要 shape/img/table/chart 元素，无明显空白页或破损页。
- 布局：检查了标题层级、主视觉、重叠/越界/文本溢出风险。
```

不要声称完成了人工视觉验收，除非确实打开或获取了可视化结果。仅从 XML 静态检查得出的结论，应表述为“静态检查未发现明显问题”。


<a id="s-0952eb4744ad31ed"></a>

## references/xml/iconpark.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# IconPark 图标

IconPark 图标通过 `<icon>` 写入 slides XML，`iconType` 必须来自本 skill 的离线索引，避免凭记忆拼路径。

## 机器优先流程

```text
python3 skills/lark-slides/scripts/iconpark_tool.py search --query "增长趋势" --limit 8
python3 skills/lark-slides/scripts/iconpark_tool.py resolve --name chart-line
python3 skills/lark-slides/scripts/iconpark_tool.py list-categories
```

`search` 返回 JSON 数组，每项包含 `iconType`、`category`、`name`、`tags`、`score`。直接把选中的 `iconType` 写入 XML，并为图标指定可见颜色：

```xml
<icon iconType="iconpark/Charts/chart-line.svg" topLeftX="80" topLeftY="120" width="32" height="32">
  <fill>
    <fillColor color="rgba(37, 99, 235, 1)"/>
  </fill>
</icon>
```

## 使用规则

- 默认先检索：语义图标需求必须先用 `iconpark_tool.py search --limit 8` 或 `--limit 10`，让 agent 从候选里结合版面语义二次判断；不要阅读全文索引，也不要编造不存在的 `iconType`。
- 图标用于概念提示、步骤、状态、指标、角色和导航；不要用无关装饰图标填充版面。
- 常用尺寸：行内状态图标 16-24px，卡片标题图标 28-40px，主视觉图标 56-96px。
- 图标必须填充颜色并和背景有足够对比；深色背景优先放在浅色圆形/方形底上，或使用 `rgba(255, 255, 255, 1)` 作为图标填充色。
- 查不到合适图标时，从高频示例里选择替代图标（随机选择，不要千篇一律），不留空图标位。

## 高频示例

| 语义 | iconType |
|---|---|
| 设置/配置 | `iconpark/Base/setting.svg` |
| 目标 | `iconpark/Base/aiming.svg` |
| 增长趋势 | `iconpark/Charts/positive-dynamics.svg` |
| 折线趋势 | `iconpark/Charts/chart-line.svg` |
| 占比 | `iconpark/Charts/chart-proportion.svg` |
| 数据看板 | `iconpark/Charts/data-screen.svg` |
| 成功 | `iconpark/Character/check-one.svg` |
| 失败/风险 | `iconpark/Character/close-one.svg` |
| 团队/用户 | `iconpark/Peoples/peoples.svg` |
| 安全防护 | `iconpark/Safe/protect.svg` |
| 全球/市场 | `iconpark/Travel/world.svg` |
| 邮件/联系 | `iconpark/Office/envelope-one.svg` |


<a id="s-5c0e180adc0fc634"></a>

## references/xml/xml-schema-quick-ref.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# XML Schema 快速参考

本文档是 [slides_xml_schema_definition.xml](../assets/lark-slides/references/xml/slides_xml_schema_definition.xml) 的精简版摘要，并合并了常用 XML 格式写法；如果两者不一致，以 XSD 原文为准。

## 最重要的规则

1. 协议标准写法应使用 `<presentation xmlns="https://www.larkoffice.com/sml/2.0">`；当前服务端实现可能兼容不带 `xmlns` 的输入，但不作为协议保证
2. `<presentation>` 直接子元素只有 `<title>`、`<theme>`、`<slide>`
3. `<slide>` 直接子元素只有 `<style>`、`<data>`、`<note>`
4. 页面中的文本通常通过 `<content>` 表达，而不是把 `<title>`、`<body>` 直接挂在 `<slide>` 下

## 最小可用示例

```xml
<presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
  <slide>
    <data>
      <shape type="text" topLeftX="80" topLeftY="80" width="800" height="120">
        <content autoFit="normal-auto-fit" wrap="true" textType="title">
          <p>标题</p>
        </content>
      </shape>
    </data>
  </slide>
</presentation>
```

## presentation 根元素

| 属性 | 必需 | 说明 |
|------|------|------|
| `width` | 是 | 演示文稿宽度，正整数，标准 16:9 页面建议使用 `960` |
| `height` | 是 | 演示文稿高度，正整数，标准 16:9 页面建议使用 `540` |
| `id` | 否 | 演示文稿标识 |

**子元素：** `<title>?`, `<theme>?`, `<slide>+`

`<slide>` 至少 1 页，最多 100 页。

## theme 与文本类型

`<theme>` 当前包含两部分：

- `<background>`：演示文稿级背景填充
- `<textStyles>`：主题文本样式集合

`<textStyles>` 下可选子元素包括 `<title>`、`<headline>`、`<sub-headline>`、`<body>`、`<caption>`。这些元素定义的是主题默认样式，不是页面结构。

常用属性：

| 属性 | 说明 |
|------|------|
| `fontFamily` | 字体 |
| `fontSize` | 字号 |
| `fontColor` | 字体颜色 |

XSD 中的 `title`、`headline`、`sub-headline`、`body`、`caption` 主要出现在：

- `<theme><textStyles>...</textStyles></theme>` 中，作为主题文本样式
- `<content textType="...">` 中，作为内容的文本类型

`textStyles` 的 schema 默认值如下：

| textType | 默认字号 |
|----------|----------|
| `title` | 54 |
| `headline` | 38 |
| `sub-headline` | 32 |
| `body` | 16 |
| `caption` | 12 |

默认字号是省略 `fontSize` 时的兜底字号，不是推荐值。字号必须显式设置 `<content>` 的 `fontSize` 属性，不要依赖 `textType` 的默认字号兜底，这些兜底值明显偏大。

## slide 元素

| 属性 | 必需 | 说明 |
|------|------|------|
| `id` | 否 | 幻灯片标识 |

**子元素：**

- `<style>?` - 页面样式，目前可放 `<fill>`
- `<data>?` - 页面元素容器，可放 `shape`、`line`、`polyline`、`img`、`table`、`icon`、`embed`、`chart`、`undefined`
- `<note>?` - 演讲者备注，内部可放 `<content>`

这意味着 `<title>`、`<headline>`、`<body>`、`<caption>` 不能直接放在 `<slide>` 下。

## content 内容模型

`<content>` 可出现在 `shape`、`table/td`、`note` 中，常用属性包括：

| 属性 | 说明 |
|------|------|
| `textType` | `title` / `headline` / `sub-headline` / `body` / `caption` |
| `verticalAlign` | 垂直对齐 |
| `textAlign` | 文本对齐方式 |
| `lineSpacing` | 行间距，schema 默认 `multiple:1.5` |
| `fontSize` | 字号 |
| `fontFamily` | 字体 |
| `color` | 字体颜色 |
| `bold` / `italic` / `underline` / `strikethrough` | 内容级样式 |
| `wrap` | 是否自动换行 |
| `autoFit` | 是否自动缩排 |

注意事项：

- 字号必须显式设置 `<content>` 的 `fontSize` 属性，不要依赖 `textType` 的默认字号兜底，这些兜底值明显偏大。
- 大数字、字号大或字数多的 `<content>` 必须设置 `wrap="true" autoFit="normal-auto-fit"` 属性自动换行和缩排，避免文字溢出。
- 文字颜色必须用 `<content>` 的 `color` 属性而不是 `fontColor` 属性。
- 文字行间距必须设置 `<content>` 的 `lineSpacing="multiple:xx"` 或 `lineSpacing="fixed:xx"` 而不是 `lineSpacing="xx"`。

`<content>` 直接子元素只有：

- `<p>`
- `<ul>`
- `<ol>`

### p 段落与内联标签

`<p>` 是段落元素，可混排纯文本和内联标签：

- `<br/>`
- `<strong>`
- `<em>`
- `<u>`
- `<span>`
- `<del>`
- `<a>`
- `<shadow>`
- `<outline>`
- `<formula>`

公式写法：

```xml
<p>公式：<formula><latex><![CDATA[ E = mc^2 ]]></latex></formula></p>
```

`<formula>` 是内联元素；当前只支持一个 `<latex>` 子元素。LaTeX 内容必须放在 `CDATA` 中，且 `CDATA` 内不要写 XML 转义；宏只使用服务端支持范围内的写法，优先用基础运算符、`\frac`、`\sqrt`、`matrix`。

示例：

```xml
<content autoFit="normal-auto-fit" textType="body" textAlign="left">
  <p>正文内容 <strong>加粗</strong> <em>斜体</em> <a href="https://example.com">链接</a></p>
  <ul>
    <li><p>列表项 1</p></li>
    <li><p>列表项 2</p></li>
  </ul>
</content>
```

## data 常用元素

所有页面元素都放在 `<data>` 中。

### shape

`shape` 可表示普通形状，也可表示文本框。文本框推荐使用 `type="text"`。

```xml
<shape type="text" topLeftX="80" topLeftY="80" width="800" height="120">
  <content textType="title">
    <p>主标题</p>
  </content>
</shape>
```

```xml
<shape type="rect" topLeftX="120" topLeftY="120" width="240" height="120">
  <fill>
    <fillColor color="rgb(100, 149, 237)"/>
  </fill>
  <border color="rgb(0, 0, 0)" width="2"/>
</shape>
```
`<shape type="rect">` 只是形状不是容器，`<icon>`、`<img>`、`<shape type="text">` 和其他 `<shape>` 必须与它平级靠坐标叠放。


| 属性 | 必需 | 说明 |
|------|------|------|
| `type` | 是 | 形状类型，`text` 表示文本框 |
| `topLeftX` | 是 | 左上角 X 坐标 |
| `topLeftY` | 是 | 左上角 Y 坐标 |
| `width` | 是 | 宽度 |
| `height` | 是 | 高度 |
| `rotation` | 否 | 旋转角度 |
| `flipX` / `flipY` | 否 | 翻转 |
| `alpha` | 否 | 透明度 |

可选子元素：

- `<fill>`
- `<border>`
- `<reflection>`
- `<shadow>`
- `<content>`

`type` 常用取值：`text`（文本框）、`rect`、`round-rect`（圆角矩形）、`ellipse`（椭圆/圆）、`triangle`、`diamond`、`parallelogram`、`trapezoid`、`custom`（配合 `path` 属性写 SVG 路径串）。箭头、星形、标注气泡、`chevron`、`flow-chart-*` 等更多形状见 XSD `ShapeType` 枚举。

其它可选属性：

- `presetHandlers`：控制点，用于圆角等。例如 `<shape type="rect" presetHandlers="60">` = 圆角半径 60px 的圆角矩形；多个控制点用逗号分隔。
- `path`：仅 `type="custom"` 时使用，SVG 路径串。

### line

```xml
<line startX="120" startY="120" endX="420" endY="120">
  <border color="rgb(43, 47, 54)" width="2"/>
</line>
```

`line` 使用的是 `startX` / `startY` / `endX` / `endY`，不是 `x1` / `y1` / `x2` / `y2`。

### polyline

折线 / 曲线连接线，用外接矩形定位（`topLeftX` / `topLeftY` / `width` / `height`），不是端点坐标；`<border>` 必填（无 border 不可见）。`type` 默认 `bent-connector2`（可选 `bent-connector2-5` 折线 / `curved-connector2-5` 曲线）。

```xml
<polyline topLeftX="120" topLeftY="120" width="200" height="100">
  <border color="rgb(43, 47, 54)" width="2"/>
</polyline>
```

### img

```xml
<img src="file_token_或_@本地路径" topLeftX="80" topLeftY="120" width="320" height="180"/>
```

`img` 使用 `topLeftX` / `topLeftY`，不是 `x` / `y`。

`src` 只支持：`slides +media-upload` 返回的 `file_token`，或 `@<本地路径>` 占位符（`+create --slides` 和 `+add-slide` 会自动上传并替换）。**禁止使用 http(s) 外链 URL**——飞书 slides 渲染端不会代理外链图，外链 src 在 PPT 里通常不显示。本地图片详见 [lark-slides-create.md](lark-slides-0.md#s-2dc9fd2b0e0f4d9a) / [lark-slides-media-upload.md](lark-slides-0.md#s-0a4a00cc57a24b7b)。

本地图片的两种姿势：

- 新建带图 PPT：`+create --slides` 里直接写 `src="@./pic.png"`，CLI 在创空白 PPT 后、加 slides 前自动上传并替换 token
- 给已有 PPT 加带图新页：`+add-slide --slide` 的 XML 里直接写 `src="@./pic.png"`，CLI 上传后替换 token 再提交页面

> **注意**：`width`/`height` 是**裁剪后**的显示尺寸。比例和原图不一致时会自动裁剪（无法靠属性关闭），想避免裁剪就让 `width:height` 对齐原图比例。

### icon

```xml
<icon iconType="iconpark/Charts/chart-line.svg" topLeftX="80" topLeftY="120" width="32" height="32">
  <fill>
    <fillColor color="rgba(37, 99, 235, 1)"/>
  </fill>
</icon>
```

图标必须填充颜色并和背景有足够对比。

禁止盲猜 iconType，必须先检索 IconPark，再写 `<icon iconType="...">`。检索方式和更多规则见 [iconpark.md](lark-slides-0.md#s-0952eb4744ad31ed)。


### table

表格结构为：

- `<table>` 直接子元素只有 `<colgroup>` 和 `<tr>`，`width` 和 `height` 分别表示表格的目标总宽度和总高度。
- `<colgroup>` 直接子元素只有 `<col width="...">`，width 定义列宽，默认 110。
- `<tr height="...">` 直接子元素只有 `<td>`，height 定义行高，默认 37。
- `<td>` 直接子元素只有 `<fill>`（背景）、`<content>`（文字）和边框配置（一般不用），不能嵌套 `<shape>`、`<img>`、`<icon>`。
- 合并单元格：`<td>` 上用 `colspan`（跨列，默认 1）和 `rowspan`（跨行，默认 1）；被合并覆盖的单元格不再写对应 `<td>`。

表头默认的白底白字视觉效果极差，必须设置背景和文字颜色，需在首行每个 `<td>` 上加 `<fill>`（配合 `bold` 与对比文字色）与正文行区分。

表格里的文字默认是居中对齐，可以设置 `textAlign` 调整对齐方式。

表格宽高设置：

- 已设置的列宽和行高优先保留，未设置的列宽、行高会使用表格的目标总宽度、总高度分配剩余空间
- **必须设置 `<table>` 的 `width` 和 `height` 固定表格大小，同时设置需要保留列宽或行高的 `<col>` 的 `width` 和 `<tr>` 的 `height`，其余自动分配。**

不同字号的行高参考：

| `fontSize` | 内容行数 | 紧凑 `height` | 适中 `height` | 宽松 `height` |
|------|------|------|------|------|
| 10 | 单行 | 16 | 20 | 24 |
| 12 | 单行 | 20 | 24 | 28 |
| 10 | 双行 | 32 | 36 | 42 |
| 12 | 双行 | 36 | 42 | 48 |

示例：

```xml
<table topLeftX="80" topLeftY="140" width="520" height="52">
  <colgroup>
    <col width="160"/>
    <col width="120"/>
    <col />
  </colgroup>
  <tr height="28">
    <td>
      <fill><fillColor color="rgba(30,60,114,1)"/></fill>
      <content textType="body" fontSize="12" bold="true" color="rgba(255,255,255,1)" textAlign="center"><p>项目</p></content>
    </td>
    <td>
      <fill><fillColor color="rgba(30,60,114,1)"/></fill>
      <content textType="body" fontSize="12" bold="true" color="rgba(255,255,255,1)" textAlign="right"><p>营收</p></content>
    </td>
    <td>
      <fill><fillColor color="rgba(30,60,114,1)"/></fill>
      <content textType="body" fontSize="12" bold="true" color="rgba(255,255,255,1)" textAlign="left"><p>备注说明</p></content>
    </td>
  </tr>
  <tr>
    <td><content textType="body" fontSize="10" textAlign="center"><p>线上业务</p></content></td>
    <td><content textType="body" fontSize="10" textAlign="right"><p>195</p></content></td>
    <td><content textType="body" fontSize="10" textAlign="left"><p>同比增长 8%，主要来自新客</p></content></td>
  </tr>
</table>
```

### chart

图表语法十分复杂，必须阅读 [slides_chart_demo.xml](../assets/lark-slides/references/xml/slides_chart_demo.xml)，直接照抄其中的柱状、条形、折线、面积、饼（环）、雷达、组合图。

`<chart>` 直接子元素必须有 `<chartPlotArea>`（绘图区）和 `<chartData>`（数据）；`<chartTitle>`、`<chartSubTitle>`、`<chartStyle>`、`<chartLegend>`、`<chartTooltip>` 可选，如果想不展示标题、副标题、图例或悬浮提示，省略相应元素标签即可。

`<chartStyle>` 常用子元素：

- `<chartBackground>`：`color` 省略时由渲染端决定默认背景；需要完全透明请显式写 `color="rgba(0, 0, 0, 0)"`
- `<chartBorder>`：无边框可写 `width="0"`，或直接不写 `<chartBorder>` 元素

#### 图表渐变 `<fillGradient>` / `<strokeGradient>`

图表支持渐变填充/描边，`<fillGradient>` 用于面积、柱子、数据点、扇区填充，`<strokeGradient>` 用于线条、数据点边框、柱子边框。渐变只能挂在系列级或单元素级，不要挂在 `<chartPlot>` 全局层。

可挂载位置：

- 系列级：`<chartBars>` / `<chartPoints>` 支持 `<fillGradient>` 与 `<strokeGradient>`；`<chartLine>` 只支持 `<strokeGradient>`；`<chartArea>` / `<chartSectors>` 只支持 `<fillGradient>`
- 单元素级：`<chartBar index="...">` / `<chartPoint index="...">` / `<chartSector index="...">` 只支持 `<fillGradient>`
- 全局级：`<chartPlot>` 下的 `<chartLines>` / `<chartAreas>` / `<chartBars>` / `<chartPoints>` 不支持渐变

结构要点：`type` 必填，可为 `linear` 或 `radial`；`linear` 用 `x0` / `y0` / `x1` / `y1`，`radial` 用 `r0` / `r1`；`<stops>` 至少包含 2 个 `<stop>`，`offset` 与 `opacity` 取值均为 `[0, 1]`。

```xml
<chartSeries index="1">
  <chartBars>
    <fillGradient type="linear" x0="0" y0="0" x1="0" y1="1">
      <stops>
        <stop offset="0" color="rgb(28, 71, 120)"/>
        <stop offset="1" color="rgb(28, 71, 120)" opacity="0.3"/>
      </stops>
    </fillGradient>
  </chartBars>
</chartSeries>
```

隐藏 `<chart>` 的图例只能通过不写或删除 `<chartLegend>` 实现，`<chartLegend>` 不支持 `position="none"`。

详细用法见 [slides_xml_schema_definition.xml](../assets/lark-slides/references/xml/slides_xml_schema_definition.xml)。

### embed

嵌入内容容器：外层 `<embed>` 承载 Slides 的摆放和效果属性（`topLeftX`/`topLeftY`/`width`/`height` 必填，`rotation`/`flipX`/`flipY`/`alpha` 可选），内层承载外部标准内容。当前内层内容为标准 SVG，`<svg>` 必须使用 `http://www.w3.org/2000/svg` 命名空间，且仅描述嵌入内容本身，不承载 Slides 布局属性。

```xml
<embed topLeftX="80" topLeftY="120" width="200" height="120">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
    <circle cx="100" cy="60" r="40" fill="rgba(37, 99, 235, 1)"/>
  </svg>
</embed>
```

`<embed>` 直接子元素为一个 `<svg>`（必需），以及可选的 `<reflection>`（倒影）与 `<shadow>`（阴影）。

## 颜色与样式

### fill

```xml
<fill>
  <fillColor color="rgb(255, 0, 0)"/>
</fill>
```

### border

```xml
<border color="rgb(43, 47, 54)" width="2" dashArray="solid"/>
```

### 颜色格式

```xml
<fillColor color="rgb(255, 0, 0)"/>
<fillColor color="rgba(255, 0, 0, 0.5)"/>
<fillColor color="linear-gradient(90deg, rgb(255,0,0) 0%, rgb(0,0,255) 100%)"/>
<fillColor color="radial-gradient(circle at 50% 50%, rgb(255,0,0) 0%, rgb(0,0,255) 100%)"/>
```

> **注意**：渐变色必须使用 `rgba()` 格式并带百分比停靠点，例如 `linear-gradient(135deg,rgba(30,60,114,1) 0%,rgba(59,130,246,1) 100%)`。使用 `rgb()` 或省略停靠点会导致服务端将其回退为白色。此规则对页面背景和 shape fill 均适用。

### 页面背景

```xml
<!-- 纯色背景 -->
<slide>
  <style>
    <fill>
      <fillColor color="rgb(245, 245, 245)"/>
    </fill>
  </style>
</slide>

<!-- 渐变背景（必须用 rgba + 百分比停靠点） -->
<slide>
  <style>
    <fill>
      <fillColor color="linear-gradient(135deg,rgba(30,60,114,1) 0%,rgba(59,130,246,1) 100%)"/>
    </fill>
  </style>
</slide>
```

## 备注示例

```xml
<note>
  <content autoFit="normal-auto-fit" textType="body">
    <p>这是演讲者备注。</p>
  </content>
</note>
```

## 完整示例

```xml
<presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
  <title>季度报告</title>
  <theme>
    <textStyles>
      <title fontFamily="思源黑体" fontSize="54" fontColor="rgba(0, 0, 0, 1)"/>
      <body fontFamily="思源黑体" fontSize="18" fontColor="rgba(43, 47, 54, 1)"/>
    </textStyles>
  </theme>
  <slide>
    <style>
      <fill>
        <fillColor color="rgb(245, 245, 245)"/>
      </fill>
    </style>
    <data>
      <shape type="text" topLeftX="80" topLeftY="72" width="760" height="100">
        <content textType="title">
          <p>2024 年第一季度报告</p>
        </content>
      </shape>
      <shape type="text" topLeftX="80" topLeftY="200" width="520" height="180">
        <content textType="body">
          <p>核心指标</p>
          <ul>
            <li><p>用户增长：+25%</p></li>
            <li><p>收入增长：+30%</p></li>
            <li><p>市场份额：15%</p></li>
          </ul>
        </content>
      </shape>
      <shape type="rect" topLeftX="660" topLeftY="180" width="180" height="140">
        <fill>
          <fillColor color="rgba(100, 149, 237, 0.25)"/>
        </fill>
        <border color="rgb(100, 149, 237)" width="2"/>
      </shape>
    </data>
    <note>
      <content textType="body">
        <p>讲到增长率时补充样本范围。</p>
      </content>
    </note>
  </slide>
</presentation>
```

## 最佳实践

1. 始终带上命名空间 `xmlns="https://www.larkoffice.com/sml/2.0"`
2. 用 `shape type="text"` + `content` 表达页面文本
3. 用 `topLeftX` / `topLeftY`、`startX` / `startY` 等 schema 中定义的属性名
4. 优先使用 `rgb` / `rgba` 颜色格式；渐变必须使用 `rgba()` 且带百分比停靠点
5. 特殊字符按 XML 规则转义
6. 标准 16:9 页面建议使用 `width="960"` 和 `height="540"`

## 详细参考

- [slides_xml_schema_definition.xml](../assets/lark-slides/references/xml/slides_xml_schema_definition.xml)
- [slides_chart_demo.xml](../assets/lark-slides/references/xml/slides_chart_demo.xml)

## Schema 版本信息

- **版本**: 2.0.0
- **命名空间**: https://www.larkoffice.com/sml/2.0
- **发布日期**: 2025-11-03


<a id="s-5b72c86816ac416c"></a>

## references/xml-schema-quick-ref.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# XML Schema 快速参考（兼容入口）

本文档已迁移至 [`xml/xml-schema-quick-ref.md`](lark-slides-0.md#s-5c0e180adc0fc634)。

此文件仅保留旧路径兼容性；后续引用请使用新路径。


<a id="s-1edc04e75dcdb6b2"></a>

## scripts/iconpark_tool_test.py.txt

# Copyright (c) 2026 Lark Technologies Pte. Ltd.
# SPDX-License-Identifier: MIT
from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

import iconpark_tool


SCRIPT_PATH = Path(__file__).resolve().with_name("iconpark_tool.py")


class IconParkToolTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index_data = iconpark_tool.load_index()

    def test_search_icons_finds_growth_trend(self) -> None:
        results = iconpark_tool.search_icons(self.index_data, {"query": "增长趋势", "limit": 5})
        self.assertTrue(results)
        self.assertTrue(
            any(entry["iconType"] == "iconpark/Charts/positive-dynamics.svg" for entry in results)
        )

    def test_search_icons_supports_english_query(self) -> None:
        results = iconpark_tool.search_icons(self.index_data, {"query": "security protect", "limit": 3})
        self.assertTrue(results)
        self.assertEqual(results[0]["iconType"], "iconpark/Safe/protect.svg")

    def test_search_icons_supports_category_filter(self) -> None:
        results = iconpark_tool.search_icons(
            self.index_data,
            {"query": "data", "category": "Charts", "limit": 10},
        )
        self.assertTrue(results)
        self.assertTrue(all(entry["category"] == "Charts" for entry in results))

    def test_search_icons_does_not_expand_ai_inside_words(self) -> None:
        mail_results = iconpark_tool.search_icons(self.index_data, {"query": "mail", "limit": 5})
        self.assertEqual(mail_results[0]["iconType"], "iconpark/Office/envelope-one.svg")
        self.assertNotEqual(mail_results[0]["iconType"], "iconpark/Others/magic.svg")

        fail_results = iconpark_tool.search_icons(self.index_data, {"query": "fail", "limit": 5})
        self.assertNotEqual(fail_results[0]["iconType"], "iconpark/Others/magic.svg")

    def test_search_icons_supports_template_icon_queries(self) -> None:
        cases = [
            ("arrow", "iconpark/Arrows/arrow-right.svg"),
            ("right", "iconpark/Arrows/right.svg"),
            ("PPT", "iconpark/Music/ppt.svg"),
            ("table", "iconpark/Office/table.svg"),
            ("会议", "iconpark/Office/schedule.svg"),
            ("飞书", "iconpark/Brand/bydesign.svg"),
        ]
        for query, icon_type in cases:
            with self.subTest(query=query):
                results = iconpark_tool.search_icons(self.index_data, {"query": query, "limit": 10})
                self.assertTrue(
                    any(entry["iconType"] == icon_type for entry in results),
                    f"{icon_type} not found in {results}",
                )

    def test_search_icons_defaults_to_wider_candidate_set(self) -> None:
        results = iconpark_tool.search_icons(self.index_data, {"query": "data"})
        self.assertEqual(len(results), 8)

    def test_search_icons_boosts_common_slide_terms(self) -> None:
        results = iconpark_tool.search_icons(self.index_data, {"query": "会议", "limit": 3})
        self.assertTrue(
            any(entry["iconType"] == "iconpark/Office/schedule.svg" for entry in results),
            f"iconpark/Office/schedule.svg not found in {results}",
        )

    def test_search_icons_keeps_high_value_top_results(self) -> None:
        cases = [
            ("安全", "iconpark/Safe/protect.svg"),
            ("邮件", "iconpark/Office/mail-open.svg"),
            ("会议", "iconpark/Office/schedule.svg"),
            ("增长趋势", "iconpark/Charts/chart-line.svg"),
            ("飞书", "iconpark/Brand/bydesign.svg"),
        ]
        for query, icon_type in cases:
            with self.subTest(query=query):
                results = iconpark_tool.search_icons(self.index_data, {"query": query, "limit": 3})
                self.assertTrue(results)
                self.assertEqual(results[0]["iconType"], icon_type)

    def test_search_icons_requires_query(self) -> None:
        with self.assertRaises(iconpark_tool.IconParkToolError):
            iconpark_tool.search_icons(self.index_data, {"limit": 5})

    def test_search_icons_rejects_invalid_limit(self) -> None:
        with self.assertRaises(iconpark_tool.IconParkToolError):
            iconpark_tool.search_icons(self.index_data, {"query": "data", "limit": "abc"})

    def test_resolve_icon_accepts_name_and_icon_type(self) -> None:
        by_name = iconpark_tool.resolve_icon(self.index_data, "chart-line")
        by_type = iconpark_tool.resolve_icon(self.index_data, "iconpark/Charts/chart-line.svg")
        self.assertEqual(by_name["iconType"], "iconpark/Charts/chart-line.svg")
        self.assertEqual(by_name, by_type)

    def test_resolve_icon_accepts_template_icon_type(self) -> None:
        result = iconpark_tool.resolve_icon(self.index_data, "iconpark/Arrows/arrow-right.svg")
        self.assertEqual(result["iconType"], "iconpark/Arrows/arrow-right.svg")

    def test_resolve_icon_rejects_unknown_name(self) -> None:
        with self.assertRaises(iconpark_tool.IconParkToolError):
            iconpark_tool.resolve_icon(self.index_data, "not-a-real-icon")

    def test_list_categories_counts_index(self) -> None:
        categories = iconpark_tool.list_categories(self.index_data)
        self.assertTrue(any(entry["category"] == "Charts" and entry["count"] > 0 for entry in categories))


class IconParkToolCLITest(unittest.TestCase):
    def run_tool(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT_PATH), *args],
            capture_output=True,
            check=False,
            text=True,
        )

    def test_cli_search_writes_json_to_stdout(self) -> None:
        result = self.run_tool("search", "--query", "增长趋势", "--limit", "5")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")

        output = json.loads(result.stdout)
        self.assertTrue(output)
        self.assertTrue(
            any(entry["iconType"] == "iconpark/Charts/positive-dynamics.svg" for entry in output)
        )

    def test_cli_resolve_writes_json_to_stdout(self) -> None:
        result = self.run_tool("resolve", "--name", "chart-line")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")

        output = json.loads(result.stdout)
        self.assertEqual(output["iconType"], "iconpark/Charts/chart-line.svg")

    def test_cli_list_categories_writes_json_to_stdout(self) -> None:
        result = self.run_tool("list-categories")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")

        output = json.loads(result.stdout)
        self.assertTrue(any(entry["category"] == "Charts" and entry["count"] > 0 for entry in output))

    def test_cli_help_writes_usage_to_stderr(self) -> None:
        result = self.run_tool("--help")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "")
        self.assertIn("Usage:", result.stderr)
        self.assertIn("python3 iconpark_tool.py search", result.stderr)

    def test_cli_invalid_argument_writes_error_to_stderr(self) -> None:
        result = self.run_tool("search", "增长趋势")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, "")
        self.assertIn("iconpark-tool error: unexpected argument: 增长趋势", result.stderr)

    def test_cli_unknown_command_writes_usage_and_error_to_stderr(self) -> None:
        result = self.run_tool("unknown")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, "")
        self.assertIn("Usage:", result.stderr)
        self.assertIn("iconpark-tool error: unknown command: unknown", result.stderr)


if __name__ == "__main__":
    unittest.main()


<a id="s-2d4e92c2f05681a1"></a>

## scripts/xml_lint_test.py.txt

# Copyright (c) 2026 Lark Technologies Pte. Ltd.
# SPDX-License-Identifier: MIT
from __future__ import annotations

import itertools
import json
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest import mock

import sxsd_validator
import xml_lint


class XmlTextOverlapLintGeometryTest(unittest.TestCase):
    def assertNoXmlTextOverlapLintErrors(self, result: dict, sample_name: str) -> None:
        issue_summaries = []
        for slide in result.get("slides", []):
            for issue in slide.get("issues", []):
                issue_summaries.append(
                    f"slide {slide['slide_number']}: {issue['level']} {issue['code']} {issue['message']}"
                )
        if result.get("issues"):
            for issue in result["issues"]:
                issue_summaries.append(f"{issue['level']} {issue['code']} {issue['message']}")
        self.assertEqual(
            result["summary"]["error_count"],
            0,
            f"{sample_name} has XML text overlap lint errors:\n" + "\n".join(issue_summaries),
        )

    def test_cli_suggests_input_flag_for_positional_argument(self) -> None:
        script_path = Path(xml_lint.__file__).resolve()
        input_path = "/sandboxdata/workspace/file/full_presentation.xml"

        completed = subprocess.run(
            [sys.executable, str(script_path), input_path],
            capture_output=True,
            check=False,
            text=True,
        )

        self.assertEqual(completed.returncode, 1)
        self.assertEqual(completed.stdout, "")
        self.assertEqual(
            completed.stderr,
            f"xml-lint error: unexpected argument: {input_path}, need --input\n",
        )

    def test_cli_preserves_requested_symlink_path_in_result(self) -> None:
        script_path = Path(xml_lint.__file__).resolve()
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            resolved_path = temp_path / "resolved.xml"
            requested_path = temp_path / "requested.xml"
            resolved_path.write_text(
                '<presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">'
                '<slide xmlns="https://www.larkoffice.com/sml/2.0"><data>'
                '<shape type="text" topLeftX="10" topLeftY="10" width="100" height="30">'
                '<content><p><span>Test</span></p></content>'
                '</shape></data></slide>'
                '</presentation>',
                encoding="utf-8",
            )
            requested_path.symlink_to(resolved_path)

            completed = subprocess.run(
                [sys.executable, str(script_path), "--input", str(requested_path)],
                capture_output=True,
                check=False,
                text=True,
            )

        self.assertEqual(completed.returncode, 0, completed.stderr)
        result = json.loads(completed.stdout)
        self.assertEqual(result["file"], str(requested_path))

    def test_cli_reports_structured_slide_sxsd_error_outside_skill_directory(self) -> None:
        script_path = Path(xml_lint.__file__).resolve()
        with tempfile.TemporaryDirectory() as temp_dir:
            input_path = Path(temp_dir) / "invalid-slide.xml"
            input_path.write_text(
                """
                <slide xmlns="https://www.larkoffice.com/sml/2.0">
                  <data><shape type="text" topLeftX="10" topLeftY="20" width="300"/></data>
                </slide>
                """,
                encoding="utf-8",
            )

            completed = subprocess.run(
                [sys.executable, str(script_path), "--input", str(input_path)],
                cwd=temp_dir,
                capture_output=True,
                check=False,
                text=True,
            )

        result = json.loads(completed.stdout)
        issue = result["slides"][0]["errors"][0]
        self.assertEqual(completed.returncode, 1)
        self.assertEqual(completed.stderr, "")
        self.assertEqual(issue["code"], "sxsd_missing_required_attr")
        self.assertEqual(issue["path"], "slide/data/shape")
        self.assertEqual(issue["attr"], "height")
        self.assertEqual(issue["target"]["slide_number"], 1)
        self.assertTrue(issue["hint"])

    def test_xml_lint_accepts_inline_fixture_xml_samples(self) -> None:
        samples = {
            "image-led-cover": """
                <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
                  <slide xmlns="https://www.larkoffice.com/sml/2.0">
                    <style><fill><fillColor color="rgb(15,23,42)"/></fill></style>
                    <data>
                      <img src="tok" topLeftX="560" topLeftY="0" width="400" height="540"/>
                      <shape type="text" topLeftX="64" topLeftY="150" width="420" height="70">
                        <content textType="title"><p><span fontSize="42">Quarterly Review</span></p></content>
                      </shape>
                      <shape type="text" topLeftX="64" topLeftY="235" width="420" height="36">
                        <content textType="sub-headline"><p><span fontSize="20">Focus, progress, and next steps</span></p></content>
                      </shape>
                    </data>
                  </slide>
                </presentation>
            """,
            "content-grid": """
                <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
                  <slide xmlns="https://www.larkoffice.com/sml/2.0">
                    <data>
                      <shape type="text" topLeftX="60" topLeftY="44" width="620" height="46">
                        <content textType="title"><p><span fontSize="30">Execution Snapshot</span></p></content>
                      </shape>
                      <shape type="rect" topLeftX="60" topLeftY="126" width="250" height="150"/>
                      <shape type="text" topLeftX="84" topLeftY="152" width="200" height="36">
                        <content textType="headline"><p><span fontSize="22">Plan</span></p></content>
                      </shape>
                      <shape type="rect" topLeftX="355" topLeftY="126" width="250" height="150"/>
                      <shape type="text" topLeftX="379" topLeftY="152" width="200" height="36">
                        <content textType="headline"><p><span fontSize="22">Build</span></p></content>
                      </shape>
                      <shape type="rect" topLeftX="650" topLeftY="126" width="250" height="150"/>
                      <shape type="text" topLeftX="674" topLeftY="152" width="200" height="36">
                        <content textType="headline"><p><span fontSize="22">Launch</span></p></content>
                      </shape>
                    </data>
                  </slide>
                </presentation>
            """,
        }
        self.assertTrue(samples)
        for sample_name, sample_xml in samples.items():
            with self.subTest(sample=sample_name):
                result = xml_lint.lint_xml(
                    sample_xml,
                    sample_name,
                )
                self.assertNoXmlTextOverlapLintErrors(result, sample_name)

    def test_lint_xml_reports_unescaped_ampersand_in_text(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content textType="body"><p>Q&A</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = result["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "xml_not_well_formed")
        self.assertIsInstance(issue["line"], int)
        self.assertIsInstance(issue["column"], int)
        self.assertIn("Q&A", issue["context"])
        self.assertIn("&amp;", issue["hint"])

    def test_lint_xml_reports_unescaped_ampersand_in_attribute(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content textType="body"><p><a href="https://example.com/?a=1&b=2">link</a></p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = result["issues"][0]
        self.assertEqual(issue["code"], "xml_not_well_formed")
        self.assertIn("attribute", issue["hint"])
        self.assertIn("a=1&amp;b=2", issue["hint"])

    def test_lint_xml_reports_mismatched_xml_tag(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content textType="body"><p>Broken XML</content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = result["issues"][0]
        self.assertEqual(result["summary"]["slide_count"], 0)
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "xml_not_well_formed")
        self.assertIsInstance(issue["line"], int)
        self.assertIsInstance(issue["column"], int)
        self.assertIn("Broken XML", issue["context"])
        self.assertEqual(issue["related_objects"], [])
        self.assertNotIn("Locate via related_objects[].xml_path.", issue["hint"])

    def test_lint_xml_rejects_prefixed_sml_tags(self) -> None:
        result = xml_lint.lint_xml(
            """
            <ns0:slide xmlns:ns0="https://www.larkoffice.com/sml/2.0">
              <ns0:data>
                <sml:shape xmlns:sml="https://www.larkoffice.com/sml/2.0" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <sml:content textType="body"><sml:p>Prefixed SML</sml:p></sml:content>
                </sml:shape>
              </ns0:data>
            </ns0:slide>
            """
        )
        issues = result["issues"]
        self.assertEqual(result["summary"]["error_count"], 5)
        self.assertEqual([issue["code"] for issue in issues], ["sml_prefixed_tag"] * 5)
        self.assertEqual(issues[0]["tag"], "ns0:slide")
        self.assertIn("default namespace", issues[0]["hint"])
        self.assertEqual({issue["namespace"] for issue in issues}, {SML_NAMESPACE})

    def test_lint_xml_reports_bound_namespace_for_prefixed_sml_tags(self) -> None:
        for namespace in (
            "http://www.larkoffice.com/sml/2.0",
            "/sml/2.0",
            SML_NAMESPACE,
        ):
            with self.subTest(namespace=namespace):
                result = xml_lint.lint_xml(
                    f"""
                    <sml:slide xmlns:sml="{namespace}">
                      <sml:data>
                        <sml:shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                          <sml:content textType="body"><sml:p>Prefixed SML</sml:p></sml:content>
                        </sml:shape>
                      </sml:data>
                    </sml:slide>
                    """
                )
                issues = result["issues"]
                self.assertEqual([issue["code"] for issue in issues], ["sml_prefixed_tag"] * 5)
                self.assertEqual({issue["namespace"] for issue in issues}, {namespace})

    def test_lint_xml_accepts_server_readback_slide_without_namespace(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide id="server-slide-id">
              <data>
                <shape id="server-shape-id" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content textType="body"><p>Unprefixed SML</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_accepts_server_readback_presentation_short_namespace(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="/sml/2.0" width="960" height="540" id="server-presentation-id">
              <slide id="server-slide-id">
                <data>
                  <shape id="server-shape-id" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Server readback presentation</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_accepts_server_readback_presentation_https_namespace(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540" id="server-presentation-id">
              <slide id="server-slide-id">
                <data>
                  <shape id="server-shape-id" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Server readback presentation</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_accepts_legacy_http_namespace(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="http://www.larkoffice.com/sml/2.0" width="960" height="540" id="legacy-http-id">
              <slide id="server-slide-id">
                <data>
                  <shape id="server-shape-id" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Legacy HTTP namespace</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_rejects_server_readback_presentation_wrong_namespace(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://example.com/not-sml" width="960" height="540">
              <slide/>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["issues"][0]["code"], "sxsd_invalid_namespace")

    def test_lint_xml_rejects_xml_declaration(self) -> None:
        result = xml_lint.lint_xml(
            '<?xml version="1.0"?><slide xmlns="https://www.larkoffice.com/sml/2.0"><data/></slide>'
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["issues"][0]["code"], "sxsd_unsupported_declaration")

    def test_lint_xml_reports_missing_required_sxsd_attribute(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data><shape type="text" topLeftX="80" topLeftY="80" width="300"/></data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertNotIn("issues", result)
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["code"], "sxsd_missing_required_attr")
        self.assertEqual(issue["attr"], "height")

    def test_lint_xml_rejects_child_order_that_violates_xsd_sequence(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide/>
              <title>Late title</title>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["issues"][0]["code"], "sxsd_invalid_child_order")

    def test_lint_xml_accepts_escaped_entities_without_suspicious_entity_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content textType="body"><p>Q&amp;A</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertNotIn("issues", result)

    def test_lint_xml_accepts_chinese_full_width_punctuation(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="80" topLeftY="80" width="620" height="90">
                  <content textType="body"><p>承诺：按期交付；持续复盘｜风险透明</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_single_slide_reports_out_of_canvas_and_blank_slide_errors(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="1000" topLeftY="500" width="120" height="80">
                  <content textType="body"><p>Body text outside the canvas</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["slide_size"], {"width": 960, "height": 540})
        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(result["summary"]["error_count"], 2)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["errors"]],
            ["shape_out_of_canvas", "blank_slide"],
        )

    def test_lint_xml_preserves_presentation_canvas_and_slide_order(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="1280" height="720">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="first" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>First slide</p></content>
                  </shape>
                </data>
              </slide>
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <img id="second" src="tok" topLeftX="100" topLeftY="120" width="240" height="160"/>
                  <shape id="second-shape" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Second slide</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["slide_size"], {"width": 1280, "height": 720})
        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual([slide["slide_number"] for slide in result["slides"]], [1, 2])
        self.assertEqual([slide["element_count"] for slide in result["slides"]], [1, 2])
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_handles_self_closing_slide_before_normal_slide(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide/>
              <slide>
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Second slide</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["errors"]],
            ["blank_slide"],
        )
        self.assertEqual(result["slides"][1]["status"], "passed")

    def test_lint_xml_keeps_trailing_self_closing_slide(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>First slide</p></content>
                  </shape>
                </data>
              </slide>
              <slide/>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][1]["errors"]],
            ["blank_slide"],
        )

    def test_lint_xml_ignores_slide_markup_inside_xml_comments(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="body"><p>Real slide</p></content>
                  </shape>
                </data>
              </slide>
              <!-- Old draft: <slide id="ghost"/> -->
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(result["slides"][0]["status"], "passed")

    def test_lint_xml_ignores_invalid_slide_markup_inside_xml_comments(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide><data/></slide>
              <!-- Old draft: <slide bogus="x"/> -->
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 1)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["errors"]],
            ["blank_slide"],
        )

    def test_lint_xml_skips_only_invalid_slide_and_continues_geometry_checks(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <data>
                  <shape id="invalid" type="text" topLeftX="1000" topLeftY="80" width="300">
                    <content textType="body"><p>Missing height</p></content>
                  </shape>
                </data>
              </slide>
              <slide>
                <data>
                  <shape id="outside" type="text" topLeftX="1000" topLeftY="80" width="120" height="60">
                    <content textType="body"><p>Outside canvas</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual(result["slides"][0]["element_count"], 0)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["errors"]],
            ["sxsd_missing_required_attr"],
        )
        self.assertNotIn(
            "shape_out_of_canvas",
            [issue["code"] for issue in result["slides"][0]["issues"]],
        )
        self.assertIn(
            "shape_out_of_canvas",
            [issue["code"] for issue in result["slides"][1]["errors"]],
        )

    def test_lint_xml_scopes_invalid_slide_root_attribute_to_that_slide(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide bogusAttr="oops">
                <data><shape type="rect" topLeftX="80" topLeftY="80" width="100" height="100"/></data>
              </slide>
              <slide>
                <data><shape type="rect" topLeftX="1000" topLeftY="80" width="100" height="100"/></data>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["errors"]],
            ["sxsd_unsupported_attr"],
        )
        self.assertIn(
            "shape_out_of_canvas",
            [issue["code"] for issue in result["slides"][1]["errors"]],
        )

    def test_lint_xml_allows_svg_subtree_inside_embed(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <embed topLeftX="80" topLeftY="120" width="240" height="140">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140">
                    <rect x="10" y="10" width="220" height="120" rx="12" fill="#EFF6FF"/>
                    <circle cx="70" cy="70" r="34" fill="#2563EB"/>
                    <text x="130" y="76" font-size="18" fill="#1E3A8A">SVG OK</text>
                    <foreignObject x="0" y="0" width="1" height="1">
                      <embed xmlns="http://www.w3.org/1999/xhtml">
                        <rect xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>
                      </embed>
                    </foreignObject>
                  </svg>
                </embed>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("sxsd_unsupported_tag", codes)
        self.assertNotIn("sxsd_unsupported_attr", codes)
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_enforces_embed_svg_contract(self) -> None:
        cases = [
            ("missing SVG", "", "sxsd_missing_required_child"),
            ("wrong namespace", '<svg viewBox="0 0 20 20"/>', "sxsd_unsupported_tag"),
            (
                "multiple SVG roots",
                '<svg xmlns="http://www.w3.org/2000/svg"/><svg xmlns="http://www.w3.org/2000/svg"/>',
                "sxsd_too_many_children",
            ),
            (
                "non-SVG root element",
                '<rect xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>',
                "sxsd_unexpected_child",
            ),
            (
                "SVG after reflection",
                '<reflection/><svg xmlns="http://www.w3.org/2000/svg"/>',
                "sxsd_invalid_child_order",
            ),
        ]
        for name, children, expected_code in cases:
            with self.subTest(name=name):
                result = xml_lint.lint_xml(
                    f"""
                    <slide xmlns="http://www.larkoffice.com/sml/2.0">
                      <data>
                        <embed topLeftX="80" topLeftY="120" width="240" height="140">
                          {children}
                        </embed>
                      </data>
                    </slide>
                    """
                )
                codes = [issue["code"] for issue in result["slides"][0]["issues"]]
                self.assertIn(expected_code, codes)

    def test_lint_xml_enforces_embed_svg_root_for_readback_namespaces(self) -> None:
        document_templates = [
            ("bare slide", "<slide>{content}</slide>"),
            (
                "short namespace",
                '<presentation xmlns="/sml/2.0" width="960" height="540">'
                "<slide>{content}</slide>"
                "</presentation>",
            ),
            (
                "HTTPS namespace",
                '<presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">'
                "<slide>{content}</slide>"
                "</presentation>",
            ),
        ]
        embed_template = """
            <data>
              <embed topLeftX="80" topLeftY="120" width="240" height="140">
                {svg_root}
              </embed>
            </data>
        """
        roots = [
            ("valid SVG root", '<svg xmlns="http://www.w3.org/2000/svg"/>', False),
            (
                "non-SVG root element",
                '<rect xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>',
                True,
            ),
        ]

        for document_name, document_template in document_templates:
            for root_name, svg_root, should_error in roots:
                with self.subTest(document=document_name, root=root_name):
                    content = embed_template.format(svg_root=svg_root)
                    result = xml_lint.lint_xml(
                        document_template.format(content=content)
                    )
                    codes = [
                        issue["code"]
                        for slide in result["slides"]
                        for issue in slide["issues"]
                    ]
                    if should_error:
                        self.assertIn("sxsd_unexpected_child", codes)
                    else:
                        self.assertNotIn("sxsd_unexpected_child", codes)
                        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_reports_sxsd_unsupported_tag_with_alias_hint(self) -> None:
        cases = [
            ("textbox", '<textbox topLeftX="80" topLeftY="80" width="300" height="60">Text</textbox>', '<shape type="text">'),
            ("image", '<image src="tok" topLeftX="80" topLeftY="80" width="300" height="180"/>', "<img>"),
        ]
        for tag_name, element_xml, expected_hint in cases:
            with self.subTest(tag=tag_name):
                result = xml_lint.lint_xml(
                    f"""
                    <slide xmlns="https://www.larkoffice.com/sml/2.0">
                      <data>{element_xml}</data>
                    </slide>
                    """
                )
                slide_issues = result["slides"][0]["issues"]
                issue = next(
                    issue for issue in slide_issues if issue["code"] == "sxsd_unsupported_tag"
                )
                self.assertEqual(result["summary"]["error_count"], 1)
                self.assertEqual(
                    [reported["code"] for reported in slide_issues],
                    ["sxsd_unsupported_tag"],
                )
                self.assertEqual(issue["code"], "sxsd_unsupported_tag")
                self.assertEqual(issue["tag"], tag_name)
                self.assertIn(expected_hint, issue["hint"])

    def test_lint_xml_reports_sxsd_unsupported_attr_with_alias_hint(self) -> None:
        cases = [
            ("shape", "x", "topLeftX", '<shape type="text" x="80" topLeftY="80" width="300" height="60"><content><p>Text</p></content></shape>'),
            ("shape", "heigth", "height", '<shape type="text" topLeftX="80" topLeftY="80" width="300" heigth="60"><content><p>Text</p></content></shape>'),
            ("content", "fontColor", "color", '<shape type="text" topLeftX="80" topLeftY="80" width="300" height="60"><content fontColor="rgba(0, 0, 0, 1)"><p>Text</p></content></shape>'),
        ]
        for tag_name, attr_name, expected_attr, element_xml in cases:
            with self.subTest(attr=attr_name):
                result = xml_lint.lint_xml(
                    f"""
                    <slide xmlns="https://www.larkoffice.com/sml/2.0">
                      <data>{element_xml}</data>
                    </slide>
                    """
                )
                slide_issues = result["slides"][0]["issues"]
                issue = next(
                    issue for issue in slide_issues if issue["code"] == "sxsd_unsupported_attr"
                )
                self.assertEqual(result["summary"]["error_count"], 1)
                self.assertEqual(
                    [reported["code"] for reported in slide_issues],
                    ["sxsd_unsupported_attr"],
                )
                self.assertEqual(issue["code"], "sxsd_unsupported_attr")
                self.assertEqual(issue["tag"], tag_name)
                self.assertEqual(issue["attr"], attr_name)
                self.assertIn(expected_attr, issue["hint"])

    def test_lint_xml_keeps_unrelated_unsupported_and_missing_attrs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" bogus="x" topLeftX="80" topLeftY="80" width="300"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["issues"]],
            ["sxsd_unsupported_attr", "sxsd_missing_required_attr"],
        )

    def test_lint_xml_keeps_missing_attrs_when_suggestion_is_ambiguous(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeft="80" width="300" height="60"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["issues"]],
            [
                "sxsd_unsupported_attr",
                "sxsd_missing_required_attr",
                "sxsd_missing_required_attr",
            ],
        )

    def test_lint_xml_suppresses_only_missing_attr_that_resolves_ambiguous_suggestion(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftXX="80" topLeftY="80" width="300" height="60"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(
            [
                (issue["code"], issue.get("attr"))
                for issue in result["slides"][0]["issues"]
            ],
            [("sxsd_unsupported_attr", "topLeftXX")],
        )

    def test_lint_xml_ignores_server_filled_id_attrs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide id="server-slide-id" xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="server-shape-id" type="rect" topLeftX="80" topLeftY="80" width="300" height="160">
                  <fill id="server-fill-id" unexpected="value">
                    <fillColor color="rgba(255, 255, 255, 1)"/>
                  </fill>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(
            [(issue["tag"], issue["attr"]) for issue in result["slides"][0]["issues"]],
            [("fill", "unexpected")],
        )

    def test_lint_xml_ignores_chart_roundtrip_attrs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <chart updated="true" topLeftX="80" topLeftY="80" width="300" height="160">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData isStaticData="true">
                    <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_chart_parsed_values_roundtrip_tags(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <chart topLeftX="80" topLeftY="80" width="300" height="160">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData isStaticData="true">
                    <dim1>
                      <chartField name="category" valueType="string">
                        A<chartParsedValues>A</chartParsedValues>
                      </chartField>
                    </dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_chart_parsed_values_roundtrip_tag(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <chart topLeftX="80" topLeftY="80" width="300" height="160">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData>
                    <dim1>
                      <chartField name="category" valueType="string">
                        Africa<chartParsedValues>Africa</chartParsedValues>
                      </chartField>
                    </dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertNotIn("issues", result)

    def test_lint_xml_rejects_chart_parsed_values_outside_chart_field(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="rect" topLeftX="80" topLeftY="80" width="300" height="160">
                  <chartParsedValues>unexpected</chartParsedValues>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["issues"]],
            ["sxsd_unsupported_tag"],
        )
        self.assertEqual(
            result["slides"][0]["issues"][0]["path"],
            "slide/data/shape/chartParsedValues",
        )

    def test_lint_xml_limits_chart_roundtrip_attrs_to_matching_tags(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <chart isStaticData="true" topLeftX="80" topLeftY="80" width="300" height="160">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData updated="true">
                    <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 2)
        slide_issues = result["slides"][0]["issues"]
        self.assertEqual(
            {(issue["tag"], issue["attr"]) for issue in slide_issues},
            {("chart", "isStaticData"), ("chartData", "updated")},
        )
        self.assertTrue(all(issue["code"] == "sxsd_unsupported_attr" for issue in slide_issues))

    def test_lint_xml_reports_gradient_shorthand_attrs_on_fill_color(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="rect" topLeftX="80" topLeftY="80" width="300" height="160">
                  <fill>
                    <fillColor
                      type="gradient"
                      color1="rgba(255, 0, 0, 1)"
                      color2="rgba(0, 0, 255, 1)"
                      angle="45"
                      stop1="0%"
                      stop2="100%"/>
                  </fill>
                </shape>
              </data>
            </slide>
            """
        )
        slide_issues = result["slides"][0]["issues"]
        unsupported_attrs = {issue["attr"] for issue in slide_issues}
        self.assertEqual(result["summary"]["error_count"], 6)
        self.assertEqual(
            unsupported_attrs,
            {"type", "color1", "color2", "angle", "stop1", "stop2"},
        )
        self.assertTrue(all(issue["code"] == "sxsd_unsupported_attr" for issue in slide_issues))
        self.assertTrue(all(issue["tag"] == "fillColor" for issue in slide_issues))

    def test_lint_xml_accepts_chart_field_simple_content_attrs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <chart topLeftX="80" topLeftY="80" width="520" height="320">
                  <chartPlotArea>
                    <chartPlot type="line"/>
                  </chartPlotArea>
                  <chartData>
                    <dim1>
                      <chartField name="month" valueType="string">Jan, Feb</chartField>
                    </dim1>
                    <dim2>
                      <chartField name="value" valueType="number">1, 2</chartField>
                    </dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertNotIn("issues", result)

    def test_lint_xml_does_not_load_iconpark_index_without_icons(self) -> None:
        original_loader = xml_lint.load_iconpark_icon_types

        def fail_if_loaded() -> set[str]:
            raise AssertionError("iconpark index should not be loaded without <icon iconType>")

        xml_lint.load_iconpark_icon_types = fail_if_loaded
        try:
            result = xml_lint.lint_xml(
                """
                <slide xmlns="https://www.larkoffice.com/sml/2.0">
                  <data>
                    <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                      <content><p>No icons here</p></content>
                    </shape>
                  </data>
                </slide>
                """
            )
        finally:
            xml_lint.load_iconpark_icon_types = original_loader

        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertNotIn("issues", result)

    def test_lint_xml_accepts_iconpark_icon_type_from_index(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <icon iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="80" width="48" height="48">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertNotIn("issues", result)

    def test_lint_xml_reports_icon_missing_fill_color(self) -> None:
        cases = [
            '<icon iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="80" width="48" height="48"/>',
            '<icon iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="80" width="48" height="48"><fill/></icon>',
            (
                '<icon iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="80" width="48" height="48">'
                "<fill><fillColor/></fill></icon>"
            ),
        ]
        for icon_xml in cases:
            with self.subTest(icon=icon_xml):
                result = xml_lint.lint_xml(
                    f"""
                    <slide xmlns="https://www.larkoffice.com/sml/2.0">
                      <data>{icon_xml}</data>
                    </slide>
                    """
                )

                issue = result["issues"][0]
                self.assertEqual(result["summary"]["error_count"], 1)
                self.assertEqual(issue["code"], "icon_missing_fill_color")
                self.assertEqual(issue["tag"], "icon")

    def test_lint_xml_reports_icon_transparent_fill_color(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <icon iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="80" width="48" height="48">
                  <fill><fillColor color="rgba(37, 99, 235, 0)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )
        issue = result["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "icon_transparent_fill_color")
        self.assertEqual(issue["tag"], "icon")
        self.assertEqual(issue["attr"], "fillColor")

    def test_lint_xml_reports_iconpark_icon_type_outside_index(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <icon iconType="iconpark/Base/settng.svg" topLeftX="80" topLeftY="80" width="48" height="48">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )
        issue = result["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "iconpark_unsupported_icon_type")
        self.assertEqual(issue["tag"], "icon")
        self.assertEqual(issue["attr"], "iconType")
        self.assertEqual(issue["iconType"], "iconpark/Base/settng.svg")
        self.assertIn("iconpark-index.json", issue["hint"])
        self.assertIn("iconpark/Base/setting.svg", issue["hint"])

    def test_lint_xml_skips_iconpark_validation_inside_embedded_svg(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <embed topLeftX="80" topLeftY="120" width="240" height="140">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140">
                    <rect x="10" y="10" width="220" height="120" fill="#EFF6FF"/>
                    <icon iconType="not-an-iconpark-name"/>
                    <foreignObject x="0" y="0" width="60" height="60">
                      <icon xmlns="http://www.w3.org/1999/xhtml" iconType="not-an-iconpark-name"/>
                    </foreignObject>
                  </svg>
                </embed>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["document"]["errors"]]
        self.assertNotIn("iconpark_unsupported_icon_type", codes)
        self.assertNotIn("icon_missing_fill_color", codes)
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_detects_overlapping_text_boxes(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                    <content textType="title"><p>Title</p></content>
                  </shape>
                  <shape type="text" topLeftX="80" topLeftY="80" width="300" height="80">
                    <content textType="body"><p>Body</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["slides"][0]["issues"][0]["code"], "bbox_overlap")

    def test_lint_xml_detects_current_itinerary_cjk_caption_occlusion(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide id="pQO" xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape width="190" height="80" topLeftX="580" topLeftY="170" presetHandlers="0" type="rect" id="blI">
                  <fill><fillColor color="rgba(255, 255, 255, 0.9)"/></fill>
                  <border color="rgba(220, 205, 185, 1)" width="1"/>
                  <content fontSize="16" fontFamily="思源黑体" color="rgba(31, 35, 41, 1)"/>
                </shape>
                <shape width="160" height="25" topLeftX="595" topLeftY="180" type="text" id="blX">
                  <content fontSize="14" fontFamily="思源黑体" color="rgba(120, 80, 40, 1)" bold="true"><p>日照金山</p></content>
                </shape>
                <shape width="160" height="40" topLeftX="595" topLeftY="205" type="text" id="blY">
                  <content textType="caption" fontSize="11" fontFamily="思源黑体" color="rgba(130, 100, 70, 1)"><p>清晨躺在床上看玉龙雪山日照金山奇观</p></content>
                </shape>
                <shape width="180" height="80" topLeftX="730" topLeftY="170" presetHandlers="0" type="rect" id="blH">
                  <fill><fillColor color="rgba(255, 255, 255, 0.9)"/></fill>
                  <border color="rgba(220, 205, 185, 1)" width="1"/>
                  <content fontSize="16" fontFamily="思源黑体" color="rgba(31, 35, 41, 1)"/>
                </shape>
                <shape width="150" height="25" topLeftX="745" topLeftY="180" type="text" id="blp">
                  <content fontSize="14" fontFamily="思源黑体" color="rgba(120, 80, 40, 1)" bold="true"><p>午餐返程</p></content>
                </shape>
                <shape width="150" height="40" topLeftX="745" topLeftY="205" type="text" id="blV">
                  <content textType="caption" fontSize="11" fontFamily="思源黑体" color="rgba(130, 100, 70, 1)"><p>享用特色午餐，带着美好回忆返程</p></content>
                </shape>
                <shape width="190" height="80" topLeftX="580" topLeftY="310" presetHandlers="0" type="rect" id="blP">
                  <fill><fillColor color="rgba(255, 255, 255, 0.9)"/></fill>
                  <border color="rgba(220, 205, 185, 1)" width="1"/>
                  <content fontSize="16" fontFamily="思源黑体" color="rgba(31, 35, 41, 1)"/>
                </shape>
                <shape width="160" height="25" topLeftX="595" topLeftY="320" type="text" id="blG">
                  <content fontSize="14" fontFamily="思源黑体" color="rgba(120, 80, 40, 1)" bold="true"><p>高路徒步</p></content>
                </shape>
                <shape width="160" height="40" topLeftX="595" topLeftY="345" type="text" id="blQ">
                  <content textType="caption" fontSize="11" fontFamily="思源黑体" color="rgba(130, 100, 70, 1)"><p>经典高路徒步，28道拐，龙洞瀑布，中虎跳峡</p></content>
                </shape>
                <shape width="180" height="80" topLeftX="730" topLeftY="310" presetHandlers="0" type="rect" id="blw">
                  <fill><fillColor color="rgba(255, 255, 255, 0.9)"/></fill>
                  <border color="rgba(220, 205, 185, 1)" width="1"/>
                  <content fontSize="16" fontFamily="思源黑体" color="rgba(31, 35, 41, 1)"/>
                </shape>
                <shape width="150" height="25" topLeftX="745" topLeftY="320" type="text" id="blZ">
                  <content fontSize="14" fontFamily="思源黑体" color="rgba(120, 80, 40, 1)" bold="true"><p>伴手礼</p></content>
                </shape>
                <shape width="150" height="40" topLeftX="745" topLeftY="345" type="text" id="blS">
                  <content textType="caption" fontSize="11" fontFamily="思源黑体" color="rgba(130, 100, 70, 1)"><p>酒店精心准备的归途伴手礼，留下难忘纪念</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        overlap_pairs = {tuple(issue["elements"]) for issue in result["slides"][0]["issues"]}
        self.assertEqual(result["summary"]["error_count"], 2)
        self.assertIn(("blY", "blV"), overlap_pairs)
        self.assertIn(("blQ", "blS"), overlap_pairs)

    def test_lint_xml_detects_horizontal_text_overflow_across_declared_box_gap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="source" type="text" topLeftX="80" topLeftY="100" width="160" height="40">
                  <content fontSize="18" wrap="false"><p>这是一个足够长的中文文本用于检测跨越间隙的横向溢出</p></content>
                </shape>
                <shape id="target" type="text" topLeftX="260" topLeftY="100" width="160" height="40">
                  <content fontSize="18"><p>目标</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["summary"]["warning_count"], 0)
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["code"], "bbox_overlap")
        self.assertEqual(issue["elements"], ["source", "target"])
        self.assertGreater(issue["measurement"]["intersection_area"], 0)
        self.assertIsNotNone(issue.get("hint"))

    def test_lint_xml_allows_horizontal_text_with_default_wrap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="source" type="text" topLeftX="80" topLeftY="100" width="160" height="40">
                  <content fontSize="18"><p>这是一个足够长的中文文本用于检测默认自动换行</p></content>
                </shape>
                <shape id="target" type="text" topLeftX="260" topLeftY="100" width="160" height="40">
                  <content fontSize="18"><p>目标</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["slides"][0]["issues"][0]["code"], "text_may_overflow_shape")
        self.assertEqual(result["slides"][0]["issues"][0]["level"], "error")
        self.assertEqual(result["slides"][0]["issues"][0]["elements"], ["source"])

    def test_lint_xml_reports_text_out_of_canvas_and_warns_for_text_height(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="180" height="20">
                    <content textType="body" fontSize="18"><p>This paragraph is intentionally much longer than the box can safely contain.</p></content>
                  </shape>
                  <shape type="text" topLeftX="1000" topLeftY="500" width="120" height="80">
                    <content textType="body"><p>Body text outside the canvas</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 2)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(issue["code"], "shape_out_of_canvas")
        self.assertEqual(issue["overflow"], {"left": 0, "top": 0, "right": 160, "bottom": 40})

    def test_lint_xml_warns_when_text_may_overflow_its_own_shape(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="overflowing" type="text" topLeftX="80" topLeftY="80" width="360" height="80">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="no-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p><p>第四段</p>
                  </content>
                </shape>
                <shape id="fitting" type="text" topLeftX="480" topLeftY="80" width="360" height="120">
                  <content fontSize="20" lineSpacing="multiple:1.5">
                    <p>第一段</p><p>第二段</p><p>第三段</p><p>第四段</p>
                  </content>
                </shape>
                <shape id="auto-fit" type="text" topLeftX="80" topLeftY="240" width="360" height="80">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="normal-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p><p>第四段</p>
                  </content>
                </shape>
                <shape id="shape-auto-fit" type="text" topLeftX="480" topLeftY="240" width="360" height="30">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="shape-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        issues = result["slides"][0]["issues"]
        overflow_issues = [issue for issue in issues if issue["code"] == "text_may_overflow_shape"]
        self.assertEqual(result["summary"]["error_count"], 1)
        overflow_ids = {issue["elements"][0] for issue in overflow_issues}
        self.assertIn("overflowing", overflow_ids)
        self.assertNotIn("auto-fit", overflow_ids)
        self.assertNotIn("shape-auto-fit", overflow_ids)
        self.assertNotIn("fitting", overflow_ids)
        overflowing_issue = next(issue for issue in overflow_issues if issue["elements"] == ["overflowing"])
        self.assertEqual(overflowing_issue["line_count"], 4)
        self.assertEqual(overflowing_issue["estimated_height"], 110)
        self.assertEqual(overflowing_issue["available_height"], 80)
        self.assertEqual(overflowing_issue["overflow"], 30)
        self.assertIn('wrap="true" autoFit="normal-auto-fit"', overflowing_issue["message"])

    def test_lint_xml_uses_fixed_line_spacing_for_text_height_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="fixed-overflow" type="text" topLeftX="80" topLeftY="80" width="360" height="50">
                  <content fontSize="20" lineSpacing="fixed:20" autoFit="no-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(result["summary"]["warning_count"], 1)
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(issue["level"], "warning")
        self.assertEqual(issue["line_height"], 20)
        self.assertEqual(issue["estimated_height"], 60)
        self.assertEqual(issue["overflow"], 10)

    def test_lint_xml_ignores_subpixel_text_height_overflow_tolerance(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="minor-overflow" type="text" topLeftX="80" topLeftY="80" width="360" height="39.8">
                  <content fontSize="20" lineSpacing="fixed:20" autoFit="no-auto-fit">
                    <p>第一段</p><p>第二段</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_allows_single_line_width_estimation_jitter(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="metric" type="text" topLeftX="80" topLeftY="80" width="152" height="54">
                  <content fontSize="36" lineSpacing="multiple:1.2" autoFit="no-auto-fit"><p>4.16万亿</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_allows_short_metric_text_with_separators_as_single_line(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="metric" type="text" topLeftX="80" topLeftY="80" width="150" height="50">
                  <content textType="title" fontSize="36" autoFit="no-auto-fit"><p>4.16万亿</p></content>
                </shape>
                <shape id="table-number" type="text" topLeftX="80" topLeftY="160" width="25" height="20">
                  <content fontSize="10" textAlign="center" autoFit="no-auto-fit"><p>1,380</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_reports_plain_short_metric_when_it_wraps(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="plain-age" type="text" topLeftX="80" topLeftY="80" width="50" height="80">
                  <content textType="title" fontSize="36" bold="true" autoFit="no-auto-fit"><p>82岁</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(len(overflow_issues), 1)
        self.assertEqual(overflow_issues[0]["elements"], ["plain-age"])

    def test_lint_xml_allows_centered_short_label_near_fit_as_single_line(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="centered-label" type="text" topLeftX="80" topLeftY="80" width="200" height="30">
                  <content fontSize="14" bold="true" textAlign="center" autoFit="no-auto-fit">
                    <p>参数服务器 (Parameter Server)</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_allows_headline_near_fit_as_single_line(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="headline" type="text" topLeftX="80" topLeftY="80" width="700" height="50">
                  <content textType="headline" fontSize="26" bold="true" lineSpacing="multiple:1.3" autoFit="no-auto-fit">
                    <p>全球半导体市场规模持续高速增长，AI驱动新一轮景气周期</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_allows_dense_body_line_spacing_estimation_slack(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="dense-body" type="text" topLeftX="80" topLeftY="80" width="360" height="140">
                  <content fontSize="13" bold="true" lineSpacing="multiple:1.7" autoFit="no-auto-fit">
                    <p>总体目标：</p>
                    <p>建立深度神经网络高效训练的统一理论框架，实现训练效率与模型性能的协同优化。</p>
                    <p>具体目标：</p>
                    <p>提出自适应优化算法，收敛速度提升 2-3 倍</p>
                    <p>实现结构化压缩方法，模型体积减少 10 倍以上</p>
                    <p>构建分布式训练策略，64 GPU 加速比 &gt; 50x</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(overflow_issues, [])

    def test_lint_xml_reports_dense_body_when_adjusted_height_still_overflows(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="dense-body" type="text" topLeftX="80" topLeftY="80" width="360" height="100">
                  <content fontSize="13" bold="true" lineSpacing="multiple:1.7" autoFit="no-auto-fit">
                    <p>总体目标：</p>
                    <p>建立深度神经网络高效训练的统一理论框架，实现训练效率与模型性能的协同优化。</p>
                    <p>具体目标：</p>
                    <p>提出自适应优化算法，收敛速度提升 2-3 倍</p>
                    <p>实现结构化压缩方法，模型体积减少 10 倍以上</p>
                    <p>构建分布式训练策略，64 GPU 加速比 &gt; 50x</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(len(overflow_issues), 1)
        self.assertEqual(overflow_issues[0]["elements"], ["dense-body"])

    def test_lint_xml_reports_letter_spaced_caption_near_fit(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="caption" type="text" topLeftX="80" topLeftY="80" width="120" height="20">
                  <content textType="caption" fontSize="11" letterSpacing="1" autoFit="no-auto-fit">
                    <p>RISKS &amp; CHALLENGES</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(len(overflow_issues), 1)
        self.assertEqual(overflow_issues[0]["elements"], ["caption"])

    def test_lint_xml_reports_micro_caption_when_wrapping_overflows(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="micro-caption" type="text" topLeftX="80" topLeftY="60" width="200" height="16">
                  <content textType="caption" fontSize="3" lineSpacing="multiple:1.3" letterSpacing="160" autoFit="no-auto-fit">
                    <p>MARKET INSIGHT · 市场洞察</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        overflow_issues = [
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        ]
        self.assertEqual(len(overflow_issues), 1)
        self.assertEqual(overflow_issues[0]["elements"], ["micro-caption"])

    def test_lint_xml_text_may_overflow_shape_upgrades_to_error_above_threshold(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="just-warning" type="text" topLeftX="80" topLeftY="80" width="360" height="50">
                  <content fontSize="20" lineSpacing="fixed:20" autoFit="no-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p>
                  </content>
                </shape>
                <shape id="error-overflow" type="text" topLeftX="80" topLeftY="200" width="360" height="30">
                  <content fontSize="20" lineSpacing="fixed:20" autoFit="no-auto-fit">
                    <p>第一段</p><p>第二段</p><p>第三段</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        issues = {issue["elements"][0]: issue for issue in result["slides"][0]["issues"]}
        self.assertEqual(issues["just-warning"]["level"], "warning")
        self.assertEqual(issues["just-warning"]["overflow"], 10)
        self.assertEqual(issues["error-overflow"]["level"], "error")
        self.assertEqual(issues["error-overflow"]["overflow"], 30)
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["summary"]["warning_count"], 1)

    def test_lint_xml_text_may_overflow_shape_downgrades_background_decoration_to_info(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="bg-deco" type="text" topLeftX="0" topLeftY="0" width="600" height="80" alpha="0.3">
                  <content fontSize="120" lineSpacing="fixed:120" autoFit="no-auto-fit"><p>2026</p></content>
                </shape>
                <shape id="foreground" type="text" topLeftX="40" topLeftY="20" width="400" height="60">
                  <content fontSize="20" lineSpacing="fixed:24"><p>Annual Report</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issues = {
            issue["elements"][0]: issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape"
        }
        self.assertEqual(issues["bg-deco"]["level"], "info")
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["summary"]["info_count"], 1)
        self.assertEqual(result["slides"][0]["infos"], [issues["bg-deco"]])
        self.assertIn("background decoration", issues["bg-deco"]["message"])

    def test_lint_xml_reports_shape_alpha_ghost_text_out_of_canvas_but_allows_overlap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="ghost-number" type="text" topLeftX="-60" topLeftY="30" width="360" height="180" alpha="0.2">
                  <content fontSize="160" lineSpacing="fixed:160" wrap="false"><p>01</p></content>
                </shape>
                <shape id="title" type="text" topLeftX="80" topLeftY="80" width="360" height="80">
                  <content fontSize="30" lineSpacing="fixed:36"><p>Annual Review</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertIn("shape_out_of_canvas", codes)
        self.assertNotIn("bbox_overlap", codes)

    def test_lint_xml_reports_content_color_alpha_ghost_text_out_of_canvas_but_allows_overlap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="ghost-year" type="text" topLeftX="760" topLeftY="20" width="260" height="160">
                  <content fontSize="140" color="rgba(0,0,0,0.2)" lineSpacing="fixed:140" wrap="false"><p>2026</p></content>
                </shape>
                <shape id="headline" type="text" topLeftX="700" topLeftY="70" width="220" height="80">
                  <content fontSize="28" lineSpacing="fixed:34"><p>Forecast</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertIn("shape_out_of_canvas", codes)
        self.assertNotIn("bbox_overlap", codes)

    def test_lint_xml_reports_faint_medium_ghost_text_out_of_canvas_but_allows_overlap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="medium-ghost" type="text" topLeftX="820" topLeftY="300" width="270" height="72" alpha="0.32">
                  <content fontSize="40" lineSpacing="fixed:40" wrap="false"><p>OFF EDGE</p></content>
                </shape>
                <shape id="caption" type="text" topLeftX="760" topLeftY="315" width="180" height="36">
                  <content fontSize="16" lineSpacing="fixed:20"><p>Readable caption</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertIn("shape_out_of_canvas", codes)
        self.assertNotIn("bbox_overlap", codes)

    def test_lint_xml_allows_ghost_text_image_overlap(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="ghost-label" type="text" topLeftX="100" topLeftY="40" width="560" height="160" alpha="0.2">
                  <content fontSize="120" lineSpacing="fixed:120" wrap="false"><p>2026</p></content>
                </shape>
                <img id="photo" src="token" topLeftX="160" topLeftY="70" width="260" height="160"/>
                <shape id="title" type="text" topLeftX="610" topLeftY="95" width="320" height="60">
                  <content fontSize="28" lineSpacing="fixed:34"><p>Annual Review</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("image_covers_text", codes)
        self.assertNotIn("bbox_overlap", codes)

    def test_lint_slide_allows_ghost_text_whiteboard_overlap(self) -> None:
        result = xml_lint.lint_slide(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <whiteboard id="board" topLeftX="180" topLeftY="70" width="420" height="300"/>
                <shape id="ghost-label" type="text" topLeftX="100" topLeftY="40" width="560" height="160" alpha="0.2">
                  <content fontSize="120" lineSpacing="fixed:120" wrap="false"><p>2026</p></content>
                </shape>
                <shape id="title" type="text" topLeftX="610" topLeftY="95" width="220" height="60">
                  <content fontSize="28" lineSpacing="fixed:34"><p>Annual Review</p></content>
                </shape>
              </data>
            </slide>
            """,
            1,
        )
        codes = [issue["code"] for issue in result["issues"]]
        self.assertNotIn("whiteboard_external_overlap", codes)

    def test_lint_xml_reports_faint_ghost_text_out_of_canvas_without_area_threshold(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="small-ghost" type="text" topLeftX="940" topLeftY="300" width="40" height="40" alpha="0.32">
                  <content fontSize="36" lineSpacing="fixed:36" wrap="false"><p>土</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["slides"][0]["issues"][0]["code"], "shape_out_of_canvas")

    def test_lint_xml_keeps_out_of_canvas_error_for_medium_text_without_faint_alpha(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="medium-not-ghost" type="text" topLeftX="820" topLeftY="300" width="270" height="72" alpha="0.36">
                  <content fontSize="54" lineSpacing="fixed:54" wrap="false"><p>OFF EDGE</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["slides"][0]["issues"][0]["code"], "shape_out_of_canvas")
        self.assertEqual(result["slides"][0]["issues"][0]["elements"], ["medium-not-ghost"])

    def test_lint_xml_keeps_out_of_canvas_error_for_half_alpha_large_text(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="half-alpha" type="text" topLeftX="760" topLeftY="20" width="260" height="160">
                  <content fontSize="140" color="rgba(0,0,0,0.5)" lineSpacing="fixed:140" wrap="false"><p>2026</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["slides"][0]["issues"][0]["code"], "shape_out_of_canvas")
        self.assertEqual(result["slides"][0]["issues"][0]["elements"], ["half-alpha"])

    def test_lint_xml_text_may_overflow_shape_keeps_error_when_alpha_not_low(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="opaque-big" type="text" topLeftX="0" topLeftY="0" width="600" height="80" alpha="0.9">
                  <content fontSize="120" lineSpacing="fixed:120" autoFit="no-auto-fit"><p>2026</p></content>
                </shape>
                <shape id="foreground" type="text" topLeftX="40" topLeftY="20" width="400" height="60">
                  <content fontSize="20" lineSpacing="fixed:24"><p>Annual Report</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape" and issue["elements"] == ["opaque-big"]
        )
        self.assertEqual(issue["level"], "error")

    def test_lint_xml_text_may_overflow_shape_keeps_error_when_no_foreground_text(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="lonely-big" type="text" topLeftX="0" topLeftY="0" width="600" height="80" alpha="0.3">
                  <content fontSize="120" lineSpacing="fixed:120" autoFit="no-auto-fit"><p>2026</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape" and issue["elements"] == ["lonely-big"]
        )
        self.assertEqual(issue["level"], "error")

    def test_lint_xml_text_may_overflow_shape_keeps_error_when_foreground_alpha_zero(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="bg-deco" type="text" topLeftX="0" topLeftY="0" width="600" height="80" alpha="0.3">
                  <content fontSize="120" lineSpacing="fixed:120" autoFit="no-auto-fit"><p>2026</p></content>
                </shape>
                <shape id="transparent-foreground" type="text" topLeftX="40" topLeftY="20" width="400" height="60" alpha="0">
                  <content fontSize="20" lineSpacing="fixed:24"><p>Annual Report</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape" and issue["elements"] == ["bg-deco"]
        )
        self.assertEqual(issue["level"], "error")

    def test_lint_xml_text_may_overflow_shape_keeps_error_when_foreground_is_below_in_order(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="foreground" type="text" topLeftX="40" topLeftY="20" width="400" height="60">
                  <content fontSize="20" lineSpacing="fixed:24"><p>Annual Report</p></content>
                </shape>
                <shape id="top-big" type="text" topLeftX="0" topLeftY="0" width="600" height="80" alpha="0.3">
                  <content fontSize="120" lineSpacing="fixed:120" autoFit="no-auto-fit"><p>2026</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "text_may_overflow_shape" and issue["elements"] == ["top-big"]
        )
        self.assertEqual(issue["level"], "error")

    def test_lint_xml_uses_paragraph_spacing_overrides_for_text_height_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="paragraph-overflow" type="text" topLeftX="80" topLeftY="80" width="360" height="30">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="no-auto-fit">
                    <p lineSpacing="fixed:10" beforeLineSpacing="fixed:5" afterLineSpacing="fixed:5">第一行<br/>第二行</p>
                  </content>
                </shape>
                <shape id="paragraph-fitting" type="text" topLeftX="480" topLeftY="80" width="360" height="40">
                  <content fontSize="20" lineSpacing="multiple:1.5">
                    <p lineSpacing="fixed:10">第一行<br/>第二行<br/>第三行</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )
        issues = result["slides"][0]["issues"]
        self.assertEqual(result["summary"]["warning_count"], 1)
        self.assertEqual(issues[0]["elements"], ["paragraph-overflow"])
        self.assertEqual(issues[0]["line_count"], 2)
        self.assertEqual(issues[0]["line_height"], 10)
        self.assertEqual(issues[0]["estimated_height"], 40)
        self.assertEqual(issues[0]["overflow"], 10)

    def test_lint_xml_uses_letter_spacing_for_text_overflow_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="baseline" type="text" topLeftX="0" topLeftY="0" width="120" height="30">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="no-auto-fit"><p>一二三四五六</p></content>
                </shape>
                <shape id="content-spaced" type="text" topLeftX="200" topLeftY="0" width="120" height="30">
                  <content fontSize="20" lineSpacing="multiple:1.5" letterSpacing="2" autoFit="no-auto-fit"><p>一二三四五六</p></content>
                </shape>
                <shape id="paragraph-spaced" type="text" topLeftX="400" topLeftY="0" width="120" height="30">
                  <content fontSize="20" lineSpacing="multiple:1.5" autoFit="no-auto-fit"><p letterSpacing="2">一二三四五六</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        issues = result["slides"][0]["issues"]
        overflow_ids = [issue["elements"][0] for issue in issues if issue["code"] == "text_may_overflow_shape"]
        self.assertNotIn("baseline", overflow_ids)
        self.assertIn("content-spaced", overflow_ids)
        self.assertIn("paragraph-spaced", overflow_ids)
        by_id = {issue["elements"][0]: issue for issue in issues if issue["code"] == "text_may_overflow_shape"}
        self.assertEqual(by_id["content-spaced"]["line_count"], 2)
        self.assertEqual(by_id["content-spaced"]["estimated_height"], 50)
        self.assertEqual(by_id["content-spaced"]["overflow"], 20)
        self.assertEqual(by_id["paragraph-spaced"]["line_count"], 2)

    def test_strip_xml_paragraphs_preserves_br_as_hard_line_break(self) -> None:
        self.assertEqual(
            xml_lint.strip_xml_paragraphs("<p>第一行<br/>第二行<br />第三行</p>"),
            "第一行\n第二行\n第三行",
        )

    def test_lint_xml_allows_template_style_images_outside_canvas(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <img src="tok" topLeftX="-120" topLeftY="20" width="360" height="360"/>
                  <shape type="text" topLeftX="40" topLeftY="80" width="180" height="80">
                    <content textType="title" fontSize="44"><p>Title</p></content>
                  </shape>
                  <shape type="text" topLeftX="40" topLeftY="120" width="180" height="40">
                    <content textType="sub-headline" fontSize="20"><p>Subtitle</p></content>
                  </shape>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_extract_elements_preserves_supported_element_geometry_order_and_text_metadata(self) -> None:
        elements = xml_lint.extract_elements(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <img id="photo" src="tok" topLeftX="10" topLeftY="20" width="100" height="80"/>
                <shape id="headline" type="text" topLeftX="40" topLeftY="60" width="320" height="90">
                  <content textType="headline" textAlign="center" autoFit="normal-auto-fit" fontSize="28">
                    <p><![CDATA[Growth & scale]]></p>
                    <p>Focused execution</p>
                  </content>
                </shape>
                <table id="table" topLeftX="400" topLeftY="60" width="220" height="120"></table>
                <chart id="chart" topLeftX="640" topLeftY="60" width="220" height="120"/>
                <whiteboard id="wb" topLeftX="80" topLeftY="220" width="760" height="240"/>
                <embed id="emb" topLeftX="600" topLeftY="320" width="240" height="140">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140"><rect x="0" y="0" width="240" height="140"/></svg>
                </embed>
                <shape id="missing-height" type="text" topLeftX="80" topLeftY="480" width="320">
                  <content><p>Skipped</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        self.assertEqual([element["id"] for element in elements], ["photo", "headline", "table", "chart", "wb", "emb"])
        self.assertEqual([element["kind"] for element in elements], ["img", "shape", "table", "chart", "whiteboard", "embed"])
        self.assertEqual([element["order"] for element in elements], [0, 1, 2, 3, 4, 5])
        self.assertEqual(elements[1]["type"], "text")
        self.assertEqual(elements[1]["textType"], "headline")
        self.assertEqual(elements[1]["textAlign"], "center")
        self.assertEqual(elements[1]["autoFit"], "normal-auto-fit")
        self.assertEqual(elements[1]["fontSize"], 28)
        self.assertEqual(elements[1]["text"], "Growth & scale\nFocused execution")

    def test_lint_xml_ignores_small_out_of_bounds_images(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <img src="tok" topLeftX="-20" topLeftY="20" width="120" height="120"/>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_out_of_canvas_images(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <img src="right" topLeftX="780" topLeftY="0" width="500" height="540"/>
                  <img src="bottom" topLeftX="0" topLeftY="430" width="900" height="280"/>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_full_bleed_images_outside_canvas(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <img src="tok" topLeftX="-80" topLeftY="-20" width="1080" height="600"/>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_reports_text_and_chart_but_not_image_out_of_canvas(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="outside-shape" type="text" topLeftX="-10" topLeftY="40" width="50" height="50"/>
                  <img id="outside-img" src="token" topLeftX="120" topLeftY="-20" width="50" height="50"/>
                  <chart id="outside-chart" topLeftX="900" topLeftY="100" width="100" height="100">
                    <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                    <chartData>
                      <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                      <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                    </chartData>
                  </chart>
                </data>
              </slide>
            </presentation>
            """
        )
        issues = result["slides"][0]["issues"]
        self.assertEqual(result["summary"]["error_count"], 2)
        self.assertEqual(
            [(issue["code"], issue["elements"], issue["overflow"]) for issue in issues],
            [
                ("shape_out_of_canvas", ["outside-shape"], {"left": 10, "top": 0, "right": 0, "bottom": 0}),
                ("chart_out_of_canvas", ["outside-chart"], {"left": 0, "top": 0, "right": 40, "bottom": 0}),
            ],
        )

    def test_lint_xml_ignores_line_out_of_canvas(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="body" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content fontSize="18"><p>Visible content</p></content>
                </shape>
                <line id="connector" startX="80" startY="120" endX="980" endY="120"><border/></line>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_reports_horizontal_line_crossing_headline_glyphs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="title" type="text" topLeftX="80" topLeftY="200" width="500" height="90">
                  <content fontSize="60"><p>测试文字 ABC</p></content>
                </shape>
                <line id="strike" startX="80" startY="245" endX="560" endY="245">
                  <border color="rgb(255, 0, 0)" width="4"/>
                </line>
              </data>
            </slide>
            """
        )
        crossing = [
            issue for issue in result["slides"][0]["errors"] if set(issue["elements"]) == {"strike", "title"}
        ]
        self.assertEqual(len(crossing), 1)
        self.assertEqual(crossing[0]["code"], "bbox_overlap")

    def test_lint_xml_reports_vertical_line_crossing_multiline_text(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="col" type="text" topLeftX="700" topLeftY="180" width="240" height="180">
                  <content fontSize="20"><p>第一行文字内容</p><p>第二行文字内容</p><p>第三行文字内容</p></content>
                </shape>
                <line id="vbar" startX="740" startY="170" endX="740" endY="360">
                  <border color="rgb(0, 0, 255)" width="3"/>
                </line>
              </data>
            </slide>
            """
        )
        crossing = [
            issue for issue in result["slides"][0]["errors"] if set(issue["elements"]) == {"vbar", "col"}
        ]
        self.assertEqual(len(crossing), 1)

    def test_lint_xml_reports_diagonal_line_crossing_text_block(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="para" type="text" topLeftX="80" topLeftY="400" width="420" height="140">
                  <content fontSize="18"><p>这是一段测试文字用于验证线条穿过</p></content>
                </shape>
                <line id="diag" startX="80" startY="410" endX="500" endY="530">
                  <border color="rgb(255, 0, 0)" width="3"/>
                </line>
              </data>
            </slide>
            """
        )
        crossing = [
            issue for issue in result["slides"][0]["errors"] if set(issue["elements"]) == {"diag", "para"}
        ]
        self.assertEqual(len(crossing), 1)

    def test_lint_xml_ignores_diagonal_line_whose_bbox_but_not_segment_crosses_text(self) -> None:
        # The diagonal's axis-aligned bounding box overlaps the text, but the segment itself passes
        # through empty space in the opposite corner -- a naive bbox test would false-positive here.
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="corner-text" type="text" topLeftX="80" topLeftY="80" width="120" height="40">
                  <content fontSize="18"><p>corner</p></content>
                </shape>
                <line id="far-diag" startX="700" startY="80" endX="90" endY="500">
                  <border color="rgb(255, 0, 0)" width="3"/>
                </line>
              </data>
            </slide>
            """
        )
        crossing = [
            issue for issue in result["slides"][0]["errors"] if set(issue["elements"]) == {"far-diag", "corner-text"}
        ]
        self.assertEqual(crossing, [])

    def test_lint_xml_ignores_line_touching_text_frame_but_not_glyphs(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="lbl" type="text" topLeftX="80" topLeftY="80" width="300" height="200">
                  <content fontSize="18" verticalAlign="top"><p>短标签</p></content>
                </shape>
                <line id="below" startX="80" startY="270" endX="380" endY="270">
                  <border color="rgb(255, 0, 0)" width="2"/>
                </line>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_invisible_line_crossing_text(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="title" type="text" topLeftX="80" topLeftY="200" width="500" height="90">
                  <content fontSize="60"><p>测试文字 ABC</p></content>
                </shape>
                <line id="ghost-line" startX="80" startY="245" endX="560" endY="245">
                  <border color="rgba(255, 0, 0, 0.03)" width="4"/>
                </line>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_vertical_line_grazing_text_left_edge(self) -> None:
        # Verbatim from deck GpGusGCwplQyK8dFN9LczmBXnwQ slide 4: a vertical line sitting on the text
        # frame's left edge renders before the first glyph, so it must not be flagged.
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape width="240" height="60" topLeftX="120" topLeftY="100" type="text" id="bmm">
                  <content fontSize="20" fontFamily="Arial" color="rgba(31, 35, 41, 1)" lineSpacing="fixed:24">
                    <p>Vertical edge graze</p>
                  </content>
                </shape>
                <line id="bmX" startX="120.00000000000001" startY="90" endX="120.00000000000001" endY="150.00833275470998">
                  <border color="rgba(0, 0, 0, 1)"/>
                </line>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_polyline_crossing_text(self) -> None:
        # Verbatim from deck GpGusGCwplQyK8dFN9LczmBXnwQ slide 6: the crossing check is scoped to
        # <line> only, so a <polyline> over text is not flagged.
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape width="240" height="60" topLeftX="120" topLeftY="100" type="text" id="bmr">
                  <content fontSize="20" fontFamily="Arial" color="rgba(31, 35, 41, 1)" lineSpacing="fixed:24">
                    <p>Polyline target</p>
                  </content>
                </shape>
                <polyline id="bmH" width="270" height="55" topLeftX="110" topLeftY="95">
                  <border color="rgba(0, 0, 0, 1)"/>
                </polyline>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_ignores_line_below_visual_glyph_height(self) -> None:
        # Verbatim from deck GpGusGCwplQyK8dFN9LczmBXnwQ slide 7: the shape frame is 80px tall but the
        # single 20px line of glyphs occupies only its top; a line at the frame's lower region grazes
        # under the visual glyph box (underline look) and must not be flagged.
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape width="240" height="80" topLeftX="120" topLeftY="100" type="text" id="bmB">
                  <content fontSize="20" fontFamily="Arial" color="rgba(31, 35, 41, 1)" lineSpacing="fixed:24">
                    <p>Visual height target</p>
                  </content>
                </shape>
                <line id="bmQ" startX="110" startY="150" endX="380.00185184550116" endY="150">
                  <border color="rgba(0, 0, 0, 1)"/>
                </line>
              </data>
            </slide>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)

    def test_lint_xml_uses_rotated_text_and_chart_bounds_for_canvas_validation(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="rotated-text" type="text" topLeftX="0" topLeftY="0" width="100" height="100" rotation="45"/>
                  <chart id="rotated-chart" topLeftX="860" topLeftY="200" width="100" height="100" rotation="45">
                    <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                    <chartData>
                      <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                      <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                    </chartData>
                  </chart>
                </data>
              </slide>
            </presentation>
            """
        )
        issues_by_element = {issue["elements"][0]: issue for issue in result["slides"][0]["issues"]}
        self.assertEqual(result["summary"]["error_count"], 2)
        self.assertEqual(issues_by_element["rotated-text"]["code"], "shape_out_of_canvas")
        self.assertAlmostEqual(issues_by_element["rotated-text"]["overflow"]["left"], 20.710678, places=5)
        self.assertAlmostEqual(issues_by_element["rotated-text"]["overflow"]["top"], 20.710678, places=5)
        self.assertEqual(issues_by_element["rotated-chart"]["code"], "chart_out_of_canvas")
        self.assertAlmostEqual(issues_by_element["rotated-chart"]["overflow"]["right"], 20.710678, places=5)

    def test_lint_xml_uses_declared_bounds_for_rect_and_ignores_images(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="rotated-rect" type="rect" topLeftX="900" topLeftY="0" width="100" height="100" rotation="45"/>
                  <img id="rotated-image" src="token" topLeftX="860" topLeftY="200" width="100" height="100" rotation="45"/>
                </data>
              </slide>
            </presentation>
            """
        )
        issues_by_element = {issue["elements"][0]: issue for issue in result["slides"][0]["issues"]}
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issues_by_element["rotated-rect"]["code"], "shape_out_of_canvas")
        self.assertEqual(issues_by_element["rotated-rect"]["overflow"], {"left": 0, "top": 0, "right": 40, "bottom": 0})
        self.assertNotIn("rotated-image", issues_by_element)

    def test_detect_elements_out_of_canvas_limits_detection_to_whitelist(self) -> None:
        issues = xml_lint.detect_elements_out_of_canvas(
            [
                {"id": "table", "kind": "table", "x": 95, "y": 0, "width": 10, "height": 10, "rotation": 45},
                {"id": "chart", "kind": "chart", "x": 95, "y": 0, "width": 10, "height": 10, "rotation": 0},
                {
                    "id": "text",
                    "kind": "shape",
                    "type": "text",
                    "x": 95,
                    "y": 0,
                    "width": 10,
                    "height": 10,
                    "rotation": 0,
                },
                {
                    "id": "rect",
                    "kind": "shape",
                    "type": "rect",
                    "x": 95,
                    "y": 0,
                    "width": 10,
                    "height": 10,
                    "rotation": 45,
                },
                {"id": "image", "kind": "img", "x": 95, "y": 0, "width": 10, "height": 10, "rotation": 0},
                {
                    "id": "ellipse",
                    "kind": "shape",
                    "type": "ellipse",
                    "x": 95,
                    "y": 0,
                    "width": 10,
                    "height": 10,
                    "rotation": 0,
                },
            ],
            100,
            100,
        )

        self.assertEqual([issue["elements"] for issue in issues], [["table"], ["chart"], ["text"], ["rect"]])
        self.assertEqual(issues[-1]["bbox"], {"x": 95, "y": 0, "width": 10, "height": 10})

    def test_lint_xml_rejects_non_finite_rotation_values_from_xsd(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="infinite" type="text" topLeftX="-10" topLeftY="0" width="20" height="20" rotation="inf"/>
                  <shape id="negative-infinite" type="text" topLeftX="0" topLeftY="-10" width="20" height="20" rotation="-inf"/>
                  <chart id="not-a-number" topLeftX="950" topLeftY="0" width="20" height="20" rotation="nan">
                    <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                    <chartData>
                      <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                      <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                    </chartData>
                  </chart>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 3)
        slide_issues = result["slides"][0]["issues"]
        self.assertTrue(all(issue["code"] == "sxsd_invalid_scalar" for issue in slide_issues))
        self.assertEqual({issue["actual"] for issue in slide_issues}, {"inf", "-inf", "nan"})

    def test_lint_xml_reports_table_bottom_overflow_from_declared_bounds(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="score-table" topLeftX="54" topLeftY="238" width="414" height="385">
                    <tr><td><content><p>Score</p></content></td></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "table_out_of_canvas")
        self.assertEqual(issue["elements"], ["score-table"])
        self.assertEqual(issue["overflow"], {"left": 0, "top": 0, "right": 0, "bottom": 83})
        self.assertEqual(issue["bbox"], {"x": 54, "y": 238, "width": 414, "height": 385})

    def test_lint_xml_reports_table_right_overflow_from_declared_bounds(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="wide-table" topLeftX="850" topLeftY="80" width="180" height="120">
                    <tr><td><content><p>Score</p></content></td></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "table_out_of_canvas")
        self.assertEqual(issue["overflow"], {"left": 0, "top": 0, "right": 70, "bottom": 0})

    def test_lint_xml_allows_table_with_declared_bounds_inside_canvas(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="inside-table" topLeftX="40" topLeftY="120" width="880" height="360">
                    <tr><td><content><p>Score</p></content></td></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_reports_resolved_table_bounds_when_declared_sizes_are_missing(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="implicit-size-table" topLeftX="850" topLeftY="480">
                    <colgroup><col/><col/></colgroup>
                    <tr><td/><td/></tr>
                    <tr><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(issue["code"], "table_out_of_canvas")
        self.assertEqual(issue["bbox"], {"x": 850, "y": 480, "width": 220, "height": 74})
        self.assertEqual(issue["overflow"], {"left": 0, "top": 0, "right": 110, "bottom": 14})

    def test_lint_xml_xml_path_preserves_source_index_after_filtered_table(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <table id="t1" topLeftX="20" topLeftY="20">
                  <tr><td/></tr>
                </table>
                <table id="t2" topLeftX="20" topLeftY="100" width="9999" height="100">
                  <tr><td/></tr>
                </table>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "table_out_of_canvas"
        )
        self.assertEqual(issue["element_ids"], ["t2"])
        self.assertEqual(
            issue["related_objects"][0]["xml_path"],
            "slide[1]/data/table[2]",
        )

    def test_lint_xml_duplicate_id_keeps_issue_bound_to_original_shape(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="dup" type="rect" topLeftX="-20" topLeftY="40" width="50" height="50"/>
                <shape id="dup" type="rect" topLeftX="100" topLeftY="40" width="50" height="50"/>
              </data>
            </slide>
            """
        )

        canvas_issue = next(
            issue for issue in result["slides"][0]["issues"]
            if issue["code"] == "shape_out_of_canvas"
        )
        self.assertEqual(canvas_issue["element_ids"], ["dup"])
        self.assertEqual(
            canvas_issue["related_objects"],
            [
                {
                    "element_id": "dup",
                    "kind": "shape",
                    "type": "rect",
                    "bbox": {"x": -20, "y": 40, "width": 50, "height": 50},
                    "xml_path": "slide[1]/data/shape[1]",
                }
            ],
        )
        self.assertTrue(
            canvas_issue["hint"].startswith(
                "Locate via related_objects[].xml_path. "
            )
        )
        duplicate_issue = next(
            issue for issue in result["slides"][0]["issues"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertEqual(
            duplicate_issue["hint"],
            "Locate via related_objects[].xml_path. "
            "Do not invent replacement IDs. For newly authored elements, remove the id attribute. "
            "When updating read-back XML, keep the server ID on the original element only and remove it "
            "from copied or new elements.",
        )
        self.assertEqual(duplicate_issue["element_ids"], ["dup", "dup"])
        self.assertEqual(
            [obj["xml_path"] for obj in duplicate_issue["related_objects"]],
            ["slide[1]/data/shape[1]", "slide[1]/data/shape[2]"],
        )

    def test_lint_xml_blocks_duplicate_table_cell_ids(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <table id="table-1" topLeftX="80" topLeftY="80" width="800" height="120">
                  <colgroup><col width="400"/><col width="400"/></colgroup>
                  <tr height="120">
                    <td id="bjs"><content fontSize="24"><p>Original cell</p></content></td>
                    <td id="bjs"><content fontSize="24"><p>Copied cell</p></content></td>
                  </tr>
                </table>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertFalse(result["summary"]["release_ready"])
        self.assertEqual(issue["element_ids"], ["bjs", "bjs"])
        self.assertEqual(
            issue["related_objects"],
            [
                {
                    "element_id": "bjs",
                    "kind": "td",
                    "type": "td",
                    "xml_path": "slide[1]/data/table[1]/tr[1]/td[1]",
                },
                {
                    "element_id": "bjs",
                    "kind": "td",
                    "type": "td",
                    "xml_path": "slide[1]/data/table[1]/tr[1]/td[2]",
                },
            ],
        )

    def test_lint_xml_blocks_duplicate_id_shared_by_shape_and_table_cell(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="baa" type="rect" topLeftX="40" topLeftY="40" width="80" height="80"/>
                <table id="table-1" topLeftX="160" topLeftY="40" width="200" height="80">
                  <tr height="80"><td id="baa"><content fontSize="12"><p>Cell</p></content></td></tr>
                </table>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertEqual(issue["element_ids"], ["baa", "baa"])
        self.assertEqual(
            [obj["xml_path"] for obj in issue["related_objects"]],
            ["slide[1]/data/shape[1]", "slide[1]/data/table[1]/tr[1]/td[1]"],
        )

    def test_lint_xml_blocks_duplicate_id_shared_by_shape_and_undefined(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="dup" type="rect" topLeftX="40" topLeftY="40" width="80" height="80"/>
                <undefined id="dup" type="video"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertFalse(result["summary"]["release_ready"])
        self.assertEqual(issue["element_ids"], ["dup", "dup"])
        self.assertEqual(
            issue["related_objects"],
            [
                {
                    "element_id": "dup",
                    "kind": "shape",
                    "type": "rect",
                    "bbox": {"x": 40, "y": 40, "width": 80, "height": 80},
                    "xml_path": "slide[1]/data/shape[1]",
                },
                {
                    "element_id": "dup",
                    "kind": "undefined",
                    "type": "video",
                    "xml_path": "slide[1]/data/undefined[1]",
                },
            ],
        )

    def test_lint_xml_does_not_report_unique_table_cell_and_note_ids(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <table id="table-1" topLeftX="80" topLeftY="80" width="800" height="120">
                  <colgroup><col width="400"/><col width="400"/></colgroup>
                  <tr height="120"><td id="baa"/><td id="bab"/></tr>
                </table>
              </data>
              <note id="bac"><content fontSize="12"><p>Note</p></content></note>
            </slide>
            """
        )

        self.assertNotIn(
            "duplicate_element_id",
            [issue["code"] for issue in result["slides"][0]["issues"]],
        )

    def test_lint_xml_blocks_duplicate_ids_across_slides(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <data>
                  <shape id="dup" type="rect" topLeftX="40" topLeftY="40" width="80" height="80"/>
                </data>
              </slide>
              <slide>
                <data>
                  <shape id="dup" type="rect" topLeftX="140" topLeftY="40" width="80" height="80"/>
                </data>
              </slide>
            </presentation>
            """
        )

        issue = next(
            issue
            for issue in result["document"]["errors"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertFalse(result["summary"]["release_ready"])
        self.assertEqual(issue["element_ids"], ["dup", "dup"])
        self.assertEqual(
            issue["related_objects"],
            [
                {
                    "element_id": "dup",
                    "kind": "shape",
                    "type": "rect",
                    "bbox": {"x": 40, "y": 40, "width": 80, "height": 80},
                    "xml_path": "slide[1]/data/shape[1]",
                },
                {
                    "element_id": "dup",
                    "kind": "shape",
                    "type": "rect",
                    "bbox": {"x": 140, "y": 40, "width": 80, "height": 80},
                    "xml_path": "slide[2]/data/shape[1]",
                },
            ],
        )

    def test_lint_xml_does_not_treat_slide_ids_as_element_ids(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide id="dup"><data/></slide>
              <slide id="dup"><data/></slide>
            </presentation>
            """
        )

        self.assertNotIn(
            "duplicate_element_id",
            [issue["code"] for issue in result["document"]["errors"]],
        )

    def test_lint_xml_does_not_treat_presentation_id_as_element_id(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" id="dup" width="960" height="540">
              <slide>
                <data><undefined id="dup" type="video"/></data>
              </slide>
            </presentation>
            """
        )

        self.assertNotIn(
            "duplicate_element_id",
            [
                issue["code"]
                for issue in [
                    *result["document"]["errors"],
                    *result["slides"][0]["errors"],
                ]
            ],
        )

    def test_lint_xml_blocks_duplicate_note_ids_across_slides(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <note id="baa"><content fontSize="12"><p>First note</p></content></note>
              </slide>
              <slide>
                <note id="baa"><content fontSize="12"><p>Copied note</p></content></note>
              </slide>
            </presentation>
            """
        )

        issue = next(
            issue
            for issue in result["document"]["errors"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertFalse(result["summary"]["release_ready"])
        self.assertEqual(issue["element_ids"], ["baa", "baa"])
        self.assertEqual(
            issue["related_objects"],
            [
                {
                    "element_id": "baa",
                    "kind": "note",
                    "type": "note",
                    "xml_path": "slide[1]/note[1]",
                },
                {
                    "element_id": "baa",
                    "kind": "note",
                    "type": "note",
                    "xml_path": "slide[2]/note[1]",
                },
            ],
        )

    def test_lint_xml_cross_kind_duplicate_id_does_not_change_related_object_kind(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="dup" type="rect" topLeftX="-20" topLeftY="40" width="50" height="50"/>
                <img id="dup" src="token" topLeftX="100" topLeftY="40" width="50" height="50"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"]
            if issue["code"] == "shape_out_of_canvas"
        )
        self.assertEqual(issue["related_objects"][0]["kind"], "shape")
        self.assertEqual(
            issue["related_objects"][0]["xml_path"],
            "slide[1]/data/shape[1]",
        )
        duplicate_issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "duplicate_element_id"
        )
        self.assertEqual(
            [obj["xml_path"] for obj in duplicate_issue["related_objects"]],
            ["slide[1]/data/shape[1]", "slide[1]/data/img[1]"],
        )

    def test_normalize_issue_does_not_repeat_xml_path_hint_prefix(self) -> None:
        xml_path = "slide[1]/data/shape[1]"
        element = {
            "id": "box",
            "_source_id": "box",
            "_ref": xml_path,
            "xml_path": xml_path,
            "kind": "shape",
            "type": "rect",
            "x": 0,
            "y": 0,
            "width": 40,
            "height": 40,
        }
        prefix = "Locate via related_objects[].xml_path."

        issue = xml_lint.normalize_issue(
            {
                "level": "error",
                "code": "shape_out_of_canvas",
                "elements": [xml_path],
                "canvas": {"width": 960, "height": 540},
                "bbox": {"x": -10, "y": 0, "width": 40, "height": 40},
                "overflow": {"left": 10, "top": 0, "right": 0, "bottom": 0},
                "hint": f"{prefix} Move the shape inside the canvas.",
            },
            1,
            {xml_path: element},
        )

        self.assertEqual(issue["hint"].count(prefix), 1)

    def test_lint_xml_elements_keep_locator_for_anonymous_related_object(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="text" topLeftX="100" topLeftY="100" width="300" height="100">
                  <content fontSize="24"><p>Important text</p></content>
                </shape>
                <img id="srv-42" src="token" topLeftX="100" topLeftY="100" width="300" height="100"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "image_covers_text"
        )
        self.assertEqual(
            issue["elements"],
            ["srv-42", "slide[1]/data/shape[1]"],
        )
        self.assertEqual(issue["element_ids"], ["srv-42"])
        self.assertEqual(len(issue["related_objects"]), 2)

    def test_normalize_issue_deduplicates_repeated_element_refs(self) -> None:
        xml_path = "slide[1]/data/shape[1]"
        element = {
            "id": "srv-42",
            "_source_id": "srv-42",
            "_ref": xml_path,
            "xml_path": xml_path,
            "kind": "shape",
            "type": "rect",
            "x": 0,
            "y": 0,
            "width": 40,
            "height": 40,
        }

        issue = xml_lint.normalize_issue(
            {
                "level": "warning",
                "code": "blank_slide",
                "measurement": {
                    "visible_element_count": 0,
                    "declared_element_count": 1,
                },
                "elements": [xml_path, xml_path],
            },
            1,
            {xml_path: element},
        )

        self.assertEqual(issue["elements"], ["srv-42"])
        self.assertEqual(issue["element_ids"], ["srv-42"])
        self.assertEqual(len(issue["related_objects"]), 1)

    def test_lint_xml_reports_duplicate_ids_for_every_linted_element_kind(self) -> None:
        duplicate_pairs = {
            "shape": (
                '<shape id="dup" type="rect" topLeftX="10" topLeftY="10" width="40" height="40"/>',
                '<shape id="dup" type="rect" topLeftX="60" topLeftY="10" width="40" height="40"/>',
            ),
            "chart": (
                '<chart id="dup" topLeftX="10" topLeftY="10" width="40" height="40"><chartPlotArea><chartPlot type="line"/></chartPlotArea><chartData><dim1><chartField name="category" valueType="string">A</chartField></dim1><dim2><chartField name="value" valueType="number">1</chartField></dim2></chartData></chart>',
                '<chart id="dup" topLeftX="60" topLeftY="10" width="40" height="40"><chartPlotArea><chartPlot type="line"/></chartPlotArea><chartData><dim1><chartField name="category" valueType="string">A</chartField></dim1><dim2><chartField name="value" valueType="number">1</chartField></dim2></chartData></chart>',
            ),
            "table": (
                '<table id="dup" topLeftX="10" topLeftY="10" width="40" height="40"><colgroup><col width="40"/></colgroup><tr height="40"><td/></tr></table>',
                '<table id="dup" topLeftX="60" topLeftY="10" width="40" height="40"><colgroup><col width="40"/></colgroup><tr height="40"><td/></tr></table>',
            ),
            "img": (
                '<img id="dup" src="token" topLeftX="10" topLeftY="10" width="40" height="40"/>',
                '<img id="dup" src="token" topLeftX="60" topLeftY="10" width="40" height="40"/>',
            ),
            "line": (
                '<line id="dup" startX="10" startY="10" endX="40" endY="40"><border color="rgb(0, 0, 0)"/></line>',
                '<line id="dup" startX="60" startY="10" endX="90" endY="40"><border color="rgb(0, 0, 0)"/></line>',
            ),
            "icon": (
                '<icon id="dup" iconType="iconpark/Base/setting.svg" topLeftX="10" topLeftY="10" width="40" height="40"><fill><fillColor color="rgb(0, 0, 0)"/></fill></icon>',
                '<icon id="dup" iconType="iconpark/Base/setting.svg" topLeftX="60" topLeftY="10" width="40" height="40"><fill><fillColor color="rgb(0, 0, 0)"/></fill></icon>',
            ),
            "polyline": (
                '<polyline id="dup" topLeftX="10" topLeftY="10" width="40" height="40"><border color="rgb(0, 0, 0)"/></polyline>',
                '<polyline id="dup" topLeftX="60" topLeftY="10" width="40" height="40"><border color="rgb(0, 0, 0)"/></polyline>',
            ),
        }
        for kind, pair in duplicate_pairs.items():
            with self.subTest(kind=kind):
                result = xml_lint.lint_xml(
                    f'<slide xmlns="https://www.larkoffice.com/sml/2.0"><data>{pair[0]}{pair[1]}</data></slide>'
                )
                issue = next(
                    issue
                    for issue in result["slides"][0]["issues"]
                    if issue["code"] == "duplicate_element_id"
                )
                self.assertEqual(issue["element_ids"], ["dup", "dup"])
                self.assertEqual(
                    [obj["xml_path"] for obj in issue["related_objects"]],
                    [
                        f"slide[1]/data/{kind}[1]",
                        f"slide[1]/data/{kind}[2]",
                    ],
                )

    def test_lint_xml_missing_id_does_not_collide_with_explicit_synthetic_like_id(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="rect" topLeftX="-20" topLeftY="40" width="50" height="50"/>
                <shape id="shape-1" type="rect" topLeftX="100" topLeftY="40" width="50" height="50"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"]
            if issue["code"] == "shape_out_of_canvas"
        )
        self.assertEqual(issue["element_ids"], [])
        self.assertNotIn("element_id", issue["related_objects"][0])
        self.assertEqual(
            issue["related_objects"][0]["xml_path"],
            "slide[1]/data/shape[1]",
        )
        self.assertTrue(
            issue["hint"].startswith("Locate via related_objects[].xml_path. ")
        )
        self.assertNotIn(
            "duplicate_element_id",
            [candidate["code"] for candidate in result["slides"][0]["issues"]],
        )

    def test_lint_xml_empty_id_is_not_exposed_as_an_element_id(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="" type="rect" topLeftX="-20" topLeftY="40" width="50" height="50"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "shape_out_of_canvas"
        )
        self.assertEqual(issue["element_ids"], [])
        self.assertNotIn("element_id", issue["related_objects"][0])
        self.assertEqual(
            issue["related_objects"][0]["xml_path"],
            "slide[1]/data/shape[1]",
        )

    def test_lint_xml_uses_resolved_table_bounds_for_canvas_validation(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="resolved-overflow-table" topLeftX="800" topLeftY="80" width="100" height="40">
                    <colgroup><col width="100"/><col width="100"/></colgroup>
                    <tr height="40"><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issues = result["slides"][0]["issues"]
        canvas_issue = next(issue for issue in issues if issue["code"] == "table_out_of_canvas")
        mismatch_issue = next(issue for issue in issues if issue["code"] == "table_resolved_size_mismatch")
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(canvas_issue["bbox"], {"x": 800, "y": 80, "width": 200, "height": 40})
        self.assertEqual(canvas_issue["overflow"]["right"], 40)
        self.assertEqual(mismatch_issue["dimension"], "width")
        self.assertEqual(mismatch_issue["resolved_size"], canvas_issue["bbox"]["width"])

    def test_lint_xml_uses_the_same_anonymous_table_path_for_all_table_diagnostics(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <shape id="title" type="text" topLeftX="40" topLeftY="40" width="200" height="40"/>
                  <img id="logo" src="token" topLeftX="40" topLeftY="100" width="40" height="40"/>
                  <table topLeftX="900" topLeftY="80" width="100" height="40">
                    <colgroup><col width="100"/><col width="100"/></colgroup>
                    <tr height="40"><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issues = result["slides"][0]["issues"]
        canvas_issue = next(issue for issue in issues if issue["code"] == "table_out_of_canvas")
        mismatch_issue = next(issue for issue in issues if issue["code"] == "table_resolved_size_mismatch")
        self.assertEqual(canvas_issue["elements"], ["slide[1]/data/table[1]"])
        self.assertEqual(mismatch_issue["elements"], ["slide[1]/data/table[1]"])
        self.assertEqual(
            canvas_issue["related_objects"][0]["xml_path"],
            "slide[1]/data/table[1]",
        )
        self.assertEqual(
            mismatch_issue["related_objects"][0]["xml_path"],
            "slide[1]/data/table[1]",
        )
        self.assertNotIn("element_id", canvas_issue["related_objects"][0])
        self.assertNotIn("element_id", mismatch_issue["related_objects"][0])

    def test_lint_xml_reports_info_when_table_target_size_resolves_larger_than_declared(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="size-mismatch" topLeftX="40" topLeftY="120" width="200" height="80">
                    <colgroup><col span="2" width="100"/><col width="50"/></colgroup>
                    <tr height="40"><td/><td/><td/></tr>
                    <tr height="60"><td/><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issues_by_dimension = {issue["dimension"]: issue for issue in result["slides"][0]["issues"]}
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["summary"]["info_count"], 2)
        self.assertEqual(issues_by_dimension["width"]["level"], "info")
        self.assertEqual(issues_by_dimension["width"]["code"], "table_resolved_size_mismatch")
        self.assertEqual(issues_by_dimension["width"]["resolved_sizes"], [100, 100, 50])
        self.assertEqual(issues_by_dimension["width"]["resolved_size"], 250)
        self.assertEqual(issues_by_dimension["height"]["resolved_sizes"], [40, 60])
        self.assertEqual(issues_by_dimension["height"]["resolved_size"], 100)

    def test_lint_xml_does_not_report_info_when_table_target_size_is_resolved_exactly(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="size-match" topLeftX="40" topLeftY="120" width="300" height="100">
                    <colgroup><col width="100"/><col/></colgroup>
                    <tr height="40"><td/><td/></tr>
                    <tr><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_keeps_resolved_table_sizes_positive_when_target_is_too_small(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide xmlns="https://www.larkoffice.com/sml/2.0">
                <data>
                  <table id="narrow-table" topLeftX="40" topLeftY="120" width="1">
                    <colgroup><col/><col/></colgroup>
                    <tr><td/><td/></tr>
                  </table>
                </data>
              </slide>
            </presentation>
            """
        )
        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["dimension"], "width")
        self.assertEqual(issue["resolved_sizes"], [1, 1])
        self.assertEqual(issue["resolved_size"], 2)

    def test_fill_last_size_gap_preserves_target_when_positive_sizes_are_possible(self) -> None:
        final_sizes = xml_lint.fill_last_size_gap([10, 10], 3)
        self.assertEqual(final_sizes, [2, 1])
        self.assertEqual(sum(final_sizes), 3)

    def test_cli_reports_table_layout_size_info_for_weighted_min_layout_cases(self) -> None:
        cases = {
            "target-exact": (
                """
                <table topLeftX="40" topLeftY="120" width="360" height="150">
                  <colgroup><col width="100"/><col width="200"/></colgroup>
                  <tr height="40"><td/><td/></tr><tr height="60"><td/><td/></tr>
                </table>
                """,
                0,
            ),
            "declared-size-exceeds-target": (
                """
                <table topLeftX="40" topLeftY="120" width="200" height="80">
                  <colgroup><col span="2" width="100"/><col width="50"/></colgroup>
                  <tr height="40"><td/><td/><td/></tr><tr height="60"><td/><td/><td/></tr>
                </table>
                """,
                2,
            ),
            "remaining-space-insufficient": (
                """
                <table topLeftX="40" topLeftY="120" width="80" height="30">
                  <colgroup><col width="80"/><col/></colgroup>
                  <tr height="40"><td/><td/></tr><tr><td/><td/></tr>
                </table>
                """,
                2,
            ),
            "no-target-size": (
                """
                <table topLeftX="40" topLeftY="120">
                  <colgroup><col width="80"/><col/></colgroup>
                  <tr height="40"><td/><td/></tr><tr><td/><td/></tr>
                </table>
                """,
                0,
            ),
        }
        script_path = Path(xml_lint.__file__).resolve()
        with tempfile.TemporaryDirectory() as temp_dir:
            for name, (table_xml, expected_info_count) in cases.items():
                with self.subTest(case=name):
                    input_path = Path(temp_dir) / f"{name}.xml"
                    input_path.write_text(
                        f"""
                        <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
                          <slide xmlns="https://www.larkoffice.com/sml/2.0"><data>{table_xml}</data></slide>
                        </presentation>
                        """,
                        encoding="utf-8",
                    )
                    completed = subprocess.run(
                        [sys.executable, str(script_path), "--input", str(input_path)],
                        capture_output=True,
                        check=False,
                        text=True,
                    )
                    result = json.loads(completed.stdout)
                    self.assertEqual(completed.returncode, 0, completed.stderr)
                    self.assertEqual(result["summary"]["error_count"], 0)
                    self.assertEqual(result["summary"]["warning_count"], 0)
                    self.assertEqual(result["summary"]["info_count"], expected_info_count)
                    self.assertTrue(
                        all(issue["level"] == "info" for issue in result["slides"][0]["issues"]),
                        result["slides"][0]["issues"],
                    )

    def test_lint_xml_detects_invalid_template_text_stack_overlap(self) -> None:
        cases = [
            (
                "subtitle-too-high",
                """
                <shape type="text" topLeftX="40" topLeftY="80" width="240" height="90">
                  <content textType="title" fontSize="44"><p>Title</p></content>
                </shape>
                <shape type="text" topLeftX="40" topLeftY="90" width="240" height="80">
                  <content textType="sub-headline" fontSize="20"><p>Subtitle</p></content>
                </shape>
                """,
            ),
        ]
        for name, shapes in cases:
            with self.subTest(name=name):
                result = xml_lint.lint_xml(
                    f"""
                    <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
                      <slide xmlns="https://www.larkoffice.com/sml/2.0">
                        <data>{shapes}</data>
                      </slide>
                    </presentation>
                    """
                )
                self.assertEqual(result["summary"]["error_count"], 1)
                self.assertEqual(result["slides"][0]["issues"][0]["code"], "bbox_overlap")


    def test_lint_xml_reports_vertical_text_image_overlap_as_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0"><data>
              <shape id="text" type="text" vert="vert" topLeftX="100" topLeftY="100" width="100" height="100">
                <content><p>Vertical</p></content>
              </shape>
              <img id="image" src="token" topLeftX="120" topLeftY="120" width="20" height="20"/>
            </data></slide>
            """
        )
        issue = next(issue for issue in result["slides"][0]["issues"] if issue["code"] == "image_may_cover_vertical_text")
        self.assertEqual(issue["level"], "info")
        self.assertEqual(result["summary"]["error_count"], 0)
        self.assertEqual(result["summary"]["info_count"], 1)

    def test_lint_xml_related_objects_include_source_xml_paths(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="http://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide>
                <data>
                  <shape type="text" topLeftX="80" topLeftY="80" width="400" height="60">
                    <content fontSize="24"><p>Control slide</p></content>
                  </shape>
                </data>
              </slide>
              <slide>
                <data>
                  <shape type="text" topLeftX="70" topLeftY="55" width="820" height="70">
                    <content fontSize="32"><p>shape-3 mapping experiment</p></content>
                  </shape>
                  <shape type="text" topLeftX="80" topLeftY="165" width="400" height="70">
                    <content fontSize="18"><p>First, preserve source order.</p></content>
                  </shape>
                  <shape type="text" topLeftX="80" topLeftY="315" width="400" height="64">
                    <content fontSize="26"><p>TARGET_SHAPE_THREE</p></content>
                  </shape>
                  <img src="token" topLeftX="80" topLeftY="305" width="400" height="110"/>
                </data>
              </slide>
            </presentation>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][1]["issues"]
            if issue["code"] == "image_covers_text"
        )
        self.assertEqual(
            [(obj["kind"], obj["xml_path"]) for obj in issue["related_objects"]],
            [
                ("img", "slide[2]/data/img[1]"),
                ("shape", "slide[2]/data/shape[3]"),
            ],
        )
        self.assertTrue(
            all("element_id" not in obj for obj in issue["related_objects"])
        )

    def test_lint_xml_related_objects_include_line_xml_path(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="label" type="text" topLeftX="100" topLeftY="100" width="200" height="80">
                  <content fontSize="24"><p>Crossed text</p></content>
                </shape>
                <line id="connector" startX="80" startY="130" endX="330" endY="130">
                  <border color="rgb(15, 23, 42)" width="2"/>
                </line>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "bbox_overlap" and issue["elements"][0] == "connector"
        )
        self.assertEqual(
            {
                obj["element_id"]: obj["xml_path"]
                for obj in issue["related_objects"]
            },
            {
                "connector": "slide[1]/data/line[1]",
                "label": "slide[1]/data/shape[1]",
            },
        )


class XmlTextOverlapLintDensityTest(unittest.TestCase):
    def test_lint_xml_sparse_container_related_objects_include_icon_xml_path(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="120" width="400" height="300"/>
                <icon id="visual" iconType="iconpark/Base/setting.svg" topLeftX="80" topLeftY="140" width="32" height="32">
                  <fill><fillColor color="rgb(37, 99, 235)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "sparse_container_content"
        )
        self.assertEqual(
            {
                obj["element_id"]: obj["xml_path"]
                for obj in issue["related_objects"]
            },
            {
                "card": "slide[1]/data/shape[1]",
                "visual": "slide[1]/data/icon[1]",
            },
        )

    def test_lint_xml_blocks_blank_slide(self) -> None:
        result = xml_lint.lint_xml(
            """
            <presentation xmlns="https://www.larkoffice.com/sml/2.0" width="960" height="540">
              <slide id="content-slide">
                <data>
                  <shape id="title" type="text" topLeftX="60" topLeftY="60" width="400" height="50">
                    <content fontSize="28"><p>Investment report</p></content>
                  </shape>
                </data>
              </slide>
              <slide id="blank-slide">
                <style><fill><fillColor color="rgba(255, 255, 255, 1)"/></fill></style>
                <data/>
                <note><content/></note>
              </slide>
            </presentation>
            """
        )

        self.assertEqual(result["summary"]["slide_count"], 2)
        self.assertEqual(result["summary"]["warning_count"], 0)
        self.assertEqual(result["summary"]["error_count"], 1)
        self.assertEqual(result["summary"]["status"], "blocked")
        self.assertFalse(result["summary"]["release_ready"])
        self.assertEqual(result["slides"][0]["issues"], [])
        self.assertEqual(result["slides"][1]["element_count"], 0)
        issue = result["slides"][1]["errors"][0]
        self.assertEqual(issue["level"], "error")
        self.assertEqual(issue["code"], "blank_slide")
        self.assertEqual(issue["element_ids"], [])
        self.assertEqual(issue["rule"]["id"], "blank_slide")
        self.assertEqual(issue["measurement"]["visible_element_count"], 0)
        self.assertEqual(issue["related_objects"], [])

    def test_lint_xml_blocks_blank_slide_with_only_transparent_image(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <img id="ghost" src="token" topLeftX="60" topLeftY="60" width="200" height="200" alpha="0"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 1)
        issue = result["slides"][0]["errors"][0]
        self.assertEqual(issue["code"], "blank_slide")

    def test_lint_xml_warns_when_large_container_is_mostly_empty(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="trend-card" type="rect" topLeftX="500" topLeftY="135" width="410" height="370"/>
                <shape id="trend-title" type="text" topLeftX="515" topLeftY="147" width="380" height="28">
                  <content fontSize="15"><p>Core trends</p></content>
                </shape>
                <shape id="trend-copy" type="text" topLeftX="515" topLeftY="177" width="380" height="315">
                  <content fontSize="12"><p>First point</p><p>Second point</p><p>Third point</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["code"], "sparse_container_content")
        self.assertEqual(issue["target"]["container_id"], "trend-card")
        self.assertEqual(issue["target"], {
            "slide_number": 1,
            "container_id": "trend-card",
            "container_xml_path": "slide[1]/data/shape[1]",
            "container_type": "rect",
            "bbox": {"x": 500, "y": 135, "width": 410, "height": 370},
        })
        self.assertLess(issue["measurement"]["content_coverage_ratio"], 0.15)
        self.assertEqual(issue["rule"], {
            "name": "large_container_visible_content_coverage",
            "threshold": 0.15,
            "comparison": "content_coverage_ratio < threshold",
            "id": "sparse_container_content",
        })
        self.assertEqual(issue["measurement"]["container_area"], 151700)
        self.assertEqual(issue["measurement"]["content_coverage_ratio"], 0.03)
        self.assertEqual(issue["elements"], ["trend-card", "trend-title", "trend-copy"])
        self.assertEqual(issue["element_ids"], ["trend-card", "trend-title", "trend-copy"])
        self.assertEqual(
            [obj["element_id"] for obj in issue["related_objects"]],
            ["trend-card", "trend-title", "trend-copy"],
        )
        self.assertEqual(result["slides"][0]["status"], "needs_screenshot_review")
        self.assertEqual(result["slides"][0]["warnings"], result["slides"][0]["issues"])

    def test_lint_xml_uses_xml_path_in_anonymous_sparse_container_message(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape type="rect" topLeftX="500" topLeftY="135" width="410" height="370"/>
                <shape id="trend-title" type="text" topLeftX="515" topLeftY="147" width="380" height="28">
                  <content fontSize="15"><p>Core trends</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = next(
            issue
            for issue in result["slides"][0]["issues"]
            if issue["code"] == "sparse_container_content"
        )
        self.assertNotIn("container_id", issue["target"])
        self.assertEqual(
            issue["target"]["container_xml_path"],
            "slide[1]/data/shape[1]",
        )
        self.assertEqual(
            issue["message"],
            "large card slide[1]/data/shape[1] content coverage 1.0% is below 15.0%",
        )

    def test_lint_xml_warns_for_sparse_short_cards(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card-1" type="rect" topLeftX="60" topLeftY="180" width="400" height="105"/>
                <shape id="text-1" type="text" topLeftX="80" topLeftY="220" width="360" height="30">
                  <content fontSize="14"><p>期待认识大家</p></content>
                </shape>
                <shape id="card-2" type="rect" topLeftX="490" topLeftY="180" width="400" height="105"/>
                <shape id="text-2" type="text" topLeftX="510" topLeftY="220" width="360" height="30">
                  <content fontSize="14"><p>化学一起讨论</p></content>
                </shape>
                <shape id="card-3" type="rect" topLeftX="60" topLeftY="310" width="400" height="105"/>
                <shape id="text-3" type="text" topLeftX="80" topLeftY="350" width="360" height="30">
                  <content fontSize="14"><p>吉他随时交流</p></content>
                </shape>
                <shape id="card-4" type="rect" topLeftX="490" topLeftY="310" width="400" height="105"/>
                <shape id="text-4" type="text" topLeftX="510" topLeftY="350" width="360" height="30">
                  <content fontSize="14"><p>共度美好四年</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        container_issues = [
            issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_container_content"
        ]
        self.assertEqual(
            [issue["target"]["container_id"] for issue in container_issues],
            ["card-1", "card-2", "card-3", "card-4"],
        )
        self.assertTrue(all(issue["target"]["bbox"]["height"] == 105 for issue in container_issues))
        self.assertTrue(all(issue["measurement"]["content_coverage_ratio"] < 0.15 for issue in container_issues))
        self.assertEqual(
            [issue["code"] for issue in result["slides"][0]["issues"]],
            [
                "sparse_container_content",
                "sparse_container_content",
                "sparse_container_content",
                "sparse_container_content",
                "sparse_slide_content",
            ],
        )

    def test_lint_xml_warns_when_whole_slide_has_too_little_effective_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="background" type="rect" topLeftX="0" topLeftY="0" width="960" height="540"/>
                <shape id="text-1" type="text" topLeftX="60" topLeftY="80" width="200" height="30">
                  <content fontSize="14"><p>One short line</p></content>
                </shape>
                <shape id="text-2" type="text" topLeftX="500" topLeftY="180" width="200" height="30">
                  <content fontSize="14"><p>Another line</p></content>
                </shape>
                <shape id="text-3" type="text" topLeftX="60" topLeftY="310" width="200" height="30">
                  <content fontSize="14"><p>Third line</p></content>
                </shape>
                <shape id="text-4" type="text" topLeftX="500" topLeftY="410" width="200" height="30">
                  <content fontSize="14"><p>Fourth line</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issues = [issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_slide_content"]
        self.assertEqual(len(issues), 1)
        issue = issues[0]
        self.assertEqual(issue["target"]["bbox"], {"x": 0, "y": 0, "width": 960, "height": 540})
        self.assertEqual(issue["rule"]["threshold"], 0.035)
        self.assertLess(issue["measurement"]["content_coverage_ratio"], 0.035)
        self.assertEqual(issue["measurement"]["content_element_count"], 4)
        self.assertNotIn("background", issue["elements"])

    def test_lint_xml_ignores_isolated_short_layout_bar(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="summary-bar" type="rect" topLeftX="52" topLeftY="82" width="856" height="105"/>
                <shape id="summary" type="text" topLeftX="72" topLeftY="115" width="816" height="30">
                  <content fontSize="14"><p>One concise summary</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_counts_rect_own_content_as_visible_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="load-card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="18">
                    <p>被吊物</p>
                    <p><span fontSize="36">32.0 t</span></p>
                    <p>钢结构模块</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_reports_nonzero_coverage_for_rect_own_content_reproduction(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="load-card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="18">
                    <p>被吊物</p>
                    <p>32.0 t</p>
                    <p>钢结构模块</p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertGreater(issue["measurement"]["visible_content_area"], 0)
        self.assertEqual(issue["measurement"]["content_element_count"], 1)
        self.assertGreater(issue["measurement"]["content_coverage_ratio"], 0)

    def test_lint_xml_still_warns_for_sparse_rect_own_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="sparse-card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="12"><p>A</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["target"]["container_id"], "sparse-card")
        self.assertGreater(issue["measurement"]["visible_content_area"], 0)
        self.assertEqual(issue["measurement"]["content_element_count"], 1)
        self.assertEqual(issue["elements"], ["sparse-card"])

    def test_lint_xml_unions_rect_own_content_with_child_content(self) -> None:
        self_only = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="12"><p>A</p></content>
                </shape>
              </data>
            </slide>
            """
        )
        with_overlapping_child = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="12"><p>A</p></content>
                </shape>
                <shape id="child" type="text" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="12"><p>A</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self_issue = self_only["slides"][0]["issues"][0]
        mixed_issue = with_overlapping_child["slides"][0]["issues"][0]
        self.assertEqual(
            mixed_issue["measurement"]["visible_content_area"],
            self_issue["measurement"]["visible_content_area"],
        )
        self.assertEqual(mixed_issue["measurement"]["content_element_count"], 2)

    def test_extract_density_elements_reads_nested_font_size_from_rect_content(self) -> None:
        elements = xml_lint.extract_density_elements(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184">
                  <content fontSize="12"><p><span fontSize="36">32.0 t</span></p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(elements[0]["fontSize"], 36)

    def test_extract_density_elements_does_not_attach_following_text_to_self_closing_rect(self) -> None:
        elements = xml_lint.extract_density_elements(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184"/>
                <shape id="title" type="text" topLeftX="80" topLeftY="160" width="180" height="30">
                  <content fontSize="18"><p>Following title</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(elements[0]["text"], "")
        self.assertEqual(elements[1]["text"], "Following title")

    def test_lint_xml_allows_container_with_large_visual_child(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="chart-card" type="rect" topLeftX="500" topLeftY="135" width="410" height="300"/>
                <chart id="chart" topLeftX="525" topLeftY="170" width="350" height="220">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData>
                    <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_does_not_let_transparent_visual_child_suppress_sparse_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="title" type="text" topLeftX="40" topLeftY="40" width="300" height="40">
                  <content fontSize="20"><p>Section title</p></content>
                </shape>
                <shape id="chart-card" type="rect" topLeftX="500" topLeftY="135" width="410" height="300"/>
                <chart id="chart" topLeftX="525" topLeftY="170" width="350" height="220" alpha="0">
                  <chartPlotArea><chartPlot type="line"/></chartPlotArea>
                  <chartData>
                    <dim1><chartField name="category" valueType="string">A</chartField></dim1>
                    <dim2><chartField name="value" valueType="number">1</chartField></dim2>
                  </chartData>
                </chart>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_container_content"
        )
        self.assertEqual(issue["target"]["container_id"], "chart-card")

    def test_lint_xml_warns_for_small_empty_visual_placeholder_cards(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="letter-placeholder" type="rect" topLeftX="520" topLeftY="180" width="200" height="200"/>
                <shape id="letter" type="text" topLeftX="540" topLeftY="250" width="160" height="70">
                  <content fontSize="46"><p>Z</p></content>
                </shape>
                <shape id="empty-placeholder" type="rect" topLeftX="744" topLeftY="180" width="144" height="200"/>
              </data>
            </slide>
            """
        )

        issues = result["slides"][0]["issues"]
        self.assertEqual(
            [issue["target"]["container_id"] for issue in issues],
            ["letter-placeholder", "empty-placeholder"],
        )
        self.assertEqual(issues[1]["measurement"]["content_element_count"], 0)

    def test_lint_xml_applies_global_threshold_to_normal_text_card(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="70" topLeftY="184" width="260" height="288"/>
                <shape id="title" type="text" topLeftX="90" topLeftY="215" width="220" height="30">
                  <content fontSize="18"><p>梦境与现实</p></content>
                </shape>
                <shape id="copy" type="text" topLeftX="90" topLeftY="330" width="220" height="70">
                  <content fontSize="13"><p>边界溶解，逻辑失效。观众被拽入潜意识的迷宫。</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["target"]["container_id"], "card")
        self.assertEqual(issue["rule"]["threshold"], 0.15)

    def test_lint_xml_allows_image_overlay_rect(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <img id="hero" topLeftX="560" topLeftY="0" width="400" height="540"/>
                <shape id="tint" type="rect" topLeftX="560" topLeftY="0" width="400" height="540"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_does_not_let_transparent_image_overlay_suppress_sparse_warning(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="title" type="text" topLeftX="40" topLeftY="40" width="300" height="40">
                  <content fontSize="20"><p>Section title</p></content>
                </shape>
                <shape id="card" type="rect" topLeftX="330" topLeftY="120" width="300" height="300"/>
                <img id="ghost-overlay" src="token" topLeftX="330" topLeftY="120" width="300" height="300" alpha="0"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_container_content"
        )
        self.assertEqual(issue["target"]["container_id"], "card")

    def test_lint_xml_allows_edge_spanning_layout_panel_and_nested_decoration(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="panel" type="rect" topLeftX="600" topLeftY="0" width="360" height="540"/>
                <shape id="decoration" type="rect" topLeftX="660" topLeftY="150" width="240" height="240"/>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_counts_icons_as_visible_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="80" topLeftY="140" width="320" height="240"/>
                <icon id="visual" iconType="iconpark/Safe/shield.svg" topLeftX="100" topLeftY="160" width="180" height="180">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["warning_count"], 0)

    def test_lint_xml_does_not_count_transparent_icon_as_visible_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="title" type="text" topLeftX="40" topLeftY="40" width="300" height="40">
                  <content fontSize="20"><p>Section title</p></content>
                </shape>
                <shape id="card" type="rect" topLeftX="80" topLeftY="140" width="320" height="240"/>
                <icon id="visual" iconType="iconpark/Safe/shield.svg" topLeftX="100" topLeftY="160" width="180" height="180" alpha="0">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_container_content"
        )
        self.assertEqual(issue["target"]["container_id"], "card")
        self.assertEqual(issue["measurement"]["content_coverage_ratio"], 0)

    def test_lint_xml_warns_when_coverage_is_below_global_threshold(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="80" topLeftY="140" width="200" height="200"/>
                <icon id="visual" iconType="iconpark/Safe/shield.svg" topLeftX="100" topLeftY="160" width="70" height="70">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["target"]["container_id"], "card")
        self.assertEqual(issue["measurement"]["content_coverage_ratio"], 0.122)
        self.assertEqual(issue["rule"]["threshold"], 0.15)

    def test_lint_xml_allows_quarter_coverage_under_lower_threshold(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="80" topLeftY="140" width="200" height="200"/>
                <icon id="visual" iconType="iconpark/Safe/shield.svg" topLeftX="100" topLeftY="160" width="100" height="100">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </icon>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_allows_large_metric_card_above_lower_threshold(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="metric-card" type="rect" topLeftX="80" topLeftY="140" width="360" height="300"/>
                <shape id="metric" type="text" topLeftX="104" topLeftY="190" width="340" height="90">
                  <content fontSize="12"><p><strong><span fontSize="62">400</span></strong>+ 项</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["slides"][0]["issues"], [])

    def test_lint_xml_does_not_report_blank_slide_for_embed_only_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="http://www.larkoffice.com/sml/2.0">
              <data>
                <embed id="emb" topLeftX="280" topLeftY="130" width="400" height="280">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">
                    <circle cx="200" cy="140" r="100" fill="#2563EB"/>
                  </svg>
                </embed>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("blank_slide", codes)

    def test_lint_xml_does_not_report_blank_slide_for_line_only_content(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <line id="l1" startX="100" startY="100" endX="800" endY="100"><border/></line>
                <line id="l2" startX="100" startY="200" endX="800" endY="200"><border/></line>
                <line id="l3" startX="100" startY="300" endX="800" endY="300"><border/></line>
                <line id="l4" startX="100" startY="400" endX="800" endY="400"><border/></line>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("blank_slide", codes)

    def test_lint_xml_reports_bbox_overlap_measurement_from_decision_time_visual_bbox(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="left" type="text" topLeftX="80" topLeftY="80" width="300" height="60">
                  <content fontSize="14"><p>overlap text <span fontSize="96">big</span></p></content>
                </shape>
                <shape id="right" type="text" topLeftX="80" topLeftY="80" width="300" height="80">
                  <content fontSize="14"><p>other overlap text</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        issue = result["slides"][0]["issues"][0]
        self.assertEqual(issue["code"], "bbox_overlap")
        # Must match the visual bbox that should_flag_overlap actually decided with (fontSize=14
        # from extract_elements), not the fontSize=96 max-descendant value that
        # extract_density_elements computes for the same "left" element id.
        self.assertEqual(issue["measurement"]["intersection_width"], 109.2)
        self.assertEqual(issue["measurement"]["intersection_height"], 6.8)
        self.assertEqual(issue["measurement"]["intersection_area"], 742.56)

    def test_has_similar_short_card_peer_excludes_the_element_itself(self) -> None:
        card_a = {"kind": "shape", "type": "rect", "x": 0, "y": 0, "width": 300, "height": 100}
        card_b = {"kind": "shape", "type": "rect", "x": 400, "y": 0, "width": 300, "height": 100}
        card_c = {"kind": "shape", "type": "rect", "x": 0, "y": 200, "width": 300, "height": 100}

        self.assertFalse(
            xml_lint.has_similar_short_card_peer(card_a, [card_a, card_b])
        )
        self.assertTrue(
            xml_lint.has_similar_short_card_peer(card_a, [card_a, card_b, card_c])
        )

    def test_lint_xml_reports_schema_version_2_for_sparse_issues(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="card" type="rect" topLeftX="60" topLeftY="140" width="220" height="184"/>
              </data>
            </slide>
            """
        )

        issue = next(
            issue for issue in result["slides"][0]["issues"] if issue["code"] == "sparse_container_content"
        )
        self.assertEqual(issue["schema_version"], "2.0")

    def test_lint_xml_does_not_report_blank_slide_for_textless_decorative_shapes(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="deco1" type="ellipse" topLeftX="60" topLeftY="60" width="300" height="300">
                  <fill><fillColor color="rgba(37, 99, 235, 1)"/></fill>
                </shape>
                <shape id="deco2" type="triangle" topLeftX="500" topLeftY="200" width="200" height="200">
                  <fill><fillColor color="rgba(220, 38, 38, 1)"/></fill>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["summary"]["error_count"], 0)
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("blank_slide", codes)

    def test_lint_xml_still_warns_for_sparse_slide_content_despite_full_bleed_background(self) -> None:
        # A plain textless shape now counts as "not blank" (see the test above), but a
        # full-bleed background rect must still NOT count toward sparse_slide_content's
        # meaningful-content coverage ratio -- otherwise every slide with a background would
        # trivially "pass" that density check.
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="background" type="rect" topLeftX="0" topLeftY="0" width="960" height="540"/>
                <shape id="text-1" type="text" topLeftX="60" topLeftY="80" width="200" height="30">
                  <content fontSize="14"><p>One short line</p></content>
                </shape>
                <shape id="text-2" type="text" topLeftX="500" topLeftY="180" width="200" height="30">
                  <content fontSize="14"><p>Another line</p></content>
                </shape>
                <shape id="text-3" type="text" topLeftX="60" topLeftY="310" width="200" height="30">
                  <content fontSize="14"><p>Third line</p></content>
                </shape>
                <shape id="text-4" type="text" topLeftX="500" topLeftY="410" width="200" height="30">
                  <content fontSize="14"><p>Fourth line</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertIn("sparse_slide_content", codes)

    def test_lint_xml_accepts_whitespace_around_attribute_equals_sign(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="visible" type="text" topLeftX = "80" topLeftY = "80" width = "300" height = "60">
                  <content><p>hello</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(result["slides"][0]["element_count"], 1)
        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertNotIn("blank_slide", codes)

    def test_lint_xml_reports_blank_slide_for_full_canvas_background_only(self) -> None:
        result = xml_lint.lint_xml(
            """
            <slide xmlns="https://www.larkoffice.com/sml/2.0">
              <data>
                <shape id="background" type="rect" topLeftX="0" topLeftY="0" width="960" height="540">
                  <fill><fillColor color="rgba(240, 235, 220, 1)"/></fill>
                </shape>
              </data>
            </slide>
            """
        )

        codes = [issue["code"] for issue in result["slides"][0]["issues"]]
        self.assertIn("blank_slide", codes)

    def test_has_similar_short_card_peer_ignores_invisible_peers(self) -> None:
        visible_card = {"kind": "shape", "type": "rect", "x": 0, "y": 0, "width": 300, "height": 100}
        ghost_1 = {
            "kind": "shape", "type": "rect", "x": 400, "y": 0, "width": 300, "height": 100, "alpha": 0,
        }
        ghost_2 = {
            "kind": "shape", "type": "rect", "x": 800, "y": 0, "width": 300, "height": 100, "alpha": 0,
        }

        self.assertFalse(
            xml_lint.has_similar_short_card_peer(
                visible_card, [visible_card, ghost_1, ghost_2]
            )
        )


SML_NAMESPACE = "https://www.larkoffice.com/sml/2.0"


class SxsdSyntaxTestCase(unittest.TestCase):
    def validate(self, xml: str) -> list[dict[str, object]]:
        result = xml_lint.lint_xml(xml)
        return [
            *result.get("issues", []),
            *(issue for slide in result["slides"] for issue in slide["issues"]),
        ]

    def assert_issue(
        self,
        issues: list[dict[str, object]],
        code: str,
        *,
        path: str | None = None,
        attr: str | None = None,
    ) -> dict[str, object]:
        for issue in issues:
            if issue.get("code") != code:
                continue
            if path is not None and issue.get("path") != path:
                continue
            if attr is not None and issue.get("attr") != attr:
                continue
            return issue
        self.fail(f"missing issue code={code!r} path={path!r} attr={attr!r}: {issues!r}")

    def assert_no_issue(self, issues: list[dict[str, object]], code: str) -> None:
        self.assertNotIn(code, [issue.get("code") for issue in issues])


class SxsdSyntaxAttributeTest(SxsdSyntaxTestCase):

    def test_xsd_pattern_translation_only_expands_whitespace_classes(self) -> None:
        self.assertEqual(
            sxsd_validator.python_pattern_for_xsd(r"\s+\S+\w+\d+"),
            "[ \\t\\n\\r]+[^ \\t\\n\\r]+\\w+\\d+",
        )

    def test_href_domain_pattern_does_not_use_backtracking_regex(self) -> None:
        pattern = r"[\w.-]+[.:]\S*"
        adversarial_value = ("a." * 20_000) + " "
        original_fullmatch = sxsd_validator.re.fullmatch
        translated_pattern = sxsd_validator.python_pattern_for_xsd(pattern)

        def reject_unsafe_pattern(candidate: str, value: str):
            if candidate == translated_pattern:
                raise AssertionError("href domain pattern must not use re.fullmatch")
            return original_fullmatch(candidate, value)

        with mock.patch.object(sxsd_validator.re, "fullmatch", side_effect=reject_unsafe_pattern):
            self.assertFalse(sxsd_validator.xsd_pattern_matches(pattern, adversarial_value))

    def test_href_domain_pattern_keeps_xsd_matching_behavior(self) -> None:
        pattern = r"[\w.-]+[.:]\S*"
        reference_pattern = sxsd_validator.re.compile(
            sxsd_validator.python_pattern_for_xsd(pattern)
        )

        for length in range(5):
            for characters in itertools.product("a.:-/ ©", repeat=length):
                value = "".join(characters)
                with self.subTest(value=value):
                    self.assertEqual(
                        sxsd_validator.xsd_pattern_matches(pattern, value),
                        reference_pattern.fullmatch(value) is not None,
                    )

    def test_accepts_valid_shape_attributes(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content textType="body"><p>Valid</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(issues, [])

    def test_reports_missing_required_shape_attribute(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data><shape type="text" topLeftX="10" topLeftY="20" width="300"/></data>
            </slide>
            """
        )

        issue = self.assert_issue(
            issues,
            "sxsd_missing_required_attr",
            path="slide/data/shape",
            attr="height",
        )
        self.assertEqual(issue["expected"], "required attribute of type PositiveSize")
        self.assertIsNone(issue["actual"])

    def test_reports_invalid_scalar_value(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="NaN" topLeftY="20" width="300" height="80"/>
              </data>
            </slide>
            """
        )

        issue = self.assert_issue(issues, "sxsd_invalid_scalar", attr="topLeftX")
        self.assertEqual(issue["actual"], "NaN")

    def test_rejects_python_only_numeric_separator(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="rect" topLeftX="1_0" topLeftY="20" width="300" height="80"/>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_invalid_scalar", attr="topLeftX")

    def test_accepts_xsd_double_lexical_forms(self) -> None:
        for top_left_x in ("10", "-0.5", ".5", "1.", "1e2"):
            with self.subTest(top_left_x=top_left_x):
                issues = self.validate(
                    f"""
                    <slide xmlns="{SML_NAMESPACE}">
                      <data>
                        <shape type="rect" topLeftX="{top_left_x}" topLeftY="20" width="300" height="80"/>
                      </data>
                    </slide>
                    """
                )

                self.assertEqual(issues, [])

    def test_accepts_bullet_char_length_boundaries(self) -> None:
        for bullet_char in ("A", "12345678"):
            with self.subTest(bullet_char=bullet_char):
                issues = self.validate(
                    f"""
                    <slide xmlns="{SML_NAMESPACE}">
                      <data>
                        <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                          <content bulletChar="{bullet_char}"><p>Text</p></content>
                        </shape>
                      </data>
                    </slide>
                    """
                )

                self.assertEqual(issues, [])

    def test_rejects_bullet_char_outside_length_boundaries(self) -> None:
        for bullet_char in ("", "123456789"):
            with self.subTest(bullet_char=bullet_char):
                issues = self.validate(
                    f"""
                    <slide xmlns="{SML_NAMESPACE}">
                      <data>
                        <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                          <content bulletChar="{bullet_char}"><p>Text</p></content>
                        </shape>
                      </data>
                    </slide>
                    """
                )

                self.assert_issue(issues, "sxsd_value_out_of_range", attr="bulletChar")

    def test_rejects_zero_size_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="0" height="80"/>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_value_out_of_range", attr="width")

    def test_reports_negative_size_rejected_by_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="-1" height="80"/>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_value_out_of_range", attr="width")

    def test_rejects_shape_enum_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="not-a-shape" topLeftX="10" topLeftY="20" width="300" height="80"/>
              </data>
            </slide>
            """
        )

        issue = self.assert_issue(issues, "sxsd_invalid_enum", attr="type")
        self.assertLess(len(str(issue["message"])), 300)
        self.assertEqual(issue["actual"], "not-a-shape")

    def test_rejects_rotation_upper_bound_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80" rotation="360"/>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_value_out_of_range", attr="rotation")

    def test_rejects_fill_color_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <style><fill><fillColor color="red"/></fill></style>
              <data/>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_pattern_mismatch", attr="color")

    def test_reports_missing_required_image_src(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data><img topLeftX="10" topLeftY="20" width="300" height="80"/></data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_missing_required_attr", attr="src")

    def test_accepts_inline_attribute_simple_type(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content><p><a href="https://example.com">Link</a></p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(issues, [])

    def test_reports_inline_attribute_pattern_mismatch(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content><p><a href="not a uri">Link</a></p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_pattern_mismatch", attr="href")

    def test_accepts_values_matching_inline_union_members(self) -> None:
        for bullet_size in ("25%", "100%", "400%", "6", "14", "400"):
            with self.subTest(bullet_size=bullet_size):
                issues = self.validate(
                    f"""
                    <slide xmlns="{SML_NAMESPACE}">
                      <data>
                        <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                          <content bulletSize="{bullet_size}"><p>Text</p></content>
                        </shape>
                      </data>
                    </slide>
                    """
                )

                self.assertEqual(issues, [])

    def test_rejects_values_outside_inline_union_members(self) -> None:
        for bullet_size in ("24%", "401%", "5", "401", "abc"):
            with self.subTest(bullet_size=bullet_size):
                issues = self.validate(
                    f"""
                    <slide xmlns="{SML_NAMESPACE}">
                      <data>
                        <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                          <content bulletSize="{bullet_size}"><p>Text</p></content>
                        </shape>
                      </data>
                    </slide>
                    """
                )

                self.assert_issue(issues, "sxsd_pattern_mismatch", attr="bulletSize")

    def test_rejects_symbol_outside_python_word_semantics_in_href(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content><p><a href="©:resource">Link</a></p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_pattern_mismatch", attr="href")

    def test_accepts_common_email_href_with_python_regex_semantics(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content><p><a href="mailto:user@example.com">Email</a></p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(issues, [])

    def test_accepts_common_gradient_with_python_regex_semantics(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <style>
                <fill>
                  <fillColor color="linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)"/>
                </fill>
              </style>
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content><p>Gradient</p></content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(issues, [])

    def test_rejects_non_xsd_whitespace_in_color_pattern(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <style><fill><fillColor color="rgb(1,\u00a02,3)"/></fill></style>
              <data/>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_pattern_mismatch", attr="color")

class SxsdSyntaxStructureTest(SxsdSyntaxTestCase):
    def test_accepts_nested_content_in_referenced_rich_text_shadow(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">
                  <content>
                    <p><span><shadow color="rgba(0, 0, 0, 1)"><strong>Text</strong></shadow></span></p>
                  </content>
                </shape>
              </data>
            </slide>
            """
        )

        self.assertEqual(issues, [])

    def test_keeps_shape_effect_shadow_as_childless_local_type(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data>
                <shape type="rect" topLeftX="10" topLeftY="20" width="300" height="80">
                  <shadow><strong>Not rich text</strong></shadow>
                </shape>
              </data>
            </slide>
            """
        )

        self.assert_issue(
            issues,
            "sxsd_unexpected_child",
            path="slide/data/shape/shadow/strong",
        )

    def test_accepts_standalone_slide_fragment_without_namespace(self) -> None:
        issues = self.validate(
            '<slide><data><shape type="text" topLeftX="10" topLeftY="20" width="300" height="80">'
            '<content><p>Text</p></content></shape></data></slide>'
        )

        self.assertEqual(issues, [])

    def test_rejects_presentation_without_namespace(self) -> None:
        issues = self.validate(
            '<presentation width="960" height="540"><slide/></presentation>'
        )

        self.assert_issue(issues, "sxsd_invalid_namespace", path="presentation")

    def test_rejects_wrong_namespace_that_violates_xsd(self) -> None:
        issues = self.validate('<slide xmlns="https://example.com/not-sml"><data/></slide>')

        self.assert_issue(issues, "sxsd_invalid_namespace", path="slide")

    def test_rejects_descendant_outside_document_namespace(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data xmlns="">
                <shape xmlns="{SML_NAMESPACE}" type="rect" topLeftX="10" topLeftY="20" width="300" height="80"/>
              </data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_invalid_namespace", path="slide/data")

    def test_rejects_unexpected_child_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <shape type="text" topLeftX="10" topLeftY="20" width="300" height="80"/>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_unexpected_child", path="slide/shape")

    def test_rejects_child_order_that_violates_xsd(self) -> None:
        issues = self.validate(
            f"""
            <presentation xmlns="{SML_NAMESPACE}" width="1920" height="1080">
              <slide/>
              <title>Late title</title>
            </presentation>
            """
        )

        self.assert_issue(issues, "sxsd_invalid_child_order", path="presentation/title")

    def test_enforces_presentation_slide_minimum_from_xsd(self) -> None:
        issues = self.validate(
            f'<presentation xmlns="{SML_NAMESPACE}" width="1920" height="1080"/>'
        )

        self.assert_issue(issues, "sxsd_missing_required_child", path="presentation")

    def test_enforces_presentation_slide_maximum_from_xsd(self) -> None:
        slides = "".join("<slide/>" for _ in range(101))
        issues = self.validate(
            f'<presentation xmlns="{SML_NAMESPACE}" width="1920" height="1080">{slides}</presentation>'
        )

        self.assert_issue(issues, "sxsd_too_many_children", path="presentation/slide")

    def test_rejects_multiple_choice_children_that_violate_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <style>
                <fill><fillColor/><fillImg src="token"/></fill>
              </style>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_too_many_children", path="slide/style/fill")

    def test_rejects_line_without_required_border_from_xsd(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data><line startX="0" startY="0" endX="100" endY="100"/></data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_missing_required_child", path="slide/data/line")

    def test_reports_missing_required_chart_structure(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data><chart topLeftX="0" topLeftY="0" width="300" height="200"/></data>
            </slide>
            """
        )

        self.assert_issue(issues, "sxsd_missing_required_child", path="slide/data/chart")

    def test_reports_missing_required_nested_sequence_child(self) -> None:
        issues = self.validate(
            f"""
            <slide xmlns="{SML_NAMESPACE}">
              <data><table topLeftX="0" topLeftY="0"><tr/></table></data>
            </slide>
            """
        )

        issue = self.assert_issue(issues, "sxsd_missing_required_child", path="slide/data/table/tr")
        self.assertEqual(issue["expected"], "td (at least 1)")


class SxsdSchemaModelTest(unittest.TestCase):
    def test_reports_unsupported_xsd_pattern_without_crashing(self) -> None:
        schema = rf"""
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                   xmlns:sml="{SML_NAMESPACE}"
                   targetNamespace="{SML_NAMESPACE}"
                   elementFormDefault="qualified">
          <xs:simpleType name="UnsupportedPatternType">
            <xs:union>
              <xs:simpleType>
                <xs:restriction base="xs:string"><xs:pattern value="[\S]"/></xs:restriction>
              </xs:simpleType>
              <xs:simpleType>
                <xs:restriction base="xs:string"><xs:pattern value="z+"/></xs:restriction>
              </xs:simpleType>
            </xs:union>
          </xs:simpleType>
          <xs:complexType name="SlideType">
            <xs:attribute name="value" type="sml:UnsupportedPatternType"/>
          </xs:complexType>
        </xs:schema>
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            schema_path = Path(temp_dir) / "schema.xsd"
            schema_path.write_text(schema, encoding="utf-8")
            try:
                issues = sxsd_validator.validate_sxsd(
                    ET.fromstring(f'<slide xmlns="{SML_NAMESPACE}" value="A"/>'),
                    schema_path,
                )
            except (ValueError, sxsd_validator.re.error) as error:
                self.fail(f"SXSD pattern capability errors must be reported, not raised: {error}")

        self.assertEqual([issue["code"] for issue in issues], ["sxsd_unsupported_pattern"])
        self.assertEqual(issues[0]["attr"], "value")
        self.assertIn("pattern interpreter", str(issues[0]["hint"]).lower())

    def test_standalone_slide_uses_slide_type_without_global_element(self) -> None:
        schema = f"""
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                   xmlns:sml="{SML_NAMESPACE}"
                   targetNamespace="{SML_NAMESPACE}"
                   elementFormDefault="qualified">
          <xs:complexType name="SlideType"><xs:sequence/></xs:complexType>
          <xs:complexType name="PresentationType">
            <xs:sequence><xs:element name="slide" type="sml:SlideType"/></xs:sequence>
          </xs:complexType>
          <xs:element name="presentation" type="sml:PresentationType"/>
        </xs:schema>
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            schema_path = Path(temp_dir) / "schema.xsd"
            schema_path.write_text(schema, encoding="utf-8")
            issues = sxsd_validator.validate_sxsd(
                ET.fromstring(f'<slide xmlns="{SML_NAMESPACE}"/>'),
                schema_path,
            )

        self.assertEqual(issues, [])

    def test_standalone_slide_requires_slide_type_in_xsd(self) -> None:
        schema = f"""
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                   xmlns:sml="{SML_NAMESPACE}"
                   targetNamespace="{SML_NAMESPACE}"
                   elementFormDefault="qualified">
          <xs:complexType name="PresentationType"><xs:sequence/></xs:complexType>
          <xs:element name="presentation" type="sml:PresentationType"/>
        </xs:schema>
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            schema_path = Path(temp_dir) / "schema.xsd"
            schema_path.write_text(schema, encoding="utf-8")
            issues = sxsd_validator.validate_sxsd(
                ET.fromstring(f'<slide xmlns="{SML_NAMESPACE}"/>'),
                schema_path,
            )

        self.assertEqual([issue["code"] for issue in issues], ["sxsd_unexpected_root"])


if __name__ == "__main__":
    unittest.main()


<a id="s-ee19803fba2dac88"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# slides (v1)

> 本技能文档较长，务必使用 Read 工具阅读两次，必须阅读完整全文。

## 权威经验

**权威经验是全局硬约束和高频易错点，必须牢记并严格遵守。**

- 你有充足的时间完成这个 PPT，质量永远比速度重要。
- PPT 的尺寸是 960x540，必须严格确保主体内容在页面边界内。
- !!!禁止交付无图产物!!! 必须使用大量图片增强视觉效果!!! 禁止重复使用同一张图!!!
- 封面页的主视觉必须是 `<img>`（来自生图工具或搜图工具），不要使用 `<shape>` 或 `<icon>` 拼出封面视觉。
- 禁止用 `<shape>` 和 `<line>` 拟形具体物项，必须使用生图工具生成的 `<img>`。
- 禁止在 `headline` 或 `title` 下方放置用于分隔或装饰的 `rect` 或 `<line>`。
- 禁止在任何页面内部使用无意义的装饰线条或色块条带，页面任何一边都不要使用贴边窄条。
- 生图工具的指令参数必须以“不要出现任何文字和颜色色号”结尾，避免生成的图片上出现干扰文字。
- 禁止使用 emoji 图标，任何位置都不能出现。
- 字号必须显式设置 `<content>` 的 `fontSize` 属性，不要依赖 `textType` 的默认字号兜底，这些兜底值明显偏大。
- 大数字、字号大或字数多的 `<content>` 必须设置 `wrap="true" autoFit="normal-auto-fit"` 属性自动换行和缩排，避免文字溢出。
- 文字颜色必须用 `<content>` 的 `color` 属性而不是 `fontColor` 属性。
- 文字行间距必须设置 `<content>` 的 `lineSpacing="multiple:xx"` 或 `lineSpacing="fixed:xx"` 而不是 `lineSpacing="xx"`。
- 图片必须用 `<img>` 而不是 `<image>`。
- IconPark 图标必须填充颜色（设置 `<fill><fillColor color="rgba(R,G,B,A)"/></fill>`）并和背景有足够对比。
- 绘制图表时原生图表（柱状、条形、折线、面积、饼（环）、雷达、组合图）用 `<chart>`，其他（漏斗图、金字塔图、象限图、矩阵图等）用 `<shape>` + `<line>` 模拟。
- 隐藏 `<chart>` 的图例只能通过不写或删除 `<chartLegend>` 实现，`<chartLegend>` 不支持 `position="none"`。
- 表格优先用 `rect` 和 `text` 模拟，其他用 `<table>`，没有 `<shape type="table">`。
- 必须设置 `<table>` 的 `width` 和 `height` 固定表格大小，同时设置需要保留列宽或行高的 `<col>` 的 `width` 和 `<tr>` 的 `height`，其余自动分配。
- `<td>` 直接子元素只有 `<fill>`（背景）、`<content>`（文字）和边框配置（一般不用），不能嵌套 `<shape>`、`<img>`、`<icon>`。
- `<shape type="rect">` 只是形状不是容器，`<icon>`、`<img>`、`<shape type="text">` 和其他 `<shape>` 必须与它平级靠坐标叠放。
- 填充渐变颜色必须用 `<fill><fillColor color="linear-gradient(135deg, rgba(R,G,B,A) 0%, rgba(R,G,B,A) 100%)"/></fill>`。
- 编辑页面前必须阅读 [`workflow/slides-editing.md`](lark-slides-0.md#s-741dd493d62520a5)。
- 绘制图表前必须阅读 [`xml/slides_chart_demo.xml`](../assets/lark-slides/references/xml/slides_chart_demo.xml)。
- 当用户要求无损复述历史上下文时，必须无损复述以上权威经验、必读的技能文档（需要重新阅读）和易错元素语法（尤其是 `<table>` 和 `<chart>`）。

## 豆包设计原则

适用范围：

- 普通内容页的设计必须以豆包设计原则为最高准则，除非用户要求使用模板或直接提供设计方案。
- 不适用于 `title-cover`、`section-divider`、`conclusion`、`quote-highlight` 和 `big-number`。

核心要求：

- 必须采用信息密度极高的图文卡片布局，追求充实饱满、图文丰富、可逐行细读的版面，宁可密而满，不要空而疏。
- **!!!信息密度极高!!! 图多!!! 卡多!!! 字多!!!**

排版布局：

- 卡片布局：卡片按多行网格铺满页面，版面对称、均衡、不留白。网格数、图文比例按内容变化，避免每页雷同。使用更多卡片做细分承载，避免在单张卡片里堆砌大量文字（例如 8 张 50 字卡片优于 2 张 200 字卡片），多个要点必须拆分为多张子卡片。
- 卡片样式：方角卡片 + 半透明填充 + 无边框 + 卡片贴边窄条（可选）；所有卡片必须使用相同的配色方案（少量需强调的卡片除外），禁止同页出现彩虹卡片（卡片颜色超过 3 种）。
- 卡片结构：视觉锚点（关键词、编号或 IconPark 图标）+ 标题 + 内容（包括文字、图片、图表、子卡片）。
- 文字卡片：多数页面必须满足 6-8 张文字卡片、200-400 文字数量，字数不足时必须扩写成长句或段落，文字卡片不要留白，必须充实饱满。文字卡片不是短标签，而是“标题 + 完整说明”，像浓缩的分析文稿。文字内容不得不用列表、分栏、关键词或短句时，必须保证层次清晰，更建议拆分为多张子卡片。
- 图片卡片：多数页面必须满足 1-3 张图片卡片，缺少图片时必须用生图工具补充配图，图片卡片与文字卡片组成网格，确保图文丰富。
- 图表卡片：数据信息不要在文字卡片中罗列，必须在图表卡片中可视化（包括表格、图表、时间线、流程图等），图表卡片与其他卡片组成网格，展现数据驱动。
- 间距要求：所有边距都要左右对称，页面和内部内容的边距至少 40px（内容不要贴边），卡片和内部文字的边距至少 5px（文字不要贴边），卡片之间保持 20-40px 的间距。
- 文字对齐：正文默认左对齐，只在封面、结尾或大号数字场景中使用居中；表格里的文字左对齐、数字右对齐、仅关键词或短句时居中对齐。

视觉风格：

- 美学：干净、明亮、清爽但信息饱满；靠卡片和对齐网格在高密度下维持秩序感；同排卡片文字数量应相近以保持观感整齐。
- 字体：全篇以无衬线体（思源黑体）为主，封面或关键强调可少量使用衬线体。
- 字号：标题 28-36pt、正文 12-14pt、注释 10-12pt，常规关键指标 16-32pt、核心指标用 36-52pt 数字，下面配 10-14pt 标签与简短解读，需要容纳更多文字时允许使用更小的字号。
- 图标：内嵌 IconPark 图标（可用关键词或编号替代）作为视觉锚点，让高密度文字也有图形节奏，而不是成片纯文字块。
- 配色：克制颜色数量，确保所有页面都只使用同样的 1 个背景色（偏好浅米白）、1 个主色、1 个强调色和 1 个辅助色；偏好莫兰迪配色，禁止彩虹配色（比如蓝配橙）。

## Quick Reference

**本表只定位「场景 → 用哪条命令、读哪份文档」。参数以「执行前必做」里对应的文档和 `lark-cli slides +<verb> --help` 为准，不要凭记忆或按别的命令类比补参数。**

| 用户需求 | 优先动作 | 关键文档 / 命令 |
|----------|----------|-----------------|
| 新建 PPT | 先规划 `slide_plan.json`，再按页数选择一步或两步创建 | `planning-layer.md`、`visual-planning.md`、`asset-planning.md`、`cli/lark-slides-create.md`、`slides +create`、`slides +add-slide`、`cli/lark-slides-add-slide.md`（两步创建逐页添加） |
| 用户要求使用模板，或提供 PPTX 文件要求修改、美化 | 将模板导入为 Slides 再编辑 | `workflow/template-editing.md` |
| 编辑单个标题、文本块、图片或局部元素 | 块级替换/插入，**只动点名的 block，同页其他元素不受影响**；不改页序 | `slides +replace-slide`、`cli/lark-slides-replace-slide.md` |
| 一页改动很多（批量字体/配色）、要改页面背景、要删掉若干元素 | 整页覆盖，`slide_id` 和页序不变；带原 `id` 写回的元素保留 id，不带 `id` 的会作为新元素插入并拿到新 id；**代价是没写进 `--content` 的元素会被删除，所以改个别元素不要用它** | `slides +update-slide`、`lark-slides-update-slide.md` |
| 给已有 PPT 追加或插入页面 | 一次一页，`--slide` 支持 `@file` 绕开 shell 转义 | `slides +add-slide`、`cli/lark-slides-add-slide.md` |
| 删除页面 | 按 `slide_id` 单页删除，删前先回读确认 | `slides +delete-slide`、`cli/lark-slides-delete-slide.md` |
| 读取或分析已有 PPT | 解析 slides/wiki token，用 shortcut 回读全文或单页 XML，保存 `xml_presentation_id`、`slide_id`、`revision_id` | `slides +xml-get`（单页传 `--slide-id` 或 `--slide-number`）、`cli/lark-slides-xml-presentations-get.md` |
| 查看或回滚历史版本 | 先用 `+history-list` 找 `history_version_id`，再 `+history-revert`，必要时 `+history-revert-status` 轮询 | [`cli/lark-slides-history.md`](lark-slides-0.md#s-5cc060a534022d87) |
| 获取幻灯片页面截图 | 按页码用 `--slide-number`，按 ID 用 `--slide-id`；单张用 `--output`，批量或全量用 `--output-dir`，每批最多 10 页串行执行；截图目录复用同一任务的 deck/task 标识，后续读取返回的实际路径 | `slides +screenshot`、`cli/lark-slides-screenshot.md` |
| 下载图片 | `--output` 选填；传入时指定单个文件路径，未传时自动保存到默认目录 `.lark-slides/media`，并按响应文件名/类型生成路径；调用后读取返回的 `path`，不要猜测文件名；直连被拒时自动回退到源文件预览 | `slides +media-download --file-token <file_token>` |
| 上传或使用图片 | 先上传为 `file_token`，禁止直接写 http(s) 外链 | `slides +media-upload`、`cli/lark-slides-media-upload.md`，或 `+create --slides` 的 XML 里写 `<img src="@./path">` 占位符 |
| 绘制图表 | 原生图表（柱状、条形、折线、面积、饼（环）、雷达、组合图）用 `<chart>`，其他（漏斗图、金字塔图、象限图、矩阵图等）用 `<shape>` + `<line>` 模拟 | `xml/xml-schema-quick-ref.md`、`xml/slides_chart_demo.xml` |
| 绘制表格 | 优先用 `rect` 和 `text` 模拟，其他用 `<table>` | `xml/xml-schema-quick-ref.md` |
| 使用图标 | 禁止盲猜 iconType，必须先检索 IconPark，再写 `<icon iconType="...">`，图标必须填充颜色并和背景有足够对比，禁止使用 emoji 图标 | `iconpark_tool.py search → resolve`、`xml/iconpark.md` |
| 创建失败、空白页、3350001、布局异常 | 先回读状态，再按排障清单修复，不假设原操作原子成功 | `workflow/error-handling.md`、`workflow/validation-xml.md` |

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），认证、权限和全局参数均以 lark-shared 为准。**

**CRITICAL — 查看或回滚历史版本前，MUST 先读取 [`cli/lark-slides-history.md`](lark-slides-0.md#s-5cc060a534022d87)。回滚接口只接受 `history_version_id`，不要把 `revision_id` 直接传给 `+history-revert`。**

**CRITICAL — 生成任何 XML 之前，MUST 先用 Read 工具读取 [xml/xml-schema-quick-ref.md](lark-slides-0.md#s-5c0e180adc0fc634)，禁止凭记忆猜测 XML 结构。**

**CRITICAL — 新建演示文稿或大幅改写页面时，MUST 先生成 `.lark-slides/plan/<deck-or-task-id>/slide_plan.json`，再生成 XML。先创建对应目录，规划层规则和中间产物生命周期见 [planning-layer.md](lark-slides-0.md#s-f217c09d017c35e5)。仅替换一个标题、插入一个块等小型已有页编辑可豁免。**

**CRITICAL — 新建演示文稿或大幅改写页面时，生成 XML 前 MUST 读取 [visual-planning.md](lark-slides-0.md#s-8a29c841ba6ccca9)，确保 `layout_type`、`visual_focus`、`text_density` 实际改变页面几何、主视觉和文本量。**

**CRITICAL — 新建演示文稿或大幅改写页面时，规划 `asset_need` MUST 遵循 [asset-planning.md](lark-slides-0.md#s-7a879f9a89239810)：只做元数据规划，必须有 `fallback_if_missing`，不得要求真实搜索、下载或上传素材。**

**CRITICAL — 将完整 `<slide>` XML 提交给 `slides +create`、`slides +add-slide` 或 `slides +update-slide` 之前，MUST 先把待提交 XML 保存到本地文件并运行唯一版式准出入口 [`scripts/xml_lint.py`](../assets/lark-slides/scripts/xml_lint.py)；`summary.error_count` 必须为 0 才能调用接口。**

**CRITICAL — 创建、大幅改写或整页写回后，MUST 按 [workflow/validation-xml.md](lark-slides-0.md#s-4a72cbe8eec0b655) 做显式验证：回读全文 XML、核对页数和关键元素，并使用 [`scripts/xml_lint.py`](../assets/lark-slides/scripts/xml_lint.py) 统一检查 XML、越界、重叠、空白页和内容稀疏风险。**

**CRITICAL — 创建前自检或失败排障时，MUST 按 [workflow/error-handling.md](lark-slides-0.md#s-91d349f39b2cd412) 检查 XML 转义、结构、shell 截断、图片 token、3350001 和布局风险。**

**编辑已有幻灯片页面**：单个标题、文本块、图片或局部元素优先用 [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f)（块级替换/插入，不动页序）；一页里改动很多（例如批量换字体）、要改背景、或要删掉若干元素时用 [`+update-slide`](lark-slides-0.md#s-d59026b95d949611) 整页覆盖（`slide_id` 和页序不变，但没写进 `--content` 的元素会被删除）；**多页大改就对每一页各跑一次 `+update-slide`**。选择 action 和完整读-改-写流程见 [`workflow/slides-editing.md`](lark-slides-0.md#s-741dd493d62520a5)。

**用户要求使用模板**：按 [workflow/template-editing.md](lark-slides-0.md#s-f749479c8d9360a8) 处理。

## 身份选择

飞书幻灯片通常是用户自己的内容资源。**默认应优先显式使用 `--as user`（用户身份）执行 slides 相关操作**，始终显式指定身份。

- **`--as user`（推荐）**：以当前登录用户身份创建、读取、管理演示文稿。执行前先完成用户授权：

```text
lark-cli auth login --domain slides
```

- **`--as bot`**：仅在用户明确要求以应用身份操作，或需要让 bot 持有/创建资源时使用。使用 bot 身份时，要额外确认 bot 是否真的有目标演示文稿的访问权限。

**执行规则**：

1. 创建、读取、增删 slide、按用户给出的链接继续编辑已有 PPT，默认都先用 `--as user`。
2. 如果出现权限不足，先检查当前是否误用了 bot 身份；不要默认回退到 bot。
3. 只有在用户明确要求"用应用身份 / bot 身份操作"，或当前工作流就是 bot 创建资源后再做协作授权时，才切换到 `--as bot`。

## 执行前必做

> **重要**：`references/xml/slides_xml_schema_definition.xml` 是此 skill 唯一正确的 XML 协议来源；其他 md 仅是对它和 CLI schema 的摘要。

高频只读：

- [xml/xml-schema-quick-ref.md](lark-slides-0.md#s-5c0e180adc0fc634)
- [planning-layer.md](lark-slides-0.md#s-f217c09d017c35e5)（新建 / 大幅改写）
- [visual-planning.md](lark-slides-0.md#s-8a29c841ba6ccca9)（新建 / 大幅改写）
- [asset-planning.md](lark-slides-0.md#s-7a879f9a89239810)（新建 / 大幅改写）
- [workflow/validation-xml.md](lark-slides-0.md#s-4a72cbe8eec0b655)（创建 / 大幅改写后）

调用相关命令前必须读取相关的文档以了解命令的使用方式：

- 创建：[`cli/lark-slides-create.md`](lark-slides-0.md#s-2dc9fd2b0e0f4d9a)、[`cli/lark-slides-add-slide.md`](lark-slides-0.md#s-781503ce17b301f7)（逐页添加 / 给已有 PPT 追加页面）
- 删除页面：[`cli/lark-slides-delete-slide.md`](lark-slides-0.md#s-daa81361dc1abfe2)
- 阅读：[`cli/lark-slides-xml-presentations-get.md`](lark-slides-0.md#s-cc7a42f8bd992b15)
- 编辑：[`workflow/slides-editing.md`](lark-slides-0.md#s-741dd493d62520a5)、[`cli/lark-slides-replace-slide.md`](lark-slides-0.md#s-de7059cb8c77747f)、[`lark-slides-update-slide.md`](lark-slides-0.md#s-d59026b95d949611)
- 历史版本：[`cli/lark-slides-history.md`](lark-slides-0.md#s-5cc060a534022d87)
- 截图：[`cli/lark-slides-screenshot.md`](lark-slides-0.md#s-6b365928e39b6922)
- 图片：[`cli/lark-slides-media-upload.md`](lark-slides-0.md#s-0a4a00cc57a24b7b)
- 图表：[`xml/slides_chart_demo.xml`](../assets/lark-slides/references/xml/slides_chart_demo.xml)
- 图标：[`xml/iconpark.md`](lark-slides-0.md#s-0952eb4744ad31ed)、[`scripts/iconpark_tool.py`](../assets/lark-slides/scripts/iconpark_tool.py)
- 排障：[`workflow/error-handling.md`](lark-slides-0.md#s-91d349f39b2cd412)
- 完整协议：[`xml/slides_xml_schema_definition.xml`](../assets/lark-slides/references/xml/slides_xml_schema_definition.xml)


## Workflow

### Design Ideas

不要生成无设计感的幻灯片。纯白背景 + 标题 + bullets 只能作为极简临时稿，不能作为正式交付。

开始写 XML 前，先在 `slide_plan.json` 里确定 deck 级视觉策略：

- **主题化配色**：配色必须服务本次主题、行业和受众，不要默认蓝色商务风。如果把同一套颜色换到另一个完全不同主题仍然成立，说明配色不够具体。
- **主次比例**：选择 1 个主色承担约 60-70% 视觉权重，1 个辅助色承担结构和分区，1 个强调色只用于关键数字、结论或行动点。不要让所有颜色权重相同。
- **背景一致性**：先确定全 deck 的背景策略，默认保持同一明暗基调和底色体系；无论深浅，都要保证内容和背景对比充足。
- **统一 motif**：选择一个可复用视觉母题贯穿全文，例如编号节点、卡片处理方式、半出血图片区域、标题、页脚。不要每页换一套装饰语言。

每页至少要有一个视觉元素：图片、图标、图表、表格、流程、对比结构或大号数字。文本框本身不算主视觉。

常见页面形态：

- **双栏结构**：左文右图或左图右文，视觉区域占 35-45% 宽度。
- **图标行**：图标在色块或圆形底中，右侧是短标题和一句解释。
- **网格**：适合能力、模块、风险、行动项，每格内容保持同等层级。
- **半出血视觉**：图片占据左/右半屏，文字覆盖或贴边排布。
- **大数字卡片**：核心指标用大数字，下面配标签与简短解读。
- **对比列**：before/after、方案 A/B、问题/解法用左右并列，标题和基线严格对齐。
- **时间线/流程图**：步骤用节点和箭头表达，流程方向必须一眼可见。

常见错误必须避免：

- 不要所有页面复用同一种标题 + 三 bullets 版式。
- 不要用低对比文字或低对比图标，例如浅灰字压在浅色背景上。
- 不要让装饰线穿过文字，或让页脚、来源、编号挤压主体内容。
- 不要把素材缺失表现为空白图片框；必须按 `fallback_if_missing` 生成替代图片。
- 不要在任何位置使用 emoji 图标。


### 生成流程

```text
Step 1: 需求分析 & 读取知识
  - 分析主题、受众、页数、风格；
  - 若用户要求使用模板，按 workflow/template-editing.md 处理
  - 读取 xml/xml-schema-quick-ref.md；新建 / 大幅改写时还要读取 planning-layer.md、visual-planning.md、asset-planning.md
  - 涉及图表读取 xml/slides_chart_demo.xml

Step 2: 生成大纲 → 写入 slide_plan.json
  - 生成结构化大纲
  - 新建 / 大幅改写必须先创建目录并写入 `slide_plan.json`
  - plan 字段、路径命名和 `asset_need` 结构按 planning-layer.md / asset-planning.md 执行

Step 3: 按 slide_plan.json 生成 XML → 创建
  - 逐页消费 plan：key_message 定主结论，layout_type 定几何，visual_focus 定主视觉，text_density 定文本量
  - 缺少真实素材时必须用 `fallback_if_missing` 生成替代图片，不要留空
  - 读 cli/lark-slides-create.md 定一步创建还是两步创建，并据此构造 `slides +create`；两步创建再读 cli/lark-slides-add-slide.md 用 `+add-slide` 逐页添加
  - 图片按 cli/lark-slides-media-upload.md 处理；复杂 XML、转义和 3350001 排查按 workflow/error-handling.md 执行

Step 4: 审查 & 交付
  - 创建完成后，必须用 `slides +xml-get --presentation <xml_presentation_id>` 读取全文 XML，并按 workflow/validation-xml.md 做显式验证记录，包括 XML 文本重叠检查
  - 失败或部分成功按 workflow/error-handling.md 处理；局部问题优先用 `+replace-slide` 修正
  - 没问题 → 交付：使用 NotifyHuman 工具交付 PPT 链接
```

> 渐变色必须使用 `rgba()` 格式并带百分比停靠点，如 `linear-gradient(135deg,rgba(15,23,42,1) 0%,rgba(56,97,140,1) 100%)`。使用 `rgb()` 或省略停靠点会导致服务端回退为白色。

### 大纲模板

生成大纲时使用以下格式：

```text
[PPT 标题] — [定位描述]，面向 [目标受众]

页面结构（N 页）：
1. 封面页：[标题文案]
2. [页面主题]：[要点1]、[要点2]、[要点3]
3. [页面主题]：[要点描述]
...
N. 结尾页：[结尾文案]

风格：[配色方案]，[排版风格]
```

## 核心概念

### URL 格式与 Token

| URL 格式 | 示例 | Token 类型 | 处理方式 |
|----------|------|-----------|----------|
| `/slides/` | `https://example.larkoffice.com/slides/xxxxxxxxxxxxx` | `xml_presentation_id` | URL 路径中的 token 直接作为 `xml_presentation_id` 使用 |
| `/wiki/` | `https://xxx.feishu.cn/wiki/wikcn_EXAMPLE_NODE_TOKEN_123456` | `wiki_token` | ⚠️ **不能直接使用**，需要先查询获取真实的 `obj_token` |

> 带 `--presentation` 的 slides shortcut 会自动解析以上两种 URL。

### Wiki 链接特殊处理（关键！）

知识库链接（`/wiki/TOKEN`）不能直接当 `xml_presentation_id`。使用 Slides shortcut 时直接传入链接，CLI 会查询节点、校验 `data.obj_type == "slides"` 并使用 `data.obj_token`。

```text
lark-cli wiki +node-get --node-token 'https://xxx.feishu.cn/wiki/wikcn_EXAMPLE_NODE_TOKEN_123456' --as user --format json
```

节点解析必须与后续 Slides 操作使用相同身份；下游明确使用 `--as bot` 时，这里也改为 `--as bot`。

带 `--presentation` 的 slides shortcut 都会自动解析 `/wiki/` URL 并校验 `obj_type`。

### 资源关系

```text
Wiki Space (知识空间)
└── Wiki Node (知识库节点, obj_type: slides)
    └── obj_token → xml_presentation_id

Slides (演示文稿)
├── xml_presentation_id (演示文稿唯一标识)
├── revision_id (版本号)
└── Slide (幻灯片页面)
    └── slide_id (页面唯一标识)
```

## Shortcuts

Slides 相关操作使用 shortcut（`lark-cli slides +<verb> [flags]`）。

| Shortcut | 说明 |
|----------|------|
| [`+create`](lark-slides-0.md#s-2dc9fd2b0e0f4d9a) | 创建 PPT，可选一步添加页面 |
| [`+add-slide`](lark-slides-0.md#s-781503ce17b301f7) | 向已有演示文稿追加或插入**一页**（`--before-slide-id` 控制位置），XML 支持 `@file` / stdin，`<img src="@./path">` 占位符自动上传 |
| [`+delete-slide`](lark-slides-0.md#s-daa81361dc1abfe2) | 按 `slide_id` 删除**一页** |
| [`+xml-get`](lark-slides-0.md#s-cc7a42f8bd992b15) | 读取全文或单页 XML；用 `--presentation` 指定演示文稿，单页传 `--slide-id` 或 `--slide-number`；用 `--output` 把 XML 存到本地文件（必须是 CWD 内的相对路径，如 `.lark-slides/plan/<deck>/readback.xml`） |
| [`+screenshot`](lark-slides-0.md#s-6b365928e39b6922) | 把幻灯片页面截图保存为本地图片；用 `--slide-number` 指定页码（从 1 开始，多页重复传入）或用 `--slide-id` 指定页面；单张用 `--output .lark-slides/screenshots/<deck-or-task-id>/page-01`，批量用 `--output-dir .lark-slides/screenshots/<deck-or-task-id>`（一次最多 10 页）；后续必须读取返回的 `output` / `screenshots[].path` |
| [`+media-upload`](lark-slides-0.md#s-0a4a00cc57a24b7b) | 上传本地图片到指定演示文稿，返回 `file_token`（用作 `<img src="...">`），最大 20 MB |
| `+media-download` | 根据 Slides 图片 `file_token` 下载本地图片；`--output` 选填，未传时使用 `--output-dir` 默认值 `.lark-slides/media` 并自动生成文件名；调用后使用返回的 `path`，不要猜测实际路径；直连下载无权限时自动回退到源文件预览 |
| [`+replace-slide`](lark-slides-0.md#s-de7059cb8c77747f) | 对已有幻灯片页面进行块级替换/插入（`block_replace` / `block_insert`），自动注入 id 和 `<content/>`，不改变页序 |
| [`+update-slide`](lark-slides-0.md#s-d59026b95d949611) | 把一整页 XML 交给已有页面，页面变成 `--content` 描述的样子；能一次改样式/插入/删除/备注/背景，`slide_id` 和页序不变。**没写进 `--content` 的元素会被删除** |

本 skill 已覆盖的 Slides 操作必须使用上表 shortcut；执行前读取对应 reference，按其中参数和约束执行。

## 核心规则

1. **先规划再写 XML**：新建演示文稿或大幅改写页面时，必须先写入 `.lark-slides/plan/<deck-or-task-id>/slide_plan.json`；模板、风格和大纲只能作为规划输入，不能绕过规划层
2. **创建流程**：新建演示文稿用 `slides +create`，一步创建还是两步创建按 [`cli/lark-slides-create.md`](lark-slides-0.md#s-2dc9fd2b0e0f4d9a) 判断
3. **`<slide>` 直接子元素只有 `<style>`、`<data>`、`<note>`**：文本和图形必须放在 `<data>` 内
4. **文本通过 `<content>` 表达**：必须用 `<content><p>...</p></content>`，不能把文字直接写在 shape 内；不要混淆 XML 元素 `<content>` 和 `--parts` 的 JSON 字段：编写 `--parts` 时，`block_replace` 装载 XML 使用标准字段 `replacement`，`block_insert` 使用 `insertion`
5. **保存关键 ID**：后续操作需要 `xml_presentation_id`、`slide_id`、`revision_id`
6. **删除谨慎**：删除不可逆，删前先回读确认 `slide_id`
7. **编辑已有页面优先原链接更新**：修改单个 shape/img 用 `+replace-slide`（`block_replace` / `block_insert`），不要整页重建；一页改动很多或要改背景用 `+update-slide` 整页覆盖（保 `slide_id` 和页序），多页整页重建就对每一页各跑一次 `+update-slide`，不要用 `slides +create` 新建整份 PPT；追加/插入单页用 `+add-slide`、删除单页用 `+delete-slide`
8. **`<img src>` 只能用上传到飞书 drive 的 `file_token`，禁止使用 http(s) 外链 URL**：飞书 slides 渲染端不会代理外链图片，外链 src 在 PPT 里通常不显示或显示破图。流程必须是「先把图存到本地 → 用 `slides +media-upload` 上传，或在 `+create --slides` 的 XML 里写 `<img src="@./path">` 占位符自动上传 → 拿 `file_token` 写进 `<img src>`」。如果用户给了网图链接，先 `curl`/下载到 CWD 内再走上传流程，不要直接把外链 URL 塞进 `src`。**图片最大 20 MB**（媒体上传不支持分片）。

> **注意**：如果 md 内容与 `xml/slides_xml_schema_definition.xml` 不一致，以后者为准。
