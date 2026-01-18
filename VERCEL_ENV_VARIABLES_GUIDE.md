# 🔐 Vercel Environment Variables - OpenAI API Key Setup

## ⚠️ Πρόβλημα:

**Local λειτουργεί, αλλά στο production (Vercel) βγάζει error:**
```
OpenAI API key is not configured or invalid.
```

**Αιτία:** Το `.env` file **ΔΕΝ** ανεβαίνει στο production για ασφάλεια. Πρέπει να ορίσεις τα environment variables **απευθείας στο Vercel**.

---

## ✅ Λύση: Προσθήκη Environment Variable στο Vercel

### Βήμα 1: Άνοιξε το Vercel Dashboard

1. **Πήγαινε:** https://vercel.com/dashboard
2. **Πάτα στο project "shadowfluent"** (το purple/yellow logo)

### Βήμα 2: Πήγαινε στα Settings

1. **Πάτα "Settings"** (top menu ή left sidebar)

### Βήμα 3: Πήγαινε στα Environment Variables

1. Στο **αριστερό menu**, **πάτα "Environment Variables"**

### Βήμα 4: Πρόσθεσε το OpenAI API Key

1. **Κάνε scroll** στη λίστα των Environment Variables
2. **Πάτα "Add New"** (top right)

3. **Συμπλήρωσε:**
   - **Key (Name):** `VITE_OPENAI_API_KEY`
   - **Value:** Το OpenAI API key σου (που έχεις στο `.env` file)
     - Αν δεν το θυμάσαι, πήγαινε στο `.env` file και αντιγράψε το
   - **Environment:** Επίλεξε **"Production"** ✅
     - (Προαιρετικά: επίλεξε και "Preview" και "Development" αν θέλεις)

4. **Πάτα "Save"**

### Βήμα 5: Redeploy το Project

**ΣΗΜΑΝΤΙΚΟ:** Αφού προσθέσεις το environment variable, πρέπει να κάνεις **redeploy** το project για να πάρει το νέο environment variable.

**Μέθοδος 1: Redeploy από το Vercel Dashboard**
1. **Πάτα "Deployments"** (top menu ή left sidebar)
2. **Πάτα στα "..." (three dots)** στο latest deployment
3. **Πάτα "Redeploy"**
4. **Επιβεβαίωσε:** "Redeploy" ή "Redeploy with existing Build Cache" (το δεύτερο είναι πιο γρήγορο)

**Μέθοδος 2: Push νέο commit (γρηγορότερο)**
```bash
# Απλά κάνε ένα μικρό change και push
git commit --allow-empty -m "Trigger redeploy for environment variables"
git push
```

---

## ✅ Επιβεβαίωση:

1. **Περίμενε 2-3 λεπτά** για να ολοκληρωθεί το redeploy
2. **Refresh το site:** `www.shadowfluent.com`
3. **Δοκίμασε:** "Generate 1 Phrase" ή "Generate 5 Phrases"
4. **Δεν θα βγάλει error!** ✅

---

## 🔍 Αν Δεν Λειτουργεί:

### 1. Ελέγξε το Environment Variable:
- Vercel → Settings → Environment Variables
- Βεβαιώσου ότι:
  - ✅ **Key:** `VITE_OPENAI_API_KEY` (χωρίς typos)
  - ✅ **Value:** Το σωστό API key (χωρίς κενά/χαρακτήρες)
  - ✅ **Environment:** "Production" είναι επιλεγμένο

### 2. Ελέγξε το Redeploy:
- Vercel → Deployments
- Βεβαιώσου ότι το latest deployment είναι **"Ready"** (green)
- Αν είναι **"Error"** (red), πάτα και δες τα build logs

### 3. Ελέγξε τα Build Logs:
- Πάτα στο deployment
- Πάτα "View Build Logs"
- Ψάξε για errors σχετικά με `VITE_OPENAI_API_KEY`

### 4. Ελέγξε το API Key:
- Πήγαινε: https://platform.openai.com/api-keys
- Βεβαιώσου ότι το API key είναι **"Active"** και **valid**

---

## 📚 Σημαντικά:

### Γιατί το `.env` ΔΕΝ ανεβαίνει στο production:

- **Ασφάλεια:** Τα API keys **ΔΕΝ** πρέπει να είναι στο code repository
- **Best Practice:** Χρησιμοποιούμε environment variables στο deployment platform (Vercel)
- **Git Ignore:** Το `.env` είναι ήδη στο `.gitignore`, οπότε δεν ανεβαίνει στο GitHub

### Environment Variables στο Vercel:

- **Production:** Για το live site (`www.shadowfluent.com`)
- **Preview:** Για preview deployments (pull requests)
- **Development:** Για local development (χωρίς `vercel dev`)

### VITE_ Prefix:

- Το `VITE_` prefix είναι **υποχρεωτικό** για Vite projects
- Μόνο variables με `VITE_` prefix είναι διαθέσιμα στο frontend code
- Όχι `OPENAI_API_KEY`, αλλά `VITE_OPENAI_API_KEY` ✅

---

## ✅ Summary:

**Quick Checklist:**
- ✅ Βρήκες το Vercel Dashboard → Project "shadowfluent"
- ✅ Πήγες στο Settings → Environment Variables
- ✅ Πρόσθεσες `VITE_OPENAI_API_KEY` με το API key σου
- ✅ Επέλεξες "Production" environment
- ✅ Έκανες Redeploy (από dashboard ή push)
- ✅ Περίμενες 2-3 λεπτά
- ✅ Refresh το site και δοκίμασες "Generate 1 Phrase"
- ✅ Λειτουργεί! 🎉

---

**Αφού κάνεις redeploy, το error θα εξαφανιστεί και το AI generation θα λειτουργεί στο production!** ✅
