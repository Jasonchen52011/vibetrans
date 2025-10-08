import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface CallToActionSectionProps {
  namespace?: string;
}

export default function CallToActionSection({
  namespace = 'HomePage.calltoaction',
}: CallToActionSectionProps = {}) {
  // @ts-ignore - Translation keys type mismatch
  const t = useTranslations(namespace);

  return (
    <section id="call-to-action" className="px-4 py-24 bg-muted/50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight">
            {t('title')}
          </h2>
          <p className="mt-4 text-muted-foreground">{t('description')}</p>

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg">
              <LocaleLink href="/">
                <span>{t('primaryButton')}</span>
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
