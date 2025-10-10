/**
 * Batch Update Avatar and User Count for All Tool Pages
 */

import fs from 'fs';
import path from 'path';

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

function updatePageAvatars(config: PageConfig): void {
  const pagePath = path.join(
    process.cwd(),
    `src/app/[locale]/(marketing)/(pages)/${config.page}/page.tsx`
  );

  if (!fs.existsSync(pagePath)) {
    console.log(`❌ Page not found: ${config.page}`);
    return;
  }

  let content = fs.readFileSync(pagePath, 'utf-8');

  // Find the avatar section
  const avatarSectionRegex =
    /<div className="flex -space-x-3">([\s\S]*?)<\/div>/;
  const userCountRegex = /from \d+,\d+\+ happy users/;

  // Generate new avatar HTML
  const newAvatarHTML = config.avatars
    .map(
      (avatar, index) => `
                <div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
                  <img
                    src="/images/avatars/${avatar}.webp"
                    alt="User ${index + 1}"
                    className="h-full w-full object-cover"
                  />
                </div>`
    )
    .join('');

  // Replace avatars
  content = content.replace(
    avatarSectionRegex,
    `<div className="flex -space-x-3">${newAvatarHTML}
              </div>`
  );

  // Replace user count
  content = content.replace(
    userCountRegex,
    `from ${config.userCount} happy users`
  );

  fs.writeFileSync(pagePath, content, 'utf-8');
  console.log(
    `✅ Updated: ${config.page} (${config.userCount}, ${config.avatars.join(', ')})`
  );
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🎨 Batch Update Avatar and User Count');
  console.log('='.repeat(70) + '\n');

  let successCount = 0;
  let failCount = 0;

  for (const config of pageConfigs) {
    try {
      updatePageAvatars(config);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed to update ${config.page}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successfully updated: ${successCount}/${pageConfigs.length}`);
  console.log(`❌ Failed: ${failCount}/${pageConfigs.length}`);
  console.log('='.repeat(70) + '\n');
}

main();
