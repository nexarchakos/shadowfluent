import { VoiceSettings } from '../types';

const ELEVEN_PROXY_URL = (import.meta.env.VITE_ELEVENLABS_PROXY_URL as string | undefined) || '/api/elevenlabs-tts';
const ELEVEN_PROXY_ENABLED = (import.meta.env.VITE_ELEVENLABS_PROXY_ENABLED as string | undefined) === 'true';

export class TTSService {
  private synth: SpeechSynthesis | null;
  private voices: SpeechSynthesisVoice[] = [];
  private supported: boolean;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAbort: AbortController | null = null;
  private lastEngineUsed: 'elevenlabs' | 'browser' | null = null;
  private lastError: string | null = null;

  constructor() {
    const hasWindow = typeof window !== 'undefined';
    const hasSynth = hasWindow && 'speechSynthesis' in window;
    const hasUtterance = typeof SpeechSynthesisUtterance !== 'undefined';
    this.supported = hasWindow && hasSynth && hasUtterance;
    this.synth = this.supported ? window.speechSynthesis : null;
    this.loadVoices();
    
    // Reload voices when they become available
    if (this.synth && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synth) {
      this.voices = [];
      return;
    }
    this.voices = this.synth.getVoices();
  }

  private isFemaleVoice(voice: SpeechSynthesisVoice) {
    const nameLower = voice.name.toLowerCase();
    return nameLower.includes('female') || nameLower.includes('zira') ||
      nameLower.includes('samantha') || nameLower.includes('karen') ||
      nameLower.includes('susan') || nameLower.includes('linda') ||
      nameLower.includes('heather') || nameLower.includes('moira');
  }

  private isMaleVoice(voice: SpeechSynthesisVoice) {
    const nameLower = voice.name.toLowerCase();
    return nameLower.includes('male') || nameLower.includes('david') ||
      nameLower.includes('alex') || nameLower.includes('daniel') ||
      nameLower.includes('tom') || nameLower.includes('lee') ||
      nameLower.includes('james') || nameLower.includes('thomas') ||
      nameLower.includes('nick') || nameLower.includes('oliver') ||
      nameLower.includes('mark') || nameLower.includes('kevin');
  }

  private scoreVoice(voice: SpeechSynthesisVoice, settings: VoiceSettings) {
    const nameLower = voice.name.toLowerCase();
    let score = 0;

    const isFemale = this.isFemaleVoice(voice);
    const isMale = this.isMaleVoice(voice);
    if (settings.gender === 'female') {
      if (isFemale) score += 50;
      else if (isMale) score -= 50;
    } else {
      if (isMale) score += 50;
      else if (isFemale) score -= 50;
    }

    const accentMap: Record<string, string> = {
      british: 'GB',
      american: 'US',
      australian: 'AU',
      irish: 'IE',
      canadian: 'CA',
    };
    const accent = accentMap[settings.accent] || 'US';
    if (voice.lang.includes(accent) || voice.lang.includes('en')) score += 20;

    if (nameLower.includes('google') || nameLower.includes('microsoft') || nameLower.includes('apple') || nameLower.includes('siri')) {
      score += 15;
    }
    if (nameLower.includes('default')) score -= 5;
    if (nameLower.includes('espeak') || nameLower.includes('festival')) score -= 20;

    if (voice.lang.startsWith('en')) score += 5;
    return score;
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
      
      const isFemale = this.isFemaleVoice(v);
      const isMale = this.isMaleVoice(v);
      
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
          return !this.isFemaleVoice(v); // Accept only if not female
        }
        
        return true; // For female, accept any voice with accent
      });
    }

    // Final fallback to any English voice, BUT only if gender matches
    // For Canadian male, skip this fallback entirely
    if (!voice && (settings.accent !== 'canadian' || gender !== 'male')) {
      voice = this.voices.find(v => {
        if (!v.lang.startsWith('en')) return false;
        
        if (gender === 'male') {
          return !this.isFemaleVoice(v); // Accept only if not female
        }
        
        return true; // For female, accept any English voice
      });
    }

    if (!voice) {
      const scored = [...this.voices]
        .filter(v => v.lang.startsWith('en'))
        .map(v => ({ v, score: this.scoreVoice(v, settings) }))
        .sort((a, b) => b.score - a.score);
      voice = scored[0]?.v || null;
    }

    return voice || null;
  }

  private async speakElevenLabs(text: string, settings: VoiceSettings): Promise<void> {
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const controller = new AbortController();
    this.currentAbort = controller;

    const response = await fetch(ELEVEN_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        settings,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');
      throw new Error(`ElevenLabs error: ${response.status}${responseText ? ` - ${responseText}` : ''}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.currentAudio = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('ElevenLabs audio error'));
      };
      audio.play().catch(reject);
    });
  }

  private speakBrowser(text: string, settings: VoiceSettings, preserveError = false): Promise<void> {
    this.lastEngineUsed = 'browser';
    if (!preserveError) {
      this.lastError = null;
    }
    return new Promise((resolve, reject) => {
      const synth = this.synth;
      if (!synth || !this.supported) {
        resolve();
        return;
      }
      // Cancel any ongoing speech
      synth.cancel();

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
        if (wasCancelled || synth.speaking === false) {
          resolve();
        } else {
          reject(error);
        }
      };

      // Small delay to ensure voice is loaded
      setTimeout(() => {
        if (!wasCancelled) {
          synth.speak(utterance);
        } else {
          resolve();
        }
      }, 50);
      
      // Override cancel to mark as cancelled
      const originalCancel = synth.cancel.bind(synth);
      const cancelOverride = () => {
        wasCancelled = true;
        originalCancel();
      };
      
      // Store original cancel and override
      (synth as any)._originalCancel = originalCancel;
      synth.cancel = cancelOverride;
    });
  }

  speak(text: string, settings: VoiceSettings): Promise<void> {
    if (settings.provider === 'elevenlabs' && this.isElevenLabsConfigured()) {
      return this.speakElevenLabs(text, settings)
        .then(() => {
          this.lastEngineUsed = 'elevenlabs';
          this.lastError = null;
        })
        .catch((error) => {
          // Fallback to browser TTS if ElevenLabs fails
          const message = error instanceof Error ? error.message : 'ElevenLabs error';
          this.lastError = message;
          return this.speakBrowser(text, { ...settings, provider: 'browser' }, true);
        });
    }
    if (settings.provider === 'elevenlabs' && !this.isElevenLabsConfigured()) {
      this.lastError = 'ElevenLabs not configured';
    }
    return this.speakBrowser(text, settings);
  }

  stop() {
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (!this.synth) return;
    this.synth.cancel();
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  isSupported(): boolean {
    return this.supported;
  }

  isElevenLabsConfigured(): boolean {
    return ELEVEN_PROXY_ENABLED;
  }

  isAvailable(settings: VoiceSettings): boolean {
    if (settings.provider === 'elevenlabs') {
      return this.isElevenLabsConfigured() || this.isSupported();
    }
    return this.isSupported();
  }

  getLastEngineUsed(): 'elevenlabs' | 'browser' | null {
    return this.lastEngineUsed;
  }

  getLastError(): string | null {
    return this.lastError;
  }
}

export const ttsService = new TTSService();
