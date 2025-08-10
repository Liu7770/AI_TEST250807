import { test, expect } from '@playwright/test';

test.describe('Dev Forge Base64工具页面', () => {

  const url = 'https://www.001236.xyz/en/base64';
  const inputTextarea = 'textarea';
  // 模式切换按钮（在顶部的切换区域）
  const encodeModeButton = 'div.p-1 button:has-text("Encode")';
  const decodeModeButton = 'div.p-1 button:has-text("Decode")';
  // 执行操作按钮（在输入区域的右上角）
  const executeEncodeButton = 'div:has(textarea) button:has-text("Encode")';
  const executeDecodeButton = 'div:has(textarea) button:has-text("Decode")';
  const clearButton = 'button:has-text("Clear")';

  test('编码功能测试 - 输入普通文本', async ({ page }) => {
    await page.goto(url);

    // 确保在编码模式
    await page.click(encodeModeButton);
    
    // 输入测试文本
    await page.locator(inputTextarea).fill('Hello World');
    
    // 等待执行按钮变为可用状态
    await page.waitForSelector(executeEncodeButton + ':not([disabled])', { timeout: 5000 });
    
    // 点击执行编码按钮
    await page.click(executeEncodeButton);
    
    // 验证输入框中的内容
    await expect(page.locator(inputTextarea)).toHaveValue('Hello World');
  });

  test('编码功能测试 - 输入特殊字符', async ({ page }) => {
    await page.goto(url);

    // 确保在编码模式
    await page.click(encodeModeButton);
    
    // 输入包含特殊字符的文本
    await page.locator(inputTextarea).fill('Hello@#$%^&*()World!');
    
    // 等待执行按钮变为可用状态
    await page.waitForSelector(executeEncodeButton + ':not([disabled])', { timeout: 5000 });
    
    // 点击执行编码按钮
    await page.click(executeEncodeButton);
    
    // 验证输入框中的内容
    await expect(page.locator(inputTextarea)).toHaveValue('Hello@#$%^&*()World!');
  });

  test('编码功能测试 - 输入中文字符', async ({ page }) => {
    await page.goto(url);

    // 确保在编码模式
    await page.click(encodeModeButton);
    
    // 输入中文文本
    await page.locator(inputTextarea).fill('你好世界');
    
    // 等待执行按钮变为可用状态
    await page.waitForSelector(executeEncodeButton + ':not([disabled])', { timeout: 5000 });
    
    // 点击执行编码按钮
    await page.click(executeEncodeButton);
    
    // 验证输入框中的内容
    await expect(page.locator(inputTextarea)).toHaveValue('你好世界');
  });

  test('解码功能测试 - 输入有效Base64', async ({ page }) => {
    await page.goto(url);

    // 切换到解码模式
    await page.click(decodeModeButton);
    
    // 输入有效的Base64编码 ("Hello World"的Base64编码)
    await page.locator(inputTextarea).fill('SGVsbG8gV29ybGQ=');
    
    // 等待执行按钮变为可用状态
    await page.waitForSelector(executeDecodeButton + ':not([disabled])', { timeout: 5000 });
    
    // 点击执行解码按钮
    await page.click(executeDecodeButton);
    
    // 验证输入框中的内容
    await expect(page.locator(inputTextarea)).toHaveValue('SGVsbG8gV29ybGQ=');
  });

  test('解码功能测试 - 输入无效Base64', async ({ page }) => {
    await page.goto(url);

    // 切换到解码模式
    await page.click(decodeModeButton);
    
    // 输入无效的Base64编码
    await page.locator(inputTextarea).fill('InvalidBase64!');
    
    // 等待执行按钮变为可用状态
    await page.waitForSelector(executeDecodeButton + ':not([disabled])', { timeout: 5000 });
    
    // 点击执行解码按钮
    await page.click(executeDecodeButton);
    
    // 验证输入框中的内容
    await expect(page.locator(inputTextarea)).toHaveValue('InvalidBase64!');
  });

  test('清空功能测试', async ({ page }) => {
    await page.goto(url);

    // 输入一些文本
    await page.locator(inputTextarea).fill('Test content to clear');
    
    // 点击清空按钮
    await page.click(clearButton);
    
    // 验证输入框已清空
    await expect(page.locator(inputTextarea)).toHaveValue('');
  });

  test('编码解码模式切换测试', async ({ page }) => {
    await page.goto(url);

    // 默认应该在编码模式，输入文本
    await page.locator(inputTextarea).fill('Test text');
    
    // 切换到解码模式
    await page.click(decodeModeButton);
    
    // 验证可以输入Base64格式的文本
    await page.locator(inputTextarea).fill('VGVzdCB0ZXh0');
    
    // 切换回编码模式
    await page.click(encodeModeButton);
    
    // 验证可以输入普通文本
    await page.locator(inputTextarea).fill('Normal text');
    await expect(page.locator(inputTextarea)).toHaveValue('Normal text');
  });

  test('页面元素存在性测试', async ({ page }) => {
    await page.goto(url);

    // 验证页面标题
    await expect(page).toHaveTitle(/Base64 Encoder\/Decoder/);
    
    // 验证主要元素存在
    await expect(page.locator(inputTextarea)).toBeVisible();
    await expect(page.locator(encodeModeButton)).toBeVisible();
    await expect(page.locator(decodeModeButton)).toBeVisible();
    await expect(page.locator(clearButton)).toBeVisible();
    
    // 验证页面描述文本
    await expect(page.locator('text=Encode text to Base64 or decode Base64 back to text')).toBeVisible();
  });

});