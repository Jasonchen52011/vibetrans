import { NextResponse } from 'next/server';

export const runtime = 'edge';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file');

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          transcription:
            'Speech-to-text is unavailable because OPENAI_API_KEY is not configured.',
        },
        { status: 200 }
      );
    }

    const openAiFormData = new FormData();
    openAiFormData.append('file', audioFile, audioFile.name || 'audio.m4a');
    openAiFormData.append(
      'model',
      process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1'
    );
    openAiFormData.append('response_format', 'json');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: openAiFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription error:', errorText);
      return NextResponse.json(
        {
          error:
            'Unable to transcribe audio at the moment. Please try again later.',
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      transcription: data.text || '',
    });
  } catch (error) {
    console.error('Transcription failure:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
