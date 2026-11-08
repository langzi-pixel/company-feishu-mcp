# 部署与回滚

本文档只描述通用自托管方式，不包含任何生产环境的域名、账户、地域或资源名称。

## 推荐拓扑

将飞书 MCP 暴露在独立路径，例如：

- MCP：`https://mcp.example.com/feishu/mcp`
- 健康检查：`https://mcp.example.com/feishu/healthz`
- OAuth 回调：`https://mcp.example.com/feishu/callback`

如果同一域名承载多个服务，请分别配置 issuer、resource metadata 和路由，不要让不同服务共享同一 OAuth 身份。

## 运行配置

生产环境至少需要：

- Node.js 22+
- `PUBLIC_ORIGIN`
- `BASE_PATH=/feishu`
- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_SCOPES`
- `OAUTH_REDIRECT_URIS`
- 持久化存储配置与 `STATE_ENCRYPTION_KEY`

示例见 `.env.example` 和 `deploy/config.example.json`。

不要把真实 App Secret、访问令牌、生产域名、云资源名称、账户 ID、存储桶名或本机私有路径提交到仓库。

## 容器部署

项目提供 [Dockerfile](../Dockerfile)。部署前先执行：

```sh
npm ci
npm run verify
docker build -t feishu-mcp .
```

生产环境应由反向代理或云平台提供 HTTPS，并将外部端口转发到应用的 `PORT`。

## Serverless / FC

`deploy/` 中保留了通用部署示例。所有地域、项目、域名和日志资源都应从部署环境配置，不应在源码中绑定某个真实生产环境。

`deploy/fc-ops.py` 使用以下环境变量：

```sh
export FEISHU_FC_REGION=your-region
export FEISHU_SLS_PROJECT=your-log-project
export FEISHU_MCP_DOMAIN=mcp.example.com
```

然后按需执行：

```sh
python3 deploy/fc-ops.py configure
python3 deploy/fc-ops.py snapshot --function feishu-mcp --snapshot-dir /private/path/fc-backups
python3 deploy/fc-ops.py release --function feishu-mcp --revision <committed-revision>
python3 deploy/fc-ops.py alarms
python3 deploy/fc-ops.py rollback --function feishu-mcp --version <previous-version>
```

备份目录必须位于仓库外并限制文件权限。

## 状态存储

生产环境应使用私有持久化存储，并为状态对象启用应用层加密。授权码、刷新令牌和一次性 claim 不应写入日志。

如果使用 OSS：

- 使用私有 Bucket；
- 通过实例角色或短期凭据访问；
- 不要提交 AccessKey；
- 为不同部署使用独立前缀和独立加密密钥；
- 变更版本控制或生命周期策略前先验证一次性 claim 的语义。

## 日志与可观测性

建议只记录：

- 请求 ID；
- 操作名称；
- 成功/失败结果；
- 耗时；
- HTTP 状态码；
- 版本与健康状态。

不要记录 Authorization、Cookie、OAuth 请求正文、工具参数正文、用户文档内容或飞书 token。

## 发布与回滚

推荐发布流程：

1. `npm run verify`
2. 构建不可变版本
3. 在非生产入口验证 health 和 OAuth metadata
4. 切换生产别名或流量
5. 执行一次真实的只读 MCP 调用
6. 异常时切回上一已知版本

不要把“部署命令成功”当作“业务能力验收成功”。

## 验收清单

1. HTTPS 证书与域名匹配。
2. 未授权 MCP 请求返回 401，并给出正确的 resource metadata。
3. OAuth 能完成登录、刷新与撤销。
4. 工具列表可读取。
5. 选择独立测试资源完成至少一次只读调用。
6. 写操作只在明确测试对象上执行，并在写后重新读取核对。
7. 日志中不包含凭据或用户正文。

生产环境特有的验收结果应保存在私有运维记录中，而不是提交到公开仓库。
