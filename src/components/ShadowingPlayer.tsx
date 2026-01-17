import { useState, useEffect, useRef } from 'react';
import { Phrase, ShadowingSettings, VoiceSettings, TranslationLanguage } from '../types';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { ttsService } from '../utils/tts';
import { getPhraseTranslation } from '../utils/translation';

interface ShadowingPlayerProps {
  phrase: Phrase;
  settings: ShadowingSettings;
  voiceSettings: VoiceSettings;
  translationLanguage?: TranslationLanguage;
  onComplete: () => void;
  onNextPhrase?: () => void;
  hasNextPhrase?: boolean;
}

export default function ShadowingPlayer({
  phrase,
  settings,
  voiceSettings,
  translationLanguage,
  onComplete,
  onNextPhrase,
  hasNextPhrase = false,
}: ShadowingPlayerProps) {
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoStartNext, setAutoStartNext] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | undefined>(phrase.translation);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false); // Prevent infinite loops
  const isPausedRef = useRef(false); // Track paused state to avoid race conditions
  const previousPhraseId = useRef<string | null>(null);
  const pausedDuringSpeechRef = useRef(false); // Track if paused during speech (not countdown)
  const pausedRepetitionRef = useRef<number | null>(null); // Track which repetition was paused (0-based)
  const wasSpeakingRef = useRef(false); // Track if we were in the middle of speaking when paused
  const pausedCountdownRef = useRef<number | null>(null); // Track countdown value when paused
  const lastCompletedRepetitionRef = useRef<number | null>(null); // Track the last completed repetition (0-based)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      ttsService.stop();
      isPlayingRef.current = false;
    };
  }, []);

  // Update translation when phrase or language changes
  useEffect(() => {
    const updateTranslation = async () => {
      if (translationLanguage && translationLanguage !== 'none') {
        const translation = await getPhraseTranslation(phrase.text, translationLanguage);
        setTranslatedText(translation);
      } else {
        // Use original translation if available, or none
        setTranslatedText(phrase.translation);
      }
    };
    updateTranslation();
  }, [phrase.text, phrase.translation, translationLanguage]);

  // Reset when phrase changes (unless it's auto-advance)
  useEffect(() => {
    // Only run if phrase actually changed
    if (previousPhraseId.current === null) {
      // First time - just set the ID, don't reset anything
      previousPhraseId.current = phrase.id;
      return;
    }

    if (phrase.id !== previousPhraseId.current) {
      if (autoStartNext) {
        // This is an auto-advance scenario - keep playing and fullscreen
        previousPhraseId.current = phrase.id;
        // Reset repetition counter but keep fullscreen and playing state
        setCurrentRepetition(1); // Start at 1 for display
        setCountdown(null);
        setIsPlaying(true);
        setIsPaused(false);
        isPlayingRef.current = true;
        setIsFullscreen(true); // Keep fullscreen for smooth transition
        setAutoStartNext(false);
        // Small delay for smooth transition
        setTimeout(() => {
          playPhrase(0); // Still pass 0 internally for logic
        }, 300);
      } else {
        // Just phrase changed - reset everything to initial state
        previousPhraseId.current = phrase.id;
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentRepetition(0);
        setCountdown(null);
        setIsFullscreen(false);
        isPlayingRef.current = false;
        setAutoStartNext(false);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        ttsService.stop();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.id]);

  const startSession = async () => {
    // Clear paused ref and pause tracking
    isPausedRef.current = false;
    pausedDuringSpeechRef.current = false;
    wasSpeakingRef.current = false;
    pausedRepetitionRef.current = null;
    pausedCountdownRef.current = null;
    lastCompletedRepetitionRef.current = null;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentRepetition(1); // Start at 1, not 0
    isPlayingRef.current = true;
    setIsFullscreen(true);
    await playPhrase(0); // Still pass 0 internally for logic
  };

  const playPhrase = async (repetitionNumber: number) => {
    // Safety check to prevent infinite loops
    if (!isPlayingRef.current || repetitionNumber >= settings.repetitions) {
      setIsPlaying(false);
      setCountdown(null);
      isPlayingRef.current = false;
      setIsFullscreen(false);
      onComplete();
      return;
    }

    try {
      // Show repetition number before speaking (1-based for display)
      setCurrentRepetition(repetitionNumber + 1);
      
      await ttsService.speak(phrase.text, voiceSettings);
      
      // Check if paused during speech - if so, don't continue
      // Use ONLY refs to avoid race conditions with state updates
      if (isPausedRef.current || !isPlayingRef.current) {
        return;
      }
      
      // Mark this repetition as completed
      lastCompletedRepetitionRef.current = repetitionNumber;
      
      // Update repetition counter for next iteration
      const nextRepetition = repetitionNumber + 1;

      // Check if we should continue to next repetition
      // Always check isPlayingRef to ensure we're still playing
      if (nextRepetition < settings.repetitions && isPlayingRef.current && !isPausedRef.current) {
        // Start countdown before next repetition
        let remaining = settings.intervalSeconds;
        setCountdown(remaining);

        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
          // Check if paused - if so, stop the countdown
          // Use ONLY refs to avoid race conditions
          if (isPausedRef.current || !isPlayingRef.current) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return;
          }
          remaining -= 1;
          setCountdown(remaining);

          if (remaining <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setCountdown(null);
            // Recursively call with updated repetition number
            if (isPlayingRef.current && !isPausedRef.current) {
              playPhrase(nextRepetition);
            }
          }
        }, 1000);
      } else {
        // All repetitions completed for this phrase
        // Show countdown one last time before advancing to next phrase
        if (hasNextPhrase && onNextPhrase && isPlayingRef.current) {
          let remaining = settings.intervalSeconds;
          setCountdown(remaining);

          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = setInterval(() => {
            // Check if paused - if so, stop the countdown
            // Use ONLY refs to avoid race conditions
            if (isPausedRef.current || !isPlayingRef.current) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return;
            }
            remaining -= 1;
            setCountdown(remaining);

            if (remaining <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              setCountdown(null);
              // Set flag to auto-start next phrase
              if (isPlayingRef.current && !isPausedRef.current) {
                setAutoStartNext(true);
                // Keep fullscreen open for smooth transition
                setTimeout(() => {
                  if (onNextPhrase) {
                    onNextPhrase();
                  }
                }, 300);
              }
            }
          }, 1000);
        } else {
          // No more phrases, close fullscreen
          setCountdown(null);
          setIsPlaying(false);
          isPlayingRef.current = false;
          setIsFullscreen(false);
          onComplete();
        }
      }
    } catch (error) {
      console.error('Error playing phrase:', error);
      // CRITICAL: Check if paused BEFORE closing fullscreen (use ref to avoid race conditions)
      // If paused, keep fullscreen active - don't close it
      if (isPausedRef.current || isPaused) {
        // If paused, just stop the ref but keep fullscreen and isPlaying true
        isPlayingRef.current = false;
        return; // Exit early - don't close fullscreen
      }
      // Only close fullscreen if NOT paused
      setIsPlaying(false);
      setCountdown(null);
      isPlayingRef.current = false;
      setIsFullscreen(false);
    }
  };

  const pauseSession = () => {
    // CRITICAL: Set paused ref FIRST (before state) to avoid race conditions
    isPausedRef.current = true;
    setIsPaused(true);
    // CRITICAL: Keep isPlaying true - don't change it to false
    // The fullscreen condition is: isFullscreen && (isPlaying || isPaused)
    // We keep isPlaying true so fullscreen stays active
    // Only stop the ref so playPhrase loop stops
    isPlayingRef.current = false;
    
    // Track if paused during speech (no countdown) or during countdown
    if (countdown === null || countdown === 0) {
      // Paused during speech - save current repetition and mark that we were speaking
      pausedDuringSpeechRef.current = true;
      wasSpeakingRef.current = true;
      // When paused during speech, we're in the middle of a repetition
      // Use currentRepetition - 1 to get the 0-based repetition number we're currently on
      pausedRepetitionRef.current = currentRepetition - 1; // Convert to 0-based for playPhrase
      pausedCountdownRef.current = null; // No countdown when paused during speech
    } else {
      // Paused during countdown - save the last completed repetition and countdown value
      pausedDuringSpeechRef.current = false;
      wasSpeakingRef.current = false;
      // When paused during countdown, we've just finished a repetition
      // Use lastCompletedRepetitionRef to get the repetition we just finished
      pausedRepetitionRef.current = lastCompletedRepetitionRef.current !== null 
        ? lastCompletedRepetitionRef.current 
        : currentRepetition - 1; // Fallback: use currentRepetition - 1
      pausedCountdownRef.current = countdown; // Save countdown value
    }
    
    ttsService.stop();
    if (countdownRef.current) clearInterval(countdownRef.current);
    // Don't clear countdown - keep it visible so user knows where they paused
    // Ensure fullscreen stays active
    if (!isFullscreen) {
      setIsFullscreen(true);
    }
  };

  const resumeSession = async () => {
    // CRITICAL: Clear paused ref FIRST (before state) to avoid race conditions
    isPausedRef.current = false;
    setIsPaused(false);
    // Ensure isPlaying is true and we're in fullscreen
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (!isFullscreen) {
      setIsFullscreen(true);
    }
    
    // If there's a countdown, resume it from where it was
    if (countdown !== null && countdown > 0) {
      // We were paused during countdown
      // Resume countdown from where it was
      let remaining = countdown;
      countdownRef.current = setInterval(() => {
        // Check if paused again
        if (isPausedRef.current || !isPlayingRef.current) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return;
        }
        remaining -= 1;
        setCountdown(remaining);

        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCountdown(null);
          if (isPlayingRef.current && !isPausedRef.current) {
            // Countdown finished - move to NEXT repetition (not the same one)
            // pausedRepetitionRef.current is the repetition we just finished when paused
            // We want to move to the next one
            const nextRepetition = pausedRepetitionRef.current !== null 
              ? pausedRepetitionRef.current + 1  // Move to next repetition
              : currentRepetition; // Fallback: use current (already 0-based)
            // Clear pause tracking before playing
            pausedDuringSpeechRef.current = false;
            wasSpeakingRef.current = false;
            pausedCountdownRef.current = null;
            playPhrase(nextRepetition);
          }
        }
      }, 1000);
    } else {
      // No countdown - we were paused during speech
      // Resume from the same repetition (re-read the phrase)
      // playPhrase will handle the countdown after speaking
      if (isPlayingRef.current && !isPausedRef.current) {
        // Use the saved repetition number, or fallback to current
        const repetitionToPlay = pausedRepetitionRef.current !== null 
          ? pausedRepetitionRef.current 
          : currentRepetition - 1;
        // Clear pause tracking before playing
        pausedDuringSpeechRef.current = false;
        wasSpeakingRef.current = false;
        pausedCountdownRef.current = null;
        await playPhrase(repetitionToPlay);
      }
    }
  };

  const resetSession = () => {
    ttsService.stop();
    isPausedRef.current = false;
    pausedDuringSpeechRef.current = false;
    wasSpeakingRef.current = false;
    pausedRepetitionRef.current = null;
    pausedCountdownRef.current = null;
    lastCompletedRepetitionRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentRepetition(0); // Reset to 0 (will show 0 until start)
    setCountdown(null);
    isPlayingRef.current = false;
    setIsFullscreen(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Fullscreen component - TRUE fullscreen
  // Show fullscreen when playing or paused (not just when phrase is selected)
  if (isFullscreen && (isPlaying || isPaused)) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 to-primary-800 w-screen h-screen overflow-hidden">
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
          {/* Countdown - TOP of screen, small, doesn't affect text position */}
          {countdown !== null && countdown > 0 && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-10 w-full">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white/90 mb-1 animate-pulse">
                  {countdown}
                </div>
                <p className="text-white/70 text-sm md:text-base">seconds</p>
              </div>
            </div>
          )}

          {/* Fixed text area - CENTER, ABSOLUTE POSITION, never moves */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[45%] text-center max-w-5xl w-full px-8 pb-40">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight transition-opacity duration-300">
              {phrase.text}
            </h2>
            {translatedText && (
              <p className="text-white/80 text-2xl md:text-3xl italic transition-opacity duration-300">
                {translatedText}
              </p>
            )}
          </div>

          {/* Bottom controls - fixed position at bottom with more padding */}
          <div className="absolute bottom-40 md:bottom-48 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-6 w-full max-w-3xl px-4 z-20">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {currentRepetition} / {settings.repetitions}
              </div>
              <p className="text-white/90 text-xl">Repetitions</p>
            </div>

            <div className="flex gap-4">
              {isPlaying && !isPaused && (
                <button
                  onClick={pauseSession}
                  className="flex items-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold text-lg shadow-lg"
                >
                  <Pause className="w-6 h-6" />
                  Pause
                </button>
              )}

              {isPaused && (
                <button
                  onClick={resumeSession}
                  className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-lg shadow-lg"
                >
                  <Play className="w-6 h-6" />
                  Resume
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  onClick={resetSession}
                  className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-semibold text-lg shadow-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{phrase.text}</h2>
        {translatedText && (
          <p className="text-gray-600 italic">{translatedText}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {currentRepetition} / {settings.repetitions}
          </div>
          <p className="text-gray-600">Repetitions</p>
        </div>

        {countdown !== null && countdown > 0 && (
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">
              {countdown}
            </div>
            <p className="text-gray-600">seconds until next repetition</p>
          </div>
        )}

        <div className="flex gap-4">
          {!isPlaying && !isPaused && (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          )}

          {isPlaying && !isPaused && (
            <button
              onClick={pauseSession}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
            >
              <Pause className="w-5 h-5" />
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={resumeSession}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <Play className="w-5 h-5" />
              Resume
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={resetSession}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
