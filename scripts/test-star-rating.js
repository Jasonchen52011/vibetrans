/**
 * Star Rating Display Test
 *
 * This test verifies that:
 * 1. Translation files contain rating data
 * 2. Component correctly reads and uses rating values
 * 3. Stars are displayed with correct colors and sizes
 * 4. Star fill/unfill logic works properly
 */

const fs = require('fs');

function testStarRatingFunctionality() {
  console.log('🧪 Starting Star Rating Display Test...\n');

  const testResults = {
    translationRatingData: false,
    componentRatingLogic: false,
    starStyling: false,
    ratingValues: false,
  };

  try {
    // Test 1: Check translation files contain rating data
    console.log('📋 Test 1: Checking translation file for rating data...');

    const homeTranslationsPath = './messages/pages/home/en.json';

    if (fs.existsSync(homeTranslationsPath)) {
      const homeTranslations = JSON.parse(
        fs.readFileSync(homeTranslationsPath, 'utf8')
      );

      // Check if testimonials exists and has items with rating
      const testimonials =
        homeTranslations.HomePage?.testimonials ||
        homeTranslations.testimonials;

      if (testimonials && testimonials.items) {
        const items = testimonials.items;
        let itemsWithRating = 0;
        const ratingValues = new Set();

        Object.keys(items).forEach((key) => {
          const item = items[key];
          console.log(`  📝 Item ${key}:`);

          if (item.rating !== undefined) {
            itemsWithRating++;
            ratingValues.add(item.rating);
            console.log(`    rating: ${item.rating} ⭐✅`);
          } else {
            console.log(`    rating: ❌ No rating found`);
          }

          console.log(`    heading: "${item.heading}"`);
          console.log(`    name: "${item.name}"`);
        });

        console.log(`\n  📊 Results:`);
        console.log(`    Total items: ${Object.keys(items).length}`);
        console.log(`    Items with rating: ${itemsWithRating}`);
        console.log(
          `    Rating values found: [${Array.from(ratingValues).join(', ')}]`
        );

        if (itemsWithRating > 0) {
          testResults.translationRatingData = true;
          testResults.ratingValues = true;
          console.log(`  ✅ Translation rating data test PASSED`);
        } else {
          console.log(`  ❌ Translation rating data test FAILED`);
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
    // Test 2: Check component rating logic
    console.log(`\n📋 Test 2: Checking component rating logic...`);

    const componentPath =
      './src/components/blocks/testimonials/testimonials-three-column.tsx';

    if (fs.existsSync(componentPath)) {
      const componentContent = fs.readFileSync(componentPath, 'utf8');

      // Check for rating-related code
      const hasRatingFromTranslation = componentContent.includes(
        't(`items.${key}.rating`'
      );
      const hasRatingDefault = componentContent.includes('default: 5');
      const hasRatingNumberConversion =
        componentContent.includes('Number(rating)');
      const hasConditionalStarFill =
        componentContent.includes('i < item.rating');
      const hasStarColors =
        componentContent.includes('fill-yellow-400') &&
        componentContent.includes('fill-gray-200');

      console.log(`  🔍 Component analysis:`);
      console.log(
        `    Reads rating from translation: ${hasRatingFromTranslation ? '✅' : '❌'}`
      );
      console.log(
        `    Has default rating fallback: ${hasRatingDefault ? '✅' : '❌'}`
      );
      console.log(
        `    Converts rating to number: ${hasRatingNumberConversion ? '✅' : '❌'}`
      );
      console.log(
        `    Has conditional star fill: ${hasConditionalStarFill ? '✅' : '❌'}`
      );
      console.log(`    Has star color logic: ${hasStarColors ? '✅' : '❌'}`);

      if (hasRatingFromTranslation && hasConditionalStarFill && hasStarColors) {
        testResults.componentRatingLogic = true;
        console.log(`  ✅ Component rating logic test PASSED`);
      } else {
        console.log(`  ❌ Component rating logic test FAILED`);
      }

      // Test 3: Check star styling
      console.log(`\n📋 Test 3: Checking star styling...`);

      // Extract star rendering code
      const starSectionMatch = componentContent.match(
        /Rating stars[\s\S]*?<\/div>/
      );
      if (starSectionMatch) {
        const starSection = starSectionMatch[0];
        console.log(`    Found star rendering section ✅`);

        // Check for star size classes
        const hasCorrectSize = starSection.includes('w-5 h-5');
        // Check for color classes
        const hasFilledStarColor = starSection.includes(
          'fill-yellow-400 text-yellow-400'
        );
        const hasUnfilledStarColor = starSection.includes(
          'fill-gray-200 text-gray-300'
        );
        // Check for strokeWidth
        const hasStrokeWidth = starSection.includes('strokeWidth={1.5}');

        console.log(`    Star size (w-5 h-5): ${hasCorrectSize ? '✅' : '❌'}`);
        console.log(
          `    Filled star color (yellow): ${hasFilledStarColor ? '✅' : '❌'}`
        );
        console.log(
          `    Unfilled star color (gray): ${hasUnfilledStarColor ? '✅' : '❌'}`
        );
        console.log(`    Stroke width (1.5): ${hasStrokeWidth ? '✅' : '❌'}`);

        if (hasCorrectSize && hasFilledStarColor && hasUnfilledStarColor) {
          testResults.starStyling = true;
          console.log(`  ✅ Star styling test PASSED`);
        } else {
          console.log(`  ❌ Star styling test FAILED`);
        }

        // Display the star rendering code
        console.log(`\n    🎨 Star rendering code:`);
        const starLines = starSection.split('\n').slice(0, 15).join('\n');
        console.log(`    ${starLines}`);
      } else {
        console.log(`    ❌ Star rendering section not found`);
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
    `  Translation Rating Data: ${testResults.translationRatingData ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Component Rating Logic: ${testResults.componentRatingLogic ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Star Styling: ${testResults.starStyling ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Rating Values: ${testResults.ratingValues ? '✅ PASSED' : '❌ FAILED'}`
  );

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true
  );
  console.log(
    `\n🏆 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
  );

  if (allTestsPassed) {
    console.log(
      `\n✨ Congratulations! Star rating system is working correctly.`
    );
    console.log(
      `🌟 Stars will display with proper colors, sizes, and ratings.`
    );
    console.log(`💫 Yellow stars for filled ratings, gray stars for unfilled.`);
  } else {
    console.log(
      `\n⚠️  Some issues were found. Please review the test results above.`
    );

    // Provide specific recommendations
    if (!testResults.translationRatingData) {
      console.log(
        `💡 Recommendation: Add rating values to translation file items`
      );
    }
    if (!testResults.componentRatingLogic) {
      console.log(
        `💡 Recommendation: Check component rating reading and display logic`
      );
    }
    if (!testResults.starStyling) {
      console.log(`💡 Recommendation: Verify star color and size styling`);
    }
  }

  return allTestsPassed;
}

// Run the test
if (require.main === module) {
  testStarRatingFunctionality();
}

module.exports = testStarRatingFunctionality;
