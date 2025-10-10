/**
 * Cuneiform Translator Library
 *
 * This library provides basic cuneiform text handling utilities.
 * For actual translation, we use Gemini API as cuneiform requires
 * advanced AI understanding of ancient scripts.
 */

export type CuneiformScript = 'sumerian' | 'akkadian' | 'babylonian';

export interface CuneiformTranslationOptions {
  script: CuneiformScript;
  direction: 'toCuneiform' | 'toEnglish';
}

/**
 * Get script description for API context
 */
export function getScriptDescription(script: CuneiformScript): string {
  const descriptions: Record<CuneiformScript, string> = {
    sumerian:
      'Sumerian - the earliest known written language, used in ancient Mesopotamia (circa 3500-2000 BCE)',
    akkadian:
      'Akkadian - Semitic language written in cuneiform, used in ancient Mesopotamia (circa 2500-100 BCE)',
    babylonian:
      'Babylonian - a dialect of Akkadian used in ancient Babylon (circa 1900-100 BCE)',
  };

  return descriptions[script];
}

/**
 * Validate cuneiform text input
 */
export function validateCuneiformInput(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }

  if (text.length > 5000) {
    return {
      valid: false,
      error: 'Text is too long. Maximum 5000 characters allowed.',
    };
  }

  return { valid: true };
}

/**
 * Clean cuneiform text before translation
 */
export function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
