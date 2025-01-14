import Papa from 'papaparse';
import type { CSVParseResult, URLParseError } from './types';

function validateTwitterUrl(url: string): { isValid: boolean; reason?: string } {
  try {
    const urlObj = new URL(url);
    if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
      return { isValid: false, reason: 'Not a Twitter/X URL' };
    }
    return { isValid: true };
  } catch {
    // Try to fix common URL issues
    if (!url.startsWith('http')) {
      const fixedUrl = `https://${url}`;
      try {
        const urlObj = new URL(fixedUrl);
        if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
          return { isValid: false, reason: 'Not a Twitter/X URL' };
        }
        return { isValid: true };
      } catch {
        return { isValid: false, reason: 'Invalid URL format' };
      }
    }
    return { isValid: false, reason: 'Invalid URL format' };
  }
}

function removeDuplicates(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter(url => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

export async function parseCSVFile(fileContent: string): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const validUrls: string[] = [];
    const invalidUrls: string[] = [];
    const errors: string[] = [];
    const stats = {
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      skippedCount: 0
    };

    Papa.parse<string[]>(fileContent, {
      skipEmptyLines: 'greedy',
      complete: function(results) {
        stats.totalRows = results.data.length;

        results.data.forEach((row, index) => {
          try {
            // We expect URLs in the first column
            const cellContent = row[0];
            if (!cellContent || typeof cellContent !== 'string') {
              stats.skippedCount++;
              return;
            }

            const url = cellContent.trim();
            const validation = validateTwitterUrl(url);

            if (validation.isValid) {
              validUrls.push(url.startsWith('http') ? url : `https://${url}`);
              stats.validCount++;
            } else {
              invalidUrls.push(url);
              stats.invalidCount++;
              errors.push(`Row ${index + 1}: ${validation.reason} - ${url}`);
            }

          } catch (error) {
            stats.skippedCount++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Row ${index + 1}: Processing error - ${errorMessage}`);
          }
        });

        resolve({
          validUrls: removeDuplicates(validUrls),
          invalidUrls,
          errors,
          stats
        });
      },
      error: function(error: Papa.ParseError) {
        resolve({
          validUrls: [],
          invalidUrls: [],
          errors: [`CSV parsing error: ${error.message || 'Unknown error'}`],
          stats: {
            totalRows: 0,
            validCount: 0,
            invalidCount: 0,
            skippedCount: 0
          }
        });
      }
    });
  });
}
