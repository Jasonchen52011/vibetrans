import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

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

    const filePath = join(process.cwd(), 'public', 'voice', filename);

    try {
      const fileBuffer = await readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } catch (fileError) {
      console.error(`File not found: ${filePath}`, fileError);
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
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