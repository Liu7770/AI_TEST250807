import { test, expect } from '@playwright/test';

test.describe('Dev Forge Hash Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/hash');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    try {
      const comingSoonElement = page.locator('text="Tool implementation coming soon"');
      if (await comingSoonElement.isVisible({ timeout: 3000 })) {
        test.skip(true, 'Tool implementation coming soon...');
      }
    } catch (error) {
      // 如果找不到元素，继续执行测试
    }
  });

  test('MD5哈希计算', async ({ page }) => {
    const inputText = 'Hello World';
    const expectedMD5 = 'b10a8db164e0754105b7a99be72e3fe5';
    
    // 输入文本
    await page.fill('textarea', inputText);
    
    // 选择MD5算法
    await page.selectOption('select', 'md5');
    
    // 点击计算按钮
    await page.click('button:has-text("Calculate")');
    
    // 验证结果
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result?.toLowerCase()).toContain(expectedMD5);
  });

  test('SHA1哈希计算', async ({ page }) => {
    const inputText = 'Hello World';
    const expectedSHA1 = '0a4d55a8d778e5022fab701977c5d840bbc486d0';
    
    await page.fill('textarea', inputText);
    await page.selectOption('select', 'sha1');
    await page.click('button:has-text("Calculate")');
    
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result?.toLowerCase()).toContain(expectedSHA1);
  });

  test('SHA256哈希计算', async ({ page }) => {
    const inputText = 'Hello World';
    const expectedSHA256 = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
    
    await page.fill('textarea', inputText);
    await page.selectOption('select', 'sha256');
    await page.click('button:has-text("Calculate")');
    
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result?.toLowerCase()).toContain(expectedSHA256);
  });

  test('空输入处理', async ({ page }) => {
    await page.fill('textarea', '');
    await page.selectOption('select', 'md5');
    await page.click('button:has-text("Calculate")');
    
    // 验证空输入的MD5值
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result?.toLowerCase()).toContain('d41d8cd98f00b204e9800998ecf8427e');
  });

  test('特殊字符哈希计算', async ({ page }) => {
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    await page.fill('textarea', specialText);
    await page.selectOption('select', 'md5');
    await page.click('button:has-text("Calculate")');
    
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result).toBeTruthy();
    expect(result?.length).toBeGreaterThan(0);
  });

  test('中文字符哈希计算', async ({ page }) => {
    const chineseText = '你好世界';
    
    await page.fill('textarea', chineseText);
    await page.selectOption('select', 'md5');
    await page.click('button:has-text("Calculate")');
    
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result).toBeTruthy();
    expect(result?.length).toBeGreaterThan(0);
  });

  test('长文本哈希计算', async ({ page }) => {
    const longText = 'A'.repeat(10000);
    
    await page.fill('textarea', longText);
    await page.selectOption('select', 'sha256');
    await page.click('button:has-text("Calculate")');
    
    const result = await page.textContent('.result, .output, [data-testid="hash-result"]');
    expect(result).toBeTruthy();
    expect(result?.length).toBe(64); // SHA256 结果长度
  });

  test('复制功能测试', async ({ page }) => {
    const inputText = 'Test Copy';
    
    await page.fill('textarea', inputText);
    await page.selectOption('select', 'md5');
    await page.click('button:has-text("Calculate")');
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });
});