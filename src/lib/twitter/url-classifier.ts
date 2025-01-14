export type TwitterUrlType = 'profile' | 'post' | 'invalid';

export interface TwitterUrl {
  type: TwitterUrlType;
  originalUrl: string;
  normalizedUrl: string;
  username?: string;
  tweetId?: string;
}

export function classifyTwitterUrl(url: string): TwitterUrl {
  try {
    // Ensure URL starts with http
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);

    // Validate hostname
    if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
      return {
        type: 'invalid',
        originalUrl: url,
        normalizedUrl
      };
    }

    // Split path into segments and remove empty ones
    const segments = urlObj.pathname.split('/').filter(Boolean);

    // Profile URL: twitter.com/username
    if (segments.length === 1) {
      return {
        type: 'profile',
        originalUrl: url,
        normalizedUrl,
        username: segments[0]
      };
    }

    // Post URL: twitter.com/username/status/123456
    if (segments.length === 3 && 
        segments[1] === 'status' && 
        segments[0] && 
        segments[2]) {
      return {
        type: 'post',
        originalUrl: url,
        normalizedUrl,
        username: segments[0],
        tweetId: segments[2]
      };
    }

    // Any other URL pattern is considered invalid
    return {
      type: 'invalid',
      originalUrl: url,
      normalizedUrl
    };

  } catch (error) {
    return {
      type: 'invalid',
      originalUrl: url,
      normalizedUrl: url
    };
  }
}

export function classifyUrls(urls: string[]): {
  profiles: TwitterUrl[];
  posts: TwitterUrl[];
  invalid: TwitterUrl[];
} {
  const classified = urls.map(url => classifyTwitterUrl(url));

  return {
    profiles: classified.filter(url => url.type === 'profile'),
    posts: classified.filter(url => url.type === 'post'),
    invalid: classified.filter(url => url.type === 'invalid')
  };
}
