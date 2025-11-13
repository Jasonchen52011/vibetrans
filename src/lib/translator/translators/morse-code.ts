import { BaseTranslator } from '../base-translator';
import type { DetectionResult } from '../base-translator';
import type { TranslatorConfig } from '../types';

// Morse code mapping
const MORSE_CODE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
  ' ': '/',
};

// Reverse mapping for decoding
const MORSE_TO_TEXT_MAP: Record<string, string> = Object.entries(
  MORSE_CODE_MAP
).reduce(
  (acc, [char, code]) => {
    acc[code] = char;
    return acc;
  },
  {} as Record<string, string>
);

export class MorseCodeTranslator extends BaseTranslator {
  constructor() {
    const config: TranslatorConfig = {
      tool: {
        id: 'morse-code',
        name: 'Morse Code Translator',
        type: 'language',
        supportedDirections: ['toMorse', 'toText'],
        supportedModes: ['standard', 'sound', 'visual'],
        supportedInputTypes: ['text'],
        requiresAI: false,
        maxLength: 10000,
      },
      modes: {
        standard: {
          name: 'Standard Morse',
          prompt: 'Standard International Morse Code translation',
          description:
            'Standard Morse Code using dots (.) and dashes (-), with spaces between letters and / for word separation',
        },
        sound: {
          name: 'Sound Representation',
          prompt: 'Morse Code with sound mnemonics',
          description:
            'Morse Code with "dit" for dots and "dah" for dashes, representing the actual sound',
        },
        visual: {
          name: 'Visual Representation',
          prompt: 'Morse Code with visual symbols',
          description:
            'Morse Code using bullet points (•) and dashes (▬) for better visual distinction',
        },
      },
      aiProvider: 'google',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.3,
    };

    super(config);
  }

  // Override performTranslation to use rule-based translation instead of AI
  protected async performTranslation(
    text: string,
    direction: string,
    mode: string,
    inputType: string
  ): Promise<string> {
    if (direction === 'toMorse') {
      return this.textToMorse(text, mode);
    }
    return this.morseToText(text, mode);
  }

  private textToMorse(text: string, mode: string): string {
    const upperText = text.toUpperCase();
    const morseArray: string[] = [];

    for (const char of upperText) {
      const morseChar = MORSE_CODE_MAP[char];
      if (morseChar) {
        morseArray.push(morseChar);
      } else if (char === ' ') {
        // Space between words - represented by /
        morseArray.push('/');
      }
      // Ignore unsupported characters
    }

    let result = morseArray.join(' ');

    // Apply mode-specific formatting
    if (mode === 'sound') {
      result = result
        .replace(/\./g, 'dit')
        .replace(/-/g, 'dah')
        .replace(/\//g, ' / ');
    } else if (mode === 'visual') {
      result = result.replace(/\./g, '•').replace(/-/g, '▬');
    }

    return result;
  }

  private morseToText(morse: string, mode: string): string {
    // Normalize the input based on mode
    let normalizedMorse = morse.trim();

    if (mode === 'sound') {
      normalizedMorse = normalizedMorse
        .replace(/dit/gi, '.')
        .replace(/dah/gi, '-');
    } else if (mode === 'visual') {
      normalizedMorse = normalizedMorse.replace(/•/g, '.').replace(/▬/g, '-');
    }

    // Split by word separator (/) or multiple spaces
    const words = normalizedMorse.split(/\s*\/\s*/);

    const decodedWords = words.map((word) => {
      // Split by single space to get individual characters
      const chars = word.trim().split(/\s+/);
      return chars
        .map((morseChar) => {
          const char = MORSE_TO_TEXT_MAP[morseChar];
          return char || '?'; // Use ? for unknown codes
        })
        .join('');
    });

    return decodedWords.join(' ');
  }

  getToolPrompt(direction: string, mode: string): string {
    const modeConfig = this.config.modes[mode];

    if (direction === 'toMorse') {
      return `${modeConfig.prompt}

TASK: Convert text to Morse Code
- Use International Morse Code standard
- Return ONLY the Morse Code translation`;
    }
    return `${modeConfig.prompt}

TASK: Convert Morse Code to text
- Decode International Morse Code
- Return ONLY the decoded text`;
  }

  getSupportedDirections(): string[] {
    return this.config.tool.supportedDirections;
  }

  validateDirection(direction: string): boolean {
    return this.config.tool.supportedDirections.includes(direction);
  }

  protected getSourceLanguage(): string {
    return 'morse';
  }

  protected suggestDirection(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection;
    }

    // Detect if input looks like Morse code
    const morsePattern = /^[.\-\/•▬\s]+$|^(dit|dah|\s|\/)+$/i;
    if (morsePattern.test(detectedLanguage)) {
      return 'toText';
    }

    return 'toMorse';
  }

  protected formatLanguageName(language: string): string {
    switch (language) {
      case 'morse':
        return 'Morse Code';
      case 'english':
      case 'text':
        return 'Text';
      default:
        return 'Text';
    }
  }

  protected getDirectionDescription(
    detectedLanguage: string,
    currentDirection?: string
  ): string {
    if (currentDirection) {
      return currentDirection === 'toMorse'
        ? 'Text → Morse Code'
        : 'Morse Code → Text';
    }

    const morsePattern = /^[.\-\/•▬\s]+$|^(dit|dah|\s|\/)+$/i;
    if (morsePattern.test(detectedLanguage)) {
      return 'Morse Code → Text';
    }

    return 'Text → Morse Code';
  }

  protected getDetectionExplanation(
    detectionResult: DetectionResult | null
  ): string {
    if (!detectionResult) return 'Language detection failed';

    const { detectedLanguage, confidence } = detectionResult;

    const morsePattern = /^[.\-\/•▬\s]+$|^(dit|dah|\s|\/)+$/i;
    if (morsePattern.test(detectedLanguage)) {
      return `Detected Morse Code input with ${Math.round(confidence * 100)}% confidence, will decode to text`;
    }

    return `Detected text input with ${Math.round(confidence * 100)}% confidence, will encode to Morse Code`;
  }

  protected getTranslationExplanation(
    detectionResult: DetectionResult | null,
    direction?: string
  ): string {
    if (!detectionResult) return 'Translation completed';

    const { detectedLanguage } = detectionResult;

    if (direction) {
      const directionDesc =
        direction === 'toMorse' ? 'Text → Morse Code' : 'Morse Code → Text';
      return `Manual translation: ${directionDesc}`;
    }

    const morsePattern = /^[.\-\/•▬\s]+$|^(dit|dah|\s|\/)+$/i;
    if (morsePattern.test(detectedLanguage)) {
      return 'Auto-detected Morse Code input, decoded to text';
    }

    return 'Auto-detected text input, encoded to Morse Code';
  }
}
