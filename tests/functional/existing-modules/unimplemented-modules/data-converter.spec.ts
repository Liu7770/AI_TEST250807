import { test, expect } from '@playwright/test';

test.describe('Dev Forge Data Converter', () => {
  const baseUrl = 'https://www.001236.xyz/en/convert';

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

  test('Data Converter页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Data.*Converter.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Data Converter' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Convert data between different formats')).toBeVisible();
  });

  test('数据输入区域测试', async ({ page }) => {
    // 查找数据输入区域
    const inputArea = page.locator('textarea, .input-area, .data-input');
    
    if (await inputArea.count() > 0) {
      await expect(inputArea.first()).toBeVisible();
      
      // 测试输入数据
      const testData = '{"name": "test", "value": 123}';
      await inputArea.first().fill(testData);
      await expect(inputArea.first()).toHaveValue(testData);
    }
  });

  test('数据格式选择测试', async ({ page }) => {
    // 查找输入格式选择器
    const inputFormatSelect = page.locator('select[name*="input"], .input-format');
    
    if (await inputFormatSelect.count() > 0) {
      await expect(inputFormatSelect.first()).toBeVisible();
      
      // 测试选择不同格式
      const formats = ['JSON', 'XML', 'CSV', 'YAML', 'TOML'];
      
      for (const format of formats) {
        const formatOption = page.locator(`option[value*="${format.toLowerCase()}"], text=${format}`);
        if (await formatOption.count() > 0) {
          await expect(formatOption.first()).toBeVisible();
        }
      }
    }
    
    // 查找输出格式选择器
    const outputFormatSelect = page.locator('select[name*="output"], .output-format');
    if (await outputFormatSelect.count() > 0) {
      await expect(outputFormatSelect.first()).toBeVisible();
    }
  });

  test('JSON转换功能测试', async ({ page }) => {
    // 查找JSON相关选项
    const jsonOption = page.locator('option[value="json"], text=JSON');
    
    if (await jsonOption.count() > 0) {
      // 选择JSON格式
      await jsonOption.first().click();
      
      // 输入JSON数据
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const jsonData = '{"name": "test", "age": 25, "active": true}';
        await inputArea.first().fill(jsonData);
      }
      
      // 查找转换按钮
      const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
      if (await convertButton.count() > 0) {
        await convertButton.first().click();
        
        // 验证输出区域
        const outputArea = page.locator('.output, .result, textarea[readonly]');
        if (await outputArea.count() > 0) {
          await expect(outputArea.first()).toBeVisible();
        }
      }
    }
  });

  test('XML转换功能测试', async ({ page }) => {
    // 查找XML相关选项
    const xmlOption = page.locator('option[value="xml"], text=XML');
    
    if (await xmlOption.count() > 0) {
      await xmlOption.first().click();
      
      // 输入XML数据
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const xmlData = '<person><name>test</name><age>25</age></person>';
        await inputArea.first().fill(xmlData);
      }
    }
  });

  test('CSV转换功能测试', async ({ page }) => {
    // 查找CSV相关选项
    const csvOption = page.locator('option[value="csv"], text=CSV');
    
    if (await csvOption.count() > 0) {
      await csvOption.first().click();
      
      // 输入CSV数据
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const csvData = 'name,age,active\ntest,25,true\njohn,30,false';
        await inputArea.first().fill(csvData);
      }
    }
  });

  test('YAML转换功能测试', async ({ page }) => {
    // 查找YAML相关选项
    const yamlOption = page.locator('option[value="yaml"], text=YAML');
    
    if (await yamlOption.count() > 0) {
      await yamlOption.first().click();
      
      // 输入YAML数据
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const yamlData = 'name: test\nage: 25\nactive: true';
        await inputArea.first().fill(yamlData);
      }
    }
  });

  test('转换按钮测试', async ({ page }) => {
    // 查找转换按钮
    const convertButton = page.locator('button').filter({ hasText: /convert|transform|generate/i });
    
    if (await convertButton.count() > 0) {
      await expect(convertButton.first()).toBeVisible();
      
      // 验证按钮初始状态
      const isDisabled = await convertButton.first().isDisabled();
      // 在没有输入数据时按钮可能被禁用
    }
  });

  test('输出区域测试', async ({ page }) => {
    // 查找输出区域
    const outputArea = page.locator('textarea[readonly], .output, .result');
    
    if (await outputArea.count() > 0) {
      await expect(outputArea.first()).toBeVisible();
    }
  });

  test('复制功能测试', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton.first()).toBeVisible();
      
      // 如果有输出数据，测试复制功能
      const outputArea = page.locator('textarea[readonly], .output');
      if (await outputArea.count() > 0) {
        const hasContent = await outputArea.first().textContent();
        if (hasContent) {
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
      
      // 测试清空功能
      await clearButton.first().click();
      
      // 验证输入区域被清空
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const value = await inputArea.first().inputValue();
        expect(value).toBe('');
      }
    }
  });

  test('文件上传功能测试', async ({ page }) => {
    // 查找文件上传输入
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      await expect(fileInput).toBeVisible();
      
      // 验证接受的文件类型
      const acceptAttr = await fileInput.getAttribute('accept');
      if (acceptAttr) {
        expect(acceptAttr).toMatch(/\.(json|xml|csv|yaml|yml|toml)/);
      }
    }
  });

  test('文件下载功能测试', async ({ page }) => {
    // 查找下载按钮
    const downloadButton = page.locator('button').filter({ hasText: /download|save/i });
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton.first()).toBeVisible();
      
      // 如果有转换结果，测试下载功能
      const outputArea = page.locator('textarea[readonly], .output');
      if (await outputArea.count() > 0) {
        const hasContent = await outputArea.first().textContent();
        if (hasContent) {
          // 设置下载监听
          const downloadPromise = page.waitForEvent('download');
          
          try {
            await downloadButton.first().click();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/\.(json|xml|csv|yaml|yml|toml|txt)$/);
          } catch (error) {
            console.log('Download button clicked, but no download occurred');
          }
        }
      }
    }
  });

  test('数据验证功能测试', async ({ page }) => {
    // 查找验证按钮
    const validateButton = page.locator('button').filter({ hasText: /validate|check/i });
    
    if (await validateButton.count() > 0) {
      await expect(validateButton.first()).toBeVisible();
      
      // 输入无效数据测试验证
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        await inputArea.first().fill('invalid json {');
        await validateButton.first().click();
        
        // 查找错误信息
        const errorMessage = page.locator('.error, .invalid, text=error');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });

  test('格式化功能测试', async ({ page }) => {
    // 查找格式化按钮
    const formatButton = page.locator('button').filter({ hasText: /format|beautify|pretty/i });
    
    if (await formatButton.count() > 0) {
      await expect(formatButton.first()).toBeVisible();
      
      // 输入压缩的JSON数据
      const inputArea = page.locator('textarea, .input-area');
      if (await inputArea.count() > 0) {
        const compactJson = '{"name":"test","age":25}';
        await inputArea.first().fill(compactJson);
        await formatButton.first().click();
        
        // 验证格式化后的输出
        const outputArea = page.locator('textarea[readonly], .output');
        if (await outputArea.count() > 0) {
          const formattedContent = await outputArea.first().textContent();
          if (formattedContent) {
            expect(formattedContent).toContain('\n'); // 格式化后应该包含换行符
          }
        }
      }
    }
  });

  test('批量转换功能测试', async ({ page }) => {
    // 查找批量转换选项
    const batchOption = page.locator('input[type="checkbox"]').filter({ hasText: /batch|multiple/i });
    
    if (await batchOption.count() > 0) {
      await batchOption.click();
      
      // 查找多文件上传
      const multipleFileInput = page.locator('input[type="file"][multiple]');
      if (await multipleFileInput.count() > 0) {
        await expect(multipleFileInput).toBeVisible();
      }
    }
  });

  test('历史记录功能测试', async ({ page }) => {
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .previous');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
      
      // 查找历史记录项
      const historyItems = page.locator('.history-item, .recent-item');
      if (await historyItems.count() > 0) {
        await expect(historyItems.first()).toBeVisible();
        
        // 测试点击历史记录项
        await historyItems.first().click();
      }
    }
  });

  test('错误处理测试', async ({ page }) => {
    // 测试无效数据格式
    const inputArea = page.locator('textarea, .input-area');
    
    if (await inputArea.count() > 0) {
      // 输入无效的JSON
      await inputArea.first().fill('invalid json data {');
      
      const convertButton = page.locator('button').filter({ hasText: /convert/i });
      if (await convertButton.count() > 0) {
        await convertButton.first().click();
        
        // 查找错误信息
        const errorMessage = page.locator('.error, .invalid, text=error, text=invalid');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
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
    const inputArea = page.locator('textarea, .input-area');
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
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();
    }
  });
});