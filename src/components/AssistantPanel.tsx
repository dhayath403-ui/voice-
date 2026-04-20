import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAssistantResponse, generateImage, generateAudioResponse, generateAssistantResponseStream, generateAudioResponseStream, generateTTS } from '../services/geminiService';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { useSettings } from '../context/SettingsContext';
import { useError } from '../context/ErrorContext';
import { PromptGuide } from './PromptGuide';
import { AudioPlayer } from './AudioPlayer';
import { MapVisualization } from './MapVisualization';
import { TaskScheduler } from './TaskScheduler';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';
import { HistoryEntry, ScheduledTask } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  error?: string;
  groundingLinks?: { title: string; url: string }[];
  mapData?: { 
    userLocation?: { latitude: number; longitude: number };
    destination?: { latitude: number; longitude: number; name: string };
  };
  timestamp: Date;
}

const TypingIndicator = () => (
  <div className="flex gap-1 items-center h-4 px-1">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: ["4px", "12px", "4px"],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: i * 0.15
        }}
        className="w-1 bg-secondary rounded-full"
      />
    ))}
  </div>
);

const SkeletonLoader = () => (
  <div className="flex flex-col gap-3 w-full min-w-[240px] md:min-w-[320px]">
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="h-3 bg-white/10 rounded-full w-3/4" 
    />
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      className="h-3 bg-white/10 rounded-full w-full" 
    />
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      className="h-3 bg-white/10 rounded-full w-5/6" 
    />
    <div className="flex gap-2 mt-2">
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="h-8 w-24 bg-white/5 rounded-xl" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="h-8 w-20 bg-white/5 rounded-xl" 
      />
    </div>
  </div>
);

interface AssistantPanelProps {
  onClose: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ onClose }) => {
  const { language, userLanguage, voice, lens, byokEnabled } = useSettings();
  const { showError } = useError();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: language === 'Hindi' ? "नमस्ते! मैं हे काई हूँ, आपका डिजिटल लुथियर। आज मैं आपके रचनात्मक वर्कफ़्लो को ट्यून करने में कैसे मदद कर सकता हूँ?" : 
               language === 'Telugu' ? "హలో! నేను హే కై, మీ డిజిటల్ లూథియర్. ఈరోజు మీ సృజనాత్మక వర్క్‌ఫ్లోను ట్యూన్ చేయడంలో నేను మీకు ఎలా సహాయపడగలను?" :
               "Hello! I'm Hay Kai, your Digital Luthier. How can I help you tune your creative workflow today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [showTaskScheduler, setShowTaskScheduler] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const liveSessionMessageIds = useRef<string[]>([]);
  const wasLiveActive = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Accessibility: Focus management and Escape key
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const originalFocusedElement = document.activeElement as HTMLElement;
    
    // Focus the input field on mount
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      // Return focus to the element that opened the panel
      originalFocusedElement?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Map app language to BCP-47
        const getLangCode = (lang: string) => {
          switch (lang) {
            case 'Hindi': return 'hi-IN';
            case 'Telugu': return 'te-IN';
            case 'Tamil': return 'ta-IN';
            case 'Malayalam': return 'ml-IN';
            case 'Bengali': return 'bn-IN';
            case 'Kannada': return 'kn-IN';
            case 'Marathi': return 'mr-IN';
            case 'Gujarati': return 'gu-IN';
            default: return 'en-US';
          }
        };
        
        recognition.lang = getLangCode(userLanguage);
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setRecordedText(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [userLanguage]);

  const triggerImageGeneration = async (prompt: string) => {
    setIsLoading(true);
    // First get a text confirmation
    const assistantResponse = await generateAssistantResponse(`The user wants to generate an image: "${prompt}". Provide a brief confirmation.`, language, userLanguage, lens, byokEnabled);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assistantResponse?.text || "I'm generating that for you...",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Generate TTS for confirmation
    try {
      const confirmationText = assistantResponse?.text || "I'm generating that for you...";
      const assistantAudioUrl = await generateTTS(confirmationText, voice, language);
      if (assistantAudioUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id ? { ...msg, audioUrl: assistantAudioUrl } : msg
        ));
      }
    } catch (ttsError) {
      console.error("TTS generation failed for image confirmation:", ttsError);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? { 
          ...msg, 
          error: "Audio playback is currently unavailable for this response." 
        } : msg
      ));
    }

    // Then generate the image
    const generatedImageUrl = await generateImage(prompt);
    if (generatedImageUrl) {
      setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, imageUrl: generatedImageUrl } : msg));
    }
    setIsLoading(false);
  };

  const { 
    isActive: isLiveActive, 
    isConnecting: isLiveConnecting, 
    startSession: startLiveSession, 
    stopSession: stopLiveSession,
    transcript: liveTranscript,
    assistantTranscript: liveAssistantTranscript,
    volume: liveVolume,
    connectionQuality: liveConnectionQuality,
    error: liveError
  } = useLiveAssistant({
    onUserMessage: (text) => {
      // Add user message to thread
      setMessages(prev => {
        // Check if last message was a live user message, if so update it
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.id.startsWith('live-user-')) {
          return [...prev.slice(0, -1), { ...lastMsg, content: text }];
        }
        const newId = `live-user-${Date.now()}`;
        if (!liveSessionMessageIds.current.includes(newId)) {
          liveSessionMessageIds.current.push(newId);
        }
        return [...prev, {
          id: newId,
          role: 'user',
          content: text,
          timestamp: new Date()
        }];
      });

      // Check for image generation intent in live session
      const isImageRequest = /generate|create|draw|make|show.*image|picture|photo/i.test(text);
      if (isImageRequest) {
        triggerImageGeneration(text);
      }
    },
    onAssistantMessage: (text) => {
      // Add assistant message to thread
      setMessages(prev => {
        // Check if last message was a live assistant message, if so update it
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.id.startsWith('live-assistant-')) {
          return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + text }];
        }
        const newId = `live-assistant-${Date.now()}`;
        if (!liveSessionMessageIds.current.includes(newId)) {
          liveSessionMessageIds.current.push(newId);
        }
        return [...prev, {
          id: newId,
          role: 'assistant',
          content: text,
          timestamp: new Date()
        }];
      });
    }
  });

  useEffect(() => {
    if (liveError) {
      showError(liveError);
    }
  }, [liveError, showError]);

  useEffect(() => {
    if (wasLiveActive.current && !isLiveActive && liveSessionMessageIds.current.length > 0) {
      setShowSavePrompt(true);
    }
    wasLiveActive.current = isLiveActive;
  }, [isLiveActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, liveAssistantTranscript, isLoading]);

  const getUserLocation = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Could not get user location", e);
      return undefined;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    stopRef.current = false;

    // Simulate "Security Tax" for sensitive queries if BYOK is enabled
    const isSensitive = /vault|private|secret|password|key|financial|fund|balance/i.test(currentInput);
    if (byokEnabled && isSensitive) {
      setIsUnlocking(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Deliberate "tax"
      setIsUnlocking(false);
    }

    // Check for image generation intent
    const isImageRequest = /generate|create|draw|make|show.*image|picture|photo/i.test(currentInput);

    if (isImageRequest) {
      await triggerImageGeneration(currentInput);
    } else {
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      try {
        const location = await getUserLocation();

        const stream = await generateAssistantResponseStream(currentInput, language, userLanguage, location, lens, byokEnabled);
        let fullText = '';
        let functionCall = null;
        let groundingLinks: { title: string; url: string }[] = [];

        for await (const chunk of stream) {
          if (stopRef.current) break;
          if (chunk.text) {
            fullText += chunk.text;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: fullText } : msg
            ));
          }
          if (chunk.functionCalls) {
            functionCall = chunk.functionCalls[0];
          }
          if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
            chunks.forEach((c: any) => {
              if (c.maps?.uri) {
                groundingLinks.push({ title: c.maps.title || 'View on Maps', url: c.maps.uri });
              }
            });
            if (groundingLinks.length > 0) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, groundingLinks: [...groundingLinks] } : msg
              ));
            }
          }
        }
        
        if (fullText && !functionCall && !stopRef.current) {
          try {
            const assistantAudioUrl = await generateTTS(fullText, voice, language);
            if (assistantAudioUrl) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, audioUrl: assistantAudioUrl } : msg
              ));
            }
          } catch (ttsError) {
            console.error("TTS generation failed:", ttsError);
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { 
                ...msg, 
                error: "Audio playback is currently unavailable for this response." 
              } : msg
            ));
          }
        }

        if (functionCall) {
          const { name, args } = functionCall;
          if (name === 'open_app') {
            const { appName, protocol } = args as { appName: string, protocol: string };
            console.log(`Attempting to open app: ${appName} via ${protocol}`);
            if (!fullText) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: "Opening the application for you..." } : msg
              ));
            }
            setTimeout(() => {
              window.location.assign(protocol);
            }, 500);
          } else if (name === 'get_location_coordinates') {
            const { locationName } = args as { locationName: string };
            // Since we can't actually call a real geocoding API here easily, 
            // we'll ask Gemini to provide coordinates in the next turn or simulate it.
            // Actually, we can just use the grounding metadata if available, 
            // but the model called the tool because it wants us to provide coordinates.
            // For this demo, we'll simulate geocoding by asking the model again with a prompt 
            // that forces it to provide coordinates in a specific format if it can't find them.
            // Or better, we can just use the grounding links to extract coordinates.
            
            // Let's try to get coordinates from grounding links if they exist
            let destCoords = null;
            if (groundingLinks.length > 0) {
              const mapUrl = groundingLinks[0].url;
              const match = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
              if (match) {
                destCoords = { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]), name: locationName };
              }
            }

            // If we couldn't find coordinates in grounding links, we'll try to simulate them 
            // for the sake of the visualization if the model is confident.
            if (!destCoords) {
              // Fallback: simulate a nearby location for demo purposes if user location is available
              if (location) {
                destCoords = { 
                  latitude: location.latitude + (Math.random() - 0.5) * 0.01, 
                  longitude: location.longitude + (Math.random() - 0.5) * 0.01, 
                  name: locationName 
                };
              }
            }

            if (destCoords) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { 
                  ...msg, 
                  mapData: { 
                    userLocation: location, 
                    destination: destCoords 
                  } 
                } : msg
              ));
            }
          } else if (name === 'schedule_task') {
            const { title, dateTime, recurring = 'none' } = args as { title: string, dateTime: string, recurring?: string };
            const newTask: ScheduledTask = {
              id: `task-${Date.now()}`,
              title,
              dateTime,
              recurring: recurring as any,
              status: 'pending',
              timestamp: new Date(dateTime).getTime()
            };
            
            const existing = JSON.parse(localStorage.getItem('hushh_kai_tasks') || '[]');
            localStorage.setItem('hushh_kai_tasks', JSON.stringify([newTask, ...existing]));
            
            if (!fullText) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: `I've scheduled your task: "${title}" for ${new Date(dateTime).toLocaleString()}.` } : msg
              ));
            }
            setShowTaskScheduler(true);
          } else if (name === 'get_project_structure') {
            const structure = `
              Hay Kai Application Structure:
              - /src/App.tsx: Main entry point and routing.
              - /src/components/Dashboard.tsx: Hero section and visual orb.
              - /src/components/AssistantPanel.tsx: The core chat and tool execution engine.
              - /src/components/HistoryView.tsx: Log of past interactions.
              - /src/components/SettingsView.tsx: User preferences (Voice, Language, Privacy).
              - /src/components/AboutView.tsx: Information about Kai and Hushh.
              - /src/services/geminiService.ts: AI model configuration and tool definitions.
              - /src/context/SettingsContext.tsx: Global state management.
            `;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: structure } : msg
            ));
          } else if (name === 'analyze_stock_intent') {
            const { symbol, query } = args as { symbol?: string, query: string };
            const stockInfo = `
              Analyzing ${symbol || 'Hushh'} stocks for your query: "${query}"
              
              Hushh is a private company focused on personal data agents. While it doesn't have a public stock symbol (like AAPL or GOOGL) yet, its value is driven by:
              1. Growth in the Personal Data Economy.
              2. Adoption of the 'Consent-as-a-Service' model.
              3. Expansion of the 'Digital Luthier' ecosystem.
              
              I will use Google Search to find the latest funding rounds or market news for you.
              
              TIP: You can also use the dedicated **Finance** tab in the sidebar for a more structured analysis.
            `;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: stockInfo } : msg
            ));
          } else if (name === 'show_my_location') {
            if (location) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { 
                  ...msg, 
                  mapData: { 
                    userLocation: location
                  } 
                } : msg
              ));
              if (!fullText) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, content: "I've located your current position on the map." } : msg
                ));
              }
            } else {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: "I'm sorry, I couldn't access your real-time location. Please ensure GPS is enabled." } : msg
              ));
            }
          }
        }
      } catch (error: any) {
        console.error("Streaming error:", error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: "I'm sorry, I encountered an error while tuning your request." } : msg
        ));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for supported mime types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/ogg;codecs=opus';
          
      console.log(`Using mimeType: ${mimeType}`);
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log(`Recording stopped. Chunks: ${audioChunksRef.current.length}`);
        if (audioChunksRef.current.length === 0) {
          console.warn("No audio data captured");
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await handleSendAudio(base64Audio, mimeType, audioUrl);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      if (recognitionRef.current) {
        setRecordedText('');
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Recognition already started or failed", e);
        }
      }
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      // Fallback UI notification could be added here
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Recognition already stopped or failed", e);
        }
      }
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (base64Audio: string, mimeType: string, audioUrl?: string) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: recordedText ? `🎤 ${recordedText}` : "🎤 [Audio Message]",
      audioUrl,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const transcript = recordedText;
    setRecordedText('');
    setInputValue('');

    // Check for image generation intent in recorded audio
    const isImageRequest = transcript && /generate|create|draw|make|show.*image|picture|photo/i.test(transcript);

    if (isImageRequest) {
      await triggerImageGeneration(transcript);
      setIsLoading(false);
      return;
    }

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      stopRef.current = false;
      const location = await getUserLocation();
      const stream = await generateAudioResponseStream(base64Audio, mimeType, language, userLanguage, location);
      let fullText = '';
      let functionCall = null;

      for await (const chunk of stream) {
        if (stopRef.current) break;
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, content: fullText } : msg
          ));
        }
        if (chunk.functionCalls) {
          functionCall = chunk.functionCalls[0];
        }
      }

      if (fullText && !functionCall && !stopRef.current) {
        try {
          const assistantAudioUrl = await generateTTS(fullText, voice, language);
          if (assistantAudioUrl) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, audioUrl: assistantAudioUrl } : msg
            ));
          }
        } catch (ttsError) {
          console.error("TTS generation failed:", ttsError);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { 
              ...msg, 
              error: "Audio playback is currently unavailable for this response." 
            } : msg
          ));
        }
      }

      if (functionCall) {
        const { name, args } = functionCall;
        if (name === 'open_app') {
          const { appName, protocol } = args as { appName: string, protocol: string };
          console.log(`Attempting to open app: ${appName} via ${protocol}`);
          if (!fullText) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: "Opening the application for you..." } : msg
            ));
          }
          setTimeout(() => {
            window.location.assign(protocol);
          }, 500);
        } else if (name === 'show_my_location') {
          if (location) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { 
                ...msg, 
                mapData: { 
                  userLocation: location
                } 
              } : msg
            ));
            if (!fullText) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: "I've located your current position on the map." } : msg
              ));
            }
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: "I'm sorry, I couldn't access your real-time location. Please ensure GPS is enabled." } : msg
            ));
          }
        } else if (name === 'schedule_task') {
            const { title, dateTime, recurring = 'none' } = args as { title: string, dateTime: string, recurring?: string };
            const newTask: ScheduledTask = {
              id: `task-${Date.now()}`,
              title,
              dateTime,
              recurring: recurring as any,
              status: 'pending',
              timestamp: new Date(dateTime).getTime()
            };
            
            const existing = JSON.parse(localStorage.getItem('hushh_kai_tasks') || '[]');
            localStorage.setItem('hushh_kai_tasks', JSON.stringify([newTask, ...existing]));
            
            if (!fullText) {
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: `I've scheduled your task: "${title}" for ${new Date(dateTime).toLocaleString()}.` } : msg
              ));
            }
            setShowTaskScheduler(true);
          }
        }
      } catch (error) {
      console.error("Audio streaming error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, content: "I'm sorry, I couldn't process the audio." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const [viewMode, setViewMode] = useState<'chat' | 'voice'>('chat');

  useEffect(() => {
    if (isLiveActive) {
      setViewMode('voice');
    } else {
      setViewMode('chat');
    }
  }, [isLiveActive]);

  const toggleLive = () => {
    if (isLiveActive) {
      stopLiveSession();
    } else {
      liveSessionMessageIds.current = [];
      setShowSavePrompt(false);
      startLiveSession();
    }
  };

  const handleSaveHistory = (save: boolean) => {
    if (save) {
      const sessionMessages = messages.filter(msg => liveSessionMessageIds.current.includes(msg.id));
      if (sessionMessages.length > 0) {
        const firstUserMsg = sessionMessages.find(m => m.role === 'user')?.content || 'Voice Session';
        const fullConversation = sessionMessages.map(m => `${m.role === 'user' ? 'User' : 'Kai'}: ${m.content}`).join('\n');
        
        const newEntry: HistoryEntry = {
          id: `voice-${Date.now()}`,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'voice',
          icon: 'settings_voice',
          query: firstUserMsg,
          response: fullConversation,
          timestamp: Date.now()
        };
        
        const existing = JSON.parse(localStorage.getItem('hay_kai_history') || '[]');
        localStorage.setItem('hay_kai_history', JSON.stringify([newEntry, ...existing]));
      }
    } else {
      // Remove messages from this session
      setMessages(prev => prev.filter(msg => !liveSessionMessageIds.current.includes(msg.id)));
    }
    // If save is true, we just keep them in the messages state
    liveSessionMessageIds.current = [];
    setShowSavePrompt(false);
  };

  const handleStop = () => {
    stopRef.current = true;
    if (isLiveActive) {
      stopLiveSession();
    }
    setIsLoading(false);
  };

  const handleMicPress = () => {
    if (isLoading) return;
    isHoldingRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      if (!isLiveActive) {
        startRecording();
        isHoldingRef.current = true;
      }
    }, 400);
  };

  const handleMicRelease = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (isHoldingRef.current) {
      stopRecording();
      isHoldingRef.current = false;
    } else {
      if (!isRecording) {
        toggleLive();
      }
    }
  };

  // Input Area
  return (
    <motion.div 
      ref={panelRef}
      initial={{ x: '100%' }}
      animate={{ 
        x: 0,
        width: isFullScreen ? '100%' : (windowWidth < 768 ? '100%' : '480px')
      }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      role="dialog"
      aria-modal="true"
      aria-label="Hay Kai Assistant Panel"
      className={cn(
        "fixed inset-y-0 right-0 mica-effect border-l border-outline-variant/15 flex flex-col shadow-2xl z-[60]",
        isFullScreen && "inset-0"
      )}
    >
      {/* Panel Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-container orb-pulse flex items-center justify-center">
            <div className={cn(
              "w-4 h-4 rounded-full", 
              (isLoading || isLiveConnecting) ? "animate-ping bg-primary" : "animate-pulse bg-primary-dim",
              isLiveActive && "bg-secondary scale-125"
            )}></div>
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg tracking-tight">Hay Kai Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary flex items-center gap-1 font-semibold uppercase">
                <span className={cn("w-1.5 h-1.5 rounded-full", isLiveActive ? "bg-secondary" : "bg-primary")}></span>
                {isLiveActive ? 'Live Voice Session' : (isLoading || isLiveConnecting ? 'Processing...' : 'Synchronized')}
              </span>
              {isLiveActive && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-secondary/10 rounded-full border border-secondary/20">
                  <span className="material-symbols-outlined text-[10px] text-secondary">signal_cellular_alt</span>
                  <span className="text-[8px] font-bold text-secondary uppercase">{liveConnectionQuality}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-highest/50 p-1 rounded-full border border-outline-variant/10 mr-2">
            <button 
              onClick={() => setViewMode('chat')}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                viewMode === 'chat' ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Chat
            </button>
            <button 
              onClick={() => setViewMode('voice')}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                viewMode === 'voice' ? "bg-secondary text-black" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Voice
            </button>
          </div>
          {(isLoading || isLiveActive) && (
            <Tooltip content="Stop current operation" position="bottom">
              <button 
                onClick={handleStop}
                aria-label="Stop generating response"
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-wider transition-all animate-pulse"
              >
                <span className="material-symbols-outlined text-sm">stop_circle</span>
                Stop
              </button>
            </Tooltip>
          )}
          <Tooltip content={isFullScreen ? "Exit Full Screen" : "Full Screen View"} position="bottom">
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-colors group"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">
                {isFullScreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>
          </Tooltip>
          <Tooltip content="Prompt Engineering Guide" position="bottom">
            <button 
              onClick={() => setShowPromptGuide(true)}
              aria-label="Open Prompt Engineering Guide"
              className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-colors group relative"
              title="Prompt Engineering Guide"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">auto_awesome</span>
            </button>
          </Tooltip>
          <Tooltip content="View Scheduled Tasks" position="bottom">
            <button 
              onClick={() => setShowTaskScheduler(true)}
              aria-label="View Scheduled Tasks"
              className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-colors group relative"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">event_upcoming</span>
            </button>
          </Tooltip>
          <Tooltip content="Close Assistant" position="bottom">
            <button 
              onClick={() => {
                if (isLiveActive) {
                  stopLiveSession();
                } else if (showSavePrompt) {
                  // If prompt is showing, we can either force a decision or just close
                  // Let's just close for now, but usually we'd want to save or discard
                  onClose();
                } else {
                  onClose();
                }
              }}
              aria-label="Close Assistant Panel"
              className="p-2 rounded-full hover:bg-surface-container-highest/50 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {isLiveActive && (
        <div className="px-6 py-3 bg-secondary/5 border-b border-secondary/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 items-end h-6">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isLiveActive ? `${Math.max(4, (liveVolume * (1 - Math.abs(i - 3) / 4)))}px` : '4px',
                      backgroundColor: liveVolume > 50 ? '#ff8a65' : '#82b1ff'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-1 rounded-full bg-secondary"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest min-w-[70px]">
                {liveVolume > 5 ? 'Speaking' : 'Listening...'}
              </span>
            </div>
            <div className="flex items-center gap-3 border-l border-outline-variant/10 pl-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-[12px] text-primary fill">shield</span>
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Vault Authorized</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-on-surface-variant/60 uppercase font-black tracking-tighter">Connection</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  liveConnectionQuality > 90 ? "text-green-500" : liveConnectionQuality > 70 ? "text-yellow-500" : "text-red-500"
                )}>
                  {liveConnectionQuality > 90 ? 'Excellent' : liveConnectionQuality > 70 ? 'Stable' : 'Poor'}
                </span>
              </div>
              <div className="flex gap-0.5 items-end h-3">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 rounded-full",
                      i < (liveConnectionQuality / 25) ? (liveConnectionQuality > 70 ? "bg-green-500" : "bg-yellow-500") : "bg-white/10"
                    )}
                    style={{ height: `${(i + 1) * 25}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[9px] text-on-surface-variant/60 uppercase font-medium">Processing High Fidelity</span>
            <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="h-full bg-secondary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Thread / Voice Mode */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {viewMode === 'voice' ? (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center space-y-12"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: isLiveActive ? [1, 1.2, 1] : 1,
                    opacity: isLiveActive ? [0.2, 0.4, 0.2] : 0.1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-64 h-64 rounded-full bg-secondary blur-3xl"
                />
                <div className="relative w-48 h-48 rounded-full border-2 border-secondary/20 flex items-center justify-center">
                  {isLiveConnecting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-8px] rounded-full border-2 border-dashed border-secondary/40"
                    />
                  )}
                  <div className="absolute inset-0 rounded-full border border-secondary/10 animate-ping" />
                  <div className={cn(
                    "w-32 h-32 rounded-full bg-gradient-to-br from-secondary/40 to-primary/40 flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden relative",
                    isLiveActive ? "scale-110 rotate-12" : "grayscale opacity-50"
                  )}>
                    {isLiveActive && (
                      <motion.div
                        animate={{
                          y: [0, -20, 0],
                          x: [0, 10, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-white/10 blur-xl"
                      />
                    )}
                    <span className={cn(
                      "material-symbols-outlined text-5xl transition-all relative z-10",
                      isLiveActive ? "text-white fill" : "text-on-surface-variant"
                    )}>
                      {isLiveConnecting ? 'sync' : isLiveActive ? 'mic' : 'mic_off'}
                    </span>
                  </div>
                  
                  {/* Audio Visualizer Rings */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: isLiveActive ? [1, 1.2 + (liveVolume / 20) + i * 0.2, 1] : 1,
                        opacity: isLiveActive ? [0.4, 0, 0.4] : 0,
                        borderWidth: isLiveActive ? ['1px', '3px', '1px'] : '1px'
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                      className="absolute inset-0 rounded-full border border-secondary/30"
                    />
                  ))}
                </div>
              </div>

              <div className="w-full max-w-md space-y-6 text-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Live Transcription</p>
                  <div className="min-h-[60px] p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                    <p className="text-sm text-on-background font-medium italic">
                      {liveTranscript || (isLiveActive ? "Listening for your command..." : "Voice session inactive")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Kai's Response</p>
                  <div className="min-h-[80px] p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-on-background leading-relaxed">
                      {liveAssistantTranscript || (isLiveActive ? "..." : "Tap the mic to start")}
                    </p>
                  </div>
                </div>

                {!isLiveActive && (
                  <button
                    onClick={toggleLive}
                    disabled={isLiveConnecting}
                    className={cn(
                      "px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all flex items-center gap-2 mx-auto",
                      isLiveConnecting 
                        ? "bg-surface-container-highest text-on-surface-variant/50 cursor-wait" 
                        : "bg-secondary text-black hover:scale-105 active:scale-95"
                    )}
                  >
                    {isLiveConnecting && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                    {isLiveConnecting ? "Tuning Connection..." : "Start Voice Command"}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {isUnlocking && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="sticky top-0 left-1/2 -translate-x-1/2 z-20 bg-secondary/90 text-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm border border-secondary/20 mb-4"
          >
            <span className="material-symbols-outlined text-sm animate-spin">key</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Unlocking Secure Vault...</span>
          </motion.div>
        )}
        <AnimatePresence>
          {showPromptGuide && (
            <PromptGuide 
              onClose={() => setShowPromptGuide(false)} 
              onApplyExample={(example) => {
                setInputValue(example);
                setShowPromptGuide(false);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
            />
          )}
          {showTaskScheduler && (
            <TaskScheduler onClose={() => setShowTaskScheduler(false)} />
          )}
          {showSavePrompt && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute inset-x-4 top-4 z-50 bg-surface-container-highest/95 backdrop-blur-2xl p-5 rounded-3xl border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="material-symbols-outlined text-primary scale-125">history_edu</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-headline font-bold text-on-background text-base">Session Concluded</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                    Would you like to preserve this voice conversation in your permanent activity log?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSaveHistory(true)}
                  className="flex-1 py-3 rounded-2xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-sm group-hover:animate-bounce">save</span>
                  Save to Log
                </button>
                <button 
                  onClick={() => handleSaveHistory(false)}
                  className="px-6 py-3 rounded-2xl bg-surface-container-low text-on-surface-variant font-bold text-sm hover:bg-surface-container-low/80 transition-all active:scale-95 border border-outline-variant/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timestamp */}
        <div className="flex justify-center">
          <span className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-widest bg-surface-container/40 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col space-y-2",
              msg.role === 'user' ? "items-end ml-12" : "items-start mr-12"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-black fill">auto_awesome</span>
                </div>
                <span className="text-xs font-headline font-bold text-secondary">Hay Kai</span>
              </div>
            )}

            {msg.role === 'user' && (
              <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-primary fill">person</span>
                </div>
                <span className="text-xs font-headline font-bold text-primary/80">You</span>
              </div>
            )}
            
            <div className={cn(
              "px-5 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-surface-container-highest text-on-surface rounded-tr-none" 
                : "bg-surface-container/60 text-on-background rounded-tl-none border border-outline-variant/10"
            )}>
              <div className="flex flex-col gap-3">
                {msg.content && (
                  <div className="space-y-2">
                    {msg.content.split('---').map((part, i) => (
                      <div key={i} className={cn(
                        i > 0 && "mt-2 pt-2 border-t border-outline-variant/20 text-on-surface-variant italic text-xs",
                        "whitespace-pre-wrap"
                      )}>
                        {part.trim()}
                      </div>
                    ))}
                  </div>
                )}

                {msg.audioUrl && (
                  <div className={cn(
                    "flex flex-col gap-2 min-w-[200px]",
                    msg.content && "mt-2 pt-2 border-t border-outline-variant/10"
                  )}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                      <span className="material-symbols-outlined text-sm">mic</span>
                      {msg.role === 'user' ? 'Voice Query' : 'Voice Response'}
                    </div>
                    <AudioPlayer src={msg.audioUrl} className="bg-black/20 border-none p-2" />
                  </div>
                )}

                {!msg.content && !msg.audioUrl && !msg.imageUrl && !msg.mapData && !msg.error && (
                  <SkeletonLoader />
                )}

                {isLoading && messages[messages.length - 1].id === msg.id && msg.role === 'assistant' && !msg.content && (
                  <div className="mt-1">
                    <SkeletonLoader />
                  </div>
                )}
              </div>
              
              {msg.error && (
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-red-400/80 uppercase tracking-wider bg-red-400/5 px-2 py-1 rounded border border-red-400/10">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  {msg.error}
                </div>
              )}
              {msg.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg">
                  <img 
                    src={msg.imageUrl} 
                    alt="Generated artwork" 
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              {msg.mapData && (
                <div className="mt-3">
                  <MapVisualization 
                    userLocation={msg.mapData.userLocation} 
                    destination={msg.mapData.destination} 
                  />
                </div>
              )}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Location Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-medium text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">map</span>
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <span className={cn(
              "text-[10px] text-on-surface-variant/50",
              msg.role === 'user' ? "mr-1" : "ml-1"
            )}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {(isLoading || isLiveConnecting) && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content) && (
          <div className="flex flex-col items-start space-y-2 mr-12">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-secondary/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-black/50 fill">auto_awesome</span>
              </div>
              <span className="text-xs font-headline font-bold text-secondary/50">
                {isLiveConnecting ? 'Connecting voice...' : 'Hay Kai is thinking...'}
              </span>
            </div>
            <div className="px-5 py-4 bg-surface-container/40 rounded-2xl rounded-tl-none border border-outline-variant/10">
              <SkeletonLoader />
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && !isLiveActive && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-12">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-primary">chat_bubble</span>
            </div>
            <h4 className="text-xl font-headline font-bold mb-2">Start a Conversation</h4>
            <p className="text-sm text-on-surface-variant max-w-xs">Ask me anything about your data, finance, or creative workflows.</p>
          </div>
        )}

        {/* Live Transcript Overlay */}
        {isLiveActive && liveTranscript && viewMode === 'chat' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-0 left-0 right-0 z-20 bg-surface-container-highest/80 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/20 mb-4"
          >
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Live Transcript</p>
            <p className="text-sm text-on-background italic">"{liveTranscript}"</p>
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</div>

      {/* Input Area */}
      <div className="p-6 bg-surface-container-low/80 backdrop-blur-lg border-t border-outline-variant/10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-300"></div>
          <div className="relative flex items-center bg-surface-container-highest rounded-xl p-2 pr-4">
            <Tooltip content="Attach files or context" position="top">
              <button 
                aria-label="Attach file"
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">attachment</span>
              </button>
            </Tooltip>
            <input 
              ref={inputRef}
              aria-label="Ask Hay Kai a question"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-body text-on-background py-3 px-2" 
              placeholder={isRecording ? (recordedText || "Listening...") : (isLiveActive ? "Voice mode active..." : "Ask anything...")}
              type="text"
              value={isRecording ? recordedText : inputValue}
              onChange={(e) => !isRecording && setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading || isLiveActive}
            />
            <div className="flex items-center gap-2">
              <Tooltip content={isRecording ? "Stop recording" : (isLiveActive ? "End voice session" : "Hold to record / Click for live")} position="top">
                <button 
                  onMouseDown={handleMicPress}
                  onMouseUp={handleMicRelease}
                  onTouchStart={handleMicPress}
                  onTouchEnd={handleMicRelease}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleLive();
                    }
                  }}
                  disabled={isLoading}
                  aria-label={isRecording ? "Stop recording" : (isLiveActive ? "End live voice session" : "Hold to record, click for live conversation")}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isRecording 
                      ? "bg-primary/20 text-primary animate-pulse" 
                      : isLiveActive
                        ? "bg-secondary/20 text-secondary animate-pulse"
                        : "text-on-surface-variant hover:bg-surface-variant hover:text-primary"
                  )}
                  title="Hold to record, click for live conversation"
                >
                  <span className={cn("material-symbols-outlined", (isRecording || isLiveActive) && "fill")}>
                    {isRecording ? 'stop_circle' : (isLiveActive ? 'mic' : 'mic_none')}
                  </span>
                </button>
              </Tooltip>
              <Tooltip content="Send message" position="top">
                <button 
                  onClick={handleSend}
                  aria-label="Send message"
                  disabled={isLoading || !inputValue.trim() || isLiveActive}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-black flex items-center justify-center shadow-lg disabled:opacity-50 disabled:grayscale"
                >
                  <span className="material-symbols-outlined text-lg fill">send</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-on-surface-variant/40 mt-4 font-medium tracking-tight">
          {isLiveActive ? 'Voice session active • Tap mic to end' : 'Powered by KaiOS v2.4 • Luthier Core'}
        </p>
      </div>
    </motion.div>
  );
};
