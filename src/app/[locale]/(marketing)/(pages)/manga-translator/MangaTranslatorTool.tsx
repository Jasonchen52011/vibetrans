'use client';

import { Mic, Waves } from 'lucide-react';
// import mammoth from 'mammoth'; // Disabled for Edge Runtime compatibility
import { useEffect, useRef, useState } from 'react';

interface MangaTranslatorToolProps {
  pageData: any;
  locale?: string;
}

// Language detection patterns
const JAPANESE_PATTERNS = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/; // Hiragana, Katakana, Kanji

function detectLanguage(text: string): 'japanese' | 'english' | 'unknown' {
  if (JAPANESE_PATTERNS.test(text)) {
    return 'japanese';
  }
  // Basic check for English (latin characters and common words)
  if (/[a-zA-Z]/.test(text) && text.length > 2) {
    return 'english';
  }
  return 'unknown';
}

export default function MangaTranslatorTool({
  pageData,
  locale = 'en',
}: MangaTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<
    'japanese' | 'english' | 'unknown'
  >('unknown');
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-detect language when input changes
  useEffect(() => {
    if (inputText.trim()) {
      const detected = detectLanguage(inputText);
      setDetectedLanguage(detected);
    } else {
      setDetectedLanguage('unknown');
    }
  }, [inputText]);

  // Handle image upload for Japanese text recognition
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFileName(file.name);
    setError(null);
    setIsLoading(true);

    try {
      // Convert image to base64
      const base64 = await convertImageToBase64(file);

      // Call API to process image
      const response = await fetch('/api/manga-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      if (data.originalText && data.translatedText) {
        setInputText(data.originalText);
        setOutputText(data.translatedText);
        setDetectedLanguage(data.detectedLanguage);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) resolve(result);
        else reject(new Error('Failed to convert image'));
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle audio upload for transcription
  const handleAudioUploadClick = () => {
    audioInputRef.current?.click();
  };

  const handleAudioSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const audioFile = event.target.files?.[0];
    if (!audioFile) return;

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('/api/manga-translator/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      if (data.transcription) {
        setInputText((prev) =>
          prev ? `${prev}\n${data.transcription}` : data.transcription
        );
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Unable to transcribe audio at this time.');
    } finally {
      setIsTranscribing(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
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
      // Call our unified translation API
      const response = await fetch('/api/manga-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || pageData.tool.error);
      }

      setDetectedLanguage(data.detectedLanguage);
      setOutputText(data.translatedText || '');
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
  };

  // Copy - 动态加载
  const handleCopy = async () => {
    if (!outputText) return;

    try {
      // 动态导入复制功能
      const { smartCopyToClipboard } = await import('@/lib/utils/dynamic-copy');

      await smartCopyToClipboard(outputText, {
        successMessage: 'Translation copied to clipboard!',
        errorMessage: 'Failed to copy translation',
        onSuccess: () => {
          // 可以添加成功提示
        },
        onError: (error) => {
          console.error('Failed to copy:', error);
        },
      });
    } catch (error) {
      console.error('Copy function loading failed:', error);
    }
  };

  // Download - 动态加载
  const handleDownload = async () => {
    if (!outputText) return;

    try {
      // 动态导入下载功能
      const { smartDownload } = await import('@/lib/utils/dynamic-download');

      smartDownload(outputText, 'manga-translator', {
        onSuccess: () => {
          // 可以添加成功提示
        },
        onError: (error) => {
          console.error('Download failed:', error);
        },
      });
    } catch (error) {
      console.error('Download function loading failed:', error);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Input and Output Areas */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Input Area */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {detectedLanguage === 'japanese'
                ? 'Japanese Text (日本語)'
                : detectedLanguage === 'english'
                  ? 'English Text'
                  : pageData.tool.inputLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={pageData.tool.inputPlaceholder}
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
                Upload Image
              </label>

              {/* Audio Upload Button */}
              <button
                onClick={handleAudioUploadClick}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-zinc-600 transition-colors ${
                  isTranscribing
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-100'
                }`}
                aria-label="Upload audio for transcription"
              >
                <Waves className="h-5 w-5" />
              </button>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioSelected}
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

          {/* Output Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {detectedLanguage === 'japanese'
                  ? 'English Translation'
                  : detectedLanguage === 'english'
                    ? '日本語翻訳'
                    : pageData.tool.outputLabel}
              </h2>
              {outputText && (
                <div className="flex gap-2">
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
