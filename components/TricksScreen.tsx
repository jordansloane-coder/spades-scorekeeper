'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';

interface Props {
  players: Player[];
  dealer: Player;
  roundNumber: number;
  totalRounds: number;
  cardsInHand: number;
  bids: Record<string, number>;
  onSubmit: (tricks: Record<string, number>) => void;
}

export default function TricksScreen({ players, dealer, roundNumber, totalRounds, cardsInHand, bids, onSubmit }: Props) {
  const [tricks, setTricks] = useState<Record<string, number>>(() => Object.fromEntries(players.map((p) => [p.id, 0])));
  const [error, setError] = useState<string | null>(null);

  // Computes the new value from the updater's own `prev`, not from `tricks`
  // in this render's closure — see the identical note in BiddingScreen.
  function adjustTrick(id: string, delta: number) {
    setTricks((prev) => {
      const next = Math.max(0, Math.min(cardsInHand, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
    setError(null);
  }

  function handleSubmit() {
    const total = Object.values(tricks).reduce((sum, t) => sum + t, 0);
    if (total !== cardsInHand) {
      setError(
        `Tricks won add up to ${total}, but there ${cardsInHand === 1 ? 'was' : 'were'} only ${cardsInHand} card${cardsInHand === 1 ? '' : 's'} this hand. Double-check the numbers.`
      );
      return;
    }
    onSubmit(tricks);
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-sm font-bold uppercase tracking-wide opacity-50">
          Round {roundNumber} of {totalRounds}
        </p>
        <h2 className="text-2xl font-extrabold mt-1">How many tricks did each player win?</h2>
        <p className="mt-1 opacity-70 text-sm">
          {cardsInHand} card{cardsInHand === 1 ? '' : 's'} this hand · <strong>{dealer.name}</strong> dealt
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {players.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-2xl bg-card shadow p-4">
            <span className="font-bold text-lg">
              {p.name}
              <span className="ml-1.5 text-xs opacity-50 font-normal">bid {bids[p.id] ?? 0}</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustTrick(p.id, -1)}
                aria-label={`Decrease ${p.name}'s tricks won`}
                className="w-10 h-10 rounded-full bg-felt/10 text-felt dark:text-gold font-bold text-xl active:scale-95 transition-transform"
              >
                −
              </button>
              <span className="text-2xl font-extrabold w-8 text-center tabular-nums">{tricks[p.id] ?? 0}</span>
              <button
                onClick={() => adjustTrick(p.id, 1)}
                aria-label={`Increase ${p.name}'s tricks won`}
                className="w-10 h-10 rounded-full bg-felt/10 text-felt dark:text-gold font-bold text-xl active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="w-full text-center text-sm font-semibold text-danger bg-danger/10 rounded-xl py-3 px-4 animate-pop-in">
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="mt-auto w-full rounded-2xl bg-felt text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Score This Hand →
      </button>
    </div>
  );
}
