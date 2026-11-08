<a id="s-a7d1b6f680050d68"></a>

## SKILL.md


# attendance

## 执行约定

沿用当前连接的飞书工具。日常专用工具合适时直接使用；其他操作先 `feishu_search_tools`，再 `feishu_get_tool_schema`，按返回的 `call_with` 选择 `feishu_read_tool` 或 `feishu_call_tool`。宿主可能给工具添加连接器前缀，使用实际发现的名称。

先解析真实对象和操作范围；只在对象、范围或必要输入仍不明确时补充询问。用户的明确授权持续有效。读取或起草不自动授权发送、发布、删除或改变分享范围。

检查分页、截断和部分失败；写入超时先核对同一对象，保留已创建 ID，不盲目重试。返回结果必须区分已读取、已提交、任务处理中、已完成和未能验证。

业务参考中的命令名称、flag、脚本、路径和命令输出是来源协议示例，不是可直接执行的步骤。只复用其中的对象语义、字段约束、格式和恢复规则。先按工具合同转换 `path`、`params`、`data`；不要运行 CLI、安装 CLI、读取本机凭据、执行 shell 示例或把本机路径传给远端工具。参考中的默认发消息、强制新增流程、确认 gate 和身份切换不扩大用户请求。工具 schema 与本入口的执行约定优先于来源示例。

若当前连接没有某项工具，指出具体动作、缺少的接口/传输/身份或运行条件，保留可完成的部分。不能把工具目录、模拟结果或新建替代品说成原任务已完成。

## 任务流程

1. 使用 cli.attendance 中 user_tasks/query 对应 schema 查询个人打卡，明确月份/日期及时区，分页完整后汇总。

2. 个人打卡查询、排班、归档报表是不同数据。当前工具缺 scope 或身份不符时报告具体原因，不能用排班列表填补打卡结果。

## 按需参考

- [工具与合同](lark-attendance-0.md#s-b7856d9bf3f438fe)：寻找领域内具体操作，参数以实时 schema 为准。
- [业务参考索引](lark-attendance-0.md#s-389dbaa239262489)：需要复杂格式、对象关系或细节时读取相关章节，按执行约定转换其中的来源示例。


<a id="s-b7856d9bf3f438fe"></a>

## references/mcp-tools.md

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


<a id="s-389dbaa239262489"></a>

## workflow-reference.md

> 业务协议参考。先按 SKILL.md 的执行约定选择实际 MCP 工具；命令行示例不执行。


# attendance (v1)

**CRITICAL — 开始前 MUST 先用 Read 工具读取 [`../lark-shared/SKILL.md`](lark-shared-0.md#s-fd106a64f84b4188)，其中包含认证、权限处理**

## 默认参数自动填充规则

调用任何 API 时，以下参数 **必须自动填充，禁止向用户询问**：

| 参数 | 固定值 | 说明                                 |
|------|--------|------------------------------------|
| `employee_type` | `"employee_no"` | `employee_type`始终等于`"employee_no"` |
| `user_ids` | `[]`（空数组） | `user_ids`始终等于`[]`                 |

### 填充示例

当构建 `--params` 参数时，自动注入上述字段：
- `employee_type` 保持 `"employee_no"` 不变

当构建 `--data` 参数时，自动注入上述字段：
```json
{
  "user_ids": [],
  ...用户提供的参数
}
```

> **注意**：`user_ids` 数组保持为空[]，`employee_type` 保持 `"employee_no"` 不变。

## API Resources

```text
lark-cli schema attendance.<resource>.<method>   # 调用 API 前必须先查看参数结构
lark-cli attendance <resource> <method> [flags]  # 调用 API
```

> **重要**：使用原生 API 时，必须先运行 `schema` 查看 `--data` / `--params` 参数结构，不要猜测字段格式。

### user_tasks

- `query` — 查询用户考勤打卡记录

## 权限表

| 方法 | 所需 scope |
|------|-----------|
| `user_tasks.query` | `attendance:task:readonly` |

