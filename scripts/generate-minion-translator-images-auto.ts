#!/usr/bin/env node
import type { ArticleSections } from '../src/lib/article-illustrator/types';
import { generateArticleIllustrations } from '../src/lib/article-illustrator/workflow';

const sections: ArticleSections = {
  toolName: 'minion-translator',
  whatIs: {
    title: 'What is XXXX',
    content:
      'XXXX is a unique translation tool provided by VibeTrans, designed to convert text into the playful language of Minions. This feature brings a fun twist to communication, making it ideal for parties, social media engagement, and creative storytelling. Users can input any text and see it transformed instantly into Minion-speak, adding humor and imagination to everyday conversations. VibeTrans ensures an enjoyable, seamless experience with its easy-to-use interface.',
  },
  funFacts: [
    {
      title: 'Fun Fact',
      content:
        '你知道吗？小黄人的语言混搭多种语言元素，导演 Pierre Coffin 一手包办配音，真是超级才华！VibeTrans 让你轻松翻译这种让人忍俊不禁的 Minionese！',
    },
    {
      title: 'Fun Fact',
      content:
        '你知道吗？小黄人的 Minionese 语言是由导演 Pierre Coffin 用多国语言混搭创造的。VibeTrans 让你轻松翻译这种趣味语言，真是太有趣了！',
    },
  ],
  userInterests: [
    {
      title: 'Audio Pronunciation',
      content:
        '想知道小黄人是怎么说话的吗？VibeTrans 的音频发音功能就像一台魔法机，能让你瞬间变成小黄人语言大师！无论是搞笑派对还是私人聚会，用这种萌翻天的方式，绝对会成为全场焦点。偷偷告诉你，我第一次听到就笑到肚子疼！赶快试试吧！',
    },
    {
      title: 'Educational Use',
      content:
        '想让学习变得轻松又有趣？VibeTrans 帮你搞定！用 Minion 语翻译，课堂瞬间变成欢乐派对！寓教于乐，笑着学知识，谁说不能两全其美？试试看，或许下一个语言天才就是你！生活太短，何必太严肃？让学习有点疯狂吧！',
    },
    {
      title: 'Privacy and Security',
      content:
        '在VibeTrans，我们可不是随便忽悠的。你的隐私就像小黄人的香蕉，绝对不容侵犯！我们用最顶级的加密技术，确保你所有的翻译内容都安全无虞。毕竟，谁也不想让自己的“小秘密”被窥探，不是吗？放心使用，安心聊天，VibeTrans为你保驾护航！',
    },
    {
      title: 'Mobile-Friendly',
      content:
        '嘿，VibeTrans 让翻译像刷抖音一样简单！无论你在地铁上还是咖啡馆里，只需手指一点，就能畅游全球语言。谁还需要厚重的词典呢？这一切都能在手机上搞定，真是懒人福音！爱上这款应用不是没有道理的，对吧？',
    },
  ],
};

async function main() {
  const result = await generateArticleIllustrations(sections, {
    captureHowTo: false,
  });

  if (result.success) {
    console.log('✅ 图片生成成功');
    process.exit(0);
  } else {
    console.error('❌ 图片生成失败');
    process.exit(1);
  }
}

main();
