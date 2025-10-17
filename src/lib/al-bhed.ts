/**
 * Al Bhed Translation Utilities
 *
 * Al Bhed is a fictional language from Final Fantasy X that uses
 * a simple letter substitution cipher. Each English letter maps
 * to a specific Al Bhed letter consistently.
 *
 * Official Al Bhed Cipher:
 * A↔Y, B↔P, C↔L, D↔T, E↔A, F↔V, G↔R, H↔O, I↔E, J↔B,
 * K↔G, L↔M, M↔N, N↔H, O↔U, P↔C, Q↔D, R↔I, S↔J, T↔S,
 * U↔V, V↔K, W↔W, X↔Z, Y↔Q, Z↔X
 *
 * Numbers, spaces, and punctuation remain unchanged.
 */

// Al Bhed cipher mapping (English to Al Bhed)
const ENGLISH_TO_ALBHED: Record<string, string> = {
  a: 'y',
  b: 'p',
  c: 'l',
  d: 't',
  e: 'a',
  f: 'v',
  g: 'r',
  h: 'o',
  i: 'e',
  j: 'b',
  k: 'g',
  l: 'm',
  m: 'n',
  n: 'h',
  o: 'u',
  p: 'c',
  q: 'd',
  r: 'i',
  s: 'j',
  t: 's',
  u: 'v',
  v: 'k',
  w: 'w',
  x: 'z',
  y: 'q',
  z: 'x',
};

// Al Bhed to English (reverse mapping)
const ALBHED_TO_ENGLISH: Record<string, string> = {};
for (const [eng, alb] of Object.entries(ENGLISH_TO_ALBHED)) {
  ALBHED_TO_ENGLISH[alb] = eng;
}

/**
 * Translates English text to Al Bhed
 * @param text - English text to translate
 * @returns Al Bhed translation
 */
export function englishToAlBhed(text: string): string {
  return translateText(text, ENGLISH_TO_ALBHED);
}

/**
 * Translates Al Bhed text to English
 * @param text - Al Bhed text to translate
 * @returns English translation
 */
export function alBhedToEnglish(text: string): string {
  return translateText(text, ALBHED_TO_ENGLISH);
}

/**
 * Core translation function that applies cipher mapping
 * @param text - Text to translate
 * @param mapping - Cipher mapping dictionary
 * @returns Translated text
 */
function translateText(text: string, mapping: Record<string, string>): string {
  return text
    .split('')
    .map((char) => {
      const lowerChar = char.toLowerCase();
      const isUpperCase = char !== lowerChar;

      // If character exists in mapping, translate it
      if (lowerChar in mapping) {
        const translated = mapping[lowerChar];
        return isUpperCase ? translated.toUpperCase() : translated;
      }

      // Otherwise, keep original character (numbers, punctuation, spaces)
      return char;
    })
    .join('');
}

/**
 * Detects if text is likely English or Al Bhed based on character frequency
 * @param text - Text to analyze
 * @returns 'english' | 'albhed' | 'unknown'
 */
export function detectLanguage(text: string): 'english' | 'albhed' | 'unknown' {
  const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');

  if (cleanText.length < 3) {
    return 'unknown';
  }

  // Common English letters vs Al Bhed letters
  const commonEnglish = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h'];
  const commonAlBhed = ['a', 's', 'y', 'u', 'e', 'h', 'j', 'o'];

  let englishScore = 0;
  let albhedScore = 0;

  for (const char of cleanText) {
    if (commonEnglish.includes(char)) englishScore++;
    if (commonAlBhed.includes(char)) albhedScore++;
  }

  // If scores are similar, return unknown
  if (Math.abs(englishScore - albhedScore) < cleanText.length * 0.1) {
    return 'unknown';
  }

  return englishScore > albhedScore ? 'english' : 'albhed';
}

/**
 * Language query result interface
 */
export interface LanguageQueryResult {
  isQuery: boolean;
  explanation?: string;
  translation?: string;
}

/**
 * Detects if the input is a language query (asking about Al Bhed language itself)
 * @param text - Text to analyze
 * @returns Language query result
 */
export function detectLanguageQuery(text: string): LanguageQueryResult {
  const cleanText = text.toLowerCase().trim();

  // Language query patterns
  const queryPatterns = [
    // Direct language name mentions (improved patterns)
    /^(what is|what's|tell me about|explain|describe) (al-?bhed|albhed|al bhed)/i,
    /^(al-?bhed|albhed|al bhed) (language|translator|translation|alphabet|cipher|code)/i,
    // General queries about the language
    /^(what|how|who|when|where|why).*(al-?bhed|albhed|al bhed)/i,
    /^(al-?bhed|albhed|al bhed).*(what|how|who|when|where|why)/i,
    // Learning and understanding queries
    /^(learn|understand|know|speak|write|read).*(al-?bhed|albhed|al bhed)/i,
    /^(al-?bhed|albhed|al bhed).*(learn|understand|know|speak|write|read)/i,
    // Contains language name anywhere in the text (with better logic)
    /^(.*\s)?(al-?bhed|albhed|al bhed)(\s.*)?$/i,
    // Simple language name check
    /^(al-?bhed|albhed|al bhed)$/i,
    /^(al-?bhed|albhed|al bhed)\s*\?$/i,
    /^(what|what's) (al-?bhed|albhed|al bhed)(\s*\?)?$/i,
    // More specific patterns
    /^(.*\s)?(al-?bhed|albhed|al bhed)(\s.*\b(language|translator|alphabet|code|cipher)\b.*)?$/i,
  ];

  const isQuery = queryPatterns.some((pattern) => pattern.test(cleanText));

  if (isQuery) {
    return {
      isQuery: true,
      explanation: getAlBhedExplanation(),
    };
  }

  return {
    isQuery: false,
  };
}

/**
 * Gets Al Bhed language explanation
 * @returns Al Bhed language explanation
 */
function getAlBhedExplanation(): string {
  return `Al Bhed（アルベド语）是来自《最终幻想X》的虚构语言，使用简单的字母替换密码系统。

**主要特点：**
• 字母替换：每个英语字母对应一个特定的Al Bhed字母
• 对称映射：A↔Y, B↔P, C↔L, D↔T, E↔A, F↔V, G↔R, H↔O, I↔E
• 保持不变：数字、空格和标点符号保持原样
• 游戏背景：由Al Bhed族人使用，在斯皮拉世界广泛传播

**使用方法：**
输入英语或Al Bhed文本，系统会自动识别语言方向并进行翻译。Al Bhed语在游戏世界中用于技术交流和密码通信。`;
}

/**
 * Smart auto-translate that handles both translation and language queries
 * @param text - Text to translate or query
 * @returns Translation or query explanation
 */
export function smartAutoTranslate(text: string): {
  result: string;
  isQuery: boolean;
} {
  // First check if it's a language query
  const queryResult = detectLanguageQuery(text);
  if (queryResult.isQuery) {
    return {
      result: queryResult.explanation || '',
      isQuery: true,
    };
  }

  // If not a query, proceed with normal translation
  const language = detectLanguage(text);
  let translation: string;

  if (language === 'albhed') {
    translation = alBhedToEnglish(text);
  } else {
    translation = englishToAlBhed(text);
  }

  return {
    result: translation,
    isQuery: false,
  };
}

/**
 * Auto-translates text based on detected language
 * @param text - Text to translate
 * @returns Translated text
 */
export function autoTranslate(text: string): string {
  const language = detectLanguage(text);

  if (language === 'albhed') {
    return alBhedToEnglish(text);
  }

  // Default to English to Al Bhed translation
  return englishToAlBhed(text);
}
