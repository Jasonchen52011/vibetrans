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
          title: 'Dog Translator',
          href: Routes.DogTranslator,
          external: false,
        },
        {
          title: 'Gen Z Translator',
          href: Routes.GenZTranslator,
          external: false,
        },
        {
          title: 'Gen Alpha Translator',
          href: Routes.GenAlphaTranslator,
          external: false,
        },
        {
          title: 'Dumb It Down AI',
          href: Routes.DumbItDownAI,
          external: false,
        },
        {
          title: 'Bad Translator',
          href: Routes.BadTranslator,
          external: false,
        },
        {
          title: 'Baby Translator',
          href: Routes.BabyTranslator,
          external: false,
        },
        {
          title: 'Gibberish Translator',
          href: Routes.GibberishTranslator,
          external: false,
        },
        {
          title: 'Alien Text Generator',
          href: Routes.AlienTextGenerator,
          external: false,
        },
        {
          title: 'Verbose Generator',
          href: Routes.VerboseGenerator,
          external: false,
        },
        {
          title: 'Pig Latin Translator',
          href: Routes.PigLatinTranslator,
          external: false,
        },
      ],
    },
    {
      title: t('languageTranslator.title'),
      items: [
        {
          title: 'Ancient Greek Translator',
          href: Routes.AncientGreekTranslator,
          external: false,
        },
        {
          title: 'Al Bhed Translator',
          href: Routes.AlBhedTranslator,
          external: false,
        },
        {
          title: 'Esperanto Translator',
          href: Routes.EsperantoTranslator,
          external: false,
        },
        {
          title: 'Cuneiform Translator',
          href: Routes.CuneiformTranslator,
          external: false,
        },
        {
          title: 'IVR Translator',
          href: Routes.IvrTranslator,
          external: false,
        },
        {
          title: 'Albanian To English',
          href: Routes.AlbanianToEnglish,
          external: false,
        },
        {
          title: 'Creole To English Translator',
          href: Routes.CreoleToEnglishTranslator,
          external: false,
        },
        {
          title: 'Cantonese Translator',
          href: Routes.CantoneseTranslator,
          external: false,
        },
        {
          title: 'Chinese To English Translator',
          href: Routes.ChineseToEnglishTranslator,
          external: false,
        },
        {
          title: 'Middle English Translator',
          href: Routes.MiddleEnglishTranslator,
          external: false,
        },
        {
          title: 'Minion Translator',
          href: Routes.MinionTranslator,
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
      title: 'CONTACT',
      items: [],
    },
  ];
}
