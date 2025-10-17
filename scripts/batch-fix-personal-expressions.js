#!/usr/bin/env node

/**
 * 🚫 批量移除个人化表达修复脚本
 *
 * 批量重写所有包含个人化表达的页面内容
 *
 * 使用方法:
 * node scripts/batch-fix-personal-expressions.js
 * 或指定特定页面:
 * node scripts/batch-fix-personal-expressions.js "dog-translator,bad-translator"
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 检测到的包含个人化表达的页面列表
const PAGES_WITH_PERSONAL_EXPRESSIONS = [
  'dog-translator',
  'bad-translator',
  'gibberish-translator',
  'esperanto-translator',
  'ancient-greek-translator',
  'chinese-to-english-translator',
  'verbose-generator',
  'pig-latin-translator',
  'minion-translator',
  'middle-english-translator',
  'al-bhed-translator',
  'alien-text-generator',
  'cantonese-translator',
  'home',
  'creole-to-english',
  'baby-translator',
  'gen-z-translator',
  'dumb-it-down',
  'gen-alpha-translator',
];

/**
 * 检查文件是否存在个人化表达
 */
async function checkPersonalExpressions(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const personalPatterns = [
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

    let totalMatches = 0;
    const matches = [];

    personalPatterns.forEach((pattern) => {
      const patternMatches = content.match(pattern);
      if (patternMatches) {
        totalMatches += patternMatches.length;
        matches.push({
          pattern: pattern.source,
          count: patternMatches.length,
        });
      }
    });

    return { hasPersonalExpressions: totalMatches > 0, totalMatches, matches };
  } catch (error) {
    logWarning(`无法读取文件 ${filePath}: ${error.message}`);
    return { hasPersonalExpressions: false, totalMatches: 0, matches: [] };
  }
}

/**
 * 重新生成指定页面的内容
 */
async function regeneratePageContent(pageName) {
  try {
    logInfo(`🔄 开始重新生成 ${pageName} 的内容...`);

    // 将 kebab-case 转换为工具名称格式
    const toolName = pageName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 重新生成所有sections
    const command = `node scripts/regenerate-section-content.js "${toolName}" "all"`;

    logInfo(`执行命令: ${command}`);

    try {
      execSync(command, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        timeout: 300000, // 5分钟超时
      });
      logSuccess(`✅ ${pageName} 内容重新生成完成`);
      return { success: true, error: null };
    } catch (error) {
      logError(`❌ ${pageName} 重新生成失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  } catch (error) {
    logError(`❌ 处理 ${pageName} 时出错: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 验证修复后的内容
 */
async function verifyFix(pageName) {
  const filePath = path.join(
    ROOT_DIR,
    'messages',
    'pages',
    pageName,
    'en.json'
  );
  const check = await checkPersonalExpressions(filePath);

  if (check.hasPersonalExpressions) {
    logError(`❌ ${pageName} 仍有个人化表达 (${check.totalMatches} 处)`);
    check.matches.forEach((match) => {
      logError(`  - ${match.pattern}: ${match.count} 处`);
    });
    return false;
  } else {
    logSuccess(`✅ ${pageName} 个人化表达已清除`);
    return true;
  }
}

/**
 * 主函数
 */
async function main() {
  const targetPages = process.argv[2];

  let pagesToFix = PAGES_WITH_PERSONAL_EXPRESSIONS;

  // 如果指定了特定页面，只处理这些页面
  if (targetPages) {
    pagesToFix = targetPages.split(',').map((p) => p.trim());
    logInfo(`🎯 指定页面: ${pagesToFix.join(', ')}`);
  } else {
    logInfo(`📋 处理所有检测到的页面 (${pagesToFix.length} 个)`);
  }

  log('\n🚫 批量移除个人化表达修复脚本', 'bright');
  log('='.repeat(60), 'cyan');

  const results = {
    total: pagesToFix.length,
    success: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  for (const pageName of pagesToFix) {
    log(`\n📄 处理页面: ${pageName}`, 'bright');
    log('-'.repeat(40), 'cyan');

    // 检查文件是否存在
    const filePath = path.join(
      ROOT_DIR,
      'messages',
      'pages',
      pageName,
      'en.json'
    );
    try {
      await fs.access(filePath);
    } catch (error) {
      logWarning(`⚠️  跳过 ${pageName}: 文件不存在`);
      results.skipped++;
      results.details.push({
        page: pageName,
        status: 'skipped',
        reason: 'File not found',
      });
      continue;
    }

    // 检查是否确实有个人化表达
    const check = await checkPersonalExpressions(filePath);
    if (!check.hasPersonalExpressions) {
      logSuccess(`✅ ${pageName} 无需修复（无个人化表达）`);
      results.skipped++;
      results.details.push({
        page: pageName,
        status: 'skipped',
        reason: 'No personal expressions',
      });
      continue;
    }

    logWarning(`🔍 发现 ${check.totalMatches} 处个人化表达需要修复`);
    check.matches.forEach((match) => {
      logWarning(`  - ${match.pattern}: ${match.count} 处`);
    });

    // 重新生成内容
    const regenerateResult = await regeneratePageContent(pageName);

    if (regenerateResult.success) {
      // 验证修复结果
      const isFixed = await verifyFix(pageName);
      if (isFixed) {
        results.success++;
        results.details.push({ page: pageName, status: 'success' });
      } else {
        results.failed++;
        results.details.push({
          page: pageName,
          status: 'failed',
          reason: 'Still contains personal expressions',
        });
      }
    } else {
      results.failed++;
      results.details.push({
        page: pageName,
        status: 'failed',
        reason: regenerateResult.error,
      });
    }

    // 添加延迟避免API限制
    if (pagesToFix.indexOf(pageName) < pagesToFix.length - 1) {
      logInfo('⏳ 等待 3 秒后继续...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // 输出总结报告
  log('\n' + '='.repeat(60), 'green');
  log('📊 修复完成总结', 'green');
  log('='.repeat(60), 'green');

  logInfo(`总页面数: ${results.total}`);
  logSuccess(`成功修复: ${results.success}`);
  logError(`修复失败: ${results.failed}`);
  logWarning(`跳过页面: ${results.skipped}`);

  if (results.failed > 0) {
    log('\n❌ 失败的页面:', 'red');
    results.details
      .filter((detail) => detail.status === 'failed')
      .forEach((detail) => {
        logError(`  - ${detail.page}: ${detail.reason}`);
      });
  }

  if (results.success > 0) {
    log('\n✅ 成功修复的页面:', 'green');
    results.details
      .filter((detail) => detail.status === 'success')
      .forEach((detail) => {
        logSuccess(`  - ${detail.page}`);
      });
  }

  log('\n💡 后续建议:', 'blue');
  logInfo('1. 运行 pnpm dev 检查页面效果');
  logInfo('2. 如果有失败页面，可以单独重新运行:');
  logInfo('   node scripts/batch-fix-personal-expressions.js "page-name"');
  logInfo('3. 重新生成相关图片（如需要）');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    logSuccess('\n🎉 所有页面修复完成！');
  }
}

// 运行主函数
main().catch((error) => {
  logError(`\n脚本执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});
