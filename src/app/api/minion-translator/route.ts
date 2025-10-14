import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Minionese 词典（基于 Despicable Me 电影）
const MINION_DICTIONARY: Record<string, string> = {
  // 常用词汇
  hello: 'bello',
  goodbye: 'poopaye',
  thank: 'tank yu',
  you: 'para tu',
  'thank you': 'tank yu',
  sorry: 'bi do',
  please: 'pwede na',
  yes: 'si',
  no: 'le no',
  what: 'po ka',
  why: 'tulaliloo',

  // 食物相关（Minionese 特色）
  apple: 'baboi',
  banana: 'bapple',
  ice: 'ice cream',
  cream: 'gelato',
  potato: 'babbles',

  // 形容词
  beautiful: 'poopaye',
  ugly: 'bananonina',
  happy: 'hana',
  sad: 'bello saddo',
  funny: 'hahaha',
  cute: 'cutest',

  // 动词
  love: 'tulaliloo ti amo',
  hate: 'bello no no',
  eat: 'baboi',
  drink: 'babble',
  sleep: 'la bodaaa',
  work: 'papagena',

  // 常见短语
  'i love you': 'tulaliloo ti amo',
  'see you later': 'poopaye',
  'good morning': 'bello morning',
  'good night': 'poopaye night',
};

// 语气包装器
const TONE_WRAPPERS = {
  cute: (text: string) => `${text} ♥`,
  evil: (text: string) => `MUAHAHAHA ${text.toUpperCase()}!!`,
  excited: (text: string) => `${text}!!! 🍌🍌🍌`,
};

type Tone = keyof typeof TONE_WRAPPERS;
type Direction = 'toMinion' | 'toEnglish';

/**
 * 将英文转换为 Minionese
 */
function translateToMinion(text: string): string {
  let result = text.toLowerCase();

  // 优先匹配长短语
  const sortedPhrases = Object.keys(MINION_DICTIONARY).sort(
    (a, b) => b.length - a.length
  );

  for (const english of sortedPhrases) {
    const minion = MINION_DICTIONARY[english];
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, minion);
  }

  // 添加一些 Minionese 特色后缀
  result = addMinionFlair(result);

  return result;
}

/**
 * 将 Minionese 转换回英文
 */
function translateToEnglish(text: string): string {
  let result = text.toLowerCase();

  // 移除 Minionese 特色
  result = removeMinionFlair(result);

  // 反向查找词典
  const reverseDictionary = Object.entries(MINION_DICTIONARY).reduce(
    (acc, [eng, min]) => {
      acc[min.toLowerCase()] = eng;
      return acc;
    },
    {} as Record<string, string>
  );

  const sortedMinion = Object.keys(reverseDictionary).sort(
    (a, b) => b.length - a.length
  );

  for (const minion of sortedMinion) {
    const english = reverseDictionary[minion];
    const regex = new RegExp(`\\b${minion}\\b`, 'gi');
    result = result.replace(regex, english);
  }

  return result;
}

/**
 * 添加 Minionese 特色（模仿小黄人说话方式）
 */
function addMinionFlair(text: string): string {
  // 简化版本，不使用随机性（Edge Runtime 兼容）
  return text;
}

/**
 * 移除 Minionese 特色
 */
function removeMinionFlair(text: string): string {
  // 简化版本，不需要移除特殊处理
  return text;
}

/**
 * 应用语气包装
 */
function applyTone(text: string, tone?: string): string {
  if (!tone || !TONE_WRAPPERS[tone as Tone]) {
    return text;
  }
  return TONE_WRAPPERS[tone as Tone](text);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text: string;
      direction?: Direction;
      tone?: string;
    };

    console.log('[Minion API] Received:', body);

    const { text, direction = 'toMinion', tone } = body;

    if (!text || typeof text !== 'string') {
      console.log('[Minion API] Invalid text');
      return NextResponse.json(
        { error: 'No valid text provided' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    // 根据方向翻译
    let translated: string;

    if (direction === 'toMinion') {
      console.log('[Minion API] Translating to Minion...');
      translated = translateToMinion(text);
      // 应用语气（仅在转为 Minionese 时）
      if (tone) {
        translated = applyTone(translated, tone);
      }
    } else {
      console.log('[Minion API] Translating to English...');
      translated = translateToEnglish(text);
    }

    console.log('[Minion API] Success:', translated);

    return NextResponse.json({
      success: true,
      translated,
      direction,
      tone: tone || 'normal',
      originalLength: text.length,
      translatedLength: translated.length,
    });
  } catch (error) {
    console.error('[Minion API] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
