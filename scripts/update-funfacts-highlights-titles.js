const fs = require('fs');
const path = require('path');

// 定义工具分类
const toolCategories = {
  gaming: [
    'al-bhed-translator',
    'high-valyrian-translator',
    'gaster-translator',
    'minion-translator',
    'gen-z-translator',
    'gen-alpha-translator',
  ],
  ancient: [
    'aramaic-translator',
    'cuneiform-translator',
    'ancient-greek-translator',
    'middle-english-translator',
    'baybayin-translator',
    'samoan-to-english-translator',
    'albanian-to-english',
    'creole-to-english-translator',
    'cantonese-translator',
    'esperanto-translator',
    'ivr-translator',
  ],
  emotional: ['dog-translator', 'baby-translator'],
};

// 定义新的标题方案
const titleTemplates = {
  gaming: {
    funFacts: (language, game) => `${game}粉丝必懂的${language}解密技巧`,
    highlights: (language, game) => `专为${game}玩家设计的${language}翻译引擎`,
  },
  ancient: {
    funFacts: (language) => `${language}：探索古老文化的钥匙`,
    highlights: (language) => `学术级${language}翻译：研究必备的专业工具`,
  },
  emotional: {
    funFacts: (target) => `理解${target}的情感需求指南`,
    highlights: (target) => `识别${target}情感变化的智能翻译器`,
  },
};

// 语言和游戏名称映射
const nameMapping = {
  'al-bhed-translator': {
    language: 'Al Bhed',
    game: 'Final Fantasy X',
    target: null,
  },
  'high-valyrian-translator': {
    language: 'High Valyrian',
    game: 'Game of Thrones',
    target: null,
  },
  'gaster-translator': { language: 'Gaster', game: 'Undertale', target: null },
  'minion-translator': { language: 'Minionese', game: '小黄人', target: null },
  'gen-z-translator': { language: 'Gen Z', game: 'Z世代', target: null },
  'gen-alpha-translator': {
    language: 'Gen Alpha',
    game: 'α世代',
    target: null,
  },
  'aramaic-translator': { language: 'Aramaic', game: null, target: null },
  'cuneiform-translator': { language: 'Cuneiform', game: null, target: null },
  'ancient-greek-translator': {
    language: 'Ancient Greek',
    game: null,
    target: null,
  },
  'middle-english-translator': {
    language: 'Middle English',
    game: null,
    target: null,
  },
  'baybayin-translator': { language: 'Baybayin', game: null, target: null },
  'samoan-to-english-translator': {
    language: 'Samoan',
    game: null,
    target: null,
  },
  'albanian-to-english': { language: 'Albanian', game: null, target: null },
  'creole-to-english-translator': {
    language: 'Creole',
    game: null,
    target: null,
  },
  'cantonese-translator': { language: 'Cantonese', game: null, target: null },
  'esperanto-translator': { language: 'Esperanto', game: null, target: null },
  'ivr-translator': { language: 'IVR', game: null, target: null },
  'dog-translator': { language: null, game: null, target: '狗狗' },
  'baby-translator': { language: null, game: null, target: '宝宝' },
};

// 获取工具分类
function getToolCategory(toolName) {
  for (const [category, tools] of Object.entries(toolCategories)) {
    if (tools.includes(toolName)) {
      return category;
    }
  }
  return null;
}

// 更新JSON文件
function updateJsonFile(filePath, toolName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);

    const category = getToolCategory(toolName);
    if (!category) {
      console.log(`未找到工具 ${toolName} 的分类`);
      return;
    }

    const names = nameMapping[toolName];
    const pageKey = Object.keys(json)[0];
    const pageData = json[pageKey];

    // 更新FunFacts标题
    if (pageData.funFacts && pageData.funFacts.title) {
      pageData.funFacts.title = titleTemplates[category].funFacts(
        names.language,
        names.game,
        names.target
      );
      console.log(`更新 ${toolName} FunFacts 标题: ${pageData.funFacts.title}`);
    } else if (pageData.funfacts && pageData.funfacts.title) {
      pageData.funfacts.title = titleTemplates[category].funFacts(
        names.language,
        names.game,
        names.target
      );
      console.log(`更新 ${toolName} funfacts 标题: ${pageData.funfacts.title}`);
    }

    // 更新Highlights标题
    if (pageData.highlights && pageData.highlights.title) {
      pageData.highlights.title = titleTemplates[category].highlights(
        names.language,
        names.game,
        names.target
      );
      console.log(
        `更新 ${toolName} Highlights 标题: ${pageData.highlights.title}`
      );
    }

    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`✅ 已更新 ${filePath}`);
  } catch (error) {
    console.error(`❌ 更新文件失败 ${filePath}:`, error.message);
  }
}

// 处理所有文件
const messagesDir =
  '/Users/jason-chen/Downloads/project/vibetrans/messages/pages';
const processedFiles = [];

// 遍历所有工具目录
fs.readdirSync(messagesDir, { withFileTypes: true }).forEach((dirent) => {
  if (dirent.isDirectory()) {
    const toolDir = dirent.name;
    const enJsonPath = path.join(messagesDir, toolDir, 'en.json');

    if (fs.existsSync(enJsonPath)) {
      updateJsonFile(enJsonPath, toolDir);
      processedFiles.push(toolDir);
    }
  }
});

console.log(`\n🎉 处理完成! 共处理了 ${processedFiles.length} 个文件`);
console.log('处理的工具:', processedFiles.join(', '));
