import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text: string };
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Convert Medicare Beneficiary ID to standardized alphanumeric sequence
    // Remove formatting characters (hyphens, spaces, special chars) but keep letters and numbers
    const converted = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Return both the converted alphanumeric sequence and original input
    return NextResponse.json({
      translated: converted,
      original: text,
      message: 'Successfully converted to standardized alphanumeric sequence',
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
