import Papa from 'papaparse';
import type { CSVParseResult, CSVProcessResult } from './types';
import { classifyUrls } from '../twitter/url-classifier';

function validateURL(url: string): { isValid: boolean; reason?: string } {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
      return { isValid: false, reason: 'Not a Twitter/X URL' };
    }
    return { isValid: true };
  } catch {
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

export async function parseCSVFile(fileContent: string): Promise<CSVProcessResult> {
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

    Papa.parse(fileContent, {
      skipEmptyLines: true,
      complete(results) {
        stats.totalRows = results.data.length;

        results.data.forEach((row: any, index: number) => {
          try {
            const cellContent = row[0];
            if (!cellContent || typeof cellContent !== 'string') {
              stats.skippedCount++;
              return;
            }

            const url = cellContent.trim();
            const validation = validateURL(url);

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

        const uniqueUrls = removeDuplicates(validUrls);
        const { profiles, posts, invalid } = classifyUrls(uniqueUrls);

        // Add any classification errors to our error list
        invalid.forEach(item => {
          errors.push(`Invalid Twitter URL structure: ${item.originalUrl}`);
        });

        resolve({
          validUrls: uniqueUrls,
          invalidUrls,
          errors,
          stats,
          profiles,
          posts,
          classified: [...profiles, ...posts]
        });
      }
    });
  });
}
