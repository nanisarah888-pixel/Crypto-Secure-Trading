import React from "react";

interface TradingViewChartProps {
  symbol: string; // e.g. "BTC" or "ETH" or "SOL"
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  // Map our symbols to standard TradingView/Binance listings
  const symbolMap: { [key: string]: string } = {
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    SOL: "BINANCE:SOLUSDT",
    DOGE: "BINANCE:DOGEUSDT"
  };

  const tvSymbol = symbolMap[symbol] || "BINANCE:BTCUSDT";

  return (
    <div id="tradingview-container" className="relative w-full h-[480px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-11 bg-slate-950/90 border-b border-slate-900 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
          <span className="text-xs font-mono font-medium text-slate-300">TV REALTIME FEED // {symbol}/USDT</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase">
          Vandermonde Engine v2.4
        </div>
      </div>
      
      {/* TradingView embedded charts inside responsive container */}
      <div className="w-full h-full pt-11">
        <iframe
          id="tradingview-widget-iframe"
          title="TradingView Live Feed"
          src={`https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&theme=dark&style=1&timezone=Exchange&studies=%5B%5D&show_popup_button=false&locale=en`}
          width="100%"
          height="100%"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
