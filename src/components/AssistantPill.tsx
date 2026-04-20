import React from 'react';
import { motion } from 'motion/react';

interface AssistantPillProps {
  onClick: () => void;
}

export const AssistantPill: React.FC<AssistantPillProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 xl:left-[calc(50%+128px)]">
      {/* The Assistant Pill */}
      <div 
        onClick={onClick}
        className="mica-effect w-[320px] md:w-[420px] h-16 rounded-full border border-outline-variant/30 flex items-center px-2 shadow-2xl cursor-pointer hover:border-primary/50 transition-all"
      >
        {/* The Signature Orb */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute w-10 h-10 bg-secondary-container rounded-full opacity-60"></div>
          <div className="orb-pulse relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-primary-dim opacity-40 blur-sm"></div>
            <span className="material-symbols-outlined text-white text-sm relative z-10 fill">mic</span>
          </div>
          {/* Rhythmic Pulsing Rings */}
          <div className="absolute inset-0 border-2 border-primary-dim/30 rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
          <div className="absolute -inset-1 border border-primary/20 rounded-full animate-pulse opacity-10"></div>
        </div>

        {/* Listening Bars / Input Visualizer */}
        <div className="flex-1 flex items-center justify-center gap-1 px-4">
          <motion.div animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-primary/40 rounded-full"></motion.div>
          <motion.div animate={{ height: [20, 32, 20] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-primary/60 rounded-full"></motion.div>
          <motion.div animate={{ height: [32, 48, 32] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-primary rounded-full"></motion.div>
          <motion.div animate={{ height: [24, 40, 24] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-secondary rounded-full"></motion.div>
          <motion.div animate={{ height: [16, 28, 16] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-secondary/60 rounded-full"></motion.div>
          <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1.3 }} className="w-1 bg-secondary/40 rounded-full"></motion.div>
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-1">
          <div className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors text-lg">close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
