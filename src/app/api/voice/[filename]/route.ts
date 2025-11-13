import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Pre-defined audio files as base64 (simplified approach for Edge Runtime)
const audioFiles: Record<string, string> = {
  'happy.mp3': 'audio/mpeg',
  'happy3.mp3': 'audio/mpeg',
  'sad.mp3': 'audio/mpeg',
  'angry.mp3': 'audio/mpeg',
  'normal.mp3': 'audio/mpeg',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Security check - only allow audio files with specific extensions
    if (!filename || !filename.match(/^(happy|sad|angry|normal)\d*\.mp3$/)) {
      return NextResponse.json(
        { error: 'Invalid file requested' },
        { status: 400 }
      );
    }

    // Check if we have this audio file configured
    if (!audioFiles[filename]) {
      return NextResponse.json(
        { error: 'Audio file not available' },
        { status: 404 }
      );
    }

    // In Edge Runtime, we need to fetch from a public URL
    // Try to get the file from the CDN or fallback URL
    const cdnUrl = `https://raw.githubusercontent.com/Jasonchen52011/vibetrans/main/public/voice/${filename}`;

    try {
      const response = await fetch(cdnUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (fetchError) {
      console.error('Failed to fetch audio file:', fetchError);

      // Return a simple error response
      return NextResponse.json(
        { error: 'Audio file temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
}
