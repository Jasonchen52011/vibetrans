import { type NextRequest, NextResponse } from 'next/server';

// Uses Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

// TODO: Implement edge-compatible Stripe webhook handler
// Currently disabled due to payment module dependencies on postgres

/**
 * Stripe webhook handler (currently disabled for Cloudflare Pages)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Stripe webhooks are temporarily disabled for Cloudflare Pages deployment' },
    { status: 503 }
  );
}
