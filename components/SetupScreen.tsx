'use client';

import { useState } from 'react';
import { HAND_CAP, maxCardsForPlayerCount } from '@/lib/spadesRules';

interface Props {
  onContinue: () => void;
}

export default function SetupScreen({ onContinue }: Props) {
  const [count, setCount] = useState(4);
  const maxCards = maxCardsForPlayerCount(count);
  const capped = maxCards < HAND_CAP;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-8 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in mt-8">
        <h1 className="text-4xl font-extrabold text-felt dark:text-gold">♠ Spades</h1>
        <p className="mt-2 opacity-70">Up-and-down scorekeeper</p>
      </div>

      <div className="w-full flex flex-col items-center gap-4 rounded-2xl bg-card shadow p-6">
        <p className="font-bold text-lg">How many players?</p>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCount((c) => Math.max(2, c - 1))}
            aria-label="Fewer players"
            className="w-14 h-14 rounded-full bg-felt text-white text-2xl font-bold shadow active:scale-95 transition-transform"
          >
            −
          </button>
          <span className="text-5xl font-extrabold w-16 text-center tabular-nums">{count}</span>
          <button
            onClick={() => setCount((c) => Math.min(12, c + 1))}
            aria-label="More players"
            className="w-14 h-14 rounded-full bg-felt text-white text-2xl font-bold shadow active:scale-95 transition-transform"
          >
            +
          </button>
        </div>

        <p className="text-sm text-center opacity-70 min-h-10">
          {capped ? (
            <>
              With {count} players, you can only go up to <strong>{maxCards} cards</strong> per hand instead of the
              usual 10 — not enough deck to go around.
            </>
          ) : (
            <>Standard game: up to 10 cards per hand.</>
          )}
        </p>
      </div>

      <p className="text-xs opacity-40 text-center">
        This is just a heads up — you&apos;ll add everyone&apos;s actual name next, and the real cap is based on
        whoever&apos;s actually playing.
      </p>

      <button
        onClick={onContinue}
        className="mt-auto w-full rounded-2xl bg-felt text-white font-extrabold text-2xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Continue →
      </button>
    </div>
  );
}
