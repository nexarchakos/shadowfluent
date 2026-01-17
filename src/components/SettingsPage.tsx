import { ShadowingSettings, VoiceSettings, TranslationLanguage } from '../types';
import { ArrowLeft, Volume2, Repeat, Clock, Languages } from 'lucide-react';

interface SettingsPageProps {
  shadowingSettings: ShadowingSettings;
  voiceSettings: VoiceSettings;
  translationLanguage: TranslationLanguage;
  onShadowingSettingsChange: (settings: ShadowingSettings) => void;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  onTranslationLanguageChange: (language: TranslationLanguage) => void;
  onBack: () => void;
}

const translationLanguages: { code: TranslationLanguage; name: string; flag: string }[] = [
  { code: 'none', name: 'No Translation', flag: '🚫' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export default function SettingsPage({
  shadowingSettings,
  voiceSettings,
  translationLanguage,
  onShadowingSettingsChange,
  onVoiceSettingsChange,
  onTranslationLanguageChange,
  onBack,
}: SettingsPageProps) {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-semibold mb-4 text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-white/90 text-lg">
            Customize your options for the best shadowing experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Shadowing Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Repeat className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Repetitions</h2>
                <p className="text-gray-600">Set the number of repetitions</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-medium text-gray-700">
                    Number of Repetitions
                  </label>
                  <span className="text-2xl font-bold text-primary-600">
                    {shadowingSettings.repetitions}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={shadowingSettings.repetitions}
                  onChange={(e) =>
                    onShadowingSettingsChange({
                      ...shadowingSettings,
                      repetitions: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Interval
                  </label>
                  <span className="text-2xl font-bold text-primary-600">
                    {shadowingSettings.intervalSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={shadowingSettings.intervalSeconds}
                  onChange={(e) =>
                    onShadowingSettingsChange({
                      ...shadowingSettings,
                      intervalSeconds: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>2s</span>
                  <span>30s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Volume2 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Voice</h2>
                <p className="text-gray-600">Select gender and accent</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Voice Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, gender: 'male' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.gender === 'male'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">👨</div>
                      <div className="font-semibold text-lg">Male</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, gender: 'female' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.gender === 'female'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">👩</div>
                      <div className="font-semibold text-lg">Female</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Accent
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, accent: 'british' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.accent === 'british'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇬🇧</div>
                      <div className="font-semibold text-lg">British</div>
                      <div className="text-sm text-gray-500 mt-1">British English</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, accent: 'american' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.accent === 'american'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇺🇸</div>
                      <div className="font-semibold text-lg">American</div>
                      <div className="text-sm text-gray-500 mt-1">American English</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, accent: 'australian' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.accent === 'australian'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇦🇺</div>
                      <div className="font-semibold text-lg">Australian</div>
                      <div className="text-sm text-gray-500 mt-1">Australian English</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, accent: 'irish' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.accent === 'irish'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇮🇪</div>
                      <div className="font-semibold text-lg">Irish</div>
                      <div className="text-sm text-gray-500 mt-1">Irish English</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, accent: 'canadian' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.accent === 'canadian'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🇨🇦</div>
                      <div className="font-semibold text-lg">Canadian</div>
                      <div className="text-sm text-gray-500 mt-1">Canadian English</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Speech Speed
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, rate: 'slow' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.rate === 'slow'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🐢</div>
                      <div className="font-semibold text-lg">Slow</div>
                      <div className="text-sm text-gray-500 mt-1">0.7x</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, rate: 'normal' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.rate === 'normal'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🚶</div>
                      <div className="font-semibold text-lg">Normal</div>
                      <div className="text-sm text-gray-500 mt-1">1.0x</div>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      onVoiceSettingsChange({ ...voiceSettings, rate: 'fast' })
                    }
                    className={`p-6 rounded-xl border-2 transition-all ${
                      voiceSettings.rate === 'fast'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🚀</div>
                      <div className="font-semibold text-lg">Fast</div>
                      <div className="text-sm text-gray-500 mt-1">1.3x</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Translation Language Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Languages className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Translation Language</h2>
                <p className="text-gray-600">Select the language for phrase translations</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {translationLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onTranslationLanguageChange(lang.code)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    translationLanguage === lang.code
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{lang.flag}</div>
                    <div className="font-semibold text-sm">{lang.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Tip</h3>
                <p className="text-blue-800 text-sm">
                  Available voices depend on your browser and operating system. 
                  If a voice doesn't sound good, try a different browser (Chrome, Firefox, Safari).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
