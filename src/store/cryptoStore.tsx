import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  User,
  UserRole,
  KYCStatus,
  Wallet,
  Trade,
  TradeType,
  TradeStatus,
  Transaction,
  TransactionType,
  TransactionStatus,
  Notification,
  AdminLog,
  MiningHardware,
  Referral,
  CryptoCoin,
  AssetBalance
} from "../types";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

interface CryptoContextType {
  coins: CryptoCoin[];
  users: User[];
  activeUser: User | null;
  wallets: Wallet[];
  trades: Trade[];
  transactions: Transaction[];
  notifications: Notification[];
  adminLogs: AdminLog[];
  miningHardware: MiningHardware[];
  referrals: Referral[];
  
  // Authentication Actions
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (email: string) => Promise<boolean>;
  submitKYC: () => void;
  updateKYCStatus: (userId: string, status: KYCStatus) => void;
  toggleFreezeUser: (userId: string) => void;

  // Trading Actions
  placeTrade: (asset: string, type: TradeType, amount: number, timeFrame: string) => Promise<boolean>;
  
  // Wallet Actions
  depositFunds: (amount: number, coin?: string) => Promise<boolean>;
  withdrawRequest: (amount: number, coin: string, address: string) => Promise<boolean>;
  transferCrypto: (coin: string, amount: number, destinationAddress: string) => Promise<boolean>;
  
  // Admin Actions
  adjustUserBalance: (userId: string, amount: number, coin?: string) => void;
  approveWithdrawal: (transactionId: string) => void;
  rejectWithdrawal: (transactionId: string) => void;
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string) => void;
  
  // Mining Actions
  buyMiningRig: (rigId: string) => Promise<boolean>;
  claimMiningRewards: () => void;
  
  // Referral Actions
  addReferral: (email: string) => void;
  
  // Notification Actions
  markNotificationsAsRead: () => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// Initial configuration for coins
const INITIAL_COINS: CryptoCoin[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 67340.50,
    change24h: 3.42,
    high24h: 68100.00,
    low24h: 65150.00,
    icon: "🪙",
    history: [65200, 65400, 65150, 65800, 66100, 66490, 66300, 66800, 67200, 67340.50]
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3542.20,
    change24h: 2.15,
    high24h: 3610.50,
    low24h: 3450.00,
    icon: "💎",
    history: [3460, 3450, 3490, 3510, 3480, 3530, 3540, 3560, 3520, 3542.20]
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 162.85,
    change24h: 5.89,
    high24h: 165.20,
    low24h: 151.40,
    icon: "☀️",
    history: [151.5, 153.0, 156.4, 154.2, 158.0, 160.1, 159.5, 163.0, 161.2, 162.85]
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.13840,
    change24h: -1.24,
    high24h: 0.14250,
    low24h: 0.13410,
    icon: "🐕",
    history: [0.139, 0.138, 0.141, 0.142, 0.137, 0.136, 0.139, 0.140, 0.137, 0.13840]
  }
];

// Initial mining rigs available
const INITIAL_RIGS: MiningHardware[] = [
  { id: "rig_gpu", name: "Radeon RX Pro GPU Rig", hashRate: "450 MH/s", hashRateVal: 450, cost: 850, rewardPerSec: 0.08, active: false, accumulated: 0, progress: 0 },
  { id: "rig_asic_l", name: "Antminer Alpha Core ASIC", hashRate: "95 TH/s", hashRateVal: 95000, cost: 3500, rewardPerSec: 0.42, active: false, accumulated: 0, progress: 0 },
  { id: "rig_quantum", name: "Next-Gen Quantum Miner", hashRate: "2.4 PH/s", hashRateVal: 2400000, cost: 15000, rewardPerSec: 2.15, active: false, accumulated: 0, progress: 0 }
];

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE INITIALIZATION ---
  const [coins, setCoins] = useState<CryptoCoin[]>(() => {
    const saved = localStorage.getItem("crypto_coins");
    return saved ? JSON.parse(saved) : INITIAL_COINS;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("crypto_active_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [miningHardware, setMiningHardware] = useState<MiningHardware[]>(() => {
    const saved = localStorage.getItem("crypto_mining_hardware");
    return saved ? JSON.parse(saved) : INITIAL_RIGS;
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Local storage backups for non-firestore details
  useEffect(() => {
    localStorage.setItem("crypto_coins", JSON.stringify(coins));
    localStorage.setItem("crypto_active_user", JSON.stringify(activeUser));
    localStorage.setItem("crypto_mining_hardware", JSON.stringify(miningHardware));
  }, [coins, activeUser, miningHardware]);

  // Seeding initial data to Firestore if it doesn't exist
  useEffect(() => {
    const seedData = async () => {
      try {
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        if (snapshot.empty) {
          console.log("Seeding Firestore with default accounts...");
          
          const now = Date.now();
          const seedUsers = [
            {
              uid: "user_1",
              email: "user@example.com",
              role: UserRole.USER,
              balance: 12500.00,
              lockedBalance: 0,
              profit: 0,
              createdAt: now,
              kycStatus: KYCStatus.VERIFIED,
              isFrozen: false,
              referralCode: "USER12500"
            },
            {
              uid: "admin_1",
              email: "nanisarah888@gmail.com",
              role: UserRole.ADMIN,
              balance: 500000.00,
              lockedBalance: 0,
              profit: 0,
              createdAt: now,
              kycStatus: KYCStatus.VERIFIED,
              isFrozen: false,
              referralCode: "ADMIN888"
            },
            {
              uid: "admin_2",
              email: "admin@example.com",
              role: UserRole.ADMIN,
              balance: 250000.00,
              lockedBalance: 0,
              profit: 0,
              createdAt: now,
              kycStatus: KYCStatus.VERIFIED,
              isFrozen: false,
              referralCode: "ADMIN777"
            }
          ];

          for (const u of seedUsers) {
            await setDoc(doc(db, "users", u.uid), u);
          }

          const seedWallets = [
            {
              userId: "user_1",
              address: "0x78aF923e00188bCd909a341E343f1CdE7a950CdE",
              assets: [
                { coin: "BTC", balance: 0.15 },
                { coin: "ETH", balance: 1.4 },
                { coin: "SOL", balance: 12.0 },
                { coin: "DOGE", balance: 5000.0 }
              ]
            },
            {
              userId: "admin_1",
              address: "0xbA888c78E293e00188bCd909a341E343f1CdE999",
              assets: [
                { coin: "BTC", balance: 5.0 },
                { coin: "ETH", balance: 45.0 },
                { coin: "SOL", balance: 350.0 },
                { coin: "DOGE", balance: 250000.0 }
              ]
            },
            {
              userId: "admin_2",
              address: "0xbB777c78E293e00188bCd909a341E343f1CdE888",
              assets: [
                { coin: "BTC", balance: 2.0 },
                { coin: "ETH", balance: 18.0 },
                { coin: "SOL", balance: 180.0 },
                { coin: "DOGE", balance: 120000.0 }
              ]
            }
          ];

          for (const w of seedWallets) {
            await setDoc(doc(db, "wallets", w.userId), w);
          }

          const sampleTx = {
            id: "tx_1",
            userId: "user_1",
            type: TransactionType.DEPOSIT,
            coin: "USDT",
            amount: 2500,
            status: TransactionStatus.APPROVED,
            txHash: "0xc83a3f4e912384a8bc341E343f1CdE7a950CdE3f4e",
            createdAt: now - 3600000 * 24
          };
          await setDoc(doc(db, "transactions", sampleTx.id), sampleTx);

          const sampleNotif = {
            id: "notif_1",
            userId: "user_1",
            message: "Welcome to our Crypto Trading Engine! Complete your verification under Settings to withdraw.",
            type: "system",
            read: false,
            createdAt: now - 3600000 * 24
          };
          await setDoc(doc(db, "notifications", sampleNotif.id), sampleNotif);
        }
      } catch (err) {
        console.error("Error during Firestore seeding: ", err);
      }
    };
    seedData();
  }, []);

  // --- FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    if (!activeUser) return;

    const unsubscribers: (() => void)[] = [];

    // 1. Users sync
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as User);
      });
      setUsers(usersList);
      
      const currentActive = usersList.find(u => u.uid === activeUser.uid);
      if (currentActive) {
        setActiveUser(currentActive);
      }
    });
    unsubscribers.push(unsubUsers);

    // 2. Trades sync
    const unsubTrades = onSnapshot(collection(db, "trades"), (snapshot) => {
      const tradesList: Trade[] = [];
      snapshot.forEach((docSnap) => {
        tradesList.push(docSnap.data() as Trade);
      });
      tradesList.sort((a, b) => b.createdAt - a.createdAt);
      setTrades(tradesList);
    });
    unsubscribers.push(unsubTrades);

    // 3. Transactions sync
    const unsubTx = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const txList: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        txList.push(docSnap.data() as Transaction);
      });
      txList.sort((a, b) => b.createdAt - a.createdAt);
      setTransactions(txList);
    });
    unsubscribers.push(unsubTx);

    // 4. Wallets sync
    const unsubWallets = onSnapshot(collection(db, "wallets"), (snapshot) => {
      const walletsList: Wallet[] = [];
      snapshot.forEach((docSnap) => {
        walletsList.push(docSnap.data() as Wallet);
      });
      setWallets(walletsList);
    });
    unsubscribers.push(unsubWallets);

    // 5. Notifications sync
    const unsubNotifs = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const notifsList: Notification[] = [];
      snapshot.forEach((docSnap) => {
        notifsList.push(docSnap.data() as Notification);
      });
      notifsList.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(notifsList);
    });
    unsubscribers.push(unsubNotifs);

    // 6. Admin logs sync
    const unsubLogs = onSnapshot(collection(db, "adminLogs"), (snapshot) => {
      const logsList: AdminLog[] = [];
      snapshot.forEach((docSnap) => {
        logsList.push(docSnap.data() as AdminLog);
      });
      logsList.sort((a, b) => b.timestamp - a.timestamp);
      setAdminLogs(logsList);
    });
    unsubscribers.push(unsubLogs);

    // 7. Referrals sync
    const unsubReferrals = onSnapshot(collection(db, "referrals"), (snapshot) => {
      const refsList: Referral[] = [];
      snapshot.forEach((docSnap) => {
        refsList.push(docSnap.data() as Referral);
      });
      setReferrals(refsList);
    });
    unsubscribers.push(unsubReferrals);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [activeUser?.uid]);

  // Dynamic references check for intervals
  const stateRef = useRef({ coins, activeUser, trades, miningHardware });
  useEffect(() => {
    stateRef.current = { coins, activeUser, trades, miningHardware };
  }, [coins, activeUser, trades, miningHardware]);

  // Calculate remaining seconds securely based on createdAt to prevent cheating
  const calculateRemainingSeconds = (trade: Trade) => {
    if (trade.status !== TradeStatus.OPEN) return 0;
    
    let durationSeconds = 60;
    if (trade.timeFrame === "60s") durationSeconds = 60;
    else if (trade.timeFrame === "120s") durationSeconds = 120;
    else if (trade.timeFrame === "1h") durationSeconds = 300; // sped up to 5 min
    else if (trade.timeFrame === "7d") durationSeconds = 600; // sped up to 10 min
    
    const elapsedSeconds = Math.floor((Date.now() - trade.createdAt) / 1000);
    return Math.max(0, durationSeconds - elapsedSeconds);
  };

  // --- ENGINE: PRICE TICKER & TRADE RESOLUTION ---
  useEffect(() => {
    const timer = setInterval(() => {
      const { coins: currentCoins, activeUser: currentActive, trades: currentTrades, miningHardware: currentRigs } = stateRef.current;

      // 1. Tick price fluctuations
      const updatedCoins = currentCoins.map(coin => {
        const factor = 1 + (Math.random() - 0.5) * 0.003;
        const price = Math.max(0.00001, coin.price * factor);
        const change24h = coin.change24h + (Math.random() - 0.5) * 0.2;
        const high24h = price > coin.high24h ? price : coin.high24h;
        const low24h = price < coin.low24h ? price : coin.low24h;
        
        let history = [...coin.history];
        if (history.length >= 15) {
          history.shift();
        }
        history.push(price);

        return {
          ...coin,
          price,
          change24h,
          high24h,
          low24h,
          history
        };
      });
      setCoins(updatedCoins);

      // 2. Resolve or decrement active trades
      if (currentActive && currentTrades.length > 0) {
        currentTrades.forEach(async (trade) => {
          if (trade.userId === currentActive.uid && trade.status === TradeStatus.OPEN) {
            const secondsLeft = calculateRemainingSeconds(trade);
            
            // Decement locally for visual responsiveness
            setTrades(prevTrades => prevTrades.map(pt => pt.id === trade.id ? { ...pt, timeRemaining: secondsLeft } : pt));

            if (secondsLeft <= 0) {
              const coinSymbol = trade.asset.split("/")[0];
              const resolvedCoin = updatedCoins.find(c => c.symbol === coinSymbol);
              const exitPrice = resolvedCoin ? resolvedCoin.price : trade.entryPrice;
              
              let isWin = false;
              if (trade.type === TradeType.BUY) {
                isWin = exitPrice > trade.entryPrice;
              } else {
                isWin = exitPrice < trade.entryPrice;
              }

              const finalStatus = isWin ? TradeStatus.PROFIT : TradeStatus.LOSS;
              
              // Settle in Firestore
              const tradeRef = doc(db, "trades", trade.id);
              await updateDoc(tradeRef, {
                status: finalStatus,
                exitPrice: exitPrice,
                timeRemaining: 0
              });

              // Securely update user balances
              const userRef = doc(db, "users", currentActive.uid);
              const currentDoc = await getDoc(userRef);
              if (currentDoc.exists()) {
                const liveUser = currentDoc.data() as User;
                const profitMultiplier = 0.85;
                const payout = isWin ? (trade.amount + trade.amount * profitMultiplier) : 0;
                const profitChange = isWin ? (trade.amount * profitMultiplier) : -trade.amount;

                await updateDoc(userRef, {
                  balance: liveUser.balance + payout,
                  lockedBalance: Math.max(0, liveUser.lockedBalance - trade.amount),
                  profit: liveUser.profit + profitChange
                });
              }

              // Save notification to Firestore
              const notifId = `notif_tr_${Date.now()}_${trade.id}`;
              const message = isWin 
                ? `🎉 Trade WON! ${trade.asset} closed in profit at $${exitPrice.toFixed(2)}. Return: $${(trade.amount + trade.amount * 0.85).toFixed(2)} USDT`
                : `📉 Trade Closed in Loss. ${trade.asset} closed at $${exitPrice.toFixed(2)}. Loss value: -$${trade.amount.toFixed(2)} USDT`;

              await setDoc(doc(db, "notifications", notifId), {
                id: notifId,
                userId: currentActive.uid,
                message,
                type: "trade",
                read: false,
                createdAt: Date.now()
              });
            }
          }
        });
      }

      // 3. Accumulate active mining
      const isAnyRigActive = currentRigs.some(r => r.active);
      if (currentActive && isAnyRigActive) {
        const updatedRigs = currentRigs.map(rig => {
          if (rig.active) {
            const nextProgress = rig.progress + 4;
            const extraReward = rig.rewardPerSec * 1;
            const newAccumulated = rig.accumulated + extraReward;
            return {
              ...rig,
              progress: nextProgress >= 100 ? 0 : nextProgress,
              accumulated: newAccumulated
            };
          }
          return rig;
        });
        setMiningHardware(updatedRigs);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- ACTIONS IMPLEMENTATION ---

  // LOGIN
  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    let emailLower = email.trim().toLowerCase();
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", emailLower));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const success = await register(emailLower);
      return success;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;

    if (userData.isFrozen) {
      alert("This account is currently frozen. Contact support.");
      return false;
    }

    setActiveUser(userData);

    // Seed a wallet if they don't have one
    const walletRef = doc(db, "wallets", userData.uid);
    const walletDoc = await getDoc(walletRef);
    if (!walletDoc.exists()) {
      const hex = Array.from({length: 40}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
      const newWallet: Wallet = {
        userId: userData.uid,
        address: `0x${hex}`,
        assets: [
          { coin: "BTC", balance: 0.0 },
          { coin: "ETH", balance: 0.0 },
          { coin: "SOL", balance: 0.0 },
          { coin: "DOGE", balance: 0.0 }
        ]
      };
      await setDoc(doc(db, "wallets", userData.uid), newWallet);
    }
    return true;
  };

  // LOGOUT
  const logout = () => {
    setActiveUser(null);
  };

  // REGISTER
  const register = async (email: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", emailLower));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("Email already registered! Logging you in instead.");
      return login(email);
    }

    const role = emailLower === "nanisarah888@gmail.com" ? UserRole.ADMIN : UserRole.USER;
    const uid = `user_${Date.now()}`;
    const referralCode = `REF-${emailLower.split("@")[0].toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const newUser: User = {
      uid,
      email: emailLower,
      role,
      balance: role === UserRole.ADMIN ? 500000.00 : 1000.00,
      lockedBalance: 0,
      profit: 0,
      createdAt: Date.now(),
      kycStatus: KYCStatus.UNSUBMITTED,
      isFrozen: false,
      referralCode
    };

    const hex = Array.from({length: 20}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    const newWallet: Wallet = {
      userId: uid,
      address: `0x${hex}`,
      assets: [
        { coin: "BTC", balance: 0.0 },
        { coin: "ETH", balance: 0.0 },
        { coin: "SOL", balance: 0.0 },
        { coin: "DOGE", balance: 0.0 }
      ]
    };

    await setDoc(doc(db, "users", uid), newUser);
    await setDoc(doc(db, "wallets", uid), newWallet);

    const initialNotif: Notification = {
      id: `notif_welcome_${uid}_${Date.now()}`,
      userId: uid,
      message: "👋 Welcome to your advanced cryptocurrency trading workspace! Get started by placing a mock trade or starting a cloud miner.",
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", initialNotif.id), initialNotif);

    setActiveUser(newUser);
    return true;
  };

  // SUBMIT KYC
  const submitKYC = async () => {
    if (!activeUser) return;
    await updateDoc(doc(db, "users", activeUser.uid), {
      kycStatus: KYCStatus.PENDING
    });

    const notifId = `notif_${Date.now()}`;
    const newNotif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: "📋 KYC Application submitted! Administrators will review your details shortly.",
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), newNotif);
  };

  // COMPLIANCE STATUS SETTINGS (ADMIN ACTION)
  const updateKYCStatus = async (userId: string, status: KYCStatus) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    await updateDoc(doc(db, "users", userId), {
      kycStatus: status
    });

    const mess = status === KYCStatus.VERIFIED 
      ? "✅ KYC Verification Successful! All features are now unlocked." 
      : "❌ KYC Verification Rejected. Please resubmit clear documentation.";
    
    const notifId = `notif_kyc_${Date.now()}`;
    const notificationRecord: Notification = {
      id: notifId,
      userId,
      message: mess,
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notificationRecord);

    const target = users.find(u => u.uid === userId);
    const logId = `log_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "update_kyc",
      targetUser: target ? target.email : userId,
      details: `Updated KYC status of ${target?.email || userId} to ${status.toUpperCase()}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // FREEZE LOGIC (ADMIN ACTION)
  const toggleFreezeUser = async (userId: string) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    const target = users.find(u => u.uid === userId);
    if (!target) return;

    const frozenState = !target.isFrozen;
    await updateDoc(doc(db, "users", userId), {
      isFrozen: frozenState
    });

    const mess = frozenState 
      ? "⚠️ Your account has been frozen by administration. Actions are suspended."
      : "✅ Your account has been unfrozen. Trading activity resumed.";

    const notifId = `notif_fz_${Date.now()}`;
    const notificationRecord: Notification = {
      id: notifId,
      userId,
      message: mess,
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notificationRecord);

    const actionText = frozenState ? "freeze_user" : "unfreeze_user";
    const logId = `log_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: actionText,
      targetUser: target.email,
      details: `${frozenState ? "Froze" : "Unfroze"} account of user: ${target.email}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // PLACE ACTIVE TRADE
  const placeTrade = async (asset: string, type: TradeType, amount: number, timeFrame: string): Promise<boolean> => {
    if (!activeUser) return false;
    if (activeUser.isFrozen) {
      alert("Account is frozen.");
      return false;
    }

    if (amount > activeUser.balance) {
      alert("Insufficient account balance to place trade.");
      return false;
    }

    let allowed = false;
    let rangeTxt = "";
    let seconds = 60;
    if (timeFrame === "60s") {
      allowed = amount >= 100 && amount <= 1000;
      rangeTxt = "$100 - $1,000";
      seconds = 60;
    } else if (timeFrame === "120s") {
      allowed = amount >= 5000 && amount <= 10000;
      rangeTxt = "$5,000 - $10,000";
      seconds = 120;
    } else if (timeFrame === "1h") {
      allowed = amount >= 15000 && amount <= 45000;
      rangeTxt = "$15,000 - $45,000";
      seconds = 300; // Fast testing hours!
    } else if (timeFrame === "7d") {
      allowed = amount >= 50000 && amount <= 100000;
      rangeTxt = "$50,000 - $100,000";
      seconds = 600; // Fast testing days!
    }

    if (!allowed) {
      alert(`Invalid trade amount. Allowed range for ${timeFrame} timeframe is ${rangeTxt}.`);
      return false;
    }

    const coinSymbol = asset.split("/")[0];
    const targetCoin = coins.find(c => c.symbol === coinSymbol);
    const entryPrice = targetCoin ? targetCoin.price : 1.0;

    const newTradeId = `trade_${Date.now()}`;
    const newTrade: Trade = {
      id: newTradeId,
      userId: activeUser.uid,
      asset,
      type,
      amount,
      timeFrame,
      entryPrice,
      status: TradeStatus.OPEN,
      timeRemaining: seconds,
      createdAt: Date.now()
    };

    // Deduct and Lock User Balance
    await updateDoc(doc(db, "users", activeUser.uid), {
      balance: activeUser.balance - amount,
      lockedBalance: activeUser.lockedBalance + amount
    });

    // Save Trade
    await setDoc(doc(db, "trades", newTradeId), newTrade);

    // Notif
    const notifId = `notif_tr_pl_${newTradeId}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `📈 Launched active ${type.toUpperCase()} position on ${asset} ($${amount} USDT, Entry: $${entryPrice.toFixed(2)}, timeframe: ${timeFrame}).`,
      type: "trade",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);
    return true;
  };

  // DEPOSIT FUNDS: GENERATE UNIQUE ADDRESS & LOG PENDING TRANSACTION
  const depositFunds = async (amount: number, coin: string = "USDT"): Promise<boolean> => {
    if (!activeUser) return false;
    if (activeUser.isFrozen) return false;

    if (amount <= 0) {
      alert("Invalid deposit amount.");
      return false;
    }

    // Generate simulated block address for this specific request!
    let prefix = "0x";
    if (coin === "BTC") prefix = "bc1q";
    else if (coin === "SOL") prefix = "Epy";
    else if (coin === "DOGE") prefix = "D";
    
    const uniqueAddress = prefix + Array.from({length: 32}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    const txId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      userId: activeUser.uid,
      type: TransactionType.DEPOSIT,
      coin,
      amount,
      status: TransactionStatus.PENDING, // Records pending transaction
      address: uniqueAddress,
      createdAt: Date.now()
    };

    await setDoc(doc(db, "transactions", txId), newTx);

    // Save notification
    const notifId = `notif_dep_req_${txId}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `📥 Deposit request logged: Pending receipts of ${amount} ${coin} to address ${uniqueAddress.substring(0, 10)}...`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);

    return true;
  };

  // WITHDRAW PORTAL REGISTRY
  const withdrawRequest = async (amount: number, coin: string, address: string): Promise<boolean> => {
    if (!activeUser) return false;
    if (activeUser.isFrozen) {
      alert("Your account is currently frozen.");
      return false;
    }

    if (activeUser.kycStatus !== KYCStatus.VERIFIED) {
      alert("Withdrawals are locked. Please complete KYC Verification in Settings section.");
      return false;
    }

    let isSufficient = false;
    if (coin === "USDT") {
      isSufficient = activeUser.balance >= amount;
    } else {
      const userWallet = wallets.find(w => w.userId === activeUser.uid);
      const coinAsset = userWallet?.assets.find(a => a.coin === coin);
      isSufficient = coinAsset ? coinAsset.balance >= amount : false;
    }

    if (!isSufficient) {
      alert(`Insufficient balance for withdrawing ${amount} ${coin}.`);
      return false;
    }

    const txId = `tx_with_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      userId: activeUser.uid,
      type: TransactionType.WITHDRAW,
      coin,
      amount,
      status: TransactionStatus.PENDING,
      address,
      createdAt: Date.now()
    };

    // Lock user balance
    if (coin === "USDT") {
      await updateDoc(doc(db, "users", activeUser.uid), {
        balance: activeUser.balance - amount,
        lockedBalance: activeUser.lockedBalance + amount
      });
    } else {
      const userWallet = wallets.find(w => w.userId === activeUser.uid);
      if (userWallet) {
        const assets = userWallet.assets.map(a => a.coin === coin ? { ...a, balance: a.balance - amount } : a);
        await updateDoc(doc(db, "wallets", activeUser.uid), { assets });
      }
    }

    await setDoc(doc(db, "transactions", txId), newTx);

    const notifId = `notif_with_req_${txId}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `📤 withdrawal request submitted for ${amount} ${coin}. Awaiting admin verification processing.`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);

    return true;
  };

  // INTERNAL CRYTPO TRANFERS
  const transferCrypto = async (coin: string, amount: number, destinationAddress: string): Promise<boolean> => {
    if (!activeUser) return false;
    if (activeUser.isFrozen) return false;

    let isSufficient = false;
    if (coin === "USDT") {
      isSufficient = activeUser.balance >= amount;
    } else {
      const userWallet = wallets.find(w => w.userId === activeUser.uid);
      const coinAsset = userWallet?.assets.find(a => a.coin === coin);
      isSufficient = coinAsset ? coinAsset.balance >= amount : false;
    }

    if (!isSufficient) {
      alert(`Sufficient balance is missing to transfer ${amount} ${coin}.`);
      return false;
    }

    const recipientWallet = wallets.find(w => w.address.toLowerCase() === destinationAddress.trim().toLowerCase());
    if (!recipientWallet) {
      alert("Recipient blockchain address could not be verified on our internal registrar.");
      return false;
    }

    const txHash = "0x" + Array.from({length: 32}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    if (coin === "USDT") {
      await updateDoc(doc(db, "users", activeUser.uid), {
        balance: activeUser.balance - amount
      });

      const recipientUser = users.find(u => u.uid === recipientWallet.userId);
      if (recipientUser) {
        await updateDoc(doc(db, "users", recipientWallet.userId), {
          balance: recipientUser.balance + amount
        });
      }
    } else {
      const senderWalletRef = doc(db, "wallets", activeUser.uid);
      const senderAssets = wallets.find(w => w.userId === activeUser.uid)!.assets.map(a => a.coin === coin ? { ...a, balance: a.balance - amount } : a);
      await updateDoc(senderWalletRef, { assets: senderAssets });

      const recipientWalletRef = doc(db, "wallets", recipientWallet.userId);
      const recipientAssets = wallets.find(w => w.userId === recipientWallet.userId)!.assets.map(a => a.coin === coin ? { ...a, balance: a.balance + amount } : a);
      await updateDoc(recipientWalletRef, { assets: recipientAssets });
    }

    const txId = `tx_trf_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      userId: activeUser.uid,
      type: TransactionType.TRANSFER,
      coin,
      amount,
      status: TransactionStatus.APPROVED,
      address: destinationAddress,
      txHash,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "transactions", txId), newTx);

    const senderNotifId = `notif_send_${Date.now()}`;
    const senderNotif: Notification = {
      id: senderNotifId,
      userId: activeUser.uid,
      message: `💸 Internal Transfer Complete: Sent ${amount} ${coin} to ${destinationAddress.substring(0, 8)}...`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", senderNotifId), senderNotif);

    const recNotifId = `notif_rec_${Date.now()}`;
    const recNotif: Notification = {
      id: recNotifId,
      userId: recipientWallet.userId,
      message: `📥 Received ${amount} ${coin} internal transfer from address index.`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", recNotifId), recNotif);

    alert(`Successfully transferred ${amount} ${coin} to the target wallet.`);
    return true;
  };

  // ADJUST USER BALANCE (ADMIN ACTION)
  const adjustUserBalance = async (userId: string, amount: number, coin: string = "USDT") => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    if (coin === "USDT") {
      await updateDoc(doc(db, "users", userId), {
        balance: amount
      });
    } else {
      const userWallet = wallets.find(w => w.userId === userId);
      if (userWallet) {
        const assets = userWallet.assets.map(a => a.coin === coin ? { ...a, balance: amount } : a);
        await updateDoc(doc(db, "wallets", userId), { assets });
      }
    }

    const targetUser = users.find(u => u.uid === userId);
    const logId = `log_bal_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "adjust_balance",
      targetUser: targetUser ? targetUser.email : userId,
      details: `Adjusted user ${targetUser?.email || userId}'s ${coin} balance manually to ${amount}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // APPROVE WITHDRAWAL (ADMIN ACTION)
  const approveWithdrawal = async (transactionId: string) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;

    const txHash = "0x" + Array.from({length: 32}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    await updateDoc(doc(db, "transactions", transactionId), {
      status: TransactionStatus.APPROVED,
      txHash
    });

    const targetUserId = tx.userId;
    const recipientRef = doc(db, "users", targetUserId);
    const recipientDoc = await getDoc(recipientRef);
    if (recipientDoc.exists()) {
      const uData = recipientDoc.data() as User;
      let updatedLocked = uData.lockedBalance;
      if (tx.coin === "USDT") {
        updatedLocked = Math.max(0, uData.lockedBalance - tx.amount);
      }
      await updateDoc(recipientRef, {
        lockedBalance: updatedLocked
      });
    }

    const target = users.find(u => u.uid === targetUserId);
    const mess = `✅ withdrawal request for ${tx.amount} ${tx.coin} has been Approved and processed on-chain! Tx: ${txHash.substring(0, 10)}...`;
    
    const notifId = `notif_app_wi_${Date.now()}`;
    const notificationRecord: Notification = {
      id: notifId,
      userId: targetUserId,
      message: mess,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notificationRecord);

    const logId = `log_wi_apr_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "approve_withdraw",
      targetUser: target ? target.email : targetUserId,
      details: `Approved withdrawal of ${tx.amount} ${tx.coin} for ${target?.email || targetUserId}. TxHash: ${txHash}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // REJECT WITHDRAWAL (ADMIN ACTION)
  const rejectWithdrawal = async (transactionId: string) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== TransactionStatus.PENDING) return;

    await updateDoc(doc(db, "transactions", transactionId), {
      status: TransactionStatus.REJECTED
    });

    const targetUserId = tx.userId;
    const recipientRef = doc(db, "users", targetUserId);
    const recipientDoc = await getDoc(recipientRef);
    if (recipientDoc.exists()) {
      const uData = recipientDoc.data() as User;
      if (tx.coin === "USDT") {
        await updateDoc(recipientRef, {
          balance: uData.balance + tx.amount,
          lockedBalance: Math.max(0, uData.lockedBalance - tx.amount)
        });
      }
    }

    if (tx.coin !== "USDT") {
      const userWallet = wallets.find(w => w.userId === targetUserId);
      if (userWallet) {
        const assets = userWallet.assets.map(a => a.coin === tx.coin ? { ...a, balance: a.balance + tx.amount } : a);
        await updateDoc(doc(db, "wallets", targetUserId), { assets });
      }
    }

    const target = users.find(u => u.uid === targetUserId);
    const mess = `❌ withdrawal request for ${tx.amount} ${tx.coin} has been Rejected by administrative compliance. Funds refunded.`;
    
    const notifId = `notif_rej_wi_${Date.now()}`;
    const notificationRecord: Notification = {
      id: notifId,
      userId: targetUserId,
      message: mess,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notificationRecord);

    const logId = `log_wi_rej_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "reject_withdraw",
      targetUser: target ? target.email : targetUserId,
      details: `Rejected withdrawal of ${tx.amount} ${tx.coin} for ${target?.email || targetUserId}. Funds refunded.`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // APPROVE DEPOSIT (ADMIN ACTION)
  const approveDeposit = async (transactionId: string) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== TransactionStatus.PENDING || tx.type !== TransactionType.DEPOSIT) return;

    const txHash = "0x" + Array.from({length: 32}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

    await updateDoc(doc(db, "transactions", transactionId), {
      status: TransactionStatus.APPROVED,
      txHash
    });

    const recipientRef = doc(db, "users", tx.userId);
    const recipientDoc = await getDoc(recipientRef);
    if (recipientDoc.exists()) {
      const recipientData = recipientDoc.data() as User;
      
      let usdAddition = tx.amount;
      if (tx.coin !== "USDT") {
        const selectedCoin = coins.find(c => c.symbol === tx.coin);
        const conversionRate = selectedCoin ? selectedCoin.price : 1.0;
        usdAddition = tx.amount * conversionRate;
        
        const walletRef = doc(db, "wallets", tx.userId);
        const walletDoc = await getDoc(walletRef);
        if (walletDoc.exists()) {
          const wData = walletDoc.data() as Wallet;
          const assets = wData.assets.map(a => a.coin === tx.coin ? { ...a, balance: a.balance + tx.amount } : a);
          await updateDoc(walletRef, { assets });
        }
      }

      await updateDoc(recipientRef, {
        balance: recipientData.balance + usdAddition
      });

      const notifId = `notif_dep_app_${Date.now()}`;
      const notif: Notification = {
        id: notifId,
        userId: tx.userId,
        message: `💰 Deposit Request Completed! Accredited $${usdAddition.toFixed(2)} USDT value to your balance portfolio.`,
        type: "wallet",
        read: false,
        createdAt: Date.now()
      };
      await setDoc(doc(db, "notifications", notifId), notif);
    }

    const logId = `log_dep_apr_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "approve_deposit",
      targetUser: tx.userId,
      details: `Approved deposit request of ${tx.amount} ${tx.coin} for user: ${tx.userId}. TxHash: ${txHash}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // REJECT DEPOSIT (ADMIN ACTION)
  const rejectDeposit = async (transactionId: string) => {
    if (!activeUser || activeUser.role !== UserRole.ADMIN) return;

    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== TransactionStatus.PENDING || tx.type !== TransactionType.DEPOSIT) return;

    await updateDoc(doc(db, "transactions", transactionId), {
      status: TransactionStatus.REJECTED
    });

    const notifId = `notif_dep_rej_${Date.now()}`;
    const notif: Notification = {
      id: notifId,
      userId: tx.userId,
      message: `❌ Deposit request of ${tx.amount} ${tx.coin} was rejected/declined during administrative audit clearance.`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);

    const logId = `log_dep_rej_${Date.now()}`;
    const newLog: AdminLog = {
      id: logId,
      adminId: activeUser.uid,
      adminEmail: activeUser.email,
      action: "reject_deposit",
      targetUser: tx.userId,
      details: `Rejected deposit request of ${tx.amount} ${tx.coin} for user: ${tx.userId}`,
      timestamp: Date.now()
    };
    await setDoc(doc(db, "adminLogs", logId), newLog);
  };

  // BUY MINING RIG
  const buyMiningRig = async (rigId: string): Promise<boolean> => {
    if (!activeUser) return false;
    if (activeUser.isFrozen) return false;

    const rig = miningHardware.find(r => r.id === rigId);
    if (!rig) return false;

    if (activeUser.balance < rig.cost) {
      alert(`Insufficient balance. This miner costs $${rig.cost} USDT.`);
      return false;
    }

    await updateDoc(doc(db, "users", activeUser.uid), {
      balance: activeUser.balance - rig.cost
    });

    setMiningHardware(prev => prev.map(r => r.id === rigId ? { ...r, active: true } : r));

    const notifId = `notif_mine_${Date.now()}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `⚡ Cloud Miner Activated! Your ${rig.name} is now online ($${rig.hashRate} hashing power). Rewards are tracking!`,
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);

    alert(`Successfully launched ${rig.name}! Mining rewards are active.`);
    return true;
  };

  // CLAIM MINING REWARDS
  const claimMiningRewards = async () => {
    if (!activeUser) return;
    
    let totalClaim = 0;
    const finalRigs = miningHardware.map(rig => {
      if (rig.active && rig.accumulated > 0) {
        totalClaim += rig.accumulated;
        return { ...rig, accumulated: 0, progress: 0 };
      }
      return rig;
    });

    if (totalClaim <= 0) {
      alert("No mining rewards accumulate to claim right now.");
      return;
    }

    setMiningHardware(finalRigs);

    await updateDoc(doc(db, "users", activeUser.uid), {
      balance: activeUser.balance + totalClaim
    });

    const notifId = `notif_claim_${Date.now()}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `💸 Mining rewards claimed successfully! Credited $${totalClaim.toFixed(2)} USDT value to your balance portfolio.`,
      type: "wallet",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);

    alert(`Claimed $${totalClaim.toFixed(2)} USDT in mining rewards!`);
  };

  // ADD REFERRAL
  const addReferral = async (email: string) => {
    if (!activeUser) return;
    
    const referralId = `ref_${Date.now()}`;
    const referralObject: Referral = {
      id: referralId,
      userId: activeUser.uid,
      referredEmail: email.trim().toLowerCase(),
      status: "bonus_paid",
      bonusEarned: 50.00,
      createdAt: Date.now()
    };

    await setDoc(doc(db, "referrals", referralId), referralObject);

    await updateDoc(doc(db, "users", activeUser.uid), {
      balance: activeUser.balance + 50.00
    });

    const notifId = `notif_ref_${Date.now()}`;
    const notif: Notification = {
      id: notifId,
      userId: activeUser.uid,
      message: `👥 Referral success! ${email} joined the platform. $50.00 USDT bonus credited to your wallet.`,
      type: "system",
      read: false,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "notifications", notifId), notif);
  };

  // MARK NOTIFICATIONS AS READ
  const markNotificationsAsRead = async () => {
    if (!activeUser) return;
    for (const n of notifications) {
      if (n.userId === activeUser.uid && !n.read) {
        await updateDoc(doc(db, "notifications", n.id), {
          read: true
        });
      }
    }
  };

  return (
    <CryptoContext.Provider
      value={{
        coins,
        users,
        activeUser,
        wallets,
        trades,
        transactions,
        notifications,
        adminLogs,
        miningHardware,
        referrals,
        login,
        logout,
        register,
        submitKYC,
        updateKYCStatus,
        toggleFreezeUser,
        placeTrade,
        depositFunds,
        withdrawRequest,
        transferCrypto,
        adjustUserBalance,
        approveWithdrawal,
        rejectWithdrawal,
        approveDeposit,
        rejectDeposit,
        buyMiningRig,
        claimMiningRewards,
        addReferral,
        markNotificationsAsRead
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error("useCrypto must be used within a CryptoProvider");
  }
  return context;
};
