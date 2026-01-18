# 📝 Πώς να Κάνεις Commit στο Git

## 📋 Basic Commands:

### 1. Ελέγξε τι Έχει Αλλάξει:

```bash
cd english-shadowing-app
git status
```

**Θα δεις:**
- **"Changes not staged for commit"** → Files που έχουν αλλάξει
- **"Untracked files"** → Files που είναι νέα

---

### 2. Προσθήκη των Changes:

**Για όλα τα files:**
```bash
git add .
```

**Για συγκεκριμένα files:**
```bash
git add src/App.tsx
git add src/main.tsx
# κλπ.
```

---

### 3. Commit:

```bash
git commit -m "Your commit message here"
```

**Παράδειγμα:**
```bash
git commit -m "Add routing with URLs for each category"
```

---

### 4. Push (στο GitHub):

```bash
git push
```

---

## 🎯 Παράδειγμα - Full Workflow:

```bash
cd english-shadowing-app

# 1. Ελέγξε status
git status

# 2. Προσθήκη όλων των changes
git add .

# 3. Commit
git commit -m "Add routing - URLs for each category"

# 4. Push
git push
```

---

## 🔙 Πώς να Γυρίσεις Πίσω:

### Μετά το Commit, μπορείς να δεις το History:

```bash
# Δες τα commits
git log --oneline -10
```

**Θα δεις κάτι σαν:**
```
abc1234 Add routing - URLs for each category
def5678 Update UI with logo
ghi9012 Fix mobile layout
jkl3456 Add meta tags
```

---

### Γυρίζοντας Πίσω σε Προηγούμενο Commit:

```bash
# Βρες το commit hash (π.χ. ghi9012)
git log --oneline -10

# Reset στο commit που θες
git reset --hard <commit-hash>

# Παράδειγμα:
git reset --hard ghi9012
```

**⚠️ WARNING:** `git reset --hard` θα διαγράψει όλες τις αλλαγές μετά το commit!

---

### Γυρίζοντας Πίσω Αλλά Κρατώντας τις Αλλαγές:

**Αν θες να δεις το παλιό code αλλά να κρατήσεις τις τρέχουσες αλλαγές:**

```bash
# Checkout συγκεκριμένο file από παλιό commit
git checkout <commit-hash> -- <file-path>

# Παράδειγμα:
git checkout ghi9012 -- src/App.tsx
```

---

## 📚 Χρήσιμα Git Commands:

### Δες το History:
```bash
git log --oneline -10        # Τελευταία 10 commits
git log --oneline -20        # Τελευταία 20 commits
git log --oneline --all      # Όλα τα commits
```

### Δες τις Αλλαγές σε File:
```bash
git diff <file-path>         # Δες uncommitted changes
git diff HEAD~1 <file-path>  # Δες changes από το προηγούμενο commit
```

### Revert ένα Commit (χωρίς να το διαγράψεις):
```bash
git revert <commit-hash>     # Δημιουργεί νέο commit που undo-άρει το commit
```

---

## ✅ Best Practices:

### 1. Κάνε Commit Συχνά:

**Καλά commit messages:**
- "Add routing with URLs for each category"
- "Fix mobile layout for logo and settings"
- "Add meta tags for SEO"
- "Update upload section to be more discreet"

**Κακά commit messages:**
- "fix"
- "update"
- "changes"

---

### 2. Κάνε Commit Πριν από Μεγάλες Αλλαγές:

**Αν θα κάνεις μεγάλη αλλαγή (π.χ. routing):**
```bash
git add .
git commit -m "Before adding routing"
# Κάνε τις αλλαγές...
git add .
git commit -m "Add routing"
```

**Έτσι μπορείς να γυρίσεις πίσω εύκολα!**

---

### 3. Δες το Status Πριν από Commit:

```bash
git status
```

**Βεβαιώσου ότι commit-άρεις μόνο αυτά που θες!**

---

## 🎯 Summary:

**Γρήγορο Commit:**
```bash
cd english-shadowing-app
git status                    # Ελέγξε τι έχει αλλάξει
git add .                     # Προσθήκη όλων
git commit -m "Your message"  # Commit
git push                      # Push στο GitHub
```

**Γυρίζοντας Πίσω:**
```bash
git log --oneline -10         # Δες το history
git reset --hard <hash>       # Reset στο commit που θες
```

---

**Κάνε commit συχνά για να έχεις version control!** ✅
