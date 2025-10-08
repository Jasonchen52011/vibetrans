import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Gen Z Slang Translation Dictionary
const genZSlangMap: Record<string, string> = {
  // Common phrases
  'for real': 'no cap',
  'no lie': 'no cap',
  'really good': 'bussin',
  excellent: 'bussin',
  amazing: 'fire',
  awesome: 'fire',
  cool: 'drip',
  stylish: 'drip',
  mediocre: 'mid',
  average: 'mid',
  boring: 'mid',
  understood: 'bet',
  okay: 'bet',
  agree: 'bet',
  suspicious: 'sus',
  questionable: 'sus',
  impressive: 'slaps',
  'great music': 'slaps',
  very: 'hella',
  extremely: 'hella',
  'dying of laughter': 'dead',
  hilarious: 'dead',
  embarrassing: 'cringe',
  awkward: 'cringe',
  jealous: 'salty',
  bitter: 'salty',
  bragging: 'flexing',
  'showing off': 'flexing',
  gossip: 'tea',
  drama: 'tea',
  'i understand': 'say less',
  'got it': 'say less',
  relax: 'chill',
  'calm down': 'chill',
  'romantic partner': 'bae',
  boyfriend: 'bae',
  girlfriend: 'bae',
  'cool person': 'vibes',
  'good energy': 'vibes',
  'throw away': 'yeet',
  discard: 'yeet',
  'biggest fan': 'stan',
  'obsessed with': 'stan',
  ignore: 'ghost',
  disappear: 'ghost',
  'very happy': 'living my best life',
  thriving: 'living my best life',
  'old-fashioned': 'boomer',
  outdated: 'boomer',
  fashionable: 'on fleek',
  perfect: 'on fleek',
  'i am serious': 'fax no printer',
  truth: 'fax no printer',
  absolutely: 'periodt',
  'end of discussion': 'periodt',
  'impressive skill': 'hits different',
  'unique quality': 'hits different',
  'leave quickly': 'dip',
  exit: 'dip',
  'main account': 'main',
  'official account': 'main',
  excited: 'hyped',
  enthusiastic: 'hyped',
  'feeling good': 'vibing',
  relaxing: 'vibing',
  'absolutely not': 'nah fam',
  'no way': 'nah fam',
};

// Reverse mapping for Gen Z to Standard English
const reverseSlangMap: Record<string, string> = {
  'no cap': 'for real',
  bussin: 'really good',
  fire: 'amazing',
  drip: 'stylish',
  mid: 'mediocre',
  bet: 'understood',
  sus: 'suspicious',
  slaps: 'impressive',
  hella: 'very',
  dead: 'hilarious',
  cringe: 'embarrassing',
  salty: 'jealous',
  flexing: 'showing off',
  tea: 'gossip',
  'say less': 'i understand',
  chill: 'relax',
  bae: 'romantic partner',
  vibes: 'good energy',
  yeet: 'throw away',
  stan: 'biggest fan',
  ghost: 'ignore',
  'living my best life': 'very happy',
  boomer: 'old-fashioned',
  'on fleek': 'perfect',
  'fax no printer': 'i am serious',
  periodt: 'absolutely',
  'hits different': 'unique quality',
  dip: 'leave quickly',
  main: 'main account',
  hyped: 'excited',
  vibing: 'feeling good',
  'nah fam': 'absolutely not',
};

function translateToGenZ(text: string): string {
  let translated = text.toLowerCase();

  // Sort phrases by length (longest first) to avoid partial matches
  const sortedPhrases = Object.keys(genZSlangMap).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    const slang = genZSlangMap[phrase];
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
      mode?: 'toGenZ' | 'toStandard';
    };
    const { text, mode = 'toGenZ' } = body;

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
      mode === 'toGenZ' ? translateToGenZ(text) : translateToStandard(text);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Gen Z translation:', error);
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
      message: 'Gen Z Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toGenZ', 'toStandard'],
      slang_count: Object.keys(genZSlangMap).length,
    },
    { status: 200 }
  );
}
