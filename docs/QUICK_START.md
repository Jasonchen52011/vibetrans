# 🎨 Article Illustrator - 快速使用指南

## 🎯 功能概述

**Article Illustrator** 是一个自动化的文章配图工具，可以为你的工具页面生成 7 张风格统一的几何扁平风配图。

- ✅ **AI 驱动**: Gemini 分析内容，Volcano Engine 生成图片
- ✅ **风格统一**: 天蓝色主色调，几何扁平风格
- ✅ **自动优化**: WebP 格式，800x600，~90KB
- ✅ **全自动化**: 一键生成 7 张配图

---

## 🚀 快速开始（3 步）

### 第 1 步：准备你的文章内容

```typescript
const sections = {
  toolName: 'your-tool-name',  // 你的工具名称

  // 1 张图 - What is Section
  whatIs: {
    title: 'What is Your Tool',
    content: '你的工具介绍内容...',
  },

  // 2 张图 - Fun Facts
  funFacts: [
    { title: 'Fun Fact 1', content: '趣味事实 1...' },
    { title: 'Fun Fact 2', content: '趣味事实 2...' },
  ],

  // 4 张图 - User Interests
  userInterests: [
    { title: 'Feature 1', content: '功能特性 1...' },
    { title: 'Feature 2', content: '功能特性 2...' },
    { title: 'Feature 3', content: '功能特性 3...' },
    { title: 'Feature 4', content: '功能特性 4...' },
  ],
};
```

### 第 2 步：调用工具生成

```typescript
import { generateArticleIllustrations } from '@/lib/article-illustrator/workflow';

const result = await generateArticleIllustrations(sections);
```

### 第 3 步：使用生成的图片

```typescript
// 查看结果
console.log(`✅ 成功生成: ${result.successfulImages}/7 张图片`);
console.log(`⏱️  耗时: ${result.totalTimeMs / 1000}秒`);

// 生成的图片在
result.images.forEach(img => {
  console.log(`${img.filename} - ${img.size}KB`);
});
```

---

## 📝 完整示例

以下是 Esperanto Translator 的完整示例：

```typescript
import { generateArticleIllustrations } from '@/lib/article-illustrator/workflow';

const esperantoSections = {
  toolName: 'esperanto-translator',

  whatIs: {
    title: 'What is Esperanto Translator',
    content: `The Esperanto Translator is a powerful tool that converts
    text between English and Esperanto, the international auxiliary language.
    It supports text, voice, and document uploads.`,
  },

  funFacts: [
    {
      title: 'Esperanto on the Voyager Golden Record',
      content: `NASA sent Esperanto greetings on the Voyager Golden Record
      into deep space, representing humanity to potential extraterrestrial
      civilizations.`,
    },
    {
      title: 'Esperanto Literature and Culture',
      content: `Esperanto has over 25,000 published books, including original
      works and translations of classics like Hamlet and the Bible.`,
    },
  ],

  userInterests: [
    {
      title: 'User-Friendly Interface',
      content: `Intuitive, clean interface designed for ease of use across
      all devices.`,
    },
    {
      title: 'Instant Translation',
      content: `Lightning-fast translation powered by advanced AI models with
      real-time processing.`,
    },
    {
      title: 'Multilingual Support',
      content: `Context understanding from multiple languages with intelligent
      cultural adaptation.`,
    },
    {
      title: 'Voice Input and Output',
      content: `Voice recognition and text-to-speech for comprehensive audio
      assistance.`,
    },
  ],
};

// 生成配图
const result = await generateArticleIllustrations(esperantoSections);

// 输出结果
if (result.success) {
  console.log('🎉 所有图片生成成功！');
  console.log(`📁 保存位置: public/images/docs/`);
  console.log(`⏱️  总耗时: ${(result.totalTimeMs / 1000 / 60).toFixed(2)} 分钟`);
}
```

---

## 🎨 生成的图片风格

所有图片都符合以下风格要求：

### 视觉风格
- **几何扁平风** (Geometric Flat Style)
- **天蓝色主色调** (#87CEEB)
- **柔和配色** (粉色、黄色、薄荷绿作为点缀)
- **极简构图** (圆形、矩形、三角形等简单几何图形)

### 技术规格
- **格式**: WebP
- **尺寸**: 800x600 px
- **比例**: 4:3
- **大小**: ~90KB (85-95KB)

### 设计特点
- ✅ 无文字、无 Logo
- ✅ 欢快友好的氛围
- ✅ 现代简洁的风格
- ✅ 保留英文标题关键词的视觉元素

---

## ⏱️ 时间预算

| 步骤 | 时间 |
|------|------|
| Gemini 分析（7次） | ~15-20 秒 |
| Volcano 生图（7张） | ~15-20 分钟 |
| WebP 转换（7张） | ~10-15 秒 |
| **总计** | **~15-25 分钟** |

💡 **提示**: 建议在后台运行或异步处理

---

## 💰 费用估算

| API | 用量 | 估算费用 |
|-----|------|---------|
| Gemini API | 7 次请求 | 很少（免费额度内）|
| Volcano Engine | 7 张图片 | ~140 credits |

---

## 🔧 环境变量配置

确保你的 `.env.local` 包含：

```bash
# Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Volcano Engine API
VOLC_ACCESS_KEY=your_access_key
VOLC_SECRET_KEY=your_secret_key
VOLC_T2I_REQ_KEY=general_v20
```

---

## 🧪 测试命令

### 快速测试（只生成提示词）
```bash
GOOGLE_GENERATIVE_AI_API_KEY=xxx npx tsx tests/test-quick-prompts.ts
```
⏱️ 耗时: ~20 秒

### 完整测试（生成所有图片）
```bash
npx tsx tests/test-e2e-article-illustrator.ts
```
⏱️ 耗时: ~15-25 分钟

---

## 📂 生成的文件结构

```
public/images/docs/
├── what-your-tool.webp              # What is Section
├── your-tool-feature-1.webp         # Fun Fact 1
├── your-tool-feature-2.webp         # Fun Fact 2
├── your-feature-1.webp              # User Interest 1
├── your-feature-2.webp              # User Interest 2
├── your-feature-3.webp              # User Interest 3
└── your-feature-4.webp              # User Interest 4
```

---

## ❓ 常见问题

### Q: 可以修改图片风格吗？
A: 可以，编辑 `gemini-analyzer.ts` 中的提示词模板即可。

### Q: 生成失败怎么办？
A: 工具会自动跳过失败的图片并继续处理其他图片，最后会给出详细的错误报告。

### Q: 可以只生成部分图片吗？
A: 可以，修改输入的 sections 数据结构即可。

### Q: 图片可以重新生成吗？
A: 可以，重新运行即可覆盖已有文件。

---

## 📚 更多文档

- 📖 [完整使用文档](./ARTICLE_ILLUSTRATOR.md)
- 📊 [实现总结](./IMPLEMENTATION_SUMMARY.md)
- 🎉 [项目完成报告](./PROJECT_COMPLETION_REPORT.md)

---

**🎨 开始创作你的配图吧！**
