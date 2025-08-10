import { test, expect, devices } from '@playwright/test';

test.describe('Dev Forge 跨浏览器兼容性测试', () => {

  const baseUrl = 'https://www.001236.xyz';

  // 测试不同浏览器的基本功能
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`${browserName} - 基本功能测试`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto(`${baseUrl}/en`);
      
      // 验证页面标题
      await expect(page).toHaveTitle(/Dev Forge|bbj dev-forge/);
      
      // 验证主要导航元素
      await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
      await expect(page.locator('nav').locator('text=Base64 Tools')).toBeVisible();
      
      // 测试JSON工具
      await page.locator('nav').locator('text=JSON Tools').click();
      await expect(page.locator('textarea')).toBeVisible();
      
      // 输入测试数据
      await page.locator('textarea').fill('{"test": "browser_compatibility"}');
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      // 验证格式化结果
      await expect(page.locator('pre')).toBeVisible();
      
      await context.close();
    });
  });

  // 测试移动设备兼容性
  const mobileDevices = [
    { ...devices['iPhone 12'], name: 'iPhone 12' },
    { ...devices['Pixel 5'], name: 'Pixel 5' },
    { ...devices['iPad Air'], name: 'iPad Air' }
  ];

  mobileDevices.forEach(device => {
    test(`移动设备兼容性 - ${device.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device
      });
      const page = await context.newPage();
      
      await page.goto(`${baseUrl}/en`);
      
      // 验证移动端响应式布局
      const viewport = page.viewportSize();
      console.log(`${device.name} viewport: ${viewport?.width}x${viewport?.height}`);
      
      // 验证移动端导航
      if (viewport && viewport.width < 768) {
        // 移动端可能有汉堡菜单或不同的布局
        await expect(page.locator('h1.text-xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      } else {
        await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      }
      
      // 测试触摸交互
      await page.locator('nav').locator('text=JSON Tools').tap();
      await expect(page.locator('textarea')).toBeVisible();
      
      // 测试移动端输入
      await page.locator('textarea').fill('{"mobile": "test"}');
      await page.locator('button').filter({ hasText: 'Format' }).tap();
      
      await page.waitForTimeout(1000);
      await expect(page.locator('pre')).toBeVisible();
      
      await context.close();
    });
  });

  // 测试不同屏幕分辨率
  const resolutions = [
    { width: 1920, height: 1080, name: 'Full HD' },
    { width: 1366, height: 768, name: 'HD' },
    { width: 1024, height: 768, name: 'XGA' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 375, height: 667, name: 'Mobile' }
  ];

  resolutions.forEach(resolution => {
    test(`分辨率兼容性 - ${resolution.name} (${resolution.width}x${resolution.height})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: resolution.width, height: resolution.height }
      });
      const page = await context.newPage();
      
      await page.goto(`${baseUrl}/en`);
      
      // 验证布局适应性
      const h1Selector = resolution.width < 768 ? 'h1.text-xl' : 'h1.text-2xl';
      await expect(page.locator(h1Selector).filter({ hasText: 'bbj dev-forge' })).toBeVisible();
      
      // 验证导航可见性
      await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
      
      // 测试工具功能
      await page.locator('nav').locator('text=Base64 Tools').click();
      await expect(page.locator('textarea')).toBeVisible();
      
      // 验证按钮布局
      await expect(page.locator('div.p-1 button').filter({ hasText: 'Encode' })).toBeVisible();
      await expect(page.locator('div.p-1 button').filter({ hasText: 'Decode' })).toBeVisible();
      
      await context.close();
    });
  });

  // 测试JavaScript兼容性
  test('JavaScript功能兼容性测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 测试现代JavaScript特性
    const jsCompatibility = await page.evaluate(() => {
      const results: any = {};
      
      // 测试ES6+特性
      try {
        // Arrow functions
        const arrow = () => 'arrow';
        results.arrowFunctions = arrow() === 'arrow';
        
        // Template literals
        const template = `template ${1 + 1}`;
        results.templateLiterals = template === 'template 2';
        
        // Destructuring
        const [a, b] = [1, 2];
        results.destructuring = a === 1 && b === 2;
        
        // Promises
        results.promises = typeof Promise !== 'undefined';
        
        // Fetch API
        results.fetchAPI = typeof fetch !== 'undefined';
        
        // Local Storage
        results.localStorage = typeof localStorage !== 'undefined';
        
        // JSON support
        results.jsonSupport = typeof JSON !== 'undefined' && typeof JSON.parse === 'function';
        
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    console.log('JavaScript compatibility results:', jsCompatibility);
    
    // 验证关键功能可用
    expect(jsCompatibility.jsonSupport).toBe(true);
    expect(jsCompatibility.localStorage).toBe(true);
    
    // 测试实际功能
    await page.locator('textarea').fill('{"js_test": true}');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    await page.waitForTimeout(1000);
    await expect(page.locator('pre')).toBeVisible();
  });

  // 测试CSS兼容性
  test('CSS样式兼容性测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 检查CSS特性支持
    const cssCompatibility = await page.evaluate(() => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      const results: any = {};
      
      try {
        // Flexbox
        testElement.style.display = 'flex';
        results.flexbox = getComputedStyle(testElement).display === 'flex';
        
        // Grid
        testElement.style.display = 'grid';
        results.grid = getComputedStyle(testElement).display === 'grid';
        
        // CSS Variables
        testElement.style.setProperty('--test-var', 'test');
        results.cssVariables = testElement.style.getPropertyValue('--test-var') === 'test';
        
        // Transform
        testElement.style.transform = 'translateX(10px)';
        results.transform = testElement.style.transform.includes('translateX');
        
        // Transition
        testElement.style.transition = 'all 0.3s';
        results.transition = testElement.style.transition.includes('0.3s');
        
      } catch (error) {
        results.error = error.message;
      } finally {
        document.body.removeChild(testElement);
      }
      
      return results;
    });
    
    console.log('CSS compatibility results:', cssCompatibility);
    
    // 验证关键CSS特性
    expect(cssCompatibility.flexbox).toBe(true);
    
    // 验证页面样式正确渲染
    const headerElement = page.locator('h1').first();
    await expect(headerElement).toBeVisible();
    
    // 检查字体和颜色渲染
    const computedStyles = await headerElement.evaluate(el => {
      const styles = getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        color: styles.color
      };
    });
    
    console.log('Header computed styles:', computedStyles);
    expect(computedStyles.fontSize).toBeTruthy();
  });

  // 测试网络条件兼容性
  test('网络条件兼容性测试', async ({ browser }) => {
    const networkConditions = [
      { name: 'Fast 3G', downloadThroughput: 1.5 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
      { name: 'Slow 3G', downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8, latency: 400 }
    ];
    
    for (const condition of networkConditions) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // 模拟网络条件
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, condition.latency));
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto(`${baseUrl}/en`);
      const loadTime = Date.now() - startTime;
      
      console.log(`${condition.name} load time: ${loadTime}ms`);
      
      // 验证页面在慢网络下仍能正常加载
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('nav').locator('text=JSON Tools')).toBeVisible();
      
      // 测试功能在慢网络下的表现
      await page.locator('nav').locator('text=JSON Tools').click();
      await page.locator('textarea').fill('{"network": "test"}');
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      await expect(page.locator('pre')).toBeVisible({ timeout: 5000 });
      
      await context.close();
    }
  });

  // 测试用户代理兼容性
  test('用户代理兼容性测试', async ({ browser }) => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ];
    
    for (const userAgent of userAgents) {
      const context = await browser.newContext({ userAgent });
      const page = await context.newPage();
      
      await page.goto(`${baseUrl}/en`);
      
      // 验证页面对不同用户代理的响应
      await expect(page.locator('h1').first()).toBeVisible();
      
      // 检查用户代理是否被正确识别
      const detectedUA = await page.evaluate(() => navigator.userAgent);
      expect(detectedUA).toBe(userAgent);
      
      // 测试功能正常工作
      await page.locator('nav').locator('text=JSON Tools').click();
      await page.locator('textarea').fill('{"ua_test": true}');
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      await page.waitForTimeout(1000);
      await expect(page.locator('pre')).toBeVisible();
      
      console.log(`User Agent test passed: ${userAgent.split(' ')[0]}`);
      
      await context.close();
    }
  });

  // 测试语言和地区兼容性
  test('语言地区兼容性测试', async ({ browser }) => {
    const locales = [
      { locale: 'en-US', timezone: 'America/New_York' },
      { locale: 'zh-CN', timezone: 'Asia/Shanghai' },
      { locale: 'ja-JP', timezone: 'Asia/Tokyo' },
      { locale: 'de-DE', timezone: 'Europe/Berlin' }
    ];
    
    for (const config of locales) {
      const context = await browser.newContext({
        locale: config.locale,
        timezoneId: config.timezone
      });
      const page = await context.newPage();
      
      await page.goto(`${baseUrl}/en`);
      
      // 验证页面在不同地区设置下正常工作
      await expect(page.locator('h1').first()).toBeVisible();
      
      // 检查地区设置
      const detectedLocale = await page.evaluate(() => {
        return {
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      });
      
      console.log(`Locale test - ${config.locale}:`, detectedLocale);
      
      // 测试日期时间相关功能（如果有）
      await page.locator('nav').locator('text=JSON Tools').click();
      
      const testData = {
        timestamp: new Date().toISOString(),
        locale: config.locale,
        timezone: config.timezone
      };
      
      await page.locator('textarea').fill(JSON.stringify(testData));
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      await page.waitForTimeout(1000);
      await expect(page.locator('pre')).toBeVisible();
      
      await context.close();
    }
  });

});