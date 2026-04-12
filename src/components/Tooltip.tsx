import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className,
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-2',
    left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2 mr-2',
    right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0, x: position === 'left' ? 5 : position === 'right' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0, x: position === 'left' ? 5 : position === 'right' ? -5 : 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[100] px-2 py-1 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
              "bg-surface-container-highest/95 backdrop-blur-md text-primary border border-primary/20 rounded-md shadow-xl pointer-events-none",
              positionClasses[position],
              className
            )}
          >
            {content}
            {/* Arrow */}
            <div className={cn(
              "absolute w-1.5 h-1.5 bg-surface-container-highest border-primary/20 rotate-45",
              position === 'top' && "-bottom-[4px] left-1/2 -translate-x-1/2 border-b border-r",
              position === 'bottom' && "-top-[4px] left-1/2 -translate-x-1/2 border-t border-l",
              position === 'left' && "-right-[4px] top-1/2 -translate-y-1/2 border-t border-r",
              position === 'right' && "-left-[4px] top-1/2 -translate-y-1/2 border-b border-l",
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
