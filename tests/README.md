# Dev Forge 自动化测试套件

本测试套件为 Dev Forge 开发者工具网站 (https://www.001236.xyz) 提供全面的自动化测试覆盖。

## 测试模块概览

### 1. 基础功能测试

#### `json-tool.spec.ts` - JSON工具基础测试
- JSON格式化功能
- 无效JSON错误处理
- 基本输入输出验证

#### `base64-tool.spec.ts` - Base64工具基础测试
- Base64编码功能（普通文本、特殊字符、中文）
- Base64解码功能
- 编码/解码模式切换

#### `dev-forge-tools.spec.ts` - 开发工具综合测试
- 工具间导航
- 页面加载验证
- 基本功能集成

### 2. 用户体验和可访问性测试

#### `accessibility-ux.spec.ts` - 可访问性和用户体验测试
- **键盘导航测试** - Tab键导航、Enter键操作
- **颜色对比度测试** - 文本可读性验证
- **响应式设计测试** - 不同屏幕尺寸适配
- **表单可访问性测试** - 标签关联、焦点管理
- **错误状态反馈测试** - 错误信息显示
- **加载性能测试** - 页面加载时间
- **深色模式测试** - 主题切换功能
- **图片和媒体测试** - Alt文本验证
- **链接和按钮测试** - 交互元素可访问性
- **页面结构测试** - 语义化HTML结构

### 3. 安全性测试

#### `security.spec.ts` - 安全性测试
- **XSS防护测试** - 跨站脚本攻击防护
- **输入验证测试** - 超长字符串处理
- **SQL注入防护测试** - 数据库注入攻击防护
- **CSRF防护测试** - 跨站请求伪造防护
- **文件上传安全测试** - 文件类型验证
- **敏感信息泄露检测** - 隐私数据保护
- **点击劫持防护测试** - X-Frame-Options验证

### 4. 性能测试

#### `performance.spec.ts` - 性能测试
- **页面加载性能** - 首屏加载时间
- **资源加载优化** - 静态资源性能
- **内存使用测试** - 内存泄漏检测
- **网络性能测试** - 网络请求优化
- **Core Web Vitals** - 用户体验指标
- **缓存性能测试** - 缓存策略验证

### 5. API和数据交互测试

#### `api.spec.ts` - API测试
- **JSON格式化API测试** - 后端API调用
- **Base64编码API测试** - 编码服务测试
- **错误处理API测试** - 异常情况处理
- **API响应时间测试** - 性能基准
- **并发请求测试** - 高并发场景
- **数据验证API测试** - 数据完整性
- **API安全性测试** - 恶意输入处理
- **API版本兼容性测试** - 向后兼容性

### 6. 跨浏览器兼容性测试

#### `cross-browser.spec.ts` - 跨浏览器兼容性测试
- **多浏览器基本功能测试** - Chromium、Firefox、WebKit
- **移动设备兼容性测试** - iPhone、Android、iPad
- **分辨率兼容性测试** - 多种屏幕分辨率
- **JavaScript兼容性测试** - ES6+特性支持
- **CSS兼容性测试** - 现代CSS特性
- **网络条件兼容性测试** - 慢网络环境
- **用户代理兼容性测试** - 不同UA字符串
- **语言地区兼容性测试** - 国际化支持

### 7. 数据持久化和状态管理测试

#### `data-persistence.spec.ts` - 数据持久化测试
- **本地存储功能测试** - localStorage使用
- **会话存储功能测试** - sessionStorage管理
- **跨标签页状态同步** - 多标签页数据同步
- **数据版本控制和迁移** - 数据格式升级
- **存储配额和限制测试** - 存储空间管理
- **存储安全性测试** - 数据安全保护
- **离线数据同步测试** - 离线模式支持
- **数据导出导入功能** - 数据备份恢复
- **存储性能测试** - 读写性能优化
- **存储事件监听测试** - 存储变化监听

### 8. 集成测试

#### `integration.spec.ts` - 端到端集成测试
- **完整工作流程测试** - JSON和Base64工具完整流程
- **跨工具导航测试** - 工具间切换
- **响应式布局测试** - 多设备布局验证
- **错误恢复测试** - 异常情况恢复
- **性能基准测试** - 大数据处理性能
- **并发操作测试** - 多用户并发场景
- **用户体验流程测试** - 真实用户操作模拟

## 测试覆盖范围

### 功能覆盖
- ✅ JSON格式化和验证
- ✅ Base64编码/解码
- ✅ 用户界面交互
- ✅ 错误处理和恢复
- ✅ 数据持久化
- ✅ 响应式设计

### 质量保证
- ✅ 可访问性标准 (WCAG)
- ✅ 性能基准测试
- ✅ 安全漏洞检测
- ✅ 跨浏览器兼容性
- ✅ 移动设备适配
- ✅ 国际化支持

### 技术覆盖
- ✅ 前端JavaScript功能
- ✅ CSS样式和布局
- ✅ HTML语义化结构
- ✅ 本地存储API
- ✅ 网络请求处理
- ✅ 浏览器兼容性

## 测试目录结构

### functional/ - 功能模块测试
- `json-tool.spec.ts` - JSON工具功能测试
- `base64-tool.spec.ts` - Base64编码解码工具测试
- `dev-forge-tools.spec.ts` - 开发工具综合测试
- `hash-calculator.spec.ts` - 哈希计算器功能测试（MD5、SHA1、SHA256等）
- `uuid-generator.spec.ts` - UUID生成器功能测试
- `password-generator.spec.ts` - 密码生成器功能测试
- `url-tool.spec.ts` - URL编码解码工具功能测试
- `timestamp.spec.ts` - 时间戳转换工具功能测试
- `color-converter.spec.ts` - 颜色转换器功能测试
- `jwt-decoder.spec.ts` - JWT解码器功能测试
- `qr-code-generator.spec.ts` - QR码生成器功能测试
- `text-diff.spec.ts` - 文本差异比较工具功能测试
- `regex-tester.spec.ts` - 正则表达式测试器功能测试
- `markdown-editor.spec.ts` - Markdown编辑器功能测试

### quality/ - 质量保证测试
- `accessibility-ux.spec.ts` - 可访问性和用户体验测试
- `security.spec.ts` - 安全性测试（XSS防护、输入验证等）
- `performance.spec.ts` - 性能测试（加载时间、资源优化等）
- `cross-browser.spec.ts` - 跨浏览器和设备兼容性测试

### integration/ - 集成测试
- `api.spec.ts` - API接口测试
- `data-persistence.spec.ts` - 本地存储、会话存储等数据持久化测试
- `integration.spec.ts` - 端到端集成测试

## 运行测试

### 运行所有测试
```bash
npx playwright test
```

### 运行特定测试模块
```bash
# 功能模块测试
npx playwright test tests/functional/
npx playwright test tests/functional/json-tool.spec.ts
npx playwright test tests/functional/base64-tool.spec.ts

# 质量保证测试
npx playwright test tests/quality/
npx playwright test tests/quality/accessibility-ux.spec.ts
npx playwright test tests/quality/security.spec.ts
npx playwright test tests/quality/performance.spec.ts
npx playwright test tests/quality/cross-browser.spec.ts

# 集成测试
npx playwright test tests/integration/
npx playwright test tests/integration/api.spec.ts
npx playwright test tests/integration/data-persistence.spec.ts
npx playwright test tests/integration/integration.spec.ts
```

### 运行带界面的测试
```bash
npx playwright test --headed
```

### 调试模式运行
```bash
npx playwright test --debug
```

### 运行特定浏览器测试
```bash
# 仅在 Chromium 中运行
npx playwright test --project=chromium

# 仅在 Firefox 中运行
npx playwright test --project=firefox

# 仅在 WebKit 中运行
npx playwright test --project=webkit
```

### 并行运行测试
```bash
# 指定工作进程数
npx playwright test --workers=4

# 禁用并行运行
npx playwright test --workers=1
```

### 生成测试报告
```bash
npx playwright show-report
```

### 更新测试快照
```bash
npx playwright test --update-snapshots
```

## 测试最佳实践

### 元素定位策略
基于之前的调试经验，测试中采用了以下元素定位最佳实践：

1. **避免严格模式冲突**
   ```typescript
   // ❌ 可能匹配多个元素
   page.locator('h1')
   
   // ✅ 使用更精确的选择器
   page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })
   ```

2. **响应式元素处理**
   ```typescript
   // 根据视口大小选择不同的元素
   const h1Selector = viewport.width < 768 ? 'h1.text-xl' : 'h1.text-2xl';
   ```

3. **命名空间选择器**
   ```typescript
   // ❌ 可能匹配页面多处的相同文本
   page.locator('text=JSON Tools')
   
   // ✅ 限定在特定容器内
   page.locator('nav').locator('text=JSON Tools')
   ```

4. **错误信息匹配**
   ```typescript
   // 使用部分匹配避免完整错误信息变化
   page.locator('text=Invalid JSON: Unexpected')
   ```

### 测试稳定性
- 使用适当的等待策略 (`waitForTimeout`, `waitForLoadState`)
- 验证元素可见性后再进行交互
- 处理异步操作的完成状态
- 清理测试数据避免测试间干扰

### 错误处理
- 捕获和记录详细的错误信息
- 提供有意义的断言失败消息
- 实现测试重试机制
- 生成错误上下文截图

## 持续改进

测试套件会根据以下因素持续更新：
- 新功能的添加
- 用户反馈和问题报告
- 性能优化需求
- 安全标准更新
- 浏览器兼容性变化
- 可访问性标准演进

## 贡献指南

添加新测试时请遵循：
1. 使用描述性的测试名称
2. 遵循现有的代码风格
3. 添加适当的注释和文档
4. 确保测试的独立性和可重复性
5. 验证测试在所有支持的浏览器中通过