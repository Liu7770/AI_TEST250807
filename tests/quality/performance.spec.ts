import { test, expect } from '@playwright/test';

test.describe('Dev Forge 性能测试', () => {

  const baseUrl = 'https://www.001236.xyz/en';

  test('页面加载性能测试', async ({ page }) => {
    // 监控性能指标
    const performanceMetrics: any[] = [];
    
    page.on('response', response => {
      performanceMetrics.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing(),
        size: response.headers()['content-length'] || 0
      });
    });

    const startTime = Date.now();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // 验证页面加载时间在合理范围内（5秒内）
    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);

    // 验证关键元素已加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
    await expect(page.locator('nav p').filter({ hasText: 'Developer Tools' })).toBeVisible();

    // 检查失败的请求
    const failedRequests = performanceMetrics.filter(m => m.status >= 400);
    expect(failedRequests.length).toBe(0);

    // 输出性能统计
    console.log(`Total requests: ${performanceMetrics.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
  });

  test('资源加载优化测试', async ({ page }) => {
    const resources: any[] = [];
    
    page.on('response', response => {
      const contentType = response.headers()['content-type'] || '';
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      
      resources.push({
        url: response.url(),
        type: contentType,
        size: contentLength,
        status: response.status()
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 分析资源类型和大小
    const imageResources = resources.filter(r => r.type.startsWith('image/'));
    const jsResources = resources.filter(r => r.type.includes('javascript'));
    const cssResources = resources.filter(r => r.type.includes('css'));

    // 检查图片资源大小（单个图片不应超过1MB）
    for (const img of imageResources) {
      if (img.size > 1024 * 1024) {
        console.warn(`Large image detected: ${img.url} (${img.size} bytes)`);
      }
    }

    // 检查JS文件大小（单个文件不应超过2MB）
    for (const js of jsResources) {
      if (js.size > 2 * 1024 * 1024) {
        console.warn(`Large JS file detected: ${js.url} (${js.size} bytes)`);
      }
    }

    // 输出资源统计
    console.log(`Images: ${imageResources.length}, JS: ${jsResources.length}, CSS: ${cssResources.length}`);
    
    // 验证页面正常加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
  });

  test('内存使用测试', async ({ page }) => {
    await page.goto(baseUrl);

    // 获取初始内存使用情况
    const initialMetrics = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0
      };
    });

    // 执行一些操作来测试内存使用
    await page.locator('nav').locator('text=JSON Tools').click();
    await page.waitForURL(/\/json$/);
    
    // 输入大量数据
    const largeJson = JSON.stringify({
      data: new Array(1000).fill(0).map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`.repeat(10)
      }))
    });
    
    await page.locator('textarea').fill(largeJson);
    await page.locator('button').filter({ hasText: 'Format' }).click();
    
    // 等待处理完成
    await page.waitForTimeout(2000);

    // 获取处理后的内存使用情况
    const finalMetrics = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0
      };
    });

    // 计算内存增长
    const memoryGrowth = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
    console.log(`Memory growth: ${memoryGrowth} bytes`);
    console.log(`Initial memory: ${initialMetrics.usedJSHeapSize} bytes`);
    console.log(`Final memory: ${finalMetrics.usedJSHeapSize} bytes`);

    // 验证内存使用在合理范围内（增长不超过50MB）
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });

  test('网络性能测试', async ({ page }) => {
    const networkMetrics: any[] = [];
    
    page.on('response', response => {
      const timing = response.timing();
      networkMetrics.push({
        url: response.url(),
        status: response.status(),
        responseTime: timing.responseEnd - timing.responseStart,
        dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
        connectTime: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart // Time to First Byte
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 分析网络性能
    const avgResponseTime = networkMetrics.reduce((sum, m) => sum + m.responseTime, 0) / networkMetrics.length;
    const maxResponseTime = Math.max(...networkMetrics.map(m => m.responseTime));
    const avgTTFB = networkMetrics.reduce((sum, m) => sum + m.ttfb, 0) / networkMetrics.length;

    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Max response time: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`Average TTFB: ${avgTTFB.toFixed(2)}ms`);

    // 验证响应时间在合理范围内
    expect(avgResponseTime).toBeLessThan(2000); // 平均响应时间小于2秒
    expect(maxResponseTime).toBeLessThan(5000); // 最大响应时间小于5秒
    
    // 验证页面正常加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
  });

  test('Core Web Vitals测试', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 获取Core Web Vitals指标
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay) - 需要用户交互
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // 等待一段时间收集指标
        setTimeout(() => {
          resolve(vitals);
        }, 3000);
      });
    });

    console.log('Core Web Vitals:', webVitals);

    // 验证Core Web Vitals在良好范围内
    if ((webVitals as any).lcp) {
      expect((webVitals as any).lcp).toBeLessThan(2500); // LCP < 2.5s
    }
    if ((webVitals as any).fid) {
      expect((webVitals as any).fid).toBeLessThan(100); // FID < 100ms
    }
    if ((webVitals as any).cls) {
      expect((webVitals as any).cls).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test('缓存性能测试', async ({ page }) => {
    const firstLoadMetrics: any[] = [];
    const secondLoadMetrics: any[] = [];

    // 第一次加载
    page.on('response', response => {
      firstLoadMetrics.push({
        url: response.url(),
        status: response.status(),
        fromCache: response.fromServiceWorker() || response.headers()['cf-cache-status'] === 'HIT'
      });
    });

    const firstLoadStart = Date.now();
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const firstLoadTime = Date.now() - firstLoadStart;

    // 清除事件监听器
    page.removeAllListeners('response');

    // 第二次加载（测试缓存）
    page.on('response', response => {
      secondLoadMetrics.push({
        url: response.url(),
        status: response.status(),
        fromCache: response.fromServiceWorker() || response.headers()['cf-cache-status'] === 'HIT'
      });
    });

    const secondLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - secondLoadStart;

    console.log(`First load time: ${firstLoadTime}ms`);
    console.log(`Second load time: ${secondLoadTime}ms`);
    console.log(`Cache improvement: ${((firstLoadTime - secondLoadTime) / firstLoadTime * 100).toFixed(2)}%`);

    // 验证缓存有效（第二次加载应该更快）
    expect(secondLoadTime).toBeLessThanOrEqual(firstLoadTime);
    
    // 验证页面正常加载
    await expect(page.locator('h1.text-2xl').filter({ hasText: 'bbj dev-forge' })).toBeVisible();
  });

});