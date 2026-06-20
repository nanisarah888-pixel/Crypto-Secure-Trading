import React from "react";
import { useCrypto } from "../store/cryptoStore";
import { LineChart, Wallet, Cpu, Users, Newspaper, Shield, Settings } from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const { activeUser } = useCrypto();

  if (!activeUser) return null;

  const navigationItems = [
    { id: "trading", label: "Trade Engine", icon: LineChart, color: "text-cyan-400 group-hover:text-cyan-300" },
    { id: "wallet", label: "Wallet Center", icon: Wallet, color: "text-emerald-400 group-hover:text-emerald-300" },
    { id: "mining", label: "Cloud Mining", icon: Cpu, color: "text-amber-400 group-hover:text-amber-300" },
    { id: "referral", label: "Referral Central", icon: Users, color: "text-purple-400 group-hover:text-purple-300" },
    { id: "news", label: "Vitals & News", icon: Newspaper, color: "text-rose-400 group-hover:text-rose-300" },
    { id: "settings", label: "Compliance Profile", icon: Settings, color: "text-slate-400 group-hover:text-slate-300" },
  ];

  const adminItem = { id: "admin", label: "Admin Control", icon: Shield, color: "text-indigo-400 group-hover:text-indigo-300" };

  return (
    <aside id="app-sidebar" className="w-80 shrink-0 bg-slate-950 border-r border-slate-900 flex flex-col justify-between py-6 min-h-[calc(100vh-80px)]">
      <div className="px-4 space-y-8">
        <div>
          <div className="px-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold mb-3">
            Navigation Drawer
          </div>
          <nav className="space-y-1.5">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`side_nav_${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-sans font-medium tracking-wide transition-all duration-200 text-left ${
                    isActive
                      ? "bg-slate-900 text-cyan-400 border border-slate-800"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {activeUser.role === UserRole.ADMIN && (
          <div>
            <div className="px-4 text-[10px] font-mono tracking-widest text-indigo-500 uppercase font-semibold mb-3">
              Administrative Command
            </div>
            <nav className="space-y-1.5">
              <button
                id="side_nav_admin"
                onClick={() => setActiveSection(adminItem.id)}
                className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-sans font-semibold tracking-wide transition-all duration-200 text-left border ${
                  activeSection === adminItem.id
                    ? "bg-indigo-950/20 text-indigo-400 border-indigo-900/60"
                    : "text-slate-400 hover:text-indigo-300 hover:bg-slate-900/40 border-transparent"
                }`}
              >
                <adminItem.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:rotate-12 ${activeSection === adminItem.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span>{adminItem.label}</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Quick stats panel at sidebar bottom */}
      <div className="px-6">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900/80 font-sans">
          <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Net Profit Ratio</div>
          <div className={`text-lg font-extrabold mt-1 tracking-tight ${activeUser.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {activeUser.profit >= 0 ? "+" : ""}${activeUser.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-sans">
            Tracks total returns from your active trades including premium yields if successful.
          </p>
        </div>
      </div>
    </aside>
  );
};
