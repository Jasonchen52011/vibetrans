const fs = require('fs');

// 当前routes.ts中定义的Translator页面
const currentTranslatorPages = {
  // Fun Translate (不是语言翻译的)
  funTranslator: [
    'DogTranslator',
    'GenZTranslator',
    'GenAlphaTranslator',
    'DumbItDownAI',
    'BadTranslator',
    'BabyTranslator',
    'GibberishTranslator',
    'AlienTextGenerator',
    'VerboseGenerator',
    'PigLatinTranslator',
    'MinionTranslator',
    'BaybayinTranslator',
    'SamoanToEnglishTranslator',
    'NahuatlTranslator',
    'GasterTranslator',
    'HighValyrianTranslator',
    'AramaicTranslator',
  ],

  // Language Translator (真正的语言翻译工具)
  languageTranslator: [
    'AncientGreekTranslator',
    'AlBhedTranslator',
    'CuneiformTranslator',
    'EsperantoTranslator',
    'IvrTranslator',
    'AlbanianToEnglish',
    'CreoleToEnglishTranslator',
    'CantoneseTranslator',
    'ChineseToEnglishTranslator',
    'EnglishToAmharicTranslator',
    'EnglishToSwahiliTranslator',
    'SwahiliToEnglishTranslator',
    'MiddleEnglishTranslator',
    'ArabicTextGenerator',
    'ArabicToEnglishTranslator',
    'CreeTranslator',
    'ElvishTranslator',
    'EmojiTranslator',
    'FarsiTranslator',
    'FinnishTranslator',
    'FrenchTranslator',
    'GalicianTranslator',
    'GeorgianTranslator',
    'GermanTranslator',
    'GreekTranslator',
    'GujaratiTranslator',
    'HawaiianTranslator',
    'HebrewTranslator',
    'HindiTranslator',
    'HmongTranslator',
    'HungarianTranslator',
    'IcelandicTranslator',
    'IgboTranslator',
    'IndonesianTranslator',
    'InuktitutTranslator',
    'IrishTranslator',
    'ItalianTranslator',
    'JapaneseTranslator',
    'JavaneseTranslator',
    'KannadaTranslator',
    'KazakhTranslator',
    'KhmerTranslator',
    'KinyarwandaTranslator',
    'KoreanTranslator',
    'KurdishTranslator',
    'LaoTranslator',
    'LatinTranslator',
    'LatvianTranslator',
    'LithuanianTranslator',
    'LuxembourgishTranslator',
    'MacedonianTranslator',
    'MalagasyTranslator',
    'MalayalamTranslator',
    'MalteseTranslator',
    'MaoriTranslator',
    'MarathiTranslator',
    'MongolianTranslator',
    'MyanmarTranslator',
    'NepaliTranslator',
    'NorwegianTranslator',
    'OdiaTranslator',
    'OromoTranslator',
    'PashtoTranslator',
    'PersianTranslator',
    'PolishTranslator',
    'PortugueseTranslator',
    'PunjabiTranslator',
    'RomanianTranslator',
    'RussianTranslator',
    'ScottishGaelicTranslator',
    'SerbianTranslator',
    'SesothoTranslator',
    'ShonaTranslator',
    'SindhiTranslator',
    'SlovakTranslator',
    'SlovenianTranslator',
    'SomaliTranslator',
    'SoraniTranslator',
    'SpanishTranslator',
    'SundaneseTranslator',
    'SwahiliTranslator',
    'SwedishTranslator',
    'TagalogTranslator',
    'TajikTranslator',
    'TamilTranslator',
    'TatarTranslator',
    'TeluguTranslator',
    'ThaiTranslator',
    'TibetanTranslator',
    'TigrinyaTranslator',
    'TonganTranslator',
    'TurkishTranslator',
    'UkrainianTranslator',
    'UrduTranslator',
    'UyghurTranslator',
    'UzbekTranslator',
    'VietnameseTranslator',
    'WelshTranslator',
    'WolofTranslator',
    'XhosaTranslator',
    'YiddishTranslator',
    'YorubaTranslator',
    'ZhuangTranslator',
    'ZuluTranslator',
  ],

  // Special Translate (字符/符号转换)
  specialTranslator: ['RuneTranslator', 'RunicTranslator'],
};

console.log('开始重新组织navbar分类...');

// 读取当前navbar配置
let navbarConfig;
try {
  navbarConfig = fs.readFileSync('./src/config/navbar-config.tsx', 'utf8');
} catch (error) {
  console.error('读取navbar配置文件失败:', error);
  process.exit(1);
}

// 重新组织分类
const newConfig = reorganizeNavbar(navbarConfig);

// 写回navbar配置文件
try {
  fs.writeFileSync('./src/config/navbar-config.tsx', newConfig, 'utf8');
  console.log('✅ 成功重新组织navbar分类');
  console.log('\n🎮 Fun Translate分类 (非语言翻译):');
  currentTranslatorPages.funTranslator.forEach((page) => {
    console.log(`  - ${page}`);
  });
  console.log('\n🌐 Language Translator分类 (语言翻译):');
  currentTranslatorPages.languageTranslator.forEach((page) => {
    console.log(`  - ${page}`);
  });
  console.log('\n✨ Special Translate分类 (字符/符号转换):');
  currentTranslatorPages.specialTranslator.forEach((page) => {
    console.log(`  - ${page}`);
  });
} catch (error) {
  console.error('写入navbar配置文件失败:', error);
  process.exit(1);
}

function reorganizeNavbar(navbarContent) {
  // 查找各个分类部分
  const funTranslateStart = navbarContent.indexOf('// {');
  const funTranslateEnd = navbarContent.indexOf('// },');

  const languageTranslateStart = navbarContent.indexOf('// {');
  const languageTranslateEnd = navbarContent.indexOf('// },');

  // 构建新的分类
  const newFunTranslateItems = [];
  const newLanguageTranslateItems = [];
  const newSpecialTranslateItems = [];

  // 处理Fun Translate分类
  if (funTranslateStart !== -1 && funTranslateEnd !== -1) {
    const funTranslateSection = navbarContent.substring(
      funTranslateStart,
      funTranslateEnd
    );

    // 保留现有的Fun Translate项目
    const existingFunItems = extractItemsFromSection(funTranslateSection);

    // 添加新的Fun Translate项目
    currentTranslatorPages.funTranslator.forEach((pageName) => {
      if (existingFunItems.some((item) => item.includes(pageName))) {
        console.log(`页面 ${pageName} 已在Fun Translate中`);
      } else {
        const itemConfig = `        {
          title: t('funTranslate.items.${pageName.toLowerCase()}.title'),
          icon: getIconForPage(pageName),
          href: Routes.${pageName} || \`/\${pageName.toLowerCase()}\`,
          external: false,
        },`;
        newFunTranslateItems.push(itemConfig);
      }
    });
  }

  // 处理Language Translator分类
  if (languageTranslateStart !== -1 && languageTranslateEnd !== -1) {
    const languageTranslateSection = navbarContent.substring(
      languageTranslateStart,
      languageTranslateEnd
    );

    // 保留现有的Language Translator项目
    const existingLanguageItems = extractItemsFromSection(
      languageTranslateSection
    );

    // 添加新的Language Translator项目
    currentTranslatorPages.languageTranslator.forEach((pageName) => {
      if (existingLanguageItems.some((item) => item.includes(pageName))) {
        console.log(`页面 ${pageName} 已在Language Translator中`);
      } else {
        const itemConfig = `        {
          title: t('languageTranslator.items.${pageName.toLowerCase()}.title'),
          icon: getIconForPage(pageName),
          href: Routes.${pageName} || \`/\${pageName.toLowerCase()}\`,
          external: false,
        },`;
        newLanguageTranslateItems.push(itemConfig);
      }
    });
  }

  // 构建完整的new navbar配置
  const beforeFunTranslate = navbarContent.substring(0, funTranslateStart);
  const afterLanguageTranslate = navbarContent.substring(languageTranslateEnd);

  const newFunTranslateSection = `    // Fun Translate (非语言翻译)
      items: [
${newFunTranslateItems.join(',\n        ')}
      ],`;

  const newLanguageTranslateSection = `    // Language Translator (真正的语言翻译)
      items: [
${newLanguageTranslateItems.join(',\n        ')}
      ],`;

  // Special Translate部分保持不变（如果存在的话）
  const specialTranslateStart = navbarContent.indexOf('// {');
  const specialTranslateEnd = navbarContent.indexOf('// },');
  let specialTranslateSection = '';

  if (specialTranslateStart !== -1 && specialTranslateEnd !== -1) {
    specialTranslateSection = navbarContent.substring(
      specialTranslateStart,
      specialTranslateEnd
    );
  }

  // 重新构建配置
  const newConfig =
    beforeFunTranslate +
    newFunTranslateSection +
    ',\n' +
    newLanguageTranslateSection +
    specialTranslateSection +
    afterLanguageTranslate;

  return newConfig;
}

function extractItemsFromSection(sectionContent) {
  const items = [];
  const lines = sectionContent
    .split('\n')
    .filter((line) => line.trim().startsWith('title:'));

  lines.forEach((line) => {
    if (line.includes('title:')) {
      items.push(line);
    }
  });

  return items;
}

function getIconForPage(pageName) {
  // 简单的图标映射，可以根据需要扩展
  const iconMap = {
    ArabicTextGenerator: '<FileTextIcon className="size-4 shrink-0" />',
    AncientGreekTranslator: '<SquarePenIcon className="size-4 shrink-0" />',
    CreeTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ElvishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    EmojiTranslator: '<SmileIcon className="size-4 shrink-0" />',
    FarsiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    FinnishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    FrenchTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GalicianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GeorgianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GermanTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GreekTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GujaratiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    HawaiianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    HebrewTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    HindiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    HmongTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    HungarianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    IcelandicTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    IgboTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    IndonesianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    InuktitutTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    IrishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ItalianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    JapaneseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    JavaneseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KannadaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KazakhTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KhmerTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KinyarwandaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KoreanTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    KurdishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    LaoTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    LatinTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    LatvianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    LithuanianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    LuxembourgishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MacedonianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MalagasyTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MalayalamTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MalteseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MaoriTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MarathiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MongolianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    MyanmarTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    NepaliTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    NorwegianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    OdiaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    OromoTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    PashtoTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    PersianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    PolishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    PortugueseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    PunjabiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    RomanianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    RussianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ScottishGaelicTranslator: '<ThumbsUpIcon className="size-4 shrink-0" />',
    SerbianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SesothoTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ShonaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SindhiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SlovakTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SlovenianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SomaliTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SoraniTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SpanishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SundaneseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SwedishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TagalogTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TajikTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TamilTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TatarTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TeluguTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ThaiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TibetanTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TigrinyaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TonganTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TurkishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    UkrainianTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    UrduTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    UyghurTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    UzbekTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    VietnameseTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    WelshTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    WolofTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    XhosaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    YiddishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    YorubaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ZhuangTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ZuluTranslator: '<LanguagesIcon className="size-4 shrink-0" />',

    // Fun Translate (现有的)
    DogTranslator: '<DogIcon className="size-4 shrink-0" />',
    GenZTranslator: '<MessageCircleIcon className="size-4 shrink-0" />',
    GenAlphaTranslator: '<FlameIcon className="size-4 shrink-0" />',
    DumbItDownAI: '<WandSparklesIcon className="size-4 shrink-0" />',
    BadTranslator: '<FlameIcon className="size-4 shrink-0" />',
    BabyTranslator: '<AudioLinesIcon className="size-4 shrink-0" />',
    GibberishTranslator: '<WandSparklesIcon className="size-4 shrink-0" />',
    AlienTextGenerator: '<RocketIcon className="size-4 shrink-0" />',
    VerboseGenerator: '<WandSparklesIcon className="size-4 shrink-0" />',
    PigLatinTranslator: '<SmileIcon className="size-4 shrink-0" />',
    MinionTranslator: '<MessageCircleIcon className="size-4 shrink-0" />',
    BaybayinTranslator: '<FeatherIcon className="size-4 shrink-0" />',
    SamoanToEnglishTranslator: '<GlobeIcon className="size-4 shrink-0" />',
    NahuatlTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    GasterTranslator: '<EyeIcon className="size-4 shrink-0" />',
    HighValyrianTranslator: '<CrownIcon className="size-4 shrink-0" />',
    AramaicTranslator: '<ScrollTextIcon className="size-4 shrink-0" />',

    // Special Translate
    RuneTranslator: '<SparklesIcon className="size-4 shrink-0" />',
    RunicTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
  };

  return iconMap[pageName] || '<LanguagesIcon className="size-4 shrink-0" />';
}
