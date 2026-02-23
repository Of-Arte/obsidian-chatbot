
import React from 'react';
import { Session } from '../types';
import NewChatIcon from './icons/NewChatIcon';
import DeleteIcon from './icons/DeleteIcon';

interface HistorySidebarProps {
  isVisible: boolean;
  sessions: Session[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isVisible,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose,
}) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectSession from firing
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity lg:hidden ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Chat History</h2>
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Start new chat"
          >
            <NewChatIcon />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <ul>
            {sessions.map(session => (
              <li key={session.id}>
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left p-2.5 rounded-md truncate group relative ${
                    currentSessionId === session.id
                      ? 'bg-cyan-500/20 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  } transition-colors`}
                >
                  <span className="block truncate pr-8">{session.title}</span>
                  <span
                    onClick={(e) => handleDelete(e, session.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <DeleteIcon />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800">
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;