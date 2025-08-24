import { expect, Locator, Page } from '@playwright/test';

/**
 * 错误消息类型枚举
 */
type ErrorMessageType = 'assertion' | 'ux' | 'validation' | 'operation';

/**
 * 错误消息选项接口
 */
interface ErrorMessageOptions {
  testName: string;
  input?: string;
  expected?: string;
  actual?: string;
  suggestion: string;
  scenario?: string;
  uxIssue?: string;
  expectedUX?: string;
  actualUX?: string;
  improvement?: string;
}

/**
 * 统一的错误消息工厂类
 * 替代原有的多个重复的错误消息创建方法
 */
class ErrorMessageFactory {
  /**
   * 创建统一格式的错误消息
   */
  static create(type: ErrorMessageType, options: ErrorMessageOptions): string {
    const { testName, suggestion } = options;
    
    switch (type) {
      case 'assertion':
        return this.createAssertionError(options);
      case 'ux':
        return this.createUXError(options);
      case 'validation':
        return this.createValidationError(options);
      case 'operation':
        return this.createOperationError(options);
      default:
        return this.createGenericError(options);
    }
  }

  /**
   * 创建断言错误消息
   */
  private static createAssertionError(options: ErrorMessageOptions): string {
    const { testName, input, expected, actual, suggestion } = options;
    
    return [
      `🐛 ${testName}功能存在缺陷！`,
      input ? `📝 测试输入: "${input}"` : '',
      expected ? `✅ 预期输出: "${expected}"` : '',
      actual ? `❌ 实际输出: "${actual}"` : '',
      `🔧 建议: ${suggestion}`
    ].filter(Boolean).join('\n');
  }

  /**
   * 创建UX错误消息
   */
  private static createUXError(options: ErrorMessageOptions): string {
    const { testName, uxIssue, expectedUX, actualUX, improvement } = options;
    
    return [
      `🐛 ${testName}失败！`,
      uxIssue ? `🎨 UX问题: ${uxIssue}` : '',
      expectedUX ? `✅ 期望UX: ${expectedUX}` : '',
      actualUX ? `❌ 实际UX: ${actualUX}` : '',
      improvement ? `💡 UX改进: ${improvement}` : ''
    ].filter(Boolean).join('\n');
  }

  /**
   * 创建验证错误消息
   */
  private static createValidationError(options: ErrorMessageOptions): string {
    const { testName, scenario, expected, actual, suggestion } = options;
    
    return [
      `🐛 ${testName}失败！`,
      scenario ? `📝 测试场景: ${scenario}` : '',
      expected ? `✅ 预期行为: ${expected}` : '',
      actual ? `❌ 实际行为: ${actual}` : '',
      `🔧 建议: ${suggestion}`
    ].filter(Boolean).join('\n');
  }

  /**
   * 创建操作错误消息
   */
  private static createOperationError(options: ErrorMessageOptions): string {
    const { testName, expected, actual, suggestion } = options;
    
    return [
      `🐛 ${testName}失败！`,
      expected ? `✅ 预期状态: ${expected}` : '',
      actual ? `❌ 实际状态: ${actual}` : '',
      `🔧 建议: ${suggestion}`
    ].filter(Boolean).join('\n');
  }

  /**
   * 创建通用错误消息
   */
  private static createGenericError(options: ErrorMessageOptions): string {
    const { testName, suggestion } = options;
    
    return [
      `🐛 ${testName}失败！`,
      `🔧 建议: ${suggestion}`
    ].join('\n');
  }
}

/**
 * 断言配置接口
 */
interface AssertionConfig {
  testName?: string;
  timeout?: number;
  retryCount?: number;
}

/**
 * 基础断言抽象类
 * 提供通用的断言逻辑和错误处理
 */
abstract class BaseAssertion {
  protected config: AssertionConfig;
  
  constructor(config: AssertionConfig = {}) {
    this.config = {
      testName: '未命名测试',
      timeout: 5000,
      retryCount: 0,
      ...config
    };
  }

  /**
   * 执行断言的抽象方法
   */
  protected abstract executeAssertion(): Promise<void>;

  /**
   * 创建错误消息的抽象方法
   */
  protected abstract createErrorMessage(): string;

  /**
   * 执行断言的公共方法
   */
  async assert(): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryCount!; attempt++) {
      try {
        await this.executeAssertion();
        return; // 成功则直接返回
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryCount!) {
          await this.delay(1000); // 重试前等待1秒
        }
      }
    }
    
    // 所有重试都失败，抛出自定义错误消息
    throw new Error(this.createErrorMessage());
  }

  /**
   * 延迟工具方法
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 优化后的测试工具类
 * 第一阶段重构：统一错误消息系统和基础断言架构
 * 第二阶段重构：模块化组织和接口优化
 */
export class TestHelpersV2 {
  private page?: Page;

  constructor(page?: Page) {
    this.page = page;
  }

  /**
   * 创建友好的错误消息 - 统一接口
   * 替代原有的多个重复方法
   */
  static createErrorMessage(
    type: ErrorMessageType,
    options: ErrorMessageOptions
  ): string {
    return ErrorMessageFactory.create(type, options);
  }

  /**
   * Base64编码断言 - 优化版本
   */
  static async assertBase64Encoding({
    outputLocator,
    input,
    expectedOutput,
    testName = 'Base64编码',
    config = {}
  }: {
    outputLocator: Locator;
    input: string;
    expectedOutput: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class Base64EncodingAssertion extends BaseAssertion {
      constructor(
        private outputLocator: Locator,
        private input: string,
        private expectedOutput: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        await expect(this.outputLocator).toContainText(this.expectedOutput);
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('assertion', {
          testName: this.config.testName!,
          input: this.input,
          expected: this.expectedOutput,
          actual: '', // 实际值会在执行时获取
          suggestion: '请检查网站的编码逻辑，可能存在字符编码转换问题'
        });
      }
    }

    const assertion = new Base64EncodingAssertion(outputLocator, input, expectedOutput, config);
    await assertion.assert();
  }

  /**
   * Base64解码断言 - 优化版本
   */
  static async assertBase64Decoding({
    outputLocator,
    input,
    expectedOutput,
    testName = 'Base64解码',
    config = {}
  }: {
    outputLocator: Locator;
    input: string;
    expectedOutput: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class Base64DecodingAssertion extends BaseAssertion {
      constructor(
        private outputLocator: Locator,
        private input: string,
        private expectedOutput: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        await expect(this.outputLocator).toContainText(this.expectedOutput);
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('assertion', {
          testName: this.config.testName!,
          input: this.input,
          expected: this.expectedOutput,
          actual: '', // 实际值会在执行时获取
          suggestion: '请检查网站的解码逻辑，可能存在Base64解析问题'
        });
      }
    }

    const assertion = new Base64DecodingAssertion(outputLocator, input, expectedOutput, config);
    await assertion.assert();
  }

  /**
   * 元素可见性断言 - 优化版本
   */
  static async assertElementVisible({
    locator,
    elementName,
    testName = '元素可见性检查',
    config = {}
  }: {
    locator: Locator;
    elementName: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class ElementVisibilityAssertion extends BaseAssertion {
      constructor(
        private locator: Locator,
        private elementName: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        await expect(this.locator).toBeVisible();
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('assertion', {
          testName: this.config.testName!,
          expected: `元素 "${this.elementName}" 应该可见`,
          actual: `元素 "${this.elementName}" 不可见或不存在`,
          suggestion: '请检查页面加载是否完成，或元素选择器是否正确'
        });
      }
    }

    const assertion = new ElementVisibilityAssertion(locator, elementName, config);
    await assertion.assert();
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
    await page.locator('textarea[placeholder="Input..."]').fill(input);
    const encodeButton = page.locator('div.bg-white\\/80 div.flex.space-x-2 button:has-text("Encode")');
    await encodeButton.waitFor({ state: 'visible' });
    
    if (input.length > 0) {
      await expect(encodeButton).toBeEnabled();
    }
    
    await encodeButton.click();
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
    const decodeModeButton = page.locator('button:has-text("Decode")').first();
    await decodeModeButton.click();
    
    await page.locator('textarea[placeholder="Base64 Input..."]').fill(input);
    
    const decodeButton = page.locator('div.bg-white\\/80 div.flex.space-x-2 button:has-text("Decode")');
    await decodeButton.waitFor({ state: 'visible' });
    await expect(decodeButton).toBeEnabled();
    await decodeButton.click();
  }

  /**
   * 实例方法 - 元素可见性断言（作为静态方法的便捷包装器）
   */
  async assertElementVisible(
    selector: string, 
    elementName: string, 
    testName = '元素可见性检查'
  ) {
    if (!this.page) {
      throw new Error('Page instance is required for instance methods');
    }
    
    const locator = this.page.locator(selector);
    await TestHelpersV2.assertElementVisible({ locator, elementName, testName });
  }

  /**
   * 输入框值断言 - 优化版本
   */
  static async assertInputValue({
    inputLocator,
    expectedValue,
    testName = '输入框值检查',
    config = {}
  }: {
    inputLocator: Locator;
    expectedValue: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class InputValueAssertion extends BaseAssertion {
      constructor(
        private inputLocator: Locator,
        private expectedValue: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        await expect(this.inputLocator).toHaveValue(this.expectedValue);
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('assertion', {
          testName: this.config.testName!,
          expected: `输入框值应为: "${this.expectedValue}"`,
          actual: '输入框值不匹配',
          suggestion: '请检查输入框的值是否被正确设置或清空'
        });
      }
    }

    const assertion = new InputValueAssertion(inputLocator, expectedValue, config);
    await assertion.assert();
  }

  /**
   * 输出区域非默认内容断言 - 优化版本
   */
  static async assertOutputNotDefault({
    outputLocator,
    defaultText = 'Output will appear here...',
    testName = '输出内容检查',
    config = {}
  }: {
    outputLocator: Locator;
    defaultText?: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class OutputNotDefaultAssertion extends BaseAssertion {
      constructor(
        private outputLocator: Locator,
        private defaultText: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        const outputText = await this.outputLocator.textContent();
        if (outputText === this.defaultText || !outputText?.trim()) {
          throw new Error('Output still shows default text');
        }
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('assertion', {
          testName: this.config.testName!,
          expected: '输出区域应显示处理结果',
          actual: `输出区域仍显示默认文本: "${this.defaultText}"`,
          suggestion: '请检查处理逻辑是否正确执行，或输出更新是否及时'
        });
      }
    }

    const assertion = new OutputNotDefaultAssertion(outputLocator, defaultText, config);
    await assertion.assert();
  }

  /**
   * 通用操作：清空输入和输出
   */
  static async performClear({
    page
  }: {
    page: Page;
  }) {
    const clearButton = page.locator('button:has-text("Clear")');
    await clearButton.waitFor({ state: 'visible' });
    await expect(clearButton).toBeEnabled();
    await clearButton.click();
  }

  /**
   * 通用操作：JSON格式化
   */
  static async performJsonFormat({
    page,
    input
  }: {
    page: Page;
    input: string;
  }) {
    await page.locator('textarea[placeholder="Input..."]').fill(input);
    const formatButton = page.locator('button:has-text("Format")');
    await formatButton.waitFor({ state: 'visible' });
    
    if (input.trim().length > 0) {
      await expect(formatButton).toBeEnabled();
    }
    
    await formatButton.click();
  }

  /**
   * 通用操作：密码生成
   */
  static async performPasswordGeneration({
    page,
    length = 12
  }: {
    page: Page;
    length?: number;
  }) {
    // 设置密码长度
    const lengthInput = page.locator('input[type="number"]');
    await lengthInput.fill(length.toString());
    
    // 点击生成按钮
    const generateButton = page.locator('button:has-text("Generate")');
    await generateButton.waitFor({ state: 'visible' });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
  }

  /**
   * 通用操作：UUID生成
   */
  static async performUuidGeneration({
    page
  }: {
    page: Page;
  }) {
    const generateButton = page.locator('button:has-text("Generate UUID")');
    await generateButton.waitFor({ state: 'visible' });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
  }

  /**
   * 空输入处理验证 - 优化版本
   */
  static async validateEmptyInputHandling({
    page,
    actionButtonSelector,
    testName = '空输入处理验证',
    config = {}
  }: {
    page: Page;
    actionButtonSelector: string;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class EmptyInputValidation extends BaseAssertion {
      constructor(
        private page: Page,
        private actionButtonSelector: string,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        // 确保输入框为空
        const inputBox = this.page.locator('textarea[placeholder*="Input"]');
        await inputBox.clear();
        
        // 检查按钮状态
        const actionButton = this.page.locator(this.actionButtonSelector);
        await expect(actionButton).toBeDisabled();
      }

      protected createErrorMessage(): string {
        return ErrorMessageFactory.create('validation', {
          testName: this.config.testName!,
          scenario: '输入框为空时',
          expected: '操作按钮应该被禁用',
          actual: '操作按钮仍然可用',
          suggestion: '请添加输入验证逻辑，确保空输入时禁用操作按钮'
        });
      }
    }

    const validation = new EmptyInputValidation(page, actionButtonSelector, config);
    await validation.assert();
  }

  /**
   * 按钮状态检查 - 提供详细错误信息
   */
  static async assertButtonState({
    page,
    buttonSelector,
    buttonText,
    expectedDisabled = true,
    testName = '按钮状态检查',
    config = {}
  }: {
    page: Page;
    buttonSelector: string;
    buttonText: string;
    expectedDisabled?: boolean;
    testName?: string;
    config?: AssertionConfig;
  }) {
    class ButtonStateAssertion extends BaseAssertion {
      constructor(
        private page: Page,
        private buttonSelector: string,
        private buttonText: string,
        private expectedDisabled: boolean,
        config: AssertionConfig
      ) {
        super({ testName, ...config });
      }

      protected async executeAssertion(): Promise<void> {
        const button = this.page.locator(this.buttonSelector);
        if (this.expectedDisabled) {
          await expect(button).toBeDisabled();
        } else {
          await expect(button).toBeEnabled();
        }
      }

      protected createErrorMessage(): string {
         // 同步版本，返回基本错误信息
         return 'Button state assertion failed';
       }

       protected async createDetailedErrorMessage(): Promise<string> {
         const button = this.page.locator(this.buttonSelector);
         const isButtonDisabled = await button.isDisabled();
         
         return [
           `🐛 ${this.config.testName!}失败！`,
           `❌ ${this.buttonText}按钮状态检查未通过`,
           `实际按钮状态: ${isButtonDisabled ? '禁用' : '启用'}`,
           `期望按钮状态: ${this.expectedDisabled ? '禁用' : '启用'}`,
           `🔧 建议: 空输入时${this.buttonText}按钮应该处于禁用状态，防止用户进行无效操作`
         ].join('\n');
       }

      async assert(): Promise<void> {
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= this.config.retryCount!; attempt++) {
          try {
            await this.executeAssertion();
            return;
          } catch (error) {
            lastError = error as Error;
            if (attempt < this.config.retryCount!) {
              await this.delay(1000);
            }
          }
        }
        
        // 创建详细的错误消息
         const detailedMessage = await this.createDetailedErrorMessage();
         throw new Error(detailedMessage);
      }

      private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    }

    const assertion = new ButtonStateAssertion(page, buttonSelector, buttonText, expectedDisabled, config);
    await assertion.assert();
  }

  /**
   * 实例方法 - 页面标题断言
   */
  async assertPageTitle(
    expectedTitlePattern: string | RegExp, 
    testName = '页面标题检查'
  ) {
    if (!this.page) {
      throw new Error('Page instance is required for instance methods');
    }

    const actualTitle = await this.page.title();
    const expectedStr = typeof expectedTitlePattern === 'string' 
      ? expectedTitlePattern 
      : expectedTitlePattern.toString();
    
    const errorMessage = ErrorMessageFactory.create('assertion', {
      testName,
      expected: expectedStr,
      actual: actualTitle,
      suggestion: '请检查页面是否正确加载，或标题是否被正确设置'
    });

    await expect(this.page, errorMessage).toHaveTitle(expectedTitlePattern);
  }

  /**
   * 实例方法 - 输入框值断言（作为静态方法的便捷包装器）
   */
  async assertInputValue(
    selector: string,
    expectedValue: string,
    testName = '输入框值检查'
  ) {
    if (!this.page) {
      throw new Error('Page instance is required for instance methods');
    }
    
    const inputLocator = this.page.locator(selector);
    await TestHelpersV2.assertInputValue({ inputLocator, expectedValue, testName });
  }

  /**
   * 实例方法 - 输出区域非默认内容断言
   */
  async assertOutputNotDefault(
    selector: string,
    defaultText = 'Output will appear here...',
    testName = '输出内容检查'
  ) {
    if (!this.page) {
      throw new Error('Page instance is required for instance methods');
    }
    
    const outputLocator = this.page.locator(selector);
    await TestHelpersV2.assertOutputNotDefault({ outputLocator, defaultText, testName });
  }
}

// 向后兼容：导出原始类名
export { TestHelpersV2 as TestHelpers };

/**
 * 断言操作命名空间
 * 包含所有断言相关的静态方法
 */
export namespace Assertions {
  /**
   * Base64编码断言
   */
  export const base64Encoding = TestHelpersV2.assertBase64Encoding;
  
  /**
   * Base64解码断言
   */
  export const base64Decoding = TestHelpersV2.assertBase64Decoding;
  
  /**
   * 元素可见性断言
   */
  export const elementVisible = TestHelpersV2.assertElementVisible;
  
  /**
   * 输入框值断言
   */
  export const inputValue = TestHelpersV2.assertInputValue;
  
  /**
   * 输出区域非默认内容断言
   */
  export const outputNotDefault = TestHelpersV2.assertOutputNotDefault;
}

/**
 * 通用操作命名空间
 * 包含所有页面操作相关的静态方法
 */
export namespace Operations {
  /**
   * 编码操作
   */
  export const encoding = TestHelpersV2.performEncoding;
  
  /**
   * 解码操作
   */
  export const decoding = TestHelpersV2.performDecoding;
  
  /**
   * 清空操作
   */
  export const clear = TestHelpersV2.performClear;
  
  /**
   * JSON格式化操作
   */
  export const jsonFormat = TestHelpersV2.performJsonFormat;
  
  /**
   * 密码生成操作
   */
  export const passwordGeneration = TestHelpersV2.performPasswordGeneration;
  
  /**
   * UUID生成操作
   */
  export const uuidGeneration = TestHelpersV2.performUuidGeneration;
}

/**
 * 验证器命名空间
 * 包含所有验证相关的静态方法
 */
export namespace Validators {
  /**
   * 空输入处理验证
   */
  export const emptyInputHandling = TestHelpersV2.validateEmptyInputHandling;
  
  /**
   * 按钮状态检查
   */
  export const buttonState = TestHelpersV2.assertButtonState;
}

/**
 * 错误消息工具命名空间
 * 包含错误消息创建相关的方法
 */
export namespace ErrorMessages {
  /**
   * 创建错误消息
   */
  export const create = TestHelpersV2.createErrorMessage;
}