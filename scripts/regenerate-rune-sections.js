#!/usr/bin/env node

/**
 * 重新生成Rune Translator的funFacts和userInterest内容及图片
 */

const fs = require('node:fs/promises');
const path = require('node:path');

// 配置
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG = {
  publicDir: path.join(ROOT_DIR, 'public'),
  messagesDir: path.join(ROOT_DIR, 'messages'),
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * 生成图片提示词
 */
function generateImagePrompts() {
  return {
    funFacts: [
      {
        prompt:
          'Viking runes carved into ancient stone tablet, glowing with mystical blue energy, forest background, fantasy art style, highly detailed',
        filename: 'rune-ancient-carving-mystical.webp',
      },
      {
        prompt:
          'Norse warrior reading runes by campfire, ancient scroll with Elder Futhark symbols, warm firelight, dramatic atmosphere, digital painting',
        filename: 'rune-warrior-campfire-reading.webp',
      },
    ],
    userInterest: [
      {
        prompt:
          'Modern cosplayer with glowing rune accessories, fantasy costume convention, colorful lights, enthusiastic fans, event photography',
        filename: 'rune-cosplay-convention-modern.webp',
      },
      {
        prompt:
          'Tabletop gaming session with RPG dice and rune cards, friends playing Dungeons & Dragons, cozy room with fantasy decor, warm lighting',
        filename: 'rune-tabletop-gaming-friends.webp',
      },
      {
        prompt:
          'Digital artists collaborating on rune designs, modern studio with computers, creative workspace, team brainstorming, professional environment',
        filename: 'rune-artists-collaboration-studio.webp',
      },
      {
        prompt:
          'Live streamer setup with rune-themed channel branding, professional streaming equipment, RGB lighting, modern gaming setup',
        filename: 'rune-streamer-professional-setup.webp',
      },
    ],
  };
}

/**
 * 生成新的内容
 */
function generateNewContent() {
  return {
    funFacts: {
      title: 'Fascinating Rune Facts',
      items: [
        {
          title: 'Magical Origins',
          description:
            'Did you know? According to Norse mythology, runes were discovered by the god Odin after he hung himself from Yggdrasil, the World Tree, for nine nights. This divine origin story赋予runes mystical significance that continues to captivate modern enthusiasts!',
          image: '/images/docs/rune-ancient-carving-mystical.webp',
          imageAlt: 'Ancient mystical rune carving',
        },
        {
          title: 'Viking Communication',
          description:
            "Runes were more than just mystical symbols - they were the practical writing system of Vikings! Used for everything from marking ownership on tools to recording laws and telling epic stories. Imagine a Viking carving a love message on a rune stone - that's ancient romance right there!",
          image: '/images/docs/rune-warrior-campfire-reading.webp',
          imageAlt: 'Viking warrior reading runes',
        },
      ],
    },
    userInterest: {
      title: 'Discover Your Rune Journey',
      items: [
        {
          title: 'Convention Ready',
          description:
            'Stand out at the next comic con with authentic rune-translated accessories! Perfect for fantasy costumes, LARP events, and themed gatherings. Your fellow nerds will be totally impressed by your attention to linguistic detail!',
          image: '/images/docs/rune-cosplay-convention-modern.webp',
          imageAlt: 'Modern cosplay convention with rune themes',
        },
        {
          title: 'Game Night Enhanced',
          description:
            'Level up your tabletop RPG sessions with rune-inscribed props and character backgrounds. D&D dungeons, Pathfinder quests, or homebrew adventures - every game becomes more epic when ancient languages are part of the story!',
          image: '/images/docs/rune-tabletop-gaming-friends.webp',
          imageAlt: 'Friends playing tabletop games with runes',
        },
        {
          title: 'Creative Collaboration',
          description:
            'Join our vibrant community of rune enthusiasts! Share your translations, get feedback on projects, and collaborate with artists, writers, and game developers who love historical languages as much as you do!',
          image: '/images/docs/rune-artists-collaboration-studio.webp',
          imageAlt: 'Artists collaborating on rune designs',
        },
        {
          title: "Content Creator's Dream",
          description:
            'Transform your streams, videos, and social media with unique rune aesthetics. Perfect for fantasy gaming channels, educational content about history, or creative projects that need that extra touch of ancient mystery!',
          image: '/images/docs/rune-streamer-professional-setup.webp',
          imageAlt: 'Professional streaming setup with rune branding',
        },
      ],
    },
  };
}

/**
 * 更新JSON文件
 */
async function updateJsonFile() {
  const jsonPath = path.join(
    CONFIG.messagesDir,
    'pages',
    'rune-translator',
    'en.json'
  );

  try {
    const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
    const newContent = generateNewContent();

    // 更新funFacts和userInterest
    jsonContent.RuneTranslatorPage.funFacts = newContent.funFacts;
    jsonContent.RuneTranslatorPage.userInterest = newContent.userInterest;

    await fs.writeFile(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf-8');
    logSuccess('✅ JSON文件已更新');
  } catch (error) {
    logError(`❌ 更新JSON失败: ${error.message}`);
  }
}

/**
 * 创建图片生成脚本
 */
async function createImageGenerationScript() {
  const imagePrompts = generateImagePrompts();
  const scriptContent = `
// 自动生成的图片生成脚本
const imagePrompts = ${JSON.stringify(imagePrompts, null, 2)};

// 这里应该调用实际的图片生成API
// 每个prompt需要调用Volcano 4.0引擎生成图片
console.log('需要生成以下图片:');
Object.entries(imagePrompts).forEach(([section, prompts]) => {
  console.log(\`\\n\${section}:\`);
  prompts.forEach(({ prompt, filename }) => {
    console.log(\`- \${filename}: \${prompt}\`);
  });
});
`;

  const scriptPath = path.join(ROOT_DIR, 'scripts', 'generate-rune-images.js');
  await fs.writeFile(scriptPath, scriptContent, 'utf-8');
  logSuccess('✅ 图片生成脚本已创建');
}

/**
 * 主函数
 */
async function main() {
  log('🔄 重新生成Rune Translator funFacts和userInterest内容', 'bright');
  log('='.repeat(60), 'cyan');

  try {
    // 1. 更新JSON内容
    logInfo('\n📝 更新JSON内容...');
    await updateJsonFile();

    // 2. 创建图片生成脚本
    logInfo('\n🖼️  准备图片生成...');
    await createImageGenerationScript();

    // 3. 显示图片生成需求
    logInfo('\n📋 需要生成的图片:');
    const imagePrompts = generateImagePrompts();

    Object.entries(imagePrompts).forEach(([section, prompts]) => {
      log(`\n  ${section}:`, 'blue');
      prompts.forEach(({ prompt, filename }) => {
        log(`    - ${filename}`, 'yellow');
        log(`      ${prompt}`, 'cyan');
      });
    });

    log('\n' + '='.repeat(60), 'green');
    log('🎉 内容更新完成！', 'green');
    logInfo('下一步：手动调用图片生成API生成对应的图片文件');
  } catch (error) {
    logError(`❌ 处理失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行
main();
