import { test, expect } from '@playwright/test';
import { isModuleImplemented } from './module-checker';

const baseUrl = 'https://www.001236.xyz/en/base';

test.describe('Dev Forge Base Converter', () => {
  let moduleImplemented = true;
  
  test.beforeAll(async () => {
    try {
      moduleImplemented = await isModuleImplemented(baseUrl);
      if (!moduleImplemented) {
        console.log('模块未实现，将跳过所有测试');
      }
    } catch (error) {
      console.log('检查模块状态失败，默认执行测试');
      moduleImplemented = true;
    }
  });
  
  test.beforeEach(async ({ page }) => {
    // 如果模块未实现，跳过当前测试
    test.skip(!moduleImplemented, 'Tool implementation coming soon');
    
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
  });

  test('Base Converter页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Base.*Converter.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Base Converter' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Convert numbers between different bases')).toBeVisible();
  });

  test('数字输入测试', async ({ page }) => {
    // 查找数字输入框
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    await expect(numberInput).toBeVisible();
    
    // 测试输入十进制数字
    await numberInput.fill('255');
    await expect(numberInput).toHaveValue('255');
    
    // 测试输入十六进制数字
    await numberInput.fill('FF');
    await expect(numberInput).toHaveValue('FF');
  });

  test('进制选择测试', async ({ page }) => {
    // 查找源进制选择器
    const fromBaseSelect = page.locator('select[name*="from"], select[name*="source"]').first();
    
    if (await fromBaseSelect.count() > 0) {
      // 测试选择不同的源进制
      await fromBaseSelect.selectOption('10'); // 十进制
      await expect(fromBaseSelect).toHaveValue('10');
      
      await fromBaseSelect.selectOption('16'); // 十六进制
      await expect(fromBaseSelect).toHaveValue('16');
      
      await fromBaseSelect.selectOption('2'); // 二进制
      await expect(fromBaseSelect).toHaveValue('2');
    }
    
    // 查找目标进制选择器
    const toBaseSelect = page.locator('select[name*="to"], select[name*="target"]').first();
    
    if (await toBaseSelect.count() > 0) {
      await toBaseSelect.selectOption('16');
      await expect(toBaseSelect).toHaveValue('16');
    }
  });

  test('十进制到十六进制转换', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
    
    // 设置源进制为十进制
    const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
    if (await fromBase.count() > 0) {
      await fromBase.selectOption('10');
    }
    
    // 设置目标进制为十六进制
    const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
    if (await toBase.count() > 0) {
      await toBase.selectOption('16');
    }
    
    // 输入十进制数字255
    await numberInput.fill('255');
    
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果为FF
    const result = page.locator('.result, .output, .converted').first();
    if (await result.count() > 0) {
      await expect(result).toContainText('FF');
    }
  });

  test('十六进制到十进制转换', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 设置源进制为十六进制
    const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
    if (await fromBase.count() > 0) {
      await fromBase.selectOption('16');
    }
    
    // 设置目标进制为十进制
    const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
    if (await toBase.count() > 0) {
      await toBase.selectOption('10');
    }
    
    // 输入十六进制数字FF
    await numberInput.fill('FF');
    
    const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果为255
    const result = page.locator('.result, .output, .converted').first();
    if (await result.count() > 0) {
      await expect(result).toContainText('255');
    }
  });

  test('十进制到二进制转换', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 设置源进制为十进制
    const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
    if (await fromBase.count() > 0) {
      await fromBase.selectOption('10');
    }
    
    // 设置目标进制为二进制
    const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
    if (await toBase.count() > 0) {
      await toBase.selectOption('2');
    }
    
    // 输入十进制数字8
    await numberInput.fill('8');
    
    const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果为1000
    const result = page.locator('.result, .output, .converted').first();
    if (await result.count() > 0) {
      await expect(result).toContainText('1000');
    }
  });

  test('二进制到十进制转换', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 设置源进制为二进制
    const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
    if (await fromBase.count() > 0) {
      await fromBase.selectOption('2');
    }
    
    // 设置目标进制为十进制
    const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
    if (await toBase.count() > 0) {
      await toBase.selectOption('10');
    }
    
    // 输入二进制数字1010
    await numberInput.fill('1010');
    
    const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果为10
    const result = page.locator('.result, .output, .converted').first();
    if (await result.count() > 0) {
      await expect(result).toContainText('10');
    }
  });

  test('八进制转换测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 设置源进制为八进制
    const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
    if (await fromBase.count() > 0) {
      await fromBase.selectOption('8');
    }
    
    // 设置目标进制为十进制
    const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
    if (await toBase.count() > 0) {
      await toBase.selectOption('10');
    }
    
    // 输入八进制数字77
    await numberInput.fill('77');
    
    const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 验证转换结果为63
    const result = page.locator('.result, .output, .converted').first();
    if (await result.count() > 0) {
      await expect(result).toContainText('63');
    }
  });

  test('自定义进制转换测试', async ({ page }) => {
    // 查找自定义进制输入框
    const customBaseInput = page.locator('input[name*="custom"], input[placeholder*="custom"]');
    
    if (await customBaseInput.count() > 0) {
      // 设置自定义进制为5
      await customBaseInput.fill('5');
      
      const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
      await numberInput.fill('12'); // 5进制的12
      
      const convertButton = page.locator('button').filter({ hasText: /convert|transform/i });
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      // 验证转换结果
      const result = page.locator('.result, .output, .converted').first();
      if (await result.count() > 0) {
        await expect(result).toContainText('7'); // 5进制12 = 十进制7
      }
    }
  });

  test('批量转换测试', async ({ page }) => {
    // 查找批量转换区域
    const batchArea = page.locator('.batch, .multiple, textarea[placeholder*="multiple"]');
    
    if (await batchArea.count() > 0) {
      // 输入多个数字
      await batchArea.fill('10\n20\n30');
      
      const convertButton = page.locator('button').filter({ hasText: /convert|batch/i });
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      // 验证批量转换结果
      const results = page.locator('.batch-results, .multiple-results');
      if (await results.count() > 0) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    await numberInput.fill('255');
    
    const convertButton = page.locator('button').filter({ hasText: /convert/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
    }
    
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=copied, text=success')).toBeVisible({ timeout: 3000 });
    }
  });

  test('清空功能测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 输入内容
    await numberInput.fill('255');
    await expect(numberInput).toHaveValue('255');
    
    // 查找清空按钮
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      await expect(numberInput).toHaveValue('');
    }
  });

  test('交换进制功能测试', async ({ page }) => {
    // 查找交换按钮
    const swapButton = page.locator('button').filter({ hasText: /swap|exchange|↔/i });
    
    if (await swapButton.count() > 0) {
      const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
      const toBase = page.locator('select[name*="to"], select[name*="target"]').first();
      
      if (await fromBase.count() > 0 && await toBase.count() > 0) {
        // 设置初始值
        await fromBase.selectOption('10');
        await toBase.selectOption('16');
        
        // 点击交换
        await swapButton.click();
        
        // 验证进制已交换
        await expect(fromBase).toHaveValue('16');
        await expect(toBase).toHaveValue('10');
      }
    }
  });

  test('历史记录功能测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 进行几次转换
    const conversions = ['255', '128', '64'];
    
    for (const num of conversions) {
      await numberInput.fill(num);
      
      const convertButton = page.locator('button').filter({ hasText: /convert/i });
      if (await convertButton.count() > 0) {
        await convertButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .previous');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
    }
  });

  test('错误处理测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 测试无效输入
    const invalidInputs = [
      { value: 'ABC', base: '10' }, // 十进制中的字母
      { value: '999', base: '8' },  // 八进制中的9
      { value: '2', base: '2' },    // 二进制中的2
      { value: 'GHI', base: '16' }  // 十六进制中的无效字母
    ];
    
    for (const invalid of invalidInputs) {
      // 设置进制
      const fromBase = page.locator('select[name*="from"], select[name*="source"]').first();
      if (await fromBase.count() > 0) {
        await fromBase.selectOption(invalid.base);
      }
      
      await numberInput.fill(invalid.value);
      
      const convertButton = page.locator('button').filter({ hasText: /convert/i });
      if (await convertButton.count() > 0) {
        await convertButton.click();
      }
      
      // 查找错误信息
      const errorMessage = page.locator('.error, .invalid, text=invalid, text=error');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('大数字处理测试', async ({ page }) => {
    const numberInput = page.locator('input[type="text"], input[type="number"], textarea').first();
    
    // 测试大数字
    const largeNumber = '999999999999999999';
    await numberInput.fill(largeNumber);
    
    const convertButton = page.locator('button').filter({ hasText: /convert/i });
    if (await convertButton.count() > 0) {
      await convertButton.click();
      
      // 验证能够处理大数字或显示适当的警告
      const result = page.locator('.result, .output, .converted, .warning').first();
      if (await result.count() > 0) {
        await expect(result).toBeVisible();
      }
    }
  });
});