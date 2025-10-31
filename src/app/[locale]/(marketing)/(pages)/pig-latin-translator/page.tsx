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
import { buildTranslatorPageContent } from '@/lib/translator-page';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import PigLatinTranslatorTool from './PigLatinTranslatorTool';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PigLatinTranslatorPage' });
  return constructMetadata({
    title: `${t('title')} | VibeTrans`,
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/pig-latin-translator', locale),
    image: t('whatIs.image'),
  });
}

interface PigLatinTranslatorPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function PigLatinTranslatorPage(
  props: PigLatinTranslatorPageProps
) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: 'PigLatinTranslatorPage',
  });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans Pig Latin Translator',
    description: t('description'),
  });

  // Build page content using unified function
  const translatorContent = buildTranslatorPageContent(t, { howToIcons: ['FaFileUpload', 'FaPencilAlt', 'FaLanguage'] });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section */}
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
              <div className="flex -space-x-3">
                {['female2', 'male4', 'female3', 'male2', 'female4'].map(
                  (avatar, i) => (
                    <div
                      key={i}
                      className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden"
                    >
                      <img
                        src={`/images/avatars/${avatar}.webp`}
                        alt={`User ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
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
                  from 15,000+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <PigLatinTranslatorTool pageData={translatorContent.pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={translatorContent.whatIs} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={translatorContent.examples} />

        {/* How to Section */}
        <HowTo section={translatorContent.howTo} />

        {/* User Interest Blocks */}
        <UserScenarios section={translatorContent.userInterest} ctaText={t('ctaButton')} />

        {/* Fun Facts */}
        <UserScenarios section={translatorContent.funFacts} ctaText={t('ctaButton')} />

        {/* Highlights */}
        <WhyChoose section={translatorContent.highlights} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Al Bhed Translator',
            'Gibberish Translator',
            'Gen Alpha Translator',
            'Ancient Greek Translator',
            'Dog Translator',
            'Gen Z Translator',
          ]}
        />

        {/* Testimonials */}
        <TestimonialsThreeColumnSection namespace="PigLatinTranslatorPage" subNamespace="testimonials" />

        {/* FAQ */}
        <FaqSection namespace="PigLatinTranslatorPage" subNamespace="faqs" />

        {/* CTA */}
        <CallToActionSection namespace="PigLatinTranslatorPage" subNamespace="cta" />
      </div>
    </>
  );
}
