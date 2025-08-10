import { test, expect } from '@playwright/test';

test.describe('Dev Forge 集成测试', () => {

  const baseUrl = 'https://www.001236.xyz';

  test('完整工作流程测试 - JSON工具', async ({ page }) => {
    // 访问首页
    await page.goto(`${baseUrl}/en`);
    
    // 验证页面加载
    await expect(page.locator('h1').first()).toBeVisible();
    
    // 导航到JSON工具
    await page.locator('nav').locator('text=JSON Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    // 测试有效JSON格式化
    const validJson = '{"name":"test","data":[1,2,3],"nested":{"key":"value"}}';
    await page.locator('textarea').fill(validJson);
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 验证格式化结果
    await expect(page.locator('pre')).toBeVisible();
    const formattedResult = await page.locator('pre').textContent();
    expect(formattedResult).toContain('name');
    expect(formattedResult).toContain('test');
    
    // 测试无效JSON处理
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('invalid json {');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 验证错误信息显示
    await expect(page.locator('text=Invalid JSON: Unexpected')).toBeVisible();
    
    // 清空输入测试
    await page.locator('textarea').clear();
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 验证空输入处理
    const emptyResult = await page.locator('pre').textContent();
    expect(emptyResult).toBe('');
  });

  test('完整工作流程测试 - Base64工具', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 导航到Base64工具
    await page.locator('nav').locator('text=Base64 Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    // 测试编码功能
    await page.locator('div.p-1 button').filter({ hasText: 'Encode' }).click();
    
    const testText = 'Hello World! 测试中文 🎉';
    await page.locator('textarea').fill(testText);
    await page.locator('div:has(textarea) button').filter({ hasText: 'Encode' }).click();
    
    // 等待编码完成
    await page.waitForTimeout(1000);
    
    // 获取编码结果
    const encodedValue = await page.locator('textarea').inputValue();
    expect(encodedValue).not.toBe(testText); // 应该已经被编码
    expect(encodedValue.length).toBeGreaterThan(0);
    
    // 测试解码功能
    await page.locator('div.p-1 button').filter({ hasText: 'Decode' }).click();
    await page.locator('div:has(textarea) button').filter({ hasText: 'Decode' }).click();
    
    // 等待解码完成
    await page.waitForTimeout(1000);
    
    // 验证解码结果
    const decodedValue = await page.locator('textarea').inputValue();
    expect(decodedValue).toBe(testText);
  });

  test('跨工具导航测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 在JSON工具中输入数据
    await page.locator('nav').locator('text=JSON Tools').click();
    await page.locator('textarea').fill('{"test": "navigation"}');
    
    // 切换到Base64工具
    await page.locator('nav').locator('text=Base64 Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    // 输入Base64数据
    await page.locator('textarea').fill('SGVsbG8gV29ybGQ=');
    
    // 返回JSON工具
    await page.locator('nav').locator('text=JSON Tools').click();
    
    // 验证页面状态
    await expect(page.locator('textarea')).toBeVisible();
    
    // 再次切换到Base64工具验证状态
    await page.locator('nav').locator('text=Base64 Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('响应式布局测试', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(`${baseUrl}/en`);
    
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('h1').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    await expect(page.locator('h1.text-xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
    
    // 测试工具在移动端的可用性
    await page.locator('nav').locator('text=JSON Tools').tap();
    await expect(page.locator('textarea')).toBeVisible();
    
    await page.locator('textarea').fill('{"mobile": "test"}');
    await page.locator('button').filter({ hasText: 'Format' }).tap();
    
    await expect(page.locator('pre')).toBeVisible();
  });

  test('错误恢复测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 输入多种错误格式
    const errorCases = [
      'invalid json',
      '{"unclosed": "string',
      '{"trailing": "comma",}',
      '{"duplicate": 1, "duplicate": 2}',
      ''
    ];
    
    for (const errorCase of errorCases) {
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(errorCase);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      await page.waitForTimeout(500);
      
      // 验证页面仍然可用
      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('button').filter({ hasText: 'Format' })).toBeVisible();
      
      console.log(`Error case handled: "${errorCase}"`);
    }
    
    // 最后输入有效JSON验证恢复
    await page.locator('textarea').clear();
    await page.locator('textarea').fill('{"recovery": "success"}');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    await expect(page.locator('pre')).toBeVisible();
    const result = await page.locator('pre').textContent();
    expect(result).toContain('recovery');
  });

  test('性能基准测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 测试大JSON处理性能
    const largeJson = {
      data: new Array(1000).fill(null).map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `This is item number ${i} with some additional text to make it larger`,
        metadata: {
          created: new Date().toISOString(),
          tags: [`tag${i}`, `category${i % 10}`, 'test'],
          nested: {
            level1: {
              level2: {
                value: i * 2
              }
            }
          }
        }
      }))
    };
    
    const jsonString = JSON.stringify(largeJson);
    console.log(`Testing with JSON size: ${jsonString.length} characters`);
    
    const startTime = Date.now();
    
    await page.locator('textarea').fill(jsonString);
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 等待处理完成
    await expect(page.locator('pre')).toBeVisible({ timeout: 10000 });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log(`Large JSON processing time: ${processingTime}ms`);
    
    // 验证处理时间在合理范围内
    expect(processingTime).toBeLessThan(5000); // 5秒内完成
    
    // 验证结果正确性
    const result = await page.locator('pre').textContent();
    expect(result).toContain('Item 0');
    expect(result).toContain('Item 999');
  });

  test('并发操作测试', async ({ browser }) => {
    // 创建多个页面模拟并发用户
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
    
    // 并发执行不同操作
    const operations = pages.map(async (page, index) => {
      await page.goto(`${baseUrl}/en`);
      
      if (index === 0) {
        // 页面1: JSON操作
        await page.locator('nav').locator('text=JSON Tools').click();
        await page.locator('textarea').fill(`{"user": ${index}, "operation": "json"}`);
        await page.locator('button').filter({ hasText: 'Format' }).click();
        await expect(page.locator('pre')).toBeVisible();
      } else if (index === 1) {
        // 页面2: Base64编码
        await page.locator('nav').locator('text=Base64 Tools').click();
        await page.locator('div.p-1 button').filter({ hasText: 'Encode' }).click();
        await page.locator('textarea').fill(`User ${index} test data`);
        await page.locator('div:has(textarea) button').filter({ hasText: 'Encode' }).click();
        await page.waitForTimeout(1000);
      } else {
        // 页面3: Base64解码
        await page.locator('nav').locator('text=Base64 Tools').click();
        await page.locator('div.p-1 button').filter({ hasText: 'Decode' }).click();
        await page.locator('textarea').fill('VXNlciAyIHRlc3QgZGF0YQ=='); // "User 2 test data"
        await page.locator('div:has(textarea) button').filter({ hasText: 'Decode' }).click();
        await page.waitForTimeout(1000);
      }
      
      return `Page ${index} completed`;
    });
    
    // 等待所有操作完成
    const results = await Promise.all(operations);
    console.log('Concurrent operations results:', results);
    
    // 验证所有操作都成功
    expect(results).toHaveLength(3);
    results.forEach((result, index) => {
      expect(result).toBe(`Page ${index} completed`);
    });
    
    // 清理
    await Promise.all(pages.map(page => page.close()));
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('用户体验流程测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 模拟真实用户操作流程
    
    // 1. 用户首次访问，查看页面
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
    await expect(page.locator('nav').locator('text=Base64 Tools')).toBeVisible();
    
    // 2. 用户点击JSON工具
    await page.locator('nav').locator('text=JSON Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    // 3. 用户输入一些JSON数据
    await page.locator('textarea').fill('{"message": "Hello World"}');
    
    // 4. 用户点击格式化
    await page.locator('button').filter({ hasText: 'Format' }).click();
    await expect(page.locator('pre')).toBeVisible();
    
    // 5. 用户查看结果，然后尝试Base64工具
    await page.locator('nav').locator('text=Base64 Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    // 6. 用户输入文本进行编码
    await page.locator('div.p-1 button').filter({ hasText: 'Encode' }).click();
    await page.locator('textarea').fill('Hello World');
    await page.locator('div:has(textarea) button').filter({ hasText: 'Encode' }).click();
    
    await page.waitForTimeout(1000);
    
    // 7. 用户看到编码结果，尝试解码
    const encodedValue = await page.locator('textarea').inputValue();
    expect(encodedValue).not.toBe('Hello World');
    
    await page.locator('div.p-1 button').filter({ hasText: 'Decode' }).click();
    await page.locator('div:has(textarea) button').filter({ hasText: 'Decode' }).click();
    
    await page.waitForTimeout(1000);
    
    // 8. 验证解码结果
    const decodedValue = await page.locator('textarea').inputValue();
    expect(decodedValue).toBe('Hello World');
    
    // 9. 用户返回JSON工具继续工作
    await page.locator('nav').locator('text=JSON Tools').click();
    await expect(page.locator('textarea')).toBeVisible();
    
    console.log('Complete user experience flow test passed');
  });

});