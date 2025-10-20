#!/usr/bin/env tsx

/**
 * 修复翻译工具中的语法错误
 * 主要修复批量修复脚本产生的语法问题
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const TRANSLATOR_TOOLS_DIR = 'src/app/[locale]/(marketing)/(pages)';

interface ToolFile {
  name: string;
  path: string;
  content: string;
}

// 获取所有翻译工具文件
const getTranslatorToolFiles = (): ToolFile[] => {
  const files: ToolFile[] = [];

  try {
    const items = readdirSync(TRANSLATOR_TOOLS_DIR);

    for (const item of items) {
      const itemPath = join(TRANSLATOR_TOOLS_DIR, item);
      const stat = require('fs').statSync(itemPath);

      if (stat.isDirectory()) {
        const toolFiles = require('fs')
          .readdirSync(itemPath)
          .filter((file: string) => file.endsWith('Tool.tsx'))
          .map((file: string) => ({
            name: item,
            path: join(itemPath, file),
            content: readFileSync(join(itemPath, file), 'utf-8'),
          }));

        files.push(...toolFiles);
      }
    }
  } catch (error) {
    console.error('❌ 读取工具目录失败:', error);
  }

  return files;
};

// 修复语法错误
const fixSyntaxErrors = (tool: ToolFile): boolean => {
  try {
    let content = tool.content;
    let modified = false;

    // 修复模式1: disabled=<span>{isLoading}</span>
    const disabledPattern1 = /disabled=<span>{isLoading}<\/span>/g;
    if (disabledPattern1.test(content)) {
      content = content.replace(disabledPattern1, 'disabled={isLoading}');
      modified = true;
    }

    // 修复模式2: ArrowRightIcon在错误位置
    const arrowPattern1 =
      /disabled=<span>{isLoading}<\/span>\s*<ArrowRightIcon[^>]*\/>/g;
    if (arrowPattern1.test(content)) {
      content = content.replace(arrowPattern1, 'disabled={isLoading}');
      modified = true;
    }

    // 修复模式3: 确保按钮内容正确结构
    const buttonContentPattern =
      /<button[^>]*>\s*{isLoading[^}]*}[^<]*?<\/button>/g;
    content = content.replace(buttonContentPattern, (match) => {
      if (!match.includes('<span>') && match.includes('{isLoading')) {
        const fixed = match.replace(
          /{([^}]*)}/,
          '<span>{$1}</span>\n            <ArrowRightIcon className="ml-2 h-4 w-4" />'
        );
        if (fixed !== match) {
          modified = true;
          return fixed;
        }
      }
      return match;
    });

    // 修复模式4: 确保ArrowRightIcon在正确的位置
    const arrowPositionPattern = /(<button[^>]*>[\s\S]*?<\/button>)/g;
    content = content.replace(arrowPositionPattern, (match) => {
      // 如果有ArrowRightIcon但不在按钮内容末尾
      if (
        match.includes('ArrowRightIcon') &&
        !match.endsWith('</ArrowRightIcon>')
      ) {
        // 尝试重新定位ArrowRightIcon
        const beforeArrow = match.split('<ArrowRightIcon')[0];
        const afterArrow =
          '<ArrowRightIcon' + match.split('<ArrowRightIcon')[1];

        // 如果ArrowRightIcon在className后面
        if (afterArrow.includes('/>') && afterArrow.includes('className=')) {
          const arrowTag = afterArrow.split('/>')[0] + '/>';
          const restContent = afterArrow.split('/>')[1];

          // 重新构建按钮结构
          const buttonClose = beforeArrow.includes('>')
            ? beforeArrow.split('>').slice(0, -1).join('>') + '>'
            : beforeArrow + '>';
          const buttonContent = restContent.includes('{isLoading')
            ? restContent
            : restContent;

          if (buttonContent.includes('</button>')) {
            const finalContent = buttonContent.replace(
              '</button>',
              '\n            <ArrowRightIcon className="ml-2 h-4 w-4" />\n          </button>'
            );
            const fixedButton = buttonClose + finalContent;

            if (fixedButton !== match) {
              modified = true;
              return fixedButton;
            }
          }
        }
      }
      return match;
    });

    // 写入修复后的内容
    if (modified) {
      writeFileSync(tool.path, content);
      console.log(`✅ 修复语法错误: ${tool.name}`);
      return true;
    } else {
      console.log(`⚪  语法正确: ${tool.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${tool.name}`, error);
    return false;
  }
};

// 主函数
const main = async () => {
  console.log('🔧 开始修复语法错误...\n');

  const tools = getTranslatorToolFiles();
  console.log(`📁 找到 ${tools.length} 个翻译工具文件\n`);

  let fixedCount = 0;
  for (const tool of tools) {
    if (fixSyntaxErrors(tool)) {
      fixedCount++;
    }
  }

  console.log(`\n📊 语法修复结果:`);
  console.log(`- 总计文件: ${tools.length}`);
  console.log(`- 修复成功: ${fixedCount}`);
  console.log(`- 无需修复: ${tools.length - fixedCount}`);

  console.log('\n✅ 语法修复完成!');
};

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 语法修复失败:', error);
    process.exit(1);
  });
}

export default main;
