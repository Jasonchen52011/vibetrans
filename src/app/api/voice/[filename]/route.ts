import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// No explicit runtime declaration - let Next.js choose the appropriate runtime

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  try {
    // Validate filename to prevent directory traversal
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Only allow mp3 files and prevent path traversal
    if (!filename.endsWith('.mp3') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file format or path' }, { status: 400 });
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'voice', filename);

    // Read the file
    const file = await readFile(filePath);

    // Return the file with appropriate headers
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}