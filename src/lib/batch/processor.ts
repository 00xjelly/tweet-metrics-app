import { TwitterUrl } from '../twitter/url-classifier';

export interface BatchConfig {
  maxBatchSize?: number;
  maxConcurrent?: number;
  delayBetweenBatches?: number; // in milliseconds
}

export interface BatchStats {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  totalBatches: number;
  completedBatches: number;
  processingTime: number;
}

export interface BatchProgress {
  batchId: string;
  stats: BatchStats;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 10,
  maxConcurrent: 3,
  delayBetweenBatches: 1000
};

export function createBatches<T extends TwitterUrl>(
  items: T[],
  config: BatchConfig = DEFAULT_CONFIG
): T[][] {
  const batchSize = config.maxBatchSize || DEFAULT_CONFIG.maxBatchSize!;
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

export async function processBatch<T extends TwitterUrl, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  config: BatchConfig = DEFAULT_CONFIG
): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> {
  const results: R[] = [];
  const errors: Array<{ item: T; error: Error }> = [];
  const maxConcurrent = config.maxConcurrent || DEFAULT_CONFIG.maxConcurrent!;
  
  // Process items in concurrent chunks
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const chunk = items.slice(i, i + maxConcurrent);
    const promises = chunk.map(item =>
      processor(item)
        .then(result => results.push(result))
        .catch(error => errors.push({ item, error: error instanceof Error ? error : new Error(String(error)) }))
    );
    
    await Promise.all(promises);
    
    // Apply delay between chunks if specified
    if (config.delayBetweenBatches && i + maxConcurrent < items.length) {
      await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
    }
  }
  
  return { results, errors };
}

export function calculateBatchStats(results: any[], errors: any[]): BatchStats {
  return {
    totalProcessed: results.length + errors.length,
    successCount: results.length,
    failureCount: errors.length,
    totalBatches: 1, // This will be updated by the controller
    completedBatches: 1,
    processingTime: 0 // This will be updated by the controller
  };
}
