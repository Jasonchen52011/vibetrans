import fs from 'fs';
import path from 'path';

// 完整的工具推荐映射表
const toolRecommendations: Record<string, string[]> = {
  'ancient-greek-translator': [
    'Cuneiform Translator',
    'Middle English Translator',
    'Esperanto Translator',
    'Chinese to English Translator',
    'Al Bhed Translator',
    'Cantonese Translator'
  ],
  'cuneiform-translator': [
    'Ancient Greek Translator',
    'Middle English Translator',
    'Esperanto Translator',
    'Chinese to English Translator',
    'Al Bhed Translator',
    'Gibberish Translator'
  ],
  'middle-english-translator': [
    'Ancient Greek Translator',
    'Cuneiform Translator',
    'Esperanto Translator',
    'Gen Alpha Translator',
    'Chinese to English Translator',
    'Bad Translator'
  ],
  'albanian-to-english': [
    'Creole to English Translator',
    'Chinese to English Translator',
    'Cantonese Translator',
    'Esperanto Translator',
    'IVR Translator',
    'Bad Translator'
  ],
  'chinese-to-english-translator': [
    'Cantonese Translator',
    'Albanian to English',
    'Creole to English Translator',
    'IVR Translator',
    'Esperanto Translator',
    'Bad Translator'
  ],
  'cantonese-translator': [
    'Chinese to English Translator',
    'Albanian to English',
    'Creole to English Translator',
    'IVR Translator',
    'Gen Z Translator',
    'Esperanto Translator'
  ],
  'creole-to-english-translator': [
    'Albanian to English',
    'Chinese to English Translator',
    'Cantonese Translator',
    'Esperanto Translator',
    'IVR Translator',
    'Gen Z Translator'
  ],
  'gen-z-translator': [
    'Gen Alpha Translator',
    'Dog Translator',
    'Bad Translator',
    'Baby Translator',
    'Pig Latin Translator',
    'Gibberish Translator'
  ],
  'gen-alpha-translator': [
    'Gen Z Translator',
    'Dog Translator',
    'Bad Translator',
    'Baby Translator',
    'Pig Latin Translator',
    'Alien Text Generator'
  ],
  'dog-translator': [
    'Baby Translator',
    'Bad Translator',
    'Gen Z Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Pig Latin Translator'
  ],
  'bad-translator': [
    'Dog Translator',
    'Baby Translator',
    'Gen Z Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Verbose Generator'
  ],
  'baby-translator': [
    'Dog Translator',
    'Bad Translator',
    'Gen Alpha Translator',
    'Gibberish Translator',
    'Pig Latin Translator',
    'Gen Z Translator'
  ],
  'al-bhed-translator': [
    'Pig Latin Translator',
    'Gibberish Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Bad Translator',
    'Ancient Greek Translator'
  ],
  'pig-latin-translator': [
    'Al Bhed Translator',
    'Gibberish Translator',
    'Gen Alpha Translator',
    'Baby Translator',
    'Alien Text Generator',
    'Gen Z Translator'
  ],
  'gibberish-translator': [
    'Pig Latin Translator',
    'Al Bhed Translator',
    'Bad Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Baby Translator'
  ],
  'esperanto-translator': [
    'Chinese to English Translator',
    'Cantonese Translator',
    'Albanian to English',
    'Ancient Greek Translator',
    'Creole to English Translator',
    'Middle English Translator'
  ],
  'alien-text-generator': [
    'Gibberish Translator',
    'Bad Translator',
    'Al Bhed Translator',
    'Pig Latin Translator',
    'Verbose Generator',
    'Gen Z Translator'
  ],
  'verbose-generator': [
    'Dumb It Down AI',
    'Bad Translator',
    'Alien Text Generator',
    'Gen Z Translator',
    'Chinese to English Translator',
    'Gibberish Translator'
  ],
  'dumb-it-down-ai': [
    'Verbose Generator',
    'Chinese to English Translator',
    'Bad Translator',
    'IVR Translator',
    'Esperanto Translator',
    'Gen Z Translator'
  ],
  'ivr-translator': [
    'Chinese to English Translator',
    'Cantonese Translator',
    'Albanian to English',
    'Creole to English Translator',
    'Dumb It Down AI',
    'Esperanto Translator'
  ]
};

function updatePageFile(filePath: string, toolKey: string) {
  console.log(`\n正在更新: ${toolKey}`);

  const newToolKeys = toolRecommendations[toolKey];
  if (!newToolKeys) {
    console.log(`  ⚠️  找不到 ${toolKey} 的推荐配置，跳过`);
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // 查找 ExploreOurAiTools 组件和它的 toolKeys 属性
  const exploreToolsRegex = /<ExploreOurAiTools[\s\S]*?toolKeys=\{(\[[\s\S]*?\])\}[\s\S]*?\/>/;
  const match = fileContent.match(exploreToolsRegex);

  if (!match) {
    console.log(`  ⚠️  未找到 ExploreOurAiTools 组件，跳过`);
    return false;
  }

  const oldToolKeysArray = match[1];

  // 构建新的 toolKeys 数组字符串
  const newToolKeysArray = `[\n        '${newToolKeys.join("',\n        '")}'\n      ]`;

  // 替换整个 ExploreOurAiTools 组件，保持格式一致
  const updatedContent = fileContent.replace(
    exploreToolsRegex,
    (fullMatch) => {
      return fullMatch.replace(oldToolKeysArray, newToolKeysArray);
    }
  );

  if (fileContent === updatedContent) {
    console.log(`  ℹ️  内容无变化，跳过写入`);
    return false;
  }

  fs.writeFileSync(filePath, updatedContent, 'utf-8');
  console.log(`  ✅ 成功更新`);
  console.log(`  新推荐: ${newToolKeys.join(', ')}`);
  return true;
}

async function main() {
  const basePath = '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)';

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log('开始批量更新工具页面的 ExploreOurAiTools 配置...\n');
  console.log('=' .repeat(60));

  for (const toolKey of Object.keys(toolRecommendations)) {
    const filePath = path.join(basePath, toolKey, 'page.tsx');

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`\n❌ 文件不存在: ${toolKey}`);
        errorCount++;
        continue;
      }

      const updated = updatePageFile(filePath, toolKey);
      if (updated) {
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`\n❌ 更新 ${toolKey} 时出错:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n更新完成！');
  console.log(`✅ 成功更新: ${successCount} 个文件`);
  console.log(`ℹ️  跳过: ${skipCount} 个文件`);
  console.log(`❌ 错误: ${errorCount} 个文件`);
  console.log(`📊 总计: ${successCount + skipCount + errorCount} 个文件`);
}

main().catch(console.error);
