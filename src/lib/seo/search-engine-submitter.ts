import { websiteConfig } from '@/config/website';

export interface SubmissionResult {
  success: boolean;
  searchEngine: string;
  url?: string;
  error?: string;
  timestamp: string;
}

export interface SubmissionConfig {
  sitemapUrl: string;
  siteUrl: string;
  bingApiKey?: string;
}

/**
 * 提交 sitemap 到 Google Search Console
 * 使用 Google Ping API
 */
export async function submitToGoogle(
  config: SubmissionConfig
): Promise<SubmissionResult> {
  const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(config.sitemapUrl)}`;

  try {
    const response = await fetch(googlePingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans SEO Bot)',
      },
    });

    if (response.ok) {
      const text = await response.text();
      return {
        success: true,
        searchEngine: 'Google',
        url: config.sitemapUrl,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        searchEngine: 'Google',
        url: config.sitemapUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      success: false,
      searchEngine: 'Google',
      url: config.sitemapUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 提交 sitemap 到 Bing Webmaster Tools
 * 使用 Bing Webmaster API - 提交单个 URL
 */
export async function submitToBing(
  config: SubmissionConfig
): Promise<SubmissionResult> {
  if (!config.bingApiKey) {
    return {
      success: false,
      searchEngine: 'Bing',
      error: 'Bing API key not configured',
      timestamp: new Date().toISOString(),
    };
  }

  // 使用 Bing SubmitUrl API
  const bingApiUrl = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl`;

  const requestBody = {
    siteUrl: config.siteUrl,
    url: config.sitemapUrl, // 提交 sitemap URL
  };

  try {
    const response = await fetch(`${bingApiUrl}?apikey=${config.bingApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans SEO Bot)',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    console.log('Bing API Response:', result); // Debug log

    if (response.ok && (result.d === true || result.d === 'true')) {
      return {
        success: true,
        searchEngine: 'Bing',
        url: config.sitemapUrl,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        searchEngine: 'Bing',
        url: config.sitemapUrl,
        error: result.error
          ? result.error.message
          : `HTTP ${response.status}: ${JSON.stringify(result)}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      success: false,
      searchEngine: 'Bing',
      url: config.sitemapUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 提交 sitemap 到 Bing (使用传统方法)
 * 这个方法不需要 API key
 */
export async function submitToBingLegacy(
  config: SubmissionConfig
): Promise<SubmissionResult> {
  const bingPingUrl = `http://www.bing.com/ping?sitemap=${encodeURIComponent(config.sitemapUrl)}`;

  try {
    const response = await fetch(bingPingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans SEO Bot)',
      },
    });

    if (response.ok) {
      const text = await response.text();
      return {
        success: true,
        searchEngine: 'Bing',
        url: config.sitemapUrl,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        searchEngine: 'Bing',
        url: config.sitemapUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      success: false,
      searchEngine: 'Bing',
      url: config.sitemapUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 提交到 DuckDuckGo
 * DuckDuckGo 使用 Bing 的索引，所以不需要单独提交
 */
export async function submitToDuckDuckGo(
  config: SubmissionConfig
): Promise<SubmissionResult> {
  return {
    success: true,
    searchEngine: 'DuckDuckGo',
    url: config.sitemapUrl,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 提交到 Yandex
 */
export async function submitToYandex(
  config: SubmissionConfig
): Promise<SubmissionResult> {
  const yandexPingUrl = `https://webmaster.yandex.ru/api/v2/user/?method=add-sitemap&url=${encodeURIComponent(config.sitemapUrl)}`;

  try {
    const response = await fetch(yandexPingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VibeTrans SEO Bot)',
      },
    });

    if (response.ok) {
      return {
        success: true,
        searchEngine: 'Yandex',
        url: config.sitemapUrl,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        searchEngine: 'Yandex',
        url: config.sitemapUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      success: false,
      searchEngine: 'Yandex',
      url: config.sitemapUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 批量提交到所有支持的搜索引擎
 */
export async function submitToAllSearchEngines(): Promise<SubmissionResult[]> {
  const baseUrl =
    websiteConfig.baseUrl ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://vibetrans.com';
  const sitemapUrl = `${baseUrl}/api/sitemap.xml`;

  const config: SubmissionConfig = {
    sitemapUrl,
    siteUrl: baseUrl,
    bingApiKey: process.env.BING_API_KEY,
  };

  const results: SubmissionResult[] = [];

  // 并行提交到所有搜索引擎
  const submissions = [
    submitToGoogle(config),
    submitToBing(config),
    submitToBingLegacy(config),
    submitToDuckDuckGo(config),
    submitToYandex(config),
  ];

  const submissionResults = await Promise.allSettled(submissions);

  submissionResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      console.error('Search engine submission failed:', result.reason);
      results.push({
        success: false,
        searchEngine: 'Unknown',
        error:
          result.reason instanceof Error
            ? result.reason.message
            : 'Submission failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return results;
}

/**
 * 获取提交统计信息
 */
export function getSubmissionStats(results: SubmissionResult[]) {
  const total = results.length;
  const successful = results.filter((r) => r.success).length;
  const failed = total - successful;

  const byEngine = results.reduce(
    (acc, result) => {
      if (!acc[result.searchEngine]) {
        acc[result.searchEngine] = { success: 0, failed: 0 };
      }
      if (result.success) {
        acc[result.searchEngine].success++;
      } else {
        acc[result.searchEngine].failed++;
      }
      return acc;
    },
    {} as Record<string, { success: number; failed: number }>
  );

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    byEngine,
  };
}
