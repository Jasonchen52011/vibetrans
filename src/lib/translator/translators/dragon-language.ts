import { BaseTranslator } from '../base-translator';
import type { DetectionResult } from '../base-translator';
import type { TranslatorConfig } from '../types';

export class DragonLanguageTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'dragon-language',
        name: 'Dragon Language Translator',
        type: 'fictional',
        supportedDirections: ['toDragon', 'toEnglish'],
        supportedModes: ['general', 'formal', 'poetic', 'battle'],
        supportedInputTypes: ['text'],
        requiresAI: true,
        maxLength: 5000,
      },
      modes: {
        general: {
          name: 'General Translation',
          prompt: `Translate between English and Dragon Language (Dovahzul/Thu'um from Skyrim). Provide ONLY the translation, without any explanations, instructions, or additional text.`,
          description: 'General purpose translation for everyday dragon speech',
        },
        formal: {
          name: 'Formal Dragon Speech',
          prompt: `Translate between English and Dragon Language (Dovahzul) using formal style.

Focus on:
- Ancient and powerful dragon vocabulary
- Formal dragon greetings and titles (Dovahkiin, Dov, etc.)
- Respectful and ceremonial language
- Dragon cultural context and hierarchy
- Maintaining gravitas and weight of words

Provide ONLY the translation without explanations:`,
          description: 'Formal translation for ceremonial dragon speech',
        },
        poetic: {
          name: 'Poetic Dragon Speech',
          prompt: `Translate between English and Dragon Language (Dovahzul) using poetic style.

Focus on:
- Dragon songs and chants
- Metaphorical expressions
- Rhythmic and powerful word choices
- Ancient dragon wisdom and proverbs
- Lyrical flow and cadence

Provide ONLY the translation without explanations:`,
          description: 'Poetic translation for dragon songs and wisdom',
        },
        battle: {
          name: 'Battle Shouts (Thu\'um)',
          prompt: `Translate between English and Dragon Language for battle context.

Focus on:
- Powerful Thu'um (Dragon Shouts)
- War cries and battle commands
- Aggressive and forceful language
- Dragon combat terminology
- Short, impactful phrases of power

Provide ONLY the translation without explanations:`,
          description: 'Battle translation for Thu\'um and war cries',
        },
      },
      aiProvider: 'google',
      model: 'gemini-2.0-flash',
      temperature: 0.3,
    };

    super(config);
  }

  // Override performTranslation to use Gemini API directly
  protected async performTranslation(
    text: string,
    direction: string,
    mode: string,
    inputType: string
  ): Promise<string> {
    const systemPrompt = this.getToolPrompt(direction, mode);

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: this.config.temperature,
        },
      });

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: text },
      ]);

      return result.response.text().trim();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Dragon Language translation failed:', error);
      }
      throw new Error('Failed to translate dragon language');
    }
  }

  getToolPrompt(direction: string, mode: string): string {
    const modeConfig = this.config.modes[mode];

    if (direction === 'toDragon') {
      return `${modeConfig.prompt}

TASK: Translate English to Dragon Language (Dovahzul)
- Use authentic Dragon Language vocabulary from Skyrim lore
- Apply proper word order (often Subject-Object-Verb)
- Use dragon script transliteration if appropriate
- Reference: Common words include Fus (Force), Ro (Balance), Dah (Push), Yol (Fire), Toor (Inferno), Shul (Sun)
- Famous phrases: "Fus Ro Dah" (Force Balance Push), "Lok Vah Koor" (Sky Spring Summer)
- Return ONLY the Dragon Language translation

Dragon Language Word Structure:
- Dragons speak in powerful, concise phrases
- Each word carries deep meaning
- Compound meanings through word combinations
- Respect the Thu'um tradition

Translate the following to Dragon Language:`;
    }
    return `${modeConfig.prompt}

TASK: Translate Dragon Language (Dovahzul) to English
- Understand Dragon Language grammar and syntax
- Recognize Thu'um (Dragon Shouts) and their meanings
- Translate compound dragon words accurately
- Capture the power and meaning behind dragon speech
- Return ONLY the English translation

Common Dragon Language patterns:
- Short, powerful words
- Subject-Object-Verb structure
- Each word carries weight
- Thu'um are three-word shouts

Translate the following Dragon Language to English:`;
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'dragon';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection;
    }

    switch (detectedLanguage) {
      case 'dragon':
        return 'toEnglish';
      case 'english':
        return 'toDragon';
      default:
        return 'toDragon';
    }
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'dragon':
        return 'Dragon Language (Dovahzul)';
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
      return currentDirection === 'toDragon'
        ? 'English → Dragon Language'
        : 'Dragon Language → English';
    }

    switch (detectedLanguage) {
      case 'dragon':
        return 'Dragon Language → English';
      case 'english':
        return 'English → Dragon Language';
      default:
        return 'Unknown';
    }
  }

  protected getDetectionExplanation(
    detectionResult: DetectionResult | null
  ): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    switch (detectedLanguage) {
      case 'dragon':
        return `Detected Dragon Language input with ${Math.round(confidence * 100)}% confidence, will translate to English`;
      case 'english':
        return `Detected English input with ${Math.round(confidence * 100)}% confidence, will translate to Dragon Language`;
      default:
        return `Language detection uncertain (${Math.round(confidence * 100)}% confidence), please input English or Dragon Language`;
    }
  }

  protected getTranslationExplanation(
    detectionResult: DetectionResult | null,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc =
        direction === 'toDragon'
          ? 'English → Dragon Language'
          : 'Dragon Language → English';
      return `Manual translation: ${directionDesc}`;
    }

    switch (detectedLanguage) {
      case 'dragon':
        return 'Auto-detected Dragon Language input, translated to English';
      case 'english':
        return 'Auto-detected English input, translated to Dragon Language';
      default:
        return 'Translation completed';
    }
  }
}
