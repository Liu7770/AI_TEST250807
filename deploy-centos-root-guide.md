# CentOS Root用户部署指南

## 概述
已为您的root用户环境优化了部署脚本 `deploy-centos.sh`，移除了所有sudo命令和用户创建步骤。

## 使用步骤

### 1. 上传脚本到服务器
```bash
# 方法1: 使用scp上传
# scp deploy-centos.sh root@your-server:/tmp/

scp deploy-centos.sh root@1.117.234.78:/tmp/
# 方法2: 直接在服务器上创建文件
# 将脚本内容复制粘贴到服务器上的文件中
```

### 2. 在服务器上执行
```bash
# 登录到服务器
ssh root@your-server

# 进入脚本目录
cd /tmp

# 赋予执行权限
chmod +x deploy-centos.sh

# 运行部署脚本
./deploy-centos.sh
```

### 3. 脚本执行过程
脚本将自动完成以下步骤：
1. ✅ 检测CentOS版本
2. ✅ 更新系统包
3. ✅ 安装基础依赖（git, curl, wget, unzip）
4. ✅ 安装Node.js 18.x
5. ✅ 安装Playwright系统依赖
6. ✅ 设置项目目录（/usr/lxq-aitest）
7. ✅ 安装项目依赖和Playwright浏览器
8. ✅ 配置Playwright生产环境
9. ✅ 创建测试运行脚本
10. 🔧 可选：安装Nginx查看测试报告
11. 🔧 可选：设置定时任务
12. ✅ 运行测试验证

### 4. 交互式选项
脚本运行过程中会询问：
- Git仓库地址（如果项目目录不存在）
- 是否安装Nginx用于查看测试报告
- 是否设置定时运行测试

### 5. 安全退出脚本
如需中途退出脚本：
```bash
# 方法1: 键盘中断
Ctrl + C

# 方法2: 另开终端发送信号
ps aux | grep deploy-centos.sh
kill -TERM <进程ID>
```

## 部署完成后

### 运行测试
```bash
cd /usr/lxq-aitest
# ./run-tests-production.sh
# 运行特定测试
./run-tests-production.sh tests/functional/base64-tool.spec.ts
```

### 查看测试报告

#### 自动启动的报告服务（推荐）
测试完成后，脚本会自动启动 Playwright 报告服务：
```bash
# 报告服务会自动绑定到所有网络接口
# 外部访问地址：http://服务器IP:9323
http://1.117.234.78:9323
```

#### 手动管理报告服务
```bash
# 启动报告服务（绑定到所有接口）
cd /usr/lxq-aitest
nohup npx playwright show-report --host 0.0.0.0 --port 9323 > playwright-report.log 2>&1 &

# 查看服务状态
pgrep -f "playwright.*show-report"

# 停止报告服务
pkill -f "playwright.*show-report"

# 查看服务日志
tail -f /usr/lxq-aitest/playwright-report.log
```

#### Nginx 托管报告（备选方案）
```bash
# 如果安装了Nginx，通过浏览器访问
http://服务器IP:8080
http://1.117.234.78:8080
```

### 常用维护命令
```bash
# 更新项目代码
cd /usr/lxq-aitest && git pull

# 重新安装依赖
cd /usr/lxq-aitest && npm install

# 更新浏览器
cd /usr/lxq-aitest && npx playwright install

# 启动报告服务（外部访问）
cd /usr/lxq-aitest && nohup npx playwright show-report --host 0.0.0.0 --port 9323 > playwright-report.log 2>&1 &

# 查看报告服务状态
pgrep -f "playwright.*show-report"

# 停止报告服务
pkill -f "playwright.*show-report"

# 查看定时任务日志
tail -f /usr/lxq-aitest/test-cron.log

# 查看报告服务日志
tail -f /usr/lxq-aitest/playwright-report.log
```

## 注意事项

1. **防火墙设置**：
   - 确保9323端口已开放（Playwright报告服务）
   - 如果安装了Nginx，确保8080端口已开放
   - 云服务器需要在安全组中开放这些端口

2. **项目权限**：所有文件将以root用户权限运行

3. **定时任务**：如果设置了定时任务，将在每天凌晨2点自动运行测试

4. **资源监控**：建议监控服务器资源使用情况，特别是在运行大量测试时

5. **报告服务**：
   - 测试完成后会自动启动报告服务
   - 服务绑定到0.0.0.0:9323，支持外部访问
   - 可通过 http://服务器IP:9323 访问测试报告

## 故障排除

### 常见问题
1. **Node.js版本问题**：脚本会自动安装Node.js 18.x
2. **依赖包缺失**：脚本包含了所有必需的系统依赖
3. **权限问题**：root用户拥有所有必要权限
4. **网络问题**：确保服务器可以访问外网下载依赖

### 日志查看
```bash
# 查看脚本执行日志
./deploy-centos.sh 2>&1 | tee deploy.log

# 查看测试运行日志
tail -f /usr/lxq-aitest/test-cron.log
```