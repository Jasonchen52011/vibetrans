/**
 * 测试用例：Samoan to English Translator 页面完整性检查
 *
 * 检查项目：
 * 1. 文件存在性检查
 * 2. 图片资源检查
 * 3. 内容语言一致性检查
 * 4. 配置文件更新检查
 * 5. API 实现检查
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: [],
};

// 1. 检查必需文件是否存在
function checkRequiredFiles() {
  info('\n========== 检查必需文件 ==========');

  const requiredFiles = [
    'src/app/[locale]/(marketing)/(pages)/samoan-to-english-translator/page.tsx',
    'src/app/[locale]/(marketing)/(pages)/samoan-to-english-translator/SamoanToEnglishTranslatorTool.tsx',
    'src/app/api/samoan-to-english-translator/route.ts',
    'messages/pages/samoan-to-english-translator/en.json',
  ];

  requiredFiles.forEach((file) => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      success(`${file}`);
      results.passed++;
    } else {
      error(`缺失: ${file}`);
      results.failed++;
      results.issues.push(`缺失必需文件: ${file}`);
    }
  });

  // 检查 zh.json 翻译文件
  const zhJsonPath = path.join(
    projectRoot,
    'messages/pages/samoan-to-english-translator/zh.json'
  );
  if (fs.existsSync(zhJsonPath)) {
    success('messages/pages/samoan-to-english-translator/zh.json');
    results.passed++;
  } else {
    warning(
      '缺失中文翻译文件: messages/pages/samoan-to-english-translator/zh.json'
    );
    results.warnings++;
    results.issues.push('缺失中文翻译文件 zh.json');
  }
}

// 2. 检查图片资源
function checkImageResources() {
  info('\n========== 检查图片资源 ==========');

  const enJsonPath = path.join(
    projectRoot,
    'messages/pages/samoan-to-english-translator/en.json'
  );
  if (!fs.existsSync(enJsonPath)) {
    error('无法读取 en.json，跳过图片检查');
    return;
  }

  const content = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));
  const pageContent = content.SamoanToEnglishTranslatorPage || {};

  const imageReferences = [];

  // 收集所有图片引用
  if (pageContent.whatIs?.image) {
    imageReferences.push(pageContent.whatIs.image);
  }

  if (pageContent.funFacts?.items) {
    pageContent.funFacts.items.forEach((item, index) => {
      if (item.image) {
        imageReferences.push(item.image);
      }
    });
  }

  if (pageContent.userInterest?.items) {
    pageContent.userInterest.items.forEach((item, index) => {
      if (item.image) {
        imageReferences.push(item.image);
      }
    });
  }

  // 检查每个图片是否存在
  imageReferences.forEach((imagePath) => {
    const fullPath = path.join(projectRoot, 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      success(`${imagePath} (${sizeKB} KB)`);
      results.passed++;
    } else {
      error(`缺失: ${imagePath}`);
      results.failed++;
      results.issues.push(`缺失图片: ${imagePath}`);
    }
  });

  info(`\n共检查 ${imageReferences.length} 个图片引用`);
}

// 3. 检查内容语言一致性
function checkLanguageConsistency() {
  info('\n========== 检查内容语言一致性 ==========');

  const enJsonPath = path.join(
    projectRoot,
    'messages/pages/samoan-to-english-translator/en.json'
  );
  if (!fs.existsSync(enJsonPath)) {
    error('无法读取 en.json，跳过语言检查');
    return;
  }

  const content = fs.readFileSync(enJsonPath, 'utf-8');
  const jsonData = JSON.parse(content);

  // 检查是否包含中文字符
  const chineseRegex = /[\u4e00-\u9fa5]/;
  const lines = content.split('\n');
  const chineseLines = [];

  lines.forEach((line, index) => {
    if (chineseRegex.test(line)) {
      chineseLines.push({
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  if (chineseLines.length === 0) {
    success('en.json 内容语言一致（全英文）');
    results.passed++;
  } else {
    warning(`en.json 中发现 ${chineseLines.length} 处中文内容`);
    results.warnings++;
    results.issues.push(
      `en.json 包含 ${chineseLines.length} 处中文内容，应为纯英文`
    );

    // 显示前 5 处中文内容
    const displayCount = Math.min(5, chineseLines.length);
    info('\n前 5 处中文内容位置：');
    for (let i = 0; i < displayCount; i++) {
      const item = chineseLines[i];
      console.log(`  第 ${item.line} 行: ${item.content.substring(0, 60)}...`);
    }
    if (chineseLines.length > 5) {
      info(`  ... 还有 ${chineseLines.length - 5} 处`);
    }
  }
}

// 4. 检查 SEO 配置文件更新
function checkSEOConfiguration() {
  info('\n========== 检查 SEO 配置更新 ==========');

  const configFiles = [
    {
      path: 'src/config/navbar-config.tsx',
      keyword: 'SamoanToEnglish',
      name: 'Navbar Config',
    },
    {
      path: 'src/config/footer-config.tsx',
      keyword: 'Samoan To English',
      name: 'Footer Config',
    },
    {
      path: 'src/i18n/messages.ts',
      keyword: 'samoan-to-english-translator',
      name: 'i18n Messages',
    },
  ];

  configFiles.forEach(({ path: filePath, keyword, name }) => {
    const fullPath = path.join(projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      error(`${name} 文件不存在: ${filePath}`);
      results.failed++;
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes(keyword)) {
      success(`${name} 已更新（包含 "${keyword}"）`);
      results.passed++;
    } else {
      warning(`${name} 可能未正确更新（未找到 "${keyword}"）`);
      results.warnings++;
      results.issues.push(`${name} 可能未包含 Samoan translator 配置`);
    }
  });
}

// 5. 检查 API 实现
function checkAPIImplementation() {
  info('\n========== 检查 API 实现 ==========');

  const apiPath = path.join(
    projectRoot,
    'src/app/api/samoan-to-english-translator/route.ts'
  );
  if (!fs.existsSync(apiPath)) {
    error('API 路由文件不存在');
    results.failed++;
    return;
  }

  const content = fs.readFileSync(apiPath, 'utf-8');

  // 检查是否包含实际实现逻辑
  const hasImplementation =
    content.includes('translate') ||
    content.includes('Translation') ||
    content.includes('openai') ||
    content.includes('gemini');

  if (hasImplementation) {
    success('API 路由包含实现逻辑');
    results.passed++;
  } else {
    warning('API 路由可能只是空模板，需要实现翻译逻辑');
    results.warnings++;
    results.issues.push('API 路由需要实现实际的 Samoan-to-English 翻译逻辑');
  }
}

// 6. 生成测试报告
function generateReport() {
  info('\n========== 测试报告 ==========');

  const total = results.passed + results.failed + results.warnings;
  console.log(`\n总测试项: ${total}`);
  success(`通过: ${results.passed}`);
  error(`失败: ${results.failed}`);
  warning(`警告: ${results.warnings}`);

  if (results.issues.length > 0) {
    info('\n========== 需要修复的问题 ==========');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  // 生成优先级建议
  info('\n========== 修复建议（按优先级） ==========');

  const priorities = [];

  if (results.issues.some((i) => i.includes('缺失必需文件'))) {
    priorities.push('🔴 高优先级: 补充缺失的必需文件');
  }

  if (results.issues.some((i) => i.includes('缺失图片'))) {
    priorities.push('🔴 高优先级: 重新生成缺失的图片（特别是 What Is 图片）');
  }

  if (results.issues.some((i) => i.includes('中文内容'))) {
    priorities.push('🟡 中优先级: 清理 en.json 中的中文内容，保持语言一致性');
  }

  if (results.issues.some((i) => i.includes('zh.json'))) {
    priorities.push('🟡 中优先级: 创建中文翻译文件 zh.json');
  }

  if (results.issues.some((i) => i.includes('API'))) {
    priorities.push('🟢 低优先级: 实现 API 翻译逻辑（如果需要实际翻译功能）');
  }

  if (results.issues.some((i) => i.includes('SEO') || i.includes('配置'))) {
    priorities.push('🟢 低优先级: 检查并完善 SEO 配置');
  }

  priorities.forEach((p) => console.log(p));

  console.log('');
}

// 主函数
async function main() {
  log(
    '\n🧪 开始测试 Samoan to English Translator 页面完整性...\n',
    colors.blue
  );

  checkRequiredFiles();
  checkImageResources();
  checkLanguageConsistency();
  checkSEOConfiguration();
  checkAPIImplementation();
  generateReport();

  // 返回退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('测试执行出错:', error);
  process.exit(1);
});
