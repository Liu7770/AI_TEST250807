import { test, expect } from '@playwright/test';

test.describe('Dev Forge UUID Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/uuid');
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

  test('生成UUID v4', async ({ page }) => {
    // 点击生成按钮
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    // 获取生成的UUID
    const uuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
    
    // 验证UUID v4格式 (8-4-4-4-12)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid?.trim()).toMatch(uuidRegex);
  });

  test('生成多个不同的UUID', async ({ page }) => {
    const uuids = new Set();
    
    // 生成5个UUID
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      const uuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
      uuids.add(uuid?.trim());
      await page.waitForTimeout(100); // 短暂等待确保生成不同的UUID
    }
    
    // 验证生成的UUID都不相同
    expect(uuids.size).toBe(5);
  });

  test('UUID格式验证', async ({ page }) => {
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    const uuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
    const cleanUuid = uuid?.trim();
    
    // 验证长度
    expect(cleanUuid?.length).toBe(36);
    
    // 验证连字符位置
    expect(cleanUuid?.charAt(8)).toBe('-');
    expect(cleanUuid?.charAt(13)).toBe('-');
    expect(cleanUuid?.charAt(18)).toBe('-');
    expect(cleanUuid?.charAt(23)).toBe('-');
    
    // 验证版本号 (第13位应该是4)
    expect(cleanUuid?.charAt(14)).toBe('4');
  });

  test('批量生成UUID', async ({ page }) => {
    // 查找批量生成选项
    const batchInput = page.locator('input[type="number"], .batch-count, [data-testid="batch-input"]');
    if (await batchInput.count() > 0) {
      await batchInput.fill('10');
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      // 验证生成了多个UUID
      const results = await page.locator('.uuid-item, .result-item, [data-testid="uuid-list"] > *').count();
      expect(results).toBeGreaterThanOrEqual(1);
    }
  });

  test('复制UUID功能', async ({ page }) => {
    await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('大写小写选项', async ({ page }) => {
    // 查找大小写选项
    const caseOption = page.locator('input[type="checkbox"], .uppercase, .lowercase, [data-testid="case-option"]');
    if (await caseOption.count() > 0) {
      // 测试大写
      await caseOption.check();
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const uppercaseUuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
      expect(uppercaseUuid).toMatch(/[A-F0-9-]+/);
      
      // 测试小写
      await caseOption.uncheck();
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const lowercaseUuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
      expect(lowercaseUuid).toMatch(/[a-f0-9-]+/);
    }
  });

  test('无连字符选项', async ({ page }) => {
    // 查找无连字符选项
    const noDashOption = page.locator('input[type="checkbox"]:has-text("No Dash"), .no-dash, [data-testid="no-dash-option"]');
    if (await noDashOption.count() > 0) {
      await noDashOption.check();
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      
      const noDashUuid = await page.textContent('.result, .output, [data-testid="uuid-result"], input[readonly]');
      expect(noDashUuid?.includes('-')).toBeFalsy();
      expect(noDashUuid?.length).toBe(32);
    }
  });

  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 页面应在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
  });

  test('生成速度测试', async ({ page }) => {
    const startTime = Date.now();
    
    // 连续生成10个UUID
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    }
    
    const generationTime = Date.now() - startTime;
    
    // 生成10个UUID应在1秒内完成
    expect(generationTime).toBeLessThan(1000);
  });
});