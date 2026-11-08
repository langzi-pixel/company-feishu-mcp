<a id="s-580fd4dca62b3c36"></a>

## SKILL.md


# workflow-standup-report

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 明确日期和时区，分别读取日历实例及未完成任务；确保分页、全天事项、重复事件范围正确。

2. 按实际数据整理时间安排、进展和阻塞项，标注部分来源失败。只做摘要时不创建任务、改截止时间、发消息或建立提醒。

3. 用户要求发送时，再解析具体收件人并调用消息技能；不要因这是一份日报就自动发送。

## 按需参考

- [工具与合同](lark-workflow-standup-report-0.md#s-a7229c6bec47200c)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-workflow-standup-report-0.md#s-431f9e8db5a4c9ee)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-a7229c6bec47200c"></a>

## references/mcp-tools.md

# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `calendar.v4.calendarAcl.create` | [Feishu/Lark]-日历-日历访问控制-创建访问控制-调用该接口以当前身份（应用或用户）为指定日历添加访问控制，即日历成员权限 | feishu_call_tool |
| `calendar.v4.calendarAcl.delete` | [Feishu/Lark]-日历-日历访问控制-删除访问控制-调用该接口以当前身份（应用或用户）删除指定日历内的某一访问控制，即成员权限 | feishu_call_tool |
| `calendar.v4.calendarAcl.list` | [Feishu/Lark]-日历-日历访问控制-获取访问控制列表-调用该接口以当前身份（应用或用户）获取指定日历的访问控制列表 | feishu_read_tool |
| `calendar.v4.calendarAcl.subscription` | [Feishu/Lark]-日历-日历访问控制-订阅日历访问控制变更事件-调用该接口以用户身份订阅指定日历下的访问控制变更事件 | feishu_call_tool |
| `calendar.v4.calendarAcl.unsubscription` | [Feishu/Lark]-日历-日历访问控制-取消订阅日历访问控制变更事件-调用该接口以用户身份取消订阅指定日历下的访问控制变更事件 | feishu_call_tool |
| `calendar.v4.calendar.create` | [Feishu/Lark]-日历-日历管理-创建共享日历-调用该接口为当前身份（应用或用户）创建一个共享日历 | feishu_call_tool |
| `calendar.v4.calendar.delete` | [Feishu/Lark]-日历-日历管理-删除共享日历-调用该接口以当前身份（应用或用户）删除某一指定的共享日历 | feishu_call_tool |
| `calendar.v4.calendarEventAttendee.batchDelete` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-删除日程参与人-调用该接口以当前身份（应用或用户）删除指定日程的一个或多个参与人 | feishu_call_tool |
| `calendar.v4.calendarEventAttendeeChatMember.list` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-获取日程参与群成员列表-调用该接口以当前身份（应用或用户）获取日程的群组类型参与人的群成员列表 | feishu_read_tool |
| `calendar.v4.calendarEventAttendee.create` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-添加日程参与人-调用该接口以当前身份（应用或用户）为指定日程添加一个或多个参与人，参与人类型包括用户、群组、会议室以及邮箱 | feishu_call_tool |
| `calendar.v4.calendarEventAttendee.list` | [Feishu/Lark]-日历-日程参与人管理（含会议室）-获取日程参与人列表-调用该接口以当前身份（应用或用户）获取日程的参与人列表 | feishu_read_tool |
| `calendar.v4.calendarEvent.create` | [Feishu/Lark]-日历-日程管理-创建日程-调用该接口以当前身份（应用或用户）在指定日历上创建一个日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.delete` | [Feishu/Lark]-日历-日程管理-删除日程-调用该接口以当前身份（应用或用户）删除指定日历上的一个日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.get` | [Feishu/Lark]-日历-日程管理-获取日程-调用该接口以当前身份（应用或用户）获取指定日历内的某一日程信息，包括日程的标题、时间段、视频会议信息、公开范围以及参与人权限等 | feishu_read_tool |
| `calendar.v4.calendarEvent.instanceView` | [Feishu/Lark]-日历-日程管理-查询日程视图-调用该接口以用户身份查询指定日历下的日程视图。与[获取日程列表]不同的是，当前接口会按照重复日程的重复性规则展开成多个日程实例（instance），并根据查询的时间区间返回相应的日程实例信息 | feishu_read_tool |
| `calendar.v4.calendarEvent.instances` | [Feishu/Lark]-日历-日程管理-获取重复日程实例-调用该接口以当前身份（应用或用户）获取指定日历中的某一重复日程信息 | feishu_read_tool |
| `calendar.v4.calendarEvent.list` | [Feishu/Lark]-日历-日程管理-获取日程列表-调用该接口以当前身份（应用或用户）获取指定日历下的日程列表 | feishu_read_tool |
| `calendar.v4.calendarEventMeetingChat.create` | [Feishu/Lark]-日历-会议群-创建会议群-调用该接口以当前身份（应用或用户）为指定日程创建一个会议群 | feishu_call_tool |
| `calendar.v4.calendarEventMeetingChat.delete` | [Feishu/Lark]-日历-会议群-解绑会议群-调用该接口以当前身份（应用或用户）为日程解绑已创建的会议群 | feishu_call_tool |
| `calendar.v4.calendarEventMeetingMinute.create` | [Feishu/Lark]-日历-会议纪要-创建会议纪要-调用该接口为指定的日程创建会议纪要。纪要以文档形式展示，成功创建后会返回纪要文档 URL | feishu_call_tool |
| `calendar.v4.calendarEvent.patch` | [Feishu/Lark]-日历-日程管理-更新日程-调用该接口以当前身份（应用或用户）更新指定日历上的一个日程，包括日程标题、描述、开始与结束时间、视频会议以及日程地点等信息 | feishu_call_tool |
| `calendar.v4.calendarEvent.reply` | [Feishu/Lark]-日历-日程管理-回复日程-调用该接口以当前身份（应用或用户）回复日程 | feishu_call_tool |
| `calendar.v4.calendarEvent.search` | [Feishu/Lark]-日历-日程管理-搜索日程-调用该接口搜索指定日历下的相关日程，支持关键词搜索、过滤条件搜索 | feishu_read_tool |
| `calendar.v4.calendarEvent.subscription` | [Feishu/Lark]-日历-日程管理-订阅日程变更事件-调用该接口以用户身份订阅指定日历下的日程变更事件 | feishu_call_tool |
| `calendar.v4.calendarEvent.unsubscription` | [Feishu/Lark]-日历-日程管理-取消订阅日程变更事件-调用该接口以用户身份取消订阅指定日历下的日程变更事件 | feishu_call_tool |
| `calendar.v4.calendar.get` | [Feishu/Lark]-日历-日历管理-查询日历信息-调用该接口以当前身份（应用或用户）查询指定日历的信息 | feishu_read_tool |
| `calendar.v4.calendar.list` | [Feishu/Lark]-日历-日历管理-查询日历列表-调用该接口分页查询当前身份（应用或用户）的日历列表 | feishu_read_tool |
| `calendar.v4.calendar.patch` | [Feishu/Lark]-日历-日历管理-更新日历信息-调用该接口以当前身份（应用或用户）修改指定日历的标题、描述、公开范围等信息 | feishu_call_tool |
| `calendar.v4.calendar.primary` | [Feishu/Lark]-日历-日历管理-查询主日历信息-调用该接口获取当前身份（应用或用户）的主日历信息 | feishu_read_tool |
| `calendar.v4.calendar.search` | [Feishu/Lark]-日历-日历管理-搜索日历-调用该接口通过关键字搜索日历，搜索结果为标题或描述包含关键字的公共日历或用户主日历 | feishu_read_tool |
| `calendar.v4.calendar.subscribe` | [Feishu/Lark]-日历-日历管理-订阅日历-调用该接口以当前身份（应用或用户）订阅指定的日历 | feishu_call_tool |
| `calendar.v4.calendar.subscription` | [Feishu/Lark]-日历-日历管理-订阅日历变更事件-调用该接口为当前用户身份订阅[日历变更事件] | feishu_call_tool |
| `calendar.v4.calendar.unsubscribe` | [Feishu/Lark]-日历-日历管理-取消订阅日历-调用该接口以当前身份（应用或用户）取消指定日历的订阅状态 | feishu_call_tool |
| `calendar.v4.calendar.unsubscription` | [Feishu/Lark]-日历-日历管理-取消订阅日历变更事件-调用该接口为当前用户身份取消订阅[日历变更事件] | feishu_call_tool |
| `calendar.v4.exchangeBinding.create` | [Feishu/Lark]-日历-同步 Exchange 日历信息-将 Exchange 账户绑定到飞书账户-调用该接口将 Exchange 账户绑定到飞书账户，进而支持 Exchange 日历的导入 | feishu_call_tool |
| `calendar.v4.exchangeBinding.delete` | [Feishu/Lark]-日历-同步 Exchange 日历信息-解除 Exchange 账户绑定-调用该接口解除 Exchange 账户和飞书账户的绑定关系，Exchange 账户解除绑定后才能和其他飞书账户继续绑定 | feishu_call_tool |
| `calendar.v4.exchangeBinding.get` | [Feishu/Lark]-日历-同步 Exchange 日历信息-查询 Exchange 账户的绑定状态-调用该接口获取 Exchange 账户的绑定状态，包括 Exchange 日历的同步状态 | feishu_read_tool |
| `calendar.v4.freebusy.list` | [Feishu/Lark]-日历-日历管理-查询主日历日程忙闲信息-调用该接口查询指定用户的主日历忙闲信息，或者查询指定会议室的忙闲信息 | feishu_read_tool |
| `calendar.v4.setting.generateCaldavConf` | [Feishu/Lark]-日历-同步到本地日历-生成 CalDAV 配置-调用该接口为当前用户生成一个 CalDAV 账号密码，用于将飞书日历信息同步到本地设备日历 | feishu_call_tool |
| `task.v1.task.batchDeleteCollaborator` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-批量删除执行者-该接口用于批量删除执行者 | feishu_call_tool |
| `task.v1.task.batchDeleteFollower` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-批量删除关注人-该接口用于批量删除关注人 | feishu_call_tool |
| `task.v1.taskCollaborator.create` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-新增执行者-该接口用于新增任务执行者，一次性可以添加多个执行者。只有任务的创建者和执行者才能添加执行者，关注人无权限添加 | feishu_call_tool |
| `task.v1.taskCollaborator.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-删除指定执行者-该接口用于删除任务执行者 | feishu_call_tool |
| `task.v1.taskCollaborator.list` | [Feishu/Lark]-历史版本（不推荐）-任务-执行者-获取执行者列表-该接口用于查询任务执行者列表，支持分页，最大值为50 | feishu_read_tool |
| `task.v1.taskComment.create` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-创建评论-该接口用于创建和回复任务的评论。当parent_id字段为0时，为创建评论；当parent_id不为0时，为回复某条评论 | feishu_call_tool |
| `task.v1.taskComment.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-删除评论-该接口用于通过评论ID删除评论 | feishu_call_tool |
| `task.v1.taskComment.get` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-获取评论详情-该接口用于通过评论ID获取评论详情 | feishu_read_tool |
| `task.v1.taskComment.list` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-获取评论列表-该接口用于查询任务评论列表，支持分页，最大值为100 | feishu_read_tool |
| `task.v1.taskComment.update` | [Feishu/Lark]-历史版本（不推荐）-任务-评论-更新评论-该接口用于更新评论内容 | feishu_call_tool |
| `task.v1.task.complete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-完成任务-该接口用于将任务状态修改为“已完成”。完成任务是指整个任务全部完成，而不支持执行者分别完成任务，执行成功后，任务对所有关联用户都变为完成状态 | feishu_call_tool |
| `task.v1.task.create` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-创建任务-该接口可以创建一个任务，支持填写任务的基本信息，包括任务的标题，描述及协作者等。在此基础上，创建任务时可以设置截止时间和重复规则，将任务设置为定期执行的重复任务。通过添加协作者，则可以让其他用户协同完成该任务。此外，接口也提供了一些支持自定义内容的字段，调用方可以实现定制化效果，如完成任务后跳转到指定结束界面 | feishu_call_tool |
| `task.v1.task.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-删除任务-该接口用于删除任务 | feishu_call_tool |
| `task.v1.taskFollower.create` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-新增关注人-该接口用于新增任务关注人。可以一次性添加多位关注人。关注人ID要使用表示用户的ID | feishu_call_tool |
| `task.v1.taskFollower.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-删除指定关注人-该接口用于删除任务关注人 | feishu_call_tool |
| `task.v1.taskFollower.list` | [Feishu/Lark]-历史版本（不推荐）-任务-关注人-获取关注人列表 | feishu_read_tool |
| `task.v1.task.get` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-查询指定任务-该接口用于获取任务详情，包括任务标题、描述、时间、来源等信息 | feishu_read_tool |
| `task.v1.task.list` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-查询所有任务-以分页的方式获取任务列表。当使用user_access_token时，获取与该用户身份相关的所有任务。当使用tenant_access_token时，获取以该应用身份通过“创建任务“接口创建的所有任务（并非获取该应用所在租户下所有用户创建的任务）。本接口支持通过任务创建时间以及任务的完成状态对任务进行过滤 | feishu_read_tool |
| `task.v1.task.patch` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-更新任务-该接口用于修改任务的标题、描述、时间、来源等相关信息 | feishu_call_tool |
| `task.v1.taskReminder.create` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-新增提醒时间-该接口用于创建任务的提醒时间。提醒时间在截止时间基础上做偏移，但是偏移后的结果不能早于当前时间 | feishu_call_tool |
| `task.v1.taskReminder.delete` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-删除提醒时间-删除提醒时间，返回结果状态 | feishu_call_tool |
| `task.v1.taskReminder.list` | [Feishu/Lark]-历史版本（不推荐）-任务-提醒-查询提醒时间列表-返回提醒时间列表，支持分页，最大值为50 | feishu_read_tool |
| `task.v1.task.uncomplete` | [Feishu/Lark]-历史版本（不推荐）-任务-任务管理-取消完成任务-该接口用于取消任务的已完成状态 | feishu_call_tool |
| `task.v2.attachment.delete` | [Feishu/Lark]-任务-附件-删除附件-提供一个附件GUID，删除该附件。删除后该附件不可再恢复 | feishu_call_tool |
| `task.v2.attachment.get` | [Feishu/Lark]-任务-附件-获取附件-提供一个附件GUID，返回附件的详细信息，包括GUID，名称，大小，上传时间，临时可下载链接等 | feishu_read_tool |
| `task.v2.attachment.list` | [Feishu/Lark]-任务-附件-列取附件-列取一个资源的所有附件。返回的附件列表支持分页，按照附件上传时间排序。每个附件会返回一个可供下载的临时url，有效期为3分钟，最多可以支持3次下载。如果超过使用限制，需要通过本接口获取新的临时url | feishu_read_tool |
| `task.v2.comment.create` | [Feishu/Lark]-任务-评论-创建评论-为一个任务创建评论，或者回复该任务的某个评论。若要创建一个回复评论，需要在创建时设置`reply_to_comment_id`字段。被回复的评论和新建的评论必须属于同一个任务 | feishu_call_tool |
| `task.v2.comment.delete` | [Feishu/Lark]-任务-评论-删除评论-删除一条评论。评论被删除后，将无法进行任何操作，也无法恢复 | feishu_call_tool |
| `task.v2.comment.get` | [Feishu/Lark]-任务-评论-获取评论详情-给定一个评论的ID，返回评论的详情，包括内容，创建人，创建时间和更新时间等信息 | feishu_read_tool |
| `task.v2.comment.list` | [Feishu/Lark]-任务-评论-获取评论列表-给定一个资源，返回该资源的评论列表。支持分页。评论可以按照创建时间的正序（asc, 从最老到最新），或者逆序（desc，从最老到最新），返回数据 | feishu_read_tool |
| `task.v2.comment.patch` | [Feishu/Lark]-任务-评论-更新评论-更新一条评论。更新时，将`update_fields`字段中填写所有要修改的评论的字段名，同时在`comment`字段中填写要修改的字段的新值即可。更新接口规范详情见[功能概述]中的“ 关于资源的更新”章节。目前只支持更新评论的"conent"字段 | feishu_call_tool |
| `task.v2.customField.add` | [Feishu/Lark]-任务-自定义字段-将自定义字段加入资源-将自定义字段加入一个资源。目前资源类型支持清单tasklist。一个自定义字段可以加入多个清单中。加入后，该清单可以展示任务的该字段的值，同时基于该字段实现筛选，分组等功能。如果自定义字段的设置被更新，字段加入的所有资源都能收到这个更新，并进行相应的展示 | feishu_call_tool |
| `task.v2.customField.create` | [Feishu/Lark]-任务-自定义字段-创建自定义字段-创建一个自定义字段，并将其加入一个资源上（目前资源只支持清单）。创建自定义字段必须提供字段名称，类型和相应类型的设置。目前任务自定义字段支持数字(number)，成员(member)，日期(datetime)，单选(single_select),多选(multi_select), 文本(text)几种类型。分别使用"number_setting", "member_setting", "datetime_setting", "single_select_setting", "multi_select_setting","text_setting"来设置。例如创建一个数字类型的自定义字段，并添加到guid为"ec5ed63d-a4a9-44de-a935-7ba243471c0a"的清单，可以这样发请求。```POST /task/v2/custom_fields{ "name": "价格", "type": "number", "resource_type": "tasklist", "resource_id": "ec5ed63d-a4a9-44de-a935-7ba243471c0a", "number_setting": { "format": "cny", "decimal_count": 2, "separator": "thousand" }}```表示创建一个叫做“价格”的自定义字段，保留两位小数。在界面上显示时采用人民币的格式，并显示千分位分割符。类似的，创建一个单选字段，可以这样调用接口：```POST /task/v2/custom_fields{ "name": "优先级", "type": "single_select", "resource_type": "tasklist", "resource_id": "ec5ed63d-a4a9-44de-a935-7ba243471c0a", "single_select_setting": { "options": [ { "name": "高", "color_index": 1 }, { "name": "中", "color_index": 11 }, { "name": "低", "color_index": 16 } ] }}```表示创建一个叫“优先级”的单选，包含“高”，“中”，“低”三个选项，每个选项设置一个颜色值 | feishu_call_tool |
| `task.v2.customField.get` | [Feishu/Lark]-任务-自定义字段-获取自定义字段-根据一个自定义字段的GUID，获取其详细的设置信息 | feishu_read_tool |
| `task.v2.customField.list` | [Feishu/Lark]-任务-自定义字段-列取自定义字段-列取用户可访问的自定义字段列表。如果不提供`resource_type`和`resource_id`参数，则返回用户可访问的所有自定义字段。如果提供`resource_type`和`resource_id`，则返回该资源下的自定义字段。目前`resource_type`仅支持"tasklist"，此时`resource_id`应为一个清单的tasklist_guid。该接口支持分页 | feishu_read_tool |
| `task.v2.customFieldOption.create` | [Feishu/Lark]-任务-自定义字段选项-创建自定义任务选项-为单选或多选字段添加一个自定义选项。一个单选/多选字段最大支持100个选项。新添加的选项如果不隐藏，其名字不能和已存在的不隐藏选项的名字重复 | feishu_call_tool |
| `task.v2.customFieldOption.patch` | [Feishu/Lark]-任务-自定义字段选项-更新自定义字段选项-根据一个自定义字段的GUID和其选项的GUID，更新该选项的数据。要更新的字段必须是单选或者多选类型，且要更新的字段必须归属于该字段。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`option`字段中填写要修改的字段的新值即可。`update_fields`支持的字段包括：* `name`: 选项名称* `color_index`: 选项的颜色索引值* `is_hidden`: 是否从界面上隐藏* `insert_before`: 将当前option放到同字段某个option之前的那个option_guid。* `insert_after`: 将当前option放到同字段某个option之后的那个option_guid | feishu_call_tool |
| `task.v2.customField.patch` | [Feishu/Lark]-任务-自定义字段-更新自定义字段-更新一个自定义字段的名称和设定。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`custom_field`字段中填写要修改的字段的新值即可。自定义字段不允许修改类型，只能根据类型修改其设置。`update_fields`支持更新的字段包括：* `name`：自定义字段名称* `number_setting` ：数字类型设置（当且仅当要更新的自定义字段类型是数字时)* `member_setting` ：人员类型设置（当且仅当要更新的自定义字段类型是人员时)* `datetime_setting` ：日期类型设置 (当且仅当要更新的自定义字段类型是日期时)* `single_select_setting`：单选类型设置 (当且仅当要更新的自定义字段类型是单选时)* `multi_select_setting`：多选类型设置 (当且仅当要更新的自定义字段类型是多选时)* `text_setting`: 文本类型设置（目前文本类型没有可设置项）当更改某个设置时，如果不填写一个字段，表示不覆盖原有的设定。比如，对于一个数字，原有的setting是:```json"number_setting": { "format": "normal", "decimal_count": 2, "separator": "none", "custom_symbol": "L", "custom_symbol_position": "right"}```使用如下参数调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "number_setting": { "decimal_count": 4 } }, "update_fields": ["number_setting"]}```表示仅仅将小数位数从2改为4，其余的设置`format`, `separator`, `custom_field`等都不变。对于单选/多选类型的自定义字段，其设定是一个选项列表。更新时，使用方式接近使用App的界面。使用者不必传入字段的所有选项，而是只需要提供最终希望界面可见（is_hidden=false) 的选项。原有字段中的选项如果没有出现在输入中，则被置为`is_hidden=true`并放到所有可见选项之后。对于某一个更新的选项，如果提供了option_guid，将视作更新该选项（此时option_guid必须存在于当前字段，否则会返回错误）；如果不提供，将视作新建一个选项（新的选项的option_guid会在reponse中被返回)。例如，一个单选字段原来有3个选项A，B，C，D。其中C是隐藏的。用户可以这样更新选项：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [ { "name": "E", "color_index": 25 }, { "guid": "<option_guid of A>" "name": "A2" }, { "guid": "<option_guid of C>", }, ] } }, "update_fields": ["single_select_setting"]}```调用后最终得到了新的选项列表E, A, C, B, D。其中：* 选项E被新建出来，其`color_index`被设为了25。* 选项A被更新，其名称被改为了"A2"。但其color_index因为没有设置而保持不变；* 选项整体顺序遵循用户的输入顺序，即E，A，C。同时E，A，C作为直接的输入，其is_hidden均被设为了false，其中，C原本是is_hidden=true，也会被设置为is_hidden=false。* 选项B和D因为用户没有输入，其`is_hidden`被置为了true，并且被放到了所有用户输入的选项之后。如果只是单纯的希望修改用户可见的选项的顺序，比如从原本的选项A,B,C修改为C,B,A，可以这样调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [ { "guid": "<option_guid_of_C>" }, { "guid": "<option_guid of B>" }, { "guid": "<option_guid of A>", }, ] } }, "update_fields": ["single_select_setting"]}```如果希望直接将字段里的所有选项都标记为不可见，可以这样调用接口：```PATCH /task/v2/custom_fields/:custom_field_guid{ "custom_field": { "single_select_setting": { "optoins": [] } }, "update_fields": ["single_select_setting"]}```更新单选/多选字段的选项必须满足“可见选项名字不能重复”的约束。否则会返回错误。开发者需要自行保证输入的选项名不可以重复。如希望只更新单个选项，或者希望单独设置某个选项的is_hidden，本接口无法支持，但可以使用[更新自定义字段选项]接口实现 | feishu_call_tool |
| `task.v2.customField.remove` | [Feishu/Lark]-任务-自定义字段-将自定义字段移出资源-将自定义字段从资源中移出。移除后，该资源将无法再使用该字段。目前资源的类型支持"tasklist"。如果要移除自定义字段本来就不存在于资源，本接口将正常返回。注意自定义字段是通过清单来实现授权的，如果将自定义字段从所有关联的清单中移除，就意味着任何调用身份都无法再访问改自定义字段 | feishu_call_tool |
| `task.v2.section.create` | [Feishu/Lark]-任务-自定义分组-创建自定义分组-为清单或我负责的任务列表创建一个自定义分组。创建时可以需要提供名称和可选的配置。如果不指定位置，新分组会放到指定resource的自定义分组列表的最后。当在清单中创建自定义分组时，需要设置`resourse_type`为"tasklist", `resource_id`设为清单的GUID。当为我负责任务列表中创建自定义分组时，需要设置`resource_type`为"my_tasks"，不需要设置`resource_id`。调用身份只能为自己的我负责的任务列表创建自定义分组 | feishu_call_tool |
| `task.v2.section.delete` | [Feishu/Lark]-任务-自定义分组-删除自定义分组-删除一个自定义分组。删除后该自定义分组中的任务会被移动到被删除自定义分组所属资源的默认自定义分组中。不能删除默认的自定义分组 | feishu_call_tool |
| `task.v2.section.get` | [Feishu/Lark]-任务-自定义分组-获取自定义分组详情-获取一个自定义分组详情，包括名称，创建人等信息。如果该自定义分组归属于一个清单，还会返回清单的摘要信息 | feishu_read_tool |
| `task.v2.section.list` | [Feishu/Lark]-任务-自定义分组-获取自定义分组列表-获取一个资源下所有的自定义分组列表。支持分页。返回结果按照自定义分组在界面上的顺序排序 | feishu_read_tool |
| `task.v2.section.patch` | [Feishu/Lark]-任务-自定义分组-更新自定义分组-更新自定义分组，可以更新自定义分组的名称和位置。更新时，将`update_fields`字段中填写所有要修改的字段名，同时在`section`字段中填写要修改的字段的新值即可。调用约定详情见[功能概述]中的“ 关于资源的更新”章节。目前支持更新的字段包括：* `name` - 自定义字段名字;* `insert_before` - 要让当前自定义分组放到某个自定义分组前面的secion_guid，用于改变当前自定义分组的位置;* `insert_after` - 要让当前自定义分组放到某个自定义分组后面的secion_guid，用于改变当前自定义分组的位置。`insert_before`和`insert_after`如果填写，必须是同一个资源的合法section_guid。注意不能同时设置`insert_before`和`insert_after` | feishu_call_tool |
| `task.v2.section.tasks` | [Feishu/Lark]-任务-自定义分组-获取自定义分组任务列表-列取一个自定义分组里的所有任务。支持分页。任务按照自定义排序的顺序返回。本接口支持简单的过滤 | feishu_read_tool |
| `task.v2.task.addDependencies` | [Feishu/Lark]-任务-任务-添加依赖-为一个任务添加一个或多个依赖。可以添加任务的前置依赖和后置依赖。存在依赖关系的任务如果在同一个清单，可以通过清单的甘特图来展示其依赖关系。本接口也可以用于修改一个现有依赖的类型（前置改为后置或者后置改为前置）。注意：添加的依赖的`task_guid`不能重复，也不能添加当前任务为自己的依赖。尝试添加一个已经存在的依赖会被自动忽略 | feishu_call_tool |
| `task.v2.task.addMembers` | [Feishu/Lark]-任务-任务-添加任务成员-添加任务的负责人或者关注人。一次性可以添加多个成员。返回任务的实体中会返回最终任务成员的列表。* 关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。* 成员的角色支持"assignee"和"follower"。* 成员类型支持"user"和"app"。* 如果要添加的成员已经在任务中，则自动被忽略 | feishu_call_tool |
| `task.v2.task.addReminders` | [Feishu/Lark]-任务-任务-添加任务提醒-为一个任务添加提醒。提醒是基于任务的截止时间计算得到的一个时刻。为了设置提醒，任务必须首先拥有截止时间(due)。可以在[创建任务]时设置截止时间，或者通过[更新任务]设置一个截止时间。目前一个任务只能设置1个提醒。但接口的形式可以在未来扩充为一个任务支持多个提醒。如果当前任务已经有提醒了，要更新提醒的设置，需要先调用[移除任务提醒]接口移除原有提醒。再调用本接口添加提醒 | feishu_call_tool |
| `task.v2.task.addTasklist` | [Feishu/Lark]-任务-任务-任务加入清单-将一个任务加入清单。返回任务的详细信息，包括任务所在的所有清单信息。如果任务已经在该清单，接口将返回成功 | feishu_call_tool |
| `task.v2.task.create` | [Feishu/Lark]-任务-任务-创建任务-该接口可以创建一个任务，在创建任务时，支持填写任务的基本信息（如标题、描述、负责人等），此外，还可以设置任务的开始时间、截止时间提醒等条件，此外，还可以通过传入 tasklists 字段将新任务加到多个清单中。创建任务时，可以通过设置`members`字段来设置任务的负责人和关注人。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？ ”章节。如果要设置任务的开始时间和截止时间，需要遵守任务时间的格式和约束。详见[功能概述]中的“ 如何使用开始时间和截止时间？”章节。如要设置自定义字段值，可以设置`custom_fields`字段。但因为自定义字段归属于清单，因此要填写的自定义字段的guid必须归属于要添加的清单(通过`tasklists`设置）。详见[自定义字段概览]。通过设置`client_token`实现幂等调用。详见[功能概述]中的“ 幂等调用 ”章节。如要创建一个任务的子任务，需要使用[创建子任务]接口。创建任务时可以一并设置自定义字段值。但根据自定义字段的权限关系，任务只能添加`tasklists`字段设置的清单中关联的自定义字段的值。详见[自定义字段功能概述]中的介绍 | feishu_call_tool |
| `task.v2.task.delete` | [Feishu/Lark]-任务-任务-删除任务-删除一个任务。删除后任务无法再被获取到 | feishu_call_tool |
| `task.v2.task.get` | [Feishu/Lark]-任务-任务-获取任务详情-该接口用于获取任务详情，包括任务标题、描述、时间、成员等信息 | feishu_read_tool |
| `task.v2.task.list` | [Feishu/Lark]-任务-任务-列取任务列表-基于调用身份，列出特定类型的所有任务。支持分页。目前只支持列取任务界面上“我负责的”任务。返回的任务数据按照任务在”我负责的“界面中”自定义拖拽“的顺序排序 | feishu_read_tool |
| `task.v2.task.patch` | [Feishu/Lark]-任务-任务-更新任务-该接口用于修改任务的标题、描述、截止时间等信息。更新时，将`update_fields`字段中填写所有要修改的任务字段名，同时在`task`字段中填写要修改的字段的新值即可。如果`update_fields`中设置了要变更一个字段的名字，但是task里没设置新的值，则表示将该字段清空。调用约定详情见[功能概述]中的“ 关于资源的更新”章节。该接口可以用于完成任务和将任务恢复至未完成，只需要修改`completed_at`字段即可。但留意，目前不管任务本身是会签任务还是或签任务，oapi对任务进行完成只能实现“整体完成”，不支持个人单独完成。此外，不能对已经完成的任务再次完成，但可以将其恢复到未完成的状态(设置`completed_at`为"0")。如更新自定义字段的值，需要调用身份同时拥有任务的编辑权限和自定义字段的编辑权限。详情见[自定义字段功能概览]。更新时，只有填写在`task.custom_fields`的自定义字段值会被更新，不填写的不会被改变。任务成员/提醒/清单数据不能使用本接口进行更新。* 如要修改任务成员，需要使用[添加任务成员]和[移除任务成员]接口。* 如要修改任务提醒，需要使用[添加任务提醒]和[移除任务提醒]接口。* 如要变更任务所在的清单，需要使用[任务加入清单]和[任务移出清单]接口 | feishu_call_tool |
| `task.v2.task.removeDependencies` | [Feishu/Lark]-任务-任务-移除依赖-从一个任务移除一个或者多个依赖。移除时只需要输入要移除的`task_guid`即可。注意，如果要移除的依赖非当前任务的依赖，会被自动忽略。接口会返回成功 | feishu_call_tool |
| `task.v2.task.removeMembers` | [Feishu/Lark]-任务-任务-移除任务成员-移除任务成员。一次性可以移除多个成员。可以移除任务的负责人或者关注人。移除时，如果要移除的成员不是任务成员，会被自动忽略。本接口返回移除成员后的任务数据，包含移除后的任务成员列表 | feishu_call_tool |
| `task.v2.task.removeReminders` | [Feishu/Lark]-任务-任务-移除任务提醒-将一个提醒从任务中移除。如果要移除的提醒本来就不存在，本接口将直接返回成功 | feishu_call_tool |
| `task.v2.task.removeTasklist` | [Feishu/Lark]-任务-任务-任务移出清单-将任务从一个清单中移出。返回任务详情。如果任务不在清单中，接口将返回成功 | feishu_call_tool |
| `task.v2.taskSubtask.create` | [Feishu/Lark]-任务-子任务-创建子任务-给一个任务创建一个子任务。接口功能除了额外需要输入父任务的GUID之外，和[创建任务]接口功能完全一致 | feishu_call_tool |
| `task.v2.taskSubtask.list` | [Feishu/Lark]-任务-子任务-获取任务的子任务列表-获取一个任务的子任务列表。支持分页，数据按照子任务在界面上的顺序返回 | feishu_read_tool |
| `task.v2.task.tasklists` | [Feishu/Lark]-任务-任务-列取任务所在清单-列取一个任务所在的所有清单的信息，包括清单的GUID和所在自定义分组的GUID。只有调用身份有权限访问的清单信息会被返回 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.create` | [Feishu/Lark]-任务-清单动态订阅-创建动态订阅-为一个清单创建一个订阅。每个订阅可以包含1个或多个订阅者（目前只支持普通群组）。订阅创建后，如清单发生相应的事件，则会向订阅里的订阅者发送通知消息。一个清单最多可以创建50个订阅。每个订阅最大支持50个订阅者。订阅者目前仅支持"chat"类型。每个订阅可以通过设置`include_keys`可以针对哪些事件(event_key)做通知。如果`include_keys`为空，则不对任何事件进行通知。如有需要，创建时也可以直接将`disabled`设为true，创建一个禁止发送订阅通知的订阅 | feishu_call_tool |
| `task.v2.tasklistActivitySubscription.delete` | [Feishu/Lark]-任务-清单动态订阅-删除动态订阅-给定一个清单的GUID和一个订阅的GUID，将其删除。删除后的数据不可恢复 | feishu_call_tool |
| `task.v2.tasklistActivitySubscription.get` | [Feishu/Lark]-任务-清单动态订阅-获取动态订阅-提供一个清单的GUID和一个订阅的GUID，获取该订阅的详细信息，包括名称，订阅者，可通知的event key列表等 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.list` | [Feishu/Lark]-任务-清单动态订阅-列取动态订阅-给定一个清单的GUID，获取其所有的订阅信息。结果按照订阅的创建时间排序 | feishu_read_tool |
| `task.v2.tasklistActivitySubscription.patch` | [Feishu/Lark]-任务-清单动态订阅-更新动态订阅-提供一个清单的GUID和一个动态订阅的GUID，对其进行更新。更新时，将`update_fields`字段中填写所有要修改的字段名，同时在`activity_subscription`字段中填写要修改的字段的新值即可。`update_fields`支持更新的字段包括：* name：订阅的名称* subscribers: 订阅者列表。如更新，会将旧的订阅者列表完全替换为新的订阅者列表。支持最大50个订阅者。并且订阅者必须是chat类型。* include_keys ：订阅需要发送通知的key。如更新，会将旧的列表完全替换为新的include_keys列表。只能设置支持的event key (见字段描述）。* disabled：修改订阅的开启/禁用状态 | feishu_call_tool |
| `task.v2.tasklist.addMembers` | [Feishu/Lark]-任务-清单-添加清单成员-向一个清单添加1个或多个协作成员。成员信息通过设置`members`字段实现。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。一个清单协作成员可以是一个用户，应用或者群组。每个成员可以设置“可编辑”或者“可阅读”的角色。群组作为协作成员表示该群里所有群成员都自动拥有群组协作成员的角色。如果要添加的成员已经是清单成员，且角色和请求中设置是一样的，则会被自动忽略，接口返回成功。如果要添加的成员已经是清单成员，且角色和请求中设置是不一样的（比如原来的角色是可阅读，请求中设为可编辑），则相当于更新其角色。如果要添加的成员已经是清单的所有者，则会被自动忽略。接口返回成功。其所有者的角色不会改变。本接口不能用来设置清单所有者，如要设置，可以使用[更新清单]接口 | feishu_call_tool |
| `task.v2.tasklist.create` | [Feishu/Lark]-任务-清单-创建清单-创建一个清单。清单可以用于组织和管理属于同一个项目的多个任务。创建时，必须填写清单的名字。同时，可以设置通过`members`字段设置清单的协作成员。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。创建清单后，创建人自动成为清单的所有者。如果请求同时将创建人设置为可编辑/可阅读角色，则最终该用户成为清单所有者，并自动从清单成员列表中消失。因为同一个用户在同一个清单只能拥有一个角色 | feishu_call_tool |
| `task.v2.tasklist.delete` | [Feishu/Lark]-任务-清单-删除清单-删除一个清单。删除清单后，不可对该清单做任何操作，也无法再访问到清单。清单被删除后不可恢复 | feishu_call_tool |
| `task.v2.tasklist.get` | [Feishu/Lark]-任务-清单-获取清单详情-获取一个清单的详细信息，包括清单名，所有者，清单成员等 | feishu_read_tool |
| `task.v2.tasklist.list` | [Feishu/Lark]-任务-清单-获取清单列表-获取调用身份所有可读取的清单列表 | feishu_read_tool |
| `task.v2.tasklist.patch` | [Feishu/Lark]-任务-清单-更新清单-更新清单，可以更新清单的名字和所有者。更新清单时，将`update_fields`字段中填写所有要修改的清单字段名，同时在`tasklist`字段中填写要修改的字段的新值即可。更新调用规范详见[功能概述]中的“ 关于资源的更新”章节。支持更新的字段包括:* `name` - 清单名字* `owner` - 清单所有者更新清单所有者（owner）时，如果该成员已经是清单的“可编辑”或者“可阅读”角色，则该成员将直接升级为所有者角色，自动从清单的成员列表中消失。这是因为同一个用户在同一个清单中只能有一个角色。同时，支持使用`origin_owner_to_role`字段将原有所有者变为可编辑/可阅读角色或者直接退出清单。该接口不能用于更新清单的成员和增删清单中的任务。* 如要增删清单中的成员，可以使用[添加清单成员]和[移除清单成员]接口。* 如要增删清单中的任务，可以使用[任务加入清单]和[任务移出清单]接口 | feishu_call_tool |
| `task.v2.tasklist.removeMembers` | [Feishu/Lark]-任务-清单-移除清单成员-移除清单的一个或多个协作成员。通过设置`members`字段表示要移除的成员信息。关于member的格式，详见[功能概述]中的“ 如何表示任务和清单的成员？”章节。清单中同一个成员只能有一个角色，通过的member的id和type可以唯一确定一个成员，因此请求参数中对于要删除的成员，不需要填写"role"字段。如果要移除的成员不在清单中，则被自动忽略，接口返回成功。该接口不能用于移除清单所有者。如果要移除的成员是清单所有者，则会被自动忽略。如要设置清单所有者，需要调用[更新清单]接口 | feishu_call_tool |
| `task.v2.tasklist.tasks` | [Feishu/Lark]-任务-清单-获取清单任务列表-获取一个清单的任务列表，返回任务的摘要信息。本接口支持分页。清单中的任务以“自定义拖拽”的顺序返回。本接口支持简单的按照任务的完成状态或者任务的创建时间范围过滤 | feishu_read_tool |
| `cli.calendar.calendars.create` | Create a shared calendar | feishu_call_tool |
| `cli.calendar.calendars.delete` | Delete shared calendar | feishu_call_tool |
| `cli.calendar.calendars.get` | Query calendar information | feishu_read_tool |
| `cli.calendar.calendars.list` | Query the calendar list | feishu_read_tool |
| `cli.calendar.calendars.patch` | Update calendar information | feishu_call_tool |
| `cli.calendar.calendars.primary` | 查询主日历信息。推荐使用此 API 获取主日历 ID，无需先 list 再过滤 | feishu_read_tool |
| `cli.calendar.calendars.search` | Search for calendars | feishu_read_tool |
| `cli.calendar.event.attendees.batch_delete` | Delete event invitees | feishu_call_tool |
| `cli.calendar.event.attendees.create` | Create event invitees | feishu_call_tool |
| `cli.calendar.event.attendees.list` | Obtain event invitee list | feishu_read_tool |
| `cli.calendar.events.create` | Create an event | feishu_call_tool |
| `cli.calendar.events.delete` | Delete an event | feishu_call_tool |
| `cli.calendar.events.get` | Obtain an event | feishu_read_tool |
| `cli.calendar.events.instance_view` | Query event view | feishu_read_tool |
| `cli.calendar.events.patch` | Update an event | feishu_call_tool |
| `cli.calendar.events.search_event` | 搜索日程 | feishu_read_tool |
| `cli.calendar.events.share_info` | 获取日程分享信息 | feishu_read_tool |
| `cli.calendar.freebusys.list` | Query availability of the primary calendar | feishu_read_tool |
| `cli.task.tasks.create` | Create Task | feishu_call_tool |
| `cli.task.tasks.delete` | Delete Task | feishu_call_tool |
| `cli.task.tasks.get` | Get Task Details | feishu_read_tool |
| `cli.task.tasks.list` | List Tasks | feishu_read_tool |
| `cli.task.tasks.patch` | Patch Task | feishu_call_tool |
| `cli.task.tasklists.add_members` | Add tasklist members | feishu_call_tool |
| `cli.task.tasklists.create` | Create Tasklist | feishu_call_tool |
| `cli.task.tasklists.delete` | Delete Tasklist | feishu_call_tool |
| `cli.task.tasklists.get` | Get Tasklist Details | feishu_read_tool |
| `cli.task.tasklists.list` | List Tasklists | feishu_read_tool |
| `cli.task.tasklists.patch` | Patch Tasklist | feishu_call_tool |
| `cli.task.tasklists.remove_members` | Remove Tasklist Members | feishu_call_tool |
| `cli.task.tasklists.tasks` | Get Tasks of Tasklist | feishu_read_tool |
| `cli.task.subtasks.create` | Create Subtask | feishu_call_tool |
| `cli.task.subtasks.list` | List Subtasks of Task | feishu_read_tool |
| `cli.task.sections.create` | Create Section | feishu_call_tool |
| `cli.task.sections.delete` | Delete Section | feishu_call_tool |
| `cli.task.sections.get` | Get Section | feishu_read_tool |
| `cli.task.sections.list` | List Sections | feishu_read_tool |
| `cli.task.sections.patch` | Patch Section | feishu_call_tool |
| `cli.task.sections.tasks` | List Tasks of Section | feishu_read_tool |
| `cli.task.custom_fields.add` | Add Custom Field to Resource | feishu_call_tool |
| `cli.task.custom_fields.create` | Create Custom Field | feishu_call_tool |
| `cli.task.custom_fields.get` | Get Custom Field | feishu_read_tool |
| `cli.task.custom_fields.list` | List Custom Fields | feishu_read_tool |
| `cli.task.custom_fields.patch` | Update Custom Field | feishu_call_tool |
| `cli.task.custom_fields.remove` | Remove Custom Field From Resource | feishu_call_tool |
| `cli.task.custom_field_options.create` | Create Custom Field Option | feishu_call_tool |
| `cli.task.custom_field_options.patch` | Update Custom Field Option | feishu_call_tool |
| `cli.task.members.add` | Add Task Member | feishu_call_tool |
| `cli.task.members.remove` | Remove Task Member | feishu_call_tool |


<a id="s-431f9e8db5a4c9ee"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# 日程待办摘要工作流

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`]（按模块名读取对应工作流），其中包含认证、权限处理**

## 适用场景

- "今天有什么安排" / "今天的日程和待办"
- "明天有什么会" / "明日日程与未完成任务"
- "帮我看看今天要做什么" / "早报摘要"
- "开工摘要" / "standup report"
- "这周还有哪些安排"

## 前置条件

仅支持 **user 身份**。执行前确保已授权：

```text
lark-cli auth login --domain calendar,task
```

## 工作流

```
{date} ─┬─► calendar +agenda [--start/--end]              ──► 日程列表（会议/事件）
        └─► task +get-my-tasks --complete=false [--due-end] ──► 未完成待办列表
                    │
                    ▼
              AI 汇总（时间转换 + 冲突检测 + 排序）──► 摘要
```

### Step 1: 获取日程

```text
# 今天（默认，无需额外参数）
lark-cli calendar +agenda

# 指定日期范围（必须使用 ISO 8601 格式，不支持 "tomorrow" 等自然语言）
lark-cli calendar +agenda --start "2026-03-26T00:00:00+08:00" --end "2026-03-26T23:59:59+08:00"
```

> **注意**：`--start` / `--end` 仅支持 ISO 8601 格式（如 `2026-01-01` 或 `2026-01-01T15:04:05+08:00`）和 Unix timestamp，**不支持** `"tomorrow"`、`"next monday"` 等自然语言。需要 AI 根据当前日期自行计算目标日期。

输出包含：event\_id、summary、start\_time（含 timestamp + timezone）、end\_time、free\_busy\_status、self\_rsvp\_status。

### Step 2: 获取未完成待办

```text
# 默认 pending 摘要：必须显式过滤未完成任务（最多 20 条）
lark-cli task +get-my-tasks --complete=false

# 只看指定日期前到期的未完成任务（推荐用于摘要场景，减少数据量）
lark-cli task +get-my-tasks --complete=false --due-end "2026-03-27T23:59:59+08:00"

# 获取全部未完成任务（超过 20 条时）
lark-cli task +get-my-tasks --complete=false --page-all
```

> **注意**：`+get-my-tasks` 不带 `--complete` 时会**同时返回已完成和未完成任务**，会把已完成任务当成"待办"展示进摘要里。站会/日报这种 pending 汇总场景**必须**显式带上 `--complete=false`，不要省略。
>
> 数据量层面也建议加过滤：
> - 用 `--due-end` 过滤出目标日期前到期的任务
> - 如果也需要无截止日期的任务，可不加 `--due-end`，但 AI 汇总时只展示**近 30 天内创建的**，其余折叠为"其他 N 项历史待办"

### Step 3: AI 汇总

将 Step 1 和 Step 2 的结果整合，按以下结构输出：

```
## {日期}摘要（{YYYY-MM-DD 星期X}）

### 日程安排
| 时间 | 事件 | 组织者 | 状态 |
|------|------|--------|------|
| 09:00-10:00 | 产品需求评审 | 张三 | 已接受 |
| 14:00-15:00 | 技术方案讨论 | 李四 | 待确认 |

### 待办事项
- [ ] {task_summary}（截止：{due_date}）
- [ ] {task_summary}

### 小结
- 共 {n} 场会议，{m} 项待办
- 冲突提醒：{列出时间重叠的日程}
- 空闲时段：{free_slots}（根据日程推算）
```

**数据处理规则：**

1. **时间转换**：API 返回 Unix timestamp，需根据 `timezone` 字段（通常为 `Asia/Shanghai`）转换为 `HH:mm` 格式
2. **RSVP 状态映射**：
   | API 值 | 显示文案 |
   |--------|---------|
   | `accept` | 已接受 |
   | `decline` | 已拒绝 |
   | `needs_action` | 待确认 |
   | `tentative` | 暂定 |
3. **日程排序**：按开始时间升序排列
4. **冲突检测**：按时间排序后，检查相邻日程是否有时间重叠（前一个 end\_time > 后一个 start\_time），有则在小结中列出冲突组
5. **已拒绝日程**：标注"已拒绝"但不计入忙碌时段和冲突检测
6. **待办排序**：按截止时间升序，已过期的标注"已过期"，无截止时间的排在最后

## 权限表

| 命令 | 所需 scope |
|------|-----------|
| `calendar +agenda` | `calendar:calendar.event:read` |
| `task +get-my-tasks` | `task:task:read` |

## 参考

- [lark-shared]（按模块名读取对应工作流） — 认证、权限（必读）
- [lark-calendar](lark-calendar-0.md#s-3d0136d3d09a934d) — `+agenda` 详细用法
- [lark-task](lark-task-0.md#s-c03ee45b65ed2a9e) — `+get-my-tasks` 详细用法
