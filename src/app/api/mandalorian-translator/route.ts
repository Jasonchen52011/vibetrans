import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type TranslationDirection = 'english-to-mandalorian' | 'mandalorian-to-english';

async function translateWithGemini(
  text: string,
  direction: TranslationDirection
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google Generative AI API key is not configured');
  }

  const prompt = direction === 'english-to-mandalorian'
    ? `Translate the following English text to Mandalorian (Mando'a). Use authentic Mandalorian vocabulary and grammar from Star Wars lore. Include apostrophes and Mandalorian linguistic patterns. Provide only the translation, no explanations or additional text:

${text}`
    : `Translate the following Mandalorian (Mando'a) text to English. The Mandalorian language contains apostrophes and unique linguistic patterns from Star Wars lore. Provide only the translation, no explanations or additional text:

${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text.trim();
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

  // Auto-detect based on content
  const hasMandalorianPatterns = /[\u0027\u2019\u02BC]/.test(text) || // apostrophes
    /\b(su\s+cuy|cuyir|verd|aliit|beskar|kote|vod|aruetii|ibic|bic|haat|parjai|darasuum)\b/i.test(text);

  return hasMandalorianPatterns ? 'mandalorian-to-english' : 'english-to-mandalorian';
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

    const translated = await translateWithGemini(text, resolvedDirection);
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
      translationMethod: 'gemini-2.0-flash',
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
      "AI-powered Mandalorian (Mando'a) translator using Google Gemini 2.0 Flash for authentic translation",
    features: [
      'AI-powered bidirectional translation',
      'Automatic direction detection with pattern recognition',
      'Authentic Mandalorian vocabulary and grammar',
      'Context-aware translation',
      'Powered by Google Gemini 2.0 Flash',
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
      translationMethod: 'gemini-2.0-flash',
      metadata: {
        timestamp: 'ISO string',
        processingTime: 'string (e.g. "200ms")',
        textLength: 'number',
        translatedLength: 'number',
        hasTranslation: 'boolean',
      },
    },
    examples: [
      {
        description: 'English to Mandalorian',
        request: {
          text: 'We stand together. This is the way.',
          direction: 'auto',
        },
        sampleResponse: {
          translated: "Mhi oorir mhi. Haatyc ori'shya talyc.",
          direction: 'english-to-mandalorian',
        },
      },
      {
        description: 'Mandalorian to English',
        request: {
          text: "Su cuy'gar, vod. Kote bal kyr'am!",
          direction: 'auto',
        },
        sampleResponse: {
          translated: 'Hello, brother. Victory or death!',
          direction: 'mandalorian-to-english',
        },
      },
    ],
    timestamp: new Date().toISOString(),
  });
}
