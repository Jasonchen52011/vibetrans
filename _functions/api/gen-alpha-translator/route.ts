import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Load dictionary data dynamically
let genAlphaSlangMap: Record<string, string> = {};
let reverseSlangMap: Record<string, string> = {};

// Initialize dictionary on first use
async function initializeDictionaries() {
  try {
    const dictData = await import('@/data/dictionaries/gen-alpha.json');
    genAlphaSlangMap = dictData.genAlphaSlangMap;
    reverseSlangMap = dictData.reverseSlangMap;
  } catch (error) {
    console.error('Failed to load dictionaries:', error);
    // Fallback to minimal dictionary
    genAlphaSlangMap = {
      charisma: 'rizz',
      amazing: 'fire',
      good: 'bussin',
      cool: 'drip',
      wow: 'gyat'
    };
    reverseSlangMap = {
      rizz: 'charisma',
      fire: 'amazing',
      bussin: 'excellent',
      drip: 'stylish',
      gyat: 'impressive'
    };
  }
}

// Simplified AI translation function
async function translateWithAI(
  text: string,
  mode: 'toGenAlpha' | 'toStandard'
): Promise<string> {
  try {
    const prompt =
      mode === 'toGenAlpha'
        ? `Translate to Gen Alpha slang: "${text}"`
        : `Translate from Gen Alpha slang: "${text}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('AI translation error:', error);
    return text;
  }
}

// Dictionary translation
function translateWithDictionary(text: string, mode: 'toGenAlpha' | 'toStandard'): string {
  const map = mode === 'toGenAlpha' ? genAlphaSlangMap : reverseSlangMap;
  let translated = text;

  // Sort by length (longest first) for better matching
  const sortedPhrases = Object.keys(map).sort((a, b) => b.length - a.length);

  for (const phrase of sortedPhrases) {
    const replacement = map[phrase];
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    translated = translated.replace(regex, replacement);
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

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Initialize dictionaries if needed
    if (Object.keys(genAlphaSlangMap).length === 0) {
      await initializeDictionaries();
    }

    // Try dictionary first, fallback to AI if no translation found
    let translatedText = translateWithDictionary(text, mode);
    let aiEnhanced = false;

    // If no dictionary translation was made, try AI
    if (translatedText === text) {
      translatedText = await translateWithAI(text, mode);
      aiEnhanced = translatedText !== text;
    }

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
      ai_enhanced: aiEnhanced,
    });
  } catch (error: any) {
    console.error('Error processing Gen Alpha translation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process translation. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Gen Alpha Translator API - Optimized Version',
      version: '3.0',
      features: [
        'External dictionary data',
        'AI fallback for complex translations',
        'Compact bundle size',
        'Fast startup time',
      ],
      supported_modes: ['toGenAlpha', 'toStandard'],
      ai_fallback: true,
      max_text_length: 5000,
    },
    { status: 200 }
  );
}