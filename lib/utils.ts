import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates approximate reading time for Tina rich-text content.
 * Assumes average reading speed of 200 words per minute.
 */
export function calculateReadingTime(content: any): number {
  if (!content) return 0;

  let wordCount = 0;

  const countWords = (node: any) => {
    if (!node) return;

    if (node.text) {
      wordCount += node.text.trim().split(/\s+/).filter(Boolean).length;
    }

    if (node.children) {
      node.children.forEach(countWords);
    }
  };

  // Tina rich-text can be an object with children or an array
  if (Array.isArray(content)) {
    content.forEach(countWords);
  } else if (content.children) {
    content.children.forEach(countWords);
  } else if (content.body) {
    // Some blocks might wrap content in a body field
    countWords(content.body);
  }

  const wpm = 200;
  return Math.ceil(wordCount / wpm);
}
