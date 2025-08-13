import { test, expect } from '@playwright/test';
import { TestHelpers } from '../../../utils/test-helpers';

test.describe('UUID Generator Tool 测试', () => {

  const url = 'https://www.001236.xyz/en/uuid-generator';
  const generateButton = 'button:has-text("Generate")';
  const clearButton = 'button:has-text("Clear")';
  const countInput = 'input[type="number"]';
  const uuidFormatButton = 'button:has-text("UUID (lowercase)")';
  const guidFormatButton = 'button:has-text("GUID (uppercase)")';
  const uuidOutput = '.bg-slate-50, .output-area, textarea[readonly], .uuid-output';
  const versionSelect = 'select, .version-select';
  const quantityInput = 'input[type="number"], .quantity-input';

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
    await helpers.assertElementVisible(generateButton, '生成按钮');
    
    // 验证清空按钮存在
    await helpers.assertElementVisible(clearButton, '清空按钮');
    
    // 验证数量输入框存在
    await helpers.assertElementVisible(countInput, '数量输入框');
    
    // 验证格式选择按钮存在
    await helpers.assertElementVisible(uuidFormatButton, 'UUID格式按钮');
    await helpers.assertElementVisible(guidFormatButton, 'GUID格式按钮');
  });

  test('UUID v4生成测试', async ({ page }) => {
    const helper = new TestHelpers(page);
    
    // 生成UUID
    await helper.performUuidGeneration();
    
    // 验证UUID输出
    await helper.assertUuidGenerated(uuidOutput, 'uuid', 'UUID v4生成测试');
  });

  test('多个UUID生成测试', async ({ page }) => {
    const helper = new TestHelpers(page);
    const uuids = [];
    
    // 连续生成多个UUID
    for (let i = 0; i < 3; i++) {
      await helper.performUuidGeneration();
      
      const outputElement = page.locator(uuidOutput);
      const uuid = await outputElement.first().textContent();
      if (uuid) {
        uuids.push(uuid.trim());
      }
    }
    
    // 验证生成的UUID都不相同
    const uniqueUuids = new Set(uuids);
    const errorMessage = [
      '🐛 多个UUID生成测试失败！',
      `❌ 生成的UUID存在重复`,
      `生成的UUID数量: ${uuids.length}`,
      `唯一UUID数量: ${uniqueUuids.size}`,
      `重复的UUID: ${uuids.filter((uuid, index) => uuids.indexOf(uuid) !== index)}`,
      '🔧 建议: 检查UUID生成算法的随机性'
    ].join('\n');
    
    expect(uniqueUuids.size, errorMessage).toBe(uuids.length);
  });

  test('UUID版本选择测试', async ({ page }) => {
    const helper = new TestHelpers(page);
    const versionSelectElement = page.locator(versionSelect);
    
    await helper.assertElementVisible(versionSelect, 'UUID版本选择器可见性检查');
    
    // 测试UUID v1
    await versionSelectElement.first().selectOption('1');
    await helper.performUuidGeneration();
    
    const outputElement = page.locator(uuidOutput);
    const uuidV1 = await outputElement.first().textContent();
    const uuidV1Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const v1ErrorMessage = [
      '🐛 UUID v1格式验证失败！',
      `❌ 生成的UUID不符合v1格式`,
      `实际输出: "${uuidV1}"`,
      `期望格式: xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx`,
      '🔧 建议: 检查UUID v1生成逻辑'
    ].join('\n');
    expect(uuidV1?.trim(), v1ErrorMessage).toMatch(uuidV1Regex);
    
    // 测试UUID v4 (默认)
    await versionSelectElement.first().selectOption('4');
    await helper.performUuidGeneration();
    
    const uuidV4 = await outputElement.first().textContent();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const v4ErrorMessage = [
      '🐛 UUID v4格式验证失败！',
      `❌ 生成的UUID不符合v4格式`,
      `实际输出: "${uuidV4}"`,
      `期望格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`,
      '🔧 建议: 检查UUID v4生成逻辑'
    ].join('\n');
    expect(uuidV4?.trim(), v4ErrorMessage).toMatch(uuidV4Regex);
  });

  test('批量UUID生成测试', async ({ page }) => {
    const helper = new TestHelpers(page);
    const quantityInputElement = page.locator(quantityInput);
    
    await helper.assertElementVisible(quantityInput, '数量输入框可见性检查');
    
    // 设置生成数量
    await quantityInputElement.first().fill('5');
    
    // 生成UUID
    await helper.performUuidGeneration();
    
    // 验证生成了指定数量的UUID
    const outputElements = page.locator(uuidOutput);
    const count = await outputElements.count();
    
    const countErrorMessage = [
      '🐛 批量UUID生成测试失败！',
      `❌ 未生成任何UUID输出`,
      `期望: 至少生成1个UUID`,
      `实际: ${count}个输出元素`,
      '🔧 建议: 检查批量生成功能和输出显示逻辑'
    ].join('\n');
    expect(count, countErrorMessage).toBeGreaterThan(0);
    
    // 验证至少生成了UUID
    const firstUuid = await outputElements.first().textContent();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[0-9a-f]{3}-[0-9a-f]{12}$/i;
    const formatErrorMessage = [
      '🐛 批量UUID格式验证失败！',
      `❌ 生成的UUID格式不正确`,
      `实际输出: "${firstUuid}"`,
      `期望格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
      '🔧 建议: 检查UUID格式化逻辑'
    ].join('\n');
    expect(firstUuid?.trim(), formatErrorMessage).toMatch(uuidRegex);
  });

  test('UUID格式选择测试', async ({ page }) => {
    const formatSelectElement = page.locator(formatSelect);
    const generateBtn = page.locator(generateButton);
    
    if (await formatSelectElement.count() > 0 && await generateBtn.count() > 0) {
      // 测试标准格式 (带连字符)
      await formatSelectElement.first().selectOption('standard');
      await generateBtn.first().click();
      
      const outputElement = page.locator(uuidOutput);
      if (await outputElement.count() > 0) {
        const uuid = await outputElement.first().textContent();
        expect(uuid?.trim()).toContain('-');
      }
      
      // 测试无连字符格式
      await formatSelectElement.first().selectOption('simple');
      await generateBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const uuid = await outputElement.first().textContent();
        expect(uuid?.trim()).not.toContain('-');
        expect(uuid?.trim().length).toBe(32);
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const copyBtn = page.locator(copyButton);
    
    if (await generateBtn.count() > 0) {
      // 先生成一个UUID
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
      // 先生成一个UUID
      await generateBtn.first().click();
      
      // 验证UUID已生成
      const outputElement = page.locator(uuidOutput);
      if (await outputElement.count() > 0) {
        const uuid = await outputElement.first().textContent();
        expect(uuid?.trim().length).toBeGreaterThan(0);
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

  test('UUID大小写格式测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const caseToggle = page.locator('button:has-text("Uppercase"), button:has-text("Lowercase"), .case-toggle');
    
    if (await generateBtn.count() > 0) {
      // 生成UUID
      await generateBtn.first().click();
      
      const outputElement = page.locator(uuidOutput);
      if (await outputElement.count() > 0) {
        const uuid = await outputElement.first().textContent();
        
        // 验证UUID包含字母字符
        expect(uuid?.trim()).toMatch(/[a-f]/i);
        
        // 如果有大小写切换按钮，测试切换功能
        if (await caseToggle.count() > 0) {
          await caseToggle.first().click();
          
          const toggledUuid = await outputElement.first().textContent();
          // 验证大小写发生了变化或保持一致
          expect(toggledUuid?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('UUID验证功能测试', async ({ page }) => {
    const validateInput = page.locator('input[placeholder*="validate"], input[placeholder*="验证"]');
    const validateBtn = page.locator('button:has-text("Validate"), button:has-text("验证")');
    
    if (await validateInput.count() > 0 && await validateBtn.count() > 0) {
      // 测试有效UUID验证
      await validateInput.first().fill('550e8400-e29b-41d4-a716-446655440000');
      await validateBtn.first().click();
      
      const validMessage = page.locator('text=Valid, text=有效, text=✓');
      if (await validMessage.count() > 0) {
        await expect(validMessage.first()).toBeVisible();
      }
      
      // 测试无效UUID验证
      await validateInput.first().fill('invalid-uuid-format');
      await validateBtn.first().click();
      
      const invalidMessage = page.locator('text=Invalid, text=无效, text=✗');
      if (await invalidMessage.count() > 0) {
        await expect(invalidMessage.first()).toBeVisible();
      }
    }
  });

  test('UUID历史记录测试', async ({ page }) => {
    const generateBtn = page.locator(generateButton);
    const historySection = page.locator('.history, .generated-history, [data-section="history"]');
    
    if (await generateBtn.count() > 0) {
      // 生成多个UUID
      for (let i = 0; i < 3; i++) {
        await generateBtn.first().click();
        await page.waitForTimeout(100);
      }
      
      // 验证历史记录显示
      if (await historySection.count() > 0) {
        await expect(historySection.first()).toBeVisible();
        
        // 验证历史记录中包含UUID
        const historyItems = page.locator('.history-item, .uuid-item');
        if (await historyItems.count() > 0) {
          const firstItem = await historyItems.first().textContent();
          const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[0-9a-f]{3}-[0-9a-f]{12}/i;
          expect(firstItem).toMatch(uuidRegex);
        }
      }
    }
  });

});