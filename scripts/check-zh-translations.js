const fs = require('fs');
const path = require('path');

// 读取分析报告
const analysisReport = require('./i18n-analysis-report.json');

// 页面名称到标题的映射（中文）
const pageTitlesZh = {
  about: '关于我们 - VibeTrans',
  'al-bhed-translator': '阿尔贝德语翻译器 - VibeTrans',
  'albanian-to-english': '阿尔巴尼亚语英语翻译器 - VibeTrans',
  'alien-text-generator': '外星文字生成器 - VibeTrans',
  'ancient-greek-translator': '古希腊语翻译器 - VibeTrans',
  'aramaic-translator': '阿拉米语翻译器 - VibeTrans',
  'baby-translator': '婴儿语翻译器 - VibeTrans',
  'bad-translator': '糟糕翻译器 - VibeTrans',
  'baybayin-translator': '巴贝因语翻译器 - VibeTrans',
  'cantonese-translator': '粤语翻译器 - VibeTrans',
  'chinese-to-english-translator': '中文英语翻译器 - VibeTrans',
  'creole-to-english-translator': '克里奥尔语英语翻译器 - VibeTrans',
  'cuneiform-translator': '楔形文字翻译器 - VibeTrans',
  'dog-translator': '狗狗语翻译器 - VibeTrans',
  'drow-translator': '卓尔语翻译器 - VibeTrans',
  'dumb-it-down-ai': '简化AI - VibeTrans',
  'english-to-amharic-translator': '英语阿姆哈拉语翻译器 - VibeTrans',
  'english-to-chinese-translator': '英语中文翻译器 - VibeTrans',
  'english-to-persian-translator': '英语波斯语翻译器 - VibeTrans',
  'english-to-polish-translator': '英语波兰语翻译器 - VibeTrans',
  'english-to-swahili-translator': '英语斯瓦希里语翻译器 - VibeTrans',
  'esperanto-translator': '世界语翻译器 - VibeTrans',
  'gaster-translator': '加斯特语翻译器 - VibeTrans',
  'gen-alpha-translator': 'Alpha世代翻译器 - VibeTrans',
  'gen-z-translator': 'Z世代翻译器 - VibeTrans',
  'gibberish-translator': '乱语翻译器 - VibeTrans',
  'greek-translator': '希腊语翻译器 - VibeTrans',
  'high-valyrian-translator': '高等瓦雷利亚语翻译器 - VibeTrans',
  'ivr-translator': 'IVR翻译器 - VibeTrans',
  'japanese-to-english-translator': '日语英语翻译器 - VibeTrans',
  'manga-translator': '漫画翻译器 - VibeTrans',
  'middle-english-translator': '中古英语翻译器 - VibeTrans',
  'minion-translator': '小黄人语翻译器 - VibeTrans',
  'nahuatl-translator': '纳瓦特尔语翻译器 - VibeTrans',
  'ogham-translator': '欧甘文字翻译器 - VibeTrans',
  'pig-latin-translator': '猪拉丁语翻译器 - VibeTrans',
  public: '公共页面 - VibeTrans',
  'rune-translator': '卢恩文字翻译器 - VibeTrans',
  'runic-translator': '古北欧语翻译器 - VibeTrans',
  'samoan-to-english-translator': '萨摩亚语英语翻译器 - VibeTrans',
  'swahili-to-english-translator': '斯瓦希里语英语翻译器 - VibeTrans',
  'telugu-to-english-translator': '泰卢固语英语翻译器 - VibeTrans',
  'verbose-generator': '冗长生成器 - VibeTrans',
  'wingdings-translator': '韦恩丁语翻译器 - VibeTrans',
  'yoda-translator': '尤达语翻译器 - VibeTrans',
};

// 检查并创建缺失的中文翻译文件
function checkAndCreateZhTranslations() {
  console.log('🔍 检查中文翻译文件...\n');

  let createdCount = 0;
  let totalChecked = 0;

  // 从分析报告中获取所有有问题的页面
  const pagesToCheck = new Set();

  analysisReport.namespaceIssues.forEach((issue) => {
    pagesToCheck.add(issue.pageName);
  });

  analysisReport.fileMappingIssues.forEach((issue) => {
    pagesToCheck.add(issue.pageName);
  });

  analysisReport.pagesWithIssues.forEach((page) => {
    pagesToCheck.add(page.pageName);
  });

  pagesToCheck.forEach((pageName) => {
    totalChecked++;
    const enFilePath = path.join(
      __dirname,
      '..',
      'messages',
      'pages',
      pageName,
      'en.json'
    );
    const zhFilePath = path.join(
      __dirname,
      '..',
      'messages',
      'pages',
      pageName,
      'zh.json'
    );

    if (fs.existsSync(enFilePath) && !fs.existsSync(zhFilePath)) {
      try {
        // 读取英文文件内容
        const enContent = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));

        // 创建中文翻译文件
        const zhContent = {};

        // 复制所有命名空间，但翻译Metadata
        Object.keys(enContent).forEach((namespace) => {
          if (namespace === 'Metadata') {
            zhContent.Metadata = {
              name: 'VibeTrans',
              title: pageTitlesZh[pageName] || `${pageName} - VibeTrans`,
              description:
                '通过人工智能翻译打破语言障碍。支持100多种语言的准确、上下文感知翻译。',
            };
          } else {
            // 对于其他命名空间，暂时复制英文内容（之后可以手动翻译）
            zhContent[namespace] = enContent[namespace];
          }
        });

        // 确保目录存在
        const dirPath = path.dirname(zhFilePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(zhFilePath, JSON.stringify(zhContent, null, 2) + '\n');
        console.log(`✅ Created missing zh.json for ${pageName}`);
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error creating zh.json for ${pageName}:`,
          error.message
        );
      }
    } else if (fs.existsSync(zhFilePath)) {
      console.log(`ℹ️  zh.json already exists for ${pageName}`);
    }
  });

  console.log(`\n✨ 检查完成! 创建了 ${createdCount} 个中文翻译文件`);
  return createdCount;
}

// 运行检查
if (require.main === module) {
  checkAndCreateZhTranslations();
}

module.exports = { checkAndCreateZhTranslations };
