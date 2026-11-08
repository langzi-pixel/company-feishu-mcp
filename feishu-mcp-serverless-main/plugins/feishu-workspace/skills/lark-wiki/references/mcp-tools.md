# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `wiki.v1.node.search` | [Feishu/Lark]-云文档-知识库-搜索 Wiki | feishu_read_tool |
| `wiki.v2.space.create` | [Feishu/Lark]-云文档-知识库-知识空间-创建知识空间-此接口用于创建知识空间 | feishu_call_tool |
| `wiki.v2.space.get` | [Feishu/Lark]-云文档-知识库-知识空间-获取知识空间信息-此接口用于根据知识空间 ID 查询知识空间的信息，包括空间的类型、可见性、分享状态等 | feishu_read_tool |
| `wiki.v2.space.getNode` | [Feishu/Lark]-云文档-知识库-节点-获取知识空间节点信息-获取知识空间节点信息 | feishu_read_tool |
| `wiki.v2.space.list` | [Feishu/Lark]-云文档-知识库-知识空间-获取知识空间列表-此接口用于获取有权限访问的知识空间列表 | feishu_read_tool |
| `wiki.v2.spaceMember.create` | [Feishu/Lark]-云文档-知识库-空间成员-添加知识空间成员-添加知识空间成员或管理员 | feishu_call_tool |
| `wiki.v2.spaceMember.delete` | [Feishu/Lark]-云文档-知识库-空间成员-删除知识空间成员-此接口用于删除知识空间成员或管理员 | feishu_call_tool |
| `wiki.v2.spaceMember.list` | [Feishu/Lark]-云文档-知识库-空间成员-获取知识空间成员列表-获取知识空间的成员与管理员列表 | feishu_read_tool |
| `wiki.v2.spaceNode.copy` | [Feishu/Lark]-云文档-知识库-节点-创建知识空间节点副本-此接口用于在知识空间创建节点副本到指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.create` | [Feishu/Lark]-云文档-知识库-节点-创建知识空间节点-此接口用于在知识节点里创建[节点]到指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.list` | [Feishu/Lark]-云文档-知识库-节点-获取知识空间子节点列表-此接口用于分页获取Wiki节点的子节点列表。此接口为分页接口。由于权限过滤，可能返回列表为空，但分页标记（has_more）为true，可以继续分页请求 | feishu_read_tool |
| `wiki.v2.spaceNode.move` | [Feishu/Lark]-云文档-知识库-节点-移动知识空间节点-此方法用于在Wiki内移动节点，支持跨知识空间移动。如果有子节点，会携带子节点一起移动 | feishu_call_tool |
| `wiki.v2.spaceNode.moveDocsToWiki` | [Feishu/Lark]-云文档-知识库-云文档-移动云空间文档至知识空间-该接口允许移动云空间文档至知识空间，并挂载在指定位置 | feishu_call_tool |
| `wiki.v2.spaceNode.updateTitle` | [Feishu/Lark]-云文档-知识库-节点-更新知识空间节点标题-此接口用于更新节点标题 | feishu_call_tool |
| `wiki.v2.spaceSetting.update` | [Feishu/Lark]-云文档-知识库-空间设置-更新知识空间设置-根据space_id更新知识空间公共设置 | feishu_call_tool |
| `wiki.v2.task.get` | [Feishu/Lark]-云文档-知识库-云文档-获取任务结果-该方法用于获取wiki异步任务的结果 | feishu_read_tool |
| `cli.wiki.spaces.create` | Create Wiki space | feishu_call_tool |
| `cli.wiki.spaces.get` | Access to Wiki space information | feishu_read_tool |
| `cli.wiki.spaces.get_node` | Get Wiki node information | feishu_read_tool |
| `cli.wiki.spaces.list` | Get a list of Wiki spaces | feishu_read_tool |
| `cli.wiki.members.create` | Add Wiki space members | feishu_call_tool |
| `cli.wiki.members.delete` | Delete Wiki space members | feishu_call_tool |
| `cli.wiki.members.list` | Obtain Wiki space members | feishu_read_tool |
| `cli.wiki.nodes.copy` | Create a node copy in Wiki | feishu_call_tool |
| `cli.wiki.nodes.create` | Create node in Wiki | feishu_call_tool |
| `cli.wiki.nodes.list` | Get the list of child nodes in Wiki | feishu_read_tool |
