import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Mandalorian (Mando'a) 翻译映射
const mandalorianTranslations: { [key: string]: string } = {
  // 常用英语到Mando'a
  'hello': 'Su cuy\'gar',
  'hi': 'Su cuy\'gar',
  'hey': 'Su cuy\'gar',
  'goodbye': 'Ner jorhaa\'i',
  'bye': 'Ner jorhaa\'i',
  'yes': 'uyan',
  'no': 'me\'vaar',
  'thank you': 'cuy\'ir gar',
  'thanks': 'cuy\'ir gar',
  'please': 'copad',
  'sorry': 'Ner copad',
  'welcome': 'Alderaan',
  'good': 'jate',
  'bad': 'ruh',
  'great': 'bal',
  'small': 'boc',
  'big': 'ged',
  'help': 'cuyir gar',
  'love': 'cuyir',
  'hate': 'ruh',
  'friend': 'burc\'ya',
  'enemy': 'duru',
  'war': 'darasuum',
  'peace': 'ru\'besh',
  'home': 'briikase',
  'family': 'aliit',
  'child': 'ad',
  'man': 'verd',
  'woman': 'verda',
  'person': 'verde',
  'people': 'verde',
  'star': 'munit',
  'sun': 'taad',
  'moon': 'luna',
  'sky': 'cuyan',
  'earth': 'gal',
  'water': 'dalab',
  'fire': 'ratiin',
  'wind': 'kaas',
  'life': 'ba\'jur\'a',
  'death': 'mokita',
  'hope': 'bal\'jor',
  'fear': 'kandosii',
  'courage': 'bacaj',
  'strength': 'kandosii',
  'wisdom': 'briikase',
  'knowledge': 'bacaj',
  'power': 'kaanet',
  'force': 'kaanet',
  'light': 'taad',
  'dark': 'dol',
  'day': 'taad',
  'night': 'luna',
  'morning': 'taad',
  'evening': 'luna',
  'today': 'taad',
  'tomorrow': 'taad',
  'yesterday': 'taad',
  'now': 'jii',
  'then': 'jii',
  'here': 'jaha',
  'there': 'jaha',
  'this': 'val',
  'that': 'val',
  'these': 'val',
  'those': 'val',
  'what': 'val',
  'when': 'jii',
  'where': 'jaha',
  'why': 'jii',
  'how': 'jii',
  'who': 'val',
  'come': 'jii',
  'go': 'jii',
  'see': 'jii',
  'hear': 'jii',
  'speak': 'jii',
  'eat': 'jii',
  'drink': 'jii',
  'sleep': 'jii',
  'work': 'jii',
  'play': 'jii',
  'fight': 'jii',
  'learn': 'jii',
  'teach': 'jii',
  'give': 'jii',
  'take': 'jii',
  'make': 'jii',
  'do': 'jii',
  'be': 'jii',
  'have': 'jii',
  'know': 'bacaj',
  'think': 'bacaj',
  'feel': 'cuyir',
  'want': 'cuyir',
  'need': 'cuyir',
  'like': 'cuyir',
  'believe': 'bacaj',
  'remember': 'bacaj',
  'forget': 'me\'vaar',
  'create': 'cuyir',
  'destroy': 'ruh',
  'build': 'cuyir',
  'break': 'ruh',
  'open': 'cuyir',
  'close': 'me\'vaar',
  'begin': 'cuyir',
  'end': 'me\'vaar',
  'start': 'cuyir',
  'stop': 'me\'vaar',
  'continue': 'jii',
  'finish': 'me\'vaar',
  'change': 'jii',
  'stay': 'jii',
  'leave': 'me\'vaar',
  'return': 'jii',
  'win': 'bal',
  'lose': 'me\'vaar',
  'try': 'jii',
  'fail': 'me\'vaar',
  'succeed': 'bal',
  'win': 'bal',
  'lose': 'me\'vaar',
  'try': 'jii',
  'fail': 'me\'vaar',
  'succeed': 'bal',
  'always': 'jii',
  'never': 'me\'vaar',
  'sometimes': 'jii',
  'only': 'val',
  'just': 'val',
  'also': 'jii',
  'too': 'jii',
  'very': 'jate',
  'really': 'jate',
  'almost': 'jii',
  'quite': 'jate',
  'rather': 'jate',
  'quite': 'jate',
  'enough': 'val',
  'too much': 'jii',
  'little': 'boc',
  'few': 'boc',
  'many': 'ged',
  'more': 'ged',
  'less': 'boc',
  'some': 'val',
  'all': 'val',
  'every': 'val',
  'each': 'val',
  'any': 'val',
  'both': 'val',
  'either': 'val',
  'neither': 'me\'vaar',
  'one': 'tome',
  'two': 'dome',
  'three': 'dome',
  'four': 'dome',
  'five': 'dome',
  'six': 'dome',
  'seven': 'dome',
  'eight': 'dome',
  'nine': 'dome',
  'ten': 'dome',
  'hundred': 'dome',
  'thousand': 'dome',
  'million': 'ged',
  'billion': 'ged',
  'first': 'val',
  'second': 'val',
  'third': 'val',
  'last': 'val',
  'new': 'bal',
  'old': 'ruh',
  'young': 'boc',
  'ancient': 'ruh',
  'modern': 'bal',
  'important': 'jate',
  'useful': 'jate',
  'useless': 'ruh',
  'necessary': 'cuyir',
  'possible': 'cuyir',
  'impossible': 'me\'vaar',
  'easy': 'val',
  'difficult': 'jate',
  'hard': 'jate',
  'soft': 'val',
  'hard': 'jate',
  'hot': 'jate',
  'cold': 'ruh',
  'warm': 'val',
  'cool': 'val',
  'dry': 'ruh',
  'wet': 'val',
  'clean': 'val',
  'dirty': 'ruh',
  'pure': 'val',
  'rich': 'ged',
  'poor': 'ruh',
  'expensive': 'ged',
  'cheap': 'ruh',
  'free': 'val',
  'busy': 'jii',
  'free': 'val',
  'empty': 'ruh',
  'full': 'ged',
  'open': 'val',
  'closed': 'me\'vaar',
  'near': 'jii',
  'far': 'jii',
  'close': 'jii',
  'far': 'jii',
  'above': 'jii',
  'below': 'jii',
  'inside': 'jii',
  'outside': 'jii',
  'between': 'jii',
  'among': 'jii',
  'around': 'jii',
  'about': 'jii',
  'through': 'jii',
  'across': 'jii',
  'along': 'jii',
  'against': 'jii',
  'with': 'jii',
  'without': 'me\'vaar',
  'for': 'jii',
  'during': 'jii',
  'since': 'jii',
  'until': 'jii',
  'before': 'jii',
  'after': 'jii',
  'while': 'jii',
  'because': 'jii',
  'if': 'jii',
  'unless': 'me\'vaar',
  'when': 'jii',
  'where': 'jaha',
  'how': 'jii',
  'what': 'val',
  'which': 'val',
  'who': 'val',
  'whom': 'val',
  'whose': 'val',
  'that': 'val',
  'this': 'val',
  'these': 'val',
  'those': 'val',
  'I': 'ni',
  'you': 'oy',
  'he': 'verde',
  'she': 'verda',
  'it': 'val',
  'we': 'mhi',
  'you': 'oy',
  'they': 'val',
  'my': 'ni',
  'your': 'oy',
  'his': 'verde',
  'her': 'verda',
  'its': 'val',
  'our': 'mhi',
  'your': 'oy',
  'their': 'val',
  'mine': 'ni',
  'yours': 'oy',
  'his': 'verde',
  'hers': 'verda',
  'its': 'val',
  'ours': 'mhi',
  'yours': 'oy',
  'theirs': 'val',
  'me': 'ni',
  'you': 'oy',
  'him': 'verde',
  'her': 'verda',
  'it': 'val',
  'us': 'mhi',
  'you': 'oy',
  'them': 'val',
  'myself': 'ni',
  'yourself': 'oy',
  'himself': 'verde',
  'herself': 'verda',
  'itself': 'val',
  'ourselves': 'mhi',
  'yourselves': 'oy',
  'themselves': 'val'
};

// 反向翻译映射
const englishTranslations: { [key: string]: string } = {};
for (const [english, mandalorian] of Object.entries(mandalorianTranslations)) {
  englishTranslations[mandalorian] = english;
}

function translateToMandalorian(text: string): string {
  // 将文本转换为小写进行匹配
  const lowerText = text.toLowerCase();

  // 简单的词汇替换
  let result = text;

  // 按长度排序，优先匹配更长的词
  const sortedKeys = Object.keys(mandalorianTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, mandalorianTranslations[key]);
  }

  // 保持标点符号
  return result;
}

function translateToEnglish(text: string): string {
  // 将文本转换为小写进行匹配
  const lowerText = text.toLowerCase();

  // 简单的词汇替换
  let result = text;

  // 按长度排序，优先匹配更长的词
  const sortedKeys = Object.keys(englishTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, englishTranslations[key]);
  }

  // 保持标点符号
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, inputType = 'text', direction = 'to-mandalorian' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let translated: string;
    let detectedDirection = direction;

    if (direction === 'to-mandalorian' || direction === 'english-to-mandalorian') {
      translated = translateToMandalorian(text);
      detectedDirection = 'english-to-mandalorian';
    } else if (direction === 'to-english' || direction === 'mandalorian-to-english') {
      translated = translateToEnglish(text);
      detectedDirection = 'mandalorian-to-english';
    } else {
      // 自动检测方向
      // 简单的启发式方法：检查是否包含已知Mando'a词汇
      const hasMandalorianWords = Object.keys(englishTranslations).some(word =>
        text.toLowerCase().includes(word)
      );

      if (hasMandalorianWords) {
        translated = translateToEnglish(text);
        detectedDirection = 'mandalorian-to-english';
      } else {
        translated = translateToMandalorian(text);
        detectedDirection = 'english-to-mandalorian';
      }
    }

    return NextResponse.json({
      translated,
      original: text,
      inputType,
      direction: detectedDirection,
      message: 'Translation successful',
      detectedInputLanguage: detectedDirection === 'english-to-mandalorian' ? 'english' : 'mandalorian'
    });

  } catch (error) {
    console.error('Mandalorian translator error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mandalorian Translator API - Mando\'a draay\'!',
    description: 'Translate between English and Mandalorian (Mando\'a)',
    usage: {
      endpoint: '/api/mandalorian-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction: 'to-mandalorian | to-english | auto (optional, default: auto)'
      }
    }
  });
}