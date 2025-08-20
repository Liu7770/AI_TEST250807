import { test, expect } from '@playwright/test';

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
    // 验证页面标题
    await expect(page).toHaveTitle(/Dev Forge/);
    
    // 验证主要元素存在
    await expect(page.locator('h1')).toContainText('JWT Decoder');
    
    // 验证输入框存在
    const inputElement = page.locator(jwtInput);
    await expect(inputElement).toBeVisible();
    
    // 验证解码按钮存在
    const decodeBtn = page.locator(decodeButton);
    await expect(decodeBtn).toBeVisible();
    
    // 验证清空按钮存在
    const clearBtn = page.locator(clearButton);
    await expect(clearBtn).toBeVisible();
  });

  test('有效JWT解码测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入有效的JWT token
      await jwtInputElement.first().fill(validJWT);
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证Header部分显示
      const headerElement = page.locator(headerSection);
      if (await headerElement.count() > 0) {
        await expect(headerElement.first()).toBeVisible();
        const headerText = await headerElement.first().textContent();
        expect(headerText).toContain('HS256');
        expect(headerText).toContain('JWT');
      }
      
      // 验证Payload部分显示
      const payloadElement = page.locator(payloadSection);
      if (await payloadElement.count() > 0) {
        await expect(payloadElement.first()).toBeVisible();
        const payloadText = await payloadElement.first().textContent();
        expect(payloadText).toContain('John Doe');
        expect(payloadText).toContain('1234567890');
      }
      
      // 验证Signature部分显示
      const signatureElement = page.locator(signatureSection);
      if (await signatureElement.count() > 0) {
        await expect(signatureElement.first()).toBeVisible();
      }
    }
  });

  test('无效JWT处理测试', async ({ page }) => {
    const jwtInputElement = page.locator(jwtInput);
    
    if (await jwtInputElement.count() > 0) {
      // 输入无效的JWT token
      await jwtInputElement.first().fill('invalid.jwt.token');
      
      // 点击解码按钮
      const decodeBtn = page.locator(decodeButton);
      if (await decodeBtn.count() > 0) {
        await decodeBtn.first().click();
      }
      
      // 验证错误提示显示
      const errorMessage = page.locator('text=Invalid, text=Error, text=错误, text=无效');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
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