import OpenAI from 'openai';
import { TranslationLanguage } from '../types';

// Language code mapping for OpenAI
const languageMap: Record<TranslationLanguage, string> = {
  none: '',
  el: 'Greek',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
};

/**
 * Translates text using OpenAI API
 * Falls back to empty string if API key is not available or translation fails
 */
export async function translateWithAI(
  text: string,
  targetLanguage: TranslationLanguage
): Promise<string> {
  if (targetLanguage === 'none') {
    return '';
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // If no API key is configured, return empty string
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    console.log('OpenAI API key not found, cannot translate with AI');
    return '';
  }

  const targetLanguageName = languageMap[targetLanguage];
  if (!targetLanguageName) {
    return '';
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Only for MVP - in production, use a backend
    });

    const systemPrompt = `You are a professional translator. Translate the given English text to ${targetLanguageName}. 
Return ONLY the translation, nothing else. No explanations, no quotes, just the translation.
Keep the same tone and style as the original text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cheaper model for MVP
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3, // Lower temperature for more accurate translations
      max_tokens: 100,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation generated from OpenAI');
    }

    // Clean up the response (remove quotes if present)
    const cleanTranslation = translatedText.replace(/^["']|["']$/g, '').trim();

    return cleanTranslation;
  } catch (error) {
    console.error('Error translating with OpenAI:', error);
    return '';
  }
}
