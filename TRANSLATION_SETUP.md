# Translation Generation Setup

This guide explains how to generate translations for all 540 standard phrases.

## 🆓 FREE Option (No Credit Card Required!)

**Use Google Translate (Unofficial)** - completely free, no credit card needed!

```bash
npm run generate-translations-free
```

Or directly:
```bash
node scripts/generate-translations-google.js
```

### Google Translate Benefits:
- ✅ **100% FREE** - no credit card required
- ✅ **No API key needed** - uses Google's web interface
- ✅ **No registration** - works immediately
- ⚠️ May have rate limits (script includes delays)
- ⚠️ Takes ~20-30 minutes (due to rate limiting)

---

## 💳 Paid Option (Better Quality & Speed)

**Use DeepL API** - requires credit card but better quality and faster.

## Prerequisites

1. **Get a DeepL API Key** (Free tier available):
   - Visit: https://www.deepl.com/pro-api
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier: 500,000 characters/month (enough for all 540 phrases)

## Setup

1. **Set your DeepL API key as an environment variable:**
   ```bash
   export DEEPL_API_KEY=your-api-key-here
   ```

2. **Run the translation generation script:**
   ```bash
   npm run generate-translations
   ```

   Or directly:
   ```bash
   node scripts/generate-translations.js
   ```

## What the script does

1. Extracts all phrases from `src/data/mockPhrases.ts`
2. Translates each phrase to 11 languages using DeepL API:
   - Greek (el)
   - Spanish (es)
   - French (fr)
   - German (de)
   - Italian (it)
   - Portuguese (pt)
   - Russian (ru)
   - Chinese (zh)
   - Japanese (ja)
   - Korean (ko)
   - Arabic (ar)
3. Generates `src/data/translations.ts` with all translations
4. Includes rate limiting (100ms delay between requests)

## Time Estimate

- 540 phrases × 11 languages = 5,940 translations
- With 100ms delay: ~10 minutes total
- DeepL API is fast, so actual translation time is minimal

## Cost

- **Free tier**: 500,000 characters/month
- Our usage: ~297,000 characters (well within limit)
- **Cost: $0** (free tier is sufficient)

## Troubleshooting

### Error: DEEPL_API_KEY not set
```bash
export DEEPL_API_KEY=your-key-here
```

### Error: API rate limit
- The script includes rate limiting
- If you hit limits, wait a few minutes and resume
- Free tier has generous limits

### Error: Network issues
- Check your internet connection
- Verify DeepL API is accessible
- Try again later if DeepL service is down

## After Generation

Once translations are generated:
1. The file `src/data/translations.ts` will be created/updated
2. The app will automatically use these translations
3. No API calls needed - all translations are hardcoded
4. No more MyMemory rate limit warnings!

## Manual Translation (Alternative)

If you prefer not to use DeepL API:
1. You can manually add translations to `src/data/translations.ts`
2. Use the same format as shown in the file
3. Add translations incrementally as needed
