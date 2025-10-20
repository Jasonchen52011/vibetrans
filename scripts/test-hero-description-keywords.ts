#!/usr/bin/env tsx

/**
 * Hero Description关键词测试用例
 * 检测hero description中"best"关键词的使用情况
 */

import { readFileSync, readdirSync } from 'fs';
import { extname, join } from 'path';

interface HeroFinding {
  file: string;
  component: string;
  type: 'hero-component' | 'page-description' | 'metadata';
  description: string;
  wordCount: number;
  hasBest: boolean;
  hasBestKeyword: boolean;
  position?: number;
  context?: string;
}

interface TestResult {
  total: number;
  withBest: number;
  withoutBest: number;
  averageWordCount: number;
  findings: HeroFinding[];
  recommendations: string[];
}

const testHeroDescriptionKeywords = async (): Promise<TestResult> => {
  console.log('🔍 开始Hero Description关键词测试...\n');

  const findings: HeroFinding[] = [];
  const recommendations: string[] = [];

  // 需要检查的目录
  const directories = [
    'src/components/blocks',
    'src/components/tailark',
    'src/app/[locale]/(marketing)/(pages)',
    'src/app/[locale]/(marketing)/layout.tsx',
    'src/app/[locale]/(marketing)/page.tsx',
  ];

  // Hero相关的关键词和模式
  const heroPatterns = [
    'hero',
    'Hero',
    'description',
    'Description',
    'pageData',
    't\\(\'[^\\"]*description[^\\"]*\'\\)', // i18n翻译键
    'meta[^>]*description[^>]*]', // SEO meta描述
  ];

  // "best"关键词的不同形式
  const bestPatterns = ['\\bbest\\b', '\\bBest\\b', '\\bBEST\\b'];

  // 递归搜索文件
  const searchFiles = (
    dir: string,
    extensions: string[] = ['.tsx', '.ts', '.jsx', '.js']
  ): string[] => {
    const files: string[] = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = require('fs').statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules'
        ) {
          files.push(...searchFiles(fullPath, extensions));
        } else if (stat.isFile()) {
          const ext = extname(fullPath);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  无法读取目录: ${dir}`);
    }

    return files;
  };

  // 检查单个文件
  const checkFile = (filePath: string): void => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // 检查是否包含hero相关内容
      const isHeroRelated = heroPatterns.some((pattern) =>
        new RegExp(pattern).test(content)
      );

      if (!isHeroRelated) return;

      lines.forEach((line, index) => {
        // 查找description内容
        const descriptionPatterns = [
          // 页面数据和组件props中的description
          /pageData\.(?:hero|tool|page).*?description[^}]*}[^'"]*['"`]([^'"`]{10,})['"`]/,
          /heroDescription[:\s=]*['"`]([^'"`]{10,})['"`]/,
          // 翻译键中的description
          /t\(['"`]([^'"`]*description[^'"`]*)['"`]\)/,
          // 直接的description属性
          /description[:\s=]*['"`]([^'"`]{15,})['"`]/,
          // SEO meta description
          /<meta[^>]*name=["']description["'][^>]*content=["']([^'"`]{30,})["']/,
        ];

        descriptionPatterns.forEach((pattern, patternIndex) => {
          const match = line.match(pattern);
          if (match && match[1] && match[1].trim().length > 5) {
            const description = match[1].trim();
            const wordCount = description.split(/\s+/).length;

            // 检查是否包含"best"关键词
            const hasBest = bestPatterns.some((pattern) =>
              new RegExp(pattern).test(description)
            );

            const finding: HeroFinding = {
              file: filePath,
              component: match[0] || `pattern-${patternIndex}`,
              type: filePath.includes('hero')
                ? 'hero-component'
                : filePath.includes('page.tsx')
                  ? 'page-description'
                  : 'metadata',
              description,
              wordCount,
              hasBest,
              hasBestKeyword: hasBest,
              line: index + 1,
              context: line.trim(),
            };

            findings.push(finding);
          }
        });
      });
    } catch (error) {
      console.warn(`⚠️  无法读取文件: ${filePath}`);
    }
  };

  // 搜索所有相关文件
  for (const dir of directories) {
    if (require('fs').existsSync(dir)) {
      console.log(`📁 搜索目录: ${dir}`);
      const files = searchFiles(dir);
      files.forEach(checkFile);
    }
  }

  // 统计结果
  const total = findings.length;
  const withBest = findings.filter((f) => f.hasBest).length;
  const withoutBest = total - withBest;
  const averageWordCount =
    total > 0
      ? Math.round(findings.reduce((sum, f) => sum + f.wordCount, 0) / total)
      : 0;

  // 生成建议
  if (withoutBest > 0) {
    recommendations.push(
      `建议在${Math.min(withoutBest, 8)}个核心页面的description中融入"best"关键词`
    );

    // 找出候选页面（字数适中、内容重要的页面）
    const candidates = findings
      .filter(
        (f) =>
          !f.hasBest &&
          f.wordCount >= 15 &&
          f.wordCount <= 40 &&
          f.type !== 'metadata'
      )
      .slice(0, 5);

    if (candidates.length > 0) {
      recommendations.push('\n推荐的优化页面:');
      candidates.forEach((candidate, index) => {
        recommendations.push(
          `${index + 1}. ${candidate.file.split('/').pop()}: "${candidate.description}"`
        );
      });
    }

    recommendations.push('\n融入建议:');
    recommendations.push('- 使用"the best translation accuracy"等自然表述');
    recommendations.push('- 避免过度使用，选择核心工具页面');
    recommendations.push('- 保持description长度在20-35字之间');
  }

  // 生成报告
  console.log('📊 Hero Description关键词测试报告');
  console.log('='.repeat(60));
  console.log(`总计Hero Description: ${total}`);
  console.log(
    `包含"best"关键词: ${withBest} (${Math.round((withBest / total) * 100)}%)`
  );
  console.log(
    `不包含"best"关键词: ${withoutBest} (${Math.round((withoutBest / total) * 100)}%)`
  );
  console.log(`平均字数: ${averageWordCount}字`);

  if (withBest > 0) {
    console.log('\n✅ 已包含"best"关键词的页面:');
    findings
      .filter((f) => f.hasBest)
      .forEach((f) => {
        console.log(`  - ${f.file.split('/').pop()}: "${f.description}"`);
      });
  }

  if (recommendations.length > 0) {
    console.log('\n💡 优化建议:');
    recommendations.forEach((rec) => console.log(`  ${rec}`));
  }

  return {
    total,
    withBest,
    withoutBest,
    averageWordCount,
    findings,
    recommendations,
  };
};

// 运行测试
if (require.main === module) {
  testHeroDescriptionKeywords()
    .then((result) => {
      console.log('\n✅ 测试完成');
      process.exit(result.withoutBest > 10 ? 1 : 0); // 如果超过10个需要优化，返回警告状态
    })
    .catch((error) => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

export default testHeroDescriptionKeywords;
