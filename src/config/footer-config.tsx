'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * @returns The footer config with translated titles
 */
export function useFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('funTranslate.title'),
      items: [
        {
          title: t('funTranslate.items.dogTranslator.title'),
          href: Routes.DogTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.genZTranslator.title'),
          href: Routes.GenZTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.genAlphaTranslator.title'),
          href: Routes.GenAlphaTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.dumbItDown.title'),
          href: Routes.DumbItDownAI,
          external: false,
        },
        {
          title: t('funTranslate.items.badTranslator.title'),
          href: Routes.BadTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.babyTranslator.title'),
          href: Routes.BabyTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.gibberishTranslator.title'),
          href: Routes.GibberishTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.alienTextGenerator.title'),
          href: Routes.AlienTextGenerator,
          external: false,
        },
        {
          title: t('funTranslate.items.verboseGenerator.title'),
          href: Routes.VerboseGenerator,
          external: false,
        },
        {
          title: t('funTranslate.items.pigLatinTranslator.title'),
          href: Routes.PigLatinTranslator,
          external: false,
        },
      ],
    },
    {
      title: t('gameTranslator.title'),
      items: [
        {
          title: t('gameTranslator.items.drowTranslator.title'),
          href: Routes.DrowTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.runeTranslator.title'),
          href: Routes.RuneTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.runicTranslator.title'),
          href: Routes.RunicTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.yodaTranslator.title'),
          href: Routes.YodaTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.mandalorianTranslator.title'),
          href: Routes.MandalorianTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.minionTranslator.title'),
          href: Routes.MinionTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.gasterTranslator.title'),
          href: Routes.GasterTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.wingdingsTranslator.title'),
          href: Routes.WingdingsTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.highValyrianTranslator.title'),
          href: Routes.HighValyrianTranslator,
          external: false,
        },
        {
          title: t('gameTranslator.items.alBhedTranslator.title'),
          href: Routes.AlBhedTranslator,
          external: false,
        },
      ],
    },
    {
      title: t('languageTranslator.title'),
      items: [
        {
          title: t('languageTranslator.items.ancientGreekTranslator.title'),
          href: Routes.AncientGreekTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.greekTranslator.title'),
          href: Routes.GreekTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.mangaTranslator.title'),
          href: Routes.MangaTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.esperantoTranslator.title'),
          href: Routes.EsperantoTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.cuneiformTranslator.title'),
          href: Routes.CuneiformTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.ivrTranslator.title'),
          href: Routes.IvrTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.albanianToEnglish.title'),
          href: Routes.AlbanianToEnglish,
          external: false,
        },
        {
          title: t('languageTranslator.items.creoleToEnglishTranslator.title'),
          href: Routes.CreoleToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.cantoneseTranslator.title'),
          href: Routes.CantoneseTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.chineseToEnglishTranslator.title'),
          href: Routes.ChineseToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToChineseTranslator.title'),
          href: Routes.EnglishToChineseTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.middleEnglishTranslator.title'),
          href: Routes.MiddleEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.baybayinTranslator.title'),
          href: Routes.BaybayinTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.oghamTranslator.title'),
          href: Routes.OghamTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.samoanToEnglishTranslator.title'),
          href: Routes.SamoanToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.aramaicTranslator.title'),
          href: Routes.AramaicTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.nahuatlTranslator.title'),
          href: Routes.NahuatlTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToSwahiliTranslator.title'),
          href: Routes.EnglishToSwahiliTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.swahiliToEnglishTranslator.title'),
          href: Routes.SwahiliToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToAmharicTranslator.title'),
          href: Routes.EnglishToAmharicTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToPolishTranslator.title'),
          href: Routes.EnglishToPolishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.teluguToEnglishTranslator.title'),
          href: Routes.TeluguToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToPersianTranslator.title'),
          href: Routes.EnglishToPersianTranslator,
          external: false,
        },
      ],
    },
    {
      title: t('legal.title'),
      items: [
        {
          title: t('legal.items.cookiePolicy'),
          href: Routes.CookiePolicy,
          external: false,
        },
        {
          title: t('legal.items.privacyPolicy'),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t('legal.items.termsOfService'),
          href: Routes.TermsOfService,
          external: false,
        },
      ],
    },
    {
      title: t('company.title'),
      items: [
        {
          title: t('company.items.about'),
          href: Routes.About,
          external: false,
        },
        {
          title: 'hello@vibetrans.com',
          href: 'mailto:hello@vibetrans.com',
          external: true,
        },
      ],
    },
  ];
}
