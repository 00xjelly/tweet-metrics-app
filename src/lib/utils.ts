import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractTweetId = (url: string): string | null => {
  try {
    const match = url.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};