export type PeriodType = '30s' | '1m' | '3m' | '5m';

export interface PeriodConfig {
  id: PeriodType;
  name: string;
  shortName: string;
  durationSeconds: number;
  periodCode: string;
  subtitle: string;
}

export const PERIOD_CONFIGS: Record<PeriodType, PeriodConfig> = {
  '30s': {
    id: '30s',
    name: 'Win Go 30s',
    shortName: '30S',
    durationSeconds: 30,
    periodCode: '00',
    subtitle: '30 Seconds Fast Round',
  },
  '1m': {
    id: '1m',
    name: 'Win Go 1Min',
    shortName: '1Min',
    durationSeconds: 60,
    periodCode: '01',
    subtitle: '1 Minute Standard',
  },
  '3m': {
    id: '3m',
    name: 'Win Go 3Min',
    shortName: '3Min',
    durationSeconds: 180,
    periodCode: '03',
    subtitle: '3 Minutes Strategic',
  },
  '5m': {
    id: '5m',
    name: 'Win Go 5Min',
    shortName: '5Min',
    durationSeconds: 300,
    periodCode: '05',
    subtitle: '5 Minutes VIP',
  },
};

export type ColorType = 'green' | 'red' | 'violet';
export type SizeType = 'big' | 'small';

export interface RoundResult {
  period: PeriodType;
  roundId: string;
  number: number;
  colors: ColorType[];
  size: SizeType;
  timestamp: number;
  hash: string;
}

export type BetCategory = 'color' | 'number' | 'size';

export interface BetSelection {
  category: BetCategory;
  value: string; // 'green', 'violet', 'red', 'big', 'small', '0'...'9'
  label: string;
}

export interface UserBet {
  id: string;
  userId: string;
  period: PeriodType;
  roundId: string;
  category: BetCategory;
  selection: string;
  baseAmount: number;
  quantity: number;
  totalAmount: number;
  deliveryFee: number;
  contractAmount: number;
  status: 'pending' | 'won' | 'lost';
  payout: number;
  profit: number;
  createdAt: number;
  settledAt?: number;
  resultNumber?: number;
  resultColors?: ColorType[];
  resultSize?: SizeType;
}

export interface UserProfile {
  id: string;
  username: string;
  phone?: string;
  balance: number;
  vipLevel: number;
  totalWon: number;
  totalBets: number;
  isGuest?: boolean;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
  token?: string;
  error?: string;
}

export interface PeriodState {
  period: PeriodType;
  roundId: string;
  timeRemaining: number;
  durationSeconds: number;
  isBettingLocked: boolean; // true during last 5 seconds
  recentHistory: RoundResult[];
  lastResult?: RoundResult;
}

export interface GameStateResponse {
  serverTime: number;
  periods: Record<PeriodType, PeriodState>;
  user: UserProfile;
}

export type TransactionType = 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface TransactionRequest {
  id: string;
  userId: string;
  username: string;
  phone: string;
  type: TransactionType;
  amount: number;
  utr?: string;
  upiId?: string;
  status: TransactionStatus;
  createdAt: number;
  reviewedAt?: number;
  adminNote?: string;
}

export interface AdminStats {
  pendingDepositsCount: number;
  pendingDepositsAmount: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  approvedDepositsAmount: number;
  approvedWithdrawalsAmount: number;
  totalUsersCount: number;
}
