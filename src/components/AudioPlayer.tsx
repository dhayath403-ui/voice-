import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate random heights for the waveform bars
  const [waveformBars] = useState(() => 
    Array.from({ length: 32 }, () => Math.random() * 0.6 + 0.2)
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setError(null);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = (e: any) => {
      console.error("Audio playback error:", e);
      setError("Failed to load audio source");
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    if (audio.readyState >= 1) {
      setAudioData();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current && !error) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Playback failed:", err);
            setError("Playback failed");
            setIsPlaying(false);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("flex flex-col gap-3 bg-surface-container-highest/20 p-4 rounded-2xl border border-outline-variant/10 min-w-[280px] backdrop-blur-md shadow-xl", className)}>
      {src && <audio ref={audioRef} src={src} preload="metadata" />}
      
      <div className="flex items-center gap-4">
        <Tooltip content={error ? "Audio unavailable" : isPlaying ? "Pause audio" : "Play audio"} position="top">
          <button 
            onClick={togglePlay}
            disabled={!!error || !src}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg border group",
              error || !src 
                ? "bg-red-400/10 text-red-400 border-red-400/20 opacity-50 cursor-not-allowed" 
                : "bg-primary/15 text-primary border-primary/20 hover:bg-primary/25"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span className="material-symbols-outlined text-3xl fill group-hover:scale-110 transition-transform">
              {error ? 'error' : isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </Tooltip>

        <div className="flex-1 flex flex-col gap-3">
          {error ? (
            <div className="h-10 flex items-center justify-center text-[10px] font-bold text-red-400/60 uppercase tracking-widest">
              {error}
            </div>
          ) : (
            /* Enhanced Waveform Visualization */
            <div className="h-10 flex items-center justify-between gap-[3px] px-1">
              {waveformBars.map((height, i) => {
                const barProgress = (i / waveformBars.length) * 100;
                const isActive = barProgress <= progress;
                
                return (
                  <motion.div
                    key={i}
                    animate={isPlaying ? {
                      height: [`${height * 100}%`, `${Math.min(100, height * 1.8 * 100)}%`, `${height * 100}%`],
                      opacity: [0.6, 1, 0.6],
                    } : {
                      height: `${height * 100}%`,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      "w-1 rounded-full transition-all duration-500",
                      isActive 
                        ? "bg-gradient-to-t from-primary to-secondary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                        : "bg-on-surface-variant/20"
                    )}
                  />
                );
              })}
            </div>
          )}

          <div className="relative h-1.5 w-full group">
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="0.01"
              value={currentTime} 
              onChange={handleTimelineChange}
              className="absolute inset-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 h-1.5 bg-on-surface-variant/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" 
                style={{ width: `${progress}%` }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-on-surface-variant/70 font-mono font-black tracking-tighter uppercase">
            <span className="bg-surface-container-highest/50 px-1.5 py-0.5 rounded">{formatTime(currentTime)}</span>
            <span className="bg-surface-container-highest/50 px-1.5 py-0.5 rounded">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
