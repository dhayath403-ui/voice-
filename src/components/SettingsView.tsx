import React, { useState, useRef, useEffect } from 'react';
import { useSettings, Language, VoicePersonality } from '../context/SettingsContext';
import { generateVoicePreview } from '../services/geminiService';
import { Tooltip } from './Tooltip';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { cn } from '../lib/utils';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    userLanguage, 
    voice, 
    voiceTrigger, 
    profilePicture, 
    displayName,
    email,
    setLanguage, 
    setUserLanguage, 
    setVoice, 
    setVoiceTrigger,
    setDisplayName,
    setEmail
  } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePreview = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const audioUrl = await generateVoicePreview(voice, language);
      if (!audioUrl) {
        throw new Error("Failed to generate preview");
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.play().catch(err => console.error("Audio play failed:", err));
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (err) {
      console.error("Voice preview failed:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="flex-1 px-8 pb-20 max-w-4xl mx-auto pt-20">
      {/* Hero Orb Indication */}
      <div className="flex items-center gap-8 mb-16 mt-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(53,21,216,0.4)] overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-primary fill">graphic_eq</span>
            )}
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary-dim opacity-20 blur-2xl animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-4xl font-black font-headline tracking-tighter mb-2">
            {displayName ? `Hi, ${displayName.split(' ')[0]}` : 'Tune your Experience'}
          </h3>
          <p className="text-on-surface-variant max-w-md font-body leading-relaxed">Adjust how Hay Kai listens, speaks, and appears in your digital workspace.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Profile & Account Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person</span>
              <h4 className="text-lg font-bold font-headline">Profile & Account</h4>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-outline-variant/10">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-4">Profile Picture</label>
              <ProfilePictureUpload />
            </div>

            <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Data Management</p>
                <p className="text-xs text-on-surface-variant">Export your settings or clear local data.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-surface-container-highest text-xs font-bold hover:bg-surface-container-highest/80 transition-all">
                  Export JSON
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all local data? This will reset your profile.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Voice Trigger Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">keyboard_voice</span>
              <h4 className="text-lg font-bold font-headline">Voice Trigger</h4>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold mb-1">Wake word activation</p>
                <p className="text-sm text-on-surface-variant">Listen for "Hay Kai" to start the assistant instantly.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={voiceTrigger}
                  onChange={(e) => setVoiceTrigger(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-on-surface-variant after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Language & Voice Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">translate</span>
              <h4 className="text-lg font-bold font-headline">Language & Voice</h4>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl space-y-6 border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Your Language</label>
                <div className="relative">
                  <select 
                    value={userLanguage}
                    onChange={(e) => setUserLanguage(e.target.value as Language)}
                    className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Assistant Language</label>
                <div className="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Voice Personality</label>
                <div className="relative">
                  <select 
                    value={voice}
                    onChange={(e) => setVoice(e.target.value as VoicePersonality)}
                    className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm appearance-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Nova">Nova (Bright & Technical - Female)</option>
                    <option value="Lyra">Lyra (Soft & Expressive - Female)</option>
                    <option value="Kai">Kai (Warm & Melodic - Male)</option>
                    <option value="Echo">Echo (Calm & Deep - Male)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Tooltip content="Hear how the assistant sounds" position="right">
                <button 
                  onClick={handlePreview}
                  disabled={isLoadingPreview}
                  className="text-primary text-sm font-semibold flex items-center gap-2 hover:bg-surface-container-highest/40 py-2 px-3 rounded-lg transition-colors -ml-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isLoadingPreview ? 'hourglass_empty' : (isPlaying ? 'stop_circle' : 'play_circle')}
                  </span>
                  {isLoadingPreview ? 'Generating...' : (isPlaying ? 'Stop Preview' : 'Preview Voice Sample')}
                </button>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Privacy & Permissions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">security</span>
              <h4 className="text-lg font-bold font-headline">Privacy & Permissions</h4>
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">mic</span>
                </div>
                <div>
                  <p className="font-medium">Microphone Access</p>
                  <p className="text-xs text-on-surface-variant">Allow Hay Kai to access your microphone for voice tasks.</p>
                </div>
              </div>
              <Tooltip content="Toggle microphone permission" position="left">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-on-surface-variant after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </Tooltip>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">history</span>
                </div>
                <div>
                  <p className="font-medium">Context Learning</p>
                  <p className="text-xs text-on-surface-variant">Save chat history to improve response relevance.</p>
                </div>
              </div>
              <Tooltip content="Toggle history saving" position="left">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-on-surface-variant after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">palette</span>
              <h4 className="text-lg font-bold font-headline">Appearance</h4>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tooltip content="Dark mode (OLED optimized)" position="top" className="w-full">
              <div className="bg-surface-container-highest/60 border border-primary/40 p-4 rounded-xl flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-outline-variant/30 overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary"></div>
                  <span className="material-symbols-outlined text-white">dark_mode</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Dark Mode</p>
                  <p className="text-xs text-on-surface-variant">Recommended for OLED</p>
                </div>
                <span className="material-symbols-outlined text-primary fill">check_circle</span>
              </div>
            </Tooltip>
            <Tooltip content="Light mode (High contrast)" position="top" className="w-full">
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 hover:bg-surface-container-highest transition-colors cursor-pointer group border border-outline-variant/10 w-full">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-outline-variant/10 overflow-hidden">
                  <span className="material-symbols-outlined text-black">light_mode</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Light Mode</p>
                  <p className="text-xs text-on-surface-variant">High contrast clarity</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-colors"></div>
              </div>
            </Tooltip>
          </div>
        </section>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-outline-variant/10">
          <Tooltip content="Revert to factory settings" position="top">
            <button className="px-6 py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors font-semibold text-sm">
              Reset to Default
            </button>
          </Tooltip>
          <Tooltip content="Apply and save all changes" position="top">
            <button className="px-8 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              Save Changes
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
