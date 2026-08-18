'use client';

import type { Player, RoundRecord } from '@/lib/types';
import StandingsList from './StandingsList';

interface Props {
  players: Player[];
  round: RoundRecord;
  roundNumber: number;
  totalRounds: number;
  onNext: () => void;
}

export default function RoundEndScreen({ players, round, roundNumber, totalRounds, onNext }: Props) {
  const isLastRound = roundNumber >= totalRounds;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-sm font-bold uppercase tracking-wide opacity-50">
          Round {roundNumber} of {totalRounds} done
        </p>
        <h2 className="text-2xl font-extrabold mt-1">Hand results</h2>
      </div>

      <div className="w-full rounded-2xl bg-card shadow p-4 flex flex-col gap-1.5">
        {players.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm py-1">
            <span className="font-semibold">{p.name}</span>
            <span className="opacity-70">
              bid {round.bids[p.id] ?? 0} · won {round.tricksWon[p.id] ?? 0}
              <span className="ml-2 font-extrabold text-felt dark:text-gold">+{round.points[p.id] ?? 0}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="w-full">
        <p className="font-bold text-sm uppercase tracking-wide opacity-50 mb-2">Standings</p>
        <StandingsList players={players} />
      </div>

      <button
        onClick={onNext}
        className="mt-auto w-full rounded-2xl bg-felt text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        {isLastRound ? 'See Final Results →' : 'Next Round →'}
      </button>
    </div>
  );
}
