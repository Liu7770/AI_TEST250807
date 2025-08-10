import { test, expect } from '@playwright/test';

test.describe('Dev Forge Regex Tester', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=Regex Tester');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Tool implementation coming soon')) {
      test.skip(true, 'Tool implementation coming soon...');
    }
  });

  test('基本正则表达式匹配', async ({ page }) => {
    const regex = '\\d+';
    const testText = 'There are 123 apples and 456 oranges';
    
    // 输入正则表达式
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    
    // 输入测试文本
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 点击测试按钮（如果需要）
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证匹配结果
    const matchResults = page.locator('.match, .result, [data-testid="match-results"]');
    await expect(matchResults).toBeVisible();
    
    // 验证匹配的数字被高亮
    const highlightedMatches = page.locator('.highlight, .matched, [data-testid="highlighted-match"]');
    await expect(highlightedMatches.first()).toBeVisible();
  });

  test('全局匹配模式', async ({ page }) => {
    const regex = '\\w+';
    const testText = 'hello world test';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 启用全局匹配
    const globalFlag = page.locator('input[type="checkbox"]:has-text("g"), .flag-g, [data-testid="global-flag"]');
    if (await globalFlag.count() > 0) {
      await globalFlag.check();
    }
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证多个匹配结果
    const matchCount = await page.locator('.match, .result-item, [data-testid="match-item"]').count();
    expect(matchCount).toBeGreaterThan(1);
  });

  test('忽略大小写模式', async ({ page }) => {
    const regex = 'HELLO';
    const testText = 'hello world Hello HELLO';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 启用忽略大小写
    const ignoreCaseFlag = page.locator('input[type="checkbox"]:has-text("i"), .flag-i, [data-testid="ignore-case-flag"]');
    if (await ignoreCaseFlag.count() > 0) {
      await ignoreCaseFlag.check();
    }
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证所有大小写变体都被匹配
    const matchCount = await page.locator('.match, .result-item, [data-testid="match-item"]').count();
    expect(matchCount).toBeGreaterThanOrEqual(3);
  });

  test('多行模式', async ({ page }) => {
    const regex = '^\\w+';
    const testText = 'first line\nsecond line\nthird line';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 启用多行模式
    const multilineFlag = page.locator('input[type="checkbox"]:has-text("m"), .flag-m, [data-testid="multiline-flag"]');
    if (await multilineFlag.count() > 0) {
      await multilineFlag.check();
    }
    
    // 启用全局匹配以看到所有行的匹配
    const globalFlag = page.locator('input[type="checkbox"]:has-text("g"), .flag-g, [data-testid="global-flag"]');
    if (await globalFlag.count() > 0) {
      await globalFlag.check();
    }
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证每行开头的单词都被匹配
    const matchCount = await page.locator('.match, .result-item, [data-testid="match-item"]').count();
    expect(matchCount).toBeGreaterThanOrEqual(3);
  });

  test('捕获组显示', async ({ page }) => {
    const regex = '(\\w+)@(\\w+\\.\\w+)';
    const testText = 'Contact us at john@example.com or jane@test.org';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证捕获组结果显示
    const captureGroups = page.locator('.capture-group, .group, [data-testid="capture-groups"]');
    if (await captureGroups.count() > 0) {
      await expect(captureGroups).toBeVisible();
      
      // 验证显示了用户名和域名部分
      const groupText = await captureGroups.textContent();
      expect(groupText).toContain('john');
      expect(groupText).toContain('example.com');
    }
  });

  test('替换功能', async ({ page }) => {
    const regex = '\\d+';
    const testText = 'I have 5 apples and 10 oranges';
    const replacement = 'X';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 查找替换输入框
    const replaceInput = page.locator('input[placeholder*="replace"], .replace-input, [data-testid="replace-input"]');
    if (await replaceInput.count() > 0) {
      await replaceInput.fill(replacement);
      
      // 点击替换按钮
      const replaceButton = page.locator('button:has-text("Replace"), .replace-btn, [data-testid="replace-button"]');
      if (await replaceButton.count() > 0) {
        await replaceButton.click();
        
        // 验证替换结果
        const replaceResult = page.locator('.replace-result, .replacement-output, [data-testid="replace-result"]');
        await expect(replaceResult).toBeVisible();
        
        const resultText = await replaceResult.textContent();
        expect(resultText).toContain('I have X apples and X oranges');
      }
    }
  });

  test('正则表达式语法错误处理', async ({ page }) => {
    const invalidRegex = '[invalid';
    const testText = 'test text';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', invalidRegex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证错误提示
    const errorMessage = page.locator('.error, .invalid, [data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/invalid|error|syntax/i);
  });

  test('匹配详细信息显示', async ({ page }) => {
    const regex = '\\b\\w{4}\\b';
    const testText = 'This is a test with some four letter words like test and word';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证匹配详情（位置、长度等）
    const matchDetails = page.locator('.match-details, .match-info, [data-testid="match-details"]');
    if (await matchDetails.count() > 0) {
      await expect(matchDetails).toBeVisible();
      
      const detailsText = await matchDetails.textContent();
      expect(detailsText).toMatch(/position|index|length/i);
    }
  });

  test('常用正则表达式模板', async ({ page }) => {
    // 查找预设模板
    const emailTemplate = page.locator('button:has-text("Email"), .template-email, [data-testid="email-template"]');
    const phoneTemplate = page.locator('button:has-text("Phone"), .template-phone, [data-testid="phone-template"]');
    const urlTemplate = page.locator('button:has-text("URL"), .template-url, [data-testid="url-template"]');
    
    if (await emailTemplate.count() > 0) {
      await emailTemplate.click();
      
      // 验证邮箱正则表达式被填入
      const regexValue = await page.inputValue('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]');
      expect(regexValue).toContain('@');
      expect(regexValue.length).toBeGreaterThan(10);
    } else if (await phoneTemplate.count() > 0) {
      await phoneTemplate.click();
      
      const regexValue = await page.inputValue('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]');
      expect(regexValue).toMatch(/\d|\[|\]/); // 包含数字相关的正则
    }
  });

  test('正则表达式解释功能', async ({ page }) => {
    const regex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    
    // 查找解释按钮或自动解释
    const explainButton = page.locator('button:has-text("Explain"), .explain-btn, [data-testid="explain-button"]');
    if (await explainButton.count() > 0) {
      await explainButton.click();
    }
    
    // 验证正则表达式解释
    const explanation = page.locator('.explanation, .regex-explanation, [data-testid="regex-explanation"]');
    if (await explanation.count() > 0) {
      await expect(explanation).toBeVisible();
      
      const explanationText = await explanation.textContent();
      expect(explanationText).toMatch(/start|end|character|class|group/i);
    }
  });

  test('测试用例保存和加载', async ({ page }) => {
    const regex = '\\d{3}-\\d{3}-\\d{4}';
    const testText = 'Call me at 123-456-7890 or 987-654-3210';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 查找保存按钮
    const saveButton = page.locator('button:has-text("Save"), .save-btn, [data-testid="save-button"]');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      
      // 输入保存名称
      const saveNameInput = page.locator('input[placeholder*="name"], .save-name, [data-testid="save-name"]');
      if (await saveNameInput.count() > 0) {
        await saveNameInput.fill('Phone Number Test');
        
        const confirmSave = page.locator('button:has-text("Confirm"), .confirm-save, [data-testid="confirm-save"]');
        if (await confirmSave.count() > 0) {
          await confirmSave.click();
        }
      }
      
      // 验证保存成功提示
      const successMessage = page.locator('.success, .saved, [data-testid="save-success"]');
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('性能测试大文本', async ({ page }) => {
    const regex = '\\w+';
    const largeText = 'word '.repeat(10000);
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', largeText);
    
    // 启用全局匹配
    const globalFlag = page.locator('input[type="checkbox"]:has-text("g"), .flag-g, [data-testid="global-flag"]');
    if (await globalFlag.count() > 0) {
      await globalFlag.check();
    }
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 验证大文本处理（可能有性能警告或分页）
    const performanceWarning = page.locator('.warning, .performance, [data-testid="performance-warning"]');
    const matchResults = page.locator('.match, .result, [data-testid="match-results"]');
    
    // 应该显示结果或性能警告
    const hasWarning = await performanceWarning.count() > 0;
    const hasResults = await matchResults.count() > 0;
    expect(hasWarning || hasResults).toBeTruthy();
  });

  test('正则表达式历史记录', async ({ page }) => {
    const regex1 = '\\d+';
    const regex2 = '[a-z]+';
    
    // 测试第一个正则表达式
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex1);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', 'test 123');
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 测试第二个正则表达式
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex2);
    
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 查找历史记录
    const historyButton = page.locator('button:has-text("History"), .history-btn, [data-testid="history-button"]');
    if (await historyButton.count() > 0) {
      await historyButton.click();
      
      // 验证历史记录显示
      const historyItems = page.locator('.history-item, .regex-history, [data-testid="history-item"]');
      if (await historyItems.count() > 0) {
        await expect(historyItems.first()).toBeVisible();
      }
    }
  });

  test('导出匹配结果', async ({ page }) => {
    const regex = '\\b\\w+@\\w+\\.\\w+\\b';
    const testText = 'Contact john@example.com or jane@test.org for more info';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    const testButton = page.locator('button:has-text("Test"), .test-btn, [data-testid="test-button"]');
    if (await testButton.count() > 0) {
      await testButton.click();
    }
    
    // 查找导出按钮
    const exportButton = page.locator('button:has-text("Export"), .export-btn, [data-testid="export-button"]');
    if (await exportButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/regex.*\.(txt|json|csv)$/i);
    }
  });

  test('清空输入功能', async ({ page }) => {
    const regex = 'test';
    const testText = 'test content';
    
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', regex);
    await page.fill('textarea, .test-text, [data-testid="test-text"]', testText);
    
    // 查找清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      const regexValue = await page.inputValue('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]');
      const textValue = await page.inputValue('textarea, .test-text, [data-testid="test-text"]');
      
      expect(regexValue).toBe('');
      expect(textValue).toBe('');
    }
  });

  test('正则表达式验证器', async ({ page }) => {
    const validRegex = '^[a-z]+$';
    const invalidRegex = '[unclosed';
    
    // 测试有效正则表达式
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', validRegex);
    
    // 查找验证指示器
    const validIndicator = page.locator('.valid, .success-icon, [data-testid="valid-regex"]');
    if (await validIndicator.count() > 0) {
      await expect(validIndicator).toBeVisible();
    }
    
    // 测试无效正则表达式
    await page.fill('input[placeholder*="regex"], .regex-input, [data-testid="regex-input"]', invalidRegex);
    
    const invalidIndicator = page.locator('.invalid, .error-icon, [data-testid="invalid-regex"]');
    if (await invalidIndicator.count() > 0) {
      await expect(invalidIndicator).toBeVisible();
    }
  });
});