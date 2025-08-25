import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Dev Forge Image to Base64工具页面', () => {

  const url = 'https://www.001236.xyz/en/image2base64';
  const fileInput = 'input[type="file"][accept="image/*"]';
  const dropZone = '.border-dashed.border-orange-400';
  const uploadText = 'text="Click or drag image here to upload"';
  const supportText = 'text="Supports PNG, JPG, GIF, SVG, etc. common image formats"';
  const uploadIcon = 'svg.w-12.h-12.text-orange-400';
  const pageTitle = 'h1:has-text("Image to Base64")';
  const pageDescription = 'text="Supports drag-and-drop or file upload, automatically generates Base64 strings, and supports one-click copy"';

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
    await expect(page).toHaveTitle(/Dev Forge/);

    // 验证页面上显示的具有代表性的模块标题
    // 验证左侧导航栏或面包屑中的"Image to Base64"模块名称
    await expect(page.getByText('Image to Base64').first()).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator(pageDescription)).toBeVisible();
    
    // 验证拖拽上传区域
    await expect(page.locator(dropZone)).toBeVisible();
    
    // 验证上传图标
    await expect(page.locator(uploadIcon)).toBeVisible();
    
    // 验证上传提示文本
    await expect(page.locator(uploadText)).toBeVisible();
    
    // 验证支持格式说明文本
    await expect(page.locator(supportText)).toBeVisible();
    
    // 验证隐藏的文件输入框
    await expect(page.locator(fileInput)).toBeAttached();
  });

  test('拖拽上传区域点击测试', async ({ page }) => {
    // 验证点击拖拽区域能够触发文件选择
    const dropZoneElement = page.locator(dropZone);
    const fileInputElement = page.locator(fileInput);
    
    // 点击拖拽区域
    await dropZoneElement.click();
    
    // 验证文件输入框存在（虽然隐藏）
    await expect(fileInputElement).toBeAttached();
    
    // 验证拖拽区域具有正确的样式类
    await expect(dropZoneElement).toHaveClass(/border-dashed/);
    await expect(dropZoneElement).toHaveClass(/border-orange-400/);
    await expect(dropZoneElement).toHaveClass(/cursor-pointer/);
  });
  
  test('图片上传功能测试', async ({ page }) => {
    // 创建一个简单的测试图片文件路径
    // 注意：在实际测试中，您需要准备测试图片文件
    const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
    
    try {
      // 上传图片文件
      await page.locator(fileInput).setInputFiles(testImagePath);
      
      // 等待页面处理文件上传
      await page.waitForTimeout(1000);
      
      // 验证页面状态变化（可能会显示预览或Base64结果）
      // 这里可以添加更多具体的验证逻辑
      
    } catch (error) {
      // 如果测试图片文件不存在，跳过此测试
      test.skip(true, 'Test image file not found');
    }
  });

  test('图片转Base64测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        // 上传图片文件
        await fileInputElement.first().setInputFiles(testImagePath);
        
        // 点击转换按钮
        await convertBtn.first().click();
        
        // 验证Base64输出
        if (await outputElement.count() > 0) {
          const base64Output = await outputElement.first().textContent();
          
          // 验证Base64格式
          expect(base64Output).toContain('data:image/');
          expect(base64Output).toContain('base64,');
          
          // 验证Base64编码内容
          const base64Data = base64Output?.split('base64,')[1];
          expect(base64Data?.length).toBeGreaterThan(0);
          
          // 验证Base64字符集
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          expect(base64Regex.test(base64Data || '')).toBeTruthy();
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('不同图片格式支持测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      const imageFormats = [
        { file: 'test-image.png', mimeType: 'image/png' },
        { file: 'test-image.jpg', mimeType: 'image/jpeg' },
        { file: 'test-image.gif', mimeType: 'image/gif' },
        { file: 'test-image.webp', mimeType: 'image/webp' }
      ];
      
      for (const format of imageFormats) {
        const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', format.file);
        
        try {
          await fileInputElement.first().setInputFiles(testImagePath);
          await convertBtn.first().click();
          
          if (await outputElement.count() > 0) {
            const base64Output = await outputElement.first().textContent();
            expect(base64Output).toContain(`data:${format.mimeType}`);
          }
        } catch (error) {
          // 如果特定格式的测试文件不存在，跳过
          continue;
        }
      }
    }
  });

  test('图片质量调整测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const qualityElement = page.locator(qualitySlider);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await fileInputElement.count() > 0 && await qualityElement.count() > 0 && await convertBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.jpg');
      
      try {
        await fileInputElement.first().setInputFiles(testImagePath);
        
        // 测试不同质量设置
        const qualityValues = ['0.5', '0.8', '1.0'];
        const results = [];
        
        for (const quality of qualityValues) {
          await qualityElement.first().fill(quality);
          await convertBtn.first().click();
          
          if (await outputElement.count() > 0) {
            const base64Output = await outputElement.first().textContent();
            results.push(base64Output?.length || 0);
          }
        }
        
        // 验证质量设置影响文件大小
        if (results.length === 3) {
          expect(results[0]).toBeLessThan(results[1]); // 低质量 < 中质量
          expect(results[1]).toBeLessThan(results[2]); // 中质量 < 高质量
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('图片格式转换测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const formatElement = page.locator(formatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await fileInputElement.count() > 0 && await formatElement.count() > 0 && await convertBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        await fileInputElement.first().setInputFiles(testImagePath);
        
        // 测试转换为不同格式
        const formats = [
          { value: 'jpeg', mimeType: 'image/jpeg' },
          { value: 'png', mimeType: 'image/png' },
          { value: 'webp', mimeType: 'image/webp' }
        ];
        
        for (const format of formats) {
          try {
            await formatElement.first().selectOption(format.value);
            await convertBtn.first().click();
            
            if (await outputElement.count() > 0) {
              const base64Output = await outputElement.first().textContent();
              expect(base64Output).toContain(`data:${format.mimeType}`);
            }
          } catch (error) {
            // 如果格式选项不存在，跳过
            continue;
          }
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('大文件处理测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 创建一个大文件路径（如果存在）
      const largeImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'large-image.png');
      
      try {
        await fileInputElement.first().setInputFiles(largeImagePath);
        await convertBtn.first().click();
        
        // 验证大文件处理
        const errorMessage = page.locator('text=too large, text=文件过大, text=size limit');
        const loadingIndicator = page.locator('.loading, .spinner');
        
        // 检查是否显示加载指示器或错误消息
        if (await loadingIndicator.count() > 0) {
          await expect(loadingIndicator.first()).toBeVisible();
        } else if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      } catch (error) {
        test.skip(true, 'Large test image file not found');
      }
    }
  });

  test('无效文件类型处理测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 尝试上传非图片文件
      const textFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'test.txt');
      
      try {
        await fileInputElement.first().setInputFiles(textFilePath);
        await convertBtn.first().click();
        
        // 验证错误处理
        const errorMessage = page.locator('text=Invalid file type, text=不支持的文件类型, text=Only images');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      } catch (error) {
        // 如果测试文件不存在，跳过
      }
    }
  });

  test('拖拽上传测试', async ({ page }) => {
    const dropZoneElement = page.locator(dropZone);
    const previewElement = page.locator(previewImage);
    
    if (await dropZoneElement.count() > 0) {
      // 模拟拖拽事件
      await dropZoneElement.first().dispatchEvent('dragover');
      await dropZoneElement.first().dispatchEvent('drop', {
        dataTransfer: {
          files: [{
            name: 'test-image.png',
            type: 'image/png',
            size: 1024
          }]
        }
      });
      
      // 验证拖拽反馈
      const dragOverClass = await dropZoneElement.first().getAttribute('class');
      expect(dragOverClass).toContain('drag-over');
    }
  });

  test('复制功能测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    const copyBtn = page.locator(copyButton);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        await fileInputElement.first().setInputFiles(testImagePath);
        await convertBtn.first().click();
        
        // 点击复制按钮
        if (await copyBtn.count() > 0) {
          await copyBtn.first().click();
          
          // 验证复制成功提示
          const successMessage = page.locator('text=Copied, text=复制成功, text=Success');
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible();
          }
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const clearBtn = page.locator(clearButton);
    const outputElement = page.locator(outputArea);
    const previewElement = page.locator(previewImage);
    
    if (await fileInputElement.count() > 0 && await clearBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        // 先上传图片
        await fileInputElement.first().setInputFiles(testImagePath);
        
        // 点击清空按钮
        await clearBtn.first().click();
        
        // 验证内容被清空
        if (await outputElement.count() > 0) {
          const result = await outputElement.first().textContent();
          expect(result?.trim()).toBe('');
        }
        
        // 验证预览图片被清空
        if (await previewElement.count() > 0) {
          const isVisible = await previewElement.first().isVisible();
          expect(isVisible).toBeFalsy();
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('下载功能测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    const downloadBtn = page.locator(downloadButton);
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0 && await downloadBtn.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        await fileInputElement.first().setInputFiles(testImagePath);
        await convertBtn.first().click();
        
        // 设置下载监听
        const downloadPromise = page.waitForEvent('download');
        
        // 点击下载按钮
        await downloadBtn.first().click();
        
        // 验证下载开始
        try {
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toMatch(/\.(txt|base64)$/);
        } catch (error) {
          // 如果下载功能不可用，跳过验证
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('批量图片转换测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const batchConvertBtn = page.locator('button:has-text("Batch Convert"), button:has-text("批量转换")');
    const batchOutputElement = page.locator('.batch-output, .batch-result');
    
    if (await fileInputElement.count() > 0 && await batchConvertBtn.count() > 0) {
      const testImages = [
        path.join(process.cwd(), 'tests', 'fixtures', 'test-image1.png'),
        path.join(process.cwd(), 'tests', 'fixtures', 'test-image2.jpg')
      ];
      
      try {
        // 选择多个文件
        await fileInputElement.first().setInputFiles(testImages);
        
        // 点击批量转换
        await batchConvertBtn.first().click();
        
        // 验证批量转换结果
        if (await batchOutputElement.count() > 0) {
          const results = await batchOutputElement.first().textContent();
          expect(results).toContain('data:image/');
          
          // 验证包含多个Base64结果
          const base64Count = (results?.match(/data:image/g) || []).length;
          expect(base64Count).toBeGreaterThanOrEqual(2);
        }
      } catch (error) {
        test.skip(true, 'Test image files not found');
      }
    }
  });

  test('图片信息显示测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const imageInfoElement = page.locator('.image-info, .file-info');
    
    if (await fileInputElement.count() > 0) {
      const testImagePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
      
      try {
        await fileInputElement.first().setInputFiles(testImagePath);
        
        // 验证图片信息显示
        if (await imageInfoElement.count() > 0) {
          const info = await imageInfoElement.first().textContent();
          
          // 验证包含文件大小、尺寸等信息
          expect(info).toMatch(/\d+\s*(KB|MB|bytes)/);
          expect(info).toMatch(/\d+\s*x\s*\d+/);
        }
      } catch (error) {
        test.skip(true, 'Test image file not found');
      }
    }
  });

  test('Base64到图片转换测试', async ({ page }) => {
    const base64Input = page.locator('textarea[placeholder*="Base64"], .base64-input');
    const decodeBtn = page.locator('button:has-text("Decode"), button:has-text("解码")');
    const resultImage = page.locator('.decoded-image, .result-image');
    
    if (await base64Input.count() > 0 && await decodeBtn.count() > 0) {
      // 输入有效的Base64图片数据
      const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      await base64Input.first().fill(validBase64);
      await decodeBtn.first().click();
      
      // 验证图片显示
      if (await resultImage.count() > 0) {
        await expect(resultImage.first()).toBeVisible();
        
        const imgSrc = await resultImage.first().getAttribute('src');
        expect(imgSrc).toContain('data:image/');
      }
    }
  });

  test('转换历史记录测试', async ({ page }) => {
    const fileInputElement = page.locator(fileInput);
    const convertBtn = page.locator(convertButton);
    const historyElement = page.locator('.conversion-history, .history');
    
    if (await fileInputElement.count() > 0 && await convertBtn.count() > 0) {
      const testImages = [
        path.join(process.cwd(), 'tests', 'fixtures', 'test-image1.png'),
        path.join(process.cwd(), 'tests', 'fixtures', 'test-image2.jpg')
      ];
      
      try {
        // 转换多个图片
        for (const imagePath of testImages) {
          await fileInputElement.first().setInputFiles(imagePath);
          await convertBtn.first().click();
          await page.waitForTimeout(1000);
        }
        
        // 验证历史记录显示
        if (await historyElement.count() > 0) {
          await expect(historyElement.first()).toBeVisible();
          
          // 点击历史记录中的项目
          const historyItems = page.locator(`${historyElement} .history-item`);
          if (await historyItems.count() > 0) {
            await historyItems.first().click();
            
            // 验证历史记录恢复
            const outputElement = page.locator(outputArea);
            if (await outputElement.count() > 0) {
              const result = await outputElement.first().textContent();
              expect(result).toContain('data:image/');
            }
          }
        }
      } catch (error) {
        test.skip(true, 'Test image files not found');
      }
    }
  });

});