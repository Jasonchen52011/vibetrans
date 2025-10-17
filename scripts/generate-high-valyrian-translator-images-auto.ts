#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'high-valyrian-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      "XXXX is an innovative tool designed to translate High Valyrian, a fictional language from the world of 'Game of Thrones'. Powered by VibeTrans, it offers users an engaging way to explore this ancient tongue. Whether you're a fan looking to enhance your experience or a language enthusiast eager to learn, XXXX provides accurate translations and pronunciation guides, making it an essential companion for both casual and dedicated users.",
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        '你知道吗？High Valyrian 拥有四个独特的语法性别，远比传统语言复杂。VibeTrans 让翻译这门《权力的游戏》语言变得轻松有趣，简直是语言学迷的福音！',
    },
    {
      title: 'Fun Fact',
      content:
        "VibeTrans 让你领略 High Valyrian 的魅力！这门《权力的游戏》语言有四种语法性别，让人想起复杂的魔法。谁不想用 'Dracarys' 点燃一切？",
    },
  ],
  userInterests: [
    {
      title: 'Accuracy Compared to Others',
      content:
        '在翻译领域，VibeTrans 就像那杯完美的早晨咖啡——总能让你振奋精神！它的高精度为您解锁 High Valyrian 的神秘面纱。虽说人无完人，但 VibeTrans 的表现却几乎让人无可挑剔。相信我，试过其他工具后，你会觉得 VibeTrans 是你的真命天子。',
    },
    {
      title: 'Marrying with High Valyrian',
      content:
        '想象在婚礼上用高等瓦雷利亚语说誓言，简直就是满满的浪漫加上点魔法！VibeTrans让这一切轻而易举。想要在宾客面前留下深刻印象？试试“Valar Morghulis”——虽然这句话意味着“凡人皆有一死”，但绝对可以引发一阵笑声！VibeTrans，带你进入语言的奇幻世界。',
    },
    {
      title: 'Learning Dialects',
      content:
        '想用High Valyrian俘获人心？VibeTrans让你轻松驾驭不同方言！听说有人用High Valyrian成功点了份巨龙餐，可别小瞧语言的魔力。每种方言都有它的独特魅力，像一场跨越维斯特洛的语言冒险。谁不想在聚会中用Valyrian俏皮地说“再来一杯”？VibeTrans，助你玩转语言新姿势！',
    },
    {
      title: 'Translate Modern Slang',
      content:
        '当代俚语实在是个奇妙的存在，是不是？有时候感觉就像走进了一个外星人的聚会！来试试我们的VibeTrans，帮你把这些潮流俚语翻译成高等瓦雷利亚语，保证让你瞬间变身语言大师。每次我看到“YOLO”变成高瓦，我都忍不住笑，太酷了吧！快来试试，感受一下这股神秘的语言魔力！',
    },
  ],
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'high-valyrian-translator',
    'image-generation-result.json'
  );
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ 图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();
