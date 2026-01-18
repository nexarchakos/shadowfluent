import { Category } from '../types';

export const categoryLabels: Record<Category, string> = {
  'business': 'Business English',
  'travel': 'Travel',
  'sport': 'Sport',
  'meetings': 'Meetings',
  'daily-conversation': 'Daily Conversation',
  'job-interview': 'Job Interview',
  'academic': 'Academic',
  'medical': 'Medical',
  'restaurant': 'Restaurant',
  'shopping': 'Shopping',
  'technology': 'Technology',
  'social-media': 'Social Media',
  'weather': 'Weather',
  'family': 'Family',
  'emergency': 'Emergency',
  'education': 'Education',
  'entertainment': 'Entertainment',
  'health-fitness': 'Health & Fitness',
};

export const getCategoryLabel = (category: Category): string => {
  return categoryLabels[category] || category;
};
