# English Shadowing App

Μια web εφαρμογή για εκμάθηση αγγλικών μέσω shadowing technique.

## Χαρακτηριστικά

- 🎯 **Κατηγορίες Φράσεων**: Business English, Travel, Sport, Meetings
- 🤖 **AI Generation**: Δημιουργία νέων φράσεων με AI
- 🔊 **Text-to-Speech**: Πολλαπλές επιλογές φωνής (άνδρας/γυναίκα, βρετανική/αμερικάνικη προφορά)
- ⏱️ **Customizable Repetitions**: Ρύθμιση αριθμού επαναλήψεων και χρονικού διαστήματος
- 📁 **File Upload**: Ανέβασμα δικών σου φράσεων
- 📱 **Responsive Design**: Λειτουργεί σε desktop και mobile

## Εγκατάσταση

```bash
# Εγκατάσταση dependencies
npm install

# Ρύθμιση OpenAI API (Προαιρετικό)
# Ανέβασε το .env.example σε .env και πρόσθεσε το API key σου
cp .env.example .env
# Επεξεργάσου το .env και πρόσθεσε το VITE_OPENAI_API_KEY

# Εκκίνηση development server
npm run dev

# Build για production
npm run build
```

### OpenAI API Setup (Προαιρετικό)

Η εφαρμογή μπορεί να δημιουργεί φράσεις με AI. Αν δεν έχεις API key, θα χρησιμοποιεί fallback phrases.

1. **Δημιούργησε OpenAI API Key:**
   - Πήγαινε στο https://platform.openai.com/api-keys
   - Δημιούργησε ένα νέο API key

2. **Ρύθμισε το .env file:**
   ```bash
   cp .env.example .env
   # Άνοιξε το .env και πρόσθεσε:
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart το dev server** μετά την αλλαγή

**Σημείωση:** Για production, καλύτερα να χρησιμοποιήσεις backend API για ασφάλεια. Το current setup είναι για MVP/development.

## Τεχνολογίες

- **React 18** + **TypeScript**
- **Vite** για build tooling
- **Tailwind CSS** για styling
- **Web Speech API** για text-to-speech
- **OpenAI API** για AI-powered phrase generation
- **Lucide React** για icons

## Χρήση

1. Επίλεξε μια κατηγορία (Business, Travel, Sport, Meetings)
2. Επίλεξε μια φράση από τη λίστα ή δημιούργησε νέα με AI
3. Ρύθμισε τις επιλογές (επαναλήψεις, διάστημα, φωνή)
4. Ξεκίνα το shadowing session
5. (Προαιρετικά) Ανέβασε δικό σου αρχείο .txt με φράσεις

## Μελλοντικές Βελτιώσεις

- [x] Integration με OpenAI API για πιο έξυπνη παραγωγή φράσεων
- [ ] Speech recognition για feedback προφοράς
- [ ] Offline mode με service workers
- [ ] Progress tracking και statistics
- [ ] Backend API για ασφαλή OpenAI integration (production)
- [ ] Περισσότερες γλώσσες
- [ ] Gamification features

## License

MIT
