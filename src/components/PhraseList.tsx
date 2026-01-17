import { Phrase, TranslationLanguage } from '../types';
import { Sparkles, Shuffle, Loader2, Heart, Star } from 'lucide-react';
import { getPhraseTranslation } from '../utils/translation';
import { useState, useEffect, useMemo } from 'react';

interface PhraseListProps {
  phrases: Phrase[];
  selectedPhrase: Phrase | null;
  onSelectPhrase: (phrase: Phrase) => void;
  onGenerateNew: () => void;
  onGenerateBatch?: (count: number) => Promise<void>;
  onToggleFavorite?: (phraseId: string) => void;
  onShuffle?: () => void;
  isLoading: boolean;
  isGeneratingBatch?: boolean;
  translationLanguage?: TranslationLanguage;
}

export default function PhraseList({
  phrases,
  selectedPhrase,
  onSelectPhrase,
  onGenerateNew,
  onGenerateBatch,
  onToggleFavorite,
  onShuffle,
  isLoading,
  isGeneratingBatch = false,
  translationLanguage = 'el',
}: PhraseListProps) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Separate phrases by source (memoized for performance)
  const standardPhrases = useMemo(() => phrases.filter(p => p.source === 'standard'), [phrases]);
  const aiPhrases = useMemo(() => phrases.filter(p => p.source === 'ai-generated'), [phrases]);
  const uploadedPhrases = useMemo(() => phrases.filter(p => p.source === 'uploaded'), [phrases]);
  const favoritePhrases = useMemo(() => phrases.filter(p => p.isFavorite), [phrases]);

  // Filter phrases based on showFavoritesOnly (memoized for performance)
  const displayedPhrases = useMemo(() => {
    return showFavoritesOnly ? favoritePhrases : phrases;
  }, [showFavoritesOnly, favoritePhrases, phrases]);

  // Update translations when phrases or language change
  // Use batch processing to avoid too many simultaneous API calls
  // Added abort controller to cancel pending translations when component unmounts or dependencies change
  useEffect(() => {
    const abortController = new AbortController();
    let isCancelled = false;
    
    const updateTranslations = async () => {
      const newTranslations: Record<string, string> = {};
      
      // Process translations in batches to avoid overwhelming the API
      const batchSize = 10;
      const maxConcurrent = 5; // Limit concurrent translations to prevent freezing
      
      for (let i = 0; i < displayedPhrases.length; i += batchSize) {
        if (isCancelled || abortController.signal.aborted) {
          break;
        }
        
        const batch = displayedPhrases.slice(i, i + batchSize);
        
        // Process in smaller concurrent groups
        for (let j = 0; j < batch.length; j += maxConcurrent) {
          if (isCancelled || abortController.signal.aborted) {
            break;
          }
          
          const concurrentBatch = batch.slice(j, j + maxConcurrent);
          
          await Promise.all(
            concurrentBatch.map(async (phrase) => {
              if (isCancelled || abortController.signal.aborted) {
                return;
              }
              
              if (translationLanguage && translationLanguage !== 'none') {
                // First check if phrase has built-in translation
                if (phrase.translation) {
                  newTranslations[phrase.id] = phrase.translation;
                  return;
                }
                
                // Then try to get translation (uses mock first, then API if enabled)
                try {
                  const translation = await getPhraseTranslation(phrase.text, translationLanguage);
                  if (translation && !isCancelled) {
                    newTranslations[phrase.id] = translation;
                  }
                } catch (error) {
                  // Silently fail for translation errors
                  console.warn('Translation error for phrase:', phrase.id, error);
                }
              } else if (phrase.translation) {
                newTranslations[phrase.id] = phrase.translation;
              }
            })
          );
        }
        
        // Small delay between batches to be respectful to API and prevent freezing
        if (i + batchSize < displayedPhrases.length && !isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      if (!isCancelled && !abortController.signal.aborted) {
        setTranslations(newTranslations);
      }
    };
    
    updateTranslations();
    
    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [displayedPhrases, translationLanguage]);

  const handleGenerateBatch = async () => {
    if (!onGenerateBatch) return;
    await onGenerateBatch(5); // Generate 5 phrases at once
  };

  const handleShuffle = () => {
    if (onShuffle) {
      onShuffle();
    }
  };

  const handleToggleFavorite = (phraseId: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(phraseId);
    }
  };

  const getBadge = (phrase: Phrase) => {
    // Only show badges for AI-generated and uploaded phrases
    // Standard phrases don't need a badge (they're the default)
    if (phrase.source === 'ai-generated') {
      return (
        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Generated
        </span>
      );
    }
    if (phrase.source === 'uploaded') {
      return (
        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
          📁 Uploaded
        </span>
      );
    }
    // Standard phrases: no badge (they're the default)
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col gap-4 mb-6">
        {/* Header with title and filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-gray-800">Phrases</h3>
            {favoritePhrases.length > 0 && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showFavoritesOnly
                    ? 'bg-yellow-500 text-white border-2 border-yellow-600 shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                Favorites ({favoritePhrases.length})
              </button>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {standardPhrases.length > 0 && onShuffle && (
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all shadow-sm hover:shadow-md font-medium"
                title="Randomize the order of all phrases"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            )}
            {onGenerateBatch && (
              <button
                onClick={handleGenerateBatch}
                disabled={isGeneratingBatch || isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
                title="Generate 5 new AI phrases at once"
              >
                {isGeneratingBatch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate 5 Phrases</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onGenerateNew}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
              title="Generate 1 new AI phrase for this category"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating...' : 'Generate 1 Phrase'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span>Total: <strong>{phrases.length}</strong></span>
          {standardPhrases.length > 0 && (
            <span>Standard: <strong>{standardPhrases.length}</strong></span>
          )}
          {aiPhrases.length > 0 && (
            <span>AI: <strong>{aiPhrases.length}</strong></span>
          )}
          {uploadedPhrases.length > 0 && (
            <span>Uploaded: <strong>{uploadedPhrases.length}</strong></span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {displayedPhrases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {showFavoritesOnly ? 'No favorite phrases yet.' : 'No phrases available.'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {showFavoritesOnly 
                ? 'Mark phrases as favorites to see them here.'
                : 'Select a category to see available phrases or upload your own file.'}
            </p>
          </div>
        ) : (
          displayedPhrases.map((phrase, index) => {
            const displayTranslation = translations[phrase.id] || phrase.translation;
            const isFavorite = phrase.isFavorite || false;
            return (
              <button
                key={phrase.id}
                onClick={() => onSelectPhrase(phrase)}
                className={`
                  w-full text-left p-5 rounded-xl transition-all transform hover:scale-[1.02] duration-200 relative
                  ${selectedPhrase?.id === phrase.id
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-500 shadow-md'
                    : phrase.source === 'uploaded'
                    ? 'bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-200'
                    : phrase.source === 'ai-generated'
                    ? 'bg-purple-50 hover:bg-purple-100 border-2 border-transparent hover:border-purple-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Badge and Favorite button */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getBadge(phrase)}
                  </div>
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(phrase.id);
                      }}
                      className={`p-1.5 rounded-full transition-all ${
                        isFavorite
                          ? 'text-yellow-600 bg-yellow-400 hover:bg-yellow-500 shadow-md'
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Phrase text */}
                <p className="font-semibold text-gray-800 text-lg leading-relaxed">
                  {phrase.text}
                </p>
                
                {/* Translation */}
                {displayTranslation && (
                  <p className="text-sm text-gray-600 mt-2 italic leading-relaxed">
                    {displayTranslation}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
