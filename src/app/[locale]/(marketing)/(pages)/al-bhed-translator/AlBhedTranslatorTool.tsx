'use client';

import { SpeechToTextButton } from '@/components/ui/speech-to-text-button';
import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import {
  autoTranslate,
  detectLanguage,
  smartAutoTranslate,
} from '@/lib/al-bhed';
import { detectLanguage as smartDetectLanguage } from '@/lib/language-detection';
import mammoth from 'mammoth';
import { useEffect, useRef, useState } from 'react';

interface AlBhedTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function AlBhedTranslatorTool({
  pageData,
  locale = 'en',
}: AlBhedTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'toAlBhed' | 'toEnglish'>('toAlBhed');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isQuery, setIsQuery] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // 智能语言检测相关状态
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [inputLabel, setInputLabel] = useState<string>('');
  const [outputLabel, setOutputLabel] = useState<string>('');
  const [inputPlaceholder, setInputPlaceholder] = useState<string>('');
  const [outputPlaceholder, setOutputPlaceholder] = useState<string>('');
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Auto-translate on file upload
      handleTranslateNow(text);
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
      setFileName(null);
    }
  };

  // Read file content
  const readFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // Handle .txt files
    if (fileExtension === 'txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            resolve(content);
          } else {
            reject(new Error('File is empty'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      });
    }

    // Handle .docx files with mammoth
    if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value) {
          return result.value;
        }
        throw new Error('Failed to extract text from Word document');
      } catch (error) {
        throw new Error(
          'Failed to read .docx file. Please ensure it is a valid Word document.'
        );
      }
    }

    // Unsupported file type
    if (fileExtension === 'doc') {
      throw new Error(
        'Old .doc format is not supported. Please save as .docx (File → Save As → Word Document (.docx)) or copy-paste the text directly.'
      );
    }

    throw new Error(
      'Unsupported file format. Please upload .txt or .docx files.'
    );
  };

  // Handle translation
  const handleTranslate = () => {
    handleTranslateNow(inputText);
  };

  // Real-time translation function
  const handleTranslateNow = (text: string) => {
    if (!text.trim()) {
      setError(pageData.tool.noInput);
      setTranslatedText('');
      setIsQuery(false);
      setShowExplanation(false);
      return;
    }

    setError(null);

    try {
      // Use smart auto-translate that handles both translation and language queries
      const result = smartAutoTranslate(text);
      setTranslatedText(result.result);
      setIsQuery(result.isQuery);
      setShowExplanation(result.isQuery);
    } catch (err: any) {
      setError(err.message || 'Translation failed');
      setTranslatedText('');
      setIsQuery(false);
      setShowExplanation(false);
    }
  };

  // Toggle translation mode (Swap)
  const toggleMode = () => {
    // Swap input and output
    const temp = inputText;
    setInputText(translatedText);
    setTranslatedText(temp);
    setMode((prev) => (prev === 'toAlBhed' ? 'toEnglish' : 'toAlBhed'));
    setFileName(null);
    setError(null);
  };

  // Reset all content
  const handleReset = () => {
    setInputText('');
    setTranslatedText('');
    setFileName(null);
    setError(null);
    setIsQuery(false);
    setShowExplanation(false);
  };

  // Copy result to clipboard
  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      // Optional: Show success feedback
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download result as text file
  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al-bhed-translated-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    const newText = inputText + (inputText ? ' ' : '') + transcript;
    setInputText(newText);
    // Real-time translation
    handleTranslateNow(newText);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {/* Input Area */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {mode === 'toAlBhed'
                ? pageData.tool.inputLabel
                : pageData.tool.alBhedLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                // Real-time translation
                handleTranslateNow(e.target.value);
              }}
              placeholder={
                mode === 'toAlBhed'
                  ? pageData.tool.inputPlaceholder
                  : pageData.tool.alBhedPlaceholder
              }
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
            />

            {/* File Upload and Voice Input */}
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
              <SpeechToTextButton
                onTranscript={handleVoiceInput}
                locale={locale}
              />
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
            <div>
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
                      setTranslatedText('');
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
          </div>

          {/* Swap Button - in the middle */}
          <div className="flex md:flex-col items-center justify-center md:justify-start md:pt-32">
            <button
              onClick={toggleMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rotate-0 md:rotate-0"
              title={
                mode === 'toAlBhed'
                  ? 'Switch to Al Bhed → English'
                  : 'Switch to English → Al Bhed'
              }
              aria-label="Toggle translation mode"
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
                {isQuery
                  ? 'Al Bhed Language Info'
                  : mode === 'toAlBhed'
                    ? pageData.tool.alBhedLabel
                    : pageData.tool.outputLabel}
              </h2>
              {/* TTS and action buttons */}
              {translatedText && (
                <div className="flex gap-2">
                  {!isQuery && (
                    <TextToSpeechButton text={translatedText} locale={locale} />
                  )}
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    title="Copy"
                    aria-label="Copy result"
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
                  {!isQuery && (
                    <button
                      onClick={handleDownload}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                      title="Download"
                      aria-label="Download result"
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
                  )}
                </div>
              )}
            </div>
            <div
              className={`w-full ${isQuery ? 'h-auto min-h-48' : 'h-48 md:h-64'} p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 overflow-y-auto`}
              aria-live="polite"
            >
              {error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : translatedText ? (
                <div>
                  {isQuery ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {translatedText}
                      </div>
                      {showExplanation && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>提示：</strong>输入任何文本进行Al
                            Bhed翻译，或询问关于Al Bhed语言的问题。
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg whitespace-pre-wrap">
                      {translatedText}
                    </p>
                  )}
                </div>
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
            className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            {pageData.tool.translateButton}
            <i className="fas fa-language ms-2"></i>
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
            title="Reset"
          >
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
