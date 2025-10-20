#!/usr/bin/env tsx

/**
 * 测试翻译文件中Hero Description的关键词使用
 * 专门检查messages目录下的hero description中"best"关键词的使用情况
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface HeroMessage {
  file: string;
  page: string;
  path: string;
  description: string;
  wordCount: number;
  hasBest: boolean;
  hasBestKeywords: boolean[];
  type: 'home' | 'tool-page' | 'other';
}

interface TestResult {
  totalFiles: number;
  totalDescriptions: number;
  withBest: number;
  withoutBest: number;
  averageWordCount: number;
  bestUsageRate: number;
  findings: HeroMessage[];
  priorityTargets: HeroMessage[];
  recommendations: string[];
}

const testHeroKeywordsInMessages = (): TestResult => {
  console.log('🔍 开始测试Hero Description中的"best"关键词使用...\n');

  const findings: HeroMessage[] = [];
  const recommendations: string[] = [];

  // messages目录路径
  const messagesDir = 'messages/pages';

  // "best"相关关键词模式
  const bestPatterns = [
    /\bbest\b/gi,
    /\bexcellent\b/gi,
    /\boutstanding\b/gi,
    /\bsuperior\b/gi,
    /\btop-notch\b/gi,
    /\bpremium\b/gi,
  ];

  // 递归搜索所有JSON文件
  const searchJsonFiles = (dir: string): string[] => {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = require('fs').statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.')) {
          files.push(...searchJsonFiles(fullPath));
        } else if (
          stat.isFile() &&
          item.endsWith('.json') &&
          !item.includes('backup')
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  无法读取目录: ${dir}`);
    }

    return files;
  };

  // 检查单个文件
  const checkJsonFile = (filePath: string): void => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 提取页面信息
      const relativePath = filePath.replace(messagesDir + '/', '');
      const pathParts = relativePath.split('/');
      const pageName = pathParts[0]; // 例如: home, baybayin-translator
      const locale = pathParts[1]?.replace('.json', '') || 'unknown'; // 例如: en, zh

      // 查找hero description
      const heroDescription = extractHeroDescription(data, pageName);

      if (heroDescription) {
        const wordCount = heroDescription.split(/\s+/).length;
        const hasBestKeywords = bestPatterns.map((pattern) =>
          pattern.test(heroDescription)
        );
        const hasBest = hasBestKeywords[0]; // 主要检查"best"关键词

        const finding: HeroMessage = {
          file: filePath,
          page: pageName,
          path: relativePath,
          description: heroDescription,
          wordCount,
          hasBest,
          hasBestKeywords,
          type:
            pageName === 'home'
              ? 'home'
              : filePath.includes('-translator')
                ? 'tool-page'
                : 'other',
        };

        findings.push(finding);
      }
    } catch (error) {
      console.warn(`⚠️  无法解析文件: ${filePath} - ${error.message}`);
    }
  };

  // 递归提取hero description
  const extractHeroDescription = (data: any, pageName: string): string => {
    // 查找hero.description
    if (data.hero && data.hero.description) {
      return data.hero.description;
    }

    // 查找HomePage.hero.description
    if (data.HomePage && data.HomePage.hero && data.HomePage.hero.description) {
      return data.HomePage.hero.description;
    }

    // 查找description（可能是页面级描述）
    if (
      data.description &&
      typeof data.description === 'string' &&
      data.description.length > 30
    ) {
      return data.description;
    }

    return null;
  };

  // 搜索所有文件
  const allJsonFiles = searchJsonFiles(messagesDir);
  console.log(`📁 找到 ${allJsonFiles.length} 个JSON文件\n`);

  allJsonFiles.forEach(checkJsonFile);

  // 统计结果
  const totalFiles = allJsonFiles.length;
  const totalDescriptions = findings.length;
  const withBest = findings.filter((f) => f.hasBest).length;
  const withoutBest = totalDescriptions - withBest;
  const averageWordCount =
    totalDescriptions > 0
      ? Math.round(
          findings.reduce((sum, f) => sum + f.wordCount, 0) / totalDescriptions
        )
      : 0;
  const bestUsageRate =
    totalDescriptions > 0
      ? Math.round((withBest / totalDescriptions) * 100)
      : 0;

  // 识别优先目标（字数适中、重要页面、缺少best关键词）
  const priorityTargets = findings
    .filter(
      (f) =>
        !f.hasBest &&
        f.wordCount >= 20 &&
        f.wordCount <= 50 &&
        (f.type === 'home' || f.type === 'tool-page')
    )
    .sort((a, b) => a.wordCount - b.wordCount)
    .slice(0, 8);

  // 生成建议
  if (withoutBest > 0) {
    recommendations.push(
      `🎯 当前"best"关键词使用率: ${bestUsageRate}% (${withBest}/${totalDescriptions})`
    );
    recommendations.push(`📈 建议将使用率提升到30-40%，约8-12个页面`);

    if (priorityTargets.length > 0) {
      recommendations.push('\n🎯 优先优化目标 (核心工具页面):');
      priorityTargets.forEach((target, index) => {
        recommendations.push(
          `${index + 1}. ${target.page} (${target.wordCount}字): "${target.description.substring(0, 60)}..."`
        );
      });
    }

    recommendations.push('\n💡 融入建议:');
    recommendations.push(
      '• "VibeTrans provides the best [feature] for [use case]"'
    );
    recommendations.push(
      '• "Experience the best [language] translation accuracy"'
    );
    recommendations.push('• "The best tool for [specific user group]"');
    recommendations.push('• "Get the best results with our [technology]"');

    recommendations.push('\n⚠️  注意事项:');
    recommendations.push('• 保持自然性，避免关键词堆砌');
    recommendations.push('• 确保表述准确可信');
    recommendations.push('• 优先在核心工具和首页使用');
  }

  // 生成报告
  console.log('📊 Hero Description关键词测试报告');
  console.log('='.repeat(60));
  console.log(`总计JSON文件: ${totalFiles}`);
  console.log(`包含Hero Description: ${totalDescriptions}`);
  console.log(`使用"best"关键词: ${withBest} (${bestUsageRate}%)`);
  console.log(`未使用"best"关键词: ${withoutBest} (${100 - bestUsageRate}%)`);
  console.log(`平均字数: ${averageWordCount}字`);

  // 显示已使用best的页面
  if (withBest > 0) {
    console.log('\n✅ 已使用"best"关键词的页面:');
    findings
      .filter((f) => f.hasBest)
      .forEach((f) => {
        console.log(`  • ${f.page}: "${f.description}"`);
      });
  }

  // 显示优先目标
  if (priorityTargets.length > 0) {
    console.log('\n🎯 优先优化建议:');
    priorityTargets.forEach((target, index) => {
      console.log(`${index + 1}. ${target.page} (${target.wordCount}字)`);
      console.log(`   当前: "${target.description}"`);
      console.log(
        `   建议: 可融入"best"来强调${target.page.includes('translator') ? '翻译质量' : '核心优势'}`
      );
    });
  }

  if (recommendations.length > 0) {
    console.log('\n💡 优化建议:');
    recommendations.forEach((rec) => console.log(`  ${rec}`));
  }

  return {
    totalFiles,
    totalDescriptions,
    withBest,
    withoutBest,
    averageWordCount,
    bestUsageRate,
    findings,
    priorityTargets,
    recommendations,
  };
};

// 运行测试
if (require.main === module) {
  testHeroKeywordsInMessages()
    .then((result) => {
      console.log('\n✅ 测试完成');

      // 如果使用率低于20%，给出警告
      if (result.bestUsageRate < 20) {
        console.log('⚠️  建议优化: "best"关键词使用率偏低，建议提升到30%以上');
        process.exit(1);
      } else {
        console.log('🎉 关键词使用情况良好!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

export default testHeroKeywordsInMessages;
