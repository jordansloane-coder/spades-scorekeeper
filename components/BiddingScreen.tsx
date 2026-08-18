'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';
import { bidBalance } from '@/lib/spadesRules';

interface Props {
  players: Player[];
  dealer: Player;
  roundNumber: number;
  totalRounds: number;
  cardsInHand: number;
  onSubmit: (bids: Record<string, number>) => void;
}

export default function BiddingScreen({ players, dealer, roundNumber, totalRounds, cardsInHand, onSubmit }: Props) {
  const [bids, setBids] = useState<Record<string, number>>(() => Object.fromEntries(players.map((p) => [p.id, 0])));

  // Computes the new value from the updater's own `prev`, not from `bids` in
  // this render's closure — two taps landing before a re-render (fast
  // double-tap, programmatic clicks) would otherwise both read the same
  // stale value and the second tap's effect would be lost.
  function adjustBid(id: string, delta: number) {
    setBids((prev) => {
      const next = Math.max(0, Math.min(cardsInHand, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
  }

  const balance = bidBalance(bids, cardsInHand);

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-sm font-bold uppercase tracking-wide opacity-50">
          Round {roundNumber} of {totalRounds}
        </p>
        <h2 className="text-2xl font-extrabold mt-1">{cardsInHand} card{cardsInHand === 1 ? '' : 's'} this hand</h2>
        <p className="mt-1 opacity-70">
          <strong>{dealer.name}</strong> deals
        </p>
      </div>

      <p className="text-sm opacity-60 text-center">Go around the table and enter everyone&apos;s bid.</p>

      <div className="w-full flex flex-col gap-3">
        {players.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-2xl bg-card shadow p-4">
            <span className="font-bold text-lg">
              {p.name}
              {p.id === dealer.id && <span className="ml-1.5 text-xs opacity-50 font-normal">(dealer)</span>}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustBid(p.id, -1)}
                aria-label={`Decrease ${p.name}'s bid`}
                className="w-10 h-10 rounded-full bg-felt/10 text-felt dark:text-gold font-bold text-xl active:scale-95 transition-transform"
              >
                −
              </button>
              <span className="text-2xl font-extrabold w-8 text-center tabular-nums">{bids[p.id] ?? 0}</span>
              <button
                onClick={() => adjustBid(p.id, 1)}
                aria-label={`Increase ${p.name}'s bid`}
                className="w-10 h-10 rounded-full bg-felt/10 text-felt dark:text-gold font-bold text-xl active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <p
        className={`w-full text-center text-sm font-semibold rounded-xl py-3 px-4 ${
          balance > 0
            ? 'text-danger bg-danger/10'
            : balance < 0
              ? 'text-felt dark:text-gold bg-felt/10'
              : 'opacity-50'
        }`}
      >
        {balance > 0
          ? `Overbid by ${balance} — somebody's not making it this hand.`
          : balance < 0
            ? `Underbid by ${Math.abs(balance)} — tricks are up for grabs.`
            : 'Bids match the cards exactly.'}
      </p>

      <button
        onClick={() => onSubmit(bids)}
        className="mt-auto w-full rounded-2xl bg-felt text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Bids Locked In →
      </button>
    </div>
  );
}
