import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Wingdings字符映射 (基于Wingdings和Wingdings 2/3字体)
const WINGDINGS_MAP: { [key: string]: string[] } = {
  A: ['\u270C', '\u261D'], // ✌, ☝ (Wingdings variations)
  B: ['\u270B', '\ud83d\udc4b'], // ✋, 👋
  C: ['\ud83d\ude4f', '\u270D'], // 🙏, ✍
  D: ['\u270A', '\u270B'], // ✊, ✋
  E: ['\ud83d\udc46', '\u261D'], // 👆, ☝
  F: ['\u270D', '\u270B'], // ✍, ✋
  G: ['\u270C', '\u270D'], // ✌, ✍
  H: ['\u270A', '\ud83d\udc46'], // ✊, 👆
  I: ['\u261D', '\ud83d\ude4f'], // ☝, 🙏
  J: ['\u270B', '\ud83d\udc47'], // ✋, 👇
  K: ['\u270C', '\ud83d\udc48'], // ✌, 👈
  L: ['\ud83d\udc47', '\u270D'], // 👇, ✍
  M: ['\u270B', '\u270A'], // ✋, ✊
  N: ['\ud83d\udc48', '\u261D'], // 👈, ☝
  O: ['\u270B', '\ud83d\ude4f'], // ✋, 🙏
  P: ['\u270C', '\ud83d\udc46'], // ✌, 👆
  Q: ['\u270D', '\u270A'], // ✍, ✊
  R: ['\ud83d\udc47', '\u270B'], // 👇, ✋
  S: ['\u270A', '\u270C'], // ✊, ✌
  T: ['\u261D', '\ud83d\udc48'], // ☝, 👈
  U: ['\ud83d\udc46', '\u270B'], // 👆, ✋
  V: ['\u270C', '\u270A'], // ✌, ✊
  W: ['\u270B', '\ud83d\udc46'], // ✋, 👆
  X: ['\u270D', '\ud83d\udc47'], // ✍, 👇
  Y: ['\u270A', '\u270C'], // ✊, ✌
  Z: ['\u261D', '\u270D'], // ☝, ✍

  // 小写字母
  a: ['\u270B', '\ud83d\udc4b'], // ✋, 👋
  b: ['\ud83d\udc46', '\u270A'], // 👆, ✊
  c: ['\u270D', '\ud83d\ude4f'], // ✍, 🙏
  d: ['\u270C', '\ud83d\udc47'], // ✌, 👇
  e: ['\u270B', '\u261D'], // ✋, ☝
  f: ['\ud83d\udc48', '\u270A'], // 👈, ✊
  g: ['\u270D', '\u270B'], // ✍, ✋
  h: ['\u270A', '\ud83d\udc46'], // ✊, 👆
  i: ['\u261D', '\ud83d\ude4f'], // ☝, 🙏
  j: ['\u270B', '\ud83d\udc47'], // ✋, 👇
  k: ['\u270C', '\ud83d\udc48'], // ✌, 👈
  l: ['\ud83d\udc47', '\u270D'], // 👇, ✍
  m: ['\u270B', '\u270A'], // ✋, ✊
  n: ['\ud83d\udc48', '\u261D'], // 👈, ☝
  o: ['\u270B', '\ud83d\ude4f'], // ✋, 🙏
  p: ['\u270C', '\ud83d\udc46'], // ✌, 👆
  q: ['\u270D', '\u270A'], // ✍, ✊
  r: ['\ud83d\udc47', '\u270B'], // 👇, ✋
  s: ['\u270A', '\u270C'], // ✊, ✌
  t: ['\u261D', '\ud83d\udc48'], // ☝, 👈
  u: ['\ud83d\udc46', '\u270B'], // 👆, ✋
  v: ['\u270C', '\u270A'], // ✌, ✊
  w: ['\u270B', '\ud83d\udc46'], // ✋, 👆
  x: ['\u270D', '\ud83d\udc47'], // ✍, 👇
  y: ['\u270A', '\u270C'], // ✊, ✌
  z: ['\u261D', '\u270D'], // ☝, ✍

  // 数字
  '0': ['\u274c', '\u2b55'], // ❌, ⭕
  '1': ['\u261d', '\ud83d\udc46'], // ☝, 👆
  '2': ['\u270c', '\u270b'], // ✌, ✋
  '3': ['\u270c\ufe0f', '\ud83d\ude4f'], // ✌, 🙏
  '4': ['\ud83d\udc47', '\u270a'], // 👇, ✊
  '5': ['\u270b', '\u270d'], // ✋, ✍
  '6': ['\ud83d\udc48', '\ud83d\ude4f'], // 👈, 🙏
  '7': ['\u270c', '\ud83d\udc46'], // ✌, 👆
  '8': ['\u270b', '\u270a'], // ✋, ✊
  '9': ['\ud83d\udc47', '\u270c'], // 👇, ✌

  // 常用标点符号
  '.': ['\u2713', '\u2714'], // ✓, ✔
  ',': ['\u2715', '\u2716'], // ✕, ✖
  '!': ['\u2757', '\u274b'], // ❗, ❫
  '?': ['\u2753', '\u2754'], // ❓, ❔
  ':': ['\u25cf', '\u25cb'], // ●, ○
  ';': ['\u25d0', '\u25d1'], // ◐, ◑
  ' ': [' ', ' ', '  '], // 空格变体
};

// Wingdings符号到英文字母的反向映射
const WINGDINGS_TO_LETTER: { [key: string]: string } = {};

// 构建反向映射
for (const [letter, symbols] of Object.entries(WINGDINGS_MAP)) {
  symbols.forEach((symbol) => {
    if (symbol && !WINGDINGS_TO_LETTER[symbol]) {
      WINGDINGS_TO_LETTER[symbol] = letter;
    }
  });
}

// 翻译函数
function translateToWingdings(
  text: string,
  style: 'traditional' | 'modern' = 'traditional'
): string {
  if (!text) return '';

  return text
    .split('')
    .map((char) => {
      const upperChar = char.toUpperCase();
      const symbolOptions = WINGDINGS_MAP[upperChar] || WINGDINGS_MAP[char];

      if (symbolOptions && symbolOptions.length > 0) {
        // 根据风格选择符号
        if (style === 'traditional') {
          return symbolOptions[0] || char; // 传统风格使用第一个符号
        } else {
          // 现代风格随机选择
          const randomIndex = Math.floor(Math.random() * symbolOptions.length);
          return symbolOptions[randomIndex] || char;
        }
      }

      return char; // 保持原字符不变
    })
    .join('');
}

// Wingdings到英文的翻译函数
function translateFromWingdings(text: string): string {
  if (!text) return '';

  return text
    .split('')
    .map((char) => {
      return WINGDINGS_TO_LETTER[char] || char;
    })
    .join('');
}

// 自动检测方向
function detectDirection(text: string): 'to-wingdings' | 'from-wingdings' {
  // 检测是否包含Wingdings符号
  const hasWingdings = /[✌☝✋🙏✍✊👆👇👈❌⭕✓✔✕✖❗❫❓❔●○◐◑]/u.test(text);
  return hasWingdings ? 'from-wingdings' : 'to-wingdings';
}

// 混合模式：部分翻译
function mixedTranslation(text: string, intensity = 0.5): string {
  if (!text) return '';

  return text
    .split('')
    .map((char) => {
      const shouldTranslate = Math.random() < intensity;
      if (shouldTranslate) {
        const upperChar = char.toUpperCase();
        const symbolOptions = WINGDINGS_MAP[upperChar] || WINGDINGS_MAP[char];
        if (symbolOptions && symbolOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * symbolOptions.length);
          return symbolOptions[randomIndex] || char;
        }
      }
      return char;
    })
    .join('');
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Wingdings Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  try {
    const {
      text,
      direction,
      style = 'traditional',
      intensity,
      mixed,
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    let translated: string;
    let detectedDirection = false;
    const translationDirection = direction || detectDirection(text);

    if (direction) {
      // 用户指定了方向
      detectedDirection = false;
    } else {
      // 自动检测方向
      detectedDirection = true;
    }

    if (mixed !== undefined && mixed !== false) {
      // 混合模式
      const mixIntensity = typeof intensity === 'number' ? intensity : 0.5;
      translated = mixedTranslation(text, mixIntensity);
    } else {
      // 正常翻译模式
      if (translationDirection === 'to-wingdings') {
        translated = translateToWingdings(text, style);
      } else {
        translated = translateFromWingdings(text);
      }
    }

    // 检测是否发生了实际翻译
    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Translation successful'
        : 'No translation needed - input appears to be in target format',
      translator: {
        name: 'Wingdings Translator',
        type: 'symbolic'
      },
      direction: translationDirection,
      detectedDirection,
      style,
      mixed: mixed === true,
      mode:
        translationDirection === 'to-wingdings'
          ? 'Text → Wingdings'
          : 'Wingdings → Text',
      characteristics: {
        inputLength: text.length,
        outputLength: translated.length,
        hasWingdings: /[✌☝✋🙏✍✊👆👇👈❌⭕✓✔✕✖❗❫❓❔●○◐◑]/u.test(text),
        note: 'Wingdings is a symbolic font originally created for Microsoft Windows',
      },
    });
  } catch (error) {
    console.error('Wingdings translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
