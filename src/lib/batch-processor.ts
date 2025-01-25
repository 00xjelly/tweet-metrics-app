import { Tweet, MetricsParams, analyzeMetrics } from './api'

export const BATCH_SIZE = 10

type BatchProcessorParams = {
  ids: string[]
  processingCallback: (current: number, total: number) => void
  params: Omit<MetricsParams, 'tweet_ids'>
  type: 'tweets' | 'profiles'
}

export async function processBatch({ ids, processingCallback, params, type }: BatchProcessorParams) {
  console.log(`Starting batch processing for ${ids.length} ${type}`);
  
  const results: Tweet[] = []
  const totalBatches = Math.ceil(ids.length / BATCH_SIZE)
  console.log(`Total batches to process: ${totalBatches}`);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE)
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1
    
    console.log(`Processing batch ${currentBatch}/${totalBatches} with ${batchIds.length} ${type}:`, batchIds);
    processingCallback(currentBatch, totalBatches)
    
    try {
      const response = await analyzeMetrics({
        ...params,
        ...(type === 'tweets' ? { tweet_ids: batchIds } : { '@': batchIds })
      })

      console.log(`Batch ${currentBatch} response:`, response.success);

      if (!response.success) {
        throw new Error(response.error)
      }

      results.push(...response.data.posts)
      
      // Add delay between batches to prevent rate limiting
      if (currentBatch < totalBatches) {
        console.log(`Waiting before batch ${currentBatch + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Error in batch ${currentBatch}:`, error);
      throw error;
    }
  }

  console.log(`Completed processing ${results.length} results`);
  return results
}