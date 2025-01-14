import { supabase } from '@/lib/db';
import { ClassifiedUrl } from '../twitter/url-classifier';
import { processBatchUrls, validateUrlConstraints } from '../twitter/url-processor';

interface BatchProcessingResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
}

export async function processBatchRequest(id: string): Promise<BatchProcessingResult> {
  const processedCount = 0;
  const failedCount = 0;
  const errors: string[] = [];

  try {
    // Get the parent request
    const { data: request, error: fetchError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      throw new Error('Batch request not found');
    }

    // Get all child requests
    const { data: childRequests, error: childError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('parent_id', id);

    if (childError) {
      throw new Error('Failed to fetch child requests');
    }

    // Update parent status to processing
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'processing',
          startedAt: new Date().toISOString(),
          progress: 0
        }
      })
      .eq('id', id);

    // Process each child request
    let totalProcessed = 0;
    const totalRequests = childRequests?.length || 0;

    for (const childRequest of childRequests || []) {
      try {
        // Start child request processing
        await supabase
          .from('analytics_requests')
          .update({
            status: {
              stage: 'processing',
              startedAt: new Date().toISOString()
            }
          })
          .eq('id', childRequest.id);

        // Get URLs from the child request
        const urls = childRequest.parameters.profileUrls || childRequest.parameters.postUrls;
        if (!urls?.length) continue;

        // Process URLs in batches
        const classifiedUrls = urls.map(url => ({
          url,
          type: childRequest.type === 'profile' ? 'profile' : 'post'
        })) as ClassifiedUrl[];

        const batches = processBatchUrls(classifiedUrls);
        let batchProcessed = 0;

        for (const batch of batches) {
          // Validate each URL in the batch
          const validations = batch.map(url => validateUrlConstraints(url));
          const validUrls = batch.filter((_, index) => validations[index].isValid);

          // Add validation errors
          validations.forEach((validation, index) => {
            if (!validation.isValid) {
              errors.push(`Error with URL ${batch[index].url}: ${validation.errors.join(', ')}`);
            }
          });

          if (validUrls.length === 0) continue;

          // Process the batch
          // Note: Actual processing happens in the respective route handlers
          batchProcessed += validUrls.length;

          // Update child request progress
          await supabase
            .from('analytics_requests')
            .update({
              status: {
                stage: 'processing',
                progress: Math.round((batchProcessed / urls.length) * 100)
              }
            })
            .eq('id', childRequest.id);
        }

        // Mark child request as completed
        await supabase
          .from('analytics_requests')
          .update({
            status: {
              stage: 'completed',
              completedAt: new Date().toISOString(),
              progress: 100
            }
          })
          .eq('id', childRequest.id);

        totalProcessed++;

        // Update parent request progress
        await supabase
          .from('analytics_requests')
          .update({
            status: {
              stage: 'processing',
              progress: Math.round((totalProcessed / totalRequests) * 100)
            }
          })
          .eq('id', id);

      } catch (error) {
        console.error('Error processing child request:', error);
        errors.push(`Failed to process request ${childRequest.id}: ${error.message}`);
        failedCount++;
      }
    }

    // Update final status of parent request
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'completed',
          completedAt: new Date().toISOString(),
          progress: 100,
          processedCount: totalProcessed,
          failedCount,
          errors
        }
      })
      .eq('id', id);

    return {
      success: true,
      processedCount: totalProcessed,
      failedCount,
      errors
    };

  } catch (error) {
    console.error('Error in batch processing:', error);
    return {
      success: false,
      processedCount,
      failedCount,
      errors: [...errors, error.message]
    };
  }
}
