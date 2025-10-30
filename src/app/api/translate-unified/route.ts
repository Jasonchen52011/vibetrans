import { GoogleGenerativeAI } from '@/lib/ai/gemini';
import { detectLanguage } from '@/lib/language-detection';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 统一的Gemini客户端
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
);

// 简单翻译器映射（符号类）
const SYMBOLIC_TRANSLATORS = {
  rune: {
    mappings: {
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
      ' ': ' ',
      '.': '᛫',
      ',': '᛬',
      '!': '!',
      '?': '?',
      '-': '-',
    },
    formatter: (text: string) =>
      `ᚱᚢᚾᛖ ᛏᚱᚨᚾᛋᛚᚨᛏᛁᛟᚾ:\n\n${text}\n\nᚦᛖ ᚱᚢᚾᛖᛋ ᚺᚨᚹᛖ ᛊᛈᛟᚲᛖᚾ!`,
  },
  wingdings: {
    mappings: {
      a: '',
      b: '',
      c: '',
      d: '',
      e: '',
      f: '',
      g: '',
      h: '',
      i: '',
      j: '',
      k: '',
      l: '',
      m: '',
      n: '',
      o: '',
      p: '',
      q: '',
      r: '',
      s: '',
      t: '',
      u: '',
      v: '',
      w: '',
      x: '',
      y: '',
      z: '',
      ' ': ' ',
    },
    formatter: (text: string) =>
      `🎯 Wingdings Translation:\n\n${text}\n\n📝 Decoded!`,
  },
};

// AI翻译器配置
const AI_TRANSLATORS = {
  greek: {
    modes: {
      general: 'Translate the following Greek text to English directly:',
      modern:
        'You are a professional Modern Greek translator. Focus on contemporary usage and expressions:',
      ancient:
        'You are a classical scholar specializing in Ancient Greek. Focus on historical context:',
    },
    targetLanguage: 'greek',
    bidirectional: true,
  },
  telugu: {
    modes: {
      general: 'Translate the following Telugu text to English directly:',
      technical:
        'You are a professional technical Telugu translator. Focus on technical terminology:',
      literary:
        'You are a literary Telugu translator. Focus on preserving cultural nuances:',
    },
    targetLanguage: 'telugu',
    bidirectional: true,
  },
  yoda: {
    modes: {
      general:
        'Translate the following text to Yoda speak. Yoda speaks in inverted sentences, using object-subject-verb order.',
    },
    targetLanguage: 'yoda',
    bidirectional: false,
    customPrompt: (text: string) => `Translate this to Yoda speak: "${text}"`,
  },
};

// 简单翻译函数
function translateSimple(
  text: string,
  mappings: Record<string, string>
): string {
  let translated = '';
  let i = 0;

  while (i < text.length) {
    const twoChars = text.toLowerCase().substr(i, 2);
    if (mappings[twoChars]) {
      translated += mappings[twoChars];
      i += 2;
    } else if (mappings[text[i]]) {
      translated += mappings[text[i]];
      i += 1;
    } else {
      translated += text[i];
      i += 1;
    }
  }
  return translated;
}

// AI翻译函数
async function translateAI(
  text: string,
  translator: string,
  mode = 'general'
): Promise<string> {
  const config = AI_TRANSLATORS[translator as keyof typeof AI_TRANSLATORS];
  if (!config) throw new Error(`Unknown AI translator: ${translator}`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let prompt =
    config.modes[mode as keyof typeof config.modes] || config.modes.general;

  if (config.customPrompt) {
    prompt = config.customPrompt(text);
  } else {
    prompt = `${prompt}\n\n"${text}"`;
  }

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function POST(request: Request) {
  try {
    const { text, translator, mode = 'general' } = await request.json();

    if (!text || !translator) {
      return NextResponse.json(
        { error: 'Text and translator are required' },
        { status: 400 }
      );
    }

    let translated: string;
    let metadata: any = {};

    // 检查是否是简单翻译器
    if (SYMBOLIC_TRANSLATORS[translator as keyof typeof SYMBOLIC_TRANSLATORS]) {
      const config =
        SYMBOLIC_TRANSLATORS[translator as keyof typeof SYMBOLIC_TRANSLATORS];
      translated = translateSimple(text, config.mappings);
      translated = config.formatter(translated);
      metadata = { type: 'symbolic', processingTime: '1.0s' };
    }
    // 检查是否是AI翻译器
    else if (AI_TRANSLATORS[translator as keyof typeof AI_TRANSLATORS]) {
      translated = await translateAI(text, translator, mode);
      metadata = { type: 'ai', mode, translator };
    } else {
      return NextResponse.json(
        { error: `Unknown translator: ${translator}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      translated,
      original: text,
      translator,
      mode,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Translation error:', error);
    }
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Unified Translation API is running',
    available_translators: {
      symbolic: Object.keys(SYMBOLIC_TRANSLATORS),
      ai: Object.keys(AI_TRANSLATORS),
    },
    timestamp: new Date().toISOString(),
  });
}
