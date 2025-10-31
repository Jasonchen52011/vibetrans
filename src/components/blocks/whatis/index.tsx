'use client';

import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';

interface WhatIsSection {
  title: string;
  description: string;
  features: string[];
  image?: {
    src: string;
    alt: string;
  };
  cta?: {
    text: string;
    action?: () => void;
  };
}

export default function WhatIsSection({ section }: { section: WhatIsSection }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-4 mt-10 mb-10 bg-white">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="max-w-full mx-auto">
          <div
            className={`grid grid-cols-1 ${section.image ? 'lg:grid-cols-2' : ''} gap-6 items-center justify-items-center`}
          >
            {/* Text content - Left side */}
            <div
              className={`space-y-6 ${section.image ? 'order-2 lg:order-1' : ''} text-center lg:text-left relative z-10 w-full`}
            >
              <h2 className="text-center lg:text-left tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight mb-6 select-text">
                {section.title}
              </h2>

              <p className="text-gray-600 text-sm sm:text-lg leading-relaxed text-center lg:text-left select-text">
                {section.description}
              </p>

              {section.features && section.features.length > 0 && (
                <ul className="space-y-3 text-center lg:text-left select-text">
                  {section.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-gray-700 text-sm sm:text-base select-text"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col items-center lg:items-start pt-4">
                <Button
                  onClick={section.cta?.action || scrollToTop}
                  size="lg"
                  variant="default"
                >
                  {section.cta?.text || 'Get Started'}
                  <Icon name="FaArrowRight" />
                </Button>
              </div>
            </div>

            {/* Image - Right side */}
            {section.image && (
              <div className="flex justify-center order-1 lg:order-2 w-full">
                <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={section.image.src}
                    alt={section.image.alt}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
