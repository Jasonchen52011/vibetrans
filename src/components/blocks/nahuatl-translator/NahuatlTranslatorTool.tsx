'use client';

import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';
import { useEffect, useRef, useState } from 'react';

import { readFileContent } from '@/lib/utils/file-utils';
interface NahuatlTranslatorToolProps {
  pageData: any;
  locale?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function NahuatlTranslatorTool({
  pageData,
  locale = 'en',
}: NahuatlTranslatorToolProps) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('auto');
  const [contextNotes, setContextNotes] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'auto'; // Auto-detect language

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;

          if (event.results[current].isFinal) {
            setInputText((prev) => prev + (prev ? ' ' : '') + transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

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

  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsText(file);
}
)
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

throw new Error('Unsupported file format. Please upload .txt or .docx files.');
}

// Toggle speech recognition
const toggleListening = () => {
  if (!recognitionRef.current) return;

  if (isListening) {
    recognitionRef.current.stop();
    setIsListening(false);
  } else {
    recognitionRef.current.start();
    setIsListening(true);
  }
};

// Handle smart translation
const handleTranslate = async () => {
  if (!inputText.trim()) {
    setError(pageData.tool?.noInput || 'Please enter some text to translate');
    setOutputText('');
    return;
  }

  setIsLoading(true);
  setError(null);
  setOutputText('');
  setDetectedLanguage('');

  try {
    const response = await fetch('/api/nahuatl-translator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: inputText,
        targetLanguage: targetLanguage,
        context: contextNotes,
        sourceLanguage: 'auto', // Auto-detect source language
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || pageData.tool?.error || 'Translation failed'
      );
    }

    setOutputText(data.translated || data.result || '');
    setDetectedLanguage(data.detectedLanguage || '');

    // Update context if provided
    if (data.contextNotes) {
      setContextNotes(data.contextNotes);
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
  setDetectedLanguage('');
  setContextNotes('');
  if (isListening && recognitionRef.current) {
    recognitionRef.current.stop();
  }
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
  a.download = `nahuatl-translation-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

return (
    <div className="container max-w-6xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Language Settings and Context */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Translation Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Language:
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="auto">Auto-detect Best Match</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="nah">Nahuatl</option>
                <option value="zh">Chinese</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            {/* Context Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Context Notes (Optional):
              </label>
              <input
                type="text"
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                placeholder="e.g., ceremonial text, daily conversation"
                className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Detected Language Display */}
          {detectedLanguage && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Detected Language:</span>{' '}
                {detectedLanguage}
              </p>
            </div>
          )}
        </div>

        {/* Input and Output Areas */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Input Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {pageData.tool?.inputLabel || 'Input Text'}
              </h2>

              {/* Speech Input Controls */}
              <div className="flex gap-2">
                {isSpeechSupported && (
                  <button
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? (
                      <svg
                        className="w-5 h-5 animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                pageData.tool?.inputPlaceholder || 'Enter text to translate...'
              }
              className="w-full h-48 lg:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
            />

            {/* File Upload */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label
                htmlFor="file-upload-nahuatl"
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
                {pageData.tool?.uploadButton || 'Upload File'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {pageData.tool?.uploadHint || 'Supports .txt and .docx files'}
              </p>
              <input
                ref={fileInputRef}
                id="file-upload-nahuatl"
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

          {/* Output Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {pageData.tool?.outputLabel || 'Translation'}
              </h2>
              {outputText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={outputText} locale={locale} />
                  <button
                    onClick={handleCopy}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    title="Copy translation"
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
                    title="Download translation"
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
              className="w-full h-48 lg:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 overflow-y-auto"
              aria-live="polite"
            >
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>{pageData.tool?.loading || 'Translating...'}</p>
                </div>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              ) : outputText ? (
                <p className="text-lg whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {pageData.tool?.outputPlaceholder ||
                    'Translation will appear here...'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? pageData.tool?.loading || 'Translating...'
              : pageData.tool?.translateButton || 'Translate'}
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
          >
            {pageData.tool?.resetButton || 'Reset'}
          </button>
        </div>

        {/* Speech Status Indicator */}
        {isListening && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
            <p className="text-red-700 dark:text-red-300 font-medium animate-pulse">
              🎤 Listening... Speak now
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
