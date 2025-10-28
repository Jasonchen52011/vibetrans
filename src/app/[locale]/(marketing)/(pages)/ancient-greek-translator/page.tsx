import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsThreeColumnSection from '@/components/blocks/testimonials/testimonials-three-column';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import AncientGreekTranslatorTool from './AncientGreekTranslatorTool';

export const runtime = 'edge';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const gt = await getTranslations({
    locale,
    namespace: 'AncientGreekTranslatorPage',
  });

  return constructMetadata({
    title: `${gt('title')} | ${t('name')}`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/ancient-greek-translator', locale),
    image: '/images/docs/what-is-ancient-greek-translator.webp',
  });
}

interface AncientGreekTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AncientGreekTranslatorPage(
  props: AncientGreekTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'AncientGreekTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Ancient Greek Translator',
    description: t('description'),
  });

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: t('tool.inputLabel'),
      greekLabel: t('tool.greekLabel'),
      outputLabel: t('tool.outputLabel'),
      inputPlaceholder: t('tool.inputPlaceholder'),
      greekPlaceholder: t('tool.greekPlaceholder'),
      outputPlaceholder: t('tool.outputPlaceholder'),
      translateButton: t('tool.translateButton'),
      uploadButton: t('tool.uploadButton'),
      uploadHint: t('tool.uploadHint'),
      loading: t('tool.loading'),
      error: t('tool.error'),
      noInput: t('tool.noInput'),
      pronunciationLabel: t('tool.pronunciationLabel'),
      culturalContextLabel: t('tool.culturalContextLabel'),
      dialectLabel: t('tool.dialectLabel'),
      dialects: {
        attic: t('tool.dialects.attic'),
        ionic: t('tool.dialects.ionic'),
        doric: t('tool.dialects.doric'),
        aeolic: t('tool.dialects.aeolic'),
        koine: t('tool.dialects.koine'),
      },
    },
  };

  // Examples section data
  const examplesData = {
    title: t('examples.title'),
    description: t('examples.description'),
    images: [
      {
        alt: 'English: Hello → Greek: χαῖρε (chaíre)',
        name: 'Hello → χαῖρε',
      },
      {
        alt: 'English: Love → Greek: ἀγάπη (agápē)',
        name: 'Love → ἀγάπη',
      },
      {
        alt: 'English: Wisdom → Greek: σοφία (sophía)',
        name: 'Wisdom → σοφία',
      },
      {
        alt: 'English: Truth → Greek: ἀλήθεια (alḗtheia)',
        name: 'Truth → ἀλήθεια',
      },
      {
        alt: 'English: Beauty → Greek: κάλλος (kállos)',
        name: 'Beauty → κάλλος',
      },
      {
        alt: 'English: Philosophy → Greek: φιλοσοφία (philosophía)',
        name: 'Philosophy → φιλοσοφία',
      },
    ],
  };

  // User scenarios section (Fun Facts)
  const userScenariosSection = {
    name: 'userscenarios',
    title: t('funfacts.title'),
    items: [
      {
        title: t('funfacts.items.0.title'),
        description: t('funfacts.items.0.description'),
        image: {
          src: '/images/docs/ancient-greek-language-influence.webp',
          alt: 'Ancient Greek Influenced Modern Languages',
        },
      },
      {
        title: t('funfacts.items.1.title'),
        description: t('funfacts.items.1.description'),
        image: {
          src: '/images/docs/ancient-greek-dialects.webp',
          alt: 'Ancient Greek Dialects',
        },
      },
    ],
  };

  // Highlights section
  const highlightsSection = {
    name: 'highlights',
    title: t('highlights.title'),
    description: t('highlights.description'),
    items: [
      {
        icon: 'FaRocket',
        title: t('highlights.items.0.title'),
        description: t('highlights.items.0.description'),
      },
      {
        icon: 'FaBrain',
        title: t('highlights.items.1.title'),
        description: t('highlights.items.1.description'),
      },
      {
        icon: 'FaShieldAlt',
        title: t('highlights.items.2.title'),
        description: t('highlights.items.2.description'),
      },
      {
        icon: 'FaChartLine',
        title: t('highlights.items.3.title'),
        description: t('highlights.items.3.description'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: t('whatIs.title'),
    description: t('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-ancient-greek-translator.webp',
      alt: 'What is Ancient Greek Translator - Understanding Classical Greek Language',
    },
    cta: {
      text: t('ctaButton'),
    },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: t('howto.title'),
    description: t('howto.description'),
    image: {
      src: '/images/docs/ancient-greek-translator-how-to.webp',
      alt: 'How to use Ancient Greek Translator step by step guide',
    },
    items: [
      {
        title: t('howto.steps.0.title'),
        description: t('howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: t('howto.steps.1.title'),
        description: t('howto.steps.1.description'),
        icon: 'FaPencilAlt',
      },
      {
        title: t('howto.steps.2.title'),
        description: t('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: t('howto.steps.3.title'),
        description: t('howto.steps.3.description'),
        icon: 'FaCheckCircle',
      },
    ],
  };

  // User Interest section
  const userInterestSection = {
    name: 'userinterest',
    title: t('userInterest.title'),
    items: [
      {
        title: t('userInterest.items.0.title'),
        description: t('userInterest.items.0.description'),
        image: {
          src: '/images/docs/accurate-greek-translations.webp',
          alt: 'Accurate Translations of Ancient Greek Texts',
        },
      },
      {
        title: t('userInterest.items.1.title'),
        description: t('userInterest.items.1.description'),
        image: {
          src: '/images/docs/ai-powered-greek-translation.webp',
          alt: 'AI-Powered Ancient Greek Translations',
        },
      },
      {
        title: t('userInterest.items.2.title'),
        description: t('userInterest.items.2.description'),
        image: {
          src: '/images/docs/greek-cultural-insights.webp',
          alt: 'Cultural Insights in Ancient Greek Translations',
        },
      },
      {
        title: t('userInterest.items.3.title'),
        description: t('userInterest.items.3.description'),
        image: {
          src: '/images/docs/learn-ancient-greek.webp',
          alt: 'Learn Ancient Greek with VibeTrans',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section with Tool */}
        <AuroraBackground className="bg-white dark:bg-zinc-900 !pt-12 !h-auto">
          <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('hero.description')}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Avatar Images */}
              <div className="flex -space-x-3">
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female3.webp"
                    alt="User 1"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male4.webp"
                    alt="User 2"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female2.webp"
                    alt="User 3"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/male1.webp"
                    alt="User 4"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/female1.webp"
                    alt="User 5"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Stars and Text */}
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  from 12,300+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Ancient Greek Translator Tool */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <AncientGreekTranslatorTool pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios section={userInterestSection} ctaText={t('ctaButton')} />

        {/* Fun Facts */}
        <UserScenarios
          section={userScenariosSection}
          ctaText={t('ctaButton')}
        />

        {/* Highlights/Why Choose */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Ancient Greek Translator',
            'Cuneiform Translator',
            'Al Bhed Translator',
            'Esperanto Translator',
            'Gen Alpha Translator',
            'Gen Z Translator',
          ]}
        />

        {/* Testimonials Section */}
        <TestimonialsThreeColumnSection namespace="AncientGreekTranslatorPage.testimonials" />

        {/* FAQ Section */}
        <FaqSection namespace="AncientGreekTranslatorPage.faqs" />

        {/* Call to Action */}
        <CallToActionSection namespace="AncientGreekTranslatorPage.cta" />
      </div>
    </>
  );
}
