export type Tweet = {
  id: string
  text: string
  url: string
  author: string
  isReply: boolean
  isQuote: boolean
  createdAt: string
  metrics: {
    likes: number
    replies: number
    retweets: number
    impressions: number
  }
  bookmarkCount?: number
  conversationId?: string
  entities?: object
  inReplyToId?: string
  inReplyToUserId?: string
  inReplyToUsername?: string
  lang?: string
  quoteCount?: number
  quoted_tweet?: object
  retweetCount?: number
  retweeted_tweet?: object
  source?: string
  type?: 'tweet'
  viewCount?: number
}

export type MetricsParams = {
  '@'?: string | string[]
  username?: string | string[]
  maxItems?: number
  urls?: string[]
  since?: string
  until?: string
  includeReplies?: boolean
  twitterContent?: string
} 