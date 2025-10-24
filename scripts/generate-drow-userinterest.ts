#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';

// Drow Translator userInterest 内容生成器
const generateUserInterestContent = async () => {
  console.log(
    '🎨 重新生成 Drow Translator - Team Use Drow Translator For 内容\n'
  );

  // 读取现有英文内容
  const enPath = path.join(
    process.cwd(),
    'messages/pages/drow-translator/en.json'
  );
  const zhPath = path.join(
    process.cwd(),
    'messages/pages/drow-translator/zh.json'
  );

  try {
    // 新的 userInterest 内容（英文）
    const newEnContent = {
      title: 'Team Use Drow Translator For',
      items: [
        {
          title: 'D&D Campaign Development',
          description:
            'Elevate your Dungeons & Dragons campaigns with authentic Dark Elf dialogue and lore. Create immersive Underdark adventures, develop complex Drow NPCs with distinct personalities, and craft political intrigue that captures the sophisticated social dynamics of Dark Elf society. Perfect for Dungeon Masters seeking to add depth and authenticity to their fantasy worlds.',
          image: '/images/docs/drow-translator-interest-1.webp',
          imageAlt: 'D&D campaign development with Drow language tools',
        },
        {
          title: 'Fantasy World Building',
          description:
            'Build rich fantasy worlds with linguistically accurate Dark Elf civilizations. Design entire cities, create unique dialects for different Drow houses, develop religious texts for Lolth worship, and establish cultural practices that resonate with readers. Essential for authors crafting elaborate fantasy universes with detailed linguistic foundations.',
          image: '/images/docs/drow-translator-interest-2.webp',
          imageAlt: 'Fantasy world building with authentic Drow cultures',
        },
        {
          title: 'Video Game Development',
          description:
            "Integrate authentic Drow language and culture into your video game projects. Perfect for RPG developers creating Dark Elf companions, quest dialogues, faction interactions, and environmental storytelling. Use our translator to ensure linguistic consistency across your game's narrative elements and create memorable NPC interactions.",
          image: '/images/docs/drow-translator-interest-3.webp',
          imageAlt: 'Video game development with Drow language integration',
        },
        {
          title: 'Educational & Creative Projects',
          description:
            'Explore constructed languages and creative writing through Drow linguistics. Ideal for students studying fantasy linguistics, educators teaching creative writing, and artists developing character backgrounds. Use our translator to understand language construction, cultural development, and creative expression through fictional languages.',
          image: '/images/docs/drow-translator-interest-4.webp',
          imageAlt: 'Educational projects featuring Drow language studies',
        },
      ],
    };

    // 新的 userInterest 内容（中文）
    const newZhContent = {
      title: '团队使用卓精灵语翻译器的场景',
      items: [
        {
          title: 'D&D 战役开发',
          description:
            '通过真实的黑暗精灵对话和传说提升您的《龙与地下城》战役。创造沉浸式的幽暗地域冒险，开发具有鲜明个性的复杂卓精灵NPC，并捕捉卓精灵社会复杂社会动态的政治阴谋。完美适合寻求为奇幻世界增添深度和真实性的地下城主。',
          image: '/images/docs/drow-translator-interest-1.webp',
          imageAlt: '使用卓精灵语言工具进行D&D战役开发',
        },
        {
          title: '奇幻世界构建',
          description:
            '构建具有语言学准确性黑暗精灵文明的丰富奇幻世界。设计整个城市，为不同卓精灵家族创造独特的方言，开发罗斯信仰的宗教文本，并建立与读者产生共鸣的文化实践。对于构建具有详细语言学基础的精美奇幻宇宙的作家至关重要。',
          image: '/images/docs/drow-translator-interest-2.webp',
          imageAlt: '带有真实卓精灵文化的奇幻世界构建',
        },
        {
          title: '视频游戏开发',
          description:
            '将真实的卓精灵语言和文化整合到您的视频游戏项目中。完美适合创建黑暗精灵伙伴、任务对话、派系互动和环境叙事的RPG开发者。使用我们的翻译器确保游戏叙事元素的语言一致性，创造难忘的NPC互动。',
          image: '/images/docs/drow-translator-interest-3.webp',
          imageAlt: '整合卓精灵语言的视频游戏开发',
        },
        {
          title: '教育与创意项目',
          description:
            '通过卓精灵语言学探索构词语言和创意写作。非常适合研究奇幻语言学的学生、教授创意写作的教育工作者，以及开发角色背景的艺术家。使用我们的翻译器理解语言构建、文化发展和通过虚构语言的创意表达。',
          image: '/images/docs/drow-translator-interest-4.webp',
          imageAlt: '以卓精灵语言研究为特色的教育项目',
        },
      ],
    };

    // 更新英文文件
    const enData = JSON.parse(await fs.readFile(enPath, 'utf-8'));
    enData.DrowTranslatorPage.userInterest = newEnContent;
    await fs.writeFile(enPath, JSON.stringify(enData, null, 2));
    console.log('✅ 英文内容已更新');

    // 更新中文文件
    const zhData = JSON.parse(await fs.readFile(zhPath, 'utf-8'));
    zhData.DrowTranslatorPage.userInterest = newZhContent;
    await fs.writeFile(zhPath, JSON.stringify(zhData, null, 2));
    console.log('✅ 中文内容已更新');

    console.log('\n🎉 Drow Translator userInterest 部分内容重新生成完成！');
    console.log('\n📋 新内容包括：');
    console.log('1. D&D 战役开发 - 面向地下城主');
    console.log('2. 奇幻世界构建 - 面向作家');
    console.log('3. 视频游戏开发 - 面向游戏开发者');
    console.log('4. 教育与创意项目 - 面向学生和教育工作者');
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
};

// 运行生成器
generateUserInterestContent().catch(console.error);
