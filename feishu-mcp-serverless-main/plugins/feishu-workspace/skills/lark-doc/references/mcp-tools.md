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
| `docx.builtin.search` | [飞书/Lark] - 云文档-文档 - 搜索文档 - 搜索云文档，只支持user_access_token | feishu_read_tool |
| `docx.builtin.import` | [飞书/Lark] - 云文档-文档 - 导入文档 - 导入云文档，最大20MB | feishu_call_tool |
| `cli.mindnotes.nodes.create` | 创建/更新思维笔记节点 | feishu_call_tool |
| `cli.mindnotes.nodes.list` | 获取思维笔记节点列表 | feishu_read_tool |
