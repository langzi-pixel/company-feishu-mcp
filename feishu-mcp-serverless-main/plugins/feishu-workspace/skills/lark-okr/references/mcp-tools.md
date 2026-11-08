# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `okr.v1.okr.batchGet` | [Feishu/Lark]-OKR-OKR 内容-批量获取 OKR-根据 OKR id 批量获取 OKR | feishu_read_tool |
| `okr.v1.progressRecord.create` | [Feishu/Lark]-OKR-OKR 进展记录-创建 OKR 进展记录-创建 OKR 进展记录 | feishu_call_tool |
| `okr.v1.progressRecord.delete` | [Feishu/Lark]-OKR-OKR 进展记录-删除 OKR 进展记录-根据 ID 删除 OKR 进展记录 | feishu_call_tool |
| `okr.v1.progressRecord.get` | [Feishu/Lark]-OKR-OKR 进展记录-获取 OKR 进展记录-根据 ID 获取 OKR 进展记录详情，接口返回进展记录的内容、更新时间以及进展百分比和状态 | feishu_read_tool |
| `okr.v1.progressRecord.update` | [Feishu/Lark]-OKR-OKR 进展记录-更新 OKR 进展记录-根据 OKR 进展记录 ID 更新进展详情 | feishu_call_tool |
| `okr.v1.userOkr.list` | [Feishu/Lark]-OKR-OKR 内容-获取用户的 OKR 列表-根据用户的 id 获取 OKR 列表 | feishu_read_tool |
| `cli.okr.alignments.delete` | Delete OKR Alignment | feishu_call_tool |
| `cli.okr.alignments.get` | Get OKR Alignment | feishu_read_tool |
| `cli.okr.categories.list` | List all okr categories | feishu_read_tool |
| `cli.okr.cycles.list` | Get user OKR Cycle list | feishu_read_tool |
| `cli.okr.cycles.objectives_position` | Update the positions of all Objectives in a user's OKR cycle | feishu_call_tool |
| `cli.okr.cycles.objectives_weight` | Update the weights of all Objectives in a user's OKR cycle | feishu_call_tool |
| `cli.okr.cycle.objectives.create` | Create Objective in OKR Cycle | feishu_call_tool |
| `cli.okr.cycle.objectives.list` | Get Objectives in OKR Cycle | feishu_read_tool |
| `cli.okr.indicators.patch` | Update Indicator | feishu_call_tool |
| `cli.okr.key_results.delete` | Delete Key Result | feishu_call_tool |
| `cli.okr.key_results.get` | Get Key Result | feishu_read_tool |
| `cli.okr.key_results.patch` | Modify Key Result | feishu_call_tool |
| `cli.okr.key_result.indicators.list` | Get Indicator of a Key Result | feishu_read_tool |
| `cli.okr.objectives.delete` | Delete Objective | feishu_call_tool |
| `cli.okr.objectives.get` | Get Objective | feishu_read_tool |
| `cli.okr.objectives.key_results_position` | Update the positions of all Key Results of an Objective | feishu_call_tool |
| `cli.okr.objectives.key_results_weight` | Update the weights of all Key Results of an Objective | feishu_call_tool |
| `cli.okr.objectives.patch` | Modify Objective | feishu_call_tool |
| `cli.okr.objective.alignments.create` | Create Object Alignment | feishu_call_tool |
| `cli.okr.objective.alignments.list` | List Alignment of an Objective | feishu_read_tool |
| `cli.okr.objective.indicators.list` | Get Indicator of an Objective | feishu_read_tool |
| `cli.okr.objective.key_results.create` | Create Key Result of an Objective | feishu_call_tool |
| `cli.okr.objective.key_results.list` | List Key Results of an Objective | feishu_read_tool |
