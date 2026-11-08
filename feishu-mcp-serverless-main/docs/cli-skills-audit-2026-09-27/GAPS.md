# 真实缺口与处理决定

判断基准：现有项目 `src/catalog.ts` 的实际过滤、`src/tools.ts` 的调用器，以及官方 CLI 固定提交 `32e14dea9041e7876c8b41aead963b10866267d1` 的实现。所有“缺失”均限定为当前 MCP；没有把接口未注册直接解释成飞书平台不支持。

## 1. 旧工具目录的身份元数据与当前 CLI 不一致

项目从 `AllToolsZh` 1291 个工具中过滤出支持 user 的 503 个，并强制 `withUserAccessToken`。因此不能靠给 `feishu_call_tool` 传 `useUAT:false` 来变成 bot。

| 具体动作 | 证据 | 处理 |
|---|---|---|
| 以用户身份发消息 | 旧目录有 `im.v1.message.create`，但不在现有 503 中；当前 CLI `shortcuts/im/im_messages_send.go` 的 `+messages-send` 与 IM Skill 有 user 路径，POST `/open-apis/im/v1/messages` | 校对当前飞书接口的身份与 scope、字段、返回值，给确定支持 user 的操作修正/增加目录定义；完成独立真实发送验收前只标候选，不宣称可用 |
| 读取/回复消息、部分群操作 | CLI registry 的相关接口匹配到上游目录，但因旧 metadata 被排除；详见 `cli-api-comparison.json` 中 `upstream_excluded` | 逐方法核对，禁止全量打开所有 tenant-only 工具 |
| 个人考勤打卡查询 | POST `/open-apis/attendance/v1/user_tasks/query`；当前 CLI registry 声明 `accessTokens: [user,tenant]`，旧 MCP 定义被过滤 | 与发送消息同类修复；已有 6 个 attendance 工具不是此个人查询的替代品 |

这些属于“现有服务需要修正”，不能用来排除对应 Skill。

## 2. CLI 已使用多组新接口，旧 MCP 目录没有

| 接口族/典型路径 | CLI 源码证据 | 影响 |
|---|---|---|
| `/open-apis/docs_ai/v1/documents/...` | `shortcuts/doc/docs_script.go`、`docs_create_async.go`、`docs_history.go` | XML/局部 fetch、异步创建、文档历史等；普通 Markdown 创建/读取和部分块编辑已有替代组合 |
| `/open-apis/sheet_ai/v2/spreadsheets/{token}/tools/invoke_read`、`invoke_write` | `shortcuts/sheets/sheet_ai_api.go` | typed cells、公式、样式、图表/透视等；需要解析 `tool_name` + JSON 字符串 `input/output`，读写入口不能混用 |
| `/open-apis/slides_ai/v1/xml_presentations/...` | `internal/registry/catalog/services/slides.json`、`shortcuts/slides/slides_create.go` | 原生幻灯片创建、读写页、历史、截图等；当前 MCP 无 Slides 核心工具 |
| `/open-apis/base/v3/bases/...`、`base_apps/...` | `shortcuts/base/base_ops.go`、`workflow_create.go`、`app_block_get_data.go` | 新 Base 对象、AppMode、Workspace、组件、表单、模板/工作流；已有 bitable CRUD 必须继续复用 |
| `/open-apis/spark/v1/...` | `shortcuts/apps/apps_release_common.go` 及 apps 模块 | 妙搭应用、会话、开发发布、DB/文件/自动化；不能拿 apaas 或 aily 当成同一系统 |
| `/open-apis/approval/v4/tasks`、`tasks/pass`、`approvals/search_launchable`、`instances/initiate` 等 | `internal/registry/catalog/services/approval.json` | 新审批列表、处理、定义和提单；现有只保留旧 `/tasks/query` |
| `/open-apis/okr/v2/...` | `internal/registry/catalog/services/okr.json` | 周期、O/KR、对齐、指标、评论；现有 v1 进展能力不等于全部 v2 管理 |
| `/open-apis/contact/v3/users/search`、`profile/v2/user_profiles/batch_query` | `shortcuts/contact/contact_search_user.go`、contact registry | 姓名/邮箱高级查找与个人状态；已有 user.get/list 是不同合同 |
| `/open-apis/vc/v1/meetings/search`、`notes/{id}`、`notes/{id}/unified_note_transcript` | `shortcuts/vc/vc_search.go`、`shortcuts/note/note_detail.go`、`note_transcript.go` | 全量会议搜索、Note 关系、统一逐字稿 |
| `/open-apis/minutes/v1/minutes/{token}/artifacts` 等 | `shortcuts/minutes/minutes_detail.go` 等 | 妙记 AI 产物、搜索/编辑；不能只给基本信息就称已读全文 |

接入决定：从这些已核对的合同增补对应能力；可组合达成的目标优先复用现有工具，不凭“路径不同”判定必须重写。对新增 API 必须核实应用类型、user/bot 支持、scope 和真实租户返回，不能直接把 CLI 的所有内部参数交给旧 SDK。

## 3. 同路径/同业务名称仍存在合同差异

- 自动比对 251 个 CLI 注册 API 方法，121 项在当前 503 目录找到相同 HTTP 方法和归一化路径，9 项仅在被排除的旧上游目录找到，121 项无同形端点。这不是功能支持率。
- 该表不包含全部 Shortcut 的传递依赖。399 个静态 Shortcut 定义另有源码索引；共享 helper、动态路径、服务端 action 仍按本文件和领域清单核对。
- 当前 Base CLI `filter-json`/CellValue、分页 offset/matrix 与 MCP 的 `conjunction/conditions`、record fields、cursor 不同；日期/选项/关联记录不能原样搬运。
- 当前旧 schema 会剥离未知字段。新 CLI 向同一会议 GET 传的新字段不一定能经旧 Zod 定义透传；“路径匹配”不代表新响应语义已得到保证。
- 邮件 send 已存在，不等于 CLI 默认“存草稿、再发送”的状态机存在；原生 Markdown 文件也不等于 docx 的 Markdown 内容。

处理决定：维护每个操作的输入转换、输出归一化、保留字段、分页、部分成功和副作用说明。不能通过放宽所有 schema 来掩盖不匹配。

## 4. 二进制与文件生命周期缺口

目前可见 Drive uploadPrepare/uploadFinish、import/exportTask 及下载 URL 相关元数据，但关键 upload_part、完整下载/导出材料化等闭环没有形成。MCP 调用器按 JSON 解析，不能把二进制响应当作普通 result。

影响：Drive 文件、原生 Markdown、文档/消息/任务附件、Base 附件、Slides 图片、画板预览、妙记原始音视频，以及妙搭文件存储。

处理决定：统一文件输入引用与输出材料化合同；区分工具宿主提供的文件、飞书 file_token、上传完成、导入任务完成、最终资源可读。不把本机绝对路径传给云函数，不把临时下载链接取得成功当成已保存文件。复用既有 OSS/函数能力按需适配，无须另建账号或一套凭据。

## 5. 实时监听和机器人运行形态

`lark-event` 的 event consume、邮件 watch、会中机器人持续事件消费依赖常驻连接/事件总线；事件订阅注册接口只完成注册。现有 FC 无状态短请求没有持久事件接收与消费合同。

处理决定：统一服务端 Webhook/事件接收器 + 持久游标/队列，MCP 暴露有界的订阅管理、读取增量、取消操作。若选常驻 WebSocket worker，应作为明确的运行组件，不把客户端长轮询偷偷当成已完成自动化。状态包括启动/ready、最后事件、丢失/过期和停止；事件触发不自动取得发消息/写资源授权。

应用机器人入会、离会、一些卡片事件响应属于身份专有能力。复用应用配置时仍需明确 operator identity，不能为“成功”静默替换用户身份。这里尚未做 bot 支持或云资源变更。

## 6. 技能发布通道与资源限制

[OpenAI 官方 MCP Skills 导入说明](https://developers.openai.com/plugins/build/mcp-server#import-skills-from-the-mcp-server)在本次查阅时说明：Scan Tools 最多导入 5 个唯一 Skill，单技能最多 100 文件，SKILL.md 256 KiB、单支持文件 1 MiB、单技能资源 5 MiB、合计生成档案 8 MiB；导入发生在提交时，运行时不实时读取这些 Skill。

这是该导入通道的限制，不是 MCP 协议要求，也不是减少飞书功能的理由。完整源码维护全部 28 个模块；优先验证正式插件包携带全部技能的发布/安装通道。若目标门户实际要求 MCP Scan 导入，则生成不超过 5 个领域入口，将所有模块的指导与引用编译为按需加载的资源文件，合并文件时保留模块索引、章节锚点和来源；要实测资源上限、自动触发和完整内容覆盖。不能把 550 个文件原样塞入 5 个各 100 文件的包后声称满足限制。

发布包不满足宿主限制时，应调整封装并保留内容；不能把“仅做 5 个技能”当成产品范围。

## 7. 不应由 Skill 替代的服务端约束

- 真实权限、身份绑定、scope、幂等、参数和返回校验、分页/批量限制属于 MCP 后端。
- 资源定位、任务路由、步骤编排、业务语义、用户输出属于 Skill。
- 精确编辑、完整转码/上传、事件持久化等需要程序实现；一段提示词不是实现。
- 有工具、可以被发现、模型调用成功、飞书写入正确、用户实际可用分别验收。

## 8. 现有工具发现与标注可一并修正

`src/tools.ts` 的发现逻辑按字符串过滤后沿原目录顺序返回；上轮真实搜索“日程”优先出现参与人删除/列表/添加，证明候选排序缺乏用户动作语义。全部操作继续可发现，但应加领域别名、读写/动作筛选与相关性排序。

`search.v2.message.create` 等 POST 搜索操作在现有 `annotationsFor` 的名称规则下会落入写入分类。后续应维护显式副作用元数据，保留通用执行器的保守提示，同时让确定只读操作可走 read_tool。不要把 HTTP POST 一概当写入。

本轮一次线上“发送消息”目录搜索返回 MCP 内部错误，未据此判断能力不存在；缺口判断来自固定版本源码和导出的目录。没有使用业务写入来探测能力。
