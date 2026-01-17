#!/usr/bin/env node

/**
 * Script to generate translations for all 540 standard phrases using LibreTranslate
 * 
 * LibreTranslate is FREE and open-source - no credit card required!
 * Uses public LibreTranslate instances
 * 
 * Usage:
 * 1. Run: node scripts/generate-translations-libre.js
 * 
 * Note: LibreTranslate is free but may have rate limits on public instances
 * If one instance is slow, the script will try alternatives
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public LibreTranslate instances (free, no API key needed)
const LIBRETRANSLATE_INSTANCES = [
  'https://libretranslate.com',
  'https://translate.argosopentech.com',
  'https://translate.fortytwo-it.com',
];

// Language mapping for LibreTranslate
const languageMap = {
  el: 'el', // Greek
  es: 'es', // Spanish
  fr: 'fr', // French
  de: 'de', // German
  it: 'it', // Italian
  pt: 'pt', // Portuguese
  ru: 'ru', // Russian
  zh: 'zh', // Chinese
  ja: 'ja', // Japanese
  ko: 'ko', // Korean
  ar: 'ar', // Arabic
};

const languages = Object.keys(languageMap);
let currentInstanceIndex = 0;

// Get current LibreTranslate instance
function getCurrentInstance() {
  return LIBRETRANSLATE_INSTANCES[currentInstanceIndex];
}

// Switch to next instance if current one fails
function switchInstance() {
  currentInstanceIndex = (currentInstanceIndex + 1) % LIBRETRANSLATE_INSTANCES.length;
  console.log(`  ↻ Switched to instance: ${getCurrentInstance()}`);
}

// Read all phrases from mockPhrases.ts
async function extractPhrases() {
  const filePath = path.join(__dirname, '../src/data/mockPhrases.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const phrases = [];
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

// Translate text using LibreTranslate API
async function translateText(text, targetLang, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const instance = getCurrentInstance();
      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text',
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          // Rate limit or server error - try next instance
          switchInstance();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          continue;
        }
        const error = await response.text();
        throw new Error(`LibreTranslate API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.translatedText || '';
    } catch (error) {
      if (attempt < retries - 1) {
        console.error(`  ⚠ Attempt ${attempt + 1} failed: ${error.message}`);
        switchInstance();
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      console.error(`  ❌ Error translating to ${targetLang}:`, error.message);
      return '';
    }
  }
  return '';
}

// Generate translations for all phrases
async function generateTranslations() {
  console.log('📝 Extracting phrases from mockPhrases.ts...');
  const phrases = await extractPhrases();
  console.log(`✅ Found ${phrases.length} unique phrases\n`);

  const translations = {};
  let totalRequests = 0;
  const totalNeeded = phrases.length * languages.length;

  console.log(`🔄 Starting translation process using LibreTranslate (FREE, no credit card!)...`);
  console.log(`   Using instance: ${getCurrentInstance()}`);
  console.log(`   Total translations needed: ${totalNeeded}`);
  console.log(`   This may take 15-20 minutes (public instances have rate limits)\n`);

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
      
      // Rate limiting: wait 200ms between requests to be respectful to public instances
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('');
    
    // Save progress every 10 phrases (in case of interruption)
    if ((i + 1) % 10 === 0) {
      console.log(`  💾 Progress saved (${i + 1}/${phrases.length} phrases completed)`);
    }
  }

  console.log(`\n✅ Completed ${totalRequests} translations`);
  return translations;
}

// Generate TypeScript file with translations
function generateTranslationFile(translations) {
  const filePath = path.join(__dirname, '../src/data/translations.ts');
  
  let content = `// This file contains translations for all ${Object.keys(translations).length} standard phrases
// Generated automatically using LibreTranslate (FREE, open-source)
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
    console.log('🚀 Starting translation generation with LibreTranslate (FREE!)...\n');
    console.log('📌 No credit card required - completely free!\n');
    
    const translations = await generateTranslations();
    generateTranslationFile(translations);
    
    console.log('\n🎉 Translation generation complete!');
    console.log('   You can now use the translations in your app.');
    console.log('   No API calls needed - all translations are hardcoded!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
