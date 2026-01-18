# 🛣️ Routing Setup - URLs για Κάθε Κατηγορία

## 📋 Βήματα:

### Βήμα 1: Εγκατάσταση React Router

```bash
cd english-shadowing-app
npm install react-router-dom
```

---

### Βήμα 2: Update το main.tsx

**Πρόσθεσε BrowserRouter:**

```typescript
import { BrowserRouter } from 'react-router-dom';
```

**Και wrap το App:**

```typescript
<BrowserRouter>
  <App />
</BrowserRouter>
```

---

### Βήμα 3: Update το App.tsx

**Πρόσθεσε Routes και Route components.**

---

### Βήμα 4: Update το CategorySelector

**Αλλάξε τα buttons σε Link components.**

---

## 🎯 URLs που Θα Έχεις:

- `/` - Home (no category)
- `/business` - Business English
- `/travel` - Travel
- `/sport` - Sport
- `/meetings` - Meetings
- `/daily-conversation` - Daily Conversation
- `/job-interview` - Job Interview
- `/academic` - Academic
- `/medical` - Medical
- `/restaurant` - Restaurant
- `/shopping` - Shopping
- `/technology` - Technology
- `/social-media` - Social Media
- `/weather` - Weather
- `/family` - Family
- `/emergency` - Emergency
- `/education` - Education
- `/entertainment` - Entertainment
- `/health-fitness` - Health & Fitness

---

**Μετά την εγκατάσταση, θα κάνω τις αλλαγές στο code!** ✅
