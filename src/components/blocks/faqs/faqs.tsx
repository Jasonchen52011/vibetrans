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

export default function FaqSection({ namespace = 'HomePage.faqs' }: { namespace?: string } = {}) {
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
  ];

  // Try to load up to 8 FAQ items
  for (let i = 1; i <= 8; i++) {
    const key = `item-${i}`;
    try {
      // @ts-ignore - Dynamic translation keys
      const question = t(`items.${key}.question`);
      // @ts-ignore - Dynamic translation keys
      const answer = t(`items.${key}.answer`);

      // Only add if translation exists (not showing the key)
      if (question && !question.includes('items.')) {
        faqItems.push({
          id: key,
          icon: icons[i - 1] || 'help-circle',
          question,
          answer,
        });
      }
    } catch {
      // Skip if translation doesn't exist
      break;
    }
  }

  return (
    <section id="faqs" className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <HeaderSection
          // @ts-ignore - Dynamic translation keys
          title={t('title')}
          titleAs="h2"
          // @ts-ignore - Dynamic translation keys
          subtitle={t('subtitle')}
          subtitleAs="p"
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
