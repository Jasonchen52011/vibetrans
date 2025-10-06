'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TestimonialColumnContainer } from './testimonial-column-container';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  src: string;
  rating?: number;
};

export default function TestimonialsSection() {
  const t = useTranslations('HomePage.testimonials');

  const testimonials: Testimonial[] = [
    {
      name: t('items.item-1.name'),
      role: t('items.item-1.role'),
      quote: t('items.item-1.quote'),
      src: 'https://i.pravatar.cc/150?img=1',
      rating: 5.0,
    },
    {
      name: t('items.item-2.name'),
      role: t('items.item-2.role'),
      quote: t('items.item-2.quote'),
      src: 'https://i.pravatar.cc/150?img=2',
      rating: 4.8,
    },
    {
      name: t('items.item-3.name'),
      role: t('items.item-3.role'),
      quote: t('items.item-3.quote'),
      src: 'https://i.pravatar.cc/150?img=3',
      rating: 4.9,
    },
    {
      name: t('items.item-4.name'),
      role: t('items.item-4.role'),
      quote: t('items.item-4.quote'),
      src: 'https://i.pravatar.cc/150?img=4',
      rating: 5.0,
    },
    {
      name: t('items.item-5.name'),
      role: t('items.item-5.role'),
      quote: t('items.item-5.quote'),
      src: 'https://i.pravatar.cc/150?img=5',
      rating: 4.7,
    },
    {
      name: t('items.item-6.name'),
      role: t('items.item-6.role'),
      quote: t('items.item-6.quote'),
      src: 'https://i.pravatar.cc/150?img=6',
      rating: 4.6,
    },
    {
      name: t('items.item-7.name'),
      role: t('items.item-7.role'),
      quote: t('items.item-7.quote'),
      src: 'https://i.pravatar.cc/150?img=7',
      rating: 5.0,
    },
    {
      name: t('items.item-8.name'),
      role: t('items.item-8.role'),
      quote: t('items.item-8.quote'),
      src: 'https://i.pravatar.cc/150?img=8',
      rating: 4.9,
    },
    {
      name: t('items.item-9.name'),
      role: t('items.item-9.role'),
      quote: t('items.item-9.quote'),
      src: 'https://i.pravatar.cc/150?img=9',
      rating: 4.8,
    },
  ];

  // Split testimonials into 3 columns
  const column1 = testimonials.slice(0, 3);
  const column2 = testimonials.slice(3, 6);
  const column3 = testimonials.slice(6, 9);

  return (
    <section id="testimonials" className="relative z-20 py-10 md:py-40">
      <div className="mx-auto max-w-7xl px-4">
        <HeaderSection subtitle={t('subtitle')} subtitleAs="h2" />

        <div className="relative -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-4 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <TestimonialColumnContainer shift={10}>
            {[...column1, ...column1].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Column 2 - Hidden on mobile */}
          <TestimonialColumnContainer className="hidden md:block" shift={15}>
            {[...column2, ...column2].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Column 3 - Hidden on mobile and tablet */}
          <TestimonialColumnContainer className="hidden lg:block" shift={10}>
            {[...column3, ...column3].map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </TestimonialColumnContainer>

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background" />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating || 5.0;
  const isHalfStar = rating < 5.0;

  return (
    <figure className="rounded-3xl bg-card p-6 shadow-lg border border-border dark:bg-neutral-900">
      <div className="flex flex-col items-start">
        {/* Star Rating - 大星星 + 评分 */}
        <div className="flex items-center gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <svg
              key={i}
              className="w-8 h-8 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          {isHalfStar ? (
            <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`half-${rating}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#half-${rating})`}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
          <span className="text-base font-semibold text-foreground ml-1">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* 标题带双引号 */}
        <h3 className="text-xl font-semibold text-foreground mb-3">
          &quot;{testimonial.name}&quot;
        </h3>

        {/* 评论内容 */}
        <p className="text-base text-muted-foreground mb-4">
          {testimonial.quote}
        </p>

        {/* 作者信息 - 去掉分隔线 */}
        <div className="mt-auto pt-3 w-full">
          <p className="text-sm text-foreground font-medium">
            {testimonial.name}
          </p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </figure>
  );
}
