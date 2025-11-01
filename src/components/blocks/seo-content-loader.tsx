'use client';

import React, { useState, useEffect } from 'react';
import BeforeAfterSection from './Examples';
import FaqSection from './faqs/faqs';
import UserScenarios from './funfacts';
import WhyChoose from './highlights';
import HowTo from './how-to';
import TestimonialsThreeColumnSection from './testimonials/testimonials-three-column';
import WhatIsSection from './whatis';
import type { Section } from '@/types/blocks/section';

interface SEOContentLoaderProps {
  translatorKey: string;
  locale: string;
  children: (content: any) => React.ReactNode;
}

interface SEOContent {
  whatIs: any;
  examples: any;
  howto: Section;
  highlights: Section;
  funFacts: Section;
  userInterest: Section;
  testimonials: Section;
  faqs: Section;
  cta: any;
}

/**
 * 客户端SEO内容加载器 - 避免在服务器bundle中包含大量SEO内容
 */
export default function SEOContentLoader({
  translatorKey,
  locale,
  children
}: SEOContentLoaderProps) {
  const [seoContent, setSeoContent] = useState<SEOContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 暂时直接使用默认内容，避免API调用问题
    setSeoContent(getDefaultSEOContent());
    setLoading(false);
  }, [translatorKey, locale]);

  // 默认SEO内容（根据翻译器类型定制）
  function getDefaultSEOContent(): SEOContent {
    const isMinionTranslator = translatorKey === 'minion-translator';
    const isAlienTextGenerator = translatorKey === 'alien-text-generator';

    return {
      whatIs: {
        title: isMinionTranslator ? 'What is Minion Translator?' : isAlienTextGenerator ? 'What is Alien Text Generator?' : 'Professional AI Translation Tool',
        description: isMinionTranslator
          ? 'Minion Translator is a fun AI-powered tool that converts your regular text into the hilarious banana language spoken by Minions from Despicable Me. Perfect for creating funny social media posts, memes, or just having a good time with friends!'
          : isAlienTextGenerator
          ? 'Alien Text Generator is a creative AI tool that transforms your text into fascinating extraterrestrial languages. Perfect for sci-fi fans, game developers, and creative writers looking to add authentic alien flavor to their content!'
          : 'Advanced AI-powered translation tool that provides accurate, context-aware translations for various languages and dialects.',
        image: {
          src: isMinionTranslator ? '/images/docs/minion-translator-hero.webp' : isAlienTextGenerator ? '/images/docs/alien-text-generator-hero.webp' : '/images/docs/translation-tool-hero.webp',
          alt: isMinionTranslator ? 'Minion language translation illustration' : isAlienTextGenerator ? 'Alien text generation illustration' : 'AI translation tool illustration',
        },
      },
      examples: {
        title: 'Generation Examples',
        description: `See how our ${isMinionTranslator ? 'Minion' : isAlienTextGenerator ? 'alien text' : 'translation'} tool works with real examples.`,
        items: isMinionTranslator ? [
          {
            alt: 'Normal: Hello friend → Minion: Bello fiend!',
            name: 'Friendly Greeting',
          },
          {
            alt: 'Normal: I love bananas → Minion: Me luv banana!',
            name: 'Minion Favorite',
          },
          {
            alt: 'Normal: Let\'s play! → Minion: Le\'s pray!',
            name: 'Play Time',
          },
        ] : isAlienTextGenerator ? [
          {
            alt: 'Normal: Hello Earthlings → Alien: *Zorp glorp bleep*',
            name: 'First Contact',
          },
          {
            alt: 'Normal: We come in peace → Alien: *Vortex harmonics engage*',
            name: 'Peace Message',
          },
          {
            alt: 'Normal: Take me to your leader → Alien: *Quantum signal transmit*',
            name: 'Diplomatic Request',
          },
        ] : [
          {
            alt: 'Professional translation example',
            name: 'Business Translation',
          },
          {
            alt: 'Casual conversation translation',
            name: 'Daily Communication',
          },
        ],
      },
      howto: {
        name: 'howto',
        title: 'How to Use',
        subtitle: 'Simple steps to get started',
        description: `Follow these easy steps to ${isMinionTranslator ? 'translate to Minion language' : isAlienTextGenerator ? 'generate alien text' : 'translate your text'}.`,
        items: [
          {
            title: 'Enter Your Text',
            description: `Type or paste your ${isMinionTranslator ? 'regular text' : isAlienTextGenerator ? 'message' : 'text'} in the input field.`,
          },
          {
            title: 'Generate',
            description: `Press the ${isMinionTranslator ? 'Translate to Minion' : isAlienTextGenerator ? 'Generate Alien Text' : 'Translate'} button to process your text.`,
          },
          {
            title: 'Get Results',
            description: `Your ${isMinionTranslator ? 'Minion language' : isAlienTextGenerator ? 'alien language' : 'translated text'} will appear instantly.`,
          },
          {
            title: 'Copy & Share',
            description: 'Copy the result and share it with friends!',
          },
        ],
      },
      highlights: {
        name: 'highlights',
        title: 'Why Choose Us',
        subtitle: 'Professional translation features',
        description: `Experience the best ${isMinionTranslator ? 'Minion language' : 'translation'} tool with advanced features.`,
        items: [
          {
            title: 'Fast & Accurate',
            description: 'Get instant translations with high accuracy.',
          },
          {
            title: 'Easy to Use',
            description: 'Simple interface designed for everyone.',
          },
          {
            title: 'Free to Use',
            description: 'No registration or payment required.',
          },
          {
            title: 'Multiple Languages',
            description: 'Support for various languages and dialects.',
          },
        ],
      },
      funFacts: {
        name: 'funfacts',
        title: isMinionTranslator ? 'Fun Facts About Minions' : 'Translation Insights',
        subtitle: 'Learn something new',
        description: isMinionTranslator
          ? 'Discover interesting facts about Minions and their unique language!'
          : 'Learn fascinating facts about translation and language.',
        items: isMinionTranslator ? [
          {
            title: 'Minion Language Origins',
            description: 'The Minion language is a fun mix of English, Spanish, French, and other languages, created specifically for the Despicable Me movies.',
          },
          {
            title: 'Popular Words',
            description: 'Words like "Banana", "Bello", "Poopaye" and "Tulaliloo" are the most recognized Minion expressions!',
          },
        ] : [
          {
            title: 'AI Translation Evolution',
            description: 'Modern AI translation has evolved from simple word replacement to understanding context and nuance.',
          },
        ],
      },
      userInterest: {
        name: 'userInterest',
        title: 'Use Cases',
        subtitle: 'Perfect for everyone',
        description: `See how people use our ${isMinionTranslator ? 'Minion language' : 'translation'} tool.`,
        items: isMinionTranslator ? [
          {
            title: 'Social Media Fun',
            description: 'Create funny posts and stories that your friends will love!',
          },
          {
            title: 'Meme Creation',
            description: 'Generate hilarious Minion text for memes and viral content.',
          },
          {
            title: 'Party Entertainment',
            description: 'Use Minion speak at parties and gatherings for laughs!',
          },
        ] : [
          {
            title: 'Business Communication',
            description: 'Professional translation for international business.',
          },
          {
            title: 'Language Learning',
            description: 'Practice and learn new languages effectively.',
          },
        ],
      },
      testimonials: {
        name: 'testimonials',
        title: 'User Reviews',
        subtitle: 'What our users say',
        description: 'Read reviews from our happy users.',
        items: [
          {
            title: 'Amazing Tool!',
            description: isMinionTranslator
              ? 'This Minion translator is hilarious! My friends love it when I send them Minion messages.'
              : 'The translation quality is outstanding and very accurate.',
          },
          {
            title: 'So Much Fun',
            description: isMinionTranslator
              ? 'Perfect for creating funny content. The Minion language sounds authentic!'
              : 'Easy to use interface and fast translations.',
          },
        ],
      },
      faqs: {
        name: 'faqs',
        title: 'Frequently Asked Questions',
        subtitle: 'Got questions? We have answers.',
        description: `Find answers to common questions about our ${isMinionTranslator ? 'Minion language' : 'translation'} tool.`,
        items: [
          {
            title: 'Is this tool free?',
            description: 'Yes, our translation tool is completely free to use.',
          },
          {
            title: 'How accurate are the translations?',
            description: isMinionTranslator
              ? 'Our Minion translator captures the fun and playful essence of Minion language perfectly!'
              : 'Our AI-powered translations are highly accurate for most use cases.',
          },
          {
            title: 'Can I use this for commercial purposes?',
            description: 'Yes, you can use our translations for personal and commercial purposes.',
          },
          {
            title: 'Do I need to register?',
            description: 'No registration required. Just start translating right away!',
          },
        ],
      },
      cta: {
        title: isMinionTranslator ? 'Try Minion Translator Now!' : 'Start Translating Today!',
        description: isMinionTranslator
          ? 'Transform your text into hilarious Minion language and share the fun with friends!'
          : 'Start translating your text now with our powerful AI translator.',
        primaryButton: isMinionTranslator ? 'Try Minion Translator' : 'Start Translating',
        secondaryButton: 'Explore More Tools',
      },
    };
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 max-w-md"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 max-w-lg"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 max-w-md"></div>
        <div className="h-4 bg-gray-200 rounded max-w-sm"></div>
      </div>
    );
  }

  if (error) {
    console.warn('SEO content loading failed, using fallback:', error);
  }

  if (!seoContent) {
    return <div>No content available</div>;
  }

  return <>{children(seoContent)}</>;
}

/**
 * SEO内容渲染器组件
 */
export function SEOContentRenderer({ content }: { content: SEOContent }) {
  return (
    <>
      {/* What Is Section */}
      <WhatIsSection section={content.whatIs} />

      {/* Examples Section */}
      <BeforeAfterSection beforeAfterGallery={content.examples} />

      {/* How to Section */}
      <HowTo section={content.howto} />

      {/* User Interest Blocks */}
      <UserScenarios section={content.userInterest} ctaText="Try Now" />

      {/* Fun Facts */}
      <UserScenarios section={content.funFacts} ctaText="Try Now" />

      {/* Highlights */}
      <WhyChoose section={content.highlights} />

      {/* Testimonials */}
      <TestimonialsThreeColumnSection section={content.testimonials} />

      {/* FAQ */}
      <FaqSection section={content.faqs} />

      {/* CTA */}
      <div className="bg-muted/20 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{content.cta.title}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {content.cta.description}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {content.cta.primaryButton}
            </button>
            <button className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
              {content.cta.secondaryButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}