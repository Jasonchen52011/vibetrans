import { BaseTranslator } from '../base-translator';
import type { DetectionResult } from '../base-translator';
import type { TranslatorConfig } from '../types';

export class SwahiliEnglishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'swahili-english',
        name: 'Swahili-English Translator',
        type: 'language',
        supportedDirections: ['swahili-to-en'],
        supportedModes: ['general', 'formal', 'casual', 'literary'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional Swahili to English translator. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are a professional Swahili to English translator specializing in formal documents.

Focus on:
- Accurate translation of formal Swahili
- Proper English grammar and syntax
- Maintaining formal tone and register
- Technical and business terminology
- Cultural nuances in formal contexts

Translate the following Swahili text to formal English:`,
          description: 'Formal translation for business and official documents',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are a Swahili to English translator specializing in everyday conversation and casual language.

Focus on:
- Natural, conversational English
- Common expressions and slang equivalents
- Cultural context in daily life
- Modern usage and colloquialisms
- Maintaining friendly, approachable tone

Translate the following Swahili text to casual English:`,
          description: 'Casual translation for everyday conversation',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are a literary translator specializing in Swahili to English literary works.

Focus on:
- Preserving literary style and artistic expression
- Cultural nuances and literary devices
- Poetic elements and narrative flow
- Traditional storytelling elements
- Maintaining emotional and aesthetic impact

Translate the following Swahili literary text to English while preserving its artistic essence:`,
          description: 'Literary translation for stories and creative content',
        },
      },
      aiProvider: 'google',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.3,
    };

    super(config);
  }

  getToolPrompt(direction: string, mode: string): string {
    const modeConfig = this.config.modes[mode];
    return modeConfig.prompt;
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'swahili';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection;
    }

    // 斯瓦希里语翻译器主要是单向翻译到英语
    return 'swahili-to-en';
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'swahili':
        return 'Swahili';
      case 'english':
        return 'English';
      default:
        return 'Unknown';
    }
  }

  protected getDirectionDescription(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    return 'Swahili → English';
  }

  protected getDetectionExplanation(
    detectionResult: DetectionResult | null
  ): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'swahili':
        return `Detected Swahili input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input Swahili text`;
    }
  }

  protected getTranslationExplanation(
    detectionResult: DetectionResult | null,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    switch (detectedLanguage) {
      case 'swahili':
        return 'Auto-detected Swahili input, translated to English';
      case 'english':
        return 'Detected English input';
      default:
        return 'Translation completed';
    }
  }
}
