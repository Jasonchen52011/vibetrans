'use client';

import { useState } from 'react';

interface TextToSpeechButtonProps {
  text: string;
  locale?: string;
  className?: string;
}

/**
 * TextToSpeechButton - 文字转语音按钮组件
 *
 * 使用浏览器原生Web Speech API实现TTS功能
 * 完全免费，无需API密钥，支持中英文
 *
 * @example
 * ```tsx
 * <TextToSpeechButton
 *   text="Hello, how are you?"
 *   locale="en"
 * />
 * ```
 */
export function TextToSpeechButton({
  text,
  locale = 'en',
  className = '',
}: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Web Speech API is not supported in your browser');
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
      title={isSpeaking ? 'Stop' : 'Play audio'}
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
