import { type NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

/**
 * Translate text using Gemini AI for Al Bhed translation
 * @param text - Input text to translate
 * @param mode - Translation mode: 'toAlBhed' or 'toEnglish'
 * @returns Translated text
 */
async function translateAlBhed(text: string, mode: 'toAlBhed' | 'toEnglish'): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
  });

  let systemPrompt: string;

  if (mode === 'toAlBhed') {
    systemPrompt = `You are an expert in the Al Bhed language from Final Fantasy X. Al Bhed uses a specific letter substitution cipher where each English letter is replaced with a corresponding Al Bhed letter.

The official Al Bhed cipher mapping is:
A↔Y, B↔P, C↔L, D↔T, E↔A, F↔V, G↔R, H↔O, I↔E, J↔B,
K↔G, L↔M, M↔N, N↔H, O↔U, P↔C, Q↔D, R↔I, S↔J, T↔S,
U↔V, V↔K, W↔W, X↔Z, Y↔Q, Z↔X

Rules:
- Apply the cipher substitution for all alphabetic characters
- Preserve the original case (uppercase/lowercase)
- Keep numbers, punctuation, and spaces unchanged
- Only return the translated text, no explanations

Translate the following English text to Al Bhed:`;
  } else {
    systemPrompt = `You are an expert in the Al Bhed language from Final Fantasy X. Al Bhed uses a specific letter substitution cipher where each Al Bhed letter corresponds to an English letter.

The official Al Bhed cipher mapping is:
A↔Y, B↔P, C↔L, D↔T, E↔A, F↔V, G↔R, H↔O, I↔E, J↔B,
K↔G, L↔M, M↔N, N↔H, O↔U, P↔C, Q↔D, R↔I, S↔J, T↔S,
U↔V, V↔K, W↔W, X↔Z, Y↔Q, Z↔X

Rules:
- Apply the reverse cipher substitution for all alphabetic characters
- Preserve the original case (uppercase/lowercase)
- Keep numbers, punctuation, and spaces unchanged
- Only return the translated text, no explanations

Translate the following Al Bhed text to English:`;
  }

  const fullPrompt = `${systemPrompt}\n\n"${text}"`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  let translatedText = response.text().trim();

  // Remove surrounding quotes if present
  if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
      (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
    translatedText = translatedText.slice(1, -1);
  }

  return translatedText;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      text?: string;
      mode?: 'toAlBhed' | 'toEnglish';
    };
    const { text, mode = 'toAlBhed' } = body;

    // Validate API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

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

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 10000 characters allowed.' },
        { status: 400 }
      );
    }

    // Perform translation using Gemini AI
    const translatedText = await translateAlBhed(text, mode);

    return NextResponse.json({
      original: text,
      translated: translatedText,
      mode: mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Error processing Al Bhed translation:', error);

    // Handle specific Gemini errors
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to process translation',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Al Bhed Translator API - Use POST method to translate text',
      version: '1.0',
      supported_modes: ['toAlBhed', 'toEnglish'],
      maxLength: 10000,
      description:
        'Translate between English and Al Bhed language from Final Fantasy X',
      cipher_type: 'Simple substitution cipher',
    },
    { status: 200 }
  );
}
