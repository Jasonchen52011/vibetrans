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
  const chineseToEnglishTranslatorPages = await import(
    `../../messages/pages/chinese-to-english-translator/${locale}.json`
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
  const englishToPolishTranslatorPages = await import(
    `../../messages/pages/english-to-polish-translator/${locale}.json`
  );
  const englishToSwahiliTranslatorPages = await import(
    `../../messages/pages/english-to-swahili-translator/${locale}.json`
  );
  const greekTranslatorPages = await import(
    `../../messages/pages/greek-translator/${locale}.json`
  );
  const verboseGeneratorPages = await import(
    `../../messages/pages/verbose-generator/${locale}.json`
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
    chineseToEnglishTranslatorPages.default,
    dumbItDownPages.default,
    englishToAmharicTranslatorPages.default,
    englishToChineseTranslatorPages.default,
    englishToPolishTranslatorPages.default,
    englishToSwahiliTranslatorPages.default,
    greekTranslatorPages.default,
    verboseGeneratorPages.default,
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
