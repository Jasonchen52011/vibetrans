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
      title: t('product.title'),
      items: [
        {
          title: 'Home',
          href: Routes.Root,
          external: false,
        },
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
          title: 'Esperanto Translator',
          href: Routes.EsperantoTranslator,
          external: false,
        },
        {
          title: 'Cuneiform Translator',
          href: Routes.CuneiformTranslator,
          external: false,
        },
        // {
        //   title: t('product.items.pricing'),
        //   href: Routes.Pricing,
        //   external: false,
        // },
        // {
        //   title: t('product.items.faq'),
        //   href: Routes.FAQ,
        //   external: false,
        // },
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
