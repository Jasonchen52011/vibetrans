import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// Note: This route uses Node.js runtime because it imports @/lib/auth
// which uses better-auth with compatibility issues in Edge Runtime
// export const runtime = "edge";


export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Proxy endpoint to stream Google Veo videos with API key
 * This is needed because the video URLs require authentication
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const videoUri = searchParams.get('uri');

    if (!videoUri) {
      return NextResponse.json(
        { error: 'Video URI is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Fetch the video from Google with API key
    // Note: Google API returns a 302 redirect, so we need to follow it
    const response = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
      redirect: 'follow', // Follow redirects
    });

    if (!response.ok) {
      console.error('Video fetch error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the video back to the client
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Accept-Ranges': 'bytes', // Enable video seeking
      },
    });
  } catch (error: any) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to proxy video' },
      { status: 500 }
    );
  }
}
