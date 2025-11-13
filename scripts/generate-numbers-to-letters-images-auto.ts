#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'numbers-to-letters',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is a transformative feature offered by VibeTrans that converts numerical data into textual representation. This function is crucial in enhancing data accessibility and comprehension, particularly in fields like finance, education, and data analysis. By transforming numbers into words, VibeTrans enables more intuitive communication and understanding, making it easier for users to interpret complex datasets and generate insights, ultimately improving decision-making processes.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Early phone keypads didn't assign letters to 0 and 1 to avoid confusion with emergency numbers. VibeTrans transforms numbers to letters, reminiscent of ancient secret codes like A1Z26.",
    },
    {
      title: 'Fun Fact',
      content:
        "Did you know VibeTrans leverages the A1Z26 method, originally a child's 'secret language,' to convert numbers to letters? This simple cipher associates A with 1 and Z with 26.",
    },
  ],
  userInterests: [
    {
      title: 'Numerology Insights',
      content:
        'Unlock the mysteries of numbers with VibeTrans. Ever wondered if your lucky number holds hidden secrets? Dive into the quirky world of numerology, where digits dance and destiny unfolds. Discover if the universe has a cosmic high-five waiting for you.',
    },
    {
      title: 'Batch Processing',
      content:
        "Transform numbers into letters effortlessly with VibeTrans. Experience the magic of batch processing, where massive data sets become child's play. Whether decoding secret messages or just having a laugh, this feature is your go-to. VibeTrans brings the fun back to data handling!",
    },
    {
      title: 'Security Uses',
      content:
        'In a world where security is tighter than a drum, VibeTrans offers a quirky twist by converting numbers to letters. This method enhances password strength by adding an extra layer of cryptographic funkiness, making unauthorized access tougher than a two-dollar steak.',
    },
    {
      title: 'Educational Tool',
      content:
        "Transform numbers into letters with VibeTrans, a nifty tool that makes learning a breeze. Whether you're decoding secret messages or jazzing up math lessons, this cool gadget turns the mundane into magic. Boost creativity and engagement with every digit-turned-letter. VibeTrans: where numbers find their groove.",
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
    'numbers-to-letters',
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
