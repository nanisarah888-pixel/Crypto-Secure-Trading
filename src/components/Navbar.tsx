import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { Bell, LogOut, Shield, User, Wallet, DollarSign, CheckCircle } from "lucide-react";
import { UserRole } from "../types";

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const { activeUser, logout, notifications, markNotificationsAsRead } = useCrypto();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.userId === activeUser?.uid && !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  if (!activeUser) return null;

  return (
    <nav id="app-navbar" className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="font-sans font-bold text-lg text-white">X</span>
        </div>
        <div>
          <span className="font-sans font-extrabold text-lg tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            NEXUS<span className="font-light text-cyan-400">TRADE</span>
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 uppercase tracking-widest leading-none mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            Server Live
          </div>
        </div>
      </div>

      {/* Main Stats, Notifications and User Profile */}
      <div className="flex items-center gap-4">
        {/* Wallet Portfolios */}
        <div className="hidden md:flex items-center gap-6 bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 hover:border-slate-700/80 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">AVAILABLE</div>
              <div className="text-sm font-sans font-semibold text-white">
                ${activeUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="border-l border-slate-800 h-8"></div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono tracking-wider">LOCKED</div>
              <div className="text-sm font-sans font-semibold text-white">
                ${activeUser.lockedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            id="notif_bell_btn"
            onClick={handleNotificationClick}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200 relative"
          >
            <Bell className="w-5 h-5 pointer-events-none" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold font-sans border-2 border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <span className="font-sans font-semibold text-white text-sm">System Logs & Orders</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 rounded-md px-2 py-0.5 font-bold font-mono">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 py-1 scrollbar-thin">
                {notifications.filter(n => n.userId === activeUser.uid).length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No matching activity logs recorded yet.
                  </div>
                ) : (
                  notifications
                    .filter(n => n.userId === activeUser.uid)
                    .map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border text-xs transition-colors duration-200 ${
                          notif.read ? "bg-slate-900/30 border-slate-900/60" : "bg-cyan-950/10 border-cyan-800/30 font-medium"
                        }`}
                      >
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span className="uppercase text-cyan-400">{notif.type}</span>
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-sans">{notif.message}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-sans font-semibold text-white max-w-[150px] truncate leading-tight">
              {activeUser.email}
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {activeUser.role === UserRole.ADMIN ? (
                <span className="text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md px-1.5 py-0.2 uppercase">
                  Compliance Admin
                </span>
              ) : (
                <span className="text-[9px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md px-1.5 py-0.2 uppercase">
                  Active Trader
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setActiveSection("settings")}
            className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-white transition-all duration-200"
          >
            {activeUser.role === UserRole.ADMIN ? <Shield className="w-5 h-5 text-indigo-400" /> : <User className="w-5 h-5 text-cyan-400" />}
          </button>

          {/* Logout button */}
          <button
            id="logout_btn"
            onClick={logout}
            title="Sign Out"
            className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 hover:border-red-500/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
