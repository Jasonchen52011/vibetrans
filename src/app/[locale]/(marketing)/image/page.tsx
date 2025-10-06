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
  Image as ImageIcon,
  Loader2,
  Pause,
  Play,
  Settings,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GenerationResult {
  id: string;
  type: 'image';
  prompt: string;
  imageUrl?: string;
  resultUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  size?: string;
  isPreset?: boolean;
  sourceImageUrl?: string;
}

interface CreditsResponse {
  credits: number;
}

interface UploadResponse {
  url: string;
}

interface GenerateResponse {
  id: string;
  url: string;
  remainingCredits: number;
}

interface ErrorResponse {
  error: string;
}

// 预设图片数据
const presetImages: GenerationResult[] = [
  {
    id: 'preset-1',
    type: 'image',
    prompt:
      'A majestic lion with a flowing mane, bathed in golden sunset light',
    resultUrl:
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1024',
    status: 'completed',
    createdAt: new Date(),
    size: '2K',
    isPreset: true,
  },
  {
    id: 'preset-2',
    type: 'image',
    prompt: 'Futuristic cityscape with neon lights reflecting on wet streets',
    resultUrl:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1024',
    status: 'completed',
    createdAt: new Date(),
    size: '2K',
    isPreset: true,
  },
  {
    id: 'preset-3',
    type: 'image',
    prompt:
      'A serene Japanese garden with cherry blossoms and traditional bridge',
    resultUrl:
      'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1024',
    status: 'completed',
    createdAt: new Date(),
    size: '2K',
    isPreset: true,
  },
];

export default function ImagePage() {
  const session = useSession();
  const t = useTranslations('demo.image');

  const [imagePrompt, setImagePrompt] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const [imageSize, setImageSize] = useState<'adaptive' | '1K' | '2K' | '4K'>(
    'adaptive'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedImages, setGeneratedImages] =
    useState<GenerationResult[]>(presetImages);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 轮播相关状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageCost = 20; // 20 credits per image

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
        const data = (await response.json()) as CreditsResponse;
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
    if (isAutoPlaying && generatedImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % generatedImages.length);
      }, 5000); // 每5秒切换

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoPlaying, generatedImages.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? generatedImages.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % generatedImages.length);
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

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as ErrorResponse;
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = (await response.json()) as UploadResponse;
        setUploadedImageUrl(data.url);
        setUploadedImagePreview(data.url);

        setIsUploadingImage(false);
      } catch (error: any) {
        setError(error.message || 'Failed to upload image');
        setUploadedImagePreview(null);
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
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || !uploadedImageUrl || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setError(null);

    const loadingImage: GenerationResult = {
      id: `loading-${Date.now()}`,
      type: 'image',
      prompt: imagePrompt,
      status: 'processing',
      createdAt: new Date(),
      size: imageSize,
      isPreset: false,
      sourceImageUrl: uploadedImageUrl ?? undefined,
    };

    setGeneratedImages([loadingImage]);
    setCurrentImageIndex(0);
    setIsAutoPlaying(false);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          size: imageSize,
          imageUrl: uploadedImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = (await response.json()) as GenerateResponse;

      const newImage: GenerationResult = {
        id: data.id,
        type: 'image',
        prompt: imagePrompt,
        resultUrl: data.url,
        status: 'completed',
        createdAt: new Date(),
        size: imageSize,
        isPreset: false,
        sourceImageUrl: uploadedImageUrl ?? undefined,
      };

      setGeneratedImages([newImage]);
      setRemainingCredits(data.remainingCredits);
      setImagePrompt('');
    } catch (error: any) {
      console.error('Error generating image:', error);
      setError(error.message);
      setGeneratedImages(presetImages);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const promptSuggestions = [
    'Add golden hour lighting to the scene',
    'Transform into anime art style',
    'Add vibrant colors and details',
  ];

  const getSizeDisplay = (size: string) => {
    switch (size) {
      case 'adaptive':
        return 'Auto';
      case '1K':
        return '1024×1024';
      case '2K':
        return '2048×2048';
      case '4K':
        return '4096×4096';
      default:
        return size;
    }
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-neutral-950 pt-2 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
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
              <ImageIcon className="w-8 h-8" />
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
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
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
              {/* Reference Image Upload */}
              <div className="mb-6">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                  {t('reference.label')}
                </div>
                {!uploadedImagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      {t('reference.clickToUpload')}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t('reference.fileTypes')}
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
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={removeUploadedImage}
                      className="absolute top-2 right-2 p-1.5 bg-white hover:bg-neutral-100 text-neutral-900 rounded-full transition-colors shadow-md"
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
              </div>

              {/* Prompt Input */}
              <div className="mb-6">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                  {t('prompt.label')}
                </div>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={t('prompt.placeholder')}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
                />
                <div className="mt-3">
                  <p className="text-xs text-neutral-500 mb-2">
                    {t('prompt.quickSuggestions')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImagePrompt(suggestion)}
                        className="text-xs px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t('advanced.title')}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                </button>
                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 block">
                        {t('advanced.size')}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(['adaptive', '1K', '2K', '4K'] as const).map(
                          (size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setImageSize(size)}
                              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                                imageSize === size
                                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                                  : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
                              }`}
                            >
                              {getSizeDisplay(size)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateImage}
                disabled={
                  !imagePrompt.trim() ||
                  !uploadedImageUrl ||
                  isGeneratingImage ||
                  isUploadingImage ||
                  (remainingCredits !== null && remainingCredits < imageCost)
                }
                className="w-full h-12 text-base font-medium"
              >
                {isGeneratingImage ? (
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
                    {t('generate.button', { cost: imageCost })}
                  </>
                )}
              </Button>

              {remainingCredits !== null && remainingCredits < imageCost && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                  {t('generate.insufficientCredits', {
                    amount: imageCost - remainingCredits,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Image Display */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('gallery.title')}
                </h2>
                {generatedImages.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleAutoPlay}
                      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {isAutoPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-sm text-neutral-500">
                      {currentImageIndex + 1} / {generatedImages.length}
                    </span>
                  </div>
                )}
              </div>

              {generatedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <ImageIcon className="w-16 h-16 text-neutral-400 mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('gallery.noImages')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {generatedImages[currentImageIndex] && (
                          <div className="space-y-4">
                            {/* Image Display */}
                            <div className="relative h-[500px] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                              {generatedImages[currentImageIndex].status ===
                              'processing' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin mb-4" />
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('gallery.status.generating')}
                                  </p>
                                </div>
                              ) : generatedImages[currentImageIndex].status ===
                                  'completed' &&
                                generatedImages[currentImageIndex].resultUrl ? (
                                <Image
                                  src={
                                    generatedImages[currentImageIndex]
                                      .resultUrl!
                                  }
                                  alt={
                                    generatedImages[currentImageIndex].prompt
                                  }
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              ) : generatedImages[currentImageIndex].status ===
                                'failed' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-neutral-900">
                                  <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                                    {t('gallery.status.failed')}
                                  </p>
                                  {generatedImages[currentImageIndex].error && (
                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 text-center max-w-md">
                                      {generatedImages[currentImageIndex].error}
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            {/* Image Info */}
                            <div className="flex items-center gap-2 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                              {generatedImages[currentImageIndex].isPreset ? (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded whitespace-nowrap">
                                  {t('gallery.badges.example')}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded whitespace-nowrap">
                                  Prompt
                                </span>
                              )}
                              <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate">
                                {generatedImages[currentImageIndex].prompt}
                              </p>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      generatedImages[currentImageIndex].prompt
                                    );
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                  } catch (err) {
                                    console.error('Failed to copy:', err);
                                  }
                                }}
                                className="flex-shrink-0 p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
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
                    {generatedImages.length > 1 && (
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
