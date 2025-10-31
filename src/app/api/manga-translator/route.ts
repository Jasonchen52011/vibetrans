import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Language detection patterns
const JAPANESE_PATTERNS = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/; // Hiragana, Katakana, Kanji

function detectLanguage(text: string): 'japanese' | 'english' | 'unknown' {
  if (JAPANESE_PATTERNS.test(text)) {
    return 'japanese';
  }
  // Basic check for English (latin characters and common words)
  if (/[a-zA-Z]/.test(text) && text.length > 2) {
    return 'english';
  }
  return 'unknown';
}

async function translateWithGemini(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google Generative AI API key is not configured');
  }

  let prompt: string;

  if (sourceLanguage === 'japanese' && targetLanguage === 'english') {
    prompt = `Translate the following Japanese text to natural English manga/comic style. Keep the tone appropriate for manga - slightly informal but natural. Provide only the translation, no explanations:

${text}`;
  } else if (sourceLanguage === 'english' && targetLanguage === 'japanese') {
    prompt = `Translate the following English text to natural Japanese manga/comic style. Use appropriate manga expressions and tone. Provide only the translation, no explanations:

${text}`;
  } else {
    prompt = `Translate the following text to appropriate manga style. If it's Japanese, translate to English. If it's English, translate to Japanese. Provide only the translation, no explanations:

${text}`;
  }

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
          temperature: 0.3,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageData, options = {} } = body;

    // Handle text-based translation
    if (text && typeof text === 'string') {
      if (text.length > 5000) {
        return NextResponse.json(
          { success: false, error: 'Text too long. Maximum 5000 characters.' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      const detectedLanguage = detectLanguage(text);

      // Determine target language based on source
      let targetLanguage = 'japanese';
      if (detectedLanguage === 'japanese') {
        targetLanguage = 'english';
      } else if (detectedLanguage === 'english') {
        targetLanguage = 'japanese';
      }

      const translated = await translateWithGemini(
        text,
        detectedLanguage,
        targetLanguage
      );
      const processingTime = `${Date.now() - startTime}ms`;

      return NextResponse.json({
        success: true,
        translatedText: translated,
        originalText: text,
        detectedLanguage,
        options,
        translationMethod: 'gemini-2.0-flash',
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime,
          textLength: text.length,
          translatedLength: translated.length,
        },
      });
    }

    // Handle image-based translation (placeholder for future OCR implementation)
    if (imageData) {
      return NextResponse.json(
        { success: false, error: 'Image recognition not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Valid text or image data is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Translation failed',
        suggestion: 'Please try again',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Manga Translator API',
    description:
      'Gemini 2.0 Flash powered English to Manga Style translation service',
    features: [
      'AI-powered translation',
      'Manga style processing',
      'Context-aware translation',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
