#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "draconic-translator",
  "whatIs": {
    "title": "What is Draconic Translator",
    "content": "Draconic Translator is an online tool that converts English into various Draconic dialects. Ideal for fantasy role-players, it supports text, speech, and image translations, ensuring seamless integration with your gaming needs."
  },
  "funFacts": [
    {
      "title": "Ancient Language Origins",
      "content": "Draconic is considered one of the oldest languages, with dragons believing other languages are its derivatives. [Learn more](https://en.wikipedia.org/wiki/Draconic_language)"
    },
    {
      "title": "Draconic and Abyssal Scripts",
      "content": "In D&D 4e, Abyssal was written using the Iokharic alphabet, the same as Draconic, creating amusing fan theories. [Explore further](https://dnd.wizards.com/)"
    }
  ],
  "userInterests": [
    {
      "title": "Custom Dictionary Imports",
      "content": "VibeTrans elevates your experience with Custom Dictionary Imports. Tailor your translations by uploading bespoke word lists, ensuring your content vibes with your audience. Whether you’re dealing with industry jargon or quirky slang, seamlessly integrate them to keep your communication top-notch and relevant."
    },
    {
      "title": "Immersive Mode Feature",
      "content": "Unleash the power of VibeTrans with the Immersive Mode. Dive headfirst into the language and culture, getting the lowdown like a local. This feature offers real-world scenarios and slang, making your translations as fresh as a daisy and on point."
    },
    {
      "title": "Batch Document Translation",
      "content": "Tired of translating documents one by one? VibeTrans turns the grind into a breeze with Batch Document Translation. Seamlessly translate multiple files at once, ensuring consistency and saving time. Perfect for busy bees needing swift, reliable translations without breaking a sweat."
    },
    {
      "title": "Diverse Dialect Support",
      "content": "VibeTrans takes dialect diversity seriously, embracing every twist and turn of language quirks. Whether it's Southern drawls or Cockney rhymes, we've got your back. Our translator turns linguistic chaos into seamless clarity, ensuring no phrase gets lost in translation. Dive into dialects without breaking a sweat!"
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'draconic-translator', 'image-generation-result.json');
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