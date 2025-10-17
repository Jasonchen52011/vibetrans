#!/usr/bin/env node

/**
 * 个人化表达检测测试用例
 * 检查所有页面中是否还包含 "I think" 或 "I love" 等个人化表达
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '.');

// 个人化表达模式列表
const PERSONAL_EXPRESSIONS = [
  /\bI think\b/gi,
  /\bI love\b/gi,
  /\bI believe\b/gi,
  /\bI feel\b/gi,
  /\bPersonally\b/gi,
  /\bIn my opinion\b/gi,
  /\bI find\b/gi,
  /\bI prefer\b/gi,
  /\bI like\b/gi,
  /\bI enjoy\b/gi,
  /\bMy favorite\b/gi,
  /\bFrom my perspective\b/gi,
];

/**
 * 检查单个文件中的个人化表达
 */
async function checkFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues = [];

    PERSONAL_EXPRESSIONS.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          pattern: pattern.source,
          count: matches.length,
          matches: matches.slice(0, 3), // 只显示前3个匹配
        });
      }
    });

    return issues;
  } catch (error) {
    return [];
  }
}

/**
 * 检查所有翻译工具页面
 */
async function checkAllTranslationPages() {
  const messagesDir = path.join(ROOT_DIR, 'messages', 'pages');
  const results = [];

  try {
    const pages = await fs.readdir(messagesDir, { withFileTypes: true });

    for (const page of pages) {
      if (page.isDirectory()) {
        const enJsonPath = path.join(messagesDir, page.name, 'en.json');
        const zhJsonPath = path.join(messagesDir, page.name, 'zh.json');

        // 检查英文版本
        const enIssues = await checkFile(enJsonPath);
        if (enIssues.length > 0) {
          results.push({
            page: page.name,
            file: 'en.json',
            issues: enIssues,
          });
        }

        // 检查中文版本
        const zhIssues = await checkFile(zhJsonPath);
        if (zhIssues.length > 0) {
          results.push({
            page: page.name,
            file: 'zh.json',
            issues: zhIssues,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading pages directory:', error);
  }

  return results;
}

/**
 * 检查主页面和配置文件
 */
async function checkMainFiles() {
  const results = [];

  const filesToCheck = [
    'messages/pages/home/en.json',
    'messages/pages/home/zh.json',
    'messages/marketing/en.json',
    'messages/en.json',
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(ROOT_DIR, file);
    const issues = await checkFile(filePath);

    if (issues.length > 0) {
      results.push({
        page: 'main',
        file: file,
        issues: issues,
      });
    }
  }

  return results;
}

/**
 * 生成测试报告
 */
function generateReport(pageResults, mainResults) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 个人化表达检测报告');
  console.log('='.repeat(80));

  const allResults = [...pageResults, ...mainResults];

  if (allResults.length === 0) {
    console.log('✅ 所有文件都通过了个人化表达检测！');
    console.log('✅ 未发现任何 "I think" 或 "I love" 等个人化表达');
    return true;
  }

  console.log(`❌ 发现 ${allResults.length} 个文件包含个人化表达：\n`);

  allResults.forEach((result) => {
    console.log(`📄 ${result.page}/${result.file}`);
    result.issues.forEach((issue) => {
      console.log(`   🔸 模式: "${issue.pattern}" (${issue.count} 处)`);
      console.log(`   🔸 示例: ${issue.matches.join(', ')}`);
    });
    console.log('');
  });

  console.log('\n📊 统计摘要:');
  const totalIssues = allResults.reduce(
    (sum, r) => sum + r.issues.reduce((s, i) => s + i.count, 0),
    0
  );
  console.log(`   - 总共发现 ${totalIssues} 处个人化表达`);
  console.log(`   - 涉及 ${allResults.length} 个文件`);

  return false;
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始检测个人化表达...');

  // 检查所有翻译工具页面
  const pageResults = await checkAllTranslationPages();

  // 检查主要文件
  const mainResults = await checkMainFiles();

  // 生成报告
  const passed = generateReport(pageResults, mainResults);

  if (!passed) {
    console.log('\n🚨 发现问题！需要修复以下文件中的个人化表达。');
    process.exit(1);
  } else {
    console.log('\n✅ 测试通过！所有内容都不包含个人化表达。');
    process.exit(0);
  }
}

// 运行测试
main();
