'use client';

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CallToActionSectionProps {
  namespace?: string;
}

export default function CallToActionSection({
  namespace = 'HomePage.calltoaction',
}: CallToActionSectionProps = {}) {
  // @ts-ignore - Translation keys type mismatch
  const t = useTranslations(namespace);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section id="call-to-action" className="px-4 py-24 bg-muted/50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-muted-foreground">{t('description')}</p>

          <div className="mt-12 flex justify-center">
            <Button onClick={scrollToTop} size="lg">
              <span>{t('primaryButton')}</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
