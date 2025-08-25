import { test, expect } from '@playwright/test';

test.describe('DNS Resolver', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/dns');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称
    await expect(page.getByText('DNS Resolver').first()).toBeVisible();
    
    // 验证输入字段可见
    await expect(page.locator('input[placeholder="example.com"]')).toBeVisible();
    
    // 验证记录类型选择器
    await expect(page.locator('select, [role="combobox"]')).toBeVisible();
    
    // 验证解析按钮
    await expect(page.getByRole('button', { name: /resolve/i })).toBeVisible();
    
    // 验证清除按钮
    await expect(page.getByRole('button', { name: /clear/i })).toBeVisible();
  });

  test('DNS解析功能测试', async ({ page }) => {
    // 输入域名
    const domainInput = page.locator('input[placeholder="example.com"]');
    await domainInput.fill('google.com');
    
    // 选择记录类型（默认A记录）
    const recordTypeSelect = page.locator('select, [role="combobox"]').first();
    await recordTypeSelect.selectOption('A');
    
    // 点击解析按钮
    await page.getByRole('button', { name: /resolve/i }).click();
    
    // 等待解析结果
    await page.waitForTimeout(3000);
    
    // 验证结果区域出现
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });
  });

  test('清除功能测试', async ({ page }) => {
    // 输入域名
    const domainInput = page.locator('input[placeholder="example.com"]');
    await domainInput.fill('example.com');
    
    // 验证输入内容
    await expect(domainInput).toHaveValue('example.com');
    
    // 点击清除按钮
    await page.getByRole('button', { name: /clear/i }).click();
    
    // 验证输入框被清空
    await expect(domainInput).toHaveValue('');
  });

  test('不同DNS解析器选择测试', async ({ page }) => {
    // 验证解析器选项存在
    const resolverOptions = ['Google', 'Cloudflare', 'AdGuard', 'AliDNS'];
    
    for (const resolver of resolverOptions) {
      await expect(page.getByText(resolver).first()).toBeVisible();
    }
    
    // 选择Cloudflare解析器
    await page.getByText('Cloudflare').first().click();
    
    // 输入域名进行测试
    const domainInput = page.locator('input[placeholder="example.com"]');
    await domainInput.fill('cloudflare.com');
    
    // 点击解析
    await page.getByRole('button', { name: /resolve/i }).click();
    
    // 等待解析结果
    await page.waitForTimeout(3000);
  });

  test('不同记录类型测试', async ({ page }) => {
    const domainInput = page.locator('input[placeholder="example.com"]');
    await domainInput.fill('github.com');
    
    const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'];
    
    for (const recordType of recordTypes) {
      // 选择记录类型
      const recordTypeSelect = page.locator('select, [role="combobox"]').first();
      await recordTypeSelect.selectOption(recordType);
      
      // 点击解析
      await page.getByRole('button', { name: /resolve/i }).click();
      
      // 等待解析完成
      await page.waitForTimeout(2000);
      
      // 清除结果准备下一次测试
      await page.getByRole('button', { name: /clear/i }).click();
      await domainInput.fill('github.com');
    }
  });
});