# 🚀 Cloudflare Pages 部署检查清单

## 📋 部署前准备

### ✅ 代码准备
- [x] 已删除非video的AI功能（image、dog-translator）
- [x] 已删除dashboard和admin页面
- [x] 所有API路由配置为Edge Runtime
- [x] `pnpm dev` 测试通过
- [x] `pnpm build` 构建成功
- [x] Bundle大小符合25MB限制

### ✅ 环境变量准备

**必需（核心功能）**
- [ ] `NEXT_PUBLIC_BASE_URL` - 你的域名
- [ ] `DATABASE_URL` - PostgreSQL连接字符串
- [ ] `BETTER_AUTH_SECRET` - Auth密钥（运行 `openssl rand -base64 32`）
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API密钥（视频生成）

**必需（认证功能，至少配置一个）**
- [ ] GitHub OAuth: `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
- [ ] Google OAuth: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**必需（支付功能）**
- [ ] `STRIPE_SECRET_KEY` - Stripe密钥
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe Webhook密钥
- [ ] 7个Stripe价格ID（PRO_MONTHLY/YEARLY、LIFETIME、4个CREDITS包）

**推荐（邮件和存储）**
- [ ] `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` - 邮件服务
- [ ] Cloudflare R2配置（6个变量）- 文件存储

**可选**
- [ ] 分析服务（Google Analytics等）
- [ ] Cloudflare Turnstile（防spam）
- [ ] Crisp客服聊天

### ✅ 第三方服务配置

**数据库**
- [ ] PostgreSQL数据库已创建（推荐Supabase）
- [ ] 数据库表已迁移（运行 `pnpm db:migrate`）
- [ ] 数据库允许外部连接

**Stripe**
- [ ] Stripe账号已创建
- [ ] 产品和价格已配置
  - [ ] Pro订阅（月付/年付）
  - [ ] Lifetime一次性付款
  - [ ] 4个积分包（Basic/Standard/Premium/Enterprise）
- [ ] Webhook端点已添加（稍后配置）

**Google Cloud**
- [ ] Gemini API已启用
- [ ] API密钥已创建
- [ ] 计费账号已绑定（Veo 3收费）

**OAuth提供商**
- [ ] GitHub App已创建（或）
- [ ] Google OAuth Client已创建
- [ ] 回调URL稍后配置

**Cloudflare R2 (推荐)**
- [ ] R2 Bucket已创建
- [ ] API Token已生成
- [ ] 公共访问域名已配置（可选）

**Resend**
- [ ] Resend账号已创建
- [ ] API密钥已生成
- [ ] 发信域名已验证（可选）

---

## 🚀 Cloudflare Pages 部署步骤

### 方式一：Dashboard部署（推荐）

1. **连接仓库**
   - [ ] 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - [ ] Workers & Pages → Create application → Pages
   - [ ] Connect to Git → 选择仓库

2. **构建配置**
   - [ ] Framework preset: `Next.js`
   - [ ] Build command: `pnpm build`
   - [ ] Build output: `.next`
   - [ ] Node version: `20` (或更高)

3. **环境变量**
   - [ ] 复制 `.env.cloudflare.example` 的内容
   - [ ] 在 Settings → Environment variables 中逐个添加
   - [ ] Production 和 Preview 环境都要配置

4. **首次部署**
   - [ ] 点击 "Save and Deploy"
   - [ ] 等待构建完成（3-5分钟）
   - [ ] 检查部署日志是否有错误

### 方式二：CLI部署

```bash
# 1. 安装依赖
pnpm install

# 2. 登录Cloudflare
npx wrangler login

# 3. 配置wrangler.toml（已完成）

# 4. 部署
pnpm run deploy:cf
```

---

## ⚙️ 部署后配置

### 1. 自定义域名
- [ ] Pages → Custom domains → Add domain
- [ ] DNS记录已添加（CNAME或A记录）
- [ ] SSL证书已生效（自动，等待几分钟）

### 2. Stripe Webhook
- [ ] 登录 [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/stripe`
- [ ] 选择事件:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] 复制Webhook签名密钥
- [ ] 更新Cloudflare环境变量 `STRIPE_WEBHOOK_SECRET`
- [ ] 重新部署

### 3. OAuth回调URL

**GitHub**
- [ ] GitHub App → Settings
- [ ] Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
- [ ] Save

**Google**
- [ ] Google Cloud Console → APIs & Services → Credentials
- [ ] OAuth 2.0 Client → Authorized redirect URIs
- [ ] 添加: `https://your-domain.com/api/auth/callback/google`
- [ ] Save

### 4. 更新环境变量
- [ ] 将 `NEXT_PUBLIC_BASE_URL` 更新为自定义域名
- [ ] Cloudflare Pages → Deployments → Redeploy

---

## 🧪 功能测试清单

### 基础功能
- [ ] 首页加载正常
- [ ] 导航菜单工作正常
- [ ] 响应式布局正确

### 认证功能
- [ ] 邮箱注册 → 收到确认邮件 → 激活账号
- [ ] 邮箱登录
- [ ] GitHub OAuth登录（如已配置）
- [ ] Google OAuth登录（如已配置）
- [ ] 忘记密码 → 收到重置邮件 → 重置成功
- [ ] 退出登录

### Video生成功能
- [ ] `/video` 页面加载
- [ ] 积分余额显示正确
- [ ] 文字生成视频功能
  - [ ] 输入提示词
  - [ ] 消耗600积分
  - [ ] 异步生成任务创建
  - [ ] 轮询状态更新
  - [ ] 视频生成成功并显示
- [ ] 图片转视频功能
  - [ ] 上传图片
  - [ ] 输入运动描述
  - [ ] 视频生成流程完整

### 支付功能
- [ ] 定价页面 `/pricing` 显示正确
- [ ] Pro订阅（月付）
  - [ ] 点击购买 → 跳转Stripe
  - [ ] 完成支付（测试模式用测试卡）
  - [ ] 回调成功
  - [ ] 订阅状态更新
- [ ] Pro订阅（年付）
- [ ] Lifetime购买
- [ ] 积分购买
  - [ ] 选择积分包
  - [ ] 支付成功
  - [ ] 积分余额立即更新

### 设置页面
- [ ] 个人资料 `/settings/profile`
  - [ ] 更新用户名
  - [ ] 上传头像
- [ ] 订阅管理 `/settings/billing`
  - [ ] 显示当前订阅计划
  - [ ] Stripe客户门户链接可用
- [ ] 积分管理 `/settings/credits`
  - [ ] 积分余额显示
  - [ ] 交易历史加载
  - [ ] 购买积分按钮可用
- [ ] 安全设置 `/settings/security`
  - [ ] 修改密码
- [ ] 通知设置 `/settings/notifications`
  - [ ] 偏好设置保存

### 数据持久化
- [ ] 用户数据保存到数据库
- [ ] 积分交易记录正确
- [ ] 视频生成历史可查询
- [ ] 订阅状态同步

---

## 📊 性能和监控

### 性能检查
- [ ] 首屏加载时间 < 3秒
- [ ] Lighthouse分数 > 80
- [ ] Core Web Vitals 良好
- [ ] API响应时间 < 1秒

### 监控设置
- [ ] Cloudflare Analytics已启用
- [ ] 错误日志监控
- [ ] 自定义报警（可选）

### 日志查看
```bash
# 实时日志
npx wrangler pages deployment tail

# 或在Dashboard
Pages → Deployments → [选择] → Logs
```

---

## 🐛 常见问题排查

### 部署失败
- [ ] 检查构建日志中的错误
- [ ] 确认 `package.json` 依赖完整
- [ ] Node版本 >= 20

### 页面500错误
- [ ] 检查环境变量是否配置完整
- [ ] 查看Cloudflare日志
- [ ] 确认数据库连接正常

### Video生成失败
- [ ] 检查 `GOOGLE_GENERATIVE_AI_API_KEY` 是否有效
- [ ] 确认Google Cloud计费已启用
- [ ] 查看API日志中的具体错误

### 支付回调失败
- [ ] 检查 `STRIPE_WEBHOOK_SECRET` 是否正确
- [ ] 确认Webhook URL可访问
- [ ] 查看Stripe Dashboard中的Webhook日志

### 邮件发送失败
- [ ] 检查 `RESEND_API_KEY` 是否有效
- [ ] 确认发信域名已验证
- [ ] 检查Resend Dashboard中的日志

---

## ✅ 最终检查

部署成功后，完成以下验证：

- [ ] 所有测试用例通过
- [ ] 生产环境变量已配置
- [ ] 自定义域名已绑定
- [ ] SSL证书已生效
- [ ] Stripe Webhook已配置
- [ ] OAuth回调URL已更新
- [ ] 监控和报警已设置

## 🎉 恭喜！

你的Video生成应用已成功部署到Cloudflare Pages！

**下一步**：
1. 发布公告
2. 邀请测试用户
3. 监控性能和错误
4. 收集用户反馈
5. 持续优化

---

**需要帮助？**
- 查看 `CLOUDFLARE_DEPLOYMENT.md` 详细文档
- 提交 GitHub Issue
- 联系技术支持
