import { BaseTranslator } from '../base-translator';
import type { TranslatorConfig } from '../types';
import type { DetectionResult } from '../base-translator';

export class AlbanianEnglishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'albanian-english',
        name: 'Albanian-English Translator',
        type: 'language',
        supportedDirections: ['albanian-to-en', 'en-to-albanian'],
        supportedModes: ['general', 'formal', 'casual', 'literary'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional translator between Albanian and English. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are a certified translator specializing in formal Albanian-English translations.

Focus on:
- Proper Albanian grammar and syntax
- Formal vocabulary and expressions
- Business and official terminology
- Cultural context in formal settings
- Maintaining professional tone in both languages

Translate with formal precision:`,
          description: 'Formal translation for business and official documents',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are an Albanian-English translator specializing in casual, everyday conversations.

Focus on:
- Natural, conversational expressions
- Common idioms and colloquialisms
- Cultural references in daily life
- Modern Albanian slang and expressions
- Friendly, approachable tone

Translate casually:`,
          description: 'Casual translation for everyday conversation',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are a literary translator specializing in Albanian-English literary works.

Focus on:
- Preserving literary style and artistic expression
- Albanian cultural nuances and traditions
- Folk elements and traditional storytelling
- Poetic devices and metaphors
- Maintaining emotional and cultural impact

Translate with literary care:`,
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

    if (direction === 'albanian-to-en') {
      return `${modeConfig.prompt}

TASK: Translate Albanian to English
- Capture Albanian cultural nuances
- Handle unique Albanian grammatical structures
- Preserve idiomatic expressions
- Return ONLY the English translation`;
    } else {
      return `${modeConfig.prompt}

TASK: Translate English to Albanian
- Use proper Albanian grammar and syntax
- Handle Albanian case system and verb conjugations
- Use appropriate Albanian vocabulary
- Return ONLY the Albanian translation`;
    }
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'albanian';
  }

  protected suggestDirection(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection;
    }

    switch (detectedLanguage) {
      case 'albanian':
        return 'albanian-to-en';
      case 'english':
        return 'en-to-albanian';
      default:
        return 'albanian-to-en'; // 默认方向
    }
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'albanian':
        return 'Albanian';
      case 'english':
        return 'English';
      default:
        return 'Unknown';
    }
  }

  protected getDirectionDescription(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection === 'albanian-to-en' ? 'Albanian → English' : 'English → Albanian';
    }

    switch (detectedLanguage) {
      case 'albanian':
        return 'Albanian → English';
      case 'english':
        return 'English → Albanian';
      default:
        return 'Unknown';
    }
  }

  protected getDetectionExplanation(detectionResult: DetectionResult | null): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'albanian':
        return `Detected Albanian input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Albanian`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input Albanian or English`;
    }
  }

  protected getTranslationExplanation(detectionResult: DetectionResult | null, direction?: string): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc = direction === 'albanian-to-en' ? 'Albanian → English' : 'English → Albanian';
      return `Manual translation: ${directionDesc}`;
    }

    switch (detectedLanguage) {
      case 'albanian':
        return 'Auto-detected Albanian input, translated to English';
      case 'english':
        return 'Auto-detected English input, translated to Albanian';
      default:
        return 'Translation completed';
    }
  }
}