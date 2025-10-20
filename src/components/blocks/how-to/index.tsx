'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState } from 'react';

import Icon from '@/components/icon';
import { HeaderSection } from '@/components/layout/header-section';
import type { Section as SectionType } from '@/types/blocks/section';

export default function HowTo({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const [currentStep, setCurrentStep] = useState('');

  return (
    <section id={section.name} className="py-10 mt-10 mb-8 bg-white">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <HeaderSection
            subtitle={section.title}
            subtitleAs="h2"
            description={section.description}
            descriptionAs="p"
            descriptionClassName="max-w-3xl mx-auto lg:text-lg"
          />
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Accordion
              type="single"
              value={currentStep}
              onValueChange={setCurrentStep}
              collapsible
            >
              {section.items?.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={(i + 1).toString()}
                  className="border-b-0 border-secondary mb-3"
                >
                  <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors duration-200 group">
                    <div className="flex items-center gap-4">
                      {item.icon && (
                        <Icon
                          name={item.icon}
                          className="mr-2 size-6 shrink-0 lg:mr-2 lg:size-8 text-primary"
                        />
                      )}
                      <span className="font-medium lg:text-lg">
                        Step {i + 1}: {item.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground lg:text-base">
                    <div className="pl-13">{item.description}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div>
            <img
              src={section.image?.src}
              alt={section.image?.alt || section.title}
              className="max-h-auto w-full object-cover lg:max-h-none rounded-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
