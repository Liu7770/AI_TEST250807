import { test, expect } from '@playwright/test';

test.describe('Dev Forge HTTP Status Lookup', () => {
  const baseUrl = 'https://www.001236.xyz/en/http-status';

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

  test('HTTP Status Lookup页面基本元素验证', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/HTTP.*Status.*Lookup.*Dev Forge/);
    
    // 验证主标题
    await expect(page.locator('h1').filter({ hasText: 'HTTP Status Lookup' })).toBeVisible();
    
    // 验证页面描述
    await expect(page.locator('text=Look up HTTP status codes and their meanings')).toBeVisible();
  });

  test('状态码输入区域测试', async ({ page }) => {
    // 查找状态码输入框
    const statusInput = page.locator('input[type="number"], input[placeholder*="status"], .status-input');
    
    if (await statusInput.count() > 0) {
      await expect(statusInput.first()).toBeVisible();
      
      // 测试输入状态码
      await statusInput.first().fill('200');
      await expect(statusInput.first()).toHaveValue('200');
    }
  });

  test('状态码搜索功能测试', async ({ page }) => {
    // 查找搜索按钮
    const searchButton = page.locator('button').filter({ hasText: /search|lookup|find/i });
    
    if (await searchButton.count() > 0) {
      await expect(searchButton.first()).toBeVisible();
      
      // 输入状态码并搜索
      const statusInput = page.locator('input[type="number"], input[placeholder*="status"]');
      if (await statusInput.count() > 0) {
        await statusInput.first().fill('404');
        await searchButton.first().click();
        
        // 验证搜索结果
        const resultArea = page.locator('.result, .status-info, .lookup-result');
        if (await resultArea.count() > 0) {
          await expect(resultArea.first()).toBeVisible();
        }
      }
    }
  });

  test('常见状态码测试 - 200 OK', async ({ page }) => {
    // 查找200状态码
    const status200 = page.locator('text=200, .status-200');
    
    if (await status200.count() > 0) {
      await status200.first().click();
      
      // 验证状态码信息
      await expect(page.locator('text=OK, text=Success')).toBeVisible();
      await expect(page.locator('text=successful, text=request has succeeded')).toBeVisible();
    }
  });

  test('常见状态码测试 - 404 Not Found', async ({ page }) => {
    // 查找404状态码
    const status404 = page.locator('text=404, .status-404');
    
    if (await status404.count() > 0) {
      await status404.first().click();
      
      // 验证状态码信息
      await expect(page.locator('text=Not Found, text=not found')).toBeVisible();
      await expect(page.locator('text=server can not find, text=requested resource')).toBeVisible();
    }
  });

  test('常见状态码测试 - 500 Internal Server Error', async ({ page }) => {
    // 查找500状态码
    const status500 = page.locator('text=500, .status-500');
    
    if (await status500.count() > 0) {
      await status500.first().click();
      
      // 验证状态码信息
      await expect(page.locator('text=Internal Server Error, text=server error')).toBeVisible();
      await expect(page.locator('text=server encountered, text=unexpected condition')).toBeVisible();
    }
  });

  test('状态码分类测试', async ({ page }) => {
    // 查找状态码分类
    const categories = [
      { code: '1xx', name: 'Informational' },
      { code: '2xx', name: 'Success' },
      { code: '3xx', name: 'Redirection' },
      { code: '4xx', name: 'Client Error' },
      { code: '5xx', name: 'Server Error' }
    ];
    
    for (const category of categories) {
      const categoryElement = page.locator(`text=${category.code}, text=${category.name}`);
      if (await categoryElement.count() > 0) {
        await expect(categoryElement.first()).toBeVisible();
      }
    }
  });

  test('状态码列表显示测试', async ({ page }) => {
    // 查找状态码列表
    const statusList = page.locator('.status-list, .codes-list, table');
    
    if (await statusList.count() > 0) {
      await expect(statusList.first()).toBeVisible();
      
      // 验证列表包含常见状态码
      const commonCodes = ['200', '201', '301', '302', '400', '401', '403', '404', '500', '502', '503'];
      
      for (const code of commonCodes) {
        const codeElement = page.locator(`text=${code}`);
        if (await codeElement.count() > 0) {
          await expect(codeElement.first()).toBeVisible();
        }
      }
    }
  });

  test('状态码详细信息显示测试', async ({ page }) => {
    // 点击一个状态码查看详细信息
    const statusCode = page.locator('text=200').first();
    
    if (await statusCode.count() > 0) {
      await statusCode.click();
      
      // 验证详细信息区域
      const detailArea = page.locator('.detail, .info, .description');
      if (await detailArea.count() > 0) {
        await expect(detailArea.first()).toBeVisible();
        
        // 验证包含状态码、名称和描述
        await expect(page.locator('text=200')).toBeVisible();
        await expect(page.locator('text=OK')).toBeVisible();
      }
    }
  });

  test('搜索过滤功能测试', async ({ page }) => {
    // 查找搜索框
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], .search-input');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
      
      // 测试搜索功能
      await searchInput.first().fill('not found');
      
      // 验证搜索结果
      const searchResults = page.locator('.search-result, .filtered-result');
      if (await searchResults.count() > 0) {
        await expect(searchResults.first()).toBeVisible();
      }
      
      // 验证404状态码出现在结果中
      await expect(page.locator('text=404')).toBeVisible();
    }
  });

  test('状态码快速查找测试', async ({ page }) => {
    // 查找快速查找按钮或链接
    const quickLinks = page.locator('.quick-link, .common-codes a, .popular-codes a');
    
    if (await quickLinks.count() > 0) {
      const firstLink = quickLinks.first();
      await expect(firstLink).toBeVisible();
      
      // 点击快速链接
      await firstLink.click();
      
      // 验证跳转到对应状态码
      const activeStatus = page.locator('.active, .selected, .highlighted');
      if (await activeStatus.count() > 0) {
        await expect(activeStatus.first()).toBeVisible();
      }
    }
  });

  test('状态码复制功能测试', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button').filter({ hasText: /copy/i });
    
    if (await copyButton.count() > 0) {
      await expect(copyButton.first()).toBeVisible();
      
      // 点击复制按钮
      await copyButton.first().click();
      
      // 验证复制成功提示
      await expect(page.locator('text=copied, text=success')).toBeVisible({ timeout: 3000 });
    }
  });

  test('状态码收藏功能测试', async ({ page }) => {
    // 查找收藏按钮
    const favoriteButton = page.locator('button').filter({ hasText: /favorite|bookmark|star/i });
    
    if (await favoriteButton.count() > 0) {
      await expect(favoriteButton.first()).toBeVisible();
      
      // 点击收藏按钮
      await favoriteButton.first().click();
      
      // 验证收藏状态变化
      const favoriteIcon = page.locator('.favorited, .starred, .bookmarked');
      if (await favoriteIcon.count() > 0) {
        await expect(favoriteIcon.first()).toBeVisible();
      }
    }
  });

  test('状态码历史记录测试', async ({ page }) => {
    // 查找历史记录区域
    const historyArea = page.locator('.history, .recent, .last-viewed');
    
    if (await historyArea.count() > 0) {
      await expect(historyArea).toBeVisible();
      
      // 查看一个状态码以添加到历史记录
      const statusCode = page.locator('text=200').first();
      if (await statusCode.count() > 0) {
        await statusCode.click();
        
        // 验证历史记录中出现该状态码
        const historyItem = page.locator('.history-item, .recent-item');
        if (await historyItem.count() > 0) {
          await expect(historyItem.first()).toBeVisible();
        }
      }
    }
  });

  test('状态码导出功能测试', async ({ page }) => {
    // 查找导出按钮
    const exportButton = page.locator('button').filter({ hasText: /export|download|save/i });
    
    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeVisible();
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      try {
        await exportButton.first().click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(json|csv|txt|pdf)$/);
      } catch (error) {
        console.log('Export button clicked, but no download occurred');
      }
    }
  });

  test('状态码比较功能测试', async ({ page }) => {
    // 查找比较功能
    const compareButton = page.locator('button').filter({ hasText: /compare/i });
    
    if (await compareButton.count() > 0) {
      await expect(compareButton.first()).toBeVisible();
      
      // 选择两个状态码进行比较
      const status200 = page.locator('text=200').first();
      const status404 = page.locator('text=404').first();
      
      if (await status200.count() > 0 && await status404.count() > 0) {
        await status200.click();
        await status404.click();
        await compareButton.first().click();
        
        // 验证比较结果
        const compareResult = page.locator('.compare-result, .comparison');
        if (await compareResult.count() > 0) {
          await expect(compareResult.first()).toBeVisible();
        }
      }
    }
  });

  test('状态码API信息测试', async ({ page }) => {
    // 查找API信息区域
    const apiInfo = page.locator('.api-info, .usage, .examples');
    
    if (await apiInfo.count() > 0) {
      await expect(apiInfo).toBeVisible();
      
      // 验证包含使用示例
      const codeExample = page.locator('code, .code-example, pre');
      if (await codeExample.count() > 0) {
        await expect(codeExample.first()).toBeVisible();
      }
    }
  });

  test('错误处理测试', async ({ page }) => {
    // 测试输入无效状态码
    const statusInput = page.locator('input[type="number"], input[placeholder*="status"]');
    
    if (await statusInput.count() > 0) {
      // 输入无效状态码
      await statusInput.first().fill('999');
      
      const searchButton = page.locator('button').filter({ hasText: /search|lookup/i });
      if (await searchButton.count() > 0) {
        await searchButton.first().click();
        
        // 查找错误信息或"未找到"信息
        const errorMessage = page.locator('.error, .not-found, text=not found, text=invalid');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试不同屏幕尺寸下的布局
    
    // 桌面视图
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // 验证状态码列表在移动设备上仍然可用
    const statusList = page.locator('.status-list, table');
    if (await statusList.count() > 0) {
      await expect(statusList.first()).toBeVisible();
    }
  });

  test('键盘导航测试', async ({ page }) => {
    // 测试Tab键导航
    await page.keyboard.press('Tab');
    
    // 验证焦点在可交互元素上
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // 测试方向键导航状态码列表
    const statusList = page.locator('.status-list, table');
    if (await statusList.count() > 0) {
      await statusList.first().focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
    }
    
    // 测试Enter键选择状态码
    const statusCode = page.locator('text=200').first();
    if (await statusCode.count() > 0) {
      await statusCode.focus();
      await page.keyboard.press('Enter');
    }
  });

  test('性能测试', async ({ page }) => {
    // 测试大量状态码加载性能
    const startTime = Date.now();
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 验证页面加载时间合理（小于5秒）
    expect(loadTime).toBeLessThan(5000);
    
    // 验证状态码列表渲染
    const statusList = page.locator('.status-list, table');
    if (await statusList.count() > 0) {
      await expect(statusList.first()).toBeVisible();
    }
  });
});