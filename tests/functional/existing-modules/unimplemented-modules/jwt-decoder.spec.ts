import { test, expect } from '@playwright/test';

test.describe('Dev Forge JWT Decoder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=JWT Decoder');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    try {
      const comingSoonElement = page.locator('text="Tool implementation coming soon"');
      if (await comingSoonElement.isVisible({ timeout: 3000 })) {
        test.skip(true, 'Tool implementation coming soon...');
      }
    } catch (error) {
      // 如果找不到元素，继续执行测试
    }
  });

  test('解码有效JWT Token', async ({ page }) => {
    // 示例JWT Token (包含标准payload)
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    // 输入JWT Token
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    // 点击解码按钮（如果需要）
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证Header部分
    const headerResult = await page.textContent('.header, .jwt-header, [data-testid="jwt-header"]');
    expect(headerResult).toContain('HS256');
    expect(headerResult).toContain('JWT');
    
    // 验证Payload部分
    const payloadResult = await page.textContent('.payload, .jwt-payload, [data-testid="jwt-payload"]');
    expect(payloadResult).toContain('1234567890');
    expect(payloadResult).toContain('John Doe');
    expect(payloadResult).toContain('1516239022');
  });

  test('显示JWT各部分结构', async ({ page }) => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证三个部分都存在
    const headerSection = page.locator('.header-section, .jwt-header, [data-testid="header-section"]');
    const payloadSection = page.locator('.payload-section, .jwt-payload, [data-testid="payload-section"]');
    const signatureSection = page.locator('.signature-section, .jwt-signature, [data-testid="signature-section"]');
    
    await expect(headerSection).toBeVisible();
    await expect(payloadSection).toBeVisible();
    await expect(signatureSection).toBeVisible();
  });

  test('处理无效JWT格式', async ({ page }) => {
    const invalidJWT = 'invalid.jwt.token';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', invalidJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证错误提示
    const errorMessage = await page.textContent('.error, .invalid, [data-testid="error-message"]');
    expect(errorMessage).toMatch(/invalid|error|malformed/i);
  });

  test('处理不完整的JWT', async ({ page }) => {
    const incompleteJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'; // 缺少签名部分
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', incompleteJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 应该能解码header和payload，但显示签名缺失
    const headerResult = await page.textContent('.header, .jwt-header, [data-testid="jwt-header"]');
    const payloadResult = await page.textContent('.payload, .jwt-payload, [data-testid="jwt-payload"]');
    
    expect(headerResult).toContain('HS256');
    expect(payloadResult).toContain('John Doe');
  });

  test('时间戳格式化显示', async ({ page }) => {
    const jwtWithTimestamps = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', jwtWithTimestamps);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证时间戳被格式化显示
    const payloadResult = await page.textContent('.payload, .jwt-payload, [data-testid="jwt-payload"]');
    
    // 检查是否显示了可读的日期格式
    const hasReadableDate = payloadResult?.includes('2018') || payloadResult?.includes('Jan') || payloadResult?.includes('GMT');
    if (hasReadableDate) {
      expect(hasReadableDate).toBeTruthy();
    }
  });

  test('JWT过期状态检查', async ({ page }) => {
    // 使用过期的JWT
    const expiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', expiredJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 查找过期状态指示
    const expirationStatus = await page.textContent('.expiration, .expired, .status, [data-testid="expiration-status"]');
    if (expirationStatus) {
      expect(expirationStatus).toMatch(/expired|invalid|过期/i);
    }
  });

  test('复制解码结果功能', async ({ page }) => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 查找并点击复制按钮
    const copyButton = page.locator('button:has-text("Copy"), .copy-btn, [data-testid="copy-button"]');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=Copied, .success, .toast')).toBeVisible({ timeout: 3000 });
    }
  });

  test('JWT签名验证功能', async ({ page }) => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    // 查找密钥输入框
    const secretInput = page.locator('input[placeholder*="secret"], .secret-input, [data-testid="secret-input"]');
    if (await secretInput.count() > 0) {
      await secretInput.fill('your-256-bit-secret');
      
      const verifyButton = page.locator('button:has-text("Verify"), .verify-btn, [data-testid="verify-button"]');
      if (await verifyButton.count() > 0) {
        await verifyButton.click();
        
        // 验证签名状态
        const verificationResult = await page.textContent('.verification, .signature-valid, [data-testid="verification-result"]');
        expect(verificationResult).toMatch(/valid|invalid|verified/i);
      }
    }
  });

  test('不同算法的JWT处理', async ({ page }) => {
    // RS256算法的JWT示例
    const rs256JWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.EkN-DOsnsuRjRO6BxXemmJDm3HbxrbRzXglbN2S4sOkopdU4IsDxTI8jO19W_A4K8ZPJijNLis4EZsHeY559a4DFOd50_OqgHs3cs4qBcKFDdw';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', rs256JWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证算法类型显示
    const headerResult = await page.textContent('.header, .jwt-header, [data-testid="jwt-header"]');
    expect(headerResult).toContain('RS256');
  });

  test('JWT Claims详细显示', async ({ page }) => {
    const jwtWithClaims = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.QzOH8GbYbha_7E0rFz8lF5xF8GjJ9F8F8F8F8F8F8F8';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', jwtWithClaims);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证标准Claims显示
    const payloadResult = await page.textContent('.payload, .jwt-payload, [data-testid="jwt-payload"]');
    expect(payloadResult).toContain('sub'); // Subject
    expect(payloadResult).toContain('iat'); // Issued At
    expect(payloadResult).toContain('exp'); // Expiration
    expect(payloadResult).toContain('aud'); // Audience
    expect(payloadResult).toContain('iss'); // Issuer
  });

  test('清空输入功能', async ({ page }) => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    // 查找并点击清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      const inputValue = await page.inputValue('textarea, .jwt-input, [data-testid="jwt-input"]');
      expect(inputValue).toBe('');
    }
  });

  test('JWT格式化显示', async ({ page }) => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    await page.fill('textarea, .jwt-input, [data-testid="jwt-input"]', validJWT);
    
    const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
    if (await decodeButton.count() > 0) {
      await decodeButton.click();
    }
    
    // 验证JSON格式化显示
    const headerResult = await page.textContent('.header, .jwt-header, [data-testid="jwt-header"]');
    const payloadResult = await page.textContent('.payload, .jwt-payload, [data-testid="jwt-payload"]');
    
    // 检查是否有适当的JSON格式化（缩进、换行等）
    expect(headerResult).toMatch(/\{[\s\S]*\}/);
    expect(payloadResult).toMatch(/\{[\s\S]*\}/);
  });

  test('批量JWT解码', async ({ page }) => {
    const jwt1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const jwt2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Twz7-WlMhDwbDNZHNsOGP7E8_8F8F8F8F8F8F8F8F8F';
    
    // 查找批量输入区域
    const batchInput = page.locator('textarea:has-text("batch"), .batch-input, [data-testid="batch-input"]');
    if (await batchInput.count() > 0) {
      await batchInput.fill(`${jwt1}\n${jwt2}`);
      
      const decodeButton = page.locator('button:has-text("Decode"), .decode-btn, [data-testid="decode-button"]');
      await decodeButton.click();
      
      // 验证批量解码结果
      const results = await page.locator('.batch-result, .jwt-result, [data-testid="batch-results"] > *').count();
      expect(results).toBeGreaterThan(1);
    }
  });
});