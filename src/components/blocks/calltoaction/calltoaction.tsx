'use client';

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CallToActionSectionProps {
  namespace?: string;
  subNamespace?: string;
}

export default function CallToActionSection({
  namespace = 'HomePage.calltoaction',
  subNamespace,
}: CallToActionSectionProps = {}) {
  // Build the actual namespace based on whether subNamespace is provided
  const actualNamespace = subNamespace ? `${namespace}.${subNamespace}` : namespace;

  // Safe translation access with fallback
  let t: any;
  try {
    // @ts-ignore - Translation keys type mismatch
    t = useTranslations(actualNamespace);
  } catch (error) {
    console.warn(`Failed to load translations for namespace: ${actualNamespace}`, error);
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
            {getNestedTranslation('title')}
          </h2>
          <p className="mt-4 text-muted-foreground">{getNestedTranslation('description')}</p>

          <div className="mt-12 flex justify-center">
            <Button onClick={scrollToTop} size="lg">
              <span>{getNestedTranslation('primaryButton')}</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
