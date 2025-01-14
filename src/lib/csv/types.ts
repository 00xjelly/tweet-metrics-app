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

export interface URLParseError {
  row: number;
  url: string;
  reason: string;
}

export interface BatchProcessResult extends CSVParseResult {
  profileUrls: string[];
  postUrls: string[];
  batchId?: string;
}
