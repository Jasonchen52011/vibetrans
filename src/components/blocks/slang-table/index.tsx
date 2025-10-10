'use client';

import { HeaderSection } from '@/components/layout/header-section';
import Image from 'next/image';

interface SlangTableItem {
  standard: string;
  genAlpha?: string;
  genZ?: string;
  meaning: string;
}

interface SlangTableSectionProps {
  title: string;
  description: string;
  headers: {
    standard: string;
    genAlpha?: string;
    genZ?: string;
    meaning: string;
  };
  items: SlangTableItem[];
  image?: {
    src: string;
    alt: string;
  };
}

export default function SlangTableSection({
  title,
  description,
  headers,
  items,
  image,
}: SlangTableSectionProps) {
  const slangColumnHeader = headers.genAlpha || headers.genZ || 'Slang';

  return (
    <section className="relative z-20 py-10 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <HeaderSection title={title} subtitle={description} subtitleAs="p" />

        {/* Image (if provided) */}
        {image && (
          <div className="mt-8 mb-12 flex justify-center">
            <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-12 overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
              <table className="min-w-full divide-y divide-border bg-card">
                <thead className="bg-muted/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                    >
                      {headers.standard}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-primary"
                    >
                      {slangColumnHeader}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                    >
                      {headers.meaning}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.standard}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-semibold">
                        {item.genAlpha || item.genZ}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SEO-friendly text content below table */}
        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            {description} The table above shows the most common translations and
            their contextual usage.
          </p>
        </div>
      </div>
    </section>
  );
}
