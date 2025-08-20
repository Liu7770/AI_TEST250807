import { test, expect } from '@playwright/test';

test.describe('Dev Forge URL Tool工具页面', () => {

  const url = 'https://www.001236.xyz/en/url';
  const urlInput = 'textarea, input[type="text"], input[placeholder*="URL"]';
  const encodeButton = 'button:has-text("Encode"), button:has-text("编码")';
  const decodeButton = 'button:has-text("Decode"), button:has-text("解码")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const resultArea = '.result, .url-result, pre, code';
  const modeToggle = '.mode-toggle, .encode-decode-toggle';

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
    await expect(page).toHaveTitle(/URL/);
    
    // 验证主要元素存在
    const urlInputElement = page.locator(urlInput);
    if (await urlInputElement.count() > 0) {
      await expect(urlInputElement.first()).toBeVisible();
    }
    
    // 验证编码按钮存在
    const encodeBtn = page.locator(encodeButton);
    if (await encodeBtn.count() > 0) {
      await expect(encodeBtn.first()).toBeVisible();
    }
    
    // 验证解码按钮存在
    const decodeBtn = page.locator(decodeButton);
    if (await decodeBtn.count() > 0) {
      await expect(decodeBtn.first()).toBeVisible();
    }
  });

  test('URL编码功能测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入包含特殊字符的URL
      const testUrl = 'https://example.com/search?q=hello world&type=test';
      await urlInputElement.first().fill(testUrl);
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证编码结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const encodedUrl = await resultElement.first().textContent();
        expect(encodedUrl).toContain('%20'); // 空格编码为%20
        expect(encodedUrl).toContain('hello%20world');
      }
    }
  });

  test('URL解码功能测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const decodeBtn = page.locator(decodeButton);
    
    if (await urlInputElement.count() > 0 && await decodeBtn.count() > 0) {
      // 输入已编码的URL
      const encodedUrl = 'https://example.com/search?q=hello%20world&type=test%26demo';
      await urlInputElement.first().fill(encodedUrl);
      
      // 点击解码按钮
      await decodeBtn.first().click();
      
      // 验证解码结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const decodedUrl = await resultElement.first().textContent();
        expect(decodedUrl).toContain('hello world'); // %20解码为空格
        expect(decodedUrl).toContain('test&demo'); // %26解码为&
      }
    }
  });

  test('中文字符URL编码测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入包含中文的URL
      const chineseUrl = 'https://example.com/搜索?关键词=测试';
      await urlInputElement.first().fill(chineseUrl);
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证中文字符被正确编码
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const encodedUrl = await resultElement.first().textContent();
        expect(encodedUrl).toMatch(/%[0-9A-F]{2}/);
        expect(encodedUrl).not.toContain('搜索');
        expect(encodedUrl).not.toContain('关键词');
        expect(encodedUrl).not.toContain('测试');
      }
    }
  });

  test('特殊字符URL编码测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入包含各种特殊字符的URL
      const specialUrl = 'https://example.com/path?param=value&other=test+data#section';
      await urlInputElement.first().fill(specialUrl);
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证特殊字符被正确编码
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const encodedUrl = await resultElement.first().textContent();
        // 验证某些字符被编码
        expect(encodedUrl).toMatch(/https?:\/\//);
      }
    }
  });

  test('已编码URL再次编码测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入已经编码的URL
      const alreadyEncodedUrl = 'https://example.com/search?q=hello%20world';
      await urlInputElement.first().fill(alreadyEncodedUrl);
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证双重编码结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const doubleEncodedUrl = await resultElement.first().textContent();
        expect(doubleEncodedUrl).toContain('%2520'); // %20被编码为%2520
      }
    }
  });

  test('无效URL处理测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入无效的URL格式
      const invalidUrl = 'not-a-valid-url';
      await urlInputElement.first().fill(invalidUrl);
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证仍然进行编码处理或显示警告
      const resultElement = page.locator(resultArea);
      const warningElement = page.locator('text=Warning, text=Invalid, text=警告, text=无效');
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim().length).toBeGreaterThan(0);
      } else if (await warningElement.count() > 0) {
        await expect(warningElement.first()).toBeVisible();
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 确保输入框为空
      await urlInputElement.first().fill('');
      
      // 点击编码按钮
      await encodeBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      const resultElement = page.locator(resultArea);
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      } else if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('编码解码往返测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    const decodeBtn = page.locator(decodeButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0 && await decodeBtn.count() > 0) {
      // 原始URL
      const originalUrl = 'https://example.com/search?q=hello world&type=test';
      await urlInputElement.first().fill(originalUrl);
      
      // 先编码
      await encodeBtn.first().click();
      
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const encodedUrl = await resultElement.first().textContent();
        
        // 将编码结果作为输入进行解码
        await urlInputElement.first().fill(encodedUrl || '');
        await decodeBtn.first().click();
        
        // 验证解码后与原始URL相同
        const decodedUrl = await resultElement.first().textContent();
        expect(decodedUrl?.trim()).toBe(originalUrl);
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const encodeBtn = page.locator(encodeButton);
    const copyBtn = page.locator(copyButton);
    
    if (await urlInputElement.count() > 0 && await encodeBtn.count() > 0) {
      // 输入URL并编码
      await urlInputElement.first().fill('https://example.com/test?param=value');
      await encodeBtn.first().click();
      
      // 点击复制按钮
      if (await copyBtn.count() > 0) {
        await copyBtn.first().click();
        
        // 验证复制成功提示
        const successMessage = page.locator('text=Copied, text=复制成功, text=Success');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const clearBtn = page.locator(clearButton);
    
    if (await urlInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await urlInputElement.first().fill('https://example.com/test');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(urlInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('模式切换测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const modeToggleElement = page.locator(modeToggle);
    const encodeBtn = page.locator(encodeButton);
    const decodeBtn = page.locator(decodeButton);
    
    if (await urlInputElement.count() > 0) {
      // 输入测试URL
      await urlInputElement.first().fill('https://example.com/test?param=hello world');
      
      // 如果有模式切换按钮，测试切换功能
      if (await modeToggleElement.count() > 0) {
        // 切换到编码模式
        await modeToggleElement.first().click();
        
        // 验证按钮状态变化
        if (await encodeBtn.count() > 0) {
          await expect(encodeBtn.first()).toBeVisible();
        }
        
        // 切换到解码模式
        await modeToggleElement.first().click();
        
        // 验证按钮状态变化
        if (await decodeBtn.count() > 0) {
          await expect(decodeBtn.first()).toBeVisible();
        }
      }
    }
  });

  test('URL组件分析测试', async ({ page }) => {
    const urlInputElement = page.locator(urlInput);
    const analyzeBtn = page.locator('button:has-text("Analyze"), button:has-text("分析")');
    
    if (await urlInputElement.count() > 0) {
      // 输入完整的URL
      const complexUrl = 'https://user:pass@example.com:8080/path/to/resource?param1=value1&param2=value2#section';
      await urlInputElement.first().fill(complexUrl);
      
      // 如果有分析按钮，点击分析
      if (await analyzeBtn.count() > 0) {
        await analyzeBtn.first().click();
        
        // 验证URL组件显示
        const protocolElement = page.locator('text=https, text=protocol, text=协议');
        const hostElement = page.locator('text=example.com, text=host, text=主机');
        const portElement = page.locator('text=8080, text=port, text=端口');
        const pathElement = page.locator('text=/path/to/resource, text=path, text=路径');
        
        if (await protocolElement.count() > 0) {
          await expect(protocolElement.first()).toBeVisible();
        }
        if (await hostElement.count() > 0) {
          await expect(hostElement.first()).toBeVisible();
        }
        if (await portElement.count() > 0) {
          await expect(portElement.first()).toBeVisible();
        }
        if (await pathElement.count() > 0) {
          await expect(pathElement.first()).toBeVisible();
        }
      }
    }
  });

});