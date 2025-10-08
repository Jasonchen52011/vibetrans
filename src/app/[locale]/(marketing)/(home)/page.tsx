import HeroSection from '@/components/blocks/hero/hero';
import LogoCloud from '@/components/blocks/logo-cloud/logo-cloud';
import PricingSection from '@/components/blocks/pricing/pricing';
import ExploreTools from '@/components/blocks/exploretools';
import CrispChat from '@/components/layout/crisp-chat';
import { constructMetadata } from '@/lib/metadata';
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
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    // @ts-ignore - Translation keys type mismatch
    title: t('title' as const),
    // @ts-ignore - Translation keys type mismatch
    description: t('description' as const),
    canonicalUrl: getUrlWithLocale('', locale),
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VibeTrans',
    applicationCategory: 'UtilitiesApplication',
    description:
      'VibeTrans offers powerful AI-driven translation tools for seamless language conversion. Whether you\'re translating texts, slang, or even ancient languages, VibeTrans makes communication easy.',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '8500',
      bestRating: '5',
      worstRating: '1',
    },
  };

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
    title: 'User Interests',
    subtitle: 'Tailored Solutions for Everyone',
    description:
      'VibeTrans serves diverse needs - from businesses to travelers',
    items: [
      {
        title: 'Translation for Multilingual Businesses',
        description:
          "What's your business language barrier? If you run a multilingual business, translation can become a huge task. VibeTrans helps break these barriers easily. Whether you need to translate marketing content or customer service communication, our AI tools ensure accurate and context-aware translations that support your global growth. With VibeTrans, it's like having a dedicated translation team at your fingertips.",
        image: {
          src: '/images/docs/translation-business.webp',
          alt: 'Business Translation',
        },
      },
      {
        title: 'Translation for Language Learners',
        description:
          "Your Personal Language Coach. Learning a new language can be tough, but VibeTrans is here to make it easier! Our tools can translate anything, from simple phrases to complex sentences. You can learn new vocabulary, check grammar, and understand context all in one go. Whether you're a beginner or advanced learner, VibeTrans fits your pace.",
        image: {
          src: '/images/docs/translation-learning.webp',
          alt: 'Language Learning',
        },
      },
      {
        title: 'Real-Time Translation for Travelers',
        description:
          "Traveling Made Easy. Language barriers can make travel tricky, but VibeTrans takes the stress out of your next adventure. Whether you're asking for directions or ordering food in another language, our real-time translation tools help you communicate with ease. I love how VibeTrans turns any trip into a smooth experience—language should never stop you from exploring the world!",
        image: {
          src: '/images/docs/translation-travelers.webp',
          alt: 'Travel Translation',
        },
      },
      {
        title: 'Slang and Fun Language Translations',
        description:
          "Break the Ice with Fun Translations. Sometimes you just want to have fun with language. With VibeTrans, you can easily translate slang, memes, or even gibberish into something understandable. It's perfect for adding humor to your conversations or understanding pop culture references in different languages. I think it's a great way to connect with others and lighten the mood!",
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
        {/* Hero Section */}
        <HeroSection />

        {/* Logo Cloud */}
        <LogoCloud />

        {/* Explore Tools */}
        <ExploreTools />

        {/* Pricing */}
        <PricingSection />

        <CrispChat />
      </div>
    </>
  );
}
