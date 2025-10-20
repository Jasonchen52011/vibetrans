/**
 * Static Testimonials Heading Test
 *
 * This test verifies:
 * 1. Translation files contain heading data
 * 2. Component structure supports heading display
 * 3. Heading format validation
 */

const fs = require('fs');

function testTestimonialsStructure() {
  console.log('🧪 Starting Static Testimonials Structure Test...\n');

  const testResults = {
    translationFileTest: false,
    componentStructureTest: false,
    headingFormatTest: false,
  };

  try {
    // Test 1: Check translation files contain heading data
    console.log('📋 Test 1: Checking translation file structure...');

    const homeTranslationsPath = './messages/pages/home/en.json';

    if (fs.existsSync(homeTranslationsPath)) {
      const homeTranslations = JSON.parse(
        fs.readFileSync(homeTranslationsPath, 'utf8')
      );

      // Check if testimonials exists at root level or nested
      let testimonials = homeTranslations.testimonials;

      // If not at root, check for HomePage nesting
      if (
        !testimonials &&
        homeTranslations.HomePage &&
        homeTranslations.HomePage.testimonials
      ) {
        testimonials = homeTranslations.HomePage.testimonials;
      }

      if (testimonials && testimonials.items) {
        const items = testimonials.items;
        let headingCount = 0;
        let allItemsHaveHeading = true;

        Object.keys(items).forEach((key) => {
          const item = items[key];
          console.log(`  📝 Item ${key}:`);
          console.log(`    name: "${item.name}"`);
          console.log(`    role: "${item.role}"`);

          if (item.heading) {
            headingCount++;
            console.log(`    heading: "${item.heading}" ✅`);

            // Check if heading has proper content
            if (
              typeof item.heading === 'string' &&
              item.heading.trim().length > 0
            ) {
              console.log(`    ✅ Heading has valid content`);
            } else {
              console.log(`    ⚠️  Heading content is empty or invalid`);
            }
          } else {
            allItemsHaveHeading = false;
            console.log(`    ❌ No heading found`);
          }

          if (item.content) {
            console.log(
              `    content: "${item.content.substring(0, 50)}..." ✅`
            );
          } else {
            console.log(`    ❌ No content found`);
          }
        });

        console.log(`\n  📊 Results:`);
        console.log(`    Total items: ${Object.keys(items).length}`);
        console.log(`    Items with heading: ${headingCount}`);
        console.log(`    All items have heading: ${allItemsHaveHeading}`);

        if (headingCount > 0) {
          testResults.translationFileTest = true;
          console.log(`  ✅ Translation file test PASSED`);
        } else {
          console.log(`  ❌ Translation file test FAILED - no headings found`);
        }
      } else {
        console.log(`  ❌ testimonials items not found in translation file`);
      }
    } else {
      console.log(`  ❌ Translation file not found: ${homeTranslationsPath}`);
    }
  } catch (error) {
    console.log(`  ❌ Error reading translation file: ${error.message}`);
  }

  try {
    // Test 2: Check component structure supports heading display
    console.log(`\n📋 Test 2: Checking component structure...`);

    const componentPath =
      './src/components/blocks/testimonials/testimonials-three-column.tsx';

    if (fs.existsSync(componentPath)) {
      const componentContent = fs.readFileSync(componentPath, 'utf8');

      // Check if component references heading field
      const hasHeadingReference = componentContent.includes('item.heading');
      const hasHeadingDisplay = componentContent.includes('"{item.heading}"');
      const hasConditionalHeading =
        componentContent.includes('{item.heading &&');

      console.log(`  🔍 Component analysis:`);
      console.log(
        `    Has heading reference: ${hasHeadingReference ? '✅' : '❌'}`
      );
      console.log(
        `    Has heading display with quotes: ${hasHeadingDisplay ? '✅' : '❌'}`
      );
      console.log(
        `    Has conditional heading: ${hasConditionalHeading ? '✅' : '❌'}`
      );

      if (hasHeadingReference && hasHeadingDisplay) {
        testResults.componentStructureTest = true;
        console.log(`  ✅ Component structure test PASSED`);
      } else {
        console.log(`  ❌ Component structure test FAILED`);
      }

      // Test 3: Check heading format in component
      console.log(`\n📋 Test 3: Checking heading format...`);

      if (hasHeadingDisplay) {
        // Extract the heading display line
        const lines = componentContent.split('\n');
        const headingLine = lines.find((line) =>
          line.includes('"{item.heading}"')
        );

        if (headingLine) {
          console.log(`    Found heading display: ${headingLine.trim()}`);

          // Check if it's wrapped in quotes
          if (
            headingLine.includes('"') &&
            headingLine.includes('{item.heading}')
          ) {
            testResults.headingFormatTest = true;
            console.log(
              `  ✅ Heading format test PASSED - double quotes found`
            );
          } else {
            console.log(
              `  ❌ Heading format test FAILED - double quotes missing`
            );
          }
        }
      }
    } else {
      console.log(`  ❌ Component file not found: ${componentPath}`);
    }
  } catch (error) {
    console.log(`  ❌ Error reading component file: ${error.message}`);
  }

  // Final results
  console.log(`\n🎯 Final Test Results:`);
  console.log(
    `  Translation File Test: ${testResults.translationFileTest ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Component Structure Test: ${testResults.componentStructureTest ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Heading Format Test: ${testResults.headingFormatTest ? '✅ PASSED' : '❌ FAILED'}`
  );

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true
  );
  console.log(
    `\n🏆 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
  );

  if (allTestsPassed) {
    console.log(
      `\n✨ Congratulations! Testimonials heading display is working correctly.`
    );
    console.log(
      `📝 Headings will be displayed with double quotes as requested.`
    );
  } else {
    console.log(
      `\n⚠️  Some issues were found. Please review the test results above.`
    );
  }

  return allTestsPassed;
}

// Run the test
if (require.main === module) {
  testTestimonialsStructure();
}

module.exports = testTestimonialsStructure;
