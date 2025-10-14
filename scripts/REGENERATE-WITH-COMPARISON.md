# 智能 Prompt 对比重新生成脚本

## 概述

`regenerate-creative-projects.ts` 脚本已升级，现在会在调用 Gemini 生成新 prompt 之前，先检查是否已存在 prompt，并进行智能对比。

## 工作流程

```
Step 1: 检查现有 prompt
   ↓
Step 2: 使用 Gemini 生成新 prompt
   ↓
Step 3: 使用 Gemini 对比两个 prompt 的质量
   ↓ (选择更好的 prompt)
Step 4: 使用最终 prompt 生成图片
   ↓
Step 5: 转换为 WebP 格式
```

## 关键特性

### 1. 现有 Prompt 检查
- 脚本开始时先检查 `EXISTING_PROMPT` 常量
- 如果存在，显示其长度和前 100 个字符
- 这个 prompt 来自于最初的完整生成脚本（如 `generate-alien-text-images.ts`）

### 2. 新 Prompt 生成
- 使用 Gemini 的 `testGeneratePrompt` 函数生成新的 prompt
- 基于 `SECTION_TITLE` 和 `SECTION_CONTENT` 生成
- 确保符合几何扁平风格的要求

### 3. 智能对比
- 使用 Gemini 2.0 Flash 模型进行对比评估
- 评估标准：
  1. 细节和具体性
  2. 色彩方案准确性（必须使用天蓝色 #87CEEB 作为主色）
  3. 几何扁平风格的遵循度
  4. 场景描述的完整性
  5. 关键词集成度

### 4. 决策输出
- Gemini 会返回：
  - `DECISION`: USE_EXISTING 或 USE_NEW
  - `REASON`: 一句话解释为什么选择这个
  - `RECOMMENDATION`: 选中的完整 prompt

### 5. 图片生成
- 使用最终选定的 prompt 调用 KIE API 生成图片
- 转换为 WebP 格式并优化到 90KB

## 使用方法

```bash
pnpm tsx scripts/regenerate-creative-projects.ts
```

## 环境变量要求

需要以下任一环境变量：
- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY`

如果没有 API key，脚本会默认使用新生成的 prompt。

## 输出示例

```
======================================================================
🎨 Regenerating: Alien Text for Creative Projects
======================================================================

📋 Step 1: Checking existing prompt...
✅ Found existing prompt (834 chars)
📝 Existing: Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects". Sky blue (#87CEEB)...

📋 Step 2: Generating new prompt with Gemini...
✅ Generated new prompt (756 chars)
📝 New: Geometric flat illustration showing creative workspace with laptop displaying alien text, cartoon creator...

📋 Step 3: Comparing prompts with Gemini...

🎯 Decision: USE_EXISTING
💡 Reason: Existing prompt has more detailed scene description and better integration of creative elements.

📝 Final prompt: Geometric Flat Style cartoon illustration for "Alien Text for Creative Projects"...

📋 Step 4: Generating image with KIE API...
✅ Image generated: https://...

📋 Step 5: Converting to WebP...

======================================================================
✅ Success: alien-text-creative-projects.webp (87KB)
📁 Location: public/images/docs/alien-text-creative-projects.webp
======================================================================
```

## 优势

1. **避免重复工作**：如果现有 prompt 已经很好，就不会浪费资源重新生成
2. **质量保证**：通过 AI 对比确保使用最佳 prompt
3. **透明度**：清晰显示每一步的决策过程
4. **灵活性**：可以轻松修改 `SECTION_TITLE` 和 `SECTION_CONTENT` 来适应不同场景

## 适配到其他脚本

要将此功能应用到其他单个内容重新生成脚本：

1. 从完整生成脚本（如 `generate-xxx-images.ts`）中提取对应的 prompt 到 `EXISTING_PROMPT`
2. 设置正确的 `SECTION_TITLE` 和 `SECTION_CONTENT`
3. 更新 `filename` 参数
4. 运行脚本

## 注意事项

- 比较过程会调用两次 Gemini API（一次生成新 prompt，一次对比）
- 如果对比失败，会默认使用新生成的 prompt
- 建议在首次使用时检查输出，确保对比逻辑符合预期
