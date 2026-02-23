import React, { useState, useRef, useEffect } from 'react';
import { GoogleUser } from '../types';
import SignOutIcon from './icons/SignOutIcon';

interface UserMenuProps {
  user: GoogleUser;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400"
        aria-label="User menu"
      >
        <img src={user.picture} alt="User avatar" referrerPolicy="no-referrer" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20"
          role="menu"
        >
          <div className="p-4 border-b border-slate-700">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
              role="menuitem"
            >
              <SignOutIcon />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
