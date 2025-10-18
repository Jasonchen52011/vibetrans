# 图片生成流程完整指南

本文档详细介绍了项目中的三种图片生成流程，包括使用场景、工作原理和具体用法。

---

## 📊 流程总览

| 流程 | 名称 | 生成数量 | 使用场景 | Prompt来源 | 图片生成器 |
|------|------|---------|---------|-----------|-----------|
| **流程一** | 页面完整生成流程 | 7张 | 新页面全量生成 | Gemini AI 智能分析 | 火山 4.0 + 备选 |
| **流程二** | 单图修复流程 | 1张 | 修复/重新生成单张图片 | 手写 Prompt | KIE/火山 4.0 |
| **流程三** | How-To 截图流程 | 1张 | 生成使用教程截图 | 无需 Prompt | Playwright 截图 |

---

## 🔄 流程一：页面完整生成流程（AI 智能）

### 📝 流程说明

这是**最智能的完整工作流**，使用 **Article Illustrator** 自动生成页面所有图片。

**核心特点**：
- ✅ **AI 自动分析**：Gemini 分析内容自动生成最优 Prompt
- ✅ **批量生成**：一次生成 7 张图片（What Is + 2 Fun Facts + 4 User Interests）
- ✅ **火山 4.0 优先**：自动降级到备选方案（Ideogram v3 → Seedream 4.0 → Nano Banana）
- ✅ **自动优化**：转换为 WebP 格式，压缩到最优大小

### 🛠️ 工作原理

```
1️⃣ 提供内容数据 (ArticleSections)
   ├─ whatIs: { title, content }
   ├─ funFacts: [2个] { title, content }
   └─ userInterests: [4个] { title, content }

2️⃣ Gemini AI 分析
   └─ 为每个 section 生成专业的图片生成 Prompt

3️⃣ 火山引擎 4.0 生图
   ├─ 模式: text-to-image
   ├─ 分辨率: 2K
   ├─ 备选: Ideogram v3 → Seedream 4.0 → Nano Banana

4️⃣ WebP 转换与优化
   ├─ 尺寸: 800x600
   ├─ 质量: 85%
   └─ 大小: ~90KB

5️⃣ 保存文件
   └─ 路径: public/images/docs/{filename}.webp
```

### 📦 使用方法

**1. 创建页面脚本**（参考模板 `scripts/generate-albanian-to-english-images-ai.ts`）

```typescript
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const pageSections: ArticleSections = {
  toolName: 'your-page-name',

  whatIs: {
    title: 'What is Your Tool',
    content: '详细描述工具的功能和特点...',
  },

  funFacts: [
    {
      title: 'Fun Fact 1 标题',
      content: '有趣的事实内容...',
    },
    {
      title: 'Fun Fact 2 标题',
      content: '有趣的事实内容...',
    },
  ],

  userInterests: [
    {
      title: 'Interest 1 标题',
      content: '用户关注点内容...',
    },
    // ... 共 4 个
  ],
};

await generateArticleIllustrations(pageSections);
```

**2. 运行脚本**

```bash
pnpm tsx scripts/generate-{your-page}-images-ai.ts
```

**3. 输出结果**

```
✅ 生成 7 张图片：
   1. what-is-{page}.webp
   2. {page}-fact-1.webp
   3. {page}-fact-2.webp
   4. {page}-interest-1.webp
   5. {page}-interest-2.webp
   6. {page}-interest-3.webp
   7. {page}-interest-4.webp
```

### ⏱️ 预估时间

- Gemini 分析：~30-60 秒（7 次 API 调用）
- 火山 4.0 生图：每张 2-3 分钟
- WebP 转换：每张 5-10 秒
- **总计：15-25 分钟**

---

## 🔧 流程二：单图修复流程（手动 Prompt）

### 📝 流程说明

用于**快速修复或重新生成单张特定图片**，适合微调和紧急修复。

**核心特点**：
- ✅ **快速修复**：只生成 1 张图片
- ✅ **精准控制**：手写 Prompt 完全掌控生成效果
- ✅ **灵活选择**：可指定使用的图片生成模型

### 🛠️ 工作原理

```
1️⃣ 手写图片 Prompt
   └─ 详细描述场景、颜色、风格、元素等

2️⃣ 调用图片生成 API
   ├─ KIE (Google Nano Banana)
   ├─ 或 Volcano 4.0
   └─ 或其他指定模型

3️⃣ WebP 转换
   └─ 压缩到 < 90KB

4️⃣ 保存文件
   └─ 指定文件名保存
```

### 📦 使用方法

**脚本示例**（参考 `scripts/regenerate-creative-projects.ts`）

```typescript
import { convertURLToWebP } from '../src/lib/article-illustrator/webp-converter';
import { generateImageWithKie } from '../src/lib/kie-text-to-image';

const prompt = `Geometric Flat Style cartoon illustration for "Your Topic".
Sky blue (#87CEEB) background with soft gradient. Features [描述场景元素].
Clean minimalist style, 4:3 aspect ratio, cheerful atmosphere.`;

// 生成图片
const imageResult = await generateImageWithKie(prompt, {
  imageSize: '4:3',
  outputFormat: 'png',
});

// 转换为 WebP
const webpResult = await convertURLToWebP(imageResult.url, {
  filename: 'your-custom-filename',
  targetSize: 90,
});
```

**运行**

```bash
pnpm tsx scripts/regenerate-{your-image}.ts
```

### ⏱️ 预估时间

- 图片生成：1-3 分钟
- WebP 转换：5-10 秒
- **总计：2-4 分钟**

---

## 📸 流程三：How-To 截图流程（自动截图）

### 📝 流程说明

专门用于生成**页面使用教程截图**，通过浏览器自动化完成。

**核心特点**：
- ✅ **真实页面截图**：捕获实际运行的页面界面
- ✅ **动态识别**：传入页面关键词自动构建 URL
- ✅ **智能裁剪**：左右各裁剪 150px，优化展示效果
- ✅ **智能压缩**：自动调整质量直到 < 90KB

### 🛠️ 工作原理

```
1️⃣ 启动 Playwright 浏览器
   └─ 视口：1920x1080

2️⃣ 访问页面
   └─ URL: http://localhost:3001/{page-slug}

3️⃣ 等待加载
   └─ 5秒确保内容完全渲染

4️⃣ 截取第一屏
   └─ 全屏截图 1920x1080

5️⃣ 裁剪处理
   ├─ 左边裁剪：150px
   ├─ 右边裁剪：150px
   ├─ 下方裁剪：100px
   └─ 最终尺寸：1620x980

6️⃣ WebP 智能压缩
   ├─ 初始质量：85%
   ├─ 检查大小：是否 < 90KB
   ├─ 自动降级：质量 -10% 重试（最多 5 次）
   └─ 找到最优质量参数

7️⃣ 保存文件
   └─ {page-slug}-how-to.webp
```

### 📦 使用方法

**通用脚本**（`scripts/capture-howto-screenshot.ts`）

```bash
# 基本用法
pnpm tsx scripts/capture-howto-screenshot.ts {page-slug}

# 示例
pnpm tsx scripts/capture-howto-screenshot.ts albanian-to-english
pnpm tsx scripts/capture-howto-screenshot.ts baby-translator
pnpm tsx scripts/capture-howto-screenshot.ts verbose-generator
```

**前提条件**：
- ✅ 本地开发服务器运行在 `http://localhost:3001`
- ✅ 页面路径为 `/{page-slug}`

### 📊 输出示例

```
================================================================================
📸 How-To Screenshot Generator
================================================================================

📄 Page: albanian-to-english
🔗 URL: http://localhost:3001/albanian-to-english
📐 Viewport: 1920x1080
✂️  Crop: Left 150px, Right 150px, Bottom 100px
📦 Target Size: < 90KB

🌐 Loading page...
⏳ Waiting for content (5s)...
📸 Capturing screenshot...
✅ Screenshot captured

✂️  Cropping image...
   Original: 1920x1080
   Cropped: 1620x980

📦 Converting to WebP with smart compression...
   Attempt 1/5: Quality 85% → 87.32KB
✅ Size target achieved: 87.32KB < 90KB

================================================================================
✅ SCREENSHOT COMPLETED
================================================================================
📁 File: albanian-to-english-how-to.webp
📏 Size: 87.32KB
📐 Dimensions: 1620x980
💾 Path: public/images/docs/albanian-to-english-how-to.webp
================================================================================
```

### ⏱️ 预估时间

- 页面加载：5-10 秒
- 截图处理：5-10 秒
- WebP 压缩：10-30 秒（含重试）
- **总计：30-60 秒**

---

## 🎯 完整页面图片生成最佳实践

### 推荐工作流程

生成一个完整页面的所有图片（共 8 张），按以下顺序执行：

```bash
# 1️⃣ 启动本地开发服务器
pnpm dev

# 2️⃣ 生成 7 张内容图片（流程一：AI 智能生成）
pnpm tsx scripts/generate-{page}-images-ai.ts

# 3️⃣ 生成 1 张 How-To 截图（流程三：自动截图）
pnpm tsx scripts/capture-howto-screenshot.ts {page-slug}

# ✅ 完成！共 8 张图片
```

### 文件命名规范

```
public/images/docs/
├── what-is-{page}.webp           # What Is 说明图
├── {page}-fact-1.webp            # Fun Fact 1
├── {page}-fact-2.webp            # Fun Fact 2
├── {page}-interest-1.webp        # User Interest 1
├── {page}-interest-2.webp        # User Interest 2
├── {page}-interest-3.webp        # User Interest 3
├── {page}-interest-4.webp        # User Interest 4
└── {page}-how-to.webp            # How-To 使用截图
```

---

## 🔍 故障排查

### 问题 1：Gemini API 调用失败

**原因**：缺少 API Key 或网络问题

**解决**：
```bash
# 检查环境变量
echo $GOOGLE_GENERATIVE_AI_API_KEY

# 设置 API Key
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"
```

### 问题 2：火山 4.0 生图失败

**原因**：API 限流或服务不可用

**解决**：自动降级到备选方案
- Ideogram v3（备选 1）
- Seedream 4.0（备选 2）
- Google Nano Banana（备选 3）

### 问题 3：截图页面加载失败

**原因**：本地服务器未启动或端口错误

**解决**：
```bash
# 确保开发服务器运行
pnpm dev

# 检查端口
curl http://localhost:3001/{page-slug}
```

### 问题 4：WebP 文件过大

**原因**：图片内容复杂度高

**解决**：
- 流程一/二：自动压缩到 ~90KB
- 流程三：智能调整质量（最多 5 次重试）

---

## 📚 相关文件

### 核心库文件

```
src/lib/article-illustrator/
├── workflow.ts           # 流程一：主工作流
├── gemini-analyzer.ts    # Gemini AI 分析
├── image-generator.ts    # 图片生成器（多模型）
├── webp-converter.ts     # WebP 转换器
└── types.ts             # 类型定义
```

### 脚本文件

```
scripts/
├── generate-{page}-images-ai.ts     # 流程一：页面完整生成
├── regenerate-{image}.ts            # 流程二：单图修复
└── capture-howto-screenshot.ts      # 流程三：How-To 截图（通用）
```

### 测试文件

```
tests/
├── test-e2e-article-illustrator.ts  # 端到端测试
├── test-gemini-analyzer.ts          # Gemini 分析测试
└── test-webp-converter.ts           # WebP 转换测试
```

---

## 💡 技术栈

- **AI 分析**：Google Gemini 2.0 Flash
- **图片生成**：
  - 火山引擎 4.0（优先）
  - Ideogram v3
  - Seedream 4.0
  - Google Nano Banana (KIE)
- **截图工具**：Playwright (Chromium)
- **图片处理**：Sharp
- **格式转换**：WebP 优化压缩

---

## 📝 总结

| 需求场景 | 推荐流程 | 时间 | 质量 |
|---------|---------|------|------|
| 新页面全量生成 | 流程一（AI 智能） | 15-25 分钟 | ⭐⭐⭐⭐⭐ |
| 修复单张图片 | 流程二（手动 Prompt） | 2-4 分钟 | ⭐⭐⭐⭐ |
| 生成使用教程截图 | 流程三（自动截图） | 30-60 秒 | ⭐⭐⭐⭐⭐ |

**推荐组合**：流程一（7张）+ 流程三（1张）= 完整页面图片集
