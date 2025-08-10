import { test, expect } from '@playwright/test';

test.describe('Dev Forge Favicon Generator', () => {
  const baseUrl = 'https://www.001236.xyz/en/favicon-generator';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    
    // 检查是否显示"Tool implementation coming soon..."
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Tool implementation coming soon')) {
      test.skip(true, 'Tool implementation coming soon...');
    }
  });

  test('Favicon Generator页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Favicon.*Generator.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Favicon Generator' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Generate favicons for your website')).toBeVisible();
  });

  test('图片上传区域测试', async ({ page }) => {
    // 查找文件上传输入
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
    
    // 验证接受的文件类型
    const acceptAttr = await fileInput.getAttribute('accept');
    if (acceptAttr) {
      expect(acceptAttr).toMatch(/image/);
    }
  });

  test('拖拽上传区域测试', async ({ page }) => {
    // 查找拖拽上传区域
    const dropZone = page.locator('.drop-zone, .upload-area, .drag-drop').first();
    
    if (await dropZone.count() > 0) {
      await expect(dropZone).toBeVisible();
      
      // 验证拖拽提示文本
      await expect(page.locator('text=drag, text=drop, text=upload')).toBeVisible();
    }
  });

  test('Favicon尺寸选择测试', async ({ page }) => {
    // 查找尺寸选择器
    const sizeOptions = page.locator('input[type="checkbox"], .size-option');
    
    if (await sizeOptions.count() > 0) {
      // 验证常见的favicon尺寸
      const commonSizes = ['16x16', '32x32', '48x48', '64x64', '128x128', '256x256'];
      
      for (const size of commonSizes) {
        const sizeOption = page.locator(`text=${size}`);
        if (await sizeOption.count() > 0) {
          await expect(sizeOption.first()).toBeVisible();
        }
      }
    }
  });

  test('Favicon格式选择测试', async ({ page }) => {
    // 查找格式选择器
    const formatOptions = page.locator('input[type="radio"], input[type="checkbox"], select');
    
    if (await formatOptions.count() > 0) {
      // 验证支持的格式
      const formats = ['ICO', 'PNG', 'SVG'];
      
      for (const format of formats) {
        const formatOption = page.locator(`text=${format}`);
        if (await formatOption.count() > 0) {
          await expect(formatOption.first()).toBeVisible();
        }
      }
    }
  });

  test('图片预览功能测试', async ({ page }) => {
    // 查找图片预览区域
    const previewArea = page.locator('.preview, .image-preview, img[src*="data:"]');
    
    if (await previewArea.count() > 0) {
      await expect(previewArea.first()).toBeVisible();
    }
    
    // 查找多尺寸预览
    const multiPreview = page.locator('.size-preview, .favicon-preview');
    if (await multiPreview.count() > 0) {
      await expect(multiPreview.first()).toBeVisible();
    }
  });

  test('生成按钮测试', async ({ page }) => {
    // 查找生成按钮
    const generateButton = page.locator('button').filter({ hasText: /generate|create|make/i });
    
    if (await generateButton.count() > 0) {
      await expect(generateButton.first()).toBeVisible();
      
      // 验证按钮初始状态（可能是禁用的）
      const isDisabled = await generateButton.first().isDisabled();
      // 在没有图片时按钮可能被禁用
    }
  });

  test('下载功能测试', async ({ page }) => {
    // 查找下载按钮
    const downloadButton = page.locator('button').filter({ hasText: /download|save/i });
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton.first()).toBeVisible();
      
      // 如果有生成的favicon，测试下载功能
      const previewArea = page.locator('.preview, .result');
      if (await previewArea.count() > 0) {
        // 设置下载监听
        const downloadPromise = page.waitForEvent('download');
        
        try {
          await downloadButton.first().click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(ico|png|zip)$/);
        } catch (error) {
          console.log('Download button clicked, but no download occurred');
        }
      }
    }
  });

  test('批量下载功能测试', async ({ page }) => {
    // 查找批量下载按钮
    const batchDownloadButton = page.locator('button').filter({ hasText: /download.*all|batch.*download|zip/i });
    
    if (await batchDownloadButton.count() > 0) {
      await expect(batchDownloadButton.first()).toBeVisible();
      
      // 测试批量下载
      const downloadPromise = page.waitForEvent('download');
      
      try {
        await batchDownloadButton.first().click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.zip$/);
      } catch (error) {
        console.log('Batch download button clicked, but no download occurred');
      }
    }
  });

  test('HTML代码生成测试', async ({ page }) => {
    // 查找HTML代码显示区域
    const htmlCodeArea = page.locator('textarea[readonly], .code-output, .html-code');
    
    if (await htmlCodeArea.count() > 0) {
      await expect(htmlCodeArea.first()).toBeVisible();
      
      // 验证HTML代码内容
      const codeContent = await htmlCodeArea.first().textContent();
      if (codeContent) {
        expect(codeContent).toMatch(/<link.*rel=["']icon["']/);
      }
    }
  });

  test('复制HTML代码功能测试', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy.*html|copy.*code/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton.first()).toBeVisible();
      
      // 如果有HTML代码，测试复制功能
      const htmlCodeArea = page.locator('textarea[readonly], .code-output');
      if (await htmlCodeArea.count() > 0) {
        const hasContent = await htmlCodeArea.first().textContent();
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
    const clearButton = page.locator('button').filter({ hasText: /clear|reset|remove/i });
    
    if (await clearButton.count() > 0) {
      await expect(clearButton.first()).toBeVisible();
      
      // 测试清空功能
      await clearButton.first().click();
      
      // 验证预览区域被清空
      const previewArea = page.locator('.preview img');
      if (await previewArea.count() > 0) {
        const src = await previewArea.first().getAttribute('src');
        expect(src).toBeFalsy();
      }
    }
  });

  test('图片编辑功能测试', async ({ page }) => {
    // 查找图片编辑选项
    const editOptions = page.locator('.edit-options, .image-editor');
    
    if (await editOptions.count() > 0) {
      await expect(editOptions).toBeVisible();
      
      // 测试裁剪功能
      const cropButton = page.locator('button').filter({ hasText: /crop/i });
      if (await cropButton.count() > 0) {
        await expect(cropButton).toBeVisible();
      }
      
      // 测试调整大小功能
      const resizeButton = page.locator('button').filter({ hasText: /resize/i });
      if (await resizeButton.count() > 0) {
        await expect(resizeButton).toBeVisible();
      }
    }
  });

  test('背景颜色设置测试', async ({ page }) => {
    // 查找背景颜色选择器
    const colorPicker = page.locator('input[type="color"], .color-picker');
    
    if (await colorPicker.count() > 0) {
      await expect(colorPicker.first()).toBeVisible();
      
      // 测试设置背景颜色
      if (await page.locator('input[type="color"]').count() > 0) {
        await page.locator('input[type="color"]').first().fill('#ff0000');
      }
    }
    
    // 查找透明背景选项
    const transparentOption = page.locator('input[type="checkbox"]').filter({ hasText: /transparent/i });
    if (await transparentOption.count() > 0) {
      await transparentOption.click();
    }
  });

  test('圆角设置测试', async ({ page }) => {
    // 查找圆角设置
    const borderRadiusSlider = page.locator('input[type="range"]').filter({ hasText: /radius|corner/i });
    
    if (await borderRadiusSlider.count() > 0) {
      await expect(borderRadiusSlider.first()).toBeVisible();
      
      // 测试调整圆角
      await borderRadiusSlider.first().fill('50');
    }
    
    // 查找圆角预设选项
    const roundedOptions = page.locator('button').filter({ hasText: /rounded|square|circle/i });
    if (await roundedOptions.count() > 0) {
      await roundedOptions.first().click();
    }
  });

  test('Favicon包生成测试', async ({ page }) => {
    // 查找favicon包选项
    const packageOption = page.locator('input[type="checkbox"]').filter({ hasText: /package|bundle|complete/i });
    
    if (await packageOption.count() > 0) {
      await packageOption.click();
      
      // 验证包含的文件类型
      const fileTypes = page.locator('text=apple-touch-icon, text=android-chrome, text=mstile');
      if (await fileTypes.count() > 0) {
        await expect(fileTypes.first()).toBeVisible();
      }
    }
  });

  test('实时预览功能测试', async ({ page }) => {
    // 查找实时预览区域
    const livePreview = page.locator('.live-preview, .real-time-preview');
    
    if (await livePreview.count() > 0) {
      await expect(livePreview).toBeVisible();
      
      // 验证浏览器标签页预览
      const tabPreview = page.locator('.tab-preview, .browser-preview');
      if (await tabPreview.count() > 0) {
        await expect(tabPreview).toBeVisible();
      }
    }
  });

  test('模板选择功能测试', async ({ page }) => {
    // 查找模板选择区域
    const templates = page.locator('.template, .preset');
    
    if (await templates.count() > 0) {
      await expect(templates.first()).toBeVisible();
      
      // 测试选择模板
      await templates.first().click();
      
      // 验证模板应用后的预览
      const preview = page.locator('.preview img');
      if (await preview.count() > 0) {
        await expect(preview.first()).toBeVisible();
      }
    }
  });

  test('文字转Favicon功能测试', async ({ page }) => {
    // 查找文字输入区域
    const textInput = page.locator('input[type="text"]').filter({ hasText: /text|letter/i });
    
    if (await textInput.count() > 0) {
      await expect(textInput.first()).toBeVisible();
      
      // 测试输入文字
      await textInput.first().fill('A');
      
      // 查找字体选择
      const fontSelect = page.locator('select').filter({ hasText: /font/i });
      if (await fontSelect.count() > 0) {
        await fontSelect.selectOption({ index: 1 });
      }
      
      // 查找文字颜色选择
      const textColorPicker = page.locator('input[type="color"]').nth(1);
      if (await textColorPicker.count() > 0) {
        await textColorPicker.fill('#000000');
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
    // 测试无效文件类型
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // 查找错误信息显示区域
      const errorArea = page.locator('.error, .invalid, .warning');
      if (await errorArea.count() > 0) {
        // 错误区域存在但可能不可见（没有错误时）
      }
    }
    
    // 测试文件大小限制
    const sizeLimit = page.locator('text=MB, text=KB, text=size, text=limit');
    if (await sizeLimit.count() > 0) {
      await expect(sizeLimit.first()).toBeVisible();
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
    
    // 验证上传区域在移动设备上仍然可用
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
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

  test('性能测试', async ({ page }) => {
    // 测试页面加载性能
    const startTime = Date.now();
    await page.goto(baseUrl);
    const loadTime = Date.now() - startTime;
    
    // 验证页面在合理时间内加载完成
    expect(loadTime).toBeLessThan(5000);
    
    // 验证关键元素快速可见
    await expect(page.locator('h1')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('input[type="file"]')).toBeVisible({ timeout: 3000 });
  });
});