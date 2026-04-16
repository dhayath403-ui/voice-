import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { ALPHA_BETS, COMPOUNDING_DATA, FUND_INFO } from '../constants/fundData';
import { cn } from '../lib/utils';

export const AlphaAlohaView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pb-24">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-2">Marketing Prospectus</p>
            <h1 className="text-6xl font-black font-headline tracking-tighter mb-4">
              Hushh Evergreen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary">Alpha Aloha Fund A</span>
            </h1>
            <p className="text-on-surface-variant text-xl max-w-2xl font-body leading-relaxed">
              {FUND_INFO.mission}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Confidential</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">March 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-y border-outline-variant/10 py-8">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Structure</p>
            <p className="text-sm font-medium">Delaware LP · Cayman Islands Master-Feeder</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">General Partner</p>
            <p className="text-sm font-medium">Hushh Technologies Middle East LLC</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Investment Manager</p>
            <p className="text-sm font-medium">Hushh Alpha Management LP</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Managing Member</p>
            <p className="text-sm font-medium">Manish Sainani</p>
          </div>
        </div>
      </motion.div>

      {/* The Thesis Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2"
        >
          <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">The Thesis</h2>
          <h3 className="text-5xl font-black font-headline tracking-tight mb-6">
            $800 billion <br />
            <span className="text-gray-400">in free cash flow.</span>
          </h3>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            That's what the top six companies are projected to generate annually by 2033. 
            Each dollar is a dollar of strategic choice. We own them all.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
              <p className="text-3xl font-black text-white mb-1">27</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Positions</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
              <p className="text-3xl font-black text-white mb-1">$630B</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">2026 AI Capex</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
              <p className="text-3xl font-black text-white mb-1">22%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">T-Bill Reserve</p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10">
              <p className="text-3xl font-black text-white mb-1">1</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Selection Metric</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-surface-container-high p-8 rounded-3xl border border-primary/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary">auto_awesome</span>
          </div>
          <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            GP Alignment
          </h4>
          <ul className="space-y-4">
            {[
              { label: "Skin in the Game", value: "≥5% of NAV co-invested" },
              { label: "Liquidity Order", value: "First in, last out (FILO)" },
              { label: "GP Fees", value: "Zero fees on GP capital" },
              { label: "High Water Mark", value: "Permanent HWM" },
              { label: "Commitment", value: "Committed for life of Fund" }
            ].map((item, i) => (
              <li key={i} className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-bold text-primary">{item.value}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* The Three Engines */}
      <div className="max-w-7xl mx-auto mb-24">
        <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-8 text-center">How It Works</h2>
        <h3 className="text-4xl font-black font-headline tracking-tight mb-12 text-center">Three engines. <span className="text-gray-500">One flywheel.</span></h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FUND_INFO.engines.map((engine, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-3xl border transition-all hover:scale-[1.02]",
                i === 2 ? "bg-white text-black border-white" : "bg-surface-container-low border-outline-variant/10"
              )}
            >
              <p className={cn("text-[10px] uppercase tracking-[0.2em] mb-4 font-bold", i === 2 ? "text-gray-500" : "text-primary")}>Engine {i + 1}</p>
              <h4 className="text-3xl font-black mb-4 font-headline tracking-tighter">{engine.name}</h4>
              <p className={cn("text-sm leading-relaxed", i === 2 ? "text-gray-700" : "text-on-surface-variant")}>
                {engine.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Alpha Bets Table */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-2">Engine 1: Alpha</h2>
            <h3 className="text-4xl font-black font-headline tracking-tight">The Alpha Bets <span className="text-primary">27</span></h3>
          </div>
          <div className="flex gap-4">
            {['ACE', 'KING', 'QUEEN', 'JACK'].map(tier => (
              <div key={tier} className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  tier === 'ACE' ? "bg-primary" : 
                  tier === 'KING' ? "bg-secondary" : 
                  tier === 'QUEEN' ? "bg-blue-400" : "bg-gray-500"
                )}></span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{tier}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">#</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Ticker</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Company</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500 text-right">2033E FCF</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Tier</th>
                </tr>
              </thead>
              <tbody>
                {ALPHA_BETS.slice(0, 14).map((bet) => (
                  <tr key={bet.rank} className="border-b border-outline-variant/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-xs text-gray-500">{bet.rank}</td>
                    <td className="p-4 font-bold text-primary group-hover:scale-110 transition-transform inline-block">{bet.ticker}</td>
                    <td className="p-4 text-sm">{bet.company}</td>
                    <td className="p-4 text-sm font-mono text-right">${bet.fcf2033}B</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold",
                        bet.tier === 'ACE' ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                      )}>
                        {bet.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">#</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Ticker</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Company</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500 text-right">2033E FCF</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-gray-500">Tier</th>
                </tr>
              </thead>
              <tbody>
                {ALPHA_BETS.slice(14).map((bet) => (
                  <tr key={bet.rank} className="border-b border-outline-variant/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-xs text-gray-500">{bet.rank}</td>
                    <td className="p-4 font-bold text-primary group-hover:scale-110 transition-transform inline-block">{bet.ticker}</td>
                    <td className="p-4 text-sm">{bet.company}</td>
                    <td className="p-4 text-sm font-mono text-right">${bet.fcf2033}B</td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold",
                        bet.tier === 'QUEEN' ? "bg-blue-400/20 text-blue-400" : "bg-gray-500/20 text-gray-400"
                      )}>
                        {bet.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compounding Chart */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="bg-surface-container-low p-12 rounded-[3rem] border border-outline-variant/10">
          <div className="mb-12 text-center">
            <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">The Power of Compounding</h2>
            <h3 className="text-6xl font-black font-headline tracking-tighter mb-4">
              $100M → <span className="text-primary">$14.6 billion</span>
            </h3>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              25 years. All three engines. Founders class net returns. 
              The Evergreen Structure has no fixed term — LPs compound uninterrupted.
            </p>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COMPOUNDING_DATA}>
                <defs>
                  <linearGradient id="colorAll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="#555" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `Year ${val}`}
                />
                <YAxis 
                  stroke="#555" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(1) + 'B' : val + 'M'}`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Area 
                  type="monotone" 
                  dataKey="all" 
                  name="All Engines (22%)" 
                  stroke="#D4AF37" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAll)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="aloha" 
                  name="+ Aloha (17.5%)" 
                  stroke="#C0C0C0" 
                  strokeWidth={2}
                  fill="transparent"
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  name="Equity Only (15%)" 
                  stroke="#555" 
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Five Iron Rules */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/10 to-transparent p-12 rounded-[3rem] border border-primary/20"
        >
          <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-8">Non-Waivable Constitutional Provisions</h4>
          <h3 className="text-4xl font-black font-headline tracking-tight mb-8">Five Iron Rules</h3>
          <div className="space-y-6">
            {FUND_INFO.rules.map((rule, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-primary font-black text-xl">{i + 1}.</span>
                <p className="text-on-surface-variant leading-relaxed">
                  <span className="text-white font-bold">{rule.split(' — ')[0]}</span> — {rule.split(' — ')[1]}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-[10px] text-gray-500 uppercase tracking-widest">
            Amendment requires unanimous consent of all partners
          </p>
        </motion.div>

        <div className="space-y-8">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
            <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-6">Risk Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Liquidity", value: "High" },
                { label: "Transparency", value: "Full" },
                { label: "Diversification", value: "Concentrated" },
                { label: "Leverage Ctrl", value: "Systematic" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-black/40 border border-outline-variant/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
            <h4 className="text-primary font-bold tracking-widest uppercase text-xs mb-6">Investor Protections</h4>
            <ul className="space-y-3">
              {[
                "Absolute Ceiling — 1.50x leverage",
                "High-Water Mark — Permanent",
                "T-Bill Reserve — 22% minimum",
                "Investor Gate — 25% quarterly"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-loose">
          This document is confidential and for informational purposes only. Not an offer to sell or solicitation to buy. <br />
          For qualified institutional investors only · GS-PFAG-2026-HUSHH-MP
        </p>
      </div>
    </div>
  );
};
