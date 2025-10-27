# Nahuatl Translator Tool Component

一个基于智能API的Nahuatl语言翻译工具组件，支持双向翻译、语音输入输出和文件上传功能。

## 功能特性

### 🧠 智能翻译功能
- **自动语言检测**: 自动识别源语言
- **多目标语言支持**: 支持英语、西班牙语、中文等多种语言
- **上下文感知翻译**: 支持添加上下文注释以提高翻译准确性
- **智能API集成**: 使用 `/api/nahuatl-translator` 端点

### 🎤 语音功能
- **语音输入**: 支持实时语音转文字输入
- **语音播放**: 集成TextToSpeechButton进行语音播放
- **自动语言检测**: 语音输入时自动检测语言

### 📁 文件支持
- **多格式支持**: 支持 .txt 和 .docx 文件
- **智能文本提取**: 使用mammoth库处理Word文档
- **文件管理**: 显示文件名和移除功能

### 💻 用户界面
- **响应式设计**: 适配桌面和移动设备
- **深色模式支持**: 完整的暗色主题
- **实时反馈**: 加载状态、错误提示、语言检测结果
- **操作功能**: 复制、下载、重置功能

## 组件结构

```
nahuatl-translator/
├── NahuatlTranslatorTool.tsx  # 主组件
├── index.ts                   # 导出文件
└── README.md                  # 说明文档
```

## 使用方法

### 基本用法

```tsx
import { NahuatlTranslatorTool } from '@/components/blocks/nahuatl-translator';

// 在页面中使用
<NahuatlTranslatorTool
  pageData={pageData}
  locale="en"
/>
```

### PageData 格式

组件需要一个 `pageData` 对象来配置显示文本：

```tsx
const pageData = {
  tool: {
    inputLabel: "输入文本",
    inputPlaceholder: "请输入要翻译的文本...",
    outputLabel: "翻译结果",
    outputPlaceholder: "翻译结果将显示在这里...",
    translateButton: "翻译",
    resetButton: "重置",
    loading: "翻译中...",
    uploadButton: "上传文件",
    uploadHint: "支持 .txt 和 .docx 文件",
    noInput: "请输入要翻译的文本",
    error: "翻译失败，请重试"
  }
};
```

## 技术实现

### API 集成

组件调用智能翻译API：

```typescript
const response = await fetch('/api/nahuatl-translator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: inputText,
    targetLanguage: targetLanguage,
    context: contextNotes,
    sourceLanguage: 'auto'
  }),
});
```

### 语音识别

使用Web Speech API进行语音输入：

```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'auto';
```

### 文件处理

支持多种文件格式的文本提取：

- **文本文件**: 直接读取内容
- **Word文档**: 使用mammoth库提取文本

## 样式和主题

组件使用Tailwind CSS样式系统：
- 支持深色/浅色模式切换
- 响应式布局设计
- 一致的颜色主题和间距

## 浏览器兼容性

### 必需支持
- 现代浏览器 (ES2020+)
- Web Speech API (语音输入功能)
- File API (文件上传功能)

### 可选功能
- 语音输入功能: 在不支持Speech API的浏览器中自动隐藏
- 文本转语音: 使用原生TTS功能

## 性能优化

- 防抖处理避免频繁API调用
- 文件读取使用Promise优化
- 语音状态管理避免内存泄漏
- 响应式布局减少重排重绘

## 扩展性

组件设计支持扩展：
- 可轻松添加新的目标语言
- 支持自定义API端点
- 可集成更多文件格式支持
- 支持自定义语音识别配置

## 依赖项

```json
{
  "mammoth": "^1.6.0"
}
```

内部依赖：
- `@/components/ui/text-to-speech-button` - 语音播放组件

## 错误处理

组件包含完整的错误处理机制：
- API调用错误处理
- 文件读取错误处理
- 语音识别错误处理
- 用户友好的错误提示

## 注意事项

1. **语音功能**: 需要HTTPS环境才能使用语音识别
2. **文件大小**: 建议限制上传文件大小以提升性能
3. **API限制**: 注意智能翻译API的调用频率限制
4. **浏览器兼容**: 语音功能在某些浏览器中可能不可用