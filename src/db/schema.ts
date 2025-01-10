import { pgTable, serial, text, timestamp, json, integer } from 'drizzle-orm/pg-core';

export interface ProcessingStatus {
  stage: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  processedCount?: number;
  totalCount?: number;
  error?: string;
}

export interface TweetMetrics {
  views?: number;
  likes?: number;
  replies?: number;
  retweets?: number;
  bookmarks?: number;
}

export const analyticsRequests = pgTable('analytics_requests', {
  id: serial('id').primaryKey(),
  urls: json('urls').$type<string[]>().notNull(),
  status: json('status').$type<ProcessingStatus>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tweets = pgTable('tweets', {
  id: serial('id').primaryKey(),
  tweetId: text('tweet_id').notNull().unique(),
  authorUsername: text('author_username'),
  content: text('content'),
  createdAt: timestamp('created_at').notNull(),
  metrics: json('metrics').$type<TweetMetrics>(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  requestId: integer('request_id').references(() => analyticsRequests.id)
});

export type AnalyticsRequest = typeof analyticsRequests.$inferSelect;
export type Tweet = typeof tweets.$inferSelect;