import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'English' | 'Hindi' | 'Telugu' | 'Malayalam' | 'Tamil' | 'Bengali';
export type VoicePersonality = 'Kai' | 'Nova' | 'Echo' | 'Lyra';
export type InvestmentLens = 'Growth' | 'Balanced' | 'Defensive';
export type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  userLanguage: Language;
  voice: VoicePersonality;
  lens: InvestmentLens;
  theme: Theme;
  byokEnabled: boolean;
  voiceTrigger: boolean;
  profilePicture: string | null;
  displayName: string;
  email: string;
  faceLockEnabled: boolean;
  faceRegistered: boolean;
  faceDescriptor: string | null;
  isLocked: boolean;
  setLanguage: (lang: Language) => void;
  setUserLanguage: (lang: Language) => void;
  setVoice: (voice: VoicePersonality) => void;
  setLens: (lens: InvestmentLens) => void;
  setTheme: (theme: Theme) => void;
  setByokEnabled: (enabled: boolean) => void;
  setVoiceTrigger: (enabled: boolean) => void;
  setProfilePicture: (pic: string | null) => void;
  setDisplayName: (name: string) => void;
  setEmail: (email: string) => void;
  setFaceLockEnabled: (enabled: boolean) => void;
  setFaceRegistered: (registered: boolean) => void;
  setFaceDescriptor: (descriptor: string | null) => void;
  setIsLocked: (locked: boolean) => void;
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

  const [lens, setLens] = useState<InvestmentLens>(() => {
    const saved = localStorage.getItem('hay-kai-lens');
    return (saved as InvestmentLens) || 'Balanced';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('hay-kai-theme');
    return (saved as Theme) || 'dark';
  });

  const [byokEnabled, setByokEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('hay-kai-byok-enabled');
    return saved === 'true';
  });

  const [voiceTrigger, setVoiceTrigger] = useState<boolean>(() => {
    const saved = localStorage.getItem('hay-kai-voice-trigger');
    return saved === null ? true : saved === 'true';
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    return localStorage.getItem('hay-kai-profile-picture');
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('hay-kai-display-name') || 'Hushh Kai User';
  });

  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('hay-kai-email') || 'dhayath403@gmail.com';
  });

  const [faceLockEnabled, setFaceLockEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('hay-kai-face-lock');
    return saved === 'true';
  });

  const [faceRegistered, setFaceRegistered] = useState<boolean>(() => {
    const saved = localStorage.getItem('hay-kai-face-registered');
    return saved === 'true';
  });

  const [faceDescriptor, setFaceDescriptor] = useState<string | null>(() => {
    return localStorage.getItem('hay-kai-face-descriptor');
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

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
    localStorage.setItem('hay-kai-lens', lens);
  }, [lens]);

  useEffect(() => {
    localStorage.setItem('hay-kai-theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hay-kai-byok-enabled', String(byokEnabled));
  }, [byokEnabled]);

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

  useEffect(() => {
    localStorage.setItem('hay-kai-face-lock', String(faceLockEnabled));
  }, [faceLockEnabled]);

  useEffect(() => {
    localStorage.setItem('hay-kai-face-registered', String(faceRegistered));
  }, [faceRegistered]);

  useEffect(() => {
    if (faceDescriptor) {
      localStorage.setItem('hay-kai-face-descriptor', faceDescriptor);
    } else {
      localStorage.removeItem('hay-kai-face-descriptor');
    }
  }, [faceDescriptor]);

  return (
    <SettingsContext.Provider value={{ 
      language, 
      userLanguage,
      voice, 
      lens,
      theme,
      byokEnabled,
      voiceTrigger, 
      profilePicture,
      displayName,
      email,
      faceLockEnabled,
      faceRegistered,
      faceDescriptor,
      isLocked,
      setLanguage, 
      setUserLanguage,
      setVoice, 
      setLens,
      setTheme,
      setByokEnabled,
      setVoiceTrigger,
      setProfilePicture,
      setDisplayName,
      setEmail,
      setFaceLockEnabled,
      setFaceRegistered,
      setFaceDescriptor,
      setIsLocked
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
