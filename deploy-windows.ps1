# =============================================================================
# Playwright 测试项目 Windows 部署脚本
# 适用于 Windows 10/11 系统
# =============================================================================

param(
    [string]$ProjectPath = "$env:USERPROFILE\playwright-tests",
    [string]$GitRepo = "",
    [switch]$SkipNodeInstall,
    [switch]$SkipGitClone,
    [switch]$SetupScheduledTask,
    [switch]$SetupIIS
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色定义
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    switch ($Color) {
        "Red" { Write-Host $Message -ForegroundColor Red }
        "Green" { Write-Host $Message -ForegroundColor Green }
        "Yellow" { Write-Host $Message -ForegroundColor Yellow }
        "Blue" { Write-Host $Message -ForegroundColor Blue }
        "Cyan" { Write-Host $Message -ForegroundColor Cyan }
        default { Write-Host $Message }
    }
}

function Log-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Blue"
}

function Log-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Log-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Log-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# 检查管理员权限
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 检查并安装 Chocolatey
function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Log-Info "安装 Chocolatey 包管理器..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Log-Success "Chocolatey 安装完成"
    } else {
        Log-Info "Chocolatey 已安装"
    }
}

# 检查并安装 Git
function Install-Git {
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Log-Info "安装 Git..."
        choco install git -y
        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Log-Success "Git 安装完成"
    } else {
        Log-Info "Git 已安装: $(git --version)"
    }
}

# 检查并安装 Node.js
function Install-NodeJS {
    if ($SkipNodeInstall) {
        Log-Info "跳过 Node.js 安装"
        return
    }
    
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version
        Log-Info "Node.js 已安装: $nodeVersion"
        
        # 检查版本是否满足要求 (>= 16)
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -ge 16) {
            Log-Success "Node.js 版本满足要求"
            return
        } else {
            Log-Warning "Node.js 版本过低，需要升级"
        }
    }
    
    Log-Info "安装 Node.js..."
    choco install nodejs -y
    
    # 刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    # 验证安装
    node --version
    npm --version
    
    Log-Success "Node.js 安装完成"
}

# 设置项目
function Setup-Project {
    if ($SkipGitClone) {
        Log-Info "跳过 Git 克隆，使用现有项目目录"
        if (!(Test-Path $ProjectPath)) {
            Log-Error "项目目录不存在: $ProjectPath"
            exit 1
        }
        return
    }
    
    Log-Info "设置项目..."
    
    if (Test-Path $ProjectPath) {
        Log-Info "项目目录已存在，更新代码..."
        Set-Location $ProjectPath
        try {
            git pull origin main
        } catch {
            try {
                git pull origin master
            } catch {
                Log-Warning "无法更新代码，请检查 Git 仓库状态"
            }
        }
    } else {
        if ([string]::IsNullOrEmpty($GitRepo)) {
            $GitRepo = Read-Host "请输入 Git 仓库地址"
        }
        
        Log-Info "克隆项目代码..."
        git clone $GitRepo $ProjectPath
        Set-Location $ProjectPath
    }
    
    Log-Success "项目设置完成"
}

# 安装项目依赖
function Install-ProjectDependencies {
    Log-Info "安装项目依赖..."
    
    Set-Location $ProjectPath
    
    # 安装 npm 依赖
    npm install
    
    # 安装 Playwright 浏览器
    npx playwright install
    
    # 安装 Playwright 系统依赖（Windows）
    npx playwright install-deps
    
    Log-Success "项目依赖安装完成"
}

# 配置 Playwright
function Configure-Playwright {
    Log-Info "配置 Playwright..."
    
    Set-Location $ProjectPath
    
    # 创建生产环境配置
    $playwrightConfig = @'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 5000
  },
});
'@
    
    $playwrightConfig | Out-File -FilePath "playwright.config.production.ts" -Encoding UTF8
    
    Log-Success "Playwright 配置完成"
}

# 创建测试运行脚本
function Create-TestScripts {
    Log-Info "创建测试运行脚本..."
    
    Set-Location $ProjectPath
    
    # 创建 PowerShell 测试脚本
    $testScript = @'
# Playwright 测试运行脚本
param(
    [string]$TestPattern = "",
    [string]$Browser = "chromium",
    [switch]$Headed,
    [switch]$Debug,
    [switch]$UpdateSnapshots
)

$ErrorActionPreference = "Stop"

Write-Host "开始运行 Playwright 测试..." -ForegroundColor Green

# 构建测试命令
$testCommand = "npx playwright test --config=playwright.config.production.ts"

if ($TestPattern) {
    $testCommand += " $TestPattern"
}

if ($Browser -ne "all") {
    $testCommand += " --project=$Browser"
}

if ($Headed) {
    $testCommand += " --headed"
}

if ($Debug) {
    $testCommand += " --debug"
}

if ($UpdateSnapshots) {
    $testCommand += " --update-snapshots"
}

Write-Host "执行命令: $testCommand" -ForegroundColor Yellow

# 运行测试
Invoke-Expression $testCommand
$exitCode = $LASTEXITCODE

# 生成测试报告
if (Test-Path "playwright-report\index.html") {
    Write-Host "测试报告已生成: $(Get-Location)\playwright-report\index.html" -ForegroundColor Green
}

exit $exitCode
'@
    
    $testScript | Out-File -FilePath "run-tests-production.ps1" -Encoding UTF8
    
    # 创建 CI 脚本
    $ciScript = @'
# CI/CD 测试脚本
$ErrorActionPreference = "Stop"

# 设置 CI 环境变量
$env:CI = "true"

Write-Host "开始 CI 测试..." -ForegroundColor Green

# 运行测试
.\run-tests-production.ps1

# 检查测试结果
if (Test-Path "test-results.json") {
    Write-Host "测试结果文件已生成" -ForegroundColor Green
    # 这里可以添加结果解析逻辑
}

Write-Host "CI 测试完成" -ForegroundColor Green
'@
    
    $ciScript | Out-File -FilePath "ci-test.ps1" -Encoding UTF8
    
    Log-Success "测试脚本创建完成"
}

# 设置 IIS（可选）
function Setup-IIS {
    if (!$SetupIIS) {
        return
    }
    
    if (!(Test-Administrator)) {
        Log-Error "设置 IIS 需要管理员权限"
        return
    }
    
    Log-Info "设置 IIS 用于查看测试报告..."
    
    # 启用 IIS 功能
    Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent -All
    
    # 创建网站
    Import-Module WebAdministration
    
    $siteName = "PlaywrightReports"
    $sitePort = 8080
    $sitePath = "$ProjectPath\playwright-report"
    
    # 删除现有网站（如果存在）
    if (Get-Website -Name $siteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $siteName
    }
    
    # 创建新网站
    New-Website -Name $siteName -Port $sitePort -PhysicalPath $sitePath
    
    Log-Success "IIS 配置完成，测试报告将在 http://localhost:$sitePort 访问"
}

# 设置计划任务
function Setup-ScheduledTask {
    if (!$SetupScheduledTask) {
        return
    }
    
    if (!(Test-Administrator)) {
        Log-Error "设置计划任务需要管理员权限"
        return
    }
    
    Log-Info "设置计划任务..."
    
    $taskName = "PlaywrightTests"
    $taskDescription = "自动运行 Playwright 测试"
    $scriptPath = "$ProjectPath\ci-test.ps1"
    
    # 删除现有任务（如果存在）
    if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
    
    # 创建任务动作
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`"" -WorkingDirectory $ProjectPath
    
    # 创建任务触发器（每天凌晨 2 点）
    $trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    
    # 创建任务设置
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # 注册任务
    Register-ScheduledTask -TaskName $taskName -Description $taskDescription -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM"
    
    Log-Success "计划任务设置完成（每天凌晨 2 点运行）"
}

# 运行测试验证
function Test-Verification {
    Log-Info "运行测试验证..."
    
    Set-Location $ProjectPath
    
    # 运行一个简单的测试来验证环境
    if (Test-Path "tests\example.spec.ts") {
        .\run-tests-production.ps1 -TestPattern "tests\example.spec.ts"
    } else {
        Log-Warning "未找到示例测试文件，跳过验证"
    }
    
    Log-Success "测试验证完成"
}

# 显示部署信息
function Show-DeploymentInfo {
    Log-Success "=== 部署完成 ==="
    Write-Host
    Log-Info "项目目录: $ProjectPath"
    Log-Info "运行测试: Set-Location '$ProjectPath'; .\run-tests-production.ps1"
    Log-Info "CI 测试: Set-Location '$ProjectPath'; .\ci-test.ps1"
    
    if ($SetupIIS -and (Get-Website -Name "PlaywrightReports" -ErrorAction SilentlyContinue)) {
        Log-Info "测试报告: http://localhost:8080"
    }
    
    Write-Host
    Log-Info "常用命令:"
    Write-Host "  - 更新项目: Set-Location '$ProjectPath'; git pull"
    Write-Host "  - 重新安装依赖: Set-Location '$ProjectPath'; npm install"
    Write-Host "  - 更新浏览器: Set-Location '$ProjectPath'; npx playwright install"
    Write-Host "  - 查看测试报告: Set-Location '$ProjectPath'; npx playwright show-report"
    Write-Host "  - 运行特定测试: .\run-tests-production.ps1 -TestPattern 'tests/specific.spec.ts'"
    Write-Host "  - 调试模式: .\run-tests-production.ps1 -Debug -Headed"
}

# 主函数
function Main {
    Log-Info "开始 Playwright 测试项目部署..."
    Write-Host
    
    try {
        if (!(Test-Administrator)) {
            Log-Warning "建议以管理员身份运行此脚本以获得完整功能"
        }
        
        Install-Chocolatey
        Install-Git
        Install-NodeJS
        Setup-Project
        Install-ProjectDependencies
        Configure-Playwright
        Create-TestScripts
        Setup-IIS
        Setup-ScheduledTask
        Test-Verification
        Show-DeploymentInfo
        
        Log-Success "部署完成！"
    }
    catch {
        Log-Error "部署过程中发生错误: $($_.Exception.Message)"
        exit 1
    }
}

# 显示帮助信息
function Show-Help {
    Write-Host "Playwright 测试项目 Windows 部署脚本" -ForegroundColor Green
    Write-Host
    Write-Host "用法:"
    Write-Host "  .\deploy-windows.ps1 [参数]"
    Write-Host
    Write-Host "参数:"
    Write-Host "  -ProjectPath <路径>        项目安装路径 (默认: $env:USERPROFILE\playwright-tests)"
    Write-Host "  -GitRepo <仓库地址>        Git 仓库地址"
    Write-Host "  -SkipNodeInstall           跳过 Node.js 安装"
    Write-Host "  -SkipGitClone             跳过 Git 克隆"
    Write-Host "  -SetupScheduledTask       设置计划任务"
    Write-Host "  -SetupIIS                 设置 IIS 网站"
    Write-Host "  -Help                     显示此帮助信息"
    Write-Host
    Write-Host "示例:"
    Write-Host "  .\deploy-windows.ps1 -GitRepo 'https://github.com/user/repo.git' -SetupIIS"
    Write-Host "  .\deploy-windows.ps1 -SkipNodeInstall -SetupScheduledTask"
}

# 检查是否显示帮助
if ($args -contains "-Help" -or $args -contains "--help" -or $args -contains "/?") {
    Show-Help
    exit 0
}

# 执行主函数
Main