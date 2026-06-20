export enum KYCStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
  UNSUBMITTED = "unsubmitted"
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  balance: number; // USD / USDT balance
  lockedBalance: number; // USD locked during active trades
  profit: number; // Total accumulated profit/loss
  createdAt: number;
  kycStatus: KYCStatus;
  referralCode: string;
  isFrozen?: boolean;
}

export interface AssetBalance {
  coin: string;
  balance: number;
}

export interface Wallet {
  userId: string;
  address: string; // BTC/USDT/etc. addresses can be looked up dynamically
  assets: AssetBalance[];
}

export enum TradeType {
  BUY = "buy",
  SELL = "sell"
}

export enum TradeStatus {
  OPEN = "open",
  CLOSED = "closed",
  PROFIT = "profit",
  LOSS = "loss"
}

export interface Trade {
  id: string;
  userId: string;
  asset: string; // e.g. "BTC/USDT"
  type: TradeType;
  amount: number;
  timeFrame: string; // "60s" | "120s" | "1h" | "7d"
  entryPrice: number;
  exitPrice?: number;
  timeRemaining: number; // in seconds
  status: TradeStatus;
  createdAt: number;
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer"
}

export enum TransactionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  coin: string; // e.g. "USDT", "BTC"
  amount: number;
  status: TransactionStatus;
  address?: string;
  txHash?: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "trade" | "wallet" | "system";
  read: boolean;
  createdAt: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string; // "update_user" | "approve_withdraw" | "adjust_balance" | "freeze_user" | "unfreeze_user"
  targetUser: string; // email of the user
  details: string;
  timestamp: number;
}

export interface MiningHardware {
  id: string;
  name: string;
  hashRate: string; // e.g., "120 TH/s"
  hashRateVal: number; // numeric value for computations
  cost: number; // USD to buy/activate
  rewardPerSec: number; // simulated USD/sec
  active: boolean;
  accumulated: number; // mined but unclaimed rewards
  progress: number; // 0 to 100
}

export interface Referral {
  id: string;
  userId: string;
  referredEmail: string;
  status: "joined" | "active" | "bonus_paid";
  bonusEarned: number;
  createdAt: number;
}

export interface CryptoCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  icon: string;
  history: number[]; // Sparkline elements
}
