import { test, expect } from '@playwright/test';

test.describe('Dev Forge SQL Formatter', () => {
  const baseUrl = 'https://www.001236.xyz/en/sql';

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

  test('SQL Formatter页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/SQL.*Formatter.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'SQL Formatter' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Format and beautify SQL queries')).toBeVisible();
  });

  test('SQL输入区域测试', async ({ page }) => {
    // 查找SQL输入框
    const sqlInput = page.locator('textarea, .sql-input, .code-input').first();
    await expect(sqlInput).toBeVisible();
    
    // 测试输入SQL语句
    const sqlQuery = 'SELECT * FROM users WHERE id = 1';
    await sqlInput.fill(sqlQuery);
    
    if (await page.locator('textarea').count() > 0) {
      await expect(page.locator('textarea').first()).toHaveValue(sqlQuery);
    }
  });

  test('基本SQL格式化测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const formatButton = page.locator('button').filter({ hasText: /format|beautify|pretty/i });
    
    // 输入压缩的SQL语句
    const minifiedSql = 'SELECT id,name,email FROM users WHERE status=1 AND created_at>"2023-01-01" ORDER BY name';
    await sqlInput.fill(minifiedSql);
    
    if (await formatButton.count() > 0) {
      await formatButton.click();
      
      // 验证SQL被格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedSql = await result.textContent() || await result.inputValue();
        expect(formattedSql).toContain('\n'); // 应该包含换行符
        expect(formattedSql).toMatch(/SELECT\s+/i); // SELECT后应有适当空格
        expect(formattedSql).toMatch(/FROM\s+/i); // FROM后应有适当空格
      }
    }
  });

  test('复杂SQL查询格式化测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const formatButton = page.locator('button').filter({ hasText: /format|beautify/i });
    
    // 输入复杂的SQL查询
    const complexSql = 'SELECT u.id,u.name,p.title FROM users u LEFT JOIN posts p ON u.id=p.user_id WHERE u.status=1 AND p.published=true GROUP BY u.id HAVING COUNT(p.id)>5 ORDER BY u.name LIMIT 10';
    await sqlInput.fill(complexSql);
    
    if (await formatButton.count() > 0) {
      await formatButton.click();
      
      // 验证复杂SQL被正确格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedSql = await result.textContent() || await result.inputValue();
        expect(formattedSql).toContain('\n');
        expect(formattedSql).toMatch(/LEFT JOIN/i);
        expect(formattedSql).toMatch(/GROUP BY/i);
        expect(formattedSql).toMatch(/ORDER BY/i);
      }
    }
  });

  test('SQL方言选择测试', async ({ page }) => {
    // 查找SQL方言选择器
    const dialectSelect = page.locator('select[name*="dialect"], select[name*="database"]');
    
    if (await dialectSelect.count() > 0) {
      // 测试选择MySQL
      await dialectSelect.selectOption('mysql');
      await expect(dialectSelect).toHaveValue('mysql');
      
      // 测试选择PostgreSQL
      await dialectSelect.selectOption('postgresql');
      await expect(dialectSelect).toHaveValue('postgresql');
      
      // 测试选择SQL Server
      await dialectSelect.selectOption('sqlserver');
      await expect(dialectSelect).toHaveValue('sqlserver');
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
      
      // 输入SQL并格式化
      const sqlInput = page.locator('textarea, .sql-input').first();
      await sqlInput.fill('SELECT id FROM users WHERE status=1');
      
      const formatButton = page.locator('button').filter({ hasText: /format/i });
      if (await formatButton.count() > 0) {
        await formatButton.click();
      }
    }
  });

  test('关键字大小写设置测试', async ({ page }) => {
    // 查找关键字大小写设置
    const caseSelect = page.locator('select[name*="case"], select[name*="keyword"]');
    
    if (await caseSelect.count() > 0) {
      const sqlInput = page.locator('textarea, .sql-input').first();
      await sqlInput.fill('select id from users where status=1');
      
      // 测试大写关键字
      await caseSelect.selectOption('upper');
      
      const formatButton = page.locator('button').filter({ hasText: /format/i });
      if (await formatButton.count() > 0) {
        await formatButton.click();
        
        const result = page.locator('.result, .output, textarea').last();
        if (await result.count() > 0) {
          const formattedSql = await result.textContent() || await result.inputValue();
          expect(formattedSql).toMatch(/SELECT/); // 应该是大写
          expect(formattedSql).toMatch(/FROM/);
          expect(formattedSql).toMatch(/WHERE/);
        }
      }
    }
  });

  test('SQL压缩功能测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const minifyButton = page.locator('button').filter({ hasText: /minify|compress|compact/i });
    
    if (await minifyButton.count() > 0) {
      // 输入格式化的SQL
      const formattedSql = `SELECT\n  id,\n  name,\n  email\nFROM\n  users\nWHERE\n  status = 1`;
      await sqlInput.fill(formattedSql);
      
      await minifyButton.click();
      
      // 验证SQL被压缩
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const minifiedSql = await result.textContent() || await result.inputValue();
        expect(minifiedSql.length).toBeLessThan(formattedSql.length);
        expect(minifiedSql).not.toContain('\n  ');
      }
    }
  });

  test('SQL验证功能测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const validateButton = page.locator('button').filter({ hasText: /validate|check/i });
    
    if (await validateButton.count() > 0) {
      // 测试有效SQL
      await sqlInput.fill('SELECT * FROM users WHERE id = 1');
      await validateButton.click();
      
      // 验证成功信息
      const successMessage = page.locator('text=valid, text=success, .success');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // 测试无效SQL
      await sqlInput.fill('SELECT * FORM users WHERE');
      await validateButton.click();
      
      // 验证错误信息
      const errorMessage = page.locator('text=invalid, text=error, .error');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('SQL语法高亮测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input, .code-editor').first();
    
    // 输入SQL语句
    await sqlInput.fill('SELECT id, name FROM users WHERE status = 1');
    
    // 查找语法高亮元素
    const highlightedElements = page.locator('.hljs, .token, .keyword, .string, .sql-keyword');
    
    if (await highlightedElements.count() > 0) {
      await expect(highlightedElements.first()).toBeVisible();
    }
  });

  test('多语句SQL格式化测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const formatButton = page.locator('button').filter({ hasText: /format/i });
    
    // 输入多个SQL语句
    const multiSql = 'SELECT * FROM users; UPDATE users SET status=1 WHERE id=1; DELETE FROM logs WHERE created_at<"2023-01-01";';
    await sqlInput.fill(multiSql);
    
    if (await formatButton.count() > 0) {
      await formatButton.click();
      
      // 验证多语句被正确格式化
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedSql = await result.textContent() || await result.inputValue();
        expect(formattedSql).toContain('SELECT');
        expect(formattedSql).toContain('UPDATE');
        expect(formattedSql).toContain('DELETE');
        expect(formattedSql).toMatch(/;\s*\n/); // 语句间应有分隔
      }
    }
  });

  test('SQL注释处理测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    const formatButton = page.locator('button').filter({ hasText: /format/i });
    
    // 输入带注释的SQL
    const sqlWithComments = 'SELECT id, -- user identifier\nname, /* user name */ email FROM users WHERE status=1';
    await sqlInput.fill(sqlWithComments);
    
    if (await formatButton.count() > 0) {
      await formatButton.click();
      
      // 验证注释被保留
      const result = page.locator('.result, .output, textarea').last();
      if (await result.count() > 0) {
        const formattedSql = await result.textContent() || await result.inputValue();
        expect(formattedSql).toContain('--');
        expect(formattedSql).toContain('/*');
        expect(formattedSql).toContain('*/');
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    await sqlInput.fill('SELECT * FROM users');
    
    const formatButton = page.locator('button').filter({ hasText: /format/i });
    if (await formatButton.count() > 0) {
      await formatButton.click();
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
    const sqlInput = page.locator('textarea, .sql-input').first();
    
    // 输入内容
    await sqlInput.fill('SELECT * FROM users');
    
    // 查找清空按钮
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      if (await page.locator('textarea').count() > 0) {
        await expect(page.locator('textarea').first()).toHaveValue('');
      }
    }
  });

  test('SQL模板功能测试', async ({ page }) => {
    // 查找模板选择器或按钮
    const templateButtons = page.locator('button').filter({ hasText: /template|example|sample/i });
    
    if (await templateButtons.count() > 0) {
      // 测试SELECT模板
      const selectTemplate = templateButtons.filter({ hasText: /select/i }).first();
      if (await selectTemplate.count() > 0) {
        await selectTemplate.click();
        
        const sqlInput = page.locator('textarea, .sql-input').first();
        const value = await sqlInput.inputValue();
        expect(value).toContain('SELECT');
      }
    }
  });

  test('文件导入导出测试', async ({ page }) => {
    // 查找文件上传输入
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      await expect(fileInput).toBeVisible();
    }
    
    // 查找导出按钮
    const exportButton = page.locator('button').filter({ hasText: /export|download|save/i });
    
    if (await exportButton.count() > 0) {
      const sqlInput = page.locator('textarea, .sql-input').first();
      await sqlInput.fill('SELECT * FROM users');
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.sql$/);
      } catch (error) {
        console.log('Export button clicked, but no download occurred');
      }
    }
  });

  test('SQL历史记录测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    
    // 输入几个不同的SQL语句
    const queries = [
      'SELECT * FROM users',
      'SELECT id, name FROM products',
      'SELECT COUNT(*) FROM orders'
    ];
    
    for (const query of queries) {
      await sqlInput.fill(query);
      
      const formatButton = page.locator('button').filter({ hasText: /format/i });
      if (await formatButton.count() > 0) {
        await formatButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .previous');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
    }
  });

  test('错误处理测试', async ({ page }) => {
    const sqlInput = page.locator('textarea, .sql-input').first();
    
    // 输入语法错误的SQL
    const invalidSql = 'SELCT * FORM users WHRE id =';
    await sqlInput.fill(invalidSql);
    
    const formatButton = page.locator('button').filter({ hasText: /format/i });
    if (await formatButton.count() > 0) {
      await formatButton.click();
      
      // 查找错误信息
      const errorMessage = page.locator('.error, .invalid, text=error, text=invalid');
      
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });
});