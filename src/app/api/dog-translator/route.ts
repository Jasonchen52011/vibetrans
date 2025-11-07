import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function analyzeEmotionWithGemini(
  text: string
): Promise<{ emotion: 'happy' | 'sad' | 'angry' | 'normal' }> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Google Generative AI API key is not configured');
  }

  const prompt = `Analyze the emotion in this text and respond with ONLY one word: happy, sad, angry, or normal.
Text: ${text}
Emotion:`;

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
          temperature: 0.1,
          maxOutputTokens: 10,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(
      `Failed to parse Gemini API response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
    );
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  const emotion = data.candidates[0].content.parts[0].text.trim().toLowerCase();

  // Validate and normalize emotion
  if (
    emotion.includes('happy') ||
    emotion.includes('joy') ||
    emotion.includes('excited')
  ) {
    return { emotion: 'happy' };
  } else if (
    emotion.includes('sad') ||
    emotion.includes('cry') ||
    emotion.includes('upset')
  ) {
    return { emotion: 'sad' };
  } else if (
    emotion.includes('angry') ||
    emotion.includes('mad') ||
    emotion.includes('furious')
  ) {
    return { emotion: 'angry' };
  } else {
    return { emotion: 'normal' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { text, options = {} } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { emotion: 'normal', error: 'Valid text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { emotion: 'normal', error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    try {
      const result = await analyzeEmotionWithGemini(text);
      return NextResponse.json({
        emotion: result.emotion,
        success: true,
      });
    } catch (apiError) {
      console.error('Emotion analysis error:', apiError);
      // Return default emotion on API error
      return NextResponse.json({
        emotion: 'normal',
        success: false,
        error: 'AI analysis failed, using default emotion',
        isQuotaError: true,
      });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        emotion: 'normal',
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
    service: 'Dog Translator API',
    description: 'Gemini 2.0 Flash powered dog emotion analysis service',
    features: [
      'AI-powered emotion analysis',
      'Dog language processing',
      'Emotion-based bark sounds',
      'Real-time processing',
    ],
    timestamp: new Date().toISOString(),
  });
}
