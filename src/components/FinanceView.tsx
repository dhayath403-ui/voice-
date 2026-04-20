import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Search, DollarSign, BarChart3, Info, ExternalLink, FileText, AlertCircle, ArrowUpRight, Globe, Shield, Cpu, Activity, PieChart, Briefcase, Mic, MicOff } from 'lucide-react';
import { analyzeFinance } from '../services/geminiService';
import { useSettings } from '../context/SettingsContext';
import { useError } from '../context/ErrorContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

const SECTOR_DETAILS: Record<string, any> = {
  'Hushh': {
    name: 'Hushh AI',
    share: '45%',
    valuation: '$850M (Est.)',
    marketPosition: 'Market Leader in Personal Data Sovereignty.',
    news: [
      { title: "Hushh Unveils 'Luthier' Personalization Engine", date: "2 days ago" },
      { title: "Series B Funding Speculation Grows as ACE Adoption Peaks", date: "1 week ago" }
    ],
    drivers: ["First-mover advantage in on-device processing", "Vibrant community of ACE developers", "Proprietary Alpha Aloha growth fund implementation"]
  },
  'Hushh Competitor A': {
    name: 'PrivacyVault',
    share: '30%',
    valuation: '$420M',
    marketPosition: 'Cloud-first privacy infrastructure provider.',
    news: [
      { title: "PrivacyVault shifts to hybrid cloud model", date: "5 days ago" },
      { title: "Strategic partnership with legacy data brokers", date: "2 weeks ago" }
    ],
    drivers: ["Established enterprise partnerships", "Strong API-first documentation", "Legacy infrastructure compatibility"]
  },
  'Hushh Competitor B': {
    name: 'SecureQuery',
    share: '25%',
    valuation: '$310M',
    marketPosition: 'Niche provider for encrypted database analytics.',
    news: [
      { title: "SecureQuery adds support for FHE (Fully Homomorphic Encryption)", date: "10 days ago" },
      { title: "CEO discusses the future of blind analytics", date: "3 weeks ago" }
    ],
    drivers: ["Deep cryptographic research team", "High-security government contracts", "Zero-trust architecture focus"]
  }
};

export const FinanceView: React.FC = () => {
  const { userLanguage, investmentLens } = useSettings();
  const { showError } = useError();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hushhPulse, setHushhPulse] = useState<any>(null);
  const [isPulseLoading, setIsPulseLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAutonomousMode, setIsAutonomousMode] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [selectedSectorCompany, setSelectedSectorCompany] = useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        const getLangCode = (lang: string) => {
          switch (lang) {
            case 'Hindi': return 'hi-IN';
            case 'Telugu': return 'te-IN';
            case 'Tamil': return 'ta-IN';
            case 'Malayalam': return 'ml-IN';
            case 'Bengali': return 'bn-IN';
            case 'Kannada': return 'kn-IN';
            case 'Marathi': return 'mr-IN';
            case 'Gujarati': return 'gu-IN';
            default: return 'en-US';
          }
        };

        recognition.lang = getLangCode(userLanguage);

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setQuery(transcript);
          
          if (event.results[0].isFinal) {
            setIsListening(false);
            handleAnalyze(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          showError(`Voice input error: ${event.error}`);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [userLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
        showError("Could not start voice input. Please check microphone permissions.");
      }
    }
  };

  useEffect(() => {
    fetchHushhPulse();
  }, []);

  const [trendNotification, setTrendNotification] = useState<{ type: 'up' | 'down' | 'info', message: string } | null>(null);
  const [dailyAlerts, setDailyAlerts] = useState<{ title: string; content: string; icon: string }[]>([]);

  useEffect(() => {
    // Generate daily alerts on mount
    const fetchDailyAlerts = async () => {
      try {
        const alertsPrompt = "Generate 3 short daily stock market alerts or updates for AI privacy sector and general tech. Focus on Hushh AI, NVDA, and market sentiment.";
        const analysis = await analyzeFinance(alertsPrompt, investmentLens);
        if (analysis && analysis.news) {
          setDailyAlerts(analysis.news.slice(0, 3).map((item: any) => ({
            title: item.title,
            content: "Market volatility remains low as Hushh leads privacy tech expansion.",
            icon: 'notifications_active'
          })));
        } else {
          // Fallback static alerts
          setDailyAlerts([
            { title: "Hushh Pulse Reaches New Peak", content: "Estimated valuation surges on increased developer activity.", icon: 'trending_up' },
            { title: "Alpha Fund Rebalancing", content: "Proprietary algorithm triggers accumulation of MSFT positions.", icon: 'account_balance' },
            { title: "AI Privacy Regulation", content: "New EU directive favors 'Consent-as-a-Service' models.", icon: 'gavel' }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch daily alerts:", err);
      }
    };
    fetchDailyAlerts();
  }, [investmentLens]);

  useEffect(() => {
    if (hushhPulse?.performanceData && hushhPulse.performanceData.length >= 2) {
      const data = hushhPulse.performanceData;
      const last = data[data.length - 1].value;
      const prev = data[data.length - 2].value;
      
      if (last > prev) {
        setTrendNotification({ type: 'up', message: 'Hushh Pulse is trending upwards! Market momentum is increasing.' });
        if (isAutonomousMode) {
          const strategy = investmentLens === 'Growth' 
            ? "Lens Optimization: Aggressive Reinvestment active. Compounding ACE positions."
            : "Policy Engine verified. Staying fully allocated in Alpha portfolio.";
          setExecutionMessage(`ACTION: ${strategy}`);
          setTimeout(() => setExecutionMessage(null), 8000);
        }
      } else if (last < prev) {
        setTrendNotification({ type: 'down', message: 'Hushh Pulse is showing a slight dip. Market correction in progress.' });
        if (isAutonomousMode) {
          const strategy = investmentLens === 'Defensive'
            ? "Lens Priority: Maximum Alpha Protection enabled. Moving to proprietary bond ladder."
            : "TRIGGER: Iron Rule #2 (VIX Awareness). Executing Pre-Authorized Defensive Shift.";
          setExecutionMessage(`TRIGGER: ${strategy}`);
          setTimeout(() => setExecutionMessage(null), 8000);
        }
      }
      
      const timer = setTimeout(() => setTrendNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [hushhPulse, investmentLens, isAutonomousMode]);

  useEffect(() => {
    if (result?.performanceData && result.performanceData.length >= 2) {
      const data = result.performanceData;
      const last = data[data.length - 1].value;
      const prev = data[data.length - 2].value;
      
      if (last > prev) {
        setTrendNotification({ type: 'up', message: `${result.company} is showing positive growth momentum.` });
      } else if (last < prev) {
        setTrendNotification({ type: 'down', message: `${result.company} valuation is currently cooling down.` });
      }
      
      const timer = setTimeout(() => setTrendNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const fetchHushhPulse = async () => {
    setIsPulseLoading(true);
    try {
      const analysis = await analyzeFinance("Hushh AI current market position, valuation, and stock sentiment", investmentLens);
      setHushhPulse(analysis);
    } catch (err) {
      console.error("Hushh Pulse fetch failed:", err);
    } finally {
      setIsPulseLoading(false);
    }
  };

  const handleAnalyze = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q) return;
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeFinance(q, investmentLens);
      setResult(analysis);
    } catch (err) {
      console.error("Finance analysis failed:", err);
      showError("Failed to analyze financial data. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight font-headline">Hushh Market Intelligence</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Strategic analysis of the Personal Data Economy and Hushh AI's financial trajectory.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {trendNotification && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={cn(
                  "px-4 py-2 rounded-xl border flex items-center gap-2 shadow-lg backdrop-blur-md",
                  trendNotification.type === 'up' 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : trendNotification.type === 'down'
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "bg-secondary/10 border-secondary/30 text-secondary"
                )}
              >
                <span className="material-symbols-outlined text-sm">
                  {trendNotification.type === 'up' ? 'trending_up' : 
                   trendNotification.type === 'down' ? 'trending_down' : 'notifications_active'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{trendNotification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Market: Private</span>
          </div>
          <button 
            onClick={() => setIsAutonomousMode(!isAutonomousMode)}
            className={cn(
              "px-4 py-2 rounded-xl border flex items-center gap-2 transition-all group relative overflow-hidden",
              isAutonomousMode 
                ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" 
                : "bg-surface-container-highest/20 border-outline-variant/20 grayscale hover:grayscale-0 hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              isAutonomousMode ? "bg-primary animate-pulse" : "bg-gray-600"
            )} />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest transition-colors",
              isAutonomousMode ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
            )}>
              {isAutonomousMode ? `Autonomous Pilot: ${investmentLens}` : "Dashboard Mode"}
            </span>
          </button>
          <div className="px-4 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 flex items-center gap-2">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sector: AI Privacy</span>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {executionMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Autonomous Execution Layer</p>
                <p className="text-sm font-medium text-white">{executionMessage}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-[10px] font-bold text-primary uppercase animate-pulse">
                Executing Policy...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hushh Stock Pulse Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Hushh Stock Pulse
          </h2>
          <button 
            onClick={fetchHushhPulse}
            disabled={isPulseLoading}
            className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
          >
            {isPulseLoading ? "Refreshing..." : "Refresh Pulse"}
            <Activity className={cn("w-3 h-3", isPulseLoading && "animate-pulse")} />
          </button>
        </div>

        {hushhPulse ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-3 mica-effect border border-primary/20 rounded-3xl p-8 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <TrendingUp className="w-32 h-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estimated Valuation</p>
                  <p className="text-4xl font-black text-primary tracking-tighter">{hushhPulse.valuation}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+18.5% Growth</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Sentiment</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-secondary flex items-center justify-center">
                      <span className="text-sm font-bold text-secondary">A+</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{hushhPulse.marketSentiment}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Bullish Outlook</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Funding Stage</p>
                  <div className="px-4 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 inline-block">
                    <p className="text-sm font-bold text-white">{hushhPulse.status}</p>
                  </div>
                  <p className="text-[10px] text-gray-400">Next Round: Series B Expected Q4</p>
                </div>
              </div>

              <div className="mt-12 h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hushhPulse.performanceData}>
                    <defs>
                      <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D2FF00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D2FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="period" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#D2FF00' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#D2FF00" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#pulseGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <div className="space-y-6">
              <div className="mica-effect border border-outline-variant/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Key Drivers
                </h3>
                <div className="space-y-2">
                  {hushhPulse.keyDrivers.slice(0, 3).map((driver: string, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-container-highest/20 border border-outline-variant/5 text-xs text-gray-300">
                      {driver}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mica-effect border border-outline-variant/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Market Share
                </h3>
                <div className="flex items-end gap-1 h-12">
                  {[40, 65, 45, 90, 55, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm group-hover:bg-secondary transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 text-center uppercase">Privacy AI Sector Dominance</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 mica-effect border border-outline-variant/10 rounded-3xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-xs text-gray-500 uppercase tracking-widest">Synchronizing Hushh Market Data...</p>
            </div>
          </div>
        )}
      </section>

      {/* Market Share: AI Privacy Sector Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold font-headline">AI Privacy Sector Analysis</h2>
        </div>
        
        <div className="mica-effect border border-outline-variant/10 rounded-3xl p-8 bg-gradient-to-br from-secondary/5 to-transparent">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={[
                  { name: 'Hushh', share: 45 },
                  { name: 'Hushh Competitor A', share: 30 },
                  { name: 'Hushh Competitor B', share: 25 },
                ]}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                onClick={(data) => {
                  if (data && data.activeLabel) {
                    setSelectedSectorCompany(data.activeLabel);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}%`}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="share" 
                  radius={[4, 4, 0, 0]} 
                  barSize={60}
                  className="cursor-pointer"
                >
                  {[
                    { name: 'Hushh', share: 45 },
                    { name: 'Hushh Competitor A', share: 30 },
                    { name: 'Hushh Competitor B', share: 25 },
                  ].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedSectorCompany === entry.name ? '#D2FF00' : 'rgba(210, 255, 0, 0.15)'}
                      className="transition-all duration-500"
                      stroke={selectedSectorCompany === entry.name ? '#D2FF00' : 'transparent'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AnimatePresence>
            {selectedSectorCompany && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="overflow-hidden"
              >
                <div className="mt-8 p-6 rounded-2xl bg-surface-container-highest/30 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {SECTOR_DETAILS[selectedSectorCompany]?.name}
                        <motion.span 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={selectedSectorCompany}
                          className="text-[10px] font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 uppercase tracking-widest"
                        >
                          {SECTOR_DETAILS[selectedSectorCompany]?.share} Selection
                        </motion.span>
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{SECTOR_DETAILS[selectedSectorCompany]?.marketPosition}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedSectorCompany(null)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                      title="Clear Selection"
                    >
                      <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mt-6 pt-6 border-t border-outline-variant/10">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Strategic Pulse
                      </h4>
                      <div className="space-y-2">
                        {SECTOR_DETAILS[selectedSectorCompany]?.drivers.map((driver: string, i: number) => (
                          <motion.div 
                            key={`${selectedSectorCompany}-driver-${i}`}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-xs text-gray-300 p-3 rounded-xl bg-black/40 border border-primary/10 flex items-start gap-2 hover:bg-primary/5 transition-colors"
                          >
                            <span className="text-primary mt-1">•</span>
                            {driver}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Intelligence Feed
                      </h4>
                      <div className="space-y-2">
                        {SECTOR_DETAILS[selectedSectorCompany]?.news.map((item: any, i: number) => (
                          <motion.div 
                            key={`${selectedSectorCompany}-news-${i}`}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-xs p-3 rounded-xl bg-black/40 border border-secondary/10 flex justify-between items-center group cursor-pointer hover:border-secondary/30 transition-all hover:translate-x-1"
                          >
                            <span className="text-gray-300 group-hover:text-secondary font-medium">{item.title}</span>
                            <span className="text-[10px] text-gray-600 ml-2 font-mono whitespace-nowrap">{item.date}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 p-4 rounded-2xl bg-surface-container-highest/20 border border-outline-variant/5">
            <p className="text-xs text-center text-gray-400">
              <span className="font-bold text-primary uppercase tracking-widest text-[10px] mr-2">Market Intelligence:</span> 
              Hushh maintains a commanding 45% lead in the AI privacy sector, outperforming competitors through superior on-device processing and the Luthier personalization engine.
            </p>
          </div>
        </div>
      </motion.section>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
        <div className="relative mica-effect border border-outline-variant/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center bg-surface-container-low/40">
          <div className="flex-1 w-full relative flex gap-2">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                isAnalyzing ? "text-primary animate-pulse" : "text-gray-500"
              )} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? "Listening to your request..." : "Deep scan market data, founder rounds, or sector analysis..."}
                className={cn(
                  "w-full bg-black/40 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm",
                  isListening && "border-primary/50 ring-2 ring-primary/20",
                  isAnalyzing && "cursor-wait opacity-80"
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={isAnalyzing}
              />
              {isAnalyzing && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Scanning Neural Net...</span>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleListening}
              disabled={isAnalyzing}
              className={cn(
                "p-4 rounded-xl transition-all flex items-center justify-center border group/mic relative overflow-hidden",
                isListening 
                  ? "bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  : "bg-surface-container-highest/50 border-outline-variant/10 text-gray-400 hover:text-primary hover:border-primary/30"
              )}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="mic-off"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <MicOff className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic-on"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Mic className="w-5 h-5 group-hover/mic:scale-110 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500"
                />
              )}
            </button>
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !query.trim()}
            className={cn(
              "w-full md:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:grayscale text-black font-bold px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] active:scale-95 group",
              isAnalyzing && "animate-pulse"
            )}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Analyze Intent
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stats & Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 mica-effect border border-outline-variant/10 rounded-2xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-headline">{result.company}</h2>
                  <p className="text-sm text-gray-500">Market Interest & Growth Index</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-mono font-bold text-primary">{result.valuation}</p>
                  <div className="flex items-center justify-end gap-1 text-primary text-xs font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+12.4% (Est. YoY)</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D2FF00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D2FF00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}M`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#D2FF00' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#D2FF00" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Snapshot & Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mica-effect border border-outline-variant/10 rounded-2xl p-6 space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Funding Status
                </h3>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xl font-bold text-white">{result.status}</p>
                  <p className="text-xs text-gray-400 mt-1">Next Expected: Series B (Q4 2026)</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Growth Drivers
                </h3>
                <div className="space-y-3">
                  {result.keyDrivers.map((driver: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-highest/30 border border-outline-variant/5">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      <span className="text-sm text-gray-300">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 mica-effect border border-primary/20 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                Strategic Summary
              </h2>
              <p className="text-gray-300 leading-relaxed font-body">
                {result.summary}
              </p>
            </motion.div>

            {/* News & Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mica-effect border border-outline-variant/10 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Info className="text-gray-400 w-5 h-5" />
                Market Intelligence
              </h2>
              <div className="space-y-4">
                {result.news.map((item: any, i: number) => (
                  <a 
                    key={i} 
                    href={item.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group block p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-outline-variant/10"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm text-gray-300 group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                      <span className="text-[10px] text-gray-600 uppercase whitespace-nowrap mt-1">{item.date}</span>
                    </div>
                  </a>
                ))}
              </div>
              <button className="w-full py-3 text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 border-t border-outline-variant/5 mt-4">
                Deep dive on kai.hushh.ai <ExternalLink className="w-3 h-3" />
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {!result && !isAnalyzing && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "Hushh Series A funding details",
              "Personal Data Economy market size 2026",
              "Hushh vs competitors in AI privacy"
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  handleAnalyze(suggestion);
                }}
                className="p-6 mica-effect border border-outline-variant/10 rounded-2xl text-left hover:border-primary/40 transition-all group"
              >
                <p className="text-sm text-gray-400 group-hover:text-white transition-colors">{suggestion}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Run Analysis <ArrowUpRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>

          {dailyAlerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">notifications_active</span>
                Daily Market Alerts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailyAlerts.map((alert, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-surface-container-highest/20 border border-outline-variant/10 hover:border-secondary/30 transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="material-symbols-outlined text-secondary text-sm">{alert.icon}</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Just Now</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">{alert.title}</h4>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{alert.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
