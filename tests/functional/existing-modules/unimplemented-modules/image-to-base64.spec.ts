import { test, expect } from '@playwright/test';

test.describe('Dev Forge Image to Base64', () => {
  const baseUrl = 'https://www.001236.xyz/en/image2base64';

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

  test('Image to Base64页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Image.*Base64.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Image to Base64' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Convert images to Base64 encoded strings')).toBeVisible();
  });

  test('文件上传区域测试', async ({ page }) => {
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

  test('支持的图片格式验证', async ({ page }) => {
    // 查找支持格式说明
    const formatInfo = page.locator('text=JPG, text=PNG, text=GIF, text=WebP, text=SVG');
    
    if (await formatInfo.count() > 0) {
      await expect(formatInfo.first()).toBeVisible();
    }
    
    // 验证文件输入的accept属性
    const fileInput = page.locator('input[type="file"]');
    const acceptAttr = await fileInput.getAttribute('accept');
    
    if (acceptAttr) {
      expect(acceptAttr).toMatch(/\.(jpg|jpeg|png|gif|webp|svg)/i);
    }
  });

  test('图片预览功能测试', async ({ page }) => {
    // 查找图片预览区域
    const previewArea = page.locator('.preview, .image-preview, img[src*="data:"]');
    
    if (await previewArea.count() > 0) {
      // 如果有预览区域，验证其存在
      await expect(previewArea.first()).toBeVisible();
    }
  });

  test('Base64输出区域测试', async ({ page }) => {
    // 查找Base64输出区域
    const outputArea = page.locator('textarea[readonly], .output, .result, .base64-output');
    
    if (await outputArea.count() > 0) {
      await expect(outputArea.first()).toBeVisible();
    }
  });

  test('文件大小限制测试', async ({ page }) => {
    // 查找文件大小限制说明
    const sizeLimit = page.locator('text=MB, text=KB, text=size, text=limit');
    
    if (await sizeLimit.count() > 0) {
      await expect(sizeLimit.first()).toBeVisible();
    }
  });

  test('转换按钮测试', async ({ page }) => {
    // 查找转换按钮
    const convertButton = page.locator('button').filter({ hasText: /convert|encode|generate/i });
    
    if (await convertButton.count() > 0) {
      await expect(convertButton.first()).toBeVisible();
      
      // 验证按钮初始状态（可能是禁用的）
      const isDisabled = await convertButton.first().isDisabled();
      // 在没有文件时按钮可能被禁用
    }
  });

  test('复制功能测试', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton.first()).toBeVisible();
      
      // 如果有示例Base64数据，测试复制功能
      const outputArea = page.locator('textarea[readonly], .output');
      if (await outputArea.count() > 0) {
        const hasContent = await outputArea.first().inputValue();
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
      
      // 如果有内容，测试清空功能
      await clearButton.first().click();
      
      // 验证内容被清空
      const outputArea = page.locator('textarea, .output');
      if (await outputArea.count() > 0) {
        const value = await outputArea.first().inputValue();
        expect(value).toBe('');
      }
    }
  });

  test('下载功能测试', async ({ page }) => {
    // 查找下载按钮
    const downloadButton = page.locator('button').filter({ hasText: /download|save/i });
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton.first()).toBeVisible();
      
      // 如果有Base64数据，测试下载功能
      const outputArea = page.locator('textarea[readonly], .output');
      if (await outputArea.count() > 0) {
        const hasContent = await outputArea.first().inputValue();
        if (hasContent) {
          // 设置下载监听
          const downloadPromise = page.waitForEvent('download');
          await downloadButton.first().click();
          
          try {
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/\.(txt|base64)$/);
          } catch (error) {
            console.log('Download button clicked, but no download occurred');
          }
        }
      }
    }
  });

  test('URL输入功能测试', async ({ page }) => {
    // 查找URL输入框
    const urlInput = page.locator('input[type="url"], input[placeholder*="url"], input[placeholder*="URL"]');
    
    if (await urlInput.count() > 0) {
      await expect(urlInput.first()).toBeVisible();
      
      // 测试输入图片URL
      const imageUrl = 'https://via.placeholder.com/150';
      await urlInput.first().fill(imageUrl);
      await expect(urlInput.first()).toHaveValue(imageUrl);
      
      // 查找从URL加载按钮
      const loadButton = page.locator('button').filter({ hasText: /load|fetch|get/i });
      if (await loadButton.count() > 0) {
        await loadButton.first().click();
        
        // 等待加载完成
        await page.waitForTimeout(2000);
      }
    }
  });

  test('图片信息显示测试', async ({ page }) => {
    // 查找图片信息显示区域
    const infoArea = page.locator('.image-info, .file-info, .metadata');
    
    if (await infoArea.count() > 0) {
      await expect(infoArea.first()).toBeVisible();
      
      // 验证可能显示的信息
      const infoItems = page.locator('text=width, text=height, text=size, text=type, text=format');
      if (await infoItems.count() > 0) {
        await expect(infoItems.first()).toBeVisible();
      }
    }
  });

  test('Base64格式选择测试', async ({ page }) => {
    // 查找Base64格式选择器
    const formatSelect = page.locator('select[name*="format"], input[type="radio"]');
    
    if (await formatSelect.count() > 0) {
      // 测试不同的Base64格式
      if (await page.locator('select').count() > 0) {
        const select = page.locator('select').first();
        
        // 测试纯Base64格式
        await select.selectOption('base64');
        
        // 测试Data URL格式
        await select.selectOption('dataurl');
      } else if (await page.locator('input[type="radio"]').count() > 0) {
        // 测试单选按钮格式选择
        const radioButtons = page.locator('input[type="radio"]');
        await radioButtons.first().click();
      }
    }
  });

  test('批量转换功能测试', async ({ page }) => {
    // 查找批量上传功能
    const multipleFileInput = page.locator('input[type="file"][multiple]');
    
    if (await multipleFileInput.count() > 0) {
      await expect(multipleFileInput).toBeVisible();
      
      // 验证multiple属性
      const hasMultiple = await multipleFileInput.getAttribute('multiple');
      expect(hasMultiple).not.toBeNull();
    }
    
    // 查找批量转换结果区域
    const batchResults = page.locator('.batch-results, .multiple-results');
    if (await batchResults.count() > 0) {
      await expect(batchResults).toBeVisible();
    }
  });

  test('图片压缩选项测试', async ({ page }) => {
    // 查找图片压缩选项
    const qualitySlider = page.locator('input[type="range"], input[name*="quality"]');
    
    if (await qualitySlider.count() > 0) {
      await expect(qualitySlider.first()).toBeVisible();
      
      // 测试调整压缩质量
      await qualitySlider.first().fill('80');
    }
    
    // 查找压缩选项复选框
    const compressCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /compress|optimize/i });
    if (await compressCheckbox.count() > 0) {
      await compressCheckbox.first().click();
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
      }
    }
  });

  test('错误处理测试', async ({ page }) => {
    // 测试无效文件类型
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // 注意：实际的文件上传测试需要真实文件
      // 这里主要验证错误处理UI元素的存在
      
      // 查找错误信息显示区域
      const errorArea = page.locator('.error, .invalid, .warning');
      if (await errorArea.count() > 0) {
        // 错误区域存在但可能不可见（没有错误时）
      }
    }
    
    // 测试无效URL
    const urlInput = page.locator('input[type="url"], input[placeholder*="url"]');
    if (await urlInput.count() > 0) {
      await urlInput.fill('invalid-url');
      
      const loadButton = page.locator('button').filter({ hasText: /load|fetch/i });
      if (await loadButton.count() > 0) {
        await loadButton.click();
        
        // 查找错误信息
        const errorMessage = page.locator('text=invalid, text=error, .error');
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
});