import { expect, Locator, Page } from '@playwright/test';

/**
 * 优化后的测试工具类，提供友好的错误提示和统一的断言方法
 */
export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 错误消息类型枚举
   */
  private static readonly ERROR_MESSAGE_TYPES = {
    GENERAL: 'general',
    UX: 'ux',
    INPUT: 'input',
    SCENARIO: 'scenario'
  } as const;

  /**
   * 通用错误消息创建方法
   */
  private static createErrorMessage(config: {
    testName: string;
    type?: keyof typeof TestHelpers.ERROR_MESSAGE_TYPES;
    input?: string;
    scenario?: string;
    uxIssue?: string;
    expected: string;
    actual: string;
    suggestion: string;
  }): string {
    const { testName, type = 'GENERAL', input, scenario, uxIssue, expected, actual, suggestion } = config;
    
    const lines = [`🐛 ${testName}失败！`];
    
    // 根据类型添加特定的描述行
    if (input) {
      lines.push(`📝 测试输入: "${input}"`);
    }
    if (scenario) {
      lines.push(`📝 测试场景: ${scenario}`);
    }
    if (uxIssue) {
      lines.push(`🎨 UX问题: ${uxIssue}`);
    }
    
    // 添加期望和实际结果
    const expectedLabel = type === 'UX' ? '期望UX' : type === 'SCENARIO' ? '预期行为' : '预期输出';
    const actualLabel = type === 'UX' ? '实际UX' : type === 'SCENARIO' ? '实际行为' : '实际输出';
    const suggestionLabel = type === 'UX' ? '改进建议' : '建议';
    
    lines.push(`✅ ${expectedLabel}: "${expected}"`);
    lines.push(`❌ ${actualLabel}: "${actual}"`);
    lines.push(`🔧 ${suggestionLabel}: ${suggestion}`);
    
    return lines.filter(Boolean).join('\n');
  }

  // ==================== 错误消息创建方法 ====================

  /**
   * 创建友好的错误消息
   * @deprecated 使用 createTestFailureMessage 替代
   */
  static createFriendlyErrorMessage(
    testName: string,
    input: string,
    expected: string,
    actual: string,
    suggestion: string
  ): string {
    return TestHelpers.createErrorMessage({
      testName,
      type: 'INPUT',
      input,
      expected,
      actual,
      suggestion
    });
  }

  /**
   * 创建通用的测试失败错误消息
   */
  static createTestFailureMessage(
    testName: string,
    scenario: string,
    expected: string,
    actual: string,
    suggestion: string
  ): string {
    return TestHelpers.createErrorMessage({
      testName,
      type: 'SCENARIO',
      scenario,
      expected,
      actual,
      suggestion
    });
  }

  /**
   * 创建UX体验测试失败错误消息
   */
  static createUXTestFailureMessage(
    testName: string,
    uxIssue: string,
    expectedUX: string,
    actualUX: string,
    improvement: string
  ): string {
    return TestHelpers.createErrorMessage({
      testName,
      type: 'UX',
      uxIssue,
      expected: expectedUX,
      actual: actualUX,
      suggestion: improvement
    });
  }

  /**
   * 抛出UX问题错误
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
    throw new Error(TestHelpers.createErrorMessage({
      testName,
      type: 'UX',
      input,
      uxIssue,
      expected,
      actual,
      suggestion
    }));
  }

  // ==================== 基础断言方法 ====================

  /**
   * 断言文本内容
   */
  async assertTextContent({
    locator,
    selector,
    expectedText,
    elementName,
    testName = '文本内容检查'
  }: {
    locator?: Locator;
    selector?: string;
    expectedText: string;
    elementName: string;
    testName?: string;
  }) {
    const element = locator || this.page.locator(selector!);
    try {
      await expect(element).toHaveText(expectedText);
    } catch (error) {
      const actualText = await element.textContent() || '';
      throw new Error(
        TestHelpers.createErrorMessage({
          testName,
          expected: `${elementName}显示"${expectedText}"`,
          actual: `${elementName}显示"${actualText}"`,
          suggestion: `检查${elementName}的转换逻辑是否正确`
        })
      );
    }
  }

  /**
   * 断言元素可见性
   */
  async assertElementVisible({
    locator,
    selector,
    elementName,
    testName = '元素可见性检查'
  }: {
    locator?: Locator;
    selector?: string;
    elementName: string;
    testName?: string;
  }) {
    const element = locator || this.page.locator(selector!);
    try {
      await expect(element).toBeVisible();
    } catch (error) {
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          `检查${elementName}的可见性`,
          `${elementName}应该可见`,
          `${elementName}不可见或不存在`,
          `检查${elementName}是否正确渲染和显示`
        )
      );
    }
  }

  /**
   * 断言输入框值
   */
  async assertInputValue({
    inputLocator,
    selector,
    expectedValue,
    testName = '输入框值检查'
  }: {
    inputLocator?: Locator;
    selector?: string;
    expectedValue: string;
    testName?: string;
  }) {
    const element = inputLocator || this.page.locator(selector!);
    try {
      await expect(element).toHaveValue(expectedValue);
    } catch (error) {
      const actualValue = await element.inputValue();
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          `验证输入框的值`,
          `输入框值应为"${expectedValue}"`,
          `输入框值为"${actualValue}"`,
          '检查输入框的值设置逻辑'
        )
      );
    }
  }

  /**
   * 断言页面标题
   */
  async assertPageTitle({
    expectedTitlePattern,
    testName = '页面标题检查'
  }: {
    expectedTitlePattern: string | RegExp;
    testName?: string;
  }) {
    try {
      if (typeof expectedTitlePattern === 'string') {
        await expect(this.page).toHaveTitle(expectedTitlePattern);
      } else {
        await expect(this.page).toHaveTitle(expectedTitlePattern);
      }
    } catch (error) {
      const actualTitle = await this.page.title();
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          '验证页面标题',
          `页面标题应匹配"${expectedTitlePattern}"`,
          `页面标题为"${actualTitle}"`,
          '检查页面标题设置是否正确'
        )
      );
    }
  }

  // ==================== 输入处理验证方法 ====================

  /**
   * 断言无效输入的通用处理
   */
  async assertInvalidInputHandling({
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
    // 输入无效字符
    await this.page.fill(inputSelector, invalidInput);
    await this.page.waitForTimeout(500);
    
    // 检查是否显示错误信息（可选）
    let errorMessage = null;
    try {
      errorMessage = await this.page.locator('text="Invalid input"').textContent({ timeout: 1000 });
    } catch {
      // 忽略错误，继续检查结果区域
    }
    
    // 验证所有结果区域的状态
    const invalidResults = [];
    for (const selector of resultSelectors) {
      const resultText = await this.page.locator(selector).textContent();
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
   * 验证空输入处理
   */
  async verifyEmptyInputHandling({
    selectors,
    testName = '空输入处理验证'
  }: {
    selectors: Array<{ selector: string; expectedEmpty: boolean }>;
    testName?: string;
  }) {
    for (const { selector, expectedEmpty } of selectors) {
      const element = this.page.locator(selector);
      const content = await element.textContent();
      const isEmpty = !content || content.trim() === '';
      
      if (expectedEmpty && !isEmpty) {
        throw new Error(
          TestHelpers.createTestFailureMessage(
            testName,
            `验证${selector}的空输入处理`,
            '元素应该为空',
            `元素包含内容: "${content}"`,
            '检查空输入时的清理逻辑'
          )
        );
      } else if (!expectedEmpty && isEmpty) {
        throw new Error(
          TestHelpers.createTestFailureMessage(
            testName,
            `验证${selector}的内容`,
            '元素应该有内容',
            '元素为空',
            '检查内容生成逻辑'
          )
        );
      }
    }
  }

  // ==================== 操作方法 ====================

  /**
   * 执行编码操作
   */
  async performEncoding(input: string) {
    const inputTextarea = this.page.locator('textarea[placeholder="Input..."]');
    const encodeBtn = this.page.locator('button:has-text("Encode")');
    
    await inputTextarea.fill(input);
    await encodeBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 执行解码操作
   */
  async performDecoding(input: string) {
    const inputTextarea = this.page.locator('textarea[placeholder="Input..."]');
    const decodeBtn = this.page.locator('button:has-text("Decode")');
    
    await inputTextarea.fill(input);
    await decodeBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 执行清空操作
   */
  async performClear() {
    const clearBtn = this.page.locator('button:has-text("Clear")');
    await clearBtn.click();
  }

  /**
   * 执行JSON格式化
   */
  async performJsonFormat(input: string) {
    const inputTextarea = this.page.locator('textarea[placeholder="Input..."]');
    const formatBtn = this.page.locator('button:has-text("Format & Validate")');
    
    await inputTextarea.fill(input);
    await formatBtn.click();
  }

  /**
   * 执行密码生成
   */
  async performPasswordGeneration() {
    const generateBtn = this.page.locator('button:has-text("Generate Password Generator")');
    await generateBtn.click();
  }

  /**
   * 执行UUID生成
   */
  async performUuidGeneration() {
    const generateBtn = this.page.locator('button:has-text("Generate UUID")');
    await generateBtn.click();
  }

  /**
   * 执行进制转换
   */
  async performBaseConversion(input: string, inputBase = '10') {
    const inputField = this.page.locator('input[placeholder="Enter number..."]');
    const baseSelect = this.page.locator('select');
    const convertBtn = this.page.locator('button:has-text("Convert")');
    
    await inputField.fill(input);
    await baseSelect.selectOption(inputBase);
    await convertBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 执行进制转换清空
   */
  async performBaseClear() {
    const clearBtn = this.page.locator('button:has-text("Clear")');
    await clearBtn.click();
    await this.page.waitForTimeout(500);
  }

  // ==================== 专用断言方法 ====================

  /**
   * 断言Base64编码结果
   */
  async assertBase64Encoding({
    outputSelector,
    input,
    expectedOutput,
    testName = 'Base64编码'
  }: {
    outputSelector: string;
    input: string;
    expectedOutput: string;
    testName?: string;
  }) {
    const outputLocator = this.page.locator(outputSelector);
    try {
      await expect(outputLocator).toHaveText(expectedOutput);
    } catch (error) {
      const actualOutput = await outputLocator.textContent() || '';
      throw new Error(
        TestHelpers.createFriendlyErrorMessage(
          testName,
          input,
          expectedOutput,
          actualOutput,
          '检查Base64编码算法实现'
        )
      );
    }
  }

  /**
   * 断言Base64解码结果
   */
  async assertBase64Decoding({
    outputSelector,
    input,
    expectedOutput,
    testName = 'Base64解码'
  }: {
    outputSelector: string;
    input: string;
    expectedOutput: string;
    testName?: string;
  }) {
    const outputLocator = this.page.locator(outputSelector);
    try {
      await expect(outputLocator).toHaveText(expectedOutput);
    } catch (error) {
      const actualOutput = await outputLocator.textContent() || '';
      throw new Error(
        TestHelpers.createFriendlyErrorMessage(
          testName,
          input,
          expectedOutput,
          actualOutput,
          '检查Base64解码算法实现'
        )
      );
    }
  }

  /**
   * 断言密码生成结果
   */
  async assertPasswordGenerated({
    outputSelector,
    testName = '密码生成检查'
  }: {
    outputSelector: string;
    testName?: string;
  }) {
    const outputLocator = this.page.locator(outputSelector);
    const generatedPassword = await outputLocator.textContent();
    
    if (!generatedPassword || generatedPassword.trim() === '') {
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          '验证密码生成功能',
          '应该生成一个密码',
          '没有生成密码',
          '检查密码生成逻辑和按钮功能'
        )
      );
    }
  }

  /**
   * 断言UUID生成结果
   */
  async assertUuidGenerated({
    outputSelector,
    expectedFormat = 'uuid',
    testName = 'UUID生成检查'
  }: {
    outputSelector: string;
    expectedFormat?: 'uuid' | 'guid';
    testName?: string;
  }) {
    const outputLocator = this.page.locator(outputSelector);
    const generatedUuid = await outputLocator.textContent();
    
    if (!generatedUuid || generatedUuid.trim() === '') {
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          '验证UUID生成功能',
          '应该生成一个UUID',
          '没有生成UUID',
          '检查UUID生成逻辑和按钮功能'
        )
      );
    }
    
    // 验证UUID格式
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(generatedUuid.trim())) {
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          '验证UUID格式',
          '生成的UUID应符合标准格式',
          `生成的内容不是有效的UUID: "${generatedUuid}"`,
          '检查UUID生成算法的正确性'
        )
      );
    }
  }

  /**
   * 断言进制转换结果
   */
  async assertBaseConversionResult({
    outputSelector,
    expectedValue,
    baseName,
    inputValue,
    testName = '进制转换检查'
  }: {
    outputSelector: string;
    expectedValue: string;
    baseName: string;
    inputValue?: string;
    testName?: string;
  }) {
    const outputLocator = this.page.locator(outputSelector);
    try {
      await expect(outputLocator).toHaveText(expectedValue);
    } catch (error) {
      const actualValue = await outputLocator.textContent() || '';
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          `${inputValue ? `输入"${inputValue}"转换为` : '转换为'}${baseName}`,
          `${baseName}结果应为"${expectedValue}"`,
          `${baseName}结果为"${actualValue}"`,
          `检查${baseName}转换算法的正确性`
        )
      );
    }
  }

  // ==================== 向后兼容的静态方法 ====================

  /**
   * 静态方法：断言元素可见性（向后兼容）
   * @deprecated 建议使用实例方法 helpers.assertElementVisible()
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
    try {
      await expect(locator).toBeVisible();
    } catch (error) {
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          `检查${elementName}的可见性`,
          `${elementName}应该可见`,
          `${elementName}不可见或不存在`,
          `检查${elementName}是否正确渲染和显示`
        )
      );
    }
  }

  /**
   * 静态方法：断言页面标题（向后兼容）
   * @deprecated 建议使用实例方法 helpers.assertPageTitle()
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
    try {
      if (typeof expectedTitlePattern === 'string') {
        await expect(page).toHaveTitle(expectedTitlePattern);
      } else {
        await expect(page).toHaveTitle(expectedTitlePattern);
      }
    } catch (error) {
      const actualTitle = await page.title();
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          '验证页面标题',
          `页面标题应匹配"${expectedTitlePattern}"`,
          `页面标题为"${actualTitle}"`,
          '检查页面标题设置是否正确'
        )
      );
    }
  }

  /**
   * 静态方法：断言输入框值（向后兼容）
   * @deprecated 建议使用实例方法 helpers.assertInputValue()
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
    try {
      await expect(inputLocator).toHaveValue(expectedValue);
    } catch (error) {
      const actualValue = await inputLocator.inputValue();
      throw new Error(
        TestHelpers.createTestFailureMessage(
          testName,
          `验证输入框的值`,
          `输入框值应为"${expectedValue}"`,
          `输入框值为"${actualValue}"`,
          '检查输入框的值设置逻辑'
        )
      );
    }
  }

  /**
   * 静态方法：执行编码操作（向后兼容）
   * @deprecated 建议使用实例方法 helpers.performEncoding()
   */
  static async performEncoding({ page, input }: { page: Page; input: string }) {
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const encodeBtn = page.locator('button:has-text("Encode")');
    
    await inputTextarea.fill(input);
    await encodeBtn.click();
    await page.waitForTimeout(1000);
  }

  /**
   * 静态方法：执行解码操作（向后兼容）
   * @deprecated 建议使用实例方法 helpers.performDecoding()
   */
  static async performDecoding({ page, input }: { page: Page; input: string }) {
    const inputTextarea = page.locator('textarea[placeholder="Input..."]');
    const decodeBtn = page.locator('button:has-text("Decode")');
    
    await inputTextarea.fill(input);
    await decodeBtn.click();
    await page.waitForTimeout(1000);
  }

  /**
   * 静态方法：执行清空操作（向后兼容）
   * @deprecated 建议使用实例方法 helpers.performClear()
   */
  static async performClear({ page }: { page: Page }) {
    const clearBtn = page.locator('button:has-text("Clear")');
    await clearBtn.click();
  }

  /**
   * 静态方法：断言Base64编码结果（向后兼容）
   * @deprecated 建议使用实例方法 helpers.assertBase64Encoding()
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
    try {
      await expect(outputLocator).toHaveText(expectedOutput);
    } catch (error) {
      const actualOutput = await outputLocator.textContent() || '';
      throw new Error(
        TestHelpers.createFriendlyErrorMessage(
          testName,
          input,
          expectedOutput,
          actualOutput,
          '检查Base64编码算法实现'
        )
      );
    }
  }

  /**
   * 静态方法：断言Base64解码结果（向后兼容）
   * @deprecated 建议使用实例方法 helpers.assertBase64Decoding()
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
    try {
      await expect(outputLocator).toHaveText(expectedOutput);
    } catch (error) {
      const actualOutput = await outputLocator.textContent() || '';
      throw new Error(
        TestHelpers.createFriendlyErrorMessage(
          testName,
          input,
          expectedOutput,
          actualOutput,
          '检查Base64解码算法实现'
        )
      );
    }
  }

  // ==================== 静态工具方法 ====================

  /**
   * 创建UX分析报告
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
    const report = [
      `\n📊 ${moduleName} UX测试分析报告`,
      '='.repeat(50),
      `🔍 发现 ${testResults.length} 个UX问题:\n`
    ];

    testResults.forEach((result, index) => {
      report.push(
        `${index + 1}. 🐛 ${result.testName}`,
        `   📝 测试输入: "${result.input}"`,
        `   ❌ 问题描述: ${result.issue}`,
        `   💥 用户影响: ${result.impact}`,
        `   🔧 改进建议: ${result.suggestion}`,
        ''
      );
    });

    report.push(
      '='.repeat(50),
      `📈 建议优先级: 修复这些UX问题将显著提升用户体验`,
      `🎯 关注重点: 用户输入验证和错误提示机制\n`
    );

    return report.join('\n');
  }
}

// 导出静态方法以保持向后兼容
export const {
  createFriendlyErrorMessage,
  createTestFailureMessage,
  createUXTestFailureMessage,
  failWithUXIssue,
  createUXAnalysisReport
} = TestHelpers;