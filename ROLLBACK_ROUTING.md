# 🔙 Rollback Routing - Επιστροφή σε Προηγούμενη Έκδοση

## ⚠️ Πρόβλημα:

**Θέλεις να αφαιρέσεις το routing και να γυρίσεις σε μια έκδοση με ένα URL μόνο.**

---

## ✅ Λύση 1: Git Rollback (Recommended)

**Αν έχεις commit-άρει το routing στο Git:**

```bash
cd english-shadowing-app

# Δες το commit history
git log --oneline -10

# Βρες το commit ΠΡΙΝ το routing (π.χ. "Before routing" ή το commit πριν)
# Copy το commit hash (π.χ. abc1234)

# Κάνε reset στο commit πριν το routing
git reset --hard <commit-hash>

# Force push (WARNING: Αλλάζει το history!)
git push --force-with-lease
```

**Παράδειγμα:**
```bash
git log --oneline -10
# Βλέπεις: abc1234 "Update UI" (πριν routing)
# Βλέπεις: def5678 "Add routing" (με routing)

git reset --hard abc1234
git push --force-with-lease
```

---

## ✅ Λύση 2: Manual Removal (Αν Δεν Έχεις Commit)

**Αν ΔΕΝ έχεις commit-άρει το routing, απλά αφαίρεσε τις αλλαγές:**

### Βήμα 1: Αφαίρεσε το Routing Code

**1. Revert το `main.tsx`:**
```typescript
// Αφαίρεσε το BrowserRouter
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGTM } from './utils/gtm'

initGTM()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**2. Revert το `App.tsx`:**
- Αφαίρεσε `import { Routes, Route, useParams, useNavigate } from 'react-router-dom';`
- Αφαίρεσε `import { urlSlugToCategory, categoryToUrlSlug } from './utils/urlMapping';`
- Αφαίρεσε το `useParams`, `useNavigate`
- Αφαίρεσε το `useEffect` για URL
- Αλλάξε `handleCategorySelect` να μην χρησιμοποιεί `navigate`
- Αφαίρεσε το `Routes` wrapper και κάνε direct return το `MainContent`

**3. Revert το `CategorySelector.tsx`:**
- Αφαίρεσε `import { Link, useLocation } from 'react-router-dom';`
- Αφαίρεσε `import { categoryToUrlSlug } from '../utils/urlMapping';`
- Αλλάξε τα `Link` components σε `button` components
- Κάνε `onClick={() => onSelectCategory(category.id)}` αντί για `to={...}`

**4. Διέγραψε το `src/utils/urlMapping.ts`:**
```bash
rm src/utils/urlMapping.ts
```

**5. Αφαίρεσε το `react-router-dom` dependency:**
```bash
npm uninstall react-router-dom
```

---

## ✅ Λύση 3: Git Checkout (Specific Files)

**Αν θες να revert μόνο συγκεκριμένα files:**

```bash
cd english-shadowing-app

# Δες το commit πριν το routing
git log --oneline -10

# Revert συγκεκριμένα files
git checkout <commit-hash> -- src/main.tsx
git checkout <commit-hash> -- src/App.tsx
git checkout <commit-hash> -- src/components/CategorySelector.tsx

# Commit τις αλλαγές
git add .
git commit -m "Remove routing - revert to single URL"
git push
```

---

## 🎯 Recommended:

**Λύση 1 (Git Reset)** αν έχεις commit-άρει το routing.

**Λύση 2 (Manual Removal)** αν ΔΕΝ έχεις commit-άρει.

**Λύση 3 (Git Checkout)** αν θες να revert μόνο συγκεκριμένα files.

---

**Αν χρειαστείς βοήθεια, πες μου!** ✅
