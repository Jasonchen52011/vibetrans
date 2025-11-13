'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  AudioLinesIcon,
  BookIcon,
  CrownIcon,
  DogIcon,
  EyeIcon,
  FeatherIcon,
  FlameIcon,
  GlobeIcon,
  Hash,
  KeyIcon,
  LanguagesIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  RocketIcon,
  ScrollTextIcon,
  SmileIcon,
  SparklesIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const NAV_CATEGORY_CONFIG: {
  funTranslate: { key: string; route: Routes; icon: JSX.Element }[];
  gameTranslator: { key: string; route: Routes; icon: JSX.Element }[];
  languageTranslator: { key: string; route: Routes; icon: JSX.Element }[];
} = {
  funTranslate: [
    {
      key: 'alienTextGenerator',
      route: Routes.AlienTextGenerator,
      icon: <RocketIcon className="size-4 shrink-0" />,
    },
    {
      key: 'babyTranslator',
      route: Routes.BabyTranslator,
      icon: <AudioLinesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'badTranslator',
      route: Routes.BadTranslator,
      icon: <FlameIcon className="size-4 shrink-0" />,
    },
    {
      key: 'dogTranslator',
      route: Routes.DogTranslator,
      icon: <DogIcon className="size-4 shrink-0" />,
    },
    {
      key: 'dumbItDown',
      route: Routes.DumbItDownAI,
      icon: <WandSparklesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'genAlphaTranslator',
      route: Routes.GenAlphaTranslator,
      icon: <SparklesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'genZTranslator',
      route: Routes.GenZTranslator,
      icon: <MessageCircleIcon className="size-4 shrink-0" />,
    },
    {
      key: 'gibberishTranslator',
      route: Routes.GibberishTranslator,
      icon: <SparklesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'numbersToLetters',
      route: Routes.NumbersToLetters,
      icon: <Hash className="size-4 shrink-0" />,
    },
    {
      key: 'pigLatinTranslator',
      route: Routes.PigLatinTranslator,
      icon: <SmileIcon className="size-4 shrink-0" />,
    },
    {
      key: 'pirateTranslator',
      route: Routes.PirateTranslator,
      icon: <SmileIcon className="size-4 shrink-0" />,
    },
    {
      key: 'shakespeareanTranslator',
      route: Routes.ShakespeareanTranslator,
      icon: <FeatherIcon className="size-4 shrink-0" />,
    },
    {
      key: 'verboseGenerator',
      route: Routes.VerboseGenerator,
      icon: <WandSparklesIcon className="size-4 shrink-0" />,
    },
  ],
  gameTranslator: [
    {
      key: 'alBhedTranslator',
      route: Routes.AlBhedTranslator,
      icon: <KeyIcon className="size-4 shrink-0" />,
    },
    {
      key: 'drowTranslator',
      route: Routes.DrowTranslator,
      icon: <CrownIcon className="size-4 shrink-0" />,
    },
    {
      key: 'dragonLanguageTranslator',
      route: Routes.DragonLanguageTranslator,
      icon: <FlameIcon className="size-4 shrink-0" />,
    },
    {
      key: 'draconicTranslator',
      route: Routes.DraconicTranslator,
      icon: <FlameIcon className="size-4 shrink-0" />,
    },
    {
      key: 'gasterTranslator',
      route: Routes.GasterTranslator,
      icon: <EyeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'highValyrianTranslator',
      route: Routes.HighValyrianTranslator,
      icon: <CrownIcon className="size-4 shrink-0" />,
    },
    {
      key: 'mandalorianTranslator',
      route: Routes.MandalorianTranslator,
      icon: <CrownIcon className="size-4 shrink-0" />,
    },
    {
      key: 'minionTranslator',
      route: Routes.MinionTranslator,
      icon: <SmileIcon className="size-4 shrink-0" />,
    },
    {
      key: 'runeTranslator',
      route: Routes.RuneTranslator,
      icon: <ScrollTextIcon className="size-4 shrink-0" />,
    },
    {
      key: 'runicTranslator',
      route: Routes.RunicTranslator,
      icon: <ScrollTextIcon className="size-4 shrink-0" />,
    },
    {
      key: 'wingdingsTranslator',
      route: Routes.WingdingsTranslator,
      icon: <MessageSquareIcon className="size-4 shrink-0" />,
    },
    {
      key: 'yodaTranslator',
      route: Routes.YodaTranslator,
      icon: <SparklesIcon className="size-4 shrink-0" />,
    },
  ],
  languageTranslator: [
    {
      key: 'albanianToEnglish',
      route: Routes.AlbanianToEnglish,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'ancientGreekTranslator',
      route: Routes.AncientGreekTranslator,
      icon: <BookIcon className="size-4 shrink-0" />,
    },
    {
      key: 'aramaicTranslator',
      route: Routes.AramaicTranslator,
      icon: <ScrollTextIcon className="size-4 shrink-0" />,
    },
    {
      key: 'baybayinTranslator',
      route: Routes.BaybayinTranslator,
      icon: <FeatherIcon className="size-4 shrink-0" />,
    },
    {
      key: 'brailleTranslator',
      route: Routes.BrailleTranslator,
      icon: <EyeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'morseCodeTranslator',
      route: Routes.MorseCodeTranslator,
      icon: <AudioLinesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'cantoneseTranslator',
      route: Routes.CantoneseTranslator,
      icon: <MessageSquareIcon className="size-4 shrink-0" />,
    },
    {
      key: 'chineseToEnglishTranslator',
      route: Routes.ChineseToEnglishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToChineseTranslator',
      route: Routes.EnglishToChineseTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'creoleToEnglishTranslator',
      route: Routes.CreoleToEnglishTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'cuneiformTranslator',
      route: Routes.CuneiformTranslator,
      icon: <ScrollTextIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToAmharicTranslator',
      route: Routes.EnglishToAmharicTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToPersianTranslator',
      route: Routes.EnglishToPersianTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToPolishTranslator',
      route: Routes.EnglishToPolishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToSwahiliTranslator',
      route: Routes.EnglishToSwahiliTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'englishToTurkishTranslator',
      route: Routes.EnglishToTurkishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'esperantoTranslator',
      route: Routes.EsperantoTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'greekTranslator',
      route: Routes.GreekTranslator,
      icon: <BookIcon className="size-4 shrink-0" />,
    },
    {
      key: 'haitianCreoleTranslator',
      route: Routes.HaitianCreoleTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'ivrTranslator',
      route: Routes.IvrTranslator,
      icon: <AudioLinesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'japaneseToEnglishTranslator',
      route: Routes.JapaneseToEnglishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'mangaTranslator',
      route: Routes.MangaTranslator,
      icon: <BookIcon className="size-4 shrink-0" />,
    },
    {
      key: 'middleEnglishTranslator',
      route: Routes.MiddleEnglishTranslator,
      icon: <BookIcon className="size-4 shrink-0" />,
    },
    {
      key: 'nahuatlTranslator',
      route: Routes.NahuatlTranslator,
      icon: <ScrollTextIcon className="size-4 shrink-0" />,
    },
    {
      key: 'oghamTranslator',
      route: Routes.OghamTranslator,
      icon: <FeatherIcon className="size-4 shrink-0" />,
    },
    {
      key: 'samoanToEnglishTranslator',
      route: Routes.SamoanToEnglishTranslator,
      icon: <GlobeIcon className="size-4 shrink-0" />,
    },
    {
      key: 'swahiliToEnglishTranslator',
      route: Routes.SwahiliToEnglishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'teluguToEnglishTranslator',
      route: Routes.TeluguToEnglishTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
    {
      key: 'jamaicanTranslator',
      route: Routes.JamaicanTranslator,
      icon: <LanguagesIcon className="size-4 shrink-0" />,
    },
  ],
};

const HIDDEN_LANGUAGE_KEYS = new Set([
  // 'japaneseToEnglishTranslator', // 移到可见列表
]);

function buildItems(
  t: ReturnType<typeof useTranslations>,
  category: keyof typeof NAV_CATEGORY_CONFIG
) {
  return NAV_CATEGORY_CONFIG[category]
    .filter(
      (item) =>
        category !== 'languageTranslator' || !HIDDEN_LANGUAGE_KEYS.has(item.key)
    )
    .map((item) => ({
      title: t(`${category}.items.${item.key}.title`),
      icon: item.icon,
      href: item.route,
      external: false,
    }));
}

export function useNavbarLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.navbar');

  return [
    {
      title: t('funTranslate.title'),
      items: buildItems(t, 'funTranslate'),
    },
    {
      title: t('gameTranslator.title'),
      items: buildItems(t, 'gameTranslator'),
    },
    {
      title: t('languageTranslator.title'),
      items: buildItems(t, 'languageTranslator'),
    },
  ];
}
