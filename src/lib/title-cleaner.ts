/**
 * Utility functions to clean and protect page titles
 */

/**
 * Remove unwanted suffixes from page title
 * @param title The title to clean
 * @returns Cleaned title
 */
export function cleanTitle(title: string): string {
  // Remove [Image #X] patterns and other unwanted suffixes
  return title.replace(/\s*\[Image\s*#\d+\]\s*/g, '').trim();
}

/**
 * Set page title with protection against unwanted modifications
 * @param title The desired title
 */
export function setProtectedTitle(title: string): void {
  if (typeof window !== 'undefined') {
    const cleanTitleValue = cleanTitle(title);
    document.title = cleanTitleValue;

    // Store original title in a global variable for later restoration
    (window as any).__originalTitle = cleanTitleValue;
  }
}

/**
 * Restore original title if it has been modified
 */
export function restoreOriginalTitle(): void {
  if (typeof window !== 'undefined' && (window as any).__originalTitle) {
    document.title = (window as any).__originalTitle;
  }
}

/**
 * Check if current title has unwanted suffixes
 * @returns True if title has unwanted suffixes
 */
export function hasTitleCorruption(): boolean {
  if (typeof window === 'undefined') return false;
  return /\[Image\s*#\d+\]/.test(document.title);
}
