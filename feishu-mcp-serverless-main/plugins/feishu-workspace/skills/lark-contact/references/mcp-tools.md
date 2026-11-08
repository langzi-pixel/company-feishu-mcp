# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `contact.v3.department.batch` | [Feishu/Lark]-通讯录-部门-批量获取部门信息-调用该接口获取一个或多个部门的信息，包括部门名称、ID、父部门、负责人、状态以及成员个数等 | feishu_read_tool |
| `contact.v3.department.children` | [Feishu/Lark]-通讯录-部门-获取子部门列表-调用该接口查询指定部门下的子部门列表，列表内包含部门的名称、ID、父部门、负责人以及状态等信息 | feishu_read_tool |
| `contact.v3.department.get` | [Feishu/Lark]-通讯录-部门-获取单个部门信息-调用该接口获取单个部门信息，包括部门名称、ID、父部门、负责人、状态以及成员个数等 | feishu_read_tool |
| `contact.v3.department.list` | [Feishu/Lark]-历史版本（不推荐）-通讯录-部门管理-获取部门信息列表-该接口用于获取当前部门子部门列表。[常见问题答疑] | feishu_read_tool |
| `contact.v3.department.parent` | [Feishu/Lark]-通讯录-部门-获取父部门信息-调用该接口递归获取指定部门的父部门信息，包括部门名称、ID、负责人以及状态等 | feishu_read_tool |
| `contact.v3.department.search` | [Feishu/Lark]-通讯录-部门-搜索部门-调用该接口以用户身份通过部门名称关键词查询可见部门的信息，包括部门的 ID、父部门、负责人以及状态等 | feishu_read_tool |
| `contact.v3.jobTitle.get` | [Feishu/Lark]-通讯录-职务-获取单个职务信息-调用该接口获取指定职务的信息，包括职务的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.jobTitle.list` | [Feishu/Lark]-通讯录-职务-获取租户职务列表-调用该接口获取当前租户下的职务信息，包括职务的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.user.batch` | [Feishu/Lark]-通讯录-用户-批量获取用户信息-调用该接口获取通讯录内一个或多个用户的信息，包括用户 ID、名称、邮箱、手机号、状态以及所属部门等信息 | feishu_read_tool |
| `contact.v3.user.findByDepartment` | [Feishu/Lark]-通讯录-用户-获取部门直属用户列表-调用该接口获取指定部门直属的用户信息列表。用户信息包括用户 ID、名称、邮箱、手机号以及状态等信息 | feishu_read_tool |
| `contact.v3.user.get` | [Feishu/Lark]-通讯录-用户-获取单个用户信息-调用该接口获取通讯录中某一用户的信息，包括用户 ID、名称、邮箱、手机号、状态以及所属部门等信息 | feishu_read_tool |
| `contact.v3.user.list` | [Feishu/Lark]-历史版本（不推荐）-通讯录-用户管理-获取用户列表-基于部门ID获取部门下直属用户列表。[常见问题答疑] | feishu_read_tool |
| `contact.v3.user.patch` | [Feishu/Lark]-通讯录-用户-修改用户部分信息-调用该接口更新通讯录中指定用户的信息，包括名称、邮箱、手机号、所属部门以及自定义字段等信息 | feishu_call_tool |
| `contact.v3.workCity.get` | [Feishu/Lark]-通讯录-工作城市-获取单个工作城市信息-调用该接口获取指定工作城市的信息，包括工作城市的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `contact.v3.workCity.list` | [Feishu/Lark]-通讯录-工作城市-获取租户工作城市列表-调用该接口获取当前租户下所有工作城市信息，包括工作城市的 ID、名称、多语言名称以及启用状态 | feishu_read_tool |
| `cli.contact.user_profiles.batch_query` | 批量获取用户个人资料（个人状态、个性签名）。Identity: `user` only (`user_access_token`) | feishu_read_tool |
