#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'samoan-to-english-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is a specialized tool that translates Samoan to English, facilitating seamless communication across languages. With VibeTrans, users can easily convert text and speech, enhancing understanding in educational, business, and travel scenarios. Its intuitive interface and real-time translation capabilities make it ideal for both casual users and professionals, ensuring accurate and quick translations. VibeTrans empowers users to bridge language barriers, fostering global connections and cultural exchange.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'Did you know Samoan has one of the smallest alphabets with just 14 consonants and 5 vowels? VibeTrans makes sure you pronounce them all correctly!',
    },
    {
      title: 'Fun Fact',
      content:
        "Samoan word order differs from English, using Verb–Subject–Object. VibeTrans takes care of this so you don't have to scratch your head over it.",
    },
  ],
  userInterests: [
    {
      title: 'Cultural Context Matters',
      content:
        '翻译不仅仅是词语的转化，更是心灵的共振。Samoan 和 English 不只是两种语言，它们是两种文化的舞蹈。VibeTrans 不仅让你读懂，还能让你感受。毕竟，谁不想在语言的海洋中乘风破浪呢？加入我们，感受文化的脉动吧！',
    },
    {
      title: 'Pronunciation Prowess',
      content:
        "Ever tried saying 'Talofa' and ended up with a perplexed audience? We've all been there! But with VibeTrans, you'll sound like a Samoan native in no time. Our app deciphers those tricky phonetics, turning your tongue twisters into smooth, eloquent expressions. It's like having a linguistic party in your pocket. So, why not give it a whirl? Your Samoan skills will thank you!",
    },
    {
      title: 'Bulk Translation Made Easy',
      content:
        "Ever tried translating a mountain of Samoan text to English and felt like you're drowning in a sea of words? Fear not! VibeTrans is your lifebuoy. It's like having a personal translator who never sleeps or complains. Why sweat the small stuff when VibeTrans effortlessly handles the heavy lifting? Dive in, and let the word waves carry you!",
    },
    {
      title: 'Privacy You Can Trust',
      content:
        '在 VibeTrans，我们像守护秘密的猫头鹰一样守护您的隐私。这就像把您的小秘密锁在一个保险箱里，连我们都不瞄一眼。毕竟，谁不想在翻译时保持一点神秘感呢？在瞬息万变的数字世界中，信任就像黄金，稀有而珍贵。',
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
    'samoan-to-english-translator',
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
