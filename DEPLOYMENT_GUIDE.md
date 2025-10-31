# Vercel + Cloudflare DNS 部署指南

## 🚀 部署步骤

### 1. 准备工作
- ✅ 项目已配置完成
- ✅ 代码已推送到 GitHub
- ✅ vercel.json 配置已优化

### 2. Vercel 部署

#### 方法 1: 通过 Vercel Dashboard
1. 访问 [vercel.com](https://vercel.com)
2. 连接你的 GitHub 账户
3. 导入项目：`Jasonchen52011/vibetrans`
4. 选择 `main` 分支
5. 点击 "Deploy"

#### 方法 2: 通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

### 3. Cloudflare DNS 配置

#### 步骤 1：添加域名到 Cloudflare
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 添加你的域名（如 `vibetrans.com`）
3. 继续到步骤 2

#### 步骤 2：配置 DNS 记录
对于主域名 `vibetrans.com`：

1. **删除默认 DNS 记录**
   - 删除所有默认的 A 记录和 AAAA 记录

2. **添加 CNAME 记录**
   ```
   Type: CNAME
   Name: @ (或 vibetrans.com)
   Target: vibetrans.pages.dev
   TTL: Auto
   Proxy status: Proxied (橙色云朵图标)
   ```

3. **添加 WWW 子域名的 CNAME 记录**
   ```
   Type: CNAME
   Name: www
   Target: vibetrans.pages.dev
   TTL: Auto
   Proxy status: Proxied (橙色云朵图标)
   ```

#### 步骤 3：配置 SSL/TLS
1. 进入 SSL/TLS → Overview
2. 确保 SSL/TLS 加密模式为 **Full (strict)**
3. 等待证书自动生成

#### 步骤 4：配置 Page Rules
添加以下 Page Rules 优化性能：

**规则 1：强制 HTTPS**
```
URL Pattern: vibetrans.com/*
Settings: Always Use HTTPS
```

**规则 2：缓存静态资源**
```
URL Pattern: vibetrans.com/_next/static/*
Settings: Cache Level: Cache Everything
Edge Cache TTL: 1 year
Browser Cache TTL: 4 hours
```

**规则 3：压缩文件**
```
URL Pattern: vibetrans.com/*
Settings: Auto Minify: JavaScript, CSS, HTML
```

### 4. 环境变量配置

在 Vercel Dashboard 中设置以下环境变量：

```
NEXT_PUBLIC_VERCEL_ENV=production
NODE_ENV=production
```

### 5. 部署验证

#### 检查清单：
- [ ] 网站能正常访问
- [ ] HTTPS 证书正常工作
- [ ] 所有翻译器功能正常
- [ ] 页面加载速度良好
- [ ] DNS 传播完成

#### DNS 传播检查：
```bash
# 检查 DNS 记录
dig vibetrans.com +short
dig www.vibetrans.com +short

# 或使用在线工具
# https://www.whatsmydns.net/
# https://dnschecker.org/
```

## 🔧 故障排除

### 常见问题

#### 1. DNS 传播慢
- DNS 传播通常需要 24-48 小时
- 使用 `flushdns` 清除本地 DNS 缓存
- 检查 Cloudflare 的 DNS 状态

#### 2. SSL 证书问题
- 确保域名已正确添加到 Cloudflare
- 检查 CNAME 记录是否正确
- 等待证书自动签发（通常几分钟内）

#### 3. 部署失败
- 检查 `vercel.json` 配置
- 确认构建无错误：`pnpm build`
- 检查 Vercel 部署日志

#### 4. 功能问题
- 检查环境变量配置
- 查看 Vercel Functions 日志
- 确认 API 路由正常工作

## 📊 性能优化

### Cloudflare 优化设置

1. **Rocket Loader**：自动优化 JavaScript 和 CSS 加载
2. **Auto Minify**：自动压缩资源
3. **Brotli 压缩**：更好的压缩算法
4. **HTTP/3 (QUIC)**：现代网络协议
5. **Argo Smart Routing**：智能路由优化

### Vercel 优化设置

1. **Edge Functions**：全球部署
2. **Incremental Static Regeneration**：智能缓存
3. **Image Optimization**：自动图片优化
4. **Analytics**：性能监控

## 🎯 监控和维护

### 性能监控
- Vercel Analytics
- Cloudflare Analytics
- Google PageSpeed Insights

### 监控工具
```bash
# 检查 Vercel 部署状态
vercel ls

# 查看实时日志
vercel logs

# 查看项目指标
vercel inspect
```

## 📞 支持

如果在部署过程中遇到问题：

1. **Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
2. **Cloudflare 文档**: [developers.cloudflare.com](https://developers.cloudflare.com)
3. **GitHub Issues**: 在项目仓库提交 issue
4. **社区支持**: Vercel 和 Cloudflare 社区

---

**🎉 恭喜！你的项目现在已部署到 Vercel 并使用 Cloudflare DNS！**