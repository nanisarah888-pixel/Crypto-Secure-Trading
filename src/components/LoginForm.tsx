import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { Shield, Sparkles, User, Mail, ArrowRight } from "lucide-react";

export const LoginForm: React.FC = () => {
  const { login, register } = useCrypto();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email);
      } else {
        await login(email);
      }
    } catch (err) {
      console.error(err);
      alert("Authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShortcut = async (selectedEmail: string) => {
    setLoading(true);
    try {
      await login(selectedEmail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative colored radial blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* LOGO & TITLES */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 items-center justify-center shadow-2xl shadow-cyan-500/30 mb-4 animate-bounce">
            <span className="font-sans font-black text-2xl text-white">X</span>
          </div>
          <h1 className="font-sans font-extrabold text-3xl tracking-tight text-white">
            NEXUS<span className="font-light text-cyan-400">TRADE</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-sans">
            Secure Decentralized Crypto Trading Engine &amp; Mining Platform
          </p>
        </div>

        {/* AUTH CARD */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-slate-950/50">
          <h2 className="text-lg font-sans font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>{isRegister ? "Create SECURE Account" : "Access Personal Workspace"}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 font-mono tracking-wider uppercase mb-2">
                Blockchain Email Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-sans font-semibold text-sm hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cyan-500/15 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Decrypting Protocol..." : isRegister ? "Initialize Node Account" : "Access Core Terminal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* TOGGLE FLOW */}
          <div className="mt-6 text-center text-xs text-slate-400 font-sans">
            {isRegister ? "Already registered at this node?" : "New to NexusTrade platform?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
            >
              {isRegister ? "Decrypt Workspace" : "Provision New Account"}
            </button>
          </div>
        </div>

        {/* SANDBOX PROTOCOL SHORTCUTS */}
        <div className="mt-8 p-5 bg-slate-900/20 backdrop-blur-sm border border-slate-800/40 rounded-2xl">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold mb-3.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping"></span>
            Simulator Quick Access Keys
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              onClick={() => handleShortcut("user@example.com")}
              disabled={loading}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900 text-left text-xs transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white leading-tight">Test User Profile</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-[130px] truncate">user@example.com</div>
              </div>
            </button>

            <button
              onClick={() => handleShortcut("nanisarah888@gmail.com")}
              disabled={loading}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-900 text-left text-xs transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-semibold text-white leading-tight">Compliance Admin</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-[130px] truncate">nanisarah888@gmail.com</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
