import { ClassifiedUrl, UrlType } from './url-classifier';

type UrlNormalizationResult = {
  originalUrl: string;
  normalizedUrl: string;
  changes: string[];
};

export function normalizeTwitterUrls(urls: ClassifiedUrl[]): UrlNormalizationResult[] {
  return urls.map(classifiedUrl => {
    const changes: string[] = [];
    let url = classifiedUrl.url;
    const originalUrl = url;

    // Replace x.com with twitter.com for consistency
    if (url.includes('x.com')) {
      url = url.replace('x.com', 'twitter.com');
      changes.push('Standardized domain to twitter.com');
    }

    // Remove query parameters unless they're essential
    try {
      const parsedUrl = new URL(url);
      const essentialParams = ['s', 'lang']; // Keep only essential query params
      const params = Array.from(parsedUrl.searchParams.keys());
      
      params.forEach(param => {
        if (!essentialParams.includes(param)) {
          parsedUrl.searchParams.delete(param);
          changes.push(`Removed query parameter: ${param}`);
        }
      });
      
      url = parsedUrl.toString();
    } catch (error) {
      console.error('Error parsing URL:', error);
    }

    // Remove trailing slashes
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
      changes.push('Removed trailing slash');
    }

    return {
      originalUrl,
      normalizedUrl: url,
      changes
    };
  });
}

interface DuplicateCheck {
  duplicates: {
    [key: string]: string[];
  };
  unique: ClassifiedUrl[];
}

export function findDuplicateUrls(urls: ClassifiedUrl[]): DuplicateCheck {
  const duplicates: { [key: string]: string[] } = {};
  const seen = new Map<string, string>();
  const unique: ClassifiedUrl[] = [];

  // First normalize all URLs
  const normalizedUrls = normalizeTwitterUrls(urls);

  normalizedUrls.forEach((result, index) => {
    const { normalizedUrl, originalUrl } = result;
    
    if (seen.has(normalizedUrl)) {
      const firstUrl = seen.get(normalizedUrl)!;
      if (!duplicates[firstUrl]) {
        duplicates[firstUrl] = [];
      }
      duplicates[firstUrl].push(originalUrl);
    } else {
      seen.set(normalizedUrl, originalUrl);
      unique.push(urls[index]);
    }
  });

  return { duplicates, unique };
}

export function processBatchUrls(urls: ClassifiedUrl[], batchSize: number = 10): ClassifiedUrl[][] {
  const batches: ClassifiedUrl[][] = [];
  
  // Group URLs by type first
  const profileUrls = urls.filter(url => url.type === UrlType.PROFILE);
  const postUrls = urls.filter(url => url.type === UrlType.POST);

  // Process profiles first as they might generate multiple post URLs
  for (let i = 0; i < profileUrls.length; i += batchSize) {
    batches.push(profileUrls.slice(i, i + batchSize));
  }

  // Then process individual posts
  for (let i = 0; i < postUrls.length; i += batchSize) {
    batches.push(postUrls.slice(i, i + batchSize));
  }

  return batches;
}

export function validateUrlConstraints(url: ClassifiedUrl): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Basic URL structure checks
  try {
    new URL(url.url);
  } catch {
    errors.push('Invalid URL format');
    return { isValid: false, errors };
  }

  // Profile-specific validation
  if (url.type === UrlType.PROFILE) {
    if (!url.username) {
      errors.push('Missing username in profile URL');
    } else if (url.username.length > 15) { // Twitter username length limit
      errors.push('Username exceeds maximum length');
    }
  }

  // Post-specific validation
  if (url.type === UrlType.POST) {
    if (!url.tweetId) {
      errors.push('Missing tweet ID in post URL');
    }
    if (!url.username) {
      errors.push('Missing username in post URL');
    }
  }

  // Common validations
  if (url.url.length > 2048) { // Common URL length limit
    errors.push('URL exceeds maximum length');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
