import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type Direction = 'english-to-minion' | 'minion-to-english';

const ENGLISH_TO_MINION: Record<string, string> = {
  // 基础问候
  hello: 'bello',
  hi: 'bello',
  hey: 'heyooo',
  goodbye: 'poopaye',
  bye: 'poopaye',
  farewell: 'poopaye',
  welcome: 'bello welcome',

  // 常用词汇
  friend: 'poopaye buddy',
  friends: 'buddies',
  banana: 'bananaaa',
  bananas: 'bananaaas',
  apple: 'papple',
  potato: 'potatAAAA',
  ice: 'gelato',
  cream: 'gelato',
  love: 'tulaliloo',
  hate: 'no no',
  please: 'pwease',
  sorry: 'bi do',
  thanks: 'tank yu',
  'thank you': 'tank yu',
  yes: 'si si',
  no: 'nope nope',
  what: 'po ka',
  why: 'tulaliloo why',
  because: 'papoi',
  awesome: 'bee doo',
  cute: 'cutee',
  funny: 'hahaha',
  happy: 'gelato happy',
  sad: 'boo hoo',

  // 复合短语
  'i love you': 'tulaliloo ti amo',
  'see you later': 'poopaye later',
  'good morning': 'bello morning',
  'good night': 'nighty night',
  'best friend': 'buddy numero uno',
  'my friend': 'mi buddy',
  'let go': 'bee doo',
  'let us go': 'bee doo bee doo',
  'thank you very much': 'tank yu tank yu',

  // 感叹
  wow: 'wowee',
  amazing: 'banana wow',
  great: 'super banana',
  awesome: 'bee doo',
};

const ENGLISH_PHRASE_ENTRIES = Object.entries(ENGLISH_TO_MINION)
  .filter(([key]) => key.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

const MINION_TO_ENGLISH: Record<string, string> = {};
Object.entries(ENGLISH_TO_MINION).forEach(([english, minion]) => {
  const existing = MINION_TO_ENGLISH[minion.toLowerCase()];
  if (!existing || existing.length > english.length) {
    MINION_TO_ENGLISH[minion.toLowerCase()] = english;
  }
});

const MINION_PHRASE_ENTRIES = Object.entries(MINION_TO_ENGLISH)
  .filter(([key]) => key.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyCase(source: string, translated: string): string {
  if (!translated) return translated;
  if (source.toUpperCase() === source) {
    return translated.toUpperCase();
  }
  if (/^[A-Z][a-z']*$/.test(source)) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  return translated;
}

const MINION_SUFFIXES = ['ba', 'na', 'la', 'po', 'tu'];

function stylizeToMinion(word: string): string {
  if (!/[a-z]/i.test(word)) {
    return word;
  }

  const lower = word.toLowerCase();
  if (lower.length <= 2) {
    return `${lower} ${lower}`.trim();
  }

  const suffix = MINION_SUFFIXES[lower.length % MINION_SUFFIXES.length];
  return `${lower}${suffix}`;
}

function replacePhrases(
  text: string,
  entries: Array<[string, string]>,
  preserveCase = false
): string {
  let result = text;
  entries.forEach(([source, target]) => {
    const regex = new RegExp(`\\b${escapeRegExp(source)}\\b`, 'gi');
    result = result.replace(regex, (match) =>
      preserveCase ? applyCase(match, target) : target
    );
  });
  return result;
}

function translateEnglishToMinion(text: string): string {
  let result = replacePhrases(text, ENGLISH_PHRASE_ENTRIES, true);

  result = result.replace(/\b[\w']+\b/gu, (word) => {
    const lower = word.toLowerCase();
    const mapped = ENGLISH_TO_MINION[lower];
    if (mapped) {
      return applyCase(word, mapped);
    }

    const stylized = stylizeToMinion(lower);
    if (stylized !== lower) {
      return applyCase(word, stylized);
    }

    return word;
  });

  return result.replace(/\s+/g, ' ').trim();
}

function translateMinionToEnglish(text: string): string {
  let result = replacePhrases(text, MINION_PHRASE_ENTRIES);

  result = result.replace(/\b[\w']+\b/gu, (word) => {
    const lower = word.toLowerCase();
    const mapped = MINION_TO_ENGLISH[lower];
    if (mapped) {
      return applyCase(word, mapped);
    }

    return word;
  });

  return result.replace(/\s+/g, ' ').trim();
}

function detectDirection(text: string, direction?: string): Direction {
  if (direction === 'toMinion' || direction === 'english-to-minion') {
    return 'english-to-minion';
  }

  if (direction === 'toEnglish' || direction === 'minion-to-english') {
    return 'minion-to-english';
  }

  const words = text.match(/\b[\w']+\b/gu) ?? [];

  let englishScore = 0;
  let minionScore = 0;

  words.forEach((word) => {
    const lower = word.toLowerCase();
    if (ENGLISH_TO_MINION[lower]) {
      englishScore += 1;
    }
    if (MINION_TO_ENGLISH[lower]) {
      minionScore += 1.5;
    }
    if (/(banana|bello|poopaye|papoi|bee|doo)/.test(lower)) {
      minionScore += 1;
    }
  });

  return minionScore > englishScore
    ? 'minion-to-english'
    : 'english-to-minion';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, direction, tone, inputType = 'text' } = body ?? {};

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid text is required',
          suggestion: 'Please provide text to translate'
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text too long',
          suggestion: 'Please keep text under 5000 characters',
          limit: 5000,
          provided: text.length
        },
        { status: 400 }
      );
    }

    const resolvedDirection = detectDirection(text, direction);
    const startedAt = Date.now();

    let translated =
      resolvedDirection === 'english-to-minion'
        ? translateEnglishToMinion(text)
        : translateMinionToEnglish(text);

    if (tone && resolvedDirection === 'english-to-minion') {
      translated = applyMinionTone(translated, tone);
    }

    const elapsedMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      inputType,
      direction: resolvedDirection,
      detectedInputLanguage:
        resolvedDirection === 'english-to-minion' ? 'english' : 'minion',
      translationMethod: 'dictionary',
      tone: tone ?? 'normal',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: `${elapsedMs}ms`,
        textLength: text.length,
        translatedLength: translated.length
      },
      originalLength: text.length,
      translatedLength: translated.length
    });
  } catch (error) {
    console.error('Minion translator error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Translation failed',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Internal server error',
        suggestion: 'Please try again in a few moments',
        retryPossible: true
      },
      { status: 500 }
    );
  }
}

const MINION_TONE_WRAPPERS = {
  cute: (text: string) => `${text}! 💛🍌`,
  evil: (text: string) => `MUAHAHA ${text.toUpperCase()}!!`,
  excited: (text: string) => `${text}!!! 🍌🍌🍌`
} as const;

type MinionTone = keyof typeof MINION_TONE_WRAPPERS;

function applyMinionTone(text: string, tone: string): string {
  if (!tone) return text;
  const wrapper = MINION_TONE_WRAPPERS[tone.toLowerCase() as MinionTone];
  return wrapper ? wrapper(text) : text;
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Minion Translator API',
    description:
      'Offline Minionese translator with dictionary-based conversions and tone presets',
    features: [
      'Bidirectional English ↔ Minion translation',
      'Automatic language detection',
      'Phrase-aware replacements',
      'Heuristic stylization for unknown words',
      'Tone presets: cute, evil, excited'
    ],
    usage: {
      endpoint: '/api/minion-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        direction:
          'toMinion | english-to-minion | toEnglish | minion-to-english | auto',
        tone: 'cute | evil | excited | normal (optional, only for Minion output)'
      }
    },
    responseShape: {
      success: 'boolean',
      translated: 'string',
      original: 'string',
      direction: 'english-to-minion | minion-to-english',
      detectedInputLanguage: 'english | minion',
      translationMethod: 'dictionary',
      tone: 'string',
      metadata: {
        timestamp: 'ISO string',
        processingTime: 'string',
        textLength: 'number',
        translatedLength: 'number'
      }
    },
    examples: [
      {
        description: 'English to Minion',
        request: {
          text: 'Hello friend, bananas for everyone!',
          direction: 'auto',
          tone: 'excited'
        },
        sampleResponse: {
          translated: 'Bello buddy numero uno, bananaaa for everyone!!! 🍌🍌🍌',
          direction: 'english-to-minion'
        }
      },
      {
        description: 'Minion to English',
        request: {
          text: 'Bello! Tulaliloo ti amo!',
          direction: 'auto'
        },
        sampleResponse: {
          translated: 'Hello! I love you!',
          direction: 'minion-to-english'
        }
      }
    ],
    timestamp: new Date().toISOString()
  });
}
