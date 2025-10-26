'use client';

import { DirectionIndicator } from '@/components/translator/DirectionIndicator';
import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { useSmartTranslatorDirection } from '@/hooks/use-smart-translator-direction';
import { ArrowRightIcon } from 'lucide-react';
import mammoth from 'mammoth';
import { useEffect, useMemo, useState } from 'react';

interface ChineseToEnglishTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function ChineseToEnglishTranslatorTool({
  pageData,
  locale = 'en',
}: ChineseToEnglishTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    activeDirection,
    isManualDirection,
    detectedLanguage,
    languageWarning,
    runLanguageDetection,
    toggleDirection,
    setManualDirection,
    setAutoDirection,
    resetDirection,
    clearWarning,
  } = useSmartTranslatorDirection<'zh-to-en' | 'en-to-zh'>({
    apiPath: '/api/chinese-to-english-translator',
    defaultDirection: 'zh-to-en',
    directions: ['zh-to-en', 'en-to-zh'],
    locale,
    supportedLanguages: ['english', 'chinese'],
    warningMessage: locale?.toLowerCase().startsWith('zh')
      ? '请输入中文或英文内容'
      : 'Please input Chinese or English text',
    buildDetectPayload: (text) => ({
      text,
      detectOnly: true,
      inputType: 'text',
    }),
  });

  const isChineseLocale = locale?.toLowerCase().startsWith('zh');
  const fallbackEnglishLabel = isChineseLocale ? '英语' : 'English';
  const fallbackChineseLabel = isChineseLocale ? '中文' : 'Chinese';
  const englishLabel =
    typeof pageData?.tool?.englishLabel === 'string' &&
    pageData.tool.englishLabel.trim()
      ? pageData.tool.englishLabel
      : fallbackEnglishLabel;
  const chineseLabel =
    typeof pageData?.tool?.chineseLabel === 'string' &&
    pageData.tool.chineseLabel.trim()
      ? pageData.tool.chineseLabel
      : fallbackChineseLabel;
  const englishPlaceholder =
    typeof pageData?.tool?.englishPlaceholder === 'string' &&
    pageData.tool.englishPlaceholder.trim()
      ? pageData.tool.englishPlaceholder
      : isChineseLocale
        ? '请输入英文文本或上传文件...'
        : 'Enter English text or upload a file...';
  const chinesePlaceholder =
    typeof pageData?.tool?.chinesePlaceholder === 'string' &&
    pageData.tool.chinesePlaceholder?.trim()
      ? pageData.tool.chinesePlaceholder
      : pageData.tool.inputPlaceholder ||
        (isChineseLocale
          ? '请输入中文文本或上传文件...'
          : 'Enter Chinese text or upload a file...');
  const chineseOutputPlaceholder = isChineseLocale
    ? '中文翻译结果将显示在这里'
    : 'Chinese translation will appear here';
  const languageWarningText = useMemo(
    () =>
      isChineseLocale
        ? '请输入中文或英文内容'
        : 'Please input Chinese or English text',
    [isChineseLocale]
  );
  const isZhToEn = activeDirection === 'zh-to-en';
  const inputHeading = isZhToEn
    ? isChineseLocale
      ? `${chineseLabel}输入`
      : `${chineseLabel} Text`
    : isChineseLocale
      ? `${englishLabel}输入`
      : `${englishLabel} Text`;
  const outputHeading = isZhToEn
    ? isChineseLocale
      ? `${englishLabel}翻译`
      : `${englishLabel} Translation`
    : isChineseLocale
      ? `${chineseLabel}翻译`
      : `${chineseLabel} Translation`;
  const textareaPlaceholder = isZhToEn
    ? chinesePlaceholder
    : englishPlaceholder;
  const outputAreaPlaceholder = isZhToEn
    ? pageData.tool.outputPlaceholder
    : chineseOutputPlaceholder;
  const directionStatusLabel =
    detectedLanguage === 'unknown'
      ? isChineseLocale
        ? '方向检测中…'
        : 'Detecting direction…'
      : isZhToEn
        ? `${chineseLabel} → ${englishLabel}`
        : `${englishLabel} → ${chineseLabel}`;
  const detectionStatus =
    detectedLanguage === 'english'
      ? isChineseLocale
        ? '检测到输入语言：英语'
        : `Detected input: ${englishLabel}`
      : detectedLanguage === 'chinese'
        ? isChineseLocale
          ? '检测到输入语言：中文'
          : `Detected input: ${chineseLabel}`
        : isChineseLocale
          ? '自动检测中，请输入中文或英文'
          : 'Auto-detecting. Enter Chinese or English.';
  // 实时语言检测
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await runLanguageDetection(inputText);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [inputText, runLanguageDetection]);

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

  // Read file content
  const readFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) resolve(content);
          else reject(new Error('File is empty'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }

    if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value) return result.value;
        throw new Error('Failed to extract text from Word document');
      } catch (error) {
        throw new Error(
          'Failed to read .docx file. Please ensure it is a valid Word document.'
        );
      }
    }

    throw new Error(
      'Unsupported file format. Please upload .txt or .docx files.'
    );
  };

  // Handle translation with smart detection
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    // 如果有语言警告，不进行翻译
    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const detectionSummary = await runLanguageDetection(inputText);
      if (
        !isManualDirection &&
        (languageWarning ||
          detectionSummary.detectedInputLanguage === 'unknown') &&
        detectionSummary.confidence < 0.3
      ) {
        setIsLoading(false);
        setError(languageWarningText);
        setOutputText('');
        return;
      }

      const finalDirection = isManualDirection
        ? activeDirection
        : detectionSummary.detectedDirection;

      const response = await fetch('/api/chinese-to-english-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          direction: finalDirection,
          inputType: 'text',
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        translated?: string;
        suggestion?: string;
        needsUserConfirmation?: boolean;
        detectedInputLanguage?: string;
        detectedDirection?: string;
        languageInfo?: any;
      };

      if (!response.ok) {
        if (data.needsUserConfirmation && data.suggestion) {
          // 如果是语言检测问题，显示具体建议
          throw new Error(data.error);
        }
        throw new Error(data.error || pageData.tool.error);
      }

      setOutputText(data.translated || '');

      // 更新检测到的语言信息
      if (data.detectedDirection && !isManualDirection) {
        setAutoDirection(data.detectedDirection as 'zh-to-en' | 'en-to-zh');
      }
      clearWarning();
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
    resetDirection();
  };

  // Copy
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chinese-to-english-translator-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Input and Output Areas */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {/* Input Area */}
          <div className="flex-1 relative">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {inputHeading}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={textareaPlaceholder}
              className={`w-full h-48 md:h-64 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700 ${
                languageWarning
                  ? 'border-amber-300 dark:border-amber-600 focus:ring-amber-500'
                  : 'border-gray-300 dark:border-zinc-600'
              }`}
              aria-label={pageData.tool.inputLabel || inputHeading}
            />

            {/* File Upload */}
            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-medium rounded-lg cursor-pointer transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                {pageData.tool.uploadButton}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pageData.tool.uploadHint}
              </p>
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
                  }}
                  className="ml-auto text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  aria-label={pageData.tool.removeFileTooltip || 'Remove file'}
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

          <DirectionIndicator
            onToggle={() => {
              toggleDirection();
              clearWarning();
            }}
            directionLabel={directionStatusLabel}
            detectionStatus={detectionStatus}
            warning={languageWarning}
            toggleTitle={
              activeDirection === 'zh-to-en'
                ? isChineseLocale
                  ? '切换为 英语 → 中文'
                  : 'Switch to English → Chinese'
                : isChineseLocale
                  ? '切换为 中文 → 英语'
                  : 'Switch to Chinese → English'
            }
            ariaLabel={pageData.tool.toggleDirectionTooltip}
          />

          {/* Output Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {outputHeading}
              </h2>
              {outputText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={outputText} locale={locale} />
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    title={pageData.tool.copyTooltip || 'Copy'}
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
                    title={pageData.tool.downloadTooltip || 'Download'}
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
            <div
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-start justify-start text-gray-700 dark:text-gray-200 overflow-y-auto"
              aria-live="polite"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                  <span>{pageData.tool.loading}</span>
                </div>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : outputText ? (
                <p className="text-lg whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {isZhToEn ? pageData.tool.outputPlaceholder : outputAreaPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
          >
            {pageData.tool.resetButton || 'Reset'}
          </button>
        </div>
      </main>
    </div>
  );
}
