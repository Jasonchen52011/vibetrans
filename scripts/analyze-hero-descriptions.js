const fs = require('fs');
const path = require('path');

// 统计字数的函数
function countWords(text) {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

// 检查是否包含"best"关键词
function containsBest(text) {
  if (!text) return false;
  return /\bbest\b/i.test(text);
}

// 读取所有hero description
const pagesDir = path.join(__dirname, '../messages/pages');
const results = [];

try {
  const pageFolders = fs
    .readdirSync(pagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  pageFolders.forEach((pageFolder) => {
    const enJsonPath = path.join(pagesDir, pageFolder, 'en.json');

    if (fs.existsSync(enJsonPath)) {
      try {
        const content = fs.readFileSync(enJsonPath, 'utf8');
        const data = JSON.parse(content);

        // 查找hero description
        let heroDescription = null;
        const pageTitle = pageFolder;

        // 遍历JSON结构寻找hero description
        function findHeroDescription(obj, path = '') {
          for (const key in obj) {
            if (key === 'hero' && obj[key] && obj[key].description) {
              heroDescription = obj[key].description;
              return;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              findHeroDescription(obj[key], `${path}.${key}`);
            }
          }
        }

        findHeroDescription(data);

        if (heroDescription) {
          const wordCount = countWords(heroDescription);
          const hasBest = containsBest(heroDescription);

          results.push({
            page: pageFolder,
            heroDescription: heroDescription,
            wordCount: wordCount,
            containsBest: hasBest,
          });
        }
      } catch (error) {
        console.log(`Error processing ${pageFolder}:`, error.message);
      }
    }
  });

  // 输出统计结果
  console.log('=== Hero Description 分析报告 ===\n');

  let totalWordCount = 0;
  let pagesWithBest = 0;

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.page}`);
    console.log(`   Description: "${result.heroDescription}"`);
    console.log(`   字数: ${result.wordCount}`);
    console.log(`   包含"best": ${result.containsBest ? '是' : '否'}`);
    console.log('');

    totalWordCount += result.wordCount;
    if (result.containsBest) pagesWithBest++;
  });

  console.log(`=== 统计汇总 ===`);
  console.log(`总页面数: ${results.length}`);
  console.log(`总字数: ${totalWordCount}`);
  console.log(`平均字数: ${(totalWordCount / results.length).toFixed(1)}`);
  console.log(`包含"best"关键词的页面数: ${pagesWithBest}`);
  console.log(
    `包含"best"关键词的比例: ${((pagesWithBest / results.length) * 100).toFixed(1)}%`
  );

  // 找出最长和最短的description
  const longest = results.reduce((prev, current) =>
    prev.wordCount > current.wordCount ? prev : current
  );
  const shortest = results.reduce((prev, current) =>
    prev.wordCount < current.wordCount ? prev : current
  );

  console.log(`\n=== 字数极值 ===`);
  console.log(`最长description: ${longest.page} (${longest.wordCount}字)`);
  console.log(`最短description: ${shortest.page} (${shortest.wordCount}字)`);

  // 列出包含"best"的页面
  const pagesWithBestList = results.filter((r) => r.containsBest);
  if (pagesWithBestList.length > 0) {
    console.log(`\n=== 包含"best"关键词的页面 ===`);
    pagesWithBestList.forEach((result) => {
      console.log(`- ${result.page}: "${result.heroDescription}"`);
    });
  }
} catch (error) {
  console.error('Error:', error.message);
}
