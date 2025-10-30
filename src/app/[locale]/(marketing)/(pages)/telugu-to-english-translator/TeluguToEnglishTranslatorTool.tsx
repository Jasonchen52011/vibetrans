'use client';

import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { detectLanguage } from '@/lib/language-detection';
import { readFileContent } from '@/lib/utils/file-utils';
import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TeluguToEnglishTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function TeluguToEnglishTranslatorTool({
  pageData,
  locale = 'en',
}: TeluguToEnglishTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [translationMode, setTranslationMode] = useState<string>('general');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('unknown');
  const [targetLanguage, setTargetLanguage] = useState<string>('english');
  
  // Auto-detect input language when text changes
  useEffect(() => {
    if (inputText.trim()) {
      const detection = detectLanguage(inputText, 'telugu');
      setDetectedLanguage(detection.detectedLanguage);

      // Set target language based on detection
      if (detection.detectedLanguage === 'english') {
        setTargetLanguage('telugu');
      } else {
        setTargetLanguage('english');
      }
    } else {
      setDetectedLanguage('unknown');
      setTargetLanguage('english');
    }
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
      const response = await fetch('/api/telugu-to-english-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLanguage: detectedLanguage === 'english' ? 'english' : 'telugu',
          targetLanguage: targetLanguage,
          mode: translationMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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

  // Reset
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setFileName(null);
    setError(null);
    setDetectedLanguage('unknown');
    setTargetLanguage('english');
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
    a.download = `telugu-to-english-translator-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Switch translation direction
  const handleSwitchDirection = () => {
    // Swap input and output text
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);

    // Switch detected language and target language
    const tempDetected = detectedLanguage;
    setDetectedLanguage(targetLanguage === 'english' ? 'telugu' : 'english');
    setTargetLanguage(
      tempDetected === 'unknown'
        ? 'english'
        : tempDetected === 'telugu'
          ? 'english'
          : 'telugu'
    );
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Translation Mode Selector */}
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Translation Mode
            </label>
            <select
              value={translationMode}
              onChange={(e) => setTranslationMode(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200"
            >
              <option value="general">General Translation</option>
              <option value="technical">Technical Translation</option>
              <option value="literary">Literary Translation</option>
              <option value="business">Business Translation</option>
              <option value="casual">Casual Translation</option>
            </select>
          </div>
        </div>

        {/* Input and Output Areas */}
        <div className="flex flex-col lg:flex-row gap-1 items-start">
          {/* Input Area */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {detectedLanguage === 'english'
                ? 'English Text'
                : detectedLanguage === 'telugu'
                  ? 'Telugu Text'
                  : pageData.tool.inputLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={pageData.tool.inputPlaceholder}
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
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

          {/* Switch Button */}
          <div className="flex items-center justify-center mt-8 lg:mt-32 lg:mx-4">
            <button
              onClick={handleSwitchDirection}
              className="flex items-center justify-center w-12 h-12 p-0 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-500 dark:text-gray-400 rounded-full border border-gray-300 dark:border-zinc-600 transition-all duration-200 hover:scale-105"
              title="Switch translation direction"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Output Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {targetLanguage === 'english'
                  ? 'English Translation'
                  : targetLanguage === 'telugu'
                    ? 'Telugu Translation'
                    : pageData.tool.outputLabel}
              </h2>
              {outputText && (
                <div className="flex gap-2">
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
            <div
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 overflow-y-auto"
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
