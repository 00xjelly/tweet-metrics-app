import Papa, { ParseResult } from 'papaparse';
import { ClassifiedUrl, batchClassifyUrls } from '../twitter/url-classifier';

interface CSVParseResult {
  profiles: ClassifiedUrl[];
  posts: ClassifiedUrl[];
  invalid: ClassifiedUrl[];
  errors: string[];
  skippedRows: number;
}

export async function parseCSVFile(fileContent: string): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const rawUrls: string[] = [];
    const errors: string[] = [];
    let skippedRows = 0;

    Papa.parse<string[]>(fileContent, {
      skipEmptyLines: true,
      complete: function(results: ParseResult<string[]>) {
        try {
          results.data.forEach((row, index) => {
            try {
              const firstCell = row[0];
              
              if (!firstCell) {
                skippedRows++;
                return;
              }

              // Clean the URL string
              const cleanedUrl = firstCell.toString().trim();
              
              // Basic URL validation for Twitter/X URLs
              if (cleanedUrl.includes('twitter.com/') || cleanedUrl.includes('x.com/')) {
                try {
                  // Attempt to create a URL object to validate
                  new URL(cleanedUrl);
                  rawUrls.push(cleanedUrl);
                } catch {
                  // If the URL is invalid but contains twitter.com, try to fix it
                  if (!cleanedUrl.startsWith('http')) {
                    const fixedUrl = `https://${cleanedUrl}`;
                    try {
                      new URL(fixedUrl);
                      rawUrls.push(fixedUrl);
                    } catch {
                      errors.push(`Row ${index + 1}: Invalid URL format - ${cleanedUrl}`);
                      skippedRows++;
                    }
                  } else {
                    errors.push(`Row ${index + 1}: Invalid URL format - ${cleanedUrl}`);
                    skippedRows++;
                  }
                }
              } else {
                if (firstCell && typeof firstCell === 'string' && firstCell.length > 0) {
                  errors.push(`Row ${index + 1}: Not a Twitter/X URL - ${cleanedUrl}`);
                }
                skippedRows++;
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errors.push(`Row ${index + 1}: Failed to process - ${errorMessage}`);
              skippedRows++;
            }
          });

          // Remove duplicates using Array.from for better compatibility
          const uniqueUrls = Array.from(new Set(rawUrls));
          const { profiles, posts, invalid } = batchClassifyUrls(uniqueUrls);

          // Add any invalid URLs to errors
          invalid.forEach(item => {
            errors.push(`Invalid URL structure: ${item.url}`);
          });

          resolve({
            profiles,
            posts,
            invalid,
            errors,
            skippedRows
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to process CSV: ${errorMessage}`);
          resolve({
            profiles: [],
            posts: [],
            invalid: [],
            errors,
            skippedRows
          });
        }
      },
      error: function(error) {
        errors.push(`CSV parsing error: ${error.message || 'Unknown error'}`);
        resolve({
          profiles: [],
          posts: [],
          invalid: [],
          errors,
          skippedRows: 0
        });
      }
    });
  });
}

interface BatchValidation {
  isValid: boolean;
  error?: string;
  stats?: {
    totalUrls: number;
    profileCount: number;
    postCount: number;
    invalidCount: number;
  };
}

export function validateBatchSize(
  profiles: ClassifiedUrl[],
  posts: ClassifiedUrl[],
  maxBatchSize: number = 100
): BatchValidation {
  const totalUrls = profiles.length + posts.length;

  if (totalUrls === 0) {
    return { 
      isValid: false,
      error: 'No valid URLs found in the CSV',
      stats: {
        totalUrls: 0,
        profileCount: 0,
        postCount: 0,
        invalidCount: 0
      }
    };
  }

  if (totalUrls > maxBatchSize) {
    return { 
      isValid: false, 
      error: `Batch size (${totalUrls}) exceeds maximum allowed (${maxBatchSize})`,
      stats: {
        totalUrls,
        profileCount: profiles.length,
        postCount: posts.length,
        invalidCount: 0
      }
    };
  }

  return { 
    isValid: true,
    stats: {
      totalUrls,
      profileCount: profiles.length,
      postCount: posts.length,
      invalidCount: 0
    }
  };
}
