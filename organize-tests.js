const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// 模块URL映射
const moduleUrls = {
  'base-converter.spec.ts': 'https://www.001236.xyz/en/base',
  'color-converter.spec.ts': 'https://www.001236.xyz/en/color',
  'data-converter.spec.ts': 'https://www.001236.xyz/en/convert',
  'jwt-decoder.spec.ts': 'https://www.001236.xyz/en/jwt',
  'url-tool.spec.ts': 'https://www.001236.xyz/en/url',
  'password-generator.spec.ts': 'https://www.001236.xyz/en/password',
  'code-beautifier.spec.ts': 'https://www.001236.xyz/en/beautifier',
  'sql-formatter.spec.ts': 'https://www.001236.xyz/en/sql',
  'image-to-base64.spec.ts': 'https://www.001236.xyz/en/image2base64',
  'http-status-lookup.spec.ts': 'https://www.001236.xyz/en/http-status',
  'user-agent-parser.spec.ts': 'https://www.001236.xyz/en/user-agent',
  'timestamp-tool.spec.ts': 'https://www.001236.xyz/en/timestamp',
  'dashboard.spec.ts': 'https://www.001236.xyz/en',
  'uuid-generator.spec.ts': 'https://www.001236.xyz/en/uuid',
  'hash-calculator.spec.ts': 'https://www.001236.xyz/en/hash',
  'crontab-tool.spec.ts': 'https://www.001236.xyz/en/crontab',
  'dev-forge-tools.spec.ts': 'https://www.001236.xyz/en',
  'base64-tool.spec.ts': 'https://www.001236.xyz/en/base64',
  'json-tool.spec.ts': 'https://www.001236.xyz/en/json',
  'dns-resolver.spec.ts': 'https://www.001236.xyz/en/dns'
};

// 已实现的模块列表（根据用户指正）
const implementedModules = [
  'dashboard.spec.ts',
  'json-tool.spec.ts', 
  'base64-tool.spec.ts'
];

// 检查模块是否已实现（基于用户提供的列表）
function isModuleImplemented(filename) {
  return implementedModules.includes(filename);
}

// 移动文件
function moveFile(from, to) {
  try {
    if (fs.existsSync(from)) {
      // 确保目标目录存在
      const targetDir = path.dirname(to);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.renameSync(from, to);
      console.log(`已移动: ${from} -> ${to}`);
      return true;
    } else {
      console.log(`文件不存在: ${from}`);
      return false;
    }
  } catch (error) {
    console.log(`移动文件失败: ${from} -> ${to}`, error.message);
    return false;
  }
}

// 主函数
function organizeTests() {
  console.log('开始组织测试文件...');
  
  const existingModulesDir = 'tests/functional/implemented-modules';
  const implementedDir = 'tests/functional/implemented-modules';
  const unimplementedDir = 'tests/functional/unimplemented-modules';
  
  const implementedFiles = [];
  const unimplementedFiles = [];
  
  // 检查每个模块
  for (const [filename, url] of Object.entries(moduleUrls)) {
    const filePath = path.join(existingModulesDir, filename);
    
    if (fs.existsSync(filePath)) {
      console.log(`检查模块: ${filename}`);
      const implemented = isModuleImplemented(filename);
      
      if (implemented) {
        console.log(`✅ ${filename} - 已实现`);
        implementedFiles.push(filename);
      } else {
        console.log(`❌ ${filename} - 未实现`);
        unimplementedFiles.push(filename);
      }
    }
  }
  
  console.log('\n开始移动文件...');
  
  // 移动已实现的模块
  for (const filename of implementedFiles) {
    const from = path.join(existingModulesDir, filename);
    const to = path.join(implementedDir, filename);
    moveFile(from, to);
  }
  
  // 移动未实现的模块
  for (const filename of unimplementedFiles) {
    const from = path.join(existingModulesDir, filename);
    const to = path.join(unimplementedDir, filename);
    moveFile(from, to);
  }
  
  // 移动module-checker.ts到implemented-modules目录
  const moduleCheckerFrom = path.join(existingModulesDir, 'module-checker.ts');
  const moduleCheckerTo = path.join(implementedDir, 'module-checker.ts');
  moveFile(moduleCheckerFrom, moduleCheckerTo);
  
  console.log('\n组织完成!');
  console.log(`已实现的模块 (${implementedFiles.length}个):`, implementedFiles);
  console.log(`未实现的模块 (${unimplementedFiles.length}个):`, unimplementedFiles);
}

// 运行脚本
organizeTests();