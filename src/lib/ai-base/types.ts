/**
 * 翻译器基座类型定义
 */

export interface TranslationMode {
  prompt: string;
  zhToEnPrompt?: string;
  enToZhPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface TranslationResult {
  success: boolean;
  translated?: string;
  original: string;
  error?: string;
  mode: string;
  translator: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    processingTime?: number;
    direction?: string;
    detectedLanguage?: string;
    confidence?: number;
    autoDetected?: boolean;
    extractedText?: string;
    transcription?: string;
    inputType?: 'text' | 'image' | 'audio';
  };
}

export interface TranslatorConfig {
  id: string;
  name: string;
  type: 'ai' | 'symbolic' | 'api';
  bidirectional: boolean;
  supportedDirections?: string[]; // 支持 'ja-to-en', 'en-to-ja' 等
  defaultDirection?: string;
  supportedModes: Record<string, TranslationMode>;
  defaultMode: string;
  customProcessing?: {
    preProcess?: (text: string) => string;
    postProcess?: (text: string) => string;
  };
  rateLimit?: {
    requests: number;
    window: number;
  };
  creditCost: number;
  languageDetection?: boolean;
  multimodal?: {
    supportsImage?: boolean;
    supportsAudio?: boolean;
    imageProcessingPrompt?: string;
    audioProcessingPrompt?: string;
    responseFormat?: string;
  };
}

export interface ModelPlatform {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Record<string, any>;
}

export interface TranslationRequest {
  text?: string;
  imageData?: string;
  imageMimeType?: string;
  audioData?: string;
  audioMimeType?: string;
  translator: string;
  mode?: string;
  direction?: string;
  detectOnly?: boolean;
  inputType?: 'text' | 'image' | 'audio';
}
