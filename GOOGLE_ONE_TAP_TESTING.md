# Google One Tap 登录测试文档

## 概述

本文档描述如何测试 Google One Tap 登录功能的完整流程。

## 前置条件

### 1. Google OAuth 配置

确保在 Google Cloud Console 中正确配置了 OAuth 2.0:

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建或选择现有项目
3. 启用 "Google Sign-In" API
4. 创建 OAuth 2.0 Client ID (Web application)
5. 添加授权的 JavaScript 来源:
   - `http://localhost:3000`
   - `https://你的生产域名.com`
6. 添加授权的重定向 URI:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://你的生产域名.com/api/auth/callback/google`

### 2. 环境变量配置

确保 `.env.local` 文件包含以下变量:

```bash
GOOGLE_CLIENT_ID=你的客户端ID
GOOGLE_CLIENT_SECRET=你的客户端密钥
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的客户端ID
DATABASE_URL=你的数据库连接字符串
BETTER_AUTH_SECRET=你的密钥
```

### 3. 数据库迁移

确保数据库已运行所有迁移:

```bash
pnpm db:migrate
```

## 测试步骤

### 步骤 1: 启动开发服务器

```bash
pnpm dev
```

服务器应该在 `http://localhost:3000` 启动。

### 步骤 2: 访问登录页面

1. 打开浏览器访问: `http://localhost:3000/auth/login`
2. 打开浏览器开发者工具 (F12)
   - 切换到 Console 面板查看日志
   - 切换到 Network 面板监控网络请求

### 步骤 3: 测试 Google One Tap 弹窗

**预期行为:**
- 页面加载后,右上角应该出现 Google One Tap 登录弹窗
- 弹窗应该显示你的 Google 账号(如果之前登录过)
- 弹窗应该有 "继续使用" 或 "Sign in with Google" 按钮

**检查点:**
- [ ] Google One Tap 弹窗是否正常显示
- [ ] Console 中是否有任何错误信息
- [ ] 如果弹窗没有显示,检查是否有 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 未配置的警告

### 步骤 4: 执行 One Tap 登录

1. 在 One Tap 弹窗中点击你的 Google 账号
2. 观察 Network 面板

**预期行为:**
- 应该看到一个 POST 请求到 `/api/auth/google-one-tap`
- 请求应该返回 200 状态码
- 响应应该包含:
  ```json
  {
    "success": true,
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "image": "...",
      "emailVerified": true
    },
    "session": {
      "id": "...",
      "token": "...",
      "expiresAt": "..."
    }
  }
  ```
- 页面应该自动跳转到 `/dashboard`
- 应该看到成功登录的 toast 提示

**检查点:**
- [ ] API 请求是否成功 (200)
- [ ] 是否自动跳转到 dashboard
- [ ] 是否显示成功提示
- [ ] Console 中是否有错误

### 步骤 5: 验证 Session

1. 打开浏览器开发者工具
2. 切换到 Application (Chrome) 或 Storage (Firefox) 面板
3. 查看 Cookies

**预期行为:**
- 应该看到名为 `better-auth.session_token` 的 cookie
- Cookie 属性应该为:
  - `HttpOnly`: ✓
  - `Secure`: ✓ (生产环境) / ✗ (开发环境)
  - `SameSite`: Lax
  - `Max-Age`: 604800 (7 天)

**检查点:**
- [ ] Session cookie 是否存在
- [ ] Cookie 属性是否正确

### 步骤 6: 验证数据库

使用数据库工具 (如 Drizzle Studio) 检查:

```bash
pnpm db:studio
```

**检查 user 表:**
- [ ] 是否创建了新用户记录
- [ ] `email` 字段是否正确
- [ ] `emailVerified` 是否为 `true`
- [ ] `name` 和 `image` 是否从 Google 获取

**检查 account 表:**
- [ ] 是否创建了 account 记录
- [ ] `providerId` 是否为 `google`
- [ ] `accountId` 是否为 Google 的 sub (用户唯一ID)
- [ ] `userId` 是否正确关联到 user 表

**检查 session 表:**
- [ ] 是否创建了 session 记录
- [ ] `userId` 是否正确
- [ ] `token` 是否与 cookie 中的值匹配
- [ ] `expiresAt` 是否设置为 7 天后

### 步骤 7: 测试已存在用户登录

1. 退出登录 (访问 `/api/auth/sign-out` 或点击退出按钮)
2. 再次访问 `/auth/login`
3. 使用相同的 Google 账号登录

**预期行为:**
- 应该成功登录
- 不应该创建新的 user 记录
- 应该更新现有 user 的信息 (如果有变化)
- 应该创建新的 session 记录

**检查点:**
- [ ] 登录成功
- [ ] user 表中没有重复记录
- [ ] session 表中有新的 session

### 步骤 8: 测试错误处理

**测试 1: 无效的 Client ID**

1. 暂时修改 `.env.local` 中的 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 为无效值
2. 重启开发服务器
3. 访问登录页面

**预期行为:**
- Google One Tap 不应该显示
- Console 中应该有警告信息

**测试 2: 后端验证失败**

这个需要模拟,通常在生产环境中不会发生。

### 步骤 9: 测试性能

**检查点:**
- [ ] One Tap 弹窗加载速度 (< 2秒)
- [ ] API 响应时间 (< 1秒)
- [ ] 页面跳转流畅度

### 步骤 10: 浏览器兼容性测试

测试以下浏览器:
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)
- [ ] 移动浏览器 (iOS Safari, Android Chrome)

## 常见问题排查

### 问题 1: Google One Tap 不显示

**可能原因:**
1. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 未配置
2. Google OAuth 配置错误
3. 浏览器阻止了弹窗
4. 用户已经登录

**解决方案:**
1. 检查环境变量
2. 检查 Google Cloud Console 配置
3. 检查浏览器设置
4. 确保用户已退出登录

### 问题 2: API 返回 400 或 500 错误

**可能原因:**
1. Google JWT token 无效
2. `GOOGLE_CLIENT_ID` 配置错误
3. 数据库连接失败

**解决方案:**
1. 检查 Network 面板查看详细错误
2. 检查服务器 Console 日志
3. 验证环境变量配置
4. 测试数据库连接

### 问题 3: 登录成功但没有跳转

**可能原因:**
1. 前端路由问题
2. JavaScript 错误

**解决方案:**
1. 检查浏览器 Console
2. 检查 `callbackUrl` 参数
3. 手动访问 `/dashboard` 查看是否已登录

## 测试检查清单

### 功能测试
- [ ] Google One Tap 弹窗正常显示
- [ ] 新用户可以成功登录
- [ ] 已存在用户可以成功登录
- [ ] 登录后正确跳转到 dashboard
- [ ] Session cookie 正确设置
- [ ] 用户信息正确保存到数据库
- [ ] 账号正确关联到 Google provider

### 安全测试
- [ ] JWT token 验证正常工作
- [ ] Session cookie 是 HttpOnly
- [ ] 生产环境 cookie 是 Secure
- [ ] 无法使用伪造的 token 登录

### 性能测试
- [ ] One Tap 加载时间 < 2秒
- [ ] API 响应时间 < 1秒
- [ ] 登录流程流畅

### 兼容性测试
- [ ] Chrome 浏览器正常
- [ ] Firefox 浏览器正常
- [ ] Safari 浏览器正常
- [ ] 移动浏览器正常

### 用户体验测试
- [ ] 成功提示清晰
- [ ] 错误提示有帮助
- [ ] 加载状态明显
- [ ] 整体流程直观

## 测试完成

如果所有测试都通过,Google One Tap 登录功能已经可以投入使用。

## 下一步

1. 配置生产环境的 Google OAuth
2. 更新 Google Cloud Console 的授权域名
3. 测试生产环境的登录流程
4. 监控登录成功率和错误日志
