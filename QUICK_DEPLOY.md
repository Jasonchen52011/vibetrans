# 快速部署指南

## 当前状态

✅ 代码已推送到 GitHub cloudflare 分支
✅ Cloudflare Pages 构建成功
❌ 运行时 HTTP 522 错误（缺少环境变量）

## 立即操作：配置最小环境变量

虽然应用可以在没有 Supabase 的情况下运行，但至少需要配置这些基本变量来防止崩溃：

### 方法：通过 Cloudflare Dashboard（5分钟）

1. **访问 Cloudflare Pages 设置**
   ```
   https://dash.cloudflare.com/c5e7ee5591bfeeaee016c9a14616498e/pages/view/vibetrans
   ```

2. **点击 Settings 标签**

3. **滚动到 "Environment variables" 部分**

4. **添加以下变量（点击 "Add variable"）**

   | Variable name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://placeholder.supabase.co` | Production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `placeholder-key-not-used` | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://vibetrans.pages.dev` | Production |

5. **保存后触发重新部署**
   - 方法A：在 Deployments 标签点击最新部署的 "Retry deployment"
   - 方法B：推送一个新 commit

### 为什么需要这些？

- 虽然代码会检测到 placeholder 并跳过 Supabase 功能
- 但 Next.js 在构建时可能会访问这些环境变量
- 设置为 placeholder 值可以防止构建/运行时错误

## 验证部署

配置环境变量并重新部署后：

```bash
curl -I https://vibetrans.pages.dev
```

应该返回 `HTTP/2 200` 而不是 `HTTP/2 522`

然后访问：
- https://vibetrans.pages.dev - 首页
- https://vibetrans.pages.dev/dog-translator - 狗语翻译器
- https://vibetrans.pages.dev/pricing - 定价页面

## 功能说明

### ✅ 可用功能（无需 Supabase）
- 首页
- 狗语翻译器
- 定价页面展示
- 博客列表
- 文档浏览

### ⚠️ 受限功能（需要 Supabase）
- 用户登录/注册
- 用户 Dashboard
- 支付功能
- 需要认证的页面

### ❌ 不可用功能（需要其他 API）
- AI 图片生成（需要 OpenAI/Replicate API）
- 视频生成（需要 Luma/Kling API）
- 支付（需要 Stripe API）

## 后续步骤

### 如果只测试基本功能
- 保持当前配置即可
- 所有公开页面都能正常访问

### 如果需要启用认证功能
1. 创建 Supabase 项目
2. 替换 placeholder 环境变量为真实值
3. 在 Supabase 中配置 redirect URLs

### 如果需要启用 AI 功能
1. 获取 OpenAI/Replicate API keys
2. 在 Cloudflare Pages 中添加相应环境变量

## 环境变量完整列表

完整的环境变量列表请参考 `DEPLOYMENT_TROUBLESHOOTING.md`

---

**最后更新**: 2025-10-07
**部署 URL**: https://vibetrans.pages.dev
