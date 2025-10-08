# Cloudflare Pages 部署指南

## ✅ 项目状态

- ✅ **开发环境验证**: `pnpm dev` 正常启动 (2.1s)
- ✅ **生产构建验证**: `pnpm build` 成功通过
- ✅ **Edge Runtime**: 所有8个API路由已配置为edge runtime
- ✅ **Bundle大小**: 符合Cloudflare Pages 25MB限制
  - Server chunks: 11MB
  - Static assets: 9.1MB
  - 最大edge chunk: 3.1MB

## 🚀 快速部署步骤

### 方式一：通过Cloudflare Dashboard (推荐)

1. **连接GitHub仓库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Create application → Pages → Connect to Git
   - 选择你的仓库

2. **配置构建设置**
   ```
   Framework preset: Next.js
   Build command: pnpm build
   Build output directory: .next
   Root directory: (留空或项目根目录)
   ```

3. **设置环境变量** (见下方完整列表)

4. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（约3-5分钟）

### 方式二：通过Wrangler CLI

```bash
# 1. 安装依赖
pnpm install

# 2. 登录Cloudflare
npx wrangler login

# 3. 构建并部署
pnpm run deploy:cf
```

## 📋 必需的环境变量

### 核心配置
```bash
# 应用基础URL（替换为你的域名）
NEXT_PUBLIC_BASE_URL=https://your-domain.pages.dev

# 数据库 (Supabase或其他PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Better Auth
BETTER_AUTH_SECRET=your-random-secret-key-here  # 使用 openssl rand -base64 32 生成
```

### 认证服务商 (可选)

**GitHub OAuth**
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Google OAuth**
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id  # One Tap登录需要
```

### 支付 (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe价格ID
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=price_xxx
```

### AI服务 (视频生成)
```bash
# Google Gemini API (用于Veo 3视频生成)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

### 存储 (Cloudflare R2或S3兼容服务)
```bash
STORAGE_REGION=auto
STORAGE_BUCKET_NAME=your-bucket-name
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_ENDPOINT=https://xxx.r2.cloudflarestorage.com
STORAGE_PUBLIC_URL=https://your-cdn-domain.com
```

### 邮件服务 (Resend)
```bash
RESEND_API_KEY=re_xxx
RESEND_AUDIENCE_ID=aud_xxx
```

## 🔧 Cloudflare特定配置

### wrangler.toml
```toml
name = "vibetrans"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "vibetrans-prod"

[env.preview]
name = "vibetrans-preview"
```

## 📦 保留的功能

### ✅ 已保留
- Video生成 (`/video`) - Google Veo 3 API
- 用户认证 (邮箱/密码、Google、GitHub)
- 支付系统 (订阅 + 积分)
- 设置页面 (个人资料、订阅、积分、安全、通知)
- 博客和文档

### ❌ 已删除
- Image生成 (Volcano Engine)
- Dog Translator
- Dashboard页面
- Admin用户管理后台

## 🎯 API路由清单

所有API路由均已配置为Edge Runtime：

1. `/api/video/generate` - Video生成
2. `/api/video/status` - Video状态查询
3. `/api/video/proxy` - Video代理下载
4. `/api/auth/callback` - 认证回调
5. `/api/storage/upload` - 文件上传
6. `/api/webhooks/stripe` - Stripe webhook
7. `/api/distribute-credits` - 积分分发
8. `/api/ping` - 健康检查

## 🆘 常见问题

### 1. 构建失败：Module not found
**解决**: 检查 `package.json` 中的依赖是否完整，运行 `pnpm install`

### 2. Edge Runtime错误
**解决**: 确保所有API路由都添加了 `export const runtime = 'edge'`

### 3. 环境变量未生效
**解决**:
- 在Cloudflare Dashboard重新部署
- 确保变量名完全匹配（大小写敏感）

### 4. Database连接失败
**解决**:
- 检查 `DATABASE_URL` 格式
- 确保数据库允许外部连接
- Supabase用户需使用连接池URL

## 📚 相关文档

- [Cloudflare Pages文档](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
