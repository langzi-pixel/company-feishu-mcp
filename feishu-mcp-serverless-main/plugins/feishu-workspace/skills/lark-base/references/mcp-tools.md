# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `base.v2.appRole.create` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-新增自定义角色-新增多维表格高级权限中自定义的角色 | feishu_call_tool |
| `base.v2.appRole.list` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-列出自定义角色-列出多维表格高级权限中用户自定义的角色 | feishu_read_tool |
| `base.v2.appRole.update` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-更新自定义角色-更新多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.app.copy` | [Feishu/Lark]-云文档-多维表格-多维表格-复制多维表格-复制一个多维表格，可以指定复制到某个有权限的文件夹下 | feishu_call_tool |
| `bitable.v1.app.create` | [Feishu/Lark]-云文档-多维表格-多维表格-创建多维表格-在指定文件夹中创建一个多维表格，包含一个空白的数据表 | feishu_call_tool |
| `bitable.v1.appDashboard.copy` | [Feishu/Lark]-云文档-多维表格-仪表盘-复制仪表盘-基于现有仪表盘复制出新的仪表盘 | feishu_call_tool |
| `bitable.v1.appDashboard.list` | [Feishu/Lark]-云文档-多维表格-仪表盘-列出仪表盘-获取多维表格中的所有仪表盘 | feishu_read_tool |
| `bitable.v1.app.get` | [Feishu/Lark]-云文档-多维表格-多维表格-获取多维表格元数据-获取指定多维表格的元数据信息，包括多维表格名称、多维表格版本号、多维表格是否开启高级权限等 | feishu_read_tool |
| `bitable.v1.appRole.create` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-新增自定义角色-新增多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appRole.delete` | [Feishu/Lark]-云文档-多维表格-高级权限-自定义角色-删除自定义角色-删除多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appRole.list` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-列出自定义角色-列出多维表格高级权限中用户自定义的角色 | feishu_read_tool |
| `bitable.v1.appRoleMember.batchCreate` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-批量新增协作者-批量新增多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.batchDelete` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-批量删除协作者-删除多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.create` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-新增协作者-新增多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.delete` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-删除协作者-删除多维表格高级权限中自定义角色的协作者 | feishu_call_tool |
| `bitable.v1.appRoleMember.list` | [Feishu/Lark]-云文档-多维表格-高级权限-协作者-列出协作者-列出多维表格高级权限中自定义角色的协作者 | feishu_read_tool |
| `bitable.v1.appRole.update` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-自定义角色-更新自定义角色-更新多维表格高级权限中自定义的角色 | feishu_call_tool |
| `bitable.v1.appTable.batchCreate` | [Feishu/Lark]-云文档-多维表格-数据表-新增多个数据表-新增多个数据表，仅可指定数据表名称 | feishu_call_tool |
| `bitable.v1.appTable.batchDelete` | [Feishu/Lark]-云文档-多维表格-数据表-删除多个数据表-通过 app_token 和 table_id 删除多个数据表 | feishu_call_tool |
| `bitable.v1.appTable.create` | [Feishu/Lark]-云文档-多维表格-数据表-新增一个数据表-新增一个数据表，支持传入数据表名称、视图名称和字段 | feishu_call_tool |
| `bitable.v1.appTable.delete` | [Feishu/Lark]-云文档-多维表格-数据表-删除一个数据表-通过 app_token 和 table_id 删除指定的多维表格数据表 | feishu_call_tool |
| `bitable.v1.appTableField.create` | [Feishu/Lark]-云文档-多维表格-字段-新增字段-在多维表格数据表中新增一个字段 | feishu_call_tool |
| `bitable.v1.appTableField.delete` | [Feishu/Lark]-云文档-多维表格-字段-删除字段-删除多维表格数据表中的一个字段 | feishu_call_tool |
| `bitable.v1.appTableField.list` | [Feishu/Lark]-云文档-多维表格-字段-列出字段-获取多维表格数据表中的的所有字段 | feishu_read_tool |
| `bitable.v1.appTableField.update` | [Feishu/Lark]-云文档-多维表格-字段-更新字段-在多维表格数据表中更新一个字段。更新字段时为全量更新，property 等字段会被完全覆盖 | feishu_call_tool |
| `bitable.v1.appTableFormField.list` | [Feishu/Lark]-云文档-多维表格-表单-列出表单问题-列出表单中的所有问题项 | feishu_read_tool |
| `bitable.v1.appTableFormField.patch` | [Feishu/Lark]-云文档-多维表格-表单-更新表单问题-更新表单中的问题项 | feishu_call_tool |
| `bitable.v1.appTableForm.get` | [Feishu/Lark]-云文档-多维表格-表单-获取表单元数据-获取表单的所有元数据，包括表单名称、描述、是否共享等 | feishu_read_tool |
| `bitable.v1.appTableForm.patch` | [Feishu/Lark]-云文档-多维表格-表单-更新表单元数据-更新表单视图中的元数据，包括表单名称、描述、是否共享等 | feishu_call_tool |
| `bitable.v1.appTable.list` | [Feishu/Lark]-云文档-多维表格-数据表-列出数据表-列出多维表格中的所有数据表，包括其 ID、版本号和名称 | feishu_read_tool |
| `bitable.v1.appTable.patch` | [Feishu/Lark]-云文档-多维表格-数据表-更新数据表-更新数据表的名称 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchCreate` | [Feishu/Lark]-云文档-多维表格-记录-新增多条记录-在多维表格数据表中新增多条记录，单次调用最多新增 1,000 条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchDelete` | [Feishu/Lark]-云文档-多维表格-记录-删除多条记录-删除多维表格数据表中现有的多条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.batchGet` | [Feishu/Lark]-云文档-多维表格-记录-批量获取记录-通过多个记录 ID 查询记录信息。该接口最多支持查询 100 条记录 | feishu_read_tool |
| `bitable.v1.appTableRecord.batchUpdate` | [Feishu/Lark]-云文档-多维表格-记录-更新多条记录-更新数据表中的多条记录，单次调用最多更新 1,000 条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.create` | [Feishu/Lark]-云文档-多维表格-记录-新增记录-在多维表格数据表中新增一条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.delete` | [Feishu/Lark]-云文档-多维表格-记录-删除记录-删除多维表格数据表中的一条记录 | feishu_call_tool |
| `bitable.v1.appTableRecord.get` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-检索记录-该接口用于根据 record_id 的值检索现有记录 | feishu_read_tool |
| `bitable.v1.appTableRecord.list` | [Feishu/Lark]-历史版本（不推荐）-云文档-多维表格-列出记录-该接口用于列出数据表中的现有记录，单次最多列出 500 行记录，支持分页获取 | feishu_read_tool |
| `bitable.v1.appTableRecord.search` | [Feishu/Lark]-云文档-多维表格-记录-查询记录-该接口用于查询数据表中的现有记录，单次最多查询 500 行记录，支持分页获取 | feishu_read_tool |
| `bitable.v1.appTableRecord.update` | [Feishu/Lark]-云文档-多维表格-记录-更新记录-更新多维表格数据表中的一条记录 | feishu_call_tool |
| `bitable.v1.appTableView.create` | [Feishu/Lark]-云文档-多维表格-视图-新增视图-在多维表格数据表中新增一个视图，可指定视图类型，包括表格视图、看板视图、画册视图、甘特视图和表单视图 | feishu_call_tool |
| `bitable.v1.appTableView.delete` | [Feishu/Lark]-云文档-多维表格-视图-删除视图-通过 app_token、table_id 和 view_id，删除多维表格数据表中的指定视图 | feishu_call_tool |
| `bitable.v1.appTableView.get` | [Feishu/Lark]-云文档-多维表格-视图-获取视图-根据视图 ID 获取现有视图信息，包括视图名称、类型、属性等 | feishu_read_tool |
| `bitable.v1.appTableView.list` | [Feishu/Lark]-云文档-多维表格-视图-列出视图-获取多维表格数据表中的所有视图 | feishu_read_tool |
| `bitable.v1.appTableView.patch` | [Feishu/Lark]-云文档-多维表格-视图-更新视图-增量更新视图信息，包括视图名称、属性等，可设置视图的筛选条件 | feishu_call_tool |
| `bitable.v1.app.update` | [Feishu/Lark]-云文档-多维表格-多维表格-更新多维表格元数据-更新多维表格元数据，包括多维表格的名称、是否开启高级权限 | feishu_call_tool |
| `bitable.v1.appWorkflow.list` | [Feishu/Lark]-云文档-多维表格-自动化流程-列出自动化流程-该接口用于列出多维表格的自动化流程 | feishu_read_tool |
| `bitable.v1.appWorkflow.update` | [Feishu/Lark]-云文档-多维表格-自动化流程-更新自动化流程状态-开启或关闭自动化流程 | feishu_call_tool |
