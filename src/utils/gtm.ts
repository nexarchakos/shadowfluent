/**
 * Google Tag Manager (GTM) Utility
 * 
 * This utility provides functions to interact with GTM's dataLayer
 * and send custom events for analytics tracking.
 */

// Declare dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Initialize GTM dataLayer if it doesn't exist
 */
export const initGTM = (): void => {
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }
};

/**
 * Push an event to GTM dataLayer
 * 
 * @param eventName - The name of the event (e.g., 'button_click', 'page_view')
 * @param eventData - Additional data to send with the event (optional)
 * 
 * @example
 * pushGTMEvent('phrase_selected', { category: 'business', phrase_id: '123' })
 */
export const pushGTMEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    console.warn('GTM dataLayer is not initialized');
    return;
  }

  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};

/**
 * Track page views
 * 
 * @param path - The page path (e.g., '/category/business')
 */
export const trackPageView = (path: string): void => {
  pushGTMEvent('page_view', {
    page_path: path,
    page_title: document.title,
  });
};

/**
 * Track phrase selection
 * 
 * @param category - The category of the phrase
 * @param phraseId - Unique identifier for the phrase (optional)
 * @param source - The source of the phrase ('standard' | 'ai-generated' | 'uploaded')
 */
export const trackPhraseSelected = (
  category: string,
  phraseId?: string,
  source?: 'standard' | 'ai-generated' | 'uploaded'
): void => {
  pushGTMEvent('phrase_selected', {
    category,
    phrase_id: phraseId,
    phrase_source: source,
  });
};

/**
 * Track shadowing session start
 * 
 * @param phraseId - Unique identifier for the phrase
 * @param repetitions - Number of repetitions configured
 * @param interval - Time interval between repetitions (in seconds)
 */
export const trackSessionStart = (
  phraseId: string,
  repetitions: number,
  interval: number
): void => {
  pushGTMEvent('shadowing_session_start', {
    phrase_id: phraseId,
    repetitions,
    interval_seconds: interval,
  });
};

/**
 * Track shadowing session completion
 * 
 * @param phraseId - Unique identifier for the phrase
 * @param duration - Total duration of the session (in seconds)
 */
export const trackSessionComplete = (phraseId: string, duration: number): void => {
  pushGTMEvent('shadowing_session_complete', {
    phrase_id: phraseId,
    duration_seconds: duration,
  });
};

/**
 * Track AI phrase generation
 * 
 * @param category - The category for which the phrase was generated
 * @param count - Number of phrases generated (1 or 5)
 */
export const trackAIGeneration = (category: string, count: number): void => {
  pushGTMEvent('ai_phrase_generated', {
    category,
    phrase_count: count,
  });
};

/**
 * Track file upload
 * 
 * @param fileName - Name of the uploaded file
 * @param fileType - Type of the file (e.g., 'txt', 'docx', 'doc')
 * @param phraseCount - Number of phrases extracted from the file
 */
export const trackFileUpload = (
  fileName: string,
  fileType: string,
  phraseCount: number
): void => {
  pushGTMEvent('file_uploaded', {
    file_name: fileName,
    file_type: fileType,
    phrase_count: phraseCount,
  });
};
