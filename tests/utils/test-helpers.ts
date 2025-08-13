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
      `💡 UX改进: ${improvement}`
    ].join('\n');
  }

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
    await page.locator('textarea[placeholder="Input..."]').fill(input);
    // 等待执行编码按钮变为可用状态（注意：这是输入框下方的执行按钮，不是上方的模式切换按钮）
    const encodeButton = page.locator('div.bg-white\\/80 div.flex.space-x-2 button:has-text("Encode")');
    await encodeButton.waitFor({ state: 'visible' });
    
    // 检查按钮是否启用 - 移除trim()检查，因为空白字符也是有效输入
    if (input.length > 0) {
      await expect(encodeButton).toBeEnabled();
    }
    
    await encodeButton.click();
    // Playwright会自动等待DOM更新，无需手动等待
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
    await page.locator('textarea[placeholder="Base64 Input..."]').fill(input);
    
    // 等待解码按钮变为可用状态并点击（注意：这是输入框下方的执行按钮，不是上方的模式切换按钮）
    const decodeButton = page.locator('div.bg-white\\/80 div.flex.space-x-2 button:has-text("Decode")');
    await decodeButton.waitFor({ state: 'visible' });
    await expect(decodeButton).toBeEnabled();
    await decodeButton.click();
    // Playwright会自动等待DOM更新，无需手动等待
  }

  /**
   * 通用操作：清空输入
   */
  static async performClear({
    page
  }: {
    page: Page;
  }) {
    await page.click('div.bg-white\\/80 div.flex.space-x-2 button:has-text("Clear")');
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
    * 验证空输入处理 - 静态方法
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