import { detectLanguage } from '@/lib/language-detection';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type {
  TranslationRequest,
  TranslationResult,
  TranslatorConfig,
  TranslationMode,
  LanguageDirection,
} from './types';

interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  suggestedDirection?: string;
}

export abstract class BaseTranslator {
  protected config: TranslatorConfig;
  protected genAI: GoogleGenerativeAI;

  constructor(config: TranslatorConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
    );
  }

  // 抽象方法，子类必须实现
  abstract getToolPrompt(direction: string, mode: string): string;
  abstract getSupportedDirections(): string[];
  abstract validateDirection(direction: string): boolean;

  // 通用翻译方法
  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const {
      text,
      tool,
      mode = 'general',
      direction,
      autoDetect = true,
      detectOnly = false,
      inputType = 'text',
    } = request;

    // 验证输入
    this.validateInput(text);

    // 验证工具配置
    this.validateTool(tool, mode, direction);

    // 语言检测
    let detectionResult = null;
    let finalDirection = direction;
    let actuallyAutoDetected = false;

    if (autoDetect && !detectOnly) {
      detectionResult = await this.detectLanguageDirection(text, direction);
      const suggestedDirection = detectionResult?.suggestedDirection;

      if (suggestedDirection) {
        finalDirection = suggestedDirection;
        actuallyAutoDetected = true;
      } else {
        finalDirection = direction;
      }
    }

    // 仅检测语言模式
    if (detectOnly) {
      return this.createDetectionResult(text, tool, mode, detectionResult, true);
    }

    // 执行翻译
    const translatedText = await this.performTranslation(
      text,
      finalDirection,
      mode,
      inputType
    );

    return this.createTranslationResult(
      text,
      translatedText,
      tool,
      mode,
      finalDirection,
      detectionResult,
      inputType,
      actuallyAutoDetected
    );
  }

  // 验证输入文本
  protected validateInput(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required for translation');
    }

    if (text.trim().length === 0) {
      throw new Error('Please enter some text');
    }

    if (text.length > this.config.tool.maxLength) {
      throw new Error(
        `Text is too long. Maximum ${this.config.tool.maxLength} characters allowed.`
      );
    }
  }

  // 验证工具配置
  protected validateTool(tool: string, mode: string, direction?: string): void {
    if (this.config.tool.id !== tool) {
      throw new Error(`Tool mismatch. Expected: ${this.config.tool.id}`);
    }

    if (!this.config.modes[mode]) {
      throw new Error(
        `Invalid mode. Available modes: ${Object.keys(this.config.modes).join(', ')}`
      );
    }

    if (direction && !this.validateDirection(direction)) {
      throw new Error(
        `Invalid direction. Available directions: ${this.getSupportedDirections().join(', ')}`
      );
    }
  }

  // 语言检测
  protected async detectLanguageDirection(
    text: string,
    direction?: string
  ): Promise<DetectionResult | null> {
    try {
      const sourceLanguage = this.getSourceLanguage();
      const detection = detectLanguage(text, sourceLanguage);
      return {
        detectedLanguage: detection.detectedLanguage,
        confidence: detection.confidence,
        suggestedDirection: this.suggestDirection(detection.detectedLanguage, direction),
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      return null;
    }
  }

  // 执行翻译（使用 Google AI SDK）
  protected async performTranslation(
    text: string,
    direction: string,
    mode: string,
    inputType: string
  ): Promise<string> {
    const modeConfig = this.config.modes[mode];
    const systemPrompt = this.getToolPrompt(direction, mode);
    const fullPrompt = `${systemPrompt}\n\n"${text}"`;

    try {
      const { text: translatedText } = await generateText({
        model: google(this.config.model),
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: this.config.temperature,
      });

      return translatedText.trim();
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error('Failed to translate text');
    }
  }

  // 创建检测结果
  protected createDetectionResult(
    text: string,
    tool: string,
    mode: string,
    detectionResult: DetectionResult | null,
    autoDetected: boolean = true
  ): TranslationResult {
    return {
      translated: '',
      original: text,
      tool,
      mode,
      detectedInputLanguage: detectionResult?.detectedLanguage || 'unknown',
      confidence: detectionResult?.confidence || 0,
      autoDetected,
      inputType: 'text',
      message: 'Language detection completed',
      languageInfo: {
        detected: true,
        detectedLanguage: this.formatLanguageName(detectionResult?.detectedLanguage),
        direction: this.getDirectionDescription(detectionResult?.detectedLanguage),
        confidence: Math.round((detectionResult?.confidence || 0) * 100),
        explanation: this.getDetectionExplanation(detectionResult),
      },
    };
  }

  // 创建翻译结果
  protected createTranslationResult(
    original: string,
    translated: string,
    tool: string,
    mode: string,
    direction: string,
    detectionResult: DetectionResult | null,
    inputType: string,
    autoDetected: boolean = false
  ): TranslationResult {
    return {
      translated,
      original,
      tool,
      mode,
      detectedInputLanguage: detectionResult?.detectedLanguage,
      confidence: detectionResult?.confidence,
      autoDetected,
      inputType,
      message: 'Translation successful',
      languageInfo: {
        detected: true,
        detectedLanguage: this.formatLanguageName(detectionResult?.detectedLanguage),
        direction: this.getDirectionDescription(detectionResult?.detectedLanguage, direction),
        confidence: Math.round((detectionResult?.confidence || 0) * 100),
        explanation: this.getTranslationExplanation(detectionResult, direction),
      },
    };
  }

  // 抽象辅助方法，子类需要实现
  protected abstract getSourceLanguage(): string;
  protected abstract suggestDirection(detectedLanguage: string, currentDirection?: string): string;
  protected abstract formatLanguageName(language: string): string;
  protected abstract getDirectionDescription(detectedLanguage: string, currentDirection?: string): string;
  protected abstract getDetectionExplanation(detectionResult: DetectionResult | null): string;
  protected abstract getTranslationExplanation(detectionResult: DetectionResult | null, direction?: string): string;
}