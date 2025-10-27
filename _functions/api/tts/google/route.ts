import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Google Cloud Text-to-Speech API
 * Requires GOOGLE_CLOUD_TTS_API_KEY in environment variables
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      languageCode?: string;
    };
    const { text, languageCode = 'en-US' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Cloud TTS API key not configured' },
        { status: 500 }
      );
    }

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name:
              languageCode === 'zh-CN' ? 'zh-CN-Wavenet-A' : 'en-US-Wavenet-D',
            ssmlGender: 'NEUTRAL',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google TTS API error:', error);
      return NextResponse.json(
        { error: 'Failed to synthesize speech' },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      audioContent?: string;
    };

    // Return base64 audio
    return NextResponse.json({
      audio: data.audioContent,
      format: 'mp3',
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
