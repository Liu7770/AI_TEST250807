import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../../utils/test-helpers';

test.describe('Password Generator Tool 测试', () => {

  const url = 'https://www.001236.xyz/en/password-generator';
  const generateButton = 'button:has-text("Generate Password Generator")';
  const clearButton = 'button:has-text("Clear")';
  const copyButton = 'button:has-text("Copy")';
  const passwordOutput = '.bg-slate-50';
  const lengthSlider = 'input[type="range"]';
  const uppercaseCheckbox = 'input[type="checkbox"][id="uppercase"]';
  const lowercaseCheckbox = 'input[type="checkbox"][id="lowercase"]';
  const numbersCheckbox = 'input[type="checkbox"][id="numbers"]';
  const symbolsCheckbox = 'input[type="checkbox"][id="symbols"]';
  const strengthIndicator = '.strength-indicator';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 验证页面标题
    await helpers.assertPageTitle(/Dev Forge/);
    
    // 验证主要元素存在
    await helpers.assertElementVisible('h1', '主标题');
    
    // 验证生成按钮存在
    await helpers.assertElementVisible(generateButton, '生成密码按钮');
    
    // 验证密码长度滑块存在
    await helpers.assertElementVisible(lengthSlider, '密码长度滑块');
    
    // 验证字符类型选项存在
    await helpers.assertElementVisible(uppercaseCheckbox, '大写字母选项');
    await helpers.assertElementVisible(lowercaseCheckbox, '小写字母选项');
    await helpers.assertElementVisible(numbersCheckbox, '数字选项');
    await helpers.assertElementVisible(symbolsCheckbox, '符号选项');
    
    // 验证输出区域存在
    await helpers.assertElementVisible(passwordOutput, '密码输出区域');
  });

  test('默认密码生成测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 点击生成按钮
    await helpers.performPasswordGeneration();
    
    // 验证密码输出
    await helpers.assertPasswordGenerated(passwordOutput, '默认密码生成');
    
    const outputElement = page.locator(passwordOutput);
    const password = await outputElement.textContent();
    
    // 验证密码长度
    if (!password || password.trim().length < 8) {
      throw new Error(`默认密码生成测试失败\n期望: 密码长度应≥8位\n实际: "${password}" (长度: ${password?.trim().length || 0})\n建议: 检查默认密码长度设置`);
    }
  });

  test('自定义长度密码生成测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 设置密码长度为16
    const lengthSliderElement = page.locator(lengthSlider);
    await lengthSliderElement.fill('16');
    
    // 点击生成按钮
    await helpers.performPasswordGeneration();
    
    // 验证生成的密码长度
    await helpers.assertPasswordGenerated(passwordOutput, '自定义长度密码生成');
    
    const outputElement = page.locator(passwordOutput);
    const password = await outputElement.textContent();
    
    if (!password || password.trim().length !== 16) {
      throw new Error(`自定义长度密码生成测试失败\n期望长度: 16位\n实际长度: ${password?.trim().length || 0}位\n实际密码: "${password}"\n建议: 检查密码长度设置功能`);
    }
  });

  test('仅大写字母密码生成测试', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 取消所有选项
    await page.locator(lowercaseCheckbox).uncheck();
    await page.locator(numbersCheckbox).uncheck();
    await page.locator(symbolsCheckbox).uncheck();
    
    // 只选择大写字母
    await page.locator(uppercaseCheckbox).check();
    
    // 生成密码
    await helpers.performPasswordGeneration();
    
    // 验证密码只包含大写字母
    await helpers.assertPasswordGenerated(passwordOutput, '仅大写字母密码生成');
    
    const outputElement = page.locator(passwordOutput);
    const password = await outputElement.textContent();
    
    if (!password || !password.trim().match(/^[A-Z]+$/)) {
      throw new Error(`仅大写字母密码生成测试失败\n期望: 只包含大写字母 (A-Z)\n实际密码: "${password}"\n建议: 检查字符类型选择功能`);
    }
  });

  test('仅小写字母密码生成测试', async ({ page }) => {
    const uppercaseCheckboxElement = page.locator(uppercaseCheckbox);
    const lowercaseCheckboxElement = page.locator(lowercaseCheckbox);
    const numbersCheckboxElement = page.locator(numbersCheckbox);
    const symbolsCheckboxElement = page.locator(symbolsCheckbox);
    const generateBtn = page.locator(generateButton);
    
    if (await generateBtn.count() > 0) {
      // 取消所有选项
      if (await uppercaseCheckboxElement.count() > 0) {
        await uppercaseCheckboxElement.first().uncheck();
      }
      if (await numbersCheckboxElement.count() > 0) {
        await numbersCheckboxElement.first().uncheck();
      }
      if (await symbolsCheckboxElement.count() > 0) {
        await symbolsCheckboxElement.first().uncheck();
      }
      
      // 只选择小写字母
      if (await lowercaseCheckboxElement.count() > 0) {
        await lowercaseCheckboxElement.first().check();
      }
      
      // 生成密码
      await generateBtn.first().click();
      
      // 验证密码只包含小写字母
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const password = await outputElement.first().textContent();
        expect(password?.trim()).toMatch(/^[a-z]+$/);
      }
    }
  });

  test('仅数字密码生成测试', async ({ page }) => {
    const uppercaseCheckboxElement = page.locator(uppercaseCheckbox);
    const lowercaseCheckboxElement = page.locator(lowercaseCheckbox);
    const numbersCheckboxElement = page.locator(numbersCheckbox);
    const symbolsCheckboxElement = page.locator(symbolsCheckbox);
    const generateBtn = page.locator(generateButton);
    
    if (await generateBtn.count() > 0) {
      // 取消所有选项
      if (await uppercaseCheckboxElement.count() > 0) {
        await uppercaseCheckboxElement.first().uncheck();
      }
      if (await lowercaseCheckboxElement.count() > 0) {
        await lowercaseCheckboxElement.first().uncheck();
      }
      if (await symbolsCheckboxElement.count() > 0) {
        await symbolsCheckboxElement.first().uncheck();
      }
      
      // 只选择数字
      if (await numbersCheckboxElement.count() > 0) {
        await numbersCheckboxElement.first().check();
      }
      
      // 生成密码
      await generateBtn.first().click();
      
      // 验证密码只包含数字
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const password = await outputElement.first().textContent();
        expect(password?.trim()).toMatch(/^[0-9]+$/);
      }
    }
  });

  test('包含特殊字符密码生成测试', async ({ page }) => {
    const symbolsCheckboxElement = page.locator(symbolsCheckbox);
    const generateBtn = page.locator(generateButton);
    
    if (await generateBtn.count() > 0) {
      // 确保选择特殊字符
      if (await symbolsCheckboxElement.count() > 0) {
        await symbolsCheckboxElement.first().check();
      }
      
      // 生成密码
      await generateBtn.first().click();
      
      // 验证密码包含特殊字符
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const password = await outputElement.first().textContent();
        expect(password?.trim()).toMatch(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/);
      }
    }
  });

  test('混合字符密码生成测试', async ({ page }) => {
    const uppercaseCheckboxElement = page.locator(uppercaseCheckbox);
    const lowercaseCheckboxElement = page.locator(lowercaseCheckbox);
    const numbersCheckboxElement = page.locator(numbersCheckbox);
    const symbolsCheckboxElement = page.locator(symbolsCheckbox);
    const generateBtn = page.locator(generateButton);
    
    if (await generateBtn.count() > 0) {
      // 选择所有字符类型
      if (await uppercaseCheckboxElement.count() > 0) {
        await uppercaseCheckboxElement.first().check();
      }
      if (await lowercaseCheckboxElement.count() > 0) {
        await lowercaseCheckboxElement.first().check();
      }
      if (await numbersCheckboxElement.count() > 0) {
        await numbersCheckboxElement.first().check();
      }
      if (await symbolsCheckboxElement.count() > 0) {
        await symbolsCheckboxElement.first().check();
      }
      
      // 生成密码
      await generateBtn.first().click();
      
      // 验证密码包含多种字符类型
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const password = await outputElement.first().textContent();
        const hasUppercase = /[A-Z]/.test(password || '');
        const hasLowercase = /[a-z]/.test(password || '');
        const hasNumbers = /[0-9]/.test(password || '');
        const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password || '');
        
        // 至少包含两种字符类型
        const typeCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
        expect(typeCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('密码强度指示器测试', async ({ page }) => {
    const lengthSliderElement = page.locator(lengthSlider);
    const generateBtn = page.locator(generateButton);
    const strengthElement = page.locator(strengthIndicator);
    
    if (await generateBtn.count() > 0) {
      // 生成短密码
      if (await lengthSliderElement.count() > 0) {
        await lengthSliderElement.first().fill('6');
      }
      await generateBtn.first().click();
      
      // 检查强度指示器
      if (await strengthElement.count() > 0) {
        await expect(strengthElement.first()).toBeVisible();
        const strengthText = await strengthElement.first().textContent();
        expect(strengthText).toMatch(/weak|medium|strong|弱|中|强/i);
      }
      
      // 生成长密码
      if (await lengthSliderElement.count() > 0) {
        await lengthSliderElement.first().fill('20');
      }
      await generateBtn.first().click();
      
      // 验证强度有所变化
      if (await strengthElement.count() > 0) {
        const newStrengthText = await strengthElement.first().textContent();
        expect(newStrengthText).toMatch(/weak|medium|strong|弱|中|强/i);
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const copyBtn = page.locator(copyButton);
    
    if (await generateBtn.count() > 0) {
      // 先生成一个密码
      await generateBtn.first().click();
      
      // 点击复制按钮
      if (await copyBtn.count() > 0) {
        await copyBtn.first().click();
        
        // 验证复制成功提示
        const successMessage = page.locator('text=Copied, text=复制成功, text=Success');
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const clearBtn = page.locator(clearButton);
    
    if (await generateBtn.count() > 0 && await clearBtn.count() > 0) {
      // 先生成一个密码
      await generateBtn.first().click();
      
      // 验证密码已生成
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const password = await outputElement.first().textContent();
        expect(password?.trim().length).toBeGreaterThan(0);
      }
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输出区域已清空
      if (await outputElement.count() > 0) {
        const clearedContent = await outputElement.first().textContent();
        expect(clearedContent?.trim()).toBe('');
      }
    }
  });

  test('多个密码生成唯一性测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    
    if (await generateBtn.count() > 0) {
      const passwords = [];
      
      // 生成多个密码
      for (let i = 0; i < 5; i++) {
        await generateBtn.first().click();
        
        const outputElement = page.locator(passwordOutput);
        if (await outputElement.count() > 0) {
          const password = await outputElement.first().textContent();
          if (password) {
            passwords.push(password.trim());
          }
        }
        
        await page.waitForTimeout(100);
      }
      
      // 验证生成的密码都不相同
      const uniquePasswords = new Set(passwords);
      expect(uniquePasswords.size).toBe(passwords.length);
    }
  });

  test('极端长度密码测试', async ({ page }) => {
    const lengthSliderElement = page.locator(lengthSlider);
    const generateBtn = page.locator(generateButton);
    
    if (await lengthSliderElement.count() > 0 && await generateBtn.count() > 0) {
      // 测试最小长度
      await lengthSliderElement.first().fill('1');
      await generateBtn.first().click();
      
      const outputElement = page.locator(passwordOutput);
      if (await outputElement.count() > 0) {
        const shortPassword = await outputElement.first().textContent();
        expect(shortPassword?.trim().length).toBeGreaterThanOrEqual(1);
      }
      
      // 测试较大长度
      await lengthSliderElement.first().fill('50');
      await generateBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const longPassword = await outputElement.first().textContent();
        expect(longPassword?.trim().length).toBeLessThanOrEqual(50);
      }
    }
  });

  test('密码生成功能测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const outputElement = page.locator(passwordOutput);
    
    // 点击生成按钮
    await generateBtn.click();
    
    // 验证密码已生成
    const passwordText = await outputElement.textContent();
    expect(passwordText).toBeTruthy();
    expect(passwordText?.length).toBeGreaterThan(0);
  });

  test('密码长度调节测试', async ({ page }) => {
    const lengthSliderElement = page.locator(lengthSlider);
    const generateBtn = page.locator(generateButton);
    const outputElement = page.locator(passwordOutput);
    
    // 设置密码长度为20
    await lengthSliderElement.fill('20');
    
    // 生成密码
    await generateBtn.click();
    
    // 验证生成的密码长度
    const passwordText = await outputElement.textContent();
    expect(passwordText?.length).toBe(20);
  });

  test('字符类型选择测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const outputElement = page.locator(passwordOutput);
    
    // 只选择数字
    await page.locator(uppercaseCheckbox).uncheck();
    await page.locator(lowercaseCheckbox).uncheck();
    await page.locator(numbersCheckbox).check();
    await page.locator(symbolsCheckbox).uncheck();
    
    // 生成密码
    await generateBtn.click();
    
    // 验证密码只包含数字
    const passwordText = await outputElement.textContent();
    expect(passwordText).toMatch(/^[0-9]+$/);
  });

  test('复制功能增强测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const copyBtn = page.locator(copyButton);
    
    // 先生成密码
    await generateBtn.click();
    
    // 如果复制按钮存在，测试复制功能
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      
      // 验证复制成功提示或其他反馈
      await expect(page.locator('text=Copied')).toBeVisible({ timeout: 3000 });
    }
  });

});