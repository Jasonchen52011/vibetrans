import { type NextRequest, NextResponse } from 'next/server';

// Uses Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// TODO: Implement edge-compatible storage using @aws-sdk/client-s3
// Currently disabled due to s3mini using node:crypto which is not edge-compatible

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'File upload is temporarily disabled for Cloudflare Pages deployment' },
    { status: 503 }
  );
}

// Increase the body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // For Next.js 13+ App Router, use maxDuration instead
  maxDuration: 30, // 30 seconds timeout
};
