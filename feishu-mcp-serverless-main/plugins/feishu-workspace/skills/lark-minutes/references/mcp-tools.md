# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `minutes.v1.minute.get` | [Feishu/Lark]-妙记-妙记信息-获取妙记信息-通过这个接口，可以得到一篇妙记的基础概述信息，包含 `owner_id`、`create_time`、标题、封面、时长和 URL | feishu_read_tool |
| `minutes.v1.minuteMedia.get` | [Feishu/Lark]-妙记-妙记音视频文件-下载妙记音视频文件-获取妙记的音视频文件 | feishu_read_tool |
| `minutes.v1.minuteStatistics.get` | [Feishu/Lark]-妙记-妙记统计数据-获取妙记统计数据-通过这个接口，可以获得妙记的访问情况统计，包含PV、UV、访问过的 user id、访问过的 user timestamp | feishu_read_tool |
| `cli.minutes.minutes.get` | Get minutes meta | feishu_read_tool |
