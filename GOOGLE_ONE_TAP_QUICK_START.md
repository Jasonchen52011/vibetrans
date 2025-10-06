# Google One Tap 快速开始指南

## 🚀 5 分钟快速配置

### 步骤 1: Google Cloud Console 配置 (2分钟)

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

2. 创建 OAuth 2.0 Client ID:
   ```
   应用类型: Web application
   名称: Your App Name

   授权的 JavaScript 来源:
   - http://localhost:3000
   - http://localhost:3002
   - https://your-domain.com (生产)

   授权的重定向 URI:
   - http://localhost:3000/api/auth/callback/google
   - http://localhost:3002/api/auth/callback/google
   - https://your-domain.com/api/auth/callback/google (生产)
   ```

3. 复制 **Client ID** 和 **Client Secret**

### 步骤 2: 环境变量配置 (1分钟)

打开 `.env.local` 并确保包含:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=你的_CLIENT_ID
GOOGLE_CLIENT_SECRET=你的_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的_CLIENT_ID

# 数据库
DATABASE_URL=你的数据库连接字符串

# Better Auth Secret
BETTER_AUTH_SECRET=你的密钥
```

### 步骤 3: 启动应用 (1分钟)

```bash
# 运行数据库迁移
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

### 步骤 4: 测试登录 (1分钟)

1. 访问 http://localhost:3000/auth/login
2. 应该看到 Google One Tap 弹窗
3. 点击你的 Google 账号
4. 成功跳转到 dashboard

## ✅ 验证成功

检查以下内容确认配置成功:

- [ ] 访问登录页面时看到 Google One Tap 弹窗
- [ ] 点击 Google 账号可以登录
- [ ] 登录后跳转到 `/dashboard`
- [ ] 浏览器 Cookie 中有 `better-auth.session_token`
- [ ] 数据库中创建了用户记录

## 🐛 常见问题

### 问题 1: Google One Tap 不显示

**检查**:
1. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是否配置
2. Google Cloud Console 的 JavaScript 来源是否包含当前域名
3. 浏览器 Console 是否有错误

**解决**:
```bash
# 检查环境变量
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID

# 重启服务器
pnpm dev
```

### 问题 2: 登录后报错

**检查**:
1. 数据库连接是否正常
2. `GOOGLE_CLIENT_SECRET` 是否正确
3. 服务器 Console 是否有错误日志

**解决**:
```bash
# 测试数据库连接
pnpm db:studio

# 查看服务器日志
# 检查终端中的错误信息
```

### 问题 3: API 返回 500 错误

**检查**:
1. Google Client ID 和 Secret 是否匹配
2. 数据库表是否正确创建

**解决**:
```bash
# 重新运行迁移
pnpm db:migrate

# 检查数据库表
pnpm db:studio
```

## 📚 更多文档

- 详细测试指南: `GOOGLE_ONE_TAP_TESTING.md`
- 实施总结: `GOOGLE_ONE_TAP_IMPLEMENTATION_SUMMARY.md`
- 测试用例: `tests/google-one-tap.test.ts`

## 🎯 下一步

配置成功后,你可以:

1. **自定义回调 URL**:
   ```tsx
   <GoogleOneTap callbackUrl="/custom-dashboard" />
   ```

2. **自定义 auto_select**:
   ```tsx
   <GoogleOneTap autoSelect={false} />
   ```

3. **监控登录事件**:
   - 查看 Network 面板
   - 检查数据库记录
   - 监控服务器日志

4. **准备生产环境**:
   - 配置生产域名
   - 更新 Google OAuth 设置
   - 测试生产环境登录

## 💡 最佳实践

1. **开发环境**: 使用测试 Google 账号
2. **生产环境**: 使用独立的 OAuth 凭据
3. **密钥管理**: 不要将 Client Secret 提交到代码库
4. **监控**: 监控登录成功率和错误日志

---

🎉 现在你已经成功配置 Google One Tap 登录!
