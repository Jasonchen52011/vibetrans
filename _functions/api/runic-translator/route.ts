import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Elder Futhark rune mapping
const runeMappings: { [key: string]: string } = {
  a: 'ᚨ',
  b: 'ᛒ',
  c: 'ᚲ',
  d: 'ᛞ',
  e: 'ᛖ',
  f: 'ᚠ',
  g: 'ᚷ',
  h: 'ᚻ',
  i: 'ᛁ',
  j: 'ᛃ',
  k: 'ᚲ',
  l: 'ᛚ',
  m: 'ᛗ',
  n: 'ᚾ',
  o: 'ᛟ',
  p: 'ᛈ',
  q: 'ᛩ',
  r: 'ᚱ',
  s: 'ᛋ',
  t: 'ᛏ',
  u: 'ᚢ',
  v: 'ᚡ',
  w: 'ᚹ',
  x: 'ᛉ',
  y: 'ᛇ',
  z: 'ᛎ',
  th: 'ᚦ',
  ng: 'ᛜ',
  ea: 'ᛠ',
  oe: 'ᛟ',
  ia: 'ᛁ',
  io: 'ᛁ',
  ' ': ' ',
  '.': '᛫',
  ',': '᛬',
  '!': '!',
  '?': '?',
  '-': '-',
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Convert text to lowercase for mapping
    const lowerText = text.toLowerCase();

    // Translate to runes
    let translated = '';
    let i = 0;

    while (i < lowerText.length) {
      // Check for two-character combinations first
      const twoChars = lowerText.substr(i, 2);

      if (runeMappings[twoChars]) {
        translated += runeMappings[twoChars];
        i += 2;
      } else if (runeMappings[lowerText[i]]) {
        translated += runeMappings[lowerText[i]];
        i += 1;
      } else {
        // Keep unknown characters as is
        translated += lowerText[i];
        i += 1;
      }
    }

    // Add some magical formatting
    translated = `ᚱᚢᚾᛁᚲ ᛏᚱᚨᚾᛋᛚᚨᛏᛁᛟᚾ:\n\n${translated}\n\nᚦᛖ ᚱᚢᚾᛖᛋ ᚺᚨᚹᛖ ᛊᛈᛟᚲᛖᚾ!`;

    return NextResponse.json({
      translated,
      original: text,
      metadata: {
        script: 'Elder Futhark',
        characters: translated.length,
        processingTime: '1.0s',
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
