import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from '@vladmandic/face-api';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

// Model location on CDN
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api@master/model/';

export const FaceLockScreen: React.FC = () => {
  const { 
    setIsLocked, 
    displayName, 
    profilePicture, 
    faceRegistered, 
    setFaceRegistered,
    faceDescriptor,
    setFaceDescriptor
  } = useSettings();
  
  const [status, setStatus] = useState<'loading' | 'idle' | 'scanning' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionInterval = useRef<number | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setStatus('idle');
        // Auto-start scan once models are loaded
        startScan();
      } catch (err) {
        console.error("Error loading face models:", err);
        setStatus('error');
        setErrorMessage("Critical error: AI models failed to load. Please check your internet connection.");
      }
    };

    loadModels();

    return () => {
      if (recognitionInterval.current) window.clearInterval(recognitionInterval.current);
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recognitionInterval.current) {
      window.clearInterval(recognitionInterval.current);
      recognitionInterval.current = null;
    }
  };

  const startScan = async () => {
    setStatus('scanning');
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start detection loop
      recognitionInterval.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        
        const detections = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detections) {
          handleFaceDetected(detections.descriptor);
        } else {
          setDebugInfo("Position your face in the center");
        }
      }, 500);
      
    } catch (err) {
      console.error("Camera access failed:", err);
      setStatus('error');
      setErrorMessage("Camera access denied. Please grant permission to use Face Lock.");
    }
  };

  const handleFaceDetected = (descriptor: Float32Array) => {
    if (!faceRegistered) {
      // Enrollment Mode
      setFaceDescriptor(JSON.stringify(Array.from(descriptor)));
      setFaceRegistered(true);
      setDebugInfo("Face Registered!");
      actionSuccess();
    } else {
      // Verification Mode
      if (!faceDescriptor) {
        setErrorMessage("Error: Face profile metadata missing. Please reset in Settings.");
        setStatus('error');
        return;
      }

      const savedDescriptor = new Float32Array(JSON.parse(faceDescriptor));
      const distance = faceapi.euclideanDistance(descriptor, savedDescriptor);
      
      // Threshold for face matching (lower is stricter)
      const threshold = 0.55; 
      
      if (distance < threshold) {
        setDebugInfo(`Match Confirmed! (Confidence: ${Math.round((1 - distance) * 100)}%)`);
        actionSuccess();
      } else {
        setDebugInfo("Unauthorized Face Detected");
      }
    }
  };

  const actionSuccess = () => {
    if (recognitionInterval.current) window.clearInterval(recognitionInterval.current);
    setStatus('success');
    setTimeout(() => {
      unlock();
    }, 1500);
  };

  const unlock = () => {
    stopCamera();
    setIsLocked(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden shadow-xl">
              {profilePicture ? (
                <img src={profilePicture} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <span className="material-symbols-outlined text-4xl text-primary">person</span>
                </div>
              )}
            </div>
            {faceRegistered && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-black p-1 rounded-full border-2 border-black">
                <span className="material-symbols-outlined text-xs font-bold block">verified_user</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black font-headline tracking-tight text-white">
            {displayName || 'Hushh Kai User'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              status === 'scanning' ? "bg-yellow-400" : status === 'success' ? "bg-green-400" : "bg-red-400"
            )}></span>
            <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-[0.2em]">
              {status === 'loading' ? 'Initializing Neural Engine' : status === 'scanning' ? 'Encrypted Session Active' : 'Luthier Security Mode'}
            </p>
          </div>
        </motion.div>

        <div className={cn(
          "relative w-72 h-72 rounded-[40px] overflow-hidden border-2 transition-all duration-500 bg-surface-container-low shadow-2xl group",
          status === 'scanning' ? "border-primary/40" : status === 'success' ? "border-secondary/60" : status === 'error' ? "border-red-500/50" : "border-outline-variant/30"
        )}>
          {status === 'loading' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Loading AI models</p>
            </div>
          ) : status === 'scanning' || status === 'success' ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                style={{ transform: 'scaleX(-1)' }}
                className={cn(
                  "w-full h-full object-cover transition-all duration-700",
                  status === 'success' ? "grayscale-0 scale-105" : "grayscale-[0.5]"
                )}
              />
              {/* Face Target Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-48 h-48 border border-white/20 rounded-[30px] relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-xl shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-xl shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-xl shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-xl shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-on-surface-variant/20">face_unlock</span>
            </div>
          )}

          <AnimatePresence>
            {status === 'scanning' && (
              <>
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-primary/60 shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] z-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
              </>
            )}
          </AnimatePresence>

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

        <div className="mt-12 text-center min-h-[100px] w-full px-8">
          {status === 'idle' && (
            <button 
              onClick={startScan}
              className="px-10 py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              ENABLE VISION
            </button>
          )}
          
          {(status === 'scanning' || status === 'success') && (
            <div className="flex flex-col items-center gap-4">
              {/* Dynamic Status Chip */}
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-colors duration-300",
                status === 'success' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                debugInfo.includes("Unauthorized") ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-primary/10 text-primary border-primary/20"
              )}>
                {status === 'success' ? 'Authorized' : debugInfo.includes("Unauthorized") ? 'Unauthorized' : 'Scanning'}
              </div>

              <div className="space-y-2">
                <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse">
                  {status === 'success'
                    ? (faceRegistered ? 'IDENTITY CONFIRMED' : 'PROFILE ENROLLED')
                    : (faceRegistered ? 'ANALYZING BIOMETRICS' : 'CREATING IDENTITY')}
                </p>
                <div className="flex flex-col gap-1 items-center">
                  <p className="text-on-surface-variant text-[10px] font-mono opacity-60 italic leading-relaxed">
                    {debugInfo}
                  </p>
                  {status === 'scanning' && !debugInfo.includes("Match") && (
                    <div className="w-32 h-1 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
                      <motion.div 
                        animate={{ x: [-128, 128] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-full bg-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs font-bold leading-relaxed max-w-xs">{errorMessage}</p>
              </div>
              <button 
                onClick={startScan}
                className="text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 py-2 px-4 rounded-lg transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLocked(false)}
            className="group flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-white">emergency_home</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant group-hover:text-white">
              Emergency Bypass
            </span>
          </button>
          
          <div className="text-center opacity-30 select-none">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white font-black flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-white/20"></span>
              NEURAL ENGINE • LUTH-X9
              <span className="w-8 h-[1px] bg-white/20"></span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
