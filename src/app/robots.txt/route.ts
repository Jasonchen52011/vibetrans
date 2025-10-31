import { getBaseUrl } from '@/lib/urls/urls';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Generates the robots.txt file for SEO
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {NextResponse} The robots.txt content as plain text
 */
export function GET(request: NextRequest) {
  const baseUrl = getBaseUrl();

  const robotsContent = `User-agent: *
Allow: /

# API and system routes
Disallow: /api/*
Disallow: /_next/*

# Protected routes
Disallow: /settings/*
Disallow: /dashboard/*
Disallow: /admin/*

# Auth pages (keep functional but hide from search)
Disallow: /auth/*

# Content pages (hide from search)
Disallow: /blog/*
Disallow: /docs/*

# Feature pages (hide from search)
Disallow: /pricing
Disallow: /video
Disallow: /chat
Disallow: /image

# Legal pages (hide from search)
Disallow: /cookie

# Chinese locale (hide all Chinese pages)
Disallow: /zh/*

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robotsContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
