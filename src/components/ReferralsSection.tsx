import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { Award, Copy, CheckCircle, Users, ArrowRightLeft, Gift, UserPlus } from "lucide-react";

export const ReferralsSection: React.FC = () => {
  const { activeUser, referrals, addReferral } = useCrypto();
  const [friendEmail, setFriendEmail] = useState("");
  const [copied, setCopied] = useState(false);

  if (!activeUser) return null;

  const mockRefLink = `https://nexus-trade.com/ref/${activeUser.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockRefLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim() || !friendEmail.includes("@")) {
      alert("Please specify a valid referral target email.");
      return;
    }
    
    // Simulate user signing up via referral link
    addReferral(friendEmail);
    setFriendEmail("");
    alert(`Success! Simulated user ${friendEmail} signed up. $50 USDT bonus accredited.`);
  };

  const userReferrals = referrals.filter(r => r.userId === activeUser.uid);
  const totalEarned = userReferrals.reduce((sum, r) => sum + r.bonusEarned, 0);

  return (
    <div id="referrals-section-wrapper" className="space-y-6 font-sans">
      
      {/* SECTION 1: REFERRALS METERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Referral code copy card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              My Referral Identifier
            </span>
            <Gift className="w-4 h-4 text-purple-400 animate-bounce" />
          </div>
          <div className="my-3 font-sans">
            <div className="text-xl font-extrabold text-white uppercase tracking-wider">
              {activeUser.referralCode}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Share code for partner bonuses</p>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold rounded-lg cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copied Code Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy Referral Invite Link</span>
              </>
            )}
          </button>
        </div>

        {/* Total recruited */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Partners Recruited
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-white">
              {userReferrals.length} Partners
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Active Nodes Affiliated</p>
          </div>
          <div className="text-[10px] text-cyan-400 flex items-center gap-1.5 font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Bonus Rate: $50 per registration
          </div>
        </div>

        {/* Earnings accumulated */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Partnership Yield Earned
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3 font-sans">
            <div className="text-2xl font-black text-emerald-400">
              ${totalEarned.toFixed(2)} USDT
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Credited To Available Portfolio</p>
          </div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">
            Dynamic Payout Liquidity: APPROVED
          </div>
        </div>

      </div>

      {/* SECTION 2: REFERRAL SIGNUP SIMULATOR BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recruiter interface */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h2 className="text-base font-sans font-semibold text-white mb-2 flex items-center gap-2">
            <UserPlus className="text-purple-400 w-5 h-5" />
            <span>Simulate Node Registrations</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
            Enter a simulated friend email below to dispatch a mock invitation. When submitted, the system will mimic their instant registration through your referral link, awarding you the $50 USDT bonus automatically in real time!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Friend's Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. trading-buddy@gmail.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-sans font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/15"
            >
              <span>Recruit Partner Node</span>
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Recruited list */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
          <h2 className="text-base font-sans font-semibold text-white mb-4">
            My Recruited Partners
          </h2>

          <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
            {userReferrals.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-sans leading-relaxed">
                No partners recruited yet.<br />Recruit simulated partners above to earn USDT rewards.
              </div>
            ) : (
              userReferrals.map(ref => (
                <div key={ref.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white font-sans lowercase">{ref.referredEmail}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      AFFILIATED // {new Date(ref.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold font-mono">+${ref.bonusEarned.toFixed(2)} USDT</span>
                    <div className="mt-1 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                      BONUS PAID
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
