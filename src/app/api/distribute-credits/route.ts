import { NextResponse } from 'next/server';

// Uses Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// TODO: Implement edge-compatible credit distribution
// Currently disabled due to database incompatibility with Edge Runtime

/**
 * distribute credits to all users daily (currently disabled for Cloudflare Pages)
 */
export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'Credit distribution is temporarily disabled for Cloudflare Pages deployment' },
    { status: 503 }
  );
}
