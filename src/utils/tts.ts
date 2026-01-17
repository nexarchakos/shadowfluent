import { VoiceSettings } from '../types';

export class TTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Reload voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  private findVoice(settings: VoiceSettings): SpeechSynthesisVoice | null {
    // Map accents to language codes
    const accentMap: Record<string, string> = {
      'british': 'GB',
      'american': 'US',
      'australian': 'AU',
      'irish': 'IE',
      'canadian': 'CA',
    };
    
    const accent = accentMap[settings.accent] || 'US';
    const gender = settings.gender;
    
    // Preferred voices for better quality
    const preferredVoices: Record<string, string[]> = {
      'british-female': ['Google UK English Female', 'Microsoft Zira - English (United Kingdom)', 'Samantha'],
      'british-male': ['Google UK English Male', 'Microsoft David - English (United Kingdom)', 'Daniel'],
      'american-female': ['Google US English Female', 'Microsoft Zira - English (United States)', 'Samantha', 'Karen'],
      'american-male': ['Google US English Male', 'Microsoft David - English (United States)', 'Alex', 'Daniel'],
      'australian-female': ['Google Australian English Female', 'Microsoft Zira - English (Australia)'],
      'australian-male': ['Google Australian English Male', 'Microsoft David - English (Australia)'],
      'irish-female': ['Google Irish English Female', 'Microsoft Zira - English (Ireland)'],
      'irish-male': ['Google Irish English Male', 'Microsoft David - English (Ireland)'],
      'canadian-female': ['Google Canadian English Female', 'Microsoft Zira - English (Canada)'],
      'canadian-male': ['Google Canadian English Male', 'Microsoft David - English (Canada)'],
    };

    const key = `${settings.accent}-${settings.gender}`;
    const preferred = preferredVoices[key] || [];

    // Try to find preferred voice first
    // For Canadian male, be extra strict about checking gender
    for (const preferredName of preferred) {
      const voice = this.voices.find(v => {
        const nameMatches = v.name.includes(preferredName);
        const langMatches = v.lang.includes(accent) || v.lang.includes('en');
        
        if (!nameMatches || !langMatches) return false;
        
        // For Canadian male voices, explicitly reject female voices
        if (settings.accent === 'canadian' && gender === 'male') {
          const nameLower = v.name.toLowerCase();
          const isFemale = nameLower.includes('female') || nameLower.includes('zira') || 
                           nameLower.includes('samantha') || nameLower.includes('karen') ||
                           nameLower.includes('susan') || nameLower.includes('linda') ||
                           nameLower.includes('heather') || nameLower.includes('moira');
          if (isFemale) return false;
        }
        
        return true;
      });
      if (voice) return voice;
    }

    // Try to find any voice with matching accent and gender
    // More specific matching for male voices, especially for Canadian
    let voice = this.voices.find(v => {
      const hasAccent = v.lang.includes(accent) || (settings.accent === 'canadian' && v.lang.includes('en-CA')) || 
                        (settings.accent === 'australian' && v.lang.includes('en-AU')) ||
                        (settings.accent === 'irish' && v.lang.includes('en-IE'));
      
      if (!hasAccent) return false;
      
      const nameLower = v.name.toLowerCase();
      // More comprehensive female detection
      const isFemale = nameLower.includes('female') || nameLower.includes('zira') || 
                       nameLower.includes('samantha') || nameLower.includes('karen') ||
                       nameLower.includes('susan') || nameLower.includes('linda') ||
                       nameLower.includes('heather') || nameLower.includes('moira');
      
      // More comprehensive male detection - critical for Canadian
      const isMale = nameLower.includes('male') || nameLower.includes('david') || 
                     nameLower.includes('alex') || nameLower.includes('daniel') ||
                     nameLower.includes('tom') || nameLower.includes('lee') ||
                     nameLower.includes('james') || nameLower.includes('thomas') ||
                     nameLower.includes('nick') || nameLower.includes('oliver') ||
                     nameLower.includes('mark') || nameLower.includes('kevin');
      
      if (gender === 'female') {
        // For female, prioritize female voices, but accept neutral if no female found
        return isFemale || (!isMale && !isFemale);
      } else {
        // For male, ONLY accept male voices - reject female or neutral
        // ESPECIALLY for Canadian - be extra strict
        if (settings.accent === 'canadian') {
          // For Canadian male, ONLY accept voices explicitly marked as male
          return isMale && !isFemale;
        }
        // For other accents, also be strict
        return isMale && !isFemale;
      }
    });

    // Fallback to any English voice with the right accent, BUT only if gender matches
    // This is critical for male voices - don't accept female voices as fallback
    // For Canadian male, skip accent fallback entirely - only use explicitly male voices
    if (!voice && (settings.accent !== 'canadian' || gender !== 'male')) {
      voice = this.voices.find(v => {
        const hasAccent = v.lang.includes(accent) || 
          (settings.accent === 'canadian' && v.lang.includes('en-CA')) ||
          (settings.accent === 'australian' && v.lang.includes('en-AU')) ||
          (settings.accent === 'irish' && v.lang.includes('en-IE'));
        
        if (!hasAccent) return false;
        
        // For male voices, still reject female voices even in fallback
        if (gender === 'male') {
          const nameLower = v.name.toLowerCase();
          const isFemale = nameLower.includes('female') || nameLower.includes('zira') || 
                           nameLower.includes('samantha') || nameLower.includes('karen') ||
                           nameLower.includes('susan') || nameLower.includes('linda') ||
                           nameLower.includes('heather') || nameLower.includes('moira');
          return !isFemale; // Accept only if not female
        }
        
        return true; // For female, accept any voice with accent
      });
    }

    // Final fallback to any English voice, BUT only if gender matches
    // For Canadian male, skip this fallback entirely
    if (!voice && (settings.accent !== 'canadian' || gender !== 'male')) {
      voice = this.voices.find(v => {
        if (!v.lang.startsWith('en')) return false;
        
        // For male voices, still reject female voices even in final fallback
        if (gender === 'male') {
          const nameLower = v.name.toLowerCase();
          const isFemale = nameLower.includes('female') || nameLower.includes('zira') || 
                           nameLower.includes('samantha') || nameLower.includes('karen') ||
                           nameLower.includes('susan') || nameLower.includes('linda') ||
                           nameLower.includes('heather') || nameLower.includes('moira');
          return !isFemale; // Accept only if not female
        }
        
        return true; // For female, accept any English voice
      });
    }

    return voice || null;
  }

  speak(text: string, settings: VoiceSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.findVoice(settings);

      if (voice) {
        utterance.voice = voice;
      }

      // Set voice properties for better quality
      // Map rate setting to actual rate values
      const rateMap: Record<string, number> = {
        slow: 0.7,
        normal: 1.0,
        fast: 1.3,
      };
      utterance.rate = rateMap[settings.rate] || 1.0;
      // More aggressive pitch adjustment for Canadian male voices to ensure they sound male
      if (settings.accent === 'canadian' && settings.gender === 'male') {
        utterance.pitch = 0.85; // Lower pitch for Canadian male to ensure it sounds male
      } else {
        utterance.pitch = settings.gender === 'male' ? 0.90 : 1.05; // Standard pitch adjustment
      }
      utterance.volume = 1;

      // Track if speech was cancelled (paused)
      let wasCancelled = false;
      
      utterance.onend = () => {
        // Always resolve, even if cancelled (paused)
        resolve();
      };
      
      utterance.onerror = (error) => {
        // If speech was cancelled (paused), don't reject - just resolve
        // This prevents the catch block from closing fullscreen
        if (wasCancelled || this.synth.speaking === false) {
          resolve();
        } else {
          reject(error);
        }
      };

      // Small delay to ensure voice is loaded
      setTimeout(() => {
        if (!wasCancelled) {
          this.synth.speak(utterance);
        } else {
          resolve();
        }
      }, 50);
      
      // Override cancel to mark as cancelled
      const originalCancel = this.synth.cancel.bind(this.synth);
      const cancelOverride = () => {
        wasCancelled = true;
        originalCancel();
      };
      
      // Store original cancel and override
      (this.synth as any)._originalCancel = originalCancel;
      this.synth.cancel = cancelOverride;
    });
  }

  stop() {
    this.synth.cancel();
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

export const ttsService = new TTSService();
