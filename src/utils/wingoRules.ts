import { ColorType, SizeType, RoundResult, UserBet, PeriodType, PERIOD_CONFIGS } from '../types.ts';

/**
 * Standard Wingo number to colors mapping:
 * 0: Red + Violet
 * 1: Green
 * 2: Red
 * 3: Green
 * 4: Red
 * 5: Green + Violet
 * 6: Red
 * 7: Green
 * 8: Red
 * 9: Green
 */
export function getColorsForNumber(num: number): ColorType[] {
  if (num === 0) return ['red', 'violet'];
  if (num === 5) return ['green', 'violet'];
  if (num % 2 === 1) return ['green'];
  return ['red'];
}

/**
 * Big: 5 - 9
 * Small: 0 - 4
 */
export function getSizeForNumber(num: number): SizeType {
  return num >= 5 ? 'big' : 'small';
}

/**
 * Calculate payout for a bet against a round result
 */
export function evaluateBet(bet: UserBet, winningNumber: number): {
  status: 'won' | 'lost';
  payout: number;
  profit: number;
} {
  const contract = bet.contractAmount;
  const colors = getColorsForNumber(winningNumber);
  const size = getSizeForNumber(winningNumber);

  let won = false;
  let payout = 0;

  if (bet.category === 'number') {
    const selectedNum = parseInt(bet.selection, 10);
    if (selectedNum === winningNumber) {
      won = true;
      payout = contract * 9;
    }
  } else if (bet.category === 'color') {
    if (bet.selection === 'green') {
      if (winningNumber === 5) {
        won = true;
        payout = contract * 1.5;
      } else if (colors.includes('green')) {
        won = true;
        payout = contract * 2;
      }
    } else if (bet.selection === 'red') {
      if (winningNumber === 0) {
        won = true;
        payout = contract * 1.5;
      } else if (colors.includes('red')) {
        won = true;
        payout = contract * 2;
      }
    } else if (bet.selection === 'violet') {
      if (colors.includes('violet')) {
        won = true;
        payout = contract * 4.5;
      }
    }
  } else if (bet.category === 'size') {
    if (bet.selection === size) {
      won = true;
      payout = contract * 2;
    }
  }

  // Round payout to 2 decimals
  const finalPayout = won ? Math.round(payout * 100) / 100 : 0;
  const profit = won ? Math.round((finalPayout - bet.totalAmount) * 100) / 100 : -bet.totalAmount;

  return {
    status: won ? 'won' : 'lost',
    payout: finalPayout,
    profit,
  };
}

/**
 * Predefined 15-item repeating cycle matching the 1000-item sequence starting at 20261104000001
 * 1. BIG
 * 2. SMALL
 * 3. SMALL
 * 4. BIG
 * 5. SMALL
 * 6. BIG
 * 7. SMALL
 * 8. SMALL
 * 9. BIG
 * 10. BIG
 * 11. BIG
 * 12. BIG
 * 13. BIG
 * 14. SMALL
 * 15. BIG
 */
export const WINGO_SEQUENCE_CYCLE: SizeType[] = [
  'big',   // 1
  'small', // 2
  'small', // 3
  'big',   // 4
  'small', // 5
  'big',   // 6
  'small', // 7
  'small', // 8
  'big',   // 9
  'big',   // 10
  'big',   // 11
  'big',   // 12
  'big',   // 13
  'small', // 14
  'big',   // 15
];

/**
 * Returns the exact predefined Big or Small size for any round sequence number (1-indexed)
 */
export function getPredefinedSizeForRound(roundSeq: number): SizeType {
  const normalizedIndex = ((roundSeq - 1) % 15 + 15) % 15;
  return WINGO_SEQUENCE_CYCLE[normalizedIndex];
}

/**
 * Extracts sequence number from round ID (e.g. 20261104000001 -> 1)
 */
export function getRoundSeqFromRoundId(roundId: string): number {
  const match = roundId.match(/(\d{8})(\d{2})(\d+)$/);
  if (match) {
    return parseInt(match[3], 10);
  }
  const digits = roundId.match(/\d+/g);
  if (digits && digits.length > 0) {
    const lastDigits = digits[digits.length - 1];
    return parseInt(lastDigits.slice(-4), 10) || 1;
  }
  return 1;
}

/**
 * Generates deterministic round result.
 * Wingo 30s strictly follows the user-provided 1000 Period Sequence Sheet.
 * Wingo 1m, 3m, 5m are purely random provably-fair numbers (0 to 9).
 */
export function generateRoundResult(period: string, roundId: string, timestamp: number): RoundResult {
  // Simple deterministic hash for fairness & synchronization across all players
  let hashVal = 0;
  const str = `${period}:${roundId}:${timestamp}:13CLUB_WINGO_2026`;
  for (let i = 0; i < str.length; i++) {
    hashVal = (hashVal << 5) - hashVal + str.charCodeAt(i);
    hashVal |= 0;
  }
  const positiveHash = Math.abs(hashVal);

  let number: number;
  let size: SizeType;

  if (period === '30s') {
    // Wingo 30 Seconds strictly follows the 1000 Period Sequence Sheet
    const roundSeq = getRoundSeqFromRoundId(roundId);
    const targetSize = getPredefinedSizeForRound(roundSeq);

    // Big: 5, 6, 7, 8, 9
    // Small: 0, 1, 2, 3, 4
    if (targetSize === 'big') {
      number = 5 + (positiveHash % 5); // strictly 5 to 9
    } else {
      number = positiveHash % 5; // strictly 0 to 4
    }
    size = targetSize;
  } else {
    // Wingo 1m, 3m, and 5m generate purely random numbers (0 to 9)
    number = positiveHash % 10;
    size = getSizeForNumber(number);
  }

  const colors = getColorsForNumber(number);
  const hexHash = positiveHash.toString(16).padStart(8, '0');

  return {
    period: period as any,
    roundId,
    number,
    colors,
    size,
    timestamp,
    hash: `0x${hexHash}`,
  };
}

/**
 * Fixed epoch anchor timestamps for each period.
 * These anchor each period's round progression to an absolute, unshifting, monotonic timeline.
 * The period number can NEVER reset on refresh, window close, or server reboot.
 */
export const PERIOD_ANCHORS: Record<PeriodType, number> = {
  '30s': 1793778324,
  '1m': 1793778324,
  '3m': 1793778084,
  '5m': 1793777904,
};

/**
 * Standard formatted round ID (e.g. 20261104000135)
 */
export function formatPeriodId(period: PeriodType, seq: number): string {
  const config = PERIOD_CONFIGS[period];
  return `20261104${config.periodCode}${String(seq).padStart(4, '0')}`;
}

/**
 * Calculate live period info deterministically from clock
 */
export function calculateLivePeriodInfo(period: PeriodType, targetTimestamp?: number) {
  const now = targetTimestamp ?? Math.floor(Date.now() / 1000);
  const config = PERIOD_CONFIGS[period];
  const anchor = PERIOD_ANCHORS[period];
  const duration = config.durationSeconds;

  const elapsed = Math.max(0, now - anchor);
  const totalRoundsElapsed = Math.floor(elapsed / duration);

  // Maximum rounds in sequence (1,000 rounds).
  // Once all 1,000 rounds are completed in Wingo 30 Seconds,
  // the sequence automatically restarts from Round 1.
  const MAX_ROUNDS = 1000;
  const roundSeq = (totalRoundsElapsed % MAX_ROUNDS) + 1;
  const roundStartTime = anchor + totalRoundsElapsed * duration;
  const timeRemaining = Math.max(0, duration - (now - roundStartTime));
  const isBettingLocked = timeRemaining <= 5;
  const roundId = formatPeriodId(period, roundSeq);

  return {
    period,
    roundId,
    roundSeq,
    timeRemaining,
    durationSeconds: duration,
    isBettingLocked,
    roundStartTime,
    timestamp: now,
    totalRoundsElapsed,
  };
}

