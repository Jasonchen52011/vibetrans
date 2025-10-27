#!/usr/bin/env tsx

/**
 * 批量优化Hero Description，自然融入"best"关键词
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface HeroOptimization {
  file: string;
  page: string;
  originalDescription: string;
  optimizedDescription: string;
  hasBest: boolean;
  priority: 'high' | 'medium' | 'low';
}

// 优先级页面列表
const PRIORITY_PAGES = [
  'baybayin-translator',
  'aramaic-translator',
  'ancient-greek-translator',
  'cuneiform-translator',
  'high-valyrian-translator',
  'esperanto-translator',
  'cantonese-translator',
  'samoan-to-english-translator',
];

// 优化模板
const OPTIMIZATION_TEMPLATES = {
  translator: [
    'Discover the best {language} translator for {feature} with VibeTrans. {original}',
    'Experience the best {language} translation accuracy with VibeTrans. {original}',
    'Get the best results with our {language} translator powered by VibeTrans. {original}',
  ],
  generator: [
    'Create the best {type} content with VibeTrans. {original}',
    'Generate the best {type} texts using our advanced AI. {original}',
  ],
};

// 获取页面类型
const getPageType = (page: string): string => {
  if (page.includes('translator')) return 'translator';
  if (page.includes('generator')) return 'generator';
  return 'other';
};

// 获取语言名称
const getLanguageName = (page: string): string => {
  const nameMap: Record<string, string> = {
    'baybayin-translator': 'Baybayin',
    'aramaic-translator': 'Aramaic',
    'ancient-greek-translator': 'Ancient Greek',
    'cuneiform-translator': 'Cuneiform',
    'high-valyrian-translator': 'High Valyrian',
    'esperanto-translator': 'Esperanto',
    'cantonese-translator': 'Cantonese',
    'samoan-to-english-translator': 'Samoan to English',
    'al-bhed-translator': 'Al Bhed',
    'baby-translator': 'Baby',
    'dog-translator': 'Dog',
    'gen-z-translator': 'Gen Z',
    'minion-translator': 'Minion',
    'pig-latin-translator': 'Pig Latin',
    'gibberish-translator': 'Gibberish',
  };
  return nameMap[page] || page;
};

// 生成优化描述
const generateOptimizedDescription = (
  original: string,
  page: string,
  pageType: string
): string => {
  // 如果已经包含"best"，返回原描述
  if (/\bbest\b/i.test(original)) {
    return original;
  }

  const languageName = getLanguageName(page);
  const templates =
    OPTIMIZATION_TEMPLATES[pageType as keyof typeof OPTIMIZATION_TEMPLATES] ||
    OPTIMIZATION_TEMPLATES.translator;

  // 选择合适的模板
  const template = templates[Math.floor(Math.random() * templates.length)];

  // 替换模板变量
  let optimized = template
    .replace('{language}', languageName)
    .replace('{feature}', 'accurate and context-aware translations')
    .replace('{type}', pageType === 'generator' ? 'creative' : 'translation')
    .replace('{original}', original);

  // 确保长度适中
  if (optimized.length > 200) {
    optimized = optimized.substring(0, 197) + '...';
  }

  return optimized;
};

// 获取优先级
const getPriority = (page: string): 'high' | 'medium' | 'low' => {
  if (PRIORITY_PAGES.includes(page)) return 'high';
  if (page.includes('translator')) return 'medium';
  return 'low';
};

// 优化单个文件
const optimizeFile = (filePath: string): HeroOptimization | null => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // 提取页面信息
    const relativePath = filePath.replace('messages/pages/', '');
    const pageName = relativePath.split('/')[0];

    // 查找hero description
    let heroDescription = null;
    let heroPath = '';

    // 尝试不同的路径
    if (data.hero && data.hero.description) {
      heroDescription = data.hero.description;
      heroPath = 'hero.description';
    } else if (
      data.HomePage &&
      data.HomePage.hero &&
      data.HomePage.hero.description
    ) {
      heroDescription = data.HomePage.hero.description;
      heroPath = 'HomePage.hero.description';
    }

    if (!heroDescription) {
      return null;
    }

    const pageType = getPageType(pageName);
    const hasBest = /\bbest\b/i.test(heroDescription);

    // 如果已经有best或不是优先级页面，跳过
    if (hasBest && getPriority(pageName) !== 'high') {
      return {
        file: filePath,
        page: pageName,
        originalDescription: heroDescription,
        optimizedDescription: heroDescription,
        hasBest: true,
        priority: getPriority(pageName),
      };
    }

    // 生成优化描述
    const optimizedDescription = generateOptimizedDescription(
      heroDescription,
      pageName,
      pageType
    );

    // 更新文件内容
    const heroPathParts = heroPath.split('.');
    let current = data;
    for (let i = 0; i < heroPathParts.length - 1; i++) {
      current = current[heroPathParts[i]];
    }
    current[heroPathParts[heroPathParts.length - 1]] = optimizedDescription;

    // 写回文件
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');

    return {
      file: filePath,
      page: pageName,
      originalDescription: heroDescription,
      optimizedDescription,
      hasBest: /\bbest\b/i.test(optimizedDescription),
      priority: getPriority(pageName),
    };
  } catch (error) {
    console.warn(`⚠️  无法处理文件: ${filePath} - ${error.message}`);
    return null;
  }
};

// 主函数
const main = async () => {
  console.log('🚀 开始批量优化Hero Description...\n');

  const optimizations: HeroOptimization[] = [];
  const messagesDir = 'messages/pages';

  // 搜索所有JSON文件
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

  // 查找包含hero的文件
  const allJsonFiles = searchJsonFiles(messagesDir);
  const heroFiles = allJsonFiles.filter((file) => {
    try {
      const content = readFileSync(file, 'utf-8');
      return content.includes('"hero"');
    } catch {
      return false;
    }
  });

  console.log(`📁 找到 ${heroFiles.length} 个包含hero的文件`);

  // 优化每个文件
  for (const file of heroFiles) {
    const optimization = optimizeFile(file);
    if (optimization) {
      optimizations.push(optimization);

      if (
        optimization.originalDescription !== optimization.optimizedDescription
      ) {
        console.log(`✅ 已优化: ${optimization.page}`);
        console.log(
          `   原文: ${optimization.originalDescription.substring(0, 60)}...`
        );
        console.log(
          `   优化: ${optimization.optimizedDescription.substring(0, 60)}...`
        );
      } else {
        console.log(`⚪  跳过: ${optimization.page} (已有best关键词)`);
      }
    }
  }

  // 统计结果
  const optimized = optimizations.filter(
    (o) => o.originalDescription !== o.optimizedDescription
  );
  const withBest = optimizations.filter((o) => o.hasBest);
  const highPriority = optimizations.filter((o) => o.priority === 'high');

  console.log(`\n📊 优化结果统计:`);
  console.log(`- 总计处理: ${optimizations.length}`);
  console.log(`- 成功优化: ${optimized.length}`);
  console.log(`- 包含best: ${withBest.length}`);
  console.log(`- 高优先级: ${highPriority.length}`);

  console.log(`\n🎯 高优先级页面状态:`);
  highPriority.forEach((opt) => {
    const status = opt.hasBest ? '✅' : '🔄';
    console.log(`  ${status} ${opt.page}`);
  });

  console.log('\n✅ 批量优化完成!');
};

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 优化失败:', error);
    process.exit(1);
  });
}

export default main;
