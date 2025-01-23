import { Tweet, MetricsParams, analyzeMetrics } from './api'

export const BATCH_SIZE = 10

type BatchProcessorParams = {
  ids: string[]
  processingCallback: (current: number, total: number) => void
  params: Omit<MetricsParams, 'tweet_ids' | '@'>
}

export async function processBatch({ ids, processingCallback, params }: BatchProcessorParams) {
  const results: Tweet[] = []
  const totalBatches = Math.ceil(ids.length / BATCH_SIZE)

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE)
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1
    
    processingCallback(currentBatch, totalBatches)
    
    const response = await analyzeMetrics({
      ...params,
      tweet_ids: batchIds
    })

    if (!response.success) {
      throw new Error(response.error)
    }

    results.push(...response.data.posts)
    
    if (currentBatch < totalBatches) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}