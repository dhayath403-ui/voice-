import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

export const FaceLockScreen: React.FC = () => {
  const { setIsLocked, displayName, profilePicture } = useSettings();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScan = async () => {
    setStatus('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate face detection processing
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          unlock();
        }, 1500);
      }, 3000);
      
    } catch (err) {
      console.error("Camera access failed:", err);
      setStatus('error');
      setErrorMessage("Camera access denied or not available.");
    }
  };

  const unlock = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsLocked(false);
  };

  useEffect(() => {
    // Auto-start scan on mount
    startScan();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Profile Info */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-surface-container-highest mx-auto mb-4 border border-outline-variant/20 overflow-hidden shadow-xl">
            {profilePicture ? (
              <img src={profilePicture} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <span className="material-symbols-outlined text-4xl text-primary">person</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black font-headline tracking-tight text-white">
            {displayName || 'Hushh Kai User'}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">Locked for your privacy</p>
        </motion.div>

        {/* Camera / Scan Area */}
        <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2 border-outline-variant/30 bg-surface-container-low shadow-2xl">
          {status === 'scanning' || status === 'success' ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                status === 'success' ? "grayscale-0 scale-105" : "grayscale-[0.5]"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">face</span>
            </div>
          )}

          {/* Scanning Overlay */}
          <AnimatePresence>
            {status === 'scanning' && (
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(53,21,216,0.8)] z-20"
              />
            )}
          </AnimatePresence>

          {/* Success Overlay */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-primary/20 flex items-center justify-center z-30 backdrop-blur-[2px]"
              >
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
                >
                  <span className="material-symbols-outlined text-4xl text-primary font-bold">check</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Text */}
        <div className="mt-8 text-center">
          {status === 'idle' && (
            <button 
              onClick={startScan}
              className="px-8 py-3 rounded-full bg-primary text-black font-bold text-sm hover:scale-105 transition-all"
            >
              Start Face Scan
            </button>
          )}
          {status === 'scanning' && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
              <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">Verifying Identity...</p>
            </div>
          )}
          {status === 'success' && (
            <p className="text-secondary font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Access Granted</p>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
              <button 
                onClick={() => setIsLocked(false)}
                className="text-on-surface-variant text-xs underline underline-offset-4 hover:text-white transition-colors"
              >
                Bypass with Passcode (Demo)
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-12 text-center opacity-40">
          <p className="text-[10px] uppercase tracking-widest text-white font-bold">Biometric Security • Luthier Core</p>
        </div>
      </div>
    </motion.div>
  );
};
