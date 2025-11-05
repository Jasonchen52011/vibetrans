'use client';

import { readFileContent } from '@/lib/utils/file-utils';
import { ArrowRightIcon } from 'lucide-react';
// import mammoth from 'mammoth'; // Disabled for Edge Runtime compatibility
import { useEffect, useState } from 'react';

// 语言检测结果接口
interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  suggestedDirection: 'to-english' | 'from-english';
}

interface CreoleToEnglishTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function CreoleToEnglishTranslatorTool({
  pageData,
  locale = 'en',
}: CreoleToEnglishTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // 智能翻译状态
  const [direction, setDirection] = useState<'creole-to-en' | 'en-to-creole'>(
    'creole-to-en'
  );
  const [detectedLanguage, setDetectedLanguage] = useState<string>('unknown');
  const [detectedDirection, setDetectedDirection] = useState<
    'creole-to-en' | 'en-to-creole'
  >('creole-to-en');
  const [languageWarning, setLanguageWarning] = useState<string>('');

  const toolConfig = pageData?.tool ?? {};
  const englishLabel =
    typeof toolConfig.englishLabel === 'string' && toolConfig.englishLabel
      ? toolConfig.englishLabel
      : 'English';
  const creoleLabel =
    typeof toolConfig.creoleLabel === 'string' && toolConfig.creoleLabel
      ? toolConfig.creoleLabel
      : 'Creole';
  const englishLabelLower = englishLabel.toLowerCase();
  const creoleLabelLower = creoleLabel.toLowerCase();
  const languageWarningText =
    typeof toolConfig.languageWarning === 'string' && toolConfig.languageWarning
      ? toolConfig.languageWarning
      : 'Please input Creole or English';
  const creoleInputHeading =
    typeof toolConfig.creoleInputHeading === 'string' &&
    toolConfig.creoleInputHeading
      ? toolConfig.creoleInputHeading
      : `${creoleLabel} Text`;
  const englishInputHeading =
    typeof toolConfig.englishInputHeading === 'string' &&
    toolConfig.englishInputHeading
      ? toolConfig.englishInputHeading
      : `${englishLabel} Text`;
  const creoleOutputHeading =
    typeof toolConfig.creoleOutputHeading === 'string' &&
    toolConfig.creoleOutputHeading
      ? toolConfig.creoleOutputHeading
      : `${creoleLabel} Translation`;
  const englishOutputHeading =
    typeof toolConfig.englishOutputHeading === 'string' &&
    toolConfig.englishOutputHeading
      ? toolConfig.englishOutputHeading
      : `${englishLabel} Translation`;
  const englishPlaceholder =
    typeof toolConfig.englishPlaceholder === 'string' &&
    toolConfig.englishPlaceholder
      ? toolConfig.englishPlaceholder
      : 'Enter English text or upload a file...';
  const inputPlaceholder =
    typeof toolConfig.inputPlaceholder === 'string' &&
    toolConfig.inputPlaceholder
      ? toolConfig.inputPlaceholder
      : 'Enter your text or upload a file...';
  const englishOutputPlaceholder =
    typeof toolConfig.englishOutputPlaceholder === 'string' &&
    toolConfig.englishOutputPlaceholder
      ? toolConfig.englishOutputPlaceholder
      : (toolConfig.outputPlaceholder ??
        'Translation results will appear here');
  const creoleOutputPlaceholder =
    typeof toolConfig.creoleOutputPlaceholder === 'string' &&
    toolConfig.creoleOutputPlaceholder
      ? toolConfig.creoleOutputPlaceholder
      : (toolConfig.outputPlaceholder ??
        'Translation results will appear here');
  const toggleToCreoleText =
    typeof toolConfig.toggleToCreole === 'string' && toolConfig.toggleToCreole
      ? toolConfig.toggleToCreole
      : 'Switch to English -> Creole';
  const toggleToEnglishText =
    typeof toolConfig.toggleToEnglish === 'string' && toolConfig.toggleToEnglish
      ? toolConfig.toggleToEnglish
      : 'Switch to Creole -> English';
  const copyTooltip =
    typeof toolConfig.copyResultTooltip === 'string' &&
    toolConfig.copyResultTooltip
      ? toolConfig.copyResultTooltip
      : (toolConfig.copyTooltip ?? 'Copy');
  const downloadTooltip =
    typeof toolConfig.downloadResultTooltip === 'string' &&
    toolConfig.downloadResultTooltip
      ? toolConfig.downloadResultTooltip
      : (toolConfig.downloadTooltip ?? 'Download');
  const removeFileTooltip =
    typeof toolConfig.removeFileTooltip === 'string' &&
    toolConfig.removeFileTooltip
      ? toolConfig.removeFileTooltip
      : 'Remove file';
  const resetButtonText =
    typeof toolConfig.resetButton === 'string' && toolConfig.resetButton
      ? toolConfig.resetButton
      : 'Reset';
  // 实时语言检测
  useEffect(() => {
    if (!inputText.trim()) {
      setDetectedLanguage('unknown');
      setDetectedDirection('creole-to-en');
      setLanguageWarning('');
      return;
    }

    // 防抖处理，避免频繁检测
    const timeoutId = setTimeout(async () => {
      try {
        // 调用语言检测API
        const response = await fetch('/api/creole-to-english-translator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText, detectOnly: true }),
        });

        if (response.ok) {
          const data = await response.json();
          setDetectedLanguage(data.detectedInputLanguage);
          setDetectedDirection(data.detectedDirection);

          // 自动切换翻译方向
          if (
            data.detectedDirection &&
            (data.detectedInputLanguage === englishLabelLower ||
              data.detectedInputLanguage === creoleLabelLower)
          ) {
            setDirection(data.detectedDirection);
          }

          // 如果检测到其他语言，显示警告
          if (
            data.detectedInputLanguage === 'unknown' &&
            data.confidence < 0.3
          ) {
            setLanguageWarning(languageWarningText);
          } else {
            setLanguageWarning('');
          }
        }
      } catch (err) {
        // 如果检测失败，保持当前状态
        console.warn('Language detection failed:', err);
      }
    }, 800); // 800ms 防抖

    return () => clearTimeout(timeoutId);
  }, [inputText, englishLabelLower, creoleLabelLower, languageWarningText]);

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

  // Handle translation with smart detection
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    // 如果有语言警告，不进行翻译
    if (languageWarning) {
      setError(languageWarning);
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      const response = await fetch('/api/creole-to-english-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
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
      if (data.detectedInputLanguage) {
        setDetectedLanguage(data.detectedInputLanguage);
      }
      if (data.detectedDirection) {
        setDetectedDirection(
          data.detectedDirection as 'creole-to-en' | 'en-to-creole'
        );
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
    setDirection('creole-to-en');
    setDetectedLanguage('unknown');
    setDetectedDirection('creole-to-en');
    setLanguageWarning('');
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
      smartDownload(outputText, 'creole-to-english-translator', {
        onSuccess: () => {},
        onError: (error) => console.error('Download failed:', error),
      });
    } catch (error) {
      console.error('Download function loading failed:', error);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Input and Output Areas */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {/* Input Area */}
          <div className="flex-1 relative">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {direction === 'creole-to-en'
                ? creoleInputHeading
                : englishInputHeading}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                direction === 'creole-to-en'
                  ? inputPlaceholder
                  : englishPlaceholder
              }
              className={`w-full h-48 md:h-64 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700 ${
                languageWarning
                  ? 'border-amber-300 dark:border-amber-600 focus:ring-amber-500'
                  : 'border-gray-300 dark:border-zinc-600'
              }`}
              aria-label={
                direction === 'creole-to-en'
                  ? creoleLabel
                  : englishLabel || 'Input text'
              }
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
                  aria-label={removeFileTooltip}
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

          {/* Direction Swap Button - Centered between inputs */}
          <div className="flex md:flex-col items-center justify-center md:justify-start md:pt-32">
            <button
              onClick={() =>
                setDirection(
                  direction === 'creole-to-en' ? 'en-to-creole' : 'creole-to-en'
                )
              }
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rotate-0 md:rotate-0"
              title={
                direction === 'creole-to-en'
                  ? toggleToCreoleText
                  : toggleToEnglishText
              }
              aria-label={
                (typeof toolConfig.toggleDirectionTooltip === 'string' &&
                toolConfig.toggleDirectionTooltip
                  ? toolConfig.toggleDirectionTooltip
                  : undefined) ||
                (direction === 'creole-to-en'
                  ? toggleToCreoleText
                  : toggleToEnglishText)
              }
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
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {direction === 'creole-to-en'
                  ? englishOutputHeading
                  : creoleOutputHeading}
              </h2>
              {outputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    title={copyTooltip}
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
                    title={downloadTooltip}
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
                  {direction === 'creole-to-en'
                    ? englishOutputPlaceholder
                    : creoleOutputPlaceholder}
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
            {resetButtonText}
          </button>
        </div>
      </main>
    </div>
  );
}
