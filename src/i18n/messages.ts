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
  // Import all translation modules
  const [
    common,
    mailCommon,
    newsletterCommon,
    premiumCommon,
    homePages,
    pricingPages,
    blogPages,
    authPages,
    aboutPages,
    docsPages,
    dogTranslatorPages,
    dashboard,
    marketing,
    demo,
  ] = await Promise.all([
    import(`../../messages/common/${locale}.json`),
    import(`../../messages/common/mail-${locale}.json`),
    import(`../../messages/common/newsletter-${locale}.json`),
    import(`../../messages/common/premium-${locale}.json`),
    import(`../../messages/pages/home/${locale}.json`),
    import(`../../messages/pages/pricing/${locale}.json`),
    import(`../../messages/pages/blog/${locale}.json`),
    import(`../../messages/pages/auth/${locale}.json`),
    import(`../../messages/pages/about/${locale}.json`),
    import(`../../messages/pages/docs/${locale}.json`),
    import(`../../messages/pages/dog-translator/${locale}.json`),
    import(`../../messages/dashboard/${locale}.json`),
    import(`../../messages/marketing/${locale}.json`),
    import(`../../messages/demo/${locale}.json`),
  ]);

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
