/**
 * Cuneiform Translator Library
 *
 * This library provides basic cuneiform text handling utilities.
 * For actual translation, we use Gemini API as cuneiform requires
 * advanced AI understanding of ancient scripts.
 */

export type CuneiformScript =
  | 'sumerian'
  | 'akkadian'
  | 'babylonian'
  | 'hittite'
  | 'elamite'
  | 'old-persian'
  | 'ugaritic';

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
    hittite:
      'Hittite - Indo-European language written in cuneiform, used in the Hittite Empire (circa 1600-1178 BCE)',
    elamite:
      'Elamite - language isolate written in cuneiform, used in ancient Elam (circa 2700-539 BCE)',
    'old-persian':
      'Old Persian - Indo-Iranian language written in cuneiform, used in the Achaemenid Empire (circa 600-330 BCE)',
    ugaritic:
      'Ugaritic - Northwest Semitic language written in cuneiform alphabet, used in ancient Ugarit (circa 1450-1200 BCE)',
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
