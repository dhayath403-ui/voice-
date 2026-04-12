/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { FinanceView } from './components/FinanceView';
import { AssistantPill } from './components/AssistantPill';
import { AssistantPanel } from './components/AssistantPanel';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';

import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'assistant':
        return <Dashboard />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
      case 'finance':
        return <FinanceView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="xl:pl-64 flex flex-col min-h-screen">
        <TopBar />
        
        <main className="flex-1 flex flex-col items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <AssistantPill onClick={() => setIsPanelOpen(true)} />

        {/* Mobile Bottom Nav */}
        <nav className="xl:hidden fixed bottom-0 left-0 right-0 h-16 mica-effect flex justify-around items-center px-4 z-[60] border-t border-outline-variant/10">
          {[
            { id: 'assistant', label: 'Dashboard', icon: 'dashboard' },
            { id: 'finance', label: 'Finance', icon: 'trending_up' },
            { id: 'history', label: 'History', icon: 'history' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === item.id ? "text-primary font-bold" : "text-gray-400"
              )}
            >
              <span className={cn("material-symbols-outlined", activeTab === item.id && "fill")}>
                {item.icon}
              </span>
              <span className="text-[10px] uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {isPanelOpen && (
          <AssistantPanel onClose={() => setIsPanelOpen(false)} />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#484848 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
    </div>
  );
}
