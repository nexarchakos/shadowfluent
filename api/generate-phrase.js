import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, existingPhrases, temperature } = req.body;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Get API key from environment (Vercel automatically provides this)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

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
    
    // Clean up the response
    const cleanPhrase = phraseText.replace(/^["']|["']$/g, '').trim();
    
    return res.status(200).json({ phrase: cleanPhrase });
  } catch (error) {
    console.error('Error generating phrase:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate phrase',
    });
  }
}
