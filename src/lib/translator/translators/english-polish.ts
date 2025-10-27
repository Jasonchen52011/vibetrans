import { BaseTranslator } from '../base-translator';
import type { DetectionResult } from '../base-translator';
import type { TranslatorConfig } from '../types';

export class EnglishPolishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'english-polish',
        name: 'English-Polish Translator',
        type: 'language',
        supportedDirections: ['en-to-pl', 'pl-to-en'],
        supportedModes: ['general', 'formal', 'casual'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional translator between English and Polish. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are a certified translator specializing in formal English-Polish translations.

Focus on:
- Proper Polish grammar and cases
- Formal vocabulary and expressions
- Business and official terminology
- Cultural context in formal settings

Translate with formal precision:`,
          description: 'Formal translation for business and official use',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are an English-Polish translator specializing in casual, everyday conversations.

Focus on:
- Natural conversational expressions
- Common idioms and colloquialisms
- Cultural references in daily life
- Casual speech patterns

Translate casually:`,
          description: 'Casual translation for everyday conversation',
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
    return `${modeConfig.prompt}

TASK: Translate ${direction === 'en-to-pl' ? 'English to Polish' : 'Polish to English'}
- Handle Polish grammar and cases properly
- Preserve cultural nuances and context
- Return ONLY the translation`;
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'polish';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) return currentDirection;
    return detectedLanguage === 'polish' ? 'pl-to-en' : 'en-to-pl';
  }

  protected formatLanguageName(language: string): string {
    return language === 'polish'
      ? 'Polish'
      : language === 'english'
        ? 'English'
        : 'Unknown';
  }

  protected getDirectionDescription(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection === 'en-to-pl'
        ? 'English → Polish'
        : 'Polish → English';
    }
    return detectedLanguage === 'polish'
      ? 'Polish → English'
      : 'English → Polish';
  }

  protected getDetectionExplanation(
    detectionResult: DetectionResult | null
  ): string {
    if (!detectionResult) return 'Language detection failed';
    const { detectedLanguage, confidence } = detectionResult;
    if (detectedLanguage === 'polish') {
      return `Detected Polish input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
    } else if (detectedLanguage === 'english') {
      return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Polish`;
    }
    return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input English or Polish`;
  }

  protected getTranslationExplanation(
    detectionResult: DetectionResult | null,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';
    const { detectedLanguage } = detectionResult;
    if (direction) {
      const directionDesc =
        direction === 'en-to-pl' ? 'English → Polish' : 'Polish → English';
      return `Manual translation: ${directionDesc}`;
    }
    return detectedLanguage === 'polish'
      ? 'Auto-detected Polish input, translated to English'
      : 'Auto-detected English input, translated to Polish';
  }
}
