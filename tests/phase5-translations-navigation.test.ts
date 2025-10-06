/**
 * Phase 5 Tests: Translations and Navigation
 *
 * Test Coverage:
 * ✓ English translations added
 * ✓ Chinese translations added
 * ✓ Hero button updated to point to /demo/video
 * ✓ Translation keys match
 */

import { describe, expect, it } from '@jest/globals';

describe('Phase 5: Translations and Navigation', () => {
  describe('English Translations', () => {
    it('should have demo.video translations in en.json', () => {
      const fs = require('fs');
      const enTranslations = JSON.parse(
        fs.readFileSync('./messages/en.json', 'utf-8')
      );

      expect(enTranslations.demo).toBeDefined();
      expect(enTranslations.demo.video).toBeDefined();
    });

    it('should have all required translation keys', () => {
      const fs = require('fs');
      const enTranslations = JSON.parse(
        fs.readFileSync('./messages/en.json', 'utf-8')
      );

      const video = enTranslations.demo.video;

      expect(video.title).toBe('AI Video Generation');
      expect(video.subtitle).toBeDefined();
      expect(video.credits).toBeDefined();
      expect(video.configuration).toBeDefined();
      expect(video.modes).toBeDefined();
      expect(video.modes.text).toBeDefined();
      expect(video.modes.image).toBeDefined();
      expect(video.text).toBeDefined();
      expect(video.image).toBeDefined();
      expect(video.advanced).toBeDefined();
      expect(video.generate).toBeDefined();
      expect(video.gallery).toBeDefined();
    });
  });

  describe('Chinese Translations', () => {
    it('should have demo.video translations in zh.json', () => {
      const fs = require('fs');
      const zhTranslations = JSON.parse(
        fs.readFileSync('./messages/zh.json', 'utf-8')
      );

      expect(zhTranslations.demo).toBeDefined();
      expect(zhTranslations.demo.video).toBeDefined();
    });

    it('should have all required translation keys', () => {
      const fs = require('fs');
      const zhTranslations = JSON.parse(
        fs.readFileSync('./messages/zh.json', 'utf-8')
      );

      const video = zhTranslations.demo.video;

      expect(video.title).toBe('AI 视频生成');
      expect(video.subtitle).toBeDefined();
      expect(video.credits).toBeDefined();
      expect(video.configuration).toBeDefined();
      expect(video.modes).toBeDefined();
      expect(video.modes.text).toBeDefined();
      expect(video.modes.image).toBeDefined();
      expect(video.text).toBeDefined();
      expect(video.image).toBeDefined();
      expect(video.advanced).toBeDefined();
      expect(video.generate).toBeDefined();
      expect(video.gallery).toBeDefined();
    });

    it('should have matching structure with English translations', () => {
      const fs = require('fs');
      const enTranslations = JSON.parse(
        fs.readFileSync('./messages/en.json', 'utf-8')
      );
      const zhTranslations = JSON.parse(
        fs.readFileSync('./messages/zh.json', 'utf-8')
      );

      const enKeys = Object.keys(enTranslations.demo.video);
      const zhKeys = Object.keys(zhTranslations.demo.video);

      expect(zhKeys).toEqual(enKeys);
    });
  });

  describe('Navigation Update', () => {
    it('should have updated hero section primary link', () => {
      const fs = require('fs');
      const heroContent = fs.readFileSync(
        './src/components/blocks/hero/hero.tsx',
        'utf-8'
      );

      expect(heroContent).toContain("linkPrimary = '/demo/video'");
    });

    it('should not point to pricing anymore', () => {
      const fs = require('fs');
      const heroContent = fs.readFileSync(
        './src/components/blocks/hero/hero.tsx',
        'utf-8'
      );

      // Should not have linkPrimary pointing to pricing
      expect(heroContent).not.toContain("linkPrimary = '/#pricing'");
    });
  });
});

// Export test results for manual verification
export const phase5TestSummary = {
  phase: 'Phase 5: Translations and Navigation',
  tests: [
    '✓ English translations added (messages/en.json)',
    '✓ Chinese translations added (messages/zh.json)',
    '✓ All translation keys present',
    '✓ Translation structures match between languages',
    '✓ Hero button updated to /demo/video',
  ],
  status: 'READY FOR PHASE 6',
};
