import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { parseCSVFile, validateBatchSize } from '@/lib/csv/parser';
import { UrlType } from '@/lib/twitter/url-classifier';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Request ID is required' },
      { status: 400 }
    );
  }

  try {
    // Get the analytics request
    const { data: analyticsRequest, error: fetchError } = await supabase
      .from('analytics_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !analyticsRequest) {
      throw new Error('Analytics request not found');
    }

    const fileContent = await request.text();
    if (!fileContent) {
      throw new Error('No CSV content provided');
    }

    // Parse CSV file and classify URLs
    const { profiles, posts, invalid, errors, skippedRows } = await parseCSVFile(fileContent);
    
    // Validate batch size
    const validation = validateBatchSize(profiles, posts);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Store the URLs, classifications, and any parsing errors in the analytics request
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'initialized',
          urlTypes: {
            profiles: profiles.map(p => p.url),
            posts: posts.map(p => p.url),
            invalid: invalid.map(i => i.url)
          },
          totalCount: profiles.length + posts.length,
          errors,
          skippedRows,
          stats: validation.stats,
          processedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // Create sub-requests for each URL type if needed
    const tasks = [];
    
    if (profiles.length > 0) {
      tasks.push(
        supabase.from('analytics_requests').insert({
          parent_id: id,
          type: 'profile',
          parameters: {
            profileUrls: profiles.map(p => p.url),
            ...analyticsRequest.parameters // Include any search parameters
          },
          status: {
            stage: 'pending',
            totalCount: profiles.length
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      );
    }

    if (posts.length > 0) {
      tasks.push(
        supabase.from('analytics_requests').insert({
          parent_id: id,
          type: 'post',
          parameters: {
            postUrls: posts.map(p => p.url),
            ...analyticsRequest.parameters // Include any search parameters
          },
          status: {
            stage: 'pending',
            totalCount: posts.length
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      );
    }

    await Promise.all(tasks);

    return NextResponse.json({
      success: true,
      data: {
        stats: validation.stats,
        errors,
        skippedRows
      }
    });

  } catch (error) {
    console.error('Error processing CSV batch:', error);

    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json(
      { success: false, error: 'Failed to process CSV batch' },
      { status: 500 }
    );
  }
}
