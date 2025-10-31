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
  subNamespace,
  section,
}: {
  namespace?: string;
  subNamespace?: string;
  section?: import('@/types/blocks/section').Section;
} = {}) {
  const locale = useLocale();

  // If section data is provided, use it directly
  if (section) {
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

    section.items.forEach((item, index) => {
      const title = item.title || '';
      const description = item.description || '';
      const question = title;
      const answer = description;

      if (question && answer) {
        faqItems.push({
          id: `item-${index + 1}`,
          icon: icons[index] || 'help-circle',
          question,
          answer,
        });
      }
    });

    // If no FAQ items found, don't render the section
    if (faqItems.length === 0) {
      return null;
    }

    return (
      <section id="faqs" className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <HeaderSection title={section.title} subtitle={section.subtitle} />

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
                          const steps: { label: string; content: string }[] =
                            [];

                          for (let i = 0; i < parts.length; i++) {
                            if (/Step \d+[,:.]/.test(parts[i])) {
                              const label = parts[i].replace(/[,:]$/, ''); // Remove trailing comma or colon
                              const content = parts[i + 1]?.trim() || '';
                              steps.push({ label, content });
                              i++; // Skip the next part as we've consumed it
                            }
                          }

                          // Find intro text (before first step)
                          const introMatch =
                            item.answer.match(/^(.*?)Step \d+/i);
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
    // Check if we can access item-1 directly
    const firstItemQuestion = t(`items.item-1.question`, { default: null });
    hasItems =
      firstItemQuestion && !firstItemQuestion.includes(`items.item-1.question`);
  } catch {
    hasItems = false;
  }

  if (hasItems) {
    const pushItem = (
      question: string,
      answer: string,
      index: number,
      key?: string | number
    ): void => {
      if (!question || !answer) {
        return;
      }

      faqItems.push({
        id: typeof key === 'string' ? key : `item-${index}`,
        icon: icons[index] || 'help-circle',
        question,
        answer,
      });
    };

    // Try to load up to 7 FAQ items (item-1 format)
    for (let i = 1; i <= 7; i++) {
      const key = `item-${i}`;

      try {
        const question = t(`items.${key}.question`, { default: null });

        if (!question || question.includes(`items.${key}.question`)) {
          break;
        }

        const answer = t(`items.${key}.answer`);

        pushItem(question, answer, i - 1, key);
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
          title={getNestedTranslation('title')}
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
