<a id="s-651194b317c3c3e6"></a>

## SKILL.md


# markdown

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 先读文件元数据确认是原生 .md；Docx Markdown 导出不是同类对象。修改必须下载原文件内容、应用局部变更并通过原文件的更新接口提交。

2. 创建与覆盖需要真实文件传输和版本合同；当前连接若只有元数据或 Docx Markdown 操作，报告原生文件读写缺口，不转成新 Docx 后声称完成。

3. 保留编码、换行、链接和其他正文；返回同一文件 token 和读取核对结果。

## 按需参考

- [工具与合同](lark-markdown-0.md#s-82772ed49c9e16e2)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-markdown-0.md#s-ceaba10bda925e23)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-25a410e9a5f012b6"></a>

## references/lark-markdown-create.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# markdown +create

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

在 Drive 中创建一个原生 Markdown 文件（`.md`），支持创建到普通 Drive 文件夹或 Wiki 节点下。

## 命令

```text
# 直接用行内内容创建
lark-cli markdown +create \
  --name README.md \
  --content '# Hello'

# 从本地 .md 文件创建
lark-cli markdown +create \
  --file ./README.md

# 从本地文件读取内容，但仍走 --content
lark-cli markdown +create \
  --name README.md \
  --content @./README.md

# 从 stdin 读取内容
printf '# Hello\n\nfrom stdin\n' | \
  lark-cli markdown +create \
    --name README.md \
    --content -

# 创建到指定文件夹
lark-cli markdown +create \
  --folder-token fldcn_xxx \
  --file ./README.md

# 创建到指定文件夹（可直接传 Drive folder URL）
lark-cli markdown +create \
  --folder-token "https://feishu.cn/drive/folder/fldcn_xxx" \
  --file ./README.md

# 创建到指定 wiki 节点
lark-cli markdown +create \
  --wiki-token wikcn_xxx \
  --file ./README.md

# 创建到指定 wiki 节点（可直接传 wiki URL）
lark-cli markdown +create \
  --wiki-token "https://feishu.cn/wiki/wikcn_xxx" \
  --file ./README.md

# 预览底层请求
lark-cli markdown +create \
  --name README.md \
  --content '# Hello' \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--folder-token` | 否 | 目标 Drive 文件夹 token 或 Drive folder URL；与 `--wiki-token` 互斥；省略时创建到根目录 |
| `--wiki-token` | 否 | 目标 wiki 节点 token 或 wiki URL；与 `--folder-token` 互斥；传入后自动映射为 `parent_type=wiki` |
| `--name` | 条件必填 | 文件名，**必须显式带 `.md` 后缀**；使用 `--content` 时必填；使用 `--file` 时可省略，默认取本地文件名 |
| `--content` | 条件必填 | Markdown 内容；与 `--file` 互斥；支持直接传字符串、`@file`、`-`（stdin） |
| `--file` | 条件必填 | 本地 `.md` 文件路径；与 `--content` 互斥 |

## 关键约束

- `--content` 与 `--file` 必须二选一
- `--folder-token` 与 `--wiki-token` 互斥
- `--folder-token` 只能是 Drive 文件夹；不要传 wiki/doc/sheet/base/file token 或 URL
- `--wiki-token` 只能是 Wiki 节点；如果只有 docx/sheet/base 等文档 URL，先用 `lark-cli wiki +node-get --node-token <url>` 解析出 `node_token`
- `--name` 必须带 `.md` 后缀
- `--file` 指向的本地文件名也必须带 `.md` 后缀
- 传 `--wiki-token` 时，返回值中不会附带 `/file/<token>` URL，因为 wiki 承载文件没有稳定的独立 file URL

## 返回值

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "file_token": "boxcnxxxx",
    "file_name": "README.md",
    "size_bytes": 1234
  }
}
```

> [!IMPORTANT]
> 如果 Markdown 文件是**以应用身份（bot）创建**的，如 `lark-cli markdown +create --as bot`，在创建成功后，CLI 会**尝试为当前 CLI 用户自动授予该文件的 `full_access`（可管理权限）**。
>
> 以应用身份创建时，结果里会额外返回 `permission_grant` 字段，明确说明授权结果：
> - `status = granted`：当前 CLI 用户已获得该文件的可管理权限
> - `status = skipped`：本地没有可用的当前用户 `open_id`，因此不会自动授权；可提示用户先完成 `lark-cli auth login`，再让 AI / agent 继续使用应用身份（bot）授予当前用户权限
> - `status = failed`：Markdown 文件已创建成功，但自动授权用户失败；会带上失败原因，并提示稍后重试或继续使用 bot 身份处理该文件
>
> `permission_grant.perm = full_access` 表示该资源已授予“可管理权限”。
>
> **不要擅自执行 owner 转移。** 如果用户需要把 owner 转给自己，必须单独确认。

## 失败处理

- `not_found` / `1061044`：父目录或 wiki 节点不存在，或 token 类型放错参数。修正 `--folder-token` / `--wiki-token` 后再试，不要重复提交同一参数。
- `quota_exceeded` / `1061101`：目标存储空间配额已满。释放空间、换父目录/节点或请管理员扩容后再试。
- `permission_denied` / `missing_scope`：区分身份处理。`--as user` 看用户授权和目标 ACL；`--as bot` 看应用 scope 与目标目录/节点 ACL。
- `rate_limit`：停止立即重试，使用退避。
- `server_error` / `233523001`：可以稍后有限重试；若重复出现，保留 `log_id` / request id 给服务端排查。

## 参考

- [lark-markdown](lark-markdown-0.md#s-651194b317c3c3e6) — Markdown 域总览
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-46b487eb2bb41b2a"></a>

## references/lark-markdown-diff.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# markdown +diff

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

比较 Drive 中原生 Markdown 的两个历史版本，或比较远端 Markdown 与本地 `.md` 草稿。需要历史版本号时，先用 [`drive +version-history`](lark-drive-0.md#s-1a3638390e927950) 获取 `version`，不要使用 `tag`。

## 命令

```text
# 比较两个远端版本
lark-cli markdown +diff \
  --file-token boxcnxxxx \
  --from-version 7633658129540910621 \
  --to-version 7633658129540910628

# 比较历史版本与远端最新版本
lark-cli markdown +diff \
  --file-token boxcnxxxx \
  --from-version 7633658129540910621

# 比较远端最新版本与本地草稿
lark-cli markdown +diff \
  --file-token boxcnxxxx \
  --file ./draft.md \
  --format pretty

# 比较指定远端版本与本地草稿
lark-cli markdown +diff \
  --file-token boxcnxxxx \
  --from-version 7633658129540910621 \
  --file ./draft.md

# 预览底层请求
lark-cli markdown +diff \
  --file-token boxcnxxxx \
  --from-version 7633658129540910621 \
  --to-version 7633658129540910628 \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标 Markdown 文件 token |
| `--from-version` | 否 | 基准远端版本；不传 `--file` 时必填，传 `--file` 时省略表示“远端最新 vs 本地文件” |
| `--to-version` | 否 | 目标远端版本；要求同时传 `--from-version`，且不能与 `--file` 一起使用。省略时表示远端最新版本 |
| `--file` | 否 | 本地 `.md` 文件路径；传入后进入“远端 vs 本地”比较模式 |
| `--context-lines` | 否 | unified diff 每个 hunk 前后保留的上下文行数，默认 `3` |
| `--format` | 否 | 仅支持 `json`（默认）和 `pretty` |

## 关键行为

- `--file` 存在时：
  - 省略 `--from-version` = 比较“远端最新版本 vs 本地文件”
  - 传入 `--from-version` = 比较“指定远端版本 vs 本地文件”
- `--to-version` 只能用于“远端版本 vs 远端版本”，不能与 `--file` 同时出现
- `--format pretty` 输出带颜色的 unified diff；`--format json` 返回结构化摘要和完整 diff 文本
- 无差异时：
  - `json` 输出里 `changed=false`
  - `pretty` 输出固定为 `No differences.`

## 返回值

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "changed": true,
    "mode": "remote_vs_remote",
    "file_token": "boxcnxxxx",
    "from_version": "7633658129540910621",
    "to_version": "7633658129540910628",
    "from_label": "a/boxcnxxxx@version:7633658129540910621",
    "to_label": "b/boxcnxxxx@version:7633658129540910628",
    "added_lines": 3,
    "deleted_lines": 2,
    "context_lines": 3,
    "hunks": [
      {
        "header": "@@ -1,6 +1,7 @@",
        "old_start": 1,
        "old_lines": 6,
        "new_start": 1,
        "new_lines": 7
      }
    ],
    "diff": "--- a/boxcnxxxx@version:7633658129540910621\n+++ b/boxcnxxxx@version:7633658129540910628\n@@ -1,2 +1,2 @@\n..."
  }
}
```

完整字段说明：

| 字段 | 层级 | 含义 |
|------|------|------|
| `ok` | 顶层 | CLI 通用成功标记；`true` 表示命令执行成功 |
| `identity` | 顶层 | 本次执行使用的身份，通常是 `user` 或 `bot` |
| `data` | 顶层 | 本次 diff 的业务结果对象 |
| `changed` | `data` | 是否存在差异；`true` 表示两侧内容不同，`false` 表示完全一致 |
| `mode` | `data` | 比较模式；`remote_vs_remote` = 远端对远端，`remote_vs_local` = 远端对本地 |
| `file_token` | `data` | 被比较的远端 Markdown 文件 token |
| `from_version` | `data` | 基准远端版本号；远端最新 vs 本地时可能为空字符串 |
| `to_version` | `data` | 目标远端版本号；当目标侧是远端最新版本或本地文件时通常为空字符串 |
| `from_label` | `data` | unified diff 基准侧标签名，会直接出现在 `diff` 文本的 `---` 头部 |
| `to_label` | `data` | unified diff 目标侧标签名，会直接出现在 `diff` 文本的 `+++` 头部 |
| `added_lines` | `data` | 新增行数统计 |
| `deleted_lines` | `data` | 删除行数统计 |
| `context_lines` | `data` | 每个 hunk 前后保留的上下文行数，对应传入的 `--context-lines` |
| `hunks` | `data` | 结构化的变更块摘要数组；每个元素对应 patch 里的一个 `@@ ... @@` 段 |
| `diff` | `data` | 完整 unified diff 文本；最适合直接阅读或保存 |
| `local_file` | `data` | 仅在 `remote_vs_local` 模式下出现；值就是传给 `--file` 的本地 Markdown 路径 |

标签字段补充：

- `from_label` / `to_label` 只用于标识 diff 两侧，不代表额外 API 字段
- `from_label` 表示基准侧，`to_label` 表示目标侧
- 远端版本通常形如 `a/<file_token>@version:<version>`、`b/<file_token>@version:<version>`
- 当目标侧是远端最新版本时，`to_label` 形如 `b/<file_token>@latest`
- 当目标侧是本地文件时，`to_label` 形如 `b/./draft.md`

`hunks` 子字段说明：

| 字段 | 含义 |
|------|------|
| `header` | 原始 hunk 头，例如 `@@ -3,1 +3,1 @@` |
| `old_start` | 旧内容从第几行开始 |
| `old_lines` | 旧内容这段覆盖多少行 |
| `new_start` | 新内容从第几行开始 |
| `new_lines` | 新内容这段覆盖多少行 |

补充说明：

- `hunks` 适合 agent 或脚本快速定位变更范围；完整逐行内容仍以 `diff` 字段为准
- `changed=false` 时，`hunks` 通常为空数组，`diff` 通常为空字符串；如果使用 `--format pretty`，终端输出会是 `No differences.`

远端 vs 本地时会额外返回：

```json
{
  "local_file": "./draft.md"
}
```

- `local_file`
  - 只有传了 `--file`、进入“远端 vs 本地”模式时才会返回
  - 值就是本次命令实际比较的本地 Markdown 路径，也就是你传给 `--file` 的那个路径
  - 它表示“目标侧本地文件”，不是临时下载文件，也不是远端文件名
  - 如果没有这个字段，说明本次是“远端版本 vs 远端版本”

## 参考

- [lark-markdown](lark-markdown-0.md#s-651194b317c3c3e6) — Markdown 域总览
- [lark-drive-version-history](lark-drive-0.md#s-1a3638390e927950) — 获取可用于 diff 的历史版本号
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-82e785c8add411a8"></a>

## references/lark-markdown-fetch.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# markdown +fetch

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

读取 Drive 中原生 Markdown 文件的内容；也支持把内容保存到本地。

## 命令

```text
# 直接返回 Markdown 文本
lark-cli markdown +fetch --file-token boxcnxxxx

# 保存到本地
lark-cli markdown +fetch \
  --file-token boxcnxxxx \
  --output ./README.md

# 传目录时，使用远端文件名保存到该目录下
lark-cli markdown +fetch \
  --file-token boxcnxxxx \
  --output ./downloads/

# 覆盖已存在文件
lark-cli markdown +fetch \
  --file-token boxcnxxxx \
  --output ./README.md \
  --overwrite

# 预览底层请求
lark-cli markdown +fetch \
  --file-token boxcnxxxx \
  --output ./README.md \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标 Markdown 文件 token |
| `--output` | 否 | 本地保存路径；既可传具体文件名，也可传目录路径。传目录时使用远端文件名保存；省略时直接返回 Markdown 内容 |
| `--overwrite` | 否 | 覆盖已存在的本地输出文件；仅在传入 `--output` 时生效 |

## 返回值

不传 `--output`：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "file_token": "boxcnxxxx",
    "file_name": "README.md",
    "content": "# Hello\n",
    "size_bytes": 8
  }
}
```

传入 `--output`：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "file_token": "boxcnxxxx",
    "file_name": "README.md",
    "saved_path": "/abs/path/README.md",
    "size_bytes": 8
  }
}
```

## 参考

- [lark-markdown](lark-markdown-0.md#s-651194b317c3c3e6) — Markdown 域总览
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-092efbb22825f064"></a>

## references/lark-markdown-overwrite.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# markdown +overwrite

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

覆盖更新 Drive 中已有的原生 Markdown 文件，并返回覆盖后的新版本号。

## 命令

```text
# 用行内内容覆盖
lark-cli markdown +overwrite \
  --file-token boxcnxxxx \
  --content '# Updated'

# 用本地 .md 文件覆盖
lark-cli markdown +overwrite \
  --file-token boxcnxxxx \
  --file ./README.md

# 覆盖内容时顺便显式指定新文件名
lark-cli markdown +overwrite \
  --file-token boxcnxxxx \
  --name NEW-README.md \
  --content '# Updated'

# 用 --content 从本地文件读取
lark-cli markdown +overwrite \
  --file-token boxcnxxxx \
  --content @./README.md

# 用 stdin 覆盖
printf '# Updated\n' | \
  lark-cli markdown +overwrite \
    --file-token boxcnxxxx \
    --content -

# 预览底层请求
lark-cli markdown +overwrite \
  --file-token boxcnxxxx \
  --content '# Updated' \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标 Markdown 文件 token |
| `--name` | 否 | 显式指定覆盖后的文件名；必须带 `.md` 后缀。传入时优先使用它 |
| `--content` | 条件必填 | 新 Markdown 内容；与 `--file` 互斥；支持直接传字符串、`@file`、`-`（stdin） |
| `--file` | 条件必填 | 本地 `.md` 文件路径；与 `--content` 互斥 |

## 关键约束

- `--content` 与 `--file` 必须二选一
- 如果传了 `--name`，直接使用它作为覆盖后的文件名
- 如果没传 `--name` 且使用 `--content`，默认保留远端原文件名
- 如果没传 `--name` 且使用 `--file`，默认使用本地文件名
- `--file` 指向的本地文件名必须带 `.md` 后缀
- 覆盖成功后 **必须** 返回 `version`

## 返回值

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "file_token": "boxcnxxxx",
    "file_name": "README.md",
    "version": "7633658129540910621",
    "size_bytes": 2048
  }
}
```

其中：

- `version` 是覆盖写入后的新版本号
- `size_bytes` 是本次覆盖后的内容大小

## 参考

- [lark-markdown](lark-markdown-0.md#s-651194b317c3c3e6) — Markdown 域总览
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-100022ed05851f48"></a>

## references/lark-markdown-patch.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。

# markdown +patch

> **前置条件：** 先阅读 [`../../lark-shared/SKILL.md`]（按模块名读取对应工作流） 了解认证、全局参数和安全规则。

对 Drive 中已有的原生 Markdown 文件做局部文本替换，并返回是否实际写入了新版本。

## 命令

```text
# 字面量替换
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --pattern 'hello markdown' \
  --content 'hello patched'

# 正则替换（RE2）
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --regex \
  --pattern 'hello (.+)' \
  --content 'hi $1'

# 正则 pattern 含特殊字符时要显式转义
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --regex \
  --pattern 'version \\(1\\.0\\)' \
  --content 'version (2.0)'

# 删除匹配内容
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --pattern ' debug' \
  --content ''

# --pattern / --content 也支持 @file
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --pattern @./pattern.txt \
  --content @./replacement.md

# 从 stdin 读取 replacement
printf 'hi patched\n' | \
  lark-cli markdown +patch \
    --file-token boxcnxxxx \
    --pattern 'hello markdown' \
    --content -

# 预览底层编排
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --pattern 'hello markdown' \
  --content 'hello patched' \
  --dry-run
```

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `--file-token` | 是 | 目标 Markdown 文件 token |
| `--pattern` | 是 | 要匹配的文本；默认按字面量处理；支持直接传字符串、`@file`、`-`（stdin） |
| `--content` | 是 | 替换后的内容；支持直接传字符串、`@file`、`-`（stdin）；允许空字符串 `''`，表示删除匹配内容 |
| `--regex` | 否 | 将 `--pattern` 按 Go RE2 正则解释；`--content` 支持 `$1` 这类分组替换；如果需要字面 `$`，请写成 `$$` |

## 关键约束

- 当前只支持**单组** `--pattern` / `--content`
- `--pattern` 必须显式传入且不能为空字符串
- `--content` 必须显式传入，但允许为空字符串
- 未加 `--regex` 时，行为等价于对整份 Markdown 文本执行 `strings.ReplaceAll`
- 加了 `--regex` 时，行为等价于对整份 Markdown 文本执行 RE2 全量替换；`--content` 里的 `$1`、`${name}` 会按 Go regexp replacement template 解释，字面 `$` 请写成 `$$`
- 替换后的最终 Markdown 不能为空；如果 patch 结果是空字符串，CLI 会直接报错，不会上传空文件，因为 Drive 不支持零字节 Markdown，且空文件通常是误操作
- `0` 命中时命令仍然成功返回，但不会上传新版本

## Good / Bad

```text
# BAD: pattern 含正则特殊字符但未转义，容易匹配错误位置
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --regex \
  --pattern 'version (1.0)' \
  --content 'version (2.0)'

# GOOD: 显式转义括号和点号
lark-cli markdown +patch \
  --file-token boxcnxxxx \
  --regex \
  --pattern 'version \\(1\\.0\\)' \
  --content 'version (2.0)'
```

## 实现边界

- 该命令的内部语义是：**download -> local replace -> overwrite upload**
- 它不是服务端原子 patch；如果有人在你下载后、上传前更新了同一文件，本次 patch 仍可能覆盖那次中间修改
- 它不会返回详细匹配位置，只返回命中数量
- `--dry-run` 会同时展示两种可能的上传路径：`upload_all`（小文件）和 `upload_prepare/upload_part/upload_finish`（大文件分片上传）

## 返回值

命中并写入新版本：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "updated": true,
    "mode": "literal",
    "match_count": 1,
    "version": "7639217385152646325",
    "size_bytes_before": 39,
    "size_bytes_after": 41
  }
}
```

未命中：

```json
{
  "ok": true,
  "identity": "user",
  "data": {
    "updated": false,
    "mode": "literal",
    "match_count": 0,
    "version": "",
    "size_bytes_before": 41,
    "size_bytes_after": 41
  }
}
```

其中：

- `updated` 表示本次是否真的上传了新版本
- `mode` 为 `literal` 或 `regex`
- `match_count` 是匹配次数
- `version` 只有在 `updated=true` 时才会有值
- `size_bytes_before` / `size_bytes_after` 分别是替换前后的 Markdown 大小

## 适用场景

- 只需要替换一小段 Markdown 文本，而不想自己手动 `fetch -> edit -> overwrite`
- 需要基于正则做简单批量替换
- 需要判断“这次是否真的改到了内容”

## 不适用场景

- 需要 rename / move / delete / permission / comment 管理：切到 [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c)
- 需要多组 patch 一次完成：当前不支持，改为多次调用 `markdown +patch`
- 需要真正原子更新：当前能力不提供

## 参考

- [lark-markdown](lark-markdown-0.md#s-651194b317c3c3e6) — Markdown 域总览
- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数


<a id="s-82772ed49c9e16e2"></a>

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


<a id="s-ceaba10bda925e23"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# markdown (v1)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理**

## 快速决策

- 身份：Markdown 文件通常属于用户云空间资源，优先使用 `--as user`。如为自动化场景，或应用已创建并持有目标文件权限，可按场景使用 `--as bot`。首次以 `user` 身份访问前执行 `lark-cli auth login`
- `markdown +create` / `+overwrite` 失败时，先判断是不是身份和权限问题：`bot` 更常见的是 app scope 或目标目录 ACL，`user` 更常见的是用户授权或用户 ACL；不要不加判断地来回切身份重试。

- 用户要**上传、创建一个原生 `.md` 文件**，使用 `lark-cli markdown +create`
- 用户要**比较原生 `.md` 文件的历史版本差异**，或比较远端 Markdown 与本地草稿，使用 `lark-cli markdown +diff`
- 用户要**读取 Drive 里某个 `.md` 文件内容**，使用 `lark-cli markdown +fetch`
- 用户要对 Markdown 文件做**局部文本替换 / 正则替换**，优先使用 `lark-cli markdown +patch`
- 用户要**覆盖更新 Drive 里某个 `.md` 文件内容**，使用 `lark-cli markdown +overwrite`
- 用户要先拿 Markdown 文件的历史版本号，再做比较/下载/回滚，先用 [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c) 的 `lark-cli drive +version-history`
- 用户要把本地 Markdown **导入成在线新版文档（docx）**，不要用本 skill，改用 [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c) 的 `lark-cli drive +import --type docx`
- 用户要对 Markdown 文件做**rename / move / delete / 搜索 / 权限 / 评论**等云空间（云盘/云存储）操作，不要留在本 skill，切到 [`lark-drive`](lark-drive-0.md#s-c99c77320f67806c)
- `markdown +create` / `+overwrite` 命中 `missing scope`、`permission denied`、`not found`、`quota_exceeded`、`version limit` 时，默认停止重试并按报错 hint 处理；只有 `rate_limit`、`server_error` 或临时网络错误才做有限退避重试。
- `markdown +create` 的目标参数不要猜：Drive 文件夹用 `--folder-token`，Wiki 节点用 `--wiki-token`。如果用户给的是 URL，可以直接传完整 URL；CLI 会归一成 token。不要把 doc/sheet/wiki URL 放进 `--folder-token` 试错。

## 核心边界

- 本 skill 处理的是 **Drive 中作为普通文件存储的 Markdown**，不是 docx 文档
- `--name` 和本地 `--file` 文件名都必须显式带 `.md` 后缀；不满足时 shortcut 会直接报错
- `--content` 支持：
  - 直接传字符串
  - `@file` 从本地文件读取内容
  - `-` 从 stdin 读取内容
- `markdown +patch` 的内部语义是：**先完整下载 Markdown，再本地替换，再整文件覆盖上传**
- `markdown +patch` 不是服务端原子 patch；它是 CLI 侧编排出来的局部更新能力
- `markdown +patch` 当前只支持**单组** `--pattern` / `--content`
- `markdown +patch` 替换后的最终内容**不能为空**；CLI 会拒绝上传空文件，因为 Drive 不支持零字节 Markdown，且空文件通常是误操作
- `--file` 只接受本地 `.md` 文件路径

正则替换时要特别注意 `--pattern` 的转义：

```text
# BAD: 未转义正则特殊字符，可能匹配到错误位置
lark-cli markdown +patch --file-token boxcnxxxx --regex --pattern "version (1.0)" --content "version (2.0)"

# GOOD: 显式转义括号和点号
lark-cli markdown +patch --file-token boxcnxxxx --regex --pattern "version \\(1\\.0\\)" --content "version (2.0)"
```

## Shortcuts（推荐优先使用）

Shortcut 是对常用操作的高级封装（`lark-cli markdown +<verb> [flags]`）。有 Shortcut 的操作优先使用。

| Shortcut | 说明 |
|----------|------|
| [`+create`](lark-markdown-0.md#s-25a410e9a5f012b6) | Create a Markdown file in Drive |
| [`+diff`](lark-markdown-0.md#s-46b487eb2bb41b2a) | Compare two remote Markdown versions, or compare remote Markdown against a local file |
| [`+fetch`](lark-markdown-0.md#s-82e785c8add411a8) | Fetch a Markdown file from Drive |
| [`+patch`](lark-markdown-0.md#s-100022ed05851f48) | Patch a Markdown file in Drive via fetch-local-replace-overwrite |
| [`+overwrite`](lark-markdown-0.md#s-092efbb22825f064) | Overwrite an existing Markdown file in Drive |

## 参考

- [lark-shared]（按模块名读取对应工作流） — 认证和全局参数
- [lark-drive](lark-drive-0.md#s-c99c77320f67806c) — Drive 文件管理、导入 docx、move/delete/search 等
