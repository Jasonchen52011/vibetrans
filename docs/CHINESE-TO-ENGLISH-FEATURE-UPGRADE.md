# Chinese to English Translator 功能升级方案

## 📋 执行摘要

**目标**: 将前端工具对接已实现的后端多模态翻译功能,实现:
1. 翻译模式选择器 (技术/法律/文学/成语俚语)
2. OCR 图像翻译
3. 语音输入功能

**状态**:
- ✅ **后端 API 已完全实现** (`/api/chinese-to-english-translator/route.ts`)
- ❌ **前端组件需要对接** (`ChineseToEnglishTranslatorTool.tsx`)

---

## 🎯 后端架构分析 (已完成)

### API Endpoint: `/api/chinese-to-english-translator`

**请求结构**:
```typescript
{
  // 输入类型 (必填)
  inputType: 'text' | 'image' | 'audio',

  // 翻译模式 (可选, 默认 'general')
  mode?: 'technical' | 'legal' | 'literary' | 'idioms' | 'general',

  // 方向 (可选, 默认 'zh-to-en')
  direction?: 'zh-to-en' | 'en-to-zh',

  // 文本输入 (inputType='text' 时)
  text?: string,

  // 图像输入 (inputType='image' 时)
  imageData?: string,          // Base64 encoded
  imageMimeType?: string,       // 'image/jpeg', 'image/png', etc.

  // 音频输入 (inputType='audio' 时)
  audioData?: string,           // Base64 encoded
  audioMimeType?: string        // 'audio/webm', 'audio/mp3', etc.
}
```

**响应结构**:
```typescript
// Text translation
{
  translated: string,
  original: string,
  mode: string,
  modeName: string,
  direction: string,
  inputType: 'text',
  message: string
}

// Image translation
{
  translated: string,
  extractedText: string,        // OCR 提取的文本
  mode: string,
  modeName: string,
  inputType: 'image',
  message: string
}

// Audio translation
{
  translated: string,
  transcription: string,         // 语音转文字结果
  mode: string,
  modeName: string,
  inputType: 'audio',
  message: string
}
```

### 支持的翻译模式

| 模式 | 中文名称 | 专业领域 | 特点 |
|------|---------|---------|------|
| `technical` | 技术翻译 | 软件/工程/科学 | 技术术语精准,行业标准 |
| `legal` | 法律翻译 | 合同/法规 | 法律术语,正式语言 |
| `literary` | 文学翻译 | 小说/诗歌 | 保留文学风格,文化韵味 |
| `idioms` | 成语俚语 | 口语/网络用语 | 解释成语,给出等效表达 |
| `general` | 通用翻译 | 日常对话 | 自然流畅,上下文准确 |

### Gemini 2.0 Flash 多模态能力

- **文本处理**: 支持中英双向翻译,上下文理解
- **图像 OCR**: 提取图片中的中文文本 (菜单/路牌/漫画)
- **音频转录**: 支持中文语音识别 + 翻译

---

## 🔨 前端实施方案

### Phase 1: 翻译模式选择器 (1-2 hours)

#### UI 设计
```
┌─────────────────────────────────────────────────┐
│  Chinese Text                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ Translation Mode: [General ▼]             │  │
│  │   ✓ General (通用)                         │  │
│  │     Technical (技术)                       │  │
│  │     Legal (法律)                           │  │
│  │     Literary (文学)                        │  │
│  │     Idioms & Slang (成语俚语)              │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ Enter Chinese text...                     │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### 状态管理
```typescript
const [translationMode, setTranslationMode] = useState<TranslationMode>('general');
const [inputType, setInputType] = useState<'text' | 'image' | 'audio'>('text');

type TranslationMode = 'technical' | 'legal' | 'literary' | 'idioms' | 'general';
```

#### 下拉菜单组件
使用 Radix UI Select 组件:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={translationMode} onValueChange={setTranslationMode}>
  <SelectTrigger>
    <SelectValue placeholder="Select mode" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="general">General (通用)</SelectItem>
    <SelectItem value="technical">Technical (技术)</SelectItem>
    <SelectItem value="legal">Legal (法律)</SelectItem>
    <SelectItem value="literary">Literary (文学)</SelectItem>
    <SelectItem value="idioms">Idioms & Slang (成语俚语)</SelectItem>
  </SelectContent>
</Select>
```

#### API 调用更新
```typescript
const response = await fetch('/api/chinese-to-english-translator', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: inputText,
    direction: direction,
    mode: translationMode,      // 新增
    inputType: 'text'            // 新增
  }),
});
```

---

### Phase 2: OCR 图像翻译 (3-4 hours)

#### UI 设计
```
┌─────────────────────────────────────────────────┐
│  Input Type: [Text] [Image] [Audio]             │
│                                                  │
│  [Image Mode Selected]                           │
│  ┌───────────────────────────────────────────┐  │
│  │  📷 Upload Image or Drag & Drop           │  │
│  │                                           │  │
│  │  [Preview of uploaded image]              │  │
│  │                                           │  │
│  │  Supports: JPG, PNG, WebP, GIF           │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  [Translate] button                             │
│                                                  │
│  Result:                                        │
│  ┌───────────────────────────────────────────┐  │
│  │ Extracted Text: 你好世界                   │  │
│  │ Translation: Hello World                   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### 状态管理
```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [extractedText, setExtractedText] = useState<string>('');
```

#### 图像上传处理
```typescript
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    setError('Unsupported image format. Please upload JPG, PNG, WebP, or GIF.');
    return;
  }

  // 生成预览
  const reader = new FileReader();
  reader.onload = (e) => {
    setImagePreview(e.target?.result as string);
  };
  reader.readAsDataURL(file);

  setImageFile(file);
  setInputType('image');
};
```

#### API 调用 (OCR)
```typescript
const handleImageTranslate = async () => {
  if (!imageFile) return;

  // 转换为 Base64
  const base64 = await fileToBase64(imageFile);

  const response = await fetch('/api/chinese-to-english-translator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputType: 'image',
      imageData: base64,
      imageMimeType: imageFile.type,
      mode: translationMode,
    }),
  });

  const data = await response.json();
  setExtractedText(data.extractedText);  // 显示 OCR 提取的原文
  setOutputText(data.translated);
};

// 辅助函数
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data URL 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

---

### Phase 3: 语音输入功能 (2-3 hours)

#### UI 设计
```
┌─────────────────────────────────────────────────┐
│  Input Type: [Text] [Image] [Audio]             │
│                                                  │
│  [Audio Mode Selected]                           │
│  ┌───────────────────────────────────────────┐  │
│  │  🎤 Click to Record                       │  │
│  │                                           │  │
│  │  [● Recording... 00:15]                   │  │
│  │  or [Upload Audio File]                   │  │
│  │                                           │  │
│  │  Waveform visualization                   │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Result:                                        │
│  ┌───────────────────────────────────────────┐  │
│  │ Transcription: 你好,今天天气很好           │  │
│  │ Translation: Hello, the weather is nice   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

#### 状态管理
```typescript
const [isRecording, setIsRecording] = useState<boolean>(false);
const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
const [audioURL, setAudioURL] = useState<string | null>(null);
const [transcription, setTranscription] = useState<string>('');
const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
```

#### 录音功能实现
```typescript
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));

      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  } catch (error) {
    setError('Microphone access denied. Please enable microphone permissions.');
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    setIsRecording(false);
  }
};
```

#### API 调用 (Audio)
```typescript
const handleAudioTranslate = async () => {
  if (!audioBlob) return;

  // 转换为 Base64
  const base64 = await blobToBase64(audioBlob);

  const response = await fetch('/api/chinese-to-english-translator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputType: 'audio',
      audioData: base64,
      audioMimeType: 'audio/webm',
      mode: translationMode,
    }),
  });

  const data = await response.json();
  setTranscription(data.transcription);  // 显示语音识别结果
  setOutputText(data.translated);
};

// 辅助函数
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
```

---

### Phase 4: 输出格式优化

#### 成语俚语模式增强显示
```tsx
{outputText && translationMode === 'idioms' && (
  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
      💡 Cultural Context
    </h4>
    <p className="text-sm text-blue-700 dark:text-blue-300">
      {outputText}
    </p>
  </div>
)}
```

#### OCR 结果展示
```tsx
{extractedText && inputType === 'image' && (
  <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
      📝 Extracted Text:
    </h4>
    <p className="text-sm text-amber-700 dark:text-amber-300">
      {extractedText}
    </p>
  </div>
)}
```

#### 语音转录展示
```tsx
{transcription && inputType === 'audio' && (
  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
    <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
      🎙️ Transcription:
    </h4>
    <p className="text-sm text-purple-700 dark:text-purple-300">
      {transcription}
    </p>
  </div>
)}
```

---

## 📝 JSON 配置更新

在 `messages/pages/chinese-to-english-translator/en.json` 添加:

```json
{
  "tool": {
    "inputTypeLabel": "Input Type",
    "textInput": "Text",
    "imageInput": "Image",
    "audioInput": "Audio",

    "modeLabel": "Translation Mode",
    "modeGeneral": "General (通用)",
    "modeTechnical": "Technical (技术)",
    "modeLegal": "Legal (法律)",
    "modeLiterary": "Literary (文学)",
    "modeIdioms": "Idioms & Slang (成语俚语)",

    "imageUploadPlaceholder": "Upload image or drag & drop here",
    "imageSupportedFormats": "Supports: JPG, PNG, WebP, GIF (menus, signs, comics)",

    "recordButton": "Record Audio",
    "recordingLabel": "Recording...",
    "stopRecording": "Stop Recording",
    "uploadAudio": "Upload Audio File",

    "extractedTextLabel": "Extracted Text:",
    "transcriptionLabel": "Transcription:"
  }
}
```

---

## 🎨 Hero Section 更新

更新 `messages/pages/chinese-to-english-translator/en.json`:

```json
{
  "hero": {
    "title": "AI-Powered Chinese to English Translator with OCR & Voice",
    "description": "Translate text, images, and voice with professional accuracy. Choose from technical, legal, literary, and idiom translation modes. VibeTrans uses Gemini 2.0 Flash for instant, context-aware translations.",
    "features": [
      "🎯 5 Translation Modes (Technical, Legal, Literary, Idioms, General)",
      "📷 OCR Image Translation (Menus, Signs, Comics)",
      "🎤 Voice Input with Auto-Transcription",
      "🔄 Bidirectional (Chinese ↔ English)"
    ]
  }
}
```

---

## 🔍 SEO Metadata 更新

```json
{
  "title": "Free Chinese to English Translator with OCR & Voice | VibeTrans",
  "description": "Professional Chinese-English translation with AI-powered OCR, voice input, and specialized modes (technical, legal, literary). Translate text, images, and audio instantly with Gemini 2.0."
}
```

---

## 🚀 实施时间表

| Phase | 任务 | 预计时间 | 状态 |
|-------|-----|---------|------|
| 1 | 翻译模式选择器 | 1-2 hours | Pending |
| 2 | OCR 图像翻译 | 3-4 hours | Pending |
| 3 | 语音输入功能 | 2-3 hours | Pending |
| 4 | 输出格式优化 | 1 hour | Pending |
| 5 | Hero/SEO 更新 | 1 hour | Pending |
| 6 | 测试和调优 | 2 hours | Pending |
| **总计** | | **10-13 hours** | |

---

## ✅ 验收标准

### 功能测试
- [ ] 翻译模式切换工作正常,每个模式返回不同风格的翻译
- [ ] 图像上传和预览正常,OCR 提取文本准确
- [ ] 语音录制和播放正常,转录结果清晰
- [ ] 错误处理完善 (文件格式/权限/API 错误)
- [ ] 响应式设计在移动端正常工作

### 用户体验
- [ ] 输入切换流畅 (文本/图像/音频)
- [ ] 加载状态清晰 (OCR/转录/翻译)
- [ ] 成语模式显示文化解释
- [ ] OCR 和转录结果独立展示

### 性能
- [ ] 图像文件大小限制 (< 5MB)
- [ ] 音频录制时长限制 (< 60 seconds)
- [ ] API 调用超时处理 (30 seconds)

---

## 💡 技术优势

### 为什么使用 Gemini 2.0 Flash?

1. **多模态统一处理**: 文本、图像、音频在一个 API 调用中完成
2. **上下文理解**: 不只是单词翻译,理解整体语境
3. **成语检测**: 自动识别中文成语并给出解释
4. **OCR 准确性**: 处理竖排文本、漫画气泡、复杂背景
5. **音频质量**: 支持中文方言和口音识别

### 架构优势
- **Edge Runtime**: API 使用 Edge 函数,全球低延迟
- **类型安全**: TypeScript 严格类型检查
- **错误处理**: API quota/key/format 错误独立处理
- **扩展性**: 可轻松添加更多翻译模式

---

## 📚 参考文档

- [Gemini 2.0 Flash API Docs](https://ai.google.dev/gemini-api/docs)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select)

---

## 🎯 下一步行动

1. **立即开始**: Phase 1 翻译模式选择器 (最简单,立即见效)
2. **用户需求**: 询问用户是否先实现某个功能
3. **分步测试**: 每个 Phase 完成后进行测试验证

**准备好开始实施了吗? 我建议先从 Phase 1 开始,添加翻译模式选择器。**
