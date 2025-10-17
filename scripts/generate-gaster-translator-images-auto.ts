#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'gaster-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is an innovative translation tool developed by VibeTrans, designed to seamlessly convert complex text into comprehensible language. Its advanced algorithms and user-friendly interface cater to both professionals and casual users, enhancing communication across diverse fields such as education, business, and travel. With real-time translations and support for multiple languages, XXXX ensures accuracy and efficiency, making it an indispensable tool for anyone looking to break language barriers effortlessly.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'VibeTrans 提示：Dr. W. D. Gaster 的名字源于 Wingdings 和 Aster 字体。奇妙的是，早期浏览器显示 Gaster 文本为空框，真是一种复古的幽默！',
    },
    {
      title: 'Fun Fact',
      content:
        'VibeTrans 让你畅玩 Gaster 翻译！你知道吗？Gaster 的名字灵感来自 Wingdings 字体，它的对话总是大写的符号——复古浏览器常解码成空框，真是个有趣的梗！',
    },
  ],
  userInterests: [
    {
      title: 'Wingdings on Mobile',
      content:
        '还记得在电脑上用Wingdings解密“神秘符号”的乐趣吗？在手机上，这种体验依然奇妙！VibeTrans让你随时随地重温这种乐趣。虽然我也曾被这些符号绊住，但那种解码成功的成就感，无与伦比！所以，别再犹豫，赶紧体验吧，或许你会发现隐藏的“宝藏”哦！',
    },
    {
      title: 'Gaster Easter Eggs',
      content:
        '你有没有注意过Gaster的那些古怪小细节？嘿，这可不是普通的翻译工具，它就像是VibeTrans里的一个奇幻彩蛋！从字符跳跃到神秘代码，每次使用都像在解密一场小冒险。真心觉得，Gaster让翻译这件事有了些许魔法，谁不爱点小惊喜呢？',
    },
    {
      title: 'API for Developers',
      content:
        '嘿，开发者！VibeTrans 的 API 就像一杯现磨咖啡，让你的项目瞬间满血复活。无缝集成、简单调用，简直是科技界的灵魂伴侣！快速上手，省去繁琐的代码调试，直接进入创意的快车道。相信我，这款 API 是你代码生涯的最佳拍档！',
    },
    {
      title: 'Privacy Matters',
      content:
        '嘿，谁不想自己的秘密稳如磐石？在这个信息铺天盖地的时代，VibeTrans 就像你的数字保镖，时刻护卫你的隐私。把心放肚子里吧！那些想窥探你信息的小家伙，见了我们也只能望洋兴叹。因为在 VibeTrans，保护隐私不是选项，而是使命。',
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
    'gaster-translator',
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
