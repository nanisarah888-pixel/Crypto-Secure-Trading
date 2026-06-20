import React, { useState } from "react";
import { useCrypto } from "../store/cryptoStore";
import { TransactionType, TransactionStatus } from "../types";
import { ArrowDownLeft, ArrowUpRight, Copy, CheckCircle, Wallet, RefreshCw, Send, ShieldAlert, DollarSign } from "lucide-react";

export const WalletCard: React.FC = () => {
  const { activeUser, wallets, coins, transactions, depositFunds, withdrawRequest, transferCrypto } = useCrypto();
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState(500);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [transferCoin, setTransferCoin] = useState("BTC");
  const [transferAmount, setTransferAmount] = useState(0.01);
  const [transferDest, setTransferDest] = useState("");
  const [copied, setCopied] = useState(false);

  if (!activeUser) return null;

  // Retrieve user wallet asset balances
  const userWallet = wallets.find(w => w.userId === activeUser.uid);
  const userWalletAddress = userWallet ? userWallet.address : "0x0000000000000000000000000000000000000000";

  // Map of coin deposit mock addresses
  const mockDepositAddresses: { [key: string]: string } = {
    USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t (TRC20)",
    BTC: "bc1qxy2kg3ut7wvuf7zqc7gaw6tqtxwum558869gff",
    ETH: "0x78aF923e00188bCd909a341E343f1CdE7a950CdE (ERC20)",
    SOL: "Epy92q1X7wvuf7zqy4pL8otSzgjL4fEcGdGf9869",
    DOGE: "D8vuf7zqc7gaw6tqtxwum558869gff3aF923e"
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockDepositAddresses[selectedCoin] || userWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (depositAmount <= 0) return;
    const success = await depositFunds(depositAmount, selectedCoin);
    if (success) {
      alert(`Simulated deposit of ${depositAmount} ${selectedCoin} completed successfully.`);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      alert("Invalid withdrawal value.");
      return;
    }
    if (!withdrawAddr.trim() || withdrawAddr.length < 10) {
      alert("Invalid blockchain delivery address.");
      return;
    }
    const success = await withdrawRequest(withdrawAmount, selectedCoin, withdrawAddr);
    if (success) {
      alert(`Withdrawal request for ${withdrawAmount} ${selectedCoin} logged.`);
      setWithdrawAmount(100);
      setWithdrawAddr("");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0) {
      alert("Invalid transfer value.");
      return;
    }
    if (!transferDest.trim() || transferDest.length < 10) {
      alert("Invalid recipient database wallet address.");
      return;
    }
    const success = await transferCrypto(transferCoin, transferAmount, transferDest);
    if (success) {
      setTransferAmount(0);
      setTransferDest("");
    }
  };

  const userTxs = transactions.filter(t => t.userId === activeUser.uid);

  return (
    <div id="wallet-panel-wrapper" className="space-y-6">
      {/* SECTION 1: ASSETS PORTFOLIO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Main USD Wallet */}
        <div className="md:col-span-2 bg-gradient-to-tr from-cyan-900/40 via-slate-900/80 to-slate-900/60 border border-cyan-500/30 p-5 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Nexus Tether Core
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">
              USDT (FIAT)
            </span>
          </div>
          <div className="font-sans">
            <div className="text-[11px] text-slate-400 font-mono tracking-wider">PORTFOLIO VALUE</div>
            <div className="text-2xl font-black text-white mt-1">
              ${activeUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans font-medium">
              * Active trading operations locks allocations inside escrow vault (Escrow Balance: ${activeUser.lockedBalance})
            </p>
          </div>
        </div>

        {/* Crypto Asset Cards */}
        {["BTC", "ETH", "SOL", "DOGE"].map(symbol => {
          const coinData = coins.find(c => c.symbol === symbol);
          const balanceRecord = userWallet?.assets.find(a => a.coin === symbol);
          const cryptoBalance = balanceRecord ? balanceRecord.balance : 0;
          const usdValue = cryptoBalance * (coinData ? coinData.price : 0);

          return (
            <div key={symbol} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl leading-none">{coinData?.icon}</span>
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">{symbol} Portfolio</span>
              </div>
              <div className="font-sans">
                <div className="text-base font-bold text-white">
                  {cryptoBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: WORK AREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DEPOSIT ENGINE CARD */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-5">
          <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2">
            <ArrowDownLeft className="text-emerald-400 w-5 h-5" />
            <span>Deposit Hub</span>
          </h2>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Select Currency Asset</label>
            <select
              value={selectedCoin}
              onChange={(e) => setSelectedCoin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="USDT">Tether (USDT)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="DOGE">Dogecoin (DOGE)</option>
            </select>
          </div>

          {/* Glowing Virtual QR Block */}
          <div className="flex flex-col items-center bg-slate-950 p-4 rounded-xl border border-slate-900 relative">
            <div className="w-36 h-36 bg-white p-2 rounded-lg flex items-center justify-center mb-3.5 shadow-xl relative">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mockDepositAddresses[selectedCoin] || userWalletAddress)}&color=0f172a`}
                alt="Deposit QR"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="w-full">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center mb-1">
                Blockchain Deposit Address
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/80 text-xs">
                <span className="font-mono text-slate-300 truncate select-all flex-1">
                  {mockDepositAddresses[selectedCoin] || userWalletAddress}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Fast deposit simulation button */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Interactive Deposit Simulation</span>
              <span className="text-[10px] text-cyan-400 font-bold font-mono">SANDBOX MODE</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleDeposit}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-white font-sans font-bold text-xs shrink-0 transition-colors"
              >
                Deposit Funds
              </button>
            </div>
          </div>
        </div>

        {/* WITHDRAW SYSTEM WITH KYC REQUIREMENT */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl relative">
          <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2 mb-5">
            <ArrowUpRight className="text-cyan-400 w-5 h-5" />
            <span>Withdraw Portal</span>
          </h2>

          {activeUser.kycStatus !== "verified" ? (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">Verification Shield Active</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[220px] leading-relaxed font-sans">
                Withdrawals are temporarily locked for unverified accounts. Complete compliance verification inside Settings profile.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Delivery Currency</label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
              >
                <option value="USDT">Tether (USDT)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="DOGE">Dogecoin (DOGE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Blockchain Destination Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 0x... or bc1q..."
                value={withdrawAddr}
                onChange={(e) => setWithdrawAddr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Withdrawal Amount</label>
              <input
                type="number"
                required
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              id="withdraw_btn"
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-sm font-sans font-bold shadow-lg shadow-cyan-500/10 cursor-pointer"
            >
              Verify &amp; Dispatch Withdrawal
            </button>
          </form>
        </div>

        {/* INTERNAL CRYPTO TRANSFER ENGINE */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2 mb-5">
              <Send className="text-purple-400 w-5 h-5" />
              <span>Internal Ledger Transfer</span>
            </h2>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Asset Select</label>
                <select
                  value={transferCoin}
                  onChange={(e) => setTransferCoin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none hover:border-slate-800"
                >
                  <option value="USDT">USDT (Tether)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                  <option value="DOGE">DOGE (Dogecoin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Recipient Nexus Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0xbA888..."
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none"
                />
                <div className="text-[9px] font-mono text-slate-500 mt-1.5 leading-relaxed uppercase">
                  * TIP: Copy address from the Sandbox shortcuts to test internal ledger validation.
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Ledger Transfer Units</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                id="transfer_btn"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-sans font-bold cursor-pointer"
              >
                Sign &amp; Execute Transfer
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT LEDGER TRANSACTIONS HISTORY */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-base font-sans font-semibold text-white flex items-center gap-2">
            <RefreshCw className="text-cyan-400 w-4 h-4 animate-spin-slow" />
            <span>Node Ledger Activity Log</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {userTxs.length} items logged
          </span>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {userTxs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No recent database transactions recorded on this node.
            </div>
          ) : (
            userTxs.map(tx => {
              const isDeposit = tx.type === TransactionType.DEPOSIT;
              const isTransfer = tx.type === TransactionType.TRANSFER;
              const isPending = tx.status === TransactionStatus.PENDING;
              const isApproved = tx.status === TransactionStatus.APPROVED;

              return (
                <div key={tx.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900/80 flex items-center justify-between font-sans">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDeposit 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : isTransfer 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "bg-orange-500/10 text-orange-400"
                    }`}>
                      {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : isTransfer ? <Send className="w-4 h-4" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize">
                        {tx.type} {tx.coin}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                        {tx.txHash && ` // Hash: ${tx.txHash.substring(0, 10)}...`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-extrabold ${isDeposit ? "text-emerald-400" : "text-rose-400"}`}>
                      {isDeposit ? "+" : "-"}{tx.amount} {tx.coin}
                    </div>
                    <div className="mt-1">
                      <span className={`text-[9px] font-mono font-bold uppercase rounded-md px-1.5 py-0.2 ${
                        isPending 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                          : isApproved 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
