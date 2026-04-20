import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { useError } from '../context/ErrorContext';
import { cn } from '../lib/utils';

export const VoiceAssistant: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showError } = useError();
  const { 
    isActive, 
    isConnecting, 
    startSession, 
    stopSession, 
    transcript, 
    assistantTranscript,
    isProcessing,
    volume,
    error: liveError
  } = useLiveAssistant();

  useEffect(() => {
    if (liveError) {
      showError(liveError);
    }
  }, [liveError, showError]);

  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 right-0 w-full md:w-[400px] mica-effect border border-primary/20 rounded-3xl p-6 shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-primary animate-pulse" : "bg-gray-600"
                )}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {isActive ? "Live Session" : isConnecting ? "Connecting..." : "Voice Standby"}
                </span>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 min-h-[200px] flex flex-col justify-center">
              {/* Reactive Orb */}
              <div className="flex justify-center relative py-12">
                {/* Background Glows */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="glow"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: isProcessing ? 0.8 : 0.4,
                        scale: isProcessing ? 1.2 : 1 + (volume / 200)
                      }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "w-48 h-48 rounded-full blur-3xl absolute",
                        isProcessing 
                          ? "bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" 
                          : "bg-primary/30"
                      )}
                    />
                  )}
                </AnimatePresence>

                {/* Main Orb */}
                <motion.div
                  animate={{
                    rotate: isProcessing ? 360 : 0,
                    scale: isActive ? (isProcessing ? 1.1 : 1 + (volume / 100)) : 1,
                    borderColor: isProcessing ? 'var(--secondary)' : (isActive ? 'var(--primary)' : 'rgba(107, 114, 128, 0.2)'),
                  }}
                  transition={{
                    rotate: { duration: isProcessing ? 2 : 10, repeat: Infinity, ease: "linear" },
                    scale: { type: "spring", stiffness: 300, damping: 20 },
                    borderColor: { duration: 0.3 }
                  }}
                  className={cn(
                    "w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-all duration-500 bg-black/40 backdrop-blur-sm",
                    !isActive && "border-dashed"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex gap-1"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 24, 8] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1.5 rounded-full bg-secondary"
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mic"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <Mic className={cn(
                          "w-10 h-10 transition-colors",
                          isActive ? "text-primary" : "text-gray-600"
                        )} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Spinning ring for processing */}
                  {isProcessing && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-1 border-2 border-t-secondary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                    />
                  )}
                </motion.div>
              </div>

              {/* Status Indicator */}
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.3em] h-4 transition-all",
                  isProcessing ? "text-secondary" : (isActive ? "text-primary" : "text-gray-500")
                )}>
                  {isProcessing ? "Processing Data..." : (isActive ? "Listening" : "System Idle")}
                </p>
              </div>

              {/* Transcripts */}
              <div className="space-y-4 max-h-[150px] overflow-y-auto custom-scrollbar px-2">
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-right"
                  >
                    <p className="text-xs text-gray-500 mb-1">You</p>
                    <p className="text-sm text-white font-medium bg-white/5 inline-block px-3 py-2 rounded-2xl rounded-tr-none">
                      {transcript}
                    </p>
                  </motion.div>
                )}
                {assistantTranscript && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-left"
                  >
                    <p className="text-xs text-primary mb-1">Hushh Kai</p>
                    <p className="text-sm text-gray-300 leading-relaxed bg-primary/5 inline-block px-3 py-2 rounded-2xl rounded-tl-none border border-primary/10">
                      {assistantTranscript}
                    </p>
                  </motion.div>
                )}
                {!transcript && !assistantTranscript && isActive && (
                  <p className="text-center text-xs text-gray-500 italic animate-pulse">
                    Listening for your voice...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={toggleSession}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl",
                  isActive 
                    ? "bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500/30" 
                    : "bg-primary text-black hover:scale-105"
                )}
              >
                {isActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border-2",
          isActive 
            ? "bg-primary border-primary text-black animate-pulse" 
            : "bg-surface-container-highest border-outline-variant/20 text-white hover:border-primary/50"
        )}
      >
        {isActive ? <Volume2 className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};
