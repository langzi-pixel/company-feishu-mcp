# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `mail.v1.publicMailbox.list` | [Feishu/Lark]-邮箱-公共邮箱-公共邮箱管理-查询所有公共邮箱-分页批量获取公共邮箱列表 | feishu_read_tool |
| `mail.v1.userMailboxEvent.subscribe` | [Feishu/Lark]-邮箱-事件-订阅事件-订阅事件 | feishu_call_tool |
| `mail.v1.userMailboxEvent.subscription` | [Feishu/Lark]-邮箱-事件-获取订阅状态-获取订阅状态 | feishu_read_tool |
| `mail.v1.userMailboxEvent.unsubscribe` | [Feishu/Lark]-邮箱-事件-取消订阅-取消订阅 | feishu_call_tool |
| `mail.v1.userMailboxFolder.create` | [Feishu/Lark]-邮箱-邮箱文件夹-创建邮箱文件夹-创建邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxFolder.delete` | [Feishu/Lark]-邮箱-邮箱文件夹-删除邮箱文件夹-删除邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxFolder.list` | [Feishu/Lark]-邮箱-邮箱文件夹-列出邮箱文件夹-列出邮箱文件夹 | feishu_read_tool |
| `mail.v1.userMailboxFolder.patch` | [Feishu/Lark]-邮箱-邮箱文件夹-修改邮箱文件夹-修改邮箱文件夹 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.create` | [Feishu/Lark]-邮箱-邮箱联系人-创建邮箱联系人-创建一个邮箱联系人 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.delete` | [Feishu/Lark]-邮箱-邮箱联系人-删除邮箱联系人-删除一个邮箱联系人 | feishu_call_tool |
| `mail.v1.userMailboxMailContact.list` | [Feishu/Lark]-邮箱-邮箱联系人-列出邮箱联系人-列出邮箱联系人列表 | feishu_read_tool |
| `mail.v1.userMailboxMailContact.patch` | [Feishu/Lark]-邮箱-邮箱联系人-修改邮箱联系人信息-修改一个邮箱联系人的信息 | feishu_call_tool |
| `mail.v1.userMailboxMessageAttachment.downloadUrl` | [Feishu/Lark]-邮箱-用户邮件-邮件附件-获取附件下载链接-获取附件下载链接 | feishu_read_tool |
| `mail.v1.userMailboxMessage.get` | [Feishu/Lark]-邮箱-用户邮件-获取邮件详情-获取邮件详情 | feishu_read_tool |
| `mail.v1.userMailboxMessage.getByCard` | [Feishu/Lark]-邮箱-用户邮件-获取邮件卡片的邮件列表-获取邮件卡片下的邮件列表 | feishu_read_tool |
| `mail.v1.userMailboxMessage.list` | [Feishu/Lark]-邮箱-用户邮件-列出邮件-列出邮件 | feishu_read_tool |
| `mail.v1.userMailboxMessage.send` | [Feishu/Lark]-邮箱-用户邮件-发送邮件-发送邮件 | feishu_call_tool |
| `mail.v1.userMailboxRule.create` | [Feishu/Lark]-邮箱-收信规则-创建收信规则-创建收信规则 | feishu_call_tool |
| `mail.v1.userMailboxRule.delete` | [Feishu/Lark]-邮箱-收信规则-删除收信规则-删除收信规则 | feishu_call_tool |
| `mail.v1.userMailboxRule.list` | [Feishu/Lark]-邮箱-收信规则-列出收信规则-列出收信规则 | feishu_read_tool |
| `mail.v1.userMailboxRule.reorder` | [Feishu/Lark]-邮箱-收信规则-对收信规则进行排序-对收信规则进行排序 | feishu_call_tool |
| `mail.v1.userMailboxRule.update` | [Feishu/Lark]-邮箱-收信规则-更新收信规则-更新收信规则 | feishu_call_tool |
| `cli.mail.multi_entity.search` | Search contacts for composing email | feishu_call_tool |
| `cli.mail.user_mailboxes.accessible_mailboxes` | List accessible mailboxes | feishu_read_tool |
| `cli.mail.user_mailboxes.profile` | Get user email information | feishu_read_tool |
| `cli.mail.user_mailboxes.search` | Search email | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.cancel_scheduled_send` | Cancel scheduled transmission | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.create` | Create draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.delete` | Delete draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.get` | Get draft content | feishu_read_tool |
| `cli.mail.user_mailbox.drafts.list` | List of drafts | feishu_read_tool |
| `cli.mail.user_mailbox.drafts.send` | Send draft | feishu_call_tool |
| `cli.mail.user_mailbox.drafts.update` | Update draft | feishu_call_tool |
| `cli.mail.user_mailbox.event.subscribe` | Subscribe to mail events | feishu_call_tool |
| `cli.mail.user_mailbox.event.subscription` | Get Subscription Status | feishu_read_tool |
| `cli.mail.user_mailbox.event.unsubscribe` | Cancel Subscribe | feishu_call_tool |
| `cli.mail.user_mailbox.folders.create` | Create Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.folders.delete` | Delete Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.folders.get` | Get mailbox folder information | feishu_read_tool |
| `cli.mail.user_mailbox.folders.list` | List Email Folders | feishu_read_tool |
| `cli.mail.user_mailbox.folders.patch` | Update Email Folder | feishu_call_tool |
| `cli.mail.user_mailbox.labels.create` | Create label | feishu_call_tool |
| `cli.mail.user_mailbox.labels.delete` | Delete label | feishu_call_tool |
| `cli.mail.user_mailbox.labels.get` | Get label information | feishu_read_tool |
| `cli.mail.user_mailbox.labels.list` | List label | feishu_read_tool |
| `cli.mail.user_mailbox.labels.patch` | Update label | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.create` | Create Email Contact | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.delete` | Delete Email Contact | feishu_call_tool |
| `cli.mail.user_mailbox.mail_contacts.list` | List Email Contacts | feishu_read_tool |
| `cli.mail.user_mailbox.mail_contacts.patch` | Modify Email Contact's Info | feishu_call_tool |
| `cli.mail.user_mailbox.message.attachments.download_url` | Get Attachment Download Links | feishu_read_tool |
| `cli.mail.user_mailbox.messages.batch_get` | Batch get email details | feishu_call_tool |
| `cli.mail.user_mailbox.messages.batch_modify` | Batch Modify Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.batch_trash` | Batch Trash Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.get` | Get Email Details | feishu_read_tool |
| `cli.mail.user_mailbox.messages.list` | List Emails | feishu_read_tool |
| `cli.mail.user_mailbox.messages.modify` | Modify Mail message | feishu_call_tool |
| `cli.mail.user_mailbox.messages.send_status` | 查询邮件发送状态 | feishu_read_tool |
| `cli.mail.user_mailbox.messages.trash` | Trash Mail Message | feishu_call_tool |
| `cli.mail.user_mailbox.rules.create` | Create Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.rules.delete` | Delete Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.rules.list` | List Auto Filters | feishu_read_tool |
| `cli.mail.user_mailbox.rules.reorder` | Reorder Auto Filters | feishu_call_tool |
| `cli.mail.user_mailbox.rules.update` | Update Auto Filter | feishu_call_tool |
| `cli.mail.user_mailbox.sent_messages.get_recall_detail` | Check the progress of email withdrawal | feishu_read_tool |
| `cli.mail.user_mailbox.sent_messages.recall` | Withdraw a sent email | feishu_call_tool |
| `cli.mail.user_mailbox.settings.send_as` | List send-as mailboxes | feishu_read_tool |
| `cli.mail.user_mailbox.template.attachments.download_url` | 获取指定邮件模板下的附件下载链接。用于在已知模板 ID 与附件 ID 的场景下，二次获取附件的有效访问 URL，便于在用户端预览或下载邮件模板中的附件资源 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.create` | 在指定用户邮箱下创建一份可复用的个人邮件模板。请求时需传入完整的模板对象（含名称、主题、正文、收件信息、附件等），创建成功后返回完整模板内容（含系统生成的 template_id），适用于将常用邮件内容沉淀为模板以便后续快速发送同类型邮件 | feishu_call_tool |
| `cli.mail.user_mailbox.templates.delete` | 永久删除指定用户邮箱下的某个个人邮件模板。删除操作不可恢复，删除后该模板将无法在「列出邮件模板」「获取邮件模板」等接口中再返回，常用于清理已废弃或不再使用的模板 | feishu_call_tool |
| `cli.mail.user_mailbox.templates.get` | 获取指定邮件模板的完整详情，包括模板名称、主题、正文（HTML 或纯文本）、收件人/抄送/密送地址、附件信息等所有字段。常用于编辑模板前回填表单，或在发送邮件场景下读取模板内容做二次填充 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.list` | 列出指定用户邮箱下的全部个人邮件模板基本信息（一次性返回，不分页），常用于在编辑或发送邮件场景下展示可选模板列表。如需获取模板正文与附件等完整字段，请通过获取个人邮件模板详情接口按 `template_id` 查询 | feishu_read_tool |
| `cli.mail.user_mailbox.templates.update` | 以全量替换的方式更新指定邮件模板的所有字段（包括名称、主题、正文、附件、收件信息等）。本接口为「全量更新」语义：请求时需传入完整的模板对象，未携带的字段将被清空。调用依赖：如仅修改部分字段，请先调用获取个人邮件模板详情接口拿到完整模板，在本地修改后再传回本接口，以避免漏传字段导致数据丢失 | feishu_call_tool |
| `cli.mail.user_mailbox.threads.batch_modify` | Batch Modify Mail Threads | feishu_call_tool |
| `cli.mail.user_mailbox.threads.batch_trash` | Batch Trash Mail Thread | feishu_call_tool |
| `cli.mail.user_mailbox.threads.get` | Get Mail Thread Message List | feishu_read_tool |
| `cli.mail.user_mailbox.threads.list` | List Mail Thread | feishu_read_tool |
| `cli.mail.user_mailbox.threads.modify` | Modify Mail Thread | feishu_call_tool |
| `cli.mail.user_mailbox.threads.trash` | Delete Mail Thread | feishu_call_tool |
