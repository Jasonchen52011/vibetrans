'use client';

import React from 'react';
import { SpeechButton } from '@/components/ui/speech-button';

interface TextToSpeechButtonProps {
  text: string;
  locale?: string;
  className?: string;
  tone?: 'evil';
}

/**
 * TextToSpeechButton - 兼容适配器版本
 *
 * 这个组件现在使用新的SpeechButton引擎，但保持原有的API不变
 * 享受所有新功能：缓存、错误处理、进度显示等
 *
 * 新增功能：
 * - 智能缓存，重复文本播放更快
 * - 更好的错误处理和用户反馈
 * - 播放进度显示（可选）
 * - 动态加载，性能优化
 * - 浏览器兼容性检测
 * - 智能翻译器类型检测和最佳语音预设
 */

export function TextToSpeechButton({
  text,
  locale = 'en',
  className = '',
  tone = 'evil',
}: TextToSpeechButtonProps) {
  // 智能检测翻译器类型
  const getTranslatorContext = () => {
    // 尝试从错误堆栈中获取组件文件路径
    let filePath = '';

    try {
      const stack = new Error().stack || '';
      const lines = stack.split('\n');

      // 查找组件文件路径
      for (const line of lines) {
        if (line.includes('/pages/') && line.includes('.tsx')) {
          const match = line.match(/\/pages\/([^:]+)/);
          if (match) {
            filePath = match[1];
            break;
          }
        }
      }
    } catch (error) {
      // 静默处理错误，使用默认检测
    }

    return {
      filePath,
      componentName: 'TextToSpeechButton',
      tone
    };
  };

  // 智能语音预设映射
  const getSpeechOptions = () => {
    const context = getTranslatorContext();

    // 导入预设检测函数
    const { getSpeechPresetFromContext } = require('@/lib/speech/translator-presets');

    try {
      // 使用智能预设检测
      return getSpeechPresetFromContext(context, locale);
    } catch (error) {
      // 降级到基础配置
      console.warn('Failed to detect translator preset, using fallback:', error);

      const baseOptions = {
        lang: locale === 'zh' ? 'zh-CN' : 'en-US',
      };

      // 原有的evil tone映射到新的emotion系统
      if (tone === 'evil') {
        return {
          ...baseOptions,
          pitch: 0.1,   // 保持原有的极低音调
          rate: 0.7,    // 保持原有的慢速
          emotion: 'calm' as const
        };
      }

      return baseOptions;
    }
  };

  return (
    <SpeechButton
      text={text}
      locale={locale}
      options={getSpeechOptions()}
      variant="icon"
      className={className}
      onError={(error) => {
        console.error('TextToSpeechButton error:', error);
        // 可以在这里添加用户友好的错误提示
      }}
      onSuccess={() => {
        console.log('TextToSpeechButton: Speech played successfully');
      }}
    />
  );
}
