# MiniMax-M2 CLI 工具使用指南

这是一个强大的命令行工具，让你可以在终端中直接使用 MiniMax-M2 AI 模型进行翻译、对话、摘要等任务。

## 🚀 快速开始

### 1. 检查配置
```bash
pnpm minimax config
```

### 2. 基础对话
```bash
pnpm minimax chat --text "Hello world"
```

### 3. 翻译文本
```bash
pnpm minimax translate --text "Hello world" --prompt "请将英文翻译成中文"
```

## 📋 命令详解

### `chat` - 基础对话
进行通用对话和文本处理。

**基本语法：**
```bash
pnpm minimax chat [options]
```

**选项：**
- `-t, --text <text>` - 输入文本（必需）
- `-p, --prompt <prompt>` - 提示词
- `-s, --system <system>` - 系统指令
- `--temperature <temp>` - 温度参数 (0.0-1.0)
- `--max-tokens <tokens>` - 最大令牌数
- `-v, --verbose` - 详细输出
- `--json` - JSON 格式输出

**示例：**
```bash
# 简单对话
pnpm minimax chat --text "你好，请介绍一下自己"

# 带系统指令的对话
pnpm minimax chat --text "写一首关于春天的诗" --system "你是一个诗人"

# JSON 输出
pnpm minimax chat --text "Hello" --json
```

### `translate` - 文本翻译
专业的翻译工具，默认使用翻译助手角色。

**基本语法：**
```bash
pnpm minimax translate [options]
```

**默认配置：**
- 系统指令：专业翻译助手
- 温度：0.3（更准确）
- 最大令牌：1024

**示例：**
```bash
# 英译中
pnpm minimax translate --text "Hello world" --prompt "请将英文翻译成中文"

# 中译英
pnpm minimax translate --text "今天天气很好" --prompt "请将中文翻译成英文"

# 自定义翻译风格
pnpm minimax translate --text "Hello" --prompt "请翻译成文言文"
```

### `summarize` - 文本摘要
智能文本摘要工具。

**基本语法：**
```bash
pnpm minimax summarize [options]
```

**默认配置：**
- 系统指令：专业摘要助手
- 温度：0.5
- 最大令牌：512

**示例：**
```bash
# 摘要成长篇
pnpm minimax summarize --text "长文本内容..." --prompt "请总结成一句话"

# 提取要点
pnpm minimax summarize --text "文章内容..." --prompt "请提取3个要点"

# 详细输出查看思考过程
pnpm minimax summarize --text "文本..." -v
```

### `config` - 查看配置
显示当前 CLI 配置信息。

```bash
pnpm minimax config
```

## 💡 高级用法

### 1. 管道操作
```bash
# 从文件读取内容
echo "Hello world" | pnpm minimax translate --prompt "翻译成中文"

# 从剪贴板（macOS）
pbpaste | pnpm minimax summarize --prompt "总结要点"
```

### 2. 批量处理
```bash
# 处理多个文件
for file in *.txt; do
  echo "处理文件: $file"
  cat "$file" | pnpm minimax translate --prompt "翻译成中文" --json > "${file%.txt}_zh.json"
done
```

### 3. 脚本集成
```bash
#!/bin/bash
# translate.sh - 批量翻译脚本

translate_text() {
  local text="$1"
  local result=$(pnpm minimax translate --text "$text" --prompt "翻译成中文" --json)
  echo "$result" | jq -r '.output'
}

# 使用示例
chinese_text=$(translate_text "Hello world")
echo "翻译结果: $chinese_text"
```

## 🛠️ 配置

### 环境变量
在 `.env.local` 文件中配置：

```bash
# API 密钥（必需）
MINIMAX_ANTHROPIC_API_KEY=your_api_key_here

# API 基础地址（可选，默认为官方地址）
MINIMAX_ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic

# 模型名称（可选，默认为 MiniMax-M2）
MINIMAX_ANTHROPIC_MODEL=MiniMax-M2

# 默认参数（可选）
MINIMAX_ANTHROPIC_MAX_TOKENS=2048
MINIMAX_ANTHROPIC_TEMPERATURE=0.7
```

### 检查配置
```bash
# 查看当前配置
pnpm minimax config

# 测试 API 连接
pnpm minimax chat --text "test"
```

## 📊 输出格式

### 默认输出
```
✅ 请求成功!

📤 输出结果:
你好，世界

📊 使用统计:
   - 输入令牌: 62
   - 输出令牌: 210
   - 总计令牌: 272

🕒 时间戳: 2025-11-05T02:25:32.271Z
🔗 模型: MiniMax-M2
```

### JSON 输出 (`--json`)
```json
{
  "success": true,
  "input": "Hello world",
  "output": "你好，世界",
  "model": "MiniMax-M2",
  "timestamp": "2025-11-05T02:25:32.271Z",
  "usage": {
    "input_tokens": 62,
    "output_tokens": 210,
    "total_tokens": 272
  }
}
```

## 🎯 实用场景

### 1. 开发文档翻译
```bash
# 翻译 README 文件
pnpm minimax translate --text "$(cat README.md)" --prompt "请将技术文档翻译成中文，保持格式" > README_zh.md
```

### 2. 代码注释翻译
```bash
# 提取并翻译注释
grep -r "// " src/ | head -10 | while read line; do
  echo "原文: $line"
  comment=$(echo "$line" | sed 's/\/\/ //')
  translation=$(pnpm minimax translate --text "$comment" --prompt "翻译成中文" --json | jq -r '.output')
  echo "翻译: $translation"
done
```

### 3. 内容摘要
```bash
# 快速了解文章内容
curl -s "https://example.com/article" | pup 'p text{}' | tr '\n' ' ' |
pnpm minimax summarize --prompt "总结这篇文章的主要内容" -v
```

### 4. 创意写作
```bash
# 生成营销文案
pnpm minimax chat --text "AI 翻译工具" --prompt "请为这个产品写一句吸引人的广告语"

# 生成技术文档
pnpm minimax chat --text "React Hooks" --system "你是一个技术文档专家" --prompt "请解释这个概念并提供使用示例"
```

## ⚠️ 注意事项

1. **API 限制**：注意 MiniMax API 的调用频率和配额限制
2. **令牌使用**：长文本会消耗更多 tokens，注意使用量
3. **网络连接**：需要稳定的网络连接访问 API
4. **错误处理**：脚本中应添加适当的错误处理
5. **敏感信息**：不要在命令行参数中传递敏感信息

## 🆘 故障排除

### 常见错误

1. **API Key 未设置**
```bash
❌ 错误: MINIMAX_ANTHROPIC_API_KEY 环境变量未设置
```
**解决**：在 `.env.local` 文件中设置正确的 API Key

2. **网络连接问题**
```bash
❌ 错误: API 调用异常: fetch failed
```
**解决**：检查网络连接和防火墙设置

3. **参数错误**
```bash
❌ 错误: 必须提供 --text 或 --prompt 参数
```
**解决**：确保提供必需的参数

### 调试技巧

1. **使用详细模式**：添加 `-v` 参数查看完整请求信息
2. **使用 JSON 输出**：添加 `--json` 参数便于脚本处理
3. **检查配置**：运行 `pnpm minimax config` 确认设置

## 📚 更多资源

- [MiniMax 官方文档](https://platform.minimax.io/docs)
- [Anthropic SDK 文档](https://docs.anthropic.com/claude/reference/messages)
- [项目 GitHub 仓库](https://github.com/your-repo/vibetrans)

---

享受使用 MiniMax-M2 CLI 工具！🎉