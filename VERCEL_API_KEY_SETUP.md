# 🔒 Vercel API Key Setup - Secure Backend

Το API key σου είναι τώρα **ασφαλές**! Δεν φαίνεται πλέον στον browser.

## ✅ Τι έγινε:

1. **Backend Serverless Functions**: Δημιουργήθηκαν endpoints στο `/api` folder που τρέχουν στο server-side
2. **Frontend Updated**: Το frontend καλεί τα backend endpoints αντί για το OpenAI API
3. **API Key Hidden**: Το API key είναι μόνο στο server, όχι στον browser

## 📋 Βήματα για Vercel:

### 1. Πρόσθεσε το API Key στο Vercel

1. Πήγαινε στο [Vercel Dashboard](https://vercel.com/dashboard)
2. Επίλεξε το project σου (`shadowfluent`)
3. Πήγαινε στο **Settings** → **Environment Variables**
4. Πρόσθεσε:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-key-here` (βάλε το πραγματικό key σου)
   - **Environment**: Επίλεξε **Production**, **Preview**, και **Development**
5. Κάνε **Save**

### 2. Redeploy το Project

Μετά την προσθήκη του environment variable:

1. Πήγαινε στο **Deployments** tab
2. Κάνε click στο **⋯** (three dots) στο τελευταίο deployment
3. Επίλεξε **Redeploy**

**Ή** απλά κάνε ένα νέο commit και push:

```bash
git add .
git commit -m "Secure API key with backend"
git push
```

Το Vercel θα κάνει auto-deploy.

## 🔍 Πώς να Επαληθεύσεις:

1. Άνοιξε το site στο browser
2. Άνοιξε **DevTools** (F12)
3. Πήγαινε στο **Network** tab
4. Κάνε generate μια φράση
5. Δες το request στο `/api/generate-phrase`
6. **Δες τα Headers**: Δεν θα δεις το API key! ✅

## 📁 Αρχεία που Δημιουργήθηκαν:

- `/api/generate-phrase.js` - Backend endpoint για phrase generation
- `/api/translate.js` - Backend endpoint για translations

## ⚠️ Σημαντικό:

- Το `OPENAI_API_KEY` πρέπει να είναι **μόνο** στο Vercel Environment Variables
- **ΜΗΝ** το βάλεις στο `.env` file (για production)
- Το `.env` file είναι μόνο για local development (αν χρειάζεται)

## 🚀 Local Development:

Για local development, μπορείς να:
1. Δημιουργήσεις `.env.local` με `OPENAI_API_KEY=...`
2. Ή να χρησιμοποιήσεις το Vercel CLI: `vercel dev`

---

**Το API key σου είναι τώρα ασφαλές!** 🔒
