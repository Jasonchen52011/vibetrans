/**
 * Gibberish Translator - Native JavaScript Implementation
 * Converts text to/from gibberish using various strategies
 */

// Common gibberish syllables for insertion
const GIBBERISH_SYLLABLES = [
  'ib',
  'ob',
  'ub',
  'ag',
  'ig',
  'og',
  'ug',
  'idig',
  'odig',
  'udig',
  'ithag',
  'othag',
  'uthag',
];

// Vowels for pattern matching
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

// Letter replacements for gibberish style
const LETTER_REPLACEMENTS: Record<string, string> = {
  a: 'ah',
  e: 'eh',
  i: 'ee',
  o: 'oh',
  u: 'uh',
  A: 'Ah',
  E: 'Eh',
  I: 'Ee',
  O: 'Oh',
  U: 'Uh',
};

export type GibberishStyle = 'random' | 'syllable' | 'reverse';

/**
 * Check if a character is a vowel
 */
function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}

/**
 * Get a random gibberish syllable
 */
function getRandomSyllable(): string {
  return GIBBERISH_SYLLABLES[
    Math.floor(Math.random() * GIBBERISH_SYLLABLES.length)
  ];
}

/**
 * Strategy 1: Syllable Insertion
 * Inserts gibberish syllables after vowels or consonant clusters
 */
function syllableInsertStyle(text: string): string {
  let result = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Keep non-alphabetic characters as-is
    if (!/[a-zA-Z]/.test(char)) {
      result += char;
      i++;
      continue;
    }

    result += char;

    // Insert gibberish syllable after vowels (but not at word end)
    if (isVowel(char) && i < text.length - 1 && /[a-zA-Z]/.test(text[i + 1])) {
      result += getRandomSyllable();
    }

    i++;
  }

  return result;
}

/**
 * Strategy 2: Letter Replacement
 * Replaces vowels with extended sounds
 */
function randomStyle(text: string): string {
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Random chance to replace vowels (50%)
    if (isVowel(char) && Math.random() > 0.5) {
      result += LETTER_REPLACEMENTS[char] || char;
    } else {
      result += char;
    }

    // Random chance to insert syllable after consonants (30%)
    if (
      !isVowel(char) &&
      /[a-zA-Z]/.test(char) &&
      Math.random() > 0.7 &&
      i < text.length - 1
    ) {
      result += getRandomSyllable();
    }
  }

  return result;
}

/**
 * Strategy 3: Reverse & Shuffle
 * Reverses words and adds gibberish syllables
 */
function reverseStyle(text: string): string {
  // Split into words and process each
  return text
    .split(/\b/)
    .map((part) => {
      // Only process alphabetic words
      if (!/^[a-zA-Z]+$/.test(part)) {
        return part;
      }

      // For short words (1-3 chars), just add syllable
      if (part.length <= 3) {
        return part + getRandomSyllable();
      }

      // For longer words, reverse middle portion
      const start = part[0];
      const end = part[part.length - 1];
      const middle = part.slice(1, -1);

      // Reverse middle and add syllable
      const reversedMiddle = middle.split('').reverse().join('');
      return start + reversedMiddle + getRandomSyllable() + end;
    })
    .join('');
}

/**
 * Main function: Convert text to gibberish
 */
export function textToGibberish(
  text: string,
  style: GibberishStyle = 'syllable'
): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  switch (style) {
    case 'syllable':
      return syllableInsertStyle(text);
    case 'random':
      return randomStyle(text);
    case 'reverse':
      return reverseStyle(text);
    default:
      return syllableInsertStyle(text);
  }
}

/**
 * Attempt to decode gibberish back to original text
 * Note: This is a best-effort approach and may not be 100% accurate
 */
export function gibberishToText(gibberish: string): string {
  if (!gibberish || gibberish.trim().length === 0) {
    return '';
  }

  let result = gibberish;

  // Remove common gibberish syllables
  for (const syllable of GIBBERISH_SYLLABLES) {
    const regex = new RegExp(syllable, 'gi');
    result = result.replace(regex, '');
  }

  // Reverse extended vowel replacements
  for (const [original, replacement] of Object.entries(LETTER_REPLACEMENTS)) {
    const regex = new RegExp(replacement, 'g');
    result = result.replace(regex, original);
  }

  return result;
}

/**
 * Detect if text is likely gibberish
 */
export function detectGibberish(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  let gibberishCount = 0;

  // Check for gibberish syllables
  for (const syllable of GIBBERISH_SYLLABLES) {
    const regex = new RegExp(syllable, 'gi');
    const matches = text.match(regex);
    if (matches) {
      gibberishCount += matches.length;
    }
  }

  // Check for extended vowels
  for (const replacement of Object.values(LETTER_REPLACEMENTS)) {
    const regex = new RegExp(replacement, 'g');
    const matches = text.match(regex);
    if (matches) {
      gibberishCount += matches.length;
    }
  }

  // If more than 20% of "words" contain gibberish patterns
  const wordCount = text.split(/\s+/).length;
  return gibberishCount / wordCount > 0.2;
}

/**
 * Example translations for demonstration
 */
export const GIBBERISH_EXAMPLES = [
  {
    original: 'Hello',
    gibberish: 'Heliblo',
    style: 'syllable' as GibberishStyle,
  },
  {
    original: 'Welcome',
    gibberish: 'Welicomiber',
    style: 'syllable' as GibberishStyle,
  },
  {
    original: 'Thank you',
    gibberish: 'Thaniber youbi',
    style: 'syllable' as GibberishStyle,
  },
  {
    original: 'Goodbye',
    gibberish: 'Goodibbye',
    style: 'syllable' as GibberishStyle,
  },
  {
    original: 'Friend',
    gibberish: 'Friebiend',
    style: 'syllable' as GibberishStyle,
  },
  {
    original: 'Help me',
    gibberish: 'Helpib mebe',
    style: 'syllable' as GibberishStyle,
  },
];
