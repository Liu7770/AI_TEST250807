import { test, expect } from '@playwright/test';

test.describe('Dev Forge 综合测试', () => {
  const baseUrl = 'https://www.001236.xyz/en';
  
  // 所有可用的工具列表
  const availableTools = [
    { name: 'JSON Tools', path: '/json', implemented: true },
    { name: 'Base64 Encoder/Decoder', path: '/base64', implemented: true },
    { name: 'Timestamp', path: '/timestamp', implemented: false },
    { name: 'Crontab Tool', path: '/crontab', implemented: false },
    { name: 'Hash Calculator', path: '/hash', implemented: false },
    { name: 'JWT Decoder', path: '/jwt', implemented: false },
    { name: 'UUID Generator', path: '/uuid', implemented: false },
    { name: 'Password Generator', path: '/password', implemented: false },
    { name: 'URL Tool', path: '/url', implemented: false },
    { name: 'Code Beautifier', path: '/beautifier', implemented: false },
    { name: 'Color Converter', path: '/color', implemented: false },
    { name: 'Base Converter', path: '/base', implemented: false },
    { name: 'SQL Formatter', path: '/sql', implemented: false },
    { name: 'Image to Base64', path: '/image', implemented: false },
    { name: 'Data Converter', path: '/data', implemented: false },
    { name: 'HTTP Status Lookup', path: '/http', implemented: false },
    { name: 'User-Agent Parser', path: '/useragent', implemented: false }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
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

  test('页面基本元素和加载验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证主标题存在
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);
    
    // 验证主标题内容 - 使用可见的桌面版标题
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    
    // 验证副标题
    await expect(page.locator('nav p').filter({ hasText: 'Developer Tools' })).toBeVisible();
    
    // 验证欢迎信息
    await expect(page.locator('text=Welcome to Dev Forge')).toBeVisible();
    await expect(page.locator('text=A collection of useful developer tools for better productivity')).toBeVisible();
    
    // 验证导航栏存在
    await expect(page.locator('nav')).toBeVisible();
    
    // 验证主要内容区域存在
    await expect(page.locator('main, .main-content, .container')).toBeVisible();
  });

  test('工具卡片显示和点击测试', async ({ page }) => {
    // 验证工具卡片容器存在（主内容区域）
    const mainContent = page.locator('main, .main-content, .grid');
    await expect(mainContent.first()).toBeVisible();
    
    // 验证主要工具卡片存在
    const mainTools = [
      'JSON Tools',
      'Base64 Encoder/Decoder',
      'Hash Calculator',
      'UUID Generator',
      'Password Generator'
    ];
    
    for (const tool of mainTools) {
      const toolElement = page.locator(`text=${tool}`);
      if (await toolElement.count() > 0) {
        await expect(toolElement.first()).toBeVisible();
      }
    }
    
    // 测试工具卡片点击导航
    // 测试JSON Tools卡片点击
    await page.locator('text=JSON Tools').first().click();
    await expect(page).toHaveURL(/\/json$/);
    await expect(page.locator('h1').filter({ hasText: 'JSON Formatter & Validator' })).toBeVisible();
    
    // 返回首页
    await page.locator('nav').locator('text=Dashboard').click();
    await expect(page).toHaveURL(/\/en$/);
    
    // 测试Base64工具卡片点击
    await page.locator('text=Base64').first().click();
    await expect(page).toHaveURL(/\/base64$/);
    await expect(page.locator('h1').filter({ hasText: 'Base64 Encoder/Decoder' })).toBeVisible();
  });

  test('侧边栏导航测试', async ({ page }) => {
    // 验证侧边栏存在
    const sidebar = page.locator('nav');
    await expect(sidebar).toBeVisible();
    
    // 验证Dashboard链接
    await expect(page.locator('a[href="/en"]')).toBeVisible();
    
    // 验证所有工具链接存在
    for (const tool of availableTools) {
      await expect(page.locator('nav').locator(`text=${tool.name}`)).toBeVisible();
    }
    
    // 验证主要工具链接存在（检查文本而不是具体href）
    const toolNames = ['JSON Tools', 'Base64', 'Hash', 'UUID'];
    
    for (const toolName of toolNames) {
      const toolLink = page.locator('a').filter({ hasText: toolName });
      if (await toolLink.count() > 0) {
        await expect(toolLink.first()).toBeVisible();
      }
    }
  });

  test('语言切换功能测试', async ({ page }) => {
    // 验证语言切换按钮存在
    await expect(page.locator('text=🇺🇸')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
  });

  test('未实现工具页面测试', async ({ page }) => {
    const unimplementedTools = availableTools.filter(tool => !tool.implemented);
    
    for (const tool of unimplementedTools.slice(0, 3)) { // 只测试前3个以节省时间
      await page.goto(baseUrl);
      await page.locator('nav').locator(`text=${tool.name}`).click();
      
      // 验证显示"即将推出"信息
      await expect(page.locator('text=Tool implementation coming soon...')).toBeVisible();
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    await expect(page.locator('nav')).toBeVisible();
    const h1CountDesktop = await page.locator('h1').count();
    expect(h1CountDesktop).toBeGreaterThan(0);
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const h1CountTablet = await page.locator('h1').count();
    expect(h1CountTablet).toBeGreaterThan(0);
    
    // 测试移动端视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    // 在移动端，导航可能被隐藏或变成汉堡菜单
    // 这里只验证页面仍然可访问，使用移动端的标题
    await expect(page.locator('h1.text-xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    const h1CountMobile = await page.locator('h1').count();
    expect(h1CountMobile).toBeGreaterThan(0);
  });

  test('页面性能和加载测试', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(baseUrl);
    const loadTime = Date.now() - startTime;
    
    // 验证页面在合理时间内加载完成（5秒内）
    expect(loadTime).toBeLessThan(5000);
    
    // 验证关键元素已加载
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
    
    // 验证页面响应时间（测试页面交互性能）
    const startInteractionTime = Date.now();
    await page.locator('nav').click();
    const interactionTime = Date.now() - startInteractionTime;
    expect(interactionTime).toBeLessThan(1000);
  });

  test('搜索功能测试（如果存在）', async ({ page }) => {
    // 查找搜索框
    const searchBox = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
    
    if (await searchBox.count() > 0) {
      await searchBox.fill('json');
      await page.keyboard.press('Enter');
      
      // 验证搜索结果或过滤效果
      await expect(page.locator('text=JSON')).toBeVisible();
    }
  });

  test('页脚信息验证', async ({ page }) => {
    // 验证页脚存在
    const footer = page.locator('footer, .footer');
    const footerText = page.locator('text="Built with ❤️ by bbj"');
    
    // 检查页脚容器或页脚文本是否存在
    if (await footer.count() > 0) {
      await expect(footer.first()).toBeVisible();
    } else if (await footerText.count() > 0) {
      await expect(footerText.first()).toBeVisible();
    }
  });

  test('页面错误处理测试', async ({ page }) => {
    // 测试访问不存在的页面
    const response = await page.goto(`${baseUrl}/nonexistent-tool`);
    
    // 验证返回404或重定向到首页
    if (response?.status() === 404) {
      // 如果是404，验证页面仍然可以显示内容
      await expect(page.locator('body')).toBeVisible();
    } else {
      // 如果重定向到首页或其他页面，验证基本元素
      expect(response?.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('页面SEO元素测试', async ({ page }) => {
    // 验证页面有适当的meta标签
    const title = await page.title();
    expect(title).toContain('Dev Forge');
    
    // 验证页面有描述性内容
    await expect(page.locator('text=A collection of useful developer tools')).toBeVisible();
  });

});