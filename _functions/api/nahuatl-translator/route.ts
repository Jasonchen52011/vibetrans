import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslatorDirection = 'en-na' | 'na-en';

type TranslationRequest = {
  text?: string;
  direction?: TranslatorDirection;
  detectOnly?: boolean;
};

const EN_TO_NAHUATL: Record<string, string> = {
  hello: 'niltze',
  hi: 'niltze',
  goodbye: 'ka ta',
  bye: 'ka ta',
  'thank you': 'tlazohcamati',
  thanks: 'tlazohcamati',
  yes: 'quema',
  no: 'ahmo',
  water: 'atl',
  fire: 'tletl',
  earth: 'tlalticpac',
  sun: 'tonatiuh',
  moon: 'metztli',
  house: 'calli',
  home: 'calli',
  friend: 'icniuhtli',
  family: 'cualtinemitl',
  love: 'tlazotla',
  peace: 'paxializtli',
  corn: 'cintli',
  flower: 'xochitl',
  flowers: 'xochimeh',
  food: 'tlacualiztli',
  language: 'tlahtolli',
  day: 'tonal',
  night: 'yohualli',
  sky: 'ilhuicatl',
  star: 'citlalin',
  stars: 'citlalimeh',
  rain: 'quiahuitl',
  wind: 'ehecatl',
  heart: 'yollotl',
  spirit: 'yoliliztli',
  warrior: 'yaoquizqui',
  king: 'tlatoani',
  queen: 'cihuatl',
  woman: 'cihuatl',
  man: 'oquichtli',
  child: 'piltontli',
  children: 'piltotin',
  mother: 'nantli',
  father: 'tahtli',
  good: 'cualli',
  bad: 'amo cualli',
  big: 'hueyi',
  small: 'piltzintli',
  beautiful: 'cuicatl',
  strong: 'chicahua',
  knowledge: 'ixtlamachiliztli',
  life: 'yoliztli',
  death: 'miquiztli',
  world: 'tlalticpac',
  god: 'teotl',
  gods: 'teteo',
  music: 'cuicatl',
  song: 'cuicatl',
  dance: 'cueponi',
  road: 'otli',
  mountain: 'tepetl',
  river: 'atlauh',
  tree: 'cuahuitl',
  stone: 'tetl',
  bird: 'tototl',
  dog: 'chichi',
  snake: 'coatl',
  jaguar: 'ocelotl',
  war: 'yaoyotl',
  victory: 'yancuiciztli',
  dream: 'temictli',
  truth: 'neltiliztli',
  light: 'tlahuiztli',
  darkness: 'yohualli',
  morning: 'tlahuiztli',
  evening: 'yohuatequi',
  today: 'axcan',
  tomorrow: 'moyahui',
  yesterday: 'niltin tlen yohualli',
  here: 'niccan',
  there: 'ampa',
  with: 'itech',
  without: 'ahmo itech',
  and: 'auh',
  or: 'nozo',
  but: 'zan',
  if: 'intla',
  when: 'canah',
  where: 'canin',
  who: 'aquin',
  what: 'tlein',
  why: 'tleh',
  how: 'quenin',
  this: 'inin',
  that: 'inon',
  i: 'neh',
  you: 'tehhuatl',
  he: 'yehhuatl',
  she: 'yehhuatl',
  we: 'tehuantin',
  they: 'yehhuantin',
  come: 'hualauh',
  go: 'yauh',
  see: 'itta',
  hear: 'cuica',
  speak: 'tlatoa',
  eat: 'cua',
  drink: 'quetza atl',
  sleep: 'coc',
  live: 'nemini',
  die: 'miqui',
  laugh: 'cuepela',
  cry: 'choca',
  run: 'patlasti',
  walk: 'nemi',
  give: 'maca',
  take: 'cui',
  make: 'chihua',
  work: 'tequitl',
  help: 'palehuia',
  new: 'yancuic',
  old: 'huehue',
  young: 'piltontli',
  red: 'chichiltic',
  blue: 'matlaltic',
  green: 'xoxoctic',
  white: 'iztac',
  black: 'tliltic',
};

const NAHUATL_TO_EN: Record<string, string> = Object.entries(
  EN_TO_NAHUATL
).reduce(
  (acc, [english, nahuatl]) => {
    acc[normalizeWord(nahuatl)] = english;
    return acc;
  },
  {} as Record<string, string>
);

const ENGLISH_PHRASES = Object.entries(EN_TO_NAHUATL).filter(([key]) =>
  key.includes(' ')
);
const NAHUATL_PHRASES = Object.entries(NAHUATL_TO_EN).filter(([key]) =>
  key.includes(' ')
);

function normalizeWord(word: string) {
  return word.toLowerCase().trim();
}

function stripNonLetters(token: string) {
  const leading = token.match(/^\W+/)?.[0] ?? '';
  const trailing = token.match(/\W+$/)?.[0] ?? '';
  const core = token.slice(leading.length, token.length - trailing.length);
  return { leading, core, trailing };
}

function translateToken(token: string, direction: TranslatorDirection): string {
  if (!token.trim()) return token;
  const { leading, core, trailing } = stripNonLetters(token);
  const lower = normalizeWord(core);

  if (!lower) {
    return token;
  }

  if (direction === 'en-na') {
    const mapped = EN_TO_NAHUATL[lower];
    if (mapped) {
      return `${leading}${preserveCase(core, mapped)}${trailing}`;
    }
  } else {
    const mapped = NAHUATL_TO_EN[lower];
    if (mapped) {
      return `${leading}${preserveCase(core, mapped)}${trailing}`;
    }
  }

  return token;
}

function preserveCase(source: string, target: string) {
  if (!source) return target;
  if (source === source.toUpperCase()) {
    return target.toUpperCase();
  }
  if (source[0] === source[0]?.toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function translateByDictionary(text: string, direction: TranslatorDirection) {
  let workingText = text;

  if (direction === 'en-na' && ENGLISH_PHRASES.length > 0) {
    ENGLISH_PHRASES.forEach(([phrase, nahuatl]) => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      workingText = workingText.replace(regex, (match) =>
        preserveCase(match, nahuatl)
      );
    });
  } else if (direction === 'na-en' && NAHUATL_PHRASES.length > 0) {
    NAHUATL_PHRASES.forEach(([phrase, english]) => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      workingText = workingText.replace(regex, (match) =>
        preserveCase(match, english)
      );
    });
  }

  return workingText
    .split(/(\s+)/)
    .map((token) => translateToken(token, direction))
    .join('');
}

function fallbackTranslation(text: string, direction: TranslatorDirection) {
  const note =
    direction === 'en-na'
      ? 'Translation unavailable, showing original English with note.'
      : 'Translation unavailable, showing original Nahuatl with note.';
  return `${text} (${note})`;
}

function determineDirection(
  detectedLanguage: string,
  provided?: TranslatorDirection
): TranslatorDirection {
  if (provided) return provided;
  if (detectedLanguage === 'nahuatl') return 'na-en';
  if (detectedLanguage === 'english') return 'en-na';
  return 'en-na';
}

function buildLanguageInfo(
  detectedLanguage: string,
  direction: TranslatorDirection,
  confidence: number
) {
  const friendlyLanguage =
    detectedLanguage === 'nahuatl'
      ? 'Nahuatl'
      : detectedLanguage === 'english'
        ? 'English'
        : 'Unknown';

  return {
    detected: detectedLanguage !== 'unknown',
    detectedLanguage: friendlyLanguage,
    direction:
      direction === 'en-na' ? 'English → Nahuatl' : 'Nahuatl → English',
    confidence: Math.round(confidence * 100),
    explanation:
      detectedLanguage === 'nahuatl'
        ? 'Auto-detected Nahuatl input, translated to English'
        : detectedLanguage === 'english'
          ? 'Auto-detected English input, translated to Nahuatl'
          : 'Translation completed',
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Nahuatl Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslationRequest;
    const { text, direction, detectOnly = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const detection = detectLanguage(text, 'nahuatl');
    const detectedLanguage = detection.detectedLanguage;
    const confidence = detection.confidence;
    const detectedDirection = determineDirection(detectedLanguage, direction);
    const autoDetected = !direction;

    if (detectOnly) {
      return NextResponse.json({
        detectedInputLanguage: detectedLanguage,
        detectedDirection,
        confidence,
        autoDetected,
        languageInfo: buildLanguageInfo(
          detectedLanguage,
          detectedDirection,
          confidence
        ),
      });
    }

    let translated = translateByDictionary(text, detectedDirection);

    if (translated.trim().toLowerCase() === text.trim().toLowerCase()) {
      translated = fallbackTranslation(text, detectedDirection);
    }

    return NextResponse.json({
      translated: translated.trim(),
      original: text,
      detectedInputLanguage: detectedLanguage,
      detectedDirection,
      confidence,
      autoDetected,
      languageInfo: buildLanguageInfo(
        detectedLanguage,
        detectedDirection,
        confidence
      ),
    });
  } catch (error) {
    console.error('Nahuatl translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
