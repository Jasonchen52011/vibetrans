#!/usr/bin/env node

/**
 * Simple Text Case Check
 *
 * Focused test for the most important text case issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Simple Text Case Check');
console.log('========================\n');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bright: '\x1b[1m',
};

// Check specific patterns in key files
function checkExploreToolsText() {
  console.log(colors.blue + colors.bright);
  console.log('1. 🎯 Check "Explore more Translator Tools"');
  console.log('─'.repeat(45));
  console.log(colors.reset);

  const mainFile = 'messages/common/en.json';
  if (!fs.existsSync(mainFile)) {
    console.log(
      colors.red + '❌ Main translation file not found' + colors.reset
    );
    return false;
  }

  const content = fs.readFileSync(mainFile, 'utf8');

  // Check for correct pattern
  const correctPattern = /"title": "Explore more Translator Tools"/;
  const incorrectPatterns = [
    /Explore more translator Tools/,
    /explore more Translator Tools/,
    /explore more translator tools/,
  ];

  const hasCorrect = correctPattern.test(content);
  let hasIncorrect = false;

  incorrectPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      hasIncorrect = true;
      console.log(
        colors.red +
          `❌ Found incorrect pattern: ${pattern.source}` +
          colors.reset
      );
    }
  });

  if (hasCorrect && !hasIncorrect) {
    console.log(
      colors.green +
        '✅ "Explore more Translator Tools" is correctly formatted!' +
        colors.reset
    );
    return true;
  } else {
    console.log(
      colors.yellow + '⚠️ Issues found with Explore tools text' + colors.reset
    );
    return false;
  }
}

function checkToolNamesCase() {
  console.log(colors.blue + colors.bright);
  console.log('2. 🛠️ Check Tool Names Capitalization');
  console.log('─'.repeat(45));
  console.log(colors.reset);

  const commonFile = 'messages/common/en.json';
  if (!fs.existsSync(commonFile)) {
    console.log(
      colors.red + '❌ Common translation file not found' + colors.reset
    );
    return false;
  }

  const content = fs.readFileSync(commonFile, 'utf8');

  // Check for properly capitalized tool names
  const expectedCapitalizations = [
    { find: 'Gen Z', correct: true },
    { find: 'Gen Alpha', correct: true },
    { find: 'Al Bhed', correct: true },
    { find: 'Cuneiform', correct: true },
    { find: 'Aramaic', correct: true },
    { find: 'Gibberish', correct: true },
    { find: 'Esperanto', correct: true },
    { find: 'gen z', correct: false },
    { find: 'gen alpha', correct: false },
    { find: 'al bhed', correct: false },
    { find: 'cuneiform', correct: false },
    { find: 'aramaic', correct: false },
    { find: 'gibberish', correct: false },
    { find: 'esperanto', correct: false },
  ];

  let issues = 0;
  expectedCapitalizations.forEach(({ find, correct }) => {
    if (content.includes(find)) {
      if (correct) {
        console.log(
          colors.green + `✅ Found correct: "${find}"` + colors.reset
        );
      } else {
        console.log(
          colors.red + `❌ Found incorrect: "${find}"` + colors.reset
        );
        issues++;
      }
    }
  });

  if (issues === 0) {
    console.log(
      colors.green +
        '✅ All tool names are properly capitalized!' +
        colors.reset
    );
    return true;
  } else {
    console.log(
      colors.yellow +
        `⚠️ Found ${issues} tool name capitalization issues` +
        colors.reset
    );
    return false;
  }
}

function checkButtonConsistency() {
  console.log(colors.blue + colors.bright);
  console.log('3. 🔘 Check Button Text Consistency');
  console.log('─'.repeat(45));
  console.log(colors.reset);

  // Check a few key tool page files for button consistency
  const toolFiles = [
    'src/app/[locale]/(marketing)/(pages)/gen-z-translator/GenZTranslatorTool.tsx',
    'src/app/[locale]/(marketing)/(pages)/al-bhed-translator/AlBhedTranslatorTool.tsx',
  ];

  let issues = 0;
  let checkedFiles = 0;

  toolFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      checkedFiles++;
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for common button text patterns
      const buttonPatterns = [
        { pattern: /translate/i, expected: 'Translate' },
        { pattern: /get started/i, expected: 'Get Started' },
        { pattern: /sign up/i, expected: 'Sign Up' },
        { pattern: /log in/i, expected: 'Log In' },
      ];

      buttonPatterns.forEach(({ pattern, expected }) => {
        const matches = content.match(pattern);
        if (matches) {
          const foundText = matches[0];
          if (foundText !== expected) {
            console.log(
              colors.yellow +
                `⚠️ ${path.basename(filePath)}: Found "${foundText}", expected "${expected}"` +
                colors.reset
            );
            issues++;
          }
        }
      });
    }
  });

  if (issues === 0 && checkedFiles > 0) {
    console.log(
      colors.green +
        `✅ Button text is consistent in ${checkedFiles} files!` +
        colors.reset
    );
    return true;
  } else if (checkedFiles === 0) {
    console.log(
      colors.yellow + '⚠️ No tool files found to check' + colors.reset
    );
    return true;
  } else {
    console.log(
      colors.yellow + `⚠️ Found ${issues} button text issues` + colors.reset
    );
    return false;
  }
}

function checkAPIvsAPI() {
  console.log(colors.blue + colors.bright);
  console.log('4. 🔤 Check API vs api consistency');
  console.log('─'.repeat(45));
  console.log(colors.reset);

  const checkFile = 'messages/common/en.json';
  if (!fs.existsSync(checkFile)) {
    return true;
  }

  const content = fs.readFileSync(checkFile, 'utf8');

  // Count occurrences
  const apiLowercase = (content.match(/\bapi\b/g) || []).length;
  const apiUppercase = (content.match(/\bAPI\b/g) || []).length;

  console.log(`Found ${apiLowercase} instances of "api"`);
  console.log(`Found ${apiUppercase} instances of "API"`);

  if (apiLowercase > 0 && apiUppercase === 0) {
    console.log(
      colors.yellow +
        '⚠️ Consider using "API" instead of "api" for consistency' +
        colors.reset
    );
    return false;
  } else if (apiUppercase > 0 && apiLowercase === 0) {
    console.log(colors.green + '✅ Consistently using "API"' + colors.reset);
    return true;
  } else {
    console.log(
      colors.yellow + '⚠️ Mixed usage of "API" and "api"' + colors.reset
    );
    return false;
  }
}

// Main execution
function runSimpleCheck() {
  let passedTests = 0;
  const totalTests = 4;

  console.log(
    colors.yellow + 'Running focused text case checks...\n' + colors.reset
  );

  if (checkExploreToolsText()) passedTests++;
  if (checkToolNamesCase()) passedTests++;
  if (checkButtonConsistency()) passedTests++;
  if (checkAPIvsAPI()) passedTests++;

  // Summary
  console.log(colors.blue + colors.bright);
  console.log('='.repeat(50));
  console.log('📊 Simple Text Check Summary');
  console.log('='.repeat(50));
  console.log(colors.reset);

  console.log(`Results: ${passedTests}/${totalTests} checks passed\n`);

  if (passedTests === totalTests) {
    console.log(
      colors.green +
        colors.bright +
        '🎉 Excellent! All key text case checks passed!' +
        colors.reset
    );
  } else {
    console.log(
      colors.yellow +
        `⚠️ ${totalTests - passedTests} checks failed. Review the issues above.` +
        colors.reset
    );
  }

  console.log('\n' + colors.cyan + '💡 Recommendations:' + colors.reset);
  console.log('1. Fix any issues found above');
  console.log('2. Use Title Case for tool names');
  console.log('3. Be consistent with capitalization');
  console.log('4. Test changes in browser');
}

if (require.main === module) {
  runSimpleCheck();
}

module.exports = { runSimpleCheck };
