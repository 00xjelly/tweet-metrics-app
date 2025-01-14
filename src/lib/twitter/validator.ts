import { DateFilter, SearchParams } from '@/types/twitter';

export function isValidTwitterUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'twitter.com' ||
      parsedUrl.hostname === 'x.com'
    );
  } catch {
    return false;
  }
}

export function extractTweetId(url: string): string | null {
  if (!isValidTwitterUrl(url)) return null;
  
  try {
    const segments = url.split('/');
    const statusIndex = segments.findIndex(s => s === 'status');
    
    if (statusIndex === -1 || !segments[statusIndex + 1]) return null;
    
    return segments[statusIndex + 1].split('?')[0];
  } catch {
    return null;
  }
}

export function extractProfileUsername(url: string): string | null {
  if (!isValidTwitterUrl(url)) return null;
  
  try {
    const segments = url.split('/');
    // Remove empty segments and known paths
    const filteredSegments = segments.filter(s => 
      s && !['http:', 'https:', '', 'twitter.com', 'x.com'].includes(s)
    );
    
    // First segment should be the username if it's a profile URL
    return filteredSegments[0] || null;
  } catch {
    return null;
  }
}

export function validateDateFilter(dateFilter?: DateFilter): DateFilter | null {
  if (!dateFilter) return null;
  
  const { startDate, endDate } = dateFilter;
  
  if (!startDate && !endDate) return null;
  
  try {
    if (startDate) new Date(startDate).toISOString();
    if (endDate) new Date(endDate).toISOString();
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('Start date must be before end date');
    }
    
    return dateFilter;
  } catch {
    return null;
  }
}

export function validateSearchParams(params: SearchParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate date range if provided
  if (params.startDate || params.endDate) {
    const validatedDates = validateDateFilter({
      startDate: params.startDate,
      endDate: params.endDate
    });
    
    if (!validatedDates) {
      errors.push('Invalid date range provided');
    }
  }
  
  // Validate engagement rate
  if (params.minEngagementRate !== undefined) {
    if (
      typeof params.minEngagementRate !== 'number' ||
      params.minEngagementRate < 0 ||
      params.minEngagementRate > 100
    ) {
      errors.push('Engagement rate must be between 0 and 100');
    }
  }
  
  // Validate impressions
  if (params.minImpressions !== undefined) {
    if (
      typeof params.minImpressions !== 'number' ||
      params.minImpressions < 0
    ) {
      errors.push('Minimum impressions must be a positive number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
