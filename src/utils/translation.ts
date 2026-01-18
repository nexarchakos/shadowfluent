import { TranslationLanguage } from '../types';
import { allTranslations } from '../data/translations';
import { translateWithAI } from './aiTranslation';

// Mock translations - now imported from translations.ts
// This file contains translations for all standard phrases
// Additional translations can be added to translations.ts
const mockTranslations: Record<string, Record<TranslationLanguage, string>> = allTranslations;

// Translation cache to avoid repeated API calls
const translationCache: Record<string, Record<TranslationLanguage, string>> = {};

// Simple translation function using MyMemory Translation API (free tier)
// DISABLED by default to avoid rate limits - use mock translations instead
// Enable only if you have API key or want to use for non-standard phrases
async function _translateWithAPI(
  text: string,
  targetLanguage: TranslationLanguage
): Promise<string> {
  if (targetLanguage === 'none') return '';

  // Check cache first
  if (translationCache[text] && translationCache[text][targetLanguage]) {
    return translationCache[text][targetLanguage];
  }

  // DISABLED: MyMemory API has daily limits (10,000 words/day)
  // Uncomment below if you want to use API for non-standard phrases
  // For now, we'll only use mock translations to avoid rate limits
  
  /*
  const languageMap: Record<TranslationLanguage, string> = {
    none: '',
    el: 'el',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',
    ru: 'ru',
    zh: 'zh',
    ja: 'ja',
    ko: 'ko',
    ar: 'ar',
  };

  const targetLang = languageMap[targetLanguage];
  if (!targetLang) return '';

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      // Cache the translation
      if (!translationCache[text]) {
        translationCache[text] = {} as Record<TranslationLanguage, string>;
      }
      translationCache[text][targetLanguage] = data.responseData.translatedText;
      return data.responseData.translatedText;
    }
  } catch (error) {
    console.error('Translation API error:', error);
  }
  */

  return '';
}

/**
 * Translates text to the specified language
 * Uses mock translations first, then falls back to AI translation (if API key is available)
 * For AI-generated and uploaded phrases, uses OpenAI for translation
 */
export async function translateText(
  text: string,
  targetLanguage: TranslationLanguage
): Promise<string> {
  if (targetLanguage === 'none') {
    return '';
  }

  // Check cache first
  if (translationCache[text] && translationCache[text][targetLanguage]) {
    return translationCache[text][targetLanguage];
  }

  // Check if we have a mock translation first (for standard phrases)
  if (mockTranslations[text] && mockTranslations[text][targetLanguage]) {
    const translation = mockTranslations[text][targetLanguage];
    // Cache it
    if (!translationCache[text]) {
      translationCache[text] = {} as Record<TranslationLanguage, string>;
    }
    translationCache[text][targetLanguage] = translation;
    return translation;
  }

  // For AI-generated or uploaded phrases (not in mock translations), use AI translation
  const aiTranslation = await translateWithAI(text, targetLanguage);
  if (aiTranslation) {
    // Cache the AI translation
    if (!translationCache[text]) {
      translationCache[text] = {} as Record<TranslationLanguage, string>;
    }
    translationCache[text][targetLanguage] = aiTranslation;
    return aiTranslation;
  }

  // If no translation available, return empty string
  return '';
}

/**
 * Get translation for a phrase based on selected language
 */
export async function getPhraseTranslation(
  phraseText: string,
  language: TranslationLanguage
): Promise<string | undefined> {
  if (language === 'none') {
    return undefined;
  }

  const translation = await translateText(phraseText, language);
  return translation || undefined;
}
