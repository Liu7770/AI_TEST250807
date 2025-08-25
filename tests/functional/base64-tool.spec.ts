import { test, expect } from '@playwright/test';
import { TestHelpersV2, ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('Base64 Encoder/Decoder 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/base64');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/base64');
    
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('Base64 Encoder/Decoder').first()).toBeVisible();
    
    // 验证主要功能元素存在
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Encode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  test('页面元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await TestHelpersV2.assertPageTitle({
      page,
      expectedTitlePattern: /Dev Forge/,
      testName: '页面标题检查'
    });
    
    // 验证主要元素存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('h1:has-text("Base64 Encoder/Decoder")'),
      elementName: 'Base64 Encoder/Decoder 标题',
      testName: '页面标题元素检查'
    });
    
    // 验证输入框存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('textarea[placeholder="Input..."]'),
      elementName: '输入文本框',
      testName: '输入框元素检查'
    });
    
    // 验证编码按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('div.flex.space-x-2 button:has-text("Encode")'),
      elementName: '编码按钮',
      testName: '编码按钮元素检查'
    });
    
    // 验证解码按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('button:has-text("Decode")'),
      elementName: '解码按钮',
      testName: '解码按钮元素检查'
    });
    
    // 验证清空按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('button:has-text("Clear")'),
      elementName: '清空按钮',
      testName: '清空按钮元素检查'
    });
    
    // 验证输出区域存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('h2:has-text("Base64 Output")'),
      elementName: 'Base64输出区域标题',
      testName: '输出区域元素检查'
    });
  });

  test('编码功能测试 - 输入普通文本', async ({ page }) => {
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: 'Hello World'
    });
    
    // 验证输出结果
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: 'Hello World',
      expectedOutput: 'SGVsbG8gV29ybGQ=',
      testName: '普通文本Base64编码'
    });
  });

  test('编码功能测试 - 输入特殊字符', async ({ page }) => {
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: 'Hello@#$%^&*()World!'
    });
    
    // 验证输出结果
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: 'Hello@#$%^&*()World!',
      expectedOutput: 'SGVsbG9AIyQlXiYqKClXb3JsZCE=',
      testName: '特殊字符Base64编码'
    });
  });

  test('编码功能测试 - 输入中文字符', async ({ page }) => {
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: '你好世界'
    });
    
    // 验证输出结果应该是正确的Base64编码
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: '你好世界',
      expectedOutput: '5L2g5aW95LiW55WM',
      testName: '中文字符Base64编码'
    });
  });

  test('解码功能测试 - 输入有效Base64', async ({ page }) => {
    // 执行解码操作
    await TestHelpersV2.performDecoding({
      page,
      input: 'SGVsbG8gV29ybGQ='
    });
    
    // 验证输出结果
    await TestHelpersV2.assertBase64Decoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: 'SGVsbG8gV29ybGQ=',
      expectedOutput: 'Hello World',
      testName: '有效Base64解码'
    });
  });

  test('解码功能测试 - 输入无效Base64', async ({ page }) => {
    // 执行解码操作
    await TestHelpersV2.performDecoding({
      page,
      input: 'InvalidBase64!'
    });
    
    // 验证输出区域可见（可能是错误信息或空结果）
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('div.w-full.h-80.overflow-auto'),
      elementName: '输出区域',
      testName: '无效Base64解码输出检查'
    });
  });

  test('清空功能测试', async ({ page }) => {
    // 输入一些文本
    await page.locator('textarea[placeholder="Input..."]').fill('Test content');
    
    // 执行清空操作
    await TestHelpersV2.performClear({
      page
    });
    
    // 验证输入框已清空
    await TestHelpersV2.assertInputValue({
      inputLocator: page.locator('textarea[placeholder="Input..."]'),
      expectedValue: '',
      testName: '清空功能'
    });
  });

  test('空输入处理测试', async ({ page }) => {
    // 测试编码模式下的空输入处理
    await TestHelpersV2.assertEmptyInputHandling({
      page,
      inputSelector: 'textarea[placeholder="Input..."]',
      buttonSelector: 'div.flex.space-x-2 button:has-text("Encode")',
      inputPlaceholder: '编码',
      buttonText: '编码',
      testName: '编码模式空输入处理测试'
    });
    
    // 测试解码模式下的空输入处理
    await page.click('button:has-text("Decode")');
    
    await TestHelpersV2.assertEmptyInputHandling({
      page,
      inputSelector: 'textarea[placeholder="Base64 Input..."]',
      buttonSelector: 'button:has-text("Decode"):not(.px-6)',
      inputPlaceholder: '解码',
      buttonText: '解码',
      testName: '解码模式空输入处理测试'
    });
  });

  test('长文本编码测试', async ({ page }) => {
    // 执行长文本编码操作
    const longText = 'A'.repeat(1000);
    await TestHelpersV2.performEncoding({
      page,
      input: longText
    });
    
    // 验证有输出结果（不是默认占位符）
    await TestHelpersV2.assertOutputNotDefault({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      defaultText: 'Base64 Output...',
      testName: '长文本编码'
    });
  });

  test('界面响应性测试', async ({ page }) => {
    // 测试不同视口大小下的界面
    const viewports = [
      { width: 1920, height: 1080, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手机' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // 验证主要元素在不同视口下都可见
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('textarea[placeholder="Input..."]'),
        elementName: '输入文本框',
        testName: `${viewport.name}视口下的界面响应性`
      });
      
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('div.flex.space-x-2 button:has-text("Encode")'),
        elementName: '编码按钮',
        testName: `${viewport.name}视口下的界面响应性`
      });
      
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('button:has-text("Decode")'),
        elementName: '解码按钮',
        testName: `${viewport.name}视口下的界面响应性`
      });
      
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('div.flex.space-x-2 button:has-text("Clear")'),
        elementName: '清空按钮',
        testName: `${viewport.name}视口下的界面响应性`
      });
    }
  });

  test('编码功能测试 - 输入空格字符', async ({ page }) => {
    const inputText = ' ';
    
    // 清空输入框并输入空格
     await page.locator('textarea[placeholder="Input..."]').fill('');
     await page.locator('textarea[placeholder="Input..."]').fill(inputText);
    
    // 检查编码执行按钮状态（右上角的执行按钮，不是模式切换按钮）- 空格应该被视为有效输入
    const encodeButton = page.locator('div.flex.space-x-2 button:has-text("Encode")');
    const isDisabled = await encodeButton.isDisabled();
    
    if (isDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '空格字符编码按钮状态测试',
        input: '输入单个空格字符',
        expected: '编码按钮应该为可用状态（空格是有效字符）',
        actual: '编码按钮被禁用',
        suggestion: '网站应该将空格视为有效输入，允许用户进行编码操作。这是网站设计缺陷。'
      });
      throw new Error(errorMessage);
    }
    
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: inputText
    });
    
    // 验证输出结果 - 空格的Base64编码应该是 "IA=="
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: inputText,
      expectedOutput: 'IA==',
      testName: '空格字符Base64编码'
    });
  });

  test('编码功能测试 - 输入多个空格', async ({ page }) => {
    const inputText = '   ';
    
    // 清空输入框并输入多个空格
     await page.locator('textarea[placeholder="Input..."]').fill('');
     await page.locator('textarea[placeholder="Input..."]').fill(inputText);
    
    // 检查编码执行按钮状态（右上角的执行按钮，不是模式切换按钮）- 多个空格应该被视为有效输入
    const encodeButton = page.locator('div.flex.space-x-2 button:has-text("Encode")');
    const isDisabled = await encodeButton.isDisabled();
    
    if (isDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '多个空格字符编码按钮状态测试',
        input: '输入多个空格字符',
        expected: '编码按钮应该为可用状态（空格是有效字符）',
        actual: '编码按钮被禁用',
        suggestion: '网站应该将空格视为有效输入，允许用户进行编码操作。这是网站设计缺陷。'
      });
      throw new Error(errorMessage);
    }
    
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: inputText
    });
    
    // 验证输出结果 - 三个空格的Base64编码应该是 "ICAg"
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: inputText,
      expectedOutput: 'ICAg',
      testName: '多个空格字符Base64编码'
    });
  });

  test('编码功能测试 - 输入长文本', async ({ page }) => {
    const longText = 'This is a very long text that contains multiple sentences and should be properly encoded to Base64. It includes various characters, spaces, and punctuation marks to test the encoding functionality thoroughly.';
    const expectedBase64 = 'VGhpcyBpcyBhIHZlcnkgbG9uZyB0ZXh0IHRoYXQgY29udGFpbnMgbXVsdGlwbGUgc2VudGVuY2VzIGFuZCBzaG91bGQgYmUgcHJvcGVybHkgZW5jb2RlZCB0byBCYXNlNjQuIEl0IGluY2x1ZGVzIHZhcmlvdXMgY2hhcmFjdGVycywgc3BhY2VzLCBhbmQgcHVuY3R1YXRpb24gbWFya3MgdG8gdGVzdCB0aGUgZW5jb2RpbmcgZnVuY3Rpb25hbGl0eSB0aG9yb3VnaGx5Lg==';
    
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: longText
    });
    
    // 验证输出结果
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: longText,
      expectedOutput: expectedBase64,
      testName: '长文本Base64编码'
    });
  });

  test('编码功能测试 - 输入换行符', async ({ page }) => {
    const inputText = 'Line 1\nLine 2\nLine 3';
    
    // 清空输入框并输入文本
     await page.locator('textarea[placeholder="Input..."]').fill('');
     await page.locator('textarea[placeholder="Input..."]').fill(inputText);
    
    // 检查编码执行按钮状态（右上角的执行按钮，不是模式切换按钮）- 换行符应该被视为有效输入
    const encodeButton = page.locator('div.flex.space-x-2 button:has-text("Encode")');
    const isDisabled = await encodeButton.isDisabled();
    
    if (isDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '换行符编码按钮状态测试',
        input: '输入包含换行符的文本',
        expected: '编码按钮应该为可用状态（换行符是有效字符）',
        actual: '编码按钮被禁用',
        suggestion: '网站应该将换行符视为有效输入，允许用户进行编码操作。这是网站设计缺陷。'
      });
      throw new Error(errorMessage);
    }
    
    // 执行编码操作
    await TestHelpersV2.performEncoding({
      page,
      input: inputText
    });
    
    // 验证输出结果 - 网站将\n转换为实际换行符
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: inputText,
      expectedOutput: 'TGluZSAxCkxpbmUgMgpMaW5lIDM=',
      testName: '包含换行符的文本Base64编码'
    });
  });

  test('编码功能测试 - 输入纯换行符', async ({ page }) => {
    const inputText = '\n';
    
    // 使用JavaScript直接设置真正的换行符
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea[placeholder="Input..."]');
      if (textarea) {
        textarea.value = '\n';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // 检查编码执行按钮状态（右上角的执行按钮，不是模式切换按钮）
    const encodeButton = page.locator('div.flex.space-x-2 button:has-text("Encode")');
    const isDisabled = await encodeButton.isDisabled();
    
    // 换行符是有效字符，编码按钮应该可用
    if (isDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '纯换行符编码按钮状态测试',
        input: '输入单个换行符',
        expected: '编码按钮应该为可用状态（换行符是有效字符）',
        actual: '编码按钮被禁用',
        suggestion: '网站应该将换行符视为有效输入，允许用户进行编码操作。这是网站设计缺陷。'
      });
      throw new Error(errorMessage);
    }
    
    // 执行编码操作
    await encodeButton.click();
    await page.waitForTimeout(500);
    
    // 验证输出结果 - 单个换行符的Base64编码应该是 Cg==
    const outputText = await page.locator('div.w-full.h-80.overflow-auto').textContent();
    
    if (outputText?.trim() === 'Base64 Output...' || !outputText?.trim()) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '纯换行符编码功能测试',
        input: '输入单个换行符并点击编码',
        expected: '应该输出换行符的Base64编码结果（Cg==）',
        actual: '输出区域显示占位符文本或为空',
        suggestion: '网站应该能够正确编码换行符等空白字符'
      });
      throw new Error(errorMessage);
    }
    
    expect(outputText?.trim()).toBe('Cg==');
  });

  test('编码功能测试 - 输入Unicode表情符号', async ({ page }) => {
    // 执行编码操作 - 输入表情符号
    await TestHelpersV2.performEncoding({
      page,
      input: '😀😃😄😁'
    });
    
    // 验证输出结果
    await TestHelpersV2.assertBase64Encoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: '😀😃😄😁',
      expectedOutput: '8J+YgPCfmIPwn5iE8J+YgQ==',
      testName: 'Unicode表情符号Base64编码'
    });
  });

  test('解码功能测试 - 输入无效Base64字符', async ({ page }) => {
    // 执行解码操作 - 输入包含无效字符的Base64
    await TestHelpersV2.performDecoding({
      page,
      input: 'SGVsbG8gV29ybGQ@#$%'
    });
    
    // 验证输出 - 应该显示错误信息或保持默认状态
    const outputText = await page.locator('div.w-full.h-80.overflow-auto').textContent();
    
    // 检查是否有错误处理
    if (outputText === 'Base64 Output...' || outputText?.includes('Error') || outputText?.includes('Invalid')) {
      console.log('✅ 无效Base64字符正确处理 - 显示错误或保持默认状态');
    } else {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '无效Base64解码测试',
        input: '输入包含无效字符的Base64字符串',
        expected: '显示错误信息或保持默认状态',
        actual: `显示了: "${outputText}"`,
        suggestion: '网站应该对无效的Base64输入进行错误处理'
      });
      throw new Error(errorMessage);
    }
  });

  test('解码功能测试 - 输入不完整的Base64', async ({ page }) => {
    // 执行解码操作 - 输入不完整的Base64（缺少填充）
    await TestHelpersV2.performDecoding({
      page,
      input: 'SGVsbG8gV29ybGQ'
    });
    
    // 验证输出 - 应该能正确解码或显示错误
    const outputText = await page.locator('div.w-full.h-80.overflow-auto').textContent();
    
    // Base64解码器通常能处理缺少填充的情况
    if (outputText === 'Hello World' || outputText === 'Base64 Output...' || outputText?.includes('Error')) {
      console.log('✅ 不完整Base64正确处理');
    } else {
      console.log(`⚠️ 不完整Base64处理结果: "${outputText}"`);
    }
  });

  test('功能测试 - 连续编码解码操作', async ({ page }) => {
    const originalText = 'Test Round Trip';
    
    // 第一步：编码
    await TestHelpersV2.performEncoding({
      page,
      input: originalText
    });
    
    // 获取编码结果
    const encodedText = await page.locator('div.w-full.h-80.overflow-auto').textContent();
    
    // 验证编码结果不是默认值
    await TestHelpersV2.assertOutputNotDefault({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      testName: '连续操作 - 编码步骤'
    });
    
    // 第二步：使用编码结果进行解码
    await TestHelpersV2.performDecoding({
      page,
      input: encodedText || ''
    });
    
    // 验证解码结果应该等于原始文本
    await TestHelpersV2.assertBase64Decoding({
      outputLocator: page.locator('div.w-full.h-80.overflow-auto'),
      input: encodedText || '',
      expectedOutput: originalText,
      testName: '连续操作 - 解码步骤'
    });
  });

  test('边界测试 - 单字符编码解码', async ({ page }) => {
    
    const testCases = [
      { char: 'A', expected: 'QQ==' },
      { char: '1', expected: 'MQ==' },
      { char: '!', expected: 'IQ==' },
      { char: '中', expected: '5Lit' }
    ];
    
    for (const testCase of testCases) {
      // 刷新页面确保干净的状态
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      // 编码测试
      await TestHelpersV2.performEncoding({
        page,
        input: testCase.char
      });
      
      // 使用与其他测试一致的输出定位器
      const outputLocator = page.locator('div.w-full.h-80.overflow-auto');
      await TestHelpersV2.assertBase64Encoding({
        outputLocator,
        input: testCase.char,
        expectedOutput: testCase.expected,
        testName: `单字符编码测试 - ${testCase.char}`
      });
      
      // 解码测试 - 重新加载页面确保状态重置
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      
      await TestHelpersV2.performDecoding({
        page,
        input: testCase.expected
      });
      
      await TestHelpersV2.assertBase64Decoding({
        outputLocator,
        input: testCase.expected,
        expectedOutput: testCase.char,
        testName: `单字符解码测试 - ${testCase.char}`
      });
    }
  });

});