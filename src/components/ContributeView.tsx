import React from 'react';
import { motion } from 'motion/react';
import { Github, Code2, Bug, Lightbulb, FileText, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const ContributeView: React.FC = () => {
  const tracks = [
    {
      id: 'hushhtech',
      title: 'hushhTech',
      description: 'Ideal for contributors interested in frontend experience, APIs, repo hygiene, testing, performance, documentation, and developer-facing improvements.',
      links: {
        repo: 'https://github.com/hushh-labs/hushh_Tech_website',
        readme: 'https://github.com/hushh-labs/hushh_Tech_website/blob/main/README.md',
        issues: 'https://github.com/hushh-labs/hushh_Tech_website/issues',
      },
      icon: <Code2 className="w-6 h-6 text-primary" />,
      color: 'bg-primary/10 border-primary/20 text-primary'
    },
    {
      id: 'kai',
      title: 'Kai',
      description: 'Ideal for contributors who want to understand a deeper AI-first product flow, study the architecture, and contribute meaningful improvements.',
      links: {
        app: 'https://kai.hushh.ai/',
        repo: 'https://github.com/hushh-labs/hushh-research',
      },
      icon: <Github className="w-6 h-6 text-secondary" />,
      color: 'bg-secondary/10 border-secondary/20 text-secondary'
    }
  ];

  const steps = [
    { title: 'Register', desc: 'Sign up for the opportunity on the platform.', icon: <CheckCircle2 className="w-5 h-5" /> },
    { title: 'Choose Track', desc: 'Select hushhTech or Kai as your target.', icon: <Code2 className="w-5 h-5" /> },
    { title: 'Research', desc: 'Read documentation and study the codebase.', icon: <FileText className="w-5 h-5" /> },
    { title: 'Identify', desc: 'Find a bug, feature, or optimization.', icon: <Bug className="w-5 h-5" /> },
    { title: 'Implement', desc: 'Working on a clean topic branch.', icon: <Code2 className="w-5 h-5" /> },
    { title: 'Submit', desc: 'Raise a pull request before the deadline.', icon: <ArrowRight className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <Github className="w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-tight font-headline">Hushh Contribution Program</h1>
        </div>
        <p className="text-gray-400 text-xl max-w-3xl leading-relaxed">
          Join the Hushh ecosystem. Choose a project track, contribute meaningfully, and help us build the future of personal data sovereignty.
        </p>
      </header>

      {/* Project Tracks */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">layers</span>
          Project Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <motion.div 
              key={track.id}
              whileHover={{ y: -5 }}
              className="mica-effect border border-outline-variant/10 rounded-3xl overflow-hidden group flex flex-col"
            >
              <div className="p-8 space-y-6 flex-1">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", track.color)}>
                  {track.icon}
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{track.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{track.description}</p>
                
                <div className="pt-6 border-t border-outline-variant/10 space-y-3">
                  {Object.entries(track.links).map(([key, url]) => (
                    <a 
                      key={key} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors group/link p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-outline-variant/10"
                    >
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Submission Process */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">trending_up</span>
          Submission Lifecycle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative p-6 rounded-3xl bg-surface-container-highest/30 border border-outline-variant/10 overflow-hidden group">
              <div className="absolute top-4 right-4 text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">0{i + 1}</div>
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-primary border border-primary/20">
                {step.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Important Clarity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rules */}
        <section className="space-y-6 p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Integrity Guidelines
          </h3>
          <ul className="space-y-4">
            {[
              "Follow repository contribution protocols",
              "Do not push directly to the main branch",
              "Keep pull requests focused and meaningful",
              "Do not commit secrets, tokens, or .env files",
              "Respect the project's Code of Conduct"
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="text-primary mt-1">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        {/* Requirements */}
        <section className="space-y-6 p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            Required for Submission
          </h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Your final entry must include:</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-500">
              <div className="p-3 bg-black/20 rounded-xl border border-outline-variant/10">GitHub Link</div>
              <div className="p-3 bg-black/20 rounded-xl border border-outline-variant/10">Project Track</div>
              <div className="p-3 bg-black/20 rounded-xl border border-outline-variant/10">PR Link</div>
              <div className="p-3 bg-black/20 rounded-xl border border-outline-variant/10">Write-up</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-400 leading-relaxed font-medium">
              <span className="font-bold">Deadline:</span> Pull requests must be raised on or before 26 April 2026.
            </p>
          </div>
        </section>
      </div>

      <footer className="pt-12 border-t border-outline-variant/10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <HelpCircle className="w-3 h-3" />
          Need help? Check the SECURITY and SUPPORT MDs
        </div>
        <p className="text-xs text-gray-500 max-w-xl mx-auto italic">
          "We are looking for developers who can understand a real codebase before coding, think from both product and engineering perspectives, and show strong ownership."
        </p>
      </footer>
    </div>
  );
};
