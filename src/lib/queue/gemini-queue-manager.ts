/**
 * Gemini API Queue Manager
 * Manages concurrent requests to Google Generative AI API with rate limiting
 */

import pLimit from 'p-limit';

export interface QueueStats {
  activeCount: number;
  pendingCount: number;
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;
}

export interface QueueOptions {
  concurrency?: number; // Max concurrent requests (default: 5)
  retryAttempts?: number; // Number of retry attempts on failure (default: 3)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  timeout?: number; // Request timeout in ms (default: 30000)
}

class GeminiQueueManager {
  private limiter: ReturnType<typeof pLimit>;
  private options: Required<QueueOptions>;
  private stats: {
    totalProcessed: number;
    totalFailed: number;
    processingTimes: number[];
  };

  constructor(options: QueueOptions = {}) {
    this.options = {
      concurrency: options.concurrency ?? 5,
      retryAttempts: options.retryAttempts ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      timeout: options.timeout ?? 30000,
    };

    this.limiter = pLimit(this.options.concurrency);

    this.stats = {
      totalProcessed: 0,
      totalFailed: 0,
      processingTimes: [],
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('GeminiQueueManager initialized with options:', this.options);
    }
  }

  /**
   * Add a task to the queue with automatic retry logic
   */
  async enqueue<T>(
    task: () => Promise<T>,
    taskName = 'gemini-request'
  ): Promise<T> {
    return this.limiter(async () => {
      const startTime = Date.now();
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
        try {
          // Add timeout to the task
          const result = await this.withTimeout(task(), this.options.timeout);

          // Track success
          const processingTime = Date.now() - startTime;
          this.stats.totalProcessed++;
          this.stats.processingTimes.push(processingTime);

          // Keep only last 100 processing times to avoid memory leak
          if (this.stats.processingTimes.length > 100) {
            this.stats.processingTimes.shift();
          }

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[GeminiQueue] ${taskName} completed in ${processingTime}ms (attempt ${attempt})`
            );
          }

          return result;
        } catch (error) {
          lastError = error as Error;

          // Check if it's a rate limit error
          const isRateLimitError =
            error instanceof Error &&
            (error.message.includes('rate limit') ||
              error.message.includes('quota') ||
              error.message.includes('429'));

          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[GeminiQueue] ${taskName} failed (attempt ${attempt}/${this.options.retryAttempts}):`,
              error instanceof Error ? error.message : error
            );
          }

          // Don't retry on last attempt
          if (attempt === this.options.retryAttempts) {
            break;
          }

          // Calculate exponential backoff delay
          const delay = isRateLimitError
            ? this.options.retryDelay * attempt * 2 // Longer delay for rate limits
            : this.options.retryDelay * attempt;

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[GeminiQueue] Retrying ${taskName} in ${delay}ms...`
            );
          }

          await this.sleep(delay);
        }
      }

      // All attempts failed
      this.stats.totalFailed++;

      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[GeminiQueue] ${taskName} failed after ${this.options.retryAttempts} attempts`
        );
      }

      throw lastError || new Error('Task failed after all retry attempts');
    });
  }

  /**
   * Get current queue statistics
   */
  getStats(): QueueStats {
    const averageProcessingTime =
      this.stats.processingTimes.length > 0
        ? this.stats.processingTimes.reduce((a, b) => a + b, 0) /
          this.stats.processingTimes.length
        : 0;

    return {
      activeCount: this.limiter.activeCount,
      pendingCount: this.limiter.pendingCount,
      totalProcessed: this.stats.totalProcessed,
      totalFailed: this.stats.totalFailed,
      averageProcessingTime: Math.round(averageProcessingTime),
    };
  }

  /**
   * Clear queue statistics
   */
  clearStats(): void {
    this.stats.totalProcessed = 0;
    this.stats.totalFailed = 0;
    this.stats.processingTimes = [];
  }

  /**
   * Update queue concurrency limit
   */
  setConcurrency(concurrency: number): void {
    this.options.concurrency = concurrency;
    this.limiter = pLimit(concurrency);

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[GeminiQueue] Concurrency updated to ${concurrency}`
      );
    }
  }

  /**
   * Helper: Add timeout to a promise
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let queueManager: GeminiQueueManager | null = null;

/**
 * Get or create the singleton queue manager instance
 */
export function getGeminiQueueManager(
  options?: QueueOptions
): GeminiQueueManager {
  if (!queueManager) {
    queueManager = new GeminiQueueManager(options);
  }
  return queueManager;
}

/**
 * Reset the queue manager (mainly for testing)
 */
export function resetGeminiQueueManager(): void {
  queueManager = null;
}

export default GeminiQueueManager;
