# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `approval.v4.task.query` | [Feishu/Lark]-审批-审批查询-查询用户的任务列表 | feishu_read_tool |
| `cli.approval.approvals.search` | 搜索当前用户可发起的审批定义 | feishu_call_tool |
| `cli.approval.approvals.get` | 获取审批定义详情 | feishu_read_tool |
| `cli.approval.instances.get` | 获取单个审批实例详情 | feishu_read_tool |
| `cli.approval.instances.create` | 创建审批实例 | feishu_call_tool |
| `cli.approval.instances.cancel` | 撤回审批实例 | feishu_call_tool |
| `cli.approval.instances.cc` | 抄送审批实例 | feishu_call_tool |
| `cli.approval.instances.initiated` | 查询用户的已发起列表 | feishu_read_tool |
| `cli.approval.tasks.remind` | 催办审批人 | feishu_call_tool |
| `cli.approval.tasks.approve` | 同意审批任务 | feishu_call_tool |
| `cli.approval.tasks.reject` | 拒绝审批任务 | feishu_call_tool |
| `cli.approval.tasks.transfer` | 转交审批任务 | feishu_call_tool |
| `cli.approval.tasks.query` | 查询用户的任务列表 | feishu_read_tool |
| `cli.approval.tasks.add_sign` | 审批任务加签 | feishu_call_tool |
| `cli.approval.tasks.rollback` | 退回审批任务 | feishu_call_tool |
