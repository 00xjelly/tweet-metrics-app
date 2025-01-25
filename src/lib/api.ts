import { Tweet, MetricsParams } from '@/types/api';

export async function analyzeMetrics(params: MetricsParams) {
  console.log('Analyzing metrics with params:', params)

  try {
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Response Error:', errorText)
      throw new Error(`API request failed: ${errorText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Unknown error occurred')
    }

    return result
  } catch (error) {
    console.error('Error analyzing metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze metrics'
    }
  }
}