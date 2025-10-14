'use client';

import { useState, useEffect } from 'react';

interface TextToSpeechButtonProps {
  text: string;
  locale?: string;
  className?: string;
  tone?: 'evil';
}

/**
 * TextToSpeechButton - 小黄人语音按钮组件
 *
 * 使用浏览器 TTS + 极端参数模拟小黄人声音
 * 完全免费，无需任何 API
 *
 * @example
 * ```tsx
 * <TextToSpeechButton
 *   text="Hello, how are you?"
 *   locale="en"
 *   tone="cute"
 * />
 * ```
 */
export function TextToSpeechButton({
  text,
  locale = 'en',
  className = '',
  tone = 'evil',
}: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 加载可用语音
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      console.log('[Minion TTS] Available voices:', availableVoices.length);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 根据语气选择最佳声音（优先高音/女声）
  const selectBestVoice = () => {
    // 1. 优先：女声/高音
    const femaleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('female') ||
        name.includes('woman') ||
        name.includes('girl') ||
        name.includes('samantha') ||
        name.includes('karen') ||
        name.includes('victoria') ||
        name.includes('zira') ||
        name.includes('susan')
      );
    });

    if (femaleVoices.length > 0) {
      console.log('[Minion TTS] Selected female voice:', femaleVoices[0].name);
      return femaleVoices[0];
    }

    // 2. 备选：任意英文语音
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      console.log('[Minion TTS] Selected English voice:', englishVoices[0].name);
      return englishVoices[0];
    }

    // 3. 最后：任意语音
    console.log('[Minion TTS] Selected default voice:', voices[0]?.name || 'none');
    return voices[0];
  };

  // 根据语气设置变声参数（只保留 Evil）
  const getToneParameters = (selectedTone: string) => {
    // Evil tone only
    return {
      pitch: 0.1,  // 极低音调
      rate: 0.7,   // 慢速
    };
  };

  const handleSpeak = async () => {
    if (!text) return;

    // 停止当前语音
    window.speechSynthesis.cancel();

    try {
      setIsSpeaking(true);

      // 创建 utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // 选择最佳声音
      const voice = selectBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = locale === 'zh' ? 'zh-CN' : 'en-US';

      // 获取语气参数
      const { pitch, rate } = getToneParameters(tone);
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = 1.0;

      console.log('[Minion TTS] Speaking with params:', {
        tone,
        pitch,
        rate,
        voice: voice?.name || 'default',
        text: text.substring(0, 50),
      });

      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('[Minion TTS] Speech ended');
      };

      utterance.onerror = (error) => {
        console.error('[Minion TTS] Speech error:', error);
        setIsSpeaking(false);
      };

      // 播放
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('[Minion TTS] Error:', error);
      setIsSpeaking(false);
      alert('无法播放语音，请检查浏览器设置');
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <button
      onClick={() => (isSpeaking ? stopSpeaking() : handleSpeak())}
      className={`p-2 transition-colors ${
        isSpeaking
          ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
          : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
      } ${className}`}
      title={isSpeaking ? 'Stop' : 'Play audio (Minion voice)'}
      aria-label={isSpeaking ? 'Stop speaking' : 'Play audio'}
    >
      {isSpeaking ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      )}
    </button>
  );
}
