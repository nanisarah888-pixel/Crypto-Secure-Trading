import React, { useState } from "react";
import { CryptoProvider, useCrypto } from "./store/cryptoStore";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LoginForm } from "./components/LoginForm";
import { TradingViewChart } from "./components/TradingViewChart";
import { TradePanel } from "./components/TradePanel";
import { WalletCard } from "./components/WalletCard";
import { MiningDashboard } from "./components/MiningDashboard";
import { NewsSection } from "./components/NewsSection";
import { ReferralsSection } from "./components/ReferralsSection";
import { VerificationSection } from "./components/VerificationSection";
import { AdminPanel } from "./components/AdminPanel";
import { UserRole } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const DashboardLayout: React.FC = () => {
  const { activeUser, coins } = useCrypto();
  const [activeSection, setActiveSection] = useState("trading");
  const [selectedCoin, setSelectedCoin] = useState("BTC");

  if (!activeUser) {
    return <LoginForm />;
  }

  // Fallback check to avoid admin panel lockout if they change account
  const currentSection = activeSection === "admin" && activeUser.role !== UserRole.ADMIN ? "trading" : activeSection;

  const activeCoinObj = coins.find(c => c.symbol === selectedCoin) || coins[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* Dynamic top banner warning if account is frozen */}
      {activeUser.isFrozen && (
        <div className="bg-red-500 text-white py-2 px-6 flex items-center justify-center gap-2 text-xs font-sans font-bold shadow-xl">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>ESCROW TRADING SUSPENDED: Your node identity is frozen by admin compliance inspectors.</span>
        </div>
      )}

      {/* Top Header */}
      <Navbar activeSection={currentSection} setActiveSection={setActiveSection} />

      {/* Frame wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Sidebar */}
        <Sidebar activeSection={currentSection} setActiveSection={setActiveSection} />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 space-y-6 max-h-[calc(100vh-80px)]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              
              {/* SECTION 1: TRADING VIEW ENGINE */}
              {currentSection === "trading" && (
                <div className="space-y-6">
                  {/* LIVE PRICE PANEL TICKERS HEADER */}
                  {activeCoinObj && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/20 border border-slate-900 p-5 rounded-2xl">
                      <div className="font-sans">
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">MARKET ASSET</div>
                        <div className="text-base font-extrabold text-white flex items-center gap-2 mt-1">
                          <span className="text-xl leading-none">{activeCoinObj.icon}</span>
                          <span>{activeCoinObj.name} ({activeCoinObj.symbol})</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">REALTIME PRICE</div>
                        <div className="text-base font-mono font-bold text-cyan-400 mt-1">
                          ${activeCoinObj.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">24H PRICE CHANGE</div>
                        <div className={`text-base font-mono font-bold flex items-center gap-1 mt-1 ${activeCoinObj.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {activeCoinObj.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{activeCoinObj.change24h >= 0 ? "+" : ""}{activeCoinObj.change24h.toFixed(2)}%</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">24H LIMIT BOUNDS</div>
                        <div className="text-xs font-mono text-slate-300 mt-1 space-y-0.5">
                          <div>HIGH: <span className="text-emerald-400">${activeCoinObj.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                          <div>LOW: <span className="text-red-400">${activeCoinObj.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Embed Widget Canvas */}
                  <TradingViewChart symbol={selectedCoin} />

                  {/* Operational forms panel */}
                  <TradePanel selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin} />
                </div>
              )}

              {/* SECTION 2: WALLET DEPOSITS/HISTORY */}
              {currentSection === "wallet" && <WalletCard />}

              {/* SECTION 3: REWARD CLOUD MINING */}
              {currentSection === "mining" && <MiningDashboard />}

              {/* SECTION 4: REFERRALS CODE REGISTRARS */}
              {currentSection === "referral" && <ReferralsSection />}

              {/* SECTION 5: VITALS & NEWS FEEDS */}
              {currentSection === "news" && <NewsSection />}

              {/* SECTION 6: COMPLIANCE PROFILES (KYC) */}
              {currentSection === "settings" && <VerificationSection />}

              {/* SECTION 7: ADMINISTRATIVE PORT PORTALS */}
              {currentSection === "admin" && activeUser.role === UserRole.ADMIN && <AdminPanel />}

            </motion.div>
          </AnimatePresence>
          
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CryptoProvider>
      <DashboardLayout />
    </CryptoProvider>
  );
}
