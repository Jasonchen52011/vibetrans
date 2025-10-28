import deepmerge from 'deepmerge';
import type { Locale, Messages } from 'next-intl';
import { routing } from './routing';

/**
 * Import all translation modules for a given locale
 * Only includes existing translation files to avoid build errors
 */
const importLocale = async (locale: Locale): Promise<Messages> => {
  // Import all translation modules - 串行加载而非并发
  const common = await import(`../../messages/common/${locale}.json`);
  const mailCommon = await import(`../../messages/common/mail-${locale}.json`);
  const newsletterCommon = await import(
    `../../messages/common/newsletter-${locale}.json`
  );
  const premiumCommon = await import(
    `../../messages/common/premium-${locale}.json`
  );
  const homePages = await import(`../../messages/pages/home/${locale}.json`);
  const pricingPages = await import(
    `../../messages/pages/pricing/${locale}.json`
  );
  const blogPages = await import(`../../messages/pages/blog/${locale}.json`);
  const authPages = await import(`../../messages/pages/auth/${locale}.json`);
  const aboutPages = await import(`../../messages/pages/about/${locale}.json`);
  const docsPages = await import(`../../messages/pages/docs/${locale}.json`);
  const alBhedTranslatorPages = await import(
    `../../messages/pages/al-bhed-translator/${locale}.json`
  );
  const albanianToEnglishPages = await import(
    `../../messages/pages/albanian-to-english/${locale}.json`
  );
  const alienTextGeneratorPages = await import(
    `../../messages/pages/alien-text-generator/${locale}.json`
  );
  const ancientGreekTranslatorPages = await import(
    `../../messages/pages/ancient-greek-translator/${locale}.json`
  );
  const aramaicTranslatorPages = await import(
    `../../messages/pages/aramaic-translator/${locale}.json`
  );
  const babyTranslatorPages = await import(
    `../../messages/pages/baby-translator/${locale}.json`
  );
  const badTranslatorPages = await import(
    `../../messages/pages/bad-translator/${locale}.json`
  );
  const baybayinTranslatorPages = await import(
    `../../messages/pages/baybayin-translator/${locale}.json`
  );
  const cantoneseTranslatorPages = await import(
    `../../messages/pages/cantonese-translator/${locale}.json`
  );
  const creoleToEnglishTranslatorPages = await import(
    `../../messages/pages/creole-to-english-translator/${locale}.json`
  );
  const chineseToEnglishTranslatorPages = await import(
    `../../messages/pages/chinese-to-english-translator/${locale}.json`
  );
  const cuneiformTranslatorPages = await import(
    `../../messages/pages/cuneiform-translator/${locale}.json`
  );
  const dogTranslatorPages = await import(
    `../../messages/pages/dog-translator/${locale}.json`
  );
  const drowTranslatorPages = await import(
    `../../messages/pages/drow-translator/${locale}.json`
  );
  const dumbItDownPages = await import(
    `../../messages/pages/dumb-it-down-ai/${locale}.json`
  );
  const englishToAmharicTranslatorPages = await import(
    `../../messages/pages/english-to-amharic-translator/${locale}.json`
  );
  const englishToChineseTranslatorPages = await import(
    `../../messages/pages/english-to-chinese-translator/${locale}.json`
  );
  const englishToPersianTranslatorPages = await import(
    `../../messages/pages/english-to-persian-translator/${locale}.json`
  );
  const englishToPolishTranslatorPages = await import(
    `../../messages/pages/english-to-polish-translator/${locale}.json`
  );
  const englishToSwahiliTranslatorPages = await import(
    `../../messages/pages/english-to-swahili-translator/${locale}.json`
  );
  const esperantoTranslatorPages = await import(
    `../../messages/pages/esperanto-translator/${locale}.json`
  );
  const gasterTranslatorPages = await import(
    `../../messages/pages/gaster-translator/${locale}.json`
  );
  const genAlphaTranslatorPages = await import(
    `../../messages/pages/gen-alpha-translator/${locale}.json`
  );
  const genZTranslatorPages = await import(
    `../../messages/pages/gen-z-translator/${locale}.json`
  );
  const gibberishTranslatorPages = await import(
    `../../messages/pages/gibberish-translator/${locale}.json`
  );
  const greekTranslatorPages = await import(
    `../../messages/pages/greek-translator/${locale}.json`
  );
  const highValyrianTranslatorPages = await import(
    `../../messages/pages/high-valyrian-translator/${locale}.json`
  );
  const ivrTranslatorPages = await import(
    `../../messages/pages/ivr-translator/${locale}.json`
  );
  const japaneseToEnglishTranslatorPages = await import(
    `../../messages/pages/japanese-to-english-translator/${locale}.json`
  );
  const mandalorianTranslatorPages = await import(
    `../../messages/pages/mandalorian-translator/${locale}.json`
  );
  const mangaTranslatorPages = await import(
    `../../messages/pages/manga-translator/${locale}.json`
  );
  const middleEnglishTranslatorPages = await import(
    `../../messages/pages/middle-english-translator/${locale}.json`
  );
  const minionTranslatorPages = await import(
    `../../messages/pages/minion-translator/${locale}.json`
  );
  const nahuatlTranslatorPages = await import(
    `../../messages/pages/nahuatl-translator/${locale}.json`
  );
  const oghamTranslatorPages = await import(
    `../../messages/pages/ogham-translator/${locale}.json`
  );
  const pigLatinTranslatorPages = await import(
    `../../messages/pages/pig-latin-translator/${locale}.json`
  );
  const runeTranslatorPages = await import(
    `../../messages/pages/rune-translator/${locale}.json`
  );
  const runicTranslatorPages = await import(
    `../../messages/pages/runic-translator/${locale}.json`
  );
  const samoanToEnglishTranslatorPages = await import(
    `../../messages/pages/samoan-to-english-translator/${locale}.json`
  );
  const swahiliToEnglishTranslatorPages = await import(
    `../../messages/pages/swahili-to-english-translator/${locale}.json`
  );
  const teluguToEnglishTranslatorPages = await import(
    `../../messages/pages/telugu-to-english-translator/${locale}.json`
  );
  const verboseGeneratorPages = await import(
    `../../messages/pages/verbose-generator/${locale}.json`
  );
  const wingdingsTranslatorPages = await import(
    `../../messages/pages/wingdings-translator/${locale}.json`
  );
  const yodaTranslatorPages = await import(
    `../../messages/pages/yoda-translator/${locale}.json`
  );
  const dashboard = await import(`../../messages/dashboard/${locale}.json`);
  const marketing = await import(`../../messages/marketing/${locale}.json`);
  const demo = await import(`../../messages/demo/${locale}.json`);

  // Merge all modules into a single Messages object
  return deepmerge.all([
    common.default,
    mailCommon.default,
    newsletterCommon.default,
    premiumCommon.default,
    homePages.default,
    pricingPages.default,
    blogPages.default,
    authPages.default,
    aboutPages.default,
    docsPages.default,
    alBhedTranslatorPages.default,
    albanianToEnglishPages.default,
    alienTextGeneratorPages.default,
    ancientGreekTranslatorPages.default,
    aramaicTranslatorPages.default,
    babyTranslatorPages.default,
    badTranslatorPages.default,
    baybayinTranslatorPages.default,
    cantoneseTranslatorPages.default,
    creoleToEnglishTranslatorPages.default,
    chineseToEnglishTranslatorPages.default,
    cuneiformTranslatorPages.default,
    dogTranslatorPages.default,
    drowTranslatorPages.default,
    dumbItDownPages.default,
    englishToAmharicTranslatorPages.default,
    englishToChineseTranslatorPages.default,
    englishToPersianTranslatorPages.default,
    englishToPolishTranslatorPages.default,
    englishToSwahiliTranslatorPages.default,
    esperantoTranslatorPages.default,
    gasterTranslatorPages.default,
    genAlphaTranslatorPages.default,
    genZTranslatorPages.default,
    gibberishTranslatorPages.default,
    greekTranslatorPages.default,
    highValyrianTranslatorPages.default,
    ivrTranslatorPages.default,
    japaneseToEnglishTranslatorPages.default,
    mandalorianTranslatorPages.default,
    mangaTranslatorPages.default,
    middleEnglishTranslatorPages.default,
    minionTranslatorPages.default,
    nahuatlTranslatorPages.default,
    oghamTranslatorPages.default,
    pigLatinTranslatorPages.default,
    runeTranslatorPages.default,
    runicTranslatorPages.default,
    samoanToEnglishTranslatorPages.default,
    swahiliToEnglishTranslatorPages.default,
    teluguToEnglishTranslatorPages.default,
    verboseGeneratorPages.default,
    wingdingsTranslatorPages.default,
    yodaTranslatorPages.default,
    dashboard.default,
    marketing.default,
    demo.default,
  ]) as Messages;
};

// Export default messages for manifest and email templates
export const getDefaultMessages = async (): Promise<Messages> => {
  return await importLocale(routing.defaultLocale);
};

// For backward compatibility
export const defaultMessages = getDefaultMessages();

/**
 * If you have incomplete messages for a given locale and would like to use messages
 * from another locale as a fallback, you can merge the two accordingly.
 *
 * https://next-intl.dev/docs/usage/configuration#messages
 */
export const getMessagesForLocale = async (
  locale: Locale
): Promise<Messages> => {
  const localeMessages = await importLocale(locale);
  if (locale === routing.defaultLocale) {
    return localeMessages;
  }
  // Get default messages when needed instead of using a top-level await
  const defaultMessages = await getDefaultMessages();
  return deepmerge(defaultMessages, localeMessages);
};
