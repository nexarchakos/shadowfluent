# 🎨 Logo Upload Guide - Troubleshooting

## ⚠️ Πρόβλημα:

**Το logo δεν εμφανίζεται - το `public` folder είναι άδειο!**

---

## ✅ Λύση:

### Βήμα 1: Ανέβασε το Logo Image

**Το `shadowfluent-logo.jpg` πρέπει να είναι στο `public` folder:**

1. **Βρες το αρχείο `shadowfluent-logo.jpg`** στον computer σου
2. **Copy το** (Cmd+C)
3. **Πήγαινε στο folder:** `english-shadowing-app/public/`
4. **Paste το** (Cmd+V)

**Παράδειγμα:**
```
english-shadowing-app/
  └── public/
      └── shadowfluent-logo.jpg  ← Εδώ!
```

---

### Βήμα 2: Επιβεβαίωση

**Ελέγξε ότι το αρχείο είναι εκεί:**

```bash
cd english-shadowing-app
ls -la public/
```

**Θα πρέπει να βλέπεις:**
```
shadowfluent-logo.jpg
```

---

### Βήμα 3: Restart το Dev Server

**Αν το dev server τρέχει:**

1. **Stop το server:** `Ctrl+C` (στο terminal)
2. **Restart:**
   ```bash
   npm run dev
   ```

**Το Vite χρειάζεται restart για να φορτώσει νέα files από το `public` folder!**

---

### Βήμα 4: Hard Refresh στο Browser

**Μετά το restart:**

1. **Hard refresh:** `Cmd+Shift+R` (Mac) ή `Ctrl+Shift+R` (Windows)
2. **Ή clear cache** και refresh

---

## 🔍 Ελέγχος:

### Αν το Logo ΔΕΝ Εμφανίζεται:

1. **Ελέγξε το path:**
   - Το αρχείο πρέπει να είναι: `public/shadowfluent-logo.jpg`
   - Το path στο code είναι: `/shadowfluent-logo.jpg` ✅

2. **Ελέγξε το όνομα:**
   - Το όνομα πρέπει να είναι **ακριβώς:** `shadowfluent-logo.jpg`
   - Case-sensitive! (μικρά/κεφαλαία γράμματα)

3. **Ελέγξε το format:**
   - Το αρχείο πρέπει να είναι `.jpg` (ή `.jpeg`)
   - Αν είναι `.png`, άλλαξε το path στο code

4. **Ελέγξε το browser console:**
   - **Right-click** → **"Inspect"**
   - **Console tab**
   - **Δες αν υπάρχουν errors** (π.χ. 404 για το image)

---

## 🎯 Quick Fix:

**Αν το αρχείο είναι σε άλλο folder:**

```bash
# Copy το αρχείο στο public folder
cp /path/to/shadowfluent-logo.jpg english-shadowing-app/public/

# Ελέγξε
ls -la english-shadowing-app/public/
```

---

## ✅ Summary:

**Quick Checklist:**
- ✅ Το `shadowfluent-logo.jpg` είναι στο `public/` folder;
- ✅ Το όνομα είναι **ακριβώς** `shadowfluent-logo.jpg` (case-sensitive);
- ✅ Έκανες restart το dev server;
- ✅ Έκανες hard refresh στο browser;
- ✅ Ελέγξες το browser console για errors;

---

**Ανέβασε το `shadowfluent-logo.jpg` στο `public/` folder και restart το dev server!** ✅
