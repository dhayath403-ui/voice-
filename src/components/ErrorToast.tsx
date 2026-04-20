import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useError } from '../context/ErrorContext';
import { AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export const ErrorToast: React.FC = () => {
  const { errors, removeError } = useError();

  return (
    <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {errors.map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={cn(
              "pointer-events-auto p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-4",
              error.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-400",
              error.type === 'warning' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
              error.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {error.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {error.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {error.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">
                {error.message}
              </p>
              <p className="text-[10px] mt-1 opacity-50 font-mono uppercase tracking-widest">
                {new Date(error.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => removeError(error.id)}
              className="flex-shrink-0 p-1 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
