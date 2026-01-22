import OpenAI from 'openai';

// Language code mapping for OpenAI
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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (targetLanguage === 'none') {
      return res.status(200).json({ translation: '' });
    }

    // Get API key from environment (Vercel automatically provides this)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const targetLanguageName = languageMap[targetLanguage];
    if (!targetLanguageName) {
      return res.status(400).json({ error: 'Invalid target language' });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const systemPrompt = `You are a professional translator. Translate the given English text to ${targetLanguageName}. 
Return ONLY the translation, nothing else. No explanations, no quotes, just the translation.
Keep the same tone and style as the original text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3, // Lower temperature for more accurate translations
      max_tokens: 100,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return res.status(500).json({ error: 'No translation generated' });
    }

    // Clean up the response (remove quotes if present)
    const cleanTranslation = translatedText.replace(/^["']|["']$/g, '').trim();

    return res.status(200).json({ translation: cleanTranslation });
  } catch (error) {
    console.error('Error translating:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to translate',
    });
  }
}
