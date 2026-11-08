# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `docs.v1.content.get` | [Feishu/Lark]-云文档-通用-获取云文档内容-可获取云文档内容，当前只支持获取新版文档 Markdown 格式的内容 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.batchUpdate` | [Feishu/Lark]-群组-新版群公告-块-批量更新群公告块的内容 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.batchDelete` | [Feishu/Lark]-群组-新版群公告-块-删除群公告中的块-指定需要操作的块，删除其指定范围的子块。如果操作成功，接口将返回应用删除操作后的群公告版本号 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.create` | [Feishu/Lark]-群组-新版群公告-块-在群公告中创建块 | feishu_call_tool |
| `docx.v1.chatAnnouncementBlockChildren.get` | [Feishu/Lark]-群组-新版群公告-块-获取所有子块 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.get` | [Feishu/Lark]-群组-新版群公告-块-获取群公告块的内容 | feishu_read_tool |
| `docx.v1.chatAnnouncementBlock.list` | [Feishu/Lark]-群组-新版群公告-群公告-获取群公告所有块 | feishu_read_tool |
| `docx.v1.chatAnnouncement.get` | [Feishu/Lark]-群组-新版群公告-群公告-获取群公告基本信息-获取指定群组中的群公告基本信息 | feishu_read_tool |
| `docx.v1.documentBlock.batchUpdate` | [Feishu/Lark]-云文档-文档-块-批量更新块的内容-批量更新块的富文本内容 | feishu_call_tool |
| `docx.v1.documentBlockChildren.batchDelete` | [Feishu/Lark]-云文档-文档-块-删除块-指定需要操作的块，删除其指定范围的子块。如果操作成功，接口将返回应用删除操作后的文档版本号 | feishu_call_tool |
| `docx.v1.documentBlockChildren.create` | [Feishu/Lark]-云文档-文档-块-创建块-指定需要操作的块，为其创建一批子块，并插入到指定位置。如果操作成功，接口将返回新创建子块的富文本内容 | feishu_call_tool |
| `docx.v1.documentBlockChildren.get` | [Feishu/Lark]-云文档-文档-块-获取所有子块-给定一个指定版本的文档，并指定需要操作的块，分页遍历其所有子块富文本内容 。如果不指定版本，则会默认查询最新版本 | feishu_read_tool |
| `docx.v1.documentBlockDescendant.create` | [Feishu/Lark]-云文档-文档-块-创建嵌套块 | feishu_call_tool |
| `docx.v1.documentBlock.get` | [Feishu/Lark]-云文档-文档-块-获取块的内容-获取指定块的富文本内容 | feishu_read_tool |
| `docx.v1.documentBlock.list` | [Feishu/Lark]-云文档-文档-文档-获取文档所有块-获取文档所有块的富文本内容并分页返回 | feishu_read_tool |
| `docx.v1.documentBlock.patch` | [Feishu/Lark]-云文档-文档-块-更新块的内容-更新指定的块 | feishu_call_tool |
| `docx.v1.document.convert` | [Feishu/Lark]-云文档-文档-块-Markdown/HTML 内容转换为文档块-将 HTML/Markdown 格式的内容转换为文档块 | feishu_read_tool |
| `docx.v1.document.create` | [Feishu/Lark]-云文档-文档-文档-创建文档-创建文档类型为 docx 的文档。你可选择传入文档标题和文件夹 | feishu_call_tool |
| `docx.v1.document.get` | [Feishu/Lark]-云文档-文档-文档-获取文档基本信息-获取文档标题和最新版本 ID | feishu_read_tool |
| `docx.v1.document.rawContent` | [Feishu/Lark]-云文档-文档-文档-获取文档纯文本内容-获取文档的纯文本内容 | feishu_read_tool |
| `minutes.v1.minute.get` | [Feishu/Lark]-妙记-妙记信息-获取妙记信息-通过这个接口，可以得到一篇妙记的基础概述信息，包含 `owner_id`、`create_time`、标题、封面、时长和 URL | feishu_read_tool |
| `minutes.v1.minuteMedia.get` | [Feishu/Lark]-妙记-妙记音视频文件-下载妙记音视频文件-获取妙记的音视频文件 | feishu_read_tool |
| `minutes.v1.minuteStatistics.get` | [Feishu/Lark]-妙记-妙记统计数据-获取妙记统计数据-通过这个接口，可以获得妙记的访问情况统计，包含PV、UV、访问过的 user id、访问过的 user timestamp | feishu_read_tool |
| `vc.v1.export.get` | [Feishu/Lark]-视频会议-导出-查询导出任务结果-查看异步导出的进度 | feishu_read_tool |
| `vc.v1.export.meetingList` | [Feishu/Lark]-视频会议-导出-导出会议明细-导出会议明细，具体权限要求请参考资源介绍 | feishu_call_tool |
| `vc.v1.export.participantList` | [Feishu/Lark]-视频会议-导出-导出参会人明细-导出某个会议的参会人详情列表，具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.export.participantQualityList` | [Feishu/Lark]-视频会议-导出-导出参会人会议质量数据-导出某场会议某个参会人的音视频&共享质量数据（仅支持已结束会议），具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.export.resourceReservationList` | [Feishu/Lark]-视频会议-导出-导出会议室预定数据-导出会议室预定数据，具体权限要求请参考「资源介绍」 | feishu_call_tool |
| `vc.v1.meetingList.get` | [Feishu/Lark]-视频会议-会议数据-查询会议明细-查询会议明细，具体权限要求请参考[资源介绍] | feishu_read_tool |
| `vc.v1.meeting.end` | [Feishu/Lark]-视频会议-会议管理-结束会议-结束一个进行中的会议 | feishu_call_tool |
| `vc.v1.meeting.get` | [Feishu/Lark]-视频会议-会议管理-获取会议详情-获取一个会议的详细数据 | feishu_read_tool |
| `vc.v1.meeting.invite` | [Feishu/Lark]-视频会议-会议管理-邀请参会人-邀请参会人进入会议 | feishu_call_tool |
| `vc.v1.meeting.listByNo` | [Feishu/Lark]-视频会议-会议管理-获取与会议号关联的会议列表-获取指定时间范围（90天内)会议号关联的会议简要信息列表 | feishu_read_tool |
| `vc.v1.meetingRecording.get` | [Feishu/Lark]-视频会议-录制-获取录制文件-获取一个会议的录制文件 | feishu_read_tool |
| `vc.v1.meetingRecording.setPermission` | [Feishu/Lark]-视频会议-录制-授权录制文件-将一个会议的录制文件授权给组织、用户或公开到公网 | feishu_call_tool |
| `vc.v1.meetingRecording.start` | [Feishu/Lark]-视频会议-录制-开始录制-在会议中开始录制 | feishu_call_tool |
| `vc.v1.meetingRecording.stop` | [Feishu/Lark]-视频会议-录制-停止录制-在会议中停止录制 | feishu_call_tool |
| `vc.v1.meeting.setHost` | [Feishu/Lark]-视频会议-会议管理-设置主持人-设置会议的主持人 | feishu_call_tool |
| `vc.v1.participantList.get` | [Feishu/Lark]-视频会议-会议数据-查询参会人明细-查询参会人明细，具体权限要求请参考[资源介绍] | feishu_read_tool |
| `vc.v1.participantQualityList.get` | [Feishu/Lark]-视频会议-会议数据-查询参会人会议质量数据-查询参会人会议质量数据（仅支持已结束会议），具体权限要求请参考「资源介绍」 | feishu_read_tool |
| `vc.v1.reserve.apply` | [Feishu/Lark]-视频会议-预约-预约会议-创建一个会议预约 | feishu_call_tool |
| `vc.v1.reserve.delete` | [Feishu/Lark]-视频会议-预约-删除预约-删除一个预约 | feishu_call_tool |
| `vc.v1.reserve.get` | [Feishu/Lark]-视频会议-预约-获取预约-获取一个预约的详情 | feishu_read_tool |
| `vc.v1.reserve.getActiveMeeting` | [Feishu/Lark]-视频会议-预约-获取活跃会议-获取一个预约的当前活跃会议 | feishu_read_tool |
| `vc.v1.reserve.update` | [Feishu/Lark]-视频会议-预约-更新预约-更新一个预约 | feishu_call_tool |
| `vc.v1.resourceReservationList.get` | [Feishu/Lark]-视频会议-会议数据-查询会议室预定数据-查询会议室预定数据，具体权限要求请参考「资源介绍」 | feishu_read_tool |
| `vc.v1.room.search` | [Feishu/Lark]-视频会议-会议室管理-搜索会议室-该接口可以用来搜索会议室，支持使用关键词进行搜索，也支持使用自定义会议室 ID 进行查询。该接口只会返回用户有预定权限的会议室列表 | feishu_read_tool |
| `docx.builtin.search` | [飞书/Lark] - 云文档-文档 - 搜索文档 - 搜索云文档，只支持user_access_token | feishu_read_tool |
| `docx.builtin.import` | [飞书/Lark] - 云文档-文档 - 导入文档 - 导入云文档，最大20MB | feishu_call_tool |
| `cli.minutes.minutes.get` | Get minutes meta | feishu_read_tool |
| `cli.vc.meeting.get` | Obtain meeting details | feishu_read_tool |
