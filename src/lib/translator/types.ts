// 统一翻译API类型定义

export interface TranslationRequest {
  text: string;
  tool: string;
  mode?: string;
  direction?: string;
  autoDetect?: boolean;
  detectOnly?: boolean;
  inputType?: 'text' | 'image' | 'audio';
  imageData?: string;
  imageMimeType?: string;
  audioData?: string;
  audioMimeType?: string;
}

export interface TranslationResult {
  translated: string;
  original: string;
  tool: string;
  mode: string;
  detectedInputLanguage?: string;
  confidence?: number;
  autoDetected?: boolean;
  inputType: string;
  message: string;
  languageInfo?: {
    detected: boolean;
    detectedLanguage: string;
    direction: string;
    confidence: number;
    explanation: string;
  };
  extractedText?: string;
  transcription?: string;
}

export interface TranslationTool {
  id: string;
  name: string;
  type: 'language' | 'fictional' | 'stylistic';
  supportedDirections: string[];
  supportedModes: string[];
  supportedInputTypes: ('text' | 'image' | 'audio')[];
  requiresAI: boolean;
  maxLength: number;
}

export interface TranslationMode {
  name: string;
  prompt: string;
  description?: string;
}

export interface TranslatorConfig {
  tool: TranslationTool;
  modes: Record<string, TranslationMode>;
  aiProvider: 'google' | 'openai' | 'anthropic';
  model: string;
  temperature: number;
}

export type LanguageDirection =
  | 'zh-en'
  | 'en-zh'
  | 'swahili-en'
  | 'en-swahili'
  | 'esperanto-en'
  | 'en-esperanto'
  | 'albanian-en'
  | 'en-albanian'
  | 'japanese-en'
  | 'en-japanese'
  | 'greek-en'
  | 'en-greek'
  | 'telugu-en'
  | 'en-telugu'
  | 'cantonese-en'
  | 'en-cantonese'
  | 'creole-en'
  | 'en-creole'
  | 'samoan-en'
  | 'en-samoan'
  | 'persian-en'
  | 'en-persian'
  | 'amharic-en'
  | 'en-amharic'
  | 'polish-en'
  | 'en-polish';

export type TranslationModeType =
  | 'general'
  | 'formal'
  | 'casual'
  | 'literary'
  | 'technical'
  | 'legal'
  | 'idioms';
