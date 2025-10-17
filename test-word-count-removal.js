#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  findJsonFiles,
  searchWordCountInJson,
  WORD_COUNT_PATTERNS,
} = require('./scripts/find-word-count-in-json.js');

// 测试用例
const testCases = [
  {
    name: 'Should detect (xx words) pattern',
    testContent: 'This is a testimonial content. (45 words)',
    shouldMatch: true,
  },
  {
    name: 'Should detect (xx words) at end of sentence',
    testContent:
      'This is great content that describes a feature. It works well. (30 words)',
    shouldMatch: true,
  },
  {
    name: 'Should not match normal character limits',
    testContent: 'Password must be at least 8 characters',
    shouldMatch: false,
  },
  {
    name: 'Should detect Chinese word count',
    testContent: '这是内容描述，包含字数统计 (50 字)',
    shouldMatch: false, // 我们的脚本不检测中文的字数
  },
  {
    name: 'Should not match normal content without word count',
    testContent:
      'This is just normal content without any word count at the end',
    shouldMatch: false,
  },
  {
    name: 'Should detect multiple digit word counts',
    testContent:
      'Long content that describes something important in detail. (123 words)',
    shouldMatch: true,
  },
];

function runUnitTests() {
  console.log('🧪 Running unit tests for word count detection...\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    let foundMatch = false;
    WORD_COUNT_PATTERNS.forEach((pattern) => {
      if (pattern.test(testCase.testContent)) {
        foundMatch = true;
      }
    });

    const result = foundMatch === testCase.shouldMatch;

    if (result) {
      console.log(`  ✅ PASSED: "${testCase.testContent}"`);
      passed++;
    } else {
      console.log(`  ❌ FAILED: "${testCase.testContent}"`);
      console.log(
        `     Expected: ${testCase.shouldMatch ? 'match' : 'no match'}, Got: ${foundMatch ? 'match' : 'no match'}`
      );
      failed++;
    }
    console.log();
  });

  console.log(`📊 Unit Test Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

function testWordCountRemoval() {
  console.log('🔧 Testing word count removal functionality...\n');

  // 创建测试文件
  const testDir = './test-temp';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const testFile = path.join(testDir, 'test-content.json');
  const testContent = {
    testimonials: [
      {
        content: 'This is a great testimonial. (45 words)',
      },
      {
        content: 'This testimonial has no word count at the end',
      },
    ],
    whatIs: {
      content: 'Description of the tool with word count. (60 words)',
    },
    validation: {
      minLength: 'Password must be at least 8 characters',
    },
  };

  fs.writeFileSync(testFile, JSON.stringify(testContent, null, 2));

  // 测试搜索功能
  const matches = searchWordCountInJson(testFile);

  if (matches && matches.length > 0) {
    console.log(
      `✅ Successfully found ${matches.length} word count references in test file`
    );
    matches.forEach((match) => {
      console.log(`  📍 Found: ${match.path} = "${match.value}"`);
    });
  } else {
    console.log('❌ Failed to find word count references in test file');
  }

  // 清理测试文件
  fs.rmSync(testDir, { recursive: true, force: true });

  console.log('\n🧹 Test files cleaned up\n');
}

function testRealWorldFiles() {
  console.log('🌍 Testing with real project files...\n');

  const criticalFiles = [
    './messages/pages/home/en.json',
    './messages/pages/al-bhed-translator/en.json',
    './messages/marketing/en.json',
  ];

  let filesWithIssues = 0;
  let totalIssues = 0;

  criticalFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      console.log(`🔍 Checking ${filePath}...`);
      const matches = searchWordCountInJson(filePath);
      if (matches && matches.length > 0) {
        filesWithIssues++;
        totalIssues += matches.length;
        console.log(`  ⚠️  Found ${matches.length} issues`);
        matches.forEach((match) => {
          console.log(`    📍 ${match.path}: "${match.value}"`);
        });
      } else {
        console.log(`  ✅ No word count issues found`);
      }
    } else {
      console.log(`📁 File not found: ${filePath}`);
    }
  });

  console.log(
    `\n📊 Real-world test results: ${filesWithIssues} files with ${totalIssues} total issues\n`
  );

  return { filesWithIssues, totalIssues };
}

function main() {
  console.log('🚀 Starting comprehensive word count removal tests...\n');

  // 运行单元测试
  const unitResults = runUnitTests();

  // 测试移除功能
  testWordCountRemoval();

  // 测试真实文件
  const realWorldResults = testRealWorldFiles();

  console.log('📋 SUMMARY:');
  console.log(
    `  🧪 Unit Tests: ${unitResults.passed} passed, ${unitResults.failed} failed`
  );
  console.log(
    `  🌍 Real Files: ${realWorldResults.filesWithIssues} files with issues`
  );
  console.log(`  📊 Total Issues Found: ${realWorldResults.totalIssues}`);

  if (unitResults.failed === 0) {
    console.log(
      `\n✅ All tests passed! Ready to proceed with word count removal.`
    );
  } else {
    console.log(`\n❌ Some tests failed. Review the detection patterns.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runUnitTests, testWordCountRemoval, testRealWorldFiles };
