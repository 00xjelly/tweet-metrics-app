import type { TwitterUrl } from '../twitter/url-classifier';

export interface CSVParseResult {
  validUrls: string[];
  invalidUrls: string[];
  errors: string[];
  stats: {
    totalRows: number;
    validCount: number;
    invalidCount: number;
    skippedCount: number;
  };
}

export interface CSVProcessResult extends CSVParseResult {
  profiles: TwitterUrl[];
  posts: TwitterUrl[];
  classified: TwitterUrl[];
}
