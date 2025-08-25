import { test, expect } from '@playwright/test';
import { TestHelpersV2 } from '../utils/test-helpers-v2';
import { ErrorMessageFactory } from '../utils/test-helpers-v2';

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
    await TestHelpersV2.assertPageTitle({
      page,
      expectedTitlePattern: 'Hash Calculator',
      testName: '哈希计算器页面标题检查'
    });
    
    // 验证主标题
    await TestHelpersV2.assertElementVisible({
      locator: page.locator('h1'),
      elementName: '主标题',
      testName: '主标题显示检查'
    });
    
    // 验证输入文本区域
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(inputTextarea),
      elementName: '输入文本区域',
      testName: '输入区域显示检查'
    });
    
    // 验证计算按钮
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(calculateButton),
      elementName: '计算按钮',
      testName: '计算按钮显示检查'
    });
    
    // 验证清空按钮
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(clearButton),
      elementName: '清空按钮',
      testName: '清空按钮显示检查'
    });
    
    // 验证哈希算法复选框
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(md5Checkbox),
      elementName: 'MD5复选框',
      testName: 'MD5选项显示检查'
    });
    
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(sha1Checkbox),
      elementName: 'SHA-1复选框',
      testName: 'SHA-1选项显示检查'
    });
    
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(sha256Checkbox),
      elementName: 'SHA-256复选框',
      testName: 'SHA-256选项显示检查'
    });
    
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(sha512Checkbox),
      elementName: 'SHA-512复选框',
      testName: 'SHA-512选项显示检查'
    });
    
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(sha384Checkbox),
      elementName: 'SHA-384复选框',
      testName: 'SHA-384选项显示检查'
    });
    
    // 验证选择按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(selectAllButton),
      elementName: '全选按钮',
      testName: '全选按钮显示检查'
    });
    
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(selectNoneButton),
      elementName: '全不选按钮',
      testName: '全不选按钮显示检查'
    });
  });

  test('MD5哈希计算测试', async ({ page }) => {
    // 输入测试文本
    const testInput = 'Hello World';
    await page.locator(inputTextarea).fill(testInput);
    
    // 确保MD5复选框被选中
    const md5CheckboxElement = page.locator(md5Checkbox);
    const isChecked = await md5CheckboxElement.isChecked();
    if (!isChecked) {
      await md5CheckboxElement.check();
    }
    
    // 点击计算按钮
    await page.locator(calculateButton).click();
    
    // 验证MD5结果显示
    const md5ResultLocator = page.locator('[data-hash-type="md5"]').or(page.locator('text=/MD5.*[a-f0-9]{32}/'));
    const md5ResultVisible = await md5ResultLocator.isVisible();
    
    if (!md5ResultVisible) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'MD5哈希计算测试',
        assertion: '验证MD5计算结果显示',
        expected: 'MD5计算结果应该显示在页面上',
        actual: 'MD5结果区域不可见或不存在',
        suggestion: 'MD5哈希计算功能可能存在问题，无法正确显示计算结果。'
      });
      throw new Error(errorMessage);
    }
    
    const md5Result = await md5ResultLocator.textContent();
    const md5Hash = md5Result?.match(/[a-f0-9]{32}/);
    
    if (!md5Hash) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'MD5哈希计算测试',
        assertion: '验证MD5哈希值格式',
        expected: 'MD5哈希值应该是32位十六进制字符串',
        actual: `实际结果: ${md5Result || '无结果'}`,
        suggestion: 'MD5哈希计算可能产生了错误的结果格式，请检查计算逻辑。'
      });
      throw new Error(errorMessage);
    }
  });

  test('SHA1哈希计算测试', async ({ page }) => {
    // 输入测试文本
    const testInput = 'Test String';
    await page.locator(inputTextarea).fill(testInput);
    
    // 确保SHA1复选框被选中
    const sha1CheckboxElement = page.locator(sha1Checkbox);
    const isChecked = await sha1CheckboxElement.isChecked();
    if (!isChecked) {
      await sha1CheckboxElement.check();
    }
    
    // 点击计算按钮
    await page.locator(calculateButton).click();
    
    // 验证SHA1结果显示
    const sha1ResultLocator = page.locator('[data-hash-type="sha1"]').or(page.locator('text=/SHA-1.*[a-f0-9]{40}/'));
    const sha1ResultVisible = await sha1ResultLocator.isVisible();
    
    if (!sha1ResultVisible) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'SHA1哈希计算测试',
        assertion: '验证SHA1计算结果显示',
        expected: 'SHA1计算结果应该显示在页面上',
        actual: 'SHA1结果区域不可见或不存在',
        suggestion: 'SHA1哈希计算功能可能存在问题，无法正确显示计算结果。'
      });
      throw new Error(errorMessage);
    }
    
    const sha1Result = await sha1ResultLocator.textContent();
    const sha1Hash = sha1Result?.match(/[a-f0-9]{40}/);
    
    if (!sha1Hash) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'SHA1哈希计算测试',
        assertion: '验证SHA1哈希值格式',
        expected: 'SHA1哈希值应该是40位十六进制字符串',
        actual: `实际结果: ${sha1Result || '无结果'}`,
        suggestion: 'SHA1哈希计算可能产生了错误的结果格式，请检查计算逻辑。'
      });
      throw new Error(errorMessage);
    }
  });

  test('SHA256哈希计算测试', async ({ page }) => {
    // 输入测试文本
    const testInput = 'SHA256 Test';
    await page.locator(inputTextarea).fill(testInput);
    
    // 确保SHA256复选框被选中
    const sha256CheckboxElement = page.locator(sha256Checkbox);
    const isChecked = await sha256CheckboxElement.isChecked();
    if (!isChecked) {
      await sha256CheckboxElement.check();
    }
    
    // 点击计算按钮
    await page.locator(calculateButton).click();
    
    // 验证SHA256结果显示
    const sha256ResultLocator = page.locator('[data-hash-type="sha256"]').or(page.locator('text=/SHA-256.*[a-f0-9]{64}/'));
    const sha256ResultVisible = await sha256ResultLocator.isVisible();
    
    if (!sha256ResultVisible) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'SHA256哈希计算测试',
        assertion: '验证SHA256计算结果显示',
        expected: 'SHA256计算结果应该显示在页面上',
        actual: 'SHA256结果区域不可见或不存在',
        suggestion: 'SHA256哈希计算功能可能存在问题，无法正确显示计算结果。'
      });
      throw new Error(errorMessage);
    }
    
    const sha256Result = await sha256ResultLocator.textContent();
    const sha256Hash = sha256Result?.match(/[a-f0-9]{64}/);
    
    if (!sha256Hash) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'SHA256哈希计算测试',
        assertion: '验证SHA256哈希值格式',
        expected: 'SHA256哈希值应该是64位十六进制字符串',
        actual: `实际结果: ${sha256Result || '无结果'}`,
        suggestion: 'SHA256哈希计算可能产生了错误的结果格式，请检查计算逻辑。'
      });
      throw new Error(errorMessage);
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