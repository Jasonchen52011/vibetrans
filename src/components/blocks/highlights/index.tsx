'use client';

import Icon from '@/components/icon';
import type { Section as SectionType } from '@/types/blocks/section';

export default function HighlightsSection({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-10 mt-10 mb-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight mb-2 sm:mb-6">
            {section.title}
          </h2>
          {section.description && (
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid w-full grid-cols-1 lg:grid-cols-4 gap-4">
          {section.items?.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
            >
              {item.icon && (
                <div className="w-9 h-9 flex items-center justify-center mx-auto mb-6">
                  <Icon
                    name={item.icon}
                    className="w-full h-full text-primary"
                  />
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
