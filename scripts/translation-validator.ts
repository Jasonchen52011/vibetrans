#!/usr/bin/env tsx

/**
 * Translation Validator Script
 * Validates that all required translation keys exist for the navbar system
 */

import fs from 'fs';
import path from 'path';
import { CATEGORY_CATALOG, TOOL_CATALOG } from '../src/data/tool-catalog';
import {
  generateCategoryTranslationKey,
  generateToolTranslationKey,
} from '../src/lib/translation-key-generator';

// Translation file paths
const EN_TRANSLATIONS_PATH = path.join(
  process.cwd(),
  'messages/marketing/en.json'
);
const ZH_TRANSLATIONS_PATH = path.join(
  process.cwd(),
  'messages/marketing/zh.json'
);

/**
 * Load translation file
 */
function loadTranslations(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    console.error(`Translation file not found: ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error parsing translation file ${filePath}:`, error);
    return null;
  }
}

/**
 * Check if translation key exists
 */
function hasTranslationKey(translations: any, key: string): boolean {
  const keys = key.split('.');
  let current = translations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Validate all translation keys for tools
 */
function validateToolTranslations(
  translations: any,
  language: string
): {
  valid: number;
  missing: string[];
  total: number;
} {
  let valid = 0;
  const missing: string[] = [];
  const total = TOOL_CATALOG.filter((tool) => tool.enabled !== false).length;

  TOOL_CATALOG.forEach((tool) => {
    if (tool.enabled === false) return;

    const toolTranslation = generateToolTranslationKey(tool);
    const titleKey = `Marketing.navbar.${toolTranslation.titleKey}`;
    const descKey = `Marketing.navbar.${toolTranslation.descriptionKey}`;

    const titleExists = hasTranslationKey(translations, titleKey);
    const descExists = hasTranslationKey(translations, descKey);

    if (titleExists && descExists) {
      valid++;
    } else {
      if (!titleExists) missing.push(titleKey);
      if (!descExists) missing.push(descKey);
    }
  });

  return { valid, missing, total };
}

/**
 * Validate all translation keys for categories
 */
function validateCategoryTranslations(
  translations: any,
  language: string
): {
  valid: number;
  missing: string[];
  total: number;
} {
  let valid = 0;
  const missing: string[] = [];
  const total = CATEGORY_CATALOG.filter((cat) => cat.enabled).length;

  CATEGORY_CATALOG.forEach((category) => {
    if (!category.enabled) return;

    const categoryTranslation = generateCategoryTranslationKey(category.id);
    const titleKey = `Marketing.navbar.${categoryTranslation.titleKey}`;

    if (hasTranslationKey(translations, titleKey)) {
      valid++;
    } else {
      missing.push(titleKey);
    }
  });

  return { valid, missing, total };
}

/**
 * Generate complete translation template
 */
function generateTranslationTemplate(): any {
  const template: any = {
    Marketing: {
      navbar: {},
    },
  };

  // Add categories
  CATEGORY_CATALOG.forEach((category) => {
    if (!template.Marketing.navbar[category.id]) {
      template.Marketing.navbar[category.id] = {};
    }

    template.Marketing.navbar[category.id] = {
      title: category.title,
      items: {},
    };
  });

  // Add tools
  TOOL_CATALOG.forEach((tool) => {
    if (tool.enabled === false) return;

    if (!template.Marketing.navbar[tool.category]) {
      template.Marketing.navbar[tool.category] = {
        title: tool.category,
        items: {},
      };
    }

    template.Marketing.navbar[tool.category].items[tool.id] = {
      title: tool.title,
      description: tool.description,
    };
  });

  return template;
}

/**
 * Generate missing translation entries
 */
function generateMissingEntries(
  existingTranslations: any,
  language: string
): any {
  const template = generateTranslationTemplate();
  const missing: any = {};

  const compareKeys = (templateObj: any, existingObj: any, path = '') => {
    Object.keys(templateObj).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;

      if (typeof templateObj[key] === 'object' && templateObj[key] !== null) {
        if (!existingObj || !existingObj[key]) {
          missing[fullPath] = templateObj[key];
        } else {
          compareKeys(templateObj[key], existingObj[key], fullPath);
        }
      } else {
        if (!existingObj || existingObj[key] === undefined) {
          missing[fullPath] = templateObj[key];
        }
      }
    });
  };

  compareKeys(template, existingTranslations);

  return missing;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Validating navbar translations...\n');

  // Load translation files
  const enTranslations = loadTranslations(EN_TRANSLATIONS_PATH);
  const zhTranslations = loadTranslations(ZH_TRANSLATIONS_PATH);

  if (!enTranslations) {
    console.error('❌ Failed to load English translations. Aborting.');
    process.exit(1);
  }

  // Validate English (base language)
  console.log('📊 English translations:');
  const enToolsResult = validateToolTranslations(enTranslations, 'en');
  const enCategoriesResult = validateCategoryTranslations(enTranslations, 'en');

  console.log(`  Tools: ${enToolsResult.valid}/${enToolsResult.total} valid`);
  console.log(
    `  Categories: ${enCategoriesResult.valid}/${enCategoriesResult.total} valid`
  );

  if (enToolsResult.missing.length > 0) {
    console.log(`  Missing keys: ${enToolsResult.missing.length}`);
    enToolsResult.missing.forEach((key) => console.log(`    - ${key}`));
  }

  if (enCategoriesResult.missing.length > 0) {
    console.log(
      `  Missing category keys: ${enCategoriesResult.missing.length}`
    );
    enCategoriesResult.missing.forEach((key) => console.log(`    - ${key}`));
  }

  // Validate Chinese if available
  if (zhTranslations) {
    console.log('\n📊 Chinese translations:');
    const zhToolsResult = validateToolTranslations(zhTranslations, 'zh');
    const zhCategoriesResult = validateCategoryTranslations(
      zhTranslations,
      'zh'
    );

    console.log(`  Tools: ${zhToolsResult.valid}/${zhToolsResult.total} valid`);
    console.log(
      `  Categories: ${zhCategoriesResult.valid}/${zhCategoriesResult.total} valid`
    );

    if (zhToolsResult.missing.length > 0) {
      console.log(`  Missing keys: ${zhToolsResult.missing.length}`);
      zhToolsResult.missing.forEach((key) => console.log(`    - ${key}`));
    }

    if (zhCategoriesResult.missing.length > 0) {
      console.log(
        `  Missing category keys: ${zhCategoriesResult.missing.length}`
      );
      zhCategoriesResult.missing.forEach((key) => console.log(`    - ${key}`));
    }
  } else {
    console.log('\n⚠️  Chinese translations not found');
  }

  // Generate missing entries if needed
  const totalMissingKeys =
    enToolsResult.missing.length + enCategoriesResult.missing.length;

  if (totalMissingKeys > 0) {
    console.log('\n📝 Generating missing translations...');

    const missingEnEntries = generateMissingEntries(enTranslations, 'en');
    const missingZhEntries = zhTranslations
      ? generateMissingEntries(zhTranslations, 'zh')
      : missingEnEntries; // Use English as template for Chinese

    // Write missing translations to files
    if (Object.keys(missingEnEntries).length > 0) {
      const enOutputPath = path.join(
        process.cwd(),
        'missing-translations-en.json'
      );
      fs.writeFileSync(enOutputPath, JSON.stringify(missingEnEntries, null, 2));
      console.log(`  English missing keys: ${enOutputPath}`);
    }

    if (Object.keys(missingZhEntries).length > 0) {
      const zhOutputPath = path.join(
        process.cwd(),
        'missing-translations-zh.json'
      );
      fs.writeFileSync(zhOutputPath, JSON.stringify(missingZhEntries, null, 2));
      console.log(`  Chinese missing keys: ${zhOutputPath}`);
    }
  }

  // Summary
  console.log('\n📋 Summary:');
  const isFullyValid = totalMissingKeys === 0;

  if (isFullyValid) {
    console.log('✅ All translations are valid!');
  } else {
    console.log(`❌ ${totalMissingKeys} translation keys are missing`);
    console.log('   Check the generated missing-translations-*.json files');
    console.log('   Add the missing translations to your language files');
  }

  // Exit with error code if validation fails
  process.exit(isFullyValid ? 0 : 1);
}

// CLI interface
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  const shouldGenerateTemplate = process.argv.includes('--generate-template');

  if (shouldGenerateTemplate) {
    console.log('📝 Generating complete translation template...');
    const template = generateTranslationTemplate();
    const outputPath = path.join(
      process.cwd(),
      'navbar-translation-template.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
    console.log(`✅ Template generated: ${outputPath}`);
  } else if (isDryRun) {
    console.log('🔍 Dry run mode - only checking translations...');
    const enTranslations = loadTranslations(EN_TRANSLATIONS_PATH);

    if (!enTranslations) {
      console.error('❌ Failed to load English translations.');
      process.exit(1);
    }

    const enToolsResult = validateToolTranslations(enTranslations, 'en');
    const enCategoriesResult = validateCategoryTranslations(
      enTranslations,
      'en'
    );

    console.log(
      `English tools: ${enToolsResult.valid}/${enToolsResult.total} valid`
    );
    console.log(
      `English categories: ${enCategoriesResult.valid}/${enCategoriesResult.total} valid`
    );

    if (
      enToolsResult.missing.length > 0 ||
      enCategoriesResult.missing.length > 0
    ) {
      console.log('❌ Missing translations found!');
      process.exit(1);
    } else {
      console.log('✅ All translations are valid!');
    }
  } else {
    main().catch(console.error);
  }
}

export {
  validateToolTranslations,
  validateCategoryTranslations,
  generateTranslationTemplate,
};
