import { test, expect } from '@playwright/test';
import { TestHelpersV2, ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('JSON Tools 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/json');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('JSON Tools').first()).toBeVisible();
    
    // 验证主要功能元素存在
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Format & Validate' })).toBeVisible();
  });

  test('JSON 格式化功能测试', async ({ page }) => {
    // 测试有效的 JSON
    const validJson = '{"name":"test","value":123}';
    await TestHelpersV2.performJsonFormat({
      page,
      input: validJson
    });
    
    // 验证格式化后的结果显示在pre元素中
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('pre'),
      elementName: '格式化结果区域',
      testName: 'JSON格式化结果检查'
    });
    
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    if (!formattedText?.includes('"name"') || !formattedText?.includes('"test"')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
         testName: 'JSON格式化功能',
         input: validJson,
         expected: '包含"name"和"test"字段的格式化JSON',
         actual: formattedText || '空输出',
         suggestion: '检查JSON格式化逻辑是否正确处理有效JSON'
       });
      throw new Error(errorMessage);
    }
  });

  test('无效 JSON 处理测试', async ({ page }) => {
    // 测试无效的 JSON
    const invalidJson = '{"name":"test","value":}';
    await TestHelpersV2.performJsonFormat({
      page,
      input: invalidJson
    });
    
    // 验证错误处理（可能显示错误信息或保持原样）
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const resultText = await inputTextarea.inputValue();
    
    if (resultText.length === 0) {
      const errorMessage = ErrorMessageFactory.create('validation', {
         testName: '无效JSON处理',
         scenario: '输入无效JSON格式',
         expected: '输入框应保持有内容或显示错误信息',
         actual: '输入框为空',
         suggestion: '检查无效JSON的错误处理逻辑，应该提供用户友好的错误提示'
       });
      throw new Error(errorMessage);
    }
  });

  test('空输入处理测试', async ({ page }) => {
    // 清空输入并格式化
    await TestHelpersV2.performJsonFormat({
      page,
      input: ''
    });
    
    // 验证空输入的处理
    await TestHelpersV2.assertInputValue({
      inputLocator: page.locator('textarea[placeholder="Input..."]'),
      expectedValue: '',
      testName: '空输入处理验证'
    });
  });

  test('复杂 JSON 格式化测试', async ({ page }) => {
    // 测试复杂的 JSON 结构
    const complexJson = '{"users":[{"id":1,"name":"John","details":{"age":30,"city":"New York"}},{"id":2,"name":"Jane","details":{"age":25,"city":"Los Angeles"}}],"total":2}';
    await TestHelpersV2.performJsonFormat({
      page,
      input: complexJson
    });
    
    // 验证格式化后的结果包含所有字段
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('pre'),
      elementName: '格式化结果区域',
      testName: '复杂JSON格式化结果检查'
    });
    
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    const expectedFields = ['"users"', '"John"', '"Jane"', '"total"'];
    const missingFields = expectedFields.filter(field => !formattedText?.includes(field));
    
    if (missingFields.length > 0) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
         testName: '复杂JSON格式化',
         input: complexJson,
         expected: `包含所有字段: ${expectedFields.join(', ')}`,
         actual: `缺失字段: ${missingFields.join(', ')}`,
         suggestion: '检查复杂JSON结构的格式化逻辑，确保所有嵌套字段都能正确处理'
       });
      throw new Error(errorMessage);
    }
  });

  test('JSON 数组格式化测试', async ({ page }) => {
    // 测试 JSON 数组
    const jsonArray = '[{"id":1,"name":"Item1"},{"id":2,"name":"Item2"},{"id":3,"name":"Item3"}]';
    await TestHelpersV2.performJsonFormat({
      page,
      input: jsonArray
    });
    
    // 验证格式化后的结果
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('pre'),
      elementName: '格式化结果区域',
      testName: 'JSON数组格式化结果检查'
    });
    
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    const expectedItems = ['"Item1"', '"Item2"', '"Item3"'];
    const missingItems = expectedItems.filter(item => !formattedText?.includes(item));
    
    if (missingItems.length > 0) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
         testName: 'JSON数组格式化',
         input: jsonArray,
         expected: `包含所有项目: ${expectedItems.join(', ')}`,
         actual: `缺失项目: ${missingItems.join(', ')}`,
         suggestion: '检查JSON数组的格式化逻辑，确保数组元素能正确显示'
       });
      throw new Error(errorMessage);
    }
  });

  test('界面响应性测试', async ({ page }) => {
    // 测试不同视口大小下的界面
    const viewports = [
      { width: 1920, height: 1080 }, // 桌面
      { width: 768, height: 1024 },  // 平板
      { width: 375, height: 667 }    // 手机
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // 验证主要元素在不同视口下都可见
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('textarea[placeholder="Input..."]'),
        elementName: `输入文本框 (${viewport.width}x${viewport.height})`,
        testName: `响应性测试-输入框-${viewport.width}x${viewport.height}`
      });
      
      await TestHelpersV2.assertElementVisible({
        locator: page.locator('button:has-text("Format & Validate")'),
        elementName: `格式化按钮 (${viewport.width}x${viewport.height})`,
        testName: `响应性测试-按钮-${viewport.width}x${viewport.height}`
      });
    }
  });
});
