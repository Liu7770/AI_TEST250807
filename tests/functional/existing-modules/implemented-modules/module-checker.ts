import { chromium } from '@playwright/test';

/**
 * 检查指定URL的模块是否已实现
 * @param url 要检查的模块URL
 * @returns Promise<boolean> 如果模块已实现返回true，否则返回false
 */
export async function isModuleImplemented(url: string): Promise<boolean> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    
    const comingSoonElement = page.locator('text="Tool implementation coming soon"');
    const isComingSoon = await comingSoonElement.isVisible({ timeout: 3000 });
    
    await browser.close();
    return !isComingSoon;
  } catch (error) {
    await browser.close();
    return true; // 如果检查失败，假设模块已实现
  }
}