'use client';

import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import {
  type GibberishStyle,
  gibberishToText,
  textToGibberish,
} from '@/lib/gibberish';
import mammoth from 'mammoth';
import { useState } from 'react';

interface GibberishTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function GibberishTranslatorTool({
  pageData,
  locale = 'en',
}: GibberishTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'toGibberish' | 'toStandard'>('toGibberish');
  const [gibberishStyle, setGibberishStyle] =
    useState<GibberishStyle>('syllable');
  const [fileName, setFileName] = useState<string | null>(null);

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
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      let result: string;

      if (mode === 'toGibberish') {
        result = textToGibberish(inputText, gibberishStyle);
      } else {
        result = gibberishToText(inputText);
      }

      setTranslatedText(result);
    } catch (err: any) {
      setError(err.message || pageData.tool.error);
      setTranslatedText('');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle translation mode (Swap)
  const toggleMode = () => {
    // Swap input and output
    const temp = inputText;
    setInputText(translatedText);
    setTranslatedText(temp);
    setMode((prev) => (prev === 'toGibberish' ? 'toStandard' : 'toGibberish'));
    setFileName(null);
    setError(null);
  };

  // Reset all content
  const handleReset = () => {
    setInputText('');
    setTranslatedText('');
    setFileName(null);
    setError(null);
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
    a.download = `gibberish-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Style Selector */}
        {mode === 'toGibberish' && (
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {pageData.tool.styleLabel}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGibberishStyle('syllable')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gibberishStyle === 'syllable'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-zinc-500'
                }`}
              >
                {pageData.tool.styles.syllable}
              </button>
              <button
                onClick={() => setGibberishStyle('random')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gibberishStyle === 'random'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-zinc-500'
                }`}
              >
                {pageData.tool.styles.random}
              </button>
              <button
                onClick={() => setGibberishStyle('reverse')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  gibberishStyle === 'reverse'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-zinc-500'
                }`}
              >
                {pageData.tool.styles.reverse}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {/* Input Area */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {mode === 'toGibberish'
                ? pageData.tool.inputLabel
                : pageData.tool.gibberishLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'toGibberish'
                  ? pageData.tool.inputPlaceholder
                  : pageData.tool.gibberishPlaceholder
              }
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
                mode === 'toGibberish'
                  ? 'Switch to Gibberish → Standard'
                  : 'Switch to Standard → Gibberish'
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
                {mode === 'toGibberish'
                  ? pageData.tool.gibberishLabel
                  : pageData.tool.outputLabel}
              </h2>
              {/* TTS and action buttons */}
              {translatedText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={translatedText} locale={locale} />
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
                </div>
              )}
            </div>
            <div
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 overflow-y-auto"
              aria-live="polite"
            >
              {isLoading ? (
                <p>{pageData.tool.loading}</p>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : translatedText ? (
                <p className="text-lg whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {pageData.tool.outputPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Translate Button */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
            <i
              className={`${isLoading ? 'fas fa-spinner animate-spin' : 'fas fa-language'} ms-2`}
            ></i>
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
