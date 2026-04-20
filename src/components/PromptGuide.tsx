import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';

interface GuideStep {
  title: string;
  description: string;
  example: string;
  icon: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Be Specific",
    description: "Define the role, task, and desired format clearly. Instead of 'Write a story', try 'As a sci-fi author, write a 200-word opening for a story about a digital luthier.'",
    example: "As a [Role], perform [Task] in [Format].",
    icon: "target"
  },
  {
    title: "Provide Context",
    description: "Give the AI background information. The more it knows about your goals, the better it can tune the output to your creative intent.",
    example: "I am building a [Project] for [Audience]. Help me [Task].",
    icon: "info"
  },
  {
    title: "Few-Shot Prompting",
    description: "Provide examples of the output you want. This 'tunes' the AI's pattern recognition to match your style precisely.",
    example: "Input: [Example 1] -> Output: [Result 1]\nInput: [Example 2] -> Output: [Result 2]",
    icon: "format_list_bulleted"
  },
  {
    title: "Chain of Thought",
    description: "Ask the AI to 'think step-by-step'. This improves reasoning for complex tasks like coding or strategic planning.",
    example: "Let's think step-by-step to solve this [Problem].",
    icon: "psychology"
  },
  {
    title: "Iterate & Refine",
    description: "Prompting is a conversation. If the result isn't perfect, ask for specific adjustments like 'Make it more professional' or 'Add more technical detail'.",
    example: "That's good, but [Adjustment].",
    icon: "refresh"
  }
];

interface PromptGuideProps {
  onClose: () => void;
  onApplyExample: (example: string) => void;
}

export const PromptGuide: React.FC<PromptGuideProps> = ({ onClose, onApplyExample }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = GUIDE_STEPS[currentStep];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="absolute inset-6 z-[60] bg-surface-container-highest/98 backdrop-blur-2xl p-8 rounded-3xl border border-primary/20 shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
          </div>
          <h3 id="guide-title" className="font-headline font-bold text-xl text-white tracking-tight">Prompt Engineering Guide</h3>
        </div>
        <Tooltip content="Close Guide" position="bottom">
          <button 
            onClick={onClose}
            aria-label="Close Guide"
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-3xl">{step.icon}</span>
          </div>
          <h4 className="text-2xl font-black font-headline tracking-tighter text-white">{step.title}</h4>
        </div>

        <p className="text-on-surface-variant leading-relaxed font-body text-lg">
          {step.description}
        </p>

        <div className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Template / Example</label>
          <pre className="text-sm font-mono text-white whitespace-pre-wrap leading-relaxed">
            {step.example}
          </pre>
          <button 
            onClick={() => onApplyExample(step.example)}
            className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
            Apply to Chat
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-1.5">
          {GUIDE_STEPS.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentStep ? "w-8 bg-primary" : "w-1.5 bg-surface-container-low"
              )}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <Tooltip content="Previous Tip" position="top">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              aria-label="Previous Tip"
              className="p-3 rounded-xl bg-surface-container-low text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-highest transition-colors border border-outline-variant/10"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          </Tooltip>
          <button 
            onClick={currentStep === GUIDE_STEPS.length - 1 ? onClose : nextStep}
            aria-label={currentStep === GUIDE_STEPS.length - 1 ? "Close Guide" : "Next Tip"}
            className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {currentStep === GUIDE_STEPS.length - 1 ? "Got it!" : "Next Tip"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
