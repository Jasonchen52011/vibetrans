const fs = require('fs');
const path = require('path');

// navbar配置文件路径
const navbarConfigPath = './src/config/navbar-config.tsx';

// 读取翻译键
const translationKeys = require('./messages/marketing/en.json');

// routes.ts中定义但navbar中缺失的页面
const missingPages = [
  'ArabicTextGenerator',
  'AncientGreekTranslator',
  'CreeTranslator',
  'ElvishTranslator',
  'EmojiTranslator',
  'EsperantoTranslator',
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
  'SamoanTranslator',
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
  'TongaTranslator',
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
];

console.log('开始添加缺失的Translator页面到navbar...');

try {
  // 读取navbar配置文件
  const navbarConfig = fs.readFileSync(navbarConfigPath, 'utf8');

  // 查找funTranslate部分
  const funTranslateSectionStart = navbarConfig.indexOf('// {');
  const funTranslateSectionEnd = navbarConfig.indexOf('// },');

  if (funTranslateSectionStart === -1 || funTranslateSectionEnd === -1) {
    console.error('未找到funTranslate部分的插入位置');
    process.exit(1);
  }

  // 准备添加的页面配置
  const newPages = [];

  for (const page of missingPages) {
    // 检查页面文件是否存在
    if (
      !fs.existsSync(
        `./src/app/[locale]/(marketing)/(pages)/${page.toLowerCase()}`
      )
    ) {
      console.log(`页面 ${page} 的文件不存在，跳过`);
      continue;
    }

    // 检查messages文件是否存在
    if (!fs.existsSync(`./messages/pages/${page.toLowerCase()}`)) {
      console.log(`页面 ${page} 的messages文件不存在，跳过`);
      continue;
    }

    // 检查是否已经在navbar中
    const pageInNavbar = navbarConfig.includes(`items.${page}.title`);

    if (pageInNavbar) {
      console.log(`页面 ${page} 已经在navbar中，跳过`);
      continue;
    }

    // 生成页面配置
    const pageKey = `${page}Translator`;
    const titleKey = `languageTranslator.items.${pageKey}.title`;

    if (
      !translationKeys.RunicTranslatorPage ||
      !translationKeys.RunicTranslatorPage
    ) {
      console.log(`页面 ${page} 没有对应的翻译文件，使用默认标题`);
    }

    const title = translationKeys.RunicTranslatorPage?.[title] || pageKey;

    const pageConfig = `      title: t('${title}'),\\n        icon: getIconForPage(page),\\n        href: '/${page.toLowerCase()}',\\n        external: false,\\n      },`;

    newPages.push(pageConfig);
  }

  if (newPages.length > 0) {
    // 在funTranslate部分插入新页面
    const funTranslatePart1 = navbarConfig.substring(
      0,
      funTranslateSectionStart
    );
    const funTranslatePart2 = navbarConfig.substring(funTranslateSectionEnd);

    const updatedFunTranslatePart =
      funTranslatePart1 + newPages.join(',\\n    ') + '\\n    },';

    const updatedNavbarConfig =
      navbarConfig.substring(0, funTranslateSectionStart) +
      updatedFunTranslatePart +
      navbarConfig.substring(funTranslateSectionEnd);

    // 写回navbar配置文件
    fs.writeFileSync(navbarConfigPath, updatedNavbarConfig, 'utf8');

    console.log(`成功添加 ${newPages.length} 个页面到navbar配置中`);
    console.log('添加的页面:', newPages.join(', '));
  } else {
    console.log('没有新的页面需要添加到navbar');
  }
} catch (error) {
  console.error('添加页面到navbar时出错:', error);
  process.exit(1);
}

// 根据页面名称获取对应图标的辅助函数
function getIconForPage(pageName) {
  const iconMap = {
    ArabicTextGenerator: '<FileTextIcon className="size-4 shrink-0" />',
    AncientGreekTranslator: '<SquarePenIcon className="size-4 shrink-0" />',
    CreeTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ElvishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    EmojiTranslator: '<SmileIcon className="size-4 shrink-0" />',
    EsperantoTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
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
    SamoanTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
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
    SwahiliTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    SwedishTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TagalogTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TajikTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TamilTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TatarTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TeluguTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    ThaiTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TibetanTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TigrinyaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
    TongaTranslator: '<LanguagesIcon className="size-4 shrink-0" />',
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
  };

  return iconMap[pageName] || '<LanguagesIcon className="size-4 shrink-0" />';
}
