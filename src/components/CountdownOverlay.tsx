import React, { useEffect, useRef, useState } from 'react';
import { Lock, Sparkles, Loader2 } from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { RoundResult } from '../types.ts';
import { Ball } from './Ball.tsx';

interface CountdownOverlayProps {
  timeRemaining: number;
  lastSettledResult?: RoundResult;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  timeRemaining,
  lastSettledResult,
}) => {
  const prevTimeRef = useRef<number>(timeRemaining);
  const [spinningNum, setSpinningNum] = useState<number>(0);

  // Fast tumbler animation when time hits 0
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timeRemaining <= 0) {
      interval = setInterval(() => {
        setSpinningNum((prev) => (prev + 1) % 10);
      }, 80);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining >= 1 && timeRemaining !== prevTimeRef.current) {
      sound.playCountdownTick(timeRemaining);
      prevTimeRef.current = timeRemaining;
    }
  }, [timeRemaining]);

  if (timeRemaining > 5) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-2xl select-none border border-red-500/40 overflow-hidden animate-in fade-in duration-150">
      {/* Background glow pulse */}
      <div className="absolute w-48 h-48 rounded-full bg-red-600/25 blur-3xl animate-pulse pointer-events-none" />

      {timeRemaining > 0 ? (
        <>
          {/* Lock icon */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>BETTING LOCKED</span>
          </div>

          <div className="text-[11px] text-slate-400 mb-2 font-medium">Drawing round outcome in</div>

          {/* Giant Animated Number */}
          <div className="relative">
            <span
              key={timeRemaining}
              className="text-8xl font-black font-rajdhani text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-bounce inline-block"
            >
              {timeRemaining}
            </span>
          </div>
        </>
      ) : (
        /* Drawing / Revealing animation */
        <div className="flex flex-col items-center justify-center space-y-3 p-4 text-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>DRAWING WINNING NUMBER...</span>
          </div>

          <div className="my-2 scale-125 transition-transform">
            <Ball number={spinningNum} size="lg" />
          </div>

          <div className="text-xs text-slate-300 font-mono">
            Synchronizing results automatically...
          </div>
        </div>
      )}
    </div>
  );
};
