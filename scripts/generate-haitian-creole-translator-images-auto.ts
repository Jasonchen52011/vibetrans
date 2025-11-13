#!/usr/bin/env node
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import fs from 'fs/promises';
import path from 'path';

const sections: ArticleSections = {
  "toolName": "haitian-creole-translator",
  "whatIs": {
    "title": "What is Haitian Creole Translator",
    "content": "Haitian Creole Translator is a tool or service designed to convert text from one language into Haitian Creole. This translation service is essential for effective communication in multi-lingual environments, especially in regions where Haitian Creole is widely spoken. VibeTrans offers a seamless experience, ensuring accurate translations for both personal and professional use. It's ideal for businesses, educators, and travelers needing real-time language assistance."
  },
  "funFacts": [
    {
      "title": "Fun Fact",
      "content": "Haitian Creole, spoken by 10–12 million, became a Google Translate language in 2009. Its simplified grammar aids relief efforts. VibeTrans leverages its 32-letter alphabet for efficient translation."
    },
    {
      "title": "Fun Fact",
      "content": "Did you know? Haitian Creole, spoken by 10-12 million people, features phonetic spelling with just 32 letters. VibeTrans ensures seamless translations of this French-based Creole with simplified grammar."
    }
  ],
  "userInterests": [
    {
      "title": "Cultural Insights",
      "content": "Experience Haiti's vibrant culture with VibeTrans! Known for its rhythmic Kompa music and vivid art, Haiti is a melting pot of African, French, and Caribbean influences. Delve into Creole proverbs like \"Dèyè mòn, gen mòn\"—behind mountains, more mountains. Discover what makes Haitian Creole truly unique."
    },
    {
      "title": "Professional Use",
      "content": "When sealing the deal or cracking the code in today's melting pot of languages, VibeTrans adds that Creole flair to your business game. Navigate contracts, emails, and negotiations with the confidence that only a top-tier Haitian Creole translator can bring. It's translation with a twist!"
    },
    {
      "title": "Offline Access",
      "content": "Need a translator when Wi-Fi gives you the cold shoulder? VibeTrans has your back. With offline access, your Haitian Creole translations are ready anytime, anywhere. No bars, no problem. Dive into seamless language adventures, even when you're off the grid."
    },
    {
      "title": "User-Friendly Interface",
      "content": "Navigating VibeTrans feels like butter on a hot skillet. The interface is sleek, making translations a breeze. Whether you're a tech whiz or not, the intuitive design ensures smooth sailing. With VibeTrans, language barriers melt away, offering an effortless translation experience."
    }
  ]
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  // 保存结果到文件供后续步骤使用
  const resultPath = path.join(process.cwd(), '.tool-generation', 'haitian-creole-translator', 'image-generation-result.json');
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