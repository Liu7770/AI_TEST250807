import { test, expect } from '@playwright/test';

test.describe('Dev Forge HTTP Status Lookup工具页面', () => {

  const url = 'https://www.001236.xyz/en/http-status-lookup';
  const statusInput = 'input[placeholder*="status"], input[placeholder*="code"], .status-input';
  const searchButton = 'button:has-text("Search"), button:has-text("查找"), button:has-text("Lookup")';
  const resultArea = '.status-result, .result, .output';
  const statusCodeElement = '.status-code, .code';
  const statusNameElement = '.status-name, .name';
  const statusDescriptionElement = '.status-description, .description';
  const categoryElement = '.status-category, .category';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const statusList = '.status-list, .all-statuses';
  const filterSelect = 'select[name="category"], .category-filter';
  const searchInput = 'input[placeholder*="search"], .search-input';

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
    await expect(page).toHaveTitle(/HTTP|Status|Lookup/);
    
    // 验证状态码输入框存在
    const statusInputElement = page.locator(statusInput);
    if (await statusInputElement.count() > 0) {
      await expect(statusInputElement.first()).toBeVisible();
    }
    
    // 验证搜索按钮存在
    const searchBtn = page.locator(searchButton);
    if (await searchBtn.count() > 0) {
      await expect(searchBtn.first()).toBeVisible();
    }
    
    // 验证结果区域存在
    const resultElement = page.locator(resultArea);
    if (await resultElement.count() > 0) {
      await expect(resultElement.first()).toBeVisible();
    }
  });

  test('常见HTTP状态码查找测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const commonStatusCodes = [
        { code: '200', name: 'OK', description: 'successful' },
        { code: '404', name: 'Not Found', description: 'not found' },
        { code: '500', name: 'Internal Server Error', description: 'server error' },
        { code: '301', name: 'Moved Permanently', description: 'redirect' },
        { code: '401', name: 'Unauthorized', description: 'unauthorized' }
      ];
      
      for (const status of commonStatusCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          
          // 验证状态码显示
          expect(result).toContain(status.code);
          
          // 验证状态名称显示（不区分大小写）
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证描述信息显示
          expect(result?.toLowerCase()).toContain(status.description.toLowerCase());
        }
      }
    }
  });

  test('1xx信息性状态码测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    const categoryElement = page.locator(categoryElement);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const informationalCodes = [
        { code: '100', name: 'Continue' },
        { code: '101', name: 'Switching Protocols' },
        { code: '102', name: 'Processing' },
        { code: '103', name: 'Early Hints' }
      ];
      
      for (const status of informationalCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result).toContain(status.code);
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证分类为1xx或Informational
          if (await categoryElement.count() > 0) {
            const category = await categoryElement.first().textContent();
            expect(category?.toLowerCase()).toMatch(/(1xx|informational|信息)/i);
          }
        }
      }
    }
  });

  test('2xx成功状态码测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const successCodes = [
        { code: '200', name: 'OK' },
        { code: '201', name: 'Created' },
        { code: '202', name: 'Accepted' },
        { code: '204', name: 'No Content' },
        { code: '206', name: 'Partial Content' }
      ];
      
      for (const status of successCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result).toContain(status.code);
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证分类为2xx或Success
          expect(result?.toLowerCase()).toMatch(/(2xx|success|成功)/i);
        }
      }
    }
  });

  test('3xx重定向状态码测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const redirectCodes = [
        { code: '300', name: 'Multiple Choices' },
        { code: '301', name: 'Moved Permanently' },
        { code: '302', name: 'Found' },
        { code: '304', name: 'Not Modified' },
        { code: '307', name: 'Temporary Redirect' },
        { code: '308', name: 'Permanent Redirect' }
      ];
      
      for (const status of redirectCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result).toContain(status.code);
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证分类为3xx或Redirection
          expect(result?.toLowerCase()).toMatch(/(3xx|redirect|重定向)/i);
        }
      }
    }
  });

  test('4xx客户端错误状态码测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const clientErrorCodes = [
        { code: '400', name: 'Bad Request' },
        { code: '401', name: 'Unauthorized' },
        { code: '403', name: 'Forbidden' },
        { code: '404', name: 'Not Found' },
        { code: '405', name: 'Method Not Allowed' },
        { code: '409', name: 'Conflict' },
        { code: '429', name: 'Too Many Requests' }
      ];
      
      for (const status of clientErrorCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result).toContain(status.code);
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证分类为4xx或Client Error
          expect(result?.toLowerCase()).toMatch(/(4xx|client.*error|客户端.*错误)/i);
        }
      }
    }
  });

  test('5xx服务器错误状态码测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const serverErrorCodes = [
        { code: '500', name: 'Internal Server Error' },
        { code: '501', name: 'Not Implemented' },
        { code: '502', name: 'Bad Gateway' },
        { code: '503', name: 'Service Unavailable' },
        { code: '504', name: 'Gateway Timeout' },
        { code: '505', name: 'HTTP Version Not Supported' }
      ];
      
      for (const status of serverErrorCodes) {
        await statusInputElement.first().fill(status.code);
        await searchBtn.first().click();
        
        if (await resultElement.count() > 0) {
          const result = await resultElement.first().textContent();
          expect(result).toContain(status.code);
          expect(result?.toLowerCase()).toContain(status.name.toLowerCase());
          
          // 验证分类为5xx或Server Error
          expect(result?.toLowerCase()).toMatch(/(5xx|server.*error|服务器.*错误)/i);
        }
      }
    }
  });

  test('无效状态码处理测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      const invalidCodes = ['999', '123', '600', 'abc', '0'];
      
      for (const code of invalidCodes) {
        await statusInputElement.first().fill(code);
        await searchBtn.first().click();
        
        // 验证错误处理
        const errorMessage = page.locator('text=Invalid, text=Not found, text=无效, text=未找到');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      // 确保输入框为空
      await statusInputElement.first().fill('');
      await searchBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('状态码列表显示测试', async ({ page }) => {
    const statusListElement = page.locator(statusList);
    
    if (await statusListElement.count() > 0) {
      await expect(statusListElement.first()).toBeVisible();
      
      // 验证列表包含常见状态码
      const listContent = await statusListElement.first().textContent();
      expect(listContent).toContain('200');
      expect(listContent).toContain('404');
      expect(listContent).toContain('500');
      
      // 点击列表中的状态码
      const statusItem = page.locator(`${statusList} .status-item:has-text("200")`);
      if (await statusItem.count() > 0) {
        await statusItem.first().click();
        
        // 验证状态码被填入输入框
        const statusInputElement = page.locator(statusInput);
        if (await statusInputElement.count() > 0) {
          const inputValue = await statusInputElement.first().inputValue();
          expect(inputValue).toBe('200');
        }
      }
    }
  });

  test('分类筛选测试', async ({ page }) => {
    const filterElement = page.locator(filterSelect);
    const statusListElement = page.locator(statusList);
    
    if (await filterElement.count() > 0 && await statusListElement.count() > 0) {
      // 测试不同分类筛选
      const categories = ['1xx', '2xx', '3xx', '4xx', '5xx'];
      
      for (const category of categories) {
        try {
          await filterElement.first().selectOption(category);
          
          // 验证列表只显示对应分类的状态码
          const listContent = await statusListElement.first().textContent();
          const categoryPrefix = category.charAt(0);
          
          // 检查列表中的状态码是否都以对应数字开头
          const statusCodes = listContent?.match(/\b\d{3}\b/g) || [];
          for (const code of statusCodes) {
            expect(code.charAt(0)).toBe(categoryPrefix);
          }
        } catch (error) {
          // 如果分类选项不存在，跳过
          continue;
        }
      }
    }
  });

  test('搜索功能测试', async ({ page }) => {
    const searchInputElement = page.locator(searchInput);
    const statusListElement = page.locator(statusList);
    
    if (await searchInputElement.count() > 0 && await statusListElement.count() > 0) {
      // 搜索特定状态码名称
      const searchTerms = ['not found', 'server error', 'unauthorized', 'redirect'];
      
      for (const term of searchTerms) {
        await searchInputElement.first().fill(term);
        await page.waitForTimeout(500); // 等待搜索结果更新
        
        // 验证搜索结果
        const listContent = await statusListElement.first().textContent();
        expect(listContent?.toLowerCase()).toContain(term.toLowerCase());
      }
    }
  });

  test('清空功能测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const clearBtn = page.locator(clearButton);
    const resultElement = page.locator(resultArea);
    
    if (await statusInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入状态码并搜索
      await statusInputElement.first().fill('200');
      
      const searchBtn = page.locator(searchButton);
      if (await searchBtn.count() > 0) {
        await searchBtn.first().click();
      }
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(statusInputElement.first()).toHaveValue('');
      
      // 验证结果区域也被清空
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('状态码详细信息显示测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const codeElement = page.locator(statusCodeElement);
    const nameElement = page.locator(statusNameElement);
    const descriptionElement = page.locator(statusDescriptionElement);
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0) {
      // 搜索404状态码
      await statusInputElement.first().fill('404');
      await searchBtn.first().click();
      
      // 验证状态码显示
      if (await codeElement.count() > 0) {
        const code = await codeElement.first().textContent();
        expect(code).toContain('404');
      }
      
      // 验证状态名称显示
      if (await nameElement.count() > 0) {
        const name = await nameElement.first().textContent();
        expect(name?.toLowerCase()).toContain('not found');
      }
      
      // 验证状态描述显示
      if (await descriptionElement.count() > 0) {
        const description = await descriptionElement.first().textContent();
        expect(description?.length).toBeGreaterThan(10);
      }
    }
  });

  test('键盘快捷键测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    
    if (await statusInputElement.count() > 0) {
      // 聚焦到输入框
      await statusInputElement.first().focus();
      
      // 输入状态码
      await statusInputElement.first().fill('200');
      
      // 按Enter键搜索
      await page.keyboard.press('Enter');
      
      // 验证搜索结果
      const resultElement = page.locator(resultArea);
      if (await resultElement.count() > 0) {
        const result = await resultElement.first().textContent();
        expect(result).toContain('200');
        expect(result?.toLowerCase()).toContain('ok');
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    
    // 验证元素在移动端仍然可见和可用
    if (await statusInputElement.count() > 0) {
      await expect(statusInputElement.first()).toBeVisible();
    }
    
    if (await searchBtn.count() > 0) {
      await expect(searchBtn.first()).toBeVisible();
    }
    
    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('状态码收藏功能测试', async ({ page }) => {
    const statusInputElement = page.locator(statusInput);
    const searchBtn = page.locator(searchButton);
    const favoriteBtn = page.locator('button:has-text("Favorite"), button:has-text("收藏"), .favorite-btn');
    const favoritesSection = page.locator('.favorites, .bookmarks');
    
    if (await statusInputElement.count() > 0 && await searchBtn.count() > 0 && await favoriteBtn.count() > 0) {
      // 搜索状态码
      await statusInputElement.first().fill('200');
      await searchBtn.first().click();
      
      // 点击收藏按钮
      await favoriteBtn.first().click();
      
      // 验证收藏成功提示
      const successMessage = page.locator('text=Added to favorites, text=已收藏');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // 验证收藏列表显示
      if (await favoritesSection.count() > 0) {
        const favoritesContent = await favoritesSection.first().textContent();
        expect(favoritesContent).toContain('200');
      }
    }
  });

  test('状态码比较功能测试', async ({ page }) => {
    const compareBtn = page.locator('button:has-text("Compare"), button:has-text("比较")');
    const firstCodeInput = page.locator('.first-code-input, input[name="code1"]');
    const secondCodeInput = page.locator('.second-code-input, input[name="code2"]');
    const comparisonResult = page.locator('.comparison-result, .compare-output');
    
    if (await compareBtn.count() > 0 && await firstCodeInput.count() > 0 && await secondCodeInput.count() > 0) {
      // 输入两个状态码进行比较
      await firstCodeInput.first().fill('200');
      await secondCodeInput.first().fill('404');
      
      // 点击比较按钮
      await compareBtn.first().click();
      
      // 验证比较结果
      if (await comparisonResult.count() > 0) {
        const result = await comparisonResult.first().textContent();
        expect(result).toContain('200');
        expect(result).toContain('404');
        expect(result?.toLowerCase()).toContain('success');
        expect(result?.toLowerCase()).toContain('error');
      }
    }
  });

});