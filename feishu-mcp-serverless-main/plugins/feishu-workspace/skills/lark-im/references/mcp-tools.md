# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `im.v1.chatAnnouncement.get` | [Feishu/Lark]-群组-群公告-获取群公告信息-获取指定群组中的群公告信息，公告信息格式与[旧版云文档]格式相同 | feishu_read_tool |
| `im.v1.chatAnnouncement.patch` | [Feishu/Lark]-群组-群公告-更新群公告信息-更新指定群组中的群公告信息。更新的公告内容格式和更新[旧版云文档]的格式相同，不支持新版云文档格式 | feishu_call_tool |
| `im.v1.chat.delete` | [Feishu/Lark]-群组-群组管理-解散群-通过 chat_id 解散指定群组。通过 API 解散群组后，群聊天记录将不会保存 | feishu_call_tool |
| `im.v1.chat.get` | [Feishu/Lark]-群组-群组管理-获取群信息-获取指定群的基本信息，包括群名称、群描述、群头像、群主 ID 以及群权限配置等 | feishu_read_tool |
| `im.v1.chat.link` | [Feishu/Lark]-群组-群组管理-获取群分享链接-获取指定群的分享链接，他人点击分享链接后可加入群组 | feishu_call_tool |
| `im.v1.chat.list` | [Feishu/Lark]-群组-群组管理-获取用户或机器人所在的群列表-获取 [access_token] 所代表的用户或者机器人所在的群列表 | feishu_read_tool |
| `im.v1.chatManagers.addManagers` | [Feishu/Lark]-群组-群成员-指定群管理员-指定群组，将群内指定的用户或者机器人设置为群管理员 | feishu_call_tool |
| `im.v1.chatManagers.deleteManagers` | [Feishu/Lark]-群组-群成员-删除群管理员-指定群组，删除群组内指定的管理员，包括用户类型的管理员和机器人类型的管理员 | feishu_call_tool |
| `im.v1.chatMembers.create` | [Feishu/Lark]-群组-群成员-将用户或机器人拉入群聊-把指定的用户或机器人拉入指定群聊内 | feishu_call_tool |
| `im.v1.chatMembers.delete` | [Feishu/Lark]-群组-群成员-将用户或机器人移出群聊-将指定的用户或机器人从群聊中移出 | feishu_call_tool |
| `im.v1.chatMembers.get` | [Feishu/Lark]-群组-群成员-获取群成员列表-获取指定群组的成员信息，包括成员名字与 ID | feishu_read_tool |
| `im.v1.chatMembers.isInChat` | [Feishu/Lark]-群组-群成员-判断用户或机器人是否在群里-根据使用的 access_token 判断对应的用户或者机器人是否在指定的群里 | feishu_read_tool |
| `im.v1.chatMembers.meJoin` | [Feishu/Lark]-群组-群成员-用户或机器人主动加入群聊-将当前调用接口的操作者（用户或机器人）加入指定群聊 | feishu_call_tool |
| `im.v1.chatModeration.get` | [Feishu/Lark]-群组-群组管理-获取群成员发言权限-获取指定群组的发言模式、可发言用户名单等信息 | feishu_read_tool |
| `im.v1.chatModeration.update` | [Feishu/Lark]-群组-群组管理-更新群发言权限-更新指定群组的发言权限，可设置为所有群成员可发言、仅群主或管理员可发言、指定群成员可发言 | feishu_call_tool |
| `im.v1.chat.search` | [Feishu/Lark]-群组-群组管理-搜索对用户或机器人可见的群列表-获取当前身份（用户或机器人）可见的群列表，包括当前身份所在的群、对当前身份公开的群。支持关键词搜索、分页搜索 | feishu_read_tool |
| `im.v1.chatTab.create` | [Feishu/Lark]-群组-会话标签页-添加会话标签页-在指定会话内添加自定义会话标签页，仅支持添加文档类型（doc）或 URL （url）类型的标签页 | feishu_call_tool |
| `im.v1.chatTab.deleteTabs` | [Feishu/Lark]-群组-会话标签页-删除会话标签页-删除指定会话内的一个或多个会话标签页 | feishu_call_tool |
| `im.v1.chatTab.listTabs` | [Feishu/Lark]-群组-会话标签页-拉取会话标签页-获取指定会话内的会话标签页信息，包括 ID、名称、类型以及内容等 | feishu_read_tool |
| `im.v1.chatTab.sortTabs` | [Feishu/Lark]-群组-会话标签页-会话标签页排序-调整指定会话内的多个会话标签页排列顺序 | feishu_call_tool |
| `im.v1.chatTab.updateTabs` | [Feishu/Lark]-群组-会话标签页-更新会话标签页-更新指定的会话标签页信息，包括名称、类型以及内容等。仅支持更新文档类型（doc）或 URL （url）类型的标签页 | feishu_call_tool |
| `im.v1.chatTopNotice.deleteTopNotice` | [Feishu/Lark]-群组-群组管理-撤销群置顶-撤销指定群组中的置顶消息或群公告 | feishu_call_tool |
| `im.v1.chatTopNotice.putTopNotice` | [Feishu/Lark]-群组-群组管理-更新群置顶-更新群组中的群置顶信息，可以将群中的某一条消息，或群公告置顶展示 | feishu_call_tool |
| `im.v1.chat.update` | [Feishu/Lark]-群组-群组管理-更新群信息-更新指定群的信息，包括群头像、群名称、群描述、群配置以及群主等 | feishu_call_tool |
| `im.v1.message.delete` | [Feishu/Lark]-消息-消息管理-撤回消息-调用该接口撤回指定消息。调用接口的身份不同（身份通过 Authorization 请求头参数指定），可实现的效果不同：- 机器人可以撤回该机器人自己发送的消息。- 群聊的群主可以撤回群内指定的消息 | feishu_call_tool |
| `im.v1.message.patch` | [Feishu/Lark]-消息-消息卡片-更新已发送的消息卡片-通过消息 ID（message_id）更新已发送的消息卡片的内容 | feishu_call_tool |
| `im.v1.messageReaction.create` | [Feishu/Lark]-消息-表情回复-添加消息表情回复-给指定消息添加指定类型的表情回复 | feishu_call_tool |
| `im.v1.messageReaction.delete` | [Feishu/Lark]-消息-表情回复-删除消息表情回复-删除指定消息的某一表情回复 | feishu_call_tool |
| `im.v1.messageReaction.list` | [Feishu/Lark]-消息-表情回复-获取消息表情回复-获取指定消息内的表情回复列表，支持仅获取特定类型的表情回复 | feishu_read_tool |
| `im.v1.pin.create` | [Feishu/Lark]-消息-Pin-Pin 消息-Pin 一条指定的消息。Pin 消息的效果可参见[Pin 消息概述] | feishu_call_tool |
| `im.v1.pin.delete` | [Feishu/Lark]-消息-Pin-移除 Pin 消息-移除一条指定消息的 Pin | feishu_call_tool |
| `im.v1.pin.list` | [Feishu/Lark]-消息-Pin-获取群内 Pin 消息-获取指定群、指定时间范围内的所有 Pin 消息 | feishu_read_tool |
| `search.v2.app.create` | [Feishu/Lark]-搜索-套件搜索-搜索应用-用户可以通过关键字搜索到可见应用，应用可见性与套件内搜索一致 | feishu_call_tool |
| `search.v2.message.create` | [Feishu/Lark]-搜索-套件搜索-搜索消息-用户可以通过关键字搜索可见消息，可见性和套件内搜索一致 | feishu_read_tool |
| `cli.im.chats.get` | Obtain group information. Identity: supports `user` and `bot`; the caller must be in the target chat to get full details, and must belong to the same tenant for internal chats | feishu_read_tool |
| `cli.im.chats.link` | Get group share link. Identity: supports `user` and `bot`; the caller must be in the target chat, must be an owner or admin when chat sharing is restricted to owners/admins, and must belong to the same tenant for internal chats | feishu_call_tool |
| `cli.im.chats.update` | Update group information. Identity: supports `user` and `bot` | feishu_call_tool |
| `cli.im.chat.members.bots` | 获取群内机器人列表。Identity: supports `user` and `bot`; the caller must be in the target chat and must belong to the same tenant for internal chats | feishu_read_tool |
| `cli.im.chat.members.create` | Add users or bots to a group. Identity: supports `user` and `bot`; the caller must be in the target chat; for `bot` calls, added users must be within the app's availability; for internal chats the operator must belong to the same tenant; if only owners/admins can add members, the caller must be an owner/admin, or a chat-creator bot with `im:chat:operate_as_owner` | feishu_call_tool |
| `cli.im.chat.members.delete` | Remove users or bots from a group. Identity: supports `user` and `bot`; only group owner, admin, or creator bot can remove others; max 50 users or 5 bots per request | feishu_call_tool |
| `cli.im.chat.members.get` | Obtain group member list. Identity: supports `user` and `bot`; the caller must be in the target chat and must belong to the same tenant for internal chats | feishu_read_tool |
| `cli.im.chat.user_setting.batch_query` | 批量查询当前用户在群内的个人偏好设置 (e.g. `is_muted` mutes normal messages, `is_mute_at_all` mutes @all messages); up to 10 chats per request. Identity: `user` only (`user_access_token`); the caller must be in each target chat | feishu_read_tool |
| `cli.im.chat.user_setting.batch_update` | 批量更新当前用户在群内的个人偏好设置 (e.g. `is_muted` mutes normal messages, `is_mute_at_all` mutes @all messages); up to 10 chats per request. Identity: `user` only (`user_access_token`); the caller must be in each target chat | feishu_call_tool |
| `cli.im.chat.managers.add_managers` | Specify group administrators. Identity: supports `user` and `bot`; only the group owner can add managers; max 10 managers per chat (20 for super-large chats), and at most 5 bots per request | feishu_call_tool |
| `cli.im.chat.managers.delete_managers` | Delete group administrators. Identity: supports `user` and `bot`; only the group owner can remove managers; max 50 users or 5 bots per request | feishu_call_tool |
| `cli.im.chat.moderation.get` | Obtains the group member speech scopes. Identity: supports `user` and `bot`; the caller must be in the target chat and belong to the same tenant | feishu_read_tool |
| `cli.im.chat.moderation.update` | Updates group speech scopes. Identity: supports `user` and `bot`; only the group owner (or creator bot with `im:chat:operate_as_owner`) can update; the caller must be in the chat | feishu_call_tool |
| `cli.im.chat.nickname.delete` | Clear your own nickname in the chat (self-only). Identity: `user` only (`user_access_token`) | feishu_call_tool |
| `cli.im.chat.nickname.get` | 获取调用 user 自己在群里的群昵称（self-only）。未设置时返空串。Get your own nickname in the chat (self-only). Identity: `user` only (`user_access_token`); returns an empty string when no nickname is set | feishu_read_tool |
| `cli.im.chat.nickname.update` | 设置或更新调用 user 自己在群里的群昵称（self-only，非空字符串；清空请用 DELETE）。Set or update your own nickname in the chat (self-only). Identity: `user` only (`user_access_token`); `nickname` must be a non-empty string (max 300 bytes). Use DELETE to clear it | feishu_call_tool |
| `cli.im.chat.join_requests.handle` | 批量审批入群申请（approve/reject，仅群主/管理员，user_access_token）。Approve or reject pending join requests in bulk (1-50 items, processed in order). Identity: `user` only (`user_access_token`); the caller must be the chat owner or an admin. `results[]` mirrors `items[]` in count and order — check each `result` (`success` / `failed` / `already_handled`); exit 0 does not mean every item succeeded | feishu_call_tool |
| `cli.im.chat.join_requests.list` | 列出群的待审批入群申请（仅群主/管理员，user_access_token）。List pending join requests for a chat. Identity: `user` only (`user_access_token`); the caller must be the chat owner or an admin. Paginated (`page_size` 1-100); stop on `has_more == false` — `page_token` is returned even on the last page, so paging while it is present never terminates | feishu_read_tool |
| `cli.im.messages.delete` | Recall message. Identity: supports `user` and `bot`; for `bot` calls, the bot must be in the chat to revoke group messages; to revoke another user's group message, the bot must be the owner, an admin, or the creator; for user P2P recalls, the target user must be within the bot's availability | feishu_call_tool |
| `cli.im.messages.forward` | Forward a message. Identity: supports `user` and `bot` | feishu_call_tool |
| `cli.im.messages.patch` | Update sent message card. Update an interactive message card sent by the app. Identity: supports `user` and `bot`; the message must have been sent within the last 14 days, and `content` must be a JSON-serialized string no larger than 30 KB | feishu_call_tool |
| `cli.im.messages.read_status` | 批量查询当前用户对消息的已读状态。Identity: `user` only (`user_access_token`); accepts up to 50 message IDs and returns `items[].is_read` plus `invalid_message_ids` for messages that cannot be determined.Must-read | feishu_read_tool |
| `cli.im.messages.read_users` | Query the read status of a message as the sender. Identity: supports `user` and `bot`. With `user_access_token`, the user must still be in the chat and can query read users only for messages they sent within the last 7 days. With `tenant_access_token`, the bot must be in the chat and can only query its own messages within the last 7 days.Must-read | feishu_read_tool |
| `cli.im.reactions.batch_query` | Batch list message reactions. Identity: supports `user` and `bot`.Must-read | feishu_read_tool |
| `cli.im.reactions.create` | Add a reaction for a message. Identity: supports `user` and `bot`; the caller must be in the conversation that contains the message.Must-read | feishu_call_tool |
| `cli.im.reactions.delete` | Delete a reaction for a message. Identity: supports `user` and `bot`; the caller must be in the conversation that contains the message, and can only delete reactions added by itself.Must-read | feishu_call_tool |
| `cli.im.reactions.list` | List message reactions. Identity: supports `user` and `bot`; the caller must be in the conversation that contains the message.Must-read | feishu_read_tool |
| `cli.im.threads.forward` | Forward a thread. Identity: supports `user` and `bot` | feishu_call_tool |
| `cli.im.images.create` | Upload image. Identity: supports `user` and `bot`; user identity requires `im:resource` scope on the UAT | feishu_call_tool |
| `cli.im.files.create` | Upload file. Identity: supports `user` and `bot`; user identity requires `im:resource` scope on the UAT | feishu_call_tool |
| `cli.im.files.folder` | 获取消息或消息链接中资源文件夹的子文件列表。recursive=false 仅返回给定 file_key 的一层子项（folder 子项带 children_count 提示深度）；recursive=true 返回完整层级树（嵌套 children） | feishu_read_tool |
| `cli.im.pins.create` | Pin a message. Identity: supports `user` and `bot` | feishu_call_tool |
| `cli.im.pins.delete` | Unpin a message. Identity: supports `user` and `bot` | feishu_call_tool |
| `cli.im.pins.list` | Get pins in group. Identity: supports `user` and `bot` | feishu_read_tool |
| `cli.im.feed.groups.batch_add_item` | Batch add feed cards to a feed group. Identity: `user` only (`user_access_token`).Must-read | feishu_call_tool |
| `cli.im.feed.groups.batch_query` | Batch query feed groups. Identity: `user` only (`user_access_token`).Must-read | feishu_read_tool |
| `cli.im.feed.groups.batch_remove_item` | Batch remove feed cards from a feed group. Identity: `user` only (`user_access_token`).Must-read | feishu_call_tool |
| `cli.im.feed.groups.create` | Create a feed group. Identity: `user` only (`user_access_token`).Must-read | feishu_call_tool |
| `cli.im.feed.groups.delete` | Delete a feed group. Identity: `user` only (`user_access_token`).Must-read | feishu_call_tool |
| `cli.im.feed.groups.update` | Update a feed group. Identity: `user` only (`user_access_token`).Must-read | feishu_call_tool |
| `im.v1.chat.create` | [Feishu/Lark]-群组-群组管理-创建群-创建群聊，创建时支持设置群头像、群名称、群主以及群类型等配置，同时支持邀请群成员、群机器人入群 | feishu_call_tool |
| `im.v1.message.create` | [Feishu/Lark]-消息-消息管理-发送消息-调用该接口向指定用户或者群聊发送消息。支持发送的消息类型包括文本、富文本、卡片、群名片、个人名片、图片、视频、音频、文件以及表情包等 | feishu_call_tool |
| `im.v1.message.list` | [Feishu/Lark]-消息-消息管理-获取会话历史消息-获取指定会话（包括单聊、群组）内的历史消息（即聊天记录） | feishu_read_tool |
| `im.v1.message.reply` | [Feishu/Lark]-消息-消息管理-回复消息-调用该接口回复指定消息。回复的内容支持文本、富文本、卡片、群名片、个人名片、图片、视频、文件等多种类型 | feishu_call_tool |
