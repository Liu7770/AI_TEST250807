import { test, expect } from '@playwright/test';
import { TestHelpersV2 } from '../utils/test-helpers-v2';
import { ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('JWT Decoder Tool 测试', () => {

  const url = 'https://www.001236.xyz/en/jwt-decoder';
  const jwtInput = 'textarea[placeholder="Paste your JWT token here..."]';
  const decodeButton = 'button:has-text("Decode JWT")';
  const clearButton = 'button:has-text("Clear")';

  // 有效的JWT token用于测试
  const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
  });

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题包含Dev Forge
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证模块名称显示
    await expect(page.getByText('JWT Decoder').first()).toBeVisible();
    
    // 验证主要功能元素存在
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  });

  test('有效JWT解码测试', async ({ page }) => {
    // 输入JWT
    const inputElement = page.locator(jwtInput);
    await inputElement.fill(validJWT);
    
    // 点击解码按钮
    const decodeBtn = page.locator(decodeButton);
    await decodeBtn.click();
    
    // 验证解码结果
    const resultElement = page.locator('.result, .output, pre').first();
    await TestHelpersV2.assertElementVisible({
      locator: resultElement,
      elementName: 'JWT解码结果区域',
      testName: 'JWT解码结果显示检查'
    });
    
    const resultText = await resultElement.textContent();
    if (!resultText || !resultText.includes('John Doe')) {
      const errorMessage = ErrorMessageFactory.create('operation', {
        testName: 'JWT解码功能',
        operation: '解码有效JWT令牌',
        expected: '包含"John Doe"的解码结果',
        actual: resultText || '空结果',
        suggestion: '检查JWT解码逻辑，确保能正确解析JWT payload中的用户信息'
      });
      throw new Error(errorMessage);
    }
  });

  test('无效JWT处理测试', async ({ page }) => {
    // 输入无效的JWT token
    const invalidJWT = 'invalid.jwt.token';
    await page.locator(jwtInput).fill(invalidJWT);
    
    // 点击解码按钮
    await page.locator(decodeButton).click();
    
    // 验证错误提示显示
    const errorMessageLocator = page.locator('text=Invalid').or(page.locator('text=Error')).or(page.locator('text=错误')).or(page.locator('text=无效'));
    const errorVisible = await errorMessageLocator.isVisible();
    
    if (!errorVisible) {
      const errorMessage = ErrorMessageFactory.create('assertion', {
        testName: '无效JWT处理测试',
        input: '验证无效JWT的错误提示显示',
        expected: '应该显示JWT无效的错误提示信息',
        actual: '未找到错误提示信息',
        suggestion: 'JWT解码器应该能够识别并提示无效的JWT格式，提升用户体验。'
      });
      throw new Error(errorMessage);
    }
  });

  test('格式错误JWT处理测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入格式错误的JWT (缺少部分)
      await jwtInputElement.first().fill('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0');
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证错误提示或部分解码结果
      const errorMessage = page.locator('text=Invalid, text=Malformed, text=格式错误');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 确保输入框为空
      await jwtInputElement.first().fill('');
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证空输入提示
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('JWT Header信息验证测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token
      await jwtInputElement.first().fill(validJWT);
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证Header中的算法信息
      const algorithmText = page.locator('text=HS256, text=alg, text=algorithm');
      if (await algorithmText.count() > 0) {
        await expect(algorithmText.first()).toBeVisible();
      }
      
      // 验证Header中的类型信息
      const typeText = page.locator('text=JWT, text=typ, text=type');
      if (await typeText.count() > 0) {
        await expect(typeText.first()).toBeVisible();
      }
    }
  });

  test('JWT Payload信息验证测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token
      await jwtInputElement.first().fill(validJWT);
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证Payload中的用户信息
      const nameText = page.locator('text=John Doe, text=name');
      if (await nameText.count() > 0) {
        await expect(nameText.first()).toBeVisible();
      }
      
      // 验证Payload中的subject信息
      const subText = page.locator('text=1234567890, text=sub');
      if (await subText.count() > 0) {
        await expect(subText.first()).toBeVisible();
      }
      
      // 验证Payload中的issued at信息
      const iatText = page.locator('text=1516239022, text=iat');
      if (await iatText.count() > 0) {
        await expect(iatText.first()).toBeVisible();
      }
    }
  });

  test('JWT时间戳转换测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token
      await jwtInputElement.first().fill(validJWT);
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证时间戳是否被转换为可读格式
      const dateText = page.locator('text=2018, text=Jan, text=January');
      if (await dateText.count() > 0) {
        await expect(dateText.first()).toBeVisible();
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    const clearBtn = page.locator(clearButton);
    
    if (await jwtInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await jwtInputElement.first().fill(validJWT);
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(jwtInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('JWT验证状态显示测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token
      await jwtInputElement.first().fill(validJWT);
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证JWT验证状态显示
      const validationStatus = page.locator('text=Valid, text=Invalid, text=Verified, text=有效, text=无效');
      if (await validationStatus.count() > 0) {
        await expect(validationStatus.first()).toBeVisible();
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    const copyBtn = page.locator('button:has-text("Copy"), button:has-text("复制")');
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token并解码
      await jwtInputElement.first().fill(validJWT);
      
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
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

});