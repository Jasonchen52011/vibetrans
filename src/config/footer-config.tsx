'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

type FooterLink = {
  key: string;
  route: Routes | string;
  external?: boolean;
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
  { key: 'pigLatinTranslator', route: Routes.PigLatinTranslator },
  { key: 'verboseGenerator', route: Routes.VerboseGenerator },
];

const GAME_FOOTER_LINKS: FooterLink[] = [
  { key: 'alBhedTranslator', route: Routes.AlBhedTranslator },
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
  { key: 'chineseToEnglishTranslator', route: Routes.ChineseToEnglishTranslator },
  { key: 'creoleToEnglishTranslator', route: Routes.CreoleToEnglishTranslator },
  { key: 'cuneiformTranslator', route: Routes.CuneiformTranslator },
  { key: 'englishToAmharicTranslator', route: Routes.EnglishToAmharicTranslator },
  { key: 'englishToPolishTranslator', route: Routes.EnglishToPolishTranslator },
  { key: 'englishToSwahiliTranslator', route: Routes.EnglishToSwahiliTranslator },
  { key: 'esperantoTranslator', route: Routes.EsperantoTranslator },
  { key: 'greekTranslator', route: Routes.GreekTranslator },
  { key: 'ivrTranslator', route: Routes.IvrTranslator },
  { key: 'mangaTranslator', route: Routes.MangaTranslator },
  { key: 'middleEnglishTranslator', route: Routes.MiddleEnglishTranslator },
  { key: 'nahuatlTranslator', route: Routes.NahuatlTranslator },
  { key: 'oghamTranslator', route: Routes.OghamTranslator },
  { key: 'samoanToEnglishTranslator', route: Routes.SamoanToEnglishTranslator },
  { key: 'swahiliToEnglishTranslator', route: Routes.SwahiliToEnglishTranslator },
  { key: 'teluguToEnglishTranslator', route: Routes.TeluguToEnglishTranslator },
];


const COMPANY_LINKS: FooterLink[] = [
  { key: 'about', route: Routes.About },
];

const LEGAL_LINKS: FooterLink[] = [
  { key: 'privacyPolicy', route: Routes.PrivacyPolicy },
  { key: 'termsOfService', route: Routes.TermsOfService },
];

function mapFooterItems(
  t: ReturnType<typeof useTranslations>,
  section: string,
  links: FooterLink[],
  hidden: Set<string> = new Set()
) {
  return links
    .filter((link) => !hidden.has(link.key))
    .map((link) => ({
      title: t(`${section}.items.${link.key}`),
      href: link.route,
      external: link.external ?? false,
    }));
}

export function useFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('funTranslate.title'),
      items: mapFooterItems(t, 'funTranslate', FUN_FOOTER_LINKS),
    },
    {
      title: t('gameTranslator.title'),
      items: mapFooterItems(t, 'gameTranslator', GAME_FOOTER_LINKS),
    },
    {
      title: t('languageTranslator.title'),
      items: mapFooterItems(
        t,
        'languageTranslator',
        LANGUAGE_FOOTER_LINKS,
        HIDDEN_LANGUAGE_FOOTER
      ),
    },
    {
      title: t('company.title'),
      items: mapFooterItems(t, 'company', COMPANY_LINKS),
    },
    {
      title: t('legal.title'),
      items: mapFooterItems(t, 'legal', LEGAL_LINKS),
    },
  ];
}
