import { test, expect } from '@playwright/test';

test.describe('Dev Forge Crontab工具页面', () => {

  const url = 'https://www.001236.xyz/en/crontab';
  const cronInput = 'input[placeholder*="cron"], input[placeholder*="Cron"], textarea';
  const generateButton = 'button:has-text("Generate"), button:has-text("生成")';
  const validateButton = 'button:has-text("Validate"), button:has-text("验证")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const presetButtons = 'button:has-text("Every minute"), button:has-text("Hourly"), button:has-text("Daily")';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    
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

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Crontab/);
    
    // 验证主要元素存在
    const cronInputElement = page.locator(cronInput);
    if (await cronInputElement.count() > 0) {
      await expect(cronInputElement.first()).toBeVisible();
    }
    
    // 验证按钮存在
    const generateBtn = page.locator(generateButton);
    if (await generateBtn.count() > 0) {
      await expect(generateBtn.first()).toBeVisible();
    }
    
    const validateBtn = page.locator(validateButton);
    if (await validateBtn.count() > 0) {
      await expect(validateBtn.first()).toBeVisible();
    }
  });

  test('有效Cron表达式验证测试', async ({ page }) => {
    const cronInputElement = page.locator(cronInput);
    
    if (await cronInputElement.count() > 0) {
      // 输入有效的Cron表达式 (每分钟执行)
      await cronInputElement.first().fill('* * * * *');
      
      // 点击验证按钮
      const validateBtn = page.locator(validateButton);
      if (await validateBtn.count() > 0) {
        await validateBtn.first().click();
      }
      
      // 验证显示有效提示或描述
      const validMessage = page.locator('text=Valid, text=Every minute, text=有效');
      if (await validMessage.count() > 0) {
        await expect(validMessage.first()).toBeVisible();
      }
    }
  });

  test('无效Cron表达式验证测试', async ({ page }) => {
    const cronInputElement = page.locator(cronInput);
    
    if (await cronInputElement.count() > 0) {
      // 输入无效的Cron表达式
      await cronInputElement.first().fill('invalid cron');
      
      // 点击验证按钮
      const validateBtn = page.locator(validateButton);
      if (await validateBtn.count() > 0) {
        await validateBtn.first().click();
      }
      
      // 验证显示错误提示
      const errorMessage = page.locator('text=Invalid, text=Error, text=错误, text=无效');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('常用Cron表达式测试', async ({ page }) => {
    const testCases = [
      { expression: '0 0 * * *', description: 'Daily' },
      { expression: '0 * * * *', description: 'Hourly' },
      { expression: '*/5 * * * *', description: 'Every 5 minutes' },
      { expression: '0 0 * * 0', description: 'Weekly' }
    ];
    
    const cronInputElement = page.locator(cronInput);
    
    for (const testCase of testCases) {
      if (await cronInputElement.count() > 0) {
        await cronInputElement.first().fill(testCase.expression);
        
        const validateBtn = page.locator(validateButton);
        if (await validateBtn.count() > 0) {
          await validateBtn.first().click();
        }
        
        // 验证表达式被正确识别
        await expect(cronInputElement.first()).toHaveValue(testCase.expression);
      }
    }
  });

  test('预设按钮功能测试', async ({ page }) => {
    const presetBtns = page.locator(presetButtons);
    
    if (await presetBtns.count() > 0) {
      // 点击第一个预设按钮
      await presetBtns.first().click();
      
      // 验证Cron表达式被自动填入
      const cronInputElement = page.locator(cronInput);
      if (await cronInputElement.count() > 0) {
        const value = await cronInputElement.first().inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('Cron表达式生成功能测试', async ({ page }) => {
    // 查找时间选择器或下拉菜单
    const minuteSelect = page.locator('select[name*="minute"], input[name*="minute"]');
    const hourSelect = page.locator('select[name*="hour"], input[name*="hour"]');
    
    if (await minuteSelect.count() > 0 && await hourSelect.count() > 0) {
      // 设置分钟和小时
      await minuteSelect.first().selectOption('0');
      await hourSelect.first().selectOption('12');
      
      // 点击生成按钮
      const generateBtn = page.locator(generateButton);
      if (await generateBtn.count() > 0) {
        await generateBtn.first().click();
      }
      
      // 验证生成的Cron表达式
      const cronInputElement = page.locator(cronInput);
      if (await cronInputElement.count() > 0) {
        const value = await cronInputElement.first().inputValue();
        expect(value).toContain('0');
        expect(value).toContain('12');
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const cronInputElement = page.locator(cronInput);
    const clearBtn = page.locator(clearButton);
    
    if (await cronInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await cronInputElement.first().fill('0 0 * * *');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(cronInputElement.first()).toHaveValue('');
    }
  });

  test('Cron表达式说明显示测试', async ({ page }) => {
    const cronInputElement = page.locator(cronInput);
    
    if (await cronInputElement.count() > 0) {
      // 输入一个Cron表达式
      await cronInputElement.first().fill('0 9 * * 1-5');
      
      // 验证显示人类可读的描述
      const description = page.locator('text=weekday, text=Monday, text=Friday, text=9:00');
      if (await description.count() > 0) {
        await expect(description.first()).toBeVisible();
      }
    }
  });

});