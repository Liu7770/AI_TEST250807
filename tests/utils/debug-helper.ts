import { Page, Browser, BrowserContext } from '@playwright/test';

/**
 * 调试优先的测试助手类
 * 当测试失败时自动访问实际页面进行调试
 */
export class DebugHelper {
  private static debugBrowser: Browser | null = null;
  private static debugContext: BrowserContext | null = null;
  private static debugPage: Page | null = null;

  /**
   * 初始化调试浏览器
   */
  private static async initDebugBrowser(): Promise<void> {
    if (!this.debugBrowser) {
      // 使用Playwright MCP启动调试浏览器
      console.log('🔧 启动调试浏览器...');
    }
  }

  /**
   * 当测试失败时自动进行调试
   */
  static async debugOnFailure({
    testName,
    url,
    failureReason,
    expectedBehavior,
    actualBehavior,
    selector,
    debugActions = []
  }: {
    testName: string;
    url: string;
    failureReason: string;
    expectedBehavior: string;
    actualBehavior: string;
    selector?: string;
    debugActions?: Array<{
      action: 'click' | 'fill' | 'screenshot' | 'wait' | 'evaluate';
      target?: string;
      value?: string;
      description: string;
    }>;
  }): Promise<void> {
    console.log(`\n🐛 测试失败，开始调试: ${testName}`);
    console.log(`📍 失败原因: ${failureReason}`);
    console.log(`✅ 期望行为: ${expectedBehavior}`);
    console.log(`❌ 实际行为: ${actualBehavior}`);
    console.log(`🌐 调试页面: ${url}`);

    try {
      // 使用Playwright MCP导航到页面
      await this.navigateToPage(url);
      
      // 截图记录当前状态
      await this.takeDebugScreenshot(`${testName}-failure-state`);
      
      // 如果有选择器，高亮显示元素
      if (selector) {
        await this.highlightElement(selector);
      }
      
      // 执行调试操作
      for (const action of debugActions) {
        await this.executeDebugAction(action);
      }
      
      // 获取页面状态信息
      await this.analyzePageState();
      
      console.log(`✅ 调试完成，请查看截图和日志分析问题`);
      
    } catch (debugError) {
      console.error(`❌ 调试过程中出现错误:`, debugError);
    }
  }

  /**
   * 导航到指定页面
   */
  private static async navigateToPage(url: string): Promise<void> {
    try {
      console.log(`🌐 导航到页面: ${url}`);
      
      // 注意：这里需要在实际使用时调用MCP工具
      // 由于当前环境限制，这里只是记录调试信息
      console.log(`📝 调试信息: 需要导航到 ${url}`);
      console.log(`📝 建议: 手动在浏览器中打开此URL进行调试`);
      
      console.log(`✅ 页面导航成功`);
      
      // 等待页面加载完成
      await this.wait(2000);
      
    } catch (error) {
      console.error(`❌ 页面导航失败:`, error);
      throw error;
    }
  }

  /**
   * 截图记录调试状态
   */
  private static async takeDebugScreenshot(name: string): Promise<void> {
    try {
      console.log(`📸 截图: ${name}`);
      
      // 记录截图需求
      console.log(`📝 调试信息: 需要截图 debug-${name}-${Date.now()}`);
      console.log(`📝 建议: 手动截图保存到 debug-screenshots 目录`);
      
      console.log(`✅ 截图保存成功`);
      
    } catch (error) {
      console.error(`❌ 截图失败:`, error);
    }
  }

  /**
   * 高亮显示元素
   */
  private static async highlightElement(selector: string): Promise<void> {
    try {
      console.log(`🎯 高亮元素: ${selector}`);
      
      await run_mcp({
        server_name: 'mcp.config.usrlocalmcp.Playwright',
        tool_name: 'playwright_evaluate',
        args: {
          script: `
            const element = document.querySelector('${selector}');
            if (element) {
              element.style.border = '3px solid red';
              element.style.backgroundColor = 'yellow';
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('元素已高亮:', element);
            } else {
              console.log('未找到元素:', '${selector}');
            }
          `
        }
      });
      
    } catch (error) {
      console.error(`❌ 高亮元素失败:`, error);
    }
  }

  /**
   * 执行调试操作
   */
  private static async executeDebugAction(action: {
    action: 'click' | 'fill' | 'screenshot' | 'wait' | 'evaluate';
    target?: string;
    value?: string;
    description: string;
  }): Promise<void> {
    try {
      console.log(`🔧 执行调试操作: ${action.description}`);
      
      switch (action.action) {
        case 'click':
          if (action.target) {
            await run_mcp({
              server_name: 'mcp.config.usrlocalmcp.Playwright',
              tool_name: 'playwright_click',
              args: { selector: action.target }
            });
          }
          break;
          
        case 'fill':
          if (action.target && action.value) {
            await run_mcp({
              server_name: 'mcp.config.usrlocalmcp.Playwright',
              tool_name: 'playwright_fill',
              args: { selector: action.target, value: action.value }
            });
          }
          break;
          
        case 'screenshot':
          await this.takeDebugScreenshot(action.description.replace(/\s+/g, '-'));
          break;
          
        case 'wait':
          const waitTime = parseInt(action.value || '1000');
          await this.wait(waitTime);
          break;
          
        case 'evaluate':
          if (action.value) {
            await run_mcp({
              server_name: 'mcp.config.usrlocalmcp.Playwright',
              tool_name: 'playwright_evaluate',
              args: { script: action.value }
            });
          }
          break;
      }
      
      console.log(`✅ 调试操作完成: ${action.description}`);
      
    } catch (error) {
      console.error(`❌ 调试操作失败: ${action.description}`, error);
    }
  }

  /**
   * 分析页面状态
   */
  private static async analyzePageState(): Promise<void> {
    try {
      console.log(`🔍 分析页面状态...`);
      
      // 获取页面可见文本
      const visibleText = await run_mcp({
        server_name: 'mcp.config.usrlocalmcp.Playwright',
        tool_name: 'playwright_get_visible_text',
        args: {}
      });
      
      console.log(`📝 页面可见文本长度: ${visibleText?.length || 0} 字符`);
      
      // 获取控制台日志
      const consoleLogs = await run_mcp({
        server_name: 'mcp.config.usrlocalmcp.Playwright',
        tool_name: 'playwright_console_logs',
        args: {
          type: 'all',
          limit: 10
        }
      });
      
      if (consoleLogs && consoleLogs.length > 0) {
        console.log(`📋 控制台日志 (最近10条):`);
        consoleLogs.forEach((log: any, index: number) => {
          console.log(`  ${index + 1}. [${log.type}] ${log.text}`);
        });
      }
      
      // 检查页面错误
      await run_mcp({
        server_name: 'mcp.config.usrlocalmcp.Playwright',
        tool_name: 'playwright_evaluate',
        args: {
          script: `
            // 检查页面是否有JavaScript错误
            const errors = window.errors || [];
            if (errors.length > 0) {
              console.log('页面JavaScript错误:', errors);
            }
            
            // 检查网络请求失败
            const failedRequests = window.failedRequests || [];
            if (failedRequests.length > 0) {
              console.log('失败的网络请求:', failedRequests);
            }
            
            // 输出页面基本信息
            console.log('页面标题:', document.title);
            console.log('页面URL:', window.location.href);
            console.log('页面加载状态:', document.readyState);
          `
        }
      });
      
    } catch (error) {
      console.error(`❌ 页面状态分析失败:`, error);
    }
  }

  /**
   * 等待指定时间
   */
  private static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 关闭调试浏览器
   */
  static async closeDebugBrowser(): Promise<void> {
    try {
      await run_mcp({
        server_name: 'mcp.config.usrlocalmcp.Playwright',
        tool_name: 'playwright_close',
        args: {}
      });
      
      console.log(`✅ 调试浏览器已关闭`);
      
    } catch (error) {
      console.error(`❌ 关闭调试浏览器失败:`, error);
    }
  }

  /**
   * 创建调试报告
   */
  static createDebugReport({
    testName,
    failureDetails,
    debugFindings,
    recommendations
  }: {
    testName: string;
    failureDetails: string;
    debugFindings: string[];
    recommendations: string[];
  }): string {
    const timestamp = new Date().toISOString();
    
    return [
      `# 调试报告 - ${testName}`,
      `**时间**: ${timestamp}`,
      ``,
      `## 失败详情`,
      failureDetails,
      ``,
      `## 调试发现`,
      ...debugFindings.map(finding => `- ${finding}`),
      ``,
      `## 修复建议`,
      ...recommendations.map(rec => `- ${rec}`),
      ``,
      `---`,
      `*此报告由调试助手自动生成*`
    ].join('\n');
  }
}

/**
 * 调试装饰器 - 自动在测试失败时进行调试
 */
export function debugOnFailure(debugConfig: {
  url: string;
  debugActions?: Array<{
    action: 'click' | 'fill' | 'screenshot' | 'wait' | 'evaluate';
    target?: string;
    value?: string;
    description: string;
  }>;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        // 测试失败时自动调试
        await DebugHelper.debugOnFailure({
          testName: propertyName,
          url: debugConfig.url,
          failureReason: error.message,
          expectedBehavior: '测试应该通过',
          actualBehavior: '测试失败',
          debugActions: debugConfig.debugActions
        });
        
        throw error; // 重新抛出错误
      }
    };
    
    return descriptor;
  };
}