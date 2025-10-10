'use client';

import { MicIcon, MicOffIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void;
  locale?: string;
  className?: string;
}

/**
 * SpeechToTextButton - 语音转文字按钮组件
 *
 * 使用浏览器原生Web Speech API实现STT功能
 * 完全免费，无需API密钥，支持实时语音识别
 *
 * @example
 * ```tsx
 * <SpeechToTextButton
 *   onTranscript={(text) => setInputText(text)}
 *   locale="en"
 * />
 * ```
 */
export function SpeechToTextButton({
  onTranscript,
  locale = 'en',
  className = '',
}: SpeechToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition API is supported
    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Get interim results
      recognitionRef.current.lang = locale === 'zh' ? 'zh-CN' : 'en-US';

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      // Handle end
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [locale, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-lg transition-colors ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
          : 'bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <MicOffIcon className="w-5 h-5" />
      ) : (
        <MicIcon className="w-5 h-5" />
      )}
    </button>
  );
}
