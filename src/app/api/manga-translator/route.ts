import { NextResponse } from 'next/server';
import { detectLanguage } from '@/lib/language-detection';

export const runtime = 'edge';

// Comprehensive manga-style translation function
function translateToMangaStyle(
  text: string,
  style: 'shonen' | 'shojo' | 'seinen' | 'general' = 'general'
): string {
  if (!text) return '';

  let translated = text.trim();

  // Manga-specific word replacements based on style
  const replacements = {
    shonen: {
      hello: 'Yooooo~!',
      friend: 'bro!',
      amazing: 'INSANE!!!',
      strong: 'ridiculously strong!',
      fight: 'epic battle!',
      power: 'insane power!',
      world: 'this entire world!',
      cool: 'way too cool!',
      awesome: 'totally awesome!',
      win: 'achieve victory!',
      lose: 'face defeat...',
      challenge: 'ultimate challenge!',
      master: 'legendary master!',
      training: 'intense training!',
      special: 'special move!',
      attack: 'ultimate attack!',
      defense: 'perfect defense!',
    },
    shojo: {
      hello: 'Hai~ ☆☆',
      friend: 'bestie~',
      beautiful: 'so beautiful~ ♡',
      love: 'true love~ ♡',
      heart: 'fluttering heart ♡',
      sweet: 'adorably sweet~',
      cute: 'so cute! >ω<',
      dream: 'wonderful dream~ ✨',
      prince: 'perfect prince~',
      princess: 'beautiful princess ♡',
      happy: 'truly happy~ ☆',
      tears: 'sparkling tears...',
      smile: 'gentle smile ♡',
      promise: 'eternal promise ♡',
      together: 'together forever~',
    },
    seinen: {
      hello: 'Greetings.',
      mature: 'complex maturity.',
      deep: 'profoundly deep.',
      reality: 'harsh reality.',
      truth: 'uncomfortable truth.',
      dark: 'overwhelming darkness.',
      light: 'faint light of hope.',
      survival: 'struggle for survival.',
      humanity: "humanity's nature.",
      philosophy: 'existential philosophy.',
      morality: 'ambiguous morality.',
      fate: 'inescapable fate.',
      choice: 'difficult choices.',
      consequence: 'unavoidable consequences.',
    },
    general: {
      hello: 'Hello~ ☆☆',
      goodbye: 'Goodbye~ ★',
      'thank you': 'Arigatou~! ♡',
      sorry: 'Gomen nasai... >.<',
      amazing: '*AMAZING*',
      incredible: 'SO INCREDIBLE!!',
      fantastic: 'FANTASTIC~ ✨',
      wonderful: 'WONDERFUL~!',
      world: 'World!!! ✨',
      manga: '✨MANGA✨',
      anime: '✨ANIME✨',
      translator: 'TRANSLATOR♪',
      studio: 'Studio~ ★',
      seamless: '*SEAMLESS*',
      translation: 'Translation!!! ☆☆',
      perfect: 'Perfect~ ♡',
      best: 'The BEST! ★',
      cool: 'SO COOL! ☆',
      cute: 'So CUTE! >ω<',
      love: 'LOVE~ ♡',
      happy: 'HAPPY! ☆☆',
      dream: 'DREAM COME TRUE! ✨',
      star: 'Shining STAR~ ★',
      light: 'Bright LIGHT! ✨',
      power: 'Amazing POWER! ☆',
      magic: 'Mystical MAGIC~ ✨',
    },
  };

  const styleReplacements = replacements[style];

  // Apply word replacements
  for (const [original, replacement] of Object.entries(styleReplacements)) {
    const regex = new RegExp(original, 'gi');
    translated = translated.replace(regex, replacement);
  }

  // Common manga expressions and particles
  const mangaParticles = [
    { pattern: /\b(what|why|how)\b/gi, replacement: '$1?!' },
    { pattern: /\b(really|truly)\b/gi, replacement: '$1?!' },
    { pattern: /\b(hello|hi)\b/gi, replacement: '$1~!' },
    { pattern: /\b(yes|yeah)\b/gi, replacement: '$1! ☆' },
    { pattern: /\b(no|nope)\b/gi, replacement: '$1... ><' },
    { pattern: /\b(wow|omg)\b/gi, replacement: 'WOWWWW!!!' },
    { pattern: /\b(haha|lol)\b/gi, replacement: 'Ahahaha~ ☆' },
  ];

  // Apply particle replacements
  mangaParticles.forEach(({ pattern, replacement }) => {
    translated = translated.replace(pattern, replacement);
  });

  // Add manga-style emphasis and decorations
  const emphasisPatterns = [
    // Add emphasis to exclamations
    { pattern: /!/g, replacement: '!!! ✨' },
    { pattern: /\?/g, replacement: '?!' },

    // Emphasize important words
    { pattern: /\b(important|special|ultimate)\b/gi, replacement: '★$1★' },
    { pattern: /\b(power|strength|energy)\b/gi, replacement: '$1☆☆' },
    { pattern: /\b(love|heart)\b/gi, replacement: '♡$1♡' },

    // Add manga-style particles to sentences
    { pattern: /(\w+)$/gm, replacement: '$1~!' },

    // Dramatic pauses
    { pattern: /\.\.\./g, replacement: '......' },
  ];

  // Apply emphasis patterns
  emphasisPatterns.forEach(({ pattern, replacement }) => {
    translated = translated.replace(pattern, replacement);
  });

  // Ensure punctuation is dramatic
  if (!translated.match(/[!?]+$/)) {
    if (style === 'shonen') {
      translated += '!!!';
    } else if (style === 'shojo') {
      translated += '~ ♡';
    } else if (style === 'seinen') {
      translated += '.';
    } else {
      translated += '! ✨';
    }
  }

  // Add style-specific decorations
  if (style === 'shonen') {
    translated = translated.replace(/\b(attack|power|strength)\b/gi, '★$1★');
  } else if (style === 'shojo') {
    translated = translated.replace(/\b(beautiful|pretty|cute)\b/gi, '♡$1♡');
  }

  return translated;
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Manga Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
    availableStyles: ['shonen', 'shojo', 'seinen', 'general'],
  });
}

export async function POST(request: Request) {
  try {
    const { text, style = 'general' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Validate style
    const validStyles = ['shonen', 'shojo', 'seinen', 'general'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        {
          error: `Invalid style. Available styles: ${validStyles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Enhanced manga translation with style support
    const translated = translateToMangaStyle(text, style);

    // Determine if translation actually occurred
    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Manga-style translation successful!'
        : 'No changes needed - text already matches style',
      translator: {
        name: 'Manga Translator',
        type: 'stylistic'
      },
      style,
      mangaStyle: {
        name: style.charAt(0).toUpperCase() + style.slice(1),
        description: getStyleDescription(style),
        characteristics: getStyleCharacteristics(style),
      }
    });
  } catch (error) {
    console.error('Manga translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

// Helper functions for style information
function getStyleDescription(style: string): string {
  const descriptions = {
    shonen:
      'Action-oriented manga style with emphasis on battles, friendship, and determination',
    shojo:
      'Romantic manga style focusing on emotions, relationships, and beauty',
    seinen: 'Mature manga style with complex themes and realistic storytelling',
    general: 'Balanced manga style with elements from all genres',
  };
  return descriptions[style as keyof typeof descriptions] || 'Unknown style';
}

function getStyleCharacteristics(style: string): string[] {
  const characteristics = {
    shonen: [
      'Epic battles',
      'Friendship themes',
      'Training arcs',
      'Power-ups',
      'Dramatic action',
    ],
    shojo: [
      'Romantic elements',
      'Emotional expressions',
      'Beautiful aesthetics',
      'Relationship focus',
      'Heartfelt moments',
    ],
    seinen: [
      'Complex themes',
      'Mature content',
      'Philosophical depth',
      'Realistic scenarios',
      'Dark tones',
    ],
    general: [
      'Balanced emotions',
      'Universal appeal',
      'Mixed elements',
      'Broad appeal',
      'Adaptable tone',
    ],
  };
  return characteristics[style as keyof typeof characteristics] || [];
}
