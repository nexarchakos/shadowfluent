import { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Category, Phrase, ShadowingSettings, VoiceSettings, TranslationLanguage } from './types';
import CategorySelector from './components/CategorySelector';
import PhraseList from './components/PhraseList';
import ShadowingPlayer from './components/ShadowingPlayer';
import SettingsPage from './components/SettingsPage';
import TextPasteForm from './components/TextPasteForm';
import SEOFooter from './components/SEOFooter';
import { mockPhrases } from './data/mockPhrases';
import { generatePhrase } from './utils/aiPhraseGenerator';
import { Upload, Settings, ArrowLeft } from 'lucide-react';
import mammoth from 'mammoth';
import { urlSlugToCategory, categoryToUrlSlug } from './utils/urlMapping';
import { getCategoryLabel } from './utils/categoryLabels';

type View = 'main' | 'settings';

function App() {
  const params = useParams<{ category?: string }>();
  const location = useLocation();
  const { category: categoryParam } = params;
  const navigate = useNavigate();
  
  // Debug: Extract category from URL pathname as fallback
  const pathnameCategory = location.pathname.slice(1); // Remove leading '/'
  const actualCategoryParam = categoryParam || (pathnameCategory && pathnameCategory !== '' ? pathnameCategory : undefined);
  
  
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'paste'>('file');
  const [uploadSectionOpen, setUploadSectionOpen] = useState(false);
  
  const [shadowingSettings, setShadowingSettings] = useState<ShadowingSettings>({
    repetitions: 3,
    intervalSeconds: 5,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    gender: 'female',
    accent: 'british',
    rate: 'normal',
    provider: 'elevenlabs',
  });

  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>('el');

  // Update meta tags dynamically based on category
  useEffect(() => {
    if (selectedCategory) {
      const categoryLabel = getCategoryLabel(selectedCategory);
      const title = `${categoryLabel} Shadowing English | Shadow Fluent`;
      const description = `Master ${categoryLabel} with our English Shadowing tool. Practice with natural voices, set custom pauses, and improve your fluency. Start shadowing ${categoryLabel} today!`;
      
      // Update document title
      document.title = title;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    } else {
      // Home page meta tags
      document.title = 'Shadowing English | Speaking Practice | Shadow Fluent';
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Master English speaking with ShadowFluent. Practice the shadowing method with different voices, custom text uploads, and adjustable delays. Start speaking like a native today!');
      }
    }
  }, [selectedCategory]);

  // Update category when URL changes
  useEffect(() => {
    if (actualCategoryParam) {
      const category = urlSlugToCategory(actualCategoryParam);
      // If not found in mapping, try direct match (for categories that use same slug)
      const finalCategory = category || (Object.keys(mockPhrases).includes(actualCategoryParam) ? actualCategoryParam as Category : null);
      
      
      if (finalCategory && Object.keys(mockPhrases).includes(finalCategory)) {
        setSelectedCategory(finalCategory);
        setPhrases(mockPhrases[finalCategory]);
        setSelectedPhrase(null);
      } else {
        // Invalid category - clear selection
        setSelectedCategory(null);
        setPhrases([]);
        setSelectedPhrase(null);
      }
    } else {
      setSelectedCategory(null);
      setPhrases([]);
      setSelectedPhrase(null);
    }
  }, [location.pathname, actualCategoryParam]);

  const handleCategorySelect = (category: Category) => {
    const urlSlug = categoryToUrlSlug(category);
    navigate(`/${urlSlug}`);
  };

  const handleGeneratePhrase = async () => {
    if (!selectedCategory) return;

    setIsGenerating(true);
    try {
      // Get existing phrases to avoid duplicates
      const existingTexts = phrases.map(p => p.text);
      const newPhrase = await generatePhrase(selectedCategory, existingTexts);
      
      
      // Double-check for duplicates before adding
      if (!phrases.some(p => p.text === newPhrase.text)) {
        setPhrases((prev) => {
          const updated = [newPhrase, ...prev];
          return updated;
        });
        setSelectedPhrase(newPhrase);
      } else {
        // Retry once
        const retryPhrase = await generatePhrase(selectedCategory, [...existingTexts, newPhrase.text]);
        setPhrases((prev) => [retryPhrase, ...prev]);
        setSelectedPhrase(retryPhrase);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        alert('OpenAI API key is not configured or invalid.\n\nPlease:\n1. Check your .env file\n2. Make sure the API key is correct\n3. Restart the dev server (npm run dev)');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        alert('Invalid OpenAI API key.\n\nPlease check:\n1. Your API key is correct in .env\n2. Your OpenAI account has credits\n3. The API key hasn\'t been revoked');
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        alert('OpenAI API rate limit exceeded. Please wait a moment and try again.');
      } else {
        alert(`Failed to generate phrase: ${errorMessage}\n\nPlease check your OpenAI API key and account status.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBatch = async (count: number) => {
    if (!selectedCategory) return;

    setIsGeneratingBatch(true);
    try {
      const newPhrases: Phrase[] = [];
      const existingTexts = phrases.map(p => p.text);
      
      // Generate phrases in parallel for speed, but with retry logic
      const generateWithRetry = async (attempt: number = 0): Promise<Phrase | null> => {
        if (attempt >= 3) {
          return null;
        }
        
        const allExistingTexts = [...existingTexts, ...newPhrases.map(p => p.text)];
        try {
          const phrase = await generatePhrase(selectedCategory, allExistingTexts);
          
          // Check for duplicates
          if (!allExistingTexts.includes(phrase.text)) {
            return phrase;
          } else {
            return await generateWithRetry(attempt + 1);
          }
        } catch (error) {
          if (attempt < 2) {
            return await generateWithRetry(attempt + 1);
          }
          return null;
        }
      };
      
      // Generate all phrases in parallel (much faster!)
      const promises = Array.from({ length: count }, () => generateWithRetry());
      const results = await Promise.all(promises);
      
      // Filter out null results and ensure all have ai-generated source
      for (const result of results) {
        if (result) {
          // Ensure source is ai-generated
          if (result.source !== 'ai-generated') {
            result.source = 'ai-generated';
          }
          newPhrases.push(result);
        }
      }
      
      if (newPhrases.length > 0) {
        setPhrases((prev) => {
          const updated = [...newPhrases, ...prev];
          return updated;
        });
        setSelectedPhrase(newPhrases[0]);
      } else {
        alert(`Failed to generate phrases. Only ${newPhrases.length} out of ${count} were created. Please check your OpenAI API key and try again.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key')) {
        alert('OpenAI API key is not configured or invalid. Please check your .env file and restart the dev server.');
      } else {
        alert(`Failed to generate phrases: ${errorMessage}`);
      }
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleToggleFavorite = (phraseId: string) => {
    setPhrases((prev) =>
      prev.map((phrase) =>
        phrase.id === phraseId
          ? { ...phrase, isFavorite: !phrase.isFavorite }
          : phrase
      )
    );
    // Update selected phrase if it's the one being favorited
    if (selectedPhrase?.id === phraseId) {
      setSelectedPhrase({
        ...selectedPhrase,
        isFavorite: !selectedPhrase.isFavorite,
      });
    }
  };

  const handleShuffle = () => {
    if (!selectedCategory || phrases.length === 0) return;
    
    // Shuffle ALL phrases (standard, AI-generated, and uploaded) together
    const shuffled = [...phrases];
    
    // Fisher-Yates shuffle algorithm for better randomness
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setPhrases(shuffled);
  };

  const splitPhrases = (text: string) => {
    const normalized = text.replace(/\r\n/g, '\n');
    // Protect URLs/emails and decimals from splitting.
    const protectedTokens: string[] = [];
    const protect = (value: string) => {
      const token = `__PROTECTED_${protectedTokens.length}__`;
      protectedTokens.push(value);
      return token;
    };

    const abbreviations = [
      'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 'St.',
      'e.g.', 'i.e.', 'etc.', 'vs.',
      'κ.', 'κκ.', 'κα.', 'π.χ.', 'δηλ.', 'κλπ.', 'α.λ.'
    ];

    let safe = normalized
      // Protect URLs
      .replace(/https?:\/\/\S+/g, (m) => protect(m))
      // Protect emails
      .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, (m) => protect(m))
      // Protect decimals like 3.14
      .replace(/(\d)\.(\d)/g, (_m, a, b) => `${a}__DECIMAL__${b}`);

    // Protect common abbreviations
    abbreviations.forEach((abbr) => {
      const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      safe = safe.replace(new RegExp(`\\b${escaped}`, 'g'), (m) => protect(m));
    });

    safe = safe.replace(/([.;\u037E?!])\s*/g, '$1\n');

    const lines = safe
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        line
          .replace(/__DECIMAL__/g, '.')
          .replace(/__PROTECTED_(\d+)__/g, (_m, i) => protectedTokens[Number(i)])
      );

    return lines;
  };

  const handleTextSubmit = (text: string) => {
    if (!text || text.trim().length === 0) {
      alert('Please enter some phrases');
      return;
    }

    const lines = splitPhrases(text);
    
    if (lines.length === 0) {
      alert('No phrases found. Please enter at least one phrase (one per line).');
      return;
    }

    const timestamp = Date.now();
    const newPhrases: Phrase[] = lines.map((line, index) => ({
      id: `upload-${timestamp}-${index}`,
      text: line.trim(),
      category: selectedCategory || 'business',
      source: 'uploaded',
      isFavorite: false,
    }));

    // Add uploaded phrases to the beginning of the list so they're visible
    setPhrases((prev) => [...newPhrases, ...prev]);
    if (newPhrases.length > 0) {
      setSelectedPhrase(newPhrases[0]);
      
      // Show success message
      alert(`✅ Successfully added ${newPhrases.length} phrases!\n\nThe phrases appear at the beginning of the list.`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const isTxt = file.name.endsWith('.txt');
    const isDocx = file.name.endsWith('.docx');
    const isDoc = file.name.endsWith('.doc');
    
    if (!isTxt && !isDocx && !isDoc) {
      alert('Please select a .txt, .docx, or .doc file');
      return;
    }

    try {
      let text = '';

      if (isTxt) {
        // Handle .txt files
        const reader = new FileReader();
        
        text = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(file, 'UTF-8');
        });
      } else if (isDocx) {
        // Handle .docx files using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (isDoc) {
        // Handle .doc files - try to read as text first (may not work for binary .doc)
        // For binary .doc files, this is a limitation - ideally would need a library like js-word
        // For now, we'll try to read as text which works for some .doc files saved as text
        try {
          const reader = new FileReader();
          text = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => {
              const result = e.target?.result as string;
              // Check if the result looks like binary data (contains non-printable characters)
              if (result && /[\x00-\x08\x0E-\x1F]/.test(result)) {
                reject(new Error('Binary .doc files are not fully supported. Please convert to .docx or .txt format.'));
              } else {
                resolve(result);
              }
            };
            reader.onerror = () => reject(new Error('Error reading .doc file'));
            // Try reading as text - works for some .doc files
            reader.readAsText(file, 'UTF-8');
          });
        } catch (docError) {
          // If reading as text fails, inform the user
          alert('Unable to read .doc file. Binary .doc files require conversion to .docx or .txt format. Please convert your file and try again.');
          throw docError;
        }
      }

      if (!text || text.trim().length === 0) {
        alert('The file is empty or could not be read');
        return;
      }

      const lines = splitPhrases(text);
      
      if (lines.length === 0) {
        alert('No phrases found in the file');
        return;
      }

      const timestamp = Date.now();
      const newPhrases: Phrase[] = lines.map((line, index) => ({
        id: `upload-${timestamp}-${index}`,
        text: line.trim(),
        category: selectedCategory || 'business',
        source: 'uploaded',
        isFavorite: false,
      }));

      // Add uploaded phrases to the beginning of the list so they're visible
      setPhrases((prev) => [...newPhrases, ...prev]);
      if (newPhrases.length > 0) {
        setSelectedPhrase(newPhrases[0]);
        
        // Show success message
        alert(`✅ Successfully uploaded ${newPhrases.length} phrases!\n\nThe phrases appear at the beginning of the list.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error processing the file';
      if (!errorMessage.includes('Binary .doc')) {
        alert(`Error processing the file. Please make sure it's a valid .txt, .docx, or .doc file.\n\n${errorMessage}`);
      }
    }

    // Reset input so same file can be uploaded again
    event.target.value = '';
  };

  // Show settings page
  if (currentView === 'settings') {
    return (
      <SettingsPage
        shadowingSettings={shadowingSettings}
        voiceSettings={voiceSettings}
        translationLanguage={translationLanguage}
        onShadowingSettingsChange={setShadowingSettings}
        onVoiceSettingsChange={setVoiceSettings}
        onTranslationLanguageChange={setTranslationLanguage}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  // Main content component
  const MainContent = () => {
    // Debug: Check if selectedCategory is set
    
    return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 relative pt-20 md:pt-16 lg:pt-12">
          {/* Logo - Top Left, aligned with H1 */}
          <div className="absolute top-4 md:top-8 lg:top-12 left-0 flex items-center">
            <img 
              src="/shadowfluent-logo.png" 
              alt="Shadow Fluent Logo" 
              className="h-16 md:h-20 lg:h-28 w-auto"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (!target.nextElementSibling) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-sm md:text-base font-bold text-white';
                  fallback.textContent = 'Shadow Fluent';
                  target.parentElement?.appendChild(fallback);
                }
              }}
            />
          </div>
          
          {/* Settings Button - Top Right, aligned with H1 */}
          <div className="absolute top-4 md:top-8 lg:top-12 right-0 flex items-center">
            <button
              onClick={() => setCurrentView('settings')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
          
          {/* Main Heading - Center, single line */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 px-4 md:px-8 lg:px-0">
            {selectedCategory 
              ? `${getCategoryLabel(selectedCategory)} Shadowing English`
              : 'Shadowing English App for Fluency'
            }
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-white/90 text-base md:text-lg lg:text-xl font-medium px-4 md:px-8 lg:px-0">
            {selectedCategory 
              ? `Practice ${getCategoryLabel(selectedCategory)} Phrases with the Shadowing Technique`
              : 'Practice language learning with the shadowing technique'
            }
          </h2>
        </header>

        <div className="space-y-6">
          {/* Back Button - Only show when category is selected */}
          {selectedCategory && (
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Categories</span>
              </button>
            </div>
          )}

          {/* Category Selection - Only show when no category is selected */}
          {!selectedCategory && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Category
              </h2>
              <CategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </div>
          )}

          {/* File Upload and Text Paste - Only show when category is selected */}
          {selectedCategory && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <button
                onClick={() => setUploadSectionOpen(!uploadSectionOpen)}
                className="w-full flex items-center gap-2 cursor-pointer text-white hover:text-white transition-colors text-sm font-bold mb-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs md:text-sm">Upload Your Own Phrases (Optional)</span>
                <span className="ml-auto text-xs">
                  {uploadSectionOpen ? '▼' : '▶'}
                </span>
              </button>
                
                {uploadSectionOpen && (
                <div className="mt-3 space-y-3">
                  {/* Tabs for File Upload vs Paste Text */}
                  <div className="flex gap-2 border-b border-white/10 pb-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadTab('file');
                      }}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${
                        uploadTab === 'file'
                          ? 'border-b-2 border-white/40 text-white'
                          : 'text-white/70 hover:text-white/90'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadTab('paste');
                      }}
                      className={`px-3 py-1 text-xs font-semibold transition-colors ${
                        uploadTab === 'paste'
                          ? 'border-b-2 border-white/40 text-white'
                          : 'text-white/70 hover:text-white/90'
                      }`}
                    >
                      📝 Paste Text
                    </button>
                  </div>

                  {/* File Upload Tab */}
                  {uploadTab === 'file' && (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center w-full h-16 border border-dashed border-white/30 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-4 h-4 mb-1 text-white/80" />
                          <p className="text-xs text-white/90 font-bold">
                            <span className="font-bold">Click to upload</span> or drag file here
                          </p>
                          <p className="text-xs text-white/80 font-semibold">.txt or .docx files</p>
                        </div>
                        <input
                          type="file"
                          accept=".txt,.docx,.doc"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Paste Text Tab */}
                  {uploadTab === 'paste' && (
                    <div className="space-y-2">
                      <TextPasteForm onSubmit={handleTextSubmit} />
                    </div>
                  )}
                  
                  <div className="p-2 bg-white/5 border border-white/10 rounded text-xs text-white/85">
                    <p className="font-bold mb-1">📋 Format:</p>
                    <ul className="space-y-0.5 list-disc list-inside text-xs font-semibold">
                      <li>Each line = one phrase</li>
                      <li>Supports .txt and .docx files, or paste text directly</li>
                    </ul>
                  </div>
                </div>
                )}
          </div>
          )}

          {/* Main Content */}
          {selectedCategory && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Phrase List */}
              <PhraseList
                phrases={phrases}
                selectedPhrase={selectedPhrase}
                onSelectPhrase={setSelectedPhrase}
                onGenerateNew={handleGeneratePhrase}
                onGenerateBatch={handleGenerateBatch}
                isGeneratingBatch={isGeneratingBatch}
                onToggleFavorite={handleToggleFavorite}
                onShuffle={handleShuffle}
                isLoading={isGenerating}
                translationLanguage={translationLanguage}
                showFavoritesOnly={showFavoritesOnly}
                onShowFavoritesOnlyChange={setShowFavoritesOnly}
              />

              {/* Shadowing Player */}
              {selectedPhrase ? (
                <ShadowingPlayer
                  phrase={selectedPhrase}
                  settings={shadowingSettings}
                  voiceSettings={voiceSettings}
                  translationLanguage={translationLanguage}
                  onComplete={() => {
                    // Session completed
                  }}
                  onNextPhrase={() => {
                    const filteredPhrases = showFavoritesOnly 
                      ? phrases.filter(p => p.isFavorite)
                      : phrases;
                    
                    const currentIndex = filteredPhrases.findIndex(p => p.id === selectedPhrase.id);
                    if (currentIndex >= 0 && currentIndex < filteredPhrases.length - 1) {
                      const nextPhrase = filteredPhrases[currentIndex + 1];
                      setSelectedPhrase(nextPhrase);
                    }
                  }}
                  onPrevPhrase={() => {
                    const filteredPhrases = showFavoritesOnly 
                      ? phrases.filter(p => p.isFavorite)
                      : phrases;

                    const currentIndex = filteredPhrases.findIndex(p => p.id === selectedPhrase.id);
                    if (currentIndex > 0) {
                      const prevPhrase = filteredPhrases[currentIndex - 1];
                      setSelectedPhrase(prevPhrase);
                    }
                  }}
                  hasNextPhrase={(() => {
                    // Use filtered phrases based on showFavoritesOnly
                    const filteredPhrases = showFavoritesOnly 
                      ? phrases.filter(p => p.isFavorite)
                      : phrases;
                    
                    const currentIndex = filteredPhrases.findIndex(p => p.id === selectedPhrase.id);
                    const hasNext = currentIndex >= 0 && currentIndex < filteredPhrases.length - 1;
                    return hasNext;
                  })()}
                  hasPrevPhrase={(() => {
                    const filteredPhrases = showFavoritesOnly 
                      ? phrases.filter(p => p.isFavorite)
                      : phrases;

                    const currentIndex = filteredPhrases.findIndex(p => p.id === selectedPhrase.id);
                    return currentIndex > 0;
                  })()}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center min-h-[400px]">
                  <p className="text-gray-500 text-center">
                    Select a phrase to get started
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* SEO Footer */}
        <SEOFooter category={selectedCategory} />

        {/* Copyright Footer */}
        <footer className="mt-6 py-6 text-center">
          <p className="text-white font-semibold text-sm">
            Crafted with ❤️ by Nicholas Exarchakos
          </p>
        </footer>
      </div>
    </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<MainContent />} />
      <Route path="/:category" element={<MainContent />} />
    </Routes>
  );
}

export default App;
