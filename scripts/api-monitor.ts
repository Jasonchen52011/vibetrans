#!/usr/bin/env tsx

/**
 * API持续监控脚本
 * 定期检查API状态并记录历史数据
 */

import fs from 'fs';
import path from 'path';

interface MonitorConfig {
  baseUrl: string;
  interval: number; // 检查间隔（毫秒）
  maxHistory: number; // 最大历史记录数
  alertThreshold: number; // 响应时间警告阈值（毫秒）
  logFile: string;
}

interface MonitoringData {
  timestamp: string;
  api: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  error?: string;
}

interface HistoryRecord {
  timestamp: string;
  summary: {
    total: number;
    online: number;
    offline: number;
    errors: number;
    avgResponseTime: number;
  };
  details: MonitoringData[];
}

const MONITOR_APIS = [
  { name: 'Baybayin Translator', api: '/api/baybayin-translator' },
  { name: 'Dog Translator', api: '/api/dog-translator' },
  { name: 'Gen Z Translator', api: '/api/gen-z-translator' },
  { name: 'Bad Translator', api: '/api/bad-translator' },
  { name: 'Chinese to English', api: '/api/chinese-to-english-translator' },
  { name: 'Cantonese Translator', api: '/api/cantonese-translator' },
  { name: 'Ancient Greek', api: '/api/ancient-greek-translator' },
  { name: 'Al-Bhed Translator', api: '/api/al-bhed-translator' },
  { name: 'Esperanto Translator', api: '/api/esperanto-translator' },
  { name: 'High Valyrian', api: '/api/high-valyrian-translator' },
];

class APIMonitor {
  private config: MonitorConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private history: HistoryRecord[] = [];

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
      interval: 60000, // 1分钟
      maxHistory: 1440, // 24小时的历史（每分钟一次）
      alertThreshold: 5000, // 5秒
      logFile: 'api-monitor-history.json',
      ...config,
    };

    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const historyPath = path.join(process.cwd(), this.config.logFile);
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf-8');
        this.history = JSON.parse(data);
        // 限制历史记录数量
        if (this.history.length > this.config.maxHistory) {
          this.history = this.history.slice(-this.config.maxHistory);
        }
      }
    } catch (error) {
      console.warn('Failed to load monitoring history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      const historyPath = path.join(process.cwd(), this.config.logFile);
      fs.writeFileSync(historyPath, JSON.stringify(this.history, null, 2));
    } catch (error) {
      console.error('Failed to save monitoring history:', error);
    }
  }

  private async checkSingleApi(api: { name: string; api: string }): Promise<MonitoringData> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}${api.api}`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000), // 10秒超时
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          timestamp: new Date().toISOString(),
          api: api.name,
          status: 'online',
          responseTime,
        };
      } else {
        return {
          timestamp: new Date().toISOString(),
          api: api.name,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        timestamp: new Date().toISOString(),
        api: api.name,
        status: 'offline',
        responseTime: Date.now() - startTime,
        error: error.name === 'AbortError' ? 'Timeout' : error.message,
      };
    }
  }

  private async performCheck(): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${new Date().toLocaleTimeString()}] API Monitoring Check...`);

    const results: MonitoringData[] = [];

    for (const api of MONITOR_APIS) {
      const result = await this.checkSingleApi(api);
      results.push(result);

      // 实时输出结果
      const statusEmoji = result.status === 'online' ? '✅' : result.status === 'error' ? '⚠️' : '❌';
      const timeDisplay = `${result.responseTime}ms`;
      const alert = result.responseTime > this.config.alertThreshold ? ' 🐌' : '';

      console.log(`   ${statusEmoji} ${api.name}: ${result.status} (${timeDisplay})${alert}`);
    }

    // 计算摘要
    const online = results.filter(r => r.status === 'online').length;
    const offline = results.filter(r => r.status === 'offline').length;
    const errors = results.filter(r => r.status === 'error').length;
    const avgResponseTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length);

    const summary = {
      total: results.length,
      online,
      offline,
      errors,
      avgResponseTime,
    };

    // 输出摘要
    const healthPercentage = Math.round((online / results.length) * 100);
    const healthEmoji = healthPercentage >= 90 ? '🟢' : healthPercentage >= 70 ? '🟡' : '🔴';

    console.log(`   ${healthEmoji} Health: ${healthPercentage}% | Online: ${online}/${results.length} | Avg: ${avgResponseTime}ms`);

    // 检查是否有严重问题
    if (offline > 0) {
      console.log(`   🚨 ${offline} API(s) are offline!`);
    }
    if (avgResponseTime > this.config.alertThreshold) {
      console.log(`   ⚠️  Slow response times detected (avg: ${avgResponseTime}ms)`);
    }

    // 保存历史记录
    const record: HistoryRecord = {
      timestamp,
      summary,
      details: results,
    };

    this.history.push(record);

    // 限制历史记录数量
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(-this.config.maxHistory);
    }

    this.saveHistory();
  }

  private generateReport(): void {
    if (this.history.length === 0) {
      console.log('No monitoring data available.');
      return;
    }

    const latest = this.history[this.history.length - 1];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentData = this.history.filter(record =>
      new Date(record.timestamp) >= oneHourAgo
    );

    const dayData = this.history.filter(record =>
      new Date(record.timestamp) >= oneDayAgo
    );

    console.log('\n📊 API Monitoring Report');
    console.log('=' .repeat(50));

    console.log(`\n📍 Current Status (${new Date(latest.timestamp).toLocaleString()}):`);
    console.log(`   Health: ${Math.round((latest.summary.online / latest.summary.total) * 100)}%`);
    console.log(`   Online: ${latest.summary.online}/${latest.summary.total}`);
    console.log(`   Average Response Time: ${latest.summary.avgResponseTime}ms`);

    if (recentData.length > 0) {
      const avgOnline = Math.round(
        recentData.reduce((sum, record) => sum + (record.summary.online / record.summary.total) * 100, 0) / recentData.length
      );
      const avgResponseTime = Math.round(
        recentData.reduce((sum, record) => sum + record.summary.avgResponseTime, 0) / recentData.length
      );

      console.log(`\n📈 Last Hour (${recentData.length} checks):`);
      console.log(`   Average Health: ${avgOnline}%`);
      console.log(`   Average Response Time: ${avgResponseTime}ms`);
    }

    if (dayData.length > 0) {
      const minHealth = Math.min(...dayData.map(record => (record.summary.online / record.summary.total) * 100));
      const maxResponseTime = Math.max(...dayData.map(record => record.summary.avgResponseTime));

      console.log(`\n📅 Last 24 Hours:`);
      console.log(`   Lowest Health: ${Math.round(minHealth)}%`);
      console.log(`   Slowest Response: ${maxResponseTime}ms`);
      console.log(`   Total Checks: ${dayData.length}`);
    }

    // 显示离线API
    const offlineApis = latest.details.filter(d => d.status !== 'online');
    if (offlineApis.length > 0) {
      console.log(`\n🚨 Current Issues:`);
      offlineApis.forEach(api => {
        console.log(`   ❌ ${api.api}: ${api.status}${api.error ? ` - ${api.error}` : ''}`);
      });
    }
  }

  public start(): void {
    if (this.isRunning) {
      console.log('Monitoring is already running.');
      return;
    }

    console.log('🚀 Starting API monitoring...');
    console.log(`   Target: ${this.config.baseUrl}`);
    console.log(`   Interval: ${this.config.interval / 1000}s`);
    console.log(`   APIs: ${MONITOR_APIS.length}`);
    console.log('   Press Ctrl+C to stop\n');

    this.isRunning = true;

    // 立即执行一次检查
    this.performCheck();

    // 设置定期检查
    this.intervalId = setInterval(() => {
      this.performCheck();
    }, this.config.interval);

    // 处理退出信号
    process.on('SIGINT', () => {
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.stop();
    });

    // 处理用户输入
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      if (key === '\u0003') { // Ctrl+C
        this.stop();
      } else if (key === 'r') { // R键 - 生成报告
        this.generateReport();
      } else if (key === 'q') { // Q键 - 退出
        this.stop();
      }
    });

    console.log('Monitoring started. Press "r" for report, "q" to quit, or Ctrl+C to stop.\n');
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('\n\n🛑 Stopping API monitoring...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.generateReport();
    console.log('Monitoring stopped.');
    process.exit(0);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
API Monitor - 持续监控API健康状态

用法:
  tsx scripts/api-monitor.ts [选项]

选项:
  --help, -h           显示帮助信息
  --report             生成报告并退出
  --interval <秒数>     设置检查间隔（默认60秒）
  --threshold <毫秒>   设置响应时间警告阈值（默认5000ms）

环境变量:
  TEST_BASE_URL        要测试的基础URL（默认: http://localhost:3000）

示例:
  tsx scripts/api-monitor.ts                # 启动监控
  tsx scripts/api-monitor.ts --report       # 生成报告
  tsx scripts/api-monitor.ts --interval 30  # 30秒间隔
`);
    process.exit(0);
  }

  const config: Partial<MonitorConfig> = {};

  if (args.includes('--report')) {
    const monitor = new APIMonitor(config);
    monitor.generateReport();
    return;
  }

  const intervalIndex = args.indexOf('--interval');
  if (intervalIndex !== -1 && args[intervalIndex + 1]) {
    config.interval = parseInt(args[intervalIndex + 1]) * 1000;
  }

  const thresholdIndex = args.indexOf('--threshold');
  if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
    config.alertThreshold = parseInt(args[thresholdIndex + 1]);
  }

  const monitor = new APIMonitor(config);
  monitor.start();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Monitor failed to start:', error);
    process.exit(1);
  });
}