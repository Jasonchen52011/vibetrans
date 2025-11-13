import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Call Gemini API for translation
    const translated = await translateWithGemini(text);

    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'English to Persian translation successful!'
        : 'No translation needed',
      translator: {
        name: 'English to Persian Translator',
        type: 'bilingual',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

// Call Gemini API for translation
async function translateWithGemini(text: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GOOGLE_GENERATIVE_AI_API_KEY environment variable not set'
    );
  }

  const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  const requestText = `You are a professional English to Persian translator. Please translate the following English text to Persian. Return ONLY the Persian translation, no prefixes or explanations:

${text}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: requestText,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${errorData}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    let result = data.candidates[0].content.parts[0].text.trim();

    // Clean up response - remove any prefixes if present
    const prefixPatterns = [
      /^[^:]*translation of:\s*/i,
      /^[^:]*translation:\s*/i,
      /^Translation:\s*/i,
      /^Translated text:\s*/i,
      /^Result:\s*/i,
      /^\w+ translation of:\s*/i,
      /^\w+ translation:\s*/i,
    ];

    prefixPatterns.forEach((pattern) => {
      result = result.replace(pattern, '');
    });

    // Remove surrounding quotes if present
    if (
      (result.startsWith('"') && result.endsWith('"')) ||
      (result.startsWith("'") && result.endsWith("'"))
    ) {
      result = result.slice(1, -1);
    }

    return result.trim();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Gemini API error:', error);
    }
    throw new Error('Translation service unavailable');
  }
}
