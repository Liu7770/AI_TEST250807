# Playwright 测试项目 Docker 镜像
# 基于官方 Playwright 镜像构建

FROM mcr.microsoft.com/playwright:v1.40.0-focal

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装 Node.js 依赖
RUN npm ci --only=production

# 复制项目文件
COPY . .

# 确保 Playwright 浏览器已安装
RUN npx playwright install

# 创建测试报告目录
RUN mkdir -p /app/playwright-report /app/test-results

# 设置权限
RUN chmod +x /app/run-tests.sh || true

# 创建非 root 用户
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# 切换到非 root 用户
USER playwright

# 暴露端口（用于测试报告服务）
EXPOSE 9323

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# 默认命令
CMD ["npm", "run", "test:docker"]