'use client';

import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Film,
  Loader2,
  Maximize,
  Pause,
  Play,
  Settings,
  Upload,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GenerationResult {
  id: string;
  type: 'video';
  prompt: string;
  imageUrl?: string;
  resultUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  taskId?: string;
  error?: string;
  createdAt: Date;
  duration?: number;
  resolution?: string;
  isPreset?: boolean;
}

// 预设视频数据
const presetVideos: GenerationResult[] = [
  {
    id: 'preset-1',
    type: 'video',
    prompt: 'A brown bear catching fish in a river with seagulls flying around',
    resultUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    status: 'completed',
    createdAt: new Date(),
    duration: 8,
    resolution: '720p',
    isPreset: true,
  },
  {
    id: 'preset-2',
    type: 'video',
    prompt: 'A cute rabbit hopping through a flower field in spring',
    resultUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    status: 'completed',
    createdAt: new Date(),
    duration: 8,
    resolution: '720p',
    isPreset: true,
  },
];

export default function VideoPage() {
  const router = useRouter();
  const locale = useLocale();
  const session = useSession();
  const t = useTranslations('demo.video');

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<
    string | null
  >(null);
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>(
    '720p'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedVideos, setGeneratedVideos] =
    useState<GenerationResult[]>(presetVideos);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GenerationResult | null>(
    null
  );

  // 轮播相关状态
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoCost = 600; // 600 credits for Veo 3 standard

  // Fetch user credits
  const fetchUserCredits = useCallback(async () => {
    // In development, set unlimited credits
    if (process.env.NODE_ENV === 'development') {
      setRemainingCredits(999999);
      return;
    }

    if (!session?.user) {
      setRemainingCredits(null);
      return;
    }

    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = (await response.json()) as { credits: number };
        setRemainingCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

  // 自动轮播
  useEffect(() => {
    if (isAutoPlaying && generatedVideos.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % generatedVideos.length);
      }, 10000); // 每10秒切换

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoPlaying, generatedVideos.length]);

  const goToPrevious = () => {
    setCurrentVideoIndex((prev) =>
      prev === 0 ? generatedVideos.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % generatedVideos.length);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const processImageFile = async (file: File) => {
    if (file?.type.startsWith('image/')) {
      try {
        setIsUploadingImage(true);
        setError(null);

        // Store MIME type
        setUploadedImageMimeType(file.type);

        // Convert image to base64 for both preview and API
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setUploadedImagePreview(base64String);

          // Extract base64 data without the data:image/xxx;base64, prefix
          const base64Data = base64String.split(',')[1];
          setUploadedImageUrl(base64Data);
        };
        reader.readAsDataURL(file);

        setIsUploadingImage(false);
      } catch (error: any) {
        setError(error.message || 'Failed to process image');
        setUploadedImagePreview(null);
        setUploadedImageMimeType(null);
        setIsUploadingImage(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (mode === 'image') {
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current = 0;
    setIsDragging(false);

    if (mode !== 'image') return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await processImageFile(file);
      } else {
        setError('Please drop an image file (JPG, PNG, WEBP)');
      }
    }
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl(null);
    setUploadedImagePreview(null);
    setUploadedImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateVideo = async () => {
    if ((!videoPrompt.trim() && !uploadedImageUrl) || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setError(null);

    const loadingVideo: GenerationResult = {
      id: `loading-${Date.now()}`,
      type: 'video',
      prompt: videoPrompt || 'Image to video',
      imageUrl: uploadedImageUrl ?? undefined,
      status: 'processing',
      createdAt: new Date(),
      resolution: videoResolution,
      isPreset: false,
    };

    setGeneratedVideos([loadingVideo]);
    setCurrentVideoIndex(0);
    setIsAutoPlaying(false);

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: videoPrompt.trim() || null,
          imageUrl: uploadedImageUrl,
          imageMimeType: uploadedImageMimeType,
          resolution: videoResolution,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = (await response.json()) as {
        id: string;
        taskId: string;
        status: string;
        message?: string;
        remainingCredits: number;
      };

      const newVideo: GenerationResult = {
        id: data.id,
        type: 'video',
        prompt: videoPrompt || 'Image to video',
        imageUrl: uploadedImageUrl ?? undefined,
        status: 'processing',
        taskId: data.taskId,
        createdAt: new Date(),
        resolution: videoResolution,
        isPreset: false,
      };

      setGeneratedVideos([newVideo]);
      setRemainingCredits(data.remainingCredits);
      // Keep both prompt and uploaded image for reuse

      // Start polling
      pollVideoStatus(data.id, data.taskId);
    } catch (error: any) {
      console.error('Error generating video:', error);
      setError(error.message);
      setGeneratedVideos(presetVideos);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (historyId: string, taskId: string) => {
    const maxAttempts = 120; // Increased for longer videos
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/video/status?historyId=${historyId}&taskId=${taskId}`
        );

        if (!response.ok) {
          throw new Error('Failed to check status');
        }

        const data = (await response.json()) as {
          status: 'pending' | 'processing' | 'completed' | 'failed';
          videoUrl?: string;
          error?: string;
        };

        setGeneratedVideos((prev) =>
          prev.map((video) =>
            video.id === historyId
              ? {
                  ...video,
                  status: data.status,
                  resultUrl: data.videoUrl,
                  error: data.error,
                }
              : video
          )
        );

        if (data.status === 'completed' || data.status === 'failed') {
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          // Increased polling interval to 10 seconds to reduce API calls
          setTimeout(poll, 10000);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        // Don't mark as failed on polling error, just stop polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    poll();
  };

  const promptSuggestions = [
    'A cinematic shot of a majestic lion walking',
    'Aerial view of ocean waves crashing on beach',
    'Close-up of a blooming flower in time-lapse',
  ];

  return (
    <div
      className="min-h-screen bg-white dark:bg-neutral-950 pt-2 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && mode === 'image' && (
        <div className="fixed inset-0 z-50 bg-blue-500/10 dark:bg-blue-400/10 backdrop-blur-md flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 dark:bg-neutral-900/95 rounded-xl p-8 shadow-lg border border-dashed border-blue-400/60 dark:border-blue-500/60">
            <Upload className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-3 opacity-80" />
            <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200 text-center">
              Drop image here
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-1">
              JPG, PNG, WEBP (max 10MB)
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
              <Video className="w-8 h-8" />
              {t('title' as const)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {remainingCredits !== null && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <CreditCard className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('credits')}:
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {remainingCredits}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
          >
            <span className="text-sm text-red-700 dark:text-red-300">
              {error}
            </span>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              {/* Mode Selector */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('text')}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      mode === 'text'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {t('modes.text')}
                  </button>
                  <button
                    onClick={() => setMode('image')}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      mode === 'image'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {t('modes.image')}
                  </button>
                </div>
              </div>

              {/* Text Mode Input */}
              {mode === 'text' && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                    {t('text.label')}
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder={t('text.placeholder')}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
                  />
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500 mb-2">
                      {t('text.quickSuggestions')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {promptSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setVideoPrompt(suggestion)}
                          className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Image Mode Input */}
              {mode === 'image' && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                    {t('image.label')}
                  </label>
                  {!uploadedImagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('image.clickToUpload')}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {t('image.fileTypes')}
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden">
                      <Image
                        src={uploadedImagePreview}
                        alt="Uploaded"
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={removeUploadedImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedImageUrl && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                        {t('image.motionLabel')}
                      </label>
                      <input
                        type="text"
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder={t('image.motionPlaceholder')}
                        className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Settings */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3"
                >
                  <span>{t('advanced.title')}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                </button>
                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 block">
                        {t('advanced.resolution')}
                      </label>
                      <select
                        value={videoResolution}
                        onChange={(e) =>
                          setVideoResolution(e.target.value as '720p' | '1080p')
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                      >
                        <option value="720p">
                          {t('advanced.resolutions.720p')}
                        </option>
                        <option value="1080p">
                          {t('advanced.resolutions.1080p')}
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateVideo}
                disabled={
                  (!videoPrompt.trim() && !uploadedImageUrl) ||
                  isGeneratingVideo ||
                  isUploadingImage ||
                  (remainingCredits !== null && remainingCredits < videoCost)
                }
                className="w-full h-12 text-base font-medium"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t('generate.generating')}
                  </>
                ) : isUploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t('generate.uploading')}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {t('generate.button', { cost: videoCost })}
                  </>
                )}
              </Button>

              {remainingCredits !== null && remainingCredits < videoCost && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                  {t('generate.insufficientCredits', {
                    amount: videoCost - remainingCredits,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Video Display */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  {t('gallery.title')}
                </h2>
              </div>

              {generatedVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Video className="w-16 h-16 text-neutral-400 mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('gallery.noVideos')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Video */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentVideoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {generatedVideos[currentVideoIndex] && (
                          <div className="space-y-4">
                            {/* Video Player */}
                            <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                              {generatedVideos[currentVideoIndex].status ===
                              'processing' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin mb-4" />
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('gallery.status.generating')}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {t('gallery.status.wait')}
                                  </p>
                                </div>
                              ) : generatedVideos[currentVideoIndex].status ===
                                  'completed' &&
                                generatedVideos[currentVideoIndex].resultUrl ? (
                                <video
                                  key={generatedVideos[currentVideoIndex].id}
                                  src={
                                    generatedVideos[currentVideoIndex].resultUrl
                                  }
                                  controls
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    console.error('Video error:', e);
                                    console.error(
                                      'Video URL:',
                                      generatedVideos[currentVideoIndex]
                                        .resultUrl
                                    );
                                  }}
                                  onLoadStart={() => {
                                    console.log(
                                      'Video loading:',
                                      generatedVideos[currentVideoIndex]
                                        .resultUrl
                                    );
                                  }}
                                  onCanPlay={() => {
                                    console.log('Video can play');
                                  }}
                                />
                              ) : generatedVideos[currentVideoIndex].status ===
                                'failed' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-neutral-900">
                                  <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                    {t('gallery.status.failed')}
                                  </p>
                                  {generatedVideos[currentVideoIndex].error && (
                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 text-center max-w-md leading-relaxed">
                                      {generatedVideos[currentVideoIndex].error}
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            {/* Video Info Card */}
                            <div className="flex items-center gap-2 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                              {generatedVideos[currentVideoIndex].isPreset ? (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded whitespace-nowrap">
                                  {t('gallery.badges.example')}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded whitespace-nowrap">
                                  Prompt
                                </span>
                              )}
                              <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate">
                                {generatedVideos[currentVideoIndex].prompt}
                              </p>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      generatedVideos[currentVideoIndex].prompt
                                    );
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                  } catch (err) {
                                    console.error('Failed to copy:', err);
                                  }
                                }}
                                className="flex-shrink-0 p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors relative"
                                title={isCopied ? 'Copied!' : 'Copy prompt'}
                              >
                                {isCopied ? (
                                  <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
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
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {generatedVideos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPrevious}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={goToNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
