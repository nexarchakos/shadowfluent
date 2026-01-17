#!/usr/bin/env node

/**
 * Script to generate translations using Google Translate (unofficial, free)
 * 
 * Uses Google Translate's web interface - no API key needed!
 * Completely FREE - no credit card required
 * 
 * Usage:
 * 1. Run: node scripts/generate-translations-google.js
 * 
 * Note: May have rate limits, but works without any registration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Language mapping for Google Translate
const languageMap = {
  el: 'el', // Greek
  es: 'es', // Spanish
  fr: 'fr', // French
  de: 'de', // German
  it: 'it', // Italian
  pt: 'pt', // Portuguese
  ru: 'ru', // Russian
  zh: 'zh-CN', // Chinese (Simplified)
  ja: 'ja', // Japanese
  ko: 'ko', // Korean
  ar: 'ar', // Arabic
};

const languages = Object.keys(languageMap);

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

// Translate text using Google Translate (unofficial)
async function translateText(text, targetLang, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Use Google Translate's web API (unofficial but free)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - wait longer
          console.error(`  ⚠ Rate limited, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        const error = await response.text();
        throw new Error(`Google Translate error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      // Extract translation from nested array structure
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      
      return '';
    } catch (error) {
      if (attempt < retries - 1) {
        console.error(`  ⚠ Attempt ${attempt + 1} failed: ${error.message}`);
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

  console.log(`🔄 Starting translation process using Google Translate (FREE!)...`);
  console.log(`   Total translations needed: ${totalNeeded}`);
  console.log(`   This may take 20-30 minutes (rate limits apply)\n`);

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
      
      // Rate limiting: wait 300ms between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('');
    
    // Save progress every 10 phrases (in case of interruption)
    if ((i + 1) % 10 === 0) {
      console.log(`  💾 Progress saved (${i + 1}/${phrases.length} phrases completed)`);
      // Also save to file as backup
      const backupPath = path.join(__dirname, '../src/data/translations-backup.json');
      fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));
    }
  }

  console.log(`\n✅ Completed ${totalRequests} translations`);
  return translations;
}

// Generate TypeScript file with translations
function generateTranslationFile(translations) {
  const filePath = path.join(__dirname, '../src/data/translations.ts');
  
  let content = `// This file contains translations for all ${Object.keys(translations).length} standard phrases
// Generated automatically using Google Translate (FREE, no API key needed)
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
    console.log('🚀 Starting translation generation with Google Translate (FREE!)...\n');
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
