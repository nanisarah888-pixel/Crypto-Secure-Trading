import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { TradeType, TradeStatus } from "../types";
import { TrendingUp, TrendingDown, Clock, Zap, DollarSign, ListCollapse } from "lucide-react";

interface TradePanelProps {
  selectedCoin: string; // e.g. "BTC"
  setSelectedCoin: (coin: string) => void;
}

const TIMEFRAMES = [
  { id: "60s", label: "60 Seconds", range: "$100 – $1,000", min: 100, max: 1000 },
  { id: "120s", label: "120 Seconds", range: "$5,000 – $10,000", min: 5000, max: 10000 },
  { id: "1h", label: "1 Hour (Sim)", range: "$15,000 – $45,000", min: 15000, max: 45000 },
  { id: "7d", label: "7 Days (Sim)", range: "$50,000 – $100,000", min: 50000, max: 100000 }
];

export const TradePanel: React.FC<TradePanelProps> = ({ selectedCoin, setSelectedCoin }) => {
  const { coins, activeUser, placeTrade, trades } = useCrypto();
  const [timeFrame, setTimeFrame] = useState("60s");
  const [amount, setAmount] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const selectedCoinObj = coins.find(c => c.symbol === selectedCoin) || coins[0];
  const activeTimeframe = TIMEFRAMES.find(t => t.id === timeFrame) || TIMEFRAMES[0];

  const handlePlaceTrade = async (type: TradeType) => {
    if (!activeUser) return;
    
    if (amount < activeTimeframe.min || amount > activeTimeframe.max) {
      alert(`Min investment for ${timeFrame} is $${activeTimeframe.min} and max is $${activeTimeframe.max}.`);
      return;
    }

    if (amount > activeUser.balance) {
      alert("Insufficient account balance to place trade.");
      return;
    }

    setSubmitting(true);
    try {
      const assetString = `${selectedCoin}/USDT`;
      const success = await placeTrade(assetString, type, amount, timeFrame);
      if (success) {
        // Reset to minimum
        const nextTimeframeId = timeFrame;
        const matched = TIMEFRAMES.find(t => t.id === nextTimeframeId);
        setAmount(matched ? matched.min : 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format remaining time
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Resolving...";
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const userActiveTrades = trades.filter(t => t.userId === activeUser?.uid);

  return (
    <div id="trade-panel-wrapper" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT & CENTER: ACTIVE TRADING ENGINE SHIFT */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h2 className="text-base font-sans font-semibold text-white mb-5 flex items-center gap-2">
            <Zap className="text-cyan-400 w-5 h-5" />
            <span>Select Trading Target Asset</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {coins.map(coin => {
              const isSelected = selectedCoin === coin.symbol;
              return (
                <button
                  key={coin.symbol}
                  id={`coin_btn_${coin.symbol}`}
                  onClick={() => setSelectedCoin(coin.symbol)}
                  className={`flex flex-col items-start p-4 rounded-xl transition-all duration-200 border text-left ${
                    isSelected
                      ? "bg-slate-950 border-cyan-500 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{coin.icon}</span>
                    <span className="font-sans font-bold text-white text-sm">{coin.symbol}</span>
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-300 mt-2">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </div>
                  <div className={`text-[10px] font-mono font-semibold mt-1 ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* INPUT AND TRIGGER FIELD */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <h2 className="text-base font-sans font-semibold text-white mb-5 flex items-center gap-2">
            <Clock className="text-cyan-400 w-5 h-5" />
            <span>Position Expiry Time Frame</span>
          </h2>

          {/* Expiring selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
            {TIMEFRAMES.map(tf => {
              const isActive = timeFrame === tf.id;
              return (
                <button
                  key={tf.id}
                  id={`tf_btn_${tf.id}`}
                  onClick={() => {
                    setTimeFrame(tf.id);
                    setAmount(tf.min); // auto-snap to range minimum
                  }}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? "bg-slate-950 border-cyan-500 text-cyan-400"
                      : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="text-xs font-sans font-bold text-white leading-none mb-1">{tf.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium">Range: {tf.range}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Simulated Investment Amount (USDT)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-3 text-slate-500 pointer-events-none">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  min={activeTimeframe.min}
                  max={activeTimeframe.max}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="text-[10px] mt-1.5 font-mono text-slate-500">
                SNAP HELPER:{" "}
                <button onClick={() => setAmount(activeTimeframe.min)} className="hover:text-cyan-400 hover:underline">MIN</button>
                {" // "}
                <button onClick={() => setAmount(Math.round((activeTimeframe.min + activeTimeframe.max) / 2))} className="hover:text-cyan-400 hover:underline">MED</button>
                {" // "}
                <button onClick={() => setAmount(activeTimeframe.max)} className="hover:text-cyan-400 hover:underline">MAX</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                id="trade_buy_btn"
                onClick={() => handlePlaceTrade(TradeType.BUY)}
                disabled={submitting || (activeUser?.balance ?? 0) < amount}
                className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all duration-200 text-white font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                <TrendingUp className="w-5 h-5" />
                <span>BUY / CALL</span>
              </button>

              <button
                id="trade_sell_btn"
                onClick={() => handlePlaceTrade(TradeType.SELL)}
                disabled={submitting || (activeUser?.balance ?? 0) < amount}
                className="w-full h-14 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 transition-all duration-200 text-white font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                <TrendingDown className="w-5 h-5" />
                <span>SELL / PUT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: LIVE POSITIONS MONITOR */}
      <div className="space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl min-h-[350px] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-sans font-semibold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <ListCollapse className="text-cyan-400 w-5 h-5" />
              <span>Active Micro-Positions</span>
            </h2>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {userActiveTrades.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs leading-relaxed font-sans">
                  No active trade positions launched.<br />Launch BUY or SELL positions to stream real-time results.
                </div>
              ) : (
                userActiveTrades.map(trade => {
                  const isClosed = trade.status !== TradeStatus.OPEN;
                  const isProfit = trade.status === TradeStatus.PROFIT;
                  return (
                    <div
                      key={trade.id}
                      className={`p-3.5 rounded-xl border font-sans uppercase transition-all duration-200 ${
                        isClosed
                          ? isProfit
                            ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-950/10 border-rose-500/20 text-rose-400"
                          : "bg-slate-950 border-slate-800/80 text-white"
                      }`}
                    >
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          {trade.type === TradeType.BUY ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          {trade.asset}
                        </span>
                        <span className="font-mono">${trade.amount} USDT</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mt-2.5">
                        <div>
                          ENTRY: <span className="text-slate-200">${trade.entryPrice.toFixed(2)}</span>
                        </div>
                        {isClosed ? (
                          <div className="text-right">
                            EXIT: <span className="text-slate-200">${trade.exitPrice?.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="text-right flex items-center justify-end gap-1 text-cyan-400">
                            <Clock className="w-3 h-3 animate-spin" />
                            {formatTime(trade.timeRemaining)}
                          </div>
                        )}
                      </div>

                      {isClosed && (
                        <div className="mt-2 text-right text-xs font-bold font-sans">
                          {isProfit ? `WON (+85% payout)` : `LOST (-$${trade.amount})`}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] font-mono text-slate-500 leading-relaxed">
            * Options trading is simulated in intervals. Locked balances return +85% profit ratio upon successful trend anticipation.
          </div>
        </div>
      </div>
    </div>
  );
};
