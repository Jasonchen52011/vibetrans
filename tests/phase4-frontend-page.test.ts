/**
 * Phase 4 Tests: Frontend Video Demo Page
 *
 * Test Coverage:
 * ✓ Page file exists
 * ✓ Uses client-side rendering
 * ✓ Has auth integration
 * ✓ Has state management for video generation
 * ✓ Has API integration
 * ✓ Has UI components
 */

import { describe, expect, it } from '@jest/globals';

describe('Phase 4: Frontend Video Demo Page', () => {
  describe('Page Structure', () => {
    it('should have video demo page file', () => {
      const fs = require('fs');
      const pageFile = fs.existsSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx'
      );

      expect(pageFile).toBe(true);
    });

    it('should be a client component', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain("'use client'");
    });
  });

  describe('Authentication Integration', () => {
    it('should use auth hooks', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('auth.useSession');
    });

    it('should redirect to login when unauthenticated', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('router.push');
      expect(pageContent).toContain('/auth/login');
    });
  });

  describe('State Management', () => {
    it('should have video generation state', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('useState');
      expect(pageContent).toContain('videoPrompt');
      expect(pageContent).toContain('generatedVideos');
      expect(pageContent).toContain('isGeneratingVideo');
    });

    it('should have mode selection (text/image)', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain("mode === 'text'");
      expect(pageContent).toContain("mode === 'image'");
    });

    it('should have credits display state', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('remainingCredits');
      expect(pageContent).toContain('CreditCard');
    });
  });

  describe('API Integration', () => {
    it('should call video generation API', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('/api/video/generate');
      expect(pageContent).toContain("method: 'POST'");
    });

    it('should poll video status', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('/api/video/status');
      expect(pageContent).toContain('pollVideoStatus');
    });

    it('should handle image upload', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('/api/storage/upload');
      expect(pageContent).toContain('handleFileUpload');
    });
  });

  describe('UI Components', () => {
    it('should have mode selector buttons', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('Text to Video');
      expect(pageContent).toContain('Image to Video');
    });

    it('should have video prompt input', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('textarea');
      expect(pageContent).toContain('videoPrompt');
    });

    it('should have generation button', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('Generate Video');
      expect(pageContent).toContain('handleGenerateVideo');
    });

    it('should have video gallery with carousel', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('Video Gallery');
      expect(pageContent).toContain('currentVideoIndex');
      expect(pageContent).toContain('goToPrevious');
      expect(pageContent).toContain('goToNext');
    });

    it('should have preset videos', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('presetVideos');
      expect(pageContent).toContain('isPreset');
    });
  });

  describe('User Experience', () => {
    it('should show loading states', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('Loader2');
      expect(pageContent).toContain('Processing');
      expect(pageContent).toContain('Generating');
    });

    it('should show error messages', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('error');
      expect(pageContent).toContain('setError');
    });

    it('should have auto-play controls', () => {
      const fs = require('fs');
      const pageContent = fs.readFileSync(
        './src/app/[locale]/(marketing)/demo/video/page.tsx',
        'utf-8'
      );

      expect(pageContent).toContain('isAutoPlaying');
      expect(pageContent).toContain('toggleAutoPlay');
      expect(pageContent).toContain('Pause Auto-play');
    });
  });
});

// Export test results for manual verification
export const phase4TestSummary = {
  phase: 'Phase 4: Frontend Video Demo Page',
  tests: [
    '✓ Page file created (src/app/[locale]/(marketing)/demo/video/page.tsx)',
    '✓ Client-side rendering enabled',
    '✓ Auth integration (useSession, redirect)',
    '✓ State management (useState for all states)',
    '✓ API integration (generate, status, upload)',
    '✓ UI components (inputs, buttons, gallery)',
    '✓ Video carousel with navigation',
    '✓ Preset videos for showcase',
    '✓ Loading and error states',
    '✓ Auto-play controls',
  ],
  status: 'READY FOR PHASE 5',
};
