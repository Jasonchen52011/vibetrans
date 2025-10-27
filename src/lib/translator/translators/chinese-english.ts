import { BaseTranslator } from '../base-translator';
import type { TranslationMode, TranslatorConfig } from '../types';

export class ChineseEnglishTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'chinese-english',
        name: 'Chinese-English Translator',
        type: 'language',
        supportedDirections: ['zh-to-en', 'en-to-zh'],
        supportedModes: ['general', 'technical', 'legal', 'literary', 'idioms'],
        supportedInputTypes: ['text', 'image', 'audio'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `You are a professional Chinese to English translator. Translate the text directly without any explanations or instructions.`,
          description: 'General purpose translation for everyday use',
        },
        technical: {
          name: 'Technical Translation',
          prompt: `You are a professional technical translator specializing in Chinese to English translation.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Clear, precise language
- Maintaining technical context
- Software, hardware, and engineering terms
- Scientific and mathematical expressions

Translate the following Chinese text to English with technical precision:`,
          description:
            'Specialized translation for technical and scientific content',
        },
        legal: {
          name: 'Legal Translation',
          prompt: `You are a certified legal translator specializing in Chinese to English legal document translation.

Focus on:
- Legal terminology precision
- Formal legal language structure
- Contract and statute terminology
- Preserving legal meaning and intent
- Court and regulatory language
- Maintaining legal formality

Translate the following Chinese legal text to English with legal accuracy:`,
          description:
            'Professional translation for legal documents and contracts',
        },
        literary: {
          name: 'Literary Translation',
          prompt: `You are a literary translator specializing in Chinese to English literary works.

Focus on:
- Preserving cultural nuances
- Maintaining literary style and tone
- Poetic and artistic expression
- Character voice and narrative flow
- Cultural references and idioms
- Emotional and aesthetic impact

Translate the following Chinese literary text to English while preserving its artistic essence:`,
          description:
            'Artistic translation for literature and creative content',
        },
        idioms: {
          name: 'Idioms & Slang Translation',
          prompt: `You are a cultural linguistics expert specializing in Chinese idioms, slang, and colloquial expressions.

Focus on:
- Chinese idioms (成语) and their meanings
- Modern slang and internet language
- Cultural context and explanations
- Equivalent English expressions
- Regional dialects and variations
- Providing both literal and contextual translations

Translate the following Chinese text to English, explaining idioms and slang:`,
          description:
            'Translation with focus on cultural expressions and idioms',
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

    if (direction === 'zh-to-en') {
      return modeConfig.prompt;
    } else {
      // 英文到中文的提示词
      const enToZhPrompts = {
        general: `You are a professional English to Chinese translator. Translate the text directly without any explanations or instructions. Only output the Chinese translation.`,
        technical: `You are a professional technical translator specializing in English to Chinese translation.

Focus on:
- Technical terminology accuracy
- Industry-specific jargon
- Clear, precise language
- Maintaining technical context
- Software, hardware, and engineering terms
- Scientific and mathematical expressions

Translate the following English text to Chinese with technical precision:`,
        legal: `You are a certified legal translator specializing in English to Chinese legal document translation.

Focus on:
- Legal terminology precision
- Formal legal language structure
- Contract and statute terminology
- Preserving legal meaning and intent
- Court and regulatory language
- Maintaining legal formality

Translate the following English legal text to Chinese with legal accuracy:`,
        literary: `You are a literary translator specializing in English to Chinese literary works.

Focus on:
- Preserving cultural nuances
- Maintaining literary style and tone
- Poetic and artistic expression
- Character voice and narrative flow
- Cultural references and idioms
- Emotional and aesthetic impact

Translate the following English literary text to Chinese while preserving its artistic essence:`,
        idioms: `You are a cultural linguistics expert specializing in English idioms, slang, and colloquial expressions.

Focus on:
- English idioms and their meanings
- Modern slang and internet language
- Cultural context and explanations
- Equivalent Chinese expressions
- Regional dialects and variations
- Providing both literal and contextual translations

Translate the following English text to Chinese, explaining idioms and slang:`,
      };

      return (
        enToZhPrompts[mode as keyof typeof enToZhPrompts] ||
        enToZhPrompts.general
      );
    }
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'chinese';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection;
    }

    switch (detectedLanguage) {
      case 'chinese':
        return 'zh-to-en';
      case 'english':
        return 'en-to-zh';
      default:
        return 'zh-to-en'; // 默认方向
    }
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'chinese':
        return 'Chinese';
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
    if (currentDirection) {
      return currentDirection === 'zh-to-en'
        ? 'Chinese → English'
        : 'English → Chinese';
    }

    switch (detectedLanguage) {
      case 'chinese':
        return 'Chinese → English';
      case 'english':
        return 'English → Chinese';
      default:
        return 'Unknown';
    }
  }

  protected getDetectionExplanation(detectionResult: any): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'chinese':
        return `Detected Chinese input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Chinese`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input Chinese or English`;
    }
  }

  protected getTranslationExplanation(
    detectionResult: any,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc =
        direction === 'zh-to-en' ? 'Chinese → English' : 'English → Chinese';
      return `Manual translation: ${directionDesc}`;
    }

    switch (detectedLanguage) {
      case 'chinese':
        return 'Auto-detected Chinese input, translated to English';
      case 'english':
        return 'Auto-detected English input, translated to Chinese';
      default:
        return 'Translation completed';
    }
  }
}
