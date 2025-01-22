import Papa from 'papaparse';
import type { CSVParseResult, CSVProcessResult } from './types';

function validateURL(url: string): { isValid: boolean; reason?: string } {
  try {
    // Basic Twitter/X URL validation
    const pattern = /(^|\s|https?:\/\/)?(x\.com|twitter\.com)\/[\w-]+/;
    const isValid = pattern.test(url);
    return {
      isValid,
      reason: isValid ? undefined : 'Invalid Twitter/X URL format'
    };
  } catch (error) {
    return {
      isValid: false,
      reason: 'Invalid URL format'
    };
  }
}

export function parseCSVContent(content: string): CSVParseResult {
  try {
    const result = Papa.parse(content, {
      skipEmptyLines: true,
      header: false
    });

    if (result.errors.length > 0) {
      return {
        success: false,
        error: `CSV parsing failed: ${result.errors[0].message}`
      };
    }

    const urls = result.data
      .flat()
      .map(String)
      .map(s => s.trim())
      .filter(Boolean);

    return {
      success: true,
      data: { urls }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse CSV'
    };
  }
}

export function processCSVUrls(urls: string[]): CSVProcessResult {
  const validUrls: string[] = [];
  const invalidUrls: Array<{ url: string; reason: string }> = [];

  urls.forEach(url => {
    const validation = validateURL(url);
    if (validation.isValid) {
      validUrls.push(url);
    } else {
      invalidUrls.push({
        url,
        reason: validation.reason || 'Invalid URL'
      });
    }
  });

  return {
    success: true,
    data: {
      validUrls,
      invalidUrls
    }
  };
}
