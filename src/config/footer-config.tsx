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
  { key: 'dumbItDown', route: Routes.DumbItDownAI },
  { key: 'verboseGenerator', route: Routes.VerboseGenerator },
];

const GAME_FOOTER_LINKS: FooterLink[] = [
  { key: 'alBhedTranslator', route: Routes.AlBhedTranslator },
];

const HIDDEN_LANGUAGE_FOOTER = new Set([
  'englishToChineseTranslator',
  'englishToPersianTranslator',
  'japaneseToEnglishTranslator',
]);

const LANGUAGE_FOOTER_LINKS: FooterLink[] = [
  { key: 'greekTranslator', route: Routes.GreekTranslator },
  { key: 'albanianToEnglish', route: Routes.AlbanianToEnglish },
  {
    key: 'chineseToEnglishTranslator',
    route: Routes.ChineseToEnglishTranslator,
  },
  {
    key: 'englishToAmharicTranslator',
    route: Routes.EnglishToAmharicTranslator,
  },
  { key: 'englishToPolishTranslator', route: Routes.EnglishToPolishTranslator },
  {
    key: 'englishToSwahiliTranslator',
    route: Routes.EnglishToSwahiliTranslator,
  },
  {
    key: 'swahiliToEnglishTranslator',
    route: Routes.SwahiliToEnglishTranslator,
  },
  { key: 'teluguToEnglishTranslator', route: Routes.TeluguToEnglishTranslator },
  {
    key: 'japaneseToEnglishTranslator',
    route: Routes.JapaneseToEnglishTranslator,
  },
  {
    key: 'englishToChineseTranslator',
    route: Routes.EnglishToChineseTranslator,
  },
  {
    key: 'englishToPersianTranslator',
    route: Routes.EnglishToPersianTranslator,
  },
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
