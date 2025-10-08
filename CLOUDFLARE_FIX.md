# ✅ Cloudflare Pages 25MB限制问题修复

## 问题描述

之前部署时遇到错误：
```
✘ [ERROR] Error: Pages only supports files up to 25 MiB in size
.next/cache/webpack/edge-server-production/1.pack is 188 MiB in size
```

## 根本原因

`.next/cache/` 目录（webpack构建缓存）被错误地包含在Cloudflare Pages部署中。

## 解决方案

### 1. 更新 `wrangler.toml`

添加了 `pages_build_output_dir` 配置：

```toml
name = "vibetrans"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# Cloudflare Pages 构建输出目录
pages_build_output_dir = ".vercel/output/static"

[env.production]
name = "vibetrans-prod"

[env.preview]
name = "vibetrans-preview"
```

### 2. 创建 `.vercelignore`

排除不需要部署的文件：

```
# Next.js 缓存 (最重要！)
.next/cache/
.next/trace

# 构建临时文件
.next/standalone/node_modules/.cache
.next/standalone/.next/cache

# 开发文件
node_modules/
.git/
...
```

### 3. 清理并重新构建

```bash
# 清理旧的构建缓存
rm -rf .next .vercel

# 重新构建 Cloudflare 版本
pnpm run build:cf
```

## 验证结果

✅ **构建成功**
- 总输出大小: 49MB
- 无超过25MB的单个文件
- Middleware: 1个
- Edge Routes: 32个
- Static Assets: 275个

✅ **构建时间**
- Next.js构建: 41秒
- @cloudflare/next-on-pages: 17.29秒
- 总计: ~58秒

## 重新部署步骤

### 方式一：通过CLI

```bash
# 已修复配置，直接部署
pnpm run deploy:cf
```

### 方式二：通过Dashboard

1. 推送代码到GitHub（包含修复）
2. Cloudflare Pages会自动重新构建
3. 或手动触发重新部署

## 文件清单

**已修改**:
- ✅ `wrangler.toml` - 添加输出目录配置
- ✅ `.vercelignore` - 新建，排除缓存文件

**已清理**:
- ✅ `.next/cache/` - 删除webpack缓存
- ✅ `.vercel/` - 删除旧构建

**重新生成**:
- ✅ `.vercel/output/static/` - Cloudflare Pages输出（49MB）

## 预防措施

1. **本地开发**：定期清理缓存
   ```bash
   rm -rf .next .vercel
   ```

2. **CI/CD**：确保每次构建前清理
   ```yaml
   # GitHub Actions 示例
   - name: Clean cache
     run: rm -rf .next .vercel

   - name: Build for Cloudflare
     run: pnpm run build:cf
   ```

3. **Git**: 确保 `.gitignore` 包含：
   ```
   /.next/
   .vercel
   ```

## 常见问题

### Q: 为什么会包含 .next/cache/?

**A**: `@cloudflare/next-on-pages` 默认会复制整个 `.next` 目录，需要通过 `.vercelignore` 排除缓存。

### Q: `.vercelignore` 和 `.gitignore` 有什么区别?

**A**:
- `.gitignore`: 控制Git提交
- `.vercelignore`: 控制Vercel/Cloudflare部署时包含的文件

### Q: 每次都要清理缓存吗？

**A**: 本地开发不需要，但部署前建议清理一次确保干净的构建。

## 性能优化建议

构建输出已经很优化（49MB），但如果需要进一步减小：

1. **代码分割**
   ```typescript
   // 动态导入非关键组件
   const HeavyComponent = dynamic(() => import('./HeavyComponent'))
   ```

2. **移除未使用的依赖**
   ```bash
   pnpm prune
   ```

3. **优化图片**
   ```typescript
   // 使用 Next.js Image优化
   <Image src="..." width={800} height={600} />
   ```

## 总结

✅ **问题已解决**
- 配置已更新
- 构建已验证
- 可立即部署

✅ **下一步**
1. 推送代码到GitHub
2. 部署到Cloudflare Pages
3. 验证功能正常

---

**修复时间**: 2025-10-08
**状态**: ✅ 已解决，可部署
