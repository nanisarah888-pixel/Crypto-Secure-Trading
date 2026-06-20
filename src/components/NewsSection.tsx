import React from "react";
import { Award, Flame, Globe, MessageSquare, Newspaper, TrendingUp } from "lucide-react";

export const NewsSection: React.FC = () => {
  // Mock live crypto breaking news feed list
  const breakingNews = [
    {
      id: "news_1",
      title: "U.S. Security regulators approve standard listings of spot Ethereum funds following record volumes",
      source: "CryptoPanic Ledger",
      time: "10 mins ago",
      impact: "HIGHLY BULLISH",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      content: "Institutional players are accelerating portfolio distribution plans as Spot ETFs list on major stock exchanges. Net capital entries are estimated above $1.4B in the initial 48-hour clearance cycles."
    },
    {
      id: "news_2",
      title: "Bitcoin (BTC) protocol difficulty adjustments soar 4.8% as hash-speed registers historical levels",
      source: "Nexus Bloomberg",
      time: "1 hour ago",
      impact: "STABLE GROWTH",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      content: "Node operators are ramping up capital expenditures as global ASICs connect to the network. Network protection levels now operate at an all-time high of 640 Exahashes per second."
    },
    {
      id: "news_3",
      title: "Solana core developers push network optimization updates to patch validation bottlenecks",
      source: "CoinTelegraph Feed",
      time: "3 hours ago",
      impact: "VOLATILE",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      content: "The v1.18.15 consensus engine is currently deployed across 85% of active mainnet validators. Early metrics show a 3x increase in parallel transaction processing speed."
    },
    {
      id: "news_4",
      title: "Whale transaction alert registers $120M DOGE movement following technical double-bottom patterns",
      source: "WhaleAlert Sentinel",
      time: "5 hours ago",
      impact: "BULLISH BREAKOUT",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      content: "An ancient dogecoins ledger wallet moved 850,000,000 DOGE directly onto spot liquidity vaults. Analysis teams point to high accumulator support levels near $0.134."
    }
  ];

  return (
    <div id="vitals-news-wrapper" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* LEFT: LIVE BREAKING NEWS LIST */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
            <Newspaper className="text-cyan-400 w-5 h-5 animate-pulse" />
            <h2 className="text-base font-sans font-semibold text-white">Dynamic Cryptosphere Terminal Vitals</h2>
          </div>

          <div className="space-y-6">
            {breakingNews.map(news => (
              <div key={news.id} className="p-4 rounded-xl bg-slate-950 border border-slate-900/80 hover:border-slate-800 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`text-[9px] font-mono font-bold uppercase rounded-md px-1.5 py-0.5 border ${news.color}`}>
                      {news.impact}
                    </span>
                    <h3 className="text-sm font-sans font-bold text-white mt-2 mb-1.5 tracking-tight leading-snug">
                      {news.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5">
                  {news.content}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-3 pt-3 border-t border-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {news.source}
                  </span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: CRYPTO VITALS ANALYTICS & SENTIMENT */}
      <div className="space-y-6">
        
        {/* Market sentiment card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-sans font-bold text-slate-300 uppercase tracking-wider mb-4">
            Fear &amp; Greed Heat Index
          </h3>
          <div className="flex flex-col items-center py-4 bg-slate-950 border border-slate-900 rounded-xl">
            {/* Sentiment Meter Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="url(#sentiment_grad)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8" // 75% fill
                />
                <defs>
                  <linearGradient id="sentiment_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center font-sans">
                <span className="text-3xl font-black text-white">74</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">GREED</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono uppercase text-center max-w-[180px] leading-relaxed">
              Platform sentiment registers high greed indexes, favoring asset support ranges.
            </div>
          </div>
        </div>

        {/* Global Market Stats */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-sans font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Network Dominance
          </h3>
          <div className="space-y-4">
            
            {/* BTC Dom */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between text-xs text-slate-300">
                <span>BTC DOMINANCE</span>
                <span className="font-mono text-white">55.8%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full h-full" style={{ width: "55.8%" }}></div>
              </div>
            </div>

            {/* ETH Dom */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between text-xs text-slate-300">
                <span>ETH DOMINANCE</span>
                <span className="font-mono text-white">18.4%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full h-full" style={{ width: "18.4%" }}></div>
              </div>
            </div>

            {/* Other Dom */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between text-xs text-slate-300">
                <span>SOL &amp; MEMES DOMINANCE</span>
                <span className="font-mono text-white">25.8%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full h-full" style={{ width: "25.8%" }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
