#!/usr/bin/env tsx

/**
 * Automatic Tool Registration Script
 * This script automatically discovers new tools and registers them in the system
 */

import fs from 'fs';
import path from 'path';
import { CATEGORY_CATALOG, TOOL_CATALOG } from '../src/data/tool-catalog';
import type { ToolMetadata } from '../src/types/tool-metadata';

// Configuration
const PAGES_DIR = path.join(
  process.cwd(),
  'src/app/[locale]/(marketing)/(pages)'
);
const OUTPUT_CATALOG_PATH = path.join(
  process.cwd(),
  'src/data/tool-catalog.ts'
);
const MISSING_TRANSLATIONS_PATH = path.join(
  process.cwd(),
  'missing-translations.json'
);

/**
 * Route path normalization
 */
function normalizeRouteName(dirName: string): string {
  return (
    dirName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Translator'
  );
}

/**
 * Extract route enum value from directory name
 */
function getRouteFromDirName(dirName: string): string {
  return dirName
    .split('-')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

/**
 * Categorize tools based on their names and directories
 */
function categorizeTool(
  toolName: string,
  dirName: string
): 'funTranslate' | 'languageTranslator' | 'gameTranslator' | 'aiTools' {
  const name = toolName.toLowerCase();
  const dir = dirName.toLowerCase();

  // Fun tools
  if (
    name.includes('dog') ||
    name.includes('baby') ||
    name.includes('gen') ||
    name.includes('alien') ||
    name.includes('minion') ||
    name.includes('pig') ||
    name.includes('gibberish') ||
    name.includes('bad') ||
    name.includes('dumb') ||
    name.includes('verbose')
  ) {
    return 'funTranslate';
  }

  // Game tools
  if (
    name.includes('yoda') ||
    name.includes('valyrian') ||
    name.includes('gaster') ||
    name.includes('al bhed') ||
    name.includes('drow') ||
    name.includes('rune') ||
    dir.includes('ancient-greek') ||
    (name.includes('greek') && !name.includes('translator'))
  ) {
    return 'gameTranslator';
  }

  // Language tools (default category for translators)
  return 'languageTranslator';
}

/**
 * Select appropriate icon based on tool name and category
 */
function selectIcon(toolName: string, category: string): string {
  const name = toolName.toLowerCase();

  // Specific icon mappings
  if (name.includes('dog')) return 'DogIcon';
  if (name.includes('baby')) return 'AudioLinesIcon';
  if (name.includes('alien')) return 'RocketIcon';
  if (name.includes('yoda') || name.includes('valyrian')) return 'CrownIcon';
  if (name.includes('rune') || name.includes('ogham')) return 'BookIcon';
  if (
    name.includes('greek') ||
    name.includes('cuneiform') ||
    name.includes('aramaic')
  )
    return 'ScrollTextIcon';
  if (name.includes('manga')) return 'BookIcon';
  if (name.includes('key')) return 'KeyIcon';
  if (name.includes('eye')) return 'EyeIcon';

  // Category-based defaults
  switch (category) {
    case 'funTranslate':
      return 'SmileIcon';
    case 'gameTranslator':
      return 'Gamepad2Icon';
    case 'languageTranslator':
      return 'LanguagesIcon';
    case 'aiTools':
      return 'SparklesIcon';
    default:
      return 'LanguagesIcon';
  }
}

/**
 * Generate description based on tool name and category
 */
function generateDescription(toolName: string, category: string): string {
  const name = toolName.toLowerCase();

  // Specific descriptions
  if (name.includes('dog'))
    return 'Translate your words into dog language with AI';
  if (name.includes('baby'))
    return 'Translate baby cries into clear meanings with AI';
  if (name.includes('alien'))
    return 'Transform your text into various alien language styles';
  if (name.includes('minion'))
    return 'Translate text to Minion language and back';
  if (name.includes('yoda')) return 'Translate like Yoda from Star Wars';
  if (name.includes('valyrian'))
    return 'Translate between High Valyrian and English';
  if (name.includes('drow'))
    return 'Translate between Drow (Dark Elf) and modern languages';
  if (name.includes('greek'))
    return 'Translate between Greek and English language';
  if (name.includes('manga')) return 'Translate manga and Japanese content';
  if (name.includes('nahuatl'))
    return 'Translate between Nahuatl and English with AI support';
  if (name.includes('ogham'))
    return 'Convert text to and from ancient Irish Ogham script';
  if (name.includes('rune')) return 'Translate ancient runic symbols';
  if (name.includes('aramaic'))
    return 'Translate ancient Aramaic script to modern languages';
  if (name.includes('telugu'))
    return 'Translate between Telugu and English with AI';
  if (name.includes('swahili'))
    return 'Translate between Swahili and English with AI';
  if (name.includes('amharic'))
    return 'Bidirectional English ↔ Amharic translation with AI';
  if (name.includes('polish'))
    return 'Translate between Polish and English language';

  // Category-based descriptions
  switch (category) {
    case 'funTranslate':
      return `Fun translation tool for ${toolName}`;
    case 'gameTranslator':
      return `Translate game and fictional languages for ${toolName}`;
    case 'languageTranslator':
      return `Translate between languages using ${toolName}`;
    case 'aiTools':
      return `AI-powered ${toolName} tool`;
    default:
      return `Translation tool for ${toolName}`;
  }
}

/**
 * Scan directories for new tools
 */
function discoverTools(): ToolMetadata[] {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`Pages directory not found: ${PAGES_DIR}`);
    return [];
  }

  const directories = fs
    .readdirSync(PAGES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith('--') && !name.startsWith('_')); // Exclude special directories

  const discoveredTools: ToolMetadata[] = [];
  const existingToolIds = new Set(TOOL_CATALOG.map((tool) => tool.id));

  directories.forEach((dirName) => {
    // Convert directory name to tool ID
    const toolId = dirName.replace(/-translator$/, '').replace(/-/g, '');
    const toolName = normalizeRouteName(dirName);

    // Skip if tool already exists
    if (existingToolIds.has(toolId)) {
      return;
    }

    const category = categorizeTool(toolName, dirName);
    const icon = selectIcon(toolName, category);
    const description = generateDescription(toolName, category);
    const route = getRouteFromDirName(dirName) as keyof typeof import(
      '../src/routes'
    ).Routes;

    const toolMetadata: ToolMetadata = {
      id: toolId,
      category,
      title: toolName,
      description,
      route: route as any, // Type assertion for dynamic route
      icon,
      priority: TOOL_CATALOG.length + discoveredTools.length + 1,
      tags: [category, 'translation', 'new'],
      enabled: true,
    };

    discoveredTools.push(toolMetadata);
    console.log(
      `Discovered new tool: ${toolName} (${toolId}) in category ${category}`
    );
  });

  return discoveredTools;
}

/**
 * Generate missing translation keys
 */
function generateMissingTranslations(tools: ToolMetadata[]): void {
  const missingKeys: any = { Marketing: { navbar: {} } };

  // Initialize category structure
  CATEGORY_CATALOG.forEach((category) => {
    if (!missingKeys.Marketing.navbar[category.id]) {
      missingKeys.Marketing.navbar[category.id] = { items: {} };
    }
  });

  tools.forEach((tool) => {
    const category = missingKeys.Marketing.navbar[tool.category];
    if (!category.items) {
      category.items = {};
    }

    category.items[tool.id] = {
      title: tool.title,
      description: tool.description,
    };
  });

  // Add missing category titles if needed
  tools.forEach((tool) => {
    if (!missingKeys.Marketing.navbar[tool.category].title) {
      const categoryInfo = CATEGORY_CATALOG.find(
        (cat) => cat.id === tool.category
      );
      missingKeys.Marketing.navbar[tool.category].title =
        categoryInfo?.title || tool.category;
    }
  });

  fs.writeFileSync(
    MISSING_TRANSLATIONS_PATH,
    JSON.stringify(missingKeys, null, 2)
  );
  console.log(`Missing translations written to: ${MISSING_TRANSLATIONS_PATH}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Scanning for new tools...');

  const discoveredTools = discoverTools();

  if (discoveredTools.length === 0) {
    console.log('✅ No new tools found. All tools are already registered.');
    return;
  }

  console.log(`📦 Found ${discoveredTools.length} new tools:`);
  discoveredTools.forEach((tool) => {
    console.log(`  - ${tool.title} (${tool.id})`);
  });

  // Generate missing translations
  generateMissingTranslations(discoveredTools);

  console.log('\n📝 Next steps:');
  console.log(
    '1. Review the missing translations in missing-translations.json'
  );
  console.log(
    '2. Add the translations to your language files (en.json, zh.json)'
  );
  console.log('3. Add the new tools to src/data/tool-catalog.ts');
  console.log('4. Test the new tools in the navbar');
  console.log('5. Run pnpm build to verify everything works');

  console.log(
    '\n💡 Tip: You can also run this script with --dry-run to only scan without generating files'
  );
}

// CLI interface
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');

  if (isDryRun) {
    console.log('🔍 Dry run mode - only scanning for new tools...');
    const discoveredTools = discoverTools();

    if (discoveredTools.length === 0) {
      console.log('✅ No new tools found.');
    } else {
      console.log(`📦 Would register ${discoveredTools.length} new tools:`);
      discoveredTools.forEach((tool) => {
        console.log(`  - ${tool.title} (${tool.id})`);
      });
    }
  } else {
    main().catch(console.error);
  }
}

export { discoverTools, generateMissingTranslations };
