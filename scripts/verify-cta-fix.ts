#!/usr/bin/env tsx

/**
 * 验证CTA按钮修复结果
 * 统计翻译工具中ArrowRightIcon的使用情况
 */

import { readFileSync, readdirSync } from 'fs';
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

// 验证单个文件
const verifyFile = (
  tool: ToolFile
): {
  hasImport: boolean;
  hasUsage: boolean;
  hasTranslateButton: boolean;
  hasArrowIcon: boolean;
} => {
  const content = tool.content;

  return {
    hasImport: content.includes(
      "import { ArrowRightIcon } from 'lucide-react'"
    ),
    hasUsage: content.includes('<ArrowRightIcon'),
    hasTranslateButton: content.includes('onClick={handleTranslate}'),
    hasArrowIcon: content.includes('ArrowRightIcon className="ml-2 h-4 w-4"'),
  };
};

// 主函数
const main = async () => {
  console.log('🔍 验证CTA按钮修复结果...\n');

  const tools = getTranslatorToolFiles();
  console.log(`📁 检查 ${tools.length} 个翻译工具文件\n`);

  const results = {
    total: tools.length,
    withImport: 0,
    withUsage: 0,
    withTranslateButton: 0,
    withArrowIcon: 0,
    fixed: 0,
    issues: [] as string[],
  };

  for (const tool of tools) {
    const verification = verifyFile(tool);

    if (verification.hasTranslateButton) {
      results.withTranslateButton++;

      if (
        verification.hasImport &&
        verification.hasUsage &&
        verification.hasArrowIcon
      ) {
        results.fixed++;
        console.log(`✅ ${tool.name}: 完整修复 (导入+使用+正确样式)`);
      } else {
        const issues = [];
        if (!verification.hasImport) issues.push('缺少导入');
        if (!verification.hasUsage) issues.push('缺少使用');
        if (!verification.hasArrowIcon) issues.push('样式不正确');

        console.log(`⚠️  ${tool.name}: ${issues.join(', ')}`);
        results.issues.push(`${tool.name}: ${issues.join(', ')}`);
      }
    } else {
      console.log(`⚪ ${tool.name}: 无翻译按钮 (跳过检查)`);
    }

    if (verification.hasImport) results.withImport++;
    if (verification.hasUsage) results.withUsage++;
  }

  console.log('\n📊 修复结果统计:');
  console.log(`总计翻译工具: ${results.total}`);
  console.log(`包含翻译按钮: ${results.withTranslateButton}`);
  console.log(`成功修复: ${results.fixed}`);
  console.log(
    `修复率: ${Math.round((results.fixed / results.withTranslateButton) * 100)}%`
  );

  console.log('\n📋 详细统计:');
  console.log(`- 导入ArrowRightIcon: ${results.withImport}`);
  console.log(`- 使用ArrowRightIcon: ${results.withUsage}`);
  console.log(`- 正确样式(ml-2 h-4 w-4): ${results.withArrowIcon}`);

  if (results.issues.length > 0) {
    console.log('\n🚨 还需要修复的问题:');
    results.issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  if (results.fixed === results.withTranslateButton) {
    console.log('\n🎉 所有翻译工具的CTA按钮都已成功统一使用指向右的logo!');
  } else {
    console.log(
      `\n⚠️  还有 ${results.withTranslateButton - results.fixed} 个工具需要修复`
    );
  }
};

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  });
}

export default main;
