export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface TweetMetrics {
  impression_count: number;
  like_count: number;
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  bookmark_count: number;
  view_count: number;
}

export interface TweetData {
  id: string;
  author_id: string;
  username: string;
  text: string;
  created_at: string;
  public_metrics: TweetMetrics;
  raw_data: any;
}

export interface SearchParams extends DateFilter {
  keywords?: string[];
  minEngagementRate?: number;
  minImpressions?: number;
}

// Separating profile URLs from search params since they're handled differently
export interface ProfileSearchParams {
  profileUrls: string[];
  searchParams: SearchParams;
}

export interface PostSearchParams extends SearchParams {
  postUrls: string[];
}

export interface MetricSearchParams extends SearchParams {
  keywords: string[];
  minEngagementRate: number;
  minImpressions: number;
}
