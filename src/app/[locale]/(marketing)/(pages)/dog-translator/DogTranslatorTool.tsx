// app/dog-translator/tool-page.tsx
'use client'; // Client component declaration

import { ToolInfoSections } from '@/components/blocks/tool/tool-info-sections';
import { ArrowRightIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Define emotion types and sound mapping
type Emotion = 'happy' | 'sad' | 'angry' | 'normal';

// Sound file mapping table - use direct public paths with base path support
const soundMap: Record<Emotion, string[]> = {
  happy: ['/voice/happy.mp3', '/voice/happy3.mp3'],
  sad: ['/voice/sad.mp3'],
  angry: ['/voice/angry.mp3'],
  normal: ['/voice/normal.mp3'],
};

// Fallback audio files (used when primary files fail to load)
const fallbackSounds: Record<Emotion, string> = {
  happy: '/voice/happy.mp3',
  sad: '/voice/sad.mp3',
  angry: '/voice/angry.mp3',
  normal: '/voice/normal.mp3',
};

// Helper function to get correct static path
function getStaticPath(path: string): string {
  // For production deployment, ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

// Helper function: randomly select an element from array (kept but now directly using index in new logic)

interface DogTranslatorToolProps {
  pageData: any;
  locale?: string;
}

export default function DogTranslatorTool({
  pageData,
  locale = 'en',
}: DogTranslatorToolProps) {
  // State variable: user input text
  const [inputText, setInputText] = useState<string>('');
  // State variable: AI analyzed emotion
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  // State variable: message shown to user, describing the dog's possible mood
  const [dogResponseMessage, setDogResponseMessage] = useState<string>('');
  // State variable: loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State variable: error message
  const [error, setError] = useState<string | null>(null);
  // State variable: audio playing status
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // State variable: audio loading status
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  // State variable: currently selected audio file
  const [selectedAudioFile, setSelectedAudioFile] = useState<string | null>(
    null
  );
  // State variable: audio loading error message
  const [audioError, setAudioError] = useState<string | null>(null);
  // Audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Play timeout reference
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle text translation (emotion classification)
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setDogResponseMessage('');
      setDetectedEmotion(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDogResponseMessage('');
    setDetectedEmotion(null);
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setSelectedAudioFile(null); // Clear previously selected audio file
    setAudioError(null); // Clear audio error message
    // Clean up previous audio completely to prevent auto-play
    if (audioRef.current) {
      // Remove all event listeners to prevent any auto-play
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current.onloadeddata = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }

    try {
      const response = await fetch('/api/dog-translator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = (await response.json()) as {
        emotion?: Emotion;
        error?: string;
        isQuotaError?: boolean;
      };

      if (!response.ok) {
        // Even if there's an error, we can still play sound if API returned default emotion
        const emotion = data.emotion;
        if (
          emotion &&
          ['happy', 'sad', 'angry', 'normal'].includes(emotion) &&
          soundMap[emotion]
        ) {
          setDetectedEmotion(emotion);
          // Don't pre-select audio file, let user decide when to play

          const message =
            locale === 'ja'
              ? `「${inputText}」を犬語で表現すると...`
              : `Translating "${inputText}" into dog language...`;
          setDogResponseMessage(message);

          // If it's a quota error, show friendly message
          if (data.isQuotaError) {
            const errorMsg =
              locale === 'ja'
                ? '注意：AIが休憩中ですが、吠え声をお楽しみください！🐕'
                : 'Note: AI is taking a break, but enjoy the barking sounds! 🐕';
            setError(errorMsg);
          }
        } else {
          throw new Error(data.error || pageData.tool.error);
        }
      } else {
        const emotion = data.emotion as Emotion; // API should return format like { "emotion": "happy" }

        if (
          emotion &&
          ['happy', 'sad', 'angry', 'normal'].includes(emotion) &&
          soundMap[emotion]
        ) {
          setDetectedEmotion(emotion);
          // Don't pre-select audio file, let user decide when to play

          // Set more friendly user message based on emotion
          const friendlyMessage =
            locale === 'ja'
              ? `「${inputText}」を犬語で表現すると...`
              : `Translating "${inputText}" into dog language...`;
          setDogResponseMessage(friendlyMessage);
        } else {
          // If API returned unexpected emotion (shouldn't happen in theory, since prompt restricts it)
          console.warn(
            'Received an unexpected emotion from API:',
            data.emotion
          );
          setDetectedEmotion('normal'); // Default to normal
          // Don't pre-select audio file, let user decide when to play
          setDogResponseMessage(
            "Hmm, that's an interesting way to put it! Let's say your dog is just being a dog."
          );
        }
      }
    } catch (err: any) {
      setError(err.message || '犬語の入力を理解できませんでした。');
      setDogResponseMessage('');
      setDetectedEmotion(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clean up audio and timeout with enhanced cleanup
  const cleanupAudio = () => {
    if (audioRef.current) {
      // Remove all event listeners to prevent memory leaks
      const audio = audioRef.current;
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.oncanplaythrough = null;
      audio.onloadeddata = null;

      // Stop playback and reset
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0;
      audio.src = ''; // Clear the source to release resources
      audioRef.current = null;
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
  };

  // Function to handle sound playing - select and play audio file when user clicks
  const handlePlaySound = () => {
    if (!detectedEmotion || isPlaying || isLoadingAudio) {
      return;
    }

    // Select audio file when user clicks play (not during translation)
    if (!selectedAudioFile) {
      const soundFiles = soundMap[detectedEmotion];
      if (soundFiles && soundFiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * soundFiles.length);
        const selectedFile = getStaticPath(soundFiles[randomIndex]);
        setSelectedAudioFile(selectedFile);
        console.log(
          `Selected audio file for emotion "${detectedEmotion}":`,
          selectedFile
        );
        // Load and play this newly selected file
        loadAndPlayAudio(selectedFile);
        return;
      } else {
        // If soundFiles is invalid, use fallback audio
        const fallbackFile = getStaticPath(fallbackSounds[detectedEmotion]);
        console.warn(`soundFiles invalid, using fallback audio:`, fallbackFile);
        setSelectedAudioFile(fallbackFile);
        loadAndPlayAudio(fallbackFile);
        return;
      }
    }

    // If audio is already loaded and is the same file, play directly
    if (audioRef.current && audioRef.current.src.endsWith(selectedAudioFile)) {
      console.log('Reusing already loaded audio file:', selectedAudioFile);
      audioRef.current.currentTime = 0; // Reset to beginning
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(null);
          console.log('Reused audio playback successful:', selectedAudioFile);
        })
        .catch((playError) => {
          console.warn(
            `Reused audio playback failed: ${selectedAudioFile}`,
            playError
          );
          // If reuse fails, reload
          loadAndPlayAudio(selectedAudioFile);
        });
      return;
    }

    // Different file, need to reload
    loadAndPlayAudio(selectedAudioFile);
  };

  // Function to load and play audio with enhanced error handling
  const loadAndPlayAudio = async (audioFile?: string) => {
    const soundToPlay = audioFile || selectedAudioFile;
    if (!soundToPlay) return;

    // Clean up previous audio
    cleanupAudio();
    setIsLoadingAudio(true);
    setAudioError(null);

    console.log('Loading audio via API:', soundToPlay);

    try {
      // Pre-flight check to verify audio file exists
      const response = await fetch(soundToPlay, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Audio file not accessible: ${response.status}`);
      }

      const audio = new Audio();
      audioRef.current = audio;

      // Set audio properties for API-served files
      audio.preload = 'auto';
      audio.volume = 0.8;
      // Don't set crossOrigin for API-served files from same origin

      let hasStartedPlaying = false;
      let isLoadingTimeout = false;

      // Play start event
      audio.onplay = () => {
        hasStartedPlaying = true;
        setIsLoadingAudio(false);
        setIsPlaying(true);
        setAudioError(null);
        console.log('Audio started playing:', soundToPlay);
      };

      // Play end event
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };

      // Enhanced error handling
      audio.onerror = (e) => {
        console.error(`Audio loading failed: ${soundToPlay}`, e);
        console.error('Audio error details:', {
          error: audio.error,
          readyState: audio.readyState,
          networkState: audio.networkState,
        });

        // Try fallback audio if available
        if (
          detectedEmotion &&
          soundToPlay !== getStaticPath(fallbackSounds[detectedEmotion])
        ) {
          const fallbackFile = getStaticPath(fallbackSounds[detectedEmotion]);
          console.log(`Trying fallback audio: ${fallbackFile}`);
          setSelectedAudioFile(fallbackFile);
          setIsLoadingAudio(false);
          setIsPlaying(false);
          cleanupAudio();
          // Retry with fallback after a short delay
          setTimeout(() => loadAndPlayAudio(fallbackFile), 100);
          return;
        }

        const errorMessage =
          audio.error?.message || 'Audio loading failed, please try again';
        setAudioError(errorMessage);
        setIsLoadingAudio(false);
        setIsPlaying(false);
        cleanupAudio();
      };

      // When audio can be played
      audio.oncanplaythrough = () => {
        if (isLoadingTimeout) return; // Don't play if timeout already occurred

        console.log('Audio can be played:', soundToPlay);
        audio
          .play()
          .then(() => {
            console.log('Audio playback successful:', soundToPlay);
          })
          .catch((playError) => {
            console.warn(`Audio playback failed: ${soundToPlay}`, playError);

            // Try fallback on play error
            if (
              detectedEmotion &&
              soundToPlay !== getStaticPath(fallbackSounds[detectedEmotion])
            ) {
              const fallbackFile = getStaticPath(fallbackSounds[detectedEmotion]);
              console.log(`Play failed, trying fallback: ${fallbackFile}`);
              setSelectedAudioFile(fallbackFile);
              cleanupAudio();
              setTimeout(() => loadAndPlayAudio(fallbackFile), 100);
              return;
            }

            setIsLoadingAudio(false);
            setIsPlaying(false);
            cleanupAudio();
          });
      };

      // Set audio source and start loading
      audio.src = soundToPlay;
      audio.load();

      // Safety timeout with enhanced handling
      playTimeoutRef.current = setTimeout(() => {
        if (
          !hasStartedPlaying &&
          audioRef.current === audio &&
          !isLoadingTimeout
        ) {
          isLoadingTimeout = true;
          console.warn('Audio loading timeout, trying fallback');

          // Try fallback on timeout
          if (
            detectedEmotion &&
            soundToPlay !== getStaticPath(fallbackSounds[detectedEmotion])
          ) {
            const fallbackFile = getStaticPath(fallbackSounds[detectedEmotion]);
            setSelectedAudioFile(fallbackFile);
            cleanupAudio();
            setTimeout(() => loadAndPlayAudio(fallbackFile), 100);
            return;
          }

          setIsLoadingAudio(false);
          setIsPlaying(false);
          setAudioError('Audio loading timeout, please try again');
          cleanupAudio();
        }
      }, 8000); // Increased timeout to 8 seconds
    } catch (error) {
      console.error('Failed to load audio:', error);

      // Try fallback on fetch error
      if (detectedEmotion && soundToPlay !== getStaticPath(fallbackSounds[detectedEmotion])) {
        const fallbackFile = getStaticPath(fallbackSounds[detectedEmotion]);
        console.log(`Fetch failed, trying fallback: ${fallbackFile}`);
        setSelectedAudioFile(fallbackFile);
        setTimeout(() => loadAndPlayAudio(fallbackFile), 100);
        return;
      }

      setAudioError('Failed to load audio, please try again');
      setIsLoadingAudio(false);
      setIsPlaying(false);
      cleanupAudio();
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className="container max-w-7xl mx-auto px-4 mb-10">
      <main className="w-full bg-white shadow-xl border border-gray-100 rounded-lg p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* 左边：用户输入区域 */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              {pageData.tool.yourWords}
              <i className="text-primary-yellow fas fa-user ms-2"></i>
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={pageData.tool.inputPlaceholder}
              className="w-full h-48 md:h-64 p-3 border border-primary-light rounded-md focus:ring-2 focus:ring-primary-light focus:border-transparent resize-none text-gray-700"
              aria-label={pageData.tool.inputLabel || 'Your words to translate'}
            />
          </div>

          {/* 右边：狗狗语言结果框 */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              {pageData.tool.doggyVibe}
              <i className="text-primary-yellow fas fa-dog ms-2"></i>
            </h2>
            <div
              className="w-full h-48 md:h-64 p-3 border border-primary-light rounded-md bg-gray-50 overflow-y-auto"
              aria-live="polite"
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <p>{pageData.tool.loading}</p>
                </div>
              ) : (
                <div className="flex flex-col items-start justify-start text-gray-700">
                  {error ? (
                    <p className="text-red-600">{pageData.tool.error}</p>
                  ) : dogResponseMessage ? (
                    <>
                      <p className="text-lg">{dogResponseMessage}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">{pageData.tool.noInput}</p>
                  )}

                  {detectedEmotion && !error && (
                    <div className="mt-6 text-left">
                      <button
                        onClick={handlePlaySound}
                        disabled={isPlaying || isLoadingAudio}
                        className="px-6 py-2 bg-gray-800 hover:bg-primary-light text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
                        aria-label={
                          pageData.tool.playSoundTooltip || 'Play sound'
                        }
                      >
                        {isLoadingAudio
                          ? locale === 'ja'
                            ? '読み込み中... 🎵'
                            : 'Loading... 🎵'
                          : isPlaying
                            ? locale === 'ja'
                              ? '再生中... 🔊'
                              : 'Playing... 🔊'
                            : `${pageData.tool.playButton} 🔊`}

                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </button>
                      {(isLoadingAudio || audioError) && (
                        <div className="mt-2 text-sm text-gray-600">
                          {isLoadingAudio ? (
                            locale === 'ja' ? (
                              '犬の音声を準備中...'
                            ) : (
                              'Preparing dog sounds...'
                            )
                          ) : audioError ? (
                            <span className="text-orange-600">
                              {audioError}
                            </span>
                          ) : (
                            ''
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
            <i
              className={`${isLoading ? 'fas fa-spinner animate-spin' : 'fas fa-paw'} ms-2`}
            ></i>
          </button>
        </div>

        <ToolInfoSections
          highlights={pageData.highlights}
          funFacts={pageData.funFacts}
        />
      </main>
    </div>
  );
}
