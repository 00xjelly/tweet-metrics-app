import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { parseCSVFile, validateBatchSize } from '@/lib/csv/parser';

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

    // Parse CSV file
    const { urls, errors, skippedRows } = await parseCSVFile(fileContent);
    
    // Validate batch size
    const validation = validateBatchSize(urls);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Store the URLs and any parsing errors in the analytics request
    await supabase
      .from('analytics_requests')
      .update({
        status: {
          stage: 'initialized',
          urls,
          totalCount: urls.length,
          errors,
          skippedRows,
          processedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: {
        urls,
        totalCount: urls.length,
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
