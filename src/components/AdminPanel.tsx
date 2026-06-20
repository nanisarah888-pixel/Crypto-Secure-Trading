import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { KYCStatus, UserRole, TransactionStatus } from "../types";
import { ShieldCheck, ShieldAlert, Users, Award, AlertCircle, RefreshCw, Layers, DollarSign, Ban, Unlock, Edit, Check, X, ShieldX } from "lucide-react";

export const AdminPanel: React.FC = () => {
  const {
    users,
    wallets,
    transactions,
    adminLogs,
    updateKYCStatus,
    toggleFreezeUser,
    adjustUserBalance,
    approveWithdrawal,
    rejectWithdrawal,
    approveDeposit,
    rejectDeposit
  } = useCrypto();

  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState("1000");
  const [selectedAsset, setSelectedAsset] = useState("USDT");

  // Filter pending transactions (both withdrawals and deposits)
  const pendingTX = transactions.filter(t => t.status === TransactionStatus.PENDING && (t.type === "withdraw" || t.type === "deposit"));

  // Admin KPI Calculations
  const totalUsers = users.length;
  const totalPlatformUSD = users.reduce((sum, u) => sum + u.balance, 0);
  const activePendingTXCount = pendingTX.length;
  const logsCount = adminLogs.length;

  const handleAdjustBalanceSubmit = (userId: string) => {
    const val = parseFloat(newBalance);
    if (isNaN(val) || val < 0) {
      alert("Invalid balance adjustment quantity.");
      return;
    }
    adjustUserBalance(userId, val, selectedAsset);
    setAdjustUserId(null);
    alert(`Success: Overwrote User's ${selectedAsset} Balance value to ${val}`);
  };

  return (
    <div id="admin-panel-wrapper" className="space-y-8 font-sans">
      
      {/* SECTION 1: SYSTEM KPI METERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="p-5 bg-indigo-950/20 border border-indigo-900/45 rounded-2xl">
          <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Users Registered
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{totalUsers} Nodes</div>
          <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Multi-role Registry active</div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Platform Reserves
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">
            ${totalPlatformUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Total aggregated USD liquidity</div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Pending Operations
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">{activePendingTXCount} Requests</div>
          <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Awaiting verification triage</div>
        </div>

        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" /> Compliance Audit Trail
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{logsCount} Action Logs</div>
          <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">Chronological admin records</div>
        </div>

      </div>

      {/* SECTION 2: COMPLIANCE OPERATION CONTROL */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="text-amber-500 w-5 h-5 animate-pulse" />
          <span>Pending Operations Control (Deposits &amp; Withdrawals)</span>
        </h2>

        {pendingTX.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No pending transaction requests awaiting appraisal on-chain.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTX.map(tx => {
              const targetUser = users.find(u => u.uid === tx.userId);
              const isDeposit = tx.type === "deposit";
              return (
                <div key={tx.id} className="p-4 bg-slate-950 border border-slate-900/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{targetUser?.email || "Unknown User"}</span>
                      <span className="text-[9px] font-mono uppercase bg-slate-900 text-slate-400 rounded-md px-1.5 py-0.2">
                        ID: {tx.userId.substring(0, 10)}...
                      </span>
                      <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.2 rounded ${
                        isDeposit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {isDeposit ? "DEPOSIT COIN" : "DISPATCH COIN"}: <span className="text-slate-300 font-semibold">{tx.coin}</span>
                      {" // "}
                      {tx.address && (
                        <>
                          ADDRESS: <span className="text-slate-300 font-mono italic select-all">{tx.address}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-slate-900/60 pt-3 sm:pt-0">
                    <div className="text-right">
                      <div className={`text-sm font-black ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isDeposit ? "+" : "-"}{tx.amount} {tx.coin}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => isDeposit ? approveDeposit(tx.id) : approveWithdrawal(tx.id)}
                        className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                        title="Approve &amp; Broadcast"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => isDeposit ? rejectDeposit(tx.id) : rejectWithdrawal(tx.id)}
                        className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        title="Reject &amp; Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: SYSTEM USERS CONTROL LIST */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider mb-5">
          User Nodes Database Registrar
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono tracking-wider uppercase">
                <th className="pb-3 px-3">Email Address / Role</th>
                <th className="pb-3 px-3 text-right">USDT Portfolio</th>
                <th className="pb-3 px-3">KYC Status</th>
                <th className="pb-3 px-3">Registry Block</th>
                <th className="pb-3 px-3 text-right">Actions Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {users.map(u => {
                const isUserAdmin = u.role === UserRole.ADMIN;
                const isCurrentlyFrozen = u.isFrozen;
                const isAdjusting = adjustUserId === u.uid;

                return (
                  <tr key={u.uid} className="hover:bg-slate-900/10 transition-colors">
                    {/* ENHANCED NAME / EMAIL */}
                    <td className="py-4 px-3">
                      <div className="font-bold text-white">{u.email}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono">
                        <span className="text-slate-500 uppercase">UID: {u.uid}</span>
                        {" // "}
                        <span className={isUserAdmin ? "text-indigo-400 font-bold" : "text-cyan-400"}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* DYNAMIC BALANCE */}
                    <td className="py-4 px-3 text-right font-mono font-bold text-white">
                      ${u.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* KYC LABELS */}
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide inline-block border ${
                        u.kycStatus === KYCStatus.VERIFIED
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : u.kycStatus === KYCStatus.PENDING
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : u.kycStatus === KYCStatus.REJECTED
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-slate-900 text-slate-500 border-slate-800"
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>

                    {/* BLOCK STATUS */}
                    <td className="py-4 px-3">
                      <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold ${
                        isCurrentlyFrozen ? "text-red-400" : "text-emerald-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                          isCurrentlyFrozen ? "bg-red-500" : "bg-emerald-500"
                        }`}></span>
                        {isCurrentlyFrozen ? "Blocked" : "Active"}
                      </span>
                    </td>

                    {/* ACTIONS FIELD */}
                    <td className="py-4 px-3 text-right space-y-2">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Adjust balance inline toggle */}
                        <button
                          onClick={() => {
                            if (isAdjusting) {
                              setAdjustUserId(null);
                            } else {
                              setAdjustUserId(u.uid);
                              setNewBalance(u.balance.toString());
                            }
                          }}
                          className="p-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit className="w-3 h-3 text-cyan-400" />
                          <span>Adjust Balance</span>
                        </button>

                        {/* Freeze accounts toggle */}
                        {!isUserAdmin && (
                          <button
                            onClick={() => toggleFreezeUser(u.uid)}
                            className={`p-1 px-2.5 rounded text-xs transition-colors flex items-center gap-1 border ${
                              isCurrentlyFrozen 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-950"
                            }`}
                          >
                            {isCurrentlyFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            <span>{isCurrentlyFrozen ? "Unlock" : "Freeze"}</span>
                          </button>
                        )}

                        {/* KYC review toggles */}
                        {u.kycStatus === KYCStatus.PENDING && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateKYCStatus(u.uid, KYCStatus.VERIFIED)}
                              className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500 hover:text-white"
                              title="Approve KYC Profile"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateKYCStatus(u.uid, KYCStatus.REJECTED)}
                              className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500 hover:text-white"
                              title="Reject KYC Profile"
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Expandable Adjust form */}
                      {isAdjusting && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 mt-2 text-left space-y-3 flex flex-col font-sans animate-in slide-in-from-top-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            Overwrite Wallet Ledger Balance
                          </label>
                          <div className="flex gap-2 items-center">
                            <select
                              value={selectedAsset}
                              onChange={(e) => setSelectedAsset(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="USDT">USDT (USD)</option>
                              <option value="BTC">BTC</option>
                              <option value="ETH">ETH</option>
                              <option value="SOL">SOL</option>
                              <option value="DOGE">DOGE</option>
                            </select>
                            <input
                              type="number"
                              value={newBalance}
                              onChange={(e) => setNewBalance(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleAdjustBalanceSubmit(u.uid)}
                              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded text-xs shrink-0"
                            >
                              Save Overwrite
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: CHRONOLOGICAL AUDIT ACTION TRAIL */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="text-purple-400 w-4 h-4" />
            <span>Administrative Audit Activity Log</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
            Live Stream Connected
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {adminLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No compliance or administrative logs recorded on standard registers.
            </div>
          ) : (
            adminLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span className="uppercase text-purple-400 font-bold">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-300 mt-1 leading-relaxed">
                  {log.details}
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  OPERATOR // {log.adminEmail}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
