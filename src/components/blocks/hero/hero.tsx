'use client';

import UserAvatars from '@/components/blocks/user-avatars';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('HomePage.hero');

  const aiTools = [
    // { name: 'AI Text', href: '/ai/text' },
    { name: 'Chat', href: '/chat' },
    { name: 'Video', href: '/video' },
    { name: 'Image', href: '/image' },
  ];

  return (
    <AuroraBackground className="bg-white dark:bg-zinc-900">
      <div className="relative flex flex-col gap-4 items-center justify-center px-4">
        {/* title */}
        <h1 className="text-2xl md:text-4xl lg:text-7xl font-semibold max-w-6xl mx-auto text-center relative z-10 text-slate-950 dark:text-white">
          {t('title')}
        </h1>

        {/* description */}
        <p className="text-center mt-6 text-base md:text-xl text-gray-500 dark:text-gray-200 max-w-3xl mx-auto relative z-10">
          {t('description')}
        </p>

        {/* action buttons */}
        <div className="hidden">
          {aiTools.map((tool, index) => (
            <Button key={index} asChild size="lg" variant="default">
              <LocaleLink href={tool.href}>
                <span className="text-nowrap font-medium">{tool.name}</span>
              </LocaleLink>
            </Button>
          ))}
        </div>

        {/* user avatars */}
        <UserAvatars />
      </div>
    </AuroraBackground>
  );
}
