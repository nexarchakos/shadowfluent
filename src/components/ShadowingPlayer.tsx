import { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
  console.log('ShadowingPlayer render - phrase.id:', phrase.id, 'phrase.text:', phrase.text.substring(0, 50));
  const [currentRepetition, setCurrentRepetition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoStartNext, setAutoStartNext] = useState(false);
  const isFullscreenRef = useRef(false); // Track fullscreen state to prevent flicker
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
  const autoStartNextRef = useRef(false); // Track if we should auto-start next phrase (for race condition prevention)
  const isFinalCountdownRef = useRef(false); // Track if we're in the final countdown (after all repetitions)
  
  // Helper to check if auto-start flag is set (works across re-mounts using sessionStorage as backup)
  const checkAutoStartFlag = () => {
    return autoStartNextRef.current || sessionStorage.getItem('shadowing_autoStartNext') === 'true';
  };
  
  // Helper to set auto-start flag (persists across re-mounts)
  const setAutoStartFlag = (value: boolean) => {
    autoStartNextRef.current = value;
    if (value) {
      sessionStorage.setItem('shadowing_autoStartNext', 'true');
    } else {
      sessionStorage.removeItem('shadowing_autoStartNext');
    }
  };

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
    console.log('useEffect triggered - phrase.id:', phrase.id, 'previousPhraseId.current:', previousPhraseId.current, 'autoStartNext:', autoStartNext, 'autoStartNextRef.current:', autoStartNextRef.current);
    
    // Only run if phrase actually changed
    if (previousPhraseId.current === null) {
      // First time - but check if this is an auto-advance scenario
      const shouldAutoStart = autoStartNext || checkAutoStartFlag();
      if (shouldAutoStart) {
        console.log('First time but autoStartNext is true - this is auto-advance, starting phrase');
        previousPhraseId.current = phrase.id;
        setCurrentRepetition(1);
        setCountdown(null);
        setIsPlaying(true);
        setIsPaused(false);
        setIsFullscreen(true);
        setAutoStartNext(false);
        // Don't clear autoStartFlag yet - we'll clear it after playPhrase starts
        // Set isPlayingRef immediately before setTimeout to ensure it's true
        isPlayingRef.current = true;
        setTimeout(() => {
          console.log('Auto-starting playPhrase(0) for new phrase (first time), isPlayingRef.current:', isPlayingRef.current);
          // Ensure isPlayingRef is still true before calling playPhrase (may have been reset by cleanup)
          if (!isPlayingRef.current) {
            console.warn('isPlayingRef was reset, setting it to true again');
            isPlayingRef.current = true;
            setIsPlaying(true);
          }
          // Now clear the flag after we're sure playPhrase will start
          setAutoStartFlag(false);
          playPhrase(0);
        }, 300);
        return;
      }
      // First time - just set the ID, don't reset anything
      console.log('First time - setting previousPhraseId to:', phrase.id);
      previousPhraseId.current = phrase.id;
      return;
    }

    if (phrase.id !== previousPhraseId.current) {
      const shouldAutoStart = autoStartNext || checkAutoStartFlag();
      console.log('Phrase changed detected - phrase.id:', phrase.id, 'previousPhraseId:', previousPhraseId.current, 'autoStartNext:', autoStartNext, 'shouldAutoStart:', shouldAutoStart);
      // Check both state and ref/sessionStorage to handle race conditions
      if (shouldAutoStart) {
        console.log('Auto-advance detected, starting next phrase');
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
        setAutoStartFlag(false); // Clear flag including sessionStorage
        // Small delay for smooth transition
        setTimeout(() => {
          console.log('Auto-starting playPhrase(0) for new phrase');
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
    isFinalCountdownRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentRepetition(1); // Start at 1, not 0
    isPlayingRef.current = true;
    setIsFullscreen(true);
    await playPhrase(0); // Still pass 0 internally for logic
  };

  const playPhrase = async (repetitionNumber: number) => {
    console.log('playPhrase called - repetitionNumber:', repetitionNumber, 'isPlayingRef.current:', isPlayingRef.current, 'settings.repetitions:', settings.repetitions);
    // Safety check to prevent infinite loops
    // Note: repetitionNumber is 0-based, so if repetitions=3, valid numbers are 0, 1, 2
    // We should stop if repetitionNumber >= settings.repetitions (e.g., if 3 >= 3)
    if (!isPlayingRef.current || repetitionNumber >= settings.repetitions) {
      console.warn('playPhrase stopped - isPlayingRef:', isPlayingRef.current, 'repetitionNumber:', repetitionNumber, '>= settings.repetitions:', settings.repetitions);
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
        // Show countdown one last time before advancing to next phrase (or finishing)
        console.log('All repetitions completed. hasNextPhrase:', hasNextPhrase, 'onNextPhrase:', !!onNextPhrase, 'isPlayingRef:', isPlayingRef.current);
        
        // Mark this as final countdown
        isFinalCountdownRef.current = true;
        
        // Always show countdown (even for last phrase)
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
            
            // Clear final countdown flag
            isFinalCountdownRef.current = false;
            
            // Check if there's a next phrase
            console.log('Final countdown check - hasNextPhrase:', hasNextPhrase, 'onNextPhrase:', !!onNextPhrase, 'isPlayingRef.current:', isPlayingRef.current, 'isPausedRef.current:', isPausedRef.current);
            if (hasNextPhrase && onNextPhrase && isPlayingRef.current && !isPausedRef.current) {
              console.log('Final countdown completed, setting autoStartNext and calling onNextPhrase');
              // Set both state and ref/sessionStorage flag to ensure auto-start works even with race conditions and re-mounts
              // IMPORTANT: Set flag FIRST, synchronously, before calling onNextPhrase
              setAutoStartFlag(true); // Set ref and sessionStorage immediately (synchronous) - this must happen first!
              setAutoStartNext(true);
              // Keep fullscreen open for smooth transition
              // Call onNextPhrase synchronously after setting the ref
              // The ref will be checked in useEffect when phrase changes
              if (onNextPhrase) {
                console.log('Calling onNextPhrase callback immediately, autoStartNextRef.current:', autoStartNextRef.current);
                onNextPhrase();
              }
            } else {
              // No more phrases or playback stopped - close fullscreen
              console.log('No more phrases or playback stopped, closing fullscreen');
              setIsPlaying(false);
              isPlayingRef.current = false;
              setIsFullscreen(false);
              onComplete();
            }
          }
        }, 1000);
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
          
          // Clear final countdown flag if it was set
          const wasFinalCountdown = isFinalCountdownRef.current;
          if (wasFinalCountdown) {
            isFinalCountdownRef.current = false;
          }
          
          if (isPlayingRef.current && !isPausedRef.current) {
            // Check if this is the final countdown (after all repetitions)
            if (wasFinalCountdown) {
              // This is the final countdown - handle onNextPhrase/onComplete
              console.log('Resumed final countdown completed - handling onNextPhrase/onComplete');
              // Clear pause tracking
              pausedDuringSpeechRef.current = false;
              wasSpeakingRef.current = false;
              pausedCountdownRef.current = null;
              
              // Use the same logic as the normal final countdown
              if (hasNextPhrase && onNextPhrase) {
                console.log('Final countdown completed (resumed), setting autoStartNext and calling onNextPhrase');
                setAutoStartFlag(true);
                setAutoStartNext(true);
                if (onNextPhrase) {
                  console.log('Calling onNextPhrase callback immediately, autoStartNextRef.current:', autoStartNextRef.current);
                  onNextPhrase();
                }
              } else {
                console.log('No more phrases (resumed), closing fullscreen');
                setIsPlaying(false);
                isPlayingRef.current = false;
                setIsFullscreen(false);
                onComplete();
              }
            } else {
              // This is a countdown between repetitions - move to next repetition
              const nextRepetition = pausedRepetitionRef.current !== null 
                ? pausedRepetitionRef.current + 1  // Move to next repetition
                : currentRepetition; // Fallback: use current (already 0-based)
              
              // Check if we've completed all repetitions
              if (nextRepetition < settings.repetitions) {
                // Clear pause tracking before playing
                pausedDuringSpeechRef.current = false;
                wasSpeakingRef.current = false;
                pausedCountdownRef.current = null;
                playPhrase(nextRepetition);
              } else {
                // This shouldn't happen - if we're not in final countdown, we shouldn't reach here
                // But handle it gracefully
                console.warn('Resumed countdown but nextRepetition >= repetitions - this should not happen');
                pausedDuringSpeechRef.current = false;
                wasSpeakingRef.current = false;
                pausedCountdownRef.current = null;
              }
            }
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
    isFinalCountdownRef.current = false;
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
  // Also show fullscreen if autoStartNext is active (to prevent flicker during phrase transition)
  const shouldShowFullscreen = (isFullscreen || checkAutoStartFlag()) && (isPlaying || isPaused || checkAutoStartFlag());
  
  // Sync ref with state
  if (isFullscreen) {
    isFullscreenRef.current = true;
  }
  
  if (shouldShowFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 to-primary-800 w-screen h-screen overflow-hidden">
        <div className="w-full h-full grid grid-rows-[min-content_1fr_min-content] gap-4 md:gap-6 p-4 md:p-8">
          {/* Countdown - small, reserved slot */}
          <div className="w-full text-center pointer-events-none min-h-[36px] md:min-h-[48px]">
            {countdown !== null && countdown > 0 && (
              <>
                <div className="text-2xl md:text-3xl lg:text-4xl [@media(max-height:500px)]:text-xl font-bold text-white/90 leading-none animate-pulse">
                  {countdown}
                </div>
                <p className="text-white/70 text-xs md:text-sm lg:text-base [@media(max-height:500px)]:text-[11px]">
                  seconds
                </p>
              </>
            )}
          </div>

          {/* Text area - centered but never clipped; scroll if needed */}
          <div className="w-full min-h-0 flex items-start justify-center overflow-y-auto px-4 md:px-8">
            <div className="text-center max-w-5xl w-full py-2">
              <h2 
                className={`font-bold text-white mb-4 md:mb-6 leading-tight ${
                  phrase.text.length > 100 
                    ? 'text-4xl md:text-5xl lg:text-6xl' 
                    : phrase.text.length > 60 
                    ? 'text-5xl md:text-6xl lg:text-7xl' 
                    : 'text-6xl md:text-7xl lg:text-8xl'
              } [@media(max-height:600px)]:text-4xl [@media(max-height:500px)]:text-3xl`}
              >
                {phrase.text}
              </h2>
              {translatedText && (
                <p 
                  className={`text-white/80 italic ${
                    translatedText.length > 100 
                      ? 'text-xl md:text-2xl lg:text-3xl' 
                      : translatedText.length > 60 
                      ? 'text-2xl md:text-3xl lg:text-4xl' 
                      : 'text-2xl md:text-3xl lg:text-4xl'
                  } [@media(max-height:600px)]:text-xl [@media(max-height:500px)]:text-lg`}
                >
                  {translatedText}
                </p>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-3xl px-4 pb-[env(safe-area-inset-bottom)]">
            <div className="text-center">
              <div className="text-4xl md:text-5xl lg:text-6xl [@media(max-height:500px)]:text-3xl font-bold text-white mb-1 md:mb-2">
                {currentRepetition} / {settings.repetitions}
              </div>
              <p className="text-white/90 text-base md:text-lg lg:text-xl [@media(max-height:500px)]:text-sm">
                Repetitions
              </p>
            </div>

            <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
              {isPlaying && !isPaused && (
                <button
                  onClick={pauseSession}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 [@media(max-height:500px)]:py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold text-base md:text-lg shadow-lg"
                >
                  <Pause className="w-5 h-5 md:w-6 md:h-6" />
                  Pause
                </button>
              )}

              {isPaused && (
                <button
                  onClick={resumeSession}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 [@media(max-height:500px)]:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-base md:text-lg shadow-lg"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                  Resume
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  onClick={resetSession}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 [@media(max-height:500px)]:py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors font-semibold text-base md:text-lg shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
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
