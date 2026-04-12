import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { HistoryEntry } from '../types';
import { Tooltip } from './Tooltip';

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: '1',
    date: 'Today',
    time: '14:22 PM',
    type: 'voice',
    icon: 'settings_voice',
    query: 'Kai, generate a warm analog bass patch with a slow filter sweep for my current project.',
    response: 'Tuning the virtual oscillators... I\'ve synthesized a custom Luthier-Preset-04. It features dual sawtooth waves with a 24dB ladder filter. I\'ve mapped the modulation wheel to the cutoff frequency as requested.',
    status: 'Synthesizer Mode',
    tags: ['Audio', 'Synthesis'],
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    id: '2',
    date: 'Today',
    time: '11:05 AM',
    type: 'text',
    icon: 'person',
    query: 'Check my calendar for tomorrow\'s studio session.',
    response: 'Verified schedule. Found \'Deep Mix Session\' at 10:00 AM with Studio B. Sent a confirmation ping to the engineer.',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
  },
  {
    id: '3',
    date: 'Today',
    time: '09:15 AM',
    type: 'text',
    icon: 'person',
    query: 'Summarize the latest research on spatial audio.',
    response: 'Analyzed 3 recent whitepapers. Key takeaways: Object-based rendering is becoming standard for mobile HRTF; latency reduced by 15ms in new protocols.',
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
  },
  {
    id: '4',
    date: 'Yesterday',
    time: '18:45 PM',
    type: 'text',
    icon: 'chat_bubble',
    query: 'Write a polite email to the label about the release date.',
    response: 'Draft saved to clips.',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: '5',
    date: 'Yesterday',
    time: '15:30 PM',
    type: 'action',
    icon: 'cloud',
    query: 'Upload the master files to the secure server.',
    response: '3 files uploaded (42.5MB).',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: '6',
    date: 'Yesterday',
    time: '12:10 PM',
    type: 'image',
    icon: 'lightbulb',
    query: 'Give me some ideas for a lyric about digital isolation.',
    response: 'Generated 5 conceptual prompts.',
    timestamp: Date.now() - 1000 * 60 * 60 * 28,
  }
];

export const HistoryView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'voice' | 'text' | 'image' | 'action'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>([]);
  
  // Advanced Search States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchIn, setSearchIn] = useState<'both' | 'query' | 'response'>('both');

  useEffect(() => {
    const saved = localStorage.getItem('hay_kai_history');
    if (saved) {
      try {
        setLocalHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local history", e);
      }
    }
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...MOCK_HISTORY, ...localHistory];

    // Filter by type
    if (filter !== 'all') {
      result = result.filter(item => item.type === filter);
    }

    // Date Range Filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(item => item.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + (1000 * 60 * 60 * 24) - 1; // End of day
      result = result.filter(item => item.timestamp <= end);
    }

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => {
        const inQuery = item.query.toLowerCase().includes(lowerQuery);
        const inResponse = item.response.toLowerCase().includes(lowerQuery);
        
        if (searchIn === 'query') return inQuery;
        if (searchIn === 'response') return inResponse;
        return inQuery || inResponse;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      return a.timestamp - b.timestamp;
    });

    return result;
  }, [filter, sortBy, searchQuery]);

  // Group by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: HistoryEntry[] } = {};
    filteredAndSortedHistory.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return groups;
  }, [filteredAndSortedHistory]);

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar max-w-6xl mx-auto w-full pt-20">
      {/* Controls Header */}
      <div className="mt-8 mb-12 bg-surface-container-low/40 p-6 rounded-2xl border border-outline-variant/10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'text', 'voice', 'image', 'action'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                  filter === t 
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(53,21,216,0.5)]" 
                    : "bg-surface-container-highest text-on-surface-variant hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-highest border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <Tooltip content="Toggle advanced search options" position="bottom">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  showAdvanced ? "bg-primary text-black" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80"
                )}
                title="Advanced Search"
              >
                <span className="material-symbols-outlined text-lg">tune</span>
              </button>
            </Tooltip>

            <Tooltip content={`Sort by ${sortBy === 'newest' ? 'oldest' : 'newest'} first`} position="bottom">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-xl text-sm font-medium hover:bg-surface-container-highest/80 transition-colors"
                onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
              >
                <span className="material-symbols-outlined text-lg">
                  {sortBy === 'newest' ? 'sort_by_alpha' : 'filter_list'}
                </span>
                <span className="hidden sm:inline">{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </Tooltip>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 bg-surface-container-highest border-none rounded-lg py-1.5 px-3 text-xs text-white focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-on-surface-variant text-xs">to</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 bg-surface-container-highest border-none rounded-lg py-1.5 px-3 text-xs text-white focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Search In */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Search In</label>
                  <div className="flex bg-surface-container-highest rounded-lg p-1">
                    {(['both', 'query', 'response'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSearchIn(mode)}
                        className={cn(
                          "flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                          searchIn === mode ? "bg-surface-variant text-white shadow-sm" : "text-on-surface-variant hover:text-white"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <Tooltip content="Clear all search parameters" position="top" className="w-full">
                    <button 
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setSearchIn('both');
                        setSearchQuery('');
                        setFilter('all');
                      }}
                      className="w-full py-2 rounded-lg border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                      Reset All Filters
                    </button>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 opacity-20">history_toggle_off</span>
          <p className="text-lg font-headline font-bold">No history found</p>
          <p className="text-sm opacity-60">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        Object.entries(groupedHistory).map(([date, entries]) => {
          const typedEntries = entries as HistoryEntry[];
          return (
            <section key={date} className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-baseline gap-4 mb-6">
                <h3 className="text-3xl font-extrabold font-headline tracking-tighter text-white">{date}</h3>
                <span className="text-on-surface-variant/60 font-medium text-sm">
                  {typedEntries.length} {typedEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {typedEntries.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "group relative bg-surface-container-low rounded-xl p-6 hover:bg-surface-container-highest transition-all border border-outline-variant/10",
                      item.type === 'voice' && "lg:col-span-2 p-8"
                    )}
                  >
                  <div className="absolute top-0 right-0 p-6 flex gap-2">
                    {item.status && (
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                        {item.status}
                      </span>
                    )}
                    <span className="text-on-surface-variant text-xs font-mono">{item.time}</span>
                  </div>

                  <div className={cn(item.type === 'voice' ? "max-w-2xl" : "")}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        item.type === 'voice' ? "bg-secondary/20 text-secondary" : "bg-surface-container-highest text-primary"
                      )}>
                        <span className={cn("material-symbols-outlined text-sm", item.type !== 'voice' && "fill")}>
                          {item.icon}
                        </span>
                      </div>
                      <h4 className={cn(
                        "font-headline font-bold text-white leading-tight",
                        item.type === 'voice' ? "text-2xl" : "text-base"
                      )}>
                        "{item.query}"
                      </h4>
                    </div>

                    <div className={cn(
                      "mica-effect rounded-xl p-4 border-l-2 border-primary/40",
                      item.type === 'voice' ? "p-6 border-l-4 border-primary" : "ml-11"
                    )}>
                      {item.type === 'voice' && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-xs font-bold text-primary-dim uppercase tracking-widest">Assistant Action</span>
                        </div>
                      )}
                      <p className={cn(
                        "text-on-surface leading-relaxed whitespace-pre-wrap",
                        item.type === 'voice' ? "italic" : "text-sm"
                      )}>
                        {item.response}
                      </p>
                      
                      {item.type === 'voice' && (
                        <div className="mt-4 flex gap-4">
                          <Tooltip content="Listen to the synthesized tone" position="top">
                            <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-sm">play_circle</span> Preview Tone
                            </button>
                          </Tooltip>
                          <Tooltip content="Download MIDI sequence" position="top">
                            <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-sm">download</span> Export MIDI
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })
    )}
    </div>
  );
};
