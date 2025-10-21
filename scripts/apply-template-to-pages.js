#!/usr/bin/env node

// VibeTrans 模板化应用脚本
// 批量将模板应用到所有工具页面

const fs = require('fs');
const path = require('path');

// 页面分类配置
const PAGE_CATEGORIES = {
  simple: {
    name: '简单翻译工具',
    description: '基础输入输出，无额外选项',
    pages: [
      'albanian-to-english',
      'creole-to-english-translator',
      'samoan-to-english-translator',
      'chinese-to-english-translator',
      'cantonese-translator',
      'baybayin-translator',
      'aramaic-translator'
    ],
    template: 'simple-tool-template'
  },
  complex: {
    name: '复杂翻译工具',
    description: '带风格选择、方言选择等额外选项',
    pages: [
      'ancient-greek-translator',
      'middle-english-translator',
      'bad-translator',
      'gibberish-translator',
      'gen-z-translator',
      'gen-alpha-translator',
      'yoda-translator',
      'minion-translator',
      'dog-translator',
      'baby-translator',
      'gaster-translator',
      'espranto-translator',
      'high-valyrian-translator',
      'ivr-translator',
      'pig-latin-translator',
      'al-bhed-translator',
      'cuneiform-translator'
    ],
    template: 'advanced-tool-template'
  },
  generative: {
    name: '生成类工具',
    description: '非翻译类的文本生成和处理工具',
    pages: [
      'dumb-it-down-ai',
      'verbose-generator',
      'alien-text-generator'
    ],
    template: 'generative-tool-template'
  }
};

// 模板内容
const SIMPLE_TOOL_TEMPLATE = `// @ts-nocheck - Translation keys type mismatch
import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsThreeColumnSection from '@/components/blocks/testimonials/testimonials-three-column';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import {{TOOL_COMPONENT}} from './{{TOOL_COMPONENT_PATH}}';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const gt = await getTranslations({
    locale,
    namespace: '{{NAMESPACE}}',
  });

  return constructMetadata({
    title: \`\${gt('title')} | \${(t as any)('name')}\`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('{{ROUTE}}', locale),
    image: '{{IMAGE_PATH}}',
  });
}

interface {{PAGE_NAME}}Props {
  params: Promise<{ locale: Locale }>;
}

export default async function {{PAGE_NAME}}(props: {{PAGE_NAME}}Props) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: '{{NAMESPACE}}',
  });

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'VibeTrans {{TOOL_NAME}}',
    applicationCategory: 'UtilityApplication',
    description: (t as any)('description'),
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      {{FEATURE_LIST}}
    ],
  };

  // Page data for the tool
  const pageData = {
    tool: {
      inputLabel: (t as any)('tool.inputLabel'),
      outputLabel: (t as any)('tool.outputLabel'),
      inputPlaceholder: (t as any)('tool.inputPlaceholder'),
      outputPlaceholder: (t as any)('tool.outputPlaceholder'),
      translateButton: (t as any)('tool.translateButton'),
      uploadButton: (t as any)('tool.uploadButton'),
      uploadHint: (t as any)('tool.uploadHint'),
      loading: (t as any)('tool.loading'),
      error: (t as any)('tool.error'),
      noInput: (t as any)('tool.noInput'),
      {{ADDITIONAL_TOOL_FIELDS}}
    },
  };

  // Examples section data
  const examplesData = {
    title: (t as any)('examples.title'),
    description: (t as any)('examples.description'),
    images: [
      {{EXAMPLES_ITEMS}}
    ],
  };

  // Page sections
  const whatIsSection = {
    title: (t as any)('whatIs.title'),
    description: (t as any)('whatIs.description'),
    features: [],
    image: {
      src: '{{WHAT_IS_IMAGE}}',
      alt: 'What is {{TOOL_NAME}}',
    },
    cta: { text: (t as any)('ctaButton') },
  };

  const howtoSection = {
    name: 'howto',
    title: (t as any)('howto.title'),
    description: (t as any)('howto.description'),
    image: {
      src: '{{HOW_TO_IMAGE}}',
      alt: 'How to use {{TOOL_NAME}}',
    },
    items: [
      {
        title: (t as any)('howto.steps.0.title'),
        description: (t as any)('howto.steps.0.description'),
        icon: 'FaFileUpload',
      },
      {
        title: (t as any)('howto.steps.1.title'),
        description: (t as any)('howto.steps.1.description'),
        icon: 'FaPencilAlt',
      },
      {
        title: (t as any)('howto.steps.2.title'),
        description: (t as any)('howto.steps.2.description'),
        icon: 'FaLanguage',
      },
      {
        title: (t as any)('howto.steps.3.title'),
        description: (t as any)('howto.steps.3.description'),
        icon: 'FaCheckCircle',
      },
    ],
  };

  const highlightsSection = {
    name: 'highlights',
    title: (t as any)('highlights.title'),
    description: (t as any)('highlights.description'),
    items: [
      {
        icon: 'FaRocket',
        title: (t as any)('highlights.items.0.title'),
        description: (t as any)('highlights.items.0.description'),
      },
      {
        icon: 'FaBrain',
        title: (t as any)('highlights.items.1.title'),
        description: (t as any)('highlights.items.1.description'),
      },
      {
        icon: 'FaShieldAlt',
        title: (t as any)('highlights.items.2.title'),
        description: (t as any)('highlights.items.2.description'),
      },
      {
        icon: 'FaChartLine',
        title: (t as any)('highlights.items.3.title'),
        description: (t as any)('highlights.items.3.description'),
      },
    ],
  };

  // Fun Facts section
  const funFactsSection = {
    name: 'funFacts',
    title: (t as any)('funFacts.title'),
    items: [
      {
        title: (t as any)('funFacts.items.0.title'),
        description: (t as any)('funFacts.items.0.description'),
        image: {
          src: '{{FUN_FACT_IMAGE_1}}',
          alt: (t as any)('funFacts.items.0.title'),
        },
      },
      {
        title: (t as any)('funFacts.items.1.title'),
        description: (t as any)('funFacts.items.1.description'),
        image: {
          src: '{{FUN_FACT_IMAGE_2}}',
          alt: (t as any)('funFacts.items.1.title'),
        },
      },
    ],
  };

  // User Interest section
  const userInterestSection = {
    name: 'userInterest',
    title: (t as any)('userInterest.title'),
    items: [
      {
        title: (t as any)('userInterest.items.0.title'),
        description: (t as any)('userInterest.items.0.description'),
        image: {
          src: '{{USER_INTEREST_IMAGE_1}}',
          alt: (t as any)('userInterest.items.0.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.1.title'),
        description: (t as any)('userInterest.items.1.description'),
        image: {
          src: '{{USER_INTEREST_IMAGE_2}}',
          alt: (t as any)('userInterest.items.1.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.2.title'),
        description: (t as any)('userInterest.items.2.description'),
        image: {
          src: '{{USER_INTEREST_IMAGE_3}}',
          alt: (t as any)('userInterest.items.2.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.3.title'),
        description: (t as any)('userInterest.items.3.description'),
        image: {
          src: '{{USER_INTEREST_IMAGE_4}}',
          alt: (t as any)('userInterest.items.3.title'),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col">
        {/* Hero Section */}
        <AuroraBackground className="bg-white dark:bg-zinc-900 !pt-12 !h-auto">
          <div className="container max-w-7xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {(t as any)('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {(t as any)('hero.description')}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {['{{AVATAR_1}}', '{{AVATAR_2}}', '{{AVATAR_3}}', '{{AVATAR_4}}', '{{AVATAR_5}}'].map(
                  (avatar, i) => (
                    <div
                      key={i}
                      className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden"
                    >
                      <img
                        src={\`/images/avatars/\${avatar}.webp\`}
                        alt={\`User \${i + 1}\`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  from {{USER_COUNT}} happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <{{TOOL_COMPONENT}} pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios
          section={userInterestSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Fun Facts */}
        <UserScenarios
          section={funFactsSection}
          ctaText={(t as any)('ctaButton')}
        />

        {/* Highlights */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools toolKeys={{{EXPLORE_TOOLS}}} />

        {/* Testimonials */}
        <TestimonialsThreeColumnSection namespace="{{NAMESPACE}}.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="{{NAMESPACE}}.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="{{NAMESPACE}}.cta" />
      </div>
    </>
  );
}`;

// 页面配置生成函数
function generatePageConfig(pageName) {
  const toolName = pageName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const namespace = pageName.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') + 'Page';

  const componentName = namespace.replace('Page', '') + 'Tool';

  return {
    PAGE_NAME: namespace,
    TOOL_NAME: toolName,
    NAMESPACE: namespace,
    ROUTE: \`/\${pageName}\`,
    IMAGE_PATH: \`/images/docs/what-is-\${pageName}.webp\`,
    TOOL_COMPONENT: componentName,
    TOOL_COMPONENT_PATH: componentName,
    USER_COUNT: '15,000+',
    AVATAR_1: 'female2',
    AVATAR_2: 'male4',
    AVATAR_3: 'female3',
    AVATAR_4: 'male2',
    AVATAR_5: 'female4',
    WHAT_IS_IMAGE: \`/images/docs/what-is-\${pageName}.webp\`,
    HOW_TO_IMAGE: \`/images/docs/\${pageName}-how-to.webp\`,
    FUN_FACT_IMAGE_1: \`/images/docs/\${pageName}-fact-1.webp\`,
    FUN_FACT_IMAGE_2: \`/images/docs/\${pageName}-fact-2.webp\`,
    USER_INTEREST_IMAGE_1: \`/images/docs/\${pageName}-interest-1.webp\`,
    USER_INTEREST_IMAGE_2: \`/images/docs/\${pageName}-interest-2.webp\`,
    USER_INTEREST_IMAGE_3: \`/images/docs/\${pageName}-interest-3.webp\`,
    USER_INTEREST_IMAGE_4: \`/images/docs/\${pageName}-interest-4.webp\`,
    FEATURE_LIST: [
      "'Text Translation'",
      "'File Upload Support'",
      "'Instant Translation'"
    ].join(',\\n      '),
    EXAMPLES_ITEMS: Array.from({length: 6}, (_, i) => \`
      {
        alt: (t as any)('examples.items.\${i}.alt'),
        name: (t as any)('examples.items.\${i}.name'),
      }\`).join(',\\n      '),
    EXPLORE_TOOLS: [
      "'Ancient Greek Translator'",
      "'Bad Translator'",
      "'Gen Z Translator'",
      "'Gen Alpha Translator'",
      "'Dog Translator'",
      "'Gibberish Translator'"
    ].join(',\\n      '),
    ADDITIONAL_TOOL_FIELDS: ''
  };
}

// 应用模板到页面
function applyTemplateToPage(pageName, category) {
  const config = generatePageConfig(pageName);
  let template = SIMPLE_TOOL_TEMPLATE;

  // 替换模板变量
  Object.keys(config).forEach(key => {
    const regex = new RegExp(\`{{\${key}}}\`, 'g');
    template = template.replace(regex, config[key]);
  });

  // 根据类别调整模板
  if (category === 'complex') {
    // 为复杂工具添加额外字段
    template = template.replace(
      '{{ADDITIONAL_TOOL_FIELDS}}',
      \`
      // 可能的额外字段
      styleLabel: (t as any)('tool.styleLabel'),
      dialectLabel: (t as any)('tool.dialectLabel'),
      levelLabel: (t as any)('tool.levelLabel'),
      \`
    );
  }

  return template;
}

// 主函数
function main() {
  console.log('🚀 VibeTrans 模板化应用脚本');
  console.log('='.repeat(50));

  let totalProcessed = 0;
  let totalBackup = 0;

  Object.entries(PAGE_CATEGORIES).forEach(([category, config]) => {
    console.log(\`\\n📁 处理类别: \${config.name}\`);
    console.log(\`   描述: \${config.description}\`);
    console.log(\`   页面数量: \${config.pages.length}\`);

    config.pages.forEach(pageName => {
      const pagePath = \`src/app/[locale]/(marketing)/(pages)/\${pageName}/page.tsx\`;
      const backupPath = \`src/app/[locale]/(marketing)/(pages)/\${pageName}/page-original-backup.tsx\`;

      // 检查原文件是否存在
      if (fs.existsSync(pagePath)) {
        // 备份原文件
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(pagePath, backupPath);
          totalBackup++;
          console.log(\`   ✅ 已备份: \${pageName}\`);
        }

        // 生成新页面文件
        const newContent = applyTemplateToPage(pageName, category);
        const newPath = \`src/app/[locale]/(marketing)/(pages)/\${pageName}/page-templated.tsx\`;

        fs.writeFileSync(newPath, newContent);
        totalProcessed++;
        console.log(\`   📝 已生成: \${pageName}-templated.tsx\`);
      } else {
        console.log(\`   ⚠️ 页面不存在: \${pageName}\`);
      }
    });
  });

  console.log(\`\\n📊 处理总结:\`);
  console.log(\`   总计处理页面: \${totalProcessed}\`);
  console.log(\`   总计备份页面: \${totalBackup}\`);
  console.log(\`\\n✅ 模板化应用完成!\`);
  console.log(\`\\n📋 下一步:\`);
  console.log(\`   1. 检查生成的 -templated.tsx 文件\`);
  console.log(\`   2. 手动验证每个页面的特定配置\`);
  console.log(\`   3. 逐个替换原文件\`);
  console.log(\`   4. 运行测试验证功能\`);
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  PAGE_CATEGORIES,
  generatePageConfig,
  applyTemplateToPage,
  main
};