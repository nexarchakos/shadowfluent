import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Category descriptions
const categoryDescriptions = {
  business: 'professional business English phrases for workplace communication, meetings, emails, and corporate settings',
  travel: 'common English phrases for traveling, booking hotels, asking for directions, and tourist situations',
  sport: 'English phrases related to sports, exercise, competitions, and athletic activities',
  meetings: 'phrases commonly used in meetings, presentations, and professional discussions',
  'daily-conversation': 'everyday English phrases for casual conversations, greetings, introductions, and small talk',
  'job-interview': 'English phrases for job interviews, CV discussions, career questions, and professional interviews',
  academic: 'academic English phrases for presentations, essays, research discussions, and scholarly communication',
  medical: 'English phrases for doctor visits, describing symptoms, pharmacy interactions, and healthcare situations',
  restaurant: 'English phrases for ordering food, restaurant reviews, cooking discussions, and dining experiences',
  shopping: 'English phrases for shopping, returns, asking about discounts, and retail interactions',
  technology: 'English phrases for tech support, software discussions, device troubleshooting, and IT conversations',
  'social-media': 'English phrases for online communication, social media posts, comments, and internet interactions',
  questions: 'common English questions for everyday conversations, asking about experiences, opinions, and general inquiries',
  family: 'English phrases for family discussions, relationships, friendships, and personal connections',
  emergency: 'English phrases for emergency situations, asking for help, safety instructions, and urgent communication',
  education: 'English phrases for school, classes, exams, studying, and educational contexts',
  entertainment: 'English phrases for movies, music, books, shows, and entertainment discussions',
  'health-fitness': 'English phrases for exercise, gym, nutrition, wellness, and fitness activities',
};

// Language mapping
const languageMap = {
  none: '',
  el: 'Greek',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
};

// Generate phrase endpoint
app.post('/api/generate-phrase', async (req, res) => {
  try {
    const { category, existingPhrases, temperature } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const description = categoryDescriptions[category] || 'English phrases';
    const existingText = existingPhrases && existingPhrases.length > 0 
      ? `\n\nIMPORTANT: Do NOT generate any of these phrases: ${existingPhrases.join(', ')}` 
      : '';
    
    const systemPrompt = `You are an English language learning assistant. Generate a unique, natural English phrase suitable for shadowing practice in the category: ${description}.${existingText}

Requirements:
- The phrase should be practical and commonly used
- It should be appropriate for the category: ${description}
- It should be between 10-30 words
- It must be unique and different from any existing phrases
- Return ONLY the phrase, nothing else. No explanations, no quotes, just the phrase.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a unique English phrase for ${category} shadowing practice.` },
      ],
      temperature: temperature || 1.0,
      max_tokens: 100,
    });
    
    const phraseText = completion.choices[0]?.message?.content?.trim();
    
    if (!phraseText) {
      return res.status(500).json({ error: 'No phrase generated' });
    }
    
    const cleanPhrase = phraseText.replace(/^["']|["']$/g, '').trim();
    
    return res.status(200).json({ phrase: cleanPhrase });
  } catch (error) {
    console.error('Error generating phrase:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate phrase',
    });
  }
});

// Translate endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (targetLanguage === 'none') {
      return res.status(200).json({ translation: '' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const targetLanguageName = languageMap[targetLanguage];
    if (!targetLanguageName) {
      return res.status(400).json({ error: 'Invalid target language' });
    }

    const systemPrompt = `You are a professional translator. Translate the given English text to ${targetLanguageName}. 
Return ONLY the translation, nothing else. No explanations, no quotes, just the translation.
Keep the same tone and style as the original text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return res.status(500).json({ error: 'No translation generated' });
    }

    const cleanTranslation = translatedText.replace(/^["']|["']$/g, '').trim();

    return res.status(200).json({ translation: cleanTranslation });
  } catch (error) {
    console.error('Error translating:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to translate',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.OPENAI_API_KEY });
});

app.listen(PORT, () => {
  console.log(`🚀 Local backend server running on http://localhost:${PORT}`);
  console.log(`📝 API key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});
