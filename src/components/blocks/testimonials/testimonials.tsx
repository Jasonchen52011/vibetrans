'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TestimonialColumnContainer } from './testimonial-column-container';

type Testimonial = {
  name: string;
  role: string;
  heading?: string;
  quote: string;
  src: string;
  rating?: number;
};

interface TestimonialsSectionProps {
  namespace?: string;
  section?: import('@/types/blocks/section').Section;
}

export default function TestimonialsSection({
  namespace = 'HomePage.testimonials',
  section,
}: TestimonialsSectionProps = {}) {
  // Dynamically build testimonials array based on available items
  const testimonials: Testimonial[] = [];

  // If section data is provided, use it directly
  if (section) {
    const avatarPool = [
      '/images/avatars/male1.webp',
      '/images/avatars/female1.webp',
      '/images/avatars/male2.webp',
      '/images/avatars/female2.webp',
      '/images/avatars/male3.webp',
      '/images/avatars/female3.webp',
      '/images/avatars/male4.webp',
      '/images/avatars/female4.webp',
      '/images/avatars/male5.webp',
    ];

    section.items.forEach((item, index) => {
      const originalItem = (item as any)._originalData || {};
      const name = originalItem.name || item.title || 'Anonymous User';
      const role = originalItem.role || 'Happy Customer';
      const heading = originalItem.heading || item.title || '';
      const quote = originalItem.content || item.description || 'Excellent service!';
      const rating =
        typeof originalItem.rating === 'number'
          ? originalItem.rating
          : Number.parseFloat(originalItem.rating) || 5;

      const avatarIndex = index % avatarPool.length;

      testimonials.push({
        name,
        role,
        heading: heading || undefined,
        quote,
        src: avatarPool[avatarIndex],
        rating,
      });
    });
  } else {
    // Fallback to namespace-based loading
    // @ts-ignore - Dynamic namespace support
    const t = useTranslations(namespace as any);

    // Only attempt to load testimonials if the namespace has items
    let hasItems = false;
    try {
      // @ts-ignore
      const testCheck = t.raw('items');
      hasItems = testCheck && typeof testCheck === 'object';
    } catch {
      hasItems = false;
    }

    if (hasItems) {
    // Get all available items to check how many exist
    // @ts-ignore - Dynamic namespace support
    const items = t.raw('items') as Record<string, any>;
    const availableKeys = Object.keys(items).filter((key) =>
      key.startsWith('item-')
    );

    // Sort keys numerically (item-1, item-2, etc.)
    availableKeys.sort((a, b) => {
      const numA = Number.parseInt(a.split('-')[1]);
      const numB = Number.parseInt(b.split('-')[1]);
      return numA - numB;
    });

    for (const itemKey of availableKeys) {
      try {
        // @ts-ignore - Dynamic translation keys
        const nameCheck = t(`items.${itemKey}.name`, { default: '' });

        // If the translation doesn't exist, skip it
        if (!nameCheck || nameCheck === '') {
          continue;
        }

        // Now safely get all values
        // @ts-ignore - Dynamic translation keys
        const name = nameCheck;
        // @ts-ignore - Dynamic translation keys
        const role = t(`items.${itemKey}.role`);
        // @ts-ignore - Dynamic translation keys
        const heading = t(`items.${itemKey}.heading`, { default: '' });
        // Filter out translation keys that weren't found
        const headingValue =
          heading && !heading.includes(`items.${itemKey}`) ? heading : '';
        // @ts-ignore - Dynamic translation keys
        const quote = t(`items.${itemKey}.content`);
        // Use t.raw for non-string values to avoid INVALID_MESSAGE errors
        // @ts-ignore - Dynamic translation keys
        const ratingRaw = t.raw(`items.${itemKey}.rating`);
        // @ts-ignore - Dynamic translation keys
        const dateRaw = t.raw(`items.${itemKey}.date`);
        // @ts-ignore - Dynamic translation keys
        const verifiedRaw = t.raw(`items.${itemKey}.verified`);

        const rating =
          typeof ratingRaw === 'number'
            ? ratingRaw
            : Number.parseFloat(ratingRaw) || 5;
        const date = typeof dateRaw === 'string' ? dateRaw : '';
        const verified =
          typeof verifiedRaw === 'boolean' ? verifiedRaw : Boolean(verifiedRaw);

        // Use local avatar images to avoid duplicates
        const avatarPool = [
          '/images/avatars/male1.webp',
          '/images/avatars/female1.webp',
          '/images/avatars/male2.webp',
          '/images/avatars/female2.webp',
          '/images/avatars/male3.webp',
          '/images/avatars/female3.webp',
          '/images/avatars/male4.webp',
          '/images/avatars/female4.webp',
          '/images/avatars/male5.webp',
        ];
        const itemNumber = Number.parseInt(itemKey.split('-')[1]);
        const avatarIndex = (itemNumber - 1) % avatarPool.length;

        testimonials.push({
          name,
          role,
          heading: headingValue || undefined,
          quote,
          src: avatarPool[avatarIndex],
          rating:
            typeof rating === 'number'
              ? rating
              : Number.parseFloat(rating) || 5.0,
        });
      } catch (error) {
        // If translation doesn't exist, skip this item and continue
        continue;
      }
    }
    }
  }

  // If no testimonials found, don't render the section
  if (testimonials.length === 0) {
    return null;
  }

  // Note: MISSING_MESSAGE errors in development console are expected behavior
  // when the loop checks for items beyond what's available in translations.
  // This is harmless and allows flexible content without manual item counts.

  // Dynamically split testimonials into 3 columns
  const itemsPerColumn = Math.ceil(testimonials.length / 3);
  const column1 = testimonials.slice(0, itemsPerColumn);
  const column2 = testimonials.slice(itemsPerColumn, itemsPerColumn * 2);
  const column3 = testimonials.slice(itemsPerColumn * 2);

  return (
    <section id="testimonials" className="relative z-20 py-10 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* @ts-ignore - Dynamic namespace support */}

        <div className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-4 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <TestimonialColumnContainer shift={10}>
            {[...column1, ...column1].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Column 2 - Hidden on mobile */}
          <TestimonialColumnContainer className="hidden md:block" shift={15}>
            {[...column2, ...column2].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Column 3 - Hidden on mobile and tablet */}
          <TestimonialColumnContainer className="hidden lg:block" shift={10}>
            {[...column3, ...column3].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background" />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating || 5.0;

  return (
    <figure className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-xl border border-gray-100 dark:from-neutral-900 dark:to-neutral-800 dark:border-neutral-700 hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* 顶部信息条 */}
        <div className="flex items-center justify-between mb-4">
          {/* 左侧：星星评分 */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 标题（如果有） */}
        {testimonial.heading && (
          <h3 className="text-lg font-semibold text-foreground mb-3 before:content-['\201C'] after:content-['\201D']">
            {testimonial.heading}
          </h3>
        )}

        {/* 评论内容 */}
        <blockquote className="flex-grow mb-4">
          <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
            "{testimonial.quote}"
          </p>
        </blockquote>

        {/* 底部作者信息 */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {testimonial.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {testimonial.role}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Recent Review
              </p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
