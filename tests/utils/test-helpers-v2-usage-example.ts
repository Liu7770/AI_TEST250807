import { test, expect } from '@playwright/test';
import { TestHelpersV2, Assertions, Operations, Validators, ErrorMessages } from './test-helpers-v2';

/**
 * TestHelpersV2 使用示例
 * 展示优化后的测试工具类的各种使用方式
 */

// 示例1：使用命名空间的断言方法
test('Base64编码测试 - 使用命名空间', async ({ page }) => {
  await page.goto('/base64-tool');
  
  // 使用命名空间方式调用断言
  const outputLocator = page.locator('[data-testid="output"]');
  await Assertions.base64Encoding({
    outputLocator,
    input: 'Hello World',
    expectedOutput: 'SGVsbG8gV29ybGQ=',
    testName: 'Base64编码功能测试'
  });
});

// 示例2：使用静态方法的断言
test('Base64解码测试 - 使用静态方法', async ({ page }) => {
  await page.goto('/base64-tool');
  
  // 使用静态方法调用断言
  const outputLocator = page.locator('[data-testid="output"]');
  await TestHelpersV2.assertBase64Decoding({
    outputLocator,
    input: 'SGVsbG8gV29ybGQ=',
    expectedOutput: 'Hello World',
    testName: 'Base64解码功能测试',
    config: {
      timeout: 10000,
      retryCount: 2
    }
  });
});

// 示例3：使用实例方法
test('页面标题测试 - 使用实例方法', async ({ page }) => {
  await page.goto('/base64-tool');
  
  // 创建实例并使用实例方法
  const helpers = new TestHelpersV2(page);
  await helpers.assertPageTitle(/Base64/, 'Base64工具页面标题检查');
});

// 示例4：使用通用操作命名空间
test('编码解码流程测试 - 使用操作命名空间', async ({ page }) => {
  await page.goto('/base64-tool');
  
  // 使用操作命名空间执行编码
  await Operations.encoding({
    page,
    input: 'Test Message'
  });
  
  // 验证编码结果
  const outputLocator = page.locator('[data-testid="output"]');
  await Assertions.outputNotDefault({
    outputLocator,
    testName: '编码输出验证'
  });
  
  // 清空并切换到解码模式
  await Operations.clear({ page });
  await Operations.decoding({
    page,
    input: 'VGVzdCBNZXNzYWdl'
  });
});

// 示例5：使用验证器命名空间
test('空输入验证测试 - 使用验证器', async ({ page }) => {
  await page.goto('/base64-tool');
  
  // 使用验证器检查空输入处理
  await Validators.emptyInputHandling({
    page,
    actionButtonSelector: 'button:has-text("Encode")',
    testName: 'Base64编码空输入验证'
  });
});

// 示例6：使用自定义错误消息
test('自定义错误消息示例', async ({ page }) => {
  await page.goto('/json-tool');
  
  try {
    // 模拟一个可能失败的断言
    const outputLocator = page.locator('[data-testid="output"]');
    await expect(outputLocator).toContainText('Expected JSON');
  } catch (error) {
    // 使用错误消息工具创建友好的错误信息
    const friendlyError = ErrorMessages.create('assertion', {
      testName: 'JSON格式化测试',
      input: '{"key": "value"}',
      expected: 'Expected JSON',
      actual: 'Actual output',
      suggestion: '请检查JSON格式化逻辑是否正确'
    });
    
    console.log('友好的错误消息:', friendlyError);
    throw new Error(friendlyError);
  }
});

// 示例7：组合使用多个功能
test('完整工作流程测试 - 组合使用', async ({ page }) => {
  await page.goto('/password-generator');
  
  // 1. 验证页面元素可见性
  const generateButton = page.locator('button:has-text("Generate")');
  await Assertions.elementVisible({
    locator: generateButton,
    elementName: '密码生成按钮',
    testName: '密码生成器页面检查'
  });
  
  // 2. 执行密码生成操作
  await Operations.passwordGeneration({
    page,
    length: 16
  });
  
  // 3. 验证输出结果
  const outputLocator = page.locator('[data-testid="generated-password"]');
  await Assertions.outputNotDefault({
    outputLocator,
    defaultText: 'Generated password will appear here...',
    testName: '密码生成结果验证'
  });
  
  // 4. 验证输入框值
  const lengthInput = page.locator('input[type="number"]');
  await Assertions.inputValue({
    inputLocator: lengthInput,
    expectedValue: '16',
    testName: '密码长度输入验证'
  });
});

// 示例8：错误处理和重试机制
test('带重试的断言测试', async ({ page }) => {
  await page.goto('/uuid-generator');
  
  // 使用配置选项进行重试
  const outputLocator = page.locator('[data-testid="uuid-output"]');
  
  await TestHelpersV2.assertElementVisible({
    locator: outputLocator,
    elementName: 'UUID输出区域',
    testName: 'UUID生成器元素检查',
    config: {
      timeout: 10000,
      retryCount: 3
    }
  });
  
  // 执行UUID生成
  await Operations.uuidGeneration({ page });
  
  // 验证UUID格式（使用自定义验证逻辑）
  const uuidText = await outputLocator.textContent();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuidText || '')) {
    const errorMessage = ErrorMessages.create('validation', {
      testName: 'UUID格式验证',
      scenario: 'UUID生成后格式检查',
      expected: '标准UUID格式 (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)',
      actual: uuidText || '空输出',
      suggestion: '请检查UUID生成算法是否符合标准格式'
    });
    throw new Error(errorMessage);
  }
});

/**
 * 使用指南总结：
 * 
 * 1. 命名空间使用：
 *    - Assertions.*：用于各种断言操作
 *    - Operations.*：用于页面操作
 *    - Validators.*：用于验证逻辑
 *    - ErrorMessages.*：用于错误消息创建
 * 
 * 2. 静态方法使用：
 *    - TestHelpersV2.assert*：直接调用断言方法
 *    - TestHelpersV2.perform*：直接调用操作方法
 *    - TestHelpersV2.validate*：直接调用验证方法
 * 
 * 3. 实例方法使用：
 *    - 创建 TestHelpersV2 实例并传入 page 对象
 *    - 使用实例方法进行页面相关操作
 * 
 * 4. 配置选项：
 *    - timeout：设置操作超时时间
 *    - retryCount：设置重试次数
 *    - testName：自定义测试名称
 * 
 * 5. 错误处理：
 *    - 使用 ErrorMessages.create 创建友好的错误消息
 *    - 支持多种错误类型：assertion、ux、validation、operation
 */