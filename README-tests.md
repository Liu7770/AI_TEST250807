# Dev Forge 网站自动化测试

这个项目包含了对 Dev Forge 开发者工具网站 (https://www.001236.xyz/en) 的完整自动化测试套件。

## 测试文件说明

### 1. json-tool.spec.ts
- **功能**: 测试 JSON 工具的格式化功能
- **测试场景**:
  - 格式化有效的 JSON 数据
  - 处理无效 JSON 输入的错误提示
  - 清空输入后的行为验证

### 2. base64-tool.spec.ts
- **功能**: 测试 Base64 编码/解码工具
- **测试场景**:
  - Base64 编码功能（普通文本、特殊字符、中文字符）
  - Base64 解码功能（有效和无效的 Base64 字符串）
  - 清空功能测试
  - 编码/解码模式切换
  - 页面元素存在性验证

### 3. dev-forge-tools.spec.ts
- **功能**: 网站整体功能和导航测试
- **测试场景**:
  - 首页加载和基本元素验证
  - 语言切换功能
  - 侧边栏导航测试
  - 工具页面导航
  - 未实现工具的状态检查
  - 响应式设计测试
  - 页面性能和加载时间
  - 错误处理
  - SEO 元素检查

### 4. accessibility-ux.spec.ts
- **功能**: 可访问性和用户体验测试
- **测试场景**:
  - 键盘导航支持
  - 颜色对比度和可读性
  - 响应式设计在不同设备上的表现
  - 表单可访问性
  - 错误状态和用户反馈
  - 加载状态和性能
  - 深色模式支持
  - 图片和媒体的可访问性
  - 链接和按钮的可访问性
  - 页面结构和语义化

## 运行测试

### 运行所有测试
```bash
npx playwright test
```

### 运行特定测试文件
```bash
# JSON 工具测试
npx playwright test tests/json-tool.spec.ts

# Base64 工具测试
npx playwright test tests/base64-tool.spec.ts

# 整体网站功能测试
npx playwright test tests/dev-forge-tools.spec.ts

# 可访问性测试
npx playwright test tests/accessibility-ux.spec.ts
```

### 以可视化模式运行测试
```bash
npx playwright test --headed
```

### 运行特定浏览器的测试
```bash
# 只在 Chrome 中运行
npx playwright test --project=chromium

# 只在 Firefox 中运行
npx playwright test --project=firefox

# 只在 Safari 中运行
npx playwright test --project=webkit
```

### 生成和查看测试报告

#### 生成HTML报告
```bash
npx playwright test --reporter=html
```

#### 查看测试报告

**本地开发环境：**
```bash
# 启动报告服务（本地访问）
npx playwright show-report
```

**服务器部署环境：**
```bash
# 启动报告服务（外部访问）
npx playwright show-report --host 0.0.0.0 --port 9323

# 后台运行报告服务
nohup npx playwright show-report --host 0.0.0.0 --port 9323 > playwright-report.log 2>&1 &

# 查看服务状态
pgrep -f "playwright.*show-report"

# 停止报告服务
pkill -f "playwright.*show-report"
```

**访问报告：**
- 本地：浏览器会自动打开报告页面
- 服务器：通过 `http://服务器IP:9323` 访问
- 确保防火墙已开放9323端口

## 测试配置

测试配置在 `playwright.config.ts` 文件中定义，包括：
- 浏览器设置（Chromium、Firefox、WebKit）
- 超时设置
- 重试策略
- 报告格式

## 网站功能覆盖

### 已实现并测试的功能
- ✅ JSON Tools - 完整测试覆盖
- ✅ Base64 Encoder/Decoder - 完整测试覆盖
- ✅ 网站导航和基础功能
- ✅ 可访问性和用户体验

### 待实现的工具（显示"即将推出"）
- ⏳ Timestamp Converter
- ⏳ Crontab Tool
- ⏳ Hash Calculator
- ⏳ JWT Decoder
- ⏳ UUID Generator
- ⏳ Password Generator
- ⏳ URL Tool
- ⏳ Code Beautifier
- ⏳ Color Converter
- ⏳ Base Converter
- ⏳ SQL Formatter
- ⏳ Image to Base64
- ⏳ Data Converter
- ⏳ HTTP Status Lookup
- ⏳ User-Agent Parser

## 测试最佳实践

1. **页面对象模式**: 使用选择器常量来提高测试的可维护性
2. **等待策略**: 使用 Playwright 的自动等待机制
3. **错误处理**: 测试正常流程和错误场景
4. **跨浏览器兼容性**: 在多个浏览器中运行测试
5. **可访问性**: 包含键盘导航和屏幕阅读器支持的测试
6. **性能**: 监控页面加载时间和响应性能

## 故障排除

### 常见问题

1. **测试超时**
   - 检查网络连接
   - 增加超时设置
   - 确认网站可访问性

2. **元素选择器失效**
   - 网站UI可能已更新
   - 需要更新选择器

3. **跨浏览器差异**
   - 某些功能可能在不同浏览器中表现不同
   - 使用浏览器特定的条件判断

### 调试技巧

```bash
# 以调试模式运行测试
npx playwright test --debug

# 生成测试执行的视频
npx playwright test --video=on

# 在测试失败时截图
npx playwright test --screenshot=only-on-failure
```

## 贡献指南

当网站添加新功能时，请：
1. 为新功能创建对应的测试文件
2. 遵循现有的测试结构和命名约定
3. 包含正常流程和边界情况的测试
4. 更新此 README 文件

## 联系信息

如有问题或建议，请通过项目的 Issue 系统提交。