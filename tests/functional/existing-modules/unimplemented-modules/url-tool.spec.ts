import { test, expect } from '@playwright/test';

test.describe('Dev Forge URL Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=URL Tool');
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

  test('URL编码功能', async ({ page }) => {
    const originalUrl = 'https://example.com/search?q=hello world&type=test';
    const expectedEncoded = 'https%3A//example.com/search%3Fq%3Dhello%20world%26type%3Dtest';
    
    // 输入URL
    await page.fill('textarea, input[type="text"]', originalUrl);
    
    // 选择编码模式或点击编码按钮
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
    } else {
      // 尝试选择编码模式
      const modeSelect = page.locator('select, .mode-select');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encode');
      }
      await page.click('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    }
    
    // 验证编码结果
    const result = await page.textContent('.result, .output, [data-testid="url-result"]');
    expect(result?.trim()).toBe(expectedEncoded);
  });

  test('URL解码功能', async ({ page }) => {
    const encodedUrl = 'https%3A//example.com/search%3Fq%3Dhello%20world%26type%3Dtest';
    const expectedDecoded = 'https://example.com/search?q=hello world&type=test';
    
    await page.fill('textarea, input[type="text"]', encodedUrl);
    
    // 选择解码模式或点击解码按钮
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    } else {
      const modeSelect = page.locator('select, .mode-select');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decode');
      }
      await page.click('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    }
    
    const result = await page.textContent('.result, .output, [data-testid="url-result"]');
    expect(result?.trim()).toBe(expectedDecoded);
  });

  test('特殊字符编码', async ({ page }) => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    await page.fill('textarea, input[type="text"]', specialChars);
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
    } else {
      await page.click('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    }
    
    const result = await page.textContent('.result, .output, [data-testid="url-result"]');
    expect(result).toBeTruthy();
    expect(result).toContain('%');
  });

  test('中文字符编码', async ({ page }) => {
    const chineseText = '你好世界';
    
    await page.fill('textarea, input[type="text"]', chineseText);
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
    } else {
      await page.click('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    }
    
    const result = await page.textContent('.result, .output, [data-testid="url-result"]');
    expect(result).toBeTruthy();
    expect(result).toContain('%');
  });

  test('空输入处理', async ({ page }) => {
    await page.fill('textarea, input[type="text"]', '');
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
    } else {
      await page.click('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    }
    
    const result = await page.textContent('.result, .output, [data-testid="url-result"]');
    expect(result?.trim()).toBe('');
  });

  test('URL解析功能', async ({ page }) => {
    const testUrl = 'https://user:pass@example.com:8080/path/to/resource?param1=value1&param2=value2#section';
    
    await page.fill('textarea, input[type="text"]', testUrl);
    
    // 查找解析按钮
    const parseButton = page.locator('button:has-text("Parse"), .parse-btn, [data-testid="parse-button"]');
    if (await parseButton.count() > 0) {
      await parseButton.click();
      
      // 验证解析结果包含各个组件
      const result = await page.textContent('.result, .output, [data-testid="url-result"]');
      expect(result).toContain('https');
      expect(result).toContain('example.com');
      expect(result).toContain('8080');
      expect(result).toContain('/path/to/resource');
      expect(result).toContain('param1=value1');
    }
  });

  test('URL构建功能', async ({ page }) => {
    // 查找URL构建器组件
    const protocolInput = page.locator('input[placeholder*="protocol"], .protocol-input, [data-testid="protocol-input"]');
    const hostInput = page.locator('input[placeholder*="host"], .host-input, [data-testid="host-input"]');
    const pathInput = page.locator('input[placeholder*="path"], .path-input, [data-testid="path-input"]');
    
    if (await protocolInput.count() > 0) {
      await protocolInput.fill('https');
      await hostInput.fill('example.com');
      await pathInput.fill('/api/v1/users');
      
      const buildButton = page.locator('button:has-text("Build"), .build-btn, [data-testid="build-button"]');
      if (await buildButton.count() > 0) {
        await buildButton.click();
        
        const result = await page.textContent('.result, .output, [data-testid="url-result"]');
        expect(result).toContain('https://example.com/api/v1/users');
      }
    }
  });

  test('URL验证功能', async ({ page }) => {
    const validUrl = 'https://www.example.com';
    const invalidUrl = 'not-a-valid-url';
    
    // 测试有效URL
    await page.fill('textarea, input[type="text"]', validUrl);
    
    const validateButton = page.locator('button:has-text("Validate"), .validate-btn, [data-testid="validate-button"]');
    if (await validateButton.count() > 0) {
      await validateButton.click();
      
      const validResult = await page.textContent('.result, .output, [data-testid="url-result"]');
      expect(validResult).toMatch(/valid|✓|success/i);
      
      // 测试无效URL
      await page.fill('textarea, input[type="text"]', invalidUrl);
      await validateButton.click();
      
      const invalidResult = await page.textContent('.result, .output, [data-testid="url-result"]');
      expect(invalidResult).toMatch(/invalid|✗|error/i);
    }
  });

  test('批量URL处理', async ({ page }) => {
    const urls = [
      'https://example1.com/path?param=value',
      'https://example2.com/another/path',
      'https://example3.com'
    ];
    
    await page.fill('textarea, input[type="text"]', urls.join('\n'));
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
      
      const result = await page.textContent('.result, .output, [data-testid="url-result"]');
      expect(result).toBeTruthy();
      
      // 验证每个URL都被处理
      for (const url of urls) {
        const encodedPart = encodeURIComponent(url);
        expect(result).toContain(encodedPart.substring(0, 20)); // 检查部分编码结果
      }
    }
  });

  test('复制结果功能', async ({ page }) => {
    const testUrl = 'https://example.com/test';
    
    await page.fill('textarea, input[type="text"]', testUrl);
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
    }
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('清空输入功能', async ({ page }) => {
    const testUrl = 'https://example.com/test';
    
    await page.fill('textarea, input[type="text"]', testUrl);
    
    // 查找并点击清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      const inputValue = await page.inputValue('textarea, input[type="text"]');
      expect(inputValue).toBe('');
    }
  });

  test('长URL处理', async ({ page }) => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2000) + '?param=' + 'b'.repeat(1000);
    
    await page.fill('textarea, input[type="text"]', longUrl);
    
    const encodeButton = page.locator('button:has-text("Encode"), .encode-btn, [data-testid="encode-button"]');
    if (await encodeButton.count() > 0) {
      await encodeButton.click();
      
      const result = await page.textContent('.result, .output, [data-testid="url-result"]');
      expect(result).toBeTruthy();
      expect(result?.length).toBeGreaterThan(longUrl.length);
    }
  });
});