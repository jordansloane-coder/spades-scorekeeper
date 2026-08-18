import type { Player } from '@/lib/types';
import { rankPlayers } from '@/lib/spadesRules';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface Props {
  players: Player[];
}

export default function StandingsList({ players }: Props) {
  const standings = rankPlayers(players);

  return (
    <div className="w-full flex flex-col gap-2">
      {standings.map(({ player, rank }) => (
        <div
          key={player.id}
          className="flex items-center justify-between rounded-2xl bg-card shadow px-4 py-3 animate-pop-in"
        >
          <span className="flex items-center gap-2.5 font-bold text-lg">
            <span className="w-7 text-center opacity-60">{MEDALS[rank] ?? rank}</span>
            {player.name}
          </span>
          <span className="text-xl font-extrabold tabular-nums">{player.totalScore}</span>
        </div>
      ))}
    </div>
  );
}
