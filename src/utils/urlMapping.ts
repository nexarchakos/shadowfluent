/**
 * URL mapping between URL slugs and Category types
 */

import { Category } from '../types';

// Map URL slug -> Category type
export const urlToCategoryMap: Record<string, Category> = {
  'business-english': 'business',
  'daily-conversation': 'daily-conversation',
  'job-interview': 'job-interview',
  'social-media': 'social-media',
  'health-fitness': 'health-fitness',
  // Other categories use the same slug as their type
  'travel': 'travel',
  'sport': 'sport',
  'meetings': 'meetings',
  'academic': 'academic',
  'medical': 'medical',
  'restaurant': 'restaurant',
  'shopping': 'shopping',
  'technology': 'technology',
  'questions': 'questions',
  'family': 'family',
  'emergency': 'emergency',
  'education': 'education',
  'entertainment': 'entertainment',
};

// Map Category type -> URL slug
export const categoryToUrlMap: Record<Category, string> = {
  'business': 'business-english',
  'daily-conversation': 'daily-conversation',
  'job-interview': 'job-interview',
  'social-media': 'social-media',
  'health-fitness': 'health-fitness',
  'travel': 'travel',
  'sport': 'sport',
  'meetings': 'meetings',
  'academic': 'academic',
  'medical': 'medical',
  'restaurant': 'restaurant',
  'shopping': 'shopping',
  'technology': 'technology',
  'questions': 'questions',
  'family': 'family',
  'emergency': 'emergency',
  'education': 'education',
  'entertainment': 'entertainment',
};

/**
 * Convert URL slug to Category type
 */
export const urlSlugToCategory = (slug: string): Category | null => {
  return urlToCategoryMap[slug] || null;
};

/**
 * Convert Category type to URL slug
 */
export const categoryToUrlSlug = (category: Category): string => {
  return categoryToUrlMap[category] || category;
};
