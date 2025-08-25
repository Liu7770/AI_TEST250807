import { test, expect } from '@playwright/test';
import { TestHelpersV2 } from '../utils/test-helpers-v2';
import { ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('Dev Forge Base Converter工具页面', () => {

  const url = 'https://www.001236.xyz/en/base';
  const numberInput = 'input[type="text"]';
  const inputBaseSelect = 'select';
  const clearButton = 'button:has-text("Clear")';
  const copyButtons = 'button:has-text("Copy")';
  const binaryResult = 'div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div:nth-child(1) code';
  const octalResult = 'div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div:nth-child(2) code';
  const decimalResult = 'div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div:nth-child(3) code';
  const hexResult = 'div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6 > div:nth-child(4) code';
  
  // 注意：这个页面没有单独的输出进制选择器和转换按钮，转换是自动进行的
  const fromBaseSelect = inputBaseSelect; // 使用输入进制选择器
  const toBaseSelect = inputBaseSelect; // 页面没有输出进制选择器
  const convertButton = clearButton; // 页面没有转换按钮
  const resultArea = binaryResult; // 使用二进制结果作为通用结果区域

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('Base Converter').first()).toBeVisible();
    
    // 验证输入控件存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(numberInput),
      elementName: '数字输入框'
    });
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(inputBaseSelect),
      elementName: '输入进制选择器'
    });
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(clearButton),
      elementName: '清空按钮'
    });
    
    // 验证结果区域存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(binaryResult),
      elementName: '二进制结果区域'
    });
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(octalResult),
      elementName: '八进制结果区域'
    });
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(decimalResult),
      elementName: '十进制结果区域'
    });
    await TestHelpersV2.assertElementVisible({
       locator: page.locator(hexResult),
       elementName: '十六进制结果区域'
     });
  });

  test('十进制转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 选择十进制作为输入进制
    await page.locator(inputBaseSelect).selectOption('10');
    
    // 输入数字255
    await page.locator(numberInput).fill('255');
    
    // 验证各进制转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '11111111',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '377',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '255',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: 'FF',
      elementName: '十六进制结果'
    });
  });

  test('二进制转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 选择二进制作为输入进制
    await page.locator(inputBaseSelect).selectOption('2');
    
    // 输入二进制数11111111
    await page.locator(numberInput).fill('11111111');
    
    // 验证各进制转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '11111111',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '377',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '255',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: 'FF',
      elementName: '十六进制结果'
    });
  });

  test('十进制到十六进制转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十进制
    await page.selectOption(inputBaseSelect, '10');
    
    // 测试转换
    const testCases = [
      { decimal: '255', hex: 'FF' },
      { decimal: '16', hex: '10' },
      { decimal: '10', hex: 'A' },
      { decimal: '15', hex: 'F' },
      { decimal: '0', hex: '0' }
    ];
    
    for (const testCase of testCases) {
      await page.fill(numberInput, testCase.decimal);
      // 等待转换完成
      await page.waitForTimeout(500);
      
      // 验证十六进制结果
      await helpers.assertTextContent({
        locator: page.locator(hexResult),
        expectedText: testCase.hex,
        elementName: `十六进制结果(输入${testCase.decimal})`
      });
    }
  });

  test('十六进制转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十六进制
    await page.selectOption(inputBaseSelect, '16');
    
    // 输入十六进制数字FF
    await page.fill(numberInput, 'FF');
    await page.waitForTimeout(500);
    
    // 验证各进制转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '11111111',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '377',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '255',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: 'FF',
      elementName: '十六进制结果'
    });
  });

  test('八进制转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为八进制
    await page.selectOption(inputBaseSelect, '8');
    
    // 输入八进制数字377
    await page.fill(numberInput, '377');
    await page.waitForTimeout(500);
    
    // 验证各进制转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '11111111',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '377',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '255',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: 'FF',
      elementName: '十六进制结果'
    });
  });



  test('无效输入处理测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置为二进制输入并测试无效输入
    await page.selectOption(inputBaseSelect, '2');
    
    // 测试完全无效的输入
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: 'abc',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '二进制无效输入处理测试'
    });
  });

  test('空输入处理测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试空输入处理
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: '',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '空输入处理测试'
    });
  });

  test('大数字转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十进制
    await page.selectOption(inputBaseSelect, '10');
    
    // 测试大数字1000000
    await page.fill(numberInput, '1000000');
    await page.waitForTimeout(500);
    
    // 验证十六进制结果
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: 'F4240',
      elementName: '十六进制结果'
    });
  });

  test('负数输入处理测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十进制
    await page.selectOption(inputBaseSelect, '10');
    
    // 测试负数输入
    await page.fill(numberInput, '-10');
    await page.waitForTimeout(500);
    
    // 验证负数转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '-1010',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '-12',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '-10',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '-A',
      elementName: '十六进制结果'
    });
  });



  test('复制功能测试', async ({ page }) => {
    // 输入数字进行转换
    await page.fill(numberInput, '255');
    
    // 获取所有复制按钮并点击第一个
    const copyBtns = page.locator(copyButtons);
    await TestHelpersV2.assertElementVisible({
      locator: copyBtns.first(),
      elementName: '复制按钮'
    });
    await copyBtns.first().click();
    
    // 验证复制按钮可以正常点击（没有报错）
    await expect(copyBtns.first()).toBeEnabled();
  });

  test('清空功能测试', async ({ page }) => {
    // 先输入一些数据
    await page.selectOption(inputBaseSelect, '10');
    await page.fill(numberInput, '123');
    await page.waitForTimeout(500);
    
    // 验证数据已输入
    await expect(page.locator(decimalResult)).toHaveText('123');
    
    // 执行清空操作
    await page.click(clearButton);
    await page.waitForTimeout(500);
    
    // 验证输入框已清空
    await expect(page.locator(numberInput)).toHaveValue('');
    
    // 验证所有结果区域已清空或显示默认值
    const binaryText = await page.locator(binaryResult).textContent();
    const octalText = await page.locator(octalResult).textContent();
    const decimalText = await page.locator(decimalResult).textContent();
    const hexText = await page.locator(hexResult).textContent();
    
    expect(binaryText?.trim() === '' || binaryText?.includes('—')).toBeTruthy();
    expect(octalText?.trim() === '' || octalText?.includes('—')).toBeTruthy();
    expect(decimalText?.trim() === '' || decimalText?.includes('—')).toBeTruthy();
    expect(hexText?.trim() === '' || hexText?.includes('—')).toBeTruthy();
  });

  test('大数值转换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十进制
    await page.selectOption(inputBaseSelect, '10');
    
    // 输入大数值1024
    await page.fill(numberInput, '1024');
    await page.waitForTimeout(500);
    
    // 验证大数值转换结果
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '10000000000',
      elementName: '二进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '2000',
      elementName: '八进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '1024',
      elementName: '十进制结果'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '400',
      elementName: '十六进制结果'
    });
  });

  test('边界值测试 - 零值', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试各进制的零值输入
    const testCases = [
      { base: '2', input: '0', expected: '0' },
      { base: '8', input: '0', expected: '0' },
      { base: '10', input: '0', expected: '0' },
      { base: '16', input: '0', expected: '0' }
    ];
    
    for (const testCase of testCases) {
      await page.selectOption(inputBaseSelect, testCase.base);
      await page.fill(numberInput, testCase.input);
      await page.waitForTimeout(500);
      
      // 验证所有进制的结果都是0
      await helpers.assertTextContent({
        locator: page.locator(binaryResult),
        expectedText: '0',
        elementName: `二进制结果(${testCase.base}进制输入)`
      });
      await helpers.assertTextContent({
        locator: page.locator(octalResult),
        expectedText: '0',
        elementName: `八进制结果(${testCase.base}进制输入)`
      });
      await helpers.assertTextContent({
        locator: page.locator(decimalResult),
        expectedText: '0',
        elementName: `十进制结果(${testCase.base}进制输入)`
      });
      await helpers.assertTextContent({
        locator: page.locator(hexResult),
        expectedText: '0',
        elementName: `十六进制结果(${testCase.base}进制输入)`
      });
    }
  });

  test('边界值测试 - 最大单字节值', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试255（单字节最大值）在各进制下的转换
    const testCases = [
      { base: '2', input: '11111111' },
      { base: '8', input: '377' },
      { base: '10', input: '255' },
      { base: '16', input: 'FF' }
    ];
    
    for (const testCase of testCases) {
      await page.selectOption(inputBaseSelect, testCase.base);
      await page.fill(numberInput, testCase.input);
      await page.waitForTimeout(500);
      
      // 验证转换结果
      await helpers.assertTextContent({
        locator: page.locator(binaryResult),
        expectedText: '11111111',
        elementName: `二进制结果(${testCase.base}进制输入${testCase.input})`
      });
      await helpers.assertTextContent({
        locator: page.locator(octalResult),
        expectedText: '377',
        elementName: `八进制结果(${testCase.base}进制输入${testCase.input})`
      });
      await helpers.assertTextContent({
        locator: page.locator(decimalResult),
        expectedText: '255',
        elementName: `十进制结果(${testCase.base}进制输入${testCase.input})`
      });
      await helpers.assertTextContent({
        locator: page.locator(hexResult),
        expectedText: 'FF',
        elementName: `十六进制结果(${testCase.base}进制输入${testCase.input})`
      });
    }
  });

  test('十六进制字母大小写测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十六进制
    await page.selectOption(inputBaseSelect, '16');
    
    const expectedBinary = '101010111100';
    const expectedOctal = '5274';
    const expectedDecimal = '2748';
    const expectedHex = 'ABC';
    
    // 测试小写字母
    await page.fill(numberInput, 'abc');
    await page.waitForTimeout(500);
    
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: expectedBinary,
      elementName: '二进制结果(小写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: expectedOctal,
      elementName: '八进制结果(小写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: expectedDecimal,
      elementName: '十进制结果(小写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: expectedHex,
      elementName: '十六进制结果(小写输入)'
    });
    
    // 测试大写字母
    await page.fill(numberInput, 'ABC');
    await page.waitForTimeout(500);
    
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: expectedBinary,
      elementName: '二进制结果(大写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: expectedOctal,
      elementName: '八进制结果(大写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: expectedDecimal,
      elementName: '十进制结果(大写输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: expectedHex,
      elementName: '十六进制结果(大写输入)'
    });
  });

  test('二进制无效字符测试与UX验证', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为二进制
    await page.selectOption(inputBaseSelect, '2');
    
    // 测试完全无效的输入
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: '234',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '二进制完全无效输入处理测试'
    });
    
    // 测试部分有效的输入（前面有效，后面无效）- 包含UX问题验证
    await page.fill(numberInput, '1012');
    await page.waitForTimeout(500);
    
    // 验证结果基于有效部分（101）
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '101',
      elementName: '二进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '5',
      elementName: '八进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '5',
      elementName: '十进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '5',
      elementName: '十六进制结果(部分有效输入)'
    });
    
    // UX问题验证：检查是否有用户反馈机制
    // 注意：这里暴露了UX问题 - 页面静默忽略无效字符"2"，用户不知道发生了什么
    // 理想的UX应该：实时高亮无效字符，显示"已忽略字符2"的提示
    TestHelpersV2.failWithUXIssue({
      testName: '二进制无效字符测试与UX验证',
      input: '1012',
      expected: '显示错误提示"2不是有效的二进制字符"或拒绝输入',
      actual: '静默处理为"101"，忽略无效字符"2"',
      uxIssue: '页面静默忽略无效字符，用户不知道输入被修改，缺乏明确的错误反馈',
      suggestion: '实时高亮无效字符，显示明确的错误提示，提供二进制输入格式说明(仅0和1)'
    });
  });

  test('八进制无效字符测试与UX验证', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为八进制
    await page.selectOption(inputBaseSelect, '8');
    
    // 测试完全无效的八进制输入
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: 'xyz',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '八进制完全无效输入'
    });
    
    // 测试部分有效的八进制输入（前面有效，后面无效）- 包含UX问题验证
    await page.fill(numberInput, '789');
    await page.waitForTimeout(500);
    
    // 验证结果基于有效部分（7）
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '111',
      elementName: '二进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '7',
      elementName: '八进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '7',
      elementName: '十进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '7',
      elementName: '十六进制结果(部分有效输入)'
    });
    
    // UX问题验证：检查是否有用户反馈机制
    // 注意：这里暴露了UX问题 - 页面静默截断输入"789"为"7"，用户不理解八进制规则
    // 理想的UX应该：显示错误提示"8和9不是有效的八进制字符"
    TestHelpersV2.failWithUXIssue({
      testName: '八进制无效字符测试与UX验证',
      input: '789',
      expected: '显示错误提示"8和9不是有效的八进制字符"或拒绝输入',
      actual: '静默处理为"7"，截断无效字符"8"和"9"',
      uxIssue: '页面静默截断输入，用户不理解八进制规则，缺乏教育性反馈',
      suggestion: '显示明确的错误提示，提供八进制规则说明(仅0-7)，实时验证输入字符'
    });
  });

  test('十六进制无效字符测试与UX验证', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十六进制
    await page.selectOption(inputBaseSelect, '16');
    
    // 测试完全无效的十六进制输入
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: 'XYZ',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '十六进制完全无效输入'
    });
    
    // 测试部分有效的十六进制输入（前面有效，后面无效）- 包含UX问题验证
    await page.fill(numberInput, '1G2');
    await page.waitForTimeout(500);
    
    // 验证结果基于有效部分（1）
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '1',
      elementName: '二进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(octalResult),
      expectedText: '1',
      elementName: '八进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '1',
      elementName: '十进制结果(部分有效输入)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '1',
      elementName: '十六进制结果(部分有效输入)'
    });
    
    // UX问题验证：检查是否有用户反馈机制
    // 注意：这里暴露了UX问题 - 页面静默截断输入"1G2"为"1"，用户不知道G和2被忽略
    // 理想的UX应该：实时高亮无效字符，显示"G和2不是有效的十六进制字符"的提示
    TestHelpersV2.failWithUXIssue({
      testName: '十六进制无效字符测试与UX验证',
      input: '1G2',
      expected: '显示错误提示"G不是有效的十六进制字符"或拒绝输入',
      actual: '静默处理为"1"，忽略无效字符"G"和"2"',
      uxIssue: '页面静默截断输入，用户不知道哪些字符被忽略，缺乏明确的错误指示',
      suggestion: '实时高亮无效字符，显示明确的错误提示，提供十六进制字符范围说明(0-9,A-F)'
    });
  });

  test('连续输入测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试连续输入不同数值
    const testCases = [
      { base: '10', input: '10', expectedDec: '10' },
      { base: '10', input: '20', expectedDec: '20' },
      { base: '16', input: 'A', expectedDec: '10' },
      { base: '2', input: '1010', expectedDec: '10' }
    ];
    
    for (const testCase of testCases) {
      await page.selectOption(inputBaseSelect, testCase.base);
      await page.fill(numberInput, testCase.input);
      await page.waitForTimeout(500);
      
      await helpers.assertTextContent({
        locator: page.locator(decimalResult),
        expectedText: testCase.expectedDec,
        elementName: `十进制结果(${testCase.base}进制输入${testCase.input})`
      });
    }
  });

  test('进制切换测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 输入一个数值，然后切换不同的输入进制
    await page.fill(numberInput, '10');
    
    // 测试在十进制下
    await page.selectOption(inputBaseSelect, '10');
    await page.waitForTimeout(1000);
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '10',
      elementName: '十进制结果(十进制输入10)'
    });
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '1010',
      elementName: '二进制结果(十进制输入10)'
    });
    
    // 切换到二进制（10在二进制下是2）
    await page.selectOption(inputBaseSelect, '2');
    await page.waitForTimeout(1000);
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '2',
      elementName: '十进制结果(二进制输入10)'
    });
    await helpers.assertTextContent({
      locator: page.locator(binaryResult),
      expectedText: '10',
      elementName: '二进制结果(二进制输入10)'
    });
    
    // 切换到十六进制（10在十六进制下是16）
    await page.selectOption(inputBaseSelect, '16');
    await page.waitForTimeout(1000);
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '16',
      elementName: '十进制结果(十六进制输入10)'
    });
    await helpers.assertTextContent({
      locator: page.locator(hexResult),
      expectedText: '10',
      elementName: '十六进制结果(十六进制输入10)'
    });
  });

  test('复制按钮状态测试', async ({ page }) => {
    // 测试空输入时复制按钮状态
    await page.fill(numberInput, '');
    await page.waitForTimeout(500);
    
    const copyBtns = page.locator(copyButtons);
    
    // 验证复制按钮在空输入时的状态（可能被禁用或保持启用）
    const firstBtnEnabled = await copyBtns.first().isEnabled();
    expect(typeof firstBtnEnabled).toBe('boolean');
    
    // 输入数值后复制按钮应该可用
    await page.fill(numberInput, '255');
    await page.waitForTimeout(500);
    
    for (let i = 0; i < await copyBtns.count(); i++) {
      const btn = copyBtns.nth(i);
      await expect(btn).toBeEnabled();
    }
  });

  test('小数点输入测试与UX验证', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 设置输入进制为十进制
    await page.selectOption(inputBaseSelect, '10');
    
    // 测试小数点输入处理 - 包含UX问题验证
    await page.fill(numberInput, '10.5');
    await page.waitForTimeout(500);
    
    // 验证页面如何处理小数点输入（通常会截断为整数部分）
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: '10',
      elementName: '十进制结果(小数点输入)'
    });
    
    // UX问题验证：检查是否有用户反馈机制
    // 注意：这里暴露了UX问题 - 页面静默截断小数"10.5"为"10"，用户不知道小数部分被忽略
    // 理想的UX应该：显示警告"小数部分已被忽略"或"仅支持整数转换"
    TestHelpersV2.failWithUXIssue({
      testName: '小数点输入测试与UX验证',
      input: '10.5',
      expected: '显示警告"小数部分已被忽略"或"仅支持整数转换"',
      actual: '静默处理为"10"，忽略小数部分".5"',
      uxIssue: '页面静默截断小数为整数部分，用户不知道小数部分被忽略，缺乏小数处理说明',
      suggestion: '显示小数处理警告，提供整数限制说明，或考虑支持小数转换'
    });
    
    // 继续使用原有的无效输入处理测试作为补充
    await TestHelpersV2.assertGeneralInvalidInputHandling({
      page,
      inputSelector: numberInput,
      invalidInput: 'abc.def',
      resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
      testName: '完全无效的小数点输入处理测试'
    });
  });

  test('特殊字符输入测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试特殊字符输入
    await page.selectOption(inputBaseSelect, '10');
    
    const specialChars = ['!@#', '+-*/', '()[]', '  '];
    
    for (const chars of specialChars) {
      await TestHelpersV2.assertGeneralInvalidInputHandling({
        page,
        inputSelector: numberInput,
        invalidInput: chars,
        resultSelectors: [binaryResult, octalResult, decimalResult, hexResult],
        testName: `特殊字符输入测试(${chars})`
      });
    }
  });

  test('长数字输入测试', async ({ page }) => {
    const helpers = new TestHelpersV2(page);
    
    // 测试非常长的数字输入
    await page.selectOption(inputBaseSelect, '10');
    
    const longNumber = '123456789012345';
    await page.fill(numberInput, longNumber);
    await page.waitForTimeout(1000); // 长数字可能需要更多处理时间
    
    // 验证长数字转换结果
    await helpers.assertTextContent({
      locator: page.locator(decimalResult),
      expectedText: longNumber,
      elementName: '十进制结果(长数字)'
    });
    
    // 验证十六进制结果存在
    const hexText = await page.locator(hexResult).textContent();
    expect(hexText?.trim()).not.toBe('');
    expect(hexText?.trim()).not.toBe('—');
  });

  test('空输入时按钮状态检查 - 详细错误信息', async ({ page }) => {
    // 清空输入框
    await page.fill(numberInput, '');
    await page.waitForTimeout(500);
    
    // 使用新的按钮状态检查方法，提供详细的错误信息
    await TestHelpersV2.buttonState({
      page,
      buttonSelector: clearButton,
      buttonText: '清空',
      expectedDisabled: true,
      testName: '空输入时清空按钮状态检查',
      config: {
        retryCount: 2,
        timeout: 5000
      }
    });
  });

});

  // 注意：UX问题记录功能已整合到主测试套件中
   // 每次运行测试时会自动收集和记录发现的UX问题

  // 注意：由于现在使用failWithUXIssue方法，UX问题会直接导致测试失败
  // 不再需要单独的UX问题报告生成测试