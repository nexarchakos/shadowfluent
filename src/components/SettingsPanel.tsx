import { ShadowingSettings, VoiceSettings } from '../types';
import { Settings } from 'lucide-react';

interface SettingsPanelProps {
  shadowingSettings: ShadowingSettings;
  voiceSettings: VoiceSettings;
  onShadowingSettingsChange: (settings: ShadowingSettings) => void;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SettingsPanel({
  shadowingSettings,
  voiceSettings,
  onShadowingSettingsChange,
  onVoiceSettingsChange,
  isOpen,
  onToggle,
}: SettingsPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-gray-700 hover:text-primary-600 mb-4"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold">Ρυθμίσεις</span>
      </button>

      {isOpen && (
        <div className="space-y-6">
          {/* Shadowing Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Αριθμός Επαναλήψεων: {shadowingSettings.repetitions}
            </label>
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
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Χρονικό Διάστημα (δευτερόλεπτα): {shadowingSettings.intervalSeconds}
            </label>
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
              className="w-full"
            />
          </div>

          {/* Voice Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Φύλο Φωνής
            </label>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  onVoiceSettingsChange({ ...voiceSettings, gender: 'male' })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  voiceSettings.gender === 'male'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Άνδρας
              </button>
              <button
                onClick={() =>
                  onVoiceSettingsChange({ ...voiceSettings, gender: 'female' })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  voiceSettings.gender === 'female'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Γυναίκα
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Προφορά
            </label>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  onVoiceSettingsChange({ ...voiceSettings, accent: 'british' })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  voiceSettings.accent === 'british'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Βρετανική
              </button>
              <button
                onClick={() =>
                  onVoiceSettingsChange({ ...voiceSettings, accent: 'american' })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  voiceSettings.accent === 'american'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Αμερικάνικη
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
