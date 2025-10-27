'use client';

import { useEffect } from 'react';
import { setProtectedTitle, restoreOriginalTitle, hasTitleCorruption } from '@/lib/title-cleaner';

/**
 * Component to protect page title from unwanted modifications
 * Prevents external scripts or browser extensions from adding suffixes
 */
export default function TitleProtector() {
  useEffect(() => {
    // Store and protect the original title
    const originalTitle = document.title;
    setProtectedTitle(originalTitle);

    // Function to restore original title
    const restoreTitle = () => {
      if (hasTitleCorruption()) {
        restoreOriginalTitle();
      }
    };

    // Create a MutationObserver to watch for title changes
    const observer = new MutationObserver(() => {
      restoreTitle();
    });

    // Observe the title element
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    // Override document.title setter to catch modifications
    const originalTitleDescriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'title'
    );

    if (originalTitleDescriptor && originalTitleDescriptor.set) {
      Object.defineProperty(document, 'title', {
        set: function(value: string) {
          // Clean the title before setting
          const cleanValue = value.replace(/\s*\[Image\s*#\d+\]\s*/g, '');
          originalTitleDescriptor.set!.call(this, cleanValue);
        },
        get: function() {
          return originalTitleDescriptor.get?.call(this) || '';
        },
        configurable: true
      });
    }

    // Initial cleanup
    restoreTitle();

    // Set up periodic cleanup (every 50ms for more frequent checking)
    const interval = setInterval(restoreTitle, 50);

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      restoreOriginalTitle();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Restore original descriptor if possible
      if (originalTitleDescriptor) {
        Object.defineProperty(document, 'title', originalTitleDescriptor);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}