export const isTwitterUrl = (url: string): boolean => {
  try {
    const cleanUrl = url.trim().replace(/^https?:\/\//, '');
    return (
      (cleanUrl.startsWith('twitter.com/') || cleanUrl.startsWith('x.com/')) &&
      !cleanUrl.includes('/status/') &&
      cleanUrl.split('/').length === 2
    );
  } catch {
    return false;
  }
};

export const extractUsername = (url: string): string => {
  try {
    const cleanUrl = url.trim().replace(/^https?:\/\//, '');
    const parts = cleanUrl.split('/');
    if (parts.length >= 2) {
      return parts[1].split('?')[0].split('#')[0];
    }
    return '';
  } catch {
    return '';
  }
}; 