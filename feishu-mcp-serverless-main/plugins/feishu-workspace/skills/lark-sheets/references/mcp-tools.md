# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `sheets.v3.spreadsheet.create` | [Feishu/Lark]-云文档-电子表格-表格-创建电子表格-在云空间指定目录下创建电子表格。可自定义表格标题。不支持带内容创建表格 | feishu_call_tool |
| `sheets.v3.spreadsheet.get` | [Feishu/Lark]-云文档-电子表格-表格-获取电子表格信息-根据电子表格 token 获取电子表格的基础信息，包括电子表格的所有者、URL 链接等 | feishu_read_tool |
| `sheets.v3.spreadsheet.patch` | [Feishu/Lark]-云文档-电子表格-表格-修改电子表格属性-该接口用于修改电子表格的属性。目前支持修改电子表格标题 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.create` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-创建筛选条件-在筛选视图的指定列创建筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.delete` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-删除筛选条件-删除筛选视图指定列的所有筛选条件 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.get` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-获取筛选条件-获取筛选视图某列的筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.query` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-查询筛选条件-查询指定筛选视图的所有筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterViewCondition.update` | [Feishu/Lark]-云文档-电子表格-筛选视图-筛选条件-更新筛选条件-更新筛选视图指定列的筛选条件，包括筛选的类型、比较类型、筛选参数等 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.create` | [Feishu/Lark]-云文档-电子表格-筛选视图-创建筛选视图-指定电子表格工作表的筛选范围，创建一个筛选视图 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.delete` | [Feishu/Lark]-云文档-电子表格-筛选视图-删除筛选视图-删除指定筛选视图 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.get` | [Feishu/Lark]-云文档-电子表格-筛选视图-获取筛选视图-获取指定筛选视图的信息，包括 ID、名称和筛选范围 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilterView.patch` | [Feishu/Lark]-云文档-电子表格-筛选视图-更新筛选视图-更新筛选视图的名称或筛选范围 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilterView.query` | [Feishu/Lark]-云文档-电子表格-筛选视图-查询筛选视图-查询电子表格指定工作表的所有筛选视图及其基本信息，包括视图 ID、视图名称和筛选范围 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilter.create` | [Feishu/Lark]-云文档-电子表格-筛选-创建筛选-在电子表格工作表的指定范围内，设置筛选条件，创建筛选 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilter.delete` | [Feishu/Lark]-云文档-电子表格-筛选-删除筛选-删除电子表格中指定工作表的所有筛选 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFilter.get` | [Feishu/Lark]-云文档-电子表格-筛选-获取筛选-获取电子表格中工作表的详细筛选信息，包括筛选的应用范围、筛选条件、被筛选条件过滤掉的行 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFilter.update` | [Feishu/Lark]-云文档-电子表格-筛选-更新筛选-在电子表格工作表筛选范围中，更新指定列的筛选条件 | feishu_call_tool |
| `sheets.v3.spreadsheetSheet.find` | [Feishu/Lark]-云文档-电子表格-单元格-查找单元格-在指定范围内查找符合查找条件的单元格 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.create` | [Feishu/Lark]-云文档-电子表格-浮动图片-创建浮动图片-在电子表格工作表的指定位置创建一张浮动图片 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.delete` | [Feishu/Lark]-云文档-电子表格-浮动图片-删除浮动图片-删除电子表格工作表内指定的浮动图片 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.get` | [Feishu/Lark]-云文档-电子表格-浮动图片-获取浮动图片-获取电子表格工作表内指定浮动图片的参数信息 | feishu_read_tool |
| `sheets.v3.spreadsheetSheetFloatImage.patch` | [Feishu/Lark]-云文档-电子表格-浮动图片-更新浮动图片-更新已有的浮动图片位置和宽高 | feishu_call_tool |
| `sheets.v3.spreadsheetSheetFloatImage.query` | [Feishu/Lark]-云文档-电子表格-浮动图片-查询浮动图片-获取电子表格工作表内所有的浮动图片的参数信息 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.get` | [Feishu/Lark]-云文档-电子表格-工作表-查询工作表-根据工作表 ID 查询工作表属性信息，包括工作表的标题、索引位置、是否被隐藏等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.moveDimension` | [Feishu/Lark]-云文档-电子表格-行列-移动行列-该接口用于移动行或列。行或列被移动到目标位置后，原本在目标位置的行列会对应右移或下移 | feishu_call_tool |
| `sheets.v3.spreadsheetSheet.query` | [Feishu/Lark]-云文档-电子表格-工作表-获取工作表-根据电子表格 token 获取表格中所有工作表及其属性信息，包括工作表 ID、标题、索引位置、是否被隐藏等 | feishu_read_tool |
| `sheets.v3.spreadsheetSheet.replace` | [Feishu/Lark]-云文档-电子表格-单元格-替换单元格-在指定范围内，查找并替换符合查找条件的单元格 | feishu_call_tool |
| `cli.sheets.spreadsheets.create` | Create a spreadsheet | feishu_call_tool |
| `cli.sheets.spreadsheets.get` | Get spreadsheet information | feishu_read_tool |
| `cli.sheets.spreadsheets.patch` | Modify spreadsheet properties | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.create` | Create a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.delete` | Delete a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheet.filters.get` | Obtain filter | feishu_read_tool |
| `cli.sheets.spreadsheet.sheet.filters.update` | Update a filter | feishu_call_tool |
| `cli.sheets.spreadsheet.sheets.find` | Find cells | feishu_read_tool |
| `sheets.v2.tools.read` | 读取电子表格单元格、公式、图表及结构。tool_name 如 get_workbook_structure、get_cell_ranges、get_range_as_csv；input 为对应操作的 JSON 对象。 | feishu_read_tool |
| `sheets.v2.tools.write` | 修改电子表格单元格、公式、格式、图表、透视及结构。tool_name 如 set_cell_range、batch_update、modify_sheet_structure；input 为对应操作 JSON；部分成功不自动回滚。 | feishu_call_tool |
