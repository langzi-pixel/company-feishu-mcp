# 工具与合同

运行时以 feishu_get_tool_schema 为准；此索引不表示对应租户已经授权。

| 名称 | 操作 | 调用 |
|---|---|---|
| `cli.slides.xml_presentations.create` | 以 XML 格式创建演示文稿 | feishu_call_tool |
| `cli.slides.xml_presentations.get` | 读取演示文稿全文信息，XML 格式返回 | feishu_read_tool |
| `cli.slides.xml_presentation.history.list` | 列出 XML 演示文稿历史版本 | feishu_read_tool |
| `cli.slides.xml_presentation.history.revert` | 按 history_version_id 发起 XML 演示文稿历史版本回滚任务 | feishu_call_tool |
| `cli.slides.xml_presentation.history.revert_status` | 查询 XML 演示文稿历史回滚任务状态 | feishu_read_tool |
| `cli.slides.xml_presentation.slide.create` | 在指定 XML 演示文稿下创建页面 | feishu_call_tool |
| `cli.slides.xml_presentation.slide.delete` | 在指定 XML 演示文稿下删除页面 | feishu_call_tool |
| `cli.slides.xml_presentation.slide.get` | 获取指定 XML 演示文稿的单个页面 XML 内容 | feishu_read_tool |
| `cli.slides.xml_presentation.slide.replace` | 对指定 XML 演示文稿页面进行元素级别的局部替换 | feishu_call_tool |
| `cli.slides.xml_presentation.slide_image.list` | 获取幻灯片截图 | feishu_read_tool |
| `cli.slides.xml_presentation.slide_image.render` | 渲染页面截图为图片 | feishu_call_tool |
