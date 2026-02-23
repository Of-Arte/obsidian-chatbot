
import React from 'react';
import InformationIcon from './icons/InformationIcon';

interface ProModeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ProModeModal: React.FC<ProModeModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      style={{ animationDuration: '300ms' }}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in ease; }
      `}</style>
      <div
        className="max-w-md w-full bg-slate-900 border border-cyan-400/30 rounded-lg p-6 shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-cyan-400 flex-shrink-0">
            <InformationIcon />
          </div>
          <h2 className="text-xl font-bold text-white">Pro Mode Activated</h2>
        </div>

        <div className="text-slate-300 space-y-3">
          <p>Pro mode switches to a more verbose, detailed response style with a larger system prompt.</p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
            <li><strong className="text-cyan-300">Longer Responses:</strong> The model is prompted to provide more detailed reasoning, breakdowns, and caveats per reply.</li>
            <li><strong className="text-cyan-300">No Live Data:</strong> This is still a static LLM. It has no access to real-time market data, news feeds, or external APIs.</li>
            <li><strong className="text-cyan-300">Higher Token Usage:</strong> More detailed prompts mean more tokens per request, which may affect rate limits or API costs.</li>
          </ul>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProModeModal;
