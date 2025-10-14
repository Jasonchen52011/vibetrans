# 🚀 VibeTrans 自动化工具生成器

**一键生成完整的翻译工具页面**，包括产品调研、代码生成、SEO内容、图片和配置。

---

## 📖 功能特点

### ✨ 全自动化流程

```
输入关键词 → 完整工具页面
    ↓
├─ Phase 1: o3 Thinking 深度产品调研
├─ Phase 2: o3 Thinking 内容调研
├─ Phase 3: 代码生成（调用现有CLI）
├─ Phase 4: GPT-4o SEO内容生成
├─ Phase 5: 翻译文件生成（en.json）
├─ Phase 6: 图片生成提示（需手动执行）
├─ Phase 7: SEO配置提示（需手动执行）
└─ Phase 8: 质量检查和构建验证
```

### 🎯 核心优势

1. **深度调研**：使用 o3 Thinking（OpenAI 最强推理模型）进行深度市场调研
   - 分析 Google 排名前15的竞品
   - 爬取 Reddit/Quora 高频话题
   - 提取高频关键词
   - 发现市场空白功能

2. **智能内容生成**：使用 GPT-4o 生成SEO优化的内容
   - 符合 SEO 最佳实践
   - 包含用户评价、FAQ、Fun Facts
   - 自动计算字数确保质量
   - 自然融入高频关键词

3. **统一数据流**：所有阶段共享数据，避免手动复制粘贴

4. **质量保障**：自动检查文件完整性和构建成功

---

## 🛠️ 安装和配置

### 1. 环境变量配置

在项目根目录的 `.env` 或 `.env.local` 文件中添加：

```bash
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 2. 验证安装

```bash
# 检查脚本是否可执行
node scripts/auto-tool-generator.js --help

# 或使用 pnpm 命令
pnpm tool:auto --help
```

---

## 📋 使用方法

### 基础用法

```bash
pnpm tool:auto "alien text generator"
```

**参数说明**：
- 关键词：用引号包裹的完整关键词（如 `"emoji translator"`）
- 关键词会自动转换为 URL slug（如 `emoji-translator`）

### 完整示例

```bash
# 示例 1: Emoji Translator
pnpm tool:auto "emoji translator"

# 示例 2: Pirate Translator
pnpm tool:auto "pirate translator"

# 示例 3: Alien Text Generator
pnpm tool:auto "alien text generator"
```

---

## 🔄 执行流程详解

### Phase 1: 产品调研（10-15分钟）

**使用模型**：o3 Thinking

**调研内容**：
- ✅ Google 前15名竞品分析
- ✅ Reddit/Quora 高频话题
- ✅ Fun Facts 收集
- ✅ 市场空白功能分析
- ✅ 产品规划生成

**输出文件**：`.tool-generation/{keyword}/research.json`

**输出格式**：
```json
{
  "keyword": "alien text generator",
  "productName": "Alien Text Generator",
  "description": "一句话产品介绍",
  "competitors": [...],
  "socialTopics": [...],
  "funFacts": [...],
  "features": {
    "basic": ["基本功能"],
    "competitive": ["竞品功能"],
    "innovative": ["创新功能"]
  }
}
```

---

### Phase 2: 内容调研（10-15分钟）

**使用模型**：o3 Thinking

**调研内容**：
- ✅ 竞品内容空白分析
- ✅ Reddit/Quora 用户关注点
- ✅ Fun Facts 收集
- ✅ 高频关键词提取（前30个）

**输出文件**：`.tool-generation/{keyword}/content-research.json`

**输出格式**：
```json
{
  "contentGaps": [...],
  "socialTopics": [...],
  "funFacts": [...],
  "highFrequencyWords": [
    {
      "word": "alien",
      "frequency": "高",
      "context": "使用场景"
    }
  ]
}
```

---

### Phase 3: 代码生成（1-2分钟）

**执行方式**：调用现有 `create-translator-tool.js`

**生成文件**：
```
✅ src/app/[locale]/(marketing)/(pages)/{slug}/
   ├── page.tsx                    # 页面主文件
   └── {ToolName}Tool.tsx          # 工具组件

✅ src/app/api/{slug}/
   └── route.ts                    # API 路由
```

**注意事项**：
- API 路由的翻译逻辑需要手动实现
- 参考 `/gen-z-translator` 的样式和功能

---

### Phase 4: 内容生成（10-15分钟）

**使用模型**：GPT-4o

**生成内容**：
- ✅ SEO Title & Meta Description
- ✅ H1 标题和描述
- ✅ What Is 板块
- ✅ Example 板块
- ✅ How To 板块（3-4个步骤）
- ✅ Fun Facts（2个）
- ✅ 用户关注的内容板块（4个）
- ✅ Highlights（4个特点）
- ✅ 用户评价（6个）
- ✅ FAQ（6个问题）
- ✅ CTA（行动号召）

**输出文件**：`.tool-generation/{keyword}/content.json`

**内容特点**：
- 🎯 自动统计字数，确保符合要求
- 🎯 融入调研得出的高频关键词
- 🎯 包含个人情感和主观评论
- 🎯 对话式、口语化语气
- 🎯 7年级以下学生可理解

---

### Phase 5: 翻译文件生成（1分钟）

**生成文件**：
- ✅ 自动更新 `messages/en.json`
- ⚠️ 需要手动翻译 `messages/zh.json`

**JSON 结构**：
```json
{
  "{PageName}Page": {
    "title": "...",
    "description": "...",
    "h1": "...",
    "heroDescription": "...",
    "whatIs": {...},
    "howTo": {...},
    "funFacts": [...],
    "testimonials": [...],
    "faqs": [...],
    "cta": {...}
  }
}
```

---

### Phase 6: 图片生成（需手动执行）

**需要生成的图片**：
```
public/images/docs/
├── what-is-{slug}.webp           # What Is 板块图片
├── {slug}-how-to.webp            # How To 板块图片
├── {slug}-fact-1.webp            # Fun Fact 1 图片
└── {slug}-fact-2.webp            # Fun Fact 2 图片
```

**生成方式**：
1. 使用 Article Illustrator 流程
2. 优先使用 **Deem4.0**
3. 失败则使用 **NanoBanana**

**图片规格**：
- 格式：WebP
- 风格：与网站一致
- 尺寸：根据实际需求

**How To 图片特殊处理**：

How To 图片需要通过 Playwright 自动截图生成，具体步骤：

1. **运行截图脚本**（自动集成到 `capture-{slug}-screenshot.ts`）：
   ```bash
   tsx scripts/capture-{slug}-screenshot.ts
   ```

2. **脚本自动处理流程**：
   - 访问 `http://localhost:3001/{slug}` 页面
   - 截取第一屏（1920x1080）并保存为临时 PNG
   - 自动裁剪图片（左右各100px，下方100px）
   - 转换为 WebP 格式（质量85%）
   - 删除临时 PNG 文件

3. **裁剪参数**：
   - 原图尺寸：1920x1080
   - 裁剪后尺寸：1720x980
   - 左边裁剪：100px
   - 右边裁剪：100px
   - 下方裁剪：100px
   - 上方保持：不裁剪

4. **输出文件**：`public/images/docs/{slug}-how-to.webp`

**截图脚本代码示例**：
```typescript
// 使用 sharp-cli 进行裁剪和转换
await execAsync(
  `npx sharp-cli -i "${tempPngPath}" -o "${path.dirname(finalWebpPath)}/" -f webp -q 85 extract 0 100 1720 980`
);
```

---

### Phase 7: SEO 配置（需手动执行）

**需要配置的文件**：

1. **sitemap.xml**
   ```xml
   <url>
     <loc>https://vibetrans.com/{slug}</loc>
     <lastmod>2025-10-10</lastmod>
   </url>
   ```

2. **navbar 和 footer**
   - 在 "Fun Translator" 分类中添加工具链接

3. **explore other tools**
   - 在相关工具推荐中添加此工具

4. **SEO 图片（og:image）**
   - 生成社交媒体分享图片

---

### Phase 8: 质量检查（自动执行）

**检查项目**：
- ✅ 页面文件是否存在
- ✅ API 路由是否存在
- ✅ 翻译文件是否更新
- ✅ **头像组合是否唯一**（每个工具使用不同的头像组合）
- ✅ **用户数量是否唯一**（每个工具显示不同的用户数量）
- ✅ **互换按钮样式是否正确**（翻译工具使用低调简洁的样式）
- ⚠️ `pnpm build` 是否成功（需手动执行）

**UI 验收标准**：
1. **头像唯一性** - 每个工具页面的5个头像组合必须与其他页面不同
   - 通过哈希函数基于 tool slug 自动分配
   - 共有6种不同的头像组合池可用

2. **数字唯一性** - 每个工具的用户数量展示必须不同
   - 可选数字：10,000+、15,000+、12,000+、20,000+、18,000+、25,000+
   - 通过哈希函数自动分配

3. **互换按钮样式** - 翻译工具的语言切换按钮需低调简洁
   - 无圆形背景
   - 无阴影效果
   - 仅使用图标和 hover 颜色变化
   - 参考 esperanto-translator 的实现

---

## 📁 输出文件结构

执行完成后，会生成以下文件：

```
.tool-generation/
└── {keyword}/
    ├── research.json              # Phase 1: 产品调研结果
    ├── content-research.json      # Phase 2: 内容调研结果
    └── content.json               # Phase 4: 生成的内容

src/app/[locale]/(marketing)/(pages)/{slug}/
├── page.tsx                       # Phase 3: 页面文件
└── {ToolName}Tool.tsx            # Phase 3: 工具组件

src/app/api/{slug}/
└── route.ts                       # Phase 3: API 路由

messages/
├── en.json                        # Phase 5: 英文翻译（自动更新）
└── zh.json                        # Phase 5: 中文翻译（需手动添加）

public/images/docs/                # Phase 6: 图片（需手动生成）
```

---

## ✅ 完成后的后续步骤

生成完成后，需要手动完成以下步骤：

### 1. 翻译中文内容

```bash
# 打开 messages/zh.json
# 复制 en.json 中的结构
# 翻译所有字段为中文
```

### 2. 实现 API 逻辑

```typescript
// src/app/api/{slug}/route.ts
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // 🔧 实现你的翻译逻辑
    const translated = await yourTranslationFunction(text);

    return NextResponse.json({ translated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
```

### 3. 生成图片

使用 Article Illustrator 流程生成4张图片。

### 4. 配置 SEO

更新 sitemap、navbar、footer 和 explore other tools。

### 5. 验证构建

```bash
pnpm build
```

### 6. 测试功能

```bash
pnpm dev
# 访问 http://localhost:3000/{slug}
```

### 7. 提交代码

```bash
git add .
git commit -m "feat: add {tool-name} tool"
git push
```

---

## 🎯 最佳实践

### 1. 关键词选择

- ✅ 使用完整的关键词短语（如 `"emoji translator"`）
- ✅ 确保关键词有搜索量和商业价值
- ❌ 避免过于宽泛的关键词（如 `"translator"`）
- ❌ 避免过于长尾的关键词（如 `"free online emoji translator tool"`）

### 2. 调研结果审查

在 Phase 1 和 Phase 2 完成后，建议：
- 检查 `.tool-generation/{keyword}/research.json`
- 确认产品规划符合预期
- 确认竞品功能和创新功能合理

### 3. 内容质量检查

在 Phase 4 完成后，建议：
- 检查 `.tool-generation/{keyword}/content.json`
- 确认字数符合要求
- 确认高频关键词自然融入
- 确认内容符合 SEO 最佳实践

### 4. 代码审查

在 Phase 3 完成后，建议：
- 检查生成的组件代码
- 确认样式与 `/gen-z-translator` 一致
- 确认功能完整（上传、下载、复制、语音）

---

## 🔧 高级配置

### 自定义 API Key

如果不想使用环境变量，可以在脚本中直接修改：

```javascript
// scripts/auto-tool-generator.js
const CONFIG = {
  gptApiKey: 'sk-proj-your-api-key-here',  // 直接设置
  // ...
};
```

### 自定义输出目录

```javascript
const CONFIG = {
  // ...
  outputDir: path.join(ROOT_DIR, 'custom-output-dir'),
};
```

### 跳过某些阶段

可以注释掉不需要的阶段：

```javascript
async function main() {
  // ...

  // const researchData = await phase1_research(keyword);
  // const contentResearchData = await phase2_contentResearch(keyword);
  const codeData = await phase3_generateCode(keyword, researchData);

  // ...
}
```

---

## ❓ 常见问题

### Q1: OpenAI API 调用失败怎么办？

**A**: 检查以下几点：
1. 确认 `OPENAI_API_KEY` 环境变量设置正确
2. 确认 API Key 有足够的余额
3. 确认网络连接正常
4. 检查是否超过了 API 速率限制

### Q2: 生成的内容不符合预期怎么办？

**A**: 可以：
1. 修改 Phase 1 或 Phase 4 的 prompt
2. 手动编辑 `.tool-generation/{keyword}/content.json`
3. 重新运行特定阶段

### Q3: 如何只运行某个阶段？

**A**: 修改 `main()` 函数，注释掉不需要的阶段。例如，只运行内容生成：

```javascript
async function main() {
  const keyword = process.argv[2];

  // 跳过前面的阶段，直接读取已有数据
  const researchData = JSON.parse(
    await fs.readFile('.tool-generation/{keyword}/research.json', 'utf-8')
  );

  // 只运行 Phase 4
  await phase4_generateContent(keyword, researchData, contentResearchData);
}
```

### Q4: 生成的代码有类型错误怎么办？

**A**:
1. 运行 `pnpm build` 查看具体错误
2. 手动修复类型错误
3. 确认翻译文件的 JSON 结构正确

### Q5: 如何优化 API 调用成本？

**A**:
1. Phase 1 和 Phase 2 使用 `o3-mini`（便宜且效果好）
2. Phase 4 使用 `gpt-4o`（质量高）
3. 缓存调研结果，避免重复调用
4. 生成多个工具时，可以复用部分调研数据

---

## 📊 预估时间和成本

### 时间消耗

| 阶段 | 预估时间 |
|------|---------|
| Phase 1: 产品调研 | 10-15分钟 |
| Phase 2: 内容调研 | 10-15分钟 |
| Phase 3: 代码生成 | 1-2分钟 |
| Phase 4: 内容生成 | 10-15分钟 |
| Phase 5: 翻译生成 | 1分钟 |
| **总计（自动化部分）** | **35-50分钟** |
| 手动步骤（翻译、图片、SEO） | 30-60分钟 |
| **完整流程总计** | **1-2小时** |

### API 成本（预估）

| 阶段 | 模型 | Tokens | 成本 |
|------|------|--------|------|
| Phase 1 | o3 | ~5,000 | ~$0.05 |
| Phase 2 | o3 | ~5,000 | ~$0.05 |
| Phase 4 | gpt-4o | ~10,000 | ~$0.05 |
| **总计** | - | ~20,000 | **~$0.15** |

> 使用最强推理模型，获得最佳调研质量！

---

## 🚀 进阶使用

### 批量生成工具

创建一个批量脚本 `scripts/batch-generate.sh`：

```bash
#!/bin/bash

# 批量生成多个工具
tools=(
  "emoji translator"
  "pirate translator"
  "alien text generator"
  "morse code translator"
)

for tool in "${tools[@]}"; do
  echo "生成工具: $tool"
  pnpm tool:auto "$tool"
  echo "完成: $tool"
  echo "---"
done
```

### 与 CI/CD 集成

在 GitHub Actions 中自动生成：

```yaml
name: Auto Generate Tool

on:
  workflow_dispatch:
    inputs:
      keyword:
        description: 'Tool keyword'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm tool:auto "${{ github.event.inputs.keyword }}"
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## 📞 支持和反馈

如有问题或建议，请联系开发团队或提交 Issue。

---

## 📝 更新日志

### v1.1.0 (2025-10-11)
- ✨ 升级到 o3 Thinking 推理模型
- 🚀 提升调研深度和质量
- 📝 更新文档说明

### v1.0.0 (2025-10-10)
- ✨ 初始版本发布
- ✅ 支持完整的7阶段自动化流程
- ✅ 集成 o3-mini 和 GPT-4o
- ✅ 自动生成翻译文件
- ✅ 质量检查和构建验证

---

## 🧪 测试与验证

### 自动化测试脚本

为确保字段映射正确，我们提供了完整的测试脚本：

```bash
# 测试特定工具的字段映射
pnpm tool:test "ivr translator"
```

### 测试内容

测试脚本会验证以下内容：

#### 1. 基础字段映射 (14个字段)
- ✅ SEO 字段 (title, description)
- ✅ Hero 字段 (title, description)
- ✅ What Is 字段
- ✅ Example 字段
- ✅ How To 字段
- ✅ Unique 字段
- ✅ Highlights 字段
- ✅ CTA 字段

#### 2. 数组字段完整性 (6个数组)
- ✅ How To Steps - 验证步骤数量和内容
- ✅ Fun Facts - 验证数量和内容
- ✅ Interesting Sections - 验证数量和内容
- ✅ Highlights Features - 验证数量和内容
- ✅ Testimonials - 验证数量和内容
- ✅ FAQs - 验证数量和内容

### 测试输出示例

```
🧪 测试工具: ivr translator
============================================================
✅ 成功读取 content.json
✅ 成功读取 en.json

📊 验证数组字段...
  ✅ How To Steps 完全匹配
  ✅ Fun Facts 完全匹配
  ✅ Interesting Sections 完全匹配
  ✅ Highlights 完全匹配
  ✅ Testimonials 完全匹配
  ✅ FAQs 完全匹配

============================================================
📊 测试结果
============================================================
✅ 通过: 20
❌ 失败: 0

✅ 所有测试通过! 🎉
```

### 字段映射详细说明

| content.json 路径 | en.json 路径 | 说明 |
|------------------|--------------|------|
| `seo.title` | `{PageName}Page.title` | SEO 标题 |
| `seo.metaDescription` | `{PageName}Page.description` | SEO 描述 |
| `h1.title` | `{PageName}Page.hero.title` | 页面H1标题 |
| `heroDescription.content` | `{PageName}Page.hero.description` | Hero描述 |
| `whatIs.title` | `{PageName}Page.whatIs.title` | What Is 标题 |
| `whatIs.content` | `{PageName}Page.whatIs.content` | What Is 内容 |
| `example.title` | `{PageName}Page.examples.title` | 示例标题 |
| `example.description` | `{PageName}Page.examples.description` | 示例描述 |
| `howTo.title` | `{PageName}Page.howto.title` | How To 标题 |
| `howTo.description` | `{PageName}Page.howto.description` | How To 描述 |
| `howTo.steps[]` | `{PageName}Page.howto.steps[]` | How To 步骤数组 |
| `funFacts[]` | `{PageName}Page.userScenarios.items[]` | 趣味事实数组 |
| `interestingSections.title` | `{PageName}Page.unique.title` | 用户兴趣板块标题 |
| `interestingSections.sections[]` | `{PageName}Page.unique.items[]` | 用户兴趣内容数组 |
| `highlights.title` | `{PageName}Page.highlights.title` | 亮点标题 |
| `highlights.features[]` | `{PageName}Page.highlights.items[]` | 亮点特性数组 |
| `testimonials[]` | `{PageName}Page.testimonials.items{}` | 用户评价(数组转对象) |
| `faqs[]` | `{PageName}Page.faqs.items{}` | FAQ(数组转对象) |
| `cta.title` | `{PageName}Page.cta.title` | CTA 标题 |
| `cta.description` | `{PageName}Page.cta.description` | CTA 描述 |

### 特殊映射规则

#### 1. 数组转对象 (Testimonials & FAQs)
```javascript
// content.json: testimonials[]
// en.json: testimonials.items{"item-1", "item-2", ...}

testimonials.reduce((acc, testimonial, index) => {
  acc[`item-${index + 1}`] = {
    name: testimonial.name,
    role: testimonial.role,
    heading: `"${testimonial.content.split('.')[0]}"`,
    content: testimonial.content,
  };
  return acc;
}, {})
```

#### 2. Fun Facts 映射
```javascript
// content.json: funFacts[{content, wordCount}]
// en.json: userScenarios.items[{title, description}]

funFacts.map((fact) => ({
  title: fact.content.substring(0, 50) + '...',  // 截取前50字符作为标题
  description: fact.content,                      // 完整内容作为描述
}))
```

#### 3. 固定字段
某些字段在翻译文件中使用固定值：
- `hero.primaryButton`: 'Try Now'
- `hero.secondaryButton`: 'Learn More'
- `unique.subtitle`: 'Tailored Solutions for Users'
- `testimonials.title`: 'What Our Users Are Saying'
- `testimonials.subtitle`: 'Real feedback from real users'
- `faqs.title`: 'Frequently Asked Questions'

### 开发工作流

#### 标准流程
```bash
# 1. 生成工具
pnpm tool:auto "new tool"

# 2. 测试字段映射
pnpm tool:test "new tool"

# 3. 测试 UI 唯一性（自动验证头像、数字、按钮样式）
pnpm tool:test-ui "new tool"

# 4. 验证构建
pnpm build

# 5. 本地测试
pnpm dev
```

#### UI 验收检查清单

运行 `pnpm tool:test-ui "tool-name"` 会自动检查：
- ✅ 头像组合是否与其他工具重复
- ✅ 用户数量是否与其他工具重复
- ✅ 翻译工具的互换按钮样式是否正确

**示例输出**：
```
🎨 UI 验收测试: albanian-to-english
============================================================
✅ 头像组合唯一性检查通过
   - 使用头像: ['female2', 'male4', 'female3', 'male2', 'female4']
   - 无重复

✅ 用户数量唯一性检查通过
   - 显示数字: 15,000+
   - 无重复

✅ 互换按钮样式检查通过
   - 无圆形背景
   - 无阴影效果
   - 使用简洁样式
============================================================
✅ 所有 UI 验收测试通过! 🎉
```

### 故障排查

#### Q: 测试失败怎么办？
**A**: 检查以下几点：
1. 查看具体哪个字段不匹配
2. 检查 `content.json` 是否包含该字段
3. 检查 `phase5_generateTranslations` 函数的映射逻辑
4. 手动修复翻译文件

#### Q: 字段映射错误怎么办？
**A**:
1. 运行测试确认具体错误: `pnpm tool:test "tool name"`
2. 修改 `scripts/auto-tool-generator.js` 中的 `phase5_generateTranslations` 函数
3. 重新运行生成流程
4. 再次测试验证

#### Q: 如何添加新字段？
**A**:
1. 在 Phase 4 的 GPT prompt 中添加新字段要求
2. 在 `phase5_generateTranslations` 中添加映射逻辑
3. 在 `test-auto-tool-generator.js` 中添加测试验证
4. 更新页面组件以使用新字段

---

**享受自动化带来的效率提升吧！🎉**
