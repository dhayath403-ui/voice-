import React from 'react';
import { motion } from 'motion/react';
import { Mic, Shield, Database, Lock, Zap, ArrowUpRight, Activity, UserCheck, Globe, Cpu, Fingerprint, Share2, Key, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="mica-effect border border-outline-variant/10 rounded-2xl p-5 space-y-4 group transition-all hover:border-primary/30"
  >
    <div className="flex justify-between items-start">
      <div className={cn("p-2 rounded-xl bg-opacity-10", color)}>
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">{label}</p>
      <p className="text-2xl font-mono font-bold text-on-background mt-1">{value}</p>
    </div>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { lens, byokEnabled } = useSettings();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-12 pb-32 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none -z-10" aria-hidden="true" />
      
      {/* Hero Section with Voice Assistant Trigger */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                <Fingerprint className="w-3 h-3" />
                Verified Identity: dhayath403
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                KaiOS v2.4
              </div>
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                lens === 'Growth' ? "bg-primary/10 border-primary/20 text-primary" :
                lens === 'Defensive' ? "bg-secondary/10 border-secondary/20 text-secondary" :
                "bg-white/10 border-white/20 text-white"
              )}>
                <Target className="w-3 h-3" />
                Lens: {lens}
              </div>
              {byokEnabled && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
                  <Key className="w-3 h-3" />
                  BYOK Active
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter leading-none">
              Hushh Kai <br />
              <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Hushh Kai empowers you to own, manage, and monetize your personal data with absolute consent and security.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-4 p-2 rounded-2xl bg-surface-container-highest/30 border border-outline-variant/10">
              <div className="px-6 py-3 rounded-xl bg-primary text-black font-bold flex items-center gap-2 shadow-lg">
                <Cpu className="w-4 h-4" />
                Agent Active
              </div>
              <div className="pr-4">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">System Status</p>
                <p className="text-xs text-on-background font-mono">All Nodes Synchronized</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center">
          {/* Animated Brand Orb */}
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-primary-dim opacity-20 blur-3xl animate-pulse"></div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-primary/10 border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-secondary/10 border-dotted"
            />
            
            <div className="absolute inset-16 rounded-full bg-surface-container-highest flex flex-col items-center justify-center border border-outline-variant/30 shadow-[0_0_80px_rgba(var(--primary-rgb),0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
              <h3 className="text-4xl font-black text-primary tracking-tighter">HUSHH</h3>
              <p className="text-[8px] uppercase tracking-[0.4em] text-on-surface-variant font-bold mt-1">Data Sovereignty</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard 
              icon={<Database className="w-5 h-5 text-primary" />}
              label="Personal Data Assets"
              value="4.2 GB"
              trend="+0.8 GB"
              color="bg-primary"
            />
            <StatCard 
              icon={<Shield className="w-5 h-5 text-secondary" />}
              label="Security Posture"
              value="Optimal"
              trend="No Threats"
              color="bg-secondary"
            />
            <StatCard 
              icon={<Share2 className="w-5 h-5 text-primary" />}
              label="Active Consents"
              value="18"
              trend="-2"
              color="bg-primary"
            />
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'wallet' }))}
              className="w-full text-left"
            >
              <StatCard 
                icon={<Zap className="w-5 h-5 text-secondary" />}
                label="Data Earnings"
                value="$142.50"
                trend="+$12.40"
                color="bg-secondary"
              />
            </button>
          </div>

          <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Data Stream Activity
              </h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { title: "LinkedIn profile data updated", time: "Just now", status: "Encrypted" },
                { title: "Amazon purchase history synced", time: "12 mins ago", status: "Verified" },
                { title: "Location data anonymized", time: "45 mins ago", status: "Secure" },
                { title: "New consent request: Uber AI", time: "2 hours ago", status: "Pending" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-highest/20 border border-outline-variant/5 hover:bg-surface-container-highest/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                    <div>
                      <p className="text-sm font-bold text-on-background">{item.title}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">{item.time}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 bg-primary/5 px-2 py-1 rounded border border-primary/10">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="mica-effect border border-primary/20 rounded-3xl p-8 space-y-6 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Lock className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-bold font-headline">Consent Manager</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              You have 3 high-priority consent requests waiting for your approval.
            </p>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm hover:scale-[1.02] transition-all">
                Review Requests
              </button>
              <button className="w-full py-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 text-on-background font-bold text-sm hover:bg-surface-container-highest/80 transition-all">
                Revoke All
              </button>
            </div>
          </div>

          <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold font-headline">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Privacy Audit", icon: <Shield className="w-4 h-4" /> },
                { label: "Data Export", icon: <Database className="w-4 h-4" /> },
                { label: "Sync Sources", icon: <Zap className="w-4 h-4" /> },
                { label: "Identity Settings", icon: <UserCheck className="w-4 h-4" /> },
                { label: "Alpha Aloha Fund", icon: <ArrowUpRight className="w-4 h-4 text-primary" />, id: 'alpha-aloha' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => action.id && window.dispatchEvent(new CustomEvent('changeTab', { detail: action.id }))}
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-highest/10 border border-outline-variant/10 transition-all hover:border-primary/30 group"
                >
                  <span className="text-sm font-bold group-hover:text-primary transition-colors">{action.label}</span>
                  <div className="text-on-surface-variant group-hover:text-primary transition-colors">
                    {action.icon}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Security Posture
              </h3>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Hardened</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "SMTP Header Injection Protection", status: "Patched", icon: "mail" },
                { label: "Zero-Trace DevOps Architecture", status: "Active", icon: "terminal" },
                { label: "Three-Tier Client Cache", status: "Optimized", icon: "memory" },
                { label: "Recursive Constraint Validation", status: "Enforced", icon: "verified_user" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest/10 border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-secondary">{item.icon}</span>
                    <p className="text-xs font-medium text-on-surface-variant">{item.label}</p>
                  </div>
                  <span className="text-[9px] font-bold text-secondary/80 bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10 uppercase">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mica-effect border border-secondary/20 rounded-3xl p-8 space-y-4 bg-gradient-to-br from-secondary/5 to-transparent">
            <div className="flex items-center gap-2 text-secondary">
              <Globe className="w-5 h-5" />
              <h3 className="text-lg font-bold font-headline">Market Insight</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Hushh ecosystem value is projected to grow by 24% this quarter.
            </p>
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('changeTab', { detail: 'finance' }));
              }}
              className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Analyze Hushh Stocks <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
