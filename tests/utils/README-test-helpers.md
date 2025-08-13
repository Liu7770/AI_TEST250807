# TestHelpers 测试辅助工具使用指南

## 概述

`TestHelpers` 类提供了统一的测试辅助方法和友好的错误消息格式，确保所有测试模块都能提供一致的、易于理解的测试报告。

## 友好错误消息方法

### 1. createFriendlyErrorMessage

用于创建标准的输入输出对比错误消息。

```typescript
const errorMessage = TestHelpers.createFriendlyErrorMessage(
  '中文字符Base64编码功能存在缺陷',
  '你好世界',
  '5L2g5aW95LiW55WM',
  'Base64 Output...',
  '请检查网站的编码逻辑，可能存在字符编码转换问题'
);

// 输出格式：
// 🐛 中文字符Base64编码功能存在缺陷！
// 📝 测试输入: "你好世界"
// ✅ 预期输出: "5L2g5aW95LiW55WM"
// ❌ 实际输出: "Base64 Output..."
// 🔧 建议: 请检查网站的编码逻辑，可能存在字符编码转换问题
```

### 2. createTestFailureMessage

用于创建通用的测试失败错误消息。

```typescript
const errorMessage = TestHelpers.createTestFailureMessage(
  '按钮状态测试',
  '空格输入时编码按钮状态检查',
  '按钮应该被禁用（仅包含空格视为无效输入）',
  '按钮处于启用状态',
  '网站应该将仅包含空格的输入视为无效输入'
);

// 输出格式：
// 🐛 按钮状态测试失败！
// 📝 测试场景: 空格输入时编码按钮状态检查
// ✅ 预期行为: 按钮应该被禁用（仅包含空格视为无效输入）
// ❌ 实际行为: 按钮处于启用状态
// 🔧 建议: 网站应该将仅包含空格的输入视为无效输入
```

### 3. createUXTestFailureMessage

用于创建UX体验相关的测试失败错误消息。

```typescript
const errorMessage = TestHelpers.createUXTestFailureMessage(
  '空输入处理测试',
  '空输入编码操作缺少用户提示',
  '显示友好提示信息（如"请先输入要编码的内容"）',
  '无任何提示信息',
  '网站应该在用户尝试编码空内容时显示友好提示信息'
);

// 输出格式：
// 🐛 空输入处理测试失败！
// 🎨 UX问题: 空输入编码操作缺少用户提示
// ✅ 期望UX: 显示友好提示信息（如"请先输入要编码的内容"）
// ❌ 实际UX: 无任何提示信息
// 💡 UX改进: 网站应该在用户尝试编码空内容时显示友好提示信息
```

## 在测试中使用示例

### 基本断言测试

```typescript
test('功能测试示例', async ({ page }) => {
  try {
    // 执行测试操作
    await performSomeAction();
    
    // 获取实际结果
    const actualResult = await getActualResult();
    const expectedResult = 'expected value';
    
    // 使用友好错误消息进行断言
    if (actualResult !== expectedResult) {
      const errorMessage = TestHelpers.createFriendlyErrorMessage(
        '功能测试',
        'test input',
        expectedResult,
        actualResult,
        '请检查功能实现逻辑'
      );
      throw new Error(errorMessage);
    }
  } catch (error) {
    // 错误会显示友好的格式化消息
    throw error;
  }
});
```

### UX体验测试

```typescript
test('UX体验测试示例', async ({ page }) => {
  // 测试空输入处理
  await inputElement.fill('');
  await clickButton();
  
  const errorMessages = await page.locator('[role="alert"]').count();
  
  if (errorMessages === 0) {
    const errorMessage = TestHelpers.createUXTestFailureMessage(
      'UX体验测试',
      '空输入操作缺少用户提示',
      '显示友好提示信息',
      '无任何提示信息',
      '应该为用户提供明确的操作指导'
    );
    throw new Error(errorMessage);
  }
});
```

## 最佳实践

1. **统一使用友好错误消息**：所有测试失败时都应该使用 `TestHelpers` 提供的错误消息方法。

2. **选择合适的错误消息类型**：
   - 输入输出对比测试 → `createFriendlyErrorMessage`
   - 一般功能测试 → `createTestFailureMessage`
   - UX体验测试 → `createUXTestFailureMessage`

3. **提供具体的改进建议**：错误消息中的建议部分应该提供具体、可操作的改进方向。

4. **保持消息简洁明了**：避免过长的描述，重点突出问题和解决方案。

## 扩展新的错误消息类型

如果需要新的错误消息格式，可以在 `TestHelpers` 类中添加新的静态方法：

```typescript
static createCustomErrorMessage(
  testName: string,
  customField1: string,
  customField2: string,
  suggestion: string
): string {
  return [
    `🐛 ${testName}失败！`,
    `📋 自定义字段1: ${customField1}`,
    `📋 自定义字段2: ${customField2}`,
    `🔧 建议: ${suggestion}`
  ].join('\n');
}
```

这样可以确保整个测试框架的错误消息格式保持一致和友好。