# 自动化工具生成器 - 新增验证功能文档

## 概述

在 `scripts/auto-tool-generator.js` 中添加了两个新的验证流程：

1. **Phase 4.5: 字数验证和重新生成机制**
2. **Phase 8.5: 页面错误自动检查**

---

## 功能一：Phase 4.5 - 字数验证和重新生成

### 功能说明

在 Phase 4（内容生成）和 Phase 5（翻译文件生成）之间，自动验证所有 section 的字数是否符合要求。如果不符合，会自动重新生成不合格的内容。

### 验证规则

| Section | 字数要求 | 允许误差范围 |
|---------|---------|-------------|
| h1.wordCount | 5-7 | 严格 |
| heroDescription.wordCount | 30-40 | 25-45 |
| whatIs.wordCount | 70 | 65-75 |
| example.wordCount | 40-50 | 35-55 |
| howTo.steps 每个 | 40 | 35-45 |
| funFacts 每个 | 30 | 25-35 |
| interestingSections.sections 每个 | 60 | 55-65 |
| highlights.features 每个 | 50 | 45-55 |
| testimonials 每个 | 50-60 | 45-65 |
| faqs 每个 | 30-80 | 严格 |

### 工作流程

1. **验证**：调用 `validateWordCounts()` 检查所有 section 的字数
2. **记录问题**：记录所有不符合要求的 section
3. **重新生成**：
   - 针对每个不合格的 section，调用 `regenerateSection()`
   - 使用与 Phase 4 相同的 OpenAI 模型（CONFIG.contentModel）
   - 只重新生成有问题的部分，保留正确的内容
4. **重试机制**：
   - 最多重试 2 次（可通过 `CONFIG.maxWordCountRetries` 配置）
   - 每次重试后保存中间结果到 `.tool-generation/{keyword}/content-retry-{N}.json`
   - 如果达到最大重试次数仍不符合，记录警告但继续流程
5. **保存结果**：
   - 最终内容保存到 `.tool-generation/{keyword}/content-final.json`
   - 替换原来的 `content.json`

### 新增函数

#### 1. `validateWordCounts(contentData)`
- **功能**：验证所有 section 的字数
- **返回**：不符合要求的 section 数组
- **示例**：
```javascript
const invalidSections = validateWordCounts(contentData);
// 返回：
// [
//   {
//     section: 'h1',
//     name: 'H1标题',
//     actual: 10,
//     expected: '5-7',
//   },
//   ...
// ]
```

#### 2. `regenerateSection(keyword, sectionInfo, contentData, researchData, contentResearchData)`
- **功能**：重新生成单个不合格的 section
- **参数**：
  - `keyword`: 工具关键词
  - `sectionInfo`: 包含 section 名称、实际字数、期望字数等信息
  - `contentData`: 当前内容数据
  - `researchData`: Phase 1 的调研数据
  - `contentResearchData`: Phase 2 的内容调研数据
- **返回**：重新生成的数据

#### 3. `updateContentData(contentData, sectionInfo, newData)`
- **功能**：更新 contentData 中的特定 section
- **参数**：
  - `contentData`: 要更新的内容对象
  - `sectionInfo`: section 信息
  - `newData`: 新数据

#### 4. `getNestedValue(obj, path)`
- **功能**：获取嵌套对象的值
- **示例**：`getNestedValue(data, 'h1.wordCount')` → 获取 `data.h1.wordCount`

#### 5. `phase4_5_validateAndRegenerate(keyword, contentData, researchData, contentResearchData)`
- **功能**：Phase 4.5 主函数
- **返回**：验证并可能重新生成后的 contentData

---

## 功能二：Phase 8.5 - 页面错误自动检查

### 功能说明

在工具生成完成后，自动启动开发服务器并访问新生成的页面，检查是否有错误。

### 工作流程

1. **检查服务器**：检查端口（默认 3000）是否有服务运行
2. **启动服务器**（如果需要）：
   - 如果服务器未运行，自动启动 `pnpm dev`
   - 等待服务器就绪（最多 30 秒）
3. **访问页面**：
   - 访问 `http://localhost:3000/{tool-slug}`
   - 检查 HTTP 状态码
4. **检查错误**：
   - 状态码 200：检查页面内容是否包含错误标记
   - 状态码 404：页面未找到
   - 其他状态码：报告错误
5. **报告结果**：
   - 成功：显示页面 URL 供用户访问
   - 失败：显示错误信息和建议

### 新增函数

#### 1. `isPortInUse(port)`
- **功能**：检查端口是否被占用
- **参数**：端口号
- **返回**：`true` 或 `false`
- **支持平台**：Windows 和 Unix-like 系统

#### 2. `waitForServer(port, timeout)`
- **功能**：等待服务器启动
- **参数**：
  - `port`: 端口号
  - `timeout`: 超时时间（毫秒），默认 30000
- **返回**：服务器是否就绪

#### 3. `phase8_5_checkPageErrors(keyword)`
- **功能**：Phase 8.5 主函数
- **流程**：
  1. 检查服务器是否运行
  2. 如需要则启动服务器
  3. 访问页面并检查错误
  4. 报告结果
- **返回**：
```javascript
{
  success: true/false,
  error: '错误信息',
  warning: '警告信息',
  skipped: true/false  // 如果功能被禁用
}
```

---

## 配置选项

在 `CONFIG` 对象中添加了以下新配置：

```javascript
const CONFIG = {
  // ... 现有配置 ...

  // 🎯 新增验证配置
  enableWordCountValidation: process.env.ENABLE_WORD_COUNT_VALIDATION !== 'false', // 默认开启
  enablePageErrorCheck: process.env.ENABLE_PAGE_ERROR_CHECK !== 'false', // 默认开启
  devServerPort: process.env.DEV_SERVER_PORT || 3000,
  maxWordCountRetries: 2, // 字数验证最多重试次数
  pageCheckTimeout: 30000, // 页面检查超时时间（毫秒）
};
```

### 环境变量配置

可以通过环境变量控制这些功能：

```bash
# 禁用字数验证
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "tool name"

# 禁用页面错误检查
ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "tool name"

# 同时禁用两个功能
ENABLE_WORD_COUNT_VALIDATION=false ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "tool name"

# 使用不同的端口
DEV_SERVER_PORT=3001 node scripts/auto-tool-generator.js "tool name"
```

---

## 使用示例

### 基本使用（所有功能开启）

```bash
node scripts/auto-tool-generator.js "emoji translator"
```

**执行流程**：
```
Phase 1: 产品调研
Phase 2: 内容调研
Phase 3: 代码生成
Phase 4: 内容生成
Phase 4.5: 字数验证和重新生成  ← 新增
  ├─ 验证所有 section 字数
  ├─ 发现 3 个不合格的 section
  ├─ 重新生成不合格内容
  └─ 保存最终内容
Phase 5: 生成翻译文件
Phase 6: 图片生成（占位）
Phase 7: SEO 配置
Phase 8.5: 页面错误自动检查  ← 新增
  ├─ 检查服务器状态
  ├─ 启动开发服务器（如需要）
  ├─ 访问页面：http://localhost:3000/emoji-translator
  └─ ✓ 页面加载成功
```

### 禁用字数验证

```bash
ENABLE_WORD_COUNT_VALIDATION=false node scripts/auto-tool-generator.js "emoji translator"
```

### 禁用页面检查

```bash
ENABLE_PAGE_ERROR_CHECK=false node scripts/auto-tool-generator.js "emoji translator"
```

### 自定义配置

```bash
# 使用不同的端口，最多重试 3 次
DEV_SERVER_PORT=3001 node scripts/auto-tool-generator.js "emoji translator"
```

如需修改最大重试次数，直接编辑 `CONFIG.maxWordCountRetries`。

---

## 输出文件

### 字数验证相关文件

在 `.tool-generation/{keyword}/` 目录下：

- `content.json` - Phase 4 原始生成的内容
- `content-retry-1.json` - 第一次重试后的内容
- `content-retry-2.json` - 第二次重试后的内容（如果需要）
- `content-final.json` - 最终验证通过的内容（会替换原 content.json）

### 日志示例

```
============================================================
📍 Phase 4.5: 字数验证和重新生成
============================================================
ℹ️  开始验证字数...
⚠️  发现 3 个 section 字数不符合要求，开始重新生成...
ℹ️  重新生成: H1标题 (当前字数: 10, 期望: 5-7)
ℹ️  调用 gpt-4o API...
✅ ✓ H1标题 已重新生成
ℹ️  重新生成: Hero描述 (当前字数: 50, 期望: 25-45)
ℹ️  调用 gpt-4o API...
✅ ✓ Hero描述 已重新生成
ℹ️  重试 1 的内容已保存到: .tool-generation/emoji-translator/content-retry-1.json
ℹ️  开始验证字数...
✅ 所有 section 字数验证通过！
✅ 最终内容已保存到: .tool-generation/emoji-translator/content-final.json

============================================================
📍 Phase 8.5: 页面错误自动检查
============================================================
ℹ️  检查端口 3000 是否有服务运行...
ℹ️  开发服务器未运行，正在启动...
ℹ️  等待服务器启动（最多 30 秒）...
ℹ️  开发服务器已启动
✅ 开发服务器已就绪
ℹ️  正在访问页面: http://localhost:3000/emoji-translator
ℹ️  HTTP 状态码: 200
✅ ✓ 页面加载成功！
✅ ✓ 页面内容看起来正常

访问页面: http://localhost:3000/emoji-translator
```

---

## 错误处理

### 字数验证错误处理

1. **OpenAI API 调用失败**：
   - 记录错误日志
   - 保留原内容
   - 继续处理其他 section

2. **达到最大重试次数**：
   - 记录警告，列出仍不符合要求的 section
   - 不中断流程，继续后续步骤
   - 建议用户手动检查

3. **JSON 解析失败**：
   - 记录错误
   - 保留原内容
   - 继续流程

### 页面检查错误处理

1. **服务器启动失败**：
   - 记录错误信息
   - 返回失败状态
   - 不阻塞整个流程

2. **服务器启动超时**：
   - 30 秒后超时
   - 终止服务器进程
   - 返回超时错误

3. **页面访问失败**：
   - 404：提示检查路由配置
   - 其他错误：显示具体错误信息
   - 不阻塞后续步骤

4. **页面包含错误**：
   - 返回警告而非失败
   - 建议用户手动检查
   - 显示页面 URL

---

## 注意事项

1. **字数验证**：
   - 每次重新生成都会调用 OpenAI API，产生额外费用
   - 建议根据内容质量要求决定是否开启
   - 最多重试 2 次，避免无限循环

2. **页面检查**：
   - 如果开发服务器已在运行，不会重启
   - 脚本不会自动关闭服务器，需要用户手动停止
   - 仅做基本检查，不替代人工测试

3. **性能考虑**：
   - Phase 4.5 可能显著增加生成时间（每个不合格 section 需要额外 API 调用）
   - Phase 8.5 需要等待服务器启动，增加 20-30 秒

4. **最佳实践**：
   - 首次运行时开启所有验证
   - 调试时可以禁用验证以加快速度
   - 生产环境建议保持验证开启

---

## 后续改进建议

1. **字数验证**：
   - 添加字数统计的自动化单元测试
   - 支持自定义字数规则（通过配置文件）
   - 添加字数分布报告

2. **页面检查**：
   - 集成 Puppeteer 进行更深入的页面检查
   - 检查 JavaScript 控制台错误
   - 截图保存以便调试
   - 检查页面性能指标

3. **通用改进**：
   - 添加 webhook 通知（成功/失败）
   - 生成详细的 HTML 报告
   - 支持批量生成多个工具

---

## 相关文件

- `/Users/jason-chen/Downloads/project/vibetrans/scripts/auto-tool-generator.js` - 主脚本文件
- `.tool-generation/{keyword}/` - 输出目录
- `messages/pages/{keyword}/en.json` - 翻译文件
- `src/app/[locale]/(marketing)/(pages)/{keyword}/page.tsx` - 页面文件

---

## 联系方式

如有问题或建议，请查看项目的 CLAUDE.md 或提交 issue。
