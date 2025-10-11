# 🎯 模型配置指南

## 📖 快速配置

自动化工具生成器支持灵活配置调研和内容生成模型。

---

## 🔧 配置方法

### **方法1：使用环境变量（推荐）**

在 `.env.local` 文件中配置：

```bash
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-proj-your-api-key-here

# 调研模型（可选，默认：o3-mini）
RESEARCH_MODEL=o3-mini

# 内容生成模型（可选，默认：gpt-4o）
CONTENT_MODEL=gpt-4o
```

### **方法2：直接修改脚本**

编辑 `scripts/auto-tool-generator.js` 第 38-56 行：

```javascript
const CONFIG = {
  gptApiKey: process.env.OPENAI_API_KEY || '',

  researchModel: 'o3-mini',  // ← 改这里
  contentModel: 'gpt-4o',    // ← 改这里

  // ...
};
```

---

## 📊 可用模型对比

| 模型 | 推理能力 | 成本/1K tokens | 速度 | 适合场景 |
|------|---------|----------------|------|----------|
| **o3** | ⭐⭐⭐⭐⭐ | $0.010 | 🐌 | 最强推理调研 |
| **o3-mini** | ⭐⭐⭐⭐ | $0.002 | 🚀🚀🚀 | 性价比调研 |
| **gpt-4o** | ⭐⭐⭐⭐ | $0.005 | 🚀🚀 | 高质量内容 |
| **gpt-4o-mini** | ⭐⭐⭐ | $0.0015 | 🚀🚀🚀 | 成本敏感 |

---

## 💰 费用对比

### **不同配置的预估费用**

| 配置名称 | 调研模型 | 内容模型 | 总费用 | 适合场景 |
|---------|---------|---------|--------|----------|
| **默认配置** | o3-mini | gpt-4o | ~$0.07 | ✅ 推荐：性价比最高 |
| **极致性能** | o3 | gpt-4o | ~$0.15 | 追求最高质量 |
| **省钱模式** | o3-mini | gpt-4o-mini | ~$0.04 | 成本敏感 |
| **均衡模式** | gpt-4o | gpt-4o | ~$0.10 | 均衡性价比 |
| **极限省钱** | gpt-4o-mini | gpt-4o-mini | ~$0.03 | 测试用途 |

---

## 🎯 推荐配置

### **配置1：默认配置（强烈推荐）**

```bash
RESEARCH_MODEL=o3-mini
CONTENT_MODEL=gpt-4o
```

**理由**：
- ✅ o3-mini 推理能力强，调研质量高
- ✅ gpt-4o 内容质量最好
- ✅ 成本适中（~$0.07）
- ✅ 速度快

**适合**：大多数用户

---

### **配置2：极致性能**

```bash
RESEARCH_MODEL=o3
CONTENT_MODEL=gpt-4o
```

**理由**：
- ✅ o3 最强推理，调研最深入
- ✅ gpt-4o 最高质量内容
- ⚠️ 成本较高（~$0.15）
- ⚠️ 速度较慢

**适合**：追求极致质量，不在乎成本

---

### **配置3：省钱模式**

```bash
RESEARCH_MODEL=o3-mini
CONTENT_MODEL=gpt-4o-mini
```

**理由**：
- ✅ o3-mini 调研质量仍然不错
- ⚠️ gpt-4o-mini 内容质量略降
- ✅ 成本很低（~$0.04）
- ✅ 速度快

**适合**：成本敏感，可以接受内容质量略降

---

### **配置4：均衡模式**

```bash
RESEARCH_MODEL=gpt-4o
CONTENT_MODEL=gpt-4o
```

**理由**：
- ✅ 统一使用 gpt-4o
- ✅ 调研和内容质量均衡
- ✅ 成本适中（~$0.10）
- ✅ 速度适中

**适合**：不想太多纠结，选一个万金油

---

## 🚀 使用示例

### **默认配置运行**

```bash
# 使用默认配置（o3-mini + gpt-4o）
pnpm tool:auto "alien text generator"
```

### **自定义配置运行**

```bash
# 临时使用 o3 做调研
RESEARCH_MODEL=o3 pnpm tool:auto "alien text generator"

# 临时使用 gpt-4o-mini 生成内容
CONTENT_MODEL=gpt-4o-mini pnpm tool:auto "alien text generator"

# 同时自定义两个模型
RESEARCH_MODEL=o3 CONTENT_MODEL=gpt-4o pnpm tool:auto "alien text generator"
```

---

## 📝 模型详细说明

### **o3（最强推理模型）**

- **发布时间**：2024年12月
- **特点**：OpenAI 最强推理模型
- **优势**：深度思考，逻辑推理能力极强
- **劣势**：速度慢，成本高（是 o3-mini 的 5倍）
- **适合**：需要深度分析的调研任务

### **o3-mini（性价比推理模型）**

- **发布时间**：2024年12月
- **特点**：轻量级推理模型
- **优势**：推理能力强，速度快，成本低
- **劣势**：推理深度不如 o3
- **适合**：大多数调研任务

### **gpt-4o（多模态旗舰模型）**

- **发布时间**：2024年5月
- **特点**：多模态能力，综合能力强
- **优势**：内容生成质量高，速度快
- **劣势**：成本中等
- **适合**：高质量内容生成

### **gpt-4o-mini（轻量级多模态模型）**

- **发布时间**：2024年7月
- **特点**：轻量级版本
- **优势**：速度快，成本低
- **劣势**：内容质量略低于 gpt-4o
- **适合**：成本敏感的内容生成

---

## ⚠️ 注意事项

### **1. 关于 "ChatGPT-5"**

OpenAI 目前没有发布 "GPT-5" 或 "ChatGPT-5"。

如果你想使用最新最强的模型：
- **调研**：使用 `o3`（最强推理）
- **内容**：使用 `gpt-4o`（最强内容生成）

### **2. 模型名称必须准确**

确保使用正确的模型名称：
- ✅ 正确：`o3-mini`, `o3`, `gpt-4o`, `gpt-4o-mini`
- ❌ 错误：`gpt-5`, `chatgpt-5`, `o3mini`

### **3. API Key 权限**

确保你的 API Key 有权限访问这些模型。某些模型可能需要申请访问权限。

---

## 🔍 如何选择模型

### **根据优先级选择**

#### **1. 如果最重视质量**
```bash
RESEARCH_MODEL=o3        # 最强调研
CONTENT_MODEL=gpt-4o     # 最强内容
```

#### **2. 如果最重视性价比（推荐）**
```bash
RESEARCH_MODEL=o3-mini   # 调研够用
CONTENT_MODEL=gpt-4o     # 内容不能降
```

#### **3. 如果最重视成本**
```bash
RESEARCH_MODEL=o3-mini      # 调研够用
CONTENT_MODEL=gpt-4o-mini   # 内容能省就省
```

#### **4. 如果最重视速度**
```bash
RESEARCH_MODEL=gpt-4o-mini  # 最快
CONTENT_MODEL=gpt-4o-mini   # 最快
```

---

## 📞 常见问题

### **Q1: 我应该用 o3 还是 o3-mini 做调研？**

**A**: 大多数情况推荐 `o3-mini`：
- ✅ 推理能力已经很强
- ✅ 成本只有 o3 的 1/5
- ✅ 速度快 3-5 倍

除非你需要极致的调研深度，否则 o3-mini 完全够用。

### **Q2: 内容生成能用 o3-mini 吗？**

**A**: 可以，但不推荐：
- ⚠️ o3-mini 擅长推理，不擅长创作
- ⚠️ 内容生成质量明显不如 gpt-4o
- 建议：调研用 o3-mini，内容用 gpt-4o

### **Q3: 为什么没有 GPT-5？**

**A**: OpenAI 目前最新的模型是：
- **推理**：o3 系列（2024年12月发布）
- **内容生成**：gpt-4o 系列

"GPT-5" 尚未发布。

### **Q4: 如何知道我的 API Key 支持哪些模型？**

**A**: 访问 https://platform.openai.com/docs/models 查看可用模型。

---

## 🎁 最佳实践总结

### **推荐配置矩阵**

| 场景 | 调研模型 | 内容模型 | 总成本 |
|------|---------|---------|--------|
| 日常使用 | o3-mini | gpt-4o | $0.07 |
| 重要项目 | o3 | gpt-4o | $0.15 |
| 测试调试 | o3-mini | gpt-4o-mini | $0.04 |
| 批量生成 | gpt-4o-mini | gpt-4o-mini | $0.03 |

### **我的建议**

从 **默认配置** 开始：
```bash
RESEARCH_MODEL=o3-mini
CONTENT_MODEL=gpt-4o
```

如果发现：
- 调研不够深入 → 改用 `o3`
- 内容质量不满意 → 保持 `gpt-4o`（已经最好）
- 成本太高 → 内容改用 `gpt-4o-mini`

---

**现在你可以根据需求灵活配置模型了！🚀**
