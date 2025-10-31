import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';

export const runtime = 'edge';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import HeroSection from '@/components/blocks/hero/hero';
import HighlightsSection from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import StatsSection from '@/components/blocks/stats/stats';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import UniqueSection from '@/components/blocks/unique';
import WhatIsSection from '@/components/blocks/whatis';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  // @ts-ignore - Translation keys type mismatch
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    // @ts-ignore - Translation keys type mismatch
    title: t('title' as const),
    // @ts-ignore - Translation keys type mismatch
    description: t('description' as const),
    canonicalUrl: getUrlWithLocale('', locale),
    image: '/images/docs/translation-slang.webp',
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  // @ts-ignore - Translation keys type mismatch
  const t = await getTranslations('HomePage');

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans',
    description:
      'VibeTrans offers powerful AI-driven translation tools for seamless language conversion. Whether you are translating texts, slang, or even ancient languages, VibeTrans makes communication easy.',
    aggregateRating: {
      ratingValue: 4.9,
      ratingCount: 8500,
    },
  });

  const userScenariosSection = {
    name: 'funfacts',
    // @ts-ignore - Translation keys type mismatch
    title: t('funfacts.title'),
    items: [
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('funfacts.items.0.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('funfacts.items.0.description'),
        image: {
          src: '/images/docs/funfact-languages.webp',
          alt: 'Language Diversity',
        },
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('funfacts.items.1.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('funfacts.items.1.description'),
        image: {
          src: '/images/docs/funfact-ai-emotional.webp',
          alt: 'Emotional AI Translation',
        },
      },
    ],
  };

  const howtoSection = {
    name: 'howto',
    // @ts-ignore - Translation keys type mismatch
    title: t('howto.title'),
    // @ts-ignore - Translation keys type mismatch
    description: t('howto.description'),
    image: {
      src: '/images/docs/vibetranshome.webp',
      alt: 'VibeTrans How to Use',
    },
    items: [
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('howto.steps.0.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('howto.steps.0.description'),
        icon: 'FaRocket',
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('howto.steps.1.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('howto.steps.1.description'),
        icon: 'FaCog',
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('howto.steps.2.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('howto.steps.2.description'),
        icon: 'FaArrowRight',
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('howto.steps.3.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('howto.steps.3.description'),
        icon: 'FaHeadset',
      },
    ],
  };

  const highlightsSection = {
    name: 'highlights',
    // @ts-ignore - Translation keys type mismatch
    title: t('highlights.title'),
    // @ts-ignore - Translation keys type mismatch
    description: t('highlights.description'),
    items: [
      {
        // @ts-ignore - Translation keys type mismatch
        icon: t('highlights.items.0.icon'),
        // @ts-ignore - Translation keys type mismatch
        title: t('highlights.items.0.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('highlights.items.0.description'),
      },
      {
        // @ts-ignore - Translation keys type mismatch
        icon: t('highlights.items.1.icon'),
        // @ts-ignore - Translation keys type mismatch
        title: t('highlights.items.1.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('highlights.items.1.description'),
      },
      {
        // @ts-ignore - Translation keys type mismatch
        icon: t('highlights.items.2.icon'),
        // @ts-ignore - Translation keys type mismatch
        title: t('highlights.items.2.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('highlights.items.2.description'),
      },
      {
        // @ts-ignore - Translation keys type mismatch
        icon: t('highlights.items.3.icon'),
        // @ts-ignore - Translation keys type mismatch
        title: t('highlights.items.3.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('highlights.items.3.description'),
      },
    ],
  };

  const whatIsSection = {
    // @ts-ignore - Translation keys type mismatch
    title: t('whatIs.title'),
    // @ts-ignore - Translation keys type mismatch
    description: t('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-vibetrans.webp',
      alt: 'VibeTrans Platform Overview',
    },
    cta: {
      // @ts-ignore - Translation keys type mismatch
      text: t('whatIs.ctaButton'),
    },
  };

  const uniqueSection = {
    name: 'unique',
    // @ts-ignore - Translation keys type mismatch
    title: t('features3.title'),
    // @ts-ignore - Translation keys type mismatch
    description: t('features3.description'),
    items: [
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('features3.items.item-1.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('features3.items.item-1.description'),
        image: {
          src: '/images/docs/translation-business.webp',
          alt: 'Business Translation',
        },
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('features3.items.item-2.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('features3.items.item-2.description'),
        image: {
          src: '/images/docs/translation-learning.webp',
          alt: 'Language Learning',
        },
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('features3.items.item-3.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('features3.items.item-3.description'),
        image: {
          src: '/images/docs/translation-travelers.webp',
          alt: 'Travel Translation',
        },
      },
      {
        // @ts-ignore - Translation keys type mismatch
        title: t('features3.items.item-4.title'),
        // @ts-ignore - Translation keys type mismatch
        description: t('features3.items.item-4.description'),
        image: {
          src: '/images/docs/translation-slang.webp',
          alt: 'Fun Translations',
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
        {/* 工具操作区域 */}
        <HeroSection />

        {/* What is XXXX */}
        <WhatIsSection section={whatIsSection} />

        {/* 其他工具推荐 - Stats Section */}
        <StatsSection
          title={t('stats.title')}
          subtitle={t('stats.subtitle')}
          description={t('stats.description')}
          items={[
            {
              title: t('stats.items.item-1.title'),
              value: t('stats.items.item-1.value'),
            },
            {
              title: t('stats.items.item-2.title'),
              value: t('stats.items.item-2.value'),
            },
            {
              title: t('stats.items.item-3.title'),
              value: t('stats.items.item-3.value'),
            },
          ]}
        />

        {/* How to translate XXXX */}
        <HowTo section={howtoSection} />

        {/* Unique */}
        <UniqueSection section={uniqueSection} />

        {/* Funfacts */}
        {/* @ts-ignore - Translation keys type mismatch */}
        <UserScenarios
          section={userScenariosSection}
          ctaText={(t as any)('funfacts.ctaButton')}
        />

        {/* Highlights */}
        <HighlightsSection section={highlightsSection} />

        {/* FAQs */}
        <FaqSection
          title={t('faqs.title')}
          subtitle={t('faqs.subtitle')}
          items={[
            {
              question: t('faqs.items.item-1.question'),
              answer: t('faqs.items.item-1.answer'),
            },
            {
              question: t('faqs.items.item-2.question'),
              answer: t('faqs.items.item-2.answer'),
            },
            {
              question: t('faqs.items.item-3.question'),
              answer: t('faqs.items.item-3.answer'),
            },
            {
              question: t('faqs.items.item-4.question'),
              answer: t('faqs.items.item-4.answer'),
            },
            {
              question: t('faqs.items.item-5.question'),
              answer: t('faqs.items.item-5.answer'),
            },
            {
              question: t('faqs.items.item-6.question'),
              answer: t('faqs.items.item-6.answer'),
            },
            {
              question: t('faqs.items.item-7.question'),
              answer: t('faqs.items.item-7.answer'),
            },
            {
              question: t('faqs.items.item-8.question'),
              answer: t('faqs.items.item-8.answer'),
            },
          ]}
        />

        {/* 用户评论（用户留言输入框）*/}
        <TestimonialsSection
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
          items={[
            {
              name: t('testimonials.items.item-1.name'),
              role: t('testimonials.items.item-1.role'),
              image: t('testimonials.items.item-1.image'),
              heading: t('testimonials.items.item-1.heading'),
              content: t('testimonials.items.item-1.content'),
              rating: Number(t('testimonials.items.item-1.rating')) || 5.0,
              date: t('testimonials.items.item-1.date'),
              verified: Boolean(t('testimonials.items.item-1.verified')),
            },
            {
              name: t('testimonials.items.item-2.name'),
              role: t('testimonials.items.item-2.role'),
              image: t('testimonials.items.item-2.image'),
              heading: t('testimonials.items.item-2.heading'),
              content: t('testimonials.items.item-2.content'),
              rating: Number(t('testimonials.items.item-2.rating')) || 5.0,
              date: t('testimonials.items.item-2.date'),
              verified: Boolean(t('testimonials.items.item-2.verified')),
            },
            {
              name: t('testimonials.items.item-3.name'),
              role: t('testimonials.items.item-3.role'),
              image: t('testimonials.items.item-3.image'),
              heading: t('testimonials.items.item-3.heading'),
              content: t('testimonials.items.item-3.content'),
              rating: Number(t('testimonials.items.item-3.rating')) || 5.0,
              date: t('testimonials.items.item-3.date'),
              verified: Boolean(t('testimonials.items.item-3.verified')),
            },
            {
              name: t('testimonials.items.item-4.name'),
              role: t('testimonials.items.item-4.role'),
              image: t('testimonials.items.item-4.image'),
              heading: t('testimonials.items.item-4.heading'),
              content: t('testimonials.items.item-4.content'),
              rating: Number(t('testimonials.items.item-4.rating')) || 5.0,
              date: t('testimonials.items.item-4.date'),
              verified: Boolean(t('testimonials.items.item-4.verified')),
            },
            {
              name: t('testimonials.items.item-5.name'),
              role: t('testimonials.items.item-5.role'),
              image: t('testimonials.items.item-5.image'),
              heading: t('testimonials.items.item-5.heading'),
              content: t('testimonials.items.item-5.content'),
              rating: Number(t('testimonials.items.item-5.rating')) || 5.0,
              date: t('testimonials.items.item-5.date'),
              verified: Boolean(t('testimonials.items.item-5.verified')),
            },
            {
              name: t('testimonials.items.item-6.name'),
              role: t('testimonials.items.item-6.role'),
              image: t('testimonials.items.item-6.image'),
              heading: t('testimonials.items.item-6.heading'),
              content: t('testimonials.items.item-6.content'),
              rating: Number(t('testimonials.items.item-6.rating')) || 5.0,
              date: t('testimonials.items.item-6.date'),
              verified: Boolean(t('testimonials.items.item-6.verified')),
            },
          ]}
        />

        <CallToActionSection
          title={t('calltoaction.title')}
          description={t('calltoaction.description')}
          primaryButton={t('calltoaction.primaryButton')}
          secondaryButton={t('calltoaction.secondaryButton')}
        />
      </div>
    </>
  );
}
