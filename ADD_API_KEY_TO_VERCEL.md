# 🔐 Προσθήκη OpenAI API Key στο Vercel

## ⚡ Γρήγορο Guide:

### Βήμα 1: Άνοιξε Vercel Dashboard
1. **Πήγαινε:** https://vercel.com/dashboard
2. **Πάτα στο project "shadowfluent"**

### Βήμα 2: Settings → Environment Variables
1. **Πάτα "Settings"** (top menu ή left sidebar)
2. **Πάτα "Environment Variables"** (αριστερό menu)

### Βήμα 3: Πρόσθεσε το Variable
1. **Πάτα "Add New"** (top right)
2. **Συμπλήρωσε:**
   - **Key:** `VITE_OPENAI_API_KEY`
   - **Value:** `your_openai_api_key_here` (αντίγραψε το API key σου από το `.env` file)
   - **Environment:** Επίλεξε **"Production"** ✅
3. **Πάτα "Save"**

### Βήμα 4: Redeploy
1. **Πάτα "Deployments"** (top menu)
2. **Πάτα "..."** (three dots) στο latest deployment
3. **Πάτα "Redeploy"**
4. Περίμενε **2-3 λεπτά**

### Βήμα 5: Test
1. **Refresh:** `www.shadowfluent.com`
2. **Δοκίμασε:** "Generate 1 Phrase"
3. **Θα λειτουργεί!** ✅

---

## ⚠️ ΣΗΜΑΝΤΙΚΟ:

**ΜΟΝΟ στο Vercel!** Μην το βάλεις σε files που θα commit-αρεις στο Git!

Το API key είναι ήδη στο `.env` file για local development (το οποίο είναι `.gitignore`).

---

## ✅ Εναλλακτικά: Quick Redeploy με Push

```bash
cd english-shadowing-app
git commit --allow-empty -m "Trigger redeploy for API key"
git push
```

**Το Vercel θα κάνει auto-deploy!** ⚡
