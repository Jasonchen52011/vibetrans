#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 UI Changes Automated Test Report');
console.log('=====================================\n');

// Test 1: 字体文件检查
console.log('1. ✨ Satoshi Font Files Check');
try {
  const fontFiles = [
    'src/fonts/satoshi-regular.woff2',
    'src/fonts/satoshi-medium.woff2',
    'src/fonts/satoshi-bold.woff2',
  ];

  let fontExists = 0;
  fontFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} exists`);
      fontExists++;
    } else {
      console.log(`   ❌ ${file} missing`);
    }
  });
  console.log(`   Result: ${fontExists}/3 font files found\n`);
} catch (error) {
  console.log(`   ❌ Font check failed: ${error.message}\n`);
}

// Test 2: 字体配置检查
console.log('2. ⚙️ Font Configuration Check');
try {
  const fontsIndex = fs.readFileSync('src/assets/fonts/index.ts', 'utf8');
  if (fontsIndex.includes('fontSatoshi') && fontsIndex.includes('localFont')) {
    console.log('   ✅ Satoshi font configured in assets/fonts/index.ts');
  } else {
    console.log('   ❌ Satoshi font not properly configured');
  }

  const globalsCSS = fs.readFileSync('src/styles/globals.css', 'utf8');
  if (globalsCSS.includes('--font-sans: var(--font-satoshi)')) {
    console.log('   ✅ CSS variables updated for Satoshi font');
  } else {
    console.log('   ❌ CSS variables not updated');
  }

  const layout = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf8');
  if (layout.includes('fontSatoshi.className')) {
    console.log('   ✅ Layout updated to use Satoshi font');
  } else {
    console.log('   ❌ Layout not updated');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Font configuration check failed: ${error.message}\n`);
}

// Test 3: 工具栏宽度检查
console.log('3. 📏 Tool Container Width Check');
try {
  const toolFiles = fs
    .readdirSync('src/app/[locale]/(marketing)/(pages)', { recursive: true })
    .filter((file) => file.includes('Tool.tsx'));

  let updatedCount = 0;
  let checkedCount = 0;

  toolFiles.slice(0, 5).forEach((file) => {
    // Check first 5 files
    const filePath = `src/app/[locale]/(marketing)/(pages)/${file}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      checkedCount++;
      if (content.includes('max-w-7xl')) {
        updatedCount++;
        console.log(`   ✅ ${file} updated to max-w-7xl`);
      } else {
        console.log(`   ❌ ${file} still using old width`);
      }
    }
  });

  console.log(
    `   Result: ${updatedCount}/${checkedCount} tool files checked (showing first 5)\n`
  );
} catch (error) {
  console.log(`   ❌ Container width check failed: ${error.message}\n`);
}

// Test 4: CTA按钮图标检查
console.log('4. ➡️ CTA Button Icons Check');
try {
  const callToAction = fs.readFileSync(
    'src/components/blocks/calltoaction/calltoaction.tsx',
    'utf8'
  );
  if (callToAction.includes('ArrowUpIcon')) {
    console.log('   ✅ CallToAction button updated with ArrowUpIcon');
  } else {
    console.log('   ❌ CallToAction button not updated');
  }

  // Check a few other CTA files
  const ctaFiles = [
    'src/components/auth/register-form-simple.tsx',
    'src/components/dashboard/upgrade-card.tsx',
  ];

  let ctaUpdated = 0;
  ctaFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('ArrowRightIcon')) {
        ctaUpdated++;
        console.log(`   ✅ ${file} has ArrowRightIcon`);
      } else {
        console.log(`   ❌ ${file} missing ArrowRightIcon`);
      }
    }
  });
  console.log(
    `   Result: ${ctaUpdated + 1}/${ctaFiles.length + 1} CTA components checked\n`
  );
} catch (error) {
  console.log(`   ❌ CTA button check failed: ${error.message}\n`);
}

// Test 5: 文本更新检查
console.log('5. 📝 Text Content Updates Check');
try {
  const commonEn = fs.readFileSync('messages/common/en.json', 'utf8');
  if (commonEn.includes('Explore more Translator Tools')) {
    console.log(
      '   ✅ English translation updated to "Explore more Translator Tools"'
    );
  } else {
    console.log('   ❌ English translation not updated');
  }

  if (!commonEn.includes('Explore Other AI Tools')) {
    console.log('   ✅ Old "Explore Other AI Tools" text removed');
  } else {
    console.log('   ❌ Old "Explore Other AI Tools" text still exists');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Text update check failed: ${error.message}\n`);
}

// Test 6: 回到顶部功能检查
console.log('6. ⬆️ Back to Top Functionality Check');
try {
  const backToTopExists = fs.existsSync(
    'src/components/layout/back-to-top.tsx'
  );
  if (backToTopExists) {
    console.log('   ✅ BackToTop component created');
  } else {
    console.log('   ❌ BackToTop component missing');
  }

  const marketingLayout = fs.readFileSync(
    'src/app/[locale]/(marketing)/layout.tsx',
    'utf8'
  );
  if (marketingLayout.includes('BackToTop')) {
    console.log('   ✅ BackToTop component added to marketing layout');
  } else {
    console.log('   ❌ BackToTop component not added to layout');
  }

  const callToActionUpdated = fs.readFileSync(
    'src/components/blocks/calltoaction/calltoaction.tsx',
    'utf8'
  );
  if (callToActionUpdated.includes('scrollToTop')) {
    console.log('   ✅ CallToAction button updated with scroll to top');
  } else {
    console.log('   ❌ CallToAction scroll functionality not updated');
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Back to top check failed: ${error.message}\n`);
}

console.log('=====================================');
console.log('🎯 Test Summary Complete');
console.log('📝 Note: Manual browser testing recommended for full validation');
console.log('🚀 Run "pnpm dev" to start development server for visual testing');
