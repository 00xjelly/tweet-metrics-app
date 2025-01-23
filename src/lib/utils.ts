import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractTweetId = (url: string): string | null => {
  try {
    // Extract only numeric ID after /status/
    const match = url.match(/\/status\/([0-9]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}