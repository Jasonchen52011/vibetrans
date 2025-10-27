'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { BorderBeam } from '@/components/magicui/border-beam';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  FileText,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

export default function FeaturesSection() {
  const t = useTranslations('HomePage.features');
  const [activeItem, setActiveItem] = useState('item-1');

  const steps = [
    {
      icon: FileText,
      title: 'Sign Up',
      description: 'Create your account in seconds with just your email',
    },
    {
      icon: MousePointerClick,
      title: 'Choose Your Plan',
      description: 'Select the perfect plan that fits your needs',
    },
    {
      icon: Sparkles,
      title: 'Start Creating',
      description: 'Begin using our AI tools immediately',
    },
    {
      icon: ArrowRight,
      title: 'Scale & Grow',
      description: 'Expand your capabilities as your needs grow',
    },
  ];

  return (
    <section id="features" className="px-4 py-16 bg-white">
      <div className="mx-auto max-w-6xl space-y-8 lg:space-y-20">
        <HeaderSection
          subtitle="How to Get Started"
          subtitleAs="h2"
          description="Follow these simple steps to start using our platform"
          descriptionAs="p"
        />

        <div className="grid gap-6 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-0 lg:items-center">
          <div className="lg:col-span-5 flex flex-col">
            <Accordion
              type="single"
              collapsible
              className="w-full border-none"
              value={activeItem}
              onValueChange={setActiveItem}
            >
              {steps.map((step, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index + 1}`}
                  className="border-none"
                  onMouseEnter={() => setActiveItem(`item-${index + 1}`)}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-base">
                      <step.icon className="size-6 text-primary" />
                      {step.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {step.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="bg-background w-full relative flex overflow-hidden rounded-2xl border p-2 lg:h-[400px] lg:col-span-7">
            <div className="bg-background relative w-full rounded-2xl">
              <div className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                <Image
                  src="/blocks/charts-light.png"
                  className="size-full object-cover object-left-top dark:hidden"
                  alt="Getting Started Dashboard"
                  width={1207}
                  height={929}
                />
                <Image
                  src="/blocks/charts.png"
                  className="size-full object-cover object-left-top dark:block hidden"
                  alt="Getting Started Dashboard"
                  width={1207}
                  height={929}
                />
              </div>
            </div>
            <BorderBeam
              duration={6}
              size={200}
              className="from-transparent via-blue-700 to-transparent dark:via-white/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
