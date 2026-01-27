import { TranslationLanguage } from '../types';

/**
 * Translates text using backend API (which calls OpenAI securely)
 * Falls back to empty string if translation fails
 */
export async function translateWithAI(
  text: string,
  targetLanguage: TranslationLanguage
): Promise<string> {
  if (targetLanguage === 'none') {
    return '';
  }

  try {
    // Call backend API endpoint instead of OpenAI directly
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return '';
    }

    const data = await response.json();
    return data.translation || '';
  } catch (error) {
    return '';
  }
}
