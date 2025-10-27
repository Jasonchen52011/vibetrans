/**
 * Gemini翻译器基座实现
 */

import { type GenerativeModel, GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
import type {
  TranslationMode,
  TranslationRequest,
  TranslationResult,
  TranslatorConfig,
} from './types';

export class GeminiTranslatorBase {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(config: TranslatorConfig) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // 使用最新的稳定版本
    const modelName = 'gemini-2.0-flash';

    // 获取默认模式的配置
    const defaultModeConfig = config.supportedModes[config.defaultMode];

    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: defaultModeConfig?.temperature ?? 0.7,
        maxOutputTokens: defaultModeConfig?.maxTokens ?? 2048,
        topP: defaultModeConfig?.topP ?? 0.8,
        topK: defaultModeConfig?.topK ?? 40,
      },
    });
  }

  /**
   * 检测输入语言并确定翻译方向
   */
  private detectTranslationDirection(
    text: string,
    config: TranslatorConfig,
    userDirection?: string
  ): {
    direction: string;
    detectedLanguage: string;
    confidence: number;
    autoDetected: boolean;
  } {
    if (!config.languageDetection || !config.bidirectional) {
      return {
        direction: config.defaultDirection || 'default',
        detectedLanguage: 'unknown',
        confidence: 0,
        autoDetected: false,
      };
    }

    // 进行语言检测
    const detection = detectLanguage(text, config.id);
    const { detectedLanguage, suggestedDirection, confidence } = detection;

    // 确定最终方向
    let finalDirection = userDirection;
    let isAutoDetected = false;

    if (!finalDirection && config.supportedDirections) {
      // 根据检测结果自动选择方向
      finalDirection =
        suggestedDirection === 'to-english'
          ? config.supportedDirections.find((d) => d.includes('-to-en')) ||
            config.defaultDirection!
          : config.supportedDirections.find((d) => d.includes('en-to-')) ||
            config.defaultDirection!;
      isAutoDetected = true;
    }

    finalDirection = finalDirection || config.defaultDirection!;

    return {
      direction: finalDirection,
      detectedLanguage,
      confidence,
      autoDetected: isAutoDetected,
    };
  }

  /**
   * 构建翻译提示词
   */
  private buildPrompt(
    text: string,
    config: TranslatorConfig,
    mode: string,
    direction?: string
  ): string {
    const modeConfig = config.supportedModes[mode];
    if (!modeConfig) {
      throw new Error(`Unsupported mode: ${mode}`);
    }

    // 对于双向翻译器，使用方向特定的提示词
    if (config.bidirectional && direction) {
      if (
        direction.includes('-to-') &&
        modeConfig.zhToEnPrompt &&
        modeConfig.enToZhPrompt
      ) {
        // 使用新的双向提示词系统
        const specificPrompt =
          direction.includes('zh-to-en') ||
          direction.includes('yue-to-en') ||
          direction.includes('ja-to-en') ||
          direction.includes('sq-to-en')
            ? modeConfig.zhToEnPrompt
            : modeConfig.enToZhPrompt;

        return `${specificPrompt}\n\n"${text}"`;
      }
    }

    // 回退到通用提示词
    return `${modeConfig.prompt}\n\n"${text}"`;
  }

  /**
   * 构建多模态提示词
   */
  private buildMultimodalPrompt(
    config: TranslatorConfig,
    mode: string,
    direction?: string,
    inputType: 'image' | 'audio' = 'image'
  ): string {
    const modeConfig = config.supportedModes[mode];
    if (!modeConfig) {
      throw new Error(`Unsupported mode: ${mode}`);
    }

    const sourceLanguage = this.getSourceLanguage(direction);
    const targetLanguage = this.getTargetLanguage(direction);

    let systemPrompt = modeConfig.prompt;

    // 对于双向翻译器，使用方向特定的提示词
    if (config.bidirectional && direction) {
      if (
        direction.includes('-to-') &&
        modeConfig.zhToEnPrompt &&
        modeConfig.enToZhPrompt
      ) {
        systemPrompt =
          direction.includes('zh-to-en') ||
          direction.includes('yue-to-en') ||
          direction.includes('ja-to-en') ||
          direction.includes('sq-to-en')
            ? modeConfig.zhToEnPrompt
            : modeConfig.enToZhPrompt;
      }
    }

    const promptTemplate =
      config.multimodal?.[
        inputType === 'image'
          ? 'imageProcessingPrompt'
          : 'audioProcessingPrompt'
      ];

    if (promptTemplate) {
      return promptTemplate
        .replace('{sourceLanguage}', sourceLanguage)
        .replace('{targetLanguage}', targetLanguage)
        .replace('{systemPrompt}', systemPrompt)
        .replace('{modeName}', mode);
    }

    // 回退提示词
    if (inputType === 'image') {
      return `First, extract all ${sourceLanguage} text from this image. Then, ${systemPrompt}`;
    } else {
      return `Listen to this ${sourceLanguage} audio and: 1. Transcribe the ${sourceLanguage} speech to text 2. ${systemPrompt}`;
    }
  }

  /**
   * 获取源语言名称
   */
  private getSourceLanguage(direction?: string): string {
    const languageMap: Record<string, string> = {
      'zh-to-en': 'Chinese',
      'en-to-zh': 'English',
      'ja-to-en': 'Japanese',
      'en-to-ja': 'English',
      'yue-to-en': 'Cantonese',
      'en-to-yue': 'English',
      'sq-to-en': 'Albanian',
      'en-to-sq': 'English',
    };

    return languageMap[direction || ''] || 'Unknown';
  }

  /**
   * 获取目标语言名称
   */
  private getTargetLanguage(direction?: string): string {
    const languageMap: Record<string, string> = {
      'zh-to-en': 'English',
      'en-to-zh': 'Chinese',
      'ja-to-en': 'English',
      'en-to-ja': 'Japanese',
      'yue-to-en': 'English',
      'en-to-yue': 'Cantonese',
      'sq-to-en': 'English',
      'en-to-sq': 'Albanian',
    };

    return languageMap[direction || ''] || 'Unknown';
  }

  /**
   * Base64转换辅助函数
   */
  private base64ToBuffer(base64: string): Uint8Array {
    const base64Data = base64
      .replace(/^data:image\/\w+;base64,/, '')
      .replace(/^data:audio\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * 解析多模态响应
   */
  private parseMultimodalResponse(
    fullText: string,
    inputType: 'image' | 'audio',
    responseFormat?: string
  ): {
    extractedText?: string;
    transcription?: string;
    translation: string;
  } {
    if (responseFormat) {
      if (inputType === 'image') {
        const extractedMatch = fullText.match(
          /\[EXTRACTED TEXT\]\n([\s\S]*?)\n\[TRANSLATION\]/
        );
        const translationMatch = fullText.match(
          /\[TRANSLATION\]\n([\s\S]*?)(?:\n\[CONTEXT\]|$)/
        );

        return {
          extractedText: extractedMatch ? extractedMatch[1].trim() : '',
          translation: translationMatch ? translationMatch[1].trim() : fullText,
        };
      } else {
        const transcriptionMatch = fullText.match(
          /\[TRANSCRIPTION\]\n([\s\S]*?)\n\[TRANSLATION\]/
        );
        const translationMatch = fullText.match(/\[TRANSLATION\]\n([\s\S]*?)$/);

        return {
          transcription: transcriptionMatch ? transcriptionMatch[1].trim() : '',
          translation: translationMatch ? translationMatch[1].trim() : fullText,
        };
      }
    }

    // 简单解析（没有格式要求）
    return { translation: fullText };
  }

  /**
   * 执行翻译
   */
  async translate(
    request: TranslationRequest,
    config: TranslatorConfig
  ): Promise<TranslationResult> {
    const {
      text,
      imageData,
      imageMimeType,
      audioData,
      audioMimeType,
      mode = config.defaultMode,
      direction,
      detectOnly = false,
      inputType = 'text',
    } = request;

    try {
      // 验证配置
      if (!config.supportedModes[mode]) {
        return {
          success: false,
          error: `Unsupported mode: ${mode}`,
          original: text || '',
          mode,
          translator: config.id,
        };
      }

      // 检测语言和方向（仅对文本输入）
      let finalDirection = direction;
      let detectedLanguage = 'unknown';
      let confidence = 0;
      let autoDetected = false;

      if (inputType === 'text' && text) {
        const detection = this.detectTranslationDirection(
          text,
          config,
          direction
        );
        finalDirection = detection.direction;
        detectedLanguage = detection.detectedLanguage;
        confidence = detection.confidence;
        autoDetected = detection.autoDetected;
      } else {
        finalDirection = direction || config.defaultDirection || 'default';
      }

      // 如果只是检测语言，返回检测结果
      if (detectOnly) {
        return {
          success: true,
          translated: '',
          original: text || '',
          mode,
          translator: config.id,
          metadata: {
            direction: finalDirection,
            detectedLanguage,
            confidence,
            autoDetected,
            processingTime: Date.now(),
          },
        };
      }

      // 根据模式重新配置模型参数
      const modeConfig = config.supportedModes[mode];
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: modeConfig.temperature ?? 0.7,
          maxOutputTokens: modeConfig.maxTokens ?? 2048,
          topP: modeConfig.topP ?? 0.8,
          topK: modeConfig.topK ?? 40,
        },
      });

      let result: any;
      let translated = '';
      let extractedText: string | undefined;
      let transcription: string | undefined;

      // 根据输入类型处理
      switch (inputType) {
        case 'text':
          if (!text) {
            return {
              success: false,
              error: 'No text provided',
              original: '',
              mode,
              translator: config.id,
            };
          }

          // 预处理
          let processedText = text;
          if (config.customProcessing?.preProcess) {
            processedText = config.customProcessing.preProcess(text);
          }

          // 构建prompt
          const prompt = this.buildPrompt(
            processedText,
            config,
            mode,
            finalDirection
          );

          // 调用Gemini API
          result = await this.model.generateContent(prompt);
          translated = result.response.text().trim();
          break;

        case 'image':
          if (!imageData || !imageMimeType) {
            return {
              success: false,
              error: 'No image data provided',
              original: '',
              mode,
              translator: config.id,
            };
          }

          // 检查是否支持图片
          if (!config.multimodal?.supportsImage) {
            return {
              success: false,
              error: 'Image translation not supported',
              original: '',
              mode,
              translator: config.id,
            };
          }

          // 构建多模态prompt
          const imagePrompt = this.buildMultimodalPrompt(
            config,
            mode,
            finalDirection,
            'image'
          );

          // 准备图片数据
          const imageBuffer = this.base64ToBuffer(imageData);

          // 发送多模态请求
          result = await this.model.generateContent([
            imagePrompt,
            {
              inlineData: {
                data: Buffer.from(imageBuffer).toString('base64'),
                mimeType: imageMimeType,
              },
            },
          ]);

          const imageResponse = result.response.text();
          const parsedImageResponse = this.parseMultimodalResponse(
            imageResponse,
            'image',
            config.multimodal.responseFormat
          );

          translated = parsedImageResponse.translation;
          extractedText = parsedImageResponse.extractedText;
          break;

        case 'audio':
          if (!audioData || !audioMimeType) {
            return {
              success: false,
              error: 'No audio data provided',
              original: '',
              mode,
              translator: config.id,
            };
          }

          // 检查是否支持音频
          if (!config.multimodal?.supportsAudio) {
            return {
              success: false,
              error: 'Audio translation not supported',
              original: '',
              mode,
              translator: config.id,
            };
          }

          // 构建多模态prompt
          const audioPrompt = this.buildMultimodalPrompt(
            config,
            mode,
            finalDirection,
            'audio'
          );

          // 准备音频数据
          const audioBuffer = this.base64ToBuffer(audioData);

          // 发送多模态请求
          result = await this.model.generateContent([
            audioPrompt,
            {
              inlineData: {
                data: Buffer.from(audioBuffer).toString('base64'),
                mimeType: audioMimeType,
              },
            },
          ]);

          const audioResponse = result.response.text();
          const parsedAudioResponse = this.parseMultimodalResponse(
            audioResponse,
            'audio',
            config.multimodal.responseFormat
          );

          translated = parsedAudioResponse.translation;
          transcription = parsedAudioResponse.transcription;
          break;

        default:
          return {
            success: false,
            error: 'Invalid input type',
            original: text || '',
            mode,
            translator: config.id,
          };
      }

      // 后处理
      if (config.customProcessing?.postProcess) {
        translated = config.customProcessing.postProcess(translated);
      }

      return {
        success: true,
        translated,
        original: text || '',
        mode,
        translator: config.id,
        metadata: {
          model: 'gemini-2.0-flash',
          tokensUsed: result?.response.usageMetadata?.totalTokenCount,
          processingTime: Date.now(),
          direction: finalDirection,
          detectedLanguage,
          confidence,
          autoDetected,
          extractedText,
          transcription,
          inputType,
        },
      };
    } catch (error: any) {
      console.error(`Translation error for ${config.id}:`, error);

      return {
        success: false,
        error: error.message || 'Translation failed',
        original: text || '',
        mode,
        translator: config.id,
      };
    }
  }

  /**
   * 获取翻译器健康状态
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const testResult = await this.model.generateContent('Hello');
      return {
        status: 'healthy',
        message: 'Gemini API is accessible',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Gemini API is not accessible',
      };
    }
  }
}
