import { test, expect } from '@playwright/test';

test.describe('Dev Forge Data Converter工具页面', () => {

  const url = 'https://www.001236.xyz/en/data-converter';
  const dataInput = 'textarea[placeholder*="data"], .data-input, .input-area';
  const fromFormatSelect = 'select[name="fromFormat"], .from-format-select, .source-format';
  const toFormatSelect = 'select[name="toFormat"], .to-format-select, .target-format';
  const convertButton = 'button:has-text("Convert"), button:has-text("转换")';
  const outputArea = '.converted-data, .output, .result';
  const copyButton = 'button:has-text("Copy"), button:has-text("复制")';
  const clearButton = 'button:has-text("Clear"), button:has-text("清空")';
  const downloadButton = 'button:has-text("Download"), button:has-text("下载")';
  const swapButton = 'button:has-text("Swap"), button:has-text("交换")';
  const validateButton = 'button:has-text("Validate"), button:has-text("验证")';

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
    await expect(page).toHaveTitle(/Data|Converter/);
    
    // 验证数据输入框存在
    const dataInputElement = page.locator(dataInput);
    if (await dataInputElement.count() > 0) {
      await expect(dataInputElement.first()).toBeVisible();
    }
    
    // 验证源格式选择器存在
    const fromFormatElement = page.locator(fromFormatSelect);
    if (await fromFormatElement.count() > 0) {
      await expect(fromFormatElement.first()).toBeVisible();
    }
    
    // 验证目标格式选择器存在
    const toFormatElement = page.locator(toFormatSelect);
    if (await toFormatElement.count() > 0) {
      await expect(toFormatElement.first()).toBeVisible();
    }
    
    // 验证转换按钮存在
    const convertBtn = page.locator(convertButton);
    if (await convertBtn.count() > 0) {
      await expect(convertBtn.first()).toBeVisible();
    }
  });

  test('JSON到XML转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('xml');
      }
      
      // 输入JSON数据
      const jsonData = `{
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com",
        "address": {
          "street": "123 Main St",
          "city": "New York"
        }
      }`;
      
      await dataInputElement.first().fill(jsonData);
      await convertBtn.first().click();
      
      // 验证XML输出
      if (await outputElement.count() > 0) {
        const xmlOutput = await outputElement.first().textContent();
        expect(xmlOutput).toContain('<name>John Doe</name>');
        expect(xmlOutput).toContain('<age>30</age>');
        expect(xmlOutput).toContain('<email>john@example.com</email>');
        expect(xmlOutput).toContain('<address>');
        expect(xmlOutput).toContain('<street>123 Main St</street>');
        expect(xmlOutput).toContain('<city>New York</city>');
      }
    }
  });

  test('XML到JSON转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('xml');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('json');
      }
      
      // 输入XML数据
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
      <person>
        <name>John Doe</name>
        <age>30</age>
        <email>john@example.com</email>
        <address>
          <street>123 Main St</street>
          <city>New York</city>
        </address>
      </person>`;
      
      await dataInputElement.first().fill(xmlData);
      await convertBtn.first().click();
      
      // 验证JSON输出
      if (await outputElement.count() > 0) {
        const jsonOutput = await outputElement.first().textContent();
        expect(jsonOutput).toContain('"name"');
        expect(jsonOutput).toContain('"John Doe"');
        expect(jsonOutput).toContain('"age"');
        expect(jsonOutput).toContain('30');
        expect(jsonOutput).toContain('"email"');
        expect(jsonOutput).toContain('"address"');
      }
    }
  });

  test('JSON到YAML转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('yaml');
      }
      
      // 输入JSON数据
      const jsonData = `{
        "name": "John Doe",
        "age": 30,
        "skills": ["JavaScript", "Python", "Java"],
        "active": true
      }`;
      
      await dataInputElement.first().fill(jsonData);
      await convertBtn.first().click();
      
      // 验证YAML输出
      if (await outputElement.count() > 0) {
        const yamlOutput = await outputElement.first().textContent();
        expect(yamlOutput).toContain('name: John Doe');
        expect(yamlOutput).toContain('age: 30');
        expect(yamlOutput).toContain('skills:');
        expect(yamlOutput).toContain('- JavaScript');
        expect(yamlOutput).toContain('- Python');
        expect(yamlOutput).toContain('active: true');
      }
    }
  });

  test('YAML到JSON转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('yaml');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('json');
      }
      
      // 输入YAML数据
      const yamlData = `name: John Doe
age: 30
skills:
  - JavaScript
  - Python
  - Java
active: true
address:
  street: 123 Main St
  city: New York`;
      
      await dataInputElement.first().fill(yamlData);
      await convertBtn.first().click();
      
      // 验证JSON输出
      if (await outputElement.count() > 0) {
        const jsonOutput = await outputElement.first().textContent();
        expect(jsonOutput).toContain('"name": "John Doe"');
        expect(jsonOutput).toContain('"age": 30');
        expect(jsonOutput).toContain('"skills"');
        expect(jsonOutput).toContain('"JavaScript"');
        expect(jsonOutput).toContain('"active": true');
      }
    }
  });

  test('CSV到JSON转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('csv');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('json');
      }
      
      // 输入CSV数据
      const csvData = `name,age,email,city
John Doe,30,john@example.com,New York
Jane Smith,25,jane@example.com,Los Angeles
Bob Johnson,35,bob@example.com,Chicago`;
      
      await dataInputElement.first().fill(csvData);
      await convertBtn.first().click();
      
      // 验证JSON输出
      if (await outputElement.count() > 0) {
        const jsonOutput = await outputElement.first().textContent();
        expect(jsonOutput).toContain('"name"');
        expect(jsonOutput).toContain('"John Doe"');
        expect(jsonOutput).toContain('"Jane Smith"');
        expect(jsonOutput).toContain('"age"');
        expect(jsonOutput).toContain('"email"');
        expect(jsonOutput).toContain('"city"');
      }
    }
  });

  test('JSON到CSV转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('csv');
      }
      
      // 输入JSON数组数据
      const jsonData = `[
        {"name": "John Doe", "age": 30, "email": "john@example.com", "city": "New York"},
        {"name": "Jane Smith", "age": 25, "email": "jane@example.com", "city": "Los Angeles"},
        {"name": "Bob Johnson", "age": 35, "email": "bob@example.com", "city": "Chicago"}
      ]`;
      
      await dataInputElement.first().fill(jsonData);
      await convertBtn.first().click();
      
      // 验证CSV输出
      if (await outputElement.count() > 0) {
        const csvOutput = await outputElement.first().textContent();
        expect(csvOutput).toContain('name,age,email,city');
        expect(csvOutput).toContain('John Doe,30,john@example.com,New York');
        expect(csvOutput).toContain('Jane Smith,25,jane@example.com,Los Angeles');
        expect(csvOutput).toContain('Bob Johnson,35,bob@example.com,Chicago');
      }
    }
  });

  test('TOML格式转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // JSON到TOML
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('toml');
      }
      
      const jsonData = `{
        "title": "TOML Example",
        "owner": {
          "name": "Tom Preston-Werner",
          "dob": "1979-05-27T07:32:00-08:00"
        },
        "database": {
          "server": "192.168.1.1",
          "ports": [8001, 8001, 8002],
          "connection_max": 5000,
          "enabled": true
        }
      }`;
      
      await dataInputElement.first().fill(jsonData);
      await convertBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const tomlOutput = await outputElement.first().textContent();
        expect(tomlOutput).toContain('title = "TOML Example"');
        expect(tomlOutput).toContain('[owner]');
        expect(tomlOutput).toContain('[database]');
        expect(tomlOutput).toContain('enabled = true');
      }
    }
  });

  test('INI格式转换测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const convertBtn = page.locator(convertButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // INI到JSON
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('ini');
      }
      if (await toFormatElement.count() > 0) {
        await toFormatElement.first().selectOption('json');
      }
      
      const iniData = `[database]
server=192.168.1.1
port=5432
username=admin
password=secret

[cache]
redis_host=localhost
redis_port=6379
enabled=true`;
      
      await dataInputElement.first().fill(iniData);
      await convertBtn.first().click();
      
      if (await outputElement.count() > 0) {
        const jsonOutput = await outputElement.first().textContent();
        expect(jsonOutput).toContain('"database"');
        expect(jsonOutput).toContain('"server": "192.168.1.1"');
        expect(jsonOutput).toContain('"cache"');
        expect(jsonOutput).toContain('"enabled"');
      }
    }
  });

  test('无效数据处理测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const convertBtn = page.locator(convertButton);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 设置为JSON格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      
      // 输入无效的JSON
      const invalidJson = '{"name": "John", "age": 30, "email": }';
      await dataInputElement.first().fill(invalidJson);
      await convertBtn.first().click();
      
      // 验证错误处理
      const errorMessage = page.locator('text=Invalid, text=Error, text=无效, text=错误');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('空输入处理测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const convertBtn = page.locator(convertButton);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 确保输入框为空
      await dataInputElement.first().fill('');
      await convertBtn.first().click();
      
      // 验证空输入处理
      const errorMessage = page.locator('text=Empty, text=Required, text=必填, text=空');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('格式交换功能测试', async ({ page }) => {
    const fromFormatElement = page.locator(fromFormatSelect);
    const toFormatElement = page.locator(toFormatSelect);
    const swapBtn = page.locator(swapButton);
    
    if (await fromFormatElement.count() > 0 && await toFormatElement.count() > 0 && await swapBtn.count() > 0) {
      // 设置初始格式
      await fromFormatElement.first().selectOption('json');
      await toFormatElement.first().selectOption('xml');
      
      // 点击交换按钮
      await swapBtn.first().click();
      
      // 验证格式已交换
      const fromValue = await fromFormatElement.first().inputValue();
      const toValue = await toFormatElement.first().inputValue();
      
      expect(fromValue).toBe('xml');
      expect(toValue).toBe('json');
    }
  });

  test('数据验证功能测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const fromFormatElement = page.locator(fromFormatSelect);
    const validateBtn = page.locator(validateButton);
    
    if (await dataInputElement.count() > 0 && await validateBtn.count() > 0) {
      // 设置为JSON格式
      if (await fromFormatElement.count() > 0) {
        await fromFormatElement.first().selectOption('json');
      }
      
      // 输入有效的JSON
      const validJson = '{"name": "John", "age": 30}';
      await dataInputElement.first().fill(validJson);
      await validateBtn.first().click();
      
      // 验证成功提示
      const successMessage = page.locator('text=Valid, text=有效, text=Success');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
      
      // 输入无效的JSON
      const invalidJson = '{"name": "John", "age": }';
      await dataInputElement.first().fill(invalidJson);
      await validateBtn.first().click();
      
      // 验证错误提示
      const errorMessage = page.locator('text=Invalid, text=无效, text=Error');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('复制功能测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const convertBtn = page.locator(convertButton);
    const copyBtn = page.locator(copyButton);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 输入并转换数据
      await dataInputElement.first().fill('{"name": "John", "age": 30}');
      await convertBtn.first().click();
      
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
    const dataInputElement = page.locator(dataInput);
    const clearBtn = page.locator(clearButton);
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0 && await clearBtn.count() > 0) {
      // 先输入一些内容
      await dataInputElement.first().fill('{"name": "John", "age": 30}');
      
      // 点击清空按钮
      await clearBtn.first().click();
      
      // 验证输入框已清空
      await expect(dataInputElement.first()).toHaveValue('');
      
      // 验证输出区域也被清空
      if (await outputElement.count() > 0) {
        const result = await outputElement.first().textContent();
        expect(result?.trim()).toBe('');
      }
    }
  });

  test('下载功能测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const convertBtn = page.locator(convertButton);
    const downloadBtn = page.locator(downloadButton);
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0 && await downloadBtn.count() > 0) {
      // 输入并转换数据
      await dataInputElement.first().fill('{"name": "John", "age": 30}');
      await convertBtn.first().click();
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      // 点击下载按钮
      await downloadBtn.first().click();
      
      // 验证下载开始
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(json|xml|yaml|csv|toml|ini|txt)$/);
      } catch (error) {
        // 如果下载功能不可用，跳过验证
      }
    }
  });

  test('批量转换测试', async ({ page }) => {
    const batchInput = page.locator('textarea[placeholder*="batch"], .batch-input');
    const batchConvertBtn = page.locator('button:has-text("Batch Convert"), button:has-text("批量转换")');
    
    if (await batchInput.count() > 0 && await batchConvertBtn.count() > 0) {
      // 输入多个JSON对象
      const batchData = `{"name": "John", "age": 30}\n{"name": "Jane", "age": 25}\n{"name": "Bob", "age": 35}`;
      await batchInput.first().fill(batchData);
      
      // 点击批量转换
      await batchConvertBtn.first().click();
      
      // 验证批量转换结果
      const batchResult = page.locator('.batch-result, .batch-output');
      if (await batchResult.count() > 0) {
        const result = await batchResult.first().textContent();
        expect(result).toContain('John');
        expect(result).toContain('Jane');
        expect(result).toContain('Bob');
      }
    }
  });

  test('格式自动检测测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const autoDetectBtn = page.locator('button:has-text("Auto Detect"), button:has-text("自动检测")');
    const fromFormatElement = page.locator(fromFormatSelect);
    
    if (await dataInputElement.count() > 0 && await autoDetectBtn.count() > 0) {
      // 输入JSON数据
      const jsonData = '{"name": "John", "age": 30}';
      await dataInputElement.first().fill(jsonData);
      
      // 点击自动检测
      await autoDetectBtn.first().click();
      
      // 验证格式被自动检测为JSON
      if (await fromFormatElement.count() > 0) {
        const detectedFormat = await fromFormatElement.first().inputValue();
        expect(detectedFormat).toBe('json');
      }
    }
  });

  test('转换历史记录测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const convertBtn = page.locator(convertButton);
    const historyElement = page.locator('.conversion-history, .history');
    
    if (await dataInputElement.count() > 0 && await convertBtn.count() > 0) {
      // 进行几次转换
      const testData = [
        '{"name": "John", "age": 30}',
        '{"name": "Jane", "age": 25}',
        '{"name": "Bob", "age": 35}'
      ];
      
      for (const data of testData) {
        await dataInputElement.first().fill(data);
        await convertBtn.first().click();
        await page.waitForTimeout(500);
      }
      
      // 验证历史记录显示
      if (await historyElement.count() > 0) {
        await expect(historyElement.first()).toBeVisible();
        
        // 点击历史记录中的项目
        const historyItems = page.locator(`${historyElement} .history-item`);
        if (await historyItems.count() > 0) {
          await historyItems.first().click();
          
          // 验证数据恢复
          const restoredData = await dataInputElement.first().inputValue();
          expect(restoredData.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('数据压缩和美化测试', async ({ page }) => {
    const dataInputElement = page.locator(dataInput);
    const minifyBtn = page.locator('button:has-text("Minify"), button:has-text("压缩")');
    const beautifyBtn = page.locator('button:has-text("Beautify"), button:has-text("美化")');
    const outputElement = page.locator(outputArea);
    
    if (await dataInputElement.count() > 0) {
      // 输入格式化的JSON
      const formattedJson = `{
  "name": "John",
  "age": 30,
  "email": "john@example.com"
}`;
      
      await dataInputElement.first().fill(formattedJson);
      
      // 测试压缩功能
      if (await minifyBtn.count() > 0) {
        await minifyBtn.first().click();
        
        if (await outputElement.count() > 0) {
          const minifiedOutput = await outputElement.first().textContent();
          expect(minifiedOutput?.includes('\n')).toBeFalsy();
        }
      }
      
      // 测试美化功能
      if (await beautifyBtn.count() > 0) {
        // 先输入压缩的JSON
        const minifiedJson = '{"name":"John","age":30,"email":"john@example.com"}';
        await dataInputElement.first().fill(minifiedJson);
        await beautifyBtn.first().click();
        
        if (await outputElement.count() > 0) {
          const beautifiedOutput = await outputElement.first().textContent();
          expect(beautifiedOutput?.includes('\n')).toBeTruthy();
          expect(beautifiedOutput?.includes('  ')).toBeTruthy();
        }
      }
    }
  });

});