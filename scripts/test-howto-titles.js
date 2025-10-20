#!/usr/bin/env node

/**
 * 测试用例：检查所有翻译工具页面的"How to"标题格式
 *
 * 新规则：
 * - 语言翻译类：How to translate xxx to English
 * - 非语言翻译类：How to translate English to xxx
 */

import path from 'path';
import fs from 'fs/promises';

const ROOT_DIR = path.resolve(process.cwd(), '.');
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages/pages');

// 语言翻译类工具（目标语言到英语）
const LANGUAGE_TRANSLATORS = [
  'albanian-to-english',
  'chinese-to-english-translator',
  'creole-to-english-translator',
  'samoan-to-english-translator',
  // 实际存在的其他语言翻译工具
  // 注：根据实际文件存在的情况调整
];

// 非语言翻译类工具（英语到目标语言/格式）
const NON_LANGUAGE_TRANSLATORS = [
  'middle-english-translator', // English to Middle English
  'al-bhed-translator',
  'alien-text-generator',
  'ancient-greek-translator',
  'aramaic-translator',
  'baby-translator',
  'bad-translator',
  'baybayin-translator',
  'cantonese-translator',
  'cuneiform-translator',
  'dog-translator',
  'dumb-it-down-ai',
  'esperanto-translator',
  'gaster-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
  'high-valyrian-translator',
  'ivr-translator',
  'minion-translator',
  'pig-latin-translator',
  'verbose-generator',
];

// 排除的页面（不是翻译工具）
const EXCLUDED_PAGES = ['about', 'auth', 'blog', 'docs', 'home', 'pricing'];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

async function getAllTranslatorPages() {
  try {
    const dirs = await fs.readdir(MESSAGES_DIR);
    return dirs.filter((dir) => {
      const dirPath = path.join(MESSAGES_DIR, dir);
      return fs.stat(dirPath).then((stat) => stat.isDirectory());
    });
  } catch (error) {
    log(`无法读取目录 ${MESSAGES_DIR}: ${error.message}`, 'error');
    return [];
  }
}

async function getHowToTitle(toolSlug) {
  const enJsonPath = path.join(MESSAGES_DIR, toolSlug, 'en.json');
  const data = await readJsonFile(enJsonPath);

  if (!data) {
    return null;
  }

  // 找到页面数据（第一个键通常是页面名）
  const pageKey = Object.keys(data)[0];
  const pageData = data[pageKey];

  if (pageData && pageData.howto && pageData.howto.title) {
    return pageData.howto.title;
  }

  return null;
}

function determineExpectedTitle(toolSlug) {
  // 特殊处理一些已知的工具
  const specialCases = {
    'middle-english-translator': 'How to Translate English to Middle English',
    'al-bhed-translator': 'How to Translate English to Al Bhed',
    'creole-to-english': 'How to Translate Creole to English',
    'dumb-it-down-ai': 'How to Simplify Text with Dumb It Down AI',
    'pig-latin-translator': 'How to Translate English to Pig Latin',
  };

  if (specialCases[toolSlug]) {
    return specialCases[toolSlug];
  }

  // 语言翻译类：xxx to English
  if (LANGUAGE_TRANSLATORS.includes(toolSlug)) {
    let languageName = toolSlug
      .replace('-to-english', '')
      .replace('-to-english-translator', '')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 简化一些语言名称
    const languageMap = {
      'Chinese Translator': 'Chinese',
      'Creole Translator': 'Creole',
      'Samoan Translator': 'Samoan',
    };

    languageName = languageMap[languageName] || languageName;
    return `How to Translate ${languageName} to English`;
  }

  // 非语言翻译类：English to xxx
  if (NON_LANGUAGE_TRANSLATORS.includes(toolSlug)) {
    const targetName = toolSlug
      .replace('-translator', '')
      .replace('-generator', '')
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // 处理一些特殊情况
    if (targetName === 'High Valyrian') {
      return 'How to Translate English to High Valyrian';
    }
    if (targetName === 'Cuneiform') {
      return 'How to Translate English to Cuneiform';
    }
    if (targetName === 'Baybayin') {
      return 'How to Translate English to Baybayin';
    }
    if (targetName === 'Ancient Greek') {
      return 'How to Translate English to Ancient Greek';
    }
    if (targetName === 'Gen Alpha') {
      return 'How to Translate English to Gen Alpha';
    }
    if (targetName === 'Gen Z') {
      return 'How to Translate English to Gen Z';
    }
    if (targetName === 'Gibberish') {
      return 'How to Translate English to Gibberish';
    }
    if (targetName === 'Esperanto') {
      return 'How to Translate English to Esperanto';
    }
    if (targetName === 'Aramaic') {
      return 'How to Translate English to Aramaic';
    }
    if (targetName === 'Baby') {
      return 'How to Translate English to Baby';
    }
    if (targetName === 'Bad') {
      return 'How to Translate English to Bad';
    }
    if (targetName === 'Dog') {
      return 'How to Translate English to Dog';
    }
    if (targetName === 'Minion') {
      return 'How to Translate English to Minion';
    }
    if (targetName === 'Verbose') {
      return 'How to Translate English to Verbose';
    }
    if (targetName === 'Ivr') {
      return 'How to Translate English to IVR';
    }
    if (targetName === 'Cantonese') {
      return 'How to Translate English to Cantonese';
    }
    if (targetName === 'Gaster') {
      return 'How to Translate English to Gaster';
    }
    if (targetName === 'Alien Text') {
      return 'How to Translate English to Alien Text';
    }

    return `How to Translate English to ${targetName}`;
  }

  return null;
}

async function main() {
  log('🔍 开始检查所有翻译工具页面的"How to"标题...\n');

  // 获取所有翻译工具页面
  const allTools = await getAllTranslatorPages();
  log(`📁 找到 ${allTools.length} 个页面`);

  // 过滤掉排除的页面
  const translatorTools = allTools.filter(
    (tool) => !EXCLUDED_PAGES.includes(tool)
  );
  log(`🔧 翻译工具页面: ${translatorTools.length} 个`);

  const results = {
    correct: [],
    incorrect: [],
    missing: [],
    unknown: [],
  };

  for (const toolSlug of translatorTools) {
    const currentTitle = await getHowToTitle(toolSlug);
    const expectedTitle = determineExpectedTitle(toolSlug);

    console.log(`\n🔍 检查: ${toolSlug}`);
    console.log(`   当前标题: ${currentTitle || '❌ 未找到'}`);
    console.log(`   期望标题: ${expectedTitle || '❓ 无法确定'}`);

    if (!currentTitle) {
      results.missing.push({ toolSlug, expectedTitle });
      log(`   状态: 缺失howto标题`, 'warning');
    } else if (!expectedTitle) {
      results.unknown.push({ toolSlug, currentTitle });
      log(`   状态: 无法确定期望标题`, 'warning');
    } else if (currentTitle === expectedTitle) {
      results.correct.push({ toolSlug, title: currentTitle });
      log(`   状态: ✅ 正确`, 'success');
    } else {
      results.incorrect.push({ toolSlug, currentTitle, expectedTitle });
      log(`   状态: ❌ 需要修改`, 'error');
    }
  }

  // 输出总结
  console.log('\n' + '='.repeat(60));
  log('📊 检查结果总结:');
  console.log('='.repeat(60));

  log(`✅ 正确的标题: ${results.correct.length} 个`, 'success');
  log(`❌ 需要修改: ${results.incorrect.length} 个`, 'error');
  log(`⚠️  缺失标题: ${results.missing.length} 个`, 'warning');
  log(`❓ 未知类型: ${results.unknown.length} 个`, 'warning');

  if (results.incorrect.length > 0) {
    console.log('\n❌ 需要修改的标题:');
    results.incorrect.forEach((item) => {
      console.log(`   ${item.toolSlug}:`);
      console.log(`     当前: "${item.currentTitle}"`);
      console.log(`     期望: "${item.expectedTitle}"`);
    });
  }

  if (results.missing.length > 0) {
    console.log('\n⚠️  缺失标题的页面:');
    results.missing.forEach((item) => {
      console.log(`   ${item.toolSlug}: 应该是 "${item.expectedTitle}"`);
    });
  }

  if (results.unknown.length > 0) {
    console.log('\n❓ 未知类型的页面:');
    results.unknown.forEach((item) => {
      console.log(`   ${item.toolSlug}: "${item.currentTitle}"`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // 生成修复脚本
  if (results.incorrect.length > 0 || results.missing.length > 0) {
    log('🔧 生成修复脚本...', 'info');
    const fixScript = generateFixScript(results.incorrect, results.missing);
    const scriptPath = path.join(ROOT_DIR, 'scripts', 'fix-howto-titles.js');
    await fs.writeFile(scriptPath, fixScript);
    log(`📝 修复脚本已保存到: ${scriptPath}`, 'success');
  }

  if (results.incorrect.length === 0 && results.missing.length === 0) {
    log('🎉 所有标题都已正确！', 'success');
  }
}

function generateFixScript(incorrect, missing) {
  let script = `#!/usr/bin/env node

/**
 * 自动修复"How to"标题的脚本
 * 由 test-howto-titles.js 生成
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = path.resolve(process.cwd(), '.');
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages/pages');

async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('读取文件失败:', filePath, error.message);
    return null;
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log('✅ 已更新:', filePath);
  } catch (error) {
    console.error('写入文件失败:', filePath, error.message);
  }
}

async function fixHowtoTitle(toolSlug, expectedTitle) {
  const enJsonPath = path.join(MESSAGES_DIR, toolSlug, 'en.json');
  const data = await readJsonFile(enJsonPath);

  if (!data) {
    console.error('❌ 无法读取文件:', enJsonPath);
    return false;
  }

  // 找到页面数据
  const pageKey = Object.keys(data)[0];
  const pageData = data[pageKey];

  if (!pageData || !pageData.howto) {
    console.error('❌ 未找到howto部分:', toolSlug);
    return false;
  }

  // 更新标题
  const oldTitle = pageData.howto.title;
  pageData.howto.title = expectedTitle;

  await writeJsonFile(enJsonPath, data);
  console.log(\`📝 \${toolSlug}: "\${oldTitle}" → "\${expectedTitle}"\`);

  return true;
}

async function main() {
  console.log('🔧 开始修复"How to"标题...\\n');

`;

  // 添加需要修复的条目
  [...incorrect, ...missing].forEach((item) => {
    const { toolSlug, expectedTitle } = item;
    script += `  await fixHowtoTitle('${toolSlug}', '${expectedTitle}');\n`;
  });

  script += `
  console.log('\\n✅ 修复完成！');
}

main().catch(console.error);
`;

  return script;
}

main().catch(console.error);
