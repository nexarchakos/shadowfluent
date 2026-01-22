# 🛠️ Local Development Setup

Για να τρέξεις το project στο localhost, χρειάζεσαι **2 terminals**:

## 📋 Setup:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env.local` file

Δημιούργησε ένα `.env.local` file στη ρίζα του project:

```bash
cp .env.local.example .env.local
```

Στη συνέχεια, άνοιξε το `.env.local` και βάλε το API key σου:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
PORT=3001
```

### 3. Start Backend Server (Terminal 1)

```bash
npm run dev:server
```

Θα δεις:
```
🚀 Local backend server running on http://localhost:3001
📝 API key configured: Yes
```

### 4. Start Frontend (Terminal 2)

```bash
npm run dev
```

Θα δεις:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🚀 Alternative: Run Both Together

Αν έχεις εγκατεστημένο το `concurrently`:

```bash
npm run dev:all
```

Αυτό θα τρέξει και τα δύο servers μαζί σε ένα terminal.

## ✅ Επαλήθευση:

1. Άνοιξε `http://localhost:5173` (ή το port που σου δείχνει το Vite)
2. Κάνε generate μια φράση
3. Δεν θα δεις error! ✅

## 🔍 Troubleshooting:

**Error: "Failed to generate phrase"**
- Ελέγξε αν το backend server τρέχει (Terminal 1)
- Ελέγξε αν το `.env.local` έχει το σωστό API key
- Ελέγξε αν το port 3001 είναι διαθέσιμο

**Error: "Cannot find module 'express'"**
- Τρέξε `npm install` για να εγκαταστήσεις dependencies

**Port already in use**
- Άλλαξε το `PORT` στο `.env.local` σε άλλο port (π.χ. 3002)
- Ή σταμάτησε το process που χρησιμοποιεί το port 3001

---

**Στο Vercel, όλα αυτά γίνονται αυτόματα!** 🎉
