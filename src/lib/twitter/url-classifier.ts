export enum UrlType {
  PROFILE = 'profile',
  POST = 'post',
  INVALID = 'invalid'
}

export interface ClassifiedUrl {
  url: string;
  type: UrlType;
  username?: string;
  tweetId?: string;
}

export function classifyUrl(url: string): ClassifiedUrl {
  try {
    // Ensure URL is properly formatted
    const parsedUrl = new URL(url);
    
    // Validate domain
    if (!['twitter.com', 'x.com'].includes(parsedUrl.hostname)) {
      return { url, type: UrlType.INVALID };
    }

    // Split path into segments
    const segments = parsedUrl.pathname
      .split('/')
      .filter(segment => segment.length > 0);

    if (segments.length === 0) {
      return { url, type: UrlType.INVALID };
    }

    // Handle profile URLs
    if (segments.length === 1) {
      return { 
        url,
        type: UrlType.PROFILE,
        username: segments[0]
      };
    }

    // Handle post URLs (format: /username/status/123456)
    if (segments.length === 3 && segments[1] === 'status') {
      return {
        url,
        type: UrlType.POST,
        username: segments[0],
        tweetId: segments[2]
      };
    }

    return { url, type: UrlType.INVALID };

  } catch (error) {
    return { url, type: UrlType.INVALID };
  }
}

export function batchClassifyUrls(urls: string[]): {
  profiles: ClassifiedUrl[];
  posts: ClassifiedUrl[];
  invalid: ClassifiedUrl[];
} {
  const result = urls.map(url => classifyUrl(url));

  return {
    profiles: result.filter(item => item.type === UrlType.PROFILE),
    posts: result.filter(item => item.type === UrlType.POST),
    invalid: result.filter(item => item.type === UrlType.INVALID)
  };
}
