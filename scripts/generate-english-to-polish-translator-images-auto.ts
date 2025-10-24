#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'english-to-polish-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      "XXXX is a sophisticated English to Polish translation tool designed to bridge language gaps seamlessly. Powered by VibeTrans, it offers real-time translations with high accuracy, catering to both casual users and professionals. Whether you're traveling, working on international projects, or learning Polish, this tool ensures effective communication. VibeTrans stands out by providing contextual translations and user-friendly features, making it an essential companion for global interactions.",
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        'VibeTrans 将英语翻译成波兰语面临挑战，因为波兰语的七个语法格和十五种性别-数量组合。波兰语也有九个带变音符号的特殊字符，使翻译更加复杂。',
    },
    {
      title: 'Fun Fact',
      content:
        "VibeTrans 面对波兰语复杂的七种语法格和十五种性别-数组合的挑战，使翻译变得有趣。波兰语中充满了像 'konstantynopolitańczykowianeczka' 这样的长词，挑战着机器翻译的极限！",
    },
  ],
  userInterests: [
    {
      title: 'Grammar Insights',
      content:
        "VibeTrans揭秘英语与波兰语的语法迷思：在英语中，'I am reading'可能就是波兰语的'Czytam'。波兰语的时态更简洁，常让英语学习者感叹！随着VibeTrans的帮助，语法不再是障碍，而是探索语言之美的有趣旅程。",
    },
    {
      title: 'Contextual Examples',
      content:
        "Navigating the nuances between English and Polish? VibeTrans has your back. Consider 'break a leg'—it's 'połamania nóg' in Polish, capturing the same encouraging spirit. Dive into unique phrases and bridge conversational gaps effortlessly with VibeTrans, your linguistic sidekick.",
    },
    {
      title: 'Professional Modes',
      content:
        'VibeTrans的专业模式让翻译如同变形金刚般切换自如。无论是商务会议还是浪漫信件，它都能用独特的波兰语风格打动对方。想要一份不一样的翻译体验？VibeTrans让每个字都有它的节拍。',
    },
    {
      title: 'Voice Input/Output',
      content:
        'VibeTrans 的语音输入/输出功能为翻译增添了酷炫的科技感。说出你的需求，听到你的答案，仿佛在科幻电影中。无需打字，让翻译更顺畅、更快捷。VibeTrans，让翻译不再是单调的任务。',
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
    'english-to-polish-translator',
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
