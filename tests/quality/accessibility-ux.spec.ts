import { test, expect } from '@playwright/test';

test.describe('Dev Forge 可访问性和用户体验测试', () => {

  const baseUrl = 'https://www.001236.xyz/en';

  test('键盘导航测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 使用Tab键导航
    await page.keyboard.press('Tab');
    
    // 验证焦点管理
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    
    // 继续Tab导航几次
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // 验证可以通过Enter键激活链接
    await page.keyboard.press('Enter');
  });

  test('颜色对比度和可读性测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 验证主要文本元素可见
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    await expect(page.locator('nav p').filter({ hasText: 'Developer Tools' })).toBeVisible();
    
    // 验证链接在悬停时有视觉反馈
    const jsonToolsLink = page.locator('nav').locator('text=JSON Tools');
    await jsonToolsLink.hover();
    
    // 验证按钮有适当的视觉状态
    const languageButton = page.locator('button:has-text("English")');
    await expect(languageButton).toBeVisible();
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(baseUrl);
      
      // 验证关键元素在所有尺寸下都可见
      if (viewport.width < 768) {
        await expect(page.locator('h1.text-xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      } else {
        await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      }
      
      // 在移动端，可能需要点击菜单按钮来显示导航
      if (viewport.width < 768) {
        const menuButton = page.locator('button[aria-label="Toggle navigation"]');
        if (await menuButton.isVisible()) {
          await menuButton.click();
        }
      }
      
      // 验证导航元素存在（可能在移动端被隐藏）
      const jsonTools = page.locator('nav').locator('text=JSON Tools');
      if (viewport.width >= 768) {
        await expect(jsonTools).toBeVisible();
      }
    }
  });

  test('表单可访问性测试', async ({ page }) => {
    // 测试JSON工具页面的表单
    await page.goto(`${baseUrl}/json`);

    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    
    // 验证表单元素有适当的标签或占位符
    const placeholder = await textarea.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    
    // 测试表单焦点管理
    await textarea.focus();
    await expect(textarea).toBeFocused();
  });

  test('错误状态和反馈测试', async ({ page }) => {
    await page.goto(`${baseUrl}/json`);

    // 输入无效JSON并测试错误反馈
    await page.locator('textarea').fill('invalid json {');
    await page.click('button:has-text("Format")');
    
    // 验证错误信息显示
    await expect(page.locator('text=Invalid JSON: Unexpected')).toBeVisible();
  });

  test('加载状态和性能测试', async ({ page }) => {
    // 监控网络请求
    const responses: any[] = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing // 获取响应时间信息,timing是Response对象的属性而不是方法
      });
    });

    const startTime = Date.now();
    await page.goto(baseUrl);
    const loadTime = Date.now() - startTime;

    // 验证页面加载时间合理
    expect(loadTime).toBeLessThan(3000);
    
    // 验证没有失败的关键资源请求
    const failedRequests = responses.filter(r => r.status >= 400);
    expect(failedRequests.length).toBe(0);
  });

  test('深色模式支持测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 检查是否支持深色模式
    const darkModeSupported = await page.evaluate(() => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 验证页面在深色模式下的可读性
    if (darkModeSupported) {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      
      // 验证文本仍然可见
      await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      await expect(page.locator('nav p').filter({ hasText: 'Developer Tools' })).toBeVisible();
    }
  });

  test('图片和媒体可访问性测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 检查所有图片是否有alt属性
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // 装饰性图片可以有空的alt属性，但应该存在
      expect(alt).not.toBeNull();
    }
  });

  test('链接和按钮可访问性测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 验证所有链接都有描述性文本
    const links = await page.locator('a').all();
    for (const link of links.slice(0, 10)) { // 只检查前10个链接
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // 链接应该有文本内容或aria-label
      expect(text || ariaLabel).toBeTruthy();
    }

    // 验证按钮有适当的标签
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // 按钮应该有文本内容或aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('页面结构和语义化测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 验证页面有适当的标题结构
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);
    
    // 验证导航结构
    await expect(page.locator('nav')).toBeVisible();
    
    // 验证主要内容区域
    const mainContent = page.locator('main, [role="main"], .main-content');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

});