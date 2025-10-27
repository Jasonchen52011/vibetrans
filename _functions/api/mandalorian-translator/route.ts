import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 曼达洛语词典 - 基于星球大战宇宙中的曼达洛语
const MANDALORIAN_DICTIONARY: { [key: string]: string } = {
  // 基础词汇
  hello: "su cuy'gar",
  goodbye: 'narudar',
  yes: "sey'ceyi",
  no: 'bat',
  thank: 'cuyir',
  thanks: 'cuyir',
  please: 'copad',
  sorry: 'novoc',
  friend: 'iberz',
  family: 'aliit',
  honor: 'bal',
  strength: 'beskar',
  warrior: "ver'verd",
  battle: 'batir',
  fight: 'batir',
  victory: 'partaylir',
  win: 'partaylir',
  lose: 'dral',
  defeat: "dralshy'a",
  home: "kyr'amur",
  house: "kyr'am",
  world: 'verda',
  life: 'cuyan',
  death: "kyr'am",
  love: 'cuyir gar',
  hate: "shuk'la",
  peace: 'solus',
  war: 'vode',
  weapon: 'kad',
  armor: "beskar'gam",
  helmet: "buy'ce",
  child: 'ad',
  children: 'ade',
  father: 'buir',
  mother: 'buir',
  parent: 'buir',
  brother: 'vod',
  sister: 'vod',
  sibling: 'vod',

  // 常用短语
  'i am': "ni cuy'ir",
  'you are': "gar cuy'ir",
  'we are': "mhi cuy'ir",
  'they are': "val cuy'ir",
  'this is': "bic cuy'ir",
  'that is': "tic cuy'ir",
  'i have': 'ni ibac',
  'you have': 'gar ibac',
  'we have': 'mhi ibac',
  'i want': 'ni nayc',
  'you want': 'gar nayc',
  'i need': "ni nayc'l",
  'you need': "gar nayc'l",

  // 核心曼达洛词汇
  mandalorian: "mando'ad",
  mando: "mando'ad",
  'the way': 'haatyc',
  code: 'kaaned',
  creed: 'kaaned',
  resolve: 'akan',
  iron: 'beskar',
  steel: 'beskar',
  clan: 'aliit',
  tribe: 'aliit',
  mercenary: 'mercenary',
  bounty: 'bounty',
  hunter: 'hunter',

  // 动词
  go: 'briikase',
  come: 'cum',
  see: 'copaan',
  hear: "kar'ta",
  speak: 'jurai',
  say: 'jura',
  tell: 'juraat',
  know: "kar'taam",
  think: 'het',
  believe: "kar'taamir",
  feel: "getts'ika",
  fight: 'batir',
  kill: "kyr'amir",
  protect: "caa'nora",
  defend: "caa'nora",
  attack: 'vhetin',
  strike: 'vhetin',
  run: 'jaon',
  walk: 'jaon',
  stand: 'jaic',
  sit: 'jetiise',

  // 形容词
  strong: 'par',
  weak: 'weak',
  brave: 'par',
  coward: 'aruetii',
  fast: 'fast',
  slow: 'slow',
  big: 'big',
  small: 'tiny',
  old: 'old',
  new: 'new',
  good: 'jate',
  bad: 'gar',
  evil: 'aruetii',
  holy: "jate'kyr'am",
  sacred: "jate'kyr'am",
  mortal: 'mortal',
  immortal: 'immortal',

  // 数词
  one: 'tome',
  two: 'tome',
  three: 'tome',
  four: 'tome',
  five: 'tome',
  many: 'cuyir',
  all: "obaani'yc",
  some: 'some',
  none: 'bat',

  // 地点
  here: 'ibic',
  there: 'ac',
};

// 翻译函数
function translateToMandalorian(text: string): string {
  if (!text) return '';

  const cleanText = text.toLowerCase().trim();
  const words = cleanText.split(/\s+/);

  return words
    .map((word) => {
      // 移除标点符号
      const cleanWord = word.replace(/[.,!?;:'"(){}[\]]/g, '');
      const punctuation = word.match(/[.,!?;:'"(){}[\]]$/)?.[0] || '';

      // 查找翻译
      let translation = MANDALORIAN_DICTIONARY[cleanWord];

      // 如果没有找到精确匹配，尝试部分匹配
      if (!translation) {
        for (const [key, value] of Object.entries(MANDALORIAN_DICTIONARY)) {
          if (cleanWord.includes(key) || key.includes(cleanWord)) {
            translation = value;
            break;
          }
        }
      }

      // 如果还是没有翻译，添加曼达洛语风格后缀
      if (!translation && cleanWord.length > 2) {
        const suffixes = ["'ad", "'yc", 'ir', 'gar', 'ba'];
        const randomSuffix =
          suffixes[Math.floor(Math.random() * suffixes.length)];
        translation = cleanWord + randomSuffix;
      }

      return (translation || word) + punctuation;
    })
    .join(' ');
}

// 处理标点符号和格式
function formatTranslation(text: string): string {
  // 添加曼达洛语特有的标点
  return text
    .replace(/\!/g, '! •')
    .replace(/\?/g, '? •')
    .replace(/\./g, '. •')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Mandalorian Translator API is running',
    timestamp: new Date().toISOString(),
    methods: ['GET', 'POST'],
  });
}

export async function POST(request: Request) {
  try {
    const { text, style = 'traditional' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    let translated = translateToMandalorian(text);

    // 根据风格调整输出
    if (style === 'traditional') {
      translated = formatTranslation(translated);
    } else if (style === 'minimal') {
      // 简化版本，减少标点
      translated = translated.replace(/[•]/g, '');
    }

    // 检测是否发生了实际翻译
    const isTranslated = translated !== text;

    return NextResponse.json({
      translated,
      original: text,
      isTranslated,
      message: isTranslated
        ? 'Translation successful'
        : 'Minimal changes made - text appears to be in target style',
      translator: {
        name: 'Mandalorian Translator',
        type: 'constructed',
      },
      style,
      language: "Mandalorian (Mando'a)",
      dialect: 'Traditional Mandalorian',
      culturalContext: {
        origin: 'Star Wars Universe',
        speakers: 'Mandalorian people',
        characteristics: 'Concise, practical, warrior-focused language',
        note: 'This is a constructed language based on Star Wars lore',
      },
    });
  } catch (error) {
    console.error('Mandalorian translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
