#!/usr/bin/env node
import path from 'path';
import fs from 'fs/promises';
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'ogham-translator',
  whatIs: {
    title: 'What is Ogham Translator',
    content:
      'Ogham Translator is a web-based tool that converts modern text to and from the ancient Irish Ogham script. It features voice input, file uploads, and typographic downloads to facilitate easy and accurate translations.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        "Each Ogham letter traditionally corresponds to a tree, like B = Beith (Birch). Known as the 'Celtic Tree Alphabet'.",
    },
    {
      title: 'Fun Fact',
      content:
        "The Ogham block in Unicode is U+1680–U+169F, with U+1680 'Ogham Space Mark' being the only space character.",
    },
  ],
  userInterests: [
    {
      title: 'Ogham vs. Viking Runes',
      content:
        "Ogham and Viking Runes: both ancient scripts, but each carries unique vibes. Ogham, the tree-whisperer, whispers tales of Celtic lore. Viking Runes, the Norse warriors' graffiti, shout epic sagas. With VibeTrans, dive into this clash of cultures and unlock the stories etched in stone.",
    },
    {
      title: 'Ogham for Tattoos',
      content:
        'Looking to ink some ancient vibes? Ogham tattoos offer a unique way to wear your story. With VibeTrans, easily convert your chosen words into these ancient Celtic symbols. Perfect for those wanting a dash of mystery and history on their skin. Why not go old-school?',
    },
    {
      title: 'Interactive Ogham Timeline',
      content:
        'Dive into the VibeTrans Interactive Ogham Timeline, where ancient Celtic scripts meet digital wizardry. Explore the evolution of Ogham with a twist, featuring quirky anecdotes and random tidbits. This playful journey reveals the roots of a language that once whispered through the forests.',
    },
    {
      title: 'Tree Lore Connection',
      content:
        "Dive into the quirky world of Celtic trees with VibeTrans. Each Ogham symbol connects to unique tree lore. Ever heard of the Alder's link to courage or the Oak's might? These ancient symbols are not just letters; they're whispers of history waiting to be decoded.",
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
    'ogham-translator',
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
