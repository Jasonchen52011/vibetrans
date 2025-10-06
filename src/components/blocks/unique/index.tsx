'use client';

import Icon from '@/components/icon';
import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import type { Section as SectionType } from '@/types/blocks/section';

interface UniqueSectionProps {
  section: SectionType;
  ctaText?: string;
}

export default function UniqueSection({
  section,
  ctaText = 'Try VibeTrans Translator Now!',
}: UniqueSectionProps) {
  if (section.disabled) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Section Title */}
      {(section.title || section.subtitle || section.description) && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-16">
          <HeaderSection
            title={section.title}
            subtitle={section.subtitle}
            subtitleAs="h2"
            description={section.description}
          />
        </div>
      )}

      {section.items?.map((item, index) => {
        // Alternate image position - even indices on left, odd on right
        const imageFirst = index % 2 === 0;

        return (
          <section key={index} className="sm:py-16 py-6 bg-white">
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
              <div className="max-w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                  {/* Image */}
                  <div
                    className={`flex justify-center ${imageFirst ? 'order-1 lg:order-1' : 'order-1 lg:order-2'} lg:col-span-3`}
                  >
                    <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-lg">
                      {item.image?.src && (
                        <img
                          src={item.image.src}
                          alt={item.image.alt || item.title || ''}
                          className="w-full h-auto object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Text content */}
                  <div
                    className={`space-y-6 ${imageFirst ? 'order-2 lg:order-2' : 'order-2 lg:order-1'} lg:col-span-2`}
                  >
                    <h3 className="text-left text-xl md:text-3xl font-semibold text-black dark:text-white">
                      {item.title}
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm sm:text-lg leading-relaxed text-left">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-start pt-4">
                      <Button onClick={scrollToTop} size="lg" variant="default">
                        {ctaText}
                        <Icon name="FaArrowUp" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
