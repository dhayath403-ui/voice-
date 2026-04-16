import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Search, DollarSign, BarChart3, Info, ExternalLink, FileText, AlertCircle, ArrowUpRight, Globe, Shield, Cpu, Activity, PieChart, Briefcase, Mic, MicOff } from 'lucide-react';
import { analyzeFinance } from '../services/geminiService';
import { useSettings } from '../context/SettingsContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { cn } from '../lib/utils';

export const FinanceView: React.FC = () => {
  const { userLanguage } = useSettings();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hushhPulse, setHushhPulse] = useState<any>(null);
  const [isPulseLoading, setIsPulseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
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
          setError(`Voice input error: ${event.error}`);
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
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
        setError("Could not start voice input. Please check microphone permissions.");
      }
    }
  };

  useEffect(() => {
    fetchHushhPulse();
  }, []);

  const [trendNotification, setTrendNotification] = useState<{ type: 'up' | 'down', message: string } | null>(null);

  useEffect(() => {
    if (hushhPulse?.performanceData && hushhPulse.performanceData.length >= 2) {
      const data = hushhPulse.performanceData;
      const last = data[data.length - 1].value;
      const prev = data[data.length - 2].value;
      
      if (last > prev) {
        setTrendNotification({ type: 'up', message: 'Hushh Pulse is trending upwards! Market momentum is increasing.' });
      } else if (last < prev) {
        setTrendNotification({ type: 'down', message: 'Hushh Pulse is showing a slight dip. Market correction in progress.' });
      }
      
      const timer = setTimeout(() => setTrendNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [hushhPulse]);

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
      const analysis = await analyzeFinance("Hushh AI current market position, valuation, and stock sentiment");
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
    setError(null);
    
    try {
      const analysis = await analyzeFinance(q);
      setResult(analysis);
    } catch (err) {
      console.error("Finance analysis failed:", err);
      setError("Failed to analyze financial data. Please try again.");
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
                    : "bg-red-500/10 border-red-500/30 text-red-500"
                )}
              >
                <span className="material-symbols-outlined text-sm">
                  {trendNotification.type === 'up' ? 'trending_up' : 'trending_down'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{trendNotification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Market: Private</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 flex items-center gap-2">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sector: AI Privacy</span>
          </div>
        </div>
      </header>

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

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative mica-effect border border-outline-variant/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? "Listening..." : "Query valuation, funding rounds, or market sentiment..."}
                className={cn(
                  "w-full bg-black/20 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body",
                  isListening && "border-primary/50 ring-2 ring-primary/20"
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <button
              onClick={toggleListening}
              className={cn(
                "p-4 rounded-xl transition-all flex items-center justify-center border",
                isListening 
                  ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse" 
                  : "bg-surface-container-highest/50 border-outline-variant/10 text-gray-400 hover:text-primary hover:border-primary/30"
              )}
              title={isListening ? "Stop listening" : "Start voice query"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !query}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-bold px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            {isAnalyzing ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500"
        >
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

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
                setIsAnalyzing(true);
                setError(null);
                analyzeFinance(suggestion)
                  .then(setResult)
                  .catch((err) => {
                    console.error("Finance analysis failed:", err);
                    setError("Failed to analyze financial data. Please try again.");
                  })
                  .finally(() => setIsAnalyzing(false));
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
      )}
    </div>
  );
};
