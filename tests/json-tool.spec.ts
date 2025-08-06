import { test, expect } from '@playwright/test';

test.describe('Dev Forge JSON工具页面', () => {

  const url = 'https://www.001236.xyz/zh/json';
  const inputLocator = 'textarea'; // 通用文本框选择器
  const formatButtonText = /格式化|Format/i; // 兼容中英文按钮名称
  const resultLocator = '.jsoneditor'; // 输出区域 class，视页面结构可调整

  test('格式化有效JSON', async ({ page }) => {
    await page.goto(url);

    await page.locator(inputLocator).fill('{"a":1, "b":[2,3]}');
    await page.getByRole('button', { name: formatButtonText }).click();

    const result  = page.locator('pre');

    await expect(result).toContainText('{');
    await expect(result).toContainText('"a": 1');
    await expect(result).toContainText('"b": [');
    await expect(result).toContainText('2,');
    await expect(result).toContainText('3');
  });

  test('清空输入后格式化，提示无效输入', async ({ page }) => {
    await page.goto(url);

    await page.locator(inputLocator).fill('');
    await page.getByRole('button', { name: formatButtonText }).click();

    // 检查是否显示了无效提示
    await expect(page.locator('text=Invalid JSON')).toBeVisible();
  });

  test('输入非JSON格式内容，点击格式化', async ({ page }) => {
    await page.goto(url);

    await page.locator(inputLocator).fill('(2222)');
    await page.getByRole('button', { name: formatButtonText }).click();

    await expect(page.locator('text=Invalid JSON')).toBeVisible();
  });

});
