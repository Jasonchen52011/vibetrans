import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const lowerText = text.toLowerCase().trim();

    // 扩展的英纳翻译词典
    const translations: Record<string, string> = {
      // 英文到纳瓦特尔语
      hello: 'niltze',
      hi: 'niltze',
      goodbye: 'ka ta',
      bye: 'ka ta',
      'thank you': 'tlazohcamati',
      thanks: 'tlazohcamati',
      yes: 'quema',
      no: 'ahmo',
      water: 'atl',
      fire: 'tletl',
      earth: 'tlalticpac',
      sun: 'tonatiuh',
      moon: 'metztli',
      house: 'calli',
      home: 'calli',
      friend: 'icniuhtli',
      family: 'cualtinemitl',
      love: 'tlazotla',
      peace: 'paz',
      corn: 'cintli',
      flower: 'xochitl',
      flowers: 'xochitl',
      food: 'tlakualiztli',
      language: 'tlahtolli',
      day: 'tonal',
      night: 'yohualli',
      sky: 'ilhuicatl',
      star: 'citlalin',
      stars: 'citlalin',
      rain: 'quiahuitl',
      wind: 'ehecatl',
      heart: 'yollotl',
      spirit: 'yoliliztli',
      warrior: 'yaoquizqueh',
      king: 'tlatoani',
      queen: 'cihuatl',
      woman: 'cihuatl',
      man: 'oquichtli',
      child: 'piltontli',
      children: 'piltomeh',
      mother: 'nantli',
      father: 'tahtli',
      good: 'cualli',
      bad: 'ahuac',
      big: 'hueyi',
      large: 'hueyi',
      small: 'piltzintli',
      little: 'piltzintli',
      beautiful: 'cuicatl',
      pretty: 'cuicatl',
      strong: 'chicahua',
      powerful: 'chicahua',
      wisdom: 'tlamatiliztli',
      knowledge: 'ixtlamachiliztli',
      life: 'yoliztli',
      death: 'miquiztli',
      time: 'cahuitl',
      world: 'tlalticpac',
      god: 'teotl',
      gods: 'teteo',
      music: 'cuicatl',
      song: 'cuicatl',
      dance: 'inahuac',
      road: 'otli',
      path: 'otli',
      mountain: 'tepetl',
      mountains: 'tepetl',
      river: 'atlauh',
      tree: 'cuahuitl',
      trees: 'cuahuitl',
      stone: 'tetl',
      stones: 'tetl',
      gold: 'teocuitlatl',
      silver: 'iztac teocuitlatl',
      bird: 'tototl',
      birds: 'tototl',
      dog: 'chichi',
      dogs: 'chichimeh',
      snake: 'coatl',
      snakes: 'coameh',
      eagle: 'cuauhtli',
      eagles: 'cuauhtin',
      jaguar: 'ocelotl',
      jaguars: 'ocelomeh',
      war: 'yaochihualiztli',
      peace: 'paz',
      victory: 'yancuiciztli',
      defeat: 'ahmo yancuiztli',
      hope: 'yollotlaliztli',
      dream: 'temictli',
      dreams: 'temixtli',
      truth: 'neltiliztli',
      lie: 'neltiliztli ahmo',
      light: 'tlahuializtli',
      darkness: 'yohualli',
      morning: 'tlahuiztli',
      evening: 'yohualtequi',
      today: 'axcanchitzin',
      tomorrow: 'moyauh',
      yesterday: 'yohualnepantla',
      here: 'niccan',
      there: 'ampa',
      with: 'itech',
      without: 'ahmo itech',
      and: 'auh',
      or: 'nozo',
      but: 'zan',
      if: 'intla',
      when: 'canah',
      where: 'canin',
      who: 'aquin',
      what: 'tlein',
      why: 'tleh',
      how: 'quinin',
      this: 'inin',
      that: 'inon',
      I: 'neh',
      you: 'tehhuatl',
      he: 'yehhuatl',
      she: 'yehhuatl',
      we: 'tehuantin',
      they: 'yehhuantin',
      my: 'no',
      your: 'mo',
      his: 'in',
      her: 'in',
      our: 'to',
      their: 'in',
      me: 'nech',
      you: 'tech',
      him: 'cch',
      her: 'cch',
      us: 'tech',
      them: 'quim',
      come: 'hualauh',
      go: 'yauh',
      see: 'itta',
      hear: 'quita',
      speak: 'tlatoa',
      eat: 'qua',
      drink: 'ahuia',
      sleep: 'cochi',
      wake: 'quiz',
      live: 'chihua',
      die: 'miqui',
      laugh: 'choca',
      cry: 'choca',
      sing: 'cuica',
      dance: 'nemi',
      run: 'pata',
      walk: 'yauh',
      sit: 'monextiz',
      stand: 'mocuipa',
      give: 'maca',
      take: 'cui',
      make: 'chihua',
      do: 'chihua',
      have: 'pia',
      want: 'neki',
      need: 'pialo',
      like: 'quipiya',
      love: 'tlazohtla',
      hate: 'ahmo tlazohtla',
      know: 'mati',
      think: 'tlahuitia',
      believe: 'tlacamatili',
      remember: 'machiliz',
      forget: 'ahmo machiliz',
      learn: 'tlamatiz',
      teach: 'tlamachtili',
      work: 'tlacatli',
      play: 'pahuia',
      fight: 'yaoyotia',
      help: 'palehuiz',
      helps: 'palehuiz',
      helped: 'opaleuh',
      'will help': 'tlapalehuiz',
      new: 'yancuic',
      old: 'huehue',
      young: 'piltontli',
      ancient: 'huehue',
      modern: 'yancuic',
      red: 'chichiltic',
      blue: 'xoxotic',
      green: 'xoxotic',
      yellow: 'cozactic',
      black: 'tliltic',
      white: 'iztac',
      first: 'yancuic',
      last: 'cuahuitl',
      best: 'cualli',
      worst: 'ahuac',
      more: 'occe',
      less: 'achi',
      all: 'mochi',
      nothing: 'ahmo tlein',
      something: 'tlein',
      everything: 'mochi',
      always: 'nelmantic',
      never: 'ahmo nelmantic',
      sometimes: 'achin tinemi',
      now: 'axcan',
      then: 'ihquin',
      later: 'mochipa',
      soon: 'ahcic',
      fast: 'ahcic',
      slow: 'ahcic ahmo',
      hot: 'yahualli',
      cold: 'cectli',
      warm: 'yahualli achi',
      cool: 'cectli achi',
      hard: 'chicahuac',
      soft: 'paltic',
      heavy: 'chicahuac',
      light: 'paltic',
      wet: 'atlactic',
      dry: 'ahmo atlantic',
      clean: 'paztli',
      dirty: 'ahmo paztli',
      rich: 'tecuani',
      poor: 'ahmo tecuani',
      healthy: 'cualli',
      sick: 'ahmo cualli',
      happy: 'cualli',
      sad: 'ahmo cualli',
      angry: 'ahmo cualli',
      afraid: 'mahuilti',
      brave: 'chicahua',
      coward: 'ahmo chicahua',
      smart: 'matini',
      stupid: 'ahmo matini',
      beautiful: 'cuicatl',
      ugly: 'ahmo cuicatl',
      strong: 'chicahua',
      weak: 'ahmo chicahua',
      fast: 'ahcic',
      slow: 'ahcic ahmo',
      early: 'temachtia',
      late: 'ahcic',
      right: 'cualli',
      wrong: 'ahmo cualli',
      true: 'nelli',
      false: 'ahmo nelli',
      real: 'nelli',
      fake: 'ahmo nelli',
      important: 'pactia',
      unimportant: 'ahmo pactia',
      easy: 'pahuia',
      difficult: 'ahmo pahuia',
      possible: 'miquiz',
      impossible: 'ahmo miquiz',
      certain: 'miquiz',
      uncertain: 'ahmo miquiz',
      sure: 'miquiz',
      unsure: 'ahmo miquiz',
    };

    // 检测输入语言并翻译
    function translateText(inputText: string): string {
      const words = inputText.toLowerCase().split(/\s+/);
      const translatedWords: string[] = [];

      for (const word of words) {
        // 移除标点符号进行翻译
        const cleanWord = word.replace(/[.,!?;:'""()]/g, '');
        const punctuation = word.match(/[.,!?;:'""()]$/)?.[0] || '';

        let translatedWord = cleanWord;

        // 直接查找翻译
        if (translations[cleanWord]) {
          translatedWord = translations[cleanWord];
        } else {
          // 尝试匹配词根（简化词形）
          const rootWords = Object.keys(translations).filter(
            (key) => cleanWord.includes(key) || key.includes(cleanWord)
          );

          if (rootWords.length > 0) {
            // 选择最短的匹配（通常是最准确的）
            translatedWord =
              translations[
                rootWords.reduce((a, b) => (a.length < b.length ? a : b))
              ];
          } else {
            // 如果没有匹配，创建一个纳瓦特尔语风格的变化
            translatedWord = generateNahuatlStyle(cleanWord);
          }
        }

        translatedWords.push(translatedWord + punctuation);
      }

      return translatedWords.join(' ');
    }

    // 生成纳瓦特尔语风格的词汇变化
    function generateNahuatlStyle(word: string): string {
      // 纳瓦特尔语常见的后缀和变化模式
      const suffixes = [
        '-tl',
        '-tli',
        '-li',
        '-liztli',
        '-ton',
        '-tin',
        '-tzin',
        '-pil',
      ];
      const prefixes = ['te-', 'tl-', 'xochi-', 'cual-', 'ahuia-'];

      // 如果词很短，添加前缀
      if (word.length <= 3) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + word + 'tl';
      }

      // 如果词很长，只添加后缀
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return word + suffix;
    }

    const translated = translateText(text);

    return NextResponse.json({ translated });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
