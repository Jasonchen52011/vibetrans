'use client';

import { DirectionIndicator } from '@/components/translator/DirectionIndicator';
import { SpeechToTextButton } from '@/components/ui/speech-to-text-button';
import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { useSmartTranslatorDirection } from '@/hooks/use-smart-translator-direction';
import { ArrowRightIcon } from 'lucide-react';
import mammoth from 'mammoth';
import { useEffect, useMemo, useRef, useState } from 'react';

interface EsperantoTranslatorToolProps {
  pageData: any;
  locale?: string;
}

type TranslatorDirection = 'en-to-eo' | 'eo-to-en';

export default function EsperantoTranslatorTool({
  pageData,
  locale = 'en',
}: EsperantoTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const {
    activeDirection,
    isManualDirection,
    detectedLanguage,
    languageWarning,
    runLanguageDetection,
    toggleDirection,
    setAutoDirection,
    resetDirection,
    clearWarning,
  } = useSmartTranslatorDirection<TranslatorDirection>({
    apiPath: '/api/esperanto-translator',
    defaultDirection: 'en-to-eo',
    directions: ['en-to-eo', 'eo-to-en'],
    locale,
    supportedLanguages: ['english', 'esperanto'],
  });

  const directionConfig = useMemo(
    () => ({
      'en-to-eo': {
        inputLabel: pageData.tool.inputLabel || 'English Text',
        outputLabel: pageData.tool.esperantoLabel || 'Esperanto Translation',
        inputPlaceholder:
          pageData.tool.inputPlaceholder || 'Enter English text...',
        outputPlaceholder:
          pageData.tool.outputPlaceholder ||
          'Esperanto translation will appear here...',
        statusLabel: 'English → Esperanto',
      },
      'eo-to-en': {
        inputLabel: pageData.tool.esperantoLabel || 'Esperanto Text',
        outputLabel: pageData.tool.inputLabel || 'English Translation',
        inputPlaceholder:
          pageData.tool.esperantoPlaceholder || 'Enigu Esperanto-tekston...',
        outputPlaceholder:
          pageData.tool.outputPlaceholder ||
          'English translation will appear here...',
        statusLabel: 'Esperanto → English',
      },
    }),
    [pageData.tool]
  );

  const currentConfig = directionConfig[activeDirection];

  useEffect(() => {
    if (translatedText && outputRef.current) {
      const timeout = setTimeout(() => {
        outputRef.current?.scrollTo({
          top: outputRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [translatedText]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!inputText.trim()) return;
      await runLanguageDetection(inputText);
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [inputText, runLanguageDetection]);

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
      setError(err.message || pageData.tool.error);
      setFileName(null);
    }
  };

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
      } catch {
        throw new Error(
          'Failed to read .docx file. Please ensure it is a valid Word document.'
        );
      }
    }

    throw new Error(
      'Unsupported file format. Please upload .txt or .docx files.'
    );
  };

  const handleSpeechTranscript = (transcript: string) => {
    setInputText((prev) =>
      prev ? `${prev.trim()}\n${transcript}` : transcript
    );
  };

  const handleTranslate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setError(pageData.tool.noInput);
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const detectionSummary = await runLanguageDetection(trimmed);
      if (
        !isManualDirection &&
        (languageWarning ||
          detectionSummary.detectedInputLanguage === 'unknown') &&
        detectionSummary.confidence < 0.3
      ) {
        throw new Error(
          pageData.tool.languageWarning ||
            'Please provide English or Esperanto text.'
        );
      }

      const finalDirection = isManualDirection
        ? activeDirection
        : detectionSummary.detectedDirection;

      const response = await fetch('/api/esperanto-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          direction: finalDirection,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || pageData.tool.error);
      }

      const translated = (data.translated || '').trim();
      if (!translated) {
        throw new Error(pageData.tool.error);
      }
      if (translated.toLowerCase() === trimmed.toLowerCase()) {
        throw new Error(
          pageData.tool.sameOutputError ||
            'Translation matches the input. Please try different text.'
        );
      }

      setTranslatedText(translated);
      if (!isManualDirection && data.direction) {
        setAutoDirection(
          data.direction === 'eo-to-en' ? 'eo-to-en' : 'en-to-eo'
        );
      }
      clearWarning();
    } catch (err: any) {
      setError(err.message || pageData.tool.error);
      setTranslatedText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setTranslatedText('');
    setFileName(null);
    setError(null);
    resetDirection();
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esperanto-translator-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const directionStatusLabel = directionConfig[activeDirection].statusLabel;
  const detectionStatus =
    detectedLanguage === 'english'
      ? 'Detected input: English'
      : detectedLanguage === 'esperanto'
        ? 'Detected input: Esperanto'
        : 'Auto-detecting. Speak or paste English/Esperanto text.';

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {currentConfig.inputLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentConfig.inputPlaceholder}
              className={`w-full h-48 md:h-64 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700 ${
                languageWarning
                  ? 'border-amber-300 dark:border-amber-600 focus:ring-amber-500'
                  : 'border-gray-300 dark:border-zinc-600'
              }`}
              aria-label={currentConfig.inputLabel}
            />

            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="file-upload-esperanto"
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
                {pageData.tool.uploadButton || 'Upload File'}
              </label>
              <SpeechToTextButton
                onTranscript={handleSpeechTranscript}
                locale={locale}
              />
              <input
                id="file-upload-esperanto"
                type="file"
                accept=".txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

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
              activeDirection === 'en-to-eo'
                ? 'Switch to Esperanto → English'
                : 'Switch to English → Esperanto'
            }
            ariaLabel={pageData.tool.toggleModeTooltip}
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {currentConfig.outputLabel}
              </h2>
              {translatedText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={translatedText} locale={locale} />
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
              ref={outputRef}
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
                  <span>{pageData.tool.loading || 'Processing...'}</span>
                </div>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : translatedText ? (
                <p className="text-lg whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {currentConfig.outputPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
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

