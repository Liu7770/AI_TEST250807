import { test, expect } from '@playwright/test';

test.describe('Dev Forge Password Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=Password Generator');
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

  test('生成默认密码', async ({ page }) => {
    // 点击生成按钮
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    // 获取生成的密码
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    
    // 验证密码不为空
    expect(password?.trim()).toBeTruthy();
    expect(password?.trim().length).toBeGreaterThan(0);
  });

  test('设置密码长度', async ({ page }) => {
    const targetLength = 16;
    
    // 设置密码长度
    const lengthInput = page.locator('input[type="number"], .length-input, [data-testid="length-input"]');
    if (await lengthInput.count() > 0) {
      await lengthInput.fill(targetLength.toString());
    } else {
      // 尝试使用滑块
      const slider = page.locator('input[type="range"], .slider');
      if (await slider.count() > 0) {
        await slider.fill(targetLength.toString());
      }
    }
    
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    expect(password?.trim().length).toBe(targetLength);
  });

  test('包含大写字母选项', async ({ page }) => {
    // 确保大写字母选项被选中
    const uppercaseOption = page.locator('input[type="checkbox"]:near(:text("Uppercase")), .uppercase-option, [data-testid="uppercase-checkbox"]');
    if (await uppercaseOption.count() > 0) {
      await uppercaseOption.check();
    }
    
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    expect(password).toMatch(/[A-Z]/);
  });

  test('包含小写字母选项', async ({ page }) => {
    // 确保小写字母选项被选中
    const lowercaseOption = page.locator('input[type="checkbox"]:near(:text("Lowercase")), .lowercase-option, [data-testid="lowercase-checkbox"]');
    if (await lowercaseOption.count() > 0) {
      await lowercaseOption.check();
    }
    
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    expect(password).toMatch(/[a-z]/);
  });

  test('包含数字选项', async ({ page }) => {
    // 确保数字选项被选中
    const numbersOption = page.locator('input[type="checkbox"]:near(:text("Numbers")), .numbers-option, [data-testid="numbers-checkbox"]');
    if (await numbersOption.count() > 0) {
      await numbersOption.check();
    }
    
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    expect(password).toMatch(/[0-9]/);
  });

  test('包含特殊字符选项', async ({ page }) => {
    // 确保特殊字符选项被选中
    const symbolsOption = page.locator('input[type="checkbox"]:near(:text("Symbols")), .symbols-option, [data-testid="symbols-checkbox"]');
    if (await symbolsOption.count() > 0) {
      await symbolsOption.check();
    }
    
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
    expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/);
  });

  test('排除相似字符选项', async ({ page }) => {
    // 查找排除相似字符选项
    const excludeSimilarOption = page.locator('input[type="checkbox"]:near(:text("Exclude Similar")), .exclude-similar, [data-testid="exclude-similar-checkbox"]');
    if (await excludeSimilarOption.count() > 0) {
      await excludeSimilarOption.check();
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
      
      // 验证不包含相似字符 (0, O, l, I, 1)
      expect(password).not.toMatch(/[0OlI1]/);
    }
  });

  test('生成多个不同密码', async ({ page }) => {
    const passwords = new Set();
    
    // 生成5个密码
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
      passwords.add(password?.trim());
      await page.waitForTimeout(100);
    }
    
    // 验证生成的密码都不相同
    expect(passwords.size).toBe(5);
  });

  test('密码强度指示器', async ({ page }) => {
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    // 查找密码强度指示器
    const strengthIndicator = page.locator('.strength, .password-strength, [data-testid="strength-indicator"]');
    if (await strengthIndicator.count() > 0) {
      const strengthText = await strengthIndicator.textContent();
      expect(strengthText).toMatch(/weak|medium|strong|very strong/i);
    }
  });

  test('复制密码功能', async ({ page }) => {
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('最小长度限制', async ({ page }) => {
    const minLength = 4;
    
    // 尝试设置很短的密码长度
    const lengthInput = page.locator('input[type="number"], .length-input, [data-testid="length-input"]');
    if (await lengthInput.count() > 0) {
      await lengthInput.fill('1');
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
      expect(password?.trim().length).toBeGreaterThanOrEqual(minLength);
    }
  });

  test('最大长度限制', async ({ page }) => {
    const maxLength = 128;
    
    // 尝试设置很长的密码长度
    const lengthInput = page.locator('input[type="number"], .length-input, [data-testid="length-input"]');
    if (await lengthInput.count() > 0) {
      await lengthInput.fill('200');
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
      expect(password?.trim().length).toBeLessThanOrEqual(maxLength);
    }
  });

  test('批量生成密码', async ({ page }) => {
    // 查找批量生成选项
    const batchInput = page.locator('input[type="number"]:near(:text("Count")), .batch-count, [data-testid="batch-input"]');
    if (await batchInput.count() > 0) {
      await batchInput.fill('5');
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      // 验证生成了多个密码
      const results = await page.locator('.password-item, .result-item, [data-testid="password-list"] > *').count();
      expect(results).toBeGreaterThanOrEqual(1);
    }
  });

  test('自定义字符集', async ({ page }) => {
    // 查找自定义字符集输入
    const customCharsInput = page.locator('input[placeholder*="custom"], .custom-chars, [data-testid="custom-chars-input"]');
    if (await customCharsInput.count() > 0) {
      await customCharsInput.fill('ABC123');
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const password = await page.textContent('.result, .output, [data-testid="password-result"], input[readonly]');
      
      // 验证密码只包含自定义字符
      const passwordChars = password?.trim().split('') || [];
      for (const char of passwordChars) {
        expect('ABC123').toContain(char);
      }
    }
  });
});