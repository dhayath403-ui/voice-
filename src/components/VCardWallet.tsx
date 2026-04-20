import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Wallet, Share2, Download, ShieldCheck, ArrowUpRight, ArrowDownLeft, Activity, User, QrCode, Fingerprint, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  label: string;
  date: string;
  status: 'Completed' | 'Pending';
}

const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: '+$12.40', label: 'Data Dividend: Amazon Query', date: 'Today, 2:45 PM', status: 'Completed' },
  { id: '2', type: 'income', amount: '+$5.20', label: 'Identity Verification Reward', date: 'Yesterday, 10:15 AM', status: 'Completed' },
  { id: '3', type: 'income', amount: '+$8.00', label: 'Market Insight Contribution', date: '2 days ago', status: 'Completed' },
  { id: '4', type: 'expense', amount: '-$2.00', label: 'Secure Tunnel Provisioning', date: '3 days ago', status: 'Completed' },
];

export const VCardWallet: React.FC = () => {
  const { profilePicture } = useSettings();
  const [activeTab, setActiveTab] = useState<'card' | 'wallet'>('card');
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12 pb-32">
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-secondary">
          <CreditCard className="w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight font-headline">Identity Wallet</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your secure digital vCard and data dividend wallet, unified in a single neural asset.
        </p>
      </header>

      <div className="flex justify-center mb-12">
        <div className="flex bg-surface-container-highest/50 p-1 rounded-full border border-outline-variant/10">
          <button 
            onClick={() => setActiveTab('card')}
            className={cn(
              "px-8 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-widest",
              activeTab === 'card' ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            vCard
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={cn(
              "px-8 py-2 rounded-full text-xs font-bold uppercase transition-all tracking-widest",
              activeTab === 'wallet' ? "bg-secondary text-black" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Wallet
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'card' ? (
          <motion.div 
            key="vcard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-12"
          >
            <div 
              className="relative w-full max-w-md aspect-[1.6/1] preserve-3d cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div 
                className="w-full h-full relative duration-700 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden mica-effect rounded-3xl p-8 border border-primary/30 bg-gradient-to-br from-primary/10 via-surface-container-low to-surface-container-highest flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Fingerprint className="w-32 h-32" />
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-bold text-primary uppercase tracking-tighter">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified Data Luthier
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase">dhayath403</h2>
                    <p className="text-xs text-primary font-bold uppercase tracking-[0.3em] mt-1">Kai Protocol Architect</p>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                      <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Member Since</p>
                      <p className="text-xs font-mono text-white">APR 2026</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-8 h-5 rounded bg-white/10 border border-white/5" />
                      <div className="w-8 h-5 rounded bg-white/10 border border-white/5" />
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden mica-effect rounded-3xl p-8 border border-secondary/30 bg-gradient-to-bl from-secondary/10 via-surface-container-low to-surface-container-highest flex flex-col items-center justify-center gap-4 rotate-y-180">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl">
                    <div className="w-full h-full bg-black flex items-center justify-center rounded-lg">
                      <QrCode className="w-20 h-20 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Digital Manifestation</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">HASH: 48f9-d2b1-3e4a-9c01</p>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-secondary" />
                    <span className="text-[8px] font-bold text-secondary uppercase tracking-[0.4em]">Powered by KaiOS</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-container-highest/50 border border-outline-variant/20 text-white font-bold text-sm hover:border-primary/50 transition-all transition-colors group">
                <Share2 className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                Share Digital vCard
              </button>
              <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-surface-container-highest/50 border border-outline-variant/20 text-white font-bold text-sm hover:border-secondary/50 transition-all transition-colors group">
                <Download className="w-4 h-4 text-secondary group-hover:translate-y-1 transition-transform" />
                Save to Wallet
              </button>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Click card to reveal neural manifestation</p>
          </motion.div>
        ) : (
          <motion.div 
            key="wallet"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="mica-effect border border-secondary/20 rounded-3xl p-8 bg-gradient-to-br from-secondary/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Wallet className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Data Dividends</p>
                      <h2 className="text-6xl font-black text-white tracking-tighter mt-1">$142.50</h2>
                    </div>
                    <div className="flex gap-2">
                       <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary uppercase animate-pulse">
                         <Activity className="w-3 h-3" />
                         Live Earnings
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 rounded-2xl bg-secondary text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Withdraw Assets
                    </button>
                    <button className="flex-1 py-4 rounded-2xl bg-surface-container-highest/50 border border-outline-variant/20 text-white font-bold text-sm hover:bg-surface-container-highest/80 transition-all flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4" />
                      Yield Optimization
                    </button>
                  </div>
                </div>
              </div>

              <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                  <Activity className="w-5 h-5 text-secondary" />
                  Recent Neural Transactions
                </h3>
                <div className="space-y-4">
                  {TRANSACTIONS.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-highest/20 border border-outline-variant/5 hover:bg-surface-container-highest/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          tx.type === 'income' ? "bg-secondary/10 text-secondary" : "bg-red-500/10 text-red-500"
                        )}>
                          {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-background group-hover:text-white transition-colors">{tx.label}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-medium">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-mono font-bold",
                          tx.type === 'income' ? "text-secondary" : "text-on-background"
                        )}>{tx.amount}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold font-headline">Wallet Security</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Neural Encryption', status: 'Active', icon: 'shield_locked' },
                    { label: 'Auto-Sweep', status: 'Enabled', icon: 'auto_mode' },
                    { label: 'Hardware Key', status: 'Not Linked', icon: 'key' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest/10 border border-outline-variant/5">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm text-gray-500">{item.icon}</span>
                        <p className="text-xs font-medium text-gray-300">{item.label}</p>
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold px-2 py-0.5 rounded border uppercase",
                        item.status === 'Active' || item.status === 'Enabled' ? "text-secondary/80 bg-secondary/5 border-secondary/10" : "text-gray-500 bg-white/5 border-white/10"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 text-on-background font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-surface-container-highest/80 transition-all">
                  Deep Security Audit
                </button>
              </div>

              <div className="mica-effect border border-primary/20 rounded-3xl p-8 space-y-4 bg-gradient-to-t from-primary/5 to-transparent">
                <div className="flex items-center gap-2 text-primary">
                  <Fingerprint className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-headline leading-tight">Data Asset Value</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white">$2,840.00</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Estimated Portfolio</p>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Based on your current 4.2 GB data manifest across 18 approved consent streams.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
