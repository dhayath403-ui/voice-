import React from 'react';
import { cn } from '../lib/utils';
import { Tooltip } from './Tooltip';
import { useSettings } from '../context/SettingsContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profilePicture, displayName } = useSettings();
  const navItems = [
    { id: 'assistant', label: 'Hushh Kai Dashboard', icon: 'dashboard', tooltip: 'Personal Data Command Center' },
    { id: 'history', label: 'History', icon: 'history', tooltip: 'View Past Conversations' },
    { id: 'settings', label: 'Settings', icon: 'settings', tooltip: 'App Configuration' },
    { id: 'finance', label: 'Finance', icon: 'trending_up', tooltip: 'Hushh Financial Intelligence' },
    { id: 'alpha-aloha', label: 'Alpha Aloha', icon: 'auto_awesome', tooltip: 'Evergreen Alpha Aloha Fund A' },
    { id: 'about', label: 'About', icon: 'info', tooltip: 'About Hushh Kai' },
  ];

  return (
    <aside className="hidden xl:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex-col py-8 px-4 rounded-r-xl z-20 border-r border-outline-variant/10">
      <div className="mb-12 px-4">
        <h2 className="text-xl font-bold tracking-tighter text-on-background font-headline">Hushh Kai</h2>
        <p className="text-xs text-on-surface-variant font-headline">Your Personal Data Agent</p>
      </div>

      <Tooltip content="Start a fresh conversation" position="right" className="w-full">
        <button className="mb-8 w-full py-3 px-4 rounded-full bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg">
          <span className="material-symbols-outlined text-sm">add</span>
          New Chat
        </button>
      </Tooltip>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Tooltip key={item.id} content={item.tooltip} position="right" className="w-full">
            <button
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left w-full",
                activeTab === item.id 
                  ? "text-primary font-bold bg-surface-container-highest" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              <span className={cn("material-symbols-outlined", activeTab === item.id && "fill")}>
                {item.icon}
              </span>
              <span className="font-headline">{item.label}</span>
            </button>
          </Tooltip>
        ))}
      </nav>

      <div className="mt-auto px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden">
          {profilePicture ? (
            <img src={profilePicture} alt="User Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQNMDqTHw4oyAWX0g5Cgz-dhr5YIhHVDa46lDiwoa5JQdJZ5dlG_G9FFTVpecv8LuHjG6EgQjySzrQVzzZnEx6KskRWsfPMd4eJki3EjSHXntbLfbe7Y9y9lW3WkKekSgrhnS_ZCySO8eM7x8R0HwUcxn4LDAAzhk58ICeGfL35_ey37vOBoW0oMNo2duzhF_KP98Ii4e2P0KbEn2r3laE1TVDNFU7SilVpQ2Ixqb-ky6JdBW0y_0p-b3eptrBsOU4OReC7GLNP4Sq" 
              alt="System Status"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-on-background truncate max-w-[120px]">{displayName || 'System Ready'}</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Synchronized</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
