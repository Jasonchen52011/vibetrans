#!/usr/bin/env tsx

/**
 * CTA按钮logo一致性测试用例
 * 检查所有CTA按钮是否统一使用指向右的logo，而不是通过右对齐实现
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { extname, join } from 'path';

interface CTAFinding {
  file: string;
  line: number;
  type: 'cta-component' | 'cta-button' | 'call-to-action';
  content: string;
  hasRightArrow: boolean;
  hasRightAlign: boolean;
  logoType?: 'arrow-right' | 'chevron-right' | 'arrow-right-s-line' | 'other';
}

const testCTAButtonLogoConsistency = async (): Promise<{
  total: number;
  consistent: number;
  inconsistent: number;
  findings: CTAFinding[];
  issues: string[];
}> => {
  console.log('🔍 开始CTA按钮logo一致性测试...\n');

  const findings: CTAFinding[] = [];
  const issues: string[] = [];

  // 需要检查的目录
  const directories = ['src/components', 'src/app', 'src/lib'];

  // CTA相关的关键词
  const ctaKeywords = [
    'cta',
    'CTA',
    'CallToAction',
    'call-to-action',
    'Button.*href',
    'Link.*href',
    'Button.*className.*primary',
    'getStarted',
    'get-started',
    'StartFreeTrial',
    'start-free-trial',
    'LearnMore',
    'learn-more',
    'SeeMore',
    'see-more',
    'ExploreMore',
    'explore-more',
    'DiscoverMore',
    'discover-more',
    'onClick={handleTranslate}',
    'translateButton',
    'pageData.tool',
    'Tool.tsx',
  ];

  // 指向右的图标关键词
  const rightArrowIcons = [
    'ArrowRight',
    'arrow-right',
    'ChevronRight',
    'chevron-right',
    'ArrowRightSLine',
    'arrow-right-s-line',
    'RiArrowRightSLine',
    'RiArrowRightLine',
    'HiArrowRight',
    'FaArrowRight',
    'BiArrowRight',
    'BsArrowRight',
    'MdArrowRight',
    'IoArrowForward',
    'IoArrowForwardOutline',
  ];

  // 右对齐的CSS属性
  const rightAlignProperties = [
    'justify-end',
    'justify-right',
    'text-right',
    'items-end',
    'justify-content:s*flex-end',
    'text-align:s*right',
    'align-items:s*flex-end',
    'justify-self:s*end',
  ];

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
        const stat = statSync(fullPath);

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

      lines.forEach((line, index) => {
        // 检查是否包含CTA相关代码
        const isCTAComponent = ctaKeywords.some((keyword) =>
          new RegExp(keyword, 'i').test(line)
        );

        if (isCTAComponent) {
          const hasRightArrow = rightArrowIcons.some((icon) =>
            line.includes(icon)
          );

          const hasRightAlign = rightAlignProperties.some((prop) =>
            new RegExp(prop, 'i').test(line)
          );

          // 确定图标类型
          let logoType: CTAFinding['logoType'] = undefined;
          if (hasRightArrow) {
            if (line.includes('ArrowRight') || line.includes('arrow-right')) {
              logoType = 'arrow-right';
            } else if (
              line.includes('ChevronRight') ||
              line.includes('chevron-right')
            ) {
              logoType = 'chevron-right';
            } else if (
              line.includes('ArrowRightSLine') ||
              line.includes('arrow-right-s-line')
            ) {
              logoType = 'arrow-right-s-line';
            } else {
              logoType = 'other';
            }
          }

          const finding: CTAFinding = {
            file: filePath,
            line: index + 1,
            type:
              line.includes('cta') || line.includes('CTA')
                ? 'cta-component'
                : line.includes('Button')
                  ? 'cta-button'
                  : 'call-to-action',
            content: line.trim(),
            hasRightArrow,
            hasRightAlign,
            logoType,
          };

          findings.push(finding);

          // 检查不一致性
          if (hasRightAlign && !hasRightArrow) {
            issues.push(
              `🚨 ${filePath}:${index + 1} - 使用右对齐但缺少指向右的logo: ${line.trim()}`
            );
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️  无法读取文件: ${filePath}`);
    }
  };

  // 搜索所有相关文件
  for (const dir of directories) {
    console.log(`📁 搜索目录: ${dir}`);
    const files = searchFiles(dir);

    for (const file of files) {
      checkFile(file);
    }
  }

  // 统计结果
  const total = findings.length;
  const consistent = findings.filter(
    (f) => f.hasRightArrow && !f.hasRightAlign
  ).length;
  const inconsistent = findings.filter(
    (f) => f.hasRightAlign && !f.hasRightArrow
  ).length;

  // 生成报告
  console.log('\n📊 CTA按钮logo一致性测试报告');
  console.log('='.repeat(50));
  console.log(`总计CTA相关代码: ${total}`);
  console.log(
    `使用指向右logo: ${findings.filter((f) => f.hasRightArrow).length}`
  );
  console.log(`使用右对齐: ${findings.filter((f) => f.hasRightAlign).length}`);
  console.log(`一致实现: ${consistent}`);
  console.log(`不一致实现: ${inconsistent}`);

  if (issues.length > 0) {
    console.log('\n🚨 发现的问题:');
    issues.forEach((issue) => console.log(issue));
  }

  // 详细分析
  console.log('\n📋 详细分析:');
  const logoTypes = findings
    .filter((f) => f.logoType)
    .reduce(
      (acc, f) => {
        acc[f.logoType!] = (acc[f.logoType!] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  Object.entries(logoTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  return {
    total,
    consistent,
    inconsistent,
    findings,
    issues,
  };
};

// 运行测试
if (require.main === module) {
  testCTAButtonLogoConsistency()
    .then((result) => {
      console.log('\n✅ 测试完成');
      process.exit(result.inconsistent > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

export default testCTAButtonLogoConsistency;
