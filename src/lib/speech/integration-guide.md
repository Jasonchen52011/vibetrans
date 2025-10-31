# 语音播放功能集成指南

本指南展示如何在翻译页面中集成动态语音播放功能。

## 快速集成

### 1. 基础用法 - 在任何组件中使用

```tsx
'use client';

import { SpeechButton } from '@/components/ui/speech-button';

export default function MyTranslatorPage() {
  const [translatedText, setTranslatedText] = useState('Hello world!');

  return (
    <div>
      {/* 翻译结果 */}
      <p>{translatedText}</p>

      {/* 语音播放按钮 */}
      <SpeechButton
        text={translatedText}
        locale="en"
        options={{
          pitch: 1.2,
          rate: 0.9,
          emotion: 'happy'
        }}
        variant="button"
        size="md"
        showProgress={true}
      />
    </div>
  );
}
```

### 2. 高级用法 - 使用Hook

```tsx
'use client';

import { useSpeech } from '@/hooks/use-speech';

export default function AdvancedSpeechComponent() {
  const [text, setText] = useState('Hello world!');

  const speech = useSpeech({
    onError: (error) => console.error('Speech error:', error),
    onStart: () => console.log('Speech started'),
    onEnd: () => console.log('Speech ended')
  });

  const handlePlay = async () => {
    await speech.speak(text, {
      lang: 'en-US',
      pitch: 1.0,
      rate: 1.0,
      emotion: 'neutral'
    });
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />

      <button onClick={handlePlay} disabled={speech.isLoading}>
        {speech.isPlaying ? '停止' : '播放'}
      </button>

      {/* 进度显示 */}
      {speech.isPlaying && (
        <div>播放进度: {Math.round(speech.progress)}%</div>
      )}

      {/* 错误显示 */}
      {speech.error && <div className="error">{speech.error}</div>}
    </div>
  );
}
```

## 在现有翻译页面中集成

### Minion Translator 集成示例

```tsx
// 在 MinionTranslatorTool.tsx 中添加

import { SpeechButton } from '@/components/ui/speech-button';

// 在输出区域添加语音按钮
{outputText && (
  <div className="flex gap-2">
    <SpeechButton
      text={outputText}
      locale="en"
      options={{
        lang: 'en-US',
        pitch: 1.3,  // Minion语音更高音调
        rate: 0.9,   // 稍慢的语速
        emotion: 'excited' // 兴奋的语气
      }}
      variant="icon"
      size="sm"
      onError={(error) => setError(error)}
    />

    {/* 现有的复制和下载按钮 */}
    <button onClick={handleCopy}>...</button>
    <button onClick={handleDownload}>...</button>
  </div>
)}
```

### Mandalorian Translator 集成示例

```tsx
// 在 MandalorianTranslatorTool.tsx 中添加

import { SpeechButton } from '@/components/ui/speech-button';

{outputText && (
  <div className="flex gap-2">
    <SpeechButton
      text={outputText}
      locale="en"
      options={{
        lang: 'en-US',
        pitch: 0.8,  // Mandalorian语音更低沉
        rate: 0.8,   // 较慢的语速
        emotion: 'calm' // 平静的语气
      }}
      variant="button"
      size="sm"
      showProgress={true}
    />
  </div>
)}
```

## 不同翻译器的语音预设

### 预定义配置

```tsx
const SPEECH_PRESETS = {
  minion: {
    lang: 'en-US',
    pitch: 1.3,
    rate: 0.9,
    emotion: 'excited' as const
  },
  mandalorian: {
    lang: 'en-US',
    pitch: 0.8,
    rate: 0.8,
    emotion: 'calm' as const
  },
  normal: {
    lang: 'en-US',
    pitch: 1.0,
    rate: 1.0,
    emotion: 'neutral' as const
  },
  yoda: {
    lang: 'en-US',
    pitch: 0.9,
    rate: 0.7,
    emotion: 'calm' as const
  }
};

// 使用预设
<SpeechButton
  text={translatedText}
  options={SPEECH_PRESETS.minion}
  variant="button"
/>
```

## API 参考

### SpeechButton 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| text | string | - | 要播放的文本（必需） |
| locale | string | 'en' | 语言环境 |
| options | SpeechOptions | {} | 语音配置选项 |
| variant | 'button' \| 'icon' \| 'minimal' | 'button' | 按钮样式 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 按钮尺寸 |
| showProgress | boolean | false | 是否显示播放进度 |
| autoPlay | boolean | false | 是否自动播放 |
| className | string | '' | 自定义CSS类 |
| onError | (error: string) => void | - | 错误回调 |
| onSuccess | () => void | - | 成功回调 |

### SpeechOptions 选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| voice | string | - | 语音名称 |
| pitch | number | 1.0 | 音调 (0.1-2.0) |
| rate | number | 1.0 | 语速 (0.1-2.0) |
| volume | number | 1.0 | 音量 (0-1) |
| lang | string | 'en-US' | 语言代码 |
| emotion | 'neutral' \| 'happy' \| 'sad' \| 'excited' \| 'calm' | 'neutral' | 情感语气 |

### useSpeech Hook 返回值

```tsx
const {
  state,           // 完整状态对象
  speak,           // 播放方法
  stop,            // 停止方法
  pause,           // 暂停方法
  resume,          // 恢复方法
  reset,           // 重置方法

  // 便捷属性
  isPlaying,       // 是否正在播放
  isPaused,        // 是否已暂停
  isLoading,       // 是否正在加载
  error,           // 错误信息
  duration,        // 播放时长
  progress,        // 播放进度 (0-100)
  isSupported      // 是否支持语音功能
} = useSpeech(options);
```

## 性能优化建议

### 1. 懒加载
```tsx
// 组件懒加载
const SpeechButton = React.lazy(() => import('@/components/ui/speech-button'));

// 使用时包装在 Suspense 中
<Suspense fallback={<div>Loading...</div>}>
  <SpeechButton text={text} />
</Suspense>
```

### 2. 缓存使用
```tsx
// 缓存会自动处理重复文本
// 对于重复播放的文本，第二次播放会更快

// 预热常用文本
import { speechCache } from '@/lib/speech/speech-cache';

speechCache.warmUp([
  'Hello',
  'Thank you',
  'Goodbye'
]);
```

### 3. 错误处理
```tsx
<SpeechButton
  text={text}
  onError={(error) => {
    // 显示用户友好的错误信息
    if (error.includes('not supported')) {
      showToast('您的浏览器不支持语音播放');
    } else {
      showToast('语音播放失败，请稍后重试');
    }
  }}
/>
```

## 浏览器兼容性

### 支持的浏览器
- ✅ Chrome 33+
- ✅ Firefox 49+
- ✅ Safari 14.1+
- ✅ Edge 79+
- ❌ IE (不支持)

### 移动端支持
- ✅ iOS Safari 14.1+
- ✅ Chrome Mobile
- ✅ Samsung Internet

### 优雅降级
```tsx
// 如果浏览器不支持，自动隐藏或显示替代方案
{speech.isSupported ? (
  <SpeechButton text={text} />
) : (
  <div className="text-gray-400 text-sm">
    语音功能不可用
  </div>
)}
```

## 故障排除

### 常见问题

1. **语音不播放**
   - 检查浏览器是否支持 Web Speech API
   - 确保用户已与页面交互（某些浏览器需要用户交互后才能播放音频）
   - 检查文本内容是否为空

2. **音质不佳**
   - 尝试调整 `pitch` 和 `rate` 参数
   - 确保文本语言与 `lang` 参数匹配

3. **性能问题**
   - 使用缓存机制避免重复合成
   - 对长文本进行分段处理

### 调试技巧

```tsx
// 启用详细日志
const speech = useSpeech({
  onError: (error) => console.error('Speech Error:', error),
  onStart: () => console.log('Speech Started'),
  onEnd: () => console.log('Speech Ended')
});

// 检查支持情况
console.log('Speech Support:', speech.isSupported);
console.log('Available Voices:', await getAvailableVoices());
```