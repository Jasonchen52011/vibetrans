#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'aramaic-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is a sophisticated tool designed to translate Aramaic texts seamlessly into modern languages. By utilizing advanced algorithms and linguistic expertise, it ensures high accuracy and context comprehension. Ideal for scholars, historians, and enthusiasts, XXXX simplifies the translation process, preserving cultural heritage. With VibeTrans technology, users gain access to intuitive features that enhance productivity and understanding, making it an essential resource for bridging ancient and contemporary worlds.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Aramaic has been around for over 3,000 years! I think that's super cool because it connects us to ancient times. VibeTrans makes it easy to explore this rich history.",
    },
    {
      title: 'Fun Fact',
      content:
        "Aramaic has been used for over 3,000 years and influenced scripts like Hebrew and Arabic. VibeTrans makes translating this ancient language a breeze—it's like chatting with history!",
    },
  ],
  userInterests: [
    {
      title: 'Dialect-Specific Translations',
      content:
        "Ever wondered how Aramaic from different regions sounds? With VibeTrans, it's like tuning into a cultural radio! Picture this: an ancient party where dialects chat like old pals. Some say it's like hearing music where you least expect it. Dive in, and you'll be the cool cat with Aramaic dialects in your back pocket!",
    },
    {
      title: 'Tattoo Translation Pitfalls',
      content:
        '想在皮肤上留个亚拉姆语纹身？小心别把"勇气"纹成"咖喱鸡"！在VibeTrans，我们见过太多这样的翻车故事。信任专业，避免尴尬，毕竟纹身可不是随便涂鸦。让你的纹身在酒吧里成为话题，而不是笑话！',
    },
    {
      title: 'Certified Human Translators',
      content:
        '在VibeTrans，我们的认证人类翻译员就像语言的摇滚明星！他们不仅能把亚拉姆语翻得像本地人，还能让你的文本充满活力和个性。没有机器翻译的呆板，这些翻译员让每个词句都跳动着节奏。想要与众不同的翻译体验？我们的翻译团队绝对是你的好伙伴！',
    },
    {
      title: 'Interactive Transliteration',
      content:
        '你有没有想过，原来翻译也能像弹钢琴一样有趣？VibeTrans 的「Interactive Transliteration」就是这样一个神奇的工具！它能让古老的亚拉姆语瞬间变得栩栩如生，打破你对语言的传统印象。加入我们，体验一把语言魔术，别再让翻译成为枯燥的任务，来场文字的奇幻之旅吧！',
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
    'aramaic-translator',
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
