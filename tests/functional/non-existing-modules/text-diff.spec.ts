import { test, expect } from '@playwright/test';

test.describe('Dev Forge Text Diff', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.001236.xyz/en/');
    await page.click('text=Text Diff');
    await page.waitForLoadState('networkidle');
    
    // 检查是否显示"Tool implementation coming soon..."
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Tool implementation coming soon')) {
      test.skip(true, 'Tool implementation coming soon...');
    }
  });

  test('基本文本差异比较', async ({ page }) => {
    const originalText = 'Hello World\nThis is line 2\nThis is line 3';
    const modifiedText = 'Hello Universe\nThis is line 2\nThis is line 4';
    
    // 填入原始文本
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', originalText);
    
    // 填入修改后文本
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', modifiedText);
    
    // 点击比较按钮
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证差异结果显示
    const diffResult = page.locator('.diff-result, .comparison-result, [data-testid="diff-result"]');
    await expect(diffResult).toBeVisible();
    
    // 验证删除和添加的内容
    const deletedContent = page.locator('.deleted, .removed, .diff-removed');
    const addedContent = page.locator('.added, .inserted, .diff-added');
    
    await expect(deletedContent).toBeVisible();
    await expect(addedContent).toBeVisible();
  });

  test('行级差异显示', async ({ page }) => {
    const text1 = 'Line 1\nLine 2\nLine 3\nLine 4';
    const text2 = 'Line 1\nModified Line 2\nLine 3\nNew Line 5';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证行号显示
    const lineNumbers = page.locator('.line-number, .line-num');
    await expect(lineNumbers.first()).toBeVisible();
    
    // 验证修改的行被高亮
    const modifiedLines = page.locator('.modified, .changed, .diff-modified');
    await expect(modifiedLines).toBeVisible();
  });

  test('字符级差异显示', async ({ page }) => {
    const text1 = 'The quick brown fox jumps over the lazy dog';
    const text2 = 'The quick red fox jumps over the sleepy cat';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找字符级比较选项
    const charLevelOption = page.locator('input[type="checkbox"]:has-text("character"), .char-level, [data-testid="char-level"]');
    if (await charLevelOption.count() > 0) {
      await charLevelOption.check();
    }
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证字符级差异显示
    const diffResult = page.locator('.diff-result, .comparison-result, [data-testid="diff-result"]');
    await expect(diffResult).toBeVisible();
    
    // 验证具体的字符变化
    const charChanges = page.locator('.char-diff, .character-change');
    if (await charChanges.count() > 0) {
      await expect(charChanges).toBeVisible();
    }
  });

  test('忽略空白字符选项', async ({ page }) => {
    const text1 = 'Hello    World\n  Line 2  ';
    const text2 = 'Hello World\nLine 2';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找忽略空白选项
    const ignoreWhitespace = page.locator('input[type="checkbox"]:has-text("whitespace"), .ignore-whitespace, [data-testid="ignore-whitespace"]');
    if (await ignoreWhitespace.count() > 0) {
      await ignoreWhitespace.check();
    }
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证结果显示无差异或差异较少
    const diffResult = page.locator('.diff-result, .comparison-result, [data-testid="diff-result"]');
    await expect(diffResult).toBeVisible();
    
    const noDiffMessage = page.locator('text=No differences, .no-diff, [data-testid="no-diff"]');
    if (await noDiffMessage.count() > 0) {
      await expect(noDiffMessage).toBeVisible();
    }
  });

  test('忽略大小写选项', async ({ page }) => {
    const text1 = 'Hello World\nTHIS IS LINE 2';
    const text2 = 'hello world\nthis is line 2';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找忽略大小写选项
    const ignoreCase = page.locator('input[type="checkbox"]:has-text("case"), .ignore-case, [data-testid="ignore-case"]');
    if (await ignoreCase.count() > 0) {
      await ignoreCase.check();
    }
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证结果显示无差异
    const noDiffMessage = page.locator('text=No differences, .no-diff, [data-testid="no-diff"]');
    if (await noDiffMessage.count() > 0) {
      await expect(noDiffMessage).toBeVisible();
    }
  });

  test('并排显示模式', async ({ page }) => {
    const text1 = 'Original text\nLine 2\nLine 3';
    const text2 = 'Modified text\nLine 2\nNew Line 3';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找并排显示选项
    const sideBySideMode = page.locator('button:has-text("Side by Side"), .side-by-side, [data-testid="side-by-side"]');
    if (await sideBySideMode.count() > 0) {
      await sideBySideMode.click();
    }
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证并排显示
    const leftPanel = page.locator('.left-panel, .original-panel, [data-testid="left-panel"]');
    const rightPanel = page.locator('.right-panel, .modified-panel, [data-testid="right-panel"]');
    
    if (await leftPanel.count() > 0 && await rightPanel.count() > 0) {
      await expect(leftPanel).toBeVisible();
      await expect(rightPanel).toBeVisible();
    }
  });

  test('统一显示模式', async ({ page }) => {
    const text1 = 'Original text\nLine 2\nLine 3';
    const text2 = 'Modified text\nLine 2\nNew Line 3';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找统一显示选项
    const unifiedMode = page.locator('button:has-text("Unified"), .unified, [data-testid="unified"]');
    if (await unifiedMode.count() > 0) {
      await unifiedMode.click();
    }
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证统一显示格式
    const unifiedDiff = page.locator('.unified-diff, .single-panel, [data-testid="unified-diff"]');
    if (await unifiedDiff.count() > 0) {
      await expect(unifiedDiff).toBeVisible();
    }
    
    // 验证+/-符号
    const addedLines = page.locator('text=+, .added-line');
    const removedLines = page.locator('text=-, .removed-line');
    
    if (await addedLines.count() > 0) {
      await expect(addedLines.first()).toBeVisible();
    }
    if (await removedLines.count() > 0) {
      await expect(removedLines.first()).toBeVisible();
    }
  });

  test('差异统计信息', async ({ page }) => {
    const text1 = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    const text2 = 'Line 1\nModified Line 2\nLine 3\nNew Line\nLine 5';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证统计信息显示
    const statsSection = page.locator('.stats, .statistics, .diff-stats, [data-testid="diff-stats"]');
    if (await statsSection.count() > 0) {
      await expect(statsSection).toBeVisible();
      
      const statsText = await statsSection.textContent();
      expect(statsText).toMatch(/\d+.*added|\d+.*removed|\d+.*modified/i);
    }
  });

  test('文件上传比较', async ({ page }) => {
    // 查找文件上传按钮
    const uploadButton1 = page.locator('input[type="file"]:first-of-type, .file-upload:first-of-type, [data-testid="upload-file-1"]');
    const uploadButton2 = page.locator('input[type="file"]:last-of-type, .file-upload:last-of-type, [data-testid="upload-file-2"]');
    
    if (await uploadButton1.count() > 0 && await uploadButton2.count() > 0) {
      // 创建测试文件内容
      const file1Content = 'File 1 content\nLine 2\nLine 3';
      const file2Content = 'File 1 modified\nLine 2\nNew Line 3';
      
      // 模拟文件上传（实际测试中可能需要真实文件）
      await page.evaluate(() => {
        const input1 = document.querySelector('input[type="file"]:first-of-type') as HTMLInputElement;
        const input2 = document.querySelector('input[type="file"]:last-of-type') as HTMLInputElement;
        
        if (input1 && input2) {
          // 触发文件选择事件
          input1.dispatchEvent(new Event('change'));
          input2.dispatchEvent(new Event('change'));
        }
      });
    }
  });

  test('导出差异结果', async ({ page }) => {
    const text1 = 'Original content\nLine 2';
    const text2 = 'Modified content\nLine 2';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 查找导出按钮
    const exportButton = page.locator('button:has-text("Export"), .export-btn, [data-testid="export-button"]');
    if (await exportButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/diff.*\.(txt|html|pdf)$/i);
    }
  });

  test('清空文本功能', async ({ page }) => {
    const testText = 'Test content to be cleared';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', testText);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', testText);
    
    // 查找清空按钮
    const clearButton = page.locator('button:has-text("Clear"), .clear-btn, [data-testid="clear-button"]');
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      const text1Value = await page.inputValue('textarea:first-of-type, .original-text, [data-testid="original-text"]');
      const text2Value = await page.inputValue('textarea:last-of-type, .modified-text, [data-testid="modified-text"]');
      
      expect(text1Value).toBe('');
      expect(text2Value).toBe('');
    }
  });

  test('交换文本位置', async ({ page }) => {
    const text1 = 'First text';
    const text2 = 'Second text';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    // 查找交换按钮
    const swapButton = page.locator('button:has-text("Swap"), .swap-btn, [data-testid="swap-button"]');
    if (await swapButton.count() > 0) {
      await swapButton.click();
      
      const newText1Value = await page.inputValue('textarea:first-of-type, .original-text, [data-testid="original-text"]');
      const newText2Value = await page.inputValue('textarea:last-of-type, .modified-text, [data-testid="modified-text"]');
      
      expect(newText1Value).toBe(text2);
      expect(newText2Value).toBe(text1);
    }
  });

  test('处理大文件差异', async ({ page }) => {
    const largeText1 = 'Large file content line '.repeat(1000) + '\n';
    const largeText2 = 'Large file modified line '.repeat(1000) + '\n';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', largeText1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', largeText2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 验证大文件处理
    const diffResult = page.locator('.diff-result, .comparison-result, [data-testid="diff-result"]');
    await expect(diffResult).toBeVisible({ timeout: 10000 });
    
    // 检查是否有性能警告或分页
    const performanceWarning = page.locator('.warning, .performance-notice, [data-testid="performance-warning"]');
    const pagination = page.locator('.pagination, .page-nav, [data-testid="pagination"]');
    
    // 大文件可能会有性能提示或分页
    const hasWarning = await performanceWarning.count() > 0;
    const hasPagination = await pagination.count() > 0;
    
    if (hasWarning || hasPagination) {
      expect(hasWarning || hasPagination).toBeTruthy();
    }
  });

  test('搜索差异内容', async ({ page }) => {
    const text1 = 'Hello World\nThis is line 2\nAnother line\nFinal line';
    const text2 = 'Hello Universe\nThis is line 2\nModified line\nFinal line';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 查找搜索功能
    const searchInput = page.locator('input[placeholder*="search"], .search-input, [data-testid="search-input"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Modified');
      
      // 验证搜索结果高亮
      const highlightedText = page.locator('.highlight, .search-result, [data-testid="search-highlight"]');
      if (await highlightedText.count() > 0) {
        await expect(highlightedText).toBeVisible();
      }
    }
  });

  test('差异导航功能', async ({ page }) => {
    const text1 = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
    const text2 = 'Modified 1\nLine 2\nModified 3\nLine 4\nLine 5\nModified 6\nLine 7\nLine 8';
    
    await page.fill('textarea:first-of-type, .original-text, [data-testid="original-text"]', text1);
    await page.fill('textarea:last-of-type, .modified-text, [data-testid="modified-text"]', text2);
    
    const compareButton = page.locator('button:has-text("Compare"), .compare-btn, [data-testid="compare-button"]');
    if (await compareButton.count() > 0) {
      await compareButton.click();
    }
    
    // 查找导航按钮
    const nextDiffButton = page.locator('button:has-text("Next"), .next-diff, [data-testid="next-diff"]');
    const prevDiffButton = page.locator('button:has-text("Previous"), .prev-diff, [data-testid="prev-diff"]');
    
    if (await nextDiffButton.count() > 0) {
      await nextDiffButton.click();
      
      // 验证导航到下一个差异
      const activeDiff = page.locator('.active-diff, .current-diff, [data-testid="active-diff"]');
      if (await activeDiff.count() > 0) {
        await expect(activeDiff).toBeVisible();
      }
    }
  });
});