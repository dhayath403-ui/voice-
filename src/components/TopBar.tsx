import React from 'react';
import { Tooltip } from './Tooltip';
import { useSettings } from '../context/SettingsContext';

export const TopBar: React.FC = () => {
  const { profilePicture, displayName, setIsLocked, faceLockEnabled } = useSettings();
  return (
    <header className="flex justify-between items-center w-full px-8 h-20 bg-transparent font-headline fixed top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-center gap-3 xl:hidden pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-black text-lg fill">electric_bolt</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter">Hushh Kai</h1>
      </div>
      
      <div className="hidden xl:block"></div>

      <div className="flex items-center gap-6 pointer-events-auto">
        <div className="flex items-center gap-4 text-primary">
          {faceLockEnabled && (
            <Tooltip content="Lock App" position="bottom">
              <button 
                onClick={() => setIsLocked(true)}
                className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-colors group"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">lock</span>
              </button>
            </Tooltip>
          )}
          {displayName && (
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest hidden md:block">
              {displayName}
            </span>
          )}
          <Tooltip content="Profile & Account" position="bottom">
            {profilePicture ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/30 cursor-pointer opacity-80 hover:opacity-100">
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <span className="material-symbols-outlined cursor-pointer opacity-80 hover:opacity-100">account_circle</span>
            )}
          </Tooltip>
          <Tooltip content="Help & Support" position="bottom">
            <span className="material-symbols-outlined cursor-pointer opacity-80 hover:opacity-100">help_outline</span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
