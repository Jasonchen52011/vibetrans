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

  // Note: MISSING_MESSAGE errors in development console are expected behavior
  // when the loop checks for items beyond what's available in translations.
  // This is harmless and allows flexible content without manual item counts.

  return (
    <section id="faqs" className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <HeaderSection
          // @ts-ignore - Dynamic translation keys
          subtitle={t('title')}
          subtitleAs="h2"
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
                  <p className="text-base text-muted-foreground whitespace-pre-line">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
