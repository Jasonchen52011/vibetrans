#!/usr/bin/env tsx

/**
 * 批量修复翻译工具CTA按钮的右箭头图标
 * 统一所有翻译工具的翻译按钮，添加ArrowRightIcon
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

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
        // 查找工具文件
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

// 修复单个文件的CTA按钮
const fixToolFile = (tool: ToolFile): boolean => {
  try {
    let content = tool.content;
    let modified = false;

    // 1. 检查是否已经导入了ArrowRightIcon
    if (!content.includes("import { ArrowRightIcon } from 'lucide-react'")) {
      // 查找合适的位置添加import
      const importLines = [
        "import { TextToSpeechButton } from '@/components/ui/text-to-speech-button';",
        "import mammoth from 'mammoth';",
        "import { useState } from 'react';",
      ];

      for (const importLine of importLines) {
        if (content.includes(importLine)) {
          content = content.replace(
            importLine,
            importLine + "\nimport { ArrowRightIcon } from 'lucide-react';"
          );
          modified = true;
          break;
        }
      }
    }

    // 2. 查找并修复翻译按钮
    const buttonPattern =
      /(<button\s+[^>]*?onClick={handleTranslate}[^>]*?>\s*{isLoading[^}]*?}[^<]*?<\/button>)/gs;

    const buttonMatch = content.match(buttonPattern);
    if (buttonMatch) {
      for (const button of buttonMatch) {
        // 检查是否已经有ArrowRightIcon
        if (!button.includes('ArrowRightIcon')) {
          // 修复按钮结构
          const fixedButton = button
            .replace(
              /className="([^"]*)"/,
              'className="inline-flex items-center $1"'
            )
            .replace(
              /({isLoading[^}]*?})/,
              '<span>$1</span>\n            <ArrowRightIcon className="ml-2 h-4 w-4" />'
            );

          content = content.replace(button, fixedButton);
          modified = true;
        }
      }
    }

    // 3. 备份原文件
    if (modified) {
      const backupPath = tool.path + '.backup';
      writeFileSync(backupPath, tool.content);

      // 写入修改后的内容
      writeFileSync(tool.path, content);

      console.log(`✅ 修复成功: ${tool.name}`);
      return true;
    } else {
      console.log(`⚪  无需修复: ${tool.name} (已有ArrowRightIcon)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${tool.name}`, error);
    return false;
  }
};

// 运行格式化
const formatFiles = () => {
  try {
    console.log('🔧 格式化修改的文件...');
    execSync('pnpm format', { stdio: 'inherit' });
    console.log('✅ 格式化完成');
  } catch (error) {
    console.warn('⚠️  格式化失败:', error);
  }
};

// 主函数
const main = async () => {
  console.log('🔍 开始批量修复翻译工具CTA按钮...\n');

  // 获取所有翻译工具文件
  const tools = getTranslatorToolFiles();
  console.log(`📁 找到 ${tools.length} 个翻译工具文件\n`);

  // 修复每个文件
  let fixedCount = 0;
  for (const tool of tools) {
    if (fixToolFile(tool)) {
      fixedCount++;
    }
  }

  console.log(`\n📊 修复结果:`);
  console.log(`- 总计文件: ${tools.length}`);
  console.log(`- 修复成功: ${fixedCount}`);
  console.log(`- 无需修复: ${tools.length - fixedCount}`);

  // 格式化文件
  if (fixedCount > 0) {
    formatFiles();
  }

  console.log('\n✅ 批量修复完成!');

  if (fixedCount > 0) {
    console.log('\n💡 提示: 所有修改的文件已自动备份为 .backup 文件');
    console.log('   如需恢复，可以手动替换备份文件');
  }
};

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 批量修复失败:', error);
    process.exit(1);
  });
}

export default main;
