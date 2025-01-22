export interface ParseResult<T> {
  data: T;
  error?: string;
}

export interface URLParseData {
  urls: string[];
}

export interface URLProcessData {
  validUrls: string[];
  invalidUrls: Array<{
    url: string;
    reason: string;
  }>;
}

export type CSVParseResult = ParseResult<URLParseData>;
export type CSVProcessResult = ParseResult<URLProcessData>;