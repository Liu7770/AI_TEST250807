import { test, expect } from '@playwright/test';
import { TestHelpersV2 } from '../utils/test-helpers-v2';
import { ErrorMessageFactory } from '../utils/test-helpers-v2';

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
    python: 'button:has-text("Python")',
    java: 'button:has-text("Java")',
    cpp: 'button:has-text("C/C++")',
    go: 'button:has-text("Go")',
    shell: 'button:has-text("Shell")'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    
    // 等待页面完全加载
    await page.waitForTimeout(2000);
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('Code Beautifier').first()).toBeVisible();
    
    // 验证主要功能元素存在
    await expect(page.locator(inputTextarea)).toBeVisible();
    await expect(page.locator(formatButton)).toBeVisible();
    await expect(page.locator(clearButton)).toBeVisible();
    
    // 验证输出文本区域存在且为只读
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(outputTextarea),
      elementName: '代码输出区域',
      testName: '输出区域可见性检查'
    });
    
    // 验证输出区域是只读的
    await expect(page.locator(outputTextarea)).toHaveAttribute('readonly', '');
    
    // 验证格式化按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(formatButton),
      elementName: '格式化按钮',
      testName: '格式化按钮可见性检查'
    });
    
    // 验证复制按钮存在但初始状态为禁用
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(copyButton),
      elementName: '复制按钮',
      testName: '复制按钮可见性检查'
    });
    
    // 验证复制按钮初始状态为禁用（这是一个重要的UX设计）
    await expect(page.locator(copyButton)).toBeDisabled();
    
    // 验证清空按钮存在
    await TestHelpersV2.assertElementVisible({
      locator: page.locator(clearButton),
      elementName: '清空按钮',
      testName: '清空按钮可见性检查'
    });
    
    // 验证所有语言选择按钮存在
    for (const [lang, selector] of Object.entries(languageButtons)) {
      const languageButton = page.locator(selector);
      const isVisible = await languageButton.isVisible();
      if (!isVisible) {
        const errorMessage = ErrorMessageFactory.create('assertion', {
          testName: '页面基本元素存在性测试',
          expected: `${lang}语言按钮应该在页面上可见`,
          actual: `${lang}语言按钮不可见或不存在`,
          suggestion: `语言选择界面可能存在布局问题，或者${lang}语言支持未正确实现。`
        });
        throw new Error(errorMessage);
      }
    }
    
    // 验证JavaScript是默认选中的语言
    const jsButton = page.locator(languageButtons.javascript);
    const jsButtonClass = await jsButton.getAttribute('class');
    if (!jsButtonClass || !jsButtonClass.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '页面基本元素存在性测试',
        expected: 'JavaScript按钮应该包含bg-indigo-500类表示选中状态',
        actual: `JavaScript按钮的class属性为: ${jsButtonClass || '无'}`,
        suggestion: '默认语言选择可能存在问题，这会影响用户的初始体验。'
      });
      throw new Error(errorMessage);
    }
  });

  test('JavaScript代码美化功能测试', async ({ page }) => {
    const inputCode = 'function test(){console.log("hello");return true;}';
    
    // 输入代码
    await page.locator(inputTextarea).fill(inputCode);
    
    // 验证复制按钮在格式化前是禁用的
    const copyButtonElement = page.locator(copyButton);
    const isInitiallyDisabled = await copyButtonElement.isDisabled();
    if (!isInitiallyDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'JavaScript代码美化功能测试',
        expected: '复制按钮应该在没有格式化结果时处于禁用状态',
        actual: '复制按钮处于可用状态',
        suggestion: '这是UX设计问题：复制按钮应该只在有内容可复制时才启用，避免用户困惑。'
      });
      throw new Error(errorMessage);
    }
    
    // 点击格式化按钮
    await page.locator(formatButton).click();
    
    // 等待格式化完成
    await page.waitForTimeout(1000);
    
    // 验证输出区域有内容
    const outputContent = await page.locator(outputTextarea).inputValue();
    if (!outputContent || outputContent.trim() === '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'JavaScript代码美化功能测试',
        expected: '输出区域应该包含格式化后的JavaScript代码',
        actual: '输出区域为空或无内容',
        suggestion: '代码美化功能可能存在问题，无法正确处理JavaScript代码格式化。'
      });
      throw new Error(errorMessage);
    }
    
    // 验证输出内容包含关键代码元素
    const missingElements = [];
    if (!outputContent.includes('function test')) missingElements.push('function test');
    if (!outputContent.includes('console.log')) missingElements.push('console.log');
    if (!outputContent.includes('return true')) missingElements.push('return true');
    
    if (missingElements.length > 0) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'JavaScript代码美化功能测试',
        expected: `输出应该包含所有原始代码元素: ${missingElements.join(', ')}`,
        actual: `缺少以下元素: ${missingElements.join(', ')}`,
        suggestion: '代码美化过程中可能丢失了部分代码内容，这是严重的功能缺陷。'
      });
      throw new Error(errorMessage);
    }
    
    // 验证代码被正确格式化（应该有换行和缩进）
    if (!outputContent.match(/function\s+test\s*\(\s*\)\s*\{[\s\S]*\}/)) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'JavaScript代码美化功能测试',
        expected: '代码应该被正确格式化，包含适当的换行和缩进',
        actual: '代码格式化不符合预期的JavaScript语法结构',
        suggestion: '代码美化功能可能没有正确处理JavaScript语法格式化。'
      });
      throw new Error(errorMessage);
    }
    
    // 验证格式化后复制按钮变为可用
    const isCopyButtonEnabled = await page.locator(copyButton).isEnabled();
    if (!isCopyButtonEnabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: 'JavaScript代码美化功能测试',
        expected: '复制按钮应该在有格式化结果时变为可用状态',
        actual: '复制按钮仍然处于禁用状态',
        suggestion: '这是UX问题：用户完成格式化后应该能够复制结果，按钮状态应该相应更新。'
      });
      throw new Error(errorMessage);
    }
  });

  test('语言选择功能测试', async ({ page }) => {
    // 验证JavaScript默认选中
    const jsButtonClass = await page.locator(languageButtons.javascript).getAttribute('class');
    if (!jsButtonClass || !jsButtonClass.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '语言选择功能测试',
        expected: 'JavaScript按钮应该包含bg-indigo-500类表示选中状态',
        actual: `JavaScript按钮的class属性为: ${jsButtonClass || '无'}`,
        suggestion: '默认语言选择可能存在问题，这会影响用户的初始体验。'
      });
      throw new Error(errorMessage);
    }
    
    // 点击TypeScript按钮
    await page.locator(languageButtons.typescript).click();
    
    // 验证TypeScript被选中，JavaScript不再选中
    const tsButtonClass = await page.locator(languageButtons.typescript).getAttribute('class');
    if (!tsButtonClass || !tsButtonClass.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '语言选择功能测试',
        expected: 'TypeScript按钮应该包含bg-indigo-500类表示选中状态',
        actual: `TypeScript按钮的class属性为: ${tsButtonClass || '无'}`,
        suggestion: 'TypeScript语言选择功能可能存在问题，按钮状态未正确更新。'
      });
      throw new Error(errorMessage);
    }
    
    const jsButtonClassAfterTS = await page.locator(languageButtons.javascript).getAttribute('class');
    if (jsButtonClassAfterTS && jsButtonClassAfterTS.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '语言选择功能测试',
        expected: '选择TypeScript时，JavaScript按钮不应该包含bg-indigo-500类',
        actual: 'JavaScript按钮仍然包含bg-indigo-500类，表示同时选中多个语言',
        suggestion: '语言选择逻辑存在问题：同时只能选中一种语言，这是互斥选择的基本要求。'
      });
      throw new Error(errorMessage);
    }
    
    // 点击JSON按钮
    await page.locator(languageButtons.json).click();
    
    // 验证JSON被选中，TypeScript不再选中
    const jsonButtonClass = await page.locator(languageButtons.json).getAttribute('class');
    if (!jsonButtonClass || !jsonButtonClass.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '语言选择功能测试',
        expected: 'JSON按钮应该包含bg-indigo-500类表示选中状态',
        actual: `JSON按钮的class属性为: ${jsonButtonClass || '无'}`,
        suggestion: 'JSON语言选择功能可能存在问题，按钮状态未正确更新。'
      });
      throw new Error(errorMessage);
    }
    
    const tsButtonClassAfterJSON = await page.locator(languageButtons.typescript).getAttribute('class');
    if (tsButtonClassAfterJSON && tsButtonClassAfterJSON.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '语言选择功能测试',
        expected: '选择JSON时，TypeScript按钮不应该包含bg-indigo-500类',
        actual: 'TypeScript按钮仍然包含bg-indigo-500类，表示同时选中多个语言',
        suggestion: '语言选择逻辑存在问题：同时只能选中一种语言，这是互斥选择的基本要求。'
      });
      throw new Error(errorMessage);
    }
    
    // 测试其他语言按钮
    const languagesToTest = ['html', 'css', 'python', 'java', 'cpp', 'go', 'shell'];
    for (const lang of languagesToTest) {
      await page.locator(languageButtons[lang]).click();
      
      const buttonClass = await page.locator(languageButtons[lang]).getAttribute('class');
      if (!buttonClass || !buttonClass.includes('bg-indigo-500')) {
        const errorMessage = ErrorMessageFactory.create('assertion', {
          testName: '语言选择功能测试',
          expected: `${lang}按钮应该包含bg-indigo-500类表示选中状态`,
          actual: `${lang}按钮的class属性为: ${buttonClass || '无'}`,
          suggestion: `${lang}语言选择功能可能存在问题，按钮状态未正确更新。`
        });
        throw new Error(errorMessage);
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    // 验证复制按钮初始状态为禁用
    const initialCopyButtonState = await page.locator(copyButton).isDisabled();
    if (!initialCopyButtonState) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '复制功能测试',
        expected: '复制按钮在没有格式化结果时应该处于禁用状态',
        actual: '复制按钮处于可用状态',
        suggestion: '这是UX设计问题：复制按钮应该只在有内容可复制时才启用。'
      });
      throw new Error(errorMessage);
    }
    
    // 输入代码并格式化
    const inputCode = 'function test(){console.log("hello");}';
    await page.locator(inputTextarea).fill(inputCode);
    await page.locator(formatButton).click();
    await page.waitForTimeout(1000);
    
    // 验证格式化后复制按钮变为可用
    const copyButtonAfterFormat = await page.locator(copyButton).isEnabled();
    if (!copyButtonAfterFormat) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '复制功能测试',
        expected: '格式化完成后复制按钮应该变为可用状态',
        actual: '复制按钮仍然处于禁用状态',
        suggestion: '复制功能可能存在问题，用户无法复制格式化后的代码。'
      });
      throw new Error(errorMessage);
    }
    
    // 点击复制按钮（注意：实际的复制功能需要特殊权限，这里主要测试按钮状态）
    await page.locator(copyButton).click();
    
    // 验证复制按钮仍然可用（复制后不应该禁用）
    const copyButtonAfterCopy = await page.locator(copyButton).isEnabled();
    if (!copyButtonAfterCopy) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '复制功能测试',
        expected: '复制操作后按钮应该保持可用状态，允许重复复制',
        actual: '复制按钮在点击后变为禁用状态',
        suggestion: '复制功能的UX设计可能存在问题，用户应该能够多次复制同一内容。'
      });
      throw new Error(errorMessage);
    }
  });

  test('清空功能测试', async ({ page }) => {
    // 输入一些代码
    const inputCode = 'function test(){console.log("hello");}';
    await page.locator(inputTextarea).fill(inputCode);
    
    // 验证输入区域有内容
    const inputValue = await page.locator(inputTextarea).inputValue();
    if (inputValue !== inputCode) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '清空功能测试',
        expected: `输入区域应该包含代码: ${inputCode}`,
        actual: `实际输入区域内容: ${inputValue}`,
        suggestion: '代码输入功能可能存在问题，这会影响后续的清空功能测试。'
      });
      throw new Error(errorMessage);
    }
    
    // 点击清空按钮
    await page.locator(clearButton).click();
    
    // 验证输入区域被清空
    const inputValueAfterClear = await page.locator(inputTextarea).inputValue();
    if (inputValueAfterClear !== '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '清空功能测试',
        expected: '输入区域应该被完全清空',
        actual: `输入区域仍然包含内容: ${inputValueAfterClear}`,
        suggestion: '清空功能可能存在问题，无法正确清除输入区域的内容。'
      });
      throw new Error(errorMessage);
    }
    
    // 验证输出区域也被清空（如果之前有内容的话）
    const outputValueAfterClear = await page.locator(outputTextarea).inputValue();
    if (outputValueAfterClear !== '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '清空功能测试',
        expected: '输出区域应该被完全清空',
        actual: `输出区域仍然包含内容: ${outputValueAfterClear}`,
        suggestion: '清空功能可能存在问题，无法正确清除输出区域的内容。'
      });
      throw new Error(errorMessage);
    }
    
    // 验证复制按钮重新变为禁用状态
    const copyButtonAfterClear = await page.locator(copyButton).isDisabled();
    if (!copyButtonAfterClear) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '清空功能测试',
        expected: '清空操作后复制按钮应该重新变为禁用状态',
        actual: '复制按钮仍然处于可用状态',
        suggestion: '清空功能可能没有正确重置复制按钮状态，这会导致用户体验不一致。'
      });
      throw new Error(errorMessage);
    }
  });

  test('多种代码类型美化测试', async ({ page }) => {
    // 测试JSON代码美化
    await TestHelpersV2.assertCodeBeautification({
      page,
      inputCode: '{"name":"test","age":25}',
      expectedOutputPattern: /\{[\s\S]*"name":[\s]*"test"[\s\S]*"age":[\s]*25[\s\S]*\}/,
      testName: 'JSON代码美化测试'
    });
  });

  test('综合测试：完整用户工作流程', async ({ page }) => {
    const inputCode = 'function test(){console.log("hello");return true;}';
    
    // 1. 验证初始状态
    const initialCopyDisabled = await page.locator(copyButton).isDisabled();
    if (!initialCopyDisabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '复制按钮在页面加载时应该处于禁用状态',
        actual: '复制按钮处于可用状态',
        suggestion: '初始状态不正确，这会影响用户对功能的理解和使用。'
      });
      throw new Error(errorMessage);
    }
    
    const initialJSSelected = await page.locator(languageButtons.javascript).getAttribute('class');
    if (!initialJSSelected || !initialJSSelected.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: 'JavaScript应该是默认选中的语言',
        actual: `JavaScript按钮的class属性为: ${initialJSSelected || '无'}`,
        suggestion: '默认语言选择不正确，这会影响用户的初始体验。'
      });
      throw new Error(errorMessage);
    }
    
    // 2. 选择TypeScript语言
    await page.locator(languageButtons.typescript).click();
    const tsSelected = await page.locator(languageButtons.typescript).getAttribute('class');
    if (!tsSelected || !tsSelected.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: 'TypeScript按钮应该包含bg-indigo-500类表示选中状态',
        actual: `TypeScript按钮的class属性为: ${tsSelected || '无'}`,
        suggestion: 'TypeScript语言选择功能存在问题，影响用户切换语言的体验。'
      });
      throw new Error(errorMessage);
    }
    
    const jsDeselected = await page.locator(languageButtons.javascript).getAttribute('class');
    if (jsDeselected && jsDeselected.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '选择TypeScript时JavaScript按钮不应该保持选中状态',
        actual: 'JavaScript按钮仍然包含bg-indigo-500类',
        suggestion: '语言选择逻辑存在问题：不能同时选中多种语言。'
      });
      throw new Error(errorMessage);
    }
    
    // 3. 输入代码
    await page.locator(inputTextarea).fill(inputCode);
    const inputValue = await page.locator(inputTextarea).inputValue();
    if (inputValue !== inputCode) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: `输入区域应该包含代码: ${inputCode}`,
        actual: `实际输入区域内容: ${inputValue}`,
        suggestion: '代码输入功能可能存在问题，这会影响后续的格式化测试。'
      });
      throw new Error(errorMessage);
    }
    
    // 4. 格式化代码
    await page.locator(formatButton).click();
    await page.waitForTimeout(1000);
    
    // 5. 验证格式化结果
    const outputContent = await page.locator(outputTextarea).inputValue();
    if (!outputContent || outputContent.trim() === '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '格式化后应该产生有效的输出内容',
        actual: '输出区域为空或无内容',
        suggestion: '代码格式化功能可能存在问题，无法正确处理代码。'
      });
      throw new Error(errorMessage);
    }
    
    if (!outputContent.includes('function test')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '格式化输出应该包含原始代码的关键元素',
        actual: `输出内容缺少关键元素，当前输出: ${outputContent.substring(0, 100)}...`,
        suggestion: '代码格式化过程中可能丢失了部分内容。'
      });
      throw new Error(errorMessage);
    }
    
    // 6. 验证复制按钮可用并点击
    const copyEnabled = await page.locator(copyButton).isEnabled();
    if (!copyEnabled) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '格式化完成后复制按钮应该变为可用状态',
        actual: '复制按钮仍然处于禁用状态',
        suggestion: '复制功能可能存在问题，用户无法复制格式化后的代码。'
      });
      throw new Error(errorMessage);
    }
    
    await page.locator(copyButton).click();
    
    // 7. 清空所有内容
    await page.locator(clearButton).click();
    
    const clearedInput = await page.locator(inputTextarea).inputValue();
    if (clearedInput !== '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '清空操作后输入区域应该为空',
        actual: `输入区域仍然包含内容: ${clearedInput}`,
        suggestion: '清空功能可能存在问题，无法正确清除输入内容。'
      });
      throw new Error(errorMessage);
    }
    
    const clearedOutput = await page.locator(outputTextarea).inputValue();
    if (clearedOutput !== '') {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '清空操作后输出区域应该为空',
        actual: `输出区域仍然包含内容: ${clearedOutput}`,
        suggestion: '清空功能可能存在问题，无法正确清除输出内容。'
      });
      throw new Error(errorMessage);
    }
    
    const copyDisabledAfterClear = await page.locator(copyButton).isDisabled();
    if (!copyDisabledAfterClear) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '清空操作后复制按钮应该重新变为禁用状态',
        actual: '复制按钮仍然处于可用状态',
        suggestion: '清空功能可能没有正确重置复制按钮状态。'
      });
      throw new Error(errorMessage);
    }
    
    // 8. 验证语言选择保持不变
    const tsStillSelected = await page.locator(languageButtons.typescript).getAttribute('class');
    if (!tsStillSelected || !tsStillSelected.includes('bg-indigo-500')) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '完整用户工作流测试',
        expected: '清空操作后TypeScript语言选择应该保持不变',
        actual: `TypeScript按钮的class属性为: ${tsStillSelected || '无'}`,
        suggestion: '清空功能不应该影响语言选择状态，这是重要的用户体验要求。'
      });
      throw new Error(errorMessage);
    }
  });

});