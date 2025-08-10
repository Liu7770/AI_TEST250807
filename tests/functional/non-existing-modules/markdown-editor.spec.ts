import { test, expect } from '@playwright/test';

test.describe('Dev Forge Markdown Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=Markdown Editor');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Tool implementation coming soon')) {
      test.skip(true, 'Tool implementation coming soon...');
    }
  });

  test('基本Markdown编辑和预览', async ({ page }) => {
    const markdownText = '# Hello World\n\nThis is a **bold** text and *italic* text.\n\n- List item 1\n- List item 2';
    
    // 输入Markdown文本
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 验证预览区域显示
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    await expect(previewArea).toBeVisible();
    
    // 验证HTML渲染
    const previewContent = await previewArea.innerHTML();
    expect(previewContent).toContain('<h1>');
    expect(previewContent).toContain('<strong>');
    expect(previewContent).toContain('<em>');
    expect(previewContent).toContain('<ul>');
  });

  test('标题语法渲染', async ({ page }) => {
    const headingMarkdown = '# H1 Title\n## H2 Title\n### H3 Title\n#### H4 Title\n##### H5 Title\n###### H6 Title';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', headingMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证所有标题级别
    expect(previewContent).toContain('<h1>');
    expect(previewContent).toContain('<h2>');
    expect(previewContent).toContain('<h3>');
    expect(previewContent).toContain('<h4>');
    expect(previewContent).toContain('<h5>');
    expect(previewContent).toContain('<h6>');
  });

  test('列表语法渲染', async ({ page }) => {
    const listMarkdown = '## Unordered List\n- Item 1\n- Item 2\n  - Nested item\n\n## Ordered List\n1. First\n2. Second\n   1. Nested numbered';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', listMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证无序和有序列表
    expect(previewContent).toContain('<ul>');
    expect(previewContent).toContain('<ol>');
    expect(previewContent).toContain('<li>');
  });

  test('链接和图片语法', async ({ page }) => {
    const linkImageMarkdown = '[Google](https://google.com)\n\n![Alt text](https://via.placeholder.com/150)\n\n<https://example.com>';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', linkImageMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证链接和图片
    expect(previewContent).toContain('<a href="https://google.com">');
    expect(previewContent).toContain('<img');
    expect(previewContent).toContain('alt="Alt text"');
  });

  test('代码块语法', async ({ page }) => {
    const codeMarkdown = '`inline code`\n\n```javascript\nfunction hello() {\n  console.log("Hello World");\n}\n```\n\n```\nPlain code block\n```';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', codeMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证内联代码和代码块
    expect(previewContent).toContain('<code>');
    expect(previewContent).toContain('<pre>');
    expect(previewContent).toContain('function hello');
  });

  test('表格语法', async ({ page }) => {
    const tableMarkdown = '| Name | Age | City |\n|------|-----|------|\n| John | 25  | NYC  |\n| Jane | 30  | LA   |';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', tableMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证表格元素
    expect(previewContent).toContain('<table>');
    expect(previewContent).toContain('<thead>');
    expect(previewContent).toContain('<tbody>');
    expect(previewContent).toContain('<th>');
    expect(previewContent).toContain('<td>');
  });

  test('引用块语法', async ({ page }) => {
    const quoteMarkdown = '> This is a quote\n> with multiple lines\n\n> > Nested quote';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', quoteMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证引用块
    expect(previewContent).toContain('<blockquote>');
  });

  test('分隔线语法', async ({ page }) => {
    const hrMarkdown = 'Content above\n\n---\n\nContent below\n\n***\n\nMore content';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', hrMarkdown);
    
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    const previewContent = await previewArea.innerHTML();
    
    // 验证分隔线
    expect(previewContent).toContain('<hr>');
  });

  test('实时预览功能', async ({ page }) => {
    const initialText = '# Initial Title';
    const updatedText = '# Updated Title';
    
    // 输入初始文本
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', initialText);
    
    // 验证初始预览
    const previewArea = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
    await expect(previewArea).toContainText('Initial Title');
    
    // 更新文本
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', updatedText);
    
    // 验证预览实时更新
    await expect(previewArea).toContainText('Updated Title');
  });

  test('工具栏快捷按钮', async ({ page }) => {
    // 查找工具栏按钮
    const boldButton = page.locator('button:has-text("B"), .bold-btn, [data-testid="bold-button"]');
    const italicButton = page.locator('button:has-text("I"), .italic-btn, [data-testid="italic-button"]');
    const linkButton = page.locator('button:has-text("Link"), .link-btn, [data-testid="link-button"]');
    
    if (await boldButton.count() > 0) {
      // 选择一些文本
      await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', 'selected text');
      await page.locator('textarea, .markdown-input, [data-testid="markdown-input"]').selectText();
      
      // 点击加粗按钮
      await boldButton.click();
      
      // 验证Markdown语法被添加
      const textValue = await page.inputValue('textarea, .markdown-input, [data-testid="markdown-input"]');
      expect(textValue).toContain('**selected text**');
    }
  });

  test('语法高亮显示', async ({ page }) => {
    const markdownText = '# Title\n**bold** *italic* `code`';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找语法高亮元素
    const syntaxHighlight = page.locator('.syntax-highlight, .highlighted, .cm-editor');
    if (await syntaxHighlight.count() > 0) {
      await expect(syntaxHighlight).toBeVisible();
    }
  });

  test('全屏编辑模式', async ({ page }) => {
    // 查找全屏按钮
    const fullscreenButton = page.locator('button:has-text("Fullscreen"), .fullscreen-btn, [data-testid="fullscreen-button"]');
    if (await fullscreenButton.count() > 0) {
      await fullscreenButton.click();
      
      // 验证全屏模式
      const fullscreenEditor = page.locator('.fullscreen, .full-screen, [data-testid="fullscreen-editor"]');
      await expect(fullscreenEditor).toBeVisible();
      
      // 退出全屏
      const exitFullscreen = page.locator('button:has-text("Exit"), .exit-fullscreen, [data-testid="exit-fullscreen"]');
      if (await exitFullscreen.count() > 0) {
        await exitFullscreen.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('导出HTML功能', async ({ page }) => {
    const markdownText = '# Export Test\n\nThis is a **test** document.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找导出按钮
    const exportButton = page.locator('button:has-text("Export"), .export-btn, [data-testid="export-button"]');
    const exportHtmlButton = page.locator('button:has-text("HTML"), .export-html, [data-testid="export-html"]');
    
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      if (await exportHtmlButton.count() > 0) {
        const downloadPromise = page.waitForEvent('download');
        await exportHtmlButton.click();
        
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/.*\.html$/i);
      }
    }
  });

  test('导出Markdown功能', async ({ page }) => {
    const markdownText = '# Export Test\n\nThis is a **test** document.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找导出Markdown按钮
    const exportMdButton = page.locator('button:has-text("Markdown"), .export-md, [data-testid="export-markdown"]');
    if (await exportMdButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await exportMdButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/.*\.(md|markdown)$/i);
    }
  });

  test('文件导入功能', async ({ page }) => {
    // 查找文件导入按钮
    const importButton = page.locator('input[type="file"], .import-btn, [data-testid="import-file"]');
    if (await importButton.count() > 0) {
      // 模拟文件导入
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          input.dispatchEvent(new Event('change'));
        }
      });
    }
  });

  test('字数统计功能', async ({ page }) => {
    const markdownText = 'This is a test document with multiple words to count.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找字数统计显示
    const wordCount = page.locator('.word-count, .stats, [data-testid="word-count"]');
    if (await wordCount.count() > 0) {
      await expect(wordCount).toBeVisible();
      
      const countText = await wordCount.textContent();
      expect(countText).toMatch(/\d+.*word/i);
    }
  });

  test('目录生成功能', async ({ page }) => {
    const markdownWithHeadings = '# Chapter 1\n\n## Section 1.1\n\n### Subsection 1.1.1\n\n# Chapter 2\n\n## Section 2.1';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownWithHeadings);
    
    // 查找目录按钮
    const tocButton = page.locator('button:has-text("TOC"), .toc-btn, [data-testid="toc-button"]');
    if (await tocButton.count() > 0) {
      await tocButton.click();
      
      // 验证目录显示
      const tocPanel = page.locator('.toc, .table-of-contents, [data-testid="toc-panel"]');
      await expect(tocPanel).toBeVisible();
      
      // 验证目录包含标题
      const tocContent = await tocPanel.textContent();
      expect(tocContent).toContain('Chapter 1');
      expect(tocContent).toContain('Section 1.1');
    }
  });

  test('主题切换功能', async ({ page }) => {
    // 查找主题切换按钮
    const themeButton = page.locator('button:has-text("Theme"), .theme-btn, [data-testid="theme-button"]');
    const darkThemeButton = page.locator('button:has-text("Dark"), .dark-theme, [data-testid="dark-theme"]');
    
    if (await themeButton.count() > 0) {
      await themeButton.click();
      
      if (await darkThemeButton.count() > 0) {
        await darkThemeButton.click();
        
        // 验证主题切换
        const darkMode = page.locator('.dark, .dark-mode, [data-theme="dark"]');
        if (await darkMode.count() > 0) {
          await expect(darkMode).toBeVisible();
        }
      }
    }
  });

  test('自动保存功能', async ({ page }) => {
    const markdownText = '# Auto Save Test\n\nThis content should be auto-saved.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 等待自动保存
    await page.waitForTimeout(2000);
    
    // 查找自动保存指示器
    const autoSaveIndicator = page.locator('.auto-saved, .saved, [data-testid="auto-save-indicator"]');
    if (await autoSaveIndicator.count() > 0) {
      await expect(autoSaveIndicator).toBeVisible();
    }
    
    // 刷新页面验证内容是否保存
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const savedContent = await page.inputValue('textarea, .markdown-input, [data-testid="markdown-input"]');
    if (savedContent) {
      expect(savedContent).toContain('Auto Save Test');
    }
  });

  test('查找替换功能', async ({ page }) => {
    const markdownText = 'Hello world. This is a hello world example.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 打开查找替换
    await page.keyboard.press('Control+F');
    
    // 或查找查找按钮
    const findButton = page.locator('button:has-text("Find"), .find-btn, [data-testid="find-button"]');
    if (await findButton.count() > 0) {
      await findButton.click();
    }
    
    // 查找输入框
    const findInput = page.locator('input[placeholder*="find"], .find-input, [data-testid="find-input"]');
    if (await findInput.count() > 0) {
      await findInput.fill('hello');
      
      // 验证高亮显示
      const highlighted = page.locator('.highlight, .search-highlight, [data-testid="search-highlight"]');
      if (await highlighted.count() > 0) {
        await expect(highlighted.first()).toBeVisible();
      }
    }
  });

  test('分屏预览模式', async ({ page }) => {
    const markdownText = '# Split View Test\n\nThis tests the split view functionality.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找分屏按钮
    const splitViewButton = page.locator('button:has-text("Split"), .split-view, [data-testid="split-view"]');
    if (await splitViewButton.count() > 0) {
      await splitViewButton.click();
      
      // 验证编辑器和预览都可见
      const editor = page.locator('textarea, .markdown-input, [data-testid="markdown-input"]');
      const preview = page.locator('.preview, .markdown-preview, [data-testid="markdown-preview"]');
      
      await expect(editor).toBeVisible();
      await expect(preview).toBeVisible();
    }
  });

  test('清空编辑器功能', async ({ page }) => {
    const markdownText = '# Content to be cleared\n\nThis will be removed.';
    
    await page.fill('textarea, .markdown-input, [data-testid="markdown-input"]', markdownText);
    
    // 查找清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      // 确认清空
      const confirmButton = page.locator('button:has-text("Confirm"), .confirm-clear, [data-testid="confirm-clear"]');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      const editorValue = await page.inputValue('textarea, .markdown-input, [data-testid="markdown-input"]');
      expect(editorValue).toBe('');
    }
  });

  test('Markdown语法帮助', async ({ page }) => {
    // 查找帮助按钮
    const helpButton = page.locator('button:has-text("Help"), .help-btn, [data-testid="help-button"]');
    if (await helpButton.count() > 0) {
      await helpButton.click();
      
      // 验证帮助面板显示
      const helpPanel = page.locator('.help, .syntax-help, [data-testid="help-panel"]');
      await expect(helpPanel).toBeVisible();
      
      // 验证包含Markdown语法说明
      const helpContent = await helpPanel.textContent();
      expect(helpContent).toMatch(/header|bold|italic|link/i);
    }
  });
});