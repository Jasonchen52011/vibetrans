import Container from '@/components/layout/container';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  GlobeIcon,
  LanguagesIcon,
  LightbulbIcon,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'AboutPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    canonicalUrl: getUrlWithLocale('/about', locale),
    image: '/images/docs/what-is-vibetrans.webp',
  });
}

export default async function AboutPage() {
  const t = await getTranslations('AboutPage');

  return (
    <AuroraBackground className="bg-white dark:bg-zinc-900 !h-auto min-h-screen !pt-12">
      <Container className="px-4 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <header className="relative text-center mb-6">
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </h1>
          </header>

          {/* Story Section (WhatIs equivalent) */}
          <section className="mb-16">
            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <SparklesIcon className="size-8 text-amber-500" />
                {t('story.title')}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p className="leading-relaxed">{t('story.paragraph1')}</p>
                <p className="leading-relaxed">{t('story.paragraph2')}</p>
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-l-4 border-primary rounded-lg p-6 my-6">
                  <p className="text-xl font-bold text-primary italic">
                    "{t('story.quote')}"
                  </p>
                </div>
                <p className="leading-relaxed font-semibold">
                  {t('story.paragraph3')}
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-16">
            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl">
              <h3 className="text-2xl font-bold text-center mb-8">
                {t('mission.stats.title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {t('mission.stats.items.languages.number')}
                  </div>
                  <div className="text-sm font-semibold mb-1">
                    {t('mission.stats.items.languages.label')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('mission.stats.items.languages.description')}
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {t('mission.stats.items.translations.number')}
                  </div>
                  <div className="text-sm font-semibold mb-1">
                    {t('mission.stats.items.translations.label')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('mission.stats.items.translations.description')}
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-xl border border-pink-500/20">
                  <div className="text-4xl font-bold text-pink-600 mb-2">
                    {t('mission.stats.items.accuracy.number')}
                  </div>
                  <div className="text-sm font-semibold mb-1">
                    {t('mission.stats.items.accuracy.label')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('mission.stats.items.accuracy.description')}
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20">
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {t('mission.stats.items.users.number')}
                  </div>
                  <div className="text-sm font-semibold mb-1">
                    {t('mission.stats.items.users.label')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('mission.stats.items.users.description')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Difference Section (Features equivalent) */}
          <section className="mb-16">
            <div className="relative z-20 bg-gradient-to-br from-card to-primary/5 border rounded-3xl p-8 md:p-12 shadow-xl">
              <h2 className="text-3xl font-bold mb-4 text-center">
                {t('difference.title')}
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
                {t('difference.intro')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <BrainCircuitIcon className="size-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {t('difference.features.ai.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('difference.features.ai.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <GlobeIcon className="size-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {t('difference.features.cultural.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('difference.features.cultural.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                      <SparklesIcon className="size-8 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {t('difference.features.creative.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('difference.features.creative.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                      <ZapIcon className="size-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {t('difference.features.instant.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('difference.features.instant.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Values Section */}
          <section className="mb-16">
            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl">
              <h2 className="text-3xl font-bold mb-4 text-center">
                {t('mission.title')}
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-8 max-w-5xl mx-auto">
                {t('mission.description')}
              </p>

              {/* Values with Details */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="group text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <LightbulbIcon className="size-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('mission.values.accurate.title')}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {t('mission.values.accurate.description')}
                  </p>
                  <p className="text-sm text-muted-foreground/80 italic">
                    {t('mission.values.accurate.detail')}
                  </p>
                </div>

                <div className="group text-center p-6 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <GlobeIcon className="size-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('mission.values.accessible.title')}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {t('mission.values.accessible.description')}
                  </p>
                  <p className="text-sm text-muted-foreground/80 italic">
                    {t('mission.values.accessible.detail')}
                  </p>
                </div>

                <div className="group text-center p-6 bg-gradient-to-br from-pink-500/5 to-pink-500/10 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <BrainCircuitIcon className="size-10 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('mission.values.innovative.title')}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {t('mission.values.innovative.description')}
                  </p>
                  <p className="text-sm text-muted-foreground/80 italic">
                    {t('mission.values.innovative.detail')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Commitment Section (Why Choose equivalent) */}
          <section className="mb-16">
            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl">
              <h3 className="text-2xl font-bold text-center mb-8">
                {t('mission.commitment.title')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-card to-primary/5 border rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <ZapIcon className="size-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        {t('mission.commitment.items.quality.title')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('mission.commitment.items.quality.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-card to-purple-500/5 border rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg shrink-0">
                      <SparklesIcon className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        {t('mission.commitment.items.innovation.title')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('mission.commitment.items.innovation.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-card to-pink-500/5 border rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-pink-500/10 rounded-lg shrink-0">
                      <GlobeIcon className="size-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        {t('mission.commitment.items.community.title')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('mission.commitment.items.community.description')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-card to-amber-500/5 border rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg shrink-0">
                      <LightbulbIcon className="size-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        {t('mission.commitment.items.openness.title')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('mission.commitment.items.openness.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy Section (replaces FAQ conceptually) */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="p-6 bg-primary/10 rounded-2xl">
                    <ShieldCheckIcon className="size-16 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                    <LockIcon className="size-8" />
                    {t('privacy.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {t('privacy.description')}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
                    <ShieldCheckIcon className="size-5 text-primary" />
                    <span className="font-semibold text-primary">
                      {t('privacy.guarantee')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl text-white">
              <div className="flex justify-center gap-4 mb-6 text-6xl">
                <LanguagesIcon className="size-16 animate-bounce" />
                <SparklesIcon className="size-16 animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold mb-6">{t('cta.title')}</h2>
              <Link href="/">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform duration-200"
                >
                  {t('cta.button')}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </AuroraBackground>
  );
}
