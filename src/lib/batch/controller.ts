import { TwitterUrl } from '../twitter/url-classifier';
import {
  BatchConfig,
  BatchProgress,
  BatchStats,
  DEFAULT_CONFIG,
  createBatches,
  processBatch
} from './processor';

export interface BatchControllerOptions extends BatchConfig {
  onProgress?: (progress: BatchProgress) => void;
  onComplete?: (stats: BatchStats) => void;
  onError?: (error: Error) => void;
}

export class BatchController {
  private config: BatchControllerOptions;
  private progress: BatchProgress;

  constructor(options: BatchControllerOptions = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.progress = this.createInitialProgress();
  }

  private createInitialProgress(): BatchProgress {
    return {
      batchId: crypto.randomUUID(),
      stats: {
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        totalBatches: 0,
        completedBatches: 0,
        processingTime: 0
      },
      status: 'queued'
    };
  }

  private updateProgress(update: Partial<BatchProgress>) {
    this.progress = { ...this.progress, ...update };
    if (this.config.onProgress) {
      this.config.onProgress(this.progress);
    }
  }

  async processBatches<T extends TwitterUrl, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> {
    const startTime = Date.now();
    const batches = createBatches(items, this.config);
    const allResults: R[] = [];
    const allErrors: Array<{ item: T; error: Error }> = [];

    this.updateProgress({
      status: 'processing',
      startedAt: new Date().toISOString(),
      stats: {
        ...this.progress.stats,
        totalBatches: batches.length
      }
    });

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const { results, errors } = await processBatch(batch, processor, this.config);
        
        allResults.push(...results);
        allErrors.push(...errors);

        this.updateProgress({
          stats: {
            ...this.progress.stats,
            totalProcessed: allResults.length + allErrors.length,
            successCount: allResults.length,
            failureCount: allErrors.length,
            completedBatches: i + 1,
            processingTime: Date.now() - startTime
          }
        });
      }

      this.updateProgress({
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      if (this.config.onComplete) {
        this.config.onComplete(this.progress.stats);
      }

      return { results: allResults, errors: allErrors };

    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      
      this.updateProgress({
        status: 'failed',
        error: typedError.message,
        completedAt: new Date().toISOString()
      });

      if (this.config.onError) {
        this.config.onError(typedError);
      }

      throw typedError;
    }
  }

  getCurrentProgress(): BatchProgress {
    return this.progress;
  }
}
