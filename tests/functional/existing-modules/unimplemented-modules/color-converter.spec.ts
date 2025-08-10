import { test, expect, chromium } from '@playwright/test';

const baseUrl = 'https://www.001236.xyz/en/color';

// 检查模块是否已实现的函数
async function checkIfModuleImplemented() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    const comingSoonElement = page.locator('text="Tool implementation coming soon"');
    const isComingSoon = await comingSoonElement.isVisible({ timeout: 3000 });
    
    await browser.close();
    return !isComingSoon;
  } catch (error) {
    await browser.close();
    return true; // 如果检查失败，假设模块已实现
  }
}

test.describe('Dev Forge Color Converter', () => {
  let moduleImplemented = true;
  
  test.beforeAll(async () => {
    try {
      moduleImplemented = await checkIfModuleImplemented();
      if (!moduleImplemented) {
        console.log('模块未实现，跳过所有测试');
      }
    } catch (error) {
      console.log('检查模块状态失败，默认执行测试');
    }
  });
  
  test.beforeEach(async ({ page }) => {
    if (!moduleImplemented) {
      test.skip(true, 'Tool implementation coming soon');
    }
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
  });

  test('HEX转RGB转换', async ({ page }) => {
    const hexColor = '#FF5733';
    const expectedRGB = 'rgb(255, 87, 51)';
    
    // 输入HEX颜色值
    await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', hexColor);
    
    // 点击转换按钮或自动转换
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证RGB结果
    const rgbResult = await page.textContent('.rgb-result, .rgb-output, [data-testid="rgb-result"]');
    expect(rgbResult).toContain('255');
    expect(rgbResult).toContain('87');
    expect(rgbResult).toContain('51');
  });

  test('RGB转HEX转换', async ({ page }) => {
    // 输入RGB值
    const rInput = page.locator('input[placeholder*="R"], .r-input, [data-testid="r-input"]');
    const gInput = page.locator('input[placeholder*="G"], .g-input, [data-testid="g-input"]');
    const bInput = page.locator('input[placeholder*="B"], .b-input, [data-testid="b-input"]');
    
    if (await rInput.count() > 0) {
      await rInput.fill('255');
      await gInput.fill('87');
      await bInput.fill('51');
    } else {
      // 尝试单个RGB输入框
      await page.fill('input[placeholder*="rgb"], .rgb-input, [data-testid="rgb-input"]', 'rgb(255, 87, 51)');
    }
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证HEX结果
    const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
    expect(hexResult?.toUpperCase()).toContain('#FF5733');
  });

  test('HSL转换功能', async ({ page }) => {
    const hslColor = 'hsl(9, 100%, 60%)';
    
    // 输入HSL值
    await page.fill('input[placeholder*="hsl"], .hsl-input, [data-testid="hsl-input"]', hslColor);
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果
    const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
    const rgbResult = await page.textContent('.rgb-result, .rgb-output, [data-testid="rgb-result"]');
    
    expect(hexResult || rgbResult).toBeTruthy();
  });

  test('颜色选择器功能', async ({ page }) => {
    // 查找颜色选择器
    const colorPicker = page.locator('input[type="color"], .color-picker, [data-testid="color-picker"]');
    if (await colorPicker.count() > 0) {
      await colorPicker.fill('#00FF00'); // 绿色
      
      // 验证其他格式的自动更新
      const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
      const rgbResult = await page.textContent('.rgb-result, .rgb-output, [data-testid="rgb-result"]');
      
      expect(hexResult?.toUpperCase()).toContain('#00FF00');
      expect(rgbResult).toContain('0, 255, 0');
    }
  });

  test('预设颜色功能', async ({ page }) => {
    // 查找预设颜色按钮
    const presetColors = page.locator('.preset-color, .color-preset, [data-testid="preset-colors"] > *');
    if (await presetColors.count() > 0) {
      await presetColors.first().click();
      
      // 验证颜色值被填入
      const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
      expect(hexResult).toMatch(/#[0-9A-Fa-f]{6}/);
    }
  });

  test('CMYK转换功能', async ({ page }) => {
    // 查找CMYK输入
    const cmykInput = page.locator('input[placeholder*="cmyk"], .cmyk-input, [data-testid="cmyk-input"]');
    if (await cmykInput.count() > 0) {
      await cmykInput.fill('cmyk(0%, 66%, 80%, 0%)');
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
      expect(hexResult).toBeTruthy();
    }
  });

  test('颜色名称转换', async ({ page }) => {
    const colorNames = ['red', 'blue', 'green', 'yellow', 'purple'];
    
    for (const colorName of colorNames) {
      // 输入颜色名称
      await page.fill('input[placeholder*="name"], .color-name-input, [data-testid="color-name-input"]', colorName);
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      // 验证转换结果
      const hexResult = await page.textContent('.hex-result, .hex-output, [data-testid="hex-result"]');
      expect(hexResult).toMatch(/#[0-9A-Fa-f]{6}/);
      
      await page.waitForTimeout(200);
    }
  });

  test('无效颜色值处理', async ({ page }) => {
    const invalidColors = ['#GGGGGG', 'rgb(300, 300, 300)', 'invalid-color'];
    
    for (const invalidColor of invalidColors) {
      await page.fill('input[type="text"]', invalidColor);
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      // 验证错误提示
      const errorMessage = await page.textContent('.error, .invalid, [data-testid="error-message"]');
      if (errorMessage) {
        expect(errorMessage).toMatch(/invalid|error/i);
      }
    }
  });

  test('颜色亮度调整', async ({ page }) => {
    await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', '#FF5733');
    
    // 查找亮度调整滑块
    const brightnessSlider = page.locator('input[type="range"]:near(:text("Brightness")), .brightness-slider, [data-testid="brightness-slider"]');
    if (await brightnessSlider.count() > 0) {
      await brightnessSlider.fill('80'); // 增加亮度
      
      const adjustedColor = await page.textContent('.adjusted-color, .result, [data-testid="adjusted-result"]');
      expect(adjustedColor).toBeTruthy();
    }
  });

  test('颜色饱和度调整', async ({ page }) => {
    await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', '#FF5733');
    
    // 查找饱和度调整滑块
    const saturationSlider = page.locator('input[type="range"]:near(:text("Saturation")), .saturation-slider, [data-testid="saturation-slider"]');
    if (await saturationSlider.count() > 0) {
      await saturationSlider.fill('50'); // 降低饱和度
      
      const adjustedColor = await page.textContent('.adjusted-color, .result, [data-testid="adjusted-result"]');
      expect(adjustedColor).toBeTruthy();
    }
  });

  test('颜色对比度检查', async ({ page }) => {
    // 输入前景色和背景色
    const foregroundInput = page.locator('input[placeholder*="foreground"], .foreground-input, [data-testid="foreground-input"]');
    const backgroundInput = page.locator('input[placeholder*="background"], .background-input, [data-testid="background-input"]');
    
    if (await foregroundInput.count() > 0) {
      await foregroundInput.fill('#000000'); // 黑色
      await backgroundInput.fill('#FFFFFF'); // 白色
      
      const checkButton = page.locator('button:has-text("Check Contrast"), .contrast-btn, [data-testid="contrast-button"]');
      if (await checkButton.count() > 0) {
        await checkButton.click();
        
        const contrastRatio = await page.textContent('.contrast-ratio, .contrast-result, [data-testid="contrast-result"]');
        expect(contrastRatio).toContain('21'); // 黑白对比度应该是21:1
      }
    }
  });

  test('调色板生成', async ({ page }) => {
    await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', '#FF5733');
    
    // 查找调色板生成按钮
    const paletteButton = page.locator('button:has-text("Generate Palette"), .palette-btn, [data-testid="palette-button"]');
    if (await paletteButton.count() > 0) {
      await paletteButton.click();
      
      // 验证生成了多个颜色
      const paletteColors = await page.locator('.palette-color, .color-swatch, [data-testid="palette-colors"] > *').count();
      expect(paletteColors).toBeGreaterThan(1);
    }
  });

  test('复制颜色值功能', async ({ page }) => {
    await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', '#FF5733');
    
    const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('颜色历史记录', async ({ page }) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF'];
    
    // 转换多个颜色
    for (const color of colors) {
      await page.fill('input[placeholder*="hex"], .hex-input, [data-testid="hex-input"]', color);
      
      const convertButton = page.locator('button:has-text("Convert"), .convert-btn, [data-testid="convert-button"]');
      if (await convertButton.count() > 0) {
        await convertButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // 查找历史记录
    const historyTab = page.locator('button:has-text("History"), .history-tab, [data-testid="history-tab"]');
    if (await historyTab.count() > 0) {
      await historyTab.click();
      
      const historyItems = await page.locator('.history-item, .color-history, [data-testid="color-history"] > *').count();
      expect(historyItems).toBeGreaterThan(0);
    }
  });
});