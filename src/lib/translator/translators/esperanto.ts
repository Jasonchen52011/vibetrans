import { BaseTranslator } from '../base-translator';
import type { TranslatorConfig } from '../types';
import type { DetectionResult } from '../base-translator';

export class EsperantoTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'esperanto',
        name: 'Esperanto Translator',
        type: 'language',
        supportedDirections: ['toEsperanto', 'toEnglish'],
        supportedModes: ['general', 'formal', 'casual', 'literary'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are "Esperanto Translator", a professional translation tool for translating between English and Esperanto. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are "Esperanto Translator", a professional translation tool specializing in formal translations between English and Esperanto.

Focus on:
- Proper Esperanto grammar (accusative case -n, verb tenses, etc.)
- Formal vocabulary and expressions
- Appropriate for official documents and academic contexts
- Cultural neutrality of Esperanto
- Maintaining formal tone in both languages

Translate the text with formal precision:`,
          description: 'Formal translation for official and academic use',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are "Esperanto Translator", specializing in casual, conversational translations between English and Esperanto.

Focus on:
- Natural, everyday expressions
- Common colloquialisms and slang
- Conversational tone
- Cultural references in Esperanto community
- Modern usage and internet language

Translate the text casually:`,
          description: 'Casual translation for everyday conversation',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are "Esperanto Translator", specializing in literary translations between English and Esperanto.

Focus on:
- Preserving literary style and artistic expression
- Esperanto's rich literary tradition
- Poetic elements and word formation
- Cultural nuances in Esperanto literature
- Maintaining aesthetic and emotional impact

Translate the text with literary care:`,
          description: 'Literary translation for creative writing',
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

    if (direction === 'toEsperanto') {
      return `${modeConfig.prompt}

TASK: Translate English to Esperanto
- Use proper Esperanto grammar rules
- Apply correct word endings and affixes
- Use proper Esperanto characters (ĉ, ĝ, ĥ, ĵ, ŝ, ŭ)
- Return ONLY the Esperanto translation`;
    } else {
      return `${modeConfig.prompt}

TASK: Translate Esperanto to English
- Understand Esperanto grammar (accusative case, verb tenses, etc.)
- Recognize word compounds and affixes
- Translate to natural English
- Return ONLY the English translation`;
    }
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'esperanto';
  }

  protected suggestDirection(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection;
    }

    switch (detectedLanguage) {
      case 'esperanto':
        return 'toEnglish';
      case 'english':
        return 'toEsperanto';
      default:
        return 'toEsperanto'; // 默认方向
    }
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'esperanto':
        return 'Esperanto';
      case 'english':
        return 'English';
      default:
        return 'Unknown';
    }
  }

  protected getDirectionDescription(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection === 'toEsperanto' ? 'English → Esperanto' : 'Esperanto → English';
    }

    switch (detectedLanguage) {
      case 'esperanto':
        return 'Esperanto → English';
      case 'english':
        return 'English → Esperanto';
      default:
        return 'Unknown';
    }
  }

  protected getDetectionExplanation(detectionResult: DetectionResult | null): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'esperanto':
        return `Detected Esperanto input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Esperanto`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input English or Esperanto`;
    }
  }

  protected getTranslationExplanation(detectionResult: DetectionResult | null, direction?: string): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc = direction === 'toEsperanto' ? 'English → Esperanto' : 'Esperanto → English';
      return `Manual translation: ${directionDesc}`;
    }

    switch (detectedLanguage) {
      case 'esperanto':
        return 'Auto-detected Esperanto input, translated to English';
      case 'english':
        return 'Auto-detected English input, translated to Esperanto';
      default:
        return 'Translation completed';
    }
  }
}