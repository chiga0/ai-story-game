# 部署指南

本文档详细说明 AI Story Game 应用的部署流程和环境配置。

## 目录

- [环境要求](#环境要求)
- [环境变量配置](#环境变量配置)
- [本地开发](#本地开发)
- [生产部署](#生产部署)
- [常见问题](#常见问题)

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0
- PostgreSQL >= 14（可选，用于用户系统和存档功能）

## 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

### AI 模型配置（必填）

```bash
# 百炼平台 GLM-5 配置
# 从 https://bailian.console.aliyun.com/ 获取 API Key
BAILIAN_API_KEY=your-api-key-here
BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### OpenAI 兼容服务（可选）

```bash
# 如果使用 OpenAI 或其他兼容服务
# OPENAI_API_KEY=your-openai-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
```

### 数据库配置（可选）

```bash
# PostgreSQL 数据库连接
# DATABASE_URL=postgresql://user:password@localhost:5432/ai_game
```

### 会话和安全配置

```bash
# 会话密钥（用于加密会话数据）
SESSION_SECRET=your-session-secret-here

# 应用 URL（生产环境必填）
APP_URL=https://your-domain.com
```

### 监控和错误追踪（可选）

```bash
# Sentry DSN（错误监控）
# SENTRY_DSN=https://xxx@sentry.io/xxx

# 环境标识
NODE_ENV=production
```

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/ai-story-game.git
cd ai-story-game
```

### 2. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 4. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

### 5. 访问应用

打开浏览器访问 http://localhost:3000

## 生产部署

### 方式一：Netlify（推荐）

1. **连接 Git 仓库**

   - 登录 Netlify
   - 点击 "Add new site" > "Import an existing project"
   - 选择你的 Git 仓库

2. **配置构建设置**

   - Build command: `pnpm build` 或 `npm run build`
   - Publish directory: `dist`

3. **配置环境变量**

   在 Site settings > Environment variables 中添加所有必要的环境变量。

4. **部署**

   Netlify 会自动部署 main 分支的更新。

### 方式二：Cloudflare Pages

1. **连接 Git 仓库**

   - 登录 Cloudflare Dashboard
   - 进入 Pages > Create a project
   - 选择你的 Git 仓库

2. **配置构建设置**

   - Framework preset: None
   - Build command: `pnpm build` 或 `npm run build`
   - Build output directory: `dist`

3. **配置环境变量**

   在 Settings > Environment variables 中添加配置。

4. **部署**

   Cloudflare Pages 会自动构建和部署。

### 方式三：VPS 自托管

1. **准备服务器**

   ```bash
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安装 pnpm
   npm install -g pnpm

   # 安装 PM2（进程管理）
   npm install -g pm2
   ```

2. **克隆并构建项目**

   ```bash
   git clone https://github.com/your-repo/ai-story-game.git
   cd ai-story-game
   pnpm install
   pnpm build
   ```

3. **配置环境变量**

   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

4. **使用 PM2 启动**

   ```bash
   # 创建 ecosystem.config.js
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'ai-story-game',
       script: 'pnpm',
       args: 'preview',
       instances: 'max',
       exec_mode: 'cluster',
       env_production: {
         NODE_ENV: 'production'
       }
     }]
   }
   EOF

   # 启动服务
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

5. **配置 Nginx 反向代理**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 方式四：Docker 部署

1. **构建镜像**

   ```bash
   docker build -t ai-story-game .
   ```

2. **运行容器**

   ```bash
   docker run -d \
     -p 3000:3000 \
     -e BAILIAN_API_KEY=your-api-key \
     -e SESSION_SECRET=your-secret \
     --name ai-story-game \
     ai-story-game
   ```

3. **使用 Docker Compose**

   ```yaml
   version: '3'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - BAILIAN_API_KEY=${BAILIAN_API_KEY}
         - SESSION_SECRET=${SESSION_SECRET}
         - NODE_ENV=production
   ```

   ```bash
   docker-compose up -d
   ```

## 数据库迁移（可选）

如果使用 PostgreSQL 存储用户数据和存档：

```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate
```

## 健康检查

部署后，访问以下端点确认服务正常：

- `/` - 首页
- `/scripts` - 剧本列表

## 监控和日志

### Sentry 错误追踪

1. 在 `.env` 中配置 `SENTRY_DSN`
2. 应用会自动上报错误到 Sentry

### 日志

- 开发环境：控制台输出
- 生产环境：PM2 日志 `/var/log/pm2/`

```bash
# 查看日志
pm2 logs ai-story-game
```

## 常见问题

### Q: AI 对话无响应

**A:** 检查 `BAILIAN_API_KEY` 是否正确配置，API 是否有余额。

### Q: 数据库连接失败

**A:** 确认 `DATABASE_URL` 格式正确，数据库服务已启动，网络可达。

### Q: 部署后页面空白

**A:** 检查浏览器控制台错误，确认构建产物正确，环境变量已配置。

### Q: 跨域问题

**A:** 确保 `APP_URL` 与实际访问域名一致，或配置 CORS。

## 安全建议

1. **不要提交 `.env` 文件** - 已在 `.gitignore` 中排除
2. **使用强密钥** - `SESSION_SECRET` 应为随机生成的长字符串
3. **HTTPS** - 生产环境必须使用 HTTPS
4. **定期更新依赖** - `pnpm update` 定期更新
5. **限制 API 调用** - 考虑添加速率限制

## 相关文档

- [环境变量说明](/.env.example)
- [项目 README](/README.md)
- [贡献指南](/README.md#contributing)