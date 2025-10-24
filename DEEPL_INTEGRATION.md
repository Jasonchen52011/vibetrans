# DeepL API 集成指南

## 概述
已成功将 English to Polish Translator 从固定词汇映射替换为 DeepL API，提供高质量的自然翻译。

## 功能特性

### ✅ 已实现功能
- **高质量翻译**: 使用 DeepL API 提供专业级翻译
- **错误处理**: 完善的错误处理和备用机制
- **文本长度限制**: 支持最多 5000 字符（DeepL 免费版限制）
- **备用方案**: API 失败时返回原文并显示友好错误信息
- **性能优化**: Edge Runtime 支持快速响应

### 🔧 API 端点
```
POST /api/english-to-polish-translator
```

### 📝 请求格式
```json
{
  "text": "Hello, how are you today?"
}
```

### 📤 响应格式
```json
{
  "translated": "Cześć, jak masz się dzisiaj?",
  "original": "Hello, how are you today?",
  "language": "Polish",
  "direction": "English to Polish",
  "provider": "DeepL"
}
```

## 配置 DeepL API

### 1. 获取 DeepL API 密钥

#### DeepL 免费版 (推荐用于开发测试)
- 访问: https://www.deepl.com/pro-api
- 注册免费账户
- 每月限制: 500,000 字符
- 支持语言对: 包括英语到波兰语

#### DeepL Pro 版 (推荐用于生产环境)
- 更高的字符限制
- 更快的响应速度
- 更好的支持服务

### 2. 配置环境变量

在 `.env.local` 文件中添加：
```env
# -----------------------------------------------------------------------------
# DeepL API for Translation Services
# Get from: https://www.deepl.com/pro-api
# -----------------------------------------------------------------------------
DEEPL_API_KEY=your-actual-deepl-api-key-here
```

### 3. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

## API 限制和说明

### DeepL 免费版限制
- **字符限制**: 每月 500,000 字符
- **文本长度**: 单次请求最多 5,000 字符
- **请求频率**: 无官方限制，但建议合理使用

### 支持的语言对
- **源语言**: EN (英语)
- **目标语言**: PL (波兰语)

## 错误处理

### 常见错误及解决方案

1. **API 密钥未配置**
   ```json
   {
     "error": "Translation service temporarily unavailable. Showing original text."
   }
   ```
   解决方案: 配置正确的 DEEPL_API_KEY

2. **文本过长**
   ```json
   {
     "error": "Text too long. Maximum 5000 characters allowed."
   }
   ```
   解决方案: 分段处理长文本

3. **API 限额 exceeded**
   ```json
   {
     "error": "Translation failed. Please try again."
   }
   ```
   解决方案: 等待配额重置或升级到 Pro 版本

## 测试 API

### 测试请求示例
```bash
curl -X POST http://localhost:3000/api/english-to-polish-translator \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you today? I need to book a hotel room."}'
```

### 预期响应
```json
{
  "translated": "Cześć, jak masz się dzisiaj? Muszę zarezerwować pokój hotelowy.",
  "original": "Hello, how are you today? I need to book a hotel room.",
  "language": "Polish",
  "direction": "English to Polish",
  "provider": "DeepL"
}
```

## 生产环境建议

1. **监控使用量**: 定期检查 API 使用情况
2. **缓存策略**: 对重复翻译内容实施缓存
3. **错误重试**: 实现指数退避重试机制
4. **备用方案**: 准备多个翻译 API 作为备用
5. **成本控制**: 监控 API 调用成本

## 安全考虑

- ✅ API 密钥安全存储在环境变量中
- ✅ 错误信息不暴露敏感信息
- ✅ 输入验证和长度限制
- ✅ 请求日志记录便于调试

## 对比原来的固定词汇映射

| 方面 | 固定词汇映射 | DeepL API |
|------|-------------|-----------|
| 翻译质量 | 基础、机械 | 专业、自然 |
| 词汇量 | 200+ 词汇 | 数百万词汇 |
| 语法处理 | 简单替换 | 完整语法分析 |
| 上下文理解 | 无 | 优秀的上下文理解 |
| 维护成本 | 高 (需手动添加词汇) | 低 (API 自动更新) |
| 响应速度 | 极快 | 快速 (网络延迟) |

## 下一步扩展

1. **多语言支持**: 扩展到其他语言对
2. **批量翻译**: 支持多个文本同时翻译
3. **翻译历史**: 保存用户翻译历史
4. **语言检测**: 自动检测源语言
5. **翻译质量评分**: 提供翻译质量指标

---

**状态**: ✅ DeepL API 集成完成，等待配置真实 API 密钥进行生产测试。