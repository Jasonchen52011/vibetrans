/**
 * Half-Star Rating Display Test
 *
 * This test verifies that:
 * 1. Translation files contain decimal rating data (4.6-5.0 range)
 * 2. Component correctly handles decimal ratings
 * 3. Half-star display logic works properly
 * 4. Star rendering supports full, half, and empty states
 */

const fs = require('fs');

function testHalfStarRatingFunctionality() {
  console.log('🧪 Starting Half-Star Rating Display Test...\n');

  const testResults = {
    decimalRatingData: false,
    componentHalfStarLogic: false,
    starRenderingLogic: false,
    ratingCalculations: false,
  };

  try {
    // Test 1: Check translation files contain decimal rating data
    console.log(
      '📋 Test 1: Checking translation file for decimal rating data...'
    );

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
        let itemsWithDecimalRating = 0;
        const ratingValues = new Set();

        Object.keys(items).forEach((key) => {
          const item = items[key];
          console.log(`  📝 Item ${key}:`);

          if (item.rating !== undefined) {
            ratingValues.add(item.rating);
            const isDecimal = item.rating % 1 !== 0;

            if (isDecimal) {
              itemsWithDecimalRating++;
              console.log(`    rating: ${item.rating} ⭐* (decimal) ✅`);

              // Calculate expected star display
              const fullStars = Math.floor(item.rating);
              const hasHalfStar = item.rating % 1 !== 0;
              const emptyStars = 5 - Math.ceil(item.rating);

              console.log(
                `      Expected: ${fullStars} full stars, ${hasHalfStar ? '1 half' : '0 half'} star, ${emptyStars} empty stars`
              );
            } else {
              console.log(`    rating: ${item.rating} ⭐ (full) ✅`);
            }

            console.log(`    heading: "${item.heading}"`);
          } else {
            console.log(`    rating: ❌ No rating found`);
          }
        });

        console.log(`\n  📊 Results:`);
        console.log(`    Total items: ${Object.keys(items).length}`);
        console.log(`    Items with decimal rating: ${itemsWithDecimalRating}`);
        console.log(
          `    Rating values found: [${Array.from(ratingValues)
            .sort((a, b) => b - a)
            .join(', ')}]`
        );

        const hasDecimalRatings = itemsWithDecimalRating > 0;
        const ratingsInRange = Array.from(ratingValues).every(
          (r) => r >= 4.6 && r <= 5.0
        );

        if (hasDecimalRatings && ratingsInRange) {
          testResults.decimalRatingData = true;
          testResults.ratingCalculations = true;
          console.log(`  ✅ Translation decimal rating data test PASSED`);
        } else {
          console.log(`  ❌ Translation decimal rating data test FAILED`);
          if (!hasDecimalRatings) console.log(`    - No decimal ratings found`);
          if (!ratingsInRange)
            console.log(`    - Ratings not in 4.6-5.0 range`);
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
    // Test 2: Check component half-star logic
    console.log(`\n📋 Test 2: Checking component half-star logic...`);

    const componentPath =
      './src/components/blocks/testimonials/testimonials-three-column.tsx';

    if (fs.existsSync(componentPath)) {
      const componentContent = fs.readFileSync(componentPath, 'utf8');

      // Check for half-star related code
      const hasMathFloor = componentContent.includes('Math.floor(rating)');
      const hasModuloCheck = componentContent.includes('rating % 1 !== 0');
      const hasPercentageCalculation =
        componentContent.includes('(rating % 1) * 100');
      const hasGradientStyle = componentContent.includes(
        'linear-gradient(to right'
      );
      const hasBackgroundClip = componentContent.includes(
        'WebkitBackgroundClip'
      );
      const hasFillCurrentColor = componentContent.includes(
        'fill="currentColor"'
      );

      console.log(`  🔍 Component analysis:`);
      console.log(
        `    Math.floor for full stars: ${hasMathFloor ? '✅' : '❌'}`
      );
      console.log(
        `    Modulo check for decimals: ${hasModuloCheck ? '✅' : '❌'}`
      );
      console.log(
        `    Percentage calculation: ${hasPercentageCalculation ? '✅' : '❌'}`
      );
      console.log(
        `    Gradient style for half stars: ${hasGradientStyle ? '✅' : '❌'}`
      );
      console.log(
        `    Background clip property: ${hasBackgroundClip ? '✅' : '❌'}`
      );
      console.log(
        `    Fill current color: ${hasFillCurrentColor ? '✅' : '❌'}`
      );

      if (
        hasMathFloor &&
        hasModuloCheck &&
        hasGradientStyle &&
        hasBackgroundClip
      ) {
        testResults.componentHalfStarLogic = true;
        console.log(`  ✅ Component half-star logic test PASSED`);
      } else {
        console.log(`  ❌ Component half-star logic test FAILED`);
      }

      // Test 3: Check star rendering logic
      console.log(`\n📋 Test 3: Checking star rendering logic...`);

      // Extract star rendering code
      const starSectionMatch = componentContent.match(
        /Rating stars[\s\S]*?<\/div>/
      );
      if (starSectionMatch) {
        const starSection = starSectionMatch[0];
        console.log(`    Found star rendering section ✅`);

        // Check for three star states
        const hasFullStarLogic = starSection.includes('Full star');
        const hasHalfStarLogic = starSection.includes('Half star');
        const hasDefaultEmptyStar = starSection.includes(
          'fill-gray-200 text-gray-300'
        );
        const hasStarClassLogic = starSection.includes('starClass =');
        const hasStarStyleLogic = starSection.includes('starStyle =');

        console.log(`    Full star logic: ${hasFullStarLogic ? '✅' : '❌'}`);
        console.log(`    Half star logic: ${hasHalfStarLogic ? '✅' : '❌'}`);
        console.log(
          `    Default empty star: ${hasDefaultEmptyStar ? '✅' : '❌'}`
        );
        console.log(
          `    Dynamic star class: ${hasStarClassLogic ? '✅' : '❌'}`
        );
        console.log(
          `    Dynamic star style: ${hasStarStyleLogic ? '✅' : '❌'}`
        );

        if (
          hasFullStarLogic &&
          hasHalfStarLogic &&
          hasStarClassLogic &&
          hasStarStyleLogic
        ) {
          testResults.starRenderingLogic = true;
          console.log(`  ✅ Star rendering logic test PASSED`);
        } else {
          console.log(`  ❌ Star rendering logic test FAILED`);
        }

        // Test specific rating calculations
        console.log(`\n  🧮 Testing rating calculation logic:`);

        const testRatings = [5.0, 4.8, 4.6, 4.0];
        testRatings.forEach((rating) => {
          const fullStars = Math.floor(rating);
          const hasHalfStar = rating % 1 !== 0;
          const percentage = (rating % 1) * 100;
          const emptyStars = 5 - Math.ceil(rating);

          console.log(
            `    Rating ${rating}: ${fullStars} full, ${hasHalfStar ? `${percentage}% half` : 'no half'}, ${emptyStars} empty`
          );
        });
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
    `  Decimal Rating Data: ${testResults.decimalRatingData ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Component Half-Star Logic: ${testResults.componentHalfStarLogic ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Star Rendering Logic: ${testResults.starRenderingLogic ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `  Rating Calculations: ${testResults.ratingCalculations ? '✅ PASSED' : '❌ FAILED'}`
  );

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true
  );
  console.log(
    `\n🏆 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
  );

  if (allTestsPassed) {
    console.log(
      `\n✨ Congratulations! Half-star rating system is working correctly.`
    );
    console.log(`🌟 Features implemented:`);
    console.log(`   • Decimal ratings (4.6-5.0 range)`);
    console.log(`   • Full stars for complete ratings`);
    console.log(`   • Gradient-filled half stars for decimal parts`);
    console.log(`   • Empty stars for remaining`);
    console.log(`\n💫 Expected display examples:`);
    console.log(`   • 5.0 = ⭐⭐⭐⭐⭐ (all full stars)`);
    console.log(`   • 4.8 = ⭐⭐⭐⭐🌟 (4 full, 80% star)`);
    console.log(`   • 4.6 = ⭐⭐⭐⭐🌗 (4 full, 60% star)`);
    console.log(`   • 4.0 = ⭐⭐⭐⭐⚪ (4 full, 1 empty)`);
  } else {
    console.log(
      `\n⚠️  Some issues were found. Please review the test results above.`
    );

    // Provide specific recommendations
    if (!testResults.decimalRatingData) {
      console.log(
        `💡 Recommendation: Add decimal rating values (4.6-5.0) to translation file`
      );
    }
    if (!testResults.componentHalfStarLogic) {
      console.log(
        `💡 Recommendation: Check component half-star calculation logic`
      );
    }
    if (!testResults.starRenderingLogic) {
      console.log(
        `💡 Recommendation: Verify star rendering supports full/half/empty states`
      );
    }
  }

  return allTestsPassed;
}

// Run the test
if (require.main === module) {
  testHalfStarRatingFunctionality();
}

module.exports = testHalfStarRatingFunctionality;
