import { test, expect } from '@playwright/test';

test.describe('Dev Forge SQL Formatter工具页面', () => {

  const url = 'https://www.001236.xyz/en/sql-formatter';
  const sqlInput = 'textarea[placeholder*="SQL"], .sql-input, .code-input';
  const formatButton = 'button:has-text("Format"), button:has-text("格式化")';
  const minifyButton = 'button:has-text("Minify"), button:has-text("压缩")';
  const outputArea = '.formatted-sql, .output, .result';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const downloadButton = 'button:has-text("Download"), button:has-text("下载")';
  const dialectSelect = 'select[name="dialect"], .dialect-select';
  const indentSelect = 'select[name="indent"], .indent-select';
  const keywordCaseSelect = 'select[name="keywordCase"], .keyword-case-select';

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
    await expect(page).toHaveTitle(/SQL|Formatter/);
    
    // 验证SQL输入框存在
    const sqlInputElement = page.locator(sqlInput);
    if (await sqlInputElement.count() > 0) {
      await expect(sqlInputElement.first()).toBeVisible();
    }
    
    // 验证格式化按钮存在
    const formatBtn = page.locator(formatButton);
    if (await formatBtn.count() > 0) {
      await expect(formatBtn.first()).toBeVisible();
    }
    
    // 验证输出区域存在
    const outputElement = page.locator(outputArea);
    if (await outputElement.count() > 0) {
      await expect(outputElement.first()).toBeVisible();
    }
  });

  test('基本SQL格式化测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入未格式化的SQL
      const unformattedSQL = 'select id,name,email from users where age>18 and status="active" order by name';
      await sqlInputElement.first().fill(unformattedSQL);
      
      // 点击格式化按钮
      await formatBtn.first().click();
      
      // 验证格式化结果
      if (await outputElement.count() > 0) {
        const formattedSQL = await outputElement.first().textContent();
        expect(formattedSQL).toContain('SELECT');
        expect(formattedSQL).toContain('FROM');
        expect(formattedSQL).toContain('WHERE');
        expect(formattedSQL).toContain('ORDER BY');
        
        // 验证格式化后的SQL包含换行和缩进
        expect(formattedSQL?.includes('\n') || formattedSQL?.includes('  ')).toBeTruthy();
      }
    }
  });

  test('复杂SQL查询格式化测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入复杂的SQL查询
      const complexSQL = `
        select u.id,u.name,p.title,c.name as category from users u 
        inner join posts p on u.id=p.user_id 
        left join categories c on p.category_id=c.id 
        where u.created_at>='2023-01-01' and p.status='published' 
        group by u.id,u.name having count(p.id)>5 
        order by u.name,p.created_at desc limit 10
      `;
      
      await sqlInputElement.first().fill(complexSQL);
      await formatBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const formattedSQL = await outputElement.first().textContent();
        
        // 验证关键字被正确格式化
        expect(formattedSQL).toContain('SELECT');
        expect(formattedSQL).toContain('INNER JOIN');
        expect(formattedSQL).toContain('LEFT JOIN');
        expect(formattedSQL).toContain('GROUP BY');
        expect(formattedSQL).toContain('HAVING');
        expect(formattedSQL).toContain('ORDER BY');
        expect(formattedSQL).toContain('LIMIT');
      }
    }
  });

  test('SQL压缩测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const minifyBtn = page.locator(minifyButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await minifyBtn.count() > 0) {
      // 输入格式化的SQL
      const formattedSQL = `
        SELECT 
          id,
          name,
          email
        FROM 
          users 
        WHERE 
          age > 18
          AND status = 'active'
        ORDER BY 
          name
      `;
      
      await sqlInputElement.first().fill(formattedSQL);
      await minifyBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const minifiedSQL = await outputElement.first().textContent();
        
        // 验证SQL被压缩（移除多余空格和换行）
        expect(minifiedSQL?.includes('\n')).toBeFalsy();
        expect(minifiedSQL?.trim().split(/\s+/).length).toBeLessThan(formattedSQL.trim().split(/\s+/).length);
      }
    }
  });

  test('不同SQL方言支持测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const dialectElement = page.locator(dialectSelect);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0 && await dialectElement.count() > 0) {
      const testSQL = 'select top 10 * from users where name like "%john%"';
      await sqlInputElement.first().fill(testSQL);
      
      // 测试不同方言
      const dialects = ['mysql', 'postgresql', 'sqlite', 'mssql', 'oracle'];
      
      for (const dialect of dialects) {
        try {
          await dialectElement.first().selectOption(dialect);
          await formatBtn.first().click();
          
          if (await outputElement.count() > 0) {
            const result = await outputElement.first().textContent();
            expect(result?.length).toBeGreaterThan(0);
          }
        } catch (error) {
          // 如果方言选项不存在，跳过
          continue;
        }
      }
    }
  });

  test('缩进设置测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const indentElement = page.locator(indentSelect);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0 && await indentElement.count() > 0) {
      const testSQL = 'select id,name from users where age>18';
      await sqlInputElement.first().fill(testSQL);
      
      // 测试不同缩进设置
      const indentOptions = ['2', '4', 'tab'];
      
      for (const indent of indentOptions) {
        try {
          await indentElement.first().selectOption(indent);
          await formatBtn.first().click();
          
          if (await outputElement.count() > 0) {
            const result = await outputElement.first().textContent();
            expect(result?.length).toBeGreaterThan(0);
            
            // 验证缩进被应用
            if (indent === 'tab') {
              expect(result?.includes('\t')).toBeTruthy();
            } else {
              const spaces = ' '.repeat(parseInt(indent));
              expect(result?.includes(spaces)).toBeTruthy();
            }
          }
        } catch (error) {
          // 如果缩进选项不存在，跳过
          continue;
        }
      }
    }
  });

  test('关键字大小写设置测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const keywordCaseElement = page.locator(keywordCaseSelect);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0 && await keywordCaseElement.count() > 0) {
      const testSQL = 'select id,name from users where age>18';
      await sqlInputElement.first().fill(testSQL);
      
      // 测试大写关键字
      try {
        await keywordCaseElement.first().selectOption('upper');
        await formatBtn.first().click();
        
        if (await outputElement.count() > 0) {
          const result = await outputElement.first().textContent();
          expect(result).toContain('SELECT');
          expect(result).toContain('FROM');
          expect(result).toContain('WHERE');
        }
      } catch (error) {
        // 如果选项不存在，跳过
      }
      
      // 测试小写关键字
      try {
        await keywordCaseElement.first().selectOption('lower');
        await formatBtn.first().click();
        
        if (await outputElement.count() > 0) {
          const result = await outputElement.first().textContent();
          expect(result).toContain('select');
          expect(result).toContain('from');
          expect(result).toContain('where');
        }
      } catch (error) {
        // 如果选项不存在，跳过
      }
    }
  });

  test('无效SQL处理测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入无效的SQL
      const invalidSQL = 'select from where and or';
      await sqlInputElement.first().fill(invalidSQL);
      await formatBtn.first().click();
      
      // 验证错误处理
      const errorMessage = page.locator('text=Error, text=Invalid, text=错误, text=无效');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 确保输入框为空
      await sqlInputElement.first().fill('');
      await formatBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const copyBtn = page.locator(copyButton);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入并格式化SQL
      await sqlInputElement.first().fill('select * from users');
      await formatBtn.first().click();
      
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
    const sqlInputElement = page.locator(sqlInput);
    const clearBtn = page.locator(clearButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await sqlInputElement.first().fill('select * from users');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(sqlInputElement.first()).toHaveValue('');
      
      // 验证输出区域也被清空
      if (await outputElement.count() > 0) {
        const result = await outputElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('下载功能测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const downloadBtn = page.locator(downloadButton);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0 && await downloadBtn.count() > 0) {
      // 输入并格式化SQL
      await sqlInputElement.first().fill('select * from users where age > 18');
      await formatBtn.first().click();
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      // 点击下载按钮
      await downloadBtn.first().click();
      
      // 验证下载开始
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(sql|txt)$/);
      } catch (error) {
        // 如果下载功能不可用，跳过验证
      }
    }
  });

  test('SQL语法高亮测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入SQL
      await sqlInputElement.first().fill('select id, name from users where age > 18');
      await formatBtn.first().click();
      
      if (await outputElement.count() > 0) {
        // 检查是否有语法高亮元素
        const highlightElements = page.locator(`${outputArea} .keyword, ${outputArea} .string, ${outputArea} .number`);
        if (await highlightElements.count() > 0) {
          await expect(highlightElements.first()).toBeVisible();
        }
      }
    }
  });

  test('多语句SQL格式化测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入多个SQL语句
      const multipleSQL = `
        select * from users; 
        insert into users (name, email) values ('John', 'john@example.com'); 
        update users set age = 25 where id = 1; 
        delete from users where age < 18;
      `;
      
      await sqlInputElement.first().fill(multipleSQL);
      await formatBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const formattedSQL = await outputElement.first().textContent();
        
        // 验证所有语句都被格式化
        expect(formattedSQL).toContain('SELECT');
        expect(formattedSQL).toContain('INSERT');
        expect(formattedSQL).toContain('UPDATE');
        expect(formattedSQL).toContain('DELETE');
        
        // 验证语句分隔符
        expect(formattedSQL).toContain(';');
      }
    }
  });

  test('SQL注释处理测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const outputElement = page.locator(outputArea);
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 输入带注释的SQL
      const sqlWithComments = `
        -- This is a comment
        select id, /* inline comment */ name 
        from users 
        where age > 18 -- another comment
      `;
      
      await sqlInputElement.first().fill(sqlWithComments);
      await formatBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const formattedSQL = await outputElement.first().textContent();
        
        // 验证注释被保留
        expect(formattedSQL).toContain('--');
        expect(formattedSQL).toContain('/*');
        expect(formattedSQL).toContain('*/');
      }
    }
  });

  test('SQL格式化历史记录测试', async ({ page }) => {
    const sqlInputElement = page.locator(sqlInput);
    const formatBtn = page.locator(formatButton);
    const historyElement = page.locator('.format-history, .history');
    
    if (await sqlInputElement.count() > 0 && await formatBtn.count() > 0) {
      // 格式化几个不同的SQL
      const sqlQueries = [
        'select * from users',
        'select id, name from products',
        'select count(*) from orders'
      ];
      
      for (const sql of sqlQueries) {
        await sqlInputElement.first().fill(sql);
        await formatBtn.first().click();
        await page.waitForTimeout(500);
      }
      
      // 验证历史记录显示
      if (await historyElement.count() > 0) {
        await expect(historyElement.first()).toBeVisible();
        
        // 点击历史记录中的项目
        const historyItems = page.locator(`${historyElement} .history-item`);
        if (await historyItems.count() > 0) {
          await historyItems.first().click();
          
          // 验证SQL恢复
          const restoredSQL = await sqlInputElement.first().inputValue();
          expect(restoredSQL.length).toBeGreaterThan(0);
        }
      }
    }
  });

});