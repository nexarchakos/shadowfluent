export type Category = 
  | 'business' 
  | 'travel' 
  | 'sport' 
  | 'meetings'
  | 'daily-conversation'
  | 'job-interview'
  | 'academic'
  | 'medical'
  | 'restaurant'
  | 'shopping'
  | 'technology'
  | 'social-media'
  | 'questions'
  | 'family'
  | 'emergency'
  | 'education'
  | 'entertainment'
  | 'health-fitness';

export type VoiceGender = 'male' | 'female';
export type VoiceAccent = 'british' | 'american' | 'australian' | 'irish' | 'canadian';
export type SpeechRate = 'slow' | 'normal' | 'fast';
export type VoiceProvider = 'browser' | 'elevenlabs';

export type TranslationLanguage = 'el' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'none';

export interface VoiceSettings {
  gender: VoiceGender;
  accent: VoiceAccent;
  rate: SpeechRate;
  provider: VoiceProvider;
}

export interface TranslationSettings {
  language: TranslationLanguage;
}

export interface ShadowingSettings {
  repetitions: number;
  intervalSeconds: number;
}

export type PhraseSource = 'standard' | 'ai-generated' | 'uploaded';

export interface Phrase {
  id: string;
  text: string;
  category: Category;
  translation?: string;
  source?: PhraseSource; // Track where phrase came from
  isFavorite?: boolean; // For favorites system
}

export interface ShadowingSession {
  phrase: Phrase;
  currentRepetition: number;
  totalRepetitions: number;
  intervalSeconds: number;
  isPlaying: boolean;
  isPaused: boolean;
}
