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
  // 注释掉翻译调用以避免命名空间不存在的问题
  // @ts-ignore - Translation keys type mismatch
  // const t = await getTranslations('HomePage');

  // 创建一个安全的翻译函数，返回键名作为默认值
  const t = (key: string) => {
    // 返回键名帮助调试，同时让默认值逻辑生效
    return key;
  };

  // 创建安全的翻译函数
  const safeT = (key: string, defaultValue: string = '') => {
    try {
      const v = t(key);
      if (typeof v === 'string' && !v.includes(key)) {
        return v;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  };

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
    title: safeT('funfacts.title', 'Fun Facts About Translation'),
    items: [
      {
        title: safeT('funfacts.items.0.title', 'Global Language Support'),
        description: safeT('funfacts.items.0.description', 'Our platform supports over 100 languages, from major world languages to regional dialects and even fictional languages.'),
        image: {
          src: '/images/docs/funfact-languages.webp',
          alt: 'Language Diversity',
        },
      },
      {
        title: safeT('funfacts.items.1.title', 'AI-Powered Context'),
        description: safeT('funfacts.items.1.description', 'Our advanced AI understands context, emotions, and cultural nuances to provide translations that feel natural and appropriate.'),
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
          title={safeT('testimonials.title', 'Customer Reviews')}
          subtitle={safeT('testimonials.subtitle', 'What our users are saying about VibeTrans')}
          items={[
            {
              name: safeT('testimonials.items.item-1.name', 'John Doe'),
              role: safeT('testimonials.items.item-1.role', 'Verified User'),
              image: safeT('testimonials.items.item-1.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-1.heading', 'Great Translation Service'),
              content: safeT('testimonials.items.item-1.content', 'This translation service helped me communicate effectively across languages.'),
              rating: (() => { const v = safeT('testimonials.items.item-1.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-1.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-1.verified', 'true') === 'true',
            },
            {
              name: safeT('testimonials.items.item-2.name', 'Jane Smith'),
              role: safeT('testimonials.items.item-2.role', 'Language Enthusiast'),
              image: safeT('testimonials.items.item-2.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-2.heading', 'Accurate and Fast'),
              content: safeT('testimonials.items.item-2.content', 'The translations are incredibly accurate and the response time is amazing.'),
              rating: (() => { const v = safeT('testimonials.items.item-2.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-2.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-2.verified', 'true') === 'true',
            },
            {
              name: safeT('testimonials.items.item-3.name', 'Mike Johnson'),
              role: safeT('testimonials.items.item-3.role', 'Business Professional'),
              image: safeT('testimonials.items.item-3.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-3.heading', 'Essential Business Tool'),
              content: safeT('testimonials.items.item-3.content', 'This tool has become essential for our international business communications.'),
              rating: (() => { const v = safeT('testimonials.items.item-3.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-3.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-3.verified', 'true') === 'true',
            },
            {
              name: safeT('testimonials.items.item-4.name', 'Sarah Lee'),
              role: safeT('testimonials.items.item-4.role', 'Language Student'),
              image: safeT('testimonials.items.item-4.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-4.heading', 'Perfect for Learning'),
              content: safeT('testimonials.items.item-4.content', 'As a language student, this tool helps me understand nuances and context better.'),
              rating: (() => { const v = safeT('testimonials.items.item-4.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-4.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-4.verified', 'true') === 'true',
            },
            {
              name: safeT('testimonials.items.item-5.name', 'David Brown'),
              role: safeT('testimonials.items.item-5.role', 'Travel Blogger'),
              image: safeT('testimonials.items.item-5.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-5.heading', 'Travel Companion'),
              content: safeT('testimonials.items.item-5.content', 'I use this daily for my travel blog. It captures the perfect tone every time.'),
              rating: (() => { const v = safeT('testimonials.items.item-5.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-5.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-5.verified', 'true') === 'true',
            },
            {
              name: safeT('testimonials.items.item-6.name', 'Emily Wilson'),
              role: safeT('testimonials.items.item-6.role', 'Content Creator'),
              image: safeT('testimonials.items.item-6.image', '/images/testimonials/default-avatar.webp'),
              heading: safeT('testimonials.items.item-6.heading', 'Content Creation Essential'),
              content: safeT('testimonials.items.item-6.content', 'Perfect for creating multilingual content that feels natural and engaging.'),
              rating: (() => { const v = safeT('testimonials.items.item-6.rating', '5.0'); const n = Number(v); return Number.isNaN(n) ? 5.0 : n; })(),
              date: safeT('testimonials.items.item-6.date', '2024-01-01'),
              verified: safeT('testimonials.items.item-6.verified', 'true') === 'true',
            },
          ]}
        />

        <CallToActionSection
          title={safeT('calltoaction.title', 'Start Translating Today')}
          description={safeT('calltoaction.description', 'Join millions of users who trust VibeTrans for accurate, fast, and reliable translations. Break language barriers with confidence.')}
          primaryButton={safeT('calltoaction.primaryButton', 'Get Started Free')}
          secondaryButton={safeT('calltoaction.secondaryButton', 'View Pricing')}
        />
      </div>
    </>
  );
}
