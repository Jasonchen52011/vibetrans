// @ts-nocheck - Universal translator template
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
import UniversalTranslatorTool from './components/UniversalTranslatorTool';

export const runtime = 'edge';

/**
 * 🎯 Universal Translator Page Template
 *
 * This template handles ALL translator pages dynamically.
 * New translators only need a JSON file in messages/pages/[slug]/en.json
 *
 * Examples:
 * - /haitian-creole-translator → HaitianCreoleTranslatorPage namespace
 * - /aramaic-translator → AramaicTranslatorPage namespace
 * - /english-to-chinese → EnglishToChinesePage namespace
 */

// Convert slug to PageName (e.g., aramaic-translator → AramaicTranslatorPage)
function slugToPageName(slug: string): string {
  return (
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page'
  );
}

// Generate avatars based on slug hash for consistency
function getAvatarsForSlug(slug: string): string[] {
  const avatarPools = [
    ['male1', 'female2', 'male3', 'female4', 'male5'],
    ['female2', 'male4', 'female3', 'male2', 'female4'],
    ['male2', 'female1', 'male4', 'female2', 'male3'],
    ['female3', 'male1', 'female4', 'male2', 'female1'],
    ['male3', 'female4', 'male1', 'female3', 'male4'],
    ['female1', 'male2', 'female2', 'male5', 'female3'],
  ];

  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash = hash & hash;
  }
  return avatarPools[Math.abs(hash) % avatarPools.length];
}

// Generate user count based on slug hash
function getUserCountForSlug(slug: string): string {
  const counts = ['10,000', '15,000', '12,000', '20,000', '18,000', '25,000'];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash = hash & hash;
  }
  return counts[Math.abs(hash) % counts.length];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; 'translator-slug': string }>;
}): Promise<Metadata | undefined> {
  const resolvedParams = await params;
  const { locale, 'translator-slug': slug } = resolvedParams;
  const pageName = slugToPageName(slug);

  try {
    const t = await getTranslations({ locale, namespace: pageName });

    return constructMetadata({
      title: `${t('title')} | VibeTrans`,
      description: t('description'),
      canonicalUrl: getUrlWithLocale(`/${slug}`, locale),
      image: t('whatIs.image') || '/images/docs/default-translator.webp',
    });
  } catch (error) {
    console.error(`Failed to load translations for ${pageName}:`, error);
    return constructMetadata({
      title: 'VibeTrans - AI Translation Tools',
      description: 'Professional AI-powered translation tools',
      canonicalUrl: getUrlWithLocale(`/${slug}`, locale),
    });
  }
}

interface UniversalTranslatorPageProps {
  params: Promise<{ locale: Locale; 'translator-slug': string }>;
}

export default async function UniversalTranslatorPage(
  props: UniversalTranslatorPageProps
) {
  const params = await props.params;
  const { locale, 'translator-slug': slug } = params;
  const pageName = slugToPageName(slug);

  // Dynamically load the corresponding translation namespace
  const t = await getTranslations({ locale, namespace: pageName });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: `VibeTrans ${t('title')}`,
    description: t('description'),
  });

  // Build translator page content using unified function
  const content = buildTranslatorPageContent(t, {
    howToIcons: ['FaFileUpload', 'FaPencilAlt', 'FaLanguage', 'FaDownload'],
  });

  const avatars = getAvatarsForSlug(slug);
  const userCount = getUserCountForSlug(slug);

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
                {avatars.map((avatar, i) => (
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
                ))}
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
                  from {userCount}+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <UniversalTranslatorTool
            pageData={content.pageData}
            locale={locale}
            slug={slug}
            toolName={t('title')}
          />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={content.whatIs} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={content.examples} />

        {/* How to Section */}
        <HowTo section={content.howTo} />

        {/* User Interest Blocks */}
        {content.userInterest.items.length > 0 && (
          <UserScenarios
            section={content.userInterest}
            ctaText={t('ctaButton')}
          />
        )}

        {/* Fun Facts */}
        {content.funFacts.items.length > 0 && (
          <UserScenarios section={content.funFacts} ctaText={t('ctaButton')} />
        )}

        {/* Unique Features (if available) */}
        {content.unique.items.length > 0 && (
          <UserScenarios section={content.unique} ctaText={t('ctaButton')} />
        )}

        {/* Highlights */}
        <WhyChoose section={content.highlights} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Gen Z Translator',
            'Dog Translator',
            'Bad Translator',
            'Ancient Greek Translator',
            'Gibberish Translator',
            'Esperanto Translator',
          ]}
        />

        {/* Testimonials */}
        {content.testimonials.items.length > 0 && (
          <TestimonialsThreeColumnSection section={content.testimonials} />
        )}

        {/* FAQ */}
        {content.faqs.items.length > 0 && (
          <FaqSection section={content.faqs} />
        )}

        {/* CTA */}
        {content.cta.title && (
          <CallToActionSection section={content.cta} />
        )}
      </div>
    </>
  );
}
