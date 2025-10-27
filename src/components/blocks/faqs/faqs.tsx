'use client';

import { HeaderSection } from '@/components/layout/header-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { IconName } from 'lucide-react/dynamic';
import { useLocale, useTranslations } from 'next-intl';

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

export default function FaqSection({
  namespace = 'HomePage.faqs',
}: { namespace?: string } = {}) {
  const locale = useLocale();
  // @ts-ignore - Dynamic namespace support
  const t = useTranslations(namespace as any);

  // Dynamically build FAQ items based on available translations
  const faqItems: FAQItem[] = [];
  const icons: IconName[] = [
    'calendar-clock',
    'wallet',
    'refresh-cw',
    'hand-coins',
    'languages',
    'globe',
    'mail',
    'shield-check',
    'help-circle',
    'info',
    'message-circle',
    'book-open',
  ];

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
    for (let i = 1; i <= 8; i++) {
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

  // Note: MISSING_MESSAGE errors in development console are expected behavior
  // when the loop checks for items beyond what's available in translations.
  // This is harmless and allows flexible content without manual item counts.

  return (
    <section id="faqs" className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <HeaderSection
          // @ts-ignore - Dynamic translation keys
          title={t('title')}
        />

        <div className="mx-auto max-w-4xl mt-12">
          <Accordion
            type="single"
            collapsible
            className="ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-base text-muted-foreground">
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
                                    <span className="font-medium whitespace-nowrap">
                                      {step.label}:
                                    </span>
                                    <span>{step.content}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </>
                        );
                      }

                      // Regular answer without steps
                      return (
                        <p className="whitespace-pre-line">{item.answer}</p>
                      );
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
