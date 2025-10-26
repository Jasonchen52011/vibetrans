import { BaseTranslator } from '../base-translator';
import type { TranslatorConfig } from '../types';
import type { DetectionResult } from '../base-translator';

export class JapaneseEnglishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'japanese-english',
        name: 'Japanese-English Translator',
        type: 'language',
        supportedDirections: ['ja-to-en', 'en-to-ja'],
        supportedModes: ['general', 'formal', 'casual', 'literary', 'technical'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional translator between Japanese and English. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        formal: {
          name: 'Formal Translation',
          prompt: `You are a certified translator specializing in formal Japanese-English translations.

Focus on:
- Proper keigo (honorific language) usage
- Business Japanese formal expressions
- Academic and technical terminology
- Cultural appropriateness in formal contexts
- Maintaining proper formality levels (敬語)

Translate with formal precision:`,
          description: 'Formal translation using appropriate keigo',
        },
        casual: {
          name: 'Casual Translation',
          prompt: `You are a Japanese-English translator specializing in casual, everyday language.

Focus on:
- Natural conversational Japanese
- Common slang and colloquial expressions
- Modern Japanese youth culture references
- Casual speech patterns and contractions
- Cultural context in daily life

Translate casually:`,
          description: 'Casual translation for everyday conversation',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are a literary translator specializing in Japanese-English literary works.

Focus on:
- Preserving Japanese literary aesthetics
- Cultural nuances and traditional elements
- Poetry and haiku translation principles
- Classical Japanese literature elements
- Maintaining emotional resonance and beauty

Translate with literary care:`,
          description: 'Literary translation preserving artistic expression',
        },
        technical: {
          name: 'Technical Translation',
          prompt: `You are a technical translator specializing in Japanese-English technical content.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Scientific and engineering terms
- Proper katakana for technical terms
- Maintaining precision in technical documentation

Translate with technical accuracy:`,
          description: 'Technical translation for specialized content',
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

    if (direction === 'ja-to-en') {
      return `${modeConfig.prompt}

TASK: Translate Japanese to English
- Handle kanji, hiragana, and katakana appropriately
- Preserve cultural context and nuances
- Handle Japanese-specific expressions and onomatopoeia
- Return ONLY the English translation`;
    } else {
      return `${modeConfig.prompt}

TASK: Translate English to Japanese
- Use appropriate kanji, hiragana, and katakana
- Handle Japanese grammar and sentence structure
- Use natural Japanese expressions
- Return ONLY the Japanese translation`;
    }
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'japanese';
  }

  protected suggestDirection(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection;
    }

    switch (detectedLanguage) {
      case 'japanese':
        return 'ja-to-en';
      case 'english':
        return 'en-to-ja';
      default:
        return 'ja-to-en'; // 默认方向
    }
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'japanese':
        return 'Japanese';
      case 'english':
        return 'English';
      default:
        return 'Unknown';
    }
  }

  protected getDirectionDescription(detectedLanguage: string, currentDirection?: string): string {
    if (currentDirection) {
      return currentDirection === 'ja-to-en' ? 'Japanese → English' : 'English → Japanese';
    }

    switch (detectedLanguage) {
      case 'japanese':
        return 'Japanese → English';
      case 'english':
        return 'English → Japanese';
      default:
        return 'Unknown';
    }
  }

  protected getDetectionExplanation(detectionResult: DetectionResult | null): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'japanese':
        return `Detected Japanese input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Japanese`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input Japanese or English`;
    }
  }

  protected getTranslationExplanation(detectionResult: DetectionResult | null, direction?: string): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc = direction === 'ja-to-en' ? 'Japanese → English' : 'English → Japanese';
      return `Manual translation: ${directionDesc}`;
    }

    switch (detectedLanguage) {
      case 'japanese':
        return 'Auto-detected Japanese input, translated to English';
      case 'english':
        return 'Auto-detected English input, translated to Japanese';
      default:
        return 'Translation completed';
    }
  }
}