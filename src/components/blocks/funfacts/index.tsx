'use client';

import Icon from '@/components/icon';
import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import type { Section as SectionType } from '@/types/blocks/section';

interface UserScenariosProps {
  section: SectionType;
  ctaText?: string;
}

export default function UserScenarios({
  section,
  ctaText = 'Try ShipAny Now',
}: UserScenariosProps) {
  if (section.disabled) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Section Title */}
      {section.title && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-16">
          <HeaderSection subtitle={section.title} subtitleAs="h2" />
        </div>
      )}

      {section.items?.map((item, index) => {
        // 确定图片顺序 - 交替显示
        const imageFirst = index % 2 === 0;

        return (
          <section key={index} className="sm:py-16 py-6 bg-white">
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
              <div className="max-w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 items-center">
                  {/* Image */}
                  <div
                    className={`flex justify-center ${imageFirst ? 'order-1 lg:order-1' : 'order-1 lg:order-2'} lg:col-span-3`}
                  >
                    <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden">
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
                    className={`space-y-10 ${imageFirst ? 'order-2 lg:order-2' : 'order-2 lg:order-1'} lg:col-span-2`}
                  >
                    <h3 className="text-left text-xl md:text-2xl font-semibold text-black dark:text-white mb-6">
                      {item.title}
                    </h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-start">
                      <Button onClick={scrollToTop} size="lg" variant="default">
                        {ctaText}
                        <Icon name="FaArrowRight" />
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
