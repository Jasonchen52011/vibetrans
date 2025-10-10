# Article Illustrator - 文章配图工具

自动为文章 sections 生成天蓝色几何扁平风格的配图。

## 功能特性

- ✅ **AI 提示词生成**: 使用 Gemini 2.0 Flash 分析文章内容，生成精准的图像提示词
- ✅ **高质量生图**: Volcano Engine SeedEdit 3.0 生成几何扁平风格插图
- ✅ **自动优化**: Sharp 转换为 WebP 格式 (800x600, 4:3, ~90KB)
- ✅ **风格统一**: 天蓝色主色调，柔和欢快，无文字/Logo
- ✅ **智能命名**: 根据图片内容自动生成语义化文件名

## 技术架构

```
用户输入文章 sections
    ↓
Gemini 分析 → 生成提示词 (7个)
    ↓
Volcano Engine → 生图 (1328x1328)
    ↓
Sharp → WebP 优化 (800x600, ~90KB)
    ↓
保存到 /public/images/docs/
```

## 支持的 Sections

| Section | 数量 | 说明 |
|---------|------|------|
| What is | 1 张 | 工具介绍/定义 |
| Fun Facts | 2 张 | 趣味事实 |
| User Interests | 4 张 | 用户兴趣点 |
| **总计** | **7 张** | - |

## 快速开始

### 1. 环境变量

确保 `.env.local` 包含以下 API keys:

```bash
# Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Volcano Engine API
VOLC_ACCESS_KEY=your_access_key
VOLC_SECRET_KEY=your_secret_key
VOLC_T2I_REQ_KEY=general_v20  # Text-to-Image 模型
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 运行测试

#### 节点测试

```bash
# 测试 Gemini 提示词生成
GOOGLE_GENERATIVE_AI_API_KEY=xxx npx tsx tests/test-gemini-analyzer.ts

# 测试 WebP 转换
npx tsx tests/test-webp-converter.ts
```

#### 端到端测试 (完整流程)

```bash
# ⚠️  警告: 需要 15-25 分钟，会调用所有 API 并生成真实图片
npx tsx tests/test-e2e-article-illustrator.ts
```

## 使用示例

### 代码示例

```typescript
import { generateArticleIllustrations } from '@/lib/article-illustrator/workflow';
import type { ArticleSections } from '@/lib/article-illustrator/types';

const sections: ArticleSections = {
  toolName: 'esperanto-translator',
  whatIs: {
    title: 'What is Esperanto Translator',
    content: '...',
  },
  funFacts: [
    { title: 'Fun Fact 1', content: '...' },
    { title: 'Fun Fact 2', content: '...' },
  ],
  userInterests: [
    { title: 'User Interest 1', content: '...' },
    { title: 'User Interest 2', content: '...' },
    { title: 'User Interest 3', content: '...' },
    { title: 'User Interest 4', content: '...' },
  ],
};

const result = await generateArticleIllustrations(sections);

console.log(`✅ 成功生成 ${result.successfulImages}/7 张图片`);
console.log(`⏱️  耗时: ${result.totalTimeMs / 1000}秒`);
```

### 生成的文件

```
public/images/docs/
├── language-translation.webp      (89 KB) - What is
├── golden-record.webp            (91 KB) - Fun Fact 1
├── literature-books.webp         (88 KB) - Fun Fact 2
├── user-friendly.webp            (87 KB) - User Interest 1
├── instant-translation.webp      (92 KB) - User Interest 2
├── multilingual-support.webp     (90 KB) - User Interest 3
└── voice-features.webp           (89 KB) - User Interest 4
```

## 提示词生成规则

### Gemini 提示词模板要求

1. **风格**: Geometric Flat Style (几何扁平风)
2. **色调**: Sky blue (#87CEEB) 主色，柔和 pastel 配色
3. **构图**: 4:3 横向，居中构图
4. **限制**: 无文字、无 Logo、无符号
5. **关键词**: 保留英文标题关键词
6. **氛围**: 欢快、友好、简洁

### 示例提示词

```
Geometric flat illustration depicting the concept of "What is Esperanto Translator,"
with a sky blue background featuring soft, abstract shapes. A central stylized icon
represents language translation, utilizing circular and rectangular forms to symbolize
text conversion. Pastel accents of light yellow, pink, and mint green highlight
connectivity and accessibility. Clean, minimalist design, 4:3 aspect ratio, cheerful
and friendly atmosphere, modern geometric flat style, no text or logos present.
```

## 文件命名规则

- ✅ 全部小写
- ✅ 空格用 `-` 替换
- ✅ 2-4 个单词
- ✅ 语义化描述

示例:
- `language-translation.webp`
- `golden-record.webp`
- `user-friendly.webp`

## 图片规格

| 参数 | 值 |
|------|---|
| 格式 | WebP |
| 尺寸 | 800x600 px |
| 比例 | 4:3 |
| 大小 | ~90KB (85-95KB) |
| 质量 | 自动调整 (75-100) |

## 项目结构

```
src/lib/article-illustrator/
├── types.ts              # TypeScript 类型定义
├── gemini-analyzer.ts    # Gemini 提示词生成
├── image-generator.ts    # Volcano Engine 生图封装
├── webp-converter.ts     # Sharp WebP 转换
└── workflow.ts           # 完整工作流整合

tests/
├── test-gemini-analyzer.ts      # Gemini 测试
├── test-webp-converter.ts       # WebP 转换测试
└── test-e2e-article-illustrator.ts  # 端到端测试
```

## 性能指标

- **Gemini 分析**: ~2-3 秒/提示词
- **Volcano 生图**: ~2-3 分钟/图片
- **WebP 转换**: ~1-2 秒/图片
- **总耗时**: 约 15-25 分钟/7 张图

## 错误处理

工具会自动处理以下错误:

- ✅ Gemini API 限流 → 重试机制
- ✅ Volcano 生图失败 → 跳过并记录
- ✅ WebP 转换失败 → 降级质量重试
- ✅ 文件保存失败 → 详细错误日志

## 注意事项

1. **API 费用**:
   - Gemini: ~7 次请求
   - Volcano: ~7 次图片生成 (消耗 credits)

2. **时间成本**:
   - 完整流程约 15-25 分钟
   - 建议分批处理或异步执行

3. **存储空间**:
   - 每张图约 90KB
   - 7 张图约 630KB

## License

MIT
