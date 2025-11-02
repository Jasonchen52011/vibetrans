import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function detectLanguage(text: string): 'telugu' | 'english' {
  // Simple language detection based on Telugu script range
  const teluguRegex = /[\u0C00-\u0C7F]/;
  return teluguRegex.test(text) ? 'telugu' : 'english';
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

  const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}. Provide only the translation, no explanations or additional text:

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
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    const detectedLanguage = detectLanguage(text);
    const sourceLanguage = detectedLanguage === 'telugu' ? 'Telugu' : 'English';
    const targetLanguage = detectedLanguage === 'telugu' ? 'English' : 'Telugu';

    const translated = await translateWithGemini(text, sourceLanguage, targetLanguage);

    return NextResponse.json({
      success: true,
      translated,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Telugu-English Bidirectional Translator API',
    description:
      'Gemini 2.0 Flash powered bidirectional translation service between Telugu and English',
    features: [
      'AI-powered bidirectional translation',
      'Automatic language detection',
      'Telugu ↔ English translation',
      'Context-aware translation',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
