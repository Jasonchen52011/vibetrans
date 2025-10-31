'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Card, CardContent } from '@/components/ui/card';
import type { Section } from '@/types/blocks/section';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  heading: string;
  content: string;
  rating?: number;
};

export default function TestimonialsThreeColumnSection({
  namespace = 'HomePage.testimonials',
  subNamespace,
  section,
}: {
  namespace?: string;
  subNamespace?: string;
  section?: Section;
} = {}) {
  const locale = useLocale();

  // If section data is provided, use it directly
  if (section) {
    const testimonialItems: TestimonialItem[] = section.items.map(
      (item, index) => {
        // Extract data from the section item structure
        // The data has been processed by mapSectionItems, so we need to access it differently
        const originalItem = (item as any)._originalData || {};

        return {
          id: `item-${index + 1}`,
          name: originalItem.name || item.title || 'Anonymous User',
          role: originalItem.role || 'Happy Customer',
          heading: originalItem.heading || item.title || 'Great Experience',
          content:
            originalItem.content || item.description || 'Excellent service!',
          rating:
            typeof originalItem.rating === 'number'
              ? originalItem.rating
              : Number.parseFloat(originalItem.rating) || 5,
        };
      }
    );

    // If no testimonial items found, don't render the section
    if (testimonialItems.length === 0) {
      return null;
    }

    return (
      <section
        id="testimonials"
        className="px-4 py-16 bg-gradient-to-b from-background to-muted/20"
      >
        <div className="mx-auto max-w-6xl">
          <HeaderSection
            title={section.title}
            subtitle={section.subtitle}
            subtitleAs="h2"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {testimonialItems.map((item, index) => (
              <Card
                key={item.id}
                className="relative h-full group hover:shadow-xl transition-all duration-500 border border-primary/10 overflow-hidden"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />

                <CardContent className="p-6 pt-8">
                  {/* Rating stars */}
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const rating = item.rating || 5;
                      return (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={`full-${i}`}
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-base font-semibold text-foreground ml-1">
                            {rating.toFixed(1)}
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Testimonial heading */}
                  {item.heading && (
                    <div className="mb-3">
                      <h4 className="text-base font-semibold text-foreground leading-relaxed">
                        "{item.heading}"
                      </h4>
                    </div>
                  )}

                  {/* Testimonial content */}
                  <blockquote className="mb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{item.content}"
                    </p>
                  </blockquote>

                  {/* Author info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {item.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground mb-1">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.role}
                      </div>
                    </div>
                  </div>

                  {/* Decorative quote mark */}
                  <div className="absolute top-4 left-4 text-4xl text-primary/10 font-serif">
                    "
                  </div>
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Build the actual namespace based on whether subNamespace is provided
  const actualNamespace = subNamespace
    ? `${namespace}.${subNamespace}`
    : namespace;

  // Safe translation access with fallback
  let t: any;
  try {
    // @ts-ignore - Dynamic namespace support
    t = useTranslations(actualNamespace as any);
  } catch (error) {
    console.warn(
      `Failed to load translations for namespace: ${actualNamespace}`,
      error
    );
    // Return null to not render the section if translations are not available
    return null;
  }

  // Helper function to access nested translation keys
  const getNestedTranslation = (key: string, fallback?: any) => {
    try {
      const result = t(key, fallback);

      // If the result is the key itself, it means translation failed
      if (typeof result === 'string' && result === key) {
        return fallback || '';
      }

      return result;
    } catch (e) {
      console.warn(`Translation access failed for ${key}:`, e);
      return fallback || '';
    }
  };

  // Use useMemo to build testimonial items and check title/subtitle
  const testimonialData = useMemo(() => {
    const items: TestimonialItem[] = [];

    // Check if title and subtitle are valid
    let titleValid = false;
    let subtitleValid = false;
    try {
      const titleValue = getNestedTranslation('title', '');
      const subtitleValue = getNestedTranslation('subtitle', '');
      // Check if the value looks like a translation key (invalid) vs actual title text (valid)
      const isTranslationKey = (value: string) => {
        // Translation keys usually contain dots or look like "testimonials.title"
        // But actual titles should not contain these patterns
        return (
          value.includes('.') ||
          value.includes('testimonials.title') ||
          value.includes('testimonials.subtitle') ||
          value === 'title' ||
          value === 'subtitle'
        );
      };
      titleValid =
        titleValue &&
        !isTranslationKey(titleValue) &&
        titleValue.trim().length > 0;
      subtitleValid =
        subtitleValue &&
        !isTranslationKey(subtitleValue) &&
        subtitleValue.trim().length > 0;
    } catch (error) {
      titleValid = false;
      subtitleValid = false;
    }

    // Only attempt to load testimonials if the namespace has items
    let hasItems = false;
    try {
      // Check if we can access item-1 directly
      const firstItemName = t(`items.item-1.name`, { default: null });
      hasItems = firstItemName && !firstItemName.includes(`items.item-1.name`);
    } catch (error) {
      hasItems = false;
    }

    if (hasItems) {
      // Try to load up to 3 testimonials (item-1 format)
      for (let i = 1; i <= 3; i++) {
        const key = `item-${i}`;

        try {
          // @ts-ignore - Dynamic translation keys with fallback
          const name = t(`items.${key}.name`, { default: null });

          if (!name || name.includes(`items.${key}.name`)) {
            break;
          }

          // @ts-ignore - Dynamic translation keys
          const role = t(`items.${key}.role`);
          const heading = getNestedTranslation(`items.${key}.heading`, '');
          const content = t(`items.${key}.content`);

          // Get rating from translation (now stored as string in JSON)
          let ratingValue = 5; // Default rating
          try {
            const ratingStr = t(`items.${key}.rating`, { default: '5.0' });
            ratingValue = Number.parseFloat(ratingStr) || 5;
          } catch (e) {
            ratingValue = 5;
          }

          items.push({
            id: key,
            name,
            role,
            heading,
            content,
            rating: ratingValue,
          });
        } catch {
          break;
        }
      }
    }

    return {
      testimonialItems: items,
      hasValidTitle: titleValid,
      hasValidSubtitle: subtitleValid,
    };
  }, [t, actualNamespace]);

  // If no testimonial items found, don't render the section
  if (testimonialData.testimonialItems.length === 0) {
    return null;
  }

  return (
    <section
      id="testimonials"
      className="px-4 py-16 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="mx-auto max-w-6xl">
        <HeaderSection
          // @ts-ignore - Dynamic translation keys
          title={
            testimonialData.hasValidTitle
              ? getNestedTranslation('title')
              : undefined
          }
          subtitle={
            testimonialData.hasValidSubtitle
              ? getNestedTranslation('subtitle')
              : undefined
          }
          subtitleAs="h2"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {testimonialData.testimonialItems.map((item, index) => (
            <Card
              key={item.id}
              className="relative h-full group hover:shadow-xl transition-all duration-500 border border-primary/10 overflow-hidden"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />

              <CardContent className="p-6 pt-8">
                {/* Rating stars */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const rating =
                      typeof item.rating === 'number' ? item.rating : 5;
                    const showHalfStar = rating < 5;
                    const halfStarId = `testimonial-half-${index}`;

                    return (
                      <>
                        {[...Array(4)].map((_, i) => (
                          <svg
                            key={`full-${i}`}
                            className="w-5 h-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          {showHalfStar ? (
                            <>
                              <defs>
                                <linearGradient id={halfStarId}>
                                  <stop offset="50%" stopColor="currentColor" />
                                  <stop offset="50%" stopColor="transparent" />
                                </linearGradient>
                              </defs>
                              <path
                                fill={`url(#${halfStarId})`}
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              />
                              <path
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              />
                            </>
                          ) : (
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          )}
                        </svg>
                        <span className="text-base font-semibold text-foreground ml-1">
                          {rating.toFixed(1)}
                        </span>
                      </>
                    );
                  })()}
                </div>

                {/* Testimonial heading */}
                {item.heading && (
                  <div className="mb-3">
                    <h4 className="text-base font-semibold text-foreground leading-relaxed">
                      "{item.heading}"
                    </h4>
                  </div>
                )}

                {/* Testimonial content */}
                <blockquote className="mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{item.content}"
                  </p>
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {item.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground mb-1">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.role}
                    </div>
                  </div>
                </div>

                {/* Decorative quote mark */}
                <div className="absolute top-4 left-4 text-4xl text-primary/10 font-serif">
                  "
                </div>
              </CardContent>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
