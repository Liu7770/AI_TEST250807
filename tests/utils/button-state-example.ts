/**
 * 按钮状态检查使用示例
 * 展示如何使用test-helpers-v2.ts中的新按钮状态检查方法
 */

import { test, expect } from '@playwright/test';
import { Validators } from './test-helpers-v2';

// 示例1: 基本按钮状态检查
test('示例: 基本按钮状态检查', async ({ page }) => {
  await page.goto('https://example.com');
  
  // 检查按钮是否被禁用
  await Validators.buttonState({
    page,
    buttonSelector: '#submit-button',
    buttonText: '提交',
    expectedDisabled: true,
    testName: '空表单提交按钮状态检查'
  });
});

// 示例2: 带配置的按钮状态检查
test('示例: 带配置的按钮状态检查', async ({ page }) => {
  await page.goto('https://example.com');
  
  // 检查按钮是否被启用，带重试配置
  await Validators.buttonState({
    page,
    buttonSelector: '.action-button',
    buttonText: '操作',
    expectedDisabled: false,
    testName: '有效输入后操作按钮状态检查',
    config: {
      retryCount: 3,
      timeout: 10000
    }
  });
});

// 示例3: 在实际测试场景中的使用
test('示例: 表单验证场景', async ({ page }) => {
  await page.goto('https://example.com/form');
  
  // 1. 清空所有输入字段
  await page.fill('#username', '');
  await page.fill('#password', '');
  
  // 2. 验证提交按钮被禁用
  await Validators.buttonState({
    page,
    buttonSelector: '#login-button',
    buttonText: '登录',
    expectedDisabled: true,
    testName: '空用户名和密码时登录按钮状态检查',
    config: {
      retryCount: 2,
      timeout: 5000
    }
  });
  
  // 3. 填写用户名但不填写密码
  await page.fill('#username', 'testuser');
  
  // 4. 验证提交按钮仍然被禁用
  await Validators.buttonState({
    page,
    buttonSelector: '#login-button',
    buttonText: '登录',
    expectedDisabled: true,
    testName: '仅有用户名时登录按钮状态检查'
  });
  
  // 5. 填写密码
  await page.fill('#password', 'password123');
  
  // 6. 验证提交按钮被启用
  await Validators.buttonState({
    page,
    buttonSelector: '#login-button',
    buttonText: '登录',
    expectedDisabled: false,
    testName: '完整表单填写后登录按钮状态检查'
  });
});

/**
 * 错误信息格式说明:
 * 
 * 当测试失败时，会显示如下格式的详细错误信息：
 * 
 * 🐛 [测试名称]失败！
 * ❌ [按钮文本]按钮状态检查未通过
 * 实际按钮状态: [启用/禁用]
 * 期望按钮状态: [启用/禁用]
 * 🔧 建议: 空输入时[按钮文本]按钮应该处于禁用状态，防止用户进行无效操作
 * 
 * 例如：
 * 🐛 空输入时清空按钮状态检查失败！
 * ❌ 清空按钮状态检查未通过
 * 实际按钮状态: 启用
 * 期望按钮状态: 禁用
 * 🔧 建议: 空输入时清空按钮应该处于禁用状态，防止用户进行无效操作
 */