# Supabase 配置清单

本文档提供完整的 Supabase 配置步骤，请按顺序完成所有配置。

---

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写项目信息：
   - **Name**: vibetrans（或你喜欢的名称）
   - **Database Password**: 保存此密码（用于数据库直连）
   - **Region**: 选择离用户最近的区域（建议：ap-northeast-1 东京）
4. 点击 **Create new project**，等待项目初始化（约2分钟）

---

## 2. 获取 API 密钥

项目创建完成后：

1. 进入 **Project Settings** → **API**
2. 复制以下三个值：

### 必需的环境变量

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co

# Anon Key（公开密钥，可在客户端使用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key（私密密钥，仅在服务器端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 重要**: Service Role Key 拥有完全权限，切勿泄露或提交到 Git！

---

## 3. 配置认证提供商

### 3.1 Email 认证（已默认启用）

1. 进入 **Authentication** → **Providers**
2. 确认 **Email** 已启用
3. 配置 Email 模板（见第4节）

### 3.2 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 启用 **Google+ API**
4. 创建 OAuth 2.0 凭据：
   - **应用类型**: Web 应用
   - **授权重定向 URI**:
     - 开发环境: `http://localhost:3000/api/auth/callback`
     - 生产环境: `https://yourdomain.com/api/auth/callback`
     - Supabase 回调: `https://xxxxxx.supabase.co/auth/v1/callback`
5. 复制 **Client ID** 和 **Client Secret**
6. 在 Supabase Dashboard:
   - 进入 **Authentication** → **Providers** → **Google**
   - 启用 Google 提供商
   - 填入 Client ID 和 Client Secret
   - 保存

### 3.3 GitHub OAuth

1. 前往 [GitHub Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写信息：
   - **Application name**: vibetrans
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://xxxxxx.supabase.co/auth/v1/callback`
4. 创建后复制 **Client ID**，生成并复制 **Client Secret**
5. 在 Supabase Dashboard:
   - 进入 **Authentication** → **Providers** → **GitHub**
   - 启用 GitHub 提供商
   - 填入 Client ID 和 Client Secret
   - 保存

---

## 4. 配置 Email 模板

进入 **Authentication** → **Email Templates**，配置以下模板：

### 4.1 确认邮件（Confirm signup）

**Subject**: `Confirm Your Email for vibetrans`

**Body**:
```html
<h2>Welcome to vibetrans!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't sign up for vibetrans, you can safely ignore this email.</p>
```

### 4.2 密码重置（Reset Password）

**Subject**: `Reset Your Password for vibetrans`

**Body**:
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request a password reset, you can safely ignore this email.</p>
<p>This link will expire in 1 hour.</p>
```

### 4.3 Magic Link（可选）

**Subject**: `Your Magic Link for vibetrans`

**Body**:
```html
<h2>Sign in to vibetrans</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>This link will expire in 1 hour.</p>
```

---

## 5. 配置站点 URL

进入 **Authentication** → **URL Configuration**:

### 开发环境
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 添加
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

### 生产环境
- **Site URL**: `https://yourdomain.com`（替换为你的域名）
- **Redirect URLs**: 添加
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/**`

---

## 6. 数据库配置

### 6.1 创建用户触发器（Database Triggers）

进入 **SQL Editor**，执行以下 SQL：

```sql
-- 1. 新用户注册时赠送积分
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 插入初始积分记录（50积分注册奖励）
  INSERT INTO public.credits (user_id, amount, description)
  VALUES (
    NEW.id,
    50,
    'Registration bonus'
  );

  -- 订阅 newsletter（如果需要）
  INSERT INTO public.newsletter (email, subscribed_at)
  VALUES (
    NEW.email,
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 6.2 启用 Row Level Security (RLS)

执行以下 SQL 启用 RLS 策略：

```sql
-- 启用 RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Credits 策略：用户只能查看自己的积分
CREATE POLICY "Users can view their own credits"
  ON public.credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Generation History 策略：用户只能查看自己的生成历史
CREATE POLICY "Users can view their own generation history"
  ON public.generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- User Subscriptions 策略：用户只能查看自己的订阅
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 6.3 确认数据库表结构

确保以下表已存在（应该已通过 Drizzle migrations 创建）：

- `auth.users` - Supabase 内置表
- `public.credits` - 积分系统
- `public.generation_history` - 生成历史
- `public.user_subscriptions` - 订阅信息
- `public.newsletter` - 订阅列表

如未创建，运行本地迁移：
```bash
pnpm db:migrate
```

---

## 7. Cloudflare Pages 环境变量配置

部署到 Cloudflare Pages 后，在项目设置中添加环境变量：

### Production 环境
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 其他必需的环境变量
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
# ... 其他配置
```

### Preview 环境
可以使用相同配置，或创建独立的 Supabase 项目用于测试

---

## 8. 本地开发配置

1. 复制 `.env.supabase.example` 为 `.env.local`:
   ```bash
   cp .env.supabase.example .env.local
   ```

2. 填入从步骤2获取的值：
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. 启动开发服务器：
   ```bash
   pnpm dev
   ```

4. 访问 `http://localhost:3000` 测试登录功能

---

## 9. 验证清单

完成配置后，请验证以下功能：

- [ ] Email 登录/注册正常
- [ ] Email 验证邮件能收到
- [ ] 密码重置功能正常
- [ ] Google OAuth 登录正常（如启用）
- [ ] GitHub OAuth 登录正常（如启用）
- [ ] 新用户注册后自动获得50积分
- [ ] 用户 session 在刷新页面后保持
- [ ] 登出功能正常
- [ ] 受保护路由重定向到登录页

---

## 10. 常见问题

### Q: 登录后立即登出？
A: 检查 Site URL 是否正确配置，确保与应用域名一致

### Q: OAuth 回调失败？
A: 确认以下配置：
1. OAuth 提供商的回调 URL 包含 Supabase 回调地址
2. Supabase Redirect URLs 包含应用回调地址

### Q: 邮件发送失败？
A: Supabase 默认使用内置邮件服务（有限额），生产环境建议配置自定义 SMTP

### Q: Database connection issues?
A: 确认 DATABASE_URL 格式正确，使用 Supabase 提供的连接字符串

---

## 11. 下一步

配置完成后，执行以下步骤：

1. **本地测试**: `pnpm dev` 验证所有功能
2. **Edge Runtime 测试**: `pnpm preview:cf` 测试 Cloudflare 兼容性
3. **部署到 Cloudflare Pages**: `pnpm deploy:cf`
4. **配置生产环境变量**: 在 Cloudflare Pages 中添加所有环境变量
5. **绑定自定义域名**: 在 Cloudflare Pages 设置中配置域名

---

## 支持

如有问题，请查阅：
- [Supabase 官方文档](https://supabase.com/docs)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 项目 Issues

配置完成！🎉
