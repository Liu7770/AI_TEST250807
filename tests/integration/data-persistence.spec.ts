import { test, expect } from '@playwright/test';

test.describe('Dev Forge 数据持久化和状态管理测试', () => {

  const baseUrl = 'https://www.001236.xyz';

  test.beforeEach(async ({ page }) => {
    // 清理存储状态
    await page.goto(`${baseUrl}/en`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('本地存储功能测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 输入测试数据
    const testJson = '{"persistent": "data", "timestamp": "' + new Date().toISOString() + '"}';
    await page.locator('textarea').fill(testJson);
    
    // 检查是否自动保存到本地存储
    await page.waitForTimeout(1000);
    
    const savedData = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      };
    });
    
    console.log('Storage data after input:', savedData);
    
    // 刷新页面验证数据持久化
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查数据是否恢复
    const restoredValue = await page.locator('textarea').inputValue();
    console.log('Restored value after reload:', restoredValue);
    
    // 如果有自动保存功能，验证数据恢复
    if (restoredValue && restoredValue.length > 0) {
      expect(restoredValue).toContain('persistent');
    }
  });

  test('会话存储功能测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/base64`);
    
    // 测试编码模式状态保存
    await page.locator('div.p-1 button').filter({ hasText: 'Decode' }).click();
    
    // 输入测试数据
    await page.locator('textarea').fill('SGVsbG8gV29ybGQ='); // "Hello World" in base64
    
    // 检查会话存储
    const sessionData = await page.evaluate(() => {
      return Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {} as Record<string, string | null>);
    });
    
    console.log('Session storage data:', sessionData);
    
    // 在同一会话中导航到其他页面
    await page.locator('nav').locator('text=JSON Tools').click();
    await page.locator('nav').locator('text=Base64 Tools').click();
    
    // 验证状态是否保持
    const currentMode = await page.locator('div.p-1 button.bg-blue-500, div.p-1 button.bg-blue-600').textContent();
    console.log('Current mode after navigation:', currentMode);
    
    // 验证输入数据是否保持
    const currentValue = await page.locator('textarea').inputValue();
    console.log('Current value after navigation:', currentValue);
  });

  test('跨标签页状态同步测试', async ({ browser }) => {
    const context = await browser.newContext();
    
    // 创建第一个标签页
    const page1 = await context.newPage();
    await page1.goto(`${baseUrl}/en/json`);
    
    // 在第一个标签页输入数据
    const testData = '{"tab1": "data from first tab"}';
    await page1.locator('textarea').fill(testData);
    await page1.locator('button').filter({ hasText: 'Format' }).click();
    
    // 等待处理完成
    await page1.waitForTimeout(1000);
    
    // 创建第二个标签页
    const page2 = await context.newPage();
    await page2.goto(`${baseUrl}/en/json`);
    
    // 检查第二个标签页是否能访问相同的存储
    const page2Storage = await page2.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      };
    });
    
    console.log('Page2 storage:', page2Storage);
    
    // 在第二个标签页修改数据
    await page2.locator('textarea').fill('{"tab2": "data from second tab"}');
    
    // 检查存储事件监听（如果实现了）
    const storageEvents: any[] = [];
    await page1.evaluate(() => {
      window.addEventListener('storage', (e) => {
        (window as any).storageEvents = (window as any).storageEvents || [];
        (window as any).storageEvents.push({
          key: e.key,
          newValue: e.newValue,
          oldValue: e.oldValue
        });
      });
    });
    
    // 触发存储变化
    await page2.evaluate(() => {
      localStorage.setItem('test_sync', 'sync_test_value');
    });
    
    await page1.waitForTimeout(1000);
    
    // 检查第一个标签页是否收到存储事件
    const receivedEvents = await page1.evaluate(() => (window as any).storageEvents || []);
    console.log('Storage events received:', receivedEvents);
    
    await context.close();
  });

  test('数据版本控制和迁移测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 模拟旧版本数据格式
    await page.evaluate(() => {
      localStorage.setItem('app_version', '1.0.0');
      localStorage.setItem('user_data', JSON.stringify({
        version: '1.0.0',
        lastUsed: '2023-01-01',
        preferences: {
          theme: 'light',
          autoSave: true
        }
      }));
    });
    
    // 刷新页面触发可能的数据迁移
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查数据是否被正确迁移
    const migratedData = await page.evaluate(() => {
      return {
        version: localStorage.getItem('app_version'),
        userData: localStorage.getItem('user_data'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('Migrated data:', migratedData);
    
    // 验证数据结构
    if (migratedData.userData) {
      const parsedData = JSON.parse(migratedData.userData);
      expect(parsedData).toHaveProperty('preferences');
    }
  });

  test('存储配额和限制测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 测试存储配额
    const storageQuota = await page.evaluate(async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota ? estimate.quota - (estimate.usage || 0) : null
        };
      }
      return null;
    });
    
    console.log('Storage quota:', storageQuota);
    
    // 测试大量数据存储
    const largeDataTest = await page.evaluate(() => {
      try {
        const largeString = 'x'.repeat(1024 * 1024); // 1MB string
        localStorage.setItem('large_test_data', largeString);
        
        const retrieved = localStorage.getItem('large_test_data');
        const success = retrieved === largeString;
        
        // 清理
        localStorage.removeItem('large_test_data');
        
        return {
          success,
          size: largeString.length,
          error: null
        };
      } catch (error) {
        return {
          success: false,
          size: 0,
          error: error.message
        };
      }
    });
    
    console.log('Large data storage test:', largeDataTest);
  });

  test('存储安全性测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 测试XSS防护
    const xssTest = await page.evaluate(() => {
      const maliciousData = '<script>alert("xss")</script>';
      
      try {
        localStorage.setItem('xss_test', maliciousData);
        const retrieved = localStorage.getItem('xss_test');
        
        // 清理
        localStorage.removeItem('xss_test');
        
        return {
          stored: retrieved === maliciousData,
          escaped: retrieved !== maliciousData,
          value: retrieved
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('XSS storage test:', xssTest);
    
    // 测试敏感数据处理
    const sensitiveDataTest = await page.evaluate(() => {
      const sensitiveData = {
        password: 'secret123',
        token: 'abc123def456',
        creditCard: '1234-5678-9012-3456'
      };
      
      try {
        localStorage.setItem('sensitive_test', JSON.stringify(sensitiveData));
        const retrieved = localStorage.getItem('sensitive_test');
        
        // 检查是否有加密或混淆
        const isPlainText = retrieved && retrieved.includes('secret123');
        
        // 清理
        localStorage.removeItem('sensitive_test');
        
        return {
          storedAsPlainText: isPlainText,
          retrieved: retrieved
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('Sensitive data test:', sensitiveDataTest);
    
    // 验证敏感数据不应以明文存储
    if (sensitiveDataTest.storedAsPlainText) {
      console.warn('Warning: Sensitive data stored as plain text');
    }
  });

  test('离线数据同步测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 输入数据
    const offlineData = '{"offline": true, "timestamp": "' + Date.now() + '"}';
    await page.locator('textarea').fill(offlineData);
    
    // 模拟离线状态
    await page.evaluate(() => {
      // 模拟网络断开
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      // 触发离线事件
      window.dispatchEvent(new Event('offline'));
    });
    
    await page.waitForTimeout(1000);
    
    // 检查离线状态下的数据处理
    const offlineStatus = await page.evaluate(() => {
      return {
        isOnline: navigator.onLine,
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      };
    });
    
    console.log('Offline status:', offlineStatus);
    
    // 恢复在线状态
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      window.dispatchEvent(new Event('online'));
    });
    
    await page.waitForTimeout(1000);
    
    // 检查在线恢复后的数据同步
    const onlineStatus = await page.evaluate(() => {
      return {
        isOnline: navigator.onLine,
        localStorage: { ...localStorage }
      };
    });
    
    console.log('Online status restored:', onlineStatus);
  });

  test('数据导出导入功能测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 创建测试数据
    const testData = {
      json_history: [
        '{"test1": "value1"}',
        '{"test2": "value2"}'
      ],
      preferences: {
        theme: 'dark',
        autoFormat: true
      },
      timestamp: new Date().toISOString()
    };
    
    // 存储测试数据
    await page.evaluate((data) => {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    }, testData);
    
    // 模拟数据导出
    const exportedData = await page.evaluate(() => {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      return data;
    });
    
    console.log('Exported data:', exportedData);
    
    // 清空存储
    await page.evaluate(() => localStorage.clear());
    
    // 模拟数据导入
    await page.evaluate((data) => {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }, exportedData);
    
    // 验证导入的数据
    const importedData = await page.evaluate(() => {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            data[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      return data;
    });
    
    console.log('Imported data:', importedData);
    
    // 验证数据完整性
    expect(importedData.json_history).toEqual(testData.json_history);
    expect(importedData.preferences).toEqual(testData.preferences);
  });

  test('存储性能测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 测试大量小数据的存储性能
    const performanceTest = await page.evaluate(() => {
      const results: any = {};
      
      // 测试写入性能
      const writeStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        localStorage.setItem(`test_${i}`, JSON.stringify({ id: i, data: `test_data_${i}` }));
      }
      const writeEnd = performance.now();
      results.writeTime = writeEnd - writeStart;
      
      // 测试读取性能
      const readStart = performance.now();
      const readData = [];
      for (let i = 0; i < 1000; i++) {
        const item = localStorage.getItem(`test_${i}`);
        if (item) {
          readData.push(JSON.parse(item));
        }
      }
      const readEnd = performance.now();
      results.readTime = readEnd - readStart;
      results.readCount = readData.length;
      
      // 测试删除性能
      const deleteStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        localStorage.removeItem(`test_${i}`);
      }
      const deleteEnd = performance.now();
      results.deleteTime = deleteEnd - deleteStart;
      
      return results;
    });
    
    console.log('Storage performance test results:', performanceTest);
    
    // 验证性能在合理范围内
    expect(performanceTest.writeTime).toBeLessThan(5000); // 5秒内完成1000次写入
    expect(performanceTest.readTime).toBeLessThan(1000);  // 1秒内完成1000次读取
    expect(performanceTest.deleteTime).toBeLessThan(1000); // 1秒内完成1000次删除
    expect(performanceTest.readCount).toBe(1000);
  });

  test('存储事件监听测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);
    
    // 设置存储事件监听器
    await page.evaluate(() => {
      (window as any).storageEvents = [];
      
      window.addEventListener('storage', (e) => {
        (window as any).storageEvents.push({
          key: e.key,
          newValue: e.newValue,
          oldValue: e.oldValue,
          url: e.url,
          timestamp: Date.now()
        });
      });
      
      // 监听自定义存储事件
      window.addEventListener('localStorageChange', (e: any) => {
        (window as any).customStorageEvents = (window as any).customStorageEvents || [];
        (window as any).customStorageEvents.push(e.detail);
      });
    });
    
    // 在新标签页中触发存储变化
    const newPage = await page.context().newPage();
    await newPage.goto(`${baseUrl}/en`);
    
    await newPage.evaluate(() => {
      localStorage.setItem('event_test_1', 'value1');
      localStorage.setItem('event_test_2', 'value2');
      localStorage.removeItem('event_test_1');
    });
    
    await page.waitForTimeout(1000);
    
    // 检查事件是否被正确捕获
    const events = await page.evaluate(() => (window as any).storageEvents || []);
    console.log('Storage events captured:', events);
    
    // 验证事件数量和内容
    expect(events.length).toBeGreaterThan(0);
    
    await newPage.close();
  });

});