import fs from 'fs';
import path from 'path';

// 映射表
const expectedRecommendations: Record<string, string[]> = {
  'ancient-greek-translator': [
    'Cuneiform Translator',
    'Middle English Translator',
    'Esperanto Translator',
    'Chinese to English Translator',
    'Al Bhed Translator',
    'Cantonese Translator',
  ],
  'cuneiform-translator': [
    'Ancient Greek Translator',
    'Middle English Translator',
    'Esperanto Translator',
    'Chinese to English Translator',
    'Al Bhed Translator',
    'Gibberish Translator',
  ],
  'middle-english-translator': [
    'Ancient Greek Translator',
    'Cuneiform Translator',
    'Esperanto Translator',
    'Gen Alpha Translator',
    'Chinese to English Translator',
    'Bad Translator',
  ],
  'albanian-to-english': [
    'Creole to English Translator',
    'Chinese to English Translator',
    'Cantonese Translator',
    'Esperanto Translator',
    'IVR Translator',
    'Bad Translator',
  ],
  'chinese-to-english-translator': [
    'Cantonese Translator',
    'Albanian to English',
    'Creole to English Translator',
    'IVR Translator',
    'Esperanto Translator',
    'Bad Translator',
  ],
  'cantonese-translator': [
    'Chinese to English Translator',
    'Albanian to English',
    'Creole to English Translator',
    'IVR Translator',
    'Gen Z Translator',
    'Esperanto Translator',
  ],
  'creole-to-english-translator': [
    'Albanian to English',
    'Chinese to English Translator',
    'Cantonese Translator',
    'Esperanto Translator',
    'IVR Translator',
    'Gen Z Translator',
  ],
  'gen-z-translator': [
    'Gen Alpha Translator',
    'Dog Translator',
    'Bad Translator',
    'Baby Translator',
    'Pig Latin Translator',
    'Gibberish Translator',
  ],
  'gen-alpha-translator': [
    'Gen Z Translator',
    'Dog Translator',
    'Bad Translator',
    'Baby Translator',
    'Pig Latin Translator',
    'Alien Text Generator',
  ],
  'dog-translator': [
    'Baby Translator',
    'Bad Translator',
    'Gen Z Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Pig Latin Translator',
  ],
  'bad-translator': [
    'Dog Translator',
    'Baby Translator',
    'Gen Z Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Verbose Generator',
  ],
  'baby-translator': [
    'Dog Translator',
    'Bad Translator',
    'Gen Alpha Translator',
    'Gibberish Translator',
    'Pig Latin Translator',
    'Gen Z Translator',
  ],
  'al-bhed-translator': [
    'Pig Latin Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Bad Translator',
    'Ancient Greek Translator',
  ],
  'pig-latin-translator': [
    'Al Bhed Translator',
    'Gibberish Translator',
    'Gen Alpha Translator',
    'Baby Translator',
    'Alien Text Generator',
    'Gen Z Translator',
  ],
  'gibberish-translator': [
    'Pig Latin Translator',
    'Al Bhed Translator',
    'Bad Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Baby Translator',
  ],
  'esperanto-translator': [
    'Chinese to English Translator',
    'Cantonese Translator',
    'Albanian to English',
    'Ancient Greek Translator',
    'Creole to English Translator',
    'Middle English Translator',
  ],
  'alien-text-generator': [
    'Gibberish Translator',
    'Bad Translator',
    'Al Bhed Translator',
    'Pig Latin Translator',
    'Verbose Generator',
    'Gen Z Translator',
  ],
  'verbose-generator': [
    'Dumb It Down AI',
    'Bad Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Chinese to English Translator',
    'Gibberish Translator',
  ],
  'dumb-it-down-ai': [
    'Verbose Generator',
    'Chinese to English Translator',
    'Bad Translator',
    'IVR Translator',
    'Esperanto Translator',
    'Gen Z Translator',
  ],
  'ivr-translator': [
    'Chinese to English Translator',
    'Cantonese Translator',
    'Albanian to English',
    'Creole to English Translator',
    'Dumb It Down AI',
    'Esperanto Translator',
  ],
};

function extractToolKeysFromFile(filePath: string): string[] | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 提取 toolKeys 数组
    const regex = /toolKeys=\{(\[[\s\S]*?\])\}/;
    const match = content.match(regex);

    if (!match) {
      return null;
    }

    // 提取每个工具名
    const toolKeysStr = match[1];
    const toolNames = toolKeysStr.match(/'([^']+)'/g);

    if (!toolNames) {
      return null;
    }

    return toolNames.map((name) => name.replace(/'/g, ''));
  } catch (error) {
    console.error(`读取文件错误: ${filePath}`, error);
    return null;
  }
}

async function main() {
  const basePath =
    '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)';

  console.log('\n📋 验证 ExploreOurAiTools 更新结果\n');
  console.log('='.repeat(80));

  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  for (const [toolKey, expectedTools] of Object.entries(
    expectedRecommendations
  )) {
    const filePath = path.join(basePath, toolKey, 'page.tsx');

    if (!fs.existsSync(filePath)) {
      console.log(`\n❌ ${toolKey}: 文件不存在`);
      failCount++;
      failures.push(toolKey);
      continue;
    }

    const actualTools = extractToolKeysFromFile(filePath);

    if (!actualTools) {
      console.log(`\n❌ ${toolKey}: 未找到 toolKeys`);
      failCount++;
      failures.push(toolKey);
      continue;
    }

    // 比对数组
    const isMatch =
      actualTools.length === expectedTools.length &&
      actualTools.every((tool, index) => tool === expectedTools[index]);

    if (isMatch) {
      console.log(`\n✅ ${toolKey}: 验证通过`);
      passCount++;
    } else {
      console.log(`\n❌ ${toolKey}: 验证失败`);
      console.log(`   期望: ${expectedTools.join(', ')}`);
      console.log(`   实际: ${actualTools.join(', ')}`);
      failCount++;
      failures.push(toolKey);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 验证结果统计:');
  console.log(`   ✅ 通过: ${passCount} 个`);
  console.log(`   ❌ 失败: ${failCount} 个`);
  console.log(
    `   📈 成功率: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`
  );

  if (failures.length > 0) {
    console.log('\n⚠️  失败的工具:');
    failures.forEach((tool) => console.log(`   - ${tool}`));
  } else {
    console.log('\n🎉 所有工具验证通过！');
  }

  console.log('\n');
}

main().catch(console.error);
