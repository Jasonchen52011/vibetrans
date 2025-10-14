# 环境变量加载问题分析与解决方案

## 🔍 问题现象

运行图片生成脚本时，出现以下错误：

```bash
# 直接运行脚本
pnpm tsx scripts/regenerate-pig-latin-images.ts
❌ Error: VOLC_ACCESS_KEY and VOLC_SECRET_KEY are required
❌ Error: Missing Gemini API key

# 使用 run-with-env.sh 包装后运行
./scripts/run-with-env.sh scripts/regenerate-pig-latin-images.ts
✅ 成功运行
```

## 🎯 根本原因

**`.env.local` 文件只会在 Next.js 应用运行时自动加载，不会在普通 Node.js/tsx 脚本中自动加载。**

### 为什么？

1. **Next.js 自动加载机制**：
   - Next.js 内置了环境变量加载功能
   - 当运行 `pnpm dev` 或 `pnpm build` 时，Next.js 会自动读取 `.env.local`
   - 这是 Next.js 框架层面的功能

2. **普通 tsx 脚本没有自动加载**：
   - `tsx` 是 TypeScript 执行器，不是 Next.js 应用
   - 它不会自动读取 `.env.local` 文件
   - 需要手动加载环境变量

### 验证测试结果

```bash
# Test 1: 直接使用 tsx
pnpm tsx -e "console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY)"
输出: GEMINI_API_KEY: undefined
结果: ❌ 失败

# Test 2: 使用 run-with-env.sh
./scripts/run-with-env.sh -e "console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY)"
输出: GEMINI_API_KEY: AIzaSy...
结果: ✅ 成功
```

## 🛠️ 解决方案

### 方案 1：使用 `run-with-env.sh` 包装脚本（推荐）✅

这是当前的临时解决方案，已经实现：

```bash
# scripts/run-with-env.sh
#!/bin/bash
set -a
source .env.local
set +a
pnpm tsx "$@"
```

**使用方法：**
```bash
./scripts/run-with-env.sh scripts/regenerate-pig-latin-images.ts
./scripts/run-with-env.sh scripts/generate-pig-latin-seo-image.ts
```

**优点：**
- ✅ 简单有效
- ✅ 不需要修改现有脚本
- ✅ 一个脚本解决所有问题

**缺点：**
- ⚠️ 需要记住使用包装脚本
- ⚠️ 多了一个步骤

---

### 方案 2：在脚本顶部添加 dotenv 加载

在每个脚本的开头添加：

```typescript
// 在文件最顶部，所有 import 之前
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// 然后是其他 imports
import { generateImage } from '../src/lib/volcano-image';
// ...
```

**优点：**
- ✅ 不需要额外的包装脚本
- ✅ 可以直接运行 `pnpm tsx scripts/xxx.ts`

**缺点：**
- ⚠️ 需要修改所有现有脚本
- ⚠️ 每个脚本都要添加相同的代码

---

### 方案 3：创建全局 tsx 配置（最优方案）⭐

创建一个 `scripts/env-loader.ts` 文件：

```typescript
// scripts/env-loader.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

console.log('✅ 环境变量已加载');
```

然后在 `package.json` 中添加 npm scripts：

```json
{
  "scripts": {
    "image:regenerate": "tsx scripts/env-loader.ts && tsx scripts/regenerate-pig-latin-images.ts",
    "image:seo": "tsx scripts/env-loader.ts && tsx scripts/generate-pig-latin-seo-image.ts",
    "image:howto": "tsx scripts/env-loader.ts && tsx scripts/capture-pig-latin-how-to-screenshot.ts"
  }
}
```

**优点：**
- ✅ 不需要修改现有脚本
- ✅ 可以直接使用 `pnpm image:regenerate`
- ✅ 更符合 Node.js 项目的标准做法

**缺点：**
- ⚠️ 需要为每个脚本配置 npm script

---

## 📝 两个核心生图流程的 API 配置检查

### 流程 1: 完整页面生成（如 `generate-albanian-to-english-images.ts`）

**使用的 API：**
- ✅ **图片生成**：多 API 链式调用
  - Ideogram v3 (DALL-E 3)
  - Seedream 4.0 (dreem4.0)
  - Nano Banana (nanobanana)

**配置文件：**
```typescript
// src/lib/article-illustrator/image-generator.ts
const providers = [
  { name: 'ideogram-v3', ...},     // Priority 1
  { name: 'seedream-4.0', ...},    // Priority 2
  { name: 'nanobanana', ...},      // Priority 3
];
```

**环境变量需求：**
- 不需要 Gemini API（使用硬编码 prompts）
- 不需要 Volcano 4.0 API（使用其他图片 API）

**状态：** ✅ **配置正确，无需修改**

---

### 流程 2: AI 智能生成（如 `generate-pig-latin-images-ai.ts`）

**使用的 API：**
- ✅ **Gemini 2.0 Flash**：分析内容，生成 prompt
- ✅ **Volcano Engine 4.0**：根据 prompt 生成图片

**配置文件：**
```typescript
// src/lib/article-illustrator/gemini-analyzer.ts
const apiKey = process.env.GEMINI_API_KEY ||
               process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
               process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

// src/lib/volcano-image.ts
const accessKey = process.env.VOLC_ACCESS_KEY;
const secretKey = process.env.VOLC_SECRET_KEY;
```

**环境变量配置：**

```bash
# .env.local 中已配置 ✅
GEMINI_API_KEY="AIzaSyDMtTu8WN1WiHiGj7H2mqjhuqrBG9O9RuM"
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyDMtTu8WN1WiHiGj7H2mqjhuqrBG9O9RuM"

VOLC_ACCESS_KEY=AKLTOGYyZWJhNDI5NGNhNDI5MGEyYWQyOTM5NWFhMWNmNzE
VOLC_SECRET_KEY=TURKbE1URTVOakUzWm1JNU5HVmhPRGcwTlRKbVpHTTNaREJqTkRZM1ptUQ==
VOLC_T2I_REQ_KEY=jimeng_t2i_v40
```

**状态：** ✅ **API 密钥配置正确**

**问题：** ⚠️ **环境变量未正确加载到脚本中**

---

## 🎯 推荐方案总结

### 当前最佳实践（已实现）

**使用 `run-with-env.sh` 包装所有图片生成脚本：**

```bash
# ✅ 重新生成特定图片
./scripts/run-with-env.sh scripts/regenerate-pig-latin-images.ts

# ✅ 生成 SEO og:image
./scripts/run-with-env.sh scripts/generate-pig-latin-seo-image.ts

# ✅ 生成 How-To 截图（需要先 pnpm dev）
./scripts/run-with-env.sh scripts/capture-pig-latin-how-to-screenshot.ts

# ✅ 完整页面图片生成
./scripts/run-with-env.sh scripts/generate-albanian-to-english-images.ts
```

### 长期改进建议

1. **标准化所有脚本**：将所有图片生成脚本添加到 `package.json`
   ```json
   {
     "scripts": {
       "img:regen": "./scripts/run-with-env.sh scripts/regenerate-pig-latin-images.ts",
       "img:seo": "./scripts/run-with-env.sh scripts/generate-pig-latin-seo-image.ts"
     }
   }
   ```

2. **文档化**：在 `scripts/README.md` 中说明环境变量加载机制

3. **错误提示优化**：在脚本开头检查关键环境变量，给出友好提示

---

## 📊 API 配置验证清单

| API 服务 | 环境变量 | .env.local 配置 | 脚本访问 | 状态 |
|---------|----------|----------------|----------|------|
| Gemini 2.0 Flash | `GEMINI_API_KEY` | ✅ 已配置 | ✅ 使用 run-with-env.sh | ✅ 正常 |
| Volcano Engine 4.0 | `VOLC_ACCESS_KEY` | ✅ 已配置 | ✅ 使用 run-with-env.sh | ✅ 正常 |
| Volcano Engine 4.0 | `VOLC_SECRET_KEY` | ✅ 已配置 | ✅ 使用 run-with-env.sh | ✅ 正常 |
| Ideogram v3 | (内置在 SDK) | N/A | N/A | ✅ 正常 |
| Seedream 4.0 | (内置在 SDK) | N/A | N/A | ✅ 正常 |

---

## 🔧 今日完成工作总结

### 生成的图片
1. ✅ **kids-letter-blocks.webp** (87KB) - Early Days of Pig Latin
2. ✅ **docs-transform.webp** (61KB) - Translate Large Documents
3. ✅ **pig-latin-translator-how-to.webp** (40KB) - How to Section 截图
4. ✅ **what-is-pig-latin-translator.webp** (90KB) - SEO og:image

### 创建的脚本
1. ✅ **run-with-env.sh** - 环境变量加载包装脚本
2. ✅ **regenerate-pig-latin-images.ts** - 重新生成特定图片
3. ✅ **generate-pig-latin-seo-image.ts** - 生成 SEO 图片
4. ✅ **capture-pig-latin-how-to-screenshot.ts** - 截图脚本

### 修复的问题
1. ✅ 页面组件从硬编码路径改为读取 JSON 配置
2. ✅ 图片文件名从语义化改为视觉化描述
3. ✅ Alt 标签优化到 6-9 字
4. ✅ Gemini API 支持多环境变量名
5. ✅ 环境变量加载问题解决

---

## 📚 参考文档

- Next.js 环境变量: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- dotenv 文档: https://github.com/motdotla/dotenv
- tsx 文档: https://github.com/privatenumber/tsx
