import fs from 'fs';
import path from 'path';

const pages = [
  'dog-translator',
  'gen-z-translator',
  'gen-alpha-translator',
  'dumb-it-down-ai',
  'bad-translator',
  'ancient-greek-translator',
  'al-bhed-translator',
  'alien-text-generator',
  'esperanto-translator',
  'gibberish-translator',
  'cuneiform-translator',
];

const BASE_PATH =
  '/Users/jason-chen/Downloads/project/vibetrans/src/app/[locale]/(marketing)/(pages)';

for (const page of pages) {
  const filePath = path.join(BASE_PATH, page, 'page.tsx');

  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find the pattern: closing </div> of the avatar container, followed by 4 orphaned avatar divs
    // We need to remove everything from the first orphaned div to the last one
    const pattern =
      /(\s*<\/div>\n)(\s*<div className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden">\n\s*<img\n\s*src="\/images\/avatars\/[^"]+"\n\s*alt="[^"]+"\n\s*className="h-full w-full object-cover"\n\s*\/>\n\s*<\/div>\n){4}/;

    if (pattern.test(content)) {
      content = content.replace(pattern, '$1');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Cleaned: ${page}`);
    } else {
      console.log(`⚠️  Pattern not found in: ${page}`);
    }
  } catch (error) {
    console.error(`❌ Failed to process ${page}:`, error);
  }
}

console.log('\n🎉 Cleanup complete!');
