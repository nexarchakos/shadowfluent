# 🔍 Google Search Console - TXT Record στο Vercel

## ⚠️ Σημαντικό:

**Αφού έχεις αλλάξει τους nameservers στο Vercel, το DNS διαχειρίζεται το Vercel!**

**Πρέπει να προσθέσεις το TXT record στο Vercel, όχι στον domain provider!**

---

## ✅ Βήματα:

### Βήμα 1: Άνοιξε Vercel Dashboard

1. **Πήγαινε:** https://vercel.com/dashboard
2. **Πάτα στο project "shadowfluent"**

---

### Βήμα 2: Πήγαινε στα Domains

1. **Settings** (top menu ή left sidebar)
2. **Domains** (αριστερό menu)

---

### Βήμα 3: Επίλεξε το Domain

1. **Κάνε click στο domain:** `shadowfluent.com` (ή `www.shadowfluent.com`)
2. **Θα δεις:** Domain settings και DNS records

---

### Βήμα 4: Πρόσθεσε TXT Record

1. **Scroll down** ή **βρες το section "DNS Records"**
2. **Πάτα "Add Record"** ή **"Add DNS Record"**
3. **Συμπλήρωσε:**
   - **Type:** `TXT` ✅
   - **Name/Host:** `@` (για root domain) ή κενό
   - **Value:** `google-site-verification=xfHl1cFTBVVpWDPZ92ij504-NYRyfNOQHgBe7`
     - (Αντικατέστησε με το TXT record που σου έδωσε το Google Search Console)
   - **TTL:** `3600` ή `Auto` (default)
4. **Πάτα "Save"** ή **"Add"**

---

### Βήμα 5: Περίμενε DNS Propagation

**DNS changes μπορεί να πάρουν:**
- **Μέχρι 24-48 ώρες** (συνήθως 1-2 ώρες)

**Μπορείς να ελέγξεις DNS propagation:**
- **Πήγαινε:** https://dnschecker.org/
- **Εισάγαε:** `shadowfluent.com`
- **Record Type:** `TXT`
- **Πάτα:** "Search"

**Θα πρέπει να βλέπεις:** `google-site-verification=xfHl1cFTBVVpWDPZ92ij504-NYRyfNOQHgBe7`

---

### Βήμα 6: Verify στο Google Search Console

**Μετά από 1-2 ώρες (ή όταν βλέπεις το TXT record στο DNS checker):**

1. **Πήγαινε:** Google Search Console
2. **Πάτα "VERIFY"** (ή "Verify" button)
3. **Θα πρέπει να λειτουργεί!** ✅

---

## 🔍 Ελέγχος:

### Αν ΔΕΝ Μπορείς να Βρεις "Add Record":

**Στο Vercel Domains:**
1. **Κάνε click στο domain**
2. **Scroll down** → "DNS Records" section
3. **Πάτα "Add Record"** ή **"+"** button

**Αν ΔΕΝ βλέπεις "Add Record":**
- **Μπορεί να χρειάζεται να κάνεις click "Manage DNS"** ή **"DNS Settings"**

---

## ⚠️ Σημαντικά:

### 1. TXT Record για Root Domain:

**Για `shadowfluent.com` (χωρίς www):**
- **Name/Host:** `@` ή κενό (root domain)

**Για `www.shadowfluent.com`:**
- **Name/Host:** `www`

**Συνήθως το Google Search Console ζητά verification για root domain (`shadowfluent.com`), οπότε:**
- **Name/Host:** `@` ή κενό ✅

---

### 2. Value Format:

**Το TXT record value πρέπει να είναι:**
```
google-site-verification=xfHl1cFTBVVpWDPZ92ij504-NYRyfNOQHgBe7
```

**ΜΗΝ προσθέσεις quotes ή άλλα characters!**

---

### 3. Multiple TXT Records:

**Μπορείς να έχεις πολλά TXT records** για το ίδιο domain (π.χ. Google verification, email verification, κλπ).

**Το Vercel υποστηρίζει multiple TXT records!** ✅

---

## 🎯 Summary:

**Quick Checklist:**
- ✅ Vercel Dashboard → Project "shadowfluent"
- ✅ Settings → Domains
- ✅ Click στο domain `shadowfluent.com`
- ✅ Add Record → Type: `TXT`
- ✅ Name: `@` (root domain)
- ✅ Value: `google-site-verification=...`
- ✅ Save
- ✅ Περίμενε 1-2 ώρες
- ✅ Verify στο Google Search Console

---

**Το TXT record πρέπει να προστεθεί στο Vercel, όχι στον domain provider!** ✅
