# 图片生成系统 - 完整介绍

## 🎯 系统概述

本项目提供了一套完整的**智能图片生成系统**，专门用于为翻译工具页面生成高质量的配图。系统集成了 AI 分析、多模型图片生成和自动化截图功能，实现从内容到图片的全自动化工作流。

---

## 📊 三大核心流程

### 流程一：页面完整生成流程（AI 智能工作流）✨

**🎯 用途**：一键生成页面所有图片（7张内容图 + 1张 How-To 截图 = 共8张）

**⭐ 核心特点**：
- ✅ **AI 全自动分析**：Gemini 2.0 Flash 智能分析内容，自动生成最优图片提示词
- ✅ **多模型智能降级**：火山 4.0（优先）→ Ideogram v3 → Seedream 4.0 → Nano Banana
- ✅ **自动截图集成**：生成完内容图后自动截取 How-To 使用教程
- ✅ **全程自动优化**：WebP 格式转换、智能压缩、质量控制

**🔄 工作流程**：
```
输入内容（标题+文字）
    ↓
[步骤1] Gemini AI 分析 → 生成 7 个专业 Prompt
    ↓
[步骤2] 火山 4.0 生成 7 张图片（失败自动降级）
    ↓
[步骤3] WebP 转换与压缩（~90KB）
    ↓
[步骤4] Playwright 自动截图 How-To
    ↓
输出 8 张优化图片 ✅
```

**📝 使用方法**：

```bash
# 1. 准备内容数据
# 编辑 scripts/generate-{page}-images-ai.ts

const pageSections: ArticleSections = {
  toolName: 'your-page',
  whatIs: { title: '...', content: '...' },
  funFacts: [{ title: '...', content: '...' }, ...],
  userInterests: [{ title: '...', content: '...' }, ...],
};

# 2. 启动开发服务器
pnpm dev

# 3. 运行生成脚本
pnpm tsx scripts/generate-{page}-images-ai.ts

# 4. 等待完成（15-30分钟）
# ✅ 生成 8 张图片到 public/images/docs/
```

**⏱️ 时间预估**：15-30 分钟（含截图）

**📁 输出文件**：
- `what-is-{page}.webp`
- `{page}-fact-1.webp`
- `{page}-fact-2.webp`
- `{page}-interest-1.webp`
- `{page}-interest-2.webp`
- `{page}-interest-3.webp`
- `{page}-interest-4.webp`
- `{page}-how-to.webp` ← 自动截图

---

### 流程二：单图修复流程（快速修复）🔧

**🎯 用途**：快速修复或重新生成单张特定图片

**⭐ 核心特点**：
- ✅ **精准控制**：手写 Prompt 完全掌控生成效果
- ✅ **快速响应**：2-4 分钟完成单图生成
- ✅ **灵活选择**：可指定使用的图片生成模型

**🔄 工作流程**：
```
手写图片 Prompt
    ↓
调用指定模型生成图片
    ↓
WebP 转换与压缩（< 90KB）
    ↓
保存到指定位置 ✅
```

**📝 使用方法**：

```typescript
// 创建 scripts/regenerate-{image-name}.ts

import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

const prompt = `Geometric Flat Style illustration showing [具体描述].
Sky blue background, [场景元素], 4:3 aspect ratio, clean design.`;

// 生成图片
const imageResult = await generateImageWithKie(prompt, {
  imageSize: '4:3',
  outputFormat: 'png',
});

// 转换为 WebP
const webpResult = await convertURLToWebP(imageResult.url, {
  filename: 'custom-image-name',
  targetSize: 90,
});
```

```bash
# 运行脚本
pnpm tsx scripts/regenerate-{image-name}.ts
```

**⏱️ 时间预估**：2-4 分钟

---

### 流程三：How-To 截图流程（自动截图）📸

**🎯 用途**：自动截取页面使用教程截图

**⭐ 核心特点**：
- ✅ **真实页面截图**：捕获实际运行的页面界面
- ✅ **智能裁剪**：左右各裁剪 150px，优化展示效果
- ✅ **自动压缩**：智能调整质量直到 < 90KB
- ✅ **动态识别**：传入关键词自动构建 URL

**🔄 工作流程**：
```
启动 Playwright 浏览器（1920x1080）
    ↓
访问页面并等待加载（5秒）
    ↓
截取第一屏
    ↓
裁剪处理（左150px + 右150px + 下100px）
    ↓
智能压缩到 < 90KB（最多5次重试）
    ↓
保存 WebP 格式 ✅
```

**📝 使用方法**：

```bash
# 确保开发服务器运行
pnpm dev

# 截取 How-To 图片
pnpm tsx scripts/capture-howto-screenshot.ts {page-slug}

# 示例
pnpm tsx scripts/capture-howto-screenshot.ts albanian-to-english
pnpm tsx scripts/capture-howto-screenshot.ts baby-translator
```

**⏱️ 时间预估**：30-60 秒

**📐 图片规格**：
- 原始：1920x1080
- 裁剪后：1620x980
- 大小：< 90KB

---

## 🎯 完整页面生成最佳实践

### 方案 A：一键生成全部（推荐）

```bash
# 启动开发服务器
pnpm dev

# 运行流程一（自动包含 How-To 截图）
pnpm tsx scripts/generate-{page}-images-ai.ts

# ✅ 完成！生成 8 张图片
```

### 方案 B：分步生成

```bash
# 启动开发服务器
pnpm dev

# 1. 生成 7 张内容图（流程一，关闭截图）
pnpm tsx scripts/generate-{page}-images-ai.ts  # 修改 captureHowTo: false

# 2. 单独生成 How-To 截图（流程三）
pnpm tsx scripts/capture-howto-screenshot.ts {page-slug}

# ✅ 完成！共 8 张图片
```

---

## 🏗️ 技术架构

### 核心组件

```
src/lib/article-illustrator/
├── workflow.ts              # 主工作流（流程一）
├── gemini-analyzer.ts       # Gemini AI 内容分析
├── image-generator.ts       # 多模型图片生成器
├── webp-converter.ts        # WebP 转换与压缩
├── screenshot-helper.ts     # Playwright 截图助手
└── types.ts                # TypeScript 类型定义
```

### 技术栈

| 功能 | 技术 |
|------|------|
| **AI 分析** | Google Gemini 2.0 Flash |
| **图片生成** | 火山引擎 4.0、Ideogram v3、Seedream 4.0、Google Nano Banana |
| **截图工具** | Playwright (Chromium) |
| **图片处理** | Sharp |
| **格式转换** | WebP 优化压缩 |

### 工作流集成

```typescript
// 流程一：完整工作流
import { generateArticleIllustrations } from '@/lib/article-illustrator/workflow';

const result = await generateArticleIllustrations(sections, {
  captureHowTo: true,        // 启用 How-To 截图
  baseUrl: 'http://localhost:3001',
});

// 流程二：单图生成
import { generateImageWithKie } from '@/lib/kie-text-to-image';
import { convertURLToWebP } from '@/lib/article-illustrator/webp-converter';

const image = await generateImageWithKie(prompt, options);
const webp = await convertURLToWebP(image.url, { filename, targetSize: 90 });

// 流程三：截图
import { captureHowToScreenshot } from '@/lib/article-illustrator/screenshot-helper';

const screenshot = await captureHowToScreenshot({ pageSlug });
```

---

## 📋 文件命名规范

### 标准命名格式

```
public/images/docs/
├── what-is-{page}.webp              # What Is 说明图
├── {page}-fact-1.webp               # Fun Fact 1
├── {page}-fact-2.webp               # Fun Fact 2
├── {page}-interest-1.webp           # User Interest 1
├── {page}-interest-2.webp           # User Interest 2
├── {page}-interest-3.webp           # User Interest 3
├── {page}-interest-4.webp           # User Interest 4
└── {page}-how-to.webp               # How-To 使用截图
```

### 命名示例

```
# Albanian to English Translator
what-is-albanian-to-english.webp
albanian-to-english-fact-1.webp
albanian-to-english-fact-2.webp
albanian-to-english-interest-1.webp
albanian-to-english-interest-2.webp
albanian-to-english-interest-3.webp
albanian-to-english-interest-4.webp
albanian-to-english-how-to.webp
```

---

## 🔍 故障排查

### 问题 1：Gemini API 调用失败

**原因**：缺少 API Key 或网络限制

**解决方案**：
```bash
# 检查环境变量
echo $GOOGLE_GENERATIVE_AI_API_KEY

# 设置 API Key（~/.zshrc 或 ~/.bashrc）
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"

# 或在 .env.local 中设置
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
```

---

### 问题 2：火山 4.0 生图失败

**原因**：API 限流、服务不可用或配额不足

**解决方案**：
- ✅ **自动降级**：系统会自动尝试备选模型
  - Ideogram v3（备选 1）
  - Seedream 4.0（备选 2）
  - Google Nano Banana（备选 3）
- 检查火山引擎 API 配额
- 查看控制台错误信息

---

### 问题 3：How-To 截图失败

**原因**：开发服务器未启动或页面不存在

**解决方案**：
```bash
# 1. 确保开发服务器运行
pnpm dev

# 2. 检查页面 URL 是否正确
curl http://localhost:3001/{page-slug}

# 3. 检查端口是否正确（默认 3001）
# 如果使用其他端口，在脚本中设置：
const result = await generateArticleIllustrations(sections, {
  captureHowTo: true,
  baseUrl: 'http://localhost:YOUR_PORT',
});
```

---

### 问题 4：WebP 文件过大

**原因**：图片内容复杂度高，难以压缩

**解决方案**：
- 流程一/二：自动压缩到 ~90KB（目标值）
- 流程三：智能调整质量（85% → 75% → 65% → 55% → 45%，最多 5 次重试）
- 如果仍然过大，手动调整 `targetSizeKB` 参数

---

### 问题 5：Playwright 浏览器启动失败

**原因**：Playwright 浏览器未安装

**解决方案**：
```bash
# 安装 Playwright 浏览器
pnpm exec playwright install chromium

# 或安装所有浏览器
pnpm exec playwright install
```

---

## 📊 性能对比

| 流程 | 图片数量 | 耗时 | 质量 | 自动化程度 | 适用场景 |
|------|---------|------|------|-----------|---------|
| **流程一** | 8张 | 15-30分钟 | ⭐⭐⭐⭐⭐ | 🤖🤖🤖🤖🤖 | 新页面全量生成 |
| **流程二** | 1张 | 2-4分钟 | ⭐⭐⭐⭐ | 🤖🤖 | 快速修复特定图片 |
| **流程三** | 1张 | 30-60秒 | ⭐⭐⭐⭐⭐ | 🤖🤖🤖🤖🤖 | 生成使用教程截图 |

---

## 🎓 使用建议

### 新页面开发流程

1. **准备内容**：编写 What Is、Fun Facts、User Interests 文字内容
2. **创建脚本**：复制 `generate-albanian-to-english-images-ai.ts` 作为模板
3. **填充数据**：将内容填入 `ArticleSections` 结构
4. **启动服务器**：`pnpm dev`
5. **运行生成**：`pnpm tsx scripts/generate-{page}-images-ai.ts`
6. **检查结果**：确认 8 张图片都已生成

### 图片迭代优化

- **批量调整**：修改内容后重新运行流程一
- **单张微调**：使用流程二快速修复特定图片
- **截图更新**：页面 UI 调整后使用流程三重新截图

### 质量控制

- ✅ 所有图片统一 WebP 格式
- ✅ 大小控制在 ~90KB 以内
- ✅ 内容图 4:3 比例，截图 1620x980
- ✅ 天蓝色 (#87CEEB) 主色调，柔和渐变风格

---

## 📚 相关文档

- [详细工作流程说明](./IMAGE-GENERATION-WORKFLOWS.md)
- [Article Illustrator API 文档](../src/lib/article-illustrator/README.md)
- [Gemini 分析器配置](../src/lib/article-illustrator/gemini-analyzer.ts)
- [多模型生成器](../src/lib/article-illustrator/image-generator.ts)

---

## 🚀 快速开始

```bash
# 1. 克隆模板脚本
cp scripts/generate-albanian-to-english-images-ai.ts scripts/generate-my-page-images-ai.ts

# 2. 编辑内容
# 修改 toolName 和各个 section 的 title/content

# 3. 启动开发服务器
pnpm dev

# 4. 运行生成
pnpm tsx scripts/generate-my-page-images-ai.ts

# 5. 等待完成，检查结果
ls -lh public/images/docs/my-page-*
```

---

## ✨ 总结

本系统提供了三种灵活的图片生成方式：

1. **流程一（AI 智能）**：全自动、高质量、一键生成 8 张图片 ✨
2. **流程二（快速修复）**：精准控制、快速响应、单图优化 🔧
3. **流程三（自动截图）**：真实页面、智能压缩、教程截图 📸

**推荐组合**：优先使用流程一完成批量生成，必要时用流程二修复特定图片。

---

**📞 技术支持**：如遇问题，请查看故障排查章节或联系开发团队。
