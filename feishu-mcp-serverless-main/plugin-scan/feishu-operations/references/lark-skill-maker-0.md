<a id="s-599576bc00bd2fd6"></a>

## SKILL.md


# skill-maker

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 从实际用户任务和已验证调用提炼触发条件、输入、工具顺序、输出与恢复点，不固定一次任务的对象 ID、账号、密钥或私人内容。

2. 用真实 MCP 工具与 schema 替代命令行登录、Shell 和隐含本机路径；引用只保留任务需要的资源。

3. 生成 name/description 与对应 SKILL.md，描述可识别业务目的；验证引用、工具可用性、读写分类和典型请求。用户未要求时不发布或安装到别人的环境。

## 按需参考

- [工具与合同](lark-skill-maker-0.md#s-d94e7c192cb5a23b)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-skill-maker-0.md#s-7e95cd9e2b4f03f7)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-d94e7c192cb5a23b"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|


<a id="s-7e95cd9e2b4f03f7"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# Skill Maker

基于 lark-cli 创建新 Skill。Skill = 一份 `SKILL.md`，教 AI 用 CLI 命令完成任务。

## CLI 核心能力

```text
lark-cli <service> <resource> <method>          # 已注册 API
lark-cli <service> +<verb>                      # Shortcut（高级封装）
lark-cli api <METHOD> <path> [--data/--params]  # 任意飞书 OpenAPI
lark-cli schema <service.resource.method>       # 查参数定义
```

优先级：Shortcut > 已注册 API > `api` 裸调。

## 调研 API

```text
# 1. 查看已有的 API 资源和 Shortcut
lark-cli <service> --help

# 2. 查参数定义
lark-cli schema <service.resource.method>

# 3. 未注册的 API，用 api 直接调用
lark-cli api GET /open-apis/vc/v1/rooms --params '{"page_size":"50"}'
lark-cli api POST /open-apis/vc/v1/rooms/search --data '{"query":"5F"}'
```

如果以上命令无法覆盖需求（CLI 没有对应的已注册 API 或 Shortcut），使用 [lark-openapi-explorer](lark-openapi-explorer-0.md#s-180120bedca6008d) 从飞书官方文档库逐层挖掘原生 OpenAPI 接口，获取完整的方法、路径、参数和权限信息，再通过 `lark-cli api` 裸调完成任务。

通过以上流程确定需要哪些 API、参数和 scope。

## SKILL.md 模板

文件放在 `skills/lark-<name>/SKILL.md`：

```markdown
---
name: lark-<name>
version: 1.0.0
description: "<功能描述>。当用户需要<触发场景>时使用。"
metadata:
  requires:
    bins: ["lark-cli"]
---


# <标题>

> **前置条件：** 先阅读 [`../lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188)。

## 命令

\```text
# 单步操作
lark-cli api POST /open-apis/xxx --data '{...}'

# 多步编排：说明步骤间数据传递
# Step 1: ...（记录返回的 xxx_id）
# Step 2: 使用 Step 1 的 xxx_id
\```

## 权限

| 操作 | 所需 scope |
|------|-----------|
| xxx | `scope:name` |
```

## 关键原则

- **description 决定触发** — 包含功能关键词 + "当用户需要...时使用"
- **认证** — 说明所需 scope，登录用 `lark-cli auth login --domain <name>`
- **安全** — 写入操作前确认用户意图，建议 `--dry-run` 预览
- **编排** — 说明数据传递、失败回滚、可并行步骤
