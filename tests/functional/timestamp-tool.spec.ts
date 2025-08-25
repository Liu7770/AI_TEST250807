import { test, expect } from '@playwright/test';
import { TestHelpersV2 } from '../utils/test-helpers-v2';
import { ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('Timestamp Tool 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/timestamp');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('Timestamp').first()).toBeVisible();
    
    // 验证主要功能元素存在
    await expect(page.locator('input')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Convert' })).toBeVisible();
  });

  test('时间戳转换测试', async ({ page }) => {
    // 输入时间戳
    const timestamp = '1640995200'; // 2022-01-01 00:00:00 UTC
    const inputField = page.locator('input[placeholder="Input..."]');
    await inputField.fill(timestamp);
    
    // 点击转换按钮
    const convertBtn = page.locator('button:has-text("Convert")');
    await convertBtn.click();
    
    // 验证转换结果
    const resultElement = page.locator('.result, .output, pre').first();
    await TestHelpersV2.assertElementVisible({
      locator: resultElement,
      elementName: '转换结果区域',
      testName: '时间戳转换结果显示检查'
    });
    
    const resultText = await resultElement.textContent();
    if (!resultText || !resultText.includes('2022')) {
      const errorMessage = ErrorMessageFactory.create('operation', {
        testName: '时间戳转换',
        operation: `转换时间戳 ${timestamp}`,
        expected: '包含2022年的日期时间格式',
        actual: resultText || '空结果',
        suggestion: '检查时间戳转换逻辑，确保能正确转换为可读日期格式'
      });
      throw new Error(errorMessage);
    }
  });

  test('获取当前时间戳功能测试', async ({ page }) => {
    // 查找获取当前时间戳的按钮或功能
    const currentTimeBtn = page.locator('button:has-text("Current"), button:has-text("Now"), button:has-text("Get Current")');
    
    if (await currentTimeBtn.count() > 0) {
      await currentTimeBtn.first().click();
      
      // 验证当前时间戳是否显示
      const inputField = page.locator('input[placeholder="Input..."]');
      const currentValue = await inputField.inputValue();
      
      // 验证是否是合理的时间戳（10位或13位数字）
      const timestampPattern = /^\d{10}(\d{3})?$/;
      if (!timestampPattern.test(currentValue)) {
        const errorMessage = ErrorMessageFactory.create('validation', {
          testName: '当前时间戳格式验证',
          scenario: '获取当前时间戳',
          expected: '10位或13位数字格式的时间戳',
          actual: `获取的值: "${currentValue}"`,
          suggestion: '检查当前时间戳获取功能，确保返回正确格式的时间戳'
        });
        throw new Error(errorMessage);
      }
      
      // 验证时间戳是否接近当前时间（允许一定误差）
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const inputTimestamp = parseInt(currentValue.length === 13 ? currentValue.substring(0, 10) : currentValue);
      const timeDiff = Math.abs(currentTimestamp - inputTimestamp);
      
      if (timeDiff > 60) { // 允许60秒误差
        const errorMessage = ErrorMessageFactory.create('validation', {
          testName: '当前时间戳准确性验证',
          scenario: '验证获取的时间戳与当前时间的差异',
          expected: '时间差异小于60秒',
          actual: `时间差: ${timeDiff}秒 (获取: ${inputTimestamp}, 当前: ${currentTimestamp})`,
          suggestion: '检查时间戳获取的准确性，确保获取的是当前时间戳'
        });
        throw new Error(errorMessage);
      }
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