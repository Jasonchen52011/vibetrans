'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Card, CardContent } from '@/components/ui/card';
import type { IconName } from 'lucide-react/dynamic';
import { useLocale, useTranslations } from 'next-intl';

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

export default function FaqThreeColumnSection({
  namespace = 'HomePage.faqs',
}: { namespace?: string } = {}) {
  const locale = useLocale();
  // @ts-ignore - Dynamic namespace support
  const t = useTranslations(namespace as any);

  // Dynamically build FAQ items based on available translations
  const faqItems: FAQItem[] = [];
  const icons: IconName[] = ['help-circle', 'info', 'message-circle'];

  // Only attempt to load FAQs if the namespace has items
  let hasItems = false;
  try {
    // @ts-ignore
    const testCheck = t.raw('items');
    hasItems = testCheck && typeof testCheck === 'object';
  } catch {
    hasItems = false;
  }

  if (hasItems) {
    for (let i = 1; i <= 3; i++) {
      const key = `item-${i}`;

      try {
        // @ts-ignore - Dynamic translation keys with fallback
        const question = t(`items.${key}.question`, { default: null });

        if (!question || question.includes(`items.${key}.question`)) {
          break;
        }

        // @ts-ignore - Dynamic translation keys
        const answer = t(`items.${key}.answer`);

        faqItems.push({
          id: key,
          icon: icons[i - 1] || 'help-circle',
          question,
          answer,
        });
      } catch {
        break;
      }
    }
  }

  // If no FAQ items found, don't render the section
  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section id="faqs" className="px-4 py-12 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        <HeaderSection
          // @ts-ignore - Dynamic translation keys
          subtitle={t('title')}
          subtitleAs="h2"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {faqItems.map((item) => (
            <Card
              key={item.id}
              className="h-full hover:shadow-lg transition-shadow duration-300 border-2 border-dashed"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">
                        {faqItems.indexOf(item) + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-base leading-tight">
                    {item.question}
                  </h3>
                </div>

                <div className="text-sm text-muted-foreground">
                  {(() => {
                    // Check if the answer contains step-by-step format
                    const stepRegex = /Step \d+[,:.]/gi;
                    const hasSteps = stepRegex.test(item.answer);

                    if (hasSteps) {
                      // Split by step markers and render as a list
                      const parts = item.answer.split(/(Step \d+[,:.])/gi);
                      const steps: { label: string; content: string }[] = [];

                      for (let i = 0; i < parts.length; i++) {
                        if (/Step \d+[,:.]/.test(parts[i])) {
                          const label = parts[i].replace(/[,:]$/, ''); // Remove trailing comma or colon
                          const content = parts[i + 1]?.trim() || '';
                          steps.push({ label, content });
                          i++; // Skip the next part as we've consumed it
                        }
                      }

                      // Find intro text (before first step)
                      const introMatch = item.answer.match(/^(.*?)Step \d+/i);
                      const intro = introMatch ? introMatch[1].trim() : '';

                      return (
                        <>
                          {intro && <p className="mb-3">{intro}</p>}
                          {steps.length > 0 && (
                            <ol className="space-y-2 list-none">
                              {steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="font-medium whitespace-nowrap text-xs">
                                    {step.label}:
                                  </span>
                                  <span className="text-xs">
                                    {step.content}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </>
                      );
                    }

                    // Regular answer without steps
                    return (
                      <p className="whitespace-pre-line text-xs leading-relaxed">
                        {item.answer}
                      </p>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
