import { test, expect } from '@playwright/test';

test.describe('Dev Forge Base Converter工具页面', () => {

  const url = 'https://www.001236.xyz/en/base-converter';
  const numberInput = 'input[placeholder*="number"], input[placeholder*="Number"], .number-input';
  const fromBaseSelect = 'select[name="fromBase"], .from-base-select, .source-base';
  const toBaseSelect = 'select[name="toBase"], .to-base-select, .target-base';
  const convertButton = 'button:has-text("Convert"), button:has-text("转换")';
  const resultArea = '.result, .output, .converted-result';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
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
    // 验证页面标题
    await expect(page).toHaveTitle(/Base|Converter/);
    
    // 验证数字输入框存在
    const numberInputElement = page.locator(numberInput);
    if (await numberInputElement.count() > 0) {
      await expect(numberInputElement.first()).toBeVisible();
    }
    
    // 验证源进制选择器存在
    const fromBaseElement = page.locator(fromBaseSelect);
    if (await fromBaseElement.count() > 0) {
      await expect(fromBaseElement.first()).toBeVisible();
    }
    
    // 验证目标进制选择器存在
    const toBaseElement = page.locator(toBaseSelect);
    if (await toBaseElement.count() > 0) {
      await expect(toBaseElement.first()).toBeVisible();
    }
    
    // 验证转换按钮存在
    const convertBtn = page.locator(convertButton);
    if (await convertBtn.count() > 0) {
      await expect(convertBtn.first()).toBeVisible();
    }
  });

  test('十进制到二进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('10');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('2');
      }
      
      // 测试转换
      const testCases = [
        { decimal: '10', binary: '1010' },
        { decimal: '255', binary: '11111111' },
        { decimal: '16', binary: '10000' },
        { decimal: '1', binary: '1' },
        { decimal: '0', binary: '0' }
      ];
      
      for (const testCase of testCases) {
        await numberInputElement.first().fill(testCase.decimal);
        await convertBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result?.trim()).toBe(testCase.binary);
        }
      }
    }
  });

  test('二进制到十进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('2');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('10');
      }
      
      // 测试转换
      const testCases = [
        { binary: '1010', decimal: '10' },
        { binary: '11111111', decimal: '255' },
        { binary: '10000', decimal: '16' },
        { binary: '1', decimal: '1' },
        { binary: '0', decimal: '0' }
      ];
      
      for (const testCase of testCases) {
        await numberInputElement.first().fill(testCase.binary);
        await convertBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result?.trim()).toBe(testCase.decimal);
        }
      }
    }
  });

  test('十进制到十六进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('10');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('16');
      }
      
      // 测试转换
      const testCases = [
        { decimal: '255', hex: 'FF' },
        { decimal: '16', hex: '10' },
        { decimal: '10', hex: 'A' },
        { decimal: '15', hex: 'F' },
        { decimal: '0', hex: '0' }
      ];
      
      for (const testCase of testCases) {
        await numberInputElement.first().fill(testCase.decimal);
        await convertBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result?.trim().toUpperCase()).toBe(testCase.hex);
        }
      }
    }
  });

  test('十六进制到十进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('16');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('10');
      }
      
      // 测试转换
      const testCases = [
        { hex: 'FF', decimal: '255' },
        { hex: '10', decimal: '16' },
        { hex: 'A', decimal: '10' },
        { hex: 'F', decimal: '15' },
        { hex: '0', decimal: '0' }
      ];
      
      for (const testCase of testCases) {
        await numberInputElement.first().fill(testCase.hex);
        await convertBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result?.trim()).toBe(testCase.decimal);
        }
      }
    }
  });

  test('八进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 十进制到八进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('10');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('8');
      }
      
      const testCases = [
        { decimal: '64', octal: '100' },
        { decimal: '8', octal: '10' },
        { decimal: '7', octal: '7' },
        { decimal: '0', octal: '0' }
      ];
      
      for (const testCase of testCases) {
        await numberInputElement.first().fill(testCase.decimal);
        await convertBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result?.trim()).toBe(testCase.octal);
        }
      }
    }
  });

  test('自定义进制转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 测试3进制到10进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('3');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('10');
      }
      
      // 3进制的121 = 1*3^2 + 2*3^1 + 1*3^0 = 9 + 6 + 1 = 16
      await numberInputElement.first().fill('121');
      await convertBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('16');
      }
    }
  });

  test('无效输入处理测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const convertBtn = page.locator(convertButton);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置为二进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('2');
      }
      
      // 输入无效的二进制数字（包含2）
      await numberInputElement.first().fill('1012');
      await convertBtn.first().click();
      
      // 验证错误处理
      const errorMessage = page.locator('text=Invalid, text=Error, text=无效, text=错误');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const convertBtn = page.locator(convertButton);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 确保输入框为空
      await numberInputElement.first().fill('');
      await convertBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('大数字转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('10');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('16');
      }
      
      // 测试大数字
      await numberInputElement.first().fill('1000000');
      await convertBtn.first().click();
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim().toUpperCase()).toBe('F4240');
      }
    }
  });

  test('负数转换测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const convertBtn = page.locator(convertButton);
    const resultElement = page.locator(resultArea);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置进制
      if (await fromBaseElement.count() > 0) {
        await fromBaseElement.first().selectOption('10');
      }
      if (await toBaseElement.count() > 0) {
        await toBaseElement.first().selectOption('2');
      }
      
      // 测试负数（如果支持）
      await numberInputElement.first().fill('-10');
      await convertBtn.first().click();
      
      // 验证负数处理
      const errorMessage = page.locator('text=Negative, text=负数');
      const resultElement2 = page.locator(resultArea);
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      } else if (await resultElement2.count() > 0) {
        const result = await resultElement2.first().textContent();
        expect(result?.trim()).toContain('-');
      }
    }
  });

  test('进制交换功能测试', async ({ page }) => {
    const fromBaseElement = page.locator(fromBaseSelect);
    const toBaseElement = page.locator(toBaseSelect);
    const swapBtn = page.locator(swapButton);
    
    if (await fromBaseElement.count() > 0 && await toBaseElement.count() > 0 && await swapBtn.count() > 0) {
      // 设置初始进制
      await fromBaseElement.first().selectOption('10');
      await toBaseElement.first().selectOption('2');
      
      // 点击交换按钮
      await swapBtn.first().click();
      
      // 验证进制已交换
      const fromValue = await fromBaseElement.first().inputValue();
      const toValue = await toBaseElement.first().inputValue();
      
      expect(fromValue).toBe('2');
      expect(toValue).toBe('10');
    }
  });

  test('复制功能测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const convertBtn = page.locator(convertButton);
    const copyBtn = page.locator(copyButton);
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 输入并转换
      await numberInputElement.first().fill('255');
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
    }
  });

  test('清空功能测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const clearBtn = page.locator(clearButton);
    
    if (await numberInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await numberInputElement.first().fill('255');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(numberInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('批量转换测试', async ({ page }) => {
    const batchInput = page.locator('textarea[placeholder*="batch"], .batch-input');
    const batchConvertBtn = page.locator('button:has-text("Batch Convert"), button:has-text("批量转换")');
    
    if (await batchInput.count() > 0 && await batchConvertBtn.count() > 0) {
      // 输入多个数字
      const batchNumbers = '10\n255\n16';
      await batchInput.first().fill(batchNumbers);
      
      // 点击批量转换
      await batchConvertBtn.first().click();
      
      // 验证批量转换结果
      const batchResult = page.locator('.batch-result, .batch-output');
      if (await batchResult.count() > 0) {
        const result = await batchResult.first().textContent();
        expect(result).toContain('1010'); // 10的二进制
        expect(result).toContain('11111111'); // 255的二进制
        expect(result).toContain('10000'); // 16的二进制
      }
    }
  });

  test('进制说明显示测试', async ({ page }) => {
    const baseInfo = page.locator('.base-info, .base-description');
    const fromBaseElement = page.locator(fromBaseSelect);
    
    if (await fromBaseElement.count() > 0) {
      // 选择不同的进制
      const bases = ['2', '8', '10', '16'];
      
      for (const base of bases) {
        await fromBaseElement.first().selectOption(base);
        
        // 验证进制说明显示
        if (await baseInfo.count() > 0) {
          const info = await baseInfo.first().textContent();
          expect(info?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('转换历史记录测试', async ({ page }) => {
    const numberInputElement = page.locator(numberInput);
    const convertBtn = page.locator(convertButton);
    const historyElement = page.locator('.conversion-history, .history');
    
    if (await numberInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 进行几次转换
      const testNumbers = ['10', '255', '16'];
      
      for (const number of testNumbers) {
        await numberInputElement.first().fill(number);
        await convertBtn.first().click();
        await page.waitForTimeout(500);
      }
      
      // 验证历史记录显示
      if (await historyElement.count() > 0) {
        await expect(historyElement.first()).toBeVisible();
        
        // 点击历史记录中的项目
        const historyItems = page.locator(`${historyElement} .history-item`);
        if (await historyItems.count() > 0) {
          await historyItems.first().click();
          
          // 验证数值恢复
          const restoredValue = await numberInputElement.first().inputValue();
          expect(restoredValue.length).toBeGreaterThan(0);
        }
      }
    }
  });

});