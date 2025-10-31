'use client';

import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { ArrowRightIcon } from 'lucide-react';
import { useRef, useState } from 'react';

interface BabyTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function BabyTranslatorTool({
  pageData,
  locale = 'en',
}: BabyTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
        setInputText(
          `Recorded audio (${(audioBlob.size / 1024).toFixed(2)} KB)`
        );
        setFileName('recorded-cry.webm');

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      setError(
        'Failed to access microphone. Please allow microphone permission.'
      );
      console.error('Recording error:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle translation/analysis
  const handleTranslate = async () => {
    if (!inputText.trim() && !audioBlob) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      if (audioBlob) {
        // Send audio file for analysis
        const formData = new FormData();
        formData.append('audio', audioBlob, fileName || 'recorded-cry.webm');

        const response = await fetch('/api/baby-translator', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as {
          translated?: string;
          result?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || pageData.tool.error);
        }

        setOutputText(data.translated || data.result || '');
      } else {
        // Fallback to text analysis
        const response = await fetch('/api/baby-translator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });

        const data = (await response.json()) as {
          translated?: string;
          result?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || pageData.tool.error);
        }

        setOutputText(data.translated || data.result || '');
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
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
    setAudioBlob(null);
    if (isRecording) {
      stopRecording();
    }
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
      smartDownload(outputText, 'baby-translator', {
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
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Recording Input Area - 水平居中的大框 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 w-full max-w-md text-left">
              {pageData.tool.inputLabel}
            </h2>

            {/* 录音大框 - 点击开始/停止录音 */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full max-w-md h-64 border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                isRecording
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : 'border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-600'
              }`}
            >
              {isRecording ? (
                <>
                  <svg
                    className="w-24 h-24 text-red-500 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                  <span className="text-xl font-semibold text-red-600 dark:text-red-400">
                    Recording... Click to Stop
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {audioBlob
                      ? `${(audioBlob.size / 1024).toFixed(2)} KB recorded`
                      : 'Recording in progress'}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-24 h-24 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Click to Start Recording
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Record your baby's cry for analysis
                  </span>
                </>
              )}
            </button>

            {/* 录音文件显示 */}
            {audioBlob && !isRecording && (
              <div className="mt-4 w-full max-w-md flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-700 rounded-md border border-gray-200 dark:border-zinc-600">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Ready to analyze
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(audioBlob.size / 1024).toFixed(2)} KB recorded
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioBlob(null);
                    setInputText('');
                    setFileName(null);
                  }}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  aria-label={
                    pageData.tool.removeRecordingTooltip || 'Remove recording'
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
                {pageData.tool.outputLabel}
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
              className="w-full h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-start justify-start text-gray-700 dark:text-gray-200 overflow-y-auto"
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
            type="button"
            onClick={handleTranslate}
            disabled={isLoading || !audioBlob}
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
            Reset
          </button>
        </div>

        </main>
    </div>
  );
}
