import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../../utils/test-helpers';

test.describe('JSON Tools 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/json');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 验证页面标题
    await helpers.assertPageTitle(/Dev Forge/);
    
    // 验证主要元素存在
    await helpers.assertElementVisible('h1:has-text("JSON Tools - Format and Validate JSON")', '主标题');
    
    // 验证输入框存在
    await helpers.assertElementVisible('textarea[placeholder="Input..."]', '输入文本框');
    
    // 验证格式化按钮存在
    await helpers.assertElementVisible('button:has-text("Format & Validate")', '格式化按钮');
  });

  test('JSON 格式化功能测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 测试有效的 JSON
    const validJson = '{"name":"test","value":123}';
    await helpers.performJsonFormat(validJson);
    
    // 验证格式化后的结果显示在pre元素中
    await helpers.assertElementVisible('pre', '格式化结果区域');
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    if (!formattedText?.includes('"name"') || !formattedText?.includes('"test"')) {
      throw new Error(`JSON格式化测试失败\n输入: ${validJson}\n期望包含: "name" 和 "test"\n实际输出: ${formattedText}\n建议: 检查JSON格式化逻辑是否正确处理有效JSON`);
    }
  });

  test('无效 JSON 处理测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 测试无效的 JSON
    const invalidJson = '{"name":"test","value":}';
    await helpers.performJsonFormat(invalidJson);
    
    // 验证错误处理（可能显示错误信息或保持原样）
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const resultText = await inputTextarea.inputValue();
    
    if (resultText.length === 0) {
      throw new Error(`无效JSON处理测试失败\n输入: ${invalidJson}\n期望: 输入框应保持有内容或显示错误信息\n实际: 输入框为空\n建议: 检查无效JSON的错误处理逻辑`);
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 清空输入并格式化
    await helpers.performJsonFormat('');
    
    // 验证空输入的处理
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const resultText = await inputTextarea.inputValue();
    
    if (resultText !== '') {
      throw new Error(`空输入处理测试失败\n输入: 空字符串\n期望: 输入框应为空\n实际: "${resultText}"\n建议: 检查空输入的处理逻辑`);
    }
  });

  test('复杂 JSON 格式化测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 测试复杂的 JSON 结构
    const complexJson = '{"users":[{"id":1,"name":"John","details":{"age":30,"city":"New York"}},{"id":2,"name":"Jane","details":{"age":25,"city":"Los Angeles"}}],"total":2}';
    await helpers.performJsonFormat(complexJson);
    
    // 验证格式化后的结果包含所有字段
    await helpers.assertElementVisible('pre', '格式化结果区域');
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    const expectedFields = ['"users"', '"John"', '"Jane"', '"total"'];
    const missingFields = expectedFields.filter(field => !formattedText?.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`复杂JSON格式化测试失败\n输入: ${complexJson}\n缺失字段: ${missingFields.join(', ')}\n实际输出: ${formattedText}\n建议: 检查复杂JSON结构的格式化逻辑`);
    }
  });

  test('JSON 数组格式化测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 测试 JSON 数组
    const jsonArray = '[{"id":1,"name":"Item1"},{"id":2,"name":"Item2"},{"id":3,"name":"Item3"}]';
    await helpers.performJsonFormat(jsonArray);
    
    // 验证格式化后的结果
    await helpers.assertElementVisible('pre', '格式化结果区域');
    const formattedResult = page.locator('pre');
    const formattedText = await formattedResult.textContent();
    
    const expectedItems = ['"Item1"', '"Item2"', '"Item3"'];
    const missingItems = expectedItems.filter(item => !formattedText?.includes(item));
    
    if (missingItems.length > 0) {
      throw new Error(`JSON数组格式化测试失败\n输入: ${jsonArray}\n缺失项目: ${missingItems.join(', ')}\n实际输出: ${formattedText}\n建议: 检查JSON数组的格式化逻辑`);
    }
  });

  test('界面响应性测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
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
      await helpers.assertElementVisible('textarea[placeholder="Input..."]', `输入文本框 (${viewport.width}x${viewport.height})`);
      await helpers.assertElementVisible('button:has-text("Format & Validate")', `格式化按钮 (${viewport.width}x${viewport.height})`);
    }
  });
});
