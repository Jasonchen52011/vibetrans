#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'baybayin-translator',
  whatIs: {
    title: 'What is Baybayin Translator',
    content:
      'Baybayin Translator is an intuitive tool designed to convert Latin script into Baybayin, an ancient Filipino script. It enables users to explore cultural heritage and linguistic history effortlessly. With VibeTrans technology, this translator offers seamless integration into educational platforms and creative applications, fostering both learning and artistic expression. It empowers users to create personalized messages and artistic designs, bridging the gap between the past and present through innovative script translation.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Did you know Baybayin was almost forgotten? Thanks to tools like VibeTrans, people are rediscovering this artistic script. I think that's pretty rad!",
    },
    {
      title: 'Fun Fact',
      content:
        'Baybayin has only 14 characters, making it one of the most concise scripts. With VibeTrans, learning it feels like a breeze!',
    },
  ],
  userInterests: [
    {
      title: 'Why Learn Baybayin?',
      content:
        'Looking for something unique that stands out from the crowd? Try learning Baybayin! This ancient Filipino script has a mystical charm that instantly makes you a cultural expert. VibeTrans makes translation effortless, serving as your time machine to the ancient world! Trust me, mastering Baybayin will make you the conversation king at any party!',
    },
    {
      title: 'Who Can Use It?',
      content:
        'Want to show off something fresh to your social circle? VibeTrans is your perfect choice! Whether you\'re a culture enthusiast, language learner, or someone who wants to impress friends with unique conversations, everyone can find joy here. Express yourself with Baybayin script and become the superstar of your social circle!',
    },
    {
      title: 'Beyond Translation',
      content:
        'VibeTrans is more than just a translation tool; it\'s a cultural bridge! Imagine the unique magic when your English name is written in Baybayin. It\'s like an interesting fusion of modern life and ancient traditions. Experience this cultural collision firsthand, and you\'ll discover the hidden stories behind letters, making you exclaim: wow, translation can be this fascinating!',
    },
    {
      title: 'Inspire Creativity',
      content:
        'Hey, creative minds! VibeTrans isn\'t just a translation tool; it\'s your inspiration station! Spark new ideas with Baybayin letters - who says ancient scripts can\'t be trendy? Express your creativity freely, feeling like you\'re writing with magic. Every use is like starting a fantasy journey, truly fun! Are you ready?',
    },
  ],
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: true,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(
    process.cwd(),
    '.tool-generation',
    'baybayin-translator',
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
