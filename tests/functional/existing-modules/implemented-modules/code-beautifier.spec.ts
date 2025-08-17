import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../../utils/test-helpers';

test.describe('Dev Forge Code Beautifier工具页面', () => {

  const url = 'https://www.001236.xyz/en/beautifier';
  
  // 页面元素选择器 - 基于实际页面结构
  const inputTextarea = 'textarea[placeholder="Paste or enter code to beautify"]';
  const outputTextarea = 'textarea[placeholder="Beautified code will be displayed here"]';
  const formatButton = 'button:has-text("Format")';
  const copyButton = 'button:has-text("Copy")';
  const clearButton = 'button:has-text("Clear")';
  const languageButtons = {
    javascript: 'button:has-text("JavaScript")',
    typescript: 'button:has-text("TypeScript")',
    json: 'button:has-text("JSON")',
    html: 'button:has-text("HTML")',
    css: 'button:has-text("CSS")',
    python: 'button:has-text("Python")'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    
    // 等待页面完全加载
    await page.waitForTimeout(2000);
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题包含相关关键词
    await TestHelpers.assertPageTitle({
      page,
      expectedTitlePattern: /Dev Forge|Code|Beautifier|Format/,
      testName: '页面标题检查'
    });
    
    // 验证输入文本区域存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(inputTextarea),
      elementName: '代码输入区域',
      testName: '输入区域可见性检查'
    });
    
    // 验证输出文本区域存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(outputTextarea),
      elementName: '代码输出区域',
      testName: '输出区域可见性检查'
    });
    
    // 验证格式化按钮存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(formatButton),
      elementName: '格式化按钮',
      testName: '格式化按钮可见性检查'
    });
    
    // 验证复制按钮存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(copyButton),
      elementName: '复制按钮',
      testName: '复制按钮可见性检查'
    });
    
    // 验证清空按钮存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(clearButton),
      elementName: '清空按钮',
      testName: '清空按钮可见性检查'
    });
    
    // 验证语言选择按钮存在
    await TestHelpers.assertElementVisible({
      locator: page.locator(languageButtons.javascript),
      elementName: 'JavaScript语言选择按钮',
      testName: '语言选择按钮可见性检查'
    });
  });

  test('JavaScript代码美化功能测试', async ({ page }) => {
    await TestHelpers.assertCodeBeautification({
      page,
      inputCode: 'function test(){console.log("hello");return true;}',
      expectedOutputPattern: /function\s+test\s*\(\s*\)\s*\{[\s\S]*console\.log\s*\(\s*["']hello["']\s*\)[\s\S]*return\s+true[\s\S]*\}/,
      testName: 'JavaScript代码美化测试'
    });
  });

  test('语言选择功能测试', async ({ page }) => {
    await TestHelpers.assertLanguageSelection({
      page,
      language: 'JavaScript',
      testName: 'JavaScript语言选择测试'
    });
  });

  test('复制功能测试', async ({ page }) => {
    // 先输入一些代码并美化
    await page.locator(inputTextarea).fill('function test(){console.log("hello");}');
    await page.locator(formatButton).click();
    await page.waitForTimeout(2000);
    
    await TestHelpers.assertCopyFunctionality({
      page,
      testName: '复制功能测试'
    });
  });

  test('清空功能测试', async ({ page }) => {
    // 先输入一些代码
    await page.locator(inputTextarea).fill('function test(){console.log("hello");}');
    
    await TestHelpers.assertClearFunctionality({
      page,
      testName: '清空功能测试'
    });
  });

  test('多种代码类型美化测试', async ({ page }) => {
    // 测试JSON代码美化
    await TestHelpers.assertCodeBeautification({
      page,
      inputCode: '{"name":"test","age":25}',
      expectedOutputPattern: /\{[\s\S]*"name":[\s]*"test"[\s\S]*"age":[\s]*25[\s\S]*\}/,
      testName: 'JSON代码美化测试'
    });
  });

  test('综合功能流程测试', async ({ page }) => {
    // 测试完整的用户流程：选择语言 -> 输入代码 -> 美化 -> 复制 -> 清空
    
    // 1. 选择语言
    await TestHelpers.assertLanguageSelection({
      page,
      language: 'JavaScript',
      testName: '综合流程-语言选择'
    });
    
    // 2. 代码美化
    await TestHelpers.assertCodeBeautification({
      page,
      inputCode: 'function test(){console.log("hello");return true;}',
      expectedOutputPattern: /function\s+test\s*\(\s*\)\s*\{[\s\S]*console\.log\s*\(\s*["']hello["']\s*\)[\s\S]*return\s+true[\s\S]*\}/,
      testName: '综合流程-代码美化'
    });
    
    // 3. 复制功能
    await TestHelpers.assertCopyFunctionality({
      page,
      testName: '综合流程-复制功能'
    });
    
    // 4. 清空功能
    await TestHelpers.assertClearFunctionality({
      page,
      testName: '综合流程-清空功能'
    });
  });

});