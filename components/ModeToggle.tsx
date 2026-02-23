import React from 'react';
import { ChatMode } from '../types';

interface ModeToggleProps {
  mode: ChatMode;
  onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  const isPro = mode === 'pro';

  return (
    <div className="flex items-center gap-2">
       <span className={`text-xs font-bold transition-colors ${!isPro ? 'text-white' : 'text-slate-500'}`}>
        LITE
      </span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isPro ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
        role="switch"
        aria-checked={isPro}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isPro ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-xs font-bold transition-colors ${isPro ? 'text-cyan-300' : 'text-slate-500'}`}>
        PRO
      </span>
    </div>
  );
};

export default ModeToggle;
