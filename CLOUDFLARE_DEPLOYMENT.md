# Cloudflare Pages 部署指南

本指南将帮助您将 VibeTrans 项目部署到 Cloudflare Pages。

## 前置要求

1. **Cloudflare 账号**
   - 注册地址: https://dash.cloudflare.com/sign-up
   - 需要验证邮箱

2. **Supabase 项目**
   - 创建地址: https://supabase.com/dashboard
   - 获取项目的 URL 和 anon key

3. **GitHub 仓库**
   - ✅ 已完成：代码已推送到 `cloudflare` 分支

## 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

#### 1. 创建 Cloudflare Pages 项目

1. 访问 https://dash.cloudflare.com/
2. 选择 **Workers & Pages** > **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

#### 2. 连接 GitHub 仓库

1. 选择你的 GitHub 账号
2. 选择 **vibetrans** 仓库
3. 点击 **Begin setup**

#### 3. 配置构建设置

填写以下配置：

```
项目名称: vibetrans（或自定义）
生产分支: cloudflare
构建命令: pnpm build:cf
构建输出目录: .vercel/output/static
根目录: /（保持默认）
```

**重要：** 如果找不到 `.vercel/output/static` 目录，先使用：
- 构建输出目录: `.next`
- 然后在第一次部署后根据实际生成的目录调整

#### 4. 配置环境变量

点击 **Environment variables (advanced)**，添加以下变量：

**必需的 Supabase 变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon/public key |

**可选的数据库变量（如果使用 Supabase PostgreSQL）：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Supabase 数据库连接字符串 |

**其他必需变量：**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.pages.dev` | 应用域名 |
| `NEXTAUTH_SECRET` | 生成随机字符串 | 认证密钥 |

**支付集成（如使用 Stripe）：**

| 变量名 | 值 |
|--------|-----|
| `STRIPE_SECRET_KEY` | `sk_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

#### 5. 部署

1. 点击 **Save and Deploy**
2. 等待构建完成（约 3-5 分钟）
3. 构建成功后会显示部署 URL

### 方法二：通过命令行部署

#### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或使用 pnpm
pnpm add -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器进行授权。

#### 3. 创建 .env.local 文件

在项目根目录创建 `.env.local`（如果还没有）：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=https://vibetrans.pages.dev

# Database (可选)
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=your-random-secret

# Stripe (可选)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 4. 构建并部署

```bash
# 构建项目
pnpm build:cf

# 部署到 Cloudflare Pages
wrangler pages deploy
```

首次部署时会提示创建项目，按提示操作即可。

## 获取 Supabase 凭证

### 1. 访问 Supabase Dashboard

https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

### 2. 复制以下信息

- **Project URL**: 在 "Configuration" > "URL" 下
- **Anon/Public Key**: 在 "Project API keys" > "anon public" 下

### 3. 数据库连接字符串（可选）

在 "Database" > "Connection string" > "URI" 下获取。

## 生成必需的密钥

### NEXTAUTH_SECRET

在终端运行：

```bash
openssl rand -base64 32
```

## 验证部署

### 1. 访问部署的网站

Cloudflare 会提供一个 URL，如：
- `https://vibetrans.pages.dev`
- 或自定义域名

### 2. 测试功能

- ✅ 页面加载正常
- ✅ 登录/注册功能
- ✅ 数据库连接
- ✅ 支付功能（如启用）

## 自定义域名（可选）

### 1. 在 Cloudflare Pages 项目中

1. 进入项目设置
2. 选择 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入你的域名
5. 按提示配置 DNS 记录

### 2. DNS 配置

如果域名在 Cloudflare：
- 系统会自动添加 CNAME 记录

如果域名在其他提供商：
- 添加 CNAME 记录指向 `vibetrans.pages.dev`

## 常见问题

### 1. 构建失败：找不到 pnpm

**解决方案：**
在 Cloudflare Pages 设置中添加环境变量：
```
NPM_FLAGS=--package-manager=pnpm
```

### 2. 运行时错误：Supabase 未定义

**解决方案：**
确保环境变量正确设置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 数据库连接失败

**解决方案：**
- 检查 `DATABASE_URL` 是否正确
- 确保 Supabase 数据库已启动
- 检查防火墙设置

### 4. 边缘运行时错误

**解决方案：**
某些 Node.js API 在边缘运行时不可用。检查代码是否使用了不兼容的 API。

## 持续部署

### 自动部署

Cloudflare Pages 已配置自动部署：
- 推送到 `cloudflare` 分支 → 自动部署到生产环境
- 推送到其他分支 → 自动创建预览部署

### 手动部署

```bash
# 更新代码
git add .
git commit -m "your message"
git push origin cloudflare

# 或使用命令行部署
pnpm build:cf
wrangler pages deploy
```

## 监控和日志

### 1. 查看部署日志

Cloudflare Dashboard > Workers & Pages > 你的项目 > Deployments

### 2. 实时日志

```bash
wrangler pages deployment tail
```

### 3. 分析和监控

Cloudflare Dashboard 提供：
- 请求统计
- 错误率
- 响应时间
- 带宽使用

## 生产环境优化

### 1. 启用 Cloudflare CDN

Cloudflare Pages 自动启用全球 CDN，无需额外配置。

### 2. 配置缓存规则

在 Cloudflare Dashboard 中设置页面规则以优化缓存。

### 3. 启用 Brotli 压缩

Cloudflare 自动启用，可在 Speed > Optimization 中调整。

### 4. 配置安全规则

Workers & Pages > 项目设置 > Security

## 成本估算

Cloudflare Pages 免费套餐：
- ✅ 无限网站
- ✅ 无限请求
- ✅ 无限带宽
- ✅ 500 次构建/月
- ✅ 20,000 个文件
- ✅ 25 MB 单文件限制

对于大多数项目完全够用！

## 回滚部署

如果新部署有问题：

1. 访问 Cloudflare Dashboard
2. 进入 Deployments
3. 找到之前的成功部署
4. 点击 **Rollback to this deployment**

## 支持

- Cloudflare 文档: https://developers.cloudflare.com/pages/
- Supabase 文档: https://supabase.com/docs
- 项目 Issues: https://github.com/your-username/vibetrans/issues

---

**准备好了吗？** 开始部署到 Cloudflare Pages！🚀
