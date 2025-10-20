import deepmerge from 'deepmerge';
import type { Locale, Messages } from 'next-intl';
import { routing } from './routing';

/**
 * Import all translation modules for a given locale
 * New modular translation structure:
 * - common/: Common translations (Metadata, Common, errors, etc.)
 * - pages/: Page-specific translations (home, pricing, blog, auth, etc.)
 * - dashboard/: Dashboard and admin translations
 * - marketing/: Marketing components (navbar, footer)
 * - demo/: AI demo pages translations
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
  const dogTranslatorPages = await import(
    `../../messages/pages/dog-translator/${locale}.json`
  );
  const genZTranslatorPages = await import(
    `../../messages/pages/gen-z-translator/${locale}.json`
  );
  const genAlphaTranslatorPages = await import(
    `../../messages/pages/gen-alpha-translator/${locale}.json`
  );
  const dumbItDownPages = await import(
    `../../messages/pages/dumb-it-down/${locale}.json`
  );
  const badTranslatorPages = await import(
    `../../messages/pages/bad-translator/${locale}.json`
  );
  const babyTranslatorPages = await import(
    `../../messages/pages/baby-translator/${locale}.json`
  );
  const ancientGreekTranslatorPages = await import(
    `../../messages/pages/ancient-greek-translator/${locale}.json`
  );
  const alBhedTranslatorPages = await import(
    `../../messages/pages/al-bhed-translator/${locale}.json`
  );
  const gibberishTranslatorPages = await import(
    `../../messages/pages/gibberish-translator/${locale}.json`
  );
  const alienTextGeneratorPages = await import(
    `../../messages/pages/alien-text-generator/${locale}.json`
  );
  const esperantoTranslatorPages = await import(
    `../../messages/pages/esperanto-translator/${locale}.json`
  );
  const cuneiformTranslatorPages = await import(
    `../../messages/pages/cuneiform-translator/${locale}.json`
  );
  const ivrTranslatorPages = await import(
    `../../messages/pages/ivr-translator/${locale}.json`
  );
  const verboseGeneratorPages = await import(
    `../../messages/pages/verbose-generator/${locale}.json`
  );
  const albanianToEnglishPages = await import(
    `../../messages/pages/albanian-to-english/${locale}.json`
  );
  const creoleToEnglishTranslatorPages = await import(
    `../../messages/pages/creole-to-english-translator/${locale}.json`
  );
  const pigLatinTranslatorPages = await import(
    `../../messages/pages/pig-latin-translator/${locale}.json`
  );
  const cantoneseTranslatorPages = await import(
    `../../messages/pages/cantonese-translator/${locale}.json`
  );
  const chineseToEnglishTranslatorPages = await import(
    `../../messages/pages/chinese-to-english-translator/${locale}.json`
  );
  const middleEnglishTranslatorPages = await import(
    `../../messages/pages/middle-english-translator/${locale}.json`
  );
  const minionTranslatorPages = await import(
    `../../messages/pages/minion-translator/${locale}.json`
  );
  const baybayinTranslatorPages = await import(
    `../../messages/pages/baybayin-translator/${locale}.json`
  );
  const samoanToEnglishTranslatorPages = await import(
    `../../messages/pages/samoan-to-english-translator/${locale}.json`
  );
  const gasterTranslatorPages = await import(
    `../../messages/pages/gaster-translator/${locale}.json`
  );
  const highValyrianTranslatorPages = await import(
    `../../messages/pages/high-valyrian-translator/${locale}.json`
  );
  const aramaicTranslatorPages = await import(
    `../../messages/pages/aramaic-translator/${locale}.json`
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
    dogTranslatorPages.default,
    genZTranslatorPages.default,
    genAlphaTranslatorPages.default,
    dumbItDownPages.default,
    badTranslatorPages.default,
    babyTranslatorPages.default,
    ancientGreekTranslatorPages.default,
    alBhedTranslatorPages.default,
    gibberishTranslatorPages.default,
    alienTextGeneratorPages.default,
    esperantoTranslatorPages.default,
    cuneiformTranslatorPages.default,
    ivrTranslatorPages.default,
    verboseGeneratorPages.default,
    albanianToEnglishPages.default,
    creoleToEnglishTranslatorPages.default,
    pigLatinTranslatorPages.default,
    cantoneseTranslatorPages.default,
    chineseToEnglishTranslatorPages.default,
    middleEnglishTranslatorPages.default,
    minionTranslatorPages.default,
    baybayinTranslatorPages.default,
    samoanToEnglishTranslatorPages.default,
    gasterTranslatorPages.default,
    highValyrianTranslatorPages.default,
    aramaicTranslatorPages.default,
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
