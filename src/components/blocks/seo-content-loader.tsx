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
    async function loadSEOContent() {
      try {
        setLoading(true);
        setError(null);

        // 动态加载SEO内容
        const response = await fetch(`/api/seo-content/${translatorKey}?locale=${locale}`);

        if (!response.ok) {
          throw new Error(`Failed to load SEO content: ${response.status}`);
        }

        const content = await response.json();
        setSeoContent(content);
      } catch (err) {
        console.warn('Failed to load SEO content:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // 提供默认内容作为fallback
        setSeoContent(getDefaultSEOContent());
      } finally {
        setLoading(false);
      }
    }

    loadSEOContent();
  }, [translatorKey, locale]);

  // 默认SEO内容（作为fallback）
  function getDefaultSEOContent(): SEOContent {
    return {
      whatIs: {
        title: 'About This Tool',
        description: 'Professional translation tool powered by AI.',
        image: {
          src: '/images/placeholder.webp',
          alt: 'Translation tool illustration',
        },
      },
      examples: {
        title: 'Translation Examples',
        description: 'See how our tool works with real examples.',
        items: [],
      },
      howto: {
        name: 'howto',
        title: 'How to Use',
        subtitle: 'Simple steps to get started',
        description: 'Follow these easy steps to translate your text.',
        items: [
          {
            title: 'Enter Your Text',
            description: 'Type or paste your text in the input field.',
          },
          {
            title: 'Click Translate',
            description: 'Press the translate button to process your text.',
          },
          {
            title: 'Get Results',
            description: 'Your translated text will appear instantly.',
          },
        ],
      },
      highlights: {
        name: 'highlights',
        title: 'Why Choose Us',
        subtitle: 'Professional translation features',
        description: 'Experience the best translation tool with advanced features.',
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
        ],
      },
      funFacts: {
        name: 'funfacts',
        title: 'Interesting Facts',
        subtitle: 'Learn something new',
        description: 'Discover interesting facts about translation.',
        items: [],
      },
      userInterest: {
        name: 'userInterest',
        title: 'Use Cases',
        subtitle: 'Perfect for everyone',
        description: 'See how people use our translation tool.',
        items: [],
      },
      testimonials: {
        name: 'testimonials',
        title: 'User Reviews',
        subtitle: 'What our users say',
        description: 'Read reviews from our happy users.',
        items: [],
      },
      faqs: {
        name: 'faqs',
        title: 'Frequently Asked Questions',
        subtitle: 'Got questions? We have answers.',
        description: 'Find answers to common questions about our tool.',
        items: [
          {
            title: 'Is this tool free?',
            description: 'Yes, our translation tool is completely free to use.',
          },
          {
            title: 'How accurate are the translations?',
            description: 'Our AI-powered translations are highly accurate for most use cases.',
          },
        ],
      },
      cta: {
        title: 'Try Our Translation Tool',
        description: 'Start translating your text now with our powerful AI translator.',
        primaryButton: 'Start Translating',
        secondaryButton: 'Learn More',
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