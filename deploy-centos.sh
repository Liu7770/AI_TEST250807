#!/bin/bash

# =============================================================================
# Playwright 测试项目 CentOS 部署脚本
# 适用于 CentOS 7/8/9 系统
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_info "检测到 root 用户，继续执行部署..."
    else
        log_warning "当前不是 root 用户，某些操作可能需要 sudo 权限"
    fi
}

# 检查系统依赖状态
check_system_status() {
    log_info "检查系统当前状态..."
    
    # 检查基础工具
    local basic_tools=("git" "curl" "wget" "unzip")
    local missing_basic=()
    for tool in "${basic_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_basic+=("$tool")
        fi
    done
    
    # 检查 Node.js
    local node_status="未安装"
    if command -v node &> /dev/null; then
        local node_version=$(node --version 2>/dev/null | sed 's/v//')
        node_status="已安装 (v$node_version)"
    fi
    
    # 检查 Nginx
    local nginx_status="未安装"
    if command -v nginx &> /dev/null; then
        nginx_status="已安装"
    fi
    
    # 检查项目目录
    local project_status="不存在"
    PROJECT_DIR="/usr/lxq-aitest"
    if [[ -d "$PROJECT_DIR" ]]; then
        project_status="已存在"
        if [[ -d "$PROJECT_DIR/node_modules" ]]; then
            project_status="已存在 (含依赖)"
        fi
    fi
    
    # 输出状态报告
    echo "==================== 系统状态报告 ===================="
    echo "基础工具: ${#missing_basic[@]} 个缺失 ${missing_basic[*]}"
    echo "Node.js: $node_status"
    echo "Nginx: $nginx_status"
    echo "项目目录: $project_status"
    echo "===================================================="
    
    if [[ ${#missing_basic[@]} -eq 0 && "$node_status" != "未安装" && "$project_status" == "已存在 (含依赖)" ]]; then
        log_success "系统依赖基本完整，部署过程将更快完成"
    else
        log_info "检测到缺失依赖，将进行完整安装"
    fi
}

# 检测 CentOS 版本
detect_centos_version() {
    if [[ -f /etc/centos-release ]]; then
        CENTOS_VERSION=$(cat /etc/centos-release | grep -oE '[0-9]+' | head -1)
        log_info "检测到 CentOS $CENTOS_VERSION"
    elif [[ -f /etc/redhat-release ]]; then
        CENTOS_VERSION=$(cat /etc/redhat-release | grep -oE '[0-9]+' | head -1)
        log_info "检测到 RHEL/CentOS $CENTOS_VERSION"
    else
        log_error "无法检测到 CentOS/RHEL 系统"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    if command -v dnf &> /dev/null; then
        dnf update -y
    else
        yum update -y
    fi
    log_success "系统更新完成"
}

# 安装基础依赖
install_basic_dependencies() {
    log_info "检查基础依赖包..."
    
    local packages=("git" "curl" "wget" "unzip")
    local missing_packages=()
    
    # 检查每个包是否已安装
    for package in "${packages[@]}"; do
        if ! command -v "$package" &> /dev/null; then
            missing_packages+=("$package")
        else
            log_info "$package 已安装，跳过"
        fi
    done
    
    # 只安装缺失的包
    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_info "安装缺失的依赖包: ${missing_packages[*]}"
        if command -v dnf &> /dev/null; then
            dnf install -y "${missing_packages[@]}"
        else
            yum install -y "${missing_packages[@]}"
        fi
    else
        log_success "所有基础依赖已安装，跳过安装步骤"
        return
    fi
    
    log_success "基础依赖安装完成"
}

# 安装 Node.js
install_nodejs() {
    log_info "安装 Node.js..."
    
    # 检查是否已安装 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否满足要求 (>= 16)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [[ $NODE_MAJOR_VERSION -ge 16 ]]; then
            log_success "Node.js 版本满足要求"
            return
        else
            log_warning "Node.js 版本过低，需要升级"
        fi
    fi
    
    # 安装 NodeSource 仓库
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    
    # 安装 Node.js
    if command -v dnf &> /dev/null; then
        dnf install -y nodejs
    else
        yum install -y nodejs
    fi
    
    # 验证安装
    node --version
    npm --version
    
    log_success "Node.js 安装完成"
}

# 安装 Playwright 系统依赖
install_playwright_dependencies() {
    log_info "检查 Playwright 系统依赖..."
    
    local packages=(
        "alsa-lib"
        "atk"
        "cups-libs"
        "gtk3"
        "libdrm"
        "libX11"
        "libXcomposite"
        "libXdamage"
        "libXext"
        "libXfixes"
        "libXrandr"
        "libXScrnSaver"
        "libgcc"
        "nss"
        "mesa-libgbm"
        "xorg-x11-server-Xvfb"
    )
    
    local missing_packages=()
    
    # 检查每个包是否已安装
    for package in "${packages[@]}"; do
        if command -v dnf &> /dev/null; then
            if ! dnf list installed "$package" &> /dev/null; then
                missing_packages+=("$package")
            else
                log_info "$package 已安装，跳过"
            fi
        else
            if ! yum list installed "$package" &> /dev/null; then
                missing_packages+=("$package")
            else
                log_info "$package 已安装，跳过"
            fi
        fi
    done
    
    # 只安装缺失的包
    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_info "安装缺失的 Playwright 依赖包: ${missing_packages[*]}"
        if command -v dnf &> /dev/null; then
            dnf install -y "${missing_packages[@]}"
        else
            yum install -y "${missing_packages[@]}"
        fi
    else
        log_success "所有 Playwright 系统依赖已安装，跳过安装步骤"
        return
    fi
    
    log_success "Playwright 系统依赖安装完成"
}

# 克隆或更新项目
setup_project() {
    log_info "设置项目..."
    
    PROJECT_DIR="/usr/lxq-aitest"
    
    if [[ -d "$PROJECT_DIR" ]]; then
        cd "$PROJECT_DIR"
        
        # 检查是否为 git 仓库
        if [[ -d ".git" ]] || git rev-parse --git-dir > /dev/null 2>&1; then
            log_info "项目目录已存在且为 Git 仓库，更新代码..."
            git pull origin main || git pull origin master || {
                log_warning "Git pull 失败，可能需要手动解决冲突或检查远程仓库连接"
                log_info "继续使用现有代码..."
            }
        else
            log_warning "项目目录存在但不是 Git 仓库"
            read -p "是否删除现有目录并重新克隆？(y/n): " -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cd /
                rm -rf "$PROJECT_DIR"
                log_info "克隆项目代码..."
                read -p "请输入 Git 仓库地址: " GIT_REPO
                git clone "$GIT_REPO" "$PROJECT_DIR"
                cd "$PROJECT_DIR"
            else
                log_info "保留现有目录，继续部署..."
            fi
        fi
    else
        log_info "克隆项目代码..."
        # 这里需要替换为实际的 Git 仓库地址
        read -p "请输入 Git 仓库地址: " GIT_REPO
        git clone "$GIT_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    log_success "项目设置完成"
}

# 安装项目依赖
install_project_dependencies() {
    log_info "检查项目依赖..."
    
    cd "$PROJECT_DIR"
    
    # 检查 node_modules 是否存在且不为空
    if [[ -d "node_modules" && "$(ls -A node_modules 2>/dev/null)" ]]; then
        log_info "node_modules 已存在，检查 package.json 是否有更新..."
        # 检查 package-lock.json 是否比 node_modules 新
        if [[ "package-lock.json" -nt "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
            log_info "检测到 package.json 更新，重新安装依赖"
            npm install
        else
            log_success "npm 依赖已是最新，跳过安装"
        fi
    else
        log_info "安装 npm 依赖..."
        npm install
    fi
    
    # 检查 Playwright 浏览器是否已安装
    if npx playwright install --dry-run 2>/dev/null | grep -q "browsers are already installed"; then
        log_success "Playwright 浏览器已安装，跳过下载"
    else
        log_info "安装 Playwright 浏览器..."
        npx playwright install
    fi
    
    log_success "项目依赖检查完成"
}

# 配置 Playwright
configure_playwright() {
    log_info "配置 Playwright..."
    
    cd "$PROJECT_DIR"
    
    # 创建生产环境配置
    cat > playwright.config.production.ts << 'EOF'
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
  ],
  timeout: 30000,
  expect: {
    timeout: 5000
  },
});
EOF
    
    log_success "Playwright 配置完成"
}

# 创建测试运行脚本
create_test_scripts() {
    log_info "创建测试运行脚本..."
    
    cd "$PROJECT_DIR"
    
    # 创建测试运行脚本
    cat > run-tests-production.sh << 'EOF'
#!/bin/bash

# 设置环境变量
export DISPLAY=:99
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright

# 启动虚拟显示器
Xvfb :99 -screen 0 1280x720x24 &
XVFB_PID=$!

# 等待虚拟显示器启动
sleep 2

# 运行测试
echo "开始运行 Playwright 测试..."
npx playwright test --config=playwright.config.production.ts "$@"
TEST_EXIT_CODE=$?

# 清理虚拟显示器
kill $XVFB_PID 2>/dev/null || true

# 生成测试报告
if [[ -f "playwright-report/index.html" ]]; then
    echo "测试报告已生成: $(pwd)/playwright-report/index.html"
fi

exit $TEST_EXIT_CODE
EOF
    
    chmod +x run-tests-production.sh
    
    # 创建 CI/CD 脚本
    cat > ci-test.sh << 'EOF'
#!/bin/bash

set -e

# 设置 CI 环境变量
export CI=true
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright

# 运行测试
./run-tests-production.sh

# 检查测试结果
if [[ -f "test-results.json" ]]; then
    echo "测试结果文件已生成"
    # 这里可以添加结果解析逻辑
fi
EOF
    
    chmod +x ci-test.sh
    
    log_success "测试脚本创建完成"
}

# 设置 Nginx（可选）
setup_nginx() {
    read -p "是否安装 Nginx 用于查看测试报告？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    log_info "检查和配置 Nginx..."
    
    # 检查 Nginx 是否已安装
    if command -v nginx &> /dev/null; then
        log_info "Nginx 已安装，跳过安装步骤"
    else
        log_info "安装 Nginx..."
        if command -v dnf &> /dev/null; then
            dnf install -y nginx
        else
            yum install -y nginx
        fi
    fi
    
    # 配置 Nginx
    tee /etc/nginx/conf.d/playwright-reports.conf > /dev/null << EOF
server {
    listen 8080;
    server_name _;
    
    location / {
        root $PROJECT_DIR/playwright-report;
        index index.html;
        try_files \$uri \$uri/ =404;
    }
    
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF
    
    # 启动 Nginx
    systemctl enable nginx
    systemctl start nginx
    
    # 开放防火墙端口
    if command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=8080/tcp
        firewall-cmd --reload
    fi
    
    log_success "Nginx 配置完成，测试报告将在 http://服务器IP:8080 访问"
}

# 创建定时任务
setup_cron() {
    read -p "是否设置定时运行测试？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    log_info "设置定时任务..."
    
    # 创建定时任务脚本
    cat > "$PROJECT_DIR/cron-test.sh" << EOF
#!/bin/bash

cd "$PROJECT_DIR"

# 记录开始时间
echo "\$(date): 开始运行定时测试" >> test-cron.log

# 运行测试
./run-tests-production.sh >> test-cron.log 2>&1

# 记录结束时间
echo "\$(date): 定时测试完成" >> test-cron.log
EOF
    
    chmod +x "$PROJECT_DIR/cron-test.sh"
    
    # 添加到 crontab（每天凌晨 2 点运行）
    (crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/cron-test.sh") | crontab -
    
    log_success "定时任务设置完成（每天凌晨 2 点运行）"
}

# 运行测试验证
run_test_verification() {
    log_info "运行测试验证..."
    
    cd "$PROJECT_DIR"
    
    # 运行一个简单的测试来验证环境
    if [[ -f "tests/example.spec.ts" ]]; then
        ./run-tests-production.sh tests/example.spec.ts
    else
        log_warning "未找到示例测试文件，跳过验证"
    fi
    
    log_success "测试验证完成"
}

# 显示部署信息
show_deployment_info() {
    # 最终状态检查
    log_info "=== 最终部署状态检查 ==="
    
    # 重新检查所有组件状态
    local final_status=()
    
    # 检查基础工具
    local basic_tools=("git" "curl" "wget" "unzip")
    local basic_ok=true
    for tool in "${basic_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            basic_ok=false
            break
        fi
    done
    
    if $basic_ok; then
        final_status+=("✓ 基础工具: 完整")
    else
        final_status+=("✗ 基础工具: 不完整")
    fi
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version 2>/dev/null)
        final_status+=("✓ Node.js: $node_version")
    else
        final_status+=("✗ Node.js: 未安装")
    fi
    
    # 检查项目
    if [[ -d "$PROJECT_DIR" && -f "$PROJECT_DIR/package.json" ]]; then
        if [[ -d "$PROJECT_DIR/node_modules" ]]; then
            final_status+=("✓ 项目: 完整 (含依赖)")
        else
            final_status+=("⚠ 项目: 存在但缺少依赖")
        fi
    else
        final_status+=("✗ 项目: 不存在")
    fi
    
    # 检查 Nginx
    if command -v nginx &> /dev/null && systemctl is-active nginx &> /dev/null; then
        final_status+=("✓ Nginx: 已安装并运行")
    else
        final_status+=("- Nginx: 未安装或未运行")
    fi
    
    # 输出最终状态
    echo "=================== 部署完成状态 ==================="
    for status in "${final_status[@]}"; do
        echo "$status"
    done
    echo "==================================================="
    
    log_success "=== 部署完成 ==="
    echo
    log_info "项目目录: $PROJECT_DIR"
    log_info "运行测试: cd $PROJECT_DIR && ./run-tests-production.sh"
    log_info "CI 测试: cd $PROJECT_DIR && ./ci-test.sh"
    
    if systemctl is-active --quiet nginx; then
        log_info "测试报告: http://$(hostname -I | awk '{print $1}'):8080"
    fi
    
    log_info "查看日志: tail -f $PROJECT_DIR/test-cron.log"
    echo
    log_info "常用命令:"
    echo "  - 更新项目: cd $PROJECT_DIR && git pull"
    echo "  - 重新安装依赖: cd $PROJECT_DIR && npm install"
    echo "  - 更新浏览器: cd $PROJECT_DIR && npx playwright install"
    echo "  - 查看测试报告: cd $PROJECT_DIR && npx playwright show-report"
}

# 主函数
main() {
    log_info "开始 Playwright 测试项目部署..."
    echo
    
    check_root
    detect_centos_version
    check_system_status
    update_system
    install_basic_dependencies
    install_nodejs
    install_playwright_dependencies
    setup_project
    install_project_dependencies
    configure_playwright
    create_test_scripts
    setup_nginx
    setup_cron
    run_test_verification
    show_deployment_info
    
    log_success "部署完成！"
}

# 执行主函数
main "$@"