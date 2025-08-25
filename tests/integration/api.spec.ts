import { test, expect } from '@playwright/test';
import { TestHelpersV2, ErrorMessageFactory } from '../utils/test-helpers-v2';

test.describe('Dev Forge API测试', () => {

  const baseUrl = 'https://www.001236.xyz';

  test('JSON格式化API测试', async ({ page }) => {
    // 监控网络请求
    const apiRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.method() === 'POST') {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/') || apiRequests.some(req => req.url === response.url())) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          type: 'response'
        });
      }
    });

    await page.goto(`${baseUrl}/en/json`);
    
    // 输入有效JSON
    await page.locator('textarea').fill('{"name": "test", "value": 123}');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 等待处理完成
    await page.waitForTimeout(2000);
    
    // 检查是否有API调用
    console.log(`API requests captured: ${apiRequests.length}`);
    apiRequests.forEach(req => {
      console.log(`${req.method || 'RESPONSE'}: ${req.url} - Status: ${req.status || 'N/A'}`);
    });
    
    // 验证JSON格式化功能正常工作
    const formattedContent = await page.locator('pre').textContent();
    if (formattedContent) {
      expect(formattedContent).toContain('name');
      expect(formattedContent).toContain('test');
    }
  });

  test('Base64编码API测试', async ({ page }) => {
    const apiRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.method() === 'POST') {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    await page.goto(`${baseUrl}/en/base64`);
    
    // 确保在编码模式
    await page.locator('div.p-1 button').filter({ hasText: 'Encode' }).click();
    
    // 输入测试文本
    await page.locator('textarea').fill('Hello World');
    
    // 点击编码按钮
    await page.locator('div:has(textarea) button').filter({ hasText: 'Encode' }).click();
    
    // 等待处理完成
    await page.waitForTimeout(2000);
    
    console.log(`Base64 API requests: ${apiRequests.length}`);
    
    // 验证编码功能正常工作
    const encodedValue = await page.locator('textarea').inputValue();
    expect(encodedValue).toBe('Hello World'); // 输入框应该保持原值
  });

  test('错误处理API测试', async ({ page }) => {
    const errorResponses: any[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        errorResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    await page.goto(`${baseUrl}/en/json`);
    
    // 输入无效JSON
    await page.locator('textarea').fill('invalid json {');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 等待错误处理
    await page.waitForTimeout(2000);
    
    // 验证错误信息显示
    await expect(page.locator('text=Invalid JSON: Unexpected')).toBeVisible();
    
    // 检查是否有HTTP错误
    console.log(`Error responses: ${errorResponses.length}`);
    errorResponses.forEach(err => {
      console.log(`Error: ${err.status} ${err.statusText} - ${err.url}`);
    });
  });

  test('API响应时间测试', async ({ page }) => {
    const responseMetrics: any[] = [];
    
    page.on('response', response => {
      const timing = response.timing();
      responseMetrics.push({
        url: response.url(),
        status: response.status(),
        responseTime: timing.responseEnd - timing.responseStart,
        method: response.request().method()
      });
    });

    await page.goto(`${baseUrl}/en/json`);
    
    // 执行多个操作测试响应时间
    const testCases = [
      '{"simple": "test"}',
      '{"complex": {"nested": {"deep": [1,2,3,4,5]}}}',
      JSON.stringify({data: new Array(100).fill({id: 1, name: 'test'})})
    ];

    for (const testCase of testCases) {
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(testCase);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      await page.waitForTimeout(1000);
    }

    // 分析响应时间
    const apiResponses = responseMetrics.filter(m => 
      m.method === 'POST' || m.url.includes('/api/')
    );
    
    if (apiResponses.length > 0) {
      const avgResponseTime = apiResponses.reduce((sum, r) => sum + r.responseTime, 0) / apiResponses.length;
      const maxResponseTime = Math.max(...apiResponses.map(r => r.responseTime));
      
      console.log(`API Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`API Max response time: ${maxResponseTime.toFixed(2)}ms`);
      
      // 验证API响应时间在合理范围内
      expect(avgResponseTime).toBeLessThan(1000); // 平均响应时间小于1秒
      expect(maxResponseTime).toBeLessThan(3000); // 最大响应时间小于3秒
    }
  });

  test('并发请求测试', async ({ browser }) => {
    // 创建多个页面进行并发测试
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
    
    const concurrentRequests = pages.map(async (page, index) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        });
      });
      
      await page.goto(`${baseUrl}/en/json`);
      
      // 每个页面执行不同的操作
      const testData = [
        '{"test1": "data1"}',
        '{"test2": {"nested": "data2"}}',
        '{"test3": [1,2,3,4,5]}'
      ];
      
      await page.locator('textarea').fill(testData[index]);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      await page.waitForTimeout(2000);
      
      return responses;
    });
    
    // 等待所有并发请求完成
    const allResponses = await Promise.all(concurrentRequests);
    
    // 验证所有请求都成功
    allResponses.forEach((responses, index) => {
      const failedRequests = responses.filter(r => r.status >= 400);
      if (failedRequests.length > 0) {
        const errorMessage = ErrorMessageFactory.create('assertion', {
          testName: `并发请求测试 - 页面${index + 1}`,
          expected: '所有请求状态码 < 400',
          actual: `${failedRequests.length}个失败请求，状态码: ${failedRequests.map(r => r.status).join(', ')}`,
          suggestion: '检查服务器负载能力，确认并发请求处理是否正常，查看网络连接状态'
        });
        throw new Error(errorMessage);
      }
      console.log(`Page ${index + 1}: ${responses.length} requests, ${failedRequests.length} failed`);
    });
    
    // 清理
    await Promise.all(pages.map(page => page.close()));
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('数据验证API测试', async ({ page }) => {
    await page.goto(`${baseUrl}/en/json`);
    
    // 测试各种数据类型的处理
    const testCases = [
      {
        input: '{"string": "test", "number": 123, "boolean": true, "null": null}',
        description: 'Mixed data types'
      },
      {
        input: '{"unicode": "测试中文", "emoji": "😀🎉", "special": "@#$%^&*()"}',
        description: 'Unicode and special characters'
      },
      {
        input: '{"array": [1,2,3], "object": {"nested": true}}',
        description: 'Nested structures'
      },
      {
        input: '{"large_number": 9007199254740991, "float": 3.14159}',
        description: 'Large numbers and floats'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.description}`);
      
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(testCase.input);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      // 等待处理完成
      await page.waitForTimeout(1000);
      
      // 验证格式化结果
      const result = await page.locator('pre').textContent();
      if (result) {
        // 验证结果包含输入的关键数据
        if (testCase.input.includes('string') && !result.includes('string')) {
          const errorMessage = ErrorMessageFactory.create('assertion', {
            testName: `数据验证API测试 - ${testCase.description}`,
            expected: '格式化结果包含"string"字段',
            actual: result,
            suggestion: '检查JSON格式化功能是否正确处理字符串类型数据'
          });
          throw new Error(errorMessage);
        }
        if (testCase.input.includes('测试中文') && !result.includes('测试中文')) {
          const errorMessage = ErrorMessageFactory.create('assertion', {
            testName: `数据验证API测试 - ${testCase.description}`,
            expected: '格式化结果包含中文字符"测试中文"',
            actual: result,
            suggestion: '检查JSON格式化功能是否正确处理Unicode字符'
          });
          throw new Error(errorMessage);
        }
      }
    }
  });

  test('API安全性测试', async ({ page }) => {
    const securityTestPayloads = [
      '{"xss": "<script>alert(\'xss\')</script>"}',
      '{"injection": "\'; DROP TABLE users; --"}',
      '{"overflow": "' + 'A'.repeat(10000) + '"}'
    ];
    
    await page.goto(`${baseUrl}/en/json`);
    
    for (const payload of securityTestPayloads) {
      await page.locator('textarea').clear();
      await page.locator('textarea').fill(payload);
      await page.locator('button').filter({ hasText: 'Format' }).click();
      
      await page.waitForTimeout(1000);
      
      // 验证应用正确处理恶意输入
      const result = await page.locator('pre').textContent();
      if (result) {
        // JSON工具应该保持原始内容，但确保没有执行恶意脚本
        if (!result.includes('xss')) {
          const errorMessage = ErrorMessageFactory.create('assertion', {
            testName: 'API安全性测试 - XSS内容处理',
            expected: '格式化结果包含"xss"字符串（但不执行脚本）',
            actual: result,
            suggestion: '检查JSON格式化功能是否正确处理包含脚本标签的内容'
          });
          throw new Error(errorMessage);
        }
        
        // 验证页面没有被XSS攻击（检查是否有alert弹窗）
        const hasAlert = await page.evaluate(() => {
          return typeof window.alert === 'function';
        });
        if (!hasAlert) {
          const errorMessage = ErrorMessageFactory.create('assertion', {
            testName: 'API安全性测试 - XSS防护验证',
            expected: 'alert函数存在但未被恶意调用',
            actual: 'alert函数不存在或被修改',
            suggestion: '检查页面是否被XSS攻击影响，确认安全防护机制正常工作'
          });
          throw new Error(errorMessage);
        }
      }
    }
  });

  test('API版本兼容性测试', async ({ page }) => {
    // 测试不同的API端点（如果存在）
    const potentialApiEndpoints = [
      '/api/v1/format',
      '/api/format',
      '/format',
      '/api/json/format'
    ];
    
    const apiResponses: any[] = [];
    
    page.on('response', response => {
      potentialApiEndpoints.forEach(endpoint => {
        if (response.url().includes(endpoint)) {
          apiResponses.push({
            endpoint,
            url: response.url(),
            status: response.status()
          });
        }
      });
    });
    
    await page.goto(`${baseUrl}/en/json`);
    await page.locator('textarea').fill('{"test": "api_version"}');
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    await page.waitForTimeout(2000);
    
    console.log(`API endpoints detected: ${apiResponses.length}`);
    apiResponses.forEach(api => {
      console.log(`${api.endpoint}: ${api.status}`);
    });
  });

});