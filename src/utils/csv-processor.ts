import Papa from 'papaparse';
import { isTwitterUrl } from './url-validation';

type CsvProcessorCallbacks = {
  onSuccess: (urls: string[]) => void;
  onError: (message: string) => void;
  onComplete?: () => void;
};

export const processCsvFile = async (
  file: File,
  { onSuccess, onError, onComplete }: CsvProcessorCallbacks
) => {
  if (!file) return;

  try {
    const text = await file.text();
    Papa.parse(text, {
      skipEmptyLines: true,
      complete: (results) => {
        const twitterUrls = results.data
          .flat()
          .map(String)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .filter(isTwitterUrl);

        if (twitterUrls.length === 0) {
          onError('No valid Twitter/X URLs found in the CSV');
          return;
        }
        
        onSuccess(twitterUrls);
        onComplete?.();
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        onError('Error parsing CSV file');
        onComplete?.();
      }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    onError('Error reading CSV file');
    onComplete?.();
  }
}; 