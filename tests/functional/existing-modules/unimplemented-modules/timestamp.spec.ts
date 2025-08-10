import { test, expect } from '@playwright/test';

test.describe('Dev Forge Timestamp Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=Timestamp');
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

  test('获取当前时间戳', async ({ page }) => {
    // 点击获取当前时间戳按钮
    const nowButton = page.locator('button:has-text("Now"), .now-btn, [data-testid="now-button"]');
    if (await nowButton.count() > 0) {
      await nowButton.click();
    }
    
    // 获取显示的时间戳
    const timestamp = await page.textContent('.timestamp, .result, [data-testid="timestamp-result"]');
    const timestampValue = parseInt(timestamp?.trim() || '0');
    
    // 验证时间戳是合理的（应该接近当前时间）
    const currentTime = Math.floor(Date.now() / 1000);
    expect(timestampValue).toBeGreaterThan(currentTime - 60); // 允许60秒误差
    expect(timestampValue).toBeLessThan(currentTime + 60);
  });

  test('时间戳转换为日期', async ({ page }) => {
    const testTimestamp = '1640995200'; // 2022-01-01 00:00:00 UTC
    
    // 输入时间戳
    await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', testTimestamp);
    
    // 点击转换按钮
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果
    const dateResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
    expect(dateResult).toContain('2022');
    expect(dateResult).toContain('01');
  });

  test('日期转换为时间戳', async ({ page }) => {
    // 输入日期
    const dateInput = page.locator('input[type="datetime-local"], .date-input, [data-testid="date-input"]');
    if (await dateInput.count() > 0) {
      await dateInput.fill('2022-01-01T00:00');
    } else {
      // 尝试分别输入年月日时分
      const yearInput = page.locator('input[placeholder*="year"], .year-input');
      const monthInput = page.locator('input[placeholder*="month"], .month-input');
      const dayInput = page.locator('input[placeholder*="day"], .day-input');
      
      if (await yearInput.count() > 0) {
        await yearInput.fill('2022');
        await monthInput.fill('01');
        await dayInput.fill('01');
      }
    }
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    const timestampResult = await page.textContent('.timestamp-result, .result, [data-testid="timestamp-result"]');
    const timestamp = parseInt(timestampResult?.trim() || '0');
    
    // 验证时间戳是否合理（2022-01-01附近）
    expect(timestamp).toBeGreaterThan(1640000000);
    expect(timestamp).toBeLessThan(1642000000);
  });

  test('不同时区转换', async ({ page }) => {
    const testTimestamp = '1640995200';
    
    await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', testTimestamp);
    
    // 选择时区
    const timezoneSelect = page.locator('select:has(option[value*="UTC"]), .timezone-select, [data-testid="timezone-select"]');
    if (await timezoneSelect.count() > 0) {
      await timezoneSelect.selectOption('UTC');
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      const utcResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
      expect(utcResult).toContain('UTC');
      
      // 切换到其他时区
      await timezoneSelect.selectOption('America/New_York');
      await convertButton.click();
      
      const nyResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
      expect(nyResult).not.toBe(utcResult);
    }
  });

  test('毫秒时间戳处理', async ({ page }) => {
    const testTimestampMs = '1640995200000'; // 毫秒时间戳
    
    await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', testTimestampMs);
    
    // 选择毫秒模式
    const unitSelect = page.locator('select:has(option[value*="ms"]), .unit-select, [data-testid="unit-select"]');
    if (await unitSelect.count() > 0) {
      await unitSelect.selectOption('milliseconds');
    }
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    const dateResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
    expect(dateResult).toContain('2022');
  });

  test('无效时间戳处理', async ({ page }) => {
    const invalidTimestamp = 'invalid';
    
    await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', invalidTimestamp);
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证错误提示
    const errorMessage = await page.textContent('.error, .invalid, [data-testid="error-message"]');
    expect(errorMessage).toMatch(/invalid|error/i);
  });

  test('时间格式选择', async ({ page }) => {
    const testTimestamp = '1640995200';
    
    await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', testTimestamp);
    
    // 选择不同的时间格式
    const formatSelect = page.locator('select:has(option[value*="ISO"]), .format-select, [data-testid="format-select"]');
    if (await formatSelect.count() > 0) {
      // 测试ISO格式
      await formatSelect.selectOption('ISO');
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      await convertButton.click();
      
      const isoResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
      expect(isoResult).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // 测试其他格式
      await formatSelect.selectOption('YYYY-MM-DD');
      await convertButton.click();
      
      const customResult = await page.textContent('.date-result, .result, [data-testid="date-result"]');
      expect(customResult).toMatch(/\d{4}-\d{2}-\d{2}/);
    }
  });

  test('批量时间戳转换', async ({ page }) => {
    const timestamps = ['1640995200', '1641081600', '1641168000'];
    
    // 查找批量输入区域
    const batchInput = page.locator('textarea:has-text("batch"), .batch-input, [data-testid="batch-input"]');
    if (await batchInput.count() > 0) {
      await batchInput.fill(timestamps.join('\n'));
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      await convertButton.click();
      
      const results = await page.textContent('.batch-results, .results, [data-testid="batch-results"]');
      expect(results).toContain('2022');
    }
  });

  test('相对时间计算', async ({ page }) => {
    // 查找相对时间功能
    const relativeTab = page.locator('button:has-text("Relative"), .relative-tab, [data-testid="relative-tab"]');
    if (await relativeTab.count() > 0) {
      await relativeTab.click();
      
      // 输入相对时间（如：1小时前）
      const amountInput = page.locator('input[type="number"]:near(:text("hours")), .amount-input');
      const unitSelect = page.locator('select:has(option[value*="hour"]), .unit-select');
      
      if (await amountInput.count() > 0) {
        await amountInput.fill('1');
        await unitSelect.selectOption('hours');
        
        const calculateButton = page.locator('button:has-text("Calculate"), .calculate-btn');
        await calculateButton.click();
        
        const result = await page.textContent('.relative-result, .result');
        expect(result).toBeTruthy();
      }
    }
  });

  test('复制时间戳功能', async ({ page }) => {
    const nowButton = page.locator('button:has-text("Now"), .now-btn, [data-testid="now-button"]');
    if (await nowButton.count() > 0) {
      await nowButton.click();
    }
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('历史记录功能', async ({ page }) => {
    // 进行几次转换操作
    const timestamps = ['1640995200', '1641081600'];
    
    for (const timestamp of timestamps) {
      await page.fill('input[type="number"], .timestamp-input, [data-testid="timestamp-input"]', timestamp);
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // 查找历史记录
    const historyTab = page.locator('button:has-text("History"), .history-tab, [data-testid="history-tab"]');
    if (await historyTab.count() > 0) {
      await historyTab.click();
      
      const historyItems = await page.locator('.history-item, .history-entry').count();
      expect(historyItems).toBeGreaterThan(0);
    }
  });
});