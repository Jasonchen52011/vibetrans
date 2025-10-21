'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
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
}: { namespace?: string } = {}) {
  const locale = useLocale();
  // @ts-ignore - Dynamic namespace support
  const t = useTranslations(namespace as any);

  // Use useMemo to build testimonial items only once
  const testimonialItems = useMemo(() => {
    const items: TestimonialItem[] = [];

    // Only attempt to load testimonials if the namespace has items
    let hasItems = false;
    try {
      // Check if items exist by trying to get first item
      const firstItemName = t('items.item-1.name', { default: null });
      hasItems = firstItemName && !firstItemName.includes('items.item-1.name');
    } catch (error) {
      hasItems = false;
    }

    if (hasItems) {
      // Try to load up to 3 testimonials
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
          const heading = t(`items.${key}.heading`);
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

    return items;
  }, [t, namespace]);

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
          // @ts-ignore - Dynamic translation keys
          subtitle={t('subtitle')}
          subtitleAs="h2"
          description={t('title')}
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
                    // Round rating for display: 4.5+ shows as 5 stars, 4.0-4.4 shows as 4 stars, etc.
                    const displayRating = Math.round(rating);

                    return (
                      <>
                        {[...Array(5)].map((_, i) => {
                          let starClass = 'fill-gray-200 text-gray-300';
                          const starStyle = {};

                          if (i < displayRating) {
                            // Full star
                            starClass = 'fill-yellow-400 text-yellow-400';
                          }

                          return (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${starClass}`}
                              style={starStyle}
                              strokeWidth={1.5}
                              fill="currentColor"
                            />
                          );
                        })}
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

        {/* Bottom decorative element */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <span>Real feedback from real users</span>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
