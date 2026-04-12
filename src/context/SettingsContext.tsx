import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'English' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Tamil' | 'Bengali';
export type VoicePersonality = 'Kai' | 'Nova' | 'Echo' | 'Lyra';

interface SettingsContextType {
  language: Language;
  userLanguage: Language;
  voice: VoicePersonality;
  voiceTrigger: boolean;
  profilePicture: string | null;
  displayName: string;
  email: string;
  setLanguage: (lang: Language) => void;
  setUserLanguage: (lang: Language) => void;
  setVoice: (voice: VoicePersonality) => void;
  setVoiceTrigger: (enabled: boolean) => void;
  setProfilePicture: (pic: string | null) => void;
  setDisplayName: (name: string) => void;
  setEmail: (email: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('hay-kai-language');
    return (saved as Language) || 'English';
  });

  const [userLanguage, setUserLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('hay-kai-user-language');
    return (saved as Language) || 'English';
  });
  
  const [voice, setVoice] = useState<VoicePersonality>(() => {
    const saved = localStorage.getItem('hay-kai-voice');
    return (saved as VoicePersonality) || 'Nova';
  });

  const [voiceTrigger, setVoiceTrigger] = useState<boolean>(() => {
    const saved = localStorage.getItem('hay-kai-voice-trigger');
    return saved === null ? true : saved === 'true';
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    return localStorage.getItem('hay-kai-profile-picture');
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('hay-kai-display-name') || 'Hay Kai User';
  });

  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('hay-kai-email') || 'dhayath403@gmail.com';
  });

  useEffect(() => {
    localStorage.setItem('hay-kai-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('hay-kai-user-language', userLanguage);
  }, [userLanguage]);

  useEffect(() => {
    localStorage.setItem('hay-kai-voice', voice);
  }, [voice]);

  useEffect(() => {
    localStorage.setItem('hay-kai-voice-trigger', String(voiceTrigger));
  }, [voiceTrigger]);

  useEffect(() => {
    if (profilePicture) {
      localStorage.setItem('hay-kai-profile-picture', profilePicture);
    } else {
      localStorage.removeItem('hay-kai-profile-picture');
    }
  }, [profilePicture]);

  useEffect(() => {
    localStorage.setItem('hay-kai-display-name', displayName);
  }, [displayName]);

  useEffect(() => {
    localStorage.setItem('hay-kai-email', email);
  }, [email]);

  return (
    <SettingsContext.Provider value={{ 
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
      setProfilePicture,
      setDisplayName,
      setEmail
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
