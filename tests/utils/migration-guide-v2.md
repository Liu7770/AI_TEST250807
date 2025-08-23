# TestHelpers V2 迁移指南

## 概述

本指南将帮助您从原始的 `test-helpers.ts` 迁移到优化后的 `test-helpers-v2.ts`。新版本提供了更好的代码组织、统一的错误处理、模块化设计和增强的可维护性。

## 主要改进

### 1. 统一的错误消息系统
- ✅ 合并了所有重复的错误消息创建方法
- ✅ 提供了类型化的错误消息工厂
- ✅ 支持多种错误类型：assertion、ux、validation、operation

### 2. 基础断言架构
- ✅ 引入了 `BaseAssertion` 抽象类
- ✅ 统一的断言执行流程
- ✅ 内置重试机制和超时控制

### 3. 模块化组织
- ✅ 命名空间分组：Assertions、Operations、Validators、ErrorMessages
- ✅ 清晰的功能域划分
- ✅ 更好的代码可发现性

### 4. 接口优化
- ✅ 统一的参数对象结构
- ✅ 可选的配置参数
- ✅ 类型安全的接口设计

## 迁移映射表

### 错误消息方法

| 原始方法 | 新方法 | 说明 |
|---------|--------|------|
| `formatErrorMessage()` | `ErrorMessages.create('assertion', options)` | 统一的错误消息创建 |
| `createFriendlyErrorMessage()` | `ErrorMessages.create('ux', options)` | UX友好的错误消息 |
| `createValidationErrorMessage()` | `ErrorMessages.create('validation', options)` | 验证错误消息 |

### 断言方法

| 原始方法 | 新方法 | 说明 |
|---------|--------|------|
| `assertBase64Encoding()` | `Assertions.base64Encoding()` 或 `TestHelpersV2.assertBase64Encoding()` | Base64编码断言 |
| `assertBase64Decoding()` | `Assertions.base64Decoding()` 或 `TestHelpersV2.assertBase64Decoding()` | Base64解码断言 |
| `assertElementVisible()` | `Assertions.elementVisible()` 或 `TestHelpersV2.assertElementVisible()` | 元素可见性断言 |
| `assertInputValue()` | `Assertions.inputValue()` 或 `TestHelpersV2.assertInputValue()` | 输入框值断言 |
| `assertPageTitle()` | `helpers.assertPageTitle()` (实例方法) | 页面标题断言 |
| `assertOutputNotDefault()` | `Assertions.outputNotDefault()` 或 `TestHelpersV2.assertOutputNotDefault()` | 输出非默认内容断言 |

### 操作方法

| 原始方法 | 新方法 | 说明 |
|---------|--------|------|
| `performEncoding()` | `Operations.encoding()` 或 `TestHelpersV2.performEncoding()` | 编码操作 |
| `performDecoding()` | `Operations.decoding()` 或 `TestHelpersV2.performDecoding()` | 解码操作 |
| `performClear()` | `Operations.clear()` 或 `TestHelpersV2.performClear()` | 清空操作 |
| `performJsonFormat()` | `Operations.jsonFormat()` 或 `TestHelpersV2.performJsonFormat()` | JSON格式化操作 |
| `performPasswordGeneration()` | `Operations.passwordGeneration()` 或 `TestHelpersV2.performPasswordGeneration()` | 密码生成操作 |
| `performUuidGeneration()` | `Operations.uuidGeneration()` 或 `TestHelpersV2.performUuidGeneration()` | UUID生成操作 |

### 验证方法

| 原始方法 | 新方法 | 说明 |
|---------|--------|------|
| `validateEmptyInputHandling()` | `Validators.emptyInputHandling()` 或 `TestHelpersV2.validateEmptyInputHandling()` | 空输入处理验证 |

## 迁移步骤

### 步骤 1：更新导入语句

**原始导入：**
```typescript
import { TestHelpers } from '../utils/test-helpers';
```

**新版本导入（选择一种方式）：**

```typescript
// 方式1：使用命名空间（推荐）
import { Assertions, Operations, Validators, ErrorMessages } from '../utils/test-helpers-v2';

// 方式2：使用主类
import { TestHelpersV2 } from '../utils/test-helpers-v2';

// 方式3：混合使用
import { TestHelpersV2, Assertions, Operations } from '../utils/test-helpers-v2';

// 方式4：向后兼容（临时使用）
import { TestHelpers } from '../utils/test-helpers-v2'; // TestHelpersV2 as TestHelpers
```

### 步骤 2：更新方法调用

#### 2.1 断言方法迁移

**原始代码：**
```typescript
await TestHelpers.assertBase64Encoding(
  outputLocator,
  'Hello',
  'SGVsbG8=',
  'Base64编码测试'
);
```

**新版本代码（推荐）：**
```typescript
// 使用命名空间
await Assertions.base64Encoding({
  outputLocator,
  input: 'Hello',
  expectedOutput: 'SGVsbG8=',
  testName: 'Base64编码测试',
  config: {
    timeout: 5000,
    retryCount: 1
  }
});

// 或使用静态方法
await TestHelpersV2.assertBase64Encoding({
  outputLocator,
  input: 'Hello',
  expectedOutput: 'SGVsbG8=',
  testName: 'Base64编码测试'
});
```

#### 2.2 操作方法迁移

**原始代码：**
```typescript
await TestHelpers.performEncoding(page, 'Hello World');
```

**新版本代码：**
```typescript
// 使用命名空间
await Operations.encoding({
  page,
  input: 'Hello World'
});

// 或使用静态方法
await TestHelpersV2.performEncoding({
  page,
  input: 'Hello World'
});
```

#### 2.3 实例方法迁移

**原始代码：**
```typescript
const helpers = new TestHelpers(page);
await helpers.assertPageTitle(/Base64/, 'Base64工具页面');
```

**新版本代码：**
```typescript
const helpers = new TestHelpersV2(page);
await helpers.assertPageTitle(/Base64/, 'Base64工具页面');
```

### 步骤 3：更新错误处理

**原始代码：**
```typescript
const errorMsg = TestHelpers.formatErrorMessage(
  'Base64编码测试',
  'Hello',
  'SGVsbG8=',
  actualOutput,
  '请检查编码逻辑'
);
```

**新版本代码：**
```typescript
const errorMsg = ErrorMessages.create('assertion', {
  testName: 'Base64编码测试',
  input: 'Hello',
  expected: 'SGVsbG8=',
  actual: actualOutput,
  suggestion: '请检查编码逻辑'
});
```

## 渐进式迁移策略

### 阶段 1：并行运行（推荐）
1. 保留原始 `test-helpers.ts` 文件
2. 引入 `test-helpers-v2.ts` 文件
3. 新测试使用 V2 版本
4. 逐步迁移现有测试

### 阶段 2：逐个文件迁移
1. 选择一个测试文件进行迁移
2. 更新导入语句
3. 更新方法调用
4. 运行测试确保功能正常
5. 重复此过程直到所有文件迁移完成

### 阶段 3：清理和优化
1. 删除原始 `test-helpers.ts` 文件
2. 将 `test-helpers-v2.ts` 重命名为 `test-helpers.ts`
3. 更新所有导入路径
4. 运行完整测试套件

## 最佳实践

### 1. 选择合适的使用方式

```typescript
// ✅ 推荐：使用命名空间（清晰的功能分组）
import { Assertions, Operations } from '../utils/test-helpers-v2';

test('示例测试', async ({ page }) => {
  await Operations.encoding({ page, input: 'test' });
  await Assertions.base64Encoding({ outputLocator, input: 'test', expectedOutput: 'dGVzdA==' });
});

// ✅ 可选：使用静态方法（与原版本类似）
import { TestHelpersV2 } from '../utils/test-helpers-v2';

test('示例测试', async ({ page }) => {
  await TestHelpersV2.performEncoding({ page, input: 'test' });
  await TestHelpersV2.assertBase64Encoding({ outputLocator, input: 'test', expectedOutput: 'dGVzdA==' });
});

// ✅ 实例方法：适用于需要页面上下文的场景
import { TestHelpersV2 } from '../utils/test-helpers-v2';

test('示例测试', async ({ page }) => {
  const helpers = new TestHelpersV2(page);
  await helpers.assertPageTitle(/Expected Title/);
  await helpers.assertElementVisible('button', '提交按钮');
});
```

### 2. 利用配置选项

```typescript
// 使用重试和超时配置
await Assertions.elementVisible({
  locator: page.locator('#slow-element'),
  elementName: '慢加载元素',
  testName: '元素可见性测试',
  config: {
    timeout: 10000,
    retryCount: 3
  }
});
```

### 3. 统一错误处理

```typescript
try {
  // 测试逻辑
} catch (error) {
  const friendlyError = ErrorMessages.create('assertion', {
    testName: '自定义测试',
    expected: '预期结果',
    actual: '实际结果',
    suggestion: '改进建议'
  });
  throw new Error(friendlyError);
}
```

## 常见问题

### Q1: 是否需要立即迁移所有测试？
A1: 不需要。建议采用渐进式迁移策略，新测试使用 V2 版本，现有测试逐步迁移。

### Q2: V2 版本是否向后兼容？
A2: 部分兼容。主要的 API 变化是参数结构从位置参数改为对象参数，但提供了向后兼容的导出。

### Q3: 如何处理复杂的迁移场景？
A3: 对于复杂场景，建议先在测试环境中验证迁移效果，确保所有功能正常后再应用到生产环境。

### Q4: 性能是否有改善？
A4: 是的。V2 版本通过减少重复代码、优化错误处理和提供重试机制，整体性能和稳定性都有提升。

## 支持和反馈

如果在迁移过程中遇到问题，请：
1. 查看 `test-helpers-v2-usage-example.ts` 中的使用示例
2. 参考本迁移指南的相关章节
3. 在测试环境中验证迁移效果
4. 记录遇到的问题和解决方案，以便后续改进

---

**迁移检查清单：**

- [ ] 更新导入语句
- [ ] 迁移断言方法调用
- [ ] 迁移操作方法调用
- [ ] 迁移验证方法调用
- [ ] 更新错误处理逻辑
- [ ] 运行测试验证功能
- [ ] 更新相关文档
- [ ] 团队培训和知识分享