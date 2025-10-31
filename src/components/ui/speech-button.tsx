/**
 * 通用语音播放按钮组件
 * 可在任何翻译页面中使用，支持动态加载和缓存
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import type { SpeechOptions } from '@/lib/speech/speech-manager';

interface SpeechButtonProps {
  text: string;
  locale?: string;
  options?: SpeechOptions;
  className?: string;
  variant?: 'button' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

// 预设的语音配置
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
  excited: {
    lang: 'en-US',
    pitch: 1.4,
    rate: 1.2,
    emotion: 'excited' as const
  }
};

export function SpeechButton({
  text,
  locale = 'en',
  options = {},
  className = '',
  variant = 'button',
  size = 'md',
  showProgress = false,
  autoPlay = false,
  onError,
  onSuccess
}: SpeechButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 根据locale自动选择合适的语音预设
  const getPreset = (loc: string, opts: SpeechOptions) => {
    if (opts.emotion || opts.pitch || opts.rate) {
      return opts; // 如果用户自定义了参数，使用用户参数
    }

    // 根据不同的翻译器类型选择预设
    if (loc.includes('minion')) return SPEECH_PRESETS.minion;
    if (loc.includes('mandalorian')) return SPEECH_PRESETS.mandalorian;

    return SPEECH_PRESETS.normal;
  };

  const speechOptions = useMemo(() => ({
    ...getPreset(locale, options),
    ...options
  }), [locale, options]);

  const speech = useSpeech({
    onError,
    onSuccess,
    onStart: () => {
      // 开始播放时的处理
    },
    onEnd: () => {
      // 播放结束时的处理
    }
  });

  // 自动播放
  React.useEffect(() => {
    if (autoPlay && text && !speech.isPlaying && !speech.isLoading) {
      speech.speak(text, speechOptions);
    }
  }, [autoPlay, text, speech, speechOptions]);

  // 点击处理
  const handleClick = async () => {
    if (speech.isPlaying) {
      speech.stop();
    } else {
      await speech.speak(text, speechOptions);
    }
  };

  // 如果不支持语音功能，返回null或占位符
  if (!speech.isSupported) {
    return variant === 'icon' ? (
      <div className={`opacity-50 cursor-not-allowed ${className}`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      </div>
    ) : null;
  }

  // 尺寸样式
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // 图标尺寸
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // 按钮内容
  const renderContent = () => {
    if (variant === 'icon') {
      return (
        <div className={iconSizes[size]}>
          {speech.isPlaying ? (
            // 停止图标
            <svg fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="3" height="12" />
              <rect x="12" y="4" width="3" height="12" />
            </svg>
          ) : speech.isLoading ? (
            // 加载图标
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            // 播放图标
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      );
    }

    if (variant === 'minimal') {
      return (
        <span className="flex items-center gap-2">
          {speech.isPlaying ? (
            <>
              <svg className={`animate-pulse ${iconSizes[size]}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Speaking...</span>
            </>
          ) : (
            <>
              <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Play</span>
            </>
          )}
        </span>
      );
    }

    // 默认按钮样式
    return (
      <span className="flex items-center gap-2">
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 20 20">
          {speech.isPlaying ? (
            <rect x="5" y="4" width="3" height="12" />
          ) : (
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          )}
        </svg>

        {speech.isPlaying ? 'Stop' : speech.isLoading ? 'Loading...' : 'Play'}

        {showProgress && speech.duration && (
          <span className="text-xs opacity-75">
            ({Math.round(speech.progress)}%)
          </span>
        )}
      </span>
    );
  };

  // 基础样式类
  const baseClasses = [
    'inline-flex items-center justify-center',
    'border border-transparent rounded-md',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ];

  // 状态样式
  const stateClasses = speech.isPlaying
    ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
    : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500';

  // 样式组合
  const combinedClasses = [
    ...baseClasses,
    variant !== 'icon' && variant !== 'minimal' ? sizeClasses[size] : '',
    variant !== 'icon' && variant !== 'minimal' ? stateClasses : '',
    isHovered && !speech.isPlaying ? 'transform scale-105' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="inline-flex items-center gap-2">
      <button
        className={combinedClasses}
        onClick={handleClick}
        disabled={!text.trim() || speech.isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={speech.isPlaying ? 'Stop speaking' : 'Play text'}
      >
        {renderContent()}
      </button>

      {/* 进度条 - 水平显示在按钮右侧 */}
      {showProgress && speech.isPlaying && (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${speech.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {Math.round(speech.progress)}%
          </span>
        </div>
      )}

      {/* 错误提示 - 水平显示 */}
      {speech.error && (
        <div className="text-xs text-red-500 max-w-48 whitespace-nowrap">
          {speech.error}
        </div>
      )}
    </div>
  );
}

// 默认导出
export default SpeechButton;
