import { NextResponse } from 'next/server';

export const runtime = 'edge';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: 'creole-to-en' | 'en-to-creole';
    };
    const { text, direction = 'creole-to-en' } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Determine language pair based on direction (ht = Haitian Creole)
    const langpair = direction === 'creole-to-en' ? 'ht|en' : 'en|ht';

    // Call MyMemory Translation API
    const apiUrl = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langpair}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('MyMemory API request failed');
    }

    const data = (await response.json()) as {
      responseData?: {
        translatedText?: string;
      };
      responseStatus?: number;
    };

    // Check if translation was successful
    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
      throw new Error('Translation failed');
    }

    return NextResponse.json({
      translated: data.responseData.translatedText,
      original: text,
      direction: direction,
      message: 'Translation successful',
    });
  } catch (error: any) {
    console.error('Translation error:', error);

    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
