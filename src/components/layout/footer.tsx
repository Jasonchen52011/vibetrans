import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { getFooterLinks } from '@/config/footer-config';
import { getSocialLinks } from '@/config/social-config';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import type React from 'react';

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  locale: string;
}

export async function Footer({ className, locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'Marketing.footer' });
  const tRoot = await getTranslations({ locale });
  const footerLinks = getFooterLinks(t);
  const socialLinks = getSocialLinks(t);

  return (
    <footer className={cn('bg-gray-900', className)}>
      <Container className="px-4">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 py-16">
          <div className="flex flex-col items-start md:max-w-[33%]">
            <div className="space-y-4">
              {/* logo and name */}
              <div className="items-center space-x-2 flex">
                <Logo />
                <span className="text-xl font-semibold text-gray-50">
                  {tRoot('name')}
                </span>
              </div>

              {/* tagline */}
              <p className="text-gray-300 text-base py-2">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* footer links */}
          <div className="flex flex-wrap gap-8 md:gap-12 md:flex-1 md:justify-end">
            {footerLinks?.map((section) => (
              <div key={section.title} className="flex flex-col items-start">
                <span className="text-sm font-semibold uppercase text-gray-50">
                  {section.title}
                </span>
                {section.title === 'CONTACT' ? (
                  <div className="mt-4 space-y-4">
                    <a
                      href="mailto:hello@vibetrans.com"
                      className="text-sm text-gray-300 hover:text-gray-50 block"
                    >
                      hello@vibetrans.com
                    </a>
                    <div>
                      <span className="text-sm font-semibold uppercase text-gray-50 block mb-4">
                        SOCIAL
                      </span>
                      <div className="flex items-center gap-2">
                        {socialLinks
                          ?.filter((link) => link.title === 'Twitter')
                          .map((link) => (
                            <a
                              key={link.title}
                              href={link.href || '#'}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={link.title}
                              className="border border-gray-600 inline-flex h-8 w-8 items-center
                              justify-center rounded-full hover:bg-gray-800 hover:text-gray-50 text-gray-300"
                            >
                              <span className="sr-only">{link.title}</span>
                              {link.icon ? link.icon : null}
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ul className="mt-4 list-inside space-y-3">
                    {section.items?.map(
                      (item) =>
                        item.href && (
                          <li key={item.title}>
                            <LocaleLink
                              href={item.href || '#'}
                              target={item.external ? '_blank' : undefined}
                              className="text-sm text-gray-300 hover:text-gray-50"
                            >
                              {item.title}
                            </LocaleLink>
                          </li>
                        )
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-gray-700 py-8">
        <Container className="px-4 flex items-center justify-center gap-x-4">
          <span className="text-gray-300 text-sm text-center">
            &copy; {new Date().getFullYear()} {tRoot('name')} All Rights
            Reserved.
          </span>
        </Container>
      </div>
    </footer>
  );
}
