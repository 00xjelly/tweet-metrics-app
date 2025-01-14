import Papa from 'papaparse';

interface CSVParseResult {
  urls: string[];
  errors: string[];
  skippedRows: number;
}

export async function parseCSVFile(fileContent: string): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const urls: string[] = [];
    const errors: string[] = [];
    let skippedRows = 0;

    Papa.parse(fileContent, {
      skipEmptyLines: 'greedy',
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        results.data.forEach((row: any, index: number) => {
          try {
            // Handle both array and object formats that Papaparse might return
            const firstCell = Array.isArray(row) ? row[0] : Object.values(row)[0];
            
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
                urls.push(cleanedUrl);
              } catch {
                // If the URL is invalid but contains twitter.com, try to fix it
                if (!cleanedUrl.startsWith('http')) {
                  const fixedUrl = `https://${cleanedUrl}`;
                  try {
                    new URL(fixedUrl);
                    urls.push(fixedUrl);
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
            errors.push(`Row ${index + 1}: Failed to process - ${error.message}`);
            skippedRows++;
          }
        });

        resolve({
          urls: [...new Set(urls)], // Remove duplicates
          errors,
          skippedRows
        });
      },
      error: (error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ urls: [], errors, skippedRows: 0 });
      }
    });
  });
}

export function validateBatchSize(urls: string[], maxBatchSize: number = 100): {
  isValid: boolean;
  error?: string;
} {
  if (urls.length === 0) {
    return { isValid: false, error: 'No valid URLs found in the CSV' };
  }

  if (urls.length > maxBatchSize) {
    return { 
      isValid: false, 
      error: `Batch size (${urls.length}) exceeds maximum allowed (${maxBatchSize})`
    };
  }

  return { isValid: true };
}
