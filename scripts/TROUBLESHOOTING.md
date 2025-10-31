
# Cloudflare Pages 3MB限制故障排除指南

## 🚨 如果部署时仍然遇到3MB错误：

### 立即解决方案：
1. 使用优化部署脚本：
   ```bash
   chmod +x scripts/deploy-optimized.sh
   ./scripts/deploy-optimized.sh
   ```

2. 手动清理Cloudflare缓存：
   ```bash
   wrangler cache purge --url=https://your-domain.com/*
   ```

### 深度问题排查：

#### 1. 检查实际部署的文件大小：
```bash
# 查看部署输出中最大的文件
find .vercel/output/static/_next/static/chunks -name "*.js" -exec ls -lh {} ; | sort -k5 -hr | head -5
```

#### 2. 检查是否有隐藏的大文件：
```bash
# 查找所有大于1MB的文件
find .vercel -type f -size +1M -exec ls -lh {} ;
```

#### 3. 使用wrangler详细日志：
```bash
WRANGLER_LOG=debug pnpm deploy:cf
```

### 长期解决方案：
1. 考虑将翻译器配置移到Cloudflare KV
2. 使用动态导入分割大型配置
3. 启用Cloudflare的Brotli压缩
4. 考虑升级到更高配置的Cloudflare计划

### 紧急备用方案：
如果问题持续，可以：
1. 暂时禁用部分翻译器功能
2. 使用更轻量级的配置
3. 分阶段部署功能
