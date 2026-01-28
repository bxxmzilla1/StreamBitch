import React, { useState } from 'react';

interface SetupProps {
  onStart: (models: string[]) => void;
  savedModels: string[];
}

const Setup: React.FC<SetupProps> = ({ onStart, savedModels }) => {
  const [input, setInput] = useState('');
  const [useSaved, setUseSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processAndStart(input);
  };

  const processAndStart = (rawInput: string) => {
    const names = rawInput
      .split(/[\n, ]+/) // Split by newline, comma, or space
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length > 0) {
      onStart(names);
    }
  };

  const loadPrevious = () => {
    onStart(savedModels);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6">
      <div className="w-full max-w-2xl bg-gray-850 rounded-xl shadow-2xl border border-gray-800 p-8 transform transition-all animate-fade-in-up">
        <div className="flex items-center justify-center mb-6">
          <img src="/icon128.png" alt="StreamBitch Logo" className="w-16 h-16" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2">StreamBitch</h1>
        <p className="text-gray-400 text-center mb-8">
          Enter Chaturbate model usernames to generate your monitoring dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="usernames" className="block text-sm font-medium text-gray-300 mb-2">
              Usernames (separated by spaces, commas, or new lines)
            </label>
            <textarea
              id="usernames"
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="alice_wonderland&#10;bob_builder&#10;charlie_stream"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-brand-600/20"
            >
              Start Monitoring
            </button>
            
            {savedModels.length > 0 && (
              <button
                type="button"
                onClick={loadPrevious}
                className="flex-none px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors border border-gray-600"
              >
                Load Last Session ({savedModels.length})
              </button>
            )}
          </div>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-600">
                Data is stored locally in your browser. No data is sent to external servers other than the stream requests.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;