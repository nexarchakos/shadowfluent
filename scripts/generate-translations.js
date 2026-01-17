#!/usr/bin/env node

/**
 * Script to generate translations for all 540 standard phrases using DeepL API
 * 
 * Usage:
 * 1. Get a DeepL API key from https://www.deepl.com/pro-api
 * 2. Set DEEPL_API_KEY environment variable: export DEEPL_API_KEY=your-key
 * 3. Run: node scripts/generate-translations.js
 * 
 * Note: DeepL Free tier allows 500,000 characters/month
 * 540 phrases × ~50 chars × 11 languages = ~297,000 characters (well within limit)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language mapping
const languageMap = {
  el: 'EL', // Greek
  es: 'ES', // Spanish
  fr: 'FR', // French
  de: 'DE', // German
  it: 'IT', // Italian
  pt: 'PT', // Portuguese
  ru: 'RU', // Russian
  zh: 'ZH', // Chinese
  ja: 'JA', // Japanese
  ko: 'KO', // Korean
  ar: 'AR', // Arabic
};

const languages = Object.keys(languageMap);
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

if (!DEEPL_API_KEY) {
  console.error('❌ Error: DEEPL_API_KEY environment variable is not set');
  console.error('   Get your API key from: https://www.deepl.com/pro-api');
  console.error('   Then run: export DEEPL_API_KEY=your-key');
  process.exit(1);
}

// Read all phrases from mockPhrases.ts
async function extractPhrases() {
  const filePath = path.join(__dirname, '../src/data/mockPhrases.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const phrases = [];
  // Match phrases array definitions: phrases = ['text', 'text', ...];
  const regex = /phrases\s*=\s*\[([\s\S]*?)\];/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const phrasesBlock = match[1];
    
    // Parse quoted strings properly, handling escaped quotes
    let currentPhrase = '';
    let inQuotes = false;
    let escapeNext = false;
    
    for (let i = 0; i < phrasesBlock.length; i++) {
      const char = phrasesBlock[i];
      
      if (escapeNext) {
        currentPhrase += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        currentPhrase += char;
        continue;
      }
      
      if (char === "'" && !escapeNext) {
        if (inQuotes) {
          // End of phrase
          if (currentPhrase.trim()) {
            const cleaned = currentPhrase
              .replace(/\\'/g, "'")
              .replace(/\\n/g, '\n')
              .trim();
            if (cleaned) phrases.push(cleaned);
          }
          currentPhrase = '';
        }
        inQuotes = !inQuotes;
        continue;
      }
      
      if (inQuotes) {
        currentPhrase += char;
      }
    }
    
    // Handle last phrase if file ends without closing quote
    if (currentPhrase.trim()) {
      const cleaned = currentPhrase
        .replace(/\\'/g, "'")
        .replace(/\\n/g, '\n')
        .trim();
      if (cleaned) phrases.push(cleaned);
    }
  }
  
  // Remove duplicates and empty strings
  return [...new Set(phrases)].filter(p => p.trim().length > 0);
}

// Translate text using DeepL API
async function translateText(text, targetLang) {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        target_lang: targetLang,
        source_lang: 'EN',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepL API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message);
    return '';
  }
}

// Generate translations for all phrases
async function generateTranslations() {
  console.log('📝 Extracting phrases from mockPhrases.ts...');
  const phrases = await extractPhrases();
  console.log(`✅ Found ${phrases.length} unique phrases\n`);

  const translations = {};
  let totalRequests = 0;
  const totalNeeded = phrases.length * languages.length;

  console.log(`🔄 Starting translation process...`);
  console.log(`   Total translations needed: ${totalNeeded}`);
  console.log(`   This may take a while (DeepL has rate limits)\n`);

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    console.log(`[${i + 1}/${phrases.length}] Translating: "${phrase.substring(0, 50)}..."`);
    
    translations[phrase] = {
      none: '',
    };

    for (const lang of languages) {
      const targetLang = languageMap[lang];
      process.stdout.write(`  → ${lang}... `);
      
      const translation = await translateText(phrase, targetLang);
      translations[phrase][lang] = translation || '';
      
      totalRequests++;
      process.stdout.write(translation ? '✓\n' : '✗\n');
      
      // Rate limiting: wait 100ms between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('');
  }

  console.log(`\n✅ Completed ${totalRequests} translations`);
  return translations;
}

// Generate TypeScript file with translations
function generateTranslationFile(translations) {
  const filePath = path.join(__dirname, '../src/data/translations.ts');
  
  let content = `// This file contains translations for all ${Object.keys(translations).length} standard phrases
// Generated automatically using DeepL API
// Last updated: ${new Date().toISOString()}

import { TranslationLanguage } from '../types';

export type TranslationMap = Record<string, Record<TranslationLanguage, string>>;

// Helper to create translation entry
const t = (
  en: string,
  translations: Partial<Record<TranslationLanguage, string>>
): [string, Record<TranslationLanguage, string>] => {
  return [
    en,
    {
      none: '',
      el: translations.el || '',
      es: translations.es || '',
      fr: translations.fr || '',
      de: translations.de || '',
      it: translations.it || '',
      pt: translations.pt || '',
      ru: translations.ru || '',
      zh: translations.zh || '',
      ja: translations.ja || '',
      ko: translations.ko || '',
      ar: translations.ar || '',
    },
  ];
};

// All translations organized by category
const allTranslationsEntries: Array<[string, Record<TranslationLanguage, string>]> = [
`;

  // Add translations
  for (const [phrase, trans] of Object.entries(translations)) {
    const escapedPhrase = phrase.replace(/'/g, "\\'");
    content += `  t('${escapedPhrase}', {\n`;
    
    for (const lang of languages) {
      const transText = trans[lang] || '';
      const escapedTrans = transText.replace(/'/g, "\\'").replace(/\n/g, '\\n');
      if (transText) {
        content += `    ${lang}: '${escapedTrans}',\n`;
      }
    }
    
    content += `  }),\n`;
  }

  content += `];

// Export all translations as a map
export const allTranslations: TranslationMap = Object.fromEntries(allTranslationsEntries);
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n✅ Generated translation file: ${filePath}`);
  console.log(`   File size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting translation generation...\n');
    
    const translations = await generateTranslations();
    generateTranslationFile(translations);
    
    console.log('\n🎉 Translation generation complete!');
    console.log('   You can now use the translations in your app.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
