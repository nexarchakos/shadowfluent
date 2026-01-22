import { Category, Phrase } from '../types';

// Fallback phrases if API fails or is not configured
const fallbackPhrases: Record<Category, string[]> = {
  business: [
    'We need to align our strategies for the upcoming quarter.',
    'The board meeting has been rescheduled to next Tuesday.',
    'Could you provide an update on the project status?',
    'I would like to schedule a follow-up discussion.',
    'The quarterly report shows positive growth trends.',
  ],
  travel: [
    'Is there a direct flight to London available?',
    'What\'s the best way to get from the airport to the city center?',
    'I\'d like to book a room with a sea view, please.',
    'Could you recommend a good restaurant nearby?',
    'What time does the museum open?',
  ],
  sport: [
    'The match was postponed due to bad weather conditions.',
    'She won the gold medal in the swimming competition.',
    'Our team needs to improve their defense strategy.',
    'The championship final will be held next month.',
    'He broke his personal record in the marathon.',
  ],
  meetings: [
    'Could everyone please mute their microphones?',
    'Let\'s move on to the next item on the agenda.',
    'I\'d like to hear everyone\'s opinion on this matter.',
    'Does anyone have any questions before we continue?',
    'Thank you all for your valuable contributions today.',
  ],
  'daily-conversation': [
    'How was your weekend? Did you do anything interesting?',
    'I\'m really looking forward to the weekend.',
    'What do you usually do in your free time?',
    'It\'s been a while since we last caught up.',
    'I hope you\'re having a great day so far.',
  ],
  'job-interview': [
    'Could you tell me a bit about yourself and your background?',
    'What interests you most about this position?',
    'I have five years of experience in this field.',
    'What are your greatest strengths and weaknesses?',
    'Why do you want to work for our company?',
  ],
  academic: [
    'The research findings suggest a significant correlation.',
    'I need to submit my thesis by the end of the semester.',
    'Could you explain this concept in more detail?',
    'The methodology section requires further development.',
    'I\'d like to discuss my research proposal with you.',
  ],
  medical: [
    'I\'ve been experiencing headaches for the past few days.',
    'Could you prescribe something for this pain?',
    'I need to make an appointment with my doctor.',
    'Are there any side effects I should be aware of?',
    'I\'d like to get a second opinion on this diagnosis.',
  ],
  restaurant: [
    'Could we have a table for two, please?',
    'What do you recommend from the menu?',
    'I\'d like to order the grilled salmon, please.',
    'Could I have the check when you have a moment?',
    'Is this dish suitable for vegetarians?',
  ],
  shopping: [
    'Do you have this in a different size?',
    'What\'s your return policy for this item?',
    'Is this item on sale or at full price?',
    'Could I try this on, please?',
    'Do you accept credit cards or only cash?',
  ],
  technology: [
    'My computer keeps freezing when I open this program.',
    'Could you help me troubleshoot this software issue?',
    'I need to update my operating system to the latest version.',
    'The internet connection seems to be very slow today.',
    'How do I back up my files to the cloud?',
  ],
  'social-media': [
    'I saw your post about the concert, it looked amazing!',
    'Could you tag me in that photo you took?',
    'I just shared an interesting article on my timeline.',
    'Let\'s connect on LinkedIn if you\'re interested.',
    'Did you see the latest update on the app?',
  ],
  questions: [
    'How did it go?',
    'What did you think of the event?',
    'Have you ever been to London?',
    'How long did the performance last?',
    'What time did you arrive?',
  ],
  family: [
    'How is your family doing these days?',
    'I\'m planning to visit my parents this weekend.',
    'We\'re having a family gathering next month.',
    'My sister just got engaged, I\'m so happy for her.',
    'Family time is really important to me.',
  ],
  emergency: [
    'I need to call an ambulance immediately.',
    'Could you help me? I think I\'m lost.',
    'There\'s been an accident, we need medical assistance.',
    'Please call the police, there\'s been a break-in.',
    'Is there a fire exit nearby?',
  ],
  education: [
    'I have an exam next week that I need to study for.',
    'Could you explain this lesson again, please?',
    'What\'s the deadline for submitting this assignment?',
    'I\'m struggling with this subject, could you help me?',
    'The school library is open until nine o\'clock.',
  ],
  entertainment: [
    'Have you seen the latest movie that came out?',
    'I\'m reading a really interesting book right now.',
    'What kind of music do you usually listen to?',
    'I went to a concert last night, it was incredible.',
    'Do you have any recommendations for a good TV series?',
  ],
  'health-fitness': [
    'I try to go to the gym at least three times a week.',
    'What\'s the best exercise for building muscle strength?',
    'I\'ve been following a new diet plan for the past month.',
    'Could you show me how to use this fitness equipment?',
    'I feel so much better since I started exercising regularly.',
  ],
};

/**
 * Generates a phrase using backend API (which calls OpenAI securely)
 * @param category - The category for the phrase
 * @param existingPhrases - Optional array of existing phrases to avoid duplicates
 */
export async function generatePhrase(
  category: Category,
  existingPhrases: string[] = []
): Promise<Phrase> {
  try {
    // Call backend API endpoint instead of OpenAI directly
    const response = await fetch('/api/generate-phrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        existingPhrases,
        temperature: 1.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to generate phrase: ${response.statusText}`);
    }

    const data = await response.json();
    const cleanText = data.phrase?.trim();

    if (!cleanText) {
      throw new Error('No phrase generated from API');
    }

    // Check if generated phrase already exists
    if (existingPhrases.includes(cleanText)) {
      console.warn('Generated duplicate phrase, retrying...');
      // Retry once
      const retryResponse = await fetch('/api/generate-phrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          existingPhrases,
          temperature: 1.2, // Higher temperature for retry
        }),
      });

      if (!retryResponse.ok) {
        throw new Error('Failed to retry phrase generation');
      }

      const retryData = await retryResponse.json();
      const retryText = retryData.phrase?.trim();
      
      if (retryText && !existingPhrases.includes(retryText)) {
        const phrase = {
          id: `ai-${Date.now()}-${Math.random()}`,
          text: retryText,
          category,
          source: 'ai-generated' as const,
          isFavorite: false,
        };
        console.log('Generated AI phrase (retry):', phrase);
        return phrase;
      }
    }

    const phrase = {
      id: `ai-${Date.now()}-${Math.random()}`,
      text: cleanText,
      category,
      source: 'ai-generated' as const,
      isFavorite: false,
    };
    console.log('Generated AI phrase:', phrase);
    return phrase;
  } catch (error) {
    console.error('Error generating phrase:', error);
    // Don't fallback to standard phrases - throw error so caller can handle it
    throw error;
  }
}

/**
 * Generates a phrase from fallback data
 * Note: Currently unused, but kept for potential future use
 */
function _generateFallbackPhrase(category: Category): Phrase {
  const phrases = fallbackPhrases[category];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  return {
    id: `fallback-${Date.now()}`,
    text: randomPhrase,
    category,
    source: 'standard',
    isFavorite: false,
  };
}
