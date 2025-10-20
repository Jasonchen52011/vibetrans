import {
  type submissionResult,
  submissionStats,
} from './search-engine-submitter';

export interface SEOStatus {
  lastSubmission?: string;
  submissionCount: number;
  successRate: number;
  searchEngines: {
    [key: string]: {
      lastSubmission?: string;
      successCount: number;
      failCount: number;
      lastError?: string;
    };
  };
  sitemapGenerated: string;
  indexedPages: number;
  crawlErrors: number;
}

export interface SEOHealthCheck {
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
  score: number;
}

/**
 * 获取 SEO 状态监控数据
 */
export async function getSEOStatus(): Promise<SEOStatus> {
  // 这里可以集成数据库来存储历史数据
  // 目前返回基于内存的示例数据

  const defaultStatus: SEOStatus = {
    submissionCount: 0,
    successRate: 0,
    searchEngines: {},
    sitemapGenerated: new Date().toISOString(),
    indexedPages: 0,
    crawlErrors: 0,
  };

  try {
    // 可以从数据库或缓存中获取实际数据
    // const cache = await getSEOCache();
    // return cache || defaultStatus;

    return defaultStatus;
  } catch (error) {
    console.error('Error getting SEO status:', error);
    return defaultStatus;
  }
}

/**
 * 记录提交结果
 */
export async function recordSubmissionResults(
  results: submissionResult[]
): Promise<void> {
  try {
    // 这里可以将结果保存到数据库
    console.log('Recording submission results:', results);

    // 示例：更新搜索引擎状态
    results.forEach((result) => {
      if (result.success) {
        console.log(
          `✅ ${result.searchEngine}: Successfully submitted ${result.url}`
        );
      } else {
        console.error(`❌ ${result.searchEngine}: Failed - ${result.error}`);
      }
    });
  } catch (error) {
    console.error('Error recording submission results:', error);
  }
}

/**
 * 检查 SEO 健康状态
 */
export async function performSEOHealthCheck(): Promise<SEOHealthCheck> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 检查环境变量配置
  if (!process.env.BING_API_KEY) {
    issues.push('Bing API key not configured');
    recommendations.push(
      'Add BING_API_KEY to enable Bing Webmaster Tools submission'
    );
    score -= 15;
  }

  if (!process.env.BING_SITE_VERIFICATION_KEY) {
    issues.push('Bing site verification not configured');
    recommendations.push(
      'Add BING_SITE_VERIFICATION_KEY to verify site ownership'
    );
    score -= 10;
  }

  // 检查 SEO 自动化是否启用
  const seoEnabled = process.env.SEO_AUTO_SUBMIT_ENABLED === 'true';
  if (!seoEnabled) {
    issues.push('SEO auto-submission is disabled');
    recommendations.push(
      'Enable SEO_AUTO_SUBMIT_ENABLED for automatic sitemap submission'
    );
    score -= 20;
  }

  // 检查监控是否启用
  const monitoringEnabled = process.env.SEO_MONITORING_ENABLED === 'true';
  if (!monitoringEnabled) {
    issues.push('SEO monitoring is disabled');
    recommendations.push(
      'Enable SEO_MONITORING_ENABLED for performance tracking'
    );
    score -= 10;
  }

  // 检查 base URL 配置
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl || baseUrl === 'http://localhost:3000') {
    issues.push('Using localhost URL in production');
    recommendations.push(
      'Update NEXT_PUBLIC_BASE_URL to your production domain'
    );
    score -= 25;
  }

  // 检查 sitemap 可访问性
  try {
    const sitemapUrl = `${baseUrl}/api/sitemap.xml`;
    const response = await fetch(sitemapUrl);

    if (!response.ok) {
      issues.push('Sitemap is not accessible');
      recommendations.push('Check /api/sitemap.xml endpoint');
      score -= 20;
    }
  } catch (error) {
    issues.push('Cannot reach sitemap endpoint');
    recommendations.push(
      'Verify server is running and sitemap route is working'
    );
    score -= 20;
  }

  // 确定健康状态
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (score < 50) {
    status = 'error';
  } else if (score < 80) {
    status = 'warning';
  }

  // 添加通用建议
  if (recommendations.length === 0) {
    recommendations.push(
      'SEO configuration looks good! Consider setting up regular submissions.'
    );
  }

  return {
    status,
    issues,
    recommendations,
    score: Math.max(0, score),
  };
}

/**
 * 获取 SEO 性能指标
 */
export interface SEOMetrics {
  submissionFrequency: number; // 提交频率（次/天）
  averageResponseTime: number; // 平均响应时间（毫秒）
  lastWeekSubmissions: number; // 上周提交次数
  successTrend: 'improving' | 'stable' | 'declining'; // 成功率趋势
  topPerformingPages: Array<{
    url: string;
    lastIndexed: string;
    indexStatus: 'indexed' | 'pending' | 'error';
  }>;
}

export async function getSEOMetrics(): Promise<SEOMetrics> {
  try {
    // 这里可以集成 Google Search Console API、Bing Webmaster API 等
    // 目前返回示例数据

    return {
      submissionFrequency: 1, // 每天1次
      averageResponseTime: 2000, // 2秒
      lastWeekSubmissions: 7,
      successTrend: 'stable',
      topPerformingPages: [
        {
          url: '/albanian-to-english-translator',
          lastIndexed: new Date().toISOString(),
          indexStatus: 'indexed',
        },
        {
          url: '/cuneiform-translator',
          lastIndexed: new Date().toISOString(),
          indexStatus: 'indexed',
        },
        {
          url: '/ancient-greek-translator',
          lastIndexed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          indexStatus: 'pending',
        },
      ],
    };
  } catch (error) {
    console.error('Error getting SEO metrics:', error);

    return {
      submissionFrequency: 0,
      averageResponseTime: 0,
      lastWeekSubmissions: 0,
      successTrend: 'stable',
      topPerformingPages: [],
    };
  }
}

/**
 * 计算下次提交时间
 */
export function getNextSubmissionTime(): Date {
  const intervalHours = Number.parseInt(
    process.env.SEO_SUBMISSION_INTERVAL_HOURS || '24'
  );
  const nextSubmission = new Date();
  nextSubmission.setHours(nextSubmission.getHours() + intervalHours);
  return nextSubmission;
}

/**
 * 检查是否需要自动提交
 */
export function shouldAutoSubmit(): boolean {
  const seoEnabled = process.env.SEO_AUTO_SUBMIT_ENABLED === 'true';
  if (!seoEnabled) {
    return false;
  }

  // 这里可以检查上次提交时间，决定是否需要自动提交
  // 目前返回 true 表示可以进行提交
  return true;
}
