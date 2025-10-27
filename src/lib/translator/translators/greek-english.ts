import { BaseTranslator } from '../base-translator';
import type { DetectionResult } from '../base-translator';
import type { TranslatorConfig } from '../types';

export class GreekEnglishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'greek-english',
        name: 'Greek-English Translator',
        type: 'language',
        supportedDirections: ['greek-to-en', 'en-to-greek'],
        supportedModes: ['general', 'formal', 'casual', 'literary'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional translator between Greek and English. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are a certified translator specializing in formal Greek-English translations.

Focus on:
- Proper Greek grammar and syntax
- Formal vocabulary and expressions
- Academic and business terminology
- Cultural context in formal settings
- Maintaining professional tone in both languages

Translate with formal precision:`,
          description: 'Formal translation for academic and business use',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are a Greek-English translator specializing in casual, everyday conversations.

Focus on:
- Natural, conversational expressions
- Modern Greek slang and colloquialisms
- Cultural references in daily life
- Casual speech patterns and idioms
- Friendly, approachable tone

Translate casually:`,
          description: 'Casual translation for everyday conversation',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are a literary translator specializing in Greek-English literary works.

Focus on:
- Preserving Greek literary tradition
- Classical and modern Greek literature
- Cultural myths and historical references
- Poetic elements and metaphors
- Maintaining emotional and cultural impact

Translate with literary care:`,
          description: 'Literary translation for creative content',
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

TASK: Translate ${direction === 'greek-to-en' ? 'Greek to English' : 'English to Greek'}
- Handle Greek alphabet and diacritics properly
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
    return 'greek';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) return currentDirection;
    return detectedLanguage === 'greek' ? 'greek-to-en' : 'en-to-greek';
  }

  protected formatLanguageName(language: string): string {
    return language === 'greek'
      ? 'Greek'
      : language === 'english'
        ? 'English'
        : 'Unknown';
  }

  protected getDirectionDescription(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection === 'greek-to-en'
        ? 'Greek → English'
        : 'English → Greek';
    }
    return detectedLanguage === 'greek' ? 'Greek → English' : 'English → Greek';
  }

  protected getDetectionExplanation(
    detectionResult: DetectionResult | null
  ): string {
    if (!detectionResult) return 'Language detection failed';
    const { detectedLanguage, confidence } = detectionResult;
    if (detectedLanguage === 'greek') {
      return `Detected Greek input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
    } else if (detectedLanguage === 'english') {
      return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Greek`;
    }
    return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input Greek or English`;
  }

  protected getTranslationExplanation(
    detectionResult: DetectionResult | null,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';
    const { detectedLanguage } = detectionResult;
    if (direction) {
      const directionDesc =
        direction === 'greek-to-en' ? 'Greek → English' : 'English → Greek';
      return `Manual translation: ${directionDesc}`;
    }
    return detectedLanguage === 'greek'
      ? 'Auto-detected Greek input, translated to English'
      : 'Auto-detected English input, translated to Greek';
  }
}
