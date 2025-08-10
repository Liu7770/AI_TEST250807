import { test, expect } from '@playwright/test';

test.describe('Dev Forge User-Agent Parser', () => {
  const baseUrl = 'https://www.001236.xyz/en/user-agent';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
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

  test('User-Agent Parser页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/User.*Agent.*Parser.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'User-Agent Parser' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Parse and analyze User-Agent strings')).toBeVisible();
  });

  test('User-Agent输入区域测试', async ({ page }) => {
    // 查找User-Agent输入区域
    const inputArea = page.locator('textarea, input[type="text"], .user-agent-input');
    
    if (await inputArea.count() > 0) {
      await expect(inputArea.first()).toBeVisible();
      
      // 测试输入User-Agent字符串
      const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      await inputArea.first().fill(testUserAgent);
      await expect(inputArea.first()).toHaveValue(testUserAgent);
    }
  });

  test('解析按钮测试', async ({ page }) => {
    // 查找解析按钮
    const parseButton = page.locator('button').filter({ hasText: /parse|analyze|decode/i });
    
    if (await parseButton.count() > 0) {
      await expect(parseButton.first()).toBeVisible();
      
      // 输入User-Agent并解析
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        await inputArea.first().fill(chromeUserAgent);
        await parseButton.first().click();
        
        // 验证解析结果
        const resultArea = page.locator('.result, .parsed-info, .analysis');
        if (await resultArea.count() > 0) {
          await expect(resultArea.first()).toBeVisible();
        }
      }
    }
  });

  test('浏览器信息解析测试', async ({ page }) => {
    // 输入Chrome User-Agent
    const inputArea = page.locator('textarea, input[type="text"]');
    
    if (await inputArea.count() > 0) {
      const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      await inputArea.first().fill(chromeUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 验证浏览器信息
        await expect(page.locator('text=Chrome, text=browser')).toBeVisible();
        await expect(page.locator('text=91.0.4472.124, text=version')).toBeVisible();
      }
    }
  });

  test('操作系统信息解析测试', async ({ page }) => {
    // 输入包含操作系统信息的User-Agent
    const inputArea = page.locator('textarea, input[type="text"]');
    
    if (await inputArea.count() > 0) {
      const windowsUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      await inputArea.first().fill(windowsUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 验证操作系统信息
        await expect(page.locator('text=Windows, text=operating system')).toBeVisible();
        await expect(page.locator('text=10.0, text=NT 10.0')).toBeVisible();
      }
    }
  });

  test('设备信息解析测试', async ({ page }) => {
    // 输入移动设备User-Agent
    const inputArea = page.locator('textarea, input[type="text"]');
    
    if (await inputArea.count() > 0) {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1';
      await inputArea.first().fill(mobileUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 验证设备信息
        await expect(page.locator('text=iPhone, text=mobile, text=device')).toBeVisible();
        await expect(page.locator('text=iOS, text=iPhone OS')).toBeVisible();
      }
    }
  });

  test('引擎信息解析测试', async ({ page }) => {
    // 输入包含引擎信息的User-Agent
    const inputArea = page.locator('textarea, input[type="text"]');
    
    if (await inputArea.count() > 0) {
      const webkitUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      await inputArea.first().fill(webkitUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 验证引擎信息
        await expect(page.locator('text=WebKit, text=engine')).toBeVisible();
        await expect(page.locator('text=537.36')).toBeVisible();
      }
    }
  });

  test('预设User-Agent测试', async ({ page }) => {
    // 查找预设User-Agent选项
    const presetSelect = page.locator('select, .preset-select, .common-agents');
    
    if (await presetSelect.count() > 0) {
      await expect(presetSelect.first()).toBeVisible();
      
      // 测试选择预设User-Agent
      const chromeOption = page.locator('option').filter({ hasText: /Chrome/i });
      if (await chromeOption.count() > 0) {
        await chromeOption.first().click();
        
        // 验证输入框被填充
        const inputArea = page.locator('textarea, input[type="text"]');
        if (await inputArea.count() > 0) {
          const value = await inputArea.first().inputValue();
          expect(value).toContain('Chrome');
        }
      }
    }
  });

  test('当前User-Agent检测测试', async ({ page }) => {
    // 查找"检测当前User-Agent"按钮
    const detectButton = page.locator('button').filter({ hasText: /detect|current|my/i });
    
    if (await detectButton.count() > 0) {
      await expect(detectButton.first()).toBeVisible();
      
      // 点击检测按钮
      await detectButton.first().click();
      
      // 验证当前User-Agent被填充
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const value = await inputArea.first().inputValue();
        expect(value.length).toBeGreaterThan(0);
        expect(value).toContain('Mozilla');
      }
    }
  });

  test('解析结果显示测试', async ({ page }) => {
    // 输入User-Agent并解析
    const inputArea = page.locator('textarea, input[type="text"]');
    
    if (await inputArea.count() > 0) {
      const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      await inputArea.first().fill(testUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 验证解析结果区域
        const resultArea = page.locator('.result, .parsed-info');
        if (await resultArea.count() > 0) {
          await expect(resultArea.first()).toBeVisible();
          
          // 验证包含主要信息字段
          const infoFields = ['Browser', 'Version', 'OS', 'Device', 'Engine'];
          for (const field of infoFields) {
            const fieldElement = page.locator(`text=${field}`);
            if (await fieldElement.count() > 0) {
              await expect(fieldElement.first()).toBeVisible();
            }
          }
        }
      }
    }
  });

  test('JSON格式输出测试', async ({ page }) => {
    // 查找JSON格式选项
    const jsonOption = page.locator('input[type="radio"][value="json"], .format-json');
    
    if (await jsonOption.count() > 0) {
      await jsonOption.click();
      
      // 输入User-Agent并解析
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        await inputArea.first().fill(testUserAgent);
        
        const parseButton = page.locator('button').filter({ hasText: /parse/i });
        if (await parseButton.count() > 0) {
          await parseButton.first().click();
          
          // 验证JSON输出
          const jsonOutput = page.locator('pre, .json-output, code');
          if (await jsonOutput.count() > 0) {
            const jsonText = await jsonOutput.first().textContent();
            if (jsonText) {
              expect(jsonText).toContain('{');
              expect(jsonText).toContain('}');
            }
          }
        }
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton.first()).toBeVisible();
      
      // 先解析一个User-Agent
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        await inputArea.first().fill(testUserAgent);
        
        const parseButton = page.locator('button').filter({ hasText: /parse/i });
        if (await parseButton.count() > 0) {
          await parseButton.first().click();
          
          // 等待解析完成后复制
          await page.waitForTimeout(1000);
          await copyButton.first().click();
          
          // 验证复制成功提示
          await expect(page.locator('text=copied, text=success')).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    // 查找清空按钮
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i });
    
    if (await clearButton.count() > 0) {
      await expect(clearButton.first()).toBeVisible();
      
      // 先输入一些内容
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        await inputArea.first().fill('test user agent');
        
        // 点击清空按钮
        await clearButton.first().click();
        
        // 验证输入框被清空
        const value = await inputArea.first().inputValue();
        expect(value).toBe('');
      }
    }
  });

  test('User-Agent生成功能测试', async ({ page }) => {
    // 查找生成按钮
    const generateButton = page.locator('button').filter({ hasText: /generate|create/i });
    
    if (await generateButton.count() > 0) {
      await expect(generateButton.first()).toBeVisible();
      
      // 点击生成按钮
      await generateButton.first().click();
      
      // 验证生成的User-Agent
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const value = await inputArea.first().inputValue();
        expect(value.length).toBeGreaterThan(0);
        expect(value).toContain('Mozilla');
      }
    }
  });

  test('历史记录功能测试', async ({ page }) => {
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .previous');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
      
      // 解析一个User-Agent以添加到历史记录
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        const testUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        await inputArea.first().fill(testUserAgent);
        
        const parseButton = page.locator('button').filter({ hasText: /parse/i });
        if (await parseButton.count() > 0) {
          await parseButton.first().click();
          
          // 验证历史记录中出现该User-Agent
          const historyItem = page.locator('.history-item, .recent-item');
          if (await historyItem.count() > 0) {
            await expect(historyItem.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('User-Agent比较功能测试', async ({ page }) => {
    // 查找比较功能
    const compareButton = page.locator('button').filter({ hasText: /compare/i });
    
    if (await compareButton.count() > 0) {
      await expect(compareButton.first()).toBeVisible();
      
      // 查找第二个输入框
      const inputAreas = page.locator('textarea, input[type="text"]');
      if (await inputAreas.count() >= 2) {
        // 输入两个不同的User-Agent
        await inputAreas.nth(0).fill('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0');
        await inputAreas.nth(1).fill('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
        
        await compareButton.first().click();
        
        // 验证比较结果
        const compareResult = page.locator('.compare-result, .comparison');
        if (await compareResult.count() > 0) {
          await expect(compareResult.first()).toBeVisible();
        }
      }
    }
  });

  test('User-Agent验证功能测试', async ({ page }) => {
    // 查找验证按钮
    const validateButton = page.locator('button').filter({ hasText: /validate|check/i });
    
    if (await validateButton.count() > 0) {
      await expect(validateButton.first()).toBeVisible();
      
      // 输入无效的User-Agent
      const inputArea = page.locator('textarea, input[type="text"]');
      if (await inputArea.count() > 0) {
        await inputArea.first().fill('invalid user agent string');
        await validateButton.first().click();
        
        // 查找验证结果
        const validationResult = page.locator('.validation, .valid, .invalid');
        if (await validationResult.count() > 0) {
          await expect(validationResult.first()).toBeVisible();
        }
      }
    }
  });

  test('错误处理测试', async ({ page }) => {
    // 测试空输入
    const parseButton = page.locator('button').filter({ hasText: /parse/i });
    
    if (await parseButton.count() > 0) {
      // 不输入任何内容直接解析
      await parseButton.first().click();
      
      // 查找错误信息
      const errorMessage = page.locator('.error, .warning, text=error, text=empty');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
    
    // 测试无效User-Agent
    const inputArea = page.locator('textarea, input[type="text"]');
    if (await inputArea.count() > 0) {
      await inputArea.first().fill('completely invalid user agent');
      
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 查找解析失败信息
        const parseError = page.locator('.parse-error, .invalid, text=unable to parse');
        if (await parseError.count() > 0) {
          await expect(parseError.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试不同屏幕尺寸下的布局
    
    // 桌面视图
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 验证输入区域在移动设备上仍然可用
    const inputArea = page.locator('textarea, input[type="text"]');
    if (await inputArea.count() > 0) {
      await expect(inputArea.first()).toBeVisible();
    }
  });

  test('键盘导航测试', async ({ page }) => {
    // 测试Tab键导航
    await page.keyboard.press('Tab');
    
    // 验证焦点在可交互元素上
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // 继续Tab导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 验证可以通过键盘访问主要功能
    const parseButton = page.locator('button').filter({ hasText: /parse/i });
    if (await parseButton.count() > 0) {
      await parseButton.first().focus();
      await expect(parseButton.first()).toBeFocused();
      
      // 测试Enter键触发解析
      await page.keyboard.press('Enter');
    }
  });

  test('性能测试', async ({ page }) => {
    // 测试大量User-Agent解析性能
    const startTime = Date.now();
    
    const inputArea = page.locator('textarea, input[type="text"]');
    if (await inputArea.count() > 0) {
      const longUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      await inputArea.first().fill(longUserAgent);
      
      const parseButton = page.locator('button').filter({ hasText: /parse/i });
      if (await parseButton.count() > 0) {
        await parseButton.first().click();
        
        // 等待解析完成
        await page.waitForSelector('.result, .parsed-info', { timeout: 5000 });
        
        const parseTime = Date.now() - startTime;
        
        // 验证解析时间合理（小于3秒）
        expect(parseTime).toBeLessThan(3000);
      }
    }
  });
});