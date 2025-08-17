import { expect, Locator, Page } from '@playwright/test';

/**
 * 全局测试工具类，提供友好的错误提示和统一的断言方法
 */
export class TestHelpers {
  /**
   * 创建友好的错误消息格式
   */
  private static formatErrorMessage({
    testName,
    input,
    expected,
    actual,
    suggestion
  }: {
    testName: string;
    input?: string;
    expected: string;
    actual: string;
    suggestion: string;
  }): string {
    return [
      `🐛 ${testName}功能存在缺陷！`,
      input ? `📝 测试输入: "${input}"` : '',
      `✅ 预期输出: "${expected}"`,
      `❌ 实际输出: "${actual}"`,
      `🔧 建议: ${suggestion}`
    ].filter(Boolean).join('\n');
  }

  /**
   * 创建友好的错误消息
   * @param testName 测试名称
   * @param input 输入值
   * @param expected 期望值
   * @param actual 实际值
   * @param suggestion 建议
   * @returns 格式化的错误消息
   */
  static createFriendlyErrorMessage(
    testName: string,
    input: string,
    expected: string,
    actual: string,
    suggestion: string
  ): string {
    return [
      `🐛 ${testName}失败！`,
      `📝 测试输入: "${input}"`,
      `✅ 预期输出: "${expected}"`,
      `❌ 实际输出: "${actual}"`,
      `🔧 建议: ${suggestion}`
    ].join('\n');
  }

  /**
   * 创建通用的测试失败错误消息
   * @param testName 测试名称
   * @param scenario 测试场景描述
   * @param expected 期望行为
   * @param actual 实际行为
   * @param suggestion 改进建议
   * @returns 格式化的错误消息
   */
  static createTestFailureMessage(
    testName: string,
    scenario: string,
    expected: string,
    actual: string,
    suggestion: string
  ): string {
    return [
      `🐛 ${testName}失败！`,
      `📝 测试场景: ${scenario}`,
      `✅ 预期行为: ${expected}`,
      `❌ 实际行为: ${actual}`,
      `🔧 建议: ${suggestion}`
    ].join('\n');
  }

  /**
   * 创建UX体验测试失败错误消息
   * @param testName 测试名称
   * @param uxIssue UX问题描述
   * @param expectedUX 期望的UX行为
   * @param actualUX 实际的UX行为
   * @param improvement UX改进建议
   * @returns 格式化的错误消息
   */
  static createUXTestFailureMessage(
    testName: string,
    uxIssue: string,
    expectedUX: string,
    actualUX: string,
    improvement: string
  ): string {
    return [
      `🐛 ${testName}失败！`,
      `🎨 UX问题: ${uxIssue}`,
      `✅ 期望UX: ${expectedUX}`,
      `❌ 实际UX: ${actualUX}`,
      `🔧 改进建议: ${improvement}`
    ].join('\n');
  }

  /**
   * 断言文本内容
   * @param locator 元素定位器
   * @param expectedText 期望的文本内容
   * @param elementName 元素名称
   * @param testName 测试名称
   */
  static async assertTextContent({
    locator,
    expectedText,
    elementName,
    testName = '文本内容检查'
  }: {
    locator: Locator;
    expectedText: string;
    elementName: string;
    testName?: string;
  }) {
    try {
      await expect(locator).toHaveText(expectedText);
    } catch (error) {
      const actualText = await locator.textContent() || '';
      throw new Error(
        TestHelpers.formatErrorMessage({
          testName,
          expected: `${elementName}显示"${expectedText}"`,
          actual: `${elementName}显示"${actualText}"`,
          suggestion: `检查${elementName}的转换逻辑是否正确`
        })
      );
    }
  }

  /**
   * 断言文本内容（实例方法）
   * @param locator 元素定位器
   * @param expectedText 期望的文本内容
   * @param elementName 元素名称
   * @param testName 测试名称
   */
  async assertTextContent({
    locator,
    expectedText,
    elementName,
    testName = '文本内容检查'
  }: {
    locator: Locator;
    expectedText: string;
    elementName: string;
    testName?: string;
  }) {
    return TestHelpers.assertTextContent({ locator, expectedText, elementName, testName });
  }

  /**
   * 断言无效输入的通用处理
   * @param page 页面对象
   * @param inputSelector 输入框选择器
   * @param invalidInput 无效输入
   * @param resultSelectors 结果选择器数组
   * @param testName 测试名称
   */
  static async assertGeneralInvalidInputHandling({
    page,
    inputSelector,
    invalidInput,
    resultSelectors,
    testName = '无效输入处理验证'
  }: {
    page: Page;
    inputSelector: string;
    invalidInput: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    // 输入无效字符
    await page.fill(inputSelector, invalidInput);
    await page.waitForTimeout(500);
    
    // 检查是否显示错误信息（可选）
    let errorMessage = null;
    try {
      errorMessage = await page.locator('text="Invalid input"').textContent({ timeout: 1000 });
    } catch {
      // 忽略错误，继续检查结果区域
    }
    
    // 验证所有结果区域的状态
    const invalidResults = [];
    for (const selector of resultSelectors) {
      const resultText = await page.locator(selector).textContent();
      const isValidErrorState = resultText?.trim() === '' || 
                               resultText?.includes('—') || 
                               resultText?.includes('Invalid') ||
                               resultText?.includes('NaN') ||
                               resultText?.includes('Error');
      
      if (!isValidErrorState) {
        invalidResults.push({ selector, text: resultText });
      }
    }
    
    // 如果有无效的结果且没有错误信息，抛出友好的错误
    if (invalidResults.length > 0 && !errorMessage) {
      const invalidResultsText = invalidResults.map(r => `${r.selector}: "${r.text}"`).join(', ');
      throw new Error(
        TestHelpers.createUXTestFailureMessage(
          testName,
          `输入"${invalidInput}"时没有显示适当的错误提示`,
          '显示错误信息或清空结果区域',
          `结果区域仍显示内容: ${invalidResultsText}`,
          '应该在用户输入无效字符时提供明确的错误反馈，或者清空/重置结果区域'
        )
      );
    }
  }

  /**
   * 断言无效输入的通用处理（实例方法）
   */
  async assertGeneralInvalidInputHandling({
    inputSelector,
    invalidInput,
    resultSelectors,
    testName = '无效输入处理验证'
  }: {
    inputSelector: string;
    invalidInput: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    return TestHelpers.assertGeneralInvalidInputHandling({
      page: this.page,
      inputSelector,
      invalidInput,
      resultSelectors,
      testName
    });
  }

  /**
   * 暴露部分有效输入的UX问题
   * 专门用于测试页面静默处理部分有效输入时给用户造成的困惑
   * @param page 页面对象
   * @param inputSelector 输入框选择器
   * @param partialValidInput 部分有效的输入（包含无效字符）
   * @param expectedValidPart 期望被处理的有效部分
   * @param resultSelectors 结果选择器数组
   * @param testName 测试名称
   */
  static async exposePartialInputUXIssues({
    page,
    inputSelector,
    partialValidInput,
    expectedValidPart,
    resultSelectors,
    testName = '部分有效输入UX问题'
  }: {
    page: Page;
    inputSelector: string;
    partialValidInput: string;
    expectedValidPart: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    // 输入部分有效的字符
    await page.fill(inputSelector, partialValidInput);
    await page.waitForTimeout(500);
    
    // 检查是否有错误提示或用户反馈
    let hasUserFeedback = false;
    try {
      // 检查各种可能的用户反馈形式
      const feedbackSelectors = [
        '.error-message',
        '.warning-message', 
        '.info-message',
        '[data-testid="error"]',
        '[data-testid="warning"]',
        '.input-error',
        '.validation-message'
      ];
      
      for (const selector of feedbackSelectors) {
        const feedback = await page.locator(selector).count();
        if (feedback > 0) {
          hasUserFeedback = true;
          break;
        }
      }
      
      // 检查输入框是否有错误样式
      const inputElement = page.locator(inputSelector);
      const hasErrorClass = await inputElement.evaluate(el => {
        return el.classList.contains('error') || 
               el.classList.contains('invalid') ||
               el.classList.contains('warning');
      });
      
      if (hasErrorClass) {
        hasUserFeedback = true;
      }
    } catch {
      // 忽略错误，继续检查
    }
    
    // 检查结果是否基于有效部分显示
    const resultsBasedOnValidPart = [];
    for (const selector of resultSelectors) {
      const resultText = await page.locator(selector).textContent();
      if (resultText && resultText.trim() !== '') {
        resultsBasedOnValidPart.push({ selector, text: resultText.trim() });
      }
    }
    
    // 如果页面显示了基于有效部分的结果，但没有给用户任何反馈，则暴露UX问题
    if (resultsBasedOnValidPart.length > 0 && !hasUserFeedback) {
      const invalidChars = partialValidInput.replace(expectedValidPart, '');
      const resultsText = resultsBasedOnValidPart.map(r => `${r.selector}: "${r.text}"`).join(', ');
      
      throw new Error(
        TestHelpers.createUXTestFailureMessage(
          testName,
          `页面静默处理部分有效输入"${partialValidInput}"，给用户造成困惑`,
          '显示明确的错误提示或警告，告知用户哪些字符被忽略',
          `页面显示基于"${expectedValidPart}"的转换结果，但用户不知道"${invalidChars}"被忽略了`,
          `用户可能认为"${partialValidInput}"是完全有效的输入，或者怀疑转换结果的正确性。建议：1) 实时高亮无效字符 2) 显示"已忽略无效字符"的提示 3) 提供输入格式说明`
        )
      );
    }
  }

  /**
   * 暴露部分有效输入的UX问题（实例方法）
   */
  async exposePartialInputUXIssues({
    inputSelector,
    partialValidInput,
    expectedValidPart,
    resultSelectors,
    testName = '部分有效输入UX问题'
  }: {
    inputSelector: string;
    partialValidInput: string;
    expectedValidPart: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    return TestHelpers.exposePartialInputUXIssues({
      page: this.page,
      inputSelector,
      partialValidInput,
      expectedValidPart,
      resultSelectors,
      testName
    });
  }

  /**
   * 创建UX问题分析报告
   * @param testResults 测试结果数组
   * @param moduleName 模块名称
   * @returns 格式化的UX分析报告
   */
  static createUXAnalysisReport({
    testResults,
    moduleName
  }: {
    testResults: Array<{
      testName: string;
      input: string;
      issue: string;
      impact: string;
      suggestion: string;
    }>;
    moduleName: string;
  }): string {
    const reportSections = [
      `# ${moduleName} - UX问题分析报告`,
      '',
      '## 🚨 发现的UX问题',
      ''
    ];
    
    testResults.forEach((result, index) => {
      reportSections.push(
        `### ${index + 1}. ${result.testName}`,
        `- **测试输入**: \`${result.input}\``,
        `- **UX问题**: ${result.issue}`,
        `- **用户影响**: ${result.impact}`,
        `- **改进建议**: ${result.suggestion}`,
        ''
      );
    });
    
    reportSections.push(
      '## 💡 总体改进建议',
      '',
      '1. **实时输入验证**: 在用户输入时立即高亮无效字符',
      '2. **明确的错误反馈**: 显示具体的错误信息和被忽略的字符',
      '3. **用户教育**: 提供输入格式说明和示例',
      '4. **透明度提升**: 明确显示实际处理的输入内容',
      '5. **用户选择权**: 提供严格模式和宽松模式选项',
      ''
    );
    
    return reportSections.join('\n');
  }

  /**
   * UX问题断言失败方法 - 直接将UX问题定义为测试失败
   * @param testName 测试名称
   * @param input 输入值（可选）
   * @param expected 期望行为
   * @param actual 实际行为
   * @param uxIssue UX问题描述
   * @param suggestion 改进建议
   */
  static failWithUXIssue({
    testName,
    input,
    expected,
    actual,
    uxIssue,
    suggestion
  }: {
    testName: string;
    input?: string;
    expected: string;
    actual: string;
    uxIssue: string;
    suggestion: string;
  }): never {
    const errorMessage = [
      `🚨 ${testName}存在UX问题！`,
      input ? `📝 测试输入: "${input}"` : '',
      `✅ 预期行为: "${expected}"`,
      `❌ 实际行为: "${actual}"`,
      `🎯 UX问题: ${uxIssue}`,
      `🔧 改进建议: ${suggestion}`
    ].filter(Boolean).join('\n');
    
    throw new Error(errorMessage);
  }

  // 注意：UX问题收集和报告相关方法已移除
  // 现在直接使用 failWithUXIssue 方法让测试失败，在测试报告中直接显示UX问题

  /**
   * Base64编码断言 - 带友好错误提示
   */
  static async assertBase64Encoding({
    outputLocator,
    input,
    expectedOutput,
    testName = 'Base64编码'
  }: {
    outputLocator: Locator;
    input: string;
    expectedOutput: string;
    testName?: string;
  }) {
    const actualOutput = await outputLocator.textContent();
    const errorMessage = this.formatErrorMessage({
      testName,
      input,
      expected: expectedOutput,
      actual: actualOutput || '',
      suggestion: '请检查网站的编码逻辑，可能存在字符编码转换问题'
    });

    await expect(outputLocator, errorMessage).toContainText(expectedOutput);
  }

  /**
   * Base64解码断言 - 带友好错误提示
   */
  static async assertBase64Decoding({
    outputLocator,
    input,
    expectedOutput,
    testName = 'Base64解码'
  }: {
    outputLocator: Locator;
    input: string;
    expectedOutput: string;
    testName?: string;
  }) {
    const actualOutput = await outputLocator.textContent();
    const errorMessage = this.formatErrorMessage({
      testName,
      input,
      expected: expectedOutput,
      actual: actualOutput || '',
      suggestion: '请检查网站的解码逻辑，可能存在Base64解析问题'
    });

    await expect(outputLocator, errorMessage).toContainText(expectedOutput);
  }

  /**
   * 元素可见性断言 - 带友好错误提示
   */
  static async assertElementVisible({
    locator,
    elementName,
    testName = '元素可见性检查'
  }: {
    locator: Locator;
    elementName: string;
    testName?: string;
  }) {
    const errorMessage = [
      `🐛 ${testName}失败！`,
      `❌ 元素 "${elementName}" 不可见或不存在`,
      `🔧 建议: 请检查页面加载是否完成，或元素选择器是否正确`
    ].join('\n');

    await expect(locator, errorMessage).toBeVisible();
  }

  /**
   * 输入框值断言 - 带友好错误提示
   */
  static async assertInputValue({
    inputLocator,
    expectedValue,
    testName = '输入框值检查'
  }: {
    inputLocator: Locator;
    expectedValue: string;
    testName?: string;
  }) {
    const actualValue = await inputLocator.inputValue();
    const errorMessage = this.formatErrorMessage({
      testName,
      expected: expectedValue,
      actual: actualValue,
      suggestion: '请检查输入框的清空或填充功能是否正常'
    });

    await expect(inputLocator, errorMessage).toHaveValue(expectedValue);
  }

  /**
   * 页面标题断言 - 带友好错误提示
   */
  static async assertPageTitle({
    page,
    expectedTitlePattern,
    testName = '页面标题检查'
  }: {
    page: Page;
    expectedTitlePattern: string | RegExp;
    testName?: string;
  }) {
    const actualTitle = await page.title();
    const expectedStr = typeof expectedTitlePattern === 'string' 
      ? expectedTitlePattern 
      : expectedTitlePattern.toString();
    
    const errorMessage = [
      `🐛 ${testName}失败！`,
      `✅ 预期标题模式: ${expectedStr}`,
      `❌ 实际标题: "${actualTitle}"`,
      `🔧 建议: 请检查页面是否正确加载，或标题是否被正确设置`
    ].join('\n');

    await expect(page, errorMessage).toHaveTitle(expectedTitlePattern);
  }

  /**
   * 输出区域非默认内容断言 - 带友好错误提示
   */
  static async assertOutputNotDefault({
    outputLocator,
    defaultText = 'Base64 Output...',
    testName = '输出内容检查'
  }: {
    outputLocator: Locator;
    defaultText?: string;
    testName?: string;
  }) {
    const actualOutput = await outputLocator.textContent();
    const errorMessage = [
      `🐛 ${testName}失败！`,
      `❌ 输出区域仍显示默认内容: "${defaultText}"`,
      `📝 实际输出: "${actualOutput}"`,
      `🔧 建议: 请检查功能是否正常执行，或等待时间是否足够`
    ].join('\n');

    await expect(outputLocator, errorMessage).not.toContainText(defaultText);
  }

  /**
   * 通用操作：填充输入框并执行编码
   */
  static async performEncoding({
    page,
    input
  }: {
    page: Page;
    input: string;
  }) {
    // 等待页面加载完成
    await page.waitForLoadState('domcontentloaded');
    // 额外等待确保所有元素渲染完成
    await page.waitForTimeout(1000);
    
    // 等待输入框可见并填入内容
    const inputTextarea = page.locator('textarea').first();
    await inputTextarea.waitFor({ state: 'visible' });
    await inputTextarea.fill(input);
    // 等待执行编码按钮变为可用状态（注意：这是输入框下方的执行按钮，不是上方的模式切换按钮）
    // 使用按钮的样式类来区分执行按钮（执行按钮有text-sm类）
    const encodeButton = page.locator('button.text-sm:has-text("Encode")');
    await encodeButton.waitFor({ state: 'visible' });
    
    // 等待按钮变为启用状态（输入内容后按钮才会启用）
    await expect(encodeButton).toBeEnabled();
    
    await encodeButton.click();
    // 等待编码操作完成
    await page.waitForTimeout(1000);
  }

  /**
   * 通用操作：切换到解码模式并执行解码
   */
  static async performDecoding({
    page,
    input
  }: {
    page: Page;
    input: string;
  }) {
    // 先切换到解码模式（点击上方的模式切换按钮）
    const decodeModeButton = page.locator('button:has-text("Decode")').first();
    await decodeModeButton.click();
    
    // 填入要解码的内容
    await page.locator('textarea').fill(input);
    
    // 等待解码按钮变为可用状态并点击（注意：这是输入框下方的执行按钮，不是上方的模式切换按钮）
    const decodeButton = page.locator('button.text-sm:has-text("Decode")');
    await decodeButton.waitFor({ state: 'visible' });
    await expect(decodeButton).toBeEnabled();
    await decodeButton.click();
    // 等待解码操作完成
    await page.waitForTimeout(1000);
  }

  /**
   * 通用操作：清空输入
   */
  static async performClear({
    page
  }: {
    page: Page;
  }) {
    await page.click('div.flex.space-x-2 button:has-text("Clear")');
    // Playwright会自动等待清空操作完成
  }

  /**
   * JSON格式化操作 - 统一的JSON格式化功能
   */
  static async performJsonFormat({
    page,
    input
  }: {
    page: Page;
    input: string;
  }) {
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const formatBtn = page.locator('button:has-text("Format & Validate")');
    
    await inputTextarea.fill(input);
    await formatBtn.click();
    // Playwright会自动等待JSON格式化处理完成
  }

   /**
    * 实例方法 - 元素可见性断言
    */
   async assertElementVisible(selector: string, elementName: string, testName = '元素可见性检查') {
     const locator = this.page.locator(selector);
     await TestHelpers.assertElementVisible({ locator, elementName, testName });
   }

   /**
    * 实例方法 - 页面标题断言
    */
   async assertPageTitle(expectedTitlePattern: string | RegExp, testName = '页面标题检查') {
     await TestHelpers.assertPageTitle({ page: this.page, expectedTitlePattern, testName });
   }

   /**
    * 实例方法 - JSON格式化操作
    */
   async performJsonFormat(input: string) {
     await TestHelpers.performJsonFormat({ page: this.page, input });
   }

   /**
    * 密码生成操作 - 统一的密码生成功能
    */
   static async performPasswordGeneration({
     page
   }: {
     page: Page;
   }) {
     const generateBtn = page.locator('button:has-text("Generate Password Generator")');
     await generateBtn.click();
     // Playwright会自动等待密码生成完成
   }

   /**
    * 实例方法 - 密码生成操作
    */
   async performPasswordGeneration() {
     await TestHelpers.performPasswordGeneration({ page: this.page });
   }

   /**
    * 密码输出断言 - 带友好错误提示
    */
   static async assertPasswordGenerated({
     outputLocator,
     testName = '密码生成检查'
   }: {
     outputLocator: Locator;
     testName?: string;
   }) {
     const passwordText = await outputLocator.textContent();
     const errorMessage = [
       `🐛 ${testName}失败！`,
       `❌ 密码未生成或为空`,
       `实际输出: "${passwordText}"`,
       `🔧 建议: 检查密码生成逻辑是否正常工作`
     ].join('\n');

     if (!passwordText || passwordText.trim().length === 0) {
       throw new Error(errorMessage);
     }
   }

   /**
    * 实例方法 - 密码输出断言
    */
   async assertPasswordGenerated(selector: string, testName = '密码生成检查') {
     const locator = this.page.locator(selector);
     await TestHelpers.assertPasswordGenerated({ outputLocator: locator, testName });
   }

   /**
    * UUID生成操作 - 统一的UUID生成功能
    */
   static async performUuidGeneration({
     page
   }: {
     page: Page;
   }) {
     const generateBtn = page.locator('button:has-text("Generate")');
     await generateBtn.click();
     // Playwright会自动等待UUID生成完成
   }

   /**
    * 实例方法 - UUID生成操作
    */
   async performUuidGeneration() {
     await TestHelpers.performUuidGeneration({ page: this.page });
   }

   /**
    * UUID输出断言 - 带友好错误提示
    */
   static async assertUuidGenerated({
     outputLocator,
     expectedFormat = 'uuid',
     testName = 'UUID生成检查'
   }: {
     outputLocator: Locator;
     expectedFormat?: 'uuid' | 'guid';
     testName?: string;
   }) {
     const uuidText = await outputLocator.textContent();
     const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     
     const errorMessage = [
       `🐛 ${testName}失败！`,
       `❌ UUID格式不正确或未生成`,
       `实际输出: "${uuidText}"`,
       `期望格式: ${expectedFormat === 'uuid' ? '小写UUID' : '大写GUID'}`,
       `🔧 建议: 检查UUID生成逻辑和格式设置`
     ].join('\n');

     if (!uuidText || !uuidPattern.test(uuidText.trim())) {
       throw new Error(errorMessage);
     }

     // 检查大小写格式
     if (expectedFormat === 'uuid' && uuidText !== uuidText.toLowerCase()) {
       throw new Error(`${errorMessage}\n额外错误: 期望小写格式，但包含大写字符`);
     }
     if (expectedFormat === 'guid' && uuidText !== uuidText.toUpperCase()) {
       throw new Error(`${errorMessage}\n额外错误: 期望大写格式，但包含小写字符`);
     }
   }

   /**
   * 实例方法 - UUID输出断言
   */
  async assertUuidGenerated(selector: string, expectedFormat: 'uuid' | 'guid' = 'uuid', testName = 'UUID生成检查') {
    const locator = this.page.locator(selector);
    await TestHelpers.assertUuidGenerated({ outputLocator: locator, expectedFormat, testName });
  }

  /**
   * 进制转换结果断言 - 带友好错误提示
   */
  static async assertBaseConversionResult({
    outputLocator,
    expectedValue,
    baseName,
    inputValue,
    testName = '进制转换检查'
  }: {
    outputLocator: Locator;
    expectedValue: string;
    baseName: string;
    inputValue?: string;
    testName?: string;
  }) {
    const actualValue = await outputLocator.textContent();
    const errorMessage = this.formatErrorMessage({
      testName: `${baseName}${testName}`,
      input: inputValue,
      expected: expectedValue,
      actual: actualValue || '',
      suggestion: `请检查${baseName}转换逻辑，可能存在进制计算问题`
    });

    await expect(outputLocator, errorMessage).toContainText(expectedValue);
  }

  /**
   * 实例方法 - 进制转换结果断言
   */
  async assertBaseConversionResult(selector: string, expectedValue: string, baseName: string, inputValue?: string, testName = '进制转换检查') {
    const locator = this.page.locator(selector);
    await TestHelpers.assertBaseConversionResult({ outputLocator: locator, expectedValue, baseName, inputValue, testName });
  }

  /**
   * 输出区域内容断言 - 通用方法
   */
  static async assertOutputAreaContent({
    outputLocator,
    expectedContent,
    testName = '输出内容检查'
  }: {
    outputLocator: Locator;
    expectedContent: string;
    testName?: string;
  }) {
    const actualContent = await outputLocator.textContent();
    const errorMessage = [
      `🐛 ${testName}失败！`,
      `✅ 预期内容: "${expectedContent}"`,
      `❌ 实际内容: "${actualContent}"`,
      `🔧 建议: 请检查功能逻辑是否正确执行`
    ].join('\n');

    await expect(outputLocator, errorMessage).toContainText(expectedContent);
  }

  /**
   * 实例方法 - 输出区域内容断言
   */
  async assertOutputAreaContent(selector: string, expectedContent: string, testName = '输出内容检查') {
    const locator = this.page.locator(selector);
    await TestHelpers.assertOutputAreaContent({ outputLocator: locator, expectedContent, testName });
  }

  /**
   * 验证空输入处理 - 检查多个区域是否为空
   */
  static async verifyEmptyInputHandling({
    page,
    selectors,
    testName = '空输入处理验证'
  }: {
    page: Page;
    selectors: Array<{ selector: string; expectedEmpty: boolean }>;
    testName?: string;
  }) {
    for (const { selector, expectedEmpty } of selectors) {
      const locator = page.locator(selector);
      const content = await locator.textContent();
      const isEmpty = !content || content.trim() === '';
      
      if (expectedEmpty && !isEmpty) {
        const errorMessage = [
          `🐛 ${testName}失败！`,
          `❌ 区域应该为空但包含内容: "${content}"`,
          `📍 选择器: ${selector}`,
          `🔧 建议: 检查空输入处理逻辑`
        ].join('\n');
        throw new Error(errorMessage);
      }
      
      if (!expectedEmpty && isEmpty) {
        const errorMessage = [
          `🐛 ${testName}失败！`,
          `❌ 区域应该有内容但为空`,
          `📍 选择器: ${selector}`,
          `🔧 建议: 检查内容生成逻辑`
        ].join('\n');
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * 实例方法 - 验证空输入处理
   */
  async verifyEmptyInputHandling(selectors: Array<{ selector: string; expectedEmpty: boolean }>, testName = '空输入处理验证') {
    await TestHelpers.verifyEmptyInputHandling({ page: this.page, selectors, testName });
  }

  /**
   * 输入框值断言 - 实例方法
   */
  async assertInputValue(selector: string, expectedValue: string, testName = '输入框值检查') {
    const locator = this.page.locator(selector);
    await TestHelpers.assertInputValue({ inputLocator: locator, expectedValue, testName });
  }

  /**
   * 进制转换操作 - 统一的进制转换功能
   */
  static async performBaseConversion({
    page,
    input,
    inputBase = '10',
    testName = '进制转换操作'
  }: {
    page: Page;
    input: string;
    inputBase?: string;
    testName?: string;
  }) {
    try {
      // 等待页面加载完成
      await page.waitForLoadState('domcontentloaded');
      
      // 设置输入进制（如果不是默认的十进制）
      if (inputBase !== '10') {
        const inputBaseSelect = page.locator('select').first();
        await inputBaseSelect.waitFor({ state: 'visible' });
        await inputBaseSelect.selectOption(inputBase);
        await page.waitForTimeout(300); // 等待进制切换完成
      }
      
      // 填入数字
      const numberInput = page.locator('input[type="text"]').first();
      await numberInput.waitFor({ state: 'visible' });
      await numberInput.fill(input);
      
      // 等待转换完成
      await page.waitForTimeout(500);
      
    } catch (error) {
      const errorMessage = [
        `🐛 ${testName}失败！`,
        `❌ 输入值: "${input}"`,
        `❌ 输入进制: ${inputBase}`,
        `❌ 错误信息: ${error}`,
        `🔧 建议: 检查页面元素是否正确加载，或输入值是否有效`
      ].join('\n');
      throw new Error(errorMessage);
    }
  }

  /**
   * 实例方法 - 进制转换操作
   */
  async performBaseConversion(input: string, inputBase = '10', testName = '进制转换操作') {
    await TestHelpers.performBaseConversion({ page: this.page, input, inputBase, testName });
  }

  /**
   * 进制转换清空操作
   */
  static async performBaseClear({
    page,
    testName = '进制转换清空操作'
  }: {
    page: Page;
    testName?: string;
  }) {
    try {
      const clearButton = page.locator('button:has-text("Clear")');
      await clearButton.waitFor({ state: 'visible' });
      await clearButton.click();
      await page.waitForTimeout(300);
    } catch (error) {
      const errorMessage = [
        `🐛 ${testName}失败！`,
        `❌ 错误信息: ${error}`,
        `🔧 建议: 检查清空按钮是否存在且可点击`
      ].join('\n');
      throw new Error(errorMessage);
    }
  }

  /**
   * 进制转换清空操作的实例方法
   */
  async performBaseClear(testName = '进制转换清空操作') {
    await TestHelpers.performBaseClear({ page: this.page, testName });
  }

  /**
   * 无效字符输入断言 - 用于测试页面对无效输入的处理
   * 从测试角度验证用户体验问题
   */
  static async assertInvalidInputHandling({
    page,
    inputSelector,
    baseSelector,
    baseValue,
    invalidInput,
    resultSelectors,
    testName = '无效字符输入处理验证'
  }: {
    page: Page;
    inputSelector: string;
    baseSelector: string;
    baseValue: string;
    invalidInput: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    try {
      // 设置进制
      await page.selectOption(baseSelector, baseValue);
      
      // 输入无效字符
      await page.fill(inputSelector, invalidInput);
      await page.waitForTimeout(500);
      
      // 检查是否显示错误信息
      const invalidInputExists = await page.locator('text=Invalid input').count();
      
      if (invalidInputExists === 0) {
        // 如果没有错误信息，检查结果是否为空/错误状态
        let hasValidResult = false;
        for (const selector of resultSelectors) {
          const resultText = await page.locator(selector).textContent();
          if (resultText && !resultText.includes('—') && !resultText.includes('Invalid') && resultText.trim() !== '') {
            hasValidResult = true;
            break;
          }
        }
        
        if (hasValidResult) {
          throw new Error(
            TestHelpers.createUXTestFailureMessage(
              testName,
              `输入"${invalidInput}"时页面静默处理了部分有效字符`,
              '应该显示错误信息或拒绝无效输入',
              '页面接受了部分有效字符并进行转换',
              '建议改进用户体验：对包含无效字符的输入显示明确的错误提示'
            )
          );
        }
      }
      
      // 验证至少有一个结果显示错误状态
      let hasErrorState = false;
      for (const selector of resultSelectors) {
        const resultText = await page.locator(selector).textContent();
        if (resultText && (resultText.includes('—') || resultText.includes('Invalid'))) {
          hasErrorState = true;
          break;
        }
      }
      
      expect(hasErrorState || invalidInputExists > 0).toBeTruthy();
      
    } catch (error) {
      throw new Error(
        TestHelpers.formatErrorMessage({
          testName,
          input: invalidInput,
          expected: '错误信息或空结果',
          actual: '可能接受了无效输入',
          suggestion: '检查页面的输入验证逻辑'
        })
      );
    }
  }

  /**
   * 无效字符输入断言的实例方法
   */
  async assertInvalidInputHandling({
    inputSelector,
    baseSelector,
    baseValue,
    invalidInput,
    resultSelectors,
    testName = '无效字符输入处理验证'
  }: {
    inputSelector: string;
    baseSelector: string;
    baseValue: string;
    invalidInput: string;
    resultSelectors: string[];
    testName?: string;
  }) {
    await TestHelpers.assertInvalidInputHandling({
      page: this.page,
      inputSelector,
      baseSelector,
      baseValue,
      invalidInput,
      resultSelectors,
      testName
    });
  }

   /**
    * 空输入处理验证的静态方法
    */
   static async assertEmptyInputHandling({
     page,
     inputSelector,
     buttonSelector,
     inputPlaceholder,
     buttonText,
     testName = '空输入处理验证'
   }: {
     page: Page;
     inputSelector: string;
     buttonSelector: string;
     inputPlaceholder: string;
     buttonText: string;
     testName?: string;
   }) {
     const inputElement = page.locator(inputSelector);
     const buttonElement = page.locator(buttonSelector);
     
     // 确保输入框为空
     await inputElement.fill('');
     
     // 验证输入框确实为空
      const actualValue = await inputElement.inputValue();
      
      const inputValueErrorMessage = [
        `🐛 ${testName}失败！`,
        `❌ ${inputPlaceholder}输入框值检查未通过`,
        `实际输入值: "${actualValue}"`,
        `期望输入值: ""（空字符串）`,
        `🔧 建议: 确保输入框已正确清空`
      ].join('\n');
      
      await expect(inputElement).toHaveValue('', {
        message: inputValueErrorMessage
      });
     
     // 验证按钮在空输入时是禁用状态
      const isButtonDisabled = await buttonElement.isDisabled();
      
      const buttonStateErrorMessage = [
        `🐛 ${testName}失败！`,
        `❌ ${buttonText}按钮状态检查未通过`,
        `实际按钮状态: ${isButtonDisabled ? '禁用' : '启用'}`,
        `期望按钮状态: 禁用`,
        `🔧 建议: 空输入时${buttonText}按钮应该处于禁用状态，防止用户进行无效操作`
      ].join('\n');
      
      await expect(buttonElement).toBeDisabled({
        message: buttonStateErrorMessage
      });
     
     // 尝试点击禁用的按钮来触发友好提示信息
      try {
        // 强制点击禁用的按钮，看是否会显示提示信息
        await buttonElement.click({ force: true });
        await page.waitForTimeout(1000); // 等待可能的提示信息出现
      } catch (error) {
        // 如果无法点击，这是正常的，继续检查提示信息
      }
      
      // 验证是否有友好的错误提示信息（用户期望的UX设计）
      // 排除Next.js框架的路由公告元素
      const errorMessage = page.locator('[role="alert"]:not(#__next-route-announcer__), .error-message, .warning-message, .toast, .notification');
      const errorCount = await errorMessage.count();
      
      // 验证必须有友好提示信息，如果没有则测试失败
        if (errorCount === 0) {
          const errorMessage = TestHelpers.createUXTestFailureMessage(
            testName,
            `空输入${buttonText}操作缺少用户提示`,
            `显示友好提示信息（如"请先输入要${buttonText}的内容"）`,
            `无任何提示信息`,
            `网站应该在用户尝试${buttonText}空内容时显示友好提示信息`
          );
          
          throw new Error(errorMessage);
        }
       
       // 如果有提示信息，验证其内容是否友好
       if (errorCount > 0) {
         const messageText = await errorMessage.first().textContent();
         console.log(`✅ 发现友好提示信息: "${messageText}"`);
       }
     
     // 测试空格输入的处理
     await inputElement.fill('   '); // 只输入空格
     
     // 检查空格输入时按钮的状态
      const isSpaceButtonDisabled = await buttonElement.isDisabled();
      if (!isSpaceButtonDisabled) {
        const spaceInputErrorMessage = TestHelpers.createTestFailureMessage(
          testName,
          `空格输入时${buttonText}按钮状态检查`,
          `按钮应该被禁用（仅包含空格视为无效输入）`,
          `按钮处于启用状态`,
          `网站应该将仅包含空格的输入视为无效输入`
        );
        
        throw new Error(spaceInputErrorMessage);
      } else {
        console.log(`✅ ${testName}: 空格输入正确处理 - 按钮已禁用`);
      }
   }

   /**
    * 验证空输入处理 - 实例方法
    */
   async assertEmptyInputHandling({
     inputSelector,
     buttonSelector,
     inputPlaceholder,
     buttonText,
     testName = '空输入处理验证'
   }: {
     inputSelector: string;
     buttonSelector: string;
     inputPlaceholder: string;
     buttonText: string;
     testName?: string;
   }) {
     await TestHelpers.assertEmptyInputHandling({
       page: this.page,
       inputSelector,
       buttonSelector,
       inputPlaceholder,
       buttonText,
       testName
     });
   }
 }