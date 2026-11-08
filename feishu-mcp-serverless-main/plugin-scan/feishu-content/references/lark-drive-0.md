<a id="s-c99c77320f67806c"></a>

## SKILL.md


# drive

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先取得真实文件 token、文件类型与目标文件夹 token，再读相应 schema。复制使用服务端 copy；不要 fetch 后重建导致评论、权限和历史丢失。移动时保留源 token，并核对目标目录。

2. 权限变更先读现状，只调整用户指定成员和范围；评论、回复和 reaction 使用其各自 ID，不用正文块工具代替。

3. 导入导出按 创建任务→查询任务→取得结果→实际下载 的状态推进。任务 ID 或下载 URL 不是文件已保存；遇到失败/部分成功，报告 task_id 和已完成部分。

4. 文件工具传真实文件内容或服务明确支持的文件引用，不把用户电脑路径发送给云函数。读取 multipart schema 的文件字段时使用 filename、mime_type、base64；超出工具大小上限先说明具体限制。

5. 原生 Markdown 文件与 Docx 分开识别。上传分片只有 prepare/finish 而没有传输工具时不能声称闭环完成。

## 按需参考

- [工具与合同](lark-drive-0.md#s-4e8deadf354189d0)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-drive-0.md#s-69fe0d064273f97c)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。

旧名或旧流程细节仍需要时，读取[兼容参考](lark-drive-0.md#s-0ee3a82b3d5ae99b)。


<a id="s-4269ef838ed9b0ae"></a>

## references/baseline/references/lark-drive-comments-guide.md

> 旧版本业务参考；接口参数必须重新核对当前 MCP schema。

# Drive 评论查询、统计与回复指南

> 前置条件：先阅读 [`../SKILL.md`](lark-drive-0.md#s-c99c77320f67806c) 的“评论能力入口”，添加评论参数细节见 [`lark-drive-add-comment.md`](lark-drive-0.md#s-eec2b5c15e43279d)，获取评论列表优先使用 [`lark-drive-list-comments.md`](lark-drive-0.md#s-1d2de165cd3c3e19)，reaction 见 [`lark-drive-reactions.md`](lark-drive-0.md#s-d0ccd3f6a04918f3)。

## 评论模式

- `drive +add-comment` 支持全文评论和局部评论。
- 全文评论：未传 `--block-id` 时默认启用，也可显式传 `--full-comment`；支持 `docx`、旧版 `doc` URL、白名单扩展名的 Drive file，以及最终解析为 `doc` / `docx` / `file` 的 wiki URL。
- 局部评论：传 `--block-id` 时启用；`docx` 支持文本定位或 block id，`sheet` 支持 `<sheetId>!<cell>`，`slides` 支持 `<slide-block-type>!<xml-id>`，wiki URL 解析到这些类型时也支持对应局部评论。
- Drive file 只支持全文评论，不支持局部评论。支持扩展名：`.md`、`.txt`、`.json`、`.csv`、`.go`、`.js`、`.py`、`.pptx`、`.png`、`.jpg`、`.jpeg`、`.zip`、`.mp3`、`.mp4`。`.pdf`、`.docx`、`.xlsx` 等未在白名单内的普通文件暂不支持。
- Review / 审阅 / 校对 / 逐条指出问题场景优先使用局部评论，不要把多个可定位问题汇总成一条全文评论。
- `drive +add-comment` 的 `--content` 需要传 `reply_elements` JSON 数组字符串，例如 `--content '[{"type":"text","text":"正文"}]'`。
- `slides` 评论要求显式传 `--block-id <slide-block-type>!<xml-id>`；CLI 会将其拆分后写入 `anchor.block_id` 和 `anchor.slide_block_type`。其中 `<xml-id>` 是 PPT XML 协议中的元素 `id`；不支持 `--selection-with-ellipsis` 和 `--full-comment`。
- 评论写入内容里的文本不能直接出现 `<`、`>`；提交前应转义为 `&lt;`、`&gt;`。`drive +add-comment` 会对 `type=text` 文本元素自动兜底转义；直接调用原生评论 API 时需要自行转义。
- 如果 wiki 解析后不是 `doc` / `docx` / `file` / `sheet` / `slides`，不要用 `+add-comment`。

## 查询默认口径

优先使用 `drive +list-comments`，不要优先手写 `drive file.comments list`。shortcut 默认 `--solved-status false`，即仅查询未解决评论。即使用户说“所有评论”“全部评论”“把评论都列出来”，只要没有明确提到包含已解决评论，仍然按默认口径查询未解决评论；仅当用户明确要求包含已解决评论时，才传 `--solved-status all`。只查已解决评论时传 `--solved-status true`。

```text
# 默认查询：仅未解决评论
lark-cli drive +list-comments --url '<DOC_URL>'

# 全部评论：包含已解决和未解决
lark-cli drive +list-comments --url '<DOC_URL>' --solved-status all

# 已解决评论
lark-cli drive +list-comments --url '<DOC_URL>' --solved-status true

# 裸 wiki token
lark-cli drive +list-comments --token '<WIKI_TOKEN>' --type wiki

```

## 评论卡片与统计

- `drive file.comments list` 返回的 `items` 是评论卡片列表，每个 `item` 对应用户界面中的一张评论卡片，不是平铺的互动消息列表。
- 创建第一条评论时会同时创建该卡片里的第一条 reply；真正承载正文的是 `item.reply_list.replies`，其中第一条 reply 在用户视角下就是这张卡片里的“评论本身”。
- 统计“评论数”或“评论卡片数”：统计 `items` 长度；全量统计时对所有分页返回的 `items` 长度累加。
- 统计“回复数”：统计所有 `item.reply_list.replies` 长度之和，再减去 `items` 长度。
- 统计“总互动数”：统计所有 `item.reply_list.replies` 长度之和，包含每张评论卡片里的首条评论。
- 如果 `item.has_more=true`，说明该评论卡片下还有更多回复未包含在当前返回中；需要继续调用 `drive file.comment.replys list` 拉全后，再做全量回复数或总互动数统计。

## 排序

- 只有当用户明确提到“最新评论”“最后评论”“最早评论”时，才需要按 `create_time` 排序。
- 排序前必须拉完所有评论分页，不能只取第一页。
- “最新评论”/“最后评论”：按 `create_time` 降序取第一条。
- “最早评论”：按 `create_time` 升序取第一条。
- 用户只说“第一条评论”时，直接使用 `drive file.comments list` 返回的第一条，不需要额外排序。

## 回复限制

- 回复前先检查目标评论状态。
- `is_whole=true` 的全文评论不支持回复；遇到时提示“全文评论不支持回复”。
- `is_solved=true` 的已解决评论不支持回复；遇到时提示“该评论已被解决，无法回复”。
- 当目标评论不能回复时，只提示限制，不要自动替用户寻找其他可回复评论。

## batch_query 与 list

- `drive file.comments batch_query` 用于已知评论 ID 后的批量查询，需要传入具体评论 ID 列表。
- `drive +list-comments` 用于分页获取评论列表；如果要统计全量评论数、遍历包含已解决评论在内的所有评论、获取全量最新评论或最后 N 条评论，请先传 `--solved-status all` 并拉完所有分页。它会处理 URL、wiki token 和 token/type 匹配问题。
- `drive file.comments list` 是原生命令。需要 shortcut 未暴露的字段时才使用。

## 评论定位字段

- 需要根据评论定位到文档正文位置时（例如根据评论 review 文档、区分多处相同引用文本、把评论落点映射到 `docs +fetch` 的 block），先确认目标是 `file_type=docx`，再阅读 [`lark-drive-comment-location.md`](lark-drive-0.md#s-eb851ff361ffff9d)，并使用 `drive +list-comments --need-relation`。
- `--need-relation` 仅 docx 生效；其他文档类型会静默忽略。

## 原生 API

需要更底层地直接调用评论 V2 协议时，先查看 schema，再调用原生命令。全文评论省略 `anchor`，局部评论传 `anchor.block_id`。

```text
lark-cli schema drive.file.comments.create_v2
lark-cli drive file.comments create_v2 \
  --params '{"file_token":"<DOC_TOKEN>"}' \
  --data '{"file_type":"docx","reply_elements":[{"type":"text","text":"全文评论内容"}]}'
```


<a id="s-0ee3a82b3d5ae99b"></a>

## references/baseline-index.md

# 兼容参考

- [lark-drive-comments-guide.md](lark-drive-0.md#s-4269ef838ed9b0ae)


<a id="s-eec2b5c15e43279d"></a>

## references/lark-drive-add-comment.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +add-comment

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

给文档、受支持的 Drive 普通文件、电子表格、飞书幻灯片或 Base 添加评论。未指定位置时创建全文评论，但仅适用于 doc/docx、白名单 Drive file，以及解析为这些类型的 wiki；sheet、slides、Base(bitable) 必须指定 `--block-id`。不同类型的 `--block-id` 格式见下文。支持直接传 docx URL/token、旧版 doc URL（仅全文评论）、Drive file URL/token（**仅支持白名单扩展名，且只支持全文评论**）、sheet URL、slides URL、base/bitable URL，也支持传最终可解析为 doc/docx/file/sheet/slides/base(bitable) 的 wiki URL。

## 命令

```text
# 默认：未指定位置时添加全文评论
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/docx/<DOC_ID>" \
  --content '[{"type":"text","text":"请补充发布说明"}]'

# 也可以显式指定为全文评论；旧版 doc URL 仅支持全文评论
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/doc/<DOC_ID>" \
  --full-comment \
  --content '[{"type":"text","text":"请补充旧版文档的背景信息"}]'

# wiki 链接也可以，shortcut 会先解析到真实 doc/docx token
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/wiki/<WIKI_TOKEN>" \
  --content '[{"type":"text","text":"这里需要一段全文评论"}]'

# 给受支持的 Drive 普通文件添加全文评论
# 注意：CLI 会先查询 drive metas，只有白名单扩展名才允许评论
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/file/<FILE_TOKEN>" \
  --content '[{"type":"text","text":"请补充文件说明"}]'

# 裸 token 也支持，但必须显式声明 --type file
lark-cli drive +add-comment \
  --doc "<FILE_TOKEN>" --type file \
  --content '[{"type":"text","text":"请补充目录说明"}]'

# 给 docx 文档的指定 block 添加局部评论（block_id 可通过 docs +fetch --detail with-ids 获取）
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/docx/<DOC_ID>" \
  --block-id "<BLOCK_ID>" \
  --content '[{"type":"text","text":"请补充流程说明"}]'

# wiki 链接也支持局部评论；解析结果可以是 docx/sheet/slides，block-id 格式按目标类型传
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/wiki/<WIKI_TOKEN>" \
  --block-id "<BLOCK_ID>" \
  --content '[{"type":"text","text":"请补充更细的开发步骤"}]'

# 组合文本、@用户、链接元素
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/docx/<DOC_ID>" \
  --block-id "<BLOCK_ID>" \
  --content '[{"type":"text","text":"请 "},{"type":"mention_user","text":"ou_xxx"},{"type":"text","text":" 处理，参考 "},{"type":"link","text":"https://example.com"}]'

# 给电子表格单元格添加评论（--block-id 格式为 <sheetId>!<cell>）
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/sheets/<SHEET_TOKEN>" \
  --block-id "<SHEET_ID>!D6" \
  --content '[{"type":"text","text":"请检查此单元格数据"}]'

# wiki 链接指向的 sheet 也支持
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/wiki/<WIKI_TOKEN>" \
  --block-id "<SHEET_ID>!A1" \
  --content '[{"type":"text","text":"请 "},{"type":"mention_user","text":"ou_xxx"},{"type":"text","text":" 确认"}]'

# 给幻灯片元素添加评论（--block-id 格式为 <slide-block-type>!<xml-id>）
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/slides/<PRESENTATION_ID>" \
  --block-id "<SLIDE_BLOCK_TYPE>!<XML_ELEMENT_ID>" \
  --content '[{"type":"text","text":"请调整这个元素的位置"}]'

# 例如：给整页 slide 添加评论
# <slide id="pkk"> ... </slide>  =>  --block-id slide!pkk
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/slides/<PRESENTATION_ID>" \
  --block-id "slide!pkk" \
  --content '[{"type":"text","text":"这一页需要补充过渡说明"}]'

# 例如：给图片元素添加评论
# <img id="bPk" ... />  =>  --block-id img!bPk
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/slides/<PRESENTATION_ID>" \
  --block-id "img!bPk" \
  --content '[{"type":"text","text":"这张图片建议换成更清晰的版本"}]'

# 例如：给文本 shape 添加评论
# <shape type="text" id="bPq"> ... </shape>  =>  --block-id shape!bPq
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/slides/<PRESENTATION_ID>" \
  --block-id "shape!bPq" \
  --content '[{"type":"text","text":"这段文案可以再精简"}]'

# wiki 链接指向的 slides 也支持
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/wiki/<WIKI_TOKEN>" \
  --block-id "<SLIDE_BLOCK_TYPE>!<XML_ELEMENT_ID>" \
  --content '[{"type":"text","text":"这里需要补充说明"}]'

# 传裸 token 时需要 --type 指定文档类型
lark-cli drive +add-comment \
  --doc "<SHEET_TOKEN>" --type sheet \
  --block-id "<SHEET_ID>!D6" \
  --content '[{"type":"text","text":"请检查"}]'

lark-cli drive +add-comment \
  --doc "<DOCX_TOKEN>" --type docx \
  --content '[{"type":"text","text":"全文评论"}]'

# 裸 token + 已知 block_id 的局部评论
lark-cli drive +add-comment \
  --doc "<PRESENTATION_ID>" --type slides \
  --block-id "<SLIDE_BLOCK_TYPE>!<XML_ELEMENT_ID>" \
  --content '[{"type":"text","text":"slide block comment"}]'

# 裸 token + 已知 block_id 的局部评论
lark-cli drive +add-comment \
  --doc "<DOCX_TOKEN>" --type docx \
  --block-id "<BLOCK_ID>" \
  --content '[{"type":"text","text":"请 "},{"type":"mention_user","text":"ou_xxx"},{"type":"text","text":" 处理，参考 "},{"type":"link","text":"https://example.com"}]'

# 如果需要更底层的原生 API，也可以直接调用 V2 协议
lark-cli schema drive.file.comments.create_v2

lark-cli drive file.comments create_v2 \
  --params '{"file_token":"<DOC_TOKEN>"}' \
  --data '{"file_type":"docx","reply_elements":[{"type":"text","text":"全文评论内容"}]}'

# Base 记录局部评论；原生 file_type 传 bitable。
lark-cli drive +add-comment \
  --doc "<BASE_TOKEN>" --type bitable \
  --block-id "<TABLE_ID>!<RECORD_ID>!<VIEW_ID>" \
  --content '[{"type":"text","text":"Base record-local comment"}]'

# `base` 也可作为裸 token 类型别名；/base/ 与 /bitable/ URL 都会自动识别为 Base。
lark-cli drive +add-comment \
  --doc "<BASE_TOKEN>" --type base \
  --block-id "<TABLE_ID>!<RECORD_ID>!<VIEW_ID>" \
  --content '[{"type":"text","text":"Base alias comment"}]'

# 预览底层调用链
lark-cli drive +add-comment \
  --doc "https://example.larksuite.com/docx/<DOC_ID>" \
  --block-id "<BLOCK_ID>" \
  --content '[{"type":"text","text":"请补充流程说明"}]' \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--doc` | 是 | 文档 URL / token、file / sheet / slides / base / bitable URL，或可解析到 `doc`/`docx`/`file`/`sheet`/`slides`/`base(bitable)` 的 wiki URL |
| `--type` | 裸 token 时必填 | 文档类型：`doc`、`docx`、`file`、`sheet`、`slides`、`bitable`、`base`；评论 Base 文档推荐传 `bitable`，`base` 仅作为兼容别名兜底。URL 输入时自动识别，无需传 |
| `--content` | 是 | `reply_elements` JSON 数组字符串。示例：`'[{"type":"text","text":"文本"},{"type":"mention_user","text":"ou_xxx"},{"type":"link","text":"https://example.com"}]'` |
| `--full-comment` | 否 | 显式指定创建全文评论；未传 `--block-id` 时也会默认走全文评论（仅适用于 doc/docx、白名单 Drive file，以及解析为这些类型的 wiki；不适用于 sheet、slides、Base / bitable） |
| `--block-id` | 局部评论时必填 | 目标块 ID，可通过 `docs +fetch --detail with-ids` 获取；sheet 用 `<sheetId>!<cell>`，slides 用 `<slide-block-type>!<xml-id>`，Base 用 `<table-id>!<record-id>!<view-id>` |

## 行为说明

- **不支持妙搭 apps**：妙搭不支持新增评论，`--doc` 传 `/page/<token>` URL 或 `--type apps` 都不可用。其余评论管理命令（列表、批量查询、回复、解决/恢复、reaction）都支持 apps。
- **局部评论需要先获取 block ID**：先调用 `docs +fetch --doc <TOKEN> --detail with-ids` 获取带有 block ID 的文档内容，然后使用 `--block-id` 指定目标块。
- **Review 场景优先局部评论**：审阅、校对、逐条指出问题时，必须先尝试定位到具体 block / 单元格 / slide 元素，并逐问题创建局部评论；不要把所有问题合并成一条全文评论。
- 未传 `--block-id` 时，shortcut 默认创建**全文评论**；也可以显式传 `--full-comment`。全文评论支持 `docx`、旧版 `doc` URL、白名单扩展名的 Drive file，以及最终可解析为 `doc`/`docx`/`file` 的 wiki URL。
- **Drive file 评论**：仅支持白名单扩展名的普通文件。当前支持：`.md`、`.txt`、`.json`、`.csv`、`.go`、`.js`、`.py`、`.pptx`、`.png`、`.jpg`、`.jpeg`、`.zip`、`.mp3`、`.mp4`。
- **Drive file 暂不支持**：`.pdf`、`.docx`、`.xlsx` 等未在白名单内的普通文件会被 CLI 拒绝，并提示“当前还不支持这种类型的评论”。这些类型虽然可能接受 OpenAPI 请求，但在页面评论展示上存在问题。
- **Drive file 只支持全文评论**：file 目标不支持局部评论，不允许传 `--block-id`。
- 传 `--block-id` 时，shortcut 创建**局部评论（划词评论）**；该模式支持 `docx`、`sheet`、`slides`、Base / bitable，以及最终可解析为这些类型的 wiki URL。
- **Sheet 评论**：当 `--doc` 为 sheet URL 或 wiki 解析为 sheet 时，使用 `--block-id "<sheetId>!<cell>"` 指定单元格（如 `a281f9!D6`）；sheet 没有全文评论，`--full-comment` 不可用。
- **Slide 评论**：当 `--doc` 为 slides URL、`--type slides`，或 wiki 解析为 slides 时，必须传 `--block-id "<SLIDE_BLOCK_TYPE>!<XML_ELEMENT_ID>"`。此时 `--full-comment` 不可用。
- **Base 记录局部评论**：Base 不支持全局评论，所有评论都挂在记录上；裸 token 可传 `--type bitable` 或 `--type base`，推荐 `bitable`。定位信息必须是 file token（base token）+ `--block-id "<table-id>!<record-id>!<view-id>"`，其中 table/record/view ID 通常分别以 `tbl`/`rec`/`vew` 开头；view_id 只决定被提及时点击通知打开哪个视图，不影响评论挂载点，但必须传。ID 获取参考 [`lark-base`]（按模块名读取对应工作流）。
- **Slide 参数映射示例**：`--block-id` 由 PPT XML 元素类型和元素 `id` 组成。例如：
    - `<slide id="pkk">` 对应 `--block-id slide!pkk`，表示给整页评论。
    - `<img id="bPk" ... />` 对应 `--block-id img!bPk`，表示给图片元素评论。
    - `<shape type="text" id="bPq">...</shape>` 对应 `--block-id shape!bPq`，表示给文本 shape 评论。

- `--content` 是结构化评论元素数组（`text` / `mention_user` / `link`），完整格式见 [`lark-drive-comment-content.md`](lark-drive-0.md#s-6205636d86928dea)；上方示例已覆盖常见写法。
- 写入评论前会自动生成符合 OpenAPI 定义的请求体；shortcut 用户只需要传 `--doc`、`--content`，局部评论再传对应格式的 `--block-id`。
- `--dry-run` 仅预览调用链和请求体，不会实际写入。
- 如果需要更底层的控制，仍可改用 `lark-cli schema drive.file.comments.create_v2` + `lark-cli drive file.comments create_v2`。
- 直接调用原生 `drive.file.comments.create_v2` 时，全文评论省略 `anchor`；docx/sheet/slides 局部评论传 `anchor.block_id`，Base 记录局部评论传 `anchor.block_id`（table_id）、`anchor.base_record_id`、`anchor.base_view_id`。
- 直接调用原生 `drive.file.comments.*` / `drive.file.comment.replys.*` 评论 Base 文档时，`file_type` 填 `bitable`，不要填 `base`。

> [!CAUTION]
> 这是**写入操作** —— 执行前必须确认用户意图。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-60109a1dee1b4ac2"></a>

## references/lark-drive-add-reply.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +add-reply

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理；`--content` 完整格式见 [`lark-drive-comment-content.md`](lark-drive-0.md#s-6205636d86928dea)。

给已有评论添加一条回复。

## 命令

```text
# 推荐：完整 URL + 目标评论 ID + 回复内容
lark-cli drive +add-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>' --content '[{"type":"text","text":"回复内容"}]'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 要回复的评论 ID；来自 `drive +list-comments` 的 `items[].comment_id` |
| `--content` | 是 | `reply_elements` JSON，`type=text` 文本自动转义；完整 schema、mention_user/link、10000 字符限制见 [`lark-drive-comment-content.md`](lark-drive-0.md#s-6205636d86928dea) |

## 回复限制

- `is_whole=true` 的全文评论、`is_solved=true` 的已解决评论都不能回复。
- 目标的 `is_whole` / `is_solved` 通常在上一步 `+list-comments` / `+batch-query-comments` 的结果里已有，据此判断即可；信息不足时再补查一次。
- 补查时注意 `+list-comments` 默认只返回未解决评论：要核对某条评论是否已被解决，需要带 `--solved-status all`，否则已解决评论根本不出现在结果里，看起来像评论不存在。
- 命中限制时如实提示（“全文评论不支持回复” / “该评论已被解决，无法回复”），不要自动替用户改回复到别的评论。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "created": true,
  "reply_id": "<reply_id>"
}
```

## 参考

- [lark-drive-comment-content](lark-drive-0.md#s-6205636d86928dea) -- `--content` 格式
- [lark-drive-batch-query-comments](lark-drive-0.md#s-f9662d4ca719282c) -- 按 ID 查 is_whole/is_solved
- [lark-drive-list-replies](lark-drive-0.md#s-4f8de3d1bf0a5ce4) -- 获取回复


<a id="s-877958c402ff06d0"></a>

## references/lark-drive-apply-permission.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +apply-permission（申请文档权限）

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

本 skill 对应 shortcut：`lark-cli drive +apply-permission`。

向云文档 **Owner** 发起 `view` 或 `edit` 权限申请。申请会以卡片形式推送给 Owner，由 Owner 决定是否通过。

> [!CAUTION]
> 这是**写入操作** —— 会给 Owner 发推送通知，不要批量或自动化调用。可以先用 `--dry-run` 预览。

## 身份要求

- **仅支持 `user` 身份**（使用 `user_access_token`），不支持 `bot` / `tenant_access_token`；shortcut 已在 `AuthTypes` 中强制限定为 `user`，使用 bot 会被拒。
- 所需 scope：`docs:permission.member:apply`（若用户缺权限会走统一的 permission 错误路径）。

## 命令

```text
# 通过 URL 申请（type 自动从 URL 推断）
lark-cli drive +apply-permission \
  --token "https://example.larksuite.com/docx/doxcnxxxxxxxxx" \
  --perm view \
  --remark "安全评估：需查看需求文档内容" --as user

# 通过 bare token + 显式 --type
lark-cli drive +apply-permission \
  --token "doxcnxxxxxxxxx" --type docx \
  --perm edit --as user
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token` | 是 | 目标文档 token 或完整 URL（`/docx/`、`/sheets/`、`/base/`、`/bitable/`、`/file/`、`/wiki/`、`/doc/`、`/mindnote/`、`/slides/`、`/page/` 路径里的 token 会被自动提取） |
| `--type` | 否 | 目标类型，可选值 `doc` / `sheet` / `file` / `wiki` / `bitable` / `docx` / `mindnote` / `slides` / `apps`。传 URL 时由 shortcut 自动推断；如显式传入，必须与 URL 路径类型一致。bare token 必须显式传 |
| `--perm` | 是 | 申请的权限，仅支持 `view` 或 `edit`（**不支持 `full_access`**，CLI 侧会直接拒绝） |
| `--remark` | 否 | 备注，会显示在权限申请卡片上 |
| `--dry-run` | 否 | 仅打印请求内容，不实际发送 |

## 输出

API 成功时返回空 `data`（仅 `code: 0, msg: "success"`），对应 CLI 输出：

```json
{
  "ok": true,
  "identity": "user",
  "data": {}
}
```

## 频率限制

- **应用级**：每应用每租户每分钟最多 10 次。
- **用户级**：同一用户对**同一篇文档**一天不超过 5 次。

## 常见错误

| 错误码 | 含义 | CLI 处理 |
|---|---|---|
| `1063006` | 申请次数已达上限（5 次/日） | CLI 自动加 hint：`permission-apply quota reached: each user may request access on the same document at most 5 times per day` |
| `1063007` | 当前文档无法申请（如：文档禁用外部申请、申请者已拥有对应权限、目标类型不支持 apply） | CLI 自动加 hint：`this document does not accept a permission-apply request ... contact the owner directly` |
| `1063002` | 无操作权限（如该租户关闭了外部申请） | 由统一 permission 错误路径处理 |
| `1063004` | 用户所在组织无分享权限 | 由统一 permission 错误路径处理 |
| `1063005` | 资源已删除 | 需要确认目标文档/节点是否仍存在 |
| `1066001/1066002` | 服务端异常 / 并发冲突 | 稍后重试 |

## 与 wiki URL 的关系

传入 `/wiki/<node_token>` 时，shortcut 会直接用 `node_token` 作为路径参数并以 `type=wiki` 调用接口。如果需要先把 wiki 节点解析成 `obj_token`，自行先调用 [`wiki +node-get` shortcut](lark-wiki-0.md#s-5b3c1d410c11b5c9) 拿 `obj_token + obj_type`，再用 bare `obj_token` + `--type <obj_type>` 调本命令。

## 参考

- OpenAPI 端点：`POST /open-apis/drive/v1/permissions/:token/members/apply`


<a id="s-f9662d4ca719282c"></a>

## references/lark-drive-batch-query-comments.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +batch-query-comments

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

按评论 ID 批量获取评论卡片。已知 comment_id 时用它精确取；要分页遍历、全量统计或找最新/最早评论，用 [`lark-drive-list-comments.md`](lark-drive-0.md#s-1d2de165cd3c3e19)。

## 命令

```text
# 推荐：完整 URL + 评论 ID（逗号分隔或重复 --comment-ids，单次上限 100）
lark-cli drive +batch-query-comments --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-ids '<id1>,<id2>'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-ids` | 是 | 评论 ID，逗号分隔或重复传，单次最多 100 个；来自 `drive +list-comments` 的 `items[].comment_id` |
| `--need-reaction` | 否 | 返回评论卡片上的 reaction 数据，见 [`lark-drive-reactions.md`](lark-drive-0.md#s-d0ccd3f6a04918f3) |
| `--need-relation` | 否 | docx 评论定位关系；仅 docx 生效，非 docx 静默忽略，见 [`lark-drive-comment-location.md`](lark-drive-0.md#s-eb851ff361ffff9d) |

## 行为说明

- `--need-relation` 通过请求 **body** 发送（`+list-comments` 是 query param），只在解析后的目标是 docx 时发送；该参数未收录于平台 metadata，但服务端支持，返回 `items[].relation` 及块位置。
- 输出的 `items` 始终是 JSON 数组（服务端省略时归一化为 `[]`），外层补 `file_token`、`file_type`、`count`。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "items": [],
  "count": 0
}
```

`items` 是命中的评论卡片数组（外层补 `file_token`/`file_type`，wiki 输入再加 `wiki_token`）；`count` 是命中数。

## 参考

- [lark-drive-list-comments](lark-drive-0.md#s-1d2de165cd3c3e19) -- 分页获取评论列表
- [lark-drive-comment-location](lark-drive-0.md#s-eb851ff361ffff9d) -- `need_relation` 评论定位


<a id="s-6205636d86928dea"></a>

## references/lark-drive-comment-content.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Drive 评论内容格式（--content）

> 本文是写入类评论命令（`+add-comment` / `+add-reply` / `+update-reply`）共享的 `--content` 内容格式说明，由这三个命令的 ref 引用。

`drive +add-comment`、`drive +add-reply`、`drive +update-reply` 的 `--content` 使用同一套 `reply_elements` JSON 数组格式。本文集中说明 schema、元素类型、转义和长度限制，各命令 ref 只保留最常见的纯文本例子。

## Schema

`--content` 是一个 JSON 数组字符串，至少一个元素。每个元素按 `type` 用对应字段承载值：

| type | 字段 | 值 |
|---|---|---|
| `text` | `text` | 普通文本正文 |
| `mention_user` | `mention_user` | 被 @ 用户的 open_id |
| `link` | `link` | 飞书云文档链接（docx/doc/sheet/bitable/wiki 等云文档 URL；对应 wire `docs_link`） |

最常见就是单个纯文本元素：

```text
--content '[{"type":"text","text":"评论正文"}]'
```

组合多种元素：

```text
--content '[
  {"type":"text","text":"请 "},
  {"type":"mention_user","mention_user":"ou_xxx"},
  {"type":"text","text":" 看下 "},
  {"type":"link","link":"https://your-tenant.feishu.cn/docx/<TOKEN>"}
]'
```

- `type=text` 的 `text` 不能为空；未知 `type` 会被拒绝，只允许 `text` / `mention_user` / `link`。
- 为省事，`mention_user` / `link` 的值也可以直接放在 `text` 字段（如 `{"type":"mention_user","text":"ou_xxx"}`），CLI 会识别；推荐用上表的专属字段，语义更清晰。
- `link` 是**飞书云文档链接**（wire 类型就叫 `docs_link`），不是任意网页链接。回复类命令（`+add-reply` / `+update-reply`）会校验，传外部 URL 被服务端拒绝（`1069302`），只接受飞书云文档 URL；`+add-comment` 对外部 URL 较宽松（能写入），但外部链接未必按云文档链接渲染，仍建议只放云文档 URL。


## 长度限制

- 所有 `type=text` 元素的字符（rune）总和上限 10000，按原始输入的字符数计（中英文、符号一视同仁，不是字节数、也不是转义后的长度）。
- 这是对**总额**的限制：把一段长文本拆成多个 text 元素不能绕过，它们共用同一个 10000 字符预算。
- `mention_user` / `link` 不计入该长度。
- 超限时 shortcut 在发送前拒绝并指出累计超长的元素；服务端对超限返回不透明的 `[1069302]`，所以这是预检。

## 参考

- [lark-drive-add-comment](lark-drive-0.md#s-eec2b5c15e43279d) -- 添加评论
- [lark-drive-add-reply](lark-drive-0.md#s-60109a1dee1b4ac2) -- 回复评论
- [lark-drive-update-reply](lark-drive-0.md#s-4a1316e014436948) -- 更新回复


<a id="s-eb851ff361ffff9d"></a>

## references/lark-drive-comment-location.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 文档评论定位字段

当用户需要根据评论定位文档正文位置、对文档做 review、区分多处相同引用文本，或把评论落点映射到 `docs +fetch --detail with-ids` 的内容时，优先使用 `drive +list-comments --need-relation` 查询 docx 评论位置；已知评论 ID 时用 `drive +batch-query-comments --need-relation`。

## 适用范围

- 当前只有 `file_type=docx` 支持通过 `need_relation=true` 查询评论的位置，并返回可用于定位正文 block 的 `relation`、`parent_type`、`parent_token` 等字段。
- `drive +list-comments` 和 `drive +batch-query-comments` 都会在目标不是 docx 时静默忽略 `--need-relation`，避免把无效参数传给 OpenAPI。遇到 sheet、bitable、slides、普通文件等类型的评论时，不要承诺可以用 `need_relation` 精确定位正文位置，应退回普通评论字段、对应资源能力下钻或人工确认。
- 注意参数位置差异：list 的 `need_relation` 在 query params，batch_query 的在请求 body（直接调 raw OpenAPI 时才需要关心；两个 shortcut 已各自处理）。

## 调用方式

分页列出评论时，优先传 URL；Wiki URL / Wiki token 会自动解析到底层真实 token/type：

```text
lark-cli drive +list-comments --url '<docx_or_wiki_url>' --need-relation
```

如果只有 Wiki token，显式传 `--type wiki`：

```text
lark-cli drive +list-comments --token '<wiki_token>' --type wiki --need-relation
```

已知评论 ID 时，用 `drive +batch-query-comments --need-relation` 直接按 ID 取：

```text
lark-cli drive +batch-query-comments --url '<docx_or_wiki_url>' --comment-ids '<comment_id>' --need-relation
```

只有在需要 shortcut 未暴露的底层参数时，才直接调 raw OpenAPI（两个 shortcut 已各自处理 `need_relation` 的位置差异：list 在 query params，batch_query 在请求 body）。

同时获取文档内容，并要求返回 block id：

```text
lark-cli docs +fetch --doc '<doc_token_or_url>' --detail with-ids
```

## 字段含义

- `relation`：评论在文档内容中的结构化位置。`relation.relation` 是一个 JSON 字符串，需要再解析一次；其中 `positionInfo.blockID` 是最关键字段，用于匹配 `docs +fetch --detail with-ids` 返回的文档 block。
- `relation.content_deleted`：评论引用的内容是否已被删除。为 `true` 时，不要假设还能在当前正文中找到原位置。
- `parent_type`：评论所在的父级嵌入资源类型。常见值包括 `SHEET_BLOCK`、`BITABLE_BLOCK`、`WHITEBOARD_BLOCK`，表示评论落在文档内嵌电子表格、多维表格或画板内部。
- `parent_token`：父级嵌入资源 token。对 sheet / bitable / whiteboard 内部评论，服务端可能无法给出内部单元格、记录或画板节点的文档 block 级 `relation`，但可以通过 `parent_type` + `parent_token` 定位到文档里的父级嵌入 block。

## 准确度分级

输出定位结论时，必须区分以下三类，不要把弱推断说成精确定位：

| 等级 | 判定条件 | 输出口径 |
|---|---|---|
| `relation 精确` | `relation.relation` 中有 `positionInfo.blockID`，且能在 `docs +fetch --detail with-ids` 中匹配到同一 block | 可说“准确定位到 block” |
| `父级资源精确，内部需下钻` | 只有父级嵌入资源的 `blockID` / `parent_type` / `parent_token`，或内部资源的 `positionInfo` 为空 | 可说“准确定位到嵌入资源；内部单元格/记录/节点需用对应 skill 下钻确认” |
| `弱匹配/推断` | 只能依赖 `quote`、序号、当前展示顺序或文本搜索 | 必须标明“推断”，说明歧义来源和需要的补充信息 |

## 返回示例

普通 docx block 上的评论会返回 `relation`。注意 `relation.relation` 本身是字符串，需要再 JSON parse 一次：

```json
{
  "comment_id": "7646774324967295982",
  "quote": "code2",
  "relation": {
    "content_deleted": false,
    "relation": "{\"22-doc_token_xxx\":{\"objType\":22,\"index\":2,\"objVersion\":10,\"positionInfo\":{\"blockID\":\"block_id_xxx\"}}}"
  },
  "parent_type": null,
  "parent_token": null
}
```

把 `relation.relation` 再解析后，取 `positionInfo.blockID`：

```json
{
  "22-doc_token_xxx": {
    "objType": 22,
    "index": 2,
    "objVersion": 10,
    "positionInfo": {
      "blockID": "block_id_xxx"
    }
  }
}
```

然后在 `docs +fetch --detail with-ids` 的结果里查找同一个 block id，例如：

```json
{
  "block_id": "block_id_xxx",
  "block_type": "code",
  "text": "code1\ncode2"
}
```

嵌入 sheet / bitable / whiteboard 内部评论可能没有可用 `relation`，但会返回父级标记：

```json
{
  "comment_id": "7646775036988148672",
  "quote": "记录 2",
  "relation": null,
  "parent_type": "BITABLE_BLOCK",
  "parent_token": "bitable_app_token_xxx_table_id_xxx"
}
```

这种情况下，用 `parent_type` 判断目标是嵌入资源，再用 `parent_token` 匹配 `docs +fetch --detail with-ids` 中的 bitable / sheet block。定位粒度是文档里的父级嵌入 block，不是内部记录、字段或单元格。

画板内部评论的返回形态类似：

```json
{
  "comment_id": "7646775036988148673",
  "quote": "画板节点文本",
  "relation": null,
  "parent_type": "WHITEBOARD_BLOCK",
  "parent_token": "whiteboard_token_xxx"
}
```

此时 `parent_token` 对应 `docs +fetch --detail with-ids` 结果中 `<whiteboard>` 的 `token` 属性，例如：

```xml
<whiteboard id="whiteboard_block_id_xxx" token="whiteboard_token_xxx"></whiteboard>
```

匹配到这个 `<whiteboard>` 后，`id` 就是文档正文里的父级画板 block id。定位粒度是文档里的画板 block；如果需要继续定位到画板内部具体节点，需要再用画板能力读取画板内部结构。

## 定位流程

1. 确认目标是 `file_type=docx`；只有 docx 文档支持通过 `need_relation` 查询评论位置。
2. 用 `drive +list-comments --need-relation` 获取评论；已知评论 ID 且需要批量查询时，用 `drive +batch-query-comments --need-relation`。原生 `drive file.comments list/batch_query` 仅在需要 shortcut 未暴露的底层参数时兜底。
3. 用 `docs +fetch --detail with-ids` 获取文档内容。
4. 对每条评论先看 `relation`：
   - 如果存在 `relation.relation`，解析这个 JSON 字符串。
   - 从解析结果里取 `positionInfo.blockID`。
   - 在 `docs +fetch` 结果中查找相同 block id，这就是评论对应的文档 block。
5. 如果没有可用 `relation`，但有 `parent_type` 和 `parent_token`：
   - `SHEET_BLOCK`：定位到文档中的 sheet 嵌入 block；`parent_token` 通常包含 sheet token 和 sheet id，必要时取 `_` 前的 token 与文档 block 的嵌入资源 token 对比。
   - `BITABLE_BLOCK`：定位到文档中的 bitable 嵌入 block；`parent_token` 通常包含 bitable app token 和 table id，必要时取 `_` 前的 token 与文档 block 的嵌入资源 token 对比。
   - `WHITEBOARD_BLOCK`：定位到文档中的 whiteboard 嵌入 block；`parent_token` 对应 `docs +fetch --detail with-ids` 中 `<whiteboard>` 的 `token` 属性。
   - 这种场景能定位到父级嵌入 block，但通常不能仅凭评论接口定位到嵌入资源内部的具体单元格、字段、记录或画板节点。
6. 只有在 `relation`、`parent_type`、`parent_token` 都缺失时，才退回使用 `quote` 文本做弱匹配；`quote` 是评论接口返回的引用文本字段。弱匹配不能区分多处相同文本。

## 嵌入资源内部定位

### Sheet 内部评论

- `parent_token` 常见格式是 `<spreadsheet_token>_<sheet_id>`；也可能在 `relation.relation` 中看到 `subToken` 为 `3-<spreadsheet_token>`。
- 评论接口通常只把 `positionInfo.blockID` 指到文档里的 `<sheet>` block，内部 sheet 的 `positionInfo` 可能为空。
- 如果 `quote` 是 `C3`、`A1` 这类单元格坐标，可拆出 `spreadsheet_token` / `sheet_id` 后用 `lark-sheets` 读取该单元格确认：

```text
lark-cli sheets +cells-get \
  --spreadsheet-token '<spreadsheet_token>' \
  --sheet-id '<sheet_id>' \
  --range '<cell>'
```

- 准确度口径：父级 sheet block 可由 relation/parent token 精确定位；单元格坐标若只来自 `quote`，应说明“单元格来自 quote，已通过 sheets 读取验证”，不要说它来自 `positionInfo`。

### Bitable / Base 内部评论

- `parent_token` 常见格式是 `<base_token>_<table_id>`，其中 `table_id` 通常以 `tbl` 开头。解析时优先按最后一个 `_tbl` 边界拆分，避免 base token 内出现 `_` 时误拆。
- 评论接口可能只返回 `parent_type=BITABLE_BLOCK` 和 `parent_token`，没有 `relation`；即使有 relation，也通常只足够定位到文档里的 `<bitable>` block。
- 下钻读取时切到 `lark-base`，最少确认表、字段、记录：

```text
lark-cli base +table-list --base-token '<base_token>'
lark-cli base +field-list --base-token '<base_token>' --table-id '<table_id>'
lark-cli base +record-list --base-token '<base_token>' --table-id '<table_id>' --limit 200 --format json
```

- 如果 `quote` 是某个稳定业务值，优先用字段/记录数据做精确匹配；如果 `quote` 只是“第 N 条”“第 N 行”这类 UI 序号，只能基于当前记录顺序推断对应记录，必须输出为“推断”，并说明评论接口没有返回 `record_id` / `field_id`。
- 如果 `record-list` 返回 `has_more=true`，不要基于第一页下全局结论；继续分页或说明只能覆盖已读取范围。
- 需要写入时，如果评论没有字段信息，不要自行猜字段；除非用户给出默认规则，否则请求用户确认字段，或明确说明将使用哪个字段作为默认。

### Whiteboard 内部评论

- `parent_token` 对应文档 XML 中 `<whiteboard token="...">`；先用它匹配文档里的 whiteboard block。
- 若要定位画板内部节点，切到 `lark-whiteboard` 读取 raw 节点结构：

```text
lark-cli whiteboard +export \
  --whiteboard-token '<whiteboard_token>' \
  --output-type raw
```

- 如果 raw 节点中存在唯一匹配 `quote` 的文本节点，可定位到该节点；如果有多个相同文本节点，仍然是弱匹配，需要结合位置、样式、用户描述或人工确认。
- 修改画板节点前，先说明匹配到的节点 id 和文本；复杂画板不要只凭 `quote` 批量替换全部同名节点。

## 使用原则

- Review 文档时，不要只依赖 `quote` 文本定位评论；多处相同文本会产生歧义。
- 能拿到 `relation.positionInfo.blockID` 时，以 block id 为准，再用 block 内容理解上下文。
- 对嵌入 sheet / bitable / whiteboard 内的评论，以父级嵌入 block 作为文档正文定位点；如需继续定位到表格单元格、多维表格记录或画板内部节点，需要再调用对应 sheet / bitable / whiteboard 能力读取内部数据。


<a id="s-008aed2b1b64ed04"></a>

## references/lark-drive-copy.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +copy

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

复制一个 Drive 文件（在线文档、表格、多维表格、幻灯片、思维笔记或普通文件）到目标文件夹，生成一个内容相同的新副本。

## 命令

```text
# 源文档传 URL（自动识别类型和 token）
lark-cli drive +copy --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --name '副本名称' --folder-token <TARGET_FOLDER_TOKEN>

# Wiki URL（自动解包底层资源后复制到 Drive）
lark-cli drive +copy --url "https://example.larksuite.com/wiki/<WIKI_TOKEN>" --name '副本名称' --folder-token <TARGET_FOLDER_TOKEN>

# Wiki token
lark-cli drive +copy --token <WIKI_TOKEN> --type wiki --name '副本名称' --folder-token my_space
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--url` | 与 `--token` 二选一 | 源文档 URL，支持 `doc` / `docx` / `sheet` / `file` / `mindnote` / `slides` / `base` / `bitable` / `wiki` 路径；wiki 会自动解包底层资源 |
| `--token` | 与 `--url` 二选一 | 源文档 token 或 URL；裸 token 必须配合 `--type` |
| `--type` | 裸 token 时必填 | 源文件类型：`doc`、`docx`、`sheet`、`file`、`mindnote`、`slides`、`bitable`（`base` 为兼容别名）或 `wiki`；传 URL 时可省略，显式传入时必须与 URL 类型一致 |
| `--name` | 是 | 副本名称，最长 256 字节 |
| `--folder-token` | 是 | 目标文件夹 token、文件夹 URL，或常量 `my_space`（复制到当前身份"我的空间"根目录，内部自动解析根 token） |
| `--extra` | 否 | 可重复的 `key=value` 对，原样透传给 API 的 `extra` 自定义复制参数；典型用法 `--extra target_type=docx`（复制旧版 doc 时转换为 docx 副本） |

## 输入规则

- `--url` 与 `--token` 互斥，只传一个
- `--type` 必须与源文件真实类型一致，类型不匹配时服务端会返回失败
- `base` 与 `bitable` 是同一概念，CLI 会把 `base` 归一化为 `bitable` 后发给服务端
- 目标文件夹必须是云空间（云盘/云存储）文件夹 token，不能传 wiki 节点 token

## Wiki 场景

`drive +copy` 接受 wiki URL，也接受 `--token <WIKI_TOKEN> --type wiki`。目标仅支持云盘（Drive）文件夹或 `my_space` 根目录；要把副本留在知识库中，使用 `wiki +node-copy`。

## 行为说明

- bot 身份复制成功后，CLI 会自动尝试给当前 CLI 用户授予新副本的 `full_access`，结果在输出的 `data.permission_grant` 字段中；授权失败不影响复制本身的成功状态

## 输出

```json
{
  "ok": true,
  "identity": "bot",
  "data": {
    "copied": true,
    "file_token": "<new_file_token>",
    "file_type": "docx",
    "name": "副本名称",
    "url": "https://example.larksuite.com/docx/<new_file_token>",
    "source_file_token": "<source_file_token>",
    "source_type": "docx",
    "source_wiki_token": "<source_wiki_token, only for wiki input>",
    "folder_token": "<target_folder_token>",
    "permission_grant": {
      "status": "granted",
      "perm": "full_access",
      "member_type": "openid",
      "user_open_id": "<current_user_open_id>",
      "message": "Granted the current CLI user full_access on the new document."
    }
  }
}
```

`source_wiki_token` 仅 wiki 输入出现；`permission_grant` 仅 bot 身份出现，user 身份复制时 `data` 下没有该字段。

## 常见错误

| 错误码 | 含义 | 处理 |
|---|---|---|
| `99991672` / `99991679` | 缺失 scope | 按错误里的 `missing_scopes`、`hint` 申请/授权所需 scope 后重试 |
| `99991400` | 命中接口限频 | 等待一段时间后重试；批量复制时保持串行并降低频率 |

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-wiki](lark-wiki-0.md#s-384c23a567152824) -- 知识库节点复制（`wiki +node-copy`）
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-3439b20b56fac80d"></a>

## references/lark-drive-cover.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

## `drive +cover`

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、权限处理和安全规则。

列出或下载 Drive 文件的稳定封面预设。这个 shortcut 只暴露 `spec`，不暴露底层 `cover_option` 细节。

### 命令

```text
# 列出内置封面规格
lark-cli drive +cover \
  --file-token "<FILE_TOKEN>" \
  --list-only

# 下载 square 规格封面
lark-cli drive +cover \
  --file-token "<FILE_TOKEN>" \
  --spec square \
  --output ./artifacts/report-cover

# 下载默认大图封面，并在文件冲突时覆盖
lark-cli drive +cover \
  --file-token "<FILE_TOKEN>" \
  --spec default \
  --output ./artifacts/report-cover.png \
  --if-exists overwrite
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | Drive 文件 token |
| `--spec` | 条件必填 | 封面预设：`default` / `icon` / `grid` / `small` / `middle` / `big` / `square` |
| `--version` | 否 | 文件版本号 |
| `--list-only` | 否 | 仅返回可选规格，不下载 |
| `--output` | 条件必填 | 下载到本地的输出路径 |
| `--if-exists` | 否 | 输出冲突策略：`error`（默认）/ `overwrite` / `rename` |

### 输出约定

- 查询态返回：
  - `mode=list`
  - `file_token`
  - `candidates[]`
  - `next_action`
- 下载态返回：
  - `mode=download`
  - `file_token`
  - `selected_spec`
  - `output_path`
  - `status`

### 内置规格

- `default` -- 标准大图封面
- `icon` -- 列表小图标
- `grid` -- 网格/卡片流小封面
- `small` -- PC 小图
- `middle` -- 中等尺寸封面
- `big` -- 偏移动端的大图封面
- `square` -- 正方形裁剪封面

### 关键约束

- 不传 `--list-only` 时，必须显式传 `--spec` 和 `--output`
- `drive +cover` 只返回静态预设规格，不伪造后端“可下载状态”
- 不返回底层 `bus_type` / `platform` / `width` / `height` / `policy` 等实现细节
- 下载时直接调用 `preview_download`
- 未显式带扩展名时，会优先根据响应头补扩展名，缺失时回退到 `.png`

### 错误提示

- 下载某个 `--spec` 时如果返回 **HTTP 404**，表示这个文件**没有该规格对应的封面产物**，应视为“该规格不可用”，而不是默认按网络抖动或临时失败处理

### 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- Drive 总入口
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-47844aa3761af3a5"></a>

## references/lark-drive-create-folder.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +create-folder（创建云空间/云盘/云存储文件夹）

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

在飞书云空间（云盘/云存储）中创建一个新文件夹。该 shortcut 对原生 `drive files create_folder` 做了一层更适合日常使用的封装：`--folder-token` 可省略，此时会在调用者根目录创建；如果使用 `--as bot`，创建成功后 CLI 会尝试把新文件夹的可管理权限自动授予当前 CLI 用户。

## 命令

```text
# 在根目录创建文件夹
lark-cli drive +create-folder \
  --name "周报归档"

# 在指定父文件夹下创建子文件夹
lark-cli drive +create-folder \
  --folder-token <PARENT_FOLDER_TOKEN> \
  --name "2026-W16"

# 预览底层调用
lark-cli drive +create-folder \
  --folder-token <PARENT_FOLDER_TOKEN> \
  --name "分析资料" \
  --dry-run
```

## 返回值

成功后会返回一个 JSON 对象，常见字段包括：

- `folder_token`：新建文件夹 token，可直接用于后续 `drive +move`、`drive +upload` 等命令
- `url`：新建文件夹链接（如果接口返回）
- `name`：文件夹名称
- `parent_folder_token`：父文件夹 token；为空字符串表示创建在根目录
- `permission_grant`（可选）：仅 `--as bot` 时返回，说明是否已自动为当前 CLI 用户授予可管理权限

> [!IMPORTANT]
> 如果文件夹是**以应用身份（bot）创建**的，如 `lark-cli drive +create-folder --as bot`，在创建成功后 CLI 会**尝试为当前 CLI 用户自动授予该文件夹的 `full_access`（可管理权限）**。
>
> 以应用身份创建时，结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该文件夹的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：文件夹已创建成功，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该文件夹
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”。
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--name` | 是 | 文件夹名称，不能为空，最长 256 字节 |
| `--folder-token` | 否 | 父文件夹 token；省略时表示在调用者根目录创建 |

## 行为说明

- **根目录创建**：不传 `--folder-token` 时，shortcut 会向 API 显式传空字符串 `folder_token=""`，让后端按“根目录”语义创建
- **bot 自动授权**：只有在 `--as bot` 时，结果才会额外带上 `permission_grant`
- **原生 API 仍可用**：如果用户明确要求按底层 API 字段调用，仍可继续使用 `lark-cli drive files create_folder`

## 推荐场景

- 用户说“在云空间（云盘/云存储）新建一个文件夹 / 目录”时，优先使用 `drive +create-folder`
- 用户给了父文件夹链接或 token，需要在其下继续分层建目录时，传 `--folder-token`
- 如果后续还要上传文件、移动文件、建子目录，优先复用返回值里的 `folder_token`

> [!CAUTION]
> `drive +create-folder` 是**写入操作**，执行前必须确认用户意图。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-48903bcdbf5061e3"></a>

## references/lark-drive-create-shortcut.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +create-shortcut

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

在目标文件夹中为一个现有 Drive 文件创建快捷方式。

## 命令

```text
# 为普通文件创建快捷方式
lark-cli drive +create-shortcut \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --file-token <FILE_TOKEN> \
  --type file

# 为新版文档创建快捷方式
lark-cli drive +create-shortcut \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --file-token <DOCX_TOKEN> \
  --type docx

# 为电子表格创建快捷方式
lark-cli drive +create-shortcut \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --file-token <SHEET_TOKEN> \
  --type sheet

# 仅预览即将发起的请求，不真正执行
lark-cli drive +create-shortcut \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --file-token <DOCX_TOKEN> \
  --type docx \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--folder-token` | 是 | 目标父文件夹 token |
| `--file-token` | 是 | 源文件 token，表示被引用的原始文件 |
| `--type` | 是 | 源文件类型，推荐值：`file`、`docx`、`doc`、`sheet`、`bitable`、`mindnote`、`slides` |

## 输入规则

- 该 shortcut 的最小输入是 `--folder-token` + `--file-token` + `--type`
- CLI 层会把 `--file-token` 和 `--type` 组装为底层 API 所需的 `refer_entity`
- `--file-token` 必须是 Drive 文件 token，不要直接传 wiki 节点 token
- 如果来源是 `/wiki/...` 链接，必须先按 [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c) 中的 wiki 解析流程拿到真实 `obj_token`，再创建快捷方式
- 目标位置必须是云空间（云盘/云存储）文件夹；这个 shortcut 不是“复制文件内容”，而是“在另一个文件夹里挂一个引用入口”

## 类型说明

| 类型 | 说明 |
|------|------|
| `file` | 普通文件 |
| `docx` | 新版云文档 |
| `doc` | 旧版云文档 |
| `sheet` | 电子表格 |
| `bitable` | 多维表格 |
| `mindnote` | 思维笔记 |
| `slides` | 幻灯片 |

## 行为说明

- 成功时会调用 `POST /open-apis/drive/v1/files/create_shortcut`
- 该 shortcut 继承通用能力，可配合 `--as user|bot|auto`、`--format`、`--jq`、`--dry-run` 使用
- `--dry-run` 只输出请求方法、路径、身份和请求体预览，不会真正创建快捷方式
- 这是写入操作；执行前应确认目标文件夹和源文件都准确无误

## 限制

- 该接口不支持并发调用
- 调用频率上限为 5 QPS，且 10000 次/天
- 不支持跨租户、跨地域创建快捷方式
- 不支持跨品牌创建快捷方式
- 如果目标父文件夹单层挂载数量超过限制，会返回 `1062507`

## 权限要求

- 当前调用身份需要能访问源文件
- 当前调用身份需要对目标文件夹有编辑权限
- 如果权限不足，常见表现为 `1061004 forbidden`

## 常见错误

| 错误码 / 错误信息 | 原因 | 处理建议 |
|------|------|------|
| `1061002 params error` | 缺少必填参数，或 `--file-token` / `--type` 组合无法构成有效源文件信息 | 检查 `--file-token`、`--type` 是否完整且匹配；如显式传了 `--folder-token`，再确认其值有效 |
| `1061003 not found` | 源文件或目标文件夹不存在 | 重新确认 token 是否正确、资源是否已删除 |
| `1061004 forbidden` | 对源文件没有访问权限，或对目标文件夹没有编辑权限 | 切换到有权限的身份，或先授予文档 / 文件夹权限 |
| `1061005 auth failed` | 身份类型或 access token 不正确 | 检查 `--as` 使用的身份及当前登录态 |
| `1061007 file has been delete` | 源文件已删除 | 确认原文件仍存在，再重新执行 |
| `1062507 parent node out of sibling num` | 目标文件夹单层挂载数超过上限 | 清理目标目录，或换一个父文件夹 |
| `1061045 resource contention occurred, please retry` | 平台内部资源争抢 | 稍后重试，不要并发重复调用 |
| `1064510 cross tenant and unit not support` | 跨租户或跨地域请求 | 改为在同租户、同地域范围内操作 |
| `1064511 cross brand not support` | 跨品牌请求 | 改为在同品牌环境内操作 |

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-61db950f60f07c98"></a>

## references/lark-drive-delete-reply.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +delete-reply

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

删除某条回复。**高风险写操作**：真实执行需要按 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 的高风险审批协议向用户确认后追加 `--yes`；删除不可恢复。

## 命令

```text
# 先预览（--dry-run 不需要 --yes）
lark-cli drive +delete-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>' --reply-id '<id>' --dry-run

# 确认后真实删除（把 --dry-run 换成 --yes）
lark-cli drive +delete-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>' --reply-id '<id>' --yes
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 回复所属的评论 ID；来自 `drive +list-comments` |
| `--reply-id` | 是 | 要删除的回复 ID；来自 `drive +list-replies` 的 `items[].reply_id`，或 `drive +list-comments` 的 `items[].reply_list.replies[].reply_id` |
| `--yes` | 真实执行时是 | 高风险确认；`--dry-run` 预览不需要 |

## 行为说明

- 删除永久生效，回复没有回收站或撤销。
- 删除按 reply 逐条生效：删除某条回复（包括第一条/根回复）不影响其它回复；把该评论卡片下的所有回复都删完后，评论卡片在前端页面才不再显示。
- **删除整条评论没有专门的命令，需要用本命令删光该卡片下的所有回复**（先用 `drive +list-replies` 拉全回复 id）。删除前先和用户确认删的是某条回复还是整条评论。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "reply_id": "<reply_id>",
  "deleted": true
}
```

## 参考

- [lark-drive-list-replies](lark-drive-0.md#s-4f8de3d1bf0a5ce4) -- 获取回复与 reply_id


<a id="s-0dd3b34e8e162f23"></a>

## references/lark-drive-delete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +delete

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

删除云空间（云盘/云存储）内的文件或文件夹。删除后资源会进入回收站。

> [!CAUTION]
> 这是**高风险写操作**。CLI 层要求显式传 `--yes`；如果用户已经明确要求删除且目标明确，直接执行并带上 `--yes`。
> “目标明确”表示用户给出了可解析为 `file-token` + `type` 的具体 URL/token，或对你刚列出的可解析资源列表逐项/整批确认删除。按“没用的”“临时的”“疑似重复的”“全部旧文件”等描述搜索出来的候选属于待确认目标；这类请求先列候选、说明筛选依据和影响范围，然后停止等待确认。

## 删除前门槛

执行 `drive +delete --yes` 前同时满足：

| 条件 | 可执行信号 |
|------|------------|
| 具体目标 | 单个可解析为 `file-token` + `type` 的 URL/token，或用户确认过且可解析的资源列表 |
| 执行确认 | 用户在本轮明确说确认删除这些具体目标 |

若缺少任一条件，使用 `drive +search`、`drive +inspect` 或只读 API 收集候选并回复待确认清单；启发式规则（打开时间、标题模式、owner、文件类型等）只能作为候选筛选依据，不能升级为删除确认。执行 `drive +delete` 时必须使用解析后的 `--file-token` 和 `--type`。

## 批量删除建议

批量删除文件或文件夹时，建议逐个串行处理，不要并发执行删除命令，并发删除可能触发服务端加锁或冲突，导致部分删除失败；这类失败通常需要等待后对单个失败项重试。

## 命令

```text
# 删除普通文件（异步操作，会自动有限轮询任务状态）
lark-cli drive +delete \
  --file-token <FILE_TOKEN> \
  --type file \
  --yes

# 删除在线文档（异步操作，会自动有限轮询任务状态）
lark-cli drive +delete \
  --file-token <DOCX_TOKEN> \
  --type docx \
  --yes

# 删除文件夹（异步操作，会自动有限轮询任务状态）
lark-cli drive +delete \
  --file-token <FOLDER_TOKEN> \
  --type folder \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 需要删除的文件或文件夹 token |
| `--type` | 是 | 文件类型，可选值：`file`、`docx`、`bitable`、`doc`、`sheet`、`mindnote`、`folder`、`shortcut`、`slides` |
| `--yes` | 是 | 确认执行高风险删除操作 |

## 行为说明

- **删除可能需要等待**：删除操作在服务端可能异步处理，shortcut 会在本次命令内自动做有限次数的结果轮询
- **已完成则停止**：如果返回 `deleted=true`，且没有返回 `next_command`，说明删除已经完成，不需要再调用 `drive +task_result`
- **未完成再续查**：如果超过内置轮询次数仍未完成，会返回 `ready=false`、`timed_out=true`、`task_id` 和 `next_command`；此时按 `next_command` 继续查询删除结果
- **task_id 不是成功条件**：`task_id` 只是续查凭据。没有 `task_id` 但返回 `deleted=true` 时，也表示删除已完成
- **失败处理**：如果返回 `failed=true` 或 `status=fail`，按错误信息和 `task_id` 报告删除失败；不要重复删除同一资源

## 常见错误处理

| 错误码 | 含义 | 建议处理 |
|--------|------|----------|
| `1061007` | 文件已删除 | 视为目标已不可用，无需重试删除 |
| `99991400` | 命中接口限频 | 等待一段时间后重试；批量删除时保持串行并降低频率 |
| `99991679` | 缺失 scope | 按错误里的 `missing_scopes`、`hint` 申请/授权所需 scope 后重试 |

## 推荐续跑方式

```text
# 第一步：先直接删除资源
lark-cli drive +delete \
  --file-token <FILE_OR_FOLDER_TOKEN> \
  --type <TYPE> \
  --yes

# 只有返回 ready=false / timed_out=true 或 next_command 时，才需要继续查
lark-cli drive +task_result \
  --scenario task_check \
  --task-id <TASK_ID>
```

## 限制

- 该 shortcut 仅支持云空间（云盘/云存储）文件或文件夹，不支持 wiki 文档
- 该接口不支持并发调用
- 调用频率上限为 5 QPS 且 10000 次/天

## 权限要求

- 删除文件时，调用身份需要满足以下其一：
- 是文件所有者，并且拥有该文件所在父文件夹的编辑权限
- 不是文件所有者，但拥有该父文件夹的 owner 或 full access 权限

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-e71db3c18178ec5e"></a>

## references/lark-drive-download.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +download

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

从飞书云空间（云盘/云存储）下载文件到本地。下载对象是 Drive **文件**（上传的 PDF/zip/图片/音视频等文件），以及支持 Wiki URL / Wiki token。

## 命令

```text
# 下载到指定路径
lark-cli drive +download --file-token boxbc_xxx --output ./report.pdf

# 只提供 token，默认保存到当前目录
lark-cli drive +download --file-token boxbc_xxx

# 直接传 URL，CLI 自动解析类型和 token
lark-cli drive +download --url "https://example.feishu.cn/file/<FILE_TOKEN>" --output ./report.pdf

# Wiki URL 也可直接传，CLI 会先解析到底层 obj_token/obj_type（obj_type 必须是 file）
lark-cli drive +download --url "https://example.feishu.cn/wiki/<WIKI_NODE_TOKEN>" --output ./report.pdf

# 只有裸 Wiki node token 时，显式传 --wiki-token，让 CLI 先解析底层文件
lark-cli drive +download --wiki-token "<WIKI_NODE_TOKEN>" --output ./report.pdf
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 条件必填 | Drive 文件 token；与 `--url` / `--wiki-token` 三选一 |
| `--url` | 条件必填 | 飞书文件 URL 或 Wiki URL；CLI 自动解析类型和 token |
| `--wiki-token` | 条件必填 | 裸 Wiki node token；CLI 先解析到底层 Drive 文件 |
| `--output` | 否 | 本地输出路径；不传时默认保存到当前目录 |
| `--overwrite` | 否 | 覆盖已存在的输出文件；不传时目标已存在会报错 |

## URL 解析

从飞书文件 URL 提取 token：

```
https://xxx.feishu.cn/drive/file/boxbc_xxx
                                  ^^^^^^^^^
                                  file_token
```

Wiki URL / 裸 Wiki node token 会先解析到底层文档，解析后会在输出里附带 `wiki_token` 和 `wiki_node`（含底层 `obj_token`/`obj_type`）。

## 关键约束

- Wiki 节点解析后的 `obj_type` 必须是 `file`；不确定 token 类型时，先用 `lark-cli drive +inspect --url <TOKEN> --type wiki` 检查。

## 排障

- 如果返回 `permission_denied`，或最终下载返回 `HTTP 403`，按错误 `hint` 使用 `lark-cli drive +preview --file-token <FILE_TOKEN> --type source_file --output <path>` 获取预览产物。
- 如果返回限流错误，停止立即重试，稍后按指数退避重试。
- 如果目标（或 Wiki 解析出的底层文档）是 `docx` / `sheet` / `bitable` / `slides` 等在线文档，`+download` 无法直接下载，会返回 typed validation error；改用 [lark-drive-export](lark-drive-0.md#s-c34a363ec7e0cf38) 渲染成 pdf / xlsx / pptx / markdown 等格式。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-c88c646c96f5cce6"></a>

## references/lark-drive-export-download.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +export-download

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

根据导出任务产物的 `file_token` 下载本地文件。通常与 `drive +task_result --scenario export` 配合使用。

## 命令

```text
# 使用服务端返回的文件名下载到当前目录
lark-cli drive +export-download \
  --file-token "<EXPORTED_FILE_TOKEN>"

# 下载到指定目录
lark-cli drive +export-download \
  --file-token "<EXPORTED_FILE_TOKEN>" \
  --output-dir ./exports

# 指定本地文件名
lark-cli drive +export-download \
  --file-token "<EXPORTED_FILE_TOKEN>" \
  --file-name "weekly-report.pdf" \
  --output-dir ./exports

# 允许覆盖
lark-cli drive +export-download \
  --file-token "<EXPORTED_FILE_TOKEN>" \
  --overwrite
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 导出完成后的产物 token |
| `--file-name` | 否 | 覆盖默认文件名 |
| `--output-dir` | 否 | 本地输出目录，默认当前目录 |
| `--overwrite` | 否 | 覆盖已存在文件 |

## 使用顺序

1. 用 `drive +export` 发起导出
2. 如果返回 `ticket` / `next_command`，用 `drive +task_result --scenario export --ticket <ticket> --file-token <source_token>` 继续查
3. 查到 `file_token` 后，用 `drive +export-download` 下载

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-c34a363ec7e0cf38"></a>

## references/lark-drive-export.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +export

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

把 `doc` / `docx` / `sheet` / `bitable` / `slides`（也支持 Wiki URL / Wiki node token 自动解包）导出到本地文件。这个 shortcut 内置有限轮询：

- 如果导出任务在轮询窗口内完成，会直接下载到本地目录
- 如果轮询结束仍未完成，会返回 `ticket`、`ready=false`、`timed_out=true` 和 `next_command`
- 后续继续查结果时，改用 `drive +task_result --scenario export`
- 拿到 `file_token` 后，改用 `drive +export-download`

## 命令

```text
# 推荐：直接传 URL，CLI 自动解析类型和 token
lark-cli drive +export \
  --url "https://example.feishu.cn/docx/<DOCX_TOKEN>" \
  --file-extension pdf

# Wiki URL 也推荐直接传，CLI 会先解析到底层 obj_token/obj_type
lark-cli drive +export \
  --url "https://example.feishu.cn/wiki/<WIKI_NODE_TOKEN>" \
  --file-extension pdf

# 只有裸 Wiki node token 时，显式传 --doc-type wiki，让 CLI 先解析到底层文档类型
lark-cli drive +export \
  --token "<WIKI_NODE_TOKEN>" \
  --doc-type wiki \
  --file-extension pdf

# 导出新版文档为 pdf，默认保存到当前目录
lark-cli drive +export \
  --token "<DOCX_TOKEN>" \
  --doc-type docx \
  --file-extension pdf

# 导出旧版文档为 docx
lark-cli drive +export \
  --token "<DOC_TOKEN>" \
  --doc-type doc \
  --file-extension docx

# 导出 docx 为 markdown（Lark-flavored Markdown）
# 注意：markdown 只支持 docx
lark-cli drive +export \
  --token "<DOCX_TOKEN>" \
  --doc-type docx \
  --file-extension markdown

# 导出电子表格为 xlsx
lark-cli drive +export \
  --token "<SHEET_TOKEN>" \
  --doc-type sheet \
  --file-extension xlsx \
  --output-dir ./exports

# 导出幻灯片为 pptx
lark-cli drive +export \
  --token "<SLIDES_TOKEN>" \
  --doc-type slides \
  --file-extension pptx \
  --output-dir ./exports

# 导出幻灯片为 pdf
lark-cli drive +export \
  --token "<SLIDES_TOKEN>" \
  --doc-type slides \
  --file-extension pdf \
  --output-dir ./exports

# 指定本地文件名（会按导出格式自动补扩展名）
lark-cli drive +export \
  --token "<DOCX_TOKEN>" \
  --doc-type docx \
  --file-extension pdf \
  --file-name "weekly-report.pdf" \
  --output-dir ./exports

# 导出电子表格或多维表格为 csv 时，必须传 sub_id
lark-cli drive +export \
  --token "<SHEET_OR_BITABLE_TOKEN>" \
  --doc-type "<sheet|bitable>" \
  --file-extension csv \
  --sub-id "<SUB_ID>" \
  --output-dir ./exports

# 导出多维表格为 .base 快照（只支持 bitable）
lark-cli drive +export \
  --token "<BITABLE_TOKEN>" \
  --doc-type bitable \
  --file-extension base \
  --output-dir ./exports

# 导出多维表格结构为 .base 快照（仅导出表结构，不导出记录数据）
lark-cli drive +export \
  --token "<BITABLE_TOKEN>" \
  --doc-type bitable \
  --file-extension base \
  --only-schema \
  --output-dir ./exports

# 允许覆盖已存在文件
lark-cli drive +export \
  --token "<DOCX_TOKEN>" \
  --doc-type docx \
  --file-extension pdf \
  --overwrite
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--url` | 与 `--token` 二选一 | 源文档 URL，推荐优先使用；CLI 自动解析类型和 token，Wiki URL 会解析到底层 `obj_token/obj_type` |
| `--token` | 与 `--url` 二选一 | 源文档裸 token；裸 token 必须同时传 `--doc-type`。裸 Wiki node token 必须传 `--doc-type wiki`，CLI 会先解析到底层 `obj_token/obj_type` |
| `--doc-type` | 条件必填 | 源文档类型：`doc` / `docx` / `sheet` / `bitable` / `slides` / `wiki`；仅当使用裸 `--token` 时必填，使用 `--url` 时自动推断。`wiki` 只用于裸 Wiki node token，解析后会按真实底层类型发起导出 |
| `--file-extension` | 是 | 导出格式：`docx` / `pdf` / `xlsx` / `csv` / `markdown` / `base` / `pptx` |
| `--sub-id` | 条件必填 | 当 `sheet` / `bitable` 导出为 `csv` 时必填 |
| `--only-schema` | 否 | 仅当 `--doc-type bitable --file-extension base` 时可用；只导出多维表格结构，不导出记录数据 |
| `--file-name` | 否 | 覆盖默认本地文件名；如未带扩展名，会按 `--file-extension` 自动补齐 |
| `--output-dir` | 否 | 本地输出目录，默认当前目录 |
| `--overwrite` | 否 | 覆盖已存在文件 |

## 关键约束

- 推荐优先传 `--url`，不要从 URL 手工拆 token 和 type；尤其是 Wiki URL，CLI 会自动解包到底层资源
- `--url` 和 `--token` 互斥
- 裸 `--token` 必须传 `--doc-type`；裸 Wiki node token 使用 `--doc-type wiki`
- `doc` 支持导出为 `docx` / `pdf`
- `docx` 支持导出为 `docx` / `pdf` / `markdown`
- `sheet` 支持导出为 `xlsx` / `csv`
- `bitable` 支持导出为 `xlsx` / `csv` / `base`
- `slides` 支持导出为 `pptx` / `pdf`
- `csv` 只支持 `sheet` / `bitable`，且必须带 `--sub-id`
- `--only-schema` 只支持 `bitable` 导出为 `.base`，用于仅导出表结构
- 如果格式不匹配，CLI 会返回 typed validation error，并在 `hint` 中给出可重试的 `--file-extension` 建议；例如 `docx + csv` 会提示改用 `docx/pdf/markdown`，或改传 sheet/bitable URL
- shortcut 内部固定有限轮询：最多 10 次，每次间隔 5 秒
- 创建导出任务时收到 `rate_limit` / `99991400` 不会生成 `ticket`；至少等待 1 分钟后重跑原 `drive +export`，持续限频时从 1 分钟开始指数退避
- 状态轮询一旦收到 `rate_limit` / `99991400` 会立即停止，不会继续消耗剩余轮询次数；错误会保留原始 typed metadata，并在 `hint` 中提供已有 `ticket` 的续查命令
- 轮询超时不是失败；会返回 `ticket`、`timed_out=true` 和 `next_command`，供后续继续查询

## 错误码处理

| 错误码 | 含义 | 处理方式 |
|--------|------|----------|
| `1069914` | token 非法或 token/type 不匹配；常见原因是把 Wiki node token 当作底层 `docx` / `sheet` / `bitable` token 使用，没有传 `--doc-type wiki` | 优先改用 `--url <Wiki URL>`；只有裸 Wiki token 时，用 `--token <WIKI_NODE_TOKEN> --doc-type wiki`。不确定 token 类型时，先用 `lark-cli drive +inspect --url <TOKEN> --type wiki` 检查是否能解包为 Wiki node；如果不是 Wiki token，再检查 token 来源、`--doc-type` 是否与实际资源类型一致 |
| `1069902` | 没有当前导出任务所需权限 | 不要直接重试同一命令；先确认当前 `--as` 身份是否能访问该文档、是否有下载/导出权限，以及文档是否受分享、密级或租户策略限制。需要补权限时，让文档 owner 或管理员授权后再执行 |
| `99991400` / `rate_limit` | OpenAPI 请求频率受限 | 立即停止并按错误 `hint` 处理：没有 `ticket` 时，至少等待 1 分钟后重跑原 `drive +export`；已有 `ticket` 时，只执行 `drive +task_result --scenario export` 续查，不要重复创建任务。持续限频时从 1 分钟开始指数退避 |
| `9499` + `too many request(s)` | 导出任务接口的另一种限频响应；同一个 `9499` 在其它 Drive 接口也可能表示参数类型错误，CLI 会结合服务端消息区分 | 按 `rate_limit` 处理：立即停止，等待至少 1 分钟并指数退避；已有 `ticket` 时只续查该任务，不要重新创建 |
| `99991679` | 缺少 OpenAPI scope | 按错误 envelope 中的 `missing_scopes` / `required_scope` / `hint` 补齐授权；常见方式是重新执行 `lark-cli auth login --scope "<缺失 scope>"`。补 scope 前不要反复重试导出命令 |

## 推荐续跑方式

```text
# 第一步：先尝试直接导出
lark-cli drive +export \
  --url "<DOCX_URL>" \
  --file-extension pdf \
  --file-name "weekly-report.pdf"

# 如果返回 ready=false / timed_out=true，再继续查
lark-cli drive +task_result \
  --scenario export \
  --ticket "<TICKET>" \
  --file-token "<DOCX_TOKEN>"

# 查到 file_token 后下载
lark-cli drive +export-download \
  --file-token "<EXPORTED_FILE_TOKEN>" \
  --file-name "weekly-report.pdf" \
  --output-dir ./exports
```

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-1efd212989674e97"></a>

## references/lark-drive-files-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive files list（原生 API：读取 Drive 文件夹清单）

`drive files list` 是原生 API 命令，不是 shortcut。它用于读取 Drive 根目录或某个 Drive 文件夹的直接子项；如果要递归盘点目录树，Agent 必须基于返回的子文件夹 token 继续调用本命令。

## 什么时候使用

| 场景 | 是否使用 | 说明 |
|------|----------|------|
| 盘点一个已确认的 Drive 文件夹树 | 使用 | 从目标 `folder_token` 开始递归列取 |
| 盘点用户明确确认的 Drive 根目录 | 使用 | 第一层用空 `folder_token`，子文件夹继续按普通文件夹递归 |
| 验证移动 / 创建后的实际位置 | 使用 | 读取目标目录直接子项，再按需递归验证 |
| 根据关键词、标题、时间、owner 找资源 | 不使用 | 优先用 `drive +search` |
| 读取 Docx 正文内容 | 不使用 | 用 `docs +fetch` |
| 读取 Sheet / Base 内部数据 | 不使用 | 切到 `lark-sheets` / `lark-base` |

## 标准命令模板

读取普通文件夹：

```text
lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","page_size":200}' \
  --format json
```

继续翻页：

```text
lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","page_size":200,"page_token":"<PAGE_TOKEN>"}' \
  --format json
```

读取当前用户 Drive 根目录的直接子项：

```text
lark-cli drive files list \
  --params '{"folder_token":"","page_size":200}' \
  --format json
```

也可以省略 `folder_token` 字段来请求根目录，但在 Agent 编排中建议显式传空字符串，避免把“忘记传参数”和“确认请求根目录”混在一起。

## 按时间排序

默认不要传 `order_by` / `direction`；服务端会按默认顺序返回。只有用户明确要求按创建时间或编辑时间排序时，才使用服务端排序参数。

按创建时间升序列出当前文件夹直接子项：

```text
lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","order_by":"CreatedTime","direction":"ASC","page_size":200}' \
  --format json
```

按编辑时间降序列出当前文件夹直接子项：

```text
lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","order_by":"EditedTime","direction":"DESC","page_size":200}' \
  --format json
```

以上示例返回排序后的当前页；如果返回 `has_more=true`，保持相同 `folder_token` / `order_by` / `direction` / `page_size`，把 `next_page_token` 放入 `page_token` 继续翻页。

## 参数规则

1. `folder_token` 必须放在 `--params` JSON 里；不要使用不存在的 `--folder-token` flag。
2. `page_token` 必须放在 `--params` JSON 里；不要依赖 shell 变量拼接不完整的 JSON。
3. 默认不要传 `order_by` / `direction`；只有用户明确要求按创建时间 / 编辑时间排序时才使用服务端排序参数。
4. 排序参数映射：创建时间 -> `order_by:"CreatedTime"`；编辑时间 / 修改时间 -> `order_by:"EditedTime"`；升序 -> `direction:"ASC"`；降序 -> `direction:"DESC"`。不要省略排序参数后再用 Python / shell 客户端排序替代。
5. 排序查询建议带 `page_size:200` 减少翻页；只有用户要求完整分页、递归盘点、大目录全量导出，或当前页返回 `has_more=true` 后继续翻页时，才加入 `page_token`。
6. `page_size` 在分页、递归盘点或全量导出时建议显式设置为 `200`。如果服务端或环境返回参数错误，再降级到服务端允许的值，并记录降级原因。
7. 调用前如果不确定字段结构，先运行 `lark-cli schema drive.files.list` 查看 `--params` 结构。

## 返回结构与解析

`--format json` 输出中，Agent 只使用 `data` 中符合 `schema drive.files.list` 的 API 返回字段。

常用字段：

| 字段 | 用途 |
|------|------|
| `data.files` | 当前页直接子项列表 |
| `data.has_more` | 当前目录是否还有下一页 |
| `data.next_page_token` | 下一页 token；当 `has_more=true` 时放回 `--params.page_token` |
| `data.files[].type` | 文件类型；等于 `folder` 时可递归 |
| `data.files[].token` | 当前资源 token；文件夹递归时作为下一层 `folder_token` |
| `data.files[].name` | 生成路径和展示标题 |
| `data.files[].url` | 资源浏览器链接 |
| `data.files[].owner_id` | 资源所有者 |
| `data.files[].created_time` / `data.files[].modified_time` | 创建 / 更新时间 |

字段名以 `schema drive.files.list` 为准。Agent MUST 以实际返回为准；如果字段缺失，先用 `schema drive.files.list` 或一页样本确认结构，不要猜测。

## 根目录语义

1. `folder_token` 为空字符串或省略时，请求的是当前调用用户的 Drive 根目录直接子项。
2. 根目录返回值不是递归结果；不能把根目录第一页或直接子项数量当作整个云空间资源总量。
3. 根目录只作为目录树起点。返回的子文件夹必须用其自己的 `folder_token` 继续调用 `drive files list`。
4. 根据 schema 描述，根目录第一层清单不支持分页且不返回快捷方式；不要基于根目录响应推断子文件夹内容、根目录第一层快捷方式或无法分页的根目录剩余项已经被覆盖。

## 递归盘点规则

1. 只对返回项中的 `folder` 类型继续递归。
2. 每个目录独立维护分页状态；一个目录的 `page_token` 不可复用于其他目录。
3. 对每个目录持续请求，直到返回 `has_more=false`。非根目录的普通文件夹清单可能返回 `type=shortcut` 条目；不要假设这些条目会携带 `shortcut_info` 目标信息。
4. 递归过程中生成稳定 `path`；不要只保存标题，否则同名资源无法区分。
5. URL、owner、创建时间和更新时间优先使用 `files.list` 返回字段；如果字段缺失或需要批量补齐，再使用 `drive metas batch_query`。不要从标题或路径猜元数据。
6. 深度、数量、每目录页数等限制只能作为内部批次 checkpoint；不能作为递归完成条件。
7. 达到深度 checkpoint 时，把更深层子文件夹加入 continuation queue，并在下一批从这些子文件夹继续，保留原始 `path`。
8. 达到数量 checkpoint 时，保存当前目录、当前页 token、剩余目录队列和已收集资源计数，并立即继续下一批；不要进入分析或规划阶段。

### 递归算法

Agent 盘点 Drive 文件夹树时，按以下顺序执行：

1. 初始化待处理队列，放入起点目录：
   - 普通文件夹：`{folder_token:"<folder_token>", path:"<folder_name>"}`
   - Drive 根目录：`{folder_token:"", path:""}`
2. 从队列取出一个目录，请求第一页。
3. 用 `(folder_token, page_token)` 生成当前页 key；同一页 key 只允许追加一次，避免 retry 时重复计数。
4. 从 `data.files` 取当前页直接子项，按 `dedupe_key` 去重后生成 `path` 并加入结果集。
5. 如果新追加的子项是 `folder`，把子文件夹 token、子路径和 depth 加入队列。
6. 如果 `has_more=true`，取 `data.next_page_token` 继续请求同一目录下一页。
7. 同一目录分页结束后，再处理队列中的下一个目录。
8. 如果达到深度、数量或每目录页数 checkpoint，把当前目录 / 页 token / 剩余队列 / 已访问页 key / dedupe key 写入 continuation queue，并继续下一批。
9. 普通队列和 continuation queue 都为空，且没有分页 blocker 时，才可以认为本次确认范围盘点完成。

简化伪代码：

```text
queue = [root_or_start_folder]
visited_pages = set()
dedupe_keys = set()
while queue not empty:
  folder = queue.pop()
  page_token = folder.page_token or ""
  retry_without_token = 0
  while true:
    page_key = (folder.folder_token, page_token or "first")
    page = drive files list(folder.folder_token, page_token)
    if page_key not in visited_pages:
      append only files whose dedupe_key is not in dedupe_keys
      enqueue newly appended child folders with folder_token, path, and depth
      add page_key to visited_pages
    if page.has_more != true:
      break
    next = page.next_page_token
    if next is empty:
      retry_without_token += 1
      if retry_without_token >= 3:
        record pagination blocker for folder
        break
      continue
    page_token = next
    retry_without_token = 0
```

## 分页与异常

1. 默认手动处理 `has_more` 和返回中的 `next_page_token`。
2. 不要使用 `--page-all` 作为脚本 JSON 解析输入；自动翻页输出可能不适合直接 `json.loads`。
3. 如果 `has_more=true` 但没有可用的 `next_page_token`，重试同一页最多 3 次。
4. 重试后仍无 continuation token 时，记录受影响的目录和 pagination blocker，停止扩展该目录；不要无限循环，也不要宣称该目录已完整覆盖。
5. 如果触发深度、数量或每目录页数限制，把它视为批处理 checkpoint；在确认范围内继续下一批，而不是把当前结果说成完整。
6. 不要因为达到 `max_depth=3`、`max_items=500` 或类似单批阈值就结束盘点；只有队列耗尽或遇到权限 / API / 工具预算 blocker 才能结束当前确认范围的盘点。

## JSON 解析规则

1. stdout 是数据通道。脚本解析 JSON 时只读取 stdout。
2. stderr 可能包含刷新 token、进度、warning 或其他提示；不要把 stderr 合并进 JSON 输入，例如不要用 `2>&1` 后再 `json.loads`。
3. 使用 `--format json` 保持 stdout 为结构化 JSON；解析 Drive 文件清单时只读取 `data.files` / `data.has_more` / `data.next_page_token` 等 schema 字段。
4. 不要用根目录响应数量或当前页数量推断递归总量；递归总量必须由实际遍历并去重后的资源集合计算。

## 常见错误

| 错误用法 | 问题 | 正确做法 |
|----------|------|----------|
| `lark-cli drive files list --folder-token <token>` | `files.list` 不提供 `--folder-token` flag | 使用 `--params '{"folder_token":"<token>"}'` |
| 根目录返回 N 项就认为云空间只有 N 项 | 根目录只返回直接子项，不是递归结果 | 对返回的子文件夹继续递归 |
| `--page-all \| python json.loads(...)` | 自动翻页输出不适合作为单个 JSON 对象解析 | 手动使用 `page_token` 翻页并逐页解析 |
| `cmd 2>&1` 后解析 JSON | stderr 提示污染 JSON 输入 | 只解析 stdout，stderr 作为日志处理 |


<a id="s-889102c7a37a958d"></a>

## references/lark-drive-import.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +import

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

将本地文件（如 Word、TXT、Markdown、Excel、PPTX 等）导入并转换为飞书在线云文档（docx、sheet、bitable、slides）。底层统一通过 `POST /open-apis/drive/v1/import_tasks` 接口创建导入任务，并在 shortcut 内做有限次数轮询 `GET /open-apis/drive/v1/import_tasks/:ticket`。

> [!IMPORTANT]
> 当用户说“把本地 Excel / CSV / `.base` 快照导入成 Base / 多维表格 / bitable 文档”时，第一步必须使用 `drive +import --type bitable`。
> 这是 Drive 导入场景，不是 `lark-base` 的建表 / 写记录场景。
> 只有导入完成并拿到新文档的 `token` / `url` 后，后续字段、记录、视图等表内操作才切换到 `lark-cli base +...`。

## 导入后标题确认

> [!IMPORTANT]
> 当用户**未传 `--name`** 时，文档标题默认取源文件名（去掉扩展名）。在执行导入前，先友好提示用户：「当前未指定文档标题，默认将使用"xxx"作为标题。如果文件内容中也包含相同标题，导入后可能造成视觉重复。是否需要重命名？」让用户确认后再继续。

## 批量导入串行规则

> [!IMPORTANT]
> 批量执行 `drive +import` 且目标是同一个位置时，必须串行执行，不要并发发起导入任务。这里的“相同位置”包括同一个 `--folder-token`、都省略 `--folder-token` 导入到默认根目录，或使用同一个 `--target-token` 导入到已有 bitable。
>
> 如果在同一位置下并发导入，服务端可能返回并发冲突错误。看到错误信息或 `job_error_msg` 中包含 `232140101`、`232140100`、`233523001` 任一错误码时，按同位置并发操作处理：停止并发导入，改为串行处理失败项；每个失败项每次重试前等待几秒，总共最多重试 3 次；仍失败就停止并向用户报告冲突。

## 命令

```text
# 导入 Word 为新版文档 (docx)
lark-cli drive +import --file ./report.docx --type docx
lark-cli drive +import --file ./legacy.doc --type docx

# 导入 Markdown 为新版文档 (docx)
lark-cli drive +import --file ./README.md --type docx

# 导入纯文本为新版文档 (docx)
lark-cli drive +import --file ./notes.txt --type docx

# 导入 HTML 为新版文档 (docx)
lark-cli drive +import --file ./page.html --type docx

# 导入 Excel 为电子表格 (sheet)
lark-cli drive +import --file ./data.xlsx --type sheet

# 导入 Excel 97-2003 (.xls) 为电子表格 (sheet)
lark-cli drive +import --file ./legacy.xls --type sheet

# 导入 CSV 为电子表格 (sheet)
lark-cli drive +import --file ./data.csv --type sheet

# 导入 Excel 为多维表格 / Base (bitable)
lark-cli drive +import --file ./crm.xlsx --type bitable --name "客户台账"

# 导入 .base 快照为多维表格 / Base (bitable)（文件不能超过 20MB）
lark-cli drive +import --file ./snapshot.base --type bitable --name "快照还原"

# 导入 PPTX 为飞书幻灯片 (slides)（文件不能超过 500MB）
lark-cli drive +import --file ./deck.pptx --type slides --name "项目汇报"

# 导入到指定文件夹，并指定导入后的文件名
lark-cli drive +import --file ./data.csv --type bitable --folder-token <FOLDER_TOKEN> --name "导入数据表"

# 导入数据到已有的多维表格（不新建，数据挂载到目标多维表格中）
lark-cli drive +import --file ./data.xlsx --type bitable --target-token <BASE_TOKEN>

# 预览底层调用链（上传 -> 创建任务 -> 轮询）
lark-cli drive +import --file ./README.md --type docx --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file` | 是 | 本地文件路径，根据文件后缀名自动推断 `file_extension`；文件需满足对应格式的导入大小限制，超过 20MB 且仍在允许范围内时会自动切换分片上传 |
| `--type` | 是 | 导入目标云文档格式。可选值：`docx` (新版文档)、`sheet` (电子表格)、`bitable` (多维表格)、`slides` (飞书幻灯片) |
| `--folder-token` | 否 | 目标文件夹 token，不传则请求中的 `point.mount_key` 为空字符串，Import API 会将其解释为导入到云空间（云盘/云存储）根目录 |
| `--name` | 否 | 导入后的在线云文档名称，不传默认使用本地文件名去掉扩展名后的结果 |
| `--target-token` | 否 | 已有的多维表格 token，将数据导入到该多维表格中（**仅支持 `--type bitable`**）；传入后数据会挂载到目标多维表格而非新建一个 |

## 行为说明

- **完整执行流程**：此 shortcut 内部封装了完整流程：
  1. 自动上传源文件获取 `file_token`：
     - 20MB 及以下：调用素材上传接口 `POST /open-apis/drive/v1/medias/upload_all`
     - 超过 20MB：自动切换为分片上传 `upload_prepare -> upload_part -> upload_finish`
  2. 调用 `import_tasks` 接口发起导入任务，自动根据本地文件提取扩展名并构造挂载点（`mount_point`）参数
  3. 自动轮询查询导入任务状态；如果在内置轮询窗口内完成，则直接返回导入结果；如果仍未完成，则返回 `ticket`、当前状态和后续查询命令
- **默认根目录行为**：不传 `--folder-token` 时，shortcut 会保留空的 `point.mount_key`，Lark Import API 会将其视为"导入到调用者根目录"。
- **导入到已有 bitable**：当 `--type bitable` 且传了 `--target-token` 时，请求 body 中会增加一个 `token` 字段指向目标多维表格的 token，point 挂载点逻辑不变。数据会挂载到该已有多维表格中，而非创建新文档。

### 支持的文件类型转换

本地文件扩展名与目标云文档类型的对应关系如下：

| 本地文件扩展名 | 可导入为 | 说明 |
|--------------|---------|------|
| `.docx`, `.doc` | `docx` | Microsoft Word 文档 |
| `.txt` | `docx` | 纯文本文件 |
| `.md`, `.markdown`, `.mark` | `docx` | Markdown 文档 |
| `.html` | `docx` | HTML 文档 |
| `.xlsx` | `sheet`, `bitable` | Microsoft Excel 表格 |
| `.xls` | `sheet` | Microsoft Excel 97-2003 表格 |
| `.csv` | `sheet`, `bitable` | CSV 数据文件 |
| `.base` | `bitable` | 多维表格快照文件 |
| `.pptx` | `slides` | Microsoft PowerPoint 演示文稿 |

> [!IMPORTANT]
> 用户口头说的 “Base” / “多维表格” / “bitable”，在命令里统一对应 `--type bitable`。
>
> 文件扩展名与目标文档类型必须匹配，否则会返回验证错误：
> - 文档类文件（.docx, .doc, .txt, .md, .html）**只能**导入为 `docx`
> - `.xlsx` / `.csv` 文件**只能**导入为 `sheet` 或 `bitable`
> - `.xls` 文件**只能**导入为 `sheet`
> - `.base` 文件**只能**导入为 `bitable`
> - `.pptx` 文件**只能**导入为 `slides`
> - 例如：`.csv` 文件不能导入为 `docx`，`.md` 文件不能导入为 `sheet`

> [!IMPORTANT]
> 如果在线文档是**以应用身份（bot）导入创建**的，如 `lark-cli drive +import --as bot`，当某次结果**已经返回最终在线文档目标**后，CLI 会**尝试为当前 CLI 用户自动授予该资源的 `full_access`（可管理权限）**。
>
> 这个自动授权有两种触发时机：
> - `drive +import` 的内置轮询窗口内已经完成，直接在 `+import` 中进行自动授权
> - `drive +import` 先返回 `ready=false` / `timed_out=true`，之后你再执行 `lark-cli drive +task_result --scenario import --ticket <TICKET>`，当该查询第一次拿到最终在线文档目标时会自动授权
>
> 只有在已经拿到最终在线文档目标的那次结果里，才会返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该导入结果的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，或当前结果还没有可授权目标，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：导入已成功返回最终在线文档，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该文档
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”。
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

### 文件大小限制

除扩展名与目标类型匹配外，`drive +import` 还会在本地上传前校验格式级大小限制：

| 本地文件扩展名 | 导入目标 | 大小上限 |
|--------------|---------|---------|
| `.docx`, `.doc` | `docx` | 600MB |
| `.txt` | `docx` | 20MB |
| `.md`, `.mark`, `.markdown` | `docx` | 20MB |
| `.html` | `docx` | 20MB |
| `.xlsx` | `sheet`, `bitable` | 800MB |
| `.csv` | `sheet` | 20MB |
| `.csv` | `bitable` | 100MB |
| `.xls` | `sheet` | 20MB |
| `.base` | `bitable` | 20MB |
| `.pptx` | `slides` | 500MB |

- 如果文件超出对应上限，shortcut 会在真正上传前直接返回验证错误。
- “超过 20MB 自动切换分片上传”只表示上传链路会切到 multipart，不代表所有格式都允许导入超过 20MB 的文件。

- 若导入任务执行失败，会返回失败时的 `job_status` 及错误信息。
- 若导入失败信息包含 `232140101`、`232140100`、`233523001`，通常表示同一位置下存在并发导入 / 创建操作；批量场景请改为串行执行，每个失败项每次重试前等待几秒，总共最多重试 3 次，仍失败就停止并报告冲突。
- 若内置轮询超时但任务仍在处理中，shortcut 会成功返回，并带上：
  - `ready=false`
  - `timed_out=true`
  - `next_command`：可直接复制执行的后续查询命令，例如 `lark-cli drive +task_result --scenario import --ticket <TICKET>`
- 若使用 `--as bot` 且内置轮询窗口内已经拿到最终在线文档，输出还会额外带上 `permission_grant`，用于说明是否已自动为当前 CLI 用户授予可管理权限。
- 若使用 `--as bot` 但当前只返回 `ready=false`，此时还不会返回 `permission_grant`；应继续执行返回值里的 `next_command`，等 `drive +task_result --scenario import` 拿到最终文档后再触发自动授权。
- 如果文件扩展名不被支持，执行时将抛出验证错误。

### 超时后的继续查询

当 `+import` 的内置轮询窗口结束但任务尚未完成时，使用返回结果中的 `ticket` 继续查询：

```text
lark-cli drive +task_result --scenario import --ticket <TICKET>
```

如果这里最终返回 `ready=true` 且使用的是 `--as bot`，结果还会额外带上 `permission_grant`，用于说明是否已自动为当前 CLI 用户授予可管理权限。

> [!CAUTION]
> `drive +import` 是**写入操作** —— 执行前必须确认用户意图。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-7e20781df311b587"></a>

## references/lark-drive-inspect.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +inspect（文档 URL 检视：类型、标题、Token 解析）

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

给定一个飞书文档 URL 或 bare token，返回其类型、标题和 canonical token。对 wiki URL 自动解包到底层文档。

## 命令

```text
# 检视一个 docx URL
lark-cli drive +inspect --url 'https://xxx.feishu.cn/docx/doxcnXXX'

# 检视一个 wiki URL（自动解包到底层文档）
lark-cli drive +inspect --url 'https://xxx.feishu.cn/wiki/wikcnXXX'

# bare token 需要指定 --type
lark-cli drive +inspect --url doxcnXXX --type docx

# 格式化输出
lark-cli drive +inspect --url 'https://xxx.feishu.cn/base/bascnXXX' --format pretty
```

## 输出

JSON 输出包含以下字段：

| 字段 | 说明 |
|------|------|
| `input_url` | 原始输入 URL |
| `type` | 文档类型（docx, doc, sheet, bitable, wiki, file, folder, mindnote, slides） |
| `title` | 文档标题 |
| `token` | canonical file token |
| `url` | 重建的 canonical URL |
| `wiki_node` | 仅 wiki URL：包含 `space_id`, `node_token`, `obj_token`, `obj_type` |

## 典型场景

| 场景 | 命令 |
|------|------|
| 用户给了一个 URL，想知道它是什么类型的文档 | `lark-cli drive +inspect --url '<url>'` |
| wiki 链接需要拿到底层文档的 token 来做后续操作 | `lark-cli drive +inspect --url '<wiki_url>'`，取输出中的 `token` |
| 只有 token 没有 URL | `lark-cli drive +inspect --url <token> --type <type>` |

## 注意事项

- `--url` 为必填参数
- 当 `--url` 是 bare token（非完整 URL）时，`--type` 也是必填的
- wiki URL 会自动调用 `node_by_token` API 解包，输出中 `type` 和 `token` 是底层文档的类型和 token
- `+inspect` 只用于识别/消歧；如果任务已能通过 URL 路径形态完成路由判断，不必把它作为所有 Drive 操作的通用前置步骤
- `+inspect` 失败后不要自动切到写接口继续尝试，先按错误提示处理权限、scope 或链接问题
- 支持 `--dry-run` 查看将调用的 API 步骤


<a id="s-1d2de165cd3c3e19"></a>

## references/lark-drive-list-comments.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +list-comments

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

列出 doc/docx/sheet/file/slides/base(bitable)/apps 的评论卡片。优先传用户给出的完整 URL，shortcut 会自动识别类型；apps 为妙搭类型，支持 `/page/<token>` URL；如果传 wiki URL 或 `--token <wiki_token> --type wiki`，会先解析到真实文档。

## 重要默认口径

- 默认只查未解决评论，即不额外传 `--solved-status` 或显式传 `--solved-status false`。即使用户说“所有评论”“全部评论”“把评论都列出来”，只要没有明确提到包含已解决评论，仍然按默认口径查询未解决评论。
- 仅当用户明确要求“包含已解决评论”“已解决和未解决都要”“全部历史评论”这类语义时，才传 `--solved-status all`。
- 是否还有下一页以输出里的 `has_more` 为准；`page_token` 只作为 `has_more=true` 时续跑下一页的游标。

## 命令

```text
# 推荐：直接传用户给出的完整 URL。默认只查未解决评论。
lark-cli drive +list-comments --url "<DOCUMENT_URL>"

# 只有用户明确要求包含已解决评论时，才传 --solved-status all。
lark-cli drive +list-comments --url "<DOCUMENT_URL>" --solved-status all
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--solved-status` | 否 | `false` / `true` / `all`，默认 `false`。`false` 查未解决评论；`true` 查已解决评论；`all` 查全部评论。 |
| `--comment-scope` | 否 | `all` / `whole` / `partial`，默认 `all`。`all` 查全部范围；`whole` 查全文评论；`partial` 查局部评论。 |
| `--need-reaction` | 否 | 是否返回评论卡片上的 reaction 数据；只有用户明确需要 reaction 时才带。 |
| `--need-relation` | 否 | docx 评论定位关系字段；仅 docx 生效，非 docx 静默忽略。需要定位正文时先读 [`lark-drive-comment-location.md`](lark-drive-0.md#s-eb851ff361ffff9d)。 |
| `--page-size` | 否 | 默认 50，最大 100。 |
| `--page-token` | 否 | 分页游标；本 shortcut 不自动翻页，按返回的 `page_token` 继续请求下一页。 |

## 行为说明

- `--comment-scope all` 查全部范围；`whole` 查全文评论；`partial` 查局部/选区评论。
- 当用户已经给出完整 URL 时，原样传给 `--url`；不要先提取 token 再重组成其他类型 URL。比如 sheet 保留 `/sheets/<token>`，wiki 保留 `/wiki/<token>`，妙搭 apps 保留 `/page/<token>`。
- URL 输入时不需要传 `--type`；如果 URL 类型和显式 `--type` 冲突，shortcut 会返回 validation error，建议移除 `--type`。
- wiki 输入会自动解析到真实文档，再查询评论列表。JSON 输出不额外返回 wiki token 或 wiki node。
- 输出中的 `items` 保留评论卡片字段，外层补充 `file_token`、`file_type`、`has_more`、`page_token`、`count`；`count` 是当前页返回的评论卡片数。是否继续分页以 `has_more` 为准，而不是只看 `page_token` 是否存在。

## 评论卡片模型

- 返回的 `items` 是评论卡片列表，每个 `item` 对应用户界面中的一张评论卡片，不是平铺的互动消息列表。
- 创建评论时会同时创建该卡片里的第一条 reply；真正承载正文的是 `item.reply_list.replies`，其中第一条 reply（根回复）在用户视角下就是这张卡片里的“评论本身”。更新根回复即改写评论正文（见 [`lark-drive-update-reply.md`](lark-drive-0.md#s-4a1316e014436948)）；删除按 reply 逐条生效，卡片在最后一条回复被删时才消失（见 [`lark-drive-delete-reply.md`](lark-drive-0.md#s-61db950f60f07c98)）。
- `item.has_more=true` 表示该评论卡片下还有回复未包含在本次返回中；这与外层 `has_more`（是否还有下一页评论卡片）是两个不同字段。需要完整回复时继续用 `drive +list-replies --comment-id <id>` 分页拉全。

## 统计口径

- 统计“评论数”或“评论卡片数”：统计 `items` 长度；全量统计时对所有分页返回的 `items` 长度累加。
- 统计“回复数”：统计所有 `item.reply_list.replies` 长度之和，再减去 `items` 长度。
- 统计“总互动数”：统计所有 `item.reply_list.replies` 长度之和，包含每张评论卡片里的首条评论。
- 任一 `item.has_more=true` 时，先用 `drive +list-replies --comment-id <id>` 把该卡片的回复拉全，再做回复数或总互动数统计，否则会少算。

## 排序

- 只有当用户明确提到“最新评论”“最后评论”“最早评论”时，才需要按 `create_time` 排序。
- 排序前必须拉完所有评论分页，不能只取第一页。
- “最新评论”/“最后评论”：按 `create_time` 降序取第一条。“最早评论”：按 `create_time` 升序取第一条。
- 用户只说“第一条评论”时，直接使用返回的第一条，不需要额外排序。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "items": [],
  "has_more": false,
  "page_token": "",
  "count": 0
}
```

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-drive-list-replies](lark-drive-0.md#s-4f8de3d1bf0a5ce4) -- 拉全某张卡片下的回复（统计与 `item.has_more` 补全）
- [lark-drive-comment-location](lark-drive-0.md#s-eb851ff361ffff9d) -- 使用 `need_relation` 定位 docx 正文


<a id="s-4f8de3d1bf0a5ce4"></a>

## references/lark-drive-list-replies.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +list-replies

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

分页获取某条评论下的回复。

## 命令

```text
# 推荐：完整 URL + 评论 ID
lark-cli drive +list-replies --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 评论 ID；来自 `drive +list-comments` 的 `items[].comment_id` |
| `--page-size` | 否 | 1-100，默认 50 |
| `--page-token` | 否 | 上次输出的 `page_token`；`has_more=true` 时用它续拉 |
| `--need-reaction` | 否 | 在回复上返回 reaction 数据，见 [`lark-drive-reactions.md`](lark-drive-0.md#s-d0ccd3f6a04918f3) |

## 行为说明

- 根回复承载评论正文本身，是回复列表中创建最早的一条：**仅第一页（未传 `--page-token`）的 `items[0]` 是根回复**；翻页后（传了 `--page-token`）返回的 `items[0]` 只是普通回复，不要按位置当作根回复去更新或删除。
- 输出字段：`items[].reply_id` / `user_id` / `create_time` / `update_time` / `content.elements`，供 `+update-reply`、`+delete-reply` 使用。
- 检查回复归属（更新/删除前）：比对 `items[].user_id`（open_id）与当前身份，判断是不是自己创建的回复。
- 输出的 `items` 始终是 JSON 数组（服务端省略时归一化为 `[]`）。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "items": [],
  "has_more": false,
  "page_token": "",
  "count": 0
}
```

`items` 是回复数组；是否继续翻页以 `has_more` 为准，`has_more=true` 时用返回的 `page_token` 续拉。

## 参考

- [lark-drive-list-comments](lark-drive-0.md#s-1d2de165cd3c3e19) -- 评论卡片模型与统计口径
- [lark-drive-update-reply](lark-drive-0.md#s-4a1316e014436948) -- 更新回复
- [lark-drive-delete-reply](lark-drive-0.md#s-61db950f60f07c98) -- 删除回复
- [lark-drive-reactions](lark-drive-0.md#s-d0ccd3f6a04918f3) -- reaction 查询与写入


<a id="s-07f0f74d68c4cad4"></a>

## references/lark-drive-member-add.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +member-add（添加协作者/授权成员权限）

> 这是高风险写操作。真实执行会修改文档权限，需要显式加 `--yes`

## 命令

```text

# 批量添加（同一 member-type 和 perm，最多 10 人）
lark-cli drive +member-add \
  --token "<bare_token_or_url>" \
  --type bitable \
  --member-id "ou_a,ou_b" \
  --member-type openid \
  --perm view \
  --yes
```

## 参数

| 参数 | 必填 | 说明                                                                                                                                                                                  |
|------|----|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--token` | 是 | 裸 token 或完整 URL。路径支持 `/drive/folder/`、`/docx/`、`/doc/`、`/sheets/`、`/base/`、`/bitable/`、`/wiki/`、`/file/`、`/mindnotes/`、`/slides/`、`/minutes/`、`/page/`；URL 输入可从路径推断 `--type`，裸 token 不做前缀推断 |
| `--type` | 必填 | 目标资源类型：`docx` / `doc` / `sheet` / `bitable` / `file` / `folder` / `wiki` / `mindnote` / `slides` / `minutes` / `apps`。传 URL 时可省略；裸 token 必须显式传；若同时传 URL 和 `--type`，显式 `--type` 覆盖 URL 推断 |
| `--member-id` | 是 | 协作者 ID；逗号分隔可批量添加，最多 10 个                                                                                                                                                            |
| `--member-type` | 是 | member-id 的类型；支持 `email` / `openid` / `unionid` / `openchat` / `opendepartmentid` / `groupid` / `appid` / `wikispaceid`。在实际使用里，给当前应用授权仍优先推荐 bot `open_id` + `openid`。                               |
| `--member-kind` | 条件必填 | 仅当 `--member-type=wikispaceid` 时填写，映射到请求 body 的 `type` 字段。取值：`wiki_space_member` / `wiki_space_viewer` / `wiki_space_editor`。其他 member-type 禁止传此参数。 |
| `--perm` | 否 | 授权角色：`view`（默认）/ `edit` / `full_access`                                                                                                                                             |
| `--perm-type` | 否 | 只作用 wiki 节点权限范围：`container`（默认，当前页面+子页面）/ `single_page`（仅当前页面）                                                                                                                      |
| `--need-notification` | 否 | 是否通知对方。仅 `--as user` 可用；未传时不会写入 query，`--need-notification=false` 表示显式不通知                                                                                                           |
| `--dry-run` | 否 | 仅打印请求，不实际授权                                                                                                                                                                         |
| `--yes` | 真实执行时是 | 确认高风险写操作                                                                                                                                                                            |

## 输出

批量成功：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "resource_token": "doc_token_or_url",
    "resource_type": "docx",
    "requested_count": 2,
    "succeeded_count": 2,
    "partial": false,
    "members": [
      {"resource_token": "doc_token_or_url", "resource_type": "docx", "member_id": "ou_a", "member_type": "openid", "member_kind": "user", "perm": "view"},
      {"resource_token": "doc_token_or_url", "resource_type": "docx", "member_id": "ou_b", "member_type": "openid", "member_kind": "user", "perm": "view"}
    ],
    "missing_member_ids": []
  }
}
```

批量部分失败时，`partial` 为 `true`，同一份结果以 `ok:false` 部分失败信封写到 **stdout**（stderr 不再输出单独的错误信封），CLI 以非零退出码结束。检查 `data` 中的 `requested_count`、`succeeded_count`、`members`、`missing_member_ids` 和可选的 `mismatched_member_ids`。响应顺序不影响匹配结果。

## 行为说明

- **身份支持**：`--as user` 和 `--as bot` 均可使用。
- **部门协作者**：`--member-type=opendepartmentid` 必须配合 `--as user`；bot 身份不支持添加部门协作者。
- **通知**：`--need-notification` 仅 `--as user` 时有效；`--as bot` 时传此参数会被拒绝。
- **批量约束**：批量请求共享同一 `--member-type`、`--perm` 和 `--perm-type`；混合用户/群组/部门的场景需拆分为多次调用。
- **Wiki 空间 ID**：`--member-type=wikispaceid` 时必须同时传 `--member-kind`，否则 API 会缺少必填的 body `type` 字段。`wiki_space_member` 对应知识库成员角色；若知识库已将成员拆分为可阅读/可编辑成员组，改用 `wiki_space_viewer` 或 `wiki_space_editor`。
- **ID 解析**：优先用 `open_id` + `--member-type openid`；仅在无法解析 `open_id` 时使用 `email`。群组优先用 `openchat`，部门用 `opendepartmentid`。


<a id="s-5f791b35ecc31c53"></a>

## references/lark-drive-member-list.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +member-list（查询协作者/授权成员列表）

本 skill 对应 shortcut：`lark-cli drive +member-list`。它读取 Drive 文档、文件、文件夹或 wiki 节点的协作者/授权成员列表。

## 命令

```text
#  URL 自动推断 type
lark-cli drive +member-list \
  --token 'https://example.feishu.cn/drive/folder/<folder_token>' \
  --as user --format json

# 查询附加字段
lark-cli drive +member-list \
  --token '<token>' \
  --type docx \
  --fields 'name,type,external_label' \
  --as user --format json

```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token` | 是 | 裸 token 或完整 URL。URL 路径支持 `/folder/`、`/docx/`、`/doc/`、`/sheets/`、`/base/`、`/bitable/`、`/wiki/`、`/file/`、`/mindnotes/`、`/slides/`、`/minutes/`、`/page/`。 |
| `--type` | 裸 token 必填 | 目标类型：`doc` / `sheet` / `file` / `wiki` / `bitable` / `docx` / `mindnote` / `minutes` / `slides` / `folder` / `apps`。URL 可自动推断；如果同时传 URL 和冲突的 `--type`，CLI 会拒绝。 |
| `--fields` | 否 | 默认不传。可取 `name` / `type` / `avatar` / `external_label`，支持逗号分隔；也可传 `*` 请求当前支持的所有附加字段。该参数只声明期望返回的字段，不授予字段级权限。 |
| `--perm-type` | 否 | 仅 `--type wiki` 有效；取值 `container` / `single_page`。 |
| `--dry-run` | 否 | 只打印请求，不调用 API。 |

## 输出

JSON 输出原样透传 API 的 `data` ：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "items": [
      {
        "member_type": "openid",
        "member_id": "ou_xxx",
        "perm": "view",
        "perm_type": "container",
        "type": "user",
        "name": "zhangsan",
        "external_label": false
      }
    ]
  }
}
```

`--format pretty` 会轻量展示成员 ID、成员类型、权限、wiki `perm_type` 和已返回的附加字段。机器读取优先使用 `--format json`。

## 行为说明

- **身份支持**：`--as user` 和 `--as bot` 均可用；缺 scope 或目标权限时按统一 permission 错误路径处理。
- **接口 scope**：查询成员列表需要 `docs:permission.member:retrieve`。
- **fields 默认**：不传 `--fields` 时按官方 API 默认，不请求姓名、头像、外部标签等附加字段；需要时显式指定。
- **字段级权限**：`--fields` 只控制请求哪些附加字段，不保证服务端一定返回。请求用户的 `name` / `avatar` 时，应用还需开通 `contact:user.base:readonly`（“获取用户基本信息”；已具备官方兼容的历史通讯录权限也可满足要求）。
- **缺字段语义**：字段级权限或数据可见性不足时，接口仍可能成功，但会省略相应敏感字段。响应中缺少已请求字段表示“服务端未返回”，不能解释为字段值为空，也不能据此认定成员信息完整。
- **folder 支持**：CLI 支持 `--type folder` 并会按需求发送 `type=folder`；部分环境的后端如果尚未放开 folder 枚举，可能返回 `99992402 field validation failed`。


<a id="s-155b8223f5420f90"></a>

## references/lark-drive-member-remove.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +member-remove（移除协作者权限）

> 这是高风险写操作。真实执行会移除权限，需要核对资源和成员后显式加 `--yes`。

## 命令

```text
lark-cli drive +member-remove \
  --token "<bare_token_or_url>" \
  --type docx \
  --member-id "ou_xxx" \
  --member-type openid \
  --yes
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token` | 是 | 裸 token 或完整 URL。路径支持 `/drive/folder/`、`/docx/`、`/doc/`、`/sheets/`、`/base/`、`/bitable/`、`/wiki/`、`/file/`、`/mindnotes/`、`/slides/`、`/minutes/`、`/page/`；URL 可从路径推断类型，裸 token 必须同时传 `--type`。 |
| `--type` | 条件必填 | 资源类型：`docx` / `doc` / `sheet` / `bitable` / `file` / `folder` / `wiki` / `mindnote` / `slides` / `minutes` / `apps`。完整 URL 可省略。 |
| `--member-id` | 是 | 要移除的单个协作者 ID。逗号分隔的多成员输入会被拒绝；批量场景应逐个调用。 |
| `--member-type` | 是 | ID 类型：`email` / `openid` / `openchat` / `opendepartmentid` / `userid` / `unionid` / `groupid` / `appid` / `wikispaceid`。 |
| `--member-kind` | 条件必填 | 仅 `--member-type=wikispaceid` 使用：未启用知识库成员分组时传 `wiki_space_member`，启用后根据权限传 `wiki_space_viewer` 或 `wiki_space_editor`。 |
| `--perm-type` | 否 | 仅 wiki 协作者使用：`container`（默认，当前页面及子页面）或 `single_page`（仅当前页面）。 |
| `--dry-run` | 否 | 只预览 DELETE URL、query 和 body，不调用接口。 |
| `--yes` | 真实执行时是 | 确认高风险权限移除操作。 |

## 输出

以移除 `openid` 类型的用户协作者为例，成功后返回：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "removed": true,
    "resource_token": "doxcnxxx",
    "resource_type": "docx",
    "member_id": "ou_xxx",
    "member_type": "openid",
    "member_kind": "user"
  }
}
```

Wiki 普通协作者还会返回 `perm_type`；`wikispaceid` 返回所传的 `member_kind`。

`removed: true` 表示删除请求成功完成，不保证该权限此前一定存在。

## 行为说明

- **身份支持**：支持 `--as user` 和 `--as bot`。
- **应用协作者**：使用 `--member-type=appid`，`--member-id` 传应用 ID（通常为 `cli_xxx`）。
- **部门协作者**：`--member-type=opendepartmentid` 只能配合 `--as user`；bot 身份会在客户端提前拒绝。
- **安全编码**：资源 token 和 member ID 都作为独立 path segment 编码。
- **Wiki 范围**：普通 wiki 协作者默认删除 `container` 权限；只删除当前页面权限时显式传 `single_page`。
- **Wiki 空间成员**：`--member-type=wikispaceid` 仅支持 `--type=wiki`；必须用 `--member-kind` 指明成员角色，并且不能同时传 `--perm-type`。
- **错误处理**：OpenAPI 返回的 typed error 原样透传，可根据错误信封中的 subtype、code、hint 和权限信息处理。


<a id="s-385feb5ed1a01e57"></a>

## references/lark-drive-move.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +move

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

将文件或文件夹移动到用户云空间（云盘/云存储）的其他位置。

## 与 Wiki 移动 shortcut 的区别

- `drive +move` 只处理 **Drive 文件夹树内部** 的位置调整，目标位置用 `--folder-token` 表示
- `wiki +move` 处理的是 **Wiki 知识空间 / 页面层级**：要么移动已有 Wiki 节点，要么把 Drive 文档迁入 Wiki
- `wiki +move-to-drive` 把 **已有 Wiki 节点移出知识库**，放到 Drive 文件夹或“我的空间”根目录
- 如果用户说“移动到某个文件夹”“移动到我的空间根目录”，还要判断源对象：源对象已在 Drive 时使用 `drive +move`；源对象是 Wiki 节点时使用 `wiki +move-to-drive`
- 如果用户说“移动到某个知识库 / 页面下”“迁入 Wiki / 知识空间”，应使用 `wiki +move`
- 如果用户说“移动到我的文档库 / 我的知识库 / 个人知识库 / my_library”，不要使用 `drive +move`；先按 Wiki 目标处理
- `我的文档库` 不是 Drive root folder，也不是 `--folder-token` 省略后的默认目的地
- `drive +move` 不支持 Wiki 文档；Wiki 节点到 Drive 应使用 `wiki +move-to-drive`，目标是 Wiki 时使用 `wiki +move`

## 不要误用到 `我的文档库`

下面几种说法都**不应该**触发 `drive +move`：

- `移动到我的文档库`
- `放到我的知识库`
- `迁入个人知识库`
- `move to My Document Library`

这些目标都应该先走 Wiki 解析流程：

```text
lark-cli wiki spaces get --params '{"space_id":"my_library"}'
```

拿到真实 `space_id` 后，再改用 `wiki +move`。不要因为 `drive +move` 可以省略 `--folder-token` 就把它当作“我的文档库”的近似目标。

## 命令

```text
# 移动文件到指定文件夹
lark-cli drive +move \
  --file-token <FILE_TOKEN> \
  --type file \
  --folder-token <TARGET_FOLDER_TOKEN>

# 移动文档到指定文件夹
lark-cli drive +move \
  --file-token <DOCX_TOKEN> \
  --type docx \
  --folder-token <TARGET_FOLDER_TOKEN>

# 移动文件夹
lark-cli drive +move \
  --file-token <FOLDER_TOKEN> \
  --type folder \
  --folder-token <TARGET_FOLDER_TOKEN>

# 移动到根文件夹（不指定 --folder-token）
lark-cli drive +move \
  --file-token <FILE_TOKEN> \
  --type file
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 需要移动的文件或文件夹 token |
| `--type` | 是 | 文件类型，可选值：`file` (普通文件)、`docx` (新版文档)、`bitable` (多维表格)、`doc` (旧版文档)、`sheet` (电子表格)、`mindnote` (思维笔记)、`folder` (文件夹)、`slides` (幻灯片) |
| `--folder-token` | 否 | 目标文件夹 token，不指定则移动到根文件夹 |

## 文件类型说明

| 类型 | 说明 |
|------|------|
| `file` | 普通文件 |
| `docx` | 新版云文档 |
| `doc` | 旧版云文档 |
| `sheet` | 电子表格 |
| `bitable` | 多维表格 |
| `mindnote` | 思维笔记 |
| `slides` | 幻灯片 |
| `folder` | 文件夹 |

## 行为说明

- **普通文件移动**：同步操作，立即完成
- **文件夹移动**：可能异步完成，shortcut 内置有限次数的轮询。同步完成或在轮询期间完成时，返回 `ready=true`；若轮询结束仍未完成，则返回 `ready=false`，可按返回的 `next_command` 继续查询
- **轮询超时不是失败**：文件夹移动内置最多轮询 30 次、每次间隔 2 秒；如果轮询结束任务仍未完成，会返回 `task_id`、`status`、`ready=false`、`timed_out=true` 和 `next_command`
- **继续查询**：当看到 `next_command` 时，改用 `lark-cli drive +task_result --scenario task_check --task-id <TASK_ID>` 继续查询
- **目标文件夹**：如果不指定 `--folder-token`，文件将被移动到用户的根文件夹（"我的空间"）
- **不要混淆产品概念**：这里的“根文件夹 / 我的空间”仅属于 Drive 文件夹树，不等于 Wiki 的“我的文档库”
- **权限要求**：需要被移动文件的可管理权限、被移动文件所在位置的编辑权限、目标位置的编辑权限

## 推荐续跑方式

```text
# 第一步：先直接移动文件夹
lark-cli drive +move \
  --file-token <FOLDER_TOKEN> \
  --type folder \
  --folder-token <TARGET_FOLDER_TOKEN>

# 如果返回 ready=false / timed_out=true，再继续查
lark-cli drive +task_result \
  --scenario task_check \
  --task-id <TASK_ID>
```

## 限制

- 被移动的文件不支持 wiki 文档
- 该接口不支持并发调用
- 调用频率上限为 5 QPS 且 10000 次/天

> [!CAUTION]
> 这是**写入操作** —— 执行前必须确认用户意图。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [wiki +move-to-drive](lark-wiki-0.md#s-9aa6007c9609b1f7) -- 将 Wiki 节点移出知识库并放入 Drive
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-b0e0f705898998ad"></a>

## references/lark-drive-permission-get-setting.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +permission-get-setting（查询权限设置）

本 skill 对应 shortcut：`lark-cli drive +permission-get-setting`。它读取单个 Drive 资源自身的公开访问、分享、协作者管理、安全与评论权限设置，不递归读取文件夹中的子资源。

## 命令

```text
# 通过 URL 自动推断 type
lark-cli drive +permission-get-setting \
  --token 'https://example.feishu.cn/drive/folder/<folder_token>' \
  --as user --format json

# 通过 bare token 显式指定 type
lark-cli drive +permission-get-setting \
  --token '<folder_token>' \
  --type folder \
  --as user --format json
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token` | 是 | bare token 或完整 URL。URL 路径支持 `/folder/`、`/docx/`、`/doc/`、`/sheets/`、`/base/`、`/bitable/`、`/wiki/`、`/file/`、`/mindnotes/`、`/slides/`、`/minutes/`、`/page/`。 |
| `--type` | bare token 必填 | 目标类型：`doc` / `sheet` / `file` / `wiki` / `bitable` / `docx` / `mindnote` / `minutes` / `slides` / `folder` / `apps`。URL 可自动推断；如果同时传 URL 和冲突的 `--type`，CLI 会拒绝。 |
| `--dry-run` | 否 | 只打印请求，不调用 API。 |

## 输出

JSON 输出中的 `data.permission_public` 是目标当前的权限设置；服务端未返回该字段时，命令会报响应结构错误，而不会把其他字段伪装成权限设置。

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "permission_public": {}
  }
}
```

`--format pretty` 会展示完整的 `permission_public` 对象，包括服务端将来新增的字段。

## 行为说明

- **身份支持**：`--as user` 和 `--as bot` 均可用。
- **所需 scope**：`docs:permission.setting:read`。
- **单目标读取**：命令只读取 `--token` 指向资源自身的权限设置；`--type folder` 不会递归读取子资源。


<a id="s-de1404519a4930f0"></a>

## references/lark-drive-permission-guide.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# Drive 权限与授权指南

> 前置条件：通用认证、scope 与 `--as` 规则见 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流）。

## 何时读取

- 用户要修改文档公开权限，尤其是 `drive permission.public patch` 返回 `91009` / `91010` / `91011` / `91012`。
- 用户要给文档、文件、文件夹、Wiki 或 slides 增加协作者权限，或把访问权限授予当前应用（bot）自身。
- 用户遇到 `permission denied`，但错误表现更像租户对外分享、安全策略或密级拦截，而不是普通 scope 缺失。

如果用户只是想向文档 owner 申请访问权限，优先使用 [`lark-drive-apply-permission.md`](lark-drive-0.md#s-877958c402ff06d0)。

## 公开权限修改前门槛

公开权限修改是高风险写操作。执行 `drive permission.public patch --yes` 前同时确认：

| 条件 | 可执行信号 |
|------|------------|
| 具体目标 | 单个 URL/token，或用户确认过的资源列表 |
| 公开范围 | 用户明确选择组织内/互联网、可读/可编辑等具体 `link_share_entity` 档位 |
| 执行确认 | 用户在本轮确认按该目标和范围执行 |

“开放一下”“共享给大家”“让大家能看”只表达目标状态，不包含具体公开范围。先列出可选范围并停止等待用户选择；公开档位必须来自用户选择，CLI 的 `--yes` 只表示已获得用户对该档位的执行确认。

## 公开权限错误码

调用 `lark-cli drive permission.public patch` 更新文档公开权限失败时，如果返回以下错误码，按表格给用户明确下一步。不要把这些错误简单归类为缺少 scope；它们通常表示租户、对外分享或文档密级策略拦截。

| 错误码 | 含义 | 给用户的引导 |
|--------|------|--------------|
| `91009` | 对外分享被租户安全策略管控，当前用户无法开启 | 提示用户：对外分享能力被租户安全策略统一管控，无法通过 API 或当前用户直接开启；需要联系租户管理员调整组织级对外分享策略。 |
| `91010` | 文档对外分享未打开 | 提示用户：当前文档尚未打开对外分享，请先在文档权限设置中打开对外分享，再重试 `permission.public.patch`。 |
| `91011` | 对外分享被文档密级管控 | 提示用户：对外分享被密级策略拦截，需要打开目标文档，在文档内发起密级豁免或进行密级降级后再重试；回复中必须给出目标文档 URL。 |
| `91012` | 权限设置被文档密级管控 | 提示用户：该权限设置被密级策略拦截，需要打开目标文档，在文档内发起密级豁免或进行密级降级后再重试；回复中必须给出目标文档 URL。 |

当用户最初提供的是文档 URL，遇到 `91011` 或 `91012` 时直接把该 URL 原样返回给用户作为操作入口；如果上下文只有 token，需要先尽量通过已有上下文、搜索结果或元数据恢复目标文档 URL，再给出可点击的文档 URL。

## 授权当前应用访问文档

需要将文档权限授予当前应用（bot）自身时：

1. 先执行 `lark-cli api GET /open-apis/bot/v3/info --as bot --jq '.data.open_id'`，直接取得当前应用的 `open_id`。
2. 再调用 `lark-cli drive permission.members create`，用 `member_type=openid`、`member_id=<bot_open_id>` 授权。

```text
lark-cli drive permission.members create \
  --params '{"token":"<doc_token>","type":"<resource_type>"}' \
  --data '{"member_type":"openid","member_id":"<bot_open_id>","perm":"view","type":"user"}'
```

此方式仅适用于授权给当前应用。授权给其他用户时，直接使用对方的 open_id，无需调用 bot info 接口。

`<resource_type>` 可选值：`doc`、`docx`、`sheet`、`bitable`、`file`、`folder`、`wiki`、`slides`。


<a id="s-ec8393f20fb843f8"></a>

## references/lark-drive-preview.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

## `drive +preview`

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、权限处理和安全规则。

查看或下载 Drive 文件内容，或列出并获取文件可用的预览产物。对象是 Drive **文件**，也支持 Wiki URL / node token（CLI 先把 Wiki 节点解析到底层文件，`obj_type` 必须是 `file`）。这个 shortcut 不猜测默认类型：

- 如果只需要查看或下载文件内容，或不关心 PDF/text/image 等转换预览，优先使用 `--type source_file --output <path>`
- 只想看候选项时，用 `--list-only`
- 如果需要服务端生成的预览效果，例如 doc/docx 的 PDF 版式预览，先用 `--list-only` 查看候选项，再按候选项选择 `--type pdf` / `text` / `image` 等
- 想下载时，必须显式传 `--type` 和 `--output`
- 如果 `--list-only` 没有可用预览候选项，或错误提示明确建议使用 `--type source_file`，可以改用 `--type source_file --output <path>` 查看文件内容；资源不存在、token 无效等终态错误需要先修正输入
- 如果某个候选项还在生成中，会返回结构化错误并提示先重新 `--list-only`

### 命令

```text
# 查看文件内容
lark-cli drive +preview \
  --file-token "<FILE_TOKEN>" \
  --type source_file \
  --output ./artifacts/source

# 推荐：直接传 URL，CLI 自动解析类型和 token
lark-cli drive +preview \
  --url "https://example.feishu.cn/file/<FILE_TOKEN>" \
  --list-only

# Wiki URL 也可直接传，CLI 会先解析到底层 obj_token/obj_type（obj_type 必须是 file）
lark-cli drive +preview \
  --url "https://example.feishu.cn/wiki/<WIKI_NODE_TOKEN>" \
  --type source_file \
  --output ./artifacts/source

# 只有裸 Wiki node token 时，显式传 --wiki-token
lark-cli drive +preview \
  --wiki-token "<WIKI_NODE_TOKEN>" \
  --list-only

# 列出可用预览候选项
lark-cli drive +preview \
  --file-token "<FILE_TOKEN>" \
  --list-only

# 下载 PDF 预览
lark-cli drive +preview \
  --file-token "<FILE_TOKEN>" \
  --type pdf \
  --output ./artifacts/report

# 下载文本预览，并在目标已存在时自动改名
lark-cli drive +preview \
  --file-token "<FILE_TOKEN>" \
  --type text \
  --output ./artifacts/report \
  --if-exists rename

# 指定版本号查询/下载
lark-cli drive +preview \
  --file-token "<FILE_TOKEN>" \
  --version "12" \
  --type html \
  --output ./artifacts/report.html
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 条件必填 | Drive 文件 token；与 `--url` / `--wiki-token` 三选一 |
| `--url` | 条件必填 | 飞书文件 URL 或 Wiki URL；CLI 自动解析类型和 token |
| `--wiki-token` | 条件必填 | 裸 Wiki node token；CLI 先解析到底层 Drive 文件 |
| `--type` | 条件必填 | 预览类型；优先使用 `--list-only` 返回的 `type`，如 `pdf` / `html` / `text` / `png` / `jpg` / `source_file` |
| `--version` | 否 | 文件版本号 |
| `--list-only` | 否 | 仅返回候选项，不下载 |
| `--output` | 条件必填 | 下载到本地的输出路径 |
| `--if-exists` | 否 | 输出冲突策略：`error`（默认）/ `overwrite` / `rename` |

### 输出约定

- 查询态返回：
  - `mode=list`
  - `file_token`
  - `candidates[]`
  - `next_action`
- 下载态返回：
  - `mode=download`
  - `file_token`
  - `selected_type`
  - `output_path`
  - `status`

### 候选项字段

`candidates[]` 中每个对象包含：

- `type`
- `type_code`
- `label`
- `status`
- `status_code`
- `downloadable`
- `reason`（可选）

### 关键约束

- 不传 `--list-only` 时，必须显式传 `--type` 和 `--output`
- 不会隐式选择“第一个候选项”作为默认下载目标
- `--type source_file` 用于查看文件内容，不依赖 `--list-only` 返回的候选项；它适合读取或保存源内容，不等同于 PDF/text/image 等转换预览
- 候选项状态来自后端 `preview_status` 枚举，例如 `READY` / `PROCESSING` / `FAILED` / `NO_SUPPORT`
- 本地文件名在未显式带扩展名时，会结合响应头自动补扩展名
- Wiki URL / 裸 Wiki node token 会先解析到底层文档，解析后会在输出里附带 `wiki_token` 和 `wiki_node`（含底层 `obj_token`/`obj_type`）；`obj_type` 必须是 `file`。如果 Wiki 指向 `docx` / `sheet` / `bitable` / `slides` 等在线文档，`+preview` 无法直接处理，CLI 会返回 typed validation error，并在 hint 中提示改用 [lark-drive-export](lark-drive-0.md#s-c34a363ec7e0cf38)

### 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- Drive 总入口
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-d2127965f26bd7f6"></a>

## references/lark-drive-pull.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +pull

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

把飞书云空间（云盘/云存储）的某个文件夹**单向、文件级**镜像到本地目录（Drive → 本地）。命令递归列出 `--folder-token` 下所有 `type=file` 的文件，逐一下载到 `--local-dir` 对应的相对路径，子文件夹自动复刻为本地目录。

> ⚠️ **不是 directory-level mirror**：`--delete-local` 只删除本地"多余"的常规文件，不删除空目录。如果云端把整个子文件夹删了，对应的本地子目录会留空（里面的文件被清掉，目录本身保留）；想精确同步目录结构请自己 `rmdir` 处理空壳。

输出按"动作"分类：

| 字段 | 含义 |
|------|------|
| `summary.downloaded` | 成功下载的文件数 |
| `summary.skipped` | 因 `--if-exists=skip` 或 `--if-exists=smart` 命中“无需下载”而跳过的文件数 |
| `summary.failed` | 下载或写盘失败的文件数 |
| `summary.deleted_local` | 启用 `--delete-local --yes` 时删除的本地文件数 |
| `items[]` | 每个文件的明细（`rel_path` / `file_token` / `source_id` / `action` / 失败时的 `error`） |

`summary.failed > 0` 时命令以 **非零状态码**（`exit=1`）退出：同一份 `summary + items` 会以 `ok:false` 部分失败信封写到 **stdout**（字段在 `data.summary` / `data.items`），stderr 不再输出单独的错误信封；脚本/agent 直接通过 exit code 判断成败即可，不需要再去解 `summary.failed`。

## 远端同名文件冲突

如果 Drive 中多个条目映射到同一个 `rel_path`，默认直接失败（stderr 类型化错误信封：`error.type=validation`、`error.subtype=failed_precondition`，`error.params[]` 逐条列出冲突的 `rel_path` 及碰撞条目），且不会下载、覆盖或删除任何本地文件。只有“多个 `type=file` 同名”的场景支持显式策略；`file-folder` 这类异构冲突始终直接失败。

| 策略 | 行为 |
|------|------|
| `fail` | 默认。返回所有冲突条目的完整信息，不写盘 |
| `rename` | 仅适用于 duplicate file。下载全部重复文件；第一个保留原名，后续文件使用稳定 hash 后缀生成唯一文件名；若短后缀目标已被占用，会自动升级到更强后缀 |
| `newest` | 只下载 `modified_time` 最新的远端文件 |
| `oldest` | 只下载 `created_time` 最早的远端文件 |

`rename` 命名规则稳定且可追溯：`report.pdf` 的后续重复项会落盘为 `report__lark_<hash>.pdf`，例如 `report__lark_3a2f4c5d6e7f.pdf`。如果这个短 hash 目标名已经被同目录下的其他远端对象占用，CLI 会自动改用更长的稳定 hash，必要时再追加序号后缀，直到目标名唯一。此模式下 `items[]` 不再返回可直接复用的 Drive `file_token`；CLI 会在 `source_id` 中返回稳定 hash 标识符，供日志、比对和人工排查使用。

## 命令

```text
# 基础用法 —— 把云端 fldcXXX 镜像到 ./repo
lark-cli drive +pull --local-dir ./repo --folder-token fldcnxxxxxxxxx

# 推荐的重复同步用法：smart 会按 modified_time 跳过已经对齐的本地文件
lark-cli drive +pull --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists smart

# 已存在的本地文件保持不动
lark-cli drive +pull --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists skip

# 云端有多个同名二进制文件时，显式下载全部并用稳定 hash 后缀改名
lark-cli drive +pull --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --on-duplicate-remote rename

# 文件级镜像：下载新文件 + 删除云端没有的本地文件（不删空目录）
# （--delete-local 必须搭配 --yes，否则会被 Validate 直接拒绝）
lark-cli drive +pull --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --delete-local --yes
```

## 参数

| 标志 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--local-dir` | 是 | path | 本地根目录（**必须是 cwd 的相对路径**；绝对路径或逃出 cwd 的相对路径会被 CLI 直接拒绝） |
| `--folder-token` | 是 | string | 源 Drive 文件夹 token |
| `--if-exists` | 否 | enum | 本地文件已存在时的策略：`overwrite`（**默认**，Drive 作为权威源时使用）/ `smart`（**推荐用于重复增量同步**；当本地 mtime 已与远端 `modified_time` 匹配或更新时跳过下载）/ `skip` |
| `--on-duplicate-remote` | 否 | enum | 云端多个条目映射到同一个 `rel_path` 时的策略：`fail`（默认）；如果冲突全是 `type=file`，还可选 `rename` / `newest` / `oldest` |
| `--delete-local` | 否 | bool | 删除本地"云端没有的常规文件"（**不删空目录**，因此是 file-level mirror）；**必须配合 `--yes`** |
| `--yes` | 否 | bool | 确认 `--delete-local`；不传时该破坏性操作在 Validate 阶段被拒绝 |

## 比较与下载范围

- **只下载 Drive `type=file` 的二进制文件**。在线文档（`docx` / `sheet` / `bitable` / `mindnote` / `slides`）和快捷方式（`shortcut`）会被跳过 —— 它们没有等价的本地二进制可写盘，否则会变成产生噪声的"假"下载。
- 子文件夹会递归遍历；rel_path 形如 `sub1/sub2/file.txt`，本地缺失的父目录会被自动创建。
- 已存在的本地文件按 `--if-exists` 决定 `overwrite` / `smart` / `skip`。其中 **`smart` 是推荐的重复同步模式**：只要本地 mtime 在远端时间精度下已经等于或晚于远端 `modified_time`，就跳过下载；时间戳缺失/非法时会退回安全路径继续下载，不会盲跳。想做 `keep-both` 这类的仍需自己改名再 pull。
- 云端同名冲突默认失败；只有“冲突全是 `type=file`”且传了 `--on-duplicate-remote rename|newest|oldest` 时才会继续。

## --delete-local 的安全行为

`--delete-local` 是命令里**唯一的破坏性 flag**，会按"本地有但云端没有"清理本地常规文件。设计上把它跟 `--yes` 强绑定，且与下载阶段的失败联动：

- `--delete-local`（无 `--yes`）→ Validate 直接报错：`--delete-local requires --yes`，没有任何下载、列表请求或删除发生。
- `--delete-local --yes`，**且下载阶段全部成功** → 扫一遍 `--local-dir` 下所有常规文件，把不在云端清单里的逐个 `os.Remove`。**只删常规文件，不删目录**：远端文件夹被删除后，对应本地目录会保留空壳。
- `--delete-local --yes`，**但下载阶段有任何条目失败** → **跳过整个删除阶段**，命令以 `ok:false` 部分失败结果非零退出。设计意图：避免出现"前面下载失败、后面继续删本地文件"的半同步状态；操作者修好下载错误后再重跑即可。
- 远端同名文件冲突且使用默认 `fail` → 在下载阶段前失败，删除阶段不会运行。
- 不传 `--delete-local` → `summary.deleted_local` 永远是 0；命令对本地"多余"文件视而不见。

第 6 章里把 `+pull --delete-local` 标了 `high-risk-write`，CLI 这边的实现等价于"未传 `--yes` 时拒绝执行"，符合该约束的精神。

## 输出 schema

```json
{
  "summary": {
    "downloaded": 0,
    "skipped": 0,
    "failed": 0,
    "deleted_local": 0
  },
  "items": [
    {"rel_path": "...", "file_token": "...", "action": "downloaded"},
    {"rel_path": "...", "source_id": "hash_3a2f4c5d6e7f", "action": "downloaded"},
    {"rel_path": "...", "source_id": "hash_3a2f4c5d6e7f", "action": "failed", "error": "..."},
    {"rel_path": "...", "action": "deleted_local"},
    {"rel_path": "...", "action": "delete_failed", "error": "..."}
  ]
}
```

`rel_path` 始终用 `/` 作为分隔符（跨平台一致）。删除条目（`deleted_local` / `delete_failed`）没有 `file_token`。`rename` 模式下，duplicate 文件条目会返回 `source_id` 而不是可调用 API 的真实 `file_token`；其余模式仍返回真实 `file_token`。

## 性能注意

- 默认 `overwrite` 下，重复跑会重新下载所有命中的同名文件；`skip` 下则完全不碰已存在文件；**`smart` 下才会按 `modified_time` 跳过已经对齐的本地文件**，适合重复增量同步。
- 想更精细地控制下载量，可以先 `+status` 找出 `new_remote` 和 `modified`，再只对这些文件单独 `+download`；或者直接在整目录同步时使用 `--if-exists smart`。
- 大文件会用 SDK 的流式下载（不会把整个 body 读进内存），但本地磁盘空间需要够。

## 所需 scope

| 操作 | scope |
|------|-------|
| 列出文件夹 / 子目录 | `drive:drive.metadata:readonly` |
| 下载文件 | `drive:file:download` |

如果当前 token 缺这些 scope，命令会直接报 `missing_scope` 并提示重新登录。`drive:drive` 在部分企业被策略禁用，所以 +pull 故意只声明上面这两个细粒度 scope。

## 范围限制

`--local-dir` 只接受 cwd 内的相对路径。CLI 会先 `EvalSymlinks` 整条路径，再判断它是否仍落在 cwd 内 —— **指向 cwd 外的符号链接也会被拒**，"在 cwd 内放一条软链指向外面" 这条捷径走不通，会直接撞上 `unsafe file path`。

如果用户想 pull 到 cwd 之外的目录，**不要 agent 自己 `cd` 绕过**。可以选：让用户在外部把 agent 工作目录切换到目标的祖先后重启会话；或者把目标整体物理移动 / 拷贝到 cwd 内（不是软链）；或者直接放弃这次同步，改用别的方式。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) —— 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） —— 认证和全局参数
- [lark-drive-status](lark-drive-0.md#s-564c2eed90faa255) —— 下载前先看差异
- [lark-drive-download](lark-drive-0.md#s-e71db3c18178ec5e) —— 单文件按需拉取


<a id="s-6263f350dc70a48f"></a>

## references/lark-drive-push.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +push

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

把本地目录**单向、文件级**镜像到飞书云空间（云盘/云存储）的某个文件夹（本地 → Drive）。命令递归列出 `--folder-token` 下的远端清单，遍历 `--local-dir` 的所有常规文件，按相对路径在 Drive 上新建、覆盖或跳过；可选地（`--delete-remote --yes`）删除云端"本地没有"的 `type=file`。

> **"文件级镜像"≠"目录镜像"。** 命令只在文件维度收敛差异：本地多了文件就上传，本地少了文件且开了 `--delete-remote --yes` 就删远端文件。**远端只有的空目录、本地已删除的目录**都不会被收敛，云端目录树的多余结构不会被清理。如果需要"目录也要保持完全一致"，得自行先 `+status` 找差异、再手动处理多余目录。

输出按"动作"分类：

| 字段 | 含义 |
|------|------|
| `summary.uploaded` | 成功新建或覆盖的文件数 |
| `summary.skipped` | 因 `--if-exists=skip` 或 `--if-exists=smart` 命中“无需传输”而跳过的文件数 |
| `summary.failed` | 上传 / 覆盖 / 建目录 / 删除失败的条目数；**只要不为 0，命令就以非零状态退出**（结构化 `items[]` 仍在 stdout 上） |
| `summary.deleted_remote` | 启用 `--delete-remote --yes` 时删除的云端文件数 |
| `summary.aborted` | 命中终止性错误并停止后续批处理时为 `true` |
| `items[]` | 每个条目的明细（`rel_path` / `file_token` / `action` / 覆盖时的 `version` / `size_bytes` / 失败时的 `error` / `hint` / `phase` / `error_class` / `code` / `subtype` / `retryable`） |

`items[].action` 取值：`uploaded` / `overwritten` / `skipped` / `folder_created` / `deleted_remote` / `already_deleted` / `failed` / `delete_failed`。

> 本地目录（包括空目录）会被镜像到 Drive；新建的子目录会以 `action: "folder_created"` 出现在 `items[]` 里，但**不计入** `summary.uploaded`（该字段只数文件）。已存在的远端目录复用其 token，不会重复 `create_folder`，也不会出现在 `items[]` 里。

## 远端同名文件冲突

如果 Drive 中多个条目映射到同一个 `rel_path`，默认直接失败（stderr 类型化错误信封：`error.type=validation`、`error.subtype=failed_precondition`，`error.params[]` 逐条列出冲突的 `rel_path` 及碰撞条目），且不会上传、覆盖或进入 `--delete-remote` 删除阶段。只有“多个 `type=file` 同名”的场景支持显式策略；`file-folder` 这类异构冲突始终直接失败。

| 策略 | 行为 |
|------|------|
| `fail` | 默认。返回所有冲突条目的完整信息，不写远端 |
| `newest` | 只把本地文件与 `modified_time` 最新的远端文件对齐 |
| `oldest` | 只把本地文件与 `created_time` 最早的远端文件对齐 |

`+push` 不提供 `rename`：本地一个文件无法表达要覆盖多个远端对象。若用户想保留多个云端副本，应先显式整理云端文件，再重新 push。

## 命令

```text
# 基础用法 —— 把本地 ./repo 推送到云端 fldcXXX
# 默认 --if-exists=skip：已经存在的远端文件保持不动，只新增、不覆盖。
lark-cli drive +push --local-dir ./repo --folder-token fldcnxxxxxxxxx

# 重复同步时可用 smart 做增量优化：它会按 modified_time 跳过已对齐的远端文件；但如果远端更旧，仍会继续走覆盖路径
lark-cli drive +push --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists smart

# 显式覆盖远端同名文件（依赖 upload_all 的灰度协议字段，详见下文"覆盖语义"）
lark-cli drive +push --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists overwrite

# 云端已有多个同名二进制文件时，显式选择一个远端目标再覆盖
lark-cli drive +push --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists overwrite --on-duplicate-remote newest

# 文件级镜像同步：上传 / 覆盖 + 删除本地不存在的远端文件
# （--delete-remote 必须搭配 --yes，否则会被 Validate 直接拒绝；
#   且 Validate 阶段会动态检查 space:document:delete scope，缺权限会立刻失败，
#   不会出现"上传成功了但是后面删除阶段挂了"的半同步状态）
lark-cli drive +push --local-dir ./repo --folder-token fldcnxxxxxxxxx \
  --if-exists overwrite --delete-remote --yes
```

## 参数

| 标志 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--local-dir` | 是 | path | 本地根目录（**必须是 cwd 的相对路径**；绝对路径或逃出 cwd 的相对路径会被 CLI 直接拒绝） |
| `--folder-token` | 是 | string | 目标 Drive 文件夹 token |
| `--if-exists` | 否 | enum | 远端文件已存在时的策略：`skip`（**默认**，安全）/ `smart`（用于重复增量同步；当远端 `modified_time` 已匹配或更新时跳过上传，否则继续走覆盖路径）/ `overwrite`（依赖灰度后端协议，详见"覆盖语义"） |
| `--on-duplicate-remote` | 否 | enum | 云端多个条目映射到同一个 `rel_path` 时的策略：`fail`（默认）；如果冲突全是 `type=file`，还可选 `newest` / `oldest` |
| `--delete-remote` | 否 | bool | 删除云端本地不存在的文件（文件级镜像；**不会**清理远端只有的目录）；**必须配合 `--yes`**，且 Validate 阶段会动态检查 `space:document:delete` scope |
| `--yes` | 否 | bool | 确认 `--delete-remote`；不传时该破坏性操作在 Validate 阶段被拒绝 |

## 上传与目录复刻范围

- **只上传 / 覆盖 / 删除 Drive `type=file`**。在线文档（`docx` / `sheet` / `bitable` / `mindnote` / `slides`）和快捷方式（`shortcut`）即使在同一 rel_path 下出现，也不会被覆盖或删除 —— 它们没有等价的本地二进制。
- **本地目录结构整体被镜像**：所有子目录（含**空目录**）会按需在 Drive 上 `create_folder`；同名远端目录复用其 token，不重建。空目录不计入 `summary.uploaded`，但会在 `items[]` 里以 `folder_created` 形式留痕。
- 已存在的远端文件按 `--if-exists` 决定 `overwrite` / `smart` / `skip`。其中 `smart` 是**增量优化模式**：只要远端 `modified_time` 在同等时间精度下已经等于或晚于本地 mtime，就跳过上传；时间戳缺失/非法时会退回安全路径继续上传，不会盲跳。**但如果远端更旧，`smart` 会继续走和 `overwrite` 相同的覆盖路径，因此也继承同样的 rollout / version 返回 caveat。** 想做 `keep-both` 这类的仍需自行改名再 push。
- 云端同名冲突默认失败；只有“冲突全是 `type=file`”且传了 `--on-duplicate-remote newest|oldest` 时才会选择一个远端文件继续。启用 `--delete-remote` 时，未被选中的 duplicate sibling 也会被删除，最终远端只保留一个被选中的文件副本；只有在 `--if-exists=overwrite` 成功时，才能保证该副本内容与本地对齐。

## 覆盖语义

`--if-exists=overwrite` 走 `POST /open-apis/drive/v1/files/upload_all`，并在 form 中带上现有文件的 `file_token`，由后端原地更新内容并返回新版本号。`items[].version` 字段会回填该版本号。

`--if-exists=smart` 是给“重复跑同步”的场景增加的增量优化：当远端 `modified_time` 在同等时间精度下已经等于或晚于本地 mtime 时，命令会把该文件计为 `skipped`；时间戳缺失、非法或更旧时，则继续走正常上传/覆盖路径。**也就是说，只要 smart 判定“远端不够新”，它就会进入与 `--if-exists=overwrite` 相同的覆盖实现，因此在未 rollout version 字段的 tenant 上仍可能非零失败。**

> **为什么默认是 `skip` 而不是 `overwrite`：** `upload_all` 接受 `file_token` 字段、并在响应里返回 `version` 是设计文档（Drive 同步盘）规定的协议；此后端尚在灰度发布。在还未开通该字段的 tenant 上，`--if-exists=overwrite` 会因"无 version 返回"而把对应文件标成 `failed`，整次 `+push` 也会因此非零退出。所以默认值故意定为 `skip`：第一次往一个已经有内容的目录里 push，不会因为协议没到位就把整次运行打挂；要真的覆盖远端，必须显式带 `--if-exists overwrite`。新建上传不依赖该字段，不受影响。

大文件（>20MB）会自动切到三段式 `upload_prepare` / `upload_part` / `upload_finish`；该路径下 `version` 暂未在响应中返回，覆盖结果中 `items[].version` 会留空，但 `file_token` 与 `action: overwritten` 仍会正确产出。

## --delete-remote 的安全行为

`--delete-remote` 是命令里**唯一的破坏性 flag**，会按"远端有但本地没有"逐个 `DELETE /open-apis/drive/v1/files/<token>?type=file` 清理云端副本。设计上把它跟 `--yes` 强绑定：

- `--delete-remote`（无 `--yes`）→ Validate 直接报错：`--delete-remote requires --yes`，不会发起任何列表 / 上传 / 删除请求。
- `--delete-remote --yes` → Validate 阶段还会**动态做一次** `space:document:delete` 的 scope 预检：缺这条 scope 时整次运行立刻失败、不发任何上传请求，避免出现"上传都成功了，但删除阶段才报 missing_scope"的半同步状态。
- `--delete-remote --yes`（且 scope 已授权）→ 正常执行：先把本地文件 push 上去，再扫一遍远端 `type=file` 列表，把不在本地清单里的逐个删除。**任何上传 / 覆盖 / 建目录失败时，整段 `--delete-remote` 阶段会被跳过**（stderr 上有提示），命令以非零状态退出，远端不会被破坏。
- 删除阶段如果服务端返回 `1061007 file has been delete`，说明目标远端文件在本次 DELETE 前已经不存在；这已经满足 `--delete-remote` 的目标状态，输出会记为 `action: "already_deleted"`，不计入 `summary.failed`，也不计入 `summary.deleted_remote`。
- 远端同名冲突且使用默认 `fail`，或冲突里混有 folder / 其他非 `type=file` 对象 → 在上传阶段前失败，删除阶段不会运行。
- 不传 `--delete-remote` → `summary.deleted_remote` 永远是 0；命令对远端"多余"文件视而不见。
- 在线文档（docx / sheet / bitable / ...）和快捷方式即使本地完全没有同名文件，也**不会**进入删除候选，因为它们从来不进 `summary.uploaded` 的对齐域。
- **远端只有的空目录、本地已删除的目录**也不会被清理 —— 这是"文件级镜像"的语义边界，命令不会对目录结构做主动收敛。

第 6 章里把 `+push --delete-remote` 标了 `high-risk-write`，CLI 这边的实现等价于"未传 `--yes` 时拒绝执行 + 动态 scope 预检"，符合该约束的精神。

## 输出 schema

```json
{
  "summary": {
    "uploaded": 0,
    "skipped": 0,
    "failed": 0,
    "deleted_remote": 0,
    "aborted": false
  },
  "items": [
    {"rel_path": "...", "file_token": "...", "action": "folder_created"},
    {"rel_path": "...", "file_token": "...", "action": "uploaded",       "size_bytes": 0},
    {"rel_path": "...", "file_token": "...", "action": "overwritten",    "version": "...", "size_bytes": 0},
    {"rel_path": "...", "file_token": "...", "action": "skipped",        "size_bytes": 0},
    {"rel_path": "...",                       "action": "failed",        "size_bytes": 0, "error": "...", "hint": "...", "phase": "upload", "error_class": "...", "code": 0, "subtype": "...", "retryable": false},
    {"rel_path": "...", "file_token": "...", "action": "deleted_remote"},
    {"rel_path": "...", "file_token": "...", "action": "already_deleted"},
    {"rel_path": "...", "file_token": "...", "action": "delete_failed",  "error": "...", "hint": "...", "phase": "delete", "error_class": "...", "code": 0, "subtype": "...", "retryable": false}
  ]
}
```

`rel_path` 始终用 `/` 作为分隔符（跨平台一致）。

## 失败处理与 agent 行为

`+push` 的失败项带结构化字段，agent 必须优先读 `items[].error_class` / `phase` / `code`，不要只看自然语言 `error` 文本。`summary.aborted=true` 表示命令已经遇到终止性错误并停止后续批处理；这时**不要原样重试**，先修复根因。

`retryable=true` 只表示修复根因或等待后可以再次尝试，不表示应该立即、无限重放整个 push；重试时采用有上限的指数退避和抖动。

常见终止性错误：

| `error_class` | 常见 `code` | 含义 | Agent 应对 |
|---|---:|---|---|
| `app_scope_missing` | `99991672` | 应用身份缺少 Drive / 文件夹相关 scope | 停止重试，引导开通错误里列出的应用身份权限，例如 `space:folder:create` 或 `drive:drive` |
| `user_scope_missing` | `99991679` | 用户身份缺少授权 | 停止重试，走 `lark-cli auth login --scope ...` 补错误里列出的 scope |
| `permission_denied` | `1061004` / HTTP 403 | 当前身份无权操作目标资源 | 停止重试，检查目标文件夹权限、身份类型（user / bot）和资源可见性 |
| `invalid_api_parameters` | `1061002` | API 参数被服务端拒绝 | 停止重试，检查 `--folder-token`、覆盖模式、`file_token`、文件名和上传参数；不要对同一参数组合批量重试 |
| `parent_node_missing` | `1061044` | 上传 / 建目录使用的父文件夹不存在或当前身份不可见 | 停止重试，检查 `--folder-token` 是否仍存在、是否有权限、父目录是否在 push 过程中被删除；不要继续上传同一目录树 |
| `parent_sibling_limit` | `1062507` | 目标父文件夹单层子节点数量超过上限 | 停止重试，清理目标目录、换一个 `--folder-token`，或把上传内容拆到多个子目录 |
| `quota_exceeded` | `1061101` / `1061061` | 租户或当前用户的 Drive 容量配额已满 | 停止重试，释放容量、调整目标位置或扩容后再执行 push |
| `rate_limited` | `99991400` | 触发频控 | 停止当前批次，退避后再重试 |
| `conflict` | `1061045` | 同一目标发生资源竞争 | 停止当前批次，避免并发操作同一目标；退避后有限重试 |
| `server_error` | `1663` / `1061001` / `2200` / HTTP 5xx | Drive 服务端或网关异常 | 停止当前批次，稍后有限重试 |

非终止但需要解释的状态：

- `file_size_limit` / `1061043`：文件超过 Drive 上传限制。不要继续尝试同一文件；改拆分或换存储方式。
- `upload_size_mismatch` / `1062009`：本地文件在上传过程中发生变化，或声明大小与实际读取大小不一致。重新扫描本地文件后再 push。
- `remote_not_found` / `1061007`：一般表示远端文件已不存在。删除阶段的 `1061007` 会被视为 `already_deleted` 成功项；其他阶段需重新列表确认远端状态。

## 性能注意

- 默认 `skip` 下，已存在的远端文件一律不碰；`overwrite` 下，重复跑会重传所有命中的同名文件；`smart` 下会按 `modified_time` 跳过已对齐的远端文件，但对“远端更旧”的文件仍会进入覆盖路径，因此它减少的是**不必要的重传**，不是把覆盖风险完全拿掉。
- 想更精细地控制传输量，可以先 `+status` 找出 `new_local` 和 `modified`，再只对这些文件单独上传 / 覆盖；或者直接在整目录同步时使用 `--if-exists smart`。
- 大文件会用三段式分片上传（不会把整个 body 读进内存），但本地磁盘和上行带宽需要够。

## 所需 scope

| 操作 | scope | 是否在命令上预声明 |
|------|-------|-------------------|
| 列出文件夹 / 子目录 | `drive:drive.metadata:readonly` | ✅ 预声明 |
| 上传 / 覆盖文件 | `drive:file:upload` | ✅ 预声明 |
| 新建子目录（`create_folder`） | `space:folder:create` | ✅ 预声明 |
| 删除文件（仅 `--delete-remote --yes`） | `space:document:delete` | ⚙️ 不在命令默认 Scopes 里，但在 `--delete-remote --yes` 时由 Validate 动态预检 |

`drive:drive` 在部分企业被策略禁用，所以 +push 故意只声明上面这几条细粒度 scope。

> **关于 `space:document:delete`：** 框架的 scope 预检（`runner.go: checkShortcutScopes`）会在 `Validate` 和 `--dry-run` 之前就把命令上声明的 scope 全检查一遍；如果把删除 scope 也预声明，**普通上传或 dry-run** 都会因为没授权删除权限而被拦下来。所以这一项不放在命令的默认 Scopes 里，而是在 Validate 中**条件触发**：只有 `--delete-remote --yes` 同时打开时才会调用 `runtime.EnsureScopes([]string{"space:document:delete"})` 做一次动态前置校验。这样既保留了"普通上传不需要删除权限"的便利，又能在真要做镜像删除前把 scope 缺失暴露出来，避免出现"上传成功 → 删除阶段才挂"的半同步状态。
>
> 想一次性把权限补齐：`lark-cli auth login --scope "drive:drive.metadata:readonly drive:file:upload space:folder:create space:document:delete"`。

## 范围限制

`--local-dir` 只接受 cwd 内的相对路径。CLI 会先 `EvalSymlinks` 整条路径，再判断它是否仍落在 cwd 内 —— **指向 cwd 外的符号链接也会被拒**，"在 cwd 内放一条软链指向外面" 这条捷径走不通，会直接撞上 `unsafe file path`。

如果用户想 push cwd 之外的目录，**不要 agent 自己 `cd` 绕过**。可以选：让用户在外部把 agent 工作目录切换到目标的祖先后重启会话；或者把目标整体物理移动 / 拷贝到 cwd 内（不是软链）；或者直接放弃这次同步，改用别的方式。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) —— 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） —— 认证和全局参数
- [lark-drive-status](lark-drive-0.md#s-564c2eed90faa255) —— 上传前先看差异（避免全量回写）
- [lark-drive-pull](lark-drive-0.md#s-d2127965f26bd7f6) —— Drive → 本地的对称命令
- [lark-drive-upload](lark-drive-0.md#s-04b9ae35ec99a8aa) —— 单文件按需上传


<a id="s-e0d802deed5e42ef"></a>

## references/lark-drive-react-reply.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +react-reply

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。reaction 查询规则、语义联想与完整 `reaction_type` 枚举见跨切面专题 [`lark-drive-reactions.md`](lark-drive-0.md#s-d0ccd3f6a04918f3)。

给一条回复添加或删除表情回应（reaction）。操作对象始终是 `reply_id`。

## 命令

```text
# 加 reaction
lark-cli drive +react-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --reply-id '<id>' --emoji THUMBSUP --action add

# 删除自己加的 reaction：仍需传要删除的那个 --emoji
lark-cli drive +react-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --reply-id '<id>' --emoji THUMBSUP --action delete
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--reply-id` | 是 | 要操作的回复 ID；来自 `drive +list-replies` 的 `items[].reply_id`。给“这条评论”加/删表情时取该评论根回复（第一页 `items[0]`）的 `reply_id` |
| `--emoji` | 是 | `reaction_type` 值，大小写敏感；本地按平台枚举校验。完整列表与语义映射见 [`lark-drive-reactions.md`](lark-drive-0.md#s-d0ccd3f6a04918f3) |
| `--action` | 是 | `add` 添加；`delete` 删除当前身份自己加的 reaction |

## 行为说明

- `--emoji` 大小写敏感（如 `THUMBSUP` 与 `ThumbsDown`），并做本地枚举校验兜底。服务端不校验 `reaction_type`：任意字符串都会被接受并持久化成一条损坏的 reaction，所以本地校验是唯一防线；直接调原生命令时必须自行保证取值合法。
- add / delete 幂等：重复添加已有 reaction、删除不存在的 reaction 都会成功返回且无副作用；delete 只取消当前身份自己加的 reaction。
- 对根回复操作等价于给评论本身加 / 删表情。
- 读回 reaction：在 `drive +list-replies` / `drive +batch-query-comments` 上带 `--need-reaction`；`count=0` 的条目是已删除 reaction 的残留，判断存在与否按 `count>0` 过滤。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "reply_id": "<reply_id>",
  "reaction_type": "THUMBSUP",
  "action": "add",
  "updated": true
}
```

## 参考

- [lark-drive-reactions](lark-drive-0.md#s-d0ccd3f6a04918f3) -- reaction 查询规则、语义与完整枚举
- [lark-drive-list-replies](lark-drive-0.md#s-4f8de3d1bf0a5ce4) -- 获取 reply_id


<a id="s-d0ccd3f6a04918f3"></a>

## references/lark-drive-reactions.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive reactions

> **前置条件：** 先阅读 [`../SKILL.md`](lark-drive-0.md#s-c99c77320f67806c) 了解 Drive 评论入口，再阅读 [`lark-drive-list-comments.md`](lark-drive-0.md#s-1d2de165cd3c3e19) 了解评论卡片模型、评论数/回复数统计口径、`file_token` / `file_type` 规则；同时阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

处理文档评论 / 回复上的 reaction（点赞、表情、各表情数量、谁点了什么、添加/删除表情）。这个场景不常见，但规则比较集中：查询时只有在用户明确需要 reaction 信息时才在 `drive +list-comments` / `+batch-query-comments` / `+list-replies` 上带 `--need-reaction`；写入优先使用 `drive +react-reply`（命令参数细节见 [`lark-drive-react-reply.md`](lark-drive-0.md#s-e0d802deed5e42ef)），操作对象始终是 `reply_id`。本文是跨切面专题，集中放 reaction 的查询规则、语义联想和完整枚举。

> [!IMPORTANT]
> **`reaction_type` 只能使用本文下方“完整 `reaction_type` 列表”中定义的枚举值。**
> 不要自由填写、不要根据自然语言临时编造、也不要把列表里的 mixed-case 值改写成别的大小写形式。需要写入时，只能从下方枚举中原样选择并传参。

## 何时使用

- 用户明确要求查看评论 / 回复上的 reaction（表情）。
- 用户要统计某条评论卡片有哪些表情、各表情数量，或要看谁点了什么。
- 用户要给评论或回复添加 / 删除 reaction。

## 查询规则

- `drive +list-comments`、`drive +batch-query-comments`、`drive +list-replies` 都支持 `--need-reaction`。
- `--need-reaction` 只在用户明确需要 reaction 信息时再带；如果用户只关心评论正文、回复正文、评论数 / 回复数，默认不要加。
- 遍历评论卡片并顺带拿 reaction：使用 `drive +list-comments --need-reaction`。
- 已知评论 ID，批量查看 reaction：使用 `drive +batch-query-comments --need-reaction`。
- 某张评论卡片下继续翻页拉 reply reaction：使用 `drive +list-replies --need-reaction`，每一页都要持续带。
- 返回形状：`items[].reactions[]` 为 `{reaction_key, count, ahead_users[]}`；**`count=0` 的条目是已删除 reaction 的残留，统计与判断是否存在都要按 `count>0` 过滤**。

## 查询示例

```text
# 遍历评论卡片，并把 reaction 一起拿回来
lark-cli drive +list-comments --url '<DOC_URL>' --need-reaction

# 已知 comment_id，批量查询评论卡片 reaction
lark-cli drive +batch-query-comments --url '<DOC_URL>' --comment-ids '<COMMENT_ID>' --need-reaction

# 继续翻某张评论卡片下的 replies，并把 reaction 一起拿回来
lark-cli drive +list-replies --url '<DOC_URL>' --comment-id '<COMMENT_ID>' --need-reaction
```

## 写入规则

- 添加 / 删除 reaction 优先使用 `drive +react-reply`；命令参数、目标定位和 dry-run 见 [`lark-drive-react-reply.md`](lark-drive-0.md#s-e0d802deed5e42ef)。
- 操作对象是 `reply_id`（来自 `drive +list-replies` 的 `items[].reply_id`），不是 `comment_id`。
- 如果用户说要给"这条评论"加 / 删 reaction，取该评论卡片根回复（第一页 `items[0]`）的 `reply_id` 再操作。
- add / delete 幂等：重复添加已有 reaction、删除不存在的 reaction 都会成功返回且无副作用；delete 只取消当前身份自己加的 reaction。
- **服务端不校验 `reaction_type`：任意字符串都会被接受并持久化成一条损坏的 reaction**；`+react-reply --emoji` 会按平台枚举做本地校验兜底，直接调原生命令时必须自行保证取值合法。
- 原生 `drive file.comment.reply.reactions update_reaction` 只在需要 shortcut 未暴露的字段时兜底使用，`--params` 带 `file_token`/`file_type`，`--data` 传 `action=add|delete`、`reply_id`、`reaction_type`。

## 写入示例

```text
# 给某条 reply 添加一个点赞 reaction
lark-cli drive +react-reply --url '<DOC_URL>' \
  --reply-id '<REPLY_ID>' --emoji THUMBSUP --action add

# 删除某条 reply 上已有的 DONE reaction（wiki URL 自动解包）
lark-cli drive +react-reply --url '<WIKI_URL>' \
  --reply-id '<REPLY_ID>' --emoji DONE --action delete

# 原生命令兜底（注意：原生路径没有本地枚举校验）
lark-cli drive file.comment.reply.reactions update_reaction \
  --params '{"file_token":"<DOC_TOKEN>","file_type":"docx"}' \
  --data '{"action":"add","reply_id":"<REPLY_ID>","reaction_type":"THUMBSUP"}'
```

> [!CAUTION]
> `update_reaction` 是写入操作。执行前必须确认用户意图，不要默认替用户点表情。

## `reaction_type` 使用规则

- `reaction_type` 必须传平台定义的枚举字符串，大小写敏感；`drive +react-reply` 的 `--emoji` 会本地校验（原生命令不校验、服务端也不校验）。
- 不要擅自把 mixed-case 值改成全大写，例如 `Yes`、`No`、`Get`、`EatingFood`、`CheckMark`、`CrossMark` 都要按原值传。
- **不要编造列表外的 `reaction_type`，也不要把自然语言描述臆造成平台未定义的新枚举**。
- 如果用户给的是自然语言语义（如“点赞”“在处理中”“确认一下”），可以在下方枚举列表内选择语义最接近的现有值；如果是近似映射，应在执行时明确告知用户。

## 常见语义联想

- `Yes`：确认 / 同意 / 批准。
- `No`：拒绝 / 不同意 / 否定。
- `DONE`：已完成 / 已处理。
- `Typing`：正在输入 / 正在处理中 / 正在跟进（近似语义）。
- `OK`：好的 / 收到 / 确认一下。
- `THUMBSUP`：点赞 / 认可。
- `LGTM`：看起来没问题 / 可以继续。

## 完整 `reaction_type` 列表

以下枚举按当前 Drive 评论 reaction 指引维护，使用时请保持原样：

```text
ANGRY, APPLAUSE, ATTENTION, AWESOME, BEAR, BEER, BETRAYED, BIGKISS
BLACKFACE, BLUBBER, BLUSH, BOMB, CAKE, CHUCKLE, CLAP, CLEAVER
COMFORT, CRAZY, CRY, CUCUMBER, DETERGENT, DIZZY, DONE, DONNOTGO
DROOL, DROWSY, DULL, DULLSTARE, EATING, EMBARRASSED, ENOUGH, ERROR
EYESCLOSED, FACEPALM, FINGERHEART, FISTBUMP, FOLLOWME, FROWN, GIFT, GLANCE
GOODJOB, HAMMER, HAUGHTY, HEADSET, HEART, HEARTBROKEN, HIGHFIVE, HUG
HUSKY, INNOCENTSMILE, JIAYI, JOYFUL, KISS, LAUGH, LIPS, LOL
LOOKDOWN, LOVE, MONEY, MUSCLE, NOSEPICK, OBSESSED, OK, PARTY
PETRIFIED, POOP, PRAISE, PROUD, PUKE, RAINBOWPUKE, ROSE, SALUTE
SCOWL, SHAKE, SHHH, SHOCKED, SHOWOFF, SHY, SICK, SILENT
SKULL, SLAP, SLEEP, SLIGHT, SMART, SMILE, SMIRK, SMOOCH
SMUG, SOB, SPEECHLESS, SPITBLOOD, STRIVE, SWEAT, TEARS, TEASE
TERROR, THANKS, THINKING, THUMBSUP, TOASTED, TONGUE, TRICK, UPPERLEFT
WAIL, WAVE, WELLDONE, WHAT, WHIMPER, WINK, WITTY, WOW
WRONGED, XBLUSH, YAWN, YEAH, FIREWORKS, BULL, CALF, AWESOMEN
2021, CANDIEDHAWS, REDPACKET, FORTUNE, LUCK, FIRECRACKER, Yes, No
Get, LGTM, Lemon, EatingFood, Hundred, MinusOne, ThumbsDown, Fire
OKR, Drumstick, BubbleTea, Loudspeaker, Pin, Coffee, Alarm, Trophy
Music, Typing, Pepper, CheckMark, CrossMark
```

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-drive-react-reply](lark-drive-0.md#s-e0d802deed5e42ef) -- `+react-reply` 命令参数
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-fb147dced6b63d1d"></a>

## references/lark-drive-resolve-comment.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +resolve-comment

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

把一条评论标记为已解决。反向操作——重新打开已解决评论——是独立命令 [`lark-drive-restore-comment.md`](lark-drive-0.md#s-584fbfce73e3f3da)。

用户说“把这条评论标记为已处理 / 已完成 / 关闭”对应本命令。

## 命令

```text
# 推荐：完整 URL + 评论 ID
lark-cli drive +resolve-comment --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 要解决的评论 ID；来自 `drive +list-comments` 的 `items[].comment_id` |

## 行为说明

- 这是写操作。
- 对同一条评论连续翻转解决状态可能触发服务端限流（HTTP 429）；连续调用之间留间隔或短暂延迟后重试。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "action": "resolve",
  "is_solved": true,
  "updated": true
}
```

## 参考

- [lark-drive-restore-comment](lark-drive-0.md#s-584fbfce73e3f3da) -- 恢复（重新打开）评论


<a id="s-584fbfce73e3f3da"></a>

## references/lark-drive-restore-comment.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +restore-comment

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理。

恢复 / 重新打开一条已解决的评论。反向操作——把评论标记为已解决——是独立命令 [`lark-drive-resolve-comment.md`](lark-drive-0.md#s-fb147dced6b63d1d)。

用户说“重新打开 / 取消解决 / 恢复这条评论”对应本命令。

## 命令

```text
# 推荐：完整 URL + 评论 ID
lark-cli drive +restore-comment --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 要恢复的评论 ID；来自 `drive +list-comments` 的 `items[].comment_id` |

## 行为说明

- 这是写操作。
- **找目标评论必须带 `--solved-status`**：`drive +list-comments` 默认只返回未解决评论，本命令的目标恰好是已解决评论，直接用默认口径查会一条都找不到。先用 `drive +list-comments --solved-status true`（只看已解决）或 `--solved-status all`（全部）取 `items[].comment_id`。
- 对同一条评论连续翻转解决状态可能触发服务端限流（HTTP 429）；连续调用之间留间隔或短暂延迟后重试。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "action": "restore",
  "is_solved": false,
  "updated": true
}
```

## 参考

- [lark-drive-resolve-comment](lark-drive-0.md#s-fb147dced6b63d1d) -- 解决（标记已解决）评论


<a id="s-cd3b5c8a483e06d9"></a>

## references/lark-drive-search.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +search（云空间/云盘/云存储搜索：扁平 flag，面向自然语言场景）

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

基于 Search v2 接口 `POST /open-apis/search/v2/doc_wiki/search`，支持以**用户身份或应用身份**统一搜索云空间（云盘/云存储）对象。

核心特性：

- 把常用过滤条件全部**扁平化为独立 flag**（`--edited-since`、`--created-by-me`、`--mine`、`--doc-types`、`--folder-tokens` 等），不再要求用户或 AI 手写嵌套 `--filter` JSON
- 额外暴露了 4 个"我"维度：`my_edit_time`（我编辑过）、`my_comment_time`（我评论过）、`open_time`（我打开过）、`create_time`（文档创建时间）——直接对应用户自然语言里的"最近我编辑过的"、"我评论过的"等表达
- 自动处理 `my_edit_time` / `my_comment_time` 的小时级聚合（服务端存储粒度）：亚小时输入会向整点 snap，并在 stderr 打出提示
- `--created-by-me` 一键从当前登录用户的 open_id 填 `original_creator_ids`，匹配“我最初创建的”；`--mine` 仍填 `creator_ids`，匹配 owner / 文档归属人

> **资源发现入口统一**：`drive +search` 同样返回 `SHEET` / `Base` / `FOLDER` 等全部云空间（云盘/云存储）对象，不只是文档 / Wiki。用户说"找一个表格"、"找报表"、"最近打开的表格"时，也从这里开始；定位后再切到对应业务 skill（如 `lark-sheets`）做对象内部操作。

> **身份边界**：普通关键词、类型、文件夹、Wiki 空间、owner/open_id 等显式过滤支持 `--as user` 或 `--as bot`。`--mine` / `--created-by-me` 依赖当前登录用户 open_id 自动填充过滤条件；应用身份下如果没有配置用户 open_id，请改用显式 `--creator-ids` / `--original-creator-ids`。

## 命令

> **关键约束：搜索关键词必须通过 `--query` 传递。**
> 正确：`lark-cli drive +search --query "方案"`
> 错误：`lark-cli drive +search 方案`
> `+search` 不接受位置参数；空 `--query` 或省略 `--query` 表示纯靠 filter 浏览（合法）。
>
> **`--query` 最长 30 个字符**：按字符数（Unicode 码点）算，中文每字算 1 个，与 ASCII 同口径；超过 30 会被服务端拒绝（`99992402 field validation failed`，**是报错不是截断**）。长关键词必须先压缩成核心实体 + 主题词（如把整句问题压成「项目名 + 主题」再搜），不要把整句原问塞进 `--query`。
>
> **按完整标题定位：** 使用 `--only-title`；标题不超过 30 个字符时直接查询，超长标题使用不超过限制的稳定片段召回，再按返回标题严格匹配。使用相同 query 和过滤条件按 `page_token` 检查，最多 3 页；仅在 `has_more=false` 且跨页恰好一个严格匹配时继续写操作，否则请用户缩小范围或补充信息。`drive files list` 只用于枚举已知文件夹的直接子项。
>
> **列表型请求不要硬塞关键词**：如果用户只是要求"我这月创建的所有文档"、"最近半年我编辑过的文档"、"按类型分类统计"这类范围浏览 / 汇总请求，且没有给出标题片段或业务关键词，应使用 `--query ""` 搭配 `--created-by-me`、`--mine`、`--created-*`、`--edited-*`、`--doc-types` 等过滤条件。不要把"查找"、"所有文档"、"最近更新过"、"按类型分类统计"这类动作词或统计意图放进 `--query`，否则会把本来应靠 filter 命中的结果过度收窄。
>
> **标题词 + 正文词联合搜索**：如果用户同时给出标题关键词和正文关键词，并要求同一资源同时满足两项条件，优先执行一条普通联合搜索：`lark-cli drive +search --query "标题词 正文词"`，并在同一条命令中叠加用户指定的 `--folder-tokens`、`--doc-types` 等过滤条件。不要把这种联合搜索拆成“标题搜索 + 正文搜索”后自行拼交集；也不要把 `--only-title` 或 `intitle:` 用作主候选路径。只有用户明确只查标题时，才使用 `--only-title` 或 `intitle:`。
>
> 用户要求最终返回 N 条时，N 是输出上限，不等于 `--page-size N`。逐页根据 `title` 和 `summary_highlighted` 保留同时满足两项条件的候选；有效候选不足 N 且 `has_more=true` 时，保持同一 query 和过滤条件，使用 `--page-token` 继续，最多检查 3 页。摘要不足以判断正文条件时，只对标题已匹配的候选串行读取正文，确认一个再处理下一个，找到 N 条后停止；不要并发拉取正文。检查 3 页后仍不足时，返回已确认结果并建议用户调整标题词、正文词或搜索范围，不要无界扫描。

### 自然语言 → 命令映射速查

| 用户说 | 命令 |
|---|---|
| 标题含某词且正文含某词，限定文件夹内最多 N 个结果（N 为最终输出上限；按上文规则分页筛选，勿作为 `--page-size`） | `lark-cli drive +search --query "标题词 正文词" --folder-tokens <FOLDER_TOKEN>` |
| 我这月创建的所有文档，按类型分类统计 | `lark-cli drive +search --query "" --created-by-me --created-since "<YYYY-MM-DD>" --created-until "<YYYY-MM-DD>"` |
| 最近半年我编辑过的文档，看看哪些最近更新过 | `lark-cli drive +search --query "" --edited-since 6m --sort edit_time` |
| 最近一个月我编辑过的文档 | `lark-cli drive +search --query "" --edited-since 1m` |
| 最近一个月我编辑过 且 我评论过的 | `lark-cli drive +search --query "" --edited-since 1m --commented-since 1m` |
| 最近一周我打开过的表格 | `lark-cli drive +search --query "" --opened-since 7d --doc-types sheet` |
| 我 owner 的所有文档（owner 语义，非"我最初创建"） | `lark-cli drive +search --query "" --mine` |
| 我最初创建、后来转给王五 owner 的文档 | `lark-cli drive +search --query "" --created-by-me --creator-ids ou_wangwu` |
| 我 owner、30-60 天前创建的文档（粗略"上个月"，按 30 天滑窗算；`--mine` 是 owner，`--created-*` 才是文档创建时间） | `lark-cli drive +search --query "" --mine --created-since 2m --created-until 1m` |
| 我 owner、2026 年 3 月创建的文档（精确日历月；同上，owner + 创建时间窗两个维度） | `lark-cli drive +search --query "" --mine --created-since 2026-03-01 --created-until 2026-04-01` |
| 关键词"预算"，最近一周我打开过，按编辑时间降序 | `lark-cli drive +search --query 预算 --opened-since 7d --sort edit_time` |
| 某个 wiki space 下、我 owner 且 30-60 天前创建的 | `lark-cli drive +search --query "" --mine --space-ids space_xxx --created-since 2m --created-until 1m` |
| 张三 owner / 负责的文档（注意是 owner 语义，不是张三最初创建的）| `lark-cli drive +search --query "" --creator-ids ou_zhangsan` |
| 我最近 3 个月评论过的 docx | `lark-cli drive +search --query "" --commented-since 3m --doc-types docx` |

### 更多示例

```text
# 纯关键词搜索
lark-cli drive +search --query "季度总结"

# 使用服务端 query 高级语法
lark-cli drive +search --query 'intitle:方案'
lark-cli drive +search --query '"季度 总结"'
lark-cli drive +search --query '方案 OR 草稿'
lark-cli drive +search --query '方案 -草稿'

# 只搜某个文件夹下的文档
lark-cli drive +search --query 方案 --folder-tokens fld_123456

# 只搜某个知识空间下的 Wiki
lark-cli drive +search --query 研发规范 --space-ids space_1234567890fedcba

# 指定群内分享过的文档
lark-cli drive +search --query 方案 --chat-ids example_id

# 只搜标题 / 只搜评论
lark-cli drive +search --query 周报 --only-title
lark-cli drive +search --query 延期原因 --only-comment

# 人类可读格式
lark-cli drive +search --query OKR --format pretty

# 翻页（--format json 先拿 page_token）
lark-cli drive +search --query 方案 --format json
lark-cli drive +search --query 方案 --page-token '<PAGE_TOKEN>'
```

### 列表 / 统计型请求的执行步骤

对"所有文档"、"按类型分类统计"、"最近更新过"这类请求，不要只跑一次搜索后直接回答。标准流程：

1. 先把自然语言拆成过滤条件：原始创建者（`--created-by-me` / `--original-creator-ids`）、所有权（`--mine` / `--creator-ids`）、时间维度（`--created-*` / `--edited-*` / `--opened-*` / `--commented-*`）、类型（`--doc-types`）、空间或文件夹范围。
2. 没有真实业务关键词时保持 `--query ""`；不要把"所有文档"、"统计"、"最近更新"放进 query。
3. 检查返回结果的 `doc_type` / `result_meta.doc_types`、创建/编辑时间和 URL/token 是否与过滤目标一致；明显不符合的结果不要计入答案。
4. 用户要求"所有 / 全量 / 统计"时按 `has_more` 翻页并累积去重；不要只用第一页推断总量。返回体里的 `total` 不可靠，统计要以实际去重后的结果为准。
5. 汇总时按真实返回字段分组，例如按 `doc_type` 统计 DOCX、SHEET、BITABLE、WIKI、FILE 等，不要凭标题猜类型。

### 内容检索型请求的 query 扩展

用户问的是原因、结论、方案、对比等内容问题时，`--query` 应保留业务关键词，但不要只用整句原问。先用核心实体 + 主题词搜索，再按结果调整：

- "东南亚服务器成本为何较其他区域贵" → 先搜 `"东南亚 服务器 成本"`，如果召回不足，再搜 `"服务器 成本 区域"`、`"非洲 欧洲 服务器 成本"`、`"机房 成本 费用"` 等同主题扩展词。
- "某项目发布会重点" → 先搜项目名 + "发布会" + "重点/功能/一览"，再按标题和摘要判断是否需要只搜标题或扩大到正文。

每轮扩展都要保留非污染、可解释的 evidence（URL/token/标题/摘要）；不能因为某个扩展词搜到高相似标题就跳过证据核验。
扩展 query 时，优先保留用户已经指定的空间、文件夹、群聊、人员、时间和类型等 filter；确需放宽检索范围时，先向用户说明原因并征得确认。

## 参数

### 核心

| 参数 | 必填 | 说明 |
|---|---|---|
| `--query <text>` | 否 | 搜索关键词；支持服务端高级语法（`intitle:`、`""`、`OR`、`-`）。空字符串或省略表示纯 filter 浏览。**长度上限 30 个字符（按 Unicode 码点算，中文每字算 1 个，与 ASCII 同口径）；超过 30 服务端直接报 `99992402 field validation failed`，不会截断** |
| `--page-size <n>` | 否 | 每页数量，默认 15，最大 20。超过 20 自动 clamp；非正数（≤0）回落 15；**非数字值直接返回 validation 错误** |
| `--page-token <token>` | 否 | 上一次响应里的 `page_token`，用于翻页 |
| `--format` | 否 | `json`（默认）/ `pretty` |

### 身份维度

> **语义说明（重要）**：`creator_ids`（含 `--mine` / `--creator-ids`）虽然字段名是 “creator”，但服务端实际按 **owner（文档归属人 / 负责人）** 语义匹配，**不是“最初创建人”**。真正的原始创建者使用 `original_creator_ids`（CLI 为 `--created-by-me` / `--original-creator-ids`）。

| 参数 | 映射 | 说明 |
|---|---|---|
| `--mine` | `creator_ids = [当前用户 open_id]` | bool。一键“我 owner 的”（**不是**“我最初创建的”）；从当前登录用户身份（`runtime.UserOpenId()`）解析 open_id，取不到直接报错（提示运行 `lark-cli auth login`） |
| `--creator-ids ou_x,ou_y` | `creator_ids = [...]` | 显式 open_id 列表，逗号分隔，按 **owner** 匹配；**与 `--mine` 互斥** |
| `--created-by-me` | `original_creator_ids = [当前用户 open_id]` | bool。一键“我最初创建的”；从当前登录用户身份解析 open_id，取不到直接报错 |
| `--original-creator-ids ou_x,ou_y` | `original_creator_ids = [...]` | 显式 open_id 列表，逗号分隔，按**原始创建者**匹配；**与 `--created-by-me` 互斥** |

### 时间维度（每个维度一对 since/until）

| 参数 | 映射 API 字段 | 是否小时 snap |
|---|---|---|
| `--edited-since` / `--edited-until` | `my_edit_time.start` / `.end` | ✅ start 向下取整，end 向上取整 |
| `--commented-since` / `--commented-until` | `my_comment_time.start` / `.end` | ✅ 同上 |
| `--opened-since` / `--opened-until` | `open_time.start` / `.end` | ❌ 原样透传 |
| `--created-since` / `--created-until` | `create_time.start` / `.end` | ❌ 原样透传（文档创建时间，非"我"语义）|

### 作用域

| 参数 | 映射 | 说明 |
|---|---|---|
| `--doc-types docx,sheet` | `doc_types` | 逗号分隔。允许值：`doc,sheet,bitable,mindnote,file,wiki,docx,folder,catalog,slides,shortcut` |
| `--folder-tokens fld_a,fld_b` | `folder_tokens`（仅 doc_filter） | 存在时只发 `doc_filter`；**与 `--space-ids` 互斥** |
| `--space-ids sp_x` | `space_ids`（仅 wiki_filter） | 存在时只发 `wiki_filter`；**与 `--folder-tokens` 互斥** |
| `--chat-ids oc_x` | `chat_ids` | 逗号分隔 |
| `--sharer-ids ou_x` | `sharer_ids` | 逗号分隔，open_id |

### 其他

| 参数 | 映射 | 说明 |
|---|---|---|
| `--only-title` | `only_title: true` | bool |
| `--only-comment` | `only_comment: true` | bool |
| `--sort <value>` | `sort_type`（转大写枚举） | 允许值：`default, edit_time, edit_time_asc, open_time, create_time` |

> `--sort`：CLI 只暴露服务端**正式支持**的 5 个值。服务端 enum 里 `CREATE_TIME_ASC` 协议标注"暂不支持"，`ENTITY_CREATE_TIME_ASC` / `ENTITY_CREATE_TIME_DESC` 已废弃，CLI 直接不放出来，传了会被 cobra enum 校验拒掉。

## 时间值格式

所有 `--*-since` / `--*-until` 共用：

| 输入 | 含义 |
|---|---|
| `7d` / `30d` | N 天前的当前时刻 |
| `1m` | 30 天前（固定 30 天，**不是**日历月）|
| `3m` / `6m` | 90 / 180 天前 |
| `1y` | 365 天前 |
| `2026-04-01` | 本地时区 00:00:00 |
| `2026-04-01 10:00:00` / `2026-04-01T10:00:00` | 本地时区具体时刻 |
| `2026-04-01T10:00:00+08:00` | RFC3339 带时区 |
| `1743523200`（≥ 10 位纯数字）| Unix 秒直接透传 |

> `m` 绑定 month（30 天），不支持 minute——因为 `my_edit_time` / `my_comment_time` 在服务端是小时聚合，分钟粒度没意义。

## 小时聚合（my_edit_time / my_comment_time）

服务端对这两个字段按整点聚合，亚小时输入会被 CLI 向整点对齐：

```text
start: floor 到整点   16:23:45 → 16:00:00
end:   ceil  到整点   16:23:45 → 17:00:00
```

发生对齐时，stderr 会打印一条 notice，例如：

```text
notice: my_edit_time has hour-level granularity server-side;
        start 2026-04-22 16:23:00 → 2026-04-22 16:00:00
        end   2026-04-22 16:28:00 → 2026-04-22 17:00:00
```

stdout 的 JSON 输出不受影响。`open_time` / `create_time` 不做 snap。

## 输出

- `--format json`（默认）：`{ total, has_more, page_token, results: [...] }`；所有 `*_time` 字段递归补 `*_time_iso`
- `--format pretty`：4 列 table —— `type | title | edit_time | url`
- `title_highlighted` / `summary_highlighted` 可能包含 `<h>` / `<hb>` 高亮标签，客户端对比前需先剥离

> **注意**：返回体里的 `total` 字段不够准确（官方确认，仅供参考）。需要精确统计的场景，按实际 `results` 做去重和累加，不要把 `total` 当结果数承诺。

## 决策规则

- **身份快捷方式**：用户说“我创建的 / 我新建的 / 我最初创建的”文档，用 `--created-by-me`；用户说“我的 / 我负责的 / 我 owner 的”文档，用 `--mine`。`--mine` 是 owner 语义：转交出去的不算、转交给我的算。
- **时间维度选择**：
  - "我编辑的"、"我修改的" → `--edited-since` / `--edited-until`
  - "我评论的"、"我回复过的" → `--commented-since` / `--commented-until`
  - "我看过的"、"我打开过的"、"最近看过的" → `--opened-since` / `--opened-until`
  - "创建于"、"新建的"（文档整体维度，与"我"无关）→ `--created-since` / `--created-until`
- **作用域选择**：
  - "某个文件夹下" → `--folder-tokens`（doc-only）
  - "某个 wiki 空间下" → `--space-ids`（wiki-only）
  - 两者不能同时使用，混用会报错
- **身份 flag 互斥**：`--mine` 和 `--creator-ids` 不要同时传；`--created-by-me` 和 `--original-creator-ids` 不要同时传。owner 维度与原始创建者维度可以组合，例如“我创建后转给王五 owner”用 `--created-by-me --creator-ids ou_wangwu`。
- **实体补全**：
  - 用户说"某个群里"，先用 `lark-im` 查 `chat_id`
  - 用户说“某人负责/owner 的 / 某人创建的 / 某人分享的”（非自己），先用 `lark-contact` 查 open_id，再按语义填 `--creator-ids` / `--original-creator-ids` / `--sharer-ids`
- **查询语义下推**：`--query` 支持的服务端高级语法（`intitle:`、`""`、`OR`、`-`）优先使用，不要先模糊搜再在客户端二次过滤。
- **query 填写边界**：只有标题片段、业务名词、项目名、会议名、文件内容关键词才应进入 `--query`。仅描述动作、时间范围、所有权、统计方式的词不算关键词，保持 `--query ""` 并依赖 filters。
- **证据核验**：列表/统计类答案必须来自搜索结果中的实际 URL/token 和类型/时间字段；内容问答必须能指出使用了哪些非污染候选。没有可验证候选时先扩大 query 或翻页，不要直接编总结。
- **时间表达**：
  - 模糊相对时间（"最近半年"、"过去 30 天"、"最近一周"）→ `--*-since 6m` / `--*-since 30d` / `--*-since 7d`，不展开成 ISO 时间
  - **日历表达**（"上个月"、"上周"、"本月"、"前年"、"今年 3 月"等明确日历单位）→ **必须算出绝对 `YYYY-MM-DD` 边界**（如"上个月" = 上一个日历月的 1 号 → 当月 1 号），**不要近似成 `1m`/`2m`**：CLI 里 `m` 是固定 30 天、`y` 固定 365 天，跟日历差 0-3 天，月末月初尤其容易偏出去
  - 文档中的 `"<YYYY-MM-DD>"` 是运行时占位符：执行命令前按当前日期计算并替换。例如"本月"应替换为本月第一天和下月第一天，不要把示例生成时的月份硬编码进答案
  - 绝对日期 → 直接 `YYYY-MM-DD` 或 RFC3339
- **分页策略**：默认只返回第一页，并说明 `has_more` 和下一页命令。用户明确要"全部 / 全量 / 继续翻"时继续；标题词 + 正文词联合搜索尚未找到足够的有效 Top N 候选时，按上文规则最多检查 3 页。其他场景单轮翻页上限 5 页。
- **原始返回**：用户要求"原始数据"、"接口返回"时用 `--format json`，不做客户端精确过滤或摘要重写。

## 权限

| 操作 | 所需 scope |
|---|---|
| 搜索云空间（云盘/云存储）对象（文档 / Wiki / 表格等资源发现） | `search:docs:read` |

## 常见错误

| code | 含义 | 处理 |
|---|---|---|
| `99992351` | `--creator-ids` / `--original-creator-ids` / `--sharer-ids` 里有 open_id 超出**应用的通讯录可见范围**，服务端拒绝识别 | 让管理员在开发者后台把这些用户加进应用的"通讯录可见性"授权里；或把超出范围的 open_id 从参数里去掉。这和 `search:docs:read` scope 不是一回事 —— 是"应用能看见哪些人"而不是"应用能调用哪个接口" |

## 时间范围自动裁剪（`--opened-*` 专有）

服务端对 `open_time` 过滤**每次请求最多支持 3 个月**（90 天）窗口。其他三个时间维度（`--edited-*` / `--commented-*` / `--created-*`）**不受影响**。

CLI 在发请求前会检查 `--opened-since` 到有效 `--opened-until`（没传则取 `now`）的跨度：

| 跨度 | 行为 |
|---|---|
| ≤ 90 天 | 原样透传 |
| 91 ~ 365 天 | **自动裁剪**到"最近一个 90 天 slice"，stderr 打一条 notice 列出所有剩余 slice 的 `--opened-since` / `--opened-until` 参数值 |
| > 365 天 | 直接报 validation 错，要求缩小范围或自行拆分多次查询 |

Notice 示例（用户原本要求"过去 8 个月"，会被拆成 3 个 slice）：

```text
notice: --opened-* window spans 240 days (~8 months), exceeds the server-side 3-month (90-day) limit.
        this query was narrowed to the most recent slice; 3 slices total:
          [slice 1/3 current] --opened-since 2026-01-24T21:54:02+08:00 --opened-until 2026-04-24T21:54:02+08:00
          [slice 2/3]         --opened-since 2025-10-26T21:54:02+08:00 --opened-until 2026-01-24T21:54:02+08:00
          [slice 3/3]         --opened-since 2025-08-27T21:54:02+08:00 --opened-until 2025-10-26T21:54:02+08:00
        pagination: paginate within a slice via --page-token using that slice's --opened-since / --opened-until values verbatim (NOT the original relative time like '1y' / '8m' — relative times re-resolve against time.Now() and would mismatch the page_token); switch to the next slice's --opened-* flags only after has_more=false, and do not carry --page-token across slices.
```

### Agent 看到 notice 时的处理

**标准流程（分页 × slice 的先后顺序）：**

1. **跑 slice 1**（本次请求已自动裁剪到这个窗口），把结果呈现给用户
2. **先在当前 slice 内翻页**：返回的 `has_more = true` 且用户想看更多时，把 `--opened-since` / `--opened-until` 改成 notice 里 `[slice 1/N current]` 行给出的**具体时间值**（**不要继续用原始的 `--opened-since 1y` 这种相对值**——CLI 每次调用都按 `time.Now()` 重算窗口，相对值 + `--page-token` 一起跑会让 page_token 绑到一个漂移的窗口上、结果静默失真），加 `--page-token` 继续翻，直到 `has_more = false`
3. **再切换到下一个 slice**：当前 slice 翻完后，如果用户还要"更老的"，用 notice 里列的 slice 2 的 `--opened-since` / `--opened-until` 值，**其他 flag（`--query`、`--doc-types`、`--page-size`、`--sort`……）保持原样，`--page-token` 不带**，重新发请求
4. **依次递推**：slice 2 翻完后切 slice 3，以此类推
5. 用户只对最近一段感兴趣时，跳过第 3 步及以后 —— 避免无意义的 API 调用

> `--page-token` 只在单 slice 上下文内有效；切 slice 时不要把上一个 slice 的 `page_token` 带过去。

### 注意事项

- `--sort` 在**单 slice 内部**是正确的。跨 slice 的全局 sort（例如"过去一年我打开过的，按 edit_time desc 排"）不被 CLI 保证，需要 agent 自行拉完多个 slice 后在客户端 re-sort 再呈现
- 裁剪只改 request 发出去的 `open_time` 范围，`--query` / 其他 filter 不动
- 最后一个（最老的）slice 常常不足 90 天，这是正常的截断


<a id="s-0f10250131845279"></a>

## references/lark-drive-secure-label.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +secure-label-list / +secure-label-update（云文档密级标签）

## 何时使用

- `drive +secure-label-list`：查询当前用户可用的密级标签，先拿到目标 `id`。
- `drive +secure-label-update`：把目标云文档调整为指定密级标签。

这两个 shortcut 都使用用户身份（`--as user`）。修改密级前，通常先执行 `+secure-label-list` 确认可用标签 ID。

## 查询可用密级标签

```text
lark-cli drive +secure-label-list --page-size 10 --lang zh
```

可选参数：

| 参数 | 说明 |
|------|------|
| `--page-size` | 分页大小，范围 `1..10`，默认 `10` |
| `--page-token` | 上一页响应里的 `page_token` |
| `--lang` | 标签语言：`zh`、`en`、`ja` |

底层接口：`GET /open-apis/drive/v2/my_secure_labels`。

## 修改文档密级

```text
lark-cli drive +secure-label-update \
  --token "https://example.feishu.cn/docx/doxcnxxxx" \
  --label-id '<label-id>' # replace $LABEL_ID before running
```

参数：

| 参数 | 说明 |
|------|------|
| `--token` | 目标文档 URL 或 bare token；URL 可自动推断 `--type` |
| `--type` | bare token 必填；URL 输入时可省略。可选：`doc`、`docx`、`sheet`、`file`、`bitable`、`mindnote`、`slides` |
| `--label-id` | 要设置的密级标签 ID |

底层接口：`PATCH /open-apis/drive/v2/files/:file_token/secure_label`，query 参数 `type`，请求体 `{ "id": "<label-id>" }`。

## 错误处理

CLI 不会在 shortcut 中为密级错误码追加专用 hint；agent 必须根据返回的 `error.code` 做以下引导。

| 错误码 | 含义 | 引导 |
|--------|------|------|
| `1063013` | 密级降级需要审批 | 提示用户打开目标文档，在文档界面完成密级降级审批后重试；如果用户传入的是文档 URL，必须把该 URL 一并给用户作为操作入口 |

遇到 `1063013` 时，不要继续重试 API，也不要提示补 scope；这是文档侧审批流程要求，需要用户到文档里操作。


<a id="s-564c2eed90faa255"></a>

## references/lark-drive-status.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +status

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

按 **精确 SHA-256**（默认）或 **快速 modified_time**（`--quick`）比较本地目录与飞书云空间（云盘/云存储）文件夹，输出四类差异：

| 字段 | 含义 |
|------|------|
| `new_local` | 仅本地存在 |
| `new_remote` | 仅云端存在 |
| `modified` | 双端都存在且本次检测判定为已变更：`detection=exact` 时表示 hash 不一致；`detection=quick` 时表示本地 mtime 与远端 `modified_time` 不一致，或远端时间戳不可可信 |
| `unchanged` | 双端都存在且本次检测判定为未变更：`detection=exact` 时表示 hash 一致；`detection=quick` 时表示本地 mtime 与远端 `modified_time` 相等 |

只读命令：

- 默认 `detection=exact`：双端都有的文件会从云端拉一份字节流过来在内存里算 hash，不下载落盘，但大目录 / 大文件会有可观的网络流量。
- 传 `--quick` 后 `detection=quick`：只比较本地 mtime 与远端 `modified_time`，**不下载远端文件内容**，适合先做快速预检查；它是 best-effort，不等同于严格内容一致性判断。

## 远端同名文件冲突

如果 Drive 中多个条目映射到同一个 `rel_path`，`+status` 会在下载/hash 前直接失败，在 stderr 返回类型化错误信封（`error.type=validation`、`error.subtype=failed_precondition`）；`error.params[]` 每条的 `name` 是冲突的 `rel_path`，`reason` 枚举该路径下所有碰撞条目（`type` + `file_token`）。不要把这种情况当成普通 `modified`；它表示同步域本身有歧义，需要先整理云端结构，或在 `+pull` / `+push` 中仅对“duplicate file”场景显式选择冲突策略。

## 命令

```text
# 基础用法 —— 两个必填参数
lark-cli drive +status \
  --local-dir ./repo \
  --folder-token fldcnxxxxxxxxx

# 快速模式 —— 只比较 modified_time，不下载远端文件内容
lark-cli drive +status \
  --local-dir ./repo \
  --folder-token fldcnxxxxxxxxx \
  --quick

# 只看判定为 modified 的项（exact=hash 不一致；quick=mtime 不一致）（结合 --jq 过滤）
lark-cli drive +status \
  --local-dir ./repo \
  --folder-token fldcnxxxxxxxxx \
  --jq '.modified'
```

## 参数

| 标志 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `--local-dir` | 是 | path | 本地根目录（**必须是 cwd 的相对路径**；绝对路径或逃逸到 cwd 外的相对路径会被 CLI 直接拒绝） |
| `--folder-token` | 是 | string | Drive 文件夹 token |
| `--quick` | 否 | bool | 快速模式：只比较本地 mtime 与远端 `modified_time`，跳过远端下载和 SHA-256 计算；输出里的 `detection` 会变成 `quick` |

## 输出 schema

成功时：

```json
{
  "detection":  "exact",
  "new_local":  [{"rel_path": "..."}],
  "new_remote": [{"rel_path": "...", "file_token": "..."}],
  "modified":   [{"rel_path": "...", "file_token": "..."}],
  "unchanged":  [{"rel_path": "...", "file_token": "..."}]
}
```

其中：

- `detection=exact`：默认模式，双端都有的文件会下载远端字节流并做 SHA-256 比较。
- `detection=quick`：`--quick` 模式，只按本地 mtime 与远端 `modified_time` 做 best-effort 判断。

`rel_path` 始终用 `/` 作为分隔符（跨平台一致），相对于 `--local-dir` 或 `--folder-token` 的根。仅本地存在时没有 `file_token` 字段。

远端同名文件冲突时：

```json
{
  "ok": false,
  "identity": "user",
  "error": {
    "type": "validation",
    "subtype": "failed_precondition",
    "message": "1 rel_path(s) map to multiple Drive entries",
    "hint": "resolve the duplicate remote files first: re-run +pull with --on-duplicate-remote=rename (downloads each with a hashed suffix), or use --on-duplicate-remote=newest|oldest (supported by +pull/+sync/+push) to pick one, or delete the extra remote files; a plain retry will not help",
    "params": [
      {
        "name": "dup.txt",
        "reason": "2 Drive entries collide here: file <full_file_token>, folder <folder_token>"
      }
    ]
  }
}
```

## 比较范围

- **只比对 Drive `type=file` 的二进制文件**。在线文档（`docx` / `sheet` / `bitable` / `mindnote` / `slides`）和快捷方式（`shortcut`）都被跳过 —— 它们没有等价的本地二进制可对齐，否则会在 `new_remote` 里产生大量误报。
- 子文件夹会递归遍历；rel_path 形如 `sub1/sub2/file.txt`。
- 多个远端条目映射到同一个 rel_path 时不做隐式选择，默认失败。
- 本地侧只比对常规文件（regular file）；符号链接、设备文件等被忽略。
- `--quick` 模式下，双端都有的文件只在 **远端时间精度** 下比较 `modified_time` / 本地 mtime：相等才记为 `unchanged`，否则记为 `modified`；远端时间戳缺失或非法时，走保守路径记为 `modified`，不会盲判 `unchanged`。

## 范围限制

`+status` 的本地侧只接受 cwd 下的相对路径。如果用户想比对的目录在 cwd 之外，**不要 agent 自己 `cd` 绕过**；让用户在合适的祖先目录重新启动 agent 后再跑。注意：把目标软链接到 cwd 内**也不行**——路径校验会先 `EvalSymlinks` 再判定是否越界，链接最终指向的真实目录如果在 cwd 之外，仍然会被 `unsafe file path` 拒掉。CLI 会在路径越界时直接报错，无需在 skill 这一层提前手动校验。

## 典型用法

把 +status 当作"先看差异、再决定怎么同步"的只读探针。常见接驳场景：

- 想知道云端有什么本地没有的内容 → 看 `new_remote`，按需选择性拉取（`drive +download --file-token <token>`）。
- 想把本地新增的内容推到云端 → 看 `new_local`，再 `drive +upload --file <path> --folder-token <parent>`（注意 +upload 不接受 0 字节文件）。
- 想知道哪些文件在云端被同事改过 → 看 `modified`，逐个 `drive +download` 查内容差异。

## 性能注意

- 默认 `detection=exact` 下，`unchanged` + `modified` 的总字节数 = 本次需从云端下载的流量。100GB 的双端共享内容意味着 100GB 网络往返。
- `--quick` / `detection=quick` 下，不会下载双端共有文件的远端内容，执行时间更接近 `O(文件数量)`，而不是 `O(总文件大小)`。
- 仅一侧存在的文件不会被下载。
- 默认模式的 hash 计算在内存里流式做（io.Copy → sha256.New），不会把云端文件落到磁盘。

## 所需 scope

| 操作 | scope |
|------|-------|
| 列出文件夹 / 子目录 | `drive:drive.metadata:readonly` |
| 下载并 hash 文件 | `drive:file:download` |

默认会先要求 `drive:drive.metadata:readonly`。在 `detection=exact` 路径（默认，不传 `--quick`）下，CLI 还会额外要求 `drive:file:download`；传 `--quick` 时不会要求下载 scope。如果当前 token 缺本次执行路径需要的 scope，命令会报 `missing_scope` 并提示重新登录。`drive:drive` 在部分企业被策略禁用，所以 +status 故意只依赖上面这些细粒度 scope。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) —— 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） —— 认证和全局参数
- [lark-drive-upload](lark-drive-0.md#s-04b9ae35ec99a8aa) / [lark-drive-download](lark-drive-0.md#s-e71db3c18178ec5e) —— 把 +status 输出接到推/拉动作上


<a id="s-27c169d1426c6d1e"></a>

## references/lark-drive-task-result.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +task_result

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

查询异步任务结果。该 shortcut 聚合了导入、导出、Drive 文件/文件夹移动/删除、Wiki 节点 / 文档迁入 Wiki、Wiki 节点移出 Wiki、Wiki 删除等多种异步任务的结果查询，统一接口方便调用。

> [!IMPORTANT]
> 对于 `import` 场景，如果使用 `--as bot` 且这次查询**已经拿到最终在线文档目标**（`ready=true` 且返回了最终 `token` / `url`），CLI 会**再次尝试为当前 CLI 用户自动授予该资源的 `full_access`（可管理权限）**。
>
> 此时结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该导入结果的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，或最终结果缺少可授权的在线文档目标，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：导入结果已就绪，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该文档
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”。
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

## 命令

```text
# 查询导入任务结果
lark-cli drive +task_result \
  --scenario import \
  --ticket <IMPORT_TICKET>

# 查询导出任务结果
lark-cli drive +task_result \
  --scenario export \
  --ticket <EXPORT_TICKET> \
  --file-token <SOURCE_DOC_TOKEN>

# 查询 Drive 文件/文件夹移动/删除任务状态
lark-cli drive +task_result \
  --scenario task_check \
  --task-id <TASK_ID>

# 查询 Wiki 移动任务结果（wiki +move 异步超时后的续跑）
lark-cli drive +task_result \
  --scenario wiki_move \
  --task-id <TASK_ID>

# 查询 Wiki 节点移出知识库任务结果（wiki +move-to-drive 异步超时后的续跑）
lark-cli drive +task_result \
  --scenario wiki_move_to_drive \
  --task-id <TASK_ID>

# 查询 Wiki 删除知识空间任务结果（wiki +delete-space 异步超时后的续跑）
lark-cli drive +task_result \
  --scenario wiki_delete_space \
  --task-id <TASK_ID>
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--scenario` | 是 | 任务场景，可选值：`import` (导入任务)、`export` (导出任务)、`task_check` (Drive 文件/文件夹移动/删除任务)、`wiki_move` (Wiki 移动任务)、`wiki_move_to_drive` (Wiki 节点移出知识库任务)、`wiki_delete_space` (Wiki 删除知识空间任务)、`wiki_delete_node` (Wiki 删除节点任务) |
| `--ticket` | 条件必填 | 异步任务 ticket，**import/export 场景必填** |
| `--task-id` | 条件必填 | 异步任务 ID，**task_check 及所有 wiki 场景必填**；必须原样传递完整 ID |
| `--file-token` | 条件必填 | 导出任务对应的源文档 token，**export 场景必填** |

## 场景说明

| 场景 | 说明 | 所需参数 |
|------|------|----------|
| `import` | 文档导入任务（如将本地文件导入为云文档） | `--ticket` |
| `export` | 文档导出任务（如云文档导出为 PDF/Word） | `--ticket`、`--file-token` |
| `task_check` | Drive 文件/文件夹移动/删除任务 | `--task-id` |
| `wiki_move` | Wiki 移动任务（`wiki +move` 的 docs-to-wiki 异步流程，超时后续跑用） | `--task-id` |
| `wiki_move_to_drive` | Wiki 节点移出知识库任务（`wiki +move-to-drive` 超时后续跑用） | `--task-id` |
| `wiki_delete_space` | Wiki 删除知识空间任务（`wiki +delete-space` 的异步流程，超时后续跑用） | `--task-id` |
| `wiki_delete_node` | Wiki 删除节点任务（`wiki +node-delete` 的异步流程，超时后续跑用） | `--task-id` |

## 返回结果

### Import 场景返回

```json
{
  "scenario": "import",
  "ticket": "<IMPORT_TICKET>",
  "type": "sheet",
  "ready": true,
  "failed": false,
  "job_status": 0,
  "job_status_label": "success",
  "job_error_msg": "success",
  "token": "<IMPORTED_DOC_TOKEN>",
  "url": "https://example.feishu.cn/sheets/<IMPORTED_DOC_TOKEN>",
  "extra": ["2000"],
  "permission_grant": {
    "status": "granted",
    "perm": "full_access",
    "member_type": "openid",
    "user_open_id": "<CURRENT_USER_OPEN_ID>",
    "message": "Granted the current CLI user full_access (可管理权限) on the new spreadsheet."
  }
}
```

**字段说明：**
- `ready`: 是否已经导入完成，可直接使用 `token` / `url`
- `failed`: 是否已经失败
- `job_status`: 服务端返回的原始状态码
- `job_status_label`: 便于阅读的状态标签，例如 `success` / `processing`
- `token`: 导入后的文档 token
- `url`: 导入后的文档链接
- `permission_grant`: 仅 `--as bot` 且这次查询已经拿到最终在线文档目标时返回，用于说明是否已自动为当前 CLI 用户授予可管理权限；如果当前仍是 `ready=false`，则不会返回这个字段

### Export 场景返回

```json
{
  "scenario": "export",
  "ticket": "<EXPORT_TICKET>",
  "ready": true,
  "failed": false,
  "file_extension": "pdf",
  "type": "doc",
  "file_name": "docName",
  "file_token": "<EXPORTED_FILE_TOKEN>",
  "file_size": 34356,
  "job_error_msg": "success",
  "job_status": 0,
  "job_status_label": "success"
}
```

**字段说明：**
- `ready`: 是否已经完成导出，可直接使用 `file_token`
- `failed`: 是否已经失败
- `job_status`: 服务端返回的原始状态码
- `job_status_label`: 便于阅读的状态标签，例如 `success` / `processing`
- `file_token`: 导出文件的 token，用于下载
- `file_extension`: 导出文件扩展名
- `file_size`: 导出文件大小（字节）

### Task_check 场景返回

```json
{
  "scenario": "task_check",
  "task_id": "<TASK_ID>",
  "status": "success",
  "ready": true,
  "failed": false
}
```

**字段说明：**
- `status`: 任务状态，`success`=成功，`failed`=失败，`pending`=处理中
- `ready`: 是否已经完成
- `failed`: 是否已经失败

### Wiki_move 场景返回

```json
{
  "scenario": "wiki_move",
  "task_id": "<TASK_ID>",
  "ready": true,
  "failed": false,
  "status": 0,
  "status_msg": "success",
  "wiki_token": "wikcnXXX",
  "node_token": "wikcnXXX",
  "space_id": "<TARGET_SPACE_ID>",
  "obj_token": "<OBJ_TOKEN>",
  "obj_type": "docx",
  "parent_node_token": "",
  "node_type": "origin",
  "origin_node_token": "",
  "title": "项目计划",
  "has_child": false,
  "node": {
    "space_id": "<TARGET_SPACE_ID>",
    "node_token": "wikcnXXX",
    "obj_token": "<OBJ_TOKEN>",
    "obj_type": "docx",
    "parent_node_token": "",
    "node_type": "origin",
    "origin_node_token": "",
    "title": "项目计划",
    "has_child": false
  },
  "move_results": [
    {
      "status": 0,
      "status_msg": "success",
      "node": { "...": "同上" }
    }
  ]
}
```

**字段说明：**
- `ready`: 所有 `move_results[].status` 都为 `0` 时为 `true`
- `failed`: 任一 `move_results[].status` 小于 `0` 时为 `true`
- `status` / `status_msg`: 第一个 move_result 的状态码 / 标签（无结果时回退为 `1` / `processing`）
- `wiki_token` / `node_token`: 移入 Wiki 后的目标节点 token（首个结果有 `node.node_token` 时镜像到顶层，便于下游脚本使用）
- `space_id`、`obj_token`、`obj_type`、`title` 等：从首个 `move_results[0].node` 平铺到顶层，方便直接引用
- `move_results`: 保留完整列表（适用于一次任务移动多个文档的场景）

### Wiki_move_to_drive 场景返回

```json
{
  "scenario": "wiki_move_to_drive",
  "task_id": "<OPAQUE_TASK_ID>",
  "ready": true,
  "failed": false,
  "status": 0,
  "status_msg": "success",
  "obj_token": "doxcnXXX",
  "obj_type": "docx",
  "url": "https://example.feishu.cn/docx/doxcnXXX"
}
```

**字段说明：**
- `ready`: `move_wiki_to_docs_result.status=0` 时为 `true`
- `failed`: `status<0` 时为 `true`；`status=1` 表示仍在处理
- `status` / `status_msg`: 协议返回的数值状态与可读消息；不要把字符串状态当作成功值解析
- `obj_token` / `obj_type` / `url`: 成功后新 Drive 文档的资源信息
- `task_id`: 签名后的 opaque ID，可能包含多个连字符；服务端响应省略 `task.task_id` 时回退为请求中的完整 ID

### Wiki_delete_space 场景返回

```json
{
  "scenario": "wiki_delete_space",
  "task_id": "<TASK_ID>",
  "ready": true,
  "failed": false,
  "status": "success",
  "status_msg": "success"
}
```

**字段说明：**
- `ready`: `status=success` 时为 `true`
- `failed`: `status=failure` 或 `failed` 时为 `true`；未知非成功状态（如 `processing`）视为进行中
- `status`: 服务端返回的原始 `delete_space_result.status`
- `status_msg`: 优先使用 `delete_space_result.status_msg`，否则回落到 `status`，再回落到 `processing`

## 使用场景

### 配合 +import 使用

```text
# 1. 创建导入任务
lark-cli drive +import --file ./data.xlsx --type sheet
# 若任务很快完成：直接返回 token / url
# 若内置轮询超时：返回 ready=false、ticket 和 next_command

# 2. 轮询导入结果
lark-cli drive +task_result --scenario import --ticket <IMPORT_TICKET>
# 如果这里返回 ready=true 且使用 --as bot，结果还会包含 permission_grant
```

### 配合 +move 使用

```text
# 1. 移动文件夹
lark-cli drive +move --file-token <FOLDER_TOKEN> --type folder --folder-token <TARGET_FOLDER_TOKEN>
# 已完成时返回 ready=true，无需继续查询
# 若内置轮询结束仍未完成：返回 ready=false、task_id 和 next_command

# 2. 仅在 ready=false 时继续查询
lark-cli drive +task_result --scenario task_check --task-id <TASK_ID>
```

### 配合 wiki +move 使用

```text
# 1. 把 Drive 文档迁入 Wiki（异步任务可能返回 task_id）
lark-cli wiki +move --obj-type docx --obj-token <DOC_TOKEN> --target-space-id <TARGET_SPACE_ID>
# 若内置轮询窗口内完成：直接返回 ready=true 和 wiki_token
# 若轮询窗口结束仍未完成：返回 ready=false、task_id、timed_out=true 和 next_command

# 2. 续跑查询 Wiki 移动结果（next_command 即下面这条）
lark-cli drive +task_result --scenario wiki_move --task-id <TASK_ID> --as user
```

> **身份保持一致**：续跑命令的 `--as` 必须与原 `wiki +move` 调用一致；`wiki +move` 的 `next_command` 已自动带上正确的 `--as`。

### 配合 wiki +move-to-drive 使用

```text
# 1. 把 Wiki 节点移到 Drive 文件夹；省略 --folder-token 表示当前身份的“我的空间”根目录
lark-cli wiki +move-to-drive \
  --node-token <WIKI_NODE_TOKEN> \
  --folder-token <TARGET_FOLDER_TOKEN> \
  --as user
# 若轮询窗口内完成：直接返回 ready=true、obj_token、obj_type 和 url
# 若轮询窗口结束仍未完成：返回 ready=false、完整 task_id、timed_out=true 和 next_command

# 2. 使用完整 task_id 和相同身份续跑
lark-cli drive +task_result \
  --scenario wiki_move_to_drive \
  --task-id <COMPLETE_TASK_ID> \
  --as user
```

> **调用上下文和 ID 都要保持原样**：续跑的 `--profile` 与 `--as` 必须与初始移动一致；`task_id` 可能包含多个连字符，不要拆分或截断。`wiki +move-to-drive` 返回的 `next_command` 会保留 profile 与身份。

### 配合 wiki +delete-space 使用

```text
# 1. 删除知识空间（高风险写操作，必须显式带 --yes；接口可能同步返回空 task_id，也可能返回异步 task_id）
lark-cli wiki +delete-space --space-id <SPACE_ID> --yes
# 若同步返回：直接 ready=true
# 若轮询窗口结束仍未完成：返回 ready=false、task_id、timed_out=true 和 next_command

# 2. 续跑查询 Wiki 删除结果（next_command 即下面这条）
lark-cli drive +task_result --scenario wiki_delete_space --task-id <TASK_ID> --as user
```

### 配合 +export 使用

```text
# 1. 发起导出
lark-cli drive +export --token <SOURCE_DOC_TOKEN> --doc-type docx --file-extension pdf
# 若轮询窗口内完成：直接下载本地文件
# 若内置轮询结束仍未完成：返回 ready=false、ticket 和 next_command

# 2. 继续查询导出结果
lark-cli drive +task_result --scenario export --ticket <EXPORT_TICKET> --file-token <SOURCE_DOC_TOKEN>

# 如果返回 rate_limit / 99991400：至少等待 1 分钟后重试同一条 +task_result；
# 若仍限频，以 1 分钟为起点继续指数退避。

# 3. 拿到 file_token 后下载
lark-cli drive +export-download --file-token <EXPORTED_FILE_TOKEN>
```

## 权限要求

| 场景 | 所需 scope |
|------|-----------|
| import | `drive:drive.metadata:readonly` |
| export | `drive:drive.metadata:readonly` |
| task_check | `drive:drive.metadata:readonly` |
| wiki_move | `wiki:space:read` |
| wiki_move_to_drive | `wiki:space:read` |
| wiki_delete_space | `wiki:space:read` |
| wiki_delete_node | `wiki:space:read` |

> [!NOTE]
> `import` 场景在 `--as bot` 且任务最终就绪时，还可能额外尝试一次协作者授权；如果 `permission_grant.status = failed`，请根据失败信息检查应用是否具备相应的文档协作者授权能力。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [wiki +move-to-drive](lark-wiki-0.md#s-9aa6007c9609b1f7) -- 将 Wiki 节点移出知识库并放入 Drive
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-4a1316e014436948"></a>

## references/lark-drive-update-reply.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +update-reply

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和权限处理；`--content` 完整格式见 [`lark-drive-comment-content.md`](lark-drive-0.md#s-6205636d86928dea)。

整体替换某条回复的内容。

## 命令

```text
# 推荐：完整 URL + 评论 ID + 回复 ID + 新内容（整体替换，无局部编辑）
lark-cli drive +update-reply --url "https://example.larksuite.com/docx/<DOCX_TOKEN>" --comment-id '<id>' --reply-id '<id>' --content '[{"type":"text","text":"新内容"}]'
```

## 参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `--url` | 与 `--token` 二选一 | 推荐入口。支持 doc/docx/sheet/file/slides/base/bitable/apps/wiki URL；apps 妙搭 URL 使用 `/page/<token>`；wiki URL 会自动解析到真实文档。 |
| `--token` | 与 `--url` 二选一 | 裸 token 或 URL。裸 token 必须搭配 `--type`；wiki token 使用 `--type wiki`。 |
| `--type` | 裸 token 时必填 | 传 token 对应类型：`doc`、`docx`、`sheet`、`file`、`slides`、`bitable`、`base`、`apps`、`wiki`。wiki token 使用 `wiki`；传 `base` 时，CLI 会按 `bitable` 类型处理。 |
| `--comment-id` | 是 | 回复所属的评论 ID；来自 `drive +list-comments` |
| `--reply-id` | 是 | 要更新的回复 ID；来自 `drive +list-replies` 的 `items[].reply_id` |
| `--content` | 是 | 新的 `reply_elements` JSON，`type=text` 文本自动转义；完整 schema 见 [`lark-drive-comment-content.md`](lark-drive-0.md#s-6205636d86928dea) |

## 行为说明

- 更新是整体替换：新 `content` 完全覆盖旧内容，没有局部修改语义。
- **只能更新当前身份自己创建的回复**；更新他人回复返回 API 错误 `1069303 forbidden`。执行前先用 `+list-replies` 核对 `items[].user_id`（open_id），并用创建该回复的同一个 `--as` 身份执行。
- 更新评论卡片的根回复（第一页 `items[0]`，即创建最早的一条 reply）等价于改写这条评论的正文本身；改写前先和用户确认改的是回复还是评论正文。

## 输出

```json
{
  "file_token": "docx_token",
  "file_type": "docx",
  "comment_id": "<comment_id>",
  "reply_id": "<reply_id>",
  "updated": true
}
```

## 参考

- [lark-drive-comment-content](lark-drive-0.md#s-6205636d86928dea) -- `--content` 格式
- [lark-drive-list-replies](lark-drive-0.md#s-4f8de3d1bf0a5ce4) -- 获取回复与 reply_id


<a id="s-726e12e695033297"></a>

## references/lark-drive-update-title.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +update-title

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

重命名云空间（云盘/云存储）里的文件、文件夹、在线文档或知识库节点。

## 命令

```text
# 推荐：传 URL（自动识别类型和 token）
lark-cli drive +update-title \
  --url 'https://example.larksuite.com/docx/<DOCX_TOKEN>' \
  --title '<NEW_TITLE>'

# 裸 token 必须显式传 --type
lark-cli drive +update-title \
  --token <FILE_TOKEN> \
  --type file \
  --title '<NEW_TITLE>.xlsx'

# 知识库节点：传 /wiki/ URL 里的 node_token
lark-cli drive +update-title \
  --url 'https://example.larksuite.com/wiki/<NODE_TOKEN>' \
  --title '<NEW_TITLE>'
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--url` | 与 `--token` 二选一 | 目标 URL，支持 `/docx/`、`/sheets/`、`/base/`、`/bitable/`、`/slides/`、`/file/`、`/drive/folder/`、`/wiki/` |
| `--token` | 与 `--url` 二选一 | 目标 token 或 URL；裸 token 必须配合 `--type` |
| `--type` | 裸 token 时必填 | `docx`、`sheet`、`bitable`（`base` 为兼容别名）、`slides`、`file`、`folder`、`wiki`；传 URL 时可省略，显式传入时必须与 URL 类型一致 |
| `--title` | 是 | 新标题，别名 `--new-title`；不能为空或纯空白，首尾空格会被去掉 |
| `--on-extension-mismatch` | 否 | 仅 `--type file`：`keep`（默认，标题缺后缀时自动补上当前后缀，后缀不一致时报错）/ `allow`（跳过校验，原样提交）。传给其他 `--type` 会报错 |

## 行为说明

- **空标题会被拒绝**：CLI 拒绝空或纯空白的 `--title`
- **`file` 类型会校验后缀**：`--type file` 的标题就是完整文件名。CLI 会比对 `--title` 与当前文件名的后缀：没有后缀时默认补上当前后缀（输出里用 `extension_appended` 说明），后缀不一致时拦截（`a.md` → `a.txt`）。要跳过校验加 `--on-extension-mismatch=allow`
- **wiki 不解包**：`--type wiki` 用 `/wiki/` URL 里的 `wiki_token`，传底层文档 token 会 `981003`
- **不支持旧版 doc 和思维笔记**：服务端不支持改这两类的标题（`type=doc` / `type=mindnote` 返回 `981002 params error`），CLI 在本地就拒绝，不会白发一次写请求
- **不支持妙搭 apps**：要改妙搭应用标题，切换到 [`lark-apps`]（按模块名读取对应工作流） 业务域处理

## 输出

```json
{
  "updated": true,
  "file_token": "<file_token>",
  "type": "docx",
  "title": "<new_title>",
  "url": "https://example.feishu.cn/docx/<file_token>"
}
```

`--type file` 且未用 `allow` 时，额外返回改名前的文件名，改错了可以据此一条命令改回去；自动补了后缀还会带上 `extension_appended`：

```json
{
  "updated": true,
  "title": "<new_title>.txt",
  "previous_title": "<old_title>.txt",
  "extension_appended": ".txt"
}
```

## 常见错误

| 错误码 | 含义 | 处理 |
|---|---|---|
| `99991672` / `99991679` | 缺失 scope | 按错误里的 `missing_scopes`、`hint` 申请/授权所需 scope 后重试 |
| `99991400` | 命中接口限频 | 等待一段时间后重试；批量改名时保持串行并降低频率 |

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-04b9ae35ec99a8aa"></a>

## references/lark-drive-upload.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive +upload

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

上传本地文件到飞书云空间（云盘/云存储）。目标位置可以是 Drive 文件夹，也可以是 wiki 节点。

## 快速决策
- 用户要在 Drive 里上传、创建、读取、局部 patch 或覆盖更新**原生 `.md` 文件**（不是导入成 docx），切到 [`lark-markdown`](lark-markdown-0.md#s-651194b317c3c3e6)。
- 用户在修改/重写/更新已有普通文件时，优先使用覆盖上传方式，而不是直接上传一个新文件。

## 命令

```text
# 上传到 Drive 文件夹
lark-cli drive +upload --file ./report.pdf --folder-token fldbc_xxx

# 上传到 wiki 节点
lark-cli drive +upload --file ./report.pdf --wiki-token wikcn_xxx

# 不指定目标时，上传到调用者的 Drive 根目录
lark-cli drive +upload --file ./report.pdf

# 自定义上传后的文件名
lark-cli drive +upload --file ./report.pdf --name "季度总结.pdf"

# 覆盖已存在文件（原地覆盖，保留 file_token）
lark-cli drive +upload --file ./report.pdf --file-token boxcn_existing_file

# 原生命令（高级/分片上传）：预上传 + 完成上传
lark-cli drive files upload_prepare --data '{
  "file_name": "report.pdf",
  "parent_type": "explorer",
  "parent_node": "fldbc_xxx",
  "size": 1048576,
  "file_token": "boxcn_existing_file"
}'
lark-cli drive files upload_finish --data '{
  "upload_id": "<UPLOAD_ID>",
  "block_num": 1
}'

# 查看完整参数定义
lark-cli schema drive.files.upload_prepare
```

> [!IMPORTANT]
> 如果文件是**以应用身份（bot）新建上传**的，如 `lark-cli drive +upload --as bot` 在上传成功后，CLI 会**尝试为当前 CLI 用户自动授予该文件的 `full_access`（可管理权限）**。
>
> 如果这次调用传了 `--file-token`，表示是在**覆盖已有文件**，CLI **不会**额外修改该文件权限。
>
> 以应用身份上传时，结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该文件的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：文件已上传成功，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该文件
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”。
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

> [!TIP]
> 当底层上传接口返回版本号时，shortcut 会在结果里额外透出 `version`。

## 目标位置选择（关键）

- 上传到 Drive 文件夹：传 `--folder-token <folder_token>`，shortcut 会发送 `parent_type=explorer`
- 上传到 wiki 节点：传 `--wiki-token <wiki_token>`，shortcut 会发送 `parent_type=wiki`
- 上传到 Drive 根目录：`--folder-token` 和 `--wiki-token` 都不传
- 覆盖已有文件：额外传 `--file-token <existing_file_token>`；shortcut 会把它原样透传到底层 `upload_all` / `upload_prepare`，让后端按覆盖语义写入
- bot 模式下，`--file-token` 覆盖只改文件内容；不会额外给当前 CLI 用户补 `full_access`
- 不要传空目标值：`--folder-token ""` / `--wiki-token ""` 会被视为参数错误；如需上传到 Drive 根目录，应直接省略这两个参数
- 不要传空 `--file-token`：如需新建上传，直接省略该参数；显式传空字符串会报错
- `--folder-token` 和 `--wiki-token` 互斥，不要同时传
- `--wiki-token` 传的是 **wiki node token**，不是 `space_id`

Shortcut 参数：

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file` | 是 | 本地文件路径 |
| `--file-token` | 否 | 已存在文件的 token；传入后按“覆盖已有文件”语义上传 |
| `--folder-token` | 否 | 目标文件夹 token；与 `--wiki-token` 互斥；省略时默认为 Drive 根目录；显式传空字符串会报错 |
| `--wiki-token` | 否 | 目标 wiki 节点 token；与 `--folder-token` 互斥；会映射为 `parent_type=wiki`、`parent_node=<wiki_token>`；显式传空字符串会报错 |
| `--name` | 否 | 上传后的文件名；默认使用本地文件名 |

参数（预上传 `--data` JSON body）：

| 字段 | 必填 | 说明 |
|------|------|------|
| `file_name` | 是 | 文件名 |
| `parent_type` | 是 | 父节点类型；上传到文件夹 / 根目录时用 `"explorer"`，上传到 wiki 节点时用 `"wiki"` |
| `parent_node` | 是 | 父节点 token；`explorer` 时传文件夹 token（根目录可为空字符串），`wiki` 时传 wiki node token |
| `size` | 是 | 文件大小（字节） |
| `file_token` | 否 | 已存在文件 token；传入后覆盖该文件内容 |

> [!CAUTION]
> 这是**写入操作** —— 执行前必须确认用户意图。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-7eb89ec617aa34ef"></a>

## references/lark-drive-version-delete.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +version-delete

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

删除指定的历史版本。该 shortcut 同时支持 `--as user` 和 `--as bot`；自动化场景推荐使用 `--as bot`。

## 命令

```text
lark-cli drive +version-delete \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --yes \
  --as bot

lark-cli drive +version-delete \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --yes \
  --as user
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标文件 token |
| `--version` | 是 | `drive +version-history` 返回的长数字 `version` 字段，不是 `tag` |
| `--yes` | 是 | 确认执行高风险删除操作 |

## 返回值

无额外业务字段，以命令成功 / 失败为准。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-3b4e905df051a5ac"></a>

## references/lark-drive-version-get.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +version-get

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

下载指定版本的文件内容。该 shortcut 同时支持 `--as user` 和 `--as bot`；自动化场景推荐使用 `--as bot`。

## 命令

```text
lark-cli drive +version-get \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --as bot

lark-cli drive +version-get \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --as user

lark-cli drive +version-get \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --output ./downloads/ \
  --as bot

lark-cli drive +version-get \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --output ./artifact.bin \
  --overwrite \
  --as bot
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标文件 token |
| `--version` | 是 | `drive +version-history` 返回的长数字 `version` 字段，不是 `tag` |
| `--output` | 否 | 本地保存路径或目录；省略时保存到当前目录，并优先使用服务端文件名 |
| `--overwrite` | 否 | 覆盖已存在的本地输出文件 |

## 关键行为

- 省略 `--output` 时，CLI 保存到当前目录，并优先使用服务端文件名
- `--output` 指向已存在目录，或以 `/` / `\\` 结尾时，CLI 会使用远端文件名保存
- `--output` 是文件路径且没有后缀时，CLI 会像 `docs +media-download` 一样尝试从响应头推断后缀；推不出来就保持无后缀
- 目标文件已存在时，只有显式传 `--overwrite` 才会覆盖

## 返回值

返回值：

```json
{
  "ok": true,
  "identity": "bot",
  "data": {
    "file_token": "boxcnxxxxxxxx",
    "version": "7633658129540910621",
    "file_name": "artifact.bin",
    "saved_path": "/abs/path/artifact.bin",
    "size_bytes": 12345
  }
}
```

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-1a3638390e927950"></a>

## references/lark-drive-version-history.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +version-history

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

列出指定文件的历史版本快照。该 shortcut 同时支持 `--as user` 和 `--as bot`；自动化场景推荐使用 `--as bot`。

## 命令

```text
lark-cli drive +version-history \
  --file-token boxcnxxxxxxxx \
  --as bot

lark-cli drive +version-history \
  --file-token boxcnxxxxxxxx \
  --as user

lark-cli drive +version-history \
  --file-token boxcnxxxxxxxx \
  --limit 50 \
  --cursor 1777013761763 \
  --as bot

lark-cli drive +version-history \
  --file-token boxcnxxxxxxxx \
  --dry-run \
  --as bot
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标文件 token |
| `--limit` | 否 | 返回条数上限，范围 `1-200`，默认 `20` |
| `--cursor` | 否 | 分页游标；取上一页返回的 `next_cursor` 回填 |

## 关键行为

- shortcut 内部固定传 `only_tag=true`
- 返回 `has_more=true` 时，使用 `next_cursor` 继续翻页
- `versions[].version` 是传给 `drive +version-get` / `+version-revert` / `+version-delete` 的长数字版本串；`tag` 只是展示序号，不能替代 `version`
- `versions[].is_deleted` 为布尔值，表示该历史版本是否已被删除

## 返回值

```json
{
  "ok": true,
  "identity": "bot",
  "data": {
    "versions": [
      {
        "version": "7633658129540910621",
        "name": "report.md",
        "edited_at": "1777013761763",
        "edited_by": "ou_xxx",
        "size_bytes": "12345",
        "action_type": "upload",
        "is_deleted": false,
        "tag": 7
      }
    ],
    "has_more": true,
    "next_cursor": "1777013761763"
  }
}
```

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-f842f6b78522ae26"></a>

## references/lark-drive-version-revert.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# drive +version-revert

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

将文件回滚到指定历史版本。该 shortcut 同时支持 `--as user` 和 `--as bot`；自动化场景推荐使用 `--as bot`。

## 命令

```text
lark-cli drive +version-revert \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --as bot

lark-cli drive +version-revert \
  --file-token boxcnxxxxxxxx \
  --version 7633658129540910621 \
  --as user
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标文件 token |
| `--version` | 是 | `drive +version-history` 返回的长数字 `version` 字段，不是 `tag` |

## 返回值

无额外业务字段，以命令成功 / 失败为准。

## 参考

- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) -- 云空间（云盘/云存储）全部命令
- [lark-shared]（按模块名读取对应工作流） -- 认证和全局参数


<a id="s-99611fd285084ffc"></a>

## references/lark-drive-workflow-knowledge-organize-analysis.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流：Analysis

Loaded by states: `CONTENT_READ`, `ISSUE_ANALYSIS`, `RULE_GENERATION`.

This file owns low-confidence partial reads, issue analysis, classification rules, and target tree generation. It MUST NOT create execution plans, ask for execution confirmation, or perform write operations.

## Required Context

Before executing rules in this file:

1. `resource_items` MUST already exist from [`lark-drive-workflow-knowledge-organize-discovery.md`](lark-drive-0.md#s-9b1c8524f8f6530e).
2. For document partial reads, follow [`../../lark-doc/SKILL.md`](lark-doc-0.md#s-716f3f9ec728a423) and [`../../lark-doc/references/lark-doc-fetch.md`](lark-doc-0.md#s-a8f2a17fdca55dac).
3. For sheet / bitable down-drill, follow [`../../lark-sheets/SKILL.md`]（按模块名读取对应工作流） or [`../../lark-base/SKILL.md`]（按模块名读取对应工作流） only when title and path are insufficient.

## State: CONTENT_READ

Entry: `resource_items` exists.

MUST:

1. Build `low_confidence_items`.
2. Apply `Low-Confidence Partial Read`.
3. Read only supported docs through `lark-doc-fetch`.
4. Switch to `lark-sheets` / `lark-base` only when sheet / bitable title and path are insufficient.
5. Record read evidence for classification.
6. Continue reading low-confidence resources in internal batches until all supported low-confidence resources in the current inventory are processed or a blocker occurs.
7. Apply `Analysis Progress Reporting`.
8. Output progress / summary without asking the user to continue between batches.

Exit: low-confidence items are classified or marked `needs_review=true`.

### Low-Confidence Partial Read

Low-confidence resources include:

- 标题为空
- 标题为 `test` / `测试` / 纯数字 / 无意义短词
- 标题、路径、类型之间没有足够分类线索
- 同一标题或相似标题出现在多个候选分类中
- 用户要求按项目 / 客户 / 业务线归类，但标题和路径没有明确项目 / 客户 / 业务线名称

| Condition | Agent MUST Do | Agent MUST NOT Do |
|-----------|---------------|-------------------|
| Title / path / type clearly determine classification | Classify directly | Do not perform content read |
| Resource is low-confidence and docs-fetch-supported | Read outline via `lark-doc-fetch` | Do not skip partial read |
| Candidate project / customer / business / document-type terms exist | After outline, run keyword partial read with candidate terms | Do not use broad generic keywords |
| Partial read returns usable block id and classification is still unclear | Read the relevant section via `lark-doc-fetch` | Do not read the full document |
| Partial read still cannot classify | Set `needs_review=true`; classify to manual confirmation target | Do not invent classification |
| Read fails or permission is insufficient | Set `needs_review=true`; record failure reason | Do not retry indefinitely |

### Partial Read Limits

| Limit | Default |
|-------|---------|
| `batch_size` | 20 resources per internal batch |
| `progress_report_interval` | 50 low-confidence resources |
| `max_attempts_per_resource` | 3 partial reads: outline, keyword, section |

Batching rules:

1. Sort low-confidence resources by impact before reading: root-level loose items, duplicated titles, project/customer ambiguity, then empty or meaningless titles.
2. Read supported low-confidence resources across internal batches without asking the user to continue after each batch.
3. Process reads in internal batches of `batch_size`; do not ask the user between internal batches unless auth, permission, or API errors block progress.
4. After each internal batch, update `low_confidence_items` with read evidence or `needs_review=true`.
5. After every `progress_report_interval` processed resources, output a progress summary and continue automatically.
6. If unread low-confidence resources remain because of auth, permission, API, unsupported type, or tool budget blockers, set `partial=true`, report unread count, and default remaining unread items to `needs_review=true` with target path set to manual confirmation target.
7. Never bypass these limits by reading full documents.

### Low-Confidence Read Start Notice

When `low_confidence_total > 100`, output this notice before reading:

```text
低置信度资源较多，共 <low_confidence_total> 项。我会分批做轻量读取并定期汇报进度；不会读取全文，也不会执行移动或创建。
```

### Low-Confidence Read Summary

Use this as progress / final summary output. Do not ask the user to continue unless a blocker occurs.

```text
低置信度内容读取进度

- 低置信度资源总数：<low_confidence_total>
- 已读取：<read_done>/<low_confidence_total>
- 已补充证据并完成分类：<classified_count>
- 暂入待人工确认：<needs_review_count>
- 失败：<failed_count>

继续分析整理问题。
```

Output this summary:

- After every 50 processed low-confidence resources.
- Once after low-confidence reading finishes.
- About every 60 seconds during long-running reads, even if fewer than 50 additional resources were processed.

### Analysis Progress Reporting

Applies to `CONTENT_READ`, `ISSUE_ANALYSIS`, and `RULE_GENERATION`.

Rules:

1. For `CONTENT_READ`, use `Low-Confidence Read Summary` as the progress report format.
2. For `ISSUE_ANALYSIS`, if analysis runs longer than about 60 seconds, output progress about every 60 seconds with current stage, processed resource count when known, detected problem type count when known, and the next analysis step.
3. For `RULE_GENERATION`, if classification rule or target-tree generation runs longer than about 60 seconds, output progress about every 60 seconds with current stage, classified item count when known, unresolved item count when known, and target category / path count when known.
4. Progress reports MUST be factual and stage-specific. Do not output generic "still running" messages without counts or the current stage.
5. Do not ask the user to continue between internal batches unless auth, permission, API, target scope, or environment blockers occur.
6. Do not expose internal chain-of-thought, raw tokens, or intermediate rule drafts.

Examples:

```text
分析进度：正在归纳整理问题，已处理 <processed_count>/<resource_count> 项资源，已识别 <problem_type_count> 类问题。继续生成整理思路，不会执行移动或创建。
```

```text
规则生成进度：正在生成分类规则和目标目录，已归类 <classified_count> 项，待人工确认 <needs_review_count> 项。继续生成完整计划前置数据。
```

## State: ISSUE_ANALYSIS

Entry: `resource_items` and partial-read evidence are ready.

MUST:

1. Detect problems from organization perspective only. Do not generate research conclusions.
2. Generate an organization approach based on inventory, low-confidence read evidence, and detected problems.
3. Include how non-reused source containers will be handled after their contents are moved.
4. Apply `Analysis Progress Reporting`.
5. Output `Inventory And Organization Approach Decision`.
6. Stop and wait for the user to confirm the approach before `RULE_GENERATION`.

Problem rules:

| Problem | Detection Rule |
|---------|----------------|
| 根目录堆积 | 根目录直接资源过多，或超过总资源的明显比例 |
| 同类文件分散 | 标题 / 类型相似的资源分布在多个无关路径 |
| 命名不统一 | 同类资源日期、客户、项目命名格式明显不一致 |
| 临时内容过多 | 标题 / 路径含 `临时`、`测试`、`tmp`、`draft`、`转移`、`未整理` |
| 空目录 | 目录类节点无后代资源 |
| 重复目录 | 目录名归一化后相同或高度相似 |
| 过旧归档内容 | 旧年份资源仍散落在活跃目录 |

MUST output evidence count or example paths. Do not output only abstract judgment.

### Problem Pagination

| Output Area | Rule |
|-------------|------|
| Problem overview | Show at most 5 problem types per page |
| Problem examples | Show at most 3 example paths per problem type |
| Pagination | Affects display only; complete `issue_summary` MUST remain internal |

### Inventory And Organization Approach Decision

```text
盘点与整理思路

盘点结果：
| 指标 | 数量 |
|------|------|
| 总资源数 |  |
| 各类型资源数 |  |
| 一级目录数量 |  |
| 根目录直接资源数 |  |
| 空目录数量 |  |
| 低置信度资源数 |  |
| 已完成低置信度读取 |  |
| 待人工确认 |  |
| partial |  |

共发现 <problem_type_count> 类问题，当前展示第 <page>/<total_pages> 页。

| 问题 | 证据数量 | 样例路径 | 说明 |
|------|----------|----------|------|

整理思路：
- <approach item 1>
- <approach item 2>
- 对证据不足、读取失败或权限不足的资源放入"待人工确认"
- 如存在不再复用的来源目录，内容迁出后将目录本体收起到 `待人工确认/待清理旧目录`，避免整理后一级目录仍杂乱
- 不删除、不重命名、不修改权限

是否基于这个整理思路生成目标目录和移动 / 创建计划？

你可以选择：
1. 基于这个思路生成目标目录和计划
2. 调整整理思路
3. 查看问题详情
4. 取消本次整理
```

## State: RULE_GENERATION

Entry: user confirms the organization approach.

MUST:

1. Generate `classification_rules`.
2. Generate `target_tree`.
3. Generate `target_tree` to at least two levels; include third level when needed for project / customer / document-type grouping.
4. Reuse existing clear structure when possible.
5. Identify reused top-level containers and non-reused source containers, and set `source_container_disposition`.
6. For non-reused source containers, ensure `target_tree` includes a source-container cleanup target, defaulting to `待人工确认/待清理旧目录`, unless the user explicitly asks to keep source containers in place.
7. Ensure target tree can contain every planned `target_path`.
8. Ensure the target tree contains a manual confirmation target named `待人工确认` unless the user explicitly provides an equivalent name.
9. Apply `Analysis Progress Reporting`.
10. Continue to `PLAN_GENERATION` without a separate target-tree-only confirmation.

### Classification

| Condition | Agent MUST Do |
|-----------|---------------|
| Existing structure is clear | Reuse existing directory names and hierarchy |
| Title / path / type is enough | Classify without content read |
| Item remains uncertain after mandatory partial read | Put into manual confirmation target and set `needs_review=true` |
| Item is temporary / test / draft | Prefer temporary / test target |
| Root has many loose resources | Prefer organizing root-level obvious items first |
| User asks project / customer grouping | Use project / customer names from title, path, and partial read evidence |
| Naming is inconsistent | Report the issue with examples only; do not generate rename actions |

### Adaptive Classification

The agent MUST NOT start from a fixed default category list. A fixed taxonomy can bias classification and confuse users when category names or numeric prefixes do not match their resources.

Derive categories from the current `resource_items` and partial-read evidence:

1. First group resources by clear signals from title, current path, type, and mandatory partial-read evidence.
2. Prefer category names that appear in the user's own content, such as project names, customer names, business lines, document types, years, or existing folder / Wiki node names.
3. Create a category only when there is enough evidence for at least one resource.
4. Do not create generic buckets such as archive, temporary, test, meeting, dashboard, or operations unless the current resources contain matching evidence.
5. Do not add numeric prefixes to category names unless the user explicitly asks for ordered naming.
6. Always keep a manual confirmation target named `待人工确认` or an equivalent user-specified name for unresolved items.

### Target Tree

`target_tree` is generated in this state but shown together with the move / create plan in `PLAN_GENERATION`. Do not stop after displaying a target tree alone.

## Analysis Failure Handling

| Failure / Blocker | Agent MUST Do | Agent MUST NOT Do |
|-------------------|---------------|-------------------|
| Missing API scope | Follow `lark-shared` permission handling and stop | Do not retry the same command repeatedly |
| Resource access denied | Stop and follow the main workflow `Permission Request Gate` | Do not request permission automatically or in batch |
| Partial document read fails for a low-confidence item | Mark item `needs_review=true`, record reason, and route to manual confirmation target | Do not classify by guessing |
| Item remains ambiguous after partial read | Mark `needs_review=true` and route to manual confirmation target | Do not invent classification |


<a id="s-9b1c8524f8f6530e"></a>

## references/lark-drive-workflow-knowledge-organize-discovery.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流：Discovery

Loaded by states: `PARSE_SCOPE`, `INVENTORY`.

This file owns target parsing, scope clarification, resource inventory, ResourceItem normalization, dedupe, and partial inventory handling. It MUST NOT generate classification rules, execution plans, or perform write operations.

## Required Context

Before executing rules in this file:

1. Follow [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） for identity, auth, and permission handling.
2. For Wiki / personal library targets, follow [`../../lark-wiki/SKILL.md`](lark-wiki-0.md#s-384c23a567152824).
3. For Drive folder inventory, follow [`lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97).
4. For Drive search targets, follow [`lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9).
5. For URL / token inspection, follow [`lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587) and [`../../lark-wiki/references/lark-wiki-node-get.md`](lark-wiki-0.md#s-5b3c1d410c11b5c9).

## State: PARSE_SCOPE

Entry: workflow triggered.

MUST:

1. Identify `target_scope`, `environment_profile`, and `identity`.
2. Apply `Scope Parsing`.
3. Output `Scope Confirmation`.
4. Stop and wait for user confirmation before `INVENTORY`.

Exit: user confirms target scope.

### Scope Parsing

| Condition | Agent MUST Do | Set `target_scope` | Next State |
|-----------|---------------|--------------------|------------|
| Input is `/wiki/<token>` URL | Resolve the Wiki node and preserve both node identity and object identity | Wiki node | `INVENTORY` after user confirms scope |
| Input is Wiki space name / `space_id` | Resolve the Wiki space; 0 matches -> stop and ask; 1 exact match -> continue; multiple matches -> show candidates and wait for user selection; do not treat `my_library` as a normal listed space | Wiki space | `INVENTORY` after user confirms scope |
| Input has Personal Library Intent | Treat as Wiki personal library / `my_library`; resolve real `space_id` before root write; do not treat it as Drive root or owned Drive document search | Personal doc library | `INVENTORY` after user confirms scope |
| Input is `/drive/folder/<token>` URL | Extract `folder_token` | Drive folder | `INVENTORY` after user confirms scope |
| Input has Drive Folder Intent but no concrete folder URL, token, or unique folder name | Ask for folder URL / token / name; if a concrete folder name exists, search folder candidates and wait for user selection when 0 or multiple matches exist | Unknown or Drive folder candidate | Stay in `PARSE_SCOPE` until scope is confirmed |
| Input has Broad Cloud Drive Intent without explicit owned-document search request | Ask the user to choose concrete scope: Drive folder URL / token, Drive root, owned Drive document search, or another explicit search filter; do not default to `drive +search --mine` | Unknown | Stay in `PARSE_SCOPE` until scope is confirmed |
| Input is single cloud resource URL | Resolve the resource type; if not folder / Wiki scope, do not expand automatically | Single resource | Ask whether scope is this resource, parent folder, owning Wiki, or related search results |
| Input is real keyword / name | Search with the real keyword according to `lark-drive-search` | Search scope | `INVENTORY` after user confirms scope |
| Input is range browsing / statistical description with no real keyword | Search by filters / empty-query browsing according to `lark-drive-search` | Search scope | `INVENTORY` after user confirms scope |
| Input is ambiguous | Ask the minimum clarification question and stop | Unknown | Stay in `PARSE_SCOPE` |

Personal Library Intent means the user is referring to the current user's own Feishu document library / personal document library / personal knowledge library, such as `个人文档库`, `飞书个人文档库`, `我的文档库`, `个人知识库`, `我的知识库`, `My Document Library`, or `my_library`.

When this intent is detected, use Wiki personal library semantics. Do not use Drive root, `drive +search --mine`, or broad owned-document search unless the user explicitly asks to search owned Drive documents.

Drive Folder Intent means the user wants to organize a specific Drive folder or Drive folder tree. A Drive folder scope requires a concrete folder URL, folder token, or user-selected folder candidate.

When this intent is detected without a concrete folder identity, stop in `PARSE_SCOPE` and ask for clarification. Do not use Drive root, `drive +search --mine`, or broad owned-document search unless the user explicitly asks for Drive root or owned-document search.

Broad Cloud Drive Intent means the user refers to a broad cloud-drive-level scope such as `我的飞书云盘`, `我的云盘`, `我的云空间`, `我的空间`, or `整理云盘`, without a concrete folder URL / token / unique folder name.

This intent is broader than Drive Folder Intent and MUST NOT be silently converted to owned-document search. Ask the user to choose one of:

1. A specific Drive folder URL / token.
2. Drive root, only when the user explicitly accepts root-level scope.
3. Owned Drive document search, only when the user explicitly asks to organize documents owned / managed by the current user.
4. Another explicit search filter, such as keyword, type, time range, or folder token.

### Stop Conditions

Stop and ask for clarification when:

1. 用户只说"整理文件夹"、"整理目录"、"整理资料"、"整理文档"、"我的文档"，且没有 URL、token、知识库名称、Personal Library Intent、concrete Drive folder identity 或明确搜索范围。
2. 用户说"我的文件夹"、"我的目录"、"我的空间"、"我的云盘"、"我的飞书云盘"、"我的云空间"，但无法唯一判断是具体 Drive 文件夹、Drive 根目录、owned Drive document search、个人文档库还是某个 Wiki 节点。
3. 用户给的是单个资源 URL，但要求"整理一批文档"或"整理相关资料"。
4. 用户目标环境不明确，且上下文中同时存在线上、BOE、PRE 或多个 profile。

Clarification template:

```text
请提供要整理的 Drive 文件夹链接、Wiki 节点 / 知识库链接，或明确说明要整理"我的文档库"；如果只想按关键词搜索整理，也请给出关键词或范围。
```

### Scope Confirmation

```text
我先确认本次整理范围。

目标：
范围：
环境 / profile：
身份：
预计操作：先盘点并生成整理方案，不执行移动或创建。

请确认是否按这个范围继续？
```

Scope confirmation is user-facing. It MUST confirm only the business scope, environment / profile, identity, and whether write operations will run.

Do not display internal batching controls in scope confirmation, including `max_depth`, `max_items`, `page_size`, page tokens, retry counts, or `partial=true`. For example, when the user confirms Drive root, say the scope is the Drive root tree; do not append "recursive depth at most 3" or "at most 500 resources".

## State: INVENTORY

Entry: `target_scope` confirmed.

MUST:

1. Recursively list resources according to target type.
2. Generate `path` during traversal.
3. Normalize all results to `ResourceItem`.
4. Track pagination, depth, item limits, and continuation checkpoints.
5. Treat pagination, depth, item, and per-folder page limits as batching checkpoints; continue inventory in the confirmed scope unless blocked.
6. Set `partial=true` only when inventory cannot continue because of auth, permission, API / pagination failure after retries, API coverage limitations, tool budget, target scope, or environment blockers.
7. Apply `Inventory Progress Reporting`.
8. Output `Inventory Summary`.
9. Do not leave `INVENTORY` while `inventory_continuation_state` has queued folders, nodes, pages, or slices that can still be fetched.
10. Continue to `CONTENT_READ` without asking the user only after the confirmed scope is exhausted or blocked.

### Inventory Batch Checkpoints

| Scope | Internal Batch Checkpoint | Required Continuation |
|-------|---------------------------|-----------------------|
| Wiki recursion | `max_depth=3`, `max_items=500`; follow `lark-wiki-node-list` pagination | Record queued nodes / paths in `inventory_continuation_state` and immediately continue the next internal batch within the confirmed scope unless blocked |
| Drive folder tree | `max_depth=3`, `max_items=500`, max 10 pages per folder, `page_size=200` | Record queued folders / pages in `inventory_continuation_state` and immediately continue the next internal batch within the confirmed scope unless blocked |
| Search discovery | `page_size=20`, `max_items=500`; continue pages until `has_more=false` | Record remaining pages / slices in `inventory_continuation_state` and immediately continue the next internal batch within the confirmed scope unless blocked |

These checkpoints are pacing controls, not coverage limits. If the confirmed scope still has queued work after a checkpoint, continue with the next internal batch instead of presenting the current `resource_items` as final inventory or moving to content analysis.

When a depth checkpoint is reached, enqueue the child folders / nodes that would exceed the current batch depth; the next batch starts from those queued children with their original paths preserved. When an item checkpoint is reached, persist the current folder / node / page cursor plus the remaining queue, visited page keys, and resource dedupe keys, then continue from that checkpoint before analysis or planning.

If tool budget would be exceeded for a very large confirmed scope, stop only at that blocker, report that the inventory is incomplete, and suggest batching by first-level directory, Wiki space, or time window. Do not stop merely because a depth or item checkpoint was reached.

### Inventory Continuation Rules

1. Pagination, depth, item, and per-folder page limits are internal batching checkpoints.
2. When a checkpoint is reached, record `inventory_continuation_state` with `scope`, `queue`, `current_cursor`, `visited_page_keys`, `dedupe_keys`, and `blockers`; Drive queue entries MUST contain `folder_token`, `path`, `depth`, and `page_token`; Wiki queue entries MUST contain `space_id` / `node_token`, `path`, `depth`, and pagination cursor; search entries MUST contain query / filters and pagination cursor.
3. A depth checkpoint MUST enqueue deeper folders / nodes; it MUST NOT discard them or treat the current depth as final coverage.
4. An item-count checkpoint MUST persist the current cursor and queue; it MUST NOT transition to `CONTENT_READ`, `ISSUE_ANALYSIS`, or `PLAN_GENERATION` while fetchable work remains.
5. If `inventory_continuation_state` is missing, corrupt, or lacks required fields for the current scope, set `partial=true`, record the checkpoint blocker, and do not claim full coverage.
6. Do not set `partial=true` solely because a valid batching checkpoint was reached.
7. Set `partial=true` only when continuation is blocked by auth, permission, API / pagination failure after retries, API coverage limitations, tool budget, target scope, or environment blockers.
8. Do not claim full coverage until the continuation queue for the confirmed scope is exhausted or blocked.

### Inventory Progress Reporting

Inventory can be long-running when a Drive root, large folder tree, Wiki space, or broad search scope is confirmed.

Rules:

1. When inventory starts, output one concise stage notice with the confirmed scope type and the fact that no write operation will be executed.
2. If inventory runs longer than about 60 seconds, output progress about every 60 seconds.
3. Progress reports SHOULD include only fields that are currently known: scanned folders / nodes, collected resources, current depth, queued folders / nodes, current search page / slice, and current blocker if any.
4. When a batching checkpoint is reached and continuation will proceed automatically, report it as continuing inventory, not as a user action request.
5. Do not output filler such as "still running" without current counts or current stage.
6. Do not expose raw folder tokens, page tokens, retry logs, or `partial=true` unless the user explicitly asks to view inventory coverage details.

Example:

```text
盘点进度：已扫描 <scanned_container_count> 个目录 / 节点，收集 <resource_count> 项资源，队列剩余 <queued_container_count> 个目录 / 节点。继续盘点，不会执行移动或创建。
```

### Wiki Inventory Rules

1. Follow [`../../lark-wiki/references/lark-wiki-node-list.md`](lark-wiki-0.md#s-8a3585c4cccac51a) traversal semantics.
2. Generate stable paths from parent-child traversal.
3. Preserve Wiki node identity fields needed by `ResourceItem`.
4. Treat `my_library` as Wiki personal library, not Drive root.

### Drive Inventory Rules

1. Use `drive files list` according to [`lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97); its schema path is `drive.files.list`.
2. Use the same Drive folder-tree traversal for Drive root and ordinary folders after the first request. Drive root differs only for the first-level request: it uses omitted or empty `folder_token`, does not support pagination, and does not return root-level shortcuts according to schema; returned child folders MUST still be listed by their own folder tokens like ordinary folders, and those ordinary folder lists may return `type=shortcut` entries. For a Drive root target, record this root-level shortcut coverage caveat, set `partial=true` only if the user requested full root-level shortcut coverage or root pagination cannot continue, and do not claim root-level shortcut coverage as complete.
3. Recurse only into `folder` items within the confirmed scope.
4. For each directory, continue pages manually by feeding the returned `next_page_token` into request param `page_token`. Do not rely on `--page-all` for inventory.
5. If a page returns `has_more=true` but no usable `next_page_token`, retry the same page request up to 3 times. If retries still cannot produce a continuation token, set `partial=true` for that directory and record the pagination blocker.
6. Use `drive metas batch_query` when URL, owner, created time, or updated time is needed.
7. Pagination blocker details such as `partial=true`, folder token, page token, and retry logs are internal by default. Do not show them to the user unless the user explicitly asks to view inventory coverage details.

### Search Inventory Rules

1. Search results may be normalized directly only when they include stable identity fields required by `ResourceItem`.
2. If a search result is a Wiki item and lacks `node_token`, resolve it with `drive +inspect` or `wiki +node-get` before dedupe.
3. If Wiki identity still cannot be resolved, keep the item, set `needs_review=true`, and record `needs_review_reason`.
4. For search scope, use `page_size=20` unless a lower value is required by the command.
5. Continue fetching pages until `has_more=false`.
6. If `max_items=500` is reached in one batch, record the current search cursor in `inventory_continuation_state` and continue the next internal batch without asking the user.
7. Do not stop at an arbitrary sample size such as first 5 pages unless the user explicitly asks for sampling or auth, permission, API, environment, or tool-budget blockers occur.
8. If `service_total` / result total is greater than collected items, treat it as continuation evidence: continue fetching when a cursor / page is available; set `partial=true` only if continuation is blocked.
9. Do not present a partial search sample as complete inventory. Before generating a full organization plan from partial search results, continue fetching available pages unless the user explicitly asked for sampling or a blocker prevents continuation.

## ResourceItem

Agent MUST normalize Wiki, Drive, and search results into `ResourceItem`. Later statistics, classification, and planning MUST use this model rather than raw API responses.

```json
{
  "source": "wiki|drive|search",
  "title": "资源标题",
  "type": "doc|docx|sheet|bitable|mindnote|file|wiki|folder|slides|shortcut|catalog",
  "path": "当前路径/资源标题",
  "depth": 2,
  "url": "https://...",
  "token": "canonical_token",
  "node_token": "wiki_node_token_or_empty",
  "obj_token": "wiki_obj_token_or_drive_file_token",
  "node_type": "origin|shortcut|empty",
  "origin_node_token": "wiki_origin_node_token_or_empty",
  "space_id": "wiki_space_id_or_empty",
  "parent_token": "parent_node_or_folder_token",
  "has_child": false,
  "dedupe_key": "wiki:<space_id>:<node_token>|drive:<type>:<token>|search:<type>:<token>",
  "created_at": "optional",
  "updated_at": "optional",
  "needs_review": false,
  "needs_review_reason": ""
}
```

ResourceItem rules:

1. `path` MUST be generated by recursion. Do not use title alone as path.
2. Wiki URL token may not be the underlying document token. Preserve both `node_token` and `obj_token`.
3. `type` MUST come from API fields such as `obj_type` / `doc_type`.
4. Wiki organization is by node instance. Prefer `wiki:<space_id>:<node_token>` as `dedupe_key`.
5. MUST NOT dedupe Wiki nodes only by `obj_token`; one document can appear under different Wiki paths or shortcuts.
6. If `node_type=shortcut` or dedupe is uncertain, use `wiki +node-get` to supplement `origin_node_token`; if unavailable, leave empty and set `needs_review=true`.
7. Drive folder tree dedupes by `drive:<type>:<token>`.
8. Search results may merge with recursive results only by exact identity: Wiki by same `node_token`, Drive by same `type + token`.

## Inventory Summary

```text
已完成当前可覆盖范围盘点。

<仅当适用：覆盖说明：Drive 根目录第一层清单不返回快捷方式；本次盘点不包含根目录第一层快捷方式。根目录下子文件夹会按普通文件夹继续盘点，普通文件夹内返回的 `type=shortcut` 条目仍会被纳入资源清单。>

| 指标 | 数量 |
|------|------|
| 总资源数 |  |
| 各类型资源数 |  |
| 一级目录数量 |  |
| 根目录直接资源数 |  |
| 空目录数量 |  |
| 疑似临时 / 测试 / 未整理资源数 |  |
| 低置信度待确认资源数 |  |

下一步将自动读取低置信度资源并分析整理问题；不会执行移动或创建。
```

## Discovery Failure Handling

| Failure / Blocker | Agent MUST Do | Agent MUST NOT Do |
|-------------------|---------------|-------------------|
| Target scope is ambiguous | Ask the minimum scope clarification question and stop | Do not choose a whole cloud drive / personal library by default |
| Environment / profile is ambiguous | Ask user to confirm prod / BOE / PRE and profile | Do not cross environment boundaries |
| Missing API scope | Follow `lark-shared` permission handling and stop | Do not retry the same command repeatedly |
| Resource access denied | Stop and follow the main workflow `Permission Request Gate` | Do not request permission automatically or in batch |
| Pagination / depth / item checkpoint reached | Record `inventory_continuation_state` and continue inventory in the confirmed scope | Do not set `partial=true` solely because a batching checkpoint was reached |
| Pagination cursor missing after retries / API pagination failure | Set `partial=true`; record the affected directory and blocker | Do not loop indefinitely or claim full coverage |


<a id="s-414852b02798d96c"></a>

## references/lark-drive-workflow-knowledge-organize-execution.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流：Execution

Loaded by states: `EXECUTE`, `VERIFY`.

This file owns confirmed write execution, PathTokenMap, progress reporting, verification, next suggestions, and execution-stage failure handling. It MUST NOT generate or revise plans.

## Required Context

Before executing rules in this file:

1. `active_plan_items` and `execution_scope` MUST already exist from [`lark-drive-workflow-knowledge-organize-planning.md`](lark-drive-0.md#s-ab4a6ec356c2f26a).
2. `target_tree` and `resource_items` MUST already exist.
3. Use the `PlanItem` structure already produced by the planning phase. Do not regenerate or revise plans in this file.
4. Follow command syntax, scope requirements, and confirmation behavior from referenced shortcut docs.
5. Follow `Non-goals` from the main workflow entry. Do not execute excluded operations from this file.
6. Maintain internal `rollback_snapshot` and `execution_journal` during writes, but do not mention recovery on the normal successful path.

## State: EXECUTE

Entry: user explicitly confirmed execution scope.

Allowed writes only:

- 创建 Drive 文件夹：`drive +create-folder`
- 移动 Drive 文件 / 文件夹：`drive +move`
- 创建 Wiki 节点：`wiki +node-create`
- 移动已有 Wiki 节点：`wiki +move --node-token`
- 续跑异步移动任务：`drive +task_result`
- 单个资源权限申请：`drive +apply-permission`

MUST:

1. Resolve all target paths through `PathTokenMap`.
2. Build internal `rollback_snapshot` for all move items in confirmed scope before any write operation.
3. Initialize `execution_journal` before any write operation.
4. Create target folders / nodes shallow to deep.
5. Save returned tokens immediately.
6. Append an `execution_journal` entry after every create / move / async continuation.
7. Apply parent-child source move ordering.
8. Execute only confirmed scope.
9. Record success/failure per `PlanItem`.
10. Apply `Progress Reporting`.

MUST NOT:

- Execute operations listed in `Non-goals`.
- Rename or patch resource titles.
- Move using path string instead of token.
- Use `wiki +move` docs-to-wiki mode.
- Output rollback snapshot, rollback readiness, or execution journal on the normal successful path.

### Internal Recovery Hooks

These hooks are mandatory internal state maintenance. They do not create user-facing output on the normal path.

Rules:

1. Build `rollback_snapshot` before the first write command.
2. Include only compact fields needed for recovery. Do not store full API responses.
3. Append `execution_journal` immediately after each write attempt, including successful creates, successful moves, failed moves, and async continuation results.
4. If snapshot or journal cannot be maintained, stop before further writes and report the blocker.
5. If a write blocker occurs after one or more successful moves, report the blocker and ask whether the user wants to try restoring to `整理前的位置`.
6. Do not load the rollback phase or execute recovery until the user explicitly chooses to try restore.

Recovery question template:

```text
执行暂停：已成功移动 <moved_success_count> 项，失败 <failed_count> 项。

执行出现错误，已有部分资源移动成功。是否需要尝试恢复到整理前的位置？
```

### Progress Reporting

Small execution means `created_total + moved_total <= 50`.

For small executions, a final execution result is enough. For larger or long-running executions (`created_total + moved_total > 50`), the agent MUST periodically report progress by elapsed time and meaningful stage boundaries rather than by operation count alone.

Progress reports SHOULD be stage-specific. Include only fields relevant to the current stage. Do not output empty, unknown, or irrelevant fields.

Required fields by stage:

- Start: total create count, total move count, reporting cadence.
- Create stage finished: created count, failed count.
- Move stage progress / finished: current moved count as `<moved_done>/<moved_total>`, failed count, optional recent item.
- Blocked: current stage, completed count, blocker, required next action.

Examples:

- `执行开始：本次将创建 <created_total> 个目录 / 节点，移动 <moved_total> 个资源。任务较大，我会约每 60 秒汇报一次进度。`
- `执行进度：移动资源 <moved_done>/<moved_total>，失败 <failed_count>。`
- `执行暂停：<current_stage> 阶段遇到 <blocker>，已完成 <done>/<total>，需要 <required_action>。`

Rules:

1. When `created_total + moved_total > 50`, output one progress notice when execution starts.
2. After the create stage finishes, output one progress report when `created_total > 0`.
3. During the move stage, output a progress report about every 60 seconds, and once more when the move stage finishes.
4. Every move-stage progress report MUST include the current moved count as `<moved_done>/<moved_total>` and failed count, even if fewer than 50 additional moves completed since the previous report.
5. If execution is blocked by auth, permission, unresolved token, or API error, output the current progress and blocker before stopping.
6. Do not mention operation-count milestones such as "not yet reached 50 moves"; progress is time-based.
7. Do not output filler messages such as "still running", "no failure yet", or "not yet reached the next progress point" without current counts.
8. Do not report progress after every item unless the user explicitly asks for verbose execution logs.

## PathTokenMap

`PathTokenMap` maps target paths to real tokens before execution.

| Scope | Mapping |
|-------|---------|
| Drive | `target_path -> folder_token` |
| Wiki | `target_path -> node_token`, with `space_id` retained |

Rules:

1. Scan existing target folders / nodes before creating new ones.
2. Create planned folders / nodes from shallow to deep.
3. Save returned `folder_token` or `node_token` immediately after each successful create.
4. Execute `move` only when `target_parent_path` resolves to a token.
5. If same-name target ambiguity exists, inspect existing children when possible; otherwise mark `needs_review=true`.
6. Before writing to `my_library` root, resolve the real `space_id` according to `lark-wiki`.

## State: VERIFY

Entry: execution finished.

MUST:

1. Rescan target scope.
2. Compare each executed `PlanItem` with actual path/token.
3. Verify items covered by `covered_by_parent_move=true`.
4. Output success/failure/manual-confirmation counts.
5. Report mismatches with expected vs actual path/token.
6. Verify non-reused source containers planned for cleanup are no longer left in their original top-level position.
7. Verify reused target containers remain in place.
8. If serious mismatches exist, ask whether the user wants to try restoring to `整理前的位置`.
9. Do not load the rollback phase or execute recovery until the user explicitly chooses to try restore.

Verification table:

| plan_id | 动作 | 标题 | 预期目标 | 实际目标 | 预期 token | 实际 token | 状态 | 失败原因 |
|---------|------|------|----------|----------|------------|------------|------|----------|

### Verification Result

```text
执行完成。

| 项目 | 数量 |
|------|------|
| 创建成功 |  |
| 移动成功 |  |
| 待人工确认 |  |
| 失败 |  |

| plan_id | 动作 | 预期目标 | 实际目标 | 状态 | 失败原因 |
|---------|------|----------|----------|------|----------|
```

Serious mismatch recovery question template:

```text
验证发现 <mismatch_count> 项结果与计划不一致。

是否需要尝试恢复到整理前的位置？
```

### Next Suggestions

Only output `建议下一步` when at least one trigger exists. Do not add generic suggestions when execution and verification are clean.

Triggers:

- `partial=true`: inventory or content read was incomplete.
- Manual confirmation or low-confidence items remain.
- Failed items exist.
- One target folder / Wiki node contains more than 100 direct child resources after organization.
- Root-level loose resources remain.
- Non-reused source containers remain in their original top-level position after cleanup was planned.
- Verification found mismatches.

Template:

```text
建议下一步：
- <trigger-based suggestion>
```

## Execution Failure Handling

| Failure / Blocker | Agent MUST Do | Agent MUST NOT Do |
|-------------------|---------------|-------------------|
| Missing API scope | Follow `lark-shared` permission handling and stop | Do not retry the same command repeatedly |
| Resource access denied | Stop and follow the main workflow `Permission Request Gate` | Do not request permission automatically or in batch |
| Target path cannot resolve to token | Mark affected plan item failed or `needs_review=true` | Do not execute move with a path string |
| Target path has same-name ambiguity | Read existing children if possible; otherwise mark `needs_review=true` | Do not create duplicate target blindly |
| Async move returns `ready=false` or `next_command` | Follow the returned async continuation command | Do not assume completion |
| Parent-child move conflict | Follow source-depth ordering; move divergent children before parent | Do not move parent first when child target differs |
| Verification mismatch | Report expected vs actual path/token and failure reason | Do not silently mark success |
| Write blocker after successful moves | Report current progress and ask whether to try restoring to `整理前的位置` | Do not load rollback phase or execute recovery without explicit user choice |


<a id="s-ab4a6ec356c2f26a"></a>

## references/lark-drive-workflow-knowledge-organize-planning.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流：Planning

Loaded by states: `PLAN_GENERATION`, `EXEC_CONFIRM`.

This file owns plan generation, plan revision, user-facing pagination, and execution confirmation. It MUST NOT perform write operations.

## Required Context

Before executing rules in this file:

1. `resource_items`, `classification_rules`, and `target_tree` MUST already exist.
2. Follow command syntax, scope requirements, and confirmation behavior from referenced shortcut docs.
3. Follow `Non-goals` from the main workflow entry. Do not execute excluded operations from this file.

## State: PLAN_GENERATION

Entry: `target_tree` exists after the user confirmed the organization approach.

MUST:

1. Generate complete internal `plan_items`.
2. Build `DisplayItem` only for user-facing pages.
3. Apply `Plan Generation`.
4. Apply `Plan Pagination`.
5. Set `active_plan_items` to the latest complete plan.
6. Keep complete plan internally even if only one page is displayed.
7. Apply `Plan Generation Progress Reporting`.
8. Output `Target Tree And Plan Overview` or requested plan page, then wait.

### Plan Generation

| Condition | Agent MUST Do |
|-----------|---------------|
| Target path appears in any plan item | Ensure the path exists in `target_tree` |
| Source parent and descendants share same target subtree | Move parent only; mark descendants `covered_by_parent_move=true` |
| A child target differs from parent target | Move divergent child before parent; order by `source_depth` from deep to shallow |
| Target directory / node does not exist | Add `create_folder` / `create_node` before move |
| Resource is root-level and target path differs from current path | Add a `move` plan item; do not leave root-level resources in place by default |
| Resource has `needs_review=true` because classification evidence is insufficient | Set `target_path` to manual confirmation target, set `action=move`, and preserve `needs_review_reason` |
| Top-level folder / Wiki node has descendants that share the same target subtree | Move the parent folder / node only; descendants are covered by parent move |
| Top-level folder / Wiki node has descendants with divergent target subtrees | Move divergent descendants first; then move the parent only if it still has a target path or needs manual confirmation |
| Source container is reused as a target container | Keep the container in place; do not move it as source-container cleanup |
| Non-reused source container has descendants moved elsewhere | Add an explicit folder / node move plan item after descendant moves; target defaults to the source-container cleanup target |
| Source container handling is ambiguous | Move it to the manual confirmation target or mark `needs_review=true`; do not leave it in the root by default |
| Target parent token unresolved | Keep plan item but block execution until token is resolved |
| Resource title is poor or inconsistent | Report the naming issue only; do not create rename or title-patch plan items |

### Plan Generation Progress Reporting

Plan generation can be long-running when `resource_items` is large or source-container parent / child move ordering is complex.

Rules:

1. If plan generation starts with more than 500 `resource_items`, output one concise start notice with the resource count and that no write operation is being executed.
2. If plan generation runs longer than about 60 seconds, output progress about every 60 seconds.
3. Progress reports SHOULD include only fields currently known: processed resource count, generated plan item count, create count, move count, source-container move count, review count, and current step.
4. Do not display unpaginated plan details as progress. Complete `plan_items` remain internal until the normal paginated output.
5. Do not ask the user to continue during plan generation unless auth, permission, API, target scope, or environment blockers occur.
6. Do not output filler such as "still running" without current counts or current step.

Example:

```text
计划生成进度：已处理 <processed_count>/<resource_count> 项资源，生成 <plan_item_count> 项计划，其中创建 <create_count> 项、移动 <move_count> 项。继续计算父子目录移动顺序，不会执行创建或移动。
```

## PlanItem

`PlanItem` is for internal execution. It may contain tokens and internal enums.

| Field | Meaning |
|-------|---------|
| `plan_id` | Stable unique ID for plan / verification, such as `P001` |
| `source_path` | Current path |
| `title` | Resource title |
| `type` | Resource type |
| `source_token` | Drive token or normal resource token |
| `source_node_token` | Wiki node token; empty for non-Wiki resources |
| `source_parent_token` | Current parent folder token or parent Wiki node token |
| `source_depth` | Original depth in source tree |
| `target_path` | Target path |
| `target_parent_path` | Target parent path |
| `target_parent_token` | Target parent token; may be empty during planning, MUST be resolved before execution |
| `action` | Internal enum: `keep` / `create_folder` / `create_node` / `move` |
| `covered_by_parent_move` | Whether an ancestor move already covers this item |
| `reason` | Classification reason |
| `evidence_paths` | Evidence paths |
| `evidence_count` | Evidence count or hit count |
| `confidence` | Internal enum: `high` / `medium` / `low` |
| `needs_review` | Whether human review is required |
| `needs_review_reason` | Reason requiring human review |
| `rollback_origin_kind` | Internal recovery origin marker: `drive_folder` / `drive_root` / `wiki_node` / `wiki_space_root` / `unknown` |
| `rollback_origin_token` | Original parent token when applicable; empty for root markers |
| `rollback_origin_space_id` | Original Wiki space ID when `rollback_origin_kind=wiki_space_root` |
| `rollback_supported` | Whether this move item can be restored automatically if recovery is requested |
| `rollback_blocker` | Internal reason when `rollback_supported=false` |

### Rollback Origin Readiness

This is an internal execution-safety rule. Do not expose rollback readiness on the normal user-facing execution confirmation path.

Rules:

1. `action=move` items entering execution SHOULD have `rollback_origin_kind`.
2. `rollback_origin_kind` can be:
   - `drive_folder`: original Drive parent folder token is known.
   - `drive_root`: original location is the Drive root.
   - `wiki_node`: original Wiki parent node token is known.
   - `wiki_space_root`: original location is the Wiki space root and `rollback_origin_space_id` is known.
3. If `rollback_origin_kind` is missing or `unknown`, the agent MUST try to resolve it before execution from `ResourceItem.parent_token`, traversal context, `source_path`, `space_id`, or `wiki +node-get` for Wiki resources.
4. If the origin is still unresolved, set `rollback_supported=false` and `rollback_blocker`, but do not block the entire execution solely because recovery is unsupported.
5. Target resolution remains mandatory: a move item with unresolved `target_parent_token` MUST NOT execute.
6. Internal recovery metadata MUST NOT change `DisplayItem` output on the normal successful path.

## DisplayItem

`DisplayItem` is for user-facing output. It MUST NOT expose raw internal enum values.

| Display Field | Source |
|---------------|--------|
| `序号` | Page-local row number |
| `当前位置` | `source_path` |
| `标题` | `title` |
| `类型` | Human-readable `type` when possible; raw type is acceptable only when there is no clearer label |
| `目标位置` | `target_path` |
| `动作` | Convert from `action` using action display map |
| `原因` | `reason` |
| `置信度` | Convert from `confidence` using confidence display map |
| `待确认原因` | `needs_review_reason` |

Action display map:

| Internal Enum | User-Facing Label |
|---------------|-------------------|
| `keep` | 保持不变 |
| `create_folder` | 创建文件夹 |
| `create_node` | 创建知识库节点 |
| `move` | 移动到目标目录 |

`needs_review=true` is a review state, not an action. A review item MUST still use `action=move` when its target is the manual confirmation target.

### Manual Confirmation Target

Resources with insufficient classification evidence MUST be moved to the manual confirmation target after the user confirms execution.

Rules:

1. The target tree MUST include `待人工确认` or an equivalent user-specified manual confirmation path.
2. For Drive scopes, the manual confirmation target is a Drive folder.
3. For Wiki scopes, the manual confirmation target is a Wiki node.
4. Plan items for these resources MUST set `needs_review=true`, preserve `needs_review_reason`, set `target_path` to the manual confirmation target, and set `action=move`.
5. Do not leave these items in their original location by default.

Confidence display map:

| Internal Enum | User-Facing Label |
|---------------|-------------------|
| `high` | 高，证据明确 |
| `medium` | 中，有依据但建议确认 |
| `low` | 低，需要人工确认 |

### Plan Pagination

| Output Area | Rule |
|-------------|------|
| Plan details | Show at most 20 plan items per page |
| Plan item count > 20 | MUST paginate; do not output all details at once |
| Plan item count > 500 | First response MUST show overview and filters only; no detail rows until user asks |
| Pagination | Affects display only; complete `plan_items` MUST remain internal |

### Target Tree And Plan Overview

```text
建议目标目录结构

<target_tree>

移动 / 创建计划总览

本次计划共 <total_count> 项：
- 创建目录 / 节点：<create_count> 项
- 移动资源：<move_count> 项（其中来源目录本体：<source_container_move_count> 项）
- 保持不变：<keep_count> 项
- 待人工确认：<review_count> 项
- 高置信度：<high_count> 项
- 中置信度：<medium_count> 项
- 低置信度：<low_count> 项

你可以选择：
1. 查看第 1 页明细
2. 只看将创建的目录 / 节点
3. 只看待人工确认项
4. 只看高置信度移动项
5. 进入下一步：确认执行计划
```

If `total_count > 500`, say:

```text
计划较大，我先只展示总览。
```

### Plan Revision Protocol

When the user corrects or adjusts the plan in `PLAN_GENERATION` or `EXEC_CONFIRM`, the agent MUST treat it as a full-plan revision unless the user explicitly asks to execute only the corrected items.

Revision triggers include:

- Adjusting classification rules.
- Adjusting target folder / Wiki node structure.
- Changing one or more resources' target paths.
- Excluding resources from movement.
- Restricting execution to high-confidence items.
- Moving a whole category to another target.
- Changing manual confirmation handling.
- Changing source container cleanup or retention handling.

Internal rules:

1. Record the user correction in `last_user_correction`.
2. Mark the previous `plan_items` as stale.
3. Recompute `classification_rules`, `target_tree`, and complete `plan_items` when needed.
4. Increment `plan_version`.
5. Set `active_plan_items` to the complete revised plan.
6. Append a short internal summary to `plan_revision_history`.
7. Do not execute stale `plan_items`.
8. Do not execute only the delta unless the user explicitly asks for partial execution.

User-facing output:

```text
已按你的修改重新生成完整计划。

已应用的修改：
- <correction item 1>
- <correction item 2>

当前完整计划：
- 创建目录 / 节点：<create_count> 项
- 移动资源：<move_count> 项
- 保持不变：<keep_count> 项
- 待人工确认：<review_count> 项

说明：后续执行默认基于这份完整修正版计划，不是只执行刚才的修正项。

你可以选择：
1. 查看修正版计划总览
2. 查看本次修改涉及的资源
3. 进入下一步：确认执行计划
4. 继续调整
```

If the user explicitly asks to execute only the corrected items, ask for confirmation before execution:

```text
你明确要求只执行本次修改涉及的 <count> 项。其余计划项不会执行。
请确认是否只执行这些项？
```

### Plan Detail Page

```text
移动 / 创建计划，第 <page>/<total_pages> 页，每页 20 项

| 序号 | 当前位置 | 标题 | 类型 | 目标位置 | 动作 | 原因 | 置信度 | 待确认原因 |
|------|----------|------|------|----------|------|------|--------|------------|

还有 <remaining_pages> 页未展示。

你可以回复：
1. 继续看下一页
2. 只看待人工确认项
3. 只看低置信度项
4. 进入下一步：确认执行计划
```

## State: EXEC_CONFIRM

Entry: user asks to view execution confirmation or continue toward execution.

MUST:

1. Show write-operation summary:
   - 将创建哪些目录 / 节点
   - 将移动哪些资源
   - 将移动哪些来源目录本体（如有）
   - 哪些资源仍需人工确认
   - 预计影响范围
2. Use `active_plan_items` from the latest complete plan.
3. Show `Permission Inheritance Notice`.
4. Ask for execution scope using `Execution Confirmation`.
5. Reference `Non-goals` for operations excluded from this workflow.
6. Wait for explicit confirmation.

### Permission Inheritance Notice

Before execution confirmation, MUST show this notice:

```text
权限提示：移动资源后，资源权限可能随目标位置变化，可见范围或协作权限可能变化。本 workflow 不会自动修改权限。
```

### Execution Confirmation

When the user wants execution, ask for execution scope:

Execution confirmation options MUST be numbered by currently available choices. Do not show disabled choices, and do not ask the user to reply with skipped numbers.

If a plan detail page is currently active:

```text
请确认执行范围：

1. 执行完整计划：<total_count> 项
2. 只执行当前页：<current_page_count> 项
3. 只执行高置信度项：<high_confidence_count> 项
4. 暂不执行，只保留方案

本 workflow 只执行已确认范围内的创建、移动和必要的单资源权限申请；不会重命名任何资源。
```

If no plan detail page is currently active:

```text
请确认执行范围：

1. 执行完整计划：<total_count> 项
2. 只执行高置信度项：<high_confidence_count> 项
3. 暂不执行，只保留方案

如需只执行某一页，请先查看计划明细页。

本 workflow 只执行已确认范围内的创建、移动和必要的单资源权限申请；不会重命名任何资源。
```

If there is no pagination, still state the total number of plan items covered by confirmation.


<a id="s-ce910315d5c6aab8"></a>

## references/lark-drive-workflow-knowledge-organize-rollback.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流：Rollback

Loaded by states: `ROLLBACK_CONFIRM`, `ROLLBACK`, `ROLLBACK_VERIFY`, `ROLLBACK_CLEANUP_CONFIRM`, `ROLLBACK_CLEANUP`, `ROLLBACK_CLEANUP_VERIFY`.

This file owns recovery plan generation, recovery confirmation, recovery execution, recovery verification, cleanup confirmation, cleanup execution, and cleanup verification. It also defines the internal `rollback_snapshot` and `execution_journal` contracts.

It MUST NOT generate organization plans, revise classification rules, execute unconfirmed deletes, rename resources, modify permissions, or use `wiki +move` docs-to-wiki mode.

User-facing language should use "恢复到整理前的位置" / "恢复". Internal state and field names may use `rollback`.

## Required Context

Before executing rules in this file:

1. `active_plan_items`, `execution_scope`, `target_scope`, and `path_token_map` MUST already exist.
2. `rollback_snapshot` MUST have been built before the first write operation in `EXECUTE`.
3. `execution_journal` MUST contain write-operation results from `EXECUTE`.
4. Follow command syntax and risk behavior from referenced shortcut docs.
5. Follow `Non-goals` from the main workflow entry.

## Normal Path Visibility

Do not mention rollback, recovery readiness, snapshot, or journal on the normal successful execution path.

Load this file only after:

1. Execution failed after one or more successful moves and the user chose to try restoring.
2. Verification found serious mismatches and the user chose to try restoring.
3. The user explicitly asks to rollback / recover the previous organization run.

## Internal State Contracts

### RollbackSnapshot

`rollback_snapshot` records original locations before any write command.

Fields:

| Field | Meaning |
|-------|---------|
| `plan_id` | Matching `PlanItem.plan_id` |
| `source_kind` | `drive` / `wiki` |
| `title` | Resource title |
| `type` | Resource type used by move commands |
| `original_token` | Original Drive token when applicable |
| `original_node_token` | Original Wiki node token when applicable |
| `original_parent_kind` | `drive_folder` / `drive_root` / `wiki_node` / `wiki_space_root` / `unknown` |
| `original_parent_token` | Original parent token; empty for root markers |
| `original_space_id` | Original Wiki space ID when restoring to Wiki space root |
| `original_path` | Original path before organization |
| `planned_target_parent_token` | Planned target parent token |
| `planned_target_path` | Planned target path |
| `rollback_supported` | Whether this item can be restored automatically |
| `rollback_blocker` | Reason when `rollback_supported=false` |

Rules:

1. Store compact fields only. Do not store full API responses.
2. `drive_root` and `wiki_space_root` are valid origins; do not treat empty parent token as missing when the root marker is known.
3. Items without reliable origin can still execute, but MUST be marked `rollback_supported=false`.

### ExecutionJournal

`execution_journal` records every write attempt.

Fields:

| Field | Meaning |
|-------|---------|
| `journal_id` | Stable journal row ID |
| `plan_id` | Matching `PlanItem.plan_id` when applicable |
| `operation` | `create_folder` / `create_node` / `move_drive` / `move_wiki_node` / `delete_created_folder` / `delete_created_node` |
| `status` | `success` / `failed` / `pending` |
| `input_token` | Token supplied to the command |
| `input_node_token` | Wiki node token supplied to the command |
| `input_parent_token` | Source parent token when known |
| `target_parent_token` | Target parent token supplied to the command |
| `returned_token` | Token returned by the command |
| `returned_node_token` | Wiki node token returned by the command |
| `returned_parent_token` | Parent token returned by the command |
| `task_id` | Async task ID when returned |
| `next_command` | Async continuation command when returned |
| `error` | Error summary when failed |
| `created_by_workflow` | Whether the resource was created by this workflow run |
| `rollback_eligible` | Whether this successful operation can be included in `rollback_plan` |

Rules:

1. Append a journal entry immediately after each write attempt.
2. `create_folder` and `create_node` entries MUST set `created_by_workflow=true`.
3. Successful `move_drive` and `move_wiki_node` entries may set `rollback_eligible=true` only when matching snapshot origin is supported.
4. Failed or pending moves MUST NOT enter automatic recovery execution.
5. Async operations are `pending` until `drive +task_result` proves completion.

## State: ROLLBACK_CONFIRM

Entry: user chose to try restoring after execution failure / verification mismatch, or explicitly asked to rollback.

MUST:

1. Generate `rollback_plan` from successful eligible move journal entries.
2. Use `execution_journal` current token / current node token as the recovery source.
3. Use `rollback_snapshot` original origin as the recovery target.
4. Generate recovery items in reverse successful move order.
5. Exclude failed, pending, and unsupported items from executable recovery.
6. Do not include delete actions in `rollback_plan`.
7. Ask for explicit restore execution confirmation.

Confirmation output:

```text
可恢复范围如下：

| 项目 | 数量 |
|------|------|
| 可尝试恢复到原位置 | <recoverable_move_count> |
| 无法安全自动恢复 | <unsupported_count> |
| 未完成 / 等待中的移动 | <pending_count> |
| 本次新建目录 / 节点 | <created_container_count> |

恢复操作只会尝试把已成功移动的资源移回原位置，不会删除、重命名或修改权限。是否执行恢复？
```

If no move can be restored automatically, report that no automatic restore is available and move to `DONE`.

## Recovery Command Rules

Use only these command forms:

```text
# Drive resource back to original parent folder
lark-cli drive +move \
  --file-token <current_token> \
  --type <type> \
  --folder-token <original_parent_token>

# Drive resource back to root
lark-cli drive +move \
  --file-token <current_token> \
  --type <type>

# Wiki node back to original parent node
lark-cli wiki +move \
  --node-token <current_node_token> \
  --target-parent-token <original_parent_token>

# Wiki node back to original space root
lark-cli wiki +move \
  --node-token <current_node_token> \
  --target-space-id <original_space_id>
```

MUST NOT:

- Use `wiki +move` docs-to-wiki mode.
- Move using path strings.
- Recover failed or pending moves as if they succeeded.
- Delete created folders / nodes in `ROLLBACK`.

## State: ROLLBACK

Entry: user explicitly confirmed restore execution.

MUST:

1. Execute only confirmed `rollback_plan` items.
2. Execute reverse moves in reverse successful move order.
3. Continue async move tasks with `drive +task_result` when needed.
4. Record recovery success / failure per rollback item.
5. Stop on blockers that make following recovery items unsafe.

Progress output should stay concise:

```text
恢复进度：已尝试 <done>/<total> 项，失败 <failed_count> 项。
```

## State: ROLLBACK_VERIFY

Entry: recovery execution finished.

MUST:

1. Rescan the relevant Drive folder / Wiki nodes.
2. Compare each rollback item with its original origin.
3. Mark status per item.
4. If cleanup candidates clearly remain from this workflow run, transition to `ROLLBACK_CLEANUP_CONFIRM`.
5. Do not ask for deletion confirmation in this state.

Verification table:

| plan_id | 标题 | 原位置 | 当前实际位置 | 状态 | 失败原因 |
|---------|------|--------|--------------|------|----------|

Status values:

| Status | Meaning |
|--------|---------|
| `rollback_success` | Resource is back under the original parent / root |
| `rollback_failed` | Resource is still outside the original origin |
| `missing` | Resource cannot be found |
| `needs_manual_review` | Actual state is ambiguous or affected by external changes |

Do not delete anything from this state.

## State: ROLLBACK_CLEANUP_CONFIRM

Entry: cleanup candidates exist after recovery, or user asks to view / perform cleanup after recovery.

Cleanup is optional and separate from recovery. It may delete resources, so it requires separate confirmation.

Candidate rules:

1. Candidate MUST have `created_by_workflow=true` in `execution_journal`.
2. Candidate MUST be a Drive folder or Wiki node created by this workflow run.
3. Candidate MUST currently be empty, or contain only workflow-created cleanup candidates that are themselves safe to delete.
4. Candidate MUST NOT contain original resources, unknown resources, rollback-failed resources, or user-created resources.
5. If child origin is uncertain, mark the candidate `cleanup_blocked`.

Generate `rollback_cleanup_plan` with:

| Field | Meaning |
|-------|---------|
| `cleanup_id` | Stable cleanup row ID |
| `type` | `drive_folder` / `wiki_node` |
| `path` | Current path |
| `token` | Folder token or node token |
| `depth` | Current path depth |
| `safe_to_delete` | Whether deletion is allowed after confirmation |
| `blocker` | Reason when deletion is blocked |

Confirmation output:

```text
恢复已完成。本次整理新建的部分空目录 / 节点如下，是否需要删除？

| 项目 | 数量 |
|------|------|
| 可删除的新建空目录 / 节点 | <safe_count> |
| 不可删除，需人工确认 | <blocked_count> |

注：删除只会作用于本次 workflow 新建且当前可安全清理的空目录 / 节点。
```

If the user wants details, paginate cleanup items at 20 rows per page.

## State: ROLLBACK_CLEANUP

Entry: user explicitly confirmed cleanup deletion.

MUST:

1. Delete only `safe_to_delete=true` cleanup items.
2. Delete deepest paths first.
3. Record delete results in `rollback_cleanup_results`.
4. Continue async delete tasks with `drive +task_result` when needed.

Command forms:

```text
# Delete workflow-created Drive folder
lark-cli drive +delete \
  --file-token <folder_token> \
  --type folder \
  --yes

# Delete workflow-created Wiki node
lark-cli wiki +node-delete \
  --node-token <node_token> \
  --obj-type wiki \
  --include-children=true \
  --yes
```

`--yes` is allowed only after the user explicitly confirmed cleanup deletion.

MUST NOT:

- Delete original resources.
- Delete unknown resources.
- Delete rollback-failed resources.
- Delete non-empty folders / nodes that contain anything outside cleanup candidates.
- Delete a knowledge space.

## State: ROLLBACK_CLEANUP_VERIFY

Entry: cleanup deletion finished.

MUST:

1. Verify each confirmed cleanup target is gone.
2. Report failed or pending deletes.
3. Stop after reporting cleanup results.

Verification table:

| 类型 | 路径 | token | 状态 | 失败原因 |
|------|------|-------|------|----------|

Status values:

| Status | Meaning |
|--------|---------|
| `deleted` | Cleanup target was deleted |
| `delete_pending` | Async deletion is still pending |
| `delete_failed` | Delete command failed |
| `still_exists` | Target still exists after deletion attempt |
| `skipped` | Target was not safe to delete or user did not confirm it |


<a id="s-21e19860bee6e319"></a>

## references/lark-drive-workflow-knowledge-organize.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 知识整理工作流

Workflow id: `knowledge_organize`

Risk / Structure: `R2-R3` / `S3`

This file implements the registered knowledge organization workflow. Before execution, the agent MUST read [`lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad) and [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流）, and follow the shared execution protocol, Artifact Contract, Workflow Loading rules, authentication rules, and write confirmation rules.

It defines the workflow-specific state machine and progressive loading map. Stage-specific rules live in phase files and MUST be loaded only when the workflow reaches the corresponding state.

Phase files are references for this workflow, not independent skills. Do not route user requests directly to a phase file.

## Required Context

Before running this workflow, MUST read [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） for identity, authentication, permission handling, and write-operation confirmation rules.

Load other skills / references progressively:

- Wiki / personal library target: [`../../lark-wiki/SKILL.md`](lark-wiki-0.md#s-384c23a567152824)
- Content read required: [`../../lark-doc/SKILL.md`](lark-doc-0.md#s-716f3f9ec728a423) and [`../../lark-doc/references/lark-doc-fetch.md`](lark-doc-0.md#s-a8f2a17fdca55dac)
- Sheet down-drill required: [`../../lark-sheets/SKILL.md`]（按模块名读取对应工作流）
- Base down-drill required: [`../../lark-base/SKILL.md`]（按模块名读取对应工作流）

## Agent Contract

When this workflow is triggered, the agent MUST:

1. Follow the `Execution State Machine` in order.
2. Maintain the fields in `Runtime State`.
3. Before executing a state, read the phase file listed in `Progressive Load Map`.
4. Do not pre-load all phase files. Load only the current state's required phase file unless a transition requires the next state.
5. Stop and wait whenever a state has `wait_for_user=true`.
6. Keep complete internal state even when user-facing output is paginated.
7. Never perform organization write operations before `EXEC_CONFIRM`; never perform recovery or cleanup writes before the corresponding explicit confirmation state.
8. Execute only commands allowed by `Command Map`.
9. Use command syntax, scope requirements, and API parameter rules from referenced skills / shortcut docs.
10. Convert internal enum values to natural-language Chinese labels in user-facing tables.
11. Do not invent recovery behavior; follow the active phase file's failure handling.
12. Maintain internal recovery state during execution, but do not mention recovery on the normal successful path.

## Scope

本 workflow 用于对指定 Drive 文件夹、Wiki 知识库、个人文档库或搜索范围做知识整理。默认只生成可审阅方案；只有用户明确确认执行范围后，才创建目录 / 节点或移动资源。

适用触发语包括：

- "帮我整理我的云盘 / 文档库 / 知识库"
- "帮我盘点这个知识库，给出整理后的目录结构"
- "这个文件夹太乱了，先给我一个整理方案"
- "把知识库里的文档按项目 / 客户 / 时间 / 类型归类"
- "帮我找出未归档、临时、重复、空目录和命名混乱的内容"

## Non-goals

默认不生成：

- 研究报告
- 对比分析
- 风险 / 结论 / 行动项
- 引用来源列表
- 权限治理报告

默认禁止执行：

- 删除原有文件、文件夹、Wiki 节点或知识空间
- owner 转移
- 批量权限申请
- 批量公开权限修改
- 批量协作者权限修改
- 任何资源重命名或标题修改；即使用户要求，也不由本 workflow 执行

仅在 rollback cleanup 阶段，允许删除本次 workflow 新建且当前可安全清理的空 Drive 文件夹或空 Wiki 节点，并且必须用户单独确认。不得删除知识空间。

如果用户明确要求其他非目标能力，必须转入对应专项流程，并单独确认风险。资源重命名 / 标题修改不属于本 workflow 的可执行能力。

## Responsibility Boundary

| File | Owns | Must Not Own |
|------|------|--------------|
| `lark-drive-workflow-knowledge-organize.md` | Workflow trigger, global contract, state machine, progressive load map, command family allowlist | Stage-specific rules, output templates, execution details |
| `lark-drive-workflow-knowledge-organize-discovery.md` | `PARSE_SCOPE`, `INVENTORY`, target parsing, stop conditions, inventory limits, `ResourceItem` | Classification, plan generation, write execution |
| `lark-drive-workflow-knowledge-organize-analysis.md` | `CONTENT_READ`, `ISSUE_ANALYSIS`, `RULE_GENERATION`, low-confidence reads, issue rules, problem pagination, classification, target tree | Plan execution, write confirmation, verification |
| `lark-drive-workflow-knowledge-organize-planning.md` | `PLAN_GENERATION`, `EXEC_CONFIRM`, `PlanItem`, `DisplayItem`, plan pagination, plan revision, execution scope confirmation | Scope parsing, resource inventory, write execution, verification |
| `lark-drive-workflow-knowledge-organize-execution.md` | `EXECUTE`, `VERIFY`, `PathTokenMap`, write execution, progress reporting, verification, next suggestions, internal recovery hooks | Scope parsing, resource inventory, classification, plan generation, plan revision, rollback execution details |
| `lark-drive-workflow-knowledge-organize-rollback.md` | `ROLLBACK_CONFIRM`, `ROLLBACK`, `ROLLBACK_VERIFY`, `ROLLBACK_CLEANUP_CONFIRM`, `ROLLBACK_CLEANUP`, `ROLLBACK_CLEANUP_VERIFY`, recovery plan generation, recovery execution, cleanup verification | Scope parsing, resource inventory, classification, organization plan generation, normal write execution |

## Runtime State

This workflow extends the shared Artifact Contract. Agent MUST maintain these internal fields during one workflow run:

| Field | Meaning |
|-------|---------|
| `current_state` | Current state in `Execution State Machine` |
| `target_scope` | Parsed target: Drive folder, Wiki node, Wiki space, personal doc library, single resource, or search scope |
| `environment_profile` | Current environment and CLI profile, such as prod / BOE / PRE and config profile |
| `identity` | `user` by default unless user explicitly asks for app / bot perspective |
| `resource_items` | Complete normalized resource list from discovery |
| `partial` | Whether inventory or content read cannot fully continue because of auth, permission, API / pagination failure after retries, API coverage limitations, tool budget, or scope blockers; batching checkpoints alone are not partial |
| `inventory_continuation_state` | Structured checkpoint for continuing inventory batches within the confirmed scope. Must preserve `scope`, `queue`, `current_cursor`, `visited_page_keys`, `dedupe_keys`, and `blockers`; Drive queue entries carry `folder_token`, `path`, `depth`, and `page_token`; Wiki queue entries carry `space_id` / `node_token`, `path`, `depth`, and pagination cursor; search entries carry query / filters and pagination cursor. Missing or corrupt state is a blocker, not a completed inventory. |
| `low_confidence_items` | Items requiring mandatory partial content read |
| `issue_summary` | Problem types, counts, evidence paths, and suggested handling |
| `classification_rules` | Rules used to map resources to target paths |
| `target_tree` | Proposed target folder / Wiki node tree |
| `source_container_disposition` | Reused / retired source folders or nodes and their intended handling |
| `plan_items` | Complete internal execution plan |
| `plan_version` | Internal version of the current complete plan, such as `v1` / `v2` |
| `active_plan_items` | Latest complete valid plan used for execution confirmation |
| `plan_revision_history` | Internal summaries of user-requested plan revisions |
| `last_user_correction` | Most recent user correction that changed classification, target tree, or plan scope |
| `display_page_state` | Current page, page size, filters, and total count for user-facing pagination |
| `path_token_map` | Mapping from target path to real `folder_token` / `node_token` |
| `execution_scope` | Full plan, current page, filtered subset, or no execution |
| `verification_results` | Per-plan-item verification result after execution |
| `rollback_snapshot` | Internal pre-write snapshot used only for recovery after failure or user-requested restore |
| `execution_journal` | Internal write-operation journal used only for recovery after failure or user-requested restore |
| `rollback_plan` | Internal recovery plan generated only after user asks to restore |
| `rollback_verification_results` | Per-item recovery verification result |
| `rollback_cleanup_plan` | Optional cleanup plan for workflow-created empty folders / nodes after recovery |
| `rollback_cleanup_results` | Cleanup verification result |

## Execution State Machine

| State | Protocol Step | Entry Condition | Agent MUST Do | User-Facing Output | wait_for_user | Next State |
|-------|---------------|-----------------|---------------|--------------------|---------------|------------|
| `PARSE_SCOPE` | `route` / `scope` | Workflow triggered | Load discovery phase; parse target, environment, identity, and target type | Scope confirmation or clarification question | `true` | `INVENTORY` |
| `INVENTORY` | `read` | Scope confirmed | Load discovery phase; recursively list resources and build `resource_items` | Inventory progress / summary; continue automatically unless blocked | `false` unless blocked | `CONTENT_READ` |
| `CONTENT_READ` | `read` | Inventory complete | Load analysis phase; identify low-confidence items and perform mandatory partial read when needed | Low-confidence read summary | `false` unless auth / permission blocks | `ISSUE_ANALYSIS` |
| `ISSUE_ANALYSIS` | `assess` / `plan` | Resource list and partial reads ready | Load analysis phase; detect structure problems, evidence, and organization approach | Inventory result, problems, organization approach, and decision options | `true` | `RULE_GENERATION` |
| `RULE_GENERATION` | `assess` / `plan` | User confirms organization approach | Load analysis phase; generate classification rules and `target_tree` | No separate stop; target tree is shown with plan generation | `false` | `PLAN_GENERATION` |
| `PLAN_GENERATION` | `assess` / `plan` | Target tree ready | Load planning phase; generate complete internal `plan_items`; show target tree plus plan overview or page | Target tree and plan overview / paginated plan page | `true` | `EXEC_CONFIRM` |
| `EXEC_CONFIRM` | `confirm` | User wants execution | Load planning phase; ask user to choose execution scope | Execution options and write-operation summary | `true` | `EXECUTE` or `DONE` |
| `EXECUTE` | `execute` | User explicitly confirmed execution scope | Load execution phase; execute only whitelisted write operations for confirmed scope while maintaining internal recovery state | Progress reports for large or long-running execution; if blocked after successful moves, ask whether to try restoring to `整理前的位置` | `false` unless blocked / recovery offered | `VERIFY`, `ROLLBACK_CONFIRM`, or `DONE` |
| `VERIFY` | `verify` | Execution finished | Load execution phase; rescan target scope and compare actual path/token against plan | Verification table and final summary; if serious mismatches exist, ask whether to try restoring to `整理前的位置` | `false` unless recovery offered | `DONE` or `ROLLBACK_CONFIRM` |
| `ROLLBACK_CONFIRM` | `recovery confirm` | User asks to restore after execution failure / verification mismatch / explicit rollback request | Load rollback phase; generate internal `rollback_plan`; ask whether to execute recovery | Recoverable scope and restore confirmation | `true` | `ROLLBACK` or `DONE` |
| `ROLLBACK` | `recovery execute` | User explicitly confirms restore execution | Load rollback phase; execute confirmed reverse moves only | Recovery progress / result | `false` | `ROLLBACK_VERIFY` |
| `ROLLBACK_VERIFY` | `recovery verify` | Recovery execution finished | Load rollback phase; verify restored locations and decide whether cleanup candidates exist | Recovery verification result | `false` | `ROLLBACK_CLEANUP_CONFIRM` or `DONE` |
| `ROLLBACK_CLEANUP_CONFIRM` | `cleanup confirm` | Cleanup candidates exist after recovery, or user asks to clean workflow-created empty folders / nodes | Load rollback phase; generate cleanup plan and ask for delete confirmation | Cleanup candidates and delete confirmation | `true` | `ROLLBACK_CLEANUP` or `DONE` |
| `ROLLBACK_CLEANUP` | `cleanup execute` | User explicitly confirms cleanup deletion | Load rollback phase; delete only confirmed workflow-created safe-empty folders / nodes | Cleanup progress / result | `false` | `ROLLBACK_CLEANUP_VERIFY` |
| `ROLLBACK_CLEANUP_VERIFY` | `cleanup verify` | Cleanup deletion finished | Load rollback phase; verify deleted cleanup targets | Cleanup verification result | `false` | `DONE` |
| `DONE` | `done` | No more action | Stop | Final answer | `false` | End |

## Progressive Load Map

Agent MUST read the phase file for the active state before executing that state.

| State | Required Phase File |
|-------|---------------------|
| `PARSE_SCOPE` | [`lark-drive-workflow-knowledge-organize-discovery.md`](lark-drive-0.md#s-9b1c8524f8f6530e) |
| `INVENTORY` | [`lark-drive-workflow-knowledge-organize-discovery.md`](lark-drive-0.md#s-9b1c8524f8f6530e) |
| `CONTENT_READ` | [`lark-drive-workflow-knowledge-organize-analysis.md`](lark-drive-0.md#s-99611fd285084ffc) |
| `ISSUE_ANALYSIS` | [`lark-drive-workflow-knowledge-organize-analysis.md`](lark-drive-0.md#s-99611fd285084ffc) |
| `RULE_GENERATION` | [`lark-drive-workflow-knowledge-organize-analysis.md`](lark-drive-0.md#s-99611fd285084ffc) |
| `PLAN_GENERATION` | [`lark-drive-workflow-knowledge-organize-planning.md`](lark-drive-0.md#s-ab4a6ec356c2f26a) |
| `EXEC_CONFIRM` | [`lark-drive-workflow-knowledge-organize-planning.md`](lark-drive-0.md#s-ab4a6ec356c2f26a) |
| `EXECUTE` | [`lark-drive-workflow-knowledge-organize-execution.md`](lark-drive-0.md#s-414852b02798d96c) |
| `VERIFY` | [`lark-drive-workflow-knowledge-organize-execution.md`](lark-drive-0.md#s-414852b02798d96c) |
| `ROLLBACK_CONFIRM` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |
| `ROLLBACK` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |
| `ROLLBACK_VERIFY` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |
| `ROLLBACK_CLEANUP_CONFIRM` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |
| `ROLLBACK_CLEANUP` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |
| `ROLLBACK_CLEANUP_VERIFY` | [`lark-drive-workflow-knowledge-organize-rollback.md`](lark-drive-0.md#s-ce910315d5c6aab8) |

## Command Map

Use only command families allowed for the current state. Detailed syntax belongs to referenced skills / shortcut docs.

| State | Allowed Command Families | Purpose |
|-------|--------------------------|---------|
| `PARSE_SCOPE` | `drive +inspect`, `wiki +node-get`, `wiki +space-list`, `wiki spaces get`, `drive +search` | Resolve target scope |
| `INVENTORY` | `wiki +node-list`, `drive files list` (schema path: `drive.files.list`), `drive metas batch_query` | Recursively list and enrich resources |
| `CONTENT_READ` | `docs +fetch`, plus `lark-sheets` / `lark-base` when conditionally required | Partial content read for low-confidence items |
| `ISSUE_ANALYSIS` | No write commands | Analyze `resource_items` only |
| `RULE_GENERATION` | No write commands | Generate classification rules and target tree |
| `PLAN_GENERATION` | No write commands | Generate internal plan and user-facing pages |
| `EXEC_CONFIRM` | No write commands | Ask user to confirm execution scope |
| `EXECUTE` | `drive +create-folder`, `drive +move`, `wiki +node-create`, `wiki +move` existing-node mode only, `drive +task_result`, `drive +apply-permission` only when explicitly confirmed | Execute whitelisted writes |
| `VERIFY` | `wiki +node-list`, `drive files list` (schema path: `drive.files.list`), `drive +task_result` if async result remains pending | Verify actual result |
| `ROLLBACK_CONFIRM` | No write commands | Generate internal recovery plan and ask for restore confirmation |
| `ROLLBACK` | `drive +move`, `wiki +move` existing-node mode only, `drive +task_result` | Execute confirmed reverse moves |
| `ROLLBACK_VERIFY` | `wiki +node-list`, `drive files list` (schema path: `drive.files.list`), `drive +task_result` if async result remains pending | Verify recovery result |
| `ROLLBACK_CLEANUP_CONFIRM` | No write commands | Generate cleanup plan and ask for delete confirmation |
| `ROLLBACK_CLEANUP` | `drive +delete`, `wiki +node-delete`, `drive +task_result` | Delete only confirmed workflow-created safe-empty folders / nodes |
| `ROLLBACK_CLEANUP_VERIFY` | `wiki +node-list`, `drive files list` (schema path: `drive.files.list`), `drive +task_result` if async result remains pending | Verify cleanup deletion result |

## Wiki Move Mode Constraint

This workflow MUST NOT use `wiki +move` docs-to-wiki mode. Wiki moves MUST use existing Wiki node mode with `--node-token` only.

## Permission Request Gate

`drive +apply-permission` is a write operation and may notify the resource owner. If any state hits resource access denial:

1. Stop the current state.
2. Show the single target resource, requested permission, reason / remark, and owner-notification implication when known.
3. Ask the user to confirm this single permission request.
4. Only after explicit confirmation, treat the permission request as a confirmed `EXECUTE` operation.
5. After the request is submitted or skipped, return to the blocked state only when the user asks to continue.

Never request permission automatically, never batch permission requests, and never hide the owner-notification implication.

## Transition Rules

1. If `PARSE_SCOPE` cannot determine the target range, ask only for target range clarification and stop.
2. If auth or API scope is missing, follow `lark-shared` permission handling and stop.
3. If resource access permission is missing, follow `Permission Request Gate`.
4. If the user asks to inspect more pages, stay in `PLAN_GENERATION` and update `display_page_state`.
5. If the user declines execution in `EXEC_CONFIRM`, output the saved plan summary and move to `DONE`.
6. If execution fails for an item, record the failure and continue only when the failed item is independent; otherwise stop, report the blocker, and ask whether the user wants to try restoring to `整理前的位置` when any move already succeeded.
7. Do not load the rollback phase merely because a snapshot or journal exists. Load it only after execution failure, serious verification mismatch, or explicit user rollback request, and only after the user chooses to try restore.

## References

- [Discovery phase](lark-drive-0.md#s-9b1c8524f8f6530e)
- [Analysis phase](lark-drive-0.md#s-99611fd285084ffc)
- [Planning phase](lark-drive-0.md#s-ab4a6ec356c2f26a)
- [Execution phase](lark-drive-0.md#s-414852b02798d96c)
- [Rollback phase](lark-drive-0.md#s-ce910315d5c6aab8)
- [lark-shared]（按模块名读取对应工作流）
- [lark-drive](lark-drive-0.md#s-c99c77320f67806c)
- [lark-drive-files-list](lark-drive-0.md#s-1efd212989674e97)
- [lark-drive-search](lark-drive-0.md#s-cd3b5c8a483e06d9)
- [lark-drive-inspect](lark-drive-0.md#s-7e20781df311b587)
- [lark-drive-apply-permission](lark-drive-0.md#s-877958c402ff06d0)
- [lark-drive-task-result](lark-drive-0.md#s-27c169d1426c6d1e)
- [lark-drive-delete](lark-drive-0.md#s-0dd3b34e8e162f23)
- [lark-wiki](lark-wiki-0.md#s-384c23a567152824)
- [lark-wiki-node-delete](lark-wiki-0.md#s-b9e78f1d6ed0d089)
- [lark-doc](lark-doc-0.md#s-716f3f9ec728a423)
- [lark-doc-fetch](lark-doc-0.md#s-a8f2a17fdca55dac)
- [lark-sheets]（按模块名读取对应工作流）
- [lark-base]（按模块名读取对应工作流）


<a id="s-1a80225bd1e462b4"></a>

## references/lark-drive-workflow-permission-governance-commands.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 权限治理 Command Patterns

本文只提供 `permission_governance` workflow 的具体 `lark-cli` 命令样例。只有进入对应 state 且需要拼装命令时才读取本文；命令可用范围仍以 [`lark-drive-workflow-permission-governance.md`](lark-drive-0.md#s-15bd7bdf6ce4606c) 的 `Command Map` 为准。

## 目录

- `目标解析`
- `目标发现`
- `事实读取`
- `写前确认与执行`

## 目标解析

```text
lark-cli drive +inspect --url '<url>' --as user --format json
```

`drive +inspect` 支持 Drive folder，并且是受支持 Drive URL 的统一解析入口。对文件夹自身权限设置，先通过 `+inspect` 解析 URL，或直接使用 `drive +permission-get-setting --token '<folder_url>'`；传 bare folder token 时必须显式传 `--type folder`。

`/wiki/space/<space_id>` URL 是 Wiki space 范围，不要用 `drive +inspect` 当作单文档解析；直接提取 `space_id` 后进入 `DISCOVER_TARGETS`。

## 目标发现

发现 Wiki space / node 下目标：

```text
lark-cli wiki +node-list \
  --space-id '<space_id>' --page-size 50 \
  --page-all --page-limit 0 \
  --as user --format json # replace $SPACE_ID before running

lark-cli wiki +node-list \
  --space-id '<space_id>' --parent-node-token '<node_token>' --page-size 50 \
  --page-all --page-limit 0 \
  --as user --format json # replace $SPACE_ID before running

lark-cli wiki +node-list \
  --space-id '<space_id>' --page-token '<PAGE_TOKEN>' --page-size 50 \
  --as user --format json # replace $SPACE_ID before running
```

解析返回时使用 `data.nodes`，不要读取顶层 `items`。`--page-limit 0` 表示当前层分页不设页数上限；`--page-all` 只覆盖当前 `space-id` / `parent-node-token` 范围内的分页，不会递归子节点。节点 `has_child=true` 时，必须继续以该节点的 `node_token` 作为 `--parent-node-token` 递归读取。

发现 Drive folder 下目标：

```text
lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","page_size":200}' \
  --as user --format json

lark-cli drive files list \
  --params '{"folder_token":"<folder_token>","page_size":200,"page_token":"<PAGE_TOKEN>"}' \
  --as user --format json
```

## 事实读取

读取 metadata：

```text
lark-cli drive metas batch_query \
  --data '{"request_docs":[{"doc_token":"<token>","doc_type":"<type>"}],"with_url":true}' \
  --as user --format json
```

读取权限设置：

```text
lark-cli drive +permission-get-setting \
  --token '<url-or-token>' --type '<type>' \
  --as user --format json
```

裸 folder token 必须显式传 `--type folder`：

```text
lark-cli drive +permission-get-setting \
  --token '<folder_token>' --type folder \
  --as user --format json
```

通过 URL 读取权限设置时可以省略 `--type`：

```text
lark-cli drive +permission-get-setting \
  --token '<url>' \
  --as user --format json # replace $LARK_DRIVE_URL before running
```

按需读取直接协作者/授权成员列表：

```text
lark-cli drive +member-list \
  --token '<token_or_url>' \
  --type '<type>' \
  --fields 'name,type,external_label' \
  --as user --format json
```

`--fields` 默认不传；只有需要名称、协作者类型、头像或外部标签时才显式传。它只声明期望返回的字段，不授予字段级权限：请求用户的 `name` / `avatar` 时还需 `contact:user.base:readonly`（“获取用户基本信息”）。字段权限或数据可见性不足时，接口仍可能成功但省略相应字段；缺字段不能解释为空值。

按需读取访问统计：

```text
lark-cli drive file.statistics get \
  --params '{"file_token":"<token>","file_type":"<type>"}' \
  --as user --format json
```

按需读取最近访问记录：

```text
lark-cli drive file.view_records list \
  --params '{"file_token":"<token>","file_type":"<type>","page_size":50}' \
  --as user --format json
```

## 写前确认与执行

patch 前检查 manage-public permission：

```text
lark-cli drive permission.members auth \
  --params '{"token":"<token>","type":"<type>","action":"manage_public"}' \
  --as user --format json
```

patch 前读取当前 schema：

```text
lark-cli schema drive.permission.public.patch --format json
```

只 patch 当前 schema 支持的字段；对 Wiki 目标，必须省略 schema 明确标注为 Wiki 不支持的字段。

显式确认后 patch public permission：

```text
lark-cli drive permission.public patch \
  --params '{"token":"<token>","type":"<type>"}' \
  --data '{"link_share_entity":"closed","external_access":false}' \
  --as user --yes --format json
```

显式确认后申请访问权限：

```text
lark-cli drive +apply-permission \
  --token '<url>' \
  --perm view --remark '<reason>' --as user --format json

lark-cli drive +apply-permission \
  --token '<bare-token>' --type '<type>' \
  --perm view --remark '<reason>' --as user --format json
```

owner 转移前读取当前 schema：

```text
lark-cli schema drive.permission.members.transfer_owner --format json
```

显式确认后转移 owner：

```text
lark-cli drive permission.members transfer_owner \
  --params '{"token":"<token>","type":"<type>","need_notification":true,"remove_old_owner":false,"old_owner_perm":"full_access","stay_put":true}' \
  --data '{"member_id":"<new_owner_open_id>","member_type":"openid"}' \
  --as user --yes --format json
```

`member_type` 只能使用当前 schema 支持的值：`email`、`openid`、`userid`、`appid`。如果用户只给姓名，必须先解析为明确身份或要求用户补充；不要猜测 `member_id`。批量 owner 转移必须逐个目标顺序执行。

secure label 写前枚举可用标签：

```text
lark-cli drive +secure-label-list \
  --page-size 10 --lang zh \
  --as user --format json

lark-cli drive +secure-label-list \
  --page-size 10 --page-token '<PAGE_TOKEN>' --lang zh \
  --as user --format json
```

当用户给出的是标签名称、密级文案或不确定的 label ID 时，必须先枚举并解析为 `label-id`；写入确认里展示目标标签名称和 ID。找不到唯一标签时，停止并让用户选择，不要猜测。

显式确认后更新 secure label：

```text
lark-cli drive +secure-label-update \
  --token '<url>' \
  --label-id '<label-id>' --as user --format json # replace $LABEL_ID before running

lark-cli drive +secure-label-update \
  --token '<bare-token>' --type '<type>' \
  --label-id '<label-id>' --as user --format json # replace $LABEL_ID before running
```


<a id="s-96e5796aeec6819a"></a>

## references/lark-drive-workflow-permission-governance-outputs.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 权限治理输出模板

本文只提供 `permission_governance` workflow 的用户可见输出模板。默认先给简短摘要；只有用户要求完整表格、需要写入确认，或结果大到需要结构化展示时才读取本文。

## 目录

- `输出策略`
- `Semantic Rendering`
- `定位与治理动作`
- `单目标公开性判断`
- `多目标明确列表诊断`
- `审计摘要`
- `容器安全诊断报告摘要`
- `可操作风险清单`
- `治理选择交互`
- `权限设置清单`
- `访问复核清单`
- `整改 dry-run`
- `批量权限申请确认`
- `owner 转移确认`
- `确认请求`
- `最终摘要`

## 输出策略

- 单目标默认输出审计摘要。
- 多目标明确列表默认输出逐目标诊断摘要；不要因为目标数大于 1 就套用容器递归发现报告。
- 用户可见结论默认跟随用户当前语言。用户用中文提问时输出中文，用户用英文提问时输出英文；混合语言时跟随主要语言。
- 单目标公开性判断默认输出业务表达，不直接展示 `link_share_entity`、`external_access_entity`、`external_access` 等底层字段名；只有用户要求 raw evidence、排障，或完整清单 / artifact 场景才展示底层字段。
- 中文用户可见输出中，`permission_public` / `public permission` 默认译为“目标公共访问和协作权限设置”；可在摘要里简称“公共访问与协作设置”。优先按实际返回字段解释公开访问、分享、协作者管理、安全与评论设置；复制内容、创建副本、打印、下载等字段只有在当前 CLI schema 和实际响应返回时才可判断。只有命令名、schema 字段、raw evidence、排障信息和完整 artifact 字段名保留英文原文。
- 容器目标默认输出安全诊断报告摘要：一句话结论、覆盖情况、风险分级、优先处理对象、建议下一步和剩余限制。
- 容器目标不要把风险按数量机械排序；外部公开、允许对外分享、缺失密级标签优先于复制 / 下载 / 评论这类依赖策略的候选项。
- 用户没有提供明确 policy 时，使用“候选风险 / 待复核 / 待策略确认”，不要写“违规 / 已泄露 / 已外部访问”。
- 容器安全诊断里不要把 `external_access=true` / `external_access_entity=open` 简写成“高风险”或“外部泄露”；用户可见说法应为“允许对外分享，需 owner 复核；这不等于已经存在外部协作者”。
- 风险对象展示按规模渐进披露：1-10 个全部展示；11-30 个展示全部高优先级待复核对象，中 / 低优先级只做分组摘要；31-100 个按高优先级待复核分组展示 Top 5 和数量；100+ 个只展示分组统计和 Top 样例。
- 当摘要未展示全部风险对象时，必须明确“完整清单包含 <count> 条”，并提供生成 Markdown / CSV / 飞书文档风险清单或整改 dry-run 的下一步。
- 只要发现需要处理的对象，最终回复必须给出可执行下一步 CTA。不能因为默认只读，就只报告风险后结束。
- 完整风险清单是后续治理选择的输入；Markdown / CSV / 飞书文档报告必须使用同一套字段和稳定 `risk_id`。
- 写入前必须使用确认模板；权限申请、目标公共访问和协作权限设置修改、owner 转移、密级标签更新分别确认。
- 最终回复必须包含已完成事项、验证结果和剩余限制；异步权限申请审批不能表述为已完成授权。

## Semantic Rendering

面向用户的主结论优先渲染 `per_target_permission_assessment` 中的语义状态，并使用用户当前语言；底层字段名只在 raw evidence、排障或完整清单中保留。下表给出字段值到业务表达的标准映射；其他语言应表达同等业务含义。

字段来源边界：下表同时覆盖官方 OpenAPI 语义和当前 / 未来 CLI schema。只有实际响应或当前 schema 返回的字段和值，才可渲染为确定状态；当前 installed CLI 未返回的字段（例如 `copy_entity`、`manage_collaborator_entity`、`external_access_entity`）或未出现的枚举值，只能在 raw response / schema 实际出现时使用，缺失时必须按 unknown / unsupported 处理，不要臆造。

| Raw field / value | Semantic State | 中文说法 | English phrasing |
|-------------------|----------------|----------|------------------|
| `link_share_entity=anyone_readable` | `link_access=public_readable` | 互联网上获得链接的任何人可阅读 | Anyone on the internet with the link can read |
| `link_share_entity=anyone_editable` | `link_access=public_editable` | 互联网上获得链接的任何人可编辑 | Anyone on the internet with the link can edit |
| `link_share_entity=partner_tenant_readable` | `link_access=partner_readable` | 关联组织内知道链接可读 | People in partner tenants with the link can read |
| `link_share_entity=partner_tenant_editable` | `link_access=partner_editable` | 关联组织内知道链接可编辑 | People in partner tenants with the link can edit |
| `link_share_entity=tenant_readable` | `link_access=tenant_readable` | 公司内知道链接可读 | People in the tenant with the link can read |
| `link_share_entity=tenant_editable` | `link_access=tenant_editable` | 公司内知道链接可编辑 | People in the tenant with the link can edit |
| link sharing empty / disabled | `link_access=closed` | 未开启链接分享 | Link sharing is disabled |
| `external_access_entity=open` or `external_access=true` | `external_sharing=open` | 允许分享到组织外；不等于已经存在外部协作者 | External sharing is open; this does not mean external collaborators already exist |
| `external_access_entity=allow_share_partner_tenant` | `external_sharing=partner_only` | 仅允许分享到关联组织 | Sharing is allowed only with partner tenants |
| `external_access_entity=closed` or `external_access=false` | `external_sharing=closed` | 当前不允许分享到组织外 | External sharing is disabled |
| `invite_external=true` | `external_invitation=enabled` | 当前允许邀请外部用户 | Inviting external users is enabled |
| `invite_external=false` | `external_invitation=disabled` | 当前不允许邀请外部用户 | Inviting external users is disabled |
| `share_entity=anyone` | `collaborator_org_scope=all_viewers_or_editors` | 所有可阅读或可编辑者可查看、添加、移除协作者 | All viewers or editors can view, add, and remove collaborators |
| `share_entity=same_tenant` | `collaborator_org_scope=tenant_viewers_or_editors` | 组织内可阅读或可编辑者可查看、添加、移除协作者 | Tenant viewers or editors can view, add, and remove collaborators |
| `manage_collaborator_entity=collaborator_can_view` | `collaborator_permission_scope=viewer` | 拥有可阅读权限的协作者可查看、添加、移除协作者 | Collaborators with view permission can view, add, and remove collaborators |
| `manage_collaborator_entity=collaborator_can_edit` | `collaborator_permission_scope=editor` | 拥有可编辑权限的协作者可查看、添加、移除协作者 | Collaborators with edit permission can view, add, and remove collaborators |
| `manage_collaborator_entity=collaborator_full_access` | `collaborator_permission_scope=full_access` | 拥有可管理权限的协作者可查看、添加、移除协作者 | Collaborators with full-access permission can view, add, and remove collaborators |
| `copy_entity=anyone_can_view` | `copy_scope=viewer` | 拥有可阅读权限的用户可复制内容 | Users with view permission can copy content |
| `copy_entity=anyone_can_edit` | `copy_scope=editor` | 拥有可编辑权限的用户可复制内容 | Users with edit permission can copy content |
| `copy_entity=only_full_access` | `copy_scope=full_access` | 仅拥有可管理权限的协作者可复制内容 | Only collaborators with full-access permission can copy content |
| `security_entity=anyone_can_view` | `security_scope=viewer` | 拥有可阅读权限的用户可创建副本、打印、下载 | Users with view permission can create copies, print, and download |
| `security_entity=anyone_can_edit` | `security_scope=editor` | 拥有可编辑权限的用户可创建副本、打印、下载 | Users with edit permission can create copies, print, and download |
| `security_entity=only_full_access` | `security_scope=full_access` | 仅拥有可管理权限的用户可创建副本、打印、下载 | Only users with full-access permission can create copies, print, and download |
| `comment_entity=anyone_can_view` | `comment_scope=viewer` | 拥有可阅读权限的用户可评论 | Users with view permission can comment |
| `comment_entity=anyone_can_edit` | `comment_scope=editor` | 拥有可编辑权限的用户可评论 | Users with edit permission can comment |
| `lock_switch=true` | `lock_state=locked_not_inheriting` | 已限制权限，不再继承父级页面权限 | The node is locked and no longer inherits parent-page permissions |
| `lock_switch=false` | `lock_state=not_locked_or_inheriting` | 未限制权限，可能继承父级页面权限 | The node is not locked and may inherit parent-page permissions |
| field absent / unsupported | `<state>=unknown` | 当前 schema 未返回，无法判断 | The current schema did not return this field, so it is unknown |
| `check_scope=current_public_permission_only` | `check_scope=current_public_permission_only` | 本次判断的是当前目标公共访问和协作权限设置，不是协作者名单或历史权限变更审计 | This check covers the target's current public access and collaboration settings, not collaborator-list or historical permission-change auditing |
| `sec_label_name` missing | `sec_label=missing` | 缺少密级标签 | Security label is missing |

## 定位与治理动作

风险对象必须能让用户直接定位和处理：

- 摘要中的每个优先处理对象必须包含 `risk_id`、`path/title`、`URL`、`type`、owner、sec_label、风险原因、关键证据和建议动作。
- 完整清单、访问复核清单、整改 dry-run 和写入确认都必须包含 URL。缺少 URL 时，展示 token / node_token，并说明 URL 未能获取。
- 同名文档、shortcut 或副本必须用 path + URL 区分；不要只输出 title。
- 完整风险清单中的每条记录必须有稳定 `risk_id`，格式为 `PG-001`、`PG-002`。`risk_id` 在同一次诊断和后续 dry-run / 确认 / 验证中保持不变。
- 即使摘要只展示 Top 样例，也必须给样例分配稳定 `risk_id`；不能输出无法选择的标题列表。
- 建议动作必须和风险类型绑定：互联网公开链接优先建议关闭链接分享或收紧为组织内；允许对外分享优先建议 owner 复核或关闭对外分享；缺少密级标签优先建议补齐密级；复制 / 下载 / 评论范围只在用户 policy 明确时建议收紧。
- 写入动作只能作为下一步选项或确认请求出现。不要在诊断摘要里暗示已经执行缩权。

## 单目标公开性判断

当 `intent=public_exposure_check` 且 `target_scope=single_resource` 时，使用此模板。默认渲染 `target_count=1` 的 `per_target_permission_assessment`，跟随用户当前语言，不直接展示底层字段名；用户要求 raw evidence 时，再追加字段证据。

中文模板：

```text
结论：<不是对外公开 / 存在互联网公开链接 / 允许对外分享>。

目标：<title>
URL：<url-or-token-if-url-unavailable>
类型：<type>

当前链接访问范围：<render link_access>
对外分享：<render external_sharing>
外部邀请：<render external_invitation or omit if unknown because field is absent>
协作者管理（组织维度）：<render collaborator_org_scope>
协作者管理（权限维度）：<render collaborator_permission_scope or omit if unknown because field is absent>
复制内容：<render copy_scope or omit if unknown because field is absent>
创建副本 / 打印 / 下载：<render security_scope>
评论：<render comment_scope>
Wiki 继承限制：<render lock_state or omit if unknown because field is absent>

检查边界：<render check_scope>
```

English template:

```text
Conclusion: <Not publicly accessible on the internet / A public internet link is enabled / External sharing is enabled>.

Target: <title>
URL: <url-or-token-if-url-unavailable>
Type: <type>

Current link access: <render link_access>
External sharing: <render external_sharing>
External invitations: <render external_invitation or omit if unknown because field is absent>
Collaborator management by tenant: <render collaborator_org_scope>
Collaborator management by permission: <render collaborator_permission_scope or omit if unknown because field is absent>
Copy content: <render copy_scope or omit if unknown because field is absent>
Create copies / print / download: <render security_scope>
Comments: <render comment_scope>
Wiki inheritance lock: <render lock_state or omit if unknown because field is absent>

Check boundary: <render check_scope>
```

Raw evidence, only when requested:

```text
Evidence fields:
- link_share_entity=<value>
- external_access_entity=<value>
- external_access=<value>
- invite_external=<value>
- share_entity=<value>
- manage_collaborator_entity=<value>
- copy_entity=<value>
- security_entity=<value>
- comment_entity=<value>
- lock_switch=<value>
```

## 多目标明确列表诊断

当 `target_scope=explicit_list` 时，使用此模板。该场景不执行容器递归发现；对用户提供的每个 URL / token 逐个生成 `per_target_permission_assessment`，再按风险分组聚合。权限语义和单目标、容器诊断完全复用，不新增判断模型。

```text
已完成只读权限诊断，没有做任何权限修改。

一句话结论：<N> 个目标中，<risk_count> 个存在待复核权限风险；<internet_public_count> 个存在互联网公开链接候选，<external_access_count> 个允许对外分享，<unknown_count> 个无法完整判断。

覆盖情况：
- 用户提供目标：<input_target_count>；成功解析：<resolved_count>
- 成功读取目标公共访问和协作权限设置：<permission_checked_count>；读取失败 / 不支持 / 无权限：<failed_or_unsupported_count>

逐目标结果（1-10 个目标默认全部展示；超过 10 个时按 `摘要清单展开规则` 展示，并提示生成完整风险清单）：

- <risk_id-or-item_id> <path-or-title> (<type>)
  URL: <url-or-token-if-url-unavailable>
  结论：<not_public / public_link_enabled / external_sharing_enabled / policy_review / unknown>
  关键权限：<render link_access>; <render external_sharing>; <render security_scope>; <render comment_scope>
  密级：<sec_label_name-or-missing-or-unknown>
  待复核原因：<risk reason or none>
  建议动作：<recommended action or no action>

分组摘要：
- 互联网公开链接候选：<count>；允许对外分享：<count>；公司内链接可访问 / 可编辑：<count>
- 复制 / 下载 / 打印 / 评论待策略确认：<count>；无法判断：<count and reason summary>

建议下一步：
- 处理明确的 <risk_id>，先生成只读 dry-run。
- 生成完整风险清单 artifact，后续可按 `risk_id`、风险分组、URL 或 `selected=true` 选择治理范围；只看权限设置时改用 `权限设置清单`。
```

## 摘要清单展开规则

容器安全诊断的摘要必须兼顾可读性和可治理性。不要用固定 Top N 代替可处理清单。

| 风险对象数 | 摘要默认展示 | 必须提供的下一步 |
|------------|--------------|------------------|
| `0` | 只展示覆盖情况、未覆盖能力和剩余限制 | 如需更细审计，可生成权限设置清单 |
| `1-10` | 展示全部风险对象 | 可直接按 `risk_id` 生成 dry-run 或写入确认 |
| `11-30` | 展示全部高优先级待复核对象；中 / 低优先级做分组摘要 | 生成完整风险清单 artifact，或按风险分组生成 dry-run |
| `31-100` | 每个高优先级待复核分组展示 Top 5，附未展示数量 | 生成 Markdown / CSV / 飞书文档完整风险清单 |
| `100+` | 只展示分组统计、Top 样例和覆盖限制，不内联长表 | 强烈建议生成结构化风险清单后再选择治理范围 |

高优先级待复核对象包括：互联网公开链接、允许对外分享、允许对外分享且缺少 / 低于 policy 密级标签、公司内可编辑链接。协作者管理范围较宽默认归入中优先级待复核；只有用户 policy 明确要求严格协作者管理时才提升优先级。复制 / 下载 / 打印、评论范围在用户未提供明确 policy 时归入“待策略确认”，不要挤占高优先级清单。

摘要中的每个待复核对象必须包含 `risk_id`、path/title、URL、type、owner、sec_label、风险原因、关键证据和建议动作。对同一底层文档的多个 Wiki 入口或 shortcut，必须用 URL 区分；如果建议合并治理，在建议动作里说明它们指向同一底层对象。

## 审计摘要

```text
目标：<title> (<type>)
URL：<url-or-token-if-url-unavailable>
结论：<合规 / 待确认风险 / 无法完整判断>
证据：
- link_share_entity=<value>
- external_access_entity=<value>
- external_access=<value>
- invite_external=<value>
- share_entity=<value>
- manage_collaborator_entity=<value>
- copy_entity=<value>
- security_entity=<value>
- comment_entity=<value>
- lock_switch=<value>
- sec_label_name=<value-or-missing>
限制：<unsupported_checks or none>
建议动作：<read-only next step or proposed remediation>
```

## 容器安全诊断报告摘要

```text
已完成只读安全诊断，没有做任何权限修改。

一句话结论：<未发现互联网公开链接 / 存在互联网公开链接候选风险>；<external_access_count> 个文档允许对外分享，<missing_label_count> 个文档缺少密级标签。建议优先复核 <top_priority_group_or_paths>。

覆盖情况：
- 当前身份可见目标：<visible_count>
- 已成功检查目标公共访问和协作权限设置：<permission_checked_count>
- 读取失败 / 已删除 / 无权限：<failed_count>
- 未覆盖能力：<collaborator_list / inheritance / audit_log / view_records / none>

风险分级：
- 高优先级待复核：<internet_public_count> 个互联网公开链接候选；<external_access_count> 个允许对外分享；其中 <external_without_label_count> 个同时缺少密级标签。
- 中优先级待复核：<tenant_link_count> 个公司内知道链接可访问 / 可编辑；<wide_share_count> 个协作者管理范围较宽。
- 待策略确认：<security_count> 个复制 / 下载 / 打印范围待复核；<comment_count> 个评论范围待复核。
- 无法判断：<unsupported_or_unverified_summary>。

分级含义：
- 互联网公开链接：获得链接的任何人可能访问，最高优先级。
- 允许对外分享：外部分享能力已开启，需 owner 复核；不等于已经存在外部协作者。
- 公司内链接可访问：不是对外公开，但组织内扩散范围较宽。
- 复制 / 下载 / 打印 / 评论：是否需要收紧取决于业务 policy 和文档密级。

高优先级待复核清单：
> 按 `摘要清单展开规则` 展示。每个对象必须包含 `risk_id` 和 URL；缺少 URL 时展示 token / node_token 和原因。若没有高优先级对象，只展示中优先级或待策略确认分组摘要。

- <risk_id> <path-or-title> (<type>)
  URL: <url-or-token-if-url-unavailable>
  Owner: <owner-or-unknown>
  密级：<sec_label_name-or-missing-or-unknown>
  待复核原因：<why high priority>
  证据：<short user-language evidence, e.g. 对外分享=已开启；链接分享=未开启互联网公开链接>
  建议动作：<recommended action>

未完全展开：
- 完整风险清单包含 <risk_manifest_count> 条；本摘要已展示 <shown_count> 条，未展示 <hidden_count> 条。
- 未展示分组：<risk_group=count summary or none>

建议下一步：
- 生成完整风险清单 artifact，包含 `risk_id`、URL、owner、密级、证据字段、建议动作和 `selected` 列。
- 基于 risk_id、风险分组、owner、路径、URL 或 artifact 中 `selected=true` 的行生成只读整改 dry-run。
- 只针对最高优先级目标进入写入确认流程，例如关闭互联网公开链接或收紧对外分享；写入前仍需二次确认。
- 按 owner / 密级生成复核清单。
- 继续读取访问记录，判断低活跃高暴露。

剩余限制：
- <do not claim collaborator-list verification if unsupported>
- <external_access_entity=open or external_access=true only means sharing outside is allowed, not that external collaborators exist>
- <missing view_records / DLP / AI index status / audit log limitations>
```

## 可操作风险清单

完整风险清单用于让用户选择后续治理范围。Markdown / CSV / 飞书文档报告都必须包含以下字段；如果某种格式无法完整展示嵌套证据，使用短文本摘要，保留 `risk_id` 和 URL。

```text
范围：<explicit_list / wiki_space / wiki_node / drive_folder> <name-or-id>
生成时间：<timestamp>
用途：用户可按 risk_id、priority、risk_group、owner、path、URL 或 selected=true 选择治理对象。

| risk_id | priority | Path | URL | Type | Owner | sec_label | risk_group | evidence | recommended_action | current_setting | target_setting | selected | decision | status | skip_reason |
|---------|----------|------|-----|------|-------|-----------|------------|----------|--------------------|-----------------|----------------|----------|----------|--------|-------------|
| PG-001 | P1 | <path> | <url-or-token> | <type> | <owner-or-unknown> | <sec-label-or-missing> | <risk_group> | <short evidence> | <recommended-action> | <field=value> | <field=value-or-owner-review> | false | undecided | pending | <none-or-reason> |
```

字段规则：

- `risk_id` 按 priority、risk_group、normalized path、URL、canonical token / node_token 稳定排序生成；URL 缺失时必须使用 token / node_token 作为 tie-breaker。同名、同路径、shortcut 或多个 Wiki 入口不能只靠 path 生成编号；同一次诊断中不得重复。
- `priority` 使用 `P0`、`P1`、`P2`、`PolicyReview`、`Unknown`；面向用户展示时可译为“最高优先级 / 高优先级待复核 / 中优先级待复核 / 待策略确认 / 无法判断”。
- `selected` 默认 `false`；用户可在 CSV / 飞书文档表格中改为 `true`，或在聊天中直接说 “处理 PG-001、PG-003”。
- `decision` 表示用户决策：`undecided`、`keep`、`dry_run`、`confirm_write`、`skip`。
- `status` 表示执行状态：`pending`、`dry_run_ready`、`confirmed`、`executed`、`verified`、`failed`、`skipped`。
- `target_setting` 是建议目标状态，不代表已执行；没有明确 policy 时只能写 owner review / policy review。

## 治理选择交互

用户基于完整风险清单继续治理时，Agent 必须先解析选择范围，再生成只读 dry-run：

```text
可接受的用户选择：
- 处理 PG-001、PG-003、PG-008，把互联网公开链接关闭。
- 先处理所有 risk_group=internet_public_link，不处理 external_access_only。
- 把 CSV / 飞书文档里 selected=true 的行生成整改 dry-run。
- PG-003 先跳过，只处理 PG-001。

Agent 必须回复：
- 已选择对象数：<count>
- 选择来源：<risk_id list / risk_group / selected=true / URL / path>
- 将执行的下一步：生成 dry-run；不执行写入
- 需要跳过或重新确认的对象：<missing risk_id / unsupported / changed_since_report / no manage_public>
```

如果用户选择来自旧报告或外部 artifact，生成 dry-run 前必须对所选目标重新读取当前权限。当前设置和报告快照不一致时，标记为 `changed_since_report`，不要直接沿用旧字段执行。

## 权限设置清单

```text
范围：<explicit_list / wiki_space / wiki_node / drive_folder> <name-or-id>

| Path | URL | Type | link_share_entity | external_access_entity / external_access | invite_external | share_entity | manage_collaborator_entity | copy_entity | security_entity | comment_entity | lock_switch | sec_label_name | 建议动作 | 限制 |
|------|-----|------|-------------------|------------------------------------------|-----------------|--------------|----------------------------|-------------|-----------------|----------------|-------------|----------------|----------|------|
| <path> | <url-or-token> | <type> | <value> | <value> | <value-or-unknown> | <value> | <value-or-unknown> | <value-or-unknown> | <value> | <value> | <value-or-unknown> | <value-or-missing> | <recommended-action> | <unsupported-or-none> |
```

## 访问复核清单

```text
范围：<wiki_space / wiki_node / drive_folder / explicit_list> <name-or-id>
复核对象数：<count>

| Owner | Path | URL | Type | 密级 | 风险标签 | 当前权限摘要 | 最近访问证据 | 建议动作 |
|-------|------|-----|------|------|----------|--------------|--------------|----------|
| <owner-or-unknown> | <path> | <url-or-token> | <type> | <sec-label-or-missing> | <labels> | <link/external/share/security/comment> | <uv/pv/last_view_or_unknown> | <keep / tighten / owner review / unsupported> |

限制：<unsupported_checks / discovery_blockers / none>
```

## 整改 dry-run

```text
将生成整改计划，不执行写入：
- 范围：<scope>
- 选择来源：<risk_id list / risk_group / selected=true artifact / URL list>
- 候选目标数：<count>
- 计划执行命令：<command family>
- 重新读取：已对所选目标重新读取当前权限；changed_since_report=<count>
- 字段变更：
  - <risk_id> <path> (<url-or-token>): <field> <old> -> <new>
- 跳过项：<unsupported / no manage_public / unsupported type / missing policy>
- 验证方式：执行后重新读取 <元数据 / 目标公共访问和协作权限设置>
- 有限回滚范围：<目标公共访问和协作权限设置快照字段 / 不适用>

请确认是否进入写入确认。
```

## 批量权限申请确认

```text
将逐个发起 <view / edit> 权限申请：
- 候选目标数：<count>
- 命令类型：drive +apply-permission
- 风险：write；每个请求都会通知 owner
- 执行方式：按候选列表顺序逐个调用，失败项会单独记录

候选示例：
- <risk_id> <title> (<type>, <url-or-token>)：<reason>

请确认是否对上述候选目标发起权限申请。
```

## owner 转移确认

```text
将逐个转移 owner：
- 候选目标数：<count>
- 命令类型：drive permission.members transfer_owner
- 风险：high-risk-write；会改变文档 owner，可能影响原 owner 权限和文档所在位置
- 新 owner 映射：<same_new_owner / per_target_new_owner>
- 全局新 owner：<member_id> (<member_type>)；仅当所有候选目标的新 owner 相同时展示，否则省略
- 通知新 owner：<need_notification>
- 原 owner 权限：<remove_old_owner=true / old_owner_perm>
- 个人空间位置：<stay_put>
- 执行方式：按候选列表顺序逐个调用，失败项会单独记录
- 验证方式：执行后重新读取 metadata owner；metadata 不支持的类型标记为 partial
- 回滚边界：不做自动回滚；如需恢复 owner，必须另起一次反向 owner 转移确认

候选示例：
- <risk_id> <title> (<type>, <url-or-token>)：当前 owner=<owner-or-unknown> -> 新 owner=<member_id> (<member_type>)

请确认是否对上述候选目标转移 owner。
```

## 确认请求

```text
将执行 <operation>：
- 目标：<risk_id> <title> (<type>, <url-or-token>)
- 命令类型：<command family>
- 风险：<risk_level>
- 字段变更：
  - <field>: <old> -> <new>
- 验证方式：执行后重新读取 <元数据 / 目标公共访问和协作权限设置>
- 有限回滚材料：<目标公共访问和协作权限设置快照 / 不适用>

请确认是否执行。
```

## 最终摘要

```text
已完成：<read checks / writes>
验证：<fresh read result or async permission-request approval note>
清单状态：<risk_id status updates / not applicable>
回滚材料：<目标公共访问和协作权限设置快照 / 不适用>
剩余限制：<unsupported_checks / partial facts / approvals>
```


<a id="s-15bd7bdf6ce4606c"></a>

## references/lark-drive-workflow-permission-governance.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-drive 权限治理 Workflow

Workflow id: `permission_governance`

Risk / Structure: `R2` / `S2`

本文实现已注册的权限治理 workflow。执行前必须先读取 [`lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad) 和 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流），并遵循共享执行协议、Artifact Contract、Workflow Loading、认证和写入确认规则。

## 适用范围

当用户要求检查或治理 Drive / Docs / Wiki 资产访问权限时，使用本 workflow。典型意图包括：

- 单资源公开性、外部访问、公司内链接、分享 / 复制 / 下载 / 评论设置检查。
- 多资源、Wiki space / node、Drive folder 或个人文档库的权限风险诊断和权限设置清单。
- 访问复核、低活跃高暴露、权限申请、owner 转移、密级标签调整、AI Agent / RAG 前置权限治理。
- 只读整改 dry-run，或经确认后的权限收紧 / 权限申请 / owner 转移 / 密级标签更新。

目标可以是明确 URL / token、小规模明确列表、Wiki space / Wiki node 或 Drive folder。容器范围必须先只读 `DISCOVER_TARGETS` 并产出覆盖摘要；这里的"所有文档"只表示当前身份在确认范围内可枚举到的文档。任何写入都必须再次确认。

单目标轻量路径：用户只问“是否对外公开 / 外部可访问 / 公司内链接可见”且目标是单个明确 URL / token 时，设置 `intent=public_exposure_check`、`target_scope=single_resource`，走 `PARSE_INTENT -> TARGET_INSPECT -> FACT_READ -> RISK_ASSESS -> DONE`。该路径是 `target_count=1` 的轻量输出模式，不是独立判断逻辑；不执行 `DISCOVER_TARGETS`、不生成 `risk_manifest` / `risk_id`，只输出结论、权限含义、检查边界和必要下一步。

## Target Set Evaluation

本 workflow 不按“单篇 / 多篇 / 容器”复制权限判断逻辑。所有范围先归一为 target set，再对每个可审计目标生成 `per_target_permission_assessment`，最后按目标数量和风险分组聚合输出。

| target_scope | Target Collection | Output Mode |
|--------------|-------------------|-------------|
| `single_resource` | 直接解析一个 URL / token | `target_count=1` 时轻量渲染；不生成 `risk_manifest` |
| `explicit_list` | 用户给出的多个 URL / token 逐个 inspect / normalize | 逐目标渲染摘要；需要后续治理时生成稳定 `risk_id` |
| `wiki_space` / `wiki_node` / `drive_folder` | 先只读递归发现，再归一化为 `discovered_targets` | 输出覆盖情况、风险分组、可定位待复核对象和 artifact / dry-run CTA |

特殊的是目标收集和输出聚合，不是权限语义。`link_access`、`external_sharing`、`copy_scope`、`security_scope`、`comment_scope`、`sec_label`、`check_scope` 等语义字段必须在单目标、多目标明确列表和容器发现目标之间复用。

## 非目标

本 workflow 不处理：

- 目录组织、迁移、归档或清理；这类需求应使用知识整理 workflow。
- 内容审查、过期内容判断或知识质量评分。
- backup owner 补充、部门 / 项目负责人绑定、协作者创建 / 撤销、成员列表审计；本 workflow 只支持把 owner 转移给每个目标明确指定的新 owner，不建模 backup owner 或负责人绑定关系。
- 文件夹自身公开权限审计或修复。文件夹自身权限设置可以用 `drive +permission-get-setting` 读取；写入是否支持必须以运行时 schema 和明确需求为准，不能猜测执行 `patch type=folder`。
- 当前身份无法枚举到的不可见文档的完整发现；只能处理已发现目标，或用户显式提供的 URL / token。
- 未按范围确认的批量写入。

协作者列表读取只覆盖当前目标的直接协作者/授权成员：可使用 `drive +member-list` 。

## Progressive Load Map

本表只规定每个 state 需要加载的额外上下文；命令可用范围以 `Command Map` 为准。需要拼装具体 `lark-cli` 命令时，再按需读取 [`lark-drive-workflow-permission-governance-commands.md`](lark-drive-0.md#s-1a80225bd1e462b4)。

| State | Required Reference |
|-------|--------------------|
| `PARSE_INTENT` | 本文件、[`lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)、[`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） |
| `TARGET_INSPECT` | [`lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587) |
| `DISCOVER_TARGETS` | 容器范围时读取 [`../../lark-wiki/references/lark-wiki-node-list.md`](lark-wiki-0.md#s-8a3585c4cccac51a) 或 [`lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97) |
| `FACT_READ` | `lark-cli schema drive.metas.batch_query`；涉及权限设置读取时使用 `drive +permission-get-setting`；涉及活跃度、访问复核或生命周期判断时再读取 `lark-cli schema drive.file.statistics.get` 和 `lark-cli schema drive.file.view_records.list` |
| `RISK_ASSESS` | 本文件的 `Risk Classification` |
| `EXEC_CONFIRM` | 只为用户选择的动作读取 [`lark-drive-apply-permission.md`](lark-drive-0.md#s-877958c402ff06d0)、[`lark-drive-secure-label.md`](lark-drive-0.md#s-0f10250131845279)，或 `lark-cli schema drive.permission.public.patch` / `lark-cli schema drive.permission.members.transfer_owner`；需要确认模板时读取 [`lark-drive-workflow-permission-governance-outputs.md`](lark-drive-0.md#s-96e5796aeec6819a) |
| `EXECUTE` | 复用 `EXEC_CONFIRM` 已加载且已确认的写命令上下文 |
| `VERIFY` | 复用 `FACT_READ` 阶段使用的 read schemas |

## Runtime State Extension

本 workflow 在共享 `Artifact Contract` 基础上扩展以下字段组：

| Group | Fields | Meaning |
|-------|--------|---------|
| Scope | `intent`, `target_scope`, `targets`, `discovered_targets`, `coverage_summary`, `discovery_blockers` | 记录用户意图、确认范围、直接目标、容器发现目标和未覆盖范围 |
| Facts | `metadata_facts`, `public_permission_facts`, `activity_facts`, `manage_public_auth` | 记录 metadata、公共访问与协作权限、访问证据，以及写前 `manage_public` 校验 |
| Assessment | `per_target_permission_assessments`, `risk_findings`, `unsupported_checks` | 记录逐目标语义判断、带 `risk_id` / URL / owner / sec_label / evidence / action 的风险发现，以及无法执行的检查 |
| Governance | `risk_manifest`, `selected_risk_items`, `access_review_items`, `permission_request_candidates`, `owner_transfer_candidates` | 支持用户按 `risk_id`、风险分组、owner、路径、URL 或 artifact `selected=true` 选择治理范围，并记录 owner 转移候选 |
| Execution | `remediation_plan`, `owner_transfer_plan`, `public_permission_snapshots` | 记录 dry-run / 已确认整改计划、owner 转移计划、字段 diff、验证方式和 public-permission 有限回滚快照 |

## Execution State Machine

| State | Protocol Step | Agent MUST Do | User-Facing Output | wait_for_user | Next State |
|-------|---------------|---------------|--------------------|---------------|------------|
| `PARSE_INTENT` | `route` / `scope` | 解析 intent、target scope、desired policy，以及只读审计、单目标公开性判断、权限申请、owner 转移还是修复模式；单目标公开性判断设置 `intent=public_exposure_check`、`target_scope=single_resource` | 范围确认；如果缺少目标、新 owner 或期望动作，只问一个澄清问题 | 缺少 target / new owner / action，或容器范围需要用户确认时为 `true` | `TARGET_INSPECT` |
| `TARGET_INSPECT` | `scope` | 解析单资源、明确列表、Wiki space / node、Drive folder；Drive folder 直接从 URL 路径或显式 `type=folder` 解析，不调用 `drive +inspect`；保留原始 URL、scope type、canonical token/type | 目标范围表，包含 scope、title/type/token status | 除非解析失败，否则为 `false` | `DISCOVER_TARGETS` or `FACT_READ` |
| `DISCOVER_TARGETS` | `scope` / `read` | 对 Wiki space / node 或 Drive folder 递归只读枚举，归一化为 `discovered_targets`；记录 `discovery_blockers` | 发现进度和覆盖摘要；不展示内部 cursor/token，除非用户要求 | 除非发现范围无法确认或全部被阻断，否则为 `false` | `FACT_READ` |
| `FACT_READ` | `read` | 对直接目标或 `discovered_targets` 执行 `drive metas batch_query`；对支持的文件、文件夹或云文档目标执行 `drive +permission-get-setting` 读取自身权限设置；当 `intent=public_exposure_check` 且 `target_scope=single_resource` 时，可复用 `drive +inspect` 返回的 title / URL / type，只补读目标公共访问和协作权限设置；在用户要求活跃度 / 访问复核 / 生命周期判断时读取访问统计和访问记录 | 权限事实摘要、coverage summary、activity facts 和 unsupported checks | 除非所有目标都被 auth 阻断，否则为 `false` | `RISK_ASSESS` |
| `RISK_ASSESS` | `assess/plan` | 对每个可审计目标生成 `per_target_permission_assessment` 并分类证据；如用户提供 policy，则对照 policy；`public_exposure_check + single_resource` 只渲染单目标结论，不生成 `risk_id`；owner 转移路径生成 `owner_transfer_candidates` / `owner_transfer_plan`；治理路径构建可定位风险清单、访问复核清单、dry-run 整改计划或候选修复计划，完整清单必须生成稳定 `risk_id` | 带 priority、URL、risk_id、owner、sec_label 的 findings、confidence、review items、建议动作和下一步 CTA；单目标公开性判断只输出结论和关键字段 | 治理路径为 `true`，单目标公开性判断为 `false` | `EXEC_CONFIRM` or `DONE` |
| `EXEC_CONFIRM` | `confirm` | 展示准确写入范围、command family、target count、risk、verification method | 确认请求 | `true` | `EXECUTE` or `DONE` |
| `EXECUTE` | `execute` | 只执行 `Command Map` 中已确认的写入 | 进度 / 结果摘要 | 除非被阻断，否则为 `false` | `VERIFY` |
| `VERIFY` | `verify` | 重新执行支持的读取，并与目标状态对比 | 验证表和剩余缺口 | `false` | `DONE` |
| `DONE` | `done` | 停止 | 最终回复，包含完成事项、验证结果和剩余风险 | `false` | End |

## Command Map

本 workflow 只能使用以下 command families：

| State | Allowed Command Families | Purpose |
|-------|--------------------------|---------|
| `TARGET_INSPECT` | `drive +inspect` | 解析非 folder URL、type、canonical token、title 和 wiki unwrap data；Drive folder 不支持 `+inspect`，必须从 URL 路径或显式 `type=folder` 直接解析 |
| `DISCOVER_TARGETS` | `wiki +node-list` | 递归发现 Wiki space / node 下当前身份可见的节点 |
| `DISCOVER_TARGETS` | `drive files list` | 递归发现 Drive folder 下当前身份可见的文件和子文件夹 |
| `FACT_READ` | `drive metas batch_query` | 读取 title、URL、owner 和 secure-label metadata |
| `FACT_READ` | `drive permission.public get` | 读取支持类型的文档公共访问和协作权限设置，包括链接分享、对外分享、协作者管理、复制内容、创建副本、打印、下载和评论 |
| `FACT_READ` | `drive +member-list` | 读取用户显式要求的单目标直接协作者/授权成员列表；不代表完整继承链或历史权限审计 |
| `FACT_READ` | `drive +permission-get-setting` | 读取支持类型的文件、文件夹或云文档自身权限设置，包括公开访问、分享、协作者管理、安全与评论 |
| `FACT_READ` | `drive file.statistics get` | 在用户要求活跃度、闲置暴露、生命周期或访问复核时读取文件访问统计 |
| `FACT_READ` | `drive file.view_records list` | 在用户要求最近访问人、访问复核或低活跃证据时读取访问记录 |
| `EXEC_CONFIRM` | `drive +secure-label-list` | 提议 label update 前解析可用 secure-label IDs |
| `EXEC_CONFIRM` | `drive permission.members auth` | 目标公共访问和协作权限设置修改前检查 `action=manage_public` |
| `EXEC_CONFIRM` | `lark-cli schema drive.permission.members.transfer_owner` | owner 转移前读取当前字段、支持类型和高风险写入门禁 |
| `EXECUTE` | `drive +apply-permission` | 向 owner 提交 view/edit access request；只允许单目标、小列表或已明确确认的候选列表逐个执行 |
| `EXECUTE` | `drive permission.public patch` | 修改已确认的 public/link settings；必须传 `--yes` |
| `EXECUTE` | `drive permission.members transfer_owner` | 转移已确认目标的 owner；必须传 `--yes` |
| `EXECUTE` | `drive +secure-label-update` | 设置已确认的 secure-label ID |
| `VERIFY` | `drive metas batch_query`, `drive +permission-get-setting` | 验证支持的 metadata，包括 owner、secure-label 和目标公共访问与协作权限设置变更；权限申请只能表述为已发起 |

## Command Patterns

本入口不内联命令样例。需要拼装具体 `lark-cli` 命令时，按当前 state 读取 [`lark-drive-workflow-permission-governance-commands.md`](lark-drive-0.md#s-1a80225bd1e462b4)。命令是否允许执行仍以 `Command Map` 和写入规则为准。

## Discovery Rules

容器范围只能先做只读发现和覆盖摘要，不能在发现阶段执行权限申请、权限 patch 或密级更新。

通用规则：

1. "所有文档"只表示当前身份在确认范围内可枚举到的文档。不可见、无权限、API 不返回或工具预算不足的部分必须进入 `discovery_blockers` 或 `unsupported_checks`。
2. 发现阶段必须生成稳定 `path`。不要只保存 title；同名文档必须能通过 path 或 token 区分。
3. 权限设置读取使用 `drive +permission-get-setting`，目标类型包括 `doc`、`sheet`、`file`、`wiki`、`bitable`、`docx`、`mindnote`、`minutes`、`slides`、`folder`、`apps`；未来新增类型以 shortcut 和 OpenAPI 元数据为准。
4. `minutes` 只能作为 `partial_public_permission` 目标：可读取 / 修改公开权限和 owner 转移能力以运行时 schema 为准，但 `drive metas batch_query` 当前不支持 `minutes`，URL、owner、密级等 metadata 可能进入 `unsupported_checks`。
5. `folder` 作为递归容器时先枚举子资源；如用户明确要查询文件夹自身权限设置，可对该文件夹单独执行 `drive +permission-get-setting --token <folder_token> --type folder`。不要执行 raw `permission.public patch type=folder`，除非 schema 和需求都明确支持。`shortcut`、`catalog` 或缺少 stable token/type 的条目必须记录为 unsupported，除非后续 API 明确解析出支持目标。
6. 对大范围目标输出进度时，只展示已扫描容器数、已发现目标数、已审计目标数、剩余队列或 blocker；不要默认展示内部 page token / cursor。

Wiki space / node 发现：

1. `/wiki/space/<space_id>` 直接解析为 `target_scope=wiki_space`。不要因为 `drive +inspect` 对该 URL 返回 not found 就停止。
2. 用 `wiki +node-list --space-id <space_id>` 读取根节点；当节点 `has_child=true` 时，用该节点的 `node_token` 继续递归读取子节点。
3. Wiki 节点必须同时保留 `node_token`、`obj_token` 和 `obj_type`。权限读取优先用 `type=wiki` + `node_token` 表达 Wiki 节点权限；元数据补充可使用 `obj_type` + `obj_token`。
4. 如果节点只有 `obj_token` / `obj_type`，但无法确认 Wiki 节点权限 token，保留该目标为 partial，并在 `unsupported_checks` 中说明只能读取底层对象或无法完整判断 Wiki 节点权限。

Drive folder 发现：

1. `/drive/folder/<folder_token>` 解析为 `target_scope=drive_folder`。默认继续枚举其子文档；只有用户明确要求文件夹自身权限设置时，才额外调用 `drive +permission-get-setting --token <folder_token> --type folder` 读取该文件夹自身设置。
2. 按 [`lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97) 递归处理 `data.files`、`has_more` 和 `next_page_token`。不要把第一页数量当作完整范围。
3. 只对返回项中的 `folder` 继续递归；对子文档按 `type + token` 归一化为 `discovered_targets`。
4. 如果某个目录分页失败、无 continuation token、权限不足或 API 报错，只阻断该目录分支，并在 `discovery_blockers` 中记录；继续处理其他可枚举分支。

## Fact Read Rules

1. `drive metas batch_query` 单次最多 200 个 `request_docs`；当 `targets` 或 `discovered_targets` 超过 200 个时，必须分批读取并合并结果。
2. `drive +permission-get-setting` 没有批量读取接口；对支持目标逐个读取。单个目标失败时记录 `unsupported_checks` 或 `partial`，不要阻断其他目标。
3. 对 Wiki 发现目标，公开权限读取优先使用 `type=wiki` + `node_token`；metadata 可使用 `obj_type` + `obj_token` 补充 title、owner、URL 和 `sec_label_name`。
4. 当 intent 是 `list_permission_settings` 时，只输出权限设置清单和覆盖限制，不主动生成修复计划。
5. 单目标、多目标明确列表和容器发现目标都必须复用同一套逐目标事实读取与语义归一逻辑；差异只体现在目标来源、coverage summary 和输出聚合。
6. `permission_public` 用户可见含义是“目标公共访问和协作权限设置”，语义以官方 OpenAPI 字段说明为准，同时兼容当前 CLI schema 返回的字段：优先使用 `external_access_entity`，缺失时才用 `external_access` boolean 映射为 `open` / `closed`；`manage_collaborator_entity`、`copy_entity`、`lock_switch` 等字段缺失时标记为 unknown，不要伪造；未识别字段保留在 raw evidence / partial note 中。
7. `drive file.statistics get` 和 `drive file.view_records list` 只在用户要求最近访问、活跃度、闲置暴露、访问复核，或用户提供的 policy 明确依赖活跃度时执行；不要为普通权限审计默认读取访问记录。
8. 访问统计 / 访问记录当前只对 `doc`、`docx`、`sheet`、`bitable`、`mindnote`、`wiki`、`file` 作为支持类型处理。其他类型必须进入 `unsupported_checks`，不能推断活跃度。
9. `view_records` 是访问证据，不是权限列表。没有返回访问记录只能表述为“未获得最近访问证据”或“低活跃候选”，不能表述为“无人有权限”。

## Risk Classification

风险标签只能作为 evidence labels。除非用户提供明确 policy，否则不要表述为绝对违规、已泄露或已外部访问。

默认优先级面向用户决策，而不是制造告警感：

- `P0`：`link_share_entity=anyone_readable/anyone_editable`，互联网公开链接候选风险。
- `P1`：`external_access_entity=open` / `external_access=true`、关联组织访问、公司内链接可编辑，或外部分享且缺少 / 低于 policy 密级标签。
- `P2`：公司内知道链接可读、协作者管理范围较宽。
- `PolicyReview`：复制、创建副本、打印、下载、评论等依赖 policy 的设置；没有明确 policy 时不要称为高风险。
- `Unknown`：读取失败、已删除、无权限、API 不支持、协作者名单 / 继承链 / DLP / AI 索引 / 审计日志未覆盖。

每个可审计目标都必须先归一化为 `per_target_permission_assessment`，再按 [`lark-drive-workflow-permission-governance-outputs.md`](lark-drive-0.md#s-96e5796aeec6819a) 的 `Semantic Rendering` 渲染。`public_exposure_check` 只是 `target_count=1` 的轻量渲染模式；它和多目标、容器诊断复用同一套语义字段与风险分类。该判断只覆盖当前目标公共访问和协作权限设置，不审计协作者名单、历史权限变更、完整继承链或审计日志。

`AI 检索暴露候选风险` 只是基于权限和标签的代理标签。除非另有工具明确返回索引状态，否则不要声称某个文档已经被 Agent、Copilot 或 RAG 索引。

## 写入规则

- 目标公共访问和协作权限设置修改（`drive permission.public patch`）属于高风险写入。请求确认前，必须展示 target title、token、current setting、desired setting 和准确 field changes。
- 如果 `manage_public_auth.auth_result=false`，禁止 patch。告诉用户需要具备 manage-public 权限的用户，或由 owner 操作。
- 权限设置读取使用 `drive +permission-get-setting`；裸 token 必须传 `--type`，URL 可以自动推断。写入仍使用 `drive permission.public patch`，只 patch 已解析且 schema 明确支持的类型和字段，不要把读取支持的 `folder` 自动外推为可写入。
- 不要 patch 已解析类型不支持的字段。对于 wiki 目标，必须省略 schema 明确标注为 wiki 不支持的字段。
- 不要在同一个写入确认中合并密级标签更新和目标公共访问与协作权限设置修改；必须分别确认。
- `drive +apply-permission` 默认不批量执行；每次调用都会向 owner 发送通知。
- `permission_request_candidates` 可以来自用户直接提供的目标、明确列表或容器发现目标；只要能构造 token、type、权限类型和申请理由，就可以进入候选。不要因为目标不在 `discovered_targets` 中而拒绝单目标 / 小列表权限申请。
- 容器范围内的"统一申请权限"必须先产出 `permission_request_candidates`。未展示候选目标、数量、权限类型和 owner 通知影响前，禁止调用 `drive +apply-permission`。
- 用户显式确认批量权限申请后，也必须逐个目标顺序调用 `drive +apply-permission`，并在结果中区分已发起申请、失败、无法构造申请请求和未发现目标。
- `drive permission.members transfer_owner` 属于 owner 转移高风险写入。必须先确认目标、当前 owner、新 owner 的 `member_id` / `member_type`、`need_notification`、`remove_old_owner`、`old_owner_perm`、`stay_put`、执行顺序和验证方式；不能只凭姓名猜测新 owner。
- owner 转移没有 `permission.members auth` 的等价 precheck。执行前只能用 schema 和当前 metadata 做计划，执行后必须用 `drive metas batch_query` fresh read 验证 owner；metadata 不支持的类型必须把验证标记为 partial。
- 批量 owner 转移必须逐个顺序执行；失败项进入结果清单，不要重复执行已成功目标。`remove_old_owner=true` 或 `old_owner_perm` 降权必须单独在确认中高亮。
- 用户要求“生成整改方案 / dry-run / 先看看会改什么”时，只生成 `remediation_plan`，不执行任何写命令。dry-run 必须包含 target count、field changes、跳过原因、验证方式和有限回滚范围。
- 用户基于完整风险清单选择对象时，必须先解析 `risk_id`、风险分组、URL 或 artifact 中 `selected=true` 的行，生成 `selected_risk_items`。无法匹配到当前 `risk_manifest` 的选择必须要求用户重新确认或重新读取清单。
- 针对 `selected_risk_items` 生成 dry-run 前，必须重新读取所选目标的 `drive +permission-get-setting`；如果当前设置和清单快照不同，标记为 `changed_since_report` 并跳过或要求用户确认更新后的计划。
- 执行 `drive permission.public patch` 前，必须把当前 `public_permission_facts` 中会被改动的字段保存为 `public_permission_snapshots`。该快照只用于目标公共访问和协作权限设置字段的有限回滚说明，不覆盖协作者、owner、继承权限或密级标签。
- 如果用户要求批量收紧权限，必须按风险分层和目标顺序逐个执行；失败项进入结果清单，不要因为单个失败而重复执行已成功目标。
- 遇到 secure-label downgrade error `1063013` 时，停止重试，并告诉用户需要在文档 UI 中完成审批。

## 未来扩展边界

以下能力已有部分 CLI surface 或用户价值，但不要在当前 workflow 中作为可执行分支直接调用：

- `drive permission.members create` 可创建协作者权限，但当前 workflow 不做协作者 grant / update / revoke；未来需要单独定义授权对象解析、最小权限、确认模板和验证方式。
- backup owner、部门 / 项目负责人绑定没有当前 workflow 可执行写入面；如用户要落地为 owner 转移，必须先给出明确目标和新 owner，并走本 workflow 的 owner-transfer 确认。
- `wiki +member-list` 可作为 Wiki space 成员治理的读侧事实来源；当前 workflow 只治理文档 / 节点 / 文件夹下可发现文档的权限，不做 space member governance。
- `drive +member-list` 可读取单目标直接协作者/授权成员；当前 CLI 仍没有完整继承链、DLP 扫描、AI 索引状态、审计日志和跨平台权限事实。遇到这些需求必须记录为 `unsupported_checks` 或建议新增独立 workflow。

## 输出策略

- 默认 summary-first：单目标输出简短审计摘要；多目标明确列表输出逐目标摘要；容器目标输出安全诊断报告摘要，不堆叠字段计数。
- 单目标 `public_exposure_check` 按 outputs 的 `Semantic Rendering` 渲染 `per_target_permission_assessment`，输出用户语言结论和检查边界；默认不展示底层字段名、风险清单或整改 CTA。
- 容器安全诊断必须包含一句话结论、覆盖情况、风险分级、可定位待复核对象、建议下一步和剩余限制。
- 待复核对象必须包含稳定 `risk_id`、path/title、URL、type、owner、sec_label、风险原因、证据和建议动作；缺少 URL 时展示 token / node_token 和原因。
- 容器摘要按规模渐进披露，不能固定 Top N；未完全展开时必须说明完整清单总数，并给出生成 artifact / dry-run / owner 复核清单等 CTA。
- 面向用户优先使用业务语言和“候选风险 / 待复核 / 待策略确认”；底层字段只作为证据。完整模板按需读取 [`lark-drive-workflow-permission-governance-outputs.md`](lark-drive-0.md#s-96e5796aeec6819a)。
- 不要默认创建文件、飞书文档或长表格；最终回复必须包含已完成事项、验证结果和剩余限制。异步权限申请审批只能表述为“已发起申请”。


<a id="s-58c1ba1f7a6bd6c7"></a>

## references/lark-drive-workflow-topic-move-collector-execute.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流：执行

由状态 `CONFIRM_EXECUTION`、`EXECUTE`、`VERIFY`、`RESTORE` 加载。

本文档负责最终写操作确认、目标创建、资源移动、验证、恢复行为、`RollbackSnapshotItem` 和执行日志。不得修改搜索、召回、分类规则或计划 schema。

本文档只服务 `topic_move_collector`。进入本文档时，`workflow_id` 必须是 `topic_move_collector`；不得把当前任务改路由到其他 workflow。

## 必读上下文

执行本文档规则前：

1. 按 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 处理写操作确认、高风险操作、身份、认证和权限。
2. 按 [`lark-drive-create-folder.md`](lark-drive-0.md#s-47844aa3761af3a5) 创建 Drive 文件夹。
3. 按 [`lark-drive-move.md`](lark-drive-0.md#s-385feb5ed1a01e57) 执行 Drive 移动。
4. 按 [`../../lark-wiki/references/lark-wiki-node-create.md`](lark-wiki-0.md#s-502a3956dd387b13) 创建 Wiki 节点。
5. 按 [`../../lark-wiki/references/lark-wiki-move.md`](lark-wiki-0.md#s-c6dffcf181e680d0) 执行 Wiki 移动和 Drive 文档移动到 Wiki。
6. 按 [`../../lark-wiki/references/lark-wiki-move-to-drive.md`](lark-wiki-0.md#s-9aa6007c9609b1f7) 将 Wiki 节点移出到 Drive 文件夹。
7. 按 [`lark-drive-delete.md`](lark-drive-0.md#s-0dd3b34e8e162f23) 删除本次 workflow 新建的 Drive 文件夹。
8. 按 [`../../lark-wiki/references/lark-wiki-node-delete.md`](lark-wiki-0.md#s-b9e78f1d6ed0d089) 删除本次 workflow 新建的 Wiki 节点。
9. 需要轮询异步任务时，按 [`lark-drive-task-result.md`](lark-drive-0.md#s-27c169d1426c6d1e) 执行。
10. `MovePlanItem` schema 由 [`lark-drive-workflow-topic-move-collector-review-plan.md`](lark-drive-0.md#s-9833aac2320c7b42) 定义，本文件只消费已确认计划。

## 状态：`CONFIRM_EXECUTION`

进入条件：移动计划已准备，且用户要求执行。

必须：

1. 执行前展示所有写操作类别。
2. 将目标创建和资源移动分开展示。
3. 展示默认纳入的高相关资源。
4. 如有用户选择的中相关资源，也要展示。
5. 展示跳过分组和原因。
6. 明确展示跨容器移动。
7. 展示无移动权限和移动权限未知的资源数量。
8. 请求用户明确确认。
9. 确认前校验每个 `move_resource` 项都包含完整 `command_family`、`command_args`、权限快照和 `rollback_input`；缺失时必须返回 `PLAN_MOVE` 重新生成计划，不得在执行阶段补猜。
10. 只有 `move_permission_state=movable` 且 `target_write_state=confirmed` 的计划项可以列入“将移动”。
11. 对每个 `rollback_supported=false` 的计划项逐项展示标题、当前位置、目标位置、不可恢复原因和影响，不得只展示数量。

### 确认 UI

```text
请确认是否执行以下写操作：

本次搜索范围：<当前用户 owner / 负责的资源 | 所有当前身份可见资源>

将创建：
- 目标名称｜父级位置｜目标类型

将移动：
- 标题｜类型｜当前位置｜目标位置｜原因

不会移动：
- 中相关未选择：N 项
- 低相关：N 项
- 无权限：N 项
- 无移动权限：N 项
- 移动权限未知：N 项
- 无法验证：N 项
- 不支持移动：N 项

风险提示：
- 不可自动恢复：N 项
- 标题｜当前位置｜目标位置｜不可恢复原因｜影响：移动成功后 workflow 无法自动搬回原位置，需要手动处理
- 如果搜索范围是所有当前身份可见资源，移动权限未知项不会移动。

确认后才会创建目标和移动资源。

如果不存在不可自动恢复项，请回复“确认执行”开始写操作。
如果存在不可自动恢复项，请回复“确认执行，包括不可自动恢复项”；普通“确认执行”不满足本次风险确认。
也可以回复“调整计划”返回选择资源，或回复“取消”结束流程。
```

如果用户修改选择或相关性分组，废弃当前 `move_plan_items` 并返回 `PLAN_MOVE` 重新生成计划；不得在 `CONFIRM_EXECUTION` 直接局部改写计划。

## 状态：`EXECUTE`

进入条件：用户明确确认写操作；存在 `rollback_supported=false` 的计划项时，用户已明确确认包括不可自动恢复项。

必须：

1. 只执行已确认 `MovePlanItem.command_family` 和 `command_args`；不得回查 `ResourceItem` 补齐或改写命令参数。
2. 当存在 `action_type=create_target` 的 `MovePlanItem` 时，先创建目标。
3. 目标创建后记录返回 token；只允许把 `created_by_plan:<create_target plan_id>` 引用解析为该 token，并把解析后的实际参数写入 `execution_journal`。不得重新搜索或猜测目标。
4. 目标 token 引用解析成功后再移动依赖该目标的资源；解析失败时停止依赖该创建目标的移动并记录 blocker，不得替换为其他目标。
5. 执行任何写操作前，基于每个已确认计划项的 `rollback_input` 生成 `rollback_snapshot`。`rollback_supported=false` 且已有明确 `rollback_blocker` 的快照视为完整风险快照，不阻塞其他项。
6. 执行任何写操作前，初始化 `execution_journal`。
7. 每次写操作尝试后记录 `execution_journal`。
8. 单项失败后可继续执行相互独立的移动；目标创建失败时必须停止。
9. 不得移动 `permission_denied`、`no_move_permission`、`move_permission_unknown`、`unverifiable`、`low` 或 `unsupported_move_target` 项。
10. 不得移动 `move_permission_state!=movable` 或 `target_write_state!=confirmed` 的资源。
11. 如果移动命令返回权限错误，记录失败原因，不自动申请权限，不自动重试同一移动。
12. 如果 `rollback_supported=true` 但 `rollback_input` 缺少恢复所需字段，将该计划项标记为 `failed` / `plan_snapshot_incomplete` 并跳过；不得在未重新确认风险的情况下把它静默降级为不可恢复项，也不得阻塞其他独立项。

### 移动方式选择

| 来源 -> 目标 | 移动方式 |
|------------------|-------------|
| Drive resource -> Drive folder | `drive +move` |
| Drive document-like resource -> Wiki target | `wiki +move` 的 docs-to-wiki 模式；默认不可自动恢复 |
| Wiki node -> Wiki target | `wiki +move --node-token` |
| Wiki node -> Drive folder | `wiki +move-to-drive` |

### 执行顺序

1. 如有 `create_target` 项，先执行。
2. 按确认计划顺序执行 `move_resource` 项。
3. 若命令返回 `ready=false`，按 `next_command` 继续查询；`ready=true` 时无需继续轮询，即使仍返回 task ID。
4. 输出写操作执行摘要。

### 进度 UI

批量较大时，按计数汇报进度：

```text
执行进度：已完成 <done_count>/<total_count>，成功 <success_count>，失败 <failed_count>。
当前操作：<title>
继续执行中，不需要你操作；如遇到需要确认的失败会单独提示。
```

## 状态：`VERIFY`

进入条件：执行完成。

必须：

1. 如果创建了目标，验证目标存在。
2. 能力支持时，验证已移动资源在目标位置可见。
3. 对比实际位置和 `move_plan_items`。
4. 为每一项标记验证状态。
5. 只有当已有移动成功且存在严重不一致或失败时，才提供恢复选项。
6. 输出验证结果时，必须说明用户下一步可以结束流程、查看失败项，或在可恢复时选择恢复。
7. 如果出现 `async_pending`，先使用 `drive +task_result` 轮询确认；超过轮询限制后再报告 pending blocker。

### 验证结果

| 状态值 | 说明 |
|--------|------|
| `verified` | 资源已在目标位置可见。 |
| `not_found` | 目标位置未找到资源。 |
| `permission_unknown` | 当前身份无法确认结果。 |
| `async_pending` | 异步任务尚未完成，需要继续轮询。 |
| `failed` | 移动命令失败或结果不符合计划。 |

## 状态：`RESTORE`

进入条件：失败、不一致或用户明确要求恢复。

必须：

1. 只基于 `rollback_snapshot` 和 `execution_journal` 生成恢复计划。
2. 展示可恢复项和不可恢复项。
3. 执行恢复写操作前请求明确确认；确认内容必须包含反向移动和删除本次 workflow 新建目标。
4. 只恢复本次 workflow 移动过的资源。
5. 只恢复 `rollback_supported=true` 且 `rollback_eligible=true` 的移动项。
6. Drive / Wiki 跨容器移动、原父级 token 缺失等 `rollback_supported=false` 的项不得反向移动，也不得删除迁入后的文档。
7. 本次 workflow 成功创建的目标文件夹或 Wiki 节点必须纳入清理计划。
8. 删除 workflow 新建的 Wiki 目标节点时，必须使用 `wiki +node-delete --include-children=false --yes`，让已迁入的直接子文档保留到该节点父级层级。
9. 删除 workflow 新建的 Drive 文件夹前，必须先恢复或移出其中由本次 workflow 放入的资源；如果无法确认文件夹已安全可删，报告清理阻塞，不得用删除文件夹来删除用户资源。

### 恢复顺序

1. 先恢复 `rollback_supported=true` 且 `rollback_eligible=true` 的移动项。
2. 对全部 `rollback_supported=false` 的项，只记录“保留在当前目标位置，不回迁、不删除”和对应 blocker。
3. 再清理 `created_by_workflow=true` 的目标容器。
4. Wiki 新建目标清理使用 `--include-children=false`；Drive 新建目标清理只在不会删除用户资源时执行。

### 恢复 UI

```text
可以尝试恢复本次已移动的资源：

可恢复：
- 标题｜当前位置｜原位置

不可自动恢复：
- 标题｜当前位置｜原位置｜原因｜影响：需要手动恢复

将清理本次新建目标：
- 名称｜类型｜清理方式

将保留在当前目标位置的跨容器迁入文档：
- 标题｜当前位置｜保留结果

是否执行恢复？
```

## RollbackSnapshotItem

```json
{
  "snapshot_id": "稳定快照行 ID",
  "plan_id": "对应 MovePlanItem.plan_id",
  "resource_id": "对应 MovePlanItem.resource_id",
  "source_kind": "drive|wiki",
  "title": "资源标题",
  "resource_type": "Drive 恢复命令需要的资源类型",
  "original_token": "原始 Drive token",
  "original_node_token": "原始 Wiki node token",
  "original_parent_kind": "drive_folder|drive_root|wiki_node|wiki_space_root|unknown",
  "original_parent_token": "原始父级 token",
  "original_space_id": "原始 Wiki space_id",
  "original_path": "执行前路径",
  "planned_target_parent_token": "计划目标父级 token",
  "rollback_supported": "是否支持自动恢复",
  "rollback_blocker": "不可自动恢复原因"
}
```

| 字段 | 说明 |
|-------|------|
| `snapshot_id` | 稳定快照行 ID。 |
| `plan_id` | 对应 `MovePlanItem.plan_id`，用于连接计划、快照和执行日志。 |
| `resource_id` | 对应稳定资源 ID，用于审计计划来源。 |
| `resource_type` | `drive +move` 恢复时必须传入的 `--type`；非 Drive 恢复也保留原始资源类型。 |
| `original_token` / `original_node_token` | 执行前源资源身份。 |
| `original_parent_kind` / `original_parent_token` | 执行前父级位置。 |
| `rollback_supported` | 是否支持自动恢复。 |
| `rollback_blocker` | 不可自动恢复原因。 |

## 执行日志

每次写操作尝试都必须追加一条内部日志：

```json
{
  "journal_id": "稳定日志行 ID",
  "plan_id": "对应 MovePlanItem 的 plan_id",
  "time": "ISO-8601",
  "action_type": "create_target|move_resource|restore_resource|cleanup_target",
  "operation": "create_folder|create_node|move_drive|move_wiki_node|move_wiki_to_drive|restore_drive|restore_wiki_node|delete_folder|delete_wiki_node",
  "command_family": "drive +move|wiki +move|wiki +move-to-drive|drive +create-folder|wiki +node-create|drive +delete|wiki +node-delete",
  "resolved_command_args": {"<arg>": "实际发送的参数"},
  "title": "资源或目标名称",
  "resource_type": "资源类型",
  "input_token": "命令输入 token",
  "input_node_token": "命令输入 Wiki node token",
  "input_parent_token": "已知源父级 token",
  "target_parent_token": "目标父级 token",
  "returned_token": "命令返回 token",
  "returned_node_token": "命令返回 Wiki node token",
  "returned_parent_token": "返回父级 token",
  "task_id": "异步任务 ID",
  "next_command": "异步继续命令",
  "created_by_workflow": "是否由本次 workflow 创建",
  "rollback_eligible": "是否可进入自动恢复计划",
  "status": "success|failed|pending",
  "error": "失败原因"
}
```

字段说明：

| 字段 | 说明 |
|------|------|
| `journal_id` | 稳定日志行 ID。 |
| `plan_id` | 对应 `MovePlanItem`，用于把日志项匹配回原计划。 |
| `operation` | 细分操作类型，用于区分创建、移动和恢复。 |
| `resolved_command_args` | 从确认计划解析出的实际发送参数；用于审计 `created_by_plan:<plan_id>` 的唯一运行时替换。 |
| `resource_type` | 实际移动 / 恢复使用的资源类型。 |
| `input_token` / `input_node_token` | 命令实际输入的资源 token。 |
| `input_parent_token` | 执行前已知源父级 token。 |
| `target_parent_token` | 命令输入的目标父级 token。 |
| `returned_token` / `returned_node_token` | 命令返回的资源 token，恢复时作为当前源。 |
| `returned_parent_token` | 命令返回的当前父级 token。 |
| `task_id` / `next_command` | 异步任务跟踪信息。 |
| `created_by_workflow` | 是否由本次 workflow 创建，用于后续清理判断。 |
| `rollback_eligible` | 是否可进入自动恢复计划。 |
| `status` | 写操作状态，异步未完成时为 `pending`。 |

除非用户要求查看技术调试细节，否则不要展示完整原始命令输出。


<a id="s-f856f016134a4f22"></a>

## references/lark-drive-workflow-topic-move-collector-recall.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流：召回

由状态 `SEARCH_RECALL`、`RECALL_ENHANCE` 加载。

本文档负责基础搜索召回、覆盖增强、query 证据、去重和 `CandidateItem`。不得解析目标移动 token、读取完整文档内容、判断相关性或执行写操作。

本文档只服务 `topic_move_collector`。进入本文档时，`workflow_id` 必须是 `topic_move_collector`；不得把当前任务改路由到其他 workflow。

## 必读上下文

执行本文档规则前：

1. 按 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 处理身份、认证和权限。
2. 按 [`lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9) 处理 `drive +search` 语法、过滤条件、单批最多 5 页和身份语义；本 workflow 的全量续批规则见下文。

## 搜索原则

1. 默认使用 `drive +search --mine` 召回当前用户 owner / 负责的 Workspace 资源。
2. 除非用户本来就要求限定范围，否则不要要求用户指定文件夹或 Wiki 范围。
3. `SEARCH_RECALL` 和 `RECALL_ENHANCE` 必须保持为独立状态。
4. `SEARCH_RECALL` 使用用户原始关键词、`owner_scope` 和显式限制。
5. `RECALL_ENHANCE` 可以基于基础召回证据增加扩展 query，且必须继承同一个 `owner_scope`。
6. 每个候选项必须保留 query 证据，方便后续解释来源。
7. 单页或单个最多 5 页的 query 批次不代表完整覆盖；`has_more=true` 时必须保存 `next_page_token` 并自动开始下一批，直到 `has_more=false` 或出现阻塞。
8. 召回和增强召回可能耗时较长，执行超过 60 秒时必须输出进度提示，之后约每 60 秒提示一次。
9. 只有用户在 `CONFIRM_CONTEXT` 明确确认 `owner_scope=all_visible` 时，才允许移除 `--mine`。

### 分页优先级与完成语义

1. 用户确认进入 `topic_move_collector` 即表示同意为本次收集任务执行完整召回；无需再要求用户额外说“全部 / 全量 / 继续翻”。本规则覆盖 `lark-drive-search.md` 的默认首屏交互规则。
2. 仍遵守 `lark-drive-search.md` 的单轮最多 5 页限制。每读取最多 5 页形成一个批次；批次结束且 `has_more=true` 时，保存 checkpoint，并使用原 query、原过滤条件和返回的 `next_page_token` 自动开始下一批。
3. 自动续批不改变 workflow 状态，也不触发用户确认。执行超过约 60 秒时只输出进度。
4. 一个 query 只有在 `has_more=false` 时才是 `complete`。单批结束、达到 5 页或已有部分候选都不代表完成。
5. 当前状态的全部 query 都为 `complete` 后，才能进入下一状态。认证、权限、无效分页 token、连续重试失败或工具预算不足属于 blocker；必须保留 checkpoint、报告部分召回并停在当前状态，不得把部分结果当成完整召回继续分类。

### QueryRecallState

每个基础 / 增强 query 必须维护：

```json
{
  "query_id": "稳定 query ID",
  "query": "完整 query",
  "recall_stage": "search_recall|recall_enhance",
  "page_count": 0,
  "batch_count": 0,
  "next_page_token": "下一批起点",
  "has_more": true,
  "status": "pending|running|complete|blocked",
  "blocker": "阻塞原因"
}
```

## 状态：`SEARCH_RECALL`

进入条件：用户已确认 `CONFIRM_CONTEXT`。

必须：

1. 基于已确认的 `topic` 构造基础 query。
2. 应用默认 `owner_scope=mine` 和 `constraints` 中的显式限制。
3. 不隐式添加 `--folder-tokens` 或 `--space-ids`。
4. 当 `owner_scope=mine` 时，所有基础 query 必须带 `--mine`。
5. 当 `owner_scope=all_visible` 时，不带 `--mine`，并记录扩展召回风险。
6. 除非命令限制要求更低值，否则使用 `--page-size 20`。
7. 每个基础 query 按每批最多 5 页执行；批次结束仍有更多结果时自动续批，并合并所有页面。
8. 记录基础统计：query、搜索范围、页数、批次数、收集数量、重复数量、阻塞项。
9. 只有全部基础 query 的 `status=complete` 且 `has_more=false` 时，才进入 `RECALL_ENHANCE`；出现阻塞时保持在 `SEARCH_RECALL`。

### 召回进度 UI

当 `SEARCH_RECALL` 或 `RECALL_ENHANCE` 持续超过约 60 秒时，输出当前进度：

```text
搜索进度：当前阶段 <SEARCH_RECALL|RECALL_ENHANCE>，已执行 <query_count> 个 query，已读取 <page_count> 页，收集候选 <raw_count> 项，去重后 <unique_count> 项。继续搜索，不会创建或移动资源。
```

如果正在执行具体 query，可补充：

```text
当前 query：<query>
```

### 基础 Query 规则

| 用户输入 | 基础 Query |
|------------|----------------|
| 单个关键词 | 直接作为 `--query`。 |
| 多个关键词组成一个短语 | 优先按用户输入的短语执行。 |
| 明确精确短语 | 保留引号。 |
| 明确排除词 | 保留负向词。 |
| 没有真实关键词，只有过滤条件 | 使用 `--query ""` 搭配过滤条件。 |

在 `SEARCH_RECALL` 中不得添加同义词、仅标题搜索、仅评论搜索或 OR 扩展。

### 基础召回输出

```text
基础召回完成：
- 使用 query：
- 搜索范围：
- 应用限制：
- 收集候选：
- 去重后候选：
- 阻塞项：

下一步：继续执行覆盖增强，不需要你操作；不会创建或移动资源。
```

## 状态：`RECALL_ENHANCE`

进入条件：基础召回完成。

必须：

1. 基于已确认主题和基础召回证据生成增强 query。
2. 确保增强 query 可解释且不引入明显污染。
3. 每个增强 query 都必须继承 `owner_scope`；`owner_scope=mine` 时必须带 `--mine`。
4. 每个 query 都必须按每批最多 5 页处理分页，并自动续批直到 `has_more=false`。
5. 有稳定去重键时，按稳定去重键合并候选项。
6. 为每个候选项保留 `source_queries` 和命中证据。
7. 当 query 不再产生新候选，或出现工具预算 / API 阻塞时，停止增强。

### 召回阶段退出门禁

`RECALL_ENHANCE` 完成后，必须：

1. 确认全部基础和增强 query 的 `status=complete` 且 `has_more=false`，再固化完整 `candidate_items`，包含去重结果、`source_queries`、`match_channels`、`snippets` 和 `dedupe_status`。
2. 将 `current_state` 设置为 `RESOURCE_RESOLVE`。
3. 加载 [`lark-drive-workflow-topic-move-collector-resolve-verify.md`](lark-drive-0.md#s-f95e0f2d7b19b091)。
4. 把完整 `candidate_items` 交给 `RESOURCE_RESOLVE`。
5. 不得直接进入 `RELEVANCE_CLASSIFY`、`PLAN_MOVE` 或展示相关性结果。
6. 不得用搜索标题、摘要或 query 命中直接生成高 / 中 / 低相关分组。

### 增强策略

| 策略 | 说明 |
|----------|------|
| 精确短语 | 对明确短语使用 `"..."` 提高精确命中。 |
| `intitle:` | 对项目名、客户名、制度名、报表名等标题特征强的主题执行标题召回。 |
| `--only-title` | 当标题命中更可信时使用。 |
| `--only-comment` | 当主题可能只出现在评论讨论中时使用。 |
| 类型拆分 | 对 `docx`、`sheet`、`bitable`、`slides`、`file` 等分类型搜索，减少服务端排序偏差。 |
| 同义词 / 别名 | 使用业务上明确的同义词、简称、英文名、中文名。 |
| OR 扩展 | 对同一实体的别名做 OR 扩展。 |
| 负向词 | 对明显噪声使用 `-term`，但不能排除可能相关的主题词。 |

### Query 证据

每个候选项都要记录：

| 字段 | 说明 |
|-------|------|
| `source_queries` | 命中过该资源的 query 列表。 |
| `match_channels` | 命中位置，如 title、body、comment、metadata。 |
| `snippets` | 搜索返回的摘要或片段。 |
| `query_rank` | 资源在各 query 中的相对位置。 |
| `recall_stage` | `search_recall` 或 `recall_enhance`。 |

## 去重规则

必须：

1. 搜索响应提供 canonical token 时，优先使用 canonical token。
2. 对 Wiki 结果，不得只按 object token 去重；同一对象可能出现在多个 Wiki 节点中。
3. token 缺失时，使用 URL 作为 fallback。
4. 合并重复项时保留所有 query 证据。
5. 如果无法确定去重是否稳定，保留该项并设置 `dedupe_status=uncertain`。

## CandidateItem

```json
{
  "title": "资源标题",
  "url": "资源链接",
  "raw_type": "搜索返回类型",
  "source_queries": ["query"],
  "match_channels": ["title|body|comment|metadata"],
  "snippets": ["命中片段"],
  "page_rank": 1,
  "dedupe_key": "候选去重键",
  "dedupe_status": "stable|fallback|uncertain",
  "recall_stage": "search_recall|recall_enhance"
}
```

| 字段 | 说明 |
|-------|------|
| `title` | 搜索结果标题。 |
| `url` | 资源访问链接。 |
| `raw_type` | 搜索返回的原始类型。 |
| `source_queries` | 命中过该资源的搜索 query。 |
| `match_channels` | 命中位置。 |
| `snippets` | 摘要或命中片段。 |
| `page_rank` | 当前 query 下的排序位置。 |
| `dedupe_key` | 候选去重键。 |
| `dedupe_status` | 去重可信度。 |
| `recall_stage` | 资源首次进入候选集的召回阶段。 |

## 阻塞项

缺少认证 / scope、`drive +search` 返回权限或策略阻塞、分页 token 无效、分页重试后仍无法继续，或工具预算不足以完成全部页面时，必须把对应 `QueryRecallState.status` 设置为 `blocked`，保留累计候选、页数和 `next_page_token`，停止并报告。阻塞解除后从 checkpoint 续跑；在全部 query 完成前不得进入资源解析或分类阶段。


<a id="s-f95e0f2d7b19b091"></a>

## references/lark-drive-workflow-topic-move-collector-resolve-verify.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流：资源解析与内容验证

由状态 `RESOURCE_RESOLVE`、`CONTENT_VERIFY` 加载。

本文档负责资源解析、结构化父级、移动资格、内容验证和 `ResourceItem`。不得判断相关性、生成移动计划、创建目标、移动资源或执行恢复操作。

本文档只服务 `topic_move_collector`。进入本文档时，`workflow_id` 必须是 `topic_move_collector`；不得把当前任务改路由到其他 workflow。

## 必读上下文

执行本文档规则前：

1. 按 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 处理身份、认证和权限。
2. 按 [`lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587) 处理 URL / token 解析。
3. 使用 `drive metas batch_query` 补齐 Drive 资源 owner、标题和 URL。
4. 必要时使用 `drive permission.members auth` 读取权限信号；该接口不提供 `full_access` / 移动权限的直接判定，不能把 `manage_public` 等同为可移动。
5. 按 [`../../lark-wiki/references/lark-wiki-node-get.md`](lark-wiki-0.md#s-5b3c1d410c11b5c9) 处理 Wiki 节点解析。
6. 按 [`../../lark-doc/references/lark-doc-fetch.md`](lark-doc-0.md#s-a8f2a17fdca55dac) 读取文档内容。
7. 需要验证 Sheet 内容时，按 [`../../lark-sheets/SKILL.md`]（按模块名读取对应工作流） 执行。

## 进入解析与验证阶段前校验

进入本文档后，如果 `resource_items` 还不存在，当前状态必须是 `RESOURCE_RESOLVE`。

禁止从 `candidate_items` 直接进入 `CONTENT_VERIFY` 或 `RELEVANCE_CLASSIFY`，也禁止从 `RESOURCE_RESOLVE` 直接进入 `RELEVANCE_CLASSIFY`。即使候选项已有标题、URL、摘要或 token，也必须依次执行 `RESOURCE_RESOLVE` 和 `CONTENT_VERIFY`；两个状态不得合并。

## 状态：`RESOURCE_RESOLVE`

进入条件：候选列表已准备。

必须：

1. 为每个 `CandidateItem` 生成稳定 `resource_id`，并转换为标准化 `ResourceItem`。
2. 解析 canonical token、资源类型、URL、结构化当前父级、Wiki 节点身份和读取权限状态。
3. 对 Wiki 资源同时保留 `wiki_node_token` 和 `wiki_obj_token`。
4. 按 `move_method` 补齐 `owner_id`、`is_owner`、`source_move_state`、`source_parent_write_state`、`target_write_state`、`move_permission_state` 和 `move_permission_basis`。
5. 基于 `target_location` 检测不支持的移动方向。
6. 未解析成功的资源仍保留在审核分组中，不得静默丢弃。
7. 即使搜索结果已经包含标题、URL 或 token，也必须经过本状态生成 `ResourceItem`；不得从召回结果直接进入相关性分级。
8. 只有确认 `move_permission_state=movable` 且 `target_write_state=confirmed` 的资源，才能进入后续默认移动链路。
9. 解析耗时超过约 60 秒时，必须输出进度提示，之后约每 60 秒提示一次。

### 解析规则

| 候选类型 | agent 必须执行 |
|----------------|---------------|
| Drive URL / token | token 或类型不确定时，使用 `drive +inspect`。 |
| Wiki URL / token | 使用 `drive +inspect` 或 `wiki +node-get`；保留节点身份和对象身份。 |
| 文件夹候选 | 标记为容器；不要当作普通文档做内容验证。 |
| 快捷方式候选 | 能解析源资源时解析源资源；同时保留快捷方式身份。 |
| 无读取权限 | 保留可见元数据，并设置 `permission_state=denied`。 |
| 无移动权限或移动权限未知 | 保留可见元数据和召回证据，并设置对应 `move_permission_state`。 |
| 无法解析当前父级 | 设置 `current_parent_kind=unknown`，保留已知路径，后续计划项设置 `rollback_supported=false` 和明确 blocker；不得编造父级 token。 |

### 资源解析进度 UI

当 `RESOURCE_RESOLVE` 持续超过约 60 秒时，输出当前进度：

```text
资源解析进度：已解析 <resolved_count>/<total_count> 项，已确认可移动 <movable_count> 项，无移动权限 <denied_count> 项，移动权限未知 <unknown_count> 项，解析失败 <failed_count> 项。
当前资源：<title>
继续解析中，不会创建或移动资源。
```

如果正在处理权限或 owner 元数据，可补充：

```text
当前步骤：解析 owner / 当前父级 / 移动资格。
```

`RESOURCE_RESOLVE` 完成后，输出摘要：

```text
资源解析完成：
- 候选总数：N 项
- 可进入内容验证：N 项
- 无移动权限：N 项
- 移动权限未知：N 项
- 解析失败或无读取权限：N 项

下一步会对可移动资源做内容验证；不会创建或移动资源。
```

### 资源解析出口门禁

`RESOURCE_RESOLVE` 完成后必须：

1. 将 `content_verify_completed` 重置为 `false`。
2. 将下一状态设置为 `CONTENT_VERIFY`，不得设置为 `RELEVANCE_CLASSIFY` 或 `PLAN_MOVE`。
3. 不得在本状态生成 `relevance`、`relevance_groups` 或移动计划。
4. 即使可读取正文的资源数量为 0，也必须进入 `CONTENT_VERIFY`，为每项记录跳过验证原因并输出验证摘要。

### 移动资格判定

`owner` 只能作为部分权限证据，不得单独把资源判为 `movable`。`RESOURCE_RESOLVE` 必须先按 `move_method` 记录以下独立状态：

| 字段 | 说明 |
|------|------|
| `source_move_state` | 当前身份是否确认可以对源资源执行对应移动；Drive owner 只可作为 Drive 源资源可管理的证据，Wiki 底层资源 owner 不能证明 Wiki 节点可移动。 |
| `source_parent_write_state` | 当前身份是否确认可编辑源位置；仅 `drive_move` 必须确认，其他移动方式为 `not_required`。 |
| `target_write_state` | 当前身份是否确认可写目标位置；待创建目标以父级位置的创建 / 写入权限为准。 |

#### 按移动方式的权限矩阵

| `move_method` | `source_move_state=confirmed` 的证据 | `source_parent_write_state` | `target_write_state` |
|---------------|--------------------------------------|-----------------------------|----------------------|
| `drive_move` | 当前用户是可靠解析出的 Drive 资源 owner，或有明确资源可管理证据 | 必须为 `confirmed` | 必须为 `confirmed` |
| `wiki_move_docs_to_wiki` | 有明确的 Drive 文档直接迁入权限；仅 owner 元数据不足以证明可直接迁入 | `not_required` | 必须确认目标 Wiki 节点 / 空间可写 |
| `wiki_move_node` | 有明确的 Wiki 节点 / 源空间移动权限；不得从底层资源 owner 推导 | `not_required` | 必须确认目标 Wiki 节点 / 空间可写 |
| `wiki_move_to_drive` | 有明确的 Wiki 节点移出权限；不得从底层资源 owner 推导 | `not_required` | 必须确认目标 Drive 文件夹可写 |

#### 聚合顺序

1. 目标方向或资源类型不支持时，设置 `move_permission_state=denied`、`move_permission_basis=["unsupported_direction"]`。
2. 任一必需状态为 `denied` 时，设置 `move_permission_state=denied`，并在 `move_permission_basis` 记录 `source_denied`、`source_parent_denied` 或 `target_denied`。
3. 任一必需状态为 `unknown` 时，设置 `move_permission_state=unknown`，并记录对应的 `source_unknown`、`source_parent_unknown` 或 `target_unknown`。
4. 只有权限矩阵中的全部必需状态都为 `confirmed` 时，才能设置 `move_permission_state=movable`、`move_permission_basis=["permission_matrix_confirmed"]`。

注意：

1. `drive permission.members auth` 不提供 `full_access` 或 `move` action；不能用 `view`、`edit`、`share` 或 `manage_public` 结果推断源位置或目标位置可写。
2. `target_write_state=unknown|denied` 的资源不得进入高 / 中相关可执行分组或移动计划。
3. `move_permission_state=unknown` 的资源默认不进入内容验证、相关性高 / 中分组或移动计划。
4. 当 `owner_scope=mine` 但解析出的 owner 不是当前用户时，将该资源视为异常候选，设置 `source_move_state=unknown` 和 `move_permission_state=unknown`，不得加入移动计划。

## 状态：`CONTENT_VERIFY`

进入条件：资源列表已准备。

必须：

1. 本状态不可跳过，也不得与 `RESOURCE_RESOLVE` 或 `RELEVANCE_CLASSIFY` 合并；没有可读取正文的资源时仍须执行。
2. 只在资源解析后读取支持的内容。
3. 按数量、大小和类型能力限制读取范围。
4. 结合搜索证据和内容证据；除非标题精确且足够强，否则不要仅凭标题判为高相关。
5. 将不可读取资源标记为 `unverifiable` 或 `permission_denied`。
6. 不得自动申请权限。
7. 为每个资源写入验证状态：已读取内容证据、仅可使用搜索证据、无权限、无移动权限、移动权限未知、无法验证或不支持内容验证。
8. 对 `move_permission_state=denied|unknown` 的资源，不再读取正文内容，写入跳过验证原因并保留召回证据；写入跳过原因属于执行本状态，不等于跳过本状态。
9. 所有资源都有验证状态或跳过原因后，将 `content_verify_completed` 设置为 `true` 并输出验证摘要。
10. `content_verify_completed=true` 前不得进入 `RELEVANCE_CLASSIFY`。

### 验证方式

| 资源类型 | 验证方式 |
|---------------|---------------------|
| `docx` / `doc` | 允许时使用 `docs +fetch --api-version v2`。 |
| `sheet` | 使用 `sheets +cells-search` 查关键词证据，或用 `sheets +cells-get` 读取有界范围。 |
| `bitable` | 只有必要且已加载 Base 能力时验证。 |
| `slides` | 除非具备幻灯片读取能力，否则使用元数据 / 预览 / 标题证据。 |
| `file` | 仅在支持时使用标题、元数据、预览或导出文本。 |
| `wiki` 节点 | 按 `obj_type` 验证底层对象；节点本身不是内容 token。 |
| `folder` | 除非用户明确要移动容器，否则通常不作为主题证据移动。 |

### 内容验证完成 UI

完成 `CONTENT_VERIFY` 后必须输出：

```text
内容验证完成：
- 已读取内容证据：N 项
- 仅复用搜索证据：N 项
- 因无权限或移动资格跳过：N 项
- 无法验证或不支持验证：N 项

下一步会基于以上证据进行相关性分组；不会创建或移动资源。
```

如果没有任何资源可以读取正文，仍须输出该摘要，并明确说明所有资源采用的搜索证据或跳过原因。

### 内容验证出口门禁

`CONTENT_VERIFY` 完成后必须：

1. 确认 `content_verify_completed=true`，且每个 `ResourceItem` 都已有验证状态或跳过原因。
2. 将下一状态设置为 `RELEVANCE_CLASSIFY`。
3. 加载 [`lark-drive-workflow-topic-move-collector-review-plan.md`](lark-drive-0.md#s-9833aac2320c7b42)。
4. 不得直接进入 `PLAN_MOVE`。

## ResourceItem

```json
{
  "resource_id": "稳定资源 ID",
  "title": "资源标题",
  "resource_type": "doc|docx|sheet|bitable|file|folder|wiki|slides|shortcut",
  "url": "资源链接",
  "canonical_token": "标准资源 token",
  "wiki_node_token": "Wiki 节点 token",
  "wiki_obj_token": "Wiki 底层对象 token",
  "wiki_obj_type": "Wiki 底层对象类型",
  "space_id": "知识空间 ID",
  "current_parent_kind": "drive_folder|drive_root|wiki_node|wiki_space_root|unknown",
  "current_parent_token": "当前父级 token",
  "current_parent_space_id": "当前父级 Wiki space_id",
  "current_path": "用于展示的当前位置",
  "owner_id": "资源 owner open_id",
  "is_owner": "true|false|unknown",
  "permission_state": "readable|denied|unknown",
  "source_move_state": "confirmed|unknown|denied",
  "source_parent_write_state": "confirmed|unknown|denied|not_required",
  "move_permission_state": "movable|denied|unknown",
  "move_permission_basis": ["权限矩阵证据或阻塞原因"],
  "target_write_state": "confirmed|unknown|denied",
  "item_resolve_status": "resolved|partial|failed",
  "content_verify_state": "verified|search_evidence_only|skipped_by_move_permission|permission_denied|unverifiable|unsupported",
  "content_evidence": ["证据"],
  "relevance": "high|medium|low|permission_denied|no_move_permission|move_permission_unknown|unverifiable|unsupported_move_target"
}
```

| 字段 | 说明 |
|-------|------|
| `canonical_token` | 内容读取、Drive 对象操作或底层对象操作使用的标准 token；Wiki 节点移动不得使用该字段。 |
| `resource_id` | 资源解析时生成的稳定 ID，用于连接 `ResourceItem` 和 `MovePlanItem`。 |
| `wiki_node_token` | Wiki 节点身份，用于 Wiki 节点移动。 |
| `wiki_obj_token` | Wiki 节点背后的真实文档 token。 |
| `current_parent_kind` / `current_parent_token` / `current_parent_space_id` | 结构化执行前父级，用于 `already_at_target` 判断和恢复；未知值不得猜测。 |
| `current_path` | 仅用于用户展示的当前位置，不得代替父级 token。 |
| `owner_id` | 资源 owner；Drive 资源优先来自 `drive metas batch_query`，Wiki 节点优先来自 `wiki +node-get`。 |
| `is_owner` | 当前用户是否为资源 owner。 |
| `permission_state` | 当前身份下的读取权限状态。 |
| `source_move_state` | 当前身份是否确认能对源资源执行所选 `move_method`；必须按权限矩阵判断。 |
| `source_parent_write_state` | Drive 内移动所需的源位置编辑状态；非 `drive_move` 为 `not_required`。 |
| `move_permission_state` | 权限矩阵聚合结果；只有 `movable` 且目标写入状态为 `confirmed` 才可进入默认移动链路。 |
| `move_permission_basis` | 移动资格判断依据，用于解释为什么纳入或排除。 |
| `target_write_state` | 目标位置是否确认可写。 |
| `item_resolve_status` | 资源项解析状态；不要和 `TargetLocation.target_resolve_status` 混用。 |
| `content_verify_state` | 内容验证状态或跳过验证原因。 |
| `content_evidence` | 支撑相关性判断的命中证据。 |
| `relevance` | 相关性和可执行性分组。 |


<a id="s-9833aac2320c7b42"></a>

## references/lark-drive-workflow-topic-move-collector-review-plan.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流：审核与计划

由状态 `RELEVANCE_CLASSIFY`、`PLAN_MOVE` 加载。

本文档负责相关性分级、审核 UI、移动计划生成和 `MovePlanItem`。不得重新执行资源解析或内容验证，也不得创建目标、移动资源或执行恢复操作。

本文档只服务 `topic_move_collector`。进入本文档时，`workflow_id` 必须是 `topic_move_collector`；不得把当前任务改路由到其他 workflow。

## 输入契约

进入本文档前必须已有：

1. `resource_items`，且每个 `ResourceItem` 已包含稳定 `resource_id`、资源类型、移动所需 token、结构化当前父级、权限状态、内容验证状态和证据。
2. `content_verify_completed=true`。
3. 每个资源都有内容证据、搜索证据复用说明或明确跳过原因。

`ResourceItem` schema 和字段生成规则由 [`lark-drive-workflow-topic-move-collector-resolve-verify.md`](lark-drive-0.md#s-f95e0f2d7b19b091) 负责。只要上述输入契约完整，本状态不得为重复读取 schema 而重新加载或执行前一阶段文档。

如果输入字段缺失、资源需要重新解析或用户要求重新读取证据，废弃受影响的相关性和计划结果，返回 `RESOURCE_RESOLVE` 或 `CONTENT_VERIFY`，并加载资源解析与内容验证文档；不得在本状态补猜。

## 状态：`RELEVANCE_CLASSIFY`

进入条件：`CONTENT_VERIFY` 已完成，`content_verify_completed=true`，且每个 `ResourceItem` 都已有验证状态或跳过验证原因。

禁止条件：

1. 只有 `candidate_items`，没有 `resource_items`。
2. 资源未经过 `RESOURCE_RESOLVE`。
3. 资源没有 `RESOURCE_RESOLVE` 写入的移动资格状态。
4. 资源没有 `CONTENT_VERIFY` 写入的验证状态或跳过验证原因。
5. 上一完成状态是 `RESOURCE_RESOLVE`，或 `content_verify_completed` 不为 `true`。

必须将每个资源归入且只归入一个分组：

| 分组 | 说明 | 默认移动 |
|-------|------|--------------|
| `high` | 可移动资源，且主题或内容直接命中，有明确标题 / 正文 / 表格 / 评论证据。 | 是 |
| `medium` | 可移动资源，可能相关，但证据不足或只命中弱相关片段。 | 否，需用户选择 |
| `low` | 可移动资源，弱相关或噪声，保留展示但不建议移动。 | 否 |
| `permission_denied` | 当前身份无权读取或解析，不能验证内容。 | 否 |
| `no_move_permission` | 已确认当前身份不具备移动资格。 | 否 |
| `move_permission_unknown` | 无法确认当前身份是否具备移动资格。 | 否 |
| `unverifiable` | 类型或工具限制导致无法验证内容。 | 否 |
| `unsupported_move_target` | 目标方向或资源类型不支持移动。 | 否 |

`high`、`medium` 和 `low` 只能包含 `move_permission_state=movable` 且 `target_write_state=confirmed` 的资源。

判为高相关至少需要一个强证据：

1. 标题或内容中出现精确主题短语。
2. 多个主题词在相关上下文中同时出现。
3. Sheet / 表格单元格明确匹配用户主题。
4. 用户明确提供的文档名或项目别名命中。

中相关示例：

1. 标题包含一个主题词，但内容无法确认。
2. 搜索摘要看起来相关，但无法完整读取。
3. 别名命中合理但证据不够强。

## 审核 UI

必须展示每个分组中的资源名称。

默认展示规则：

1. 展开 `high` 和 `medium`。
2. 折叠 `low`、`permission_denied`、`no_move_permission`、`move_permission_unknown`、`unverifiable` 和 `unsupported_move_target`，但展示数量并允许展开。
3. 每个可见资源展示标题、类型、当前位置、证据和默认动作。
4. 除非用户要求技术细节，否则不展示原始 token。

示例：

```text
筛选结果：

搜索范围：<当前用户 owner / 负责的资源 | 所有当前身份可见资源>

高相关（默认移动）：
- 标题｜类型｜证据｜当前位置

中相关（需你勾选后才移动）：
- 标题｜类型｜证据｜当前位置

未默认移动：
- 低相关：N 项
- 无权限：N 项
- 无移动权限：N 项
- 移动权限未知：N 项
- 无法验证：N 项
- 不支持移动：N 项

你可以选择：
1. 确认按默认规则生成移动计划。
2. 勾选要加入计划的中相关资源。
3. 要求把某些资源移到其他分组或从计划中移除。
4. 展开低相关 / 无权限 / 无移动权限 / 移动权限未知 / 无法验证 / 不支持移动分组查看名称。
```

### 用户调整规则

如果用户不同意相关性结果，必须基于用户要求更新 `relevance_groups`，再重新展示分组结果并重新生成后续移动计划。

典型调整包括：

1. 从 `high` 中移除某个资源。
2. 将 `medium` 中某个资源提升为 `high`。
3. 将某个资源标为 `low` 或不移动。
4. 要求重新读取证据或重新判断一批资源。
5. 要求重新确认某些资源的移动权限。

用户调整后：

1. 旧的 `move_plan_items` 立即失效。
2. 必须先输出“调整后相关性结果”，展示被调整项、各分组数量和高 / 中相关资源名称。
3. 不得只回复“已调整”，也不得直接跳到 `CONFIRM_EXECUTION`。
4. 必须基于新的 `relevance_groups` 重新执行 `PLAN_MOVE`。
5. 不得把 `no_move_permission` 或 `move_permission_unknown` 资源直接提升到 `high` / `medium`；必须先回到 `RESOURCE_RESOLVE`，加载 [`lark-drive-workflow-topic-move-collector-resolve-verify.md`](lark-drive-0.md#s-f95e0f2d7b19b091) 取得可移动证据。

### 调整后结果 UI

```text
已按你的要求调整相关性结果：
- <标题>：<原分组> -> <新分组>

调整后分组：

搜索范围：<当前用户 owner / 负责的资源 | 所有当前身份可见资源>

高相关（默认移动）：N 项
- 标题｜类型｜证据｜当前位置

中相关（需你勾选后才移动）：N 项
- 标题｜类型｜证据｜当前位置

未默认移动：
- 低相关：N 项
- 无权限：N 项
- 无移动权限：N 项
- 移动权限未知：N 项
- 无法验证：N 项
- 不支持移动：N 项

接下来会基于这个调整后的结果重新生成移动计划；你也可以继续调整。
```

## 状态：`PLAN_MOVE`

进入条件：相关性分组已准备。

必须：

1. 当 `target_location.create_required=true` 时，纳入目标创建计划。
2. 生成移动计划前，比较规范化的当前父级与目标父级；已在目标位置的资源生成 `skip_resource`，设置 `skip_reason=already_at_target`，不得生成移动命令。
3. 默认纳入全部 `high`、`move_permission_state=movable` 且 `target_write_state=confirmed` 的资源。
4. 只有用户明确选择时，才纳入 `medium`、`move_permission_state=movable` 且 `target_write_state=confirmed` 的资源。
5. 默认排除 `low`、`permission_denied`、`no_move_permission`、`move_permission_unknown`、`unverifiable` 和 `unsupported_move_target`。
6. 为每个跳过项生成 `skip_reason`。
7. 为每个计划项生成稳定 `plan_id`，并使用 `resource_id` 连接对应资源；不得按标题或临时 token 猜测关联。
8. 按 `command_family` 保存完整、不可变的 `command_args`；不得把 Wiki 底层对象 token 当作 Wiki 节点移动 token。
9. 为每个 `move_resource` 项复制执行前恢复所需的完整 `rollback_input`，使确认计划不依赖运行时回查 `ResourceItem`。
10. 当前父级无法结构化解析或属于 Drive / Wiki 跨容器移动时，设置 `rollback_supported=false` 和明确 `rollback_blocker`；该单项仍可进入确认，但必须逐项展示不可恢复风险，不得阻塞其他独立项。
11. 停止并等待用户选择或执行意图。
12. 不得为 `move_permission_state!=movable` 或 `target_write_state!=confirmed` 的资源生成 `move_resource` 计划项。

### 已在目标位置判定

1. `drive_move` 比较 `current_parent_kind` 和目标 Drive 父级，并比较规范化后的 `current_parent_token` / root 标识。
2. `wiki_move_node` 比较 `current_parent_space_id`、`current_parent_kind` 和 `current_parent_token`；Wiki 空间根节点使用明确的 root 标识，不得用空字符串和未知状态混淆。
3. 只有父级类型、space ID（适用时）和 token 都已解析且相等时，才能设置 `skip_reason=already_at_target`；父级未知时不得猜测为相等。

### 移动 token 选择

| `command_family` | `command_args` 必须包含 |
|------------------|---------------------------|
| `drive +move` | `file_token`、`type`、`folder_token`；移动到 Drive root 时显式记录 `folder_token` 为空且目标类型为 root。 |
| `wiki +move`（node） | `node_token`，以及 `target_space_id` 或 `target_parent_token`；可选 `source_space_id`。不得使用 `wiki_obj_token` 代替 `node_token`。 |
| `wiki +move`（docs-to-wiki） | `obj_type`、`obj_token`、`target_space_id`、可选 `target_parent_token`，并显式保存 `apply=false`。 |
| `wiki +move-to-drive` | `node_token`、`folder_token`；移动到 Drive root 时显式记录 `folder_token` 为空。 |
| `drive +create-folder` | `name`、父级 `folder_token`；创建在 Drive root 时显式记录父级为空。 |
| `wiki +node-create` | `space_id`、`title`、`obj_type`、可选 `parent_node_token`。 |
| `none` | 不执行命令，保留 `skip_reason`。 |

目标由本次 workflow 创建时，对应目标参数保存 `created_by_plan:<create_target plan_id>` 引用。`EXECUTE` 只允许把该引用替换为对应创建计划返回的 token；不得重新搜索或猜测目标。

### 计划 UI

```text
移动计划已生成：
- 默认将移动高相关：N 项
- 你已选择中相关：N 项
- 其中不可自动恢复：N 项
- 已在目标位置：N 项
- 不会移动：N 项
- 无移动权限：N 项
- 移动权限未知：N 项

你可以回复“确认执行”，也可以继续调整分组、增减中相关资源，或取消本次移动。
```

## MovePlanItem

```json
{
  "plan_id": "稳定计划项 ID",
  "resource_id": "对应 ResourceItem.resource_id；create_target 为空",
  "action_type": "create_target|move_resource|skip_resource|unsupported",
  "title": "资源或目标名称",
  "resource_type": "源资源类型",
  "move_method": "drive_move|wiki_move_node|wiki_move_docs_to_wiki|wiki_move_to_drive|none",
  "command_family": "具体 shortcut 命令或 none",
  "command_args": {
    "<arg>": "按 command_family 参数表保存的完整、类型明确的参数"
  },
  "source_path": "用户确认时展示的源位置",
  "target_path": "用户确认时展示的目标位置",
  "move_permission_state": "movable|denied|unknown|not_required",
  "target_write_state": "confirmed|unknown|denied",
  "reason": "纳入或跳过原因",
  "skip_reason": "already_at_target 或其他跳过原因",
  "rollback_input": {
    "source_kind": "drive|wiki",
    "original_token": "原始 Drive / obj token",
    "original_node_token": "原始 Wiki node token",
    "resource_type": "恢复命令需要的资源类型",
    "original_parent_kind": "drive_folder|drive_root|wiki_node|wiki_space_root|unknown",
    "original_parent_token": "原始父级 token",
    "original_space_id": "原始 Wiki space_id",
    "original_path": "执行前路径"
  },
  "rollback_supported": "是否支持自动恢复",
  "rollback_blocker": "不可自动恢复原因",
  "execution_status": "pending|success|failed|skipped"
}
```

| 字段 | 说明 |
|-------|------|
| `plan_id` | 稳定计划项 ID，用于连接计划、快照和执行日志。 |
| `resource_id` | 稳定资源 ID，用于连接确认计划和解析结果；`create_target` 为空。执行阶段不得依赖该关联回查可变参数。 |
| `action_type` | 计划动作类型。 |
| `move_method` | 实际使用的移动方式。 |
| `command_family` / `command_args` | 用户确认的完整写命令及参数快照；确认后保持不可变。目标待创建时只允许使用 `created_by_plan:<plan_id>` 引用。 |
| `move_permission_state` / `target_write_state` | 用户确认时的权限门禁快照；`move_resource` 必须分别为 `movable` / `confirmed`。`create_target` 的移动权限为 `not_required`，但父级写入权限仍必须为 `confirmed`。 |
| `rollback_input` | 从 `ResourceItem` 复制出的完整恢复输入；仅 `move_resource` 必填，生成确认计划后不得再回查或猜测。 |
| `rollback_supported` | 是否支持自动恢复。 |
| `rollback_blocker` | 不可自动恢复原因；跨容器移动使用 `cross_container_permission_model_not_losslessly_restorable`，原父级 token 缺失使用 `original_parent_token_unavailable`。 |
| `execution_status` | 执行状态。 |


<a id="s-7a834241a1ae0cb7"></a>

## references/lark-drive-workflow-topic-move-collector-setup.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流：输入与目标确认

由状态 `PARSE_INPUT`、`RESOLVE_TARGET`、`CONFIRM_CONTEXT` 加载。

本文档负责用户输入解析、目标位置解析、搜索前确认和 `TargetLocation`。不得执行搜索召回、资源分类、目标创建或资源移动。

本文档只服务 `topic_move_collector`。进入本文档后必须确认 `workflow_id=topic_move_collector`；不得把当前任务改路由到其他 workflow。

## 必读上下文

执行本文档规则前：

1. 按 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 处理身份、认证和权限。
2. 解析 Drive 目标时，遵循 [`lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587)、[`lark-drive-create-folder.md`](lark-drive-0.md#s-47844aa3761af3a5) 和 [`lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9)。
3. 解析 Wiki 目标时，遵循 [`../../lark-wiki/SKILL.md`](lark-wiki-0.md#s-384c23a567152824)、[`../../lark-wiki/references/lark-wiki-node-get.md`](lark-wiki-0.md#s-5b3c1d410c11b5c9) 和 [`../../lark-wiki/references/lark-wiki-node-create.md`](lark-wiki-0.md#s-502a3956dd387b13)。

## 状态：`PARSE_INPUT`

进入条件：workflow 被触发。

必须：

1. 提取 `topic`、`target`、`identity`、`owner_scope` 和 `constraints`。
2. 将 `topic` 和 `target` 视为必填字段。
3. 除非用户明确要求 bot / app 视角，否则 `identity` 默认使用用户身份。
4. 默认 `allow_cross_container_move=true`，但必须在 `CONFIRM_CONTEXT` 展示。
5. 默认 `owner_scope=mine`，表示只搜索当前用户 owner / 负责的资源。
6. 只有用户明确要求“不限 owner”“包括共享给我的”“所有我能看到的文档”或“全量搜索”时，才设置 `owner_scope=all_visible`。
7. 除非用户明确提供限制，否则 `constraints` 保持为空。
8. 如果缺少 `topic` 或 `target`，只提出最小澄清问题。

### 输入字段

| 字段 | 说明 |
|-------|------|
| `topic` | 用户要查找的主题、关键词、内容线索、同义词、缩写、排除词。 |
| `target` | 归档目标，可以是已有 Drive 文件夹、已有 Wiki 节点、待创建 Drive 文件夹或待创建 Wiki 节点。 |
| `identity` | 执行身份，默认 `--as user`。 |
| `owner_scope` | 搜索 owner 范围，默认 `mine`；`all_visible` 仅在用户明确要求扩展到所有可见资源时使用。 |
| `constraints` | 用户显式给出的类型、时间、创建人、评论、标题、范围等限制。 |
| `allow_cross_container_move` | 是否允许跨 Drive / Wiki 容器移动；默认允许，但必须确认。 |

### 澄清模板

```text
我还需要补齐两个信息后才能开始：

1. 要查找的主题 / 关键词 / 内容线索是什么？
2. 找到后要移动到哪个 Drive 文件夹或 Wiki 节点？如果需要新建目标，也请说明父级位置和新名称。
```

## 状态：`RESOLVE_TARGET`

进入条件：`topic` 和 `target` 已获得。

必须：

1. 将已有目标解析为具体 token。
2. 如果目标需要创建，只解析父级位置和新目标名称。
3. 在本状态中不得创建文件夹或 Wiki 节点。
4. 分别保留 Drive 文件夹 token、Wiki 节点 token、Wiki 对象 token、space ID 和 parent token。
5. 如果目标 URL / token 存在，但当前身份无法读取或解析目标位置，设置 `target_resolve_status=permission_denied`，保持在 `RESOLVE_TARGET` 并等待用户更换目标或结束；不得进入搜索。
6. 如果已知移动方向不支持，尽早标记。

### 目标解析

| 条件 | agent 必须执行 | 设置 `target_type` |
|-----------|---------------|-------------------|
| 已有 Drive 文件夹 URL 或 token | 有 URL 时用 `drive +inspect` 解析；保留 `folder_token` | `drive_folder` |
| 已有 Wiki 节点 URL 或 token | 用 `wiki +node-get` 或 `drive +inspect` 解析；保留 `wiki_node_token` 和 `space_id` | `wiki_node` |
| 在已知父级下新建 Drive 文件夹 | 解析父文件夹；保存新文件夹名称；不创建 | `new_drive_folder` |
| 在已知父级下新建 Wiki 节点 | 解析知识空间和可选父节点；保存新节点标题；不创建 | `new_wiki_node` |
| 以 Wiki 空间根节点作为目标 | 解析 `space_id`；parent token 可以为空 | `wiki_space` |
| 目标名称有歧义 | 仅在必要时搜索或列出候选；展示候选并等待用户选择 | `unknown` |

### 目标解析状态

| 条件 | `target_resolve_status` |
|------|--------------------------|
| 目标已解析，或待创建目标的父级位置已解析 | `resolved` |
| 目标名称有歧义、候选不唯一，或 `target_type=unknown` 需要用户选择 | `ambiguous` |
| 已知目标方向或目标类型不支持本 workflow | `unsupported` |
| 目标 URL / token 存在，但当前身份无权读取、解析或确认目标位置 | `permission_denied` |

### 目标解析出口门禁

| `target_resolve_status` | 下一状态 | agent 必须执行 |
|-------------------------|----------|----------------|
| `resolved` | `CONFIRM_CONTEXT` | 展示已解析目标并进入搜索前确认。 |
| `ambiguous` | 保持 `RESOLVE_TARGET` | 展示候选并等待用户选择；不得进入 `CONFIRM_CONTEXT`。 |
| `unsupported` | 保持 `RESOLVE_TARGET` | 展示不支持原因，等待用户更换目标或结束；不得搜索。 |
| `permission_denied` | 保持 `RESOLVE_TARGET` | 展示权限 blocker，等待用户更换目标或结束；不得搜索。 |

用户提供新目标后，重新执行 `RESOLVE_TARGET`。只有新的解析结果为 `resolved`，才能进入 `CONFIRM_CONTEXT`；用户选择结束时进入 `DONE`。

### 跨容器规则

| 来源 -> 目标 | 默认规则 |
|------------------|---------|
| Drive 资源 -> Drive 文件夹 | 支持，使用 `drive +move`。 |
| Drive 文档类资源 -> Wiki 节点 / 空间 | 资源类型支持时，使用 `wiki +move`。 |
| Wiki 节点 -> Wiki 节点 / 空间 | 支持，使用 `wiki +move --node-token`。 |
| Wiki 节点 -> Drive 文件夹 | `wiki +move-to-drive`。 |

## 状态：`CONFIRM_CONTEXT`

进入条件：`target_resolve_status=resolved`。

必须：

1. 展示主题、目标、身份、搜索 owner 范围、限制和目标解析字段。
2. 说明下一步只进行搜索 / 读取。
3. 说明是否计划创建目标，但尚未执行。
4. 展示是否允许跨容器移动。
5. 在进入 `SEARCH_RECALL` 前停止并等待用户确认。
6. 如果 `owner_scope=all_visible`，明确提示候选数量可能较多，且可能包含无法移动的资源。

### 确认 UI

```text
我先确认本次收集任务。

查找主题：
目标位置：
目标解析：
执行身份：
搜索范围：
可选限制：
跨容器移动：
下一步操作：只进行搜索和读取验证，不创建目标，不移动资源。

请确认是否按以上信息开始搜索？
```

默认搜索范围文案：

```text
搜索范围：当前用户 owner / 负责的资源
```

扩展搜索范围文案：

```text
搜索范围：所有当前身份可见资源
风险提示：候选数量可能较多，且部分资源可能无法移动；后续仍会经过资源解析和内容验证。
```

如果用户修改任一字段，更新 `topic`、`target_location`、`owner_scope` 或 `constraints`，然后只重新执行受影响的 setup 状态，再次展示确认信息。

## TargetLocation

```json
{
  "target_type": "drive_folder|wiki_node|wiki_space|new_drive_folder|new_wiki_node|unknown",
  "target_token": "已有目标的 folder_token 或 wiki_node_token",
  "parent_token": "待创建目标的父级 folder_token 或 wiki_node_token",
  "space_id": "知识库空间 ID",
  "target_name": "待创建目标名称",
  "create_required": false,
  "allow_cross_container_move": true,
  "target_resolve_status": "resolved|ambiguous|unsupported|permission_denied"
}
```

| 字段 | 说明 |
|-------|------|
| `target_type` | 目标位置类型，用于决定后续创建和移动命令。 |
| `target_token` | 已有目标的可执行 token。 |
| `parent_token` | 待创建目标的父级位置 token。 |
| `space_id` | Wiki 目标所属知识空间 ID。 |
| `target_name` | 待创建目标的名称。 |
| `create_required` | 是否需要在 `EXECUTE` 阶段创建目标。 |
| `allow_cross_container_move` | 是否允许 Drive / Wiki 之间移动。 |
| `target_resolve_status` | 目标位置解析状态；不要和 `ResourceItem.item_resolve_status` 混用。 |


<a id="s-6ce8e611996d89c6"></a>

## references/lark-drive-workflow-topic-move-collector.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# 主题资料收集工作流

Workflow id: `topic_move_collector`

Risk / Structure: `R2-R3` / `S3`

本文档实现已注册的主题资料收集 workflow。执行前必须先阅读 [`lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad) 和 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流），并遵循共享执行协议、Artifact Contract、Workflow Loading、认证和写入确认规则。

本文档负责定义本 workflow 的全局约束、状态机和渐进加载关系。具体阶段规则放在配套文档中，只有进入对应状态时才加载。

配套文档只是本 workflow 的引用文件，不是独立 skill。不要把用户请求直接路由到某个配套文档。

## 必读上下文

执行本 workflow 前，必须先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流），用于处理身份、认证、权限和写操作确认规则。

按阶段渐进加载其他 skill / 引用文档：

- 目标是 Wiki 或个人文档库：[`../../lark-wiki/SKILL.md`](lark-wiki-0.md#s-384c23a567152824)
- 需要读取文档内容：[`../../lark-doc/SKILL.md`](lark-doc-0.md#s-716f3f9ec728a423) 和 [`../../lark-doc/references/lark-doc-fetch.md`](lark-doc-0.md#s-a8f2a17fdca55dac)
- 需要验证 Sheet 内容：[`../../lark-sheets/SKILL.md`]（按模块名读取对应工作流）
- 需要 Drive 搜索：[`lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9)
- 需要资源解析：[`lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587)

## 适用范围

本 workflow 用于根据用户给出的主题、关键词或内容线索，在云空间 / 云盘 / Wiki / 电子表格等 Workspace 资源中查找相关资料，并在用户确认后统一移动到指定 Drive 文件夹或 Wiki 节点下。

适用触发语包括：

- "帮我找到和某主题相关的文档并放到这个文件夹"
- "把所有关于某项目的资料收集到知识库节点下"
- "找出包含某内容的资料，确认后移动到新建目录"
- "按这个关键词搜索我负责的资料，把相关资料归档"

默认搜索范围是当前用户 owner / 负责的 Workspace 资源，即 `owner_scope=mine`。只有用户明确要求“不限 owner”“包括共享给我的”“所有我能看到的文档”或“全量搜索”时，才使用 `owner_scope=all_visible` 进入扩展召回模式。

不要求用户先限定文件夹或知识库范围。只有用户明确指定范围时，才使用 `--folder-tokens`、`--space-ids` 或其他显式限制。

## 非目标

默认不生成：

- 长篇研究报告
- 内容总结文档
- Sheet 清单或统计看板
- 自动权限治理报告

默认禁止执行：

- 未确认前创建文件夹或 Wiki 节点
- 未确认前移动资源
- 删除资源、重命名资源或修改公开权限
- 自动批量申请权限
- 把无权限或无法验证的资源加入移动计划
- 把移动权限未知或不具备移动资格的资源加入移动计划

如果用户明确要求把结果写入 Sheet / Doc，切到对应专项能力；本 workflow 的默认产物是移动后的资源归档结果。

## Agent 执行约束

触发本 workflow 后，agent 必须：

1. 按“执行状态机”的顺序执行。
2. 维护“运行时状态”中的字段。
3. 执行某个状态前，先读取本文档 `## 渐进加载关系` 表格中该状态对应的文档。
4. 用户可见说明、字段说明和 UI 文案使用中文。
5. 状态名、字段名、枚举值、命令名保留英文稳定标识。
6. 将 `CONFIRM_CONTEXT` 和 `CONFIRM_EXECUTION` 作为强用户确认门：前者确认主题、目标位置、身份、搜索范围、可选限制和目标解析结果后才能搜索；后者确认创建目标和移动资源后才能写入。
7. 进入 `EXECUTE` 前，不得创建目标文件夹 / 节点，也不得移动资源。
8. 必须展示每个相关性分组中的资源名称；低置信分组可以折叠，但必须可查看。
9. 默认只移动 `high` 相关资源；`medium` 资源必须由用户显式选择。
10. 即使用户可见列表分页展示，也必须维护完整内部状态。
11. `RESOURCE_RESOLVE` 和 `CONTENT_VERIFY` 是两个独立的强制阶段，不得合并；不得用搜索结果、标题或摘要直接替代 `CONTENT_VERIFY`，也不得从 `RESOURCE_RESOLVE` 直接进入 `RELEVANCE_CLASSIFY`。
12. 触发后锁定 `workflow_id=topic_move_collector`；执行期间不得自动切换到其他 workflow。
13. 如果认为需要切换 workflow，必须停止并向用户说明原因，等待用户确认。
14. `RESOURCE_RESOLVE` 是移动资格门禁；只有确认 `move_permission_state=movable` 且 `target_write_state=confirmed` 的资源才能进入默认移动链路。

## 用户展示 UI 规则

所有用户可见 UI 都必须包含：

1. 已经完成的关键结果。
2. 下一步会做什么，以及是否会产生写操作。
3. 如果 `wait_for_user=true`，明确告诉用户可以选择的动作。
4. 如果无需用户操作，明确说明将继续执行，避免用户误以为流程停住。

典型动作包括：确认继续、修改主题 / 目标 / 限制、展开更多结果、调整相关性分组、选择中相关资源、确认执行、取消执行。

## 职责边界

| 文件 | 负责 | 不负责 |
|------|------|--------------|
| `lark-drive-workflow-topic-move-collector.md` | 触发规则、全局约束、状态机、渐进加载关系、命令族白名单 | 具体阶段规则、UI 模板、执行细节 |
| `lark-drive-workflow-topic-move-collector-setup.md` | `PARSE_INPUT`、`RESOLVE_TARGET`、`CONFIRM_CONTEXT`、`TargetLocation` | 搜索执行、相关性分类、写操作 |
| `lark-drive-workflow-topic-move-collector-recall.md` | `SEARCH_RECALL`、`RECALL_ENHANCE`、搜索 query 策略、去重、`CandidateItem` | 资源 token 解析、内容验证、写操作 |
| `lark-drive-workflow-topic-move-collector-resolve-verify.md` | `RESOURCE_RESOLVE`、`CONTENT_VERIFY`、权限矩阵、`ResourceItem` | 相关性分类、移动计划、写操作 |
| `lark-drive-workflow-topic-move-collector-review-plan.md` | `RELEVANCE_CLASSIFY`、`PLAN_MOVE`、`MovePlanItem`、展示分组 | 资源解析、内容验证、写操作执行、恢复 |
| `lark-drive-workflow-topic-move-collector-execute.md` | `CONFIRM_EXECUTION`、`EXECUTE`、`VERIFY`、`RESTORE`、`RollbackSnapshotItem`、执行日志 | 搜索、分类和计划 schema |

## 运行时状态

本 workflow 扩展共享 Artifact Contract。agent 在一次 workflow 运行中必须维护以下专项内部字段：

| 字段 | 说明 |
|-------|------|
| `current_state` | 当前状态机节点。 |
| `topic` | 用户确认后的主题、关键词、同义词和排除词。 |
| `target_location` | 目标位置解析结果，见 setup 文件的 `TargetLocation`。 |
| `identity` | 执行身份；默认优先 `--as user`。 |
| `owner_scope` | 搜索 owner 范围；默认 `mine`，仅搜索当前用户 owner / 负责的资源；用户明确要求扩展时才为 `all_visible`。 |
| `constraints` | 用户显式确认的类型、时间、创建人、范围等限制。 |
| `allow_cross_container_move` | 是否允许跨 Drive / Wiki 容器移动；默认允许，但必须展示给用户确认。 |
| `recall_query_states` | 每个基础 / 增强 query 的分页状态、累计页数、`next_page_token`、`has_more`、完成或阻塞状态。 |
| `candidate_items` | 搜索召回结果，包含 query 证据和去重信息。 |
| `resource_items` | 解析后的标准资源列表。 |
| `content_verify_completed` | 内容验证阶段完成标记；`resource_items` 新建或变化时重置为 `false`，只有全部资源都有验证状态或跳过原因后才设为 `true`。 |
| `relevance_groups` | 高相关、中相关、低相关、无权限、无移动权限、移动权限未知、无法验证、不可移动分组。 |
| `move_plan_items` | 经用户选择后生成的完整移动计划，包含稳定资源关联、不可变命令参数、权限快照和恢复输入。 |
| `execution_journal` | 写操作日志，用于验证和恢复。 |
| `rollback_snapshot` | 写操作前位置快照，仅用于失败恢复或用户要求恢复。 |
| `display_page_state` | 用户可见列表的分页、筛选和展开状态。 |

## 执行状态机

| 状态 | Protocol Step | 进入条件 | agent 必须执行 | 用户可见输出 | `wait_for_user` | 下一状态 |
|-------|---------------|-----------------|---------------|--------------------|---------------|------------|
| `PARSE_INPUT` | `route` / `scope` | workflow 被触发 | 加载 setup 文档；解析主题、目标、身份和限制 | 澄清问题或解析摘要 | 必填字段缺失时为 `true` | `RESOLVE_TARGET` |
| `RESOLVE_TARGET` | `scope` | 主题和目标已获得 | 解析已有目标，或解析待创建目标；按解析状态分流 | 目标解析结果或 blocker | 非 `resolved` 时为 `true` | `resolved` 时进入 `CONFIRM_CONTEXT`；否则保持本状态 |
| `CONFIRM_CONTEXT` | `scope` | `target_resolve_status=resolved` | 展示主题、目标、身份、限制和跨容器设置 | 搜索前确认 UI | `true` | `SEARCH_RECALL` |
| `SEARCH_RECALL` | `read` | 用户确认上下文 | 用原始关键词、默认 owner 范围和显式限制执行基础召回；按每批最多 5 页自动续批 | 搜索进度 / 基础统计 | 阻塞时为 `true` | 所有基础 query 完成后进入 `RECALL_ENHANCE` |
| `RECALL_ENHANCE` | `read` | 所有基础 query 已完成 | 执行覆盖增强 query，按每批最多 5 页自动续批并合并结果 | 增强召回摘要 | 阻塞时为 `true` | 所有增强 query 完成后进入 `RESOURCE_RESOLVE` |
| `RESOURCE_RESOLVE` | `read` | 候选列表已准备 | 解析 token、类型、父级位置、owner 和移动资格 | 解析进度 / 阻塞摘要 | 阻塞时为 `true` | `CONTENT_VERIFY` |
| `CONTENT_VERIFY` | `read` | 资源列表已准备 | 对支持的资源做有界内容读取，并为其余资源写入跳过原因 | 验证进度 / 验证摘要 | 阻塞时为 `true` | `RELEVANCE_CLASSIFY` |
| `RELEVANCE_CLASSIFY` | `assess` | 证据已准备 | 按相关性和可执行性分组 | 分组结果列表 | `false` | `PLAN_MOVE` |
| `PLAN_MOVE` | `assess` / `plan` | 分组完成 | 基于默认规则和用户可选项生成移动计划 | 草案计划和选择项 | `true` | `CONFIRM_EXECUTION` |
| `CONFIRM_EXECUTION` | `confirm` | 用户要求执行 | 展示创建、移动、跳过项和风险 | 写操作确认 UI | `true` | `EXECUTE` 或 `PLAN_MOVE` 或 `DONE` |
| `EXECUTE` | `execute` | 用户明确确认写操作 | 需要时先创建目标，再移动确认资源 | 执行进度 | 阻塞时为 `true` | `VERIFY` 或 `RESTORE` |
| `VERIFY` | `verify` | 执行完成 | 验证目标位置下的移动结果 | 验证结果 | 提供恢复选项时为 `true` | `DONE` 或 `RESTORE` |
| `RESTORE` | `recovery confirm` / `recovery execute` | 用户要求恢复 | 仅基于快照和日志恢复 | 恢复确认 / 结果 | 写操作前为 `true` | `VERIFY` 或 `DONE` |
| `DONE` | `done` | 无后续操作 | 停止 | 最终回复 | `false` | 结束 |

### 状态跳转硬约束

1. `RESOLVE_TARGET` 只有在 `target_resolve_status=resolved` 时才能进入 `CONFIRM_CONTEXT`；`ambiguous`、`unsupported` 或 `permission_denied` 必须保持在 `RESOLVE_TARGET` 并等待用户选择、更换目标或结束。
2. `SEARCH_RECALL` 只有在全部基础 query 的 `has_more=false` 时才能进入 `RECALL_ENHANCE`；单批达到 5 页但仍有更多结果时必须自动续批，不得提前跳转。
3. `RECALL_ENHANCE` 只有在全部增强 query 的 `has_more=false` 时才能进入 `RESOURCE_RESOLVE`；不得直接进入 `RELEVANCE_CLASSIFY` 或 `PLAN_MOVE`。
4. `RESOURCE_RESOLVE` 必须为每个 `CandidateItem` 生成对应的 `ResourceItem`，或生成明确的解析失败 / 权限受限状态。
5. `RESOURCE_RESOLVE` 必须为每个 `ResourceItem` 写入 `move_permission_state` 和 `move_permission_basis`；完成后将 `content_verify_completed=false`，下一状态只能是 `CONTENT_VERIFY`。
6. 禁止从 `RESOURCE_RESOLVE` 直接进入 `RELEVANCE_CLASSIFY`。即使没有任何资源可以读取正文，也必须进入 `CONTENT_VERIFY`，为每项写入验证状态或跳过原因并输出验证摘要。
7. `CONTENT_VERIFY` 必须为每个 `ResourceItem` 写入内容证据、搜索证据复用说明，或不可验证原因；移动权限未知或无移动权限的资源可以只写入跳过验证原因。
8. 只有当 `resource_items` 已准备、每项都有验证状态或跳过原因，且 `content_verify_completed=true` 时，才能进入 `RELEVANCE_CLASSIFY`。
9. 用户调整相关性分组后，必须回到 `RELEVANCE_CLASSIFY` 输出调整后的分组结果，再进入 `PLAN_MOVE` 重新生成计划。

### Workflow 切换门禁

只有以下情况允许考虑切换 workflow：

1. 用户明确说不再做主题资料收集，改为整理整个目录结构或生成盘点方案。
2. 当前 workflow 明确无法覆盖用户的新目标。
3. 用户要求的是目录结构治理，而不是查找主题相关资料并移动。

即使满足以上条件，也不得自动切换；必须先向用户说明原因并等待确认。

## 渐进加载关系

| 状态 | 必读文档 |
|-------|---------------|
| `PARSE_INPUT` / `RESOLVE_TARGET` / `CONFIRM_CONTEXT` | [`lark-drive-workflow-topic-move-collector-setup.md`](lark-drive-0.md#s-7a834241a1ae0cb7) |
| `SEARCH_RECALL` / `RECALL_ENHANCE` | [`lark-drive-workflow-topic-move-collector-recall.md`](lark-drive-0.md#s-f856f016134a4f22) |
| `RESOURCE_RESOLVE` / `CONTENT_VERIFY` | [`lark-drive-workflow-topic-move-collector-resolve-verify.md`](lark-drive-0.md#s-f95e0f2d7b19b091) |
| `RELEVANCE_CLASSIFY` / `PLAN_MOVE` | [`lark-drive-workflow-topic-move-collector-review-plan.md`](lark-drive-0.md#s-9833aac2320c7b42) |
| `CONFIRM_EXECUTION` / `EXECUTE` / `VERIFY` / `RESTORE` | [`lark-drive-workflow-topic-move-collector-execute.md`](lark-drive-0.md#s-58c1ba1f7a6bd6c7) |

## 命令映射

| 状态 | 允许的命令族 | 用途 |
|-------|--------------------------|---------|
| `RESOLVE_TARGET` | `drive +inspect`、`wiki +node-get`、`wiki +space-list`、仅用于查找文件夹候选的 `drive +search` | 解析目标位置 |
| `SEARCH_RECALL` / `RECALL_ENHANCE` | `drive +search` | 搜索召回和覆盖增强 |
| `RESOURCE_RESOLVE` | `drive +inspect`、`wiki +node-get`、`drive metas batch_query`、必要时 `drive permission.members auth` | 解析标准 token、owner、权限信号和移动资格 |
| `CONTENT_VERIFY` | `docs +fetch`、`sheets +cells-get`、`sheets +cells-search`、必要时 `drive +preview` | 验证内容证据 |
| `EXECUTE` | `drive +create-folder`、`wiki +node-create`、`drive +move`、`wiki +move`、`wiki +move-to-drive`、`drive +task_result` | 执行已确认写操作 |
| `VERIFY` | `drive files list`、`wiki +node-list`、`wiki +node-get`、`drive +inspect`、`drive +task_result` | 验证执行结果 |
| `RESTORE` | `drive +move`、`wiki +move`、`drive +delete`、`wiki +node-delete`、`drive +task_result` | 恢复已确认资源并清理本次新建目标 |

## 引用文档

- [输入与目标确认](lark-drive-0.md#s-7a834241a1ae0cb7)
- [召回](lark-drive-0.md#s-f856f016134a4f22)
- [资源解析与内容验证](lark-drive-0.md#s-f95e0f2d7b19b091)
- [审核与计划](lark-drive-0.md#s-9833aac2320c7b42)
- [执行](lark-drive-0.md#s-58c1ba1f7a6bd6c7)
- [lark-drive-search](lark-drive-0.md#s-cd3b5c8a483e06d9)
- [lark-drive-inspect](lark-drive-0.md#s-7e20781df311b587)
- [lark-drive-move](lark-drive-0.md#s-385feb5ed1a01e57)
- [lark-drive-create-folder](lark-drive-0.md#s-47844aa3761af3a5)
- [lark-drive-delete](lark-drive-0.md#s-0dd3b34e8e162f23)
- [lark-wiki-move](lark-wiki-0.md#s-c6dffcf181e680d0)
- [lark-wiki-move-to-drive](lark-wiki-0.md#s-9aa6007c9609b1f7)
- [lark-wiki-node-create](lark-wiki-0.md#s-502a3956dd387b13)
- [lark-wiki-node-delete](lark-wiki-0.md#s-b9e78f1d6ed0d089)


<a id="s-377eef44e820cfad"></a>

## references/lark-drive-workflow.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# lark-drive Workflow 总框架

本文是 `lark-drive` workflow 总框架的运行协议和注册表。它面向 AI Agent 执行，只负责路由已纳入本总框架的 workflow。

`Workflow Registry` 是本总框架的唯一注册来源。未命中 registry 的请求必须按“未注册 workflow 处理”执行，不要按已有 workflow 类推扩展。

## 必读上下文

执行本总框架内的 workflow 前，必须先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

下游 reference 只能按需逐步加载。不要因为命中本总框架，就预加载所有 workflow 文件或相关 skill。

## 能力边界

`lark-drive` workflow 总框架以 `lark-drive` 作为 Drive / Docs / Wiki 资产编排的总入口。其他领域 skill 只有在已纳入本总框架的 workflow 明确需要时，才作为辅助能力加载。

| Layer | Owns | Must Not Own |
|-------|------|--------------|
| `lark-drive/SKILL.md` | 用户意图到具体 workflow entry 的短路由 | 长流程逻辑、未注册场景 |
| `lark-drive-workflow.md` | 共享运行协议、Artifact Contract、Workflow Registry、加载规则 | 非运行时背景说明、宽泛路线图、场景专项执行细节 |
| Registered workflow file | 场景范围、状态机、Command Map、确认门槛、验证规则 | 其他场景、隐藏写入、未被 CLI/API 支持的能力声明 |

## 执行协议

每个已纳入本总框架的 workflow 必须遵循同一条执行骨架：

```text
route -> scope -> read -> assess/plan -> confirm -> execute -> verify -> done
```

运行规则：

1. 在读取或写入资产前，先把用户意图解析到唯一一个已纳入本总框架的 workflow。
2. 在昂贵读取或写入规划前，先解析并确认 `target_scope`。
3. 事实必须来自可执行 CLI 命令或被引用 skill；不要只凭目录结构推断治理结论。
4. 无法执行的检查必须记录到 `unsupported_checks`，不能静默省略。
5. 写入前必须产出计划。每一次写入都需要用户对准确范围和 command family 显式确认。
6. CLI/API 支持验证时，写入后必须用 fresh read 验证。
7. 结束时进入 `done`，返回已完成事项、验证结果和剩余限制。不要把尚未完成的外部审批描述成已完成。

## Artifact Contract

每个已纳入本总框架的 workflow 必须维护以下内部字段：

| Field | Meaning |
|-------|---------|
| `workflow_id` | 本总框架注册的 workflow 名称，例如 `permission_governance` |
| `current_state` | 当前 workflow 状态 |
| `target_scope` | 已确认的目标范围和用户原始输入 |
| `identity` | 当前身份和执行视角，通常为 `user` |
| `facts` | 从 CLI 读取或引用 skill 获取的证据 |
| `plan_items` | 候选动作；每项包含 command family、target、risk、verification method |
| `unsupported_checks` | 因 CLI/API 覆盖、目标类型、认证或范围限制而无法执行的检查 |
| `partial` | 结果是否不完整，以及不完整原因 |
| `execution_results` | 已确认写入的执行结果 |
| `verification_results` | fresh read 验证结果，或明确的异步审批限制 |

用户可见输出默认使用简洁 chat summary。只有在用户要求、结果过大不适合聊天展示，或当前 workflow 明确要求共享产物时，才创建本地文件或飞书文档。

## Workflow Entry Contract

每个已纳入本总框架的 workflow entry file 必须让 Agent 能直接判断和执行：

- 何时进入该 workflow，以及哪些需求不属于该 workflow；
- 如何映射到共享执行骨架的 state machine；
- 当前 state 需要按需加载哪些 reference；
- 哪些 command family 可用，以及读写风险边界；
- 写入前如何确认，写入后如何验证；
- 最终回复必须包含哪些字段，或使用哪些 output templates。

每个纳入本总框架的 workflow 默认从一个独立 reference 文件开始。只有当写入、回滚或验证流程复杂到影响可读性时，才继续拆 phase 文件。

## Risk / Structure Gate

每个纳入本总框架的 workflow 都必须同时声明 `Risk Level` 和 `Structure Level`。风险等级决定安全门槛；结构等级决定文件拆分。高风险写入不等于必须拆 phase。

Risk Level：

| Level | Meaning | Runtime Requirement |
|-------|---------|---------------------|
| `R0` | read-only：只读发现、分析、报告 | 记录事实来源、`unsupported_checks` 和 `partial` 原因 |
| `R1` | low-risk write：创建草稿、生成临时产物等低风险写入 | 写前说明范围，写后返回结果链接或标识 |
| `R2` | high-risk write：权限变更、批量移动、标签修改等高风险写入 | 写前计划、准确 diff、用户显式确认、fresh read 验证 |
| `R3` | destructive / recovery-sensitive write：删除、自动归档、双向同步、rollback cleanup | 恢复边界、执行日志、分批策略、失败停止条件和单独确认 |

Structure Level：

| Level | File Shape | When To Use |
|-------|------------|-------------|
| `S1` | compact entry only | 只读、轻量审计、简单计划，无复杂写入 |
| `S2` | entry + optional `commands` / `outputs` / `artifacts` references | 有命令样例、输出模板、少量高风险写入，但状态链可集中表达 |
| `S3` | entry + phase files + optional shared references | 多阶段写入、复杂验证、恢复 / rollback、长任务或分批执行 |

升级规则：

1. 新 workflow 默认从 `S1` 开始。
2. Entry file 超过约 300 行时，优先拆 `commands`、`outputs` 或 `artifacts` reference。
3. 只有执行、验证、恢复或 rollback 状态链复杂到影响可读性时，才升级到 `S3` phase files。
4. 垂直业务包优先作为已有 workflow 的 recipe / policy / template，不默认新增独立 workflow。
5. 已有样板：`permission_governance` 是 `R2/S2`；`knowledge_organize` 和 `topic_move_collector` 是 `R2-R3/S3`。

## 加载与拆分边界

- 每个纳入本总框架的场景默认只保留一个紧凑 workflow entry file。
- 不为未注册或未来场景创建占位 reference / registry entry。
- 只有 workflow 已经具备可执行规则时，才允许作为本总框架 workflow 出现在 `SKILL.md` 并加入 `Workflow Registry`。
- 多文件 phase 拆分只用于执行、回滚或验证流程复杂到影响可读性的 `S3` 场景。

## Workflow Registry

| Workflow | Status | Risk | Structure | Entry File | Trigger                                                         |
|----------|--------|------|-----------|------------|-----------------------------------------------------------------|
| `permission_governance` | Registered | `R2` | `S2` | [`lark-drive-workflow-permission-governance.md`](lark-drive-0.md#s-15bd7bdf6ce4606c) | 权限审计、公开链接/外部访问、复制/下载/评论/分享设置、权限申请、owner 转移 / 批量 owner 转移、密级标签调整 |
| `knowledge_organize` | Registered | `R2-R3` | `S3` | [`lark-drive-workflow-knowledge-organize.md`](lark-drive-0.md#s-21e19860bee6e319) | 整理云盘 / 文件夹 / 文档库 / 知识库、盘点目录结构、归类资源、生成整理方案，并在用户确认后创建目录或移动资源      |
| `topic_move_collector` | Registered | `R2-R3` | `S3` | [`lark-drive-workflow-topic-move-collector.md`](lark-drive-0.md#s-6ce8e611996d89c6) | 按主题、关键词或内容线索跨容器搜索资料，验证相关性和移动资格，并在用户确认后归档到 Drive 文件夹或 Wiki 节点    |

## Workflow Loading

当用户意图匹配到本总框架已注册 workflow 时：

1. 先读取本总框架文件。
2. 只读取 `Workflow Registry` 中命中的 entry file。
3. 按该 workflow 的 progressive load map 继续加载额外 reference。
4. 除非用户改变意图，或当前 workflow 明确路由到其他 workflow，否则不要读取其他 workflow 文件。

## 未注册 workflow 处理

`Workflow Registry` 是本总框架的唯一注册来源。用户请求未列入 registry 的 workflow 或组合型治理场景时：

1. 明确说明该需求暂无纳入本总框架的 `lark-drive` workflow。
2. 只在不新增本总框架 workflow 行为的前提下，将请求收窄为现有 skill / CLI 可执行的原子操作。
3. 不要类比本总框架任何已注册 workflow 新增 state machine、artifact shape、风险分类、写入行为或验证结论。


<a id="s-4e8deadf354189d0"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `drive.v1.exportTask.create` | [Feishu/Lark]-云文档-云空间-文件-导出云文档-创建导出任务-该接口用于创建导出文件的任务，并返回导出任务 ID。导出文件指将飞书文档、电子表格、多维表格导出为本地文件，包括 Word、Excel、PDF、CSV 格式。该接口为异步接口，需要继续调用[查询导出任务结果]接口获取导出结果。了解完整的导出步骤，参考[导出云文档概述] | feishu_call_tool |
| `drive.v1.exportTask.get` | [Feishu/Lark]-云文档-云空间-文件-导出云文档-查询导出任务结果-根据[创建导出任务]返回的导出任务 ID（ticket）轮询导出任务结果，并返回导出文件的 token。你可使用该 token 继续调用[下载导出文件]接口将导出的产物下载到本地。了解完整的导出文件步骤，参考[导出飞书云文档概述] | feishu_read_tool |
| `drive.v1.fileComment.batchQuery` | [Feishu/Lark]-云文档-评论-批量获取评论-该接口用于根据评论 ID 列表批量获取云文档评论信息，包括评论和回复 ID、回复的内容、评论人和回复人的用户 ID 等。支持返回全局评论以及局部评论（可通过 is_whole 字段区分） | feishu_call_tool |
| `drive.v1.fileComment.create` | [Feishu/Lark]-云文档-评论-添加全文评论-在文档中添加一条全局评论，不支持局部评论 | feishu_call_tool |
| `drive.v1.fileComment.get` | [Feishu/Lark]-云文档-评论-获取全文评论-获取云文档中的某条全文评论，不支持局部评论 | feishu_read_tool |
| `drive.v1.fileComment.list` | [Feishu/Lark]-云文档-评论-获取云文档所有评论-该接口用于根据云文档 Token 分页获取文档所有评论信息，包括评论和回复 ID、回复的内容、评论人和回复人的用户 ID 等。该接口支持返回全局评论以及局部评论（可通过 is_whole 字段区分）。默认每页返回 50 个评论 | feishu_read_tool |
| `drive.v1.fileComment.patch` | [Feishu/Lark]-云文档-评论-解决/恢复评论-解决或恢复云文档中的评论 | feishu_call_tool |
| `drive.v1.fileCommentReply.delete` | [Feishu/Lark]-云文档-评论-删除回复-删除云文档中的某条回复 | feishu_call_tool |
| `drive.v1.fileCommentReply.list` | [Feishu/Lark]-云文档-评论-获取回复信息-该接口用于根据评论 ID，获取该条评论对应的回复信息，包括回复 ID、回复内容、回复人的用户 ID 等 | feishu_read_tool |
| `drive.v1.fileCommentReply.update` | [Feishu/Lark]-云文档-评论-更新回复的内容-更新云文档中的某条回复的内容 | feishu_call_tool |
| `drive.v1.file.copy` | [Feishu/Lark]-云文档-云空间-文件-复制文件-将用户云空间中的文件复制至其它文件夹下。该接口为异步接口 | feishu_call_tool |
| `drive.v1.file.createFolder` | [Feishu/Lark]-云文档-云空间-文件夹-新建文件夹-该接口用于在用户云空间指定文件夹中创建一个空文件夹 | feishu_call_tool |
| `drive.v1.file.createShortcut` | [Feishu/Lark]-云文档-云空间-文件-创建文件快捷方式-创建指定文件的快捷方式到云空间的其它文件夹中 | feishu_call_tool |
| `drive.v1.file.delete` | [Feishu/Lark]-云文档-云空间-文件-删除文件或文件夹-删除用户在云空间内的文件或者文件夹。文件或文件夹被删除后，会进入回收站中 | feishu_call_tool |
| `drive.v1.file.deleteSubscribe` | [Feishu/Lark]-云文档-云空间-事件-取消云文档事件订阅-该接口用于取消订阅云文档的通知事件。了解事件订阅的配置流程和使用场景，参考[事件概述]。了解云文档支持的事件类型，参考[事件列表] | feishu_call_tool |
| `drive.v1.file.getSubscribe` | [Feishu/Lark]-云文档-云空间-事件-查询云文档事件订阅状态-该接口用于查询云文档事件的订阅状态。了解事件订阅的配置流程和使用场景，参考[事件概述]。了解云文档支持的事件类型，参考[事件列表] | feishu_read_tool |
| `drive.v1.file.list` | [Feishu/Lark]-云文档-云空间-文件夹-获取文件夹中的文件清单-该接口用于获取用户云空间指定文件夹中文件信息清单。文件的信息包括名称、类型、token、创建时间、所有者 ID 等 | feishu_read_tool |
| `drive.v1.file.move` | [Feishu/Lark]-云文档-云空间-文件-移动文件或文件夹-将文件或者文件夹移动到用户云空间的其他位置 | feishu_call_tool |
| `drive.v1.fileStatistics.get` | [Feishu/Lark]-云文档-云空间-文件-获取文件统计信息-此接口用于获取各类文件的流量统计信息和互动信息，包括阅读人数、阅读次数和点赞数 | feishu_read_tool |
| `drive.v1.file.subscribe` | [Feishu/Lark]-云文档-云空间-事件-订阅云文档事件-订阅云文档的各类通知事件。调用该接口并在开发者后台添加事件后，当云文档发生指定事件时，系统会向配置的地址发送事件 | feishu_call_tool |
| `drive.v1.fileSubscription.create` | [Feishu/Lark]-云文档-云文档助手-订阅-创建订阅-订阅文档中的变更事件，当前支持文档评论订阅，订阅后文档评论更新会有“云文档助手”推送给订阅的用户 | feishu_call_tool |
| `drive.v1.fileSubscription.get` | [Feishu/Lark]-云文档-云文档助手-订阅-获取订阅状态-根据订阅ID获取该订阅的状态 | feishu_read_tool |
| `drive.v1.fileSubscription.patch` | [Feishu/Lark]-云文档-云文档助手-订阅-更新订阅状态-根据订阅ID更新订阅状态 | feishu_call_tool |
| `drive.v1.file.taskCheck` | [Feishu/Lark]-云文档-云空间-文件夹-查询异步任务状态-查询异步任务的状态信息。目前支持查询删除文件夹和移动文件夹的异步任务 | feishu_read_tool |
| `drive.v1.file.uploadFinish` | [Feishu/Lark]-云文档-云空间-文件-上传文件-分片上传文件-分片上传文件-完成上传-调用[上传分片]接口将分片全部上传完毕后，你需调用本接口触发完成上传。否则将上传失败。了解完整的上传文件流程，参考[上传文件概述] | feishu_call_tool |
| `drive.v1.file.uploadPrepare` | [Feishu/Lark]-云文档-云空间-文件-上传文件-分片上传文件-分片上传文件-预上传-发送初始化请求，以获取上传事务 ID 和分片策略，为[上传分片]做准备。平台固定以 4MB 的大小对文件进行分片。了解完整的上传文件流程，参考[上传文件概述] | feishu_call_tool |
| `drive.v1.fileVersion.create` | [Feishu/Lark]-云文档-云空间-文档版本-创建文档版本-创建文档版本。文档支持在线文档或电子表格。该接口为异步接口 | feishu_call_tool |
| `drive.v1.fileVersion.delete` | [Feishu/Lark]-云文档-云空间-文档版本-删除文档版本-删除基于在线文档或电子表格创建的版本 | feishu_call_tool |
| `drive.v1.fileVersion.get` | [Feishu/Lark]-云文档-云空间-文档版本-获取文档版本信息-该接口用于获取文档或电子表格指定版本的信息，包括标题、标识、创建者、创建时间等 | feishu_read_tool |
| `drive.v1.fileVersion.list` | [Feishu/Lark]-云文档-云空间-文档版本-获取文档版本列表-获取文档或电子表格的版本列表 | feishu_read_tool |
| `drive.v1.fileViewRecord.list` | [Feishu/Lark]-云文档-云空间-文件-获取文件访问记录-获取文档、电子表格、多维表格等文件的历史访问记录，包括访问者的 ID、姓名、头像和最近访问时间 | feishu_read_tool |
| `drive.v1.importTask.create` | [Feishu/Lark]-云文档-云空间-文件-导入文件-创建导入任务-该接口用于创建导入文件的任务，并返回导入任务 ID。导入文件指将本地文件如 Word、TXT、Markdown、Excel 等格式的文件导入为某种格式的飞书在线云文档。该接口为异步接口，需要继续调用[查询导入任务结果]接口获取导入结果。了解完整的导入文件步骤，参考[导入文件概述] | feishu_call_tool |
| `drive.v1.importTask.get` | [Feishu/Lark]-云文档-云空间-文件-导入文件-查询导入任务结果-根据[创建导入任务]返回的导入任务 ID（ticket）轮询导入结果。了解完整的导入文件步骤，参考[导入文件概述] | feishu_read_tool |
| `drive.v1.media.batchGetTmpDownloadUrl` | [Feishu/Lark]-云文档-云空间-素材-获取素材临时下载链接-该接口用于获取云文档中素材的临时下载链接。链接的有效期为 24 小时，过期失效 | feishu_read_tool |
| `drive.v1.media.uploadFinish` | [Feishu/Lark]-云文档-云空间-素材-上传素材-分片上传素材-完成上传-调用[上传分片]接口将分片全部上传完毕后，你需调用本接口触发完成上传。了解完整的分片上传素材流程，参考[素材概述] | feishu_call_tool |
| `drive.v1.media.uploadPrepare` | [Feishu/Lark]-云文档-云空间-素材-上传素材-分片上传素材-预上传-发送初始化请求，以获取上传事务 ID 和分片策略，为[上传素材分片]做准备。平台固定以 4MB 的大小对素材进行分片。了解完整的分片上传素材流程，参考[素材概述] | feishu_call_tool |
| `drive.v1.meta.batchQuery` | [Feishu/Lark]-云文档-云空间-文件-获取文件元数据-该接口用于根据文件 token 获取其元数据，包括标题、所有者、创建时间、密级、访问链接等数据 | feishu_call_tool |
| `drive.v1.permissionMember.auth` | [Feishu/Lark]-云文档-权限-成员-判断用户云文档权限-判断当前请求的应用或用户是否具有指定云文档的指定权限，权限包括阅读、编辑、分享、评论、导出等权限 | feishu_read_tool |
| `drive.v1.permissionMember.batchCreate` | [Feishu/Lark]-云文档-权限-成员-批量增加协作者权限-为指定云文档批量添加多个协作者，协作者可以是用户、群组、部门、用户组等 | feishu_call_tool |
| `drive.v1.permissionMember.create` | [Feishu/Lark]-云文档-权限-成员-增加协作者权限-为指定云文档添加协作者，协作者可以是用户、群组、部门、用户组等 | feishu_call_tool |
| `drive.v1.permissionMember.delete` | [Feishu/Lark]-云文档-权限-成员-移除云文档协作者权限-通过云文档 token 和协作者 ID 移除指定云文档协作者的权限 | feishu_call_tool |
| `drive.v1.permissionMember.list` | [Feishu/Lark]-云文档-权限-成员-获取云文档协作者-获取指定云文档的协作者，支持查询人、群、组织架构、用户组、知识库成员五种类型的协作者 | feishu_read_tool |
| `drive.v1.permissionMember.transferOwner` | [Feishu/Lark]-云文档-权限-成员-转移云文档所有者-转移指定云文档的所有者 | feishu_call_tool |
| `drive.v1.permissionMember.update` | [Feishu/Lark]-云文档-权限-成员-更新协作者权限-更新指定云文档中指定协作者的权限，包括可阅读、可编辑、可管理权限 | feishu_call_tool |
| `drive.v1.permissionPublic.get` | [Feishu/Lark]-历史版本（不推荐）-云文档-权限设置 v1-获取云文档权限设置-获取指定云文档的权限设置，包括是否允许内容被分享到组织外、谁可以查看、添加、移除协作者等设置 | feishu_read_tool |
| `drive.v1.permissionPublicPassword.create` | [Feishu/Lark]-云文档-权限-密码-启用云文档密码-启用指定云文档的密码。密码启用后，组织外用户需要密码访问，组织内用户无需密码可直接访问 | feishu_call_tool |
| `drive.v1.permissionPublicPassword.delete` | [Feishu/Lark]-云文档-权限-密码-停用云文档密码-停用指定云文档的密码。密码停用后，组织外用户访问文档将无需输入密码 | feishu_call_tool |
| `drive.v1.permissionPublicPassword.update` | [Feishu/Lark]-云文档-权限-密码-刷新云文档密码-刷新指定云文档的密码。密码刷新后，旧密码将失效，并生成新密码 | feishu_call_tool |
| `drive.v1.permissionPublic.patch` | [Feishu/Lark]-历史版本（不推荐）-云文档-权限设置 v1-更新云文档权限设置-更新指定云文档的权限设置，包括是否允许内容被分享到组织外、谁可以查看、添加、移除协作者、谁可以复制内容等设置 | feishu_call_tool |
| `drive.v2.fileLike.list` | [Feishu/Lark]-云文档-云空间-点赞-获取云文档的点赞者列表-获取指定云文档的点赞者列表并按点赞时间由近到远分页返回 | feishu_read_tool |
| `drive.v2.permissionPublic.get` | [Feishu/Lark]-云文档-权限-设置-获取云文档权限设置-获取指定云文档的权限设置，包括是否允许内容被分享到组织外、谁可以查看、添加、移除协作者、谁可以复制内容等设置 | feishu_read_tool |
| `drive.v2.permissionPublic.patch` | [Feishu/Lark]-云文档-权限-设置-更新云文档权限设置-更新指定云文档的权限设置，包括是否允许内容被分享到组织外、谁可以查看、添加、移除协作者、谁可以复制内容等设置 | feishu_call_tool |
| `cli.drive.files.copy` | Copy a file | feishu_call_tool |
| `cli.drive.files.create_folder` | Create Folder | feishu_call_tool |
| `cli.drive.files.list` | List items in folder | feishu_read_tool |
| `cli.drive.files.patch` |  | feishu_call_tool |
| `cli.drive.file.comments.batch_query` | Batch Query Comments | feishu_read_tool |
| `cli.drive.file.comments.create_v2` | 开放平台：添加评论(V2) | feishu_call_tool |
| `cli.drive.file.comments.list` | Get Document Comments in Pages | feishu_read_tool |
| `cli.drive.file.comments.patch` | Solve or Restore a Comment | feishu_call_tool |
| `cli.drive.file.comment.replys.create` | Add Reply | feishu_call_tool |
| `cli.drive.file.comment.replys.delete` | Delete Reply | feishu_call_tool |
| `cli.drive.file.comment.replys.list` | Get Replies List | feishu_read_tool |
| `cli.drive.file.comment.replys.update` | Update Reply | feishu_call_tool |
| `cli.drive.permission.members.auth` | Check whether the current user has a specific permission | feishu_read_tool |
| `cli.drive.permission.members.create` | Add permissions | feishu_call_tool |
| `cli.drive.permission.members.transfer_owner` | Transfer owner | feishu_call_tool |
| `cli.drive.permission.public.get` | Get cloud document permission settings | feishu_read_tool |
| `cli.drive.permission.public.patch` | Update common settings of a document | feishu_call_tool |
| `cli.drive.metas.batch_query` | Obtain metadata | feishu_read_tool |
| `cli.drive.user.remove_subscription` | Cancel User Subscription to Cloud Document Events | feishu_call_tool |
| `cli.drive.user.subscription` | Subscribe to User Cloud Document Events | feishu_call_tool |
| `cli.drive.user.subscription_status` | Query the Subscription Status of User Cloud Document Events | feishu_read_tool |
| `cli.drive.file.statistics.get` | Obtain file's statistics | feishu_read_tool |
| `cli.drive.file.view_records.list` | Obtain file view records | feishu_read_tool |
| `cli.drive.file.comment.reply.reactions.update_reaction` | Add/Cancel Emoji Response | feishu_call_tool |
| `cli.drive.quota_details.get` | 获取当前用户的容量信息，包含各业务使用量、租户配额是否超限、用户配额、所在部门配额 | feishu_read_tool |


<a id="s-69fe0d064273f97c"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# drive (v1)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理**

> **术语说明：** 飞书云空间也常被称为"云盘"、"云存储"、"网盘"或"我的空间"，这些说法通常指的是同一个产品，是飞书官方的云端文件存储与管理中心。

> **导入分流规则：** 如果用户要把本地 Excel / CSV / `.base` 快照导入成 Base / 多维表格 / bitable，必须优先使用 `lark-cli drive +import --type bitable`。不要先切到 `lark-base`；`lark-base` 只负责导入完成后的表内操作。

> **副本分流规则：** 如果用户要复制在线文档、创建文档副本、把文档复制到另一个文件夹，必须使用 `lark-cli drive +copy`。不要用 `drive +export` 下载后再 `drive +import` 上传，也不要用 `docs +fetch` + `docs +create` 重建正文；导出/导入只用于本地文件转换或离线产物。

## 快速决策

- 用户要把**已有 Wiki 节点移出知识库，放到 Drive 文件夹或“我的空间”根目录**：切到 `lark-wiki`，使用 `lark-cli wiki +move-to-drive`；不要把 Wiki token 直接交给 `drive +move`。这是会改变文档归属和权限继承的写操作，执行前确认源节点与目标位置。
- 用户要**复制文档 / 创建副本 到云盘或者文件夹**时：已提供可直接使用的 URL 或 token，按 [`references/lark-drive-copy.md`](lark-drive-0.md#s-008aed2b1b64ed04) 使用 `lark-cli drive +copy`；仅提供标题时，先按 [`references/lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9) 使用 `drive +search` 唯一定位源资源，再按 copy reference 复制。如果是要复制文档 / 创建副本到知识库，使用 `wiki +node-copy`（见 [`lark-wiki-node-copy.md`](lark-wiki-0.md#s-56f9a1676bbdf1a1)）。
- 用户要**识别飞书 / doubao 云空间 URL 的类型和 token**时，可以先按 URL 路径形态做轻量判断；当路径已明确指向 docx / sheet / bitable / slides / file / folder 等资源时，可直接提取对应 token/type。传入 wiki URL、需要识别标题或 canonical URL、URL/token 有歧义，或后续操作依赖底层真实资源时，再使用 `lark-cli drive +inspect --url '<url>'` 进行识别；具体用法、失败处理和边界见 [`references/lark-drive-inspect.md`](lark-drive-0.md#s-7e20781df311b587)。
- 高风险写操作（删除、公开权限修改、owner 转移、版本删除/回滚、批量移动/覆盖/同步）必须同时满足三个条件才执行：目标已解析为该操作可直接使用的执行对象，执行细节已明确到可直接调用命令（例如删除的 file-token/type、公开权限修改的共享范围、owner 转移的目标 owner、版本删除/回滚的 version id、移动/覆盖/同步的目标位置和冲突策略），且用户在本轮明确确认执行这些具体目标和执行细节。用户只说“删除没用的文件”“开放/共享给大家”“改成开放”“覆盖/移动这些”只表示目标状态；先只读发现并列出候选、权限档位或执行方案，停止等待用户确认。
- 用户要**检查 / 治理文档权限、公开范围、链接分享、外部访问、复制下载权限、密级标签、owner 转移**，或要”权限风险报告、收紧权限、申请查看 / 编辑权限、转移 / 批量转移 owner”，必须先阅读 [`references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`permission_governance`](lark-drive-0.md#s-15bd7bdf6ce4606c) workflow。
- 用户明确要**移除单个云文档协作者权限**时，使用 `lark-cli drive +member-remove`；先阅读 [`references/lark-drive-member-remove.md`](lark-drive-0.md#s-155b8223f5420f90)。这是高风险写操作，真实执行必须确认准确的资源、成员 ID/type 和 wiki 权限范围，并显式传 `--yes`。
- 用户要为指定飞书文档**设置 / 修改密级标签（secure label）**，或查询当前用户可用的密级标签，直接读取 [`references/lark-drive-secure-label.md`](lark-drive-0.md#s-0f10250131845279)；这是 Drive 文件治理能力。
- 用户要**检查 / 治理文档权限、公开范围、链接分享、外部访问、复制下载权限、密级标签、owner 转移**，或要“权限风险报告、收紧权限、申请查看 / 编辑权限、转移 / 批量转移 owner”，必须先阅读 [`references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`permission_governance`](lark-drive-0.md#s-15bd7bdf6ce4606c) workflow。
- 用户要**查询文件、文件夹或云文档自身的公开访问、分享、协作者管理、安全与评论权限设置**，优先使用 `lark-cli drive +permission-get-setting`；它只读取目标自身设置，不递归审计文件夹子文档权限。裸 token 必须显式传 `--type`。
- 用户要**按特定主题、关键词或内容线索跨容器查找资料，并统一收集到 Drive 文件夹或 Wiki 节点**，必须先阅读 [`references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`topic_move_collector`](lark-drive-0.md#s-6ce8e611996d89c6) workflow。该 workflow 负责搜索召回、内容验证、相关性分类、移动计划、写前确认和结果验证；禁止直接从 `drive +search` 或 `drive +move` 开始。
- 用户要**整理云盘 / 文件夹 / 文档库 / 知识库 / 个人文档库**，或要“盘点目录结构、找出未归档/临时/重复/空目录、生成整理方案”，必须先阅读 [`references/lark-drive-workflow.md`](lark-drive-0.md#s-377eef44e820cfad)，再按其中 `Workflow Registry` 进入 [`knowledge_organize`](lark-drive-0.md#s-21e19860bee6e319) workflow。默认只生成方案；创建目录、移动资源、申请权限都必须单独确认。
- 按主题跨范围查找并集中归档，进入 `topic_move_collector`；对已知文件夹、文档库或知识库做目录盘点和结构重组，进入 `knowledge_organize`；只移动一个已明确资源时仍使用原子移动命令。
- 用户要**搜文档 / Wiki / 电子表格 / 多维表格 / 云空间（云盘/云存储）对象**，优先使用 `lark-cli drive +search`；按标题定位和处理重复候选时遵循 [`references/lark-drive-search.md`](lark-drive-0.md#s-cd3b5c8a483e06d9)。自然语言里"最近我编辑过的"、"我创建的"（→ `--created-by-me`，原始创建者语义）、"我负责/owner 的"（→ `--mine`，owner 语义）、"最近一周我打开过的 xxx"、"某人 owner 的 docx" 等直接映射到扁平 flag，避免手写嵌套 JSON。
- 用户要对**文档评论**做任何操作（添加评论、列表 / 批量查询、回复、获取 / 更新 / 删除回复、解决 / 恢复、reaction），按下方 Shortcuts 表选择对应的 `drive +<verb>` 评论命令，执行前先阅读该命令的 ref。按评论定位文档正文位置见 [`references/lark-drive-comment-location.md`](lark-drive-0.md#s-eb851ff361ffff9d)。
- 用户给出 doubao.com 的云空间资源 URL/token，或明确提到豆包里的 file/folder/docx/sheet/bitable/wiki 资源时，仍按资源类型、URL 路径和 token 路由到本 skill；不要因为域名不是飞书而回退到 WebFetch。
- 用户要把本地 `.xlsx` / `.csv` / `.base` 导入成 Base / 多维表格 / bitable，第一步必须使用 `lark-cli drive +import --type bitable`。
- 用户要把本地 `.md` / `.docx` / `.doc` / `.txt` / `.html` 导入成在线文档，使用 `lark-cli drive +import --type docx`。
- 用户要把本地 `.pptx` 导入成飞书幻灯片，使用 `lark-cli drive +import --type slides`；当前 PPTX 导入上限是 500MB。
- 批量执行 `drive +import` 且目标是同一个位置（同一 `--folder-token`、默认根目录，或同一 `--target-token`）时，必须串行执行；不要并发导入到同一位置，服务端可能返回并发冲突错误。
- 用户要在 Drive 里上传、创建、读取、局部 patch 或覆盖更新**原生 `.md` 文件**（不是导入成 docx），切到 [`lark-markdown`](lark-markdown-0.md#s-651194b317c3c3e6)。
- 用户要比较原生 `.md` 文件的**历史版本差异**，或比较远端 Markdown 与本地草稿，切到 [`lark-markdown`](lark-markdown-0.md#s-651194b317c3c3e6) 的 `lark-cli markdown +diff`；需要版本号时先用 `drive +version-history`。
- 用户要查看、下载、回滚或删除文件的**历史版本**，使用 `drive +version-history`、`drive +version-get`、`drive +version-revert`、`drive +version-delete`；这组命令同时支持 `--as user` 和 `--as bot`，自动化场景优先 `--as bot`。
- 用户要把本地 `.xlsx` / `.xls` / `.csv` 导入成电子表格，使用 `lark-cli drive +import --type sheet`。
- 用户要在云空间（云盘/云存储）里新建文件夹，优先使用 `lark-cli drive +create-folder`。
- 用户要查看或下载文件内容，或者查看文件可用预览格式并获取 PDF / HTML / 文本 / 图片等转换预览产物，使用 `lark-cli drive +preview`。`+preview` 和 `+download` 都支持 `--file-token` / `--url` / `--wiki-token` 三选一（Wiki 会解析到底层 `file`）；但两者只处理 Drive **文件**，若目标是 docx/sheet/bitable/slides 等在线文档，改用 `drive +export`。
- 用户要获取某个文件的封面图，优先使用 `lark-cli drive +cover`；先 `--list-only` 看规格，再选 `--spec` 下载。
- 用户要导出云文档时，优先使用 `lark-cli drive +export --url '<文档 URL>' --file-extension <格式>`；详细参数、Wiki token 和错误码处理见 [`references/lark-drive-export.md`](lark-drive-0.md#s-c34a363ec7e0cf38)。
- 用户要把本地文件上传到知识库 / 文档库里的某个 wiki 节点下时，仍然使用 `lark-cli drive +upload --wiki-token <wiki_token>`；不要误切到 `wiki` 域命令。
- `lark-base` 只负责导入完成后的 Base 内部操作（表、字段、记录、视图），不要在“本地文件 -> Base”这一步提前切到 `lark-base`。
- 用户给的是 wiki URL / token，且后续还没明确底层资源类型时，先用 `lark-cli drive +inspect` 解包；`+inspect` 失败后不要自动切到别的写接口继续尝试，先按错误提示处理权限、scope 或链接问题。
- `drive +inspect` / `drive +upload` 遇到 `not found`、`permission denied`、`missing scope` 时，默认停止重试；只有 `rate limit` 或临时网络错误才适合有限重试。

## 修改标题
- 用户要**重命名 / 改标题 / 改文件名**，使用 `lark-cli drive +update-title`，用法见 [`references/lark-drive-update-title.md`](lark-drive-0.md#s-726e12e695033297)。

## 核心概念

### 文档类型与 Token

飞书开放平台中，不同类型的文档有不同的 URL 格式和 Token 处理方式。在进行文档操作（如添加评论、下载文件等）时，必须先获取正确的 `file_token`。

### 文档 URL 格式与 Token 处理

| URL 格式 | 示例                                                      | Token 类型 | 处理方式 |
|----------|---------------------------------------------------------|-----------|----------|
| `/docx/` | `https://example.larksuite.com/docx/doxcnxxxxxxxxx`    | `file_token` | URL 路径中的 token 直接作为 `file_token` 使用 |
| `/doc/` | `https://example.larksuite.com/doc/doccnxxxxxxxxx`     | `file_token` | URL 路径中的 token 直接作为 `file_token` 使用 |
| `/wiki/` | `https://example.larksuite.com/wiki/wikcnxxxxxxxxx`    | `wiki_token` | 不能直接当底层 `file_token`；优先用 `drive +inspect` 解包获取 `obj_token` |
| `/sheets/` | `https://example.larksuite.com/sheets/shtcnxxxxxxxxx`  | `file_token` | URL 路径中的 token 直接作为 `file_token` 使用 |
| `/page/` | `https://example.feishu.cn/page/pagcnxxxxxxxx/`        | apps token | URL 路径中的 token 直接使用，资源类型为 `apps` |
| `/drive/folder/` | `https://example.larksuite.com/drive/folder/fldcnxxxx` | `folder_token` | URL 路径中的 token 作为文件夹 token 使用 |

### Wiki 链接特殊处理

```text
lark-cli drive +inspect --url 'https://xxx.feishu.cn/wiki/wikcnXXX'
```

知识库链接背后可能是 docx、sheet、bitable、slides、file 等不同对象。后续要做评论、下载、导出或内容读取时，优先用 `drive +inspect` 拿到 `type`、`token`、`title`、`url`；完整手动解析和跨 skill 路由见共享文档 [`lark-wiki-token-routing.md`]（按模块名读取对应工作流）。不要只根据 `/wiki/<token>` 猜底层类型。

### 常见操作 Token 需求

| 操作 | 需要的 Token | 说明 |
|------|-------------|------|
| 读取文档内容 | `file_token` / 通过 `docs +fetch` 自动处理 | `docs +fetch` 支持直接传入 URL |
| 下载文件 | `file_token` | 从文件 URL 中直接提取 |
| 上传文件 | `folder_token` / `wiki_node_token` | 目标位置的 token |

### 典型错误与解决方案

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `not exist` | 使用了错误的 token | 检查 token 类型，wiki 链接必须先查询获取 `obj_token` |
| `permission denied` | 没有相关操作权限 | 引导用户检查当前身份对文档/文件是否有相应操作权限；如果需要，可以授予相应权限 |
| `invalid file_type` | file_type 参数错误 | 根据 `obj_type` 传入正确的 file_type（docx/doc/sheet/slides/bitable/apps） |
| `232140101` / `232140100` / `233523001`（常见于 `drive +import` 的 `job_error_msg`） | 同一位置下存在并发导入 / 创建操作 | 批量导入到同一文件夹、根目录或同一 `--target-token` 时改为串行执行；每个失败项每次重试前等待几秒，总共最多重试 3 次，仍失败就停止并报告冲突 |

### 权限能力入口

- 用户要管理 Drive 文档/文件协作者、公开权限、授权当前应用访问文档，或处理 `permission.public.patch` 的 `91009` / `91010` / `91011` / `91012` 错误时，先读 [`lark-drive-permission-guide.md`](lark-drive-0.md#s-de1404519a4930f0)。
- 用户要查询文件、文件夹或云文档自身的公开访问、分享、协作者管理、安全与评论权限设置，使用 [`+permission-get-setting`](lark-drive-0.md#s-b0e0f705898998ad)；如果要递归审计文件夹下子文档权限，再进入 [`permission_governance`](lark-drive-0.md#s-15bd7bdf6ce4606c) workflow。
- 用户只是没有访问权限并希望向 owner 申请访问，优先使用 [`+apply-permission`](lark-drive-0.md#s-877958c402ff06d0)。
- 普通 scope、身份或登录问题仍按 [`lark-shared`]（按模块名读取对应工作流） 处理；不要把租户安全策略、对外分享、密级拦截简单归类为缺 scope。

## 不在本 skill 范围

- 文档正文读取、总结、创建、编辑、图片/附件插入或下载：使用 [`lark-doc`](lark-doc-0.md#s-716f3f9ec728a423)。
- 电子表格单元格、筛选、公式、样式等表内操作：使用 [`lark-sheets`]（按模块名读取对应工作流）。
- Base / 多维表格内部的表、字段、记录、视图、仪表盘等操作：使用 [`lark-base`]（按模块名读取对应工作流）。
- 知识空间、Wiki 节点层级、空间成员管理：使用 [`lark-wiki`](lark-wiki-0.md#s-384c23a567152824)；上传本地文件到 wiki 节点仍用 `drive +upload --wiki-token`。
- 原生 Markdown 文件读取、写入、patch、diff：使用 [`lark-markdown`](lark-markdown-0.md#s-651194b317c3c3e6)；把 Markdown 导入成在线 docx 才用 `drive +import --type docx`。

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli drive +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut | 说明 |
|----------|----------|
| [`+search`](lark-drive-0.md#s-cd3b5c8a483e06d9) | 搜索文档、Wiki、表格、文件夹等云空间对象；支持 `--edited-since`、`--created-by-me`、`--mine`、`--doc-types` 等扁平 flag；区分 original creator 与 owner 语义。 |
| [`+upload`](lark-drive-0.md#s-04b9ae35ec99a8aa) | 上传本地文件到 Drive 文件夹或 wiki 节点；修改/重写/更新已有文件时优先覆盖上传，而不是直接上传一个新文件。 |
| [`+create-folder`](lark-drive-0.md#s-47844aa3761af3a5) | 新建 Drive 文件夹，支持父文件夹与 bot 创建后自动授权。 |
| [`+download`](lark-drive-0.md#s-e71db3c18178ec5e) | 下载 Drive 文件到本地。 |
| [`+preview`](lark-drive-0.md#s-ec8393f20fb843f8) | 查看或下载文件内容，或者查看文件可用预览格式并获取 PDF / HTML / 文本 / 图片等转换预览产物。 |
| [`+cover`](lark-drive-0.md#s-3439b20b56fac80d) | 查看或下载文件封面图规格。 |
| [`+status`](lark-drive-0.md#s-564c2eed90faa255) | 比较本地目录与 Drive 文件夹差异；默认按 SHA-256 精确比较，`--quick` 使用修改时间近似比较。 |
| [`+pull`](lark-drive-0.md#s-d2127965f26bd7f6) | 从 Drive 拉取文件到本地目录，支持重复远端路径处理和增量模式。 |
| `+sync` | 双向同步本地目录与 Drive 文件夹：拉取 `new_remote`、推送 `new_local`，`modified` 按 `--on-conflict=remote-wins\|local-wins\|keep-both\|ask` 处理；`--quick` 用修改时间近似比较；`--on-duplicate-remote` 支持 `fail` / `newest` / `oldest`；只同步 `type=file`，跳过在线文档和 shortcut，且不会删除两端多余文件。 |
| [`+push`](lark-drive-0.md#s-6263f350dc70a48f) | 将本地目录推送到 Drive 文件夹，支持 skip / smart / overwrite 与确认后删除远端。 |
| [`+create-shortcut`](lark-drive-0.md#s-48903bcdbf5061e3) | 在另一个文件夹里创建现有 Drive 文件的快捷方式。 |
| [`+copy`](lark-drive-0.md#s-008aed2b1b64ed04) | 复制资源到目标文件夹；如果要复制到知识库，使用 `wiki +node-copy`； |
| [`+add-comment`](lark-drive-0.md#s-eec2b5c15e43279d) | 给 doc/docx/file/sheet/slides/base(bitable) 添加全文/局部评论；不支持妙搭 apps。 |
| [`+list-comments`](lark-drive-0.md#s-1d2de165cd3c3e19) | 分页获取评论列表。 |
| [`+batch-query-comments`](lark-drive-0.md#s-f9662d4ca719282c) | 按评论 ID 批量获取评论。 |
| [`+resolve-comment`](lark-drive-0.md#s-fb147dced6b63d1d) | 把评论标记为已解决（`is_solved=true`）。 |
| [`+restore-comment`](lark-drive-0.md#s-584fbfce73e3f3da) | 恢复/重新打开已解决评论（`is_solved=false`）。 |
| [`+add-reply`](lark-drive-0.md#s-60109a1dee1b4ac2) | 给已有评论添加回复。 |
| [`+list-replies`](lark-drive-0.md#s-4f8de3d1bf0a5ce4) | 分页获取某条评论下的回复。 |
| [`+update-reply`](lark-drive-0.md#s-4a1316e014436948) | 整体替换某条回复的内容。 |
| [`+delete-reply`](lark-drive-0.md#s-61db950f60f07c98) | 删除评论下的某条回复（高风险，需 `--yes`）。 |
| [`+react-reply`](lark-drive-0.md#s-e0d802deed5e42ef) | 给回复加/删表情回应。 |
| [`+export`](lark-drive-0.md#s-c34a363ec7e0cf38) | 将 doc/docx/sheet/bitable/slides 导出为本地文件。 |
| [`+export-download`](lark-drive-0.md#s-c88c646c96f5cce6) | 根据导出产物的 file_token 下载文件。 |
| [`+import`](lark-drive-0.md#s-889102c7a37a958d) | 将本地文件导入为飞书在线文档、表格、多维表格或幻灯片。 |
| [`+version-history`](lark-drive-0.md#s-1a3638390e927950) | 查看文件历史版本。 |
| [`+version-get`](lark-drive-0.md#s-3b4e905df051a5ac) | 下载指定历史版本。 |
| [`+version-revert`](lark-drive-0.md#s-f842f6b78522ae26) | 回滚到指定历史版本。 |
| [`+version-delete`](lark-drive-0.md#s-7eb89ec617aa34ef) | 删除指定历史版本。 |
| [`+move`](lark-drive-0.md#s-385feb5ed1a01e57) | 移动 Drive 文件或文件夹；Wiki 层级移动走 `lark-wiki`。 |
| [`+update-title`](lark-drive-0.md#s-726e12e695033297) | 重命名文件、文件夹、在线文档或知识库。 |
| [`+delete`](lark-drive-0.md#s-0dd3b34e8e162f23) | 删除 Drive 文件或文件夹，文件夹删除会轮询异步任务。 |
| [`+task_result`](lark-drive-0.md#s-27c169d1426c6d1e) | 查询 import/export/move/delete 等异步任务结果。 |
| [`+inspect`](lark-drive-0.md#s-7e20781df311b587) | 检视 URL 的类型、标题和 canonical token；wiki URL 会自动解包到底层文档。 |
| [`+apply-permission`](lark-drive-0.md#s-877958c402ff06d0) | 以 user 身份向文档 owner 申请访问权限。 |
| [`+member-add`](lark-drive-0.md#s-07f0f74d68c4cad4) | 添加一个或最多 10 个 Drive 文档、文件、文件夹或 wiki 节点协作者/授权成员；封装 Drive permission member create/batch_create，真实写入需要 `--yes`。 |
| [`+member-list`](lark-drive-0.md#s-5f791b35ecc31c53) | 查询 Drive 文档、文件、文件夹或 wiki 节点的协作者/授权成员列表。 |
| [`+member-remove`](lark-drive-0.md#s-155b8223f5420f90) | 移除一个 Drive 文档、文件、文件夹或 wiki 节点协作者；封装 Drive permission member delete，真实写入需要 `--yes`。 |
| [`+permission-get-setting`](lark-drive-0.md#s-b0e0f705898998ad) | 查询文件、文件夹或云文档自身的公开访问、分享、协作者管理、安全与评论权限设置；支持 URL 或裸 token + `--type`；不递归读取文件夹子文档权限。 |
| [`+secure-label-list`](lark-drive-0.md#s-0f10250131845279) | 列出当前用户可用的密级标签。 |
| [`+secure-label-update`](lark-drive-0.md#s-0f10250131845279) | 更新 Drive 文件或文档的密级标签。 |


## API Resources

```text
lark-cli schema drive.<resource>.<method>   # 调用 API 前必须先查看参数结构
lark-cli drive <resource> <method> [flags] # 调用 API
```

> **重要**：使用原生 API 时，必须先运行 `schema` 查看 `--data` / `--params` 参数结构，不要猜测字段格式。
>
> **高频原生命令：** 读取 Drive 文件夹清单时使用 `drive files list`，使用前先读 [`references/lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97)，按模板通过 `--params` 传参并手动处理分页；不要把 `--page-all` 输出直接交给 JSON 解析脚本。

### files

  - `copy` — 复制文件；优先使用 [`drive +copy`](lark-drive-0.md#s-008aed2b1b64ed04)
  - `create_folder` — 新建文件夹
  - `list` — 获取文件夹下的清单；使用前阅读 [`references/lark-drive-files-list.md`](lark-drive-0.md#s-1efd212989674e97)
  - `patch` — 修改文件标题；优先使用 [`drive +update-title`](lark-drive-0.md#s-726e12e695033297) shortcut

### permission.members

  - `auth` — 
  - `create` — 增加协作者权限
  - `transfer_owner` — 

### metas

  - `batch_query` — 获取文档元数据

### user

  - `remove_subscription` — 取消订阅用户、应用维度事件
  - `subscription` — 订阅用户、应用维度事件（本次开放评论添加事件）
  - `subscription_status` — 查询用户、应用对指定事件的订阅状态

### file.statistics

  - `get` — 获取文件统计信息
    - 获取 docx / 文件统计信息时，建议优先使用 typed flags：`lark-cli drive file.statistics get --file-token <token> --file-type <type> --format json`；`--params` JSON 也支持，适合批量拼装或 raw 参数场景。

### file.view_records

  - `list` — 获取文档的访问者记录
    - 查看 docx 最近访问记录、返回 open_id、最多 N 条时，建议优先使用 typed flags：`lark-cli drive file.view_records list --file-token <docx_token> --file-type docx --page-size <N> --viewer-id-type open_id --format json`；`--params` JSON 也支持，适合批量拼装、分页续跑或 raw 参数场景。

### file.comment.reply.reactions

  - `update_reaction` — 添加/删除 reaction；优先使用 `drive +react-reply`

### quota_details

  - `get` — 获取当前用户的容量信息，包含各业务使用量、租户配额是否超限、用户配额、所在部门配额
    - 仅支持 `--as user`，不要使用默认的 bot 身份
    - `quota_detail_id` 传当前用户的 `user_id`
