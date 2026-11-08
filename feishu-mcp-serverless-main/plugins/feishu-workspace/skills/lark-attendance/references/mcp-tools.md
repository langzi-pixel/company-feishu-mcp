# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `attendance.v1.archiveRule.delReport` | [Feishu/Lark]-考勤打卡-归档报表-删除归档报表行数据-按月份、用户和归档规则ID直接删除归档报表行数据 | feishu_call_tool |
| `attendance.v1.archiveRule.list` | [Feishu/Lark]-考勤打卡-归档报表-查询所有归档规则-查询所有归档规则，对应后台假勤管理-考勤统计-报表-[归档报表]功能 | feishu_read_tool |
| `attendance.v1.archiveRule.uploadReport` | [Feishu/Lark]-考勤打卡-归档报表-写入归档报表结果-写入归档报表结果，对应假勤管理-考勤统计-报表-[归档报表]页签，点击报表名称进入后的导入功能。可以将数据直接写入归档报表 | feishu_call_tool |
| `attendance.v1.archiveRule.userStatsFieldsQuery` | [Feishu/Lark]-考勤打卡-归档报表-查询归档报表表头-查询归档报表表头，对应后台假勤管理-考勤统计-报表-[归档报表]中一个归档报表的表头信息。归档报表支持引用系统报表，可设置归档时间和数据归档周期，并且支持根据部门/人员、国家/地区、人员类型、工作地点、职级、序列、职务进行人员圈选 | feishu_call_tool |
| `attendance.v1.group.listUser` | [Feishu/Lark]-考勤打卡-考勤组管理-查询考勤组下所有成员-查询指定考勤组下的所有成员 | feishu_read_tool |
| `attendance.v1.userDailyShift.batchCreateTemp` | [Feishu/Lark]-考勤打卡-考勤排班-创建或修改临时排班-可在排班表上创建或修改临时班次，并用于排班。目前支持按日期对一位或多位人员进行排临时班次。临时排班为付费功能，如需使用请联系您的客户经理 | feishu_call_tool |
| `cli.attendance.user_tasks.query` | Obtain attendance result | feishu_read_tool |
