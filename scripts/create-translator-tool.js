#!/usr/bin/env node

/**
 * 翻译工具页面生成器
 * 使用方法: node scripts/create-translator-tool.js emoji-translator "Emoji Translator"
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    '❌ 用法: node scripts/create-translator-tool.js <tool-slug> <Tool Name>'
  );
  console.error(
    '📌 示例: node scripts/create-translator-tool.js emoji-translator "Emoji Translator"'
  );
  process.exit(1);
}

const [toolSlug, toolName] = args;

// 生成各种命名变体
const toolNamePascal = toolName.replace(/\s+/g, ''); // "EmojiTranslator"
const toolNameCamel =
  toolNamePascal.charAt(0).toLowerCase() + toolNamePascal.slice(1); // "emojiTranslator"
const toolNamespace = `${toolNamePascal}Page`; // "EmojiTranslatorPage"
const componentName = `${toolNamePascal}Tool`; // "EmojiTranslatorTool"

// 生成随机头像组合（基于 tool slug 的哈希，确保每个工具的头像组合固定但不重复）
function generateRandomAvatarLogic(slug) {
  const avatarPools = [
    ['male1', 'female2', 'male3', 'female4', 'male5'], // Pool 1 - original (10,000)
    ['female2', 'male4', 'female3', 'male2', 'female4'], // Pool 2 - albanian (15,000)
    ['male2', 'female1', 'male4', 'female2', 'male3'], // Pool 3 (12,000)
    ['female3', 'male1', 'female4', 'male2', 'female1'], // Pool 4 (20,000)
    ['male3', 'female4', 'male1', 'female3', 'male4'], // Pool 5 (18,000)
    ['female1', 'male2', 'female2', 'male5', 'female3'], // Pool 6 (25,000)
  ];

  // 简单的哈希函数，基于 slug 生成索引
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const poolIndex = Math.abs(hash) % avatarPools.length;

  return JSON.stringify(avatarPools[poolIndex]);
}

// 生成随机用户数量（基于 tool slug 的哈希，确保每个工具的数字固定但不重复）
function generateRandomUserCount(slug) {
  const counts = ['10,000', '15,000', '12,000', '20,000', '18,000', '25,000'];

  // 简单的哈希函数，基于 slug 生成索引
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const countIndex = Math.abs(hash) % counts.length;

  return counts[countIndex];
}

console.log('🚀 开始生成翻译工具页面...');
console.log(`📦 工具名称: ${toolName}`);
console.log(`🔗 URL路径: /${toolSlug}`);
console.log(`📁 命名空间: ${toolNamespace}`);

// ============================================
// 1. 创建页面目录
// ============================================
const pageDir = path.join(
  __dirname,
  `../src/app/[locale]/(marketing)/(pages)/${toolSlug}`
);
if (fs.existsSync(pageDir)) {
  console.error(`❌ 错误: 目录已存在 ${pageDir}`);
  process.exit(1);
}
fs.mkdirSync(pageDir, { recursive: true });
console.log('✅ 创建页面目录');

// ============================================
// 2. 生成 page.tsx
// ============================================
const pageTemplate = `// @ts-nocheck - Translation keys type mismatch
import BeforeAfterSection from '@/components/blocks/Examples';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ExploreOurAiTools from '@/components/blocks/exploretools';
import FaqSection from '@/components/blocks/faqs/faqs';
import UserScenarios from '@/components/blocks/funfacts';
import WhyChoose from '@/components/blocks/highlights';
import HowTo from '@/components/blocks/how-to';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import WhatIsSection from '@/components/blocks/whatis';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { constructMetadata } from '@/lib/metadata';
import { buildToolStructuredData } from '@/lib/seo/structured-data';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import ${componentName} from './${componentName}';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const gt = await getTranslations({ locale, namespace: '${toolNamespace}' });

  return constructMetadata({
    title: \`\${gt('title')} | \${(t as any)('name')}\`,
    description: gt('description'),
    canonicalUrl: getUrlWithLocale('/${toolSlug}', locale),
    image: '/images/docs/what-is-${toolSlug}.webp',
  });
}

interface ${toolNamePascal}PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ${toolNamePascal}Page(props: ${toolNamePascal}PageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: '${toolNamespace}' });

  // Structured Data for SEO
  const structuredData = buildToolStructuredData({
    name: 'VibeTrans ${toolName}',
    description: (t as any)('description'),
  });

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
    },
  };

  // Examples section data
  const examplesData = {
    title: (t as any)('examples.title'),
    description: (t as any)('examples.description'),
    images: [
      {
        alt: (t as any)('examples.items.0.alt'),
        name: (t as any)('examples.items.0.name'),
      },
      {
        alt: (t as any)('examples.items.1.alt'),
        name: (t as any)('examples.items.1.name'),
      },
      {
        alt: (t as any)('examples.items.2.alt'),
        name: (t as any)('examples.items.2.name'),
      },
      {
        alt: (t as any)('examples.items.3.alt'),
        name: (t as any)('examples.items.3.name'),
      },
      {
        alt: (t as any)('examples.items.4.alt'),
        name: (t as any)('examples.items.4.name'),
      },
      {
        alt: (t as any)('examples.items.5.alt'),
        name: (t as any)('examples.items.5.name'),
      },
    ],
  };

  // What is section
  const whatIsSection = {
    title: (t as any)('whatIs.title'),
    description: (t as any)('whatIs.description'),
    features: [],
    image: {
      src: '/images/docs/what-is-${toolSlug}.webp',
      alt: 'What is ${toolName}',
    },
    cta: { text: (t as any)('ctaButton') },
  };

  // How to section
  const howtoSection = {
    name: 'howto',
    title: (t as any)('howto.title'),
    description: (t as any)('howto.description'),
    image: {
      src: '/images/docs/${toolSlug}-how-to.webp',
      alt: 'How to use ${toolName}',
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

  // Highlights section
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
          src: '/images/docs/${toolSlug}-fact-1.webp',
          alt: (t as any)('funFacts.items.0.title'),
        },
      },
      {
        title: (t as any)('funFacts.items.1.title'),
        description: (t as any)('funFacts.items.1.description'),
        image: {
          src: '/images/docs/${toolSlug}-fact-2.webp',
          alt: (t as any)('funFacts.items.1.title'),
        },
      },
    ],
  };

  // User Interest section (4 content blocks)
  const userInterestSection = {
    name: 'userInterest',
    title: (t as any)('userInterest.title'),
    items: [
      {
        title: (t as any)('userInterest.items.0.title'),
        description: (t as any)('userInterest.items.0.description'),
        image: {
          src: '/images/docs/${toolSlug}-interest-1.webp',
          alt: (t as any)('userInterest.items.0.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.1.title'),
        description: (t as any)('userInterest.items.1.description'),
        image: {
          src: '/images/docs/${toolSlug}-interest-2.webp',
          alt: (t as any)('userInterest.items.1.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.2.title'),
        description: (t as any)('userInterest.items.2.description'),
        image: {
          src: '/images/docs/${toolSlug}-interest-3.webp',
          alt: (t as any)('userInterest.items.2.title'),
        },
      },
      {
        title: (t as any)('userInterest.items.3.title'),
        description: (t as any)('userInterest.items.3.description'),
        image: {
          src: '/images/docs/${toolSlug}-interest-4.webp',
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
          <div className="container max-w-5xl mx-auto px-4 text-center relative z-10 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {(t as any)('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              {(t as any)('hero.description')}
            </p>

            {/* User Avatars and Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {${generateRandomAvatarLogic(toolSlug)}.map((avatar, i) => (
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
                ))}
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
                  from ${generateRandomUserCount(toolSlug)}+ happy users
                </p>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Tool Component */}
        <div className="pt-0 pb-12 bg-gradient-to-b from-muted/20 to-background">
          <${componentName} pageData={pageData} locale={locale} />
        </div>

        {/* What Is Section */}
        <WhatIsSection section={whatIsSection} />

        {/* Examples Section */}
        <BeforeAfterSection beforeAfterGallery={examplesData} />

        {/* How to Section */}
        <HowTo section={howtoSection} />

        {/* User Interest Blocks */}
        <UserScenarios section={userInterestSection} ctaText={(t as any)('ctaButton')} />

        {/* Fun Facts */}
        <UserScenarios section={funFactsSection} ctaText={(t as any)('ctaButton')} />

        {/* Highlights */}
        <WhyChoose section={highlightsSection} />

        {/* Explore Other Tools */}
        <ExploreOurAiTools
          toolKeys={[
            'Gen Z Translator',
            'Dog Translator',
            'Bad Translator',
            'Ancient Greek Translator',
            'Gibberish Translator',
            'Esperanto Translator',
          ]}
        />

        {/* Testimonials */}
        <TestimonialsSection namespace="${toolNamespace}.testimonials" />

        {/* FAQ */}
        <FaqSection namespace="${toolNamespace}.faqs" />

        {/* CTA */}
        <CallToActionSection namespace="${toolNamespace}.cta" />
      </div>
    </>
  );
}
`;

fs.writeFileSync(path.join(pageDir, 'page.tsx'), pageTemplate);
console.log('✅ 生成 page.tsx');

// ============================================
// 3. 生成工具组件 (简化版)
// ============================================
const toolComponentTemplate = `'use client';

import mammoth from 'mammoth';
import { useState } from 'react';
import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';

interface ${componentName}Props {
  pageData: any;
  locale?: string;
}

export default function ${componentName}({ pageData, locale = 'en' }: ${componentName}Props) {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    try {
      const text = await readFileContent(file);
      setInputText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
      setFileName(null);
    }
  };

  // Read file content
  const readFileContent = async (file: File): Promise<string> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'txt') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) resolve(content);
          else reject(new Error('File is empty'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    }

    if (fileExtension === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value) return result.value;
        throw new Error('Failed to extract text from Word document');
      } catch (error) {
        throw new Error('Failed to read .docx file. Please ensure it is a valid Word document.');
      }
    }

    throw new Error('Unsupported file format. Please upload .txt or .docx files.');
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(pageData.tool.noInput);
      setOutputText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputText('');

    try {
      // TODO: 替换为你的 API 端点
      const response = await fetch('/api/${toolSlug}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || pageData.tool.error);
      }

      setOutputText(data.translated || data.result || '');
    } catch (err: any) {
      setError(err.message || 'Translation failed');
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setFileName(null);
    setError(null);
  };

  // Copy
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`${toolSlug}-\${Date.now()}.txt\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 mb-10">
      <main className="w-full bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-lg p-4 md:p-8">
        {/* Input and Output Areas */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Input Area */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {pageData.tool.inputLabel}
            </h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={pageData.tool.inputPlaceholder}
              className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-700 dark:text-gray-200 dark:bg-zinc-700"
              aria-label="Input text"
            />

            {/* File Upload */}
            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-medium rounded-lg cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {pageData.tool.uploadButton}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{pageData.tool.uploadHint}</p>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* File Name Display */}
            {fileName && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded-md border border-gray-200 dark:border-zinc-600">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{fileName}</span>
                <button
                  onClick={() => { setFileName(null); setInputText(''); }}
                  className="ml-auto text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  aria-label="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Output Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {pageData.tool.outputLabel}
              </h2>
              {outputText && (
                <div className="flex gap-2">
                  <TextToSpeechButton text={outputText} locale={locale} />
                  <button onClick={handleCopy} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" title="Copy">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button onClick={handleDownload} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" title="Download">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="w-full h-48 md:h-64 p-3 border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 overflow-y-auto" aria-live="polite">
              {isLoading ? (
                <p>{pageData.tool.loading}</p>
              ) : error ? (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              ) : outputText ? (
                <p className="text-lg whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{pageData.tool.outputPlaceholder}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? pageData.tool.loading : pageData.tool.translateButton}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 dark:bg-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-500 text-gray-800 dark:text-gray-100 font-semibold rounded-lg shadow-md transition-colors"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync(
  path.join(pageDir, `${componentName}.tsx`),
  toolComponentTemplate
);
console.log(`✅ 生成 ${componentName}.tsx`);

// ============================================
// 4. 生成翻译模板 (英文)
// ============================================
const translationTemplate = {
  title: toolName,
  description: `Translate text to ${toolName} instantly with our free online tool. Fast, accurate, and easy to use.`,
  hero: {
    title: toolName,
    description: `Transform your text with our ${toolName} tool. Fast, accurate, and free to use.`,
  },
  ctaButton: `Try ${toolName} Now`,
  tool: {
    inputLabel: 'Input Text',
    outputLabel: 'Translated Text',
    inputPlaceholder: 'Enter your text here...',
    outputPlaceholder: 'Translation will appear here...',
    translateButton: 'Translate',
    uploadButton: 'Upload File',
    uploadHint: 'Supports .txt and .docx files',
    loading: 'Translating...',
    error: 'Translation failed. Please try again.',
    noInput: 'Please enter some text to translate.',
  },
  whatIs: {
    title: `What is ${toolName}?`,
    description: `${toolName} is a powerful tool that helps you translate text quickly and accurately.`,
  },
  examples: {
    title: 'Translation Examples',
    description: 'See how our translator works with real examples',
  },
  howto: {
    title: `How to Use ${toolName}`,
    description: 'Follow these simple steps to translate your text',
    steps: [
      {
        title: 'Upload or Type',
        description: 'Enter your text or upload a file',
      },
      { title: 'Click Translate', description: 'Press the translate button' },
      {
        title: 'Get Results',
        description: 'View your translated text instantly',
      },
      {
        title: 'Copy or Download',
        description: 'Save your results for later use',
      },
    ],
  },
  highlights: {
    title: 'Why Choose Our Translator?',
    description: 'The best features for your translation needs',
    items: [
      { title: 'Fast', description: 'Get instant results in seconds' },
      {
        title: 'Accurate',
        description: 'High-quality translations every time',
      },
      { title: 'Secure', description: 'Your data is always protected' },
      { title: 'Free', description: 'No registration or payment required' },
    ],
  },
  funFacts: {
    title: 'Interesting Facts',
    items: [
      {
        title: 'Fact 1',
        description: 'Learn something interesting about this tool',
      },
      { title: 'Fact 2', description: 'Discover more amazing features' },
    ],
  },
  userInterest: {
    title: 'More About This Tool',
    items: [
      {
        title: 'Topic 1',
        description: 'Detailed explanation about a key feature or use case',
      },
      {
        title: 'Topic 2',
        description: 'Detailed explanation about another important aspect',
      },
      {
        title: 'Topic 3',
        description: 'Detailed explanation about a third interesting point',
      },
      {
        title: 'Topic 4',
        description: 'Detailed explanation about a fourth valuable insight',
      },
    ],
  },
  testimonials: {
    title: 'What Our Users Say',
    items: [
      { name: 'User 1', role: 'Professional', text: 'This tool is amazing!' },
      { name: 'User 2', role: 'Student', text: 'So easy to use!' },
    ],
  },
  faqs: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'Is this tool free?',
        answer: 'Yes, completely free to use.',
      },
      {
        question: 'How accurate is it?',
        answer: 'Very accurate with high-quality results.',
      },
    ],
  },
  cta: {
    title: `Ready to Try ${toolName}?`,
    description: 'Start translating your text now - it only takes seconds!',
    button: 'Get Started Free',
  },
};

console.log('\n📄 生成翻译文件模板:');
console.log('-------------------------------------------');
console.log(`请将以下内容保存到 messages/pages/${toolSlug}/en.json:`);
console.log('-------------------------------------------');
console.log(JSON.stringify({ [toolNamespace]: translationTemplate }, null, 2));
console.log('-------------------------------------------\n');

// ============================================
// 5. 生成 API 路由模板
// ============================================
const apiDir = path.join(__dirname, `../src/app/api/${toolSlug}`);
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });

  const apiTemplate = `import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // TODO: 实现你的翻译逻辑
    // 这里只是一个示例，返回原文
    const translated = text; // 替换为实际的翻译逻辑

    return NextResponse.json({ translated });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(path.join(apiDir, 'route.ts'), apiTemplate);
  console.log('✅ 生成 API 路由 (需要实现翻译逻辑)');
}

// ============================================
// 6. 完成总结
// ============================================
console.log('\n🎉 工具页面生成完成!');
console.log('\n📋 接下来需要做的事情:');
console.log(
  `1. ✅ 页面已创建: src/app/[locale]/(marketing)/(pages)/${toolSlug}/`
);
console.log(`2. ✅ 工具组件已创建: ${componentName}.tsx`);
console.log(`3. ✅ API 路由已创建: src/app/api/${toolSlug}/route.ts`);
console.log('\n⚠️  需要手动完成:');
console.log(
  `4. 📝 将上面的翻译模板保存到 messages/pages/${toolSlug}/en.json 和 messages/pages/${toolSlug}/zh.json`
);
console.log(`5. 📝 更新 src/i18n/messages.ts 添加该页面的翻译导入`);
console.log(`6. 🖼️  准备图片资源 (放在 public/images/docs/ 目录):`);
console.log(`   - what-is-${toolSlug}.webp`);
console.log(`   - ${toolSlug}-how-to.webp`);
console.log(`   - ${toolSlug}-fact-1.webp`);
console.log(`   - ${toolSlug}-fact-2.webp`);
console.log(`   - ${toolSlug}-interest-1.webp`);
console.log(`   - ${toolSlug}-interest-2.webp`);
console.log(`   - ${toolSlug}-interest-3.webp`);
console.log(`   - ${toolSlug}-interest-4.webp`);
console.log(
  `7. 🔧 实现 API 路由中的翻译逻辑 (src/app/api/${toolSlug}/route.ts)`
);
console.log(`8. 🚀 运行 pnpm dev 测试页面: http://localhost:3000/${toolSlug}`);
console.log('\n💡 提示: 可以参考现有的翻译工具进行调整优化');
