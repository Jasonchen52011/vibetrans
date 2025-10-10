import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Gen Alpha Slang Translation Dictionary
const genAlphaSlangMap: Record<string, string> = {
  // Core Gen Alpha Terms
  charisma: 'rizz',
  charm: 'rizz',
  'charming person': 'rizz',
  random: 'skibidi',
  chaotic: 'skibidi',
  'meme-worthy': 'skibidi',
  absurd: 'skibidi',
  wow: 'gyat',
  impressive: 'gyat',
  'impressive appearance': 'gyat',
  strange: 'ohio',
  surreal: 'ohio',
  weird: 'ohio',
  bizarre: 'ohio',
  independent: 'sigma',
  alpha: 'sigma',
  'cool person': 'sigma',
  confident: 'sigma',
  "taking someone's food": 'fanum tax',
  'food tax': 'fanum tax',
  'really good': 'bussin',
  excellent: 'bussin',
  delicious: 'bussin',
  'doing great': 'slay',
  'killing it': 'slay',
  winning: 'slay',
  'no lie': 'no cap',
  'for real': 'no cap',
  truthful: 'no cap',
  lie: 'cap',
  exaggeration: 'cap',
  atmosphere: 'vibe',
  energy: 'vibe',
  feeling: 'vibe',
  embarrassing: 'cringe',
  awkward: 'cringe',
  'uncomfortable to watch': 'cringe',
  suspicious: 'sus',
  questionable: 'sus',
  shady: 'sus',
  stylish: 'drip',
  'cool fashion': 'drip',
  'great style': 'drip',
  understood: 'bet',
  okay: 'bet',
  agreement: 'bet',
  mediocre: 'mid',
  average: 'mid',
  'not impressive': 'mid',
  jealous: 'salty',
  bitter: 'salty',
  upset: 'salty',
  'showing off': 'flexing',
  boasting: 'flexing',
  bragging: 'flexing',
  very: 'hella',
  extremely: 'hella',
  'a lot': 'hella',
  hilarious: 'dead',
  'extremely funny': 'dead',
  'laughing hard': 'dead',
  // Gen Alpha specific additions
  'being cool': 'mewing',
  'face exercise': 'mewing',
  'trying hard': 'glazing',
  'over-praising': 'glazing',
  'extremely cringe': 'down bad',
  desperate: 'down bad',
  gossip: 'tea',
  drama: 'tea',
  'spill the': 'tea',
  amazing: 'fire',
  awesome: 'fire',
  perfect: 'fire',
  relaxing: 'vibing',
  'feeling good': 'vibing',
  'having fun': 'vibing',
  'throw away': 'yeet',
  discard: 'yeet',
  'throw forcefully': 'yeet',
  'biggest fan': 'stan',
  supporter: 'stan',
  'obsessed with': 'stan',
  ignore: 'ghost',
  disappear: 'ghost',
  'stop responding': 'ghost',
};

// Reverse mapping for Gen Alpha to Standard English
const reverseSlangMap: Record<string, string> = {
  rizz: 'charisma',
  skibidi: 'random',
  gyat: 'impressive',
  gyatt: 'impressive',
  ohio: 'strange',
  sigma: 'independent',
  'fanum tax': "taking someone's food",
  bussin: 'really good',
  slay: 'doing great',
  'no cap': 'no lie',
  cap: 'lie',
  vibe: 'atmosphere',
  cringe: 'embarrassing',
  sus: 'suspicious',
  drip: 'stylish',
  bet: 'understood',
  mid: 'mediocre',
  salty: 'jealous',
  flexing: 'showing off',
  hella: 'very',
  dead: 'hilarious',
  mewing: 'being cool',
  glazing: 'trying hard',
  'down bad': 'extremely cringe',
  tea: 'gossip',
  fire: 'amazing',
  vibing: 'relaxing',
  yeet: 'throw away',
  stan: 'biggest fan',
  ghost: 'ignore',
};

function translateToGenAlpha(text: string): string {
  let translated = text.toLowerCase();

  // Sort phrases by length (longest first) to avoid partial matches
  const sortedPhrases = Object.keys(genAlphaSlangMap).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    const slang = genAlphaSlangMap[phrase];
    // Use word boundaries to avoid partial word replacements
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    translated = translated.replace(regex, slang);
  }

  return translated;
}

function translateToStandard(text: string): string {
  let translated = text.toLowerCase();

  // Sort phrases by length (longest first)
  const sortedPhrases = Object.keys(reverseSlangMap).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    const standard = reverseSlangMap[phrase];
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    translated = translated.replace(regex, standard);
  }

  return translated;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toGenAlpha' | 'toStandard';
    };
    const { text, mode = 'toGenAlpha' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter some text' },
        { status: 400 }
      );
    }

    // Perform translation based on mode
    const translatedText =
      mode === 'toGenAlpha'
        ? translateToGenAlpha(text)
        : translateToStandard(text);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Gen Alpha translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process translation',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Gen Alpha Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toGenAlpha', 'toStandard'],
      slang_count: Object.keys(genAlphaSlangMap).length,
    },
    { status: 200 }
  );
}
