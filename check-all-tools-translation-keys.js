#!/usr/bin/env node

/**
 * 翻译键耦合检查脚本
 *
 * 基于cuneiform-translator修复经验，系统性检查所有工具页面的翻译键耦合问题
 * 检查：
 * 1. 页面代码中使用的翻译键
 * 2. 对应JSON文件中存在的翻译键
 * 3. 键名不匹配问题（大小写、命名风格等）
 * 4. 提供修复建议
 */

import path from 'path';
import fs from 'fs/promises';

// 工具页面目录
const PAGES_DIR = path.join(
  process.cwd(),
  'src/app/[locale]/(marketing)/(pages)'
);
const MESSAGES_DIR = path.join(process.cwd(), 'messages/pages');

// 获取所有工具页面
async function getAllToolPages() {
  try {
    const entries = await fs.readdir(PAGES_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter(
        (name) =>
          !name.includes('-') ||
          name === 'albanian-to-english' ||
          name === 'chinese-to-english-translator' ||
          name.includes('-translators') ||
          name.includes('-translator') ||
          name.includes('-generator') ||
          name === 'creole-to-english-translator' ||
          name === 'samoan-to-english-translator'
      )
      .sort();
  } catch (error) {
    console.error('❌ 读取页面目录失败:', error.message);
    return [];
  }
}

// 检查单个页面的翻译键耦合
async function checkPageTranslationKeys(toolName) {
  const result = {
    toolName,
    pageFile: null,
    jsonFile: null,
    pageExists: false,
    jsonExists: false,
    pageKeys: new Set(),
    jsonKeys: new Set(),
    issues: [],
    fixSuggestions: [],
  };

  try {
    // 检查页面文件
    const pagePath = path.join(PAGES_DIR, toolName, 'page.tsx');
    try {
      const pageContent = await fs.readFile(pagePath, 'utf-8');
      result.pageExists = true;
      result.pageFile = pagePath;

      // 提取页面中使用的翻译键
      const tCallMatches = pageContent.match(/t\(['"`]([^'"`]+)['"`]\)/g) || [];
      const tAnyMatches =
        pageContent.match(/\(t as any\)\(['"`]([^'"`]+)['"`]\)/g) || [];

      [...tCallMatches, ...tAnyMatches].forEach((match) => {
        const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (keyMatch) {
          result.pageKeys.add(keyMatch[1]);
        }
      });

      // 检查命名空间
      const namespaceMatch = pageContent.match(
        /namespace:\s*['"`]([^'"`]+)['"`]/
      );
      if (namespaceMatch) {
        result.namespace = namespaceMatch[1];
      }
    } catch (error) {
      result.issues.push({
        type: 'missing_page',
        message: `页面文件不存在: ${pagePath}`,
      });
    }

    // 检查JSON文件
    const jsonPath = path.join(MESSAGES_DIR, toolName, 'en.json');
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      result.jsonExists = true;
      result.jsonFile = jsonPath;

      const jsonData = JSON.parse(jsonContent);

      // 递归提取所有键
      function extractKeys(obj, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          result.jsonKeys.add(fullKey);

          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            extractKeys(value, fullKey);
          }
        }
      }

      extractKeys(jsonData);
    } catch (error) {
      result.issues.push({
        type: 'missing_json',
        message: `JSON文件不存在: ${jsonPath}`,
      });
    }

    // 分析键不匹配问题
    if (result.pageExists && result.jsonExists) {
      // 检查页面中使用的键是否在JSON中存在
      for (const pageKey of result.pageKeys) {
        if (!result.jsonKeys.has(pageKey)) {
          // 尝试找到相似的键
          const similarKeys = Array.from(result.jsonKeys).filter(
            (jsonKey) =>
              jsonKey.toLowerCase().includes(pageKey.toLowerCase()) ||
              pageKey.toLowerCase().includes(jsonKey.toLowerCase())
          );

          result.issues.push({
            type: 'missing_key',
            severity: 'high',
            key: pageKey,
            message: `页面使用的翻译键在JSON中不存在: ${pageKey}`,
            similarKeys: similarKeys.length > 0 ? similarKeys : null,
          });

          // 如果找到相似键，提供修复建议
          if (similarKeys.length > 0) {
            const bestMatch = similarKeys[0];
            result.fixSuggestions.push({
              type: 'key_mismatch',
              file: result.pageFile,
              key: pageKey,
              suggestedKey: bestMatch,
              action: `将 "${pageKey}" 修改为 "${bestMatch}"`,
            });
          }
        }
      }

      // 检查常见的命名问题
      for (const pageKey of result.pageKeys) {
        // 检查大小写问题 (funfacts vs funFacts)
        if (pageKey.includes('funfacts') && !result.jsonKeys.has(pageKey)) {
          const funFactsKey = pageKey.replace('funfacts', 'funFacts');
          if (result.jsonKeys.has(funFactsKey)) {
            result.fixSuggestions.push({
              type: 'case_mismatch',
              file: result.pageFile,
              key: pageKey,
              suggestedKey: funFactsKey,
              action: `将 "${pageKey}" 修改为 "${funFactsKey}" (大小写问题)`,
            });
          }
        }

        // 检查连字符 vs 下划线问题
        if (pageKey.includes('_') && !result.jsonKeys.has(pageKey)) {
          const hyphenKey = pageKey.replace(/_/g, '-');
          if (result.jsonKeys.has(hyphenKey)) {
            result.fixSuggestions.push({
              type: 'separator_mismatch',
              file: result.pageFile,
              key: pageKey,
              suggestedKey: hyphenKey,
              action: `将 "${pageKey}" 修改为 "${hyphenKey}" (下划线转连字符)`,
            });
          }
        }

        if (pageKey.includes('-') && !result.jsonKeys.has(pageKey)) {
          const underscoreKey = pageKey.replace(/-/g, '_');
          if (result.jsonKeys.has(underscoreKey)) {
            result.fixSuggestions.push({
              type: 'separator_mismatch',
              file: result.pageFile,
              key: pageKey,
              suggestedKey: underscoreKey,
              action: `将 "${pageKey}" 修改为 "${underscoreKey}" (连字符转下划线)`,
            });
          }
        }
      }
    }
  } catch (error) {
    result.issues.push({
      type: 'error',
      message: `检查页面 ${toolName} 时出错: ${error.message}`,
    });
  }

  return result;
}

// 主函数
async function main() {
  console.log('🔍 VibeTrans 工具页面翻译键耦合检查');
  console.log('='.repeat(60));
  console.log('');

  const toolPages = await getAllToolPages();
  console.log(`📋 发现 ${toolPages.length} 个工具页面`);
  console.log('');

  const results = [];
  let totalIssues = 0;
  let totalFixSuggestions = 0;

  // 检查每个页面
  for (const toolName of toolPages) {
    console.log(`🔍 检查: ${toolName}`);
    const result = await checkPageTranslationKeys(toolName);
    results.push(result);

    const highSeverityIssues = result.issues.filter(
      (i) => i.severity === 'high'
    ).length;
    totalIssues += result.issues.length;
    totalFixSuggestions += result.fixSuggestions.length;

    if (result.issues.length > 0) {
      console.log(
        `  ⚠️  发现 ${result.issues.length} 个问题 (${highSeverityIssues} 个严重)`
      );
    } else {
      console.log('  ✅ 无问题');
    }
  }

  console.log('');
  console.log('📊 检查结果汇总:');
  console.log(`- 总页面数: ${toolPages.length}`);
  console.log(`- 总问题数: ${totalIssues}`);
  console.log(`- 可修复问题: ${totalFixSuggestions}`);
  console.log('');

  // 显示有问题页面详情
  const problematicPages = results.filter((r) => r.issues.length > 0);
  if (problematicPages.length > 0) {
    console.log('🔧 需要修复的页面:');
    console.log('');

    for (const result of problematicPages) {
      console.log(`\n📄 ${result.toolName}`);
      console.log(`   页面: ${result.pageExists ? '✅' : '❌'}`);
      console.log(`   JSON:  ${result.jsonExists ? '✅' : '❌'}`);

      if (result.fixSuggestions.length > 0) {
        console.log('   💡 修复建议:');
        result.fixSuggestions.slice(0, 3).forEach((suggestion, index) => {
          console.log(`      ${index + 1}. ${suggestion.action}`);
        });
        if (result.fixSuggestions.length > 3) {
          console.log(
            `      ... 还有 ${result.fixSuggestions.length - 3} 个建议`
          );
        }
      }

      const highSeverityIssues = result.issues.filter(
        (i) => i.severity === 'high'
      );
      if (highSeverityIssues.length > 0) {
        console.log('   🚨 严重问题:');
        highSeverityIssues.slice(0, 2).forEach((issue, index) => {
          console.log(`      ${index + 1}. ${issue.message}`);
        });
      }
    }
  }

  console.log('');
  console.log('🎯 下一步行动建议:');
  console.log('');

  if (totalFixSuggestions > 0) {
    console.log('1. 🔧 优先修复翻译键不匹配问题');
    console.log('2. 🔄 检查命名风格一致性');
    console.log('3. ✅ 验证修复效果');
    console.log('');
    console.log('是否自动应用修复建议? (y/N)');
  } else {
    console.log('✅ 所有工具页面翻译键耦合检查完成!');
    console.log('🎉 未发现需要修复的问题');
  }
}

// 运行检查
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkPageTranslationKeys, getAllToolPages };
