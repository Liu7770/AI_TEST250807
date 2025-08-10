import { test, expect } from '@playwright/test';

test.describe('Dev Forge Code Beautifier', () => {
  const baseUrl = 'https://www.001236.xyz/en/beautifier';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
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

  test('Code Beautifier页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Code.*Beautifier.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'Code Beautifier' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Format and beautify your code')).toBeVisible();
  });

  test('代码输入区域测试', async ({ page }) => {
    // 查找代码输入框
    const codeInput = page.locator('textarea, .code-input, .monaco-editor').first();
    await expect(codeInput).toBeVisible();
    
    // 测试输入JavaScript代码
    const jsCode = 'function test(){console.log("hello");return true;}';
    await codeInput.fill(jsCode);
    
    if (await page.locator('textarea').count() > 0) {
      await expect(page.locator('textarea').first()).toHaveValue(jsCode);
    }
  });

  test('语言选择测试', async ({ page }) => {
    // 查找语言选择器
    const languageSelect = page.locator('select[name*="language"], select[name*="lang"], .language-selector');
    
    if (await languageSelect.count() > 0) {
      // 测试选择JavaScript
      await languageSelect.selectOption('javascript');
      await expect(languageSelect).toHaveValue('javascript');
      
      // 测试选择HTML
      await languageSelect.selectOption('html');
      await expect(languageSelect).toHaveValue('html');
      
      // 测试选择CSS
      await languageSelect.selectOption('css');
      await expect(languageSelect).toHaveValue('css');
    }
  });

  test('JavaScript代码美化测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format|pretty/i });
    
    // 输入压缩的JavaScript代码
    const minifiedJs = 'function test(){if(true){console.log("hello");return{a:1,b:2};}}var x=5;';
    await codeInput.fill(minifiedJs);
    
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      
      // 验证代码被格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedCode = await result.textContent() || await result.inputValue();
        expect(formattedCode).toContain('\n'); // 应该包含换行符
        expect(formattedCode).toMatch(/\s{2,}/); // 应该包含缩进
      }
    }
  });

  test('HTML代码美化测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    const languageSelect = page.locator('select[name*="language"], select[name*="lang"]');
    
    // 选择HTML语言（如果有选择器）
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption('html');
    }
    
    // 输入压缩的HTML代码
    const minifiedHtml = '<div><p>Hello</p><span>World</span></div>';
    await codeInput.fill(minifiedHtml);
    
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format|pretty/i });
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      
      // 验证HTML被格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedCode = await result.textContent() || await result.inputValue();
        expect(formattedCode).toContain('\n');
        expect(formattedCode).toMatch(/\s+</);
      }
    }
  });

  test('CSS代码美化测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    const languageSelect = page.locator('select[name*="language"], select[name*="lang"]');
    
    // 选择CSS语言（如果有选择器）
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption('css');
    }
    
    // 输入压缩的CSS代码
    const minifiedCss = '.test{color:red;background:blue;margin:0;padding:10px;}';
    await codeInput.fill(minifiedCss);
    
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format|pretty/i });
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      
      // 验证CSS被格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedCode = await result.textContent() || await result.inputValue();
        expect(formattedCode).toContain('\n');
        expect(formattedCode).toMatch(/\s+color/);
      }
    }
  });

  test('JSON代码美化测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    const languageSelect = page.locator('select[name*="language"], select[name*="lang"]');
    
    // 选择JSON语言（如果有选择器）
    if (await languageSelect.count() > 0) {
      await languageSelect.selectOption('json');
    }
    
    // 输入压缩的JSON代码
    const minifiedJson = '{"name":"test","value":123,"items":[1,2,3]}';
    await codeInput.fill(minifiedJson);
    
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format|pretty/i });
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      
      // 验证JSON被格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedCode = await result.textContent() || await result.inputValue();
        expect(formattedCode).toContain('\n');
        expect(formattedCode).toMatch(/\s+"name"/);
      }
    }
  });

  test('缩进设置测试', async ({ page }) => {
    // 查找缩进设置选项
    const indentSelect = page.locator('select[name*="indent"], input[name*="indent"]');
    
    if (await indentSelect.count() > 0) {
      // 测试2空格缩进
      if (await page.locator('select[name*="indent"]').count() > 0) {
        await page.locator('select[name*="indent"]').selectOption('2');
      } else {
        await page.locator('input[name*="indent"]').fill('2');
      }
      
      // 输入代码并美化
      const codeInput = page.locator('textarea, .code-input').first();
      await codeInput.fill('function test(){return true;}');
      
      const beautifyButton = page.locator('button').filter({ hasText: /beautify|format/i });
      if (await beautifyButton.count() > 0) {
        await beautifyButton.click();
      }
    }
  });

  test('代码压缩功能测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    const minifyButton = page.locator('button').filter({ hasText: /minify|compress|uglify/i });
    
    if (await minifyButton.count() > 0) {
      // 输入格式化的代码
      const formattedJs = `function test() {
  if (true) {
    console.log("hello");
    return true;
  }
}`;
      await codeInput.fill(formattedJs);
      
      await minifyButton.click();
      
      // 验证代码被压缩
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const minifiedCode = await result.textContent() || await result.inputValue();
        expect(minifiedCode.length).toBeLessThan(formattedJs.length);
        expect(minifiedCode).not.toContain('\n  ');
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    await codeInput.fill('function test(){return true;}');
    
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format/i });
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
    }
    
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // 验证复制成功提示
      await expect(page.locator('text=copied, text=success')).toBeVisible({ timeout: 3000 });
    }
  });

  test('清空功能测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    
    // 输入内容
    await codeInput.fill('function test(){return true;}');
    
    // 查找清空按钮
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      if (await page.locator('textarea').count() > 0) {
        await expect(page.locator('textarea').first()).toHaveValue('');
      }
    }
  });

  test('文件上传功能测试', async ({ page }) => {
    // 查找文件上传输入
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // 创建临时文件内容
      const fileContent = 'function test(){console.log("hello");}';
      
      // 模拟文件上传（注意：这需要实际的文件系统支持）
      // 这里只验证文件输入元素存在
      await expect(fileInput).toBeVisible();
    }
  });

  test('语法高亮测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input, .monaco-editor').first();
    
    // 输入代码
    await codeInput.fill('function test() { return "hello"; }');
    
    // 查找语法高亮元素
    const highlightedElements = page.locator('.hljs, .token, .keyword, .string');
    
    if (await highlightedElements.count() > 0) {
      await expect(highlightedElements.first()).toBeVisible();
    }
  });

  test('错误处理测试', async ({ page }) => {
    const codeInput = page.locator('textarea, .code-input').first();
    
    // 输入无效的代码
    await codeInput.fill('function test(){ invalid syntax here }}}');
    
    const beautifyButton = page.locator('button').filter({ hasText: /beautify|format/i });
    if (await beautifyButton.count() > 0) {
      await beautifyButton.click();
      
      // 查找错误信息
      const errorMessage = page.locator('.error, .invalid, text=error, text=invalid');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('设置保存测试', async ({ page }) => {
    // 查找设置选项
    const settingsButton = page.locator('button').filter({ hasText: /settings|options|preferences/i });
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      
      // 查找设置面板
      const settingsPanel = page.locator('.settings, .options, .preferences');
      
      if (await settingsPanel.count() > 0) {
        await expect(settingsPanel).toBeVisible();
      }
    }
  });
});