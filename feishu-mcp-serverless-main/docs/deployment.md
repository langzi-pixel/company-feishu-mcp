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

- Node.js 22.16+
- `PUBLIC_ORIGIN`
- `BASE_PATH=/feishu`
- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_SCOPES`
- `OAUTH_REDIRECT_URIS`
- 持久化存储配置与 `STATE_ENCRYPTION_KEY`

SQLite 容器配置见 `deploy/sqlite.env.example`、`deploy/compose.sqlite.yaml`；OSS / FC 示例见 `.env.example` 和 `deploy/config.example.json`。

不要把真实 App Secret、访问令牌、生产域名、云资源名称、账户 ID、存储桶名或本机私有路径提交到仓库。

## 容器部署

项目提供 [Dockerfile](../Dockerfile)。部署前先执行：

```sh
npm ci
npm run verify
docker build -t feishu-mcp .
```

生产环境应由反向代理或云平台提供 HTTPS，并将外部端口转发到应用的 `PORT`。

### 单台 ECS：SQLite

使用明确的 `STATE_STORE=sqlite`，配置容器内绝对路径 `STATE_DB_PATH=/data/state.sqlite` 和一次性生成的 `STATE_ENCRYPTION_KEY`。不需要 OSS Bucket 或云 AccessKey。没有显式选择后端时仍沿用 OSS，保持旧部署兼容。

在仓库之外准备环境文件和数据目录，权限分别为 `0600` 和 `0700`；数据目录的 UID/GID 应与镜像内 `node` 用户匹配。填入真实 HTTPS origin、飞书应用凭据、已批准的用户 scopes 和客户端显示的精确 OAuth 回调地址，不要用示例配置上线。

设置以下三个部署侧变量后使用 Compose：

```sh
export FEISHU_MCP_IMAGE=feishu-mcp:your-verified-tag
export FEISHU_MCP_ENV_FILE="$PRIVATE_DEPLOY_DIR/service.env"
export FEISHU_MCP_DATA_DIR="$PRIVATE_DEPLOY_DIR/data"
docker compose -f deploy/compose.sqlite.yaml config --quiet
docker compose -f deploy/compose.sqlite.yaml up -d
```

`PRIVATE_DEPLOY_DIR` 必须事先设为仓库之外的私有目录。Compose 使用原样读取的 env 文件，避免密钥中的 `$` 被插值；环境文件只交给服务端。默认只把服务绑定到 `127.0.0.1:8080`，由 HTTPS 反向代理转发，并保留根路径下的 OAuth metadata 路由。

SQLite 存储对每条授权记录使用 AES-256-GCM，加密时绑定记录键和有效期；启动时校验加密密钥，配置错误的密钥会拒绝启动。一次性消费由单条 SQLite UPSERT 仲裁，WAL 和 FULL 同步用于持久化；过期记录在启动和后续写入时定期清理。它支持单机多个进程使用同一数据库，不适用于把数据库文件放在 NFS 上供多台应用服务器共享。

### SQLite 在线备份与恢复

运行以下命令生成加密状态的独立快照：

```sh
docker exec company-feishu-mcp node /app/dist/backup-state.mjs \
  /data/state.sqlite /data/backups
```

备份脚本使用 SQLite 在线备份 API，包含已经提交到 WAL 的状态，输出唯一文件名，不覆盖已有备份。脚本不需要解密密钥，也不会打印授权数据。应定期执行并把快照复制到另一台服务器或离线存储；同机备份不能覆盖整台主机或磁盘损失。解密密钥应独立保存，不能只留在同一块磁盘上。

恢复时先停止应用，保留当前完整数据目录作为回滚副本，把所选快照放入一个新的私有数据目录并命名为 `state.sqlite`，保持原加密密钥和正确 UID/GID，再切换挂载目录启动。不要混入旧目录中的 `-wal`、`-shm` 文件。恢复会回到快照时的授权和撤销状态；旧快照可能不包含之后的撤销，事故恢复时应评估是否需要让用户重新授权。

使用 SQLite 不会更改飞书的用户身份、应用权限或资源 ACL。容器更新时保留数据目录和密钥，现有会话可以继续使用；更换或丢失密钥需要重新授权。

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
