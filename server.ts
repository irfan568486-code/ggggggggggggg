import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PeriodType, RoundResult, UserBet, UserProfile, PERIOD_CONFIGS, TransactionRequest, AdminStats } from './src/types.ts';
import {
  getColorsForNumber,
  getSizeForNumber,
  evaluateBet,
  generateRoundResult,
  getRoundSeqFromRoundId,
  formatPeriodId,
  calculateLivePeriodInfo,
  PERIOD_ANCHORS,
} from './src/utils/wingoRules.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wingo_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface PeriodProgress {
  currentSeq: number;
  roundStartTime: number;
}

interface UserAccount {
  userId: string;
  phone: string;
  passwordHash: string;
  createdAt: number;
}

interface DBStore {
  users: Record<string, UserProfile>;
  accounts?: Record<string, UserAccount>;
  history: Record<PeriodType, RoundResult[]>;
  bets: UserBet[];
  progress: Record<PeriodType, PeriodProgress>;
  transactions?: TransactionRequest[];
}

const DEFAULT_USER_ID = 'user_13club_vip';

function createInitialStore(): DBStore {
  const store: DBStore = {
    users: {
      [DEFAULT_USER_ID]: {
        id: DEFAULT_USER_ID,
        username: 'Member_8892',
        phone: '9876543210',
        balance: 10.0,
        vipLevel: 1,
        totalWon: 0,
        totalBets: 0,
      },
    },
    accounts: {
      '9876543210': {
        userId: DEFAULT_USER_ID,
        phone: '9876543210',
        passwordHash: 'password123',
        createdAt: Math.floor(Date.now() / 1000),
      },
    },
    history: {
      '30s': [],
      '1m': [],
      '3m': [],
      '5m': [],
    },
    bets: [],
    progress: {
      '30s': { currentSeq: calculateLivePeriodInfo('30s').roundSeq, roundStartTime: calculateLivePeriodInfo('30s').roundStartTime },
      '1m': { currentSeq: calculateLivePeriodInfo('1m').roundSeq, roundStartTime: calculateLivePeriodInfo('1m').roundStartTime },
      '3m': { currentSeq: calculateLivePeriodInfo('3m').roundSeq, roundStartTime: calculateLivePeriodInfo('3m').roundStartTime },
      '5m': { currentSeq: calculateLivePeriodInfo('5m').roundSeq, roundStartTime: calculateLivePeriodInfo('5m').roundStartTime },
    },
    transactions: [],
  };

  return store;
}

let db: DBStore;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    db = JSON.parse(raw);
    db.transactions = db.transactions || [];
    if (!db.users[DEFAULT_USER_ID]) {
      db.users[DEFAULT_USER_ID] = {
        id: DEFAULT_USER_ID,
        username: 'Member_8892',
        phone: '9876543210',
        balance: 10.0,
        vipLevel: 1,
        totalWon: 0,
        totalBets: 0,
      };
    }

    if (!db.progress) {
      db.progress = {} as any;
    }

    const periods: PeriodType[] = ['30s', '1m', '3m', '5m'];
    periods.forEach((p) => {
      const live = calculateLivePeriodInfo(p);
      db.progress[p] = {
        currentSeq: live.roundSeq,
        roundStartTime: live.roundStartTime,
      };

      db.history[p] = db.history[p] || [];
      // Re-generate existing history to guarantee adherence to 1000-item sequence
      db.history[p] = db.history[p].map((r) => generateRoundResult(p, r.roundId, r.timestamp));

      // Fill in past completed rounds up to live sequence
      for (let i = 1; i <= 50; i++) {
        const pastElapsed = live.totalRoundsElapsed - i;
        if (pastElapsed >= 0) {
          const pastSeq = (pastElapsed % 1000) + 1;
          const rId = formatPeriodId(p, pastSeq);
          const roundTime = PERIOD_ANCHORS[p] + pastElapsed * live.durationSeconds;
          if (!db.history[p].some((r) => r.roundId === rId && Math.abs(r.timestamp - roundTime) < live.durationSeconds)) {
            db.history[p].push(generateRoundResult(p, rId, roundTime));
          }
        }
      }
      db.history[p].sort((a, b) => b.timestamp - a.timestamp);
    });

    saveDB();
  } else {
    db = createInitialStore();
    saveDB();
  }
} catch (err) {
  console.error('Error loading store, creating fallback:', err);
  db = createInitialStore();
  saveDB();
}

function saveDB() {
  try {
    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DATA_FILE);
  } catch {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }
}

// Helpers for period calculation
function getPeriodInfo(period: PeriodType) {
  const live = calculateLivePeriodInfo(period);
  return {
    period,
    roundId: live.roundId,
    roundSeq: live.roundSeq,
    timeRemaining: live.timeRemaining,
    durationSeconds: live.durationSeconds,
    isBettingLocked: live.isBettingLocked,
    roundStartTime: live.roundStartTime,
    timestamp: live.timestamp,
  };
}

function settleCompletedRounds() {
  const now = Math.floor(Date.now() / 1000);
  const periods: PeriodType[] = ['30s', '1m', '3m', '5m'];
  let changes = false;

  periods.forEach((p) => {
    const live = calculateLivePeriodInfo(p, now);
    const duration = live.durationSeconds;

    if (!db.progress) {
      db.progress = {} as any;
    }
    db.progress[p] = {
      currentSeq: live.roundSeq,
      roundStartTime: live.roundStartTime,
    };

    db.history[p] = db.history[p] || [];

    // Ensure the last 50 completed rounds are populated in db.history[p]
    for (let i = 1; i <= 50; i++) {
      const pastElapsed = live.totalRoundsElapsed - i;
      if (pastElapsed < 0) break;
      const pastSeq = (pastElapsed % 1000) + 1;
      const rId = formatPeriodId(p, pastSeq);
      const roundTime = PERIOD_ANCHORS[p] + pastElapsed * duration;
      if (!db.history[p].some((r) => r.roundId === rId && Math.abs(r.timestamp - roundTime) < duration)) {
        db.history[p].push(generateRoundResult(p, rId, roundTime));
        changes = true;
      }
    }

    // Sort descending by round timestamp (most recent first)
    db.history[p].sort((a, b) => b.timestamp - a.timestamp);

    if (db.history[p].length > 250) {
      db.history[p] = db.history[p].slice(0, 250);
      changes = true;
    }
  });

  // Settle any pending bets whose round has completed
  const pendingBets = db.bets.filter((b) => b.status === 'pending');
  pendingBets.forEach((b) => {
    const live = calculateLivePeriodInfo(b.period, now);
    const duration = PERIOD_CONFIGS[b.period].durationSeconds;
    const isCompleted = b.roundId !== live.roundId || now >= b.createdAt + duration;
    if (isCompleted) {
      // Completed round: find round result in history, or generate it
      let result = (db.history[b.period] || []).find((r) => r.roundId === b.roundId);
      if (!result) {
        const betSeq = getRoundSeqFromRoundId(b.roundId);
        const roundTime = b.createdAt;
        result = generateRoundResult(b.period, b.roundId, roundTime);
      }

      const evalResult = evaluateBet(b, result.number);
      b.status = evalResult.status;
      b.payout = evalResult.payout;
      b.profit = evalResult.profit;
      b.settledAt = result.timestamp || now;
      b.resultNumber = result.number;
      b.resultColors = result.colors;
      b.resultSize = result.size;

      const user = db.users[b.userId];
      if (user && evalResult.status === 'won') {
        user.balance = Math.round((user.balance + evalResult.payout) * 100) / 100;
        user.totalWon = Math.round((user.totalWon + evalResult.profit) * 100) / 100;
      }
      changes = true;
    }
  });

  if (changes) {
    saveDB();
  }
}

// Tick round processor every second
setInterval(settleCompletedRounds, 1000);

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- AUTHENTICATION ROUTES ---

  // API: Login
  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.accounts = db.accounts || {};
    let account = db.accounts[cleanPhone];

    // Check if matching default demo user
    if (!account && cleanPhone === '9876543210') {
      account = {
        userId: DEFAULT_USER_ID,
        phone: '9876543210',
        passwordHash: 'password123',
        createdAt: Math.floor(Date.now() / 1000),
      };
      db.accounts[cleanPhone] = account;
      saveDB();
    }

    if (!account) {
      return res.status(404).json({ error: 'Mobile number not registered. Please create an account.' });
    }

    if (account.passwordHash !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    let user = db.users[account.userId];
    if (!user) {
      user = {
        id: account.userId,
        username: `Member_${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        balance: 10.0,
        vipLevel: 1,
        totalWon: 0,
        totalBets: 0,
      };
      db.users[account.userId] = user;
      saveDB();
    }

    res.json({
      success: true,
      user,
      token: `token_${cleanPhone}_${Date.now()}`,
      message: 'Welcome back to 13 CLUB!',
    });
  });

  // API: Register
  app.post('/api/auth/register', (req, res) => {
    const { phone, password, inviteCode } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.accounts = db.accounts || {};
    if (db.accounts[cleanPhone]) {
      return res.status(400).json({ error: 'This mobile number is already registered. Please login.' });
    }

    const userId = `user_${cleanPhone}_${Date.now().toString(36)}`;
    const newUser: UserProfile = {
      id: userId,
      username: `Member_${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      balance: 10.0,
      vipLevel: 1,
      totalWon: 0,
      totalBets: 0,
    };

    db.users[userId] = newUser;
    db.accounts[cleanPhone] = {
      userId,
      phone: cleanPhone,
      passwordHash: password,
      createdAt: Math.floor(Date.now() / 1000),
    };
    saveDB();

    res.json({
      success: true,
      user: newUser,
      token: `token_${cleanPhone}_${Date.now()}`,
      message: 'Account created successfully! Welcome bonus ₹10 added.',
    });
  });

  // API: Forgot Password
  app.post('/api/auth/forgot-password', (req, res) => {
    const { phone, newPassword, otp } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    if (!otp || String(otp).trim().length < 4) {
      return res.status(400).json({ error: 'Please enter the 4-digit verification code' });
    }

    db.accounts = db.accounts || {};
    let account = db.accounts[cleanPhone];
    if (!account && cleanPhone === '9876543210') {
      account = {
        userId: DEFAULT_USER_ID,
        phone: cleanPhone,
        passwordHash: newPassword,
        createdAt: Math.floor(Date.now() / 1000),
      };
      db.accounts[cleanPhone] = account;
    }

    if (!account) {
      return res.status(404).json({ error: 'No account registered with this mobile number.' });
    }

    account.passwordHash = newPassword;
    saveDB();

    res.json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.',
    });
  });

  // API: Send OTP simulation
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }
    res.json({
      success: true,
      otp: '8892',
      message: `Verification code 8892 sent to +91 ******${cleanPhone.slice(-4)}`,
    });
  });

  // API: Guest Login
  app.post('/api/auth/guest', (req, res) => {
    const guestId = `guest_${Math.random().toString(36).substring(2, 7)}`;
    const guestUser: UserProfile = {
      id: guestId,
      username: `Guest_${guestId.slice(-4)}`,
      balance: 10.0,
      vipLevel: 1,
      totalWon: 0,
      totalBets: 0,
      isGuest: true,
    };
    db.users[guestId] = guestUser;
    saveDB();

    res.json({
      success: true,
      user: guestUser,
      token: `token_${guestId}`,
      message: 'Guest session started with welcome bonus ₹10.',
    });
  });

  // API: Get complete game state
  app.get('/api/wingo/status', (req, res) => {
    settleCompletedRounds();
    const now = Math.floor(Date.now() / 1000);
    const requestedId = (req.query.userId as string) || '';
    let user = requestedId ? db.users[requestedId] : null;

    if (!user && requestedId) {
      const matchedAccount = Object.values(db.accounts || {}).find((a) => a.userId === requestedId);
      if (matchedAccount) {
        user = {
          id: matchedAccount.userId,
          username: `Member_${matchedAccount.phone.slice(-4)}`,
          phone: matchedAccount.phone,
          balance: 10.0,
          vipLevel: 1,
          totalWon: 0,
          totalBets: 0,
        };
        db.users[matchedAccount.userId] = user;
        saveDB();
      }
    }

    const periodsData: Record<string, any> = {};
    const periods: PeriodType[] = ['30s', '1m', '3m', '5m'];

    periods.forEach((p) => {
      const info = getPeriodInfo(p);
      const recentHistory = db.history[p].slice(0, 10);
      const lastResult = db.history[p][0];
      periodsData[p] = {
        ...info,
        recentHistory,
        lastResult,
      };
    });

    res.json({
      serverTime: now,
      periods: periodsData,
      user,
    });
  });

  // API: History with pagination
  app.get('/api/wingo/history', (req, res) => {
    const period = ((req.query.period as string) || '1m') as PeriodType;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const list = db.history[period] || [];
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    // Color and size stats over last 100
    const sample = list.slice(0, 100);
    const stats = {
      greenCount: sample.filter((r) => r.colors.includes('green')).length,
      redCount: sample.filter((r) => r.colors.includes('red')).length,
      violetCount: sample.filter((r) => r.colors.includes('violet')).length,
      bigCount: sample.filter((r) => r.size === 'big').length,
      smallCount: sample.filter((r) => r.size === 'small').length,
      numberCounts: Array.from({ length: 10 }, (_, i) => sample.filter((r) => r.number === i).length),
    };

    res.json({
      period,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      history: paginated,
      stats,
    });
  });

  // API: Place Bet
  app.post('/api/wingo/bet', (req, res) => {
    const { userId, period, category, selection, baseAmount, quantity } = req.body;
    const activeUserId = userId || DEFAULT_USER_ID;
    const user = db.users[activeUserId];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!PERIOD_CONFIGS[period as PeriodType]) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    const currentInfo = getPeriodInfo(period as PeriodType);
    if (currentInfo.isBettingLocked) {
      return res.status(400).json({ error: 'Betting is locked for this round (last 5 seconds)' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const base = parseFloat(baseAmount) || 1;
    const totalAmount = Math.round(base * qty * 100) / 100;

    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    if (user.balance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance = Math.round((user.balance - totalAmount) * 100) / 100;
    user.totalBets += 1;

    // Delivery fee is standard 2%
    const deliveryFee = Math.round(totalAmount * 0.02 * 100) / 100;
    const contractAmount = Math.round((totalAmount - deliveryFee) * 100) / 100;

    const newBet: UserBet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: activeUserId,
      period: period as PeriodType,
      roundId: currentInfo.roundId,
      category,
      selection,
      baseAmount: base,
      quantity: qty,
      totalAmount,
      deliveryFee,
      contractAmount,
      status: 'pending',
      payout: 0,
      profit: 0,
      createdAt: Math.floor(Date.now() / 1000),
    };

    db.bets.unshift(newBet);
    saveDB();

    res.json({
      success: true,
      bet: newBet,
      balance: user.balance,
      message: 'Bet placed successfully!',
    });
  });

  // API: Get user bets
  app.get('/api/wingo/my-bets', (req, res) => {
    settleCompletedRounds();
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      return res.json({
        bets: [],
        total: 0,
        page: 1,
        totalPages: 1,
      });
    }
    const period = req.query.period as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    let userBets = db.bets.filter((b) => b.userId === userId);
    if (period && period !== 'all') {
      userBets = userBets.filter((b) => b.period === period);
    }

    const total = userBets.length;
    const paginated = userBets.slice((page - 1) * limit, page * limit);

    res.json({
      bets: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  });

  // =========================================================================
  // DEPOSIT & WITHDRAWAL APPROVAL SYSTEM + ADMIN DASHBOARD APIS
  // =========================================================================

  const ADMIN_ID = 'cat';
  const ADMIN_PASS = '1111';
  const ADMIN_TOKEN = '13club_admin_session_auth_token_secret_cat_1111';

  const verifyAdminAuth = (req: express.Request): boolean => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.headers['x-admin-token'];
    return token === ADMIN_TOKEN;
  };

  // API: Submit Deposit Request (Minimum ₹100, requires UTR, pending admin approval)
  app.post('/api/transactions/deposit', (req, res) => {
    const { userId, amount, utr } = req.body;
    const activeUserId = userId || DEFAULT_USER_ID;
    const user = db.users[activeUserId];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const depositAmount = parseFloat(amount);
    if (!depositAmount || isNaN(depositAmount) || depositAmount < 100) {
      return res.status(400).json({ error: 'Minimum deposit amount is ₹100' });
    }

    const cleanUtr = String(utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      return res.status(400).json({ error: 'Please enter a valid UTR / Transaction ID (min 6 characters)' });
    }

    // Check for duplicate UTR submissions
    db.transactions = db.transactions || [];
    const duplicate = db.transactions.some(
      (t) => t.type === 'deposit' && t.utr && t.utr.toLowerCase() === cleanUtr.toLowerCase() && t.status !== 'rejected'
    );
    if (duplicate) {
      return res.status(400).json({
        error: 'This UTR / Transaction ID has already been submitted and is currently pending or approved.',
      });
    }

    const newTx: TransactionRequest = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: activeUserId,
      username: user.username,
      phone: user.phone || '9876543210',
      type: 'deposit',
      amount: Math.round(depositAmount * 100) / 100,
      utr: cleanUtr,
      status: 'pending',
      createdAt: Math.floor(Date.now() / 1000),
    };

    db.transactions.unshift(newTx);
    saveDB();

    res.json({
      success: true,
      transaction: newTx,
      message: `Deposit request for ₹${depositAmount.toLocaleString('en-IN')} submitted! Pending Admin verification.`,
    });
  });

  // API: Submit Withdrawal Request (requires UPI ID, balance check, amount reserved pending approval)
  app.post('/api/transactions/withdraw', (req, res) => {
    const { userId, amount, upiId } = req.body;
    const activeUserId = userId || DEFAULT_USER_ID;
    const user = db.users[activeUserId];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100' });
    }

    const cleanUpi = String(upiId || '').trim();
    if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.length < 5) {
      return res.status(400).json({ error: 'Please enter a valid UPI ID (e.g. mobile@upi, name@okaxis)' });
    }

    if (withdrawAmount > user.balance) {
      return res.status(400).json({ error: 'Withdrawal amount exceeds your available balance' });
    }

    // Immediately reserve / deduct balance from user's wallet
    user.balance = Math.round((user.balance - withdrawAmount) * 100) / 100;

    const newTx: TransactionRequest = {
      id: `wth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: activeUserId,
      username: user.username,
      phone: user.phone || '9876543210',
      type: 'withdrawal',
      amount: Math.round(withdrawAmount * 100) / 100,
      upiId: cleanUpi,
      status: 'pending',
      createdAt: Math.floor(Date.now() / 1000),
    };

    db.transactions = db.transactions || [];
    db.transactions.unshift(newTx);
    saveDB();

    res.json({
      success: true,
      transaction: newTx,
      balance: user.balance,
      message: `Withdrawal request for ₹${withdrawAmount.toLocaleString('en-IN')} submitted! Funds reserved pending Admin approval.`,
    });
  });

  // API: Get User's Transaction History
  app.get('/api/transactions/my', (req, res) => {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;
    const type = req.query.type as string;
    let list = (db.transactions || []).filter((t) => t.userId === userId);
    if (type && type !== 'all') {
      list = list.filter((t) => t.type === type);
    }
    res.json({ transactions: list });
  });

  // API: Admin Authentication (Admin ID: cat, Password: 1111)
  app.post('/api/admin/login', (req, res) => {
    const { adminId, password } = req.body;
    if (adminId === ADMIN_ID && password === ADMIN_PASS) {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        admin: {
          id: ADMIN_ID,
          name: '13 CLUB Super Admin',
          role: 'admin',
        },
        message: 'Admin access authorized.',
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid Admin ID or Password.' });
  });

  // API: Admin Get All Transactions with Filters & Live Stats
  app.get('/api/admin/transactions', (req, res) => {
    if (!verifyAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }

    const type = req.query.type as string;
    const status = req.query.status as string;
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    const allTx = db.transactions || [];

    const stats: AdminStats = {
      pendingDepositsCount: allTx.filter((t) => t.type === 'deposit' && t.status === 'pending').length,
      pendingDepositsAmount: allTx
        .filter((t) => t.type === 'deposit' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      pendingWithdrawalsCount: allTx.filter((t) => t.type === 'withdrawal' && t.status === 'pending').length,
      pendingWithdrawalsAmount: allTx
        .filter((t) => t.type === 'withdrawal' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      approvedDepositsAmount: allTx
        .filter((t) => t.type === 'deposit' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0),
      approvedWithdrawalsAmount: allTx
        .filter((t) => t.type === 'withdrawal' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0),
      totalUsersCount: Object.keys(db.users).length,
    };

    let list = [...allTx];
    if (type && type !== 'all') {
      list = list.filter((t) => t.type === type);
    }
    if (status && status !== 'all') {
      list = list.filter((t) => t.status === status);
    }
    if (search) {
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(search) ||
          t.username.toLowerCase().includes(search) ||
          t.phone.toLowerCase().includes(search) ||
          (t.utr && t.utr.toLowerCase().includes(search)) ||
          (t.upiId && t.upiId.toLowerCase().includes(search))
      );
    }

    res.json({
      transactions: list,
      stats,
    });
  });

  // API: Admin Approve or Reject Transaction
  app.post('/api/admin/transactions/:id/review', (req, res) => {
    if (!verifyAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access' });
    }

    const { id } = req.params;
    const { action, adminNote } = req.body;

    db.transactions = db.transactions || [];
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction record not found' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ error: `Transaction is already ${tx.status}` });
    }

    const targetUser = db.users[tx.userId];

    if (action === 'approve') {
      tx.status = 'approved';
      tx.reviewedAt = Math.floor(Date.now() / 1000);
      tx.adminNote = adminNote || 'Approved by Admin';

      if (tx.type === 'deposit') {
        // Credit funds to user's wallet now
        if (targetUser) {
          targetUser.balance = Math.round((targetUser.balance + tx.amount) * 100) / 100;
        } else {
          const matchedAcc = Object.values(db.accounts || {}).find((a) => a.userId === tx.userId);
          const newUser: UserProfile = {
            id: tx.userId,
            username: tx.username || (matchedAcc ? `Member_${matchedAcc.phone.slice(-4)}` : 'Member'),
            phone: tx.phone || matchedAcc?.phone || '9876543210',
            balance: Math.round((10.0 + tx.amount) * 100) / 100,
            vipLevel: 1,
            totalWon: 0,
            totalBets: 0,
          };
          db.users[tx.userId] = newUser;
        }
      }
      // For withdrawal, funds were already reserved from user balance
    } else if (action === 'reject') {
      tx.status = 'rejected';
      tx.reviewedAt = Math.floor(Date.now() / 1000);
      tx.adminNote = adminNote || 'Rejected by Admin';

      if (tx.type === 'withdrawal') {
        // Refund reserved funds back to user's wallet
        if (targetUser) {
          targetUser.balance = Math.round((targetUser.balance + tx.amount) * 100) / 100;
        }
      }
      // For deposit, funds were never credited
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
    }

    saveDB();

    res.json({
      success: true,
      transaction: tx,
      userBalance: targetUser?.balance,
      message: `Transaction ${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`,
    });
  });

  // Fallback demo endpoints for instant testing if needed
  app.post('/api/wingo/wallet/recharge', (req, res) => {
    const { userId, amount } = req.body;
    const activeUserId = userId || DEFAULT_USER_ID;
    const user = db.users[activeUserId];
    if (!user) return res.status(404).json({ error: 'User not found' });
    const addAmount = Math.max(100, parseFloat(amount) || 1000);
    user.balance = Math.round((user.balance + addAmount) * 100) / 100;
    saveDB();
    res.json({ success: true, balance: user.balance });
  });

  app.post('/api/wingo/wallet/withdraw', (req, res) => {
    const { userId, amount } = req.body;
    const activeUserId = userId || DEFAULT_USER_ID;
    const user = db.users[activeUserId];
    if (!user) return res.status(404).json({ error: 'User not found' });
    const wAmount = parseFloat(amount) || 0;
    if (wAmount > user.balance) return res.status(400).json({ error: 'Insufficient balance' });
    user.balance = Math.round((user.balance - wAmount) * 100) / 100;
    saveDB();
    res.json({ success: true, balance: user.balance });
  });

  // Dev server or static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`13 CLUB server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
