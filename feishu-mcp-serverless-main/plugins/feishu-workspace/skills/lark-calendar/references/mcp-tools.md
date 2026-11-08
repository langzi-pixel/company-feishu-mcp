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
