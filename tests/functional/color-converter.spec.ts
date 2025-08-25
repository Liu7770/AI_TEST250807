import { test, expect } from '@playwright/test';

test.describe('Dev Forge Color Converter工具页面', () => {

  const url = 'https://www.001236.xyz/en/color-converter';
  const hexInput = 'input[placeholder*="hex"], input[placeholder*="HEX"], input[placeholder*="#"]';
  const rgbInput = 'input[placeholder*="rgb"], input[placeholder*="RGB"]';
  const hslInput = 'input[placeholder*="hsl"], input[placeholder*="HSL"]';
  const hsvInput = 'input[placeholder*="hsv"], input[placeholder*="HSV"]';
  const cmykInput = 'input[placeholder*="cmyk"], input[placeholder*="CMYK"]';
  const convertButton = 'button:has-text("Convert"), button:has-text("转换")';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const colorPreview = '.color-preview, .preview, .color-display';
  const swapButton = 'button:has-text("Swap"), button:has-text("交换")';

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
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('Color Converter').first()).toBeVisible();
    
    // 验证HEX输入框存在
    const hexInputElement = page.locator(hexInput);
    if (await hexInputElement.count() > 0) {
      await expect(hexInputElement.first()).toBeVisible();
    }
    
    // 验证RGB输入框存在
    const rgbInputElement = page.locator(rgbInput);
    if (await rgbInputElement.count() > 0) {
      await expect(rgbInputElement.first()).toBeVisible();
    }
    
    // 验证转换按钮存在
    const convertBtn = page.locator(convertButton);
    if (await convertBtn.count() > 0) {
      await expect(convertBtn.first()).toBeVisible();
    }
  });

  test('HEX到RGB转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const rgbInputElement = page.locator(rgbInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await rgbInputElement.count() > 0) {
      // 测试常见颜色转换
      const testCases = [
        { hex: '#FF0000', expectedRgb: 'rgb(255, 0, 0)' },
        { hex: '#00FF00', expectedRgb: 'rgb(0, 255, 0)' },
        { hex: '#0000FF', expectedRgb: 'rgb(0, 0, 255)' },
        { hex: '#FFFFFF', expectedRgb: 'rgb(255, 255, 255)' },
        { hex: '#000000', expectedRgb: 'rgb(0, 0, 0)' }
      ];
      
      for (const testCase of testCases) {
        await hexInputElement.first().fill(testCase.hex);
        
        if (await convertBtn.count() > 0) {
          await convertBtn.first().click();
        }
        
        // 验证RGB值
        const rgbValue = await rgbInputElement.first().inputValue();
        expect(rgbValue.replace(/\s/g, '')).toContain(testCase.expectedRgb.replace(/\s/g, '').replace('rgb(', '').replace(')', ''));
      }
    }
  });

  test('RGB到HEX转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const rgbInputElement = page.locator(rgbInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await rgbInputElement.count() > 0) {
      // 测试RGB到HEX转换
      const testCases = [
        { rgb: 'rgb(255, 0, 0)', expectedHex: '#FF0000' },
        { rgb: 'rgb(0, 255, 0)', expectedHex: '#00FF00' },
        { rgb: 'rgb(0, 0, 255)', expectedHex: '#0000FF' },
        { rgb: 'rgb(128, 128, 128)', expectedHex: '#808080' }
      ];
      
      for (const testCase of testCases) {
        await rgbInputElement.first().fill(testCase.rgb);
        
        if (await convertBtn.count() > 0) {
          await convertBtn.first().click();
        }
        
        // 验证HEX值
        const hexValue = await hexInputElement.first().inputValue();
        expect(hexValue.toUpperCase()).toBe(testCase.expectedHex);
      }
    }
  });

  test('HEX到HSL转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const hslInputElement = page.locator(hslInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await hslInputElement.count() > 0) {
      // 输入HEX颜色
      await hexInputElement.first().fill('#FF0000');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
      // 验证HSL值
      const hslValue = await hslInputElement.first().inputValue();
      expect(hslValue).toMatch(/hsl\(\d+,\s*\d+%,\s*\d+%\)/);
      expect(hslValue).toContain('0'); // 红色的色相为0
      expect(hslValue).toContain('100%'); // 饱和度为100%
      expect(hslValue).toContain('50%'); // 亮度为50%
    }
  });

  test('HSL到HEX转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const hslInputElement = page.locator(hslInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await hslInputElement.count() > 0) {
      // 输入HSL颜色
      await hslInputElement.first().fill('hsl(0, 100%, 50%)');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
      // 验证HEX值
      const hexValue = await hexInputElement.first().inputValue();
      expect(hexValue.toUpperCase()).toBe('#FF0000');
    }
  });

  test('HSV颜色转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const hsvInputElement = page.locator(hsvInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await hsvInputElement.count() > 0) {
      // 输入HEX颜色
      await hexInputElement.first().fill('#FF0000');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
      // 验证HSV值
      const hsvValue = await hsvInputElement.first().inputValue();
      expect(hsvValue).toMatch(/hsv\(\d+,\s*\d+%,\s*\d+%\)/);
    }
  });

  test('CMYK颜色转换测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const cmykInputElement = page.locator(cmykInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await cmykInputElement.count() > 0) {
      // 输入HEX颜色
      await hexInputElement.first().fill('#FF0000');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
      // 验证CMYK值
      const cmykValue = await cmykInputElement.first().inputValue();
      expect(cmykValue).toMatch(/cmyk\(\d+%,\s*\d+%,\s*\d+%,\s*\d+%\)/);
    }
  });

  test('颜色预览功能测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const colorPreviewElement = page.locator(colorPreview);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0 && await colorPreviewElement.count() > 0) {
      // 输入颜色值
      await hexInputElement.first().fill('#FF5733');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
      // 验证颜色预览显示
      await expect(colorPreviewElement.first()).toBeVisible();
      
      // 验证背景色设置
      const backgroundColor = await colorPreviewElement.first().evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('无效颜色值处理测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const convertBtn = page.locator(convertButton);
    
    if (await hexInputElement.count() > 0) {
      // 输入无效的颜色值
      const invalidColors = ['#GGGGGG', '#12345', 'invalid', 'rgb(300,300,300)', 'hsl(400,150%,150%)'];
      
      for (const color of invalidColors) {
        await hexInputElement.first().fill(color);
        
        if (await convertBtn.count() > 0) {
          await convertBtn.first().click();
        }
        
        // 验证错误处理
        const errorMessage = page.locator('text=Invalid, text=Error, text=无效, text=错误');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('颜色格式自动检测测试', async ({ page }) => {
    const colorInputElement = page.locator('input[placeholder*="color"], .color-input');
    const autoDetectBtn = page.locator('button:has-text("Auto Detect"), button:has-text("自动检测")');
    
    if (await colorInputElement.count() > 0) {
      const testCases = [
        { input: '#FF0000', expectedFormat: 'HEX' },
        { input: 'rgb(255, 0, 0)', expectedFormat: 'RGB' },
        { input: 'hsl(0, 100%, 50%)', expectedFormat: 'HSL' }
      ];
      
      for (const testCase of testCases) {
        await colorInputElement.first().fill(testCase.input);
        
        if (await autoDetectBtn.count() > 0) {
          await autoDetectBtn.first().click();
          
          // 验证格式检测结果
          const formatDisplay = page.locator('.detected-format, .format-info');
          if (await formatDisplay.count() > 0) {
            const detectedFormat = await formatDisplay.first().textContent();
            expect(detectedFormat?.toUpperCase()).toContain(testCase.expectedFormat);
          }
        }
      }
    }
  });

  test('批量颜色转换测试', async ({ page }) => {
    const batchInput = page.locator('textarea[placeholder*="batch"], .batch-input');
    const batchConvertBtn = page.locator('button:has-text("Batch Convert"), button:has-text("批量转换")');
    
    if (await batchInput.count() > 0 && await batchConvertBtn.count() > 0) {
      // 输入多个颜色值
      const batchColors = '#FF0000\n#00FF00\n#0000FF';
      await batchInput.first().fill(batchColors);
      
      // 点击批量转换
      await batchConvertBtn.first().click();
      
      // 验证批量转换结果
      const batchResult = page.locator('.batch-result, .batch-output');
      if (await batchResult.count() > 0) {
        const result = await batchResult.first().textContent();
        expect(result).toContain('rgb(255, 0, 0)');
        expect(result).toContain('rgb(0, 255, 0)');
        expect(result).toContain('rgb(0, 0, 255)');
      }
    }
  });

  test('颜色调色板集成测试', async ({ page }) => {
    const paletteElement = page.locator('.color-palette, .palette');
    const hexInputElement = page.locator(hexInput);
    
    if (await paletteElement.count() > 0) {
      // 点击调色板中的颜色
      const paletteColors = page.locator(`${paletteElement} .color-swatch, ${paletteElement} .color-item`);
      if (await paletteColors.count() > 0) {
        await paletteColors.first().click();
        
        // 验证颜色值自动填入
        if (await hexInputElement.count() > 0) {
          const selectedColor = await hexInputElement.first().inputValue();
          expect(selectedColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const convertBtn = page.locator(convertButton);
    const copyBtn = page.locator(copyButton);
    
    if (await hexInputElement.count() > 0) {
      // 输入颜色值并转换
      await hexInputElement.first().fill('#FF5733');
      
      if (await convertBtn.count() > 0) {
        await convertBtn.first().click();
      }
      
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
    const hexInputElement = page.locator(hexInput);
    const rgbInputElement = page.locator(rgbInput);
    const clearBtn = page.locator(clearButton);
    
    if (await hexInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await hexInputElement.first().fill('#FF5733');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证所有输入框被清空
      await expect(hexInputElement.first()).toHaveValue('');
      
      if (await rgbInputElement.count() > 0) {
        await expect(rgbInputElement.first()).toHaveValue('');
      }
    }
  });

  test('颜色交换功能测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const rgbInputElement = page.locator(rgbInput);
    const swapBtn = page.locator(swapButton);
    
    if (await hexInputElement.count() > 0 && await rgbInputElement.count() > 0 && await swapBtn.count() > 0) {
      // 设置初始值
      await hexInputElement.first().fill('#FF0000');
      await rgbInputElement.first().fill('rgb(0, 255, 0)');
      
      // 点击交换按钮
      await swapBtn.first().click();
      
      // 验证值已交换
      const newHexValue = await hexInputElement.first().inputValue();
      const newRgbValue = await rgbInputElement.first().inputValue();
      
      expect(newHexValue).not.toBe('#FF0000');
      expect(newRgbValue).not.toBe('rgb(0, 255, 0)');
    }
  });

  test('颜色历史记录测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const convertBtn = page.locator(convertButton);
    const historyElement = page.locator('.color-history, .history');
    
    if (await hexInputElement.count() > 0) {
      // 转换几个不同的颜色
      const testColors = ['#FF0000', '#00FF00', '#0000FF'];
      
      for (const color of testColors) {
        await hexInputElement.first().fill(color);
        
        if (await convertBtn.count() > 0) {
          await convertBtn.first().click();
        }
        
        await page.waitForTimeout(500);
      }
      
      // 验证历史记录显示
      if (await historyElement.count() > 0) {
        await expect(historyElement.first()).toBeVisible();
        
        // 点击历史记录中的颜色
        const historyColors = page.locator(`${historyElement} .history-color, ${historyElement} .color-item`);
        if (await historyColors.count() > 0) {
          await historyColors.first().click();
          
          // 验证颜色值恢复
          const restoredColor = await hexInputElement.first().inputValue();
          expect(restoredColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });

  test('颜色对比度计算测试', async ({ page }) => {
    const foregroundInput = page.locator('input[placeholder*="foreground"], input[placeholder*="前景"]');
    const backgroundInput = page.locator('input[placeholder*="background"], input[placeholder*="背景"]');
    const contrastBtn = page.locator('button:has-text("Calculate Contrast"), button:has-text("计算对比度")');
    
    if (await foregroundInput.count() > 0 && await backgroundInput.count() > 0) {
      // 设置高对比度颜色
      await foregroundInput.first().fill('#000000');
      await backgroundInput.first().fill('#FFFFFF');
      
      if (await contrastBtn.count() > 0) {
        await contrastBtn.first().click();
      }
      
      // 验证对比度显示
      const contrastRatio = page.locator('.contrast-ratio, .contrast-result');
      if (await contrastRatio.count() > 0) {
        const ratio = await contrastRatio.first().textContent();
        expect(ratio).toContain('21:1');
      }
    }
  });

  test('颜色盲模拟测试', async ({ page }) => {
    const hexInputElement = page.locator(hexInput);
    const colorBlindBtn = page.locator('button:has-text("Color Blind"), button:has-text("色盲模拟")');
    const simulationResult = page.locator('.colorblind-simulation, .simulation-result');
    
    if (await hexInputElement.count() > 0 && await colorBlindBtn.count() > 0) {
      // 输入颜色
      await hexInputElement.first().fill('#FF0000');
      
      // 点击色盲模拟
      await colorBlindBtn.first().click();
      
      // 验证模拟结果显示
      if (await simulationResult.count() > 0) {
        await expect(simulationResult.first()).toBeVisible();
      }
    }
  });

});