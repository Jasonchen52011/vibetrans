#!/usr/bin/env tsx

/**
 * 最终修复剩余的CTA按钮问题
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const TRANSLATOR_TOOLS_DIR = 'src/app/[locale]/(marketing)/(pages)';

const toolsToFix = [
  'bad-translator',
  'esperanto-translator',
  'gen-alpha-translator',
  'gen-z-translator',
  'gibberish-translator',
];

// 修复单个工具
const fixTool = (toolName: string): boolean => {
  try {
    const toolPath = join(
      TRANSLATOR_TOOLS_DIR,
      toolName,
      `${toolName}Tool.tsx`
    );
    const content = readFileSync(toolPath, 'utf-8');

    let modified = content;

    // 确保有导入
    if (!modified.includes("import { ArrowRightIcon } from 'lucide-react'")) {
      modified = "import { ArrowRightIcon } from 'lucide-react';\n" + modified;
    }

    // 查找并替换翻译按钮
    const buttonPattern =
      /(onClick={handleTranslate}[^>]*>)([^<]*?)(<\/button>)/gs;
    modified = modified.replace(
      buttonPattern,
      (match, before, content, after) => {
        if (content.includes('ArrowRightIcon')) {
          return match; // 已经有ArrowRightIcon
        }

        // 添加inline-flex class和ArrowRightIcon
        const newBefore = before.replace(
          /className="([^"]*)"/,
          'className="inline-flex items-center $1"'
        );

        return `${newBefore}<span>${content}</span>\n            <ArrowRightIcon className="ml-2 h-4 w-4" />${after}`;
      }
    );

    if (modified !== content) {
      writeFileSync(toolPath, modified);
      console.log(`✅ 修复完成: ${toolName}`);
      return true;
    } else {
      console.log(`⚪  无需修复: ${toolName}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${toolName}`, error);
    return false;
  }
};

// 主函数
const main = async () => {
  console.log('🔧 最终CTA修复...\n');

  let fixedCount = 0;
  for (const tool of toolsToFix) {
    if (fixTool(tool)) {
      fixedCount++;
    }
  }

  console.log(`\n📊 最终修复结果:`);
  console.log(`- 修复成功: ${fixedCount}/${toolsToFix.length}`);
  console.log('\n✅ 最终修复完成!');
};

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 最终修复失败:', error);
    process.exit(1);
  });
}

export default main;
