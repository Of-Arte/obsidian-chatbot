
import React from 'react';
import HomeIcon from './icons/HomeIcon';
import HistoryIcon from './icons/HistoryIcon';
import InformationIcon from './icons/InformationIcon';
import NewChatIcon from './icons/NewChatIcon';
import ObsidianLogo from './icons/ObsidianLogo';
import ModeToggle from './ModeToggle';
import { ChatMode } from '../types';
import ModeTooltip from './ModeTooltip';

interface HeaderProps {
  onGoHome: () => void;
  onResetChat: () => void;
  onToggleHistory: () => void;
  onShowAbout: () => void;
  chatMode: ChatMode;
  onToggleMode: () => void;
  showModeTooltip: boolean;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onResetChat, onToggleHistory, onShowAbout, chatMode, onToggleMode, showModeTooltip }) => {
  return (
    <header
      className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg border-b border-cyan-400/20"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleHistory}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Toggle chat history"
          >
            <HistoryIcon />
          </button>
          <button
            onClick={onResetChat}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Start new chat"
          >
            <NewChatIcon />
          </button>
        </div>

        <div className="flex-shrink min-w-0 px-2 flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider truncate">
          </h1>
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <ObsidianLogo className="w-4 h-4 text-cyan-400 fill-current" />
              <p className="text-xs sm:text-sm text-cyan-300 truncate">
                O B S I D I A N
              </p>
            </div>
            <button
              onClick={onShowAbout}
              className="text-slate-400 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-full"
              aria-label="Learn more about Obsidian"
              title="Learn More"
            >
              <InformationIcon />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ModeToggle mode={chatMode} onToggle={onToggleMode} />
            <ModeTooltip show={showModeTooltip} />
          </div>
          <div className="h-6 w-px bg-slate-700 sm:block"></div>
          <div className="flex items-center gap-1">
            <button
              onClick={onGoHome}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Go to welcome page"
            >
              <HomeIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;