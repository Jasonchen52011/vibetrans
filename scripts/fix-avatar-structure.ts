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
    userCount: '14,600+',
  },
  {
    page: 'gen-alpha-translator',
    avatars: ['male3', 'female4', 'male1', 'female2', 'male4'],
    userCount: '16,800+',
  },
  {
    page: 'dumb-it-down-ai',
    avatars: ['female2', 'male3', 'female1', 'male4', 'female3'],
    userCount: '10,500+',
  },
  {
    page: 'bad-translator',
    avatars: ['male2', 'female3', 'male1', 'female4', 'male4'],
    userCount: '8,700+',
  },
  {
    page: 'ancient-greek-translator',
    avatars: ['female3', 'male4', 'female2', 'male1', 'female1'],
    userCount: '12,300+',
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

const BASE_PATH =
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)';

function generateAvatarHTML(avatars: string[], useSpaces = false): string {
  const indent = useSpaces ? '  ' : '\t';
  const indent2 = useSpaces ? '    ' : '\t\t';
  const indent3 = useSpaces ? '      ' : '\t\t\t';

  return avatars
    .map(
      (
        avatar,
        index
      ) => `${indent2}<div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">
${indent3}<img
${indent3}${indent}src="/images/avatars/${avatar}.webp"
${indent3}${indent}alt="User ${index + 1}"
${indent3}${indent}className="h-full w-full object-cover"
${indent3}/>
${indent2}</div>`
    )
    .join('\n');
}

for (const config of pageConfigs) {
  const filePath = path.join(BASE_PATH, config.page, 'page.tsx');

  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Detect if file uses spaces or tabs
    const usesSpaces = content.includes(
      '              <div className="flex -space-x-3">'
    );
    const indent = usesSpaces ? '  ' : '\t';
    const indent2 = usesSpaces ? '    ' : '\t\t';

    // Generate the complete avatar section with correct indentation
    const avatarHTML = generateAvatarHTML(config.avatars, usesSpaces);

    const avatarSection = usesSpaces
      ? `            <div className="flex -space-x-3">
${avatarHTML}
            </div>`
      : `\t\t\t<div className="flex -space-x-3">
${avatarHTML}
\t\t\t</div>`;

    // Match the pattern from "Avatar Images" comment to the closing </div> before Stars section
    // This captures the entire broken avatar section
    const pattern =
      /(\s*{\/\* Avatar Images \*\/}\n)(\s*<div className="flex -space-x-3">[\s\S]*?)(\s*{\/\* Stars and Text \*\/})/;

    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${avatarSection}\n\n$3`);

      // Also update the user count
      content = content.replace(
        /from \d+,\d+\+ happy users/,
        `from ${config.userCount} happy users`
      );

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${config.page} (${config.userCount})`);
    } else {
      console.log(`⚠️  Pattern not found in: ${config.page}`);
    }
  } catch (error) {
    console.error(`❌ Failed to process ${config.page}:`, error);
  }
}

console.log('\n🎉 Avatar structure fix complete!');
