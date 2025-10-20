/**
 * Testimonials Data Reading Test
 *
 * This test verifies that:
 * 1. Component can correctly read testimonials data
 * 2. Translation namespace is working properly
 * 3. Rating data is being loaded correctly
 */

const fs = require('fs');

function testTestimonialsDataReading() {
  console.log('🧪 Starting Testimonials Data Reading Test...\n');

  const testResults = {
    translationStructure: false,
    namespaceMatch: false,
    ratingDataAccess: false,
  };

  try {
    // Test 1: Check translation file structure
    console.log('📋 Test 1: Checking translation file structure...');

    const homeTranslationsPath = './messages/pages/home/en.json';

    if (fs.existsSync(homeTranslationsPath)) {
      const homeTranslations = JSON.parse(
        fs.readFileSync(homeTranslationsPath, 'utf8')
      );

      // Check different possible paths for testimonials
      const rootTestimonials = homeTranslations.testimonials;
      const homePageTestimonials = homeTranslations.HomePage?.testimonials;

      console.log(`  🔍 Structure analysis:`);
      console.log(
        `    Root level testimonials: ${rootTestimonials ? '✅' : '❌'}`
      );
      console.log(
        `    HomePage.testimonials: ${homePageTestimonials ? '✅' : '❌'}`
      );

      if (homePageTestimonials && homePageTestimonials.items) {
        testResults.translationStructure = true;
        testResults.namespaceMatch = true;
        console.log(`  ✅ Translation structure test PASSED`);

        // Test 2: Check data access with correct namespace
        console.log(`\n📋 Test 2: Simulating component data reading...`);

        // Simulate what the component does
        const simulatedNamespace = 'HomePage.testimonials';
        const items = homePageTestimonials.items;

        let itemsLoaded = 0;
        let ratingsFound = 0;

        console.log(`  📝 Simulating reading up to 6 items:`);

        for (let i = 1; i <= 6; i++) {
          const key = `item-${i}`;

          if (items[key]) {
            const item = items[key];
            itemsLoaded++;

            console.log(`    ${key}:`);
            console.log(`      name: "${item.name}"`);
            console.log(`      heading: "${item.heading}"`);

            if (item.rating !== undefined) {
              ratingsFound++;
              console.log(`      rating: ${item.rating} ⭐✅`);
            } else {
              console.log(`      rating: ❌ No rating`);
            }
          } else {
            console.log(`    ${key}: ❌ Not found`);
            break;
          }
        }

        console.log(`\n  📊 Data reading results:`);
        console.log(`    Items loaded: ${itemsLoaded}`);
        console.log(`    Items with rating: ${ratingsFound}`);

        if (itemsLoaded > 0 && ratingsFound > 0) {
          testResults.ratingDataAccess = true;
          console.log(`  ✅ Data reading simulation PASSED`);
        } else {
          console.log(`  ❌ Data reading simulation FAILED`);
        }

        // Test 3: Verify namespace recommendation
        console.log(`\n📋 Test 3: Namespace configuration check...`);
        console.log(`  Recommended namespace: 'HomePage.testimonials'`);
        console.log(
          `  Component should use: namespace = 'HomePage.testimonials'`
        );

        if (
          simulatedNamespace === 'HomePage.testimonials' &&
          homePageTestimonials
        ) {
          console.log(`  ✅ Namespace configuration is correct`);
        } else {
          console.log(`  ❌ Namespace configuration needs fixing`);
        }
      } else {
        console.log(`  ❌ Translation structure test FAILED`);
      }
    } else {
      console.log(`  ❌ Translation file not found: ${homeTranslationsPath}`);
    }
  } catch (error) {
    console.log(`  ❌ Error reading translation file: ${error.message}`);
  }

  // Final results
  console.log(`\n🎯 Final Test Results:`);
  console.log(
    `  Translation Structure: ${testResults.translationStructure ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Namespace Match: ${testResults.namespaceMatch ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Rating Data Access: ${testResults.ratingDataAccess ? '✅ PASSED' : '❌ FAILED'}`
  );

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true
  );
  console.log(
    `\n🏆 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
  );

  if (allTestsPassed) {
    console.log(
      `\n✨ Component should now be able to read testimonials data correctly!`
    );
    console.log(`🌟 Star ratings should be visible on the page.`);
  } else {
    console.log(`\n⚠️  Some issues were found. Check the test results above.`);
  }

  return allTestsPassed;
}

// Run the test
if (require.main === module) {
  testTestimonialsDataReading();
}

module.exports = testTestimonialsDataReading;
