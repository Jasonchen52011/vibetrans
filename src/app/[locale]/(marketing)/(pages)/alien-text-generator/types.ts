// 为AlienTextGeneratorPage声明类型，解决TypeScript类型检查问题
declare global {
  namespace AlienTextGeneratorPage {
    interface Hero {
      title: string;
      description: string;
    }

    interface Tool {
      inputLabel: string;
      outputLabel: string;
      inputPlaceholder: string;
      outputPlaceholder: string;
      translateButton: string;
      uploadButton: string;
      uploadHint: string;
      loading: string;
      error: string;
      noInput: string;
    }

    interface ExampleItem {
      alt: string;
      name: string;
    }

    interface Examples {
      title: string;
      description: string;
      items: Record<string, ExampleItem>;
    }

    interface WhatIs {
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    }

    interface StepItem {
      name: string;
      description: string;
    }

    interface HowTo {
      title: string;
      description: string;
      steps: Record<string, StepItem>;
    }

    interface HighlightItem {
      title: string;
      description: string;
    }

    interface Highlights {
      title: string;
      description: string;
      items: Record<string, HighlightItem>;
    }

    interface FunFactItem {
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    }

    interface FunFacts {
      title: string;
      items: Record<string, FunFactItem>;
    }

    interface UserInterestItem {
      title: string;
      content: string;
      image: string;
      imageAlt: string;
    }

    interface UserInterest {
      title: string;
      items: Record<string, UserInterestItem>;
    }

    interface Testimonials {
      title?: string;
      subtitle?: string;
      items?: Record<string, any>;
    }

    interface FAQs {
      title?: string;
      subtitle?: string;
      items?: any;
    }

    interface CTA {
      title?: string;
      subtitle?: string;
      buttonText?: string;
      description?: string;
    }

    // 根节点类型
    var hero: Hero;
    var tool: Tool;
    var examples: Examples;
    var whatIs: WhatIs;
    var howto: HowTo;
    var highlights: Highlights;
    var funfacts: FunFacts;
    var userInterest: UserInterest;
    var testimonials: Testimonials;
    var faqs: FAQs;
    var cta: CTA;
    var ctaButton: string;
    var description: string;
    var name: string;
    var title: string;
  }
}

export {};
