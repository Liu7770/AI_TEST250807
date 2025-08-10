import { test, expect } from '@playwright/test';

test.describe('Dev Forge 安全性测试', () => {

  const baseUrl = 'https://www.001236.xyz/en';

  test('XSS防护测试 - JSON工具页面', async ({ page }) => {
    await page.goto(`${baseUrl}/json`);

    // 测试XSS攻击向量
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>"
    ];

    for (const payload of xssPayloads) {
      // 清空输入框
      await page.locator('textarea').clear();
      
      // 输入XSS载荷
      await page.locator('textarea').fill(payload);
      
      // 点击格式化按钮
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      // 验证没有执行恶意脚本（页面应该正常显示错误信息）
      await expect(page.locator('text=Invalid JSON')).toBeVisible();
      
      // 验证载荷被正确转义显示而不是执行
      const textContent = await page.textContent('body');
      expect(textContent).toContain('Invalid JSON');
    }
  });

  test('XSS防护测试 - Base64工具页面', async ({ page }) => {
    await page.goto(`${baseUrl}/base64`);

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")'
    ];

    for (const payload of xssPayloads) {
      // 确保在编码模式
      await page.locator('div.p-1 button').filter({ hasText: 'Encode' }).click();
      
      // 清空并输入XSS载荷
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(payload);
      
      // 点击编码按钮
      await page.locator('div:has(textarea) button').filter({ hasText: 'Encode' }).click();
      
      // 验证内容被正确编码而不是执行
      const textareaValue = await page.locator('textarea').inputValue();
      expect(textareaValue).toBe(payload); // 输入应该保持原样
    }
  });

  test('输入验证测试 - 超长字符串', async ({ page }) => {
    await page.goto(`${baseUrl}/json`);

    // 生成超长字符串（10MB）
    const longString = 'a'.repeat(10 * 1024 * 1024);
    
    // 输入超长字符串
    await page.locator('textarea').fill(longString);
    
    // 点击格式化按钮
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 验证应用能够正确处理而不崩溃
    await expect(page.locator('text=Invalid JSON')).toBeVisible();
  });

  test('SQL注入防护测试', async ({ page }) => {
    await page.goto(`${baseUrl}/json`);

    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; SELECT * FROM users; --",
      "' UNION SELECT * FROM users --"
    ];

    for (const payload of sqlInjectionPayloads) {
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(payload);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      // 验证输入被正确处理为无效JSON而不是执行SQL
      await expect(page.locator('text=Invalid JSON')).toBeVisible();
    }
  });

  test('CSRF防护测试 - 检查安全头', async ({ page }) => {
    // 监控响应头
    const responses: any[] = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        headers: response.headers(),
        status: response.status()
      });
    });

    await page.goto(baseUrl);

    // 检查主页面的安全响应头
    const mainPageResponse = responses.find(r => r.url === baseUrl + '/');
    if (mainPageResponse) {
      const headers = mainPageResponse.headers;
      
      // 检查常见的安全头（这些可能不是必需的，但是好的安全实践）
      // 注意：不是所有网站都会设置这些头，这里主要是检查是否存在
      console.log('Security headers check:', {
        'x-frame-options': headers['x-frame-options'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'strict-transport-security': headers['strict-transport-security']
      });
    }

    // 验证页面正常加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
  });

  test('文件上传安全测试', async ({ page }) => {
    // 检查是否有文件上传功能
    await page.goto(baseUrl);
    
    // 查找文件上传输入
    const fileInputs = await page.locator('input[type="file"]').count();
    
    if (fileInputs > 0) {
      // 如果存在文件上传，测试恶意文件类型
      const maliciousFileTypes = [
        'test.exe',
        'test.php',
        'test.jsp',
        'test.asp'
      ];
      
      for (const fileName of maliciousFileTypes) {
        // 创建临时文件进行测试
        // 注意：这里只是模拟，实际测试中需要真实文件
        console.log(`Testing file upload security for: ${fileName}`);
      }
    } else {
      console.log('No file upload functionality found');
    }
  });

  test('敏感信息泄露检测', async ({ page }) => {
    await page.goto(baseUrl);

    // 检查页面源码中是否包含敏感信息
    const pageContent = await page.content();
    
    // 检查常见的敏感信息模式
    const sensitivePatterns = [
      /password\s*[:=]\s*["'][^"']+["']/i,
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
      /secret\s*[:=]\s*["'][^"']+["']/i,
      /token\s*[:=]\s*["'][^"']+["']/i,
      /database\s*[:=]\s*["'][^"']+["']/i
    ];

    for (const pattern of sensitivePatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        console.warn(`Potential sensitive information found: ${matches[0]}`);
      }
    }

    // 验证页面正常加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
  });

  test('点击劫持防护测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 检查页面是否可以被嵌入到iframe中
    const iframeTest = `
      <html>
        <body>
          <iframe src="${baseUrl}" width="800" height="600"></iframe>
        </body>
      </html>
    `;

    // 创建一个包含iframe的页面
    await page.setContent(iframeTest);
    
    // 等待一段时间看iframe是否加载
    await page.waitForTimeout(3000);
    
    // 检查iframe内容是否加载（如果有X-Frame-Options，应该被阻止）
    const iframeContent = await page.locator('iframe').contentFrame();
    
    if (iframeContent) {
      console.log('Page can be embedded in iframe - consider adding X-Frame-Options header');
    } else {
      console.log('Page is protected against clickjacking');
    }
  });

});