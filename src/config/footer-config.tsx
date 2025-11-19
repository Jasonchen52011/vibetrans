import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';

type FooterLink = {
  key: string;
  route: Routes | string;
  external?: boolean;
  // 页面独立的翻译命名空间，用于引用页面自己的 title
  // 例如: "MorseCodeTranslatorPage" 会读取该页面的 title
  pageNamespace?: string;
};

const FUN_FOOTER_LINKS: FooterLink[] = [
  { key: 'alienTextGenerator', route: Routes.AlienTextGenerator },
  { key: 'babyTranslator', route: Routes.BabyTranslator },
  { key: 'badTranslator', route: Routes.BadTranslator },
  { key: 'dogTranslator', route: Routes.DogTranslator },
  { key: 'dumbItDown', route: Routes.DumbItDownAI },
  { key: 'genAlphaTranslator', route: Routes.GenAlphaTranslator },
  { key: 'genZTranslator', route: Routes.GenZTranslator },
  { key: 'gibberishTranslator', route: Routes.GibberishTranslator },
  { key: 'numbersToLetters', route: Routes.NumbersToLetters },
  { key: 'pigLatinTranslator', route: Routes.PigLatinTranslator },
  { key: 'pirateTranslator', route: Routes.PirateTranslator },
  { key: 'shakespeareanTranslator', route: Routes.ShakespeareanTranslator },
  { key: 'verboseGenerator', route: Routes.VerboseGenerator },
];

const GAME_FOOTER_LINKS: FooterLink[] = [
  { key: 'alBhedTranslator', route: Routes.AlBhedTranslator },
  { key: 'dragonLanguageTranslator', route: Routes.DragonLanguageTranslator },
  { key: 'draconicTranslator', route: Routes.DraconicTranslator },
  { key: 'drowTranslator', route: Routes.DrowTranslator },
  { key: 'gasterTranslator', route: Routes.GasterTranslator },
  { key: 'highValyrianTranslator', route: Routes.HighValyrianTranslator },
  { key: 'mandalorianTranslator', route: Routes.MandalorianTranslator },
  { key: 'minionTranslator', route: Routes.MinionTranslator },
  { key: 'runeTranslator', route: Routes.RuneTranslator },
  { key: 'runicTranslator', route: Routes.RunicTranslator },
  { key: 'wingdingsTranslator', route: Routes.WingdingsTranslator },
  { key: 'yodaTranslator', route: Routes.YodaTranslator },
];

const TOOL_FOOTER_LINKS: FooterLink[] = [
  { key: 'binaryTranslator', route: Routes.BinaryTranslator },
  { key: 'ivrTranslator', route: Routes.IvrTranslator },
  {
    key: 'morseCodeTranslator',
    route: Routes.MorseCodeTranslator,
    pageNamespace: 'MorseCodeTranslatorPage'
  },
  { key: 'brailleTranslator', route: Routes.BrailleTranslator },
];

const HIDDEN_LANGUAGE_FOOTER = new Set([
  'englishToChineseTranslator',
  'englishToPersianTranslator',
  'japaneseToEnglishTranslator',
]);

const LANGUAGE_FOOTER_LINKS: FooterLink[] = [
  { key: 'albanianToEnglish', route: Routes.AlbanianToEnglish },
  { key: 'ancientGreekTranslator', route: Routes.AncientGreekTranslator },
  { key: 'aramaicTranslator', route: Routes.AramaicTranslator },
  { key: 'baybayinTranslator', route: Routes.BaybayinTranslator },
  { key: 'cantoneseTranslator', route: Routes.CantoneseTranslator },
  { key: 'creoleToEnglishTranslator', route: Routes.CreoleToEnglishTranslator },
  { key: 'cuneiformTranslator', route: Routes.CuneiformTranslator },
  {
    key: 'englishToAmharicTranslator',
    route: Routes.EnglishToAmharicTranslator,
  },
  { key: 'englishToPolishTranslator', route: Routes.EnglishToPolishTranslator },
  {
    key: 'englishToSwahiliTranslator',
    route: Routes.EnglishToSwahiliTranslator,
  },
  { key: 'esperantoTranslator', route: Routes.EsperantoTranslator },
  { key: 'greekTranslator', route: Routes.GreekTranslator },
  { key: 'haitianCreoleTranslator', route: Routes.HaitianCreoleTranslator },
  { key: 'mangaTranslator', route: Routes.MangaTranslator },
  { key: 'middleEnglishTranslator', route: Routes.MiddleEnglishTranslator },
  { key: 'nahuatlTranslator', route: Routes.NahuatlTranslator },
  { key: 'oghamTranslator', route: Routes.OghamTranslator },
  { key: 'samoanToEnglishTranslator', route: Routes.SamoanToEnglishTranslator },
  {
    key: 'swahiliToEnglishTranslator',
    route: Routes.SwahiliToEnglishTranslator,
  },
  { key: 'teluguToEnglishTranslator', route: Routes.TeluguToEnglishTranslator },
  { key: 'jamaicanTranslator', route: Routes.JamaicanTranslator },
];

const COMPANY_LINKS: FooterLink[] = [
  { key: 'about', route: Routes.About },
  { key: 'privacyPolicy', route: Routes.Privacy },
  { key: 'termsOfService', route: Routes.Terms },
];

const LEGAL_LINKS: FooterLink[] = [];

async function mapFooterItems(
  t: any,
  tRoot: any,
  locale: string,
  section: string,
  links: FooterLink[],
  hidden: Set<string> = new Set()
) {
  const { getTranslations } = await import('next-intl/server');

  return Promise.all(
    links
      .filter((link) => !hidden.has(link.key))
      .map(async (link) => {
        let title: string;

        // 如果配置了 pageNamespace，则从页面独立的翻译文件中读取 title
        if (link.pageNamespace) {
          const pageT = await getTranslations({
            locale,
            namespace: link.pageNamespace
          });
          title = pageT('title');
        } else {
          // 否则使用 Marketing.footer 中的翻译
          title = t(`${section}.items.${link.key}`);
        }

        return {
          title,
          href: link.route,
          external: link.external ?? false,
        };
      })
  );
}

export async function getFooterLinks(
  t: any,
  tRoot: any,
  locale: string
): Promise<NestedMenuItem[]> {
  const footerSections = [
    {
      title: t('funTranslate.title'),
      items: await mapFooterItems(t, tRoot, locale, 'funTranslate', FUN_FOOTER_LINKS),
    },
    {
      title: t('gameTranslator.title'),
      items: await mapFooterItems(t, tRoot, locale, 'gameTranslator', GAME_FOOTER_LINKS),
    },
    {
      title: t('languageTranslator.title'),
      items: await mapFooterItems(
        t,
        tRoot,
        locale,
        'languageTranslator',
        LANGUAGE_FOOTER_LINKS,
        HIDDEN_LANGUAGE_FOOTER
      ),
    },
    {
      title: t('toolTranslator.title'),
      items: await mapFooterItems(t, tRoot, locale, 'toolTranslator', TOOL_FOOTER_LINKS),
    },
    {
      title: t('company.title'),
      items: await mapFooterItems(t, tRoot, locale, 'company', COMPANY_LINKS),
    },
  ];

  // 只有当LEGAL_LINKS有内容时才添加Legal section
  if (LEGAL_LINKS.length > 0) {
    footerSections.push({
      title: t('legal.title'),
      items: await mapFooterItems(t, tRoot, locale, 'legal', LEGAL_LINKS),
    });
  }

  return footerSections;
}
