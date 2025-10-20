#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Tool Alignment Unification Test');
console.log('===================================\n');

// Test 1: 检查工具文件修改情况
console.log('1. 📏 Tool Component Alignment Check');
try {
  const toolFiles = fs
    .readdirSync('src/app/[locale]/(marketing)/(pages)', { recursive: true })
    .filter((file) => file.includes('Tool.tsx'));

  let leftAlignedCount = 0;
  let checkedCount = 0;
  const problemFiles = [];

  toolFiles.slice(0, 8).forEach((file) => {
    // Check first 8 files
    const filePath = `src/app/[locale]/(marketing)/(pages)/${file}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      checkedCount++;

      // 检查是否已移除居中对齐
      if (
        content.includes('items-start justify-start') ||
        content.includes('flex items-start')
      ) {
        leftAlignedCount++;
        console.log(`   ✅ ${file}: Left alignment detected`);
      } else if (content.includes('items-center justify-center text-center')) {
        problemFiles.push(file);
        console.log(`   ❌ ${file}: Still has center alignment`);
      } else {
        console.log(`   ✅ ${file}: No problematic center alignment found`);
      }
    }
  });

  console.log(
    `   Result: ${leftAlignedCount}/${checkedCount} tool files properly aligned`
  );
  if (problemFiles.length > 0) {
    console.log(`   ⚠️ Files needing attention: ${problemFiles.join(', ')}`);
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Alignment check failed: ${error.message}\n`);
}

// Test 2: 检查DogTranslatorTool的具体修改
console.log('2. 🎯 DogTranslatorTool Specific Check');
try {
  const dogToolContent = fs.readFileSync(
    'src/app/[locale]/(marketing)/(pages)/dog-translator/DogTranslatorTool.tsx',
    'utf8'
  );

  const checks = [
    {
      name: 'Left alignment for content area',
      test: dogToolContent.includes('items-start justify-start'),
      expected: 'items-start justify-start',
    },
    {
      name: 'Left alignment for play button container',
      test: dogToolContent.includes('text-left'),
      expected: 'text-left',
    },
    {
      name: 'No center alignment remaining',
      test: !dogToolContent.includes('items-center justify-center text-center'),
      expected: 'should NOT contain center alignment',
    },
    {
      name: 'Consistent border styling',
      test: dogToolContent.includes('border border-primary-light'),
      expected: 'border border-primary-light',
    },
  ];

  checks.forEach((check) => {
    if (check.test) {
      console.log(`   ✅ ${check.name}: ${check.expected}`);
    } else {
      console.log(`   ❌ ${check.name}: Missing ${check.expected}`);
    }
  });
  console.log('');
} catch (error) {
  console.log(`   ❌ DogTranslatorTool check failed: ${error.message}\n`);
}

// Test 3: 检查样式一致性
console.log('3. 🎨 Style Consistency Check');
try {
  // 检查左右两侧的样式一致性
  const dogToolContent = fs.readFileSync(
    'src/app/[locale]/(marketing)/(pages)/dog-translator/DogTranslatorTool.tsx',
    'utf8'
  );

  const h2Pattern =
    /<h2 className="text-2xl font-semibold text-gray-800 mb-3">/g;
  const h2Matches = dogToolContent.match(h2Pattern);

  if (h2Matches && h2Matches.length === 2) {
    console.log('   ✅ Both H2 titles have consistent styling');
  } else {
    console.log('   ❌ H2 title styling inconsistency');
  }

  const containerPattern =
    /className="w-full h-48 md:h-64 p-3 border border-primary-light/g;
  const containerMatches = dogToolContent.match(containerPattern);

  if (containerMatches && containerMatches.length >= 1) {
    console.log('   ✅ Container styling is consistent');
  } else {
    console.log('   ❌ Container styling inconsistency');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Style consistency check failed: ${error.message}\n`);
}

// Test 4: 对比左侧和右侧结构
console.log('4. 🔄 Left vs Right Structure Comparison');
try {
  const dogToolContent = fs.readFileSync(
    'src/app/[locale]/(marketing)/(pages)/dog-translator/DogTranslatorTool.tsx',
    'utf8'
  );

  // 检查左右两侧结构是否对称
  const leftDivPattern =
    /<div className="flex-1">[\s\S]*?<\/textarea>[\s\S]*?<\/div>/;
  const rightDivPattern =
    /<div className="flex-1">[\s\S]*?<div[\s\S]*?<\/div>[\s\S]*?<\/div>/;

  if (dogToolContent.includes('<div className="flex-1">')) {
    const flex1Count = (dogToolContent.match(/<div className="flex-1">/g) || [])
      .length;
    if (flex1Count === 2) {
      console.log('   ✅ Both sides use flex-1 for equal width');
    } else {
      console.log(`   ⚠️ Expected 2 flex-1 divs, found ${flex1Count}`);
    }
  }

  // 检查标题结构
  const titlePattern =
    /<h2 className="text-2xl font-semibold text-gray-800 mb-3">/;
  const titleCount = (dogToolContent.match(titlePattern) || []).length;
  if (titleCount === 2) {
    console.log('   ✅ Both sides have properly styled titles');
  } else {
    console.log(`   ❌ Expected 2 titles, found ${titleCount}`);
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Structure comparison failed: ${error.message}\n`);
}

console.log('===================================');
console.log('✅ Alignment Unification Test Complete');
console.log('');
console.log('📋 Manual Testing Checklist:');
console.log('1. Visit http://localhost:3000/dog-translator');
console.log('2. Check left textarea vs right output area alignment');
console.log('3. Verify both content areas start from top-left');
console.log('4. Test with different screen sizes (mobile, tablet, desktop)');
console.log('5. Verify play button is left-aligned');
console.log('');
console.log('🚀 Run "pnpm dev" to start testing server');
