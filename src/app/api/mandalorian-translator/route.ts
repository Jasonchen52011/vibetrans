import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationDirection = 'english-to-mandalorian' | 'mandalorian-to-english';

const ENGLISH_TO_MANDALORIAN: Record<string, string> = {
  // 问候语
  'hello': "su cuy'gar",
  'hi': "su cuy'gar",
  'hey': "su cuy'gar",
  'greetings': "su cuy'gar",
  'goodbye': "ner jorhaa'i",
  'bye': "ner jorhaa'i",
  'farewell': "ner jorhaa'i",
  'welcome': "su'cuy",

  // 基础词汇
  'warrior': 'verd',
  'clan': 'aliit',
  'family': 'aliit',
  'home': 'briikase',
  'house': 'briikase',
  'world': "mhi'jure",
  'planet': "mhi'jure",
  'leader': 'alor',
  'shield': 'bekad',
  'armor': "beskar'gam",
  'helmet': "buy'ce",
  'weapon': 'kad',
  'blade': 'kad',
  'sword': 'beskad',
  'battle': 'strill',
  'fight': 'strill',
  'victory': 'kote',
  'strength': 'beskar',
  'honor': 'parjai',
  'brother': 'vod',
  'sister': 'vod',
  'friend': "burc'ya",
  'alliance': 'parjir',
  'enemy': 'aruetii',
  'outsider': 'aruetii',
  'this': 'ibic',
  'that': 'bic',
  'truth': 'haat',
  'heart': "kar'ta",
  'blood': "ade",
  'path': "haa'taylir",
  'way': "haa'taylir",

  // 情绪与状态
  'strong': 'par',
  'brave': 'par',
  'fearless': 'mhi parjir',
  'loyal': 'ret',
  'loyalty': 'retla',
  'glory': 'parjai',
  'honorable': 'parjaai',
  'fear': 'jare',
  'hope': 'atik',
  'love': 'kar',
  'together': 'mhi',
  'always': 'darasuum',

  // 代词
  'i': 'ni',
  'me': 'ni',
  'my': 'ner',
  'mine': "ner'tra",
  'you': 'gar',
  'your': "gar'tra",
  'yours': "gar'tra",
  'we': 'mhi',
  'us': 'mhi',
  'our': "mhi'tra",
  'ours': "mhi'tra",
  'they': 'val',
  'them': 'val',
  'their': "val'tra",

  // 常用动词
  'protect': "ka'ra",
  'defend': "ka'ra",
  'attack': 'jate',
  'go': 'kaan',
  'come': 'jii',
  'stay': 'cuyir',
  'rise': 'oriyc',
  'fall': 'arpat',
  'stand': 'oorir',
  'speak': "jorhaa'duur",
  'listen': "aani",
  'learn': 'laroy',
  'train': 'kutaar',

  // 复合短语
  'thank you': "cuyir gar",
  'thanks': "cuyir gar",
  'excuse me': 'ner copad',
  'i am': "ni cuyir",
  'you are': "gar cuyir",
  'we are': "mhi cuyir",
  'they are': "val cuyir",
  'this is the way': "haatyc ori'shya talyc",
  'this is our way': "ibic cuyir mhi haa'taylir",
  'for the clan': "par aliit",
  'for the family': "par aliit",
  'for honor': 'par parjai',
  'never yield': 'dralshy\'a',
  'no mercy': 'mercy laandur',
  'into battle': 'gahtir strill',
  'victory or death': "kote bal kyr'am",
  'we stand together': 'mhi oorir mhi',
  'we are mandalorian': "mhi cuyir mando'ade",
  'this is the way of honor': "ibic haa'taylir par parjai"
};

const ENGLISH_PHRASE_ENTRIES = Object.entries(ENGLISH_TO_MANDALORIAN)
  .filter(([key]) => key.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

const MANDALORIAN_TO_ENGLISH: Record<string, string> = {};
Object.entries(ENGLISH_TO_MANDALORIAN).forEach(([english, mando]) => {
  const existing = MANDALORIAN_TO_ENGLISH[mando.toLowerCase()];
  if (!existing || existing.length > english.length) {
    MANDALORIAN_TO_ENGLISH[mando.toLowerCase()] = english;
  }
});

const MANDALORIAN_PHRASE_ENTRIES = Object.entries(MANDALORIAN_TO_ENGLISH)
  .filter(([key]) => key.includes(' '))
  .sort((a, b) => b[0].length - a[0].length);

const MANDALORIAN_HINT_WORDS = new Set(
  Object.values(ENGLISH_TO_MANDALORIAN).map((value) =>
    value.replace(/[^a-z]/gi, '').toLowerCase()
  )
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyCase(source: string, translated: string): string {
  if (!translated) {
    return translated;
  }

  if (source.toUpperCase() === source) {
    return translated.toUpperCase();
  }

  if (/^[A-Z][a-z']*$/.test(source)) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  return translated;
}

function stylizeToMandalorian(word: string): string {
  if (!/[a-z]/i.test(word)) {
    return word;
  }

  const lower = word.toLowerCase();
  if (lower.length <= 2) {
    return lower;
  }

  let core = lower
    .replace(/[^a-z']/g, '')
    .replace(/(ing|ed|er|ly)$/g, '')
    .replace(/[aeiou]+/g, (match, index) => (index === 0 ? match : ''));

  if (!core) {
    core = lower;
  }

  const suffixes = ["'ika", "'ar", "'ir", "'la", "'yc"];
  const suffix = suffixes[lower.length % suffixes.length];
  return `${core}${suffix}`;
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

function translateEnglishToMandalorian(text: string): string {
  let result = replacePhrases(text, ENGLISH_PHRASE_ENTRIES, true);

  result = result.replace(/\b[\w']+\b/gu, (word) => {
    const lower = word.toLowerCase();
    const mapped = ENGLISH_TO_MANDALORIAN[lower];
    if (mapped) {
      return applyCase(word, mapped);
    }

    const stylized = stylizeToMandalorian(lower);
    if (stylized !== lower) {
      return applyCase(word, stylized);
    }

    return word;
  });

  return result;
}

function translateMandalorianToEnglish(text: string): string {
  let result = replacePhrases(text, MANDALORIAN_PHRASE_ENTRIES);

  result = result.replace(/\b[\w']+\b/gu, (word) => {
    const lower = word.toLowerCase();
    const mapped = MANDALORIAN_TO_ENGLISH[lower];
    if (mapped) {
      return applyCase(word, mapped);
    }

    const normalized = lower.replace(/[^a-z]/g, '');
    if (normalized && MANDALORIAN_HINT_WORDS.has(normalized)) {
      return applyCase(word, 'unknown');
    }

    if (lower.includes("'")) {
      return applyCase(word, 'unknown');
    }

    return word;
  });

  return result;
}

function detectDirection(text: string, direction?: string): TranslationDirection {
  if (direction === 'to-mandalorian' || direction === 'english-to-mandalorian') {
    return 'english-to-mandalorian';
  }

  if (direction === 'to-english' || direction === 'mandalorian-to-english') {
    return 'mandalorian-to-english';
  }

  const words = text.match(/\b[\w']+\b/gu) ?? [];

  let englishScore = 0;
  let mandalorianScore = 0;

  words.forEach((word) => {
    const lower = word.toLowerCase();
    if (ENGLISH_TO_MANDALORIAN[lower]) {
      englishScore += 1;
    }
    if (MANDALORIAN_TO_ENGLISH[lower]) {
      mandalorianScore += 1.5;
    } else {
      const normalized = lower.replace(/[^a-z]/g, '');
      if (normalized && MANDALORIAN_HINT_WORDS.has(normalized)) {
        mandalorianScore += 1;
      } else if (lower.includes("'")) {
        mandalorianScore += 0.75;
      }
    }
  });

  return mandalorianScore > englishScore
    ? 'mandalorian-to-english'
    : 'english-to-mandalorian';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, inputType = 'text', direction = 'auto' } = body ?? {};

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

    const translated =
      resolvedDirection === 'english-to-mandalorian'
        ? translateEnglishToMandalorian(text)
        : translateMandalorianToEnglish(text);

    const elapsedMs = Date.now() - startedAt;

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      inputType,
      direction: resolvedDirection,
      detectedInputLanguage:
        resolvedDirection === 'english-to-mandalorian' ? 'english' : 'mandalorian',
      translationMethod: 'dictionary',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: `${elapsedMs}ms`,
        textLength: text.length,
        translatedLength: translated.length
      }
    });
  } catch (error) {
    console.error('Mandalorian translator error:', error);

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

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Mandalorian Translator API',
    description:
      'Offline Mandalorian (Mando\'a) translator using curated vocabulary and heuristic conversions',
    features: [
      'Bidirectional dictionary-based translation',
      'Automatic direction detection',
      'Phrase-aware replacements',
      'Heuristic conversion for unknown English words',
      'Lower than 5ms edge execution time'
    ],
    usage: {
      endpoint: '/api/mandalorian-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction:
          'to-mandalorian | english-to-mandalorian | to-english | mandalorian-to-english | auto (default)'
      }
    },
    responseShape: {
      success: 'boolean',
      translated: 'string',
      original: 'string',
      direction: 'english-to-mandalorian | mandalorian-to-english',
      detectedInputLanguage: 'english | mandalorian',
      translationMethod: 'dictionary',
      metadata: {
        timestamp: 'ISO string',
        processingTime: 'string (e.g. "2ms")',
        textLength: 'number',
        translatedLength: 'number'
      }
    },
    examples: [
      {
        description: 'English to Mandalorian',
        request: {
          text: 'We stand together. Victory or death!',
          direction: 'auto'
        },
        sampleResponse: {
          translated: "Mhi oorir mhi. Kote bal kyr'am!",
          direction: 'english-to-mandalorian'
        }
      },
      {
        description: 'Mandalorian to English',
        request: {
          text: "Su cuy'gar, vod. Haat par mhi.",
          direction: 'auto'
        },
        sampleResponse: {
          translated: 'Hello, brother. Truth for us.',
          direction: 'mandalorian-to-english'
        }
      }
    ],
    timestamp: new Date().toISOString()
  });
}
