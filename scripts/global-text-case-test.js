#!/usr/bin/env node

/**
 * Global Text Case Consistency Test
 *
 * This script checks for text case inconsistencies across the entire project,
 * particularly focusing on:
 * 1. Tool names and titles (should use Title Case)
 * 2. Button text and UI elements
 * 3. Translation files
 * 4. Component names and descriptions
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Global Text Case Consistency Test');
console.log('=====================================\n');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

// Common patterns to check
const PATTERNS = {
  // Lowercase words that should be capitalized in titles
  lowercaseInTitle: [
    /\btranslator\b/gi,
    /\btools\b/gi,
    /\bgenerator\b/gi,
    /\bapi\b/gi,
    /\bai\b/gi,
  ],

  // Title case patterns that should be consistent
  inconsistentCapitalization: [
    { pattern: /\bgen z\b/gi, correct: 'Gen Z' },
    { pattern: /\bgen alpha\b/gi, correct: 'Gen Alpha' },
    { pattern: /\bal bhed\b/gi, correct: 'Al Bhed' },
    { pattern: /\bcuneiform\b/gi, correct: 'Cuneiform' },
    { pattern: /\baramaic\b/gi, correct: 'Aramaic' },
    { pattern: /\bgibberish\b/gi, correct: 'Gibberish' },
    { pattern: /\besperanto\b/gi, correct: 'Esperanto' },
  ],

  // Common text patterns to check
  commonText: [
    { pattern: /\bexplore more (.*?) tools\b/gi, check: true },
    { pattern: /\bget started\b/gi, check: true },
    { pattern: /\bsign up\b/gi, check: true },
    { pattern: /\blog in\b/gi, check: true },
  ],
};

let totalIssues = 0;
const totalFilesChecked = 0;

function scanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for lowercase words that should be capitalized
    PATTERNS.lowercaseInTitle.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'lowercase_in_title',
          pattern: pattern.source,
          matches: matches,
          severity: 'medium',
        });
      }
    });

    // Check for inconsistent capitalization
    PATTERNS.inconsistentCapitalization.forEach(({ pattern, correct }) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'inconsistent_capitalization',
          pattern: pattern.source,
          correct: correct,
          matches: matches,
          severity: 'high',
        });
      }
    });

    // Check common text patterns
    PATTERNS.commonText.forEach(({ pattern, check }) => {
      if (check) {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            type: 'common_text_pattern',
            pattern: pattern.source,
            matches: matches,
            severity: 'low',
          });
        }
      }
    });

    return issues;
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return [];
  }
}

function testTranslationFiles() {
  console.log(colors.cyan + colors.bright);
  console.log('1. 📝 Translation Files Test');
  console.log('─'.repeat(40));
  console.log(colors.reset);

  const translationDirs = ['messages/', 'src/i18n/', 'locales/'];

  let translationIssues = 0;

  translationDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir, { recursive: true })
        .filter((file) => file.endsWith('.json'));

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const issues = scanFile(filePath);

        if (issues.length > 0) {
          console.log(colors.yellow + `📄 ${file}` + colors.reset);
          issues.forEach((issue) => {
            console.log(
              `   ${colors.red}⚠️ ${issue.type}: ${issue.pattern}${colors.reset}`
            );
            if (issue.correct) {
              console.log(`   💡 Should be: ${issue.correct}`);
            }
            translationIssues++;
          });
        }
      });
    }
  });

  if (translationIssues === 0) {
    console.log(
      colors.green + '✅ No issues found in translation files' + colors.reset
    );
  } else {
    console.log(
      colors.red +
        `❌ Found ${translationIssues} issues in translation files` +
        colors.reset
    );
  }

  totalIssues += translationIssues;
  console.log('');
}

function testComponentFiles() {
  console.log(colors.cyan + colors.bright);
  console.log('2. 🧩 Component Files Test');
  console.log('─'.repeat(40));
  console.log(colors.reset);

  const componentDirs = ['src/components/', 'src/app/'];

  let componentIssues = 0;
  const componentFiles = [];

  componentDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir, { recursive: true })
        .filter(
          (file) =>
            file.endsWith('.tsx') ||
            file.endsWith('.ts') ||
            file.endsWith('.jsx')
        )
        .map((file) => path.join(dir, file));

      componentFiles.push(...files);
    }
  });

  // Check first 10 component files to avoid too much output
  componentFiles.slice(0, 10).forEach((filePath) => {
    const issues = scanFile(filePath);

    if (issues.length > 0) {
      console.log(
        colors.yellow + `🧩 ${path.relative('.', filePath)}` + colors.reset
      );
      issues.forEach((issue) => {
        console.log(
          `   ${colors.red}⚠️ ${issue.type}: ${issue.pattern}${colors.reset}`
        );
        if (issue.correct) {
          console.log(`   💡 Should be: ${issue.correct}`);
        }
        componentIssues++;
      });
    }
  });

  if (componentIssues === 0) {
    console.log(
      colors.green +
        `✅ No issues found in first 10 component files` +
        colors.reset
    );
  } else {
    console.log(
      colors.red +
        `❌ Found ${componentIssues} issues in component files` +
        colors.reset
    );
  }

  totalIssues += componentIssues;
  console.log('');
}

function testToolSpecificFiles() {
  console.log(colors.cyan + colors.bright);
  console.log('3. 🛠️ Tool-Specific Files Test');
  console.log('─'.repeat(40));
  console.log(colors.reset);

  // Check specific tool files that we know exist
  const toolFiles = [
    'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/AlBhedTranslatorTool.tsx',
    'src/app/[locale]/(marketing)/(pages)/gen-z-translator/GenZTranslatorTool.tsx',
    'src/app/[locale]/(marketing)/(pages)/gibberish-translator/GibberishTranslatorTool.tsx',
    'src/app/[locale]/(marketing)/(pages)/alien-text-generator/AlienTextGeneratorTool.tsx',
  ];

  let toolIssues = 0;

  toolFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const issues = scanFile(filePath);

      if (issues.length > 0) {
        console.log(
          colors.yellow + `🛠️ ${path.relative('.', filePath)}` + colors.reset
        );
        issues.forEach((issue) => {
          console.log(
            `   ${colors.red}⚠️ ${issue.type}: ${issue.pattern}${colors.reset}`
          );
          if (issue.correct) {
            console.log(`   💡 Should be: ${issue.correct}`);
          }
          toolIssues++;
        });
      }
    }
  });

  if (toolIssues === 0) {
    console.log(
      colors.green + '✅ No issues found in tool-specific files' + colors.reset
    );
  } else {
    console.log(
      colors.red +
        `❌ Found ${toolIssues} issues in tool-specific files` +
        colors.reset
    );
  }

  totalIssues += toolIssues;
  console.log('');
}

function testSpecificKnownIssues() {
  console.log(colors.cyan + colors.bright);
  console.log('4. 🔍 Specific Known Issues Test');
  console.log('─'.repeat(40));
  console.log(colors.reset);

  const specificChecks = [
    {
      name: 'translator Tools vs Translator Tools',
      pattern: /\btranslator tools\b/gi,
      correct: 'Translator Tools',
      files: ['messages/', 'src/components/', 'src/app/'],
    },
    {
      name: 'gen z vs Gen Z',
      pattern: /\bgen z\b/gi,
      correct: 'Gen Z',
      files: ['messages/', 'src/components/'],
    },
    {
      name: 'api vs API',
      pattern: /\bapi\b/gi,
      context: /\bAPI\b/g,
      files: ['src/', 'messages/'],
    },
  ];

  let specificIssues = 0;

  specificChecks.forEach((check) => {
    console.log(colors.magenta + `🔍 Checking: ${check.name}` + colors.reset);

    check.files.forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir, { recursive: true })
          .filter(
            (file) =>
              file.endsWith('.tsx') ||
              file.endsWith('.ts') ||
              file.endsWith('.json') ||
              file.endsWith('.md')
          )
          .map((file) => path.join(dir, file));

        files.slice(0, 3).forEach((filePath) => {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(check.pattern);

            if (matches) {
              console.log(
                colors.yellow +
                  `   📄 ${path.relative('.', filePath)}` +
                  colors.reset
              );
              console.log(
                `     Found: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`
              );
              console.log(`     💡 Should be: ${check.correct}`);
              specificIssues++;
            }
          } catch (error) {
            // Skip unreadable files
          }
        });
      }
    });

    if (specificIssues === 0) {
      console.log(
        colors.green + `   ✅ No issues found for ${check.name}` + colors.reset
      );
    }
  });

  totalIssues += specificIssues;
  console.log('');
}

function checkExploreSpecificIssue() {
  console.log(colors.cyan + colors.bright);
  console.log('5. 🎯 Explore Tools Specific Test');
  console.log('─'.repeat(40));
  console.log(colors.reset);

  const explorePatterns = [
    /\bExplore more translator Tools\b/g,
    /\bExplore more Translator Tools\b/g,
    /\bexplore more translator tools\b/g,
    /\bexplore more Translator tools\b/g,
  ];

  let exploreIssues = 0;
  const correctPattern = 'Explore more Translator Tools';

  // Check main translation file
  const mainTranslationFile = 'messages/common/en.json';
  if (fs.existsSync(mainTranslationFile)) {
    const content = fs.readFileSync(mainTranslationFile, 'utf8');

    explorePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        if (index === 1) {
          // This is the correct pattern
          console.log(
            colors.green +
              `✅ Found correct pattern: "${matches[0]}"` +
              colors.reset
          );
        } else {
          console.log(
            colors.red +
              `❌ Found incorrect pattern: "${matches[0]}"` +
              colors.reset
          );
          console.log(`💡 Should be: "${correctPattern}"`);
          exploreIssues++;
        }
      }
    });
  }

  if (exploreIssues === 0) {
    console.log(
      colors.green +
        '✅ Explore tools text is correctly formatted' +
        colors.reset
    );
  } else {
    console.log(
      colors.red +
        `❌ Found ${exploreIssues} issues with explore tools text` +
        colors.reset
    );
  }

  totalIssues += exploreIssues;
  console.log('');
}

// Main test execution
function runGlobalTextCaseTest() {
  console.log(
    colors.yellow +
      '🔍 Scanning project for text case inconsistencies...\n' +
      colors.reset
  );

  testTranslationFiles();
  testComponentFiles();
  testToolSpecificFiles();
  testSpecificKnownIssues();
  checkExploreSpecificIssue();

  // Summary
  console.log(colors.blue + colors.bright);
  console.log('='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(colors.reset);

  if (totalIssues === 0) {
    console.log(
      colors.green +
        colors.bright +
        '🎉 Excellent! No text case issues found!' +
        colors.reset
    );
    console.log(
      colors.green +
        '✅ All text follows consistent casing rules' +
        colors.reset
    );
  } else {
    console.log(
      colors.yellow +
        `⚠️ Found ${totalIssues} total issues across the project` +
        colors.reset
    );
    console.log(colors.magenta + '💡 Recommendations:' + colors.reset);
    console.log('   - Review and fix inconsistent capitalization');
    console.log('   - Use Title Case for tool names and titles');
    console.log('   - Maintain consistency across all translation files');
    console.log('   - Test changes in browser after fixing');
  }

  console.log('\n' + colors.cyan + '📋 Next Steps:' + colors.reset);
  console.log('1. Fix any issues found above');
  console.log('2. Run automated tests: node test-ui-automated.js');
  console.log('3. Start dev server: pnpm dev');
  console.log('4. Manually verify changes in browser');
}

// Run the test
if (require.main === module) {
  runGlobalTextCaseTest();
}

module.exports = { runGlobalTextCaseTest };
