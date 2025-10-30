/**
 * 语音功能测试组件
 * 用于在不同页面中测试语音播放功能的兼容性
 */

'use client';

import React, { useState } from 'react';
import { SpeechButton } from '@/components/ui/speech-button';
import { useSpeech } from '@/hooks/use-speech';
import type { SpeechOptions } from '@/lib/speech/speech-manager';

interface SpeechTestComponentProps {
  translatorType?: 'minion' | 'mandalorian' | 'normal' | 'custom';
  customOptions?: SpeechOptions;
}

export default function SpeechTestComponent({
  translatorType = 'normal',
  customOptions
}: SpeechTestComponentProps) {
  const [testText, setTestText] = useState<string>('Hello! This is a test of the speech synthesis system.');
  const [customPitch, setCustomPitch] = useState<number>(1.0);
  const [customRate, setCustomRate] = useState<number>(1.0);
  const [selectedEmotion, setSelectedEmotion] = useState<SpeechOptions['emotion']>('neutral');

  // 测试用例
  const testCases = [
    {
      name: '基础英语',
      text: 'Hello world! How are you today?',
      options: { lang: 'en-US', emotion: 'neutral' as const }
    },
    {
      name: 'Minion风格',
      text: 'Banana! Apple! Potato! Hello banana!',
      options: { lang: 'en-US', pitch: 1.3, rate: 0.9, emotion: 'excited' as const }
    },
    {
      name: 'Mandalorian风格',
      text: 'This is the way. Su cuy\'gar.',
      options: { lang: 'en-US', pitch: 0.8, rate: 0.8, emotion: 'calm' as const }
    },
    {
      name: '长文本测试',
      text: 'This is a longer text to test the speech synthesis capabilities. It includes multiple sentences and should test the duration estimation and progress tracking features of the speech system.',
      options: { lang: 'en-US', emotion: 'neutral' as const }
    },
    {
      name: '情感测试 - Happy',
      text: 'I am so happy to see you! This is wonderful news!',
      options: { lang: 'en-US', emotion: 'happy' as const }
    },
    {
      name: '情感测试 - Sad',
      text: 'I am feeling sad today. Things are not going well.',
      options: { lang: 'en-US', emotion: 'sad' as const }
    }
  ];

  // 使用Hook进行高级测试
  const speech = useSpeech({
    onError: (error) => console.error('Test speech error:', error),
    onStart: () => console.log('Test speech started'),
    onEnd: () => console.log('Test speech ended')
  });

  const getTranslatorOptions = (): SpeechOptions => {
    if (customOptions) return customOptions;

    const baseOptions = {
      lang: 'en-US',
      pitch: customPitch,
      rate: customRate,
      emotion: selectedEmotion
    };

    switch (translatorType) {
      case 'minion':
        return { ...baseOptions, pitch: 1.3, rate: 0.9, emotion: 'excited' };
      case 'mandalorian':
        return { ...baseOptions, pitch: 0.8, rate: 0.8, emotion: 'calm' };
      default:
        return baseOptions;
    }
  };

  const handleTestPlay = async (text: string, options: SpeechOptions) => {
    await speech.speak(text, options);
  };

  const runCompatibilityTest = async () => {
    console.log('🧪 开始语音兼容性测试...');

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`测试: ${testCase.name}`);
        await speech.speak(testCase.text, testCase.options);

        // 等待播放开始
        await new Promise(resolve => setTimeout(resolve, 500));

        results.push({
          test: testCase.name,
          status: '✅ 通过',
          error: null
        });

        // 等待播放完成或停止
        await new Promise(resolve => setTimeout(resolve, 2000));
        speech.stop();

      } catch (error) {
        results.push({
          test: testCase.name,
          status: '❌ 失败',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('🏁 测试完成:', results);
    return results;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold mb-4">🎤 语音功能测试</h3>

      {/* 支持状态 */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            浏览器支持: {speech.isSupported ? '✅ 支持' : '❌ 不支持'}
          </span>
          {speech.isLoading && <span className="text-xs text-blue-600">正在初始化...</span>}
        </div>
        {speech.error && (
          <div className="text-xs text-red-600 mt-1">
            错误: {speech.error}
          </div>
        )}
      </div>

      {/* 快速测试 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">快速测试</h4>
        <div className="flex flex-wrap gap-2">
          {testCases.slice(0, 3).map((testCase, index) => (
            <SpeechButton
              key={index}
              text={testCase.text}
              options={testCase.options}
              variant="button"
              size="sm"
              showProgress={true}
              onError={(error) => console.error(`测试失败: ${testCase.name}`, error)}
            >
              {testCase.name}
            </SpeechButton>
          ))}
        </div>
      </div>

      {/* 自定义测试 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">自定义测试</h4>

        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full h-24 p-2 border border-gray-300 dark:border-zinc-600 rounded-md text-sm dark:bg-zinc-700 mb-3"
          placeholder="输入要测试的文本..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium mb-1">音调: {customPitch.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={customPitch}
              onChange={(e) => setCustomPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">语速: {customRate.toFixed(1)}</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={customRate}
              onChange={(e) => setCustomRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium mb-1">情感语气</label>
          <div className="flex gap-2">
            {(['neutral', 'happy', 'sad', 'excited', 'calm'] as const).map((emotion) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedEmotion === emotion
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <SpeechButton
            text={testText}
            options={getTranslatorOptions()}
            variant="button"
            showProgress={true}
          />

          <button
            onClick={() => handleTestPlay(testText, getTranslatorOptions())}
            disabled={speech.isLoading}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Hook测试
          </button>
        </div>
      </div>

      {/* 状态显示 */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-zinc-700 rounded text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>播放状态: {speech.isPlaying ? '▶️ 播放中' : '⏸️ 停止'}</div>
          <div>暂停状态: {speech.isPaused ? '⏸️ 已暂停' : '▶️ 未暂停'}</div>
          <div>加载状态: {speech.isLoading ? '⏳ 加载中' : '✅ 就绪'}</div>
          <div>播放进度: {Math.round(speech.progress)}%</div>
          {speech.duration && (
            <div className="col-span-2">预计时长: {speech.duration}秒</div>
          )}
        </div>
      </div>

      {/* 兼容性测试 */}
      <div className="mb-4">
        <button
          onClick={runCompatibilityTest}
          disabled={!speech.isSupported || speech.isLoading}
          className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          🧪 运行兼容性测试
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          测试所有预设语音配置，查看控制台输出
        </p>
      </div>

      {/* 测试用例列表 */}
      <div>
        <h4 className="text-sm font-medium mb-2">所有测试用例</h4>
        <div className="space-y-2">
          {testCases.map((testCase, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-zinc-700 rounded border">
              <div className="flex-1">
                <div className="text-sm font-medium">{testCase.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {testCase.text}
                </div>
              </div>
              <div className="flex gap-1">
                <SpeechButton
                  text={testCase.text}
                  options={testCase.options}
                  variant="icon"
                  size="sm"
                  showProgress={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}