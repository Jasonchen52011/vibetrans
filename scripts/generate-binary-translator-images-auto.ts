#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "binary-translator",
  "whatIs": {
    "title": "What is Binary Translator",
    "content": "Binary Translator is a tool that converts binary code into human-readable language and vice versa. VibeTrans offers an intuitive interface for developers, students, and tech enthusiasts to decode and encode binary data seamlessly. It is widely used in computer programming, data analysis, and digital communication to understand and manipulate binary information efficiently. VibeTrans enhances learning and development processes by providing accurate translations and simplifying complex binary operations."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "Did you know? The number 42, famous from Hitchhiker's Guide to the Galaxy, is represented as 101010 in binary—a perfect alternating pattern. Explore more with VibeTrans, your binary translator."
    },
    {
      "title": "Fun Fact",
      "content": "Did you know? VibeTrans shows that \"Hello World\" becomes a series of binary numbers! This digital language operates on 0s and 1s, resembling Morse code's dot-dash system."
    }
  ],
  "userInterests": [
    {
      "title": "Advanced Conversion Options",
      "content": "Unlock the full potential of VibeTrans with advanced conversion features. Dive into quirky settings like converting binary to Morse code or emoji. Tailor your experience with a flick of a switch, ensuring every conversion is as unique as your digital fingerprint."
    },
    {
      "title": "Visual Learning Aids",
      "content": "For those who vibe with visuals, VibeTrans offers a quirky twist on learning binary. Imagine binary as a dance of 0s and 1s, where each step reveals a hidden message. Dive into this visual symphony and decode the digital world with a touch of flair."
    },
    {
      "title": "Secure Data Handling",
      "content": "With VibeTrans, data security is as tight as Fort Knox. Forget sleepless nights worrying about your binary data; we've got it locked down tighter than a drum. Our cutting-edge encryption ensures your sensitive information stays under wraps, making breaches a thing of the past."
    },
    {
      "title": "Real-World Applications",
      "content": "From decoding secret messages to nerding out on binary puzzles, binary translators are nifty tools. VibeTrans offers a unique spin, turning complex binary into plain text in a jiffy. Useful for tech wizards or code enthusiasts looking to spice up their digital game."
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'binary-translator', 'image-generation-result.json');
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