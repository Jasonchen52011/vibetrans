// 暂时注释掉 edge runtime 来解决构建问题
// export const runtime = 'edge';
import BackToTop from '@/components/layout/back-to-top';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar scroll={true} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
