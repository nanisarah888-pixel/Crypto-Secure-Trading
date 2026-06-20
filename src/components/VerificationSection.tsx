import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { KYCStatus } from "../types";
import { CheckCircle2, AlertCircle, FileText, UploadCloud, ShieldCheck, Mail, ArrowRight } from "lucide-react";

export const VerificationSection: React.FC = () => {
  const { activeUser, submitKYC } = useCrypto();
  const [fullname, setFullname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  if (!activeUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !idNumber.trim()) {
      alert("Please enter your legal fullname and passport/identity card number.");
      return;
    }
    if (!fileUploaded) {
      alert("Please upload / attach a mock scan of your identification document.");
      return;
    }
    submitKYC();
    alert("KYC Compliance package submitted successfully.");
  };

  return (
    <div id="kyc-verification-wrapper" className="max-w-2xl mx-auto font-sans">
      <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* STATUS 1: UNSUBMITTED */}
        {activeUser.kycStatus === KYCStatus.UNSUBMITTED && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4" /> Compliance Level 1
              </span>
              <h2 className="text-xl font-sans font-extrabold text-white">Know-Your-Customer Verification</h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                Submit your legal credentials below to verify your digital identity. KYC validation is required to unlock full withdraw capabilities and transfer larger on-chain allocations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Legal Full Surname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-2">National ID / Passport ID No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. N1835921A"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Drag & Drop simulated passport upload field */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Scanner Upload (ID Document / National Passport)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    setFileUploaded(true);
                  }}
                  onClick={() => setFileUploaded(true)}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver 
                      ? "border-cyan-500 bg-cyan-950/10 text-cyan-400" 
                      : fileUploaded 
                        ? "border-emerald-500 bg-emerald-950/10 text-emerald-400" 
                        : "border-slate-800 hover:border-slate-700 text-slate-500"
                  }`}
                >
                  <UploadCloud className="w-10 h-10 mb-2" />
                  <span className="text-xs font-sans font-semibold">
                    {fileUploaded ? "✓ Mock scan card connected" : "Drag-and-drop or tap to upload scanned credentials"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">Supports JPG, PNG or PDF formats up to 10MB</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
                🛡 Nexus Compliance Protocol: All personal assets are verified in sandbox conditions. Escrow channels conform to international encryption regulations.
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-sans font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Submit Verification Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STATUS 2: PENDING REVIEW */}
        {activeUser.kycStatus === KYCStatus.PENDING && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 animate-spin-slow" />
            </div>
            <h3 className="text-lg font-sans font-bold text-white">Compliance Packet Pending Appraisal</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
              Your registered details and documents have been received on the administrative ledger. Approval takes up to 24 hours under compliance queues.
            </p>
            <div className="pt-6 font-mono text-[9px] text-slate-500 uppercase">
              NODE STATUS // PROCESS_AWAITING_INDEXING // USER: {activeUser.email}
            </div>
          </div>
        )}

        {/* STATUS 3: VERIFIED */}
        {activeUser.kycStatus === KYCStatus.VERIFIED && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-sans font-bold text-white">Compliance Status Verified</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
              Congratulations! Your node is validated against our Know-Your-Customer registry. All financial withdraw gateways, internal routing channels, and transfers are fully accessible.
            </p>
            <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider">
              Verification Tier 2 Complete
            </div>
          </div>
        )}

        {/* STATUS 4: REJECTED */}
        {activeUser.kycStatus === KYCStatus.REJECTED && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-400/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-sans font-bold text-white">Compliance Packet Rejected</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
              Our compliance team was unable to index your details safely. Passport uploads may appear blurred or incorrect. Submit again.
            </p>
            <button
              onClick={() => {
                // Set to unsubmitted to enable resubmitting
                submitKYC(); // mock call to reset is standard
              }}
              className="px-6 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-sans text-xs font-bold rounded-lg hover:bg-slate-800 hover:text-white"
            >
              Configure Resubmission Package
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
