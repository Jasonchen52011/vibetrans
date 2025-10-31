'use client';

import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { detectLanguage } from '@/lib/language-detection';
import { readFileContent } from '@/lib/utils/file-utils';
// import mammoth from 'mammoth'; // Disabled for Edge Runtime compatibility
import { useEffect, useRef, useState } from 'react';

interface MiddleEnglishTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function MiddleEnglishTranslatorTool({
  pageData,
  locale = 'en',
}: MiddleEnglishTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [direction, setDirection] = useState<
    'modern-to-middle' | 'middle-to-modern'
  >('modern-to-middle');
  const [dialect, setDialect] = useState<
    'general' | 'northern' | 'kentish' | 'midlands'
  >('general');
  const [period, setPeriod] = useState<'1150-1300' | '1300-1450' | '1450-1500'>(
    '1300-1450'
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // 智能语言检测相关状态
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [inputLabel, setInputLabel] = useState<string>('');
  const [outputLabel, setOutputLabel] = useState<string>('');
  const [inputPlaceholder, setInputPlaceholder] = useState<string>('');
  const [outputPlaceholder, setOutputPlaceholder] = useState<string>('');
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化UI标签
  useEffect(() => {
    updateLabelsForDirection(direction);
  }, [direction, pageData]);

  // 更新UI标签
  const updateLabelsForDirection = (
    currentDirection: 'modern-to-middle' | 'middle-to-modern'
  ) => {
    if (currentDirection === 'modern-to-middle') {
      setInputLabel('Modern English Text');
      setOutputLabel('Middle English Translation');
      setInputPlaceholder(
        pageData.tool.inputPlaceholder || 'Enter modern English text...'
      );
      setOutputPlaceholder(
        pageData.tool.outputPlaceholder ||
          'Middle English translation will appear here...'
      );
    } else {
      setInputLabel('Middle English Text');
      setOutputLabel('Modern English Translation');
      setInputPlaceholder('Enter Middle English text (Chaucer-style)...');
      setOutputPlaceholder('Modern English translation will appear here...');
    }
  };

  // 智能语言检测函数 - 使用API
  const performLanguageDetection = async (text: string) => {
    if (!text.trim() || text.length < 3 || !autoMode) {
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);

    try {
      const response = await fetch('/api/middle-english-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          detectOnly: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 如果检测到现代英语且当前是中古英语到现代英语，自动切换
        if (
          data.detectedInputLanguage === 'english' &&
          data.confidence > 0.6 &&
          direction === 'middle-to-modern'
        ) {
          const newDirection = 'modern-to-middle';
          setDirection(newDirection);
          updateLabelsForDirection(newDirection);
        }
        // 如果检测到中古英语且当前是现代英语到中古英语，自动切换
        else if (
          data.detectedInputLanguage === 'middle-english' &&
          data.confidence > 0.6 &&
          direction === 'modern-to-middle'
        ) {
          const newDirection = 'middle-to-modern';
          setDirection(newDirection);
          updateLabelsForDirection(newDirection);
        }
      }
    } catch (error) {
      console.error('API language detection failed, using fallback:', error);

      // 如果API检测失败，使用客户端检测作为后备
      try {
        const detection = detectLanguage(text, 'middle-english');

        // 如果检测到现代英语且当前是中古英语到现代英语，自动切换
        if (
          detection.detectedLanguage === 'english' &&
          detection.confidence > 0.6 &&
          direction === 'middle-to-modern'
        ) {
          const newDirection = 'modern-to-middle';
          setDirection(newDirection);
          updateLabelsForDirection(newDirection);
        }
        // 如果检测到中古英语且当前是现代英语到中古英语，自动切换
        else if (
          detection.detectedLanguage === 'middle-english' &&
          detection.confidence > 0.6 &&
          direction === 'modern-to-middle'
        ) {
          const newDirection = 'middle-to-modern';
          setDirection(newDirection);
          updateLabelsForDirection(newDirection);
        }
      } catch (fallbackError) {
        console.error('All language detection methods failed:', fallbackError);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  // 防抖检测语言变化
  useEffect(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    detectionTimeoutRef.current = setTimeout(() => {
      performLanguageDetection(inputText);
    }, 800); // 800ms防抖

    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [inputText]);

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    try {
      const text = await readFileContent(file);
      setInputText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
      setFileName(null);
    }
  };

  // Handle translation
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
      const response = await fetch('/api/middle-english-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          direction,
          dialect,
          period,
          autoDetect: autoMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || pageData.tool.error);
      }

      setOutputText(data.translated || data.result || '');

      // 如果API端自动切换了方向，同步前端状态
      if (data.direction && data.direction !== direction) {
        console.log(
          `[Frontend] API returned different direction: ${direction} → ${data.direction}`
        );
        setDirection(data.direction);
        updateLabelsForDirection(data.direction);
      }
    } catch (err: any) {
      setError(err.message || 'Translation failed');
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setFileName(null);
    setError(null);
    setIsDetecting(false);
  };

  // Copy
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      const { smartCopyToClipboard } = await import('@/lib/utils/dynamic-copy');
      await smartCopyToClipboard(outputText, {
        successMessage: 'Translation copied to clipboard!',
        errorMessage: 'Failed to copy translation',
        onSuccess: () => {},
        onError: (error) => console.error('Failed to copy:', error),
      });
    } catch (error) {
      console.error('Copy function loading failed:', error);
    }
  };

  // Download
  const handleDownload = async () => {
    if (!outputText) return;
    try {
      const { smartDownload } = await import('@/lib/utils/dynamic-download');
      smartDownload(outputText, 'middle-english-translator', {
        onSuccess: () => {},
        onError: (error) => console.error('Download failed:', error),
      });
    } catch (error) {
      console.error('Download function loading failed:', error);
    }
  };

  // Voice input
  const handleVoiceInput = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      setError(
        locale === 'zh'
          ? '此浏览器不支持语音识别。请使用 Chrome、Edge 或 Safari。'
          : 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        setError(
          locale === 'zh'
            ? '未检测到语音。请重试。'
            : 'No speech detected. Please try again.'
        );
      } else if (event.error === 'not-allowed') {
        setError(
          locale === 'zh'
            ? '麦克风访问被拒绝。请在浏览器设置中允许麦克风访问。'
            : 'Microphone access denied. Please allow microphone access in your browser settings.'
        );
      } else {
        setError(
          locale === 'zh'
            ? `语音识别错误：${event.error}`
            : `Speech recognition error: ${event.error}`
        );
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Settings Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-center p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
          {/* Dialect Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Dialect:
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-md text-sm bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 mr-2"
            >
              <option value="general">General</option>
              <option value="northern">Northern</option>
              <option value="kentish">Kentish</option>
              <option value="midlands">Midlands</option>
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Period:
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-md text-sm bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 mr-2"
            >
              <option value="1150-1300">Early (1150-1300)</option>
              <option value="1300-1450">Classical (1300-1450)</option>
              <option value="1450-1500">Late (1450-1500)</option>
            </select>
          </div>
        </div>

        {/* Input and Output Areas */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Input Area */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {inputLabel}
              </h2>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
            />

            {/* File Upload and Voice Input */}
            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center p-2 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-medium rounded-lg cursor-pointer transition-colors"
                title={`${pageData.tool.uploadButton} - ${pageData.tool.uploadHint}`}
              >
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </label>

              <button
                onClick={handleVoiceInput}
                disabled={isRecording}
                className={`inline-flex items-center justify-center p-2 font-medium rounded-lg transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100'
                }`}
                title={
                  isRecording
                    ? locale === 'zh'
                      ? '录音中...'
                      : 'Recording...'
                    : locale === 'zh'
                      ? '语音输入'
                      : 'Voice Input'
                }
              >
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              <input
                id="file-upload"
                type="file"
                accept=".txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* File Name Display */}
            {fileName && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded-md border border-gray-200 dark:border-zinc-600">
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                  {fileName}
                </span>
                <button
                  onClick={() => {
                    setFileName(null);
                    setInputText('');
                    setIsDetecting(false);
                  }}
                  className="ml-auto text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Direction Toggle Icon - Subtle Gray */}
          <div className="flex md:flex-col items-center justify-center shrink-0 self-center">
            <button
              onClick={() =>
                setDirection(
                  direction === 'modern-to-middle'
                    ? 'middle-to-modern'
                    : 'modern-to-middle'
                )
              }
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
              title={
                direction === 'modern-to-middle'
                  ? 'Modern → Middle'
                  : 'Middle → Modern'
              }
              aria-label="Toggle translation direction"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
          </div>

          {/* Output Area */}
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {outputLabel}
            </h2>
            <div
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-start justify-start text-gray-700 dark:text-gray-200 overflow-y-auto"
              aria-live="polite"
            >
              {isLoading ? (
                <p>{pageData.tool.loading}</p>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : outputText ? (
                <p className="text-lg whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {pageData.tool.outputPlaceholder}
                </p>
              )}
            </div>

            {/* Action buttons below output */}
            {outputText && (
              <div className="mt-3 flex gap-2 justify-end">
                <TextToSpeechButton text={outputText} locale={locale} />
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  title="Copy"
                >
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  title="Download"
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
