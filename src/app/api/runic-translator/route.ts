import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Elder Futhark符文映射
const elderFutharkMappings: { [key: string]: string } = {
  // 元音字母
  'a': 'ᚨ',  // Ansuz
  'á': 'ᚨ',
  'æ': 'ᚯ',  // Æsc
  'ǽ': 'ᚯ',
  'e': 'ᛖ',  // Ehwaz
  'é': 'ᛖ',
  'ê': 'ᛖ',
  'i': 'ᛁ',  // Isa
  'í': 'ᛁ',
  'î': 'ᛁ',
  'j': 'ᛃ',  // Jeran
  'j': 'ᛄ',  // Jeran
  'o': 'ᛟ',  // Othala
  'ó': 'ᛟ',
  'ô': 'ᛟ',
  'p': 'ᛈ',  // Perþo
  'q': 'ᛩ',  // *- (不常用)
  'r': 'ᚱ',  // Raidho
  's': 'ᛋ',  // Sowilo
  't': 'ᛏ',  // Tiwaz
  'u': 'ᚢ',  // Uruz
  'ú': 'ᚢ',
  'û': 'ᚢ',
  'v': 'ᚡ',  // Wunjo
  'w': 'ᚹ',  // Wynn
  'y': 'ᛇ',  // *- (不常用)
  'z': 'ᛎ',  // *- (不常用)
  'x': 'ᛉ',  // *- (不常用)

  // 双元音和特殊字符
  'th': 'ᚦ',  // Thurisaz
  'ng': 'ᛜ',  // Ingwaz
  'eo': 'ᛠ',  // Eolh
  'ia': 'ᛁ',  // 可能的组合
  'ea': 'ᛠ',  // 可能的组合
  'ao': 'ᛟ',  // 可能的组合
  'ei': 'ᛁ',  // 可能的组合

  // 标点符号和空格
  ' ': ' ',
  '.': '᛫',
  ',': '᛬',
  '!': '!',
  '?': '?',
  '-': '-',
  ':': ':',
  ';': ';',
};

// 反向映射
const englishMappings: { [key: string]: string } = {};
for (const [english, futhark] of Object.entries(elderFutharkMappings)) {
  englishMappings[futhark] = english;
}

function translateToRunic(text: string): string {
  let translated = '';
  let i = 0;

  while (i < text.length) {
    const twoChars = text.toLowerCase().substr(i, 2);
    const threeChars = text.toLowerCase().substr(i, 3);

    // 优先匹配更长的组合
    if (elderFutharkMappings[threeChars]) {
      translated += elderFutharkMappings[threeChars];
      i += 3;
    } else if (elderFutharkMappings[twoChars]) {
      translated += elderFutharkMappings[twoChars];
      i += 2;
    } else if (elderFutharkMappings[text[i].toLowerCase()]) {
      translated += elderFutharkMappings[text[i].toLowerCase()];
      i += 1;
    } else {
      translated += text[i];
      i += 1;
    }
  }

  return translated;
}

function translateToEnglish(text: string): string {
  let translated = '';
  let i = 0;

  while (i < text.length) {
    const twoChars = text.substr(i, 2);
    const threeChars = text.substr(i, 3);

    // 优先匹配更长的组合
    if (englishMappings[threeChars]) {
      translated += englishMappings[threeChars];
      i += 3;
    } else if (englishMappings[twoChars]) {
      translated += englishMappings[twoChars];
      i += 2;
    } else if (englishMappings[text[i]]) {
      translated += englishMappings[text[i]];
      i += 1;
    } else {
      translated += text[i];
      i += 1;
    }
  }

  return translated;
}

function detectDirection(text: string): 'to-runic' | 'to-english' {
  // 更准确的启发式方法：检查是否包含Futhark字符
  const futharkChars = Object.keys(englishMappings);
  const hasFutharkChars = futharkChars.some(char => text.includes(char));

  // 也检查是否有拉丁字母（英文）
  const hasLatinChars = /[a-zA-Z]/.test(text);

  // 计算Futhark字符数量
  const futharkCount = futharkChars.reduce((count, char) => {
    return count + (text.split(char).length - 1);
  }, 0);

  // 计算拉丁字母数量
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  // 如果Futhark字符明显多于拉丁字母，则判断为runic到english
  if (futharkCount > latinCount && futharkCount > 0) {
    return 'to-english';
  }

  // 否则默认为english到runic
  return 'to-runic';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, inputType = 'text', direction } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let translated: string;
    let detectedDirection = direction;

    if (direction === 'to-runic' || direction === 'english-to-runic') {
      translated = translateToRunic(text);
      detectedDirection = 'english-to-runic';
    } else if (direction === 'to-english' || direction === 'runic-to-english') {
      translated = translateToEnglish(text);
      detectedDirection = 'runic-to-english';
    } else {
      // 自动检测方向
      detectedDirection = detectDirection(text);
      if (detectedDirection === 'to-english') {
        translated = translateToEnglish(text);
      } else {
        translated = translateToRunic(text);
      }
    }

    return NextResponse.json({
      translated,
      original: text,
      inputType,
      direction: detectedDirection,
      message: 'Translation successful',
      detectedInputLanguage: detectedDirection === 'english-to-runic' ? 'english' : 'runic',
      script: 'elder-futhark',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Runic translator error:', error);
    }
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Elder Futhark Runic Translator API',
    description: 'Translate between English and Elder Futhark runes',
    usage: {
      endpoint: '/api/runic-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction: 'to-runic | to-english | auto (optional, default: auto)'
      }
    },
    availableFeatures: [
      'Elder Futhark rune translation',
      'Automatic direction detection',
      'Bidirectional translation',
      'Punctuation preservation'
    ],
    script: 'elder-futhark',
    timestamp: new Date().toISOString()
  });
}