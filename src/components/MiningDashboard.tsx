import React from "react";
import { useCrypto } from "../store/cryptoStore";
import { Cpu, DollarSign, Loader2, Play, Sparkles, TrendingUp } from "lucide-react";

export const MiningDashboard: React.FC = () => {
  const { activeUser, miningHardware, buyMiningRig, claimMiningRewards } = useCrypto();

  const handleActivateRig = async (rigId: string) => {
    await buyMiningRig(rigId);
  };

  const totalAccumulated = miningHardware.reduce((sum, rig) => sum + rig.accumulated, 0);
  const activeRate = miningHardware
    .filter(r => r.active)
    .reduce((sum, rig) => sum + rig.rewardPerSec, 0);

  return (
    <div id="mining-dashboard-wrapper" className="space-y-6 font-sans">
      {/* HEADER HUD METERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Accumulation Monitor */}
        <div className="bg-gradient-to-tr from-amber-950/20 via-slate-900/80 to-slate-900/60 border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Accumulated Yield
            </span>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide animate-pulse">
              Active Unclaimed
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              ${totalAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase">USDT Value Pending Claim</p>
          </div>
          <button
            onClick={claimMiningRewards}
            disabled={totalAccumulated <= 0}
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-sans text-xs active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-center"
          >
            Transfer Rewards to Wallet Portfolio
          </button>
        </div>

        {/* Global speed meter */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Hashing Feed Rate
            </span>
            <Cpu className="text-amber-500 w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-white">
              {miningHardware.filter(r => r.active).length > 0 ? (
                <span>
                  {miningHardware
                    .filter(r => r.active)
                    .map(r => r.hashRate)
                    .join(" + ")}
                </span>
              ) : (
                "0 H/s (OFFLINE)"
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase">Current Active Mining Clusters</p>
          </div>
        </div>

        {/* Dynamic estimated yields */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Clustered Payout Flow
            </span>
            <TrendingUp className="text-emerald-500 w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold font-sans text-white">
              ${(activeRate * 60).toFixed(2)} USDT / Min
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase">
              ≈ ${(activeRate * 3600).toFixed(2)} USDT / Hour Estimations
            </p>
          </div>
        </div>

      </div>

      {/* CLOUD MINERS FLEET SHEETS */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <h2 className="text-base font-sans font-semibold text-white mb-6">
          Nexus Cloud Hardware Infrastructure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {miningHardware.map(rig => {
            return (
              <div
                key={rig.id}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-[360px] relative overflow-hidden ${
                  rig.active
                    ? "bg-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/5"
                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                }`}
              >
                {/* Decorative glows if rig gets activated */}
                {rig.active && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none animate-pulse"></div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-500">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      {rig.active ? (
                        <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 animate-pulse inline-block">
                          ONLINE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold uppercase bg-slate-900 text-slate-500 border border-slate-800 rounded px-1.5 py-0.5 inline-block">
                          STANDARD
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-sans font-semibold text-white text-sm tracking-tight mb-1">
                    {rig.name}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-2">
                    HASH RATE: <span className="text-white">{rig.hashRate}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    SPEED REWARD: <span className="text-white">${rig.rewardPerSec.toFixed(2)} USDT/s</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {rig.active ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>SOLVING BLOCK CRYPT...</span>
                        <span>{rig.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-900 border border-slate-800/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${rig.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between pt-1">
                        <span>UNCLAIMED PROTOCOL:</span>
                        <span>${rig.accumulated.toFixed(4)} USDT</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Hardware Activation Price</div>
                      <div className="text-base font-bold text-white flex items-center">
                        <DollarSign className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        {rig.cost.toLocaleString()} USDT
                      </div>
                    </div>
                  )}

                  {!rig.active ? (
                    <button
                      onClick={() => handleActivateRig(rig.id)}
                      disabled={(activeUser?.balance ?? 0) < rig.cost}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-white font-sans font-bold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Provision Cluster Rig</span>
                    </button>
                  ) : (
                    <div className="flex justify-center items-center gap-2 py-3 bg-slate-900/40 border border-slate-900 rounded-xl text-slate-400 text-xs">
                      <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span className="font-mono tracking-wider text-[10px] uppercase">Node running...</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
