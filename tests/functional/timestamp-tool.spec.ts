import { test, expect } from '@playwright/test';

test.describe('Timestamp Tool 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/timestamp');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证主要元素存在
    await expect(page.locator('h1')).toContainText('Timestamp');
    
    // 验证输入框存在
    const inputField = page.locator('input[placeholder="Input..."]');
    await expect(inputField).toBeVisible();
    
    // 验证转换按钮存在
    const convertBtn = page.locator('button:has-text("Convert")');
    await expect(convertBtn).toBeVisible();
  });

  test('时间戳转换功能测试', async ({ page }) => {
    // 输入时间戳
    const inputField = page.locator('input[placeholder="Input..."]');
    await inputField.fill('1704067200');
    
    // 点击转换按钮
    const convertBtn = page.locator('button:has-text("Convert")');
    await convertBtn.click();
    
    // 验证转换结果
    await expect(page.locator('text=2024')).toBeVisible();
  });

  test('获取当前时间戳功能测试', async ({ page }) => {
    // 点击获取当前时间按钮
    const nowBtn = page.locator('button:has-text("Now")');
    if (await nowBtn.count() > 0) {
      await nowBtn.click();
      
      // 验证当前时间戳被填入
      const currentYear = new Date().getFullYear().toString();
      await expect(page.locator(`text=${currentYear}`)).toBeVisible();
    }
  });

  test('清空功能测试', async ({ page }) => {
    const inputField = page.locator('input[placeholder="Input..."]');
    const clearBtn = page.locator('button:has-text("Clear")');
    
    if (await clearBtn.count() > 0) {
      // 先输入一些内容
      await inputField.fill('1234567890');
      
      // 点击清空按钮
      await clearBtn.click();
      
      // 验证输入框已清空
      await expect(inputField).toHaveValue('');
    }
  });

});