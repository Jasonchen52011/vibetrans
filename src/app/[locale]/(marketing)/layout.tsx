export const runtime = 'edge';
import BackToTop from '@/components/layout/back-to-top';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import type { ReactNode } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar scroll={true} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <BackToTop />
    </div>
  );
}
