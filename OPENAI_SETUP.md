# OpenAI API Setup Guide

## Γρήγορη Οδηγία

### Βήμα 1: Δημιούργησε OpenAI API Key

1. Πήγαινε στο https://platform.openai.com/
2. Κάνε sign up ή login
3. Πήγαινε στο https://platform.openai.com/api-keys
4. Κάνε click "Create new secret key"
5. Αντιγράψε το API key (θα το δεις μόνο μια φορά!)

### Βήμα 2: Ρύθμισε το Environment Variable

1. Στο root directory του project, δημιούργησε ένα αρχείο `.env`:
   ```bash
   cp .env.example .env
   ```

2. Άνοιξε το `.env` file και πρόσθεσε το API key σου:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Σημαντικό:** Μην προσθέσεις quotes γύρω από το API key!

### Βήμα 3: Restart το Dev Server

Αν το dev server τρέχει, σταμάτησέ το (Ctrl+C) και ξανατρέξε:
```bash
npm run dev
```

## Πώς Λειτουργεί

- **Με API Key:** Η εφαρμογή θα δημιουργεί νέες, μοναδικές φράσεις με AI
- **Χωρίς API Key:** Η εφαρμογή θα χρησιμοποιεί fallback phrases (δουλεύει κανονικά)

## Κόστος

Το OpenAI API χρεώνει ανά token. Για την εφαρμογή:
- **Model:** `gpt-4o-mini` (οικονομικό)
- **Κόστος:** ~$0.00015 ανά φράση (πολύ φθηνό!)
- **Free Tier:** OpenAI δίνει $5 δωρεάν credits για νέους λογαριασμούς

## Security Notes

⚠️ **Σημαντικό για Production:**

Το current setup κάνει API calls από το frontend, που σημαίνει ότι το API key είναι ορατό στον browser. Αυτό είναι **OK για development/MVP**, αλλά για production:

1. **Μην κάνεις commit το .env file** (είναι ήδη στο .gitignore)
2. **Για production:** Χρησιμοποίησε backend API που θα κρατάει το API key ασφαλές
3. **Rate limiting:** Προσθέσε rate limiting στο backend

## Troubleshooting

**Το API δεν λειτουργεί:**
- Έλεγξε αν το API key είναι σωστό στο `.env`
- Έλεγξε αν έχεις credits στο OpenAI account
- Restart το dev server μετά την αλλαγή του .env

**Error: "API key not found":**
- Βεβαιώσου ότι το αρχείο ονομάζεται `.env` (με dot στην αρχή)
- Βεβαιώσου ότι το variable ονομάζεται `VITE_OPENAI_API_KEY`
- Restart το dev server

**Error: "Insufficient quota":**
- Έλεγξε το billing στο OpenAI account
- Προσθήκη payment method αν χρειάζεται

## Testing

Για να δοκιμάσεις αν λειτουργεί:

1. Επίλεξε μια κατηγορία
2. Κάνε click "Νέα Φράση (AI)"
3. Αν δημιουργηθεί μια νέα, μοναδική φράση, λειτουργεί! ✅
4. Αν δεις μια από τις fallback phrases, το API key δεν είναι σωστό
