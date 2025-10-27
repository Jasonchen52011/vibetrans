import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Handle audio transcription requests
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    // For now, return a placeholder transcription
    // In a real implementation, you would integrate with a speech-to-text service
    // like OpenAI Whisper, Google Speech-to-Text, or Azure Speech Services

    return NextResponse.json({
      transcription:
        'This is a placeholder transcription. Please integrate with a speech-to-text service for actual transcription.',
      success: true,
      fileName: audioFile.name,
      fileSize: audioFile.size,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle GET requests
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Greek Transcription API is running',
    timestamp: new Date().toISOString(),
    methods: ['POST', 'GET'],
    note: 'This is a placeholder API. Please integrate with a speech-to-text service for actual transcription.',
  });
}
