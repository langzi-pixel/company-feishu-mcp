# Feishu MCP

一个面向飞书 OpenAPI 的自托管 MCP 服务，支持 OAuth、持久化授权状态和按需工具发现，可供 ChatGPT 等支持远程 MCP 的客户端使用。

本项目复用 `@larksuiteoapi/lark-mcp` 的工具、参数结构和调用实现，并提供 HTTP 服务、OAuth、状态存储、工具分组和部署脚本。第三方来源与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 功能

- Streamable HTTP MCP，默认路径为 `/feishu/mcp`。
- 飞书用户 OAuth 登录；MCP 客户端使用独立授权码、访问令牌和刷新令牌。
- 支持 OAuth discovery、DCR、PKCE S256、resource 校验、刷新令牌轮换和撤销。
- 支持内存或 OSS 持久化授权状态；生产环境建议使用加密持久化存储。
- 提供常用业务工具，并保留完整原生工具目录，可按需搜索 schema 后调用。
- 支持文件搜索、Markdown 文档读写、多维表格结构与记录操作等常见工作流。
- 所有操作仍受飞书应用权限、用户授权和资源 ACL 约束。

> 工具出现在目录中，不代表对应 API 已在所有租户、权限组合或账户环境中完成真实验收。请以实际飞书应用权限和运行结果为准。

## 本地运行

需要 Node.js 22+。

```sh
npm ci
cp .env.example .env
# 填入自己的飞书应用配置
node --env-file=.env --import tsx src/index.ts
```

运行完整校验：

```sh
npm run verify
```

## 飞书应用配置

1. 在自己的飞书企业中创建应用，并开通所需 API 权限。
2. 添加回调地址：`https://your-domain.example/feishu/callback`。
3. 发布应用并设置合适的可用范围。
4. 将应用 ID、Secret 和所需 scopes 写入部署环境变量。
5. 不要把真实密钥、账户数据、生产域名或内部资源标识提交到仓库。

可参考 [权限清单](docs/feishu-permissions.json)。通过用户身份执行的工具不会绕过用户原有的数据权限。

## 部署

项目可运行在普通 Node.js 容器或兼容的 Serverless 环境中。示例配置位于 `deploy/` 和 `.env.example`。

生产部署建议：

- 使用自己的域名，例如 `https://mcp.example.com/feishu/mcp`。
- 使用独立的私有持久化存储。
- 将云资源名称、地域、域名、应用 ID 与密钥全部放在部署侧配置中。
- 不要在公开仓库中硬编码生产服务器、日志项目、连接器 ID 或个人账户信息。

历史部署脚本仅作为参考，详见 [部署说明](docs/deployment.md)。

## ChatGPT 连接

在支持自定义 MCP 的 ChatGPT 中添加你的 MCP URL，并选择 OAuth。将 ChatGPT 界面显示的精确回调地址加入 `OAUTH_REDIRECT_URIS`。

OpenAI 官方文档：

- [连接 MCP](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- [OAuth 授权](https://developers.openai.com/plugins/build/auth)

## 工具入口

- 日常入口：`/feishu/mcp`
- 完整入口：`/feishu/mcp/all`
- 可选分组：`docs`、`bitable`、`calendar`、`tasks`、`messages`、`drive`、`wiki`

日常模式可通过 `feishu_search_tools` → `feishu_get_tool_schema` → `feishu_read_tool` / `feishu_call_tool` 访问其他能力。

设计、错误约定与兼容说明见 [ChatGPT 接入与工具设计](docs/chatgpt-compatibility.md)。

## 安全与隐私

公开仓库中不应包含：

- 飞书 App Secret、访问令牌、刷新令牌或云厂商密钥；
- 真实生产域名、服务器地址、日志项目或存储桶名称；
- ChatGPT/插件安装实例的技术 ID；
- 个人邮箱、真实姓名、账单、内部项目名和本机绝对路径；
- 仅对单一生产环境成立的验收记录。

如果曾经误提交敏感信息，仅删除当前文件并不能清除 Git 历史；应按 GitHub 的敏感数据清理流程重写历史并轮换相关凭据。

## 许可

MIT。第三方代码和资料的许可信息见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 参考

- [飞书官方 lark-openapi-mcp](https://github.com/larksuite/lark-openapi-mcp)
- [OSS 原子禁止覆盖](https://www.alibabacloud.com/help/en/oss/developer-reference/putobject)
