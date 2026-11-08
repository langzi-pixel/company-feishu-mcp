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
