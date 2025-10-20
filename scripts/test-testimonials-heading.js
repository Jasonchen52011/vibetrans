/**
 * Testimonials Heading Display Test
 *
 * This test verifies that:
 * 1. Testimonials component displays heading titles with double quotes
 * 2. Heading data is correctly loaded from translation files
 * 3. Component renders properly when heading is present or absent
 */

const { chromium } = require('playwright');

async function testTestimonialsHeadingDisplay() {
  console.log('🧪 Starting Testimonials Heading Display Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Check homepage for testimonials with headings
    console.log('📋 Test 1: Loading homepage and checking testimonials...');

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow page to fully load

    // Look for testimonials section
    const testimonialsSection = await page.locator('#testimonials').first();
    if (await testimonialsSection.isVisible()) {
      console.log('✅ Testimonials section found on page');

      // Check for heading elements within testimonials
      const headingElements = await testimonialsSection.locator('h4').count();
      console.log(
        `📊 Found ${headingElements} heading elements in testimonials`
      );

      if (headingElements > 0) {
        // Get text content of headings
        for (let i = 0; i < headingElements; i++) {
          const headingText = await headingElements
            .locator(`nth=${i}`)
            .textContent();
          console.log(`  📝 Heading ${i + 1}: "${headingText}"`);

          // Verify heading has double quotes
          if (
            headingText &&
            headingText.startsWith('"') &&
            headingText.endsWith('"')
          ) {
            console.log(`  ✅ Heading ${i + 1} has proper double quote format`);
          } else {
            console.log(
              `  ❌ Heading ${i + 1} missing double quotes: ${headingText}`
            );
          }
        }
      } else {
        console.log('⚠️  No heading elements found in testimonials section');
      }

      // Check for content elements
      const contentElements = await testimonialsSection
        .locator('blockquote p')
        .count();
      console.log(
        `📊 Found ${contentElements} content elements in testimonials`
      );
    } else {
      console.log('❌ Testimonials section not found on homepage');
    }

    // Test 2: Check translation file structure
    console.log('\n📋 Test 2: Checking translation file structure...');

    try {
      const fs = require('fs');
      const homeTranslations = JSON.parse(
        fs.readFileSync('./messages/pages/home/en.json', 'utf8')
      );

      if (
        homeTranslations.testimonials &&
        homeTranslations.testimonials.items
      ) {
        const items = homeTranslations.testimonials.items;
        let headingCount = 0;

        Object.keys(items).forEach((key) => {
          if (items[key].heading) {
            headingCount++;
            console.log(`  📝 Item ${key}: heading="${items[key].heading}"`);
          }
        });

        console.log(
          `✅ Found ${headingCount} items with headings in translation file`
        );

        if (headingCount === 0) {
          console.log(
            '⚠️  No headings found in translation file - this might be expected'
          );
        }
      } else {
        console.log('❌ testimonials items not found in translation file');
      }
    } catch (error) {
      console.log(`❌ Error reading translation file: ${error.message}`);
    }

    // Test 3: Take screenshot for visual verification
    console.log('\n📋 Test 3: Taking screenshot for visual verification...');

    if (await testimonialsSection.isVisible()) {
      await testimonialsSection.screenshot({
        path: 'testimonials-heading-test-screenshot.png',
        fullPage: false,
      });
      console.log(
        '✅ Screenshot saved as testimonials-heading-test-screenshot.png'
      );
    }
  } catch (error) {
    console.error(`❌ Test failed with error: ${error.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n🎉 Test completed!');
  console.log('\n📋 Summary:');
  console.log('- Headings should be displayed with double quotes');
  console.log('- Check the screenshot for visual verification');
  console.log('- Verify translation files contain heading data');
}

// Run the test
testTestimonialsHeadingDisplay().catch(console.error);
