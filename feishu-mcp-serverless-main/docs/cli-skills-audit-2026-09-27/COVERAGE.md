# 飞书 CLI 全量 Skills → MCP 适配清单

日期：2026-09-27。范围：官方当前源码 28 个 Skill 入口，以及已安装 CLI v1.0.74 的 27 个入口。当前源码提交固定为 `32e14dea9041e7876c8b41aead963b10866267d1`；本文件中的“现有”指项目锁定的 MCP 0.5.1 目录经 user 身份过滤后的 503 个工具。

这是适配设计及源码能力核对，不是已安装技能或真实业务验收报告。“可适配”需要改写工具调用、参数和返回值；“部分”不能扩大为整域支持；“缺接口”指当前 MCP 缺失，不代表飞书平台不允许。所有入口都保留在范围内，缺口只限制具体动作。

调用约定：已有 9 个业务工具优先使用；其余操作通过 `feishu_search_tools → feishu_get_tool_schema → feishu_read_tool/feishu_call_tool`。以下原生名称用于定位，最终参数必须取实际 schema。当前按 HTTP/名称推断的读写标注需先修正个别搜索接口，不能仅凭工具名猜副作用。

| CLI Skill | 完整业务范围与现有 MCP 映射 | 需要适配、组合或补齐的部分 | 决定 |
|---|---|---|---|
| `lark-shared` | OAuth、身份、权限、错误恢复；现有服务 OAuth + `authen.v1.userInfo.get` | 将本机 config/login/logout、二维码、keychain、update、`--as` 改成远程连接说明；增加可读的当前身份/授权诊断。客户端退出不等于飞书撤销 | 保留并重写；本机管理命令是环境差异，不计业务缺失 |
| `lark-doc` | 搜索、Markdown 读写走专用工具；21 个 docx + 1 个 docs 原生工具支持块读写/转换；统计可对已读取文本计算 | 局部读、匹配替换、插入/移动等按原生块接口编排；保留块身份和格式。CLI `docs_ai` XML、历史回滚、封面、思维笔记和媒体链路不是已有 Markdown 工具的等价能力 | 全部模块纳入；文本/块能力适配，媒体/历史/新协议列明确缺口 |
| `lark-drive` | 52 个原生工具：文件列表、元数据、文件夹、复制/移动/删除、评论与回复、权限、版本、导入/导出任务；文件搜索使用 `feishu_search_files` | 保留知识整理、主题收集、权限治理三套组合流程。上传 prepare/finish 并不能代替 upload_part；导出任务成功不等于文件已下载。新预览、密级、评论 reaction 等逐接口补齐 | 全域纳入；JSON 管理可适配，二进制/新接口补齐 |
| `lark-wiki` | 16 个原生工具：空间、成员、节点创建/查询/移动/复制、标题、任务状态；`wiki.v2.space.getNode` 解包底层对象 | user 身份保持；Wiki token/obj token/space ID 分开。个人文档库语义、节点移出到 Drive、删除空间/节点等新快捷操作不能用相似名称代替 | 全域纳入；已有接口组合，其余按实际 endpoint 标缺口 |
| `lark-base` | 46 个 bitable + 3 个 base 工具；表/字段/记录/视图 CRUD、表单字段配置、角色成员；dashboard list/copy、workflow list/update 已有 | CLI base/v3 的记录矩阵、字段值、filter 与 bitable/v1 参数不同，需显式转换。AppMode、Workspace、模板中心、组件级 dashboard、workflow steps 创建/编辑、完整表单与分享链接/记录历史、附件等不能由同名域推定支持 | 全域纳入；已有 CRUD 和配置完整适配，复杂新对象补接口 |
| `lark-sheets` | 27 个原生工具：工作簿创建/元数据、子表查询、查找/替换、筛选及筛选视图、浮动图片、移动维度 | 单元格 CSV/typed values/公式/样式、行列插删、图表、透视、条件格式、迷你图、版本差异/历史等主要依赖 CLI sheet_ai/v2；当前 MCP 无常规 values 读写。创建空表不能当作创建有内容表格 | 全域纳入；已有 27 个操作适配，其余为真实后端差距 |
| `lark-slides` | 当前 catalog 无 slides/slides_ai 工具；Drive 元数据/权限只能辅助定位 | 创建/读取/逐页编辑、XML 元素、图片上传、截图、模板导入、历史回滚需要 slides_ai/v1 和媒体能力；本地视觉规划可复用但不是飞书操作成功 | 保留完整技能设计；现有 MCP 无原生 Slides 核心能力 |
| `lark-markdown` | 文件元数据、版本列表、权限可复用 Drive | 原生 `.md` 创建/读取/覆盖/patch/diff 需要下载和上传闭环。不得以创建 docx 的 Markdown 正文冒充原生 `.md` 文件 | 保留；补文件传输后才能完整执行 |
| `lark-calendar` | 39 个原生工具：主日历、事件 CRUD/search、instanceView/instances、参会人、RSVP、忙闲、ACL、订阅 | `+agenda` 可用主日历 + instanceView 分段/去重组合；重复日程保留实例范围。CLI 新 batch freebusy、room_find、suggestion、transfer/join、meeting relation 等要逐接口核对；旧 freebusy 可用于有明确身份和范围的组合查询，但不承诺同等推荐效果 | 全域纳入；常规日程和可组合功能适配，新服务端功能标差距 |
| `lark-contact` | `contact.v3.user.get/batch/list/findByDepartment`、部门查询；当前用户可用 authen | 姓名/邮箱/电话高级搜索 `contact/v3/users/search`、机器人搜索、个人状态 `profile/v2` 不在现有目录；已知 open_id 查询仍可用。不能把列表筛选说成全域搜索等价实现 | 全域纳入；基础查询适配，搜索/状态补接口 |
| `lark-im` | 32 个 im 工具：群查询/管理、成员、公告、标签页、置顶、反应、已有消息 patch/delete；另有 `search.v2.message.create` 搜索消息 | message create/reply/get/list 等被旧上游身份元数据过滤；当前 CLI 有 user 发送实现，属于元数据/目录差异待核验，不是平台绝对不支持。线程、Feed/标记、卡片回调、媒体各有缺口。按用户授权发送，失败不换身份重发 | 全域纳入；先修目录与身份差异，再完整适配消息流程 |
| `lark-mail` | 22 个原生工具：邮件 list/get/send、附件下载 URL、文件夹、邮件联系人、收信规则和订阅注册 | 搜索筛选表达式需核对；草稿、thread、reply/forward 保真、标签/已读/软删除、投递状态/撤回、模板/回执、新邮件消费不完整。原 send 不提供 CLI 草稿默认语义，不能假称已存草稿 | 全域纳入；已有读发和管理适配，草稿/会话/实时能力补齐 |
| `lark-task` | 74 个原生工具：任务 CRUD、列表、完成/重开、成员、提醒、评论、子任务、清单、分组、自定义字段；`+complete/reopen` 可由 task patch 实现 | 附件上传、新 search/related/ancestor/agent 步骤等按命令核对，缺的不是新增 SKILL.md 能解决。完成与重开字段按 schema 处理，不创建替代任务 | 全域纳入；现有任务能力完整路由，补具体新增接口 |
| `lark-approval` | `approval.v4.task.query` 当前只有一个可调用工具，旧路径 `/tasks/query` | 当前 CLI 的 `/tasks` 查询与旧路径参数不相同；定义搜索、详情、原生发起、同意/拒绝/转交/加签/退回/催办/撤回/抄送等新路径不在现有目录。不能把“审批域有 1 个工具”说成审批可全做 | 全域纳入；旧查询单独适配，其余补接口 |
| `lark-attendance` | catalog 中 attendance 有 6 个其他操作，但没有此 Skill 要求的个人打卡查询 | `/attendance/v1/user_tasks/query` 存在于上游目录却被旧 accessTokens 过滤；当前 CLI registry 声明 user/tenant。需要校正身份元数据并真实验收，不能仅打开过滤就宣布成功 | 保留；属于可修目录缺口，不是删掉考勤 Skill |
| `lark-okr` | 6 个 v1 工具：userOkr.list、okr.batchGet、progressRecord create/get/update/delete | CLI 当前以 v2 周期、O/KR、权重、排序、对齐、指标、评论为核心；v1 进展不等于 v2 指标或评分。保留所有规则，分别适配已有能力和新增路径 | 全域纳入；v1 可用部分适配，v2 完整管理补接口 |
| `lark-whiteboard` | `board.v1.whiteboardNode.list` 可以读取节点结构 | 节点写入、Mermaid/PlantUML/SVG 转换、预览/SVG/source 导出需要额外服务和媒体路径；CLI 还依赖 whiteboard-cli。读取节点不能冒充可编辑/可导出画板 | 保留；节点读适配，其余补后端及渲染能力 |
| `lark-apps` | 当前 Spark/Miaoda 服务无对应工具。apaas 的 7 个工具、aily 的 19 个工具并非此 Skill 的同一产品合同 | Spark 应用 CRUD、Git 开发、云端会话、发布、数据库、文件存储、环境变量、日志、成员/角色、自动化、API Key、插件安装等需要 spark/v1 或环境执行器；不能用 apaas/aily 同名“应用”替代 | 保留全模块方案；现有 MCP 不具备妙搭开发发布闭环 |
| `lark-event` | 服务端目前仅 tools 能力；现有某些订阅注册 API 不构成事件消费服务 | CLI daemon/WebSocket/stdout NDJSON、事件路由、ready/退出/丢失契约需要长期事件接收器或 Webhook+队列。FC 短请求不能直接等价为持续监听 | 保留；真实运行形态缺口，需单独事件适配 |
| `lark-meeting` | 24 个 vc + 3 个 minutes 工具：会议/录制基础读取、列表/按号定位、参会信息、部分控制、妙记基本信息/媒体信息/统计 | CLI 新会议搜索、活跃会议/实时事件、Note/统一逐字稿、Minutes artifacts/搜索/编辑、会中截图/互动缺失；机器人加入/离开还涉及 bot 身份。已知会议可用 get+recording 组合，不保证旧 schema 包含 CLI 新查询参数 | 统一会议领域完整纳入；已有接口适配，缺失产物/实时/身份分别补齐 |
| `lark-vc` | v1.0.74 是独立会议 Skill；当前版本为 lark-meeting 兼容入口 | 历史查询/录制规则迁入 meeting；旧名称仍可识别，不维护两份互相冲突正文 | 保留兼容入口，能力由 meeting 承接 |
| `lark-vc-agent` | v1.0.74 有机器人参会流程；当前版本为 meeting 兼容入口 | 保留 bot 入会、邀请、离会/结束的身份与授权语义；不能偷偷用 user 工具代替机器人身份 | 保留兼容入口及机器人流程缺口 |
| `lark-minutes` | v1.0.74 独立妙记 Skill；当前版本为 meeting 兼容入口 | 旧文档中的妙记读取/产物/上传等规则迁入 meeting，并保留已有 3 个 minutes 工具及具体缺口 | 保留兼容入口，能力由 meeting 承接 |
| `lark-note` | v1.0.74 独立智能纪要 Skill；当前版本为 meeting 兼容入口 | Note 逻辑对象与 Doc token 不同；缺 note detail/unified transcript 时不能靠普通 docx 读取伪装完整 Note | 保留兼容入口及 Note 缺口 |
| `lark-workflow-meeting-summary` | 已知会议、录制、可访问的纪要文档可用 vc + doc 工具组合成有来源报告 | 全时间范围会议搜索、智能纪要/逐字稿、妙记 artifacts 缺口要继承；无权限/无产物/缺接口分开。用户未要求，不创建文档或发送报告 | 保留完整工作流；覆盖范围随真实数据明确披露 |
| `lark-workflow-standup-report` | 主日历+instanceView、task.v2.task.list 等组合；按日期、时区、状态生成日程待办摘要 | CLI 自动分页/日期解析/去重改为技能或确定性后端逻辑；未完成过滤明确；摘要不自动创建待办或提醒。日程推算空闲与 freebusy 服务结论分开 | 可组合适配；所有查询步骤仍需真实权限验收 |
| `lark-openapi-explorer` | 4 个发现/调用入口覆盖全部 503 个原生工具；官方文档检索可支持探索 | 当前 call_tool 只接受目录中的名称，不能像 CLI `api METHOD path` 任意调用；发现目录外接口只能给规范/缺口，接入后再执行。剩余业务域全保留经此入口可达 | 完整保留并改成 MCP 发现/扩展流程 |
| `lark-skill-maker` | 技能设计、描述/触发、工作流、参数/错误说明无需飞书 API | 将 CLI 模板改成 MCP 工具合同、依赖、引用及验收模板；本机文件写入仅在宿主有文件能力时执行，否则交付包内容。不得指示运行不存在的 CLI | 完整保留并改为插件技能编写流程 |

## 同域之外的全部 MCP 能力

CLI 的 28 个入口不是缩减 MCP 工具目录的白名单。所有 503 个现有工具均记录于 [mcp-routing.json](mcp-routing.json)，每项有领域技能或 `lark-openapi-explorer` 路由、真实原生工具名、HTTP 方法/路径、身份元数据与“目录证据，非真实验收”标记。

例如 aily、apaas、acs、directory、helpdesk、payroll、trust_party 等不强行塞进不相干的 CLI Skill，也不删除：通过 explorer 发现原生能力，按实际 schema 执行；需要成熟跨工具业务流程时再以引用模块补充。这是保留全部能力的路由方式，不是延期提供现有工具。

## 引用文件处理

当前 550 个文件、基线 437 个文件均有路径/大小/SHA-256 和版本差异索引：[skill-inventory.json](skill-inventory.json)。内容文件、场景手册、XML/DSL 例子、脚本与资产分别适配，不能只复制 28 份 SKILL.md。

- 业务规则、资源身份、真实 API 限制、局部编辑与恢复规则：保留并按 MCP 语义改写。
- CLI 参数、Shell、stdin/stdout、keychain、二维码登录、daemon、local path：替换为实际宿主与云端接口，不能原样保留为执行要求。
- 辅助脚本：检查调用依赖；纯文本/数据转换可移植，依赖 lark-cli 或本地应用的脚本不能声称已可运行。
- 资产与示例：保留适用格式和来源；不要把示例图片路径识别成遗漏引用文件。
- 上游“最高优先级”、重复确认、“必须高密度/必须配图”等绝对化写作要求：按用户指令优先和具体任务适配，不能作为协议限制照搬。
- 当前本机 7 份技能有用户定制，后续建立独立 MCP 适配包，不能覆盖这些 CLI 技能。

## 证据定位

官方技能源：[当前固定提交](https://github.com/larksuite/cli/tree/32e14dea9041e7876c8b41aead963b10866267d1/skills)、[已安装版本对应技能](https://github.com/larksuite/cli/tree/d4168ab84f96a846ab8d061f5bf66219671e4a40/skills)。每个名称对应目录的 SKILL.md；文件级引用和源码行号见 JSON 索引。

对应后端缺口及原始路径见 [GAPS.md](GAPS.md)。端点同形的 121 项不能称为“121 个已验收功能”；不同端点也可能通过组合达到部分相同目标。
