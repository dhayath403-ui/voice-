import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { useSettings } from '../context/SettingsContext';

const openAppTool: FunctionDeclaration = {
  name: "open_app",
  description: "Opens a local application on the user's desktop using custom protocol handlers (e.g., whatsapp://, spotify://).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: {
        type: Type.STRING,
        description: "The name of the application to open (e.g., 'whatsapp', 'spotify', 'zoom', 'slack').",
      },
      protocol: {
        type: Type.STRING,
        description: "The custom URI protocol for the application (e.g., 'whatsapp://', 'spotify://').",
      }
    },
    required: ["appName", "protocol"],
  },
};

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // @ts-ignore
  return import.meta.env?.VITE_GEMINI_API_KEY || "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export interface LiveAssistantCallbacks {
  onUserMessage?: (text: string) => void;
  onAssistantMessage?: (text: string) => void;
  onSessionEnd?: () => void;
}

export const useLiveAssistant = (callbacks?: LiveAssistantCallbacks) => {
  const { language, userLanguage, voice } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantTranscript, setAssistantTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<number>(98); // 0-100
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setConnectionQuality(prev => {
          const change = Math.floor(Math.random() * 5) - 2;
          return Math.max(85, Math.min(100, prev + change));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  // Use refs for callbacks to avoid dependency issues in startSession
  const onUserMessageRef = useRef(callbacks?.onUserMessage);
  const onAssistantMessageRef = useRef(callbacks?.onAssistantMessage);
  const onSessionEndRef = useRef(callbacks?.onSessionEnd);

  useEffect(() => {
    onUserMessageRef.current = callbacks?.onUserMessage;
    onAssistantMessageRef.current = callbacks?.onAssistantMessage;
    onSessionEndRef.current = callbacks?.onSessionEnd;
  }, [callbacks]);

  const stopSession = useCallback(() => {
    console.log("Stopping voice session...");
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    const wasActive = isActive;
    setIsActive(false);
    setIsConnecting(false);
    
    if (wasActive) {
      onSessionEndRef.current?.();
    }
  }, [isActive]);

  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || isPlayingRef.current) {
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    // Gemini output is 24000Hz
    const buffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextInQueue();
    };
    source.start();
  }, []);

  const startSession = useCallback(async () => {
    if (isActive || isConnecting) return;
    
    console.log("Starting voice session...");
    setIsConnecting(true);
    setTranscript("");
    setAssistantTranscript("");
    
    try {
      const currentApiKey = getApiKey();
      if (!currentApiKey) {
        throw new Error("Gemini API Key is missing");
      }
      const aiInstance = new GoogleGenAI({ apiKey: currentApiKey });

      // Map voice personality to Gemini voices
      const getGeminiVoice = (personality: string) => {
        switch (personality) {
          case 'Kai': return 'Puck';
          case 'Nova': return 'Zephyr';
          case 'Echo': return 'Charon';
          case 'Lyra': return 'Kore';
          default: return 'Zephyr';
        }
      };

      const translationInstruction = userLanguage !== language 
        ? `The user's preferred language is ${userLanguage}, but your response language is ${language}. 
           Please provide your response in ${language}. 
           Additionally, provide a translation of your response back to ${userLanguage} by appending it after a '---' separator.`
        : "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Try to force 16000Hz for input compatibility
      let audioContext: AudioContext;
      try {
        audioContext = new AudioContext({ sampleRate: 16000 });
      } catch (e) {
        console.warn("Could not create AudioContext with 16000Hz, falling back to default");
        audioContext = new AudioContext();
      }
      await audioContext.resume();
      audioContextRef.current = audioContext;
      
      console.log("AudioContext sample rate:", audioContext.sampleRate);
      console.log("AudioContext state:", audioContext.state);

      const sessionPromise = aiInstance.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: getGeminiVoice(voice) } },
          },
          systemInstruction: `You are Hushh Kai, your 'Personal Data Agent'. You are a sophisticated AI assistant powered by Hushh for creative workflows and data sovereignty. Your tone is professional, precise, and human-centered. You help users manage their personal data, optimize workflows, and amplify creative intent. Keep responses concise and insightful. 
          
          You have deep knowledge of the 'Hushh Evergreen Alpha Aloha Fund A'. 
          - Mission: Compound wealth over decades by owning the world's 27 highest free cash flow generators.
          - CIO: Manish Sainani (former GM at Google, Microsoft, Splunk).
          - Three Engines: Alpha (Concentrated long-only), Aloha (Systematic options income), and Capital Efficiency (Leverage on AAAA collateral).
          - Top Holdings (Aces): NVDA ($175B FCF), AAPL ($140B), MSFT ($130B), GOOGL ($125B), BRK.B ($120B), AMZN ($110B).
          - Five Iron Rules: Earnings Blackout, VIX Stand-Down (>40), Reserve Limit (≤80%), No Naked Options, Premium Reinvestment.
          - Performance: $100M projected to $14.6B over 25 years using all three engines.
          
          If the user says 'Hushh Kai', respond with 'I'm here'.
          
          IMPORTANT: You must respond in ${language}. If the user speaks to you in a different language, you should still respond in ${language} unless they explicitly ask you to switch.
          
          If the user provides a URL and asks questions about it, use the 'urlContext' tool to access and analyze the content of that URL.
          
          If the user asks for real-time information, news, or sports updates, use the 'googleSearch' tool to find the most current information.
          
          ${translationInstruction}`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [openAppTool] }, { urlContext: {} }, { googleSearch: {} }],
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visual feedback
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(100, Math.round(rms * 500)));

              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
              }
              
              const uint8 = new Uint8Array(pcmData.buffer);
              let binary = '';
              for (let i = 0; i < uint8.length; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              const base64Data = btoa(binary);
              
              sessionPromise.then((session) => {
                if (session) {
                  session.sendRealtimeInput({
                    audio: { 
                      data: base64Data, 
                      mimeType: `audio/pcm;rate=${audioContext.sampleRate}` 
                    }
                  });
                }
              });
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
          },
          onmessage: async (message: any) => {
            console.log("Received message from Live API:", message.serverContent ? "content" : "other");
            
            // Handle tool calls
            if (message.toolCall) {
              const { functionCalls } = message.toolCall;
              if (functionCalls) {
                for (const call of functionCalls) {
                  if (call.name === 'open_app') {
                    const { appName, protocol } = call.args as { appName: string, protocol: string };
                    console.log(`Live API tool call: Opening ${appName} via ${protocol}`);
                    window.location.assign(protocol);
                    
                    // Send response back to session
                    sessionPromise.then(session => {
                      if (session) {
                        session.sendToolResponse({
                          functionResponses: [{
                            id: call.id,
                            name: call.name,
                            response: { result: `Successfully triggered protocol for ${appName}` }
                          }]
                        });
                      }
                    });
                  }
                }
              }
            }

            // Handle audio output
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  audioQueueRef.current.push(pcmData);
                  playNextInQueue();
                }
              }
            }
            
            // Handle interruption
            if (message.serverContent?.interrupted) {
              console.log("Assistant interrupted");
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }

            // Handle transcriptions
            if (message.serverContent?.userContent?.parts?.[0]?.text) {
              const text = message.serverContent.userContent.parts[0].text;
              setTranscript(text);
              onUserMessageRef.current?.(text);
              // Clear assistant transcript when user starts talking
              setAssistantTranscript("");
            }
            
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              const text = message.serverContent.modelTurn.parts[0].text;
              setAssistantTranscript(prev => prev + text);
              // We'll notify the assistant message when the session ends or a new user turn starts
              // or we can just notify the chunks. 
              // For now, let's notify the chunks to show progress.
              onAssistantMessageRef.current?.(text);
            }

            if (message.inputAudioTranscription?.text) {
              const text = message.inputAudioTranscription.text;
              setTranscript(text);
              onUserMessageRef.current?.(text);
              setAssistantTranscript("");
            }
            if (message.outputAudioTranscription?.text) {
              const text = message.outputAudioTranscription.text;
              setAssistantTranscript(prev => prev + text);
              onAssistantMessageRef.current?.(text);
            }
          },
          onclose: () => {
            console.log("Live session closed by server");
            stopSession();
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            stopSession();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start voice session:", error);
      setIsConnecting(false);
      setIsActive(false);
      stopSession();
    }
  }, [isActive, isConnecting, stopSession, playNextInQueue]);

  return {
    isActive,
    isConnecting,
    startSession,
    stopSession,
    transcript,
    assistantTranscript,
    volume,
    connectionQuality
  };
};
