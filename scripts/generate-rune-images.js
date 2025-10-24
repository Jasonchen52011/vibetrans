// 自动生成的图片生成脚本
const imagePrompts = {
  funFacts: [
    {
      prompt:
        'Viking runes carved into ancient stone tablet, glowing with mystical blue energy, forest background, fantasy art style, highly detailed',
      filename: 'rune-ancient-carving-mystical.webp',
    },
    {
      prompt:
        'Norse warrior reading runes by campfire, ancient scroll with Elder Futhark symbols, warm firelight, dramatic atmosphere, digital painting',
      filename: 'rune-warrior-campfire-reading.webp',
    },
  ],
  userInterest: [
    {
      prompt:
        'Modern cosplayer with glowing rune accessories, fantasy costume convention, colorful lights, enthusiastic fans, event photography',
      filename: 'rune-cosplay-convention-modern.webp',
    },
    {
      prompt:
        'Tabletop gaming session with RPG dice and rune cards, friends playing Dungeons & Dragons, cozy room with fantasy decor, warm lighting',
      filename: 'rune-tabletop-gaming-friends.webp',
    },
    {
      prompt:
        'Digital artists collaborating on rune designs, modern studio with computers, creative workspace, team brainstorming, professional environment',
      filename: 'rune-artists-collaboration-studio.webp',
    },
    {
      prompt:
        'Live streamer setup with rune-themed channel branding, professional streaming equipment, RGB lighting, modern gaming setup',
      filename: 'rune-streamer-professional-setup.webp',
    },
  ],
};

// 这里应该调用实际的图片生成API
// 每个prompt需要调用Volcano 4.0引擎生成图片
console.log('需要生成以下图片:');
Object.entries(imagePrompts).forEach(([section, prompts]) => {
  console.log(`\n${section}:`);
  prompts.forEach(({ prompt, filename }) => {
    console.log(`- ${filename}: ${prompt}`);
  });
});
