'use client';

import { DirectionIndicator } from '@/components/translator/DirectionIndicator';
import { SpeechToTextButton } from '@/components/ui/speech-to-text-button';
import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { useSmartTranslatorDirection } from '@/hooks/use-smart-translator-direction';
import { ArrowRightIcon, Waves } from 'lucide-react';
import mammoth from 'mammoth';
import { useEffect, useMemo, useRef, useState } from 'react';

type TranslatorDirection = 'en-og' | 'og-en';

interface OghamTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function OghamTranslatorTool({
  pageData,
  locale = 'en',
}: OghamTranslatorToolProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

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
    apiPath: '/api/ogham-translator',
    defaultDirection: 'en-og',
    directions: ['en-og', 'og-en'],
    locale,
    supportedLanguages: ['english', 'ogham'],
    warningMessage:
      pageData.tool.languageWarning ||
      'Please enter English text or paste Ogham runes.',
  });

  const isEnglishToOgham = activeDirection === 'en-og';
  const englishLabel = pageData.tool.englishLabel || 'English';
  const oghamLabel = pageData.tool.oghamLabel || 'Ogham';

  const inputPlaceholder = useMemo(
    () =>
      isEnglishToOgham
        ? pageData.tool.inputPlaceholder ||
          'Enter English text to convert into Ogham characters...'
        : pageData.tool.oghamInputPlaceholder ||
          '᚛Write Ogham runes here for English conversion᚜',
    [isEnglishToOgham, pageData.tool]
  );

  const outputPlaceholder = useMemo(
    () =>
      isEnglishToOgham
        ? pageData.tool.oghamOutputPlaceholder ||
          'Ogham translation will appear here'
        : pageData.tool.outputPlaceholder ||
          'English transliteration will appear here',
    [isEnglishToOgham, pageData.tool]
  );

  const directionStatusLabel = isEnglishToOgham
    ? `${englishLabel} → ${oghamLabel}`
    : `${oghamLabel} → ${englishLabel}`;

  const detectionStatus =
    detectedLanguage === 'english'
      ? `Detected input: ${englishLabel}`
      : detectedLanguage === 'ogham'
        ? `Detected input: ${oghamLabel}`
        : 'Auto-detecting. Enter English text or Ogham characters.';

  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      clearWarning();
      return;
    }
    const timeoutId = setTimeout(async () => {
      await runLanguageDetection(trimmed);
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [inputText, runLanguageDetection, clearWarning]);

  const readFileContent = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) resolve(content);
          else reject(new Error('File is empty'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }

    if (extension === 'docx') {
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

  const handleSpeechTranscript = (transcript: string) => {
    setInputText((previous) =>
      previous ? `${previous.trim()}\n${transcript}` : transcript
    );
  };

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

      const response = await fetch('/api/ogham-translator/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      if (data.transcription) {
        setInputText((previous) =>
          previous ? `${previous.trim()}\n${data.transcription}` : data.transcription
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

  const handleTranslate = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

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
            'Please enter English text or paste Ogham runes.'
        );
      }

      const finalDirection = isManualDirection
        ? activeDirection
        : detectionSummary.detectedDirection;

      const response = await fetch('/api/ogham-translator', {
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

      setOutputText(translated);
      if (!isManualDirection) {
        const nextDirection =
          (data.detectedDirection as TranslatorDirection | undefined) ||
          finalDirection;
        setAutoDirection(nextDirection);
      }
      clearWarning();
    } catch (err: any) {
      setError(err.message || 'Translation failed');
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setFileName(null);
    setError(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
    resetDirection();
    clearWarning();
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (err) {
      console.error('Failed to copy output text', err);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ogham-translation-${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDirectionToggle = () => {
    toggleDirection();
    clearWarning();
    if (outputText.trim()) {
      setInputText(outputText);
      setOutputText('');
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {isEnglishToOgham ? englishLabel : oghamLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder={inputPlaceholder}
              className={`w-full h-48 md:h-64 p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700 ${
                languageWarning
                  ? 'border-amber-300 dark:border-amber-600 focus:ring-amber-500'
                  : 'border-gray-300 dark:border-zinc-600'
              }`}
              aria-label={isEnglishToOgham ? englishLabel : oghamLabel}
            />

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <label
                htmlFor="file-upload-ogham"
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
                onTranscript={handleSpeechTranscript}
                locale={locale}
              />
              <button
                type="button"
                onClick={handleAudioUploadClick}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 dark:border-zinc-600 transition-colors ${
                  isTranscribing
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-100'
                }`}
                aria-label={pageData.tool.audioUploadTooltip || 'Upload audio for transcription'}
                disabled={isTranscribing}
              >
                <Waves className="h-5 w-5" />
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isTranscribing
                  ? pageData.tool.transcribingLabel || 'Transcribing audio...'
                  : pageData.tool.uploadHint ||
                    'Supports .txt, .docx, and audio uploads.'}
              </p>
              <input
                id="file-upload-ogham"
                type="file"
                accept=".txt,.docx"
                onChange={handleFileUpload}
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
                  type="button"
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
            onToggle={handleDirectionToggle}
            directionLabel={directionStatusLabel}
            detectionStatus={detectionStatus}
            warning={languageWarning}
            toggleTitle={
              isEnglishToOgham
                ? 'Switch to Ogham → English'
                : 'Switch to English → Ogham'
            }
            ariaLabel={
              pageData.tool.toggleDirectionTooltip ||
              'Toggle translation direction'
            }
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {isEnglishToOgham ? oghamLabel : englishLabel}
              </h2>
              {outputText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={outputText} locale={locale} />
                  <button
                    type="button"
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
                    type="button"
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
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                  <span>{pageData.tool.loading || 'Translating...'}</span>
                </div>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : outputText ? (
                <p className="text-lg whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {outputPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
          <button
            type="button"
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
