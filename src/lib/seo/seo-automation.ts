import { submitSitemapAction } from '@/actions/seo/submit-sitemap';
import { websiteConfig } from '@/config/website';
import { recordSubmissionResults, shouldAutoSubmit } from './seo-monitor';

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  interval: number; // 间隔（小时）
}

export interface AutomationLog {
  id: string;
  triggerId: string;
  timestamp: string;
  success: boolean;
  message: string;
  duration: number;
  result?: any;
}

/**
 * SEO 自动化管理器
 */
export class SEOAutomationManager {
  private static instance: SEOAutomationManager;
  private triggers: Map<string, AutomationTrigger> = new Map();
  private logs: AutomationLog[] = [];

  private constructor() {
    this.initializeTriggers();
  }

  static getInstance(): SEOAutomationManager {
    if (!SEOAutomationManager.instance) {
      SEOAutomationManager.instance = new SEOAutomationManager();
    }
    return SEOAutomationManager.instance;
  }

  /**
   * 初始化自动化触发器
   */
  private initializeTriggers(): void {
    const defaultTriggers: AutomationTrigger[] = [
      {
        id: 'daily-submission',
        name: 'Daily Sitemap Submission',
        description: 'Submit sitemap to search engines daily',
        enabled: process.env.SEO_AUTO_SUBMIT_ENABLED === 'true',
        interval: 24,
      },
      {
        id: 'new-tool-alert',
        name: 'New Tool Page Alert',
        description: 'Submit new tool pages immediately when created',
        enabled: true,
        interval: 0, // 立即触发
      },
      {
        id: 'content-update-alert',
        name: 'Content Update Alert',
        description: 'Submit updated pages to search engines',
        enabled: true,
        interval: 1, // 1小时后触发
      },
      {
        id: 'weekly-health-check',
        name: 'Weekly SEO Health Check',
        description: 'Perform comprehensive SEO health analysis',
        enabled: process.env.SEO_MONITORING_ENABLED === 'true',
        interval: 168, // 7天
      },
    ];

    defaultTriggers.forEach((trigger) => {
      this.triggers.set(trigger.id, trigger);
    });
  }

  /**
   * 获取所有触发器
   */
  getTriggers(): AutomationTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * 获取日志
   */
  getLogs(limit = 100): AutomationLog[] {
    return this.logs.slice(-limit);
  }

  /**
   * 添加日志
   */
  private addLog(
    triggerId: string,
    success: boolean,
    message: string,
    duration: number,
    result?: any
  ): void {
    const log: AutomationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      triggerId,
      timestamp: new Date().toISOString(),
      success,
      message,
      duration,
      result,
    };

    this.logs.push(log);

    // 保持最近 1000 条日志
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    console.log(`[SEO Automation] ${success ? '✅' : '❌'} ${message}`);
  }

  /**
   * 手动触发 sitemap 提交
   */
  async triggerManualSubmission(force = false): Promise<void> {
    const startTime = Date.now();
    const triggerId = 'manual-submission';

    try {
      this.addLog(triggerId, true, 'Starting manual sitemap submission...', 0);

      const result = await submitSitemapAction({ force });
      const duration = Date.now() - startTime;

      if (result.success) {
        this.addLog(
          triggerId,
          true,
          `Manual submission completed successfully`,
          duration,
          result
        );

        // 记录结果
        if (result.results) {
          await recordSubmissionResults(result.results);
        }
      } else {
        this.addLog(
          triggerId,
          false,
          `Manual submission failed: ${result.error}`,
          duration
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addLog(
        triggerId,
        false,
        `Manual submission error: ${error}`,
        duration
      );
    }
  }

  /**
   * 自动触发 daily submission
   */
  async triggerDailySubmission(): Promise<void> {
    const trigger = this.triggers.get('daily-submission');
    if (!trigger || !trigger.enabled) {
      return;
    }

    const now = new Date();
    const lastRun = trigger.lastRun ? new Date(trigger.lastRun) : new Date(0);
    const hoursSinceLastRun =
      (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastRun >= trigger.interval) {
      await this.triggerManualSubmission(false);

      // 更新触发器时间
      trigger.lastRun = now.toISOString();
      const nextRun = new Date(
        now.getTime() + trigger.interval * 60 * 60 * 1000
      );
      trigger.nextRun = nextRun.toISOString();
    }
  }

  /**
   * 新工具页面创建时触发
   */
  async triggerNewToolSubmission(toolUrl: string): Promise<void> {
    const trigger = this.triggers.get('new-tool-alert');
    if (!trigger || !trigger.enabled) {
      return;
    }

    const startTime = Date.now();

    try {
      this.addLog(trigger.id, true, `New tool page detected: ${toolUrl}`, 0);

      // 延迟 5 分钟后提交，确保页面完全生成
      setTimeout(
        async () => {
          try {
            const result = await submitSitemapAction({ force: true });
            const duration = Date.now() - startTime;

            if (result.success) {
              this.addLog(
                trigger.id,
                true,
                `New tool sitemap submitted: ${toolUrl}`,
                duration,
                result
              );
            } else {
              this.addLog(
                trigger.id,
                false,
                `New tool submission failed: ${result.error}`,
                duration
              );
            }
          } catch (error) {
            const duration = Date.now() - startTime;
            this.addLog(
              trigger.id,
              false,
              `New tool submission error: ${error}`,
              duration
            );
          }
        },
        5 * 60 * 1000
      ); // 5 分钟
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addLog(
        trigger.id,
        false,
        `New tool alert error: ${error}`,
        duration
      );
    }
  }

  /**
   * 内容更新时触发
   */
  async triggerContentUpdate(pageUrl: string): Promise<void> {
    const trigger = this.triggers.get('content-update-alert');
    if (!trigger || !trigger.enabled) {
      return;
    }

    const startTime = Date.now();

    try {
      this.addLog(trigger.id, true, `Content update detected: ${pageUrl}`, 0);

      // 延迟 1 小时后提交，避免频繁提交
      setTimeout(
        async () => {
          try {
            const result = await submitSitemapAction({ force: true });
            const duration = Date.now() - startTime;

            if (result.success) {
              this.addLog(
                trigger.id,
                true,
                `Content update sitemap submitted: ${pageUrl}`,
                duration,
                result
              );
            } else {
              this.addLog(
                trigger.id,
                false,
                `Content update submission failed: ${result.error}`,
                duration
              );
            }
          } catch (error) {
            const duration = Date.now() - startTime;
            this.addLog(
              trigger.id,
              false,
              `Content update submission error: ${error}`,
              duration
            );
          }
        },
        trigger.interval * 60 * 60 * 1000
      ); // 1 小时
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addLog(
        trigger.id,
        false,
        `Content update alert error: ${error}`,
        duration
      );
    }
  }

  /**
   * 启动自动化管理器
   */
  start(): void {
    console.log('🚀 SEO Automation Manager started');

    // 每 10 分钟检查一次触发器
    setInterval(
      async () => {
        try {
          await this.triggerDailySubmission();
        } catch (error) {
          console.error('SEO automation error:', error);
        }
      },
      10 * 60 * 1000
    ); // 10 分钟

    // 初始化触发器时间
    const now = new Date();
    this.triggers.forEach((trigger) => {
      if (!trigger.nextRun) {
        const nextRun = new Date(
          now.getTime() + trigger.interval * 60 * 60 * 1000
        );
        trigger.nextRun = nextRun.toISOString();
      }
    });
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalTriggers: number;
    activeTriggers: number;
    totalLogs: number;
    successRate: number;
    last24hActivity: number;
  } {
    const activeTriggers = Array.from(this.triggers.values()).filter(
      (t) => t.enabled
    ).length;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last24hLogs = this.logs.filter(
      (log) => new Date(log.timestamp) > last24h
    );
    const successCount = last24hLogs.filter((log) => log.success).length;
    const successRate =
      last24hLogs.length > 0 ? (successCount / last24hLogs.length) * 100 : 0;

    return {
      totalTriggers: this.triggers.size,
      activeTriggers,
      totalLogs: this.logs.length,
      successRate,
      last24hActivity: last24hLogs.length,
    };
  }
}

/**
 * 全局 SEO 自动化管理器实例
 */
export const seoAutomationManager = SEOAutomationManager.getInstance();

/**
 * 自动触发函数 - 可以在需要的地方调用
 */
export async function triggerNewToolPage(toolUrl: string): Promise<void> {
  await seoAutomationManager.triggerNewToolSubmission(toolUrl);
}

export async function triggerContentUpdate(pageUrl: string): Promise<void> {
  await seoAutomationManager.triggerContentUpdate(pageUrl);
}

export async function triggerManualSubmission(): Promise<void> {
  await seoAutomationManager.triggerManualSubmission(true);
}
