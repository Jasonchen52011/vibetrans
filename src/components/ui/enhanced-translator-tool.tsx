/**
 * 增强版翻译工具示例
 * 集成了通用语音播放功能，展示如何在翻译页面中使用
 */

'use client';

import React, { useState } from 'react';
import { ArrowRightIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { SpeechButton } from '@/components/ui/speech-button';
import { useSpeech } from '@/hooks/use-speech';
import type { SpeechOptions } from '@/lib/speech/speech-manager';

interface EnhancedTranslatorToolProps {
  pageData: any;
  locale?: string;
  translatorType?: 'minion' | 'mandalorian' | 'normal';
  apiEndpoint: string;
}

// 不同翻译器的语音预设
const TRANSLATOR_SPEECH_PRESETS = {
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
  }
};

export default function EnhancedTranslatorTool({
  pageData,
  locale = 'en',
  translatorType = 'normal',
  apiEndpoint
}: EnhancedTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('normal');

  // 语音播放Hook - 用于输入文本
  const inputSpeech = useSpeech({
    onError: (error) => console.error('Input speech error:', error),
    onStart: () => console.log('Input speech started'),
    onEnd: () => console.log('Input speech ended')
  });

  // 语音播放Hook - 用于输出文本
  const outputSpeech = useSpeech({
    onError: (error) => console.error('Output speech error:', error),
    onStart: () => console.log('Output speech started'),
    onEnd: () => console.log('Output speech ended')
  });

  // 获取当前翻译器的语音配置
  const getSpeechOptions = (target: 'input' | 'output'): SpeechOptions => {
    const basePreset = TRANSLATOR_SPEECH_PRESETS[translatorType];

    if (target === 'input') {
      return {
        ...basePreset,
        emotion: 'neutral' // 输入文本使用中性语调
      };
    }

    // 输出文本根据翻译器类型调整
    if (translatorType === 'minion') {
      return {
        ...basePreset,
        emotion: selectedTone === 'evil' ? 'excited' : 'happy'
      };
    }

    return basePreset;
  };

  // 处理翻译
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          tone: selectedTone,
          direction: 'auto'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || pageData.tool.error);
      }

      setOutputText(data.translated || data.result || '');
    } catch (err: any) {
      setError(err.message || 'Translation failed');
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  // 复制功能
  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 下载功能
  const handleDownload = (text: string, prefix: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 重置功能
  const handleReset = () => {
    // 停止所有语音播放
    inputSpeech.stop();
    outputSpeech.stop();

    setInputText('');
    setOutputText('');
    setFileName(null);
    setError(null);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">

        {/* 语音控制提示 */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Volume2Icon className="w-4 h-4" />
            <span>🔊 语音播放已启用 - 点击播放按钮即可听到翻译结果</span>
          </div>
        </div>

        {/* 输入和输出区域 */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* 输入区域 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {pageData.tool.inputLabel}
              </h2>

              {/* 输入文本语音播放 */}
              {inputText && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">朗读输入</span>
                  <SpeechButton
                    text={inputText}
                    locale={locale}
                    options={getSpeechOptions('input')}
                    variant="icon"
                    size="sm"
                  />
                </div>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={pageData.tool.inputPlaceholder}
              className="w-full h-48 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
            />

            {/* 字数统计 */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {inputText.length} 字符
            </div>
          </div>

          {/* 输出区域 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {pageData.tool.outputLabel}
              </h2>

              {/* 输出文本控制按钮 */}
              {outputText && (
                <div className="flex items-center gap-2">
                  {/* 语音播放按钮 */}
                  <SpeechButton
                    text={outputText}
                    locale={locale}
                    options={getSpeechOptions('output')}
                    variant="button"
                    size="sm"
                    showProgress={true}
                    onError={(error) => setError(`语音播放错误: ${error}`)}
                  />

                  {/* 传统按钮 */}
                  <button
                    onClick={() => handleCopy(outputText)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                    title="复制文本"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDownload(outputText, 'translation')}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                    title="下载文本"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-48 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-start justify-start text-gray-700 dark:text-gray-200 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <p>{pageData.tool.loading}</p>
                </div>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : outputText ? (
                <div className="w-full">
                  <p className="text-lg whitespace-pre-wrap">{outputText}</p>

                  {/* 语音播放进度 */}
                  {outputSpeech.isPlaying && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      正在播放... {Math.round(outputSpeech.progress)}%
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {pageData.tool.outputPlaceholder}
                </p>
              )}
            </div>

            {/* 输出文本统计 */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {outputText.length} 字符
              {outputSpeech.duration && ` • 预计播放时长: ${outputSpeech.duration}秒`}
            </div>
          </div>
        </div>

        {/* 选项设置（仅Minion翻译器显示） */}
        {translatorType === 'minion' && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              语气选择
            </label>
            <div className="flex gap-2">
              {['normal', 'evil'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedTone === tone
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-500'
                  }`}
                >
                  {tone === 'evil' ? '😈 邪恶' : '😊 正常'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                {pageData.tool.loading}
              </>
            ) : (
              <>
                {pageData.tool.translateButton}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
          >
            重置
          </button>
        </div>

        {/* 语音功能状态 */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          {outputSpeech.isSupported ? '🎤 语音功能已启用' : '🔇 浏览器不支持语音功能'}
        </div>
      </main>
    </div>
  );
}