import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationDirection = 'english-to-mandalorian' | 'mandalorian-to-english';

function getEnglishToMandalorianDict(): Record<string, string> {
  return {
    // 问候语
    hello: "su cuy'gar",
    hi: "su cuy'gar",
    hey: "su cuy'gar",
    greetings: "su cuy'gar",
    goodbye: "ner jorhaa'i",
    bye: "ner jorhaa'i",
    farewell: "ner jorhaa'i",
    welcome: "su'cuy",

    // 基础词汇
    warrior: 'verd',
    clan: 'aliit',
    family: 'aliit',
    home: 'briikase',
    house: 'briikase',
    world: "mhi'jure",
    planet: "mhi'jure",
    leader: 'alor',
    shield: 'bekad',
    armor: "beskar'gam",
    helmet: "buy'ce",
    weapon: 'kad',
    blade: 'kad',
    sword: 'beskad',
    battle: 'strill',
    fight: 'strill',
    victory: 'kote',
    strength: 'beskar',
    honor: 'parjai',
    brother: 'vod',
    sister: 'vod',
    friend: "burc'ya",
    alliance: 'parjir',
    enemy: 'aruetii',
    outsider: 'aruetii',
    this: 'ibic',
    that: 'bic',
    truth: 'haat',
    heart: "kar'ta",
    blood: 'ade',
    path: "haa'taylir",
    way: "haa'taylir",

    // 情绪与状态
    strong: 'par',
    brave: 'par',
    fearless: 'mhi parjir',
    loyal: 'ret',
    loyalty: 'retla',
    glory: 'parjai',
    honorable: 'parjaai',
    fear: 'jare',
    hope: 'atik',
    love: 'kar',
    together: 'mhi',
    always: 'darasuum',

    // 代词
    i: 'ni',
    me: 'ni',
    my: 'ner',
    mine: "ner'tra",
    you: 'gar',
    your: "gar'tra",
    yours: "gar'tra",
    we: 'mhi',
    us: 'mhi',
    our: "mhi'tra",
    ours: "mhi'tra",
    they: 'val',
    them: 'val',
    their: "val'tra",

    // 常用动词
    protect: "ka'ra",
    defend: "ka'ra",
    attack: 'jate',
    go: 'kaan',
    come: 'jii',
    stay: 'cuyir',
    rise: 'oriyc',
    fall: 'arpat',
    stand: 'oorir',
    speak: "jorhaa'duur",
    listen: 'aani',
    learn: 'laroy',
    train: 'kutaar',

    // 复合短语
    'thank you': 'cuyir gar',
    thanks: 'cuyir gar',
    'excuse me': 'ner copad',
    'i am': 'ni cuyir',
    'you are': 'gar cuyir',
    'we are': 'mhi cuyir',
    'they are': 'val cuyir',
    'this is the way': "haatyc ori'shya talyc",
    'this is our way': "ibic cuyir mhi haa'taylir",
    'for the clan': 'par aliit',
    'for the family': 'par aliit',
    'for honor': 'par parjai',
    'never yield': "dralshy'a",
    'no mercy': 'mercy laandur',
    'into battle': 'gahtir strill',
    'victory or death': "kote bal kyr'am",
    'we stand together': 'mhi oorir mhi',
    'we are mandalorian': "mhi cuyir mando'ade",
    'this is the way of honor': "ibic haa'taylir par parjai",
  };
}

function getMandalorianToEnglishDict(): Record<string, string> {
  const englishToMandalorian = getEnglishToMandalorianDict();
  const mandalorianToEnglish: Record<string, string> = {};

  Object.entries(englishToMandalorian).forEach(([english, mando]) => {
    const key = mando.toLowerCase();
    const existing = mandalorianToEnglish[key];

    if (!existing) {
      mandalorianToEnglish[key] = english;
      return;
    }

    if (existing.length > english.length) {
      mandalorianToEnglish[key] = english;
      return;
    }

    if (existing.length === english.length) {
      const existingIsPhrase = existing.includes(' ');
      const englishIsPhrase = english.includes(' ');

      if (existingIsPhrase && !englishIsPhrase) {
        mandalorianToEnglish[key] = english;
      }
    }
  });

  return mandalorianToEnglish;
}

function getEnglishPhraseEntries(): Array<[string, string]> {
  const englishToMandalorian = getEnglishToMandalorianDict();
  return Object.entries(englishToMandalorian)
    .filter(([key]) => key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);
}

function getMandalorianPhraseEntries(): Array<[string, string]> {
  const mandalorianToEnglish = getMandalorianToEnglishDict();
  return Object.entries(mandalorianToEnglish)
    .filter(([key]) => key.includes(' '))
    .sort((a, b) => b[0].length - a[0].length);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyCase(source: string, translated: string): string {
  if (!translated) {
    return translated;
  }

  if (source === source.toUpperCase()) {
    return translated.toUpperCase();
  }

  if (source === source.toLowerCase()) {
    return translated;
  }

  if (/^[A-Z][a-z']*$/.test(source)) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  return translated;
}

function applyPhraseCase(source: string, translated: string): string {
  if (!translated) {
    return translated;
  }

  if (source === source.toUpperCase()) {
    return translated.toUpperCase();
  }

  if (source === source.toLowerCase()) {
    return translated;
  }

  const words = source.split(/\s+/).filter(Boolean);
  const isTitleCase = words.every((word) => /^[A-Z][a-z']*$/.test(word));

  if (isTitleCase) {
    return translated
      .split(' ')
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(' ');
  }

  return translated;
}

function replacePhrases(
  text: string,
  entries: Array<[string, string]>,
  preserveCase: boolean
): string {
  let result = text;
  entries.forEach(([source, target]) => {
    const regex = new RegExp(`\\b${escapeRegExp(source)}\\b`, 'gi');
    result = result.replace(regex, (match) =>
      preserveCase ? applyPhraseCase(match, target) : target
    );
  });
  return result;
}

function translateEnglishToMandalorian(text: string): string {
  const englishPhraseEntries = getEnglishPhraseEntries();
  const englishToMandalorian = getEnglishToMandalorianDict();

  const withPhrases = replacePhrases(text, englishPhraseEntries, true);

  return withPhrases.replace(/\b[\w']+\b/gu, (word) => {
    const translated = englishToMandalorian[word.toLowerCase()];
    return translated ? applyCase(word, translated) : word;
  });
}

function translateMandalorianToEnglish(text: string): string {
  const mandalorianPhraseEntries = getMandalorianPhraseEntries();
  const mandalorianToEnglish = getMandalorianToEnglishDict();

  const withPhrases = replacePhrases(text, mandalorianPhraseEntries, true);

  return withPhrases.replace(/\b[\w']+\b/gu, (word) => {
    const translated = mandalorianToEnglish[word.toLowerCase()];
    return translated ? applyCase(word, translated) : word;
  });
}

function detectDirection(
  text: string,
  direction?: string
): TranslationDirection {
  if (
    direction === 'to-mandalorian' ||
    direction === 'english-to-mandalorian'
  ) {
    return 'english-to-mandalorian';
  }

  if (direction === 'to-english' || direction === 'mandalorian-to-english') {
    return 'mandalorian-to-english';
  }

  const words = text.match(/\b[\w']+\b/gu) ?? [];
  if (words.length === 0) {
    return 'english-to-mandalorian';
  }

  const lowerText = text.toLowerCase();
  let englishScore = 0;
  let mandalorianScore = 0;

  const englishPhraseEntries = getEnglishPhraseEntries();
  const mandalorianPhraseEntries = getMandalorianPhraseEntries();
  const englishToMandalorian = getEnglishToMandalorianDict();
  const mandalorianToEnglish = getMandalorianToEnglishDict();

  englishPhraseEntries.forEach(([phrase]) => {
    if (lowerText.includes(phrase)) {
      englishScore += 1.5;
    }
  });

  mandalorianPhraseEntries.forEach(([phrase]) => {
    if (lowerText.includes(phrase)) {
      mandalorianScore += 1.5;
    }
  });

  words.forEach((word) => {
    const lower = word.toLowerCase();

    if (englishToMandalorian[lower]) {
      englishScore += 1;
    }

    if (mandalorianToEnglish[lower]) {
      mandalorianScore += 1.5;
    }

    if (lower.includes("'")) {
      mandalorianScore += 0.5;
    }
  });

  const apostrophes = (text.match(/'/g) || []).length;
  if (apostrophes >= 3) {
    mandalorianScore += 1;
  }

  if (mandalorianScore > englishScore) {
    return 'mandalorian-to-english';
  }

  if (englishScore > mandalorianScore) {
    return 'english-to-mandalorian';
  }

  return apostrophes > 1 ? 'mandalorian-to-english' : 'english-to-mandalorian';
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
          suggestion: 'Please provide text to translate',
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
          provided: text.length,
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
    const hasTranslation = translated !== text;

    return NextResponse.json({
      success: true,
      translated,
      original: text,
      inputType,
      direction: resolvedDirection,
      detectedInputLanguage:
        resolvedDirection === 'english-to-mandalorian'
          ? 'english'
          : 'mandalorian',
      translationMethod: 'dictionary',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: `${elapsedMs}ms`,
        textLength: text.length,
        translatedLength: translated.length,
        hasTranslation,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Mandalorian translator error:', error);
    }

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
        retryPossible: true,
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
      "Offline Mandalorian (Mando'a) translator using curated vocabulary and direction-aware heuristics",
    features: [
      'Bidirectional dictionary-based translation',
      'Automatic direction detection with heuristics',
      'Phrase-aware replacements',
      'Graceful fallback for unknown terms',
      'Optimized for Edge runtime',
    ],
    usage: {
      endpoint: '/api/mandalorian-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction:
          'to-mandalorian | english-to-mandalorian | to-english | mandalorian-to-english | auto (default)',
      },
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
        translatedLength: 'number',
        hasTranslation: 'boolean',
      },
    },
    examples: [
      {
        description: 'English to Mandalorian',
        request: {
          text: 'We stand together. Victory or death!',
          direction: 'auto',
        },
        sampleResponse: {
          translated: "Mhi oorir mhi. Kote bal kyr'am!",
          direction: 'english-to-mandalorian',
        },
      },
      {
        description: 'Mandalorian to English',
        request: {
          text: "Su cuy'gar, vod. Haat par mhi.",
          direction: 'auto',
        },
        sampleResponse: {
          translated: 'Hello, brother. Truth for us.',
          direction: 'mandalorian-to-english',
        },
      },
    ],
    timestamp: new Date().toISOString(),
  });
}
