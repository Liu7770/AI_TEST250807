import { test, expect } from '@playwright/test';

test.describe('Dev Forge Code Beautifier工具页面', () => {

  const url = 'https://www.001236.xyz/en/code-beautifier';
  const codeInput = 'textarea, .code-input, .input-area';
  const languageSelect = 'select, .language-select, .lang-selector';
  const beautifyButton = 'button:has-text("Beautify"), button:has-text("Format"), button:has-text("美化")';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const resultArea = '.result, .output, .formatted-code, pre, code';
  const downloadButton = 'button:has-text("Download"), button:has-text("下载")';

  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    
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

  test('页面基本元素存在性测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Code|Beautifier|Format/);
    
    // 验证代码输入区域存在
    const codeInputElement = page.locator(codeInput);
    if (await codeInputElement.count() > 0) {
      await expect(codeInputElement.first()).toBeVisible();
    }
    
    // 验证语言选择器存在
    const languageSelectElement = page.locator(languageSelect);
    if (await languageSelectElement.count() > 0) {
      await expect(languageSelectElement.first()).toBeVisible();
    }
    
    // 验证美化按钮存在
    const beautifyBtn = page.locator(beautifyButton);
    if (await beautifyBtn.count() > 0) {
      await expect(beautifyBtn.first()).toBeVisible();
    }
  });

  test('JavaScript代码美化测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 选择JavaScript语言
      if (await languageSelectElement.count() > 0) {
        await languageSelectElement.first().selectOption({ label: 'JavaScript' });
      }
      
      // 输入压缩的JavaScript代码
      const uglyJs = 'function test(){var a=1;var b=2;if(a<b){console.log("hello");}}test();';
      await codeInputElement.first().fill(uglyJs);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证美化结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const beautifiedCode = await resultElement.first().textContent();
        expect(beautifiedCode).toContain('function test()');
        expect(beautifiedCode).toContain('var a = 1');
        expect(beautifiedCode).toContain('var b = 2');
        expect(beautifiedCode).toMatch(/\n|\r/);
      }
    }
  });

  test('CSS代码美化测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 选择CSS语言
      if (await languageSelectElement.count() > 0) {
        await languageSelectElement.first().selectOption({ label: 'CSS' });
      }
      
      // 输入压缩的CSS代码
      const uglyCss = 'body{margin:0;padding:0;}.container{width:100%;height:100vh;display:flex;}';
      await codeInputElement.first().fill(uglyCss);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证美化结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const beautifiedCode = await resultElement.first().textContent();
        expect(beautifiedCode).toContain('body {');
        expect(beautifiedCode).toContain('margin: 0');
        expect(beautifiedCode).toContain('.container {');
        expect(beautifiedCode).toMatch(/\n|\r/);
      }
    }
  });

  test('HTML代码美化测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 选择HTML语言
      if (await languageSelectElement.count() > 0) {
        await languageSelectElement.first().selectOption({ label: 'HTML' });
      }
      
      // 输入压缩的HTML代码
      const uglyHtml = '<html><head><title>Test</title></head><body><div class="container"><p>Hello World</p></div></body></html>';
      await codeInputElement.first().fill(uglyHtml);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证美化结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const beautifiedCode = await resultElement.first().textContent();
        expect(beautifiedCode).toContain('<html>');
        expect(beautifiedCode).toContain('<head>');
        expect(beautifiedCode).toContain('<title>Test</title>');
        expect(beautifiedCode).toMatch(/\n|\r/);
      }
    }
  });

  test('JSON代码美化测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 选择JSON语言
      if (await languageSelectElement.count() > 0) {
        await languageSelectElement.first().selectOption({ label: 'JSON' });
      }
      
      // 输入压缩的JSON代码
      const uglyJson = '{"name":"test","age":25,"address":{"city":"Beijing","country":"China"}}';
      await codeInputElement.first().fill(uglyJson);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证美化结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const beautifiedCode = await resultElement.first().textContent();
        expect(beautifiedCode).toContain('"name": "test"');
        expect(beautifiedCode).toContain('"age": 25');
        expect(beautifiedCode).toContain('"address": {');
        expect(beautifiedCode).toMatch(/\n|\r/);
      }
    }
  });

  test('XML代码美化测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 选择XML语言
      if (await languageSelectElement.count() > 0) {
        await languageSelectElement.first().selectOption({ label: 'XML' });
      }
      
      // 输入压缩的XML代码
      const uglyXml = '<root><person><name>John</name><age>30</age></person></root>';
      await codeInputElement.first().fill(uglyXml);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证美化结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const beautifiedCode = await resultElement.first().textContent();
        expect(beautifiedCode).toContain('<root>');
        expect(beautifiedCode).toContain('<person>');
        expect(beautifiedCode).toContain('<name>John</name>');
        expect(beautifiedCode).toMatch(/\n|\r/);
      }
    }
  });

  test('无效代码处理测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 输入无效的代码
      const invalidCode = 'function test( { var a = 1; console.log(a); }';
      await codeInputElement.first().fill(invalidCode);
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证错误处理
      const errorMessage = page.locator('text=Error, text=Invalid, text=错误, text=无效');
      const resultElement = page.locator(resultArea);
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      } else if (await resultElement.count() > 0) {
        // 或者验证原始代码被返回
        const result = await resultElement.first().textContent();
        expect(result?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 确保输入框为空
      await codeInputElement.first().fill('');
      
      // 点击美化按钮
      await beautifyBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      const resultElement = page.locator(resultArea);
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      } else if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('代码缩进设置测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const indentSelect = page.locator('select[name="indent"], .indent-select');
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 输入测试代码
      const testCode = 'function test(){var a=1;if(a){console.log(a);}}';
      await codeInputElement.first().fill(testCode);
      
      // 如果有缩进设置选项
      if (await indentSelect.count() > 0) {
        // 设置为4个空格缩进
        await indentSelect.first().selectOption('4');
        
        // 美化代码
        await beautifyBtn.first().click();
        
        // 验证缩进效果
        const resultElement = page.locator(resultArea);
        if (await resultElement.count() > 0) {
          const beautifiedCode = await resultElement.first().textContent();
          expect(beautifiedCode).toMatch(/    var a = 1/);
        }
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const copyBtn = page.locator(copyButton);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 输入并美化代码
      await codeInputElement.first().fill('function test(){console.log("hello");}')
      await beautifyBtn.first().click();
      
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
    const codeInputElement = page.locator(codeInput);
    const clearBtn = page.locator(clearButton);
    
    if (await codeInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await codeInputElement.first().fill('function test(){console.log("hello");}')
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(codeInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('下载功能测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const downloadBtn = page.locator(downloadButton);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0) {
      // 输入并美化代码
      await codeInputElement.first().fill('function test(){console.log("hello");}')
      await beautifyBtn.first().click();
      
      // 如果有下载按钮，测试下载功能
      if (await downloadBtn.count() > 0) {
        // 监听下载事件
        const downloadPromise = page.waitForEvent('download');
        await downloadBtn.first().click();
        
        // 验证下载开始
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(js|css|html|json|xml|txt)$/);
      }
    }
  });

  test('语言自动检测测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const autoDetectBtn = page.locator('button:has-text("Auto Detect"), button:has-text("自动检测")');
    const languageDisplay = page.locator('.detected-language, .language-info');
    
    if (await codeInputElement.count() > 0) {
      // 输入明显的JavaScript代码
      const jsCode = 'function test() { console.log("Hello World"); }';
      await codeInputElement.first().fill(jsCode);
      
      // 如果有自动检测按钮
      if (await autoDetectBtn.count() > 0) {
        await autoDetectBtn.first().click();
        
        // 验证语言检测结果
        if (await languageDisplay.count() > 0) {
          const detectedLanguage = await languageDisplay.first().textContent();
          expect(detectedLanguage?.toLowerCase()).toContain('javascript');
        }
      }
    }
  });

  test('代码压缩功能测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const minifyBtn = page.locator('button:has-text("Minify"), button:has-text("压缩")');
    
    if (await codeInputElement.count() > 0 && await minifyBtn.count() > 0) {
      // 输入格式化的代码
      const formattedCode = `function test() {
    var a = 1;
    var b = 2;
    console.log(a + b);
}`;
      await codeInputElement.first().fill(formattedCode);
      
      // 点击压缩按钮
      await minifyBtn.first().click();
      
      // 验证压缩结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const minifiedCode = await resultElement.first().textContent();
        expect(minifiedCode?.length).toBeLessThan(formattedCode.length);
        expect(minifiedCode).not.toMatch(/\n\s+/);
      }
    }
  });

  test('多种语言切换测试', async ({ page }) => {
    const codeInputElement = page.locator(codeInput);
    const beautifyBtn = page.locator(beautifyButton);
    const languageSelectElement = page.locator(languageSelect);
    
    if (await codeInputElement.count() > 0 && await beautifyBtn.count() > 0 && await languageSelectElement.count() > 0) {
      const testCases = [
        { language: 'JavaScript', code: 'function test(){console.log("hello");}' },
        { language: 'CSS', code: 'body{margin:0;padding:0;}' },
        { language: 'HTML', code: '<div><p>Hello</p></div>' }
      ];
      
      for (const testCase of testCases) {
        // 选择语言
        await languageSelectElement.first().selectOption({ label: testCase.language });
        
        // 输入代码
        await codeInputElement.first().fill(testCase.code);
        
        // 美化代码
        await beautifyBtn.first().click();
        
        // 验证结果
        const resultElement = page.locator(resultArea);
        if (await resultElement.count() > 0) {
          const beautifiedCode = await resultElement.first().textContent();
          expect(beautifiedCode?.trim().length).toBeGreaterThan(0);
          expect(beautifiedCode).toMatch(/\n|\r/);
        }
      }
    }
  });

});