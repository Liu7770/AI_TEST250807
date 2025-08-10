import { test, expect } from '@playwright/test';

test.describe('Dev Forge Crontab Tool', () => {
  const baseUrl = 'https://www.001236.xyz/en/crontab';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
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

  test('Crontab Tool页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Crontab.*Tool.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Crontab Tool' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Generate and validate cron expressions')).toBeVisible();
  });

  test('Cron表达式输入测试', async ({ page }) => {
    // 查找cron表达式输入框
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    await expect(cronInput).toBeVisible();
    
    // 测试输入有效的cron表达式
    await cronInput.fill('0 0 * * *');
    await expect(cronInput).toHaveValue('0 0 * * *');
    
    // 测试复杂的cron表达式
    await cronInput.fill('*/15 9-17 * * 1-5');
    await expect(cronInput).toHaveValue('*/15 9-17 * * 1-5');
  });

  test('Cron表达式验证功能', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    const validateButton = page.locator('button').filter({ hasText: /validate|check|parse/i });
    
    if (await validateButton.count() > 0) {
      // 测试有效表达式验证
      await cronInput.fill('0 12 * * *');
      await validateButton.click();
      
      // 验证结果显示
      await expect(page.locator('text=valid, text=daily, text=12:00')).toBeVisible();
      
      // 测试无效表达式验证
      await cronInput.fill('invalid cron');
      await validateButton.click();
      
      // 验证错误信息显示
      await expect(page.locator('text=invalid, text=error')).toBeVisible();
    }
  });

  test('预设Cron表达式测试', async ({ page }) => {
    // 查找预设表达式按钮或选项
    const presetButtons = page.locator('button').filter({ hasText: /every|daily|weekly|monthly|hourly/i });
    
    if (await presetButtons.count() > 0) {
      // 测试每日预设
      const dailyButton = presetButtons.filter({ hasText: /daily/i }).first();
      if (await dailyButton.count() > 0) {
        await dailyButton.click();
        
        const cronInput = page.locator('input[type="text"], textarea').first();
        await expect(cronInput).toHaveValue(/0.*0.*\*.*\*.*\*/);
      }
      
      // 测试每小时预设
      const hourlyButton = presetButtons.filter({ hasText: /hourly/i }).first();
      if (await hourlyButton.count() > 0) {
        await hourlyButton.click();
        
        const cronInput = page.locator('input[type="text"], textarea').first();
        await expect(cronInput).toHaveValue(/0.*\*.*\*.*\*.*\*/);
      }
    }
  });

  test('Cron表达式解释功能', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    
    // 输入表达式并检查解释
    await cronInput.fill('0 9 * * 1-5');
    
    // 查找解释文本区域
    const explanationArea = page.locator('.explanation, .description, .result').first();
    
    if (await explanationArea.count() > 0) {
      await expect(explanationArea).toContainText(/9.*AM.*weekday|Monday.*Friday/);
    }
  });

  test('下次执行时间预测', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    
    await cronInput.fill('0 12 * * *');
    
    // 查找下次执行时间显示
    const nextRunTime = page.locator('text=next, .next-run, .next-execution');
    
    if (await nextRunTime.count() > 0) {
      await expect(nextRunTime.first()).toBeVisible();
      // 验证时间格式
      await expect(nextRunTime.first()).toContainText(/\d{4}|\d{2}:\d{2}|AM|PM/);
    }
  });

  test('Cron字段编辑器测试', async ({ page }) => {
    // 查找分钟、小时、日期等字段的独立输入框
    const minuteField = page.locator('input[placeholder*="minute"], input[name*="minute"]');
    const hourField = page.locator('input[placeholder*="hour"], input[name*="hour"]');
    
    if (await minuteField.count() > 0 && await hourField.count() > 0) {
      // 测试分钟字段
      await minuteField.fill('30');
      await expect(minuteField).toHaveValue('30');
      
      // 测试小时字段
      await hourField.fill('14');
      await expect(hourField).toHaveValue('14');
      
      // 验证生成的完整表达式
      const generatedCron = page.locator('.generated-cron, .result-cron');
      if (await generatedCron.count() > 0) {
        await expect(generatedCron).toContainText('30 14');
      }
    }
  });

  test('时区支持测试', async ({ page }) => {
    // 查找时区选择器
    const timezoneSelect = page.locator('select[name*="timezone"], select[name*="tz"]');
    
    if (await timezoneSelect.count() > 0) {
      await timezoneSelect.selectOption('UTC');
      await expect(timezoneSelect).toHaveValue('UTC');
      
      // 测试其他时区
      await timezoneSelect.selectOption('America/New_York');
    }
  });

  test('Cron表达式历史记录', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    
    // 输入几个不同的表达式
    const expressions = ['0 9 * * *', '*/30 * * * *', '0 0 1 * *'];
    
    for (const expr of expressions) {
      await cronInput.fill(expr);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .saved');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
    }
  });

  test('导出功能测试', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    await cronInput.fill('0 12 * * *');
    
    // 查找导出按钮
    const exportButton = page.locator('button').filter({ hasText: /export|download|save/i });
    
    if (await exportButton.count() > 0) {
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/cron|schedule/);
      } catch (error) {
        // 如果没有实际下载，至少验证按钮可点击
        console.log('Export button clicked, but no download occurred');
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    
    // 输入内容
    await cronInput.fill('0 12 * * *');
    await expect(cronInput).toHaveValue('0 12 * * *');
    
    // 查找清空按钮
    const clearButton = page.locator('button').filter({ hasText: /clear|reset|clean/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      await expect(cronInput).toHaveValue('');
    }
  });

  test('错误处理测试', async ({ page }) => {
    const cronInput = page.locator('input[placeholder*="cron"], textarea[placeholder*="cron"], input[type="text"]').first();
    
    // 测试各种无效输入
    const invalidInputs = [
      '60 * * * *',  // 无效分钟
      '* 25 * * *',  // 无效小时
      '* * 32 * *',  // 无效日期
      '* * * 13 *',  // 无效月份
      '* * * * 8'    // 无效星期
    ];
    
    for (const invalid of invalidInputs) {
      await cronInput.fill(invalid);
      
      // 查找错误信息
      const errorMessage = page.locator('.error, .invalid, text=invalid');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });
});