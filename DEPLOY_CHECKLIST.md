# 🚀 Cloudflare Pages 部署清单

快速部署指南 - 按照此清单逐步完成部署。

## ✅ 部署前检查

### 1. 代码准备
- [x] 代码已推送到 GitHub `cloudflare` 分支
- [x] 构建成功（`pnpm build`）
- [x] 所有 TypeScript 错误已修复
- [x] Supabase Auth 迁移完成

### 2. 账号准备
- [ ] Cloudflare 账号（https://dash.cloudflare.com/sign-up）
- [ ] Supabase 项目（https://supabase.com/dashboard）
- [ ] GitHub 账号已连接

### 3. 获取必需的凭证

#### Supabase 凭证
访问: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

- [ ] `NEXT_PUBLIC_SUPABASE_URL`: `https://__________.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJ__________`

#### 数据库连接（可选）
访问: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database

- [ ] `DATABASE_URL`: `postgresql://postgres:__________`

#### 生成密钥
运行命令: `openssl rand -base64 32`

- [ ] `NEXTAUTH_SECRET`: `__________`

## 🎯 方法一：Cloudflare Dashboard 部署（推荐新手）

### 步骤 1: 创建项目
1. [ ] 访问 https://dash.cloudflare.com/
2. [ ] 点击 **Workers & Pages**
3. [ ] 点击 **Create application**
4. [ ] 选择 **Pages** 标签
5. [ ] 点击 **Connect to Git**

### 步骤 2: 连接仓库
1. [ ] 授权 GitHub
2. [ ] 选择 `vibetrans` 仓库
3. [ ] 点击 **Begin setup**

### 步骤 3: 配置构建
```
项目名称: vibetrans
生产分支: cloudflare
构建命令: pnpm build:cf
构建输出目录: .vercel/output/static
```

### 步骤 4: 添加环境变量

**必需变量：**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://vibetrans.pages.dev
NEXTAUTH_SECRET=生成的随机字符串
```

**可选变量（如使用）：**
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 步骤 5: 部署
1. [ ] 点击 **Save and Deploy**
2. [ ] 等待构建完成（3-5 分钟）
3. [ ] 访问生成的 URL 验证部署

## 💻 方法二：命令行部署（推荐开发者）

### 步骤 1: 安装 Wrangler
```bash
pnpm add -g wrangler
```

### 步骤 2: 登录
```bash
wrangler login
```

### 步骤 3: 创建 .env.production
```bash
cp .env.local .env.production
# 编辑 .env.production 添加生产环境变量
```

### 步骤 4: 构建
```bash
pnpm build:cf
```

### 步骤 5: 部署
```bash
wrangler pages deploy
```

首次部署会提示：
- [ ] 输入项目名称: `vibetrans`
- [ ] 确认生产分支: `cloudflare`

## 📋 部署后验证

### 1. 功能测试
- [ ] 首页加载正常
- [ ] 登录页面可访问 (`/auth/login`)
- [ ] 注册页面可访问 (`/auth/register`)
- [ ] 用户可以注册新账号
- [ ] 用户可以登录
- [ ] 用户可以登出
- [ ] Dashboard 页面正常显示

### 2. Supabase 集成验证
- [ ] 访问 Supabase Dashboard
- [ ] 检查 Authentication > Users
- [ ] 确认新注册的用户出现在列表中

### 3. 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] 无 JavaScript 错误（F12 控制台）
- [ ] 无 404 错误
- [ ] 图片正常显示

## 🔧 常见问题解决

### 问题 1: 构建失败 - "pnpm: command not found"
**解决方案：**
在 Cloudflare Pages 设置 > Environment variables 添加：
```
NPM_FLAGS=--package-manager=pnpm
```

### 问题 2: 运行时错误 - "Supabase client is not initialized"
**解决方案：**
检查环境变量：
1. 确保变量名正确（包括 `NEXT_PUBLIC_` 前缀）
2. 重新部署项目

### 问题 3: 认证失败
**解决方案：**
1. 检查 Supabase Dashboard > Authentication > URL Configuration
2. 添加部署的域名到允许列表：
   - Site URL: `https://your-app.pages.dev`
   - Redirect URLs: `https://your-app.pages.dev/auth/callback`

### 问题 4: 数据库连接错误
**解决方案：**
1. 使用 Supabase 提供的连接字符串（带 pooling）
2. 格式: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

## 🎨 自定义域名（可选）

### 步骤 1: 添加域名
1. [ ] Cloudflare Pages 项目 > Custom domains
2. [ ] 输入域名: `example.com`
3. [ ] 点击 **Continue**

### 步骤 2: 配置 DNS
- [ ] 如果域名在 Cloudflare: 自动配置
- [ ] 如果域名在其他地方: 添加 CNAME 记录

### 步骤 3: 更新环境变量
- [ ] 更新 `NEXT_PUBLIC_APP_URL` 为自定义域名
- [ ] 更新 Supabase redirect URLs

## 📊 监控设置

### Cloudflare Analytics
- [ ] 启用 Web Analytics
- [ ] 设置告警规则

### 错误追踪（可选）
推荐工具：
- Sentry
- LogRocket
- Datadog

## 🔄 持续部署

### 自动部署已配置
- ✅ 推送到 `cloudflare` 分支自动部署
- ✅ Pull Request 自动创建预览

### 部署新版本
```bash
git add .
git commit -m "feat: new feature"
git push origin cloudflare
# 自动触发 Cloudflare Pages 构建
```

## 📝 最后检查

部署完成后的最终检查清单：

- [ ] 生产 URL 可访问
- [ ] 所有页面正常加载
- [ ] 认证功能正常
- [ ] 数据库读写正常
- [ ] 支付功能正常（如启用）
- [ ] 邮件功能正常（如启用）
- [ ] 移动端显示正常
- [ ] SEO 标签正确
- [ ] Analytics 正常记录
- [ ] 错误监控已启用

## 🎉 完成！

恭喜！你的应用已成功部署到 Cloudflare Pages。

**下一步：**
1. 分享你的应用链接
2. 监控性能和错误
3. 根据用户反馈迭代改进

**需要帮助？**
- 查看完整文档: `CLOUDFLARE_DEPLOYMENT.md`
- Cloudflare 支持: https://community.cloudflare.com/
- 项目 Issues: https://github.com/your-username/vibetrans/issues

---

**部署 URL:** ___________________________

**完成日期:** ___________________________
