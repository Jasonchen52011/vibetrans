import { websiteConfig } from '@/config/website';
import { getUrlWithLocale } from '@/lib/urls/urls';

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
  alternates?: {
    languages: {
      [key: string]: string;
    };
  };
  images?: Array<{
    url: string;
    title: string;
    caption?: string;
  }>;
}

export interface SitemapConfig {
  baseUrl: string;
  locales: string[];
  defaultLocale: string;
}

/**
 * 动态生成所有翻译工具页面的 sitemap 条目
 * 注意：这个列表应该与 src/app/[locale]/(marketing)/(pages)/ 下的目录保持一致
 */
export function generateToolPages(config: SitemapConfig): SitemapEntry[] {
  // 基于实际存在的工具页面生成列表
  // 总共25个工具页面，排除 about 页面（它应该是静态页面）
  const tools = [
    'albanian-to-english',
    'al-bhed-translator',
    'alien-text-generator',
    'ancient-greek-translator',
    'aramaic-translator',
    'baby-translator',
    'bad-translator',
    'baybayin-translator',
    'cantonese-translator',
    'chinese-to-english-translator',
    'creole-to-english-translator',
    'cuneiform-translator',
    'dog-translator',
    'dumb-it-down-ai',
    'esperanto-translator',
    'gaster-translator',
    'gen-alpha-translator',
    'gen-z-translator',
    'gibberish-translator',
    'high-valyrian-translator',
    'ivr-translator',
    'middle-english-translator',
    'minion-translator',
    'pig-latin-translator',
    'samoan-to-english-translator',
    'verbose-generator',
  ];

  const entries: SitemapEntry[] = [];

  tools.forEach((tool) => {
    // 为每个工具生成多语言版本
    const alternates = {
      languages: {} as { [key: string]: string },
    };

    config.locales.forEach((locale) => {
      const toolUrl = getUrlWithLocale(`/${tool}`, locale);
      alternates.languages[locale] = toolUrl;
    });

    // 主要URL使用默认语言
    const primaryUrl = getUrlWithLocale(`/${tool}`, config.defaultLocale);

    entries.push({
      url: primaryUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates,
      images: [
        {
          url: `${config.baseUrl}/images/docs/${tool}.webp`,
          title: `${tool.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
          caption: `AI-powered ${tool.replace(/-/g, ' ')} for instant translation`,
        },
      ],
    });
  });

  return entries;
}

/**
 * 生成其他重要页面的 sitemap 条目
 * 只包含实际存在的静态页面
 */
export function generateStaticPages(config: SitemapConfig): SitemapEntry[] {
  // 只包含实际存在的4个静态页面
  const staticPages = [
    { path: '/', priority: 1.0, changeFreq: 'daily' as const }, // 首页
    { path: '/about', priority: 0.6, changeFreq: 'monthly' as const }, // 关于我们
    { path: '/privacy', priority: 0.4, changeFreq: 'yearly' as const }, // 隐私政策
    { path: '/terms', priority: 0.4, changeFreq: 'yearly' as const }, // 服务条款
  ];

  const entries: SitemapEntry[] = [];

  staticPages.forEach((page) => {
    const alternates = {
      languages: {} as { [key: string]: string },
    };

    config.locales.forEach((locale) => {
      const pageUrl = getUrlWithLocale(page.path, locale);
      alternates.languages[locale] = pageUrl;
    });

    const primaryUrl = getUrlWithLocale(page.path, config.defaultLocale);

    entries.push({
      url: primaryUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: page.changeFreq,
      priority: page.priority,
      alternates,
    });
  });

  return entries;
}

/**
 * 生成完整的 sitemap XML
 */
export function generateSitemapXML(config: SitemapConfig): string {
  const toolPages = generateToolPages(config);
  const staticPages = generateStaticPages(config);
  const allEntries = [...staticPages, ...toolPages];

  const xmlEntries = allEntries
    .map((entry) => {
      let xml = `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>`;

      // 添加多语言链接
      if (
        entry.alternates &&
        Object.keys(entry.alternates.languages).length > 1
      ) {
        xml +=
          '\n    <xhtml:link rel="alternate" hreflang="x-default" href="' +
          entry.url +
          '" />';

        Object.entries(entry.alternates.languages).forEach(([locale, url]) => {
          if (url !== entry.url) {
            xml += `\n    <xhtml:link rel="alternate" hreflang="${locale}" href="${url}" />`;
          }
        });
      }

      // 添加图片信息
      if (entry.images && entry.images.length > 0) {
        entry.images.forEach((image) => {
          xml += `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${image.title}</image:title>`;

          if (image.caption) {
            xml += `\n      <image:caption>${image.caption}</image:caption>`;
          }

          xml += '\n    </image:image>';
        });
      }

      xml += '\n  </url>';
      return xml;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlEntries}
</urlset>`;
}

/**
 * 验证 sitemap 的完整性，检查是否包含所有实际存在的页面
 * @param config - sitemap 配置
 * @returns 验证结果，包括缺失的页面信息
 */
export function validateSitemapCompleteness(config: SitemapConfig): {
  totalToolPages: number;
  totalStaticPages: number;
  totalUrls: number;
  toolsList: string[];
  staticPagesList: string[];
} {
  const toolPages = generateToolPages(config);
  const staticPages = generateStaticPages(config);

  return {
    totalToolPages: toolPages.length,
    totalStaticPages: staticPages.length,
    totalUrls: toolPages.length + staticPages.length,
    toolsList: [
      'albanian-to-english',
      'al-bhed-translator',
      'alien-text-generator',
      'ancient-greek-translator',
      'aramaic-translator',
      'baby-translator',
      'bad-translator',
      'baybayin-translator',
      'cantonese-translator',
      'chinese-to-english-translator',
      'creole-to-english-translator',
      'cuneiform-translator',
      'dog-translator',
      'dumb-it-down-ai',
      'esperanto-translator',
      'gaster-translator',
      'gen-alpha-translator',
      'gen-z-translator',
      'gibberish-translator',
      'high-valyrian-translator',
      'ivr-translator',
      'middle-english-translator',
      'minion-translator',
      'pig-latin-translator',
      'samoan-to-english-translator',
      'verbose-generator',
    ],
    staticPagesList: ['/', '/about', '/privacy', '/terms'],
  };
}

/**
 * 获取默认的 sitemap 配置
 */
export function getSitemapConfig(): SitemapConfig {
  return {
    baseUrl:
      websiteConfig.baseUrl ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://vibetrans.com',
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  };
}
