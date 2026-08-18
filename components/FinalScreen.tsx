'use client';

import type { Player } from '@/lib/types';
import { rankPlayers } from '@/lib/spadesRules';
import StandingsList from './StandingsList';

interface Props {
  players: Player[];
  onPlayAgain: () => void;
  onNewPlayers: () => void;
}

export default function FinalScreen({ players, onPlayAgain, onNewPlayers }: Props) {
  const standings = rankPlayers(players);
  const winners = standings.filter((s) => s.rank === 1).map((s) => s.player.name);
  const winnerText =
    winners.length === 1 ? `${winners[0]} wins!` : `${winners.slice(0, -1).join(', ')} & ${winners[winners.length - 1]} tie for the win!`;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in mt-4">
        <p className="text-5xl mb-2">🏆</p>
        <h2 className="text-3xl font-extrabold">{winnerText}</h2>
      </div>

      <div className="w-full">
        <StandingsList players={players} />
      </div>

      <div className="mt-auto w-full flex flex-col gap-3">
        <button
          onClick={onPlayAgain}
          className="w-full rounded-2xl bg-felt text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          Play Again (same players)
        </button>
        <button onClick={onNewPlayers} className="text-sm opacity-50 underline py-2">
          New players
        </button>
      </div>
    </div>
  );
}
