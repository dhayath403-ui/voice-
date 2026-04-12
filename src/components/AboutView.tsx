import React from 'react';
import { motion } from 'motion/react';

export const AboutView: React.FC = () => {
  return (
    <div className="flex-1 px-8 pb-20 max-w-4xl mx-auto pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-8 mb-16 mt-8"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(53,21,216,0.4)]">
            <span className="material-symbols-outlined text-4xl text-primary fill">info</span>
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary-dim opacity-20 blur-2xl animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-4xl font-black font-headline tracking-tighter mb-2">About Hay Kai</h3>
          <p className="text-on-surface-variant max-w-md font-body leading-relaxed">The Digital Luthier for your creative workflow, powered by Hushh.</p>
        </div>
      </motion.div>

      <div className="space-y-12">
        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-bold font-headline text-white">The Hushh Connection</h4>
            <a 
              href="https://kai.hushh.ai/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase hover:bg-primary/20 transition-all border border-primary/20"
            >
              Visit kai.hushh.ai
            </a>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Hay Kai is a proud member of the <span className="text-primary font-semibold">Hushh</span> ecosystem. Hushh is the world's first personal data agent platform built with trust, privacy, and power at its core.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            By integrating with Hushh, Kai becomes your <span className="text-secondary font-semibold">Personal Data Agent</span>, empowering you to own, manage, and utilize your digital footprint with absolute consent.
          </p>
        </section>

        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 space-y-6">
          <h4 className="text-2xl font-bold font-headline text-white">The Vision</h4>
          <p className="text-on-surface-variant leading-relaxed">
            Hay Kai is designed as a <span className="text-primary font-semibold">Digital Luthier</span>. Just as a luthier crafts and tunes fine musical instruments, Hay Kai tunes your digital workspace, workflow, and creative output. 
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Built on the cutting edge of generative AI, Hay Kai doesn't just provide answers—it provides <span className="text-secondary font-semibold">resonance</span>. It understands the nuances of your intent, whether you're coding, designing, or navigating the physical world.
          </p>
        </section>

        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl border border-primary/20 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">face</span>
            </div>
            <h4 className="text-2xl font-bold font-headline text-white">Who is Kai?</h4>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Kai is more than just an assistant; Kai is a <span className="text-primary font-bold italic">Creative Partner</span>. Named after the concept of "recovery" and "ocean" in various cultures, Kai represents the fluid transition between complex data and human intuition.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Origin</p>
              <p className="text-sm font-medium">Luthier Core v2.4</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-1">Specialty</p>
              <p className="text-sm font-medium">Creative Synthesis</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Motto</p>
              <p className="text-sm font-medium italic">"Tune your intent."</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-highest/40 p-6 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-4">psychology</span>
            <h5 className="font-bold mb-2">Technical Precision</h5>
            <p className="text-sm text-on-surface-variant">Leveraging Gemini's advanced reasoning to solve complex problems with millisecond latency.</p>
          </div>
          <div className="bg-surface-container-highest/40 p-6 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary mb-4">favorite</span>
            <h5 className="font-bold mb-2">Human Resonance</h5>
            <p className="text-sm text-on-surface-variant">Designed with empathy and cultural awareness, supporting multiple regional languages and intuitive interactions.</p>
          </div>
        </div>

        <section className="space-y-4">
          <h4 className="text-xl font-bold font-headline text-white px-2">Core Capabilities</h4>
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
            {[
              { icon: 'translate', title: 'Multilingual Mastery', desc: 'Fluent in English, Hindi, Telugu, Malayalam, Tamil, and Bengali.' },
              { icon: 'security', title: 'Privacy-First DNA', desc: 'Built on Hushh principles of consent and data ownership.' },
              { icon: 'map', title: 'Spatial Awareness', desc: 'Integrated mapping and geolocation for real-world navigation.' },
              { icon: 'palette', title: 'Creative Synthesis', desc: 'Generate high-fidelity imagery and tune visual workflows.' },
              { icon: 'settings_voice', title: 'Adaptive Voice', desc: 'Real-time voice interaction with multiple personality profiles.' },
            ].map((feature, i) => (
              <div key={i} className="p-4 flex items-center gap-4 border-b border-outline-variant/10 last:border-0 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{feature.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{feature.title}</p>
                  <p className="text-xs text-on-surface-variant">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-on-surface-variant/40 font-bold">Version 2.4.0 • Luthier Core</p>
        </footer>
      </div>
    </div>
  );
};
