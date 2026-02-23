
import React from 'react';
import GithubIcon from './icons/GithubIcon';
import ObsidianLogo from './icons/ObsidianLogo';

interface WelcomePageProps {
  onContinue: () => void;
  onLearnMore: () => void;
  isVisible: boolean;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onContinue, onLearnMore, isVisible }) => {
  return (
    <div className={`fixed inset-0 z-20 flex justify-center items-start sm:items-center font-sans p-4 overflow-y-auto transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="max-w-2xl w-full bg-slate-900/30 border border-cyan-400/30 rounded-lg p-4 sm:p-8 my-4 text-center shadow-2xl shadow-cyan-500/10">
        <div className="flex justify-center mb-4">
          <ObsidianLogo className="w-12 h-12" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wider mb-2">
          O B S I D I A N
        </h1>
        <p className="text-base sm:text-lg text-cyan-300 mb-4 sm:mb-6">
          Built for Gemini 2.5 Pro
        </p>

        <div className="text-center text-slate-300 space-y-2 my-6 sm:my-8 border-t border-b border-slate-700 py-6 sm:py-8 px-2 sm:px-4">
          <p className="text-lg">
            An AI-assisted options trading analyst.
          </p>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Built on Gemini 2.5. Helps structure defined-risk trades, evaluate greeks, and reason through risk scenarios based on your input. No live market data. For educational use only.
          </p>
        </div>

        <div className="my-6 sm:my-8 flex flex-col items-center space-y-4">
          <button
            onClick={onLearnMore}
            className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 font-bold py-3 px-8 rounded-lg transition-colors duration-300 w-full max-w-xs"
          >
            Learn More (Recommended)
          </button>
          <button
            onClick={onContinue}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 w-full max-w-xs"
          >
            Acknowledge & Continue
          </button>
        </div>

        <div className="mt-6 sm:mt-8">
          <a href="https://github.com/Of-Arte/obsidian-chatbot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200">
            <GithubIcon />
            <span>View on GitHub</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default WelcomePage;
