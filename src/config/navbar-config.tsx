// @ts-nocheck
'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  AudioLinesIcon,
  BookIcon,
  BuildingIcon,
  ChartNoAxesCombinedIcon,
  CircleDollarSignIcon,
  CircleHelpIcon,
  ComponentIcon,
  CookieIcon,
  CrownIcon,
  DogIcon,
  EyeIcon,
  FeatherIcon,
  FileTextIcon,
  FilmIcon,
  FlameIcon,
  FootprintsIcon,
  GlobeIcon,
  ImageIcon,
  KeyIcon,
  LanguagesIcon,
  ListChecksIcon,
  LockKeyholeIcon,
  LogInIcon,
  MailIcon,
  MailboxIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  NewspaperIcon,
  RocketIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  SmileIcon,
  SnowflakeIcon,
  SparklesIcon,
  SplitSquareVerticalIcon,
  SquareCodeIcon,
  SquareKanbanIcon,
  SquarePenIcon,
  ThumbsUpIcon,
  UserPlusIcon,
  UsersIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get navbar config with translations
 *
 * NOTICE: used in client components only
 *
 * @returns The navbar config with translated titles and descriptions
 */
export function useNavbarLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.navbar');

  return [
    {
      title: 'Home',
      href: Routes.Root,
      external: false,
    },
    {
      title: t('funTranslate.title'),
      items: [
        {
          title: t('funTranslate.items.alienTextGenerator.title'),
          icon: <RocketIcon className="size-4 shrink-0" />,
          href: Routes.AlienTextGenerator,
          external: false,
        },
        {
          title: t('funTranslate.items.babyTranslator.title'),
          icon: <AudioLinesIcon className="size-4 shrink-0" />,
          href: Routes.BabyTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.badTranslator.title'),
          icon: <FlameIcon className="size-4 shrink-0" />,
          href: Routes.BadTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.dogTranslator.title'),
          icon: <DogIcon className="size-4 shrink-0" />,
          href: Routes.DogTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.dumbItDown.title'),
          icon: <WandSparklesIcon className="size-4 shrink-0" />,
          href: Routes.DumbItDownAI,
          external: false,
        },
        {
          title: t('funTranslate.items.genAlphaTranslator.title'),
          icon: <FlameIcon className="size-4 shrink-0" />,
          href: Routes.GenAlphaTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.genZTranslator.title'),
          icon: <MessageCircleIcon className="size-4 shrink-0" />,
          href: Routes.GenZTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.gibberishTranslator.title'),
          icon: <WandSparklesIcon className="size-4 shrink-0" />,
          href: Routes.GibberishTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.pigLatinTranslator.title'),
          icon: <SmileIcon className="size-4 shrink-0" />,
          href: Routes.PigLatinTranslator,
          external: false,
        },
        {
          title: t('funTranslate.items.verboseGenerator.title'),
          icon: <WandSparklesIcon className="size-4 shrink-0" />,
          href: Routes.VerboseGenerator,
          external: false,
        },
      ],
    },
    {
      title: 'Game Translator',
      items: [
        {
          title: t('languageTranslator.items.alBhedTranslator.title'),
          icon: <KeyIcon className="size-4 shrink-0" />,
          href: Routes.AlBhedTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.drowTranslator.title'),
          icon: <CrownIcon className="size-4 shrink-0" />,
          href: Routes.DrowTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.gasterTranslator.title'),
          icon: <EyeIcon className="size-4 shrink-0" />,
          href: Routes.GasterTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.highValyrianTranslator.title'),
          icon: <CrownIcon className="size-4 shrink-0" />,
          href: Routes.HighValyrianTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.mandalorianTranslator.title'),
          icon: <CrownIcon className="size-4 shrink-0" />,
          href: Routes.MandalorianTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.minionTranslator.title'),
          icon: <SmileIcon className="size-4 shrink-0" />,
          href: Routes.MinionTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.runeTranslator.title'),
          icon: <EyeIcon className="size-4 shrink-0" />,
          href: Routes.RuneTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.runicTranslator.title'),
          icon: <EyeIcon className="size-4 shrink-0" />,
          href: Routes.RunicTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.wingdingsTranslator.title'),
          icon: <MessageSquareIcon className="size-4 shrink-0" />,
          href: Routes.WingdingsTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.yodaTranslator.title'),
          icon: <SmileIcon className="size-4 shrink-0" />,
          href: Routes.YodaTranslator,
          external: false,
        },
      ],
    },
    {
      title: t('languageTranslator.title'),
      items: [
        {
          title: t('languageTranslator.items.albanianToEnglish.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.AlbanianToEnglish,
          external: false,
        },
        {
          title: t('languageTranslator.items.ancientGreekTranslator.title'),
          icon: <SquarePenIcon className="size-4 shrink-0" />,
          href: Routes.AncientGreekTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.aramaicTranslator.title'),
          icon: <ScrollTextIcon className="size-4 shrink-0" />,
          href: Routes.AramaicTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.baybayinTranslator.title'),
          icon: <FeatherIcon className="size-4 shrink-0" />,
          href: Routes.BaybayinTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.cantoneseTranslator.title'),
          icon: <MessageSquareIcon className="size-4 shrink-0" />,
          href: Routes.CantoneseTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.chineseToEnglishTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.ChineseToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToChineseTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.EnglishToChineseTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.creoleToEnglishTranslator.title'),
          icon: <GlobeIcon className="size-4 shrink-0" />,
          href: Routes.CreoleToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.cuneiformTranslator.title'),
          icon: <SquarePenIcon className="size-4 shrink-0" />,
          href: Routes.CuneiformTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToAmharicTranslator.title'),
          icon: <GlobeIcon className="size-4 shrink-0" />,
          href: Routes.EnglishToAmharicTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.esperantoTranslator.title'),
          icon: <GlobeIcon className="size-4 shrink-0" />,
          href: Routes.EsperantoTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.greekTranslator.title'),
          icon: <BookIcon className="size-4 shrink-0" />,
          href: Routes.GreekTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.mangaTranslator.title'),
          icon: <BookIcon className="size-4 shrink-0" />,
          href: Routes.MangaTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.ivrTranslator.title'),
          icon: <AudioLinesIcon className="size-4 shrink-0" />,
          href: Routes.IvrTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.middleEnglishTranslator.title'),
          icon: <BookIcon className="size-4 shrink-0" />,
          href: Routes.MiddleEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.nahuatlTranslator.title'),
          icon: <ScrollTextIcon className="size-4 shrink-0" />,
          href: Routes.NahuatlTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.oghamTranslator.title'),
          icon: <FeatherIcon className="size-4 shrink-0" />,
          href: Routes.OghamTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.samoanToEnglishTranslator.title'),
          icon: <GlobeIcon className="size-4 shrink-0" />,
          href: Routes.SamoanToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.swahiliToEnglishTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.SwahiliToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.teluguToEnglishTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.TeluguToEnglishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToPersianTranslator.title'),
          icon: <GlobeIcon className="size-4 shrink-0" />,
          href: Routes.EnglishToPersianTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToPolishTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.EnglishToPolishTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.englishToSwahiliTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.EnglishToSwahiliTranslator,
          external: false,
        },
        {
          title: t('languageTranslator.items.japaneseToEnglishTranslator.title'),
          icon: <LanguagesIcon className="size-4 shrink-0" />,
          href: Routes.JapaneseToEnglishTranslator,
          external: false,
        },
      ],
    },
    {
      title: 'About',
      href: Routes.About,
      external: false,
    },
  ];
}