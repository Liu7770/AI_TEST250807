# Dev Forge 网站测试运行脚本
# PowerShell 脚本用于运行不同类型的测试

param(
    [string]$TestType = "all",
    [string]$Browser = "all",
    [switch]$Headed = $false,
    [switch]$Debug = $false,
    [switch]$Report = $false
)

Write-Host "=== Dev Forge 网站自动化测试 ===" -ForegroundColor Green
Write-Host "测试类型: $TestType" -ForegroundColor Yellow
Write-Host "浏览器: $Browser" -ForegroundColor Yellow
Write-Host ""

# 构建基础命令
$baseCmd = "npx playwright test"

# 根据测试类型选择测试文件
switch ($TestType.ToLower()) {
    "json" {
        $testFile = "tests/json-tool.spec.ts"
        Write-Host "运行 JSON 工具测试..." -ForegroundColor Cyan
    }
    "base64" {
        $testFile = "tests/base64-tool.spec.ts"
        Write-Host "运行 Base64 工具测试..." -ForegroundColor Cyan
    }
    "navigation" {
        $testFile = "tests/dev-forge-tools.spec.ts"
        Write-Host "运行网站导航和功能测试..." -ForegroundColor Cyan
    }
    "accessibility" {
        $testFile = "tests/accessibility-ux.spec.ts"
        Write-Host "运行可访问性和用户体验测试..." -ForegroundColor Cyan
    }
    "tools" {
        $testFile = "tests/json-tool.spec.ts tests/base64-tool.spec.ts"
        Write-Host "运行所有工具测试..." -ForegroundColor Cyan
    }
    "all" {
        $testFile = ""
        Write-Host "运行所有测试..." -ForegroundColor Cyan
    }
    default {
        Write-Host "未知的测试类型: $TestType" -ForegroundColor Red
        Write-Host "可用的测试类型: json, base64, navigation, accessibility, tools, all" -ForegroundColor Yellow
        exit 1
    }
}

# 构建完整命令
$cmd = $baseCmd
if ($testFile -ne "") {
    $cmd += " $testFile"
}

# 添加浏览器选项
if ($Browser.ToLower() -ne "all") {
    switch ($Browser.ToLower()) {
        "chrome" { $cmd += " --project=chromium" }
        "firefox" { $cmd += " --project=firefox" }
        "safari" { $cmd += " --project=webkit" }
        default {
            Write-Host "未知的浏览器: $Browser" -ForegroundColor Red
            Write-Host "可用的浏览器: chrome, firefox, safari, all" -ForegroundColor Yellow
            exit 1
        }
    }
}

# 添加其他选项
if ($Headed) {
    $cmd += " --headed"
}

if ($Debug) {
    $cmd += " --debug"
}

if ($Report) {
    $cmd += " --reporter=html"
}

Write-Host "执行命令: $cmd" -ForegroundColor Gray
Write-Host ""

# 执行测试
try {
    Invoke-Expression $cmd
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ 测试执行完成!" -ForegroundColor Green
        
        if ($Report) {
            Write-Host "📊 HTML 报告已生成，请查看浏览器中的报告" -ForegroundColor Cyan
        }
    } else {
        Write-Host ""
        Write-Host "❌ 测试执行失败，退出代码: $exitCode" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 执行测试时发生错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Green