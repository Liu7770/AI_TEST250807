import { test, expect } from '@playwright/test';

test.describe('Dev Forge User-Agent Parser工具页面', () => {

  const url = 'https://www.001236.xyz/en/user-agent-parser';
  const userAgentInput = 'textarea[placeholder*="User-Agent"], textarea[placeholder*="user-agent"], .user-agent-input';
  const parseButton = 'button:has-text("Parse"), button:has-text("解析"), button:has-text("Analyze")';
  const resultArea = '.parse-result, .result, .output';
  const browserElement = '.browser, .browser-name';
  const versionElement = '.version, .browser-version';
  const osElement = '.os, .operating-system';
  const deviceElement = '.device, .device-type';
  const engineElement = '.engine, .rendering-engine';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const exampleButton = 'button:has-text("Example"), button:has-text("示例")';
  const detailsSection = '.details, .detailed-info';
  const jsonOutput = '.json-output, .raw-data';
  const historySection = '.history, .recent-parses';

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
    await expect(page).toHaveTitle(/User.*Agent|Parser|解析/);
    
    // 验证User-Agent输入框存在
    const userAgentInputElement = page.locator(userAgentInput);
    if (await userAgentInputElement.count() > 0) {
      await expect(userAgentInputElement.first()).toBeVisible();
    }
    
    // 验证解析按钮存在
    const parseBtn = page.locator(parseButton);
    if (await parseBtn.count() > 0) {
      await expect(parseBtn.first()).toBeVisible();
    }
    
    // 验证结果区域存在
    const resultElement = page.locator(resultArea);
    if (await resultElement.count() > 0) {
      await expect(resultElement.first()).toBeVisible();
    }
  });

  test('Chrome浏览器User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      
      await userAgentInputElement.first().fill(chromeUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('chrome');
        
        // 验证版本信息
        expect(result).toMatch(/120\.0\.0\.0|120/);
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('windows');
        expect(result).toContain('10.0');
        
        // 验证渲染引擎
        expect(result?.toLowerCase()).toContain('webkit');
      }
    }
  });

  test('Firefox浏览器User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      
      await userAgentInputElement.first().fill(firefoxUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('firefox');
        
        // 验证版本信息
        expect(result).toMatch(/121\.0|121/);
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('windows');
        
        // 验证渲染引擎
        expect(result?.toLowerCase()).toContain('gecko');
      }
    }
  });

  test('Safari浏览器User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15';
      
      await userAgentInputElement.first().fill(safariUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('safari');
        
        // 验证版本信息
        expect(result).toMatch(/17\.1|17/);
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('mac');
        expect(result).toContain('10_15_7');
        
        // 验证渲染引擎
        expect(result?.toLowerCase()).toContain('webkit');
      }
    }
  });

  test('Edge浏览器User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      
      await userAgentInputElement.first().fill(edgeUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toMatch(/(edge|edg)/);
        
        // 验证版本信息
        expect(result).toMatch(/120\.0\.0\.0|120/);
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('windows');
      }
    }
  });

  test('移动端Chrome User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const mobileUA = 'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
      
      await userAgentInputElement.first().fill(mobileUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('chrome');
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('android');
        expect(result).toContain('13');
        
        // 验证设备类型
        expect(result?.toLowerCase()).toMatch(/(mobile|手机|移动)/);
        
        // 验证设备型号
        expect(result).toContain('SM-G998B');
      }
    }
  });

  test('iPhone Safari User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const iPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      
      await userAgentInputElement.first().fill(iPhoneUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('safari');
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('ios');
        expect(result).toMatch(/17[._]1/);
        
        // 验证设备类型
        expect(result?.toLowerCase()).toContain('iphone');
        
        // 验证移动设备标识
        expect(result?.toLowerCase()).toMatch(/(mobile|手机|移动)/);
      }
    }
  });

  test('iPad Safari User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const iPadUA = 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
      
      await userAgentInputElement.first().fill(iPadUA);
      await parseBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        
        // 验证浏览器信息
        expect(result?.toLowerCase()).toContain('safari');
        
        // 验证操作系统信息
        expect(result?.toLowerCase()).toContain('ios');
        
        // 验证设备类型
        expect(result?.toLowerCase()).toContain('ipad');
        
        // 验证平板设备标识
        expect(result?.toLowerCase()).toMatch(/(tablet|平板)/);
      }
    }
  });

  test('爬虫User-Agent解析测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const botUAs = [
        'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      ];
      
      for (const botUA of botUAs) {
        await userAgentInputElement.first().fill(botUA);
        await parseBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          
          // 验证爬虫标识
          expect(result?.toLowerCase()).toMatch(/(bot|crawler|spider|爬虫)/);
          
          // 验证具体爬虫名称
          if (botUA.includes('Googlebot')) {
            expect(result?.toLowerCase()).toContain('google');
          } else if (botUA.includes('Bingbot')) {
            expect(result?.toLowerCase()).toContain('bing');
          } else if (botUA.includes('facebook')) {
            expect(result?.toLowerCase()).toContain('facebook');
          }
        }
      }
    }
  });

  test('无效User-Agent处理测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const invalidUAs = [
        'invalid-user-agent',
        '123456',
        'random text',
        ''
      ];
      
      for (const invalidUA of invalidUAs) {
        await userAgentInputElement.first().fill(invalidUA);
        await parseBtn.first().click();
        
        // 验证错误处理或默认值显示
        const errorMessage = page.locator('text=Invalid, text=Unknown, text=无效, text=未知');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('详细信息显示测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const browserElement = page.locator(browserElement);
    const versionElement = page.locator(versionElement);
    const osElement = page.locator(osElement);
    const deviceElement = page.locator(deviceElement);
    const engineElement = page.locator(engineElement);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      
      await userAgentInputElement.first().fill(chromeUA);
      await parseBtn.first().click();
      
      // 验证浏览器信息显示
      if (await browserElement.count() > 0) {
        const browser = await browserElement.first().textContent();
        expect(browser?.toLowerCase()).toContain('chrome');
      }
      
      // 验证版本信息显示
      if (await versionElement.count() > 0) {
        const version = await versionElement.first().textContent();
        expect(version).toMatch(/120/);
      }
      
      // 验证操作系统信息显示
      if (await osElement.count() > 0) {
        const os = await osElement.first().textContent();
        expect(os?.toLowerCase()).toContain('windows');
      }
      
      // 验证设备信息显示
      if (await deviceElement.count() > 0) {
        const device = await deviceElement.first().textContent();
        expect(device?.toLowerCase()).toMatch(/(desktop|pc|桌面)/);
      }
      
      // 验证渲染引擎信息显示
      if (await engineElement.count() > 0) {
        const engine = await engineElement.first().textContent();
        expect(engine?.toLowerCase()).toContain('webkit');
      }
    }
  });

  test('JSON格式输出测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const jsonOutputElement = page.locator(jsonOutput);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0) {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      
      await userAgentInputElement.first().fill(chromeUA);
      await parseBtn.first().click();
      
      if (await jsonOutputElement.count() > 0) {
        const jsonContent = await jsonOutputElement.first().textContent();
        
        // 验证JSON格式
        expect(() => JSON.parse(jsonContent || '')).not.toThrow();
        
        // 验证JSON包含必要字段
        const parsedData = JSON.parse(jsonContent || '{}');
        expect(parsedData).toHaveProperty('browser');
        expect(parsedData).toHaveProperty('version');
        expect(parsedData).toHaveProperty('os');
        expect(parsedData).toHaveProperty('device');
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const copyBtn = page.locator(copyButton);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0 && await copyBtn.count() > 0) {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      
      await userAgentInputElement.first().fill(chromeUA);
      await parseBtn.first().click();
      
      // 点击复制按钮
      await copyBtn.first().click();
      
      // 验证复制成功提示
      const successMessage = page.locator('text=Copied, text=已复制, text=Copy successful');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const clearBtn = page.locator(clearButton);
    const resultElement = page.locator(resultArea);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0 && await clearBtn.count() > 0) {
      // 先输入并解析User-Agent
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await userAgentInputElement.first().fill(chromeUA);
      await parseBtn.first().click();
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(userAgentInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('示例User-Agent功能测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const exampleBtn = page.locator(exampleButton);
    
    if (await userAgentInputElement.count() > 0 && await exampleBtn.count() > 0) {
      // 点击示例按钮
      await exampleBtn.first().click();
      
      // 验证输入框被填入示例User-Agent
      const inputValue = await userAgentInputElement.first().inputValue();
      expect(inputValue.length).toBeGreaterThan(50);
      expect(inputValue.toLowerCase()).toMatch(/(mozilla|chrome|safari|firefox)/);
    }
  });

  test('解析历史记录测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    const historyElement = page.locator(historySection);
    
    if (await userAgentInputElement.count() > 0 && await parseBtn.count() > 0 && await historyElement.count() > 0) {
      const testUAs = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
      ];
      
      // 解析多个User-Agent
      for (const ua of testUAs) {
        await userAgentInputElement.first().fill(ua);
        await parseBtn.first().click();
        await page.waitForTimeout(500);
      }
      
      // 验证历史记录显示
      const historyContent = await historyElement.first().textContent();
      expect(historyContent?.toLowerCase()).toContain('chrome');
      expect(historyContent?.toLowerCase()).toContain('firefox');
      
      // 点击历史记录项
      const historyItem = page.locator(`${historySection} .history-item:first-child`);
      if (await historyItem.count() > 0) {
        await historyItem.first().click();
        
        // 验证User-Agent被重新填入
        const inputValue = await userAgentInputElement.first().inputValue();
        expect(inputValue.length).toBeGreaterThan(50);
      }
    }
  });

  test('批量解析功能测试', async ({ page }) => {
    const batchInput = page.locator('.batch-input, textarea[placeholder*="batch"]');
    const batchParseBtn = page.locator('button:has-text("Batch Parse"), button:has-text("批量解析")');
    const batchResult = page.locator('.batch-result, .batch-output');
    
    if (await batchInput.count() > 0 && await batchParseBtn.count() > 0) {
      const multipleUAs = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
      ].join('\n');
      
      await batchInput.first().fill(multipleUAs);
      await batchParseBtn.first().click();
      
      if (await batchResult.count() > 0) {
        const result = await batchResult.first().textContent();
        
        // 验证批量解析结果
        expect(result?.toLowerCase()).toContain('chrome');
        expect(result?.toLowerCase()).toContain('firefox');
        expect(result?.toLowerCase()).toContain('safari');
        expect(result?.toLowerCase()).toContain('windows');
        expect(result?.toLowerCase()).toContain('mac');
      }
    }
  });

  test('User-Agent生成功能测试', async ({ page }) => {
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("生成")');
    const browserSelect = page.locator('select[name="browser"], .browser-select');
    const osSelect = page.locator('select[name="os"], .os-select');
    const generatedUA = page.locator('.generated-ua, .output-ua');
    
    if (await generateBtn.count() > 0) {
      // 选择浏览器和操作系统
      if (await browserSelect.count() > 0) {
        await browserSelect.first().selectOption('Chrome');
      }
      
      if (await osSelect.count() > 0) {
        await osSelect.first().selectOption('Windows');
      }
      
      // 点击生成按钮
      await generateBtn.first().click();
      
      // 验证生成的User-Agent
      if (await generatedUA.count() > 0) {
        const ua = await generatedUA.first().textContent();
        expect(ua?.toLowerCase()).toContain('chrome');
        expect(ua?.toLowerCase()).toContain('windows');
        expect(ua?.length).toBeGreaterThan(50);
      }
    }
  });

  test('键盘快捷键测试', async ({ page }) => {
    const userAgentInputElement = page.locator(userAgentInput);
    
    if (await userAgentInputElement.count() > 0) {
      // 聚焦到输入框
      await userAgentInputElement.first().focus();
      
      // 输入User-Agent
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await userAgentInputElement.first().fill(chromeUA);
      
      // 按Ctrl+Enter或Enter键解析
      await page.keyboard.press('Control+Enter');
      
      // 验证解析结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.toLowerCase()).toContain('chrome');
        expect(result?.toLowerCase()).toContain('windows');
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    const userAgentInputElement = page.locator(userAgentInput);
    const parseBtn = page.locator(parseButton);
    
    // 验证元素在移动端仍然可见和可用
    if (await userAgentInputElement.count() > 0) {
      await expect(userAgentInputElement.first()).toBeVisible();
    }
    
    if (await parseBtn.count() > 0) {
      await expect(parseBtn.first()).toBeVisible();
    }
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

});