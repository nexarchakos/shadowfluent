import { useState } from 'react';
import { Check } from 'lucide-react';

interface TextPasteFormProps {
  onSubmit: (text: string) => void;
}

export default function TextPasteForm({ onSubmit }: TextPasteFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText(''); // Clear after submit
    }
  };

  const lineCount = text
    .replace(/\r\n/g, '\n')
    .replace(/([.;\u037E])(\s+|$)/g, '$1\n')
    .split('\n')
    .filter(line => line.trim()).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your phrases here, one per line...&#10;&#10;Example:&#10;I would like to schedule a meeting&#10;Could you please send me the proposal&#10;We need to discuss the project"
          className="w-full h-32 md:h-40 px-3 py-2 text-sm text-white font-semibold bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent placeholder:text-white/60 resize-y"
          rows={5}
        />
        {lineCount > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-white/10 px-2 py-1 rounded font-semibold">
            {lineCount} phrase{lineCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm"
      >
        <Check className="w-4 h-4" />
        Add Phrases
      </button>
    </form>
  );
}
