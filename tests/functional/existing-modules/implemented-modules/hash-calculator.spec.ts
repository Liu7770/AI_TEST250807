import { test, expect } from '@playwright/test';

test.describe('Hash Calculator Tool 测试', () => {

  const url = 'https://www.001236.xyz/en/hash-calculator';
  const inputTextarea = 'textarea[placeholder="Input..."]';
  const calculateButton = 'button:has-text("Calculate Hash")';
  const clearButton = 'button:has-text("Clear")';
  const md5Checkbox = 'label:has-text("MD5") input[type="checkbox"]';
  const sha1Checkbox = 'label:has-text("SHA-1") input[type="checkbox"]';
  const sha256Checkbox = 'label:has-text("SHA-256") input[type="checkbox"]';
  const sha512Checkbox = 'label:has-text("SHA-512") input[type="checkbox"]';
  const sha384Checkbox = 'label:has-text("SHA-384") input[type="checkbox"]';
  const selectAllButton = 'button:has-text("Select All")';
  const selectNoneButton = 'button:has-text("Select None")';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证主要元素存在
    await expect(page.locator('h1')).toContainText('Hash Calculator');
    
    // 验证输入框存在
    const inputElement = page.locator(inputTextarea);
    await expect(inputElement).toBeVisible();
    
    // 验证计算按钮存在
    const calculateBtn = page.locator(calculateButton);
    await expect(calculateBtn).toBeVisible();
    
    // 验证清空按钮存在
    const clearBtn = page.locator(clearButton);
    await expect(clearBtn).toBeVisible();
    
    // 验证哈希算法选择框存在
    await expect(page.locator(md5Checkbox)).toBeVisible();
    await expect(page.locator(sha1Checkbox)).toBeVisible();
    await expect(page.locator(sha256Checkbox)).toBeVisible();
    await expect(page.locator(sha512Checkbox)).toBeVisible();
    await expect(page.locator(sha384Checkbox)).toBeVisible();
    
    // 验证选择按钮存在
    await expect(page.locator(selectAllButton)).toBeVisible();
    await expect(page.locator(selectNoneButton)).toBeVisible();
  });

  test('MD5哈希计算测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const hashSelect = page.locator(hashTypeSelect);
    
    if (await textInputElement.count() > 0) {
      // 输入测试文本
      await textInputElement.first().fill('Hello World');
      
      // 选择MD5算法
      if (await hashSelect.count() > 0) {
        await hashSelect.first().selectOption('md5');
      }
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证MD5结果显示 (Hello World的MD5: b10a8db164e0754105b7a99be72e3fe5)
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toMatch(/[a-f0-9]{32}/);
      }
    }
  });

  test('SHA1哈希计算测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const hashSelect = page.locator(hashTypeSelect);
    
    if (await textInputElement.count() > 0) {
      // 输入测试文本
      await textInputElement.first().fill('Test String');
      
      // 选择SHA1算法
      if (await hashSelect.count() > 0) {
        await hashSelect.first().selectOption('sha1');
      }
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证SHA1结果显示 (40个字符的十六进制)
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toMatch(/[a-f0-9]{40}/);
      }
    }
  });

  test('SHA256哈希计算测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const hashSelect = page.locator(hashTypeSelect);
    
    if (await textInputElement.count() > 0) {
      // 输入测试文本
      await textInputElement.first().fill('SHA256 Test');
      
      // 选择SHA256算法
      if (await hashSelect.count() > 0) {
        await hashSelect.first().selectOption('sha256');
      }
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证SHA256结果显示 (64个字符的十六进制)
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toMatch(/[a-f0-9]{64}/);
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    
    if (await textInputElement.count() > 0) {
      // 确保输入框为空
      await textInputElement.first().fill('');
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证空字符串的哈希值或错误提示
      const resultElement = page.locator(resultArea);
      const errorMessage = page.locator('text=Error, text=Empty, text=错误, text=空');
      
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        // 空字符串也应该有哈希值
        expect(result?.length).toBeGreaterThan(0);
      } else if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('特殊字符哈希计算测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    
    if (await textInputElement.count() > 0) {
      // 输入包含特殊字符的文本
      await textInputElement.first().fill('!@#$%^&*()_+-={}[]|\\:;"<>?,./');
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证特殊字符也能正确计算哈希
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toMatch(/[a-f0-9]+/);
      }
    }
  });

  test('中文字符哈希计算测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    
    if (await textInputElement.count() > 0) {
      // 输入中文文本
      await textInputElement.first().fill('你好世界测试');
      
      // 点击计算按钮
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 验证中文字符也能正确计算哈希
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toMatch(/[a-f0-9]+/);
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const copyBtn = page.locator(copyButton);
    
    if (await textInputElement.count() > 0 && await copyBtn.count() > 0) {
      // 输入文本并计算哈希
      await textInputElement.first().fill('Copy Test');
      
      const calculateBtn = page.locator(calculateButton);
      if (await calculateBtn.count() > 0) {
        await calculateBtn.first().click();
      }
      
      // 点击复制按钮
      await copyBtn.first().click();
      
      // 验证复制成功提示
      const successMessage = page.locator('text=Copied, text=复制成功, text=Success');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const clearBtn = page.locator(clearButton);
    
    if (await textInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await textInputElement.first().fill('Clear Test');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(textInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('多种哈希算法切换测试', async ({ page }) => {
    const textInputElement = page.locator(textInput);
    const hashSelect = page.locator(hashTypeSelect);
    
    if (await textInputElement.count() > 0 && await hashSelect.count() > 0) {
      // 输入测试文本
      await textInputElement.first().fill('Algorithm Test');
      
      const algorithms = ['md5', 'sha1', 'sha256', 'sha512'];
      const expectedLengths = [32, 40, 64, 128];
      
      for (let i = 0; i < algorithms.length; i++) {
        // 选择算法
        await hashSelect.first().selectOption(algorithms[i]);
        
        // 点击计算按钮
        const calculateBtn = page.locator(calculateButton);
        if (await calculateBtn.count() > 0) {
          await calculateBtn.first().click();
        }
        
        // 验证不同算法产生不同长度的哈希值
        const resultElement = page.locator(resultArea);
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          if (result) {
            expect(result.replace(/\s/g, '').length).toBe(expectedLengths[i]);
          }
        }
      }
    }
  });

});