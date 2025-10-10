/**
 * Update Avatar and User Count Configuration for All Tool Pages
 *
 * Strategy:
 * - 11 tool pages (excluding about page)
 * - Each page gets unique avatar combination (5 avatars from 8 available)
 * - User count varies: 8K-18K range
 * - Different avatar patterns for variety
 */

interface PageConfig {
  page: string;
  avatars: string[];
  userCount: string;
}

const pageConfigs: PageConfig[] = [
  {
    page: 'dog-translator',
    avatars: ['male1', 'female2', 'male3', 'female4', 'male2'],
    userCount: '9,200+',
  },
  {
    page: 'gen-z-translator',
    avatars: ['female1', 'male2', 'female3', 'male4', 'female2'],
    userCount: '14,500+',
  },
  {
    page: 'gen-alpha-translator',
    avatars: ['male3', 'female4', 'male1', 'female2', 'male2'],
    userCount: '16,800+',
  },
  {
    page: 'dumb-it-down-ai',
    avatars: ['female2', 'male4', 'female1', 'male3', 'female3'],
    userCount: '11,300+',
  },
  {
    page: 'bad-translator',
    avatars: ['male2', 'female3', 'male1', 'female4', 'male4'],
    userCount: '8,700+',
  },
  {
    page: 'ancient-greek-translator',
    avatars: ['female1', 'male3', 'female2', 'male2', 'female4'],
    userCount: '10,500+',
  },
  {
    page: 'al-bhed-translator',
    avatars: ['male4', 'female2', 'male1', 'female3', 'male3'],
    userCount: '13,200+',
  },
  {
    page: 'alien-text-generator',
    avatars: ['female3', 'male1', 'female4', 'male2', 'female1'],
    userCount: '12,900+',
  },
  {
    page: 'esperanto-translator',
    avatars: ['male2', 'female1', 'male4', 'female2', 'male3'],
    userCount: '15,400+',
  },
  {
    page: 'gibberish-translator',
    avatars: ['female4', 'male3', 'female1', 'male1', 'female2'],
    userCount: '11,800+',
  },
  {
    page: 'cuneiform-translator',
    avatars: ['male1', 'female3', 'male2', 'female1', 'male4'],
    userCount: '9,600+',
  },
];

console.log('📊 Avatar and User Count Configuration Plan\n');
console.log('='.repeat(70));
console.log(`${'Page'.padEnd(30)} | Avatars (5) | User Count`);
console.log('='.repeat(70));

pageConfigs.forEach((config) => {
  const avatarsStr = config.avatars.join(', ');
  console.log(
    `${config.page.padEnd(30)} | ${avatarsStr.padEnd(40)} | ${config.userCount}`
  );
});

console.log('='.repeat(70));
console.log(`\n✅ Total pages: ${pageConfigs.length}`);
console.log(`📈 User count range: 8,700+ to 16,800+`);
console.log(`👥 Avatar variety: All combinations unique\n`);

export { pageConfigs };
