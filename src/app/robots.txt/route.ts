import { GET } from '@/app/api/robots/route';

export async function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3001'}/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
}