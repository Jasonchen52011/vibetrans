import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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

    // For Edge Runtime, we'll redirect to the static file
    const baseUrl = request.headers.get('host') ?
      `https://${request.headers.get('host')}` :
      'https://vibetrans.com';

    const audioUrl = `${baseUrl}/voice/${filename}`;

    return NextResponse.redirect(audioUrl);
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
}