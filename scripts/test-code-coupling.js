#!/usr/bin/env node

/**
 * 代码耦合测试脚本
 * 检查所有翻译器工具页面的代码耦合问题，包括：
 * 1. 硬编码文本检测
 * 2. 字段引用一致性检查
 * 3. 必需字段完整性检查
 */

const fs = require('fs');
const path = require('path');

// 翻译器列表
const TRANSLATORS = [
  'al-bhed-translator',
  'albanian-to-english',
  'alien-text-generator',
  'ancient-greek-translator',
  'aramaic-translator',
  'baby-translator',
  'bad-translator',
  'baybayin-translator',
  'cantonese-translator',
  'chinese-to-english-translator',
  'creole-to-english-translator',
  'cuneiform-translator',
  'dog-translator',
  'esperanto-translator',
  'gaster-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
  'high-valyrian-translator',
  'ivr-translator',
  'middle-english-translator',
  'minion-translator',
  'pig-latin-translator',
  'verbose-generator',
];

// 常见的硬编码英文文本模式
const HARDCODED_PATTERNS = [
  // 基本UI文本
  /\b(Input Text|Translation|Enter text here|Translate|Upload File|Supports|Loading|Error|Reset|Copy|Download)\b/gi,
  /\b(Your Text|Original Text|Translated Text|Result|Output)\b/gi,
  /\b(Enter your text|Type your text|Paste your text)\b/gi,
  /\b(Translation will appear|Result will appear|Output will appear)\b/gi,
  /\b(Click to translate|Press translate|Start translation)\b/gi,

  // 占位符文本
  /\b(Enter.*here|Type.*here|Paste.*here)\b/gi,
  /\b(Supports.*files|Accepts.*files)\b/gi,

  // 按钮和标签
  /\b(Clear|Reset|Remove|Delete|Cancel|Confirm)\b/gi,
  /\b(Save|Export|Share|Print)\b/gi,
  /\b(Play|Pause|Stop|Listen)\b/gi,

  // 状态消息
  /\b(Loading|Processing|Translating|Converting|Analyzing)\b/gi,
  /\b(Success|Failed|Error|Warning|Info)\b/gi,
  /\b(Please enter|Please provide|Please input)\b/gi,

  // 文件相关
  /\b(\.txt|\.docx|text files|Word documents)\b/gi,
  /\b(Upload file|Choose file|Select file)\b/gi,

  // 语言和方向相关
  /\b(English|Chinese|Japanese|Korean|Spanish|French)\b/gi,
  /\b(to English|to Chinese|auto detect|automatic)\b/gi,
  /\b(Switch to|Toggle|Change direction)\b/gi,

  // 通用描述文本
  /\b(Hello|Thank you|Good morning|Good evening)\b/gi,
  /\b(Example|Sample|Demo|Test)\b/gi,
];

// 必需的字段列表
const REQUIRED_FIELDS = {
  tool: [
    'inputLabel',
    'outputLabel',
    'inputPlaceholder',
    'outputPlaceholder',
    'translateButton',
    'uploadButton',
    'uploadHint',
    'loading',
    'error',
    'noInput',
  ],
  testimonials: [
    'items.item-1.rating',
    'items.item-2.rating',
    'items.item-3.rating',
    'items.item-4.rating',
    'items.item-5.rating',
    'items.item-6.rating',
  ],
  funfacts: ['title', 'items'],
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// 读取JSON文件
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// 获取字段值的辅助函数
function getFieldValue(obj, path) {
  // 首先找到页面键名（如 "AlBhedTranslatorPage"）
  const pageKey = Object.keys(obj)[0];
  if (!pageKey || !obj[pageKey]) {
    return undefined;
  }

  // 从页面对象开始查找字段路径
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj[pageKey]);
}

// 检查硬编码文本
function checkHardcodedText(content, filePath) {
  const issues = [];

  HARDCODED_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      // 排除注释中的文本
      const lines = content.split('\n');
      lines.forEach((line, lineNum) => {
        if (line.includes('//') || line.includes('/*') || line.includes('*')) {
          return; // 跳过注释行
        }

        const lineMatches = line.match(pattern);
        if (lineMatches) {
          lineMatches.forEach((match) => {
            // 检查是否在字符串字面量中
            const inQuotes =
              line.includes(`'${match}'`) || line.includes(`"${match}"`);
            if (inQuotes) {
              // 检查是否是pageData引用
              const hasPageDataRef =
                line.includes('pageData.') || line.includes('{pageData.');
              if (!hasPageDataRef) {
                issues.push({
                  line: lineNum + 1,
                  text: match,
                  context: line.trim(),
                });
              }
            }
          });
        }
      });
    }
  });

  return issues;
}

// 检查字段引用一致性
function checkFieldReferences(toolContent, messageData, translatorName) {
  const issues = [];

  // 提取所有pageData.xxx引用
  const pageDataRefs = toolContent.match(/pageData\.[\w.]+/g) || [];

  pageDataRefs.forEach((ref) => {
    // 移除pageData.前缀
    const fieldPath = ref.replace('pageData.', '');
    const value = getFieldValue(messageData, fieldPath);

    if (value === undefined) {
      issues.push({
        type: 'missing_field',
        field: fieldPath,
        reference: ref,
      });
    }
  });

  return issues;
}

// 检查必需字段完整性
function checkRequiredFields(messageData, translatorName) {
  const issues = [];

  Object.entries(REQUIRED_FIELDS).forEach(([section, fields]) => {
    const sectionData = getFieldValue(messageData, section);

    if (!sectionData) {
      issues.push({
        type: 'missing_section',
        section: section,
      });
      return;
    }

    fields.forEach((field) => {
      const value = getFieldValue(messageData, `${section}.${field}`);
      if (value === undefined || value === '') {
        issues.push({
          type: 'missing_required_field',
          section: section,
          field: field,
          fullPath: `${section}.${field}`,
        });
      }
    });
  });

  return issues;
}

// 分析单个翻译器
function analyzeTranslator(translatorName) {
  const results = {
    name: translatorName,
    status: 'PASS',
    issues: {
      hardcoded: [],
      fieldReferences: [],
      requiredFields: [],
    },
  };

  // 工具组件文件路径
  const toolFiles = [
    `src/app/[locale]/(marketing)/(pages)/${translatorName}/${translatorName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')}TranslatorTool.tsx`,

    // 备用文件名模式
    `src/app/[locale]/(marketing)/(pages)/${translatorName}/${translatorName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')}Tool.tsx`,

    // 特殊情况的文件名
    `src/app/[locale]/(marketing)/(pages)/${translatorName}/${translatorName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')}GeneratorTool.tsx`,
  ];

  let toolContent = null;
  let toolFilePath = null;

  // 尝试找到正确的工具文件
  for (const filePath of toolFiles) {
    toolContent = readFile(filePath);
    if (toolContent) {
      toolFilePath = filePath;
      break;
    }
  }

  if (!toolContent) {
    results.status = 'FAIL';
    results.issues.missingFiles = ['Tool component file not found'];
    return results;
  }

  // 消息文件路径
  const messageFilePath = `messages/pages/${translatorName}/en.json`;
  const messageData = readJsonFile(messageFilePath);

  if (!messageData) {
    results.status = 'FAIL';
    results.issues.missingFiles = results.issues.missingFiles || [];
    results.issues.missingFiles.push('Message file not found');
    return results;
  }

  // 1. 检查硬编码文本
  const hardcodedIssues = checkHardcodedText(toolContent, toolFilePath);
  results.issues.hardcoded = hardcodedIssues;

  // 2. 检查字段引用一致性
  const fieldRefIssues = checkFieldReferences(
    toolContent,
    messageData,
    translatorName
  );
  results.issues.fieldReferences = fieldRefIssues;

  // 3. 检查必需字段完整性
  const requiredFieldIssues = checkRequiredFields(messageData, translatorName);
  results.issues.requiredFields = requiredFieldIssues;

  // 确定总体状态
  const totalIssues =
    hardcodedIssues.length + fieldRefIssues.length + requiredFieldIssues.length;
  if (totalIssues > 0) {
    results.status = 'FAIL';
  }

  return results;
}

// 打印测试结果
function printResults(results) {
  colorLog('cyan', '\n=== 代码耦合测试报告 ===\n');

  const totalTranslators = results.length;
  let passedTranslators = 0;
  let totalIssues = 0;

  results.forEach((result) => {
    const issueCount =
      result.issues.hardcoded.length +
      result.issues.fieldReferences.length +
      result.issues.requiredFields.length;

    totalIssues += issueCount;

    if (result.status === 'PASS') {
      passedTranslators++;
      colorLog('green', `✅ ${result.name}`);
    } else {
      colorLog('red', `❌ ${result.name} (${issueCount} issues)`);

      // 打印硬编码文本问题
      if (result.issues.hardcoded.length > 0) {
        colorLog('yellow', '   硬编码文本:');
        result.issues.hardcoded.forEach((issue) => {
          console.log(`     Line ${issue.line}: "${issue.text}"`);
          console.log(`     Context: ${issue.context}`);
        });
      }

      // 打印字段引用问题
      if (result.issues.fieldReferences.length > 0) {
        colorLog('yellow', '   字段引用问题:');
        result.issues.fieldReferences.forEach((issue) => {
          console.log(
            `     缺失字段: ${issue.field} (引用: ${issue.reference})`
          );
        });
      }

      // 打印必需字段问题
      if (result.issues.requiredFields.length > 0) {
        colorLog('yellow', '   必需字段缺失:');
        result.issues.requiredFields.forEach((issue) => {
          console.log(
            `     缺失: ${issue.fullPath} (type: ${issue.type}, field: ${issue.field || 'undefined'})`
          );
        });
      }

      // 打印文件缺失问题
      if (result.issues.missingFiles) {
        colorLog('yellow', '   文件缺失:');
        result.issues.missingFiles.forEach((file) => {
          console.log(`     ${file}`);
        });
      }
    }
  });

  // 打印总结
  colorLog('cyan', '\n=== 测试总结 ===');
  console.log(`总翻译器数量: ${totalTranslators}`);
  colorLog('green', `通过: ${passedTranslators}`);
  colorLog('red', `失败: ${totalTranslators - passedTranslators}`);
  colorLog('yellow', `总问题数: ${totalIssues}`);

  const successRate = ((passedTranslators / totalTranslators) * 100).toFixed(1);
  console.log(`成功率: ${successRate}%`);

  if (totalIssues > 0) {
    colorLog('red', '\n测试未通过！请修复上述问题后重新运行测试。');
    process.exit(1);
  } else {
    colorLog('green', '\n恭喜！所有翻译器都通过了代码耦合测试。');
  }
}

// 主函数
function main() {
  colorLog('blue', '开始运行代码耦合测试...\n');

  const results = [];

  TRANSLATORS.forEach((translator) => {
    colorLog('blue', `正在测试: ${translator}`);
    const result = analyzeTranslator(translator);
    results.push(result);
  });

  printResults(results);
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  analyzeTranslator,
  checkHardcodedText,
  checkFieldReferences,
  checkRequiredFields,
};
