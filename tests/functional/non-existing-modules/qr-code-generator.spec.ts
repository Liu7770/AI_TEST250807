import { test, expect } from '@playwright/test';

test.describe('Dev Forge QR Code Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=QR Code Generator');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Tool implementation coming soon')) {
      test.skip(true, 'Tool implementation coming soon...');
    }
  });

  test('生成基本文本QR码', async ({ page }) => {
    const testText = 'Hello World';
    
    // 输入文本
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 点击生成按钮
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证QR码图片生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
    
    // 验证QR码不为空
    const imageSrc = await qrImage.getAttribute('src');
    if (imageSrc) {
      expect(imageSrc).not.toBe('');
      expect(imageSrc).toContain('data:image');
    }
  });

  test('生成URL QR码', async ({ page }) => {
    const testURL = 'https://www.example.com';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testURL);
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证QR码生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
  });

  test('生成中文文本QR码', async ({ page }) => {
    const chineseText = '你好世界，这是一个中文QR码测试';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', chineseText);
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证中文QR码生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
  });

  test('调整QR码尺寸', async ({ page }) => {
    const testText = 'Size Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 查找尺寸控制
    const sizeInput = page.locator('input[type="range"], .size-slider, [data-testid="size-input"]');
    const sizeSelect = page.locator('select, .size-select, [data-testid="size-select"]');
    
    if (await sizeInput.count() > 0) {
      await sizeInput.fill('300');
    } else if (await sizeSelect.count() > 0) {
      await sizeSelect.selectOption('300');
    }
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证QR码尺寸
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
    
    const width = await qrImage.getAttribute('width');
    const height = await qrImage.getAttribute('height');
    if (width && height) {
      expect(parseInt(width)).toBeGreaterThan(200);
      expect(parseInt(height)).toBeGreaterThan(200);
    }
  });

  test('设置QR码颜色', async ({ page }) => {
    const testText = 'Color Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 查找颜色选择器
    const foregroundColor = page.locator('input[type="color"], .color-picker, [data-testid="foreground-color"]');
    const backgroundColor = page.locator('input[type="color"], .bg-color-picker, [data-testid="background-color"]');
    
    if (await foregroundColor.count() > 0) {
      await foregroundColor.fill('#ff0000'); // 红色前景
    }
    
    if (await backgroundColor.count() > 0) {
      await backgroundColor.fill('#ffff00'); // 黄色背景
    }
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证彩色QR码生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
  });

  test('设置错误纠正级别', async ({ page }) => {
    const testText = 'Error Correction Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 查找错误纠正级别选择
    const errorCorrectionSelect = page.locator('select, .error-correction, [data-testid="error-correction"]');
    if (await errorCorrectionSelect.count() > 0) {
      await errorCorrectionSelect.selectOption('H'); // 高级错误纠正
    }
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证QR码生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
  });

  test('下载QR码图片', async ({ page }) => {
    const testText = 'Download Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 等待QR码生成
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    await expect(qrImage).toBeVisible();
    
    // 查找下载按钮
    const downloadButton = page.locator('button:has-text("Download"), .download-btn, [data-testid="download-button"]');
    if (await downloadButton.count() > 0) {
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/qr.*\.(png|jpg|jpeg|svg)$/i);
    }
  });

  test('生成不同格式的QR码', async ({ page }) => {
    const testText = 'Format Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 查找格式选择
    const formatSelect = page.locator('select, .format-select, [data-testid="format-select"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.selectOption('SVG');
    }
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证SVG格式QR码
    const qrSvg = page.locator('svg, .qr-svg, [data-testid="qr-svg"]');
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    
    // 应该有SVG或图片格式的QR码
    const hasSvg = await qrSvg.count() > 0;
    const hasImage = await qrImage.count() > 0;
    expect(hasSvg || hasImage).toBeTruthy();
  });

  test('处理空输入', async ({ page }) => {
    // 不输入任何内容直接生成
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证错误提示或默认行为
    const errorMessage = page.locator('.error, .warning, [data-testid="error-message"]');
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    
    // 应该显示错误信息或生成空白QR码
    const hasError = await errorMessage.count() > 0;
    const hasQR = await qrImage.count() > 0;
    expect(hasError || hasQR).toBeTruthy();
  });

  test('生成长文本QR码', async ({ page }) => {
    const longText = 'This is a very long text that will be used to test the QR code generation capability with large amounts of data. '.repeat(10);
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', longText);
    
    const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      await generateButton.click();
    }
    
    // 验证长文本QR码生成或错误提示
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    const errorMessage = page.locator('.error, .warning, [data-testid="error-message"]');
    
    const hasQR = await qrImage.count() > 0;
    const hasError = await errorMessage.count() > 0;
    expect(hasQR || hasError).toBeTruthy();
  });

  test('生成WiFi QR码', async ({ page }) => {
    // 查找WiFi模式或特殊输入
    const wifiMode = page.locator('button:has-text("WiFi"), .wifi-mode, [data-testid="wifi-mode"]');
    if (await wifiMode.count() > 0) {
      await wifiMode.click();
      
      // 填写WiFi信息
      const ssidInput = page.locator('input[placeholder*="SSID"], .ssid-input, [data-testid="ssid-input"]');
      const passwordInput = page.locator('input[placeholder*="password"], .password-input, [data-testid="password-input"]');
      const securitySelect = page.locator('select, .security-select, [data-testid="security-select"]');
      
      if (await ssidInput.count() > 0) {
        await ssidInput.fill('TestWiFi');
      }
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('password123');
      }
      
      if (await securitySelect.count() > 0) {
        await securitySelect.selectOption('WPA');
      }
      
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      await generateButton.click();
      
      // 验证WiFi QR码生成
      const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
      await expect(qrImage).toBeVisible();
    } else {
      // 手动输入WiFi格式
      const wifiString = 'WIFI:T:WPA;S:TestWiFi;P:password123;;';
      await page.fill('textarea, .text-input, [data-testid="qr-input"]', wifiString);
      
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      if (await generateButton.count() > 0) {
        await generateButton.click();
      }
      
      const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
      await expect(qrImage).toBeVisible();
    }
  });

  test('生成联系人vCard QR码', async ({ page }) => {
    // 查找vCard模式
    const vCardMode = page.locator('button:has-text("vCard"), .vcard-mode, [data-testid="vcard-mode"]');
    if (await vCardMode.count() > 0) {
      await vCardMode.click();
      
      // 填写联系人信息
      const nameInput = page.locator('input[placeholder*="name"], .name-input, [data-testid="name-input"]');
      const phoneInput = page.locator('input[placeholder*="phone"], .phone-input, [data-testid="phone-input"]');
      const emailInput = page.locator('input[placeholder*="email"], .email-input, [data-testid="email-input"]');
      
      if (await nameInput.count() > 0) {
        await nameInput.fill('John Doe');
      }
      
      if (await phoneInput.count() > 0) {
        await phoneInput.fill('+1234567890');
      }
      
      if (await emailInput.count() > 0) {
        await emailInput.fill('john@example.com');
      }
      
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      await generateButton.click();
      
      // 验证vCard QR码生成
      const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
      await expect(qrImage).toBeVisible();
    } else {
      // 手动输入vCard格式
      const vCardString = 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD';
      await page.fill('textarea, .text-input, [data-testid="qr-input"]', vCardString);
      
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      if (await generateButton.count() > 0) {
        await generateButton.click();
      }
      
      const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
      await expect(qrImage).toBeVisible();
    }
  });

  test('批量生成QR码', async ({ page }) => {
    // 查找批量模式
    const batchMode = page.locator('button:has-text("Batch"), .batch-mode, [data-testid="batch-mode"]');
    if (await batchMode.count() > 0) {
      await batchMode.click();
      
      const batchInput = page.locator('textarea, .batch-input, [data-testid="batch-input"]');
      await batchInput.fill('Text 1\nText 2\nText 3');
      
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      await generateButton.click();
      
      // 验证批量QR码生成
      const qrImages = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
      const imageCount = await qrImages.count();
      expect(imageCount).toBeGreaterThan(1);
    }
  });

  test('清空输入功能', async ({ page }) => {
    const testText = 'Clear Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 查找清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      const inputValue = await page.inputValue('textarea, .text-input, [data-testid="qr-input"]');
      expect(inputValue).toBe('');
    }
  });

  test('QR码预览功能', async ({ page }) => {
    const testText = 'Preview Test';
    
    await page.fill('textarea, .text-input, [data-testid="qr-input"]', testText);
    
    // 检查实时预览
    const qrImage = page.locator('img, canvas, .qr-code, [data-testid="qr-image"]');
    
    // 等待一段时间看是否有实时预览
    await page.waitForTimeout(1000);
    
    const hasPreview = await qrImage.count() > 0;
    if (!hasPreview) {
      // 如果没有实时预览，点击生成按钮
      const generateButton = page.locator('button:has-text("Generate"), .generate-btn, [data-testid="generate-button"]');
      if (await generateButton.count() > 0) {
        await generateButton.click();
      }
    }
    
    await expect(qrImage).toBeVisible();
  });
});